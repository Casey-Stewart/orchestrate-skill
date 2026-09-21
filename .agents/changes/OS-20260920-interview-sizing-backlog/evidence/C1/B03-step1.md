# C1 / B03-step1 — the frontmatter cases, including the indicator sweep

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## Command — the published validation recipe, run ONCE and cited by every step that needs it

```powershell
$testFiles = @(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName)
if ($testFiles.Count -eq 0) { throw 'No Node test suites discovered' }
node --test --test-reporter=spec @testFiles
if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }
```

## Exit code

`0` (node `0`, `git diff --check` `0`)

## Output (last lines of the run)

```
✔ §Degraded environments documents the undefined-agent-types fallback (0.2003ms)
✔ the prose read-only rules survive in every read-only skeleton (0.3643ms)
ℹ tests 306
ℹ suites 0
ℹ pass 306
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 267947.5987
NODE_EXIT=0
GIT_DIFF_CHECK_EXIT=0
RECIPE_RESULT=OK
```

306 pass / 0 fail, matching the stated build.

## The frontmatter cases, from that run

Thirty-eight accept/reject cases ran green, followed by the two indicator tests:

```
✔ the frontmatter validator accepts `name: qa-runner`
✔ the frontmatter validator accepts `description: -x is a plain scalar`
✔ the frontmatter validator rejects `description: - x opens a block sequence`
✔ the frontmatter validator rejects `description: -`
✔ the frontmatter validator rejects `description: - `
...
✔ an unquoted value may not open with a YAML indicator, and may carry one anywhere else (0.7972ms)
✔ the indicator rule rejects exactly its members at the head, and names the gap it leaves (0.2838ms)
```

## All nine indicator characters, and the size assertion

`tests/agent-definitions.test.cjs:302` writes the member list out independently of the pattern
it checks, and `:311` pins its size so the sweep cannot silently shrink:

```
const INDICATOR_MEMBERS = ['@', '`', '*', '%', '[', '{', '- ', '?', '!'];
...
assert.equal(INDICATOR_MEMBERS.length, 9, 'nine forms open a YAML node where a plain scalar was '
  + 'meant; a tenth gets its own case here, not a quietly wider pattern over there');
assert.equal(new Set(INDICATOR_MEMBERS).size, INDICATOR_MEMBERS.length,
  'a duplicated member would shorten the sweep while the size assertion still counted nine');
```

Nine members; the size assertion is present AND is backed by a distinctness assertion, so a
duplicate cannot shorten the sweep while still counting nine. `- ` is two characters on
purpose. The loop at `:318` drives every member through the predicate `frontmatterField()`
AND through the real consumer `frontmatterFields()` as a one-line document, reading the FIRST
LINE of the assertion error alone — the guard against `deepEqual` appending its diff.

## Live control — the green is a proven green

Green tests prove nothing until a mutation makes them red. In a throwaway detached worktree
under the system temp (`.../qa-c1-20260921-fence/wt-head` at `66732c6`, `git status --porcelain`
empty before the edit), `%` was dropped from the indicator pattern:

```
- const indicator = /^(- |-$|[@`*%[{!?])/.exec(value);
+ const indicator = /^(- |-$|[@`*[{!?])/.exec(value);
```

(The mutation script asserted its anchor string existed first, so a silent no-op edit was
impossible.) `node --test --test-reporter=spec tests/agent-definitions.test.cjs` then exited
`1`:

```
✖ the indicator rule rejects exactly its members at the head, and names the gap it leaves
  AssertionError [ERR_ASSERTION]: `%` is a declared member and must be rejected at the head
  of an unquoted value
  false !== true
    at tests\agent-definitions.test.cjs:398:12
```

The sweep genuinely holds all nine. The worktree was reset with `git checkout --` and
re-verified at `git status --porcelain` = 0 lines.

## Verdict

PASS — the full suite is green at 306/306 with both indicator tests passing; all nine
indicator characters are swept at the head of an unquoted value through both the predicate and
the real consumer, the member list is written independently of the pattern, and its size (and
distinctness) assertions are present — proven live by a mutation that turns the sweep red.
