param(
    [string]$Worktree = 'C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/wt-B02',
    [string]$WaveBase = 'ae850a38fa760cb36f0ca83db35e5830ed1cc2ed'
)
$ErrorActionPreference = 'Stop'
$runPath = Join-Path $PSScriptRoot ('run-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $runPath | Out-Null
Start-Transcript -LiteralPath (Join-Path $runPath 'validation-transcript.txt') | Out-Null
try {
    Set-Location -LiteralPath $Worktree
    $pythonDirectory = 'C:/Users/fatbo/AppData/Local/Programs/Python/Python310'
    $env:Path = $pythonDirectory + ';' + $env:Path
    Write-Output 'COMMAND python -c <verify interpreter and versions>'
    python -c "import sys, openpyxl; print(sys.executable); print(sys.version); print(openpyxl.__version__); assert sys.version_info[:3] == (3,10,6); assert openpyxl.__version__ == '3.1.5'; assert sys.executable.replace(chr(92), '/').lower() == 'c:/users/fatbo/appdata/local/programs/python/python310/python.exe'"
    if ($LASTEXITCODE -ne 0) { throw 'Recorded Python prerequisite failed' }
    foreach ($name in @('generation-A.xlsx', 'generation-B.xlsx')) {
        $outputPath = Join-Path $runPath $name
        Write-Output "COMMAND python tests/fixtures/smoke-inputs/generate-orders.py $outputPath"
        python tests/fixtures/smoke-inputs/generate-orders.py $outputPath
        if ($LASTEXITCODE -ne 0) { throw 'Generation failed' }
        Write-Output "COMMAND python tests/fixtures/smoke-inputs/validate-orders.py $outputPath tests/fixtures/smoke-inputs/orders.requirements.json"
        python tests/fixtures/smoke-inputs/validate-orders.py $outputPath tests/fixtures/smoke-inputs/orders.requirements.json
        if ($LASTEXITCODE -ne 0) { throw 'Independent generation validation failed' }
    }
    $outputPath = Join-Path $runPath 'generation-A.xlsx'
    $before = (Get-FileHash -LiteralPath $outputPath -Algorithm SHA256).Hash
    Write-Output "COMMAND python tests/fixtures/smoke-inputs/generate-orders.py $outputPath (expected refusal)"
    python tests/fixtures/smoke-inputs/generate-orders.py $outputPath
    if ($LASTEXITCODE -ne 1) { throw 'Overwrite refusal did not fail with exit 1' }
    if ((Get-FileHash -LiteralPath $outputPath -Algorithm SHA256).Hash -ne $before) { throw 'Overwrite refusal changed original bytes' }
    Write-Output "COMMAND node $PSScriptRoot/verify-checkout.cjs $Worktree $runPath $WaveBase"
    node (Join-Path $PSScriptRoot 'verify-checkout.cjs') $Worktree $runPath $WaveBase
    if ($LASTEXITCODE -ne 0) { throw 'Byte preservation proof failed' }
    $checkedOutWorkbook = Join-Path $runPath 'candidate-checkout/tests/fixtures/smoke-inputs/orders.xlsx'
    Write-Output "COMMAND python tests/fixtures/smoke-inputs/validate-orders.py $checkedOutWorkbook tests/fixtures/smoke-inputs/orders.requirements.json"
    python tests/fixtures/smoke-inputs/validate-orders.py $checkedOutWorkbook tests/fixtures/smoke-inputs/orders.requirements.json
    if ($LASTEXITCODE -ne 0) { throw 'Independent committed-checkout validation failed' }
    Write-Output "COMMAND python $PSScriptRoot/audit-mutations.py $Worktree $runPath"
    python (Join-Path $PSScriptRoot 'audit-mutations.py') $Worktree $runPath
    if ($LASTEXITCODE -ne 0) { throw 'Corruption rejection proof failed' }
    Write-Output 'COMMAND recursive FullName-sorted Node suites + git diff --check'
    $testFiles = @(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName)
    if ($testFiles.Count -eq 0) { throw 'No Node test suites discovered' }
    $testFiles | ForEach-Object { Write-Output "SUITE $_" }
    node --test --test-reporter=spec @testFiles
    if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
    git diff --check
    if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }
    Write-Output "PASS complete B02 validation; saved evidence $runPath"
    [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'latest-run.txt'), $runPath)
} finally {
    Stop-Transcript | Out-Null
}
