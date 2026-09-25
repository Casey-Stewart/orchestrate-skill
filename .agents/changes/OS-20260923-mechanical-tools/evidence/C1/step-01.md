# C1 step 01 (revision 2)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 2 (revision-1 evidence preserved separately as `step-01-r1.md`, verdict FAIL)
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.
- Worktree state before the run (`git status --porcelain --untracked-files=all`): tracked changes only in
  `02-batches-01-validate-wrapper.md` and `02-batches-02-ledger-parser.md`, and `git diff` shows both confined to their
  Smoke sections (the revision-2 Pass texts for steps 1 and 3). Untracked: the QA evidence files, `step-01-r1.md` among
  them. Nothing else.

**Do:** `node orchestrate/tools/validate.mjs --spec .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-02/spec.json --log ../c1-scratch/c1-validate-repo.log --timeout 570`

**Pass:** exactly one output line beginning `PASS tests `; exit code 0; the log file exists and ends with the reporter's summary, whose `ℹ fail` is 0 and whose `ℹ skipped` equals the line's total minus its passed count (0 on Windows; on Linux 2, the Windows-only pair in `tests/validate.test.cjs`).

## Commands and exit codes

1. `rm -f ../c1-scratch/c1-validate-repo.log` — exit 0 (a later `ls` confirmed the file was gone)
2. The Do command, from the worktree root (stdout+stderr captured) — exit **0**
3. `ls -la` / `tail -20` of the log; `grep -n '^﹣'` (skipped tests) and `grep -c '^✖'` (failures: 0) on the log — exit 0
4. `grep -rnF` for the two skipped names across the sources — both appear only in `tests/validate.test.cjs` (lines 695 and 774),
   each opening with `if (process.platform !== 'win32') { t.skip('Windows only: …'); return; }`

## Output

```
PASS tests 497/499 (21s)
```

One line. Log exists (42334 bytes); tail:

```
﹣ on Windows a bash that alters a quoted script is skipped for a later intact one, and refused when none follows (0.253048ms) # Windows only: elsewhere argv reaches bash intact by construction
﹣ on Windows the bash a step uses is resolved per PATH within one process (0.084312ms) # Windows only: elsewhere bash is not resolved by the tool
✔ a shell step outliving its timeout ends with its grandchildren killed (5037.187575ms)
✔ a step that exits while a stray descendant holds its output ends after a grace period (5049.480802ms)
✔ live: the real spec and TAP reporters report the failing name and counts 1/2 (303.316416ms)
✔ live: a test file that fails to load comes back in loadFailures, absolute or relative, both reporters (222.26672ms)
✔ invalid specs are UNKNOWN with exit 2 and run nothing; a valid one of the same shape runs (502.549196ms)
✔ flags: unknown, duplicate, missing or malformed are UNKNOWN exit 2; --help exits 0 (348.027836ms)
✔ --cwd sets where steps run (40.739957ms)
✔ durations read as seconds below a minute and minutes with padded seconds from one minute up (0.083293ms)
ℹ tests 499
ℹ suites 0
ℹ pass 497
ℹ fail 0
ℹ cancelled 0
ℹ skipped 2
ℹ todo 0
ℹ duration_ms 21190.860965
```

## Judgement per clause

- exactly one line beginning `PASS tests ` — met (`PASS tests 497/499 (21s)`)
- exit code 0 — met
- log exists and ends with the reporter's summary — met (the last line is `ℹ duration_ms`)
- `ℹ fail` is 0 — met
- `ℹ skipped` equals total minus passed — met: 499 − 497 = 2 = `ℹ skipped 2`
- on Linux, the 2 are the Windows-only pair in `tests/validate.test.cjs` — met: the only two skipped (`﹣`) lines in the log
  (log lines 509–510) are "on Windows a bash that alters a quoted script is skipped for a later intact one, and refused
  when none follows" and "on Windows the bash a step uses is resolved per PATH within one process", which are
  `tests/validate.test.cjs:695` and `:774`

## Verdict

PASS — `PASS tests 497/499`, exit 0, summary shows `ℹ fail 0` and `ℹ skipped 2` (= 499 − 497). The 2 skipped are the Windows-only pair in tests/validate.test.cjs.
