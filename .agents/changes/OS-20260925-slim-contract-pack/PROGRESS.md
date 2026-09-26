# Progress

**Identifier**: OS-20260925-slim-contract-pack
**Started**: 2026-09-25 · **Base**: edd2f1e522b592258911e83f0fdd9c1920883049 (the default-branch commit the ledger
branch was cut from — the "since" point for the first checkpoint's diff and for convergence)
**State**: AT-CHECKPOINT C1
**Work list**: [01-plan.md](01-plan.md) (see [00-request.md](00-request.md))
**Contract**: [00-READBEFORE.md](00-READBEFORE.md) · **Narrative**: [LOG.md](LOG.md)
(read on demand by heading, never at boot)
**Smoke page**: https://claude.ai/artifact/YQnp8Pgc1ePNd64YGBsXKX (hosted, private, `db` store; C1 issue 2, build `c83ec7d`, 2026-09-26; issue 1 was build `f770be1`) · committed copy `smoke-c1.html` beside its sidecar `smoke-c1.json`
**Rule**: statuses here are claims; **git is truth**. Reconcile against branches/commits
before believing any row (§Recovery in the contract).

## Execution model

**Waved stack — W1: B01+B02; W2: B03; W3: B04. Checkpoint: C1 final after W3, agent-run but for one Windows step** — B01 (documents, templates and the tests that read them) and B02 (the eight tool files and the three tool test files) share no path, and B01 keeps every contract line `prompt.mjs` parses so it never needs B02's file. B03 and B04 each share `protocol.md`, `SKILL.md`, `execution-models.md` and `tests/tool-wiring.test.cjs` with B01 and with each other, and B04's new tool needs B02's fixed entry guard, so they run alone in that order. No batch is hands-on, so the mandatory final checkpoint is the only one

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
| B01 | Contract slimming: one copy of the procedure | `chore/contract-slimming` | 1 | — | ✅ | 2026-09-26 | merged `613c608`: implementer DONE_WITH_CONCERNS @95f8338 (513/515, 2 skipped) → fence PASS → 6b n/a (chore) → R1 SHIP @95f8338 asks=6 (reviewer 3 ASK, one carried to W2; hunter 5, one shared) → polish @bb56dc7 (SKILL.md prose + tests; fence PASS; 513/515) → R2 SHIP @bb56dc7 (scoped polish re-review, 1 test-only ASK → BACKLOG); tip `613c608` PASS tests 535/537, 2 skipped (23s); tier default implementer + hunter, strong/opus reviewers R1–R2; residuals (BACKLOG at close-out): the R2 pin-order ASK, `red → no merge` matched only inside the pinned table, note 7 precedence unasserted, restore rewrites the shared installed skill, clone-relative fixture paths in §Complete checkpoint inputs — LOG §B01 · m: rounds=0 asks=6 fence-bounces=0 gate=5/0 tip-red=0 |
| B02 | Tool CLIs run through any symlinked path; git env scrubbed | `fix/cli-entry-symlink` | 1 | — | ✅ | 2026-09-26 | merged `0090173`: implementer DONE @665549f (532/534, 2 skipped) → fence PASS → 6b PROVEN (23 of 152 fail on `40f8182`) → R1 SHIP @665549f asks=4 (reviewer 2 ASK, hunter 3, one shared) → polish @c780338 (test-only; fence PASS; 532/534, 2 skipped); tip `0090173` PASS tests 532/534, 2 skipped (23s); tier default (implementer, reviewer, hunter); residuals: `mutate.mjs:204` comment and the CRASHED list still say "a step" (outside BL-041), the Windows newline-directory branch of the refusal test first runs at C1, BL-028 doc half is B01 — LOG §B02 · m: rounds=0 asks=4 fence-bounces=0 gate=3/0 tip-red=0 |
| B03 | Conductor and agent budget rules | `feat/budget-rules` | 2 | — | ✅ | 2026-09-26 | merged `66ce0f5`: implementer DONE @9863cc5 (541/543, 2 skipped; additions only, no fence extension) → fence PASS → 6b n/a (feature) → R1 SHIP @9863cc5 asks=2 (combined reviewer+gate pass) → polish @62f4be5 (test-only; fence PASS; 541/543); tip `66ce0f5` PASS tests 541/543, 2 skipped (23s); tier default (implementer, combined reviewer); residuals (BACKLOG at close-out): the compaction STOP does not say what it asks of the user, the after-any-compaction duty lives only in step 8 — LOG §B03 · m: rounds=0 asks=2 fence-bounces=0 gate=2/0 tip-red=0 |
| B04 | Prose polish: comment-only classifier, prose ASKs, one strike | `feat/prose-polish` | 3 | — | ✅ | 2026-09-26 | merged `bf055ce` — W3 open @739c92b; worktree `/home/timetotilt/worktrees/os925/b04`; implementer DONE @f444ef4 (559/561, 2 skipped); fence PASS; 6b n/a (feature); reviewer P0=1 P1=2 ASK=1, hunter 8 (1 P1 shared) — LOG §B04 — gate, round 1; R1 FIX FIRST @f444ef4 → fix round (same implementer) @18b6c86, fence PASS → R2 FIX FIRST @18b6c86 (reviewer P0 F5 continue/break/debugger ASI, P1 F6 directive shapes a sample, ASK F7; hunter 7 test-only ASKs — LOG §B04 — gate, round 2) → ⛔ green, residual finding open (P0) → verdict 2026-09-26 fix again spent → third round on feat/prose-polish @18b6c86 → fresh implementer (strong tier, Fable 5.1) @290a378, @677bc10, @2cf7d9e (561/563, 2 skipped), fence PASS → round-3 reviewer (Fable 5.1) P1 F8 directive verbs a sample (allow, allowlist, skip, skipcq, underscore rule ids), hunter (Fable 5.1) 5 test-only ASKs — LOG §B04 — gate, round 3 → ⛔ green, residual finding open (P1) → R3 FIX FIRST @2cf7d9e → verdict 2026-09-26 ship spent → integrated `bf055ce` (dry run clean, tip PASS tests 561/563, 2 skipped (23s)); residual F8 → BACKLOG `BL-046` (high, P1) + a `Runner: human` smoke step 4 in the batch file (fixture I-04); the round-3 hunter's 5 test-only ASKs → BACKLOG at close-out; tier default (implementer R0–R2, reviewers R1–R2, hunters R1–R2), strong/Fable 5.1 (third-round implementer, R3 reviewer + hunter) · m: rounds=3 asks=0 fence-bounces=0 gate=20/1 tip-red=0 · C1 fail 2026-09-26 (verdict log): Step 1 on Windows — `tests/prose-only-diff.test.cjs:587` stages a fixture path holding a newline through the index, which Git for Windows refuses (exit 128 before the tool runs); fix-up pending: fix/B04-c1-followup — cut @e3af462, worktree `/home/timetotilt/worktrees/os925/b04-c1`, implementer spawned (default tier), scope + BL-046 minimal fix (the user's words, verdict log), DONE_WITH_CONCERNS @afba68d (e94f0c9 the Windows repair, test-only; afba68d BL-046; 562/564, 2 skipped); manual fence PASS (the tool UNKNOWN: plan/PROGRESS branch linkage, a fix-up branch); 6b PROVEN (A: the pre-repair test fails at :587 under the orchestrator's index-refusing shim as on the laptop, passes without it; the repaired passes under it — an emulation; B: afba68d's tests fail 3 of 16 on the pre-repair tree by assertion); fix-up reviews numbered R4+ (after B04's R1–R3), R4 reviewer + test-hunter (the first hunter lost with the old process, respawned fresh) → R4 SHIP @afba68d asks=3 (reviewer F1 ≡ hunter #2, hunter #1; reviewer F2 the orchestrator's re-authoring — LOG §B04 C1 fix-up — R4) → polish @168421b (test-only: the domain assertion, a bare skipcq; manual fence PASS; 562/564, 2 skipped; no re-review) → merged `c83ec7d`, tip PASS tests 562/564, 2 skipped (23s) → 🧪 (C1 re-issue follows) · fix-up m: rounds=0 asks=3 fence-bounces=0 gate=2/0 tip-red=0 |

