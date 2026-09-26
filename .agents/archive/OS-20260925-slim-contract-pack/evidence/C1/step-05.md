# C1 step 05 (revision 1)

- Integration SHA: f770be16140a0e4719886e6475d7d0306ca43ac2
- Step revision tested: 1
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD f770be1)
- Section 3: One copy of the procedure — the slimmed contract (B01). Inputs: none.

## Do

```bash
grep -rnE "EVIDENCE_TOOL|FENCE_TOOL" orchestrate/
echo $?
```

## Pass

The grep prints nothing and the echo prints 1.

## Commands run and exit codes

1. Input check: none — this step names no issued input.
2. The block's bytes, extracted mechanically from the issued prompt to a scratch `step-05.sh` (58 bytes, sha256 `b04c937518e7e7320e54c1a413fe6054f7853eea6d242597bb2e494f46842d6d`), run as `bash step-05.sh` from the worktree root — exit 0 (the echo's status); grep's own status is the `1` the echo printed; stderr empty.
3. Live control (read-only, not part of the step): `git grep -nE "EVIDENCE_TOOL|FENCE_TOOL" edd2f1e -- orchestrate/` matches 12 lines at the ledger base (in `orchestrate/references/scaffolding.md` and `orchestrate/templates/00-READBEFORE.md`), so the pattern fires where the names exist and this zero is a real absence at the build.

## Output tail

```text
[stdout]
1
[stderr]
(empty)
[exit status of bash step-05.sh] 0
```

## Verdict

PASS — grep printed nothing and the echo printed 1: neither name appears anywhere under orchestrate/.
