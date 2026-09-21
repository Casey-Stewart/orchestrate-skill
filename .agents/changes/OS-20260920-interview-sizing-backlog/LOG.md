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

### B02 — polish and integration

Polish `accc2dc`, **verified test-only by the orchestrator rather than taken on report**:
`git diff --stat 1b5b7f4 accc2dc -- orchestrate/` is empty, so both documents are byte-identical to
the gated commit and the pass closed mechanically with no scoped re-review. Fence PASS on the
polished tip. Merged `--no-ff` → **`9ad30d9`**; tip validation **285 pass / 0 fail**, `git diff
--check` exit 0.

All 25 named mutations now behave, including every one the hunter had found green: the wrapped
compound label, the `and`-joined label, the numeric-budget reimposition in both documents, the A3
and A4 contradictions that had no sweep at all, the A5 close-out paraphrases, the revived directives
in `templates/00-READBEFORE.md`, `protocol.md` and `execution-models.md`, and the `interview #5`
citations in `.html`, `.ps1` and `.txt`. The innocent `"plan + wave map"` quotation outside the
interview section is green by design now that the label scan is scoped to that section.

**Failing-on-base is 11 of 13, not 13 of 13, and the two that pass are correct.** They are the
harness controls — `every contradiction pattern can still fire on the directive it was written to
catch` and `the compound-label scan catches both banned forms, wrapped or inline` — which assert on
their own synthetic specimens and contain no document pin. A control that passed on base is doing
its job; a control that FAILED on base would mean the harness itself was broken. Worth recording
because "every assertion must fail on base" is the rule of thumb, and this is the principled
exception to it.

Two things the implementer reported that the ask did not anticipate. Two contradiction patterns
needed a tempered gap `(?:(?!\bnever\b)[^.])`, because this document states its own rules in the
negative — "never ask what detection already answered" — and an untempered sweep fired on the
PROHIBITION ITSELF, which would have forced a document edit the polish was forbidden to make. And
placeholder names are neutralised before sweeping, since `{{MERGE_POLICY}}` is an identifier, not an
instruction to merge. Both exclusions are commented where they are made.

**The batch prompt was wrong about a count, and the implementer checked.** It said fifteen registry
rows cite an interview topic; there are **sixteen** — `{{MUTATION_RUNNER}}` cites "confirmed in
interview #1" mid-cell rather than at the cell head, so a head-anchored grep misses it. All sixteen
are now pinned and the count asserted. The planning session wrote that number from its own grep;
this is the third time this change that a figure baked into the ledger has been corrected by the
agent asked to act on it.

### B04 — scoped re-review: SHIP, and a correction to this log

The scoped re-review of `6b7897c..HEAD` returned **SHIP**, no P0, no P1. It confirmed the polish is
documentation-only where the documents are concerned: one changed line in each mirror, identical,
`Never execute such filters to` → `Never execute such filter drivers to`, 78→86 columns and so
inside the ~90 wrap with the surrounding lines byte-identical. It recomputed both table hashes
independently, re-verified the mirror byte-identity, the placeholder set across all three commits,
`recipes.length === 7`, and full CRLF.

Seventeen mutations. The one that matters: **mutation C — negating the rule in BOTH documents — now
REDDENS against the clause pin while the mirror and both SHA-256 pins stay GREEN.** That is the
round-1 escape closed, demonstrated rather than asserted. The added sweep's live control fires, and
it operates on COLLAPSED text, so it does not carry the wrapped-line defect its sibling B02 shipped
in the same wave.

**Correction to the entry above, which recorded the implementer's account.** The `[^.;:]*` narrowing
IS load-bearing — an unnarrowed `.*` matches today — but not for the reason given. The false
positive is `do not probe their trees` at `protocol.md:193`, which PRECEDES the only `git check-attr`
occurrence; the `Never execute such filter drivers…` sentence the implementer named sits AFTER it
and cannot match a left-to-right negation→command pattern at all. Recorded here rather than silently
amended above, because the earlier entry is the record of what was believed at the time.

