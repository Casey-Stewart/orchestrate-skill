# B03 — Workflow, generated contract and smoke-page integration (feature, —)

**Branch**: `codex/workflow-input-delivery`
**Wave**: 2 · **Weight**: L
**Depends on**: B01 and B02
**Smoke gate**: hands-on — final C1 follows W2
**Files**: `README.md`, `orchestrate/SKILL.md`, `orchestrate/references/protocol.md`, `orchestrate/references/scaffolding.md`, `orchestrate/references/execution-models.md`, `orchestrate/references/subagent-prompts.md`, `orchestrate/references/smoke-page.md`, `orchestrate/references/smoke-page-template.html`, `orchestrate/templates/00-READBEFORE.md`, `orchestrate/templates/01-plan.md`, `orchestrate/templates/02-batch.md`, `orchestrate/templates/PROGRESS.md`, `orchestrate/tools/smoke-inputs.mjs`, `tests/smoke-inputs.test.cjs`, `orchestrate/tools/build-smoke-page.mjs`, `tests/build-smoke-page.test.cjs`, `tests/smoke-page.test.cjs`, `tests/protocol-contract.test.cjs`
**Gate**: existing manual mechanical fence check by conductor → fresh independent reviewer + separate fresh read-only test hunter (parallel)
**Applicable guardrails**: settled smoke-page design; no restyling; exact mirrored
Recovery/verdict rules; runtime-neutral baked ledger; no second workflow authority.

## Implementation notes

All three outcomes' verbatim text is appended below; implementation of the
Git helpers belongs to B01; Excel artifacts and scoped attributes belong to B02. This batch owns
the entire smoke-input runtime path: smoke-inputs.mjs and tests, builder and tests,
page/template and tests. Define their internal interfaces together within this
fence. It also owns all shared docs, consuming B01's fixed tested CLI contract
and B02's fixed artifacts/commands; no upstream module import crosses its fence. Never edit this running ledger's frozen contract or locked plan.

Census: SKILL.md:44 discovery/:130 gate; protocol.md:174/187/297/441 and
templates/00-READBEFORE.md:104/130/301/453 mirror Git/fence/recovery rules.
execution-models.md:85/104/156, scaffolding.md:20/45/157, subagent-prompts.md:26/94/227
contain planner/implementer/reviewer/QA references. Smoke builder currently validates
step content and section context revisions but not the bytes of linked files;
build-smoke-page.mjs:164 validateReissue compares step content minus pre metadata.
smoke-page-template.html:758 documents step schema, :986 renders step details,
:900–943 handles revision applicability and :1284 copies results.
Out-of-fence census disposition: orchestrate/templates/LOG.md retains its generic
append-only narrative format. It already accommodates authorization reasoning,
checkpoint findings and validation evidence without new fields or syntax, so this
change requires no edit there. templates/00-request.md also needs no schema change:
the existing verbatim request/decisions/coverage fields carry the requested scope.
Existing tests include same-build corrections, retained notes, unaffected verdicts,
cloud/local provenance, stale baseline refusal and overwrite protection.

Document and use read-only evidence helper for repeatable discovery/shipment probes;
retain ALL existing contract decisions, owner/target ambiguity handling and manual
read-only fallback for unknown unsupported shapes. Wire fence checker after
implementer report and before fresh independent semantic review. PASS is only a
mechanical result; violation/unknown never imply extension or review approval.
Conductor interprets diagnostics under frozen contract; reviewer still maps hunks.

Generated contracts must carry everything necessary to drive a ledger without live
skill text: helper commands and supported input grammar or a self-contained manual
fallback, immutable authority/captured refs, three outcome semantics, no state
decisions delegated to evidence helper. Reusable templates/references/tool defaults
must not hardcode machine installation paths. This ledger may and does record its
verified absolute Python310 path as an environment fact. Never propagate that path
into reusable skill artifacts; test this boundary explicitly.
Explain that changed skill/templates do not rewrite existing ledgers. Preserve
existing Recovery and verdict-table decisions; no recovery-engine redesign.

