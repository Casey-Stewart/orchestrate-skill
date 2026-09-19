# C1 step 05 — independent QA

Verdict: PASS

Tested SHA: 6c84b930aa4297283f94ce9eeacdff44d2b22ba4

Step revision: 1

Environment: Windows; Node v22.22.3; Git 2.52.0.windows.1; PowerShell 7.6.5; literal python C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe, Python 3.10.6 / openpyxl 3.1.5; Codex In-app Browser via CUA at http://127.0.0.1:8765/.

Do: Use literal python and the delivered independent validator against the actual issued workbook and requirements. Corrupt a disposable copy and rerun.

Pass: All three sheets, 47 cells, six formulas/caches and declared edge cases pass; total 23.50 and count 4. The corrupted copy fails a named requirement.

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\scripts\\c1-excel-proof.mjs","C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\checkout-proof.json","C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\excel-proof.json"]}

Exit code: 0

Output tail:

~~~text
PASS: independent semantics, named corruption rejection, generation A = B = committed fixture = committed issued workbook; SHA256 e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f
~~~

Full report: [excel-proof.json](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/excel-proof.json>); full output: [excel.log](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/excel.log>).

Process-only setup before Node: $env:Path = 'C:/Users/fatbo/AppData/Local/Programs/Python/Python310;' + $env:Path. All nested interpreter tokens are literal python. The independently supplied openpyxl validator checks formula and data_only views of the actual workbook: 3 sheets, 47 cells, 6 formulas/caches, all declared edges; independent Decimal arithmetic also verifies line caches,total 23.50,count 4.

Command and exact argument array: {"exe":"python","args":["-c","import sys,openpyxl; print(sys.executable); print(sys.version); print(openpyxl.__version__); assert sys.version_info[:3]==(3,10,6); assert openpyxl.__version__==\"3.1.5\""]}

Exit code: 0

Output tail:

~~~text
C:\Users\fatbo\AppData\Local\Programs\Python\Python310\python.exe
3.10.6 (tags/v3.10.6:9c7b4bd, Aug  1 2022, 21:53:49) [MSC v.1932 64 bit (AMD64)]
3.1.5
~~~

Command and exact argument array: {"exe":"python","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\validate-orders.py","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\orders.xlsx","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\orders.requirements.json"]}

Exit code: 0

Output tail:

~~~text
PASS C:\Users\fatbo\.codex\visualizations\2026\09\18\01a0b671-3325-77d3-b360-845f09da4bdc\orchestrate-run\wt-int\.agents\changes\OS-20260918-readonly-evidence-smoke-inputs\evidence\C1\inputs\issue-001\orders.xlsx: 3 sheets, 47 declared cells, 6 formulas and numeric caches
PASS leading-zero text IDs; numeric zero/negative/discount edges; Unicode; date; boolean; empty cells
PASS Summary!B2 cached total 23.50; Summary!B3 cached order count 4; no macros/external links/errors
~~~

Command and exact argument array: {"exe":"python","args":["-c","import sys,zipfile,xml.etree.ElementTree as ET\nfrom pathlib import Path\nns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}\nsource,target=map(Path,sys.argv[1:])\nwith zipfile.ZipFile(source) as old,zipfile.ZipFile(target,'x') as new:\n for info in old.infolist():\n  data=old.read(info.filename)\n  if info.filename=='xl/worksheets/sheet2.xml':\n   root=ET.fromstring(data)\n   cell=root.find('.//s:c[@r=\"B2\"]/s:v',ns)\n   assert cell is not None and cell.text=='23.5'\n   cell.text='999'\n   data=ET.tostring(root,encoding='utf-8')\n  new.writestr(info,data)\nprint('Changed only Summary!B2 cached value to 999 in disposable workbook')","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\orders.xlsx","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\excel-proof-kR5fQl\\corrupt-total.xlsx"]}

Exit code: 0

Output tail:

~~~text
Changed only Summary!B2 cached value to 999 in disposable workbook
~~~

Command and exact argument array: {"exe":"python","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\validate-orders.py","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\excel-proof-kR5fQl\\corrupt-total.xlsx","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\orders.requirements.json"]}

Exit code: 1

Output tail:

~~~text
FAIL requirement Summary!B2.cached: expected 23.5; found 999
~~~

Command and exact argument array: {"exe":"python","args":["-c","import sys,openpyxl\nfrom decimal import Decimal,ROUND_HALF_UP\nf=openpyxl.load_workbook(sys.argv[1],data_only=False)\nv=openpyxl.load_workbook(sys.argv[1],data_only=True)\nassert f.sheetnames==['Orders','Summary','Types']\namounts=[]\nfor row in range(2,6):\n q,p,d=(Decimal(str(f['Orders'].cell(row,c).value)) for c in (3,4,5))\n amount=(q*p*(1-d)).quantize(Decimal('.01'),rounding=ROUND_HALF_UP)\n amounts.append(amount)\n assert Decimal(str(v['Orders'].cell(row,6).value))==amount\n assert f['Orders'].cell(row,1).data_type=='s'\n assert f['Orders'].cell(row,1).value==str(row-1).zfill(4)\nassert sum(amounts)==Decimal('23.50')\nassert Decimal(str(v['Summary']['B2'].value))==sum(amounts)\nassert v['Summary']['B3'].value==4\nassert f['Types']['B2'].data_type=='b' and f['Types']['B2'].value is True\nf.close();v.close()\nprint('Independent Decimal arithmetic confirms all line caches,total23.50,count4; text IDs and true boolean retained')","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\orders.xlsx"]}

Exit code: 0

Output tail:

~~~text
Independent Decimal arithmetic confirms all line caches,total23.50,count4; text IDs and true boolean retained
~~~

The deliberate Summary!B2 cache corruption is rejected with the named requirement and exit 1. Originals unchanged: true.
