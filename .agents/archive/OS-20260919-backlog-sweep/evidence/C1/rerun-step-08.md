# Step 8 — the whole build (re-run)

## Command — the published validation recipe, PowerShell 7.6.6, repository root

```powershell
$testFiles = @(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName)
if ($testFiles.Count -eq 0) { throw 'No Node test suites discovered' }
node --test --test-reporter=spec @testFiles
if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }
```

`SUITE_FILE_COUNT=9` (non-zero, so the empty-discovery guard did not trip).

## Totals block (tail)

```
ℹ tests 260
ℹ suites 0
ℹ pass 260
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 256426.3741
NODE_TEST_EXIT=0
GIT_DIFF_CHECK_EXIT=0
```

No failing names (`✖` count zero). `git diff --check` silent, exit 0. Wall time ~4m16s,
matching the page's "about four minutes".

260 pass / 0 fail / exit 0 / diff-check silent — every clause of the pass line met.

## Aside claims

- "Base was 207, so this change adds 53 tests" — 207 not re-measured here (it would need a
  checkout of the base build, which the task forbids); 260 observed is consistent.
- "`node --test tests/` is *not* the portable equivalent" — **not verified**. It is a note
  on method, not a pass condition, and testing it costs another four-minute run. The
  README does carry the portable-form note at `README.md:218-227`, and a test does pin the
  distinction: `actual README recursive command and portable form discover nested failure
  then success; empty primary discovery fails` (`tests/protocol-contract.test.cjs:269`),
  green in this run. The README text says default discovery "is separate from" the
  recursive recipe; it does not literally state that `node --test tests/` fails.

## Verdict

PASS — 260 pass, 0 fail, exit 0, and `git diff --check` silent.