Make input preparation a normal conductor responsibility at planning and checkpoint
close-out: inventory per-step required files; specify sheets/columns/types/formulas/
edge cases for workbooks; generate reproducible synthetic files; independently
validate against requirements; preserve issued files/evidence; deliver actual usable
files with exact step links, Pass result and working-copy/reset instructions.
No request for manual construction unless construction itself is the behavior tested.
Name specific prerequisites for private data, credentials or external access.
An agent cannot label an unavailable dependency pre-verified. No new user approval
gate for ordinary synthetic input preparation. QA receives exact files/identities.

Implement smoke-inputs.mjs and its tests together with the existing sidecar/builder.
Input declarations use a stable-id registry and per-step references, with path,
SHA-256, size, requirements, validation evidence, read-only or working-copy/reset
instructions. Separate declaration/history comparison from current disk validation,
while keeping both and their consumer under this batch's ownership. Reject missing
or duplicate ids, dangling references, incomplete metadata, missing/mismatched
files, directories, unsafe absolute/traversal paths and symlink escapes. Use actual
B02 workbook bytes in the tests; metadata/hash is not semantic workbook validation.
Specific private-data/credential/access prerequisites receive explanatory text,
not fake file entries or false pre-verification. Legacy no-input sidecars work.
At CLI build time resolve file paths relative to the checkpoint artifacts, validate
actual delivered disk bytes before any output write, and preserve old HTML on failure.
Hash raw Buffers: no text decoding, line-ending normalization, trimming, BOM removal
or Git object-ID substitution. Line-ending-only mutations must fail a stale digest. Imported
builder calls must also validate real files when declarations exist (explicit input
root option); pure legacy sidecars stay compatible. Do not silently accept a supplied
digest without reading the declared file. Resolve IDs to display exact file links,
requirements and use/reset directions in the current layout; plain text result/script
fallback names the same files and instructions. Escape attributes and URL paths.

On reissue compare resolved per-step input identities, not only registry ids. Changed
bytes/identity/requirements/use/reset text require revision increases on EVERY
referencing existing step, even on the same build; unrelated steps retain revisions.
Ensure registry edits cannot bypass comparison by keeping ids unchanged. Byte
tampering with unchanged declared hash refuses build; digest/path updates require
affected revision increments. Existing human/agent provenance then makes old passes
historical; test the complete builder→page→saved-verdict path.

Use B02's scoped .gitattributes for byte-preserved fixture and active/archived input
directories; validate the actual delivered package in a fresh core.autocrlf=true
checkout. Add automated coverage in smoke-input tests using shipped attributes and
real fixture bytes, including LF/CRLF sentinels and an unprotected conversion control.
Retain issued originals in versioned issue directories; reject reusing an already
issued path with different bytes/identity. Previous sidecar/page snapshot checks
remain intact. Reissuing must not overwrite or delete previous input sets; generator
or conductor uses new paths for changed files. Validation against previous metadata
must be able to compare history without pretending missing historical bytes are
current files; loss of required prior artifacts reports a clear error.

Keep HTML and files usable together locally. If a hosted renderer cannot serve
relative inputs, conductor separately delivers usable attachments/local links and
states the mapping; never claim an inaccessible URL is a usable download. No new
publisher SDK or service dependency. QA browser checks links/page behavior; Excel
opening is a human step unless an actual spreadsheet runner is available.

## Checklist

- [x] Wire/document helper probes and mechanical gate without changing decisions.
- [x] Bake conductor input responsibilities into skill/references/templates/prompts.
- [x] Implement and test smoke-input declarations, disk validation and per-step identities.
- [x] Integrate input-byte validation and retained artifacts into smoke builder.
- [x] Test raw delivered-byte hashes, LF/CRLF-only tampering and fresh autocrlf=true checkout preservation for active/archived input copies.
- [x] Keep the machine-local Python path out of reusable templates while preserving this ledger's explicit environment fact.
- [x] Render exact file links and use/reset instructions in existing page design.
- [x] Enforce per-input affected revision invalidation and historical verdicts.
- [x] Add builder/runtime/doc consistency regression tests and helper documentation.
- [x] Replace README.md:177's fixed Node command with Get-ChildItem -Recurse, Sort-Object FullName and preserved failure propagation; prove nested tests/unit/*.test.cjs discovery with an actual failing-then-passing disposable sentinel; also publish the portable `node --test` form (bare, no directory argument — `node --test tests` fails on Node 22).

