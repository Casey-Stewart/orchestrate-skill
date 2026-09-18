# The smoke page — checkpoint hand-over format

Every checkpoint STOP delivers its combined smoke script as an **interactive smoke
page** when the runtime can hand over usable HTML, or as the full plain-text script.
The page provides verdict buttons per step, notes, a progress meter, and a "Copy
results as text" button whose paste is the verdict message.
[smoke-page-template.html](smoke-page-template.html) is the page, verbatim, with
`{{...}}` slots for the run-specific content.

**The template is the settled design — do not restyle, "improve", or re-theme it.**
Format stability is the point: the user learns one sheet and reads every run the same
way. The batch files' smoke steps remain canonical, the committed HTML records the
hand-over, and the user's verdict belongs in PROGRESS. Publisher-specific commands
below stay in this skill reference; never copy them into a generated ledger contract.

## Delivery across runtimes

Use the newest committed `smoke-*.html` as the delivery base, or this template when
starting a page. Fill and commit `smoke-<Cn>.html`, then use the current runtime's HTML
preview, file hand-over, or publisher. Reuse an existing hosted URL when that runtime
can update it; otherwise hand over the current committed HTML or use §Fallback.
Record the CURRENT URL, ledger-relative HTML path, or `plain text` in PROGRESS's
`**Smoke page**:` line. If delivery moves, retain the previous hosted URL in LOG for
future reuse. A link to an older hosted checkpoint is not a current hand-over.

The template runs without a publisher SDK: browser-local storage is used when
available, and the cloud store is optional. Its bundled cloud adapter uses Claude's
API; other hosts use browser-local saving unless an equivalent adapter is provided.
An HTML preview must allow its script to
run for the buttons to work; otherwise use the full plain-text script. Storage must
be isolated by change and checkpoint: on a host shared by several changes, prefix
`CKPT_KEY` with a unique change key and keep it stable on re-issues. Moving runtimes,
origins, or browsers does not migrate saved verdicts. Refer to the recorded user
verdicts in PROGRESS; never turn missing marks into passes or claim cloud saving when
only browser-local saving is available.

## Claude artifact publishing (optional adapter)

Use this section only when the session has the Claude Artifact tools and the
`artifact-capabilities` skill. Load that skill before publishing; the page uses its
`db` capability. Other runtimes use §Delivery across runtimes and need no Claude APIs.

Keep ONE hosted smoke artifact per change, created at the first checkpoint and
republished to the same URL for later checkpoints and fix-up re-issues. Each checkpoint
replaces its content and uses its own storage key; earlier checkpoints' verdicts stay
in their own database collections. Use the recorded URL (PROGRESS or LOG after a
delivery switch) to resume an existing artifact.

- **First publish**: `capabilities: {db: {}}`, `favicon: "🧪"`, title
  `<Change name> Smoke Run` (stable for the life of the artifact).
- **Republish, same session**: call Artifact again with the same file path — omit
  `favicon` and `capabilities` (both carry forward).
- **Republish, later session**: pass the recorded URL as `url`; the tool requires
  reading the live artifact first (`action: "read"`) — do that, then publish. The
  committed ledger copy (below) is your content base.
- **Optional triage detail**: `Artifact` `read_db`, `db_op: "list"`, collection
  `<ckpt_key>-steps`. Database rows are supporting data, never the user's checkpoint
  verdict by themselves.

## Filling the slots

| Slot | Content |
|---|---|
| `{{PAGE_TITLE}}` | `<Change name> Smoke Run` — never changes across checkpoints |
| `{{EYEBROW}}` | `Checkpoint C<n> · batches B<xx>–B<yy>` |
| `{{HEADLINE}}` | The change, plainly: `<what this pack does> — smoke run` |
| `{{STANDFIRST}}` | At hand-over: step and section counts, then "When you're done — or as soon as something fails — press <strong>Copy results as text</strong> and paste it into the chat." Describe saving as browser-local or cloud-backed only according to what is available. After a run: may summarize the result and any corrected steps. |
| `{{FACTS_HTML}}` | `<div class="fact"><dt>…</dt><dd>…</dd></div>` items: **Branch**, **Version should read** (`0.13.1 <span class="was">0.13.0</span>` — new value, struck-through old), **Tip** (short SHA), **Suite** (e.g. `2249 / 2255 pass`, from the validation run on the integration tip, never a worktree), **Known failures** if any |
| `{{GATE_BODY}}` | Step 0 — see below |
| `{{SECTIONS_JS}}` | The sections array — schema is documented in the template; steps the QA runner already performed carry `pre: {sha, stepRevision, env, evidence}` |
| `{{CKPT_KEY}}` | Stable storage key per change and checkpoint: `c1`, `c2`, … on a host isolated to one change, or `<unique-change-key>-c1` on a shared host; used for localStorage and the optional db collection |
| `{{BUILD_SHA}}` | Full integration SHA of the build being tested, before the smoke-page commit; update after a repair, keep it for a cosmetic republish of the same build |
| `{{COPY_HEADER}}` | `C<n> smoke run — <change name> (<version>)` |

