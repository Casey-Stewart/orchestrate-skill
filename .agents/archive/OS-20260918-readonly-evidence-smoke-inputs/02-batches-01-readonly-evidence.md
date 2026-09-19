# B01 — Read-only Git evidence and fence checks (feature, —)

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

- [x] Extract the reusable disposable Git fixture and implement evidence API/CLI.
- [x] Test every planned consumer CLI invocation, result shape and error/exit contract.
- [x] Convert all fourteen existing Git scenarios to assert actual helper outputs.
- [x] Implement trusted-authority, path/rename and cleanliness fence checks.
- [x] Implement structural own-batch edit validation and explicit unknowns.
- [x] Add adversarial tests and prove helper/checker read-only behavior.

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
