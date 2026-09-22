# Request (2026-09-20, verbatim)

Four messages, word for word, in the order they were sent.

**1 — the backlog triage that started it:**

> Look at Backlog.md, see if any of those are REALLY easy fixes, where changing a word or
> line fixes them. If so, tell me which ones.

**2 — the interview-sizing ask:**

> The new orchestrate is currently only asking me max 4 questions. I’m not sure why this was
> put in place, but it’s okay to ask as many as needed since the "batch" size can change a lot
> from run to run and feature clarification is not a bad thing versus building the wrong
> system.
>
> So I want to change that but lets discuss it first, give me your thoughts on how we should
> move that based on prior orcehstrate questioning rounds?

**3 — resolving the one open design question (where interview topic 5 should live):**

> Move to 7.

**4 — the instruction to orchestrate:**

> Okay use orchestrate to do this change plus deal with the current backlog.Md.

## Accuracy check (scaffold-time verification, 2026-09-20)

Every claim below was re-read against the files at the ledger base `efc4eec` rather than
trusted from its backlog text or from the discussion that produced it.

**The 4-question cap is not a policy — it is the tool’s schema.** `AskUserQuestion` declares
`questions` with `maxItems: 4` and each question 2–4 options, so there is no number to raise.
What is raisable is the number of CALLS. `orchestrate/references/scaffolding.md:263-266` already
permits back-to-back calls, but only as a grudging fallback: it instructs the orchestrator to
merge topics 1–7 down to fit ONE call, arriving at `{1+3, 2+6, 4+7, 5}`. The ask is therefore to
invert which is the default — confirmed accurate, and it is a wording change in two files.

**The compression cost is visible in all three prior ledgers, not inferred.**

- `.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-request.md` records THREE
  answers carrying roughly fifteen settings; "Use these conventions." alone confirmed the id
  prefix, gate agents, convergence off, the absence of a version/changelog system, fold-ins, the
  residual file and the review tiers — nine facts in one click.
- `.agents/changes/OS-20260919-backlog-sweep/00-request.md` records two COMPOUND option labels,
  each joining two independent axes: **"Full recipe + agent-run smoke"** (interview topic 1 plus
  topic 3) and **"Stop at integration + test-hunter"** (topic 4 plus topic 7). A user wanting the
  full recipe with human smoke had no option to select.
- `.agents/changes/OS-20260919-agent-tool-restrictions/00-request.md` records its first answer as
  a free-text counter-question — *"Do we just include the agents in the REPO and the readme tells
  the user to add them into their agents subfolder?"* — because the offered options did not
  contain the user’s framing. That ledger recorded SIX decisions, arriving across the run rather
  than in one round, so the one-round rule was already fiction in practice.

**Topic 5 structurally cannot be asked where it is listed — confirmed.** The interview is
procedure step 2 (`scaffolding.md:17`) and planning is step 3 (`:19`), but topic 5
(`scaffolding.md:243-247`) says "present the computed wave map". The wave map does not exist at
step 2. Step 7 (`scaffolding.md:70-71`) already reads "the user approves plan, wave map,
checkpoints and fold-ins in ONE pass", so topic 5 duplicates a gate that already exists; only
**weights** are missing from that sentence. The "exactly four" arithmetic closes only by counting
a question that cannot be asked. The user’s answer to where it should go was "Move to 7."

**The topic numbers are load-bearing.** `interview #N` is cited by fifteen placeholder-registry
rows in `scaffolding.md:131-174` and by precondition 2 at `:8`. The one and only citation of
topic 5 is the `{{EXECUTION_MODEL}}` row at `:141`. Renumbering would churn far more than the
rule change does, so numbers 1, 2, 3, 4, 6, 7 stay exactly as they are.

**No test pins any interview wording.** Confirmed by grep over `tests/` for `interview`,
`AskUserQuestion`, `consolidated` and `4-question`: zero hits. B02 therefore ships the first
assertions that will hold this rule.

