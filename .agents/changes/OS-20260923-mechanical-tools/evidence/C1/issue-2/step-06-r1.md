# C1 issue 2 — step 06 (revision 1)

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger; no non-`.agents/` diff from the build)
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Commands run from /home/timetotilt/worktrees/os923/int, byte for byte as issued (stdout+stderr captured together).

**Do:** Check the pin of a ledger filled from the templates:

**Pass:** One line, SKILL MATCH <hash>; exit code 0.

## Commands, exit codes, output

### Run 1

```
$ node orchestrate/tools/check-ledger.mjs skill --contract .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-05/00-READBEFORE.md
```

Exit code: 1

Output (tail, ≤20 lines):

```
SKILL MISMATCH pinned 4680cd3687b9236a272e8bbee99b9db319e97ea053acc5963828ad7d058d3170 actual 354f4dd29eedeb1ba2a2499e508c12b043f5014de08e7d8ee65ead3302b5d67f
```

## Notes

Observations (not a fix, not a re-run with other inputs):

- The issued I-05/00-READBEFORE.md line 4 pins skill `orchestrate` at sha256 `4680cd3687b9236a272e8bbee99b9db319e97ea053acc5963828ad7d058d3170`. The file's sha256/size match validation-001/registry.json (step 00), so the input is unmodified.
- Issue-1 evidence (evidence/C1/step-06.md, build 450d7e970e935bdd7b93b3acc4516b996fca59e8) recorded `SKILL MATCH 4680cd36…3170`, so the pin was right for that build.
- `git diff --name-only 450d7e9 e681144 -- orchestrate` lists orchestrate/references/subagent-prompts.md, orchestrate/tools/mutate.mjs and orchestrate/tools/validate.mjs. These are the B01/B05 fix-ups, and they move the skill hash to 354f4dd2…d67f (step 5).
- So the issue-001 I-05 contract (and the I-06 copy derived from it) carries a pin taken on the old skill contents. The step was re-issued without re-pinning its input.

## Verdict

FAIL — printed `SKILL MISMATCH pinned 4680cd36…3170 actual 354f4dd2…d67f`, exit 1, not `SKILL MATCH <hash>` exit 0. The issued I-05 pin is the issue-1 skill hash, and the B01/B05 fix-ups changed three files under orchestrate/.
