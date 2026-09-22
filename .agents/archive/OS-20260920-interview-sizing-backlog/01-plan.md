# Plan — OS-20260920-interview-sizing-backlog

Two threads in one change. The first repairs how `/orchestrate new` interviews a user: the
scaffolder currently instructs the orchestrator to merge seven interview topics down into ONE
AskUserQuestion call, which produced compound option labels and rubber-stamped bundles across
all three prior ledgers, and it lists a topic (the wave map) that structurally cannot be asked
where it sits. The second clears `BACKLOG.md`: all ten open entries, BL-008 through BL-017,
with BL-015 excluded as a standing watch by the user’s instruction. The intended outcome is a
scaffolder that asks as many questions as the gaps require and a backlog at zero open defects.

**Orchestration**: this change runs under [00-READBEFORE.md](00-READBEFORE.md) — that
file is the contract; this one only locks scope, waves, and checkpoints.

## Batch table

| # | Batch | Type | Weight | Branch | Wave | Files (fence) | Smoke | Version |
|---|-------|------|--------|--------|------|---------------|-------|---------|
| B01 | Wrapped polish items in the fence tool | fix | M | `fix/bl-011-wrapped-polish` | 1 | `orchestrate/tools/check-fence.mjs`, `orchestrate/templates/02-batch.md`, `tests/check-fence.test.cjs` | C1 | — |
| B02 | Interview sizing rule and the topic-5 move | fix | L | `fix/interview-sizing` | 2 | `orchestrate/references/scaffolding.md`, `orchestrate/SKILL.md`, `tests/interview-sizing.test.cjs` | C1 | — |
| B03 | Leading YAML indicator characters in frontmatter | fix | L | `fix/bl-008-yaml-indicators` | 2 | `tests/agent-definitions.test.cjs` | C1 | — |
| B04 | Name check-attr in the manual fallback | fix | S | `fix/bl-014-check-attr` | 2 | `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `tests/protocol-contract.test.cjs` | C1 | — |
| B05 | A test seam for the unreachable evidence guards | fix | M | `fix/bl-009-evidence-seam` | 2 | `orchestrate/tools/git-evidence.mjs`, `tests/git-contract.test.cjs` | C1 | — |
| B06 | Smoke-page build identity, sidecar coherence and hand-over proofing | fix | L | `fix/bl-012-013-017-smoke-page` | 3 | `orchestrate/tools/build-smoke-page.mjs`, `orchestrate/references/smoke-page.md`, `orchestrate/references/execution-models.md`, `orchestrate/templates/00-READBEFORE.md`, `tests/build-smoke-page.test.cjs`, `tests/smoke-page.test.cjs` | C1 | — |
| B07 | Self-check code spans and honest runner classification | fix | L | `fix/bl-010-016-selfcheck-runners` | 4 | `orchestrate/references/scaffolding.md`, `orchestrate/SKILL.md`, `orchestrate/references/execution-models.md`, `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `orchestrate/templates/02-batch.md`, `tests/protocol-contract.test.cjs` | C1 | — |

## Wave map & checkpoints

- **Wave 1 — B01 alone.** B01 repairs `check-fence.mjs`, the tool every later batch is gated
  by. The contract’s helper paths are repo-relative, so once B01 merges, waves 2–4 are checked
  by the fixed tool. Left until later, BL-011’s 48-violation failure would repeat on six
  batches. Nothing else can safely share this wave, because the point of the wave is that the
  tool is different after it.
- **Wave 2 — B02 + B03 + B04 + B05.** Mutually file-disjoint and mutually independent:
  `{scaffolding.md, SKILL.md, tests/interview-sizing.test.cjs}`,
  `{tests/agent-definitions.test.cjs}`,
  `{protocol.md, templates/00-READBEFORE.md, tests/protocol-contract.test.cjs}`,
  `{git-evidence.mjs, tests/git-contract.test.cjs}`. No member reads another’s output.
  One coupling is known and fenced: `tests/protocol-contract.test.cjs:80-87` builds the
  placeholder set from every `templates/*.md` and the registry rows from `scaffolding.md` and
  compares them. B04 owns that test file; B02 is under an explicit constraint to add or remove
  NO placeholder, changing only the `{{EXECUTION_MODEL}}` row’s third column.
