# Orchestrate self-improvement — approved plan

Starting version: `f918fe39762c70edb9a3424e54eaa208fd7c5727`.
Baseline: **64/64 tests pass**. Plan v4 independent pre-flight: **PRE-FLIGHT CLEAN** (no remaining blocking findings).

| Wave | Batch | Weight | Scope |
|---|---|---|---|
| 1, concurrent | B01 | L | Read-only Git evidence helper and fence checker; production-helper Git scenarios and adversarial fence tests. |
| 1, concurrent | B02 | L | Scoped .gitattributes, byte-preserved Excel artifacts, exact regeneration and independent semantic validation. |
| 2 | B03 | L | Input validator and builder together; shared workflow updates, file links, preservation and revision invalidation. |

W1 has disjoint five-file fences. A read-only planning probe confirms the proposed
attribute rules leave B01 paths unchanged; B02 must repeat effective checks and
fresh-checkout validation before integration. There is no hidden attribute dependency. B01 owns the shared
Git code used by both read-only helpers. B01 must pass the plan's fixed external CLI/result tests; B02 supplies fixed files
and tested generation/validation commands. B03 owns its input validator and builder
together, depends on those completed deliverables and owns all
shared documentation plus the visible smoke page, avoiding conflicting parallel
edits. B03 is deliberately the final serialization point: a blocking review there
delays completion. The second FIX FIRST stops the run; a third attempt requires
explicit user authorization. **One final user checkpoint, C1 after W2**, covers everything.

The Excel example includes Orders, Summary and Types sheets; leading-zero text
IDs, numbers, formulas with cached results, Unicode, blanks, a zero quantity and a
return. Expected total: **23.50**, order count: **4**. A working-copy change has
explicit expected recalculation and reset instructions. The actual generated XLSX
will be delivered and preserved with C1, after mandatory independent validation
using literal python (verified 3.10.6, openpyxl 3.1.5). PATH/alias/permission issues
cannot silently downgrade this requirement. B03 explicitly updates README's
three-suite command to recursive Get-ChildItem -Recurse / Sort-Object FullName
discovery, including a real nested failing-then-passing sentinel test.

Byte acceptance requires SHA256(generation A) = SHA256(generation B) =
SHA256(committed workbook file bytes), plus independent semantic validation.
Fresh core.autocrlf=true checkouts must preserve fixture and active/archived input
hashes. The integrity checker hashes raw delivered bytes without normalization.

This ledger retains the verified Python310 path as a local environment fact; reusable
templates must never hardcode it. Historical P1-1…P1-4 are resolved at the starting
commit, with pinned source evidence in the ledger. New residuals need distinct
OS-BL-NNN IDs/current evidence; no unrelated backlog edits.

The generated ledger uses the fully baked starting contract and source provenance.
Later changes to the skill cannot silently change this run. Helpers remain read-only;
Git evidence makes no workflow decisions, and the checker does not replace review.
Every batch in this ledger receives the existing manual mechanical fence gate;
the new checker does not replace it. A fresh independent reviewer and separate
read-only test hunter then run in parallel. B02's validator gets hunter scrutiny too.

Interview choices are confirmed: local `refs/heads/main` shipment; isolated `codex/`
branches; user merges to main and pushes; Node/CLI/browser QA; current-model agents;
reviewer plus test-hunter batch gates (explicit user amendment); convergence off; no versioning system or backlog fold-ins.
No plan.json migration, production recovery engine or unrelated redesign.

- [Full plan, exact file fences and acceptance criteria](01-plan.md)
- [Fixed external CLI and artifact contracts](03-interface-contracts.md)
- [Literal Python commands, manual gates and test-hunter duties](04-run-validation.md)
- [Byte preservation, recursive discovery and pinned historical evidence](05-byte-validation-and-scope.md)
- [Frozen contract draft](00-READBEFORE.md)
- [Verbatim request and interview decisions](00-request.md)
- [Pre-flight findings, fixes and evidence](LOG.md)

Approved on 2026-09-18, verbatim: "Okay, approved." The portable-command checklist
addition also passed independent delta pre-flight. This ledger is scaffolded on
`codex/readonly-evidence-smoke-inputs-ledger`; new mode stops before implementation.