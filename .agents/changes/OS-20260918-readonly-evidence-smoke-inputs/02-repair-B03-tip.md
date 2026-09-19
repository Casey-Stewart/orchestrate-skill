# Baseline tip repair — B03-tip

**Type**: fix
**Branch**: fix/B03-tip
**Base**: 7f25d9a2f6befa6d047def65473b34dfa9da6c88
**Files**: `tests/build-smoke-page.test.cjs`
**Governing contract**: 00-READBEFORE.md, unchanged.

Resume validation is 63/64: "sections survive the fill verbatim and stay inside the script block" throws at line 56 because its regex requires LF immediately after the SECTIONS assignment but Git core.autocrlf=true materializes the shipped template with CRLF. The template/builder correctly preserve content; fix only this verification portability defect. Exercise the shipped builder with explicit LF and CRLF template variants and preserve the complete embedded-section and script-trap assertions. No production/template/newline-policy changes, no weakening round-trip or escaping assertions. Preserve all other tests.

## Checklist

- [ ] Make the embedded-section assertion work for LF and CRLF, with explicit coverage of both variants.
- [ ] Run the full recursive sorted Node suite and git diff --check; commit cleanly.

## Acceptance

Both newline variants round-trip the actual builder's emitted sections while literal closing-script trap text remains escaped. Original 7f25d9a failure is reproducible on CRLF. Test-only repair: failing-on-base comparison must document the original harness failure and whether copying repaired tests makes the literal test-copy gate inconclusive; independent reviewer must assess the changed assertion against the unfixed verification path. No production behavior change is authorized merely to satisfy the proof mechanics.

## Validation

PowerShell from worktree: Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName; reject zero suites; node --test --test-reporter=spec with the file argument array; propagate nonzero; git diff --check and propagate nonzero.

## Gate

Conductor manual path/both-rename-endpoint/cleanliness and permitted-batch-edit gate, failing-on-base evidence, fresh independent reviewer plus separate test hunter in parallel, merge-tree dry run, merge, integration tip validation. Second FIX FIRST caps under the frozen contract. No change to approved W1/W2/C1 map.