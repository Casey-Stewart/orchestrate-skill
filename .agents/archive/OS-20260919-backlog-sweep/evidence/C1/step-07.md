# Step 07 — The archive guard can fail

**Runner**: agent
**Run entirely in a throwaway clone.** Nothing under `.agents/archive/` in this repository
was read-write at any point; every command against the real repo below is a read.

## Pre-flight — the trap named in the Aside

```
$ grep -c "Every generation and independent Excel-validation command in this run uses literal" \
    .agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md
1
$ grep -n "Every generation ..." <same file>
736:Every generation and independent Excel-validation command in this run uses literal
$ grep -c "Python310" <same file>
5
```

The Excel sentence occurs **exactly once** and `Python310` occurs on **5** lines, matching
the Aside's warning. The Excel sentence was used, as instructed.

## Real repo, before

```
$ git status --porcelain
?? .agents/changes/OS-20260919-backlog-sweep/evidence/
?? .agents/changes/OS-20260919-backlog-sweep/smoke-C1.md
```

(Both untracked: the smoke script itself, pre-existing, and this evidence directory.)

## 1 — Clone

```
$ git clone . "$env:TEMP\os919c1"
Cloning into 'C:/Users/fatbo/AppData/Local/Temp/os919c1'... done.
CLONE_EXIT=0
$ git -C <clone> rev-parse --abbrev-ref HEAD   ->  chore/backlog-sweep-ledger
$ git -C <clone> rev-parse --short HEAD        ->  e79d378
$ git -C <clone> status --porcelain            ->  (empty)
```

## 2 — Delete the one line, in the clone only

```
$ sed -i '/Every generation and independent Excel-validation command in this run uses literal/d' \
    "<clone>/.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md"
SED_EXIT=0
```

1044 lines → 1043. `git -C <clone> diff --stat` confirms the edit is exactly one deletion
in one file:

```
 .../OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md | 1 -
 1 file changed, 1 deletion(-)

@@ -733,7 +733,6 @@
 ## Python command and environment

-Every generation and independent Excel-validation command in this run uses literal
 `python`, never `python3`, `py`, an unspecified interpreter placeholder, or an
```

Real repo re-checked at this point: `git status --porcelain` unchanged (same two
untracked entries).

## 3 — Validation recipe in the clone: RED

```
$ powershell -File recipe.ps1 -Root C:\Users\fatbo\AppData\Local\Temp\os919c1
=== DISCOVERED 9 TEST FILES ===
ℹ tests 260
ℹ pass 259
ℹ fail 1
=== NODE_TEST_EXIT=1 ===
=== RECIPE THROWS HERE: Node test suite failed ===
PS_EXIT=1     (wall clock 242 s)
```

The single failure, by name:

```
✖ failing tests:

test at tests\protocol-contract.test.cjs:117:1
✖ reusable artifacts contain no local Python installation default, while frozen ledger retains its environment fact (20.9201ms)
  AssertionError [ERR_ASSERTION]: .agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md: one Excel-validation sentence

  0 !== 1

      at TestContext.<anonymous> (...\os919c1\tests\protocol-contract.test.cjs:136:12)
    actual: 0,
    expected: 1,
    operator: 'strictEqual',
```

That is exactly the test the step names, and nothing else broke: 259 of 260 still pass.
The assertion message even names the file and the missing sentence, and the `0 !== 1`
shows it counts occurrences rather than pattern-matching loosely. The guard can fail, and
it fails for the right reason.

## 4 — Restore and re-run: green

```
$ git -C "<clone>" checkout -- .
CHECKOUT_EXIT=0
$ git -C "<clone>" status --porcelain        ->  (empty)
$ grep -c "Every generation ..." <clone file> ->  1     (line is back)

$ powershell -File recipe.ps1 -Root <clone>
ℹ tests 260
ℹ pass 260
ℹ fail 0
=== NODE_TEST_EXIT=0 ===
=== GIT_DIFF_CHECK_EXIT=0 ===
=== RECIPE END: OK ===
PS_EXIT=0     (wall clock 233 s)     ✖ count in log: 0
```

## 5 — Remove the clone

```
$ Remove-Item -Recurse -Force "$env:TEMP\os919c1"   ->  REMOVED  (Test-Path now false)
```

## Real repo, after

```
$ git status --porcelain
?? .agents/changes/OS-20260919-backlog-sweep/evidence/
?? .agents/changes/OS-20260919-backlog-sweep/smoke-C1.md

$ git status --porcelain -- .agents/archive/
(empty)

$ wc -l .agents/archive/.../00-READBEFORE.md                    ->  1044
$ grep -c "Every generation ..." .agents/archive/.../00-READBEFORE.md  ->  1
```

Byte-for-byte identical to before, archive included. The only difference across the whole
step is the evidence files this run is writing.

## Pass conditions

| Condition | Observed | Met |
| --- | --- | --- |
| RED in the clone while the line is missing | 259/260, exit 1 | yes |
| failure names `reusable artifacts contain no local Python installation default, while frozen ledger retains its environment fact` | named verbatim, sole failure | yes |
| green after the restore | 260/260, exit 0 | yes |
| THIS repository's `git status --porcelain` empty throughout | unchanged before / mid / after; `.agents/archive/` clean | yes |

## Verdict

PASS — the clone went red on exactly the named test and only that test, went green again after `git checkout -- .`, and this repository was provably untouched throughout.
