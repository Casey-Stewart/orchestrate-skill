# C1 step 12 (revision 1)

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8
- Step revision tested: 1
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.

**Do:** `node orchestrate/tools/mutate.mjs --repo ../c1-scratch/c1-fixture --ref HEAD --mutations .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-09/muts-bad-anchor.json --validate .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001/I-09/validate.json --log ../c1-scratch/c1-mutate-bad.log`

**Pass:** exactly one line, `ANCHOR-MISSING m3`, and exit code 2 — no `CONTROL` line, no mutation line, no summary.

## Commands and exit codes

1. The Do command, from the worktree root — exit **2**
2. `wc -l` of captured output → 1; `git -C ../c1-scratch/c1-fixture status --porcelain` → empty, exit 0

## Output

```
ANCHOR-MISSING m3
```

Log `../c1-scratch/c1-mutate-bad.log` (85 bytes) holds only the checkout line:
`==> mutate: checkout 1d478f6eb282c96c0ee0ee1e4e6c5823d0e5aa25 into /tmp/mut-pCO4E8/c` (temp dir gone afterwards).

## Verdict

PASS — exactly one line `ANCHOR-MISSING m3`, no CONTROL/mutation/summary line; exit 2.
