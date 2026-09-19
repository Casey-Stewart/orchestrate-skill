# Progress

**Identifier**: OS-20260919-agent-tool-restrictions
**Started**: 2026-09-19 · **Base**: 5110f71d8e63142fa1bb55210ab24b870b7af757 (the default-branch commit the ledger
branch was cut from — the "since" point for the first checkpoint's diff and for convergence)
**State**: ACTIVE
**Work list**: [01-plan.md](01-plan.md) (see [00-request.md](00-request.md))
**Contract**: [00-READBEFORE.md](00-READBEFORE.md) · **Narrative**: [LOG.md](LOG.md)
(read on demand by heading, never at boot)
**Smoke page**: — (current delivery: URL, ledger-relative HTML path, or `plain text`; update at each hand-over)
**Rule**: statuses here are claims; **git is truth**. Reconcile against branches/commits
before believing any row (§Recovery in the contract).

## Execution model

**Waved stack — W1: B01+B02; W2: B03. Checkpoints: C1 final after W2** — B01
(`.claude/agents/*` + `README.md`) and B02 (`orchestrate/templates/00-READBEFORE.md`)
touch entirely separate files and neither reads the other's output, so they are safe
concurrently. B03 is alone in W2 because its test asserts that every `subagent_type:`
named in the skeletons resolves to a real definition file — that assertion can only pass
once B01's four agent files are on the integration tip. One checkpoint, final, because
the only hands-on risk in the change (does Claude Code actually honour the `tools:`
frontmatter?) cannot be verified until B03 makes the skeletons name those agents; a
checkpoint after W1 would cost the user a second session restart and prove less.

## Legend

- `⬜ Not Started` · `🔄 In Progress` · `🟢 Integrated` (reviewed, validations green on
  the worktree AND the integration tip, merged; awaiting its covering checkpoint) ·
  `🧪 At Checkpoint` (checkpoint reached, awaiting the USER's combined smoke verdict) ·
  `❌ Smoke Failed` (the USER failed a reached checkpoint — never an agent-found failure) ·
  `✅ Passed` (its checkpoint passed; merged toward the default branch per the merge
  policy — verify with git) · `⛔ Blocked` (`defective`, or `green, residual finding
  open`; awaiting the user's verdict; `⛔ (dropped)` once the user drops it) ·
  `❌ (fix-up capped)` (a checkpoint fix-up failed review twice; awaiting the verdict) ·
  `👤 User Action`

## Batches

| # | Batch | Branch | Wave | Version | Status | Updated | Notes |
|---|-------|--------|------|---------|--------|---------|-------|
| 01 | Tool-restricted agent definitions + install docs | `feat/agent-definitions` | 1 | — | 🔄 | 2026-09-19 | S/feature. Creates `.claude/agents/` (absent at base). `qa-runner` keeps Write/Edit by design — evidence files, `subagent-prompts.md:222`; flagged deviation from the request's literal wording. Hands-on at C1. W1 open @7b74811; worktree <temp>/claude/wt-os919/b01. |
| 02 | Contract boot: the prompt is authoritative | `fix/contract-prompt-authority` | 1 | — | 🔄 | 2026-09-19 | S/fix. One paragraph at `templates/00-READBEFORE.md:33-36`. Failing-on-base test: `tests/contract-prompt-authority.test.cjs`. Template only — archive and this ledger's own contract stay as-is. W1 open @7b74811; worktree <temp>/claude/wt-os919/b02. |
| 03 | `subagent_type` per skeleton + missing-agent fallback | `feat/subagent-type-mapping` | 2 | — | ⬜ | 2026-09-19 | S/feature. Seven skeletons → four types. Depends on B01: its cross-reference test asserts `.claude/agents/<type>.md` exists. Adds the degraded-environments fallback. Hands-on at C1. |

## Checkpoints

| Checkpoint | After wave | Covers | Why here | Status | Verdict |
|------------|------------|--------|----------|--------|---------|
| C1 (final) | 2 | B01, B02, B03 | Agent definitions load only at session start, so no agent in this run can verify its own restrictions — the user must restart. The end-to-end check (skeleton names a type → type exists → type is restricted) needs B03 landed, so an intermediate checkpoint after W1 would cost a second restart and prove less. | ⬜ | — |

## Issued checkpoint inputs

none — C1 has no input files, fixtures or stable-id registry. Every step is a session
restart plus a question put to a freshly spawned sub-agent, judged on what it reports
about its own tool list. Prerequisites, named: the user must be able to fully restart
Claude Code with this repo as the working directory and to spawn sub-agents by
`subagent_type`. No private data, credentials or external access are required. C1 step 6
(the README install command) writes into the user's own `~/.claude/agents/`, which is not
a disposable environment — the step is `human` and passes on verifying the command text
without running it.

## Smoke-test verdict log

| Date | Checkpoint | Verdict | User notes |
|------|------------|---------|------------|
| — | — | — | (no checkpoint reached yet) |

## Item → batch coverage audit

| Request item | Source | Batch | Version | Status |
|--------------|--------|-------|---------|--------|
| `.claude/agents/` directory created | request (change 1) | B01 | — | 🔄 |
| `implementer` tool list (Read/Write/Edit/Glob/Grep/Bash) | request (change 1) | B01 | — | 🔄 |
| `reviewer` tool list (Read/Glob/Grep/Bash, no Write/Edit) | request (change 1) | B01 | — | 🔄 |
| `test-hunter` tool list (Read/Glob/Grep/Bash, no Write/Edit) | request (change 1) | B01 | — | 🔄 |
| `qa-runner` tool list + browser tools | request (change 1) | B01 | — | 🔄 |
| Artifact/visualize/session/Drive/Gmail dropped from every spawn | request (change 1) | B01 | — | 🔄 |
| Bash caveat recorded verbatim (read-only stays partly conventional) | request (change 1) | B01 | — | 🔄 |
| README tells users to install the agents into their own agents folder | user decision 2026-09-19 | B01 | — | 🔄 |
| `subagent_type:` line on every skeleton (all seven) | request (change 2) | B03 | — | ⬜ |
| Orchestrator cannot default to general-purpose with `*` | request (change 2) | B03 | — | ⬜ |
| Fallback for repos without the definitions installed | planning finding, accepted | B03 | — | ⬜ |
| Contract: prompt authoritative, contract consulted only if incomplete | request (change 3) | B02 | — | 🔄 |

## Session log

| Date | Session did | Stopped because |
|------|-------------|-----------------|
| 2026-09-19 | Scaffold. Verified all three requested changes against the files at `5110f71` (see 00-request.md §Accuracy check): change 3 exact, change 2 substance right with one overstated detail, change 1 correct but scoped narrower than claimed. Interviewed, planned 3 batches / 2 waves / 1 final checkpoint, filled the ledger. Baseline validation green: 187 pass, 0 fail. | User chose "Approved — scaffold only, stop" at plan approval: the ledger is to be read before any implementer runs. Resume with `/orchestrate continue`. |
| 2026-09-19 | Boot + reconcile: all three rows `⬜`, no batch branches — correct pre-wave state, nothing to correct. Resume-time validation green on the integration tip `7b74811` (node --test exit 0, `git diff --check` clean). **Opened wave 1**: cut `feat/agent-definitions` (B01) and `fix/contract-prompt-authority` (B02) from wave base **`7b74811`**, created their worktrees, spawned both implementers concurrently. | (wave 1 in progress) |
| 2026-09-19 | **Environment note, not a plan deviation.** `git worktree add` under the session scratchpad failed with `Filename too long`: the scratchpad prefix (~150 chars) plus this repo's deepest tracked path (146 chars, `.agents/archive/OS-20260918-.../evidence/C1/inputs/issue-001/recursive-discovery/tests/unit/discovery-sentinel.test.cjs`) exceeds the Windows 260-char limit. Worktrees relocated to the short root `<temp>/claude/wt-os919/` — still outside the repo, still disposable, per-worktree setup still n/a. Wave map, fences, gates and checkpoints unchanged. Stale `.git/worktrees/wt-B0*` admin dirs from the archived ledger's run resist `git worktree prune` (permission denied) but are absent from `git worktree list` and block nothing. | — |
