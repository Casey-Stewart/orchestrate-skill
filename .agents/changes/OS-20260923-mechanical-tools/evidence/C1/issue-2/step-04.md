# C1 issue 2 — step 04 (revision 1)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Parse the issued copy with one path removed from B02's Files line:

**Pass:** One line beginning PARSE FAIL that names 02-batches-02-ledger-parser.md and its Files line; exit code 1.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/check-ledger.mjs parse --dir .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-03
```

Exit code: 1

Output (tail, ≤20 lines):

```
PARSE FAIL 2 problem(s): 02-batches-02-ledger-parser.md:8 Files line differs from the plan fence; 02-batches-04-prompt-renderer.md:8 Files line differs from the plan fence
```

## Verdict

PASS — one line beginning PARSE FAIL naming `02-batches-02-ledger-parser.md:8 Files line` (plus B04's line, as the step note expects); exit 1.
