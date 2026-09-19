import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const [repo,scratch,commit]=process.argv.slice(2), root=fs.mkdtempSync(path.join(scratch,'committed-check-'));
const empty=path.join(root,'empty-config'), template=path.join(root,'empty-template');
fs.writeFileSync(empty,'');fs.mkdirSync(template);
const env={...Object.fromEntries(Object.entries(process.env).filter(([k])=>!/^GIT_/i.test(k))),
  GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:empty,GIT_TEMPLATE_DIR:template,GIT_TERMINAL_PROMPT:'0'};
function git(cwd,args) {
 const r=spawnSync('git',args,{cwd,env,encoding:'utf8',windowsHide:true});
 if(r.status!==0)throw new Error(r.stderr);return r.stdout.trim();
}
const checkout=path.join(root,'checkout');
git(root,['clone','--no-checkout','--no-hardlinks',repo,checkout]);
git(checkout,['config','--local','core.autocrlf','true']);
git(checkout,['config','--local','core.longpaths','true']);
if(git(checkout,['config','--get','core.autocrlf'])!=='true')throw new Error('autocrlf not true');
git(checkout,['checkout','--detach',commit]);
if(git(checkout,['rev-parse','HEAD'])!==commit||git(checkout,['status','--porcelain']))throw new Error('Checkout not exact/clean');
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const inputs=[path.join(scratch,'generation-A.xlsx'),path.join(scratch,'generation-B.xlsx'),path.join(checkout,'tests/fixtures/smoke-inputs/orders.xlsx')];
const hashes=inputs.map(file=>({file,sha256:hash(file)}));
if(new Set(hashes.map(h=>h.sha256)).size!==1)throw new Error('A/B/committed raw file hashes differ');
const fixtures=['orders.xlsx','orders.requirements.json','generate-orders.py','validate-orders.py'].map(name=>{
 const relative='tests/fixtures/smoke-inputs/'+name, source=hash(path.join(repo,relative)), actual=hash(path.join(checkout,relative));
 if(source!==actual)throw new Error('Fresh fixture bytes differ: '+name);
 const attrs=git(checkout,['check-attr','text','eol','filter','ident','working-tree-encoding','--',relative]);
 if(!attrs.split('\n').every(l=>l.endsWith(': unset')))throw new Error(attrs);
 return {path:relative,sha256:actual,attributes:attrs};
});
if(!fs.readFileSync(path.join(checkout,'README.md'),'utf8').includes('\r\n'))throw new Error('Unprotected README conversion control failed');
const report={commit,checkout,command:'clone --no-checkout --no-hardlinks; config --local core.autocrlf true; checkout --detach captured SHA',
 result:'PASS SHA256(generation A) = SHA256(generation B) = SHA256(committed workbook file bytes)',hashes,fixtures,unprotectedREADME:'CRLF conversion confirmed',clean:true};
fs.writeFileSync(path.join(scratch,'committed-workbook-proof.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
