# Planned external contracts — approval draft v4

These are requirements fixed during planning, before W1. This file is baked into
the ledger at scaffold; relevant text is also copied into each authoritative batch
spec. It is not an implementation or a second workflow-state file.

## Ownership

- B01 owns both Git modules, their imported APIs, shared fixtures and CLI tests.
  Its internal function names may vary: no later batch imports them. B03 documents
  and invokes only the external commands specified below.
- B02 owns the scoped .gitattributes plus the workbook, requirements document,
  generator and semantic validator.
  B03 links/copies those artifacts; it does not import B02 code or interpret a
  library API. File requirements and command recipes are specified below.
- B03 owns smoke-inputs.mjs, its tests, build-smoke-page.mjs and its tests, the
  HTML template/runtime tests and shared protocol documentation. The input schema,
  synchronous helper API, history-versus-current-file validation, root/path handling,
  error behavior and per-step identity comparison are designed and tested together
  in B03. No smoke helper interface crosses a batch fence.

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
