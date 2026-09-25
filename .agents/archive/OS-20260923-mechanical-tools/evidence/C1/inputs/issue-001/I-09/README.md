# I-09 — mutation fixture

`fixture.bundle` holds branch `main` of a two-commit repository:

- `HEAD~1` = `f0e2c34ccf112fd2fa932e524ce6096329ed7c58` (short `f0e2c34`): `lib.cjs` and `lib.test.cjs` with the one test `add sums two numbers`.
- `HEAD` = `1d478f6eb282c96c0ee0ee1e4e6c5823d0e5aa25` (short `1d478f6`): adds the test `add is exported as a function`.

Working copy: `git clone <I-09>/fixture.bundle <scratch>/c1-fixture`; reset = delete that clone and clone again.

Expected with `validate.json` (one step `tests`, parser `node`):

- run directly, or through `run-at-ref.mjs`, at `HEAD`: `PASS tests 2/2`; at `HEAD~1`: `PASS tests 1/1`.
- `run-at-ref.mjs --ref HEAD~1`: one line beginning `AT f0e2c34 PASS tests 1/1`, exit 0.
- `mutate.mjs --mutations muts.json` at `HEAD`: `CONTROL PASS PASS tests 2/2 …`, `KILLED m1: add sums two numbers`, `SURVIVED m2`,
  `MUTATE 1 killed, 1 survived, 0 other`; exit 1.
- `mutate.mjs --mutations muts-bad-anchor.json`: exactly one line, `ANCHOR-MISSING m3`; exit 2.
