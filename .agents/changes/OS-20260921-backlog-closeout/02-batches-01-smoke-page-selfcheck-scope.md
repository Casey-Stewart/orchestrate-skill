# B01 — Scope the smoke-page self-check to the template (fix, M, —)

**Branch**: `fix/smoke-page-selfcheck-scope` (cut from the integration tip when the wave opens)
**Wave**: 1
**Depends on**: none
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files** (the fence — modify NOTHING else): `orchestrate/tools/build-smoke-page.mjs`, `orchestrate/references/smoke-page.md`, `tests/build-smoke-page.test.cjs`, `tests/smoke-page.test.cjs`
**Spec**: [01-plan.md](01-plan.md) §B01 · **Reviewer pass required**

## Implementation notes

BACKLOG.md BL-022, verbatim:

> `orchestrate/references/smoke-page.md` carries its own self-check — grep the filled page
> for `{{`, zero hits — with no code-span exemption. Same class as the closed BL-010 but a
> different consumer: this one is enforced by the builder rather than read by a human, so a
> smoke step whose Do command quotes `{{` cannot be published. May be correct as-is; needs a
> decision rather than a reflex.

**The entry is right about the defect and wrong about the fix shape** — re-verified against
the source at scaffold time, per this repository's own guardrail that a backlog entry is a
pointer, not a specification.

`buildSmokePage` (`orchestrate/tools/build-smoke-page.mjs`, lines 21-33):

- The `template.replace` call substitutes slot values taken from `renderSlots(data)` —
  that is USER CONTENT (step titles, Do commands, Expect text).
- Its callback already throws for a well-formed slot the sidecar cannot fill.
- The next line scans the FILLED output for a residual open brace pair, content included.

So the only defect that residual scan can still catch is a malformed slot the `[A-Z_]+`
regex did not match — a lowercase name, a spaced name, a hyphenated name — and those exist
only in the TEMPLATE. Meanwhile any step command carrying a GitHub Actions expression, a
Handlebars/Jinja expression, or a Vue binding aborts the build with a message that blames
an "unfilled" slot.

Scope the residual scan to the template rather than the output. Keep the thrown message
accurate: it currently says an unfilled slot survived the fill, which after this change
describes a template defect, not a fill failure.

`orchestrate/references/smoke-page.md` documents the check in the same terms, in the
paragraph beginning **Self-check before publishing** (around line 135). Update it to state
what is actually enforced. Do NOT restate or relocate the post-render proofing pass in the
paragraph beginning **Proof the published artifact** — B02 owns wiring that in, and this
batch must leave its text byte-identical.

**A test pins the DEFECT — found at pre-flight, and the plan's earlier claim that nothing
pinned this was wrong.** `tests/build-smoke-page.test.cjs:54` reads
`assert.equal(build().includes('{{'), false);` — an assertion over the filled OUTPUT that
encodes the old, wrong meaning of correct. It will redden when the fix lands. This is the
repository's named "a test that pins the defect" class: change it deliberately, and say
in the commit message what its new meaning is. Do not simply delete it — the template-side
claim it was reaching for is still worth holding.

**Two further consumers inside the fence.** `tests/smoke-page.test.cjs` imports
`buildSmokePage` and is the suite's only DOM harness (it can read `textContent`), which is
what makes the "reaches the reader" criterion below settleable; it also already carries a
doubled-brace token as content. `orchestrate/tools/build-smoke-page.mjs:369` prints
`0 unfilled slots` on success — after this change the builder no longer inspects the
output, so that message becomes a claim nothing verifies unless it is corrected too.

**Seam, declared not discovered.** The BL-026 default-human contradiction sweep lives in
`tests/protocol-contract.test.cjs`, which is in **B02's** fence, and it sweeps every
shipped skill file including the `smoke-page.md` this batch edits. If your wording trips
it, STOP with `NEEDS_FENCE` — do not edit B02's test file.

## Checklist

- [x] Scope the residual open-brace scan in `buildSmokePage` to the template, not the filled output
- [x] Correct the thrown message so it names a template defect rather than a fill failure
- [x] Correct the `0 unfilled slots` success message so it claims only what is now checked
- [x] Update the self-check paragraph in `smoke-page.md` to describe what is enforced
- [x] Update the hand-patch instruction near `smoke-page.md:132`, which tells a human to run
      the self-check over the FILLED file — the human-facing half of the same defect
