# B07 — Self-check code spans and honest runner classification (fix, —)

**Branch**: `fix/bl-010-016-selfcheck-runners`
Cut from the integration tip when the wave opens.
**Wave**: 4 · **Weight**: L
**Depends on**: B02 (`🟢`) for `scaffolding.md` and `SKILL.md`; B04 (`🟢`) for `protocol.md` and `templates/00-READBEFORE.md`; B06 (`🟢`) for `execution-models.md` and `templates/00-READBEFORE.md`; B01 for the fence tool
**Smoke gate**: C1 (final, fully agent-run)
**Files**: `orchestrate/references/scaffolding.md`, `orchestrate/SKILL.md`, `orchestrate/references/execution-models.md`, `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `orchestrate/templates/02-batch.md`, `tests/protocol-contract.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: `Markdown is source of truth` (surgical edits, no reflow) · `Positive-only assertions on prose` · `Vacuous-until-later documentation` · `Line endings` · `A backlog entry is a pointer, not a specification` · `A defect fixed in the reported instance and left in its sibling` · `A mechanical checker that cannot read its own repository’s conventions`
**Spec**: [01-plan.md](01-plan.md) §B07 · **Gate**: fence check → failing-on-base + reviewer + test-hunter

## Implementation notes

### BL-010 — verbatim from `BACKLOG.md`

> The scaffolder self-check (`orchestrate/references/scaffolding.md` step 9, mirrored in
> `orchestrate/SKILL.md`) greps the new ledger for `{{`, `<!--` and `<title>` expecting **zero
> hits**, but does not ignore fenced or inline code spans. Any ledger that documents templating
> work trips it: `OS-20260919-backlog-sweep` produced 11 `{{`, 8 `<!--` and 1 `<title>` hits at
> its own scaffold commit, every one inside a code span and none an unfilled slot. The `<title>`
> token added by that change inherits the same absolute — "Any hit is an unfilled slot; fix
> before committing" — which is false for it. Fix: exempt code spans, or restate the rule as
> "no placeholder outside a code span".

### BL-016 — verbatim from `BACKLOG.md`

> Smoke steps should be tagged `Runner: agent` **or** `human` on the basis of what an agent on
> this machine can do, not on what the test fixtures can do. `OS-20260919-backlog-sweep`
> classified C1 hands-on because "every fixture sets `GIT_CONFIG_NOSYSTEM=1`, so no test can
> prove the claim on a real machine" — true, and irrelevant: fixtures are isolated by design,
> subagents are not. Every C1 step was CLI-only and agent-runnable, yet the checkpoint was handed
> to the user to execute. The guidance in `orchestrate/references/execution-models.md` and
> `scaffolding.md` should say plainly that a step needs a human only when it needs something an
> agent on this machine cannot do — a device, a GUI, held credentials, or a judgement about
> whether something looks right — and that a checkpoint asks the user for a **verdict**, not for
> labour.

### This ledger is BL-010’s live evidence

The scaffold commit of THIS change trips the self-check: `00-request.md` and `LOG.md` each
mention `{{EXECUTION_MODEL}}` inside a code span, because naming the placeholder is the only way
to describe repointing its registry row. Every hit is inside a code span and none is an unfilled
slot — exactly the false positive BL-010 predicts. The scaffold self-check was run and overridden
on that documented basis, and the count is recorded in `PROGRESS.md`’s session log.

### BL-016 understated its file set by three — verified by pre-flight

The backlog names two files. Five carry a live `Runner:` default:

- `orchestrate/references/execution-models.md:85-88` — the tagging rule
- `orchestrate/references/scaffolding.md:24-25` ("default human") and `:229`
  ("Default when unsure: every step human.")
- `orchestrate/references/protocol.md:371` — "Default human."
- `orchestrate/templates/00-READBEFORE.md:368` — "Default is human."
- `orchestrate/templates/02-batch.md:52` — "Default human."

The last two decide what a DRIVING session and a PLANNER actually read; the reference docs are
read by the skill, not by a ledger. A rule that lands only in `execution-models.md` and
`scaffolding.md` never reaches a ledger at all. This is CLAUDE.md’s "a defect fixed in the
reported instance and left in its sibling", and its "backlog entry … right about the defect and
wrong about the file".

### Trap, from pre-flight — the residualGrep constrains BL-010’s wording

`tests/protocol-contract.test.cjs:157` is
``residualGrep = /grep the new[^.;]*`<title>`[^.;]*zero hits/i``, asserted against BOTH
`scaffolding.md` and `SKILL.md` at `:161`. The `[^.;]*` admits no `.` or `;` inside the clause,
and that character class was itself the fix for a demonstrated cross-sentence bypass. Put the
code-span exemption AFTER "zero hits" and leave the anchor intact rather than relaxing the
regex. `:168` additionally requires the templates’ example row to carry `<title>`.

