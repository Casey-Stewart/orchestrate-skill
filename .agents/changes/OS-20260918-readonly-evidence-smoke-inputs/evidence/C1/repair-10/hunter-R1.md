FINDINGS 2

Candidate: `f2c2ceeb73a8adeee5dd2249a97df84bb1a19134` on `fix/B03-presmoke-10`.
Both findings are **ASK**, requiring test changes only. No current production defect demonstrated.

Saved [report.md](C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-repair-hunter-R1/report.md). Proof paths below are relative to that workspace; `L` means `.agents/changes/OS-20260918-readonly-evidence-smoke-inputs`.

Commands and results:

- `node ./hunt.cjs` → exit **0**. Exact child commands, directories and exits: `proof/results.json`.
- Each child ran `node --test --test-reporter=spec .agents/changes/OS-20260918-readonly-evidence-smoke-inputs/c1-demo-instructions.test.cjs` from `cases/<case>`.
- Candidate → exit **0**; **6 passed, 0 failed, 0 skipped**; `proof/candidate.txt`.
- Test-only copy onto base `9b40054dfc9571af25267050640f66bc00e7e619` pages → exit **1**; **1 passed, 5 failed**. Four hidden-field assertions plus revision assertion; `proof/base-test-only.txt`.
- Twelve mutations detected, each exit **1**: four old instruction routes, omitted final Pass, hidden Works-but field, discarded input note, note cleared on Pass, disabled invalidation, hidden history, wrong rerun export, missing exported note.
- Three surviving mutations below each returned exit **0**, **6/6**, zero skips. Logs and exact edits: `proof/<case>.txt` and `proof/<case>.mutation.json`.
- `node ./witnesses.cjs` → exit **0**; three runtime witnesses confirmed the consequences below; `proof/witness-results.json`.
- `node ./regenerate.mjs` → exit **0**; all three candidate HTML files reproduced exactly through the reviewed builder with explicit inputRoot and separate base snapshots; `proof/regenerate.json`.
- `node ./audit.cjs` → exit **0**; candidate three-dot `diff --check` and read-only status each exit **0**, empty stdout; exact commands: `proof/git-audit.json`.

1. **ASK — Route replay overrides instruction targets and prerequisite verdicts.**
   Test: `L/c1-demo-instructions.test.cjs:104` discards preceding actions; `:109` always marks step 1 Pass; `:112` always targets step 2. Delivery: `L/smoke-C1.html:854`, `L/smoke-C1-demo-before.html:679`; actual marking/export paths: demo Before `:1294`, After `:1424`.
   Mutating the initial step-1 verdict to Works, but (`wrong-prerequisite-verdict`), or redirecting note entry to step 1 (`wrong-note-step`), preserves **6/6**. Literal-action witnesses instead export **“previous WORKS, BUT”** or **“2. NOT RUN”**, respectively. Proof: corresponding `proof/<case>.witness.txt` files.
   Missing assertion: validate and replay whole-route step targets and initial verdicts; seed prerequisites only for standalone step-2 tests. **Production change required: no.**

2. **ASK — The emitted After introduction can retain the original misleading expectation.**
   Test: `L/c1-demo-instructions.test.cjs:168` checks the sidecar introduction; `:155`–`:157` compare only step instructions. Delivery: `L/smoke-C1-demo-after.html:679`; history/export paths `:1331` and `:1424`.
   Restoring only the old HTML introduction, **“Step 1 must say NOT RE-RUN”**, preserves **6/6**. Runtime witness confirms history says **“Run it again”**; NOT RE-RUN appears in export. Proof: `proof/stale-after-visible-instructions.{mutation.json,txt,witness.txt}`.
   Missing assertion: compare the emitted After introduction with its corrected sidecar and enforce the visible-history/export distinction. **Production change required: no.**

All writes stayed in scratch. Candidate/integration worktrees, original inputs/evidence, PROGRESS and LOG remained untouched.
