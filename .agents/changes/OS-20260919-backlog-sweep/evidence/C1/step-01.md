# Step 01 — The canary

**Tag**: Build check
**Runner**: agent

## Command

```
node orchestrate/tools/git-evidence.mjs worktrees --repo .
```

Run from the repository root (`C:\Users\fatbo\OneDrive\Desktop\Claude Testing\orchestrate-skill`).

**Exit code**: `0`
**stderr**: empty

## Output (full JSON, pretty-printed)

```json
{
  "operation": "worktrees",
  "repo": "C:\Users\fatbo\OneDrive\Desktop\Claude Testing\orchestrate-skill",
  "completeness": "complete",
  "evidence": {
    "worktrees": [
      {
        "path": "C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int",
        "head": "1605eb59626104a5893e6bbe36b86828366a3482",
        "branch": "refs/heads/codex/readonly-evidence-smoke-inputs-ledger",
        "cleanliness": "clean",
        "status": [],
        "bare": false,
        "prunable": null
      },
      {
        "path": "C:/Users/fatbo/OneDrive/Desktop/Claude Testing/orchestrate-skill",
        "head": "e79d3781b9290d54b6c4996989d7b19b6b358422",
        "branch": "refs/heads/chore/backlog-sweep-ledger",
        "cleanliness": "dirty",
        "status": [
          { "status": "??", "path": ".agents/changes/OS-20260919-backlog-sweep/smoke-C1.md", "originalPath": null }
        ],
        "bare": false,
        "prunable": null
      }
    ]
  },
  "diagnostics": []
}
```

## Pass conditions, checked one at a time

| Condition | Observed | Met |
| --- | --- | --- |
| exit 0 | `0` | yes |
| `completeness: complete` | `complete` | yes |
| every `cleanliness` is `clean` or `dirty`, never `unknown` | 2 worktrees: `clean`, `dirty` | yes |
| no `unsafe-filter` diagnostic anywhere | `diagnostics: []` (empty) | yes |

The old/base behaviour described in the Aside (exit 2, `completeness: partial`, every
worktree `unknown`, one `unsafe-filter` per worktree) was **not** observed. Judged by
shape, not count: 2 worktrees were inventoried and both resolved.

The `dirty` on the main worktree is the untracked `smoke-C1.md` (the smoke script itself),
which was already untracked before this run began. That is a legitimate `dirty`, not a
degraded result, and it is the more useful of the two outcomes here: it shows the helper
actually reached and parsed a real `git status` rather than falling back.

## Verdict

PASS — exit 0 with `completeness: complete`, both worktrees resolved to `clean`/`dirty`, and an empty `diagnostics` array with no `unsafe-filter` anywhere.
