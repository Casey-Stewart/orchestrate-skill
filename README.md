# Orchestrate — a ledger skill for Claude Code

A [Claude Code](https://claude.com/claude-code) skill for running multi-batch code
changes off a **file-based ledger** that lives in the repo, survives crashes, and can be
driven by any future session — including one that has never seen this skill.

The problem it solves: a change too big for one session. Context runs out, the session
dies, a new one picks up with no memory of what was done, and status notes in chat lie
about what actually shipped. Orchestrate writes the plan, the scope fence, and the
progress table into committed files, then treats **git as the source of truth** whenever
those files and reality disagree.

## How it works

Every change gets one directory, committed to the repo:

```
.agents/changes/<PREFIX>-YYYYMMDD-<slug>/
├── 00-request.md        the user's verbatim ask + decisions (incl. accepted backlog fold-ins) + item→batch map
├── 00-READBEFORE.md     the contract: boot, roles/gates/tiers, git model, fence changes, checkpoints, recovery, algorithm
├── 01-plan.md           locked scope: batch table (weight, wave, fence), wave map + checkpoints, pre-flight verdict, per-batch specs
├── 02-batches-NN-*.md   one per batch: fence, applicable guardrails, spec, checklist, acceptance, tagged smoke steps
├── PROGRESS.md          one-line State, status + checkpoint tables, verdicts, coverage audit, one-line session log
├── LOG.md               append-only narrative (reviewer arcs, root causes, learnings) — read on demand, never at boot
├── evidence/CN/         what the QA runner already verified before each checkpoint
└── smoke-CN.html        the checkpoint smoke page as handed over
```

The work then runs in **waves**: file-disjoint batches implemented concurrently, one
implementer per batch, each on its own branch in an isolated git worktree, stacking
serially onto an **integration branch**. The gates, in the order a batch meets them:

1. **A locked plan, pre-flighted.** Scope is agreed up front and written down. Every
   request item maps to exactly one batch, or to an exclusion you signed off on. Before
   you see the plan, an independent read-only sub-agent checks it: items covered both
   ways, same-wave fences really disjoint, fences *complete* (a grep census of every
   symbol a batch touches, tests and docs included), no contradictions, criteria that a
   diff, a test or a smoke step can settle. The plan also locks the **wave map** and the
   checkpoint placement; your approval is the standing authorization for the concurrency.
   Cheap backlog items whose files already sit inside a fence can be folded in at the
   same approval, under strict eligibility, and are removed from the backlog when they
   ship.
2. **A file fence, checked mechanically.** Each batch declares the only files it may
   touch. Before any reviewer is spent, `git diff --name-status` against the integration
   branch must stay inside the fence (both ends of a rename, clean worktree). An
   implementer that needs another file reports `NEEDS_FENCE` and the fence grows only if
   the wave stays disjoint — recorded, never improvised.
3. **An independent reviewer, plus optional gate agents.** One fresh read-only sub-agent
   per batch maps *every* diff hunk back to a batch item; an unmapped hunk is scope creep
   and rejects the round. P0/P1 findings block; small in-fence asks (test strength,
   prose, comments) ride under `SHIP` and close as a polish pass that costs no round. For
   `fix` batches a mechanical check first proves the new test fails on the un-fixed code.
   A repo can name gate agents (a test hunter asking "what mutation keeps this test
   green?") that run beside the reviewer. Two blocking rounds max, then the batch is
   blocked and you choose: fix again, ship with the residual on record, or drop.
4. **Validation on the tip.** Each reviewed batch merges after a merge-tree dry run, and
   the suite runs again on the integration branch — sibling interactions show up here,
   not at your smoke test. Every repair is itself a reviewed mini-batch; nothing lands on
   the integration branch unreviewed.
5. **Your smoke test — at checkpoints, not per batch.** Checkpoints sit after waves
   carrying hands-on risk (visible UI, auth flows, migrations), plus one mandatory final
   one. Steps an agent can perform in this repo's environment are run first by a QA
   sub-agent and shown as pre-verified with their evidence; your hands are spent on the
   steps only you can do. The run stops with one combined script — an interactive
   **smoke page** with a step-0 "prove you're on the right build" gate, per-step Pass /
   Fail / Blocked / Works-but verdicts, and a copy-results button whose paste is your
   verdict — and waits for that verdict, recorded verbatim.
6. **Convergence before close.** After the final checkpoint passes, and when the ledger's
   contract has it switched on, a read-only sub-agent classifies every plan item against
   the actual code (implemented / partial /
   contradicts / unrequested) before the change is declared complete, and new bug classes
   are distilled into one-line guardrails that point at the test enforcing them.

If a session crashes mid-wave, the next one reconciles the ledger against git — branch
exists? commits past the wave base? merged but not yet validated? close-out half
finished? — and resumes from the real state rather than the claimed one.

### Design notes

- **Ledgers are closed systems.** Every repo-specific fact (validation commands, version
  files, merge policy, smoke procedure, gate agents, runners, tiers) is baked into the
  ledger at scaffold time. A ledger never references this skill, so it stays drivable
  without it.
- **Statuses are claims; git is truth.** The wave-open PROGRESS commit on the
  integration branch — not any status flip — is the crash marker recovery keys on. The
  orchestrator never switches your checkout: it reads branches with `git show` and
  writes through a scratch worktree.
- **Your time is the scarce resource.** Waves are engineered as wide as the fences
  allow, agents pre-verify what they can, and manual smoke tests happen only at planned
  checkpoints.
- **User gates are front-loaded.** Design and UX approvals get resolved at planning time,
  while you're present, instead of stalling an autonomous run halfway through.
- **Measured, not assumed.** Every batch row ends with a metrics token (rounds, asks,
  fence bounces, gate findings, red tips) so the cost of each gate is visible from the
  ledger alone. A repo's first ledger runs the cheap gates by default and offers the
  heavier ones (gate agents, agent pre-smoke, convergence) to be switched on once the
  numbers justify them.
- **Conservative by default.** No pushing, no `--no-verify`, no force-push, no history
  rewriting, never a commit on the default branch, and nothing merges toward the default
  branch — unless you say so, in words that get recorded in the ledger.
- **Rollout boundary.** A ledger's own contract outranks the skill, so a new skill
  version changes nothing about ledgers already scaffolded; it reaches a repo through
  the next `/orchestrate new`.

## Install

Clone the repo and point your Claude Code skills folder at it, so the checked-out repo
IS the deployed skill and there is nothing to keep in sync. If `~/.claude/skills/orchestrate`
already exists from a copy install, move it out of `skills/` first (keep it as a
rollback) — a link created inside it would nest a second `SKILL.md` and register a
duplicate skill:

macOS / Linux:

```bash
git clone https://github.com/Casey-Stewart/orchestrate-skill.git && ln -s "$PWD/orchestrate-skill/orchestrate" ~/.claude/skills/orchestrate
```

Windows (PowerShell):

```powershell
git clone https://github.com/Casey-Stewart/orchestrate-skill.git; New-Item -ItemType Junction -Path "$HOME\.claude\skills\orchestrate" -Target "$PWD\orchestrate-skill\orchestrate"
```

Whatever branch the clone has checked out is what runs — stay on `main`. If you prefer
a plain copy, `cp -r orchestrate-skill/orchestrate ~/.claude/skills/` works, and
`diff -r ~/.claude/skills/orchestrate orchestrate-skill/orchestrate` tells you when it
has drifted. For one project only, use `<project>/.claude/skills/` instead. Restart
Claude Code and it will pick the skill up.

## Usage

| Command | What it does |
|---|---|
| `/orchestrate new <description>` | Interview, plan the batches, sweep the backlog, pre-flight the plan, scaffold the ledger, stop for your approval |
| `/orchestrate continue` | Run to the next checkpoint: validate the tip, open the wave, implement its batches concurrently, gate + integrate each as it lands, repeat — then pre-verify what an agent can and stop with one combined smoke page |
| `/orchestrate status` | Read-only: reconcile every row against git (including ledgers that live only on a branch) and report what's actually true |
| `/orchestrate close` | Record your checkpoint verdict; on the final pass run convergence, distill, and finish the change |

You can also just talk to it — "where are we on the batch work", "batch 3 is broken, the
sidebar doesn't open", "continue" — and it routes to the right mode.

## Requirements

- Claude Code, in a **git repository** (the protocol is git-native and won't scaffold
  without one).
- Sub-agents are used for implementers, reviewers, gate agents and the QA runner, but
  aren't required — without them the orchestrator implements a wave's batches one at a
  time in the main checkout and still runs the review as a separate adversarial pass per
  batch. Checkpoint placement is unchanged.
- Generated ledger contracts use runtime-neutral smoke delivery: reuse the committed
  HTML through available preview/file/publishing tools, or deliver the full script as
  plain text. Cloud verdict storage is optional. Claude artifact publishing instructions
  stay in the skill reference; another agent runtime can follow the ledger's contract
  without Claude APIs. Local HTML or plain text works without publishing a hosted page.

## What's in here

```
orchestrate/
├── SKILL.md                        entry point: mode dispatch, discovery, invariants
├── references/
│   ├── protocol.md                 canonical spec, severity/round accounting, legacy interop, degraded environments
│   ├── execution-models.md         the waved stack: wave map, checkpoints, integration
│   ├── scaffolding.md              detection heuristics, interview, backlog sweep, pre-flight, placeholder registry
│   ├── subagent-prompts.md         implementer / reviewer / test hunter / QA runner / pre-flight / convergence / fix-up skeletons
│   ├── smoke-page.md               the checkpoint hand-over format: assembly, pre-verified steps, publishing, verdict triage
│   └── smoke-page-template.html    the smoke page itself, with slots for the run-specific content
├── templates/                      the six ledger files, with placeholders
└── tools/
    └── build-smoke-page.mjs        fills the template from a checkpoint's `smoke-<Cn>.json` sidecar
```

Markdown, one self-contained HTML template, and one optional Node script that fills it —
nothing runs against your app, and a page can still be filled by hand without it.

Tests use Node's built-in test runner: `node --test tests/smoke-page.test.cjs tests/git-contract.test.cjs tests/build-smoke-page.test.cjs`.
The smoke-page tests run the template's JavaScript with a minimal DOM and artifact-store
adapter, including checkpoint re-issues and verdict provenance. The Git-contract tests
require Git on PATH and create disposable local repos and bare remotes with isolated
configuration; no network service is needed, and temporary repos are removed afterward.
They verify F5's Git assumptions about discovery, shipment evidence and ledger history,
not whether an agent follows the prose. Keep their command recipes aligned with the
documented rules when editing either; prose changes do not automatically change the tests.
The builder tests fill the shipped template from a sidecar and check the result against
the slot table: every slot filled, the same bytes each run, and rejection of invalid
inputs. Reissue tests cover stable step identities, appending new steps, revision
increases, and refusing a stale baseline without overwriting the issued page.

## License

[MIT](LICENSE) — use it for anything, commercial or not. Attribution is the only
condition, and it's a copy-paste line.
