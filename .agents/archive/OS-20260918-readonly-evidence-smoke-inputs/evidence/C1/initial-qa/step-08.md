# C1 step 08 — independent QA

Verdict: PASS

Tested SHA: 6c84b930aa4297283f94ce9eeacdff44d2b22ba4

Step revision: 1

Environment: Windows; Node v22.22.3; Git 2.52.0.windows.1; PowerShell 7.6.5; literal python C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe, Python 3.10.6 / openpyxl 3.1.5; Codex In-app Browser via CUA at http://127.0.0.1:8765/.

Do: Copy the delivered recursive-discovery inputs into a disposable Git repository. Run the actual README PowerShell recipe, change only the nested false assertion to true, and rerun. Also check empty discovery and bare node --test.

Pass: The named nested sentinel fails with a nonzero result, then passes after its assertion correction. FullName order is stable; empty discovery fails. The portable command also finds the nested failure and then passes.

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\scripts\\c1-discovery-proof.mjs","C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int","C:/Users/fatbo/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/powershell/pwsh.exe","C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\discovery-proof.json"]}

Exit code: 0

Output tail:

~~~text
PASS: actual README/issued recipe matches; nested failure then success; bare node --test failure then success; sorted recursive paths and empty-suite refusal; originals unchanged
~~~

Full report: [discovery-proof.json](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/discovery-proof.json>); full output: [discovery.log](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/discovery.log>).

The actual README recipe exactly matches issued run-validation.ps1. Execution sequence and output tails:

Command and exact argument array: {"exe":"git","args":["init","--initial-branch=main"]}

Exit code: 0

Output tail:

~~~text
Initialized empty Git repository in C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/recursive-discovery-IhzMTU/working/.git/
~~~
Native working directory: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\recursive-discovery-IhzMTU\working.

Command and exact argument array: {"exe":"C:/Users/fatbo/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/powershell/pwsh.exe","args":["-NoProfile","-File","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\recursive-discovery-IhzMTU\\working\\published-validation.ps1"]}

Exit code: 1

Output tail:

~~~text

  false !== true

      at TestContext.<anonymous> (C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\recursive-discovery-IhzMTU\working\tests\unit\discovery-sentinel.test.cjs:3:68)
      at Test.runInAsyncScope (node:async_hooks:214:14)
      at Test.run (node:internal/test_runner/test:1047:25)
      at Test.start (node:internal/test_runner/test:944:17)
      at startSubtestAfterBootstrap (node:internal/test_runner/harness:296:17) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }
Exception: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\recursive-discovery-IhzMTU\working\published-validation.ps1:4
Line |
   4 |  if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
     |                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     | Node test suite failed
~~~
Native working directory: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\recursive-discovery-IhzMTU\working.

Command and exact argument array: {"exe":"C:\\Program Files\\nodejs\\node.exe","args":["--test"]}

Exit code: 1

Output tail:

~~~text
  name: 'AssertionError'
  expected: true
  actual: false
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\recursive-discovery-IhzMTU\working\tests\unit\discovery-sentinel.test.cjs:3:68)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.start (node:internal/test_runner/test:944:17)
    startSubtestAfterBootstrap (node:internal/test_runner/harness:296:17)
  ...
1..2
# tests 2
# suites 0
# pass 1
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 121.692
~~~
Native working directory: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\recursive-discovery-IhzMTU\working.

Command and exact argument array: {"exe":"C:/Users/fatbo/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/powershell/pwsh.exe","args":["-NoProfile","-File","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\recursive-discovery-IhzMTU\\working\\published-validation.ps1"]}

Exit code: 0

Output tail:

~~~text
✔ C1 ordinary top-level discovery control (1.298ms)
✔ C1 nested discovery sentinel must be observed (1.0529ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 122.7577
~~~
Native working directory: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\recursive-discovery-IhzMTU\working.

Command and exact argument array: {"exe":"C:\\Program Files\\nodejs\\node.exe","args":["--test"]}

Exit code: 0

Output tail:

~~~text
ok 1 - C1 ordinary top-level discovery control
  ---
  duration_ms: 1.2624
  type: 'test'
  ...
# Subtest: C1 nested discovery sentinel must be observed
ok 2 - C1 nested discovery sentinel must be observed
  ---
  duration_ms: 1.0091
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 130.7657
~~~
Native working directory: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\recursive-discovery-IhzMTU\working.

Command and exact argument array: {"exe":"C:/Users/fatbo/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/powershell/pwsh.exe","args":["-NoProfile","-Command","@(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName) | ConvertTo-Json -Compress"]}

Exit code: 0

Output tail:

~~~text
["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\recursive-discovery-IhzMTU\\working\\tests\\control.test.cjs","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\recursive-discovery-IhzMTU\\working\\tests\\unit\\discovery-sentinel.test.cjs"]
~~~
Native working directory: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\recursive-discovery-IhzMTU\working.

Command and exact argument array: {"exe":"git","args":["init","--initial-branch=main"]}

Exit code: 0

Output tail:

~~~text
Initialized empty Git repository in C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/recursive-discovery-IhzMTU/empty/.git/
~~~
Native working directory: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\recursive-discovery-IhzMTU\empty.

Command and exact argument array: {"exe":"C:/Users/fatbo/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/powershell/pwsh.exe","args":["-NoProfile","-File","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\recursive-discovery-IhzMTU\\working\\published-validation.ps1"]}

Exit code: 1

Output tail:

~~~text
Exception: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\recursive-discovery-IhzMTU\working\published-validation.ps1:2
Line |
   2 |  . f ($testFiles.Count -eq 0) { throw 'No Node test suites discovered' }
     |                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     | No Node test suites discovered
~~~
Native working directory: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\recursive-discovery-IhzMTU\empty.

Only the disposable sentinel assertion changed false→true. Named nested failure propagates, both explicit and bare node commands then pass, sorted FullName paths verified, empty discovery refuses. Original issued sentinel unchanged.
