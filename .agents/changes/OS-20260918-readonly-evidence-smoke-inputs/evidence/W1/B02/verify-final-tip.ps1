$ErrorActionPreference = 'Stop'
$worktree = 'C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/wt-B02'
$runPath = Join-Path $PSScriptRoot ('final-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $runPath | Out-Null
Start-Transcript -LiteralPath (Join-Path $runPath 'validation-transcript.txt') | Out-Null
try {
    Set-Location -LiteralPath $worktree
    $env:Path = 'C:/Users/fatbo/AppData/Local/Programs/Python/Python310;' + $env:Path
    python -c "import sys, openpyxl; print(sys.executable); print(sys.version); print(openpyxl.__version__); assert sys.version_info[:3] == (3,10,6); assert openpyxl.__version__ == '3.1.5'"
    if ($LASTEXITCODE -ne 0) { throw 'Python environment mismatch' }
    foreach ($name in @('generation-A.xlsx', 'generation-B.xlsx')) {
        $outputPath = Join-Path $runPath $name
        Write-Output "COMMAND python tests/fixtures/smoke-inputs/generate-orders.py $outputPath"
        python tests/fixtures/smoke-inputs/generate-orders.py $outputPath
        if ($LASTEXITCODE -ne 0) { throw 'Generation failed' }
    }
    Write-Output "COMMAND node $PSScriptRoot/verify-checkout.cjs $worktree $runPath ae850a38fa760cb36f0ca83db35e5830ed1cc2ed"
    node (Join-Path $PSScriptRoot 'verify-checkout.cjs') $worktree $runPath ae850a38fa760cb36f0ca83db35e5830ed1cc2ed
    if ($LASTEXITCODE -ne 0) { throw 'Final committed byte proof failed' }
    $checkedOutWorkbook = Join-Path $runPath 'candidate-checkout/tests/fixtures/smoke-inputs/orders.xlsx'
    Write-Output "COMMAND python tests/fixtures/smoke-inputs/validate-orders.py $checkedOutWorkbook tests/fixtures/smoke-inputs/orders.requirements.json"
    python tests/fixtures/smoke-inputs/validate-orders.py $checkedOutWorkbook tests/fixtures/smoke-inputs/orders.requirements.json
    if ($LASTEXITCODE -ne 0) { throw 'Final committed semantic validation failed' }
    git diff --check
    if ($LASTEXITCODE -ne 0) { throw 'Diff check failed' }
    $dirt = @(git status --porcelain)
    if ($dirt.Count -ne 0) { throw "Final worktree not clean: $dirt" }
    [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'final-run.txt'), $runPath)
    Write-Output "PASS final candidate checkout proof; saved evidence $runPath"
} finally {
    Stop-Transcript | Out-Null
}
