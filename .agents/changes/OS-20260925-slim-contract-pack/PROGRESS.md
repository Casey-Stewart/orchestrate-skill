# Progress

**Identifier**: OS-20260925-slim-contract-pack
**Started**: 2026-09-25 · **Base**: edd2f1e522b592258911e83f0fdd9c1920883049 (the default-branch commit the ledger
branch was cut from — the "since" point for the first checkpoint's diff and for convergence)
**State**: ACTIVE
**Work list**: [01-plan.md](01-plan.md) (see [00-request.md](00-request.md))
**Contract**: [00-READBEFORE.md](00-READBEFORE.md) · **Narrative**: [LOG.md](LOG.md)
(read on demand by heading, never at boot)
**Smoke page**: — (current delivery: URL, ledger-relative HTML path, or `plain text`; update at each hand-over)
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
| B01 | Contract slimming: one copy of the procedure | `chore/contract-slimming` | 1 | — | 🟢 | 2026-09-26 | merged `613c608`: implementer DONE_WITH_CONCERNS @95f8338 (513/515, 2 skipped) → fence PASS → 6b n/a (chore) → R1 SHIP @95f8338 asks=6 (reviewer 3 ASK, one carried to W2; hunter 5, one shared) → polish @bb56dc7 (SKILL.md prose + tests; fence PASS; 513/515) → R2 SHIP @bb56dc7 (scoped polish re-review, 1 test-only ASK → BACKLOG); tip `613c608` PASS tests 535/537, 2 skipped (23s); tier default implementer + hunter, strong/opus reviewers R1–R2; residuals (BACKLOG at close-out): the R2 pin-order ASK, `red → no merge` matched only inside the pinned table, note 7 precedence unasserted, restore rewrites the shared installed skill, clone-relative fixture paths in §Complete checkpoint inputs — LOG §B01 · m: rounds=0 asks=6 fence-bounces=0 gate=5/0 tip-red=0 |
| B02 | Tool CLIs run through any symlinked path; git env scrubbed | `fix/cli-entry-symlink` | 1 | — | 🟢 | 2026-09-26 | merged `0090173`: implementer DONE @665549f (532/534, 2 skipped) → fence PASS → 6b PROVEN (23 of 152 fail on `40f8182`) → R1 SHIP @665549f asks=4 (reviewer 2 ASK, hunter 3, one shared) → polish @c780338 (test-only; fence PASS; 532/534, 2 skipped); tip `0090173` PASS tests 532/534, 2 skipped (23s); tier default (implementer, reviewer, hunter); residuals: `mutate.mjs:204` comment and the CRASHED list still say "a step" (outside BL-041), the Windows newline-directory branch of the refusal test first runs at C1, BL-028 doc half is B01 — LOG §B02 · m: rounds=0 asks=4 fence-bounces=0 gate=3/0 tip-red=0 |
| B03 | Conductor and agent budget rules | `feat/budget-rules` | 2 | — | 🟢 | 2026-09-26 | merged `66ce0f5`: implementer DONE @9863cc5 (541/543, 2 skipped; additions only, no fence extension) → fence PASS → 6b n/a (feature) → R1 SHIP @9863cc5 asks=2 (combined reviewer+gate pass) → polish @62f4be5 (test-only; fence PASS; 541/543); tip `66ce0f5` PASS tests 541/543, 2 skipped (23s); tier default (implementer, combined reviewer); residuals (BACKLOG at close-out): the compaction STOP does not say what it asks of the user, the after-any-compaction duty lives only in step 8 — LOG §B03 · m: rounds=0 asks=2 fence-bounces=0 gate=2/0 tip-red=0 |
| B04 | Prose polish: comment-only classifier, prose ASKs, one strike | `feat/prose-polish` | 3 | — | 🟢 | 2026-09-26 | merged `bf055ce` — W3 open @739c92b; worktree `/home/timetotilt/worktrees/os925/b04`; implementer DONE @f444ef4 (559/561, 2 skipped); fence PASS; 6b n/a (feature); reviewer P0=1 P1=2 ASK=1, hunter 8 (1 P1 shared) — LOG §B04 — gate, round 1; R1 FIX FIRST @f444ef4 → fix round (same implementer) @18b6c86, fence PASS → R2 FIX FIRST @18b6c86 (reviewer P0 F5 continue/break/debugger ASI, P1 F6 directive shapes a sample, ASK F7; hunter 7 test-only ASKs — LOG §B04 — gate, round 2) → ⛔ green, residual finding open (P0) → verdict 2026-09-26 fix again spent → third round on feat/prose-polish @18b6c86 → fresh implementer (strong tier, Fable 5.1) @290a378, @677bc10, @2cf7d9e (561/563, 2 skipped), fence PASS → round-3 reviewer (Fable 5.1) P1 F8 directive verbs a sample (allow, allowlist, skip, skipcq, underscore rule ids), hunter (Fable 5.1) 5 test-only ASKs — LOG §B04 — gate, round 3 → ⛔ green, residual finding open (P1) → R3 FIX FIRST @2cf7d9e → verdict 2026-09-26 ship spent → integrated `bf055ce` (dry run clean, tip PASS tests 561/563, 2 skipped (23s)); residual F8 → BACKLOG `BL-046` (high, P1) + a `Runner: human` smoke step 4 in the batch file (fixture I-04); the round-3 hunter's 5 test-only ASKs → BACKLOG at close-out; tier default (implementer R0–R2, reviewers R1–R2, hunters R1–R2), strong/Fable 5.1 (third-round implementer, R3 reviewer + hunter) · m: rounds=3 asks=0 fence-bounces=0 gate=20/1 tip-red=0 |

## Checkpoints

| Checkpoint | After wave | Covers | Why here | Status | Verdict |
|------------|------------|--------|----------|--------|---------|
| C1 | 3 | B01, B02, B03, B04 | mandatory final; no batch is hands-on | ⬜ | — |

## Issued checkpoint inputs

None yet — issued at C1 close-out (inventory in [01-plan.md](01-plan.md) §Smoke-input inventory: I-01, I-02, I-03).

## Smoke-test verdict log

| Date | Checkpoint | Verdict | User notes |
|------|------------|---------|------------|
| 2026-09-26 | B04 | fix again | "Yup, run it again. Fresh implementer, I moved this session up to max as well to help." |
| 2026-09-26 | B04 | ship with the residual | "As long as the residual isn't a fundamentally breaking bug that sounds fine." |

## Item → batch coverage audit

| Request item | Source | Batch | Version | Status |
|--------------|--------|-------|---------|--------|
| R1 — #14 contract slimming, SHA pin kept on the single copy | request | B01 | — | ⬜ |
| R2 — the EVIDENCE_TOOL/FENCE_TOOL placeholder move | request | B01 | — | ⬜ |
| R3 — BL-028's doc half | request | B01 | — | ⬜ |
| R4 — BL-028 code fix, checkout-enumerating symlink test | request | B02 | — | ⬜ |
| R5 — BL-036 | request | B02 | — | ⬜ |
| R6 — BL-037 | request | B02 | — | ⬜ |
| R7 — #15 budget rules (effort clause dropped by the control) | request | B03 | — | ⬜ |
| R8 — #8 prose half | request | B04 | — | ⬜ |
| R9 — BL-044 | request | B04 | — | ⬜ |
| BL-041 | backlog BL-041 | B02 | — | ⬜ |
| BL-034 | backlog BL-034 | B03 | — | ⬜ |
| BL-042 | backlog BL-042 | B04 | — | ⬜ |

## Session log

| Date | Session did | Stopped because |
|------|-------------|-----------------|
| 2026-09-25 | Scaffold: interview, planning census + #15 control (medium vs max), pre-flight 5 blocking fixed / 9 advisory, plan approved with 3 fold-ins; ledger committed on `chore/slim-contract-pack-ledger` from `edd2f1e` | STOP — wave 1 starts only on the user's word |
| 2026-09-25 | continue: skill pin SKILL MATCH; reconcile — all rows ⬜, no batch branch exists (correct state); resume-time validation on `40f8182` PASS tests 510/512, 2 skipped (23s); W1 opened — wave base `40f8182bdebe5596420bda2394ed181627a03f99`, branches `chore/contract-slimming` (B01) and `fix/cli-entry-symlink` (B02) cut, worktrees `b01`/`b02` | W1 closed (no checkpoint after W1) |
| 2026-09-26 | continue (same session): W1 gated and integrated — B02 `0090173`, B01 `613c608`, tip PASS tests 535/537, 2 skipped; W2 opened — wave base `6d2492bb7a0bc393b863df6b6cb7b49076854753`, branch `feat/budget-rules` (B03) cut, worktree `b03` | W2 closed (no checkpoint after W2) |
| 2026-09-26 | continue (same session): W2 gated and integrated — B03 `66ce0f5`, tip PASS tests 541/543, 2 skipped; W3 opened — wave base `739c92b0547a76a65fed142490c22b729900732e`, branch `feat/prose-polish` (B04) cut, worktree `b04` | STOP — B04 ⛔ green, residual finding open (P0) after its second FIX FIRST; verdict needed: fix again / ship with the residual / drop; C1 close-out waits on it |
| 2026-09-26 | continue (same session): the user verdict on B04, fix again, recorded verbatim and consumed — B04 → 🔄, third round on `feat/prose-polish` @18b6c86: a FRESH implementer on the strong tier (Fable 5.1), then a fresh re-review | STOP — B04 ⛔ green, residual finding open (P1) after the authorized third round (R3 FIX FIRST @2cf7d9e); verdict needed: ship with the residual / drop; C1 close-out waits on it |
