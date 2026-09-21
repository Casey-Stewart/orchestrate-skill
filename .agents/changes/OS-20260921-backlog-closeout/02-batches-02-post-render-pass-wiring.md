# B02 — Wire the post-render proofing pass into the hand-over (fix, L, —)

**Branch**: `fix/post-render-pass-wiring` (cut from the integration tip when the wave opens)
**Wave**: 1
**Depends on**: none
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files** (the fence — modify NOTHING else): `orchestrate/references/subagent-prompts.md`, `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `tests/protocol-contract.test.cjs`, `tests/subagent-type-mapping.test.cjs`
**Spec**: [01-plan.md](01-plan.md) §B02 · **Reviewer pass required**

## Implementation notes

BACKLOG.md BL-023, verbatim:

> BL-017's post-render proofing pass exists in `orchestrate/references/smoke-page.md` and
> nothing outside that file invokes it. `smoke-page.md` still has the QA runner verify
> BEFORE the page is built, so both passes now exist and only one is wired into the
> hand-over sequence. The orchestrator ran the post-render pass by hand at this change's C1
> rather than leave it unexercised. A rule nothing invokes is vacuous-until-later
> documentation; wire it into `subagent-prompts.md` or the STOP checklist.

Re-verified at scaffold time: the pass is defined in `smoke-page.md:142-157`, the
paragraph beginning **Proof the published artifact — an ADDED pass, after the page is
built**. `post-render|proof` occurs seven times elsewhere under `orchestrate/` and none is
an invocation — ancestry and revert-batch uses of the word in `subagent-prompts.md:311`,
`SKILL.md:68`, `protocol.md:244`, `templates/00-READBEFORE.md:210`, plus
`references/smoke-page-template.html:991-992` and `tools/build-smoke-page.mjs:129`.

### The timing constraint — read this before choosing where to put anything

The existing QA runner is **pre-page by construction**. `subagent-prompts.md:242` reads
"A FAIL becomes a repair mini-batch **before the page is issued**", and `smoke-page.md:302`
repeats "Before the page is issued, the QA runner…". The proofing pass is **post-page**,
and its own definition says it "changes nothing about when the runner runs".

So do **not** extend the existing §QA runner block with post-page duties: that contradicts
two documents and would require re-timing text in `smoke-page.md`, which is fenced to B01.
Add a **separate post-page block** instead. The pre-smoke block keeps its current meaning
untouched.

The user chose BOTH homes, not either:

1. `orchestrate/references/subagent-prompts.md` — a new post-page proofing block, distinct
   from §QA runner (heading around line 206).
2. `orchestrate/references/protocol.md` §checkpoint close-out, the STOP hand-off (the
   sentence ending "STOP with the combined smoke script", around line 640).
3. `orchestrate/templates/00-READBEFORE.md` — the ledger-facing copy of that close-out
   sequence. **Wiring only the skill spec and not the template is the BL-023 defect
   reproducing one level down**: generated ledgers are what a driving session reads, and a
   rule absent from them is invoked by nobody.

### Guardrails specific to this fence

- `tests/protocol-contract.test.cjs` mirrors `protocol.md` against
  `templates/00-READBEFORE.md`: the §Read-only evidence tools sections must be
  byte-identical after placeholder substitution, and two decision tables are pinned by
  SHA-256. Do not edit inside those regions. The STOP hand-off paragraph is NOT part of
  the byte-identical mirror — verified at scaffold time, since the phrase "combined smoke
  script" occurs in `protocol.md` and not in `00-READBEFORE.md` — but confirm this
  yourself before editing, not after.
- `RUNNER_RULE_COUNTS` (around `tests/protocol-contract.test.cjs:495`) pins which five
  files state the `Runner:` default rule and how many times, and asserts the found set has
  exactly five members. Added text must not contain that rule verbatim, or the domain
  assertion reddens. This is BL-027's subject; leaving it green is this batch's job.
- `tests/subagent-type-mapping.test.cjs:25` holds `SKELETONS` — seven headings in document
  order — and asserts `deepEqual` against both the document's prompt blocks (`:112`) and
  its spawn lines (`:117`). A new fenced block opening with `You ` reddens it. The test is
  in this fence precisely so you can extend `SKELETONS` deliberately; every new block also
  needs its `**Spawn with**` line, or the second `deepEqual` fails.
- Positive-only assertions on prose are defeated by appending a sentence. The new guard
  must pin the passage AND scan the rest of each document for a contradicting directive.
- **Do not write the carrier set as a closed list that forbids a fourth member.**
  `orchestrate/references/execution-models.md:133` carries a THIRD close-out sequence
  ending "STOP with the combined smoke script" and is deliberately OUT of this fence this
  round. A `deepEqual` over a hand-written three-file list would freeze the "fixed in the
  reported instance, left in its sibling" defect into a test and make that later fix look
  like a regression. Assert the property — every document that states the close-out
  sequence also names the pass — over a swept domain, so adding the fourth carrier turns
  the test green rather than red.

## Checklist

- [ ] Add a separate post-page proofing block to `subagent-prompts.md`, distinct from §QA runner
- [ ] Give the new block its `**Spawn with**` line and extend `SKELETONS` to match
- [ ] Add the pass to the STOP hand-off in `protocol.md` §checkpoint close-out
- [ ] Add it to the corresponding close-out sequence in `templates/00-READBEFORE.md`
- [ ] Add a guard asserting the property over a swept domain, not a hand-written list
- [ ] Record `execution-models.md:133` as a known un-wired sibling, in the batch's own words
- [ ] Verify `RUNNER_RULE_COUNTS` and both mirror assertions still pass unchanged
- [ ] Confirm the new guard fails against the unmodified base, and record the output

## Acceptance criteria

- A session reading only a generated ledger's `00-READBEFORE.md` learns that the
  post-render pass must run before a checkpoint hand-over.
- An agent spawned from the new post-page block is told to run the pass, and the existing
  pre-smoke QA-runner block's meaning and timing are unchanged.
- The new guard reddens if any wired carrier drops the instruction, and does NOT redden
  when a further document acquires it.
- The mirrored §Read-only evidence tools regions and both SHA-256-pinned tables are
  byte-identical to base.
- `smoke-page.md` is untouched by this batch.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
you report DONE.

## Smoke steps (C1)

- **Runner: agent** — grep the three carrier files for the pass instruction; expect one
  hit in each, and confirm the count against the test's own domain assertion.
- **Runner: agent** — run the full suite and confirm `RUNNER_RULE_COUNTS` and both mirror
  assertions are green.
