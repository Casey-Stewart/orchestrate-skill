# Explicit byte preservation and scope decisions — plan v4

These are planning requirements authorized by the user's latest message. No
scaffolding, implementation, source attributes or checkpoint files have been created.
The original protocol at f918fe39762c70edb9a3424e54eaa208fd7c5727 and all recorded
user decisions still govern this run, with these explicit additions baked before
scaffold. Existing manual fence gates and independent test hunters are retained.

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

## Historical bugs baseline and residual IDs

At starting commit f918fe39762c70edb9a3424e54eaa208fd7c5727, P1-1 through P1-4 in
bugs-2026-09-17.md are ALREADY RESOLVED. The historical headings are not current
defect evidence. Source references below are pinned to that starting commit, even
if later implementation shifts line numbers:

| Historical item | Resolution visible at the starting version |
|---|---|
| P1-1, shadowed checkpoint close-out | protocol.md:348 places Close-out unfinished before generic integrated rows; templates/00-READBEFORE.md:353 does the same, requiring close-out before another wave. |
| P1-2, integrated legend claimed checkpoint verification | protocol.md:126 and templates/PROGRESS.md:24–25 define Integrated as awaiting its covering checkpoint. |
| P1-3, invisible in-flight repairs | protocol.md:391–398 and templates/00-READBEFORE.md:395–402 write pending markers at repair spawn; matching Recovery rows are protocol.md:338 and contract template:343. |
| P1-4, orphaned pre-open branches | protocol.md:359 and contract template:364 cover not-started rows with existing branches; protocol.md:430–435 and contract template:435–440 define the idempotent adopt-or-stop wave cut. |

All protocol.md paths above mean orchestrate/references/protocol.md; all template
paths are under orchestrate/templates/. These references are an evidence index,
not live sources of this ledger's rules. Their relevant semantics are already baked
into the starting contract. Do not edit/relabel historical entries. New evidence-backed residual entries may
be appended under the existing contract. New residuals use distinct OS-BL-001, OS-BL-002, ... IDs (next unused ID),
current tested commit, reproduction/test evidence, severity, and a pointer to the
batch/reviewer finding. Never reuse P1-1…P1-4 or infer a new defect solely from an
old label. This baseline clarification does not authorize unrelated backlog cleanup.
