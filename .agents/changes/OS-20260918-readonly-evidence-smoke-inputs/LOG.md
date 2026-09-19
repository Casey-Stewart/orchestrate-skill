# Log — OS-20260918-readonly-evidence-smoke-inputs

Append-only conductor log, activated at scaffold on 2026-09-18. Earlier entries
record the planning history; their pending-approval statements are historical.

## Learnings

- Windows shell wildcard expansion must not be assumed; enumerate Node test paths
  in PowerShell or use a portable runner. Git subprocesses use argument arrays.
- The starting Git test suite proves command recipes, not a production helper;
  the new tests must exercise the extracted helper while retaining real Git fixtures.
- File identity alone is not semantic validation: the concrete Excel validator
  independently checks its requirements and caches in the saved workbook.

## 2026-09-18 — planning

Starting commit f918fe39762c70edb9a3424e54eaa208fd7c5727. Working tree clean on main.
No ledger candidates in working tree or any non-symbolic local/remote-tracking ref.
Refs examined: refs/heads/main, refs/heads/feat/tier1-tier2-protocol,
refs/remotes/origin/main. Symbolic origin/HEAD skipped for ledger enumeration.
Local main is the user-confirmed protected default and shipment target; origin/main
is merely cached evidence for this run. No fetch, ref update, main switch or commit.

Baseline node --test --test-reporter=spec over the existing three suites: exit 0,
64 tests, 64 pass, 0 fail, 0 skipped. git diff --check: exit 0. Git status emitted
an inaccessible global ignore-file warning; otherwise empty. No claim was made
about remote shipment; local refs/heads/main resolved to the starting commit.

### Interview

One consolidated three-question round. User responses recorded verbatim in
00-request.md: proposed validation/QA and no extra restrictions, local main and
proposed merge policy, proposed conventions. No approval of plan or implementation.

### Exploration and scope

Codex exploration sub-agent helper_census supplied a read-only evidence/call-site
census. Existing helper decisions remain conductor duties. Authoritative scope
comes from the integration ledger; candidate Files is never authority.
Starting protocol and source blob identities are baked into the draft contract;
later template changes will not rewrite it.

### Backlog sweep

bugs-2026-09-17.md considered. No fold-ins. Historical recovery/legend/polish entries
already have matching changes at the starting tip; updating old status labels is
outside the requested outcomes. New recovery-engine work, plan.json migration and
unrelated redesign are expressly excluded. None of the historical entries merits
an additional scoped acceptance item in this change.

### Wave reasoning

B01 groups Git evidence and the fence consumer because of shared Git parsing and
disposable fixtures. B02 adds separate data-only validation/example files. Those
fences are disjoint and run concurrently. B03 owns all shared prose/contracts and
existing smoke builder/template/test changes after the two interfaces land. It is
the only hands-on wave; C1 after it is the single final checkpoint.

### Independent pre-flight

Fresh read-only plan_preflight sub-agent is checking the complete draft. Findings
and fixes will be appended here before plan approval is requested.

### Pre-flight findings and remediation

Independent plan_preflight verdict: 1 BLOCKING, 1 ADVISORY.
BLOCKING: B01 only named the explicit-Bnn extension form, although the current
PROGRESS template also supports row-bound records without Bnn. Fixed B01 and its
inline plan copy to accept both current forms, bind shorter records to the trusted
row and reject mismatched IDs/ambiguous records/forged candidate records. Added
those explicit acceptance-test cases. No fence/wave change.
ADVISORY: named out-of-fence LOG template seam lacked a disposition. B03 and plan
now explicitly leave its generic append-only narrative format unchanged; it needs
no new syntax for this work. Request template likewise needs no schema change.
The same independent reviewer is verifying the fixes before approval handoff.

### Final independent pre-flight verdict

PRE-FLIGHT CLEAN

The original independent reviewer re-read the corrected portions and reported no
remaining findings. W1 literal fence intersection check: zero. Planned branch names
are unused. The complete draft has no unfilled placeholders or instruction comments.
Plan approval is pending; no repository source changes, branch or scaffold commit.

