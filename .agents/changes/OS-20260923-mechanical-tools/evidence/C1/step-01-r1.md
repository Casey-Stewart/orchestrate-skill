# C1 step 01 (revision 1)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.

**Do:** `node orchestrate/tools/validate.mjs --spec .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-02/spec.json --log ../c1-scratch/c1-validate-repo.log --timeout 570`

**Pass:** exactly one output line beginning `PASS tests `, whose passed count equals its total; exit code 0; the log file exists and ends with the reporter's summary.

## Commands and exit codes

- The Do command, from the worktree root (stdout+stderr captured) — exit **0**
- `ls -la ../c1-scratch/c1-validate-repo.log; tail -20 ../c1-scratch/c1-validate-repo.log` — exit 0

## Output

```
PASS tests 497/499 (21s)
```

One line. Log exists (42327 bytes); tail:

```
﹣ on Windows a bash that alters a quoted script is skipped for a later intact one, and refused when none follows (0.293131ms) # Windows only: elsewhere argv reaches bash intact by construction
﹣ on Windows the bash a step uses is resolved per PATH within one process (0.095619ms) # Windows only: elsewhere bash is not resolved by the tool
✔ a shell step outliving its timeout ends with its grandchildren killed (5038.103401ms)
✔ a step that exits while a stray descendant holds its output ends after a grace period (5051.226171ms)
✔ live: the real spec and TAP reporters report the failing name and counts 1/2 (301.752076ms)
✔ live: a test file that fails to load comes back in loadFailures, absolute or relative, both reporters (223.356282ms)
✔ invalid specs are UNKNOWN with exit 2 and run nothing; a valid one of the same shape runs (524.578656ms)
✔ flags: unknown, duplicate, missing or malformed are UNKNOWN exit 2; --help exits 0 (346.485323ms)
✔ --cwd sets where steps run (38.078042ms)
✔ durations read as seconds below a minute and minutes with padded seconds from one minute up (0.090539ms)
ℹ tests 499
ℹ suites 0
ℹ pass 497
ℹ fail 0
ℹ cancelled 0
ℹ skipped 2
ℹ todo 0
ℹ duration_ms 21177.405159
```

## Judgement per clause

- exactly one line beginning `PASS tests ` — met
- passed count equals its total — **NOT met**: 497 passed of 499 total. `validate.mjs` prints `${passed}/${total}` where total
  is the reporter's `tests` count (it includes skips); the 2 non-passes are the two `Windows only` skipped tests, 0 failed.
- exit code 0 — met
- log exists and ends with the reporter's summary — met

## Verdict

FAIL — output is `PASS tests 497/499`: passed (497) does not equal total (499); the gap is 2 Windows-only skips on this Linux
host, 0 failures. The Pass clause as written does not allow for skips; the step text likely needs revising, not the tool.
