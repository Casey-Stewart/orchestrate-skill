// Independently validates C1's issue-002 inputs (I-10 … I-12) without the tools under test:
// node --test run directly, registered tests counted by loading each file under a stubbed
// `node:test`, mutations applied by plain string replacement in a fresh clone of the bundle.
// Run from the integration worktree root:
//   node .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/validate-c1-inputs-002.mjs <issue-dir> <new-report-dir>
// Writes <report-dir>/independent-check.md and <report-dir>/registry.json; refuses an existing
// report directory. Exit 0 only when every check passes.
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const LEDGER = '.agents/changes/OS-20260923-mechanical-tools';
const [issue, report] = process.argv.slice(2);
if (!issue || !report || process.argv.length !== 4) { console.error('usage: validate-c1-inputs-002.mjs <issue-dir> <new-report-dir>'); process.exit(2); }
if (fs.existsSync(report)) { console.error(`refusing: ${report} already exists`); process.exit(2); }
const sha = b => createHash('sha256').update(b).digest('hex');
const cleanEnv = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_') && k !== 'NODE_TEST_CONTEXT'));
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', env: cleanEnv(), maxBuffer: 64 << 20, ...opts });
const at = rel => path.join(issue, rel);
const text = rel => fs.readFileSync(at(rel), 'utf8');
const checks = [];
const check = (id, what, ok, detail) => checks.push({ id, what, ok: !!ok, detail });
const summary = out => ({ pass: +(/^ℹ pass (\d+)$/m.exec(out)?.[1] ?? NaN), fail: +(/^ℹ fail (\d+)$/m.exec(out)?.[1] ?? NaN), skipped: +(/^ℹ skipped (\d+)$/m.exec(out)?.[1] ?? NaN) });
// How many tests a file registers, and how many of them are skipped — by loading it with
// `node:test` replaced by a counter, so nothing of node's reporter or validate.mjs is involved.
const registered = file => {
  const probe = `const Module = require('module'); const orig = Module._load; let n = 0, skipped = 0;
    const t = (name, opts) => { n++; if (opts && typeof opts === 'object' && opts.skip) skipped++; };
    Module._load = function (req, ...rest) { return req === 'node:test' ? t : orig.call(this, req, ...rest); };
    require(${JSON.stringify(path.resolve(file))}); process.stdout.write(JSON.stringify({ n, skipped }));`;
  const r = run(process.execPath, ['-e', probe], { cwd: path.dirname(path.resolve(file)) });
  try { return JSON.parse(r.stdout); } catch { return { n: NaN, skipped: NaN, err: r.stderr }; }
};

// I-10
{ const reg = registered(at('I-10/skip-only.test.cjs'));
  check('I-10', 'skip-only.test.cjs registers exactly one test, and it is skipped', reg.n === 1 && reg.skipped === 1, JSON.stringify(reg));
  const r = run(process.execPath, ['--test', 'skip-only.test.cjs'], { cwd: at('I-10') }), s = summary(r.stdout);
  check('I-10', '`node --test` run directly: exit 0 with pass 0, skipped 1 (node alone calls this green)', r.status === 0 && s.pass === 0 && s.skipped === 1 && s.fail === 0, `exit ${r.status}, pass ${s.pass}, skipped ${s.skipped}, fail ${s.fail}`);
  const st = JSON.parse(text('I-10/spec.json')).steps;
  check('I-10', 'spec.json: one argv step named `tests`, parser node, running that file', st.length === 1 && st[0].name === 'tests' && st[0].parser === 'node' && JSON.stringify(st[0].argv) === JSON.stringify(['node', '--test', '--test-reporter=spec', 'skip-only.test.cjs']), JSON.stringify(st[0])); }
