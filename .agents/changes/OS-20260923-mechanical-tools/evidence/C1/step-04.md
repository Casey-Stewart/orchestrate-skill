# C1 step 04 (revision 1)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.

**Do:** `node orchestrate/tools/check-ledger.mjs parse --dir .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-03`

**Pass:** one line beginning `PARSE FAIL` that names `02-batches-02-ledger-parser.md` and its Files line; exit code 1. (The same line also names B04's Files line, for step 3's reason.)

## Commands and exit codes

- The Do command, from the worktree root — exit **1** (1 output line)

## Output

```
PARSE FAIL 2 problem(s): 02-batches-02-ledger-parser.md:8 Files line differs from the plan fence; 02-batches-04-prompt-renderer.md:8 Files line differs from the plan fence
```

## Verdict

PASS — one `PARSE FAIL` line naming `02-batches-02-ledger-parser.md:8 Files line` (and B04's, as the step notes); exit 1.
