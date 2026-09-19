FINDINGS 2

Candidate: `7a3ab268a0b318ce080065df628cb1b2386ed980` (`codex/workflow-input-delivery`).
Fresh separate hunter, inherited GPT-6 Astra / xhigh. No candidate source or ledger edits; no subagents.
All 71 tests in the four changed suites passed independently in a byte-copy of the candidate; no skips.
Read all new/changed tests, actual input/builder/page consumers, published runner, contract mirror checks, frozen roles/validation/prohibitions and B03 batch.
Raw-byte normalization, comparison of stable IDs instead of resolved identities, and deletion of the builder's history comparison were each killed by existing tests.
The real workbook, shared input/evidence revisions, old input retention, URL encoding/text rendering, saved human/agent verdicts and unaffected notes have substantive end-to-end assertions.
Actual README nested failing/passing tests and empty-suite guard ran, as did real CLI command/mirror/placeholder checks and fresh autocrlf conversion with controls.
No production change is needed for either finding; both are ASK test polish.

1. **ASK — protect the issued-input/output collision guard with a real CLI regression.**
   Test: `tests/build-smoke-page.test.cjs:433` (failure/preservation coverage at 437–458); production: `orchestrate/tools/build-smoke-page.mjs:265–266`.
   Exact mutant deletes only the `sameFile(out, resolve(inputRoot, artifact.path))` refusal. All 71 changed-suite tests still pass.
   Concrete probe: build a prior no-input page; reissue with that existing HTML declared as a read-only input, proper raw hash/size, valid evidence, increased revision and exact previous sidecar; choose that same HTML as output.
   Current code exits 1 and preserves the issued bytes. The mutant exits 0, overwrites the declared input and changes SHA-256 from `6adb97073fc68c63c7c4885c58d52d14159463a2a859ab94e8af5ad02e4b1b69` to `b22120aa7b6e4da7be7780b73f3320cd593339f9d25e2bd08a1b2afb8bd98525`.
   Missing assertion: this valid reissue/output collision must fail with the issued-artifact diagnostic and leave the complete input/output bytes unchanged. Production needed: **no**.
   Evidence: `mutant-output-guard-mutation.json`, `mutant-output-guard.log`, `output-probes.json`, both `output-*-package/` directories, executable `hunt.mjs`.

2. **ASK — exercise Git diff failure propagation in the actual published validation runner.**
   Test: `tests/protocol-contract.test.cjs:176–218`; production command: `README.md:189–190`.
   Exact mutant replaces only `if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }` with a comment. All 6 protocol-contract tests still pass.
   Concrete probe: disposable Git repo with a committed clean text file, a passing Node suite, then a tracked trailing-whitespace edit. Run the extracted README PowerShell recipe.
   Current recipe exits 1 with `Git diff check failed`; mutant prints Git's trailing-whitespace diagnostic but exits 0. Existing sentinel cases test Node failure and empty discovery, never a failing diff after successful Node tests.
   Missing assertion: actual `git diff --check` failure must propagate, with a restored clean-file positive run. Production needed: **no**.
   Evidence: `mutant-diff-propagation-mutation.json`, `mutant-diff-propagation.log`, `diff-probes.json`, both `diff-*-package/` directories, executable `hunt.mjs`.

Full executable run: `node hunt.mjs <candidate-worktree>` (uses this proof directory for isolated copies; use a fresh copy of the harness directory for a fresh run).
Aggregate commands/exits/tails: `runs.json`; baseline and three killed-mutation logs retained alongside the two survivors.
Final candidate HEAD remains the exact SHA above; `git status --porcelain=v1` empty and `git diff --check` exit 0. No broad-suite claim beyond these 71 changed-suite tests; independent reviewer owns the full recursive validation.