- **Wave 3 — B06 alone.** It needs `templates/00-READBEFORE.md` (contested with B04) and
  `execution-models.md` (contested with B07), because the build-identity gate it enforces is
  specified in one and baked in the other. Enforcement and specification must move together or
  every future scaffolder authors a sidecar the new builder rejects.
- **Wave 4 — B07 alone.** It edits `scaffolding.md` and `SKILL.md` after B02,
  `protocol.md` and `templates/00-READBEFORE.md` after B04, and `execution-models.md` after
  B06. It is last because BL-016’s rule must land in the final text of all five documents.

**C1 — after wave 4, covering B01–B07. The only checkpoint.** Intermediate checkpoints exist
solely for hands-on risk, and this change carries none: every deliverable is a file in this
repository, and after the user dropped the live `/orchestrate new` trial on 2026-09-20 there is
no step needing a device, a GUI, held credentials or a look-and-see judgement. Every C1 step is
`Runner: agent`, pre-verified by the QA runner, and the user is asked for a VERDICT on the
evidence — which is the rule B07 is in this change to write down.

**Forced ordering**: B01 → everything (fence tool); B02 → B07; B04 → B06 → B07
(`templates/00-READBEFORE.md`, then `execution-models.md`).

**User-decision gates**: none outstanding. Every design question this change raised — where
topic 5 goes, what happens to the dirty tree, backlog scope, the stale install, merge policy,
smoke method, gates, dogfooding, weights — was resolved before this scaffold commit and is
recorded verbatim in [00-request.md](00-request.md).

## Smoke-input inventory

**None.** No smoke step in this change depends on an issued file. Every C1 step reads or
executes against the repository at the checkpoint build: the published PowerShell validation
recipe, greps over the edited documents, the real `check-fence.mjs` over a wrapped `polish:`
item, and the real `build-smoke-page.mjs` over sidecars the step constructs in a scratch
directory and discards. Nothing is issued to the user, nothing is reset, no workbook or
fixture is generated, and no private data, credential or external access is required — stated
here rather than left implied, because a missing prerequisite means a step is not pre-verified.

## Backlog fold-ins

**none.** The backlog IS this change’s request, so the scaffolding sweep has nothing separate
to offer: an item cannot be folded into a batch that already exists to fix it. `BACKLOG.md`
itself is orchestrator-owned and in no fence. `bugs-2026-09-17.md` is a dated review record
pinned to `af57139` and stays untouched, per that backlog file’s own preamble.

## Per-batch specifications

### B01 — Wrapped polish items in the fence tool

**Items**: BL-011 · **Wave** 1 · **Weight** M · **Fence**: `orchestrate/tools/check-fence.mjs`, `orchestrate/templates/02-batch.md`, `tests/check-fence.test.cjs`

**Applicable guardrails**: `A hand-rolled parse more permissive than the real consumer’s` · `A mechanical checker that cannot read its own repository’s conventions` · `A defect fixed in the reported instance and left in its sibling` · `A branch no input reaches` · `Line endings`

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

**Acceptance criteria**

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

### B02 — Interview sizing rule and the topic-5 move

**Items**: A1–A8 · **Wave** 2 · **Weight** L · **Fence**: `orchestrate/references/scaffolding.md`, `orchestrate/SKILL.md`, `tests/interview-sizing.test.cjs`

**Applicable guardrails**: `Markdown is source of truth` (surgical edits, no reflow) · `Positive-only assertions on prose` · `Vacuous-until-later documentation` · `Line endings` · `A backlog entry is a pointer, not a specification`

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

**Acceptance criteria**

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

### B03 — Leading YAML indicator characters in frontmatter

**Items**: BL-008 · **Wave** 2 · **Weight** L · **Fence**: `tests/agent-definitions.test.cjs`

**Applicable guardrails**: `A whitelist pinned by sampling` · `A boundary pinned on one side only` · `An assertion satisfied by a neighbouring assertion’s output` · `A branch no input reaches` · `A test that pins the defect`

### BL-008 — verbatim from `BACKLOG.md`

