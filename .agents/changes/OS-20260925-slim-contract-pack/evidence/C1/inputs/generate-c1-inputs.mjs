// Generates the C1 smoke inputs of OS-20260925-slim-contract-pack as git bundles.
// Usage (from the repository root): node <this file> <new-output-dir>
// I-01: a classifier fixture — c0, c1 (a comment-only edit in both comment forms), c2 (a
//       one-character code change in the same file).
// I-02: a decoy repository — one commit, a distinctive path name.
// I-03: a repository holding ledger OS-20260101-fixture filled from the checkout's slimmed
//       templates, plus facts.json for prompt.mjs's implementer role.
// I-04: the shipped residual BL-046 — c0, c1 (a ` // gitleaks:allow` directive appended to a
//       code line, which the classifier reads as prose).
// Commits carry fixed identities and dates, so their SHAs are reproducible.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const out = process.argv[2];
if (!out || process.argv.length !== 3) { console.error('usage: generate-c1-inputs.mjs <new-output-dir>'); process.exit(2); }
if (fs.existsSync(out)) { console.error('refusing to overwrite ' + out); process.exit(2); }
const ROOT = process.cwd();
if (!fs.existsSync(path.join(ROOT, 'orchestrate/templates/00-READBEFORE.md'))) { console.error('run from the repository root'); process.exit(2); }

// A child git sees no inherited repository variable and no user or system config.
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^GIT_/i.test(k)));
Object.assign(env, { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: path.join(out, '.no-global-config'),
  GIT_AUTHOR_NAME: 'C1 Fixture', GIT_AUTHOR_EMAIL: 'c1-fixture@example.invalid',
  GIT_COMMITTER_NAME: 'C1 Fixture', GIT_COMMITTER_EMAIL: 'c1-fixture@example.invalid' });
function git(cwd, args, date) {
  const e = date ? { ...env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : env;
  const r = spawnSync('git', args, { cwd, env: e, encoding: 'utf8' });
  if (r.status !== 0) { console.error('git ' + args.join(' ') + ' failed in ' + cwd + ':\n' + r.stderr); process.exit(1); }
  return r.stdout.trim();
}
function repo(dir) {
  fs.mkdirSync(dir, { recursive: true });
  git(dir, ['init', '-q', '-b', 'main']);
  git(dir, ['config', 'core.autocrlf', 'false']);
  return dir;
}
function commit(dir, message, date) {
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', message], date);
  return git(dir, ['rev-parse', 'HEAD']);
}

fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, '.no-global-config'), '');
const work = path.join(out, '.work');
const shas = {};

// ---- I-01 -------------------------------------------------------------------------------
const i01 = repo(path.join(work, 'i01'));
const c0 = [
  '// Sums the order lines of one invoice.',
  '/* The total is rounded to cents',
  '   only at the very end. */',
  'export function total(lines) {',
  '  let sum = 0; // running sum in cents',
  '  for (const line of lines) sum += line.qty * line.cents;',
  '  return sum / 100;',
  '}',
  '',
].join('\n');
const c1 = c0
  .replace('// Sums the order lines of one invoice.', '// Adds up every order line of a single invoice.')
  .replace('/* The total is rounded to cents\n   only at the very end. */', '/* Rounding to cents happens\n   once, at the very end. */')
  .replace('// running sum in cents', '// the running total, in cents');
const c2 = c1.replace('return sum / 100;', 'return sum / 10;');
if (c1 === c0 || c2 === c1 || c2.length !== c1.length - 1) { console.error('I-01 edit anchors missing'); process.exit(1); }
fs.writeFileSync(path.join(i01, 'invoice.mjs'), c0);
shas.i01 = { c0: commit(i01, 'c0: invoice total', '2026-01-01T00:00:00Z') };
fs.writeFileSync(path.join(i01, 'invoice.mjs'), c1);
shas.i01.c1 = commit(i01, 'c1: comment-only rewording, both comment forms', '2026-01-01T00:01:00Z');
fs.writeFileSync(path.join(i01, 'invoice.mjs'), c2);
shas.i01.c2 = commit(i01, 'c2: one-character code change', '2026-01-01T00:02:00Z');

// ---- I-02 -------------------------------------------------------------------------------
const i02 = repo(path.join(work, 'i02'));
fs.writeFileSync(path.join(i02, 'DECOY-REPOSITORY-zq7x.txt'), 'This repository is a decoy. Evidence naming this file read the wrong repository.\n');
shas.i02 = { head: commit(i02, 'decoy: the only commit', '2026-01-01T00:00:00Z') };

