# Plan — OS-20260918-readonly-evidence-smoke-inputs

APPROVED PLAN v4, including the portable-command delta — PRE-FLIGHT CLEAN. Locked at scaffold on 2026-09-18; user approval: "Okay, approved."

Starting version: f918fe39762c70edb9a3424e54eaa208fd7c5727, clean main. Discovery
examined every non-symbolic local/remote-tracking branch and found no ledgers.
Baseline: 64/64 Node tests pass; git diff --check passes. Node v22.22.3, Git,
PowerShell and browser tools available. Literal python is verified as 3.10.6 with openpyxl 3.1.5 at the recorded Python310
path. Agent shells may need process-only PATH setup; no install is needed.

## Frozen run contract

At scaffold, generate the full 00-READBEFORE.md from the STARTING template at the
recorded commit, not from the implementation's subsequently edited template.
Bake all repo facts, the discovery rules, role/report shapes, existing recovery,
fence, review, polish, repair, merge and checkpoint rules into the ledger. Record
source commit plus source Git blob IDs in a provenance appendix. No live skill
reference supplies governing rules. This run's requested smoke-input obligations
are explicit initial contract terms, not an in-run upgrade.

Only explicit recorded user amendments change that contract. B01/B03 may change
future generated contracts but cannot edit this run's 00-READBEFORE or plan.
For ALL B01/B02/B03 and repair/polish gates in this ledger, the conductor performs
the existing MANUAL mechanical Git/blob fence checks under the starting contract.
The new checker is a tested deliverable for future generated contracts; it never
replaces this ledger's manual gate. At existing batch/repair reviewer gates, a fresh
independent reviewer and separate fresh read-only test hunter run in parallel.
Ordinary polish remains mechanical-only; production-touching polish retains its
existing scoped re-review and any hunter checks stay within that scope. Their findings
use the existing severity/round/polish rules. The user explicitly enabled the hunter;
convergence remains off. These recorded amendments are baked before scaffold.
Confirmed defaults: protected default refs/heads/main; shipment
local refs/heads/main; user merges
to main and pushes. Integration codex/readonly-evidence-smoke-inputs-ledger.
All branches/worktrees remain separate from the user's main checkout. Prefix OS,
no version/changelog system (exact SHA plus behavioral canary), reviewer plus independent test-hunter batch
gates, current inherited Codex model, fresh reviewers, QA enabled, convergence off.
Residuals use bugs-2026-09-17.md; new guardrails only if needed at close-out.

## Batch table

| # | Batch | Type | Weight | Branch | Wave | Files (fence) | Smoke | Version |
|---|---|---|---|---|---|---|---|---|
| B01 | Read-only Git evidence and fence checks | feature | L | codex/readonly-evidence-checker | 1 | `orchestrate/tools/git-evidence.mjs`, `orchestrate/tools/check-fence.mjs`, `tests/git-contract.test.cjs`, `tests/check-fence.test.cjs`, `tests/support/git-fixture.cjs` | C1 machine-verifiable | — |
| B02 | Reproducible Excel artifacts | feature | L | codex/smoke-input-files | 1 | `.gitattributes`, `tests/fixtures/smoke-inputs/orders.xlsx`, `tests/fixtures/smoke-inputs/orders.requirements.json`, `tests/fixtures/smoke-inputs/generate-orders.py`, `tests/fixtures/smoke-inputs/validate-orders.py` | C1 machine-verifiable | — |
| B03 | Workflow, generated contract and smoke-page integration | feature | L | codex/workflow-input-delivery | 2 | `README.md`, `orchestrate/SKILL.md`, `orchestrate/references/protocol.md`, `orchestrate/references/scaffolding.md`, `orchestrate/references/execution-models.md`, `orchestrate/references/subagent-prompts.md`, `orchestrate/references/smoke-page.md`, `orchestrate/references/smoke-page-template.html`, `orchestrate/templates/00-READBEFORE.md`, `orchestrate/templates/01-plan.md`, `orchestrate/templates/02-batch.md`, `orchestrate/templates/PROGRESS.md`, `orchestrate/tools/smoke-inputs.mjs`, `tests/smoke-inputs.test.cjs`, `orchestrate/tools/build-smoke-page.mjs`, `tests/build-smoke-page.test.cjs`, `tests/smoke-page.test.cjs`, `tests/protocol-contract.test.cjs` | C1 hands-on | — |

