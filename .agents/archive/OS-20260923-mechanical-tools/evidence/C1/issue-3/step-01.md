# C1 issue-3 — step 01 (revision 4)

- Build: `f1fde3c026558414bd1104163f6366524bd90df5` (worktree HEAD `db75c166c709c9e36e031e676bfa8f04896b28de`, branch `chore/mechanical-tools-ledger`)
- Revision: 4
- Environment: Linux 7.0.0-31-generic, Node v24.20.0, git version 2.53.0, PowerShell 7.6.5 as pwsh
- Run: 2026-09-25, from `/home/timetotilt/worktrees/os923/int`

## Pre-flight

- `git merge-base --is-ancestor f1fde3c026558414bd1104163f6366524bd90df5 HEAD` → exit 0
- `git diff --name-only f1fde3c026558414bd1104163f6366524bd90df5..HEAD -- . ":(exclude).agents/"` → no output
- `git status --porcelain` → empty
- `rm -rf ../c1-scratch && mkdir -p ../c1-scratch` → done

## Input hash check

| Input | Registry entry `I-02.spec.json` | Measured |
|---|---|---|
| `.agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-02/spec.json` | sha256 `049841ea0a1e4ac48bd72d3736b80ab98a8d339fe9bb9c02669d90354a15571d`, size 511 | sha256 `049841ea0a1e4ac48bd72d3736b80ab98a8d339fe9bb9c02669d90354a15571d` (`sha256sum`, raw bytes), size 511 (`stat -c %s`) |

Match on both.

## Step text (revision 4)

Do, from the worktree root, byte for byte:

    $ node orchestrate/tools/validate.mjs --spec .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-02/spec.json --log ../c1-scratch/c1-validate-repo.log --timeout 570

Pass: Exactly one output line beginning `PASS tests `; exit code 0; the log file exists and ends with the reporter's summary, whose `ℹ fail` is 0 and whose `ℹ skipped` equals the line's total minus its passed count (0 on Windows; on Linux 2, the Windows-only pair in tests/validate.test.cjs); on Linux the line reads `PASS tests <p>/<t>, 2 skipped (…)`, on Windows the plain `PASS tests <t>/<t> (…)`.

## Run

Command (stdout+stderr captured to `../c1-scratch/out1.txt`):

    node orchestrate/tools/validate.mjs --spec .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-02/spec.json --log ../c1-scratch/c1-validate-repo.log --timeout 570

Exit code: **0**

Output (complete, one line):

    PASS tests 510/512, 2 skipped (23s)

Log `../c1-scratch/c1-validate-repo.log` exists (44031 bytes); tail (last 20 lines, file ends with `\n` after `duration_ms`):

    ﹣ on Windows the bash a step uses is resolved per PATH within one process (0.103159ms) # Windows only: elsewhere bash is not resolved by the tool
    ✔ a shell step outliving its timeout ends with its grandchildren killed (5035.373439ms)
    ✔ a step that exits while a stray descendant holds its output ends after a grace period (5050.084633ms)
    ✔ live: the real spec and TAP reporters report the failing name and counts 1/2 (297.841801ms)
    ✔ live: a test file that fails to load comes back in loadFailures, absolute or relative, both reporters (219.764359ms)
    ✔ live: a suite whose only test is skipped, or that runs nothing, fails; a partly skipped one passes with its count (371.241688ms)
    ✔ live: a test file that registers no tests is a load failure, relative, absolute or discovered; real tests beside it still pass (1135.28247ms)
    ✔ invalid specs are UNKNOWN with exit 2 and run nothing; a valid one of the same shape runs (503.40005ms)
    ✔ flags: unknown, duplicate, missing or malformed are UNKNOWN exit 2; --help exits 0 (341.814017ms)
    ✔ --help states the pass rule, the skipped display and count, and the empty-file rule with its false rejection (19.151539ms)
    ✔ --cwd sets where steps run (36.734373ms)
    ✔ durations read as seconds below a minute and minutes with padded seconds from one minute up (0.091582ms)
    ℹ tests 512
    ℹ suites 0
    ℹ pass 510
    ℹ fail 0
    ℹ cancelled 0
    ℹ skipped 2
    ℹ todo 0
    ℹ duration_ms 22572.215896

The two skipped tests (log lines 519–520, the `﹣` marker; both are the `t.skip('Windows only: …')` tests at `tests/validate.test.cjs:851` and `:930`):

1. `on Windows a bash that alters a quoted script is skipped for a later intact one, and refused when none follows` — `# Windows only: elsewhere argv reaches bash intact by construction`
2. `on Windows the bash a step uses is resolved per PATH within one process` — `# Windows only: elsewhere bash is not resolved by the tool`

## Pass-condition check (literal)

- Exactly one output line beginning `PASS tests `: yes — output is exactly one line, `PASS tests 510/512, 2 skipped (23s)`.
- Exit code 0: yes.
- Log exists and ends with the reporter's summary: yes (last line `ℹ duration_ms 22572.215896`).
- `ℹ fail` is 0: yes.
- `ℹ skipped` equals total minus passed: 512 − 510 = 2, log says `ℹ skipped 2`; Linux expects 2: yes, and the two are the Windows-only pair in `tests/validate.test.cjs`.
- Linux form `PASS tests <p>/<t>, 2 skipped (…)`: yes.

## Extra evidence (not part of the verdict) — colour run

Command (FORCE_COLOR=1 in the environment; output captured to `../c1-scratch/out2.txt`):

    FORCE_COLOR=1 node orchestrate/tools/validate.mjs --spec .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-02/spec.json --log ../c1-scratch/c1-validate-repo-color.log --timeout 570

Exit code: **0**

Output: `PASS tests 510/512, 2 skipped (23s)`

The colour took effect: `../c1-scratch/c1-validate-repo-color.log` has 520 lines containing ESC (0x1b), and its summary lines are wrapped in colour codes (e.g. `ESC[34mℹ fail 0ESC[39m`, `ESC[34mℹ skipped 2ESC[39m`).

## Reset

The issued input was read in place and not modified (`git status --porcelain` empty after both runs). Writes went only to `../c1-scratch/` (two logs, two captured-output files) and this evidence file.

## Verdict

PASS — one `PASS tests 510/512, 2 skipped (23s)` line, exit 0, log ends in the summary with `ℹ fail 0` and `ℹ skipped 2` (= 512 − 510, the Windows-only pair).
