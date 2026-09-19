import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildSmokePage} from './source/orchestrate/tools/build-smoke-page.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const ledger='.agents/changes/OS-20260918-readonly-evidence-smoke-inputs';
const inputRoot='C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/wt-C1-repair/'+ledger;
const template=fs.readFileSync(path.join(root,'source/orchestrate/references/smoke-page-template.html'),'utf8');
const read=(which,n)=>JSON.parse(fs.readFileSync(path.join(root,'cases',which,ledger,n+'.json'),'utf8'));
const results=[];
for(const stem of ['smoke-C1','smoke-C1-demo-before','smoke-C1-demo-after']) {
  const data=read('candidate',stem), previous=read('base-test-only',stem);
  const emitted=buildSmokePage(data,template,{previous,inputRoot});
  fs.writeFileSync(path.join(root,'proof',stem+'.regenerated.html'),emitted);
  const expected=fs.readFileSync(path.join(root,'cases/candidate',ledger,stem+'.html'),'utf8');
  assert.equal(emitted,expected,stem+' reproduces candidate committed HTML bytes');
  results.push({stem,byteIdentical:true,previous:'9b40054dfc9571af25267050640f66bc00e7e619',inputRoot});
  console.log(stem+': PASS; exact committed HTML bytes reproduced with explicit inputRoot and pre-repair snapshot');
}
fs.writeFileSync(path.join(root,'proof','regenerate.json'),JSON.stringify(results,null,2));