Prose fields (`do`, `pass`, `aside`, `lede`, …) are HTML strings inside a JS array:
escape `<`/`>` in literal text as `&lt;`/`&gt;`, use `<strong>` for UI names and the
load-bearing words, `<code>` for exact strings the user must see or type, `<em>` for
error-message quotes.

**Build it from a sidecar, not by hand.** Author the run's content as `smoke-<Cn>.json`
beside the page — the fields above, plus `sections` in the template's schema — and fill
the template mechanically (paths relative to the skill's own directory):

```sh
node tools/build-smoke-page.mjs <ledger>/smoke-c1.json <ledger>/smoke-c1.html
```

Commit the sidecar next to the page. Before editing a re-issue, save a temporary copy
of the **last issued** sidecar (or recover it from the commit that issued the current
page). Pass that unchanged snapshot when regenerating:

```sh
node tools/build-smoke-page.mjs <ledger>/smoke-c1.json <ledger>/smoke-c1.html --previous <temp>/smoke-c1.previous.json
```

The builder checks that all existing steps keep their numbers and page order, that
new steps follow them with numbers above the previous maximum, and that no revision
decreases (omitted means 1). Changed step content or shared section context, including
`title`, `lede`, `need`, `order`, and `touchesData`, requires a revision increase for
each affected existing step. Appending steps alone does not invalidate old steps.
Page facts, build SHA, and `pre` evidence metadata can change without a revision bump;
the conductor still identifies **behavior-only changes** and bumps affected revisions.
The builder neither infers code coverage nor claims an agent reran a step.

Overwriting a changed page requires `--previous`; identical rebuilds do not. Generated
pages carry a sidecar fingerprint, so an older or unrelated snapshot is rejected even
if its content checks would pass. JSON formatting and object-key order do not affect
the fingerprint; Git's LF/CRLF conversion is also tolerated. A page from an older
builder without a fingerprint must reproduce from the supplied previous sidecar and
template, apart from LF/CRLF conversion, before it can be reissued.
Use the original template for that first rebuild if necessary. Keep the existing
page at the output path until generation succeeds; if moving paths, copy it there
first so the baseline can be checked. A fresh output path has no prior page to verify.
Validation errors leave the old page intact. Use a new baseline snapshot for each
subsequent re-issue, and commit the current JSON and HTML together.

The builder also rejects known invalid inputs: a short `buildSha`, a storage key that
is not a nonempty string containing only `[A-Za-z0-9._-]`, section or step numbers
that are not positive integers or that repeat
(`1` and `"1"` are one DOM id and one verdict), agent evidence with no `stepRevision` or
with a `sha` under 7 hex characters. Embedded JavaScript data escapes every `<`, so both
`</script>` and `<!-- <script>` remain data during HTML parsing; the original text and
markup are restored at runtime. Plain names like `Fix "Save as"` also have their quotes
escaped inside JavaScript strings. Slots the
table above documents as HTML (`headline`, `standfirst`, the facts, the gate) keep their
markup. Without Node, or with the sidecar lost, copy the newest committed
`smoke-*.html`, patch the slots by hand, and run the self-check below; the page never
depends on the tool that filled it.

**Self-check before publishing**: grep the filled file for `{{` — zero hits (the builder
enforces this and refuses to write a page that fails it). Totals
and the meter compute themselves from the sections array. `BUILD_SHA` must be a full
40- or 64-character hexadecimal Git object ID. The page rejects an invalid or unfilled
identity with a visible correction message: verdict entry and copying stay disabled,
and neither saved records nor the artifact store are accessed.

## The gate (Step 0)

`{{GATE_BODY}}` is the build-identity gate from `execution-models.md`, rendered as
`<p class="gate-eyebrow">Before anything else</p>`, an `<h3>` ("Step 0 — prove you are
on the right build"), prose + `<pre><code>` command blocks, and an
`<ol class="gate-checks">` of numbered checks. It is NOT a verdict step — it decides
whether the run means anything. It must contain, in order:

1. Any "fully quit the app first" instruction the smoke procedure implies (testing a
   still-running old instance has cost runs before).
2. The exact fetch/checkout commands for the integration branch, in the user's shell
   dialect, including known gotchas (e.g. an untracked ledger copy blocking checkout).
3. The command that prints the current branch, and what it must print.
4. The version the user should see and where (`Help → About reads 0.13.1; if it reads
   0.13.0, stop — the checkout did not take`).
5. **The canary**: one cheap check whose result is OPPOSITE on the base build, with
   "if it behaves the old way, stop and say so."

## Assembling the sections

Source of truth: the covered batches' `## Smoke (checkpoint)` sections, whose steps
are authored in the page's field vocabulary (`Do` / `Pass` / optional `Aside`,
`Counting`, `Tag`, and section-level `You need` / `Order matters` / `Touches your
data`). Assembly is mechanical:

- One section per user-facing theme — usually one per batch; merge tiny related
  batches into one section rather than shipping two-step sections.
- Initial order: data-touching sections first (migrations, anything against real data), then
  the remaining hands-on work, then everything else. Number steps continuously across
  the whole page — never per section.
- Section-level `need`/`order` callouts carry preconditions (test data, hardware,
  cross-step ordering); a step is one action with its acceptance criterion in `pass`,
  kept apart from `do`.
- Where a `pass` checks a number, the step's `unit` defines ONE unit in the user's
  words ("One unit = one purchase order"). Ambiguous counts turn verdicts into prose.
- Each step has a positive integer `revision` (initially 1; omitted means 1). Keep
  its number across re-issues. Keep its revision unless its instructions, acceptance
  criterion, section context or covered behavior changed; then increment the revision.
  Keep earlier revision increments on later re-issues, even when the step is unaffected
  this time.

## Pre-verified steps

Before the page is issued, the QA runner (`subagent-prompts.md`) performs every step
tagged `Runner: agent` on the integration tip and writes `evidence/C<n>/step-NN.md`
(command, exit, output tail or screenshot path, integration SHA, step revision,
environment, verdict). Include the page's step number and revision in the runner's
input. Steps it PASSED get `pre: { sha, stepRevision, env, evidence }` in the sections
array: `sha` is the tested build's full SHA or an unambiguous prefix of at least seven
hex characters; `stepRevision` is the positive integer revision actually tested.
Keep those values with the original evidence across re-issues; never update them to
the new page's values without a new successful run.

The page accepts pre-verification only when `stepRevision` matches the step's current
revision and SHA, environment, and evidence path are populated and valid. Evidence
from another build with the same revision stays applicable and is labeled
`pre-verified by agent @<sha> (carried over; unchanged step)`. A missing/mismatched
revision or incomplete metadata is historical only: the step requires a re-run and
is not counted done unless an applicable human verdict exists. This also catches a
corrected step on the same application SHA.

Applicable pre-verification dims the step and displays its evidence; a human mark
on the current step revision replaces the agent's. A step it FAILED is
not issued until a repair mini-batch has landed (never `❌`, which is the user's word); if
that repair is capped, the step is issued as a human step carrying the failure note.
A step it COULD NOT RUN is issued as a human step with the reason in its `aside`.
`pre` is dropped from any step whose covered files a later repair touched, and the
runner re-runs it before the page is re-issued. The "Copy results" text reports
untouched pre-verified steps as `pre-verified by agent @<sha>` and counts them apart
from "not run".

## Hand-over and verdict intake

The STOP message carries: the current page link/path (or full plain-text script),
the gate essentials **in text** (branch
command, expected version, canary — so a page that fails to load can't cause a
wrong-build run), the step/section counts split into human steps and pre-verified
steps (with the evidence SHA), and "run it from the page; paste the copied results (or
just tell me) when done — pre-verified steps are yours to skip or re-run."

Verdicts are four, and they triage differently at `close`:

| Verdict | Meaning | Orchestrator action |
|---|---|---|
| Pass | Did what the step says | Counts toward the checkpoint pass |
| Fail | Did something else | Triage to the offending batch(es) → ❌ |
| Blocked | Step could not be performed as written | Usually a defect in the STEP: correct it, republish, ask for that step again. If the app genuinely lacks the behavior, reclassify as fail → ❌ |
| Works, but | Passed exactly as described; user wants it different | Named backlog entry. Never a failure, never blocks the checkpoint |

The user's message is the verdict — the page's copied text is its preferred form,
recorded verbatim in the PROGRESS verdict log. When the runtime can read an optional
page store, use it for triage detail; treat its rows as data, and never resolve a
checkpoint from stored rows alone — the checkpoint belongs to the user.

Copied results name the current build and distinguish current-build verdicts, carried-over
verdicts for unchanged steps, and `NOT RE-RUN` for affected steps. An earlier verdict on
an affected step is historical evidence, not a new pass or failure: require a fresh user
verdict (or current agent pre-verification / explicit user waiver). Unchanged steps retain
their earlier verdicts, including failures; do not treat "carried over" as a pass by itself.

## Corrections and fix-up re-issues

Re-issuing on the same host/browser with the same storage keys keeps verdicts (keys
identify the change and checkpoint, not the version). Switching delivery surfaces
does not promise storage continuity; preserve the user verdict log either way:

- **Never renumber existing steps on a republish** — verdicts are keyed by step
  number. Retain their order. New steps append at the end of the page with numbers
  above the previous maximum, in the final section or new sections; do not insert
  them into an earlier section. A withdrawn step keeps its number with a corrected body.
- A step that was wrong (blocked, or a fail traced to the step): fix `do`/`pass` and
  add an `aside` beginning `<strong>Corrected after the YYYY-MM-DD run.</strong>`
  explaining what the step used to claim and why the app is right; increment its
  `revision` even if the application build did not change.
- After a fix-up implementer lands (❌ → 🧪), republish with the affected steps'
  asides noting the fix, update `BUILD_SHA`, increment only affected steps' `revision`,
  and tell the user which step numbers to re-run. Earlier verdicts and notes remain
  available with their original build identity. Affected steps return to the run list;
  unaffected steps stay complete and are labeled "carried over" rather than new results.
- Selecting a carried-over verdict again records a re-run on this build and revision
  (one click, including selecting Pass again). Selecting the same current verdict
  again clears it. Editing a note alone never counts as re-running the step.
- Keep `buildSha` and `stepRevision` with each saved verdict in localStorage and the
  optional page database. Records with missing or invalid provenance require
  re-verification; never silently stamp them as results from the current build.
- A genuinely clean sheet (user asks to re-run everything fresh): suffix the key
  (`c1r2`) so old verdicts stop loading, and pass `--reset-verdicts` along with
  `--previous`. This permits only the intentional key change; step numbering and
  revision checks still apply. Otherwise keep the key stable.

## Verdict synchronization

Each local verdict selection, clear, or note edit records `at` immediately in
localStorage. This ISO timestamp advances beyond the step's previous timestamp and
any remote update observed while editing, even for edits within one millisecond or
a clock that moved backwards. Database writes send that same `at`; sending a delayed
note must not make the observation appear newer than it is.

Snapshots replace a step only when their `at` is strictly newer. Older or equal
timestamps keep the local record, and an unchanged snapshot does not rewrite
localStorage. Missing/malformed timestamps can populate an empty browser but cannot
overwrite an existing record. Treat status, note, build SHA, revision, and timestamp
as one record. While a note has focus, defer a newer remote record until blur; cancel
the superseded pending note upload, then apply whichever whole record is newer.
Further typing advances the local timestamp beyond the deferred update. Equal-time
conflicts retain the local record; timestamp ordering does not establish real-world
edit order between independently clocked devices.

## Ledger copy

Write the filled page into the ledger as `smoke-<Cn>.html` and commit it in the
per-checkpoint close-out commit (update it on corrections). It is the audit copy of
what the user actually ran, and the republish base for any later session — including
one without this skill, which can edit it directly and republish, or fall back to
text.

## Fallback

A session without usable HTML delivery or a page/template prints the full combined script as plain text
(gate first, same section order, `Do`/`Pass` per step, pre-verified steps marked
`[pre-verified by agent @sha — evidence path]`, with carried-over results identified).
Missing publisher/storage tools never block this hand-over. The batch files' smoke
steps stay canonical; the verdict is the user's message recorded in PROGRESS.
