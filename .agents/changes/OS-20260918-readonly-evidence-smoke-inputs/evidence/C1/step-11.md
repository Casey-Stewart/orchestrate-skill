# C1 step 11 — independent QA

Verdict: PASS

Tested SHA: 49dfe07c09111197b8739aac2df0cea43c985cdf

Step revision: 1

Environment: Windows 11 Home 10.0.26200; Node v22.22.3; Git 2.52.0.windows.1; PowerShell 7.6.6; literal python C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe, Python 3.10.6 / openpyxl 3.1.5; Claude Code built-in Browser pane (Chromium) at http://127.0.0.1:8765/.

Do: Use disposable before/after packages to change workbook contents and reissue on the same build. Exercise the generated pages and saved demo verdicts.

Pass: Unchanged affected revision is refused. A new issue path and increased revision succeed; the prior affected pass becomes NOT RE-RUN while unrelated pass and notes survive. Original input sets remain intact.

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\scripts\\c1-reissue-proof.mjs","C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int","C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY","C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/reissue-proof.json"]}

Exit code: 0

Output tail:

~~~text
PASS: raw line-ending tamper rejection preserves HTML; every shared-input step needs revision bump; same-build workbook reissue rejects old revision and accepts new issue/revision; issued bytes unchanged
~~~

Full report: [reissue-proof.json](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/reissue-proof.json>); full output: [reissue.log](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/reissue.log>).

Builder workbook calls, recorded from the report's `calls` array (paths abbreviated; `<scratch>` is the disposable package root C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/reissue-proof-sro1Eu):

Command and exact argument array: {"exe":"node","args":["<wt-int>\\orchestrate\\tools\\build-smoke-page.mjs","<scratch>\\workbook\\smoke-C1-demo-before.json","<scratch>\\workbook\\probe.html"]}

Exit code: 0

Output tail:

~~~text
<scratch>\workbook\probe.html: 58079 bytes, 0 unfilled slots
~~~

Command and exact argument array: {"exe":"node","args":["<wt-int>\\orchestrate\\tools\\build-smoke-page.mjs","<scratch>\\workbook\\unchanged-revision.json","<scratch>\\workbook\\probe.html","--previous","<scratch>\\workbook\\smoke-C1-demo-before.json"]}

Exit code: 1

Output tail:

~~~text
<scratch>\workbook\unchanged-revision.json: step 1: instructions or section context changed, or resolved inputs changed; increment revision above 1
~~~

Command and exact argument array: {"exe":"node","args":["<wt-int>\\orchestrate\\tools\\build-smoke-page.mjs","<scratch>\\workbook\\smoke-C1-demo-after.json","<scratch>\\workbook\\probe.html","--previous","<scratch>\\workbook\\smoke-C1-demo-before.json"]}

Exit code: 0

Output tail:

~~~text
<scratch>\workbook\probe.html: 58053 bytes, 0 unfilled slots
~~~

Re-run at the repaired build. Before/after sidecars share one `buildSha` (49dfe07c09111197b8739aac2df0cea43c985cdf) and one `ckptKey`, so this is a same-build reissue: only the workbook input changed, from `evidence/C1/inputs/issue-001/orders.xlsx` to `evidence/C1/inputs/issue-002/orders.xlsx`. Holding the affected demo step 1 at revision 1 is refused with the revision error, and the rejected build left the previously generated `probe.html` byte-identical; only the After sidecar, which carries demo step 1 at revision 2, builds. Demo step 2 is byte-identical between the two sidecars (the script asserts deep equality), so the unaffected step is genuinely untouched. Every file under the live `evidence/C1/inputs` tree was re-hashed at the end and matched (`originalsUnchanged: true`): both issue-001 and issue-002 sets survive.

Saved demo verdicts were exercised in the real browser at the same build, from a clean slate, using only the pages' own controls: Pass on demo step 1, then "Works, but" on demo step 2, typing `keep this note` into the note field the page revealed, then Pass on demo step 2 (the note survived that switch, verified in the DOM and in the demo storage record). Opening the After page in the same browser and pressing "Copy results as text" produced, literally:

~~~text
  1. NOT RE-RUN — previous PASS (carried over from build 49dfe07c09111197b8739aac2df0cea43c985cdf); re-run required
  2. PASS — keep this note
~~~

So the prior pass on the reissued step became NOT RE-RUN while the unrelated step kept both its Pass and its note. On screen the reissued step showed no current verdict and the history line "PASS (carried over from build 49dfe07c09111197b8739aac2df0cea43c985cdf). Step changed or its earlier build/revision is unknown. Run it again and select a verdict."; the page counters read "passed 1 ... re-run 1 ... unmarked 0 of 2". Captures: [after-copy-export.txt](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/after-copy-export.txt>), [after-state.json](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/after-state.json>), [after-page-text.txt](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/after-page-text.txt>).

Demonstration storage is isolated from the real checkpoint, as observed rather than assumed: the only browser key written during this run was `OS-20260918-readonly-evidence-smoke-inputs-C1-demo-run`, and the real C1 page reloads with no key of its own and 11 of 11 steps unmarked. Demo marks were then cleared through the pages' own "Clear the verdict" controls and the note field emptied; the Before page reloads at passed 0, unmarked 2 of 2, no note, no history ([demo-cleared.json](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/demo-cleared.json>), [main-unmarked-after-qa.json](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/main-unmarked-after-qa.json>)).
