# Plan — {{CHANGE_ID}}

<!-- 2–4 sentences of context: what this change is, what prompted it, intended outcome. -->

**Orchestration**: this change runs under [00-READBEFORE.md](00-READBEFORE.md) — that
file is the contract; this one only locks scope and ordering.

## Batch table

| # | Batch | Type | Branch | Files (fence) | Version |
|---|-------|------|--------|---------------|---------|
<!-- one row per batch; Type = fix / feature / chore. Fences must not overlap unless the
     execution model explicitly handles the collision. Version "—" if the repo doesn't
     version. -->

## Ordering rationale

<!-- Why this order: dependencies, risk-first vs quick-wins-first, fence overlaps that
     force sequence, and (if waves/stack) which batches group and why.
     RULE: user-decision gates (UX mockup approvals, design picks) come FIRST —
     resolved at planning time where possible, else the earliest batches. No mid-run
     batch may stall waiting on the user for a gate the plan already knew about. -->

## Per-batch specifications

<!-- ### B01 — <title>
     One section per batch: verbatim request text for its items, exploration findings
     (file:line facts, existing helpers to reuse), design decisions, edge cases. The
     batch files quote from here — write it complete enough that an implementer with
     zero other context can build from the batch file alone. -->

## Coverage audit (planning-time)

<!-- Table: every request item → its batch. Zero unassigned items before the scaffold
     commit. This table seeds PROGRESS.md's coverage audit. -->
