# B05 — Mutation and probe harness: `mutate.mjs`, `run-at-ref.mjs` (feature, —)

**Branch**: `feat/mutation-harness`
Cut from the integration tip when the wave opens.
**Wave**: 5 · **Weight**: L
**Depends on**: B01, B03, B04
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files**: `orchestrate/tools/mutate.mjs`, `orchestrate/tools/run-at-ref.mjs`, `tests/mutate.test.cjs`, `tests/protocol-contract.test.cjs`, `orchestrate/references/subagent-prompts.md`, `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `.claude/agents/test-hunter.md`, `README.md`, `tests/tool-wiring.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: the apparatus that writes or verifies the work can corrupt it (scratch copies only; restore from saved bytes; live control first) · a GATE's evidence needs a control (every mutation must abort loudly when its anchor is absent) · a branch no input reaches (every abort and cleanup path fed by a test) · a guard whose verdict depends on the checkout (EOL-preserving anchors, CRLF asserted) · positive-only assertions on prose (the hunter's new instruction pinned, hand-built scratch trees swept for)
**Spec**: [01-plan.md](01-plan.md) §B05 · **Gate**: fence check → reviewer + test-hunter

## Implementation notes

**Source specification** (Features.md #6 and build rule 6, verbatim):

> #6 — **Replaces:** every gate agent building its own scratch trees, inline edit scripts,
> anchor retries and restores. **Build:** `mutate --ref <sha> --spec muts.json --run
> "<cmd>"` follows build rule 6. It reports killed or survived per mutation, with the
> failing test names. `run-at-ref <ref> -- <cmd>` gives read-only reviewers a disposable
> checkout. The agents still choose the mutations. **Evidence:** About 950 sub-agent calls
> (≈74M context) were harness work … three recorded false or measured-nothing results: an
> absent anchor reported "67 pass / 0 fail", `git checkout` ate an edit, and Bash collapsed
> `\\b` into a clean result.
>
> Build rule 6 — **Working-tree writes go only to scratch copies.** Restore from saved
> bytes, never with `git checkout`. Abort when an anchor matches anything other than
> exactly once. Run an unmutated control first.

Review of the plan added (2026-09-22 cross-review, accepted into Features.md): require a
passing control, confirm the mutation actually applied, and distinguish an assertion
failure from a broken harness.

### 1 — Disposable checkout (shared by both tools)

Create it with `git clone --shared --no-checkout <repo> <tmp>` then
`git -C <tmp> checkout --detach <sha>`, where `<sha>` is `<ref>` resolved in `<repo>` FIRST
(so `HEAD` of a batch worktree works). A shared clone reads the original's objects without
copying them and registers NOTHING in the user's repository — no `.git/worktrees` entry for
the fence check's worktree inventory to trip over, and no admin directory to fail deleting
(13 cleanup commands in earlier runs printed 92 `Permission denied` lines there). `<tmp>`
is a short directory under `os.tmpdir()` (Windows MAX_PATH: this repository's deepest
tracked path is 146 characters). Remove it in a `finally` with
`fs.rmSync(..., { recursive: true, force: true, maxRetries: 8, retryDelay: 100 })`.
Uncommitted changes are deliberately out of scope: gates run on committed code. Export
the helper (e.g. `withDisposableCheckout(repo, ref, fn)`) from `mutate.mjs`;
`run-at-ref.mjs` imports it.

### 2 — `orchestrate/tools/mutate.mjs`

`node mutate.mjs --repo <repo> --ref <ref> --mutations <muts.json> --validate <spec.json>
--log <file> [--setup <spec.json>] [--timeout <seconds>]` (+ `--help`). `--validate` and
`--setup` are `validate.mjs` spec files; run them with B01's exported `runSpec` (async — a
Promise) — never a second runner. `--log` names a file OUTSIDE the disposable checkout that
every run appends to (control, each mutation, setup), so the `log:` paths in failure lines
stay readable after the checkout is deleted. `runSpec` already drops `NODE_TEST_CONTEXT`
from the child environment.
Mutations file: `{ "mutations": [ { "id": "m1", "file": "<repo-relative path>", "find":
"<exact text>", "replace": "<text>" } ] }`; strict shape, unique ids.

