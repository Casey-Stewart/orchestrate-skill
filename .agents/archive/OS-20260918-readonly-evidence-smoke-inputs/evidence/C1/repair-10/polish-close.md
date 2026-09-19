# C1 repair-10 — polish close, conductor-independent verification

Polished tip: `af57f93ee80ebfaf76779e936603b01547316877` on `fix/B03-presmoke-10`
(parent `f2c2ceeb73a8adeee5dd2249a97df84bb1a19134`, the reviewed R1 SHIP).
Date 2026-09-19. Roles this session inherit Claude Opus 5; the Codex CLI is absent from
this environment, so the recorded GPT-6 Astra / xhigh tier could not be reproduced. Gate
shape unchanged.

## Why a fresh implementer, and what it was given

The predecessor polish agent crashed with the work uncommitted: two appended
`- [ ] polish:` items, both unticked, and a +56/-21 edit to
`c1-demo-instructions.test.cjs`. The §Recovery dirty-worktree row applies — resume with a
FRESH agent at the first unticked item. The draft was handed over explicitly as a DRAFT
to be proven by execution, never trusted.

## 6a fence check — PASS (run by the conductor, not taken from the implementer)

- `git status --porcelain` in wt-C1-repair: empty. No untracked files.
- `git diff --name-status -M f2c2cee..HEAD` (the polish diff): exactly two paths,
  `02-fix-B03-presmoke-10.md` (M) and `c1-demo-instructions.test.cjs` (M). Both are
  test/prose paths, so the frozen ordinary-polish MECHANICAL closure applies: no scoped
  re-review, no new FIX FIRST round, no production file touched.
- `git diff --name-status -M codex/readonly-evidence-smoke-inputs-ledger...HEAD` (the
  whole repair): exactly the seven approved fence paths plus the batch's own file. No
  extension, no rename endpoints outside the fence.
- Batch-file diff is ticks and appends only: the four spec items `[ ] -> [x]`, plus the
  two appended polish items, now `[x]`. 6/6. Nothing else in that file changed.
- The six reviewed source pages are BYTE-IDENTICAL to the reviewed `f2c2cee`, compared by
  blob id in the HEAD tree:
  - smoke-C1.json `34d8435ce7fca2df74864914c003d6b53b8d7f84`
  - smoke-C1.html `11eb470071ab64782c99bf74de6dd2463093e702`
  - smoke-C1-demo-before.json `c8a9b7e3d6ecc3bbc38b0c987264e8dcbed6c08d`
  - smoke-C1-demo-before.html `28187aeeb19041b91f2b0b94ae08a3bc5c195e9f`
  - smoke-C1-demo-after.json `8a60ffc18a27e4324d659a34acb8abbf32f75e27`
  - smoke-C1-demo-after.html `32cd3381c32f4ba41b5c403f23c32c8429e992c5`
  The reviewer's SHIP therefore still covers the exact artifacts it reviewed.

## 6b failing-on-base — PASS, re-verified independently on the POLISHED file

A repair is a `fix` batch, and the polish changed the test, so the proof was re-run rather
than inherited. Detached worktree at the repair base
`9b40054dfc9571af25267050640f66bc00e7e619`; per-worktree setup is `n/a`, so none was run.
Only the TEST-ONLY `c1-demo-instructions.test.cjs` was copied in — the base pages were
left untouched and verified clean, and no production code was imported.

`node --test --test-reporter=spec .agents/.../c1-demo-instructions.test.cjs`
→ exit **1**, tests 7, pass 1, fail 6, skipped 0.
Failure is by assertion on the named behavior, not a crash or setup error:
`AssertionError [ERR_ASSERTION]: the instructed route must expose the note field before
entering text` (actual true, expected false). The single pass is the test that documents
the unusable clean-Pass route, which correctly holds on the base as well.

Note: the scratchpad path could not host this worktree — checkout failed with
`Filename too long` on the ledger's deepest evidence paths. A short path was used instead
and removed afterwards.

## Surviving-mutation spot check — both ASKs genuinely closed

The two hunter ASKs existed because specific mutations survived 6/6. The conductor
re-applied them to disposable copies of the candidate (never to the worktree) and
re-ran the regression:

| mutation | before the polish | after the polish |
|---|---|---|
| A `wrong-prerequisite-verdict` (4 files: `mark demo step 1 Pass.` -> `Works, but.`) | survived, 6/6 pass | **exit 1**, tests 7, pass 4, **fail 3** — `AssertionError: both demo steps finish Pass` |
| C `stale-after-visible-instructions` (After HTML standfirst reverted, sidecar left correct) | survived, 6/6 pass | **exit 1**, tests 7, pass 6, **fail 1** — `AssertionError: emitted After introduction must match its corrected sidecar` |
| (unmutated candidate, after restoring both) | 6/6 pass | **exit 0**, tests 7, pass 7, fail 0 |

Mutation A fails at a runtime consequence (`t-pass === 2`), not at a prose literal, which
is what the hunter asked for. Mutation B (`wrong-note-step`) shares A's mechanism and the
implementer reported it failing identically; A was the one re-verified here.

The implementer additionally reported eight further mutations still failing, including an
escalation it found itself (C2: revert the After page AND its sidecar together, which
defeats HTML/sidecar equality alone but fails the derived export-claim assertion) and a
new class (I: the Before introduction drifting from its sidecar while the route stays
executable). Those are its own evidence, not re-verified here.

## Validation on the polished tip

Recorded in PROGRESS and LOG with exit codes; frozen recursive FullName-sorted Node
discovery, `git diff --check`, and the explicit ledger regression run separately because
the ledger-local test sits outside `tests/` by design.

## Out-of-fence observation carried forward, nothing changed

`evidence/C1/inputs/issue-001/recursive-discovery/tests/unit/discovery-sentinel.test.cjs`
is long enough that Git without `core.longpaths` cannot stat it, so every `git diff` and
`git diff --check` prints `Filename too long` to stderr while still exiting 0. The file is
NOT modified — index, HEAD and `f2c2cee` all carry blob `09ba9b63…` and the on-disk bytes
match. This predates this session. It also blocks checkout into long worktree roots, which
is why the base probe used a short path. Left alone: changing Git configuration is outside
every fence in this ledger and is the user's call.
