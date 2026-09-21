# C1 / B01-step1 — real fence tool over a wrapped-`polish:` batch file

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## Why a throwaway clone

`checkFence()` requires exactly one live worktree associated with the batch branch, and a
merge base that PRE-dates the polish items — run against the integration tip (which already
merged B01) the baseline and the proposal are the same blob and `validateBatchEdit` compares
identical text, so the wrapped-polish grammar is never reached. That would be a vacuous pass.
The scenario was therefore reconstructed in a throwaway clone under the system temp so the
tool sees the real B01 edit: merge base `0d1f8b7` (no appended polish items) versus batch tip
`7e9dad8` (five appended items, four of them wrapped).

No branch, commit or worktree was created in the main checkout.

## Commands

```
SRC="C:/Users/fatbo/OneDrive/Desktop/Claude Testing/orchestrate-skill"
TMP="C:/Users/fatbo/AppData/Local/Temp/qa-c1-20260921-fence"
git clone --no-hardlinks --quiet "$SRC" "$TMP/repo"
git -C "$TMP/repo" config core.autocrlf true
git -C "$TMP/repo" checkout --detach --quiet 82fe092
git -C "$TMP/repo" branch -f chore/interview-sizing-backlog-ledger 82fe092
git -C "$TMP/repo" branch -f fix/bl-011-wrapped-polish 7e9dad8
git -C "$TMP/repo" worktree add --quiet "$TMP/wt-b01" fix/bl-011-wrapped-polish

cd "$SRC"
node orchestrate/tools/check-fence.mjs \
  --repo "$TMP/repo" \
  --integration refs/heads/chore/interview-sizing-backlog-ledger \
  --batch refs/heads/fix/bl-011-wrapped-polish \
  --ledger OS-20260920-interview-sizing-backlog \
  --batch-id B01 \
  --batch-file .agents/changes/OS-20260920-interview-sizing-backlog/02-batches-01-bl-011-wrapped-polish.md
```

`82fe092` is the first parent of the B01 merge `6253432` — the integration tip as it stood
when the batch was gated. The candidate worktree reported `git status --porcelain` empty
(0 lines) before the run.

## Exit code

`0`

## Output (stdout, single JSON line; stderr empty)

```
{"status":"PASS","integrationSha":"82fe092d03c5bc54382104e43d64458f996b27f3",
 "batchSha":"7e9dad8a4ad8d5968f4a6f43f0a05779bc07b7c9",
 "mergeBase":"0d1f8b7da8549cb317ffcd362e0ef1dae3080137",
 "violations":[],"unknowns":[],
 "evidence":{"changes":[{"status":"M","paths":[".agents/.../02-batches-01-bl-011-wrapped-polish.md"]},
   {"status":"M","paths":["orchestrate/templates/02-batch.md"]},
   {"status":"M","paths":["orchestrate/tools/check-fence.mjs"]},
   {"status":"M","paths":["tests/check-fence.test.cjs"]}],
  "allowedPaths":[...],"worktrees":[... both "cleanliness":"clean" ...],
  "worktreeDiagnostics":[]}}
```

`violations` is empty, so there is no `batch-content` diagnostic; `unknowns` is empty too.

## Live control — the zero is a proven zero

A "no violations" result from a gate is exactly the kind of negative this change's history
says not to trust. The IDENTICAL command was re-run against the UN-FIXED tool, extracted from
the ledger base `efc4eec` into the throwaway directory (both `check-fence.mjs` and its
`git-evidence.mjs` import, so the relative import resolves):

```
git show efc4eec:orchestrate/tools/check-fence.mjs  > "$TMP/basetool/check-fence.mjs"
git show efc4eec:orchestrate/tools/git-evidence.mjs > "$TMP/basetool/git-evidence.mjs"
node "$TMP/basetool/check-fence.mjs" --repo "$TMP/repo" --integration refs/heads/chore/interview-sizing-backlog-ledger \
  --batch refs/heads/fix/bl-011-wrapped-polish --ledger OS-20260920-interview-sizing-backlog \
  --batch-id B01 --batch-file .agents/changes/OS-20260920-interview-sizing-backlog/02-batches-01-bl-011-wrapped-polish.md
```

Exit code `1`:

```
status: VIOLATION
total violations: 43 batch-content: 43 unknowns: 0
first batch-content: {"code":"batch-content","message":"Original batch lines, sections, order
and checklist text must be preserved",
"path":".agents/.../02-batches-01-bl-011-wrapped-polish.md","line":89}
```

So the harness is demonstrably capable of emitting `batch-content` on this input; the fixed
tool's zero means the fix, not a dead instrument.

**Count note, reported rather than smoothed over**: the step text cites *48* violations on the
un-fixed tool. Measured here against the batch's FINAL tip `7e9dad8` the un-fixed tool emits
**43**. The 48 in the batch file was measured during pre-flight, on the batch file as it stood
at that moment (its checklist grew afterwards). Same defect class and same diagnostic code;
the exact number is not reproducible from the shipped tip and should not be read as one.

## Verdict

PASS — the real, fixed fence tool exits 0 with zero `batch-content` diagnostics on a batch
file whose diff appends four wrapped `polish:` items, while the un-fixed tool emits 43 on the
identical input.
