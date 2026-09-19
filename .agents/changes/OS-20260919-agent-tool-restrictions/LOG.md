# Log — OS-20260919-agent-tool-restrictions

Append-only narrative for this change: reviewer arcs, root causes, reconciliations,
fence-extension reasoning, pre-smoke findings, in-run learnings. Written ONLY by the
orchestrator, ONLY on the integration branch, in the same commits as PROGRESS. Never read
at boot — a PROGRESS Notes cell or session-log row names the heading to read. One `##`
heading per session (date), one `###` per batch or event. Never edit an earlier entry.

## Learnings

- A skill directory cannot ship sub-agent definitions. `~/.claude/skills/<name>/` and
  `~/.claude/agents/` are sibling mechanisms; only a *plugin* (a folder carrying
  `.claude-plugin/plugin.json`) can ship an `agents/` directory. Any future "ship X with
  the skill" idea needs this check first — the install path in `README.md` is a symlink of
  `orchestrate/` alone, and nothing outside that directory travels with it.
- Omitting `tools:` from an agent definition inherits **every** subagent-available tool,
  MCP servers included. There is no deny-list — the explicit allow-list IS the mechanism.
- A role's tool list must be derived from what its prompt skeleton actually tells it to
  do, not from the role's name. `qa-runner` reads as read-only but writes evidence files
  (`subagent-prompts.md:222`), so a literal reading of the request would have shipped a
  broken role.

## 2026-09-19 — scaffold

### Accuracy check before planning

The user asked for the three proposed changes to be confirmed before orchestration. All
three were verified against the files at `5110f71`; the findings are recorded in
[00-request.md](00-request.md) §Accuracy check and summarised in the session log. Change 3's
figures were exact (83,327 bytes, ≈20k tokens, identical line in template and filled
ledger). Change 2's cited line numbers `:97`, `:174`, `:240` were all exact.

Two corrections went into the plan rather than back to the user as blockers, because
neither changed what the user wanted — only how much of it the change delivers:

1. **Change 1's reach.** The claimed 66–84k saving lands only for sessions working *in
   this repo*. The scope gap was surfaced to the user, who chose to keep the definitions
   at the repo root and add README install instructions rather than convert the skill
   folder to a plugin. The plugin route was explicitly deferred, and is recorded as a
   prohibition in the contract so no implementer wanders into it.
2. **Change 2's count.** The request names four roles; `subagent-prompts.md` has seven
   skeletons. All seven are in B03's scope, mapped onto the four definitions.

### The one deviation from the request's literal wording

`qa-runner` keeps `Write` and `Edit`. The request lists it right after the read-only pair
and calls it "adds browser tools", which reads as read-only plus a browser. The QA runner
skeleton writes `evidence/C[N]/step-[NN].md` per step (`subagent-prompts.md:222`) and
modifies disposable working copies (`:217`), so a read-only `qa-runner` could not produce
the evidence a checkpoint close-out consumes. Recorded in the plan, in B01's batch file,
in B01's acceptance criteria, and required to be justified inside the definition file
itself so a later reader does not "correct" it back.

### A consequence the request did not cover

A bare `subagent_type: implementer` breaks in any repo without the definitions installed —
which is every repo but this one until a user follows the new README step. Left alone,
change 2 would convert a token saving into a broken spawn. A `## Degraded environments`
bullet in `protocol.md` was added to B03's scope, deliberately matching the existing
"No gate agents named" / "No sub-agents available" idiom at `protocol.md:688` rather than
inventing a new shape.

### Wave-map reasoning beyond the plan's one-liners

The interesting question was whether to run all three batches in one wave. Their fences are
fully disjoint, so nothing about the *files* forces an ordering. What forces it is B03's
cross-reference test, which asserts that every `subagent_type:` named in a skeleton
resolves to a real `.claude/agents/<type>.md`.

That test could have been dropped to buy a single wave. It was kept, and B03 moved to its
own wave, because it is the only mechanism that permanently prevents the exact failure the
user reported — an orchestrator silently defaulting to `general-purpose` with `*`, six
times in one session. A prose rule in §Spawning rules would not have caught it; a test
that fails when a skeleton names a type nobody defined will. The cost is one extra wave in
a three-batch change; the benefit is drift protection for every future change to either
file. B03's batch file explicitly forbids weakening the check to a soft assertion.

