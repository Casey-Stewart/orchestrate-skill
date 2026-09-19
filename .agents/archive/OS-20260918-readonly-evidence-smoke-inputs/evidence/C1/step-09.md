# C1 step 09 — independent QA

Verdict: PASS

Tested SHA: 49dfe07c09111197b8739aac2df0cea43c985cdf

Step revision: 1

Environment: Windows 11 Home 10.0.26200; Node v22.22.3; Git 2.52.0.windows.1; PowerShell 7.6.6; literal python C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe, Python 3.10.6 / openpyxl 3.1.5; Claude Code built-in Browser pane (Chromium) at http://127.0.0.1:8765/.

Do: In a disposable package change only LF/CRLF bytes in a declared text input. Try building with its stale hash, then update its path/hash without changing revisions.

Pass: Stale bytes are rejected before replacing the old HTML. Updated input identity still requires every referencing step’s revision to increase.

Command and exact argument array: {"exe":"node","args":["C:\Users\fatbo\.codex\visualizations\2026\09\18\01a0b671-3325-77d3-b360-845f09da4bdc\orchestrate-run\wt-int\.agents\changes\OS-20260918-readonly-evidence-smoke-inputs\evidence\C1\scripts\c1-reissue-proof.mjs","C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int","C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY","C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/reissue-proof.json"]}

Exit code: 0

Output tail:

~~~text
PASS: raw line-ending tamper rejection preserves HTML; every shared-input step needs revision bump; same-build workbook reissue rejects old revision and accepts new issue/revision; issued bytes unchanged
~~~

Full report: [reissue-proof.json](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/reissue-proof.json>); full output: [reissue.log](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/reissue.log>). Disposable package root: C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/reissue-proof-sro1Eu.

Actual production CLI outcomes for raw LF→CRLF and revisions (all four recorded from the report's `calls` array):

Command and exact argument array: {"exe":"node","args":["<wt-int>\orchestrate\tools\build-smoke-page.mjs","<scratch>\reissue-proof-sro1Eu\text\smoke-C1.json","<scratch>\reissue-proof-sro1Eu\text\probe.html"]}

Exit code: 0

Output tail:

~~~text
C:\Users\fatbo\AppData\Local\Temp\claude\...\C1-REVERIFY\reissue-proof-sro1Eu\text\probe.html: 165651 bytes, 0 unfilled slots
~~~

Command and exact argument array: {"exe":"node","args":["<wt-int>\orchestrate\tools\build-smoke-page.mjs","<scratch>\reissue-proof-sro1Eu\text\smoke-C1.json","<scratch>\reissue-proof-sro1Eu\text\probe.html"]}

Exit code: 1

Output tail:

~~~text
...\reissue-proof-sro1Eu\text\smoke-C1.json: input artifact evidence/C1/inputs/issue-001/text/lf-input.txt: size mismatch (expected 79, read 82)
~~~

Command and exact argument array: {"exe":"node","args":["<wt-int>\orchestrate\tools\build-smoke-page.mjs","<scratch>\reissue-proof-sro1Eu\text\changed.json","<scratch>\reissue-proof-sro1Eu\text\probe.html","--previous","<scratch>\reissue-proof-sro1Eu\text\previous.json"]}

Exit code: 1

Output tail:

~~~text
...\reissue-proof-sro1Eu\text\changed.json: step 7: instructions or section context changed, or resolved inputs changed; increment revision above 1
~~~

Command and exact argument array: {"exe":"node","args":["<wt-int>\orchestrate\tools\build-smoke-page.mjs","<scratch>\reissue-proof-sro1Eu\text\changed.json","<scratch>\reissue-proof-sro1Eu\text\probe.html","--previous","<scratch>\reissue-proof-sro1Eu\text\previous.json"]}

Exit code: 1

Output tail:

~~~text
...\reissue-proof-sro1Eu\text\changed.json: step 9: instructions or section context changed, or resolved inputs changed; increment revision above 1
~~~

Command and exact argument array: {"exe":"node","args":["<wt-int>\orchestrate\tools\build-smoke-page.mjs","<scratch>\reissue-proof-sro1Eu\text\changed.json","<scratch>\reissue-proof-sro1Eu\text\probe.html","--previous","<scratch>\reissue-proof-sro1Eu\text\previous.json"]}

Exit code: 0

Output tail:

~~~text
C:\Users\fatbo\AppData\Local\Temp\claude\...\C1-REVERIFY\reissue-proof-sro1Eu\text\probe.html: 161687 bytes, 0 unfilled slots
~~~

Re-run at the repaired build. I read `c1-reissue-proof.mjs` before running it and confirmed the claim that it never touches the live ledger: it `cpSync`s the whole ledger into a fresh `reissue-proof-*` directory under the scratch root I pass and every builder invocation reads and writes only inside that copy; at the end it re-hashes every file under `evidence/C1/inputs` in the real worktree and asserts the digests are unchanged (`originalsUnchanged: true` in the report).

Converting the declared `text-lf` input from LF to CRLF changes its raw size 79→82 and its SHA-256, and the builder rejects the stale declaration on raw size before writing anything: `probe.html` was byte-compared to the pre-tamper build and was identical, so the old HTML survived the failed build. Re-issuing the same content at a new path (`evidence/C1/inputs/issue-proof/text-crlf.txt`) with an updated hash, size, requirements and validation record is still refused while any referencing step keeps its old revision. The shared input is referenced by four steps — 7, 9, 10 and 11 — and the build only succeeded once all four revisions had been incremented; bumping only the first still failed, naming step 9. The immutable LF original on disk was restored and verified equal after the tamper.
