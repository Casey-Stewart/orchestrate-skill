# C1 — artifact proof of `smoke-c1.html`

- Build: `f770be16140a0e4719886e6475d7d0306ca43ac2`. The page was built from `smoke-c1.json` by the pinned
  skill's `build-smoke-page.mjs` and `smoke-page-template.html`, and published 2026-09-26 as a private Claude
  artifact with the `db` store: https://claude.ai/artifact/YQnp8Pgc1ePNd64YGBsXKX (version 1). Run from the
  Linux workstation (Linux 7.0.0-31-generic; node v24.20.0; git 2.53.0; GNU bash 5.3.9; Python 3.14.4).
- **Rendered-DOM proof: COULD-NOT-RUN.** No browser runs on this machine. The hosted artifact was opened in
  the user's connected Chrome (Windows, through the Claude in Chrome extension): claude.ai renders the page
  inside a cross-origin sandboxed iframe titled "User-generated artifact content". From the top frame its
  `contentDocument` is null; the extension's page-text reader finds no text; its accessibility tree stops at
  the frame. The frame's own URL is redacted by the extension (it carries session data) and was not
  recovered. The reference forbids substituting the file text for the rendered DOM, so the proof as specified
  did not run.
- Rendering check (not the proof): in that Chrome the hosted page rendered — headline, facts strip, the
  tally reading pre-verified 12 · unmarked 2 · of 14, sections 1 and 2 at 0/1, section 3 at 3/3, and Step 0
  (one screenshot, not kept). The store check: `ArtifactData list os925-c1-steps` → no documents (reachable,
  empty before any mark).
- **Substitute check (labelled as such, not the proof):** every `<pre><code>` block was derived with a real
  HTML tokenizer (Python `html.parser`, character references converted) from what the page's renderer
  receives — the gate's static HTML, and each step's `do` HTML from the embedded `SECTIONS` array (the
  string the renderer assigns to `innerHTML`). 18 blocks: 4 gate, 12 agent, 2 human. None carries a
  backslash or a control character other than tab or newline. The 12 agent blocks are byte-identical to the
  blocks the QA runner executed for `step-03.md` … `step-14.md`. Each gate and agent block was written to a
  file and run as those bytes with `bash <file>` from a fresh clone of `chore/slim-contract-pack-ledger` at
  `f770be1`, with `../c1-scratch` created as Step 0 says and each step's reset applied; `../c1-scratch` was
  empty afterwards. The exit code below is the block's (its last command's).

| Block | Step | Size | Exit | Output against the step's Pass | Verdict |
|---|---|---|---|---|---|
| 01 | Step 0 | 25 B, 1 line(s) | 0 | prints `chore/slim-contract-pack-ledger` | RAN-AS-PUBLISHED |
| 02 | Step 0 | 74 B, 1 line(s) | 0 | exit 0 (contained) | RAN-AS-PUBLISHED |
| 03 | Step 0 | 93 B, 1 line(s) | 0 | prints nothing | RAN-AS-PUBLISHED |
| 04 | Step 0 | 49 B, 1 line(s) | 0 | usage starting `prose-only-diff.mjs --repo <repo> --base <ref> --head <ref>`, exit 0 | RAN-AS-PUBLISHED |
| 05 | Step 1 | 382 B, 6 line(s) | — | bytes reported below; not run (human step) | READ |
| 06 | Step 2 | 278 B, 2 line(s) | — | bytes reported below; not run (human step) | READ |
| 07 | Step 3 | 402 B, 3 line(s) | 0 | `PROMPT …/prompts/OS-20260101-fixture-B01-implementer-….md NONCE …`, then exactly `chore/fixture-ledger` and `npm ci --no-audit` | RAN-AS-PUBLISHED |
| 08 | Step 4 | 112 B, 2 line(s) | 0 | `63095` then `15295` (24.2 % of the base) | RAN-AS-PUBLISHED |
| 09 | Step 5 | 57 B, 2 line(s) | 0 | grep silent; echo `1` | RAN-AS-PUBLISHED |
| 10 | Step 6 | 300 B, 2 line(s) | 0 | 11 lines, every one `SAME`; the nine CLIs 274–2906, ledger-parse and smoke-inputs `6` | RAN-AS-PUBLISHED |
| 11 | Step 7 | 408 B, 6 line(s) | 0 | `DECOY-REPOSITORY-zq7x.txt`; echo `0`; decoy grep `0`; `$PWD` grep `1` | RAN-AS-PUBLISHED |
| 12 | Step 8 | 67 B, 1 line(s) | 0 | `1` | RAN-AS-PUBLISHED |
| 13 | Step 9 | 41 B, 1 line(s) | 0 | 2 hits — protocol.md:50 and SKILL.md:157, the no-polling rule | RAN-AS-PUBLISHED |
| 14 | Step 10 | 55 B, 2 line(s) | 0 | grep silent; echo `1` | RAN-AS-PUBLISHED |
| 15 | Step 11 | 85 B, 2 line(s) | 0 | grep silent; echo `1` | RAN-AS-PUBLISHED |
| 16 | Step 12 | 286 B, 3 line(s) | 0 | `PROSE-ONLY 1 file(s)`; echo `0` | RAN-AS-PUBLISHED |
| 17 | Step 13 | 171 B, 2 line(s) | 0 | `CODE invoice.mjs`; echo `1` | RAN-AS-PUBLISHED |
| 18 | Step 14 | 68 B, 2 line(s) | 0 | grep silent; echo `1` | RAN-AS-PUBLISHED |

The two human blocks, read and reported (Step 1 runs on the Windows laptop; Step 2 is the residual sign-off):

Block 05 (Step 1, 382 bytes):

```text
$testFiles = @(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName)
if ($testFiles.Count -eq 0) { throw 'No Node test suites discovered' }
node --test --test-reporter=spec @testFiles
if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }
```

Block 06 (Step 2, 278 bytes):

```text
git clone .agents/changes/OS-20260925-slim-contract-pack/evidence/C1/inputs/issue-001/i04.bundle ../c1-scratch/i04
node orchestrate/tools/prose-only-diff.mjs --repo ../c1-scratch/i04 --base fec96e636ff0ed283a8e4f7732adcc27e458063a --head 9977f52d70d6080afe1069f0e7a4417a1cc0b4e0
```
