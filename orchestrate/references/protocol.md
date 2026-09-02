# The ledger protocol — canonical reference

This is the skill's own copy of the orchestration contract. **Precedence rule: a
ledger's own contract file always outranks this document.** Use this file to (a) drive a
legacy ledger that predates the skill and lacks a contract file, and (b) keep the
templates honest — it mirrors `templates/00-READBEFORE.md` section for section.

## What a ledger is

One directory per change: `.agents/changes/<ID>/`, where `<ID> = <PREFIX>-YYYYMMDD-<slug>`
(e.g. `IST-20260713-ux-fix-pack`). The directory is committed to the repo on purpose — it
is the audit trail of an AI-assisted change. Standard files (new scaffolds):

| File | Purpose |
|---|---|
| `00-request.md` | The user's verbatim ask + clarifying decisions + item→batch map |
| `00-READBEFORE.md` | The contract: boot sequence, git model, checkpoints, validations, recovery, session algorithm |
| `01-plan.md` | Locked scope: batch table, wave map + checkpoints, per-batch specs, coverage audit |
| `02-batches-NN-<slug>.md` | One per batch: wave, fence, verbatim spec, checklist, acceptance criteria, checkpoint smoke steps |
| `PROGRESS.md` | The live ledger: status + checkpoint tables, verdict log, coverage audit, session log |

A scaffolded ledger is a **closed system**: every repo-specific fact (validation
commands, version files, merge policy, wave map, checkpoint placement, smoke procedure)
is baked into its READBEFORE and plan at scaffold time. A session without this skill can
drive the change by reading the ledger alone — that property is the point; never
generate a ledger that references this skill.

## Roles

- **Orchestrator** — the main session. Owns PROGRESS, branches, worktrees, integration
  merges, close-outs, and all user communication. The ONLY role that edits version
  files, the changelog, or PROGRESS.
- **Implementer** — a sub-agent given one batch. Codes inside the file fence in the
  batch's isolated worktree, ticks the batch checklist, commits on the batch branch.
  Wave siblings run concurrently. Spawned with a fully self-contained prompt
  (`subagent-prompts.md`).
- **Reviewer** — ONE independent read-only sub-agent per batch, even inside a wave.
  Maps every diff hunk to a batch item (unmapped = scope creep = reject), verifies
  acceptance criteria, runs validations, checks project guardrails. Verdict
  vocabulary: `SHIP` / `FIX FIRST` / `NEEDS A CLOSER LOOK`. Max 2 rounds, then the
  batch is ⛔.

Neither sub-agent role has the planning session's context — every prompt is built from
the ledger files and complete in itself.

## Status legend

| Status | Meaning |
|---|---|
| ⬜ Not Started | No commits on its branch |
| 🔄 In Progress | Wave opened (branch cut, row flipped), implementation ongoing |
| 🟢 Integrated | Reviewed, validations green, merged into the integration branch; verified at its covering checkpoint |
| 🧪 At Checkpoint | A planned checkpoint is reached — awaiting the USER's combined smoke verdict |
| ❌ Smoke Failed | User reported a checkpoint failure triaged to this batch — the fix-up is the next session's FIRST job |
| ✅ Merged | In the default branch (verify with git, not the table) |
| ⛔ Blocked | Reviewer rejected twice, or an external blocker — left out of integration; needs user direction |
| 👤 User Action | Waiting on something only the user can do (credentials, hardware, approvals) |

Statuses are claims; **git is truth**. Reconcile before believing any row.

## Git model (generic defaults)

- An **integration branch** (default: the scaffold branch `chore/<slug>-ledger`)
  accumulates the change. One branch per batch, cut from the integration tip when the
  batch's wave opens; wave members run concurrently, each implementer in an isolated
  worktree under the session scratchpad. The orchestrator merges REVIEWED batches
  back into the integration branch serially — fence disjointness makes those merges
  conflict-free; a real conflict means a fence was violated (stop and reconcile,
  never hand-resolve silently).
