# B02 — Contract boot: the prompt is authoritative (fix, —)

**Branch**: `fix/contract-prompt-authority`
Cut from the integration tip when the wave opens.
**Wave**: 1 · **Weight**: S
**Depends on**: none
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files**: `orchestrate/templates/00-READBEFORE.md`, `tests/contract-prompt-authority.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: surgical edit only — do not reflow or reformat surrounding sections; remove no content from the template beyond the one replaced paragraph; `git diff --check` clean; never touch `.agents/archive/` or any file under `.agents/changes/`; do NOT edit `orchestrate/references/*` (B03's fence) or `orchestrate/SKILL.md`.
**Spec**: [01-plan.md](01-plan.md) §B02 · **Gate**: fence check → failing-on-base + one combined reviewer pass (reviewer only — the contract names no gate agents)

## Implementation notes

This section is AUTHORITATIVE. Everything needed is here; do not re-derive scope from the
original request or any external document.

### The request, verbatim

> 3. Resolve the contract-vs-prompt contradiction about the READBEFORE.
> The contract's boot section tells implementers to "read this file + your 02-batches-NN-\*.md batch file ONLY" — that's 81KB ≈ 20k tokens. subagent-prompts.md says the opposite: paste the text in, don't point at files. Change the contract to say the prompt is authoritative and the contract is consulted only if the prompt is incomplete.
> Payoff: up to ~20k per implementer that follows the contract literally, and it's what your three-of-seven zero-orientation-read result already validates.

### The exact text to replace

`orchestrate/templates/00-READBEFORE.md`, lines 33–36 — the paragraph sitting between the
orchestrator's four-step `## Boot sequence` and the `## Roles, gates, tiers` heading. It
currently reads, verbatim:

```
Implementer sub-agents: read this file + your `02-batches-NN-*.md` batch file ONLY, and
work ONLY in the worktree your prompt names. The batch file carries the full spec text
and codebase facts — it is authoritative. Do NOT re-derive scope from the original
request or any external document.
```

That is the entire scope of the prose change. Nothing else in the 56KB template moves.

### Why this is wrong — the facts

- The filled contract in the archived ledger is **83,327 bytes ≈ 20k tokens**. An
  implementer that follows "read this file" literally spends that before doing any work.
- `orchestrate/references/subagent-prompts.md` says the opposite in three places:
  - `:4-5` — "Prompts must stand alone: sub-agents have NO session context, so paste the
    actual text into the prompt (don't just point at files an agent might skip)."
  - `:366` — "Paste, don't point: the batch text and contract excerpts go INTO the prompt
    verbatim."
  - `:25` — the Implementer skeleton itself opens "You have no other context; everything
    you need is below", then pastes the contract excerpts it needs at `:36-50`: the file
    fence, repo conventions, applicable guardrails, hard prohibitions and the validation
    commands. It never tells the implementer to read the contract.
- So the prompt already carries what the contract's boot paragraph tells the implementer
  to go and read. The paragraph is not just expensive, it is redundant.

### What the replacement must say — all three, none optional

1. **The spawn prompt is authoritative and self-contained.** An implementer works from
   the prompt, which already carries the batch text and every binding contract excerpt.
2. **This contract is a reference, consulted on demand** — only when the prompt is
   incomplete, self-contradictory, or missing a fact the work actually needs. Reading it
   then means reading the relevant section, not the file end to end. It is explicitly not
   a boot-time read for an implementer.
3. **The constraints the old paragraph carried survive**: work only in the worktree the
   prompt names; the batch file is authoritative for scope; do not re-derive scope from
   the original request or any external document.

Point 3 is not optional and is the easy thing to get wrong. The old paragraph bundled real
constraints with the bad advice; a replacement that drops them trades 20k of tokens for a
scope-creep hole.

### A starting draft

Use this or improve on it, provided all three points above survive:

```
Implementer sub-agents: **your spawn prompt is authoritative.** It is self-contained —
it carries your batch's full text plus every contract excerpt that binds you (file fence,
conventions, guardrails, prohibitions, validation commands), so do NOT read this contract
at boot. Consult it only if the prompt is incomplete, contradicts itself, or is missing a
fact the work needs, and then read only the section you need. Work ONLY in the worktree
your prompt names. Your batch file carries the full spec text and codebase facts — it is
authoritative for scope. Do NOT re-derive scope from the original request or any external
document.
```

### Reach — template only

This edit reaches **new ledgers only**. `README.md` states the rollout boundary: "a
ledger's own contract outranks the skill, so a new skill version changes nothing about
ledgers already scaffolded; it reaches a repo through the next `/orchestrate new`". The
user confirmed this reading at scaffold time.

Consequences you must respect:

- `.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md` keeps the
  old wording. It is a closed historical record and a test at
  `tests/protocol-contract.test.cjs:122` guards its local environment facts. Do not touch it.
- **This ledger's own** `.agents/changes/OS-20260919-agent-tool-restrictions/00-READBEFORE.md`
  was filled from the unedited template at scaffold time and also keeps the old wording.
  That is correct and expected. It is outside your fence. Do not touch it.

### Test-breakage risk you must check

`tests/protocol-contract.test.cjs:95-101` asserts a list of literal strings that must stay
present in this template. Several are short and generic — `'does not'`, `'immutable'`,
`'EVERY'`, `'both arrays'`, `'complete/partial/unknown'` — so a careless edit elsewhere in
the file can break one. Your change is confined to one paragraph, which should be safe, but
the full suite is the only way to know. Run it.

### The test file

`tests/contract-prompt-authority.test.cjs`, `node:test` CommonJS, in the style of
`tests/protocol-contract.test.cjs` (read the file as text from the repo root, assert on
content). It must:

- assert the template no longer instructs implementers to read the contract itself —
  i.e. the literal old phrase `read this file + your` is **absent** from
  `orchestrate/templates/00-READBEFORE.md`;
- assert the template states prompt authority: the implementer paragraph says the prompt
  is authoritative and that the contract is consulted only when the prompt is incomplete;
- assert the three surviving constraints are still present in that paragraph: the worktree
  restriction, the batch file being authoritative for scope, and the prohibition on
  re-deriving scope from the original request or an external document;
- **guard the archived ledger** — if
  `.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md` exists,
  assert it *still contains* the old phrase, proving the edit did not reach a closed
  ledger. Wrap it in an `existsSync` check, exactly as
  `tests/protocol-contract.test.cjs:122-131` does, because a clone made after archival
  need not contain that path.

This test is the failing-on-base test for this `fix` batch: on the un-edited template the
first two assertions fail.

## Checklist

- [x] Replace lines 33–36 of `orchestrate/templates/00-READBEFORE.md` with wording that
      carries all three required points. Surgical — do not reflow neighbouring text, do
      not renumber or restructure the `## Boot sequence` steps above it, do not touch
      `## Roles, gates, tiers` below it.
- [x] Add `tests/contract-prompt-authority.test.cjs` with the four assertion groups above,
      including the `existsSync`-guarded archived-ledger check.
- [x] Confirm by hand that the new test fails against the base template, then passes after
      the edit (this is the failing-on-base evidence the gate will ask for; report the
      command and result).
- [x] Run the validation commands from [00-READBEFORE.md](00-READBEFORE.md); all green.
- [x] `git diff --name-status -M chore/agent-tool-restrictions-ledger...HEAD` plus
      `git status --porcelain`; revert anything outside the fence — especially any
      accidental edit under `.agents/`.
- [x] Commit on `fix/contract-prompt-authority` — `fix: make the spawn prompt authoritative over the contract at boot (batch 02)`.

## Acceptance criteria

The reviewer checks these against the actual diff:

1. The phrase `read this file + your` no longer appears in
   `orchestrate/templates/00-READBEFORE.md`.
2. The replacement paragraph states that the spawn prompt is authoritative and
   self-contained, and that this contract is consulted only when the prompt is incomplete,
   contradictory or missing a needed fact.
3. All three surviving constraints are present in the new paragraph: worktree-only work,
   the batch file authoritative for scope, and no re-deriving scope from the original
   request or an external document. A diff that drops any of them is rejected.
4. The diff to `orchestrate/templates/00-READBEFORE.md` is confined to that one paragraph.
   No neighbouring section is reflowed, renumbered or reworded.
5. Nothing under `.agents/` is modified — neither the archive nor this ledger's own filled
   contract.
6. `tests/contract-prompt-authority.test.cjs` fails on the base template and passes after
   the edit, and its archived-ledger assertion is wrapped in an `existsSync` guard.
7. The full suite is green: 187 baseline tests still pass and the new test is additive.
8. Every hunk maps to a checklist item above; an unmapped hunk is scope creep and rejects
   the round.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge. As a `fix` batch this also carries a failing-on-base check: the gate runs
`tests/contract-prompt-authority.test.cjs` against the un-fixed template and requires it
to FAIL there.

## Smoke (checkpoint)

Machine-verifiable — this batch contributes no hands-on step of its own to C1. Its effect
is on ledgers scaffolded *after* this change, and the assertion that the wording is right
lives in `tests/contract-prompt-authority.test.cjs`.

Recorded for the close-out, not as a user step: the first `/orchestrate new` run after
this change should produce a ledger whose `00-READBEFORE.md` carries the new paragraph.
That is a natural consequence to observe later, not a checkpoint gate, and C1 does not
wait on it.
