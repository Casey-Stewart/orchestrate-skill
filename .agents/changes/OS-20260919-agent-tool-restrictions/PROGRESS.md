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
| 01 | Tool-restricted agent definitions + install docs | `feat/agent-definitions` | 1 | — | 🟢 | 2026-09-19 | S/feature. Creates `.claude/agents/` (absent at base). `qa-runner` keeps Write/Edit by design — evidence files, `subagent-prompts.md:222`; flagged deviation from the request's literal wording. Hands-on at C1. W1 open @7b74811; worktree <temp>/claude/wt-os919/b01. Fence PASS (manual — helper UNKNOWN, see LOG R2/R3). R1 SHIP @33a8d5b asks=4 (LOG §B01). Merged 15d47cf. Polish @c72368f; scoped re-review R2 SHIP @c72368f (polish touched two definition bodies — prose/citations only, no frontmatter). 4 new polish-phase ASKs → BACKLOG (LOG §B01 polish). Tier: default. m: rounds=0 asks=4 fence-bounces=0 gate=0/0 tip-red=0 |
| 02 | Contract boot: the prompt is authoritative | `fix/contract-prompt-authority` | 1 | — | 🟢 | 2026-09-19 | S/fix. One paragraph at `templates/00-READBEFORE.md:33-36`. Failing-on-base test: `tests/contract-prompt-authority.test.cjs`. Template only — archive and this ledger's own contract stay as-is. W1 open @7b74811; worktree <temp>/claude/wt-os919/b02. Fence PASS (manual — helper UNKNOWN, see LOG R2/R3). Failing-on-base CONFIRMED by the orchestrator at 7b74811: 4 tests, 1 pass, 3 fail. R1 SHIP @1912369 asks=2 (LOG §B02). Merged 3f441c3. Polish @9cc3375 (test-only — no scoped re-review needed). Tier: default. m: rounds=0 asks=2 fence-bounces=0 gate=0/0 tip-red=0 |
| 03 | `subagent_type` per skeleton + missing-agent fallback | `feat/subagent-type-mapping` | 2 | — | 🔄 | 2026-09-19 | S/feature. Seven skeletons → four types. Depends on B01: its cross-reference test asserts `.claude/agents/<type>.md` exists. Adds the degraded-environments fallback. Hands-on at C1. W2 open @15d47cf; worktree <temp>/claude/wt-os919/b03. fence +README.md (B03, fallback documentation, an unknown subagent_type errors so B01 README sentence is false once B03 lands, 2026-09-19). |

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
| `.claude/agents/` directory created | request (change 1) | B01 | — | 🟢 |
| `implementer` tool list (Read/Write/Edit/Glob/Grep/Bash) | request (change 1) | B01 | — | 🟢 |
| `reviewer` tool list (Read/Glob/Grep/Bash, no Write/Edit) | request (change 1) | B01 | — | 🟢 |
| `test-hunter` tool list (Read/Glob/Grep/Bash, no Write/Edit) | request (change 1) | B01 | — | 🟢 |
| `qa-runner` tool list + browser tools | request (change 1) | B01 | — | 🟢 |
| Artifact/visualize/session/Drive/Gmail dropped from every spawn | request (change 1) | B01 | — | 🟢 |
| Bash caveat recorded verbatim (read-only stays partly conventional) | request (change 1) | B01 | — | 🟢 |
| README tells users to install the agents into their own agents folder | user decision 2026-09-19 | B01 | — | 🟢 |
| `subagent_type:` line on every skeleton (all seven) | request (change 2) | B03 | — | 🔄 |
| Orchestrator cannot default to general-purpose with `*` | request (change 2) | B03 | — | 🔄 |
| Fallback for repos without the definitions installed | planning finding, accepted | B03 | — | 🔄 |
| Contract: prompt authoritative, contract consulted only if incomplete | request (change 3) | B02 | — | 🟢 |

## Session log

