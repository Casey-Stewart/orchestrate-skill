// Generates C1's smoke inputs I-01 … I-09 (01-plan.md §Smoke-input inventory) into a NEW
// directory. Run from the integration worktree root:
//   node .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/generate-c1-inputs.mjs <new-out-dir>
// It refuses an existing output directory, so an issued issue-NNN is never overwritten.
// Node built-ins and git only. Everything written is LF; I-09's commits are pinned
// (author, committer, dates), so their SHAs are the same on every run.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const LEDGER = '.agents/changes/OS-20260923-mechanical-tools';
const out = process.argv[2];
if (!out || process.argv.length !== 3) { console.error('usage: generate-c1-inputs.mjs <new-out-dir>'); process.exit(2); }
if (fs.existsSync(out)) { console.error(`refusing: ${out} already exists`); process.exit(2); }
if (!fs.existsSync(path.join(LEDGER, '00-READBEFORE.md')) || !fs.existsSync('orchestrate/templates')) {
  console.error('run from the integration worktree root'); process.exit(2);
}
const read = p => fs.readFileSync(p, 'utf8');
const put = (rel, text) => { const f = path.join(out, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); };
const json = v => JSON.stringify(v, null, 2) + '\n';
const lines = (...l) => l.join('\n') + '\n';
const once = (text, find, replace, what) => {
  const n = text.split(find).length - 1;
  if (n !== 1) throw new Error(`${what}: anchor found ${n} times`);
  return text.replace(find, () => replace);
};

// ---- I-01: a suite with one passing and one failing test --------------------------------
put('I-01/one-fails.test.cjs', lines(
  "const test = require('node:test');",
  "const assert = require('node:assert/strict');",
  "test('fixture passes', () => { assert.equal(1 + 1, 2); });",
  "test('fixture fails on purpose', () => { assert.ok(false, 'this failure is the fixture'); });"));
put('I-01/spec.json', json({ steps: [{ name: 'tests', argv: ['node', '--test', '--test-reporter=spec', 'one-fails.test.cjs'], parser: 'node' }] }));

// ---- I-02: the contract's validation recipe as one pwsh step ----------------------------
const contract = read(path.join(LEDGER, '00-READBEFORE.md'));
const recipe = /## Validation commands\n\nRun from the designated worktree root in PowerShell:\n\n```powershell\n([\s\S]*?)```\n/.exec(contract);
if (!recipe) throw new Error('the contract\'s PowerShell recipe was not found');
put('I-02/spec.json', json({ steps: [{ name: 'tests', shell: 'pwsh', script: recipe[1], parser: 'node' }] }));

// ---- I-03: this ledger's top-level files, one path removed from B02's Files line ---------
for (const name of fs.readdirSync(LEDGER).filter(n => n.endsWith('.md')).sort()) {
  let text = read(path.join(LEDGER, name));
  if (name === '02-batches-02-ledger-parser.md') {
    const line = text.split('\n').find(l => l.startsWith('**Files**: '));
    const paths = line.slice('**Files**: '.length).split(', ');
    if (paths.length < 2) throw new Error('B02 Files line has fewer than two paths');
    text = once(text, line, '**Files**: ' + paths.slice(0, -1).join(', '), 'B02 Files line');
  }
  put('I-03/' + name, text);
}

// ---- I-04: a one-line contract pinning the skill with 64 zeros ---------------------------
put('I-04/00-READBEFORE.md', lines('**Skill**: `orchestrate` · sha256 `' + '0'.repeat(64) + '`'));

