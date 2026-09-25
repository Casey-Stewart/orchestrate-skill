# C1 step 06 (revision 1)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.

**Do:** `node orchestrate/tools/check-ledger.mjs skill --contract .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-05/00-READBEFORE.md`

**Pass:** one line, `SKILL MATCH <hash>`; exit code 0.

## Commands and exit codes

- The Do command, from the worktree root — exit **0** (1 output line)

## Output

```
SKILL MATCH 4680cd3687b9236a272e8bbee99b9db319e97ea053acc5963828ad7d058d3170
```

## Verdict

PASS — one line `SKILL MATCH <hash>` (the same hash step 5 computed); exit 0.
