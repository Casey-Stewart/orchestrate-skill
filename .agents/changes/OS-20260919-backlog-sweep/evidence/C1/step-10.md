# Step 10 — Full validation

**Runner**: agent

## Command

Executed verbatim from the repository root via
`powershell.exe -NoProfile -ExecutionPolicy Bypass -File <recipe>.ps1`, the only additions
being `Write-Output` markers that echo `$LASTEXITCODE` (a cmdlet, so it does not disturb
`$LASTEXITCODE`) — the control flow, the `throw`s and the arguments are unchanged:

```powershell
$testFiles = @(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName)
if ($testFiles.Count -eq 0) { throw 'No Node test suites discovered' }
node --test --test-reporter=spec @testFiles
if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }
```

Discovery found **9** files, so the `throw 'No Node test suites discovered'` guard did not fire:

```
tests\agent-definitions.test.cjs          tests\protocol-contract.test.cjs
tests\build-smoke-page.test.cjs           tests\smoke-inputs.test.cjs
tests\check-fence.test.cjs                tests\smoke-page.test.cjs
tests\contract-prompt-authority.test.cjs  tests\subagent-type-mapping.test.cjs
tests\git-contract.test.cjs
```

## Runs

This step was satisfied by **two** independent executions of the recipe, both against the
tree in its as-found state. No third invocation was made: runs A and E are each the recipe
in full, and a third would only repeat them.

**Run A** — before this session touched anything (also the source for steps 4 and 9):

```
ℹ tests 260
ℹ suites 0
ℹ pass 260
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 227574.3636
=== NODE_TEST_EXIT=0 ===
=== GIT_DIFF_CHECK_EXIT=0 ===
=== RECIPE END: OK ===
PS_EXIT=0    (wall clock 229 s)
```

**Run E** — after step 8's nested file was deleted, i.e. the final state of the tree:

```
ℹ tests 260
ℹ suites 0
ℹ pass 260
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 249586.1337
=== NODE_TEST_EXIT=0 ===
=== GIT_DIFF_CHECK_EXIT=0 ===
=== RECIPE END: OK ===
PS_EXIT=0    (wall clock 250 s)
```

Failure-marker count (`✖`) in both logs: **0**.

`git diff --check` produced no output and exited `0` in both runs — silent, as required.

## Pass conditions

| Condition | Run A | Run E | Met |
| --- | --- | --- | --- |
| 260 pass | 260 | 260 | yes |
| 0 fail | 0 | 0 | yes |
| exit 0 | 0 | 0 | yes |
| `git diff --check` silent | silent, exit 0 | silent, exit 0 | yes |

Timing matched the Aside's "about four minutes" (229 s and 250 s).

## On the "base was 207, so this change adds 53" claim

Not independently verified — checking it would mean checking out the base commit, and this
run was instructed not to switch branches. It is however **arithmetically consistent**
with this ledger's own `PROGRESS.md` and the merge order in `git log --oneline --merges`
(newest first: B01 `e79d378`, B02 `bbc63bb`, B03 `6766642`):

```
base 207  →  B03 merged 6766642, row records "tip green 216/216"   (+9)
          →  B02 merged bbc63bb, row records "tip green 217/217"   (+1)
          →  B01 merged e79d378, row records nothing               (+43, observed here)
                                                        total +53, 260 now
```

The +43 for B01 is inferred from the observed 260, because B01's `PROGRESS.md` row was
never updated with its merge or its tip count (see step 06).

## Verdict

PASS — the recipe runs clean from the repository root: 260 pass, 0 fail, exit 0, and `git diff --check` silent, confirmed twice.