## Checkpoints

| Checkpoint | After wave | Covers | Why here | Status | Verdict |
|------------|------------|--------|----------|--------|---------|
| C1 | 3 | B01, B02, B03, B04 | mandatory final; no batch is hands-on | ✅ | pass (issue 2, 2026-09-26, build `c83ec7d`) — Step 1 on Windows 564/564, 0 skipped; steps 2–14 pre-verified; issue 1 (build `f770be1`) failed on Step 1 → B04, repaired · m: pre-smoke=13/1 human-smoke-min=4 escaped=1 |

## Issued checkpoint inputs

Issue 001, 2026-09-26, build `f770be1` — `evidence/C1/inputs/issue-001/`, generated by `evidence/C1/inputs/generate-c1-inputs.mjs` (generation A = B byte for byte) and checked by `evidence/C1/inputs/validate-c1-inputs.mjs` → `evidence/C1/inputs/validation-001/independent-check.md` (exit 0; a truncated copy rejected, exit 1):

- `I-01` `i01.bundle` — 1170 B, sha256 `c8a0a533…` — steps 12, 13 (classifier fixture c0 → c1 → c2)
- `I-02` `i02.bundle` — 425 B, sha256 `e5753798…` — step 7 (the `GIT_DIR` decoy)
- `I-03` `i03.bundle` — 10130 B, sha256 `b540f4fe…` — step 3 (fixture ledger from the slimmed templates)
- `I-04` `i04.bundle` — 780 B, sha256 `abe5894f…` — step 2 (the BL-046 residual; added by the ship verdict)

