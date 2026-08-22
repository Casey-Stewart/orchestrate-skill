# Progress

**Identifier**: {{CHANGE_ID}}
**Started**: {{DATE}}
**Work list**: [01-plan.md](01-plan.md) (see [00-request.md](00-request.md))
**Contract**: [00-READBEFORE.md](00-READBEFORE.md)
**Rule**: statuses here are claims; **git is truth**. Reconcile against branches/commits
before believing any row (§Recovery in the contract).

## Execution model

**{{EXECUTION_MODEL}}** — {{EXECUTION_MODEL_RATIONALE}}

## Legend

- `⬜ Not Started` · `🔄 In Progress` · `🧪 Ready for Smoke Test` (commits on branch,
  validations green, awaiting USER verdict) · `❌ Smoke Failed` · `✅ Merged` ·
  `⛔ Blocked` · `👤 User Action`

## Batches

| # | Batch | Branch | Version | Status | Updated | Notes |
|---|-------|--------|---------|--------|---------|-------|
<!-- one row per batch from the plan's batch table, all ⬜ at scaffold time (Version "—"
     if the repo doesn't version). Keep Notes DENSE at close-out: commit SHA, root cause,
     reviewer arc (e.g. "two-round: D1 blocking → FIX VERIFIED"), accepted residuals,
     validation results. The Notes column is the change's institutional memory. -->

## Smoke-test verdict log

| Date | Batch | Verdict | User notes |
|------|-------|---------|------------|
<!-- record the user's VERBATIM words for every verdict — including any merge/push/release
     authorization contained in the same message; that wording is the authorization record -->

## Item → batch coverage audit

| Request item | Batch | Version | Status |
|--------------|-------|---------|--------|
<!-- one row per user item from 00-request.md. The final pass must show ZERO unaccounted
     items: each row ends as a merged commit SHA, an intended-behavior resolution, or a
     named backlog entry. -->

## Session log

| Date | Session did | Stopped because |
|------|-------------|-----------------|
<!-- append one row per session: what happened (batches touched, reconciliations, reviewer
     arcs) and exactly why work halted (smoke gate, ⛔, user input needed, COMPLETE) -->
