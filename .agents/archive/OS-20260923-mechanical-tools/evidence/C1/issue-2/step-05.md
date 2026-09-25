# C1 issue 2 — step 05 (revision 1)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Hash the skill directory twice, then once more against the zero-pinned contract:

**Pass:** The first two lines are identical and read SKILL <hash> <count> files; the third reads SKILL MISMATCH pinned … actual … with the same actual hash, exit code 1.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/check-ledger.mjs skill --dir orchestrate
```

Exit code: 0

Output (tail, ≤20 lines):

```
SKILL 354f4dd29eedeb1ba2a2499e508c12b043f5014de08e7d8ee65ead3302b5d67f 23 files
```

### Run 2

```
$ node orchestrate/tools/check-ledger.mjs skill --dir orchestrate
```

Exit code: 0

Output (tail, ≤20 lines):

```
SKILL 354f4dd29eedeb1ba2a2499e508c12b043f5014de08e7d8ee65ead3302b5d67f 23 files
```

### Run 3

```
$ node orchestrate/tools/check-ledger.mjs skill --dir orchestrate --contract .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-04/00-READBEFORE.md
```

Exit code: 1

Output (tail, ≤20 lines):

```
SKILL MISMATCH pinned 0000000000000000000000000000000000000000000000000000000000000000 actual 354f4dd29eedeb1ba2a2499e508c12b043f5014de08e7d8ee65ead3302b5d67f
```

## Verdict

PASS — runs 1 and 2 print the identical `SKILL 354f4dd2…d67f 23 files`; run 3 prints `SKILL MISMATCH pinned 000…0 actual 354f4dd2…d67f` (same actual hash), exit 1.
