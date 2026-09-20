# Step 10 — read the prior evidence summary (re-run)

## Command

```
cat .agents/changes/OS-20260919-backlog-sweep/evidence/C1/summary.md   -> exit 0
ls -1 .agents/changes/OS-20260919-backlog-sweep/evidence/C1/           -> step-01..step-10, summary.md
```
Spot-checked `step-03.md` in full.

## Pass line, clause by clause

| Clause | Observed | Met |
| --- | --- | --- |
| Ten verdicts recorded | table of steps 01-10 | yes |
| Two are marked FAIL | steps **05** and **06** in that table; `8 PASS, 2 FAIL, 0 BLOCKED, 0 COULD-NOT-RUN` | yes |
| Both are defects in the smoke script, not the build | summary states this for both and argues it | yes |
| Both have since been corrected | verified against the current page, see below | yes |
| Everything else passed | 8 PASS, no BLOCKED, no COULD-NOT-RUN | yes |

### Both corrections verified in the current page

- Old step 05 (a live `check-fence.mjs` run expected to return `"status":"PASS"`; it
  returned `UNKNOWN`/exit 2 because the batch worktrees were gone) is no longer a step at
  all. It survives only as prose in the current Step 3 aside, with an explicit
  "Do not try to reproduce that one now". Correction confirmed.
- Old step 06 (asserted the quoted sentence `Fence PASS (manual — helper UNKNOWN, see LOG
  R2/R3)` on **all three** of the previous ledger's rows; it is on two) is now the current
  Step 4, reworded to "two read … and the third `Fence PASS (manual, extended fence)`".
  Correction confirmed, and independently re-verified by my own Step 4 run.

## Serious cross-reference defect this step creates

**The prior evidence uses a different step numbering from the page that cites it, and the
page does not say so.** The draft that produced `summary.md` had a different step order.
The mapping is:

| summary.md step | current page step |
| --- | --- |
| 05 (**FAIL**) | removed — now prose in Step 3's aside |
| 06 (**FAIL**) | Step 4 |
| 07 (PASS, clone/archive RED) | Step 5 |
| 08 (PASS, nested definition RED) | Step 6 |
| 03 (PASS, BL-003 on this machine) | Step 1 |
| 09 (PASS, YAML forms + whitelist) | Step 7 |
| 10 (PASS, full validation) | Step 8 |

A reader who follows Step 10's instruction reads "Step 05 — FAIL" and "Step 06 — FAIL" and
will naturally map them onto the current page's Steps 5 and 6 — which are the two RED
steps, and which both PASS. The page's own Step 10 therefore points the reader at evidence
that appears to contradict the two most important results on the page.

## Spot-checks of the prior evidence

- `step-03.md` ran the **raw pipeline**, not the current Step 1's `node -e` summariser, and
  reported **365 paths** (347 `unspecified` + 18 `unset`), not the 375 the current Step 1
  aside attributes to a "pre-verified" run. The count legitimately drifts with untracked
  files; the point is that the current Step 1 command was never the command that was
  pre-verified.
- The summary's "Final `git status --porcelain`" lists `?? .../smoke-C1.md`. That file no
  longer exists — only `smoke-C1.html` and `smoke-C1.json` are present. Consistent with
  the draft having been superseded.
- The summary records the four definitions' hashes as `506fd1af`, `cea60eae`, `4da17a3f`,
  `414a8c68`. These do **not** reproduce under sha256 (`45977d29`, `f743e51f`, `f042965b`,
  `37398da4`), md5 (`587296bd`, `aed21ef9`, `b8b11422`, `f14874f5`) or sha1 (`01ce152e`,
  `4d3381e5`, `ff5aaa98`, `86e2c3ef`). Algorithm unstated and unidentified. Low importance
  — Step 9 independently proves the files byte-identical to `e79d378` — but the quoted
  hashes are not reproducible as recorded.
- The summary's observation that B01's PROGRESS row was stale is now resolved: B01's row
  at `PROGRESS.md:38` records `Merged **e79d378**, tip green **260/260**`.

## Verdict

PASS — ten verdicts are recorded, exactly two are FAIL, both are smoke-script defects rather than build defects, both have since been corrected in the current page, and everything else passed.