| Date | Session did | Stopped because |
|------|-------------|-----------------|
| 2026-09-19 | Scaffold. Verified all three requested changes against the files at `5110f71` (see 00-request.md §Accuracy check): change 3 exact, change 2 substance right with one overstated detail, change 1 correct but scoped narrower than claimed. Interviewed, planned 3 batches / 2 waves / 1 final checkpoint, filled the ledger. Baseline validation green: 187 pass, 0 fail. | User chose "Approved — scaffold only, stop" at plan approval: the ledger is to be read before any implementer runs. Resume with `/orchestrate continue`. |
| 2026-09-19 | Boot + reconcile: all three rows `⬜`, no batch branches — correct pre-wave state, nothing to correct. Resume-time validation green on the integration tip `7b74811` (node --test exit 0, `git diff --check` clean). **Opened wave 1**: cut `feat/agent-definitions` (B01) and `fix/contract-prompt-authority` (B02) from wave base **`7b74811`**, created their worktrees, spawned both implementers concurrently. | (wave 1 in progress) |
| 2026-09-19 | **Environment note, not a plan deviation.** `git worktree add` under the session scratchpad failed with `Filename too long`: the scratchpad prefix (~150 chars) plus this repo's deepest tracked path (146 chars, `.agents/archive/OS-20260918-.../evidence/C1/inputs/issue-001/recursive-discovery/tests/unit/discovery-sentinel.test.cjs`) exceeds the Windows 260-char limit. Worktrees relocated to the short root `<temp>/claude/wt-os919/` — still outside the repo, still disposable, per-worktree setup still n/a. Wave map, fences, gates and checkpoints unchanged. Stale `.git/worktrees/wt-B0*` admin dirs from the archived ledger's run resist `git worktree prune` (permission denied) but are absent from `git worktree list` and block nothing. | — |
| 2026-09-19 | **Wave 1 gated and integrated.** B01 `R1 SHIP @33a8d5b asks=4` → polish `c72368f` → scoped re-review `R2 SHIP` (polish touched two definition bodies; prose/citations only). B02 `R1 SHIP @1912369 asks=2` → polish `9cc3375` (test-only, no scoped re-review). Fence PASS on both by the manual fallback; B02's failing-on-base proven independently by the orchestrator at `7b74811` (4 tests, 1 pass, 3 fail). Merged `--no-ff`: B02 → `3f441c3` (tip green 193/193), B01 → `15d47cf` (tip green **200/200**, baseline 187 + 13 new). Wave-1 worktrees deregistered. **Opened wave 2**: cut `feat/subagent-type-mapping` (B03) from wave base **`15d47cf`**, worktree created, implementer spawned. | (wave 2 in progress) |
| 2026-09-19 | Seven residuals recorded for the close-out backlog, none blocking: **BL-001** dead archive guard at `tests/protocol-contract.test.cjs:122`; **BL-002** `check-fence.mjs` rejects the bare `NN` batch ids the plan template permits, so the mechanical fence gate was unusable all change and every batch used the manual fallback; **BL-003** `unsafe-filter` fires on stock Git-for-Windows LFS config rather than resolved per-path attributes; **BL-004**–**BL-007** from B01's scoped re-review (three YAML-invalid `description:` forms still accepted, non-recursive `readdirSync`, "bytes" that measures UTF-16 length, and a missing polish checklist line). BL-004/005 were deliberately not spun into a further polish round — the contract completes the close on a scoped `SHIP`. Detail in LOG §Residual R1–R3 and §B01 polish. | — |
| 2026-09-19 | **Fence extension granted to B03: `+README.md`.** B03 established empirically — by spawning a probe, not by guessing — that an unknown `subagent_type` **errors** (`Agent type 'implementer' not found. Available agents: claude, claude-code-guide, Explore, general-purpose, Plan, statusline-setup`) rather than falling back. B01's README sentence "the prompt skeletons fall back to a general-purpose agent" was vacuously true before B03 and becomes **false** the moment B03 lands, with no documented recovery for a user who skipped the install. Mechanical test passed: B03 is alone in wave 2, so no same-wave sibling holds `README.md`; no extension was recorded this wave; and it is not a ledger, version or changelog file. The sentence is part of the plan's own item "Fallback for repos without the definitions installed", which the coverage audit assigns to B03 — so the correction belongs to this batch, not to a later repair. | — |
