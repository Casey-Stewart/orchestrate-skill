# C1 issue 2 — step 18 (revision 1)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Run a mutation that leaves a one-test file registering nothing:

**Pass:** CONTROL PASS PASS tests 1/1 (…), then a line beginning CRASHED e1: FAIL tests 1 of 1 failed: rows.test.cjs (ran no tests), then MUTATE 0 killed, 0 survived, 1 other; exit code 2.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/mutate.mjs --repo ../c1-scratch/c1-fail-fixture --ref HEAD --mutations .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-002/I-12/muts-b.json --validate .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-002/I-12/validate-b.json --log ../c1-scratch/c1-fail-b.log
```

Exit code: 2

Output (tail, ≤20 lines):

```
CONTROL PASS PASS tests 1/1 (0s)
CRASHED e1: FAIL tests 1 of 1 failed: rows.test.cjs (ran no tests) — log: /home/timetotilt/worktrees/os923/c1-scratch/c1-fail-b.log
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

Log c1-fail-b.log line 24: `==> mutate: e1: CRASHED — step tests: a test file ran no tests (rows.test.cjs)`. Fixture clone `git status --porcelain` after the run: empty.

## Verdict

PASS — the three expected lines in order (CONTROL PASS PASS tests 1/1, CRASHED e1: FAIL tests 1 of 1 failed: rows.test.cjs (ran no tests) …, MUTATE 0 killed, 0 survived, 1 other); exit 2.
