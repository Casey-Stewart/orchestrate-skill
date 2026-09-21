# C1 / B06-step2 — a U+0000 in a copyable command, and a dangling `Section 5`

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## How the U+0000 was built — and proven to survive

The step is explicit that a `\u` escape written through a shell is the exact corruption this
change already suffered. The NUL is therefore produced with `String.fromCharCode(0)` inside
`run.mjs` (written as a file, never typed through a shell) and spliced into the middle of a
copyable gate command:

```
const NUL = String.fromCharCode(0);
if (NUL.codePointAt(0) !== 0) throw new Error("NUL construction failed");
nulSidecar.gate.commands[1] = "git merge-base --is-ancestor " + SHA + NUL + " HEAD";
if (!nulSidecar.gate.commands[1].split("").some(c => c.charCodeAt(0) === 0)) {
  throw new Error("fixture 2a lost its U+0000 before serialisation");
}
```

and the file is then read back off disk and re-parsed to confirm the builder will actually be
fed a NUL:

```
== fixture 2a integrity ==
literal 0x00 bytes on disk      : 0 (JSON escapes it, so 0 is correct)
file contains the backslash-u-0000 escape : true
re-parsed command holds U+0000  : true
```

The driver throws before running the builder if that last line is false, so a corrupted
fixture reports as an error rather than as a clean pass.

## Commands

```
node orchestrate/tools/build-smoke-page.mjs <dir>/fixture-2a-nul.json      <dir>/fixture-2a-nul.html
node orchestrate/tools/build-smoke-page.mjs <dir>/fixture-2b-dangling.json <dir>/fixture-2b-dangling.html
```

Fixture 2b is the same base sidecar with one step's `do` text changed to
`"Before this, redo the setup from Section 5."`, in a sidecar that has sections 1 and 2 only.

## Exit codes

`1` and `1`.

## Output

```
=== B06-step2 U+0000 in a copyable command (fixture-2a-nul.json) ===
exit: 1
stderr tail: .../fixture-2a-nul.json: sidecar.gate.commands[1] carries control character
U+0000; only tab and newline are allowed, because an invisible character makes a published
command a SyntaxError
stdout     : (empty)
html written: false

=== B06-step2 Section 5 with no section 5 (fixture-2b-dangling.json) ===
exit: 1
stderr tail: .../fixture-2b-dangling.json: "Section 5" refers to a section this sidecar does
not contain
stdout     : (empty)
html written: false
```

Both rejected. The first message names the exact path into the sidecar
(`sidecar.gate.commands[1]`) and the code point; the second names the dangling reference.
Neither wrote a page.

## Live control

Two ways round, both from the same run:

1. The positive control `B06-step3` — an otherwise identical sidecar carrying real tabs and
   real newlines inside step text — was ACCEPTED (exit 0, page written). So the control-
   character rule is rejecting U+0000 specifically, not rejecting whitespace or rejecting
   everything.
2. That same accepted sidecar carries the cross-references `Section 1` and `Step 2`, both of
   which resolve, and was accepted. So the dangling-reference scanner discriminates between a
   reference that resolves and one that does not, rather than rejecting the word "Section".

## Verdict

PASS — both sidecars are rejected with exit 1 and a message naming the defect, and the
U+0000 was verified present in the fixture on disk before the builder saw it.
