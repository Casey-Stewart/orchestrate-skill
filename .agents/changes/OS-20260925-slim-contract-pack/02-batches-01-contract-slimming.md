# B01 — Contract slimming: one copy of the procedure (chore, —)

**Branch**: `chore/contract-slimming`
Cut from the integration tip when the wave opens.
**Wave**: 1 · **Weight**: L
**Depends on**: none
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files**: `orchestrate/templates/00-READBEFORE.md`, `orchestrate/templates/PROGRESS.md`, `orchestrate/templates/01-plan.md`, `orchestrate/references/protocol.md`, `orchestrate/references/scaffolding.md`, `orchestrate/references/execution-models.md`, `orchestrate/references/subagent-prompts.md`, `orchestrate/references/smoke-page.md`, `orchestrate/SKILL.md`, `README.md`, `CLAUDE.md`, `tests/protocol-contract.test.cjs`, `tests/tool-wiring.test.cjs`, `tests/contract-prompt-authority.test.cjs`, `tests/prompt.test.cjs`, `tests/build-smoke-page.test.cjs`, `tests/interview-sizing.test.cjs`, `tests/check-ledger.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: positive-only assertions on prose (pin the passage AND scan the rest for contradicting directives); a sweep built to catch reversals is blind to an edit that NARROWS scope (assert the new banned family is a superset); a test that pins the defect (hunt the assertion that froze the old meaning of "contract carries the procedure"); vacuous-until-later documentation (re-check claims written before this change); a close whose rationale points at documentation that does not contain the fact (every moved sentence must be FOUND in protocol.md); skill source written from inside this repo, read from outside it (no clone-relative paths); CLAUDE.md: protocol.md and the template mirror each other until this batch; never regenerate the SHA pins; line endings
**Spec**: [01-plan.md](01-plan.md) §B01 · **Gate**: fence check → reviewer + test-hunter (reviewer on the strong tier)

## Implementation notes

### The feature, verbatim (Features.md #14, dated 2026-09-22/23, untracked in the main checkout)

> ### 14. Contract slimming, no protocol pinning
>
> **Replaces:** the template's copied procedure sections — session algorithm, recovery table, boot sequence, most of the git model and the close-out, about 33K of the 59K-character template — and the test that keeps them byte-identical with `references/protocol.md`.
>
> **Build:**
> - The template keeps the repo facts: validation commands, version rule, environment, conventions, prohibitions, roles and named gate agents, smoke facts. One line replaces the procedure: the skill's `protocol.md` governs.
> - The conductor reads `protocol.md` at boot beside the contract. No protocol pinning: a ledger runs under the installed skill, and the conductor stops and asks when the ledger and the skill disagree.
> - `tests/protocol-contract.test.cjs` loses its mirror and SHA-pin assertions; the recovery and capped-verdict tables live once, in `protocol.md`. `CLAUDE.md`'s mirror convention is rewritten to match.
> - #13's stale-install check compares the installed copy against the skill repository, not against a hash in the contract.
> - After #1 and #4 ship, the procedure prose in `protocol.md` shrinks to what `ledger.mjs` and `reconcile.mjs` cannot decide.
>
> **Evidence:**
> - `templates/00-READBEFORE.md` grew from 12,275 to 59,064 bytes between 09-12 and 09-21. 224 of its 615 substantive lines (21K characters) are verbatim from `protocol.md`; about 33K are orchestrator-only procedure. A filled contract is about 69K (the high-priority pack's is 68,999 bytes).
> - Eight 09-17 "review fixes" commits each edited both copies, +284 / −180 lines in the template alone.
> - The conductor reads only the contract at boot (`SKILL.md` step 2). The 09-23 run read it in two chunks, 76K characters, and touched `protocol.md` twice for greps of 0.2K and 1.4K. The 09-15 run read its 26K contract once and `protocol.md` never.
> - Sub-agents never read it: prompts paste the conventions and prohibitions blocks, about 7K, and neither repo's agent definitions mention the contract.
> - No run was found that continued under an older contract after the skill changed; the pinning benefit has not been exercised.
>
> **Size:** S. Template and `protocol.md` edits, test deletions, a `CLAUDE.md` paragraph. 1 batch.
>
> **Saves:** about 8K output tokens per scaffold (33K fewer characters to write) and nothing at run, since `protocol.md` plus a 20K contract reads the same as a 69K contract. Its value is one copy to maintain.

### Re-derived at planning time — these override the verbatim text where they differ

1. **The pin already exists; "no protocol pinning" is re-read.** Features.md #14 predates the
   skill-directory hash pin that `OS-20260923-mechanical-tools` shipped (the `**Skill**` pin
   line, `check-ledger.mjs skill --contract`). That pin hashes the whole skill directory,
   `references/protocol.md` included, so a ledger ALREADY runs under exactly the protocol it was
   scaffolded with and stops at boot when it changes. What retires here is the COPY, not the
   pin: the contract stops restating the procedure and says the pinned directory's
   `references/protocol.md` governs. #14's sentence "#13's stale-install check compares the
   installed copy against the skill repository, not against a hash in the contract" is
   superseded by the shipped pin and is NOT implemented.
2. **The SHA-256 pin on the two decision tables stays** (the user's scope, 2026-09-25): it pins
   `protocol.md`'s copy only (`tests/protocol-contract.test.cjs:69-74`). Keep those hashes
   byte-for-byte and keep both tables in `protocol.md` unchanged; delete only the
   contract↔protocol equality and shipment mirrors around them (`:64-67`, `:75-77`). CLAUDE.md's
   rule "never regenerate the hash to make it pass" stays, reworded to one copy.
3. **Keep every repo FACT the contract holds; drop only copied procedure.** The planning census
   (LOG.md §scaffold) found facts inside sections #14 lists as procedure:
   - `## Git model` holds `{{MAIN_BRANCH}}`, `{{INTEGRATION_BRANCH}}`, `{{SHIPMENT_SOURCE}}`,
     `{{SHIPMENT_REF}}`, `{{BRANCH_PREFIXES}}`, `{{WORKTREE_SETUP}}`, `{{MERGE_POLICY}}`,
     `{{EXECUTION_MODEL}}`. Keep the heading and those fact lines in their current line shape.
     `orchestrate/tools/prompt.mjs:170,185-198` parses: the `**Change**:` line; `in this ledger
     directory (…)`; the exact headings `## Git model`, `## Repo conventions (binding)`,
     `## Hard prohibitions` and `## Validation commands`; under Git model `Integration branch:
     \`…\`` and `Per-worktree setup: … . Same-wave fences were planned disjoint.` A section ends at
     the next heading of ANY level (`:170`), so the Git-model fact lines must precede any `###`
     under it. **`prompt.mjs` is outside this fence (B02 edits it in the same wave): it must keep
     working unmodified against the slimmed template** — any need to change it is `NEEDS_FENCE`.
   - The implementer paragraph pinned by `tests/contract-prompt-authority.test.cjs:20-41` (between
     `Implementer sub-agents:` and `## Roles, gates, tiers`) stays verbatim, and every filled
     ledger still carries `your spawn prompt is authoritative`.
   - Kept sections: preamble + pin line, a SHORT boot sequence (pin check first, then read the
     pinned `references/protocol.md`, then reconcile per its §Recovery, then resume validation
     through the wrapper — the order `tests/tool-wiring.test.cjs:182-216` pins), Roles/gates/tiers
     facts (gate agents, runners, tiers, report cap, metrics token; finding classes and verdicts
     become one pointer to protocol §Severity), Git model facts, Validation commands (the
     wrapper line at T:271 and the manual recipe stay), Version + changelog rule, Repo
     conventions, Hard prohibitions, and Smoke checkpoints' repo facts (`{{SMOKE_PROCEDURE}}`,
     `{{AGENT_RUNNERS}}`, the containment block `tests/build-smoke-page.test.cjs:266-297`
     matches, and the one Runner-rule sentence `tests/protocol-contract.test.cjs:486-567` counts).
   - Moved to `protocol.md` only (delete from the template): Read-only evidence tools helper
     block, §Fence changes, Complete checkpoint inputs, §Recovery table, §Session algorithm
     (including the capped-verdict table at T:632-637), close-out procedure. Where protocol.md
     lacks a sentence the template had, move it there rather than lose it — and assert the
     move (the old template text must be FOUND in protocol.md, not merely absent from T).
