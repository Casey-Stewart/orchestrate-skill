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
