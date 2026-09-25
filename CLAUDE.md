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
- `protocol.md` and the contract template mirror each other, pinned by
  `tests/protocol-contract.test.cjs`: edit both in the same change, and treat removal as riskier
  than addition. Its two decision tables are SHA-256-pinned: even a coordinated edit reddens, by
  design — never regenerate the hash to make it pass.
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
what now enforces it; the incidents behind the longer ones are in `docs/guardrail-receipts.md`. Check a
diff against the ones its fence can actually violate.

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
- **A guard that SAMPLES the domain it claims to sweep** — this repository's most productive
  class, caught only by gates that MUTATE a fix, never by ones that read it. Ask of any guard:
  **is its subject the domain or one sample of it, and does its control exercise the tight case
  or the comfortable one?** Greppable shapes, no understanding of the code required:
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
  On any rewrite of a guard, assert the new family is a superset of the old. Prefer binding a
  domain to the checkout over hand-writing it. *(BL-004 polish, BL-016 round 2)*
- **A branch no input reaches.** Recursion proven at depth one; an error path no fixture
  triggers; a filter attribute no test resolves. If a mutation of the branch leaves the
  suite green, the branch is untested however correct it is. *(BL-005, BL-009)*
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
- **A sweep built to catch reversals of a rule is blind to an edit that NARROWS its scope.**
  When a fix replaces prose with an enumeration, ask what the enumeration excludes that the
  old text allowed. *(BL-016 round 1)*
- **A test that reads a child's raw output has a verdict that depends on the terminal.** Run from
  a colour terminal, node's runner hands `FORCE_COLOR=1` to test files, and a child's reporter
  lines arrive painted; strip ANSI before matching them, and run the suite under
  `FORCE_COLOR=1` as well as plain — every agent run here writes to a file, never a TTY.
  *(`tests/validate.test.cjs`, the forced-colour loop; OS-20260923 C1 issue 2)*

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
- **A pointer is not a specification.** A backlog entry or a ledger can be right about the
  defect and wrong about the file, wrong about its own FIX SHAPE, or give an illustrative list
  or a number that is not a specification — shipping an example behind an ONLY once narrowed a
  safety rule. Re-verify the entry against the source, re-derive what the fix IS, and re-derive any number,
  before drawing a fence or relying on it. *(BL-002, BL-003)*
- **A close whose rationale points at documentation that does not contain the fact.** When a
  close cites a document as its resolution, open that document and confirm the fact is in
  it — and check what the same diff removes.
- **Reading a stale copy of a document ONCE contaminates work that afterwards uses the
  fresh one.** When a source turns out to be stale, re-derive what was already taken from
  it rather than merely ceasing to read it.

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
  either way — and so can a gate's evidence.** **Run a live control through your own harness
  before trusting any green or any zero**: a canary needs a case that makes its marker appear,
  or it is self-fulfilling and its absence elsewhere means nothing; every mutation script must
  abort loudly when its anchor is absent, and say so in its report — "I mutated it and nothing
  reddened" is a claim to verify. Restore-by-checkout is only safe once the real edit is
  committed. Write Markdown through the file tools or a single-quoted script — a double-quoted
  shell string command-substitutes its backticks — and sweep the result for emptied code spans
  (a doubled space where a name was) rather than rereading the line. *(BL-003 polish)*
- **"No test can verify this" is not "no agent can verify this."** A step is human only on the
  grounds `protocol.md`'s Runner rule lists, pinned by `tests/protocol-contract.test.cjs`; a
  checkpoint asks the user for a verdict, not for labour. *(BL-016)*
- **An issued input derived from the tree goes stale when a repair changes the tree.** Before
  any re-issue, regenerate and re-validate every input derived from files a repair touched.
  *(OS-20260923 C1 issue 2, step 6)*

## Orchestration

Multi-batch work runs from a ledger under `.agents/changes/`; the ledger's own
`00-READBEFORE.md` is the contract and outranks the skill's reference docs. Statuses are
claims, git is truth. Never commit to `main`, never push, and never merge toward `main`
without the user's explicit words in the session that acts on them.

- **Severity is about behaviour, never about the fence.** A violated criterion whose fix sits
  outside the batch's files is still P0/P1; the fence decides how it is fixed (`NEEDS_FENCE`,
  a recorded extension), not whether it blocks. *(OS-20260923 C1 issue 1)*
