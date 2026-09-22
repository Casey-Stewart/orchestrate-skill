# Log — OS-20260921-backlog-closeout

Append-only narrative for this change: reviewer arcs, root causes, reconciliations,
fence-extension reasoning, pre-smoke findings, in-run learnings. Written ONLY by the
orchestrator, ONLY on the integration branch, in the same commits as PROGRESS. Never read
at boot — a PROGRESS Notes cell or session-log row names the heading to read. One `##`
heading per session (date), one `###` per batch or event. Never edit an earlier entry.

## Learnings

- **A backlog entry can be wrong about its own fix shape, not just its file.** Two of this
  change's three fix entries misdescribed themselves. BL-022 proposed a code-span exemption
  mirroring BL-010; the actual defect is that the residual scan runs over the FILLED output,
  so the fix scopes it to the template and needs no span parsing at all. BL-023 named the QA
  runner's prompt as a wiring target; that runner is pre-page by construction while the pass
  is post-page. The existing guardrail says a backlog entry is a pointer, not a
  specification — these extend it from *which file* to *what the fix is*.
- **The planner's own "nothing pins this" claim needs the same scepticism as a backlog
  entry's.** The draft plan asserted no test pinned BL-022's self-check. Pre-flight found
  `tests/build-smoke-page.test.cjs:54` asserting `build().includes('{{') === false` over the
  output — a live instance of the repository's own "a test that pins the defect" class,
  which the planner had looked for by grepping `unfilled|self-check` and missed because the
  assertion names neither.
- **Reading a stale copy of a document ONCE can contaminate work that afterwards correctly
  uses the fresh one.** This ledger's four batch files were scaffolded with a `**Files**`
  header carried over from the stale `~/.claude/skills/orchestrate` install, read early in
  the session before the repository was adopted as the source of truth. The form is
  plausible, so nothing looked wrong, but it silently killed `validateBatchEdit`'s
  Files-line branch for the whole ledger. When a source is discovered to be stale, re-derive
  what was already taken from it — do not merely stop reading it. See §files-line.
- **A gate agent's evidence needs a control as much as an implementer's does.** A hunter
  proved a real finding with a mutation that never applied, because it anchored on a tag the
  template does not contain. The conclusion survived a correct re-run; the proof did not.
  Treat a gate's "I mutated it and the suite stayed green" as a claim to verify, not a
  result to act on.

## 2026-09-21 — C1

Seven steps, all `Runner: agent`, all PASS, zero human steps. Every zero was
control-armed, and the controls repeatedly earned their cost:

- The table counter was proved able to speak by three mutations — an injected blank line,
  a deleted separator, a duplicated row — each of which it named.
- Step 1 carried a REGRESSION control, not just a presence check: the pre-fix builder was
  copied to scratch and run on the identical sidecar, where it threw the old
  "an unfilled `{{` survived the fill". So the input provably exercises the fixed branch.
- Step 3 proved `KNOWN_UNWIRED`'s permissiveness by MUTATION rather than by reading:
  making `SKILL.md` name the pass at its close-out left the suite GREEN, and dropping the
  pass from `protocol.md` turned it RED. One earlier mutation attempt aborted on the
  runner's own anchor guard because `SKILL.md` wraps "combined smoke / script" across
  lines — which would have been a false green had the guard not been there.

### Step 7 — the proofing pass on its own first live exercise

BL-017's thesis reproduced immediately. Two findings, neither a defect in the shipped
work, both about authoring:

1. **A command can reach the reader re-authored by a layer nobody suspects.** A step
   authored as `printf 'alpha\nbeta\ngamma\n'` was rewritten by the sidecar's own JSON
   layer into a three-line literal, so the published block is not what the author wrote.
   No pre-smoke could catch this, because the pre-smoke runs before the artifact exists.
   This is exactly why the pass was built.
2. **`${{ … }}` inside a double-quoted block is not runnable in sh** — the published block
   failed with `bad substitution`. The builder is RIGHT to publish it (B01's whole point is
   that such content is legal), and the pass is right to flag that it cannot be pasted.
   The authoring rule "no backslashes, no control characters" should grow a sibling: no
   `${{` inside a double-quoted block intended to be run.

