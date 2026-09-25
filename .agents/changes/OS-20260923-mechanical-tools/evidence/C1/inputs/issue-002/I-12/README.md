# I-12 — C1 fail-scenario fixture

`fixture.bundle` holds branch `main`, one commit `eef02bd922f203a57d1add97832d78190b9a88ac` (short `eef02bd`).

Working copy: `git clone <I-12>/fixture.bundle <scratch>/c1-fail-fixture`; reset = delete that clone and clone again.

Expected through `mutate.mjs --ref HEAD` (skip conditions read production switches, never the platform):

- (a) `--validate validate-a.json --mutations muts-a.json`: exactly one line, `CONTROL FAILED FAIL tests no test passed (0/1, 1 skipped) — log: <log>`; exit 2; no mutation applied.
- (b) `--validate validate-b.json --mutations muts-b.json`: `CONTROL PASS PASS tests 1/1 (…)`, then a line beginning `CRASHED e1: FAIL tests 1 of 1 failed: rows.test.cjs (ran no tests)`, then `MUTATE 0 killed, 0 survived, 1 other`; exit 2.
- (f) `--validate validate-f.json --mutations muts-f.json`: `CONTROL PASS PASS tests 2/2 (…)`, then a line beginning `CRASHED f1: PASS tests 1/2, 1 skipped`, then `MUTATE 0 killed, 0 survived, 1 other`; exit 2; the log records `1 test skipped that ran in the control`.
