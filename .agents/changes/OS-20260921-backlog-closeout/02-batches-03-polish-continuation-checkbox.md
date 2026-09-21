# B03 — Narrow the polish continuation scan (fix, S, —)

**Branch**: `fix/polish-continuation-checkbox` (cut from the integration tip when the wave opens)
**Wave**: 1
**Depends on**: none
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files** (the fence — modify NOTHING else): `orchestrate/tools/check-fence.mjs`, `tests/check-fence.test.cjs`, `orchestrate/templates/02-batch.md`
**Spec**: [01-plan.md](01-plan.md) §B03 · **Reviewer pass required**

## Implementation notes

BACKLOG.md BL-021, verbatim:

> `validateBatchEdit` in `orchestrate/tools/check-fence.mjs` consumes ANY indented
> non-blank line after a `polish:` header, so an appended
> `  - [ ] Also rewrite the module into three files.` clears the mechanical gate.
> Defensible — in markdown an indented block under a list item is part of that item, and
> the tool's own banner says it does not replace semantic review — and the reviewer
> declined to block on it. Minimal fix if wanted: exclude a checkbox continuation, which
> every real continuation line in `.agents/**` still satisfies.

Re-verified at scaffold time. The relevant line is the `polishAt` loop in
`validateBatchEdit` (around `orchestrate/tools/check-fence.mjs:93`). Its continuation
predicate matches any line of one-or-more spaces followed by a non-space, which admits an
indented checkbox. Narrowing it with a negative lookahead for a checkbox marker excludes
exactly that and nothing else.

**Exposure check, run at scaffold time**: a recursive grep for an indented `- [` across
`.agents` and `orchestrate/templates` returns two hits, both an empty `- []` inside
evidence prose. Neither is a ticked or unticked checkbox, and neither is in a batch file.
So no real continuation line in this repository regresses.

This batch changes the tool the ledger's own fence check runs. The contract's §Validation
requires helpers to be invoked from the integration checkout or an integration worktree —
never from a batch worktree — so that once B03 merges, later fence checks use the fixed
tool rather than silently reinstating the defect.

## Checklist

- [x] Narrow the continuation predicate to exclude a checkbox line
- [x] Add a test: an appended indented unticked checkbox under a `polish:` header is a violation
- [x] Add a test: a wrapped prose continuation under a `polish:` header still passes
- [x] Confirm the first new test fails against the unmodified base, and record the output
- [x] polish: ASK-1 pin the sweep's two literals with sizes written independently of their
      members, so dropping a spelling reddens instead of shrinking both sides together.
- [x] polish: ASK-2 add a tab-after-marker and a two-digit ordered checkbox, killing the
      `[ \t]+` and `\d{1,9}` mutants the gate proved the sweep left alive.
- [x] polish: ASK-3 parse the shown template form with the space indent its real consumer
      accepts, rather than a tab-permitting one.
- [x] polish: ASK-4 say in the batch template that an indented checkbox is a new item and
      not a continuation, so the generic six-line cascade is not the only hint.

## Acceptance criteria

- An appended indented `- [ ] Also rewrite the module into three files.` under a `polish:`
  header is reported as a violation.
- Every wrapped `polish:` continuation form the real ledgers in `.agents/**` contain still
  validates clean — demonstrated against a COPY of an actual ledger batch edit, not a
  synthetic line.
- The `--help` string pinned at `tests/check-fence.test.cjs:222` is unchanged.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
you report DONE.

## Smoke steps (C1)

- **Runner: agent** — run the fixed `check-fence.mjs` over a real ledger batch edit from
  `.agents/changes/**` and confirm zero violations. READ-ONLY on the ledger.
- **Runner: agent** — copy that batch edit into a scratch worktree, append an indented
  checkbox to the COPY, and confirm it is now reported. **Never mutate a file under
  `.agents/**`**: those are historical records, every path there must stay byte-identical
  to base, and this repository's conventions forbid writing to a COMPLETE ledger.
