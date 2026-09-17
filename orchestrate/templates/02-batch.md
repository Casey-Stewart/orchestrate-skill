# B{{BATCH_NUM}} — {{BATCH_TITLE}} ({{BATCH_TYPE}}, {{BATCH_VERSION}})

**Branch**: `{{BATCH_BRANCH}}` (cut from the integration tip when the wave opens)
**Wave**: {{BATCH_WAVE}} · **Weight**: {{BATCH_WEIGHT}}
**Depends on**: {{BATCH_DEPS}}
**Smoke gate**: {{BATCH_SMOKE_GATE}}
**Files** (the fence — modify NOTHING else; need more? report `NEEDS_FENCE`): {{BATCH_FILES}}
**Applicable guardrails**: {{BATCH_GUARDRAILS}}
**Spec**: [01-plan.md](01-plan.md) §B{{BATCH_NUM}} · **Gate**: fence check → {{BATCH_GATE}}

## Implementation notes

<!-- The VERBATIM spec/finding/feature text plus every codebase fact gathered at planning
     time: file:line references, existing helpers to reuse, decisions the user already
     made, known traps. Backlog fold-ins appear as their own sub-heading with the item's
     id and verbatim backlog text. This section is AUTHORITATIVE — implementers work from
     it alone and must not re-derive scope from the original request or external docs. -->

## Checklist

<!-- - [ ] one box per concrete deliverable, in implementation order; fold-in items are
     marked `[<id>]` and get their own commit. Implementers tick these as they complete
     them (the reconcile table reads them) and append `- [ ] polish: <ask>` lines only
     when the orchestrator sends a polish pass. Nothing else in this file is theirs to
     edit. -->

## Acceptance criteria

<!-- Verifiable statements the reviewer checks against the actual diff — behaviors and
     invariants, not restatements of the checklist. For a `fix` batch, name the test that
     must FAIL on the un-fixed code (the failing-on-base check runs it). -->

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

<!-- Steps the USER or the QA RUNNER performs, written against the smoke procedure in
     00-READBEFORE.md. NOT run after this batch alone: they aggregate into the
     covering checkpoint's combined smoke page (data-touching sections first), so
     author each step in the page's field vocabulary:
     - Do: one action, imperative, naming the exact UI ("Press Edit… on a supplier").
     - Pass: the acceptance criterion — what the user sees when it works, kept apart
       from Do.
     - Runner: `agent` (executable in THIS repo's environment by a runner the contract
       lists — say which) or `human` (hardware, credentials, feel, another OS, live
       data). Default human. Agent steps are pre-verified before the hand-over.
     - Aside (optional): warning or context ("Enter cancels here — click the button").
     - Counting (optional): when Pass checks a number, define ONE unit in the user's
       words ("One unit = one purchase order").
     - Tag (optional): short hazard label ("Scanner safety").
     Once per batch, if applicable: "You need" (test data / hardware / accounts),
     "Order matters" (cross-step constraints), "Touches your data" (flag — these
     sections run FIRST in the combined script and are human unless the contract names
     a disposable environment). -->
