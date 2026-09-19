# Repair B03 pre-smoke step 10

**Type**: fix; **Weight**: L; **Branch**: fix/B03-presmoke-10

**Files**: smoke-C1.json, smoke-C1.html, smoke-C1-demo-before.json, smoke-C1-demo-before.html, smoke-C1-demo-after.json, smoke-C1-demo-after.html, c1-demo-instructions.test.cjs — all relative to this ledger. Own batch file: checklist ticks only. This is the conductor-recorded complete repair fence; no production, input, evidence, plan, contract, PROGRESS or LOG changes.

## Spec and acceptance

Fresh C1 QA failed step10 at source6c84b930aa4297283f94ce9eeacdff44d2b22ba4: the human Step2 and Before demo tell a clean user to mark Pass then enter a note, but the settled runtime hides the note field after a clean Pass. See evidence/C1/initial-qa/step-10.md. Runtime behavior is correct with Works, but -> enter keep this note -> Pass; After correctly invalidates changed step1, retaining unaffected step2 Pass and note. Exact NOT RE-RUN is in Copy results; visible history requests a rerun. Repair the delivery prose only; do not change the production template or engine.

1. Make main human Step2 and both demo pages precisely follow the usable note-entry route. Label visible rerun/history and Copy results export accurately. Keep After control step2 identical to Before. Preserve demo step1 Before revision1 and After revision2, same ckptKey/buildSha; advance main Step2 and both demo Step2 revisions from1 to2 for corrected instructions. Other revisions and build identity stay unchanged until conductor close-out. No input identities/paths/bytes, validation metadata, generated-page design or real verdicts change.
2. Regenerate each HTML from corrected JSON through the reviewed builder with explicit inputRoot and previous snapshot when applicable; retain snapshots outside worktree. No hand-edited HTML.
3. Add ledger-local test-only c1-demo-instructions.test.cjs that exercises the actual generated runtime and instruction route: it must expose the old unusable Pass->note route, validate the corrected visible note-entry route plus saved note/Pass and reissue invalidation/export. Avoid a vacuous exact-prose-only assertion. It must run under node --test from any supplied checkout and fail by assertion on the pre-repair tip when this TEST-ONLY file is copied there. No C1-dependent file in reusable tests/. No fixture edits or import of proposed production code into the base probe.
4. Run the frozen full recursive tests + literal git diff --check, plus the new ledger regression explicitly. Full command: Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName, throw if empty, node --test --test-reporter=spec @testFiles, throw on nonzero; git diff --check, throw on nonzero. Capture full logs outside repo. Report actual command/exit/tail, commit, checklist. The conductor independently runs manual fence and copied-test failing-on-base, then fresh reviewer and separate test hunter. No earlier baseline exception applies.

## Checklist

- [x] Correct all affected human/demo instructions and their revisions without changing inputs or production.
- [x] Regenerate all three pages from sidecars and prove expected delta only.
- [x] Add runtime-backed instruction regression and demonstrate candidate PASS / copied-test base assertion FAIL.
- [x] Run frozen recursive validation and explicit regression, inspect fenced diff, commit clean.
