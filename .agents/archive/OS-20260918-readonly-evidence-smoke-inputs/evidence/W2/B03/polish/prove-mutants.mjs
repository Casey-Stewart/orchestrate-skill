import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const source=process.argv[2], root=path.dirname(fileURLToPath(import.meta.url));
const env={...process.env}; delete env.NODE_TEST_CONTEXT;
const runs=[];
function copy(name) {
 const target=path.join(root,name); fs.mkdirSync(target);
 for(const entry of ['orchestrate','tests','README.md','.gitattributes']) fs.cpSync(path.join(source,entry),path.join(target,entry),{recursive:true});
 return target;
}
function run(repo,name) {
 const args=['--test','--test-reporter=spec','tests/build-smoke-page.test.cjs','tests/protocol-contract.test.cjs'];
 const result=spawnSync(process.execPath,args,{cwd:repo,env,encoding:'utf8',windowsHide:true,timeout:180000});
 if(result.error)throw result.error;
 const output=result.stdout+result.stderr; fs.writeFileSync(path.join(root,name+'.log'),output);
 runs.push({name,command:process.execPath+' '+args.join(' '),cwd:repo,exit:result.status,tail:output.split(/\r?\n/).slice(-14)});
 console.log(name, 'exit='+result.status, output.split(/\r?\n/).slice(-8).join('\n'));
 return {exit:result.status,output};
}
function mutate(repo,file,from,to) {
 const target=path.join(repo,file), original=fs.readFileSync(target,'utf8');
 if(original.split(from).length!==2)throw new Error('Expected one exact mutation target: '+file);
 fs.writeFileSync(target,original.replace(from,to));
 fs.writeFileSync(path.join(root,path.basename(repo)+'-mutation.json'),JSON.stringify({file,from,to},null,2)+'\n');
}
const baseline=run(copy('baseline'),'baseline');
if(baseline.exit!==0)throw new Error('Baseline fails');
const output=copy('mutant-output-guard');
mutate(output,'orchestrate/tools/build-smoke-page.mjs',
 '      if (sameFile(out, resolve(inputRoot, artifact.path))) throw new Error("output must not overwrite an issued input artifact");',
 '      // MUTANT: omit issued artifact overwrite guard.');
const outputRun=run(output,'mutant-output-guard');
if(outputRun.exit!==1||!outputRun.output.includes('CLI reissue refuses to overwrite the existing HTML declared as an issued input')||
 !outputRun.output.includes('0 !== 1'))throw new Error('Expected output guard mutant to be caught by new CLI regression');
const diff=copy('mutant-diff-propagation');
mutate(diff,'README.md',"if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }",'# MUTANT: omit Git diff failure propagation.');
const diffRun=run(diff,'mutant-diff-propagation');
if(diffRun.exit!==1||!diffRun.output.includes('actual README recursive command and portable form discover nested failure then success; empty primary discovery fails')||
 !diffRun.output.includes('trailing whitespace'))throw new Error('Expected diff propagation mutant to be caught by actual published-runner regression');
fs.writeFileSync(path.join(root,'mutant-results.json'),JSON.stringify({source,baseline:'PASS',bothExactMutants:'KILLED',runs},null,2)+'\n');
