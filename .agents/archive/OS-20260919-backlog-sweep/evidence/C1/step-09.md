# Step 09 — The YAML-invalid forms are rejected, and the whitelist is pinned both ways

**Runner**: agent

## Source of the results

The recipe output from run **A** (Section 5, executed verbatim, exit 0, 260/260). The
same lines are present in run **E**, the post-cleanup green run of step 8. Confirmed
against `tests/agent-definitions.test.cjs` in the working tree (reads only).

## The three BL-004 forms, each its own passing case

BL-004's verbatim text names: a trailing colon at end of value
(`description: Runs the steps:`), an unterminated quote, and `description: a "b: c" d`.
In the recipe output:

```
runA.log:16:✔ the frontmatter validator rejects `description: Runs the steps:` (0.919ms)
runA.log:17:✔ the frontmatter validator rejects `description: "unterminated` (0.113ms)
runA.log:18:✔ the frontmatter validator rejects `description: a "b: c" d` (0.1307ms)
```

Three separate `test()` invocations, three separate `✔` lines. In the source these are the
reject table's own rows, each pinned to a distinct reason regex — so a single over-broad
rule could not satisfy all three:

```js
{ line: 'description: Runs the steps:', reason: /ends its unquoted value with/ },
{ line: 'description: "unterminated',  reason: /never closes its opening/ },
{ line: 'description: a "b: c" d',     reason: /carries an unquoted/ },
```

## The quoted-colon accept case

```
runA.log:5:✔ the frontmatter validator accepts `description: "Runs the steps: quickly"` (0.2149ms)
```

Source, asserting the parsed value rather than merely "did not throw":

```js
{ line: 'description: "Runs the steps: quickly"',
  field: { key: 'description', value: '"Runs the steps: quickly"' } },
```

## Same validator as the real definitions

Not a parallel implementation. Each case is fed through `frontmatterFields()`, which is
what `definition()` calls for the four shipped files (`:118`, `:130`), via `:234` and
`:241`. The file says so at `:138`: the cases go "through the same `frontmatterFields()`
the four definitions go" through.

## The whitelist sweep

```
runA.log:37:✔ the escape whitelist admits exactly the characters YAML defines (0.8093ms)
```

Checked the script's description of it against `tests/agent-definitions.test.cjs:251-271`:

| Script claims | Source | Accurate |
| --- | --- | --- |
| all 95 printable ASCII characters | `for (let code = 0x20; code <= 0x7e; code++)` — 95 iterations — plus `assert.equal(swept, 95, 'the sweep must cover every printable ASCII character, not a sample')` | yes |
| the 18 YAML defines | `assert.equal(ESCAPE_MEMBERS.length, 18, …)`; evaluated from source the set is `["0","a","b","t","n","v","f","r","e"," ","\"","/","\\","N","_","L","P","\t"]` = 18 | yes |
| in both directions | `assert.equal(accepted, ESCAPE_MEMBERS.includes(c), …)` — equality, so every member must be accepted **and** every non-member must be rejected | yes |

One nuance the script's one-line summary compresses, noted for accuracy rather than as a
defect: TAB is one of the 18 but is `0x09`, outside the printable sweep, so 17 of the 18
are covered by the loop and TAB gets its own assertion immediately below at `:269`. The
test comments on exactly this itself. The set is still pinned both ways in full.

The sweep also guards its own probe construction — the `QQ` filler after the escape makes
`\x`, `\u` and `\U` fail for want of hex digits rather than by hitting the closing quote,
so those three are rejected for the right reason.

## Pass conditions

| Condition | Observed | Met |
| --- | --- | --- |
| the three BL-004 forms each appear as their own passing case | 3 distinct `✔` case tests, distinct reason regexes | yes |
| the quoted-colon accept case appears | `✔ … accepts \`description: "Runs the steps: quickly"\`` | yes |
| the whitelist sweep passes | `✔ the escape whitelist admits exactly the characters YAML defines` | yes |
| it checks 95 printable ASCII against 18 defines, both directions | verified in source, and self-asserted (`swept === 95`, `length === 18`) | yes |

## Verdict

PASS — all three BL-004 forms are rejected as separate cases with distinct reasons, the quoted colon is still accepted with its parsed value checked, and the whitelist sweep genuinely pins all 95 printable characters against the 18-member set in both directions.
