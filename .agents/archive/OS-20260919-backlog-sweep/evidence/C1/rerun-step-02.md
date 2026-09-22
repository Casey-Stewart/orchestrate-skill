# Step 2 — the refusal half of the BL-003 fix still binds (re-run)

## Command

The full validation recipe (Section 4, Step 8) — cross-reference resolves correctly;
Section 4 is "The whole build" and its Step 8 is the recipe. Run once, read three times
(steps 2, 7 and 8 all read this one run).

```powershell
$testFiles = @(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName)
node --test --test-reporter=spec @testFiles
```
**Exit 0**, 260 pass / 0 fail.

## The three named tests

| Test | Line in output | Result |
| --- | --- | --- |
| `configured clean and process filters never execute through API or actual CLI status probes` | 196/199 | PASS (8496ms) |
| `global clean filters remain unknown and never execute through API or actual CLI` | 225 | PASS (3921ms) |
| `configured filters leave the fence UNKNOWN without executing a command or changing bytes` | 164 | PASS (5603ms) |

All three green. The first is a parent with two subtests (`clean`, `process`), so its name
appears four times in spec output; the pass line "One unit = one named test; expect three"
disambiguates that correctly — three named units, as required.

## Verdict

PASS — all three refusal tests are present and green in the recipe's output, exactly three named units.