### Checkpoint placement

One checkpoint, final. W1 genuinely carries hands-on risk (nothing in this session can
verify the `tools:` frontmatter is honoured — agent definitions load at session start, and
this session booted before `.claude/agents/` existed). The reason a checkpoint was *not*
placed after W1 anyway: until B03 lands, no skeleton names an agent type, so a restart
after W1 could only test definitions that nothing references. The end-to-end check worth a
user's time — skeleton names a type → the type resolves → the type is restricted — needs
all three batches. Two restarts would have proved less than one.

### Environment facts verified

- Baseline validation green at the ledger base: **187 pass, 0 fail**, ~4.3 minutes, Node
  v22.22.3, using the PowerShell recipe `README.md` designates for ledger validation.
- `.claude/` does not exist at `5110f71`.
- No `package.json`, `VERSION`, `CHANGELOG.md`, `CLAUDE.md`, `BACKLOG.md` or `TODO.md` at
  the repo root — version files and changelog are `none`, matching the archived ledger's
  answers, and the backlog is created on first residual.
- `origin` → `https://github.com/Casey-Stewart/orchestrate-skill.git`;
  `refs/remotes/origin/HEAD` → `refs/remotes/origin/main`, so `refs/heads/main` is the
  confirmed default branch. The previous ledger's merges all landed locally.
- `tests/protocol-contract.test.cjs:122` guards the archived ledger's frozen environment
  facts behind an `existsSync` check, so archival did not break it — confirmed by the green
  baseline after the archive commit.

### Backlog fold-ins considered

None possible. The repo has no rolling backlog at scaffold time; `bugs-2026-09-17.md` is a
dated review record whose header pins it to a 2026-09-17 review of commit `af57139`, and
the user chose to leave it untouched and start `BACKLOG.md` on the first residual. The
contract lists editing it as a hard prohibition so an implementer does not treat it as the
backlog.

### Pre-flight

No independent pre-flight sub-agent was spawned. Three weight-S batches, and the
accuracy check the user requested had already read every file the plan touches and
produced three findings that changed the plan (the reach gap, the seven-vs-four count, and
the missing fallback). A pre-flight reviewer would have re-read the same files for the
same purpose. Verdict recorded as `Pre-flight: CLEAN` in the plan, with this note as the
reason it was not delegated.

## 2026-09-19 — session 2 (wave 1)

### Boot + reconcile

Discovery found one ACTIVE ledger. Every batch row was `⬜` and `git branch --list`
showed only `chore/agent-tool-restrictions-ledger`, `codex/readonly-evidence-smoke-inputs-ledger`
and `main` — no batch branch existed, which is the §Recovery table's "`⬜` / no such
branch → correct state, waits for its wave". Nothing to correct. The main checkout was
clean and already on the integration branch, so the ledger is edited there directly, as
the contract's boot step 2 allows.

Resume-time validation on the integration tip `7b74811`: exit 0, `git diff --check` clean.

**Filter defect to avoid repeating.** The quiet-form run used
`Select-String -Pattern '^# (tests|pass|fail|…)'`, which is the **tap** reporter's shape.
`--test-reporter=spec` prints `ℹ tests N` / `ℹ pass N` / `ℹ fail N`, so the totals were
filtered out and only the exit code proved green. Subsequent runs filter on
`ℹ (tests|pass|fail)` instead. The gate was still satisfied — a non-zero exit would have
printed the `TESTS_EXIT_NONZERO` marker — but the totals line the contract asks to report
was lost for this run.

### Wave 1 open

Wave base `7b74811`. Cut `feat/agent-definitions` (B01) and `fix/contract-prompt-authority`
(B02), created both worktrees, committed the PROGRESS flip as `1d05732`, then spawned both
implementers concurrently in one message.

### Environment: Windows MAX_PATH forced the worktrees out of the scratchpad

