# B01 — Tool-restricted agent definitions + install docs (feature, —)

**Branch**: `feat/agent-definitions`
Cut from the integration tip when the wave opens.
**Wave**: 1 · **Weight**: S
**Depends on**: none
**Smoke gate**: hands-on — checkpoint C1 follows wave 2
**Files**: `.claude/agents/implementer.md`, `.claude/agents/reviewer.md`, `.claude/agents/test-hunter.md`, `.claude/agents/qa-runner.md`, `README.md`, `tests/agent-definitions.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: no `package.json` / lockfile / third-party dependency; `git diff --check` clean (no trailing whitespace, no EOL change); conventional commit message; never touch `.agents/archive/` or `bugs-2026-09-17.md`; do NOT add `subagent_type:` lines to any skeleton (B03 owns that); do NOT edit `orchestrate/SKILL.md` or anything under `orchestrate/`.
**Spec**: [01-plan.md](01-plan.md) §B01 · **Gate**: fence check → one combined reviewer pass (reviewer only — the contract names no gate agents)

## Implementation notes

This section is AUTHORITATIVE. Everything needed is here; do not re-derive scope from the
original request or any external document.

### The request, verbatim

> Add .claude/agents/ with tool-restricted frontmatter for the four roles.
> There's no such directory today. Define implementer (Read/Write/Edit/Glob/Grep/Bash), reviewer and test-hunter (Read/Glob/Grep/Bash — no Write/Edit), qa-runner (adds browser tools). Drops Artifact, visualize, session, Drive/Gmail/etc from every spawn.
> Payoff: your measured 12–15k per agent. On this session's six agents, 66–84k.
> Second payoff, bigger: the reviewer's read-only guarantee becomes a capability boundary instead of an honor-system request. Worth caveating — Bash can still write, so "read-only" stays partly conventional; removing Write/Edit closes the easy path, not every path.

The user's scaffold-time decision about where the files live, verbatim:

> Do we just include the agents in the REPO and the readme tells the user to add them into their agents subfolder?

### Codebase facts gathered at planning time

- `.claude/` does **not** exist in this repo at the ledger base `5110f71`. You are
  creating the directory.
- `.claude/agents/*.md` frontmatter supports `name`, `description`, `tools` and `model`.
  `tools:` takes a **comma-separated** list on one line (`tools: Read, Glob, Grep, Bash`).
- **Omitting `tools:` inherits every subagent-available tool, MCP tools included.** That
  inheritance is the 12–15k-per-spawn waste this batch removes. An explicit `tools:` list
  is the whole mechanism — there is no "exclude" or "deny" field to write, and nothing to
  say about Artifact, visualize, Drive or Gmail beyond leaving them off the list.
- MCP tools can be named per server as `mcp__<server>__*` or individually as
  `mcp__<server>__<tool>`. This environment's built-in browser server is
  `mcp__Claude_Browser__*`.
- `orchestrate/references/scaffolding.md:185` teaches the scaffolder to detect
  `.claude/agents/*.md` whose `tools:` are read-only and whose description is
  review-shaped, as `GATE_AGENTS` candidates. Your `reviewer.md` and `test-hunter.md`
  will be picked up by future `/orchestrate new` runs in this repo — so their
  `description` must read as a review/audit role.
- `orchestrate/references/subagent-prompts.md:169` refers to a repo-local hunter
  "(named in the contract's gate-agent list, e.g. a `vacuous-test-hunter` under
  `.claude/agents/`)". Name your file `test-hunter.md`. Do **not** edit that reference
  file to match — it is in B03's fence.
- `README.md` §Install currently ends with the paragraph beginning "Whatever branch the
  clone has checked out is what runs". Your new subsection goes immediately **before**
  that paragraph, after the PowerShell junction command block.

### The four tool lists — exact

| File | `name` | `tools:` |
|---|---|---|
| `.claude/agents/implementer.md` | `implementer` | `Read, Write, Edit, Glob, Grep, Bash` |
| `.claude/agents/reviewer.md` | `reviewer` | `Read, Glob, Grep, Bash` |
| `.claude/agents/test-hunter.md` | `test-hunter` | `Read, Glob, Grep, Bash` |
| `.claude/agents/qa-runner.md` | `qa-runner` | `Read, Write, Edit, Glob, Grep, Bash, mcp__Claude_Browser__*` |

### Decision you must not "fix": `qa-runner` keeps Write and Edit

The request describes `qa-runner` as "adds browser tools", listed right after the
read-only pair, which reads as *read-only plus a browser*. That would break the role, and
the deviation is deliberate:

- `orchestrate/references/subagent-prompts.md:222` instructs the QA runner to write
  `[LEDGER_DIR]/evidence/C[N]/step-[NN].md` for every step it performs.
- `:217` tells it to "modify only disposable working copies and prove reset".

A `qa-runner` without `Write` cannot produce the evidence a checkpoint close-out consumes.
Give it the implementer's set plus the browser server, and say so in the file's own body
so the next reader does not revert it.

### The caveat to carry, verbatim

Put the user's own wording in `README.md` and in the body of both read-only definitions
(`reviewer.md`, `test-hunter.md`):

> Bash can still write, so "read-only" stays partly conventional; removing Write/Edit
> closes the easy path, not every path.

### What each definition body should contain

Keep bodies SHORT — these files are read on every spawn, and length is the cost this
batch exists to remove. Two to five sentences each: what the role does, the one-line
reason its tool list is what it is, and for the read-only pair the Bash caveat. Do not
restate the prompt skeletons; the orchestrator pastes those. Do **not** add a `model:`
field — model tier is the contract's `ROLE_TIERS` business, and hard-coding it here
would override the orchestrator's choice.

### The README subsection

State plainly, because this is the trap: **installing the skill does not install these
agents.** The skill is a symlink/junction of `orchestrate/` into `~/.claude/skills/`, and
a skill directory cannot carry agent definitions — they must live in `~/.claude/agents/`
(all projects) or `<project>/.claude/agents/` (one project). A user who assumes the
symlink brought them gets none of the saving.

Include: both a macOS/Linux `cp` and a Windows PowerShell `Copy-Item` command copying from
the clone's `.claude/agents/` to `~/.claude/agents/`; the per-project alternative; the
fact that Claude Code must be restarted before definitions take effect; and one line
saying the skill still works without them (the skeletons fall back — B03 documents the
fallback, so word this so it stays true either way, e.g. "the prompt skeletons fall back
to a general-purpose agent and the read-only rules stay prose-enforced"). Carry the Bash
caveat here too.

### The test file

`tests/agent-definitions.test.cjs`, `node:test` CommonJS, matching the existing style in
`tests/protocol-contract.test.cjs` (read files as text from the repo root, assert on
content). It must assert:

- all four files exist at `.claude/agents/<name>.md`;
- each has YAML frontmatter delimited by `---`, with a `name:` matching its filename and a
  non-empty `description:`;
- each `tools:` line equals its exact list from the table above;
- `reviewer.md` and `test-hunter.md` contain neither `Write` nor `Edit` in their `tools:`
  line — asserted on the parsed tool list, not a substring search of the whole file, so
  that prose mentioning the words does not fail the test;
- no definition declares `model:`;
- `README.md` documents the install: it mentions `.claude/agents` and `~/.claude/agents`,
  and says the skill install does not carry them.

Do not assert anything about `subagent_type:` or the contents of
`orchestrate/references/subagent-prompts.md` — that cross-reference is B03's test, and
asserting it here would fail until B03 lands.

## Checklist

- [x] Create `.claude/agents/implementer.md` — frontmatter `name: implementer`, review-free
      description, `tools: Read, Write, Edit, Glob, Grep, Bash`, short body.
- [x] Create `.claude/agents/reviewer.md` — `tools: Read, Glob, Grep, Bash`,
      review-shaped description (the scaffolder detects it), body carries the Bash caveat
      verbatim.
- [x] Create `.claude/agents/test-hunter.md` — `tools: Read, Glob, Grep, Bash`,
      review-shaped description, body carries the Bash caveat verbatim.
- [x] Create `.claude/agents/qa-runner.md` — `tools: Read, Write, Edit, Glob, Grep, Bash, mcp__Claude_Browser__*`,
      body stating why it keeps Write/Edit (evidence files, `subagent-prompts.md:222`) and
      noting that a Chrome-driven environment adds `mcp__claude-in-chrome__*`.
- [x] Add the §Install subsection to `README.md`, before the "Whatever branch the clone
      has checked out" paragraph: the skill install does NOT carry the agents, both install
      commands, the per-project alternative, the restart requirement, the
      works-without-them line, and the Bash caveat.
- [x] Add `tests/agent-definitions.test.cjs` with every assertion listed above.
- [x] Run the validation commands from [00-READBEFORE.md](00-READBEFORE.md); all green.
- [x] `git diff --name-status -M chore/agent-tool-restrictions-ledger...HEAD` plus
      `git status --porcelain`; revert anything outside the fence.
- [x] Commit on `feat/agent-definitions` — `feat: tool-restricted agent definitions for the four roles (batch 01)`.
- [x] polish: ASK 1 — assert `.claude/agents/` holds exactly the four known `.md` files, so a
      fifth definition with no `tools:` line cannot pass unnoticed and ride the README `cp`
      into `~/.claude/agents/`.
- [x] polish: ASK 2 — tighten the frontmatter field parse to `:[ \t]+` plus a well-formed
      single-line guard, so `tools:Read, …` (no space) and an unquoted `: ` in a value fail
      the test instead of parsing as a field YAML would not produce.
- [x] polish: ASK 3 — cite the QA-runner skeleton by quoted phrase instead of bare line
      numbers in `.claude/agents/qa-runner.md` (`:217` was wrong, and B03 shifts both).
- [x] polish: ASK 4 — drop the sentence in `.claude/agents/reviewer.md` that restates duty 1
      of the reviewer skeleton.

## Acceptance criteria

The reviewer checks these against the actual diff:

1. Four definition files exist under `.claude/agents/`, each with valid `---`-delimited
   frontmatter whose `name:` matches its filename.
2. Every `tools:` line matches the table in §Implementation notes exactly — including
   `qa-runner`'s retention of `Write` and `Edit`, which is intentional and justified in
   the file's own body.
3. `reviewer` and `test-hunter` grant no write capability through a listed tool: their
   parsed tool lists contain neither `Write` nor `Edit`.
4. No definition omits `tools:` — an omitted list inherits everything and would defeat
   the batch entirely.
5. No definition declares `model:`.
6. No definition lists an MCP tool other than the browser server on `qa-runner`; in
   particular no Artifact, visualize, session-management, Drive or Gmail tool appears in
   any file.
7. `README.md` states that installing the skill does not install the agents, gives a
   working command for both macOS/Linux and PowerShell, names the per-project
   alternative, and says a restart is required.
8. The user's Bash caveat appears verbatim in `README.md` and in both read-only
   definitions — "read-only" is not claimed as absolute anywhere in the diff.
9. `tests/agent-definitions.test.cjs` fails if any `tools:` line is altered, and asserts
   on parsed tool lists rather than whole-file substring matches for the Write/Edit check.
10. The diff touches nothing outside the fence. Every hunk maps to a checklist item above;
    an unmapped hunk is scope creep and rejects the round.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge. Baseline at the ledger base is 187 pass / 0 fail; this batch adds tests, so the
count must rise and no previously-passing test may fail.

## Smoke (checkpoint)

These steps aggregate into C1's combined script. They cannot run in the session that
writes these files — agent definitions load only at session start.

**You need**: the ability to fully restart Claude Code with this repo as the working
directory, and to spawn sub-agents by `subagent_type`. No test data, no credentials, no
network access.

**Order matters**: step 1 must complete before any other step in this section.

- **Do**: Fully quit and reopen Claude Code, with this repository as the working
  directory. · **Pass**: The session starts with no error about `.claude/agents/`. ·
  **Runner**: human
- **Do**: Spawn a sub-agent with `subagent_type: reviewer` and ask it to list every tool
  it has available. · **Pass**: It reports `Read`, `Glob`, `Grep` and `Bash` and nothing
  else — specifically no `Write`, no `Edit`, and no `mcp__` tool of any kind. · **Runner**:
  human · **Aside**: A self-report is a claim, not proof. If it lists a tool you did not
  expect, that is a fail; if it *declines* to use `Write` rather than reporting `Write` as
  unavailable, treat that as a fail too — declining is the honour system this change was
  meant to replace.
- **Do**: Spawn a sub-agent with `subagent_type: test-hunter` and ask the same question. ·
  **Pass**: Same four tools, no `Write`, no `Edit`, no `mcp__` tool. · **Runner**: human
- **Do**: Spawn a sub-agent with `subagent_type: implementer` and ask the same question. ·
  **Pass**: `Read`, `Write`, `Edit`, `Glob`, `Grep`, `Bash` — and no `mcp__` tool, no
  Artifact, no Drive, no Gmail. · **Runner**: human
- **Do**: Spawn a sub-agent with `subagent_type: qa-runner` and ask the same question. ·
  **Pass**: The implementer's six tools plus the `mcp__Claude_Browser__` browser tools, and
  no other `mcp__` server. · **Runner**: human
- **Do**: Read the new agent-install subsection in `README.md` and confirm the command for
  your platform names a real source path in your clone and your real
  `~/.claude/agents/` destination. Run it only if you want the agents available in every
  project. · **Pass**: The command text is correct for your platform and the source path
  exists; if you ran it, the four files are now in `~/.claude/agents/`. · **Runner**:
  human · **Aside**: This writes into your home directory, not a disposable environment —
  verifying the text without running it is a valid pass.
