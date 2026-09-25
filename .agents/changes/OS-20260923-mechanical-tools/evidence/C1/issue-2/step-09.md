# C1 issue 2 — step 09 (revision 2)

- Build SHA: a54dcc9f56abb091f378f2086a496e61ef424373 (= worktree HEAD, branch chore/mechanical-tools-ledger; `git diff --name-only e681144..a54dcc9 -- . ":(exclude).agents/"` prints nothing, so the code is identical to e681144)
- Step revision tested: 2
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together). ../c1-scratch/c1-prompts was removed and recreated empty before step 6. Revision-1 evidence for this step is preserved separately as step-NN-r1.md and was not touched.

**Do:** Render the filled ledger's B01 implementer prompt:

**Pass:** One line PROMPT <path> NONCE <12 hex>; exit code 0; the path does not contain the nonce; the file contains the issued I-05/02-batches-01-smoke-batch.md text verbatim, its last non-empty line carries the nonce, and it contains none of the tokens [CHANGE_ID], [WORKTREE_PATH], [FENCE FILES], [VALIDATION COMMANDS].

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/prompt.mjs --ledger .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-003/I-05 --role implementer --batch B01 --facts .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-07/facts.json --out ../c1-scratch/c1-prompts
```

Exit code: 0

Output (tail, ≤20 lines):

```
PROMPT /home/timetotilt/worktrees/os923/c1-scratch/c1-prompts/C1-20260924-smoke-B01-implementer-97eab5afd815.md NONCE 4c30f66be745
```

## Notes

Checks on the written file (node one-off, read-only):

- nonce `4c30f66be745` is 12 hex digits; `grep -c 4c30f66be745` on the path gives 0, so the path does not contain it
- raw `includes()` of issue-003 I-05/02-batches-01-smoke-batch.md (786 bytes, hash-verified against validation-003) is true
- last non-empty line is `Line 2, directly under line 1: NONCE 4c30f66be745`, so it carries the nonce
- tokens [CHANGE_ID], [WORKTREE_PATH], [FENCE FILES], [VALIDATION COMMANDS] are all absent
- ../c1-scratch/c1-prompts (recreated empty before step 6) held exactly this one file afterwards

## Verdict

PASS — one PROMPT line with a 12-hex nonce, exit 0; nonce not in the path; batch text is in the file verbatim; the last non-empty line carries the nonce; none of the four tokens appear.
