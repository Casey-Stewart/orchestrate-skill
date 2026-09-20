# Log — OS-20260920-interview-sizing-backlog

Append-only narrative for this change: reviewer arcs, root causes, reconciliations,
fence-extension reasoning, pre-smoke findings, in-run learnings. Written ONLY by the
orchestrator, ONLY on the integration branch, in the same commits as PROGRESS. Never read
at boot — a PROGRESS Notes cell or session-log row names the heading to read. One `##`
heading per session (date), one `###` per batch or event. Never edit an earlier entry.

## Learnings

- **The 4-question cap was the tool’s schema, not a policy.** Two sessions could have been spent
  hunting for the rule that "set" it. When a limit looks arbitrary, check the tool definition
  before the documentation.
- **A pre-flight that only reads the plan finds nothing.** Every one of this change’s seven
  blocking findings came from grepping the repository for consumers the plan had not named.

## 2026-09-20 — scaffold

### Pre-flight: 7 blocking findings, all resolved before approval

One fresh read-only sub-agent audited the draft plan against the repository. It independently
re-ran the baseline (`260 pass, 0 fail`) and returned **NOT READY**. Each finding and its
resolution:

1. **`tests/smoke-page.test.cjs` was in no fence.** It builds sidecars at `:112` and `:155` with
   `gate.checks` and no `gate.commands`, then calls the real builder. BL-012’s rejection rule
   would redden it from outside every fence. → Added to B06.
2. **The gate BL-012 redefines is specified in two files B06 could not touch.**
   `smoke-page.md:139` defers to `execution-models.md:131-136`, and the spec is baked for every
   ledger at `templates/00-READBEFORE.md:394,405-407`. Requiring a containment check in the
   builder while both still describe branch+version+canary would make every future scaffolder
   author a sidecar the new builder rejects. → Both added to B06, which forced B06 into a wave of
   its own and pushed B04 and B07 apart.
3. **BL-016 understated its file set by three.** Live "default human" statements also sit at
   `protocol.md:371`, `templates/00-READBEFORE.md:368` and `templates/02-batch.md:52`. The last
   two decide what a driving session and a planner actually read, so a rule landing only in the
   reference docs never reaches a ledger. → B07 widened from four files to seven.
4. **BL-014 had no criterion that fails on base.** The only assertion over that span compares the
   two mirrors to each other — green before the edit, green after, and green again if a later
   batch deletes the command. → `tests/protocol-contract.test.cjs` added to B04.
5. **The single human smoke step could not reach the change.** `README.md:122` documents the
   install as a junction to the MAIN checkout while the change stops at the integration branch,
   and the installed copy is in fact a stale August duplicate with no `tools/` directory. The
   checkpoint’s one human step would have exercised code that is not under test. → Re-asked; the
   user dropped the live trial and C1 became fully agent-run.
6. **Wave 1 was not wave-safe in the sense claimed.** Four of the six original members are
   asserted by `tests/protocol-contract.test.cjs`, which none of them owned; `:80-87` builds the
   placeholder set from every `templates/*.md` and the registry rows from `scaffolding.md` and
   compares them, so three batches fed one assertion that could only go red at the tip. → The
   wave map was rebuilt; B04 owns that test file, and B02 carries an explicit constraint never to
   add or remove a `{{PLACEHOLDER}}`, only to change the `{{EXECUTION_MODEL}}` row’s third column.
7. **The tools this change fixes are read from the current checkout.** Every batch would have
   been gated by the UNFIXED `check-fence.mjs:92` — the exact 48-violation failure that put
   BL-011 in the backlog — six times over, and the "dogfood BL-012" decision would have been
   false unless the builder ran from the integration tree. → B01 (BL-011) now runs ALONE in wave
   1, and the contract’s §Validation commands states where the helpers must be invoked from.

### Advisory findings carried into the batch files

Twelve advisory findings were recorded; the load-bearing ones are written into the batch files as
named traps rather than left here: the `recipes.length === 7` pin that forbids B05 adding CLI
surface; the `residualGrep` at `protocol-contract.test.cjs:157` that admits no `.` or `;` inside
its clause, constraining how BL-010’s exemption may be worded; the requirement that B01’s wrapped-
polish example stay INSIDE `02-batch.md`’s instruction comment so it does not ship live into every
scaffolded ledger; the risk that BL-017 reaches `subagent-prompts.md` if implemented as an ordering
change rather than an added post-render pass; and the observation that A2–A5 are pure additions,
defeated by an appended sentence, so each needs a positive pin AND a contradiction sweep.

