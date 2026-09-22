# C1 / B05-step2 — the evidence tool's published surface did not change

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## Commands

Run from the repo root; the base copy is extracted into a throwaway directory under the
system temp (`.../qa-c1-20260921-help`), never into the checkout:

```
git show efc4eec:orchestrate/tools/git-evidence.mjs > "$TMP2/git-evidence.mjs"
node "$TMP2/git-evidence.mjs" --help > "$TMP2/base-help.txt"
node orchestrate/tools/git-evidence.mjs --help > "$TMP2/head-help.txt"
cmp "$TMP2/base-help.txt" "$TMP2/head-help.txt"
sha256sum "$TMP2/base-help.txt" "$TMP2/head-help.txt"
grep -c "^node orchestrate/tools/" orchestrate/references/protocol.md
```

## Exit codes

`--help` at base: `0`. `--help` at HEAD: `0`. `cmp`: `0`. `grep -c`: `0`.

## Output

```
BASE_HELP_EXIT=0
HEAD_HELP_EXIT=0
IDENTICAL (cmp exit 0)
f352a32c0d49dc603db7777968ff2f783db95e96a5f99360b24e54b12dfd3758 *base-help.txt
f352a32c0d49dc603db7777968ff2f783db95e96a5f99360b24e54b12dfd3758 *head-help.txt
 557 base-help.txt
 557 head-help.txt
```

Byte-identical, same length, same SHA-256. The text itself:

```
git-evidence.mjs <discovery|worktrees|ancestry|shipment|ledger> --repo <repo>
ancestry: --ancestor <ref-or-sha> --descendant <ref-or-sha>
shipment: --integration <full-ref> --source <local|remote> [--remote <name>] --ref <full-ref>
ledger: --ref <full-ref> --ledger <id> [--owner <ref-or-sha>] [--target <ref-or-sha>]
Exit 0: complete facts (including not-contained); exit 2: partial/unknown or invalid invocation.
A path resolving to a clean/process filter attribute, or a submodule, makes worktree cleanliness
UNKNOWN; unsafe status commands are not run.
```

Five subcommands, unchanged. No `failProbe` / `fail-probe` spelling appears anywhere — the
B05 seam is an options key only, which the suite also pins (`✔ the probe seam can only refuse,
and no published invocation reaches it`).

The seven published recipes in `orchestrate/references/protocol.md`:

```
7
150:node orchestrate/tools/git-evidence.mjs discovery --repo <repo>
151:node orchestrate/tools/git-evidence.mjs worktrees --repo <repo>
152:node orchestrate/tools/git-evidence.mjs ancestry --repo <repo> --ancestor <ref-or-sha> --descendant <ref-or-sha>
153:node orchestrate/tools/git-evidence.mjs shipment --repo <repo> --integration <full-ref> --source local --ref <full-shipment-ref>
154:node orchestrate/tools/git-evidence.mjs shipment --repo <repo> --integration <full-ref> --source remote --remote <name> --ref <full-shipment-ref>
155:node orchestrate/tools/git-evidence.mjs ledger --repo <repo> --ref <full-ref> --ledger <id> --owner <ref-or-sha> --target <ref-or-sha>
156:node orchestrate/tools/check-fence.mjs --repo <repo> --integration <full-ref> --batch <full-ref> --ledger <id> --batch-id <Bnn> --batch-file <repo-relative-path>
```

Seven at HEAD and seven at `efc4eec` — the count did not move.

## Live controls — both negatives are proven

**The implementation really did change**, so "identical `--help`" is a statement about the
published surface and not about an unchanged file:

```
git diff efc4eec..HEAD --numstat -- orchestrate/tools/git-evidence.mjs
36	11	orchestrate/tools/git-evidence.mjs
```

47 lines moved inside the tool while its `--help` stayed byte-identical. That is exactly the
claim being made.

**`cmp` can report a difference.** The HEAD help was copied, one line appended
(`probe: --failProbe <name>` — the flag this step exists to rule out), and re-compared:

```
CONTROL cmp exit=1
cmp: EOF on base-help.txt after byte 557, line 6
```

So the `cmp` exit `0` above is a real match, not a comparison that never fires.

**The recipe counter increments.** `protocol.md` was copied to the throwaway directory with
one synthetic recipe line appended:

```
CONTROL count with one synthetic recipe appended: 8
```

The counter reports 8 the moment an eighth recipe exists, so 7 is a measurement rather than a
constant. (Counting the same pattern in `00-READBEFORE.md`, `SKILL.md`, `scaffolding.md` and
`README.md` returns 0 in each, confirming the anchor `^node orchestrate/tools/` is specific to
the recipe block and is not matching prose mentions.) Both throwaway control files were
deleted immediately after.

## Verdict

PASS — `node orchestrate/tools/git-evidence.mjs --help` is byte-identical to the ledger base
`efc4eec` (same 557 bytes, same SHA-256), `protocol.md` still publishes exactly seven
`node orchestrate/tools/` recipes, and no CLI subcommand or flag was added.
