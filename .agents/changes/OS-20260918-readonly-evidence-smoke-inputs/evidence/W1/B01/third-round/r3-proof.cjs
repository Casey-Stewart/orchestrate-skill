const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const source = path.resolve(process.argv[2]);
const root = __dirname;
const parent = 'fac37a5163db2bd816ece3b68e936ab534b7f77d';
const production = 'orchestrate/tools/git-evidence.mjs';
const current = fs.readFileSync(path.join(source, production), 'utf8');
function git(args) {
  const r = spawnSync('git', ['-c', `safe.directory=${source.replaceAll('\\', '/')}`, ...args], { cwd: source, shell: false, windowsHide: true, maxBuffer: 16 * 1024 * 1024, timeout: 30000 });
  assert.ifError(r.error); assert.equal(r.status, 0, String(r.stderr)); return r.stdout;
}
fs.writeFileSync(path.join(root, 'before-r3-full-diff.patch'), git(['diff', 'codex/readonly-evidence-smoke-inputs-ledger...HEAD']));
fs.writeFileSync(path.join(root, 'prior-fix-diff.patch'), git(['diff', 'b3ce33eb35dab7ac43472faa0f90220ff32a48dd..' + parent]));
fs.writeFileSync(path.join(root, 'r3-working-diff.patch'), git(['diff', parent]));
function copiedTree(name, bytes) {
  const dir = fs.mkdtempSync(path.join(root, name + '-'));
  for (const file of ['tests/git-contract.test.cjs', 'tests/support/git-fixture.cjs']) {
    const dest = path.join(dir, file); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(path.join(source, file), dest);
  }
  const dest = path.join(dir, production); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, bytes);
  return dir;
}
function run(dir, pattern, file, failingNames) {
  const args = ['--test', '--test-reporter=spec', `--test-name-pattern=${pattern}`, 'tests/git-contract.test.cjs'];
  const r = spawnSync(process.execPath, args, { cwd: dir, shell: false, windowsHide: true, encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024 });
  fs.writeFileSync(path.join(root, file), `cwd: ${dir}\ncommand: node ${args.join(' ')}\nexit: ${r.status}\n${r.stdout}${r.stderr}`);
  assert.ifError(r.error); assert.equal(r.signal, null); assert.equal(r.status, 1, file + ' must reject the deficient production');
  for (const name of failingNames) assert.ok(r.stdout.includes(name), `Missing intended failing behavior: ${name}`);
  assert.match(r.stdout, /AssertionError/);
  return { cwd: dir, command: ['node', ...args], exit: r.status, report: path.join(root, file) };
}
const prior = copiedTree('pre-r3-production', git(['show', `${parent}:./${production}`]));
const baseProof = run(prior, 'dangling symbolic hints', 'r3-regressions-on-pre-r3.txt', ['refs/tags/missing', 'refs/custom/missing']);
const needle = "['config', '--includes', '--null', '--name-only', '--get-regexp', '^filter[.].*[.](clean|process)$']";
assert.equal(current.split(needle).length, 2, 'The mutation must affect exactly one prerequisite');
const mutated = current.replace(needle, () => "['config', '--local', '--includes', '--null', '--name-only', '--get-regexp', '^filter[.].*[.](clean|process)$']");
const mutant = copiedTree('local-only-production', mutated);
const mutationProof = run(mutant, 'global clean filters', 'r3-local-only-mutant.txt', ['global clean filters remain unknown and never execute through API or actual CLI']);
const report = { priorCommit: parent, mutation: 'Add only --local to the effective filter configuration inventory', baseProof, mutationProof };
fs.writeFileSync(path.join(root, 'r3-proof.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
