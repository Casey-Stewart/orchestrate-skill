# C1 issue 2 — step 15 (revision 1)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Run the wrapper on a suite whose only test is skipped:

**Pass:** Exactly one line, FAIL tests no test passed (0/1, 1 skipped) — log: …; exit code 1.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/validate.mjs --spec .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-002/I-10/spec.json --cwd .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-002/I-10 --log ../c1-scratch/c1-skip-only.log
```

Exit code: 1

Output (tail, ≤20 lines):

```
FAIL tests no test passed (0/1, 1 skipped) — log: ../c1-scratch/c1-skip-only.log
```

## Verdict

PASS — exactly `FAIL tests no test passed (0/1, 1 skipped) — log: ../c1-scratch/c1-skip-only.log`, exit 1.
