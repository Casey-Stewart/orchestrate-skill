// Generates C1's issue-002 smoke inputs I-10 … I-12 — the C1 fail scenarios (verdict log,
// 2026-09-25) — into a NEW directory. issue-001 (I-01 … I-09) is issued and never regenerated.
// Run from the integration worktree root:
//   node .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/generate-c1-inputs-002.mjs <new-out-dir>
// Every skip condition reads a production switch, never the platform, so each input behaves
// the same on Linux and Windows. I-12's commits are pinned (author, committer, dates).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const out = process.argv[2];
if (!out || process.argv.length !== 3) { console.error('usage: generate-c1-inputs-002.mjs <new-out-dir>'); process.exit(2); }
if (fs.existsSync(out)) { console.error(`refusing: ${out} already exists`); process.exit(2); }
if (!fs.existsSync('.agents/changes/OS-20260923-mechanical-tools/00-READBEFORE.md')) { console.error('run from the integration worktree root'); process.exit(2); }
const put = (rel, text) => { const f = path.join(out, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); };
const json = v => JSON.stringify(v, null, 2) + '\n';
const lines = (...l) => l.join('\n') + '\n';
const spec = files => json({ steps: [{ name: 'tests', argv: ['node', '--test', '--test-reporter=spec', ...files], parser: 'node' }] });
const HEAD = ["const test = require('node:test');", "const assert = require('node:assert/strict');"];

// ---- I-10: a suite whose only test is skipped (the user's report, validate side) ---------
put('I-10/skip-only.test.cjs', lines(...HEAD,
  'const FEATURE_ON = false;',
  "test('feature adds', { skip: !FEATURE_ON && 'feature off' }, () => { assert.equal(1 + 1, 2); });"));
put('I-10/spec.json', spec(['skip-only.test.cjs']));

// ---- I-11: a test file that registers no tests, beside a real one -------------------------
put('I-11/empty.test.cjs', lines(...HEAD, 'const ROWS = [];', "for (const r of ROWS) test('row ' + r, () => { assert.ok(r); });"));
put('I-11/one.test.cjs', lines(...HEAD, "test('real one', () => { assert.equal(2 * 2, 4); });"));
put('I-11/spec.json', spec(['empty.test.cjs', 'one.test.cjs']));

// ---- I-12: a one-commit fixture repository for the three mutate scenarios -----------------
const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'c1-i12-'));
try {
  const env = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_'))),
    GIT_AUTHOR_NAME: 'C1 Fixture', GIT_AUTHOR_EMAIL: 'c1@fixture.invalid', GIT_COMMITTER_NAME: 'C1 Fixture', GIT_COMMITTER_EMAIL: 'c1@fixture.invalid',
    GIT_AUTHOR_DATE: '2026-09-25T12:00:00Z', GIT_COMMITTER_DATE: '2026-09-25T12:00:00Z', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: os.devNull };
  const git = args => execFileSync('git', ['-c', 'core.autocrlf=false', '-c', 'commit.gpgsign=false', ...args], { cwd: repo, env, encoding: 'utf8' });
  git(['init', '--quiet', '--initial-branch=main']);
  const files = {
    'lib.cjs': lines('function add(a, b) { return a + b; }', 'const FEATURE_ON = false;', "const MODE = 'full';", 'const ROWS = [[2, 3, 5]];',
      'module.exports = { add, FEATURE_ON, MODE, ROWS };'),
    // (a) the only test is skipped: the control passes nothing.
    'feature.test.cjs': lines(...HEAD, "const { add, FEATURE_ON } = require('./lib.cjs');",
      "test('feature adds', { skip: !FEATURE_ON && 'feature off' }, () => { assert.equal(add(2, 3), 5); });"),
    // (b) one data-driven test; emptying ROWS leaves the file registering no tests.
    'rows.test.cjs': lines(...HEAD, "const { add, ROWS } = require('./lib.cjs');",
      "for (const [a, b, sum] of ROWS) test('row ' + a + '+' + b, () => { assert.equal(add(a, b), sum); });"),
    // (f) two tests; switching MODE to lite skips the second: the total holds, the skipped count moves.
    'flip.test.cjs': lines(...HEAD, "const { add, MODE } = require('./lib.cjs');",
      "test('plain adds', () => { assert.equal(add(1, 1), 2); });",
      "test('full mode adds', { skip: MODE === 'lite' && 'lite mode' }, () => { assert.equal(add(2, 2), 4); });"),
  };
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(repo, name), text);
  git(['add', '-A']); git(['commit', '--quiet', '-m', 'C1 fail-scenario fixture']);
  const head = git(['rev-parse', 'HEAD']).trim();
  fs.mkdirSync(path.join(out, 'I-12'), { recursive: true });
  git(['bundle', 'create', '--quiet', path.resolve(out, 'I-12/fixture.bundle'), 'HEAD', 'main']);
  put('I-12/validate-a.json', spec(['feature.test.cjs']));
  put('I-12/validate-b.json', spec(['rows.test.cjs']));
  put('I-12/validate-f.json', spec(['flip.test.cjs']));
  put('I-12/muts-a.json', json({ mutations: [{ id: 'a1', file: 'lib.cjs', find: 'return a + b;', replace: 'return a - b;' }] }));
  put('I-12/muts-b.json', json({ mutations: [{ id: 'e1', file: 'lib.cjs', find: 'const ROWS = [[2, 3, 5]];', replace: 'const ROWS = [];' }] }));
  put('I-12/muts-f.json', json({ mutations: [{ id: 'f1', file: 'lib.cjs', find: "const MODE = 'full';", replace: "const MODE = 'lite';" }] }));
  put('I-12/README.md', lines(
    '# I-12 — C1 fail-scenario fixture', '',
    `\`fixture.bundle\` holds branch \`main\`, one commit \`${head}\` (short \`${head.slice(0, 7)}\`).`, '',
    'Working copy: `git clone <I-12>/fixture.bundle <scratch>/c1-fail-fixture`; reset = delete that clone and clone again.', '',
    'Expected through `mutate.mjs --ref HEAD` (skip conditions read production switches, never the platform):', '',
    '- (a) `--validate validate-a.json --mutations muts-a.json`: exactly one line, `CONTROL FAILED FAIL tests no test passed (0/1, 1 skipped) — log: <log>`; exit 2; no mutation applied.',
    '- (b) `--validate validate-b.json --mutations muts-b.json`: `CONTROL PASS PASS tests 1/1 (…)`, then a line beginning `CRASHED e1: FAIL tests 1 of 1 failed: rows.test.cjs (ran no tests)`, then `MUTATE 0 killed, 0 survived, 1 other`; exit 2.',
    '- (f) `--validate validate-f.json --mutations muts-f.json`: `CONTROL PASS PASS tests 2/2 (…)`, then a line beginning `CRASHED f1: PASS tests 1/2, 1 skipped`, then `MUTATE 0 killed, 0 survived, 1 other`; exit 2; the log records `1 test skipped that ran in the control`.'));
} finally {
  fs.rmSync(repo, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 });
}
put('I-12/generate-c1-inputs-002.mjs', fs.readFileSync(new URL(import.meta.url), 'utf8'));
console.log(`generated I-10 … I-12 under ${out}`);