`git worktree add` under the session scratchpad aborted with `Filename too long` partway
through checkout. Cause, measured rather than guessed: the scratchpad prefix is ~150
characters and this repo's deepest tracked path is 146
(`.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/evidence/C1/inputs/issue-001/recursive-discovery/tests/unit/discovery-sentinel.test.cjs`),
which clears Windows' 260-character limit before git writes a single archive file.

Chosen fix: a short worktree root, `C:\Users\fatbo\AppData\Local\Temp\claude\wt-os919\`
(52 characters, leaving ~60 of headroom). Still outside the repo, still disposable,
per-worktree setup still `n/a`. Rejected `git config core.longpaths true` — it mutates the
user's repo config persistently to work around a path length this ledger can simply avoid,
and it would not protect non-git tooling running inside the worktree.

This is an environment fact, **not** a deviation from the locked plan: the wave map,
fences, gates, checkpoints and merge policy are untouched, and the contract only requires
worktrees to be isolated and outside the repo.

Two leftovers noted, neither blocking: the first `git worktree add` created
`feat/agent-definitions` before failing, so the branch was **adopted** at the integration
tip per step 4's idempotent-cut rule (verified `git rev-parse` equal to `7b74811` first);
and `.git/worktrees/wt-B0*` admin directories from the archived ledger's run refuse
`git worktree prune` with `Permission denied` (OneDrive holds them), while being absent
from `git worktree list` — so they register as pruned and collide with nothing.

### Agent types: the fallback this change exists to remove, in action

No `implementer` subagent type exists yet — B01 is what creates it — so both wave-1
implementers were spawned as `general-purpose`, inheriting the full tool set. That is
precisely the degraded path B03 will document, observed from the inside: this session pays
the 12–15k-per-spawn cost the change removes, and the first session that can spend the
saving is the one after C1.

### Residual R1 — the archived-ledger guard in `protocol-contract.test.cjs` is dead

Surfaced by B02's implementer as an out-of-fence observation; verified independently by
the orchestrator.

`tests/protocol-contract.test.cjs:122` guards
`.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md`, but commit
`5110f71` ("Archive the completed OS-20260918 ledger") moved that ledger to
`.agents/archive/…`. The path no longer exists, so the `existsSync` is permanently false
and the two assertions inside it — `/Python310[\/]python\.exe/` and `/Every generation and
independent Excel-validation command in this run uses literal/` — never execute. The test
still passes, which is what makes it dangerous: it advertises a frozen-contract guard that
cannot fail.

Nothing is broken today — the archived contract still carries both facts (3 matches for
the Python path) — but a future edit that rewrote them would sail through. The
`existsSync` wrapper is correct in principle (a clone made after archival need not carry
the path); only the path is stale.

Out of every batch's fence. Destination: `BACKLOG.md` as **BL-001** at the change-complete
close-out. B02's own new test guards the archive at the *correct* `.agents/archive/…` path,
so the boot wording is covered again — but the Python/Excel environment facts are not.

### Residual R2 — `check-fence.mjs` cannot read a ledger this scaffolder produces

Found by the orchestrator when the mechanical fence check (step 6a) returned `UNKNOWN`
(exit 2) for B02 with `{"code":"authority","message":"Duplicate or malformed batch IDs"}`
against `01-plan.md`.

Root cause, verified in source: `orchestrate/tools/check-fence.mjs:39` requires every `#`
cell of the plan's authority table to match `/^B\d{2,}$/`. The archived OS-20260918 plan
uses `B01` / `B02` / `B03` and parses fine. **This** ledger's plan uses bare `01` / `02` /
`03`, so the tool throws before it can check anything. `orchestrate/templates/01-plan.md`
carries only an HTML comment describing the row — it pins no id format and shows no
example row — so a scaffolding session is free to write either, and this one wrote the
form the tool rejects.

Effect: the mechanical fence gate is unusable for the whole of this change, on every
batch, silently degrading step 6a to the manual fallback for all three. The contract
anticipates exactly this ("Unknown or legacy shapes use the manual gate, never rewritten
authority"), so the gate still holds — but it holds by hand.

Deliberately NOT worked around. Rewriting the locked `01-plan.md` to satisfy the tool
would be rewriting authority mid-run, which the contract forbids in the same sentence that
tells it to fall back. Out of every batch's fence (`templates/01-plan.md` and
`references/scaffolding.md` belong to no batch here; B03 owns only `references/protocol.md`
and `references/subagent-prompts.md`). Destination: `BACKLOG.md` as **BL-002**. The fix is
a pinned example row in the template plus a scaffolding self-check assertion — and a test
that scaffolds a ledger and runs the real fence over it, which is the class of bug that
only an end-to-end check catches.

