# Plan — OS-20260919-agent-tool-restrictions

Sub-agents spawned by this skill currently inherit every tool the session has, including
Artifact, visualize, session-management and the Drive/Gmail connectors — a measured
12–15k tokens of schema per spawn, and on a six-agent session 66–84k wasted. At the same
time the skill's read-only roles are read-only only by request: the prose at
`references/subagent-prompts.md:97`, `:174` and `:240` asks an agent not to edit, while
the agent still holds `Write` and `Edit`. This change gives the four roles explicit
tool-restricted definitions, makes the prompt skeletons name them so the orchestrator
cannot silently fall back to a wildcard agent, and removes a contradiction that has been
sending implementers to read an 81KB contract the prompt already contains.

**Orchestration**: this change runs under [00-READBEFORE.md](00-READBEFORE.md) — that
file is the contract; this one only locks scope, waves, and checkpoints.

## Batch table

| # | Batch | Type | Weight | Branch | Wave | Files (fence) | Smoke | Version |
|---|-------|------|--------|--------|------|---------------|-------|---------|
| 01 | Tool-restricted agent definitions + install docs | feature | S | `feat/agent-definitions` | 1 | `.claude/agents/implementer.md`, `.claude/agents/reviewer.md`, `.claude/agents/test-hunter.md`, `.claude/agents/qa-runner.md`, `README.md`, `tests/agent-definitions.test.cjs` | C1 (hands-on) | — |
| 02 | Contract boot: the prompt is authoritative | fix | S | `fix/contract-prompt-authority` | 1 | `orchestrate/templates/00-READBEFORE.md`, `tests/contract-prompt-authority.test.cjs` | C1 | — |
| 03 | `subagent_type` per skeleton + missing-agent fallback | feature | S | `feat/subagent-type-mapping` | 2 | `orchestrate/references/subagent-prompts.md`, `orchestrate/references/protocol.md`, `tests/subagent-type-mapping.test.cjs` | C1 (hands-on) | — |

## Wave map & checkpoints

- **W1 — B01 + B02.** Safe together: B01 owns `.claude/agents/*`, `README.md` and its own
  new test file; B02 owns `orchestrate/templates/00-READBEFORE.md` and its own new test
  file. The fences share no path, and neither batch reads the other's output — B02's
  contract edit does not mention agent types, and B01's definitions do not reference the
  contract's boot section.
- **W2 — B03.** Alone, because of the dependency below.
- **C1 — final, after W2, covers B01 + B02 + B03.** The only hands-on risk in this change
  is whether Claude Code actually honours the `tools:` frontmatter, and that cannot be
  observed from inside this run: agent definitions load at session start, so the session
  that writes them can never test them. The user must restart. Placing an intermediate
  checkpoint after W1 would buy a second restart and prove *less* — until B03 lands, no
  skeleton names an agent type, so the restart could only test definitions nothing
  references. One restart, one script, after everything is integrated.

**Dependency forcing the wave order**: B03 ships
`tests/subagent-type-mapping.test.cjs`, which asserts that every `subagent_type:` named
in a skeleton resolves to an existing file in `.claude/agents/`. That is the assertion
which permanently prevents the failure this change exists to fix — an orchestrator
defaulting to `general-purpose` with `*` — and it can only pass once B01's four
definition files are on the integration tip. B03 therefore **depends on B01** and runs in
its own wave. B03 does not depend on B02.

No user-decision gates remain: every design choice (where the agents live, the smoke
method, the backlog destination, the merge policy) was resolved at planning time and is
recorded in [00-request.md](00-request.md) §User decisions.

## Smoke-input inventory

**No file-dependent steps.** C1 has no input files, no workbooks, no fixtures and no
stable-id registry: every step is a session restart plus a question put to a freshly
spawned sub-agent, judged on what that agent reports about its own tool list. Nothing is
generated, issued, hashed or reset.

