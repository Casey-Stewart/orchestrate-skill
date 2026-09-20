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

### B02 — gate round 1 (test-hunter), and the class that survived its own fix

**12 findings, 0 needing a production change** — all ASKs — from **67 mutations**. Combined with the
reviewer's 4, the gate verdict is `R1 SHIP @1b5b7f4 asks=16`.

The hunter first confirmed what the orchestrator asked it to check hardest: the whitespace collapse
is real, every removed literal reinserted IN WRAPPED FORM reddens, the verdicts are identical on a
CRLF and an LF checkout, the live controls fire on their own specimens, and no `deepEqual`-message
trap exists. The near-miss was genuinely avoided.

**Then it found the same class alive in one sweep of the same file.** The A2 compound-label sweep at
`:100-102` is the ONE place that reads `read(file)` un-collapsed, and its `/"[^"\n]*"/` cannot cross
a newline. A second compound label on one line reddens; the same label wrapped as
`"Stop at integration +` / `test-hunter"` is GREEN — and ~90-column wrapping is this repository's own
convention, so the wrapped form is the LIKELY one. A batch can fix a class in nine places and
reintroduce it in the tenth, in the same file, in the same commit.

Three other findings are worth the record:

- **The contradiction sweeps miss ordinary English.** A1 keys on `round`, `fits…one…call`, `merg*`.
  "Consolidate all seven topics into a single AskUserQuestion call" is green; so is "Collapse the
  topics into as few calls as possible". Worst, the arithmetic can be REIMPOSED without any banned
  word: "Never exceed four questions in total across the whole interview" is green in both
  documents. A positive-only pin defeated by a paraphrase is the documented class; this is that
  class one level up — the SWEEP defeated by a paraphrase.
- **A3 and A4 have no sweep at all**, while the test's own header comment asserts "Every rule below
  is therefore pinned twice". The documentation of the test overclaims what the test does, which in
  a repository whose product is documents is itself the defect.
- **An assertion that cannot fail**, at `:208`: `assert.ok(cited.length >= topics.length, 'each
  surviving topic must actually be cited somewhere')` where `topics` is `[...new Set(cited.map(…))]`.
  The inequality holds for every possible input, including the empty one.

All sixteen went to polish; none needed a document change, so the pass stays test-only.

### B03 — gate round 1: FIX FIRST, and two gates that agreed by disagreeing

**`R1 FIX FIRST @d8541c2`** — strong-tier reviewer, one P1. Test-hunter: 4 findings, 1 marked
NEEDS-PRODUCTION-CHANGE.

**Both gates independently ran PyYAML 6.0.3 and both confirmed the implementer against the ledger.**
`description: ?Runs a batch` loads fine; `description: ? x` is a ScannerError. The backlog's "all
nine confirmed against PyYAML 6.0.3" is wrong about `?`. Shipping `?` anyway was adjudicated
CORRECT — `?` is a YAML 1.2 `c-indicator` and PyYAML's acceptance of `?x` is a leniency, not a spec
guarantee, the same shape as the `"Closed"#c` row this file already rejects deliberately — and the
code comment was explicitly checked and found NOT to overstate. Three independent agents converged
on a correction to the ledger's own source material.

**The P1 is the sharper finding.** YAML's sequence-entry indicator is `-` followed by a space **or a
line break**. The pattern carries only the space form, and `value` has trailing spaces stripped, so
`description: -` is ACCEPTED by the predicate and is a `ScannerError` in PyYAML — the exact harm
BL-004/BL-008 exist to catch, reached through the one member this batch owns. The reviewer's framing
is what makes it unarguable: the batch rejects `?x`, which YAML ACCEPTS, on reject-on-doubt grounds,
while accepting `-<EOL>`, which YAML REJECTS. Completing the ninth member is not widening the list,
so it is a P1 and not scope creep.

**Where the gates diverged, and how it resolved.** The hunter marked the wider gap family
(`&`, `#`, `|`, `>`, and the reviewer added `,`, `]`, `}`) NEEDS-PRODUCTION-CHANGE, warning that
"leaving it in a subagent report only is how BL-008 itself was nearly lost". The reviewer said the
opposite on disposition: the nine-member fence comes verbatim from BL-008, and widening it mid-round
is precisely what two reviewers adjudicated against when BL-008 was split out of BL-004 — file it,
do not pull it in. Both are right about different things, and the resolution satisfies both: the
family goes to `BACKLOG.md` as its own entry, and the batch gains a declared `KNOWN_GAP` list swept
alongside `INDICATOR_MEMBERS` and asserted ACCEPTED. That records the gap instead of blessing it —
when a later batch fixes a member, the assertion goes red and forces it to move between the two
lists. **Both gates proposed that same `KNOWN_GAP` shape independently**, which is the strongest
signal available that it is the right one.

The hunter's complement demonstration is why it matters: adding six characters to the class —
`&#|>~=` — with `INDICATOR_MEMBERS` untouched leaves the file at 53/53 green. The size assertion's
own message names exactly the edit that survives it.

Its mutation table is the cleanest evidence produced this change: all nine members redden on
one-at-a-time removal; the both-at-once edit is caught by the length assertion; the duplicate trick
is caught by `new Set(...).size`; and moving the reason to line 2 of the message reddens 4 tests,
proving `split('\n')[0]` load-bearing — the BL-004 round-2 trap, tested rather than assumed.