Each batch also owns ONLY the permitted edits in its own ledger batch file.
Fence strings above are literal repository-relative paths; no glob interpretation.

## Wave map & checkpoints

- W1: B01 + B02 concurrently. Their five-file fences have no intersection; B02 adds only narrow attributes.
  Effective independence also requires no changed attributes on B01 paths; literal
  disjointness alone is insufficient. See the byte-preservation validation below.
  Neither imports the other's code or tests. B01 keeps the Git helper and fence
  consumer together because they share subprocess/path parsing and fixture setup.
  B02 supplies the fixed workbook artifacts/generation/validation commands plus
  narrowly scoped .gitattributes; no rules may affect B01 files or tests.
  It owns no runtime module consumed by B03.
- W2: B03, depending on B01 and B02. It owns the input validator and builder together, documents B01's planned CLI
  contract and uses B02's fixed artifacts. It also owns
  ALL shared workflow/docs/contract mirrors plus visible smoke rendering. Moving
  those files into separate outcome batches would overlap protocol, contract,
  scaffolding, sub-agent and README files. This seam avoids concurrent edits.
  B03 is deliberately the final serialization point: blocking review delays C1.
  Keep its runtime ownership together rather than splitting for cosmetic concurrency.
  The second FIX FIRST stops the run; a third attempt needs explicit user authorization.
- C1 after W2: the mandatory final checkpoint, covering B01–B03. This is the only
  hands-on wave (usable links, Excel handoff, and page interaction). W1's CLI/data
  behavior is machine-verifiable in disposable repositories and synthetic files.
  The user supplies the checkpoint verdict. No planned mid-run design gates.

Scaffold B00 is conductor-only: request, filled frozen contract, plan, three batch
files, fixed interface contracts, explicit run-validation and byte/scope choices,
PROGRESS and LOG,
with source provenance. After approval: scaffold commit
in an integration worktree, self-check, then STOP per current new-mode procedure.
Implementation begins only after the user's start instruction.

## Backlog fold-ins and baseline

None. P1-1 through P1-4 in bugs-2026-09-17.md are resolved at starting commit
f918fe39762c70edb9a3424e54eaa208fd7c5727. The pinned source references and resolution
facts are baked below under Historical bugs baseline and residual IDs. Old labels
are not proof of current defects. New residuals require distinct OS-BL-NNN IDs and
current commit/reproduction evidence. Do not edit or relabel historical entries;
only append evidence-backed residuals under the existing contract. This round
authorizes no unrelated cleanup or new recovery behavior.
## Per-batch specifications

### B01 — Read-only Git evidence and fence checks (feature, —)

**Branch**: `codex/readonly-evidence-checker`
**Wave**: 1 · **Weight**: L
**Depends on**: none
**Smoke gate**: machine-verifiable — final C1 after W2
**Files**: `orchestrate/tools/git-evidence.mjs`, `orchestrate/tools/check-fence.mjs`, `tests/git-contract.test.cjs`, `tests/check-fence.test.cjs`, `tests/support/git-fixture.cjs`
**Gate**: existing manual mechanical fence check by conductor → fresh independent reviewer + separate fresh read-only test hunter (parallel)
**Applicable guardrails**: no state mutation; unknown is not success; authoritative
scope comes from the integration ledger; no Bash or arbitrary shell execution.

## Implementation notes

Authoritative request text for outcomes 1 and 2 is reproduced at the end of this
file during draft assembly. Implement both helpers together to reuse safe Git
execution, NUL-safe path/status decoding and the existing disposable fixture.

