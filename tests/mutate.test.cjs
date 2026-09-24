// mutate.mjs and run-at-ref.mjs against a small git repository built here: a module, node:test
// files that pin it, a CRLF file, and an older commit whose suite is red. Every CLI run is held
// to the same checks whatever it prints — the repository passed as --repo untouched (status,
// worktree list, HEAD, branch, refs, index and files), nothing left under the temp root it was
// given, and a live file behind every `log:` path it prints — so success and every abort path
// are covered alike. The abort paths no repository reaches (a write that does not land, a
// restore that does not hold, a checkout that cannot be removed) go through the exported core.
'use strict';
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');
const { makeRepo } = require('./support/git-fixture.cjs');
const ROOT = path.resolve(__dirname, '..');
const TOOLS = { mutate: path.join(ROOT, 'orchestrate/tools/mutate.mjs'), 'run-at-ref': path.join(ROOT, 'orchestrate/tools/run-at-ref.mjs') };
const api = () => import(pathToFileURL(TOOLS.mutate).href);
const atRefApi = () => import(pathToFileURL(TOOLS['run-at-ref']).href);
const NODE = process.execPath;

// ===== The fixture repository =====================================================================
const lines = (...l) => l.join('\n') + '\n';
const MATH = lines('// Adds two numbers.', 'exports.add = (a, b) => a + b;');
const MATH_TEST = lines("const test = require('node:test');", "const assert = require('node:assert/strict');",
  "const { add } = require('./math.cjs');", "test('add sums two numbers', () => { assert.equal(add(2, 3), 5); });");
const extraTest = red => lines("const test = require('node:test');", "test('extra one runs', () => {});",
  red ? "test('extra two runs', () => { throw new Error('red at the older commit'); });" : "test('extra two runs', () => {});");
// Line breaks built from char codes, so the check reads the file's bytes and nothing else.
const CRLF_TEST = lines("const test = require('node:test');", "const assert = require('node:assert/strict');",
  "const text = require('node:fs').readFileSync(require('node:path').join(__dirname, 'crlf.txt'), 'latin1');",
  'const CRLF = String.fromCharCode(13, 10), LF = String.fromCharCode(10);',
  "test('crlf.txt keeps CRLF line endings', () => { assert.equal(text.split(CRLF).length, text.split(LF).length); });",
  "test('crlf.txt says alpha then beta', () => { assert.equal(text, ['alpha', 'beta', ''].join(CRLF)); });");
const CRLF_TXT = 'alpha\r\nbeta\r\n';
const TESTS = ['math.test.cjs', 'extra.test.cjs', 'crlf.test.cjs'];
const specOf = (files = TESTS) => ({ steps: [{ name: 'tests', argv: [NODE, '--test', ...files], parser: 'node' }] });
// The mutations, one per outcome. m3 breaks the module's syntax, so math.test.cjs fails to load
// and node reports it as ONE failing test named after the file: the total stays 5, and only the
// load-failure rule stops it reading as KILLED. m4 deletes one of extra.test.cjs's two tests: the
// run passes, and only the total rule stops it reading as SURVIVED.
const M = {
  m1: { id: 'm1', file: 'math.cjs', find: 'a + b', replace: 'a - b' },
  m2: { id: 'm2', file: 'math.cjs', find: '// Adds two numbers.', replace: '// Adds numbers.' },
  m3: { id: 'm3', file: 'math.cjs', find: '(a, b) => a + b;', replace: '(a, b) => a +;' },
  m4: { id: 'm4', file: 'extra.test.cjs', find: "test('extra two runs', () => {});\n", replace: '' },
  c1: { id: 'c1', file: 'crlf.txt', find: 'alpha\nbeta', replace: 'alpha\ngamma' },
  // Both sides of "a CRLF file": one bare LF makes a file not CRLF, and so does having no line break.
  x1: { id: 'x1', file: 'mixed.txt', find: 'two\nthree', replace: 'two\nTHREE' },
  x2: { id: 'x2', file: 'flat.txt', find: 'flat', replace: 'flat\nline' },
  h1: { id: 'h1', file: 'math.cjs', find: 'a + b', replace: '(() => { for (;;); })()' },
};

function fixture(t) {
  const repo = makeRepo(t);
  const work = path.join(repo.root, 'work');
  fs.mkdirSync(work);
  const files = { 'math.cjs': MATH, 'math.test.cjs': MATH_TEST, 'crlf.txt': CRLF_TXT, 'crlf.test.cjs': CRLF_TEST, 'sub/keep.txt': 'kept\n', 'overlap.txt': 'aaa\n',
    'mixed.txt': 'one\r\ntwo\nthree\n', 'flat.txt': 'flat' };
  for (const [file, text] of Object.entries(files)) repo.write(file, text);
  repo.write('extra.test.cjs', extraTest(true));
  const red = repo.commit('red: extra two fails');
  repo.write('extra.test.cjs', extraTest(false));
  const green = repo.commit('green');
  const env = { ...repo.env };
  delete env.NODE_TEST_CONTEXT;
  const json = (name, value) => { const file = path.join(work, name); fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value)); return file; };
  const fx = { repo, work, red, green, env, json, validate: json('validate.json', specOf()) };
  fx.muts = (...list) => json('muts-' + list.map(m => m.id).join('-') + '.json', { mutations: list });
  fx.short = sha => repo.git('rev-parse', '--short', sha);
  return fx;
}

// ===== One way to run, and what every run must leave behind ========================================
const observed = new Set();
const kindOf = line => (/^(CONTROL (?:PASS|FAILED)|[A-Z]+(?:-[A-Z]+)*)(?= |$)/.exec(line) || [])[1];
// The snapshot holds every ref, the HEAD file (so the branch and the commit it names), the index
// and every working file; status and the worktree list are added to it.
function state(repo) {
  return { snapshot: repo.snapshot(), status: repo.git('--no-optional-locks', 'status', '--porcelain', '--untracked-files=all'),
    worktrees: repo.git('worktree', 'list', '--porcelain') };
}
// Every `log:` path a line prints is a file that still exists, and it is the --log the run was given.
function checkLogPaths(out, logPath) {
  let seen = 0;
  for (const line of out) {
    const m = / — log: (.+)$/.exec(line);
    if (!m) continue;
    seen++;
    assert.equal(m[1], logPath, 'a printed log path names the --log file: ' + line);
    assert.ok(fs.statSync(m[1]).isFile(), 'the log a line names still exists after the run: ' + line);
  }
  return seen;
}
// The temp root is this run's own, and empty afterwards; a `tmp` handed in is one that must not exist.
function cli(fx, tool, args, { tmp, env = {} } = {}) {
  const own = tmp === undefined;
  if (own) tmp = fs.mkdtempSync(path.join(fx.repo.root, 'tmp-'));
  const before = state(fx.repo);
  const started = Date.now();
  const r = spawnSync(NODE, [TOOLS[tool], ...args], { cwd: fx.work, env: { ...fx.env, TEMP: tmp, TMP: tmp, TMPDIR: tmp, ...env }, encoding: 'utf8', windowsHide: true, timeout: 180000 });
  assert.ifError(r.error); assert.equal(r.signal, null); assert.equal(r.stderr, '', 'nothing on stderr');
  assert.deepEqual(state(fx.repo), before, 'the repository passed as --repo must be untouched');
  if (own) assert.deepEqual(fs.readdirSync(tmp), [], 'no directory survives under the temp root');
  else assert.equal(fs.existsSync(tmp), false, 'a missing temp root is never created');
  assert.ok(r.stdout.endsWith('\n'), 'the output ends with a newline: ' + JSON.stringify(r.stdout));
  const out = r.stdout.slice(0, -1).split('\n');
  const log = args[args.indexOf('--log') + 1];
  const logPaths = args.includes('--log') ? checkLogPaths(out, path.resolve(fx.work, log)) : 0;
  if (tool === 'mutate') for (const line of out) observed.add(kindOf(line));
  return { code: r.status, lines: out, tmp, ms: Date.now() - started, logPaths, log: args.includes('--log') ? path.resolve(fx.work, log) : null };
}
const leftUnder = dir => fs.readdirSync(dir);
const mutateArgs = (fx, muts, log, extra = []) => ['--repo', fx.repo.cwd, '--ref', 'HEAD', '--mutations', muts, '--validate', fx.validate, '--log', path.join(fx.work, log), ...extra];
const readLog = run => fs.readFileSync(run.log, 'utf8');
const CONTROL_5 = /^CONTROL PASS PASS tests 5\/5 \(\d+s\)$/;

