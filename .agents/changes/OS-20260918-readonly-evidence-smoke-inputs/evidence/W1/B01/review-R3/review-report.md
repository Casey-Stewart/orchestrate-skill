SHIP
Candidate: 9f05127c33040d02a08782a5d23c23242021de39. Fresh R3 review; inherited GPT-6 Astra / xhigh. Scope: verify both previous rounds' findings and scan only fac37a5163db2bd816ece3b68e936ab534b7f77d..candidate.
Captured manual gate: integration fc13eaedd4f5a24614a9da05f48dcc816aa2607c; merge base ae850a38fa760cb36f0ca83db35e5830ed1cc2ed. Read both reviewer/hunter reports verbatim, the frozen contract, own batch, and both changed files in full.
No P0/P1 or ASK found in the scoped re-review. No candidate edits, agents, merges or implementer communication.

Hunk mapping:
- orchestrate/tools/git-evidence.mjs:249-256: R2 P1; validate the dangling symbolic target using shell-free read-only git check-ref-format, without restricting its refs/ namespace or probing its tree. The comment explains that distinction; probe errors remain explicit.
- tests/git-contract.test.cjs:247-291: R2 P1; real API and actual CLI preserve tags/custom/remotes hints, avoid scanning an existing custom target's tree, retain valid siblings for malformed targets, and preserve raw ref/repository bytes.
- tests/git-contract.test.cjs:292-312: R2 ASK; isolated global-only clean driver, explicit unsafe-filter/unknown/exit 2, absent execution marker, unchanged repository snapshot and global-config bytes.
Every fix hunk maps to a recorded finding or ASK and batch items 1/2/6. No unmapped hunk or separately named documentation sweep. Feature failing-on-base under section 6b is N/A.

R1 verification: clean/process filters remain blocked; malformed omitted loose refs remain explicit unknowns with valid siblings; staged/unstaged T remains complete dirty evidence and fence VIOLATION; the real late-working-file race regression passes. Full validation includes all corresponding API/CLI and byte-snapshot tests.
R2 verification: legal dangling refs/tags/missing and refs/custom/missing now retain exact symref targets and return complete/CLI exit 0. Independent probes additionally verified remotes, Unicode, @ within a component, and a .lockx suffix. Target namespaces remain outside discovery inventory/tree traversal.
Independent filter probes covered include, global, worktree and environment config scopes: actual API/CLI UNKNOWN, marker absent, before/after snapshots identical. Additional probes covered malformed, empty, invalid-UTF8 and dangling loose refs plus staged/unstaged type changes; 16 scenarios passed.
Read supplemental third-round proof artifacts: pre-R3 production rejects the new tags/custom assertions; exact --local filter-inventory mutant fails the new global-filter assertion. The separate hunter owns independent mutation review.

Validation environment: Windows PowerShell, Node v22.22.3, Git 2.52.0.windows.1.
1. Exact frozen recursive FullName-sorted PowerShell validation in validation-command.ps1, launched with native working directory RUN/wt-B01: four discovered test files; 166 passed, 0 failed, 0 skipped; Node exit 0; git diff --check exit 0; overall command exit 0 (320999.6186 ms Node run). Full output: full-validation.txt.
2. node RUN/B01-reviewer-r3-proof/confirming-probes.cjs RUN/wt-B01: exit 0, 16 independent API/CLI scenarios; output: confirming-probes.json. Script is adapted from the earlier independent confirming probe and adds explicit R3 target assertions.
3. Final git rev-parse HEAD, git status --porcelain=v1, git diff --check from actual candidate workdir: exit 0; exact candidate SHA, empty status, no whitespace errors. Earlier sandbox-only status read emitted external-ignore access warnings; final authorized read was clean without warnings.
Proof directory: RUN/B01-reviewer-r3-proof. All writes are external proof files or isolated disposable repositories; candidate remains unchanged.
RUN = C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run.
