# Plan — OS-20260923-mechanical-tools

The first of the ledgers that replace mechanical orchestration work with commands
(Features.md, 2026-09-22). It builds four tools — a validation wrapper, a shared ledger
parser with a scaffold parse check, a prompt renderer with file-based findings, and a
mutation harness — and wires them into the skill so every ledger scaffolded afterwards
runs on them. Nothing here writes ledger state or touches the SHA-pinned doc mirror.
Tools built here are not used by this ledger: they reach the next one after the user
merges and updates the installed skill.

**Orchestration**: this change runs under [00-READBEFORE.md](00-READBEFORE.md) — that
file is the contract; this one only locks scope, waves, and checkpoints.

## Batch table

| # | Batch | Type | Weight | Branch | Wave | Files (fence) | Smoke | Version |
|---|-------|------|--------|--------|------|---------------|-------|---------|
| B01 | Validation wrapper `validate.mjs` | feature | M | `feat/validate-wrapper` | 1 | `orchestrate/tools/validate.mjs`, `tests/validate.test.cjs`, `tests/protocol-contract.test.cjs` | C1 | — |
| B02 | Shared ledger parser and `check-ledger.mjs` | feature | M | `feat/ledger-parser` | 2 | `orchestrate/tools/ledger-parse.mjs`, `orchestrate/tools/check-ledger.mjs`, `orchestrate/tools/check-fence.mjs`, `tests/check-ledger.test.cjs`, `tests/protocol-contract.test.cjs` | C1 | — |
| B03 | Wire the skill pin, validation wrapper and parse check into the contract | feature | L | `feat/contract-tool-wiring` | 3 | `orchestrate/templates/00-READBEFORE.md`, `orchestrate/references/scaffolding.md`, `orchestrate/references/protocol.md`, `orchestrate/SKILL.md`, `README.md`, `tests/tool-wiring.test.cjs` | C1 | — |
| B04 | Rendered prompts and file-based findings: `prompt.mjs` | feature | L | `feat/prompt-renderer` | 4 | `orchestrate/tools/prompt.mjs`, `tests/prompt.test.cjs`, `orchestrate/references/subagent-prompts.md`, `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `orchestrate/SKILL.md`, `.claude/agents/reviewer.md`, `.claude/agents/test-hunter.md`, `README.md`, `tests/subagent-type-mapping.test.cjs`, `tests/tool-wiring.test.cjs`, `tests/protocol-contract.test.cjs` | C1 | — |
| B05 | Mutation and probe harness: `mutate.mjs`, `run-at-ref.mjs` | feature | L | `feat/mutation-harness` | 5 | `orchestrate/tools/mutate.mjs`, `orchestrate/tools/run-at-ref.mjs`, `tests/mutate.test.cjs`, `tests/protocol-contract.test.cjs`, `orchestrate/references/subagent-prompts.md`, `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `.claude/agents/test-hunter.md`, `README.md`, `tests/tool-wiring.test.cjs` | C1 | — |

## Wave map & checkpoints

- **W1: B01** · **W2: B02** · **W3: B03** · **W4: B04** · **W5: B05** — every wave has width
  one, and that is forced, not chosen. Each tool batch must register its new file in the one
  deliberate `NON_MARKDOWN` list in `tests/protocol-contract.test.cjs:388-393` (a pinned
  guard — "add a new tool to this list deliberately"), so B01, B02, B04 and B05 all touch that
  file; B03, B04 and B05 all edit the contract template, `protocol.md` and `README.md`. On top
  of that the dependencies chain: B02 extends B01's registration; B03 wires B01's and B02's
  interfaces; B04 renders from B02's parser and cites B03's pin line and wrapper; B05
  imports B01's runner, uses B03's `setup.json`, and extends B04's hunter prompt and
  carve-out.
- **C1 — final, after W5, covers B01–B05.** The only checkpoint: no batch is hands-on —
  every deliverable is a CLI tool or skill prose, and every smoke step is a command a
  QA-runner sub-agent executes here. C1 asks the user for a VERDICT on that evidence, not for
  labour.
- No user-decision gate remains: the three interview decisions and the plan's scope choices
  are settled at planning.

## Smoke-input inventory

