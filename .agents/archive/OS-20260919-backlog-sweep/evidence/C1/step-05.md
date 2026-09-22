# Step 05 — The real fence reads this very ledger

**Runner**: agent

## Precondition check (the Aside)

```
$ git show-ref refs/heads/chore/backlog-sweep-ledger refs/heads/fix/ledger-batch-id-grammar
e79d3781b9290d54b6c4996989d7b19b6b358422 refs/heads/chore/backlog-sweep-ledger
da95cf045e3d00fe6d8441f3b6707a158be0b481 refs/heads/fix/ledger-batch-id-grammar
EXIT=0
```

Both batch branches still exist, as the Aside requires.

## Command

```
node orchestrate/tools/check-fence.mjs --repo . \
  --integration refs/heads/chore/backlog-sweep-ledger \
  --batch refs/heads/fix/ledger-batch-id-grammar \
  --ledger OS-20260919-backlog-sweep --batch-id B02 \
  --batch-file .agents/changes/OS-20260919-backlog-sweep/02-batches-02-ledger-batch-id-grammar.md
```

**Exit code**: `2` (expected `0`)

## Output

```json
{
  "status": "UNKNOWN",
  "integrationSha": "e79d3781b9290d54b6c4996989d7b19b6b358422",
  "batchSha": "da95cf045e3d00fe6d8441f3b6707a158be0b481",
  "mergeBase": "da95cf045e3d00fe6d8441f3b6707a158be0b481",
  "violations": [],
  "unknowns": [
    { "code": "candidate-worktree", "message": "Exactly one associated candidate worktree is required" }
  ],
  "evidence": {
    "changes": [],
    "allowedPaths": [
      "orchestrate/SKILL.md",
      "orchestrate/references/scaffolding.md",
      "orchestrate/templates/01-plan.md",
      "orchestrate/templates/PROGRESS.md",
      "tests/protocol-contract.test.cjs",
      ".agents/changes/OS-20260919-backlog-sweep/02-batches-02-ledger-batch-id-grammar.md"
    ],
    "worktrees": [ ...2 entries, both resolved... ],
    "worktreeDiagnostics": []
  }
}
```

## Pass conditions, checked one at a time

| Condition | Observed | Met |
| --- | --- | --- |
| `"status":"PASS"` | `"status":"UNKNOWN"` | **no** |
| exit 0 | `2` | **no** |
| `violations` empty | `[]` | yes |
| `unknowns` empty | one entry: `candidate-worktree` | **no** |

Three of the four stated conditions are not met, so this is a FAIL on the literal Pass
line. But the *cause* matters and is not BL-002.

## Diagnosis — what actually went wrong

The single unknown is `candidate-worktree`. In `orchestrate/tools/check-fence.mjs`:

```js
const associated = wt.evidence.worktrees.filter(w => w.branch === batch);
...
if (associated.length !== 1) unknowns.push(diagnostic('candidate-worktree', 'Exactly one associated candidate worktree is required'));
```

The fence requires exactly one live worktree checked out on the **batch** branch. Right now:

```
$ git worktree list
C:/Users/fatbo/OneDrive/Desktop/Claude Testing/orchestrate-skill                    e79d378 [chore/backlog-sweep-ledger]
C:/Users/fatbo/.codex/.../orchestrate-run/wt-int                                    1605eb5 [codex/readonly-evidence-smoke-inputs-ledger]
```

Nothing is checked out on `fix/ledger-batch-id-grammar`, so `associated.length === 0`.
`PROGRESS.md` row B02 records the worktree this run used — `worktree <temp>/wtbls/b02` —
and that temporary worktree was removed after B02 merged. The batch branch survived; its
worktree did not. **The Aside anticipated the branches being deleted but not the
worktrees**, and the worktrees are the thing that is already gone.

Two further signs this is a spent-precondition, not a regression:

- `mergeBase` equals `batchSha` exactly, i.e. the batch is already an ancestor of the
  integration branch (`git merge-base --is-ancestor` confirms it). The diff the fence
  grades is therefore empty (`changes: []`). This command is being run *after* the merge
  it was meant to gate.
- `allowedPaths` came back fully populated with the six fenced paths. That assignment is
  the last statement of the authority `try` block, reached only after `oneRow()` matched
  the `B02` row in **both** the `01-plan.md` and `PROGRESS.md` tables and the branch
  linkage agreed. No `authority` unknown was raised.

## On the Aside's escape clause

The Aside says anything but an `UNKNOWN` carrying `Duplicate or malformed batch IDs` would
do — that is the BL-002 diagnostic. That diagnostic did **not** appear, and the batch-ID
grammar demonstrably parsed (see `allowedPaths` above), so BL-002's defect is genuinely
fixed. By that looser reading the result is acceptable. But the Aside also asserts "this
build returns a clean PASS", and on this machine, run as written, it does not. Recording
the literal result rather than the convenient one.

## Missing prerequisite

A worktree checked out on `refs/heads/fix/ledger-batch-id-grammar`, at `da95cf0`, clean.
I did **not** create one: `git worktree add` writes into `.git/worktrees/` and would leave
this repository other than I found it, which the run contract forbids and the step does
not authorise.

## Verdict

FAIL — the command returns `"status":"UNKNOWN"` and exit 2 with a `candidate-worktree` unknown because no worktree is checked out on the batch branch any more, so the stated clean PASS cannot be reproduced (the BL-002 `Duplicate or malformed batch IDs` diagnostic is absent and the batch-ID grammar did parse).