Starting facts: tests/git-contract.test.cjs:17 defines makeRepo with isolated Git
config, local bare remotes and cleanup; lines 107/118 contain recipe-only ledger
version/remote-tip helpers. Fourteen scenarios currently assert Git behavior but
do not call production helpers. protocol.md:204 and template contract:150 define
plan fence union recorded extensions union own batch file. Three-dot diff and
batch-file content restrictions appear at protocol:441 and contract:453.

Expose imported functions for tests and the fence consumer within B01. Internal
function names may be chosen within this batch; no other batch imports them.
B03 consumes only the external CLI recipes/result contract specified below.
Those consumer requirements are fixed by this plan before W1 and must be tested
through actual command invocations before B01 can pass independent review.
Use Node subprocess argument arrays, shell:false, windowsHide:true, bounded
timeouts/output and read-only Git commands. Disable optional Git index refresh
locks. No fetch, checkout, branch writes, stash, index changes or auto-corrections.
Git executable/config failures, missing objects, invalid outputs and inaccessible
worktrees stay explicit unknowns. Stable ordering; same captured evidence yields
same result (no incidental timestamps). Capture refs into immutable SHAs before
dependent probes. Keep diagnostics separate from data. Exact raw file paths must
not be trim(), whitespace-split, case-folded or interpreted as options/pathspecs.

Discovery returns all non-symbolic heads and remote-tracking refs (including
merged/custom/shallow names), symbolic-ref hints separately, working-tree ledger
locations, grouped branch locations, and worktree state. Only active-root
.agents/changes/<id>/PROGRESS.md locations are candidates; no archive-wide scan.
For explicit requested ledger ids include target-local complete/archive file
evidence, contract texts/locations and provenance facts. Return ledger subtree
tree id, last ledger-changing commit, that commit's subtree id, and ancestry to
explicit owner/target SHAs. Preserve missing/conflicting provenance and all dirty
associated worktrees; never suppress candidates, pick ownership, parse workflow
status into a decision, or infer COMPLETE/archived from ancestry.

Shipment takes the contract-selected local/remote source and full branch ref;
there is no default inference. Query exact remote refs with ls-remote, capture the
SHA and verify it is locally a commit. Do not substitute a cached tracking ref.
Ancestry is contained for exit 0, not-contained for exit 1 only when both commits
are valid, unknown for missing objects/other failures. Record source/ref/SHAs and
the reason for unknown. Captured evidence does not authorize cleanup or merging.

Fence CLI accepts repo, integration ref, batch ref, ledger path, batch id/file.
Resolve immutable integration and candidate SHAs; require one merge base, check
committed three-dot --name-status -z -M output and both rename/copy endpoints.
Read plan fence and authorized extension records from the captured integration
commit; baseline batch from merge base, proposed batch from candidate SHA. Never
read authority from implementer-owned copies or its mutable Files line.
Check the candidate branch/worktree association and tracked, staged, untracked,
conflicted status. A missing/inaccessible worktree cannot count clean. Report
other worktree dirt as evidence without making unrelated checkout edits a batch
violation. Recheck captured refs/worktree identity for races; indeterminate
observations return unknown, not a clean gate.

Support the current Markdown table/Files/checklist shapes with exact repo-relative
backtick paths; no new plan.json and no invented universal Markdown parser.
Validate the batch id/row/file linkage. Unknown/ambiguous/duplicate/malformed
authority, unsupported globs, traversal, invalid encoding or multiple merge bases
must be reported as unknown. Extension grammar supports BOTH existing conductor forms:
fence +path (Bnn, item, reason, date) and row-bound
fence +path (item, reason, date). Bind the shorter form to its authoritative
PROGRESS batch-table row; require unambiguous matching authorization in Notes and
the session log. Explicit batch IDs must agree with the row and requested batch.
Test both current forms, mismatched IDs, ambiguous records and forged candidate
records. Never treat a substring or candidate-branch addition as authorization.
Do not grant, infer or write extensions. Clearly report unsupported legacy shapes
so the conductor uses the frozen manual checks, not a false pass.

