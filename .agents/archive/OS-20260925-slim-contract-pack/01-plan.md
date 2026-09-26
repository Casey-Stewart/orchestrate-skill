# Plan — OS-20260925-slim-contract-pack

The second of the ledgers that replace mechanical orchestration work with commands and rules
(Features.md, untracked). It retires the contract template's copy of the procedure (#14) so every
later feature is written once; fixes the tool CLIs that exit 0 silently through any symlinked
path (BL-028, with the git-env siblings BL-036/037); adds the conductor and agent budget rules
(#15); and ships the prose half of the polish classifier (#8) with BL-044. Order from the
2026-09-25 planning discussion: #14 must precede #9's scaffold tool; #15 and #8-prose land
before the next shipping-app scaffold.

**Orchestration**: this change runs under [00-READBEFORE.md](00-READBEFORE.md) — that
file is the contract; this one only locks scope, waves, and checkpoints.

## Batch table

| # | Batch | Type | Weight | Branch | Wave | Files (fence) | Smoke | Version |
|---|-------|------|--------|--------|------|---------------|-------|---------|
| B01 | Contract slimming: one copy of the procedure | chore | L | `chore/contract-slimming` | 1 | `orchestrate/templates/00-READBEFORE.md`, `orchestrate/templates/PROGRESS.md`, `orchestrate/templates/01-plan.md`, `orchestrate/references/protocol.md`, `orchestrate/references/scaffolding.md`, `orchestrate/references/execution-models.md`, `orchestrate/references/subagent-prompts.md`, `orchestrate/references/smoke-page.md`, `orchestrate/SKILL.md`, `README.md`, `CLAUDE.md`, `tests/protocol-contract.test.cjs`, `tests/tool-wiring.test.cjs`, `tests/contract-prompt-authority.test.cjs`, `tests/prompt.test.cjs`, `tests/build-smoke-page.test.cjs`, `tests/interview-sizing.test.cjs`, `tests/check-ledger.test.cjs` | C1 | — |
| B02 | Tool CLIs run through any symlinked path; git env scrubbed | fix | M | `fix/cli-entry-symlink` | 1 | `orchestrate/tools/check-fence.mjs`, `orchestrate/tools/git-evidence.mjs`, `orchestrate/tools/build-smoke-page.mjs`, `orchestrate/tools/check-ledger.mjs`, `orchestrate/tools/validate.mjs`, `orchestrate/tools/mutate.mjs`, `orchestrate/tools/prompt.mjs`, `orchestrate/tools/run-at-ref.mjs`, `tests/cli-entry.test.cjs`, `tests/mutate.test.cjs`, `tests/validate.test.cjs`, `tests/git-contract.test.cjs` | C1 | — |
| B03 | Conductor and agent budget rules | feature | S | `feat/budget-rules` | 2 | `orchestrate/SKILL.md`, `orchestrate/references/protocol.md`, `orchestrate/references/scaffolding.md`, `orchestrate/references/execution-models.md`, `.claude/agents/qa-runner.md`, `tests/tool-wiring.test.cjs` | C1 | — |
| B04 | Prose polish: comment-only classifier, prose ASKs, one strike | feature | M | `feat/prose-polish` | 3 | `orchestrate/tools/prose-only-diff.mjs`, `tests/prose-only-diff.test.cjs`, `orchestrate/references/protocol.md`, `orchestrate/references/subagent-prompts.md`, `orchestrate/references/execution-models.md`, `orchestrate/SKILL.md`, `.claude/agents/reviewer.md`, `.claude/agents/implementer.md`, `README.md`, `tests/protocol-contract.test.cjs`, `tests/tool-wiring.test.cjs`, `tests/subagent-type-mapping.test.cjs`, `tests/prompt.test.cjs`, `orchestrate/templates/02-batch.md`, `tests/check-fence.test.cjs` | C1 | — |

## Wave map & checkpoints

- **W1: B01 + B02.** Disjoint fences: B01 is documents, templates and the tests that read them;
  B02 is the eight tool files, a new test file and the three tool test files no document
  test shares (`tests/git-contract.test.cjs` moved to B02 at pre-flight: its `:173` pins the
  env behaviour B02 changes). B01 must keep `prompt.mjs`'s parsed contract lines unchanged precisely so that it
  never needs B02's `prompt.mjs` (its batch file says so; a need is `NEEDS_FENCE`). No
  dependency between them.
- **W2: B03 alone.** It shares `SKILL.md`, `protocol.md`, `scaffolding.md`,
  `execution-models.md` and `tests/tool-wiring.test.cjs` with B01 and writes its rules into the
  single copy B01 leaves. (B03 and B04 share `protocol.md`, `SKILL.md`, `execution-models.md` and
  `tests/tool-wiring.test.cjs`, so they cannot pair either.)
- **W3: B04 alone.** It shares `protocol.md`, `subagent-prompts.md`, `SKILL.md` and tests with
  B01/B03, and its new tool uses B02's fixed entry guard and scrubbed `git()`.
- **C1 (final, after W3)** covers B01–B04. No batch is hands-on, so it is the only checkpoint.
  Its steps are agent-run on this machine except one human step: the README recipe on the
  Windows laptop (the user's choice, 2026-09-25), which runs the Windows-only tests and
  B02's junction case; it needs the integration branch pushed, asked at the hand-over.
- **Before W1 opens:** nothing. The #15 control ran during this scaffold and its two temporary
  definitions were removed afterwards (LOG.md §scaffold, Control run).

## Smoke-input inventory

- `I-01` — a fixture git repository for B04's classifier smoke: three commits `c0` → `c1` (a
  comment-only edit of one `.mjs` file, both comment forms) → `c2` (a one-character code change
  in the same file). Generated at close-out by a script under `evidence/C1/inputs/`, validated
  independently (`git log --stat`, the diff read back), issued read-only as a bundle
  (`git bundle create`), cloned into `../c1-scratch/` by the step. Reset: delete the clone.
- `I-02` — a decoy repository for B02's `GIT_DIR` smoke: one commit, a distinctive path name,
  issued read-only as a bundle; the step clones it to `../c1-scratch/decoy` and points `GIT_DIR`
  at the clone's `.git`. Reset: delete the clone.
- `I-03` — a fixture repository holding one ledger `OS-20260101-fixture` generated from the
  SLIMMED template (every placeholder filled with fixture values) plus the `facts.json`
  `prompt.mjs` needs for the implementer role; generated at close-out by a script under
  `evidence/C1/inputs/`, validated independently (`check-ledger.mjs parse` prints `PARSE OK`;
  no `{{` outside code spans), issued as a bundle, cloned into `../c1-scratch/i03`. Reset:
  delete the clone.
- Every other step reads the integration tip only. No private data, credentials or external
  access. The Windows step needs the laptop and the pushed branch.

## Backlog fold-ins

Accepted at plan approval, 2026-09-25 (none on B01, which is L):

- `BL-041` → B02 — shipped `--help` wording residuals in `mutate.mjs` / `validate.mjs` plus the
  `tests/validate.test.cjs` sweep phrasings; all three files are in B02's fence.
- `BL-034` → B03 — `.claude/agents/qa-runner.md:11`'s half-false sentence reworded; in B03's fence.
- `BL-042` → B04 — `tests/tool-wiring.test.cjs:1290`'s stale line-range pointer names the test
  instead; in B04's fence.

## Per-batch specifications

### B01 — Contract slimming

See [02-batches-01-contract-slimming.md](02-batches-01-contract-slimming.md): Features.md #14
verbatim, and eight planning re-derivations (the pin already exists, so the COPY retires, not
the pin; the SHA pin on protocol.md's two tables stays; facts stay, including the Git model
lines `prompt.mjs` parses; the `{{EVIDENCE_TOOL}}`/`{{FENCE_TOOL}}` move; the registry; the
closed-system claims rewritten; precedence; frozen ledgers). Guardrails: prose sweeps that
narrow, positive-only prose assertions, tests that pin the defect, vacuous-until-later docs.

### B02 — CLI entry guard and git env

See [02-batches-02-cli-entry-symlink.md](02-batches-02-cli-entry-symlink.md): BL-028, BL-036,
BL-037 verbatim; eight guarded tools re-derived at `edd2f1e`; fix shape (resolve both sides, a
same-basename mismatch fails loudly); the test's domain enumerated from the checkout with a
live control; failing-on-base for every tool.

### B03 — Budget rules

See [02-batches-03-budget-rules.md](02-batches-03-budget-rules.md): Features.md #15 verbatim; the
control result that drops the per-role effort clause; what ships (no polling, Explore
thoroughness default, scaffold-at-high ask, compaction at boundaries, practices).

### B04 — Prose polish

See [02-batches-04-prose-polish.md](02-batches-04-prose-polish.md): Features.md #8 verbatim (prose
half in scope), BL-044 verbatim, the classifier's interface and fail-closed rules, the
prose-first corpus, the sweeps it must not trip.