## 2026-09-18 — plan v2 after user interface critique

User identified an avoidable producer/consumer split: B02 was free to choose the
smoke-input API that B03 had to consume without editing. The v1 pre-flight verdict
was insufficient to catch this integration risk. Kept the issued v1 artifacts under
history/plan-v1. No plan approval, scaffolding or implementation has occurred.

Moved smoke-inputs.mjs and tests/smoke-inputs.test.cjs to B03 so the input schema,
validation, path roots, historical comparison and page builder are co-owned.
B02 now contains exactly the workbook, requirements, generator and semantic
validator (four files); its two CLI recipes and fixed artifact addresses are
planning requirements. B03 does not import B02 code or parse its private JSON schema.
B01's external commands/results/exit behavior are now defined by the plan, with
actual CLI invocation tests required before independent review passes it. Imported
Git helper names stay within B01; B03 uses only tested CLI recipes in its docs.

The wave map remains W1 B01+B02, W2 B03, one final C1. W1 fences remain disjoint.
The governing protocol and starting version are unchanged. A fresh independent
reviewer is rechecking the revised seams and plan consistency before approval.
### Fresh v2 independent pre-flight result

PRE-FLIGHT CLEAN

Reviewer interface_preflight reported no blocking or advisory findings. Verified
co-ownership removes the imported-module seam; B01 commands/results/CLI acceptance
are fixed before W1; B02 artifact commands are fixed; same-wave fences are disjoint
(5 and 4 files); inline batch specs and duplicated external contracts match. The
existing synchronous builder/reissue behavior and runner/weight classifications
remain compatible. Conductor additionally verified the frozen contract is byte-for-
byte identical to v1. No source changes or repeated baseline tests were needed.
## 2026-09-18 — plan v3, explicit user validation/gate amendments

Preserved issued v2 under history/plan-v2. User pinned literal python, raised B02
to L, requested unambiguous B03 gate wording, made README test enumeration explicit,
and enabled a test hunter for this ledger. Recorded the message verbatim in request.
Applied those choices to the draft contract, plan, batch specs and consumer command
contracts; no changes derive from a new version of the skill. Convergence stays off.

Conductor chose the existing MANUAL mechanical gate for every batch/repair/polish
throughout this run, removing the optional post-B01 adoption language. Fresh reviewer
and separate fresh read-only test hunter run in parallel after the manual gate.
B02's validator/CLI negative checks are explicitly test-hunter scope even without a
Node suite. Severity/round/polish/checkpoint behavior is unchanged.

Environment verification: the sandbox shell did not resolve python; the recorded
Python310 executable existed but direct sandbox execution was denied. A read-only
version probe through authorized execution, with process-only PATH prepend, succeeded:
C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe; Python 3.10.6;
openpyxl 3.1.5. No python3 probe, package installation or persistent PATH change.
Baked literal python commands and setup into the contract and B02/B03. An alias,
PATH or permission failure cannot downgrade the required Excel example; a genuine
unresolved execution blocker leaves validation and B02 incomplete.

B03 has an explicit checklist/acceptance item replacing README.md:177's fixed list
with dynamic Windows-safe test enumeration, including failure propagation. The
recorded validation already covers W1's new suites. B02 is now artifact-only after
v2; B01 and B03 add Node suites. Rechecking plan independently before approval.
### V3 pre-flight correction: preserve polish gate shape

Independent reviewer found that unconditional reviewer+hunter dispatch after every
mechanical gate could add a full review to ordinary polish, contradicting the frozen
mechanical-close path. Qualified all active copies: reviewer+hunter at existing
batch/repair reviewer gates only; ordinary test/doc/prose polish stays mechanical-
only; production-touching polish retains its fresh scoped re-review and any hunter
checks remain in that scope. No new review rounds or gate transitions were added.
### Final independent v3 verdict

PRE-FLIGHT CLEAN