Pre-flight also raised B03 from M to L: BL-004 was the same parser in the same file and took three
review rounds and three polish passes.

### Wave-map reasoning beyond the plan’s one-liners

Four waves rather than two is the price of five documents being contested.
`templates/00-READBEFORE.md` is wanted by B04 (the mirrored filter sentence), B06 (the gate spec)
and B07 (a `Runner:` default); `execution-models.md` by B06 and B07; `scaffolding.md` and
`SKILL.md` by B02 and B07. Rather than merge those into one enormous batch, the fences stay
narrow and the waves stay short. Concurrency survives where it is real: W2 runs four genuinely
independent batches.

### Environment facts verified at scaffold time

Node v22.22.3; git with `origin` at `https://github.com/Casey-Stewart/orchestrate-skill.git`;
baseline `260 pass, 0 fail` at `efc4eec`; working tree clean after the user-ordered
`git restore` of the hand-applied BL-014 edit; `.claude/agents/` holds all four definitions,
so the `test-hunter` gate is available to this ledger, unlike the ledger that created it.

## 2026-09-20 — wave 1

### B01 — gate round 1

**`R1 SHIP @d0d3fcf asks=6`** — reviewer `SHIP` (default tier, M weight) with 2 ASKs, test-hunter
`4 findings, 0 needing a production change` (all therefore ASKs). No P0, no P1, no round spent.

Mechanical gates first. **6a fence check** returned `PASS` from the integration checkout with
`violations: []` and `unknowns: []` — exactly the three fenced paths plus ticks-only edits to the
batch file, every worktree clean. **6b failing-on-base** was run by the orchestrator, not taken on
the implementer's word: the batch's `tests/check-fence.test.cjs` checked out byte-accurately over
the unfixed base `0d1f8b7` reports **84 tests / 81 pass / 3 fail** — `wrapped ticked and unticked
items`, `wrapped item then an unrelated appended line`, and their parent. A first attempt to stage
that file through a PowerShell pipeline (`Set-Content -NoNewline`) collapsed it to one line and
produced a `SyntaxError`, a transport defect in the gate rather than a result; `git checkout
<branch> -- <path>` is the byte-accurate form and is what the recorded run used.

The reviewer went past its brief in the way this repository keeps rewarding: rather than trusting
the synthetic fixtures, it ran the **base** tool over the two real ledger files that put BL-011 in
the backlog — `OS-20260919-backlog-sweep/02-batches-01-*.md` gives **49** `batch-content`
violations on base and **0** on the fix, and `OS-20260919-agent-tool-restrictions/02-batches-01-*.md`
gives **70** → **0**. The fix resolves the REPORTED instance, not a lookalike. It also confirmed
`check-fence.mjs:93` is the only mechanical parser of `polish:` lines anywhere in `orchestrate/`
or `tests/` — the sibling-instance guardrail has no second instance to fix here.

Both gates independently mutated the shipped line and agreed the four new subtests each kill a
distinct mutant: dropping the `headed` state reddens BOTH negatives, widening `/^ +\S/` to column 0
reddens the unrelated-line case, and reverting to the base scan reddens the two positives. The two
negatives that pass on base AND after the fix are therefore a genuine both-sides boundary pin, not
the vacuous pair they superficially resemble — the question the hunter was spawned to settle.

### B01 — the six ASKs, and the one that is not a polish item

Test-hunter, all TEST-ONLY:

- **F1** — the indent boundary is pinned only against column 0. Every fixture uses exactly six
  leading spaces, so `/^ {3,}\S/`, `/^ {6}\S/` and `/^\s+\S/` each survive 84/84. Probing the
  shipped function directly, a tab-indented continuation is REJECTED and a one-space continuation
  is ACCEPTED — neither verdict is asserted anywhere.
- **F2** — *a branch no input reaches*, on the exact expression this batch rewrote: no fixture
  reaches the positional guard `if (i === polishAt)`. Mutating it to `if (i >= 0)` leaves the file
  84/84, and no other test in the repository contains a `polish:` line. On a wrapped polish item
  smuggled into the `## Acceptance` section the real function returns three `batch-content`
  diagnostics and the mutant returns none.
- **F3** — the header's non-empty-ask requirement is unpinned: `polish: .+$` → `polish: .*$`
  survives 84/84.
