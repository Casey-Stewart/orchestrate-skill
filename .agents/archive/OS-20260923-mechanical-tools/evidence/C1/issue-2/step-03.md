# C1 issue 2 — step 03 (revision 3)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 3
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Parse this ledger:

**Pass:** One line, PARSE FAIL 2 problem(s): 02-batches-01-validate-wrapper.md:8 Files line differs from the plan fence; 02-batches-04-prompt-renderer.md:8 Files line differs from the plan fence; exit code 1.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/check-ledger.mjs parse --dir .agents/changes/OS-20260923-mechanical-tools
```

Exit code: 1

Output (tail, ≤20 lines):

```
PARSE FAIL 2 problem(s): 02-batches-01-validate-wrapper.md:8 Files line differs from the plan fence; 02-batches-04-prompt-renderer.md:8 Files line differs from the plan fence
```

## Notes

Note: the ledger directory contained the orchestrator's uncommitted draft `smoke-c1.json` (modified, not touched by this runner) at the time of the run.

## Verdict

PASS — the one output line is character-for-character the expected text; exit 1.
