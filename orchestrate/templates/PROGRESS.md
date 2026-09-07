# Progress

**Identifier**: {{CHANGE_ID}}
**Started**: {{DATE}}
**Work list**: [01-plan.md](01-plan.md) (see [00-request.md](00-request.md))
**Contract**: [00-READBEFORE.md](00-READBEFORE.md)
**Smoke page**: — (artifact URL, recorded at the first checkpoint hand-over)
**Rule**: statuses here are claims; **git is truth**. Reconcile against branches/commits
before believing any row (§Recovery in the contract).

## Execution model

**{{EXECUTION_MODEL}}** — {{EXECUTION_MODEL_RATIONALE}}

## Legend

- `⬜ Not Started` · `🔄 In Progress` · `🟢 Integrated` (reviewed, validations green,
  merged to the integration branch; verified at its checkpoint) · `🧪 At Checkpoint`
  (checkpoint reached, awaiting the USER's combined smoke verdict) · `❌ Smoke Failed` ·
  `✅ Merged` · `⛔ Blocked` · `👤 User Action`

## Batches

| # | Batch | Branch | Wave | Version | Status | Updated | Notes |
|---|-------|--------|------|---------|--------|---------|-------|
<!-- one row per batch from the plan's batch table, all ⬜ at scaffold time (Version "—"
     if the repo doesn't version). Keep Notes DENSE at integration: commit SHA, root
     cause, reviewer arc (e.g. "two-round: D1 blocking → FIX VERIFIED"), accepted
     residuals, validation results. The Notes column is the change's institutional
     memory. -->

## Checkpoints

| Checkpoint | After wave | Covers | Why here | Status | Verdict |
|------------|------------|--------|----------|--------|---------|
<!-- one row per checkpoint from the plan's wave map — intermediate rows only after
     waves carrying hands-on batches, plus the mandatory final row. Status ⬜ until
     reached, 🧪 while awaiting the user, then ✅/❌ per the verdict log. -->

## Smoke-test verdict log

| Date | Checkpoint | Verdict | User notes |
|------|------------|---------|------------|
<!-- record the user's VERBATIM words for every checkpoint verdict — including any
     merge/push/release authorization in the same message (that wording IS the
     authorization record) and which batch(es) a partial fail indicts. The smoke
     page's "Copy results as text" paste is the preferred form; works-but items
     become backlog entries, not failures. -->

## Item → batch coverage audit

| Request item | Batch | Version | Status |
|--------------|-------|---------|--------|
<!-- one row per user item from 00-request.md. The final pass must show ZERO unaccounted
     items: each row ends as a merged commit SHA, an intended-behavior resolution, or a
     named backlog entry. -->

## Session log

| Date | Session did | Stopped because |
|------|-------------|-----------------|
<!-- append one row per session: what happened (waves opened with base SHAs, batches
     integrated, reconciliations, reviewer arcs, checkpoint close-outs with integration
     SHAs) and exactly why work halted (checkpoint, ⛔, user input needed, COMPLETE) -->
