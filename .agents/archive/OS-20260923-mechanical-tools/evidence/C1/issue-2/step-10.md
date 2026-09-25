# C1 issue 2 — step 10 (revision 2)

- Build SHA: a54dcc9f56abb091f378f2086a496e61ef424373 (= worktree HEAD, branch chore/mechanical-tools-ledger; `git diff --name-only e681144..a54dcc9 -- . ":(exclude).agents/"` prints nothing, so the code is identical to e681144)
- Step revision tested: 2
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together). ../c1-scratch/c1-prompts was removed and recreated empty before step 6. Revision-1 evidence for this step is preserved separately as step-NN-r1.md and was not touched.

**Do:** Render it again with facts that lack worktreePath:

**Pass:** One line UNKNOWN UNFILLED [WORKTREE_PATH]; exit code 2; no new file in ../c1-scratch/c1-prompts.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/prompt.mjs --ledger .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-003/I-05 --role implementer --batch B01 --facts .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-08/facts.json --out ../c1-scratch/c1-prompts
```

Exit code: 2

Output (tail, ≤20 lines):

```
UNKNOWN UNFILLED [WORKTREE_PATH]
```

## Notes

The file listing of ../c1-scratch/c1-prompts before (saved after step 9) and after was compared with `diff`. There was no difference: still only C1-20260924-smoke-B01-implementer-97eab5afd815.md.

## Verdict

PASS — one line `UNKNOWN UNFILLED [WORKTREE_PATH]`, exit 2, no new file in ../c1-scratch/c1-prompts.
