# B02 — Batch-id grammar the fence can read (fix, —)

**Branch**: `fix/ledger-batch-id-grammar`
Cut from the integration tip when the wave opens.
**Wave**: 1 · **Weight**: M
**Depends on**: none
**Smoke gate**: hands-on — checkpoint C1 follows wave 1
**Files**: `orchestrate/SKILL.md`, `orchestrate/references/scaffolding.md`, `orchestrate/templates/01-plan.md`, `orchestrate/templates/PROGRESS.md`, `tests/protocol-contract.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: "A test that pins the defect" — the existing end-to-end test pins hand-authored authority files, which is exactly what let the templates drift. · "Markdown is source of truth; keep additions surgical, never reflow surrounding text." · "Tests read skill files as text — always run the FULL suite."
**Spec**: [01-plan.md](01-plan.md) §B02 · **Gate**: fence check → failing-on-base + reviewer + `test-hunter`

## Implementation notes

Two backlog entries, both about a guard in this repository that cannot fail. Verbatim:

> **BL-001** (medium) — Dead frozen-ledger guard.
> `tests/protocol-contract.test.cjs:122` guards
> `.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md`, but
> commit `5110f71` moved that ledger to `.agents/archive/…`. The `existsSync` is
> permanently false, so its two assertions (`/Python310[\\/]python\.exe/` and the
> Excel-validation sentence) never execute. The test still passes, which is what makes it
> dangerous: it advertises a guard that cannot fail. The `existsSync` wrapper is right in
> principle — a clone made after archival need not carry the path — only the path is
> stale.

> **BL-002** (high) — `orchestrate/tools/check-fence.mjs:39` requires every `#` cell of
> the plan's authority table to match `/^B\d{2,}$/`, but `orchestrate/templates/01-plan.md`
> pins no id format and shows no example row. The OS-20260918 plan used `B01`; the
> OS-20260919 plan used bare `01`, so the mechanical fence check threw
> `Duplicate or malformed batch IDs` and returned `UNKNOWN` for **every batch of that
> change** — silently degrading step 6a to the manual fallback throughout. The repo's own
> fence checker could not read a ledger the repo's own scaffolder produced. Fix: a pinned
> example row in the template, a scaffolding self-check, and an end-to-end test that
> scaffolds a ledger and runs the real fence over it.

**BL-002 is wider than its text.** `oneRow()` at `orchestrate/tools/check-fence.mjs:39`
is called TWICE — at `:164`, once on the plan's `# | Branch | Files (fence)` table and
once on PROGRESS's `# | Branch | Notes` table. Fixing only `01-plan.md` leaves the same
`Duplicate or malformed batch IDs` firing on the PROGRESS row. **Both templates are in
this fence for that reason.**

**Facts at the ledger base `f829040`** — verify each before relying on it:

- `orchestrate/templates/01-plan.md:10-18` — a header row, an alignment row, and an
  instruction comment. No example row; the comment never mentions the `#` cell's format.
- `orchestrate/templates/PROGRESS.md:36-47` — the same shape, same omission.
- `orchestrate/templates/02-batch.md:1` already pins the form: `# B{{BATCH_NUM}} — …`,
  and `check-fence.mjs:187` asserts exactly `^# B<nn> (?:—|-) `. **This is the existing
  precedent to match.** That template is NOT in this fence and needs no change.
- `orchestrate/templates/00-READBEFORE.md` already states the rule in prose ("Bnn ids"),
  inside the §Read-only evidence tools section. **That file belongs to B03 this wave —
  do not touch it.** The prose was never the problem; the missing example was.
- The damage is on record: every Notes cell in
  `.agents/changes/OS-20260919-agent-tool-restrictions/PROGRESS.md` reads
  `Fence PASS (manual — helper UNKNOWN, see LOG R2/R3)`. That ledger is COMPLETE and
  frozen — read it, never edit it.
- `orchestrate/references/scaffolding.md` step 9 is the self-check: "grep the new ledger
  directory for `{{` and for `<!--`: **zero hits**. `**State**: ACTIVE` present in
  PROGRESS; the pre-flight verdict line present in the plan."