> A leading YAML **indicator character** in an unquoted frontmatter value is accepted and is a
> YAML error: `@`, backtick, `*`, `%`, `[`, `{`, `- `, `?`, `!` all confirmed against PyYAML
> 6.0.3. Same end state as the closed BL-004 — the document does not parse, no definition loads,
> and a "read-only" role inherits the whole tool catalog — but a different family, so it was
> adjudicated out of that batch’s fence by two separate reviewers rather than widening the batch
> mid-round. `tests/agent-definitions.test.cjs` now holds the quote/colon/escape families; this is
> the one remaining gap.

### Codebase facts gathered at planning time

- `tests/agent-definitions.test.cjs:52` `frontmatterField(line)` is the only parser. Its unquoted
  branch (`:104-109`) currently rejects a TAB, a trailing `:` and an inner `: `, and accepts
  everything else.
- The quoted branch (`:65-102`) is complete for the escape family and must not be disturbed.
- Every line reaches the predicate through `frontmatterFields()` at `:112`, so a predicate the
  consumer stopped calling cannot stay green. Keep it that way.
- `FRONTMATTER_CASES` at `:140` is the verdict table; `ESCAPE_MEMBERS` at `:251` and the test at
  `:253` are the model for sweeping a whole domain rather than sampling it.
- None of the four shipped definitions under `.claude/agents/` has a value beginning with an
  indicator character, so this fix reddens nothing that currently ships.
- `tests/subagent-type-mapping.test.cjs:139` reads `.claude/agents/*.md` but not their
  frontmatter values, so it is unaffected — confirmed, and outside this fence regardless.

### What "sweep the whole domain" means here

CLAUDE.md is explicit that two example rejects do not hold a set: *"A whitelist pinned by
sampling … Sweep the whole domain, and write the member list independently of the pattern so a
both-at-once edit is caught by a set-size assertion."* BL-004 — the same parser, the same file —
took three review rounds and three polish passes, which is why this batch is weight L despite
touching one file.