### The gap step 7 found in what B02 just shipped

The proofing pass requires a RENDERED DOM and neither `smoke-page.md` nor the new Artifact
proofer skeleton says so. A static read of the built HTML finds **3** `<pre><code>` blocks;
the DOM yields **6**, because the step blocks are rendered client-side from the embedded
`SECTIONS_JS` JSON. A proofer who greps the file therefore proofs only the gate and reports
a clean pass over half the artifact — a FALSE CLEAN of precisely the shape this repository
keeps producing, in the very mechanism built to prevent it.

Related: the browser tool refuses to script `file://` pages, so the runner had to serve the
page over `127.0.0.1`. A future proofer meets the same wall and, without guidance, will
downgrade the pass to a grep — arriving at the false clean by a second route.

## 2026-09-21 — wave 1

### gates — three batches, three instances of the same class

Every one of B01, B02 and B03 shipped an assertion written to close a vacuity that
contained another, and in all three cases the gate that caught it MUTATED the fix rather
than reading it. B01: `assert.equal(steps.length, EXPRESSIONS.length)` where `steps` is
`EXPRESSIONS.map(...)`. B02: a guard whose subject was the whole document, so an ancestry
mention elsewhere in the file satisfied a test named for the close-out region. B03: a
`new Set([...a, ...b]).size` uniqueness check presented in the implementer's own report as
a size pin, green under three separate member deletions. This is the existing guardrail
reproducing three times in one wave; what is new is that all three closed as polish passes
on their own branches and none became a backlog entry.

### the hunter's own mutation was a no-op

B01's hunter proved its coverage-regression finding with mutant M-G, which injected
`{{ leaked ` by `out.replace("<body", ...)`. The shipped template contains no `<body`, so
the mutation never applied and its "67 pass / 0 fail" measured nothing — by the same token
its claim that base line 54 caught the injection was also unfounded. The B01 implementer
found this, re-ran the mutation anchored on `<main` (which the template does have), and
the finding HELD: exactly one test reddens, the new assertion. Right conclusion, unsound
evidence, evidence repaired. The repository's own rule — run a live control through your
harness before trusting any green or any zero — earned its place again, this time applied
to a gate agent rather than to an implementer.

### files-line: an orchestrator error diagnosed as a tool defect

B03's polish returned DONE_WITH_CONCERNS reporting that `validateBatchEdit`'s
`**Files**: ` branch is dead for this entire ledger, so a recorded fence extension cannot
be distinguished from smuggled scope. The report was accurate about the symptom and wrong
about the cause, and the cause was mine.

`orchestrate/templates/02-batch.md` ships `**Files**: {{BATCH_FILES}}`, which is exactly
what the tool matches and what all seven batch files of the previous ledger carry. This
ledger's four batch files carried `**Files** (the fence — modify NOTHING else): …`, which
never matches. That parenthetical is the form used by the STALE
`~/.claude/skills/orchestrate` install, which was read at the very start of this session
before the divergence was noticed and the repository was adopted as the source of truth.
The wrong bytes survived the switch.

Fixed by canonicalising all four Files lines in the ledger; no production change, no
backlog entry. Verified with both controls — the malformed form matches the tool's
predicate 0 times, the canonical form 1 time, all four ledger files now 1, and the
previous ledger's 7 files still 1 each, confirming only this ledger was affected.

The lesson generalises past this ledger: reading a stale copy of a document ONCE can
contaminate work that afterwards correctly uses the fresh one, and the contamination is
invisible because the stale form is plausible. It is recorded in §Learnings.

## 2026-09-21 — scaffold

### Repeat-repo interview

