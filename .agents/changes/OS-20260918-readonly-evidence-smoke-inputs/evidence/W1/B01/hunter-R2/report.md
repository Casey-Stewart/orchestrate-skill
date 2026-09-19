FINDINGS 1

Candidate: fac37a5163db2bd816ece3b68e936ab534b7f77d; scoped fix diff from b3ce33eb35dab7ac43472faa0f90220ff32a48dd.

- ASK — Test: tests/git-contract.test.cjs:186–208. Production: orchestrate/tools/git-evidence.mjs:110. Adding only `--local` to the new `git config --includes --null --name-only --get-regexp` filter prerequisite survives both complete B01 suites: 105/105 pass, exit 0, 262131 ms. The new tests configure every clean/process driver in repository-local config, so they do not require inspection of other effective scopes. An independent disposable probe configures the clean driver in the fixture's isolated `GIT_CONFIG_GLOBAL` file: the unchanged candidate returns UNKNOWN in both the API and actual CLI and preserves its snapshot, while the exact local-only mutant reports complete evidence and executes the driver, writing `global-filter-ran` inside the repository. Add API/actual-CLI coverage for a driver configured only in that isolated global config, requiring `unsafe-filter`, unknown cleanliness, exit 2, absent marker, and unchanged snapshot. No production change is required.

The R1 race ASK is resolved: independently rerunning the current late-mutation regression against a copy with only the final worktree comparison deleted fails with mutant PASS versus required UNKNOWN. The test observes a genuinely changed working file after the first clean observation and confirms refs, HEAD and index remain unchanged.
Independently reran the fix regressions on R1 production: 12/12 fail (exit 1), covering clean/process command execution, malformed loose-ref inventory, staged/unstaged T evidence and fence verdicts, and nested submodule filtering. The new assertions exercise real exports and actual CLIs, retained valid sibling refs, exact status entries, diagnostics and before/after snapshots.
Only external scratch copies and disposable fixture repositories were written. Candidate remains clean at the captured SHA; git diff --check exits 0. No source edits or agents.

Proof files under B01-hunter-r2-proof:
- `config-scope-mutant.cjs`: exact mutation, independent global-config behavioral probe, and full two-suite run.
- `config-scope-probe.json`: actual candidate/API/CLI and mutant observations.
- `local-only-mutant-tests.txt`: complete 105/105 passing mutant output.
- `independent-r1-proof.cjs`, `r1-regressions-on-original.txt`, `r1-late-race-mutant.txt`: independent R1 verification replay.

Commands, from the candidate worktree:
`node ../B01-hunter-r2-proof/independent-r1-proof.cjs <absolute-candidate-worktree>` — exit 0; asserts old-production regression and final-race mutant runs exit 1.
`node ../B01-hunter-r2-proof/config-scope-mutant.cjs <absolute-candidate-worktree>` — exit 0; verifies original/mutant distinction and mutant-suite exit 0.
