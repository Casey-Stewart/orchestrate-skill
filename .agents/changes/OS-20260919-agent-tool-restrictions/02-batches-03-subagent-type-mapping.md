# B03 — `subagent_type` per skeleton + missing-agent fallback (feature, —)

**Branch**: `feat/subagent-type-mapping`
Cut from the integration tip when the wave opens.
**Wave**: 2 · **Weight**: S
**Depends on**: B01 (its four `.claude/agents/*.md` files must be on the integration tip before this batch's cross-reference test can pass)
**Smoke gate**: hands-on — checkpoint C1 follows wave 2
**Files**: `orchestrate/references/subagent-prompts.md`, `orchestrate/references/protocol.md`, `tests/subagent-type-mapping.test.cjs`, `README.md`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: additive edits only — remove no existing content from either reference file; surgical, no reflowing; `git diff --check` clean; do NOT create or edit any `.claude/agents/*` file (B01's fence); do NOT edit `orchestrate/SKILL.md` or anything under `orchestrate/templates/` (B02's fence); never paste a local absolute path into a reference file.
**Spec**: [01-plan.md](01-plan.md) §B03 · **Gate**: fence check → one combined reviewer pass (reviewer only — the contract names no gate agents)

## Implementation notes

This section is AUTHORITATIVE. Everything needed is here; do not re-derive scope from the
original request or any external document.

### The request, verbatim

> 2. Make subagent-prompts.md name the agent type per role.
> It currently says nothing about tools or agent types — it enforces read-only in prose at :97, :174, :240. Add a subagent_type: line to each skeleton so the orchestrator can't default to general-purpose with \*, which is exactly what I did six times today.

### Codebase facts gathered at planning time

`orchestrate/references/subagent-prompts.md` defines **seven** skeletons, not four. All
seven get a `subagent_type:` line — "each skeleton" means every one of these:

| Skeleton heading | line | `subagent_type:` |
|---|---|---|
| `## Implementer` | :21 | `implementer` |
| `## Reviewer (the gate — read-only)` | :93 | `reviewer` |
| `## Test hunter (optional gate agent — read-only)` | :165 | `test-hunter` |
| `## QA runner (checkpoint pre-smoke)` | :199 | `qa-runner` |
| `## Plan pre-flight (scaffold time — read-only)` | :236 | `reviewer` |
| `## Convergence (change-complete — read-only)` | :274 | `reviewer` |
| `## Fix-up implementer (repair mini-batch)` | :292 | `implementer` |

Plan pre-flight and Convergence map to `reviewer` because all three are the same
capability shape: read the repo, judge it, write nothing. Fix-up maps to `implementer`
because a repair mini-batch edits code. Four definitions, seven skeletons, no gaps.

Line numbers are from the ledger base `5110f71` and will drift as you insert lines — locate
each skeleton by its `##` heading text, not by number.

Other facts:

- The four agent definitions this batch names are created by **B01**, which is already
  integrated when this batch runs: `.claude/agents/implementer.md`, `reviewer.md`,
  `test-hunter.md`, `qa-runner.md`. Do not create or edit them.
- The three prose read-only lines the request cites are exact and **stay**: `:97`
  ("You did not write this code. Use only Read/Grep/Glob and read-only git"), `:174`
  ("Read/Grep/Glob and read-only git; edit nothing"), `:240` ("Use only Read/Grep/Glob;
  edit nothing"). The capability boundary makes them redundant in a correctly-installed
  repo, but they are the *only* enforcement left in a repo without the definitions. Deleting
  them would break the fallback.
- `## Spawning rules (orchestrator)` is at `:349`; `:366` already reads "Paste, don't
  point: the batch text and contract excerpts go INTO the prompt verbatim."
- `orchestrate/references/protocol.md:688` is `## Degraded environments`. Its established
  bullet shape, verbatim, is:

  ```
  - **No gate agents named**: the reviewer alone carries duties (a)–(f).
  ```

  and the section opens with `- **No sub-agents available**: …`. Match that idiom.
- `orchestrate/references/scaffolding.md:185` already detects repo-local
  `.claude/agents/*.md` with read-only `tools:` as `GATE_AGENTS` candidates. That file
  is **not** in your fence; no edit is needed there.
- `orchestrate/references/subagent-prompts.md:169` mentions "a `vacuous-test-hunter` under
  `.claude/agents/`" as an example of a repo-local hunter that replaces the generic
  skeleton. B01 named its file `test-hunter.md`. You may adjust that example to name
  `test-hunter` as the type this repo now provides, but keep the sentence's meaning: a
  repo-local hunter with its own catalog still replaces the skeleton.

### Where the `subagent_type:` line goes

Immediately **above** each skeleton's opening fenced block, as an instruction to the
orchestrator — not inside the prompt text the sub-agent receives. The sub-agent does not
need to know its own type; the orchestrator needs to know what to pass to the Agent tool.

Use one consistent form across all seven, for example:

```
**Spawn with** `subagent_type: reviewer`.
```

Pick one form and use it identically everywhere — the cross-reference test parses these
lines, and an inconsistent form will make it either miss a skeleton or need a looser
regex. State the chosen form in your report.

### The fallback — required, and why

A bare `subagent_type: implementer` **fails in any repo that has not installed the
definitions**, which is every repo but this one until a user follows B01's README step.
Without a documented fallback this change turns a token saving into a broken spawn.

Add one bullet to `orchestrate/references/protocol.md` §Degraded environments, in the
section's existing idiom, stating:

- when the named agent types are not defined in the repo, spawn the general-purpose agent
  instead;
- the skeleton's prose read-only rules are then the only enforcement, so they bind
  strictly;
- the per-spawn token saving is forfeited until the definitions are installed;
- point at `README.md` for the install.

### §Spawning rules gains one rule

Add a bullet to `## Spawning rules (orchestrator)` in `subagent-prompts.md` saying the
orchestrator passes the `subagent_type` its skeleton names and never substitutes a
wildcard-tool agent for a read-only role. Carry the user's caveat verbatim:

> Bash can still write, so "read-only" stays partly conventional; removing Write/Edit
> closes the easy path, not every path.

Cross-reference the fallback bullet you added to `protocol.md` so a reader who has no
definitions installed finds it from here.

### The test file

`tests/subagent-type-mapping.test.cjs`, `node:test` CommonJS, in the style of
`tests/protocol-contract.test.cjs` (read files as text from the repo root, assert on
content). It must assert:

- **every one of the seven skeletons carries a `subagent_type:` line.** Enumerate the seven
  `##` headings explicitly in the test — do not just count matches, or a skeleton added
  later silently escapes the rule. Assert the line appears between each heading and that
  skeleton's first fenced block.
- **the mapping is exactly the table above** — heading → type, all seven.
- **every named type resolves to a real definition**: for each distinct `subagent_type:`
  value found, assert `.claude/agents/<value>.md` exists. This is the assertion that
  prevents the failure this change exists to fix. It passes only with B01 integrated,
  which is why this batch is in wave 2. **Do not weaken it** to a soft or skipped check to
  make it pass earlier — if it fails, the wave was opened wrongly; report `BLOCKED`
  rather than loosening the test.
- **the fallback is documented**: `protocol.md` §Degraded environments mentions the
  undefined-agent-types case and points at the install.
- **the prose read-only rules survive**: the three read-only instructions are still present
  in the reviewer, test-hunter and plan-pre-flight skeletons.

### Test-breakage risks you must check

- `tests/protocol-contract.test.cjs:103-106` requires `subagent-prompts.md` to keep
  matching `/inputs/i`, `/reset/i`, `/independen/i`, `/revisio/i` and
  `/(?:private.data|credential)/i`. Additive edits keep these; removing content may not.
- `:110` requires the exact literal `ACTUAL INPUTS: [INPUT ROOT, STABLE-ID REGISTRY` —
  it lives in the QA runner skeleton at `:213`. Your `subagent_type:` line for QA runner
  goes above the fence at `:202`, nowhere near it. Do not touch that block.
- `:118-121` asserts that no absolute Windows/Python path and no `fatbo` appears in any
  `orchestrate/references/*.md`. Do not paste a local path into either file.
- `protocol.md` is not in the `:103` regex loop, but the `:118-121` sweep reads every `.md`
  under `orchestrate/references/`, so it is covered there. Keep it path-free too.

## Checklist

- [x] Add a `subagent_type:` line above the opening fence of all seven skeletons in
      `orchestrate/references/subagent-prompts.md`, per the mapping table, in one
      consistent form.
- [x] Add the new bullet to `## Spawning rules (orchestrator)`: pass the skeleton's
      `subagent_type`, never substitute a wildcard-tool agent for a read-only role, carry
      the Bash caveat verbatim, cross-reference the `protocol.md` fallback.
- [x] Add the undefined-agent-types bullet to `orchestrate/references/protocol.md`
      §Degraded environments, in that section's existing idiom.
- [x] Optionally align the `vacuous-test-hunter` example near `:169` with the
      `test-hunter` type B01 provides, preserving the sentence's meaning.
- [x] Add `tests/subagent-type-mapping.test.cjs` with every assertion group above,
      including the strict `.claude/agents/<type>.md` existence check.
- [x] Run the validation commands from [00-READBEFORE.md](00-READBEFORE.md); all green.
- [x] `git diff --name-status -M chore/agent-tool-restrictions-ledger...HEAD` plus
      `git status --porcelain`; revert anything outside the fence.
- [x] Commit on `feat/subagent-type-mapping` — `feat: name the agent type per skeleton and document the missing-agent fallback (batch 03)`.
- [x] polish: correct the README fallback sentence — an unknown subagent_type errors, the orchestrator substitutes general-purpose itself
- [x] polish: make `section()` fence-aware — replace the three `section(prompts, …)` call sites used by tests 5/6/7 with `bounds()`-derived slices
- [x] polish: drop the backticks from the anti-regression README pattern so an unbackticked pointer is caught too

## Acceptance criteria

The reviewer checks these against the actual diff:

1. All **seven** skeletons carry a `subagent_type:` line, in one consistent form, placed
   above the opening fence rather than inside the prompt text.
2. The mapping matches the table in §Implementation notes exactly: Implementer and Fix-up →
   `implementer`; Reviewer, Plan pre-flight and Convergence → `reviewer`; Test hunter →
   `test-hunter`; QA runner → `qa-runner`.
3. Every named type has a corresponding `.claude/agents/<type>.md` on the integration tip.
4. `protocol.md` §Degraded environments documents the undefined-agent-types case: fall back
   to general-purpose, prose read-only rules bind strictly, the saving is forfeited, and the
   install is named.
5. `## Spawning rules` states that the orchestrator passes the skeleton's `subagent_type`
   and never substitutes a wildcard-tool agent for a read-only role, and carries the Bash
   caveat verbatim — no text in the diff claims read-only is absolute.
6. **Nothing was removed.** The three prose read-only instructions survive, the
   `ACTUAL INPUTS:` block is untouched, and no existing bullet or paragraph in either
   reference file was deleted or reworded to make room.
7. `tests/subagent-type-mapping.test.cjs` enumerates the seven skeletons by heading rather
   than counting matches, and its `.claude/agents/<type>.md` existence check is strict — not
   skipped, not conditional.
8. No `.claude/agents/*` file is created or modified by this batch.
9. No absolute local path and no username appears in either reference file.
10. The full suite is green: the 187 baseline tests plus B01's and B02's additions all pass,
    and this batch's tests are additive.
11. Every hunk maps to a checklist item above; an unmapped hunk is scope creep and rejects
    the round.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

Note: this batch's own test depends on B01 being present. Your worktree is cut from the
integration tip **after** B01 merged, so `.claude/agents/` exists there. If it does not,
the wave was opened out of order — stop and report `BLOCKED` rather than adapting the test.

## Smoke (checkpoint)

These steps aggregate into C1's combined script, alongside B01's. They cannot run in the
session that writes these files — agent definitions load only at session start, and this
batch is what makes the skeletons name them.

**You need**: the ability to fully restart Claude Code with this repo as the working
directory. No test data, no credentials, no network access.

**Order matters**: B01's restart step must complete first; these steps assume the restarted
session.

- **Do**: Open `orchestrate/references/subagent-prompts.md` and read the `subagent_type:`
  line above the Reviewer skeleton's fenced block. · **Pass**: It names `reviewer`, and the
  same form of line appears above all seven skeletons. · **Runner**: human
- **Do**: In the restarted session, spawn the reviewer exactly as the Reviewer skeleton now
  instructs — passing the `subagent_type` that line names — and ask it whether it can edit
  files. · **Pass**: The spawn succeeds (the type resolves), and the agent reports that
  `Write` and `Edit` are not available to it — not merely that it will not use them. ·
  **Runner**: human · **Aside**: This is the end-to-end check for the whole change: the
  skeleton names a type, the type exists, and the type is restricted. A spawn failure here
  means the definition name and the skeleton disagree.
- **Do**: Read the new §Degraded environments bullet in
  `orchestrate/references/protocol.md`. · **Pass**: It tells a reader with no definitions
  installed what happens and where to install them, and does not claim the read-only
  guarantee holds without them. · **Runner**: human
