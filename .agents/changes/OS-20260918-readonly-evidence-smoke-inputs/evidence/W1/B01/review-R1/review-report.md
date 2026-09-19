FIX FIRST
Candidate: b3ce33eb35dab7ac43472faa0f90220ff32a48dd; captured integration: c163aeef65237b7cc5a0ecad206764012e102140; merge base: ae850a38fa760cb36f0ca83db35e5830ed1cc2ed.
Independent all-file/all-hunk review maps the two production helpers to checklist items 1/2/4/5, fixture extraction and fourteen scenario conversions to 1/3, and adversarial tests to 2/6. Own batch diff is six permitted ticks. No unmapped hunk or separate named doc/comment sweep was found; feature failing-on-base is N/A.
Full recursive FullName-sorted validation: 4 discovered suites, 143 tests passed, 0 failed, 0 skipped; exit 0. git diff --check exit 0. Candidate remains clean at the captured SHA.

P0 — orchestrate/tools/git-evidence.mjs:124 (Git configuration at lines 18-22).
Criterion: read-only probes/no repository mutation/no arbitrary shell execution. A tracked filtered.txt with filter=marker, configured filter.marker.clean, and same-size changed contents causes worktrees() and the actual worktrees CLI to execute the clean filter. A harmless test filter created clean-filter-ran inside the inspected repository; snapshots differ, while CLI exits 0 with completeness=complete. Disabling fsmonitor/external diff alone does not prevent clean/process filters.
Smallest fix: prevent configured clean/process filters from executing during status observation; if safe cleanliness cannot be established, retain explicit UNKNOWN before running the filter. Add both API and actual CLI no-side-effect coverage.

P0 — orchestrate/tools/git-evidence.mjs:193-218 (success-output handling at lines 23-29).
Criterion: all non-symbolic refs and invalid/missing Git evidence remain explicit unknowns. A loose refs/heads/broken containing not-an-object makes for-each-ref exit 0 with warning: ignoring broken ref refs/heads/broken. Discovery silently omits that ref and returns completeness=complete with no diagnostics; the actual discovery CLI exits 0. The loose-ref supplement skips every non-symbolic file it did not observe in for-each-ref.
Smallest fix: detect malformed/omitted loose non-symbolic refs or otherwise surface the incomplete inventory with a structured credential-safe diagnostic, retaining valid sibling refs. Add the API/CLI negative case.

P1 — orchestrate/tools/git-evidence.mjs:94.
Criterion: known staged/unstaged status observations must retain structured entries and distinguish dirt from inaccessible evidence. A valid staged regular-file-to-symlink type change emits T  tracked.txt. The regex excludes T, so the helper discards the status entries, reports worktree-unavailable, and the actual worktrees CLI exits 2 instead of returning complete dirty evidence. The fence consequently cannot give its deterministic dirty-worktree VIOLATION for this valid staged change.
Smallest fix: accept Git's T status and test staged and unstaged type changes through helper and fence, including unchanged snapshots.

Evidence commands (PowerShell):
& RUN/validate-ledger.ps1 -Worktree RUN/wt-B01 -LogPath RUN/B01-reviewer-r1-proof/full-validation.txt : exit 0.
node RUN/B01-reviewer-r1-proof/edge-probes.cjs RUN/wt-B01 : exit 0; captures API and actual CLI observations for all three failures.
git status --porcelain=v1 : exit 0, empty; git diff --check : exit 0.
RUN = C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run.
Proof files: B01-reviewer-r1-proof/full-validation.txt, edge-probes.cjs, edge-probes.json. Only external scratch and disposable fixture repositories were written; no candidate files changed.
