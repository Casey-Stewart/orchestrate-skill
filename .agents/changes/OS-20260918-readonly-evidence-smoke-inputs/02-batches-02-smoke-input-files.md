# B02 — Reproducible Excel artifacts (feature, —)

**Branch**: `codex/smoke-input-files`
**Wave**: 1 · **Weight**: L
**Depends on**: none
**Smoke gate**: machine-verifiable — final C1 after W2
**Files**: `.gitattributes`, `tests/fixtures/smoke-inputs/orders.xlsx`, `tests/fixtures/smoke-inputs/orders.requirements.json`, `tests/fixtures/smoke-inputs/generate-orders.py`, `tests/fixtures/smoke-inputs/validate-orders.py`
**Gate**: existing manual mechanical fence check by conductor → fresh independent reviewer + separate fresh read-only test hunter (parallel)
**Applicable guardrails**: synthetic fixtures; preserve originals; byte integrity is
distinct from validating arbitrary file semantics; no page/UI edits in this batch.

## Weight and verification gate

L weight: deterministic XLSX production, formula caches, independent semantic
validation and negative corruption checks are substantial despite a five-file fence.
The test hunter audits the validator and positive/negative CLI verification even
without a new Node test suite. Mandatory Excel validation cannot be downgraded due
to a python3 alias failure or the tool shell's missing PATH entry.

## Implementation notes

Outcome 3's verbatim request is appended below. This batch supplies scoped Git attributes plus a checked-in
real Excel workbook, explicit requirements, a reproducible generator and independent
workbook validation. It owns no production smoke-input module or sidecar API; those
belong with the builder and page in B03. B03 consumes these fixed artifacts and the
command recipes below, never imports B02 code or parses a private requirements API.
The conductor remains responsible for creating each test's required files and
verifying its semantic requirements.
Concrete synthetic Excel example, exact expectations:

- Orders sheet A1:G5: OrderID, Item, Quantity, UnitPrice, DiscountRate, LineTotal,
  Note. Four rows: ('0001','Widget',2,12.5,0.1,22.5,'ordinary');
  ('0002','Zero quantity',0,10,0,0,blank);
  ('0003','Return',-1,8,0,-8,'return');
  ('0004','Café',3,4,0.25,9,'Unicode').
- OrderID cells are text preserving leading zeroes; Quantity, UnitPrice and
  DiscountRate numeric with appropriate integer/currency/percent formats.
  F2:F5 formulas ROUND(Cn*Dn*(1-En),2), with cached results 22.5, 0, -8, 9.
- Summary sheet includes formula SUM(Orders!F2:F5) with result 23.5 and formula
  COUNTA(Orders!A2:A5) with result 4. State exact cells in requirements JSON.
- Types sheet contains a date (2026-09-18) as an Excel date cell, a boolean true
  and an actually empty cell; requirements specify addresses and logical types.
- No macros, external links, live/customer data or intentional spreadsheet errors.

The Python generator uses standard-library OpenXML/ZIP support and deterministic
archive metadata, or a comparably small reproducible implementation; it must write
the real .xlsx and correct caches. No new core Node/Python dependency installs.
validate-orders.py independently uses available openpyxl in formula and data-only
modes to check sheets/addresses/headers/types/data/formulas/caches/edge cases.
When validating independently, do not import the generator or treat its reported
success as proof. Requirements JSON is the reviewable fixture spec.

The workbook is checked in for B03's portable Node integrity tests. This batch runs
the fixed generation/validation commands with literal python (3.10.6) with openpyxl 3.1.5 and records
the exact commands and results. It supplies the same fixed files for C1 QA.

## Checklist

- [ ] Add narrowly scoped .gitattributes for exact fixture bytes and active/archived checkpoint inputs; no renormalization.
- [ ] Generate and check in orders.xlsx plus its explicit requirements.
- [ ] Prove raw SHA256(A) = SHA256(B) = SHA256(committed workbook file bytes), separately from semantic validation.
- [ ] Verify fresh core.autocrlf=true checkout hashes for fixtures, issued/archived package copies and LF/CRLF sentinels.
- [ ] Check effective attributes for every B01 fence path remain unchanged; no B01 checkout/byte churn.
- [ ] Add deterministic generator and independent openpyxl validation.
- [ ] Verify example formulas, cached results, types and all edge cases.
- [ ] Exercise fixed consumer commands, deterministic generation and a corrupted-workbook rejection.

