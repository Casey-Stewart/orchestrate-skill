# C1 issue 2 — step 13 (revision 2)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 2
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Run the fixture's suite at its older commit in a disposable checkout:

**Pass:** One line beginning AT f0e2c34 (the fixture's HEAD~1, as the I-09 README lists it) followed by PASS tests 1/1; exit code 0.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/run-at-ref.mjs --repo ../c1-scratch/c1-fixture --ref HEAD~1 --validate .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-09/validate.json --log ../c1-scratch/c1-at-ref.log
```

Exit code: 0

Output (tail, ≤20 lines):

```
AT f0e2c34 PASS tests 1/1 (0s)
```

### Run 2

```
$ git -C ../c1-scratch/c1-fixture status --porcelain
```

Exit code: 0

Output (tail, ≤20 lines):

```
(no output)
```

## Notes

Clone log: `1d478f6 a second test` / `f0e2c34 add with one test`; I-09 README line 5 lists HEAD~1 = f0e2c34. Fixture clone `git status --porcelain` after the run: empty; the clone has no extra worktrees.

## Verdict

PASS — one line `AT f0e2c34 PASS tests 1/1 (0s)`, exit 0.