Within the own batch file, retain every original line/section/order; allow only
unchecked→checked markers within Checklist; append polish checklist entries there
(possibly already ticked at final inspection); change Files only to add precisely
recorded authorized paths. Preserve original checklist text. Reject removals,
reordering, rewording, unchecked resets, new ordinary items, changes outside the
allowed sections, batch rename/deletion/type replacement and forged Files grants.
Semantic legitimacy of a polish request and each production hunk remains reviewer
duty. Return status PASS / VIOLATION / UNKNOWN with path and batch-line diagnostics;
exit 0 / 1 / 2 respectively. If violations and unknowns coexist, show both and
never exit 0; document deterministic precedence.

## Checklist

- [ ] Extract the reusable disposable Git fixture and implement evidence API/CLI.
- [ ] Test every planned consumer CLI invocation, result shape and error/exit contract.
- [ ] Convert all fourteen existing Git scenarios to assert actual helper outputs.
- [ ] Implement trusted-authority, path/rename and cleanliness fence checks.
- [ ] Implement structural own-batch edit validation and explicit unknowns.
- [ ] Add adversarial tests and prove helper/checker read-only behavior.

## Acceptance criteria

Existing Git scenarios exercise actual exported helper behavior: absent/stale
origin/HEAD, main/master coexistence, all-branch/merged/custom/remote-only discovery,
tri-state ancestry, local versus remote containment, missing remote objects and
remote refs, older archived copies after owner deletion/unrelated commits, newer
ledger changes, dirty other worktrees, recorded target correction conflicts.
Fixture construction may use Git directly; expected helper results must not be
computed by a second implementation of the helper.

Fence tests cover in/out-of-fence add/modify/delete/type changes, both rename
directions, names with spaces/Unicode/quoting, staged/unstaged/untracked/conflict
dirt, inaccessible/missing worktrees, candidate-authority forgery, malformed
authority, allowed ticks/polish/authorized Files and forbidden content edits.
POSIX-only unusual filename tests are capability-gated with Windows alternatives.
Negative cases assert diagnostics and exit state, not merely nonzero.

Read-only tests snapshot refs, HEAD, index bytes and working-file bytes before/after
successful and failing calls, including helper calls on dirty trees and remote
probes. Unknowns cannot become not-contained, scope permission, COMPLETE or a pass.
No runtime dependency beyond Node and Git.

## Validation

Run all Node test suites discovered under tests (PowerShell argument array), plus
git diff --check. B01 validates the checker for future generated contracts; this ledger retains the manual gate throughout.

## Smoke (checkpoint)

- Do: run the Git evidence disposable scenarios through the production helper.
  Pass: all cases pass and output retains explicit source/ref/SHAs and unknowns;
  no repository/remote state changed. Runner: agent (CLI, disposable repos).
  Inputs: generated isolated Git repositories from tests/support/git-fixture.cjs,
  created automatically by the test; no manual repo construction.
- Do: run the fence suite's allowed, violation and malformed-authority scenarios.
  Pass: exact three statuses, both rename endpoints checked, forbidden batch text
  rejected and no files written. Runner: agent (CLI, disposable repos).
  Inputs: automatically generated fixture ledgers; test/evidence link on C1 page.

## Verbatim assigned request

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

## Fixed external CLI contract (planning requirement)

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

### B02 — Reproducible Excel artifacts (feature, —)

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

### B03 — Workflow, generated contract and smoke-page integration (feature, —)

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

