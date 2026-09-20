# Log — OS-20260920-interview-sizing-backlog

Append-only narrative for this change: reviewer arcs, root causes, reconciliations,
fence-extension reasoning, pre-smoke findings, in-run learnings. Written ONLY by the
orchestrator, ONLY on the integration branch, in the same commits as PROGRESS. Never read
at boot — a PROGRESS Notes cell or session-log row names the heading to read. One `##`
heading per session (date), one `###` per batch or event. Never edit an earlier entry.

## Learnings

- **The 4-question cap was the tool’s schema, not a policy.** Two sessions could have been spent
  hunting for the rule that "set" it. When a limit looks arbitrary, check the tool definition
  before the documentation.
- **A pre-flight that only reads the plan finds nothing.** Every one of this change’s seven
  blocking findings came from grepping the repository for consumers the plan had not named.

## 2026-09-20 — scaffold

### Pre-flight: 7 blocking findings, all resolved before approval

One fresh read-only sub-agent audited the draft plan against the repository. It independently
re-ran the baseline (`260 pass, 0 fail`) and returned **NOT READY**. Each finding and its
resolution:

1. **`tests/smoke-page.test.cjs` was in no fence.** It builds sidecars at `:112` and `:155` with
   `gate.checks` and no `gate.commands`, then calls the real builder. BL-012’s rejection rule
   would redden it from outside every fence. → Added to B06.
2. **The gate BL-012 redefines is specified in two files B06 could not touch.**
   `smoke-page.md:139` defers to `execution-models.md:131-136`, and the spec is baked for every
   ledger at `templates/00-READBEFORE.md:394,405-407`. Requiring a containment check in the
   builder while both still describe branch+version+canary would make every future scaffolder
   author a sidecar the new builder rejects. → Both added to B06, which forced B06 into a wave of
   its own and pushed B04 and B07 apart.
3. **BL-016 understated its file set by three.** Live "default human" statements also sit at
   `protocol.md:371`, `templates/00-READBEFORE.md:368` and `templates/02-batch.md:52`. The last
   two decide what a driving session and a planner actually read, so a rule landing only in the
   reference docs never reaches a ledger. → B07 widened from four files to seven.
4. **BL-014 had no criterion that fails on base.** The only assertion over that span compares the
   two mirrors to each other — green before the edit, green after, and green again if a later
   batch deletes the command. → `tests/protocol-contract.test.cjs` added to B04.
5. **The single human smoke step could not reach the change.** `README.md:122` documents the
   install as a junction to the MAIN checkout while the change stops at the integration branch,
   and the installed copy is in fact a stale August duplicate with no `tools/` directory. The
   checkpoint’s one human step would have exercised code that is not under test. → Re-asked; the
   user dropped the live trial and C1 became fully agent-run.
6. **Wave 1 was not wave-safe in the sense claimed.** Four of the six original members are
   asserted by `tests/protocol-contract.test.cjs`, which none of them owned; `:80-87` builds the
   placeholder set from every `templates/*.md` and the registry rows from `scaffolding.md` and
   compares them, so three batches fed one assertion that could only go red at the tip. → The
   wave map was rebuilt; B04 owns that test file, and B02 carries an explicit constraint never to
   add or remove a `{{PLACEHOLDER}}`, only to change the `{{EXECUTION_MODEL}}` row’s third column.
7. **The tools this change fixes are read from the current checkout.** Every batch would have
   been gated by the UNFIXED `check-fence.mjs:92` — the exact 48-violation failure that put
   BL-011 in the backlog — six times over, and the "dogfood BL-012" decision would have been
   false unless the builder ran from the integration tree. → B01 (BL-011) now runs ALONE in wave
   1, and the contract’s §Validation commands states where the helpers must be invoked from.

### Advisory findings carried into the batch files

Twelve advisory findings were recorded; the load-bearing ones are written into the batch files as
named traps rather than left here: the `recipes.length === 7` pin that forbids B05 adding CLI
surface; the `residualGrep` at `protocol-contract.test.cjs:157` that admits no `.` or `;` inside
its clause, constraining how BL-010’s exemption may be worded; the requirement that B01’s wrapped-
polish example stay INSIDE `02-batch.md`’s instruction comment so it does not ship live into every
scaffolded ledger; the risk that BL-017 reaches `subagent-prompts.md` if implemented as an ordering
change rather than an added post-render pass; and the observation that A2–A5 are pure additions,
defeated by an appended sentence, so each needs a positive pin AND a contradiction sweep.

Pre-flight also raised B03 from M to L: BL-004 was the same parser in the same file and took three
review rounds and three polish passes.

### Wave-map reasoning beyond the plan’s one-liners

Four waves rather than two is the price of five documents being contested.
`templates/00-READBEFORE.md` is wanted by B04 (the mirrored filter sentence), B06 (the gate spec)
and B07 (a `Runner:` default); `execution-models.md` by B06 and B07; `scaffolding.md` and
`SKILL.md` by B02 and B07. Rather than merge those into one enormous batch, the fences stay
narrow and the waves stay short. Concurrency survives where it is real: W2 runs four genuinely
independent batches.

### Environment facts verified at scaffold time

Node v22.22.3; git with `origin` at `https://github.com/Casey-Stewart/orchestrate-skill.git`;
baseline `260 pass, 0 fail` at `efc4eec`; working tree clean after the user-ordered
`git restore` of the hand-applied BL-014 edit; `.claude/agents/` holds all four definitions,
so the `test-hunter` gate is available to this ledger, unlike the ledger that created it.