### Residual R3 — the fence helper cannot determine cleanliness on a stock Git for Windows

Same `UNKNOWN`, second cause: four `{"code":"unsafe-filter"}` diagnostics, one per
worktree — "Clean/process filters are configured; status was not run because it can
execute commands".

The conservatism is right in principle (the contract forbids executing a clean filter to
obtain a clean result) but it fires on configuration alone. The only filters here are
`filter.lfs.*`, which Git for Windows writes into `C:/Program Files/Git/etc/gitconfig` on
every stock install. The orchestrator resolved the unknown safely without running any
filter: `.gitattributes` `-filter`s every fixture path, and
`git ls-files | git check-attr --stdin filter` returns `unset` or `unspecified` for every
tracked path — no path resolves to `filter: lfs`, so `git status` can execute nothing.

So the helper reports UNKNOWN on essentially every Windows machine, whether or not a
filter can actually engage. Checking the resolved `filter` **attribute** per path, rather
than the presence of filter **config**, would keep the safety property and restore the
mechanical gate. Out of fence. Destination: `BACKLOG.md` as **BL-003**.

### B02 — gate, round 1

**Fence check (6a).** The mechanical helper returned `UNKNOWN` (exit 2) for the two
reasons recorded as R2 and R3 above, so the contract's manual fallback was used:
`git status --porcelain -unormal` empty in the worktree; `git diff --name-status -M
chore/agent-tool-restrictions-ledger...HEAD` returned exactly
`orchestrate/templates/00-READBEFORE.md` (M), `tests/contract-prompt-authority.test.cjs`
(A) and the batch's own file (M); the batch-file blob diff is six `- [ ]` → `- [x]` ticks
and nothing else. PASS.

**Failing-on-base (6b).** Run by the orchestrator, not taken from the implementer's
report. A detached worktree at the ledger base `7b74811`, the new test file copied in
alone, then `node --test --test-reporter=spec tests/contract-prompt-authority.test.cjs`:
exit 1, `tests 4 / pass 1 / fail 3`. The three failures name the behaviour — *the contract
no longer sends implementers to read the contract at boot*, *the implementer paragraph
makes the spawn prompt authoritative and the contract on-demand*, *the constraints the old
boot paragraph carried survive the rewrite* — and *the archived ledger keeps its original
boot wording* passes, which is correct for a regression guard. The regression test is
proven. Temporary worktree removed.

**Review (6c).** One fresh read-only reviewer, default tier, no gate agent (the contract
names none). Verdict **`R1 SHIP @1912369 asks=2`**. It mapped all three hunks, verified the
hunk arithmetic to prove the edit is confined (3 context / 4 removed / 8 added / 3 context,
boot steps 1–4 and `## Roles, gates, tiers` byte-identical), confirmed the failing-on-base
result by construction at base rather than by trust, and ran the full suite green at
191/191.

Reviewer note worth keeping: the new paragraph also removes an internal contradiction —
it now agrees with §Session algorithm step 5 ("Every prompt must be SELF-CONTAINED").

**ASK 1 (assertion strength) — the good one.** Every assertion but the first is a positive
substring match on the flattened paragraph, and the first bans a single literal. So
appending one sentence — *"Even so, skim this contract end to end before you start."* —
passes all four tests while destroying the batch's entire payoff. A second variant adds
the instruction elsewhere in the file, outside the anchored slice, where tests 2 and 3
never look. Suggested fix: exact-pin the flattened paragraph, with precedent at
`tests/protocol-contract.test.cjs:70-74`, which sha256-pins the decision tables for this
same reason.

This is the right finding for this batch. The "production code" here is prose, and prose
assertions written positively are vacuous by default — they say what must be present and
never what must be absent.