async function withEnv(vars, fn) {
  const saved = Object.keys(vars).map(key => [key, process.env[key]]);
  Object.assign(process.env, vars);
  try { return await fn(); } finally { for (const [key, value] of saved) if (value === undefined) delete process.env[key]; else process.env[key] = value; }
}
// In-process runs see the isolated Git configuration the CLI runs get, never this machine's.
async function isolated(fx, fn) {
  const saved = Object.entries(process.env).filter(([key]) => /^GIT_/i.test(key));
  for (const [key] of saved) delete process.env[key];
  const set = { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: fx.repo.env.GIT_CONFIG_GLOBAL };
  Object.assign(process.env, set);
  try { return await fn(); } finally {
    for (const key of Object.keys(set)) delete process.env[key];
    for (const [key, value] of saved) process.env[key] = value;
  }
}
// The file writer the core is handed: every write recorded; `lands(i)` decides whether write i lands.
function writer(lands = () => true) {
  const calls = [];
  return { calls, writeFile: (file, bytes) => { const i = calls.push({ file: path.basename(file), bytes: Buffer.from(bytes) }) - 1; if (lands(i)) fs.writeFileSync(file, bytes); } };
}
async function core(fx, options) {
  const { mutate } = await api();
  const tmp = fs.mkdtempSync(path.join(fx.repo.root, 'tmp-')), logPath = path.join(fx.work, 'core.log'), before = state(fx.repo);
  const result = await isolated(fx, () => mutate({ repo: fx.repo.cwd, ref: 'HEAD', validate: specOf(), logPath, tmpRoot: tmp, ...options }));
  assert.deepEqual(state(fx.repo), before, 'the repository passed as repo must be untouched');
  for (const line of result.lines) observed.add(kindOf(line));
  checkLogPaths(result.lines, logPath);
  return { ...result, tmp, log: fs.readFileSync(logPath, 'utf8') };
}

// ===== Results ======================================================================================
test('KILLED names the failing test, SURVIVED exits 1, and the summary counts both', t => {
  const fx = fixture(t);
  fs.writeFileSync(path.join(fx.work, 'published.log'), 'STALE BYTES FROM AN EARLIER INVOCATION\n');
  const r = cli(fx, 'mutate', mutateArgs(fx, fx.muts(M.m1, M.m2), 'published.log'));
  assert.equal(r.lines.length, 4, r.lines.join('\n'));
  assert.match(r.lines[0], CONTROL_5);
  assert.deepEqual(r.lines.slice(1), ['KILLED m1: add sums two numbers', 'SURVIVED m2', 'MUTATE 1 killed, 1 survived, 0 other']);
  assert.equal(r.code, 1);
  assert.deepEqual(leftUnder(r.tmp), []);
  // Every run appended to the one log, in order, under its own header — a log fresh this invocation.
  const log = readLog(r), at = header => { const i = log.indexOf('==> mutate: ' + header); assert.ok(i >= 0, 'log lacks ' + header); return i; };
  assert.ok(!log.includes('STALE BYTES'), 'each invocation writes a fresh log');
  assert.ok(at('checkout ' + fx.green) < at('control') && at('control') < at('mutation m1 (math.cjs)') && at('mutation m1 (math.cjs)') < at('mutation m2 (math.cjs)'));
});

test('a mutation that stops a test file loading, or changes how many tests run, is CRASHED — never KILLED or SURVIVED', t => {
  const fx = fixture(t);
  const r = cli(fx, 'mutate', mutateArgs(fx, fx.muts(M.m3, M.m4), 'crashed.log'));
  assert.match(r.lines[0], CONTROL_5);
  // m3's run has a summary and a named failure; only the load failure makes it CRASHED.
  assert.equal(r.lines[1], `CRASHED m3: FAIL tests 1 of 5 failed: math.test.cjs — log: ${r.log}`);
  // m4's run passes; only the total, 4 against the control's 5, makes it CRASHED.
  assert.match(r.lines[2], /^CRASHED m4: PASS tests 4\/4 \(\d+s\)$/);
  assert.equal(r.lines[3], 'MUTATE 0 killed, 0 survived, 2 other');
  assert.equal(r.lines.length, 4);
  assert.equal(r.code, 2);
  assert.equal(r.logPaths, 1, 'the one failure line carrying a log path was checked');
  const log = readLog(r);
  assert.ok(log.includes('==> mutate: m3: CRASHED — step tests: a test file failed to load (math.test.cjs)'), log);
  assert.ok(log.includes('==> mutate: m4: CRASHED — step tests ran 4 tests, the control 5'), log);
});

test('a CRLF file: the anchor matches, the mutation keeps CRLF, the restore is the CRLF bytes; a mixed or line-less file stays LF', async t => {
  const fx = fixture(t);
  const committed = fs.readFileSync(path.join(fx.repo.cwd, 'crlf.txt'));
  assert.ok(committed.equals(Buffer.from(CRLF_TXT)), 'the fixture commits crlf.txt with CRLF bytes');
  assert.ok(!M.c1.find.includes('\r') && M.c1.find.includes('\n'), 'the spec spells its line break LF, so only conversion can match');
  const w = writer();
  const r = await core(fx, { mutations: [M.c1, M.m1, M.x1, M.x2], writeFile: w.writeFile });
  assert.match(r.lines[0], CONTROL_5);
  // Only the content test fails: the mutated file kept CRLF, or the line-ending test would fail too.
  assert.deepEqual(r.lines.slice(1), ['KILLED c1: crlf.txt says alpha then beta', 'KILLED m1: add sums two numbers', 'SURVIVED x1', 'SURVIVED x2',
    'MUTATE 2 killed, 2 survived, 0 other']);
  assert.equal(r.code, 1);
  assert.deepEqual(w.calls.map(c => c.file), ['crlf.txt', 'crlf.txt', 'math.cjs', 'math.cjs', 'mixed.txt', 'mixed.txt', 'flat.txt', 'flat.txt']);
  assert.ok(w.calls[0].bytes.equals(Buffer.from('alpha\r\ngamma\r\n')), 'the mutation is written with CRLF: ' + JSON.stringify(w.calls[0].bytes.toString('latin1')));
  assert.ok(w.calls[1].bytes.equals(committed), 'the restore writes back the CRLF bytes as committed');
  // m1 ran with crlf.txt restored: had the restore lost CRLF, m1 would have named the line-ending test too.
  // One bare LF makes a file not CRLF: the spec's LF matches as LF and is written as LF.
  assert.ok(w.calls[4].bytes.equals(Buffer.from('one\r\ntwo\nTHREE\n')), JSON.stringify(w.calls[4].bytes.toString('latin1')));
  // No line break at all is not CRLF either: the replacement's LF stays LF.
  assert.ok(w.calls[6].bytes.equals(Buffer.from('flat\nline')), JSON.stringify(w.calls[6].bytes.toString('latin1')));
  assert.deepEqual(leftUnder(r.tmp), []);
});

test('in a CRLF file, a mutation that differs from its anchor only in line breaks changes nothing: NOT-APPLIED, never run, exit 2', async t => {
  const fx = fixture(t);
  // Each spec passes the "replace differs from find" check, and CRLF conversion maps its replace
  // back onto the file's own bytes. Run as written it would read SURVIVED — a working test (the
  // line-ending one, which LF bytes turn red) reported as vacuous.
  const e1 = { id: 'e1', file: 'crlf.txt', find: 'alpha\r\nbeta', replace: 'alpha\nbeta' };
  const e2 = { id: 'e2', file: 'crlf.txt', find: 'alpha\nbeta', replace: 'alpha\r\nbeta' };
  const w = writer();
  const r = await core(fx, { mutations: [e1, e2, M.m1], writeFile: w.writeFile });
  assert.match(r.lines[0], CONTROL_5);
  assert.deepEqual(r.lines.slice(1), ['NOT-APPLIED e1', 'NOT-APPLIED e2', 'KILLED m1: add sums two numbers', 'MUTATE 1 killed, 0 survived, 2 other']);
  assert.equal(r.code, 2);
  assert.deepEqual(w.calls.map(c => c.file), ['math.cjs', 'math.cjs'], 'crlf.txt is never written');
  for (const id of ['e1', 'e2']) {
    assert.ok(r.log.includes(`==> mutate: ${id}: NOT-APPLIED — the mutation leaves the file's bytes unchanged; nothing was written or run`), r.log);
    assert.ok(!r.log.includes(`==> mutate: mutation ${id} `), id + ' is never run');
  }
  assert.deepEqual(leftUnder(r.tmp), []);
});

