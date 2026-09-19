const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const assert = require('node:assert/strict');
const root = __dirname;
const repo = 'C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/wt-C1-repair';
const candidate = 'f2c2ceeb73a8adeee5dd2249a97df84bb1a19134';
const base = '9b40054dfc9571af25267050640f66bc00e7e619';
const ledger = '.agents/changes/OS-20260918-readonly-evidence-smoke-inputs';
const testName = 'c1-demo-instructions.test.cjs';
const pages = ['smoke-C1','smoke-C1-demo-before','smoke-C1-demo-after'];
const files = pages.flatMap(n => [n+'.html',n+'.json']).concat(testName);
const gitCommands = [];
function git(args) {
  const full = ['-c',`safe.directory=${repo}`,'-c','core.longpaths=true','-C',repo,...args];
  const r = spawnSync('git', full, {maxBuffer:32*1024*1024});
  gitCommands.push({exe:'git',args:full,exit:r.status,stderr:r.stderr?.toString()});
  assert.equal(r.status,0,r.stderr?.toString());
  return r.stdout;
}
const integration = git(['rev-parse','codex/readonly-evidence-smoke-inputs-ledger']).toString().trim();
fs.mkdirSync(path.join(root,'proof'),{recursive:true});
fs.writeFileSync(path.join(root,'proof','candidate.patch'),git(['diff',`${integration}...${candidate}`]));
const original = Object.fromEntries(files.map(n => [n,git(['show',`${candidate}:./${ledger}/${n}`])]));
const prior = Object.fromEntries(files.filter(n=>n!==testName).map(n => [n,git(['show',`${base}:./${ledger}/${n}`])]));
prior[testName] = original[testName];
for (const n of ['orchestrate/references/smoke-page-template.html','orchestrate/tools/build-smoke-page.mjs','orchestrate/tools/smoke-inputs.mjs']) {
  const dest=path.join(root,'source',n); fs.mkdirSync(path.dirname(dest),{recursive:true}); fs.writeFileSync(dest,git(['show',`${candidate}:./${n}`]));
}
const results=[];
function copyCase(name, content=original) {
  const dir=path.join(root,'cases',name,ledger); fs.mkdirSync(dir,{recursive:true});
  for(const [n,b] of Object.entries(content)) fs.writeFileSync(path.join(dir,n),b);
  return dir;
}
function replace(dir,name,oldText,newText) {
  const file=path.join(dir,name), before=fs.readFileSync(file,'utf8');
  assert.ok(before.includes(oldText),`${name}: mutation target missing: ${oldText}`);
  fs.writeFileSync(file,before.replace(oldText,newText));
}
function pair(dir,stem,oldText,newText) {
  for(const ext of ['.json','.html']) replace(dir,stem+ext,oldText,newText);
}
function run(name, content=original, mutate) {
  const dir=copyCase(name,content); if(mutate) mutate(dir);
  const args=['--test','--test-reporter=spec',`${ledger}/${testName}`];
  const cwd=path.join(root,'cases',name);
  const r=spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:8*1024*1024});
  const out=(r.stdout||'')+(r.stderr||'');
  fs.writeFileSync(path.join(root,'proof',name+'.txt'),out);
  const changed = files.filter(n=>!fs.readFileSync(path.join(dir,n)).equals(content[n]));
  const diffs=[];
  for(const n of changed) {
    const originalLines=content[n].toString().split('\n'), changedLines=fs.readFileSync(path.join(dir,n),'utf8').split('\n');
    for(let i=0;i<Math.max(originalLines.length,changedLines.length);i++) if(originalLines[i]!==changedLines[i]) diffs.push({file:n,line:i+1,before:originalLines[i],after:changedLines[i]});
  }
  fs.writeFileSync(path.join(root,'proof',name+'.mutation.json'),JSON.stringify(diffs,null,2));
  const totals=out.split(/\r?\n/).filter(l=>/^ℹ (tests|pass|fail|skipped|cancelled) /.test(l));
  results.push({name,exe:process.execPath,args,cwd,exit:r.status,totals,failures:out.split(/\r?\n/).filter(l=>/^✖ |AssertionError/.test(l)),changed,log:`proof/${name}.txt`,mutation:`proof/${name}.mutation.json`});
  console.log(`${name}: exit ${r.status}; ${totals.join('; ')}`);
  return dir;
}
run('candidate');
run('base-test-only',prior);
const oldDo=JSON.parse(prior['smoke-C1-demo-before.json']).sections[0].steps[1].do;
const newDo=JSON.parse(original['smoke-C1-demo-before.json']).sections[0].steps[1].do;
run('old-main-route',original,d=>pair(d,'smoke-C1','For demo step 2, select Works, but, enter “keep this note” in the visible note field, then select Pass.','For demo step 2, select Pass and enter “keep this note”.'));
run('old-before-standfirst',original,d=>pair(d,'smoke-C1-demo-before',JSON.parse(original['smoke-C1-demo-before.json']).standfirst,JSON.parse(prior['smoke-C1-demo-before.json']).standfirst));
run('old-before-step2',original,d=>pair(d,'smoke-C1-demo-before',newDo,oldDo));
run('old-after-step2',original,d=>pair(d,'smoke-C1-demo-after',newDo,oldDo));
run('omit-final-pass',original,d=>{for(const n of ['smoke-C1-demo-before','smoke-C1-demo-after']) pair(d,n,newDo,newDo.replace(', then select Pass.','.'));});
run('hidden-works-field',original,d=>replace(d,'smoke-C1-demo-before.html','nw.hidden = !wantNote;','nw.hidden = true;'));
run('discard-note-input',original,d=>replace(d,'smoke-C1-demo-before.html','local[step.n].note = ta.value;','local[step.n].note = "";'));
run('discard-note-on-pass',original,d=>replace(d,'smoke-C1-demo-before.html','local[n] = cur;','if (status === "pass") cur.note = "";\n    local[n] = cur;'));
run('disable-invalidation',original,d=>replace(d,'smoke-C1-demo-after.html','rec.stepRevision === revisionOf(step);','true;'));
run('hide-rerun-history',original,d=>replace(d,'smoke-C1-demo-after.html','history.hidden = !state.marked || state.kind === "current";','history.hidden = true;'));
run('wrong-rerun-export',original,d=>replace(d,'smoke-C1-demo-after.html','? "NOT RE-RUN" +','? "PASS" +'));
run('drop-export-note',original,d=>replace(d,'smoke-C1-demo-after.html','if (r.note && r.note.trim()) line +=','if (false) line +='));
run('wrong-prerequisite-verdict',original,d=>{
  pair(d,'smoke-C1','and mark demo step 1 Pass.','and mark demo step 1 Works, but.');
  pair(d,'smoke-C1-demo-before','Mark demo step 1 Pass.','Mark demo step 1 Works, but.');
});
run('wrong-note-step',original,d=>{
  pair(d,'smoke-C1','For demo step 2, select Works, but','For demo step 1, select Works, but');
  pair(d,'smoke-C1-demo-before','For demo step 2, select Works, but','For demo step 1, select Works, but');
});
run('stale-after-visible-instructions',original,d=>replace(d,'smoke-C1-demo-after.html',JSON.parse(original['smoke-C1-demo-after.json']).standfirst,JSON.parse(prior['smoke-C1-demo-after.json']).standfirst));
fs.writeFileSync(path.join(root,'proof','results.json'),JSON.stringify({candidate,base,integration,results,gitCommands},null,2));