## Acceptance criteria

Require SHA256(generation A) = SHA256(generation B) = SHA256(committed workbook file bytes).
These are raw file-content hashes, not Git object IDs. Two equal generated files
alone do not pass: compare with the candidate committed workbook from a fresh
core.autocrlf=true checkout. All fixture/issued/archived input hashes must survive
commit/checkout unchanged under the explicit byte-preservation procedure below. The independent openpyxl validator reads formula and data-only
modes and checks all declared cells/types/caches/edge cases. A disposable workbook
with an incorrect required cell fails by naming that requirement, even if its hash
is recomputed. Validator calls do not write input files. B03 can run the exact CLI
recipes below and use the four fixed paths without choosing an upstream interface.
No user must construct data; no new Node test or production module belongs to B02.
## Validation

Run all Node tests recursively and git diff --check. Run the generator into two
distinct disposable paths and require SHA256(generation A) = SHA256(generation B)
= SHA256(committed workbook file bytes), using raw contents, never Git object IDs.
Run the fresh core.autocrlf=true checkout procedure for fixtures and both active/
archived package paths, preserving all recorded hashes. Capture effective-attribute
checks showing no B01 effect. Separately validate committed and regenerated XLSX with
literal python (3.10.6) with openpyxl 3.1.5. Keep evidence for conductor; no live user files.

## Smoke (checkpoint)

- Do: validate the issued orders.xlsx against orders.requirements.json using
  validate-orders.py. Pass: all declared sheets/cells/types/formulas/caches match,
  totals 23.50 and 4. Runner: agent (CLI with literal python (3.10.6) with openpyxl 3.1.5).
  Inputs: exact preserved checkpoint copies of orders.xlsx and requirements JSON;
  link each plus validator and validation evidence from C1.
- Do: regenerate a disposable workbook twice and verify both against the original.
  Pass: SHA256(generation A) = SHA256(generation B) = SHA256(committed workbook file bytes).
  Hash raw file contents, not Git object IDs. Independent semantic validation also
  passes as a separate requirement; originals unchanged. Runner: agent.
  Inputs: issued generator and requirements JSON, exact paths in C1 script.
- Do: clone the actual committed C1 package without checkout into disposable storage,
  set local core.autocrlf=true, then check out; test an archived-path byte copy in
  a separate disposable repo too. Pass: all actual workbook/text input hashes equal
  the recorded originals, effective attributes match, and the unprotected LF control
  demonstrates conversion is enabled. Runner: agent (CLI). Inputs: exact committed
  package, recorded digest inventory and shipped .gitattributes; link in C1 evidence.

## Verbatim assigned request

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

## Fixed artifact consumer contract (planning requirement)

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


## B02 byte-preservation policy

B02 owns .gitattributes in addition to the four Excel artifacts. Add only these
narrow root-anchored rules; preserve any pre-existing unrelated rules if the base
changes before implementation. At the recorded starting commit there is no tracked
.gitattributes at any depth.

```gitattributes
/tests/fixtures/smoke-inputs/orders.xlsx binary -eol -filter -ident -working-tree-encoding
/tests/fixtures/smoke-inputs/orders.requirements.json -text -eol -filter -ident -working-tree-encoding
/tests/fixtures/smoke-inputs/generate-orders.py -text -eol -filter -ident -working-tree-encoding
/tests/fixtures/smoke-inputs/validate-orders.py -text -eol -filter -ident -working-tree-encoding
/.agents/changes/*/evidence/C*/inputs/** -text -eol -filter -ident -working-tree-encoding
/.agents/archive/*/evidence/C*/inputs/** -text -eol -filter -ident -working-tree-encoding
/.agents/changes/*/evidence/C*/inputs/**/*.xlsx binary -eol -filter -ident -working-tree-encoding
/.agents/archive/*/evidence/C*/inputs/**/*.xlsx binary -eol -filter -ident -working-tree-encoding
```

XLSX is binary; fixture JSON/Python text is authored as UTF-8 without BOM with LF
line endings and then preserved byte-for-byte by Git. Checkpoint input packages
preserve the original issued bytes, whether text has LF or CRLF, without recoding,
line-ending conversion, filters or ident expansion. Copy files as bytes; do not
round-trip them through Get-Content/Set-Content. Issue directories remain immutable;
changed content gets a new issue path and affected-step revision increases.

