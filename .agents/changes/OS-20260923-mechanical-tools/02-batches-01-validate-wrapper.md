# B01 — Validation wrapper `validate.mjs` (feature, —)

**Branch**: `feat/validate-wrapper`
Cut from the integration tip when the wave opens.
**Wave**: 1 · **Weight**: M
**Depends on**: none
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files**: `orchestrate/tools/validate.mjs`, `tests/validate.test.cjs`, `tests/protocol-contract.test.cjs`, `orchestrate/tools/mutate.mjs`, `tests/mutate.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: a guard that SAMPLES its domain (every parser pattern owns a case no other catches) · a hand-rolled parse more permissive than the real consumer (prove the Node parser against the real reporter, not only canned text) · a branch no input reaches · a boundary pinned on one side only · the apparatus corrupts the work (no literal control bytes; live control first) · CRLF/LF equivalence asserted, never assumed
**Spec**: [01-plan.md](01-plan.md) §B01 · **Gate**: fence check → reviewer + test-hunter

## Implementation notes

**Source specification** (Features.md #5, verbatim, as approved for this change):

> **Replaces:** the retyped validation recipe, output trimmed with `tail`, and background
> runs polled with sleep. **Build:** Generated at scaffold time from the interview's
> validation commands. Runs in the foreground and writes the full log to a file. Prints
> exactly one line: `PASS 306/306 (4m38s)` or `FAIL 2/306: <names> — log: <path>`.
> Returns the real exit code. Captures failing test names from the output stream, and
> prints `CRASHED before summary` when the summary never arrives. Uses name-extraction
> patterns for Node, Jest, pytest and Cargo; for anything else it reports the exit code
> and log path. **Evidence:** 162 outputs showing failing tests came back with exit 0
> because of pipes. In R1, a failed merge was hidden behind a chained green validation.

This batch builds the TOOL only. Wiring it into the contract, the scaffold (which will
write each new ledger's `validate.json`) and the prompts is B03/B04. Nothing in this batch
edits Markdown.

### What to build — `orchestrate/tools/validate.mjs`

ESM, `#!/usr/bin/env node`, Node built-ins only, same conventions as the existing tools
(`orchestrate/tools/check-fence.mjs` is the model: a pure exported core, a `…Cli(args)`
function returning `{ code, text }`, and a guarded `import.meta.url` main). Reuse
`parseFlags` from `orchestrate/tools/git-evidence.mjs:359` for flags — it rejects unknown,
duplicate and value-less flags, which is the repo-wide CLI rule ("All tools reject unknown,
duplicate or missing flags; --help documents usage").

**CLI**: `node validate.mjs --spec <file.json> --log <file> [--cwd <dir>] [--timeout <seconds>]`
and `node validate.mjs --help` (exit 0, prints usage including the spec format below).
`--cwd` defaults to the process cwd; `--timeout` applies per step.

**Spec file** (JSON, UTF-8). Exactly this shape — reject anything else with exit 2:

```json
{ "steps": [
  { "name": "tests", "shell": "pwsh", "script": "…multi-line recipe…", "parser": "node" },
  { "name": "diff-check", "argv": ["git", "diff", "--check"], "parser": "none" }
] }
```

- `steps`: non-empty array. `name`: unique, `[A-Za-z0-9._-]+`.
- Exactly ONE of `argv` (non-empty string array, spawned with `shell: false` — no shell
  composition) or `shell` + `script`. `shell` ∈ `pwsh`, `powershell`, `bash`; the script is
  passed as ONE argument: pwsh/powershell → `-NoProfile -NonInteractive -EncodedCommand
  <base64 of the script as UTF-16LE>` — NOT `-Command`: on Windows Node joins argv into one
  command line and Windows PowerShell 5.1 strips embedded double quotes from a `-Command`
  argument; bash → `-o pipefail -c <script>`. The script is data, never concatenated into a
  command string.
- `parser` ∈ `node`, `jest`, `pytest`, `cargo`, `none`. Unknown keys anywhere → exit 2.

**Behaviour**: run every step in order, in the FOREGROUND (no polling, no background),
capturing stdout and stderr as they arrive. Append everything to the `--log` file, each
step preceded by a header line naming the step and its argv/shell. Strip ANSI escape
sequences before parsing (write the escape as the text `\u001b` inside a regex or build it
with `String.fromCharCode(27)` — a literal ESC byte in source fails the repository's
invisible-character sweep in `tests/build-smoke-page.test.cjs`). Run ALL steps even after
one fails (a fast `git diff --check` after a red suite is still information). The child
environment never carries `NODE_TEST_CONTEXT`: a validation run is never a nested test
context (`tests/protocol-contract.test.cjs:299` deletes it for the same reason). A timeout
kills the whole process TREE — on Windows `taskkill /pid <pid> /T /F`, elsewhere a detached
child's process group — because a shell step's grandchildren otherwise keep the pipes open.

**Classification per step** (fail closed — any doubt is a failure, never a pass):

| Condition | Step result |
|---|---|
| parser ≠ none, summary found, 0 failures, exit 0 | pass `<passed>/<total>` |
| parser ≠ none, summary found, failures > 0 (whatever the exit code) | FAIL with names |
| parser ≠ none, summary found, 0 failures, exit ≠ 0 | FAIL `exit <c> after <p>/<t> passed` |
| parser ≠ none, NO summary, exit ≠ 0 | `CRASHED before summary (exit <c>)` |
| parser ≠ none, NO summary, exit 0 | `NO SUMMARY (exit 0)` — a FAIL |
| parser = none | `ok` on exit 0, else `exit <c>` (a FAIL) |
| timeout | `TIMEOUT after <s>s` — child killed, a FAIL |
| cannot start (e.g. ENOENT) | `COULD-NOT-START (<error code>)` |

**Output — exactly ONE line on stdout**, whatever happens (usage errors included):

- `PASS <step>; <step>; … (<duration>)` — e.g. `PASS tests 318/318; diff-check ok (8m33s)`
- `FAIL <step>; <step>; … — log: <path>` — a failing parsed step reads
  `tests 2 of 318 failed: <name>, <name>` (at most 10 names, then `(+k more)`)
- `UNKNOWN <reason>` — usage/spec errors and COULD-NOT-START

Exit code: `0` PASS · `1` FAIL · `2` UNKNOWN. This mirrors `check-fence.mjs` (0/1/2).

**Name extraction** (from ANSI-stripped text; de-duplicate names; sum multiple summaries):

- `node`: spec reporter — failing tests are lines `✖ <name> (<n>ms)` (U+2716); the reporter
  prints each failure TWICE (inline and again under a trailing "failing tests" block), so
  de-duplicate; summary lines `ℹ tests N`, `ℹ pass N`, `ℹ fail N`. TAP reporter — `not ok N -
  <name>`, `# tests N`, `# pass N`, `# fail N`. Accept either.
- `jest`: summary `Tests: … <f> failed, … <p> passed, … <t> total`; names from `● <suite> ›
  <test>` failure headers.
- `pytest`: summary `=+ <f> failed, <p> passed … in <t>s =+` (also `error`/`errors`,
  `skipped`, `deselected` tokens); names from `FAILED <nodeid>` lines in the short test summary.
- `cargo`: one `test result: ok|FAILED. <p> passed; <f> failed; …` per test binary — SUM
  them; names from `test <path> ... FAILED`.

**Load failures.** `node --test` reports a test FILE that fails to load (a syntax error, a
throwing `require`) as one failing "test" named after the file, with a normal summary — so
the summary alone cannot tell a broken harness from a failed assertion. Each parser returns
the failing entries that are load failures separately (`loadFailures`); for `node`, an
entry is a load failure when its name is the path of a test file the run was given or
discovered. B05 classifies a mutation that causes one as CRASHED, not KILLED.

**Exports** (B05's `mutate.mjs` imports these — keep the names and shapes):
`export async function runSpec(spec, { cwd, logPath, timeoutMs })` — returns a Promise of
`{ status: 'PASS'|'FAIL'|'UNKNOWN', line, steps: [{ name, result, passed, failed, total,
names, loadFailures, exit }] }` — and `export function parseRunnerOutput(parser, text)` →
`{ summary: boolean, passed, failed, total, names, loadFailures }`. `logPath` is required.
The CLI is a thin wrapper over `runSpec`.

### Codebase facts gathered at planning

- `tests/protocol-contract.test.cjs:388-393` pins `NON_MARKDOWN` — the exact list of
  non-Markdown files under `orchestrate/` — and `NON_MARKDOWN.length === 5`. A new tool file
  turns it red until it is added **deliberately**: add `orchestrate/tools/validate.mjs` in
  sorted position and change the length pin to 6. That is why this file is in the fence and
  why every tool batch in this change runs in its own wave.
- `tests/interview-sizing.test.cjs:37-46` sweeps EVERY file under `orchestrate/` for
  interview-contradiction patterns (e.g. "merge/combine … questions", "at most N
  questions"). Keep comments in the new tool clear of that vocabulary; the full suite tells
  you if one trips.
- `tests/build-smoke-page.test.cjs` sweeps every non-binary file in the checkout for
  invisible characters (C0 except tab/LF/CRLF, DEL, C1, U+2028/9). U+2716 ✖, U+25CF ● and
  similar printable symbols are fine; ESC must never appear as a literal byte.
- Tests are CommonJS `node:test` files; `tests/check-fence.test.cjs:6` shows the pattern for
  importing an ESM tool (`const api = import('../orchestrate/tools/check-fence.mjs')`). Spawn
  the CLI directly with `spawnSync(process.execPath, […])`: the fixture helper `cli()` in
  `tests/support/git-fixture.cjs:90-95` JSON-parses stdout, and this tool prints one text
  line. Remove `NODE_TEST_CONTEXT` from the environment of any nested `node --test` a test
  runs itself.
- Baseline at the ledger base `fceab31`: **318 pass, 0 fail**; the full recipe took 8m33s at
  scaffold time (with a concurrent disk scan) and ~4.6 min in the previous ledger. The Bash
  tool's hard cap is 10 minutes — relevant to the foreground design; do not add polling.
- Windows: spawn with `shell: false`; resolve `pwsh`/`bash` through PATH as argv[0] (Node's
  `spawn` does this). Expect CRLF in reporter output on Windows.

### Tests — `tests/validate.test.cjs`

Generate every fixture at runtime in `fs.mkdtempSync(os.tmpdir())` directories (no fixture
files are fenced). Fake runners are tiny Node scripts that print a canned transcript and
exit with a chosen code; specs point at them via `argv: [process.execPath, script]`.

- One PASS and one FAIL-with-names case PER parser, and each parser's FAIL case must be one
  that no other parser's patterns classify the same way (a family that loses a pattern must
  go red).
- A LIVE control for `node`: write a real two-test file (one passes, one fails with a
  distinctive name) and run the REAL `node --test --test-reporter=spec` through
  `validate.mjs`; assert the distinctive name is reported and the counts are 1/2. Do the
  same with the TAP reporter. Canned text alone would pin a reporter format this Node may
  not print. A third live control: a test file with a syntax error must come back in
  `loadFailures`, not merely in `names`.
- Every classification row above, including exit-code-wins, NO SUMMARY, TIMEOUT (a fake
  runner that sleeps past `--timeout 1`) and COULD-NOT-START (a nonexistent argv[0]). A
  second TIMEOUT through a SHELL step whose script starts a sleeping grandchild: the run
  must still end within a few seconds of the timeout.
- ANSI-coloured output parses identically to plain output (build the escapes with
  `String.fromCharCode(27)`).
- CRLF and LF transcripts produce identical results — asserted, not assumed.
- The `--log` file contains every step's full output, headers included.
- The single-line contract: stdout is exactly one line in every case (read the FIRST line
  alone when asserting its text).
- A `shell` step through a shell present on this machine: assert that at least one of
  `pwsh`/`bash` is found, so the branch cannot silently skip here, then run a script whose
  exit code must propagate.
- Spec validation: both `argv` and `shell`; neither; empty `steps`; duplicate names;
  unknown key; unknown parser → each exit 2 with `UNKNOWN`.
- Flags: unknown, duplicate, missing → exit 2; `--help` → exit 0.
- `runSpec` and `parseRunnerOutput` are exported with the documented shapes.

## Checklist

- [x] `orchestrate/tools/validate.mjs`: spec loader with strict validation, foreground runner (argv steps; shell steps via `-EncodedCommand` / `bash -o pipefail -c`), `NODE_TEST_CONTEXT` dropped, log file, per-step timeout that kills the process tree, single-line output, exit 0/1/2
- [x] Parsers for node (spec + TAP), jest, pytest and cargo, with ANSI stripping, de-duplication, summed summaries and `loadFailures`
- [x] Exported async `runSpec` and `parseRunnerOutput` with the documented shapes
- [x] `tests/validate.test.cjs` covering every classification row, every parser (own-case rule), the live Node controls, CRLF/LF, ANSI, the log, the one-line contract, spec and flag errors
- [x] `tests/protocol-contract.test.cjs`: register `orchestrate/tools/validate.mjs` in `NON_MARKDOWN` and pin its length at 6
- [x] polish: cli() helper rejects an empty stdout line (stdout longer than the newline alone)
- [x] polish: one-line guard covers the PASS/FAIL line via TAP names carrying each breaker and a breaker in the log path
- [x] polish: log test pins no blank line before a header that follows newline-terminated output
- [x] polish: corpus pins the case-insensitive TAP directive with a lowercase skip entry
- [x] polish: --help's price sentence names the whole false-rejection class (a file-path-named test, an empty describe under spec, a title whose first word holds a slash) and its pin follows
- [x] polish: --help's "Not recognised" sentence covers every way node names such a file (given, globbed, ./-prefixed or discovered) and its pin follows
- [x] polish: the --help contradiction sweep splits on real sentence boundaries, takes the legitimate sentences out verbatim, widens subjects and verdicts, and proves every listed specimen red
- [x] polish: EMPTY_NAMES pins a space in the file's own name (discovered and absolute forms), plus a live discovered emptied file whose name holds a space

## Acceptance criteria

- For every spec, stdout is exactly one line and the exit code is 0 only when every step
  passed; a parsed failure count > 0 yields FAIL even when the child exited 0.
- A step with a parser whose output lacks a summary never yields PASS.
- The live Node controls report the real failing test's name through both reporters.
- Mutating any single parser's name pattern or summary pattern turns at least one test red
  (each parser owns a case).
- A test file that fails to load is reported in `loadFailures` by the real Node reporter.
- A shell step that outlives its timeout ends, grandchildren included, and reports TIMEOUT.
- No literal control byte in either new file; the full validation recipe is green.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

**You need**: the checkpoint's issued inputs `I-01` and `I-02` (see the plan's
smoke-input inventory).

1. **Do**: From the integration worktree root, run `node orchestrate/tools/validate.mjs
   --spec <I-02>/spec.json --log <scratch>/c1-validate-repo.log --timeout 570`, with the
   shell tool's own timeout at its 10-minute maximum.
   **Pass**: exactly one output line beginning `PASS tests `; exit code 0; the log file exists
   and ends with the reporter's summary, whose `ℹ fail` is 0 and whose `ℹ skipped` equals the
   line's total minus its passed count (0 on Windows; on Linux 2, the Windows-only pair in
   `tests/validate.test.cjs`); on Linux the line reads `PASS tests <p>/<t>, 2 skipped (…)`, on
   Windows the plain `PASS tests <t>/<t> (…)`. *(Revision 3, C1 re-issue after the B01 fix-up:
   the line now shows skips. Revision 2 corrected revision 1, which required passed = total —
   impossible on Linux, where the total counts skipped tests.)*
   **Runner**: agent (CLI — Node and PowerShell on this machine).