- [x] Re-aim the stale pin at `tests/build-smoke-page.test.cjs:54` at the template
- [x] Add a test: a sidecar whose step content contains a doubled-brace expression builds successfully
- [x] Add a test: the built HTML delivers that text to the reader (DOM harness in `tests/smoke-page.test.cjs`)
- [x] Add a test: a template carrying a malformed slot still throws
- [x] Add a test: a template slot the sidecar cannot fill still throws (currently unpinned)
- [x] Confirm each new test fails against the unmodified base — all but `a template slot the
      sidecar cannot fill aborts the build`, which pins behaviour this batch does not change
      and is armed by mutation instead — and record the output under Base-failure evidence
- [x] polish: P1 — replace the vacuous `assert.equal(steps.length, EXPRESSIONS.length)` at
      `tests/build-smoke-page.test.cjs:81`, and the half of its comment that claims it reddens,
      with a subject observed on the BUILT page
- [x] polish: P2 — assert the re-aimed family covers what the old output-side line caught: the
      published page, outside the filled slot values, carries no `{{` at all (mutant M-G, a
      literal `{{ leaked ` injected into the body; re-run below with a working anchor)
- [x] polish: R2 — arm the malformed-slot sweep with the production shape
      (`slot.replace(/\{\{[A-Z_]+\}\}/g, '').includes('{{')`), not an anchored pattern
- [x] polish: R3 — give the hand-patch check in `smoke-page.md` a literal command to run rather
      than a prose description of one
- [x] polish: R4 — correct the base-failure checklist item to name the one test that pins
      pre-existing behaviour and say how it was armed
- [x] polish: R5 — record the base-failure and mutation output in this batch file
- [x] polish: R6 — pin the CLI success line, or record accepting it as-is

## Base-failure evidence

Base `425b3d7`, builder restored by SHA-256 afterwards.
`node --test --test-reporter=spec tests/build-smoke-page.test.cjs tests/smoke-page.test.cjs`
against the unmodified builder — tests 67, pass 64, fail 3:

```text
not ok 2 - step content carrying a doubled-brace expression publishes unchanged
  error: 'self-check failed: an unfilled `{{` survived the fill'
not ok 3 - a template slot name the fill cannot match aborts the build
  error: operator: 'deepStrictEqual'   (base throws the old fill-failure message instead)
not ok 39 - a step command carrying a doubled-brace expression reaches the reader
  error: 'self-check failed: an unfilled `{{` survived the fill'
```

`a template slot the sidecar cannot fill aborts the build` passes on base, because the branch
it pins is unchanged by this batch. Armed by mutation instead — replacing that `throw` with
`return ""` in the FIXED builder gives `not ok 4 - a template slot the sidecar cannot fill
aborts the build`, `# pass 36 # fail 1`, so it is the only guard on that branch and it is live.

Polish P2, live controls for the output-side assertion. **Mutant M-G as reported is a no-op**:
the shipped template has no `<body` tag (`grep -c "<body" orchestrate/references/smoke-page-template.html`
prints `0`), so `out.replace("<body", ...)` changes nothing and its green run measured nothing.
Re-run against `<main`, which the template does have: `not ok 1 - every template slot is filled,
and the builder fills no slot the template lacks`, `# pass 36 # fail 1` — caught by this
assertion alone. The near-miss too: a stray `{{` inside `sidecarStamp` gives `# pass 33 # fail 4`,
this assertion among them, where on base only the fingerprint/reissue tests reacted.

## Acceptance criteria

- A page whose step Do command contains a GitHub Actions expression builds, and the text
  reaches the reader — asserted through the DOM harness, not only as bytes.
- A template containing a lowercase or spaced slot name still aborts the build.
- A template slot the sidecar cannot fill still aborts the build, now with a test.
- No message the builder prints or throws claims a check it no longer performs.
- `smoke-page.md` makes no claim the builder does not enforce, in either the builder-facing
  or the hand-patch paragraph.
- The post-render proofing pass text in `smoke-page.md` is byte-identical to base.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
you report DONE.

## Smoke steps (C1)

- **Runner: agent** — build a page from a sidecar whose step command contains a
  doubled-brace expression; expect exit 0 and the literal text present in the output HTML.
- **Runner: agent** — build from a template containing a malformed slot name; expect a
  non-zero exit naming a template defect.
