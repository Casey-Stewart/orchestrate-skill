# Step 02 — Confirm the tree

**Runner**: agent

## Commands

```
git rev-parse --abbrev-ref HEAD
git rev-parse --short HEAD
```

## Output and exit codes

```
$ git rev-parse --abbrev-ref HEAD
chore/backlog-sweep-ledger
EXIT=0

$ git rev-parse --short HEAD
e79d378
EXIT=0
```

## Pass conditions

| Expected | Observed | Met |
| --- | --- | --- |
| branch `chore/backlog-sweep-ledger` | `chore/backlog-sweep-ledger` | yes |
| commit `e79d378` | `e79d378` | yes |

Full SHA for the record: `e79d3781b9290d54b6c4996989d7b19b6b358422`. No branch was switched
at any point in this run.

## Verdict

PASS — the checkout is on `chore/backlog-sweep-ledger` at `e79d378`, exactly the build the script names.
