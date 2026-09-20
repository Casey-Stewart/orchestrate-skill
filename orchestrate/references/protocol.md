# The ledger protocol — canonical reference

This is the skill's own copy of the orchestration contract. **Precedence rule: a
ledger's own contract file always outranks this document.** Use this file to (a) drive a
legacy ledger that predates the skill and lacks a contract file, and (b) keep the
templates honest — where a section exists in both files they carry the same rules,
identical after placeholder substitution (§Recovery and the verdict tables word for
word); each file also carries sections the other does not.

## What a ledger is

One directory per change: `.agents/changes/<ID>/`, where `<ID> = <PREFIX>-YYYYMMDD-<slug>`
(e.g. `IST-20260713-ux-fix-pack`). The directory is committed to the repo on purpose — it
is the audit trail of an AI-assisted change. Standard files for new ledgers, including
checkpoint artifacts created later rather than at scaffold time:

| File | Purpose |
|---|---|
| `00-request.md` | The user's verbatim ask + clarifying decisions (incl. accepted backlog fold-ins) + item→batch map |
| `00-READBEFORE.md` | The contract: boot sequence, roles/gates/tiers, git model, fence changes, checkpoints, validations, recovery, session algorithm |
| `01-plan.md` | Locked scope: batch table (weight, wave, fence, smoke, version), wave map + checkpoints, pre-flight verdict, per-batch specs, coverage audit |
| `02-batches-NN-<slug>.md` | One per batch: wave, weight, fence, applicable guardrails, verbatim spec, checklist, acceptance criteria, tagged smoke steps |
| `PROGRESS.md` | The live ledger: `**State**` line, status + checkpoint tables, verdict log, coverage audit, one-line session log |
| `LOG.md` | Append-only narrative (reviewer arcs, root causes, reconciliations, in-run learnings), anchored per session/batch; read on demand, never at boot |
| `evidence/C<n>/` | Created during checkpoint QA, starting at the first checkpoint; QA-runner evidence per pre-verified smoke step (command, exit, output tail / screenshot path, integration SHA, environment) |
| `smoke-<Cn>.html` | Created at each checkpoint close-out; the combined checkpoint script as handed over — committed source of the smoke page |

A scaffolded ledger is a **closed system**: every repo-specific fact (validation
commands, version files, merge policy, wave map, checkpoint placement, smoke procedure,
gate agents, runners, tiers) is baked into its READBEFORE and plan at scaffold time. A
session without this skill can drive the change by reading the ledger alone — that
property is the point; never generate a ledger that references this skill. Closed
ledgers may be parked in a sibling `.agents/archive/` directory; discovery never globs it.

## Roles, gates, tiers

- **Orchestrator** — the main session. Owns PROGRESS, LOG, `evidence/`, branches,
  worktrees, integration merges, close-outs, and all user communication. The ONLY role
  that edits version files, the changelog, PROGRESS or LOG. Never switches the main
  checkout: reads any branch with `git show <branch>:./<path>` (keep the `./` — Git Bash
  on Windows mangles `branch:path`; run it from the repo or worktree root), writes through
  an integration worktree under the session scratchpad — reusing one `git worktree list`
  already shows, pruning first if its directory is gone.
- **Implementer** — a sub-agent given one batch. Codes inside the file fence in the
  batch's isolated worktree, ticks the batch checklist, commits on the batch branch (one
  commit per fold-in item). Wave siblings run concurrently. Reports in the fixed shape:
  line 1 `DONE | DONE_WITH_CONCERNS | NEEDS_FENCE | BLOCKED`; an evidence block (each
  validation command, exit code, last ~10 lines; SHAs; checklist n/m); ≤40 lines of
  prose. `NEEDS_FENCE` / `BLOCKED` use Expected / Found / Why it matters / How to proceed.
