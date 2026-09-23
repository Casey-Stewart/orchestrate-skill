# B02 — Shared ledger parser and `check-ledger.mjs` (feature, —)

**Branch**: `feat/ledger-parser`
Cut from the integration tip when the wave opens.
**Wave**: 2 · **Weight**: M
**Depends on**: B01
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files**: `orchestrate/tools/ledger-parse.mjs`, `orchestrate/tools/check-ledger.mjs`, `orchestrate/tools/check-fence.mjs`, `tests/check-ledger.test.cjs`, `tests/protocol-contract.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: a hand-rolled parse more permissive than the real consumer (the parse check must be at least as strict as `check-fence.mjs` on every shape the fence reads) · a defect fixed in the reported instance and left in its sibling (one parser, no private copies) · a guard that SAMPLES its domain (bind the one-parser rule to the tools directory listing) · a guard whose verdict depends on the checkout (CRLF/LF equivalence of the hash, asserted) · a branch no input reaches
**Spec**: [01-plan.md](01-plan.md) §B02 · **Gate**: fence check → reviewer + test-hunter

## Implementation notes

**Source specification** (Features.md, verbatim):

> Build rule 3 — **One parser.** Every ledger writer and checker uses `check-fence.mjs`'s
> table and Files-line parsers. A writer refuses any row that parser cannot read.
>
> #2 — The scaffold runs the fence tool's parsers over the freshly written ledger.
> **Evidence:** The tool already returns UNKNOWN on a missing `**Files**: ` line. R3's stale
> Files lines would have been caught at the first batch if the check had run.
>
> Build rule 4 — **Pin tools by hash in the contract, never by copying them into each
> ledger.** On a hash mismatch: stop and ask, then either record an explicit upgrade or
> use the manual procedure.

**User decision (2026-09-23, interview)**: other repos find the tools through ONE contract
placeholder for the skill's directory plus a SHA-256 hash (build rule 4). This batch builds
the hash command; B03 puts the pin into the contract template and the boot sequence.
The pin covers the whole skill directory (`SKILL.md`, `references/`, `templates/`,
`tools/`), not `tools/` alone, because B04's renderer reads its prompt skeletons from
`references/` — a tools-only hash would let rendered prompts change silently.

### 1 — Extract the parsers: `orchestrate/tools/ledger-parse.mjs`

Move these module-private functions out of `orchestrate/tools/check-fence.mjs` UNCHANGED
and export them: `linesOf` (:7), `exactPaths` (:8-18), `table` (:19-36), `oneRow` (:37-43),
`branchCell` (:44-48), `records` (:49-61, the fence-extension grammar) and `extensions`
(:62-79). `check-fence.mjs` then imports them from `./ledger-parse.mjs`.
`validateBatchEdit` and `checkFence` stay in `check-fence.mjs`. The move must be
behaviour-preserving: `tests/check-fence.test.cjs` passes UNCHANGED (it is outside this
fence on purpose), and `node orchestrate/tools/check-fence.mjs --help` prints the same bytes
as before. `tests/support/git-fixture.cjs:90-91` runs tools straight from
`orchestrate/tools/`, so relative imports resolve in the fixtures too.

### 2 — `orchestrate/tools/check-ledger.mjs`

Same CLI conventions as `check-fence.mjs`: `parseFlags` from `git-evidence.mjs:359`, a
`--help` that exits 0, exit codes `0` OK/MATCH · `1` FAIL/MISMATCH · `2` UNKNOWN (usage,
unreadable input). Exactly ONE line on stdout in every case.

**`parse --dir <ledger-dir>`** — reads `01-plan.md`, `PROGRESS.md` and every
`02-batches-*.md` in that directory from the working tree (it runs at scaffold time,
before the commit). Using ONLY `ledger-parse.mjs`, it checks:

1. The plan's batch table (`#`, `Branch`, `Files (fence)`) parses (`table` + `oneRow`
   rules: unique, well-formed `Bnn` ids) and every `Files (fence)` cell parses with
   `exactPaths`; every Branch cell parses with `branchCell`.
2. PROGRESS's batch table (`#`, `Branch`, `Notes`) parses; its id set equals the plan's;
   each row's branch equals the plan's; every Notes cell's fence-extension records parse.
