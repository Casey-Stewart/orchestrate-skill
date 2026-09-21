# B06 — Smoke-page build identity, sidecar coherence and hand-over proofing (fix, —)

**Branch**: `fix/bl-012-013-017-smoke-page`
Cut from the integration tip when the wave opens.
**Wave**: 3 · **Weight**: L
**Depends on**: B04 (`🟢`) — shares `orchestrate/templates/00-READBEFORE.md`; B01 for the fence tool
**Smoke gate**: C1 (final, fully agent-run)
**Files**: `orchestrate/tools/build-smoke-page.mjs`, `orchestrate/references/smoke-page.md`, `orchestrate/references/execution-models.md`, `orchestrate/templates/00-READBEFORE.md`, `tests/build-smoke-page.test.cjs`, `tests/smoke-page.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: `Markdown is source of truth` (surgical edits, no reflow) · `Positive-only assertions on prose` · `Vacuous-until-later documentation` · `Line endings` · `A backlog entry is a pointer, not a specification` · `Hand-over artifacts` · `A step whose output a human cannot reasonably check is not a check`
**Spec**: [01-plan.md](01-plan.md) §B06 · **Gate**: fence check → failing-on-base + reviewer + test-hunter

## Implementation notes

### BL-012 — verbatim from `BACKLOG.md`

> **The smoke page’s build-identity gate has never worked, on any run.** The page records
> `buildSha` = the build it describes, but committing the page necessarily moves `HEAD` past that
> build, so `git rev-parse HEAD` and `buildSha` can never agree when a tester reads it. Both
> ledgers on this Orchestrate version carry the same hand-written escape hatch ("a later commit
> containing only checkpoint artifacts is allowed"), and `gate.checks` is prose asking a human to
> adjudicate the difference by eye. The one gate whose job is "are you testing the right tree"
> resolves to eyeballing. Fix: put `git merge-base --is-ancestor <buildSha> HEAD` plus
> `git diff --name-only <buildSha>..HEAD \| grep -v '^<ledger-dir>/'` in `gate.commands` where it
> executes, and have `build-smoke-page.mjs` reject a sidecar whose gate carries no containment
> check.

### BL-013 — verbatim from `BACKLOG.md`

> `build-smoke-page.mjs` validates slots, schema and step revisions, but not whether the page’s
> prose is **coherent or runnable**. Three of the five documentation defects in the
> `OS-20260919-backlog-sweep` C1 page were structurally detectable without understanding the
> content: two dangling cross-references (a `Section 5` and a `Step 3` that did not exist after a
> restructure) and an invisible **U+0000** inside a copyable command, which made that command a
> `SyntaxError` for any reader who pasted it. Fix: reject a sidecar carrying a control character
> other than tab or newline, and reject a `Section N` / `Step N` reference the sidecar does not
> contain.

### BL-017 — verbatim from `BACKLOG.md`

> Hand-over artifacts need a proofing pass that the current close-out does not require. In
> `OS-20260919-backlog-sweep`, the QA runner pre-verified a markdown draft; the content was then
> re-authored into the contract-required HTML sidecar and issued **without anyone executing it in
> that form**. A command declared "pre-verified" could not run as published, because it had been
> tested in the shell it was authored in rather than extracted from the rendered page. Fix, as a
> rule in `orchestrate/references/smoke-page.md`: a command in a hand-over artifact is verified
> only when executed in the form the reader receives it — render, read the code block’s
> `textContent`, run exactly those bytes — and author embedded commands with no backslashes and
> no control characters so no transport layer can mangle them.

### Codebase facts gathered at planning time

- `gate.commands` ALREADY EXISTS and already renders at `build-smoke-page.mjs:93`. BL-012’s
  builder work is therefore a VALIDATION rule, not a new field.
- `validate()` is `build-smoke-page.mjs:126-175`. `:127` lists the required keys; `:132` checks
  `buildSha` is a 40- or 64-character hex OID; `:144` requires `gate.checks` to be a non-empty
  array. There is no control-character check and no Section/Step reference check.
- `renderGate()` is `:87-96`.

### The two fences pre-flight added, and why

**`tests/smoke-page.test.cjs` — or this batch reddens a file it cannot touch.** That suite builds
sidecars at `:112` and `:155` with `gate: { checks: [...] }` and NO `gate.commands`, then calls
the real builder at `:114`, `:124`, `:163` and `:180-184`. The moment `validate()` requires a
containment check, both throw.

**`execution-models.md` and `templates/00-READBEFORE.md` — or every future ledger breaks.**
`smoke-page.md:139` says `{{GATE_BODY}}` is the build-identity gate *from* `execution-models.md`;
the spec is `execution-models.md:131-136` (branch / version / canary — no containment check) and
it is baked for every scaffolded ledger at `templates/00-READBEFORE.md:394` and `:405-407`.
Requiring a containment check in the builder while those still describe the old gate would mean
every future scaffolder authors a sidecar the new builder rejects. The spec and the enforcement
must move together.

### Trap, from pre-flight — BL-017 and the QA ordering

`smoke-page.md:271` has the QA runner verify BEFORE the page is built, from `[AGENT-TAGGED
STEPS]` taken "verbatim from the batch files" (`subagent-prompts.md:213-215, 231-237`). BL-017’s
rule inverts that order. Scope the new rule as an ADDED post-render proofing pass — render, read
the code block’s `textContent`, execute exactly those bytes — rather than as a change to when QA
runs. Implemented as an ordering change, it forces `subagent-prompts.md`, which is in NO fence in
this change. If the implementer concludes the rule cannot be written without touching that file,
report `NEEDS_FENCE` rather than widening silently.

### This batch is dogfooded

The user chose to build C1’s own page with the fixed gate (2026-09-20). B06 lands in wave 3,
before C1 is assembled, so the checkpoint page this change hands over must itself carry an
executable containment check. A defect here shows up as a broken hand-over, which is precisely
the test.

## Checklist

- [x] Move the build-identity gate spec in `orchestrate/references/execution-models.md` from
      branch/version/canary to an executable containment check.
- [x] Update the baked gate text in `orchestrate/templates/00-READBEFORE.md` to match, so a ledger
      scaffolded after this change authors a sidecar the new builder accepts.
- [x] Have `validate()` in `build-smoke-page.mjs` REJECT a sidecar whose gate carries no containment
      check, with a message naming what is missing.
- [x] Reject a sidecar carrying any control character other than tab or newline — the U+0000 case that
      made a published command a `SyntaxError`.
- [x] Reject a `Section N` or `Step N` reference the sidecar does not contain (BL-013’s two dangling
      cross-references).
- [x] Update `tests/smoke-page.test.cjs`’s sidecar fixtures at `:112` and `:155` so they carry a
      containment check, keeping every existing assertion’s meaning intact.
- [x] Add `tests/build-smoke-page.test.cjs` cases for all three new rejections, each with a positive
      control that is ACCEPTED, so no rejection assertion is satisfied by an input that could never
      have passed.
- [x] Add the hand-over proofing rule to `orchestrate/references/smoke-page.md` (BL-017), scoped as an
      added post-render pass: a command is verified only when executed in the form the reader receives
      it, and embedded commands carry no backslashes and no control characters.
- [x] Update `orchestrate/references/smoke-page.md:139` so its pointer at `execution-models.md` still
      describes the gate that file now specifies.
      Prove failing-on-base: name, in the report, the exact assertion that goes red when run
      against the code and documents at this batch’s base.
- [x] Run the validation commands from [00-READBEFORE.md](00-READBEFORE.md); all green.
- [x] `git diff --name-status -M chore/interview-sizing-backlog-ledger...HEAD` plus `git status --porcelain`;
      revert anything outside the fence.
- [x] Commit on `fix/bl-012-013-017-smoke-page` — `fix: smoke-page build identity, sidecar coherence and hand-over proofing (batch 06)`.
- [x] polish: R2 ASK-1 - bind the source sweep's domain to the checkout. The swept trees were an array literal with no assertion about the domain, so narrowing it to ['orchestrate'] retired the sweep over the tree the historical U+2028 lived in, 63/63 green. Coverage is now compared against the repository root's top-level entries minus .git, .agents and node_modules, which also brings README.md - the one other document publishing a copyable command - into scope.
- [x] polish: R2 ASK-2 - bind the outside-the-domain edge list. Setting C1_LAST = 160 and dropping 0xA0 from the list was 63/63 green while the builder began rejecting a no-break space. The list is a named const with its length asserted, and the member one past the top of the swept domain is asserted against that domain rather than sampled.
- [x] polish: R2 ASK-3 - forbid a lone CR in source, and read the fourth statement of the contract. The sweep spared every CR while the comment claimed it spared CRLF, so a lone CR planted inside a published command stayed green; CR is now spared only before LF, with a lone CR in the live control. smoke-page.md's inline `git ...` spans extract cleanly and joined CONTAINMENT_SOURCES, so dropping --is-ancestor there no longer passes.

## Acceptance criteria

- A sidecar whose gate carries no containment check is REJECTED by `build-smoke-page.mjs`, with a
  message naming the missing check.
- A sidecar containing a control character other than tab or newline is rejected; one containing
  tabs and newlines only is accepted.
- A `Section N` or `Step N` reference with no matching section or step is rejected; a resolving
  reference is accepted.
- The gate specified in `execution-models.md`, baked in `templates/00-READBEFORE.md` and enforced
  by the builder describe the SAME gate — a sidecar authored from the contract passes the builder.
- `orchestrate/references/smoke-page.md` states that a hand-over command is verified only when
  executed in the form the reader receives it, and requires embedded commands to carry no
  backslashes and no control characters.
- `tests/smoke-page.test.cjs` is green, and its existing assertions still test what they tested
  before — the fixtures gained a containment check, they did not lose coverage.
- Every new rejection rule has a paired positive control.
- Failing-on-base: each of the three rejection tests FAILS against the unmodified builder (it
  accepts all three bad sidecars). Name them in the implementer report.
- `orchestrate/references/subagent-prompts.md` is NOT modified. If the BL-017 rule cannot be
  written without it, the batch reports `NEEDS_FENCE`.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

Every step below is `Runner: agent`: this change edits files in this repository and nothing
else, so no step needs a device, a GUI, held credentials or a look-and-see judgement. They
aggregate into C1’s combined page, where they are pre-verified before hand-over. No section
here touches user data.

### Step 1

- **Do**: Feed `build-smoke-page.mjs` a sidecar whose gate carries no containment check.
- **Pass**: The builder rejects it and names the missing check. Before this change it built the page happily, which is how the gate came to resolve to eyeballing.
- **Runner**: `agent (Node CLI)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.

### Step 2

- **Do**: Feed the builder a sidecar carrying a U+0000 inside a copyable command, and a second one carrying a `Section 5` reference with no section 5.
- **Pass**: Both are rejected. These are two of the three structurally detectable defects that shipped in the previous checkpoint page.
- **Runner**: `agent (Node CLI)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.

### Step 3

- **Do**: Feed the builder a well-formed sidecar carrying a containment check, tabs and newlines, and only resolving cross-references.
- **Pass**: It is accepted and the page builds. The positive control proves the three rejections above are not rejecting everything.
- **Runner**: `agent (Node CLI)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.

### Step 4

- **Do**: Read C1’s own gate on the page you are reading this from.
- **Pass**: It carries `git merge-base --is-ancestor` as an executable command, not prose asking you to compare two SHAs by eye. This page is the fix, dogfooded.
- **Runner**: `agent (read)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.