### B04 — polish, and a scoped re-review the contract required

Polish `9bf3b54` closed both ASKs. **It touched production files**, so the mechanical close does not
apply: this contract's §Repo conventions state that markdown under `orchestrate/` is "source, not
prose", which makes `protocol.md` and `templates/00-READBEFORE.md` production files for the purpose
of the polish rule, and a fresh scoped re-review of `6b7897c..HEAD` was spawned rather than closing
on the orchestrator's own reading. The orchestrator warned the implementer of this before the pass,
so the cost was expected and not a surprise finding.

The implementer's own mutation evidence, re-run against the COMMITTED tree: the gate's negation
mutation (`**never**` inserted in both documents) now exits 1 against the clause pin, as does each
single-sided negation, while the mirror and both SHA-256 pins remain blind to all three — which is
precisely the gap ASK-1 named.

**It added an assertion nobody asked for, with a stated reason.** `startsWith` satisfies only half
the *positive-only assertions on prose* guardrail: a contradicting directive placed BESIDE an intact
rule ("Do not run git check-attr yourself.") passes every positive pin. So the polish also sweeps the
manual-fallback section with `assert.doesNotMatch(..., /(?:never|not|avoid|skip)\b[^.;:]*\bgit
check-attr\b/i)`, with its own live control. The `[^.;:]*` class keeps the match inside one clause —
without it the neighbouring "Never execute such filter drivers…" sentence false-positives across the
sentence boundary, which is the sentence ASK-2 had just edited. Unprompted additions are exactly what
a scoped re-review exists to examine, and that is where it went.

**A process lesson the implementer volunteered, worth more than the batch.** Its first mutation round
ran BEFORE committing the ASK-2 edit, and `git checkout HEAD -- <doc>` silently reverted the
uncommitted real edit along with the mutation. It caught this on the next `--numstat`, re-applied,
re-ran the full suite, committed, and re-ran every mutation against the committed tree. Generalised:
**restore-by-checkout is only safe once the real edit is committed** — otherwise the mutation harness
quietly eats the work it was meant to be testing, and every subsequent verdict describes a tree
nobody intended. This is the same family as the `Set-Content` transport defect recorded above: the
apparatus that verifies the work can corrupt the work, and its output looks identical either way.

### B03 — fix round, and the orchestrator's own corroboration

Fix round `5acad5e`, 278/278. The P1 is fixed as specified — the pattern is now
``/^(- |-$|[@`*%[{!?])/`` — and all four dash forms are pinned as rows: `-x` accepted, `- x`, `-`
and `- ` rejected, so a one-sided edit to either dash form reddens.

**The implementer did not take the gates' gap list on trust either.** Asked to determine `KNOWN_GAP`
empirically, it swept every printable-ASCII head against PyYAML 6.0.3 comparing the loaded value with
the input, and reports the gap set is EXACTLY the seven the two gates had named between them —
`#`, `&`, `,`, `>`, `]`, `|`, `}` — and nothing more. Three agents and the orchestrator have now
converged on the same seven characters by four independent routes.

**Orchestrator verification, run directly rather than read from a report.** PyYAML 6.0.3 on this
machine:

```
'description: -'              -> RAISES ScannerError      (the round-1 P1, confirmed)
'description: ?Runs a batch'  -> {'description': '?Runs a batch'}   (the backlog's claim is wrong)
'description: &a x'           -> {'description': 'x'}     (silent anchor drop)
'description: #c'             -> {'description': None}    (silent null)
'description: ~Runs a batch'  -> {'description': '~Runs a batch'}   (valid; must stay accepted)
```

Every claim holds. `~` in particular is the one that could have gone the other way — `~` alone is
YAML's null, so "leading `~` is an indicator" is a plausible-sounding error — and the implementer was
right to exclude it from both lists and to give the sweep a third message branch saying so.

Two structural findings it volunteered are better than the ask. A leading `"` or `'` is rejected by
the QUOTED branch as an unterminated scalar, and YAML rejects it too, so it belongs in neither list:
folding it into `INDICATOR_MEMBERS` would have been a true verdict reached by a false route, and into
`KNOWN_GAP` an outright false claim. It gets a third named bucket, `QUOTE_HEADS`. And a leading space
never reaches `value` at all, because `: +` in the field regex consumes it exactly as YAML treats it
as separation — so that column tests the tail alone, which is correct in both readers, and is
commented rather than silently exempted.

The assertion worth copying elsewhere is `assert.deepEqual(met, { member: 8, gap: 7, quote: 2 })`:
it proves every declared list member is actually REACHED by the sweep. Without it, a list the loop
never meets is a branch no input reaches — a whole list could be silently unswept while every
individual assertion passed. `singles` is eight because `- ` is two characters and is pinned by its
own rows; the 8-vs-9 discrepancy is stated in the assertion rather than left to be rediscovered.

`KNOWN_GAP` asserts that seven characters YAML rejects are ACCEPTED here. That is deliberate: it
records the defect instead of blessing it, and its failure message directs a future fixer to MOVE the
member into `INDICATOR_MEMBERS` — where it gains a rejection case of its own — rather than to delete
an assertion. The round-2 re-review is checking that the move is genuinely all that is needed, since
a design that required deleting an assertion to progress would have failed its own purpose.
