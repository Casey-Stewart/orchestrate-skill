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
| B02 | Shared ledger parser and `check-ledger.mjs` | `feat/ledger-parser` | 2 | — | 🟢 | 2026-09-23 | merged `5c24ece`: R1 FIX FIRST @7516682 → R2 FIX FIRST @29430d6 → ⛔ green, residual P1 → verdict 2026-09-23 fix again spent → third round on feat/ledger-parser @29430d6 → R3 SHIP @be26458 asks=6 → polish @50e669c; tip `5c24ece` 431/431 (9m34s), live `parse` on this ledger PARSE OK 5 batches; tier default (implementer R1–R2, gates R1–R2), strong/opus (third-round implementer, R3 reviewer + hunter); residual: a plan Branch cell naming the integration branch passes parse, fence refuses at usage (parse never reads the contract — user decision, BACKLOG at close-out) — LOG §B02 · m: rounds=2 asks=6 fence-bounces=0 gate=28/4 tip-red=0 |
| B03 | Wire the skill pin, validation wrapper and parse check into the contract | `feat/contract-tool-wiring` | 3 | — | 🟢 | 2026-09-23 | merged `3d3b264`: R1 FIX FIRST @bc68b74 (4 P1; #1 resolved by the user's spec amendment — verdict log) → R2 SHIP @3b3dc03 asks=9 → polish @b7b8454 (load-bearing passages pinned by exact text); tip `3d3b264` 443/443 (10m04s), PARSE OK 5 batches; tier default implementer + hunters, strong/opus reviewers; residuals: `smoke-page.md:85,:93` run `node tools/build-smoke-page.mjs` (skill-dir-relative; exempted, may only shrink), `subagent-prompts.md:50` quiet form (carried to B04), `execution-models.md:136` quiet form (no fence — BACKLOG) — LOG §B03 · m: rounds=1 asks=9 fence-bounces=0 gate=22/4 tip-red=0 |
| B04 | Rendered prompts and file-based findings: `prompt.mjs` | `feat/prompt-renderer` | 4 | — | 🟢 | 2026-09-24 | merged `e8a9ca0`: R1 FIX FIRST @6ecacf9 (3 P1; #1/#2 resolved by the user's scoped-Write decision — verdict log) → fence +tests/agent-definitions.test.cjs (B04, gate-agent Write tool, the user granted the reviewer and test-hunter a scoped Write, 2026-09-23) → R2 FIX FIRST @a73d220 → ⛔ green, residual P1 (the LOG.md recovery command truncated or emptied a findings file) → verdict 2026-09-24 fix again spent → third round on feat/prompt-renderer @a73d220 → R3 SHIP @b004d28 asks=8 → polish @0d6fcef → R4 SHIP @0d6fcef (scoped re-review); tip `e8a9ca0` 466/466 (13m46s); tier default implementer R1–R2 + hunters R1–R2, strong/opus reviewers R1–R4, third-round implementer and R3 hunter; residuals (BACKLOG at close-out): A1's two directives (reject a findings file whose line 1 is not its heading; stop and ask on a non-zero recovery exit), T1's join zero-exit condition, `.claude/agents/qa-runner.md:11` half-false (R2 R3, no fence), R4 S1–S6 and the A1 CRLF-blob case (test-only sweep gaps); `parse --dir` on this ledger now reports B04's extended Files line by design (parse is scaffold-time only), so B02 smoke step 3 is corrected at C1 close-out — LOG §B04 · m: rounds=2 asks=8 fence-bounces=0 gate=40/5 tip-red=0 |
| B05 | Mutation and probe harness: `mutate.mjs`, `run-at-ref.mjs` | `feat/mutation-harness` | 5 | — | 🔄 | 2026-09-24 | implementer DONE @358d45d (default tier; nonce verified; 492/492 under the PowerShell-PATH helper, 7/7 — LOG §B05); gate not started: paused on the user's words, then the work moved to the Linux workstation — resume at the fence check |

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
| 2026-09-23 | B02 | fix again | User, answering the capped-B02 question: "Fix again (Recommended)" |
| 2026-09-23 | B03 | spec amendment (B03 R1 finding 1) | User, answering how the contract should word validation runs that outlast the command timeout: "Allow background task (Recommended)" — i.e. "never pipe or tail it; when it may outlast the runtime's command timeout, run it as a background task whose completion reports the one line and the exit code, and never read the log before it exits" |
| 2026-09-23 | B04 | clarification asked (B04 R1 P1 #2) | User, answering how the gate agents' single-write exception should read: "I didn't think Reviewer and Test-hunter even had ACCESS to write in it's tool lists to begin with?" |
| 2026-09-23 | B04 | design decision (B04 R1 P1 #1 and #2) | User, answering how gate agents should get findings onto disk: "Add Write, scoped (Recommended)" — i.e. add Write (not Edit) to reviewer.md/test-hunter.md tools; prompts limit it to the findings file + disposable scratch under the session scratchpad, never inside a worktree |
| 2026-09-24 | B04 | fix again | User, invoking `/orchestrate continue`: "B04 needs an additional run. i have authorized it. Pickup there." |
| 2026-09-24 | B05 | gate paused | User, while B05's implementer ran: "When the B05 implementer reports back, take it's report, but pause before launching reviewers etc." |
| 2026-09-24 | — | push authorized: `chore/mechanical-tools-ledger` and `feat/mutation-harness` → `origin` | User: "Hi, I want to work on the rest of this on the Linux workstation. Can you chore/mechanical-tools-ledger and B05's branch were never pushed; GitHub has only main push those branches so I can do orchestrate continue on the linux box?" |

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
| 2026-09-23 | Verdict on B02 recorded: fix again — third round on `feat/ledger-parser` @`29430d6`, fresh strong-tier implementer | — |
| 2026-09-23 | B02 R3 SHIP asks=6 → polish → merged `5c24ece`, tip 431/431 → 🟢; W3 opened — wave base `5c24ece`, B03 on `feat/contract-tool-wiring` | — |
| 2026-09-23 | B03 R1 FIX FIRST (validation wording amended by the user) → R2 SHIP asks=9 → polish → merged `3d3b264`, tip 443/443 → 🟢; W4 opened — wave base `3d3b264`, B04 on `feat/prompt-renderer` | — |
| 2026-09-23 | B04 R1 FIX FIRST; user decision: scoped Write for the gate agents; fence +tests/agent-definitions.test.cjs (B04, gate-agent Write tool, the user granted the reviewer and test-hunter a scoped Write, 2026-09-23) | — |
| 2026-09-23 | B04 R2 FIX FIRST → ⛔ green, residual finding open (P1) | B04 capped at two FIX FIRST rounds — awaiting the user's verdict |
| 2026-09-24 | `continue`: discovery (one ACTIVE ledger), reconcile clean (B01–B03 integrated; B04 ⛔ awaiting its verdict; B05 ⬜, no branch), resume-time validation on `2198d7a` 443/443 + diff-check clean (9m38s, real PowerShell); verdict on B04 recorded: fix again — third round on `feat/prompt-renderer` @`a73d220`, fresh strong-tier implementer — LOG "2026-09-24 — continue" | — |
| 2026-09-24 | B04 R3 SHIP asks=8 → polish → R4 scoped re-review SHIP → merged `e8a9ca0`, tip 466/466 → 🟢; W5 opened — wave base `e8a9ca0`, B05 on `feat/mutation-harness` | — |
| 2026-09-24 | B05 implementer DONE @`358d45d`; gate paused on the user's words; `chore/mechanical-tools-ledger` and `feat/mutation-harness` pushed to `origin` on the user's words (verdict log) — LOG "Hand-over to the Linux workstation" | the user moved the work to the Linux workstation; B05 awaits its fence check and reviewer gate |
