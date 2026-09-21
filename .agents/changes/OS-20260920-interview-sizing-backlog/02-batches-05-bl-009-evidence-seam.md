# B05 — A test seam for the unreachable evidence guards (fix, —)

**Branch**: `fix/bl-009-evidence-seam`
Cut from the integration tip when the wave opens.
**Wave**: 2 · **Weight**: M
**Depends on**: none — runs concurrently with B02, B03 and B04
**Smoke gate**: C1 (final, fully agent-run)
**Files**: `orchestrate/tools/git-evidence.mjs`, `tests/git-contract.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: `A whitelist pinned by sampling` · `A boundary pinned on one side only` · `An assertion satisfied by a neighbouring assertion’s output` · `A branch no input reaches` · `A test that pins the defect` · `A branch no input reaches`
**Spec**: [01-plan.md](01-plan.md) §B05 · **Gate**: fence check → failing-on-base + reviewer + test-hunter

## Implementation notes

### BL-009 — verbatim from `BACKLOG.md`

> Two fail-closed guards in `safeResolvedFilters()` (`orchestrate/tools/git-evidence.mjs`) are
> regression-unprotected, because **no fixture can reach them**: a corrupt `.git/index` fails
> BOTH `ls-files` calls, so the index inventory still returns `unknown` and a mutation survives;
> and real Git always emits exactly one `check-attr` record per input line, so the count guard is
> unreachable. Flipping either to `return true` leaves the suite green while making the helper
> report `clean` and then run `git status` — with a driver configured. Production is correct and
> fails closed; the hole is purely in coverage. Closing it needs a seam — export the record
> parser for a unit test, or allow a test to inject a failing probe — which changes a shipped
> tool’s surface and so needs its own batch.

### Codebase facts gathered at planning time

- `safeResolvedFilters()` is `orchestrate/tools/git-evidence.mjs:103`, called once from `:145`.
- The two unreachable guards are at `:110` and `:119` — confirmed by pre-flight against source.
- The live rejection path at `:124` IS reachable and IS covered: `tests/git-contract.test.cjs`
  exercises the `unsafe-filter` diagnostic.
- `tests/protocol-contract.test.cjs:252-263` executes the real `git-evidence.mjs`, and
  `tests/git-contract.test.cjs:159-162` pins the `--help` text verbatim.

### The constraint that shapes the seam

**Do not add CLI surface.** `orchestrate/references/protocol.md:150-156` publishes seven recipes
inside the span that is held byte-identical with `templates/00-READBEFORE.md`, and
`tests/protocol-contract.test.cjs:241` pins `recipes.length === 7`. A new subcommand or flag
would force edits to `protocol.md` and `00-READBEFORE.md` — both B04’s files in this same wave —
and would break that pin. The seam must be an internal export or an injected probe, invisible to
the CLI. The `--help` text must not change.

### What the fix must prove

A mutation of EITHER guard to `return true` must turn the suite red. That is the whole point:
production is already correct, so the deliverable is the test that would catch it becoming
incorrect. Per CLAUDE.md, *"if a mutation of the branch leaves the suite green, the branch is
untested however correct it is."* Demonstrate both mutations in the implementer report.

## Checklist

- [x] Add an internal seam — an export, or an injectable probe — that lets a test drive
      `safeResolvedFilters()` down the two guard paths, without adding any CLI subcommand or flag.
- [x] Cover the guard at `git-evidence.mjs:110`: the path where the index inventory cannot be
      obtained. Assert the helper reports `unknown` and does NOT run `git status`.
- [x] Cover the guard at `:119`: the record-count mismatch. Assert the same fail-closed outcome.
- [x] Add a live control so the absence of a marker means something — a case in which the helper DOES
      proceed, so "status was not run" is a real observation rather than a fixture that could never
      have run it.
- [x] Confirm the `--help` text and the seven published recipes are byte-unchanged.
      Prove failing-on-base: name, in the report, the exact assertion that goes red when run
      against the code and documents at this batch’s base.
- [x] Run the validation commands from [00-READBEFORE.md](00-READBEFORE.md); all green.
- [x] `git diff --name-status -M chore/interview-sizing-backlog-ledger...HEAD` plus `git status --porcelain`;
      revert anything outside the fence.
- [x] Commit on `fix/bl-009-evidence-seam` — `fix: a test seam for the unreachable evidence guards (batch 05)`.
- [x] polish: R1 P1 — `if (!attributes.ok)` is a third guard of the same class in the same
      function, unreachable from any repository and green under `return true`. Closed with the
      smallest injection the checklist already contemplated: `options.failProbe` names a
      subcommand this function must read as failed. Both unreadable-probe refusals are now
      watched through the walk itself, with a live control in the same repository.
- [x] polish: R1 ASK — the case labelled "records without the terminating NUL" was refused by
      the count half of the guard, never the terminator half. Every case now names the half
      that holds it, and the terminator half has an input whose field count matches exactly.
      Also closed the two smaller notes: the probe test compares `repo.snapshot()` either side,
      and the name and value guards pin an odd interior record, not only first and last.
- [x] polish: R2 ASK-1 — `degradedProbe` dereferenced `options.failProbe` with no default, so
      `safeResolvedFilters(repo, diagnostics)` threw where it had returned `true`. Every other
      helper in the module defaults that argument; this one now does too (`options = {}`).
- [x] polish: R2 ASK-2 — the 12-value seam sweep was itself pinned by sampling: deleting a
      member from the domain and from the expectation together stayed green. The domain now
      carries a size and a no-duplicates assertion, and the partition is pinned by counting the
      `git-probe` verdicts, so neither list can shrink silently.
- [x] polish: R2 ASK-3 — ASK-1 was a production fix with no test, which is the same vacuity
      shape it was fixing. `safeResolvedFilters(repo.cwd, [])` now pins the optional third
      argument, with the determinism argument recorded beside it: that fixture's path is
      tracked and its attribute committed, so the fallback to `process.env` cannot make the
      verdict depend on ambient Git configuration. Removing `= {}` reddens it.
- [x] polish: R3 ASK-1 — that comment said "every other helper", which is false of the two
      module-private ones (`provenanceOptions:50`, `safeStatusPrerequisites:153`, which
      dereferences `options.env`). Restored the qualifier the report had and the comment had
      lost: "every other EXPORTED helper". True of `git:18`, `capture:32`,
      `ancestryCaptured:40`, `readBlob:222`, and of nothing it now claims.
- [x] polish: R3 ASK-2 — the arity assertion discarded its diagnostics, so any refusal
      satisfied it, including one caused by ambient breakage rather than the attribute. It
      now reads the diagnostic too (`['unsafe-filter']`), so a broken probe cannot pass as
      the verdict the fixture exists to reach. Test-only; no production file was touched.

## Acceptance criteria

- Mutating either guard at `git-evidence.mjs:110` or `:119` to `return true` turns the suite RED.
  Both mutations are demonstrated in the implementer report.
- Neither the `--help` output nor the set of published recipes changes; `recipes.length === 7`
  still holds and the §Read-only evidence tools mirror is untouched.
- The new tests include a positive control in which the helper proceeds, so the fail-closed
  assertions are not satisfied by a fixture that could never have proceeded anyway.
- The existing reachable `unsafe-filter` coverage is unchanged and green.
- Failing-on-base: the guard tests FAIL against the un-seamed tool (they cannot reach the branch).
  Name them in the implementer report.

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

- **Do**: Run the full suite and confirm the two `safeResolvedFilters()` guard paths are exercised.
- **Pass**: Both guards have coverage, and the implementer report records that mutating either to `return true` turns the suite red.
- **Runner**: `agent (Node CLI)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.

### Step 2

- **Do**: Confirm the evidence tool’s published surface did not change: `--help` text byte-identical, seven recipes.
- **Pass**: No CLI subcommand or flag was added, so the mirrored §Read-only evidence tools span is untouched.
- **Runner**: `agent (Node CLI)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.
