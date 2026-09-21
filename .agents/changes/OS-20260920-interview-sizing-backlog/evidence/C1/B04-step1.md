# C1 / B04-step1 — `check-attr` named in the resolved-filter sentence, in both mirrors

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## Commands

```
grep -n "check-attr" orchestrate/references/protocol.md
grep -n "check-attr" orchestrate/templates/00-READBEFORE.md
sed -n '210,224p' orchestrate/references/protocol.md
sed -n '156,170p' orchestrate/templates/00-READBEFORE.md
```

## Exit code

`0` (both greps matched)

## Output

```
=== orchestrate/references/protocol.md ===
216:endpoints. Before status, run git check-attr filter on the paths status inspects:
=== orchestrate/templates/00-READBEFORE.md ===
162:endpoints. Before status, run git check-attr filter on the paths status inspects:
```

In context — the sentence is the resolved-filter rule inside §Read-only evidence tools, and
the two mirrors are byte-identical across the whole passage:

```
Inspect every worktree's porcelain status including untracked files and both rename
endpoints. Before status, run git check-attr filter on the paths status inspects:
a path resolving to a set filter, or a submodule, makes safe cleanliness unknown;
unspecified, unset and mere configuration do not. Never execute such filter drivers to
obtain a clean result.
```

Both name the command, as an imperative (`run git check-attr filter on ...`) rather than the
former outcome-only phrasing. The corresponding suite test from the single full-suite run
cited in `B03-step1.md` is green:

```
✔ the manual read-only fallback names git check-attr filter in the resolved-filter rule (0.7696ms)
```

## Live control — the grep discriminates

A grep that matched would be meaningless if it matched anything, and the mirror-equality claim
would be meaningless if the text had never differed. Both were checked against the ledger base
`efc4eec`, where the fix does not exist:

```
protocol.md    check-attr at efc4eec                    : 0
protocol.md    "resolve the filter attribute" at efc4eec: 1
protocol.md    "resolve the filter attribute" at HEAD    : 0
00-READBEFORE  check-attr at efc4eec                    : 0
00-READBEFORE  "resolve the filter attribute" at efc4eec: 1
00-READBEFORE  "resolve the filter attribute" at HEAD    : 0
```

The same grep returns 0 for `check-attr` on the base blobs and 1 on the tip, and the retired
wording moves the opposite way in both files. The instrument reports a real change of content,
not a pattern that always matches.

## Verdict

PASS — both `orchestrate/references/protocol.md` (line 216) and
`orchestrate/templates/00-READBEFORE.md` (line 162) name `git check-attr filter` in the
resolved-filter sentence.
