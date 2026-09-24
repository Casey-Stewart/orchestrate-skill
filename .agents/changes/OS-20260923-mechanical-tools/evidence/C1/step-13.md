# C1 step 13 (revision 1)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.

**Do:** `node orchestrate/tools/run-at-ref.mjs --repo ../c1-scratch/c1-fixture --ref HEAD~1 --validate .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-09/validate.json --log ../c1-scratch/c1-at-ref.log`

**Pass:** one line beginning `AT f0e2c34` (HEAD~1's short SHA, per the I-09 README) followed by the result the README lists for that commit (`PASS tests 1/1 …`); exit code 0.

## Commands and exit codes

1. The Do command, from the worktree root — exit **0** (1 output line)
2. Untouched check after (see step-11.md) — identical to before
3. `git -C ../c1-scratch/c1-fixture status --porcelain` — empty, exit 0
4. `git status --porcelain` in the worktree — only `?? .agents/changes/OS-20260923-mechanical-tools/evidence/C1/step-00-inputs.md` at that moment (step-01..13.md written afterwards; see final check)

## Output

```
AT f0e2c34 PASS tests 1/1 (0s)
```

Log tail ends with the reporter summary (`ℹ tests 1`, `ℹ pass 1`, `ℹ fail 0`).

## Verdict

PASS — one line `AT f0e2c34 PASS tests 1/1 (0s)`, matching the README's HEAD~1 result; exit 0.
