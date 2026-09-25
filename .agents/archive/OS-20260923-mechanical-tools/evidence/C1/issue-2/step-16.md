# C1 issue 2 — step 16 (revision 1)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Run the wrapper on a test file that registers no tests, beside a real one:

**Pass:** Exactly one line, FAIL tests 1 of 2 failed: empty.test.cjs (ran no tests) — log: …; exit code 1.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/validate.mjs --spec .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-002/I-11/spec.json --cwd .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-002/I-11 --log ../c1-scratch/c1-empty-file.log
```

Exit code: 1

Output (tail, ≤20 lines):

```
FAIL tests 1 of 2 failed: empty.test.cjs (ran no tests) — log: ../c1-scratch/c1-empty-file.log
```

## Verdict

PASS — exactly `FAIL tests 1 of 2 failed: empty.test.cjs (ran no tests) — log: ../c1-scratch/c1-empty-file.log`, exit 1.