Reviewer verified literal python and process-only PATH setup, mandatory positive/
negative Excel validation, B02 L and validator hunter scope, manual batch fences,
retained mechanical-only/scoped polish behavior and severity/round accounting,
explicit README test discovery/failure propagation, disjoint W1 fences and matching
batch/contract/plan text. The stale B01 gate-adoption phrase now explicitly refers
to future generated contracts. No implementation or baseline-test rerun occurred.
Plan approval is still pending; the repository source and starting commit remain
unchanged. Draft-contract edits are explicit user amendments recorded in request.
## 2026-09-18 — plan v4, explicit byte/discovery/scope amendments

Planning-only authorization recorded verbatim in request; preserved issued v3 under
history/plan-v3. Starting repository version remains f918fe39762c70edb9a3424e54eaa208fd7c5727.
No .agents ledger, source .gitattributes, workbook, helper implementation or branch
was created. Manual fence gates, test hunters, prior interface ownership, interpreter
choice and existing round/polish/checkpoint semantics are preserved.

B02 fence adds .gitattributes with narrow fixture and active/archive input rules.
Acceptance separately requires generation A/B/committed-file content hash equality,
independent workbook semantics, and fresh core.autocrlf=true checkout byte validation
with an unprotected conversion control. B03 tests raw delivered-byte hashing and
line-ending tampering, plus recursive real-command discovery of a nested failing
then passing test. Machine-specific interpreter facts stay in this ledger, never
reusable templates. B03 remains the final serialization point; no artificial split.

Planning read-only attribute probe used proposed rules through process-only
core.attributesfile and git check-attr, without editing repository config/attributes.
All five B01 paths, its batch path and three out-of-scope controls were unchanged.
All four fixtures and direct/nested active/archive input examples matched intended
protection, with XLSX diff/merge unset. Detailed output is in the planning artifact
planning-evidence/v4-attribute-scope.txt. This proves proposed pattern scope only;
it does not replace future fresh-checkout/content-hash validation. First attempt
had a PowerShell interpolation parse error before execution; corrected probe passed.

B03 cap and serialization tradeoff are explicit. Historical bug evidence below is
recorded without editing old labels; fresh independent pre-flight is next.
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
into the starting contract. Do not edit/relabel the historical bugs file in this
round. New residuals use distinct OS-BL-001, OS-BL-002, ... IDs (next unused ID),
current tested commit, reproduction/test evidence, severity, and a pointer to the
batch/reviewer finding. Never reuse P1-1…P1-4 or infer a new defect solely from an
old label. This baseline clarification does not authorize unrelated backlog cleanup.

## 2026-09-18 — v4 consistency clarification during pre-flight

Clarified that historical P1 entries are preserved, while new evidence-backed
OS-BL-NNN residual entries may still be appended under the frozen contract. This
removes an overbroad no-edit phrase without authorizing backlog cleanup. B03 smoke
steps now explicitly carry the recursive nested-runner demonstration and LF/CRLF
raw-byte rejection, with exact delivered files/reset instructions at C1. Updated
inline batch copies and PROGRESS coverage. No source or implementation edits.

Also clarified that the new actual-runner regression requires PowerShell (available
here), whereas core helpers/input-integrity tests use Node/Git. This removes the
older overbroad claim that the whole expanded suite requires only Node/Git.

## 2026-09-18 — independent v4 pre-flight result

PRE-FLIGHT CLEAN

Independent read-only agent /root/interface_preflight rechecked v4, including all
six user amendments and the current mirrored copies. No remaining BLOCKING findings.
The reviewer verified narrow attributes/effective W1 independence, raw byte and
fresh-checkout/control requirements, generation A/B/committed-content hash equality
with separate semantics, recursive failing/passing sentinel validation, reusable
versus local interpreter facts, B03 serialization/cap and source-backed historical
resolution evidence with distinct residual IDs. The overbroad historical-file
prohibition was corrected to preserve existing entries while allowing required new
residual appends. Existing manual gates, hunter scope, polish accounting and
approval/scaffold boundaries remain intact.