The nine members are `@`, `` ` ``, `*`, `%`, `[`, `{`, `- ` (dash-space), `?` and `!`. Write that
list as data, assert its size, and drive both directions from it: each member REJECTED at the
head of an unquoted value, and a control case proving the same character is fine when it is NOT
leading and when the value is quoted.

### Traps

- `- ` is a two-character member: a leading `-` followed by a space starts a block sequence,
  while `-x` is an ordinary plain scalar. Pin both, or the rule is wrong in one direction.
- `?` and `!` behave the same way — indicator only at the head of the scalar.
- Several of these characters are legal INSIDE a value. A rule that rejects them anywhere would
  reject `description: Runs the a*b case`, which YAML accepts. The boundary must be pinned on
  both sides, per `A boundary pinned on one side only`.
- `assert.deepEqual` APPENDS a custom message to its diff rather than replacing it, so a
  substring check on `err.message` passes on the diff no matter what the message says. When
  asserting the rejection REASON, read the first line alone.

**Acceptance criteria**

- Each of the nine indicator characters, at the head of an unquoted frontmatter value, is rejected
  with a reason naming YAML — and the test derives all nine from a declared member list whose size
  is asserted, so adding a tenth member without a case goes red.
- The same characters in a non-leading position, and in a quoted value, are ACCEPTED. `-x` parses;
  `- x` is rejected.
- The quoted branch’s existing behaviour — escapes, unterminated quotes, content after the closing
  quote — is unchanged, and every existing `FRONTMATTER_CASES` verdict still holds.
- All four definitions under `.claude/agents/` still parse and still yield their exact `tools:`
  lines.
- Failing-on-base: the nine rejection cases FAIL against the unmodified predicate. Name them in
  the implementer report.

### B04 — Name check-attr in the manual fallback

**Items**: BL-014 · **Wave** 2 · **Weight** S · **Fence**: `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `tests/protocol-contract.test.cjs`

**Applicable guardrails**: `Markdown is source of truth` (surgical edits, no reflow) · `Positive-only assertions on prose` · `Vacuous-until-later documentation` · `Line endings` · `A backlog entry is a pointer, not a specification` · `A defect fixed in the reported instance and left in its sibling`

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

**Acceptance criteria**

- The resolved-filter sentence names `git check-attr filter` in both `protocol.md` and
  `templates/00-READBEFORE.md`, and the two §Read-only evidence tools spans remain byte-identical
  after placeholder substitution.
- A test fails if the command is removed from EITHER file — not merely if the two disagree.
- The paragraph is not reflowed: no line in it other than the edited one differs from the base,
  and `git diff --check` is clean.
- Both SHA-256 table pins still hold, and `recipes.length === 7` still holds.
- Failing-on-base: the new assertion FAILS against the unmodified documents. Name it in the report.

### B05 — A test seam for the unreachable evidence guards

**Items**: BL-009 · **Wave** 2 · **Weight** M · **Fence**: `orchestrate/tools/git-evidence.mjs`, `tests/git-contract.test.cjs`

**Applicable guardrails**: `A whitelist pinned by sampling` · `A boundary pinned on one side only` · `An assertion satisfied by a neighbouring assertion’s output` · `A branch no input reaches` · `A test that pins the defect` · `A branch no input reaches`

### BL-009 — verbatim from `BACKLOG.md`

> Two fail-closed guards in `safeResolvedFilters()` (`orchestrate/tools/git-evidence.mjs`) are
> regression-unprotected, because **no fixture can reach them**: a corrupt `.git/index` fails
> BOTH `ls-files` calls, so the index inventory still returns `unknown` and a mutation survives;
> and real Git always emits exactly one `check-attr` record per input line, so the count guard is
> unreachable. Flipping either to `return true` leaves the suite green while making the helper
> report `clean` and then run `git status` — with a driver configured. Production is correct and
> fails closed; the hole is purely in coverage. Closing it needs a seam — export the record
> parser for a unit test, or allow a test to inject a failing probe — which changes a shipped
> tool’s surface and so needs its own batch.

### Codebase facts gathered at planning time

- `safeResolvedFilters()` is `orchestrate/tools/git-evidence.mjs:103`, called once from `:145`.
- The two unreachable guards are at `:110` and `:119` — confirmed by pre-flight against source.
- The live rejection path at `:124` IS reachable and IS covered: `tests/git-contract.test.cjs`
  exercises the `unsafe-filter` diagnostic.
- `tests/protocol-contract.test.cjs:252-263` executes the real `git-evidence.mjs`, and
  `tests/git-contract.test.cjs:159-162` pins the `--help` text verbatim.

### The constraint that shapes the seam

**Do not add CLI surface.** `orchestrate/references/protocol.md:150-156` publishes seven recipes
inside the span that is held byte-identical with `templates/00-READBEFORE.md`, and
`tests/protocol-contract.test.cjs:241` pins `recipes.length === 7`. A new subcommand or flag
would force edits to `protocol.md` and `00-READBEFORE.md` — both B04’s files in this same wave —
and would break that pin. The seam must be an internal export or an injected probe, invisible to
the CLI. The `--help` text must not change.

### What the fix must prove

A mutation of EITHER guard to `return true` must turn the suite red. That is the whole point:
production is already correct, so the deliverable is the test that would catch it becoming
incorrect. Per CLAUDE.md, *"if a mutation of the branch leaves the suite green, the branch is
untested however correct it is."* Demonstrate both mutations in the implementer report.

**Acceptance criteria**

- Mutating either guard at `git-evidence.mjs:110` or `:119` to `return true` turns the suite RED.
  Both mutations are demonstrated in the implementer report.
- Neither the `--help` output nor the set of published recipes changes; `recipes.length === 7`
  still holds and the §Read-only evidence tools mirror is untouched.
- The new tests include a positive control in which the helper proceeds, so the fail-closed
  assertions are not satisfied by a fixture that could never have proceeded anyway.
- The existing reachable `unsafe-filter` coverage is unchanged and green.
- Failing-on-base: the guard tests FAIL against the un-seamed tool (they cannot reach the branch).
  Name them in the implementer report.

### B06 — Smoke-page build identity, sidecar coherence and hand-over proofing

**Items**: BL-012, BL-013, BL-017 · **Wave** 3 · **Weight** L · **Fence**: `orchestrate/tools/build-smoke-page.mjs`, `orchestrate/references/smoke-page.md`, `orchestrate/references/execution-models.md`, `orchestrate/templates/00-READBEFORE.md`, `tests/build-smoke-page.test.cjs`, `tests/smoke-page.test.cjs`

**Applicable guardrails**: `Markdown is source of truth` (surgical edits, no reflow) · `Positive-only assertions on prose` · `Vacuous-until-later documentation` · `Line endings` · `A backlog entry is a pointer, not a specification` · `Hand-over artifacts` · `A step whose output a human cannot reasonably check is not a check`

### BL-012 — verbatim from `BACKLOG.md`

> **The smoke page’s build-identity gate has never worked, on any run.** The page records
> `buildSha` = the build it describes, but committing the page necessarily moves `HEAD` past that
> build, so `git rev-parse HEAD` and `buildSha` can never agree when a tester reads it. Both
> ledgers on this Orchestrate version carry the same hand-written escape hatch ("a later commit
> containing only checkpoint artifacts is allowed"), and `gate.checks` is prose asking a human to
> adjudicate the difference by eye. The one gate whose job is "are you testing the right tree"
> resolves to eyeballing. Fix: put `git merge-base --is-ancestor <buildSha> HEAD` plus
> `git diff --name-only <buildSha>..HEAD \| grep -v '^<ledger-dir>/'` in `gate.commands` where it
> executes, and have `build-smoke-page.mjs` reject a sidecar whose gate carries no containment
> check.

### BL-013 — verbatim from `BACKLOG.md`

> `build-smoke-page.mjs` validates slots, schema and step revisions, but not whether the page’s
> prose is **coherent or runnable**. Three of the five documentation defects in the
> `OS-20260919-backlog-sweep` C1 page were structurally detectable without understanding the
> content: two dangling cross-references (a `Section 5` and a `Step 3` that did not exist after a
> restructure) and an invisible **U+0000** inside a copyable command, which made that command a
> `SyntaxError` for any reader who pasted it. Fix: reject a sidecar carrying a control character
> other than tab or newline, and reject a `Section N` / `Step N` reference the sidecar does not
> contain.

### BL-017 — verbatim from `BACKLOG.md`

> Hand-over artifacts need a proofing pass that the current close-out does not require. In
> `OS-20260919-backlog-sweep`, the QA runner pre-verified a markdown draft; the content was then
> re-authored into the contract-required HTML sidecar and issued **without anyone executing it in
> that form**. A command declared "pre-verified" could not run as published, because it had been
> tested in the shell it was authored in rather than extracted from the rendered page. Fix, as a
> rule in `orchestrate/references/smoke-page.md`: a command in a hand-over artifact is verified
> only when executed in the form the reader receives it — render, read the code block’s
> `textContent`, run exactly those bytes — and author embedded commands with no backslashes and
> no control characters so no transport layer can mangle them.

### Codebase facts gathered at planning time

- `gate.commands` ALREADY EXISTS and already renders at `build-smoke-page.mjs:93`. BL-012’s
  builder work is therefore a VALIDATION rule, not a new field.
- `validate()` is `build-smoke-page.mjs:126-175`. `:127` lists the required keys; `:132` checks
  `buildSha` is a 40- or 64-character hex OID; `:144` requires `gate.checks` to be a non-empty
  array. There is no control-character check and no Section/Step reference check.
- `renderGate()` is `:87-96`.

### The two fences pre-flight added, and why

**`tests/smoke-page.test.cjs` — or this batch reddens a file it cannot touch.** That suite builds
sidecars at `:112` and `:155` with `gate: { checks: [...] }` and NO `gate.commands`, then calls
the real builder at `:114`, `:124`, `:163` and `:180-184`. The moment `validate()` requires a
containment check, both throw.

**`execution-models.md` and `templates/00-READBEFORE.md` — or every future ledger breaks.**
`smoke-page.md:139` says `{{GATE_BODY}}` is the build-identity gate *from* `execution-models.md`;
the spec is `execution-models.md:131-136` (branch / version / canary — no containment check) and
it is baked for every scaffolded ledger at `templates/00-READBEFORE.md:394` and `:405-407`.
Requiring a containment check in the builder while those still describe the old gate would mean
every future scaffolder authors a sidecar the new builder rejects. The spec and the enforcement
must move together.

### Trap, from pre-flight — BL-017 and the QA ordering

`smoke-page.md:271` has the QA runner verify BEFORE the page is built, from `[AGENT-TAGGED
STEPS]` taken "verbatim from the batch files" (`subagent-prompts.md:213-215, 231-237`). BL-017’s
rule inverts that order. Scope the new rule as an ADDED post-render proofing pass — render, read
the code block’s `textContent`, execute exactly those bytes — rather than as a change to when QA
runs. Implemented as an ordering change, it forces `subagent-prompts.md`, which is in NO fence in
this change. If the implementer concludes the rule cannot be written without touching that file,
report `NEEDS_FENCE` rather than widening silently.

### This batch is dogfooded

The user chose to build C1’s own page with the fixed gate (2026-09-20). B06 lands in wave 3,
before C1 is assembled, so the checkpoint page this change hands over must itself carry an
executable containment check. A defect here shows up as a broken hand-over, which is precisely
the test.

**Acceptance criteria**

- A sidecar whose gate carries no containment check is REJECTED by `build-smoke-page.mjs`, with a
  message naming the missing check.
- A sidecar containing a control character other than tab or newline is rejected; one containing
  tabs and newlines only is accepted.
- A `Section N` or `Step N` reference with no matching section or step is rejected; a resolving
  reference is accepted.
- The gate specified in `execution-models.md`, baked in `templates/00-READBEFORE.md` and enforced
  by the builder describe the SAME gate — a sidecar authored from the contract passes the builder.
- `orchestrate/references/smoke-page.md` states that a hand-over command is verified only when
  executed in the form the reader receives it, and requires embedded commands to carry no
  backslashes and no control characters.
- `tests/smoke-page.test.cjs` is green, and its existing assertions still test what they tested
  before — the fixtures gained a containment check, they did not lose coverage.
- Every new rejection rule has a paired positive control.
- Failing-on-base: each of the three rejection tests FAILS against the unmodified builder (it
  accepts all three bad sidecars). Name them in the implementer report.
- `orchestrate/references/subagent-prompts.md` is NOT modified. If the BL-017 rule cannot be
  written without it, the batch reports `NEEDS_FENCE`.

### B07 — Self-check code spans and honest runner classification

**Items**: BL-010, BL-016 · **Wave** 4 · **Weight** L · **Fence**: `orchestrate/references/scaffolding.md`, `orchestrate/SKILL.md`, `orchestrate/references/execution-models.md`, `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `orchestrate/templates/02-batch.md`, `tests/protocol-contract.test.cjs`

**Applicable guardrails**: `Markdown is source of truth` (surgical edits, no reflow) · `Positive-only assertions on prose` · `Vacuous-until-later documentation` · `Line endings` · `A backlog entry is a pointer, not a specification` · `A defect fixed in the reported instance and left in its sibling` · `A mechanical checker that cannot read its own repository’s conventions`

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

**Acceptance criteria**

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

## Coverage audit (planning-time)

| Request item | Source | Batch |
|---|---|---|
| A1 merge arithmetic deleted; back-to-back calls become the default | request | B02 |
| A2 compound option labels banned | request | B02 |
| A3 "confirmations + gaps only" made load-bearing | request | B02 |
| A4 repeat repo collapses the round from the prior contract | request | B02 |
| A5 repeats capped, not questions | request | B02 |
| A6 interview topic 5 moved to procedure step 7 | request ("Move to 7.") | B02 |
| A7 topic numbers 1,2,3,4,6,7 stable; `{{EXECUTION_MODEL}}` row repointed | request | B02 |
| A8 `SKILL.md` agrees | request | B02 |
| BL-008 leading YAML indicator characters | backlog BL-008 | B03 |
| BL-009 unreachable fail-closed guards | backlog BL-009 | B05 |
| BL-010 self-check greps code spans | backlog BL-010 | B07 |
| BL-011 wrapped `polish:` items rejected | backlog BL-011 | B01 |
| BL-012 build-identity gate has never worked | backlog BL-012 | B06 |
| BL-013 sidecar coherence unchecked | backlog BL-013 | B06 |
| BL-014 resolved-filter rule names no command | backlog BL-014 | B04 |
| BL-015 intermittent suite failure | backlog BL-015 | **excluded — watch only, user instruction** |
| BL-016 runner classification | backlog BL-016 | B07 |
| BL-017 hand-over commands verified as published | backlog BL-017 | B06 |

Nineteen items, eighteen assigned, one named exclusion the user signed off on. Zero unassigned.

Pre-flight: 7 blocking fixed, 12 advisory (see LOG.md)
