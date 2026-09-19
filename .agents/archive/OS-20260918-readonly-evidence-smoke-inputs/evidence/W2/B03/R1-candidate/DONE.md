DONE

EVIDENCE
- Candidate: 7a3ab268a0b318ce080065df628cb1b2386ed980 on codex/workflow-input-delivery; clean worktree; checklist 10/10.
- Full frozen PowerShell Get-ChildItem -Recurse | Sort-Object FullName | ForEach-Object FullName, empty guard, node --test --test-reporter=spec @testFiles, failure propagation, git diff --check: exit 0. Six suites, 186 tests, 186 pass, 0 fail/cancelled/skipped/todo, duration 303777 ms; diff check PASS.
- Final changed-consumer rerun: node --test --test-reporter=spec tests/smoke-inputs.test.cjs tests/build-smoke-page.test.cjs tests/smoke-page.test.cjs tests/protocol-contract.test.cjs: exit 0; 71 tests, 71 pass, 0 fail/cancelled/skipped/todo, duration 15626 ms.
- Literal python generate-orders.py generation-A.xlsx and generation-B.xlsx: each exit 0, 8634 bytes. Recorded interpreter Python 3.10.6/openpyxl 3.1.5; process-only PATH setup, authorized execution route used.
- Literal python validate-orders.py orders.xlsx orders.requirements.json: exit 0; 3 sheets, 47 declared cells, 6 formulas/caches; total 23.50, count 4, leading-zero/text/date/Boolean/empty and edge cases pass.
- Literal python excel-check.py: exit 0; separate formula/data-only openpyxl checks pass and disposable Orders!C2 corruption created. Literal python validate-orders.py corrupt-orders-r2.xlsx orders.requirements.json: expected exit 1, FAIL requirement Orders!C2.integer: expected 2; found 3.
- Exact candidate clone --no-checkout --no-hardlinks, local core.autocrlf=true and core.longpaths=true before first checkout: exit 0; clean checkout at candidate. SHA256(A)=SHA256(B)=SHA256(committed workbook bytes)=e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f. All four fixture bytes/attributes preserved; unprotected README CRLF conversion confirmed.
- Protocol/discovery tests execute all seven published real CLI recipes, a rendered template through the real fence, recursive and bare portable nested failure/success, deterministic order and empty primary discovery rejection. Recovery/verdict mirror hashes match the approved starting f918 commit.

All evidence lives at:
C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/B03-scratch/
- full-validation.txt
- final-consumer-validation.txt
- focused-final.txt
- excel-validation.txt and excel-check.py
- committed-workbook-proof.json and committed-workbook-proof.mjs
- starting-decision-proof.txt and verify-starting-decisions.mjs

Implemented the agreed inputs/step.inputs/inputHistory interface; imported builder inputRoot is mandatory for declarations, CLI roots files beside output HTML. Raw current/evidence/history bytes are checked before writing, shared resolved identities require every consumer's revision, and issued paths cannot change byte identity. The existing page renders usable encoded links/instructions and preserves historical verdicts/notes.
Updated all approved docs/templates and added two registered tool-path slots; no frozen contract/plan/PROGRESS/LOG/evidence changes. Exact scope is 18 approved files plus the ten own checklist ticks.
After the full suite started, only input-link wrapping CSS and two README explanatory lines changed; the final 71-test consumer rerun includes those final bytes. No runtime or test logic changed afterward. Native Excel opening/browser QA remain the planned C1 tasks; no such execution is claimed here.
