# Repair B03 pre-smoke step 0 — portable gate commands

**Type**: fix; **Weight**: L; **Branch**: fix/B03-presmoke-00

**Files**: smoke-C1.json, smoke-C1.html, c1-gate-portability.test.cjs — all relative to
this ledger. Own batch file: checklist ticks and appended `- [ ] polish:` lines only.
This is the conductor-recorded complete repair fence; no production, input, evidence,
plan, contract, PROGRESS or LOG changes, and no demo page or sidecar changes (both demo
gates carry an empty `commands` array and are out of scope).

## Spec and acceptance

The user reached checkpoint C1 at issued build 49dfe07c09111197b8739aac2df0cea43c985cdf
and could not run the step-0 gate as delivered. Their shell is `cmd.exe`. The gate block
is written for PowerShell and fails there twice over:

1. `Set-Location -LiteralPath '<path>'` — `Set-Location` is a PowerShell cmdlet.
   Observed: `'Set-Location' is not recognized as an internal or external command,
   operable program or batch file.`
2. `node '.agents/changes/.../c1-canary.mjs' .` — `cmd.exe` does not strip single
   quotes, so they reach Node as part of the filename. Observed:
   `Error: Cannot find module '...\wt-int\'.agents\changes\...\c1-canary.mjs''`
   with `code: 'MODULE_NOT_FOUND'`.

The gate is the one thing the user runs before spending any time, and it must work in the
shell they actually have. This is delivery prose only: the canary script, the builder, the
template, every numbered step and all production code are correct and stay untouched.

1. Make the emitted step-0 gate runnable verbatim in BOTH `cmd.exe` and PowerShell 7 on
   Windows. Prefer one shell-neutral block over two variants; if two variants are
   genuinely necessary, label each unambiguously so the user can tell at a glance which
   line is theirs. Quote paths so both shells pass them through intact — double quotes
   work in both, single quotes do not work in `cmd.exe`. Do not use a shell-specific
   directory-change cmdlet inside the block; state the working directory in a way both
   shells accept, or drop the directory change and use paths that do not need it.
2. Preserve exactly what the gate verifies: the current branch, the HEAD commit, and the
   behavioral canary, with its existing PASS criterion and its "if it behaves the old way,
   stop and say so" instruction. The recorded tested commit
   `49dfe07c09111197b8739aac2df0cea43c985cdf` and the statement that a later
   artifacts-only commit is allowed both stay accurate.
3. Change NO step. Every step's `do`, `pass`, `aside`, `inputs`, `revision` and `pre`
   block stays byte-identical, so the user's pending step verdicts and the carried-over
   labels survive the re-issue. `buildSha` and `ckptKey` stay as issued; the conductor
   advances build identity at close-out, not the implementer.
4. Regenerate smoke-C1.html from the corrected sidecar through the reviewed builder with
   the last issued sidecar as `--previous`; retain that snapshot outside the worktree.
   No hand-edited HTML. The two demo pages are out of fence and must not change.
5. Add ledger-local test-only `c1-gate-portability.test.cjs` proving the gate is
   executable in both shells. It must exercise REAL shell parsing and dispatch — extract
   the gate block from the EMITTED page (not from the sidecar alone, so an HTML/sidecar
   drift is caught), run it through actual `cmd.exe` and actual PowerShell, and assert
   each intended command is dispatched with the intended arguments: in particular that
   the canary script path arrives with no stray quote characters and that no
   PowerShell-only cmdlet is invoked in the `cmd.exe` path. Use shims or a disposable
   working directory so the test does not depend on the integration branch being checked
   out, does not run the real canary, and writes nothing into the repository. A
   prose-matching or regex-only assertion is vacuous and will be rejected: the test must
   fail for the RIGHT reason on the pre-repair tip — that is, because a real shell could
   not dispatch the delivered block — when this TEST-ONLY file is copied there. It must
   run under `node --test` from any supplied checkout. No C1-dependent file in reusable
   `tests/`. If PowerShell 7 is genuinely unavailable, cover `cmd.exe` for real and state
   the limitation in your report rather than faking the second shell.
6. Run the frozen full recursive tests + literal `git diff --check`, plus BOTH ledger
   regressions explicitly — the existing `c1-demo-instructions.test.cjs` (it must stay
   green; you changed no step) and your new `c1-gate-portability.test.cjs`. Full command:
   `Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object
   FullName | ForEach-Object FullName`, throw if empty, `node --test
   --test-reporter=spec @testFiles`, throw on nonzero; `git diff --check`, throw on
   nonzero. Capture full logs outside the repo. Report actual command/exit/tail, commit,
   checklist. The conductor independently runs the manual fence and the copied-test
   failing-on-base check, then a fresh reviewer and a separate fresh test hunter.

## Checklist

- [x] Correct the emitted gate so both shells run it verbatim, preserving what it verifies.
- [x] Prove every step, revision and pre block is byte-identical to the issued sidecar.
- [x] Regenerate smoke-C1.html from the sidecar and prove the expected delta only.
- [x] Add the shell-dispatch regression and demonstrate candidate PASS / copied-test base FAIL.
- [x] Run frozen recursive validation and both explicit regressions, inspect fenced diff, commit clean.