- `orchestrate/SKILL.md:186-187` carries the one-line summary of that same self-check.
  Both are in this fence so they cannot drift apart.
- `tests/protocol-contract.test.cjs:132` — the test *"published helper recipes execute
  actual CLIs and generated batch grammar passes the real fence"*. It builds a disposable
  repo, renders `02-batch.md` from the shipped template, and runs the real
  `check-fence.mjs` expecting `PASS`. **But** its `01-plan.md` and `PROGRESS.md` are
  hand-authored string literals that already say `B01` — which is precisely why it never
  caught BL-002. This test is the natural home for the coverage BL-002 asks for.
- `tests/protocol-contract.test.cjs:80-87` — "template placeholders and registry match
  in both directions" parses `scaffolding.md` rows matching
  `` /^\| `\{\{[A-Z_]+\}\}` \| template/ `` and compares the set against every
  `{{PLACEHOLDER}}` used across `orchestrate/templates/*.md`. An example row that
  introduces a new placeholder without a registry row goes red here.
- `tests/protocol-contract.test.cjs:107-109` asserts that `01-plan.md`, `02-batch.md` and
  `PROGRESS.md` each match `/input/i`, `/reset/`, `/revis/i`. Additions must not disturb
  those.
- `.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md` exists,
  is tracked, and still contains both strings BL-001's dead assertions look for
  (`Python310[\\/]python\.exe` and "Every generation and independent Excel-validation
  command in this run uses literal").

**Design decisions made at planning time — follow these.**

1. **BL-001**: keep the `existsSync` wrapper. The backlog entry's reasoning is right — a
   clone made after archival need not carry the path — only the path is stale. Point it
   at the archive location. Then make the guard provably live: in a checkout that HAS the
   file, the two assertions must run, and the test must go red if the file is present but
   its content drifted. Strongly consider also asserting that at least ONE of the two
   candidate locations exists in this repository, so the next move breaks the test loudly
   instead of silently disarming it a second time. Do not make the read unconditional.
2. **BL-002 — example rows. This design is settled; do not re-derive it.** The example
   row goes **inside the existing `<!-- … -->` instruction comment** of each template's
   batch table, as a literal `Bnn` row on its own line, e.g.

   ```
   | B01 | <title> | fix | S | `fix/<slug>` | 1 | `path/one.ts`, `path/two.ts` | C1 | — |
   ```

   That placement resolves the tension between "the scaffolder must SEE the row" and "the
   row must not survive into a real ledger": `scaffolding.md` step 8 already orders the
   scaffolder to replace every instruction comment with real content, and step 9 already
   greps for zero `<!--` hits — so a surviving example is caught by a gate that exists
   today, and `oneRow()` can never see it as a duplicate id. Do not add the row as a live
   table row outside the comment, and do not invent a new `{{PLACEHOLDER}}` (see `:80-87`,
   the row regex at `:83`).
3. **BL-002 — self-check**: extend `scaffolding.md` step 9 and the `SKILL.md` one-liner
   with the id-format clause: every `#` cell of the new ledger's plan AND PROGRESS batch
   tables matches `Bnn`. One clause each; do not restate the fence tool's full grammar,
   which the contract already carries.
4. **BL-002 — end-to-end. The rendering procedure is settled; do not re-derive it.**
   Extend the `:132` test so the plan and PROGRESS authority files are built by doing what
   a scaffolder does: **lift the example row out of the template's instruction comment,
   substitute real values into it, and emit header + alignment + that row** — then run the
   real `check-fence.mjs` over the result. Nothing in either authority table may be a
   hand-authored literal.

   This is what makes the test red on the un-fixed templates: **there is no example row to
   lift**, so the extraction finds nothing and the test fails with a message naming the
   template and the `Bnn` row it could not find. After the fix it lifts `| B01 | … |`,
   renders, and the fence returns `PASS`. Assert both directions — the failure message on
   a template with no example row is as much a deliverable as the `PASS`.
   **This is this batch's failing-on-base criterion and the single most important thing in
   it**: a version of this test that would also pass on the old templates has closed
   nothing.
5. Keep additions surgical. These are files agents read under a token budget; do not
   reflow, do not reformat, do not restate an existing rule in new words.

**Traps.**

- `check-fence.mjs:19` (`table()`) requires every row to have the SAME cell count as the
  header and rejects duplicate header cells. An example row with the wrong number of
  pipes breaks the parser rather than the id check — and would do so silently, as a
  different error.
- `oneRow()` rejects DUPLICATE ids as well as malformed ones. An example row left in a
  filled ledger alongside a real `B01` row is a duplicate. This is the main reason the
  example must not survive scaffolding.
- Two-or-more-digit ids (`B10`) stay legal: the regex is `\d{2,}`.
- `tests/protocol-contract.test.cjs` also asserts
  `assert.match(read('orchestrate/SKILL.md'), /Existing\nledgers keep their frozen contract/)`
  — a line-break-sensitive match. Re-wrapping a paragraph in `SKILL.md` can break it.
- **Do not edit `orchestrate/templates/00-READBEFORE.md` or
  `orchestrate/references/protocol.md`.** B03 holds both this wave. If you believe you
  need either, report `NEEDS_FENCE` — no extension can be granted to a same-wave
  sibling's file.

## Checklist

- [x] Read all five fenced files and confirm each line cited above still says what this
      file claims; report drift rather than working around it.
- [x] **[BL-001]** Repoint the frozen-ledger guard at the archive location and make it
      provably live — the two assertions execute in this checkout, and the test fails if
      the file is present with drifted content. Own commit.
- [x] **[BL-001]** Add the "at least one candidate location exists here" assertion (or
      record in the report why it was rejected).
- [x] **[BL-002]** Add the pinned `Bnn` example row to `orchestrate/templates/01-plan.md`.
- [x] **[BL-002]** Add the pinned `Bnn` example row to `orchestrate/templates/PROGRESS.md`.
- [x] **[BL-002]** Extend the step-9 self-check in `orchestrate/references/scaffolding.md`
      and the matching one-liner in `orchestrate/SKILL.md:186-187` with the id-format
      clause, covering BOTH tables. Own commit.
- [x] **[BL-002]** Rewrite the authority files in `tests/protocol-contract.test.cjs:132`
      to render from the shipped `01-plan.md` and `PROGRESS.md` templates, and run the
      real `check-fence.mjs` over the result. Own commit.
- [ ] Prove failing-on-base for BL-002: check out the batch base, apply ONLY the new test,
      and record that it goes red with the fence's own `Duplicate or malformed batch IDs`
      reaching the assertion — quote the actual failure text in the report.
- [ ] Prove failing-on-base for BL-001 **in a throwaway clone, never in this repository**
      (the contract forbids modifying `.agents/archive/`): delete the single line
      containing `Every generation and independent Excel-validation command in this run
      uses literal` and record that the guard goes red. Use that sentence, not the
      `Python310` line — five lines contain `Python310` and three match the asserted
      regex, so removing one proves nothing.
- [ ] Run the validation commands from [00-READBEFORE.md](00-READBEFORE.md); all green.
- [ ] `git diff --name-status -M chore/backlog-sweep-ledger...HEAD` plus
      `git status --porcelain`; revert anything outside the fence.
- [ ] Commit on `fix/ledger-batch-id-grammar` — `fix: pin Bnn batch ids in the ledger templates and revive the archive guard (batch 02)`.

## Acceptance criteria

- `orchestrate/templates/01-plan.md` and `orchestrate/templates/PROGRESS.md` each show a
  batch-table example row whose `#` cell matches `/^B\d{2,}$/`, and each states the rule
  where a scaffolder filling that table will read it.
- Each template's batch-table instruction comment contains a literal `Bnn` example row,
  and no example row appears as a live table row outside a comment.
- The end-to-end test builds both authority tables by lifting the example row out of the
  template's instruction comment and substituting values — no hand-authored literal row in
  either table — and runs the real `check-fence.mjs` (or its exported `checkFence`) over
  the result, which returns `PASS`.
- Run against the templates as they stand at this batch's base commit, that same test
  FAILS, with a message naming the template and the `Bnn` example row it could not find.
  Both directions are asserted; quote the base-run failure text in the report.
- `orchestrate/references/scaffolding.md` step 9 and the `orchestrate/SKILL.md` self-check
  one-liner both name the `Bnn` id check, and they agree with each other.
- The frozen-ledger guard's two assertions execute in this checkout: in a throwaway clone,
  removing the archived contract's single Excel-validation sentence turns
  `tests/protocol-contract.test.cjs` red. (`Python310` appears on five lines, three of them
  matching the asserted regex, so it is not a usable single-line perturbation.) A guard
  that still passes when the strings are gone does not satisfy this.
- `template placeholders and registry match in both directions` still passes — no new
  `{{PLACEHOLDER}}` without its registry row.
- `orchestrate/SKILL.md` still matches `/Existing\nledgers keep their frozen contract/`.
- No file outside the fence is modified; in particular
  `orchestrate/templates/00-READBEFORE.md`, `orchestrate/references/protocol.md` and
  `orchestrate/templates/02-batch.md` are untouched.
- The full suite is green: 207 pass plus this batch's additions, 0 fail.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

**Step — the real fence reads this very ledger.** *(This is the decisive one.)*
- Do: from the repository root, run
  `node orchestrate/tools/check-fence.mjs --repo . --integration refs/heads/chore/backlog-sweep-ledger --batch refs/heads/fix/ledger-batch-id-grammar --ledger OS-20260919-backlog-sweep --batch-id B02 --batch-file .agents/changes/OS-20260919-backlog-sweep/02-batches-02-ledger-batch-id-grammar.md`
  and read the JSON `status` field and the process exit code.
- Pass: `status` is `PASS` (exit 0) or `VIOLATION` (exit 1) — anything but `UNKNOWN` with
  an `authority` diagnostic reading `Duplicate or malformed batch IDs`. That specific
  diagnostic is what BL-002 is about; seeing it here means the fix did not take.
- Aside: this ledger's own tables already use the `Bnn` form, so this step proves the
  scaffolder and the checker now agree. It needs the batch branch to still exist —
  run it BEFORE the branches are deleted.
- Runner: `agent` — pure CLI, read-only.

**Step — the PROGRESS record confirms it held all change.**
- Do: read the `Notes` cell of every batch row in
  `.agents/changes/OS-20260919-backlog-sweep/PROGRESS.md`.
- Pass: each says `Fence PASS` from the mechanical helper, not
  `Fence PASS (manual — helper UNKNOWN…)` as all three rows of the previous ledger do.
- Counting: one unit = one batch row. Expect three.
- Runner: `agent` — reading the repository's own record.

**Step — the archive guard can fail.**
- Do: **in a throwaway clone, never in this repository.** Run
  `git clone . "$env:TEMP\os919bl\c1"` (a short root — this repo's deepest tracked path is
  146 characters and the scratchpad prefix would breach Windows' 260-character limit).
  In the clone, delete the one line containing
  `Every generation and independent Excel-validation command in this run uses literal`
  from `.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md`, run
  the published validation recipe **in the clone**, then
  `git -C "$env:TEMP\os919bl\c1" checkout -- .` and re-run. Finally
  `Remove-Item -Recurse -Force "$env:TEMP\os919bl\c1"`.
- Pass: in the clone the suite is RED while the line is missing, naming
  `reusable artifacts contain no local Python installation default, while frozen ledger retains its environment fact`;
  green after the restore. In THIS repository, `git status --porcelain` is empty and
  unchanged throughout, and the clone directory no longer exists at the end.
- Aside: the contract forbids an agent to modify `.agents/archive/` — that is why this
  runs in a clone. Do not perturb the file in this working tree under any circumstances.
  Use the **Excel-validation sentence**, which occurs exactly ONCE in that file. Do NOT
  use the `Python310` line: five lines contain `Python310` and three of them match the
  asserted regex `/Python310[\\/]python\.exe/`, so deleting one leaves the assertion
  satisfied and the step would record a false pass.
- Order matters: run this step after the two above, so a failure here cannot be confused
  with a wrong-build reading.
- Runner: `agent` — pure CLI, with this repository's untouched state proven by
  `git status --porcelain` before and after.
