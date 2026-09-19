const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const source = process.argv[2];
const target = path.join(__dirname, 'local-only-mutant');
const files = ['orchestrate/tools/git-evidence.mjs', 'orchestrate/tools/check-fence.mjs', 'tests/git-contract.test.cjs', 'tests/check-fence.test.cjs', 'tests/support/git-fixture.cjs'];
for (const file of files) {
  const destination = path.join(target, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(source, file), destination);
}
const prodFile = path.join(target, files[0]);
const before = fs.readFileSync(prodFile, 'utf8');
const original = "['config', '--includes', '--null', '--name-only', '--get-regexp', '^filter[.].*[.](clean|process)$']";
const changed = "['config', '--local', '--includes', '--null', '--name-only', '--get-regexp', '^filter[.].*[.](clean|process)$']";
assert.equal(before.split(original).length, 2);
fs.writeFileSync(prodFile, before.replace(original, () => changed));

async function proof() {
  const { makeRepo } = require(path.join(source, 'tests/support/git-fixture.cjs'));
  const cleanup = [];
  const repo = makeRepo({ after(fn) { cleanup.push(fn); } });
  try {
    repo.write('.gitattributes', 'filtered.txt filter=marker\n');
    repo.write('filtered.txt', 'before\n'); repo.commit('before filter configuration');
    const marker = path.join(repo.cwd, 'global-filter-ran');
    const driver = path.join(repo.root, 'global-filter.cjs');
    fs.writeFileSync(driver, `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'executed'); process.stdin.pipe(process.stdout);`);
    repo.git('config', '--file', repo.env.GIT_CONFIG_GLOBAL, 'filter.marker.clean', `node "${driver.replaceAll('\\', '/')}"`);
    repo.write('filtered.txt', 'after!\n'); fs.utimesSync(path.join(repo.cwd, 'filtered.txt'), new Date(0), new Date(0));
    const options = { repo: repo.cwd, env: repo.env };
    const actual = await import(pathToFileURL(path.join(source, files[0])).href);
    const mutant = await import(pathToFileURL(prodFile).href);
    const snapshot = repo.snapshot();
    const candidate = actual.worktrees(options);
    const candidateCli = repo.cli('git-evidence.mjs', ['worktrees', '--repo', repo.cwd]);
    assert.equal(candidate.evidence.worktrees[0].cleanliness, 'unknown');
    assert.ok(candidate.diagnostics.some(d => d.code === 'unsafe-filter'));
    assert.equal(candidateCli.status, 2);
    assert.equal(fs.existsSync(marker), false);
    assert.deepEqual(repo.snapshot(), snapshot);
    const mutated = mutant.worktrees(options);
    assert.equal(mutated.completeness, 'complete');
    assert.equal(mutated.evidence.worktrees[0].cleanliness, 'dirty');
    assert.equal(fs.readFileSync(marker, 'utf8'), 'executed');
    const report = { candidate, candidateCli: candidateCli.json, mutant: mutated, mutation: changed, marker: 'global clean filter wrote global-filter-ran only in the mutant' };
    fs.writeFileSync(path.join(__dirname, 'config-scope-probe.json'), JSON.stringify(report, null, 2));
    console.log('Independent global configuration probe: candidate UNKNOWN without mutation; local-only mutant executes clean filter.');
  } finally { for (const fn of cleanup) fn(); }
}

proof().then(() => {
  const result = spawnSync(process.execPath, ['--test', '--test-reporter=spec', 'tests/git-contract.test.cjs', 'tests/check-fence.test.cjs'], {
    cwd: target, env: process.env, shell: false, windowsHide: true, timeout: 360000, maxBuffer: 16 * 1024 * 1024, encoding: 'utf8',
  });
  fs.writeFileSync(path.join(__dirname, 'local-only-mutant-tests.txt'), result.stdout + result.stderr);
  assert.ifError(result.error); assert.equal(result.signal, null); assert.equal(result.status, 0);
  console.log(result.stdout.split(/\r?\n/).slice(-10).join('\n'));
  console.log('Local-only configuration mutation survived both complete B01 suites.');
}).catch(error => { console.error(error); process.exitCode = 1; });