// ===== Aborts before anything runs ===================================================================
test('anchors are all checked first: missing, ambiguous and absent-file anchors each abort with their own line and nothing run', t => {
  const fx = fixture(t);
  const all = [M.m1, { id: 'a1', file: 'math.cjs', find: 'a * b', replace: 'a / b' }, { id: 'a2', file: 'math.cjs', find: ' b', replace: ' c' },
    { id: 'a3', file: 'nope.cjs', find: 'x', replace: 'y' }];
  // A BOM-prefixed file, as Windows PowerShell 5.1 writes one, is read too.
  const muts = fx.json('anchors.json', String.fromCharCode(0xfeff) + JSON.stringify({ mutations: all }));
  const r = cli(fx, 'mutate', mutateArgs(fx, muts, 'anchors.log'));
  assert.deepEqual(r.lines, ['ANCHOR-MISSING a1', 'ANCHOR-AMBIGUOUS a2 (2 matches)', 'ANCHOR-MISSING a3']);
  assert.equal(r.code, 2);
  assert.ok(!readLog(r).includes('==> mutate: control'), 'no control ran');
  // The single bad anchor of the checkpoint's step 12: exactly one line.
  const one = cli(fx, 'mutate', mutateArgs(fx, fx.muts({ id: 'm3', file: 'math.cjs', find: 'a * b', replace: 'a / b' }), 'one.log'));
  assert.deepEqual(one.lines, ['ANCHOR-MISSING m3']);
  assert.equal(one.code, 2);
  // Overlapping occurrences are counted: `aa` sits twice in `aaa`, once if counted without overlap.
  const overlap = fx.json('overlap.json', { mutations: [{ id: 'o1', file: 'overlap.txt', find: 'aa', replace: 'b' }] });
  assert.deepEqual(cli(fx, 'mutate', mutateArgs(fx, overlap, 'overlap.log')).lines, ['ANCHOR-AMBIGUOUS o1 (2 matches)']);
});

test('a target that is not a regular file inside the checkout is refused, and a link out of it is never followed', t => {
  const fx = fixture(t);
  const outside = path.join(fx.repo.root, 'outside');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, 'victim.txt'), 'secret\n');
  // The setup plants a junction (a directory link on POSIX) inside the checkout, pointing out of it.
  const setup = fx.json('junction-setup.json', { steps: [{ name: 'link', argv: [NODE, '-e', "require('fs').symlinkSync(process.argv[1], 'junc', 'junction')", outside], parser: 'none' }] });
  const muts = fx.json('targets.json', { mutations: [{ id: 'd1', file: 'sub', find: 'kept', replace: 'lost' }, { id: 'j1', file: 'junc/victim.txt', find: 'secret', replace: 'mutated' }] });
  const r = cli(fx, 'mutate', mutateArgs(fx, muts, 'targets.log', ['--setup', setup]));
  assert.deepEqual(r.lines, ['ANCHOR-MISSING d1 (not a regular file inside the checkout)', 'ANCHOR-MISSING j1 (not a regular file inside the checkout)']);
  assert.equal(r.code, 2);
  assert.ok(readLog(r).includes('==> mutate: setup'), 'the setup ran, so the link existed when the anchor was refused');
  assert.equal(fs.readFileSync(path.join(outside, 'victim.txt'), 'utf8'), 'secret\n', 'the file behind the link is untouched');
});

test('a red control, and a control that ran no tests, abort before any mutation', t => {
  const fx = fixture(t);
  const red = cli(fx, 'mutate', mutateArgs(fx, fx.muts(M.m1), 'red.log').map(a => a === 'HEAD' ? 'HEAD~1' : a));
  assert.deepEqual(red.lines, [`CONTROL FAILED FAIL tests 1 of 5 failed: extra two runs — log: ${red.log}`]);
  assert.equal(red.code, 2);
  assert.ok(!readLog(red).includes('==> mutate: mutation'), 'no mutation ran');
  // A pattern that matches no file runs no tests and passes: every mutation would survive it.
  const idle = fx.json('idle.json', specOf(['nothing-*.test.cjs']));
  const none = cli(fx, 'mutate', mutateArgs(fx, fx.muts(M.m1), 'idle.log').map(a => a === fx.validate ? idle : a));
  assert.equal(none.lines.length, 1);
  assert.match(none.lines[0], /^CONTROL FAILED PASS tests 0\/0 \(\d+s\) — step tests ran no tests$/);
  assert.equal(none.code, 2);
});

test('--setup runs in the checkout before the control, and a setup that does not pass aborts', t => {
  const fx = fixture(t);
  const failing = fx.json('failing-setup.json', { steps: [{ name: 'gen', argv: [NODE, '-e', 'process.exit(3)'], parser: 'none' }] });
  const bad = cli(fx, 'mutate', mutateArgs(fx, fx.muts(M.m1), 'bad-setup.log', ['--setup', failing]));
  assert.deepEqual(bad.lines, [`UNKNOWN setup FAIL gen exit 3 — log: ${bad.log}`]);
  assert.equal(bad.code, 2);
  // A test file only the setup creates: the control runs it with the setup and never without.
  const gen = fx.json('gen-setup.json', { steps: [{ name: 'gen', argv: [NODE, '-e', "require('fs').writeFileSync('gen.test.cjs', \"require('node:test')('made by setup', () => {});\")"], parser: 'none' }] });
  const needsGen = fx.json('gen-validate.json', specOf([...TESTS, 'gen.test.cjs']));
  const withGen = mutateArgs(fx, fx.muts(M.m1), 'gen.log', ['--setup', gen]).map(a => a === fx.validate ? needsGen : a);
  const good = cli(fx, 'mutate', withGen);
  assert.match(good.lines[0], /^CONTROL PASS PASS tests 6\/6 \(\d+s\)$/);
  assert.deepEqual(good.lines.slice(1), ['KILLED m1: add sums two numbers', 'MUTATE 1 killed, 0 survived, 0 other']);
  assert.equal(good.code, 0);
  const log = readLog(good);
  assert.ok(log.indexOf('==> mutate: setup') < log.indexOf('==> mutate: control'), 'setup first');
  // Control: the same spec without --setup. node --test skips a named file that does not exist,
  // so the control still passes — on five tests, not six: the sixth was the setup's.
  const without = cli(fx, 'mutate', mutateArgs(fx, fx.muts(M.m1), 'no-gen.log').map(a => a === fx.validate ? needsGen : a));
  assert.match(without.lines[0], CONTROL_5, 'without the setup the generated test never runs: ' + without.lines[0]);
});

test('a mutation that outlives --timeout is TIMEOUT, killed, and the run still ends with its summary', t => {
  const fx = fixture(t);
  const quick = fx.json('quick.json', specOf(['math.test.cjs']));
  const args = mutateArgs(fx, fx.muts(M.h1), 'timeout.log', ['--timeout', '10']).map(a => a === fx.validate ? quick : a);
  const r = cli(fx, 'mutate', args);
  assert.match(r.lines[0], /^CONTROL PASS PASS tests 1\/1 \(\d+s\)$/);
  assert.deepEqual(r.lines.slice(1), ['TIMEOUT h1', 'MUTATE 0 killed, 0 survived, 1 other']);
  assert.equal(r.code, 2);
  assert.ok(r.ms < 90000, 'the run ended ' + r.ms + 'ms after start');
  assert.ok(readLog(r).includes('==> mutate: h1: TIMEOUT — a step outlived --timeout'));
});