4. **The placeholder move.** `{{EVIDENCE_TOOL}}` and `{{FENCE_TOOL}}` disappear with the helper
   block (the plan of `OS-20260923` deferred "moving them under `{{SKILL_DIR}}`" to this change).
   `protocol.md`'s recipe lines (`:165-171`, now `node orchestrate/tools/…`) become
   `node "<skill-dir>/tools/…"`, where `<skill-dir>` is the contract's pinned `{{SKILL_DIR}}`.
   This is also BL-028's doc half; `smoke-page.md:81,85,93` (`node tools/build-smoke-page.mjs`)
   get the same form and the `KNOWN_TOOL_PATH_FAULTS` list at `tests/tool-wiring.test.cjs:415`
   retires (assert the fault list is EMPTY rather than delete the check), and
   `tests/tool-wiring.test.cjs:439` ("the exemption must cover live recipes" — the protocol's
   evidence section holding repo-relative recipes) is rewritten to the `<skill-dir>` form.
   `tests/protocol-contract.test.cjs:268-281` (runs every `node orchestrate/tools/` recipe line,
   `recipes.length === 7`) must keep executing all seven recipes as published: resolve
   `<skill-dir>` to the checkout's `orchestrate/` in the test, and keep the count pinned.
5. **Registry follows the template both ways** (`tests/protocol-contract.test.cjs:80-87`): remove
   the rows of placeholders that no longer appear (census: `{{EVIDENCE_TOOL}}`, `{{FENCE_TOOL}}`,
   and any of `{{GUARDRAILS_REF}}`, `{{CONVERGENCE}}`, `{{BACKLOG_ID_PREFIX}}`,
   `{{RELEASE_COMMAND}}`, `{{WORKTREE_SETUP}}` that end up only in deleted sections — prefer
   keeping a fact line in the template over losing an interview answer: convergence on/off,
   the backlog id scheme and the release command are repo facts a conductor needs, so keep one
   fact line each). `tests/interview-sizing.test.cjs:262-292` pins SHIPMENT_SOURCE,
   SHIPMENT_REF, MERGE_POLICY, CONVERGENCE rows — they survive by rule 3. Fix each row's
   "Where" cell (e.g. `{{EXECUTION_MODEL}}` still lives in PROGRESS).