Conductor consistency audit: all three batch files match their inline plan copies;
04 and 05 match full copies in both plan and contract; seven recorded source blob
IDs match the starting commit; no unresolved template/comment markers in the six
scaffold core files; five-path W1 fences have no literal overlap. Read-only proposed
attribute selection evidence remains separate from future acceptance validation.
Workbook generation, fresh-checkout content hashing and new test execution remain
planned requirements, not completed checks. No source, branch, scaffold or
implementation changes; baseline tests were not needlessly rerun for draft edits.
Plan v4 is ready for user approval.

## 2026-09-18 — review of user-authored B03 portable-command addition

The sole user edit appended the bare node --test README alternative to B03's
existing command checklist item. Compared every B03 line against its previously
pre-flighted plan copy: only that line changed. Preserved the preceding issued
draft in history/plan-v4-before-portable-command, reconstructing the old standalone
B03 from its pre-edit inline plan copy. Synced current copies and clarified that
the portable command supplements rather than replaces the primary PowerShell
validation recipe. No fence, wave, gate, frozen protocol or test-hunter change.

Actual disposable probe on Node v22.22.3: bare --test discovered both a top-level
control and tests/unit/nested.test.cjs. Deliberate nested failure exited 1; changing
only its assertion to pass exited 0. Both runs named the nested test. --test tests
exited 1 without naming either suite. No source or full-suite execution occurred.
Temporary probe directory: C:/Users/fatbo/AppData/Local/Temp/orchestrate-node-discovery-check-ZFBCNr.
Independent delta pre-flight requested before completing this review.

Independent reviewer requested one additional compatibility probe: preserved
intentionally failing discovery-sentinel.test.cjs files were added under both
.agents/changes/EXAMPLE/evidence/C1/inputs/issue-001 and
.agents/archive/EXAMPLE/evidence/C1/inputs/issue-001 in the disposable directory.
Bare node --test on v22.22.3 skipped both hidden artifact paths, discovered the
two ordinary tests, and exited 0 (2 passed, 0 failed). The planned checkpoint
artifact paths therefore do not break this convenience command on the verified
runtime. This observation is separate from the later committed regression checks.

PRE-FLIGHT CLEAN (delta)

Independent read-only reviewer confirmed no blocker: the portable README command
supplements the required recursive PowerShell validation, preserving FullName
sorting, empty-suite rejection, failure propagation and git diff --check. B03 and
plan copies match. Node 22 probes establish nested failure/success behavior and
exclusion of preserved sentinels in active/archive .agents artifact directories.
Planning only; plan approval remains pending.

## 2026-09-18 — approved scaffold

User authorization, verbatim: "Okay, approved."
Approved plan v4 and portable-command delta, PRE-FLIGHT CLEAN; W1 B01+B02, W2 B03,
final C1; no backlog fold-ins. Recorded approval in request and PROGRESS.

Repeated discovery before creation: clean main at the recorded starting commit;
no working-tree ledger and no ledger on refs/heads/main,
refs/heads/feat/tier1-tier2-protocol or refs/remotes/origin/main. Skipped only symbolic
origin/HEAD. Created the approved integration branch from exactly
f918fe39762c70edb9a3424e54eaa208fd7c5727 in the isolated worktree:
C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int
Main checkout was not switched. No batch branch or wave was opened.

Copied the approved contract, batch files and supporting requirements without
rule changes. The generated contract is byte-identical to the approved draft;
raw SHA-256: a6cb0997dcefb0131bc75bf296c4c8c2956da1fccfd728dc76fd5afd3a1233d9. This file-content hash is
provenance, not workflow state. Starting source blob IDs remain in the contract.
Only plan/approval/progress/log activation metadata and approval records changed;
this is scaffold fill, not a protocol revision. Earlier planning-only descriptions
in the copied appendices record preparation time and do not negate this approval.

