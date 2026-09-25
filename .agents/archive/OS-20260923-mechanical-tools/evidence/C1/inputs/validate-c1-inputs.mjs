// Independently validates C1's issued inputs against 01-plan.md §Smoke-input inventory,
// by routes that do not reuse the tools under test: node --test run directly, the skill
// hash recomputed from git's own blobs, byte diffs against the tip. Run from the
// integration worktree root:
//   node .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/validate-c1-inputs.mjs <issue-dir> <new-report-dir>
// Writes <report-dir>/independent-check.md and <report-dir>/registry.json (the sidecar's
// inputs array); refuses an existing report directory. Exit 0 only when every check passes.
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const LEDGER = '.agents/changes/OS-20260923-mechanical-tools';
const [issue, report] = process.argv.slice(2);
if (!issue || !report || process.argv.length !== 4) { console.error('usage: validate-c1-inputs.mjs <issue-dir> <new-report-dir>'); process.exit(2); }
if (fs.existsSync(report)) { console.error(`refusing: ${report} already exists`); process.exit(2); }
const sha = b => createHash('sha256').update(b).digest('hex');
const cleanEnv = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_') && k !== 'NODE_TEST_CONTEXT'));
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', env: cleanEnv(), maxBuffer: 64 << 20, ...opts });
const checks = [];
const check = (id, what, ok, detail) => { checks.push({ id, what, ok: !!ok, detail }); };
const at = rel => path.join(issue, rel);
const text = rel => fs.readFileSync(at(rel), 'utf8');
const summary = out => ({ pass: +(/^ℹ pass (\d+)$/m.exec(out)?.[1] ?? NaN), fail: +(/^ℹ fail (\d+)$/m.exec(out)?.[1] ?? NaN) });

// I-01
{ const r = run(process.execPath, ['--test', 'one-fails.test.cjs'], { cwd: at('I-01') }), s = summary(r.stdout);
  check('I-01', '`node --test one-fails.test.cjs` run directly: exit 1, 1 pass, 1 fail', r.status === 1 && s.pass === 1 && s.fail === 1, `exit ${r.status}, pass ${s.pass}, fail ${s.fail}`);
  const spec = JSON.parse(text('I-01/spec.json')), st = spec.steps?.[0];
  check('I-01', 'spec.json: one argv step named `tests`, parser `node`, running that file', spec.steps.length === 1 && st.name === 'tests' && st.parser === 'node'
    && JSON.stringify(st.argv) === JSON.stringify(['node', '--test', '--test-reporter=spec', 'one-fails.test.cjs']), JSON.stringify(st)); }
// I-02
{ const spec = JSON.parse(text('I-02/spec.json')), st = spec.steps?.[0];
  check('I-02', 'spec.json: one `pwsh` shell step named `tests`, parser `node`', spec.steps.length === 1 && st.name === 'tests' && st.shell === 'pwsh' && st.parser === 'node', `name ${st.name}, shell ${st.shell}, parser ${st.parser}`);
  const contract = fs.readFileSync(path.join(LEDGER, '00-READBEFORE.md'), 'utf8');
  check('I-02', 'its script is the contract\'s validation recipe, byte for byte', contract.includes('```powershell\n' + st.script + '```\n'), `${st.script.split('\n').length - 1} lines`);
  const r = run('pwsh', ['-NoProfile', '-Command', st.script], { cwd: process.cwd() }), s = summary(r.stdout);
  check('I-02', 'the recipe run directly on the tip exits 0', r.status === 0 && s.fail === 0, `exit ${r.status}, pass ${s.pass}, fail ${s.fail}`); }
