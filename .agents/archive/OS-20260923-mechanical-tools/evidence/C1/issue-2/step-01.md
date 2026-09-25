# C1 issue 2 — step 01 (revision 3)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 3
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Run the repository's own validation recipe through the wrapper (it takes about a minute here; allow up to ten):

**Pass:** Exactly one output line beginning PASS tests ; exit code 0; the log file exists and ends with the reporter's summary, whose ℹ fail is 0 and whose ℹ skipped equals the line's total minus its passed count (0 on Windows; on Linux 2, the Windows-only pair in tests/validate.test.cjs); on Linux the line reads PASS tests <p>/<t>, 2 skipped (…), on Windows the plain PASS tests <t>/<t> (…).

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/validate.mjs --spec .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-02/spec.json --log ../c1-scratch/c1-validate-repo.log --timeout 570
```

Exit code: 0

Output (tail, ≤20 lines):

```
PASS tests 510/512, 2 skipped (23s)
```

## Notes

Log `../c1-scratch/c1-validate-repo.log` exists (44026 bytes). Its tail:

```
✔ --cwd sets where steps run (38.432441ms)
✔ durations read as seconds below a minute and minutes with padded seconds from one minute up (0.089071ms)
ℹ tests 512
ℹ suites 0
ℹ pass 510
ℹ fail 0
ℹ cancelled 0
ℹ skipped 2
ℹ todo 0
ℹ duration_ms 22694.931458
```

The two skipped tests (log lines 519–520, both defined in tests/validate.test.cjs):

```
﹣ on Windows a bash that alters a quoted script is skipped for a later intact one, and refused when none follows (0.285299ms) # Windows only: elsewhere argv reaches bash intact by construction
﹣ on Windows the bash a step uses is resolved per PATH within one process (0.097436ms) # Windows only: elsewhere bash is not resolved by the tool
```

Checks: one output line; exit 0; fail 0; skipped 2 = 512 − 510; form `PASS tests <p>/<t>, 2 skipped (…)`.

## Verdict

PASS — single line `PASS tests 510/512, 2 skipped (23s)`, exit 0, log ends with the summary: fail 0, skipped 2 = 512 − 510, both skips being the Windows-only pair in tests/validate.test.cjs.