## Smoke-test verdict log

| Date | Checkpoint | Verdict | User notes |
|------|------------|---------|------------|
| 2026-09-26 | B04 | fix again | "Yup, run it again. Fresh implementer, I moved this session up to max as well to help." |
| 2026-09-26 | B04 | ship with the residual | "As long as the residual isn't a fundamentally breaking bug that sounds fine." |
| 2026-09-26 | C1 | push authorized — `chore/slim-contract-pack-ledger` to `origin`, for the Windows step | "Yes push so I can test" |
| 2026-09-26 | C1 | fail (issue 1) — Step 1 → B04 | User, pasting the Windows run of Step 1 (verbatim in LOG.md §C1 issue 1: Step 1 fail): the recipe threw "Node test suite failed" on one failing test, "✖ one line whatever a path holds, usage refused, --help documents the flags the published command uses (2017.9739ms)" (tests\prose-only-diff.test.cjs:587:1) — "error: Invalid path 'line / break.mjs'", "fatal: git update-index: --cacheinfo cannot add line / break.mjs", "128 !== 0"; `git diff --check` printed nothing. Step 2 not yet given. |
| 2026-09-26 | B04 | fix-up scope: BL-046's minimal fix folded into `fix/B04-c1-followup` (its class fix stays in BACKLOG) | User, while the C1 fix-up was being prepared: "B04 also had the residual as well, if we are going to work on it, we should probably fix the residual as well?" |
| 2026-09-26 | — | push preauthorized: `chore/slim-contract-pack-ledger` → `origin` once the B04 C1 fix-up is merged and the C1 page re-issued | User, answering "When the repaired branch is ready, may I push it to `origin` straight away so you can re-run Step 1 on the laptop?": "yes" |
| 2026-09-26 | C1 | pass (issue 2) | User, pasting the Windows run of Step 1 on issue 2 and the process count asked for after it (both verbatim in LOG.md §C1 issue 2: pass): "ℹ tests 564", "ℹ pass 564", "ℹ fail 0", "ℹ cancelled 0", "ℹ skipped 0", "ℹ duration_ms 245295.1468"; the top eight processes afterwards svchost, chrome, msedgewebview2, claude, Code, dllhost, RuntimeBroker, WorkloadsSessionHost — no git, conhost, sh or node. |

## Item → batch coverage audit

| Request item | Source | Batch | Version | Status |
|--------------|--------|-------|---------|--------|
| R1 — #14 contract slimming, SHA pin kept on the single copy | request | B01 | — | 🧪 |
| R2 — the EVIDENCE_TOOL/FENCE_TOOL placeholder move | request | B01 | — | 🧪 |
| R3 — BL-028's doc half | request | B01 | — | 🧪 |
| R4 — BL-028 code fix, checkout-enumerating symlink test | request | B02 | — | 🧪 |
| R5 — BL-036 | request | B02 | — | 🧪 |
| R6 — BL-037 | request | B02 | — | 🧪 |
| R7 — #15 budget rules (effort clause dropped by the control) | request | B03 | — | 🧪 |
| R8 — #8 prose half | request | B04 | — | 🧪 |
| R9 — BL-044 | request | B04 | — | 🧪 |
| BL-041 | backlog BL-041 | B02 | — | 🧪 |
| BL-034 | backlog BL-034 | B03 | — | 🧪 |
| BL-042 | backlog BL-042 | B04 | — | 🧪 |