// I-11
{ const e = registered(at('I-11/empty.test.cjs')), o = registered(at('I-11/one.test.cjs'));
  check('I-11', 'empty.test.cjs registers no test; one.test.cjs registers one', e.n === 0 && o.n === 1, `empty ${JSON.stringify(e)}, one ${JSON.stringify(o)}`);
  const r = run(process.execPath, ['--test', 'empty.test.cjs', 'one.test.cjs'], { cwd: at('I-11') }), s = summary(r.stdout);
  check('I-11', '`node --test` run directly counts the empty file as a passing test (pass 2, exit 0) — the behaviour the fix must see through', r.status === 0 && s.pass === 2 && s.fail === 0, `exit ${r.status}, pass ${s.pass}, fail ${s.fail}`);
  const st = JSON.parse(text('I-11/spec.json')).steps;
  check('I-11', 'spec.json: one argv step named `tests`, parser node, running both files', st.length === 1 && st[0].name === 'tests' && JSON.stringify(st[0].argv) === JSON.stringify(['node', '--test', '--test-reporter=spec', 'empty.test.cjs', 'one.test.cjs']), JSON.stringify(st[0])); }
// I-12
{ const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'c1-v12-'));
  try {
    const clone = path.join(tmp, 'c');
    const c = run('git', ['clone', '--quiet', path.resolve(at('I-12/fixture.bundle')), clone]);
    const v = run('git', ['bundle', 'verify', path.resolve(at('I-12/fixture.bundle'))], { cwd: fs.existsSync(clone) ? clone : tmp });
    check('I-12', '`git bundle verify` passes (inside the fresh clone)', v.status === 0, (v.stderr + v.stdout).trim().split('\n').pop());
    const head = (run('git', ['rev-parse', 'HEAD'], { cwd: clone }).stdout ?? '').trim(), branch = (run('git', ['symbolic-ref', '--short', 'HEAD'], { cwd: clone }).stdout ?? '').trim();
    check('I-12', 'a fresh clone checks out `main`, and the README names its commit', c.status === 0 && branch === 'main' && head.length === 40 && text('I-12/README.md').includes(head), `clone exit ${c.status}, ${branch}, ${head.slice(0, 7)}`);
    const direct = (file, exp) => { const r = run(process.execPath, ['--test', file], { cwd: clone }), s = summary(r.stdout); return { ok: r.status === exp.exit && s.pass === exp.pass && s.skipped === exp.skipped && s.fail === 0, d: `exit ${r.status}, pass ${s.pass}, skipped ${s.skipped}, fail ${s.fail}` }; };
    let d = direct('feature.test.cjs', { exit: 0, pass: 0, skipped: 1 }); check('I-12', '(a) feature.test.cjs run directly: pass 0, skipped 1 — its control passes nothing', d.ok, d.d);
    d = direct('rows.test.cjs', { exit: 0, pass: 1, skipped: 0 }); check('I-12', '(b) rows.test.cjs run directly: pass 1', d.ok, d.d);
    d = direct('flip.test.cjs', { exit: 0, pass: 2, skipped: 0 }); check('I-12', '(f) flip.test.cjs run directly: pass 2, skipped 0', d.ok, d.d);
    const lib = fs.readFileSync(path.join(clone, 'lib.cjs'), 'utf8');
    for (const s of ['a', 'b', 'f']) {
      const m = JSON.parse(text(`I-12/muts-${s}.json`)).mutations;
      check('I-12', `muts-${s}.json: one mutation whose find occurs exactly once in lib.cjs`, m.length === 1 && lib.split(m[0].find).length === 2, `${m[0]?.id}: ${JSON.stringify(m[0]?.find)}`);
      const st = JSON.parse(text(`I-12/validate-${s}.json`)).steps;
      check('I-12', `validate-${s}.json: one argv step named \`tests\`, parser node`, st.length === 1 && st[0].name === 'tests' && st[0].parser === 'node', JSON.stringify(st[0].argv));
    }
    // Apply (b) and (f) by hand: (b) must leave rows.test.cjs registering nothing; (f) must skip one test, total unchanged.
    const apply = s => { const m = JSON.parse(text(`I-12/muts-${s}.json`)).mutations[0]; fs.writeFileSync(path.join(clone, 'lib.cjs'), lib.replace(m.find, m.replace)); };
    apply('b'); const rb = registered(path.join(clone, 'rows.test.cjs'));
    check('I-12', '(b) with e1 applied by hand, rows.test.cjs registers no test', rb.n === 0, JSON.stringify(rb));
    fs.writeFileSync(path.join(clone, 'lib.cjs'), lib); apply('f');
    d = direct('flip.test.cjs', { exit: 0, pass: 1, skipped: 1 }); check('I-12', '(f) with f1 applied by hand, flip.test.cjs: pass 1, skipped 1 (the total holds, the skipped count moves)', d.ok, d.d);
    fs.writeFileSync(path.join(clone, 'lib.cjs'), lib);
    check('I-12', 'the generator is issued beside the bundle, byte-identical to the committed generator', fs.readFileSync(at('I-12/generate-c1-inputs-002.mjs')).equals(fs.readFileSync(path.join(LEDGER, 'evidence/C1/inputs/generate-c1-inputs-002.mjs'))), 'raw bytes');
  } finally { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 }); }
}

