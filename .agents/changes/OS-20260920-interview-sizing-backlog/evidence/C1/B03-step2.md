# C1 / B03-step2 — the four shipped definitions still parse and report their exact tool lists

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## Commands

```
for f in implementer reviewer test-hunter qa-runner; do
  echo "=== .claude/agents/$f.md ==="; sed -n '1,8p' ".claude/agents/$f.md"
done
```

plus the single full-suite run cited in `B03-step1.md`, whose definition-loading tests all
went green.

## Exit code

`0`

## Output — the four frontmatter blocks as they ship

```
=== .claude/agents/implementer.md ===
---
name: implementer
description: Implements one batch of a ledger-driven change inside its own git worktree, ...
tools: Read, Write, Edit, Glob, Grep, Bash
---

=== .claude/agents/reviewer.md ===
---
name: reviewer
description: Independent read-only reviewer for one batch. Audits the diff hunk by hunk ...
tools: Read, Glob, Grep, Bash
---

=== .claude/agents/test-hunter.md ===
---
name: test-hunter
description: Read-only gate agent that audits a batch's added or changed tests for vacuity ...
tools: Read, Glob, Grep, Bash
---

=== .claude/agents/qa-runner.md ===
---
name: qa-runner
description: Runs the smoke steps of a checkpoint hands-off wherever the environment allows, ...
tools: Read, Write, Edit, Glob, Grep, Bash, mcp__Claude_Browser__*
---
```

These match the agreed map at `tests/agent-definitions.test.cjs:16-19` exactly:

```
'implementer': 'Read, Write, Edit, Glob, Grep, Bash',
'reviewer':    'Read, Glob, Grep, Bash',
'test-hunter': 'Read, Glob, Grep, Bash',
'qa-runner':   'Read, Write, Edit, Glob, Grep, Bash, mcp__Claude_Browser__*',
```

No value in any of the four opens with a YAML indicator character, so the new rule rejects
none of them. The corresponding tests from the cited full-suite run:

```
✔ a CRLF definition parses identically to its LF twin (8.4145ms)
✔ the directory holds exactly the four known definitions (0.6394ms)
✔ the walk reaches a nested definition and names its relative path (13.7586ms)
✔ every role ships a definition whose frontmatter names and describes it (12.7552ms)
✔ each tools: line is exactly the agreed list
✔ the read-only pair grants no write capability through a listed tool (10.6144ms)
✔ no definition pins a model or reaches past the browser MCP server (4.7401ms)
✔ no definition has grown into a document (17.1019ms)
```

## Live control — "still parses" is a proven parse, not an untested claim

In the same throwaway detached worktree, `reviewer.md`'s description was made to open with an
indicator character (the script asserted its anchor first, so the edit could not silently
no-op):

```
- description: Independent read-only reviewer for one batch. ...
+ description: %Independent read-only reviewer for one batch. ...
```

The suite file then failed five tests, with the message naming the file, the character and
the rule:

```
✖ every role ships a definition whose frontmatter names and describes it
✖ each tools: line is exactly the agreed list
✖ the read-only pair grants no write capability through a listed tool
✖ no definition pins a model or reaches past the browser MCP server
✖ no definition has grown into a document
ℹ pass 51   ℹ fail 5

error: '.claude/agents/reviewer.md frontmatter line opens its unquoted value with `%`,
a YAML indicator character: description: %Independent read-only reviewer for one batch. ...'
```

So the four definitions being accepted is a result the rule actually produced on these bytes,
not the absence of a check. The worktree was reset with `git checkout --` and re-verified at
`git status --porcelain` = 0 lines.

## Verdict

PASS — implementer, reviewer, test-hunter and qa-runner all load under the new rule and report
exactly their agreed tool lists; none is rejected, and a deliberately indicator-opening value
in one of them is demonstrably rejected.
