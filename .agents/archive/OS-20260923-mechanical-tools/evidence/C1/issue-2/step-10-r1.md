# C1 issue 2 — step 10 (revision 1)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Render it again with facts that lack worktreePath:

**Pass:** One line UNKNOWN UNFILLED [WORKTREE_PATH]; exit code 2; no new file in ../c1-scratch/c1-prompts.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/prompt.mjs --ledger .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-05 --role implementer --batch B01 --facts .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-08/facts.json --out ../c1-scratch/c1-prompts
```

Exit code: 2

Output (tail, ≤20 lines):

```
UNKNOWN UNFILLED [WORKTREE_PATH]
```

## Notes

The file listing of ../c1-scratch/c1-prompts before (saved after step 9) and after was compared with `diff`. There was no difference: still only C1-20260924-smoke-B01-implementer-60c5d490691a.md.

## Verdict

PASS — one line `UNKNOWN UNFILLED [WORKTREE_PATH]`, exit 2, no new file in ../c1-scratch/c1-prompts.
