# C1 issue 2 — step 09 (revision 1)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Render the filled ledger's B01 implementer prompt:

**Pass:** One line PROMPT <path> NONCE <12 hex>; exit code 0; the path does not contain the nonce; the file contains the issued I-05/02-batches-01-smoke-batch.md text verbatim, its last non-empty line carries the nonce, and it contains none of the tokens [CHANGE_ID], [WORKTREE_PATH], [FENCE FILES], [VALIDATION COMMANDS].

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/prompt.mjs --ledger .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-05 --role implementer --batch B01 --facts .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-07/facts.json --out ../c1-scratch/c1-prompts
```

Exit code: 0

Output (tail, ≤20 lines):

```
PROMPT /home/timetotilt/worktrees/os923/c1-scratch/c1-prompts/C1-20260924-smoke-B01-implementer-60c5d490691a.md NONCE fd93a0732839
```

## Notes

Checks on the written file (node one-off, read-only):

- nonce `fd93a0732839` is 12 hex digits; `grep -c fd93a0732839` on the path → 0 (path does not contain it)
- raw `includes()` of I-05/02-batches-01-smoke-batch.md (786 bytes, hash-verified at step 00) → true
- last non-empty line: `Line 2, directly under line 1: NONCE fd93a0732839` → carries the nonce
- tokens [CHANGE_ID], [WORKTREE_PATH], [FENCE FILES], [VALIDATION COMMANDS] → all absent
- ../c1-scratch/c1-prompts held exactly one file afterwards

## Verdict

PASS — one PROMPT line with a 12-hex nonce, exit 0; nonce not in the path; batch text is in the file verbatim; the last non-empty line carries the nonce; none of the four tokens appear.