## Acceptance criteria

Reviewer can trace the same gate order and same Recovery/verdict decisions in all
mirrors. New contracts are self-contained; existing ledgers remain governed by
their own contract. Template placeholder registry still matches in both directions.
No plan.json, state engine, hidden grant, automatic COMPLETE or scope expansion.

Builder integration tests read actual files, refuse missing/tampered inputs without
changing old HTML, and reject reissues that swap shared input bytes under the same
id without bumping every affected revision. Unaffected passes/notes remain intact.
Reissued page tests show NOT RE-RUN for changed input steps until a fresh applicable
verdict/evidence, including same-build changes. Original input sets remain intact.
No-input legacy sidecars and existing storage/baseline behaviors continue to pass.

Protocol tests cover new responsibility and command integration, exact Recovery/
verdict-table agreement after placeholder normalization, and template registry
consistency. Tests should detect omissions/drift rather than mirror helper internals.
The README command must recursively enumerate tests/**/*.test.cjs at every depth,
using Get-ChildItem -Recurse and deterministic Sort-Object FullName, including
B01/B03 suites, and propagate nonzero status without relying on Bash expansion.
W1 validation uses the same recursive command while README awaits this batch.
Prove the actual command finds a deliberately failing tests/unit/discovery-sentinel.test.cjs
in a disposable Git repo, then succeeds when that assertion passes; empty discovery
must fail too. Static command-text checks alone are insufficient.
README also publishes bare `node --test` from the repository root as a portable
convenience command, with no directory argument. It supplements the primary
PowerShell validation recipe; it does not replace this ledger's recursive FullName
sorting, empty-suite guard, failure propagation or git diff --check requirement.
Verify the portable form discovers a nested suite and reports its failure/success;
do not describe its default discovery as identical to the explicit ledger command.
No redesign of unrelated docs or visible page theme.

## Scheduling tradeoff

B03 keeps smoke-inputs, builder, page and shared docs together and is the final
serialization point. A blocking review here delays completion/C1. Do not split it
merely to manufacture concurrency. The second FIX FIRST stops this wave/run under
the frozen cap; a third attempt requires explicit user authorization and a fresh
implementer. Existing separate polish accounting is unchanged.

## Validation

All Node suites, git diff --check; mechanical mirror/placeholder checks; disposable
real-file first issue/reissue tests; current browser QA plus independent Excel
validation in final C1 evidence. No fabricated browser or Excel-app results.

## Smoke (checkpoint)

- Do: run the published recursive test command in a disposable Git repository with
  a top-level control and tests/unit/discovery-sentinel.test.cjs; the nested test
  deliberately fails, then only that assertion is changed to pass. Pass: its unique
  name appears in failure output, failure propagates, the corrected run succeeds,
  FullName order is stable, and empty discovery fails. Runner: agent (PowerShell).
  Inputs: exact delivered sentinel/control files and runner script in C1 evidence;
  use disposable copies and reset from the preserved originals.
- Do: modify only LF/CRLF bytes in a disposable declared text input. Pass: the
  builder rejects the stale raw digest without overwriting the prior page; updating
  the digest/path also requires every affected step revision to increase. Runner:
  agent (CLI/browser). Inputs: preserved original/mutated text, sidecars and pages
  linked in C1; reset by replacing disposable copies from immutable originals.
- Do: prepare a checkpoint package from the actual generated workbook and validate
  every declared file/evidence link before handoff. Pass: current page is usable,
  linked bytes match declaration, expected Excel total 23.50/count 4 are explicit,
  no manual data construction needed. Runner: agent (CLI/browser).
  Inputs: exact issue-001 workbook, requirements, generator, validator, validation
  report, page sidecar; copied into checkpoint and linked per relevant step.
- Do: use disposable pages/input copies to change workbook contents and reissue
  on the same build. Pass: unchanged revision is refused; new versioned input path
  and affected revision succeeds; prior pass becomes NOT RE-RUN; unrelated pass
  and notes survive. Runner: agent (CLI/browser). Inputs: preserved demonstration
  before/after packages; reset uses a fresh temporary copy, never issued originals.
