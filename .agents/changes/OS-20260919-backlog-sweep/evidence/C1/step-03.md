# Step 03 — The situation BL-003 describes is real on this machine

**Runner**: agent

## Command 1 — system-level filter config

```
git config --system --name-only --get-regexp "^filter\..*\.(clean|process)$"
```

**Exit code**: `0`

```
filter.lfs.clean
filter.lfs.process
```

Both names the script asks for are present. Nothing was installed or configured to make
this true — `git lfs install` was NOT run. This is the stock Git for Windows system
config, `git version 2.52.0.windows.1`. For context, the unfiltered system `filter.*`
list is:

```
filter.lfs.clean
filter.lfs.smudge
filter.lfs.process
filter.lfs.required
```

There is no `filter.*` in the global or local config (`git config --global/--local
--name-only --get-regexp '^filter\.'` both exit 1, no output), so the LFS filter reaching
the resolver comes from the **system** scope — which is precisely the scope every fixture
in the suite neutralises with `GIT_CONFIG_NOSYSTEM=1`.

## Command 2 — does any path actually resolve to a filter

```
git ls-files -z --cached --others --exclude-standard | git check-attr filter -z --stdin
```

**Exit code**: `0` (both ends of the pipe)
Output is NUL-separated `path, attr, value` triples; 41440 bytes, **365 paths examined**.
Tallied by value:

| value | count |
| --- | --- |
| `unspecified` | 347 |
| `unset` | 18 |
| anything else | **0** |

Every one of the 365 attribute names returned is `filter`. Filtering the value column for
anything that is not `unspecified` or `unset` returns nothing. So **no path resolves to a
filter**.

The 18 `unset` results are explicit `-filter` entries in the repo's tracked
`.gitattributes` (the `tests/fixtures/smoke-inputs/*` and `*/evidence/C*/inputs/**`
rules), not an accident of the helper.

## Pass conditions

| Condition | Observed | Met |
| --- | --- | --- |
| first command lists `filter.lfs.clean` and `filter.lfs.process` | both listed | yes |
| second returns only `unspecified` or `unset` | 347 + 18 = 365, nothing else | yes |
| step 1 passes anyway | step 1 = PASS, exit 0, no `unsafe-filter` | yes |

The Aside's failure case (first command returns nothing, meaning no LFS filter is
configured and step 1 proves less than it should) did **not** occur: the filter is
genuinely configured on this machine, so step 1's clean result is load-bearing.

## Verdict

PASS — a real LFS `clean`/`process` filter is configured system-wide on this machine while no path resolves to a filter, which is exactly BL-003's situation, and step 1 passed under it.