6. **Closed-system claims are rewritten, never deleted.** The passages the census lists
   (`orchestrate/SKILL.md:13-18,42-43,154,205-208,224`, `protocol.md:3-8,20,28-37,159-161,424`,
   `scaffolding.md:95-96,119-130,311-314,323-334`, `execution-models.md:3-4,15`,
   `subagent-prompts.md:21-22`, `README.md:20,80-86,104-109,224-227`, the template preamble
   `T:5-9,31-35`, `templates/PROGRESS.md:12` "§Recovery in the contract",
   `templates/01-plan.md:5-6`, `CLAUDE.md:21-24` and `:159-160`) now say: a ledger references
   ONLY its pinned skill directory, by absolute path and hash; its procedure is that directory's
   `references/protocol.md`, frozen by the hash; every tool step has its manual procedure there;
   a session drives a ledger from the ledger plus its pinned directory. The sweeps at
   `tests/tool-wiring.test.cjs:346-392` (PASSAGES, `OLD_CLAIMS`) are rewritten to the new
   claim and must still ban the old "never references the skill" reversal — assert the new
   banned family is a superset of the old one. Interview ANSWERS stay baked (the baking rule's
   point survives): `tests/tool-wiring.test.cjs:482` `UNDO` 'a pointer into the skill' bans
   "left as a pointer / refers to / links to the skill's reference(s)" and must stay green and
   unweakened — name the procedure's home as "the pinned skill directory's
   `references/protocol.md`", never "refers to the skill's references" (found by the #15
   control's medium-effort census, missed by the planning census).
