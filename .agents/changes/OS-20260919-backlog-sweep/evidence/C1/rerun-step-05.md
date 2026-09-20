# Step 5 — the archive guard can actually fail (throwaway clone) (re-run)

This is one of the two steps that must go RED. It did.

## Pre-flight in the real repository

```
git status --porcelain                                              -> empty
grep -c "Every generation and independent Excel-validation ..."     -> 1
grep -c "Python310" (same file)                                     -> 5
```
The aside's trap is real and was avoided: the Excel sentence occurs **once**; `Python310`
occurs on **five** lines. The Excel sentence was the one deleted.

## Clone

```
git clone . "$env:TEMP\os919c1"        -> exit 0
```
Clone at `C:\Users\fatbo\AppData\Local\Temp\os919c1`, branch `chore/backlog-sweep-ledger`,
HEAD `257e85d`. Matching lines in the clone's copy of
`.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md`: **1**.
Deleted line (its full text):
```
Every generation and independent Excel-validation command in this run uses literal
```
`git status --porcelain` in the clone after the edit:
```
 M .agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md
```
`git status --porcelain` in the REAL repository at this point: **empty**.

## RED run (in the clone, line missing)

```powershell
node --test --test-reporter=spec @testFiles   # 9 suite files
```
**Exit 1.** Totals:
```
ℹ tests 260
ℹ pass 259
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```
The single failing name:
```
✖ reusable artifacts contain no local Python installation default, while frozen ledger retains its environment fact (48.9865ms)
```
Exactly the test the pass line names, and the only failure.

## Restore and GREEN run

```
git -C "$env:TEMP\os919c1" checkout -- .   -> exit 0
git -C "$env:TEMP\os919c1" status --porcelain -> empty
node --test --test-reporter=spec @testFiles -> exit 0
```
```
ℹ tests 260
ℹ pass 260
ℹ fail 0
```
No failing names.

## Cleanup and safety

```
Remove-Item -Recurse -Force "$env:TEMP\os919c1"
Test-Path "$env:TEMP\os919c1"  -> False
```
`git status --porcelain` in the real repository: **empty before the clone, empty after the
edit, empty after the RED run, empty after cleanup**. Nothing under `.agents/archive/` in
THIS repository was touched at any point.

## Verdict

PASS — the suite went genuinely RED in the clone (259/1, naming exactly the expected test) and back to 260/0 after the restore, with this repository provably untouched throughout and the clone deleted.
