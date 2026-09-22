# Request (2026-09-19, verbatim)

Invoked as `/orchestrate new`. The request body, word for word:

> Look at these 3 changes, confirm their ideas are accurate, then orchestrate.
>
> Add .claude/agents/ with tool-restricted frontmatter for the four roles.
> There's no such directory today. Define implementer (Read/Write/Edit/Glob/Grep/Bash), reviewer and test-hunter (Read/Glob/Grep/Bash — no Write/Edit), qa-runner (adds browser tools). Drops Artifact, visualize, session, Drive/Gmail/etc from every spawn.
> Payoff: your measured 12–15k per agent. On this session's six agents, 66–84k.
> Second payoff, bigger: the reviewer's read-only guarantee becomes a capability boundary instead of an honor-system request. Worth caveating — Bash can still write, so "read-only" stays partly conventional; removing Write/Edit closes the easy path, not every path.
>
> 2. Make subagent-prompts.md name the agent type per role.
> It currently says nothing about tools or agent types — it enforces read-only in prose at :97, :174, :240. Add a subagent_type: line to each skeleton so the orchestrator can't default to general-purpose with \*, which is exactly what I did six times today.
>
> 3. Resolve the contract-vs-prompt contradiction about the READBEFORE.
> The contract's boot section tells implementers to "read this file + your 02-batches-NN-\*.md batch file ONLY" — that's 81KB ≈ 20k tokens. subagent-prompts.md says the opposite: paste the text in, don't point at files. Change the contract to say the prompt is authoritative and the contract is consulted only if the prompt is incomplete.
> Payoff: up to ~20k per implementer that follows the contract literally, and it's what your three-of-seven zero-orientation-read result already validates.

## Accuracy check (2026-09-19, requested before orchestration)

The user asked for the three ideas to be confirmed before planning. Verified against the
files at `5110f71`:

**Change 1 — mechanism correct, one scope gap.** `.claude/agents/` does not exist
(confirmed). `tools:` is a real frontmatter field taking a comma-separated list; omitting
it inherits every subagent-available tool **including MCP tools**, so the stated drop of
Artifact / visualize / session / Drive / Gmail is accurate. The caveat about Bash is
correct and is carried into the deliverable verbatim.

The gap: the skill installs by symlinking `orchestrate/` into `~/.claude/skills/`
(`README.md` §Install), and **a skill directory cannot ship agent definitions** — they
must live at `~/.claude/agents/` or `<project>/.claude/agents/`. A repo-root
`.claude/agents/` therefore serves sessions working *in this repo* (the measured 66–84k,
real and immediate) but reaches no installed user. Resolved by the user's decision below.

Secondary: the request names four roles, but `subagent-prompts.md` defines **seven**
skeletons (Implementer, Reviewer, Test hunter, QA runner, Plan pre-flight, Convergence,
Fix-up implementer). Four definitions cover seven skeletons, but the mapping must be
explicit — see B03.

**Change 2 — substance correct, one detail overstated.** All three cited lines are exact:
`references/subagent-prompts.md:97`, `:174`, `:240` each enforce read-only in prose. But
"says nothing about tools or agent types" is not quite true — `references/scaffolding.md:185`
already detects repo-local `.claude/agents/*.md` with read-only `tools:` to fill
`GATE_AGENTS`, and `references/subagent-prompts.md:169` names a `vacuous-test-hunter`
under `.claude/agents/`. The concept exists as optional *detection*; what is missing is
the skill *defining* or *naming* the types. The fix stands as requested.

Consequence the request did not cover: a bare `subagent_type: implementer` **breaks in
any repo lacking the definitions**. A documented fallback is required — added to B03's
scope as a `## Degraded environments` entry, matching the existing "No gate agents named"
idiom at `references/protocol.md:688`.

**Change 3 — fully accurate, figures exact.** `templates/00-READBEFORE.md:33` reads
"read this file + your `02-batches-NN-*.md` batch file ONLY", and the identical line
appears in the filled archived ledger, which is **83,327 bytes ≈ 20k tokens**. The
opposing instruction is real: `references/subagent-prompts.md:4` ("paste the actual text
into the prompt (don't just point at files an agent might skip)") and `:366`
("Paste, don't point"), while the Implementer skeleton opens "You have no other context;
everything you need is below" and never tells the implementer to read the contract.

## User decisions

**2026-09-19 — B01 scope (where the agent definitions live).** Asked whether to put them
at the repo root only, also ship them via a plugin manifest, or also scaffold them into
target repos. The user's answer, verbatim:

> Do we just include the agents in the REPO and the readme tells the user to add them into their agents subfolder?

and, selected alongside it: **"Repo root only (as asked)"**. So: the canonical copies
live at `.claude/agents/` in this repo (which auto-activates for sessions working here),
and `README.md` gains install instructions pointing users at that path. No plugin
manifest, no new scaffolder side effect. The plugin route was explicitly deferred as a
possible follow-on change.

**2026-09-19 — change 3 reach.** Selected **"Template only — new ledgers"**: edit
`orchestrate/templates/00-READBEFORE.md` so the change takes effect from the next
`/orchestrate new`, per the rollout boundary in `README.md`. The archived ledger's
83KB contract is **not** rewritten.

**2026-09-19 — smoke method.** Selected **"Fresh session + ask an agent to self-report"**:
the user restarts Claude Code, spawns each of the four roles, and asks it to list its own
tools. Noted at planning time that a self-report is a claim rather than proof, so C1's
step text asks for "tool unavailable" rather than "declined to use it" wherever a Pass
depends on a tool being absent.

**2026-09-19 — backlog.** Selected **"New BACKLOG.md, BL- ids"**. `bugs-2026-09-17.md`
stays untouched as a dated historical review record.

**2026-09-19 — merge policy.** Selected **"Stop at the integration branch"**: merging to
`main` and any push to `origin` require explicit authorization after C1 passes.

**2026-09-19 — plan approval.** Selected **"Approved — scaffold only, stop"**: fill and
commit the ledger, then stop so the batch files and contract can be read before any
implementer runs.

## Item → batch map

| Item | Source | Batch |
|---|---|---|
| Add `.claude/agents/` with tool-restricted frontmatter for the four roles | request (change 1) | B01 |
| `implementer` = Read/Write/Edit/Glob/Grep/Bash | request (change 1) | B01 |
| `reviewer` = Read/Glob/Grep/Bash, no Write/Edit | request (change 1) | B01 |
| `test-hunter` = Read/Glob/Grep/Bash, no Write/Edit | request (change 1) | B01 |
| `qa-runner` = read-only set plus browser tools | request (change 1) | B01 |
| Drop Artifact / visualize / session / Drive / Gmail from every spawn | request (change 1) | B01 (achieved by the explicit `tools:` list; asserted by test) |
| Record the Bash caveat — "read-only" stays partly conventional | request (change 1) | B01 (README + each read-only definition) |
| README tells users to install the agents into their own agents folder | user decision 2026-09-19 | B01 |
| Add a `subagent_type:` line to each skeleton | request (change 2) | B03 |
| Stop the orchestrator defaulting to general-purpose with `*` | request (change 2) | B03 (§Spawning rules + cross-reference test) |
| Fallback for repos without the definitions installed | planning-time finding, accepted | B03 |
| Contract says the prompt is authoritative, contract consulted only if incomplete | request (change 3) | B02 |

Zero unassigned items. No exclusions.