- **Reviewer** — ONE fresh read-only sub-agent per batch per round, never the
  implementer, never reused. Maps every hunk to a batch item (unmapped = scope creep =
  reject; the batch file's ticks are exempt), verifies acceptance criteria, runs
  validations, checks guardrails, confirms failing-on-base cells and doc sweeps. Line-1
  verdict: `SHIP` (no P0/P1; may carry ASKs) / `FIX FIRST` (P0 or P1 with a concrete
  failure scenario) / `NEEDS A CLOSER LOOK` (names what would confirm it).
- **Gate agents** — optional read-only agents the contract names (e.g. a test hunter
  asking "what production mutation keeps this test green?"), run by the ORCHESTRATOR in
  parallel with the reviewer over the batch's new/changed tests. Implementers never
  spawn them. A gate finding needing a production change is a P1; test-only → ASK.
- **QA runner** — one sub-agent executing the agent-runnable smoke steps at a checkpoint
  close-out, writing `evidence/C<n>/`.
- **Plan pre-flight** (scaffold time) and **convergence** (change-complete) — one fresh
  read-only sub-agent each; see `scaffolding.md` and §Two close-outs.
- **Tiers** — the contract words them model-agnostically: the reviewer never runs on a
  less capable model than the implementer; L-weight reviews and the fresh implementer of
  an authorized third round use the most capable model the session can spawn (the
  "strong tier"); tiers unavailable →
  default, gate shape unchanged. Reconcile, status and discovery stay in-session over raw
  git output — never delegated to a cheaper model.

Neither sub-agent role has the planning session's context — every prompt is built from
the ledger files and complete in itself. Every report entering the orchestrator's
context is capped (~40 lines + findings); the fence check and tip validation return one
line each on success.

**Metrics** (the pilot's measurement, readable from the ledger alone). Batch row Notes
end with `m: rounds=<FIX FIRST rounds> asks=<ASK items closed by a polish pass>
fence-bounces=<times the fence check sent the implementer back> gate=<gate-agent
findings>/<of which needed a production change> tip-red=<1 if tip validation went red
after this merge>`; each checkpoint row's Verdict cell ends with `m: pre-smoke=<agent
steps passed>/<human steps> human-smoke-min=<minutes the user reports> escaped=<defects
the user found that no gate caught>`, completed when the user's final verdict on that
checkpoint is recorded (`escaped` counts every fail across re-runs).

## Severity and round accounting

- **P0** — wrong behavior / violated criterion or guardrail, concrete scenario. Blocking.
- **P1** — should fix, concrete scenario, needs a production change. Blocking.
- **ASK** — in-fence, about the batch's OWN artifacts (its new tests' strength, smoke-step
  prose, comments, a doc sweep it owns), no production behavior change. Rides under
  `SHIP` as a list. Polish pass: resume the same implementer; it appends `- [ ] polish:`
  items to its checklist, does them, commits; closes mechanically (fence check +
  validations; polish commits touch only test/doc/prose paths — a production file touched
  → fix-diff-only re-review by a fresh reviewer). Never a round.
  The scoped re-review's verdict is recorded like any other (`R<k> <verdict> @<sha>`,
  findings in LOG.md; an R-line after the `SHIP … asks=` line is polish-phase and never
  counts toward the cap). `SHIP` → the close completes. `FIX FIRST` → resume the
  implementer to revert the offending production hunks or redo the polish within
  test/doc/prose (an ASK never licenses a production behavior change), then a fresh scoped
  re-review of the new diff. A SECOND polish-phase `FIX FIRST` discards the polish: write
  `polish discarded: @<sha>` (the pre-polish `SHIP` tip) into the row's Notes first — the
  marker §Recovery keys on, and the recorded authorization — then ONE revert commit
  spanning `@<sha>..HEAD` (never a reset — no history rewriting, the R-lines' SHAs stay
  reachable; `git diff @<sha> HEAD` must come back empty), integrate that reviewed tree,
  unclosed ASKs → backlog entries. Polish never turns a batch `⛔`.
- Only `FIX FIRST` rounds count toward the cap of two. Fence bounces, evidence resubmits,
  polish passes, scoped re-reviews and `NEEDS A CLOSER LOOK` checks never do — nor does a
  `FIX FIRST` a scoped re-review returns: its bound is the polish-discard rule above, not
  the cap.
- Round 1: resume the SAME implementer with the findings verbatim; a fresh re-review
  verifies the fixes and scans only the fix diff. Reviewers are fresh every round. An
  agent gone after a crash → fresh, at the first unticked item.
- The SECOND `FIX FIRST`: `⛔ defective` (finding open, not green) or `⛔ green, residual
  finding open (<severity>)`. Both stay out of integration; once the wave's other members
  are gated and integrated the session stops instead of opening the next wave, quotes the
  open finding WITH its failure scenario, and names three verdicts for the
  user: fix again / ship with the residual / drop (a green suite alone is weak grounds
  for shipping) — meanings, recording and consumption per step 2's table.

## Status legend

| Status | Meaning |
|---|---|
| ⬜ Not Started | No commits on its branch |
| 🔄 In Progress | Wave opened (branch cut, row flipped), implementation ongoing |
| 🟢 Integrated | Reviewed, validations green on the worktree AND the integration tip, merged; awaiting its covering checkpoint |
| 🧪 At Checkpoint | A planned checkpoint is reached — awaiting the USER's combined smoke verdict |
| ❌ Smoke Failed | The USER reported a checkpoint failure triaged to this batch — the fix-up mini-batch is the next session's FIRST job. Never written for an agent-found failure |
| ✅ Passed | Its checkpoint passed; merged toward the default branch per the merge policy (verify with git, not the table) |
| ⛔ Blocked | Reviewer rejected twice (`defective`, or `green, residual finding open`), or an external blocker — left out of integration; needs the user's verdict. `⛔ (dropped)` = the user dropped it; its items live in the backlog |
| ❌ (fix-up capped) | A checkpoint fix-up failed review twice — left unmerged; needs the user's verdict |
| 👤 User Action | Waiting on something only the user can do (credentials, hardware, approvals) |

PROGRESS also carries `**State**: ACTIVE | AT-CHECKPOINT C<n> | USER-BLOCKED | COMPLETE`,
updated at every wave open, checkpoint close-out and change-complete. Statuses are
claims; **git is truth**. Reconcile before believing any row.

### Read-only evidence tools

The ledger's captured contract is authority. Changed skill files or templates do not
rewrite existing ledgers or silently add new gates. Tools collect facts; the conductor
still resolves ownership/target ambiguity and makes every Recovery decision.

Run these Node commands with explicit arguments from the repository root. At scaffold
time bake the resolved helper paths into this contract; if unavailable or unsupported,
use the self-contained manual fallback below. Neither helper writes evidence files;
the conductor may capture stdout with the command, exit and captured SHAs.

```text
node orchestrate/tools/git-evidence.mjs discovery --repo <repo>
node orchestrate/tools/git-evidence.mjs worktrees --repo <repo>
node orchestrate/tools/git-evidence.mjs ancestry --repo <repo> --ancestor <ref-or-sha> --descendant <ref-or-sha>
node orchestrate/tools/git-evidence.mjs shipment --repo <repo> --integration <full-ref> --source local --ref <full-shipment-ref>
node orchestrate/tools/git-evidence.mjs shipment --repo <repo> --integration <full-ref> --source remote --remote <name> --ref <full-shipment-ref>
node orchestrate/tools/git-evidence.mjs ledger --repo <repo> --ref <full-ref> --ledger <id> --owner <ref-or-sha> --target <ref-or-sha>
node orchestrate/tools/check-fence.mjs --repo <repo> --integration <full-ref> --batch <full-ref> --ledger <id> --batch-id <Bnn> --batch-file <repo-relative-path>
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
endpoints. Before status, run git check-attr filter on the paths status inspects:
a path resolving to a set filter, or a submodule, makes safe cleanliness unknown;
unspecified, unset and mere configuration do not. Never execute such filter drivers to
obtain a clean result. For the manual fence, use git diff --name-status -z -M
integration-sha...batch-sha, inspect both rename endpoints against the committed plan
union recorded extensions union own batch file; inspect that file's blob diff for
only the permitted ticks/polish/authorized Files edits. Cleanliness and parse failures
remain unknown until resolved. Report violations and unknowns separately and retain
the same fresh semantic reviewer gate. No helper or fallback changes round caps.


## Git model (generic defaults)

- An **integration branch** (default: the scaffold branch `chore/<slug>-ledger`)
  accumulates the change. One branch per batch, cut from the integration tip when the
  batch's wave opens; wave members run concurrently, each implementer in an isolated
  worktree under the session scratchpad.
- **Integration procedure, per batch**: `git merge-tree --write-tree <integration>
  <batch>` dry run — a conflict is STOP AND INVESTIGATE (fence violation, unrecorded
  extension, or a ledger file edited on both sides; git reports the conflict, not the
  cause), never hand-resolved silently → merge → validation commands on the integration
  tip → green: `🟢`; red: tip stays non-green, no further merges, repair mini-batch.
- **Repairs are mini-batches**: a red tip (`fix/<batch>-tip`), a failed pre-smoke step
  (`fix/<batch>-presmoke-<step>`), a user-reported checkpoint failure
  (`fix/<batch>-c<n>-followup`), a user-ordered revert (`fix/<batch>-revert`) all run on
  their own branch cut from the tip, through the
  fence check, a fresh reviewer, the dry run, merge and tip validation. A repair is a
  `fix` batch for step 6b: it must carry a test that fails on the pre-repair tip (a
  revert is exempt — its proof is a green tip after the merge and a reviewer confirming
  the diff is the exact inverse). Never a
  direct commit on the integration branch.
- Never commit to the default branch; never push. Default policy: the USER
  smoke-tests at checkpoints and merges the default branch up to the checkpoint's
  integration commit. A scaffold-time interview may set a different policy (PR flow,
  orchestrator ff-merge on a recorded verdict, squash); the ledger's contract states
  whichever governs.
- New contracts confirm the protected default as a full local ref, plus a shipment
  source (`local` or `remote <name>`) and the full `refs/heads/<name>` on that source.
  The shipment branch must be that default on the chosen source, not an arbitrary
  feature branch. A local merge may count without a remote or push; an upstream
  merge requires current remote evidence (§Recovery). These facts do not grant
  merge/push permission and are never silently re-detected during a drive.
- Wave open = ONE PROGRESS commit on the integration branch (member rows → 🔄,
  branches named, wave base SHA logged, State line). That commit is the crash marker
  recovery keys on. PROGRESS, LOG and `evidence/` are edited only on the integration
  branch by the orchestrator (the QA runner writes `evidence/` files in the integration
  worktree; the orchestrator commits them); implementers edit only their own batch file on their own
  branch, and only its ticks, `polish:` appends and the Files line under a recorded
  extension.
- Waves and checkpoints come from the plan's locked wave map; plan approval is the
  standing authorization for the concurrency. Deviating from the map needs the user's
  explicit words, recorded verbatim in PROGRESS (sole standing exception: a recorded
  `NEEDS_FENCE` deferral moving the final checkpoint — §Fence changes). A wave opens only when every earlier
  wave's members are 🟢/✅, `⛔ (dropped)` or 👤 (dependents of those held ⬜), the tip is
  green, and no reached checkpoint is unanswered; a ⛔ still awaiting a verdict stops the
  session before this point.
- Never `--no-verify`, never force-push, never rewrite history.

### §Fence changes (mid-wave)

An implementer needing a path outside its fence does not touch it: it finishes what it
can, commits, reports `NEEDS_FENCE: <paths> — <item> — <why>`. Mechanical test: the path
is absent from the fence of EVERY same-wave sibling regardless of status (a sibling
already 🟢 is the dangerous case) and from every extension recorded this wave; ledger,
version and changelog files never qualify. Pass → record "fence +<path> (B<NN>, item,
reason, date)" in the row's Notes and the session log on the integration branch; resume
the implementer, whose only batch-file edit is its Files line on its own branch. Fail →
the batch's other items are gated and integrated now; the deferred item is recorded in
Notes + session log as `deferred to W<n+1>: <item> (<path>)` and runs as a continuation
of the same batch in the next wave (branch `<batch-branch>-w<n+1>`, fence extended then);
a recorded deferral does not hold the wave open. At that wave's open the row flips back
to 🔄 with its Branch cell pointing at `<batch-branch>-w<n+1>`; the checkpoint after wave
n covers the batch's other items and the deferred item's smoke steps ride the next
checkpoint; with no later wave, the continuation is a final wave on its own and the
final checkpoint moves to after it — record the move in the checkpoint-table row (After
wave) and the session log (the recorded deferral is the authorization to deviate from
the map); wave n then closes without a checkpoint; the row returns to
🟢 when the continuation integrates. A true overlap goes to the STOP hand-off. The fence check's allowed set is the plan's fence ∪ recorded extensions
∪ the batch's own file — never the implementer's Files line alone.

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

The user smoke-tests at planned CHECKPOINTS, never per batch by default: one after
each wave carrying a hands-on batch (visible UI/UX, auth/payment/external-service
flows, migrations, destructive or hard-to-reverse operations — anything validations +
review cannot prove), plus one mandatory final checkpoint covering everything since
the last. If no hands-on work sits outside the final wave, the final checkpoint is the
ONLY one. Between checkpoints the run is autonomous. A reached checkpoint is never
skipped and never resolved without the user's verdict.

**Runners.** Every smoke step carries `Runner: agent` (executable in THIS ledger's
environment by a runner the contract lists — CLI, HTTP, browser, screenshot) or
`Runner: human` (hardware, credentials, feel, another OS, anything unlisted). Steps
flagged "Touches your data" are human unless the contract names a disposable fixture
environment. Default human. At close-out the QA runner executes the agent steps on the
integration tip and writes `evidence/C<n>/` (command, exit, tail or screenshot, SHA,
environment); the page shows them as pre-verified, collapsed, re-runnable. A failing
agent step keeps rows 🟢, goes to Notes + evidence, and is fixed by a repair mini-batch
before the hand-over — never `❌`; a step the runner could not perform is issued as a
human step with the reason. A pre-verified label is invalidated for any step whose
covered files a later repair touched.

**Delivery.** The batch files' smoke steps are canonical. Use the newest committed
`smoke-*.html` in the ledger as the page's format and delivery base (or the session's
own template), update it for this checkpoint, and commit it as `smoke-<Cn>.html`.
A `smoke-<Cn>.json` sidecar beside the page is the page's source: change the sidecar
and regenerate, commit both, and never hand-edit one of them alone.
Before editing a re-issue, preserve the last issued sidecar as a temporary baseline
and compare against it during regeneration. Keep existing step numbers and order;
append new steps after them with numbers above the previous maximum. Never decrease
revisions; changes to instructions or shared section context require increases for
the affected steps.
Deliver it through the runtime's available HTML preview, file hand-over, or publishing
tools; reuse the existing hosted URL when the runtime can update it. Record the CURRENT
delivery location in PROGRESS's `Smoke page` field: URL, ledger-relative HTML path, or
`plain text`. When switching delivery, retain the previous hosted URL in LOG for future
reuse; never present an outdated hosted page as the current run. Include the step-0
build-identity gate essentials in text with every page hand-over.

