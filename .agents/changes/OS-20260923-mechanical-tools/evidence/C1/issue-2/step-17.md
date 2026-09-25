# C1 issue 2 — step 17 (revision 1)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Clone the fail-scenario fixture, then run your scenario — the scoped suite's only test is skipped:

**Pass:** The mutate command prints exactly one line, CONTROL FAILED FAIL tests no test passed (0/1, 1 skipped) — log: …, and exits 2; no mutation is applied.

## Commands, exit codes, output

### Run 1

```
$ git clone .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-002/I-12/fixture.bundle ../c1-scratch/c1-fail-fixture
```

Exit code: 0

Output (tail, ≤20 lines):

```
Cloning into '../c1-scratch/c1-fail-fixture'...
```

### Run 2

```
$ node orchestrate/tools/mutate.mjs --repo ../c1-scratch/c1-fail-fixture --ref HEAD --mutations .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-002/I-12/muts-a.json --validate .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-002/I-12/validate-a.json --log ../c1-scratch/c1-fail-a.log
```

Exit code: 2

Output (tail, ≤20 lines):

```
CONTROL FAILED FAIL tests no test passed (0/1, 1 skipped) — log: /home/timetotilt/worktrees/os923/c1-scratch/c1-fail-a.log
```

### Run 3

```
$ git -C ../c1-scratch/c1-fail-fixture status --porcelain
```

Exit code: 0

Output (tail, ≤20 lines):

```
(no output)
```

## Notes

No mutation applied: c1-fail-a.log records only the checkout and the control (`grep -c "==> mutate: a1"` → 0). Log tail:

```
==> mutate: checkout eef02bd922f203a57d1add97832d78190b9a88ac into /tmp/mut-oY4uGU/c
==> mutate: control
==> step tests: argv ["node","--test","--test-reporter=spec","feature.test.cjs"]
﹣ feature adds (0.395703ms) # feature off
ℹ tests 1
ℹ pass 0
ℹ fail 0
ℹ skipped 1
```

Fixture clone `git status --porcelain` after the run: empty. No /tmp/mut-* directory remained afterwards.

## Verdict

PASS — exactly one line `CONTROL FAILED FAIL tests no test passed (0/1, 1 skipped) — log: …`, exit 2; the log shows no mutation was applied.
