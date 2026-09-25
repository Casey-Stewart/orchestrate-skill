# C1 — artifact proof of `smoke-c1.html`

- Build: `450d7e970e935bdd7b93b3acc4516b996fca59e8` (page built from `smoke-c1.json` by the ledger base's
  `build-smoke-page.mjs` and `smoke-page-template.html`, `fceab31`), run 2026-09-24 on the Linux workstation
  (Linux 7.0.0-31-generic; node v24.20.0; git 2.53.0; bash), from the integration worktree root, in a freshly
  recreated `../c1-scratch`.
- **Rendered-DOM proof: COULD-NOT-RUN.** No browser runs on this machine (no Chromium, Chrome or Firefox
  binary), and the only connected browser is on the Windows laptop, which cannot open a file on this machine.
  The reference forbids substituting the file text for the rendered DOM, so the proof as specified did not run.
- **Substitute check (labelled as such, not the proof):** every `<pre><code>` block was taken from what the
  page's renderer receives — the gate's static HTML, and the embedded `SECTIONS` JSON parsed as JSON, each
  step's `do` HTML split at `<pre><code>` and entity-decoded (`&lt;` `&gt;` `&quot;` `&#39;` `&amp;`), which is
  what `textContent` yields for these strings. 22 blocks: 4 gate, 17 in steps 1–13, 1 in step 14 (human, read
  only). None carries a backslash or a control character other than tab or newline. Each step block's bytes
  were written to a file and run with `bash <file>`:

| Block | Step | Exit | Output (first lines) | Against the step's Pass |
|---|---|---|---|---|
| 05 | 1 | 0 | `PASS tests 497/499 (21s)` | as revision 2 describes (the 2 skipped are the Windows-only pair) |
| 06 | 2 | 1 | `FAIL tests 1 of 2 failed: fixture fails on purpose — log: ../c1-scratch/c1-validate-fail.log` | as described |
| 07 | 3 | 1 | `PARSE FAIL 1 problem(s): 02-batches-04-prompt-renderer.md:8 Files line differs from the plan fence` | as revision 2 describes |
| 08 | 4 | 1 | `PARSE FAIL 2 problem(s): 02-batches-02-ledger-parser.md:8 Files line differs from the plan fence; 02-batches-04-prompt-renderer.md:8 …` | as described |
| 09, 10 | 5 | 0, 0 | `SKILL 4680cd36…3170 23 files` (twice, identical) | as described |
| 11 | 5 | 1 | `SKILL MISMATCH pinned 000…0 actual 4680cd36…3170` | as described |
| 12 | 6 | 0 | `SKILL MATCH 4680cd36…3170` | as described |
| 13 | 7 | 1 | `SKILL MISMATCH pinned …3171 actual …3170` | as described |
| 14 | 8 | 0 | `PARSE OK 1 batches` | as described |
| 15 | 9 | 0 | `PROMPT …/c1-scratch/c1-prompts/C1-20260924-smoke-B01-implementer-7a32d5729d70.md NONCE 9d72c02bb4bb` | line as described (content clauses verified by the QA runner, `step-09.md`) |
| 16 | 10 | 2 | `UNKNOWN UNFILLED [WORKTREE_PATH]` | as described |
| 17 | 11 | 0 | (clone, quiet) | — |
| 18 | 11 | 1 | `CONTROL PASS PASS tests 2/2 (0s)` / `KILLED m1: add sums two numbers` / `SURVIVED m2` / `MUTATE 1 killed, 1 survived, 0 other` | as described |
| 19 | 11 | 0 | (nothing) | status prints nothing, as described |
| 20 | 12 | 2 | `ANCHOR-MISSING m3` | as described |
| 21 | 13 | 0 | `AT f0e2c34 PASS tests 1/1 (0s)` | as described |

The gate blocks (01–04) are run after the page commit, against the committed tip; their results are in the
PROGRESS session log and LOG.md for this close-out.
