# Progress

**Identifier**: OS-20260921-backlog-closeout
**Started**: 2026-09-21 · **Base**: 5efd484 (the default-branch commit the ledger
branch was cut from — the "since" point for the first checkpoint's diff and for convergence)
**State**: AT-CHECKPOINT C1
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
| B01 | Scope the smoke-page self-check to the template (BL-022) | `fix/smoke-page-selfcheck-scope` | 1 | — | 🧪 | 2026-09-21 | M, default tier. Integrated `5589ddc`, tip 315/315. Impl DONE @`4d235d2` → polish @`31efaf6`. R1 SHIP asks=5; hunter 2 findings. Reviewer probed the TEMPLATE axis and correctly found no regression; hunter probed the OUTPUT axis and found one — different probes, both right. **The hunter's mutant M-G was a no-op**: it anchored on `<body`, which the shipped template does not contain, so its green measured nothing. The implementer caught that, re-ran against `<main`, and the finding held — right conclusion, unsound evidence, evidence fixed. See LOG §gates. m: rounds=0 asks=7 fence-bounces=0 gate=2/0 tip-red=0 |
| B02 | Wire the post-render proofing pass into the hand-over (BL-023) | `fix/post-render-pass-wiring` | 1 | — | 🧪 | 2026-09-21 | L, strong-tier reviewer. Integrated `ae19bee`, tip 311/311. Impl DONE_WITH_CONCERNS @`ba90937` → polish @`d54a9fa`. R1 SHIP asks=5; hunter 5 findings (F1 guard's subject was the whole document, not the close-out region — an ancestry mention elsewhere satisfied it; F2 sweep only caught vocabulary-repeating undoings; F3 controls written from the patterns, so narrowing both families at once stayed green). Found the close-out sequence has FIVE carriers, not the 3 the batch file claimed — `SKILL.md` wraps "combined smoke\nscript" and hides from a naive grep. Both un-wired carriers recorded permissively, so wiring either later goes green with no test edit. Every polish item re-verified by re-running the mutation that produced it: 7 red, control green. m: rounds=0 asks=10 fence-bounces=0 gate=5/0 tip-red=0 |
| B03 | Narrow the polish continuation scan (BL-021) | `fix/polish-continuation-checkbox` | 1 | — | 🧪 | 2026-09-21 | S, combined pass. Integrated `a2d950d`, tip 317/317. Impl DONE @`a1aeff4` → polish @`29b2fdb` (DONE_WITH_CONCERNS). Gate SHIP asks=4; it disproved the impl's own claim that the sweep's domain was pinned — test:207 was a uniqueness check, green under three separate member deletions. fence +`orchestrate/templates/02-batch.md` (ASK-4, template prose made false by this batch's own narrowing, 2026-09-21). Concern raised was the fence tool's `**Files**: ` branch reading dead for this ledger; **diagnosed as an orchestrator scaffolding error, not a tool defect** — see LOG §files-line. m: rounds=0 asks=4 fence-bounces=0 gate=4/0 tip-red=0 |
| B04 | Close the backlog open table | `chore/backlog-open-table-closeout` | 2 | — | 🧪 | 2026-09-21 | S, combined pass. Integrated `fb95487`, tip 317/317. Impl DONE @`814da2d` → R1 **FIX FIRST** (P1) → fix @`b9ff19e` → R2 SHIP asks=2 → polish @`ab07baf`. The P1 is the one this change existed to catch: BL-019 closed on a rationale pointing at documentation that did NOT contain the fact, while the same diff deleted the fact's only other live record. fence +`tests/agent-definitions.test.cjs` (so the digit case lives beside the code it describes, 2026-09-21). Found and honoured a 2026-09-19 user decision to remove the Deferred section that a later close-out commit had undone. m: rounds=1 asks=2 fence-bounces=0 gate=1/1 tip-red=0 |

## Checkpoints

| Checkpoint | After wave | Covers | Why here | Status | Verdict |
|------------|------------|--------|----------|--------|---------|
| C1 | 2 | B01, B02, B03, B04 | The mandatory final checkpoint, and the only one — no batch in this change is hands-on, so every step is `Runner: agent` and an intermediate checkpoint would prove nothing this one cannot | 🧪 | **Pre-smoke 7/7 PASS, 0 human steps.** Every zero control-armed; three mutation controls on the table counter, a regression control proving the pre-fix builder rejects the same input, and a live-armed check that KNOWN_UNWIRED is permissive (wiring SKILL.md keeps the suite GREEN). Step 7 exercised the newly-wired proofing pass on a throwaway page and found two authoring-side issues — see LOG §C1. m: pre-smoke=7/0 human-smoke-min=0 escaped=— |

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
| 2026-09-21 | **Wave 2 opened** at integration base `443b52d`. B04 alone; it reads the merged commits of B01-B03 rather than this ledger's intentions. | — (run in progress) |
| 2026-09-21 | **Wave 1 closed.** All three batches implemented concurrently, gated, polished and integrated: B02 `ae19bee`, B01 `5589ddc`, B03 `a2d950d`. Tip validation green after every merge (311 → 315 → 317), `git diff --check` clean throughout. Both gates returned findings on all three batches; every finding was an ASK closed by a polish pass on its own branch, so **zero new backlog entries were created by wave 1**. One fence extension recorded (B03 +`orchestrate/templates/02-batch.md`). One orchestrator error found and fixed: this ledger's `**Files**` headers were copied from the stale installed skill and were unreadable by the fence tool — see LOG §files-line. Next: wave 2 (B04). | Wave 1 complete; opening wave 2. |
| 2026-09-21 | **Wave 1 opened** at integration base `6054be8` — B01, B02, B03 cut concurrently, each in its own worktree under a short temp root (the session scratchpad path exceeded Windows MAX_PATH against the archived evidence tree). User authorization: "go ahead and run to checkout", read as *checkpoint* and stated as such before acting. Contract contradiction over `BACKLOG.md` ownership resolved before spawning (`13a0494`). | — (run in progress) |
| 2026-09-21 | Scaffolded `OS-20260921-backlog-closeout` at base `5efd484` (clean tree, cut from `main` after the BACKLOG table-rendering fix merged as `5efd484`). Repeat-repo interview: three decisions taken in one call, every other answer inherited from the previous ledger's contract. Pre-flight returned **4 BLOCKING, 10 ADVISORY**; all resolved into the plan and batch files before the user saw them — B02's wiring target contradicted the QA runner's pre-page timing, two fences were missing a test file each, and a B03 smoke step would have mutated a real ledger. Plan approved "Approve as shown". | Plan approved as scaffold-only. Wave 1 does not open until the user says so. |
