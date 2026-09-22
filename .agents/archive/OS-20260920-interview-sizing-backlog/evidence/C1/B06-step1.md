# C1 / B06-step1 — a gate with no containment check is rejected

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## How the fixtures were built

All four B06 fixtures come from one driver script,
`C:\Users\fatbo\AppData\Local\Temp\qa-c1-20260921-smoke\run.mjs`, written as a file and run with
`node`. Nothing passes through a shell: no heredoc, no quoting, no escape sequence composed on
a command line. This is deliberate — this change's own history records a heredoc collapsing
`\n`, an editor decoding `\uXXXX` into control bytes, and the Bash tool collapsing `\b` inside
a `new RegExp`. The fixture objects are built in memory and serialised with
`JSON.stringify`.

The sidecar shape follows `tests/build-smoke-page.test.cjs:31`, with this repository's real
HEAD `66732c625ef55d18fd1d1df98d7b814f5e7725e4` as `buildSha`.

## Command

```
node C:/Users/fatbo/AppData/Local/Temp/qa-c1-20260921-smoke/run.mjs
# which runs, for this fixture:
node orchestrate/tools/build-smoke-page.mjs <dir>/fixture-1-no-containment.json <dir>/fixture-1-no-containment.html
```

The fixture's gate carries commands and a check, but no containment proof — the shape the
contract says every run waived by hand:

```
gate: {
  intro:    "Prove the build first.",
  commands: ["git switch chore/interview-sizing-backlog-ledger", "git log -1"],
  checks:   ["Confirm by eye that HEAD looks like the build under test."]
}
```

## Exit code

`1`

## Output

```
=== B06-step1 gate without containment (fixture-1-no-containment.json) ===
exit: 1
stderr tail: .../fixture-1-no-containment.json: the step-0 gate has no containment check:
gate.commands must run `git merge-base --is-ancestor <buildSha> HEAD` and
`git diff --name-only <buildSha>..HEAD` and the tested build `66732c6` itself
stdout     : (empty)
html written: false
```

The builder rejects it, names all three missing checks by name, and writes no HTML.

## Live control

The rejection is meaningful only because the SAME driver, the same builder invocation and an
otherwise identical sidecar are accepted when the containment commands are present — that is
`B06-step3`, which exited `0` and wrote a 51733-byte page in the same run. So exit `1` here is
caused by the missing containment check alone, not by a broken fixture, a bad path or a
builder that rejects everything.

## Verdict

PASS — the builder rejects a sidecar whose step-0 gate carries no containment check, exits 1,
names each missing check, and leaves no page behind.