3. For every plan id `Bnn` there is exactly one batch file `02-batches-<nn>-*.md` and no
   batch file without a plan row; its title matches `^# Bnn (?:—|-) `; it has exactly ONE
   line starting `**Branch**: ` and it EQUALS `` **Branch**: `<plan branch>` `` (the exact
   form `check-fence.mjs:191-192` demands — anything after the closing backtick fails);
   exactly ONE line starting `**Files**: ` whose `exactPaths` equal the plan's fence in
   order; exactly one `## Checklist` line followed later by another `## ` heading.

Output `PARSE OK <n> batches` · `PARSE FAIL <k> problem(s): <file>:<line> <message>; …` (at
most 10, then `(+k more)`) · `UNKNOWN <reason>`.

**`skill --dir <skill-dir>` / `skill --contract <00-READBEFORE.md>` / both** — the pin.
Hash: walk the directory recursively; every regular file (follow `stat`; anything else →
UNKNOWN) EXCEPT the operating-system litter this repository's `.gitignore` already names —
`.DS_Store`, `Thumbs.db`, `desktop.ini`, matched case-insensitively at any depth — because
the recommended install is a junction into a clone that may sit under a synced folder, and
one stray OS file would otherwise stop a ledger with a false MISMATCH; sort by relative
path with `/` separators, ascending by code unit; SHA-256 over, per file, `<relpath>` +
`\0` + the bytes with every CRLF pair replaced by LF + `\0`.
With `--dir` alone print `SKILL <64 lowercase hex> <n> files`. With `--contract`, read
exactly one contract line matching (after CRLF→LF)
`` ^\*\*Skill\*\*: `(?<dir>[^`]+)` · sha256 `(?<hex>[0-9a-f]{64})`$ `` — the separator is
space, U+00B7 MIDDLE DOT, space — hash `--dir` if given, else the line's dir, and print
`SKILL MATCH <hex>` or `SKILL MISMATCH pinned <hex> actual <hex>`. Missing, duplicated or
malformed line → UNKNOWN. B03 writes this exact line form into the contract template;
it is fixed here so both batches agree. The line parser is exported from
`ledger-parse.mjs` as `skillPin(contractText)` → `{ dir, hex }` (throws on a missing,
duplicated or malformed line), because B04's prompt renderer reads the same line — one
parser, per build rule 3.

### Codebase facts gathered at planning

- `check-fence.mjs:189-192` is the strictness bar: title regex, exact Branch line, exactly
  one Files line equal to the plan fence. `validateBatchEdit` (:80-110) requires a unique
  `## Checklist` followed by a later `## ` heading.
- `tests/protocol-contract.test.cjs:388-393` pins `NON_MARKDOWN`, which B01 grew to 6
  entries. Add `orchestrate/tools/check-ledger.mjs` and `orchestrate/tools/ledger-parse.mjs`
  in sorted position; the length pin becomes 8.
- `tests/protocol-contract.test.cjs:230-269` builds authority tables from the REAL templates'
  example rows and runs the REAL `check-fence.mjs` over them — reuse that approach to build
  PARSE OK fixtures from `orchestrate/templates/` rather than hand-writing ledgers.
- Shipped-file sweeps apply to both new tools: `tests/protocol-contract.test.cjs:408` treats
  any shipped file containing the phrase `grep the new` as a scaffold self-check carrier
  with pinned paragraph bounds, so keep that phrase out of code comments;
  `tests/interview-sizing.test.cjs` and the invisible-character sweep in
  `tests/build-smoke-page.test.cjs` also cover every file under `orchestrate/`.
- The archived `OS-20260921-backlog-closeout` ledger was scaffolded from a stale template,
  and pre-flight re-checked what that means for `parse`: its `01-plan.md:28` batch-table
  header is lower-case (`branch`, `files (the fence)`) and its `PROGRESS.md` holds two
  `#`/`Branch`/`Notes` tables (:46, :55), so `parse` fails on the tables before it ever
  compares a Branch line (whose ` (cut from …)` suffix would also fail). It is a real corpus
  sample for a live FAIL control — assert the failure it actually produces, re-verified at
  implementation time. Read `.agents/archive/**` only; never write there.
- Module-level vs local names: `git-evidence.mjs:74` and `:186` and `check-fence.mjs:127`
  declare LOCAL `const records` variables. The one-parser rule is about MODULE-LEVEL
  declarations (a top-level `function` or top-level `const`/`let` binding of the name);
  those three locals are legitimate and must not trip the sweep.
- `tests/support/git-fixture.cjs:90-95` `cli()` JSON-parses stdout; spawn the one-line
  `check-ledger.mjs` directly with `spawnSync(process.execPath, […])` instead.

