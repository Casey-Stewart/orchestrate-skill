# CLAUDE.md

## What this repository is

The product is the `orchestrate/` skill itself — `SKILL.md`, `references/`, `templates/`
and `tools/`. Editing them changes behaviour for every future ledger, so they are source,
not prose. `.agents/changes/` holds live ledgers; `.agents/archive/` holds closed ones.

## Working conventions (binding)

- **Markdown is source of truth.** These files are read by agents under a token budget.
  Keep additions surgical; never reflow or reformat surrounding text to accommodate an
  insertion, and never restate an existing rule in new words.
- **Tests are `node:test` CommonJS** under `tests/*.test.cjs`. They read the skill files as
  text and assert on their content, so a wording change can break a test in a file you did
  not open. **Always run the full suite**, never a single file.
- **Validation** is the published PowerShell recipe in `README.md` — recursive test
  discovery, `node --test --test-reporter=spec`, then `git diff --check`. `node --test`
  bare from the repository root is the portable equivalent. `node --test tests/` is **not**:
  Node's directory-argument discovery differs and the suite fails.
- `tests/protocol-contract.test.cjs` mirrors `orchestrate/references/protocol.md` against
  `orchestrate/templates/00-READBEFORE.md` — the §Read-only evidence tools sections must be
  byte-identical after placeholder substitution, and two decision tables are pinned by
  SHA-256. Removing content from those files is far riskier than adding to it, and a
  one-sided edit to either mirror goes red.
- **Never rewrite a completed ledger.** `.agents/archive/**` and any ledger whose PROGRESS
  says COMPLETE are historical records. Read them freely; write to neither.
- **Line endings**: `.gitattributes` pins specific fixture files and `git diff --check` is
  part of validation. Introduce no trailing whitespace and change no file's EOL style.
  `sed -i` under Git Bash silently converts this repo's CRLF working-tree files to LF.
- **No build step, no package manager, no third-party dependency.** Do not add one. There
  is no YAML parser available to the tests; `tests/agent-definitions.test.cjs` hand-rolls
  one deliberately.
- Commit messages are conventional: `type: summary (batch NN)`.

## Bug-class guardrails

Every class below was produced by this repository, not imagined. Each names the class and
what now enforces it. Check a diff against the ones its fence can actually violate.

### Assertions that cannot fail

- **A guard wrapped in a permanently-false condition.** An `existsSync` on a path that
  moved leaves its assertions unreachable while the test still passes. Assert that at
  least one candidate location exists, so a future move goes red instead of disarming the
  guard silently. *(BL-001)*
- **An assertion satisfied by a neighbouring assertion's output.** `assert.deepEqual`
  APPENDS its custom message to the diff rather than replacing it, so
  `err.message.includes(path)` passes on the diff no matter what the message says. Read
  the first line alone when you mean the message. *(BL-004, round 2)*
- **A boundary pinned on one side only.** A range check needs a case above *and* below it;
  pinning only the strengthening direction leaves loosening undetected. *(BL-004, polish)*
- **A whitelist pinned by sampling.** Two example rejects do not hold an 18-member set —
  adding a nineteenth member stays green. Sweep the whole domain, and write the member
  list independently of the pattern so a both-at-once edit is caught by a set-size
  assertion. *(BL-004, polish)*
- **A branch no input reaches.** Recursion proven at depth one; an error path no fixture
  triggers; a filter attribute no test resolves. If a mutation of the branch leaves the
  suite green, the branch is untested however correct it is. *(BL-005, BL-009)*
- **A self-fulfilling canary.** "No filter command was executed" proves nothing when the
  fixture contains nothing that could execute one. Add a live control that makes the
  marker appear, so its absence elsewhere means something. *(BL-003 polish)*
- **A test that pins the defect.** An existing assertion can encode the old, wrong meaning
  of "correct". When a fix changes what correct means, hunt for the assertion that froze
  the old one.
- **The fix for a vacuity finding is a prime site for a vacuity finding.** Eleven times in
  one change, the assertion written to close one contained another — the author is thinking
  about the behaviour being pinned, not about whether the new pin can fail. Every instance was
  caught by a gate that MUTATED the fix; none by one that read it. Two shapes are greppable
  without understanding the code: **two literals that partition the same collection with nothing
  relating them** — for every array literal used as a loop domain, is there an assertion whose
  subject is the DOMAIN (size, set-equality, a count over results) rather than its members? — and
  **an out-parameter passed inline as a fresh literal and never bound**, which declines half of
  what the function returned. Prefer binding a domain to the checkout over hand-writing it.
