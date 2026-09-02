# READ BEFORE ANY BATCH — orchestration & recovery

**Change**: {{CHANGE_ID}}
**You are** either the ORCHESTRATOR (the main session the user told to "continue") or an
IMPLEMENTER/REVIEWER sub-agent given one batch. Neither of you has the planning session's
context. This file is the contract. Everything needed to drive this change lives in this
ledger directory ({{LEDGER_DIR}}) — assume no other context survives between sessions.

## Boot sequence (orchestrator, every session)

1. Read [00-request.md](00-request.md) (the user's verbatim ask + decisions),
   [01-plan.md](01-plan.md) (locked scope, batch table, wave map + checkpoints), and
   [PROGRESS.md](PROGRESS.md), plus the project's always-loaded docs — especially
   {{GUARDRAILS_REF}}; every batch diff is checked against it.
2. Run `git status`, `git branch --list`, and `git worktree list`; note the current
   branch.
3. **Reconcile** (§Recovery below) before believing any PROGRESS row.
4. Then follow §Session algorithm.

Implementer sub-agents: read this file + your `02-batches-NN-*.md` batch file ONLY, and
work ONLY in the worktree your prompt names. The batch file carries the full spec text
and codebase facts — it is authoritative. Do NOT re-derive scope from the original
request or any external document.

## Git model (locked)

- Default branch: `{{MAIN_BRANCH}}`. Integration branch: `{{INTEGRATION_BRANCH}}` —
  every reviewed batch merges into it, and it is the ONLY branch that ever merges
  toward `{{MAIN_BRANCH}}`.
- One branch per batch, named in the batch file (branch prefixes in this repo:
  {{BRANCH_PREFIXES}}), cut from the integration tip when the batch's wave opens.
  Wave members run CONCURRENTLY: one implementer per batch, each in an isolated git
  worktree under the session scratchpad (never inside the repo). Per-worktree setup:
  {{WORKTREE_SETUP}}. Same-wave fences were planned disjoint — an integration merge
  conflict means a fence was violated: stop and reconcile, never hand-resolve
  silently.
- **Merge/push policy**: {{MERGE_POLICY}}
- **Execution model: {{EXECUTION_MODEL}}** — {{EXECUTION_MODEL_RATIONALE}}
- Wave open = ONE PROGRESS commit on `{{INTEGRATION_BRANCH}}` (member rows → `🔄`,
  branches named, wave base SHA in the session log) — the crash marker §Recovery keys
  on. PROGRESS is edited ONLY on the integration branch, by the orchestrator;
  implementers tick only their own batch file, on their own branch.
- The wave map and checkpoint placement in [01-plan.md](01-plan.md) are LOCKED: plan
  approval authorized the concurrency; deviations need the user's explicit words,
  recorded verbatim in PROGRESS. A wave opens only when every earlier wave is fully
  integrated and no reached checkpoint is unanswered.

## Validation commands

{{VALIDATION_COMMANDS}}

All must pass before a batch may integrate (`🟢`). If the block above says `none`, the
checkpoint smoke tests carry ALL verification — state that explicitly when handing over.

## Version + changelog rule (orchestrator-only)

- Version files (bump in lockstep): {{VERSION_FILES}}
- Bump cadence: {{VERSION_BUMP_RULE}} — applied on the integration branch at
  integration or checkpoint close-out, never inside a wave worktree.
- **Whatever the cadence, the version MUST differ from the base branch's by the time
  a checkpoint script is handed over.** A version shared with the base makes the
  script's step 0 unable to tell the two apart, and a whole smoke run can execute
  against the wrong tree and report the un-fixed defects as failures. If the cadence
  above would leave them equal at a checkpoint, bump anyway and note it in PROGRESS.
- Changelog: {{CHANGELOG_RULE}}

Implementer sub-agents NEVER touch version files, the changelog, or PROGRESS.md. If all
three lines say `none`, skip version/changelog work at close-out and say so.

## Repo conventions (binding)

{{REPO_CONVENTIONS}}

## Hard prohibitions

- No scope creep: modify ONLY the files in your batch file's fence. Anything else you
  notice goes in a PROGRESS Notes entry (orchestrator) or your final report (sub-agent) —
  never in the diff.
- No `--no-verify`, no force-push, no history rewriting.
- Never commit to `{{MAIN_BRANCH}}`, never push, never merge toward `{{MAIN_BRANCH}}` —
  except as the merge/push policy above allows or the user explicitly authorizes in the
  current session. (Merging reviewed batch branches into `{{INTEGRATION_BRANCH}}` is
  the orchestrator's normal job.)
- {{EXTRA_PROHIBITIONS}}

## Smoke checkpoints

The user smoke-tests at the CHECKPOINTS in the plan's wave map — never per batch.
Intermediate checkpoints exist only after waves carrying hands-on batches (marked in
the batch table); the final checkpoint is mandatory and covers everything since the
last one. At a checkpoint the orchestrator prints ONE combined script: every covered
batch's smoke steps, hands-on batches first. How the user smoke-tests in this project:
{{SMOKE_PROCEDURE}}. A reached checkpoint is never skipped and never resolved without
the user's verdict.

## §Recovery — reconcile ledger vs git (orchestrator, every session)

For each PROGRESS row not `✅`/`👤`:

```sh
git rev-parse --verify <branch>                                        # exists?
git merge-base --is-ancestor <branch> {{INTEGRATION_BRANCH}} && echo INTEGRATED
git merge-base --is-ancestor {{INTEGRATION_BRANCH}} {{MAIN_BRANCH}} && echo SHIPPED
git log {{INTEGRATION_BRANCH}}..<branch> --oneline                     # commits ahead
git worktree list && git status --porcelain                            # dirt (check each wave worktree)
git show <branch>:{{LEDGER_DIR}}/02-batches-NN-<slug>.md               # checklist state
```

| Ledger says | Git shows | Verdict |
|---|---|---|
| 🔄 | branch missing, or no commits past the wave base | Implementer never landed → re-spawn it (fresh worktree) |
| 🔄 | dirty worktree, or commits ahead + partial checklist | Resume the implementer at the first unticked item (recreate the worktree if gone) |
| 🔄 | commits ahead, checklist fully ticked, validations green | Crashed before review → run the reviewer gate now |
| 🟢 | branch NOT an ancestor of `{{INTEGRATION_BRANCH}}` | Crashed between review and merge → integrate now |
| 🟢 | branch ancestor of `{{INTEGRATION_BRANCH}}` | Correct state — waits for its covering checkpoint |
| 🧪 | `{{INTEGRATION_BRANCH}}` ancestor of `{{MAIN_BRANCH}}` | User merged silently → flip the checkpoint's covered rows ✅, propose branch deletes |
| 🧪 | integration branch not merged | Correct state → ask the user for the checkpoint verdict |
| ❌ | any | Fix-up pass is this session's FIRST job |

Prune worktrees of integrated batches (`git worktree remove`). Log every
reconciliation in the PROGRESS Session log.

## §Session algorithm ("continue")

1. Boot + reconcile (above).
2. If any batch is `❌ Smoke Failed`: on `{{INTEGRATION_BRANCH}}`, spawn ONE fix-up
   implementer with the user's failure notes VERBATIM + the indicted batch file(s) +
   the diff since the last passed checkpoint; fix → validate → commit → rows back to
   🧪 → STOP, reprinting the checkpoint's combined smoke script.
3. If any batch is `🧪`: a checkpoint is open — ask the user for its verdict (passed /
   failed / waive). Never open the next wave past an unanswered checkpoint.
4. Open the next wave: the earliest wave that still has `⬜` batches whose deps are
   all `🟢`/`✅`. From the integration tip: cut every member's branch, create every
   worktree (setup: {{WORKTREE_SETUP}}), then commit the wave-open PROGRESS flip
   (rows → 🔄, wave base SHA in the session log).
5. Spawn ALL of the wave's implementers CONCURRENTLY (one per batch, in a single
   message, each pinned to its worktree). Every prompt must be SELF-CONTAINED: the
   spec text + codebase facts from the batch file, the exact file fence, acceptance
   criteria, the validation commands, the conventions + prohibitions blocks above,
   and "tick your checklist items in the batch file as you complete them; commit on
   your batch branch".
6. Reviewer gate PER BATCH, as each implementer reports (don't wait for the wave's
   slowest): spawn ONE independent read-only reviewer with the batch file + the batch
   diff (`git diff {{INTEGRATION_BRANCH}}...HEAD` in the batch's worktree — three-dot
   isolates the batch's own changes). It must (a) map every hunk to a batch item —
   unmapped hunks are scope creep → reject; (b) check each acceptance criterion
   against the diff; (c) run the validation commands; (d) check the diff against
   {{GUARDRAILS_REF}}. Defects → implementer pass. Max 2 review rounds, then set `⛔`
   (batch stays OUT of integration, dependents stay blocked) and surface it at the
   next STOP.
7. Integrate serially: merge each SHIP batch into `{{INTEGRATION_BRANCH}}`, apply the
   version/changelog cadence, flip the row `🟢`, remove the worktree.
8. Wave closed. If the wave map places a checkpoint here: per-checkpoint close-out
   (version/changelog per cadence, covered rows `🟢` → `🧪`, checkpoint-table row,
   session-log row with the checkpoint's integration SHA, commit) → STOP, printing
   the checkpoint's COMBINED smoke script. Otherwise: go to step 4 and open the next
   wave in this SAME session. Default cadence: run until the next checkpoint — stop
   early only at `⛔` or an unplanned user gate.

**Unplanned user gate**: if a batch surfaces a design/UX decision the plan didn't
settle, do not guess and do not stall silently — implement what is decidable, record
the EXACT question in the row's Notes (status `👤` if the batch cannot close without
it), and put the question in the STOP hand-off so the next session starts with the
answer. Known design gates belong at the FRONT of the plan (resolved at planning
time), never mid-sequence.

## Change-complete close-out (after the FINAL checkpoint passes)

- Final coverage audit in PROGRESS: every request item maps to a merged commit, an
  intended-behavior resolution, or a named entry in {{BACKLOG_FILE}} — zero unaccounted.
- Distill: any NEW bug class this change uncovered → a one-line guardrail bullet in
  {{GUARDRAILS_REF}} (create the section if missing); residuals and deferrals → named
  entries in {{BACKLOG_FILE}} (create the file if missing).
- Release step (only on explicit user authorization): {{RELEASE_COMMAND}}
- Mark the change COMPLETE in the Session log; propose deleting the merged branches.
