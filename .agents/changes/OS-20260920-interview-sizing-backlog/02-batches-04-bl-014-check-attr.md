# B04 — Name check-attr in the manual fallback (fix, —)

**Branch**: `fix/bl-014-check-attr`
Cut from the integration tip when the wave opens.
**Wave**: 2 · **Weight**: S
**Depends on**: none — runs concurrently with B02, B03 and B05
**Smoke gate**: C1 (final, fully agent-run)
**Files**: `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `tests/protocol-contract.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: `Markdown is source of truth` (surgical edits, no reflow) · `Positive-only assertions on prose` · `Vacuous-until-later documentation` · `Line endings` · `A backlog entry is a pointer, not a specification` · `A defect fixed in the reported instance and left in its sibling`
**Spec**: [01-plan.md](01-plan.md) §B04 · **Gate**: fence check → failing-on-base + one combined reviewer+test-hunter pass

## Implementation notes

### BL-014 — verbatim from `BACKLOG.md`

> `orchestrate/references/protocol.md` states the resolved-per-path filter rule but, unlike its
> neighbouring fallback steps, does not name `git check-attr filter` — so a human working the
> manual fallback by hand has the rule without the command. No regression: the sentence it
> replaced named no command either.

### Codebase facts gathered at planning time

- The sentence is `orchestrate/references/protocol.md:216`, mirrored byte-identically at
  `orchestrate/templates/00-READBEFORE.md:162`:

  `endpoints. Before status, resolve the filter attribute of the paths status inspects:`

- Its neighbours DO name their commands: `git merge-base --is-ancestor` at `:213` and
  `git diff --name-status -z -M` at `:219`. This sentence is the only one that does not.
- The real probe is `orchestrate/tools/git-evidence.mjs:116`:
  `git(repo, ['check-attr', 'filter', '-z', '--stdin'], ...)`.
- The paragraph wraps at ~86 characters; line 216 is 84. A candidate replacement measured at
  scaffold time is **81 characters**, so it fits with NO reflow of the surrounding paragraph:

  `endpoints. Before status, run git check-attr filter on the paths status inspects:`

  The implementer may improve on the wording, but must not reflow the paragraph to do it.
- The string occurs EXACTLY ONCE in each file — verified at scaffold time.

### The mirror, and why a test comes with this batch

`tests/protocol-contract.test.cjs:89-94` slices `### Read-only evidence tools` → `## Git model`
from both files and asserts byte equality after substituting `{{EVIDENCE_TOOL}}` and
`{{FENCE_TOOL}}`. Line 216 is inside that span, so a one-sided edit goes red immediately.

But pre-flight established that this is NOT a criterion for BL-014: the mirror test compares the
two halves TO EACH OTHER. It is green before the edit, green after it, and green again if a
later batch deletes the command from both. Nothing in the repository currently fails on the
un-fixed text. This batch therefore adds the assertion that does — which is why
`tests/protocol-contract.test.cjs` is in its fence.

### Traps, from pre-flight

- The two SHA-256 pins at `tests/protocol-contract.test.cjs:71-72` cover only the Recovery and
  capped-verdict TABLES. This sentence is not in either, so neither hash moves. If a hash does
  move, something other than this sentence was edited.
- `tests/protocol-contract.test.cjs:241` pins `recipes.length === 7`. Do NOT write the new
  command as a line beginning `node orchestrate/tools/` — that would be parsed as an eighth
  published recipe.
- Both files are CRLF. `sed -i` under Git Bash silently rewrites them to LF and `git diff --check`
  is part of validation.

## Checklist

- [x] Name `git check-attr filter` in the resolved-filter sentence at `orchestrate/references/protocol.md:216`,
      without reflowing the surrounding paragraph.
- [x] Apply the byte-identical edit to `orchestrate/templates/00-READBEFORE.md:162`.
- [x] Add an assertion to `tests/protocol-contract.test.cjs` that the resolved-filter rule names
      `git check-attr filter` in BOTH files — a criterion that fails on the un-fixed text, which the
      existing mirror comparison does not.
      Prove failing-on-base: name, in the report, the exact assertion that goes red when run
      against the code and documents at this batch’s base.
- [x] Run the validation commands from [00-READBEFORE.md](00-READBEFORE.md); all green.
- [x] `git diff --name-status -M chore/interview-sizing-backlog-ledger...HEAD` plus `git status --porcelain`;
      revert anything outside the fence.
- [x] Commit on `fix/bl-014-check-attr` — `fix: name check-attr in the manual fallback (batch 04)`.

## Acceptance criteria

- The resolved-filter sentence names `git check-attr filter` in both `protocol.md` and
  `templates/00-READBEFORE.md`, and the two §Read-only evidence tools spans remain byte-identical
  after placeholder substitution.
- A test fails if the command is removed from EITHER file — not merely if the two disagree.
- The paragraph is not reflowed: no line in it other than the edited one differs from the base,
  and `git diff --check` is clean.
- Both SHA-256 table pins still hold, and `recipes.length === 7` still holds.
- Failing-on-base: the new assertion FAILS against the unmodified documents. Name it in the report.

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

- **Do**: Grep both `orchestrate/references/protocol.md` and `orchestrate/templates/00-READBEFORE.md` for `check-attr` in the resolved-filter sentence.
- **Pass**: Both name the command. A human working the manual fallback now has the command, not just the rule.
- **Runner**: `agent (grep)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.

### Step 2

- **Do**: Confirm the edit touched exactly one line per file and reflowed nothing.
- **Pass**: `git diff` shows one changed line in each of the two files and `git diff --check` is clean.
- **Runner**: `agent (git CLI)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.
