# C1 smoke — summary

**Change**: OS-20260919-backlog-sweep
**Build**: `chore/backlog-sweep-ledger` at `e79d378` (`e79d3781b9290d54b6c4996989d7b19b6b358422`)
**Run**: 2026-09-20, agent, hands-off, all ten steps executed in order
**Machine**: Windows 11, `git version 2.52.0.windows.1`, Windows PowerShell 5.1

## Verdicts

| Step | What it checks | Verdict |
| --- | --- | --- |
| 01 | The canary — `git-evidence.mjs worktrees` | **PASS** |
| 02 | Confirm the tree — branch and commit | **PASS** |
| 03 | BL-003's situation is real on this machine | **PASS** |
| 04 | The refusal side still holds (three named tests) | **PASS** |
| 05 | The real fence reads this very ledger | **FAIL** |
| 06 | The record shows the mechanical gate was used | **FAIL** |
| 07 | The archive guard can fail (throwaway clone) | **PASS** |
| 08 | A nested definition is caught | **PASS** |
| 09 | YAML-invalid forms rejected, whitelist pinned both ways | **PASS** |
| 10 | Full validation — 260 pass, 0 fail | **PASS** |

**8 PASS, 2 FAIL, 0 BLOCKED, 0 COULD-NOT-RUN.**

Neither FAIL is a defect in the shipped code. Both are defects in the smoke script's
stated expectations. Details below.

## The two failures

### Step 05 — the fence cannot return PASS any more, for an environmental reason

Expected `"status":"PASS"`, exit 0, empty `violations` and `unknowns`. Got
`"status":"UNKNOWN"`, exit **2**, `violations: []`, and one unknown:

```json
{"code":"candidate-worktree","message":"Exactly one associated candidate worktree is required"}
```

`check-fence.mjs:151-155` requires exactly one live worktree checked out on the batch
branch. `git worktree list` shows only the main checkout (on the integration branch) and
an unrelated stale `wt-int`. `PROGRESS.md` row B02 records the worktree this run used —
`worktree <temp>/wtbls/b02` — and it was removed when B02 merged.

The script's Aside anticipated the *branches* being deleted ("Run this before they are
deleted") but not the *worktrees*, and the worktrees are what is already gone. Also,
`mergeBase` now equals `batchSha` exactly — the batch is already an ancestor of the
integration branch, so this gate is being run after the merge it was written to gate, and
the diff it grades is empty.

**BL-002 itself is fine.** The `Duplicate or malformed batch IDs` diagnostic the Aside
names as the disqualifying outcome did **not** appear, and `allowedPaths` came back
populated with all six fenced paths — an assignment reached only after `oneRow()` matched
the `B02` row in **both** `01-plan.md` and `PROGRESS.md` and branch linkage agreed. The
batch-ID grammar parsed correctly. Under the Aside's looser wording this result "would
do"; under the stated Pass line it does not, and the Aside's flat assertion that "this
build returns a clean PASS" is false as the repository now stands.

**Missing prerequisite**: a clean worktree on `refs/heads/fix/ledger-batch-id-grammar` at
`da95cf0`. Not created — `git worktree add` writes into `.git/worktrees/` and would leave
this repository other than it was found.

### Step 06 — the quoted sentence is on two of three rows, not all three

The step asserts the previous ledger records `Fence PASS (manual — helper UNKNOWN, see LOG
R2/R3)` on **all three** of its rows. `grep -c` returns **2**. Row 03 reads
`Fence PASS (manual, extended fence)`.

The substance survives: all three of the previous ledger's rows are *manual* fences and
none is mechanical, so the before-picture BL-002 describes is intact, and this ledger does
carry a genuine mechanical result. Only the quoted string is wrong. This is a wording bug
in `smoke-C1.md`, not a repository problem.

## WORKS-BUT and things no step asked about

- **WORKS-BUT (step 06): only one of this ledger's three rows records a mechanical fence.**
  B02 has `Mechanical fence PASS — 0 violations, 0 unknowns, the first in this repo's
  history`. B01 and B03 record `Fence PASS (manual)`. B03's row gives a reason (the helper
  was UNKNOWN pre-merge — BL-003 itself). B01's gives none, even though B02 had already
  proved the mechanical fence works on this repo by the time B01 merged. The step's
  condition is unquantified so this is not a failure, but "the record shows the mechanical
  gate was used" is thinner than the wording implies.

