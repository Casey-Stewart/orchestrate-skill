# C1 / B01-step2 — wrapped `polish:` example inside the `## Checklist` instruction comment

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## Commands

```
grep -n "Checklist\|<!--\|-->\|polish:\|one box" orchestrate/templates/02-batch.md
sed -n '21,32p' orchestrate/templates/02-batch.md | cat -A
node -e '<positional check, see below>'
```

The node check locates the comment's literal opening line `<!-- - [ ] one box`, its closing
`-->`, and asserts the polish header lies strictly between them with an indented continuation:

```
const L = fs.readFileSync("orchestrate/templates/02-batch.md","utf8").split(/\r?\n/);
const open  = L.findIndex(l => l.startsWith("<!-- - [ ] one box"));
const close = L.findIndex((l,i) => i > open && l.trim() === "-->");
const hdr   = L.findIndex((l,i) => i > open && i < close && /^- \[[ x]\] polish: .+$/.test(l));
const cont  = /^ +\S/.test(L[hdr+1] || "");
```

## Exit code

`0`

## Output

```
open(<!-- - [ ] one box) line: 23
close(-->) line: 31
polish header line: 29 "- [ ] polish: Pin the boundary from both directions, so a later loosening of the"
continuation line: 30 "      grammar goes red instead of passing."
wrapped: true
inside comment: true
CONTROL negative (single-line-only regex vs a bare indented line): false
```

The surrounding block, as `sed`/`cat -A` render it (no `^M`, so the file is LF and the edit
changed no EOL style):

```
21  ## Checklist
23  <!-- - [ ] one box per concrete deliverable, in implementation order; fold-in items are
27       edit. An appended item may wrap; its header starts at column 0 and every
28       continuation line is indented under it, exactly as shown:
29  - [ ] polish: Pin the boundary from both directions, so a later loosening of the
30        grammar goes red instead of passing.
31  -->
```

## Live control

The positional finder is proven non-vacuous two ways: `open`, `close` and `hdr` all resolved
to real line numbers rather than `-1` (a `-1` would have made `inside comment` trivially
false, not trivially true), and the header regex was deliberately fired at the CONTINUATION
line, where it returns `false` — so the matcher discriminates rather than matching anything.
The literal opening `<!-- - [ ] one box` that `tests/protocol-contract.test.cjs` anchors on is
present and unchanged.

## Verdict

PASS — a wrapped `polish:` example is present at lines 29-30 and sits strictly between
`<!-- - [ ] one box` (line 23) and that comment's closing `-->` (line 31), so it never ships
live into a scaffolded ledger.