2. **Do**: Run `node orchestrate/tools/validate.mjs --spec <I-01>/spec.json --cwd <I-01>
   --log <scratch>/c1-validate-fail.log`.
   **Pass**: exactly one line beginning `FAIL tests 1 of 2 failed: fixture fails on
   purpose`, ending with the log path; exit code 1. *(Revision 2 at the C1 re-issue: text
   unchanged, the covered code changed.)*
   **Runner**: agent (CLI).

**Added at the C1 re-issue** (the C1 fail, verdict log 2026-09-25) — **you need**: issued
inputs `I-10` and `I-11` (`evidence/C1/inputs/issue-002/`).

15. **Do**: Run `node orchestrate/tools/validate.mjs --spec <I-10>/spec.json --cwd <I-10>
    --log <scratch>/c1-skip-only.log` (a suite whose only test is skipped).
    **Pass**: exactly one line, `FAIL tests no test passed (0/1, 1 skipped) — log: …`; exit
    code 1. (Before the fix: `PASS tests 0/1`, exit 0.)
    **Runner**: agent (CLI).
16. **Do**: Run `node orchestrate/tools/validate.mjs --spec <I-11>/spec.json --cwd <I-11>
    --log <scratch>/c1-empty-file.log` (a test file that registers no tests, beside a real one).
    **Pass**: exactly one line, `FAIL tests 1 of 2 failed: empty.test.cjs (ran no tests) — log:
    …`; exit code 1. (Before the fix: `PASS tests 2/2`, exit 0.)
    **Runner**: agent (CLI).