Read-only planning attribute evidence is included under planning-evidence/.
Prior draft snapshots remain at C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-plan
under history/; no governing rules depend on that external planning archive.
Checkpoint evidence/inputs are not created until C1 preparation.

Scaffold self-check and staged diff validation run before commit. No implementation
or workbook validation is claimed; no source change warrants repeating the baseline
64-test suite during this metadata-only scaffold. Required new-mode STOP follows
the scaffold commit; implementation awaits the user's start instruction.

Scaffold self-check passed: 14 files; zero unresolved template/comment markers;
ACTIVE state; all three batches not started with unticked checklists; all batch
plan copies and full04/05 appendix copies match. Seven source blob IDs match the
starting commit. Seven approved rule/spec files are byte-identical to their
approved drafts. Integration base and protected main remain the starting SHA.
No checkpoint evidence directory or implementation branch exists.

First staged diff check rejected extra EOF blank lines in the three batch files
and CRLF endings in the copied planning-attribute report. Removed only the extra
EOF blank lines and converted that text report to LF. Its original planning copy
is preserved outside the ledger. No requirement, evidence value or frozen-contract
byte changed. The earlier seven-file byte-identity result was before this cosmetic
cleanup; the contract and three supporting rule files still match byte-for-byte,
and batch files match after ignoring trailing blank lines. This is not checkpoint
input normalization: no issued checkpoint inputs exist yet.

Final staged validation passed: git diff --cached --check is clean; exactly 14
ledger files staged and no source paths; no unstaged changes; all batch plan copies
match. Staged frozen-contract content SHA-256 equals the approved draft hash.
All generated files are free of unfilled template/comment markers.

## resume-20260918

Continue boot examined all non-symbolic local/remote-tracking refs (including feat/tier1-tier2-protocol and origin/main), active-root checkout search, ownership/provenance and exact local shipment refs. One ACTIVE ledger found, at the approved scaffold; main and integration clean; no planned batch branches. No completed/archive copy exists at main. Git confirms integration not contained in main. No drift correction or silent shipment inference.

Resume command: recursive Get-ChildItem tests -Filter *.test.cjs -File -Recurse, Sort-Object FullName, node --test --test-reporter=spec argument array. Result 63 pass / 1 fail of 64. Failure is tests/build-smoke-page.test.cjs:56 TypeError reading match [1], named "sections survive the fill verbatim and stay inside the script block". Existing LF-only regexp meets CRLF checkout (system core.autocrlf=true). Frozen contract repair-first rule applies before W1. Repair branch fix/B03-tip cut at scaffold, same reviewed mini-batch flow, fence tests/build-smoke-page.test.cjs only. Repair authority does not alter frozen contract/plan or W1 concurrency.

Recorded literal python environment successfully reverified through authorized execution at Python310: 3.10.6/openpyxl 3.1.5. No substitute interpreter, package install, main checkout change, merge toward main or push.
## baseline-repair-r1

Conductor manual gate PASS @70f6baadd702425ef13741fe59d614232e256744. Fresh independent reviewer FIX FIRST solely because frozen6b's actual test-copy-on-base execution passes23/23; original-harness failure and independent LF-only mutation evidence do not constitute an authorized exception. Code review otherwise clean; independent candidate suite65/65 green. Separate fresh hunter CLEAN, including full equality and escaping mutations. One FIX FIRST counted for this repair; no cap reached and no extra review round fabricated. Findings returned verbatim to original implementer; no production change or protocol amendment authorized to manufacture proof.

