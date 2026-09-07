---
name: orchestrate
description: Ledger-based orchestration for multi-batch code changes. Scaffolds and drives file-based ledgers in .agents/changes/ — locked plan with a wave map (file-disjoint batches run concurrently, one git branch per batch, worktree implementers), an independent hunk-to-finding reviewer gate per batch, user smoke tests only at planned checkpoints (after hands-on-risk waves plus one final — never per batch by default), and crash-safe PROGRESS reconciliation where git is truth. Use when the user asks to plan or orchestrate a multi-item or multi-batch change as a ledger; says "continue", "resume the batch work", asks for ledger status, or gives a smoke-test verdict in a repo that has a .agents/changes/ directory; or asks to set a repo up for ledger-driven orchestration. Modes: new <description> | continue | status | close.
argument-hint: new <description> | continue | status | close
---

# Ledger orchestration

Multi-batch changes run from a **ledger**: a committed directory
`.agents/changes/<PREFIX>-YYYYMMDD-<slug>/` holding the user's verbatim request, a
locked plan with a wave map and smoke checkpoints, one file per batch, a binding
contract (`00-READBEFORE.md`), and a live `PROGRESS.md` where statuses are claims and
**git is truth**. Ledgers are CLOSED SYSTEMS: every repo fact is baked in at scaffold
time, so any session — with or without this skill — can drive one by reading the ledger
alone. Full spec: [references/protocol.md](references/protocol.md).

**Arguments**: `$ARGUMENTS`

## Mode dispatch

First word of the arguments:

- `new <description>` → scaffold a ledger
- `continue` → run the session algorithm on the active ledger
- `status` → read-only reconcile + report
- `close` → process smoke verdicts / finish the change
- empty or anything else → run Discovery, then route by message shape: a smoke verdict
  ("passed", "X is broken") → `close`; "what's left / where are we" → `status`;
  "continue / resume / next batch" → `continue`; a new multi-item request → confirm the
  scope, then `new`. Ambiguous → ask.

## Discovery (every mode starts here)

1. Find ledgers: glob `**/PROGRESS.md` rooted at `<repo>/.agents/changes/` — dot-dirs
   often escape repo-root globs, so root the search INSIDE the directory; if that still
   returns nothing, list the directory directly.
2. Classify each ledger from its BATCHES-TABLE rows plus the Session log — never from
   the Legend line or log prose (both quote every emoji):
   - **COMPLETE**: the Session log (or verdict log) carries an explicit change-COMPLETE
     marker — even if advisory `👤` rows remain (surface those as reminders).
   - **ACTIVE**: any batch row ⬜ 🔄 🟢 🧪 ❌ ⛔, and no COMPLETE marker.
   - **USER-BLOCKED**: only `👤` rows remain open — report what the user must do;
     there is nothing for the orchestrator.
   - **AMBIGUOUS** → ask.
3. COMPLETE ledgers are NEVER resumed. If the user says "continue" and nothing is
   active: reconcile, report completion, point at the backlog. Do not fabricate a batch.
4. Multiple ACTIVE ledgers → list them one line each; the user picks.
5. Legacy ledgers (older file names / status vocabularies / per-batch smoke gates) are
   driven under their OWN contract — see protocol.md §Legacy ledger recognition. Never
   rewrite one.

## Invariants (binding in every mode)

- Statuses are claims; **git is truth** — reconcile before believing any PROGRESS row.
- One branch per batch, cut from the integration branch when its wave opens. Never
  commit to the default branch, never push. The orchestrator merges REVIEWED batches
  into the integration branch; anything merges toward the default branch only per the
  ledger's merge policy or the user's explicit words in THIS session.
- Only batches the plan marked mutually file-disjoint and dependency-free share a
  wave; the user's plan approval is the standing authorization for that concurrency.
  Deviating from the locked wave map needs the user's explicit words, recorded
  verbatim in PROGRESS.
- The wave-open PROGRESS commit on the integration branch (member rows → 🔄, wave base
  SHA logged) is the crash marker reconciliation keys on.
- Smoke gates are planned CHECKPOINTS — after waves carrying hands-on risk, plus one
  mandatory final — never per batch by default. A reached checkpoint belongs to the
  USER: never flip ✅ without their verdict; never open the next wave past an
  unanswered 🧪.
- Implementer sub-agents never touch version files, the changelog, or PROGRESS.
- Every batch gets ONE independent read-only reviewer — even inside a wave — that maps
  every diff hunk to a batch item; unmapped hunks are scope creep and reject the
  round. Two rounds max, then ⛔.
