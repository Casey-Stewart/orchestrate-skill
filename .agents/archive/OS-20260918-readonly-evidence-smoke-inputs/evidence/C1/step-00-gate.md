# C1 step 00 gate — independent QA

Verdict: PASS

Tested SHA: 49dfe07c09111197b8739aac2df0cea43c985cdf

Step revision: n/a (non-verdict gate)

Environment: Windows 11 Home 10.0.26200; Node v22.22.3; Git 2.52.0.windows.1; PowerShell 7.6.6; literal python C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe, Python 3.10.6 / openpyxl 3.1.5; Claude Code built-in Browser pane (Chromium) at http://127.0.0.1:8765/.

Do: Run this gate from the integration worktree before recording a verdict. The repository has no version file, so the source is identified by its tested commit and a behavioral canary.

Pass: Branch must be `codex/readonly-evidence-smoke-inputs-ledger`. Tested source commit: `49dfe07c09111197b8739aac2df0cea43c985cdf`. A later commit containing only checkpoint artifacts is allowed; the canary verifies ancestry and that source files have not changed. Canary must report **PASS**: the current builder rejects a changed workbook byte and preserves the old HTML; the starting `f918fe39762c70edb9a3424e54eaa208fd7c5727` builder accepts or ignores that same change.

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\scripts\\c1-canary.mjs","."],"cwd":"C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int"}

Exit code: 0

Output tail:

~~~text
  "branch": "codex/readonly-evidence-smoke-inputs-ledger",
  "testedSHA": "49dfe07c09111197b8739aac2df0cea43c985cdf",
  "head": "49dfe07c09111197b8739aac2df0cea43c985cdf",
  "scratch": "C:\\Users\\fatbo\\AppData\\Local\\Temp\\orchestrate-c1-canary-71mCQU",
  "intactInputsValidated": true,
  "originalSha256": "e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f",
  "mutatedSha256": "5833d64b164814fe1ddc5f2f9240d0adff043ead7a62f81e3acae9160cc6ea8b",
  "current": { "exit": 1, "stderr": "...smoke-C1.json: input artifact evidence/C1/inputs/issue-001/orders.xlsx: SHA-256 mismatch for raw file bytes", "oldHTMLPreserved": true },
  "starting": { "sha": "f918fe39762c70edb9a3424e54eaa208fd7c5727", "exit": 0, "output": "...baseline-accepted.html: 56469 bytes, 0 unfilled slots" },
  "verdict": "PASS: current rejects tampered bytes; starting builder accepts/ignores them"
}
~~~

Full output: [canary.log](<C:/Users/fatbo/AppData/Local/Temp/claude/C--Users-fatbo-OneDrive-Desktop-Claude-Testing-orchestrate-skill/33a1a374-d8d2-4c69-9b4d-22589d630f20/scratchpad/C1-REVERIFY/canary.log>).

Independently checked before trusting the script: `git branch --show-current` reads `codex/readonly-evidence-smoke-inputs-ledger` and `git rev-parse HEAD` reads 49dfe07c09111197b8739aac2df0cea43c985cdf, which is the sidecar's `buildSha`, so the "later artifacts-only commit" allowance was not needed here. The canary additionally proves ancestry with `git merge-base --is-ancestor`, proves no source file under `README.md`, `orchestrate`, `tests` or `.gitattributes` changed after the tested SHA, and refuses to run if those paths are dirty.

Both halves of the behavioural canary were observed on this build, on a disposable copy of the ledger made under the OS temp directory (never the worktree): with the delivered inputs intact the current builder succeeds, and after flipping one bit of the last byte of `evidence/C1/inputs/issue-001/orders.xlsx` (SHA-256 e5544604... to 5833d64b...) the current builder exits 1 with "SHA-256 mismatch for raw file bytes" and the previously generated HTML is byte-identical afterwards. The starting `f918fe39762c70edb9a3424e54eaa208fd7c5727` builder, paired with its own template of that commit, accepts the very same tampered package and writes a 56469-byte page with 0 unfilled slots — the opposite behaviour the gate demands. The gate therefore discriminates the repaired build from the starting one, and the two smoke pages in this worktree were left untouched by the canary.