The previous ledger's contract settled everything except three decisions, so the interview
was a single call. Inherited unchanged: validation recipe and its PowerShell form, the
`none` version/changelog/release answers, the git model (default `refs/heads/main`,
shipment `remote origin`, stop at the integration branch), branch prefixes, gate agents
(reviewer + `test-hunter` on every batch), tier wording, runners (CLI only — Node and git),
convergence off, and the prohibition on repointing the stale `~/.claude/skills/orchestrate`
install. The three asked were BL-022's fix shape, BL-023's wiring target, and whether to
run past the scaffold.

A fourth item was flagged to the user rather than asked: the request said "the five
accepted ones", but BL-021 had moved from the accepted bucket to the fixed bucket when the
user approved it as a ride-along, making the accepted set four. Recorded in 00-request.md
so it is not re-litigated.

### Pre-flight — 4 BLOCKING, 10 ADVISORY, all resolved before the user saw the plan

1. **B02's wiring target contradicted the pass's own timing.** `subagent-prompts.md:242`
   ("A FAIL becomes a repair mini-batch before the page is issued") and `smoke-page.md:302`
   make the QA runner pre-page; the proofing pass is post-page and its definition says it
   "changes nothing about when the runner runs". Extending the existing block would have
   forced a re-timing edit in `smoke-page.md`, which is fenced to B01 — a mid-wave-1
   `NEEDS_FENCE` stall. Resolved by specifying a SEPARATE post-page block, which keeps the
   two fences disjoint and both documents consistent.
2. **`tests/subagent-type-mapping.test.cjs` was missing from B02's fence.** Its `SKELETONS`
   list is `deepEqual`-compared against both the document's prompt blocks and its spawn
   lines, so any new fenced block reddens it. Added to the fence, with the requirement that
   the new block carry its `**Spawn with**` line.
3. **`tests/smoke-page.test.cjs` was missing from B01's fence.** It is the suite's only DOM
   harness, and B01's "the text reaches the reader" criterion is settleable nowhere else.
4. **A B03 smoke step would have mutated a real ledger** under `.agents/**`, against the
   repo conventions, the plan's own scope line and B04's byte-identical criterion. Rewritten
   to copy the batch edit into a scratch worktree and mutate the copy.

Advisories folded in: the builder's `0 unfilled slots` success message becomes an
unverified claim after B01 and is now a checklist item; the stale pin at
`build-smoke-page.test.cjs:54` is named explicitly; B03's "recipe count unchanged"
criterion was unfalsifiable (imported from BL-009's close — `check-fence.mjs` has no
recipes) and was replaced with the real `--help` pin; B04's provenance claim about which
batch widened a sweep to the repository root was wrong and was replaced with the shape
rather than a re-guessed number; the plan's "four occurrences of proof" was seven; and the
pass's line range is 142-157, not 140-152.

### Deliberate exclusion, recorded so it is not mistaken for an oversight

`orchestrate/references/execution-models.md:133` carries a THIRD close-out sequence ending
"STOP with the combined smoke script" and is NOT in B02's fence this round. The user was
offered the fold-in at plan approval and chose "Approve as shown". The consequence is
written into B02's batch file: its guard must assert the wiring as a swept domain property,
so that wiring the fourth carrier later turns the test GREEN rather than red. A hand-written
three-file `deepEqual` would have frozen the omission into a test and made the eventual fix
look like a regression — the "fixed in the reported instance, left in its sibling" class,
one level up.

### Backlog fold-ins

None considered. This change IS the backlog sweep: every open entry is already a request
item, so the fold-in step has no remaining candidates.

### Environment facts verified at scaffold time

Node v22.22.3. Base `5efd484`, tree clean, cut from `main`. Full suite green at base:
**306 pass, 0 fail**, ~4.6 minutes. `git diff --check` clean. No `.gitattributes` rule
applies to ledger markdown (`text: unspecified`, `eol: unspecified`), so the ledger files
are written CRLF to match every existing file under `.agents/`.

The installed skill at `~/.claude/skills/orchestrate` was compared against the repository
and differs in all ten shipped files — it predates `smoke-page.md` and the `LOG.md`
template entirely. This ledger was therefore scaffolded from the repository's own
`orchestrate/` tree, which is the source of truth and the copy the tests pin. The install
was left untouched, per the standing prohibition.
