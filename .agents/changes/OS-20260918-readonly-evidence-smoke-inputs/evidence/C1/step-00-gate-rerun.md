# C1 step 0 (gate) — re-run after the portability repair

Verdict: PASS

Tested SHA: 49dfe07c09111197b8739aac2df0cea43c985cdf (recorded build identity, unchanged)

Run at integration tip: 35926ec6c70178276ea1a689643e0a29ce27e65b

Step revision: gate (non-verdict; no step revision)

Environment: Windows 11 Home 10.0.26200; Node v22.22.3; Git 2.52.0.windows.1;
PowerShell 7.6.6 and cmd.exe both exercised.

Why this re-run exists: the frozen rules require a pre-smoke repair to re-run the step it
repaired. `fix/B03-presmoke-00` corrected the step-0 gate's command block, so the gate was
re-run against the merged tip.

Command and exact argument array:
{"exe":"node","args":[".agents/changes/OS-20260918-readonly-evidence-smoke-inputs/evidence/C1/scripts/c1-canary.mjs","."],"cwd":"C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int"}

Exit code: 0

Output tail:

~~~text
"branch": "codex/readonly-evidence-smoke-inputs-ledger",
"testedSHA": "49dfe07c09111197b8739aac2df0cea43c985cdf",
"head": "35926ec6c70178276ea1a689643e0a29ce27e65b",
"verdict": "PASS: current rejects tampered bytes; starting builder accepts/ignores them"
~~~

The canary's own ancestry check accepts head 35926ec as a descendant of the tested SHA, and
its source-drift check finds README.md, orchestrate, tests and .gitattributes unchanged
between them — so every commit since the tested SHA remains checkpoint artifacts only, as
the gate text claims.

Shell portability, the defect this repair addressed. The reviewer piped the block out of the
EMITTED page into a real cmd.exe and a real pwsh from an unrelated working directory: both
exit 0, printing the correct branch, a matching HEAD and the canary PASS verdict. The block
now contains no shell construct at all — three external programs, `git -C` with an absolute
double-quoted worktree, and the canary launched by absolute path with that worktree as its
argument — so no cmdlet, no builtin, no directory change and no single quotes remain.

Independent conductor spot check of the regression's strength: the `cd`-plus-relative-paths
variant, which survived the pre-polish suite 7/7, now fails exit 1 with 3 failures, including
`cmd.exe line 1 (cd "…") launched git; every instructed line must dispatch a command this
shell can actually run` and, from a genuine D: staging directory, `the gate points a shell at
D:\…\work, which is not a git worktree that knows branch
codex/readonly-evidence-smoke-inputs-ledger`.

The earlier gate run at 49dfe07 is retained unchanged in step-00-gate.md, and the user's own
passing run of the canary is recorded in PROGRESS.
