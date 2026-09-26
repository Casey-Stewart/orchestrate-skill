# Guardrail receipts

The incidents behind the longer rules in `CLAUDE.md` §Bug-class guardrails and §Orchestration.
`CLAUDE.md` keeps each rule; the stories live here so the always-loaded file (and every gate
prompt rendered from it) stays small. Nothing here is a rule of its own.

## A guard that SAMPLES the domain it claims to sweep

The most productive class this repository has: eleven sightings in one change, five in another,
including in the very assertions written to close earlier sightings. Every instance was caught by a
gate that MUTATED the fix; none by one that read it — the author is thinking about the behaviour
being pinned, not about whether the new pin can fail. A sweep grown from ten patterns to fourteen
once lost a spelling while every visible signal said it grew. *(BL-004 polish, BL-016 round 2, and
five more in `OS-20260921-backlog-closeout`)*

Greppable shapes, no understanding of the code required (moved from `CLAUDE.md` at the
`OS-20260925-slim-contract-pack` close-out):

- two literals partitioning one collection with nothing relating them — for every array
  literal used as a loop domain, assert on the DOMAIN (size, set-equality, a count over
  results), not its members;
- `new Set([...a, ...b]).size === a.length + b.length` — a uniqueness check, not a size check
  (delete a member and both sides shrink);
- `indexOf` without a loop — only the FIRST occurrence is governed;
- a fixed ±N window per occurrence — occurrences closer than N share markers, and a
  generously spaced arming control never exercises the overlap;
- a corpus whose every entry sits inside the pattern's own bound (derived from it, whatever
  the comment says) — write it as prose first, pin its size and set, and require each pattern
  to own an entry no other catches;
- an out-parameter passed inline as a fresh literal and never bound.

## A sweep blind to an edit that NARROWS a rule's scope

A closed enumeration ("human ONLY when it needs a device, a GUI, held credentials, or a look-and-see
judgement") shipped one clause from a human list naming grounds it omitted — another OS, live data —
which would have licensed tagging a live-data step `agent`. The contradiction sweep could not see
it: it keyed on the rule's own vocabulary, and this was a narrowing, not a restatement.
*(BL-016 round 1)*

## A test that reads a child's raw output

The Windows run of C1 step 14 (a colour terminal, Node v22) failed one test while every gate had
passed it: the test searched a child's raw log for lines beginning `✔ `, and node's runner, started
from a colour terminal, had handed `FORCE_COLOR=1` to the test files, so the child's reporter lines
arrived painted. Every agent validation run had written to a file, never a TTY. *(OS-20260923 C1
issue 2)*

## A pointer is not a specification

`BL-003` named the wrong file; `BL-002` was wider than its text. In one change two of three entries
misdescribed the repair rather than the location: one proposed a code-span exemption when the real
defect was that the scan ran over the filled OUTPUT, and one named a wiring target that is pre-page by
construction while the pass it wires is post-page — both would have shipped as written. A backlog
entry's "a device, a GUI, held credentials, or a judgement" was an example, not a specification, and
shipping it behind an ONLY narrowed a safety rule. Five figures baked into one ledger — a registry-row
count, a PyYAML claim, a gap-family size, a file set, a violation count — were each corrected by the
agent asked to act on them.

## A close whose rationale points at documentation that does not contain the fact

An entry was closed as accepted on the ground that a declared `KNOWN_GAP` documented all three
cases; it documented two, and the same diff deleted the only other live record of the third. Every
signal read like a decision; the effect was a silent deletion.

## Reading a stale copy of a document once

A ledger was scaffolded with a `**Files**` header taken from a stale installed copy of this skill,
read early and discarded later; the form was plausible, so nothing looked wrong, and it silently
killed the fence tool's Files-line branch for the whole ledger.

## The apparatus that writes or verifies the work

Six sightings in one change, five tools: `Set-Content` collapsed a test file to one line;
`git checkout` ate an uncommitted edit mid-mutation; an editor decoded `\uXXXX` into literal control
bytes that behaved identically; a heredoc collapsed `\\n`; the Bash tool collapsed `\\b` into a
backspace inside a `new RegExp`, making every pattern dead and producing a false clean result. The
first three corrupted the work, the last two the verification of it; a live control paid out twice in
a single round. A seventh sighting, on the very commit that distilled the first six: backticked
filenames inside a DOUBLE-QUOTED `node -e "…"` string were command-substituted by bash and replaced
with nothing, so a close-out record read "puts  and  inside a test's domain". In OS-20260923 the
orchestrator's own gate loop read `$?` after a `$(…)` substitution and recorded basename's exit code
for every gate command; only the canary's expected exit 1 exposed it.

A test-hunter proved a real finding with a mutation anchored on a tag the shipped template does not
contain, so it never applied and its "suite stayed green" measured nothing — and by the same token its
claim about what the old code caught was unfounded too. The conclusion survived a correctly anchored
re-run; the proof did not. Later the same session, two more mutation scripts aborted on their own
anchor guards, each of which would otherwise have been a false green. A canary once reported "no
filter command was executed" over a fixture that contained nothing that could execute one.
*(BL-003 polish)*

Writing Markdown safely (moved from `CLAUDE.md` at the `OS-20260925-slim-contract-pack` close-out):
write it through the file tools or a single-quoted script — a double-quoted shell string
command-substitutes its backticks — and sweep the result for emptied code spans (a doubled space
where a name was) rather than rereading the line.

## An issued input derived from the tree

A pin of the skill directory's hash, issued at C1, failed at its re-issue because the fix-ups had
changed three skill files; the step that consumed it had been re-issued at its old revision without
new inputs. *(OS-20260923 C1 issue 2, step 6)*

## Severity is about behaviour, never about the fence

Two defects — `validate.mjs` counting a test file with no tests as a passing test, and `mutate.mjs`
reading SURVIVED after a control that ran no test — were found by the gates and routed to the backlog:
one downgraded to an ASK because its fix sat outside the batch's fence (a fence extension was
mechanically available), the other recorded as a display nit without checking its consequence. The
user asked whether they were P0/P1 and failed the checkpoint. *(OS-20260923 C1 issue 1)*