- **B01's `PROGRESS.md` row is stale.** Status `🔄`, Updated `2026-09-19`, Notes ending at
  `R3: fresh implementer, strong tier, P1 + 7 ASKs`, **no** `Merged` SHA and no tip count —
  yet B01 is merged and is the current HEAD (`e79d378 Merge B01: agent-definition guards
  that can actually fail (batch 01)`). B02 and B03 both record `Merged **bbc63bb**` /
  `Merged **6766642**` with tip counts. The ledger is missing the record of its own last
  merge. This also makes step 10's "base was 207 … adds 53" unverifiable from the ledger:
  the +43 attributable to B01 has to be inferred from the observed 260.

- **Step 01 passed for a slightly richer reason than stated.** The main worktree came back
  `dirty` rather than `clean`, because of untracked files. That is inside the Pass
  condition ("`clean` or `dirty`, never `unknown`") and is the stronger of the two: it
  shows the helper actually reached and parsed a real `git status` rather than degrading.

- **Step 09's one-line description of the whitelist sweep compresses a detail.** It says
  the sweep checks 95 printable ASCII against the 18 YAML defines. TAB is one of the 18
  and is `0x09`, outside the printable range, so the loop covers 17 of the 18 and TAB gets
  its own assertion at `tests/agent-definitions.test.cjs:269`. The set is still pinned both
  ways in full; the test comments on this itself. Not a defect, recorded for accuracy.

- **Step 03's LFS filter is genuinely present**, so step 01's clean result is load-bearing
  rather than vacuous. The Aside's escape hatch ("if the first command returns nothing …
  say so rather than recording a pass") was not needed. `git lfs install` was not run.

- **Not verified, and not asked for**: step 10's Aside claims `node --test tests/` fails
  where bare `node --test` works. Not tested — it is a note on method, not a pass
  condition, and would have cost another four-minute run.

## Both RED steps went genuinely red

The two steps that had to break the suite did break it, each with exactly one failure and
exactly the named test:

| Step | Failure induced | Test that fired | Totals |
| --- | --- | --- | --- |
| 07 | one line deleted from the archive READBEFORE, **in a throwaway clone** | `reusable artifacts contain no local Python installation default, while frozen ledger retains its environment fact` (`protocol-contract.test.cjs:117`) | 259 pass / 1 fail |
| 08 | `.claude/agents/subdir/orchestrator.md` created | `the directory holds exactly the four known definitions` (`agent-definitions.test.cjs:373`) | 259 pass / 1 fail |

Both returned to **260 pass / 0 fail** after restore. In step 08 the offending path
`subdir/orchestrator.md` appears in the assertion **message itself**, ahead of deepEqual's
diff — which is precisely what the B01 polish item P1 was opened to fix, so that fix is
confirmed by execution. In step 07 the assertion is a `0 !== 1` occurrence count naming
the file and the missing sentence, and the Excel sentence was used rather than the
`Python310` line, as the Aside requires (verified: Excel sentence occurs once, `Python310`
occurs on 5 lines).

## Safety and cleanup

- `.agents/archive/` in **this** repository: never modified. Step 07 ran in
  `%TEMP%\os919c1`, which was removed (`Test-Path` false afterwards).
  `git status --porcelain -- .agents/archive/` is empty; the file is still 1044 lines with
  the Excel sentence present.
- Nothing written to `~/.claude/agents/`. No global or system Git configuration touched.
  `git lfs install` not run. Nothing installed.
- The four tracked agent definitions were hash-identical before, during and after step 08:
  `506fd1af`, `cea60eae`, `4da17a3f`, `414a8c68`.
- No branch switched, no commit, no push, no merge, no worktree added.
- Temporary files live in the session scratchpad only.

## Final `git status --porcelain`

```
?? .agents/changes/OS-20260919-backlog-sweep/evidence/
?? .agents/changes/OS-20260919-backlog-sweep/smoke-C1.md
```

`smoke-C1.md` was already untracked before this run began. `evidence/` is this run's own
output, written where the task authorises it. Nothing else changed.
