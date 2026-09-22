# Step 1 — BL-003: the helper works on a stock Windows install (re-run)

## Command 1

```
git config --system --name-only --get-regexp "^filter\..*\.(clean|process)$"
```
**Exit 0.** Output:
```
filter.lfs.clean
filter.lfs.process
```
Both names the step asks for are present. `git lfs install` was NOT run. The aside's
escape hatch (first command returns nothing => say so rather than recording a pass) did
not apply: a real LFS filter is configured system-wide, so the second command is
load-bearing.

## Command 2 — AS PUBLISHED

The page's second command is a `node -e "..."` one-liner. Run exactly as the page renders
it, it **does not execute**. Exit **1**:

```
[eval]:1
... const f=out.split('');if(f[f.length-1]==='')f.pop(); ...
SyntaxError: Invalid or unexpected token   (Expected ',', got 'string literal')
```

Two independent authoring defects in the published command:

1. **Literal U+0000 in the source.** `smoke-C1.json` encodes the split delimiter as the
   JSON escape `\u0000`, so the parsed string — and therefore the `<code>` block the
   reader copies — contains one real, invisible NUL character inside `out.split('')`.
   A NUL cannot survive a copy-paste into any shell (argv is NUL-terminated); terminals
   drop it, turning the call into `out.split('')`. Verified: the echoed `[eval]` source
   above shows the delimiter already gone.
2. **Literal newline inside a single-quoted JS string.** The JSON encodes
   `bad.join('\n')` with `\n` as a real newline escape, so the rendered command contains
   an actual line break inside `'...'`. That is an unterminated string literal and a hard
   `SyntaxError` — it aborts before any output, regardless of defect 1.

Defect 1 alone would be the more dangerous of the two if defect 2 were fixed: with the NUL
dropped, `split('')` splits the byte stream into single characters, so `paths inspected`
becomes a meaningless six-figure number. (It would at least fail loudly rather than pass
silently, because every single character also fails the `unspecified`/`unset` test.)

## Command 2 — REPAIRED (escapes written as `\0` and `\n`)

```
node -e "...out.split('\0')...bad.join('\n')..."
```
**Exit 0.** Output:
```
paths inspected: 375
paths resolving to a filter: 0
```

So the substantive claim is TRUE: 375 paths inspected, 0 resolving to a filter — exactly
BL-003's situation (a machine-wide filter driver that no file actually uses).

## Note on the aside's "pre-verified" claim

The aside reads "Runner: agent, pre-verified — 375 paths inspected, 0 resolving." The only
pre-verification in this directory is `step-03.md`, which ran the **raw pipeline**
(`git ls-files -z ... | git check-attr filter -z --stdin`), not this `node -e` summariser,
and reported **365 paths**, not 375. The summariser is new in this re-authoring and has
never been executed by anyone in the form published — it cannot be.

## Verdict

FAIL — the first command passes, but the published second command aborts with a SyntaxError and cannot be run as written; the underlying BL-003 claim is nonetheless true (375 inspected, 0 resolving) when the two escape defects are repaired, so this is a smoke-script defect, not a build defect.
