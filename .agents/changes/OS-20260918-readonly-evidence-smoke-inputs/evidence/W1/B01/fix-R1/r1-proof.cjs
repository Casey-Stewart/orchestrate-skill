const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const source = process.argv[2], scratch = __dirname;
const original = 'b3ce33eb35dab7ac43472faa0f90220ff32a48dd';
const files = ['orchestrate/tools/git-evidence.mjs', 'orchestrate/tools/check-fence.mjs', 'tests/git-contract.test.cjs', 'tests/check-fence.test.cjs', 'tests/support/git-fixture.cjs'];
function mirror(name, baseline) {
  const root = path.join(scratch, name); fs.mkdirSync(root, { recursive: true });
  for (const file of files) {
    const destination = path.join(root, file); fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (baseline && file.startsWith('orchestrate/')) {
      const r = spawnSync('git', ['--no-optional-locks', 'show', `${original}:${file}`], { cwd: source, shell: false, windowsHide: true, timeout: 15000 });
      assert.ifError(r.error); assert.equal(r.status, 0); fs.writeFileSync(destination, r.stdout);
    } else fs.copyFileSync(path.join(source, file), destination);
  }
  return root;
}
function run(name, root, pattern) {
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=spec', `--test-name-pattern=${pattern}`, 'tests/git-contract.test.cjs', 'tests/check-fence.test.cjs'], { cwd: root, shell: false, windowsHide: true, timeout: 120000, maxBuffer: 8 * 1024 * 1024, encoding: 'utf8' });
  assert.ifError(r.error); fs.writeFileSync(path.join(scratch, `${name}.txt`), r.stdout + r.stderr); assert.equal(r.status, 1, `${name} must reject old/mutated production code`); return r.stdout;
}
const old = mirror('r1-original-production', true);
const oldOutput = run('r1-regressions-on-original', old, 'configured clean|malformed loose|T statuses|submodule status|configured filters|type dirt');
for (const required of ['configured clean and process filters', 'malformed loose refs', 'staged and unstaged T statuses', 'configured filters leave the fence', 'staged and unstaged type dirt']) assert.ok(oldOutput.includes(required));
const mutant = mirror('r1-no-worktree-race', false), file = path.join(mutant, 'orchestrate/tools/check-fence.mjs');
const before = fs.readFileSync(file, 'utf8'); const line = before.split('\n').find(l => l.includes("if (JSON.stringify(associated) !== JSON.stringify(afterCandidate))")); assert.ok(line); fs.writeFileSync(file, before.replace(line, ''));
const raceOutput = run('r1-late-race-mutant', mutant, 'late real working-file mutation'); assert.match(raceOutput, /'PASS' !== 'UNKNOWN'|actual:[\s\S]*PASS/);
console.log(JSON.stringify({ original, oldProductionExit: 1, lateRaceMutantExit: 1, proofDirectory: scratch }));
