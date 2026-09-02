# B{{BATCH_NUM}} — {{BATCH_TITLE}} ({{BATCH_TYPE}}, {{BATCH_VERSION}})

**Branch**: `{{BATCH_BRANCH}}` (cut from the integration tip when the wave opens)
**Wave**: {{BATCH_WAVE}}
**Depends on**: {{BATCH_DEPS}}
**Smoke gate**: {{BATCH_SMOKE_GATE}}
**Files** (the fence — modify NOTHING else): {{BATCH_FILES}}
**Spec**: [01-plan.md](01-plan.md) §B{{BATCH_NUM}} · **Reviewer pass required**

## Implementation notes

<!-- The VERBATIM spec/finding/feature text plus every codebase fact gathered at planning
     time: file:line references, existing helpers to reuse, decisions the user already
     made, known traps. This section is AUTHORITATIVE — implementers work from it alone
     and must not re-derive scope from the original request or external docs. -->

## Checklist

<!-- - [ ] one box per concrete deliverable, in implementation order.
     Implementers tick these as they complete them (the reconcile table reads them). -->

## Acceptance criteria

<!-- Verifiable statements the reviewer checks against the actual diff — behaviors and
     invariants, not restatements of the checklist. -->

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢).

## Smoke (checkpoint)

<!-- Numbered steps the USER performs by hand, written against the smoke procedure in
     00-READBEFORE.md. Each step states the expected outcome. Include setup
     preconditions (accounts, hardware, test data) the user needs. These steps are NOT
     run after this batch alone: they are aggregated into the covering checkpoint's
     combined script, hands-on batches first. -->
