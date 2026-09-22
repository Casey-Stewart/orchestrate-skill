# Step 06 — The record shows the mechanical gate was used

**Runner**: agent

## Commands

```
sed -n '38p;39p;40p' .agents/changes/OS-20260919-backlog-sweep/PROGRESS.md              # this ledger's batch rows
sed -n '42p;43p;44p' .agents/changes/OS-20260919-agent-tool-restrictions/PROGRESS.md    # previous ledger's batch rows
grep -c "Fence PASS (manual — helper UNKNOWN, see LOG R2/R3)" .agents/changes/OS-20260919-agent-tool-restrictions/PROGRESS.md
```

All exit `0`. This step is a read only; nothing was modified.

## This ledger — fence text in each batch row's Notes cell

| Row | Status | Fence text in Notes |
| --- | --- | --- |
| B01 | 🔄 | `Fence PASS (manual)` |
| B02 | 🟢 | `Fence PASS (manual)` **and** `Mechanical fence PASS — 0 violations, 0 unknowns, the first in this repo's history` |
| B03 | 🟢 | `Fence PASS (manual — the helper was UNKNOWN pre-merge, BL-003 itself)` |

So this ledger **does** record a mechanical fence result — on **one** of its three rows
(B02). B01 and B03 record manual fences only, each for a stated reason: B03 because the
helper was still UNKNOWN before its own fix merged, B01 with no reason given.

## Previous ledger — the "before picture"

```
$ grep -c "Fence PASS (manual — helper UNKNOWN, see LOG R2/R3)" .../OS-20260919-agent-tool-restrictions/PROGRESS.md
2
```

Row by row:

| Row | Fence text in Notes |
| --- | --- |
| 01 | `Fence PASS (manual — helper UNKNOWN, see LOG R2/R3)` |
| 02 | `Fence PASS (manual — helper UNKNOWN, see LOG R2/R3)` |
| 03 | `Fence PASS (manual, extended fence)` |

## Pass conditions, checked one at a time

| Condition | Observed | Met |
| --- | --- | --- |
| this ledger records mechanical fence results | yes — B02's row, verbatim | yes |
| previous ledger records `Fence PASS (manual — helper UNKNOWN, see LOG R2/R3)` on **all three** of its rows | on **two** of three; row 03 reads `Fence PASS (manual, extended fence)` | **no** |

## What this means

The **substance** of the step holds: every one of the previous ledger's three rows is a
*manual* fence, none is mechanical, so the damage BL-002 describes is intact as the before
picture, and this ledger contrasts with it by carrying a real mechanical result. The
**letter** does not: the script quotes one specific sentence and asserts it on all three
rows, and row 03 carries a different manual-fence phrasing. The fault is in the smoke
script's wording, not in the repository — no build behaviour is implicated.

## Observation the step did not ask for

B01's row is stale. Its Status cell is `🔄`, its Updated cell is `2026-09-19`, and its
Notes end at `R3: fresh implementer, strong tier, P1 + 7 ASKs` with **no** `Merged` SHA —
yet B01 is merged, and it is the current HEAD:

```
$ git log --oneline --merges -3
e79d378 Merge B01: agent-definition guards that can actually fail (batch 01)
bbc63bb Merge B02: pin Bnn batch ids in the ledger templates, revive the archive guard (batch 02)
6766642 Merge B03: gate status on resolved per-path filter attributes (batch 03)
```

B02 and B03 both record `Merged **bbc63bb**` / `Merged **6766642**` and a green tip count.
B01 records neither, and never got a mechanical fence recorded even though B02 had already
proved the mechanical fence works on this repo. The record of the run's last merge is
missing from the ledger the run is being judged on.

## Verdict

FAIL — this ledger does record a mechanical fence result (B02), but the previous ledger carries the quoted sentence on only two of its three rows, not all three, so the step's stated condition is literally false (the substance is intact; the error is in the script's wording, not the build).