**ASK 2 (coverage gap).** The frozen-ledger guard hardcodes the OS-20260918 archive path;
this ledger's own filled contract is required to keep the old wording and nothing asserts
it, and once archived its copy lands at an unguarded path too. Suggested fix: glob
`.agents/archive/*/00-READBEFORE.md` and `.agents/changes/*/00-READBEFORE.md`.

Both ASKs are test-only and in fence. Polish pass dispatched to the same implementer,
with one addition from the orchestrator: the exact pin closes the in-paragraph mutation
but not the reviewer's own second variant, so the implementer was asked to cover both —
without weakening the pin to do it.

### B01 — gate, round 1

**Fence check (6a).** Manual fallback again (helper `UNKNOWN`, R2/R3). Worktree clean;
seven paths — four `A` under `.claude/agents/`, `A tests/agent-definitions.test.cjs`,
`M README.md`, `M` the batch's own file — all inside the fence; the batch-file diff is
nine ticks and no prose. PASS. **6b does not apply**: B01 is a `feature` batch, so there
is no failing-on-base requirement.

**Review (6c).** One fresh read-only reviewer, default tier, no gate agent. Verdict
**`R1 SHIP @33a8d5b asks=4`**. Full suite green at 192/192 (baseline 187 + exactly the
five new tests). It checked the four `tools:` lines byte-for-byte with `cat -A`, confirmed
`README.md` §Requirements was genuinely left alone (single contiguous hunk; lines 171-178
unchanged), and verified the implementer's three mutation claims from source rather than
trusting them, then probed further: a `# tools:` comment, malformed frontmatter,
reordering, renaming, an added `model:`, an empty description, a deleted file and removal
of the README caveat all fail correctly.

**Two ASKs that are real holes, not polish.**

*ASK 1 — the test never reads the directory.* Every assertion iterates
`Object.keys(TOOLS)`, so a fifth file dropped into `.claude/agents/` — say
`orchestrator.md` with no `tools:` line — passes the whole suite while inheriting the
entire tool catalog on every spawn. That is precisely the waste this batch exists to
remove, and the README's `cp .../*.md` would propagate it into the user's
`~/.claude/agents/` for every project. A whitelist that never checks for strangers is not
a whitelist.

*ASK 2 — the field regex accepts YAML that isn't YAML.* `:[ \t]*` is zero-or-more, so
`tools:Read, Glob, Grep, Bash` (no space) still captures a tool list and passes lines
49/50/51 — but YAML parses no mapping there, so Claude Code loads the definition with no
`tools` key and the "read-only" reviewer silently inherits everything. The test would be
green at the exact moment the capability boundary failed open. Same class: an unquoted
`: ` inside a `description:` value.

Both are the same underlying error — asserting on a hand-rolled parse that is more
permissive than the real consumer's. Worth remembering whenever a test regexes a format
something else will parse strictly.

**ASK 3 (doc accuracy).** `qa-runner.md:14` cites `subagent-prompts.md:217`; the quoted
sentence is at `:218` (`:217` is the browser-check line). Faithfully copied from the batch
file's own §Decision at line 72 — the error originated at planning time. The orchestrator
steered the fix to the *second* option the reviewer offered: cite the quoted phrases, not
line numbers, and do the same for the `:222` citation, because B03 edits that very file in
wave 2 and will shift every line number in it. Correct-across-edits beats correct-for-now
in a file read on every spawn.

**ASK 4 (drift).** `reviewer.md:8-9` restates duty 1 of the reviewer skeleton, against the
batch's own "do not restate the prompt skeletons". Small cost, real drift risk: a later
change to the skeleton leaves the definition silently contradicting it.

**Judgement calls, both upheld.** (a) The whitespace collapse does not weaken criterion 8
— `\s+`→`' '` cannot add, drop or reorder a word, it is applied to both sides, and the
caveat genuinely wraps across lines in all three files, so a raw match would be asserting
the line-break position rather than the wording. (b) The two assertions added beyond the
batch's explicit list are in scope and improvements: criteria 6 and 8 are batch criteria,
and the test spec's prohibition was narrow and specific (`subagent_type:` and
`subagent-prompts.md` contents, both B03's). Without them, criteria 6 and 8 would rest on
a human reviewer forever.

