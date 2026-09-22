# B04 — Close the backlog open table (chore, S, —)

**Branch**: `chore/backlog-open-table-closeout` (cut from the integration tip when the wave opens)
**Wave**: 2
**Depends on**: B01, B02, B03
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files**: `BACKLOG.md`, `tests/agent-definitions.test.cjs`
**Spec**: [01-plan.md](01-plan.md) §B04 · **Reviewer pass required**

## Implementation notes

This batch runs in wave 2 because it records what B01, B02 and B03 ACTUALLY did — their
merge SHAs and their final fix shapes — and those are not knowable before they land. Read
the merged commits; do not copy the intentions from this ledger's plan.

Eleven open entries, each accounted for exactly once.

**Move to the Closed table with a merge SHA** (three): BL-021, BL-022, BL-023. BL-022's
resolution line must record that the shipped fix scoped the check to the template rather
than adding the code-span exemption its entry proposed, so a future reader is not sent
looking for an exemption that was never written.

**Close as accepted-with-rationale** (four), one line each:

- BL-018, BL-019 — real mechanism, negligible exposure; both need an adversarial scalar
  hand-written into an agent definition. The existing `KNOWN_GAP` declaration is the
  resolution.
- BL-020 — a coverage gap, not a defect; proof costs a second exported classifier, new
  production surface for a guard already believed correct.
- BL-026 — guard-strength of a guard; its own comment already says so in capitals.

**Move to a new "Noted, no action" section** (four): BL-015, BL-024, BL-025, BL-027, each
with the reason it is not debt. BL-015 gains an explicit close condition — absent from the
next three full runs, it is struck — so it cannot sit open forever.

The existing "Deferred by decision, not defect" section currently reads "(none
currently — ...)". Decide deliberately whether "Noted, no action" is that section renamed
and refilled, or a new one beside it; do not leave two sections that mean the same thing.

**Do not** edit `bugs-2026-09-17.md` (BL-025's subject, off limits by its own terms), any
file under `.agents/**`, or any entry in the Closed table that predates this change.

## Checklist

- [x] BL-021, BL-022, BL-023 moved to Closed with their real merge SHAs
- [x] BL-022's resolution names the shipped fix shape, not the one its entry proposed
- [x] BL-018, BL-019, BL-020, BL-026 closed as accepted, one line of rationale each
- [x] BL-015, BL-024, BL-025, BL-027 in a "Noted, no action" section with reasons
- [x] BL-015 carries an explicit close condition
- [x] The open-items table is empty, or gone with a line saying so
- [x] No duplicate-meaning section left behind
- [x] polish: fence extension to `tests/agent-definitions.test.cjs` — closing BL-019 as
      accepted makes its "that column belongs to a later batch" comment false, so correct
      the comment and carry the digit case into it. Comment accuracy only; no assertion
      and no `KNOWN_GAP` member changes.
- [x] polish: ASK-1 scope BL-019's "and nowhere else" to live source — the fact also sits
      in a COMPLETE ledger's LOG.md, so an agent who verifies the row instead of trusting
      it would read the row as false.
- [x] polish: ASK-2 say "the cases known today" rather than "all three cases" in the
      KNOWN_GAP comment, so the one-character column is not stated as a closed set the
      source record deliberately declined to claim.

## Acceptance criteria

- Every one of the eleven ids appears exactly once in the file after this change.
- No id moved to Closed lacks either a merge SHA or a stated decision.
- `bugs-2026-09-17.md` and every path under `.agents/**` are byte-identical to base.
- The file renders as valid markdown: every table has a header row, and no table is split
  by a blank line.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
you report DONE. Note that `BACKLOG.md` sits inside a test's domain: a sweep in
`tests/interview-sizing.test.cjs` walks from the repository ROOT, so an edit here can
redden a suite you did not open. Re-derive which sweep and which batch introduced it from
git if you need the provenance — do not trust a number quoted in a ledger.

## Smoke steps (C1)

- **Runner: agent** — assert each of the eleven ids occurs exactly once, reporting the
  count rather than the raw hits.
- **Runner: agent** — confirm `git diff --stat` for this batch names `BACKLOG.md` and
  nothing else.
