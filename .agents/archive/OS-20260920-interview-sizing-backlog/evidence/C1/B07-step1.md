# C1 / B07-step1 — the scaffolder self-check, discounting code spans

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

The revised rule, `orchestrate/references/scaffolding.md` step 9:

```
9. **Self-check** — grep the new ledger directory for `{{` and `<!--`, and its `*.md` for
   `<title>` (a deleted marker can leave an example row behind): **zero hits**
   outside fenced and inline code spans. A hit inside a code span is not an unfilled
   slot — a ledger that documents templating work quotes those tokens legitimately.
```

## Command

```
node C:/Users/fatbo/AppData/Local/Temp/qa-c1-20260921-selfcheck/selfcheck.mjs \
  .agents/changes/OS-20260920-interview-sizing-backlog [exclude-prefix]
```

The masker blanks fenced blocks line by line (closer must be the same fence character and at
least as long as the opener), then blanks inline code spans over the WHOLE remaining text, so
a span wrapped across a line break is masked too. Blanking replaces characters with spaces and
preserves newlines, so reported line numbers stay true.

## Exit code

`0`

## Output — raw and span-discounted, both reported

**A. The ledger as B07 shipped it** (excluding the `evidence/C1/` files this checkpoint is
writing now, which did not exist when the rule was authored):

```
files     : 12
  {{       raw=37  outside-code-spans=0
  <!--     raw=16  outside-code-spans=0
  <title>  raw=19  outside-code-spans=0
TOTAL raw=72  outside-code-spans=0
```

**B. The whole ledger directory, including this checkpoint's own evidence files:**

```
files     : 26
  {{       raw=39  outside-code-spans=0
  <!--     raw=24  outside-code-spans=0
  <title>  raw=19  outside-code-spans=0
TOTAL raw=82  outside-code-spans=0
```

Zero hits outside code spans either way. Raw, the directory produces 72 (82 with the evidence
files) — every one inside a fenced block or an inline span, which is what the revised rule
says to expect of a ledger documenting templating work.

The raw counts were cross-checked against plain `grep -ro -F` over the same scope, which
agrees exactly: `{{` 37, `<!--` 16, `<title>` 19.

## Live control — the zero is a proven zero

A masker that blanked too much would report zero on anything. A control fixture was built in
the throwaway directory carrying each token THREE ways — bare, inside an inline span, inside a
fence — plus the hard case, an inline code span wrapped across a line break:

```
A bare unfilled slot outside any code span: {{UNFILLED_SLOT}}
A bare instruction comment outside any code span: <!-- unfilled instruction -->
A bare marker outside any code span: <title>leftover</title>
Inline span that must be discounted: `{{INLINE_SLOT}}` and `<!-- inline comment -->` ...
```text
{{FENCED_SLOT}} / <!-- fenced comment --> / <title>fenced</title>
```
`{{WRAPPED_SLOT}} and
<!-- wrapped comment -->`
```

Result:

```
  {{       raw=4  outside-code-spans=1
  <!--     raw=4  outside-code-spans=1
  <title>  raw=3  outside-code-spans=1
TOTAL raw=11  outside-code-spans=3
SURVIVORS:
  control.md:3: {{       >> A bare unfilled slot outside any code span: {{UNFILLED_SLOT}}
  control.md:4: <!--     >> A bare instruction comment outside any code span: <!-- unfilled ...
  control.md:5: <title>  >> A bare marker outside any code span: <title>leftover</title>
```

Exactly the three bare occurrences survive; the inline, the fenced and the line-break-wrapped
ones are discounted. So the masker discriminates in both directions, and the zero above is a
measurement.

## Limitations of this masker, stated plainly

- **A code span wrapped across a line break IS handled** — inline spans are masked over the
  whole document text rather than line by line, and the control above proves it on a real
  wrapped span.
- The inline-span pattern is `` (`+)([^]*?)\1 ``, a backreference rather than CommonMark's
  "closing run of EXACTLY the same length" rule. A document mixing runs of different lengths
  on one line could in principle pair the wrong delimiters. Nothing in this corpus triggered
  it, but it is not a conforming CommonMark parser.
- **Indented (four-space) code blocks are NOT masked.** A token inside one would be reported
  as a survivor. This errs toward over-reporting, so it cannot hide a real unfilled slot.
- Fence openers are recognised with up to three leading spaces. A fence nested more deeply —
  inside a list item, say — would not be recognised, and its contents would be reported. Again
  over-reporting, never under-reporting.
- HTML comments are not otherwise special-cased: `{{` inside an unfenced `<!-- ... -->` would
  be reported.

All the inaccuracies run in the conservative direction, so "zero survivors" is a stronger
result than the masker's precision alone would guarantee.

## Verdict

PASS — the ledger directory produces 72 raw hits (82 including this checkpoint's evidence
files) and **zero** outside fenced and inline code spans, with the masker proven on a control
fixture that includes a code span wrapped across a line break.
