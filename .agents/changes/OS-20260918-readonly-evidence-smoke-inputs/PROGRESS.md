# Progress

**Identifier**: OS-20260918-readonly-evidence-smoke-inputs
**Started**: 2026-09-18 · **Base**: f918fe39762c70edb9a3424e54eaa208fd7c5727
**State**: ACTIVE
**Work list**: [01-plan.md](01-plan.md) (see [00-request.md](00-request.md))
**Contract**: [00-READBEFORE.md](00-READBEFORE.md) · **Narrative**: [LOG.md](LOG.md)
**Smoke page**: —
**Rule**: statuses here are claims; **git is truth**.

Scaffolded on codex/readonly-evidence-smoke-inputs-ledger. No wave is open.
B01–B03 remain not started; the new-mode scaffold stops before implementation.

## Plan approval and integration worktree

2026-09-18 user approval, verbatim: "Okay, approved."
Approved plan v4 and portable-command delta; W1 B01+B02, W2 B03, final C1;
no backlog fold-ins. The approval is standing authorization for the wave map;
implementation starts only after the separate start instruction required by new mode.

Integration worktree: C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int
Starting protocol remains frozen at f918fe39762c70edb9a3424e54eaa208fd7c5727.
Planning-only descriptions in retained planning appendices are historical; this
approval activates their requirements without changing their content.

## Execution model

**Waved stack — W1: B01+B02; W2: B03; C1 final after W2.** W1 file fences are disjoint;
B02 attribute scope must also leave every B01 path unchanged; validate effectively.
B03 depends on both and owns shared documentation and visible page changes.
All batches are L. Existing manual fence checks precede independent reviewer and
test-hunter gates in parallel. Literal python validation, triple file-content hash
equality and raw-byte preservation through fresh autocrlf=true checkouts are mandatory.
Node discovery is recursive and sorted by FullName. B03 is the final serialization
point; second FIX FIRST stops, third attempt requires explicit user authorization.
Historical P1-1…P1-4 are already resolved at Base; see the source evidence baked in
the contract/05-byte-validation-and-scope.md. New residuals use OS-BL-NNN and current evidence.

## Legend

- ⬜ Not Started; 🔄 In Progress; 🟢 Integrated (reviewed, validations green on
  worktree and integration tip, awaiting checkpoint); 🧪 At Checkpoint (user verdict
  pending); ❌ Smoke Failed (user only); ✅ Passed (checkpoint passed, shipment per
  merge policy and Git evidence); ⛔ Blocked (defective or green with residual,
  awaiting user); ⛔ (dropped); ❌ (fix-up capped); 👤 User Action.

## Batches

| # | Batch | Branch | Wave | Version | Status | Updated | Notes |
|---|---|---|---|---|---|---|---|
| B01 | Read-only Git evidence and fence checks | codex/readonly-evidence-checker | 1 | — | ⬜ | 2026-09-18 | m: rounds=0 asks=0 fence-bounces=0 gate=0/0 tip-red=0 |
| B02 | Reproducible Excel artifacts | codex/smoke-input-files | 1 | — | ⬜ | 2026-09-18 | m: rounds=0 asks=0 fence-bounces=0 gate=0/0 tip-red=0 |
| B03 | Workflow, generated contract and smoke-page integration | codex/workflow-input-delivery | 2 | — | ⬜ | 2026-09-18 | tip repair pending: fix/B03-tip @7f25d9a2f6befa6d047def65473b34dfa9da6c88; baseline CRLF test-harness failure; repair R1 FIX FIRST @70f6baadd702425ef13741fe59d614232e256744 (frozen 6b proof; code review otherwise clean); explicit user amendment required, not capped; see LOG#baseline-repair-r1 m: rounds=0 asks=0 fence-bounces=0 gate=0/0 tip-red=0 |

## Checkpoints

| Checkpoint | After wave | Covers | Why here | Status | Verdict |
|---|---|---|---|---|---|
| C1 | 2 | B01, B02, B03 | Final; W2 owns hands-on smoke-page/input delivery | ⬜ | — |

## Smoke-test verdict log

| Date | Checkpoint | Verdict | User notes |
|---|---|---|---|

## Item → batch coverage audit