The conductor generates every input at C1 close-out under `evidence/C1/inputs/issue-001/`,
from the integration tip, with a committed generator script, and validates each one
independently before the page is issued. All are synthetic; none needs private data,
credentials or network access. **Working copy and reset**: every issued file is read-only
to the steps — they write only under `<scratch>` (the session scratchpad), and reset means
deleting what a step wrote there; I-09 is used through a fresh clone of its bundle
(`git clone <I-09>/fixture.bundle <scratch>/c1-fixture`), reset by deleting and re-cloning.

| ID | Contents | Independent validation | Used by |
|---|---|---|---|
| I-01 | `validate-fail/`: `one-fails.test.cjs` with two `node:test` tests, `fixture passes` and `fixture fails on purpose` (asserts false); `spec.json` = one argv step NAMED `tests`, `node --test --test-reporter=spec one-fails.test.cjs`, parser `node` | `node --test one-fails.test.cjs` run directly: exit 1, 1 pass, 1 fail | step 2 |
| I-02 | `validate-repo/spec.json` = one `pwsh` shell step NAMED `tests` whose script is the contract's validation recipe, parser `node` | the recipe run directly on the tip exits 0 | step 1 |
| I-03 | a copy of this ledger's directory at the tip with one path removed from B02's `**Files**:` line | `diff` against the tip copy shows exactly that one line | step 4 |
| I-04 | a one-line contract whose `**Skill**:` line pins the tip's `orchestrate` directory with 64 zeros as the hash | line matches the documented form; hash ≠ the real one | step 5 |
| I-05 | a synthetic ledger generated from the tip's templates — every placeholder filled, the pin line naming the tip's `orchestrate` directory and its real hash, one batch `B01` from the templates' example rows, a `validate.json` | `grep` finds no `{{` outside code spans; the hash re-computed independently with Node's `crypto` equals the pin | steps 6, 8, 9 |
| I-06 | I-05's contract with one hex digit of the pin changed | exactly one character differs from I-05's | step 7 |
| I-07 | `facts.json` for rendering I-05's B01 implementer prompt (`repoPath`, `worktreePath`, `scratchpadPath`, `guardrails`, and any other fact the implementer role requires) | parses as JSON; its key set equals the implementer role's required facts as `prompt.mjs --help` (B04) lists them | step 9 |
| I-08 | I-07 without `worktreePath` | differs from I-07 by that key only | step 10 |
| I-09 | `fixture.bundle` — a git bundle (a nested `.git` cannot be committed; git would store a gitlink) of a two-commit repository: `lib.cjs` exporting `add`, `lib.test.cjs` with the test `add sums two numbers` (a second test added at HEAD); beside it `validate.json` (one argv step named `tests`: `node --test --test-reporter=spec lib.test.cjs`), `muts.json` (`m1` turns `a + b` into `a - b`, `m2` edits a comment), `muts-bad-anchor.json` (`m3`, a `find` absent from the file), the generator script, and a README listing the expected lines, including the result at `HEAD~1` | a fresh clone's suite passes at both commits when run directly; `m3`'s `find` text is absent (`grep` exit 1); `git bundle verify` passes | steps 11–13 |

## Backlog fold-ins

none — `BACKLOG.md`'s Open table is empty (closed by `OS-20260921-backlog-closeout`).

## Per-batch specifications

The batch files' Implementation notes are the authoritative, self-contained specs; this
section records the decisions that shape them.

### B01 — Validation wrapper `validate.mjs`

Foreground runner over a JSON spec (argv steps without a shell, or a `pwsh`/`bash` script
passed as one argument), a full log file, per-step timeout, and exactly ONE stdout line with
a real exit code (0 PASS · 1 FAIL · 2 UNKNOWN). Parsers for node (spec + TAP), jest, pytest,
cargo; fail closed — a missing summary is never a pass, a parsed failure is a FAIL even on
exit 0. Exports `runSpec` and `parseRunnerOutput` for B05. Registers itself in
`NON_MARKDOWN`.

### B02 — Shared ledger parser and `check-ledger.mjs`

Moves `check-fence.mjs`'s seven parsers unchanged into `ledger-parse.mjs` (build rule 3:
one parser) and adds `skillPin`. `check-ledger.mjs parse --dir` checks the plan and PROGRESS
tables and every batch file's Branch/Files/Checklist linkage at least as strictly as the
fence tool, proven by a parity test. `check-ledger.mjs skill` hashes the whole skill
directory (CRLF-normalised, sorted relative paths, operating-system litter such as
`Thumbs.db` excluded) and compares it with the contract's
`` **Skill**: `<dir>` · sha256 `<hex>` `` line. The pin covers the whole skill, not only
`tools/`, because B04 renders prompts from `references/` — a refinement of the interview's
"tools dir + hash" answer, approved with this plan.

