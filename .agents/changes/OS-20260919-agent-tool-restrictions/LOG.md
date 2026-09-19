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