- Never commit to the default branch; never push. Default policy: the USER
  smoke-tests at checkpoints and merges the default branch up to the checkpoint's
  integration commit. A scaffold-time interview may set a different policy (PR flow,
  orchestrator ff-merge on a recorded verdict); the ledger's contract states
  whichever governs.
- Wave open = ONE PROGRESS commit on the integration branch (member rows → 🔄,
  branches named, wave base SHA logged). That commit is the crash marker recovery
  keys on. PROGRESS is edited only on the integration branch; implementers tick only
  their own batch file on their own branch.
- Waves and checkpoints come from the plan's locked wave map; plan approval is the
  standing authorization for the concurrency. Deviating from the map needs the user's
  explicit words, recorded verbatim in PROGRESS.
- Never `--no-verify`, never force-push, never rewrite history.

## Smoke checkpoints

The user smoke-tests at planned CHECKPOINTS, never per batch by default: one after
each wave carrying a hands-on batch (visible UI/UX, auth/payment/external-service
flows, migrations, destructive or hard-to-reverse operations — anything validations +
review cannot prove), plus one mandatory final checkpoint covering everything since
the last. If no hands-on work sits outside the final wave, the final checkpoint is the
ONLY one. Between checkpoints the run is autonomous. A reached checkpoint is never
skipped and never resolved without the user's verdict.

## §Recovery — the reconcile table

For each PROGRESS row not `✅`/`👤`, gather: branch exists? (`git rev-parse --verify`),
integrated? (`git merge-base --is-ancestor <branch> <integration>`), shipped?
(`git merge-base --is-ancestor <integration> <default>`), commits ahead
(`git log <integration>..<branch> --oneline`), dirty trees (`git status --porcelain`
in the main checkout AND each worktree from `git worktree list`), and the checklist
state inside the batch file on that branch (`git show <branch>:<path>`).

| Ledger says | Git shows | Verdict |
|---|---|---|
| 🔄 | branch missing, or no commits past the wave base | Implementer never landed → re-spawn it (fresh worktree) |
| 🔄 | dirty worktree, or commits ahead + partial checklist | Resume the implementer at the first unticked item (recreate the worktree if gone) |
| 🔄 | commits ahead, checklist fully ticked, validations green | Crashed before review → run the reviewer gate now |
| 🟢 | branch NOT an ancestor of the integration branch | Crashed between review and merge → integrate now |
| 🟢 | branch ancestor of the integration branch | Correct state — waits for its covering checkpoint |
| 🧪 | integration branch ancestor of the default branch | User merged silently → flip the checkpoint's covered rows ✅, propose branch deletes |
| 🧪 | integration branch not merged | Correct state → ask the user for the checkpoint verdict |
| ❌ | any | Fix-up pass is this session's FIRST job |

Prune worktrees of integrated batches (`git worktree remove`). Log every
reconciliation in the PROGRESS Session log.

## §Session algorithm ("continue")

1. Boot + reconcile.
2. Any `❌`? On the integration branch, spawn ONE fix-up implementer with the user's
   failure notes verbatim + the indicted batch file(s) + the diff since the last
   passed checkpoint; fix → validate → commit → rows back to 🧪 → STOP, reprinting
   the checkpoint's combined smoke script.
3. Any `🧪`? A checkpoint is open — ask the user for its verdict (passed / failed /
   waive). Never open the next wave past an unanswered checkpoint.
