# Step 6 — BL-005: a nested definition is caught (re-run)

This is the second step that must go RED. It did.

## Tracked definitions hashed BEFORE (sha256)

```
45977d29bef8f5d79625b731fe90cca99131f2203727f4c8433aa3dd7fff70e6  .claude/agents/implementer.md
f743e51f40e6261c5b04cd05d2507749b7ab18460de1cdf87976431438f8b19f  .claude/agents/qa-runner.md
f042965b9145bb2556d4c736ebdc0046c8ce1bc96b189dc6542da9b640f1a9a1  .claude/agents/reviewer.md
37398da438ff078583a5122a4c69f724ee702dc2314d67a406c0802cc14bff0d  .claude/agents/test-hunter.md
```
`git status --porcelain` before: empty.

## Induce the failure

```
mkdir -p .claude/agents/subdir
printf 'hello\n' > .claude/agents/subdir/orchestrator.md
git status --porcelain   ->  ?? .claude/agents/subdir/
```
Untracked only — no tracked file was written. Nothing was written to `~/.claude/agents/`.

## RED run

```powershell
node --test --test-reporter=spec @testFiles
```
**Exit 1.** Totals:
```
ℹ tests 260
ℹ pass 259
ℹ fail 1
```
Single failing name:
```
✖ the directory holds exactly the four known definitions (1.8336ms)
```
And the assertion message names the path, ahead of the deepEqual diff:
```
AssertionError [ERR_ASSERTION]: unknown definition under .claude/agents/:
subdir/orchestrator.md, which this test knows no tool list for. Nested is the worse case ...
+   'subdir/orchestrator.md'
    actual: [ 'subdir/orchestrator.md' ],
```
Both halves of the pass line are met: the named test AND the path `subdir/orchestrator.md`.

## Restore and GREEN run

```
rm -f .claude/agents/subdir/orchestrator.md
rmdir .claude/agents/subdir          # directory gone
git status --porcelain               -> empty
node --test --test-reporter=spec @testFiles -> exit 0
git diff --check                     -> exit 0
```
```
ℹ tests 260
ℹ pass 260
ℹ fail 0
```

## Tracked definitions hashed AFTER

`diff` of the before/after sha256 lists is empty — the four tracked definitions are
**hash-identical** before and after. `git status --porcelain` after: empty.

## Verdict

PASS — the suite went genuinely RED (259/1) on exactly the named test with the offending path in the message, returned to 260/0 after the delete, and the four tracked definitions were byte-identical throughout.