Required explicit user decision and actual evidence retained in PROGRESS and evidence/baseline-repair/. Repair not merged. W1/W2 remain unopened; checkpoint C1 not claimed. Main ref/worktree remains f918fe39762c70edb9a3424e54eaa208fd7c5727. No push or merge toward main. Frozen contract and locked plan retain original blob IDs 0add94797721d18049d4c7492daa5d6ea488dcda and5b145f8819af05db6bc166d2364b031942673007.
Original implementer follow-up after R1: BLOCKED @70f6baadd702425ef13741fe59d614232e256744, worktree clean, no further edits. Expected named assertion failure with repaired tests on old code. Found test harness itself is the only defect; copying repaired harness replaces it and passes against unchanged production. No honest in-fence change can make identical production fail only on base. Fabricated failures, production changes solely for proof, or silent exemptions are prohibited. User asked asynchronously to approve only fix/B03-tip's alternative original-failure plus LF-only-mutation proof; no answer or authorization inferred. Remaining gates and W1/W2/C1 unchanged.

## repair-exception-approved

User, verbatim: "Approved". Consumed for the proposed fix/B03-tip-only alternative proof. Original CRLF failure plus independently verified LF-only mutation accepted; R1 code review and hunter remain clean at unchanged70f6baadd702425ef13741fe59d614232e256744. No other contract amendment. Discovery rechecked all refs/worktrees, exact owner and main; same ledger grouped on owner and repair branch, retained repair-specific checklist changes visible, no ownership/target conflict, no main shipment. Frozen contract/plan blob identities unchanged.


## repair-integrated

Repair70f6baadd702425ef13741fe59d614232e256744 integrated with commits preserved at ce1f4448617a51031981d3180f7a681a5714dd93; dry run tree2bb3974821d690e6e6a3d0ee024554859c925f35, no conflict. Resume before merge reproduced only original63/64 CRLF assertion failure. After merge recursive FullName-sorted validation65/65 and diff check PASS. Exact evidence retained. User-approved exception resolves sole R1 proof finding, source unchanged from clean code/hunter review. Pending marker cleared; no main merge/push.


## W1-open

W1 B01+B02 opened concurrently at ae850a38fa760cb36f0ca83db35e5830ed1cc2ed after repaired integration validation65/65. Planned branches previously absent; both cut exactly from wave base. Per-worktree setup n/a. No map/fence deviation. Implementer briefs contain complete frozen batch specs and binding role instructions.


## B02-R1-gate

DONE candidate6ccc46f76eb8d45ff9a9e24bf99ad45b76bab8dc,8/8 checklist. Manual gate PASS with captured immutable refs/both-endpoint path inspection/cleanliness/own-batch blob diff. Feature failing-on-base N/A. Full implementer proof/scripts preserved under evidence/W1/B02. Fresh independent reviewer and separate hunter dispatched on current inherited model; B01 continues independently.


## B02-R1-verdict

# B02 R1 independent gates

Candidate6ccc46f76eb8d45ff9a9e24bf99ad45b76bab8dc. Fresh separate reviewer/hunter, current inherited model.

Reviewer: SHIP, no P0/P1/ASK. Every hunk mapped: exact eight attributes, four Excel artifacts, eight checklist ticks. Independently ran recorded literal Python3.10.6/openpyxl3.1.5, A/B/committed raw SHA256 equality e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f,20 protected paths and converting LF control,8 unchanged B01/control attributes/bytes, all semantics,68 named corruption rejections, overwrite refusal; recursive suite65/65, diff checks green, clean. UTF-8 LF no BOM in JSON/Python. No unintended source/module/docs changes.

Hunter: FINDINGS1, ASK, no production change required. Verification audit-mutations.py:64; production validate-orders.py:44. Exact surviving mutation: replace boolean condition with valid = actual == value. All68 existing corruption checks still pass. Types!B2 changed from boolean true to numeric1 passes mutant because1 == True; actual candidate correctly rejects with Types!B2.boolean. Add numeric1 must-fail assertion to verification. Probe artifacts under B02-hunter-probes in scratch. Otherwise independent formula/data-only,47cells/6caches/edgecases/overwrite checks and rehash/attributes controls all sound.

Combined R1 SHIP asks=1. Ordinary verification-only polish; no production behavior change authorized. Append one polish checklist item, extend scratch corruption verification, rerun and capture results. Mechanical close under frozen protocol; no extra reviewer round. Gate metrics1/0; asks counted when closed.
