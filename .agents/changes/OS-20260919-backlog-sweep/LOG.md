# Log — OS-20260919-backlog-sweep

Append-only narrative for this change: reviewer arcs, root causes, reconciliations,
fence-extension reasoning, pre-smoke findings, in-run learnings. Written ONLY by the
orchestrator, ONLY on the integration branch, in the same commits as PROGRESS. Never read
at boot — a PROGRESS Notes cell or session-log row names the heading to read. One `##`
heading per session (date), one `###` per batch or event. Never edit an earlier entry.

## Learnings

- **A backlog entry can be right about the defect and wrong about the file.** BL-003 names
  `check-fence.mjs` as the offender; the code is in `git-evidence.mjs`
  `safeStatusPrerequisites()`, and the fence tool merely inherits the verdict. Every entry
  in this change was re-read against the source before a fence was drawn, and BL-002 came
  back wider than written. Re-verify each entry at scaffold time; a backlog is a pointer,
  not a specification.
- **The scaffolder self-check's own grep has false positives, and this ledger trips them.**
  Step 9 greps the new directory for `{{` and `<!--` expecting zero hits. This ledger has
  eleven, every one of them inside a backticked code span quoting a template's literal
  text or quoting the self-check rule itself — verified by hand, one at a time, none an
  unfilled slot. A ledger that documents templating work will always trip a naive grep.
  Out of scope for this change (no backlog entry covers it), but B02 is editing that very
  step, so the observation is recorded here rather than lost. Candidate residual at
  close-out: the self-check should ignore fenced and inline code spans, or the check
  should be "no placeholder outside a code span".
- **A prose rule stated in a contract is not a pinned example.** The contract template
  already said "Bnn ids" in prose when the OS-20260919 plan wrote `01` and disarmed the
  mechanical fence for the entire change. Where a machine parses a human-filled table, the
  template must SHOW the row, not describe it.

## 2026-09-19 — scaffold

### Environment and repository facts verified