- **A guard whose coverage regressed invisibly across a rewrite.** A sweep rewritten from ten
  patterns to fourteen — with per-pattern arming, a size assertion and a disclaimer — silently
  lost a spelling it used to catch, while every visible signal said it grew. Nothing asserted the
  new family was a superset of the old. Pin coverage against a corpus written independently of
  the patterns, and assert exclusivity as a domain property: each pattern must own at least one
  entry no other catches, or deleting it balances both sides at once. *(BL-016 round 2)*
- **A guard that SAMPLES the domain it claims to sweep.** Five times in one change, across
  every batch and the repair after them. Three greppable shapes, all of which pass every
  visible signal: `indexOf` without a loop, so only the FIRST occurrence in a file is
  governed and a second one appended later is applauded; a fixed ±N window per occurrence,
  so two occurrences closer than N overlap and the second is satisfied by the first's
  markers — and the arming control, written with a generous gap, exercises only the
  non-overlapping branch; and a corpus whose every entry happens to satisfy the pattern's
  own proximity bound, which means it was derived from the pattern however the comment
  describes it. Ask of any new guard: what is its subject, one sample or the domain — and
  does its control exercise the tight case or the comfortable one?
- **A corpus and its pattern edited away together.** A family with no size pin and no
  per-pattern exclusivity can lose half itself silently: replacing one alternation with a
  never-matching literal stayed green because every corpus entry was also caught by its
  sibling. Pin the corpus size and set, and require each pattern to own an entry no other
  catches — the same prescription as the bullet above, which did not take the first time.

### Parsers, guards and their real consumers

- **A hand-rolled parse more permissive than the real consumer's.** Match the strictness of
  whatever actually reads the file. For frontmatter that is YAML — and a document that
  fails to parse loads *no* definition, so a "read-only" role inherits every tool. Prefer
  rejecting on doubt: a false rejection is a loud local red test, a false acceptance is a
  silent full-catalog inheritance. *(BL-004, BL-008)*
- **A whitelist that never enumerates its directory.** Iterating a hardcoded list lets an
  unexpected file pass every assertion. Compare the actual listing, recursively wherever
  the consumer recurses. *(BL-005)*
- **A mechanical checker that cannot read its own repository's conventions.** The fence
  tool could not parse the ids its own scaffolder wrote, nor the wrapped `polish:` lines
  every ledger here uses. Where a machine parses human-filled text, the template must
  SHOW the accepted form, not describe it — a prose rule in a contract is not a pinned
  example. *(BL-002, BL-011)*
- **A defect fixed in the reported instance and left in its sibling.** On any parser or
  probe fix, grep for every other reader of the same document or configuration.
- **A guard whose verdict depends on the checkout rather than the code.** CRLF/LF
  behaviour that passes only because this machine happens to check out one way. Assert the
  equivalence explicitly. *(BL-004, polish)*
