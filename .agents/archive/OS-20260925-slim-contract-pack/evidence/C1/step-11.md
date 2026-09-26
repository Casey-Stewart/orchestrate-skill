# C1 step 11 (revision 1)

- Integration SHA: f770be16140a0e4719886e6475d7d0306ca43ac2
- Step revision tested: 1
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD f770be1)
- Section 5: Conductor and agent budget rules (B03). Inputs: none.

## Do

```bash
grep -n "unlike the reviewer and the test hunter" .claude/agents/qa-runner.md
echo $?
```

## Pass

The grep prints nothing and the echo prints 1 (BL-034).

## Commands run and exit codes

1. Input check: none — this step names no issued input.
2. The block's bytes, extracted mechanically from the issued prompt to a scratch `step-11.sh` (86 bytes, sha256 `72e80fb3205af95da6df087a6271198031d64bc882a52774c1b736c61ae7021d`), run as `bash step-11.sh` from the worktree root — exit 0 (the echo's status); grep's own status is the `1` the echo printed; stderr empty, so the file was read (a missing file gives status 2 and a stderr line).
3. Live control (read-only): `git grep -n "unlike the reviewer and the test hunter" edd2f1e -- .claude/agents/qa-runner.md` exits 0, hitting line 11 at the ledger base ("This role keeps `Write` and `Edit` on purpose, unlike the reviewer and the test hunter."), so the step distinguishes the fix. At f770be1 lines 11–12 read: "This role keeps `Write` and `Edit` on purpose; the reviewer and the test hunter hold no `Edit`, and their `Write` reaches only their findings file and scratchpad scratch."

## Output tail

```text
[stdout]
1
[stderr]
(empty)
[exit status of bash step-11.sh] 0
```

## Verdict

PASS — grep printed nothing and the echo printed 1: the BL-034 wording is gone from the build's qa-runner.md (present at the base).