| Request item | Source | Batch | Version | Status |
|---|---|---|---|---|
| 1a checker behavior and tests | request | B01 | — | ⬜ |
| 1b gate wiring and authority | request | B03 | — | ⬜ |
| 2a Git helper and actual-helper scenarios | request | B01 | — | ⬜ |
| 2b evidence-only workflow use | request | B03 | — | ⬜ |
| 3a reproducible Excel, scoped attributes, triple hashes, byte preservation and semantic validation | request | B02 | — | ⬜ |
| 3b raw-byte validation, conductor delivery, invalidation, recursive discovery and reusable-path boundary | request | B03 | — | ⬜ |
| Starting protocol freeze, scheduling/cap and historical baseline evidence | run requirement | B00 conductor | — | baked and source provenance verified at scaffold |

## Session log

| Date | Session did | Stopped because |
|---|---|---|
| 2026-09-18 | Discovery/interview/plan/pre-flight; baseline 64/64; base f918fe39762c70edb9a3424e54eaa208fd7c5727 | Plan approval pending; planning copy, no scaffold or open wave |
| 2026-09-18 | User: "Okay, approved." Approved ledger scaffold; contract/plan and source provenance verified; no wave opened | New-mode scaffold STOP; awaiting start instruction |

## Continue authorization and reconciliation — 2026-09-18

User, verbatim: "This is explicit authorization to start W1 and implement the approved plan. Use Codex sub-agents for implementers, fresh independent reviewers, separate test hunters, and checkpoint QA according to the ledger."

User, verbatim: "Execute W1: B01+B02 concurrently, then W2: B03, proceeding autonomously to final checkpoint C1 unless the contract requires an earlier stop."

User, verbatim: "Do not merge into main or push."

Discovery: one ACTIVE branch-only ledger on codex/readonly-evidence-smoke-inputs-ledger; main checkout remains on main. Owning integration/scaffold 7f25d9a2f6befa6d047def65473b34dfa9da6c88; local shipment refs/heads/main f918fe39762c70edb9a3424e54eaa208fd7c5727, not-contained (Git exit 1). All planned batch branches absent; no checkpoint verdict pending; both worktrees clean. Ledger provenance tree 6c90f82299b58d05209812d6f920c66082d357f9 matches scaffold. Frozen contract and plan unchanged.

Resume validation: 63/64 Node tests pass; failing name "sections survive the fill verbatim and stay inside the script block". Existing CRLF template checkout exposes LF-only test extraction at tests/build-smoke-page.test.cjs:56. No wave opened. Required reviewed mini-batch fix/B03-tip owns tests/build-smoke-page.test.cjs only, plus permitted checklist edits in its repair batch. Literal python verified via authorized execution: Python 3.10.6, openpyxl 3.1.5, recorded Python310 path. Sandbox PATH denial was resolved, not a missing prerequisite.
## Baseline repair gate — user decision required

No W1/W2 batch has started and C1 has not been reached. State USER-BLOCKED records a required explicit contract decision before a green tip can be established; it does not claim a second-review cap or a checkpoint verdict.

| Repair | Branch | Candidate | Status | Evidence/metrics |
|---|---|---|---|---|
| Baseline CRLF assertion portability | fix/B03-tip | 70f6baadd702425ef13741fe59d614232e256744 | 👤 Explicit user amendment required | Manual fence PASS; reviewer R1 FIX FIRST solely on frozen6b proof; hunter CLEAN; 65/65 candidate tests; m: rounds=1 asks=0 fence-bounces=0 gate=0/0 tip-red=0 |

Required decision: authorize only fix/B03-tip to use original CRLF harness failure plus independently verified LF-only mutation evidence in place of section6b's copied-tests-on-base failure requirement. No other rule is waived. A successful 23/23 copied-test run is recorded honestly; no setup failure or inconclusive result is claimed. Repair remains unmerged. Fresh review/hunter evidence is under evidence/baseline-repair/. After an explicit amendment is recorded, the reviewed repair still needs merge-tree dry run, merge and full integration validation before W1 opens.
## Repair-only exception approved — 2026-09-18

User, verbatim: "Approved"

This answers the immediately preceding proposal: approve an exception for fix/B03-tip only, accepting the reproduced original CRLF harness failure plus independently verified LF-only mutation evidence instead of section6b's copied-tests-on-base failure requirement, then resume W1 -> W2 -> C1. This is the entire exception; no other gate, batch or future repair is exempt. Frozen contract and locked plan files remain unchanged; this explicit user amendment is recorded here.

The amendment resolves reviewer R1's sole P0 for candidate70f6baadd702425ef13741fe59d614232e256744. Reviewer code assessment and separate hunter were clean; no source change since their review. The prior23/23 base-copy PASS remains accurately recorded. Conductor may now perform dry run, merge and integration validation. Earlier user-blocked text is historical. No checkpoint verdict or permission to merge into main/push is implied.