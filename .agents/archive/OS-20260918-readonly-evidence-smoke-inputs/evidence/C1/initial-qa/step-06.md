# C1 step 06 — independent QA

Verdict: PASS

Tested SHA: 6c84b930aa4297283f94ce9eeacdff44d2b22ba4

Step revision: 1

Environment: Windows; Node v22.22.3; Git 2.52.0.windows.1; PowerShell 7.6.5; literal python C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe, Python 3.10.6 / openpyxl 3.1.5; Codex In-app Browser via CUA at http://127.0.0.1:8765/.

Do: Generate workbooks A and B into distinct new paths. Independently validate them and the workbook materialized from the recorded commit in a fresh checkout.

Pass: SHA256(A) = SHA256(B) = SHA256(committed workbook file bytes), and independent semantic validation passes. File-content hashes are recorded with all three paths and the tested commit.

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\scripts\\c1-excel-proof.mjs","C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\checkout-proof.json","C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\excel-proof.json"]}

Exit code: 0

Output tail:

~~~text
PASS: independent semantics, named corruption rejection, generation A = B = committed fixture = committed issued workbook; SHA256 e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f
~~~

Full report: [excel-proof.json](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/excel-proof.json>); full output: [excel.log](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/excel.log>).

Process PATH prefixed with the pinned Python310 directory; literal python used throughout. Generation and each semantic validation command:

Command and exact argument array: {"exe":"python","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\generate-orders.py","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\excel-proof-kR5fQl\\generation-A.xlsx"]}

Exit code: 0

Output tail:

~~~text
Created synthetic Orders workbook: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\excel-proof-kR5fQl\generation-A.xlsx (8634 bytes)
~~~

Command and exact argument array: {"exe":"python","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\validate-orders.py","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\excel-proof-kR5fQl\\generation-A.xlsx","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\orders.requirements.json"]}

Exit code: 0

Output tail:

~~~text
PASS C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\excel-proof-kR5fQl\generation-A.xlsx: 3 sheets, 47 declared cells, 6 formulas and numeric caches
PASS leading-zero text IDs; numeric zero/negative/discount edges; Unicode; date; boolean; empty cells
PASS Summary!B2 cached total 23.50; Summary!B3 cached order count 4; no macros/external links/errors
~~~

Command and exact argument array: {"exe":"python","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\generate-orders.py","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\excel-proof-kR5fQl\\generation-B.xlsx"]}

Exit code: 0

Output tail:

~~~text
Created synthetic Orders workbook: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\excel-proof-kR5fQl\generation-B.xlsx (8634 bytes)
~~~

Command and exact argument array: {"exe":"python","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\validate-orders.py","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\excel-proof-kR5fQl\\generation-B.xlsx","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\orders.requirements.json"]}

Exit code: 0

Output tail:

~~~text
PASS C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\excel-proof-kR5fQl\generation-B.xlsx: 3 sheets, 47 declared cells, 6 formulas and numeric caches
PASS leading-zero text IDs; numeric zero/negative/discount edges; Unicode; date; boolean; empty cells
PASS Summary!B2 cached total 23.50; Summary!B3 cached order count 4; no macros/external links/errors
~~~

Command and exact argument array: {"exe":"python","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\validate-orders.py","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\issued-byte-proof-7mtRBH\\actual-checkout\\tests\\fixtures\\smoke-inputs\\orders.xlsx","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\orders.requirements.json"]}

Exit code: 0

Output tail:

~~~text
PASS C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\issued-byte-proof-7mtRBH\actual-checkout\tests\fixtures\smoke-inputs\orders.xlsx: 3 sheets, 47 declared cells, 6 formulas and numeric caches
PASS leading-zero text IDs; numeric zero/negative/discount edges; Unicode; date; boolean; empty cells
PASS Summary!B2 cached total 23.50; Summary!B3 cached order count 4; no macros/external links/errors
~~~

Command and exact argument array: {"exe":"python","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\validate-orders.py","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\issued-byte-proof-7mtRBH\\actual-checkout\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\orders.xlsx","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\orders.requirements.json"]}

Exit code: 0

Output tail:

~~~text
PASS C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\issued-byte-proof-7mtRBH\actual-checkout\.agents\changes\OS-20260918-readonly-evidence-smoke-inputs\evidence\C1\inputs\issue-001\orders.xlsx: 3 sheets, 47 declared cells, 6 formulas and numeric caches
PASS leading-zero text IDs; numeric zero/negative/discount edges; Unicode; date; boolean; empty cells
PASS Summary!B2 cached total 23.50; Summary!B3 cached order count 4; no macros/external links/errors
~~~

Raw SHA-256 file paths and contents (A, B, committed fixture, committed issued file, current issued file):

~~~json
[
  {
    "path": "C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\excel-proof-kR5fQl\\generation-A.xlsx",
    "sha256": "e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f"
  },
  {
    "path": "C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\excel-proof-kR5fQl\\generation-B.xlsx",
    "sha256": "e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f"
  },
  {
    "path": "C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\issued-byte-proof-7mtRBH\\actual-checkout\\tests\\fixtures\\smoke-inputs\\orders.xlsx",
    "sha256": "e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f"
  },
  {
    "path": "C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\issued-byte-proof-7mtRBH\\actual-checkout\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\orders.xlsx",
    "sha256": "e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f"
  },
  {
    "path": "C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\inputs\\issue-001\\orders.xlsx",
    "sha256": "e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f"
  }
]
~~~

The actual checkout is a new clone with core.autocrlf=true configured before its first checkout; see [checkout-proof.json](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/checkout-proof.json>). Hash equality is supplemented by independent semantics.