**BACKLOG.md — ten open entries, each re-verified against source.** BL-008 (`tests/agent-
definitions.test.cjs:52`, `frontmatterField` accepts a leading YAML indicator character),
BL-009 (`orchestrate/tools/git-evidence.mjs:110` and `:119`, two fail-closed guards no fixture
can reach), BL-010 (`scaffolding.md:79-83` and `SKILL.md:186-188`, the self-check greps code
spans as if they were unfilled slots), BL-011 (`check-fence.mjs:92`, wrapped `polish:` items
rejected), BL-012 (the build-identity gate resolves to eyeballing), BL-013 (`build-smoke-page.mjs`
`validate()` at `:126-175` has neither a control-character nor a Section/Step reference check),
BL-014 (`protocol.md:216` names no command for the resolved-filter rule), BL-016 (runner
classification), BL-017 (hand-over commands verified only as published). All confirmed.

**Two backlog entries were wrong about their file sets, and one batch fence was wrong about a
test.** BL-016’s text names two files; three more live "default human" statements sit at
`protocol.md:371`, `templates/00-READBEFORE.md:368` and `templates/02-batch.md:52`, and the last
two are the only ones a driving session ever reads — a rule that lands only in the skill’s
reference docs never reaches a ledger. BL-012’s builder rejection would have reddened
`tests/smoke-page.test.cjs:112` and `:155`, which build sidecars with no `gate.commands`, from a
file in no fence at all; and the gate it redefines is specified at
`execution-models.md:131-136` and baked at `templates/00-READBEFORE.md:394,405-407`, so requiring
a containment check without touching those would make every future scaffolder author a sidecar
the new builder rejects. All three fences were widened before this scaffold commit.

**BL-015 is not a defect to fix.** It is an intermittent that did not reproduce on re-run, in a
fresh clone, or standalone, in a suite the reporting change never touched. The user’s instruction
was explicit: keep it as a watch, do not invent a fix. Its row stays open in `BACKLOG.md`.

## User decisions

**2026-09-20 — where interview topic 5 goes.** Asked whether to move it to step 7 outright or
leave a pointer row in the interview list, the user answered verbatim: **"Move to 7."** So topic 5
is deleted from the interview list entirely; no pointer row remains.

**2026-09-20 — the dirty tree.** At scaffold time `orchestrate/references/protocol.md` and
`orchestrate/templates/00-READBEFORE.md` both carried the BL-014 line uncommitted on `main`,
applied by hand between the triage and the orchestration request. Offered "carry it onto the
ledger branch", "commit on main first" or "revert it", the user selected **"Revert it, let a batch
redo it"**. The working tree was restored with `git restore` before the integration branch was
created; BL-014 is now B04’s work and passes through the normal fence, review and test gates.

**2026-09-20 — backlog scope.** Offered all ten, all-but-BL-009, or all-but-BL-009/012/013, the
user selected **"All ten"**. BL-008, BL-009, BL-010, BL-011, BL-012, BL-013, BL-014, BL-016 and
BL-017 are in scope; BL-015 remains a watch by the user’s earlier instruction.

**2026-09-20 — the stale install, out of scope.** `~/.claude/skills/orchestrate` is a stale COPY
of this skill dated 25 August with no `tools/` directory, not a junction to this repository, so
nothing shipped here reaches the user’s own sessions until it is re-installed. Offered "report
only", "add a batch" or "fix it now", the user selected **"Report only, out of scope"**. No batch
touches it and the contract forbids any agent from repointing it.

**2026-09-20 — merge policy.** The user selected **"Stop at the integration branch"**: work
stacks on `chore/interview-sizing-backlog-ledger`; merging to `refs/heads/main` and pushing to
`origin` wait for the user’s explicit words after C1 passes.

**2026-09-20 — smoke method, then revised.** The user first selected **"Agent proves all it can;
you run the trial"**, making a fresh-session `/orchestrate new` the single human step. Pre-flight
then established that this step could not reach the change: the install points at the main
checkout, and this change stops at the integration branch, so the trial session would read either
August’s copy or main’s unchanged copy — never the work under test. Re-asked with that fact, the
user selected **"Drop the live trial"**. C1 is therefore fully agent-run: the checkpoint asserts
on the edited documents, the tools and the suite, and the user gives a verdict by reading the
evidence. The first real proof of the new interview behaviour will be the next actual ledger.