Order, fail closed at every step:

1. Checkout; optional `--setup` (a setup failure → `UNKNOWN setup …`, exit 2).
2. **Anchors first, all of them**: in each target file, `find` must occur EXACTLY once.
   When the file's line endings are CRLF, match and replace with the spec's `\n` converted
   to `\r\n`, so the file's EOL style is preserved. Any zero or multiple match →
   `ANCHOR-MISSING <id>` / `ANCHOR-AMBIGUOUS <id> (<n> matches)`, exit 2, nothing run.
3. **Control**: run `--validate` on the unmutated checkout. Anything but PASS →
   `CONTROL FAILED <validate line>`, exit 2, no mutation applied.
4. Per mutation: save the file's original bytes; write the mutated bytes; re-read and
   confirm the change is present (else `NOT-APPLIED <id>`, exit 2); run `--validate`;
   classify from `runSpec`'s parsed result. **CRASHED** — the mutation proved nothing about
   the tests — when ANY of: no parsed summary; `loadFailures` is non-empty (Node reports a
   test file that fails to load as one failing test named after the file, WITH a summary,
   so a syntax-breaking mutation would otherwise read as KILLED); the run's total differs
   from the control's total. Line: `CRASHED <id>: <validate line>`. Otherwise failures with
   names → `KILLED <id>: <names>`; PASS → `SURVIVED <id>`; timeout → `TIMEOUT <id>`. Then
   restore the saved bytes and verify them byte-for-byte (else `RESTORE-FAILED <id>`, exit
   2, stop).
5. Output: after `CONTROL PASS <validate line>`, one line per mutation in exactly the forms
   above (`KILLED m1: add sums two numbers`, `SURVIVED m2`, …), then one summary line
   `MUTATE <k> killed, <s> survived, <u> other`. An ABORT (steps 1–3, or any usage error)
   prints only its own line(s) — no CONTROL line, no summary. Exit `0` all killed · `1` at
   least one survived and nothing else went wrong · `2` any anchor, control, apply,
   restore, crash, timeout, setup or usage problem.

### 3 — `orchestrate/tools/run-at-ref.mjs`

`node run-at-ref.mjs --repo <repo> --ref <ref> --validate <spec.json> --log <file>
[--setup <spec.json>] [--timeout <seconds>]` → disposable checkout at `<ref>`, runs the
spec, prints ONE line `AT <short sha> <validate.mjs line>`, exits with `validate.mjs`'s
code, removes the checkout.

### 4 — Prose (the hunter uses it)

- `orchestrate/references/subagent-prompts.md`, test-hunter skeleton (lines ~169-201): each
  finding's mutation is PROVEN by running it. The hunter writes, under `[SCRATCHPAD_PATH]`,
  a mutations file and a validate spec SCOPED to the tests the batch added or changed (a
  copy of `[LEDGER_DIR]/validate.json` narrowed to those test files — the full recipe runs
  ~5–9 minutes here, so a control plus even one mutation of it would breach the 10-minute
  shell cap), then runs `node "[SKILL_DIR]/tools/mutate.mjs" --repo [WORKTREE_PATH] --ref
  HEAD --mutations <file> --validate <scoped spec> --log [SCRATCHPAD_PATH]/<label>.log`,
  adding `--setup [LEDGER_DIR]/setup.json` when that file exists (B03 writes it when the
  repository has a setup step; a bare checkout without it fails its control), and cites
  the tool's lines: `SURVIVED` is the evidence; `ANCHOR-*`, `CONTROL FAILED`, `NOT-APPLIED`
  or `CRASHED` means the proof did not run and is reported as such, never as a finding's
  proof. Never hand-build scratch trees, edit scripts or restores. Name `run-at-ref.mjs` for
  running the suite at another ref. Use only slots the renderer already knows (B04) — if a
  new slot is unavoidable, report `NEEDS_FENCE` for `orchestrate/tools/prompt.mjs` rather
  than working around it.
