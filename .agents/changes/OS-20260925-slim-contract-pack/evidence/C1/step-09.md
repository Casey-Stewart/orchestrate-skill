# C1 step 09 (revision 1)

- Integration SHA: f770be16140a0e4719886e6475d7d0306ca43ac2
- Step revision tested: 1
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD f770be1)
- Section 5: Conductor and agent budget rules (B03). Inputs: none.

## Do

```bash
grep -rn "ReadNotifications" orchestrate/
```

## Pass

At least one hit, and every hit is the no-polling rule: it names the tool only to forbid waiting on it.

## Commands run and exit codes

1. Input check: none — this step names no issued input.
2. The block's bytes, extracted mechanically from the issued prompt to a scratch `step-09.sh` (42 bytes, sha256 `3b2599ec98c68a35de8556bae74b48495217364d1aeedc3fec84df2acef0d55c`), run as `bash step-09.sh` from the worktree root — exit 0 (grep matched); stderr empty; 2 hits.
3. Reading each hit's whole sentence (read-only `sed -n`; protocol.md lines 50–52, SKILL.md lines 157–159) shows the same text in both places: "The orchestrator never polls: it never calls `ReadNotifications` to wait for a sub-agent and never sleeps; when the only remaining work waits on sub-agents it ends the turn, and the task notification resumes it." Neither sentence mentions the tool for any other purpose.

## Output tail

```text
[stdout]
orchestrate/references/protocol.md:50:  The orchestrator never polls: it never calls `ReadNotifications` to wait for a sub-agent
orchestrate/SKILL.md:157:- The orchestrator never polls: it never calls `ReadNotifications` to wait for a sub-agent
[stderr]
(empty)
[exit status of bash step-09.sh] 0
```

## Verdict

PASS — 2 hits, and each is the no-polling rule: it names ReadNotifications only to forbid calling it to wait for a sub-agent.
