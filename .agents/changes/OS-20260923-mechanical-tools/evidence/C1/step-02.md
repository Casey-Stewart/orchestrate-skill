# C1 step 02 (revision 1)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.

**Do:** `node orchestrate/tools/validate.mjs --spec .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-01/spec.json --cwd .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-01 --log ../c1-scratch/c1-validate-fail.log`

**Pass:** exactly one line beginning `FAIL tests 1 of 2 failed: fixture fails on purpose`, ending with the log path; exit code 1.

## Commands and exit codes

- The Do command, from the worktree root — exit **1**
- `cat -A` of the captured output; `wc -l` (1 line); `git status --porcelain` (nothing written into the I-01 input dir) — exit 0

## Output

```
FAIL tests 1 of 2 failed: fixture fails on purpose — log: ../c1-scratch/c1-validate-fail.log
```

The log file `../c1-scratch/c1-validate-fail.log` exists (1140 bytes, ends with the failing test's assertion error).

## Verdict

PASS — exactly one line with the required prefix, ending with the log path `../c1-scratch/c1-validate-fail.log`; exit 1.
