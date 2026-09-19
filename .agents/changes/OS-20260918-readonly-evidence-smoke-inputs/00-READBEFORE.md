# READ BEFORE ANY BATCH — orchestration & recovery

**Change**: OS-20260918-readonly-evidence-smoke-inputs
**You are** either the ORCHESTRATOR (the main session the user told to "continue") or an
IMPLEMENTER/REVIEWER/GATE sub-agent given one batch. Neither of you has the planning
session's context. This file is the contract. Everything needed to drive this change lives
in this ledger directory (.agents/changes/OS-20260918-readonly-evidence-smoke-inputs) — assume no other context survives between
sessions.

## Boot sequence (orchestrator, every session)

1. Read [00-request.md](00-request.md) (the user's verbatim ask + decisions),
   [01-plan.md](01-plan.md) (locked scope, batch table, wave map + checkpoints), and
   [PROGRESS.md](PROGRESS.md), plus the project's always-loaded docs — especially
   the Repo conventions section in this contract (no separate guardrails file at scaffold time); every batch diff is checked against it. [LOG.md](LOG.md) is the
   narrative record: read it ON DEMAND by anchor (a Notes cell points at it), never at boot.
2. Run `git status --porcelain`, `git branch --list`, `git worktree list`; note the current
   branch. **Never switch the main checkout.** Read ledger files from any branch with
   `git show <branch>:./<path>` (the `./` is required — Git Bash on Windows mangles
   `branch:path` otherwise) and write to the ledger through an integration worktree
   (`git worktree add <scratchpad>/wt-int codex/readonly-evidence-smoke-inputs-ledger`), using the main checkout
   only if it already has `codex/readonly-evidence-smoke-inputs-ledger` checked out. Run `git show` from the
   repo or worktree ROOT (the `./` path is cwd-relative). Reuse an integration worktree
   that `git worktree list` already shows; if its directory is gone, `git worktree prune`
   first — never two worktrees on one branch. Run n/a in a newly created
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
  with the reviewer): a separate fresh read-only test hunter for every batch, including B02's validator/CLI verification code; full self-contained duties appear in the explicit run-validation amendment below. Implementers NEVER spawn a gate agent themselves —
  a self-spawned one stalls the implementer uncommitted.
- **QA runner** — one sub-agent that executes the agent-runnable smoke steps at a
  checkpoint close-out and writes evidence. Runners available in this repo:
  CLI, disposable Git repositories/bare local remotes, synthetic input directories, browser and screenshots. Use literal python, verified Python 3.10.6 with openpyxl 3.1.5 at C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe; mandatory environment/setup and Excel-validation commands appear below; only a human opens/modifies the workbook in Excel unless an actual spreadsheet runner is available. No extra runner restrictions.
- **Tiers**: all roles use the current inherited Codex model; every gate reviewer is fresh and independent. No model override. The reviewer never runs on a less capable model than the
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

## Git model (locked)

- Default branch (protected local ref): `refs/heads/main`. Integration branch: `codex/readonly-evidence-smoke-inputs-ledger` —
  every reviewed batch merges into it, and it is the ONLY branch that ever merges
  toward `refs/heads/main`.
- Shipment source: `local`. Shipment ref: `refs/heads/main` — the
  confirmed default branch on that source. `local` means a local merge counts;
  `remote <name>` means a merge on that remote counts. These are locked facts,
  distinct from permission to merge/push. Remote-tracking refs are cached evidence,
  never a substitute for the recorded source. Resolve shipment as described in
  §Recovery; do not re-detect these facts from the current checkout.
- One branch per batch, named in the batch file (branch prefixes in this repo:
  codex/), cut from the integration tip when the batch's wave opens.
  Wave members run CONCURRENTLY: one implementer per batch, each in an isolated git
  worktree under the session scratchpad (never inside the repo). Per-worktree setup:
  n/a. Same-wave fences were planned disjoint.
