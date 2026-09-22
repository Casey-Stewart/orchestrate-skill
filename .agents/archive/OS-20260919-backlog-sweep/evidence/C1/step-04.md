# Step 04 — The refusal side still holds

**Runner**: agent

## Command

The full validation recipe from Section 5, run verbatim from the repository root via
`powershell.exe -NoProfile -ExecutionPolicy Bypass -File <recipe>.ps1`:

```powershell
$testFiles = @(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName)
if ($testFiles.Count -eq 0) { throw 'No Node test suites discovered' }
node --test --test-reporter=spec @testFiles
if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }
```

This is run **A**, the baseline green run; steps 9 and 10 read the same run's output.
Discovered **9** test files. Wall clock 229 s.

**Exit codes**: `node --test` → `0`; `git diff --check` → `0`; recipe overall → `0`.

## The three named results

Grepped out of the spec-reporter output by exact name:

```
runA.log:200:✔ configured clean and process filters never execute through API or actual CLI status probes (7598.8643ms)
runA.log:226:✔ global clean filters remain unknown and never execute through API or actual CLI (3142.9104ms)
runA.log:165:✔ configured filters leave the fence UNKNOWN without executing a command or changing bytes (4906.0804ms)
```

All three carry the `✔` pass marker. Line 197 also shows `▶ configured clean and process
filters never execute through API or actual CLI status probes` — the suite opener for that
test — so it is a real executed test, not a name matched inside some other string.

A scan of the whole 288-line log for any failure marker (`✖` / `not ok`) returns nothing.

| Expected | Observed | Met |
| --- | --- | --- |
| `configured clean and process filters never execute through API or actual CLI status probes` passes | `✔` | yes |
| `global clean filters remain unknown and never execute through API or actual CLI` passes | `✔` | yes |
| `configured filters leave the fence UNKNOWN without executing a command or changing bytes` passes | `✔` | yes |

## Counting

One unit = one named test. **Expected three, found three, all passing.** Each name occurs
exactly once as a result line.

Worth noting for the orchestrator: these three are among the slowest tests in the suite
(7.6 s, 3.1 s, 4.9 s). They spend that time in real CLI status probes rather than mocks,
which is the behaviour the step is asserting — the refusal is exercised against an actual
`git` invocation, not a stub.

## Verdict

PASS — all three named refusal tests pass in the full recipe, so the helper still refuses when a path does resolve to a filter.
