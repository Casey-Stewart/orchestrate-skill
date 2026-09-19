# C1 step 09 — independent QA

Verdict: PASS

Tested SHA: 6c84b930aa4297283f94ce9eeacdff44d2b22ba4

Step revision: 1

Environment: Windows; Node v22.22.3; Git 2.52.0.windows.1; PowerShell 7.6.5; literal python C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe, Python 3.10.6 / openpyxl 3.1.5; Codex In-app Browser via CUA at http://127.0.0.1:8765/.

Do: In a disposable package change only LF/CRLF bytes in a declared text input. Try building with its stale hash, then update its path/hash without changing revisions.

Pass: Stale bytes are rejected before replacing the old HTML. Updated input identity still requires every referencing step’s revision to increase.

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\scripts\\c1-reissue-proof.mjs","C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int","C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof.json"]}

Exit code: 0

Output tail:

~~~text
PASS: raw line-ending tamper rejection preserves HTML; every shared-input step needs revision bump; same-build workbook reissue rejects old revision and accepts new issue/revision; issued bytes unchanged
~~~

Full report: [reissue-proof.json](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/reissue-proof.json>); full output: [reissue.log](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/reissue.log>).

Actual production CLI outcomes for raw LF→CRLF and revisions:

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\orchestrate\\tools\\build-smoke-page.mjs","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\text\\smoke-C1.json","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\text\\probe.html"]}

Exit code: 0

Output tail:

~~~text
C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\reissue-proof-bYOLsf\text\probe.html: 165481 bytes, 0 unfilled slots
~~~

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\orchestrate\\tools\\build-smoke-page.mjs","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\text\\smoke-C1.json","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\text\\probe.html"]}

Exit code: 1

Output tail:

~~~text
C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\reissue-proof-bYOLsf\text\smoke-C1.json: input artifact evidence/C1/inputs/issue-001/text/lf-input.txt: size mismatch (expected 79, read 82)
~~~

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\orchestrate\\tools\\build-smoke-page.mjs","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\text\\changed.json","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\text\\probe.html","--previous","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\text\\previous.json"]}

Exit code: 1

Output tail:

~~~text
C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\reissue-proof-bYOLsf\text\changed.json: step 7: instructions or section context changed, or resolved inputs changed; increment revision above 1
~~~

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\orchestrate\\tools\\build-smoke-page.mjs","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\text\\changed.json","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\text\\probe.html","--previous","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\text\\previous.json"]}

Exit code: 1

Output tail:

~~~text
C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\reissue-proof-bYOLsf\text\changed.json: step 9: instructions or section context changed, or resolved inputs changed; increment revision above 1
~~~

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\orchestrate\\tools\\build-smoke-page.mjs","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\text\\changed.json","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\text\\probe.html","--previous","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\text\\previous.json"]}

Exit code: 0

Output tail:

~~~text
C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\reissue-proof-bYOLsf\text\probe.html: 161517 bytes, 0 unfilled slots
~~~

LF→CRLF changes raw size 79→82 and digest. Stale identity rejects before replacing HTML. New path/hash/evidence still rejects unchanged revisions; bumping only one reference rejects; all affected steps 7, 9, 10, 11 incremented permits the build. Prior input sets and live inputs unchanged.
