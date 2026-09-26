# C1 step 14 (revision 1)

- Integration SHA: f770be16140a0e4719886e6475d7d0306ca43ac2
- Step revision tested: 1
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD f770be1)
- Section 6: The prose-only polish classifier (B04). Inputs: none.

## Do

```bash
grep -n "validate.test.cjs:[0-9]" tests/tool-wiring.test.cjs
echo $?
```

## Pass

The grep prints nothing and the echo prints 1 (BL-042).

## Commands run and exit codes

1. Input check: none — this step names no issued input.
2. The block's bytes, extracted mechanically from the issued prompt to a scratch `step-14.sh` (69 bytes, sha256 `c4eb041ccbcc6d6ef57a9c250bc1e2b2741aee48091aae174db2bd8dd5a93492`), run as `bash step-14.sh` from the worktree root — exit 0 (the echo's status). grep's own status is the `1` the echo printed. Stderr was empty, so the file (2030 lines) was read.
3. Live control (read-only): at the ledger base, `git grep -n "validate.test.cjs:[0-9]" edd2f1e -- tests/tool-wiring.test.cjs` exits 0 with a hit at line 1290, "// awk (tests/validate.test.cjs:611-623). …" — the stale pointer BL-042 names. The step therefore distinguishes the fix. At f770be1, the pointer at line 1413 names "the Git for Windows bash set-up under which tests/validate.test.cjs runs its test …" by title. A new `[BL-042]` test (line 1426) pins that. Its own pattern is built by concatenation (line 1439), so it does not match this grep.

## Output tail

```text
[stdout]
1
[stderr]
(empty)
[exit status of bash step-14.sh] 0
```

## Verdict

PASS — the grep printed nothing and the echo printed 1: tests/tool-wiring.test.cjs has no line-range pointer into validate.test.cjs (the base had one at line 1290).
