# C1 issue 2 — step 08 (revision 2)

- Build SHA: a54dcc9f56abb091f378f2086a496e61ef424373 (= worktree HEAD, branch chore/mechanical-tools-ledger; `git diff --name-only e681144..a54dcc9 -- . ":(exclude).agents/"` prints nothing, so the code is identical to e681144)
- Step revision tested: 2
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together). ../c1-scratch/c1-prompts was removed and recreated empty before step 6. Revision-1 evidence for this step is preserved separately as step-NN-r1.md and was not touched.

**Do:** Parse that filled ledger:

**Pass:** One line beginning PARSE OK; exit code 0.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/check-ledger.mjs parse --dir .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-003/I-05
```

Exit code: 0

Output (tail, ≤20 lines):

```
PARSE OK 1 batches
```

## Verdict

PASS — one line `PARSE OK 1 batches`, exit 0.
