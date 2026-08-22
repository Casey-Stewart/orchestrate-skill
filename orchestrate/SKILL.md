---
name: orchestrate
description: Ledger-based orchestration for multi-batch code changes. Scaffolds and drives file-based ledgers in .agents/changes/ — locked plan, one git branch per batch, sub-agent implementers, an independent hunk-to-finding reviewer gate, user smoke-test merge gates, and crash-safe PROGRESS reconciliation where git is truth. Use when the user asks to plan or orchestrate a multi-item or multi-batch change as a ledger; says "continue", "resume the batch work", asks for ledger status, or gives a smoke-test verdict in a repo that has a .agents/changes/ directory; or asks to set a repo up for ledger-driven orchestration. Modes: new <description> | continue | status | close.
argument-hint: new <description> | continue | status | close
---

# Ledger orchestration

Multi-batch changes run from a **ledger**: a committed directory
`.agents/changes/<PREFIX>-YYYYMMDD-<slug>/` holding the user's verbatim request, a
locked plan, one file per batch, a binding contract (`00-READBEFORE.md`), and a live
`PROGRESS.md` where statuses are claims and **git is truth**. Ledgers are CLOSED
SYSTEMS: every repo fact is baked in at scaffold time, so any session — with or without
this skill — can drive one by reading the ledger alone. Full spec:
[references/protocol.md](references/protocol.md).

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
   - **ACTIVE**: any batch row ⬜ 🔄 🧪 ❌ ⛔, and no COMPLETE marker.
   - **USER-BLOCKED**: only `👤` rows remain open — report what the user must do;
     there is nothing for the orchestrator.
   - **AMBIGUOUS** → ask.
3. COMPLETE ledgers are NEVER resumed. If the user says "continue" and nothing is
   active: reconcile, report completion, point at the backlog. Do not fabricate a batch.
4. Multiple ACTIVE ledgers → list them one line each; the user picks.
5. Legacy ledgers (older file names / status vocabularies) are driven under their OWN
   contract — see protocol.md §Legacy ledger recognition. Never rewrite one.

## Invariants (binding in every mode)

- Statuses are claims; **git is truth** — reconcile before believing any PROGRESS row.
- One branch per batch. Never commit to the default branch, never push, never merge —
  unless the ledger's merge policy or the user's explicit words in THIS session allow it.
- First commit on a batch branch = the PROGRESS row flip to 🔄 (the crash marker).
- The smoke gate belongs to the USER: never mark ✅ without their verdict; never skip an
  unanswered 🧪.
- Implementer sub-agents never touch version files, the changelog, or PROGRESS.
- Every batch gets ONE independent read-only reviewer that maps every diff hunk to a
  batch item — unmapped hunks are scope creep and reject the round. Two rounds max,
  then ⛔.
- One batch per session unless the user explicitly asks for more.
- No `--no-verify`, no force-push, no history rewriting. Sequential-gate waivers require
  the user's explicit words, recorded verbatim in PROGRESS.
- The ledger's own contract outranks this skill's reference docs.

## Mode: new

Read [references/scaffolding.md](references/scaffolding.md) and the files in
[templates/](templates/), then: preconditions (git repo; tree state) → detect repo
facts → ONE consolidated interview round → plan the batches (explore, batch table with
file fences, item→batch coverage, execution model per
[references/execution-models.md](references/execution-models.md)) → front-load user
gates (design/UX approvals resolved at planning time via mockups, or scheduled as the
earliest batches — never mid-run) → user approves the
plan → fill the templates into `.agents/changes/<CHANGE_ID>/` → self-check (grep the
new directory for `{{` and `<!--` — zero hits) → scaffold commit on
`chore/<slug>-ledger` → STOP and report.

## Mode: continue

1. Discovery → exactly one ACTIVE ledger (else ask).
2. Read the ledger's OWN contract (`00-READBEFORE.md`; legacy names per protocol.md;
   contract absent → protocol.md fills the gaps, ask before acting on ambiguity).
3. Boot + reconcile per the contract, then run its §Session algorithm: fix-ups (❌)
   first → unanswered 🧪 gates → next eligible ⬜ batch → implementer sub-agent(s) →
   reviewer gate → close-out → STOP, printing the smoke script. Build spawn prompts
   from [references/subagent-prompts.md](references/subagent-prompts.md).

## Mode: status

Strictly read-only (no edits, no branch changes): discovery → reconcile every
non-✅/👤 row against git per the contract's §Recovery table → print a
claim-vs-git-vs-verdict table, the smoke gates awaiting the user, and the recommended
next action. Drift corrections happen in `continue`, not here.

## Mode: close

1. Record the user's verdict VERBATIM in the PROGRESS smoke-verdict log; flip 🧪→✅ on
   a pass, 🧪→❌ on a fail (the fix-up then runs via `continue`).
2. Merge / push / release ONLY on the user's explicit authorization — their exact words
   are the record (a verdict message may carry the authorization; quote it).
3. Last batch ✅ → change-complete close-out per the contract: final coverage audit
   (zero unaccounted items), distillation (new bug classes → the project's guardrails
   section; residuals → the backlog file), optional release command, session-log row
   marked COMPLETE, propose deleting merged branches.

## Refusals

- Not a git repo → do not scaffold; offer `git init` and wait for consent.
- Asked to resume a COMPLETE ledger → reconcile, report completion, point at the
  backlog.
- Contract absent and the legacy shape ambiguous → ask; never guess a protocol.
- Asked to skip the reviewer or the smoke gate → only with the user's explicit waiver,
  recorded verbatim in PROGRESS.

## Skill files

- [references/protocol.md](references/protocol.md) — canonical spec, legacy interop,
  degraded environments
- [references/execution-models.md](references/execution-models.md) — sequential /
  linear stack / stacked waves, and how to choose
- [references/scaffolding.md](references/scaffolding.md) — detection heuristics,
  interview, placeholder registry, self-check
- [references/subagent-prompts.md](references/subagent-prompts.md) — implementer /
  reviewer / fix-up prompt skeletons
- [templates/](templates/) — `00-request.md`, `00-READBEFORE.md`, `01-plan.md`,
  `02-batch.md` (one per batch), `PROGRESS.md`
