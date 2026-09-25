# C1 issue 2 — step 06 (revision 2)

- Build SHA: a54dcc9f56abb091f378f2086a496e61ef424373 (= worktree HEAD, branch chore/mechanical-tools-ledger; `git diff --name-only e681144..a54dcc9 -- . ":(exclude).agents/"` prints nothing, so the code is identical to e681144)
- Step revision tested: 2
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together). ../c1-scratch/c1-prompts was removed and recreated empty before step 6. Revision-1 evidence for this step is preserved separately as step-NN-r1.md and was not touched.

**Do:** Check the pin of a ledger filled from the templates:

**Pass:** One line, SKILL MATCH <hash>; exit code 0.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/check-ledger.mjs skill --contract .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-003/I-05/00-READBEFORE.md
```

Exit code: 0

Output (tail, ≤20 lines):

```
SKILL MATCH 354f4dd29eedeb1ba2a2499e508c12b043f5014de08e7d8ee65ead3302b5d67f
```

## Notes

### Input verification (issue-003 I-05 and I-06 against validation-003/registry.json)

Method: sha256 of raw bytes plus byte length, paths relative to .agents/changes/OS-20260923-mechanical-tools/ (scratchpad hashreg.mjs over the whole registry).

| registry | path | sha256 (actual) | size (actual) | result |
|---|---|---|---|---|
| validation-003 | evidence/C1/inputs/issue-003/I-05/00-READBEFORE.md | 435b76ebbe2674fcbc28b5565dfd20a416e8f1453f5107251e1c984e80f799a2 | 63388 | OK |
| validation-003 | evidence/C1/inputs/issue-003/I-05/00-request.md | 6bb630fceb909f8b1beba2a15bfcea2ce1e7789e2bb1fd88c395a9a058dc17ba | 122 | OK |
| validation-003 | evidence/C1/inputs/issue-003/I-05/01-plan.md | 3d00852adac3c78a65ba7ed7e7b25f9f811a7f43a0f39ecf6a6021913f205015 | 622 | OK |
| validation-003 | evidence/C1/inputs/issue-003/I-05/02-batches-01-smoke-batch.md | d8e9f4002618c5684c36f45811a81017185d878366dfcdb340ae7a3e9c679847 | 786 | OK |
| validation-003 | evidence/C1/inputs/issue-003/I-05/LOG.md | 524133edeb353ce4ce3a73155f2b7106f53671a2156c7ca09d22dc4f6ccffd94 | 510 | OK |
| validation-003 | evidence/C1/inputs/issue-003/I-05/PROGRESS.md | 31d16f94b26084f927fa091d8a9d4be2976ad864a023ec3805946b2f33ced3cc | 2322 | OK |
| validation-003 | evidence/C1/inputs/issue-003/I-05/validate.json | 733005c4029f1a94cf41733ded3a5ea9ad0de99f2ede75a53c6102e9e43d1a3a | 137 | OK |
| validation-003 | evidence/C1/inputs/issue-003/I-06/00-READBEFORE.md | 79b5e68341e811ef3a79716b9af025f7cf9db1b9d12c8d0ca56e6fae33326d06 | 63388 | OK |

Whole registry: TOTAL 31 distinct files hashed, 0 problem(s) (30 entries plus the independent-check file). validation-003/independent-check.md line 6: result ALL PASS (24/24).

Pins: I-05/00-READBEFORE.md line 4 pins `354f4dd29eedeb1ba2a2499e508c12b043f5014de08e7d8ee65ead3302b5d67f`, the same hash step 5 computed for `--dir orchestrate` on this code.

## Verdict

PASS — one line `SKILL MATCH 354f4dd29eedeb1ba2a2499e508c12b043f5014de08e7d8ee65ead3302b5d67f`, exit 0.
