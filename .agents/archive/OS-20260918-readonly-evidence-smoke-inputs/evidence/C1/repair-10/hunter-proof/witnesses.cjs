const fs=require('node:fs'), path=require('node:path'), {spawnSync}=require('node:child_process');
const root=__dirname, ledger='.agents/changes/OS-20260918-readonly-evidence-smoke-inputs';
const helper=fs.readFileSync(path.join(root,'cases/candidate',ledger,'c1-demo-instructions.test.cjs'),'utf8').split("test('clean Pass")[0];
const scenarios={
  'wrong-prerequisite-verdict': `
    before.click(1, 'Works, but');
    before.click(2, 'Works, but'); before.note(2, 'keep this note'); before.click(2, 'Pass');
  `,
  'wrong-note-step': `
    before.click(1, 'Pass');
    before.click(1, 'Works, but'); before.note(1, 'keep this note'); before.click(1, 'Pass');
  `,
  'stale-after-visible-instructions': `
    before.click(1, 'Pass');
    before.click(2, 'Works, but'); before.note(2, 'keep this note'); before.click(2, 'Pass');
  `
};
const results=[];
for (const [name,actions] of Object.entries(scenarios)) {
  const dir=path.join(root,'cases',name,ledger), file=path.join(dir,'witness.cjs');
  const checks=name==='wrong-prerequisite-verdict'
    ? `assert.match(exported,/1\\. NOT RE-RUN — previous WORKS, BUT/); assert.doesNotMatch(exported,/1\\. NOT RE-RUN — previous PASS/);`
    : name==='wrong-note-step'
      ? `assert.match(exported,/2\\. NOT RUN/); assert.doesNotMatch(exported,/2\\. PASS — keep this note/);`
      : `assert.match(visible,/Step 1 must say NOT RE-RUN/); assert.doesNotMatch(history.textContent,/NOT RE-RUN/); assert.match(history.textContent,/Run it again/); assert.match(exported,/1\\. NOT RE-RUN — previous PASS/);`;
  fs.writeFileSync(file,helper+`\n(async()=>{\nconst before=await page(beforeHTML);\n${actions}\nconst after=await page(afterHTML,before.storage);\nconst history=after.el('step-1').querySelector('.step-history');\nconst exported=after.copy();\nconst visible=afterHTML.match(/<p class="standfirst">([\\s\\S]*?)<\\/p>/)[1];\nconsole.log(JSON.stringify({scenario:${JSON.stringify(name)},actions:${JSON.stringify(actions.trim())},visible,history:{hidden:history.hidden,text:history.textContent},step1:after.record(1),step2:after.record(2),exported},null,2));\n${checks}\n})().catch(e=>{console.error(e);process.exitCode=1;});\n`);
  const args=[path.relative(root,file)], r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});
  fs.writeFileSync(path.join(root,'proof',name+'.witness.txt'),(r.stdout||'')+(r.stderr||''));
  results.push({name,exe:process.execPath,args,cwd:root,exit:r.status,log:`proof/${name}.witness.txt`});
  console.log(`${name}: witness exit ${r.status}\n${(r.stdout||'').split('\n').filter(l=>l.includes('"text"')||l.includes('"exported"')).join('\n')}`);
  if(r.status!==0) process.exitCode=1;
}
fs.writeFileSync(path.join(root,'proof','witness-results.json'),JSON.stringify(results,null,2));
