# Plan — {{CHANGE_ID}}

<!-- 2–4 sentences of context: what this change is, what prompted it, intended outcome. -->

**Orchestration**: this change runs under [00-READBEFORE.md](00-READBEFORE.md) — that
file is the contract; this one only locks scope, waves, and checkpoints.

## Batch table

| # | Batch | Type | Branch | Wave | Files (fence) | Smoke | Version |
|---|-------|------|--------|------|---------------|-------|---------|
<!-- one row per batch; Type = fix / feature / chore. Wave = the concurrent group it
     runs in. Fences must be DISJOINT within a wave — reshape batches (seam batches,
     splits, merges) until the safe waves are as wide as possible. Smoke = the covering
     checkpoint (e.g. "C1"), suffixed "(hands-on)" for batches that need the user's
     hands — those are the reason an intermediate checkpoint exists. Version "—" if the
     repo doesn't version. -->

## Wave map & checkpoints

<!-- One line per wave: members + WHY they are safe together (disjoint fences, no
     dependency between them). One line per checkpoint: after which wave, which batches
     it covers, and why it sits there — intermediate checkpoints exist ONLY for
     hands-on risk; the final checkpoint is mandatory and covers everything since the
     last one (with no hands-on work outside the final wave, it is the ONLY one). Then
     any dependencies that force wave ordering.
     RULE: user-decision gates (UX mockup approvals, design picks) come FIRST —
     resolved at planning time where possible, else wave 1. No mid-run wave may stall
     waiting on the user for a gate the plan already knew about. -->

## Per-batch specifications

<!-- ### B01 — <title>
     One section per batch: verbatim request text for its items, exploration findings
     (file:line facts, existing helpers to reuse), design decisions, edge cases. The
     batch files quote from here — write it complete enough that an implementer with
     zero other context can build from the batch file alone. -->

## Coverage audit (planning-time)

<!-- Table: every request item → its batch. Zero unassigned items before the scaffold
     commit. This table seeds PROGRESS.md's coverage audit. -->
