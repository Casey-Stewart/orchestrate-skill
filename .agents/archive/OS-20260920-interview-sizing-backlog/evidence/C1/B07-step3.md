# C1 / B07-step3 — a checkpoint asks the user for a verdict, not for labour

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## Commands

```
grep -n -i "verdict, not" orchestrate/references/execution-models.md
grep -n -i -B4 -A4 "verdict, not for labour" orchestrate/references/execution-models.md
```

## Exit code

`0`

## Output

```
99:  user for a VERDICT, not for labour. A repo whose contract
```

In context, lines 95-100:

```
  live data, anything "touches your data" without a disposable environment — stay
  human; the enumeration narrows nothing. At the checkpoint
  close-out a QA runner performs the agent steps on the integration tip and records
  evidence; the user's hands are spent only on the human steps. A checkpoint asks the
  user for a VERDICT, not for labour. A repo whose contract
  forbids running the app has no agent steps — say so rather than pretend.
```

The sentence is present, in `orchestrate/references/execution-models.md` at lines 98-99. It
wraps across a line break between "the" and "user", which is why the grep anchor was chosen on
the second half; the `-B4 -A4` context confirms the whole sentence rather than a fragment.

The surrounding paragraph makes the same claim operationally — the QA runner performs the
agent steps and records evidence, and "the user's hands are spent only on the human steps" —
so the sentence is not an isolated assertion contradicted by its neighbours.

## Live control

This is a positive read: a broken grep produces a FAIL, not a false pass. Its non-vacuity is
shown by the grep being anchored on a phrase specific enough to return exactly one line
(`verdict, not` -> a single hit at line 99, not a pattern matching the whole file), and by the
`-B4 -A4` window being read to confirm the subject of the sentence is a CHECKPOINT asking the
USER. In addition, this very checkpoint is the rule's own demonstration: all eighteen C1 steps
are `Runner: agent`, and the user is asked only for a verdict on the evidence.

## Verdict

PASS — `orchestrate/references/execution-models.md` lines 98-99 state that a checkpoint asks
the user for a VERDICT, not for labour.
