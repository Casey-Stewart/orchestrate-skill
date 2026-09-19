# Independent test hunter R1

CLEAN

Candidate 70f6baadd702425ef13741fe59d614232e256744. Current inherited Codex model; fresh read-only hunter, separate from reviewer and implementer.

Changed test at tests/build-smoke-page.test.cjs:51-60 explicitly exercises LF/CRLF through real builder, preserves complete section equality and closing-script trap rejection. Traced buildSmokePage -> renderSlots -> embed -> scriptJson at orchestrate/tools/build-smoke-page.mjs:20,44,77,101-109 and template assignment line780.

Independent in-memory probes using actual changed test block: original builder both variants PASS; restore LF-only extraction LF PASS/CRLF FAIL; serialize only first section both FAIL full equality; remove less-than escaping both FAIL closing-script protection. Changed file23/23 PASS; diff check green and worktree clean. Checklist ticks only; no production/template/newline-policy changes. No copied-tests-on-base proof claimed. No files edited or agents spawned.