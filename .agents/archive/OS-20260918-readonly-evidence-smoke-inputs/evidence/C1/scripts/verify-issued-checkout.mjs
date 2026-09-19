// Conductor QA: hash real committed checkpoint bytes in fresh Git checkouts.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, mkdtempSync } from 'node:fs';
import { resolve, join, dirname, relative } from 'node:path';
import assert from 'node:assert/strict';

const [repoArg, commit, ledgerArg, scratchArg, outputArg] = process.argv.slice(2);
if (!outputArg) throw new Error('Usage: node verify-issued-checkout.mjs <repo> <commit> <ledger-relative-dir> <scratch> <report.json>');
const repo = resolve(repoArg), scratch = resolve(scratchArg), ledger = ledgerArg.replaceAll('\\', '/');
assert.match(commit, /^[0-9a-f]{40,64}$/);
assert.match(ledger, /^\.agents\/changes\/[^/]+$/);
mkdirSync(scratch, { recursive: true });
const run = mkdtempSync(join(scratch, 'issued-byte-proof-'));
const config = join(run, 'isolated.gitconfig');
writeFileSync(config, '[user]\n name = Checkpoint QA\n email = checkpoint@example.invalid\n');
const inherited = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^GIT_/i.test(key)));
const env = { ...inherited, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: config, GIT_ATTR_NOSYSTEM: '1', XDG_CONFIG_HOME: join(run, 'isolated-xdg'), GIT_TERMINAL_PROMPT: '0' };
const git = (cwd, args) => execFileSync('git', ['-c', 'core.longpaths=true', ...args], { cwd, env, windowsHide: true, timeout: 120000, maxBuffer: 32 * 1024 * 1024 });
const hash = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const walk = (root, base = root) => readdirSync(root, { withFileTypes: true }).flatMap(entry => {
  const p = join(root, entry.name);
  assert(!entry.isSymbolicLink(), `Unexpected symbolic input: ${p}`);
  return entry.isDirectory() ? walk(p, base) : [relative(base, p).replaceAll('\\', '/')];
}).sort();
const inputRoot = `${ledger}/evidence/C1/inputs`;
assert.equal(git(repo, ['status', '--porcelain', '--', inputRoot]).toString().trim(), '', 'Issued inputs must already be committed and clean');
const issued = walk(join(repo, inputRoot));
assert(issued.length > 0, 'No issued inputs');
const fixtureRoot = 'tests/fixtures/smoke-inputs';
const fixtureNames = ['orders.xlsx', 'orders.requirements.json', 'generate-orders.py', 'validate-orders.py'];
const protectedPaths = [...issued.map(p => `${inputRoot}/${p}`), ...fixtureNames.map(p => `${fixtureRoot}/${p}`)];
const originals = Object.fromEntries(protectedPaths.map(p => [p, hash(join(repo, p))]));

function freshClone(source, destination, revision) {
  git(run, ['clone', '--no-checkout', '--no-hardlinks', '--', source, destination]);
  git(destination, ['config', '--local', 'core.autocrlf', 'true']);
  assert.equal(git(destination, ['config', '--get', 'core.autocrlf']).toString().trim(), 'true');
  git(destination, ['checkout', '--detach', revision]);
}
function assertAttrs(cwd, paths) {
  const output = git(cwd, ['check-attr', '-z', 'text', 'eol', 'filter', 'ident', 'working-tree-encoding', 'diff', 'merge', '--', ...paths]).toString('utf8').split('\0');
  const observations = [];
  for (let i = 0; i + 2 < output.length; i += 3) {
    const [path, attribute, value] = output.slice(i, i + 3);
    observations.push({ path, attribute, value });
    if (['text', 'eol', 'filter', 'ident', 'working-tree-encoding'].includes(attribute) || (path.endsWith('.xlsx') && ['diff', 'merge'].includes(attribute))) assert.equal(value, 'unset', `${path} ${attribute}`);
  }
  return observations;
}
const actualClone = join(run, 'actual-checkout');
freshClone(repo, actualClone, commit);
const actual = protectedPaths.map(path => {
  const checkoutHash = hash(join(actualClone, path));
  assert.equal(checkoutHash, originals[path], `Issued byte mismatch: ${path}`);
  return { path, sourceSha256: originals[path], checkoutSha256: checkoutHash };
});
const actualAttributes = assertAttrs(actualClone, protectedPaths);
const readmeBlob = git(actualClone, ['show', `${commit}:./README.md`]);
assert(readmeBlob.includes(10), 'Actual-clone conversion control lacks LF');
assert(!readmeBlob.includes(Buffer.from('\r\n')), 'README control blob must be LF for this proof');
assert.deepEqual(readFileSync(join(actualClone, 'README.md')), Buffer.from(readmeBlob.toString('utf8').replaceAll('\n', '\r\n')), 'Actual clone control did not demonstrate LF-to-CRLF conversion');

const stage = join(run, 'archive-stage');
mkdirSync(stage);
git(stage, ['init', '--initial-branch=main']);
git(stage, ['config', '--local', 'core.autocrlf', 'false']);
copyFileSync(join(repo, '.gitattributes'), join(stage, '.gitattributes'));
const staged = [];
for (const kind of ['changes', 'archive']) for (const input of issued) {
  const path = `.agents/${kind}/BYTE-CHECK/evidence/C1/inputs/${input}`;
  mkdirSync(dirname(join(stage, path)), { recursive: true });
  copyFileSync(join(repo, inputRoot, input), join(stage, path));
  staged.push(path);
}
for (const kind of ['changes', 'archive']) for (const [name, bytes] of [['lf.txt', 'one\ntwo\n'], ['crlf.txt', 'one\r\ntwo\r\n']]) {
  const path = `.agents/${kind}/BYTE-CHECK/evidence/C1/inputs/issue-control/nested/${name}`;
  mkdirSync(dirname(join(stage, path)), { recursive: true });
  writeFileSync(join(stage, path), Buffer.from(bytes));
  staged.push(path);
}
writeFileSync(join(stage, 'unprotected-control.txt'), Buffer.from('one\ntwo\n'));
const stagedHashes = Object.fromEntries(staged.map(path => [path, hash(join(stage, path))]));
git(stage, ['add', '--all']);
git(stage, ['commit', '-m', 'Synthetic checkpoint byte preservation proof']);
const stagedCommit = git(stage, ['rev-parse', 'HEAD']).toString().trim();
const archiveClone = join(run, 'archive-checkout');
freshClone(stage, archiveClone, stagedCommit);
const archived = staged.map(path => {
  const checkoutHash = hash(join(archiveClone, path));
  assert.equal(checkoutHash, stagedHashes[path], `Archive/active copy mismatch: ${path}`);
  return { path, sourceSha256: stagedHashes[path], checkoutSha256: checkoutHash };
});
const archiveAttributes = assertAttrs(archiveClone, staged);
assert.deepEqual(readFileSync(join(archiveClone, 'unprotected-control.txt')), Buffer.from('one\r\ntwo\r\n'));
const result = { verdict: 'PASS', testedCommit: commit, run, actualClone, archiveClone, actual, archived, actualAttributes, archiveAttributes, controls: { actualReadmeLfToCrlf: true, archiveControlLfToCrlf: true }, note: 'Raw SHA256 over file buffers; no normalization of protected bytes. Local core.autocrlf=true set before first checkout.' };
writeFileSync(resolve(outputArg), JSON.stringify(result, null, 2) + '\n');
console.log(`PASS: ${actual.length} real fixture/issued paths, ${archived.length} active/archive copy paths; both LF-to-CRLF controls converted; report=${resolve(outputArg)}`);