- Do: open the linked original workbook, then use the supplied working-copy command
  and change Orders C2 from 2 to 3. Pass: original has all 3 named sheets and
  leading-zero IDs; copy recalculates F2 to 33.75 and total to 34.75. Reset by
  replacing the working copy from the original restores 22.50/23.50. Runner: human
  (Excel or compatible spreadsheet application). Inputs: exact orders.xlsx link,
  explicit PowerShell Copy-Item commands with source/destination, reset and expected
  cell addresses; no effect on original. If no spreadsheet application is available,
  name that prerequisite rather than claiming this human step was executed.
- Do: follow the smoke-page file link and inspect the reissued-input demonstration.
  Pass: exact original/working-copy instructions are clear and usable; changed-input
  step visibly needs rerunning, unaffected results remain identified. Runner: human.
  Inputs: exact preserved demonstration page/input links supplied with C1.

## Verbatim source request (integration responsibilities above)

> 1. Read-only fence checker
>
> Implement a deterministic checker used after an implementer finishes and
> before independent review. Check changed paths against the plan’s fence,
> recorded authorized extensions, and the batch’s own file. Check both
> rename endpoints and worktree cleanliness.
>
> Validate that changes within the batch file are limited to the permitted
> checklist ticks, polish additions, and authorized Files changes.
>
> Report violations and unknown/unparseable cases clearly. Do not modify
> files, grant extensions, or replace the reviewer’s semantic scope review.
>
> 2. Read-only Git evidence helper
>
> Extract the repeatable Git probes used by discovery and shipment checks
> into tested code: relevant refs and SHAs, ledger locations and provenance,
> worktree state, and contained/not-contained/unknown ancestry results.
>
> Return structured evidence. Keep ledger decisions under the existing
> contract; do not introduce a second source of workflow state.
>
> Reuse the disposable-repository scenarios in tests/git-contract.test.cjs,
> and make those tests exercise the actual helper. Support Windows without
> assuming Bash.
>
> 3. Complete smoke-test input files
>
> When preparing a checkpoint smoke test, the conductor must identify,
> generate, validate, and deliver any reproducible input files the tester
> needs to perform the steps accurately.
>
> For example, if a test needs an Excel workbook with particular sheets,
> columns, data types, formulas, or edge cases, supply the actual workbook.
> Do not ask me to manually construct it unless constructing it is itself
> the behavior being tested.
>
> Each relevant smoke step must name/link its exact input files and explain
> the expected result. Provide usable files alongside the smoke page, with
> clear working-copy/reset instructions when tests modify them.
>
> Validate generated files against the test requirements before handoff.
> Use synthetic data where appropriate. If required inputs cannot be
> generated because they depend on private data, credentials, or external
> access, identify that specific prerequisite.
>
> Preserve the issued files with the checkpoint artifacts. On reissue,
> changes to test inputs must invalidate the affected step revisions so
> old verdicts cannot silently apply to different inputs.
>
> Update the skill, generated contract, smoke-page support, and tests as
> needed to make this a normal conductor responsibility. Include a concrete
> Excel-file example in validation.
>

## Fixed external dependencies (planning requirements)

## B01 command contract

All commands use Node and shell-free argument arrays, accept explicit --repo, write
one JSON object to stdout (except --help), and do not mutate repository/workflow
state. B03's instructions must use these same tested invocations. Relative module
paths below are from repository root; a generated ledger bakes resolved tool paths
or the self-contained manual fallback already required by its contract.