- Default session cadence: run autonomously to the next checkpoint — waves in
  sequence, no stopping between batches — halting early only at ⛔ or an unplanned
  user gate.
- No `--no-verify`, no force-push, no history rewriting.
- The ledger's own contract outranks this skill's reference docs.

## Mode: new

Read [references/scaffolding.md](references/scaffolding.md) and the files in
[templates/](templates/), then: preconditions (git repo; tree state) → detect repo
facts → ONE consolidated interview round → plan the batches (explore; batch table with
file fences; item→batch coverage) → structure for throughput per
[references/execution-models.md](references/execution-models.md): reshape fences for
disjointness, build the wave map (widest safe waves), classify each batch hands-on vs
machine-verifiable, place the smoke checkpoints (fewest possible — hands-on waves +
one final) → front-load user gates (design/UX approvals resolved at planning time via
mockups, or scheduled as wave 1 — never mid-run) → user approves plan + wave map +
checkpoints in one pass → fill the templates into `.agents/changes/<CHANGE_ID>/` →
self-check (grep the new directory for `{{` and `<!--` — zero hits) → scaffold commit
on `chore/<slug>-ledger` (which becomes the integration branch) → STOP and report.

## Mode: continue

1. Discovery → exactly one ACTIVE ledger (else ask).
2. Read the ledger's OWN contract (`00-READBEFORE.md`; legacy names per protocol.md;
   contract absent → protocol.md fills the gaps, ask before acting on ambiguity).
3. Boot + reconcile per the contract, then run its §Session algorithm: fix-ups (❌)
   first → unanswered 🧪 checkpoint → open the next wave (cut branches + worktrees,
   spawn ALL of the wave's implementers concurrently) → reviewer gate per batch as
   each lands → integrate reviewed batches serially → next wave, repeating until a
   checkpoint → per-checkpoint close-out → STOP, delivering the checkpoint's combined
   smoke script as an interactive smoke page per
   [references/smoke-page.md](references/smoke-page.md) (plain text only when the
   session cannot publish artifacts). Build spawn prompts from
   [references/subagent-prompts.md](references/subagent-prompts.md).

## Mode: status

Strictly read-only (no edits, no branch changes): discovery → reconcile every
non-✅/👤 row against git per the contract's §Recovery table → print a
claim-vs-git-vs-verdict table, the checkpoint(s) awaiting the user, and the
recommended next action. Drift corrections happen in `continue`, not here.

## Mode: close

1. Record the user's verdict VERBATIM in the PROGRESS smoke-verdict log. A checkpoint
   pass flips every batch it covers 🧪→✅. A fail: triage the symptoms to the
   offending batch(es) → ❌ (the fix-up then runs via `continue`); batches the user
   explicitly passed flip ✅; the rest stay 🧪 for the re-run. Smoke-page verdicts
   beyond pass/fail ([references/smoke-page.md](references/smoke-page.md)):
   **works-but** → named backlog entry, never a failure; **blocked** → correct the
   step and re-issue the page, or reclassify as a fail if the app lacks the behavior.
2. Merge / push / release ONLY on the user's explicit authorization — their exact words
   are the record (a verdict message may carry the authorization; quote it).
3. Final checkpoint ✅ → change-complete close-out per the contract: final coverage
   audit (zero unaccounted items), distillation (new bug classes → the project's
   guardrails section; residuals → the backlog file), optional release command,
   session-log row marked COMPLETE, propose deleting merged branches.

## Refusals

- Not a git repo → do not scaffold; offer `git init` and wait for consent.
- Asked to resume a COMPLETE ledger → reconcile, report completion, point at the
  backlog.
- Contract absent and the legacy shape ambiguous → ask; never guess a protocol.
- Asked to skip the reviewer gate or a reached checkpoint → only with the user's
  explicit waiver, recorded verbatim in PROGRESS.

## Skill files

- [references/protocol.md](references/protocol.md) — canonical spec, legacy interop,
  degraded environments
- [references/execution-models.md](references/execution-models.md) — the waved stack:
  building the wave map, placing checkpoints, integration mechanics
- [references/scaffolding.md](references/scaffolding.md) — detection heuristics,
  interview, placeholder registry, self-check
- [references/subagent-prompts.md](references/subagent-prompts.md) — implementer /
  reviewer / fix-up prompt skeletons
- [references/smoke-page.md](references/smoke-page.md) — the checkpoint hand-over
  format: filling and publishing
  [references/smoke-page-template.html](references/smoke-page-template.html),
  verdict intake and triage
- [templates/](templates/) — `00-request.md`, `00-READBEFORE.md`, `01-plan.md`,
  `02-batch.md` (one per batch), `PROGRESS.md`