4. Open the next wave: the earliest wave with `⬜` batches whose deps are all 🟢/✅.
   From the integration tip, cut every member branch, create every worktree (run the
   ledger's per-worktree setup), commit the wave-open PROGRESS flip.
5. Spawn ALL of the wave's implementers concurrently, one per batch, each pinned to
   its worktree. Prompts are SELF-CONTAINED (spec text, fence, acceptance criteria,
   validation commands, conventions, prohibitions, checklist-ticking instruction).
6. Reviewer gate per batch, as each implementer reports — don't wait for the wave's
   slowest: hunk→item mapping, acceptance criteria vs the diff (three-dot against the
   integration branch), validations, guardrails. Defects → implementer pass. Max 2
   rounds → ⛔ (left out of integration; dependents stay blocked; surfaced at the
   next STOP).
7. Integrate serially: merge each SHIP batch into the integration branch, apply the
   version/changelog cadence, flip its row 🟢, remove its worktree.
8. Wave closed. Carries a checkpoint → per-checkpoint close-out → STOP, printing the
   COMBINED smoke script (every covered batch's steps, hands-on batches first). No
   checkpoint → open the next wave in the SAME session. Default cadence: run to the
   next checkpoint, stopping early only at ⛔ or an unplanned user gate.

**User gates are front-loaded**: design/UX approvals the plan can foresee are resolved
at planning time (mockup shown, pick recorded, approved design baked into the batch
file) or scheduled as wave 1 — never mid-sequence where they stall the autonomous run.
An UNPLANNED gate surfacing mid-batch: implement what is decidable, record the exact
question in the row's Notes (`👤` if the batch cannot close without it), and ask it in
the STOP hand-off.

## Two distinct close-outs

**Per-checkpoint** (step 8): version bump + changelog per the cadence for everything
integrated since the last checkpoint, covered rows `🟢` → `🧪`, checkpoint-table row,
session-log row recording the checkpoint's integration SHA, commit on the integration
branch, STOP with the combined smoke script.

**Change-complete** (after the FINAL checkpoint passes and every batch is ✅):
1. Final coverage audit — every request item → merged commit / intended-behavior
   resolution / named backlog entry. Zero unaccounted.
2. **Distillation loop**: new bug CLASSES discovered by this change → one-line guardrail
   bullets in the project's always-loaded doc (a CLAUDE.md guardrails section; create it
   if missing). Residuals and deferrals → named backlog entries. Durable lessons belong
   in repo files every future session loads — not in any one session's memory.
3. Release command, only on explicit user authorization.
4. Session-log row marked COMPLETE; propose deleting merged branches.

**A COMPLETE ledger is never resumed.** On "continue" with nothing active: reconcile,
report completion, and point at the backlog for follow-ups. Do not fabricate a batch.

Classify a ledger from its BATCHES-TABLE rows plus the Session log — never from the
Legend line or log prose (both quote every emoji). An explicit change-COMPLETE marker
in the Session/verdict log outranks leftover advisory rows: a lingering `👤` item
(e.g. "rotate the deploy credential") makes the ledger a reminder to
surface, not a change to resume.

## Legacy ledger recognition (interop)

Ledgers created before this skill (or before the waved stack) vary in shape.
Recognition rules:

| Variant | How to recognize | How to drive |
|---|---|---|
| Contract under another name | `02-batches-00-READBEFORE.md` or `03-tasks-00-READBEFORE.md` | Same contract — follow it as-is |
| Contract absent | Only `01-plan.md` + `PROGRESS.md` (± request file) | Protocol lives in the plan's orchestration section + the PROGRESS preamble; this file fills gaps; ASK before acting on anything ambiguous |
| Per-batch smoke scaffolds | Contract has no checkpoints or 🟢 status; every batch ends 🧪; model named strict sequential / linear stack / stacked waves | Earlier skill versions: drive as written — smoke and merge each batch under its own algorithm |
| Task model (oldest) | `03-tasks-NN-*` files; statuses `✅ Completed` / `🔴 Incomplete` | Map ✅→✅ and 🔴→ask (❌ or ⛔?); tasks may share a single feature branch — check git |
| Spec/plan split | `01-specification.md` + `02-plan.md` | Specification = locked scope; plan = batch table |

Never rewrite a legacy ledger into the new format — drive it under its own conventions.

## Degraded environments

- **No sub-agents available**: the orchestrator implements a wave's batches one at a
  time in the main checkout (worktrees unnecessary). The reviewer gate still runs per
  batch — a separate adversarial pass over each finished diff, with the same
  hunk-mapping duty, before integration. Checkpoint placement is unchanged.
- **No validation commands**: legal (contract says `none`); the checkpoint smoke tests
  carry all verification and every hand-over message must say so.
