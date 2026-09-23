# Progress

**Identifier**: OS-20260923-mechanical-tools
**Started**: 2026-09-23 · **Base**: fceab31e0ebfb7859a75dda3cb1e4be2f86c2403 (the default-branch commit the ledger
branch was cut from — the "since" point for the first checkpoint's diff and for convergence)
**State**: ACTIVE
**Work list**: [01-plan.md](01-plan.md) (see [00-request.md](00-request.md))
**Contract**: [00-READBEFORE.md](00-READBEFORE.md) · **Narrative**: [LOG.md](LOG.md)
(read on demand by heading, never at boot)
**Smoke page**: — (current delivery: URL, ledger-relative HTML path, or `plain text`; update at each hand-over)
**Rule**: statuses here are claims; **git is truth**. Reconcile against branches/commits
before believing any row (§Recovery in the contract).

## Execution model

**Waved stack — W1: B01; W2: B02; W3: B03; W4: B04; W5: B05. Checkpoint: C1 final after W5, fully agent-run** — every wave has width one by necessity, not choice: each tool batch registers its new file in the one deliberate `NON_MARKDOWN` list in `tests/protocol-contract.test.cjs`, the three wiring-bearing batches share the contract template, `protocol.md` and `README.md`, and the batches chain by dependency (B02 on B01; B03 on B01 and B02; B04 on B02 and B03; B05 on B01, B03 and B04). No batch is hands-on — every deliverable is a CLI tool or skill prose verified by commands — so the mandatory final checkpoint is the only one, and a QA runner performs every one of its steps.

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
| B01 | Validation wrapper `validate.mjs` | `feat/validate-wrapper` | 1 | — | 🟢 | 2026-09-23 | merged `437c42a` (R1 FIX FIRST @fbe839e → R2 SHIP @a70582d asks=4 → polish @0310056); tip red (bash = WSL launcher under PowerShell) → repair `fix/B01-tip` merged `224a84c` (repair R1 FIX FIRST @56b8e1c → R2 SHIP @6f5bfc3 asks=4 → polish @c1babae; failing-on-base proven from real PowerShell); tip `224a84c` 357/357; tier default (implementer, reviewers, hunters); residuals: POSIX grace-path holder left running, bash timeout path unexercised on Windows, `pytest -q` unsupported (fails closed) — LOG "2026-09-23 — continue" §B01 · m: rounds=1 asks=8 fence-bounces=0 gate=20/3 tip-red=1 |
| B02 | Shared ledger parser and `check-ledger.mjs` | `feat/ledger-parser` | 2 | — | ⛔ | 2026-09-23 | ⛔ green, residual finding open (P1): parse passes a ledger id failing validId / a batch-file path failing validPath that the fence refuses at usage (`OS-20260923-café` → PARSE OK; fence UNKNOWN usage) — LOG §B02 round 2. fence PASS @7516682, R1 FIX FIRST @7516682; fence PASS @29430d6, R2 FIX FIRST @29430d6 (+ 3 reviewer ASKs, 6 hunter ASKs, test-only); branch green 409/409 from real PowerShell; tier default. Awaiting verdict: fix again / ship with the residual / drop |
| B03 | Wire the skill pin, validation wrapper and parse check into the contract | `feat/contract-tool-wiring` | 3 | — | ⬜ | 2026-09-23 | — |
| B04 | Rendered prompts and file-based findings: `prompt.mjs` | `feat/prompt-renderer` | 4 | — | ⬜ | 2026-09-23 | — |
| B05 | Mutation and probe harness: `mutate.mjs`, `run-at-ref.mjs` | `feat/mutation-harness` | 5 | — | ⬜ | 2026-09-23 | — |

## Checkpoints

| Checkpoint | After wave | Covers | Why here | Status | Verdict |
|------------|------------|--------|----------|--------|---------|
| C1 | W5 | B01, B02, B03, B04, B05 | the mandatory final checkpoint and the only one: no batch is hands-on, and every smoke step is agent-run | ⬜ | — |

## Issued checkpoint inputs

None yet. C1's inputs `I-01`…`I-09` are generated at its close-out, per the plan's
smoke-input inventory, under `evidence/C1/inputs/issue-001/`.

## Smoke-test verdict log

| Date | Checkpoint | Verdict | User notes |
|------|------------|---------|------------|

## Item → batch coverage audit

| Request item | Source | Batch | Version | Status |
|--------------|--------|-------|---------|--------|
| R1 — validation wrapper (#5) | request | B01 | — | ⬜ |
| R2 — shared ledger parser (build rule 3) and scaffold parse check (#2) | request | B02 | — | ⬜ |
| R3 — skill-directory SHA-256 pin: the hash command | request (interview 2026-09-23) | B02 | — | ⬜ |
| R4 — pin, wrapper and parse check wired into contract, scaffold and SKILL.md | request (interview 2026-09-23) | B03 | — | ⬜ |
| R5 — SKILL.md discovery command resolvable outside this repository | planning proposal, approved 2026-09-23 | B03 | — | ⬜ |
| R6 — rendered prompts and file-based findings (#3) | request | B04 | — | ⬜ |
| R7 — #12's three prompt rules | planning proposal, approved 2026-09-23 | B04 | — | ⬜ |
| R8 — mutation harness, disposable checkout, and the hunter's use of it (#6) | request | B05 | — | ⬜ |

## Session log

| Date | Session did | Stopped because |
|------|-------------|-----------------|
| 2026-09-23 | Scaffold: discovery (no active ledger), interview, plan, pre-flight, approval; base `fceab31`, baseline 318/318, tip `fd3f922` 318/318 — LOG "2026-09-23 — scaffold" | scaffold complete; wave 1 opens on the user's word |
| 2026-09-23 | `continue`: discovery (one ACTIVE ledger), reconcile clean (all ⬜, no batch branches), resume-time validation on `2238eac` 318/318 + diff-check clean (8m40s); W1 opened — wave base `2238eac`, B01 on `feat/validate-wrapper`; B01 R1 FIX FIRST → R2 SHIP asks=4 → polish → merged `437c42a`; tip red → repair `fix/B01-tip` (2 rounds + polish) merged `224a84c`, tip 357/357 → B01 🟢; W2 opened — wave base `955f549`, B02 on `feat/ledger-parser`; B02 R1 FIX FIRST → R2 FIX FIRST → ⛔ green, residual finding open (P1) | B02 capped at two FIX FIRST rounds — awaiting the user's verdict |
