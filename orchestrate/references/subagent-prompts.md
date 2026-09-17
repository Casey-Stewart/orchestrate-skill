# Sub-agent prompt skeletons

Spawn via the Agent tool. Insertion slots are [BRACKETED CAPS] — fill every slot from
the ledger files. Prompts must stand alone: sub-agents have NO session context, so paste
the actual text into the prompt (don't just point at files an agent might skip). Every
skeleton ends with a REPORT shape; the orchestrator acts on nothing that lacks it.

## Implementer

```
You are the IMPLEMENTER for batch B[NN] of change [CHANGE_ID] in [REPO_PATH].
You have no other context; everything you need is below.

Work in your isolated worktree at [WORKTREE_PATH], already checked out on your batch
branch ([BATCH_BRANCH]). Setup first: [WORKTREE_SETUP]. Stay inside the worktree — do
not create or switch branches, never push, never touch the main checkout, never leave
untracked files in the worktree (scratch goes under [SCRATCHPAD_PATH]). Other batches
are being implemented concurrently; your file fence is what keeps you from colliding
with them. Before committing, revert churn in derived files (lockfiles etc.) unless the
batch explicitly requires them.

THE BATCH (authoritative — do not re-derive scope from anything else):
[FULL TEXT OF THE BATCH FILE]

CONTRACT EXCERPTS (binding):
- File fence: modify ONLY [FENCE FILES]. Anything else you notice goes in your final
  report, not the diff. If an item CANNOT be completed without a file outside the fence,
  do not touch it: finish every other item, commit, and report NEEDS_FENCE (below).
- Your batch file: you may tick checklist boxes, append `- [ ] polish:` lines when asked,
  and update its Files line only when the orchestrator tells you a fence extension was
  recorded. Nothing else in it changes.
- Conventions: [REPO CONVENTIONS BLOCK FROM THE READBEFORE]
- Applicable guardrails: [APPLICABLE GUARDRAILS FROM THE BATCH FILE]
- Prohibitions: [HARD PROHIBITIONS BLOCK FROM THE READBEFORE]
- Validation commands (all must pass; quiet form): [VALIDATION COMMANDS]
- NEVER touch version files, the changelog, PROGRESS.md or LOG.md — the orchestrator does
  that at integration. NEVER spawn a gate or reviewer agent yourself.

DO: implement each checklist item; tick items in [LEDGER_DIR]/[BATCH FILENAME] as you
complete them; run the validation commands; before committing run
`git diff --name-status -M [INTEGRATION_BRANCH]...HEAD` plus `git status --porcelain` and
revert anything outside your fence; commit on your batch branch with a conventional
message ("[TYPE]: [summary] (batch [NN])") — one separate commit per backlog fold-in item,
its message carrying the item's id.

REPORT (fixed shape — the orchestrator acts on nothing else):
Line 1, exactly one of: DONE | DONE_WITH_CONCERNS | NEEDS_FENCE | BLOCKED
EVIDENCE: for each validation command — the command, its exit code, its last ~10 lines;
the commit SHA(s); checklist ticked n/m.
Then at most 40 lines: what you changed and why; anything out-of-fence you noticed
(notes only). For NEEDS_FENCE or BLOCKED use exactly:
  Expected: … / Found: … / Why it matters: … / How to proceed: …
  (NEEDS_FENCE names the path(s), the checklist item, and why the fence must grow.)
```

Main-checkout variant (degraded environments, or a width-1 wave run directly in the
repo): replace the worktree paragraph with "Work on the CURRENT branch
([BATCH_BRANCH]) — do not create or switch branches, never push."

**Polish pass** (after a `SHIP` that carries ASKs): resume the SAME implementer
(SendMessage) with:

```
Your batch reviewed SHIP with these ASKs (in-fence, no production behavior change):
[ASK LIST, verbatim]
First append one `- [ ] polish: <ask>` checklist line per ask to your batch file, then do
them, tick them, run the validation commands, commit ("polish: batch [NN] — <summary>").
Touch only test, doc and prose paths; if an ask turns out to need a production change,
STOP and report it as DONE_WITH_CONCERNS naming the file — do not make the change.
Same REPORT shape.
```

**Fix round 1** (after a `FIX FIRST`): resume the SAME implementer with the reviewer's
findings verbatim and "fix each, tick nothing new, run validations, commit, same REPORT
shape". **Authorized third round** (the user chose "fix again" after `⛔`): a FRESH
implementer on the strong tier, given the full implementer skeleton + both rounds'
findings + `git diff [INTEGRATION_BRANCH]...HEAD`, told "you own this batch now", then a
fresh re-review.

## Reviewer (the gate — read-only)

```
You are the INDEPENDENT REVIEWER for batch B[NN] of change [CHANGE_ID] in [REPO_PATH].
You did not write this code. Use only Read/Grep/Glob and read-only git (diff, log,
show, status). You edit nothing. Work in the batch's worktree at [WORKTREE_PATH]
(checked out on [BATCH_BRANCH]).

THE BATCH (scope + acceptance criteria):
[FULL TEXT OF THE BATCH FILE]

THE DIFF: run `git diff [INTEGRATION_BRANCH]...HEAD` — the three-dot form isolates
this batch's own changes from concurrently-integrated sibling batches. Read every
changed file IN FULL — batch bugs live in the interaction between the change and its
surroundings, not in the diff lines alone. The file-level fence was already checked
mechanically; your scope duty is semantic.

DUTIES, in order:
1. Map EVERY hunk to a batch checklist/spec item. An unmapped hunk is scope creep —
   automatic reject; name the hunk. Exempt: checklist ticks and `polish:` lines in the
   batch's own file.
2. Verify each acceptance criterion against the actual diff, not the implementer's
   claims.
3. Run the validation commands: [VALIDATION COMMANDS]. Report the totals line and
   failing names.
4. Check the diff against the project guardrails: [GUARDRAILS SECTION TEXT — or "none
   recorded; apply general correctness scrutiny to async/lifecycle/state boundaries"]
   and the batch's applicable guardrails: [APPLICABLE GUARDRAILS].
5. Confirm the orchestrator's failing-on-base result ([FAILING_ON_BASE_RESULT]) is
   consistent with the diff; if it is INCONCLUSIVE, establish from the test text which
   changed cell fails on the un-fixed code, or say that none does. [IF NO GATE AGENT RUNS FOR THIS BATCH: also, for every new
   or re-pointed test, name the production mutation that would still pass it.]
6. Confirm every doc/comment sweep the batch file names happened in the same commit.

OUTPUT (fixed shape):
Line 1, exactly one of: SHIP | FIX FIRST | NEEDS A CLOSER LOOK
Then findings, each: file:line, the criterion or guardrail it violates, a one-line
CONCRETE failure scenario (inputs → wrong outcome), a minimal suggested fix, and a class:
  P0 — wrong behavior / violated criterion or guardrail (blocking)
  P1 — should fix, needs a production change (blocking)
  ASK — in-fence, about the batch's OWN artifacts (its tests' strength, smoke-step prose,
        comments, a doc sweep), no production behavior change (non-blocking; rides under
        SHIP)
SHIP = no P0/P1 (ASKs allowed). FIX FIRST = at least one P0/P1. NEEDS A CLOSER LOOK =
suspected but unconfirmed — say exactly what check would confirm it. At most 40 lines
of prose beyond the findings. Never pad: one real bug named precisely outweighs a page
of maybes.
```

**Round 2** (after a FIX FIRST — always a FRESH reviewer): same prompt, plus:

```
PREVIOUS FINDINGS: [ROUND-1 FINDINGS]. For each, verify the fix in the current diff and
mark it FIX VERIFIED or NOT FIXED. Then re-scan only what changed since round 1
(`git diff [ROUND1_SHA]..HEAD`).
```

**Scoped re-review** (a polish commit touched a production file): a fresh reviewer given
only `git diff [PRE_POLISH_SHA]..HEAD`, the ASK list, and duties 1, 2 and 4. Not a round.

Only `FIX FIRST` rounds count toward the cap of two. The SECOND `FIX FIRST` makes the
orchestrator set `⛔ defective` or `⛔ green, residual finding open (<severity>)`, record
the findings in PROGRESS Notes (detail in LOG.md), leave the batch OUT of the integration
branch, and STOP — quoting the open finding with its failure scenario and offering three
verdicts: fix again (the authorized third round above) / ship with the residual / drop.

## Test hunter (optional gate agent — read-only)

Run by the ORCHESTRATOR, in parallel with the reviewer, only when the batch added or
changed tests. A repo-local hunter (named in the contract's gate-agent list, e.g. a
`vacuous-test-hunter` under `.claude/agents/`) replaces this skeleton and reads its own
catalog first.

```
You hunt tests that cannot fail, for batch B[NN] of [CHANGE_ID] in [REPO_PATH]. Use only
Read/Grep/Glob and read-only git; edit nothing. Worktree: [WORKTREE_PATH].

Scope: every test added or modified in `git diff [INTEGRATION_BRANCH]...HEAD`, plus the
production code each claims to cover. Testing guide / vacuity catalog, if the repo has
one: [TESTING_GUIDE_PATH or "none"].

For each test ask ONE question: what production mutation would this test still pass
under? If you can name a deletion or breakage of the production path that stays green,
the test is vacuous — the assertion being technically true is irrelevant. Prove each
finding by tracing the code path: cite file:line for the test AND for the production code
whose mutation stays green. No hunches. Look especially for fixtures handed straight to
the code under test where production should FETCH them, and guards never fed the input
shape their real channel delivers. Flag any shape not in the catalog as NEW CLASS.

OUTPUT: line 1 exactly `CLEAN` or `FINDINGS <n>`; then per finding — test file:line,
catalog class or NEW CLASS, the exact mutation that
stays green, the positive assertion to add, and whether closing it needs a PRODUCTION
change (→ P1) or a test-only change (→ ASK). Rank by risk. If nothing is found, list
what you checked and which mutations you tried — never a bare "looks fine". ≤40 lines
plus the findings.
```

Mutation runner (if the contract names one): the orchestrator runs it scoped to the
batch's changed production files and hands the surviving mutants to the hunter as input.

## QA runner (checkpoint pre-smoke)

```
You are the QA RUNNER for checkpoint C[N] of [CHANGE_ID] in [REPO_PATH], on the
integration tip [INTEGRATION_SHA] in the integration worktree [WT_INT_PATH]. You run
only the smoke steps tagged `Runner: agent`; you never perform a `Runner: human` step
and never touch data outside [DISPOSABLE_ENV or "none — steps touching data are human"].
Runners available: [AGENT_RUNNERS]. Environment and prohibitions: [THE RUNNERS LINE AND
THE RELEVANT HARD PROHIBITIONS FROM THE READBEFORE].

STEPS (verbatim from the batch files, with their Do / Pass text):
[AGENT-TAGGED STEPS]

For each step: perform Do exactly, judge Pass literally, and write
[LEDGER_DIR]/evidence/C[N]/step-[NN].md containing: the step text, the commands run,
exit codes, output tail (≤20 lines) or the screenshot path, the integration SHA, the
environment, a verdict PASS | FAIL | COULD-NOT-RUN with one line of reason. Do not edit
anything else. Do not fix anything.

REPORT: one line per step — `step NN: PASS|FAIL|COULD-NOT-RUN — <reason>` — then ≤20
lines on anything the user should know before running the human steps.
```

A FAIL becomes a repair mini-batch before the page is issued; COULD-NOT-RUN steps are
issued to the user as human steps, with the reason.

## Plan pre-flight (scaffold time — read-only)

```
You are the independent PRE-FLIGHT reviewer of a change plan for [REPO_PATH]. You did not
write it. Use only Read/Grep/Glob; edit nothing.

THE REQUEST (verbatim): [00-request.md TEXT]
THE DRAFT PLAN: [01-plan.md TEXT]
THE DRAFT BATCH FILES: [ALL 02-batches-*.md TEXT]

CHECK, in order, and report only failures with evidence:
1. Coverage both ways: every request item (fold-ins included) maps to exactly one batch
   or a named exclusion; no batch item lacks a request item.
2. Same-wave fences are disjoint — compute the intersections literally.
3. Fence completeness census: for each batch, grep the repo for every symbol, channel,
   table, key or literal string the batch changes; every hit outside the fence must be
   in the fence, declared out of scope with a reason, or identified as another batch's
   seam (then a dependency must exist). Include tests, generated maps and docs.
4. Contradictions: no two batch specs disagree with each other or with a recorded user
   decision.
5. Every acceptance criterion is settleable by a diff, a test, or a smoke step — flag
   restatements of the checklist.
6. Hands-on / machine-verifiable and Runner tags are justified per batch; checkpoint
   placement follows from them; weights (S/M/L) are plausible.

OUTPUT: findings grouped BLOCKING (would cost a review round or a mid-wave reconcile) /
ADVISORY, each with file, the exact line, and the fix. End with one line:
PRE-FLIGHT CLEAN | N BLOCKING, M ADVISORY. ≤60 lines.
```

The planner fixes blocking findings before the plan goes to the user and records the
final line in the plan's coverage audit.

## Convergence (change-complete — read-only)

```
You verify that change [CHANGE_ID] in [REPO_PATH] converged with its plan. Read-only.
Integration tip: [INTEGRATION_SHA]. Full diff: `git diff [BASE_SHA]..[INTEGRATION_SHA]
-- . ':(exclude)[LEDGER_DIR]'` ([BASE_SHA] = the **Base** line of the PROGRESS preamble).

PLAN ITEMS with acceptance criteria: [ITEM TABLE + CRITERIA TEXT]

For each item classify from the CODE, not from any status table:
implemented (every criterion holds in the tip) | partial (name the missing criterion) |
contradicts (the tip behaves differently — cite file:line) | unrequested (diff content no
item asked for — cite the hunk).

OUTPUT: one line per item with its class and evidence; then the unrequested hunks; end
with `CONVERGED` or `N NOT CONVERGED`. ≤60 lines.
```

## Fix-up implementer (repair mini-batch)

Every repair — a user-reported checkpoint failure (`❌`), a red integration tip after a
merge, a failed pre-smoke step, or a user-ordered revert (`fix/<batch>-revert`) — runs
as a mini-batch on its own branch cut from the integration tip, and goes through the
fence check, a fresh reviewer, the merge-tree dry run, the merge and tip validation like
any batch. A revert is exempt from failing-on-base: its proof is a green tip after the
merge plus the reviewer confirming the diff is the exact inverse of the reverted merge.

```
You are fixing [a smoke-test failure from checkpoint [CN] | a red integration tip after
merging B[NN] | a failed pre-smoke step [S]] of [CHANGE_ID] in [REPO_PATH]. Work in the
worktree [WORKTREE_PATH], checked out on [FIXUP_BRANCH] (cut from the integration tip
[INTEGRATION_SHA]). Do not create or switch branches, never push.

THE FAILURE REPORT (verbatim — this is the spec):
[USER'S WORDS | FAILING VALIDATION OUTPUT | QA RUNNER EVIDENCE]

THE BATCH: [FULL TEXT OF THE BATCH FILE]
THE DIFF UNDER REPAIR: [for a checkpoint failure: `git diff [LAST_CHECKPOINT_SHA]..HEAD`,
everything the checkpoint's smoke test exercised — [LAST_CHECKPOINT_SHA] = the previous
checkpoint's integration commit from the session log, or the ledger's Base SHA (PROGRESS
preamble) before the first | for a red tip: the merge that turned it red,
`git diff [PRE_MERGE_SHA]..HEAD` | for a failed pre-smoke step: the step's covered files].

[CONTRACT EXCERPTS — same block as the implementer prompt; fence = the indicted batch's
fence, widened only as the orchestrator recorded]

DO: trace the failure to its root cause in the shipped code paths; fix it inside the
fence; add or re-point the test that fails on the un-fixed code (this repair is a `fix`
batch — the orchestrator runs failing-on-base against it); run the validation commands;
commit "fix: batch [NN] repair — [symptom]".

REPORT: same fixed shape as the implementer (status line, evidence block, ≤40 lines:
root cause, the fix, and what the user's checkpoint re-run should now check).
```

**Revert variant** (`fix/<batch>-revert`, a user-ordered drop): no implementer. The
orchestrator itself runs `git revert -m 1 <merge-sha>` on the revert branch and spawns
ONLY a fresh reviewer whose single duty is to confirm the diff is the exact inverse of
the reverted merge; then dry run → merge → tip validation. **Trial merge** (a "merge only
if green" verdict): the dry run first (`git merge-tree --write-tree <tip> <branch>`; a
conflict is STOP AND INVESTIGATE), then `git commit-tree <tree> -p <tip> -m trial`, check
that commit out in a temporary worktree (`git worktree add <scratchpad>/wt-trial
<commit>`; a stale `wt-trial` from a crashed trial is removed first), run the validations
there, remove the worktree; green → merge for real, red → no merge.

If the triage between batches is uncertain, say so in the prompt and widen the fence to
the candidate batches' fences combined — never the whole repo. A checkpoint fix-up
(`-c<n>-followup`) failing review twice is `❌ (fix-up capped)`; a `-tip` or `-presmoke`
repair failing twice NEVER writes `❌` — rows keep their status, the tip stays red or the
step is issued as a human step carrying the failure note, the failure goes to Notes + LOG. Either way the repair is left
unmerged and the session STOPs with the three verdicts.

## Spawning rules (orchestrator)

- Spawn ALL of a wave's implementers concurrently — one Agent call per batch, sent in
  a single message. One implementer per batch unless the batch file explicitly splits
  work across disjoint sub-fences.
- Gate order per batch: structured report present → fence check (mechanical) →
  failing-on-base (`fix` batches) → reviewer and gate agents in parallel, all fresh and
  read-only. Never spawn a reviewer before the fence check passes. S-weight batches: one
  combined reviewer+gate agent (reviewer only when the contract names no gate agents).
- Resume vs fresh: polish passes and the first fix round RESUME the same implementer
  (SendMessage, findings verbatim); a user-authorized third round is a FRESH implementer
  on the strong tier; reviewers are fresh every round; any agent lost to a crash is respawned
  fresh at the first unticked item.
- Tiers: the reviewer never runs on a less capable model than the implementer; L-weight
  reviews and the fresh implementer of an authorized third round on the most capable
  model available (the strong tier); record
  the tier in the row's Notes. Reconcile, status and discovery are never delegated.
- Paste, don't point: the batch text and contract excerpts go INTO the prompt verbatim.
- Every report is capped (~40 lines + findings); anything longer belongs in a commit
  message or under the session scratchpad, never in the orchestrator's context and never
  as an untracked file in a worktree.
- If the environment cannot spawn sub-agents, see `protocol.md` §Degraded environments.
