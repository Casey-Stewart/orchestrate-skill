# C1 step 07 (revision 1)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.

**Do:** `node orchestrate/tools/check-ledger.mjs skill --contract .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-06/00-READBEFORE.md`

**Pass:** one line, `SKILL MISMATCH pinned <hash> actual <hash>` with two different hashes; exit code 1.

## Commands and exit codes

- The Do command, from the worktree root — exit **1** (1 output line)

## Output

```
SKILL MISMATCH pinned 4680cd3687b9236a272e8bbee99b9db319e97ea053acc5963828ad7d058d3171 actual 4680cd3687b9236a272e8bbee99b9db319e97ea053acc5963828ad7d058d3170
```

## Verdict

PASS — one `SKILL MISMATCH pinned … actual …` line; the hashes differ (last hex digit 1 vs 0); exit 1.