**Forward note for B03 — carried into its spawn prompt, not into the locked plan.**
`README.md:148` now promises that "the prompt skeletons fall back to a general-purpose
agent". That is vacuously true today, since no skeleton names a `subagent_type` yet. B03
makes it load-bearing: if an unknown `subagent_type` *errors* rather than falling back,
this README sentence becomes false the moment B03 lands. B03's implementer must establish
the actual behaviour and either document the real fallback or flag the README line.

### B01 — polish pass and scoped re-review

Polish commit `c72368f`, suite 192 → **194** (ASK 1's directory test plus the body-size
ceiling). All four ASKs answered with no frontmatter touched — the orchestrator verified
that independently (`git diff -M -- .claude/ | grep -E '^[+-](name|tools|description|model):'`
empty, and the four `tools:` lines still byte-exact on the polished tip) before any
reviewer saw it.

Because the polish edited two definition bodies — B01's production artifacts — the
contract's scoped fix-diff-only re-review was required. A fresh read-only reviewer got the
polish diff alone plus the ASK list and duties 1, 2 and 4. Verdict **`R2 SHIP @c72368f`**,
recorded as polish-phase and counting toward no cap.

It confirmed the polish is prose and citation only: ASK 4's deletion leaves the
hunk-mapping duty intact verbatim, and ASK 3's replacement quotes are exact against the
reference file. Worth recording — the implementer found the batch file's *other* citation
was wrong too: `:217` was off by one (real 218) and `:222` starts the sentence whose path
lands on 223. Both were planning-time errors, and both are now gone in favour of quoted
phrases, which is what makes them survive B03's edit to that very file next wave.

**The optional item was taken, with a rationale instead of a number.** The body-length
ceiling caps each definition at 4096 bytes against current sizes of 865–1214 — 3.4x
headroom — and its comment pre-empts the reflex that rots such ceilings: "Tripping it
means rewrite the body, not raise the number." The re-reviewer assessed it sound for
exactly that reason: the assertion prints the offending file and its real size, so a
future failure diagnoses itself.

**Did the strictness actually close ASK 2's hole?** The re-reviewer reasoned it through
rather than asserting it: `tools:Read, Glob, Grep, Bash` now fails the `:[ \t]+` regex; a
legally quoted `description: "Runs: the steps"` still passes because the guard's
`[^"'\n]*` cannot cross a quote; and the `assert.ok(field, …)` on *every* non-blank line
is what does the real work, killing block scalars and wrapped continuation lines — the
wider version of the same hole.

**Four new ASKs from the scoped pass, deliberately NOT spun into another polish round.**
The contract completes the close on a scoped `SHIP`, and chasing ASKs across unbounded
rounds is a treadmill. They go to `BACKLOG.md` at close-out:

- **BL-004** — the unquoted-`: ` guard still accepts three YAML-invalid forms
  (`description: Runs the steps:`, an unterminated quote, `description: a "b: c" d`).
  These fail-closed on `tools:`, which is asserted literally equal to a fixed string, so
  they can only misparse `description:` — but the end state is the same one ASK 2 named:
  YAML errors on the whole document, no definition loads, the reviewer inherits
  everything. Reached by parse failure rather than a missing key.
- **BL-005** — `readdirSync` is non-recursive, so `.claude/agents/subdir/orchestrator.md`
  escapes the directory whitelist if this Claude Code build loads nested definitions.
- **BL-006** — the size assertion says "bytes" but measures LF-normalized UTF-16 length;
  with em-dashes present, qa-runner reports ~1195 against 1214 on disk. Cosmetic.
- **BL-007** — bookkeeping: no `- [ ] polish:` line was appended for the body-length
  ceiling, so the ledger does not record that optional item as taken.

One observation from the re-reviewer worth keeping, because it looks like an
inconsistency and is not: ASK 3 *added* skeleton quotes to `qa-runner.md` while ASK 4
*deleted* a skeleton restatement from `reviewer.md`. The distinction holds — qa-runner
cites the skeleton as the authority for its unusual tools line, whereas reviewer was
re-issuing a duty the spawn prompt already issues on every spawn.