- **F4** (= reviewer ASK 1, the two gates converging) — the batch's third acceptance criterion is
  asserted by NOTHING. `protocol-contract.test.cjs:208-209` REPLACES the whole `<!-- - [ ] one box
  … -->` comment before rendering, so anything added inside it is invisible to the suite by
  construction. Restoring `02-batch.md` to its base blob — deleting the example outright — left
  65/65 green. This is precisely the BL-002/BL-011 class the batch exists to close, reproducing
  inside the batch that closes it.

**Reviewer ASK 2 is NOT sent to polish.** After a polish header the new grammar consumes any
indented non-blank line, so an appended `  - [ ] Also rewrite the module into three files.` under a
polish item clears the mechanical gate (a violation on base). The reviewer verified it and
deliberately did not block: in markdown an indented block under a list item IS part of that item,
and the tool's own banner says it does not replace semantic hunk mapping — which is the gate that
actually catches sneaked work. Tightening it is a PRODUCTION behaviour change, and the contract is
explicit that an ASK never licenses one. It is recorded here as a residual for the close-out
backlog, with the reviewer's own minimal fix (`&& !/^ +- \[[ x]\] /.test(...)`), which every real
continuation line in `.agents/changes/**` and `.agents/archive/**` still satisfies.

Polish therefore carries F1–F4 only — all in `tests/check-fence.test.cjs`, no production file
touched, so the pass closes mechanically without a scoped re-review.

### B01 — polish, integration, and BL-011 closing on itself

Polish `7e9dad8` closed F1–F4 in `tests/check-fence.test.cjs` alone; `check-fence.mjs` and
`02-batch.md` are byte-identical to `d0d3fcf`, so the pass closed mechanically with no scoped
re-review. Each finding now kills its mutant: F1 by a one-space continuation ACCEPTED and a
tab-indented one REJECTED (the two fixtures differ in exactly one character, so the verdict cannot
be attributed to line-count skew); F2 by a wrapped item appended past `polishAt` into
`## Acceptance`, which the real function rejects at `[14,15]` and an always-true guard consumes;
F3 by a header with a trailing space and an empty ask; F4 by reading the template with `fs` and
feeding its extracted bytes through the real `validateBatchEdit`.

**The implementer corrected the ASK's own premise on F3** — the bare `- [ ] polish:` case the
orchestrator relayed does NOT kill `.+` → `.*`, because the mutation keeps the literal space in
`polish: `, so a header without that space is rejected either way; it measured that mutant
surviving 12/12. The distinguishing input is `- [ ] polish: ` WITH the space and an empty ask.
Both spellings are now asserted. A gate finding is a pointer, not a specification — the same
lesson the contract already records for backlog entries, arriving this time from the other side.

