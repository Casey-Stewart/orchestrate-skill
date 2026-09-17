# READ BEFORE ANY BATCH — orchestration & recovery

**Change**: {{CHANGE_ID}}
**You are** either the ORCHESTRATOR (the main session the user told to "continue") or an
IMPLEMENTER/REVIEWER/GATE sub-agent given one batch. Neither of you has the planning
session's context. This file is the contract. Everything needed to drive this change lives
in this ledger directory ({{LEDGER_DIR}}) — assume no other context survives between
sessions.

## Boot sequence (orchestrator, every session)

1. Read [00-request.md](00-request.md) (the user's verbatim ask + decisions),
   [01-plan.md](01-plan.md) (locked scope, batch table, wave map + checkpoints), and
   [PROGRESS.md](PROGRESS.md), plus the project's always-loaded docs — especially
   {{GUARDRAILS_REF}}; every batch diff is checked against it. [LOG.md](LOG.md) is the
   narrative record: read it ON DEMAND by anchor (a Notes cell points at it), never at boot.
2. Run `git status --porcelain`, `git branch --list`, `git worktree list`; note the current
   branch. **Never switch the main checkout.** Read ledger files from any branch with
   `git show <branch>:./<path>` (the `./` is required — Git Bash on Windows mangles
   `branch:path` otherwise) and write to the ledger through an integration worktree
   (`git worktree add <scratchpad>/wt-int {{INTEGRATION_BRANCH}}`), using the main checkout
   only if it already has `{{INTEGRATION_BRANCH}}` checked out. Run `git show` from the
   repo or worktree ROOT (the `./` path is cwd-relative). Reuse an integration worktree
   that `git worktree list` already shows; if its directory is gone, `git worktree prune`
   first — never two worktrees on one branch.
3. **Reconcile** (§Recovery below) before believing any PROGRESS row.
4. **Resume-time validation**: run the validation commands (quiet form) on the integration
   tip. Red → the first job is a repair mini-batch (§Session algorithm step 2), whatever
   PROGRESS says. Green → follow §Session algorithm.

Implementer sub-agents: read this file + your `02-batches-NN-*.md` batch file ONLY, and
work ONLY in the worktree your prompt names. The batch file carries the full spec text
and codebase facts — it is authoritative. Do NOT re-derive scope from the original
request or any external document.

## Roles, gates, tiers

- **Orchestrator** — owns PROGRESS, LOG, `evidence/`, branches, worktrees, merges,
  close-outs, all user communication. The ONLY role that edits version files, the
  changelog, PROGRESS or LOG.
- **Implementer** — one per batch, in its own worktree on its own branch. Reports in the
  fixed shape: first line `DONE | DONE_WITH_CONCERNS | NEEDS_FENCE | BLOCKED`, then an
  evidence block (each validation command, exit code, last ~10 lines; commit SHAs;
  checklist n/m), then ≤40 lines of prose. `NEEDS_FENCE` and `BLOCKED` use the mismatch
  form: Expected / Found / Why it matters / How to proceed.
- **Reviewer** — ONE fresh read-only sub-agent per batch per round, never the implementer,
  never reused. Verdict on line 1: `SHIP` (no P0/P1; may carry ASKs) · `FIX FIRST` (a P0
  or P1 with a concrete failure scenario) · `NEEDS A CLOSER LOOK` (names what would confirm
  it). Report capped like the implementer's. Finding classes: **P0** — wrong behavior, a
  violated criterion or guardrail, concrete scenario (blocking); **P1** — should fix,
  needs a production change, concrete scenario (blocking); **ASK** — in-fence, about the
  batch's OWN artifacts (its new tests' strength, smoke-step prose, comments, a doc sweep
  it owns), no production behavior change (non-blocking; closes as a polish pass).
- **Gate agents** (read-only, run by the ORCHESTRATOR at the reviewer gate, in parallel
  with the reviewer): {{GATE_AGENTS}}. Implementers NEVER spawn a gate agent themselves —
  a self-spawned one stalls the implementer uncommitted.
- **QA runner** — one sub-agent that executes the agent-runnable smoke steps at a
  checkpoint close-out and writes evidence. Runners available in this repo:
  {{AGENT_RUNNERS}}.
