#!/usr/bin/env node
// One foreground validation run: every step in order, full output to a log, ONE line out.
// Fail closed: a step passes only on a found summary with zero failures and exit 0.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { StringDecoder } from 'node:string_decoder';
import { pathToFileURL } from 'node:url';
import { parseFlags } from './git-evidence.mjs';

const PARSERS = ['node', 'jest', 'pytest', 'cargo', 'none'];
const SHELLS = ['pwsh', 'powershell', 'bash'];
const MAX_NAMES = 10;
// setTimeout's ceiling: a longer delay silently becomes 1 ms, which would kill every step.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;
// After a step exits, output pipes still held by a stray descendant stop being read after this.
// The descendant is left running: once the step's own process is gone it cannot be found portably.
const GRACE_MS = 5000;
// CSI, OSC (BEL or ST terminated), nF (e.g. charset selection) and Fe escapes. The escape
// character is written as an escape sequence: a literal ESC byte is an invisible character.
const ANSI = /\u001b(?:\[[0-?]*[ -\/]*[@-~]|\][^\u0007\u001b]*(?:\u0007|\u001b\\)|[ -\/]+[0-~]|[@-Z\\-_])/g;
const SCRIPT_FILE = /\.(?:c|m)?[jt]sx?$/;

const normalize = text => text.replace(ANSI, '').replace(/\r\n?/g, '\n');
const uniq = list => [...new Set(list)];
const slashes = p => p.replace(/[\\/]+/g, '/');
// The name and the location may each be relative or absolute (spec: absolute name, relative location).
const isFileOf = (name, file) => { const n = slashes(name), f = slashes(file); return f === n || f.endsWith('/' + n) || n.endsWith('/' + f); };
const empty = () => ({ summary: false, passed: null, failed: null, total: null, names: [], loadFailures: [] });