No particular publisher or cloud verdict store is required. Without a usable HTML
delivery route or page/template, print the FULL combined script: gate first, then each
step's Do / Pass in section order, with pre-verification and carried-over results
identified. Keep a prepared page's committed audit copy even when delivering text.
Browser-local saving works without cloud synchronization where browser storage is
available. Keep storage isolated by change and checkpoint; switching runtimes, hosts,
or browsers does not transfer saved marks automatically. Use the recorded user verdicts
and the new hand-over's results; missing stored marks are not passes. Runtime-specific
publishing instructions live in the skill's `smoke-page.md`, not the generated contract.

Verdicts are FOUR: **pass** · **fail** (triage → ❌) ·
**blocked** (the step could not be performed as written — usually correct the STEP
and re-ask; reclassify as fail only if the app lacks the behavior) · **works-but**
(works as specified, the user wants it different — named backlog entry, never a
failure, never blocks the pass). **Verdict intake**: a checkpoint PASS flips every
covered row 🧪→✅; a FAIL indicts batch(es) → ❌, and the intake writes `fix-up pending:
fix/<batch>-c<n>-followup[-<k>]` into each indicted row's Notes (suffix `-2`, `-3`… when
the name already exists) — the branch step 2 and §Recovery act on; never a second line
while the row's earlier fix-up is unmerged — a further report rides that fix-up as
additional failure notes (rows the user explicitly passed → ✅, the rest stay 🧪 for the
re-run); *waive* is the user's recorded decision to treat the checkpoint as passed
without running it; every verdict is quoted verbatim in the verdict log.

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

