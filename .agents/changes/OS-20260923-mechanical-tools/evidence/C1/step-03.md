# C1 step 03 (revision 2)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 2 (corrected at this close-out; revision 1 expected `PARSE OK 5 batches`)
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.

**Do:** `node orchestrate/tools/check-ledger.mjs parse --dir .agents/changes/OS-20260923-mechanical-tools`

**Pass:** one line, `PARSE FAIL 1 problem(s): 02-batches-04-prompt-renderer.md:8 Files line differs from the plan fence`; exit code 1.

## Commands and exit codes

- The Do command, from the worktree root — exit **1** (output captured and shown with `cat -A`; 1 line)

## Output

```
PARSE FAIL 1 problem(s): 02-batches-04-prompt-renderer.md:8 Files line differs from the plan fence
```

## Verdict

PASS — one line, byte-identical to the expected text; exit 1.
