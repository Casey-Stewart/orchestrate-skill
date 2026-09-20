# Step 7 — BL-004 forms and the escape whitelist (re-run)

Read from the same recipe run as steps 2 and 8 (exit 0, 260/0).

## The three forms BL-004 names

BL-004's verbatim text is NOT in the smoke page; it is in
`.agents/changes/OS-20260919-backlog-sweep/01-plan.md:102-109`. It names: a trailing colon
at end of value (`description: Runs the steps:`), an unterminated quote, and
`description: a "b: c" d`. Each appears as its own passing case:

| BL-004 form | Test name in output | Result |
| --- | --- | --- |
| trailing colon | ``the frontmatter validator rejects `description: Runs the steps:` `` | PASS |
| unterminated quote | ``the frontmatter validator rejects `description: "unterminated` `` | PASS |
| `a "b: c" d` | ``the frontmatter validator rejects `description: a "b: c" d` `` | PASS |

## The quoted-colon accept case

```
✔ the frontmatter validator accepts `description: "Runs the steps: quickly"` (0.2602ms)
```
Present and passing — so the guard was narrowed, not simply tightened into rejecting
everything.

## The whitelist sweep

```
✔ the escape whitelist admits exactly the characters YAML defines (0.3661ms)
```

Surrounding case table is 15 accept cases and 20 reject cases, all green, including the
`\x4` / `\u12` / `\U00110000` boundary rejects and the `\U0010FFFF` accept.

## Verdict

PASS — all three BL-004 forms appear as their own passing reject cases, the quoted-colon accept case is present, and the whitelist sweep is green.