Three residual ASKs, all comments rather than behaviour: the sweep is polarity-blind and reddens on
sentences that STRENGTHEN the rule (`Never skip git check-attr filter.`); it misses contradictions
phrased without its four verbs or with the negation after the command; and its scope is the fallback
subsection, not the document. All three are honest-labelling fixes to one comment block, sent as a
second, comment-only polish. A narrow sweep honestly labelled is worth more than a broad one
silently trusted.

### B03 — round 2: SHIP, and the third instance of one class

**`R2 SHIP @5acad5e`**. The P1 and both round-1 ASKs are **FIX VERIFIED**. Validation 278/278.

The re-reviewer re-derived rather than re-read. It ran its own PyYAML 6.0.3 sweep over all 95
printable-ASCII heads and diffed it against the extracted predicate: the set the predicate accepts
where YAML disagrees is EXACTLY the declared `KNOWN_GAP`, nothing more and nothing missing, with the
failure-mode comment matching character for character. `~Runs a batch` loads as `'~Runs a batch'`,
so "reads exactly as written" is accurate for the string the sweep actually builds. `QUOTE_HEADS`
hides no acceptance — both quotes raise in PyYAML and the quoted branch rejects them.

**The `KNOWN_GAP` design was tested against its own purpose, not just its assertions.** The reviewer
simulated closing `#`: the pattern edit plus the two list edits leaves two failures, both size
literals; updating the four count literals goes fully green. **No assertion is deleted and none has
its meaning inverted.** That was the whole question — a design that required deleting an assertion
to make progress would have been *a test that pins the defect* wearing a better name.

The `met` counts assertion also survived attack: a non-printable member drops the count, a
`KNOWN_GAP` duplicate collapses in the loop and is caught (that list has no `Set`-size assertion of
its own, so `met.gap` is doing real work), and widening `QUOTE_HEADS` to swallow a character past the
`continue` raises `met.quote` — so the early `continue` is not an escape hatch.

**Two new ASKs, and the first is this change's third instance of one class.** `INDICATOR_ON_DOUBT` is
pinned by `deepEqual(list.filter(m => !MEMBERS.includes(m)), [])`, which passes for `[]` — an empty
filter of an empty list — and for any subset. Setting it to `[]` went GREEN and **restored the exact
falsehood round-1's ASK-2 was raised about**; setting it to `['?','!']` went GREEN and makes the
message claim YAML accepts `!Runs a batch`, which raises ConstructorError. An assertion that cannot
fail, sitting inside the fix for an earlier finding.

