# C1 issue 2 — artifact proof of `smoke-c1.html`

- Build: `c83ec7d667accc20a8339ac3fd51591609d675e3` (B04's C1 fix-up merged). The page was built from the issue-2
  `smoke-c1.json` by the pinned skill's `build-smoke-page.mjs` with `--previous` = the issued issue-1 sidecar
  (revisions checked against it: steps 1, 2, 6, 12, 13 raised to 2; nine steps carried over), and republished to
  the same private artifact, https://claude.ai/artifact/YQnp8Pgc1ePNd64YGBsXKX. Run 2026-09-26 on the Linux
  workstation (Linux 7.0.0-31-generic; node v24.20.0; git 2.53.0; GNU bash 5.3.9; Python 3.14.4).
- **Rendered-DOM proof: COULD-NOT-RUN**, for the reason issue 1 recorded (`evidence/C1/artifact-proof.md`): no
  browser here, and the hosted page renders in a cross-origin sandboxed iframe the connected Chrome extension's
  readers cannot enter. Not substituted by the file text.
- Page diff reviewed against the issued issue-1 page: every change is an intended sidecar edit (standfirst, facts,
  the gate and its new canary, steps 1, 2, 6, 12, 13, their pre-verification, `BUILD_SHA`); the template is
  unchanged.
- **Substitute check (labelled as such, not the proof):** blocks derived with Python `html.parser` from what the
  renderer receives (the gate's static HTML; each step's `do` HTML from the embedded `SECTIONS` array). 19 blocks:
  5 gate, 13 agent (every step with `pre`), 1 human. None carries a backslash or a control character other than
  tab or newline. Every agent block is byte-identical to the bytes its QA run executed (steps 2, 6, 12, 13 the
  issue-2 run; the nine carried steps the issue-1 run). Each gate and agent block was run as those bytes with
  `bash <file>` from a fresh clone of `chore/slim-contract-pack-ledger` (tip `321b2be`, containing the build), with
  `../c1-scratch` created as Step 0 says and each reset applied; `../c1-scratch` was empty afterwards. (A harness
  slip, caught and closed: the extractor first labelled Step 2 human by its number, as in issue 1; its block was then
  byte-compared and run separately.) The exit below is the block's (its last command's).

| Block | Step | Size | Exit | Output against the step's Pass | Verdict |
|---|---|---|---|---|---|
| 01 | Step 0 | 25 B | 0 | prints `chore/slim-contract-pack-ledger` | RAN-AS-PUBLISHED |
| 02 | Step 0 | 74 B | 0 | exit 0 (contained) | RAN-AS-PUBLISHED |
| 03 | Step 0 | 93 B | 0 | prints nothing | RAN-AS-PUBLISHED |
| 04 | Step 0 | 121 B | 0 | clones I-04 into `../c1-scratch/canary-i04` | RAN-AS-PUBLISHED |
| 05 | Step 0 | 170 B | 1 | `CODE lib/token.mjs`, exit 1 (issue 1 printed `PROSE-ONLY 1 file(s)`) | RAN-AS-PUBLISHED |
| 06 | Step 1 | 382 B | — | bytes reported below; not run (human step, the Windows laptop) | READ |
| 07 | Step 2 | 286 B | 0 | `CODE lib/token.mjs`; echo `1` | RAN-AS-PUBLISHED |
| 08 | Step 3 | 402 B | 0 | `PROMPT …/prompts/OS-20260101-fixture-B01-implementer-….md NONCE …`, then exactly `chore/fixture-ledger` and `npm ci --no-audit` | RAN-AS-PUBLISHED |
| 09 | Step 4 | 112 B | 0 | `63095` then `15295` | RAN-AS-PUBLISHED |
| 10 | Step 5 | 57 B | 0 | grep silent; echo `1` | RAN-AS-PUBLISHED |
| 11 | Step 6 | 300 B | 0 | 11 lines, every one `SAME`; lengths as issue 1 | RAN-AS-PUBLISHED |
| 12 | Step 7 | 408 B | 0 | `DECOY-REPOSITORY-zq7x.txt`; echo `0`; decoy grep `0`; `$PWD` grep `1` | RAN-AS-PUBLISHED |
| 13 | Step 8 | 67 B | 0 | `1` | RAN-AS-PUBLISHED |
| 14 | Step 9 | 41 B | 0 | 2 hits — protocol.md:50 and SKILL.md:157, the no-polling rule | RAN-AS-PUBLISHED |
| 15 | Step 10 | 55 B | 0 | grep silent; echo `1` | RAN-AS-PUBLISHED |
| 16 | Step 11 | 85 B | 0 | grep silent; echo `1` | RAN-AS-PUBLISHED |
| 17 | Step 12 | 286 B | 0 | `PROSE-ONLY 1 file(s)`; echo `0` | RAN-AS-PUBLISHED |
| 18 | Step 13 | 171 B | 0 | `CODE invoice.mjs`; echo `1` | RAN-AS-PUBLISHED |
| 19 | Step 14 | 68 B | 0 | grep silent; echo `1` | RAN-AS-PUBLISHED |

The human block, read and reported (Step 1 runs on the Windows laptop):

Block 06 (Step 1, 382 bytes):

```text
$testFiles = @(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName)
if ($testFiles.Count -eq 0) { throw 'No Node test suites discovered' }
node --test --test-reporter=spec @testFiles
if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }
```
