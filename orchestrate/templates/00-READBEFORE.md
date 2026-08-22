# READ BEFORE ANY BATCH — orchestration & recovery

**Change**: {{CHANGE_ID}}
**You are** either the ORCHESTRATOR (the main session the user told to "continue") or an
IMPLEMENTER/REVIEWER sub-agent given one batch. Neither of you has the planning session's
context. This file is the contract. Everything needed to drive this change lives in this
ledger directory ({{LEDGER_DIR}}) — assume no other context survives between sessions.

## Boot sequence (orchestrator, every session)

1. Read [00-request.md](00-request.md) (the user's verbatim ask + decisions),
   [01-plan.md](01-plan.md) (locked scope, batch table, ordering rationale),
   [PROGRESS.md](PROGRESS.md), and the project's always-loaded docs — especially
   {{GUARDRAILS_REF}}; every batch diff is checked against it.
2. Run `git status` and `git branch --list`; note the current branch.
3. **Reconcile** (§Recovery below) before believing any PROGRESS row.
4. Then follow §Session algorithm.

Implementer sub-agents: read this file + your `02-batches-NN-*.md` batch file ONLY. The
batch file carries the full spec text and codebase facts — it is authoritative. Do NOT
re-derive scope from the original request or any external document.

## Git model (locked)

- Default branch: `{{MAIN_BRANCH}}`. One branch per batch, named in the batch file
  (branch prefixes in this repo: {{BRANCH_PREFIXES}}).
- **Merge/push policy**: {{MERGE_POLICY}}
- First commit on a batch branch = the PROGRESS row flip to `🔄` (this is the crash
  marker §Recovery keys on). Ledger updates are committed ON the batch branch.
- **Execution model: {{EXECUTION_MODEL}}** — {{EXECUTION_MODEL_RATIONALE}}
- Unless the execution model above says otherwise, batches are strictly sequential: a
  batch may start only when every earlier batch is `✅`. The user may explicitly waive
  the gate — record the waiver verbatim in PROGRESS before acting on it.

## Validation commands

{{VALIDATION_COMMANDS}}

All must pass before a batch can be marked `🧪`. If the block above says `none`, the
user's smoke test carries ALL verification — state that explicitly when handing over.

## Version + changelog rule (orchestrator-only, at close-out)

- Version files (bump in lockstep): {{VERSION_FILES}}
- Bump cadence: {{VERSION_BUMP_RULE}}
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
- Never commit to `{{MAIN_BRANCH}}`, never push, never merge — except as the merge/push
  policy above allows or the user explicitly authorizes in the current session.
- {{EXTRA_PROHIBITIONS}}

## §Recovery — reconcile ledger vs git (orchestrator, every session)

For each PROGRESS row not `✅`/`👤`:

```sh
git rev-parse --verify <branch>                                       # exists?
git merge-base --is-ancestor <branch> {{MAIN_BRANCH}} && echo MERGED  # already merged?
git log {{MAIN_BRANCH}}..<branch> --oneline                           # commits ahead
git status --porcelain                                                # uncommitted work
git show <branch>:{{LEDGER_DIR}}/02-batches-NN-<slug>.md              # checklist state
```

| Ledger says | Git shows | Verdict |
|---|---|---|
| 🔄 | branch missing, no commits | Session died pre-branch → treat as ⬜, restart |
| 🔄 | branch exists, dirty tree on it | Resume: diff vs checklist, continue implementing |
| 🔄 | commits ahead, checklist fully ticked, validations green, version+changelog done | Crash between final commit and ledger flip → set 🧪, tell the user to smoke test |
| 🔄 | commits ahead, checklist partial | Resume on the branch at the first unticked item |
| 🧪 | branch tip is ancestor of `{{MAIN_BRANCH}}` | User merged silently → set ✅, propose branch delete |
| 🧪 | branch exists, not merged | Correct state → ask the user for the smoke verdict |
| ❌ | any | Fix-up pass is this session's FIRST job |

Log every reconciliation in the PROGRESS Session log.

## §Session algorithm ("continue")

1. Boot + reconcile (above).
2. If any batch is `❌ Smoke Failed`: check out its branch; spawn ONE implementer with
   the user's failure notes VERBATIM + the batch file + `git diff {{MAIN_BRANCH}}...HEAD`;
   fix → validate → commit → set 🧪 → STOP, reprinting the smoke steps.
3. If any batch is `🧪`: ask the user for a verdict (passed / failed / waive). Never
   silently skip past an unanswered smoke gate.
4. Pick the first `⬜` batch whose deps (batch file header) are all `✅`. Cut its branch
   per the execution model; first commit = PROGRESS row → 🔄.
5. Spawn implementer sub-agent(s) per the batch file's split (single vs parallel;
   parallel implementers work in isolated worktrees under the session scratchpad —
   per-worktree setup: {{WORKTREE_SETUP}}). Every prompt must be SELF-CONTAINED: the
   spec text + codebase facts from the batch file, the exact file fence, acceptance
   criteria, the validation commands, the conventions + prohibitions blocks above, and
   "tick your checklist items in the batch file as you complete them; commit on the
   current branch with a conventional message".
6. Reviewer gate: spawn ONE independent read-only reviewer with the batch file + the
   batch diff (`git diff {{MAIN_BRANCH}}...HEAD`, or the diff against the previous
   batch's tip under a linear stack). It must (a) map every hunk to a batch item —
   unmapped hunks are scope creep → reject; (b) check each acceptance criterion against
   the diff; (c) run the validation commands; (d) check the diff against
   {{GUARDRAILS_REF}}. Defects → back to an implementer pass. Max 2 review rounds, then
   set `⛔` with the reviewer's findings in Notes and stop.
7. Close-out (orchestrator only): version bump + changelog entry per the rules above +
   final commit; flip PROGRESS to 🧪 + commit; append a Session log row.
8. STOP: print the batch's smoke-test script verbatim for the user. How the user smoke
   tests in this project: {{SMOKE_PROCEDURE}}. One batch per session unless the user
   explicitly asks for more.

**Unplanned user gate**: if a batch surfaces a design/UX decision the plan didn't
settle, do not guess and do not stall silently — implement what is decidable, record
the EXACT question in the row's Notes (status `👤` if the batch cannot close without
it), and put the question in the STOP hand-off so the next session starts with the
answer. Known design gates belong at the FRONT of the plan (resolved at planning
time), never mid-sequence.

## Change-complete close-out (after the LAST batch is ✅)

- Final coverage audit in PROGRESS: every request item maps to a merged commit, an
  intended-behavior resolution, or a named entry in {{BACKLOG_FILE}} — zero unaccounted.
- Distill: any NEW bug class this change uncovered → a one-line guardrail bullet in
  {{GUARDRAILS_REF}} (create the section if missing); residuals and deferrals → named
  entries in {{BACKLOG_FILE}} (create the file if missing).
- Release step (only on explicit user authorization): {{RELEASE_COMMAND}}
- Mark the change COMPLETE in the Session log; propose deleting the merged branches.