- **Merge/push policy**: the conductor merges reviewed batch branches into the integration branch with commits preserved. The user merges to local refs/heads/main and pushes. No conductor merge toward main or push without explicit later authorization
- **Execution model: Waved stack — W1: B01+B02; W2: B03. Checkpoint C1 after W2 (final)** — W1 has disjoint helper/test and input-data/attributes fences with no dependency; B02 effective attributes must leave every B01 path unchanged. B01 keeps its Git seam and fence consumer together. B03 depends on both and owns all shared docs, contract mirrors and visible page changes. Only W2 is hands-on, so C1 is the one final checkpoint. B03 is the final serialization point; a blocking review delays completion, and the second FIX FIRST stops the run with a third attempt requiring explicit user authorization
- Wave open = ONE PROGRESS commit on `codex/readonly-evidence-smoke-inputs-ledger` (member rows → `🔄`,
  branches named, wave base SHA in the session log, `**State**` line updated) — the crash
  marker §Recovery keys on. PROGRESS, LOG and `evidence/` are edited ONLY on the
  integration branch, by the orchestrator, through the integration worktree (the QA runner
  writes `evidence/` files there; the orchestrator commits them); implementers
  touch only their own batch file, on their own branch, and only its checklist ticks,
  appended `- [ ] polish:` lines, and its Files line under a recorded fence extension.
- **Integration procedure, per batch**: `git merge-tree --write-tree codex/readonly-evidence-smoke-inputs-ledger
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
  `codex/readonly-evidence-smoke-inputs-ledger`.
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

Run from the designated worktree root in PowerShell:

```powershell
$testFiles = @(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName)
if ($testFiles.Count -eq 0) { throw 'No Node test suites discovered' }
node --test --test-reporter=spec @testFiles
if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }
```

Capture output; report totals and failing names; read full output on failure.
B02 gates and C1 also require the literal python generation/semantic-validation
commands below, raw SHA256(generation A) = SHA256(generation B) = SHA256(committed
workbook file bytes), and fresh core.autocrlf=true checkout preservation of all
fixture/issued/archived input bytes. B03 verifies the real nested-suite discovery
command and byte-integrity behavior. Before B02 artifacts exist, baseline validation
runs the recursive Node/diff commands only; later mandatory Excel checks cannot be
waived by an alias/PATH/permission error. The complete procedures are baked below.
All must pass before a batch may integrate (`🟢`). Orchestrator runs use the QUIET form
above (a totals line plus failing test NAMES, so failing sets compare by name against any
allowlist); full output is read only on a non-zero exit. If the block above says `none`,
the checkpoint smoke tests carry ALL verification — state that explicitly when handing
over. Mutation runner (optional, scoped to a batch's changed files): none.

## Version + changelog rule (orchestrator-only)

- Version files (bump in lockstep): none
- Bump cadence: none — applied on the integration branch at
  integration or checkpoint close-out, never inside a wave worktree.
- **Whatever the cadence, the version MUST differ from the base branch's by the time
  a checkpoint script is handed over.** A version shared with the base makes the
  script's step 0 unable to tell the two apart, and a whole smoke run can execute
  against the wrong tree and report the un-fixed defects as failures. If the cadence
  above would leave them equal at a checkpoint, bump anyway and note it in PROGRESS. A
  checkpoint marker costs the PATCH component; the release takes ONE minor.
- Changelog: none

Implementer sub-agents NEVER touch version files, the changelog, PROGRESS or LOG. If all
three lines say `none`, skip version/changelog work at close-out and say so.

## Repo conventions (binding)

Keep the smoke page design unchanged except required input links and instructions. Preserve exact Recovery/verdict-table agreement after placeholder normalization. Keep template placeholders and registry consistent. Node tools run on Windows with shell-free argument arrays. Tests use disposable local repos, isolated configuration and synthetic files. The existing Markdown ledger remains the sole workflow record. No plan.json migration, production recovery engine or unrelated redesign.

## Hard prohibitions

- No scope creep: modify ONLY the files in your batch file's fence. Anything else you
  notice goes in a PROGRESS Notes entry (orchestrator) or your final report (sub-agent) —
  never in the diff. Need a file outside the fence? Report `NEEDS_FENCE` (§Fence changes).
- Implementers never edit their batch file beyond checklist ticks, appended
  `- [ ] polish:` lines, and the Files line under a recorded extension; never spawn gate
  agents; never leave untracked files in the worktree (reconcile reads that as dirt —
  scratch goes under the session scratchpad).
- No `--no-verify`, no force-push, no history rewriting.
- Never commit to `refs/heads/main`, never push, never merge toward `refs/heads/main` —
  except as the merge/push policy above allows or the user explicitly authorizes in the
  current session. (Merging reviewed batch branches into `codex/readonly-evidence-smoke-inputs-ledger` is
  the orchestrator's normal job.)
- Do not rewrite this ledger contract or plan from the edited skill. Do not change unrelated historical backlog entries. Keep issued synthetic inputs immutable and test modifications in disposable working copies.

## Smoke checkpoints

The user smoke-tests at the CHECKPOINTS in the checkpoint table (the plan's wave map,
as moved by any recorded deferral) — never per batch.
Intermediate checkpoints exist only after waves carrying hands-on batches (marked in
the batch table); the final checkpoint is mandatory and covers everything since the
last one. At a checkpoint the orchestrator assembles ONE combined script — every
covered batch's smoke steps, data-touching sections first, then the rest of the
hands-on work, steps numbered continuously. How the user smoke-tests in this project:
Run automated Node/CLI/browser QA first, then issue one final interactive smoke page with the actual Excel workbook and all required reproducible inputs, independently validated and linked per step with expected results and working-copy/reset instructions. Human steps open the workbook and inspect usable delivery/reissue behavior. User reported no additional restrictions or gotchas. Exact branch plus full tested SHA and an input-integrity behavioral canary identify the build because this repo has no version files.. A reached checkpoint is never skipped and never resolved without
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
bugs-2026-09-17.md entry — never a failure, never blocks the pass). The user's message
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

- `local`: `git rev-parse --verify refs/heads/main^{commit}`. This needs no remote;
  an unpushed local merge counts under this policy.
- `remote <name>`: read `git ls-remote --exit-code <name> refs/heads/main` now and
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
git merge-base --is-ancestor <branch> codex/readonly-evidence-smoke-inputs-ledger && echo INTEGRATED
git merge-base --is-ancestor <integration-sha> <shipment-sha>          # only after source resolution above
git log codex/readonly-evidence-smoke-inputs-ledger..<branch> --oneline                     # commits ahead
git worktree list && git status --porcelain                            # dirt (check each wave worktree)
git show <branch>:./.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/02-batches-NN-<slug>.md             # checklist state (keep the ./; run from the root)
```