7a. **The pin-mismatch branch, redefined.** Today a `SKILL MISMATCH` / `UNKNOWN` at boot falls
   back to "this contract's manual procedures (the recipe under §Validation commands, the prompt
   list in §Session algorithm step 5, the manual fence fallback)" (`T:34-35`, `protocol.md:544`,
   pinned at `tests/tool-wiring.test.cjs:561,565`; `README.md:104-106` promises the same). After
   the move, two of those three live in exactly the directory the mismatch says changed. New
   branch: the session STOPS and asks (unchanged), and the user's recorded words pick one of
   two ways on — (a) **upgrade**: the pin line is rewritten to the new hash in the commit that
   records their words, and the ledger continues under the new `protocol.md`; (b) **restore**:
   rebuild the pinned directory byte-for-byte from the contract's new `**Skill source**` fact
   line (a new placeholder `{{SKILL_SOURCE}}`: how the pinned directory was produced, e.g.
   ``git archive <commit> orchestrate`` of `<clone path>`, or `unknown`; registry row, filled at
   scaffold time next to `{{SKILL_SHA256}}`), re-run the pin check, and continue only on
   `SKILL MATCH`. The validation recipe stays in the contract, so validation never depends on
   the pinned directory. Rewrite the three carriers and both pins to this branch; the `UNDO`
   pin-check sweeps (`tests/tool-wiring.test.cjs:474-481`) stay green.