## Session log

| Date | Session did | Stopped because |
|------|-------------|-----------------|
| 2026-09-25 | Scaffold: interview, planning census + #15 control (medium vs max), pre-flight 5 blocking fixed / 9 advisory, plan approved with 3 fold-ins; ledger committed on `chore/slim-contract-pack-ledger` from `edd2f1e` | STOP — wave 1 starts only on the user's word |
| 2026-09-25 | continue: skill pin SKILL MATCH; reconcile — all rows ⬜, no batch branch exists (correct state); resume-time validation on `40f8182` PASS tests 510/512, 2 skipped (23s); W1 opened — wave base `40f8182bdebe5596420bda2394ed181627a03f99`, branches `chore/contract-slimming` (B01) and `fix/cli-entry-symlink` (B02) cut, worktrees `b01`/`b02` | W1 closed (no checkpoint after W1) |
| 2026-09-26 | continue (same session): W1 gated and integrated — B02 `0090173`, B01 `613c608`, tip PASS tests 535/537, 2 skipped; W2 opened — wave base `6d2492bb7a0bc393b863df6b6cb7b49076854753`, branch `feat/budget-rules` (B03) cut, worktree `b03` | W2 closed (no checkpoint after W2) |
| 2026-09-26 | continue (same session): W2 gated and integrated — B03 `66ce0f5`, tip PASS tests 541/543, 2 skipped; W3 opened — wave base `739c92b0547a76a65fed142490c22b729900732e`, branch `feat/prose-polish` (B04) cut, worktree `b04` | STOP — B04 ⛔ green, residual finding open (P0) after its second FIX FIRST; verdict needed: fix again / ship with the residual / drop; C1 close-out waits on it |
| 2026-09-26 | continue (same session): the user verdict on B04, fix again, recorded verbatim and consumed — B04 → 🔄, third round on `feat/prose-polish` @18b6c86: a FRESH implementer on the strong tier (Fable 5.1), then a fresh re-review | STOP — B04 ⛔ green, residual finding open (P1) after the authorized third round (R3 FIX FIRST @2cf7d9e); verdict needed: ship with the residual / drop; C1 close-out waits on it |
| 2026-09-26 | continue (same session): the user's ship-with-the-residual verdict consumed — B04 merged `bf055ce`, BL-046 filed (BACKLOG.md repaired forward, `220ad6c`); W3 closed. C1 close-out: inputs I-01–I-04 issued and independently validated (`f770be1`); tip PASS tests 561/563, 2 skipped; QA runner pre-smoke 12/12 PASS on `f770be1`; page built and published (https://claude.ai/artifact/YQnp8Pgc1ePNd64YGBsXKX); artifact proof COULD-NOT-RUN (the rendered DOM unreachable) with a labelled substitute, 16/16 blocks run as published; rows → 🧪; checkpoint integration SHA `f770be1` | STOP — C1 awaiting the user's verdict (2 human steps); the push of the integration branch to `origin` for the Windows step asked |
| 2026-09-26 | close: the user's Windows run of Step 1 (pasted) recorded verbatim — fail, triaged to B04 (a test fixture Git for Windows refuses to index); B04 → ❌, fix-up pending: fix/B04-c1-followup; B01–B03 stay 🧪; Step 2 still awaited | — (running: the fix-up) |
| 2026-09-26 | continue (resumed after the Claude Code process restarted): boot SKILL MATCH; reconcile — B04 ❌, `fix/B04-c1-followup` @afba68d ahead, R4 reviewer SHIP (asks=2) in scratch, the R4 test-hunter lost with the old process → respawned fresh; resume-time validation on `57da24e` PASS tests 561/563, 2 skipped; the user's report of 40k+ processes on Windows measured (60,697 → 74,890 per suite run; none survive on Linux) | STOP — C1 issue 2 issued (build `c83ec7d`: the fix-up merged, pre-smoke 13/13 with 4 re-run, page republished to the same URL, substitute proof 18/18 as published); push to `origin` per the recorded preauthorization follows this commit; awaiting the user's Step 1 re-run on Windows |
