CLEAN

Candidate: 9f05127c33040d02a08782a5d23c23242021de39. Scope: fac37a5163db2bd816ece3b68e936ab534b7f77d..candidate, changed verification and exercised production paths; both prior reviewer/hunter reports read.
Independently ran the four new test groups against unchanged external candidate copies: 10/10 passed, exit 0. They invoke actual exported helpers and actual CLIs, not fabricated outputs.
Tests/git-contract.test.cjs:247-260 assert exact retained symbolic targets/SHAs, complete evidence, exit 0, no invented ledgers, and unchanged snapshots plus raw dangling-ref bytes.
Independent mutations at orchestrate/tools/git-evidence.mjs:251/256 are caught: restoring the heads/remotes-only target restriction fails tags/custom cases; replacing retained targets with null fails all three namespace cases.
Tests/git-contract.test.cjs:262-274 place a real ledger exclusively at a resolved custom-namespace target. Removing the symbolic-ref exclusion at git-evidence.mjs:269 fails the empty-ledgers assertion because OUTSIDE is wrongly discovered.
Tests/git-contract.test.cjs:275-291 exercise Git-rejected malformed symbolic targets, requiring partial evidence, null unavailable fields, preserved valid siblings, actual CLI exit 2, the specific failed-probe diagnostic, unchanged snapshots and raw ref bytes.
Tests/git-contract.test.cjs:292-311 resolve the R2 hunter ASK: the driver exists only in isolated global config; both operations and API/CLI require unsafe-filter, unknown cleanliness, exit 2, no marker, unchanged repository snapshots and unchanged global-config bytes.
Independently adding exactly --local to the filter inventory at git-evidence.mjs:110 now fails that test at line 303 (CLI exit 0 versus required 2). The formerly surviving mutation is rejected.
The prior R1 fixes and late-race regression remain unchanged by R3; traced their retained test assertions and reviewed the prior independent failure/mutation evidence. Full recursive validation is being run separately by the reviewer; this hunter did not duplicate it.
All four targeted broken-production copies fail behavior assertions; no surviving concrete weakness found in this scoped diff.
Candidate remains clean at the captured SHA; git diff --check exits 0. Only external scratch copies and disposable fixture repositories were written. No repository edits, fixes, commits or spawned agents.

Reproduction: node ../B01-hunter-r3-proof/mutation-audit.cjs . (from the candidate worktree), exit 0.
Proofs: mutation-audit.cjs; mutation-results.json; candidate.txt; namespace-restriction.txt; discard-symbolic-target.txt; scan-symbolic-trees.txt; local-only-filter.txt.