test('a ref that names no commit, a checkout that fails and a temp root that cannot hold a directory: UNKNOWN, nothing left', t => {
  const fx = fixture(t);
  const noRef = cli(fx, 'mutate', mutateArgs(fx, fx.muts(M.m1), 'no-ref.log').map(a => a === 'HEAD' ? 'no-such-ref' : a));
  assert.deepEqual(noRef.lines, [`UNKNOWN ref no-such-ref names no commit in ${fx.repo.cwd}`]);
  assert.equal(noRef.code, 2);
  const dash = cli(fx, 'mutate', mutateArgs(fx, fx.muts(M.m1), 'dash.log').map(a => a === 'HEAD' ? '-x' : a));
  assert.deepEqual(dash.lines, [`UNKNOWN ref -x names no commit in ${fx.repo.cwd}`], 'an option-shaped ref is never handed to git');
  // A commit git will not check out: its tree holds a `.git` entry.
  const git = (args, input) => {
    const r = spawnSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', ...args], { cwd: fx.repo.cwd, env: fx.repo.env, encoding: 'utf8', input, windowsHide: true });
    assert.equal(r.status, 0, r.stderr);
    return r.stdout.trim();
  };
  const blob = git(['hash-object', '-w', '--stdin'], 'planted\n'), inner = git(['mktree'], `100644 blob ${blob}\tconfig\n`);
  const outer = git(['mktree'], `100644 blob ${git(['rev-parse', 'HEAD:math.cjs'])}\tmath.cjs\n040000 tree ${inner}\t.git\n`);
  git(['update-ref', 'refs/heads/unusable', git(['commit-tree', outer, '-p', 'HEAD', '-m', 'unusable'], '')]);
  const broken = cli(fx, 'mutate', mutateArgs(fx, fx.muts(M.m1), 'broken.log').map(a => a === 'HEAD' ? 'unusable' : a));
  assert.equal(broken.lines.length, 1);
  assert.match(broken.lines[0], /^UNKNOWN checkout: git checkout failed \(exit \d+\)$/);
  assert.equal(broken.code, 2);
  assert.match(readLog(broken), /==> mutate: git checkout failed/);
  assert.deepEqual(leftUnder(broken.tmp), [], 'the clone that could not be checked out is removed too');
  const missing = path.join(fx.repo.root, 'no-such-temp');
  const noTemp = cli(fx, 'mutate', mutateArgs(fx, fx.muts(M.m1), 'no-temp.log'), { tmp: missing });
  assert.equal(noTemp.lines.length, 1);
  assert.match(noTemp.lines[0], /^UNKNOWN cannot create a disposable directory under .*no-such-temp \(ENOENT\)$/);
  assert.equal(fs.existsSync(missing), false, 'nothing created the temp root');
  for (const run of [noRef, dash, broken, noTemp]) assert.ok(!readLog(run).includes('==> mutate: control'), 'no control ran');
  for (const run of [noRef, dash, broken]) assert.deepEqual(leftUnder(run.tmp), []);
});

