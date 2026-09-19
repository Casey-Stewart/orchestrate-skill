DONE

EVIDENCE
- Polished candidate: 800c0fac5735d7ed262eff86390ddae1d1ca249c on codex/workflow-input-delivery. Parent reviewed candidate: 7a3ab268a0b318ce080065df628cb1b2386ed980.
- Checklist: 12/12. Two authorized polish items appended, then ticked. Worktree clean; only tests/build-smoke-page.test.cjs, tests/protocol-contract.test.cjs and own batch checklist changed.
- Frozen validation on the COMMITTED polished tip: validate-ledger.ps1 -Worktree <wt-B03> -LogPath <B03-polish/full-validation.txt>; exact Get-ChildItem -Recurse | Sort-Object FullName | ForEach-Object FullName enumeration, empty guard, node --test --test-reporter=spec @testFiles and failure propagation; git diff --check. Exit 0; six suites; 187 tests, 187 pass, 0 fail/cancelled/skipped/todo; duration 292635 ms; Git diff check PASS. No source changes after this run began.
- Focused two-suite baseline: node --test --test-reporter=spec tests/build-smoke-page.test.cjs tests/protocol-contract.test.cjs; exit 0, 35/35 pass.
- Exact mutant proof: node B03-polish/prove-mutants.mjs <wt-B03>; exit 0. External byte-copy baseline 35/35 passes. Removing only sameFile(output, artifact) refusal gives targeted CLI assertion failure (actual 0, expected 1), mutant exit 1. Removing only README Git diff failure throw gives targeted actual-runner assertion failure (actual 0 must be nonzero), mutant exit 1. Production mutations exist ONLY in external disposable copies.

Evidence root:
C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/B03-polish/
- full-validation.txt
- prove-mutants.mjs
- mutant-results.json
- baseline.log
- mutant-output-guard.log
- mutant-output-guard-mutation.json
- mutant-diff-propagation.log
- mutant-diff-propagation-mutation.json

The CLI regression builds a real prior page, declares its existing bytes as an issued input with actual SHA-256/size, valid evidence, increased revision and exact previous snapshot, then requires the issued-artifact refusal and full byte preservation.
The published-runner regression commits a clean tracked file alongside passing Node suites, adds trailing whitespace, requires both a nonzero result and Git diff check failed, restores the exact clean contents, and requires success.
Production, README and every other doc remain unchanged from the reviewed candidate. No new agents, review round or behavior changes.