It also reported a hazard worth keeping: `String.prototype.replace` performs `$`-substitution on a
string replacement, and `` $` `` inserts the entire preceding text. Appending the polish items with
a `.replace()` whose replacement contained a `$`-bearing regex literal duplicated 183 lines of the
batch file. Reverted with `git checkout`, redone by index slicing; every fixture edit in the test
file now uses a function replacer plus an `assert.notEqual(text, f.batchText)` guard, so a silently
no-op fixture edit cannot masquerade as a pass.

**BL-011 closed on itself, which is the part worth remembering.** Run from the integration checkout
— which still held the UNFIXED tool — 6a on the polished tip returned `VIOLATION`, tripping on
B01's own four wrapped `polish:` items. The fixed copy in the batch worktree returned `PASS`, 0
violations, 0 unknowns, and the manual fallback confirmed the batch-file diff is pure appends of
ticked polish items with no other line touched. That is the defect reproducing one final time on
the batch that repairs it, and the concrete vindication of the pre-flight finding that put B01
alone in wave 1: every later batch is now gated by a tool that can read this repository's own
authoring convention.

Dry run clean → merged `--no-ff` → **`6253432`**; tip validation **272 pass / 0 fail** (base 260 +
12 new), `git diff --check` exit 0.

### Environment notes, not plan deviations

Worktrees live at `%TEMP%\wt920\<batch>` rather than under the session scratchpad: the scratchpad
prefix plus this repo's 146-character deepest tracked path exceeds Windows' 260-character limit —
the same trap both previous ledgers hit. `git worktree remove` leaves a stale `.git/worktrees/<id>`
admin directory behind with `Permission denied` on this machine; the entries are absent from
`git worktree list`, so reconcile does not see them and nothing is blocked.

A gate transport defect, recorded because it nearly produced a false result: staging a file through
a PowerShell pipeline with `Set-Content -NoNewline` collapsed `tests/check-fence.test.cjs` to a
single line and yielded a `SyntaxError: Unexpected end of input`. Read naively that is "the batch's
tests do not even load on base" — a fabricated failing-on-base pass. `git checkout <branch> -- <path>`
is the byte-accurate form. Verified means verified through a transport that does not mangle.

## 2026-09-20 — wave 2

Opened with all four members cut from wave base **`37219cd`**: B02 `fix/interview-sizing`,
B03 `fix/bl-008-yaml-indicators`, B04 `fix/bl-014-check-attr`, B05 `fix/bl-009-evidence-seam`.
Four worktrees under `%TEMP%\wt920\b0*`, per-worktree setup n/a. The fences were planned mutually
disjoint and no member reads another's output; this is the wave the plan's concurrency was approved
for. Every member is gated by the tool B01 just repaired.

### B02 — gate round 1 (reviewer)

**`R1 SHIP @1b5b7f4 asks=4`** from the strong tier. No P0, no P1. Validation 282/282 on the worktree.

**The near-miss the orchestrator checked for, and the implementer had already avoided.** The phrase
A1 must delete WRAPS in the real file — `…only merged down to its 4-question` / `cap — 1+3 …`. A
naive single-line search for `merged down to its 4-question cap` returns ZERO on the UN-FIXED base,
so an absence assertion over raw text would have passed before the fix and after it: an assertion
that cannot fail, in the batch whose entire product is prose assertions. The test collapses
whitespace first (`collapse = text.replace(/\s+/g,' ')`), and the reviewer confirmed each of the
six literals fires on the collapsed base. Failing-on-base, run independently by the orchestrator
with only the two documents reverted: **10 tests, 0 pass, 10 fail**, each for its own reason.

The reviewer swept for surviving contradictions by hand as well as by the test and found none in
`orchestrate/`, and verified the placeholder set is byte-identical to base — the B04 coupling the
plan feared cannot fire. It also judged the behaviour question directly: the new sentences are
imperative, and all three entry points (procedure step 2, the section heading, `SKILL.md:175`)
now carry the same rule, so a reader who stops at any one of them gets it.

Its honest note on the trade-off, recorded because it is the user's decision to have made: with
the arithmetic gone and only topic scope bounding the count, four to five calls is now a normal
run. That is the behaviour change the user asked for, not a defect.

### B04 — gate round 1 (combined reviewer + hunter, S weight)

**`R1 SHIP @6b7897c asks=2`**. No P0, no P1. Validation 273/273. Fence PASS; failing-on-base
confirmed independently by the orchestrator (8 tests, 7 pass, 1 fail, the named assertion).

Fifteen mutations, each run in a uniquely-named temp path. Thirteen were caught, including the
three that matter: the command appended as an unrelated trailing sentence still REDDENS (the pin
is genuinely positional, not "the string appears somewhere"), and single-sided removal from
EITHER document reddens with that document's own label — the criterion the existing mirror test
could not hold, since it only compares the two halves to each other.

**Two mutations came back GREEN, and one of them is a real residual.** Mutation 14 rewrote the rule
in BOTH documents to `Before status, **never** run git check-attr filter on the paths status
inspects:` — and the new test, the mirror and both SHA pins all stayed green. The assertion pins
the command's PRESENCE in the rule, not its imperative, so a future batch could inscribe the exact
opposite of what the production probe does and nothing would notice. That is
*positive-only assertions on prose* surviving inside the fix for it. It is non-blocking — before
this batch the sentence had no pin at all — but it is exactly the class this repository keeps
producing, so it goes to polish rather than to the backlog.

The reviewer also flagged, and the orchestrator accepts, that naming the command `git check-attr
filter` two sentences before "Never execute such filters to obtain a clean result" lets a human
skimming the fallback bind "such filters" to the probe and skip it — in the batch whose whole
purpose is giving that human the command. One word ("such filter drivers") disambiguates inside
the existing line with no reflow.

**Declined on contract grounds.** The reviewer routed an out-of-fence item: `bugs-2026-09-17.md:95-100`
carries an `ASK-3 — Interview batching math doesn't add up` entry quoting the merge arithmetic B02
just deleted, and by repo convention would want a `— FIXED` marker. The ledger contract states that
file is "a dated point-in-time review record pinned to commit `af57139` and is off limits to every
batch". A point-in-time record is not made wrong by later work; annotating it would make it no
longer point-in-time. Recorded as a close-out residual for the user, not actioned.
