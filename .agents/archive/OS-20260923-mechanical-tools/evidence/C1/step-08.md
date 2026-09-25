# C1 step 08 (revision 1)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.

**Do:** `node orchestrate/tools/check-ledger.mjs parse --dir .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-05`

**Pass:** one line beginning `PARSE OK`; exit code 0.

## Commands and exit codes

- The Do command, from the worktree root — exit **0** (1 output line)

## Output

```
PARSE OK 1 batches
```

## Verdict

PASS — one line beginning `PARSE OK`; exit 0.
