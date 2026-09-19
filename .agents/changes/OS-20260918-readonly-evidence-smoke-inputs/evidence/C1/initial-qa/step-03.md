# C1 step 03 — independent QA

Verdict: PASS

Tested SHA: 6c84b930aa4297283f94ce9eeacdff44d2b22ba4

Step revision: 1

Environment: Windows; Node v22.22.3; Git 2.52.0.windows.1; PowerShell 7.6.5; literal python C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe, Python 3.10.6 / openpyxl 3.1.5; Codex In-app Browser via CUA at http://127.0.0.1:8765/.

Do: Run the Git-evidence disposable scenarios through the production helper and its fixed CLI commands.

Pass: All cases pass; evidence retains explicit source/ref/SHAs and contained/not-contained/unknown ancestry. Repository and remote state remain unchanged.

Command and exact argument array: {"exe":"node","args":["--test","--test-reporter=spec","tests/git-contract.test.cjs","tests/check-fence.test.cjs"]}

Exit code: 0

Output tail:

~~~text
▶ dangling symbolic hints retain legal targets in every namespace through API and actual CLI
  ✔ refs/tags/missing (2939.7142ms)
  ✔ refs/custom/missing (2978.5019ms)
  ✔ refs/remotes/absent/main (3034.9458ms)
✔ dangling symbolic hints retain legal targets in every namespace through API and actual CLI (8953.677ms)
✔ symbolic hints do not expand discovery into target namespaces or scan their trees (3432.6999ms)
▶ malformed symbolic targets remain unknown without losing valid sibling refs
  ✔ refs/tags/.hidden (2732.2005ms)
  ✔ refs/custom/name.lock (2941.0251ms)
  ✔ refs/tags/double..dot (2847.2298ms)
✔ malformed symbolic targets remain unknown without losing valid sibling refs (8521.0148ms)
✔ global clean filters remain unknown and never execute through API or actual CLI (3947.7877ms)
ℹ tests 115
ℹ suites 0
ℹ pass 115
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 330768.9704
~~~

Native working directory: C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int. Full output: [git-fence-tests.log](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/git-fence-tests.log>).

The real exported Git evidence helper and fixed CLI commands are invoked by tests/git-contract.test.cjs, with assertions for explicit shipment source/ref/integration and shipment SHAs, tri-state ancestry and isolated local remote divergence. API/CLI snapshots and external-command markers establish unchanged repositories, remote state, files and metadata. Invalid/unknown evidence is preserved, not inferred clean.