### B03 — Contract wiring

The template gains the pin line and a boot step that verifies it before reconcile (a
mismatch STOPS for the user's words: upgrade, or the manual procedures); validation runs
go through `validate.mjs` in the foreground, the recipe block staying as the manual
procedure; `{{SKILL_DIR}}` is stored raw and quoted in every command; scaffolding bakes
`{{SKILL_DIR}}` / `{{SKILL_SHA256}}`, writes `validate.json` (and `setup.json` when there is
a setup step), and adds the parse and pin checks to the self-check; SKILL.md's discovery
command resolves from the skill's own directory. **Design consequence, approved with this
plan**: five passages say a ledger "never references this skill"; they are rewritten to
"a ledger references only its pinned skill directory, and bakes a manual procedure for
every tool step, so it stays drivable without the skill". The mirrored evidence section,
`{{EVIDENCE_TOOL}}`/`{{FENCE_TOOL}}`, the SHA-pinned tables and the pinned implementer
paragraph stay untouched.

### B04 — Rendered prompts and file-based findings

`prompt.mjs` renders the six per-batch prompts (implementer, polish, fix round, reviewer,
reviewer round 2, test hunter) from the ledger plus a facts file in one pass over the
skeleton — ledger text that quotes slot tokens passes through untouched — and refuses any
unfilled skeleton slot. The nonce the report must echo on line 2 lives only at the END of
the rendered file's body, never in its name or the pointer. Gate agents write their full
report to one findings file (**a single, named exception to their read-only rule, approved
with this plan**) and return verdict, nonce, counts and path; the orchestrator appends each
findings file to LOG.md byte-for-byte before forwarding its path, so findings survive the
session. The template's pasted-prompt list stays as the manual procedure. #12's three rules
join the implementer and fix-round prompts. QA runner, artifact proofer, pre-flight,
convergence and fix-up stay pasted (a named exclusion, below).

### B05 — Mutation and probe harness

Disposable checkouts by `git clone --shared --no-checkout` (nothing registered in the user's
repository). `mutate.mjs` checks every anchor first, runs a passing control, confirms each
mutation applied, classifies KILLED / SURVIVED through B01's `runSpec` — and CRASHED when
there is no summary, a test file failed to load, or the test count changed — and restores
and verifies the original bytes. `run-at-ref.mjs` runs a spec at any ref. The test-hunter
proves its mutations with the tool on a spec scoped to the batch's tests (the full recipe
is too slow for a control plus mutations under the 10-minute shell cap); its closed list of
writes is stated in the skeleton and its agent definition. Weight L: the first tool that
writes a working tree, across ten files.

### Named exclusions (signed off with this plan)

- Rendering the QA runner, artifact proofer, pre-flight, convergence and fix-up skeletons —
  ledger 4 (checkpoint tools) restructures their inputs.
- Moving `{{EVIDENCE_TOOL}}`/`{{FENCE_TOOL}}` under `{{SKILL_DIR}}` — ledger 2, which edits
  the doc mirror anyway (reconcile and failing-on-base enter it).
- Implementers running the fence tool after committing (#2's other half), #12's sub-agent
  error digest script (its three prompt rules ARE in scope, R7), and features #1, #4,
  #7–#11, #13 — later ledgers.

## Coverage audit (planning-time)

| Request item | Source | Batch |
|---|---|---|
| R1 — validation wrapper (#5) | request | B01 |
| R2 — shared ledger parser (build rule 3) and scaffold parse check (#2) | request | B02 |
| R3 — skill-directory SHA-256 pin: the hash command | request (interview 2026-09-23) | B02 |
| R4 — pin, wrapper and parse check wired into contract, scaffold and SKILL.md | request (interview 2026-09-23) | B03 |
| R5 — SKILL.md discovery command resolvable outside this repository | planning proposal, approved 2026-09-23 | B03 |
| R6 — rendered prompts and file-based findings (#3) | request | B04 |
| R7 — #12's three prompt rules | planning proposal, approved 2026-09-23 | B04 |
| R8 — mutation harness, disposable checkout, and the hunter's use of it (#6) | request | B05 |

Pre-flight: 10 blocking fixed, 13 advisory (see LOG.md)
