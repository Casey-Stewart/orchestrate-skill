# C1 / B07-step2 — the runner-classification rule, swept across every document that carries it

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## Command

A script FILE, not a `node -e` one-liner. A first attempt at this sweep as an inline
`node -e` was mangled by shell quoting and died on a `SyntaxError` — the same transport class
this checkpoint warns about — so the sweep was moved into
`C:\Users\fatbo\AppData\Local\Temp\qa-c1-20260921-runners\sweep.mjs` and run as a file:

```
node C:/Users/fatbo/AppData/Local/Temp/qa-c1-20260921-runners/sweep.mjs \
     C:/Users/fatbo/OneDrive/Desktop/Claude Testing/orchestrate-skill/orchestrate
```

It walks the whole skill source, collapses whitespace (so a rule wrapped across lines is one
match), extracts every `A step is human ONLY ... .` sentence, checks each of the five required
clauses independently, and separately hunts the retired unqualified form
(`/default(?:s)?(?: to)? human|human by default/gi`).

## Exit code

`0`

## Output — six occurrences across five documents, each with its rule

```
documents carrying the rule or a Runner mention: 8
total occurrences of the rule sentence: 6
```

**1. `orchestrate/references/execution-models.md`** — 1 occurrence, 5/5 clauses:

> A step is human ONLY when it needs something an agent on this machine cannot do: a device, a
> GUI, held credentials, a judgement about whether something looks right, or something the
> environment contract forbids an agent here to do.

**2. `orchestrate/references/protocol.md`** — 1 occurrence, 5/5 clauses, and it ties the
enumeration back to its own grounds rather than leaving them as exceptions:

> ... or something the environment contract forbids an agent here to do — the data and
> another-OS grounds above are that last kind, not exceptions to this rule.

**3. `orchestrate/references/scaffolding.md`** — 2 occurrences, 5/5 clauses each:

> [1] ... — the prohibitions just named are that last kind, not exceptions to this rule.
> [2] ... — the answers to this question are that last kind, not exceptions to it.

**4. `orchestrate/templates/00-READBEFORE.md`** — 1 occurrence, 5/5 clauses:

> ... — the data and another-OS grounds above are that last kind, not exceptions to this rule.

**5. `orchestrate/templates/02-batch.md`** — 1 occurrence, 5/5 clauses:

> ... — the live-data and another-OS grounds above are that last kind, not exceptions to this
> rule.

Five documents, six occurrences, exactly as the step predicts, with `scaffolding.md` carrying
it twice. Every one names all five grounds including "something the environment contract
forbids an agent here to do".

**Unqualified "default human": zero matches in every file swept.**

## The three other files that mention `Runner`

`references/smoke-page.md`, `references/subagent-prompts.md` and `SKILL.md` reference the
`Runner: agent` / `Runner: human` TAG but state no default rule of their own — they defer to
the five above. Checked by hand:

```
smoke-page.md:303      ... performs every step tagged `Runner: agent` on the integration tip
subagent-prompts.md:213 ... you never perform a `Runner: human` step
SKILL.md:180            ... classify ... each smoke step `Runner: agent | human`
```

None says "default human", so the five-document set is complete rather than a sample.

## Live control — both detectors fire

A control fixture in the throwaway directory carried (a) the retired unqualified form, (b) a
TRUNCATED rule naming only three of the five grounds, and (c) the complete rule WRAPPED across
four lines:

```
  rule occurrences        : 2
   [1] A step is human ONLY when it needs something an agent on this machine cannot do:
       a device, a GUI or held credentials.
       clauses present: 3/5  MISSING: a look-and-see judgement, something the environment
       contract forbids
   [2] A step is human ONLY when it needs ... or something the environment contract forbids
       an agent here to do.
       clauses present: 5/5  (all five)
  unqualified 'default human' matches: 1 -> ["default to human"]
```

Three things proven at once: the clause checker reports a shortfall when one exists (3/5), the
"default human" hunter returns a non-zero count when the phrase is present, and the collapsed
matcher finds a rule that spans four source lines. So the 5/5 results and the zero
"default human" count above are measurements, not a detector that never fires.

## Verdict

PASS — all six occurrences across the five documents state that a step is human ONLY when it
needs a device, a GUI, held credentials, a look-and-see judgement, **or something the
environment contract forbids an agent here to do**; none still says "default human"
unqualified, anywhere in the skill source.
