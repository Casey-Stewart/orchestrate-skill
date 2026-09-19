const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const repo='C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/wt-C1-repair';
const prefix=['--no-optional-locks','-c',`safe.directory=${repo}`,'-c','core.longpaths=true','-C',repo];
const results=[];
for(const args of [
  ['diff','--check','ebdde4fc2354f0280b91a5225219950bec7e696b...f2c2ceeb73a8adeee5dd2249a97df84bb1a19134'],
  ['status','--porcelain']
]) {
  const command=[...prefix,...args],r=spawnSync('git',command,{encoding:'utf8'});
  results.push({exe:'git',args:command,exit:r.status,stdout:r.stdout,stderr:r.stderr});
}
fs.writeFileSync('proof/git-audit.json',JSON.stringify(results,null,2));
console.log(results.map(r=>`${r.args.includes('status')?'status':'diff --check'}: exit ${r.exit}; stdout ${JSON.stringify(r.stdout)}`).join('\n'));
if(results.some(r=>r.exit!==0))process.exitCode=1;
