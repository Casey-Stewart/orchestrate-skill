# C1 workbook working copy and reset

The issued `orders.xlsx` is the immutable synthetic original. Inspect it, then close it without saving. Perform edits only in the disposable copy below.

From PowerShell:

```powershell
$issued = 'C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int/.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/evidence/C1/inputs/issue-001'
$workingCopy = Join-Path $env:TEMP 'OS-C1-orders-working.xlsx'
Copy-Item -LiteralPath (Join-Path $issued 'orders.xlsx') -Destination $workingCopy -Force
Invoke-Item -LiteralPath $workingCopy
```

This replaces only the named disposable working copy. If the package was moved, set `$issued` to the folder containing its original workbook.

The original contains `Orders`, `Summary`, and `Types`. Orders IDs are text `0001` through `0004`. Original `Orders!F2` is **22.50**, `Summary!B2` is **23.50**, and `Summary!B3` is **4**.

In the working copy, change `Orders!C2` from **2** to **3**. In Excel or a compatible application with calculation enabled, `Orders!F2` becomes **33.75** and `Summary!B2` becomes **34.75**. The count stays **4**.

To reset, close the working workbook and run:

```powershell
Copy-Item -LiteralPath (Join-Path $issued 'orders.xlsx') -Destination $workingCopy -Force
Invoke-Item -LiteralPath $workingCopy
```

The copy returns to `C2=2`, `F2=22.50`, and `Summary!B2=23.50`. The issued original is unchanged. An Excel-compatible spreadsheet application is required for this human recalculation step; automated file validation does not claim it was performed.
