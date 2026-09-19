import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const source=process.argv[2], root=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/,'$1'));
const proof=path.resolve(root), runs=[];
const env={...process.env}; delete env.NODE_TEST_CONTEXT;
const hash=b=>createHash('sha256').update(b).digest('hex');
function clone(name){const dest=path.join(proof,name); fs.mkdirSync(dest,{recursive:true});for(const item of ['orchestrate','tests','README.md','.gitattributes'])fs.cpSync(path.join(source,item),path.join(dest,item),{recursive:true});return dest;}
function mutate(repo,file,from,to){const p=path.join(repo,file),s=fs.readFileSync(p,'utf8');if(!s.includes(from))throw Error('missing mutation '+file);fs.writeFileSync(p,s.replace(from,to));fs.writeFileSync(path.join(proof,path.basename(repo)+'-mutation.json'),JSON.stringify({file,from,to},null,2));}
function runTests(repo,name,files,pattern){const args=['--test','--test-reporter=spec'];if(pattern)args.push('--test-name-pattern='+pattern);args.push(...files.map(f=>path.join(repo,'tests',f+'.test.cjs')));const r=spawnSync(process.execPath,args,{cwd:repo,env,encoding:'utf8',windowsHide:true,timeout:240000});fs.writeFileSync(path.join(proof,name+'.log'),r.stdout+r.stderr);const result={name,status:r.status,error:r.error?.message,args,tail:(r.stdout+r.stderr).split(/\r?\n/).slice(-15)};runs.push(result);console.log(JSON.stringify(result));return r;}
const suites=['smoke-inputs','build-smoke-page','smoke-page','protocol-contract'];
const base=clone('baseline'); const br=runTests(base,'baseline',suites);if(br.status!==0)throw Error('baseline failed');
const output=clone('mutant-output-guard');
mutate(output,'orchestrate/tools/build-smoke-page.mjs','      if (sameFile(out, resolve(inputRoot, artifact.path))) throw new Error("output must not overwrite an issued input artifact");','      // MUTANT: omit issued artifact overwrite guard.');
runTests(output,'mutant-output-guard',suites);
async function probeOutput(repo,label){
 const pkg=path.join(proof,label+'-package');fs.mkdirSync(pkg,{recursive:true});
 const builder=path.join(repo,'orchestrate/tools/build-smoke-page.mjs'),template=fs.readFileSync(path.join(repo,'orchestrate/references/smoke-page-template.html'),'utf8');
 const {buildSmokePage}=await import(pathToFileURL(builder));
 const previous={change:'Output collision',checkpoint:1,batches:'B03',branch:'integration',buildSha:'a'.repeat(40),ckptKey:'collision',gate:{checks:['Verify build']},sections:[{n:1,title:'Input preservation',steps:[{n:1,revision:1,do:'Inspect prior page',pass:'Prior page stays intact'}]}]};
 const old=Buffer.from(buildSmokePage(previous,template)), page=path.join(pkg,'smoke-c1.html'); fs.writeFileSync(page,old);
 const evidence=Buffer.from('Independent prior-page validation passed.\n');fs.writeFileSync(path.join(pkg,'validation.txt'),evidence);
 const current=structuredClone(previous);current.inputs=[{id:'prior-page',path:'smoke-c1.html',size:old.length,sha256:hash(old),requirements:'Preserve issued prior HTML as an input.',validation:{path:'validation.txt',size:evidence.length,sha256:hash(evidence),command:'Inspect prior page',exitCode:0,result:'passed',env:'disposable'},mode:'read-only',use:'Read prior page',reset:'Recopy original'}];
 current.sections[0].steps[0].inputs=['prior-page'];current.sections[0].steps[0].revision=2;
 const now=path.join(pkg,'current.json'),prev=path.join(pkg,'previous.json');fs.writeFileSync(now,JSON.stringify(current));fs.writeFileSync(prev,JSON.stringify(previous));
 const r=spawnSync(process.execPath,[builder,now,page,'--previous',prev],{env,encoding:'utf8',windowsHide:true});
 return {label,status:r.status,stdout:r.stdout,stderr:r.stderr,originalSha256:hash(old),afterSha256:hash(fs.readFileSync(page)),preserved:old.equals(fs.readFileSync(page))};
}
const outputProbes=[await probeOutput(base,'output-baseline'),await probeOutput(output,'output-mutant')];fs.writeFileSync(path.join(proof,'output-probes.json'),JSON.stringify(outputProbes,null,2));console.log(JSON.stringify(outputProbes));
const diff=clone('mutant-diff-propagation');
mutate(diff,'README.md',"if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }",'# MUTANT: omit Git diff failure propagation.');
runTests(diff,'mutant-diff-propagation',['protocol-contract']);
function probeDiff(repo,label){
 const dir=path.join(proof,label+'-package');fs.mkdirSync(path.join(dir,'tests'),{recursive:true});const empty=path.join(dir,'empty-config');fs.writeFileSync(empty,'');const gitEnv={...Object.fromEntries(Object.entries(env).filter(([k])=>!/^GIT_/i.test(k))),GIT_CONFIG_GLOBAL:empty,GIT_CONFIG_NOSYSTEM:'1'};
 const git=(...args)=>{const r=spawnSync('git',['-c','core.longpaths=true','-c','core.autocrlf=false','-c','user.name=Hunter','-c','user.email=hunter@example.invalid','-c','commit.gpgsign=false',...args],{cwd:dir,env:gitEnv,encoding:'utf8',windowsHide:true});if(r.status!==0)throw Error(r.stderr);return r;};
 git('init','--initial-branch=main');fs.writeFileSync(path.join(dir,'tracked.txt'),'clean\n');git('add','tracked.txt');git('commit','-m','baseline');fs.writeFileSync(path.join(dir,'tracked.txt'),'trailing whitespace  \n');
 fs.writeFileSync(path.join(dir,'tests/control.test.cjs'),"require('node:test')('passing control',()=>{});\n");
 const readme=fs.readFileSync(path.join(repo,'README.md'),'utf8').replace(/\r\n/g,'\n'),command=readme.match(/```powershell\n(\$testFiles = [\s\S]*?)\n```/)[1];
 const runner=path.join(dir,'runner.ps1');fs.writeFileSync(runner,command+'\n');
 const shell='C:/Users/fatbo/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/powershell/pwsh.exe';
 const r=spawnSync(shell,['-NoProfile','-NonInteractive','-File',runner],{cwd:dir,env:gitEnv,encoding:'utf8',windowsHide:true});return {label,status:r.status,stdout:r.stdout,stderr:r.stderr};
}
const diffProbes=[probeDiff(base,'diff-baseline'),probeDiff(diff,'diff-mutant')];fs.writeFileSync(path.join(proof,'diff-probes.json'),JSON.stringify(diffProbes,null,2));console.log(JSON.stringify(diffProbes));
const raw=clone('mutant-normalize-hash');
mutate(raw,'orchestrate/tools/smoke-inputs.mjs',"createHash('sha256').update(bytes).digest('hex')","createHash('sha256').update(bytes.toString('utf8').replace(/\\r\\n/g, '\\n')).digest('hex')");
runTests(raw,'mutant-normalize-hash',['smoke-inputs'],'LF, CRLF, BOM and whitespace');
const revisions=clone('mutant-resolved-identities');
mutate(revisions,'orchestrate/tools/build-smoke-page.mjs','!isDeepStrictEqual(previousInputs.byStep.get(n), currentInputs.byStep.get(n))','!isDeepStrictEqual(previousInputs.byStep.get(n).map(input => input.id), currentInputs.byStep.get(n).map(input => input.id))');
runTests(revisions,'mutant-resolved-identities',['build-smoke-page','smoke-page'],'shared stable IDs|real input reissue');
const history=clone('mutant-history');
mutate(history,'orchestrate/tools/build-smoke-page.mjs','  compareInputHistory(currentInputs, previousInputs);','  // MUTANT: drop immutable history comparison.');
runTests(history,'mutant-history',['build-smoke-page'],'LF/CRLF-only reissue');
fs.writeFileSync(path.join(proof,'runs.json'),JSON.stringify({source,candidate:'7a3ab268a0b318ce080065df628cb1b2386ed980',runs,outputProbes,diffProbes},null,2));
