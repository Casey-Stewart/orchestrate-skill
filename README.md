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
├── 00-request.md        the user's verbatim ask + decisions + item→batch map
├── 00-READBEFORE.md     the contract: boot, git model, checkpoints, validations, recovery, algorithm
├── 01-plan.md           locked scope: batch table, wave map + checkpoints, per-batch specs, coverage
├── 02-batches-NN-*.md   one per batch: wave, file fence, spec, checklist, acceptance, smoke steps
├── PROGRESS.md          live status + checkpoint tables, smoke verdicts, coverage audit, session log
└── smoke-CN.html        the checkpoint smoke page as handed over (written at each checkpoint)
```

The work then runs in **waves**: file-disjoint batches implemented concurrently, one
implementer per batch, each on its own branch in an isolated git worktree, stacking
serially onto an **integration branch**. Four gates hold throughout:

1. **A locked plan.** Scope is agreed up front and written down. Every request item maps
   to exactly one batch, or to an exclusion you signed off on — nothing silently dropped.
   The plan also locks the **wave map** — which batches may run concurrently, and why
   that's safe — and the checkpoint placement; your plan approval is the standing
   authorization for that concurrency.
2. **A file fence.** Each batch declares the only files it may touch. An implementer
   sub-agent gets a self-contained prompt and works inside that fence — disjoint fences
   are what keep wave siblings from colliding, and what make the integration merges
   conflict-free by construction.
3. **An independent reviewer.** One fresh read-only sub-agent per batch — even inside a
   wave — maps *every* diff hunk back to a batch item; an unmapped hunk is scope creep
   and rejects the round. Two rounds max, then the batch is blocked for you to look at.
   Only reviewed batches merge into the integration branch.
4. **Your smoke test — at checkpoints, not per batch.** Nothing is marked done on an
   agent's say-so, but your hands-on time is spent sparingly: checkpoints sit after
   waves carrying hands-on risk (visible UI, auth flows, migrations), plus one mandatory
   final one. The run stops there with one combined smoke script — published as an
   interactive **smoke page** you run the checkpoint from: a step-0 "prove you're on
   the right build" gate, per-step Pass / Fail / Blocked / Works-but verdicts with
   notes, a progress meter, and a copy-results button whose paste is your verdict
   message — and waits for that verdict, recorded verbatim. Between checkpoints the
   run is autonomous.

If a session crashes mid-wave, the next one reconciles the ledger against git — branch
exists? commits past the wave base? integrated? checklist ticked? — and resumes from
the real state rather than the claimed one.

### Design notes

- **Ledgers are closed systems.** Every repo-specific fact (validation commands, version
  files, merge policy, smoke procedure) is baked into the ledger at scaffold time. A
  ledger never references this skill, so it stays drivable without it.
- **Statuses are claims; git is truth.** The wave-open PROGRESS commit on the
  integration branch — not any status flip — is the crash marker recovery keys on.
- **Your time is the scarce resource.** Waves are engineered as wide as the fences
  allow (seam batches, splits, merges), and manual smoke tests happen only at planned
  checkpoints — never per batch by default.
- **User gates are front-loaded.** Design and UX approvals get resolved at planning time,
  while you're present, instead of stalling an autonomous run halfway through.
- **Conservative by default.** No pushing, no `--no-verify`, no force-push, no history
  rewriting, never a commit on the default branch, and nothing merges toward the default
  branch — unless you say so, in words that get recorded in the ledger. (Merging
  reviewed batches into the integration branch is the orchestrator's normal job.)

## Install

Copy the skill directory into your Claude Code skills folder.

macOS / Linux:

```bash
git clone https://github.com/Casey-Stewart/orchestrate-skill.git && cp -r orchestrate-skill/orchestrate ~/.claude/skills/
```

Windows (PowerShell):

```powershell
git clone https://github.com/Casey-Stewart/orchestrate-skill.git; Copy-Item -Recurse orchestrate-skill\orchestrate $HOME\.claude\skills\
```

For one project only, copy it to `<project>/.claude/skills/` instead. Restart Claude Code
and it will pick the skill up.

## Usage

| Command | What it does |
|---|---|
| `/orchestrate new <description>` | Interview, plan the batches, scaffold the ledger, stop for your approval |
| `/orchestrate continue` | Run to the next checkpoint: open the wave, implement its batches concurrently, review + integrate each as it lands, repeat — then stop with one combined smoke page |
| `/orchestrate status` | Read-only: reconcile every row against git and report what's actually true |
| `/orchestrate close` | Record your checkpoint verdict; finish the change when the final checkpoint passes |

You can also just talk to it — "where are we on the batch work", "batch 3 is broken, the
sidebar doesn't open", "continue" — and it routes to the right mode.

## Requirements

- Claude Code, in a **git repository** (the protocol is git-native and won't scaffold
  without one).
- Sub-agents are used for implementers and reviewers, but aren't required — without them
  the orchestrator implements a wave's batches one at a time in the main checkout and
  still runs the review as a separate adversarial pass per batch. Checkpoint placement
  is unchanged.

## What's in here

```
orchestrate/
├── SKILL.md                        entry point: mode dispatch, discovery, invariants
├── references/
│   ├── protocol.md                 canonical spec, legacy interop, degraded environments
│   ├── execution-models.md         the waved stack: wave map, checkpoints, integration
│   ├── scaffolding.md              detection heuristics, interview, placeholder registry
│   ├── subagent-prompts.md         implementer / reviewer / fix-up prompt skeletons
│   ├── smoke-page.md               the checkpoint hand-over format: assembly, publishing, verdict triage
│   └── smoke-page-template.html    the smoke page itself, with slots for the run-specific content
└── templates/                      the five ledger files, with placeholders
```

Markdown plus one self-contained HTML template — nothing executes on your machine.

## License

[MIT](LICENSE) — use it for anything, commercial or not. Attribution is the only
condition, and it's a copy-paste line.
