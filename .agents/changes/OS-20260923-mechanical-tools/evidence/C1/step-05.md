# C1 step 05 (revision 1)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.

**Do:** run `node orchestrate/tools/check-ledger.mjs skill --dir orchestrate` twice, then
`node orchestrate/tools/check-ledger.mjs skill --dir orchestrate --contract .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-04/00-READBEFORE.md`

**Pass:** the first two lines are identical and read `SKILL <hash> <count> files`; the third reads `SKILL MISMATCH pinned … actual …` with the same actual hash, exit code 1.

## Commands and exit codes

1. `node orchestrate/tools/check-ledger.mjs skill --dir orchestrate` — exit 0
2. `node orchestrate/tools/check-ledger.mjs skill --dir orchestrate` — exit 0
3. `node orchestrate/tools/check-ledger.mjs skill --dir orchestrate --contract …/I-04/00-READBEFORE.md` — exit **1**

## Output

```
SKILL 4680cd3687b9236a272e8bbee99b9db319e97ea053acc5963828ad7d058d3170 23 files
SKILL 4680cd3687b9236a272e8bbee99b9db319e97ea053acc5963828ad7d058d3170 23 files
SKILL MISMATCH pinned 0000000000000000000000000000000000000000000000000000000000000000 actual 4680cd3687b9236a272e8bbee99b9db319e97ea053acc5963828ad7d058d3170
```

## Verdict

PASS — runs 1 and 2 identical (`SKILL <hash> 23 files`); run 3 is `SKILL MISMATCH pinned … actual 4680cd36…3170` (same hash), exit 1.
