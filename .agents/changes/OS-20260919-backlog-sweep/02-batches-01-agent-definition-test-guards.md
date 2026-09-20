# B01 — Agent-definition guards that can fail (fix, —)

**Branch**: `fix/agent-definition-test-guards`
Cut from the integration tip when the wave opens.
**Wave**: 1 · **Weight**: S
**Depends on**: none
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files**: `tests/agent-definitions.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: "A test that asserts on a hand-rolled parse more permissive than the real consumer's" — the consumer is YAML, and this is the second attempt at that exact boundary. · "A whitelist that never enumerates its directory" — BL-005 is the recursion half of the same class. · "Tests read skill files as text, so always run the FULL suite."
**Spec**: [01-plan.md](01-plan.md) §B01 · **Gate**: fence check → failing-on-base + reviewer + `test-hunter`

The S-weight default would be one combined reviewer+gate pass, but the user's recorded
decision of 2026-09-19 is "Every batch gets the independent reviewer plus the read-only
`test-hunter` gate", and BL-004 is one of the two entries in this change that ARE
"an assertion that cannot fail". The separate gate stands.

## Implementation notes

This batch closes three backlog entries, all inside one file. Their verbatim text:

> **BL-004** (low) — `tests/agent-definitions.test.cjs` — the unquoted-`: ` frontmatter
> guard still accepts three YAML-invalid forms: a trailing colon at end of value
> (`description: Runs the steps:`), an unterminated quote, and `description: a "b: c" d`.
> Each makes YAML error on the whole document, so no definition loads and a "read-only"
> role inherits the full catalog — the same end state the strictness was added to
> prevent, reached by parse failure rather than a missing key. Bounded: `tools:` is
> asserted literally equal to a fixed string, so these can only land on `description:`.

> **BL-005** (low) — `tests/agent-definitions.test.cjs` — the directory whitelist uses a
> non-recursive `readdirSync`, so `.claude/agents/subdir/orchestrator.md` escapes it if a
> Claude Code build loads nested definitions.

> **BL-006** (trivial) — `tests/agent-definitions.test.cjs` — the body-size assertion says
> "bytes" but measures LF-normalized UTF-16 length; with em-dashes present, `qa-runner`
> reports ~1195 against 1214 on disk. Use `Buffer.byteLength`, or reword.

**Why these matter.** The file's own header comment says an omitted or widened `tools:`
line "silently inherits the whole tool catalog, MCP servers included, which is the cost
these files exist to remove". BL-004 is that same end state reached by a different route:
if the frontmatter is YAML-invalid, the document does not parse, no definition loads, and
a "read-only" reviewer gets everything. The guard was added to close that hole and three
forms still walk through it.

**Facts at the ledger base `f829040`** — verify each before relying on it:

- `:9` — `read()` does `.replace(/\r\n/g, '\n')`. Every assertion in the file sees
  LF-normalized UTF-16 text, which is exactly why `:102` does not measure bytes.
- `:37` — the field regex: `/^([A-Za-z_][A-Za-z0-9_-]*):[ \t]+(\S.*)$/`.
- `:39-40` — the guard under attack:
  `assert.ok(!/^[A-Za-z_][A-Za-z0-9_-]*:[ \t]+[^"'\n]*:[ \t]/.test(line), …)`.
  It demands a space or tab AFTER the inner colon, so a colon at end of line passes. It
  stops at the first `"` or `'`, so `a "b: c" d` passes. It has no concept of an
  unterminated quote.
- `:52-56` — `test('the directory holds exactly the four known definitions')`, using a
  single-level `fs.readdirSync(…).filter(f => f.endsWith('.md'))` and `assert.deepEqual`
  against the four known names.
- `:99-104` — `test('no definition has grown into a document')`, asserting
  `text.length <= 4096` with the message "… is N bytes; keep definitions under 4 KiB".
  The comment above it (`:96-98`) explains the intent: these files are re-read on every
  spawn, so the cost being bounded is the file as it sits on disk.
- Ground truth on disk today: `.claude/agents/` holds exactly `implementer.md`,
  `qa-runner.md`, `reviewer.md`, `test-hunter.md`; no subdirectories; `qa-runner.md` is
  1214 bytes on disk and reports ~1195 through `read()`.
- All four definitions must keep passing unchanged. **Their content is outside this
  fence** — if a real definition trips a new assertion, that is a finding to report, not
  a licence to edit the definition.
- This file is not the only consumer of `.claude/agents/`.
  `tests/subagent-type-mapping.test.cjs:139` also reads `.claude/agents/<type>.md`, but by
  `existsSync` on each named type rather than by listing the directory, so an extra or
  nested file produces no failure there and the recursion change does not disturb it. It
  is not a fence coupling and must not be edited.

**Design decisions made at planning time — follow these.**

1. Each of the three BL-004 forms must be proven rejected by a case this test feeds
   through the same validator the real definitions go through. Editing the regex and
   trusting it is not sufficient: the rejection must itself be an assertion that can fail.
   The cheapest honest shape is a small pure predicate over one frontmatter line, driven
   from a table of accept/reject cases. A stricter regex is fine; a scanner that tracks
   quote state is fine; an actual YAML parser is not available (no dependencies — see
   §Hard prohibitions in the contract).
2. A value with a *properly quoted* colon — `description: "Runs the steps: quickly"` —
   must still be ACCEPTED. The rule is YAML validity, not a ban on colons. Include this
   as an explicit accept case, or the fix trades one false verdict for another.
3. The directory check becomes recursive. A nested `.md` is a FAILURE with the offending
   relative path in the message, and the message should say why it matters: the README's
   install glob would not carry it, but a build that recurses would load it — with no
   `tools:` line, inheriting everything. If the message quotes a command, quote
   `README.md:136` verbatim —
   `mkdir -p ~/.claude/agents && cp orchestrate-skill/.claude/agents/*.md ~/.claude/agents/`
   — and NOT the shorter paraphrase in this test's own comment at `:49`. Citing no
   command is also fine.
4. Pick ONE meaning for the size ceiling and make the message say what it measured. The
   comment's intent argues for bytes on disk, which means reading the file without LF
   normalization for that assertion alone. `Buffer.byteLength` on the normalized string
   fixes the units but keeps the normalization — if you choose that, reword the message
   so it is not claiming to measure the file.
5. Keep the existing comments accurate. Several explain *why* a check is strict; if a
   check changes shape, its comment changes with it. Do not reflow untouched prose.

**Traps.**

- Do not relax `:37` or the `tools:` equality at `:70` while tightening `:39` — BL-004
  is explicitly bounded by the fact that `tools:` is pinned to a literal string, and that
  bound must survive.
- An empty subdirectory under `.claude/agents/` with no `.md` in it is not a finding.
- CRLF and LF definitions must behave identically for the frontmatter assertions.
- `definition()` is called by five tests; a change to its parse affects all of them.

## Checklist

- [x] Read `tests/agent-definitions.test.cjs` end to end and confirm each line cited above
      still says what this file claims it says; report any drift instead of working around it.
- [x] **[BL-004]** Replace the unquoted-`: ` guard with one that rejects all three named
      forms — trailing colon at end of value, unterminated quote, and `a "b: c" d` —
      while still accepting a properly quoted colon.
- [x] **[BL-004]** Add the accept/reject case table that drives the new validator, with at
      minimum: the three reject forms, the quoted-colon accept, `tools:Read, Glob` (no
      space) as a reject, and one plain valid line as an accept. Own commit.
- [ ] **[BL-005]** Make the directory whitelist recursive; a nested `.md` fails with its
      relative path and the reason in the message. Own commit.
- [ ] **[BL-006]** Fix the size assertion so its units and its message agree; state in a
      comment which one it measures and why. Own commit.
- [ ] Confirm all four shipped definitions still pass every assertion, unchanged.
- [ ] Prove failing-on-base: name, in the report, the exact assertion that goes red when
      run against the un-fixed file, for EACH of BL-004, BL-005 and BL-006.
- [ ] Run the validation commands from [00-READBEFORE.md](00-READBEFORE.md); all green.
- [ ] `git diff --name-status -M chore/backlog-sweep-ledger...HEAD` plus
      `git status --porcelain`; revert anything outside the fence.
- [ ] Commit on `fix/agent-definition-test-guards` — `fix: agent-definition guards that can actually fail (batch 01)`.

## Acceptance criteria

- Feeding `description: Runs the steps:` through the frontmatter validator FAILS the test;
  so do an unterminated quote (`description: "unterminated`) and `description: a "b: c" d`.
  Each of the three is exercised by its own case, and each case goes green only because the
  validator rejects it — not because some unrelated assertion happens to fire.
- `description: "Runs the steps: quickly"` still passes.
- `tools:Read, Glob` (no space after the colon) still fails, as it did before.
- A `.md` file placed at any depth under `.claude/agents/` fails
  `the directory holds exactly the four known definitions`, and the failure message names
  its path relative to `.claude/agents/`.
- The size assertion's message states the unit it actually measured, and that unit matches
  the number it prints for `.claude/agents/qa-runner.md` (1214 on disk today, ~1195 after
  LF normalization — whichever is chosen, the message and the number agree).
- The four shipped definitions pass every assertion in the file with no change to any of
  them.
- Failing-on-base: each of the three fixes has at least one assertion that is RED when the
  new test file is run against the repository at the batch's base commit.
- The full suite is green: 207 pass plus this batch's additions, 0 fail.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

**Step — a nested definition is caught.**
- Do: from the repository root, create `.claude/agents/subdir/orchestrator.md` containing
  the single line `hello`, then run the published validation recipe.
- Pass: the suite goes RED and the failure names
  `the directory holds exactly the four known definitions` and the path `subdir/orchestrator.md`.
  Then delete the file and the `subdir` directory and re-run: the suite is green again and
  `git status --porcelain` is empty.
- Runner: `agent` — pure CLI, and the agent proves the restore with `git status --porcelain`.
- Aside: this step deliberately creates and deletes an untracked file inside
  `.claude/agents/`. It must never touch the four tracked definitions, and it must never
  write into `~/.claude/agents/`.

**Step — the three YAML-invalid forms are rejected.**
- Do: run the published validation recipe and read the case table's test names in the
  spec-reporter output.
- Pass: each of the three forms named in BL-004 appears as its own passing case, and the
  quoted-colon accept case appears too.
- Runner: `agent` — pure CLI.
