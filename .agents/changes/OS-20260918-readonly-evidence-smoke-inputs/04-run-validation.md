# Explicit run validation choices — plan v4

These choices implement the user's 2026-09-18 plan-review instructions. They are
baked into the initial generated contract before any scaffold or implementation;
they are not inherited silently from a later skill revision.

## Python command and environment

Every generation and independent Excel-validation command in this run uses literal
`python`, never `python3`, `py`, an unspecified interpreter placeholder, or an
unannounced bundled substitute. This ledger may record a machine-local path as an
environment fact; reusable templates/references must never hardcode it. B03 must
not propagate this absolute installation path into reusable skill artifacts.
Verified on this machine:

- Python 3.10.6, openpyxl 3.1.5.
- Executable: C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe.

The Codex shell may omit that directory from PATH even though Python is installed.
Before running the literal commands, prepend the verified directory for THIS
process only when needed (no machine/user environment changes):

```powershell
$pythonDirectory = 'C:\Users\fatbo\AppData\Local\Programs\Python\Python310'
$env:Path = $pythonDirectory + ';' + $env:Path
python -c "import sys, openpyxl; print(sys.executable); print(sys.version); print(openpyxl.__version__)"
```

Confirm that sys.executable names the recorded interpreter; log the observed
versions. From the designated worktree root, use:

```text
python tests/fixtures/smoke-inputs/generate-orders.py <new-output.xlsx>
python tests/fixtures/smoke-inputs/validate-orders.py <workbook.xlsx> <requirements.json>
```

Only file arguments above are slots. The conductor fills exact paths in checkpoint
steps, including the issued workbook, requirements and validator copies. The
interpreter token is always literal python. Generation, positive semantic validation
and deliberately corrupted-workbook rejection are mandatory B02 acceptance checks
and agent-run C1 evidence; a missing/alias command error does not waive any check.
If a tool sandbox denies execution, use the environment's authorized execution
route for this recorded interpreter; a failed alias/PATH/permission probe is not
evidence that the Excel prerequisite is unavailable. If execution truly remains
blocked, report that specific blocker and leave validation/B02 incomplete. Never
downgrade the concrete Excel example or mark it complete based only on file hashes.
The general private-data/credentials/external-access exception still applies to
genuine external dependencies, not to this already verified local interpreter.

## Gate for this ledger

For B01, B02 and B03, plus any repair/polish gate, the conductor performs the
EXISTING MANUAL mechanical fence check under the frozen contract: captured
integration/candidate refs, changed paths against plan plus authorized extensions
plus own batch file, both rename endpoints, clean candidate worktree and only
permitted batch-file edits. Record the command/blob evidence before dispatching
the independent gates. The new checker is tested as a deliverable; it does not
replace this run's manual gate, including after B01 is merged. There is no automatic
promotion of the new checker into a gate for this ledger.

At each batch/repair reviewer gate ALREADY required by the frozen contract, run a
fresh independent reviewer AND a separate fresh read-only test hunter in parallel,
on the current inherited model, dispatched by the conductor. The implementer never
spawns either. Ordinary test/doc/prose polish retains its mechanical-only close;
this amendment adds no reviewer or hunter gate to that path. Production-touching
polish retains only its existing fresh scoped re-review (not a full review round);
a hunter inspects any changed verification code within that same scope, without
expanding the review or creating a new round. All three batches are L weight.
Severity, polish, round cap and integration rules remain unchanged. Convergence
stays off; this enables the test-hunter gate only.

## Test hunter instructions (self-contained)

Read this contract's validation, hard-prohibition and applicable-guardrail sections,
the assigned batch, all new/changed test or verification code, and the implementation
it claims to exercise. No separate repo testing catalog exists. Use read-only code
and Git inspection; do not edit repository files, spawn agents or fix anything.
For every test/verification claim, identify a concrete deletion or breakage of the
production path that the assertions would still allow. Cite both test/validator
and production file:line; trace the actual data flow, never rely on a hunch.

- B01: confirm tests call real exported helpers AND real CLI commands; mutations
  to tri-state ancestry, authoritative fences, path endpoints, batch-file checks
  or cleanliness must be detected. Raw Git recipe assertions alone do not suffice.
- B02: treat validate-orders.py and its positive/negative validation commands as
  verification code even though it adds no Node test suite. Review independence
  from generator success/expected values, complete sheet/cell/type/formula/cache
  checks, generation A/B/committed-file SHA-256 equality and corrupted-workbook
  rejection. Audit actual byte preservation through core.autocrlf=true checkout,
  archived/active input copies and unchanged effective attributes on B01 paths. Do not skip
  this batch merely because no .test.cjs file changes.
- B03: confirm tests read actual input bytes, follow the real builder/page path,
  reject stale digest or unchanged affected revisions, preserve unrelated verdicts,
  reject line-ending-only input tampering without normalization, exercise a nested
  test-discovery sentinel, and detect documentation/contract drift. A fabricated manifest/result must not
  bypass the behavior under test.

Report first line exactly CLEAN or FINDINGS <n>. For each finding: test or validator
file:line, production file:line, the mutation surviving the assertions, the missing
positive/negative assertion, and whether a production change is required. Production
change required means P1; test/doc-only improvement means ASK under the frozen
contract. A CLEAN report lists the meaningful paths/mutations checked. Maximum
40 lines plus findings. The conductor records the verdict, merges findings with
the review gate, applies existing P0/P1/ASK rules and records gate metrics. No
round or checkpoint semantics change.

## README test command acceptance

README also publishes bare `node --test` from the repository root as a portable
convenience command, with no directory argument. It supplements the primary
PowerShell validation recipe; it does not replace this ledger's recursive FullName
sorting, empty-suite guard, failure propagation or git diff --check requirement.
Verify the portable form discovers a nested suite and reports its failure/success;
do not describe its default discovery as identical to the explicit ledger command.

B03 explicitly replaces README.md's hardcoded three-suite command (starting line
177) with a Windows-safe dynamic discovery command that includes every current
tests/**/*.test.cjs file at any depth, using the same enumeration as this ledger:

```powershell
$testFiles = @(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName)
if ($testFiles.Count -eq 0) { throw 'No Node test suites discovered' }
node --test --test-reporter=spec @testFiles
if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }
```

The conductor uses this complete validation throughout W1, even before README is
updated in W2. B02 now adds Excel artifacts rather than a Node suite; B01 and B03
add Node suites. The B03 reviewer verifies the published command discovers those
suites recursively with deterministic FullName order and propagates failure.
Run the actual command in an isolated Git repo with a deliberate failure in
tests/unit/discovery-sentinel.test.cjs, then change only that assertion to pass.
Require its named failure/nonzero result followed by success; check the no-suites
error too. Static matching or only existing top-level suites is insufficient.
No Bash glob expansion assumption.
