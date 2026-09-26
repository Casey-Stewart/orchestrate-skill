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
| B01 | Contract slimming: one copy of the procedure | `chore/contract-slimming` | 1 | — | 🔄 | 2026-09-25 | W1 open @40f8182; worktree `/home/timetotilt/worktrees/os925/b01` |
| B02 | Tool CLIs run through any symlinked path; git env scrubbed | `fix/cli-entry-symlink` | 1 | — | 🔄 | 2026-09-26 | W1 open @40f8182; worktree `/home/timetotilt/worktrees/os925/b02`; implementer DONE @665549f (532/534, 2 skipped); fence PASS; 6b PROVEN (23 fail on base); R1 SHIP @665549f asks=4 (reviewer 2 ASK + hunter 3, one shared — LOG §B02 — gate, round 1) |
| B03 | Conductor and agent budget rules | `feat/budget-rules` | 2 | — | ⬜ | 2026-09-25 | — |
| B04 | Prose polish: comment-only classifier, prose ASKs, one strike | `feat/prose-polish` | 3 | — | ⬜ | 2026-09-25 | — |

## Checkpoints

| Checkpoint | After wave | Covers | Why here | Status | Verdict |
|------------|------------|--------|----------|--------|---------|
| C1 | 3 | B01, B02, B03, B04 | mandatory final; no batch is hands-on | ⬜ | — |

## Issued checkpoint inputs

None yet — issued at C1 close-out (inventory in [01-plan.md](01-plan.md) §Smoke-input inventory: I-01, I-02, I-03).

## Smoke-test verdict log

| Date | Checkpoint | Verdict | User notes |
|------|------------|---------|------------|

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
| 2026-09-25 | continue: skill pin SKILL MATCH; reconcile — all rows ⬜, no batch branch exists (correct state); resume-time validation on `40f8182` PASS tests 510/512, 2 skipped (23s); W1 opened — wave base `40f8182bdebe5596420bda2394ed181627a03f99`, branches `chore/contract-slimming` (B01) and `fix/cli-entry-symlink` (B02) cut, worktrees `b01`/`b02` | — (running) |
