# C1 step 10 (revision 1)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.

**Do:** `node orchestrate/tools/prompt.mjs --ledger .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-05 --role implementer --batch B01 --facts .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-08/facts.json --out ../c1-scratch/c1-prompts`

**Pass:** one line `UNKNOWN UNFILLED [WORKTREE_PATH]`; exit code 2; no new file in `../c1-scratch/c1-prompts` (list it before and after).

## Commands and exit codes

1. `ls -la --time-style=full-iso ../c1-scratch/c1-prompts` before — exit 0
2. The Do command, from the worktree root — exit **2**
3. `ls -la --time-style=full-iso ../c1-scratch/c1-prompts` after — exit 0

## Output

```
UNKNOWN UNFILLED [WORKTREE_PATH]
```

Listing before and after (identical — same single file, same size and mtime):

```
-rw-rw-r-- 1 timetotilt timetotilt 6618 2026-09-24 23:38:54.250732125 +0000 C1-20260924-smoke-B01-implementer-a8547c43f20f.md
```

## Verdict

PASS — one line `UNKNOWN UNFILLED [WORKTREE_PATH]`; exit 2; no new file in `../c1-scratch/c1-prompts`.