Rows are matched top to bottom; the first match wins.

| Ledger says | Git shows | Verdict |
|---|---|---|
| any row whose Notes end in a spent *fix again* (`third round on <branch> @<sha>`) | no commit after `@<sha>`, branch not yet an ancestor of `codex/readonly-evidence-smoke-inputs-ledger` | Crashed before the third round landed → re-spawn the FRESH strong-tier implementer per step 2's table |
| any row whose Notes end in a spent *fix again* | commits after `@<sha>`, branch not yet an ancestor of `codex/readonly-evidence-smoke-inputs-ledger` | Third round landed → worktree dirty: re-spawn the FRESH strong-tier implementer at the open findings; clean: fence check, then the fresh re-review with both rounds' findings |
| any row whose Notes carry a `… capped:` marker not followed by a later `verdict … spent` (a marker re-written after a spent line counts as awaiting) | any | Awaiting the user's verdict on that repair (fix again / ship with the residual / drop; ship / drop only after a spent *fix again*) — do not re-gate, do not re-spawn; a recorded verdict is consumed by step 2 |
| any row whose Notes carry a `… repair pending:` marker (`tip repair pending:` / `pre-smoke repair pending:`) with no later spent *ship* / *drop* verdict (those retire it unmerged) | any | In-flight repair — branch missing: spawn it on the named branch; no commit after the marker's `@<sha>`: never started → resume the implementer on that branch (fresh worktree); commits after `@<sha>` but not integrated: resume / gate it per the 🔄 rows on that branch (never a same-named new one); integrated: tip validation (a pre-smoke repair also re-runs its step), remove the marker, then continue per step 2 (tip: back to step 7 or 4; pre-smoke: resume the close-out) |
| 🔄, Notes carry `polish discarded: @<sha>` | branch not an ancestor of `codex/readonly-evidence-smoke-inputs-ledger` | Discard in flight → branch tree differs from `@<sha>`: finish the revert (ONE commit spanning `@<sha>..HEAD`; never a reset); tree identical (`git diff @<sha> <tip>` empty): integrate now (dry run → merge → tip validation); the marker stays as the record |
| 🔄 | Notes record `R<k> SHIP @<sha>` (no `asks=` on that line) for the current tip | Reviewed, crashed before the merge → integrate now, no re-review |
| 🔄 | Notes record `R<k> SHIP @<sha> asks=<n>` for the current tip, worktree clean | Shipped with ASKs, crashed before the polish → polish pass (ASK list in LOG.md), then its mechanical close |
| 🔄 | Notes record `R<k> SHIP @<sha> asks=<n>`, commits after `@<sha>`, worktree clean, every `polish:` item ticked (at least one appended) | Polish landed, crashed before its close → 6a + validations on the tip; `git diff --name-only <sha>..HEAD` touches only test/doc/prose paths → integrate; a production file → fix-diff-only re-review by a fresh reviewer |
| 🔄 | Notes end in `R<k> FIX FIRST @<sha>` for the current tip | Round in flight, fix not landed → resume the implementer (fresh) with that round's findings from LOG.md; not a round |
| 🔄 | branch missing, or no commits past the wave base | Implementer never landed → re-spawn it (fresh worktree) |
| 🔄 | dirty worktree, or commits ahead + partial checklist (incl. unticked `polish:` items; a recorded deferral is not a partial checklist) | Resume the implementer — a fresh agent, the original is gone — at the first unticked item (recreate the worktree if gone; a `SHIP … asks=` line with no `polish:` items yet → the ASK list in LOG.md) |
| 🔄 | commits ahead, checklist fully ticked | validations green → crashed before the gate → fence check, then the reviewer gate now (latest `R<k>` line is `FIX FIRST @<sha>` → the round-<k+1> re-review, recorded `R<k+1>`: verifies that round's findings from LOG.md, scans `git diff <sha>..HEAD`); red → resume the implementer (fresh) with the failing output, not a round |
| 🔄 | branch already an ancestor of `codex/readonly-evidence-smoke-inputs-ledger` | Crashed between merge and flip → tip validation, then 🟢 (red → repair mini-batch) |
| 🟢 (every member of a checkpoint-carrying wave is 🟢, ⛔ or 👤 — verdict or not) | checkpoint row not 🧪/✅ | Close-out unfinished → integrate any 🟢 member whose branch is not yet an ancestor of `codex/readonly-evidence-smoke-inputs-ledger` (dry run → merge → tip validation), then finish the close-out (tip validation → pre-smoke → page → 🧪); never open the next wave |
| 🟢 | branch NOT an ancestor of `codex/readonly-evidence-smoke-inputs-ledger` | Crashed between review and merge → integrate now (dry run → merge → tip validation) |
| 🟢 | branch ancestor of `codex/readonly-evidence-smoke-inputs-ledger` | Correct state — waits for its covering checkpoint |
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
     ledger's per-worktree setup there (n/a; skip only if `n/a`), then
     run the validations and remove the worktree; green → merge for real; red → no
     merge. A setup failure blocks the trial and the merge as an environment problem,
     not a red validation result; resolve setup and retry the trial before deciding
     whether to merge.

   | Subject | fix again | ship with the residual | drop |
   |---|---|---|---|
   | `⛔` batch | authorized third round: a FRESH implementer on the strong tier, on the batch branch (row → 🔄), both rounds' findings + the current diff, then a fresh re-review; `FIX FIRST` again → `⛔` (kind per step 6; the recorded `R<k> FIX FIRST` line now ends the Notes) | only for `⛔ green, residual finding open` (a `⛔ defective` is fixed again or dropped): integrate per the integration procedure; residual → severity-tagged bugs-2026-09-17.md entry + one `Runner: human` smoke step the orchestrator authors into the batch file's Smoke section AFTER the merge, on the integration branch (next checkpoint page, or a re-issue of the passed one) | `⛔ (dropped)`; items → bugs-2026-09-17.md; its `⬜` dependents re-planned or dropped on the user's words, asked at the same STOP |
   | capped `-tip` repair | third round on the repair's own branch; `FIX FIRST` again → capped, marker re-written | trial-validate, then merge only if green (the open finding → bugs-2026-09-17.md + smoke step); trial red → no merge, stays capped, marker re-written, ask again | reviewed revert mini-batch `fix/<batch>-revert` of the offending merge; that batch → `⛔ (dropped)`, items → bugs-2026-09-17.md |
   | capped `-presmoke` repair | as above | the human step stands; residual → bugs-2026-09-17.md | as ship; the repair branch is deleted (the recorded drop is the authorization) |
   | `❌ (fix-up capped)` | third round on the fix-up's own branch; `SHIP` → row `❌` and the fix-up proceeds (dry run → merge → tip validation → 🧪 → re-issue); `FIX FIRST` again → capped, marker re-written | trial-validate, then merge only if green; indicted rows → 🧪; re-issue with the failing step annotated as a known residual (bugs-2026-09-17.md) | reviewed `fix/<batch>-revert` of the indicted batch's merge; that batch → `⛔ (dropped)`; the rest → 🧪 for the re-issue |
3. If any batch is `🧪`: a checkpoint is open — ask the user for its verdict (passed /
   failed / waive). Never open the next wave past an unanswered checkpoint.
4. Open the next wave: the earliest wave that still has `⬜` batches (or a recorded
   deferral) whose deps are all `🟢`/`✅`. From the integration tip: cut every member's branch, create every
   worktree (setup: n/a), then commit the wave-open PROGRESS flip
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
   - **6a Fence check (mechanical, orchestrator).** Worktree clean (`git status
     --porcelain` empty); `git diff --name-status -M codex/readonly-evidence-smoke-inputs-ledger...HEAD`; every
     path (both endpoints of a rename) in the plan's fence ∪ recorded extensions ∪ the
     batch's own file — and within the batch file only ticks, `polish:` appends and a
     recorded Files change. Anything else → no reviewer; `NEEDS_FENCE` → §Fence changes,
     otherwise resume the implementer to revert. Not a round.
   - **6b Failing-on-base (mechanical, `fix` batches and repairs).** In a temporary
     worktree at the branch's base, run n/a there (skip only if `n/a`),
     then copy over the batch's TEST-ONLY files and run its changed tests: an
     assertion failure on the named behavior proves the regression test; every test
     PASSING on the base is a P0 (the fix is unproven); a setup failure or a run that
     cannot execute is inconclusive → reviewer duty (e).
   - **6c Reviewer + gate agents, in parallel, all fresh and read-only.** The reviewer
     gets the batch file + the diff (`git diff codex/readonly-evidence-smoke-inputs-ledger...HEAD` in the batch's
     worktree — three-dot isolates the batch's own changes) and must (a) map every hunk
     to a batch item — unmapped hunks are scope creep → reject (the batch file's ticks are
     exempt); (b) check each acceptance criterion against the diff; (c) run the
     validation commands; (d) check the diff against the Repo conventions section in this contract (no separate guardrails file at scaffold time) and the batch
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
     that reviewed tree, unclosed ASKs → bugs-2026-09-17.md entries; polish never
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

- **Convergence pass** — off — coverage audit from PROGRESS rows and Git. When on: one read-only sub-agent reads the
  integration tip against every plan item (acceptance criteria + the full diff from the
  ledger's **Base** SHA in the PROGRESS preamble, ledger dir excluded) and classifies each `implemented / partial /
  contradicts / unrequested`; anything but `implemented` becomes a named bugs-2026-09-17.md
  entry or a convergence mini-batch the user is asked about. When off: the coverage audit
  is built from PROGRESS rows + git, and the hand-over says so.
- Final coverage audit in PROGRESS: every request item (fold-ins included) maps to a
  merged commit, an intended-behavior resolution, or a named entry in bugs-2026-09-17.md —
  zero unaccounted. Fold-ins are REMOVED from bugs-2026-09-17.md in the close-out commit
  (the ledger row and commit message carry provenance); a partially done fold-in is
  edited in place there with a pointer to this ledger; residuals added get ids in the
  OS-BL- scheme.
- Distill: any NEW bug class this change uncovered → ONE-LINE guardrail bullet in
  the Repo conventions section in this contract (no separate guardrails file at scaffold time) naming the class and pointing at the test or mechanism doc that
  enforces it (prefer adding the test in this close-out). Repo-wide rules stay in the
  always-loaded section; area-specific ones go to the area's doc. If the always-loaded
  section exceeds ~8 KB / ~120 lines, PROPOSE retirements (to a test, a linked doc, or a
  merge of bullets) for the user to accept — never delete on your own. Harvest in-run
  learnings from LOG.md.
- Release step (only on explicit user authorization): none
- Mark the change COMPLETE in the Session log and `**State**: COMPLETE`; propose deleting
  the merged branches and moving this ledger to `.agents/archive/` (`git mv`).

## Frozen starting protocol and this run's explicit terms

Starting repository commit: f918fe39762c70edb9a3424e54eaa208fd7c5727. The full
contract above is instantiated from that version, before implementation. This
contract, the approved request, plan and recorded explicit user decisions govern
this ledger. Changed skill files and templates do not change it. The source Git
blob IDs below are provenance only, not live instructions to load.

The repo has no version/changelog files: skip version work and use exact tested
Git SHA plus a behavioral canary in Step 0. Use the input-integrity canary defined
in the plan. This explicit no-version choice applies to generic version wording
above. User shipment is local refs/heads/main; only the user merges to main/pushes.

The initial requested input-file terms apply to THIS run: the conductor inventories
and generates reproducible inputs, independently validates their requirements,
preserves and delivers the actual files beside the page, links exact inputs in each
relevant step with expected results, and provides working-copy/reset commands.
Use synthetic data. If a dependency requires private data, credentials or external
access, name the exact prerequisite. Never ask for manual file construction unless
it is the tested behavior. Keep issued originals under evidence/C1/inputs/issue-NNN/
and preserve validation evidence. Changed inputs get new paths and affected step
revision increases so old verdicts/evidence cannot silently apply to new bytes.

The existing MANUAL fence gate applies to B01, B02, B03 and all repair/polish gates
throughout this ledger. The conductor records independent Git/blob evidence before
each existing batch/repair reviewer gate dispatches a fresh reviewer and separate
fresh read-only test hunter in parallel. Ordinary polish remains mechanical-only;
production-touching polish retains the frozen scoped re-review, with hunter checks
limited to changed verification code within that scope.
The new checker remains a tested deliverable; no automatic adoption as this ledger's
gate occurs after B01 merges. Current skill changes affect future generated contracts.
No tool creates authority, chooses ledger states or replaces semantic review. This
choice and the enabled test hunter are explicit user-approved planning amendments,
recorded verbatim in 00-request.md; they do not come from edited skill templates.
Role dispatch uses Codex sub-agent tools for independent pre-flight, isolated
implementers, fresh read-only gate reviewers, and checkpoint QA. The conductor owns
ledger state and all user communication. The new-mode scaffold ends with a STOP;
wave 1 starts only on the user's start instruction. This contract remains unchanged
through the self-improvement implementation unless the user explicitly amends it.

## Frozen discovery rules
1. Find ledgers in the WORKING TREE: glob `**/PROGRESS.md` rooted at
   `<repo>/.agents/changes/` — dot-dirs often escape repo-root globs, so root the search
   INSIDE the directory; if that still returns nothing, list the directory directly. A
   repo may park closed ledgers in a sibling archive dir (e.g. `.agents/archive/`) OUTSIDE
   this root — that is the point of it; never widen the glob to sweep them back in. An
   empty ledger directory is ignored.
2. Find ledgers that exist only on BRANCHES — scaffold commits live on the integration
   branch, never on the default branch, so a checkout on `main` may show none of the
   active work. Enumerate ALL local and remote-tracking branches with
   `git for-each-ref --format='%(refname) %(symref)' refs/heads/ refs/remotes/`.
   Skip ONLY symbolic refs (a nonempty `symref`, e.g. `refs/remotes/origin/HEAD`). For
   EVERY remaining ref, run `git ls-tree -r --name-only <ref> -- .agents/changes/` and find
   its `PROGRESS.md` files. Branch names never gate this probe: conventional
   `chore/<slug>-ledger`, shallow `foo-ledger`, and custom names are all candidates,
   even when another branch has already yielded a ledger. Skip ids under
   `.agents/archive/`. Use full refs for Git reads to avoid local/remote name collisions.
   There is no default-branch or ancestry pre-filter: even a merged ref can carry an
   unfinished ledger. Group copies of the same ledger id across the checkout and refs;
   list their branch locations together, not as separate active changes. Read only
   each candidate's contract fields needed for ownership and merge targets (legacy
   equivalents per this contract).
   Read branch files with `git show <ref>:./<path>` (keep the `./`; run from the repo
   root). Compare LEDGER versions, not whole branch tips: obtain the last ledger-changing
   commit with `git log -1 --format=%H <ref> -- .agents/changes/<id>/`. Its ledger-subtree
   tree id must equal the candidate ref's tree id at that path (use `git rev-parse
   <ref>:./.agents/changes/<id>` for each). That commit being an ancestor of the
   owning integration tip or resolved shipment target proves the committed copy is
   older there; unrelated later branch commits do not invalidate that proof. Unknown
   provenance, newer/conflicting ledger commits, or uncommitted ledger edits in an
   associated worktree remain visible, never silently superseded.
   Resolve ownership first: use the declared integration branch's current contract.
   A recorded target correction there supersedes proven older ledger copies; their
   old target values do not create a new ambiguity. Unresolved ownership or target
   conflicts, divergent local/remote integration refs, or conflicting working-tree
   ledger edits are AMBIGUOUS.
   Resolve the owning contract's shipment target per its §Recovery, then inspect only
   this candidate's id there: an explicit COMPLETE marker in `.agents/changes/<id>/`
   or its presence in `.agents/archive/<id>/` supersedes proven older ledger copies.
   If the integration branch was deleted, use the candidate's recorded target for
   this check; a missing owner alone cannot resurrect a proven completed/archive copy.
   Ancestry alone never establishes COMPLETE or archived. Missing target evidence
   leaves the candidate visible; it cannot justify dropping it or inferring shipment.
   Reconcile active work only under its owning contract.
   Report branch-only ledgers with their classified state and "on <branch>; checkout
   is on <current>".
   Never switch the main checkout and never copy ledger files into another branch's tree.
3. Classify by GREP, never by reading the file. First the preamble's `**State**:` line
   (`ACTIVE | AT-CHECKPOINT C<n> | USER-BLOCKED | COMPLETE`); ledgers without one (older
   scaffolds) are classified from their BATCHES-TABLE rows plus the Session log — never
   from the Legend line or log prose (both quote every emoji). A closed ledger's log
   runs to tens of thousands of characters; read the BODY of at most the ONE ledger you
   are about to act on.
   - **COMPLETE**: State says so, or the Session log (or verdict log) carries an explicit
     change-COMPLETE marker — even if advisory `👤` rows remain (surface those as
     reminders).
   - **ACTIVE**: State ACTIVE / AT-CHECKPOINT, or any batch row ⬜ 🔄 🟢 🧪 ❌ ⛔ with no
     COMPLETE marker.
   - **USER-BLOCKED**: only `👤` rows remain open — report what the user must do;
     there is nothing for the orchestrator.
   - **AMBIGUOUS** → ask.
4. COMPLETE ledgers are NEVER resumed. If the user says "continue" and nothing is
   active: reconcile, report completion, point at the backlog. Do not fabricate a batch.
5. Multiple ACTIVE ledgers → list them one line each; the user picks.
6. Legacy ledgers (older file names / status vocabularies / per-batch smoke gates / no
   State line) are driven under their OWN contract — see the frozen legacy ledger
   recognition. Never rewrite one, never add the new gates to one.


## Starting source provenance

- orchestrate/SKILL.md: 7f02f9a078be5851e800a1426de5b40767adad08
- orchestrate/references/protocol.md: 39b97b338f00c12a6f7bc046d2a478dbf51ec4e4
- orchestrate/references/scaffolding.md: 5414b5718fd8e5e76dd216707585d29511f921c9
- orchestrate/references/execution-models.md: 370c58a008df36002ace5869b576fa020d34bb5d
- orchestrate/references/subagent-prompts.md: 7a480a604e1e85eb405e0804d15e5ba8836b2ced
- orchestrate/references/smoke-page.md: d1087e328ee138f38e77f17b2051be1c1660d36a
- orchestrate/templates/00-READBEFORE.md: a8e97f8519d3796d8214b737035e92ebad6adb8b

## Legacy ledger recognition (interop)

Ledgers created before this skill (or before the waved stack) vary in shape.
Recognition rules:

| Variant | How to recognize | How to drive |
|---|---|---|
| Pre-2026-09-17 waved scaffold | Has checkpoints and 🟢 but no `**State**` line, no LOG.md, no runner tags, "two rounds then ⛔" without ASK | Drive as written under its own contract; classify by rows; do not add the new gates |
| Contract under another name | `02-batches-00-READBEFORE.md` or `03-tasks-00-READBEFORE.md` | Same contract — follow it as-is |
| Contract absent | Only `01-plan.md` + `PROGRESS.md` (± request file) | Protocol lives in the plan's orchestration section + the PROGRESS preamble; this file fills gaps; ASK before acting on anything ambiguous |
| Per-batch smoke scaffolds | Contract has no checkpoints or 🟢 status; every batch ends 🧪; model named strict sequential / linear stack / stacked waves | Earlier skill versions: drive as written — smoke and merge each batch under its own algorithm |
| Task model (oldest) | `03-tasks-NN-*` files; statuses `✅ Completed` / `🔴 Incomplete` | Map ✅→✅ and 🔴→ask (❌ or ⛔?); tasks may share a single feature branch — check git |
| Spec/plan split | `01-specification.md` + `02-plan.md` | Specification = locked scope; plan = batch table |

Never rewrite a legacy ledger into the new format — drive it under its own conventions.

## Degraded environments

- **No sub-agents available**: the orchestrator implements a wave's batches one at a
  time in the main checkout (worktrees unnecessary). The reviewer gate still runs per
  batch — a separate adversarial pass over each finished diff, with the same
  hunk-mapping duty, before integration. Checkpoint placement is unchanged.
- **No gate agents named**: the reviewer alone carries duties (a)–(f).
- **No runners** (or the environment forbids running the app): every smoke step is
  human; no pre-smoke, no `evidence/`; the hand-over says so.
- **No validation commands**: legal (contract says `none`); the checkpoint smoke tests
  carry all verification and every hand-over message must say so.
- **No publishing tools**: deliver the committed smoke HTML through the runtime's
  usable preview/file hand-over. Without usable HTML delivery or a page/template,
  print the full checkpoint script — gate first, then each step's Do/Pass in the same
  section order, pre-verified steps marked in text. The batch files' smoke steps stay
  canonical; lack of a publisher or cloud verdict store never blocks the checkpoint.


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
