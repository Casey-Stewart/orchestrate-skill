# C1 step 11 — independent QA

Verdict: PASS

Tested SHA: 6c84b930aa4297283f94ce9eeacdff44d2b22ba4

Step revision: 1

Environment: Windows; Node v22.22.3; Git 2.52.0.windows.1; PowerShell 7.6.5; literal python C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe, Python 3.10.6 / openpyxl 3.1.5; Codex In-app Browser via CUA at http://127.0.0.1:8765/.

Do: Use disposable before/after packages to change workbook contents and reissue on the same build. Exercise the generated pages and saved demo verdicts.

Pass: Unchanged affected revision is refused. A new issue path and increased revision succeed; the prior affected pass becomes NOT RE-RUN while unrelated pass and notes survive. Original input sets remain intact.

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\scripts\\c1-reissue-proof.mjs","C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int","C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof.json"]}

Exit code: 0

Output tail:

~~~text
PASS: raw line-ending tamper rejection preserves HTML; every shared-input step needs revision bump; same-build workbook reissue rejects old revision and accepts new issue/revision; issued bytes unchanged
~~~

Full report: [reissue-proof.json](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/reissue-proof.json>); full output: [reissue.log](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/reissue.log>).

Builder workbook calls:

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\orchestrate\\tools\\build-smoke-page.mjs","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\workbook\\smoke-C1-demo-before.json","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\workbook\\probe.html"]}

Exit code: 0

Output tail:

~~~text
C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\reissue-proof-bYOLsf\workbook\probe.html: 57948 bytes, 0 unfilled slots
~~~

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\orchestrate\\tools\\build-smoke-page.mjs","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\workbook\\unchanged-revision.json","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\workbook\\probe.html","--previous","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\workbook\\smoke-C1-demo-before.json"]}

Exit code: 1

Output tail:

~~~text
C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\reissue-proof-bYOLsf\workbook\unchanged-revision.json: step 1: instructions or section context changed, or resolved inputs changed; increment revision above 1
~~~

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\orchestrate\\tools\\build-smoke-page.mjs","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\workbook\\smoke-C1-demo-after.json","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\workbook\\probe.html","--previous","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\reissue-proof-bYOLsf\\workbook\\smoke-C1-demo-before.json"]}

Exit code: 0

Output tail:

~~~text
C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\reissue-proof-bYOLsf\workbook\probe.html: 57916 bytes, 0 unfilled slots
~~~

Browser diagnostic used UI only: clean Before → Pass step1 → Works-but step2 → fill “keep this note” → Pass step2 → After → Copy results. This extra note-entry route is diagnostic, not a claim that current human Step2 prose passes (see Step10 FAIL). Actual export records “1. NOT RE-RUN — previous PASS” and “2. PASS — keep this note”; main C1 storage remains isolated.

Evidence: [demo-before-diagnostic.txt](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/demo-before-diagnostic.txt>), [demo-before-note.png](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/demo-before-note.png>), [demo-after-diagnostic.txt](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/demo-after-diagnostic.txt>), [demo-after-copy.txt](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/demo-after-copy.txt>), [demo-after-bottom.png](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/demo-after-bottom.png>), [demo-after-rerun.png](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/demo-after-rerun.png>).

After evidence capture, clear both verdicts through UI and remove note with Ctrl+A/Backspace; navigate back to Before and confirm zero passes/two unmarked/no note. Reset evidence: [demo-reset-before.txt](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/demo-reset-before.txt>) and [demo-reset-before.png](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/demo-reset-before.png>). Same tested SHA; demo step1 revision1→2, unaffected demo step2 revision1 retained. Original issue001/002 files preserved.
