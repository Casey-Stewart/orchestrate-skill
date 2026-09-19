# B02 ordinary polish mechanical close

PASS. Integration f9ee1b12ee77b6171f38ff8821756fba43698aeb; candidate c78f4270fe678e8dd049a3bf8ff19b80348689bf; merge base ae850a38fa760cb36f0ca83db35e5830ed1cc2ed. Clean candidate/integration. Manual path inspection (including both endpoints) matches approved five paths plus own batch only; no renames. Original eight checklist ticks and one authorized completed polish line only. Five production artifacts identical to reviewed 6ccc46f76eb8d45ff9a9e24bf99ad45b76bab8dc. Feature base proof N/A. Reviewer R1 SHIP; hunter ASK now closed; no production change and no new reviewer round required.

69 corruptions rejected. Exact permissive Boolean mutant accepts numeric1, actual validator rejects Types!B2.boolean, proving added negative distinguishes types. Recursive65/65 PASS; literal Python3.10.6/openpyxl3.1.5; final committed fresh-checkout A=B=workbook SHA256e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f,20 protected paths preserved,8 unchanged B01/control paths, unprotected LF conversion observed. Full scripts/reports retained alongside.

Changed paths:

M	.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/02-batches-02-smoke-input-files.md
A	.gitattributes
A	tests/fixtures/smoke-inputs/generate-orders.py
A	tests/fixtures/smoke-inputs/orders.requirements.json
A	tests/fixtures/smoke-inputs/orders.xlsx
A	tests/fixtures/smoke-inputs/validate-orders.py

Own batch diff:

diff --git a/.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/02-batches-02-smoke-input-files.md b/.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/02-batches-02-smoke-input-files.md
index d583d65..abdf552 100644
--- a/.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/02-batches-02-smoke-input-files.md
+++ b/.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/02-batches-02-smoke-input-files.md
@@ -56,14 +56,15 @@ the exact commands and results. It supplies the same fixed files for C1 QA.

 ## Checklist

-- [ ] Add narrowly scoped .gitattributes for exact fixture bytes and active/archived checkpoint inputs; no renormalization.
-- [ ] Generate and check in orders.xlsx plus its explicit requirements.
-- [ ] Prove raw SHA256(A) = SHA256(B) = SHA256(committed workbook file bytes), separately from semantic validation.
-- [ ] Verify fresh core.autocrlf=true checkout hashes for fixtures, issued/archived package copies and LF/CRLF sentinels.
-- [ ] Check effective attributes for every B01 fence path remain unchanged; no B01 checkout/byte churn.
-- [ ] Add deterministic generator and independent openpyxl validation.
-- [ ] Verify example formulas, cached results, types and all edge cases.
-- [ ] Exercise fixed consumer commands, deterministic generation and a corrupted-workbook rejection.
+- [x] Add narrowly scoped .gitattributes for exact fixture bytes and active/archived checkpoint inputs; no renormalization.
+- [x] Generate and check in orders.xlsx plus its explicit requirements.
+- [x] Prove raw SHA256(A) = SHA256(B) = SHA256(committed workbook file bytes), separately from semantic validation.
+- [x] Verify fresh core.autocrlf=true checkout hashes for fixtures, issued/archived package copies and LF/CRLF sentinels.
+- [x] Check effective attributes for every B01 fence path remain unchanged; no B01 checkout/byte churn.
+- [x] Add deterministic generator and independent openpyxl validation.
+- [x] Verify example formulas, cached results, types and all edge cases.
+- [x] Exercise fixed consumer commands, deterministic generation and a corrupted-workbook rejection.
+- [x] polish: Verify numeric 1 is rejected for the declared boolean Types!B2, including a permissive equality-only validator mutation.

 ## Acceptance criteria
