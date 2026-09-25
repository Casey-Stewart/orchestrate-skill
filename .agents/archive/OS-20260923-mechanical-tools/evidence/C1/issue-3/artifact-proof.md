# C1 issue 3 — artifact proof of `smoke-c1.html`

- Build: `f1fde3c026558414bd1104163f6366524bd90df5` (the merge of `fix/B01-c1-followup-2`). Page built by the ledger base's
  `build-smoke-page.mjs` + template (`fceab31`) from `smoke-c1.json`, with `--previous` = the issue-2 sidecar recovered from
  `5a0d8f7`; the builder accepted it (numbering, order, non-decreasing revisions, input history). Changed: step 1 → revision 4
  (fresh evidence `evidence/C1/issue-3/step-01.md`, at `f1fde3c`), step 14 → revision 3; every other pre-verified result carried
  over unchanged. Run 2026-09-25, Linux 7.0.0-31-generic, node v24.20.0, git 2.53.0, bash, from the worktree root in a fresh
  `../c1-scratch`.
- **Rendered-DOM proof: COULD-NOT-RUN** (no browser on this machine; the only connected browser is on the Windows laptop).
- **Substitute check (labelled, not the proof):** the 28 `<pre><code>` blocks decoded from what the renderer receives — none with
  a backslash or a control character other than tab or newline; the 23 step blocks for steps 1–13 and 15–19 run with `bash`:
  every exit and first line as in issue 2 (`evidence/C1/issue-2/artifact-proof.md`), step 1 now `PASS tests 510/512, 2 skipped
  (23s)`, exit 0.