- **Tiers**: {{ROLE_TIERS}}. The reviewer never runs on a less capable model than the
  implementer; L-weight reviews and the fresh implementer of an authorized third round
  use the most capable model the session can spawn (the "strong tier"); if tiers are
  unavailable, use the default and keep the gate
  shape. Record the tier used in the row's Notes.

Every sub-agent report entering the orchestrator's context is capped (~40 lines + a
findings list); the fence check and tip validation return one line each on success.

**Metrics** (the pilot's measurement, readable from the ledger alone). Every batch row's
Notes end with `m: rounds=<FIX FIRST rounds> asks=<ASK items closed by a polish pass>
fence-bounces=<times the fence check sent the implementer back> gate=<gate-agent
findings>/<of which needed a production change> tip-red=<1 if tip validation went red
after this merge>`. Every checkpoint row's Verdict cell ends with `m: pre-smoke=<agent
steps passed>/<human steps> human-smoke-min=<minutes the user reports> escaped=<defects
the user found that no gate caught>`, completed at `close`.

## Git model (locked)

- Default branch: `{{MAIN_BRANCH}}`. Integration branch: `{{INTEGRATION_BRANCH}}` —
  every reviewed batch merges into it, and it is the ONLY branch that ever merges
  toward `{{MAIN_BRANCH}}`.
- One branch per batch, named in the batch file (branch prefixes in this repo:
  {{BRANCH_PREFIXES}}), cut from the integration tip when the batch's wave opens.
  Wave members run CONCURRENTLY: one implementer per batch, each in an isolated git
  worktree under the session scratchpad (never inside the repo). Per-worktree setup:
  {{WORKTREE_SETUP}}. Same-wave fences were planned disjoint.
- **Merge/push policy**: {{MERGE_POLICY}}
- **Execution model: {{EXECUTION_MODEL}}** — {{EXECUTION_MODEL_RATIONALE}}
- Wave open = ONE PROGRESS commit on `{{INTEGRATION_BRANCH}}` (member rows → `🔄`,
  branches named, wave base SHA in the session log, `**State**` line updated) — the crash
  marker §Recovery keys on. PROGRESS, LOG and `evidence/` are edited ONLY on the
  integration branch, by the orchestrator, through the integration worktree (the QA runner
  writes `evidence/` files there; the orchestrator commits them); implementers
  touch only their own batch file, on their own branch, and only its checklist ticks,
  appended `- [ ] polish:` lines, and its Files line under a recorded fence extension.
- **Integration procedure, per batch**: `git merge-tree --write-tree {{INTEGRATION_BRANCH}}
  <batch>` as a dry run — a conflict is STOP AND INVESTIGATE (fence violation, unrecorded
  fence extension, or a ledger file edited on both sides; git reports the conflict, not
  the cause), never hand-resolved silently → merge → run the validation commands on the
  integration tip → green: flip `🟢`; red: the tip stays non-green, no further merges,
  repair via a mini-batch (below).
- **Repairs are mini-batches.** Every repair — a red tip after a merge, a failed
  pre-smoke step, a user-reported checkpoint failure — runs on its own branch cut from
  the integration tip — `fix/<batch>-c<n>-followup` (checkpoint failure),
  `fix/<batch>-tip` (red tip), `fix/<batch>-presmoke-<step>` — through the fence check, a fresh reviewer, the dry run,
  the merge and tip validation like any batch. Never a direct commit on
  `{{INTEGRATION_BRANCH}}`.
- The wave map and checkpoint placement in [01-plan.md](01-plan.md) are LOCKED: plan
  approval authorized the concurrency; deviations need the user's explicit words,
  recorded verbatim in PROGRESS. A wave opens only when every earlier wave is fully
  integrated, the tip is green, and no reached checkpoint is unanswered.

### §Fence changes (mid-wave)

An implementer that needs a path outside its fence does NOT touch it: it finishes every
item it can, commits, and reports `NEEDS_FENCE: <paths> — <item> — <why>`. The
orchestrator's test is mechanical: the path must be absent from the fence of EVERY
same-wave sibling regardless of status (a sibling already `🟢` is the dangerous case — the
extension would edit from the wave-base version and no reviewer sees the interaction)
and from every extension recorded this wave; ledger, version and changelog files never
qualify. Pass → record "fence +<path> (B<NN>, <item>, <reason>, <date>)" in the row's
Notes and the session log on the integration branch, then resume the implementer, whose
only batch-file edit is the Files line on its own branch. Fail → the batch waits for the
next wave (dependency recorded) or, if two batches need the same region, the question
goes in the STOP hand-off. The fence check's allowed set is the plan's fence ∪ recorded
extensions ∪ the batch's own file — never the implementer's Files line alone.

## Validation commands

{{VALIDATION_COMMANDS}}

All must pass before a batch may integrate (`🟢`). Orchestrator runs use the QUIET form
above (a totals line plus failing test NAMES, so failing sets compare by name against any
allowlist); full output is read only on a non-zero exit. If the block above says `none`,
the checkpoint smoke tests carry ALL verification — state that explicitly when handing
over. Mutation runner (optional, scoped to a batch's changed files): {{MUTATION_RUNNER}}.

## Version + changelog rule (orchestrator-only)

- Version files (bump in lockstep): {{VERSION_FILES}}
- Bump cadence: {{VERSION_BUMP_RULE}} — applied on the integration branch at
  integration or checkpoint close-out, never inside a wave worktree.
- **Whatever the cadence, the version MUST differ from the base branch's by the time
  a checkpoint script is handed over.** A version shared with the base makes the
  script's step 0 unable to tell the two apart, and a whole smoke run can execute
  against the wrong tree and report the un-fixed defects as failures. If the cadence
  above would leave them equal at a checkpoint, bump anyway and note it in PROGRESS. A
  checkpoint marker costs the PATCH component; the release takes ONE minor.
- Changelog: {{CHANGELOG_RULE}}

Implementer sub-agents NEVER touch version files, the changelog, PROGRESS or LOG. If all
three lines say `none`, skip version/changelog work at close-out and say so.

## Repo conventions (binding)

{{REPO_CONVENTIONS}}

## Hard prohibitions

- No scope creep: modify ONLY the files in your batch file's fence. Anything else you
  notice goes in a PROGRESS Notes entry (orchestrator) or your final report (sub-agent) —
  never in the diff. Need a file outside the fence? Report `NEEDS_FENCE` (§Fence changes).
- Implementers never edit their batch file beyond checklist ticks, appended
  `- [ ] polish:` lines, and the Files line under a recorded extension; never spawn gate
  agents; never leave untracked files in the worktree (reconcile reads that as dirt —
  scratch goes under the session scratchpad).
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
last one. At a checkpoint the orchestrator assembles ONE combined script — every
covered batch's smoke steps, data-touching sections first, then the rest of the
hands-on work, steps numbered continuously. How the user smoke-tests in this project:
{{SMOKE_PROCEDURE}}. A reached checkpoint is never skipped and never resolved without
the user's verdict.

**Runners.** Every smoke step is tagged at planning time `Runner: agent` (executable in
THIS repo's environment by the runners listed under Roles) or `Runner: human` (hardware,
credentials, feel, another OS, or anything not listed). A step flagged "Touches your data"
is human unless the runner line names a disposable fixture environment. Default is
human. Before the page is issued, the QA runner executes every agent step on the
integration tip and writes `evidence/C<n>/<step>.md` (command, exit code, output tail or
screenshot path, the integration SHA and the environment). The page renders those steps
as **pre-verified** with their evidence, collapsed but re-runnable; human steps are
unchanged. A failing agent step is a defect found before the user's time is spent: rows
stay `🟢`, the failure goes to Notes + evidence, a repair mini-batch fixes it, then the
close-out resumes — it is NEVER `❌`, which means the USER reached the checkpoint and
failed it. A pre-verified label is invalidated for any step whose covered files a later
repair touched; the QA runner re-runs it before the page is re-issued.

**Delivery.** When the driving session can publish artifacts, the script ships as an
interactive smoke page: reuse the format of the newest `smoke-*.html` in this ledger
(or the session's own smoke-page template), commit the filled page as
`smoke-<Cn>.html`, publish it (first publish: `capabilities: {db: {}}`, favicon 🧪,
URL recorded in the PROGRESS preamble; later checkpoints and re-issues republish that
URL), and hand over the link PLUS the gate essentials in text. Otherwise print the
full script as plain text. Either way the batch files' smoke steps are canonical, and
every script OPENS with a non-verdict gate: the command that prints the current
branch, the version the user must see, and a canary whose result is OPPOSITE on the
base build — run first, "if it behaves the old way, stop and say so".

**Verdicts are four**: **pass** · **fail** (did something else — triage to the
offending batch(es) → ❌) · **blocked** (the step could not be performed as written —
correct the STEP and re-ask, or reclassify as fail if the app lacks the behavior) ·
**works-but** (works exactly as specified, the user wants it different → named
{{BACKLOG_FILE}} entry — never a failure, never blocks the pass). The user's message
carries the verdict — the page's "Copy results as text" paste is the preferred form,
recorded verbatim. On re-issues never renumber existing steps (verdicts key on step
numbers); annotate corrected steps instead.

## §Recovery — reconcile ledger vs git (orchestrator, every session)

For each PROGRESS row not `✅`/`👤`:

```sh
git rev-parse --verify <branch>                                        # exists?
git merge-base --is-ancestor <branch> {{INTEGRATION_BRANCH}} && echo INTEGRATED
git merge-base --is-ancestor {{INTEGRATION_BRANCH}} {{MAIN_BRANCH}} && echo SHIPPED
git log {{INTEGRATION_BRANCH}}..<branch> --oneline                     # commits ahead
git worktree list && git status --porcelain                            # dirt (check each wave worktree)
git show <branch>:./{{LEDGER_DIR}}/02-batches-NN-<slug>.md             # checklist state (keep the ./; run from the root)
```

| Ledger says | Git shows | Verdict |
|---|---|---|
| 🔄 | branch missing, or no commits past the wave base | Implementer never landed → re-spawn it (fresh worktree) |
| 🔄 | dirty worktree, or commits ahead + partial checklist (incl. unticked `polish:` items) | Resume the implementer at the first unticked item (recreate the worktree if gone) |
| 🔄 | commits ahead, checklist fully ticked, validations green | Crashed before the gate → fence check, then the reviewer gate now |
| 🔄 | branch already an ancestor of `{{INTEGRATION_BRANCH}}` | Crashed between merge and flip → tip validation, then 🟢 (red → repair mini-batch) |
| 🟢 | branch NOT an ancestor of `{{INTEGRATION_BRANCH}}` | Crashed between review and merge → integrate now (dry run → merge → tip validation) |
| 🟢 | branch ancestor of `{{INTEGRATION_BRANCH}}` | Correct state — waits for its covering checkpoint |
| 🟢 (all members of a checkpoint-carrying wave) | checkpoint row not 🧪/✅ | Close-out unfinished → finish it (tip validation → pre-smoke → page → 🧪); never open the next wave |
| 🧪 | `{{INTEGRATION_BRANCH}}` ancestor of `{{MAIN_BRANCH}}` | User merged silently → flip the checkpoint's covered rows ✅, propose branch deletes |
| 🧪 | integration branch not merged | Correct state → ask the user for the checkpoint verdict |
| ❌ | no `fix/<batch>-c<n>-followup` branch | Fix-up never started → spawn it |
| ❌ | fix-up branch ahead, not integrated | Resume / gate it per the 🔄 rows |
| ❌ | fix-up integrated, tip green | Covered rows → 🧪, re-issue the page with affected steps annotated |
| ❌ | fix-up integrated, tip red | Repair mini-batch on the tip first |

Prune worktrees of integrated batches (`git worktree remove`). Log every
reconciliation in the PROGRESS Session log (one line) and LOG.md (detail).

## §Session algorithm ("continue")

1. Boot + reconcile + resume-time validation (above).
2. Repairs first, as mini-batches (Git model). **Checkpoint failure** (`❌`): spawn ONE
   fix-up implementer on `fix/<batch>-c<n>-followup` cut from the integration tip, with
   the user's failure notes VERBATIM + the indicted batch file(s) + the diff since the
   last passed checkpoint; fence check → fresh reviewer (spec = the failure report + the
   batch's acceptance criteria) → dry run → merge → tip validation → rows back to 🧪 →
   STOP, re-issuing the checkpoint's script per §Smoke checkpoints (republish the page
   with the affected steps annotated — earlier verdicts survive; or reprint the text). A
   fix-up failing review twice is `❌ (fix-up capped)`, left unmerged, and the STOP names
   the three verdicts in step 6. **Red tip with no checkpoint reached** (resume-time
   validation, or after a merge): the same mini-batch on `fix/<batch>-tip` with the
   failing output as the spec (`<batch>` = the last batch merged before the red); once it
   integrates and the tip is green, return to step 7 (remaining merges) or step 4 — no 🧪,
   no STOP. A `-tip` or `-presmoke` repair failing review twice NEVER writes `❌`: rows
   keep their status, the tip stays red (no further merges) or the step stays un-issued,
   the failure goes to Notes + LOG, and the session STOPs with the three verdicts of
   step 6.
3. If any batch is `🧪`: a checkpoint is open — ask the user for its verdict (passed /
   failed / waive). Never open the next wave past an unanswered checkpoint.
4. Open the next wave: the earliest wave that still has `⬜` batches whose deps are
   all `🟢`/`✅`. From the integration tip: cut every member's branch, create every
   worktree (setup: {{WORKTREE_SETUP}}), then commit the wave-open PROGRESS flip
   (rows → 🔄, wave base SHA in the session log, `**State**: ACTIVE`).
5. Spawn ALL of the wave's implementers CONCURRENTLY (one per batch, in a single
   message, each pinned to its worktree, on the tier the batch's weight calls for).
   Every prompt must be SELF-CONTAINED: the spec text + codebase facts from the batch
   file, the exact file fence, acceptance criteria, the applicable guardrails, the
   validation commands (quiet form), the conventions + prohibitions blocks above, the
   report shape, and "tick your checklist items in the batch file as you complete them;
   run `git diff --name-status -M` against the integration branch before committing and
   revert anything outside your fence; commit on your batch branch (one commit per
   fold-in item)".
6. Gate PER BATCH, as each implementer reports (don't wait for the wave's slowest). A
   report without the status line + evidence block → resume the implementer for it (not
   a round).
   - **6a Fence check (mechanical, orchestrator).** Worktree clean (`git status
     --porcelain` empty); `git diff --name-status -M {{INTEGRATION_BRANCH}}...HEAD`; every
     path (both endpoints of a rename) in the plan's fence ∪ recorded extensions ∪ the
     batch's own file — and within the batch file only ticks, `polish:` appends and a
     recorded Files change. Anything else → no reviewer; `NEEDS_FENCE` → §Fence changes,
     otherwise resume the implementer to revert. Not a round.
   - **6b Failing-on-base (mechanical, `fix` batches).** In a temporary worktree at the
     wave base, copy over the batch's TEST-ONLY files and run its changed tests: an
     assertion failure on the named behavior proves the regression test; every test
     PASSING on the base is a P0 (the fix is unproven); a run that cannot execute is
     inconclusive → reviewer duty (e).
   - **6c Reviewer + gate agents, in parallel, all fresh and read-only.** The reviewer
     gets the batch file + the diff (`git diff {{INTEGRATION_BRANCH}}...HEAD` in the batch's
     worktree — three-dot isolates the batch's own changes) and must (a) map every hunk
     to a batch item — unmapped hunks are scope creep → reject (the batch file's ticks are
     exempt); (b) check each acceptance criterion against the diff; (c) run the
     validation commands; (d) check the diff against {{GUARDRAILS_REF}} and the batch
     file's applicable guardrails; (e) confirm the failing-on-base result from 6b — an
     INCONCLUSIVE run means the reviewer establishes from the test text which changed
     cell fails on the un-fixed code, or says none does — and, when no gate agent runs,
     name the mutation each new or re-pointed test would survive; (f) confirm every doc/comment sweep the batch file names
     happened in the same commit. Gate agents run over the batch's new/changed tests
     (skipped when none changed); a gate finding that needs a production change is a P1,
     a test-only finding is an ASK. S-weight batches: one combined reviewer+gate pass.
   - **Verdicts.** `SHIP` with ASKs → polish pass: resume the implementer with the ASK
     list; it appends `- [ ] polish: <ask>` items to its checklist, does them, commits;
     closes mechanically (6a + validations on the polished tip; polish commits touch only
     test/doc/prose paths — a production file touched → a fix-diff-only re-review by a
     fresh reviewer). Not a round. `FIX FIRST` → resume the SAME implementer with the
     findings verbatim, then a fresh re-review that verifies the fixes and scans only the
     fix diff. `NEEDS A CLOSER LOOK` → run the confirming check the
     reviewer named (or have the implementer add the probe) → `FIX FIRST` or `SHIP`; not a
     round. Only `FIX FIRST` rounds count; the SECOND `FIX FIRST` sets `⛔ defective` (not
     green) or `⛔ green, residual finding open (<severity>)`, leaves the batch OUT of
     integration (dependents stay blocked), and — once the wave's other members are gated
     and integrated — STOPs instead of opening the next wave, quoting the open finding
     WITH its failure scenario and naming three verdicts for the user: fix again (an authorized
     third round: a FRESH implementer on the strong tier with both rounds' findings + the
     current diff, then a fresh re-review) / ship with the residual (the user's words
     recorded verbatim; residual → severity-tagged {{BACKLOG_FILE}} entry + a checkpoint
     smoke step exercising it) / drop.
7. Integrate serially, per the integration procedure: dry run → merge → tip validation →
   `🟢`, apply the version/changelog cadence, remove the worktree, write the row's Notes
   (SHA, reviewer arc, tier, residuals) ending with the metrics token
   `m: rounds=<n> asks=<n> fence-bounces=<n> gate=<findings/prod> tip-red=<0|1>`. A red
   tip → repair mini-batch before any further merge.
8. Wave closed. If the wave map places a checkpoint here: per-checkpoint close-out —
   version/changelog per cadence, tip validation, QA runner pre-smoke with evidence,
   covered rows `🟢` → `🧪`, checkpoint-table row, session-log row with the checkpoint's
   integration SHA, `**State**: AT-CHECKPOINT C<n>`, the checkpoint row's token
   `m: pre-smoke=<agent>/<human> human-smoke-min=<n> escaped=<n>` (completed at `close`
   from the user's verdict), the filled smoke page as `smoke-<Cn>.html`, commit → STOP, delivering the checkpoint's COMBINED smoke script
   per §Smoke checkpoints. Otherwise: go to step 4 and open the next wave in this SAME
   session. Default cadence: run until the next checkpoint — stop early only at `⛔` or
   an unplanned user gate.

**Unplanned user gate**: if a batch surfaces a design/UX decision the plan didn't
settle, do not guess and do not stall silently — implement what is decidable, record
the EXACT question in the row's Notes (status `👤` if the batch cannot close without
it), and put the question in the STOP hand-off so the next session starts with the
answer. Known design gates belong at the FRONT of the plan (resolved at planning
time), never mid-sequence.

## Change-complete close-out (after the FINAL checkpoint passes)

- **Convergence pass** — {{CONVERGENCE}}. When on: one read-only sub-agent reads the
  integration tip against every plan item (acceptance criteria + the full diff from the
  scaffold commit, ledger dir excluded) and classifies each `implemented / partial /
  contradicts / unrequested`; anything but `implemented` becomes a named {{BACKLOG_FILE}}
  entry or a convergence mini-batch the user is asked about. When off: the coverage audit
  is built from PROGRESS rows + git, and the hand-over says so.
- Final coverage audit in PROGRESS: every request item (fold-ins included) maps to a
  merged commit, an intended-behavior resolution, or a named entry in {{BACKLOG_FILE}} —
  zero unaccounted. Fold-ins are REMOVED from {{BACKLOG_FILE}} in the close-out commit
  (the ledger row and commit message carry provenance); a partially done fold-in is
  edited in place there with a pointer to this ledger; residuals added get ids in the
  {{BACKLOG_ID_PREFIX}} scheme.
- Distill: any NEW bug class this change uncovered → ONE-LINE guardrail bullet in
  {{GUARDRAILS_REF}} naming the class and pointing at the test or mechanism doc that
  enforces it (prefer adding the test in this close-out). Repo-wide rules stay in the
  always-loaded section; area-specific ones go to the area's doc. If the always-loaded
  section exceeds ~8 KB / ~120 lines, PROPOSE retirements (to a test, a linked doc, or a
  merge of bullets) for the user to accept — never delete on your own. Harvest in-run
  learnings from LOG.md.
- Release step (only on explicit user authorization): {{RELEASE_COMMAND}}
- Mark the change COMPLETE in the Session log and `**State**: COMPLETE`; propose deleting
  the merged branches and moving this ledger to `.agents/archive/` (`git mv`).
