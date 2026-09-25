# C1 re-issue — artifact proof of `smoke-c1.html`

- Build: `a54dcc9f56abb091f378f2086a496e61ef424373` (code identical to `e681144`; only `.agents` differs). Page built by the
  ledger base's `build-smoke-page.mjs` + `smoke-page-template.html` (`fceab31`) from `smoke-c1.json`, with `--previous` =
  the issue-1 sidecar recovered from `9b7ebca` (the builder confirmed numbering, order, non-decreasing revisions and
  the input history). Run 2026-09-25 on the Linux workstation (Linux 7.0.0-31-generic; node v24.20.0; git 2.53.0; bash),
  from the integration worktree root, in a freshly recreated `../c1-scratch`.
- **Rendered-DOM proof: COULD-NOT-RUN** — no browser runs on this machine and the only connected browser is on the
  Windows laptop (as for issue 1, `evidence/C1/artifact-proof.md`).
- **Substitute check (labelled, not the proof):** every `<pre><code>` block decoded from what the renderer receives
  (gate HTML; the `SECTIONS` JSON, entity-decoded) — 28 blocks: 4 gate, 23 in steps 1–13 and 15–19, 1 in step 14 (human,
  read only); none carries a backslash or a control character other than tab or newline. Each step block run with
  `bash <file>`:

| Step | Exit | Output (first lines) | Against the Pass |
|---|---|---|---|
| 1 | 0 | `PASS tests 510/512, 2 skipped (23s)` | as revision 3 describes |
| 2 | 1 | `FAIL tests 1 of 2 failed: fixture fails on purpose — log: ../c1-scratch/c1-validate-fail.log` | as described |
| 3 | 1 | `PARSE FAIL 2 problem(s): 02-batches-01-validate-wrapper.md:8 …; 02-batches-04-prompt-renderer.md:8 …` | as revision 3 describes |
| 4 | 1 | `PARSE FAIL 2 problem(s): 02-batches-02-ledger-parser.md:8 …; 02-batches-04-prompt-renderer.md:8 …` | as described |
| 5 | 0, 0, 1 | `SKILL 354f4dd2…d67f 23 files` twice; `SKILL MISMATCH pinned 000…0 actual 354f4dd2…d67f` | as described |
| 6 | 0 | `SKILL MATCH 354f4dd2…d67f` | as revision 2 describes |
| 7 | 1 | `SKILL MISMATCH pinned …d670 actual …d67f` | as described |
| 8 | 0 | `PARSE OK 1 batches` | as described |
| 9 | 0 | `PROMPT …/C1-20260924-smoke-B01-implementer-e8068c8ec3a7.md NONCE 8d1ab47736f0` | line as described (content clauses: QA `step-09.md`) |
| 10 | 2 | `UNKNOWN UNFILLED [WORKTREE_PATH]` | as described |
| 11 | 0, 1, 0 | clone; `CONTROL PASS PASS tests 2/2` / `KILLED m1: add sums two numbers` / `SURVIVED m2` / `MUTATE 1 killed, 1 survived, 0 other`; status empty | as described |
| 12 | 2 | `ANCHOR-MISSING m3` | as described |
| 13 | 0 | `AT f0e2c34 PASS tests 1/1 (0s)` | as described |
| 15 | 1 | `FAIL tests no test passed (0/1, 1 skipped) — log: ../c1-scratch/c1-skip-only.log` | as described |
| 16 | 1 | `FAIL tests 1 of 2 failed: empty.test.cjs (ran no tests) — log: ../c1-scratch/c1-empty-file.log` | as described |
| 17 | 0, 2 | clone; `CONTROL FAILED FAIL tests no test passed (0/1, 1 skipped) — log: …` | as described |
| 18 | 2 | `CONTROL PASS PASS tests 1/1` / `CRASHED e1: FAIL tests 1 of 1 failed: rows.test.cjs (ran no tests) — log: …` / … | as described |
| 19 | 2 | `CONTROL PASS PASS tests 2/2` / `CRASHED f1: PASS tests 1/2, 1 skipped (0s)` / `MUTATE 0 killed, 0 survived, 1 other` | as described (log reason: QA `step-19.md`) |

The gate blocks are run after the page commit, against the committed tip (LOG, "C1 re-issue").