**2026-09-20 — gates.** The user selected **"Reviewer + test-hunter"** on every batch.

**2026-09-20 — dogfooding BL-012.** The user selected **"Yes — build the checkpoint with the
fixed gate"**: B06 lands in wave 3, before C1 is assembled, so the checkpoint page carries an
executable containment check rather than prose asking a reader to compare two SHAs by eye.

**2026-09-20 — weights, asked and answered.** The user asked whether weight affects the agent or
effort setting per batch. It affects three things, all baked into this contract: the reviewer’s
model tier (L-weight batches get the most capable model the session can spawn; implementers
always run the default tier), the gate shape (S takes one combined reviewer+gate pass, M and L
take them separately), and fold-in eligibility (none on an L batch — moot here). Offered the
chance to raise B04 from S to M for the fuller gate, the user approved the plan with weights as
presented, so **B04 stays S**.

**2026-09-20 — plan approved, scaffold only.** Presented with the revised plan, the four-wave
map, the single final checkpoint, the weights and the pre-flight outcome (7 blocking findings, all
resolved into the plan; 12 advisory), the user selected **"Approved — scaffold only, stop"**. That
is authorization to fill and commit this ledger and nothing further: wave 1 does not open until
the user says so.

**2026-09-20 — backlog fold-ins: none.** The backlog IS this change’s request, so the scaffolding
sweep has nothing separate to offer. `bugs-2026-09-17.md` stays untouched per `BACKLOG.md`’s own
preamble.

## Item → batch map

| Item | Source | Batch |
|---|---|---|
| A1 — delete the merge arithmetic; back-to-back AskUserQuestion calls become the default | request (message 2) | B02 |
| A2 — ban compound option labels that join two independent axes | request (message 2) | B02 |
| A3 — make "confirmations + gaps only" load-bearing: never ask what detection answered, never ask what approval will ask again | request (message 2) | B02 |
| A4 — a repeat repo collapses the round by reading the previous ledger’s contract for defaults | request (message 2) | B02 |
| A5 — cap REPEATS, not questions: each decision asked once, recorded verbatim, never re-litigated | request (message 2) | B02 |
| A6 — move interview topic 5 out of the list and into procedure step 7 | request (message 3), verbatim "Move to 7." | B02 |
| A7 — keep topic numbers 1, 2, 3, 4, 6, 7 stable; repoint the `{{EXECUTION_MODEL}}` registry row | request (message 2) | B02 |
| A8 — `SKILL.md` must agree: "ONE consolidated interview round" goes | request (message 2) | B02 |
| BL-008 — leading YAML indicator characters accepted by the frontmatter parser | backlog BL-008 | B03 |
| BL-009 — two unreachable fail-closed guards in `safeResolvedFilters()` | backlog BL-009 | B05 |
| BL-010 — the scaffolder self-check greps code spans as unfilled slots | backlog BL-010 | B07 |
| BL-011 — `validateBatchEdit` rejects wrapped `- [x] polish:` items | backlog BL-011 | B01 |
| BL-012 — the smoke page’s build-identity gate has never worked | backlog BL-012 | B06 |
| BL-013 — the sidecar builder accepts control characters and dangling Section/Step references | backlog BL-013 | B06 |
| BL-014 — the resolved-filter rule names no command | backlog BL-014 | B04 |
| BL-015 — intermittent `build-smoke-page.test.cjs:531` failure | backlog BL-015 | **excluded — watch only, by the user’s instruction; nothing to edit, row stays open** |
| BL-016 — `Runner:` tags classified by fixture capability instead of agent capability | backlog BL-016 | B07 |
| BL-017 — hand-over commands are verified only when executed as published | backlog BL-017 | B06 |
| Close every fixed entry in `BACKLOG.md`; record BL-015 as a standing watch | protocol close-out | **orchestrator, at change-complete distillation — in no batch fence** |

Zero unassigned items. One named exclusion (BL-015), signed off by the user.
