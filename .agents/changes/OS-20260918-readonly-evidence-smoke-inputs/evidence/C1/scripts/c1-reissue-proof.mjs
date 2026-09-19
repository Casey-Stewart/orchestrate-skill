// Exercise actual delivered bytes and the reviewed builder in disposable copies.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import{spawnSync}from'node:child_process';import{createHash}from'node:crypto';
const [repoArg,scratchArg,reportArg]=process.argv.slice(2);assert(reportArg,'Usage: node c1-reissue-proof.mjs <repo> <scratch> <report.json>');
const repo=path.resolve(repoArg),ledger='.agents/changes/OS-20260918-readonly-evidence-smoke-inputs',source=path.join(repo,ledger),builder=path.join(repo,'orchestrate/tools/build-smoke-page.mjs');
fs.mkdirSync(scratchArg,{recursive:true});const scratch=fs.mkdtempSync(path.join(path.resolve(scratchArg),'reissue-proof-'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>{const p=path.join(dir,x.name);assert(!x.isSymbolicLink());return x.isDirectory()?walk(p):[p];});}
const originals=Object.fromEntries(walk(path.join(source,'evidence/C1/inputs')).map(p=>[p,hash(fs.readFileSync(p))]));
const calls=[];function build(dir,json,html,previous,expected){const args=[builder,path.join(dir,json),path.join(dir,html)];if(previous)args.push('--previous',path.join(dir,previous));const r=spawnSync(process.execPath,args,{cwd:repo,encoding:'utf8',windowsHide:true,shell:false,timeout:60000,maxBuffer:4*1024*1024});assert(!r.error,String(r.error));calls.push({args,exit:r.status,stdout:r.stdout,stderr:r.stderr});if(expected===0)assert.equal(r.status,0,JSON.stringify(calls.at(-1)));else assert.notEqual(r.status,0,JSON.stringify(calls.at(-1)));return r;}
function copy(name){const dir=path.join(scratch,name);fs.cpSync(source,dir,{recursive:true});return dir;}
const dir=copy('text');
const before=JSON.parse(fs.readFileSync(path.join(dir,'smoke-C1.json'),'utf8'));
build(dir,'smoke-C1.json','probe.html',null,0);
const oldHtml=fs.readFileSync(path.join(dir,'probe.html')),item=before.inputs.find(x=>x.id==='text-lf');assert(item);
const oldPath=path.join(dir,item.path),lf=fs.readFileSync(oldPath),crlf=Buffer.from(lf.toString('utf8').replaceAll('\n','\r\n'));
assert(!lf.includes(13));assert.notEqual(hash(lf),hash(crlf));
fs.writeFileSync(oldPath,crlf);
const stale=build(dir,'smoke-C1.json','probe.html',null,1);assert.match(stale.stderr,/sha|digest|hash|mismatch/i);assert.deepEqual(fs.readFileSync(path.join(dir,'probe.html')),oldHtml);
fs.writeFileSync(oldPath,lf);
const changed=structuredClone(before),newItem=changed.inputs.find(x=>x.id===item.id);
newItem.path='evidence/C1/inputs/issue-proof/text-crlf.txt';newItem.sha256=hash(crlf);newItem.size=crlf.length;newItem.requirements='The same synthetic Unicode text with exact CRLF line endings; raw bytes must match the declared digest.';
fs.mkdirSync(path.dirname(path.join(dir,newItem.path)),{recursive:true});fs.writeFileSync(path.join(dir,newItem.path),crlf);
const validationPath='evidence/C1/inputs/issue-proof/text-validation.json';
const validationBytes=Buffer.from(JSON.stringify({verdict:'PASS',requirement:'Exact expected CRLF UTF-8 bytes',sha256:hash(crlf),size:crlf.length,normalizedContentMatchesOriginal:crlf.toString('utf8').replaceAll('\r\n','\n')===lf.toString('utf8')},null,2)+'\n');
fs.writeFileSync(path.join(dir,validationPath),validationBytes);
newItem.validation={path:validationPath,sha256:hash(validationBytes),size:validationBytes.length,command:'c1-reissue-proof.mjs compares actual raw CRLF bytes to the explicitly constructed expected bytes',exitCode:0,result:'PASS: exact CRLF bytes and unchanged text content',env:'Node '+process.version};
changed.inputHistory=[...(before.inputHistory||[]),{path:item.path,sha256:item.sha256,size:item.size}];
fs.writeFileSync(path.join(dir,'previous.json'),JSON.stringify(before,null,2)+'\n');
fs.writeFileSync(path.join(dir,'changed.json'),JSON.stringify(changed,null,2)+'\n');
const unbumped=build(dir,'changed.json','probe.html','previous.json',1);assert.match(unbumped.stderr,/revision/i);assert.deepEqual(fs.readFileSync(path.join(dir,'probe.html')),oldHtml);
const affected=changed.sections.flatMap(s=>s.steps).filter(s=>s.inputs?.includes(item.id));assert(affected.length>1,'Shared input must exercise EVERY referencing step');
affected[0].revision++;
fs.writeFileSync(path.join(dir,'changed.json'),JSON.stringify(changed,null,2)+'\n');
const partlyBumped=build(dir,'changed.json','probe.html','previous.json',1);assert.match(partlyBumped.stderr,/revision/i);assert.deepEqual(fs.readFileSync(path.join(dir,'probe.html')),oldHtml);
for(const step of affected.slice(1))step.revision++;
fs.writeFileSync(path.join(dir,'changed.json'),JSON.stringify(changed,null,2)+'\n');build(dir,'changed.json','probe.html','previous.json',0);
assert.deepEqual(fs.readFileSync(oldPath),lf,'Prior text issue changed');
const demoDir=copy('workbook');
const demoBefore=JSON.parse(fs.readFileSync(path.join(demoDir,'smoke-C1-demo-before.json'),'utf8')),demoAfter=JSON.parse(fs.readFileSync(path.join(demoDir,'smoke-C1-demo-after.json'),'utf8'));
assert.equal(demoBefore.buildSha,demoAfter.buildSha);assert.equal(demoBefore.ckptKey,demoAfter.ckptKey);
build(demoDir,'smoke-C1-demo-before.json','probe.html',null,0);const demoOldHtml=fs.readFileSync(path.join(demoDir,'probe.html'));
const invalid=structuredClone(demoAfter);invalid.sections[0].steps[0].revision=1;
fs.writeFileSync(path.join(demoDir,'unchanged-revision.json'),JSON.stringify(invalid,null,2)+'\n');
const refused=build(demoDir,'unchanged-revision.json','probe.html','smoke-C1-demo-before.json',1);assert.match(refused.stderr,/revision/i);assert.deepEqual(fs.readFileSync(path.join(demoDir,'probe.html')),demoOldHtml);
build(demoDir,'smoke-C1-demo-after.json','probe.html','smoke-C1-demo-before.json',0);
assert.deepEqual(demoBefore.sections[0].steps[1],demoAfter.sections[0].steps[1],'Unaffected step changed');
for(const[file,digest]of Object.entries(originals))assert.equal(hash(fs.readFileSync(file)),digest,'Actual issued bytes changed');
const report={verdict:'PASS',testedCommit:before.buildSha,scratch,affectedTextSteps:affected.map(x=>x.n),workbookChangedRevision:demoAfter.sections[0].steps[0].revision,unaffectedStepUnchanged:true,originalsUnchanged:true,notes:'Browser verdict/history behavior is verified separately by fresh QA on the actual generated demo pages.',calls};
fs.writeFileSync(path.resolve(reportArg),JSON.stringify(report,null,2)+'\n');console.log('PASS: raw line-ending tamper rejection preserves HTML; every shared-input step needs revision bump; same-build workbook reissue rejects old revision and accepts new issue/revision; issued bytes unchanged');
