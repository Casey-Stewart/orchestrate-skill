# C1 step 10 — independent QA

Verdict: FAIL

Tested SHA: 6c84b930aa4297283f94ce9eeacdff44d2b22ba4

Step revision: 1

Environment: Windows; Node v22.22.3; Git 2.52.0.windows.1; PowerShell 7.6.5; literal python C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe, Python 3.10.6 / openpyxl 3.1.5; Codex In-app Browser via CUA at http://127.0.0.1:8765/.

Do: Validate every declared delivered file and evidence link, then inspect this generated page in a browser.

Pass: The current page and exact files are usable; linked bytes match declarations. Expected workbook total 23.50 and count 4 and working-copy/reset instructions are explicit; no manual data construction is required.

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\independent-link-check.mjs","C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int","C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA"]}

Exit code: 0

Output tail:

~~~text
PASS: 14 declared input/evidence files and 2 other linked pages served exact bytes; raw hashes/sizes and working-copy instructions verified
~~~

Full report: [link-proof.json](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/link-proof.json>); full output: [links.log](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/links.log>).

All 14 declared input/evidence files and both rendered demo links serve exact bytes; 108 rendered links inspected via CUA DOM. Hashes, sizes, workbook total23.50/count4 and explicit working-copy/reset commands verified. Main screenshot: [main-initial.png](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/main-initial.png>). Actual human steps remain unmarked. No native Excel application claim.

FAIL: C1 human Step2 and Before demonstration direct a clean user to mark both steps Pass and then enter a note. A clean Pass has no visible note textbox. DOM proof [demo-pass-no-note.txt](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/demo-pass-no-note.txt>) and screenshot [demo-pass-no-note.png](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/demo-pass-no-note.png>). Production template intentionally shows note only for fail/blocked/change or existing note (orchestrate/references/smoke-page-template.html:1243–1245). Thus delivered instructions cannot be followed as written. No source or sidecar edited.

Step0 additionally PASS:

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\scripts\\c1-canary.mjs","C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int"]}

Exit code: 0

Output tail:

~~~text
  "branch": "codex/readonly-evidence-smoke-inputs-ledger",
  "testedSHA": "6c84b930aa4297283f94ce9eeacdff44d2b22ba4",
  "head": "6c84b930aa4297283f94ce9eeacdff44d2b22ba4",
  "scratch": "C:\\Users\\fatbo\\AppData\\Local\\Temp\\orchestrate-c1-canary-S1tNOM",
  "intactInputsValidated": true,
  "mutatedInput": "C:\\Users\\fatbo\\AppData\\Local\\Temp\\orchestrate-c1-canary-S1tNOM\\checkpoint\\evidence\\C1\\inputs\\issue-001\\orders.xlsx",
  "originalSha256": "e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f",
  "mutatedSha256": "5833d64b164814fe1ddc5f2f9240d0adff043ead7a62f81e3acae9160cc6ea8b",
  "current": {
    "exit": 1,
    "stderr": "C:\\Users\\fatbo\\AppData\\Local\\Temp\\orchestrate-c1-canary-S1tNOM\\checkpoint\\smoke-C1.json: input artifact evidence/C1/inputs/issue-001/orders.xlsx: SHA-256 mismatch for raw file bytes",
    "oldHTMLPreserved": true
  },
  "starting": {
    "sha": "f918fe39762c70edb9a3424e54eaa208fd7c5727",
    "exit": 0,
    "output": "C:\\Users\\fatbo\\AppData\\Local\\Temp\\orchestrate-c1-canary-S1tNOM\\checkpoint\\baseline-accepted.html: 56299 bytes, 0 unfilled slots"
  },
  "verdict": "PASS: current rejects tampered bytes; starting builder accepts/ignores them"
}
~~~

Full Step0 report: [canary.log](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/canary.log>). Verified branch, SHA ancestry, source equality/cleanliness, intact actual input validation, new builder rejects tampered workbook digest exit1 and leaves old HTML untouched, starting f918 builder plus matching old template accepts exit0.


Browser wording diagnostic: After visibly says “PASS (carried over from build 6c84b930aa4297283f94ce9eeacdff44d2b22ba4). Step changed or its earlier build/revision is unknown. Run it again and select a verdict.” The progress count is re-run 1 / passed 1. The literal “NOT RE-RUN” appears in Copy results: “1. NOT RE-RUN — previous PASS …; re-run required” and “2. PASS — keep this note”. See C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/demo-after-diagnostic.txt and C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/demo-after-copy.txt. This diagnostic used Works-but → type note → Pass, a missing instruction in the tested prose, and does not waive this FAIL.
