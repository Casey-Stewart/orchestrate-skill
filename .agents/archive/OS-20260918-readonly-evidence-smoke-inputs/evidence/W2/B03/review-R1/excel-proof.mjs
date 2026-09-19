import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const proofRoot=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, '$1'));
const repo=path.resolve(proofRoot,'../wt-B03');
const root=fs.mkdtempSync(path.join(proofRoot,'completed-excel-proof-'));
const log=[];
const empty=path.join(root,'empty.gitconfig');fs.writeFileSync(empty,'');
const env={...Object.fromEntries(Object.entries(process.env).filter(([k])=>!/^GIT_/i.test(k))),GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:empty,GIT_TERMINAL_PROMPT:'0'};
function run(command,args,cwd=repo,expected=0){const r=spawnSync(command,args,{cwd,env,encoding:'utf8',windowsHide:true});log.push({command,args,cwd,exit:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(root,'excel-commands.json'),JSON.stringify(log,null,2));assert.ifError(r.error);assert.equal(r.status,expected,r.stdout+r.stderr);return r.stdout;}
const git=(cwd,...args)=>run('git',['-c','core.longpaths=true','-c','safe.directory='+repo,...args],cwd);
const fixture=path.join(repo,'tests/fixtures/smoke-inputs');
const sha='7a3ab268a0b318ce080065df628cb1b2386ed980';
assert.equal(git(repo,'rev-parse','HEAD').trim(),sha);
run('python',['-c','import sys,openpyxl; print(sys.executable); print(sys.version); print(openpyxl.__version__); assert sys.version_info[:3]==(3,10,6); assert openpyxl.__version__=="3.1.5"']);
for(const x of ['A','B'])run('python',[path.join(fixture,'generate-orders.py'),path.join(root,`generated-${x}.xlsx`)]);
run('python',[path.join(fixture,'validate-orders.py'),path.join(fixture,'orders.xlsx'),path.join(fixture,'orders.requirements.json')]);
const clone=path.join(root,'checkout');
git(root,'clone','--no-checkout','--no-hardlinks',repo,clone);
git(clone,'config','--local','core.autocrlf','true');
assert.equal(git(clone,'config','--get','core.autocrlf').trim(),'true');
git(clone,'checkout','--detach',sha);
const digest=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const hashes=['A','B'].map(x=>digest(path.join(root,`generated-${x}.xlsx`)));
hashes.push(digest(path.join(clone,'tests/fixtures/smoke-inputs/orders.xlsx')));
assert.equal(new Set(hashes).size,1);assert.equal(hashes[0],'e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f');
for(const name of fs.readdirSync(fixture)){const rel='tests/fixtures/smoke-inputs/'+name;assert.equal(digest(path.join(repo,rel)),digest(path.join(clone,rel)));const attrs=git(clone,'check-attr','text','eol','filter','ident','working-tree-encoding','--',rel);assert.ok(attrs.trim().split('\n').every(l=>l.endsWith(': unset')));}
const readme=fs.readFileSync(path.join(clone,'README.md'),'utf8');assert.ok(readme.includes('\r\n'));
run('python',['-c',`import openpyxl,sys,datetime,decimal,zipfile
p=sys.argv[1]; f=openpyxl.load_workbook(p,data_only=False); v=openpyxl.load_workbook(p,data_only=True)
assert f.sheetnames==['Orders','Summary','Types']
assert f['Orders']['A2'].value=='0001' and f['Orders']['A2'].data_type=='s'
assert f['Orders']['F2'].value=='=ROUND(C2*D2*(1-E2),2)' and v['Orders']['F2'].value==22.5
assert f['Summary']['B2'].value=='=SUM(Orders!F2:F5)' and v['Summary']['B2'].value==23.5
assert f['Summary']['B3'].value=='=COUNTA(Orders!A2:A5)' and v['Summary']['B3'].value==4
assert f['Types']['A2'].value==datetime.datetime(2026,9,18)
assert f['Types']['B2'].value is True and f['Types']['B2'].data_type=='b'
assert f['Types']['C2'].value is None
total=sum(decimal.Decimal(str(f['Orders'].cell(r,3).value))*decimal.Decimal(str(f['Orders'].cell(r,4).value))*(1-decimal.Decimal(str(f['Orders'].cell(r,5).value))) for r in range(2,6))
assert total==decimal.Decimal('23.5')
with zipfile.ZipFile(p) as src,zipfile.ZipFile(sys.argv[2],'w') as dst:
 for entry in src.infolist():
  b=src.read(entry.filename)
  if entry.filename=='xl/worksheets/sheet1.xml':
   import xml.etree.ElementTree as ET
   tree=ET.fromstring(b); ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
   tree.find('.//m:c[@r="C2"]/m:v',ns).text='3'; b=ET.tostring(tree)
  dst.writestr(entry,b)
print('Independent semantics passed; deliberate corruption created')`,path.join(fixture,'orders.xlsx'),path.join(root,'corrupt.xlsx')]);
const r=run('python',[path.join(fixture,'validate-orders.py'),path.join(root,'corrupt.xlsx'),path.join(fixture,'orders.requirements.json')],repo,1);
assert.match(r+log.at(-1).stderr,/Orders!C2/);
fs.writeFileSync(path.join(root,'excel-proof.json'),JSON.stringify({candidate:sha,hashes,fixtureFileCount:fs.readdirSync(fixture).length,pass:true},null,2));
console.log('PASS: literal Python environment, independent workbook semantics, named corruption, generation A/B/committed-byte equality, fixture attributes and fresh autocrlf checkout');
