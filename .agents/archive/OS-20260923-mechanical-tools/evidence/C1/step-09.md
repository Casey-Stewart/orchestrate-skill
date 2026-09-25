# C1 step 09 (revision 1)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.

**Do:** `node orchestrate/tools/prompt.mjs --ledger .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-05 --role implementer --batch B01 --facts .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-07/facts.json --out ../c1-scratch/c1-prompts`

**Pass:** one line `PROMPT <path> NONCE <12 hex>`; exit code 0; the path does not contain the nonce; the file contains I-05's B01
batch file (`I-05/02-batches-01-smoke-batch.md`) text verbatim, its last non-empty line carries the nonce, and it contains
none of the tokens `[CHANGE_ID]`, `[WORKTREE_PATH]`, `[FENCE FILES]`, `[VALIDATION COMMANDS]`. (Check each clause with a
command and record it.)

## Commands and exit codes

1. `ls -la ../c1-scratch/c1-prompts` before — directory did not exist
2. The Do command, from the worktree root — exit **0**
3. Clause checks (F = the printed path, N = the printed nonce, B = `…/I-05/02-batches-01-smoke-batch.md`):
   - `echo -n "$N" | grep -Eqx '[0-9a-f]{12}'` → yes
   - `echo "$F" | grep -qF "$N"` → no (path does not contain the nonce)
   - `node -e` reading F and B as UTF-8, `F.includes(B)` → `contains full file` (whole batch file, byte for byte, including trailing whitespace)
   - `grep -v '^[[:space:]]*$' "$F" | tail -1` → `Line 2, directly under line 1: NONCE a7f88f48df42` (carries the nonce)
   - `grep -cF` for each token → `[CHANGE_ID]` 0, `[WORKTREE_PATH]` 0, `[FENCE FILES]` 0, `[VALIDATION COMMANDS]` 0
   - `grep -cF "$N" "$F"` → 1 (nonce appears once, on the last non-empty line)

## Output

```
PROMPT /home/timetotilt/worktrees/os923/c1-scratch/c1-prompts/C1-20260924-smoke-B01-implementer-a8547c43f20f.md NONCE a7f88f48df42
```

One line; file is 6618 bytes.

## Verdict

PASS — every clause checked by command and met.