// I-03
{ const names = fs.readdirSync(LEDGER).filter(n => n.endsWith('.md')).sort(), issued = fs.readdirSync(at('I-03')).sort();
  check('I-03', 'holds exactly the ledger\'s top-level Markdown files', JSON.stringify(names) === JSON.stringify(issued), issued.join(', '));
  const differing = [];
  for (const n of names) {
    const a = fs.readFileSync(path.join(LEDGER, n), 'utf8').split('\n'), b = text('I-03/' + n).split('\n');
    if (a.length !== b.length) { differing.push(`${n}: line count ${a.length} vs ${b.length}`); continue; }
    a.forEach((l, i) => { if (l !== b[i]) differing.push(`${n}:${i + 1}`); });
  }
  const one = differing.length === 1 && differing[0] === '02-batches-02-ledger-parser.md:8';
  const line = text('I-03/02-batches-02-ledger-parser.md').split('\n')[7], orig = fs.readFileSync(path.join(LEDGER, '02-batches-02-ledger-parser.md'), 'utf8').split('\n')[7];
  check('I-03', 'a diff against the tip copy shows exactly one line: B02\'s Files line, one path shorter', one && line.startsWith('**Files**: ') && orig.startsWith(line.replace(/`$/, '')) && orig.split(', ').length === line.split(', ').length + 1,
    differing.join('; ')); }
// Skill hash recomputed from git's blobs (not the tool's filesystem walk).
const files = execFileSync('git', ['ls-files', '-z', '--', 'orchestrate'], { encoding: 'utf8', env: cleanEnv() }).split('\0').filter(Boolean).sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
const dirty = execFileSync('git', ['status', '--porcelain', '--', 'orchestrate'], { encoding: 'utf8', env: cleanEnv() });
const h = createHash('sha256'), nul = Buffer.from([0]);
for (const f of files) {
  const blob = execFileSync('git', ['cat-file', 'blob', 'HEAD:' + f], { env: cleanEnv(), maxBuffer: 64 << 20 });
  h.update(Buffer.from(f.slice('orchestrate/'.length), 'utf8')); h.update(nul); h.update(Buffer.from(blob.toString('latin1').replace(/\r\n/g, '\n'), 'latin1')); h.update(nul);
}
const realHash = h.digest('hex');
check('skill', 'the tip\'s `orchestrate/` is clean in the worktree (so git\'s blobs are the bytes on disk)', dirty === '', dirty || 'clean');
// I-04
{ const t = text('I-04/00-READBEFORE.md'), m = /^\*\*Skill\*\*: `([^`]+)` · sha256 `([0-9a-f]{64})`\n$/.exec(t);
  check('I-04', 'one line in the template\'s documented form `**Skill**: `<dir>` · sha256 `<64 hex>``, pinning `orchestrate` with 64 zeros', m && m[1] === 'orchestrate' && m[2] === '0'.repeat(64), JSON.stringify(t));
  check('I-04', 'the pinned hash differs from the real one', m && m[2] !== realHash, `real ${realHash}`); }
// I-05
{ const names = fs.readdirSync(at('I-05')).sort();
  const spans = names.filter(n => n.endsWith('.md')).map(n => [n, text('I-05/' + n).replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')]);
  const left = spans.filter(([, t]) => t.includes('{{')).map(([n]) => n);
  check('I-05', 'no `{{` outside fenced and inline code spans in any Markdown file', left.length === 0, left.join(', ') || `${spans.length} files clean`);
  const m = /^\*\*Skill\*\*: `([^`]+)` · sha256 `([0-9a-f]{64})`$/m.exec(text('I-05/00-READBEFORE.md'));
  check('I-05', `the pin names \`orchestrate\` and equals the hash recomputed independently from git's ${files.length} blobs`, m && m[1] === 'orchestrate' && m[2] === realHash, `pin ${m?.[2]}, recomputed ${realHash}`);
  check('I-05', 'one batch file `02-batches-01-*.md`, a `validate.json` that parses with a `steps` array', names.filter(n => /^02-batches-\d\d-/.test(n)).length === 1 && Array.isArray(JSON.parse(text('I-05/validate.json')).steps), names.join(', ')); }
// I-06
{ const a = text('I-05/00-READBEFORE.md'), b = text('I-06/00-READBEFORE.md');
  let diff = 0; for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) diff++;
  const i = [...a].findIndex((c, k) => c !== b[k]);
  check('I-06', 'exactly one character differs from I-05\'s contract, and it is a hex digit of the pin', a.length === b.length && diff === 1 && /[0-9a-f]/.test(a[i]) && /[0-9a-f]/.test(b[i]) && a.slice(0, i).endsWith(realHash.slice(0, 63)),
    `length ${a.length}/${b.length}, ${diff} differing`); }
// I-07 / I-08
{ const facts = JSON.parse(text('I-07/facts.json')), help = run(process.execPath, ['orchestrate/tools/prompt.mjs', '--help']).stdout;
  const want = /^ {2}implementer: (.+)$/m.exec(help)?.[1].split(', ').sort();
  check('I-07', 'parses as JSON; its key set equals the implementer role\'s facts as `prompt.mjs --help` lists them', JSON.stringify(Object.keys(facts).sort()) === JSON.stringify(want), `keys ${Object.keys(facts).sort()}, help ${want}`);
  const noWt = JSON.parse(text('I-08/facts.json')), { worktreePath, ...rest } = facts;
  check('I-08', 'differs from I-07 by the key `worktreePath` only', JSON.stringify(noWt) === JSON.stringify(rest) && worktreePath !== undefined && !('worktreePath' in noWt), JSON.stringify(Object.keys(noWt))); }
// I-09
{ const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'c1-v09-'));
  try {
    const clone = path.join(tmp, 'c');
    const c = run('git', ['clone', '--quiet', path.resolve(at('I-09/fixture.bundle')), clone]);
    const v = run('git', ['bundle', 'verify', path.resolve(at('I-09/fixture.bundle'))], { cwd: fs.existsSync(clone) ? clone : tmp });
    check('I-09', '`git bundle verify` passes (run inside the fresh clone: verify needs a repository)', v.status === 0, (v.stderr + v.stdout).trim().split('\n').pop());
    const log = (run('git', ['log', '--format=%H', 'HEAD'], { cwd: clone }).stdout ?? '').trim().split('\n').filter(Boolean);
    const branch = (run('git', ['symbolic-ref', '--short', 'HEAD'], { cwd: clone }).stdout ?? '').trim();
    check('I-09', 'a fresh clone checks out `main` with two commits', c.status === 0 && branch === 'main' && log.length === 2, `clone exit ${c.status}, HEAD on ${branch || '(none)'}, ${log.length} commits`);
    const readme = text('I-09/README.md');
    check('I-09', 'the README names both commits\' SHAs', log.length === 2 && readme.includes(log[0]) && readme.includes(log[1]) && readme.includes(log[1].slice(0, 7)), log.length === 2 ? `HEAD ${log[0].slice(0, 7)}, HEAD~1 ${log[1].slice(0, 7)}` : 'no commits');
    for (const [ref, total] of [['HEAD', 2], ['HEAD~1', 1]]) {
      run('git', ['checkout', '--quiet', '--detach', ref], { cwd: clone });
      const r = run(process.execPath, ['--test', 'lib.test.cjs'], { cwd: clone }), s = summary(r.stdout);
      check('I-09', `the suite run directly at ${ref} passes ${total}/${total}`, r.status === 0 && s.pass === total && s.fail === 0, `exit ${r.status}, pass ${s.pass}, fail ${s.fail}`);
      const lib = fs.readFileSync(path.join(clone, 'lib.cjs'), 'utf8');
      const g = run('grep', ['-F', '-q', JSON.parse(text('I-09/muts-bad-anchor.json')).mutations[0].find, 'lib.cjs'], { cwd: clone });
      check('I-09', `at ${ref}: m3's find is absent (grep exit 1); m1's and m2's each occur exactly once`, g.status === 1
        && JSON.parse(text('I-09/muts.json')).mutations.every(m => lib.split(m.find).length === 2), `grep exit ${g.status}`);
    }
    check('I-09', 'the generator script is issued beside the bundle, byte-identical to the committed generator', fs.readFileSync(at('I-09/generate-c1-inputs.mjs')).equals(fs.readFileSync(path.join(LEDGER, 'evidence/C1/inputs/generate-c1-inputs.mjs'))), 'compared raw bytes');
  } finally { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 }); }
}