test('the checkout runs no hook the user configured', t => {
  const fx = fixture(t);
  const hooks = path.join(fx.repo.root, 'user-hooks'), slash = p => p.split(path.sep).join('/');
  fs.mkdirSync(hooks);
  // One hook per leg: a --no-checkout clone fires reference-transaction and never post-checkout,
  // which only the checkout fires.
  const markers = { 'reference-transaction': path.join(fx.repo.root, 'ref-hook-ran.txt'), 'post-checkout': path.join(fx.repo.root, 'checkout-hook-ran.txt') };
  for (const [hook, marker] of Object.entries(markers)) fs.writeFileSync(path.join(hooks, hook), '#!/bin/sh\ncat > /dev/null\necho ran >> "' + slash(marker) + '"\n', { mode: 0o755 });
  const config = path.join(fx.repo.root, 'hooks.gitconfig');
  fs.writeFileSync(config, '[core]\n\thooksPath = ' + slash(hooks) + '\n');
  const ran = () => Object.entries(markers).filter(([, marker]) => fs.existsSync(marker)).map(([hook]) => hook);
  // Live control: under that configuration a plain clone runs the one hook and its checkout the other.
  const control = path.join(fx.repo.root, 'control-clone');
  const plain = (cwd, args) => { const r = spawnSync('git', args, { cwd, env: { ...fx.env, GIT_CONFIG_GLOBAL: config }, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', windowsHide: true }); assert.equal(r.status, 0, r.stderr); };
  plain(fx.repo.root, ['clone', '--quiet', '--no-checkout', '--', fx.repo.cwd, control]);
  assert.deepEqual(ran(), ['reference-transaction'], 'the clone leg runs the configured hook where nothing stops it');
  plain(control, ['checkout', '--quiet', '--detach', 'HEAD']);
  assert.deepEqual(ran(), ['reference-transaction', 'post-checkout'], 'the checkout leg runs its configured hook too');
  for (const marker of Object.values(markers)) fs.rmSync(marker);
  const r = cli(fx, 'mutate', mutateArgs(fx, fx.muts({ id: 'a1', file: 'math.cjs', find: 'a * b', replace: 'a / b' }), 'hooks.log'), { env: { GIT_CONFIG_GLOBAL: config } });
  assert.deepEqual(r.lines, ['ANCHOR-MISSING a1'], 'the checkout happened and the run stopped at its anchor');
  assert.deepEqual(ran(), [], "neither leg of the tool's checkout ran a hook");
});

// ===== The abort paths no repository reaches, through the core ======================================
test('a mutation write that does not land is NOT-APPLIED: restored, counted as other, and the run goes on', async t => {
  const fx = fixture(t);
  const w = writer(i => i !== 0);
  const r = await core(fx, { mutations: [M.m1, M.m2], writeFile: w.writeFile });
  assert.match(r.lines[0], CONTROL_5);
  assert.deepEqual(r.lines.slice(1), ['NOT-APPLIED m1', 'SURVIVED m2', 'MUTATE 0 killed, 1 survived, 1 other']);
  assert.equal(r.code, 2);
  assert.deepEqual(w.calls.map(c => c.file), ['math.cjs', 'math.cjs', 'math.cjs', 'math.cjs'], 'the unapplied mutation is still restored');
  assert.ok(!r.log.includes('==> mutate: mutation m1'), 'an unapplied mutation is never run');
  assert.deepEqual(leftUnder(r.tmp), []);
});

test('a restore that does not hold is RESTORE-FAILED alone and stops the run: no verdict, no later mutation, no summary', async t => {
  const fx = fixture(t);
  const w = writer(i => i !== 1);
  const r = await core(fx, { mutations: [M.m1, M.m2], writeFile: w.writeFile });
  assert.match(r.lines[0], CONTROL_5);
  // The run's verdict is never printed: only a restore that holds lets a mutation's line stand.
  assert.deepEqual(r.lines.slice(1), ['RESTORE-FAILED m1']);
  assert.ok(r.log.includes('==> mutate: m1: RESTORE-FAILED — the file did not read back as its saved bytes; not printed: KILLED m1: add sums two numbers'), r.log);
  assert.equal(r.code, 2);
  assert.equal(w.calls.length, 2, 'm2 is never written');
  assert.ok(!r.log.includes('==> mutate: mutation m2'));
  assert.deepEqual(leftUnder(r.tmp), [], 'the checkout is removed even so');
});

test('a writer that throws is NOT-APPLIED on apply and RESTORE-FAILED on restore, never a crash', async t => {
  const fx = fixture(t);
  const throwing = (at) => { let i = 0; return (file, bytes) => { if (i++ === at) throw Object.assign(new Error('denied'), { code: 'EPERM' }); fs.writeFileSync(file, bytes); }; };
  const apply = await core(fx, { mutations: [M.m2], writeFile: throwing(0) });
  assert.deepEqual(apply.lines.slice(1), ['NOT-APPLIED m2', 'MUTATE 0 killed, 0 survived, 1 other']);
  assert.equal(apply.code, 2);
  const restore = await core(fx, { mutations: [M.m2], writeFile: throwing(1) });
  assert.deepEqual(restore.lines.slice(1), ['RESTORE-FAILED m2']);
  assert.ok(restore.log.includes('not printed: SURVIVED m2'), restore.log);
  assert.equal(restore.code, 2);
  // Both writes refused: the NOT-APPLIED line gives way to RESTORE-FAILED too.
  const both = await core(fx, { mutations: [M.m2], writeFile: () => { throw Object.assign(new Error('denied'), { code: 'EPERM' }); } });
  assert.deepEqual(both.lines.slice(1), ['RESTORE-FAILED m2']);
  assert.ok(both.log.includes('not printed: NOT-APPLIED m2'), both.log);
  assert.equal(both.code, 2);
  for (const run of [apply, restore, both]) assert.deepEqual(leftUnder(run.tmp), []);
});

test('a checkout that cannot be removed is reported after the result and exits 2, for both tools', async t => {
  const fx = fixture(t);
  const busy = () => { throw Object.assign(new Error('held open'), { code: 'EBUSY' }); };
  const r = await core(fx, { mutations: [M.m1], remove: busy });
  const [left] = leftUnder(r.tmp);
  assert.ok(left && left.startsWith('mut-'), 'the checkout the remover could not remove is still there');
  assert.deepEqual(r.lines.slice(1), ['KILLED m1: add sums two numbers', 'MUTATE 1 killed, 0 survived, 0 other', `UNKNOWN cleanup: ${path.join(r.tmp, left)} could not be removed (EBUSY)`]);
  assert.equal(r.code, 2);
  const { removeTree } = await api();
  removeTree(path.join(r.tmp, left));
  const { runAtRef } = await atRefApi();
  const tmp = fs.mkdtempSync(path.join(fx.repo.root, 'tmp-'));
  const at = await isolated(fx, () => runAtRef({ repo: fx.repo.cwd, ref: 'HEAD', validate: specOf(), logPath: path.join(fx.work, 'at-busy.log'), tmpRoot: tmp, remove: busy }));
  const [kept] = leftUnder(tmp);
  assert.match(at.line, new RegExp('^AT ' + fx.short(fx.green) + ' PASS tests 5/5 \\(\\d+s\\) — UNKNOWN cleanup: '));
  assert.ok(at.line.endsWith(`${path.join(tmp, kept)} could not be removed (EBUSY)`), at.line);
  assert.equal(at.code, 2);
  removeTree(path.join(tmp, kept));
});

test('withDisposableCheckout, the helper both tools share: the committed tree at the ref, removed however fn ends', async t => {
  const fx = fixture(t), { withDisposableCheckout, removeTree, Unknown } = await api();
  // An uncommitted edit in the repository: the checkout holds the committed bytes regardless.
  fs.writeFileSync(path.join(fx.repo.cwd, 'math.cjs'), 'uncommitted\n');
  const tmp = fs.mkdtempSync(path.join(fx.repo.root, 'tmp-')), before = state(fx.repo);
  const seen = await isolated(fx, () => withDisposableCheckout(fx.repo.cwd, 'HEAD~1', ({ dir, sha, short, scratch }) => ({ dir, sha, short, scratch,
    math: fs.readFileSync(path.join(dir, 'math.cjs'), 'utf8'), extra: fs.readFileSync(path.join(dir, 'extra.test.cjs'), 'utf8') }), { tmpRoot: tmp }));
  assert.deepEqual([seen.sha, seen.short], [fx.red, fx.short(fx.red)]);
  assert.equal(seen.math, MATH, 'the committed bytes, never the uncommitted edit');
  assert.equal(seen.extra, extraTest(true), 'the tree of the ref asked for, not of HEAD');
  assert.deepEqual([path.dirname(seen.scratch), seen.dir], [tmp, path.join(seen.scratch, 'c')], 'a clone in its own directory under the temp root');
  assert.deepEqual(leftUnder(tmp), [], 'removed once fn returns');
  // fn throwing: the same error comes out, and the checkout is removed all the same.
  const failing = () => { throw new Unknown('fn failed'); };
  await assert.rejects(isolated(fx, () => withDisposableCheckout(fx.repo.cwd, 'HEAD', failing, { tmpRoot: tmp })), e => e.message === 'fn failed');
  assert.deepEqual(leftUnder(tmp), []);
  // fn throwing AND the remover failing: one error naming both.
  const busy = () => { throw Object.assign(new Error('held open'), { code: 'EBUSY' }); };
  await assert.rejects(isolated(fx, () => withDisposableCheckout(fx.repo.cwd, 'HEAD', failing, { tmpRoot: tmp, remove: busy })),
    e => e instanceof Unknown && /^fn failed; cleanup: .*mut-\w+ could not be removed \(EBUSY\)$/.test(e.message));
  const [left] = leftUnder(tmp);
  assert.ok(left && left.startsWith('mut-'));
  removeTree(path.join(tmp, left));
  assert.deepEqual(state(fx.repo), before, 'the repository, uncommitted edit included, is as it was');
});

// A fresh clone gives a ref its own meaning: a branch HEAD is not on does not exist there, and its
// origin/main is the repository's own main. Only resolving in the repository first reaches the
// commit asked for; both refs here name the older, red commit while main is green.
test('a ref is resolved in the repository first: a branch HEAD is not on, and a remote-tracking ref that a clone would read otherwise', async t => {
  const fx = fixture(t), { withDisposableCheckout } = await api();
  fx.repo.git('update-ref', 'refs/heads/side', fx.red);
  fx.repo.git('update-ref', 'refs/remotes/origin/main', fx.red);
  const tmp = fs.mkdtempSync(path.join(fx.repo.root, 'tmp-')), before = state(fx.repo);
  for (const ref of ['side', 'origin/main']) {
    const seen = await isolated(fx, () => withDisposableCheckout(fx.repo.cwd, ref, ({ dir, sha }) => ({ sha, extra: fs.readFileSync(path.join(dir, 'extra.test.cjs'), 'utf8') }), { tmpRoot: tmp }));
    assert.deepEqual(seen, { sha: fx.red, extra: extraTest(true) }, ref + ': the commit the repository names, and its tree');
    const at = cli(fx, 'run-at-ref', ['--repo', fx.repo.cwd, '--ref', ref, '--validate', fx.validate, '--log', path.join(fx.work, 'at-' + ref.replace('/', '-') + '.log')]);
    assert.deepEqual(at.lines, [`AT ${fx.short(fx.red)} FAIL tests 1 of 5 failed: extra two runs — log: ${at.log}`], ref);
    assert.equal(at.code, 1, ref);
  }
  assert.deepEqual(leftUnder(tmp), []);
  assert.deepEqual(state(fx.repo), before);
});

// Git's repository variables in the caller's environment — exported to every hook, and set by a
// user who works that way — must reach neither the clone nor a validate step inside it.
test("git's repository variables are git's own list, each dropped whatever its case, and nothing else is", async () => {
  const { localGitVars, withoutLocalGitEnv } = await api();
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^GIT_/i.test(key)));
  const listed = spawnSync('git', ['rev-parse', '--local-env-vars'], { env, encoding: 'utf8', windowsHide: true });
  assert.equal(listed.status, 0, listed.stderr);
  const names = listed.stdout.split(/\r?\n/).filter(Boolean);
  assert.ok(names.includes('GIT_DIR') && names.includes('GIT_INDEX_FILE') && names.length >= 10, 'git really listed them: ' + names.join(' '));
  assert.deepEqual(localGitVars(), names, 'the list is the one git prints, never a copy');
  const keep = { PATH: 'p', GIT_TERMINAL_PROMPT: '0', GIT_CONFIG_GLOBAL: 'g', GIT_CONFIG_NOSYSTEM: '1', GIT_CEILING_DIRECTORIES: 'c', GIT_DIRECTORY: 'not git_dir' };
  const planted = { ...keep };
  for (const name of names) { planted[name] = 'x'; planted[name.toLowerCase()] = 'x'; }
  assert.deepEqual(withoutLocalGitEnv(planted), keep);
});

test('a GIT_DIR or GIT_INDEX_FILE in the caller\'s environment never reaches the repository, the clone or a validate step, for both tools', async t => {
  const fx = fixture(t);
  // The user has a change staged: an index a stray checkout would rewrite.
  fx.repo.write('sub/keep.txt', 'staged\n');
  fx.repo.git('add', 'sub/keep.txt');
  // A step that passes only where git finds the clone's own repository.
  const where = { name: 'where', argv: [NODE, '-e', "const top = require('path').join(process.cwd(), '.git'), dir = require('child_process').execFileSync('git', ['rev-parse', '--absolute-git-dir'], { encoding: 'utf8' }).trim(); process.exit(require('fs').realpathSync(dir) === require('fs').realpathSync(top) ? 0 : 1);"], parser: 'none' };
  const spec = fx.json('where.json', { steps: [...specOf().steps, where] });
  const gitDir = path.join(fx.repo.cwd, '.git');
  for (const [name, value] of [['GIT_DIR', gitDir], ['GIT_INDEX_FILE', path.join(gitDir, 'index')]]) {
    const env = { [name]: value };
    // cli() holds every run to an untouched repository: status, HEAD, refs, index and files.
    const r = cli(fx, 'mutate', mutateArgs(fx, fx.muts(M.m1), 'env-' + name + '.log').map(a => a === fx.validate ? spec : a), { env });
    assert.match(r.lines[0], /^CONTROL PASS PASS tests 5\/5; where ok \(\d+s\)$/, name + ': ' + r.lines.join(' | '));
    assert.deepEqual(r.lines.slice(1), ['KILLED m1: add sums two numbers', 'MUTATE 1 killed, 0 survived, 0 other'], name);
    assert.equal(r.code, 0, name);
    const at = cli(fx, 'run-at-ref', ['--repo', fx.repo.cwd, '--ref', 'HEAD~1', '--validate', spec, '--log', path.join(fx.work, 'at-env-' + name + '.log')], { env });
    assert.deepEqual(at.lines, [`AT ${fx.short(fx.red)} FAIL tests 1 of 5 failed: extra two runs; where ok — log: ${at.log}`], name);
    assert.equal(at.code, 1, name);
    // In process, past the CLIs' own scrub: the clone and its checkout drop the variable themselves.
    const { withDisposableCheckout } = await api();
    const tmp = fs.mkdtempSync(path.join(fx.repo.root, 'tmp-')), before = state(fx.repo);
    const seen = await isolated(fx, () => withEnv(env, () => withDisposableCheckout(fx.repo.cwd, 'HEAD~1', ({ dir, sha }) => ({ sha, extra: fs.readFileSync(path.join(dir, 'extra.test.cjs'), 'utf8') }), { tmpRoot: tmp })));
    assert.deepEqual(seen, { sha: fx.red, extra: extraTest(true) }, name);
    assert.deepEqual(state(fx.repo), before, name + ': the repository is untouched in process too');
    assert.deepEqual(leftUnder(tmp), []);
  }
});

// ===== The classification rows, each fed directly ===================================================
test('classification: TIMEOUT first, then CRASHED on no summary, a load failure or a changed total; KILLED only on named test failures', async () => {
  const { classifyRun, verdictLine } = await api();
  const step = over => ({ name: 'tests', result: 'PASS', passed: 5, failed: 0, total: 5, names: [], loadFailures: [], exit: 0, ...over });
  const lint = over => ({ name: 'lint', result: 'PASS', passed: null, failed: null, total: null, names: [], loadFailures: [], exit: 0, ...over });
  const control = { status: 'PASS', steps: [step(), lint()] }, parsers = ['node', 'none'];
  // Kind and the reason the log records, so each check is told apart from the ones after it: a
  // run with no summary also has a total unlike the control's, and only the reason says which rule fired.
  const run = (status, ...steps) => { const v = classifyRun(control, { status, steps }, parsers); return [v.kind, v.reason]; };
  const failed = step({ result: 'FAIL', passed: 4, failed: 1, names: ['a test'], exit: 1 });
  const UNNAMED = 'a step failed without a named failing test';
  const rows = [
    ['PASS, same total', run('PASS', step(), lint()), ['SURVIVED', undefined]],
    ['a named failure', run('FAIL', failed, lint()), ['KILLED', undefined]],
    ['a step that timed out, which also has no summary', run('FAIL', step({ result: 'TIMEOUT', passed: null, failed: null, total: null, exit: 1 }), lint()), ['TIMEOUT', 'a step outlived --timeout']],
    ['no parsed summary', run('FAIL', step({ result: 'CRASHED', passed: null, failed: null, total: null, exit: 1 }), lint()), ['CRASHED', 'step tests printed no parsed summary']],
    ['a load failure beside a named failure', run('FAIL', step({ result: 'FAIL', passed: 4, failed: 1, names: ['x.test.cjs'], loadFailures: ['x.test.cjs'], exit: 1 }), lint()),
      ['CRASHED', 'step tests: a test file failed to load (x.test.cjs)']],
    ['a changed total, passing', run('PASS', step({ passed: 4, total: 4 }), lint()), ['CRASHED', 'step tests ran 4 tests, the control 5']],
    ['a changed total, failing by name', run('FAIL', step({ result: 'FAIL', passed: 5, failed: 1, total: 6, names: ['a test'], exit: 1 }), lint()), ['CRASHED', 'step tests ran 6 tests, the control 5']],
    ['failures counted without names', run('FAIL', step({ result: 'FAIL', passed: 4, failed: 1, exit: 1 }), lint()), ['CRASHED', UNNAMED]],
    ['a non-zero exit with no failure counted', run('FAIL', step({ result: 'FAIL', exit: 3 }), lint()), ['CRASHED', UNNAMED]],
    ['a parser-none step failing alone', run('FAIL', step(), lint({ result: 'FAIL', exit: 1 })), ['CRASHED', UNNAMED]],
    ['a parser-none step failing beside a named failure', run('FAIL', failed, lint({ result: 'FAIL', exit: 1 })), ['CRASHED', UNNAMED]],
    ['a run that never reached its steps', run('UNKNOWN'), ['CRASHED', 'the run did not reach its steps']],
  ];
  for (const [label, got, want] of rows) assert.deepEqual(got, want, label);
  assert.deepEqual(classifyRun(control, { status: 'FAIL', steps: [failed, lint()] }, parsers).names, ['a test']);
  // The names cap, both sides of it, and the other line forms.
  const names = n => Array.from({ length: n }, (_, i) => 't' + (i + 1));
  assert.equal(verdictLine('m1', { kind: 'KILLED', names: names(10) }, ''), 'KILLED m1: ' + names(10).join(', '));
  assert.equal(verdictLine('m1', { kind: 'KILLED', names: names(11) }, ''), 'KILLED m1: ' + names(10).join(', ') + ' (+1 more)');
  assert.equal(verdictLine('m1', { kind: 'CRASHED' }, 'FAIL tests x'), 'CRASHED m1: FAIL tests x');
  assert.equal(verdictLine('m1', { kind: 'SURVIVED' }, 'PASS'), 'SURVIVED m1');
  assert.equal(verdictLine('m1', { kind: 'TIMEOUT' }, 'FAIL'), 'TIMEOUT m1');
});

// ===== Usage ========================================================================================
test('every invalid invocation is one UNKNOWN line with exit 2, before any checkout or log', async t => {
  const fx = fixture(t);
  const tmp = fs.mkdtempSync(path.join(fx.repo.root, 'tmp-')), before = state(fx.repo);
  const log = path.join(fx.work, 'never.log');
  const good = { repo: fx.repo.cwd, ref: 'HEAD', mutations: fx.muts(M.m1), validate: fx.validate, log };
  const args = (over = {}) => Object.entries({ ...good, ...over }).filter(([, v]) => v !== undefined).flatMap(([k, v]) => ['--' + k, v]);
  const muts = (name, value) => args({ mutations: fx.json(name, value) });
  const one = over => ({ mutations: [{ ...M.m1, ...over }] });
  const FLAGS = /^UNKNOWN usage: unknown, missing or duplicate flag; use --help$/, TIMEOUT = /^UNKNOWN usage: --timeout must be a positive whole number of seconds, at most 2147483$/;
  const SHAPE = /^UNKNOWN --mutations: mutation 1 must hold exactly "id", "file", "find" and "replace"$/, FILE = /^UNKNOWN --mutations: m1: "file" must be a repository-relative path with forward slashes, outside \.git$/;
  const REPLACE = /^UNKNOWN --mutations: m1: "replace" must be a string that differs from "find"$/;
  const cases = [
    ['no flags', [], FLAGS], ['an unknown flag', [...args(), '--bogus', 'x'], FLAGS], ['a duplicate flag', [...args(), '--ref', 'HEAD'], FLAGS],
    ['a missing --log', args({ log: undefined }), FLAGS], ['a missing --validate', args({ validate: undefined }), FLAGS], ['a flag without its value', [...args(), '--timeout'], FLAGS],
    ['--help with more', ['--help', ...args()], FLAGS],
    ['--timeout 0', args({ timeout: '0' }), TIMEOUT], ['--timeout 1.5', args({ timeout: '1.5' }), TIMEOUT], ['--timeout soon', args({ timeout: 'soon' }), TIMEOUT],
    ['--timeout above the timer ceiling', args({ timeout: '2147484' }), TIMEOUT],
    ['an unreadable --mutations', args({ mutations: path.join(fx.work, 'absent.json') }), /^UNKNOWN cannot read --mutations .*absent\.json \(ENOENT\)$/],
    ['--mutations not JSON', muts('not-json.json', '{"mutations": ['), /^UNKNOWN --mutations: .*not-json\.json is not valid JSON$/],
    ['--mutations an array', muts('array.json', [M.m1]), /^UNKNOWN --mutations: the file must be an object whose only key is "mutations"$/],
    ['--mutations with a second key', muts('second-key.json', { mutations: [M.m1], note: 'x' }), /^UNKNOWN --mutations: the file must be an object whose only key is "mutations"$/],
    ['--mutations empty', muts('empty.json', { mutations: [] }), /^UNKNOWN --mutations: "mutations" must be a non-empty array$/],
    ['--mutations not an array', muts('object.json', { mutations: M.m1 }), /^UNKNOWN --mutations: "mutations" must be a non-empty array$/],
    ['a mutation that is not an object', muts('string.json', { mutations: ['m1'] }), SHAPE],
    ['a mutation with an extra key', muts('extra-key.json', one({ why: 'x' })), SHAPE],
    ['a mutation without replace', muts('no-replace.json', { mutations: [{ id: 'm1', file: 'math.cjs', find: 'a' }] }), SHAPE],
    ['an id with a space', muts('bad-id.json', one({ id: 'm 1' })), /^UNKNOWN --mutations: mutation 1 needs an id of \[A-Za-z0-9\._-\]\+$/],
    ['a non-string id', muts('number-id.json', one({ id: 7 })), /^UNKNOWN --mutations: mutation 1 needs an id of /],
    ['a duplicate id', muts('dup-id.json', { mutations: [M.m1, { ...M.m2, id: 'm1' }] }), /^UNKNOWN --mutations: duplicate id "m1"$/],
    ['an absolute file', muts('abs.json', one({ file: '/math.cjs' })), FILE], ['a backslashed file', muts('backslash.json', one({ file: 'sub\\keep.txt' })), FILE],
    ['a file climbing out', muts('parent.json', one({ file: '../math.cjs' })), FILE], ['a drive-letter file', muts('drive.json', one({ file: 'C:/math.cjs' })), FILE],
    ['a file inside .git', muts('dot-git.json', one({ file: '.git/config' })), FILE], ['a file inside .GIT', muts('dot-git-upper.json', one({ file: 'sub/.GIT/x' })), FILE],
    ['an empty find', muts('empty-find.json', one({ find: '' })), /^UNKNOWN --mutations: m1: "find" must be a non-empty string$/],
    ['a non-string find', muts('number-find.json', one({ find: 5 })), /^UNKNOWN --mutations: m1: "find" must be a non-empty string$/],
    ['replace equal to find', muts('same.json', one({ replace: 'a + b' })), REPLACE], ['a non-string replace', muts('null-replace.json', one({ replace: null })), REPLACE],
    ['an unreadable --validate', args({ validate: path.join(fx.work, 'absent-spec.json') }), /^UNKNOWN cannot read --validate .*absent-spec\.json \(ENOENT\)$/],
    ['an invalid --validate spec', args({ validate: fx.json('bad-spec.json', { steps: [] }) }), /^UNKNOWN --validate: spec: "steps" must be a non-empty array$/],
    ['a --validate with no test-counting step', args({ validate: fx.json('none-spec.json', { steps: [{ name: 'check', argv: [NODE, '-e', ''], parser: 'none' }] }) }),
      /^UNKNOWN --validate: needs a step whose parser counts tests \(node, jest, pytest, cargo\); a parser-none step has no count to compare$/],
    ['an invalid --setup spec', [...args(), '--setup', fx.json('bad-setup.json', { steps: [{ name: 'x' }] })], /^UNKNOWN --setup: spec: step 1 needs a parser: /],
    ['a --repo outside any work tree', args({ repo: fx.work }), /^UNKNOWN usage: not inside a git work tree: /],
    ['a --log inside the repository', args({ log: path.join(fx.repo.cwd, 'mutate.log') }), /^UNKNOWN usage: --log must lie outside the repository /],
    ['a --log inside a subdirectory of the repository', args({ log: path.join(fx.repo.cwd, 'sub', 'deep', 'mutate.log') }), /^UNKNOWN usage: --log must lie outside the repository /],
    ['a --log that cannot be opened', args({ log: fx.work }), /^UNKNOWN cannot open log .* \(E[A-Z]+\)$/],
  ];
  // In-process through the CLI function; three cases also spawned, so stdout and the exit code
  // are the real process's. The ceiling keeps git from finding a repository above the fixture.
  const env = { GIT_CEILING_DIRECTORIES: fx.repo.root, TEMP: tmp, TMP: tmp, TMPDIR: tmp }, spawned = ['no flags', '--mutations an array', 'a --log inside the repository'];
  const { mutateCli } = await api();
  let spawns = 0;
  for (const [label, argv, expected] of cases) {
    const r = await withEnv(env, () => mutateCli(argv));
    assert.equal(r.code, 2, label + ': ' + r.lines.join(' | '));
    assert.equal(r.lines.length, 1, label + ': exactly one line');
    assert.match(r.lines[0], expected, label);
    observed.add(kindOf(r.lines[0]));
    if (spawned.includes(label)) {
      spawns++;
      const s = spawnSync(NODE, [TOOLS.mutate, ...argv], { cwd: fx.work, env: { ...fx.env, ...env }, encoding: 'utf8', windowsHide: true, timeout: 60000 });
      assert.deepEqual([s.status, s.stdout, s.stderr], [2, r.lines[0] + '\n', ''], label + ': the process prints the same one line');
    }
    assert.equal(fs.existsSync(log), false, label + ': no log was opened');
    assert.equal(fs.existsSync(path.join(fx.repo.cwd, 'mutate.log')), false, label);
  }
  assert.equal(spawns, spawned.length, 'every spawned case is in the table');
  assert.deepEqual(leftUnder(tmp), [], 'no checkout was made');
  assert.deepEqual(state(fx.repo), before, 'the repository is untouched by every refused invocation');
  // The valid shape these cases deviate from does run: the same arguments, unaltered.
  const ok = cli(fx, 'mutate', args());
  assert.equal(ok.code, 0, ok.lines.join('\n'));
});

test('--help documents every line kind the tool declares, and the exit codes', async () => {
  const { RESULTS, NOT_RUN } = await api();
  const r = spawnSync(NODE, [TOOLS.mutate, '--help'], { encoding: 'utf8', windowsHide: true });
  assert.equal(r.status, 0);
  assert.ok(r.stdout.startsWith('mutate.mjs --repo <repo> --ref <ref> --mutations <muts.json> --validate <spec.json> --log <file> [--setup <spec.json>] [--timeout <seconds>]\n'));
  for (const kind of [...RESULTS, ...NOT_RUN, 'CONTROL PASS', 'MUTATE']) assert.ok(r.stdout.includes(kind + ' '), '--help names ' + kind);
  assert.ok(r.stdout.includes('Exit 0 every mutation killed; 1 at least one survived and nothing else went wrong; 2 anything else.'));
  const at = spawnSync(NODE, [TOOLS['run-at-ref'], '--help'], { encoding: 'utf8', windowsHide: true });
  assert.equal(at.status, 0);
  assert.ok(at.stdout.startsWith('run-at-ref.mjs --repo <repo> --ref <ref> --validate <spec.json> --log <file> [--setup <spec.json>] [--timeout <seconds>]\n'));
});

// A crash inside the tool must never end with exit 1, which reads as "survived" (mutate) or
// "the suite failed" (run-at-ref). The planted throw waits until the tool has registered its
// handler (at most 3 s), so it tests the handler rather than a race with module loading.
test('an uncaught error is UNKNOWN internal error with exit 2, never exit 1', () => {
  const plant = 'let n = 0; const go = () => { if (process.listenerCount("uncaughtException") > 0 || ++n > 300) throw new Error("planted crash"); setTimeout(go, 10); }; setTimeout(go, 10);';
  const url = 'data:text/javascript,' + encodeURIComponent(plant);
  // Control: the same plant in a process with no handler crashes with Node's own exit 1.
  const bare = spawnSync(NODE, ['--import', url, '-e', ''], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
  assert.equal(bare.status, 1, 'the plant really crashes a process that has no handler: ' + bare.stderr);
  assert.match(bare.stderr, /planted crash/);
  for (const tool of Object.keys(TOOLS)) {
    const r = spawnSync(NODE, ['--import', url, TOOLS[tool], '--help'], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    assert.equal(r.status, 2, tool + ': ' + r.stdout + r.stderr);
    assert.equal(r.stdout.trimEnd().split('\n').pop(), 'UNKNOWN internal error: planted crash', tool);
  }
});

// ===== run-at-ref ===================================================================================
test('run-at-ref runs the suite at another ref: one AT line, validate.mjs\'s exit code, the checkout removed', t => {
  const fx = fixture(t);
  const at = (ref, log, extra = []) => cli(fx, 'run-at-ref', ['--repo', fx.repo.cwd, '--ref', ref, '--validate', fx.validate, '--log', path.join(fx.work, log), ...extra]);
  const older = at('HEAD~1', 'older.log');
  assert.deepEqual(older.lines, [`AT ${fx.short(fx.red)} FAIL tests 1 of 5 failed: extra two runs — log: ${older.log}`]);
  assert.equal(older.code, 1);
  assert.equal(older.logPaths, 1);
  const tip = at('HEAD', 'tip.log');
  assert.equal(tip.lines.length, 1);
  assert.match(tip.lines[0], new RegExp('^AT ' + fx.short(fx.green) + ' PASS tests 5/5 \\(\\d+s\\)$'));
  assert.equal(tip.code, 0);
  assert.notEqual(fx.short(fx.red), fx.short(fx.green));
  // --setup runs first, in the checkout; a setup that does not pass is UNKNOWN with exit 2.
  const gen = fx.json('gen-setup.json', { steps: [{ name: 'gen', argv: [NODE, '-e', "require('fs').writeFileSync('gen.test.cjs', \"require('node:test')('made by setup', () => {});\")"], parser: 'none' }] });
  const needsGen = fx.json('gen-validate.json', specOf([...TESTS, 'gen.test.cjs']));
  const setUp = cli(fx, 'run-at-ref', ['--repo', fx.repo.cwd, '--ref', 'HEAD', '--validate', needsGen, '--log', path.join(fx.work, 'gen.log'), '--setup', gen]);
  assert.match(setUp.lines[0], /^AT [0-9a-f]+ PASS tests 6\/6 \(\d+s\)$/);
  assert.equal(setUp.code, 0);
  const failing = fx.json('failing-setup.json', { steps: [{ name: 'gen', argv: [NODE, '-e', 'process.exit(3)'], parser: 'none' }] });
  const bad = at('HEAD', 'bad-setup.log', ['--setup', failing]);
  assert.deepEqual(bad.lines, [`AT ${fx.short(fx.green)} UNKNOWN setup FAIL gen exit 3 — log: ${bad.log}`]);
  assert.equal(bad.code, 2);
  const noRef = at('no-such-ref', 'no-ref.log');
  assert.deepEqual(noRef.lines, [`UNKNOWN ref no-such-ref names no commit in ${fx.repo.cwd}`]);
  assert.equal(noRef.code, 2);
});

test("run-at-ref passes on validate.mjs's UNKNOWN as exit 2 and its --timeout as a TIMEOUT line, exit 1", t => {
  const fx = fixture(t);
  const run = (spec, log, extra = []) => cli(fx, 'run-at-ref', ['--repo', fx.repo.cwd, '--ref', 'HEAD', '--validate', spec, '--log', path.join(fx.work, log), ...extra]);
  // A step whose command cannot start: validate.mjs's UNKNOWN, never "the suite failed".
  const absent = run(fx.json('absent-command.json', { steps: [{ name: 'tests', argv: ['no-such-command-for-run-at-ref', '--test'], parser: 'node' }] }), 'absent.log');
  assert.deepEqual(absent.lines, [`AT ${fx.short(fx.green)} UNKNOWN tests COULD-NOT-START (ENOENT) — log: ${absent.log}`]);
  assert.equal(absent.code, 2);
  // A step that would run a minute, stopped by --timeout 2.
  const slow = fx.json('slow.json', { steps: [{ name: 'tests', argv: [NODE, '-e', 'setTimeout(() => {}, 60000)'], parser: 'node' }] });
  const late = run(slow, 'slow.log', ['--timeout', '2']);
  assert.deepEqual(late.lines, [`AT ${fx.short(fx.green)} FAIL tests TIMEOUT after 2s — log: ${late.log}`]);
  assert.equal(late.code, 1);
  assert.ok(late.ms < 40000, 'the step was stopped, not waited out: ' + late.ms + 'ms');
});

test('run-at-ref refuses an invalid invocation with one UNKNOWN line and exit 2', async t => {
  const fx = fixture(t), { runAtRefCli } = await atRefApi();
  const tmp = fs.mkdtempSync(path.join(fx.repo.root, 'tmp-')), before = state(fx.repo), log = path.join(fx.work, 'never.log');
  const base = ['--repo', fx.repo.cwd, '--ref', 'HEAD', '--validate', fx.validate];
  let spawns = 0;
  for (const [label, argv, expected] of [
    ['no flags', [], /^UNKNOWN usage: unknown, missing or duplicate flag; use --help$/],
    ['a missing --log', base, /^UNKNOWN usage: unknown, missing or duplicate flag; use --help$/],
    ['a bad --timeout', [...base, '--log', log, '--timeout', '0'], /^UNKNOWN usage: --timeout must be/],
    ['an invalid --validate spec', ['--repo', fx.repo.cwd, '--ref', 'HEAD', '--validate', fx.json('bad-spec.json', { steps: [] }), '--log', log], /^UNKNOWN --validate: spec: /],
    ['an invalid --setup spec', [...base, '--log', log, '--setup', fx.json('bad-setup.json', { steps: [{ name: 'x' }] })], /^UNKNOWN --setup: spec: /],
    ['a --repo outside any work tree', ['--repo', fx.work, '--ref', 'HEAD', '--validate', fx.validate, '--log', log], /^UNKNOWN usage: not inside a git work tree: /],
    ['a --log inside the repository', [...base, '--log', path.join(fx.repo.cwd, 'at.log')], /^UNKNOWN usage: --log must lie outside the repository /],
    ['a --log that cannot be opened', [...base, '--log', fx.work], /^UNKNOWN cannot open log .* \(E[A-Z]+\)$/],
  ]) {
    const env = { GIT_CEILING_DIRECTORIES: fx.repo.root, TEMP: tmp, TMP: tmp, TMPDIR: tmp };
    const r = await withEnv(env, () => runAtRefCli(argv));
    assert.equal(r.code, 2, label + ': ' + r.line);
    assert.match(r.line, expected, label);
    assert.equal(fs.existsSync(log), false, label + ': no log was opened');
    if (label !== 'a --log inside the repository') continue;
    // One case spawned too: the process prints that line alone and exits 2.
    spawns++;
    const s = spawnSync(NODE, [TOOLS['run-at-ref'], ...argv], { cwd: fx.work, env: { ...fx.env, ...env }, encoding: 'utf8', windowsHide: true, timeout: 60000 });
    assert.deepEqual([s.status, s.stdout, s.stderr], [2, r.line + '\n', '']);
  }
  assert.equal(spawns, 1, 'the spawned case is in the table');
  assert.deepEqual(leftUnder(tmp), []);
  assert.deepEqual(state(fx.repo), before);
});

// ===== The declared line kinds, bound to what the runs above produced ================================
test('every line kind the tool declares was produced above, and no undeclared kind was', async () => {
  const { RESULTS, NOT_RUN } = await api();
  assert.deepEqual(RESULTS, ['KILLED', 'SURVIVED']);
  assert.deepEqual(NOT_RUN, ['ANCHOR-MISSING', 'ANCHOR-AMBIGUOUS', 'CONTROL FAILED', 'NOT-APPLIED', 'CRASHED', 'TIMEOUT', 'RESTORE-FAILED', 'UNKNOWN']);
  assert.deepEqual([...observed].sort(), [...RESULTS, ...NOT_RUN, 'CONTROL PASS', 'MUTATE'].sort(),
    'the runs in this file must produce every declared kind and nothing else');
});