- **The carve-out, as one closed list** — in the skeleton AND in `.claude/agents/test-hunter.md`
  (whose body B04 gave the findings-file exception): the hunter's only writes are its
  findings file, its mutations file and its scoped spec, all under the session scratchpad,
  and running `mutate.mjs` and `run-at-ref.mjs` — which write only disposable clones — is
  permitted. Keep the pinned sentence "Use only Read/Grep/Glob and read-only git; edit
  nothing." (`tests/subagent-type-mapping.test.cjs:187`) intact and qualify it; keep the
  definition's `tools:` line, caveat and size inside `tests/agent-definitions.test.cjs`'s
  pins.
- `README.md`: the "What's in here" tree gains `mutate.mjs` and `run-at-ref.mjs`.
- `orchestrate/templates/00-READBEFORE.md` §Validation commands (the `{{MUTATION_RUNNER}}`
  sentence, line ~254) and the matching gate-agent text in `protocol.md` §Roles: the
  repo-wide mutation runner (a sweep, optional) and `mutate.mjs` (targeted, hunter-chosen)
  are different things; say which does what in one sentence each.
- `tests/tool-wiring.test.cjs`: pin the hunter's instruction (the command, the scoped spec,
  the conditional `--setup`, and the "proof did not run" outcomes) and the closed carve-out
  list in both the skeleton and the agent definition; sweep, with specimens, for a
  directive to hand-build scratch trees or restore with `git checkout` — scoped to the
  test-hunter skeleton and its definition only, because legitimate temporary worktrees are
  described elsewhere (template :591, :635-636; protocol :566, :601;
  `subagent-prompts.md:388`).

### Tests — `tests/mutate.test.cjs`

Build a small git repository at runtime with `tests/support/git-fixture.cjs`: a module, a
`node:test` file that pins it, and a `validate.mjs` spec running `node --test` there.
Spawn the tools directly with `spawnSync(process.execPath, […])` — the fixture helper
`cli()` (`tests/support/git-fixture.cjs:90-95`) JSON-parses stdout.

- One mutation of each outcome: behaviour-breaking → `KILLED` naming the test;
  comment-only → `SURVIVED` (exit 1); syntax-breaking → `CRASHED` through `loadFailures`,
  not KILLED; a mutation that makes a test disappear → `CRASHED` through the total check.
- Every abort, each fed by an input that reaches it: ANCHOR-MISSING, ANCHOR-AMBIGUOUS,
  CONTROL FAILED (a fixture whose suite is red unmutated), NOT-APPLIED and RESTORE-FAILED
  (reach them through an exported core with an injectable file writer — a branch no input
  reaches is untested however correct it is), setup failure, timeout, usage.
- A CRLF target file: the anchor matches, the mutation applies, and the restored bytes are
  CRLF — asserted.
- **The user's repository is untouched** on success AND on every abort path: identical
  `git status --porcelain`, `git worktree list --porcelain`, and branch/HEAD before and
  after; no directory left under the temp root.
- `run-at-ref.mjs` at an older commit whose suite differs, and its exit code.
- Every `log:` path a failure line prints still exists after the run.
- `NON_MARKDOWN` gains both tools in sorted position; length pin 11.

## Checklist

