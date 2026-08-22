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
| `00-READBEFORE.md` | The contract: boot sequence, git model, validations, recovery, session algorithm |
| `01-plan.md` | Locked scope: batch table, ordering rationale, per-batch specs, coverage audit |
| `02-batches-NN-<slug>.md` | One per batch: fence, verbatim spec, checklist, acceptance criteria, smoke script |
| `PROGRESS.md` | The live ledger: status table, verdict log, coverage audit, session log |

A scaffolded ledger is a **closed system**: every repo-specific fact (validation
commands, version files, merge policy, smoke procedure) is baked into its READBEFORE at
scaffold time. A session without this skill can drive the change by reading the ledger
alone — that property is the point; never generate a ledger that references this skill.

## Roles

- **Orchestrator** — the main session. Owns PROGRESS, branches, close-outs, and all user
  communication. The ONLY role that edits version files, the changelog, or PROGRESS.
- **Implementer** — a sub-agent given one batch. Codes inside the file fence, ticks the
  batch checklist, commits on the batch branch. Spawned with a fully self-contained
  prompt (`subagent-prompts.md`).
- **Reviewer** — ONE independent read-only sub-agent per batch. Maps every diff hunk to
  a batch item (unmapped = scope creep = reject), verifies acceptance criteria, runs
  validations, checks project guardrails. Verdict vocabulary: `SHIP` / `FIX FIRST` /
  `NEEDS A CLOSER LOOK`. Max 2 rounds, then the batch is ⛔.

Neither sub-agent role has the planning session's context — every prompt is built from
the ledger files and complete in itself.

## Status legend

| Status | Meaning |
|---|---|
| ⬜ Not Started | No branch, no commits |
| 🔄 In Progress | Branch cut, first commit made (the crash marker), work ongoing |
| 🧪 Ready for Smoke Test | Commits on branch, validations green, awaiting the USER's hands-on verdict |
| ❌ Smoke Failed | User reported failure — the fix-up pass is the next session's FIRST job |
| ✅ Merged | In the default branch (verify with git, not the table) |
| ⛔ Blocked | Reviewer rejected twice, or an external blocker — needs user direction |
| 👤 User Action | Waiting on something only the user can do (credentials, hardware, approvals) |

Statuses are claims; **git is truth**. Reconcile before believing any row.

## Git model (generic defaults)

- One branch per batch. Never commit to the default branch; never push; never merge —
  the default policy is the USER smoke-tests and merges. A scaffold-time interview may
  set a different policy (PR flow, orchestrator ff-merge on a recorded verdict); the
  ledger's contract states whichever policy governs.
- First commit on a batch branch flips the PROGRESS row to 🔄. That ordering makes the
  commit the crash marker recovery keys on — flip-then-commit would lie after a crash.
- Batches are strictly sequential unless the ledger's execution model says otherwise
  (`execution-models.md`). Gate waivers come from the user's explicit words, recorded
  verbatim in PROGRESS.
- Never `--no-verify`, never force-push, never rewrite history.

## §Recovery — the reconcile table

For each PROGRESS row not `✅`/`👤`, gather: branch exists? (`git rev-parse --verify`),
merged? (`git merge-base --is-ancestor <branch> <default>`), commits ahead
(`git log <default>..<branch> --oneline`), dirty tree (`git status --porcelain`), and
the checklist state inside the batch file on that branch (`git show <branch>:<path>`).

| Ledger says | Git shows | Verdict |
|---|---|---|
| 🔄 | branch missing, no commits | Session died pre-branch → treat as ⬜, restart |
| 🔄 | branch exists, dirty tree on it | Resume: diff vs checklist, continue implementing |
| 🔄 | commits ahead, checklist fully ticked, validations green, version+changelog done | Crash between final commit and ledger flip → set 🧪, tell the user to smoke test |
| 🔄 | commits ahead, checklist partial | Resume on the branch at the first unticked item |
| 🧪 | branch tip is ancestor of the default branch | User merged silently → set ✅, propose branch delete |
| 🧪 | branch exists, not merged | Correct state → ask the user for the smoke verdict |
| ❌ | any | Fix-up pass is this session's FIRST job |

Log every reconciliation in the PROGRESS Session log.

## §Session algorithm ("continue")

1. Boot + reconcile.
2. Any `❌`? Check out its branch; spawn ONE implementer with the user's failure notes
   verbatim + the batch file + the batch diff; fix → validate → commit → 🧪 → STOP,
   reprinting the smoke steps.
3. Any `🧪`? Ask the user for a verdict (passed / failed / waive). Never silently skip
   past an unanswered smoke gate.
4. Pick the first `⬜` whose declared deps are `✅`. Cut its branch per the execution
   model; first commit flips the row to 🔄.
5. Spawn implementer sub-agent(s) per the batch file's split. Prompts are SELF-CONTAINED
   (spec text, fence, acceptance criteria, validation commands, conventions,
   prohibitions, checklist-ticking instruction).
6. Reviewer gate: ONE independent read-only reviewer per batch — hunk→item mapping,
   acceptance criteria vs the diff, validations, guardrails. Defects → implementer pass.
   Max 2 rounds → ⛔ with findings recorded.
7. Close-out (orchestrator only): version + changelog per the contract, final commit,
   PROGRESS → 🧪, session-log row.
8. STOP: print the smoke script verbatim. One batch per session unless the user asks
   for more.

**User gates are front-loaded**: design/UX approvals the plan can foresee are resolved
at planning time (mockup shown, pick recorded, approved design baked into the batch
file) or scheduled as the earliest batches — never mid-sequence where they stall the
autonomous run. An UNPLANNED gate surfacing mid-batch: implement what is decidable,
record the exact question in the row's Notes (`👤` if the batch cannot close without
it), and ask it in the STOP hand-off.

## Two distinct close-outs

**Per-batch** (step 7): version bump + changelog (if the repo versions), final commit,
🧪 flip, session-log row, STOP with the smoke script.

**Change-complete** (after the last ✅):
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

Ledgers created before this skill vary in shape. Recognition rules:

| Variant | How to recognize | How to drive |
|---|---|---|
| Contract under another name | `02-batches-00-READBEFORE.md` or `03-tasks-00-READBEFORE.md` | Same contract — follow it as-is |
| Contract absent | Only `01-plan.md` + `PROGRESS.md` (± request file) | Protocol lives in the plan's orchestration section + the PROGRESS preamble; this file fills gaps; ASK before acting on anything ambiguous |
| Task model (oldest) | `03-tasks-NN-*` files; statuses `✅ Completed` / `🔴 Incomplete` | Map ✅→✅ and 🔴→ask (❌ or ⛔?); tasks may share a single feature branch — check git |
| Spec/plan split | `01-specification.md` + `02-plan.md` | Specification = locked scope; plan = batch table |

Never rewrite a legacy ledger into the new format — drive it under its own conventions.

## Degraded environments

- **No sub-agents available**: the orchestrator implements directly. The reviewer gate
  still runs — as a separate adversarial pass over the finished diff, with the same
  hunk-mapping duty, before close-out.
- **No validation commands**: legal (contract says `none`); the smoke gate carries all
  verification and every hand-over message must say so.
