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
- **"No test can verify this" is not "no agent can verify this."** Test fixtures are
  isolated from the real machine by design; a subagent is not. A step needs a human only
  when it needs a device, a GUI, held credentials, or a judgement about whether something
  looks right. A checkpoint asks the user for a **verdict**, not for labour. *(BL-016)*

## Orchestration

Multi-batch work runs from a ledger under `.agents/changes/`; the ledger's own
`00-READBEFORE.md` is the contract and outranks the skill's reference docs. Statuses are
claims, git is truth. Never commit to `main`, never push, and never merge toward `main`
without the user's explicit words in the session that acts on them.
