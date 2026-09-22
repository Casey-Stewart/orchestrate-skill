# C1 / B06-step4 — the containment check is an executable command, and it executes

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## Part 1 — present in both documents, with the excluded-pathspec diff

### Commands

```
grep -n "merge-base --is-ancestor\|diff --name-only\|exclude)" orchestrate/references/execution-models.md
grep -n "merge-base --is-ancestor\|diff --name-only\|exclude)" orchestrate/templates/00-READBEFORE.md
sed -n '152,175p' orchestrate/references/execution-models.md
sed -n '408,430p' orchestrate/templates/00-READBEFORE.md
```

### Exit code

`0`

### Output

`orchestrate/references/execution-models.md`, lines 156-175 — the heading states the rule
outright and the fenced block is the command pair:

```
**The containment check is a command, not an eyeball.** Committing the checkpoint page
moves `HEAD` past the build the page describes, so a gate that asks the tester to
compare `git rev-parse HEAD` against the recorded build SHA can never agree, and every
run so far waived the difference by hand. The gate RUNS the comparison instead, naming
the tested SHA literally:

```text
git merge-base --is-ancestor <buildSha> HEAD
git diff --name-only <buildSha>..HEAD -- . ":(exclude).agents/"
```

The first must exit 0 — the tested build is in her history. The second must print
NOTHING — the pathspec excludes the ledger directory, so empty output IS the verdict
and she never reads a list to reach one.
```

`orchestrate/templates/00-READBEFORE.md`, lines 413-425 — the same pair, same excluded
pathspec, same "run, never eyeballed" framing:

```
The containment check is run, never eyeballed: committing the page moves `HEAD` past
the build the page describes, so `git rev-parse HEAD` can never equal `BUILD_SHA`.
Put these in the sidecar's `gate.commands`, with the tested SHA written out:

```text
git merge-base --is-ancestor <buildSha> HEAD
git diff --name-only <buildSha>..HEAD -- . ":(exclude).agents/"
```

The first must exit 0; the second must print NOTHING ...
```

Neither document asks a reader to compare two SHAs by eye; both explicitly say that form can
never agree. Both carry the excluded-pathspec diff.

## Part 2 — both commands actually run against this repository

### Commands and exit codes (Git Bash, repo root)

Ancestor case — the gate exactly as a C1 sidecar would publish it, `buildSha` = this build:

```
$ git merge-base --is-ancestor 66732c625ef55d18fd1d1df98d7b814f5e7725e4 HEAD
  EXIT=0                                   (0 = contained)
$ git diff --name-only 66732c625ef55d18fd1d1df98d7b814f5e7725e4..HEAD -- . ":(exclude).agents/"
  EXIT=0   output lines=0                  (empty output IS the verdict)
```

Non-ancestor case — the real-world failure it exists to catch, a tester whose checkout does
NOT contain the build:

```
$ git merge-base --is-ancestor 66732c625ef55d18fd1d1df98d7b814f5e7725e4 efc4eec
  EXIT=1                                   (1 = NOT contained)
$ git diff --name-only 66732c625ef55d18fd1d1df98d7b814f5e7725e4..efc4eec -- . ":(exclude).agents/"
  17 lines of real code files              (non-empty output = not the build under test)
```

**Why `efc4eec` stands in for "the tester's HEAD".** There is no non-ancestor commit in this
repository to point at: `git rev-list --all --not HEAD | wc -l` returns `0` and
`git branch -a --no-merged HEAD` is empty — every commit reachable from every ref, including
the other checkout's `codex/...` branch at `1605eb5`, is already an ancestor of `66732c6`. The
non-ancestor half is therefore driven by asking the same question against an older commit in
the second position, which is precisely the situation the gate exists to detect. Stating this
rather than presenting a fabricated SHA: a non-existent object would have produced exit `128`,
which the contract classifies as *unknown*, not as *not-contained*, and would not have tested
this branch at all.

### Verified as published, not as authored — PowerShell

BL-017 says a command is verified only when run in the form the reader receives it. The two
commands were therefore copied into a script FILE
(`C:\Users\fatbo\AppData\Local\Temp\qa-c1-20260921-smoke\gate-as-published.ps1`) with the
double-quoted pathspec exactly as the documents publish it — no shell re-quoting, no escaping
layer — and run with `powershell -File`:

```
is-ancestor EXIT=0
diff EXIT=0                                  (printed nothing)
--- non-ancestor half, same published form ---
is-ancestor EXIT=1
control diff lines=17
```

The published double-quoted form survives PowerShell intact, which is what
`execution-models.md` claims for it.

## Live control — the exclusion is doing work, and the empty output is a real empty

An "empty output is the verdict" gate is exactly the negative this checkpoint says not to
trust. The same diff was run over a range that MUST produce output, with and without the
exclusion:

```
git diff --name-only efc4eec..HEAD -- . ":(exclude).agents/"   ->  17 lines
git diff --name-only efc4eec..HEAD                             ->  29 lines
   of which ^\.agents/                                          ->  12 lines
```

29 - 12 = 17. The pathspec genuinely removes the ledger directory and genuinely leaves real
code paths behind, so the 0-line result in the ancestor case is a true empty and not a diff
that silently matches nothing. Likewise `merge-base --is-ancestor` returned two different exit
codes (0 and 1) on this repository, so neither is a constant.

## Verdict

PASS — both `orchestrate/references/execution-models.md` and
`orchestrate/templates/00-READBEFORE.md` specify `git merge-base --is-ancestor` as an
executable command with the excluded-pathspec diff and explicitly reject the by-eye
comparison; both commands run here, giving exit 0 with empty output for a contained build and
exit 1 with 17 changed paths for a build the checkout does not contain.
