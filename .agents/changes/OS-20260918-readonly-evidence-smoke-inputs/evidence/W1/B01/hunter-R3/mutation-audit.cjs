const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const source = process.argv[2];
const proof = __dirname;
const files = ['orchestrate/tools/git-evidence.mjs', 'orchestrate/tools/check-fence.mjs', 'tests/git-contract.test.cjs', 'tests/check-fence.test.cjs', 'tests/support/git-fixture.cjs'];
const helper = 'orchestrate/tools/git-evidence.mjs';
const select = 'dangling symbolic hints|symbolic hints do not expand|malformed symbolic targets|global clean filters';
const scenarios = [
  { name: 'candidate', pattern: select, expected: 0 },
  { name: 'namespace-restriction', pattern: 'dangling symbolic hints', expected: 1,
    old: 'const targetFormat = target?.startsWith(\'refs/\') ? git(repo, [\'check-ref-format\', target], options) : null;',
    replacement: 'const targetFormat = { ok: validFullRef(target) };' },
  { name: 'discard-symbolic-target', pattern: 'dangling symbolic hints', expected: 1,
    old: '} else refs.push({ ref: name, sha: null, symref: target });',
    replacement: '} else refs.push({ ref: name, sha: null, symref: null });' },
  { name: 'scan-symbolic-trees', pattern: 'symbolic hints do not expand', expected: 1,
    old: 'refs.filter(x => !x.symref && x.sha)',
    replacement: 'refs.filter(x => x.sha)' },
  { name: 'local-only-filter', pattern: 'global clean filters', expected: 1,
    old: "['config', '--includes', '--null', '--name-only', '--get-regexp', '^filter[.].*[.](clean|process)$']",
    replacement: "['config', '--local', '--includes', '--null', '--name-only', '--get-regexp', '^filter[.].*[.](clean|process)$']" },
];
const results=process.argv[3] ? JSON.parse(fs.readFileSync(path.join(proof,'mutation-results.json'),'utf8')).filter(r=>r.name!==process.argv[3]) : [];
for(const scenario of scenarios.filter(s=>!process.argv[3] || s.name===process.argv[3])){
  const destination = path.join(proof, scenario.name);
  fs.mkdirSync(destination, {recursive:true});
  for(const file of files) { fs.mkdirSync(path.dirname(path.join(destination,file)),{recursive:true}); fs.copyFileSync(path.join(source,file),path.join(destination,file)); }
  if(scenario.old) {
    const full = path.join(destination,helper), original=fs.readFileSync(full,'utf8');
    assert.equal(original.split(scenario.old).length,2,'mutation must match exactly once');
    fs.writeFileSync(full, original.replace(scenario.old, () => scenario.replacement));
  }
  const r = spawnSync(process.execPath, ['--test','--test-reporter=spec', '--test-name-pattern='+scenario.pattern,'tests/git-contract.test.cjs'], {cwd:destination,encoding:'utf8',shell:false,windowsHide:true,timeout:120000,maxBuffer:4*1024*1024});
  fs.writeFileSync(path.join(proof,scenario.name+'.txt'),r.stdout+'\n'+r.stderr);
  assert.ifError(r.error); assert.equal(r.signal,null); assert.equal(r.status,scenario.expected,scenario.name+' unexpected exit\n'+r.stdout+r.stderr);
  if (scenario.expected === 1) assert.match(r.stdout, /AssertionError/, 'mutant must fail behavior assertions');
  const counts=r.stdout.match(/^.*(?:tests|pass|fail|skipped|duration_ms).*/gm);
  results.push({name:scenario.name,exit:r.status,expected:scenario.expected,pattern:scenario.pattern,counts});
  fs.writeFileSync(path.join(proof,'mutation-results.json'),JSON.stringify(results,null,2)+'\n');
  process.stdout.write(scenario.name+': expected exit '+r.status+'\n');
}