- Ledger base: `f8290405b45a89928b1808f8b1241df1ccea39f2` (`main`, identical to
  `origin/main`'s target at scaffold time). Default branch confirmed via
  `git symbolic-ref --quiet refs/remotes/origin/HEAD` → `refs/remotes/origin/main`;
  remote is `https://github.com/Casey-Stewart/orchestrate-skill.git`.
- Baseline validation green: **207 pass, 0 fail**, ~225 s, via bare `node --test` from the
  repository root. Noted for the contract: `node --test tests/` FAILS (Node's
  directory-argument discovery differs from the recursive-FullName recipe) — the published
  PowerShell recipe and bare `node --test` are the two supported forms.
- No `package.json`, no version file, no changelog, no build or release step. Hence no
  version bump is available as a checkpoint build marker, and C1 gets a **behavioural
  canary** instead (see §C1 canary below).
- `.claude/agents/` holds the four definitions shipped by OS-20260919. `test-hunter` is a
  read-only gate agent and was offered and accepted for every batch.
- A second worktree is registered on `codex/readonly-evidence-smoke-inputs-ledger`; the
  base canary consequently reports two worktrees, both `unknown`.

### Accuracy check of the backlog

Each of the seven entries was re-read against the files at `f829040` rather than trusted.
Six confirmed; the detail is in [00-request.md](00-request.md) §Accuracy check. Two
findings worth recording here:

- **BL-002 is wider than its text.** It names only `orchestrate/templates/01-plan.md`, but
  `check-fence.mjs:164` calls `oneRow()` on BOTH the plan's authority table and PROGRESS's
  batch table. Fixing one template leaves `Duplicate or malformed batch IDs` firing on the
  other. `orchestrate/templates/PROGRESS.md` was therefore added to B02's fence.
- **BL-003 reproduced live.** `git config --system --name-only --get-regexp
  '^filter\..*\.(clean|process)$'` returns `filter.lfs.clean` and `filter.lfs.process` on
  this machine, while `git ls-files -z --cached --others --exclude-standard |
  git check-attr filter -z --stdin` returns `unspecified` or `unset` for every path. The
  repository's own `.gitattributes` uses `-filter`, which resolves to `unset` — recorded in
  B03's spec because treating `unset` as unsafe would make the helper refuse on every path
  this repository deliberately pins, which is worse than the bug being fixed.

### C1 canary — captured before any work

```
node orchestrate/tools/git-evidence.mjs worktrees --repo .
exit=2   completeness: partial   cleanliness: unknown,unknown   codes: unsafe-filter,unsafe-filter
```

With no version file in this repository, this is the checkpoint script's step 0: it is
cheap, read-only, and its result is OPPOSITE on the base build. A C1 script whose every
step could pass against the base build could not detect that it had run against the base
build; this one can.

### Wave-map reasoning beyond the plan's one-liners

Four batches were drafted and reduced to three. The fourth was BL-007's bookkeeping line
inside the COMPLETE OS-20260919 ledger; it was kept separate precisely so it could be
dropped without disturbing a test batch, and the user then dropped it outright ("Delete
BL-007, no idea why that is in backlog"). That was the right shape for a droppable item.

B01 and B02 were nearly merged, since BL-006 changes the very assertion whose bookkeeping
BL-007 was about — but their fences share no file and merging them would have made one
`M` batch out of an `S` and an `M` for no throughput gain, since both already run in
wave 1.

The one real hazard in a three-wide wave is recorded in the plan and in both batch files:
B02 owns `tests/protocol-contract.test.cjs`, which asserts that the §Read-only evidence
tools sections of `orchestrate/references/protocol.md` and
`orchestrate/templates/00-READBEFORE.md` — both B03's — are byte-identical after
placeholder substitution. This is a coupling, not a dependency: if B03 edits both mirrors
identically, B02's file needs no change and the fences stay disjoint. Both batch files say
so explicitly, and both say that the answer to needing a sibling's file is `NEEDS_FENCE`,
never an edit.

### Backlog fold-ins

None considered and none rejected: the backlog IS this change's request, so every eligible
item is already a request item with its own batch. `bugs-2026-09-17.md` was left untouched
per the backlog file's own preamble.

### Pre-flight — 6 BLOCKING, 6 ADVISORY; all twelve fixed before the plan went to the user

One fresh read-only reviewer over the draft request, plan and three batch files. Coverage
both ways passed, and the literal intersection of the three wave-1 fences was empty. The
rest did not.

**Blocking, and how each was resolved.**

1. **B02's archive-guard smoke step could not go red.** It named "delete the line
   containing `Python310`", but that file has FIVE such lines and THREE that match the
   asserted regex `/Python310[\\/]python\.exe/` — deleting one leaves the assertion
   satisfied and the step would have recorded "the guard still cannot fail" as a pass.
   The step now uses the Excel-validation sentence, which occurs exactly once, and says
   explicitly why the `Python310` line is unusable.
2. **That same step was tagged `Runner: agent` while writing into `.agents/archive/`,
   which this contract forbids absolutely** (§Hard prohibitions). A batch file cannot
   amend the contract, so the QA runner would have had to refuse the step or break a
   prohibition. It now runs entirely inside a throwaway clone at `$env:TEMP\os919bl\c1`,
   with the short root chosen because this repo's deepest tracked path is 146 characters
   and the scratchpad prefix would breach Windows' 260-character limit — the same trap the
   previous ledger hit with `git worktree add`.
3. **B02's example-row design contradicted its own acceptance criteria.** The batch
   required the example row not to survive scaffolding (else `oneRow` sees a duplicate id)
   AND required the end-to-end test to render authority files from the shipped templates
   and be red on base — which is impossible if the row is stripped before rendering. Left
   as-is, an implementer would have had to choose between two binding criteria. Settled at
   planning time instead: the row lives inside the existing `<!-- … -->` instruction
   comment, and the test lifts it out of the comment the way a scaffolder reads it. On the
   un-fixed templates there is nothing to lift, which is what makes it red on base.
4. **B01's gate shape contradicted a recorded user decision.** The S-weight default is one
   combined reviewer+gate pass, but the user's 2026-09-19 answer was "every batch gets the
   independent reviewer plus the read-only `test-hunter` gate" — and BL-004 is one of the
   two "assertion that cannot fail" items in this change, which is precisely the hunter's
   subject. B01 now gets the separate gate, and the batch file says why the default was
   overridden.
5. **A wrong line citation was driving a design decision.** `tests/protocol-contract.test.cjs:118-121`
   was cited three times as the placeholder-registry test; that test is at `:80-87` with
   the row regex at `:83`, and `:118-121` is an unrelated `paths` array. An implementer
   sent there would have found no constraint at all.
6. **Fence census gap: two suites coupled to B03's files appeared nowhere.**
   `tests/contract-prompt-authority.test.cjs:107-120` runs three "boot-time full read"
   prohibition regexes over the whole contract template outside the pinned implementer
   paragraph — including §Read-only evidence tools, which B03 rewrites — and
   `tests/subagent-type-mapping.test.cjs:13` reads `protocol.md`, B03's other mirror. Both
   are now declared read-only couplings in B03's notes, with the three regexes quoted
   verbatim so the new prose cannot trip them.

**Advisory, all fixed rather than accepted.** Line drift in `git-evidence.mjs` citations
(`safeStatusPrerequisites` is `:102-124` not `:104-131`; `worktrees()` `:155` not `:157`;
the submodule refusal `:121`); the end-to-end test starts at `:132`, not the blank `:130`;
`check-fence.mjs` calls `worktrees()` twice (`:150` and `:201`), so "check every caller"
now names both; the README install glob was quoted from the test's own paraphrase rather
than `README.md:136`; the plan's smoke inventory undercounted the perturbing steps as one
and referred to a C1 step number that is only assigned at close-out; and "the four real
definitions are the only consumers" was false —
`tests/subagent-type-mapping.test.cjs:139` also reads them, by `existsSync` per type
rather than by listing, which is why B01's recursion change does not reach it.

**What this pre-flight is worth recording for.** Four of the six blocking findings were
not scope or coverage errors — they were *steps and criteria that would have passed while
proving nothing*, in a change whose entire subject is guards that pass while proving
nothing. Two of them (1 and 3) were in the batch that fixes BL-001. The plan pre-flight
earned its round here.
