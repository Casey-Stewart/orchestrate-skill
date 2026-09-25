# C1 issue 2 — step 07 (revision 2)

- Build SHA: a54dcc9f56abb091f378f2086a496e61ef424373 (= worktree HEAD, branch chore/mechanical-tools-ledger; `git diff --name-only e681144..a54dcc9 -- . ":(exclude).agents/"` prints nothing, so the code is identical to e681144)
- Step revision tested: 2
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together). ../c1-scratch/c1-prompts was removed and recreated empty before step 6. Revision-1 evidence for this step is preserved separately as step-NN-r1.md and was not touched.

**Do:** Check the same contract with one hex digit of its pin changed:

**Pass:** One line, SKILL MISMATCH pinned <hash> actual <hash> with two different hashes; exit code 1.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/check-ledger.mjs skill --contract .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-003/I-06/00-READBEFORE.md
```

Exit code: 1

Output (tail, ≤20 lines):

```
SKILL MISMATCH pinned 354f4dd29eedeb1ba2a2499e508c12b043f5014de08e7d8ee65ead3302b5d670 actual 354f4dd29eedeb1ba2a2499e508c12b043f5014de08e7d8ee65ead3302b5d67f
```

## Notes

Is the mismatch caused by the one changed digit alone? Yes:

- `cmp -l` of issue-003 I-05/00-READBEFORE.md against I-06/00-READBEFORE.md lists exactly ONE differing byte: offset 184, line 4, octal 146 ('f') in I-05 against octal 60 ('0') in I-06. That byte is the last hex digit of the pin.
- The unaltered I-05 pin gives SKILL MATCH on this build (step 6, rev 2).
- The two hashes printed here differ only in that final digit (…d67f actual against …d670 pinned).

## Verdict

PASS — one line `SKILL MISMATCH pinned …d670 actual …d67f` with two different hashes, exit 1. The single changed digit is the only difference from the contract that matches in step 6.