- [x] Shared disposable checkout via `git clone --shared --no-checkout`, removed in `finally`
- [x] `orchestrate/tools/mutate.mjs`: strict spec, `--log` outside the checkout, anchors-first abort, control first, apply check, per-mutation classify with `runSpec` (CRASHED on no summary, load failures or a changed total), byte restore and verify, exit 0/1/2
- [x] `orchestrate/tools/run-at-ref.mjs`: `--log`, one line `AT <sha> <validate line>`, validate's exit code
- [x] Test-hunter skeleton: prove each mutation with `mutate.mjs` on a scoped spec (with `--setup` when `setup.json` exists), outcomes that mean "proof did not run"; `run-at-ref.mjs` named
- [x] The closed carve-out list in the skeleton and in `.claude/agents/test-hunter.md`, pinned sentence intact
- [x] Template and protocol: one sentence each separating the repo mutation runner from `mutate.mjs`; README tools tree gains both tools
- [x] `tests/mutate.test.cjs` covering every outcome and abort, CRLF, live log paths and the untouched user repository; `tests/tool-wiring.test.cjs` pins scoped to the hunter; `NON_MARKDOWN` length 11
- [x] polish: (R2 A) the hunter's blind-spot sentence says what is true — only a one-test file keeps the count — and tells it to check the run's log for a scoped test file reported under its own name; pin updated
- [x] polish: (R2 B) pin `scrubLocalGitEnv` both ways — every listed name dropped whatever its case, and nothing else (GIT_CONFIG_GLOBAL, GIT_CONFIG_NOSYSTEM, GIT_CEILING_DIRECTORIES kept)
- [x] polish: (R2 C) the not-run-as-proof sweep also fires when a not-run kind shares a sentence with a result kind
- [x] polish: (R2 H2-1) a validate step asserts its environment holds none of git's local variables in any case, and a direct `scrubLocalGitEnv` unit call
- [x] polish: (R2 H2-2) the exempted cite passage pinned verbatim, and a sentence naming a not-run kind (bare or in a code span) beside `SURVIVED`/`KILLED` or "finding" is flagged
- [x] polish: (R2 H2-3) a negation-aware family on a bare `git checkout|restore|reset|stash` command, and specimens for the edit-command family's `git apply`, `Add-Content`, `Out-File`
- [x] polish: (R2 H2-4) a CLI run with a fake `git` first on PATH listing nothing, and one listing a non-`GIT_` name: `UNKNOWN git did not list …`, exit 2, repository untouched

## Acceptance criteria

- A mutation is only ever reported KILLED or SURVIVED after a passing control, an
  exactly-once anchor, a confirmed application and a verified restore; every other path
  exits 2 and names what failed.
- A mutation that stops a test file loading, or changes how many tests run, is CRASHED,
  never KILLED.
- The repository passed as `--repo` has identical status, worktree list and HEAD after
  every run, successful or aborted; no scratch directory survives; every printed log path
  exists.
- The test-hunter prompt tells the hunter to prove mutations with `mutate.mjs` on a scoped
  spec and to report a non-running proof as such; the skeleton and the agent definition
  state the same closed list of hunter writes; no shipped text tells the hunter to build
  scratch trees. The full suite is green.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

**You need**: issued input `I-09` — a git bundle of a two-commit fixture repository plus its
mutations files, validate spec and README. **Working copy**: clone it fresh with `git clone
<I-09>/fixture.bundle <scratch>/c1-fixture` before step 11; **reset** = delete that clone and
clone again. The issued bundle is never modified.

11. **Do**: Run `node orchestrate/tools/mutate.mjs --repo <scratch>/c1-fixture --ref HEAD
    --mutations <I-09>/muts.json --validate <I-09>/validate.json --log
    <scratch>/c1-mutate.log`.
    **Pass**: the lines `CONTROL PASS …`, `KILLED m1: add sums two numbers`, `SURVIVED m2`
    and `MUTATE 1 killed, 1 survived, 0 other`; exit code 1; afterwards `git -C
    <scratch>/c1-fixture status --porcelain` prints nothing.
    **Runner**: agent (CLI).
12. **Do**: Run it again with `--mutations <I-09>/muts-bad-anchor.json`.
    **Pass**: exactly one line, `ANCHOR-MISSING m3`, and exit code 2 — no `CONTROL` line, no
    mutation line, no summary (an abort prints only its own line).
    **Runner**: agent (CLI).
13. **Do**: Run `node orchestrate/tools/run-at-ref.mjs --repo <scratch>/c1-fixture --ref
    HEAD~1 --validate <I-09>/validate.json --log <scratch>/c1-at-ref.log`.
    **Pass**: one line beginning `AT ` followed by `HEAD~1`'s short SHA and the result the
    `I-09` README lists for that commit.
    **Runner**: agent (CLI).
