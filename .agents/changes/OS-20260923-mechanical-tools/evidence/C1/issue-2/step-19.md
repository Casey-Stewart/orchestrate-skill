# C1 issue 2 — step 19 (revision 1)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Run a mutation that skips a test the control ran:

**Pass:** CONTROL PASS PASS tests 2/2 (…), then a line beginning CRASHED f1: PASS tests 1/2, 1 skipped, then MUTATE 0 killed, 0 survived, 1 other; exit code 2; the log records 1 test skipped that ran in the control.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/mutate.mjs --repo ../c1-scratch/c1-fail-fixture --ref HEAD --mutations .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-002/I-12/muts-f.json --validate .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-002/I-12/validate-f.json --log ../c1-scratch/c1-fail-f.log
```

Exit code: 2

Output (tail, ≤20 lines):

```
CONTROL PASS PASS tests 2/2 (0s)
CRASHED f1: PASS tests 1/2, 1 skipped (0s)
MUTATE 0 killed, 0 survived, 1 other
```

### Run 2

```
$ git -C ../c1-scratch/c1-fail-fixture status --porcelain
```

Exit code: 0

Output (tail, ≤20 lines):

```
(no output)
```

## Notes

Log grep (`grep -n -i skip ../c1-scratch/c1-fail-f.log`):

```
11:ℹ skipped 0
23:ℹ skipped 1
26:==> mutate: f1: CRASHED — step tests: 1 test skipped that ran in the control
```

Fixture clone `git status --porcelain` after the run: empty; the clone has no extra worktrees (eef02bd [main] only).

## Verdict

PASS — the three expected lines in order, exit 2; log line 26 records `1 test skipped that ran in the control`.
