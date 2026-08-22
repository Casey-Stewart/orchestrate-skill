# Execution models

Chosen once at scaffold time, recorded with rationale in the ledger's READBEFORE (git
model section) and PROGRESS preamble. Two facts from the plan's batch table drive the
choice: do the file fences overlap, and does every close-out touch the same
version/changelog files?

## Decision table

| Situation | Model |
|---|---|
| Default; fences overlap; or any doubt | **Strict sequential** |
| Repo versions per batch, so every close-out touches the same version files | **Linear stack** |
| Fences fully disjoint AND close-outs don't collide (or close-out deferred to the end) | **Stacked waves** — eligible, still needs the user's explicit waiver of the sequential gate |

## Strict sequential (default)

Each batch branches from the default branch only after every earlier batch is ✅. One
branch, one review, one smoke, one merge per batch. Slowest cadence, zero merge
conflicts by construction, and the user sees each change in isolation.

## Linear stack

For repos where every batch close-out bumps the same version/changelog files — parallel
branches from the default branch would all conflict there on merge.

- Batch 00 = ledger scaffolding, committed on `chore/<slug>-ledger` — the stack base.
- Each batch branch is cut from the PREVIOUS batch's tip; every batch carries its own
  close-out commit (version bump + changelog + ledger flip).
- The user smoke-tests — often ONE combined session over the whole stack — then
  fast-forward merges the default branch up to the LAST PASSING batch tip.
- A failing batch stops the ff there: fix-ups land on that batch's branch; later batches
  rebase onto the fixed tip.
- The reviewer diffs each batch against the PREVIOUS batch's tip, not the default branch.

## Stacked waves

File-disjoint batches run CONCURRENTLY: one implementer per batch, each in an isolated
git worktree under the session scratchpad (never inside the repo; run the ledger's
per-worktree setup; revert lockfile/derived-file churn before committing). Work
integrates onto a `wave/N-<slug>` branch for ONE combined smoke and ONE merge.

- Requires the user's explicit waiver of the sequential gate, recorded verbatim in
  PROGRESS before the wave starts.
- The plan marks which batches are file-disjoint and wave-safe; only those may share a
  wave.
- On a waiver, copy the freshest ledger state from the unmerged branch into the new
  branch's first commit and accept the trivial single-file ledger merge later.
- Close-outs happen once at wave integration (or per batch if version files don't
  collide).

## Changing model mid-change

Allowed with the user's explicit sign-off: record the switch + rationale in the PROGRESS
preamble and a Session log row. In practice: a bug-review change
started strict sequential and finished in waves; a UX fix pack ran a linear stack end to
end because each of its seven batches shipped its own version.
