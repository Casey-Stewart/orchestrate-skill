# Step 08 — A nested definition is caught

**Runner**: agent
Run in this repository, as the step directs. Nothing was written to `~/.claude/agents/`.

## Baseline — the four tracked definitions

```
$ git ls-files -s .claude/agents/
100644 506fd1af854eefa37f0cf5b597af18f693a5efe0 0  .claude/agents/implementer.md
100644 cea60eae25d45df0d058db46a11159cf6d435813 0  .claude/agents/qa-runner.md
100644 4da17a3f45e4b546002a00b3ba7f036afe492d0f 0  .claude/agents/reviewer.md
100644 414a8c6842bc7a9225451c24fe1d3ce1a57f1311 0  .claude/agents/test-hunter.md

$ git check-ignore -v .claude/agents/subdir/orchestrator.md   ->  exit 1 (NOT ignored)
$ git status --porcelain
?? .agents/changes/OS-20260919-backlog-sweep/evidence/
?? .agents/changes/OS-20260919-backlog-sweep/smoke-C1.md
```

`.claude/` is not gitignored, so `git status --porcelain` genuinely observes this step's
file — the cleanup proof below is real and not vacuous.

## 1 — Create the nested definition

```
$ mkdir -p .claude/agents/subdir
$ printf 'hello\n' > .claude/agents/subdir/orchestrator.md
CREATE_EXIT=0
$ cat .claude/agents/subdir/orchestrator.md
hello

$ git status --porcelain
?? .agents/changes/OS-20260919-backlog-sweep/evidence/
?? .agents/changes/OS-20260919-backlog-sweep/smoke-C1.md
?? .claude/agents/subdir/          <-- the new untracked file
```

The four tracked definitions re-hashed at this moment: identical to baseline (`506fd1af`,
`cea60eae`, `4da17a3f`, `414a8c68`). Untouched.

## 2 — Validation recipe: RED

```
$ powershell -File recipe.ps1 -Root <repo root>
=== DISCOVERED 9 TEST FILES ===
ℹ tests 260
ℹ pass 259
ℹ fail 1
=== NODE_TEST_EXIT=1 ===
=== RECIPE THROWS HERE: Node test suite failed ===
PS_EXIT=1     (wall clock 244 s)
```

The single failure:

```
✖ failing tests:

test at tests\agent-definitions.test.cjs:373:1
✖ the directory holds exactly the four known definitions (1.2438ms)
  AssertionError [ERR_ASSERTION]: unknown definition under .claude/agents/: subdir/orchestrator.md,
  which this test knows no tool list for. Nested is the worse case:
  `mkdir -p ~/.claude/agents && cp orchestrate-skill/.claude/agents/*.md ~/.claude/agents/`
  leaves it behind, but a build that recurses loads it with no `tools:` line
  + actual - expected

  + [
  +   'subdir/orchestrator.md'
  + ]
  - []

      at assertKnownDefinitions (...\tests\agent-definitions.test.cjs:364:10)
    actual: [ 'subdir/orchestrator.md' ],
    expected: [],
    operator: 'deepStrictEqual',
```

Both halves of the Pass condition are in there: the test name
`the directory holds exactly the four known definitions`, and the path
`subdir/orchestrator.md`.

Worth recording precisely: the path appears **in the assertion message itself**, ahead of
the `+ actual - expected` block, not only inside deepEqual's appended diff. That is the
exact defect the B01 polish item P1 was opened for ("the nested-path assertion cannot
fail" / "the path was named by the diff and not by the message"). This run confirms the
polish fix held — the message names `subdir/orchestrator.md` on its own.

## 3 — Delete and re-run: green

```
$ rm -f .claude/agents/subdir/orchestrator.md
$ rmdir .claude/agents/subdir
CLEANUP_EXIT=0
$ ls .claude/agents/
implementer.md  qa-runner.md  reviewer.md  test-hunter.md

$ git status --porcelain
?? .agents/changes/OS-20260919-backlog-sweep/evidence/
?? .agents/changes/OS-20260919-backlog-sweep/smoke-C1.md
```

The `?? .claude/agents/subdir/` entry is gone; only the pre-existing untracked smoke script
and this evidence directory remain. Re-hashed the four definitions once more — still
`506fd1af`, `cea60eae`, `4da17a3f`, `414a8c68`.

```
$ powershell -File recipe.ps1 -Root <repo root>
ℹ tests 260
ℹ suites 0
ℹ pass 260
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 249586.1337
=== NODE_TEST_EXIT=0 ===
=== GIT_DIFF_CHECK_EXIT=0 ===
=== RECIPE END: OK ===
PS_EXIT=0     (wall clock 250 s)     ✖ count in log: 0
```

## Pass conditions

| Condition | Observed | Met |
| --- | --- | --- |
| RED with the nested file present | 259/260, exit 1 | yes |
| failure names `the directory holds exactly the four known definitions` | verbatim, sole failure | yes |
| failure names the path `subdir/orchestrator.md` | in the message's own text | yes |
| green after the delete | 260/260, exit 0 | yes |
| `git status --porcelain` empty (bar this run's evidence) | yes | yes |
| never touched the four tracked definitions | all four hashes identical at all three checkpoints | yes |
| never wrote into `~/.claude/agents/` | not written, not read-modified | yes |

## Verdict

PASS — the nested definition drove exactly one failure naming both the test and `subdir/orchestrator.md`, the suite returned to 260/260 after the delete, and the four tracked definitions were hash-identical throughout.
