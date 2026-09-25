# C1 step 11 (revision 1)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.

**Do:** `git clone .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-09/fixture.bundle ../c1-scratch/c1-fixture`
then `node orchestrate/tools/mutate.mjs --repo ../c1-scratch/c1-fixture --ref HEAD --mutations .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-09/muts.json --validate .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-09/validate.json --log ../c1-scratch/c1-mutate.log`
then `git -C ../c1-scratch/c1-fixture status --porcelain`

**Pass:** the lines `CONTROL PASS …`, `KILLED m1: add sums two numbers`, `SURVIVED m2` and `MUTATE 1 killed, 1 survived, 0 other`; exit code 1; afterwards the status command prints nothing.

## Commands and exit codes

1. `git clone …/I-09/fixture.bundle ../c1-scratch/c1-fixture` — exit 0 (clone has `1d478f6 a second test`, `f0e2c34 add with one test`; branch `main`)
2. Untouched check BEFORE mutate: `git -C ../c1-scratch/c1-fixture worktree list --porcelain` (exit 0) and `git -C ../c1-scratch/c1-fixture rev-parse --abbrev-ref HEAD` (exit 0)
3. The mutate command — exit **1**
4. `git -C ../c1-scratch/c1-fixture status --porcelain` — exit 0, **0 bytes** of output

## Output (mutate)

```
CONTROL PASS PASS tests 2/2 (0s)
KILLED m1: add sums two numbers
SURVIVED m2
MUTATE 1 killed, 1 survived, 0 other
```

The tool's temporary checkout (`/tmp/mut-7iOLwt`, named in the log) no longer exists afterwards.

## User-repository-untouched check (steps 11–13)

Before step 11's mutate and after step 13, both commands printed exactly (compared with `cmp`: IDENTICAL):

```
worktree /home/timetotilt/worktrees/os923/c1-scratch/c1-fixture
HEAD 1d478f6eb282c96c0ee0ee1e4e6c5823d0e5aa25
branch refs/heads/main

main
```

(No extra worktree registered; HEAD still on `main` at `1d478f6`. `status --porcelain` was also empty after steps 12 and 13.)

## Verdict

PASS — all four required lines present, exit 1, status prints nothing; fixture's worktree list and HEAD unchanged across steps 11–13.
