# Request (2026-09-23, verbatim)

2026-09-22, the question that led to this change:

> Okay, so what do you think we should do first as a group using the current orchestrate skill to build the next version?

2026-09-23, the request (`/orchestrate new …`):

> Nah, don't measure it. Do run orchestrate for the Start with a first ledger that builds four tools: #5 validation wrapper, #3 rendered prompts, #6 mutation harness, and a shared parser with a scaffold parse check. None of them writes ledger state or touches the SHA-pinned doc mirror.

The numbers refer to `Features.md` (dated 2026-09-22, untracked in the main checkout and
deliberately not committed — see the decisions below). Every section of it this change
implements is quoted verbatim in the batch file that implements it, so this ledger does
not depend on that file.

## User decisions

- 2026-09-23 — "Nah, don't measure it." A proposed measurement of a Shipping App ledger
  against the baseline was declined; nothing in this change measures another repository.
- 2026-09-23, interview — **Settings**: "Keep them all (Recommended)" — the previous
  ledger's (`OS-20260921-backlog-closeout`) baked answers carry forward unchanged:
  validation by the README PowerShell recipe; no version, changelog or release; smoke
  steps agent-run from the command line with C1 asking only for a verdict; batches merge
  `--no-ff` into the integration branch and the change stops there, `main` and `origin`
  untouched until the user says so; `OS-` ledger ids and `BL-` backlog ids; reviewer plus
  test-hunter on every batch; convergence off.
- 2026-09-23, interview — **Tool paths**: "Tools dir + hash (Recommended)" — other
  repositories find the tools through one contract placeholder for the skill's directory
  plus a SHA-256 hash of it (build rule 4); a mismatch at startup stops and asks. The two
  existing placeholders (`{{EVIDENCE_TOOL}}`, `{{FENCE_TOOL}}`) move under it in ledger 2.
- 2026-09-23, interview — **Features.md**: "Leave it untracked (Recommended)" — nothing
  commits it; this ledger quotes what it needs.
- 2026-09-23, plan approval — **Plan**: "Approve (Recommended)" — the five batches, the
  width-one wave map, the single agent-run final checkpoint C1, the weights, and three
  design choices presented with it: the pin hashes the whole skill directory rather than
  `tools/` alone; the five "a ledger never references this skill" passages are rewritten to
  "a ledger references only its pinned skill directory and bakes a manual procedure for
  every tool step"; reviewers and test-hunters each write exactly one findings file (the
  hunter also its mutations file and scoped spec) as a named exception to read-only.
- 2026-09-23, plan approval — **Additions**: "Discovery path fix (R5),Three prompt rules
  (R7)" — both planning proposals are in scope.

## Item → batch map

| Item | Source | Batch |
|---|---|---|
| R1 — validation wrapper (#5) | request | B01 |
| R2 — shared ledger parser (build rule 3) and scaffold parse check (#2) | request | B02 |
| R3 — skill-directory SHA-256 pin: the hash command | request (interview 2026-09-23) | B02 |
| R4 — pin, wrapper and parse check wired into contract, scaffold and SKILL.md | request (interview 2026-09-23) | B03 |
| R5 — SKILL.md discovery command resolvable outside this repository | planning proposal, approved 2026-09-23 | B03 |
| R6 — rendered prompts and file-based findings (#3) | request | B04 |
| R7 — #12's three prompt rules | planning proposal, approved 2026-09-23 | B04 |
| R8 — mutation harness, disposable checkout, and the hunter's use of it (#6) | request | B05 |