// node: spec reporter (`✖ name (1.2ms)`, `ℹ tests N`) or TAP (`not ok N - name`, `# tests N`).
// The summary is the reporter's contiguous block, so a test printing `tests 99` is not one.
function parseNode(text) {
  const lines = text.split('\n'), entries = [];
  let found = 0, passed = 0, failed = 0, total = 0;
  for (const m of text.matchAll(/^(ℹ|#) tests (\d+)\n\1 suites \d+\n\1 pass (\d+)\n\1 fail (\d+)\n\1 cancelled (\d+)\n\1 skipped \d+\n\1 todo \d+$/gm)) {
    found++; total += +m[2]; passed += +m[3]; failed += +m[4] + +m[5];
  }
  // Spec: the trailing "failing tests" block lists each failure once, without the suites the
  // inline tree also marks; outside a block every inline `✖` line is taken.
  const block = [], inline = [];
  let inBlock = false, location = null;
  for (const line of lines) {
    if (line === '✖ failing tests:') { inBlock = true; location = null; continue; }
    if (inBlock && /^[ℹ✔▶﹣]/.test(line)) inBlock = false;
    const at = /^test at (.+):\d+:\d+$/.exec(line);
    if (inBlock && at) { location = at[1]; continue; }
    const m = /^[ \t]*✖ (.+) \(\d+(?:\.\d+)?ms\)$/.exec(line);
    if (!m) continue;
    if (!inBlock) inline.push({ name: m[1], location: null });
    else { block.push({ name: m[1], location }); location = null; }
  }
  entries.push(...(lines.includes('✖ failing tests:') ? block : inline));
  // TAP: skip directives, suites and parents failed only by their subtests.
  for (let i = 0; i < lines.length; i++) {
    const m = /^([ \t]*)not ok \d+ - ((?:\\.|[^\\#])*)(#.*)?$/.exec(lines[i]);
    if (!m || /^# (?:TODO|SKIP)\b/i.test(m[3] || '')) continue;
    let skip = false, tapLocation = null;
    for (let j = i + 1; j < lines.length && lines[j].startsWith(m[1] + '  '); j++) {
      if (/^\s*(?:type: 'suite'|failureType: 'subtestsFailed')$/.test(lines[j])) skip = true;
      const loc = /^\s*location: '(.*):\d+:\d+'$/.exec(lines[j]);
      if (loc) tapLocation = loc[1];
    }
    if (!skip) entries.push({ name: m[2].trimEnd().replace(/\\([\\#])/g, '$1'), location: tapLocation });
  }
  // A file that fails to load is reported as one failing test named after the file.
  const loadFailures = entries.filter(e => e.location ? isFileOf(e.name, e.location) : SCRIPT_FILE.test(e.name)).map(e => e.name);
  return found ? { summary: true, passed, failed, total, names: uniq(entries.map(e => e.name)), loadFailures: uniq(loadFailures) }
    : { ...empty(), names: uniq(entries.map(e => e.name)), loadFailures: uniq(loadFailures) };
}

function parseJest(text) {
  let found = 0, passed = 0, failed = 0, total = 0;
  for (const m of text.matchAll(/^Tests:[ \t]+(?:(.*?),[ \t]+)?(\d+) total$/gm)) {
    const tokens = (m[1] ? m[1].split(/,[ \t]+/) : []).map(t => /^(\d+) (failed|passed|skipped|todo|pending)$/.exec(t));
    if (tokens.some(t => !t)) continue;
    found++; total += +m[2];
    for (const t of tokens) { if (t[2] === 'failed') failed += +t[1]; if (t[2] === 'passed') passed += +t[1]; }
  }
  const names = [], loadFailures = [];
  let file = null;
  for (const line of text.split('\n')) {
    const f = /^[ \t]*FAIL[ \t]+(\S+)/.exec(line);
    if (f) file = f[1];
    const m = /^[ \t]*● (.+?)[ \t]*$/.exec(line);
    if (!m) continue;
    if (m[1] !== 'Test suite failed to run') names.push(m[1]);
    else if (file) { names.push(file); loadFailures.push(file); }
  }
  // A suite that cannot run is outside jest's test counts; it is a failing entry here.
  const loads = uniq(loadFailures);
  return found ? { summary: true, passed, failed: failed + loads.length, total: total + loads.length, names: uniq(names), loadFailures: loads }
    : { ...empty(), names: uniq(names), loadFailures: loads };
}

function parsePytest(text) {
  let found = 0, passed = 0, failed = 0, total = 0;
  for (const m of text.matchAll(/^=+ (.+?) in \d+(?:\.\d+)?s(?: \([^)]*\))? =+$/gm)) {
    if (m[1] === 'no tests ran') { found++; continue; }
    const tokens = m[1].split(', ').map(t => /^(\d+) (passed|failed|errors?|skipped|deselected|xfailed|xpassed|warnings?|rerun)$/.exec(t));
    if (tokens.some(t => !t)) continue;
    found++;
    for (const [, n, kind] of tokens) {
      if (kind === 'passed') passed += +n;
      if (kind === 'failed' || kind.startsWith('error')) failed += +n;
      if (['passed', 'failed', 'error', 'errors', 'skipped', 'xfailed', 'xpassed'].includes(kind)) total += +n;
    }
  }
  const names = [], loadFailures = [];
  for (const m of text.matchAll(/^(FAILED|ERROR) ([^\s[]+(?:\[[^\]\n]*\])?)(?: - .*)?$/gm)) {
    names.push(m[2]);
    // A collection error names a file, never a `file::test` node id.
    if (m[1] === 'ERROR' && !m[2].includes('::')) loadFailures.push(m[2]);
  }
  return found ? { summary: true, passed, failed, total, names: uniq(names), loadFailures: uniq(loadFailures) }
    : { ...empty(), names: uniq(names), loadFailures: uniq(loadFailures) };
}

// cargo: one result line per test binary, summed.
function parseCargo(text) {
  let found = 0, passed = 0, failed = 0, total = 0;
  for (const m of text.matchAll(/^test result: (?:ok|FAILED)\. (\d+) passed; (\d+) failed; (\d+) ignored; \d+ measured; \d+ filtered out(?:; finished in \d+(?:\.\d+)?s)?$/gm)) {
    found++; passed += +m[1]; failed += +m[2]; total += +m[1] + +m[2] + +m[3];
  }
  const names = uniq([...text.matchAll(/^test (.+) \.\.\. FAILED$/gm)].map(m => m[1]));
  return found ? { summary: true, passed, failed, total, names, loadFailures: [] } : { ...empty(), names };
}

export function parseRunnerOutput(parser, text) {
  const parse = { node: parseNode, jest: parseJest, pytest: parsePytest, cargo: parseCargo, none: () => empty() }[parser];
  if (!PARSERS.includes(parser) || !parse) throw new Error(`Unknown parser: ${parser}`);
  return parse(normalize(String(text)));
}

const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
function checkSpec(spec) {
  if (!isObject(spec) || Object.keys(spec).some(k => k !== 'steps')) return 'the spec must be an object whose only key is "steps"';
  if (!Array.isArray(spec.steps) || !spec.steps.length) return '"steps" must be a non-empty array';
  const seen = new Set();
  for (const [i, step] of spec.steps.entries()) {
    const where = `step ${i + 1}`;
    if (!isObject(step)) return `${where} must be an object`;
    const extra = Object.keys(step).find(k => !['name', 'argv', 'shell', 'script', 'parser'].includes(k));
    if (extra !== undefined) return `${where} has unknown key "${extra}"`;
    if (typeof step.name !== 'string' || !/^[A-Za-z0-9._-]+$/.test(step.name)) return `${where} needs a name of [A-Za-z0-9._-]+`;
    if (seen.has(step.name)) return `duplicate step name "${step.name}"`;
    seen.add(step.name);
    if (!PARSERS.includes(step.parser)) return `${where} needs a parser: ${PARSERS.join(', ')}`;
    const hasArgv = Object.hasOwn(step, 'argv'), hasShell = Object.hasOwn(step, 'shell') || Object.hasOwn(step, 'script');
    if (hasArgv === hasShell) return `${where} needs exactly one of "argv" or "shell" + "script"`;
    if (hasArgv && (!Array.isArray(step.argv) || step.argv.some(a => typeof a !== 'string') || !step.argv[0])) return `${where} "argv" must be a non-empty array of strings`;
    if (hasShell && !SHELLS.includes(step.shell)) return `${where} "shell" must be one of ${SHELLS.join(', ')}`;
    if (hasShell && (typeof step.script !== 'string' || !step.script)) return `${where} needs a non-empty "script"`;
  }
  return null;
}

// The script is one argument, never composed into a command string. PowerShell gets it
// encoded: Windows PowerShell 5.1 strips embedded double quotes from a -Command argument.
// -OutputFormat Text keeps pwsh's error stream readable text rather than CLIXML in the log.
function commandOf(step) {
  if (step.argv) return step.argv;
  if (step.shell === 'bash') return ['bash', '-o', 'pipefail', '-c', step.script];
  return [step.shell, '-NoProfile', '-NonInteractive', '-OutputFormat', 'Text', '-EncodedCommand', Buffer.from(step.script, 'utf16le').toString('base64')];
}

function killTree(pid) {
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  else try { process.kill(-pid, 'SIGKILL'); } catch { try { process.kill(pid, 'SIGKILL'); } catch { /* already gone */ } }
}

// Child output goes to the log byte for byte; the tool's own lines always start a new line.
function logWriter(fd) {
  let atLineStart = true;
  const put = data => { if (data.length) { fs.writeSync(fd, data); atLineStart = data[data.length - 1] === '\n' || data[data.length - 1] === 10; } };
  return { fd, data: put, note: text => put((atLineStart ? '' : '\n') + text + '\n') };
}

function runStep(step, { cwd, env, timeoutMs, log }) {
  return new Promise(resolve => {
    const [command, ...args] = commandOf(step), pieces = [];
    const decoders = { stdout: new StringDecoder('utf8'), stderr: new StringDecoder('utf8') };
    let child, settled = false, timedOut = false, timer, grace;
    const finish = outcome => {
      if (settled) return;
      settled = true; clearTimeout(timer); clearTimeout(grace);
      pieces.push(decoders.stdout.end(), decoders.stderr.end());
      resolve({ ...outcome, timedOut, text: pieces.join('') });
    };
    try {
      child = spawn(command, args, { cwd, env, shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) { finish({ error: e.code || e.name }); return; }
    for (const stream of ['stdout', 'stderr']) child[stream].on('data', chunk => { log.data(chunk); pieces.push(decoders[stream].write(chunk)); });
    child.on('error', e => { if (child.pid === undefined) finish({ error: e.code || e.name }); });
    child.on('exit', (code, signal) => {
      clearTimeout(timer);
      grace = setTimeout(() => {
        log.note(`==> step ${step.name}: exited but its output pipes are still held open; stopped reading (the holder is left running)`);
        child.stdout.destroy(); child.stderr.destroy();
        finish({ exit: code ?? signal });
      }, GRACE_MS);
    });
    child.on('close', (code, signal) => finish({ exit: code ?? signal }));
    if (timeoutMs) timer = setTimeout(() => { timedOut = true; killTree(child.pid); }, timeoutMs);
  });
}

function classify(step, run, timeoutMs) {
  const parsed = step.parser === 'none' ? empty() : parseRunnerOutput(step.parser, run.text || '');
  const base = { name: step.name, passed: parsed.passed, failed: parsed.failed, total: parsed.total, names: parsed.names, loadFailures: parsed.loadFailures, exit: run.exit ?? null };
  const list = parsed.names.length > MAX_NAMES ? `${parsed.names.slice(0, MAX_NAMES).join(', ')} (+${parsed.names.length - MAX_NAMES} more)` : parsed.names.join(', ');
  const out = (result, text) => ({ step: { ...base, result }, text: `${step.name} ${text}` });
  if (run.error) return out('COULD-NOT-START', `COULD-NOT-START (${run.error})`);
  if (run.timedOut) return out('TIMEOUT', `TIMEOUT after ${timeoutMs / 1000}s`);
  if (step.parser === 'none') return run.exit === 0 ? out('PASS', 'ok') : out('FAIL', `exit ${run.exit}`);
  if (parsed.summary && parsed.failed > 0) return out('FAIL', list ? `${parsed.failed} of ${parsed.total} failed: ${list}` : `${parsed.failed} of ${parsed.total} failed (names not captured)`);
  if (parsed.summary && run.exit === 0) return out('PASS', `${parsed.passed}/${parsed.total}`);
  if (parsed.summary) return out('FAIL', `exit ${run.exit} after ${parsed.passed}/${parsed.total} passed`);
  if (run.exit !== 0) return out('CRASHED', `CRASHED before summary (exit ${run.exit})`);
  return out('NO-SUMMARY', 'NO SUMMARY (exit 0)');
}

export function formatDuration(ms) {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}s`;
}
// A reporter's text never breaks the one-line contract.
const SEPARATORS = [0x2028, 0x2029].map(c => String.fromCharCode(c));
const oneLine = text => SEPARATORS.reduce((t, s) => t.split(s).join(' '), text.replace(/[\u0000-\u001f\u007f-\u009f]+/g, ' '));

// Step `result` is PASS, FAIL, CRASHED, NO-SUMMARY, TIMEOUT or COULD-NOT-START; counts are
// null without a summary. `status` is UNKNOWN when a step could not start or the input is invalid.
export async function runSpec(spec, { cwd = process.cwd(), logPath, timeoutMs } = {}) {
  const unknown = reason => ({ status: 'UNKNOWN', line: oneLine(`UNKNOWN ${reason}`), steps: [] });
  const problem = checkSpec(spec);
  if (problem) return unknown(`spec: ${problem}`);
  if (typeof logPath !== 'string' || !logPath) return unknown('a log path is required');
  if (timeoutMs !== undefined && !(Number.isFinite(timeoutMs) && timeoutMs > 0 && timeoutMs <= MAX_TIMEOUT_MS)) return unknown(`the timeout must be a positive number of ms, at most ${MAX_TIMEOUT_MS}`);
  let log;
  try { fs.mkdirSync(path.dirname(path.resolve(logPath)), { recursive: true }); log = logWriter(fs.openSync(logPath, 'w')); }
  catch (e) { return unknown(`cannot open log ${logPath} (${e.code || e.name})`); }
  // A validation run is never a nested test context.
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => k.toUpperCase() !== 'NODE_TEST_CONTEXT'));
  const started = Date.now(), steps = [], texts = [];
  try {
    for (const step of spec.steps) {
      log.note(`==> step ${step.name}: ${step.argv ? 'argv ' + JSON.stringify(step.argv) : 'shell ' + step.shell}`);
      const run = await runStep(step, { cwd, env, timeoutMs, log });
      if (run.error) log.note(`==> step ${step.name}: COULD-NOT-START (${run.error})`);
      if (run.timedOut) log.note(`==> step ${step.name}: TIMEOUT after ${timeoutMs / 1000}s; process tree killed`);
      const { step: result, text } = classify(step, run, timeoutMs);
      steps.push(result); texts.push(text);
    }
  } finally { fs.closeSync(log.fd); }
  const status = steps.some(s => s.result === 'COULD-NOT-START') ? 'UNKNOWN' : steps.every(s => s.result === 'PASS') ? 'PASS' : 'FAIL';
  const joined = texts.join('; ');
  const line = status === 'PASS' ? `PASS ${joined} (${formatDuration(Date.now() - started)})` : `${status} ${joined} — log: ${logPath}`;
  return { status, line: oneLine(line), steps };
}

const HELP = `validate.mjs --spec <file.json> --log <file> [--cwd <dir>] [--timeout <seconds>]
Runs every step in order in the foreground, writes all output to --log, prints ONE line:
  PASS <step>; <step> (<duration>)  |  FAIL <step>; <step> — log: <path>  |  UNKNOWN <reason>
Exit 0 PASS; 1 FAIL; 2 UNKNOWN (usage, spec, or a step that could not start).
--cwd defaults to the current directory; --timeout (whole seconds, at most 2147483) applies per step and kills
the step's process tree. Spec (JSON; any other key is rejected):
  { "steps": [
    { "name": "tests", "shell": "pwsh", "script": "<multi-line recipe>", "parser": "node" },
    { "name": "diff-check", "argv": ["git", "diff", "--check"], "parser": "none" } ] }
name: unique, [A-Za-z0-9._-]+. Exactly one of argv (spawned without a shell) or shell + script;
shell: pwsh | powershell | bash (bash runs with -o pipefail). parser: node | jest | pytest |
cargo | none. A parsed step passes only when its summary shows zero failures and it exits 0.
`;

export async function validateCli(args) {
  if (args.length === 1 && args[0] === '--help') return { code: 0, text: HELP };
  const unknown = reason => ({ code: 2, text: oneLine(`UNKNOWN ${reason}`) + '\n' });
  let flags;
  try { flags = parseFlags(args, ['spec', 'log', 'cwd', 'timeout'], ['spec', 'log']); }
  catch { return unknown('usage: unknown, missing or duplicate flag; use --help'); }
  if (flags.timeout !== undefined && (!/^[1-9]\d*$/.test(flags.timeout) || Number(flags.timeout) * 1000 > MAX_TIMEOUT_MS)) {
    return unknown(`usage: --timeout must be a positive whole number of seconds, at most ${Math.floor(MAX_TIMEOUT_MS / 1000)}`);
  }
  const cwd = path.resolve(flags.cwd ?? process.cwd());
  try { if (!fs.statSync(cwd).isDirectory()) throw new Error(); } catch { return unknown(`usage: --cwd is not a directory: ${flags.cwd}`); }
  let text, spec;
  try { text = fs.readFileSync(flags.spec, 'utf8'); } catch (e) { return unknown(`cannot read spec ${flags.spec} (${e.code || e.name})`); }
  try { spec = JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text); } catch { return unknown(`spec: ${flags.spec} is not valid JSON`); }
  const result = await runSpec(spec, { cwd, logPath: flags.log, timeoutMs: flags.timeout === undefined ? undefined : Number(flags.timeout) * 1000 });
  return { code: { PASS: 0, FAIL: 1, UNKNOWN: 2 }[result.status], text: result.line + '\n' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const output = await validateCli(process.argv.slice(2)); process.stdout.write(output.text); process.exitCode = output.code;
}
