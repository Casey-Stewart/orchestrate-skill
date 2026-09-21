# Progress

**Identifier**: OS-20260921-backlog-closeout
**Started**: 2026-09-21 · **Base**: 5efd484 (the default-branch commit the ledger
branch was cut from — the "since" point for the first checkpoint's diff and for convergence)
**State**: ACTIVE
**Work list**: [01-plan.md](01-plan.md) (see [00-request.md](00-request.md))
**Contract**: [00-READBEFORE.md](00-READBEFORE.md) · **Narrative**: [LOG.md](LOG.md)
(read on demand by heading, never at boot)
**Smoke page**: — (current delivery: URL, ledger-relative HTML path, or `plain text`; update at each hand-over)
**Rule**: statuses here are claims; **git is truth**. Reconcile against branches/commits
before believing any row (§Recovery in the contract).

**State** is exactly one of: ACTIVE | AT-CHECKPOINT C1 | USER-BLOCKED | COMPLETE. It is
updated in the same commit as every wave open, checkpoint close-out and change-complete.
Discovery greps this one line — keep the form exact.

## Execution model

**Waved stack — W1: B01+B02+B03; W2: B04. Checkpoint: C1 final after W2, fully agent-run** —
W1's three members are mutually file-disjoint, computed literally at plan time and
re-checked at pre-flight after two fences widened, and no member reads another's output.
The one contested document is `orchestrate/references/smoke-page.md`, which holds both the
self-check paragraph B01 edits and the definition of the proofing pass B02 wires in; it is
fenced to B01 alone, and B02 stays clear of it by adding a separate post-page block rather
than re-timing the existing pre-smoke one. B04 runs alone in W2 because it records what
B01, B02 and B03 actually did — their merge SHAs and their final fix shapes — which is not
knowable until they land. One checkpoint, final: nothing here needs a device, a GUI, held
credentials or a look-and-see judgement, so every C1 step is agent-runnable and an
intermediate checkpoint would prove nothing the final one cannot.

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
| B01 | Scope the smoke-page self-check to the template (BL-022) | `fix/smoke-page-selfcheck-scope` | 1 | — | ⬜ | 2026-09-21 | M. Must re-aim the defect-pinning assertion at `tests/build-smoke-page.test.cjs:54`, not delete it. |
| B02 | Wire the post-render proofing pass into the hand-over (BL-023) | `fix/post-render-pass-wiring` | 1 | — | ⬜ | 2026-09-21 | L — strong-tier reviewer. Separate post-page block; guard must sweep a domain, not a carrier list. |
| B03 | Narrow the polish continuation scan (BL-021) | `fix/polish-continuation-checkbox` | 1 | — | ⬜ | 2026-09-21 | S — combined reviewer+gate pass. Edits the fence tool; run helpers from the integration tree only. |
| B04 | Close the backlog open table | `chore/backlog-open-table-closeout` | 2 | — | ⬜ | 2026-09-21 | S — combined pass. Reads the merged commits of B01–B03, not this ledger's intentions. |

## Checkpoints

| Checkpoint | After wave | Covers | Why here | Status | Verdict |
|------------|------------|--------|----------|--------|---------|
| C1 | 2 | B01, B02, B03, B04 | The mandatory final checkpoint, and the only one — no batch in this change is hands-on, so every step is `Runner: agent` and an intermediate checkpoint would prove nothing this one cannot | ⬜ | — |

## Issued checkpoint inputs

Nothing issued yet. At C1 close-out this section links the sidecar's stable-id input
registry, the exact immutable issue files, any independent validation evidence, a raw
hash/size manifest and the delivery location, plus working-copy and reset instructions.

## Smoke-test verdict log

| Date | Checkpoint | Verdict | User notes |
|------|------------|---------|------------|

## Item → batch coverage audit

| Request item | Source | Batch | Version | Status |
|--------------|--------|-------|---------|--------|
| BL-022 — the builder rejects a page whose CONTENT contains a doubled brace | backlog BL-022 | B01 | — | ⬜ |
| BL-023 — the post-render proofing pass is invoked by nothing | backlog BL-023 | B02 | — | ⬜ |
| BL-021 — the polish continuation scan admits a checkbox | backlog BL-021 | B03 | — | ⬜ |
| BL-018, BL-019, BL-020, BL-026 closed as accepted-with-rationale | request | B04 | — | ⬜ |
| BL-015, BL-024, BL-025, BL-027 moved to "Noted, no action" | request | B04 | — | ⬜ |

## Session log

| Date | Session did | Stopped because |
|------|-------------|-----------------|
| 2026-09-21 | Scaffolded `OS-20260921-backlog-closeout` at base `5efd484` (clean tree, cut from `main` after the BACKLOG table-rendering fix merged as `5efd484`). Repeat-repo interview: three decisions taken in one call, every other answer inherited from the previous ledger's contract. Pre-flight returned **4 BLOCKING, 10 ADVISORY**; all resolved into the plan and batch files before the user saw them — B02's wiring target contradicted the QA runner's pre-page timing, two fences were missing a test file each, and a B03 smoke step would have mutated a real ledger. Plan approved "Approve as shown". | Plan approved as scaffold-only. Wave 1 does not open until the user says so. |
