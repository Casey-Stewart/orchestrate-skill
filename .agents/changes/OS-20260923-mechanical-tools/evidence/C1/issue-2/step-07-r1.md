# C1 issue 2 — step 07 (revision 1)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Check the same contract with one hex digit of its pin changed:

**Pass:** One line, SKILL MISMATCH pinned <hash> actual <hash> with two different hashes; exit code 1.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/check-ledger.mjs skill --contract .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-06/00-READBEFORE.md
```

Exit code: 1

Output (tail, ≤20 lines):

```
SKILL MISMATCH pinned 4680cd3687b9236a272e8bbee99b9db319e97ea053acc5963828ad7d058d3171 actual 354f4dd29eedeb1ba2a2499e508c12b043f5014de08e7d8ee65ead3302b5d67f
```

## Notes

Caveat for the reader: judged literally this passes. But step 6 shows the unaltered pin also mismatches on this build, so this run no longer shows that a one-digit change turns a MATCH into a MISMATCH. The mismatch would appear whether or not the digit had been altered.

## Verdict

PASS — one line `SKILL MISMATCH pinned 4680cd…3171 actual 354f4d…d67f` with two different hashes, exit 1. This is weaker evidence than intended: see the caveat and step 6.