| Operation | Command after node |
|---|---|
| Discovery | orchestrate/tools/git-evidence.mjs discovery --repo <repo> |
| Worktrees | orchestrate/tools/git-evidence.mjs worktrees --repo <repo> |
| Ancestry | orchestrate/tools/git-evidence.mjs ancestry --repo <repo> --ancestor <ref-or-sha> --descendant <ref-or-sha> |
| Local shipment | orchestrate/tools/git-evidence.mjs shipment --repo <repo> --integration <full-ref> --source local --ref <full-shipment-ref> |
| Remote shipment | orchestrate/tools/git-evidence.mjs shipment --repo <repo> --integration <full-ref> --source remote --remote <name> --ref <full-shipment-ref> |
| Ledger provenance/target evidence | orchestrate/tools/git-evidence.mjs ledger --repo <repo> --ref <full-ref> --ledger <id> |
| Fence | orchestrate/tools/check-fence.mjs --repo <repo> --integration <full-ref> --batch <full-ref> --ledger <id> --batch-id <Bnn> --batch-file <repo-relative-path> |

Both programs support --help (exit 0, text help) and reject unknown/missing/duplicate
flags rather than guessing. CLI usage/launch/probe failures receive structured
diagnostics. No invocation creates an evidence file; callers may capture stdout.

Git evidence envelope:

    { operation, repo, completeness: "complete" | "partial" | "unknown",
      evidence, diagnostics: [{ code, message, ...context }] }

The following consumer-visible evidence fields are required (additional provenance
fields are permitted). Objects with unavailable SHAs use null plus diagnostics;
arrays retain observed facts even when a sibling probe fails.

- discovery: refs (ref, sha, symref), worktrees, ledgers grouped by id with
  locations and provenance. Symbolic refs remain in refs as hints, but their trees
  are not probed. Candidate locations are never suppressed by a workflow decision.
- worktrees: worktrees array with path, head, branch and cleanliness
  (clean/dirty/unknown), plus structured status entries with both rename endpoints.
- ancestry: ancestorSha, descendantSha, result
  (contained/not-contained/unknown).
- shipment: source (local/remote), remote (name or null), ref, integrationSha,
  shipmentSha and result (contained/not-contained/unknown).
- ledger: id, ref, refSha, activePath, archivePath, active and archive observations.
  Each observation has exists (true/false/null), tree, lastChange, lastChangeTree,
  progressText and contractTexts (path/text entries for recognized current/legacy
  contracts). Null means unavailable, never absent. Presence/text are evidence,
  not COMPLETE/ACTIVE decisions. It only inspects the requested id at that ref.

For Git evidence, exit 0 means all requested evidence is available (contained and
not-contained are both valid complete observations); exit 2 means incomplete or
unknown evidence or invalid invocation. The JSON tri-state result is authoritative
for ancestry, never an inference from helper exit code alone. Diagnostics contain
command/exit details when a Git probe fails; sensitive remote credentials must not
be echoed. Evidence collection never classifies a ledger or authorizes action.

Fence result:

    { status: "PASS" | "VIOLATION" | "UNKNOWN", integrationSha, batchSha,
      mergeBase, violations: [], unknowns: [], evidence: { ... } }

Exit codes: 0 PASS, 1 VIOLATION, 2 UNKNOWN. Preserve both diagnostic arrays when
both exist; UNKNOWN takes precedence because not all checks completed. Each entry
includes a stable code/message and path/line when known. No unknown can be PASS.

Producer acceptance: tests spawn the ACTUAL CLIs with every invocation above in
the reusable disposable repositories. Assert flags, required fields, tri-state
values, exit codes and read-only behavior, including missing-object/remote errors
and invalid calls. Imported-function tests supplement these tests. A hand-written
fake CLI output or an exported-function test alone does not satisfy this contract.
B03 docs tests check published commands against these recipes; B03 may run them in
disposable repositories without editing B01's files. Gate B01 on this contract
before W2 opens; incompatible changes are a failed B01 acceptance criterion.

## B02 artifact and command contract

The four artifact paths are fixed:

- tests/fixtures/smoke-inputs/orders.xlsx
- tests/fixtures/smoke-inputs/orders.requirements.json
- tests/fixtures/smoke-inputs/generate-orders.py
- tests/fixtures/smoke-inputs/validate-orders.py

Commands from the designated worktree root, pinned to literal python (verified
Python 3.10.6 and openpyxl 3.1.5):

    python tests/fixtures/smoke-inputs/generate-orders.py <new-output.xlsx>
    python tests/fixtures/smoke-inputs/validate-orders.py <workbook.xlsx> <requirements.json>

