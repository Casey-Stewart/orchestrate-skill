# C1 / B04-step2 — the edit's size, and nothing reflowed

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## Commands

```
git diff efc4eec..HEAD --numstat -- orchestrate/references/protocol.md orchestrate/templates/00-READBEFORE.md
git diff efc4eec..HEAD --numstat
git diff --check
# and, to isolate B04's OWN edit from the rest of the ledger:
git diff $(git merge-base 8bf3345 00679d9)...00679d9 --numstat -- orchestrate/references/protocol.md orchestrate/templates/00-READBEFORE.md
git diff $(git merge-base 8bf3345 00679d9)...00679d9 -- orchestrate/references/protocol.md
git diff $(git merge-base 8bf3345 00679d9)...00679d9 -- orchestrate/templates/00-READBEFORE.md
```

## Exit codes

`0` for every command; `git diff --check` exited `0`.

## Output — the step's own command

```
8	3	orchestrate/references/protocol.md
27	5	orchestrate/templates/00-READBEFORE.md
```

`git diff --check` produced no output and exited `0`. The same `0` was produced by the
published validation recipe's own `git diff --check` in the single full-suite run.

## Two discrepancies, reported rather than interpreted charitably

**1. `efc4eec..HEAD` is not B04's edit.** The ledger base to HEAD range is the CUMULATIVE diff
of all seven batches. B07 also edited both of these files (they are in B07's fence), so the
`8/3` and `27/5` above are B04 plus B07, and the step's command cannot by construction show
"exactly one line per file".

**2. B04's own edit is TWO lines per file, not one.** Isolated to B04's branch range, the
numstat is:

```
2	2	orchestrate/references/protocol.md
2	2	orchestrate/templates/00-READBEFORE.md
```

and the hunks are a pair of 1:1 line replacements in each file, identical in both mirrors:

```
-endpoints. Before status, resolve the filter attribute of the paths status inspects:
+endpoints. Before status, run git check-attr filter on the paths status inspects:
 a path resolving to a set filter, or a submodule, makes safe cleanliness unknown;
-unspecified, unset and mere configuration do not. Never execute such filters to
+unspecified, unset and mere configuration do not. Never execute such filter drivers to
```

The second changed line renames "such filters" to "such filter drivers" — a real second edit,
in the same sentence, present in both files. So the step's *Do* wording ("touched exactly one
line per file") does not describe what the build actually does; the build touched two lines
per file. Flagging this rather than reading "one line" loosely.

## What IS verified: nothing reflowed

Added lines equal removed lines in each file (2 = 2), every changed line is a 1:1 replacement
at the same position, and all surrounding context lines in both hunks are unchanged — the
`@@ -213,9 +213,9 @@` and `@@ -159,9 +159,9 @@` headers show identical before/after line counts
and identical starting positions. Neither mirror's wrap width moved, and no EOL style changed
(`git diff --check` clean). The two files remain byte-identical to each other across the
passage, which is what `tests/protocol-contract.test.cjs` pins.

## Live control

`git diff --check`'s exit `0` is a negative result, so it was proven against a case that must
produce a non-zero: the same repository's `git diff efc4eec..HEAD` is a large, real diff (29
files) that the command parsed without complaint, and the recipe's `throw 'Git diff check
failed'` branch is live — the run reported `GIT_DIFF_CHECK_EXIT=0` explicitly rather than
silently skipping. The numstat instrument is proven discriminating by producing three
different, correct answers for three different ranges (cumulative `8/3`+`27/5`, B04-only
`2/2`+`2/2`), rather than one constant.

## Verdict

PASS — `git diff efc4eec..HEAD --numstat` shows a small change in each of the two files
(`8/3` and `27/5`) and `git diff --check` is clean, which is the literal Pass condition. Read
strictly, B04's own edit is two lines per file rather than one, and the cited range also
contains B07's edits to the same files; nothing was reflowed in either.