That is now three times in this change: B01's F4 (the template example asserted by nothing), B04's
mutation 14 (the rule's imperative unpinned), and this. The pattern is consistent enough to name:
**the fix for a vacuity finding is itself a prime site for a vacuity finding**, because the author is
thinking about the behaviour being pinned and not about whether the new pin can fail. Every gate this
change ran that mutated the fix — rather than reading it — found one. Candidate for the close-out
distillation.

The second ASK is a scope-honesty point that rhymes with the round-1 P1. `KNOWN_GAP` claims "seven
characters are accepted here that YAML does not read as written"; that is true of the swept form,
`description: <c>Runs a batch`. Sweeping ONE-CHARACTER values finds **nine** divergences — the seven
plus `=` (ConstructorError) and `~` (loads `None`). The live case is `tools: ~`, accepted here as the
string `~` while YAML loads null: key present, no list, **full catalog inherited** — BL-008's end
state reached through a column nobody swept. Pre-existing and outside the fence, so it goes to the
backlog with the gap family; the sentence gets scoped to what it actually checked.

The round-1 P1 was the end-of-line form of a head character and the fix closed that column for `-`
alone. This is the same lesson from the other side: **a sweep is complete only for the shape it
sweeps, and naming the shape is the honest part.**

### B04 — comment-only polish, and an implementer that checked its own correction

Polish `00679d9`: two paths, neither document, **0 non-comment code lines changed**. The regex, the
clause pin and both documents are byte-for-byte as the scoped re-review saw them.

It did not simply accept the correction — it verified it before writing it down, against the live
fallback slice: the narrowed pattern does not match today, the unnarrowed one does, the single
`git check-attr` occurrence sits at index 2052 and `Never execute such filter drivers` at 2236, so
the negation is AFTER the command and unreachable by a left-to-right pattern. Its own summary is the
right lesson: *"I had reasoned from proximity rather than from order; the empirical check above is
what I should have run when I first wrote the claim."*

It also bounded the correction correctly: the substantive finding stands — the narrowing is
necessary, an unnarrowed `.*` goes red today, and the live control is genuine. Only the explanation
of WHICH sentence forced it was wrong, and that explanation lived in a comment and a report, never
in an assertion. No test behaviour depended on it.

Merged `--no-ff` → **`a03ed2f`**, tip **286/286**.

### B03 — polish and integration, and a judgement call worth keeping

Polish `95410a7`, test-only. ASK-1 closed with the reviewer's own minimal fix,
`assert.deepEqual(INDICATOR_ON_DOUBT, ['?'])`; both previously-green mutations now redden, and the
message names them so the next reader does not re-loosen it into a subset test. The implementer's
own note on it: *"my guard against a false message was itself a guard that could not fail."*

ASK-2 closed by SCOPING rather than widening — both places now say seven "at the head of a longer
value", the form the loop actually builds, with `=` and `~` named in a comment and `tools: ~` spelled
out as key-present / null / whole-catalog-inherited.

**The judgement call is the part worth keeping.** Told the one-character column had nine divergences,
it verified rather than transcribing, and found MORE than nine — the digits `0`-`9` load as integers
and a leading space is separation. It deliberately did NOT fold those into the note: they are type
coercion and structure, not the parse-failure family, and it declined to state a complete count for
a column it had only spot-checked. Its reasoning: *"claiming a complete count for a column I only
spot-checked would have repeated the mistake one line below its own warning."* That is the round-2
lesson — a sweep is complete only for the shape it sweeps — applied by the agent that received it,
one step further than the instruction went. `tools: 0` reaching a consumer as an int rather than a
string is now a third candidate for that backlog entry.

It also declined the `QUOTE_HEADS` duplicate note deliberately and said so, rather than silently
skipping it: green today, harmless, `met.quote` already catches the widening direction, and the
belt-and-braces assertion plus its explanatory comment would cost more text than the risk justifies
in a file this dense. A declined suggestion that names itself as declined is worth more than a
silently dropped one.

Merged `--no-ff` → **`f7fe0fc`**, tip **292/292** (wave base 272 + 20).

### B05 — gate round 1: the reviewer shipped it and the hunter did not

**`R1 FIX FIRST @11b5d81`** — reviewer `SHIP`, no P0/P1, 3 ASKs; test-hunter **3 findings, 2 marked
NEEDS-PRODUCTION-CHANGE**, and a gate finding needing a production change is a P1. This is the
clearest demonstration this change has produced of why the two gates are separate agents with
separate briefs: the reviewer audited the diff against the batch's acceptance criteria and found it
met every one of them — which it does — while the hunter mutated the code the diff did not touch and
found the batch's own class still live three lines away.

The reviewer's work was not weak. It ran base and tip CLIs against a purpose-built resolving-filter
fixture and confirmed the `worktrees` JSON byte-identical by `cmp`; checked key ORDER survives the
extraction, which matters because the CLI emits `JSON.stringify`; established that ESM live bindings
are read-only for importers so the internal call site cannot be monkey-patched; and judged two
exports the smallest seam that works, by showing each alone leaves one guard unreachable. It also
found the positive control STRONGER than claimed: the fixture writes equal-size content plus
`utimesSync(…, epoch)`, so `status` must compare content rather than short-circuiting in
`ce_match_stat_basic` — the exact trap recorded in `OS-20260919-backlog-sweep/LOG.md:199`, caught by
a reviewer reading a previous ledger's narrative.

**The hunter's 31 mutations are the record of this change.** Every call-site mutation reddens —
verdict ignored, verdict pushed but `true` returned, `path: repo` dropped, wrong `pathCount`, probe
removed from the walk — which settles the risk the extraction created, that the tests now cover the
pure function thoroughly and the call site not at all. They do not. The `deepEqual` self-comparison
at `:537`, which looked like the textbook *assertion satisfied by a neighbouring assertion's output*,
survives scrutiny: the hand-written literals at `:475`/`:482`/`:493` redden FIRST under any code or
message mutation, and `:537` is the ONLY assertion that catches the call site dropping `path: repo`.
An assertion that computes its expectation from the code under test can still earn its place, if
something else anchors the value and it is the unique witness of a real wire.

**Three holes, and the scope line between them.**

1. `tests/git-contract.test.cjs:479` — the case labelled "records without the terminating NUL must be
   refused" passes on the COUNT half of the guard, never the terminator half. Disabling only the
   first disjunct leaves the file green. The assertion is real; its LABEL is wrong, which is worse
   than a missing test — a future reader deletes the duplicate-looking case and silently loses the
   count coverage. → ASK.
2. `git-evidence.mjs:137`, `if (!attributes.ok)` → **P1**. Flipped to `return true` the probe reports
   safe on an UNREAD attribute report and runs `status` with a driver configured; suite green. That
   is BL-009's own sentence, describing a guard BL-009 did not name.
3. `git-evidence.mjs:133`, `if (paths.pop() !== '')` → **backlog**, with the sibling at `:165`.

**The adjudication, recorded because the two gates disagreed and the line is not obvious.** Findings
2 and 3 are the same class in the same function; treating them differently needs a reason better
than taste. The reason is the mechanism: covering the P1 needs only a way to make the existing
attribute probe fail — an injectable probe, which the batch's OWN checklist item 1 already
contemplates ("an export, or an injectable probe") and which `safeResolvedFilters(repo, diagnostics,
options)` is already shaped for. Covering finding 3 means driving a DIFFERENT parse through a SECOND
exported classifier: new production surface. **The line between completing a batch and widening it is
whether the mechanism already exists.** It does for one and not the other.

This is the second time this change that the two gates have split on disposition — B03 was the first —
and both times the resolution came from the guardrails rather than from splitting the difference.
BL-009 named two guards; the hunter established the entry undercounted. *A backlog entry is a
pointer, not a specification* is this repository's own rule, and it cuts toward fixing the P1 here
exactly as it cut toward completing the dash member in B03.

### B05 — round 2: SHIP, and a guard verified by its harm rather than its assertion

**`R2 SHIP @572c5d3`**. P1 and ASK both **FIX VERIFIED**. Validation 278/278.

The re-reviewer did the thing that distinguishes a real verification from a green tick: it checked the
HARM, not the assertion. With `!attributes.ok` mutated to `return true`, `worktrees()` on the
driver-configured fixture returns `cleanliness: 'dirty'`, `status: [{' M','tracked.txt'}]`,
`completeness: 'complete'` — it genuinely ran `status` with a driver configured, which is BL-009's
sentence made executable — while the tip returns `unknown` / `[]` / `partial`. An assertion reddening
tells you a test noticed; reproducing the harm tells you what the test is FOR.

It also re-ran round 1's `!listing.ok` mutation against the NEW structure. That was the specific risk
of a restructure — that coverage which previously worked is silently weakened — and the opposite
happened: it now reddens at three assertions rather than one.

**The injection survived every attack on it as production surface.** Monotone: no value sets `ok`
true, and `text`/`bytes`/diagnostic survive the spread for both `git()` return shapes. Unreachable:
`parseFlags` admits only `names.includes(key.slice(2))` against a fixed per-operation literal, which
also rejects `--__proto__` by the same whitelist. Scoped: exactly two call sites, confirmed
behaviourally rather than by grep alone — `failProbe: 'ls-files'` leaves the index inventory intact.
And still the smallest seam, because injecting `git` itself would admit non-monotone results. The
orchestrator independently confirmed the two call sites and that all three flag spellings return
`usage` with `--help` silent.

**Two new ASKs, and the first is a regression this batch introduced.** `degradedProbe` dereferences
`options.failProbe` with no default, so `safeResolvedFilters(repo, diagnostics)` — the two-argument
call — now THROWS where `11b5d81` returned `true`. Every other exported helper in the module defaults
that parameter, so it is the one arity trap in the file, and it sits in the seam whose whole purpose
is to let future tests call this function directly. Correctly judged not-P1: nothing reports safe,
because the throw is caught at `:209` into `worktree-unavailable`, which is the refusing direction.
The fix is one token. **It touches production, so a scoped re-review follows** — the second time this
wave that a polish has crossed that line, and the rule earned its keep both times.

The second ASK is the fourth instance of the pattern this change keeps producing: **the 12-value
sweep written to prove the injection cannot make anything safe is itself pinned by sampling**, with
no size assertion, so a both-at-once edit to the domain and its expectation passes. The author of a
vacuity fix is thinking about the behaviour being pinned, not about whether the new pin can fail.
B01's F4, B04's mutation 14, B03's `INDICATOR_ON_DOUBT`, and now this — four for four, every one
found by a gate that MUTATED the fix rather than reading it. That is no longer an observation; it is
a rule for the close-out distillation.

### B05 — polish, and a greppable signature for the class this change keeps producing

Polish `ee83e2a`: production diff is ONE token, `degradedProbe(repo, args, options = {})`, restoring
the module's own convention — `git:18`, `capture:32`, `ancestryCaptured:40`, `readBlob:222` all
default that parameter. The two-argument call returns `true` again where `572c5d3` threw.

The sweep's size assertion came with something the ask did not specify and should have:
`new Set(domain).size === domain.length`. Without it, `domain.length === 12` is defeated by the
SAME both-at-once edit it exists to catch — delete a member, duplicate a survivor, count still
twelve. The implementer demonstrated both mutants: deleting `'check-attr'` from the domain and its
expectation reddens the size assertion; doing that AND editing `12` to `11` reddens the partition
assertion instead. **Each catches what the other does not**, which is the test that a pair of
assertions is defence in depth rather than one assertion written twice.

**It then raised a residual against itself and did not act on it**: nothing pinned the `= {}`
default, so a future edit removing it would leave the suite green — the arity regression fixed but
not covered. It named the one-line closure, explained why that fixture's verdict is
machine-independent despite the two-argument call falling back to `process.env`, and stopped,
because the pass had an enumerated scope. Correct on every count: it is the fifth instance of the
pattern, and an implementer that spots one in its own work and asks rather than widening is doing
exactly what the fence is for. The orchestrator authorised the line.

**The most valuable output of this change so far is its hindsight note**, and it belongs in the
distillation in its own words:

> the expectation at `:587` restated the domain's partition as a second literal — two lists
> describing the same fact, with nothing tying them together. That shape is checkable without
> insight into the behaviour, and it is what I would grep for next time.

Every instance of "the fix for a vacuity finding contains a vacuity finding" has so far been caught
by a gate agent MUTATING the fix — expensive, and it requires understanding the behaviour. This is a
**mechanical, greppable signature for the same class**: two literals asserting the same fact with no
assertion relating them. A future test-hunter brief can hunt it directly, without understanding the
code under test. That is the difference between a lesson and a tool.

### B05 — scoped re-review: SHIP, and a determinism claim tested against the machine

The scoped re-review of `572c5d3..HEAD` returned **SHIP**. The production diff for the whole polish
range is the single token claimed — `options` → `options = {}` — verified independently by the
orchestrator as well; the blob of `git-evidence.mjs` is byte-identical between `ee83e2a` and
`96b4c8f`, so the last commit touched no production file at all.

**The determinism argument was tested, not accepted, and this is the part worth keeping.** The
repository has a named class — *a guard whose verdict depends on the checkout rather than the code* —
and was bitten by exactly the Git-for-Windows LFS case in BL-003. The reviewer ran eight ambient
configurations on a machine carrying the stock system config, noting first that line 585 genuinely
reads it, because it omits `repo.env` and so never receives `GIT_CONFIG_NOSYSTEM`. All eight returned
`false` with diagnostic `unsafe-filter` — the same VERDICT, not merely the same boolean.

The decisive fact: a `core.attributesFile` containing both `* -filter` and `filtered.txt -filter`
did **not** override the committed in-tree `.gitattributes`. Attribute precedence puts
`core.attributesFile` and system attributes BELOW in-tree files. And `filter.lfs.*` is irrelevant
here because `safeResolvedFilters` reads no configuration at all — the BL-003 surface lives in
`safeStatusPrerequisites`. Only `GIT_DIR` and `GIT_WORK_TREE` exported together flips it, which is
pathological and fails loudly. The implementer's `--cached` reasoning was confirmed too.

It also proved the no-duplicates assertion non-redundant the only way that counts: removing THAT
assertion alone leaves the duplicate mutant green at 51 pass / 0 fail. A defence-in-depth pair is
only two defences if each catches something the other misses, and both directions were shown.

**Two ASKs, and the second is the sixth instance of the pattern.** The comment says "every other
helper here defaults it", which is true of the four EXPORTED helpers the author was looking at and
false of `safeStatusPrerequisites:153` and `provenanceOptions:50`, which do not — a reader trusting
it gets a throw. One word. And the new assertion discards the diagnostic, so `false` satisfies it
whether it came from the intended `unsafe-filter` path or from ambient breakage: the arity purpose is
served, but on a broken machine it would redden with no signal that the cause is environmental.

Six times now, an assertion written to close a vacuity finding has itself been slightly weaker than
it looked. That is no longer anyone's carelessness; it is structural, and it is the single most
transferable thing this change has produced.

**A third observation was correctly declined.** `safeResolvedFilters` carries no default at its own
exported boundary — the two-argument call works only because its body never dereferences `options`.
Covered (a future edit adding `options.env` there reddens line 585), so an observation rather than a
defect, and adding a default would be an unrequested production change on a pass meant to touch none.
Recorded so the next reader knows it was seen and judged, not missed.

### B05 — final polish and integration; wave 2 closed

Final polish `5d50455`, test-only: `git-evidence.mjs` byte-identical to the reviewed `96b4c8f`, so
the mechanical close applied and no further review ran. It verified ASK-1's claim before inserting
the word — of the six helpers taking `options`, the four EXPORTED ones default it and the two
module-private ones (`provenanceOptions:50`, `safeStatusPrerequisites:153`) do not — and folded the
attribute-precedence finding into the same comment, on the grounds that it was "the one thing I had
asserted without evidence". Merged `--no-ff` → **`6b0ef39`**; tip **298 pass / 0 fail**.

**A second greppable signature, from the author of the instance.** Asked to reflect, the implementer
sharpened its own earlier note and then went past it:

> the tell here was not a second literal but a *discarded output*. `safeResolvedFilters(repo.cwd, [])`
> throws the diagnostics array away at the call site — the function's second return channel, written
> into the argument list and never read. … an out-parameter passed as a fresh literal and never bound
> to a name is an assertion that has declined half of what the function told it.

It also observed that this file's prevailing idiom is `const diagnostics = []; … assert(diagnostics…)`
precisely because the codebase already knows that, and its line was the single place that broke the
idiom — while pinning a fix.

So the distillation now has two mechanical shapes, both checkable without understanding the code
under test, which is exactly what makes them huntable by a gate:

1. **Two literals that partition the same collection with no assertion relating them.** Operational
   form: for every array literal used as a loop domain, is there an assertion whose subject is the
   DOMAIN (size, set-equality, or a count over the results) rather than its members?
2. **An out-parameter passed inline as a fresh literal and never bound.** The call has declined half
   the function's return channel, so any assertion on the result alone cannot see why it refused.

Every earlier instance of this class was found by a gate MUTATING the fix — expensive, and it needs
insight into the behaviour. These two can be grepped. That is the difference between a lesson and a
tool, and it is the most transferable output of this change.

## 2026-09-20 — wave 3

Wave 2 closed: all five members `🟢`, tip **298/298** (wave base 272 + 26; ledger base 260 + 38).
Four worktrees deregistered; the stale `.git/worktrees/*` admin directories resist deletion on this
machine as recorded, are absent from `git worktree list`, and block nothing.

Wave 3 opens with **B06 alone** — `fix/bl-012-013-017-smoke-page`, the batch that carries BL-012,
BL-013 and BL-017. It runs alone because its documents are contested: `templates/00-READBEFORE.md`
was B04's this wave and is B07's next, and `references/execution-models.md` is shared with B07.

### B06 — implemented, and the bug class reproduced inside the rule that stops it

Four commits, one per fold-in item plus ticks: `5395b75` (BL-012), `d19218f` (BL-013), `e353fbf`
(BL-017), `fa24309`. 301/301 on the worktree. 6a fence PASS — exactly the six fenced files plus
ticks-only batch-file edits. 6b confirmed by the orchestrator: the batch's tests over the base
builder give **32 tests, 29 pass, 3 fail**, all three `AssertionError: Missing expected exception`,
i.e. the base builder ACCEPTS all three bad sidecars. `subagent-prompts.md` unmodified, so BL-017
was written as an added post-render pass rather than an ordering change, as the trap required.

**The incident, which is the best single illustration this change has produced.** While writing the
CONTROL-CHARACTER rule, the implementer's editing tool decoded `\uXXXX` escapes, so
`/[\u0000-\u0008…]/` landed in the builder as five LITERAL control bytes — git reported the file as
`Bin` — and `'\u007f'` / `'\u2028'` landed literally in the test. In its own words:

> The suite stayed green because a character class with literal controls behaves identically — a
> perfect instance of the bug this batch exists to stop, in the rule that stops it.

It found this itself, fixed it by comparing code points with no escape anywhere, and rebuilt the
test's sweep from `String.fromCharCode`. The orchestrator verified the claim and went one step
further than the report: **0** non-tab/newline control bytes in every blob B06 touched, checked at
the tip AND in all four commits, because a defect introduced and fixed mid-batch can leave a stray
byte in an intermediate blob that a tip-only scan never sees.

What makes it worth recording is not the slip but the mechanism: **the transport decoded the
escape, and the resulting file behaved identically, so nothing could notice.** That is the same
family as the `Set-Content` pipeline defect and the `git checkout` that ate an uncommitted edit,
both recorded earlier in this change — the apparatus that writes or verifies the work can corrupt
it, and the output looks right either way. Three instances now, three different tools.

The open question handed to the gates: the orchestrator's control-byte scan is EXTERNAL to the
suite. If a future edit reintroduced literal control bytes into the builder or its test, would
anything in `tests/**` go red? A rule whose own source can be silently corrupted by the very defect
it detects is this batch's subject turned on itself.

**Two out-of-fence notes the implementer raised, both needing an orchestrator decision rather than
an edit.** First, `.agents/changes/OS-20260919-backlog-sweep/smoke-C1.json` and the archived
ledger's carry gates the NEW builder rejects, so a re-issue of either closed page would now fail
validation; both are frozen records and were correctly left alone. Second, and more serious:
`smoke-page.md:271` still has the QA runner verify BEFORE the page is built, so both passes now
exist, and **nothing outside `smoke-page.md` tells a conductor to run the post-render one**. A rule
that nothing invokes is *vacuous-until-later documentation* being written on purpose. B07 owns
`execution-models.md` and `templates/00-READBEFORE.md` next wave but its scope is BL-010 and BL-016,
so naming the pass there would be scope creep against a locked plan. **The orchestrator's commitment,
recorded here so it is not lost: C1's own close-out runs the post-render proofing pass by hand —
render the page, read each code block's `textContent`, execute exactly those bytes — and the
residual is filed for a later batch to wire into the contract.** BL-017 is dogfooded or it is not
closed.
