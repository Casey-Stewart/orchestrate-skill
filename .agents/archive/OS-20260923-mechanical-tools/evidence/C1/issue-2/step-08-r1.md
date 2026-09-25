# C1 issue 2 — step 08 (revision 1)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Parse that filled ledger:

**Pass:** One line beginning PARSE OK; exit code 0.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/check-ledger.mjs parse --dir .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-05
```

Exit code: 0

Output (tail, ≤20 lines):

```
PARSE OK 1 batches
```

## Verdict

PASS — one line `PARSE OK 1 batches`, exit 0.
