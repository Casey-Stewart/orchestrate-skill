# B01 — Wrapped polish items in the fence tool (fix, —)

**Branch**: `fix/bl-011-wrapped-polish`
Cut from the integration tip when the wave opens.
**Wave**: 1 · **Weight**: M
**Depends on**: none — first wave, cut from the scaffold commit
**Smoke gate**: C1 (final, fully agent-run)
**Files**: `orchestrate/tools/check-fence.mjs`, `orchestrate/templates/02-batch.md`, `tests/check-fence.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: `A hand-rolled parse more permissive than the real consumer’s` · `A mechanical checker that cannot read its own repository’s conventions` · `A defect fixed in the reported instance and left in its sibling` · `A branch no input reaches` · `Line endings`
**Spec**: [01-plan.md](01-plan.md) §B01 · **Gate**: fence check → failing-on-base + reviewer + test-hunter

## Implementation notes

### BL-011 — verbatim from `BACKLOG.md`

> `validateBatchEdit` in `orchestrate/tools/check-fence.mjs` accepts only **single-line**
> `- [x] polish:` items (`/^- \[[ x]\] polish: .+$/`), but this repository wraps every checklist
> line at ~90 characters — including in the COMPLETE, merged `OS-20260919` ledger. B01’s wrapped
> polish items produced **48 `batch-content` violations** with zero unknowns, and the batch had to
> clear the manual gate instead. Same class as the closed BL-002: the mechanical checker cannot
> read what the repository’s own authoring convention produces. It was latent for exactly as long
> as the tool was unusable, and surfaced within minutes of BL-002/BL-003 making it runnable. Fix:
> accept indented continuation lines.

### Why this batch runs alone, in wave 1

Every later batch in this change is gated by this tool. The helper paths in the contract are
repo-relative, so the copy that runs is whichever the current checkout holds — meaning that once
this batch merges, waves 2, 3 and 4 are checked by the FIXED tool. Left until later, the same
48-violation failure would repeat on six batches and every one would have to clear the manual
gate. That is the whole reason for this wave.

### Codebase facts gathered at planning time

- `orchestrate/tools/check-fence.mjs:92` is the whole defect:
  `if (i === polishAt) while (/^- \[[ x]\] polish: .+$/.test(after[j] || '')) j++;`
- The surrounding loop walks `before` and `after` in lockstep from `## Checklist` to the next
  `## ` heading. `polishAt` (`:87-88`) is the first index after all original checklist content,
  skipping trailing blanks. Anything the polish scan does not consume falls through to the
  `batch-content` diagnostic at `:105`.
- A continuation line is an INDENTED line following a polish item. The scan must not begin on a
  continuation: a bare indented line with no `- [ ] polish:` header before it is still a
  violation. State must therefore be carried — accept a continuation only after at least one
  header line has matched at this position.
- `tests/check-fence.test.cjs:142` is the existing single-line polish fixture. It must keep
  passing unchanged; the new case is its wrapped sibling.

### The template half — this is the actual bug class

CLAUDE.md names this exact failure: *"where a machine parses human-filled text, the template must
SHOW the accepted form, not describe it — a prose rule in a contract is not a pinned example."*
BL-002 was closed by adding a literal example row; BL-011 is its sibling and closes the same way.
`orchestrate/templates/02-batch.md` must show a WRAPPED `polish:` item, not merely permit one.

**Trap, from pre-flight.** The example must live INSIDE the existing instruction comment in the
`## Checklist` section. `tests/protocol-contract.test.cjs:209` anchors on
`/<!-- - \[ \] one box[\s\S]*?-->/`, and the comment at `templates/02-batch.md:23` must keep its
literal opening `<!-- - [ ] one box`. An example placed outside the comment ships live into every
ledger scaffolded from this template.

**Trap, from pre-flight.** Do NOT restate the polish grammar in `orchestrate/references/protocol.md`
or `orchestrate/templates/00-READBEFORE.md`. Neither says "single-line", so neither contradicts this
fix, and both are outside this fence — `00-READBEFORE.md` is B04’s in the very next wave, and the
two are held byte-identical over the §Read-only evidence tools span.

## Checklist

- [ ] Accept indented continuation lines in `validateBatchEdit`’s polish scan
      (`check-fence.mjs:92`), consuming a continuation only after a `- [ ] polish:` or
      `- [x] polish:` header has matched at that position — a leading indented line with no header
      before it stays a `batch-content` violation.
- [ ] Add a WRAPPED `polish:` example to the `## Checklist` instruction comment in
      `orchestrate/templates/02-batch.md`, inside the existing comment and preserving its literal
      opening `<!-- - [ ] one box`.
- [ ] Add a `tests/check-fence.test.cjs` case that runs the real `validateBatchEdit` over a batch
      file whose appended polish item WRAPS across two or more lines, and asserts zero violations.
- [ ] Add the negative case: an indented line appended with no polish header above it still produces
      a `batch-content` violation.
- [ ] Add the boundary case on the other side — a wrapped polish item followed by an unrelated
      appended line still violates — so the loosening is pinned from both directions.
      Prove failing-on-base: name, in the report, the exact assertion that goes red when run
      against the code and documents at this batch’s base.
- [ ] Run the validation commands from [00-READBEFORE.md](00-READBEFORE.md); all green.
- [ ] `git diff --name-status -M chore/interview-sizing-backlog-ledger...HEAD` plus `git status --porcelain`;
      revert anything outside the fence.
- [ ] Commit on `fix/bl-011-wrapped-polish` — `fix: wrapped polish items in the fence tool (batch 01)`.

## Acceptance criteria

- `validateBatchEdit` returns zero violations for a batch edit whose only change is ticking boxes
  and appending a `polish:` item wrapped across three lines at this repository’s ~90-character
  convention.
- An appended indented line NOT preceded by a polish header still yields exactly one
  `batch-content` violation — the fix loosens the grammar, it does not disable the check.
- `orchestrate/templates/02-batch.md` contains a wrapped `polish:` example inside the `## Checklist`
  instruction comment, and `tests/protocol-contract.test.cjs:209` still matches.
- Failing-on-base: the new wrapped-polish test FAILS against `check-fence.mjs` at the batch base
  with `batch-content` violations, and passes after the fix. Name it in the implementer report.
- The existing single-line polish case at `tests/check-fence.test.cjs:142` is unchanged and green.

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

- **Do**: Run the real fence tool over a batch file carrying a wrapped `polish:` item and confirm it reports no violation.
- **Pass**: The tool exits 0 and prints no `batch-content` diagnostic. On the un-fixed tool the same input produced 48 of them.
- **Runner**: `agent (Node CLI)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.

### Step 2

- **Do**: Grep `orchestrate/templates/02-batch.md` for a wrapped `polish:` example and confirm it sits inside the `## Checklist` instruction comment.
- **Pass**: The example is present AND lies between `<!-- - [ ] one box` and that comment’s closing `-->`, so it never ships live into a scaffolded ledger.
- **Runner**: `agent (grep)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.
