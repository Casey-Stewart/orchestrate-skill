# C1 step 10 — independent QA

Verdict: PASS

Tested SHA: 49dfe07c09111197b8739aac2df0cea43c985cdf

Step revision: 1

Environment: Windows 11 Home 10.0.26200; Node v22.22.3; Git 2.52.0.windows.1; PowerShell 7.6.6; literal python C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe, Python 3.10.6 / openpyxl 3.1.5; Claude Code built-in Browser pane (Chromium) at http://127.0.0.1:8765/.

Do: Validate every declared delivered file and evidence link, then inspect this generated page in a browser.

Pass: The current page and exact files are usable; linked bytes match declarations. Expected workbook total 23.50 and count 4 and working-copy/reset instructions are explicit; no manual data construction is required.

Command and exact argument array: {"exe":"node","args":["C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/independent-link-check.mjs","C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int","C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY"]}

Exit code: 0

Output tail:

~~~text
PASS: 14 declared input/evidence files and 2 other linked pages served exact bytes; raw hashes/sizes and working-copy instructions verified
~~~

Full report: [link-proof.json](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/link-proof.json>); full output: [links.log](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/links.log>).

The checker is the retained `initial-qa/independent-link-check.mjs`, copied out unmodified (SHA-256 a71e27746bdcc352465911b7dba3d11b6cb6f2842481153aa4d684f28c104005) and re-run against a FRESHLY captured rendered-link inventory rather than the retained one: the generated page emits no literal anchor markup in its source, so the inventory was taken from the live DOM of `http://127.0.0.1:8765/smoke-C1.html` in the browser ([main-browser-links.json](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/main-browser-links.json>), 108 anchors). Its href sequence is identical to the earlier build's inventory; only link text differs. All 14 declared input/validation artifacts and both other linked pages were fetched over HTTP and byte-compared against disk and against the sidecar's declared size and SHA-256. The checker also asserts `git rev-parse HEAD` equals the sidecar `buildSha`; both read 49dfe07c09111197b8739aac2df0cea43c985cdf, and the branch matched.

Rendered page content: human Step 1's Pass criterion states "Original F2=22.50, total=23.50 and count=4. The copy recalculates F2=33.75 and total=34.75; resetting restores 22.50/23.50", and the `orders-original` input block carries explicit Use ("Copy to the named disposable workbook before editing; see WORKING-COPY.md") and Reset text. `WORKING-COPY.md` contains the literal `Copy-Item -LiteralPath` command, the `OS-C1-orders-working.xlsx` destination, 22.50/23.50/33.75/34.75 and "count stays **4**". No data has to be constructed by hand. Full rendered body text: [main-step1-2.txt](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/main-step1-2.txt>).

Usability of the repaired instructions — the criterion that failed at build 6c84b930aa4297283f94ce9eeacdff44d2b22ba4 — was re-tested by executing the delivered human Step 2 prose literally, in order, from a clean slate (localStorage empty on first load), clicking the page's own controls through the browser driver:

1. Opened `smoke-C1-demo-before.html`. Both note textareas existed but were not rendered (no offsetParent, 0x0 box); every verdict button was visible.
2. Clicked **Pass step 1**. Its `aria-pressed` became true, the counter moved to "passed 1 ... unmarked 1 of 2", and the step-1 note field stayed hidden — the original defect's behaviour, which the repaired prose no longer asks a user to fight.
3. Clicked **Works, but step 2**. The step-2 note field became visible at 576x62 px, labelled "What would you rather it did?", placeholder "It works as described. Describe the change you want.", and `document.elementFromPoint` at its centre returned that textarea itself, so it was genuinely hittable at the moment the instructions say to type into it.
4. Clicked into that field and typed `keep this note` with real key events. The value and the isolated demo storage record both read "keep this note".
5. Clicked **Pass step 2**. Pass became the pressed verdict (computed style rgb(102,180,130) on rgb(23,48,31), while "Works, but" reverted to the neutral rgb(147,163,167)), the note field REMAINED visible and still held "keep this note", and the stored record became `{"status":"pass","note":"keep this note"}`. A screenshot of this state rendered and was viewed inline: PASS highlighted green, "WHAT YOU ACTUALLY SAW" label, "keep this note" in the box.
6. Opened `smoke-C1-demo-after.html` in the same browser and pressed **Copy results as text**.

DOM capture of the Before result: [before-after-pass.json](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/before-after-pass.json>).

On the After page, demo step 1 carried no current verdict and displayed the history line "PASS (carried over from build 49dfe07c09111197b8739aac2df0cea43c985cdf). Step changed or its earlier build/revision is unknown. Run it again and select a verdict." — visible wording that asks for a re-run. Demo step 2 kept Pass pressed with its note field visible and holding "keep this note". Counters read "passed 1 ... re-run 1 ... unmarked 0 of 2". Captures: [after-page-text.txt](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/after-page-text.txt>), [after-state.json](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/after-state.json>).

The export produced by the real button press contains exactly these two verdict lines ([after-copy-export.txt](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/after-copy-export.txt>), lines 5 and 20):

~~~text
  1. NOT RE-RUN — previous PASS (carried over from build 49dfe07c09111197b8739aac2df0cea43c985cdf); re-run required
  2. PASS — keep this note
~~~

The export ends "Current-build verdicts: passed 1 · failed 0 · blocked 0 · works-but 0 · carried over (unchanged) 0 · needs re-run 1 · pre-verified only 0 · not run 0 of 2". Clipboard READ is denied to the page's origin, so the exported string was observed by wrapping `navigator.clipboard.writeText` in a pass-through recorder installed before the button was pressed; the page's own code and the text it builds were not altered, and the original writeText still ran.

The After page's standfirst claims "Step 1 has rerun-required history; Copy results as text reports "1. NOT RE-RUN — previous PASS". Step 2 keeps its Pass and "keep this note"." All three claims hold against observed behaviour, including the visible-history versus export distinction: the literal string "NOT RE-RUN" appears nowhere in the step's rendered history (which reads "Run it again and select a verdict") and only in the exported text.

Demo marks were cleared afterwards through the page's own controls: "Clear the verdict" on both demo steps, then the step-2 note emptied through the note field itself. Reloading `smoke-C1-demo-before.html` shows passed 0, unmarked 2 of 2, no pressed verdict, no visible note and no history ([demo-cleared.json](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/demo-cleared.json>)); the demo storage key retains only two inert `{"status":"","note":""}` records, which is as empty as the page's own UI can make it. The real C1 page was never marked: it reloads at passed 0, unmarked 11 of 11, no notes, and holds no storage key of its own — only the separate `...-C1-demo-run` demo key exists ([main-unmarked-after-qa.json](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/main-unmarked-after-qa.json>)).

Browser-rendered inspection was performed. Two pixel screenshots of the Before page (the Works-but note field visible, and Pass retaining the note) rendered and were viewed inline; later screenshot attempts on the After page timed out or returned a blank frame because the Browser pane is hidden and the host window was not drawing, so no screenshot files are attached for it. Every After-page observation above comes from the live rendered DOM of that same browser tab — innerText, computed styles, hit-testing and element geometry — not from the static file. No native Excel execution is claimed anywhere in this step.
