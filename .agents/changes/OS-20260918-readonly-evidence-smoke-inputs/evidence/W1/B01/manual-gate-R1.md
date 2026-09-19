# B01 manual gate R1

PASS. Captured integration c163aeef65237b7cc5a0ecad206764012e102140; candidate b3ce33eb35dab7ac43472faa0f90220ff32a48dd; merge base ae850a38fa760cb36f0ca83db35e5830ed1cc2ed. Clean candidate and integration; exact five implementation/test paths plus own batch, no renames. Both endpoints checked; no fence extension. Own batch blob differs ONLY in six unchecked-to-checked checklist ticks; no content/Files/authority changes. Feature failing-on-base N/A. Candidate recursive143/143 PASS and diff checks clean. New deliverable checker was not used for this gate.

M	.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/02-batches-01-readonly-evidence.md
A	orchestrate/tools/check-fence.mjs
A	orchestrate/tools/git-evidence.mjs
A	tests/check-fence.test.cjs
M	tests/git-contract.test.cjs
A	tests/support/git-fixture.cjs