### Trap — `templates/00-READBEFORE.md` is contested

B04 edits `:162` and B06 edits `:394` and `:405-407` of the same file. This batch is wave 4, so
both have merged before it starts; the `Runner:` default at `:368` is untouched by either. Read
the file at the integration tip, never from a stale copy, and confirm the line number before
editing — earlier waves may have shifted it.

### Trap — mirrored span

`protocol.md:371` and `templates/00-READBEFORE.md:368` are the same rule in the two mirrored
documents but are NOT inside the §Read-only evidence tools span, so they are not byte-compared.
They must still be changed together: leaving one behind is exactly the sibling defect this batch
exists to close.

## Checklist

- [ ] Restate the scaffolder self-check in `orchestrate/references/scaffolding.md` step 9 so a hit
      inside a fenced or inline code span is not an unfilled slot, keeping the `residualGrep` anchor
      at `tests/protocol-contract.test.cjs:157` matchable.
- [ ] Apply the same restatement to the mirrored self-check sentence in `orchestrate/SKILL.md`.
- [ ] Make the self-check’s absolute honest: "Any hit is an unfilled slot" becomes a statement that is
      true of hits outside code spans.
- [ ] State the runner rule plainly in `orchestrate/references/execution-models.md`: a step needs a
      human only when it needs a device, a GUI, held credentials, or a judgement about whether
      something looks right.
- [ ] State that a checkpoint asks the user for a VERDICT, not for labour.
- [ ] Correct the `Runner:` default in all five live locations — `execution-models.md`,
      `scaffolding.md` (both `:24-25` and `:229`), `protocol.md`, `templates/00-READBEFORE.md` and
      `templates/02-batch.md` — so a driving session and a planner read the same rule the skill does.
- [ ] Add assertions to `tests/protocol-contract.test.cjs`: the self-check exempts code spans in both
      files, and the runner rule is present in every one of the five locations — swept, not sampled.
      Prove failing-on-base: name, in the report, the exact assertion that goes red when run
      against the code and documents at this batch’s base.
- [ ] Run the validation commands from [00-READBEFORE.md](00-READBEFORE.md); all green.
- [ ] `git diff --name-status -M chore/interview-sizing-backlog-ledger...HEAD` plus `git status --porcelain`;
      revert anything outside the fence.
- [ ] Commit on `fix/bl-010-016-selfcheck-runners` — `fix: self-check code spans and honest runner classification (batch 07)`.

## Acceptance criteria

- The self-check rule in `scaffolding.md` and `SKILL.md` no longer calls every `{{`, `<!--` or
  `<title>` hit an unfilled slot, and a ledger documenting templating work (this one) passes it.
- `tests/protocol-contract.test.cjs:157`’s `residualGrep` still matches both files, and the
  templates’ example row still carries `<title>`.
- All FIVE live `Runner:` defaults state the same rule; a test sweeps the set rather than sampling
  two, so removing the rule from any one of them goes red.
- `execution-models.md` states that a step is human only when it needs a device, a GUI, held
  credentials, or a look-and-see judgement, and that a checkpoint asks for a verdict, not labour.
- No sentence surviving anywhere in the five files contradicts the new rule — the implementer
  reports the contradiction sweep, not just the insertions.
- `orchestrate/references/subagent-prompts.md` is unchanged, and no placeholder is added or
  removed from any template.
- Failing-on-base: the code-span assertion and the five-location sweep both FAIL against the
  documents at this batch’s base. Name them in the implementer report.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

Every step below is `Runner: agent`: this change edits files in this repository and nothing
else, so no step needs a device, a GUI, held credentials or a look-and-see judgement. They
aggregate into C1’s combined page, where they are pre-verified before hand-over. No section
here touches user data.

### Step 1

- **Do**: Run the scaffolder self-check over this ledger’s own directory as the revised rule states it.
- **Pass**: It passes. Before this change the same directory produced hits from `{{EXECUTION_MODEL}}` mentions inside code spans, every one a false positive.
- **Runner**: `agent (grep)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.

### Step 2

- **Do**: Sweep all five documents that carry a `Runner:` default and print each one’s rule.
- **Pass**: All five say a step is human only when it needs a device, a GUI, held credentials or a look-and-see judgement. None still says "default human" unqualified.
- **Runner**: `agent (grep)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.

### Step 3

- **Do**: Confirm `orchestrate/references/execution-models.md` states that a checkpoint asks the user for a verdict, not for labour.
- **Pass**: The sentence is present — which is the rule this very checkpoint was built to follow, since every step here is agent-run.
- **Runner**: `agent (grep)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.
