# C1 inputs issue-002 — independent check

Issue: `.agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-002` · tip `f6a9a87fdf58956f638e7f20503eee296e1e4ef9` · 2026-09-25T03:34:38.599Z
Environment: Linux 7.0.0-31-generic; node v24.20.0; git version 2.53.0; PowerShell 7.6.5

Command: `node .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/validate-c1-inputs-002.mjs .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-002 .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/validation-002` — result: ALL PASS (20/20)

| Input | Check | Result | Observed |
|---|---|---|---|
| I-10 | skip-only.test.cjs registers exactly one test, and it is skipped | PASS | {"n":1,"skipped":1} |
| I-10 | `node --test` run directly: exit 0 with pass 0, skipped 1 (node alone calls this green) | PASS | exit 0, pass 0, skipped 1, fail 0 |
| I-10 | spec.json: one argv step named `tests`, parser node, running that file | PASS | {"name":"tests","argv":["node","--test","--test-reporter=spec","skip-only.test.cjs"],"parser":"node"} |
| I-11 | empty.test.cjs registers no test; one.test.cjs registers one | PASS | empty {"n":0,"skipped":0}, one {"n":1,"skipped":0} |
| I-11 | `node --test` run directly counts the empty file as a passing test (pass 2, exit 0) — the behaviour the fix must see through | PASS | exit 0, pass 2, fail 0 |
| I-11 | spec.json: one argv step named `tests`, parser node, running both files | PASS | {"name":"tests","argv":["node","--test","--test-reporter=spec","empty.test.cjs","one.test.cjs"],"parser":"node"} |
| I-12 | `git bundle verify` passes (inside the fresh clone) | PASS | The bundle uses this hash algorithm: sha1 |
| I-12 | a fresh clone checks out `main`, and the README names its commit | PASS | clone exit 0, main, eef02bd |
| I-12 | (a) feature.test.cjs run directly: pass 0, skipped 1 — its control passes nothing | PASS | exit 0, pass 0, skipped 1, fail 0 |
| I-12 | (b) rows.test.cjs run directly: pass 1 | PASS | exit 0, pass 1, skipped 0, fail 0 |
| I-12 | (f) flip.test.cjs run directly: pass 2, skipped 0 | PASS | exit 0, pass 2, skipped 0, fail 0 |
| I-12 | muts-a.json: one mutation whose find occurs exactly once in lib.cjs | PASS | a1: "return a + b;" |
| I-12 | validate-a.json: one argv step named `tests`, parser node | PASS | ["node","--test","--test-reporter=spec","feature.test.cjs"] |
| I-12 | muts-b.json: one mutation whose find occurs exactly once in lib.cjs | PASS | e1: "const ROWS = [[2, 3, 5]];" |
| I-12 | validate-b.json: one argv step named `tests`, parser node | PASS | ["node","--test","--test-reporter=spec","rows.test.cjs"] |
| I-12 | muts-f.json: one mutation whose find occurs exactly once in lib.cjs | PASS | f1: "const MODE = 'full';" |
| I-12 | validate-f.json: one argv step named `tests`, parser node | PASS | ["node","--test","--test-reporter=spec","flip.test.cjs"] |
| I-12 | (b) with e1 applied by hand, rows.test.cjs registers no test | PASS | {"n":0,"skipped":0} |
| I-12 | (f) with f1 applied by hand, flip.test.cjs: pass 1, skipped 1 (the total holds, the skipped count moves) | PASS | exit 0, pass 1, skipped 1, fail 0 |
| I-12 | the generator is issued beside the bundle, byte-identical to the committed generator | PASS | raw bytes |