## §Recovery — the reconcile table

Resolve shipment before inferring a silent merge. Use the ledger's recorded default
and shipment target, never the current branch, `init.defaultBranch`, or a guessed
`main`/`master`. Preserve an older contract's unambiguous recorded local-target
semantics; missing new field names alone do not require migration. With no contract,
use explicit target/merge semantics from the plan or PROGRESS; if absent or ambiguous,
ask and record the answer before inferring shipment. Missing, contradictory or renamed
targets require a recorded correction, never silent substitution or contract rewriting.
The integration branch must be distinct from the default and shipment branches.

Resolve the integration branch's full local ref to `<integration-sha>`. Resolve
`<shipment-sha>` from the recorded source:

- `local`: `git rev-parse --verify <shipment-ref>^{commit}`. This needs no remote;
  an unpushed local merge counts under this policy.
- `remote <name>`: read `git ls-remote --exit-code <name> <shipment-ref>` now and
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

For each PROGRESS row not `✅`/`👤`/`⛔ (dropped)`, gather: branch exists? (`git rev-parse --verify`),
integrated? (`git merge-base --is-ancestor <branch> <integration>`), shipped?
(`git merge-base --is-ancestor <integration-sha> <shipment-sha>` only after source
resolution above), commits ahead
(`git log <integration>..<branch> --oneline`), dirty trees (`git status --porcelain`
in the main checkout AND each worktree from `git worktree list`), and the checklist
state inside the batch file on that branch (`git show <branch>:./<path>`, from the root).
Rows are matched top to bottom; the first match wins.

