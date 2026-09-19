SHIP

Candidate: f2c2ceeb73a8adeee5dd2249a97df84bb1a19134 — fix/B03-presmoke-10.
Reviewer: fresh independent read-only Codex sub-agent, inherited GPT-6 Astra / xhigh.
Contract: frozen 00-READBEFORE.md; acceptance/fence: 02-fix-B03-presmoke-10.md. Checklist 4/4 verified.

Evidence (commands run from candidate worktree unless noted):
- `node --test --test-reporter=spec .agents/changes/OS-20260918-readonly-evidence-smoke-inputs/c1-demo-instructions.test.cjs` — exit 0; tail: tests 6, pass 6, fail 0, cancelled 0, skipped 0, todo 0; retained regression.txt.
- `node <review-scratch>/verify.mjs <candidate-worktree>` — exit 0; tail: PASS: 3 exact builder page reproductions with base snapshots; 14 raw input/evidence files unchanged and digest/size matched; all model changes restricted; clean candidate and diff check. Full argument arrays/output: verification.json.
- `git -c safe.directory=<candidate-worktree> -c core.longpaths=true diff --check` — exit 0, empty output; `status --porcelain` empty; HEAD exactly candidate above.
- Read and inspected retained full recursive validation C1-repair-impl/full-validation.txt: 187 tests, 187 pass, 0 fail/cancelled/skipped/todo. No duplicate broad run; the bounded repair changes no reusable code/tests, and dispatch supplied this completed full validation.
- Inspected conductor evidence/C1/repair-10/manual-and-base.json: base 9b40054dfc9571af25267050640f66bc00e7e619, actual temporary detached worktree, TEST-ONLY copy, `node --test --test-reporter=spec <ledger>/c1-demo-instructions.test.cjs` exit 1; 1 pass / 5 assertion failures / 0 skipped. Four named instruction routes fail `the instructed route must expose the note field before entering text`, actual true versus expected false. Fifth fails revision 1 versus 2. This is a real named-behavior failure, not setup/import failure.

Complete hunk mapping (15 hunks; line references are diff hunk anchors):
- Own batch @15: four authorized checklist ticks only, exempt under frozen gate.
- New regression @1: acceptance 3, real issued runtime/prose route, visibility boundary, save/reload/export/reissue and sidecar identity checks.
- After HTML @676/@844/@1530: acceptance 1 rerun-history/export wording and corrected Step2/revision; acceptance 2 generated fingerprint.
- After JSON @7/@91: acceptance 1 standfirst wording, usable note route, Step2 revision 2.
- Before HTML @676/@844/@1530: acceptance 1 standfirst and Step2 route/revision; acceptance 2 generated fingerprint.
- Before JSON @7/@91: acceptance 1 standfirst and Step2 route/revision.
- Main HTML @851/@2587: acceptance 1 human Step2 route/criterion/revision; acceptance 2 generated fingerprint.
- Main JSON @36: acceptance 1 human Step2 route/criterion/revision.

Acceptance conclusions:
- All four displayed instruction sources now direct Works, but → enter note while visible → Pass. The actual template exposes the field for `change` or an existing note (1243–1245), retains it after Pass, and reissue keeps Step2's complete stored record.
- Prose distinguishes visible rerun history from Copy results text. Actual template history says Run it again (1238); export emits NOT RE-RUN (1331–1334). Regression verifies both actual runtime outputs.
- Main Step2 and both demo Step2 revisions advance 1→2. Demo Step1 stays Before 1 / After 2. Before/After Step2 objects remain identical. Build/key and separate main/demo storage identity remain unchanged.
- Independent reproduction used actual reviewed builder/template, explicit inputRoot and sidecars read directly from the pre-repair Git base; all three HTML byte sequences match exactly. No hand-edited page/runtime/design changes.
- Normalizing only the specifically allowed prose/revision fields makes every current model deep-equal to its base model. All 14 unique input/validation files match base bytes plus declared SHA-256/size. Inputs, metadata, history, source, templates, frozen plan/contract and unrelated ledger state are untouched by the eight-path diff.
- Test runs the emitted script rather than copying verdict logic. Its fake DOM explicitly rejects input into a hidden note wrapper; routes derive from displayed prose, and observed save/reload/reissue/export behavior is asserted. The old route demonstrably fails on base.
- The required main/browser checkpoint re-run remains conductor/QA close-out work; this review does not manufacture human verdicts or claim native Excel testing.

Findings: none. No P0/P1, no ASK, no unmapped hunk, no guardrail violation.