Prerequisites, named explicitly: the user must be able to fully restart Claude Code with
this repo as the working directory, and must be able to spawn sub-agents by
`subagent_type`. No private data, no credentials and no external access are required —
this change touches no user data and contacts no network. The `README.md` install step
(C1 step 5) writes into the user's own `~/.claude/agents/`, which is their machine, not a
disposable environment; the step is therefore `Runner: human` and is worded so that a
user who does not want the global install can verify the command text without running it.

## Backlog fold-ins

none — the repo has no rolling backlog at scaffold time (`bugs-2026-09-17.md` is a dated
review record, off limits per the contract's prohibitions), so no sweep was possible.

## Per-batch specifications

### B01 — Tool-restricted agent definitions + install docs

Verbatim request text for these items:

> Add .claude/agents/ with tool-restricted frontmatter for the four roles.
> There's no such directory today. Define implementer (Read/Write/Edit/Glob/Grep/Bash), reviewer and test-hunter (Read/Glob/Grep/Bash — no Write/Edit), qa-runner (adds browser tools). Drops Artifact, visualize, session, Drive/Gmail/etc from every spawn.
> Payoff: your measured 12–15k per agent. On this session's six agents, 66–84k.
> Second payoff, bigger: the reviewer's read-only guarantee becomes a capability boundary instead of an honor-system request. Worth caveating — Bash can still write, so "read-only" stays partly conventional; removing Write/Edit closes the easy path, not every path.

Plus the user's scaffold-time decision:

> Do we just include the agents in the REPO and the readme tells the user to add them into their agents subfolder?

**Exploration findings.**

- `.claude/` does not exist in this repo at `5110f71`. B01 creates the directory.
- Frontmatter mechanics, confirmed against the Claude Code documentation at planning
  time: `.claude/agents/*.md` supports `name`, `description`, `tools` and `model`.
  `tools:` takes a **comma-separated** list. **Omitting `tools:` inherits every
  subagent-available tool, MCP tools included** — which is precisely the current waste.
  An explicit list is therefore what drops Artifact, visualize, session-management and
  the Drive/Gmail connectors; there is no separate "exclude" to write.
- MCP tools may be named individually (`mcp__<server>__<tool>`) or per server
  (`mcp__<server>__*`). This repo's session exposes the built-in browser as
  `mcp__Claude_Browser__*`.
- `references/scaffolding.md:185` already teaches the scaffolder to *detect*
  `.claude/agents/*.md` whose `tools:` are read-only and treat them as `GATE_AGENTS`
  candidates. B01's `test-hunter` will therefore be auto-detected by future
  `/orchestrate new` runs in this repo. That is intended, and is why the definition's
  `description` must be review-shaped.
- `references/subagent-prompts.md:169` already names a `vacuous-test-hunter` under
  `.claude/agents/` as the repo-local hunter that "replaces this skeleton". B01 names its
  file `test-hunter.md`; B03 owns any wording change in that reference file.

**Design decision — the four tool lists.**

| Role | `tools:` |
|---|---|
| `implementer` | `Read, Write, Edit, Glob, Grep, Bash` |
| `reviewer` | `Read, Glob, Grep, Bash` |
| `test-hunter` | `Read, Glob, Grep, Bash` |
| `qa-runner` | `Read, Write, Edit, Glob, Grep, Bash, mcp__Claude_Browser__*` |

**Flagged deviation from the request — `qa-runner` keeps `Write` and `Edit`.** The
request lists `qa-runner` immediately after the read-only pair and describes it as
"adds browser tools", which reads as the read-only set plus a browser. That would break
the role. The QA runner skeleton at `references/subagent-prompts.md:222` instructs the
runner to *write* `[LEDGER_DIR]/evidence/C[N]/step-[NN].md` for every step it performs,
and at `:217` to "modify only disposable working copies and prove reset". A `qa-runner`
without `Write` could not produce the evidence the checkpoint close-out consumes. B01
therefore gives it the implementer's set plus the browser server, and says so in the
file's own body so the next reader does not "correct" it back. This is the one place B01
knowingly departs from the request's literal wording; it is recorded here, in the batch
file, and in the definition itself.

**Design decision — the Bash caveat is carried, not paraphrased.** The user's own
wording is the clearest statement of the limit and goes into `README.md` and into the
body of both read-only definitions:

> Bash can still write, so "read-only" stays partly conventional; removing Write/Edit
> closes the easy path, not every path.

**Design decision — browser server naming.** `qa-runner` names
`mcp__Claude_Browser__*`, the built-in browser this repo's environment provides. The
definition's body notes that an environment driving the user's Chrome instead should add
`mcp__claude-in-chrome__*`. Naming a server that is absent is harmless, but listing only
what this repo actually has keeps the file honest; the note tells a user what to change.

**README placement.** A new subsection under §Install, after the existing symlink /
junction instructions and before the "Whatever branch the clone has checked out" note.
It must state plainly that the skill install does **not** carry the agents — this is the
scope gap found during the accuracy check, and a user who assumes otherwise gets none of
the saving. Give both a macOS/Linux and a PowerShell command, copying from the clone's
`.claude/agents/` into `~/.claude/agents/`, and mention the per-project alternative
(`<project>/.claude/agents/`). Note that a restart is required and that without the
definitions the skill still works — the skeletons fall back, as B03 documents.

**Edge cases.**

- Do not add a `model:` field. Tier selection is the contract's `ROLE_TIERS` business
  and hard-coding a model in the definition would override the orchestrator's choice.
- `description` must be written for automatic delegation *and* for the scaffolder's
  read-only detection: review-shaped for `reviewer` and `test-hunter`.
- Keep each definition short. These files are read on every spawn; a long body is the
  very cost this change removes.

**Applicable guardrails**: no `package.json` / lockfile / dependency; `git diff --check`
clean (no trailing whitespace, no EOL change); conventional commit message; do not touch
`.agents/archive/`, `bugs-2026-09-17.md`, `orchestrate/SKILL.md`, or any file in B02's or
B03's fence — in particular B01 must **not** add `subagent_type:` lines to the skeletons.

### B02 — Contract boot: the prompt is authoritative

Verbatim request text for this item:

> 3. Resolve the contract-vs-prompt contradiction about the READBEFORE.
> The contract's boot section tells implementers to "read this file + your 02-batches-NN-\*.md batch file ONLY" — that's 81KB ≈ 20k tokens. subagent-prompts.md says the opposite: paste the text in, don't point at files. Change the contract to say the prompt is authoritative and the contract is consulted only if the prompt is incomplete.
> Payoff: up to ~20k per implementer that follows the contract literally, and it's what your three-of-seven zero-orientation-read result already validates.

**Exploration findings.**

- The target is `orchestrate/templates/00-READBEFORE.md:33-36`, the paragraph beginning
  "Implementer sub-agents: read this file + your `02-batches-NN-*.md` batch file ONLY".
  It sits immediately after the orchestrator's four-step §Boot sequence and before
  `## Roles, gates, tiers`.
- The contradiction is real and both sides were read. `references/subagent-prompts.md:4-5`
  says prompts "must stand alone: sub-agents have NO session context, so paste the actual
  text into the prompt (don't just point at files an agent might skip)"; `:366` repeats
  "Paste, don't point: the batch text and contract excerpts go INTO the prompt verbatim."
  The Implementer skeleton at `:25` opens "You have no other context; everything you need
  is below" and then pastes *excerpts* — file fence, conventions, prohibitions, validation
  commands — at `:36-50`. It never tells the implementer to read the contract.
- Size confirmed empirically: the filled contract in the archived ledger is **83,327
  bytes**, ≈20k tokens. The figure in the request is exact.
- **Reach is the template only.** `README.md` states the rollout boundary — "a ledger's
  own contract outranks the skill, so a new skill version changes nothing about ledgers
  already scaffolded; it reaches a repo through the next `/orchestrate new`" — and the
  user confirmed this reading. The archived ledger is not touched. *This* ledger's own
  contract was filled from the unedited template at scaffold time and also keeps the old
  wording; that is correct and expected, and B02 must not edit it either (it is outside
  the fence — `.agents/changes/` is not in any batch's fence).

**Design decision — what the replacement must say.** Three things, and no more:

1. The spawn prompt is authoritative and self-contained: an implementer works from the
   prompt, which already carries the batch text and the binding contract excerpts.
2. This contract is a *reference*, consulted only when the prompt is incomplete,
   self-contradictory, or missing a fact the work needs — and reading it then is reading
   the relevant section, not the file.
3. What survives unchanged from the old paragraph: work only in the worktree the prompt
   names; the batch file is authoritative for scope; do not re-derive scope from the
   original request or any external document.

Point 3 matters — the old paragraph carried real constraints alongside the bad advice,
and a replacement that drops them trades 20k of tokens for a scope-creep hole.

**Edge case — do not break the contract tests.**
`tests/protocol-contract.test.cjs:95-101` asserts that a list of literal strings stays
present in this template, including short generic ones (`'does not'`, `'immutable'`,
`'EVERY'`). The edit is an insertion-and-replacement in one paragraph and must not remove
any of them; run the full suite, which is the only way to know.

**Applicable guardrails**: surgical edit — do not reflow or reformat the surrounding
sections; `git diff --check` clean; no content removed from the template beyond the
replaced paragraph; do not touch `.agents/archive/` or this ledger's own filled contract.

### B03 — `subagent_type` per skeleton + missing-agent fallback

Verbatim request text for this item:

> 2. Make subagent-prompts.md name the agent type per role.
> It currently says nothing about tools or agent types — it enforces read-only in prose at :97, :174, :240. Add a subagent_type: line to each skeleton so the orchestrator can't default to general-purpose with \*, which is exactly what I did six times today.

**Exploration findings.**

- `references/subagent-prompts.md` defines **seven** skeletons, not four:
  `## Implementer` (:21), `## Reviewer (the gate — read-only)` (:93),
  `## Test hunter (optional gate agent — read-only)` (:165),
  `## QA runner (checkpoint pre-smoke)` (:199),
  `## Plan pre-flight (scaffold time — read-only)` (:236),
  `## Convergence (change-complete — read-only)` (:274),
  `## Fix-up implementer (repair mini-batch)` (:292).
  Every one of them must get a `subagent_type:` line — "each skeleton" means seven.
- The three prose read-only lines cited in the request are exact: `:97`
  ("Use only Read/Grep/Glob and read-only git"), `:174`, `:240`. They stay. The
  capability boundary makes them redundant for a correctly-installed repo, but they are
  the only enforcement left in a repo without the definitions.
- `## Spawning rules (orchestrator)` at `:349` is where the cross-cutting rule belongs;
  `:366` already says "Paste, don't point".
- `references/protocol.md:688` is `## Degraded environments`, with the established
  bullet shape "**No gate agents named**: the reviewer alone carries duties (a)–(f)."
  and "**No sub-agents available**: …". The new fallback bullet follows that idiom.

**Design decision — the seven-to-four mapping.**

| Skeleton | line | `subagent_type:` |
|---|---|---|
| Implementer | :21 | `implementer` |
| Reviewer (the gate — read-only) | :93 | `reviewer` |
| Test hunter (optional gate agent — read-only) | :165 | `test-hunter` |
| QA runner (checkpoint pre-smoke) | :199 | `qa-runner` |
| Plan pre-flight (scaffold time — read-only) | :236 | `reviewer` |
| Convergence (change-complete — read-only) | :274 | `reviewer` |
| Fix-up implementer (repair mini-batch) | :292 | `implementer` |

Plan pre-flight and Convergence map to `reviewer` because all three are the same
capability shape: read the repo, judge it, write nothing. Fix-up maps to `implementer`
because a repair mini-batch edits code. Four definitions, seven skeletons, no gaps.

**Design decision — where the line goes.** Immediately above each skeleton's opening
fenced block, as a visible instruction to the orchestrator rather than text inside the
prompt the sub-agent receives. The sub-agent does not need to know its own type; the
orchestrator needs to know what to pass to the Agent tool.

**Design decision — the fallback, and why it is in scope.** A bare
`subagent_type: implementer` fails in any repo that has not installed the definitions,
which is every repo except this one until a user follows B01's README step. Without a
documented fallback this change converts a token saving into a broken spawn. The new
`protocol.md` §Degraded environments bullet must state: when the named types are not
defined, spawn the general-purpose agent, treat the skeleton's prose read-only rules as
the only enforcement, and understand that the per-spawn saving is forfeited until the
definitions are installed. Point at `README.md` for the install.

**Design decision — §Spawning rules gains one rule.** The orchestrator passes
`subagent_type` from the skeleton and never substitutes a wildcard-tool agent for a
read-only role. State the capability boundary and carry the user's caveat: `Bash` remains,
so read-only is partly conventional; removing `Write`/`Edit` closes the easy path, not
every path.

**Edge cases.**

- `tests/protocol-contract.test.cjs:103-106` requires `subagent-prompts.md` to keep
  matching `/inputs/i`, `/reset/i`, `/independen/i`, `/revisio/i` and
  `/(?:private.data|credential)/i`; `:110` requires the exact literal
  `ACTUAL INPUTS: [INPUT ROOT, STABLE-ID REGISTRY`. This batch adds lines and must remove
  nothing — do not touch the `ACTUAL INPUTS:` block at `:213`.
- The same test file's `:118-121` sweep asserts no absolute Windows/Python paths and no
  `fatbo` appear in any `orchestrate/references/*.md`. Do not paste a local path.
- The cross-reference test is the point of the batch: parse every `subagent_type:` value
  out of `subagent-prompts.md` and assert a matching `.claude/agents/<value>.md` exists.
  It passes only on the integration tip with B01 merged — which is why this batch is in
  W2. Do not weaken it to a soft check to make it pass earlier.

**Applicable guardrails**: additive edits only — remove no existing content from either
reference file; surgical, no reflowing; `git diff --check` clean; do not create or edit
any `.claude/agents/*` file (B01's fence); do not edit `orchestrate/SKILL.md` or
`orchestrate/templates/*`.

## Coverage audit (planning-time)

| Request item | Source | Batch | Version | Status |
|---|---|---|---|---|
| `.claude/agents/` directory created | request (change 1) | B01 | — | ⬜ |
| `implementer` tool list | request (change 1) | B01 | — | ⬜ |
| `reviewer` tool list (no Write/Edit) | request (change 1) | B01 | — | ⬜ |
| `test-hunter` tool list (no Write/Edit) | request (change 1) | B01 | — | ⬜ |
| `qa-runner` tool list + browser | request (change 1) | B01 | — | ⬜ |
| Artifact/visualize/session/Drive/Gmail dropped from spawns | request (change 1) | B01 | — | ⬜ |
| Bash caveat recorded verbatim | request (change 1) | B01 | — | ⬜ |
| README install instructions for the agents | user decision 2026-09-19 | B01 | — | ⬜ |
| `subagent_type:` on every skeleton (7) | request (change 2) | B03 | — | ⬜ |
| Orchestrator cannot default to general-purpose `*` | request (change 2) | B03 | — | ⬜ |
| Fallback for repos without the definitions | planning finding | B03 | — | ⬜ |
| Contract: prompt authoritative, contract on demand | request (change 3) | B02 | — | ⬜ |

Zero unassigned items; zero exclusions.

`Pre-flight: CLEAN` — no independent pre-flight sub-agent was spawned (three S batches,
and the plan's own accuracy check against the files served the same purpose; see
[00-request.md](00-request.md) §Accuracy check for the three findings it produced and
[LOG.md](LOG.md) for what was considered and rejected).