No broad *.xlsx, *.py, *.json, tests/** or repository-wide text/encoding rules.
No repository renormalization, git add --renormalize, or global Git config change.
The scoped transformation controls follow [Git's attribute semantics](https://git-scm.com/docs/gitattributes).
Higher-precedence or nested overrides must be detected through effective-attribute
checks and raw hash validation; they must not be silently accepted.

## Workbook reproduction and fresh-checkout validation

In B02 acceptance, validation, and C1 checkpoint evidence require literally:

**SHA256(generation A) = SHA256(generation B) = SHA256(committed workbook file bytes).**

These are SHA-256 hashes of raw file CONTENTS, never Git blob/commit/tree object IDs.
Generate A and B into distinct new paths with the pinned literal python command.
Compare them to the actual committed orders.xlsx materialized from the candidate
commit into a fresh disposable checkout; the workbook must be clean at that commit.
Record all three hashes, paths and tested commit in evidence. Generator-to-generator
equality alone cannot pass. Independently validate sheets/types/formulas/caches/
edge cases with openpyxl as a separate mandatory requirement, including a deliberately
corrupted workbook that must fail. Byte identity does not establish semantic validity.

B02 must also validate all four fixtures and representative issued/archived input
packages in a fresh disposable checkout with core.autocrlf=true BEFORE checkout:

1. Record SHA-256 of each original raw file. In a disposable staging repository,
   use the ACTUAL candidate .gitattributes and byte copies of the four fixtures.
   Include the workbook, requirements, generator and validator under both
   .agents/changes/BYTE-CHECK/evidence/C1/inputs/issue-001/ and
   .agents/archive/BYTE-CHECK/evidence/C1/inputs/issue-001/; also include LF and CRLF
   text sentinels and a nested input path. These are synthetic test copies outside
   the batch worktree, not unauthorized ledger edits or an actual ledger archive.
2. Commit the disposable package. Use git clone --no-checkout --no-hardlinks with
   local paths and isolated Git configuration; set the clone's local
   core.autocrlf=true before its first checkout. Check out the captured commit.
   Do not reuse the authoring directory as the alleged fresh checkout. Also clone
   the B02 candidate commit without checkout, set autocrlf=true, then check out
   that commit to compare generation A/B with the committed original file bytes.
3. Hash actual checkout file bytes using Get-FileHash -Algorithm SHA256 or raw
   Node Buffer input to createHash. Every resulting fixture/issued/archive hash
   must equal its recorded source hash, including both line-ending sentinels.
   Capture git check-attr output for text/eol/filter/ident/working-tree-encoding
   plus diff/merge on XLSX; verify effective attributes, not just rule spelling.
4. A control outside the protected paths must demonstrate that autocrlf=true is
   effective (LF text becomes CRLF on checkout in this isolated test). A missing
   control, conversion disabled by inherited config, or skipped clone does not
   prove the protected rules. Temporary repositories/config must stay isolated.

B03 makes the input-integrity checker hash actual delivered bytes directly; it
must not decode text, normalize CRLF/LF, trim whitespace, remove BOMs, or substitute
a Git object ID. Add negative tests where line-ending-only byte changes reject a
stale digest and affect input identity/revisions. Automate the preservation case
in B03's existing smoke-input tests using the shipped attributes/real fixture.
At C1 the conductor repeats the checkout check against the ACTUAL committed issued
package and recorded hashes, and tests its archived-path copy in a disposable repo.
Keep all evidence with C1; do not archive or mutate the live ledger to run the test.

## Effective W1 independence

B01 owns five Git/helper/test paths; B02 owns .gitattributes plus four Excel paths.
Literal file fences are disjoint. The proposed patterns match none of B01's source,
test/support files or its own batch file: the only ledger pattern is evidence/C*/inputs/.
B01's isolated Git fixtures use their own repositories/config and do not inherit
the outer project's attributes. B02 does not change global configuration.

Planning inspection found text/eol/filter/ident/working-tree-encoding/diff/merge
unspecified on all five B01 paths at the starting version. During B02 validation,
compare effective attributes before/after for EACH B01 fence path, its own ledger
batch file, and out-of-scope test/source controls. They must be unchanged. Compare
actual B01 file bytes across integration too; allow its own commits, never attribute
churn. Any unexpected B01 attribute effect fails B02 acceptance and blocks integration;
do not retain concurrency on the basis of literal fence disjointness alone.
