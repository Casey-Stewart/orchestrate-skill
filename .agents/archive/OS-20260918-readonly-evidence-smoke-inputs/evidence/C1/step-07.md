# C1 step 07 — independent QA

Verdict: PASS

Tested SHA: 6c84b930aa4297283f94ce9eeacdff44d2b22ba4

Step revision: 1

Environment: Windows; Node v22.22.3; Git 2.52.0.windows.1; PowerShell 7.6.5; literal python C:/Users/fatbo/AppData/Local/Programs/Python/Python310/python.exe, Python 3.10.6 / openpyxl 3.1.5; Codex In-app Browser via CUA at http://127.0.0.1:8765/.

Do: Fresh-checkout the actual committed C1 input package with core.autocrlf=true. Repeat with byte copies under active and archived paths in a disposable repository.

Pass: Every raw hash and effective attribute is correct, including nested/LF/CRLF inputs. An unprotected LF control converts to CRLF. The live ledger is neither archived nor changed.

Command and exact argument array: {"exe":"node","args":["C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\18\\01a0b671-3325-77d3-b360-845f09da4bdc\\orchestrate-run\\wt-int\\.agents\\changes\\OS-20260918-readonly-evidence-smoke-inputs\\evidence\\C1\\scripts\\verify-issued-checkout.mjs","C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int","6c84b930aa4297283f94ce9eeacdff44d2b22ba4",".agents/changes/OS-20260918-readonly-evidence-smoke-inputs","C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA","C:\\Users\\fatbo\\.codex\\visualizations\\2026\\09\\19\\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\\orchestrate-run\\C1-QA\\checkout-proof.json"]}

Exit code: 0

Output tail:

~~~text
Cloning into 'C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\issued-byte-proof-7mtRBH\actual-checkout'...
done.
HEAD is now at 6c84b93 chore: retain validated C1 smoke inputs and reproducible proofs
Cloning into 'C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\issued-byte-proof-7mtRBH\archive-checkout'...
done.
HEAD is now at 547c2e3 Synthetic checkpoint byte preservation proof
PASS: 18 real fixture/issued paths, 32 active/archive copy paths; both LF-to-CRLF controls converted; report=C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\checkout-proof.json
~~~

Full report: [checkout-proof.json](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/checkout-proof.json>); full output: [checkout.log](<C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/C1-QA/checkout.log>).

Inspected 18 real committed issued/fixture paths and 32 disposable active/archive paths. All five transformation attributes unset on protected files, and diff/merge unset on XLSX; raw source/checkout hashes agree, including nested LF and CRLF controls. Both unprotected LF-to-CRLF controls convert. Actual clone: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\issued-byte-proof-7mtRBH\actual-checkout. Archive clone: C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\C1-QA\issued-byte-proof-7mtRBH\archive-checkout. Configuration is isolated, no live ledger archive.

The retained script executes clone --no-checkout --no-hardlinks, config --local core.autocrlf true, verifies true, then checkout --detach of the captured commit. All Git subprocesses complete exit 0; any other exit throws. Actual full raw hashes/effective attributes retained in report.
