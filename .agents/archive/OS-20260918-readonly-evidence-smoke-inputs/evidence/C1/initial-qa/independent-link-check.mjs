import fs from 'node:fs'; import path from 'node:path'; import assert from 'node:assert/strict'; import {createHash} from 'node:crypto'; import {execFileSync} from 'node:child_process';
const [root,scratch]=process.argv.slice(2), ledger=path.join(root,'.agents/changes/OS-20260918-readonly-evidence-smoke-inputs');
const model=JSON.parse(fs.readFileSync(path.join(ledger,'smoke-C1.json'),'utf8'));
const links=JSON.parse(fs.readFileSync(path.join(scratch,'main-browser-links.json'),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex'); const records=[];
const declared=new Map();for(const item of model.inputs)for(const artifact of [item,item.validation]){const old=declared.get(artifact.path);if(old)assert.equal(old.sha256,artifact.sha256);declared.set(artifact.path,artifact);}
for(const [p,item] of declared){assert(links.some(x=>x.href===p),'Rendered link missing: '+p);const disk=fs.readFileSync(path.join(ledger,p));assert.equal(disk.length,item.size);assert.equal(hash(disk),item.sha256);const url=new URL(p,'http://127.0.0.1:8765/');const response=await fetch(url);assert.equal(response.status,200);const body=Buffer.from(await response.arrayBuffer());assert.deepEqual(body,disk);records.push({path:p,url:url.href,status:response.status,size:body.length,sha256:hash(body),contentType:response.headers.get('content-type')});}
const pageLinks=[...new Set(links.map(x=>x.href).filter(x=>x&&!x.startsWith('#')&&!declared.has(x)))];
for(const p of pageLinks){const response=await fetch(new URL(p,'http://127.0.0.1:8765/'));assert.equal(response.status,200,p);const body=Buffer.from(await response.arrayBuffer());assert.deepEqual(body,fs.readFileSync(path.join(ledger,p)));records.push({path:p,status:200,size:body.length,sha256:hash(body)});}
const copy=fs.readFileSync(path.join(ledger,'evidence/C1/inputs/issue-001/WORKING-COPY.md'),'utf8');
for(const token of ['Copy-Item -LiteralPath','OS-C1-orders-working.xlsx','23.50','22.50','33.75','34.75','count stays **4**','close the working workbook'])assert(copy.includes(token),token);
const branch=execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8'}).trim();
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
assert.equal(branch,model.branch);assert.equal(head,model.buildSha);
const report={verdict:'PASS',testedCommit:model.buildSha,branch,head,declaredFileCount:declared.size,renderedLinkCount:links.length,uniqueOtherLinkedFileCount:pageLinks.length,records,workingCopyInstructions:'Read: exact immutable source, disposable destination, open/edit/recalc expectations and reset copy; no native Excel claim.',environment:{node:process.version,git:execFileSync('git',['--version'],{encoding:'utf8'}).trim()}};
fs.writeFileSync(path.join(scratch,'link-proof.json'),JSON.stringify(report,null,2)+'\n');console.log('PASS: '+declared.size+' declared input/evidence files and '+pageLinks.length+' other linked pages served exact bytes; raw hashes/sizes and working-copy instructions verified');