### Tests — `tests/check-ledger.test.cjs`

- PARSE OK on a ledger built from the real templates (example rows lifted as in
  `protocol-contract.test.cjs:230-269`).
- One FAIL case per check in §2 — stale Files line, extra text after the Branch backtick,
  duplicate Files line, missing batch file, orphan batch file, plan/PROGRESS id mismatch,
  malformed `Bnn`, missing `## Checklist`, malformed fence extension — each asserting the
  file and line it names (read the FIRST line alone).
- **Parity with the fence**: for each malformed variant the fence tool can see, commit it in
  a `tests/support/git-fixture.cjs` repository and assert `check-fence.mjs` reports it —
  as `authority`, `batch-linkage`, `batch-structure` (a missing Checklist,
  `check-fence.mjs:85`, `:194`) or `batch-baseline` (a missing batch file, `:182`) — AND
  `parse` returns FAIL: the parse check may be stricter than the fence, never looser.
- Live corpus control: `parse` over the archived `OS-20260921-backlog-closeout` directory
  FAILS, asserting the problem it actually reports (see the facts above).
- **One parser, as a domain property**: no file under `orchestrate/tools/` other than
  `ledger-parse.mjs` defines `table`, `exactPaths`, `oneRow`, `branchCell`, `records`,
  `extensions` or `skillPin` — iterate the directory listing, never a hand list — and `check-fence.mjs`
  imports them from `./ledger-parse.mjs`. Arm it with a live control (a temp dir holding a
  file that redefines `table` must be reported).
- Hash: deterministic across runs; identical for CRLF and LF copies of the same tree
  (asserted); changes when a byte, a file name, or the file set changes; unchanged when a
  `Thumbs.db`, `.DS_Store` or `desktop.ini` (any case, any depth) is added; recursion reaches
  depth ≥ 2; MATCH / MISMATCH / missing line / duplicate line / malformed line; a pinned
  directory containing a space is read correctly.
- Flags and `--help`, one-line stdout in every case.

## Checklist

- [ ] `orchestrate/tools/ledger-parse.mjs` exporting the seven parsers, moved unchanged from `check-fence.mjs`, plus `skillPin`
- [ ] `orchestrate/tools/check-fence.mjs` imports them; `tests/check-fence.test.cjs` green unchanged; `--help` bytes unchanged
- [ ] `orchestrate/tools/check-ledger.mjs parse --dir` with the three check groups, one-line output, exit 0/1/2
- [ ] `orchestrate/tools/check-ledger.mjs skill` hash and `--contract` pin check, with the exact line form above
- [ ] `tests/check-ledger.test.cjs`: OK fixture from the real templates, one case per check, fence parity, live corpus control, one-parser domain property with a live control, hash properties
- [ ] `tests/protocol-contract.test.cjs`: register both new tools in `NON_MARKDOWN`; length pin 8

## Acceptance criteria

- `check-fence.mjs` no longer defines any of the seven parsers and behaves identically: its
  test file passes unchanged and its `--help` bytes are unchanged.
- Every malformed ledger variant for which the fence tool reports an authority or
  batch-linkage failure is a `PARSE FAIL`; a ledger built from the real templates is
  `PARSE OK`.
- The skill hash is identical for CRLF and LF checkouts of the same content and differs on
  any content, name or membership change.
- `skill --contract` accepts exactly the documented line form and nothing looser.
- Operating-system litter files never change the hash; every other file does.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

**You need**: issued inputs `I-03` and `I-04`.

3. **Do**: From the integration worktree root, run `node orchestrate/tools/check-ledger.mjs
   parse --dir .agents/changes/OS-20260923-mechanical-tools`.
   **Pass**: one line, `PARSE OK 5 batches`; exit code 0.
   **Runner**: agent (CLI).
4. **Do**: Run the same command with `--dir` pointing at the issued copy `I-03`.
   **Pass**: one line beginning `PARSE FAIL` that names `02-batches-02-ledger-parser.md` and
   its Files line; exit code 1.
   **Runner**: agent (CLI).
5. **Do**: Run `node orchestrate/tools/check-ledger.mjs skill --dir orchestrate` twice, then
   once more adding `--contract <I-04>`.
   **Pass**: the first two lines are identical and read `SKILL <hash> <count> files`; the
   third reads `SKILL MISMATCH pinned … actual …` with the same actual hash, exit code 1.
   **Runner**: agent (CLI).
