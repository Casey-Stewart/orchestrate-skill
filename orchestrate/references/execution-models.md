# Execution model — the waved stack

One model, structured at scaffold time and recorded in the ledger's READBEFORE (git
model section) and PROGRESS preamble: batches are grouped into **waves** that run
concurrently, waves stack serially onto an **integration branch**, and the user
smoke-tests only at planned **checkpoints**. Strict one-at-a-time sequencing is just
the degenerate case (every wave width 1) — it is not a separate model.

## The three structures

- **Wave** — a set of batches that run AT THE SAME TIME: one implementer per batch,
  each in its own git worktree on its own branch. Two batches may share a wave only
  if ALL hold:
  1. Neither depends on the other, directly or transitively.
  2. Their file fences are disjoint. Version files, the changelog, and the ledger
     don't count against this — those are orchestrator-only, touched at integration,
     never by implementers.
  3. Neither carries an unresolved user gate (design approvals are settled at
     planning time or scheduled as wave 1).
- **Integration branch** — the scaffold branch `chore/<slug>-ledger` by default.
  Reviewed batch branches merge into it serially; it is the only branch that ever
  merges toward the default branch. Fence disjointness (plus PROGRESS living only on
  the integration branch and each batch ticking only its own batch file) makes these
  merges conflict-free by construction — an actual conflict means a fence was
  violated: stop and reconcile, never hand-resolve silently.
- **Checkpoint** — a planned STOP where the USER smoke-tests everything integrated
  since the last checkpoint, in one combined session. Between checkpoints the run is
  autonomous: implement → review → integrate → next wave, no user interaction.

## Building the wave map (planning time)

The planner doesn't just discover concurrency — it ENGINEERS it:

1. Draft the batches, then actively reshape fences for disjointness: pull a shared
   file into its own small "seam" batch that runs in an early wave; merge two batches
   that would fight over the same files; split a wide batch whose halves are
   independent.
2. Assign waves greedily: wave 1 = every batch with no dependencies, mutually
   disjoint; wave N = every remaining batch whose dependencies all land by wave N-1,
   mutually disjoint with its wave peers. A batch that fits several waves goes in the
   earliest.
3. Aim for the widest safe waves, not the largest batch count — 5 batches as "3
   concurrent, then 2 concurrent" beats 5 back-to-back whenever the fences allow it.
4. Record the map in the plan (Wave column + wave map section) with one line per wave
   on WHY its members are safe together. The user's plan approval IS the standing
   authorization to run each wave concurrently — no further waiver is needed mid-run.

## Placing checkpoints (planning time)

Manual smoke tests are scarce by design: the user tests at checkpoints, never per
batch or per wave by default.

- Classify every batch **hands-on** or **machine-verifiable**. Hands-on ("scary")
  means validations + code review genuinely cannot establish it works: visible UI/UX
  behavior, auth/payment/external-service flows, data migrations, destructive or
  hard-to-reverse operations, cross-cutting refactors of live paths — or anything the
  user should see working before more code stacks on top of it.
- Place ONE checkpoint after each wave that contains a hands-on batch.
- Always end with a final checkpoint covering every batch not covered earlier. If the
  only hands-on work sits in the last wave — or there is none — the final checkpoint
  is the ONLY one.
- The user confirms placement at plan approval and may add or remove checkpoints;
  record their choice. Never insert an unplanned mid-run smoke gate unless a wave
  surfaces something genuinely unforeseeable (record why in PROGRESS).

## Wave mechanics (run time)

1. **Open the wave**: from the integration tip, cut every member batch's branch;
   create one worktree per batch under the session scratchpad (never inside the
   repo); run the ledger's per-worktree setup; commit ONE PROGRESS flip on the
   integration branch (member rows → 🔄, branches named, wave base SHA in the session
   log). Spawn all implementers in a single message so they run concurrently.
2. **Review as they land**: each finished batch gets its own independent read-only
   reviewer immediately (diff three-dot against the integration branch, which
   isolates the batch's own changes); don't wait for the wave's slowest batch. Fix
   rounds per batch as usual, max 2 → ⛔.
3. **Integrate serially**: each batch that passes review merges into the integration
   branch (orchestrator only; row → 🟢). Version/changelog work happens here or at
   the checkpoint per the ledger's cadence — implementers never touch either.
4. **Close the wave** when every member is 🟢 or ⛔: remove the worktrees. A ⛔ batch
   is left out of integration, its dependents stay ⬜-blocked, and it is surfaced at
   the next STOP.
5. **Checkpoint or continue**: if the wave map places a checkpoint here →
   per-checkpoint close-out, covered rows 🟢 → 🧪, STOP with the combined smoke
   script, delivered as the smoke page (`smoke-page.md`). Otherwise → open the next
   wave immediately, same session.

**Before handing over ANY checkpoint script, make the build identifiable.** Bump the
version on the integration branch so it differs from the base branch's, and open the
script with (a) the terminal command that prints the current branch, (b) the version
she should see, and (c) a **canary** — one cheap step whose result is OPPOSITE on the
base build, run FIRST, with "if it behaves the old way, stop and say so". On the smoke page this
is Step 0 — the gate, a non-verdict section rendered before every verdict step.
A script whose every step passes on the base build cannot detect that it ran against
the base build. This is not hypothetical: a pack that deferred its single bump to
close-out handed over a script saying "confirm the version reads X" when the base
branch also read X; the checkout had silently never happened, the user ran all twenty
steps against the base, and reported the un-fixed defects as failures. Note which
batch appeared to "pass" — the one whose steps deliberately exercise behaviour the fix
must NOT disturb. Those steps pass on old code by design, so they are the ones most
likely to disguise a wrong-tree run.

## Degenerate cases

- Every fence overlaps → every wave has width 1 → the run is sequential, still with
  minimal checkpoints. Nothing else changes.
- The repo versions per batch → bumps happen serially at each integration merge, so
  they never collide even inside a wave.
- No sub-agent support → the orchestrator implements a wave's batches one at a time
  in the main checkout (worktrees unnecessary); the wave map still decides what may
  proceed without a checkpoint in between.

## Changing the map mid-change

Allowed with the user's explicit sign-off: record the change + rationale in the
PROGRESS preamble and a Session log row. Typical causes: a ⛔ batch forces
re-planning its dependents; a checkpoint failure reveals a batch was scarier than
classified (add a checkpoint after its fix-up).

## Legacy models

Ledgers scaffolded before the waved stack may name **strict sequential**, **linear
stack**, or **stacked waves** as their execution model, and typically smoke-gate
every batch. Drive them under their OWN contract — never rewrite one onto this model
without the user asking.