const pw = run('pwsh', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()']).stdout.trim();
const env = `${os.type()} ${os.release()}; node ${process.version}; ${execFileSync('git', ['version'], { encoding: 'utf8' }).trim()}; ${pw ? 'PowerShell ' + pw : 'no pwsh'}`;
const tip = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', env: cleanEnv() }).trim();
const all = checks.every(c => c.ok);
const cmd = `node ${LEDGER}/evidence/C1/inputs/validate-c1-inputs-002.mjs ${issue} ${report}`;
fs.mkdirSync(report, { recursive: true });
fs.writeFileSync(path.join(report, 'independent-check.md'), ['# C1 inputs issue-002 — independent check', '', `Issue: \`${issue}\` · tip \`${tip}\` · ${new Date().toISOString()}`, `Environment: ${env}`, '',
  `Command: \`${cmd}\` — result: ${all ? 'ALL PASS' : 'FAILED'} (${checks.filter(c => c.ok).length}/${checks.length})`, '', '| Input | Check | Result | Observed |', '|---|---|---|---|',
  ...checks.map(c => `| ${c.id} | ${c.what.replace(/\|/g, '\\|')} | ${c.ok ? 'PASS' : 'FAIL'} | ${String(c.detail).replace(/\|/g, '\\|').replace(/\n/g, ' ')} |`), ''].join('\n'));
const rep = fs.readFileSync(path.join(report, 'independent-check.md'));
const rel = p => path.relative(LEDGER, p).split(path.sep).join('/');
const REQ = {
  'I-10': 'A node:test file whose only test is skipped by a switch that is off, and a validate.mjs spec with one argv step named `tests` running it (parser node).',
  'I-11': 'A node:test file that registers no tests (a loop over an empty array) beside a file with one real test, and a spec running both (parser node).',
  'I-12': 'A git bundle of a one-commit fixture (lib.cjs with add, FEATURE_ON off, MODE full, one ROWS entry; feature, rows and flip test files), three validate specs and three one-mutation files for scenarios (a) skip-only control, (b) a file emptied of tests, (f) a skip flip; the generator and a README of expected lines.',
};
const USE = { 'I-12': ['working-copy', 'Clone the bundle: `git clone <this file> ../c1-scratch/c1-fail-fixture` before Step 17; the steps read the JSON files in place.', 'Delete ../c1-scratch/c1-fail-fixture and clone again; the issued bundle and JSON files are never modified.'] };
const registry = [];
for (const id of Object.keys(REQ)) for (const f of fs.readdirSync(at(id)).sort()) {
  const bytes = fs.readFileSync(at(id + '/' + f));
  const [mode, use, reset] = USE[id] ?? ['read-only', 'Read in place by the steps named on the page; steps write only under ../c1-scratch.', 'Keep the issued file unchanged; delete what a step wrote under ../c1-scratch.'];
  registry.push({ id: `${id}.${f}`, path: rel(at(id + '/' + f)), sha256: sha(bytes), size: bytes.length, requirements: REQ[id],
    validation: { path: rel(path.join(report, 'independent-check.md')), sha256: sha(rep), size: rep.length, command: cmd, exitCode: all ? 0 : 1,
      result: checks.filter(c => c.id === id).map(c => (c.ok ? 'PASS ' : 'FAIL ') + c.what).join('; '), env }, mode, use, reset });
}
fs.writeFileSync(path.join(report, 'registry.json'), JSON.stringify(registry, null, 2) + '\n');
console.log(`${all ? 'ALL PASS' : 'FAILED'} ${checks.filter(c => c.ok).length}/${checks.length} — ${path.join(report, 'independent-check.md')}`);
process.exit(all ? 0 : 1);
