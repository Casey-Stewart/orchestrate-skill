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
├── 00-READBEFORE.md     the contract: boot, git model, validations, recovery, algorithm
├── 01-plan.md           locked scope: batch table, ordering, per-batch specs, coverage
├── 02-batches-NN-*.md   one per batch: file fence, spec, checklist, acceptance, smoke
└── PROGRESS.md          live status table, smoke verdicts, coverage audit, session log
```

The work then runs one batch at a time, each on its own branch, through four gates:

1. **A locked plan.** Scope is agreed up front and written down. Every request item maps
   to exactly one batch, or to an exclusion you signed off on — nothing silently dropped.
2. **A file fence.** Each batch declares the only files it may touch. An implementer
   sub-agent gets a self-contained prompt and works inside that fence.
3. **An independent reviewer.** One fresh read-only sub-agent per batch maps *every* diff
   hunk back to a batch item — an unmapped hunk is scope creep and rejects the round.
   Two rounds max, then the batch is blocked for you to look at.
4. **Your smoke test.** Nothing is marked done on an agent's say-so. The batch stops with
   a printed smoke script and waits for your verdict, recorded verbatim.

If a session crashes mid-batch, the next one reconciles the ledger against git — branch
exists? commits ahead? checklist ticked? — and resumes from the real state rather than
the claimed one.

### Design notes

- **Ledgers are closed systems.** Every repo-specific fact (validation commands, version
  files, merge policy, smoke procedure) is baked into the ledger at scaffold time. A
  ledger never references this skill, so it stays drivable without it.
- **Statuses are claims; git is truth.** The first commit on a batch branch — not the
  status flip — is the crash marker recovery keys on.
- **User gates are front-loaded.** Design and UX approvals get resolved at planning time,
  while you're present, instead of stalling an autonomous run halfway through.
- **Conservative by default.** No pushing, no merging, no `--no-verify`, no force-push, no
  history rewriting, and never a commit on the default branch — unless you say so, in
  words that get recorded in the ledger.

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
| `/orchestrate continue` | Run the next eligible batch: implement → review → close out → stop for your smoke test |
| `/orchestrate status` | Read-only: reconcile every row against git and report what's actually true |
| `/orchestrate close` | Record your smoke verdict; finish the change when the last batch passes |

You can also just talk to it — "where are we on the batch work", "batch 3 is broken, the
sidebar doesn't open", "continue" — and it routes to the right mode.

## Requirements

- Claude Code, in a **git repository** (the protocol is git-native and won't scaffold
  without one).
- Sub-agents are used for implementers and reviewers, but aren't required — without them
  the orchestrator implements directly and still runs the review as a separate
  adversarial pass.

## What's in here

```
orchestrate/
├── SKILL.md                        entry point: mode dispatch, discovery, invariants
├── references/
│   ├── protocol.md                 canonical spec, legacy interop, degraded environments
│   ├── execution-models.md         sequential / linear stack / stacked waves
│   ├── scaffolding.md              detection heuristics, interview, placeholder registry
│   └── subagent-prompts.md         implementer / reviewer / fix-up prompt skeletons
└── templates/                      the five ledger files, with placeholders
```

Markdown only — there is no code to execute.
