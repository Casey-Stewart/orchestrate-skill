# Progress

**Identifier**: OS-20260920-interview-sizing-backlog
**Started**: 2026-09-20 · **Base**: efc4eec (the default-branch commit the ledger
branch was cut from — the "since" point for the first checkpoint's diff and for convergence)
**State**: ACTIVE
**Work list**: [01-plan.md](01-plan.md) (see [00-request.md](00-request.md))
**Contract**: [00-READBEFORE.md](00-READBEFORE.md) · **Narrative**: [LOG.md](LOG.md)
(read on demand by heading, never at boot)
**Smoke page**: — (current delivery: URL, ledger-relative HTML path, or `plain text`; update at each hand-over)
**Rule**: statuses here are claims; **git is truth**. Reconcile against branches/commits
before believing any row (§Recovery in the contract).



## Execution model

**Waved stack — W1: B01; W2: B02+B03+B04+B05; W3: B06; W4: B07. Checkpoint: C1 final after W4, fully agent-run** — B01 runs alone and first because it repairs the fence tool every later batch is gated by:
`validateBatchEdit` accepts only single-line `- [x] polish:` items, while this repository wraps
every checklist line at ~90 characters, and that mismatch (BL-011) produced 48 violations on the
tool’s first real use. Fixing it in wave 1 means waves 2–4 are checked by a working tool instead
of by six manual fallbacks. W2’s four members are mutually file-disjoint and no member reads
another’s output. B06 and B07 each run alone because the documents they must change are
contested: `orchestrate/templates/00-READBEFORE.md` is wanted by B04, B06 and B07, and
`orchestrate/references/execution-models.md` by B06 and B07. One checkpoint, final: after the
user dropped the live `/orchestrate new` trial on 2026-09-20, nothing in this change needs a
device, a GUI, held credentials or a look-and-see judgement, so every C1 step is agent-runnable
and an intermediate checkpoint would prove nothing an earlier wave could not

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
| B01 | Wrapped polish items in the fence tool | `fix/bl-011-wrapped-polish` | 1 | — | 🔄 | 2026-09-20 | Implementer default tier (M), reviewer default tier. 6a fence PASS (0 violations, 0 unknowns); 6b failing-on-base proven by the orchestrator at `0d1f8b7` (84 tests, 81 pass, 3 fail). `R1 SHIP @d0d3fcf asks=6` (reviewer 2 + test-hunter 4, all test-only). Polish carries F1–F4; reviewer ASK 2 declined as a production change → residual for BACKLOG. See [LOG.md](LOG.md) §2026-09-20 — wave 1 › B01. |
| B02 | Interview sizing rule and the topic-5 move | `fix/interview-sizing` | 2 | — | ⬜ | 2026-09-20 | — |
| B03 | Leading YAML indicator characters in frontmatter | `fix/bl-008-yaml-indicators` | 2 | — | ⬜ | 2026-09-20 | — |
| B04 | Name check-attr in the manual fallback | `fix/bl-014-check-attr` | 2 | — | ⬜ | 2026-09-20 | — |
| B05 | A test seam for the unreachable evidence guards | `fix/bl-009-evidence-seam` | 2 | — | ⬜ | 2026-09-20 | — |
| B06 | Smoke-page build identity, sidecar coherence and hand-over proofing | `fix/bl-012-013-017-smoke-page` | 3 | — | ⬜ | 2026-09-20 | — |
| B07 | Self-check code spans and honest runner classification | `fix/bl-010-016-selfcheck-runners` | 4 | — | ⬜ | 2026-09-20 | — |

## Checkpoints

| Checkpoint | After wave | Covers | Why here | Status | Verdict |
|------------|------------|--------|----------|--------|---------|
| C1 | 4 | B01–B07 | The only checkpoint. No batch in this change carries hands-on risk: every deliverable is a file in this repository, and the live `/orchestrate new` trial was dropped by the user on 2026-09-20 once it emerged the installed skill cannot see the integration branch. Every step is `Runner: agent`. | ⬜ | — |

## Issued checkpoint inputs

None issued. No step in this change depends on a file the orchestrator must deliver; every C1
step reads or executes against the repository at the checkpoint build. No private data,
credential or external access is required, and nothing needs a working-copy reset.

## Smoke-test verdict log

| Date | Checkpoint | Verdict | User notes |
|------|------------|---------|------------|


## Item → batch coverage audit

| Request item | Source | Batch | Version | Status |
|--------------|--------|-------|---------|--------|
| A1 merge arithmetic deleted; back-to-back calls default | request | B02 | — | ⬜ |
| A2 compound option labels banned | request | B02 | — | ⬜ |
| A3 confirmations + gaps made load-bearing | request | B02 | — | ⬜ |
| A4 repeat repo collapses the round | request | B02 | — | ⬜ |
| A5 repeats capped, not questions | request | B02 | — | ⬜ |
| A6 topic 5 moved to step 7 | request | B02 | — | ⬜ |
| A7 topic numbers stable; registry row repointed | request | B02 | — | ⬜ |
| A8 SKILL.md agrees | request | B02 | — | ⬜ |
| BL-008 leading YAML indicator characters | backlog BL-008 | B03 | — | ⬜ |
| BL-009 unreachable fail-closed guards | backlog BL-009 | B05 | — | ⬜ |
| BL-010 self-check greps code spans | backlog BL-010 | B07 | — | ⬜ |
| BL-011 wrapped polish items rejected | backlog BL-011 | B01 | — | ⬜ |
| BL-012 build-identity gate has never worked | backlog BL-012 | B06 | — | ⬜ |
| BL-013 sidecar coherence unchecked | backlog BL-013 | B06 | — | ⬜ |
| BL-014 resolved-filter rule names no command | backlog BL-014 | B04 | — | ⬜ |
| BL-015 intermittent suite failure | backlog BL-015 | — | — | **excluded — watch only, user instruction 2026-09-20** |
| BL-016 runner classification | backlog BL-016 | B07 | — | ⬜ |
| BL-017 hand-over commands verified as published | backlog BL-017 | B06 | — | ⬜ |

## Session log

| Date | Session did | Stopped because |
|------|-------------|-----------------|
| 2026-09-20 | Scaffolded `OS-20260920-interview-sizing-backlog` at base `efc4eec` (clean; the hand-applied BL-014 edit was reverted on the user’s instruction first). Interview run as two back-to-back AskUserQuestion calls plus a third after pre-flight, eight decisions recorded verbatim. Pre-flight returned NOT READY with 7 blocking findings; all 7 resolved into the plan (three fences widened, the wave map rebuilt from two waves to four, the live trial dropped). Plan approved "scaffold only, stop". Self-check: `**State**: ACTIVE` present, pre-flight verdict line present, all 14 `#` cells read `Bnn`; the residual grep produced 32 `{{`, 12 `<!--` and 14 `<title>` hits. Every one was checked mechanically — fenced blocks, inline and double-backtick code spans and blockquote lines stripped, then re-grepped: **zero hits survive**, so none is an unfilled slot. Overridden on that basis. This is BL-010 reproducing live in the ledger that fixes it, and B07 inherits the evidence. Two genuine authoring defects the same check caught (a code span broken by an inner backtick, one split across a line break) were repaired before the commit. | Plan approved as scaffold-only. Wave 1 does not open until the user says so. |
| 2026-09-20 | Boot + reconcile: all seven rows `⬜`, none of the seven batch branches existed, main checkout clean and already on the integration branch — correct pre-wave state, nothing to correct. Shipment resolution not exercised: no row is `🧪` and none depends on the shipment target. Resume-time validation green on the integration tip **`0d1f8b7`** (`node --test` exit 0, `git diff --check` exit 0); the orchestrator's quiet-form filter matched no totals line — the spec reporter prefixes its summary with `ℹ`, not `#` — so exit 0 is the recorded gate and the totals are captured at the next tip validation with a corrected filter. **Opened wave 1**: cut `fix/bl-011-wrapped-polish` (B01) from wave base **`0d1f8b7`**, worktree at `%TEMP%\wt920\b01` (outside the repo; the short root keeps this repo's 146-character deepest tracked path under Windows' 260-character limit — the same trap the two previous ledgers hit), per-worktree setup n/a. | (wave 1 in progress) |
