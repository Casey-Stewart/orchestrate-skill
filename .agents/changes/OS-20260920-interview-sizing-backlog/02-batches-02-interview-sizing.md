# B02 — Interview sizing rule and the topic-5 move (fix, —)

**Branch**: `fix/interview-sizing`
Cut from the integration tip when the wave opens.
**Wave**: 2 · **Weight**: L
**Depends on**: B01 (`🟢`) — wave ordering only; no file or symbol is shared
**Smoke gate**: C1 (final, fully agent-run)
**Files**: `orchestrate/references/scaffolding.md`, `orchestrate/SKILL.md`, `tests/interview-sizing.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: `Markdown is source of truth` (surgical edits, no reflow) · `Positive-only assertions on prose` · `Vacuous-until-later documentation` · `Line endings` · `A backlog entry is a pointer, not a specification`
**Spec**: [01-plan.md](01-plan.md) §B02 · **Gate**: fence check → failing-on-base + reviewer + test-hunter

## Implementation notes

### The request, verbatim

> The new orchestrate is currently only asking me max 4 questions. I’m not sure why this was put
> in place, but it’s okay to ask as many as needed since the "batch" size can change a lot from
> run to run and feature clarification is not a bad thing versus building the wrong system.

and, on where interview topic 5 belongs: **"Move to 7."**

### The finding this batch acts on

The 4 is not a policy. `AskUserQuestion` declares `questions` with `maxItems: 4`, so no number
can be raised. What limits the interview is `orchestrate/references/scaffolding.md:263-266`,
which instructs the orchestrator to MERGE topics 1–7 down to fit ONE call:

> Batch it: topics 1–7 fit in one AskUserQuestion call only merged down to its 4-question cap —
> 1+3 (automated + by-hand verification), 2+6 (repo conventions) and 4+7 (git + gate policy)
> leave exactly four: {1+3, 2+6, 4+7, 5}; genuinely unmergeable → two calls back-to-back.

Back-to-back calls are already permitted there, but only as a grudging fallback. The change
inverts which is the default.

### Evidence from the three prior ledgers (all verified, all quotable)

- `.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-request.md` — three answers
  carrying ~15 settings; "Use these conventions." confirmed nine facts in one click.
- `.agents/changes/OS-20260919-backlog-sweep/00-request.md` — two compound option labels,
  **"Full recipe + agent-run smoke"** and **"Stop at integration + test-hunter"**, each joining
  two independent axes so a mixed preference had no option to select.
- `.agents/changes/OS-20260919-agent-tool-restrictions/00-request.md` — the first answer came
  back as a free-text counter-question because the options did not contain the user’s framing,
  and six decisions were recorded across the run rather than in one round.

BL-016 traces to the merged verification topic: "which runners may an agent use" rode along
behind "confirm the validation commands", and the checkpoint was handed to the user as labour.

### The eight deliverables

**A1** Delete the merge arithmetic at `scaffolding.md:263-266` — the sentence quoted above, the
pairings and the literal `{1+3, 2+6, 4+7, 5}`. Replace it with back-to-back calls as the DEFAULT:
one question per decision that can independently change the plan; pack four per call, which is
the schema cap; issue as many calls as the open gaps need.

**A2** Ban compound option labels that join two independent axes. Name the smell explicitly — a
`+` or an `and` in an option LABEL joining two axes — and give one of the two real examples above
so the rule is shown, not described.

**A3** Make the section heading’s "confirmations + gaps only" load-bearing rather than
decorative: never ask what detection already answered; never ask what step 7 will ask again.
This is what governs the question count once the arithmetic is gone — without it, A1 reads as
licence to ask more.

**A4** A repeat repo collapses the round: read the previous ledger’s `00-READBEFORE.md` and
present its baked answers as defaults, so a second ledger in the same repository needs one call
or none. Detection already finds prior ledgers (SKILL.md §Discovery); this makes the contract a
source of interview defaults.

**A5** Cap REPEATS, not questions. Each decision is asked once, recorded verbatim in
`00-request.md`, and never re-litigated at approval. This is the counterweight to A1: the failure
mode of unbounded asking is fatigue, and the archive shows what fatigue produces — "Use these
conventions."

**A6** Move topic 5 out of the interview list ENTIRELY, into procedure step 7. The user’s words
were "Move to 7." — no pointer row remains in the list. Step 7 at `scaffolding.md:70-71` already
reads "the user approves plan, wave map, checkpoints and fold-ins in ONE pass"; only **weights**
are missing from that sentence, so A6 is a deletion plus adding weights to an existing step.
Do not duplicate step 7.

**A7** Keep topic numbers 1, 2, 3, 4, 6, 7 exactly as they are — fifteen placeholder-registry
rows at `scaffolding.md:131-174` and precondition 2 at `:8` cite them. Repoint the
`{{EXECUTION_MODEL}}` row at `:141` from "interview #5" to step 7; that row’s third column is the
ONLY citation of topic 5 in the repository.

**A8** `orchestrate/SKILL.md:175` says "ONE consolidated interview round" and must agree.

### Traps, from pre-flight

- **Do not add or remove any `{{PLACEHOLDER}}`.** `tests/protocol-contract.test.cjs:80-87` builds
  one set from every `templates/*.md` and another from this file’s registry rows and compares
  them with `deepEqual`. `templates/00-READBEFORE.md` is B04’s file in this same wave. Change the
  `{{EXECUTION_MODEL}}` row’s THIRD COLUMN only; the row must still match
  `/^\| `\{\{[A-Z_]+\}\}` \| template/`.
- **Positive-only assertions on prose are defeated by an appended sentence.** A1, A6, A7 and A8
  are negatively provable and must be: assert the ABSENCE of "merged down to its 4-question cap"
  and of the literal `{1+3, 2+6, 4+7, 5}`; sweep every `interview #N` in the repository and
  assert the set is exactly `{1,2,3,4,6,7}`, with a set-size assertion so a both-at-once edit is
  caught; assert the absence of "ONE consolidated interview round" from `SKILL.md`. A2–A5 are
  pure additions, so each needs a positive pin AND a sweep of the rest of both files for a
  directive that contradicts it.
- `tests/interview-sizing.test.cjs` is a NEW file, owned by this batch alone. Do not add these
  assertions to `tests/protocol-contract.test.cjs` — it is B04’s file this wave and B07’s next.
- Never reflow surrounding text to fit an insertion, and change no file’s EOL style.

## Checklist

- [x] Replace the merge arithmetic at `scaffolding.md:263-266` with the back-to-back default (A1).
- [x] Add the compound-label ban with one of the two real examples from the prior ledgers (A2).
- [x] Make "confirmations + gaps only" load-bearing: never ask what detection answered, never ask
      what step 7 will ask again (A3).
- [x] Add the repeat-repo collapse: the previous ledger’s `00-READBEFORE.md` supplies defaults (A4).
- [x] Add the cap on REPEATS — asked once, recorded verbatim, never re-litigated at approval (A5).
- [x] Delete interview topic 5 from the list with no pointer row, and add **weights** to procedure
      step 7 at `scaffolding.md:70-71` (A6).
- [x] Repoint the `{{EXECUTION_MODEL}}` registry row at `scaffolding.md:141` to step 7, third column
      only, leaving topic numbers 1, 2, 3, 4, 6, 7 untouched (A7).
- [x] Update `orchestrate/SKILL.md:175` so it no longer promises ONE consolidated round (A8).
- [x] Create `tests/interview-sizing.test.cjs` with the negative pins for A1, A6, A7, A8 and the
      positive-pin-plus-contradiction-sweep for A2–A5.
      Prove failing-on-base: name, in the report, the exact assertion that goes red when run
      against the code and documents at this batch’s base.
- [x] Run the validation commands from [00-READBEFORE.md](00-READBEFORE.md); all green.
- [x] `git diff --name-status -M chore/interview-sizing-backlog-ledger...HEAD` plus `git status --porcelain`;
      revert anything outside the fence.
- [x] Commit on `fix/interview-sizing` — `fix: interview sizing rule and the topic-5 move (batch 02)`.
- [x] polish: Scan option labels over collapsed text, filter on ` + ` or ` and `, and scope the
      scan to the Interview section, so a wrapped or and-joined compound label reddens and an
      innocent quoted phrase elsewhere does not.
- [x] polish: Widen the contradiction sweeps to ordinary English — consolidate / combine /
      collapse stems, a second call called a failure, and a numeric question budget — and add the
      sweeps A3 and A4 never had, each with its own live specimen.
- [x] polish: Replace the two assertions that cannot fail: the citation-count inequality entailed
      by its own input, and the length / set-size / no-5 checks entailed by the deepEqual above
      them. The replacements pin the expected list itself and per-topic citation in scaffolding.md.
- [x] polish: Sweep every file the skill ships, not the two edited documents: contradictions over
      `orchestrate/**`, and citations over every extension, so a dangling topic in the HTML
      template, a .ps1 or a .txt is not invisible.
- [x] polish: Add the missing small pins — a positive assertion on SKILL.md’s interview clause, the
      per-row registry citation map, a notEqual(-1) guard before slicing procedure step 7, and an
      existsSync on the 00-READBEFORE template name the repeat-repo rule depends on.

## Acceptance criteria

- Neither `scaffolding.md` nor `SKILL.md` contains "merged down to its 4-question cap", the
  literal `{1+3, 2+6, 4+7, 5}`, or "ONE consolidated interview round"; a test asserts each
  absence, so re-introducing any of them goes red.
- Every `interview #N` citation remaining in the repository resolves to N in `{1,2,3,4,6,7}`, and
  the test asserts the SET and its SIZE, not a sample — adding an `interview #5` anywhere goes red.
- `scaffolding.md` states that back-to-back AskUserQuestion calls are the default and that four
  per call is the tool’s schema cap, not a budget.
- The compound-label ban is present AND illustrated with a real example, and no surviving sentence
  in either file still instructs the orchestrator to merge topics to fit one call.
- Procedure step 7 names weights alongside plan, wave map, checkpoints and fold-ins, and the
  interview list contains no topic 5 and no pointer to one.
- The `{{EXECUTION_MODEL}}` registry row still matches `/^\| `\{\{[A-Z_]+\}\}` \| template/`, and
  the placeholder set is byte-for-byte what it was at the batch base.
- Failing-on-base: every assertion in `tests/interview-sizing.test.cjs` fails against the
  unmodified `scaffolding.md` and `SKILL.md`. Name the failures in the implementer report.

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

- **Do**: Grep `orchestrate/references/scaffolding.md` and `orchestrate/SKILL.md` for the replaced text: "merged down to its 4-question cap", "{1+3, 2+6, 4+7, 5}" and "ONE consolidated interview round".
- **Pass**: All three are absent. Their absence is what proves the old default is gone, not merely buried under a new paragraph.
- **Runner**: `agent (grep)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.

### Step 2

- **Do**: Sweep the repository for every `interview #N` citation and print the distinct set of N.
- **Pass**: The set is exactly {1, 2, 3, 4, 6, 7}. No citation of topic 5 survives anywhere.
- **Runner**: `agent (grep)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.

### Step 3

- **Do**: Read the interview section of `scaffolding.md` and procedure step 7.
- **Pass**: Back-to-back calls are stated as the default; the compound-label ban carries a real example; step 7 names weights alongside plan, wave map, checkpoints and fold-ins.
- **Runner**: `agent (read)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.