// ---- I-03 -------------------------------------------------------------------------------
const i03 = repo(path.join(work, 'i03'));
const ID = 'OS-20260101-fixture', LEDGER = '.agents/changes/' + ID;
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const values = {
  CHANGE_ID: ID, LEDGER_DIR: LEDGER, SKILL_DIR: '/opt/fixture-skill/orchestrate', SKILL_SHA256: 'ab'.repeat(32),
  SKILL_SOURCE: 'unknown', INTEGRATION_BRANCH: 'chore/fixture-ledger', WORKTREE_SETUP: 'npm ci --no-audit',
  MAIN_BRANCH: 'main', BATCH_NUM: '01', BATCH_TITLE: 'Fixture batch', BATCH_TYPE: 'feature', BATCH_VERSION: '—',
  BATCH_BRANCH: 'feat/fixture-batch', BATCH_FILES: '`src/a.js`, `tests/a.test.cjs`',
  BATCH_GUARDRAILS: 'a guard that samples its domain',
  VALIDATION_COMMANDS: '```sh\nnode --test\n```',
};
const fill = text => text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (t, k) => k in values ? values[k] : 'fixture-' + k.toLowerCase().replace(/_/g, '-'));
const strip = text => text.replace(/<!--[\s\S]*?-->/g, '');
const withRow = (text, prefix, row) => {
  const lines = text.split('\n'), head = lines.findIndex(l => l.startsWith(prefix));
  if (head === -1) { console.error('I-03: no table starting ' + prefix); process.exit(1); }
  return [...lines.slice(0, head + 2), row, ...lines.slice(head + 2)].join('\n');
};
const templates = fs.readdirSync(path.join(ROOT, 'orchestrate/templates')).sort();
const expected = ['00-READBEFORE.md', '00-request.md', '01-plan.md', '02-batch.md', 'LOG.md', 'PROGRESS.md'];
if (JSON.stringify(templates) !== JSON.stringify(expected)) { console.error('I-03: unexpected template set ' + templates.join(',')); process.exit(1); }
const ledgerDir = path.join(i03, ...LEDGER.split('/'));
fs.mkdirSync(ledgerDir, { recursive: true });
const tpl = name => fill(read('orchestrate/templates/' + name));
const files = {
  '00-READBEFORE.md': tpl('00-READBEFORE.md'),
  '00-request.md': strip(tpl('00-request.md')),
  '01-plan.md': withRow(strip(tpl('01-plan.md')), '| # | Batch |', '| B01 | Fixture batch | feature | M | `feat/fixture-batch` | 1 | `src/a.js`, `tests/a.test.cjs` | C1 | — |'),
  'PROGRESS.md': withRow(strip(tpl('PROGRESS.md')), '| # | Batch | Branch |', '| B01 | Fixture batch | `feat/fixture-batch` | 1 | — | ⬜ | 2026-01-01 | — |'),
  'LOG.md': strip(tpl('LOG.md')),
  '02-batches-01-fixture-batch.md': strip(tpl('02-batch.md')).replace(/(## Checklist\n)/, '$1\n- [ ] Implement it.\n'),
};
for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(ledgerDir, name), text);
fs.writeFileSync(path.join(i03, 'CLAUDE.md'), '# Fixture project\n\n## Bug-class guardrails\n\n- Fixture guardrail: assert on the domain, not a sample.\n');
fs.writeFileSync(path.join(i03, 'facts.json'), JSON.stringify({
  repoPath: '../c1-scratch/i03', worktreePath: '../c1-scratch/i03', scratchpadPath: '../c1-scratch/scratch',
  guardrails: { file: 'CLAUDE.md', heading: '## Bug-class guardrails' },
}, null, 2) + '\n');
shas.i03 = { head: commit(i03, 'fixture ledger ' + ID + ' from the slimmed templates', '2026-01-01T00:00:00Z') };

// ---- I-04 -------------------------------------------------------------------------------
const i04 = repo(path.join(work, 'i04'));
const t0 = '// The name of the header the client sends its token in.\nexport const TOKEN_HEADER = \'x-client-token\';\n';
const t1 = t0.replace("x-client-token\';", "x-client-token\'; // gitleaks:allow");
if (t1 === t0) { console.error('I-04 edit anchor missing'); process.exit(1); }
fs.mkdirSync(path.join(i04, 'lib'));
fs.writeFileSync(path.join(i04, 'lib', 'token.mjs'), t0);
shas.i04 = { c0: commit(i04, 'c0: the token header name', '2026-01-01T00:00:00Z') };
fs.writeFileSync(path.join(i04, 'lib', 'token.mjs'), t1);
shas.i04.c1 = commit(i04, 'c1: a secret-scanner allowlist directive appended', '2026-01-01T00:01:00Z');

// ---- bundles ------------------------------------------------------------------------------
for (const name of ['i01', 'i02', 'i03', 'i04']) git(path.join(work, name), ['bundle', 'create', '-q', path.join(path.resolve(out), name + '.bundle'), 'HEAD', 'main']);
fs.writeFileSync(path.join(out, 'shas.json'), JSON.stringify(shas, null, 2) + '\n');
fs.rmSync(work, { recursive: true, force: true });
fs.rmSync(path.join(out, '.no-global-config'));
console.log(JSON.stringify(shas));
