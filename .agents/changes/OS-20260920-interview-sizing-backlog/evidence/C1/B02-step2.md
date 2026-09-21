# C1 / B02-step2 — the distinct set of `interview #N` citations

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## Command

A recursive walk of the repository, skipping `.git`, `.agents` and `node_modules`, reading each
file as UTF-8, collapsing whitespace (so a citation broken over a line break is still seen) and
matching `/interview\s*#\s*(\d+)/gi`.

```
node -e '<recursive walk; regex /interview\s*#\s*(\d+)/gi over whitespace-collapsed text>'
```

## Exit code

`0`

## Output

```
total citations: 20
distinct N: [1,2,3,4,6,7]
counts by N: {"1":2,"2":3,"3":2,"4":8,"6":1,"7":4}
  bugs-2026-09-17.md                       -> {4}
  orchestrate/references/scaffolding.md    -> {1,2,3,4,6,7}
  tests/interview-sizing.test.cjs          -> {4}
```

`{1, 2, 3, 4, 6, 7}` — exactly the expected set. No `#5` and no `#8`+ anywhere outside
`.agents/`.

## Live control — the absence of 5 is a proven absence

The identical sweep was re-run with the `.agents` exclusion LIFTED. `.agents/` legitimately
quotes `interview #5` as the text being removed, so it is a live positive control made of real
repository data rather than a synthetic fixture:

```
CONTROL (.agents included) distinct N: [1,2,3,4,5,6,7]
CONTROL counts: {"1":3,"2":3,"3":2,"4":8,"5":5,"6":1,"7":4}
CONTROL files citing #5:
  .agents/changes/OS-20260920-interview-sizing-backlog/01-plan.md
  .agents/changes/OS-20260920-interview-sizing-backlog/02-batches-02-interview-sizing.md
  .agents/changes/OS-20260920-interview-sizing-backlog/LOG.md
```

The sweep finds five `interview #5` citations the moment they exist in scope, so the `5` missing
from the in-scope result is a real absence and not a dead regex or a mis-walked tree.

## Note on `scaffolding.md`'s own numbering

The interview list in `scaffolding.md` runs `1, 2, 3, 4, 6, 7` — the literal ordinals in the
document skip `5`, which is the topic-5 move this batch made. The list is not renumbered, so the
surviving citations elsewhere still resolve.

## Verdict

PASS — the distinct set of `interview #N` citations outside `.agents/` is exactly
`{1, 2, 3, 4, 6, 7}`.
