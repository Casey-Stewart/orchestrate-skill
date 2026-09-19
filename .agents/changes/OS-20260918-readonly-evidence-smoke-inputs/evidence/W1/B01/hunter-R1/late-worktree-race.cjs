const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');
const { makeRepo, LEDGER } = require('./mutant/tests/support/git-fixture.cjs');
const BATCHFILE = `${LEDGER}/02-batches-01-work.md`;

for (const [kind, modulePath, expected] of [
  ['candidate', '../wt-B01/orchestrate/tools/check-fence.mjs', 'UNKNOWN'],
  ['mutant', './mutant/orchestrate/tools/check-fence.mjs', 'PASS'],
]) test(`late working-file race: ${kind}`, async t => {
  const { checkFence } = await import(pathToFileURL(path.resolve(__dirname, modulePath)).href);
  const repo = makeRepo(t);
  repo.write(`${LEDGER}/01-plan.md`, '# Plan\n\n| # | Batch | Branch | Files (fence) |\n|---|---|---|---|\n| B01 | Work | batch-one | `allowed.txt` |\n');
  repo.write(`${LEDGER}/PROGRESS.md`, '# Progress\n\n## Batches\n\n| # | Branch | Notes |\n|---|---|---|\n| B01 | batch-one | — |\n\n## Session log\n\n| Date | Detail |\n|---|---|\n');
  repo.write(BATCHFILE, '# B01 — Work (feature, —)\n\n**Branch**: `batch-one`\n**Files**: `allowed.txt`\n\n## Checklist\n\n- [ ] Implement behavior.\n\n## Acceptance\n\nPreserve this text.\n');
  repo.write('allowed.txt', 'original');
  repo.commit('authority');
  repo.git('branch', 'integration');
  const wt = path.join(repo.root, 'batch-worktree');
  repo.git('worktree', 'add', '-b', 'batch-one', wt);
  const candidate = repo.at(wt), originalStat = fs.statSync;
  let observations = 0;
  fs.statSync = function (file, ...args) {
    if (path.resolve(file) === path.resolve(wt) && ++observations === 2)
      candidate.write('allowed.txt', 'concurrent uncommitted update');
    return originalStat.call(this, file, ...args);
  };
  let result;
  try {
    result = checkFence({ repo: repo.cwd, integration: 'refs/heads/integration', batch: 'refs/heads/batch-one', ledger: 'FIXTURE', 'batch-id': 'B01', 'batch-file': BATCHFILE, env: repo.env });
  } finally { fs.statSync = originalStat; }
  assert.equal(observations, 2);
  assert.equal(result.status, expected, JSON.stringify(result));
  assert.match(candidate.git('status', '--porcelain'), /M allowed\.txt/);
  if (kind === 'candidate') assert.ok(result.unknowns.some(d => d.code === 'worktree-race'));
  else { assert.deepEqual(result.unknowns, []); assert.deepEqual(result.violations, []); }
  console.log(JSON.stringify({ kind, status: result.status, codes: result.unknowns.map(d => d.code), actualDirt: candidate.git('status', '--porcelain') }));
});
