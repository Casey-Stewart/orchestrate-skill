# C1 issue 2 — step 11 (revision 2)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 2
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Clone the fixture, run the two mutations, then check the clone is untouched:

**Pass:** The mutate command prints the lines CONTROL PASS …, KILLED m1: add sums two numbers, SURVIVED m2 and MUTATE 1 killed, 1 survived, 0 other, and exits 1; the status command afterwards prints nothing.

## Commands, exit codes, output

### Run 1

```
$ git clone .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-09/fixture.bundle ../c1-scratch/c1-fixture
```

Exit code: 0

Output (tail, ≤20 lines):

```
Cloning into '../c1-scratch/c1-fixture'...
```

### Run 2

```
$ node orchestrate/tools/mutate.mjs --repo ../c1-scratch/c1-fixture --ref HEAD --mutations .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-09/muts.json --validate .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-09/validate.json --log ../c1-scratch/c1-mutate.log
```

Exit code: 1

Output (tail, ≤20 lines):

```
CONTROL PASS PASS tests 2/2 (0s)
KILLED m1: add sums two numbers
SURVIVED m2
MUTATE 1 killed, 1 survived, 0 other
```

### Run 3

```
$ git -C ../c1-scratch/c1-fixture status --porcelain
```

Exit code: 0

Output (tail, ≤20 lines):

```
(no output)
```

## Notes

Fixture clone `git status --porcelain` after the runs: empty. `git worktree list` in the clone shows only the main tree (1d478f6 [main]).

## Verdict

PASS — all four expected lines, in order, exit 1; the status command printed nothing.
