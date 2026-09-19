const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const [source, run, base] = process.argv.slice(2);
assert(source && run && base, 'source, run directory, base required');
const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const write = (p, bytes) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, bytes); };
const config = path.join(run, 'empty-gitconfig');
write(config, '');
const environment = { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_SYSTEM: config,
  GIT_CONFIG_GLOBAL: config, GIT_ATTR_NOSYSTEM: '1', HOME: path.join(run, 'home'),
  XDG_CONFIG_HOME: path.join(run, 'home', '.config') };
for (const key of Object.keys(environment)) {
  if (/^GIT_CONFIG_(COUNT|KEY_\d+|VALUE_\d+)$/.test(key) ||
      ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_COMMON_DIR'].includes(key)) delete environment[key];
}
const commands = [];
function git(cwd, ...args) {
  const argv = ['-c', 'core.longpaths=true', '-c', 'core.attributesFile=' + config, '-c', 'core.excludesFile=' + config, ...args];
  const result = spawnSync('git', argv, { cwd, env: environment, encoding: 'utf8', windowsHide: true });
  commands.push({ cwd, command: ['git', ...argv], exit: result.status, stdout: result.stdout, stderr: result.stderr });
  assert.equal(result.status, 0, JSON.stringify(commands.at(-1), null, 2));
  return result.stdout.trim();
}
const files = ['orders.xlsx', 'orders.requirements.json', 'generate-orders.py', 'validate-orders.py'];
const fixture = 'tests/fixtures/smoke-inputs';
const attrs = ['text', 'eol', 'filter', 'ident', 'working-tree-encoding', 'diff', 'merge'];
const outside = ['orchestrate/tools/git-evidence.mjs', 'orchestrate/tools/check-fence.mjs',
  'tests/git-contract.test.cjs', 'tests/check-fence.test.cjs', 'tests/support/git-fixture.cjs',
  '.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/02-batches-01-readonly-evidence.md',
  'orchestrate/SKILL.md', 'tests/smoke-page.test.cjs'];
const tip = git(source, 'rev-parse', 'HEAD');
assert.equal(git(source, 'status', '--porcelain'), '', 'candidate must be clean');
const beforeRecords = JSON.parse(fs.readFileSync(path.join(__dirname, 'outside-before.json'), 'utf8').replace(/^\uFEFF/, ''));
for (const record of beforeRecords) assert.equal(fs.existsSync(path.join(source, record.path)) ? sha(path.join(source, record.path)).toUpperCase() : 'absent', record.hash);
const originalAttrs = fs.readFileSync(path.join(__dirname, 'attributes-before.txt'), 'utf8').replace(/^\uFEFF/, '').trim().replace(/\r\n/g, '\n');
assert.equal(git(source, 'check-attr', ...attrs, '--', ...outside).replace(/\r\n/g, '\n'), originalAttrs, 'all actual B01/control attributes unchanged');

function freshClone(name, repository, commit) {
  const destination = path.join(run, name);
  git(run, 'clone', '--no-checkout', '--no-hardlinks', repository, destination);
  git(destination, 'config', '--local', 'core.autocrlf', 'true');
  assert.equal(git(destination, 'config', '--get', 'core.autocrlf'), 'true');
  git(destination, 'checkout', '--detach', commit);
  assert.equal(git(destination, 'rev-parse', 'HEAD'), commit);
  assert.equal(git(destination, 'status', '--porcelain'), '');
  return destination;
}
const candidate = freshClone('candidate-checkout', source, tip);
const baseline = freshClone('baseline-checkout', source, base);
assert.equal(git(candidate, 'check-attr', ...attrs, '--', ...outside), git(baseline, 'check-attr', ...attrs, '--', ...outside));
const outsideHashes = outside.map(p => {
  const b = path.join(baseline, p), c = path.join(candidate, p);
  const before = fs.existsSync(b) ? sha(b) : 'absent';
  const after = fs.existsSync(c) ? sha(c) : 'absent';
  assert.equal(after, before, 'B01/control checkout bytes: ' + p);
  return { path: p, before, after };
});
function checkAttrs(root, paths) {
  const output = git(root, 'check-attr', ...attrs, '--', ...paths);
  for (const line of output.split(/\r?\n/)) {
    const match = /^(.*): ([^:]+): (.*)$/.exec(line);
    assert(match, line);
    const [, p, attribute, actual] = match;
    const expected = ['diff', 'merge'].includes(attribute) && !p.endsWith('.xlsx') ? 'unspecified' : 'unset';
    assert.equal(actual, expected, line);
  }
  return output;
}
const fixtures = files.map(name => fixture + '/' + name);
checkAttrs(candidate, fixtures);
const inventory = fixtures.map(p => {
  const original = sha(path.join(source, p));
  const checkedOut = sha(path.join(candidate, p));
  assert.equal(checkedOut, original, p);
  return { path: p, original, checkedOut };
});
const triple = {
  generationA: { path: path.join(run, 'generation-A.xlsx'), sha256: sha(path.join(run, 'generation-A.xlsx')) },
  generationB: { path: path.join(run, 'generation-B.xlsx'), sha256: sha(path.join(run, 'generation-B.xlsx')) },
  committed: { path: path.join(candidate, fixture, 'orders.xlsx'), sha256: sha(path.join(candidate, fixture, 'orders.xlsx')), commit: tip },
};
assert.equal(triple.generationA.sha256, triple.generationB.sha256);
assert.equal(triple.generationA.sha256, triple.committed.sha256);
const staging = path.join(run, 'package-authoring');
fs.mkdirSync(staging);
write(path.join(staging, '.gitattributes'), fs.readFileSync(path.join(source, '.gitattributes')));
const paths = [];
for (const directory of [fixture, '.agents/changes/BYTE-CHECK/evidence/C1/inputs/issue-001', '.agents/archive/BYTE-CHECK/evidence/C1/inputs/issue-001']) {
  for (const name of files) {
    const p = directory + '/' + name;
    write(path.join(staging, p), fs.readFileSync(path.join(source, fixture, name)));
    paths.push(p);
  }
  if (directory !== fixture) {
    for (const [name, bytes] of [['lf.txt', Buffer.from('one\ntwo\n')], ['crlf.txt', Buffer.from('one\r\ntwo\r\n')],
      ['nested/deep/input.txt', Buffer.from('nested\nCafé\n')], ['nested/deep/orders.xlsx', fs.readFileSync(path.join(source, fixture, 'orders.xlsx'))]]) {
      const p = directory + '/' + name;
      write(path.join(staging, p), bytes); paths.push(p);
    }
  }
}
write(path.join(staging, 'control.txt'), Buffer.from('unprotected\nLF\n'));
const originals = paths.map(p => ({ path: p, original: sha(path.join(staging, p)) }));
git(staging, 'init');
git(staging, 'config', '--local', 'user.name', 'Synthetic B02 byte check');
git(staging, 'config', '--local', 'user.email', 'synthetic@example.invalid');
git(staging, 'config', '--local', 'core.autocrlf', 'true');
git(staging, 'add', '--all');
git(staging, 'commit', '-m', 'Synthetic B02 byte-preservation package');
const packageTip = git(staging, 'rev-parse', 'HEAD');
const checkout = freshClone('package-checkout', staging, packageTip);
const packageAttributes = checkAttrs(checkout, paths);
const packageHashes = originals.map(record => {
  const checkedOut = sha(path.join(checkout, record.path));
  assert.equal(checkedOut, record.original, record.path);
  return { ...record, checkedOut };
});
assert.deepEqual(fs.readFileSync(path.join(checkout, 'control.txt')), Buffer.from('unprotected\r\nLF\r\n'), 'LF control must convert to CRLF');
const report = { candidateCommit: tip, waveBase: base, candidate, packageCommit: packageTip, checkout, triple,
  inventory, outsideHashes, packageHashes, packageAttributes,
  outsideAttributes: git(candidate, 'check-attr', ...attrs, '--', ...outside),
  control: { before: 'unprotected\\nLF\\n', after: 'unprotected\\r\\nLF\\r\\n', conversionVerified: true }, commands };
write(path.join(run, 'byte-check-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ candidateCommit: tip, triple, protectedCheckoutFiles: packageHashes.length, unchangedB01AndControlPaths: outsideHashes.length, control: report.control }, null, 2));
console.log('PASS raw SHA256(A) = SHA256(B) = SHA256(committed workbook file bytes)');
console.log('PASS all four fixtures, active/archive copies, LF/CRLF/nested sentinels, XLSX binary attributes');
console.log('PASS actual and fresh-checkout B01/control attributes and raw bytes unchanged');
console.log('PASS independent unprotected LF control converted to CRLF; isolated configuration; fresh clones');
