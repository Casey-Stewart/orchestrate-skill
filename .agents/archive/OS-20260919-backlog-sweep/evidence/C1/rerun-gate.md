# Gate — prove you are on the right build (re-run)

**Runner**: agent (re-run against the corrected HTML page + `smoke-C1.json` sidecar).
The earlier `step-*.md` / `summary.md` in this directory executed a different, now-deleted
markdown draft and are superseded.

## Commands and exit codes

```
git branch --show-current                                  -> exit 0
git rev-parse --short HEAD                                 -> exit 0
node orchestrate/tools/git-evidence.mjs worktrees --repo . -> exit 0
```

Output:

```
chore/backlog-sweep-ledger
257e85d
{"operation":"worktrees","repo":"...orchestrate-skill","completeness":"complete",
 "evidence":{"worktrees":[ {...wt-int..., "cleanliness":"clean"},
                           {...orchestrate-skill, head 257e85dc..., "cleanliness":"clean"} ]},
 "diagnostics":[]}
```

## Gate checks

- Branch is `chore/backlog-sweep-ledger`. OK.
- HEAD `257e85d` is ahead of the tested build `e79d3781b9290d54b6c4996989d7b19b6b358422`.
  The allowance was verified, not assumed:
  - `git merge-base --is-ancestor e79d378 HEAD` -> exit **0** (buildSha is an ancestor).
  - `git diff --name-only e79d378..HEAD` lists 15 files; filtering out
    `.agents/changes/OS-20260919-backlog-sweep/` leaves **nothing**. Every later commit is
    confined to this checkpoint's ledger directory (LOG, PROGRESS, `evidence/C1/*`,
    `smoke-C1.html`, `smoke-C1.json`). The gate's "checkpoint artifacts only" allowance holds.
- **Canary**: third command exits `0`, JSON reads `"completeness":"complete"`, and
  `diagnostics` is `[]` — no `unsafe-filter` anywhere. This is the new behaviour, not the
  base behaviour (which the gate says exits 2 / `partial` / every worktree `unknown` /
  one `unsafe-filter` per worktree). Judged by shape, not by worktree count, as instructed.

## Verdict

PASS — branch, build ancestry and the artifact-only allowance all check out, and the canary shows the new behaviour (exit 0, complete, zero diagnostics).
