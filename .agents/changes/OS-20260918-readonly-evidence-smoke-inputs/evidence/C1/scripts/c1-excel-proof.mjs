// Run with the ledger's verified Python directory prepended to process PATH.
// Every Python invocation is deliberately the literal command `python`.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const [repoArg,checkoutReportArg,scratchArg,reportArg]=process.argv.slice(2);
assert(reportArg,'Usage: node c1-excel-proof.mjs <repo> <issued-checkout-report.json> <scratch> <report.json>');
const repo=path.resolve(repoArg),checkout=JSON.parse(fs.readFileSync(checkoutReportArg,'utf8'));
assert.equal(checkout.verdict,'PASS');
const ledger='.agents/changes/OS-20260918-readonly-evidence-smoke-inputs';
const issued=path.join(repo,ledger,'evidence/C1/inputs/issue-001');
fs.mkdirSync(scratchArg,{recursive:true});const scratch=fs.mkdtempSync(path.join(path.resolve(scratchArg),'excel-proof-'));
const commands=[];
function python(args,expected=0){const r=spawnSync('python',args,{cwd:repo,encoding:'utf8',windowsHide:true,shell:false,timeout:120000,maxBuffer:4*1024*1024});commands.push({command:'python',args,exit:r.status,stdout:r.stdout,stderr:r.stderr});assert(!r.error,String(r.error));assert.equal(r.status,expected,JSON.stringify(commands.at(-1)));return r;}
const version=python(['-c','import sys,openpyxl; print(sys.executable); print(sys.version); print(openpyxl.__version__); assert sys.version_info[:3]==(3,10,6); assert openpyxl.__version__=="3.1.5"']);
const workbook=path.join(issued,'orders.xlsx'),requirements=path.join(issued,'orders.requirements.json'),validator=path.join(issued,'validate-orders.py'),generator=path.join(issued,'generate-orders.py');
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const before=Object.fromEntries([workbook,requirements,validator,generator].map(p=>[p,hash(p)]));
python([validator,workbook,requirements]);
const generated=[path.join(scratch,'generation-A.xlsx'),path.join(scratch,'generation-B.xlsx')];
for(const file of generated){python([generator,file]);python([validator,file,requirements]);}
const committedWorkbook=path.join(checkout.actualClone,'tests/fixtures/smoke-inputs/orders.xlsx');
const committedIssued=path.join(checkout.actualClone,ledger,'evidence/C1/inputs/issue-001/orders.xlsx');
for(const file of [committedWorkbook,committedIssued])python([validator,file,requirements]);
const fileHashes=[...generated,committedWorkbook,committedIssued,workbook].map(p=>({path:p,sha256:hash(p)}));
assert.equal(new Set(fileHashes.map(x=>x.sha256)).size,1,'A/B/committed/issued raw workbook bytes differ');
const corrupt=path.join(scratch,'corrupt-total.xlsx');
const mutate=`import sys,zipfile,xml.etree.ElementTree as ET
from pathlib import Path
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
source,target=map(Path,sys.argv[1:])
with zipfile.ZipFile(source) as old,zipfile.ZipFile(target,'x') as new:
 for info in old.infolist():
  data=old.read(info.filename)
  if info.filename=='xl/worksheets/sheet2.xml':
   root=ET.fromstring(data)
   cell=root.find('.//s:c[@r="B2"]/s:v',ns)
   assert cell is not None and cell.text=='23.5'
   cell.text='999'
   data=ET.tostring(root,encoding='utf-8')
  new.writestr(info,data)
print('Changed only Summary!B2 cached value to 999 in disposable workbook')`;
python(['-c',mutate,workbook,corrupt]);
const rejected=python([validator,corrupt,requirements],1);
assert.match(rejected.stderr,/Summary!B2\.cached/,'Corruption must fail the named semantic requirement');
const assertMath=`import sys,openpyxl
from decimal import Decimal,ROUND_HALF_UP
f=openpyxl.load_workbook(sys.argv[1],data_only=False)
v=openpyxl.load_workbook(sys.argv[1],data_only=True)
assert f.sheetnames==['Orders','Summary','Types']
amounts=[]
for row in range(2,6):
 q,p,d=(Decimal(str(f['Orders'].cell(row,c).value)) for c in (3,4,5))
 amount=(q*p*(1-d)).quantize(Decimal('.01'),rounding=ROUND_HALF_UP)
 amounts.append(amount)
 assert Decimal(str(v['Orders'].cell(row,6).value))==amount
 assert f['Orders'].cell(row,1).data_type=='s'
 assert f['Orders'].cell(row,1).value==str(row-1).zfill(4)
assert sum(amounts)==Decimal('23.50')
assert Decimal(str(v['Summary']['B2'].value))==sum(amounts)
assert v['Summary']['B3'].value==4
assert f['Types']['B2'].data_type=='b' and f['Types']['B2'].value is True
f.close();v.close()
print('Independent Decimal arithmetic confirms all line caches,total23.50,count4; text IDs and true boolean retained')`;
python(['-c',assertMath,workbook]);
for(const [file,digest]of Object.entries(before))assert.equal(hash(file),digest,'Issued source changed');
const report={verdict:'PASS',testedCommit:checkout.testedCommit,environment:version.stdout.trim(),scratch,fileHashes,corruption:{path:corrupt,requirement:'Summary!B2.cached',exit:1},commands,originalsUnchanged:true};
fs.writeFileSync(path.resolve(reportArg),JSON.stringify(report,null,2)+'\n');
console.log(`PASS: independent semantics, named corruption rejection, generation A = B = committed fixture = committed issued workbook; SHA256 ${fileHashes[0].sha256}`);