- **A sweep built to catch reversals of a rule is blind to an edit that NARROWS its scope.** A
  closed enumeration ("human ONLY when it needs a device, a GUI, held credentials, or a
  look-and-see judgement") shipped one clause from a human list naming grounds it omitted —
  another OS, live data — which would have licensed tagging a live-data step `agent`. The
  contradiction sweep could not see it, because it keyed on the rule's own vocabulary and this
  was a narrowing, not a restatement. When a fix replaces prose with an enumeration, ask what
  the enumeration excludes that the old text allowed. *(BL-016 round 1)*

### Documents as code

- **Skill source written from inside this repo, read from outside it.** A cross-reference
  to a path only this clone resolves dangles for every consumer. Point at an action the
  reader can perform anywhere.
- **Positive-only assertions on prose.** Where the "production code" is wording, a suite
  that only asserts what must be PRESENT is defeated by appending a sentence. Pin the
  passage and scan the rest of the document for contradicting directives.
- **Vacuous-until-later documentation.** A sentence can be true when written and false
  when a later batch lands. When a change makes an existing claim load-bearing, re-check
  the claims written before it.
- **A backlog entry can be right about the defect and wrong about the file.** Re-verify
  every entry against the source before drawing a fence; a backlog is a pointer, not a
  specification. *(BL-003 named the wrong file; BL-002 was wider than its text)*
- **…and wrong about its own FIX SHAPE.** Two of three entries in one change misdescribed
  the repair, not the location: one proposed a code-span exemption when the real defect was
  that the scan ran over the filled OUTPUT, and one named a wiring target that is pre-page
  by construction while the pass it wires is post-page. Both would have shipped as written.
  Re-derive what the fix IS, not merely where it goes.
- **A close whose rationale points at documentation that does not contain the fact.** An
  entry was closed as accepted on the ground that a declared `KNOWN_GAP` documented all
  three cases; it documented two, and the same diff deleted the only other live record of
  the third. Every signal read like a decision; the effect was a silent deletion. When a
  close cites a document as its resolution, open that document and confirm the fact is in
  it — and check what the same diff removes.
- **Reading a stale copy of a document ONCE contaminates work that afterwards uses the
  fresh one.** A ledger was scaffolded with a `**Files**` header taken from a stale
  installed copy of this skill, read early and discarded later; the form was plausible, so
  nothing looked wrong, and it silently killed the fence tool's Files-line branch for the
  whole ledger. When a source turns out to be stale, re-derive what was already taken from
  it rather than merely ceasing to read it.
- **An illustrative list implemented as a closed set.** A backlog entry's "a device, a GUI, held
  credentials, or a judgement" was an example, not a specification; shipping it behind an ONLY
  narrowed a safety rule. Five figures baked into one ledger — a registry-row count, a PyYAML
  claim, a gap-family size, a file set, a violation count — were each corrected by the agent asked
  to act on them. Re-derive a number before relying on it; a ledger is a pointer too.

### Hand-over artifacts

- **Verified means verified as published.** A command is verified only when executed in
  the form the reader receives it — rendered, extracted from the artifact, run as those
  exact bytes. Not the source, not the heredoc, not the shell it was composed in. Author
  embedded commands with no backslashes and no control characters so no transport layer
  can mangle them. *(BL-017)*
- **Never pin a count that grows.** Worktree inventories and tracked-file counts change
  between authoring and reading. State the shape, not the number.
- **A step whose output a human cannot reasonably check is not a check.** If verifying
  means scanning hundreds of records, have the command report the answer.
- **The apparatus that writes or verifies the work can corrupt it, and its output looks right
  either way.** Six sightings in one change, five tools: `Set-Content` collapsed a test file to
  one line; `git checkout` ate an uncommitted edit mid-mutation; an editor decoded `\uXXXX` into
  literal control bytes that behaved identically; a heredoc collapsed `\\n`; the Bash tool
  collapsed `\\b` into a backspace inside a `new RegExp`, making every pattern dead and
  producing a **false clean result**. The first three corrupted the work, the last two the
  verification of it. **Run a live control through your own harness before trusting any green or
  any zero** — it paid out twice in a single round. Restore-by-checkout is only safe once the
  real edit is committed. A seventh sighting, on the very commit that distilled the first six:
  backticked filenames inside a DOUBLE-QUOTED `node -e "…"` string were command-substituted by
  bash and replaced with nothing, so a close-out record read "puts  and  inside a test's domain".
  Markdown here is full of backticks; write such content through the file tools, or single-quote
  the script, and sweep the result for the damage signature rather than rereading the line.
- **A GATE's evidence needs a control as much as an implementer's.** A test-hunter proved a
  real finding with a mutation anchored on a tag the shipped template does not contain, so
  it never applied and its "suite stayed green" measured nothing — and by the same token its
  claim about what the old code caught was unfounded too. The conclusion survived a correctly
  anchored re-run; the proof did not. Later the same session, two more mutation scripts
  aborted on their own anchor guards, each of which would otherwise have been a false green.
  Treat "I mutated it and nothing reddened" as a claim to verify: every mutation script must
  abort loudly when its anchor is absent, and say so in its report.
- **"No test can verify this" is not "no agent can verify this."** Test fixtures are
  isolated from the real machine by design; a subagent is not. A step needs a human only
  when it needs a device, a GUI, held credentials, or a judgement about whether something
  looks right. A checkpoint asks the user for a **verdict**, not for labour. *(BL-016)*

## Orchestration

Multi-batch work runs from a ledger under `.agents/changes/`; the ledger's own
`00-READBEFORE.md` is the contract and outranks the skill's reference docs. Statuses are
claims, git is truth. Never commit to `main`, never push, and never merge toward `main`
without the user's explicit words in the session that acts on them.
