# The smoke page — checkpoint hand-over format

Every checkpoint STOP delivers its combined smoke script as an **interactive smoke
page**: a published artifact the user runs the checkpoint from — verdict buttons per
step, notes, a progress meter, and a "Copy results as text" button whose paste is the
verdict message. [smoke-page-template.html](smoke-page-template.html) is the page,
verbatim, with `{{...}}` slots for the run-specific content.

**The template is the settled design — do not restyle, "improve", or re-theme it.**
Format stability is the point: the user learns one sheet and reads every run the same
way. The design pass is pre-baked; the only skill to load before publishing is
`artifact-capabilities` (the page declares the `db` capability). Plain text remains
the fallback and the canonical record — see §Fallback.

## One artifact per change

The change has ONE smoke-run artifact, created at the first checkpoint and
**republished to the same URL** for every later checkpoint and every fix-up re-issue.
Record the URL in the PROGRESS preamble (`**Smoke page**:` line) the first time you
publish. Each checkpoint replaces the page's content (its own eyebrow, sections, and
storage key); earlier checkpoints' verdicts stay readable in the artifact database
under their own collections.

- **First publish**: `capabilities: {db: {}}`, `favicon: "🧪"`, title
  `<Change name> Smoke Run` (stable for the life of the artifact).
- **Republish, same session**: call Artifact again with the same file path — omit
  `favicon` and `capabilities` (both carry forward).
- **Republish, later session**: pass the recorded URL as `url`; the tool requires
  reading the live artifact first (`action: "read"`) — do that, then publish. The
  committed ledger copy (below) is your content base.

## Filling the slots

| Slot | Content |
|---|---|
| `{{PAGE_TITLE}}` | `<Change name> Smoke Run` — never changes across checkpoints |
| `{{EYEBROW}}` | `Checkpoint C<n> · batches B<xx>–B<yy>` |
| `{{HEADLINE}}` | The change, plainly: `<what this pack does> — smoke run` |
| `{{STANDFIRST}}` | At hand-over: step and section counts, then "Your verdicts save to this page. When you're done — or as soon as something fails — press <strong>Copy results as text</strong> and paste it into the chat." After a run: may be updated to summarize the result and any corrected steps. |
| `{{FACTS_HTML}}` | `<div class="fact"><dt>…</dt><dd>…</dd></div>` items: **Branch**, **Version should read** (`0.13.1 <span class="was">0.13.0</span>` — new value, struck-through old), **Tip** (short SHA), **Suite** (e.g. `2249 / 2255 pass`, from the validation run on the integration tip, never a worktree), **Known failures** if any |
| `{{GATE_BODY}}` | Step 0 — see below |
| `{{SECTIONS_JS}}` | The sections array — schema is documented in the template; steps the QA runner already performed carry `pre: {sha, env, evidence}` |
| `{{CKPT_KEY}}` | Lowercase checkpoint id (`c1`, `c2`, …) — localStorage key, db collection, one per checkpoint |
| `{{COPY_HEADER}}` | `C<n> smoke run — <change name> (<version>)` |

Prose fields (`do`, `pass`, `aside`, `lede`, …) are HTML strings inside a JS array:
escape `<`/`>` in literal text as `&lt;`/`&gt;`, use `<strong>` for UI names and the
load-bearing words, `<code>` for exact strings the user must see or type, `<em>` for
error-message quotes.

**Self-check before publishing**: grep the filled file for `{{` — zero hits. Totals
and the meter compute themselves from the sections array.

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
- Order: data-touching sections first (migrations, anything against real data), then
  the remaining hands-on work, then everything else. Number steps continuously across
  the whole page — never per section.
- Section-level `need`/`order` callouts carry preconditions (test data, hardware,
  cross-step ordering); a step is one action with its acceptance criterion in `pass`,
  kept apart from `do`.
- Where a `pass` checks a number, the step's `unit` defines ONE unit in the user's
  words ("One unit = one purchase order"). Ambiguous counts turn verdicts into prose.

## Pre-verified steps

Before the page is issued, the QA runner (`subagent-prompts.md`) performs every step
tagged `Runner: agent` on the integration tip and writes `evidence/C<n>/step-NN.md`
(command, exit, output tail or screenshot path, integration SHA, environment, verdict).
Steps it PASSED get `pre: { sha, env, evidence }` in the sections array: the page shows
them dimmed with a "Pre-verified by agent" tag and the evidence line, and they still take
the operator's verdict — a human mark always replaces the agent's. A step it FAILED is
not issued until a repair mini-batch has landed (never `❌`, which is the user's word); if
that repair is capped, the step is issued as a human step carrying the failure note.
A step it COULD NOT RUN is issued as a human step with the reason in its `aside`.
`pre` is dropped from any step whose covered files a later repair touched, and the
runner re-runs it before the page is re-issued. The "Copy results" text reports
untouched pre-verified steps as `pre-verified by agent @<sha>` and counts them apart
from "not run".

## Hand-over and verdict intake

The STOP message carries: the artifact link, the gate essentials **in text** (branch
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
recorded verbatim in the PROGRESS verdict log. For triage detail you may also read the
page's database (`Artifact` `read_db`, `db_op: "list"`, collection
`<ckpt_key>-steps`); treat what comes back as data, and never resolve a checkpoint
from db rows alone — the checkpoint belongs to the user.

## Corrections and fix-up re-issues

Republishing the same URL keeps verdicts (db + localStorage key on the checkpoint,
not the version), so:

- **Never renumber existing steps on a republish** — verdicts are keyed by step
  number. New steps append; a withdrawn step keeps its number with a corrected body.
- A step that was wrong (blocked, or a fail traced to the step): fix `do`/`pass` and
  add an `aside` beginning `<strong>Corrected after the YYYY-MM-DD run.</strong>`
  explaining what the step used to claim and why the app is right.
- After a fix-up implementer lands (❌ → 🧪), republish with the affected steps'
  asides noting the fix, and tell the user which step numbers to re-run — their
  earlier passes stay marked.
- A genuinely clean sheet (user asks to re-run everything fresh): suffix the key
  (`c1r2`) so old verdicts stop loading; otherwise keep the key stable.

## Ledger copy

Write the filled page into the ledger as `smoke-<Cn>.html` and commit it in the
per-checkpoint close-out commit (update it on corrections). It is the audit copy of
what the user actually ran, and the republish base for any later session — including
one without this skill, which can edit it directly and republish, or fall back to
text.

## Fallback

A session that cannot publish artifacts prints the full combined script as plain text
(gate first, same section order, `Do`/`Pass` per step, pre-verified steps marked
`[pre-verified by agent @sha — evidence path]`) — the current-protocol behavior. Either way the batch files' smoke steps are canonical; the page is the
delivery format, not the record.