// ---- I-05: a ledger filled from the tip's templates --------------------------------------
const skillLine = execFileSync(process.execPath, ['orchestrate/tools/check-ledger.mjs', 'skill', '--dir', 'orchestrate'], { encoding: 'utf8' }).trim();
const skillHash = /^SKILL ([0-9a-f]{64}) \d+ files$/.exec(skillLine)?.[1];
if (!skillHash) throw new Error('unexpected skill line: ' + skillLine);
const CHANGE_ID = 'C1-20260924-smoke';
const v = {
  CHANGE_ID, LEDGER_DIR: '.agents/changes/' + CHANGE_ID, SKILL_DIR: 'orchestrate', SKILL_SHA256: skillHash,
  INTEGRATION_BRANCH: 'chore/c1-smoke-ledger', MAIN_BRANCH: 'main', WORKTREE_SETUP: 'n/a — no setup step',
  REPO_CONVENTIONS: '- Keep additions surgical.', EXTRA_PROHIBITIONS: 'Never touch `vendor/`.',
  VALIDATION_COMMANDS: '```sh\nnode --test\n```',
  BATCH_NUM: '01', BATCH_TITLE: 'Smoke batch', BATCH_TYPE: 'feature', BATCH_VERSION: '—', BATCH_BRANCH: 'feat/smoke-batch',
  BATCH_WAVE: '1', BATCH_WEIGHT: 'M', BATCH_DEPS: '—', BATCH_SMOKE_GATE: 'machine-verifiable — covered by C1',
  BATCH_FILES: '`src/a.js`, `tests/a.test.cjs`', BATCH_GUARDRAILS: 'a guard that samples its domain', BATCH_GATE: 'reviewer',
};
const fill = text => text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (t, key) => key in v ? v[key] : 'example-' + key.toLowerCase());
const strip = text => text.replace(/<!--[\s\S]*?-->/g, '');
const tpl = name => fill(read('orchestrate/templates/' + name));
const templates = fs.readdirSync('orchestrate/templates').sort();
const expected = ['00-READBEFORE.md', '00-request.md', '01-plan.md', '02-batch.md', 'LOG.md', 'PROGRESS.md'];
if (JSON.stringify(templates) !== JSON.stringify(expected)) throw new Error('template set changed: ' + templates.join(', '));
const withRow = (text, header, row) => {
  const l = text.split('\n'), head = l.findIndex(x => x.startsWith(header));
  if (head === -1) throw new Error('table header not found: ' + header);
  return [...l.slice(0, head + 2), row, ...l.slice(head + 2)].join('\n');
};
const batch = strip(tpl('02-batch.md')).replace(/(## Checklist\n)/, '$1\n- [ ] Implement it.\n');
const i05 = {
  '00-READBEFORE.md': tpl('00-READBEFORE.md'),
  '00-request.md': strip(tpl('00-request.md')),
  '01-plan.md': withRow(strip(tpl('01-plan.md')), '| # | Batch | Type |',
    '| B01 | Smoke batch | feature | M | `feat/smoke-batch` | 1 | `src/a.js`, `tests/a.test.cjs` | C1 | — |'),
  '02-batches-01-smoke-batch.md': batch,
  'PROGRESS.md': withRow(strip(tpl('PROGRESS.md')), '| # | Batch | Branch |',
    '| B01 | Smoke batch | `feat/smoke-batch` | 1 | — | ⬜ | 2026-09-24 | — |'),
  'LOG.md': strip(tpl('LOG.md')),
  'validate.json': json({ steps: [{ name: 'tests', argv: ['node', '--test'], parser: 'node' }] }),
};
// Stripping template comments leaves blank lines at EOF; `git diff --check` refuses them.
const tidy = t => t.replace(/[ \t]+$/gm, '').replace(/\n*$/, '\n');
for (const [name, text] of Object.entries(i05)) put('I-05/' + name, tidy(text));

// ---- I-06: I-05's contract with one hex digit of the pin changed -------------------------
const flipped = skillHash.slice(0, -1) + (skillHash.endsWith('0') ? '1' : '0');
put('I-06/00-READBEFORE.md', once(tidy(i05['00-READBEFORE.md']), 'sha256 `' + skillHash + '`', 'sha256 `' + flipped + '`', 'I-05 pin'));

// ---- I-07 / I-08: implementer facts, and the same without worktreePath -------------------
const facts = { repoPath: '/c1-smoke/repo', worktreePath: '/c1-smoke/worktree', scratchpadPath: '/c1-smoke/scratchpad', guardrails: 'none' };
put('I-07/facts.json', json(facts));
const { worktreePath, ...noWorktree } = facts;
put('I-08/facts.json', json(noWorktree));

// ---- I-09: a two-commit fixture repository as a bundle, with its mutations ---------------
const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'c1-i09-'));
try {
  const env = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_'))),
    GIT_AUTHOR_NAME: 'C1 Fixture', GIT_AUTHOR_EMAIL: 'c1@fixture.invalid', GIT_COMMITTER_NAME: 'C1 Fixture', GIT_COMMITTER_EMAIL: 'c1@fixture.invalid',
    GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: os.devNull };
  const git = (args, date) => execFileSync('git', ['-c', 'core.autocrlf=false', '-c', 'commit.gpgsign=false', ...args],
    { cwd: repo, env: date ? { ...env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : env, encoding: 'utf8' });
  git(['init', '--quiet', '--initial-branch=main']);
  const lib = lines('// Adds two numbers.', 'function add(a, b) { return a + b; }', 'module.exports = { add };');
  const test1 = lines("const test = require('node:test');", "const assert = require('node:assert/strict');",
    "const { add } = require('./lib.cjs');", "test('add sums two numbers', () => { assert.equal(add(2, 3), 5); });");
  const test2 = test1 + lines("test('add is exported as a function', () => { assert.equal(typeof add, 'function'); });");
  fs.writeFileSync(path.join(repo, 'lib.cjs'), lib); fs.writeFileSync(path.join(repo, 'lib.test.cjs'), test1);
  git(['add', '-A']); git(['commit', '--quiet', '-m', 'add with one test'], '2026-09-24T12:00:00Z');
  fs.writeFileSync(path.join(repo, 'lib.test.cjs'), test2);
  git(['add', '-A']); git(['commit', '--quiet', '-m', 'a second test'], '2026-09-24T12:01:00Z');
  const head = git(['rev-parse', 'HEAD']).trim(), prev = git(['rev-parse', 'HEAD~1']).trim();
  fs.mkdirSync(path.join(out, 'I-09'), { recursive: true });
  git(['bundle', 'create', '--quiet', path.resolve(out, 'I-09/fixture.bundle'), 'HEAD', 'main']);
  put('I-09/validate.json', json({ steps: [{ name: 'tests', argv: ['node', '--test', '--test-reporter=spec', 'lib.test.cjs'], parser: 'node' }] }));
  put('I-09/muts.json', json({ mutations: [
    { id: 'm1', file: 'lib.cjs', find: 'a + b', replace: 'a - b' },
    { id: 'm2', file: 'lib.cjs', find: '// Adds two numbers.', replace: '// Returns the sum of two numbers.' }] }));
  put('I-09/muts-bad-anchor.json', json({ mutations: [{ id: 'm3', file: 'lib.cjs', find: 'a * b', replace: 'a / b' }] }));
  put('I-09/README.md', lines(
    '# I-09 — mutation fixture', '',
    '`fixture.bundle` holds branch `main` of a two-commit repository:', '',
    `- \`HEAD~1\` = \`${prev}\` (short \`${prev.slice(0, 7)}\`): \`lib.cjs\` and \`lib.test.cjs\` with the one test \`add sums two numbers\`.`,
    `- \`HEAD\` = \`${head}\` (short \`${head.slice(0, 7)}\`): adds the test \`add is exported as a function\`.`, '',
    'Working copy: `git clone <I-09>/fixture.bundle <scratch>/c1-fixture`; reset = delete that clone and clone again.', '',
    'Expected with `validate.json` (one step `tests`, parser `node`):', '',
    '- run directly, or through `run-at-ref.mjs`, at `HEAD`: `PASS tests 2/2`; at `HEAD~1`: `PASS tests 1/1`.',
    `- \`run-at-ref.mjs --ref HEAD~1\`: one line beginning \`AT ${prev.slice(0, 7)} PASS tests 1/1\`, exit 0.`,
    '- `mutate.mjs --mutations muts.json` at `HEAD`: `CONTROL PASS PASS tests 2/2 …`, `KILLED m1: add sums two numbers`, `SURVIVED m2`,',
    '  `MUTATE 1 killed, 1 survived, 0 other`; exit 1.',
    '- `mutate.mjs --mutations muts-bad-anchor.json`: exactly one line, `ANCHOR-MISSING m3`; exit 2.'));
} finally {
  fs.rmSync(repo, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 });
}
put('I-09/generate-c1-inputs.mjs', read(new URL(import.meta.url)));
console.log(`generated I-01 … I-09 under ${out}`);
