# B03 — Leading YAML indicator characters in frontmatter (fix, —)

**Branch**: `fix/bl-008-yaml-indicators`
Cut from the integration tip when the wave opens.
**Wave**: 2 · **Weight**: L
**Depends on**: none — runs concurrently with B02, B04 and B05
**Smoke gate**: C1 (final, fully agent-run)
**Files**: `tests/agent-definitions.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: `A whitelist pinned by sampling` · `A boundary pinned on one side only` · `An assertion satisfied by a neighbouring assertion’s output` · `A branch no input reaches` · `A test that pins the defect`
**Spec**: [01-plan.md](01-plan.md) §B03 · **Gate**: fence check → failing-on-base + reviewer + test-hunter

## Implementation notes

### BL-008 — verbatim from `BACKLOG.md`

> A leading YAML **indicator character** in an unquoted frontmatter value is accepted and is a
> YAML error: `@`, backtick, `*`, `%`, `[`, `{`, `- `, `?`, `!` all confirmed against PyYAML
> 6.0.3. Same end state as the closed BL-004 — the document does not parse, no definition loads,
> and a "read-only" role inherits the whole tool catalog — but a different family, so it was
> adjudicated out of that batch’s fence by two separate reviewers rather than widening the batch
> mid-round. `tests/agent-definitions.test.cjs` now holds the quote/colon/escape families; this is
> the one remaining gap.

### Codebase facts gathered at planning time

- `tests/agent-definitions.test.cjs:52` `frontmatterField(line)` is the only parser. Its unquoted
  branch (`:104-109`) currently rejects a TAB, a trailing `:` and an inner `: `, and accepts
  everything else.
- The quoted branch (`:65-102`) is complete for the escape family and must not be disturbed.
- Every line reaches the predicate through `frontmatterFields()` at `:112`, so a predicate the
  consumer stopped calling cannot stay green. Keep it that way.
- `FRONTMATTER_CASES` at `:140` is the verdict table; `ESCAPE_MEMBERS` at `:251` and the test at
  `:253` are the model for sweeping a whole domain rather than sampling it.
- None of the four shipped definitions under `.claude/agents/` has a value beginning with an
  indicator character, so this fix reddens nothing that currently ships.
- `tests/subagent-type-mapping.test.cjs:139` reads `.claude/agents/*.md` but not their
  frontmatter values, so it is unaffected — confirmed, and outside this fence regardless.

### What "sweep the whole domain" means here

CLAUDE.md is explicit that two example rejects do not hold a set: *"A whitelist pinned by
sampling … Sweep the whole domain, and write the member list independently of the pattern so a
both-at-once edit is caught by a set-size assertion."* BL-004 — the same parser, the same file —
took three review rounds and three polish passes, which is why this batch is weight L despite
touching one file.

The nine members are `@`, `` ` ``, `*`, `%`, `[`, `{`, `- ` (dash-space), `?` and `!`. Write that
list as data, assert its size, and drive both directions from it: each member REJECTED at the
head of an unquoted value, and a control case proving the same character is fine when it is NOT
leading and when the value is quoted.

### Traps

- `- ` is a two-character member: a leading `-` followed by a space starts a block sequence,
  while `-x` is an ordinary plain scalar. Pin both, or the rule is wrong in one direction.
- `?` and `!` behave the same way — indicator only at the head of the scalar.
- Several of these characters are legal INSIDE a value. A rule that rejects them anywhere would
  reject `description: Runs the a*b case`, which YAML accepts. The boundary must be pinned on
  both sides, per `A boundary pinned on one side only`.
- `assert.deepEqual` APPENDS a custom message to its diff rather than replacing it, so a
  substring check on `err.message` passes on the diff no matter what the message says. When
  asserting the rejection REASON, read the first line alone.

## Checklist

- [x] Add the indicator-character rejection to `frontmatterField`’s unquoted branch, keeping the
      quoted branch untouched and keeping every line routed through `frontmatterFields()`.
- [x] Write the nine-member list as data, independently of the matching pattern, and assert its size
      so a both-at-once edit is caught.
- [x] Sweep the whole domain: every member rejected at the head of an unquoted value, driven from the
      list rather than from hand-written examples.
- [x] Pin the other side of the boundary: the same characters accepted when not leading, and accepted
      when the value is quoted — including `-x` versus `- x` as distinct cases.
- [x] Assert the rejection reason from the FIRST LINE of the error message, never from a `deepEqual`
      diff that would satisfy the check by accident.
- [x] Confirm the four shipped definitions under `.claude/agents/` still load, so the fix rejects
      nothing that currently ships.
      Prove failing-on-base: name, in the report, the exact assertion that goes red when run
      against the code and documents at this batch’s base.
- [x] Run the validation commands from [00-READBEFORE.md](00-READBEFORE.md); all green.
- [x] `git diff --name-status -M chore/interview-sizing-backlog-ledger...HEAD` plus `git status --porcelain`;
      revert anything outside the fence.
- [x] Commit on `fix/bl-008-yaml-indicators` — `fix: leading YAML indicator characters in frontmatter (batch 03)`.
- [x] polish: finish the ninth member — YAML's sequence-entry indicator is `-` before a space OR a
      line break, and the trailing-space strip makes `description: -` and `description: - ` the same
      value, so both reach the predicate as `-` and both must be rejected (R1 P1).
- [x] polish: sweep printable ASCII at the head of an unquoted value, asserting rejection exactly on
      the member list, and name the seven characters YAML also refuses that this parse still accepts
      in a separate `KNOWN_GAP` list asserted ACCEPTED — recording the gap instead of blessing it, so
      closing one goes red and forces the member into `INDICATOR_MEMBERS` (R1 ASK-1).
- [x] polish: `?` is rejected on doubt, not because YAML errors on it, so the sweep's loop message
      must stop claiming the document would fail to parse for that member (R1 ASK-2).
- [x] polish: pin `INDICATOR_ON_DOUBT` by equality, not by subset — a `filter(...)` against the
      member list passes for `[]`, which restores the very falsehood R1 ASK-2 removed, and for
      `['?', '!']`, which claims YAML takes a character it raises on (R2 ASK-1).
- [x] polish: scope `KNOWN_GAP`'s count to the form actually swept — a head character in front of a
      longer value — and name `=` and `~` as the one-character-value column's own members, since
      `tools: ~` loads null where this parse reads the string `~` (R2 ASK-2).

## Acceptance criteria

- Each of the nine indicator characters, at the head of an unquoted frontmatter value, is rejected
  with a reason naming YAML — and the test derives all nine from a declared member list whose size
  is asserted, so adding a tenth member without a case goes red.
- The same characters in a non-leading position, and in a quoted value, are ACCEPTED. `-x` parses;
  `- x` is rejected.
- The quoted branch’s existing behaviour — escapes, unterminated quotes, content after the closing
  quote — is unchanged, and every existing `FRONTMATTER_CASES` verdict still holds.
- All four definitions under `.claude/agents/` still parse and still yield their exact `tools:`
  lines.
- Failing-on-base: the nine rejection cases FAIL against the unmodified predicate. Name them in
  the implementer report.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

Every step below is `Runner: agent`: this change edits files in this repository and nothing
else, so no step needs a device, a GUI, held credentials or a look-and-see judgement. They
aggregate into C1’s combined page, where they are pre-verified before hand-over. No section
here touches user data.

### Step 1

- **Do**: Run the full suite and confirm the agent-definitions frontmatter cases pass, including the nine-member indicator sweep.
- **Pass**: All nine indicator characters are rejected at the head of an unquoted value; the member list’s size assertion is present so the sweep cannot silently shrink.
- **Runner**: `agent (Node CLI)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.

### Step 2

- **Do**: Confirm the four shipped definitions under `.claude/agents/` still parse and still report their exact tool lists.
- **Pass**: implementer, reviewer, test-hunter and qa-runner all load; no definition is rejected by the new rule.
- **Runner**: `agent (Node CLI)`
- **Inputs**: none — the repository at the checkpoint build, read-only. No file is issued, no
  working copy is reset, and no credential or external access is required.