- [ ] Wire/document helper probes and mechanical gate without changing decisions.
- [ ] Bake conductor input responsibilities into skill/references/templates/prompts.
- [ ] Implement and test smoke-input declarations, disk validation and per-step identities.
- [ ] Integrate input-byte validation and retained artifacts into smoke builder.
- [ ] Test raw delivered-byte hashes, LF/CRLF-only tampering and fresh autocrlf=true checkout preservation for active/archived input copies.
- [ ] Keep the machine-local Python path out of reusable templates while preserving this ledger's explicit environment fact.
- [ ] Render exact file links and use/reset instructions in existing page design.
- [ ] Enforce per-input affected revision invalidation and historical verdicts.
- [ ] Add builder/runtime/doc consistency regression tests and helper documentation.
- [ ] Replace README.md:177's fixed Node command with Get-ChildItem -Recurse, Sort-Object FullName and preserved failure propagation; prove nested tests/unit/*.test.cjs discovery with an actual failing-then-passing disposable sentinel; also publish the portable `node --test` form (bare, no directory argument — `node --test tests` fails on Node 22).

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

## Validation and checkpoint

Run all Node test files, including new suites, via Node's built-in runner and a
PowerShell argument array from Get-ChildItem -Recurse and Sort-Object FullName
(no Bash glob assumptions); propagate failures and reject an empty suite set. Summarize totals
and failing names. Run git diff --check in each batch and after each merge.
Independent gate reviewers map every hunk to an item and test meaningful negative
cases. No fix classification is being used to waive regression proof: these are
new feature surfaces; later defect repairs follow the frozen failing-on-base gate.

Final QA uses real helper exports, disposable Git repos/bare remotes, current and
reissued smoke pages, and the actual XLSX. Require SHA256(generation A) =
SHA256(generation B) = SHA256(committed workbook file bytes), never Git object IDs.
Verify actual fixtures/issued/archived input bytes in fresh core.autocrlf=true
checkouts; test recursive discovery with the deliberate nested sentinel. Literal python 3.10.6 runs the standard-library generator and independent
openpyxl 3.1.5 validator with the mandatory commands baked below. Core helpers and
workbook-integrity tests use Node/Git and checked-in workbook bytes without Python.
The actual recursive-runner regression also requires PowerShell, available here;
this runner prerequisite must be reported explicitly on hosts where it is absent.
Mandatory independent workbook-semantic validation still uses the recorded Python.

At C1 the conductor preserves exact issued assets under
evidence/C1/inputs/issue-001/ and validation evidence under evidence/C1/; issues
smoke-C1.json and smoke-C1.html with links and expected results. Keep immutable
originals; modifications use a scratch working copy, reset by copying the original.
Record raw content hashes and repeat the fresh-checkout check on the actual issued
package before handoff, including an archived-path copy in disposable storage.
Reissues allocate a new issue directory for changed bytes and raise only affected
step revisions. Previous inputs remain available with the checkpoint artifacts.
If an HTML host cannot expose file links, deliver the files as attachments/local
links alongside the page; text fallback includes the same files and instructions.

Step 0 identifies integration branch + exact tested SHA and runs the input-integrity
canary: a deliberately changed disposable input is rejected by the new builder
while the starting builder accepts/ignores such input metadata. No verdict belongs
to the canary. Agent smoke steps validate Git evidence, fence checks, Excel structure
and values, and verdict invalidation. Human steps open the delivered workbook,
follow working-copy/reset instructions, and verify the page's usable file links and
clear affected-step re-run indication. Detailed steps live in batch files.

## Coverage audit (planning-time)

| Request item | Owner |
|---|---|
| 1a checker implementation and tests | B01 |
| 1b checker gate wiring and authority | B03 |
| 2a evidence helper and converted disposable Git scenarios | B01 |
| 2b discovery/shipment usage and evidence-only contract | B03 |
| 3a reproducible Excel, narrow byte-preserving attributes, triple hashes and independent semantics | B02 |
| 3b raw-byte integrity, conductor/input delivery/reissues, recursive discovery and reusable-path boundary | B03 |
| Frozen starting protocol, scheduling/cap, historical baseline and current residual evidence | B00 conductor |

Pre-flight v4: PRE-FLIGHT CLEAN. Fresh independent recheck found no remaining BLOCKING findings after the recorded clarifications. Detail: LOG.md. Prior verdicts remain historical.

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
