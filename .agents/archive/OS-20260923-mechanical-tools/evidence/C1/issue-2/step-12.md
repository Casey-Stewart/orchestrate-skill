# C1 issue 2 — step 12 (revision 2)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 2
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Run it with a mutation whose anchor is absent:

**Pass:** Exactly one line, ANCHOR-MISSING m3, and exit code 2 — no CONTROL line, no mutation line, no summary.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/mutate.mjs --repo ../c1-scratch/c1-fixture --ref HEAD --mutations .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-09/muts-bad-anchor.json --validate .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-09/validate.json --log ../c1-scratch/c1-mutate-bad.log
```

Exit code: 2

Output (tail, ≤20 lines):

```
ANCHOR-MISSING m3
```

### Run 2

```
$ git -C ../c1-scratch/c1-fixture status --porcelain
```

Exit code: 0

Output (tail, ≤20 lines):

```
(no output)
```

## Notes

Fixture clone `git status --porcelain` after the run: empty.

## Verdict

PASS — exactly `ANCHOR-MISSING m3`, exit 2, with no CONTROL, mutation or summary line.
