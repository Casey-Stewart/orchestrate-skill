# C1 / B06-step3 — the positive control: a well-formed sidecar builds

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

This is the control that makes the three rejections in `B06-step1.md` and `B06-step2.md` mean
something. It was run, in the same driver, against the same builder binary.

## The fixture

The same base sidecar as the rejections, carrying:

- a step-0 gate WITH the containment proof, naming this build's own SHA:

```
commands: [
  "git switch chore/interview-sizing-backlog-ledger",
  "git merge-base --is-ancestor 66732c625ef55d18fd1d1df98d7b814f5e7725e4 HEAD",
  "git diff --name-only 66732c625ef55d18fd1d1df98d7b814f5e7725e4..HEAD -- . \":(exclude).agents/\""
]
```

- a real TAB and a real NEWLINE inside a step's `do` text:
  `"Run the block, which contains a tab\tand a newline:\ngit status --porcelain"`
  (built in-process, not through a shell);
- only RESOLVING cross-references: `Section 1` and `Step 2`, in a sidecar holding sections 1-2
  and steps 1-3.

## Command

```
node orchestrate/tools/build-smoke-page.mjs <dir>/fixture-3-good.json <dir>/fixture-3-good.html
```

## Exit code

`0`

## Output

```
=== B06-step3 positive control (fixture-3-good.json) ===
exit: 0
stderr tail: (empty)
stdout     : C:/Users/.../fixture-3-good.html: 51646 bytes, 0 unfilled slots
html written: true (51733 bytes)
```

The page was then inspected on disk:

```
unfilled {{ slots: 0
sidecar fingerprint stamp present: true
tab-carrying step text present: true
Section 1 cross-ref rendered: true
merge-base gate command in page: true
last line: <!-- smoke-sidecar-sha256:c05269f109fc26afbadc58d105e11a95129c9ed5d0f38d32bf765532a3ee0876 -->
```

So the page really built: every `{{...}}` slot filled, the tab/newline step text carried
through, the resolving cross-reference rendered, the full containment command present in the
page the tester would receive, and the sidecar fingerprint appended.

## Live control

This step IS the control for B06-step1 and B06-step2. Its own non-vacuity is shown by the
three rejections: the same builder, driven by the same script in the same invocation, exits 1
on a missing containment check, on a U+0000 and on a dangling `Section 5`. A builder that
accepted everything would have written four pages; it wrote one.

## Verdict

PASS — a well-formed sidecar with a containment check, tabs and newlines, and only resolving
cross-references is accepted (exit 0) and the page builds with zero unfilled slots.
