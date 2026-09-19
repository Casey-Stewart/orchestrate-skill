import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const root = process.argv[2];
const ledgerRel = '.agents/changes/OS-20260918-readonly-evidence-smoke-inputs';
const ledger = path.join(root, ledgerRel);
const scratch = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, '$1'));
const base = '9b40054dfc9571af25267050640f66bc00e7e619';
const candidate = 'f2c2ceeb73a8adeee5dd2249a97df84bb1a19134';
const commands = [];
function git(args, binary = false) {
  const all = ['-c', `safe.directory=${root}`, '-c', 'core.longpaths=true', ...args];
  const r = spawnSync('git', all, { cwd: root, encoding: binary ? null : 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
  commands.push({ command: ['git', ...all], exit: r.status, ...(binary ? { bytes: r.stdout.length } : { stdout: r.stdout, stderr: r.stderr }) });
  return r.stdout;
}
assert.equal(git(['rev-parse', 'HEAD']).trim(), candidate);
assert.equal(git(['status', '--porcelain']).trim(), '');
const diff = git(['diff', '--name-only', 'codex/readonly-evidence-smoke-inputs-ledger...HEAD']).trim().split('\n');
assert.equal(diff.length, 8);
git(['diff', '--check']);
const { buildSmokePage } = await import(pathToFileURL(path.join(root, 'orchestrate/tools/build-smoke-page.mjs')));
const template = fs.readFileSync(path.join(root, 'orchestrate/references/smoke-page-template.html'), 'utf8');
const results = [], artifacts = new Map();
for (const [i, name] of ['smoke-C1', 'smoke-C1-demo-before', 'smoke-C1-demo-after'].entries()) {
  const old = JSON.parse(git(['show', `${base}:./${ledgerRel}/${name}.json`]));
  const current = JSON.parse(fs.readFileSync(path.join(ledger, name + '.json'), 'utf8'));
  const flat = model => model.sections.flatMap(section => section.steps);
  const old2 = flat(old).find(s => s.n === 2), current2 = flat(current).find(s => s.n === 2);
  assert.equal(old2.revision, 1); assert.equal(current2.revision, 2);
  const normalized = structuredClone(current);
  const norm2 = flat(normalized).find(s => s.n === 2);
  norm2.do = old2.do; norm2.revision = old2.revision;
  if (i === 0) norm2.pass = old2.pass;
  else normalized.standfirst = old.standfirst;
  assert.deepEqual(normalized, old, 'only approved instruction fields and revisions change');
  const built = buildSmokePage(current, template, { previous: old, inputRoot: ledger });
  const actual = fs.readFileSync(path.join(ledger, name + '.html'));
  assert.deepEqual(Buffer.from(built), actual, 'generated page bytes exactly match real builder output with prior snapshot');
  for (const input of current.inputs) {
    artifacts.set(input.path, input);
    artifacts.set(input.validation.path, input.validation);
  }
  results.push({ name, previous: base, exactGeneratedBytes: actual.length, buildSha: current.buildSha, ckptKey: current.ckptKey, revisions: flat(current).map(s => [s.n, s.revision]) });
}
const raw = [];
for (const [name, declared] of artifacts) {
  const actual = fs.readFileSync(path.join(ledger, name));
  const original = git(['show', `${base}:./${ledgerRel}/${name}`], true);
  assert.deepEqual(actual, original, `raw bytes unchanged for ${name}`);
  const sha256 = createHash('sha256').update(actual).digest('hex');
  assert.equal(sha256, declared.sha256);
  assert.equal(actual.length, declared.size);
  raw.push({ name, sha256, size: actual.length });
}
const report = { verdict: 'PASS', candidate, base, results, raw, commands };
fs.writeFileSync(path.join(scratch, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`PASS: ${results.length} exact builder page reproductions with base snapshots; ${raw.length} raw input/evidence files unchanged and digest/size matched; all model changes restricted; clean candidate and diff check.`);