7. **Precedence.** The contract's repo facts outrank protocol.md; protocol.md's procedure
   applies wherever the contract is silent. State this once, in protocol.md's precedence rule
   and the template preamble; `SKILL.md:154` ("the ledger's own contract outranks this skill's
   reference docs") and `CLAUDE.md:159-160` are reworded to match.
7b. **Pointers inside KEPT sections and wording traps** (the #15 control's max-effort census):
   `T:313` "(§Fence changes)" sits in Hard prohibitions, which `prompt.mjs:197` pastes into every
   implementer prompt — repoint it to "protocol.md §Fence changes"; `T:502` "§Recovery act on" the
   same; `protocol.md:730` "Contract absent → this file fills gaps" and `smoke-page.md:14,420-422`
   join note 6's rewrite. `tests/contract-prompt-authority.test.cjs:107-120` bans a full-read
   directive (`read (this|the) … (file|contract)`) in the rest of the template — "read the file
   references/protocol.md" trips it; say what governs, not "read the file".
   `tests/interview-sizing.test.cjs:277` requires the `{{EXECUTION_MODEL}}` row's Where cell to
   read `template (READBEFORE, PROGRESS)` — true under note 3, keep it. The `PINNED` constant at
   `tests/tool-wiring.test.cjs:559-570` is edited here and again by B03 (sequential waves).
8. **Frozen ledgers.** Existing ledgers keep their full contracts and run under them (legacy
   interop, `protocol.md` §Legacy ledger recognition). Nothing here reads or edits
   `.agents/archive/**`.

## Checklist

- [x] Slim `orchestrate/templates/00-READBEFORE.md` to the kept sections (notes 3, 4); move every sentence protocol.md lacks into protocol.md
- [x] `protocol.md`: single copy — precedence rule (note 7), recipe lines under `<skill-dir>` (note 4), both decision tables byte-unchanged
- [x] Registry and baking rule in `scaffolding.md` follow the template (notes 5, 6); `templates/PROGRESS.md`, `templates/01-plan.md` pointers fixed
- [x] `SKILL.md`, `execution-models.md`, `subagent-prompts.md`, `smoke-page.md`, `README.md`, `CLAUDE.md` passages rewritten (notes 4, 6, 7)
- [x] `tests/protocol-contract.test.cjs`: mirror assertions removed, SHA-256 pins kept, recipes still executed as published
- [x] Every other listed test updated to the slimmed template; each deleted assertion is replaced by one on the new home of the rule, not dropped
- [x] Pin-mismatch branch (note 7a): upgrade or restore, `{{SKILL_SOURCE}}` fact line and registry row
- [x] A test that fills the slimmed template (every placeholder given a value) and runs the real `prompt.mjs` for every role against it, plus `check-ledger.mjs parse` on a fixture ledger built from it
- [x] polish: bind `PRE_PIN_CLAIMS` to the `OLD_CLAIMS` sources read from `git show edd2f1e:tests/tool-wiring.test.cjs`, so narrowing the old family reddens (R1 reviewer ASK 1, test-hunter F5)
- [x] polish: `SKILL.md` Mode continue takes up the pinned `references/protocol.md` only after the pin check prints `SKILL MATCH` (R1 reviewer ASK 2)
- [x] polish: the moved-sentence test says a later batch must insert beside a moved sentence, or carry this test file in its fence to reword one (R1 reviewer ASK 3)
- [x] polish: the trial-merge `REWORDED` entry carries the unit's head (`git commit-tree … -m trial`) as well as its tail (test-hunter F1)
- [x] polish: the protocol step-5 needle and its `REWORDED` entry carry "a pasted prompt with no nonce line" (test-hunter F2)
- [x] polish: pin the template's boot step 4 (**Procedure**) verbatim in `PINNED` (test-hunter F3)
- [x] polish: pin README's Rollout-boundary passage verbatim in `PINNED` (test-hunter F4)

## Acceptance criteria

1. The template carries no copied procedure: none of the sections note 3 moves remains in it,
   and every sentence it lost is found in `protocol.md` (asserted by content, not by absence).
2. The two decision tables' SHA-256 values in `tests/protocol-contract.test.cjs` are unchanged
   and still computed from `protocol.md`.
3. A template filled with every placeholder renders a prompt through the unmodified
   `prompt.mjs` for every role (`PROMPT …` line, exit 0), and a fixture ledger built from it
   passes `check-ledger.mjs parse` with `PARSE OK`.
4. The placeholder registry and the template match in both directions; `{{EVIDENCE_TOOL}}` and
   `{{FENCE_TOOL}}` appear nowhere in `orchestrate/`.
5. No document under `orchestrate/`, nor `README.md` or `CLAUDE.md`, still claims the contract
   carries the procedure or that a ledger never references the skill; the sweep's banned family
   is a superset of the one it replaces.
6. Every published tool-invocation line in `protocol.md` and `smoke-page.md` uses
   `node "<skill-dir>/tools/<tool>.mjs"`, and the protocol's seven recipes still execute as
   published in the test.
8. On a pin mismatch every carrier (template boot, `protocol.md`, `README.md`) states the same
   two ways on — upgrade on recorded words, or restore from `**Skill source**` and re-check —
   and none still sends the session to procedures that live only in the pinned directory.
7. The template shrinks by at least half in bytes (63,095 at `edd2f1e`; #14's target is a
   filled contract of about 20K).

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

**You need**: nothing — every step is agent-run from the integration tip.

1. **Do**: run `node orchestrate/tools/prompt.mjs --ledger <I-03 clone>/.agents/changes/OS-20260101-fixture --role implementer --batch B01 --facts <I-03 clone>/facts.json --out ../c1-scratch/prompts`
   against the issued fixture ledger `I-03` (built from the slimmed template, cloned into `../c1-scratch/`).
   **Pass**: one `PROMPT <path> NONCE <nonce>` line, exit 0; the rendered prompt names the
   integration branch and the per-worktree setup from the Git model facts.
   **Runner**: agent (CLI).
2. **Do**: `wc -c orchestrate/templates/00-READBEFORE.md` on the base and on the tip.
   **Pass**: the tip's size is at most half the base's.
   **Runner**: agent (CLI).
3. **Do**: `grep -rn "EVIDENCE_TOOL\|FENCE_TOOL" orchestrate/`.
   **Pass**: no output, exit 1.
   **Runner**: agent (CLI).
