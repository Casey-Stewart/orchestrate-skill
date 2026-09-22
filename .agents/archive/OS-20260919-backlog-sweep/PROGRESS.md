# Progress

**Identifier**: OS-20260919-backlog-sweep
**Started**: 2026-09-19 · **Base**: f8290405b45a89928b1808f8b1241df1ccea39f2 (the default-branch commit the ledger
branch was cut from — the "since" point for the first checkpoint's diff and for convergence)
**State**: COMPLETE
**Work list**: [01-plan.md](01-plan.md) (see [00-request.md](00-request.md))
**Contract**: [00-READBEFORE.md](00-READBEFORE.md) · **Narrative**: [LOG.md](LOG.md)
(read on demand by heading, never at boot)
**Smoke page**: [smoke-C1.html](smoke-C1.html) — built from [smoke-C1.json](smoke-C1.json) by `orchestrate/tools/build-smoke-page.mjs`, 0 unfilled slots. Pre-smoke evidence in [evidence/C1/](evidence/C1/); those files are numbered against the superseded markdown draft, so their step 1-2 are now the page's GATE, and md 3-10 are page steps 1-8.
**Rule**: statuses here are claims; **git is truth**. Reconcile against branches/commits
before believing any row (§Recovery in the contract).

**State** is exactly one of: ACTIVE | AT-CHECKPOINT C1 | USER-BLOCKED | COMPLETE. It is
updated in the same commit as every wave open, checkpoint close-out and change-complete.
Discovery greps this one line — the form stays exact.

## Execution model

**Waved stack — W1: B01 + B02 + B03, all three concurrent. Checkpoints: C1 after W1, final and only.** — The three batches are mutually file-disjoint and none depends on another, so the whole change is one wave: B01 owns a single test file, B02 owns the two ledger templates that carry a batch table plus the scaffolder docs and `tests/protocol-contract.test.cjs`, and B03 owns the evidence tool, its two mirrored prose copies and its two test files. Nothing here is behaviour a user can click, so an intermediate checkpoint would buy nothing. But the decisive claims of BL-002 and BL-003 — that this repo's own fence checker can read this repo's own scaffolder's output, and that the evidence helper is usable on a stock Windows install — cannot be proved by any test in this suite, because every fixture sets `GIT_CONFIG_NOSYSTEM=1` and an empty global config precisely to isolate the machine's real configuration away. C1 therefore runs the real helper CLIs against this real repository with the real system Git config, and that is the only reason it is hands-on.

## Legend

- `⬜ Not Started` · `🔄 In Progress` · `🟢 Integrated` (reviewed, validations green on
  the worktree AND the integration tip, merged; awaiting its covering checkpoint) ·
  `🧪 At Checkpoint` (checkpoint reached, awaiting the USER's combined smoke verdict) ·
  `❌ Smoke Failed` (the USER failed a reached checkpoint — never an agent-found failure) ·
  `✅ Passed` (its checkpoint passed; merged toward the default branch per the merge
  policy — verify with git) · `⛔ Blocked` (`defective`, or `green, residual finding
  open`; awaiting the user's verdict; `⛔ (dropped)` once the user drops it) ·
  `❌ (fix-up capped)` (a checkpoint fix-up failed review twice; awaiting the verdict) ·
  `👤 User Action`

## Batches

| # | Batch | Branch | Wave | Version | Status | Updated | Notes |
|---|-------|--------|------|---------|--------|---------|-------|
| B01 | Agent-definition guards that can fail | `fix/agent-definition-test-guards` | 1 | — | ✅ | 2026-09-20 | S/fix. W1 open @fad7a64; worktree <temp>/wtbls/b01. BL-004 + BL-005 + BL-006, one file. Machine-verifiable; covered by C1. Gate: fence → failing-on-base + reviewer + `test-hunter`. Fence PASS (manual). R1 FIX FIRST @955cabc — 3 P1 across both gates. R2 FIX FIRST @61cf83b — all three FIX VERIFIED, one NEW P1 (the nested-path assertion cannot fail). **Round cap reached**; user authorized a third round verbatim 2026-09-20 — see verdict log. R3 @f95413b fresh implementer, strong tier → SHIP (reviewer's own differential: false acceptances 15,245→4). Polish @c3c4100 (10 ASKs) → scoped re-review FIX FIRST on 1 P1 (the U+10FFFF boundary pinned on the strengthening side only) → @c246d1e. **Fence: manual gate.** The mechanical run returned 48 `batch-content` violations, all wrapped `polish:` continuation lines — a tool defect (LOG §new defect), not a fence breach; verified by hand that every removal is an unticked box and every addition a tick or continuation. Merged **e79d378**, tip green **260/260**. m: rounds=2 asks=17 fence-bounces=0 gate=11/4 tip-red=0 |
| B02 | Batch-id grammar the fence can read | `fix/ledger-batch-id-grammar` | 1 | — | ✅ | 2026-09-20 | M/fix. W1 open @fad7a64; worktree <temp>/wtbls/b02. BL-001 + BL-002. Both ledger templates, not just the plan — `oneRow` runs on the PROGRESS table too. Hands-on at C1. Holds `tests/protocol-contract.test.cjs`, which asserts B03's two prose mirrors against each other. Fence PASS (manual). R1 SHIP @c0128b7 asks=7. Polish @4e33956 → scoped re-review **FIX FIRST** (2 P1: a semicolon-anchored clause guard with a demonstrated bypass; an unauthorised narrowing of the two pre-existing self-check greps). Polish redo @a5a1526 → 2nd scoped re-review SHIP, both P1 FIX VERIFIED by execution. Final polish @da95cf0 (test-only, 3 ASKs). **Mechanical fence PASS — 0 violations, 0 unknowns, the first in this repo's history.** Merged **bbc63bb**, tip green 217/217. Neither re-review was a round; no cap consumed. m: rounds=0 asks=14 fence-bounces=0 gate=5/0 tip-red=0 |
| B03 | Resolved per-path filter attribute | `fix/resolved-filter-attribute` | 1 | — | ✅ | 2026-09-20 | L/fix. W1 open @fad7a64; worktree <temp>/wtbls/b03. BL-003. Code is in `git-evidence.mjs` `safeStatusPrerequisites()`, not `check-fence.mjs`. Safety property unchanged; only the trigger moves to `git check-attr filter`. Base canary: exits 2, partial, 2× `unsafe-filter`. Fence PASS (manual — the helper was UNKNOWN pre-merge, BL-003 itself). R1 SHIP @1ca5c49 asks=7 (strong-tier reviewer + test-hunter). Polish @f9d8189 test-only — no scoped re-review needed; DONE_WITH_CONCERNS: two fail-closed guards unreachable without a production seam → BACKLOG (LOG §B03). Merged **6766642**, tip green 216/216. Canary on the tip: exit 0, complete, 0 diagnostics. m: rounds=0 asks=7 fence-bounces=0 gate=5/0 tip-red=0 |

## Checkpoints

| Checkpoint | After wave | Covers | Why here | Status | Verdict |
|------------|------------|--------|----------|--------|---------|
| C1 (final) | 1 | B01, B02, B03 | The only checkpoint. Nothing in this change is clickable behaviour, so an intermediate gate would buy nothing — but every test fixture in this repo sets `GIT_CONFIG_NOSYSTEM=1` and an empty global config on purpose, so no test can prove BL-003's claim ("usable on a stock Windows install") or half of BL-002's ("this repo's fence can read this repo's scaffolder"). C1 runs the real CLIs against the real repository with the real system config. | ✅ | Reached 2026-09-20 on build `e79d378`. Pre-smoke by the QA runner: **8 PASS, 2 FAIL, 0 blocked** — both FAILs are defects in the SCRIPT, not the build (step 5 needs a candidate worktree the orchestrator had already removed at wave close; step 6 quoted the prior ledger's Notes wording inexactly). Both steps corrected and re-verified. Awaiting the user's verdict. m: pre-smoke=10/0 human-smoke-min=tbd escaped=tbd |

## Issued checkpoint inputs

none — C1 has no input files, fixtures or stable-id registry. Every step is a command run
against this repository's own working tree and committed history, judged on a process exit
code and a JSON field. Prerequisites, named: `node` and `git` on PATH, and PowerShell 7
for the published validation recipe. No private data, credentials, external network access
or disposable environment are required — every test builds its own throwaway repository
under the OS temp directory. Two steps deliberately perturb something and restore it:
B01's nested-definition step creates and deletes an untracked file under
`.claude/agents/` in this working tree; B02's archive-guard step runs entirely inside a
throwaway clone at `$env:TEMP\os919bl\c1`, because the contract forbids an agent to modify
`.agents/archive/` — the clone root is kept short so the 146-character deepest tracked
path stays under Windows' 260-character limit. Both name their restore command and both
prove this repository untouched with `git status --porcelain`.

## Smoke-test verdict log

| Date | Checkpoint | Verdict | User notes |
|------|------------|---------|------------|
| 2026-09-20 | B01 | **fix again** | B01 reached the two-round review cap with one open P1: the nested-definition path assertion cannot fail, because `assert.deepEqual`'s custom message is APPENDED to its diff rather than substituted for it — so `err.message.includes('subdir/orchestrator.md')` is satisfied by the diff whatever the message says, and replacing `unknown.join(', ')` with `unknown.length` keeps the suite 20/20 green. Offered fix again / ship with the residual / drop. The user chose, verbatim: "Fix again — authorized third round". A FRESH implementer on the strong tier took the P1 plus the seven outstanding ASKs. |
| 2026-09-20 | C1 | **pass + ship authorization** | The user's exact words, in the session that acted on them: "merge to main and push." They did not use the word "pass"; the orchestrator treats the instruction to ship as the C1 pass, because a failed checkpoint is not merged, and records that interpretation here rather than silently inferring it. The message also carries the merge/push authorization the scaffold-time policy required — that policy (stop at the integration branch) is superseded by it. Scope: merge `chore/backlog-sweep-ledger` into `refs/heads/main`, push `main` to `origin`. Nothing is released; this repository builds, packages and publishes nothing. Evidence the verdict rests on: `evidence/C1/rerun-summary.md` — gate + 10 steps, 10 PASS and 1 FAIL, the FAIL being an unrunnable command in the orchestrator's own page, since repaired and verified as published. |

## Item → batch coverage audit

| Request item | Source | Batch | Version | Status |
|--------------|--------|-------|---------|--------|
| BL-001 — dead frozen-ledger guard at `tests/protocol-contract.test.cjs:122` | backlog BL-001 | B02 | — | ✅ merged `bbc63bb` |
| BL-002 — plan and PROGRESS templates pin no batch-id format; no scaffolder self-check; no end-to-end fence test | backlog BL-002 | B02 | — | ✅ merged `bbc63bb` |
| BL-003 — `unsafe-filter` fires on configured drivers rather than resolved per-path attributes | backlog BL-003 | B03 | — | ✅ merged `6766642` |
| BL-004 — three YAML-invalid `description:` forms accepted by the frontmatter guard | backlog BL-004 | B01 | — | ✅ merged `e79d378` |
| BL-005 — non-recursive `readdirSync` in the agent-directory whitelist | backlog BL-005 | B01 | — | ✅ merged `e79d378` |
| BL-006 — body-size assertion measures UTF-16 length while claiming bytes | backlog BL-006 | B01 | — | ✅ merged `e79d378` |
| BL-007 — missing `polish:` bookkeeping line in the OS-20260919 ledger | backlog BL-007 | excluded | — | ✅ struck by the user 2026-09-19, verbatim in [00-request.md](00-request.md); row deleted from `BACKLOG.md` in the scaffold commit, no OS-20260919 file touched |
| Remove the `## Deferred by decision, not defect` section from `BACKLOG.md` | user decision 2026-09-19 | batch 00 | — | ✅ carried onto the ledger branch in the scaffold commit |

## Session log

| Date | Session did | Stopped because |
|------|-------------|-----------------|
| 2026-09-19 | Scaffold. Re-verified all seven backlog entries against the files at `f829040` rather than trusting their text (00-request.md §Accuracy check): six confirmed, BL-002 found wider than written (`oneRow` runs on the PROGRESS table too), BL-003 reproduced live on this machine. Interviewed; user struck BL-007. Planned 3 batches / 1 wave / 1 final checkpoint. Baseline validation green: 207 pass, 0 fail. Base canary recorded for C1: `git-evidence.mjs worktrees --repo .` exits 2, `partial`, 2× `unsafe-filter`. | Plan approved in one pass; the user chose "Approved — start wave 1 now", which is the standing authorization for the three-wide wave. Scaffold committed: `97f7e0f` (backlog cleanup + BL-007 struck), `fad7a64` (ledger). |
| 2026-09-19 | **Opened wave 1.** Cut all three batch branches from wave base **`fad7a64`**, created three worktrees, spawned B01, B02 and B03 implementers concurrently. | (wave 1 in progress) |
| 2026-09-19 | **Environment note, not a plan deviation.** Worktrees live at `<temp>/wtbls/b0*` rather than under the session scratchpad: the scratchpad prefix (~150 chars) plus this repo's deepest tracked path (146 chars, under `.agents/archive/.../evidence/C1/inputs/`) exceeds Windows' 260-char limit — the same trap the previous ledger hit. Still outside the repo, still disposable, per-worktree setup still `n/a`. Wave map, fences, gates and checkpoints unchanged. | — |
| 2026-09-20 | **B03 gated and integrated.** Fence: 0 violations, exactly the 5 fenced paths, worktree clean. Strong-tier reviewer SHIP; test-hunter 5 findings, all test-only, all closed in polish. Canary verified by the orchestrator old-vs-new on the real repo at the same moment. Merged `--no-ff` → **6766642**, tip green **216/216**. **The mechanical fence now returns a real verdict on this repo for the first time** (exit 1 VIOLATION, 0 unknowns — a genuine dirty candidate worktree), where every run all change had been UNKNOWN. B01 hit the round cap → user authorized round 3; B02's polish overreached → redo. | (wave 1 still open: B01 R3 and B02 polish redo in flight) |
| 2026-09-20 | **B02 gated and integrated.** R1 SHIP asks=7; polish → scoped re-review FIX FIRST (2 P1: an unauthorised narrowing of two pre-existing self-check greps, and a clause guard anchored on a semicolon nothing asserted); redo → 2nd scoped re-review SHIP, both FIX VERIFIED by running the bypass; final test-only polish. Merged `--no-ff` → **bbc63bb**, tip green **217/217**, canary exit 0. **Mechanical fence PASS on B02 — 0 violations, 0 unknowns.** B01's round 3 landed and is under a fresh reviewer + hunter; its fence run surfaced a NEW tool defect (below). | (wave 1 still open: B01 round-3 gates in flight) |
| 2026-09-20 | **New defect found BY the restored tool, on its first real use.** `validateBatchEdit` in `check-fence.mjs` accepts only SINGLE-LINE `- [x] polish:` items (`/^- \[[ x]\] polish: .+$/`), but this repository wraps every checklist line at ~90 chars — including in the COMPLETE, merged OS-20260919 ledger. B01's wrapped polish items therefore produced **49 `batch-content` violations** with zero unknowns. Verified manually instead: every removed line is an unticked checkbox, every added line is a tick or an indented continuation, nothing else altered. Same class as BL-002 — the checker cannot read what the repo's own convention produces. → BACKLOG. The VIOLATION was overridden on this documented basis, not waved away. | — |
| 2026-09-20 | **B01 integrated; wave 1 closed; C1 reached.** B01 took 3 rounds + 2 polish passes + a scoped re-review — five times the fix for "an assertion that cannot fail" itself contained one, each found by a gate mutating the code rather than reading it. Merged `--no-ff` → **e79d378**, tip green **260/260** (base 207 + 53). Worktrees removed. Rows 🟢→🧪. QA pre-smoke: 8 PASS / 2 FAIL, both FAILs script defects the runner correctly attributed to the script rather than the build; it also caught, unprompted, that B01's row was still 🔄 with no merge SHA — an orchestrator bookkeeping error, now fixed. | **STOP — C1 awaits the user's verdict.** |
| 2026-09-20 | **SHIPPED and COMPLETE.** `origin/main` live-queried first: it stood at `f66cf18` while local `main` was two ledger-only commits ahead (the previous change's unpushed shipment record) — no divergence, nobody else had pushed. Merged `chore/backlog-sweep-ledger` into `main` with `--no-ff` → **`004d221`**, validated **260/260 green on `main` BEFORE pushing** rather than after, then `git push origin main` (`f66cf18..004d221`, 42 commits). Shipment confirmed by live `git ls-remote`: `origin refs/heads/main` = `004d221`, and the integration tip `94529d3` is contained in it. Only `main` exists on the remote. Final coverage audit re-verified against the shipped tree rather than from rows: all six items present, `BL-007` absent from the backlog, and **zero commits** touching the frozen `OS-20260919` ledger. Twelve residuals filed as `BL-008`–`BL-017`. | **COMPLETE.** |