Ledger-local environment fact (permitted here, never a reusable template default):
C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe.
If the tool shell omits it from PATH, prepend its directory for that process and
verify python's sys.executable; do not substitute python3 or a bundled interpreter.
The complete setup/check commands are baked in the run-validation section below.
An alias/PATH/permission failure is setup to resolve, never an allowed skip of the
mandatory Excel example. A genuine unresolved blocker leaves B02 incomplete.
The generator writes only its explicitly named output and refuses to overwrite an
existing file. Its requirements are fixed by this plan; no environment/private
data. Validator reads both supplied files and writes neither. Exit 0 means all
checks passed; nonzero names the failed requirement or missing environment dependency.
B03 records the command/exit/output as evidence, not an inferred semantic result
from a file hash. B03 never parses the private structure of the requirements JSON.

The full workbook values in B02 remain binding. In addition, exact addresses are:
Orders headers A1:G1, data rows 2–5, formulas F2:F5; Summary A1/B1 = Metric/Value,
A2 = Net total, B2 = SUM(Orders!F2:F5) with cached value 23.5, A3 = Order count,
B3 = COUNTA(Orders!A2:A5) with cached value 4; Types A1:C1 = SampleDate/IsActive/Empty,
A2 = real Excel date 2026-09-18, B2 = boolean true, C2 = empty.

B02 acceptance runs the actual commands with these argument positions, verifies
SHA256(generation A) = SHA256(generation B) = SHA256(committed workbook file bytes).
These are file-content hashes, not Git object IDs; committed bytes are materialized
in a fresh checkout. Generator equality alone is insufficient. Separately it reads
formula and data-only values with openpyxl. It passes the same validator a
deliberately incorrect disposable workbook and requires a named failure. B03 can
consume the fixed files and these commands without inventing an upstream API.

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

## Recursive test discovery

Every ledger validation command and README's primary validation recipe use:

```powershell
$testFiles = @(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName)
if ($testFiles.Count -eq 0) { throw 'No Node test suites discovered' }
node --test --test-reporter=spec @testFiles
if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }
```

Require a meaningful disposable Git-repository test: create tests/unit/discovery-sentinel.test.cjs
with a uniquely named deliberate failing Node test plus an ordinary top-level test;
run the ACTUAL published discovery/runner command in that disposable directory.
The nested name must appear in failure output and the overall command must fail.
Switch only the nested assertion to pass and require success. Record stable FullName
ordering and the no-suites error too. Static prose/regex checks or enumerating only
today's suites cannot prove discovery. B03 owns this regression in its existing
protocol-contract tests; if PowerShell is unavailable elsewhere, report that specific
test prerequisite and perform it here on the available PowerShell runner before C1.
Never add the deliberately failing sentinel to the real source tree.

## Interpreter-path boundary

Reusable skill templates/references must not hardcode any machine's Python installation
path. B03 must not copy this user's absolute Python310 path into reusable templates,
examples or tool defaults. Reusable instructions detect/confirm the interpreter and
bake an environment fact during scaffolding. THIS ledger explicitly permits and
records C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe and its
process-only PATH setup. Keep literal python and verified 3.10.6/openpyxl 3.1.5 here;
the fixed local environment fact is not a reusable default. Add a B03 template check
for this path's absence while verifying the generated ledger retains the recorded
choice. Mandatory Excel validation and no-downgrade rules remain unchanged.

## Scheduling and review cap

B03 deliberately keeps smoke-inputs, builder, page and shared docs together. It is
the final serialization point; a blocking review there delays completion and C1.
Do not split it merely to claim more concurrency. W1 stays B01+B02 only if the
effective-attribute checks above pass. No extra wave or checkpoint is introduced.

Under the starting protocol, only FIX FIRST rounds count toward the cap. The
SECOND FIX FIRST blocks the subject, leaves it out of integration and stops the
run after any other current-wave members finish gating/integrating. B03 is alone
in W2, so there are no siblings to finish. A third attempt requires the user's
explicit authorization and a fresh implementer per the frozen contract; it is not
part of the approved default schedule. Ordinary/scoped polish retains its distinct
existing accounting; test hunter does not create extra rounds or an automatic retry.
