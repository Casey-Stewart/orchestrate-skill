# C1 / B02-step3 — the interview section and procedure step 7

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## Commands

```
sed -n '205,300p' orchestrate/references/scaffolding.md     # ## Interview section
sed -n '60,90p'   orchestrate/references/scaffolding.md     # procedure steps 6-9
grep -rn "procedure step 7" orchestrate/SKILL.md orchestrate/references/*.md
```

## Exit code

`0`

## Output — the three Pass conditions, each with its passage

**(a) Back-to-back calls stated as the DEFAULT** — `scaffolding.md`, heading at line 209 and
the rule at lines 278-280:

```
## Interview (back-to-back AskUserQuestion calls — confirmations + gaps only)
...
Back-to-back AskUserQuestion calls are the DEFAULT. Ask one question per decision that
can independently change the plan; four questions per call is the tool's schema cap on
`questions`, not a budget; issue as many calls as the open gaps need. Two decisions
never share one question.
```

The four-question figure is named as the tool's schema cap, explicitly "not a budget" — the
opposite of the retired "merged down to its 4-question cap" wording B02-step1 confirms is gone.

**(b) The compound-label ban carries a real example** — lines 282-285:

```
Never join two independent axes in one option LABEL — a `+` or an `and` in a label is
the smell. "Full recipe + agent-run smoke" reads as one choice and is two: the user who
wants the full recipe with human-run smoke has nothing to click, so the answer comes
back as free text or as the wrong pick. One axis per question, one axis per label.
```

The example is concrete (`"Full recipe + agent-run smoke"`), names the smell (`+` or `and` in a
label), and spells out the consequence — not a bare prohibition.

**(c) Step 7 names weights alongside plan, wave map, checkpoints and fold-ins** —
`scaffolding.md` lines 74-78:

```
7. **Approve** — present the computed wave map (which batches run concurrently, and
   why that is safe), the checkpoint placement (after which waves, with the hands-on
   batches named) per `execution-models.md`, and each batch's weight; the user approves
   plan, wave map, weights, checkpoints and fold-ins in ONE pass, confirming or
   adjusting; that approval is the standing authorization for the concurrency.
```

All five appear in one enumeration: plan, wave map, weights, checkpoints, fold-ins. The
interview section's back-reference agrees, at line 284:

```
all — and never ask what procedure step 7 will ask again (plan, wave map, weights,
checkpoints, fold-ins).
```

and the fold-in rule is stated twice more, at line 47 (`at PLAN APPROVAL — not a separate
interview round`) and line 297 (`Fold-in picks are NOT interview questions — they ride plan
approval (procedure step 7)`), so the two mirrors do not contradict each other.

## Live control

This step is a positive read — every condition is an assertion that something IS present, so a
broken instrument produces a FAIL, not a false pass. The passages above were read from the file
bytes with `sed` and quoted verbatim rather than paraphrased. As a cross-check that the section
boundaries were read correctly, `grep -rn "procedure step 7"` independently resolved the
back-references at lines 151, 284 and 297 to the same step 7 block at line 74.

## Verdict

PASS — back-to-back calls are the stated default with the 4-question figure explicitly
demoted to a schema cap; the compound-label ban carries a concrete example and its
consequence; and step 7 enumerates weights alongside plan, wave map, checkpoints and fold-ins.
