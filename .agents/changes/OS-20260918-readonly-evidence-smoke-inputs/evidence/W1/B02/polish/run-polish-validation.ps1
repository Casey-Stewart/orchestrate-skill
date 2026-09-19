$ErrorActionPreference = 'Stop'
$worktree = 'C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/wt-B02'
$runPath = Join-Path $PSScriptRoot ('polish-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $runPath | Out-Null
Start-Transcript -LiteralPath (Join-Path $runPath 'validation-transcript.txt') | Out-Null
try {
    Set-Location -LiteralPath $worktree
    $env:Path = 'C:/Users/fatbo/AppData/Local/Programs/Python/Python310;' + $env:Path
    python -c "import sys, openpyxl; print(sys.executable); print(sys.version); print(openpyxl.__version__); assert sys.version_info[:3] == (3,10,6); assert openpyxl.__version__ == '3.1.5'"
    if ($LASTEXITCODE -ne 0) { throw 'Python environment mismatch' }
    Write-Output "COMMAND python $PSScriptRoot/audit-mutations.py $worktree $runPath"
    python (Join-Path $PSScriptRoot 'audit-mutations.py') $worktree $runPath
    if ($LASTEXITCODE -ne 0) { throw 'Corruption rejection proof failed' }
    Write-Output "COMMAND python $PSScriptRoot/prove-boolean-mutation.py $worktree $runPath"
    python (Join-Path $PSScriptRoot 'prove-boolean-mutation.py') $worktree $runPath
    if ($LASTEXITCODE -ne 0) { throw 'Permissive boolean mutation proof failed' }
    Write-Output 'COMMAND recursive FullName-sorted Node suites + git diff --check'
    $testFiles = @(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName)
    if ($testFiles.Count -eq 0) { throw 'No Node test suites discovered' }
    $testFiles | ForEach-Object { Write-Output "SUITE $_" }
    node --test --test-reporter=spec @testFiles
    if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
    git diff --check
    if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }
    git diff --exit-code 6ccc46f76eb8d45ff9a9e24bf99ad45b76bab8dc -- .gitattributes tests/fixtures/smoke-inputs
    if ($LASTEXITCODE -ne 0) { throw 'Unexpected production artifact change' }
    [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'polish-run.txt'), $runPath)
    Write-Output "PASS verification-only B02 polish; saved evidence $runPath"
} finally {
    Stop-Transcript | Out-Null
}
