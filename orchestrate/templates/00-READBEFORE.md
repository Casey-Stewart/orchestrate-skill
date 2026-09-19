# READ BEFORE ANY BATCH — orchestration & recovery

**Change**: {{CHANGE_ID}}
**You are** either the ORCHESTRATOR (the main session the user told to "continue") or an
IMPLEMENTER/REVIEWER/GATE sub-agent given one batch. Neither of you has the planning
session's context. This file is the contract. Everything needed to drive this change lives
in this ledger directory ({{LEDGER_DIR}}) — assume no other context survives between
sessions.

## Boot sequence (orchestrator, every session)

1. Read [00-request.md](00-request.md) (the user's verbatim ask + decisions),
   [01-plan.md](01-plan.md) (locked scope, batch table, wave map + checkpoints), and
   [PROGRESS.md](PROGRESS.md), plus the project's always-loaded docs — especially
   {{GUARDRAILS_REF}}; every batch diff is checked against it. [LOG.md](LOG.md) is the
   narrative record: read it ON DEMAND by anchor (a Notes cell points at it), never at boot.
2. Run `git status --porcelain`, `git branch --list`, `git worktree list`; note the current
   branch. **Never switch the main checkout.** Read ledger files from any branch with
   `git show <branch>:./<path>` (the `./` is required — Git Bash on Windows mangles
   `branch:path` otherwise) and write to the ledger through an integration worktree
   (`git worktree add <scratchpad>/wt-int {{INTEGRATION_BRANCH}}`), using the main checkout
   only if it already has `{{INTEGRATION_BRANCH}}` checked out. Run `git show` from the
   repo or worktree ROOT (the `./` path is cwd-relative). Reuse an integration worktree
   that `git worktree list` already shows; if its directory is gone, `git worktree prune`
   first — never two worktrees on one branch. Run {{WORKTREE_SETUP}} in a newly created
   integration worktree before validating in it.
3. **Reconcile** (§Recovery below) before believing any PROGRESS row.
4. **Resume-time validation**: run the validation commands (quiet form) on the integration
   tip. Red → the first job is a repair mini-batch (§Session algorithm step 2), whatever
   PROGRESS says — unless Notes record a capped tip repair awaiting the user's verdict,
   in which case ask, never re-spawn. Green → follow §Session algorithm.

Implementer sub-agents: read this file + your `02-batches-NN-*.md` batch file ONLY, and
work ONLY in the worktree your prompt names. The batch file carries the full spec text
and codebase facts — it is authoritative. Do NOT re-derive scope from the original
request or any external document.

## Roles, gates, tiers

- **Orchestrator** — owns PROGRESS, LOG, `evidence/`, branches, worktrees, merges,
  close-outs, all user communication. The ONLY role that edits version files, the
  changelog, PROGRESS or LOG.
- **Implementer** — one per batch, in its own worktree on its own branch. Reports in the
  fixed shape: first line `DONE | DONE_WITH_CONCERNS | NEEDS_FENCE | BLOCKED`, then an
  evidence block (each validation command, exit code, last ~10 lines; commit SHAs;
  checklist n/m), then ≤40 lines of prose. `NEEDS_FENCE` and `BLOCKED` use the mismatch
  form: Expected / Found / Why it matters / How to proceed.
- **Reviewer** — ONE fresh read-only sub-agent per batch per round, never the implementer,
  never reused. Verdict on line 1: `SHIP` (no P0/P1; may carry ASKs) · `FIX FIRST` (a P0
  or P1 with a concrete failure scenario) · `NEEDS A CLOSER LOOK` (names what would confirm
  it). Report capped like the implementer's. Finding classes: **P0** — wrong behavior, a
  violated criterion or guardrail, concrete scenario (blocking); **P1** — should fix,
  needs a production change, concrete scenario (blocking); **ASK** — in-fence, about the
  batch's OWN artifacts (its new tests' strength, smoke-step prose, comments, a doc sweep
  it owns), no production behavior change (non-blocking; closes as a polish pass).
- **Gate agents** (read-only, run by the ORCHESTRATOR at the reviewer gate, in parallel
  with the reviewer): {{GATE_AGENTS}}. Implementers NEVER spawn a gate agent themselves —
  a self-spawned one stalls the implementer uncommitted.
- **QA runner** — one sub-agent that executes the agent-runnable smoke steps at a
  checkpoint close-out and writes evidence. Runners available in this repo:
  {{AGENT_RUNNERS}}.
- **Tiers**: {{ROLE_TIERS}}. The reviewer never runs on a less capable model than the
  implementer; L-weight reviews and the fresh implementer of an authorized third round
  use the most capable model the session can spawn (the "strong tier"); if tiers are
  unavailable, use the default and keep the gate
  shape. Record the tier used in the row's Notes.

Every sub-agent report entering the orchestrator's context is capped (~40 lines + a
findings list); the fence check and tip validation return one line each on success.

