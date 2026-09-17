# Progress

**Identifier**: {{CHANGE_ID}}
**Started**: {{DATE}}
**State**: ACTIVE
**Work list**: [01-plan.md](01-plan.md) (see [00-request.md](00-request.md))
**Contract**: [00-READBEFORE.md](00-READBEFORE.md) · **Narrative**: [LOG.md](LOG.md)
(read on demand by heading, never at boot)
**Smoke page**: — (artifact URL, recorded at the first checkpoint hand-over)
**Rule**: statuses here are claims; **git is truth**. Reconcile against branches/commits
before believing any row (§Recovery in the contract).

<!-- **State** is exactly one of: ACTIVE | AT-CHECKPOINT C<n> | USER-BLOCKED | COMPLETE.
     Update it in the same commit as every wave open, checkpoint close-out and
     change-complete. Discovery greps this one line — keep the form exact. -->

## Execution model

**{{EXECUTION_MODEL}}** — {{EXECUTION_MODEL_RATIONALE}}

## Legend

- `⬜ Not Started` · `🔄 In Progress` · `🟢 Integrated` (reviewed, validations green on
  the worktree AND the integration tip, merged; verified at its checkpoint) ·
  `🧪 At Checkpoint` (checkpoint reached, awaiting the USER's combined smoke verdict) ·
  `❌ Smoke Failed` (the USER failed a reached checkpoint — never an agent-found failure) ·
  `✅ Merged` · `⛔ Blocked` (`defective`, or `green, residual finding open`) ·
  `👤 User Action`

## Batches

| # | Batch | Branch | Wave | Version | Status | Updated | Notes |
|---|-------|--------|------|---------|--------|---------|-------|
<!-- one row per batch from the plan's batch table, all ⬜ at scaffold time (Version "—"
     if the repo doesn't version). Notes are DENSE but SHORT (≈300 chars): integration
     SHA, reviewer arc ("R1 FIX FIRST P1 → R2 SHIP"), tier used, fence extensions
     ("fence +path (item, reason, date)"), accepted residuals, then the metrics token
     `m: rounds=<n> asks=<n> fence-bounces=<n> gate=<findings/prod> tip-red=<0|1>`.
     Anything longer goes in LOG.md under a heading this cell names. -->

## Checkpoints

| Checkpoint | After wave | Covers | Why here | Status | Verdict |
|------------|------------|--------|----------|--------|---------|
<!-- one row per checkpoint from the plan's wave map — intermediate rows only after
     waves carrying hands-on batches, plus the mandatory final row. Status ⬜ until
     reached, 🧪 while awaiting the user, then ✅/❌ per the verdict log. In Verdict,
     also note the pre-smoke result: "agent 6/6 pass @<sha>, human 9 steps". -->

## Smoke-test verdict log

| Date | Checkpoint | Verdict | User notes |
|------|------------|---------|------------|
<!-- record the user's VERBATIM words for every checkpoint verdict — including any
     merge/push/release authorization in the same message (that wording IS the
     authorization record) and which batch(es) a partial fail indicts. Verbatim quotes are
     exempt from every length cap. The smoke page's "Copy results as text" paste is the
     preferred form; works-but items become backlog entries, not failures. -->

## Item → batch coverage audit

| Request item | Source | Batch | Version | Status |
|--------------|--------|-------|---------|--------|
<!-- one row per user item from 00-request.md; Source = "request" or "backlog <id>" for
     an accepted fold-in. The final pass must show ZERO unaccounted items: each row ends
     as a merged commit SHA, an intended-behavior resolution, or a named backlog entry,
     and carries the convergence class (implemented / partial / contradicts). -->

## Session log

| Date | Session did | Stopped because |
|------|-------------|-----------------|
<!-- append one row per session, ≤200 characters: waves opened with base SHAs, batches
     integrated, reconciliations, checkpoint close-outs with integration SHAs, and
     exactly why work halted (checkpoint, ⛔, user input needed, COMPLETE). Narrative
     goes in LOG.md under a heading named here. -->