## Coverage audit (planning-time)

| Request item | Source | Batch |
|---|---|---|
| R1 — #14 contract slimming, keeping the SHA pin on the single copy of the two decision tables | request | B01 |
| R2 — the `{{EVIDENCE_TOOL}}`/`{{FENCE_TOOL}}` placeholder move (deferred by OS-20260923 to this change) | request | B01 |
| R3 — BL-028's doc half (clone-relative tool paths in protocol.md and smoke-page.md) | request | B01 |
| R4 — BL-028 code fix across all `tools/*.mjs` CLIs, checkout-enumerating symlink test | request | B02 |
| R5 — BL-036 git-evidence env scrub | request | B02 |
| R6 — BL-037 scrub for direct API callers | request | B02 |
| R7 — #15 conductor and agent budget rules, with the control run | request | B03 |
| R8 — #8 prose half: classifier, prose ASK rules, one strike | request | B04 |
| R9 — BL-044 severity is about behaviour, never the fence | request | B04 |
| BL-041 — folded from `BACKLOG.md`, approved 2026-09-25 | backlog BL-041 | B02 |
| BL-034 — folded from `BACKLOG.md`, approved 2026-09-25 | backlog BL-034 | B03 |
| BL-042 — folded from `BACKLOG.md`, approved 2026-09-25 | backlog BL-042 | B04 |

Named exclusions (inside a requested feature, not built, with the reason):

- #14 "#13's stale-install check compares the installed copy against the skill repository, not
  against a hash in the contract" — superseded by the shipped skill-directory hash pin (B01 note 1).
- #14 "After #1 and #4 ship, the procedure prose in `protocol.md` shrinks…" — conditional on
  features this pack does not build.
- #15 "Effort and model per role" (fact-finding at medium) — dropped by the control run's
  result under the rule fixed before it ran (LOG.md §scaffold, Control run; B03).
- #15 "the pre-flight at high, not max" — no per-spawn effort exists and the pre-flight spawns
  as `reviewer`, which every batch review also uses (B03).
- #8 the production/test path partition and `record-round` / `integrate` classification — need
  #1's commands (B04).

Pre-flight: 5 blocking fixed, 9 advisory (see LOG.md)
