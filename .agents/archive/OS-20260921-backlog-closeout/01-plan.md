# Plan — OS-20260921-backlog-closeout (LOCKED at approval)

## Goal

Take `BACKLOG.md`'s open table from eleven entries to zero, where every close is a
DECISION rather than a deferral. Three entries are fixed in code; four are closed as
accepted-with-rationale; four are moved to a new "Noted, no action" section. The
governing constraint, in the user's words, is that the closes "can't spawn children" —
this change must not itself generate a new backlog round.

## Scope (locked)

| # | item | source | batch |
|---|---|---|---|
| 1 | BL-022 — the smoke-page builder rejects a page whose CONTENT contains `{{` | BACKLOG.md | B01 |
| 2 | BL-023 — BL-017's post-render proofing pass exists but nothing invokes it | BACKLOG.md | B02 |
| 3 | BL-021 — `validateBatchEdit` accepts any indented line after a `polish:` header | BACKLOG.md | B03 |
| 4 | BL-018, BL-019, BL-020, BL-026 closed as accepted-with-rationale | user decision 2026-09-21 | B04 |
| 5 | BL-015, BL-024, BL-025, BL-027 moved to "Noted, no action" | user decision 2026-09-21 | B04 |

Explicitly out of scope: repointing the stale `~/.claude/skills/orchestrate` install
(outside this repository, ruled out of scope 2026-09-20); editing `bugs-2026-09-17.md`
(BL-025's subject — a dated point-in-time record, off limits by its own terms); editing
any COMPLETE ledger under `.agents/changes/**` or `.agents/archive/**`.

## Batch table

| # | title | type | weight | branch | wave | depends on | files (the fence) |
|---|---|---|---|---|---|---|---|
| B01 | Scope the smoke-page self-check to the template | fix | M | `fix/smoke-page-selfcheck-scope` | 1 | none | `orchestrate/tools/build-smoke-page.mjs`, `orchestrate/references/smoke-page.md`, `tests/build-smoke-page.test.cjs`, `tests/smoke-page.test.cjs` |
| B02 | Wire the post-render proofing pass into the hand-over | fix | L | `fix/post-render-pass-wiring` | 1 | none | `orchestrate/references/subagent-prompts.md`, `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `tests/protocol-contract.test.cjs`, `tests/subagent-type-mapping.test.cjs` |
| B03 | Narrow the polish continuation scan | fix | S | `fix/polish-continuation-checkbox` | 1 | none | `orchestrate/tools/check-fence.mjs`, `tests/check-fence.test.cjs` |
| B04 | Close the backlog open table | chore | S | `chore/backlog-open-table-closeout` | 2 | B01, B02, B03 | `BACKLOG.md` |

### Fence disjointness (wave 1)

Computed literally, and re-checked at pre-flight after both fences widened.
B01 ∩ B02 = ∅; B01 ∩ B03 = ∅; B02 ∩ B03 = ∅.

The one file both B01 and B02 have a claim on is `orchestrate/references/smoke-page.md`:
it holds the self-check paragraph B01 edits AND the definition of the proofing pass B02
wires in. It is fenced to **B01 only**. B02 makes other documents INVOKE the pass; it
does not restate, move or re-time the pass's own text, so it needs no edit there — which
holds only because B02 adds a separate post-page block rather than extending the
pre-smoke one (see §B02). If B02's implementer concludes a back-reference in
`smoke-page.md` is unavoidable, that is a `NEEDS_FENCE` stop, not a silent edit.

Two known cross-fence seams, declared rather than discovered:

- `tests/protocol-contract.test.cjs` is in **B02's** fence, and its BL-026 default-human
  contradiction sweep runs over every shipped skill file — including the
  `smoke-page.md` that **B01** edits. Low probability, but if B01's wording trips it,
  that is a `NEEDS_FENCE` stop for B01, not a cross-fence edit.
- `orchestrate/references/execution-models.md:133` carries a THIRD close-out sequence
  ending "STOP with the combined smoke script". It is deliberately OUT of B02's fence
  this round: B02's carrier-set assertion must therefore be written to permit a future
  fourth carrier rather than to forbid one, or it freezes the "fixed in the reported
  instance, left in its sibling" defect into a test.

## Wave map

- **Wave 1**: B01 + B02 + B03 concurrently. Fences are disjoint (above) and no batch
  reads another's output.
- **Wave 2**: B04 alone. It records the real outcome of the other three — their merge
  SHAs and what the fixes actually turned out to be — so it cannot run before they land.
- **Checkpoint C1**: after wave 2. The mandatory final checkpoint, and the only one.

### Why one checkpoint

No batch in this change is hands-on. Nothing here touches a device, a GUI, held
credentials, live data or a look-and-see judgement: every deliverable is a file edit
whose effect a Node test or a `git`/`grep` command reports. Per the rule this repository
adopted at BL-016, that makes every C1 smoke step `Runner: agent`, executed by the QA
runner, with the user asked for a VERDICT rather than for labour.

## Per-batch specification

### B01 — Scope the smoke-page self-check to the template (BL-022)

`buildSmokePage` in `orchestrate/tools/build-smoke-page.mjs` fills the template's
`{{[A-Z_]+}}` slots from `renderSlots(data)` — user content — and only then runs
`if (out.includes("{{")) throw`. Because the scan runs over the FILLED output, content
legitimately containing `{{` aborts the build: a smoke step whose Do command is
`echo ${{ github.sha }}` or any Handlebars/Jinja/Vue expression cannot be published.

The residual scan exists to catch slots the `[A-Z_]+` regex could not match —
`{{lowercase}}`, `{{ SPACED }}`, `{{MALFORMED-NAME}}`. Those are TEMPLATE defects and
can never originate in content. Scoping the scan to the template therefore keeps every
defect it was built to catch and stops rejecting valid content.

Decision (user, 2026-09-21): scope the check to the template. The alternative shapes —
an HTML-aware code-span exemption over the output, or leaving it strict and closing
BL-022 as accepted — were both offered and declined.

**A test pins the DEFECT.** `tests/build-smoke-page.test.cjs:54` asserts
`build().includes('{{') === false` over the filled OUTPUT — it encodes the old, wrong
meaning of correct, and it will redden when the fix lands. That is this repository's
named "a test that pins the defect" class: the batch must change it deliberately, not
discover it. The new guard must fail against the unmodified base.

### B02 — Wire the post-render proofing pass into the hand-over (BL-023)

BL-017's post-render pass is defined at `orchestrate/references/smoke-page.md:142-157`
("Proof the published artifact — an ADDED pass, after the page is built"). Nothing
outside that file invokes it. Verified at pre-flight: `post-render|proof` occurs seven
times elsewhere under `orchestrate/`, none of them an invocation — ancestry and
revert-batch uses of the word "proof" in `subagent-prompts.md:311`, `SKILL.md:68`,
`protocol.md:244`, `templates/00-READBEFORE.md:210`, plus
`references/smoke-page-template.html:991-992` and `tools/build-smoke-page.mjs:129`. The
orchestrator ran the pass by hand at the last change's C1 precisely because nothing made
it fire.

**Timing constraint discovered at pre-flight — this shapes the batch.** The existing QA
runner is PRE-page by construction: `subagent-prompts.md:242` reads "A FAIL becomes a
repair mini-batch before the page is issued", and `smoke-page.md:302` repeats "Before the
page is issued, the QA runner…". The proofing pass is POST-page, and its own definition
says it "changes nothing about when the runner runs". So B02 must add a SEPARATE
post-page block rather than extend the pre-smoke one — extending it would contradict
both documents and would require an edit to `smoke-page.md`, which is fenced to B01.

Decision (user, 2026-09-21): wire it in BOTH places — the QA runner's prompt, so the
agent best placed to execute it is told to, and the orchestrator's STOP hand-off, so a
checkpoint cannot be handed over without it.

- `orchestrate/references/subagent-prompts.md` §QA runner (from line 206).
- `orchestrate/references/protocol.md` §checkpoint close-out STOP hand-off (line 640).
- `orchestrate/templates/00-READBEFORE.md` — the ledger-facing copy of that sequence.
  Omitting this file is the BL-023 defect reproducing: a rule wired only into the skill
  spec never reaches the ledgers that are actually driven.

### B03 — Narrow the polish continuation scan (BL-021)

`validateBatchEdit` in `orchestrate/tools/check-fence.mjs:93` consumes ANY indented
non-blank line after a `polish:` header (`/^ +\S/`), so an appended
`  - [ ] Also rewrite the module into three files.` clears the mechanical gate.
Narrowing to `/^ +(?!- \[[ x]\])\S/` excludes a checkbox continuation while leaving
every real continuation line in `.agents/**` satisfied.

Verified against the checkout: no file under `.agents/**` or `orchestrate/templates/`
contains an indented checkbox continuation. The only two `^ +- \[` hits repo-wide are
`- []` inside evidence prose, which is neither `- [ ]` nor `- [x]` and is not in a
batch file.

### B04 — Close the backlog open table (bookkeeping)

Fixed and recorded closed with their merge SHAs: BL-021, BL-022, BL-023.

Closed as accepted-with-rationale, one line each:

- **BL-018 / BL-019** — real mechanism, negligible exposure. Both require someone to
  write an adversarial scalar (`tools: ~`, `description: &a x`) into an agent
  definition. Nothing in the repo does; the files are authored once. The `KNOWN_GAP`
  declaration that already documents them IS the resolution.
- **BL-020** — a coverage gap, not a defect. Buying proof costs a second exported
  classifier, which is new production surface for a guard already believed correct.
- **BL-026** — guard-strength of a guard, two levels removed from anything a user of
  the skill experiences, and its own comment already says in capitals what it is.

Moved to a new "Noted, no action" section, with the reason each is not debt:

- **BL-015** — an unreproduced intermittent. Gains an explicit close condition (absent
  from the next three full runs → struck) so it cannot sit open indefinitely.
- **BL-024** — frozen records, correctly untouched; a note so a future re-issue is not
  a surprise.
- **BL-025** — its subject is off limits by its own terms; annotating it would destroy
  the point-in-time property that makes it useful.
- **BL-027** — a forward-looking instruction to a future batch, not a defect.

## Coverage audit

Every request item maps to exactly one batch: items 1→B01, 2→B02, 3→B03, 4 and 5→B04.
No batch carries an item absent from the request. Eleven open entries are accounted for
exactly once: three fixed (B01, B02, B03), four accepted-closed (B04), four noted (B04).

**Pre-flight verdict**: `4 BLOCKING, 10 ADVISORY` on the first draft — all four blocking
findings and every advisory resolved into this plan and the batch files before it went to
the user. Detail in [LOG.md](LOG.md) §pre-flight. The four blocking findings were: the QA
runner's pre-page timing contradicting B02's wiring target; `tests/subagent-type-mapping.test.cjs`
missing from B02's fence; `tests/smoke-page.test.cjs` missing from B01's fence; and a B03
smoke step that would have mutated a real ledger under `.agents/**`.
