# Step 3 — BL-002 closed end to end (re-run)

## Command

```
node --test tests/protocol-contract.test.cjs
```
**Exit 0.**

## Named test

```
# Subtest: published helper recipes execute actual CLIs and generated batch grammar passes the real fence
ok 6 - published helper recipes execute actual CLIs and generated batch grammar passes the real fence
```

## File totals (tail)

```
1..7
# tests 7
# suites 0
# pass 7
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 17884.1969
```

Both halves of the pass line are met: the named test passes and the file reports
`pass 7 / fail 0`.

The aside's instruction "Do not try to reproduce that one now" (the live
`check-fence.mjs` run) was honoured — the batch worktrees are gone, and attempting it
would need `git worktree add`, which writes into `.git/worktrees/`. This is the
correction of the defect the previous draft carried as its own step; it is now correctly
demoted to an aside with an explicit do-not-reproduce.

## Verdict

PASS — the named test is green and the file reports pass 7 / fail 0, exit 0.