| Ledger says | Git shows | Verdict |
|---|---|---|
| any row whose Notes end in a spent *fix again* (`third round on <branch> @<sha>`) | no commit after `@<sha>`, branch not yet an ancestor of the integration branch | Crashed before the third round landed → re-spawn the FRESH strong-tier implementer per step 2's table |
| any row whose Notes end in a spent *fix again* | commits after `@<sha>`, branch not yet an ancestor of the integration branch | Third round landed → worktree dirty: re-spawn the FRESH strong-tier implementer at the open findings; clean: fence check, then the fresh re-review with both rounds' findings |
| any row whose Notes carry a `… capped:` marker not followed by a later `verdict … spent` (a marker re-written after a spent line counts as awaiting) | any | Awaiting the user's verdict on that repair (fix again / ship with the residual / drop; ship / drop only after a spent *fix again*) — do not re-gate, do not re-spawn; a recorded verdict is consumed by step 2 |
| any row whose Notes carry a `… repair pending:` marker (`tip repair pending:` / `pre-smoke repair pending:`) with no later spent *ship* / *drop* verdict (those retire it unmerged) | any | In-flight repair — branch missing: spawn it on the named branch; no commit after the marker's `@<sha>`: never started → resume the implementer on that branch (fresh worktree); commits after `@<sha>` but not integrated: resume / gate it per the 🔄 rows on that branch (never a same-named new one); integrated: tip validation (a pre-smoke repair also re-runs its step), remove the marker, then continue per step 2 (tip: back to step 7 or 4; pre-smoke: resume the close-out) |
| 🔄, Notes carry `polish discarded: @<sha>` | branch not an ancestor of the integration branch | Discard in flight → branch tree differs from `@<sha>`: finish the revert (ONE commit spanning `@<sha>..HEAD`; never a reset); tree identical (`git diff @<sha> <tip>` empty): integrate now (dry run → merge → tip validation); the marker stays as the record |
| 🔄 | Notes record `R<k> SHIP @<sha>` (no `asks=` on that line) for the current tip | Reviewed, crashed before the merge → integrate now, no re-review |
| 🔄 | Notes record `R<k> SHIP @<sha> asks=<n>` for the current tip, worktree clean | Shipped with ASKs, crashed before the polish → polish pass (ASK list in LOG.md), then its mechanical close |
| 🔄 | Notes record `R<k> SHIP @<sha> asks=<n>`, commits after `@<sha>`, worktree clean, every `polish:` item ticked (at least one appended) | Polish landed, crashed before its close → 6a + validations on the tip; `git diff --name-only <sha>..HEAD` touches only test/doc/prose paths → integrate; a production file → fix-diff-only re-review by a fresh reviewer |
| 🔄 | Notes end in `R<k> FIX FIRST @<sha>` for the current tip | Round in flight, fix not landed → resume the implementer (fresh) with that round's findings from LOG.md; not a round |
| 🔄 | branch missing, or no commits past the wave base | Implementer never landed → re-spawn it (fresh worktree) |
| 🔄 | dirty worktree, or commits ahead + partial checklist (incl. unticked `polish:` items; a recorded deferral is not a partial checklist) | Resume the implementer — a fresh agent, the original is gone — at the first unticked item (recreate the worktree if gone; a `SHIP … asks=` line with no `polish:` items yet → the ASK list in LOG.md) |
| 🔄 | commits ahead, checklist fully ticked | validations green → crashed before the gate → fence check, then the reviewer gate now (latest `R<k>` line is `FIX FIRST @<sha>` → the round-<k+1> re-review, recorded `R<k+1>`: verifies that round's findings from LOG.md, scans `git diff <sha>..HEAD`); red → resume the implementer (fresh) with the failing output, not a round |
| 🔄 | branch already an ancestor of the integration branch | Crashed between merge and flip → tip validation, then 🟢 (red → repair mini-batch) |
| 🟢 (every member of a checkpoint-carrying wave is 🟢, ⛔ or 👤 — verdict or not) | checkpoint row not 🧪/✅ | Close-out unfinished → integrate any 🟢 member whose branch is not yet an ancestor of the integration branch (dry run → merge → tip validation), then finish the close-out (tip validation → pre-smoke → page → 🧪); never open the next wave |
| 🟢 | branch NOT an ancestor of the integration branch | Crashed between review and merge → integrate now (dry run → merge → tip validation) |
| 🟢 | branch ancestor of the integration branch | Correct state — waits for its covering checkpoint |
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
reconciliation: one line in the PROGRESS Session log, detail in LOG.md.

## §Session algorithm ("continue")

1. Boot + reconcile + resume-time validation (validation commands, quiet form, on the
   integration tip; red → step 2 first).
2. Repairs first, as mini-batches (Git model).
   - **Checkpoint failure** (`❌`): ONE fix-up implementer on the branch the verdict
     intake recorded in Notes as `fix-up pending: fix/<batch>-c<n>-followup[-<k>]` (suffix
     `-2`, `-3`… when the name already exists — a second ❌ on the same batch and
     checkpoint is a NEW fix-up, and a fail on a step annotated as a known residual
     re-indicts), cut from the tip, with the user's failure notes verbatim + the indicted
     batch file(s) + the diff since the last passed checkpoint (the Base SHA before the
     first):
     fence check → fresh reviewer (spec = failure report + acceptance criteria) → dry run
     → merge → tip validation → rows back to 🧪 → STOP, re-issuing the checkpoint's
     script (republish with the affected steps annotated — earlier verdicts survive; or
     reprint the text; bump the PATCH marker before re-issuing so step 0 can tell the
     repaired build from the one just tested). Failing review twice → `❌ (fix-up
     capped)`, left unmerged (the status stays through a third round; the round's `SHIP`
     flips the row to ❌ in the commit recording it, and the fix-up proceeds from its dry
     run).
   - **Red tip with no checkpoint reached** (resume-time validation, or after a merge):
     the same mini-batch on `fix/<batch>-tip` (`<batch>` = the last batch merged before
     the red) with the failing output as the spec; once green, return to step 7 or step 4
     — no 🧪, no STOP. Failing review twice → rows keep their status, the tip stays red.
   - **Failed pre-smoke step**: `fix/<batch>-presmoke-<step>`; failing review twice → the
     step is issued as a HUMAN step carrying the failure note.
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
     ledger's per-worktree setup there (skip only if `n/a`), then run the validations
     and remove the worktree; green → merge for real; red → no merge. A setup failure
     blocks the trial and the merge as an environment problem, not a red validation
     result; resolve setup and retry the trial before deciding whether to merge.

   | Subject | fix again | ship with the residual | drop |
   |---|---|---|---|
   | ⛔ batch | authorized third round: a FRESH implementer on the strong tier, on the batch branch (row → 🔄), both rounds' findings + the current diff, then a fresh re-review; `FIX FIRST` again → ⛔ (kind per step 6; the recorded `R<k> FIX FIRST` line now ends the Notes) | only for `⛔ green, residual finding open` (a `⛔ defective` is fixed again or dropped): integrate per the integration procedure; residual → severity-tagged backlog entry + one `Runner: human` smoke step the orchestrator authors into the batch file's Smoke section AFTER the merge, on the integration branch (next checkpoint page, or a re-issue of the passed one) | `⛔ (dropped)`; items → backlog; its ⬜ dependents re-planned or dropped on the user's words, asked at the same STOP |
   | capped `-tip` repair | third round on the repair's own branch; `FIX FIRST` again → capped, marker re-written | trial-validate, then merge only if green (the open finding → backlog + smoke step); trial red → no merge, stays capped, marker re-written, ask again | reviewed revert mini-batch `fix/<batch>-revert` of the offending merge; that batch → `⛔ (dropped)`, items → backlog |
   | capped `-presmoke` repair | as above | the human step stands; residual → backlog | as ship; the repair branch is deleted (the recorded drop is the authorization) |
   | `❌ (fix-up capped)` | third round on the fix-up's own branch; `SHIP` → row ❌ and the fix-up proceeds (dry run → merge → tip validation → 🧪 → re-issue); `FIX FIRST` again → capped, marker re-written | trial-validate, then merge only if green; indicted rows → 🧪; re-issue with the failing step annotated as a known residual (backlog) | reviewed `fix/<batch>-revert` of the indicted batch's merge; that batch → `⛔ (dropped)`; the rest → 🧪 for the re-issue |
3. Any `🧪`? A checkpoint is open — ask the user for its verdict (passed / failed /
   waive). Never open the next wave past an unanswered checkpoint.
4. Open the next wave: the earliest wave with `⬜` batches (or a recorded deferral) whose
   deps are all 🟢/✅.
   From the integration tip, cut every member branch, create every worktree (run the
   ledger's per-worktree setup), commit the wave-open PROGRESS flip (State: ACTIVE).
   The cut is idempotent: a member branch that already exists with its tip equal to the
   current integration tip is adopted from a crashed open — its worktree, if any, removed
   and recreated (fresh setup); a member branch in any other state → STOP AND INVESTIGATE
   (name collision, or a stale base from an earlier crashed open — re-cut only on the
   user's word; never delete unasked).
5. Spawn ALL of the wave's implementers concurrently, one per batch, each pinned to
   its worktree, on the tier its weight calls for. Prompts are SELF-CONTAINED (spec text,
   fence, acceptance criteria, applicable guardrails, validation commands, conventions,
   prohibitions, report shape, checklist-ticking and self-fence-check instructions).
6. Gate per batch, as each implementer reports — don't wait for the wave's slowest.
   Report lacking status line + evidence → resume for it (not a round). Then:
   6a fence check (read-only helper above, or its manual fallback; clean worktree;
   `git diff --name-status -M <integration>...HEAD`; every
   path, both rename endpoints, in plan fence ∪ recorded extensions ∪ own batch file;
   batch file only ticks / `polish:` appends / recorded Files change) — fail → no reviewer,
   `NEEDS_FENCE` → §Fence changes, else resume to revert; 6b failing-on-base for `fix`
   batches and repairs (temporary worktree at the branch's base: run the ledger's
   per-worktree setup there, unless `n/a`, then copy the batch's test-only files and
   run its changed tests; assertion failure proves it, all-pass = P0, setup failure
   or cannot-run = inconclusive → duty (e)); 6c reviewer +
   gate agents in parallel (hunk→item mapping, acceptance criteria vs the three-dot diff,
   validations, guardrails, failing-on-base cells — an inconclusive 6b means the reviewer
   establishes one from the test text — doc sweeps; S-weight → one combined
   pass); verdict handling per §Severity and round accounting, each verdict recorded in
   the row's Notes as `R<k> <verdict> @<sha>` (`asks=<n>` appended when a `SHIP` carries
   ASKs; findings in LOG.md under the row's heading). After the second
   `FIX FIRST` → ⛔ (defective / green-residual), left out of integration, dependents
   blocked, STOP with the three verdicts.
7. Integrate serially per the integration procedure (dry run → merge → tip validation →
   🟢), apply the version/changelog cadence, remove the worktree, write Notes (SHA,
   reviewer arc, tier, residuals) ending with the metrics token
   `m: rounds=<n> asks=<n> fence-bounces=<n> gate=<findings/prod> tip-red=<0|1>`.
8. Wave closed. The checkpoint table places a checkpoint here → per-checkpoint close-out (a ⛔ member's steps are
   omitted from the page and appended on re-issue if it later ships) → STOP, delivering
   the COMBINED smoke script (every covered batch's steps, data-touching first) as the
   smoke page, text as fallback. No checkpoint → open the next wave in the SAME session.
   Default cadence: run to the next checkpoint, stopping early only at ⛔ or an unplanned
   user gate.

**User gates are front-loaded**: design/UX approvals the plan can foresee are resolved
at planning time (mockup shown, pick recorded, approved design baked into the batch
file) or scheduled as wave 1 — never mid-sequence where they stall the autonomous run.
An UNPLANNED gate surfacing mid-batch: implement what is decidable, record the exact
question in the row's Notes (`👤` if the batch cannot close without it), and ask it in
the STOP hand-off.

## Two distinct close-outs

**Per-checkpoint** (step 8): version bump + changelog per the cadence for everything
integrated since the last checkpoint, tip validation, QA-runner pre-smoke with
evidence (a failing agent step → repair mini-batch first), covered rows `🟢` → `🧪`,
checkpoint-table row, session-log row recording the checkpoint's integration SHA,
`State: AT-CHECKPOINT C<n>`, the checkpoint row's token `m: pre-smoke=<agent>/<human>
human-smoke-min=<n> escaped=<n>` (completed when the user's verdict is recorded), the
filled smoke page committed as `smoke-<Cn>.html` when a page was prepared,
commit on the integration branch, STOP with the combined smoke script (smoke page link
+ gate essentials in text, or the full plain-text script; pre-verified steps marked,
with the evidence SHA).

**Change-complete** (after the FINAL checkpoint passes and every batch is ✅ or
`⛔ (dropped)`):
1. **Convergence pass** (when the contract turns it on; otherwise the coverage audit is
   built from PROGRESS rows + git and the hand-over says so) — one read-only sub-agent
   classifies every plan item against the integration tip (`implemented / partial / contradicts / unrequested`, from the
   acceptance criteria + the full diff since the ledger's **Base** SHA in the PROGRESS preamble, ledger dir excluded);
   anything but `implemented` → named backlog entry or a convergence mini-batch the user
   is asked about. Never close on PROGRESS claims alone.
2. Final coverage audit — every request item, fold-ins included → merged commit /
   intended-behavior resolution / named backlog entry. Zero unaccounted. Fold-ins are
   REMOVED from the backlog file in the close-out commit (a partially done fold-in is
   edited in place with a pointer to the ledger); residuals added get ids in the repo's
   id scheme.
3. **Distillation loop**: new bug CLASSES discovered by this change → ONE-LINE guardrail
   bullets in the project's always-loaded doc, each pointing at the test or mechanism doc
   that enforces it (prefer adding the test now). Repo-wide rules stay in the always-loaded
   section; area-specific ones go to the area's doc and are pulled into batch files per
   fence. Past ~8 KB / ~120 lines, PROPOSE retirements (test / linked doc / merge) for the
   user to accept — never delete unasked. Harvest in-run learnings from LOG.md. Durable
   lessons belong in repo files every future session loads — not in any one session's
   memory.
4. Release command, only on explicit user authorization.
5. Session-log row marked COMPLETE and `State: COMPLETE`; propose deleting merged
   branches and `git mv` of the ledger into `.agents/archive/`.

**A COMPLETE ledger is never resumed.** On "continue" with nothing active: reconcile,
report completion, and point at the backlog for follow-ups. Do not fabricate a batch.

Classify a ledger from its `**State**` line when present; otherwise from its
BATCHES-TABLE rows plus the Session log — never from the Legend line or log prose (both
quote every emoji). An explicit change-COMPLETE marker outranks leftover advisory rows:
a lingering `👤` item (e.g. "rotate the deploy credential") makes the ledger a reminder
to surface, not a change to resume.

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
- **No agent definitions installed** (the skeletons' `subagent_type:` lines name types
  this environment does not define): the spawn ERRORS — `Agent type '<name>' not found` —
  it does not degrade on its own, so the ORCHESTRATOR substitutes the general-purpose
  agent itself on every spawn. The skeleton's prose read-only rules are then the only
  enforcement and bind strictly; the per-spawn token saving is forfeited until the
  definitions are installed — copy the skill repo's `.claude/agents/*.md` into
  `~/.claude/agents/` (or one project's `.claude/agents/`), then restart Claude Code.
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