// ---- report + registry ---------------------------------------------------------------------
const env = `${os.type()} ${os.release()}; node ${process.version}; ${execFileSync('git', ['version'], { encoding: 'utf8' }).trim()}; ${run('pwsh', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()']).stdout.trim() ? 'PowerShell ' + run('pwsh', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()']).stdout.trim() : 'no pwsh'}`;
const tip = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', env: cleanEnv() }).trim();
const all = checks.every(c => c.ok);
const md = ['# C1 inputs — independent check', '', `Issue: \`${issue}\` · tip \`${tip}\` · ${new Date().toISOString()}`, `Environment: ${env}`, '',
  `Command: \`node ${LEDGER}/evidence/C1/inputs/validate-c1-inputs.mjs ${issue} ${report}\` — result: ${all ? 'ALL PASS' : 'FAILED'} (${checks.filter(c => c.ok).length}/${checks.length})`, '',
  '| Input | Check | Result | Observed |', '|---|---|---|---|',
  ...checks.map(c => `| ${c.id} | ${c.what.replace(/\|/g, '\\|')} | ${c.ok ? 'PASS' : 'FAIL'} | ${String(c.detail).replace(/\|/g, '\\|').replace(/\n/g, ' ')} |`), ''].join('\n');
fs.mkdirSync(report, { recursive: true });
fs.writeFileSync(path.join(report, 'independent-check.md'), md);
const rep = fs.readFileSync(path.join(report, 'independent-check.md'));
const rel = p => path.relative(LEDGER, p).split(path.sep).join('/');
const REQ = {
  'I-01': 'A node:test file with `fixture passes` and `fixture fails on purpose`, and a validate.mjs spec with one argv step named `tests` running it (parser node).',
  'I-02': 'A validate.mjs spec with one pwsh shell step named `tests` whose script is the contract\'s validation recipe (parser node).',
  'I-03': 'This ledger\'s top-level Markdown files at the tip, identical except that B02\'s Files line lacks its last path.',
  'I-04': 'A one-line contract whose Skill line pins `orchestrate` with 64 zeros as the hash.',
  'I-05': 'A ledger filled from the tip\'s templates: every placeholder filled, the pin naming `orchestrate` with its real hash, one batch B01 in plan and PROGRESS, and a validate.json.',
  'I-06': 'I-05\'s contract with one hex digit of the pin changed.',
  'I-07': 'An implementer facts file for prompt.mjs: exactly repoPath, worktreePath, scratchpadPath and guardrails ("none").',
  'I-08': 'I-07 without its worktreePath key.',
  'I-09': 'A git bundle of a two-commit fixture repository (lib.cjs `add`; one test at HEAD~1, two at HEAD), its validate spec, mutations m1 (a + b → a - b) and m2 (a comment), the absent-anchor m3, the generator and a README of expected lines.',
};
const USE = {
  'I-09': ['working-copy', 'Clone the bundle: `git clone <this file> ../c1-scratch/c1-fixture` before step 11; the steps read the JSON files in place.', 'Delete ../c1-scratch/c1-fixture and clone again; the issued bundle and JSON files are never modified.'],
};
const registry = [];
for (const id of Object.keys(REQ)) {
  for (const f of fs.readdirSync(at(id)).sort()) {
    const bytes = fs.readFileSync(at(id + '/' + f));
    const [mode, use, reset] = USE[id] ?? ['read-only', 'Read in place by the steps named on the page; steps write only under ../c1-scratch.', 'Keep the issued file unchanged; delete what a step wrote under ../c1-scratch.'];
    registry.push({ id: `${id}.${f}`, path: rel(at(id + '/' + f)), sha256: sha(bytes), size: bytes.length, requirements: REQ[id],
      validation: { path: rel(path.join(report, 'independent-check.md')), sha256: sha(rep), size: rep.length,
        command: `node ${LEDGER}/evidence/C1/inputs/validate-c1-inputs.mjs ${issue} ${report}`, exitCode: all ? 0 : 1,
        result: checks.filter(c => c.id === id).map(c => (c.ok ? 'PASS ' : 'FAIL ') + c.what).join('; '), env },
      mode, use, reset });
  }
}
fs.writeFileSync(path.join(report, 'registry.json'), JSON.stringify(registry, null, 2) + '\n');
console.log(`${all ? 'ALL PASS' : 'FAILED'} ${checks.filter(c => c.ok).length}/${checks.length} — ${path.join(report, 'independent-check.md')}`);
process.exit(all ? 0 : 1);
