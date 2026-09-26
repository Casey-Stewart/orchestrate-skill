# C1 step 08 (revision 1)

- Integration SHA: f770be16140a0e4719886e6475d7d0306ca43ac2
- Step revision tested: 1
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD f770be1)
- Section 4: Tool CLIs through any linked path; git environment scrubbed (B02). Inputs: none.

## Do

```bash
node orchestrate/tools/mutate.mjs --help | grep -c "a counted step"
```

## Pass

Prints 1 or more, exit 0 (BL-041).

## Commands run and exit codes

1. Input check: none — this step names no issued input.
2. The block's bytes, extracted mechanically from the issued prompt to a scratch `step-08.sh` (68 bytes, sha256 `7b021251d51c0aa09b957e80b37a211c00363414f32c9f7d8866b9e3697dfe19`), run as `bash step-08.sh` from the worktree root — exit 0; stderr empty. It was run under `strace -f -e trace=execve,exit_group` writing only to a log outside the worktree. The trace shows both pipeline members' own statuses: `node orchestrate/tools/mutate.mjs --help` exited 0 and `grep -c "a counted step"` exited 0.
3. Corroboration (read-only): the matching `--help` line is line 14, "… a counted step in which no test passed or failed, …" (BL-041's no-pass cause). Live control: `git show edd2f1e:orchestrate/tools/mutate.mjs | grep -c "a counted step"` prints 0 at the ledger base and 1 at f770be1, so the step distinguishes the fix.

## Output tail

```text
[stdout]
1
[stderr]
(empty)
[exit status of bash step-08.sh] 0
[mutate.mjs process, from the trace] exited with 0
```

## Verdict

PASS — printed 1 and exited 0; mutate.mjs itself also exited 0.
