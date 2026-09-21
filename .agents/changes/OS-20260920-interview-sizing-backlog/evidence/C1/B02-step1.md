# C1 / B02-step1 — the three retired phrases are absent from both documents

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

The step warns that these phrases WRAP across lines in the source, so a line-based `grep`
returns zero even when the phrase is present. The search therefore collapses all runs of
whitespace to a single space before matching, and the instrument is proven on a phrase that
is known to be there AND known to span a line break.

## Command

```
node -e '
const collapse = s => s.replace(/\s+/g," ").trim();
for (const f of ["orchestrate/references/scaffolding.md","orchestrate/SKILL.md"]) {
  const raw = fs.readFileSync(f,"utf8"), flat = collapse(raw);
  for (const t of ["merged down to its 4-question cap",
                   "{1+3, 2+6, 4+7, 5}",
                   "ONE consolidated interview round"]) {
    const cs = flat.split(collapse(t)).length - 1;
    const ci = flat.toLowerCase().split(collapse(t).toLowerCase()).length - 1;
    ...
  }
}'
```

Both a case-sensitive and a case-insensitive count are reported, so a phrase that survived
with different capitalisation would still be caught.

## Exit code

`0`

## Output

```
=== orchestrate/references/scaffolding.md ===
  TARGET "merged down to its 4-question cap" -> case-sensitive 0, case-insensitive 0
  TARGET "{1+3, 2+6, 4+7, 5}"                -> case-sensitive 0, case-insensitive 0
  TARGET "ONE consolidated interview round"  -> case-sensitive 0, case-insensitive 0
=== orchestrate/SKILL.md ===
  TARGET "merged down to its 4-question cap" -> case-sensitive 0, case-insensitive 0
  TARGET "{1+3, 2+6, 4+7, 5}"                -> case-sensitive 0, case-insensitive 0
  TARGET "ONE consolidated interview round"  -> case-sensitive 0, case-insensitive 0
TOTAL TARGET HITS (case-insensitive, both files): 0
```

## Live control — the zeros are proven zeros

A control phrase was built per file, mechanically, from the file's own bytes: the last 35
characters of a prose line joined to the first 35 of the NEXT line. Such a phrase exists only
across a line break, so it must be found by the collapsed search and must NOT be found by any
line-based search. Both conditions held for both files:

```
=== orchestrate/references/scaffolding.md ===
  control built from lines 17-18:
    "lls, as many as the open gaps need, covering only the gaps and the c"
  hits in collapsed text : 1
  hits on any single line: 0   (=> the phrase genuinely spans a line break)
=== orchestrate/SKILL.md ===
  control built from lines 24-25:
    "<description>` -> scaffold a ledger - `continue` -> run the session algo"
  hits in collapsed text : 1
  hits on any single line: 0   (=> the phrase genuinely spans a line break)
```

A first attempt used the hand-picked control `"back-to-back AskUserQuestion calls, as many as
the open gaps need"`; it matched `scaffolding.md` on a SINGLE line (so it proved nothing about
wrapping) and did not exist in `SKILL.md` at all. That attempt is recorded rather than hidden,
because an unproven control is exactly the failure mode this checkpoint is guarding against.
The mechanically generated controls above replaced it.

An additional corroboration: the collapsed text is shorter than the raw text for both files
(scaffolding 26378 -> 25644 chars, SKILL 18846 -> 18182), confirming the collapsing step
actually ran rather than being a no-op.

## Verdict

PASS — all three phrases are absent from both `orchestrate/references/scaffolding.md` and
`orchestrate/SKILL.md`, case-sensitively and case-insensitively, under a whitespace-collapsed
search whose ability to find wrapped phrases was demonstrated on each file.