**Metrics** (the pilot's measurement, readable from the ledger alone). Every batch row's
Notes end with `m: rounds=<FIX FIRST rounds> asks=<ASK items closed by a polish pass>
fence-bounces=<times the fence check sent the implementer back> gate=<gate-agent
findings>/<of which needed a production change> tip-red=<1 if tip validation went red
after this merge>`. Every checkpoint row's Verdict cell ends with `m: pre-smoke=<agent
steps passed>/<human steps> human-smoke-min=<minutes the user reports> escaped=<defects
the user found that no gate caught>`, completed when the user's final verdict on that
checkpoint is recorded (`escaped` counts every fail across re-runs).

### Read-only evidence tools

The ledger's captured contract is authority. Changed skill files or templates do not
rewrite existing ledgers or silently add new gates. Tools collect facts; the conductor
still resolves ownership/target ambiguity and makes every Recovery decision.

Run these Node commands with explicit arguments from the repository root. At scaffold
time bake the resolved helper paths into this contract; if unavailable or unsupported,
use the self-contained manual fallback below. Neither helper writes evidence files;
the conductor may capture stdout with the command, exit and captured SHAs.

```text
node {{EVIDENCE_TOOL}} discovery --repo <repo>
node {{EVIDENCE_TOOL}} worktrees --repo <repo>
node {{EVIDENCE_TOOL}} ancestry --repo <repo> --ancestor <ref-or-sha> --descendant <ref-or-sha>
node {{EVIDENCE_TOOL}} shipment --repo <repo> --integration <full-ref> --source local --ref <full-shipment-ref>
node {{EVIDENCE_TOOL}} shipment --repo <repo> --integration <full-ref> --source remote --remote <name> --ref <full-shipment-ref>
node {{EVIDENCE_TOOL}} ledger --repo <repo> --ref <full-ref> --ledger <id> --owner <ref-or-sha> --target <ref-or-sha>
node {{FENCE_TOOL}} --repo <repo> --integration <full-ref> --batch <full-ref> --ledger <id> --batch-id <Bnn> --batch-file <repo-relative-path>
```

Evidence stdout is one JSON object: operation, repo, completeness
(complete/partial/unknown), evidence and diagnostics. Discovery retains refs/SHAs/
symbolic targets, worktrees and ledger locations/provenance grouped by id; it never
classifies those ledgers. Ledger observations expose presence, tree, lastChange,
lastChangeTree, progressText and contractTexts at the requested ref, including archive
presence. Unavailable values are null, never absent facts. Ancestry/shipment return
captured SHAs and result contained/not-contained/unknown. Exit 0 means complete facts
(including not-contained); exit 2 means partial/unknown or invalid invocation. Read
the JSON tri-state, never infer ancestry from helper exit 0 alone. Remote shipment
queries the named remote now, without fetching; a cached remote ref is insufficient.

After the implementer report, before failing-on-base and fresh independent review,
run the mechanical fence command. It captures integrationSha, batchSha and mergeBase;
authority is the committed integration plan plus recorded authorized extensions,
never the candidate's Files line alone. PASS (exit 0) is only mechanical clearance;
VIOLATION (1) returns violations; UNKNOWN (2) returns unknowns and takes precedence
when both arrays contain diagnostics. Retain both arrays. Neither grants an extension,
changes ledger state, replaces semantic hunk mapping, or approves a merge.

Supported fence grammar: full local refs for integration and batch; a single id under
.agents/changes; unambiguous Markdown tables with #, Branch, Files (fence) in 01-plan
and #, Branch, Notes in PROGRESS; Bnn ids; exact comma-separated backtick paths (no
globs). Baseline batch Branch and Files lines must exactly match the plan; Files is
"**Files**: " followed by those paths. A unique "## Checklist" ends at the next
level-two heading. Only [ ] to [x] ticks, appended "- [ ] polish: ..." items (or
their completed ticks), and precisely authorized Files additions are permitted.
Extensions use "fence +path (Bnn, item, reason, YYYY-MM-DD)" in Notes and exactly
one matching Session log record (the row-bound short form omits Bnn); no commas in
item/reason. Unknown or legacy shapes use the manual gate, never rewritten authority.
All tools reject unknown, duplicate or missing flags; --help documents usage.

**Manual read-only fallback.** Capture refs with git rev-parse --verify ref^{commit}
before comparing; failed probes mean unknown. Enumerate ALL local/remote-tracking
branches with git for-each-ref --format='%(refname) %(symref)' refs/heads/ refs/remotes/.
Retain symbolic refs as hints but do not probe their trees. For every other full ref,
git ls-tree -r --name-only ref -- .agents/changes/ finds active ledger PROGRESS files;
also inspect .agents/changes directly in each worktree from git worktree list --porcelain.
Group the same id across locations, never pre-filter by branch name or ancestry.
Read only candidate ownership/target fields before selecting a ledger; read blobs with
git show ref:./path from the repo root. Compare ledger-subtree tree IDs and the last
ledger-changing commit (git log -1 --format=%H ref -- ledger-path), not whole tips.
Proven older copies can be superseded by the owning contract; unknown provenance,
dirty copies, divergent owners and conflicting targets remain visible/ambiguous.
Only an explicit COMPLETE or archived copy at the resolved shipment target supersedes
older candidates; ancestry alone never proves completion. Do not sweep archives into
the active inventory. Follow the frozen discovery/Recovery classification rules.

Classify from the PROGRESS preamble's State line; without it use batch-table rows and
explicit Session/verdict-log completion, never the Legend or quoted log prose.
COMPLETE is explicit and never resumed; ACTIVE/AT-CHECKPOINT or open non-human rows
remain active without a COMPLETE marker; only human-action rows open means USER-BLOCKED.
Ambiguity asks the user. Multiple active ledgers require a choice. Inspect the full
body of only the selected ledger; never copy it into the default checkout.

For ancestry use git merge-base --is-ancestor with captured SHAs: exit 0 contained,
1 not-contained, any other exit unknown. Shipment source resolution is in Recovery.
Inspect every worktree's porcelain status including untracked files and both rename
endpoints. Before status, inspect effective Git config: executable clean/process
filters or submodules make safe cleanliness unknown; do not execute such filters to
obtain a clean result. For the manual fence, use git diff --name-status -z -M
integration-sha...batch-sha, inspect both rename endpoints against the committed plan
union recorded extensions union own batch file; inspect that file's blob diff for
only the permitted ticks/polish/authorized Files edits. Cleanliness and parse failures
remain unknown until resolved. Report violations and unknowns separately and retain
the same fresh semantic reviewer gate. No helper or fallback changes round caps.


## Git model (locked)

- Default branch (protected local ref): `{{MAIN_BRANCH}}`. Integration branch: `{{INTEGRATION_BRANCH}}` —
  every reviewed batch merges into it, and it is the ONLY branch that ever merges
  toward `{{MAIN_BRANCH}}`.
- Shipment source: `{{SHIPMENT_SOURCE}}`. Shipment ref: `{{SHIPMENT_REF}}` — the
  confirmed default branch on that source. `local` means a local merge counts;
  `remote <name>` means a merge on that remote counts. These are locked facts,
  distinct from permission to merge/push. Remote-tracking refs are cached evidence,
  never a substitute for the recorded source. Resolve shipment as described in
  §Recovery; do not re-detect these facts from the current checkout.
- One branch per batch, named in the batch file (branch prefixes in this repo:
  {{BRANCH_PREFIXES}}), cut from the integration tip when the batch's wave opens.
  Wave members run CONCURRENTLY: one implementer per batch, each in an isolated git
  worktree under the session scratchpad (never inside the repo). Per-worktree setup:
  {{WORKTREE_SETUP}}. Same-wave fences were planned disjoint.
- **Merge/push policy**: {{MERGE_POLICY}}
- **Execution model: {{EXECUTION_MODEL}}** — {{EXECUTION_MODEL_RATIONALE}}
- Wave open = ONE PROGRESS commit on `{{INTEGRATION_BRANCH}}` (member rows → `🔄`,
  branches named, wave base SHA in the session log, `**State**` line updated) — the crash
  marker §Recovery keys on. PROGRESS, LOG and `evidence/` are edited ONLY on the
  integration branch, by the orchestrator, through the integration worktree (the QA runner
  writes `evidence/` files there; the orchestrator commits them); implementers
  touch only their own batch file, on their own branch, and only its checklist ticks,
  appended `- [ ] polish:` lines, and its Files line under a recorded fence extension.
- **Integration procedure, per batch**: `git merge-tree --write-tree {{INTEGRATION_BRANCH}}
  <batch>` as a dry run — a conflict is STOP AND INVESTIGATE (fence violation, unrecorded
  fence extension, or a ledger file edited on both sides; git reports the conflict, not
  the cause), never hand-resolved silently → merge → run the validation commands on the
  integration tip → green: flip `🟢`; red: the tip stays non-green, no further merges,
  repair via a mini-batch (below).
- **Repairs are mini-batches.** Every repair — a red tip after a merge, a failed
  pre-smoke step, a user-reported checkpoint failure — runs on its own branch cut from
  the integration tip — `fix/<batch>-c<n>-followup` (checkpoint failure),
  `fix/<batch>-tip` (red tip), `fix/<batch>-presmoke-<step>`, `fix/<batch>-revert`
  (user-ordered revert of a merge) — through the fence check, a fresh reviewer, the dry run,
  the merge and tip validation like any batch. A repair is a `fix` batch for step 6b: it
  must carry a test that fails on the pre-repair tip (a revert is exempt — its proof is a
  green tip after the merge and a reviewer confirming the diff is the exact inverse). Never a direct commit on
  `{{INTEGRATION_BRANCH}}`.
- The wave map and checkpoint placement in [01-plan.md](01-plan.md) are LOCKED: plan
  approval authorized the concurrency; deviations need the user's explicit words,
  recorded verbatim in PROGRESS (sole standing exception: a recorded `NEEDS_FENCE`
  deferral moving the final checkpoint — §Fence changes). A wave opens only when every earlier wave's members are
  `🟢`/`✅`, `⛔ (dropped)` or `👤` (dependents of those held `⬜`), the tip is green, and no
  reached checkpoint is unanswered; a `⛔` still awaiting a verdict stops the session
  before this point.

### §Fence changes (mid-wave)

An implementer that needs a path outside its fence does NOT touch it: it finishes every
item it can, commits, and reports `NEEDS_FENCE: <paths> — <item> — <why>`. The
orchestrator's test is mechanical: the path must be absent from the fence of EVERY
same-wave sibling regardless of status (a sibling already `🟢` is the dangerous case — the
extension would edit from the wave-base version and no reviewer sees the interaction)
and from every extension recorded this wave; ledger, version and changelog files never
qualify. Pass → record "fence +<path> (B<NN>, <item>, <reason>, <date>)" in the row's
Notes and the session log on the integration branch, then resume the implementer, whose
only batch-file edit is the Files line on its own branch. Fail → the batch's other items
are gated and integrated now; the deferred item is recorded in the row's Notes and the
session log as `deferred to W<n+1>: <item> (<path>)` and runs as a continuation of the
same batch in the next wave (branch `<batch-branch>-w<n+1>` cut from the tip, fence
extended then); a recorded deferral does not hold the wave open. At that wave's open the
row flips back to `🔄` with its Branch cell pointing at `<batch-branch>-w<n+1>`; the
checkpoint after wave n covers the batch's other items and the deferred item's smoke
steps ride the next checkpoint; with no later wave, the continuation is a final wave on
its own and the final checkpoint moves to after it — record the move in the
checkpoint-table row (After wave) and the session log (the recorded deferral is the
authorization to deviate from the map); wave n then closes without a checkpoint; the row
returns to `🟢` when the continuation integrates. If two batches need
the same region, the question goes in the STOP hand-off. The fence check's allowed set is the plan's fence ∪ recorded
extensions ∪ the batch's own file — never the implementer's Files line alone.

## Validation commands

{{VALIDATION_COMMANDS}}

All must pass before a batch may integrate (`🟢`). Orchestrator runs use the QUIET form
above (a totals line plus failing test NAMES, so failing sets compare by name against any
allowlist); full output is read only on a non-zero exit. If the block above says `none`,
the checkpoint smoke tests carry ALL verification — state that explicitly when handing
over. Mutation runner (optional, scoped to a batch's changed files): {{MUTATION_RUNNER}}.

## Version + changelog rule (orchestrator-only)

- Version files (bump in lockstep): {{VERSION_FILES}}
- Bump cadence: {{VERSION_BUMP_RULE}} — applied on the integration branch at
  integration or checkpoint close-out, never inside a wave worktree.
- **Whatever the cadence, the version MUST differ from the base branch's by the time
  a checkpoint script is handed over.** A version shared with the base makes the
  script's step 0 unable to tell the two apart, and a whole smoke run can execute
  against the wrong tree and report the un-fixed defects as failures. If the cadence
  above would leave them equal at a checkpoint, bump anyway and note it in PROGRESS. A
  checkpoint marker costs the PATCH component; the release takes ONE minor.
- Changelog: {{CHANGELOG_RULE}}

Implementer sub-agents NEVER touch version files, the changelog, PROGRESS or LOG. If all
three lines say `none`, skip version/changelog work at close-out and say so.

## Repo conventions (binding)

{{REPO_CONVENTIONS}}

## Hard prohibitions

- No scope creep: modify ONLY the files in your batch file's fence. Anything else you
  notice goes in a PROGRESS Notes entry (orchestrator) or your final report (sub-agent) —
  never in the diff. Need a file outside the fence? Report `NEEDS_FENCE` (§Fence changes).
- Implementers never edit their batch file beyond checklist ticks, appended
  `- [ ] polish:` lines, and the Files line under a recorded extension; never spawn gate
  agents; never leave untracked files in the worktree (reconcile reads that as dirt —
  scratch goes under the session scratchpad).
- No `--no-verify`, no force-push, no history rewriting.
- Never commit to `{{MAIN_BRANCH}}`, never push, never merge toward `{{MAIN_BRANCH}}` —
  except as the merge/push policy above allows or the user explicitly authorizes in the
  current session. (Merging reviewed batch branches into `{{INTEGRATION_BRANCH}}` is
  the orchestrator's normal job.)
- {{EXTRA_PROHIBITIONS}}

### Complete checkpoint inputs

The conductor inventories required files per smoke step at planning and checkpoint
close-out. Specify workbook sheets, columns, types, formulas, cached results and edge
cases; generate reproducible synthetic inputs, then independently validate against
those requirements. A digest proves byte identity, never workbook semantics. Preserve
commands, exits, observed results and environment with the issued artifacts. Identify
the exact private-data, credential or external-access prerequisite when generation
is impossible; an unavailable dependency is never pre-verified. Ordinary synthetic
preparation needs no new approval gate. Never ask the tester to construct files unless
construction itself is the behavior being tested.

Deliver the actual usable files beside the page, named/linked in each relevant step
with its expected Pass result. Provide exact read-only or working-copy and reset
instructions; modify disposable copies, never issued originals. Preserve files and
validation evidence in versioned evidence/Cn/inputs/issue-NNN/ directories. Copy raw
bytes and verify hashes in the delivered checkout, including effective Git attributes
and core.autocrlf=true when Git carries the package. Keep validation reports whose
hashes are declared under the same byte-preserving input paths. A hosted page whose
renderer cannot serve relative files needs separate usable attachments/local links
and an explicit mapping; an inaccessible URL is not a delivered download.

The sidecar has a stable-id inputs registry; each step references its exact IDs.
Each input records path, raw SHA-256, byte size, requirements, independent validation
evidence (path/hash/size, command, exit 0, result, environment), mode, use and reset.
Safe paths are relative to the HTML's artifact directory; reject absolute/traversal
paths, symlinks, missing files, directories or mismatched bytes. The builder validates
real disk bytes before writing HTML; imported calls with inputs need explicit
inputRoot. Legacy sidecars with no inputs remain usable. In a tool-less runtime,
perform these declaration, raw-file and history checks manually before hand-over.

On reissue preserve the previous page/sidecar snapshot and every prior input/evidence
file. Use a new issue path for changed bytes; inputHistory retains path/hash/size of
old artifacts no longer referenced. An issued path cannot change identity, and missing
prior artifacts are an error. Compare resolved input metadata, not just stable IDs:
changed bytes, path, requirements or use/reset/validation instructions require revision
increases for EVERY referencing existing step, including same-build corrections.
Unrelated revisions/verdicts/notes remain intact; old affected passes and pre evidence
are historical, shown as NOT RE-RUN until fresh applicable verification. The plain-text
script/results name the same files, requirements and use/reset instructions.

Record interpreter/dependency discovery as this ledger's environment fact; reusable
templates never hardcode a machine installation path. For this skill's concrete Excel
example, use literal python with openpyxl, confirm sys.executable/version, and run:

```text
python tests/fixtures/smoke-inputs/generate-orders.py <new-output.xlsx>
python tests/fixtures/smoke-inputs/validate-orders.py <workbook.xlsx> <requirements.json>
```

The fixed example is tests/fixtures/smoke-inputs/orders.xlsx with
orders.requirements.json, generate-orders.py and validate-orders.py beside it. Generate
A and B to new paths (generation refuses overwrite) and require raw
SHA256(generation A) = SHA256(generation B) = SHA256(committed workbook file bytes)
from a fresh checkout. Independently check sheets/types/formulas/caches and reject a
deliberately corrupt copy. Orders F2 is 22.50; Summary B2/B3 are 23.50/4. In a working
copy, Orders C2 from 2 to 3 recalculates F2 to 33.75 and Summary B2 to 34.75; reset by
recopying the immutable original. An actual Excel/compatible app is a human prerequisite
unless a real spreadsheet runner is available. Hash checks alone never establish this.


## Smoke checkpoints

The user smoke-tests at the CHECKPOINTS in the checkpoint table (the plan's wave map,
as moved by any recorded deferral) — never per batch.
Intermediate checkpoints exist only after waves carrying hands-on batches (marked in
the batch table); the final checkpoint is mandatory and covers everything since the
last one. At a checkpoint the orchestrator assembles ONE combined script — every
covered batch's smoke steps, data-touching sections first, then the rest of the
hands-on work, steps numbered continuously. How the user smoke-tests in this project:
{{SMOKE_PROCEDURE}}. A reached checkpoint is never skipped and never resolved without
the user's verdict.

**Runners.** Every smoke step is tagged at planning time `Runner: agent` (executable in
THIS repo's environment by the runners listed under Roles) or `Runner: human` (hardware,
credentials, feel, another OS, or anything not listed). A step flagged "Touches your data"
is human unless the runner line names a disposable fixture environment. Default is
human. Before the page is issued, the QA runner executes every agent step on the
integration tip and writes `evidence/C<n>/step-NN.md` (command, exit code, output tail or
screenshot path, the integration SHA and the environment). The page renders those steps
as **pre-verified** with their evidence, collapsed but re-runnable; human steps are
unchanged; a step the runner could not perform is issued as a human step with the reason. A failing agent step is a defect found before the user's time is spent: rows
stay `🟢`, the failure goes to Notes + evidence, a repair mini-batch fixes it, then the
close-out resumes — it is NEVER `❌`, which means the USER reached the checkpoint and
failed it. A pre-verified label is invalidated for any step whose covered files a later
repair touched; the QA runner re-runs it before the page is re-issued.

**Delivery.** The batch files' smoke steps are canonical. Use the newest committed
`smoke-*.html` in this ledger as the page's format and delivery base (or the session's
own template), update it for this checkpoint, and commit it as `smoke-<Cn>.html`.
A `smoke-<Cn>.json` sidecar beside the page is the page's source: change the sidecar
and regenerate, commit both, and never hand-edit one of them alone.
Before editing a re-issue, preserve the last issued sidecar as a temporary baseline
and compare against it during regeneration. Keep existing step numbers and order;
append new steps after them with numbers above the previous maximum. Never decrease
revisions; changes to instructions or shared section context require increases for
the affected steps.
Deliver it through the driving runtime's available HTML preview, file hand-over, or
publishing tools; reuse the existing hosted URL when the runtime can update it.
Record the CURRENT delivery location in PROGRESS's `Smoke page` field: URL,
ledger-relative HTML path, or `plain text`. When switching delivery, retain the
previous hosted URL in LOG for future reuse; never present an outdated hosted page
as the current run. Include the gate essentials in text with every page hand-over.

No particular publisher or cloud verdict store is required. Without a usable HTML
delivery route or page/template, print the FULL combined script: gate first, then
each step's Do / Pass in section order, with pre-verification and carried-over results
identified. If a page was prepared, keep its committed audit copy even when delivering
text. Browser-local saving works without cloud synchronization where browser storage
is available. Keep storage isolated by change and checkpoint; switching runtimes,
hosts, or browsers does not transfer saved marks automatically. Use the recorded user
verdicts and the new hand-over's results; missing stored marks are not passes.

Every script OPENS with a non-verdict gate: the command that prints the current
branch, the version the user must see, and a canary whose result is OPPOSITE on the
base build — run first, "if it behaves the old way, stop and say so".

**Verdicts are four**: **pass** · **fail** (did something else — triage to the
offending batch(es) → ❌) · **blocked** (the step could not be performed as written —
correct the STEP and re-ask, or reclassify as fail if the app lacks the behavior) ·
**works-but** (works exactly as specified, the user wants it different → named
{{BACKLOG_FILE}} entry — never a failure, never blocks the pass). The user's message
carries the verdict — the page's "Copy results as text" paste is the preferred form,
recorded verbatim. On re-issues never renumber existing steps (verdicts key on step
numbers); annotate corrected steps instead.

On page re-issues, set `BUILD_SHA` to the tested integration SHA (before the page commit).
Each step's `revision` starts at 1; increment it only when the step's instructions,
criterion or covered behavior changes, and retain it on subsequent re-issues. Save
`buildSha` and `stepRevision` with human verdicts. Preserve earlier verdicts and notes:
unchanged steps are labeled carried-over, affected steps require re-running or current
agent pre-verification. Copy results with that distinction and the current build SHA;
an old verdict on an affected step is not a fresh pass or failure. Selecting a verdict
again after a re-run records the new build/revision; editing its note does not. In plain
text, likewise identify carried-over results and affected steps still awaiting a verdict.

Agent evidence carries `pre: {sha, stepRevision, env, evidence}`: record the revision
actually tested and retain it with the original SHA until a new successful run. A
revision mismatch or missing evidence metadata requires re-verification, even on the
same build. Matching revisions from an earlier build remain applicable and are labeled
carried-over. Validate `BUILD_SHA` as a full hexadecimal Git object ID (40 or 64
characters) before loading saved verdicts or enabling input/copy; an invalid identity
must visibly stop the page without touching saved records.

Timestamp each human verdict, clear, and note edit locally as `at`, advancing beyond
the step's previous/observed timestamp. If a page store is available, persist that same
timestamp to it.
Only a strictly newer snapshot may replace an existing record; preserve verdict,
note, build identity, and revision together. Defer newer remote records while a note
is being edited and reconcile on blur. An unchanged snapshot must not rewrite local
storage; older/equal or untimed snapshots must not erase a newer local result.

**Verdict intake.** A checkpoint PASS flips every covered row `🧪`→`✅`. A FAIL indicts
batch(es) → `❌`, and the intake writes `fix-up pending: fix/<batch>-c<n>-followup[-<k>]`
into each indicted row's Notes (suffix `-2`, `-3`… when the name already exists) — the
branch step 2 and §Recovery act on; never a second line while the row's earlier fix-up
is unmerged — a further report rides that fix-up as additional failure notes (rows the
user explicitly passed → `✅`, the rest stay `🧪` for the re-run). *Waive* is the user's
recorded decision to treat the checkpoint as passed without running it. Every verdict is
quoted verbatim in the verdict log.

## §Recovery — reconcile ledger vs git (orchestrator, every session)

Resolve shipment before inferring a silent merge. Use the locked default and shipment
fields above, never the current branch, `init.defaultBranch`, or a guessed `main`/`master`.
Missing, contradictory or renamed targets are AMBIGUOUS: ask for a recorded correction,
never silently rewrite this contract or substitute another ref. The integration branch
must be distinct from the default and shipment branches.

Resolve the integration branch's full local ref to `<integration-sha>`. Resolve
`<shipment-sha>` from the recorded source:

- `local`: `git rev-parse --verify {{SHIPMENT_REF}}^{commit}`. This needs no remote;
  an unpushed local merge counts under this policy.
- `remote <name>`: read `git ls-remote --exit-code <name> {{SHIPMENT_REF}}` now and
  take the SHA of the exact matching ref. Verify that object exists locally as a
  commit before testing ancestry. A cached `refs/remotes/...` value alone does not
  establish current upstream state. A failed query, missing ref or missing object
  leaves shipment unknown; do not fetch or update remote metadata automatically.

Use these captured SHAs for the shipment test; exit 0 means contained, 1 means not
contained, any other error means unknown. Different local/remote tips do not matter
when the recorded source is clear. Unknown shipment never flips rows or authorizes
cleanup. Target ambiguity blocks actions depending on that target; independent
read-only discovery/status may continue. Record the source, ref and SHAs with an
inferred shipment. Existing merge/push permissions still apply.

For each PROGRESS row not `✅`/`👤`/`⛔ (dropped)`:

```sh
git rev-parse --verify <branch>                                        # exists?
git merge-base --is-ancestor <branch> {{INTEGRATION_BRANCH}} && echo INTEGRATED
git merge-base --is-ancestor <integration-sha> <shipment-sha>          # only after source resolution above
git log {{INTEGRATION_BRANCH}}..<branch> --oneline                     # commits ahead
git worktree list && git status --porcelain                            # dirt (check each wave worktree)
git show <branch>:./{{LEDGER_DIR}}/02-batches-NN-<slug>.md             # checklist state (keep the ./; run from the root)
```

Rows are matched top to bottom; the first match wins.

| Ledger says | Git shows | Verdict |
|---|---|---|
| any row whose Notes end in a spent *fix again* (`third round on <branch> @<sha>`) | no commit after `@<sha>`, branch not yet an ancestor of `{{INTEGRATION_BRANCH}}` | Crashed before the third round landed → re-spawn the FRESH strong-tier implementer per step 2's table |
| any row whose Notes end in a spent *fix again* | commits after `@<sha>`, branch not yet an ancestor of `{{INTEGRATION_BRANCH}}` | Third round landed → worktree dirty: re-spawn the FRESH strong-tier implementer at the open findings; clean: fence check, then the fresh re-review with both rounds' findings |
| any row whose Notes carry a `… capped:` marker not followed by a later `verdict … spent` (a marker re-written after a spent line counts as awaiting) | any | Awaiting the user's verdict on that repair (fix again / ship with the residual / drop; ship / drop only after a spent *fix again*) — do not re-gate, do not re-spawn; a recorded verdict is consumed by step 2 |
| any row whose Notes carry a `… repair pending:` marker (`tip repair pending:` / `pre-smoke repair pending:`) with no later spent *ship* / *drop* verdict (those retire it unmerged) | any | In-flight repair — branch missing: spawn it on the named branch; no commit after the marker's `@<sha>`: never started → resume the implementer on that branch (fresh worktree); commits after `@<sha>` but not integrated: resume / gate it per the 🔄 rows on that branch (never a same-named new one); integrated: tip validation (a pre-smoke repair also re-runs its step), remove the marker, then continue per step 2 (tip: back to step 7 or 4; pre-smoke: resume the close-out) |
| 🔄, Notes carry `polish discarded: @<sha>` | branch not an ancestor of `{{INTEGRATION_BRANCH}}` | Discard in flight → branch tree differs from `@<sha>`: finish the revert (ONE commit spanning `@<sha>..HEAD`; never a reset); tree identical (`git diff @<sha> <tip>` empty): integrate now (dry run → merge → tip validation); the marker stays as the record |
| 🔄 | Notes record `R<k> SHIP @<sha>` (no `asks=` on that line) for the current tip | Reviewed, crashed before the merge → integrate now, no re-review |
| 🔄 | Notes record `R<k> SHIP @<sha> asks=<n>` for the current tip, worktree clean | Shipped with ASKs, crashed before the polish → polish pass (ASK list in LOG.md), then its mechanical close |
| 🔄 | Notes record `R<k> SHIP @<sha> asks=<n>`, commits after `@<sha>`, worktree clean, every `polish:` item ticked (at least one appended) | Polish landed, crashed before its close → 6a + validations on the tip; `git diff --name-only <sha>..HEAD` touches only test/doc/prose paths → integrate; a production file → fix-diff-only re-review by a fresh reviewer |
| 🔄 | Notes end in `R<k> FIX FIRST @<sha>` for the current tip | Round in flight, fix not landed → resume the implementer (fresh) with that round's findings from LOG.md; not a round |
| 🔄 | branch missing, or no commits past the wave base | Implementer never landed → re-spawn it (fresh worktree) |
| 🔄 | dirty worktree, or commits ahead + partial checklist (incl. unticked `polish:` items; a recorded deferral is not a partial checklist) | Resume the implementer — a fresh agent, the original is gone — at the first unticked item (recreate the worktree if gone; a `SHIP … asks=` line with no `polish:` items yet → the ASK list in LOG.md) |
| 🔄 | commits ahead, checklist fully ticked | validations green → crashed before the gate → fence check, then the reviewer gate now (latest `R<k>` line is `FIX FIRST @<sha>` → the round-<k+1> re-review, recorded `R<k+1>`: verifies that round's findings from LOG.md, scans `git diff <sha>..HEAD`); red → resume the implementer (fresh) with the failing output, not a round |
| 🔄 | branch already an ancestor of `{{INTEGRATION_BRANCH}}` | Crashed between merge and flip → tip validation, then 🟢 (red → repair mini-batch) |
| 🟢 (every member of a checkpoint-carrying wave is 🟢, ⛔ or 👤 — verdict or not) | checkpoint row not 🧪/✅ | Close-out unfinished → integrate any 🟢 member whose branch is not yet an ancestor of `{{INTEGRATION_BRANCH}}` (dry run → merge → tip validation), then finish the close-out (tip validation → pre-smoke → page → 🧪); never open the next wave |
| 🟢 | branch NOT an ancestor of `{{INTEGRATION_BRANCH}}` | Crashed between review and merge → integrate now (dry run → merge → tip validation) |
| 🟢 | branch ancestor of `{{INTEGRATION_BRANCH}}` | Correct state — waits for its covering checkpoint |
| 🧪 | shipment check confirms integration tip contained in the recorded shipment target | User merged silently → flip the checkpoint's covered rows ✅, propose branch deletes |
| 🧪 | shipment unknown or target ambiguous | Do not infer a pass or propose cleanup; resolve the target/evidence or ask the user for the checkpoint verdict |
| 🧪 | shipment check confirms integration tip not contained | Correct state → ask the user for the checkpoint verdict |
| ❌ (not fix-up capped) | no branch named by the latest `fix-up pending:` Notes line | Fix-up never started → spawn it on that branch |
| ❌ (not fix-up capped) | that branch ahead, not integrated | Resume / gate it per the 🔄 rows (a `SHIP` there continues step 2's fix-up flow: → 🧪 → re-issue, never 🟢) |
| ❌ (not fix-up capped) | that branch integrated, tip green | Covered rows → 🧪, re-issue the page with affected steps annotated |
| ❌ (not fix-up capped) | that branch integrated, tip red | Repair mini-batch on the tip first |
| ⛔ (either kind) or `❌ (fix-up capped)` | any | Awaiting the user's verdict (fix again / ship with the residual / drop; ship / drop only after a spent *fix again*) — do not re-gate, do not re-spawn; dependents stay ⬜; a recorded verdict is consumed by step 2 |
| ⬜ | a branch with the batch's planned name already exists | Wave-open crashed before its flip (or a name collision) → nothing to reconcile now; step 4's idempotent cut adopts or stops when this wave opens |
| ⬜ | no such branch | Correct state — waits for its wave |

Prune worktrees of integrated batches (`git worktree remove`). Log every
reconciliation in the PROGRESS Session log (one line) and LOG.md (detail).

## §Session algorithm ("continue")

1. Boot + reconcile + resume-time validation (above).
2. Repairs first, as mini-batches (Git model).
   - **Checkpoint failure** (`❌`): spawn ONE fix-up implementer on the branch the
     verdict intake recorded in Notes as `fix-up pending: fix/<batch>-c<n>-followup[-<k>]`
     (suffix `-2`, `-3`… when the name already exists — a second ❌ on the same batch and
     checkpoint is a NEW fix-up, and a fail on a step annotated as a known residual
     re-indicts), cut from the integration tip, with the user's failure notes VERBATIM +
     the indicted batch file(s) + the diff since the last passed checkpoint (the Base SHA
     before the first); fence check → fresh reviewer (spec = the
     failure report + the batch's acceptance criteria) → dry run → merge → tip validation
     → rows back to 🧪 → STOP, re-issuing the checkpoint's script per §Smoke checkpoints
     (republish with the affected steps annotated — earlier verdicts survive; or reprint
     the text; bump the PATCH marker before re-issuing so step 0 can tell the repaired
     build from the one just tested). Failing review twice → `❌ (fix-up capped)`, left
     unmerged (the status stays through a third round; the round's `SHIP` flips the row
     to `❌` in the commit recording it, and the fix-up proceeds from its dry run).
   - **Red tip with no checkpoint reached** (resume-time validation, or after a merge):
     the same mini-batch on `fix/<batch>-tip` (`<batch>` = the last batch merged before
     the red) with the failing output as the spec; once green, return to step 7 or step 4
     — no 🧪, no STOP. Failing review twice → rows keep their status, the tip stays red
     (no further merges).
   - **Failed pre-smoke step** (step 8): `fix/<batch>-presmoke-<step>`; failing review
     twice → the step is issued as a HUMAN step carrying the failure note.
   - **Pending markers**: spawning a `-tip`/`-presmoke` repair writes `tip repair
     pending: <branch> @<sha>` / `pre-smoke repair pending: step NN, <branch> @<sha>`
     (`@<sha>` = the tip the branch was cut from) into the affected batch's Notes in the
     same commit (the phrases §Recovery keys on, like `fix-up pending:`); the marker is
     removed in the commit that records the repair's merge, and a consumed *ship* /
     *drop* verdict retires it unmerged (the spent line supersedes it).
   - **Capping** never writes `❌` for a `-tip`/`-presmoke` repair. Every capped repair
     writes `tip repair capped: <branch>` / `pre-smoke repair capped: step NN, <branch>` /
     `fix-up capped: <branch>` into the affected batch's Notes (the phrases §Recovery keys
     on) + LOG, and the session STOPs naming three verdicts. Verdicts are recorded
     verbatim in the verdict log (Checkpoint column `B<NN>`) and consumed EXACTLY ONCE:
     the consuming session appends `verdict <date> <fix again|ship|drop> spent → <what it
     did>` to the subject row's Notes (a spent *fix again* names the round's branch and
     tip: `third round on <branch> @<sha>`), and whenever a repair returns to the capped
     state it re-writes its `… capped:` marker after that line. After a spent *fix
     again*, the re-ask offers only ship / drop — no fourth round. Every `⛔ (dropped)`,
     by any route, raises the ⬜-dependents question at the next STOP. "Merge only if the
     tip then validates green" means a TRIAL first: the dry run (`git merge-tree
     --write-tree <tip> <branch>`; a conflict → STOP AND INVESTIGATE, as in the
     integration procedure), then `git commit-tree <tree> -p <tip> -m trial`, check that
     commit out in a temporary worktree (`git worktree add <scratchpad>/wt-trial
     <commit>`; a stale `wt-trial` from a crashed trial is removed first), run the
     ledger's per-worktree setup there ({{WORKTREE_SETUP}}; skip only if `n/a`), then
     run the validations and remove the worktree; green → merge for real; red → no
     merge. A setup failure blocks the trial and the merge as an environment problem,
     not a red validation result; resolve setup and retry the trial before deciding
     whether to merge.

   | Subject | fix again | ship with the residual | drop |
   |---|---|---|---|
   | `⛔` batch | authorized third round: a FRESH implementer on the strong tier, on the batch branch (row → 🔄), both rounds' findings + the current diff, then a fresh re-review; `FIX FIRST` again → `⛔` (kind per step 6; the recorded `R<k> FIX FIRST` line now ends the Notes) | only for `⛔ green, residual finding open` (a `⛔ defective` is fixed again or dropped): integrate per the integration procedure; residual → severity-tagged {{BACKLOG_FILE}} entry + one `Runner: human` smoke step the orchestrator authors into the batch file's Smoke section AFTER the merge, on the integration branch (next checkpoint page, or a re-issue of the passed one) | `⛔ (dropped)`; items → {{BACKLOG_FILE}}; its `⬜` dependents re-planned or dropped on the user's words, asked at the same STOP |
   | capped `-tip` repair | third round on the repair's own branch; `FIX FIRST` again → capped, marker re-written | trial-validate, then merge only if green (the open finding → {{BACKLOG_FILE}} + smoke step); trial red → no merge, stays capped, marker re-written, ask again | reviewed revert mini-batch `fix/<batch>-revert` of the offending merge; that batch → `⛔ (dropped)`, items → {{BACKLOG_FILE}} |
   | capped `-presmoke` repair | as above | the human step stands; residual → {{BACKLOG_FILE}} | as ship; the repair branch is deleted (the recorded drop is the authorization) |
   | `❌ (fix-up capped)` | third round on the fix-up's own branch; `SHIP` → row `❌` and the fix-up proceeds (dry run → merge → tip validation → 🧪 → re-issue); `FIX FIRST` again → capped, marker re-written | trial-validate, then merge only if green; indicted rows → 🧪; re-issue with the failing step annotated as a known residual ({{BACKLOG_FILE}}) | reviewed `fix/<batch>-revert` of the indicted batch's merge; that batch → `⛔ (dropped)`; the rest → 🧪 for the re-issue |
3. If any batch is `🧪`: a checkpoint is open — ask the user for its verdict (passed /
   failed / waive). Never open the next wave past an unanswered checkpoint.
4. Open the next wave: the earliest wave that still has `⬜` batches (or a recorded
   deferral) whose deps are all `🟢`/`✅`. From the integration tip: cut every member's branch, create every
   worktree (setup: {{WORKTREE_SETUP}}), then commit the wave-open PROGRESS flip
   (rows → 🔄, wave base SHA in the session log, `**State**: ACTIVE`).
   The cut is idempotent: a member branch that already exists with its tip equal to the
   current integration tip is adopted from a crashed open — its worktree, if any, removed
   and recreated (fresh setup); a member branch in any other state → STOP AND INVESTIGATE
   (name collision, or a stale base from an earlier crashed open — re-cut only on the
   user's word; never delete unasked).
5. Spawn ALL of the wave's implementers CONCURRENTLY (one per batch, in a single
   message, each pinned to its worktree, on the tier the batch's weight calls for).
   Every prompt must be SELF-CONTAINED: the spec text + codebase facts from the batch
   file, the exact file fence, acceptance criteria, the applicable guardrails, the
   validation commands (quiet form), the conventions + prohibitions blocks above, the
   report shape, and "tick your checklist items in the batch file as you complete them;
   run `git diff --name-status -M` against the integration branch before committing and
   revert anything outside your fence; commit on your batch branch (one commit per
   fold-in item)".
6. Gate PER BATCH, as each implementer reports (don't wait for the wave's slowest). A
   report without the status line + evidence block → resume the implementer for it (not
   a round).
   - **6a Fence check (mechanical, orchestrator).** Run the read-only helper above
     or its manual fallback. Worktree clean (`git status
     --porcelain` empty); `git diff --name-status -M {{INTEGRATION_BRANCH}}...HEAD`; every
     path (both endpoints of a rename) in the plan's fence ∪ recorded extensions ∪ the
     batch's own file — and within the batch file only ticks, `polish:` appends and a
     recorded Files change. Anything else → no reviewer; `NEEDS_FENCE` → §Fence changes,
     otherwise resume the implementer to revert. Not a round.
   - **6b Failing-on-base (mechanical, `fix` batches and repairs).** In a temporary
     worktree at the branch's base, run {{WORKTREE_SETUP}} there (skip only if `n/a`),
     then copy over the batch's TEST-ONLY files and run its changed tests: an
     assertion failure on the named behavior proves the regression test; every test
     PASSING on the base is a P0 (the fix is unproven); a setup failure or a run that
     cannot execute is inconclusive → reviewer duty (e).
   - **6c Reviewer + gate agents, in parallel, all fresh and read-only.** The reviewer
     gets the batch file + the diff (`git diff {{INTEGRATION_BRANCH}}...HEAD` in the batch's
     worktree — three-dot isolates the batch's own changes) and must (a) map every hunk
     to a batch item — unmapped hunks are scope creep → reject (the batch file's ticks are
     exempt); (b) check each acceptance criterion against the diff; (c) run the
     validation commands; (d) check the diff against {{GUARDRAILS_REF}} and the batch
     file's applicable guardrails; (e) confirm the failing-on-base result from 6b — an
     INCONCLUSIVE run means the reviewer establishes from the test text which changed
     cell fails on the un-fixed code, or says none does — and, when no gate agent runs,
     name the mutation each new or re-pointed test would survive; (f) confirm every doc/comment sweep the batch file names
     happened in the same commit. Gate agents run over the batch's new/changed tests
     (skipped when none changed); a gate finding that needs a production change is a P1,
     a test-only finding is an ASK. S-weight batches: one combined reviewer+gate pass.
   - **Verdicts** (each recorded in the row's Notes as `R<k> <verdict> @<sha>`, `asks=<n>`
     appended when a `SHIP` carries ASKs; the findings go to LOG.md under the row's
     heading). `SHIP` with ASKs → polish pass: resume the implementer with the ASK
     list; it appends `- [ ] polish: <ask>` items to its checklist, does them, commits;
     closes mechanically (6a + validations on the polished tip; polish commits touch only
     test/doc/prose paths — a production file touched → a fix-diff-only re-review by a
     fresh reviewer). Not a round.
     The scoped re-review's verdict is recorded like any other (`R<k> <verdict> @<sha>`,
     findings in LOG.md; an R-line after the `SHIP … asks=` line is polish-phase and never
     counts toward the cap — nor toward the SECOND-`FIX FIRST` rule below): its `SHIP` → the
     close completes; its `FIX FIRST` → resume the implementer to revert the offending
     production hunks or redo the polish within test/doc/prose (an ASK never licenses a
     production behavior change), then a fresh scoped re-review of the new diff; a SECOND
     polish-phase `FIX FIRST` discards the polish — write `polish discarded: @<sha>` (the
     pre-polish `SHIP` tip) into the row's Notes first (the marker §Recovery keys on; it is
     the recorded authorization), then ONE revert commit spanning `@<sha>..HEAD` (never a
     reset — no history rewriting; `git diff @<sha> HEAD` must come back empty), integrate
     that reviewed tree, unclosed ASKs → {{BACKLOG_FILE}} entries; polish never
     turns a batch `⛔`. `FIX FIRST` → resume the SAME implementer with the
     findings verbatim, then a fresh re-review that verifies the fixes and scans only the
     fix diff. `NEEDS A CLOSER LOOK` → run the confirming check the
     reviewer named (or have the implementer add the probe) → `FIX FIRST` or `SHIP`; not a
     round. Only `FIX FIRST` rounds count; the SECOND `FIX FIRST` sets `⛔ defective` (not
     green) or `⛔ green, residual finding open (<severity>)`, leaves the batch OUT of
     integration (dependents stay blocked), and — once the wave's other members are gated
     and integrated — STOPs instead of opening the next wave, quoting the open finding
     WITH its failure scenario and naming three verdicts for the user: fix again / ship with
     the residual / drop — meanings, recording and consumption per step 2's table.
7. Integrate serially, per the integration procedure: dry run → merge → tip validation →
   `🟢`, apply the version/changelog cadence, remove the worktree, write the row's Notes
   (SHA, reviewer arc, tier, residuals) ending with the metrics token
   `m: rounds=<n> asks=<n> fence-bounces=<n> gate=<findings/prod> tip-red=<0|1>`. A red
   tip → repair mini-batch before any further merge.
8. Wave closed. If the checkpoint table places a checkpoint here: per-checkpoint close-out (a ⛔
   member's steps are omitted from the page and appended on re-issue if it later ships) —
   version/changelog per cadence, tip validation, QA runner pre-smoke with evidence,
   covered rows `🟢` → `🧪`, checkpoint-table row, session-log row with the checkpoint's
   integration SHA, `**State**: AT-CHECKPOINT C<n>`, the checkpoint row's token
   `m: pre-smoke=<agent>/<human> human-smoke-min=<n> escaped=<n>` (completed when the
   user's verdict is recorded), the filled smoke page as `smoke-<Cn>.html` when a page
   was prepared, commit → STOP, delivering the checkpoint's COMBINED smoke script
   per §Smoke checkpoints. Otherwise: go to step 4 and open the next wave in this SAME
   session. Default cadence: run until the next checkpoint — stop early only at `⛔` or
   an unplanned user gate.

**Unplanned user gate**: if a batch surfaces a design/UX decision the plan didn't
settle, do not guess and do not stall silently — implement what is decidable, record
the EXACT question in the row's Notes (status `👤` if the batch cannot close without
it), and put the question in the STOP hand-off so the next session starts with the
answer. Known design gates belong at the FRONT of the plan (resolved at planning
time), never mid-sequence.

## Change-complete close-out (after the FINAL checkpoint passes and every batch is `✅` or `⛔ (dropped)`)

- **Convergence pass** — {{CONVERGENCE}}. When on: one read-only sub-agent reads the
  integration tip against every plan item (acceptance criteria + the full diff from the
  ledger's **Base** SHA in the PROGRESS preamble, ledger dir excluded) and classifies each `implemented / partial /
  contradicts / unrequested`; anything but `implemented` becomes a named {{BACKLOG_FILE}}
  entry or a convergence mini-batch the user is asked about. When off: the coverage audit
  is built from PROGRESS rows + git, and the hand-over says so.
- Final coverage audit in PROGRESS: every request item (fold-ins included) maps to a
  merged commit, an intended-behavior resolution, or a named entry in {{BACKLOG_FILE}} —
  zero unaccounted. Fold-ins are REMOVED from {{BACKLOG_FILE}} in the close-out commit
  (the ledger row and commit message carry provenance); a partially done fold-in is
  edited in place there with a pointer to this ledger; residuals added get ids in the
  {{BACKLOG_ID_PREFIX}} scheme.
- Distill: any NEW bug class this change uncovered → ONE-LINE guardrail bullet in
  {{GUARDRAILS_REF}} naming the class and pointing at the test or mechanism doc that
  enforces it (prefer adding the test in this close-out). Repo-wide rules stay in the
  always-loaded section; area-specific ones go to the area's doc. If the always-loaded
  section exceeds ~8 KB / ~120 lines, PROPOSE retirements (to a test, a linked doc, or a
  merge of bullets) for the user to accept — never delete on your own. Harvest in-run
  learnings from LOG.md.
- Release step (only on explicit user authorization): {{RELEASE_COMMAND}}
- Mark the change COMPLETE in the Session log and `**State**: COMPLETE`; propose deleting
  the merged branches and moving this ledger to `.agents/archive/` (`git mv`).
