# Plan — OS-20260919-backlog-sweep

This change empties `BACKLOG.md`. Its six live entries were all filed at the close of
OS-20260919 and they share one shape: a mechanical guard in this repository that does not
guard what it claims to. A test whose `existsSync` is permanently false; a fence checker
that cannot read the ledger its own scaffolder produces; a safety probe that refuses on
every stock Windows install; three assertions that pass inputs they were written to
reject. The intended outcome is that each of those guards can actually fail, and that the
repository's own tooling works on the machine it is being developed on.

**Orchestration**: this change runs under [00-READBEFORE.md](00-READBEFORE.md) — that
file is the contract; this one only locks scope, waves, and checkpoints.

## Batch table

| # | Batch | Type | Weight | Branch | Wave | Files (fence) | Smoke | Version |
|---|-------|------|--------|--------|------|---------------|-------|---------|
| B01 | Agent-definition guards that can fail | fix | S | `fix/agent-definition-test-guards` | 1 | `tests/agent-definitions.test.cjs` | C1 | — |
| B02 | Batch-id grammar the fence can read | fix | M | `fix/ledger-batch-id-grammar` | 1 | `orchestrate/SKILL.md`, `orchestrate/references/scaffolding.md`, `orchestrate/templates/01-plan.md`, `orchestrate/templates/PROGRESS.md`, `tests/protocol-contract.test.cjs` | C1 (hands-on) | — |
| B03 | Resolved per-path filter attribute | fix | L | `fix/resolved-filter-attribute` | 1 | `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `orchestrate/tools/git-evidence.mjs`, `tests/check-fence.test.cjs`, `tests/git-contract.test.cjs` | C1 (hands-on) | — |

The `#` column uses the `Bnn` form the mechanical fence requires — see B02 below, which
exists because this column was allowed to read `01`.

## Wave map & checkpoints

- **Wave 1 — B01 + B02 + B03, all three concurrent.** The three fences are pairwise
  disjoint (no path appears twice in the table above) and no batch depends on another's
  output. B01 touches one test file. B02 owns the two ledger templates that carry a batch
  table, the two scaffolder documents that describe the self-check, and
  `tests/protocol-contract.test.cjs`. B03 owns the evidence tool, the two mirrored prose
  copies of its safety rule, and the two suites that exercise filters.
- **C1 — after wave 1, final and the only checkpoint.** Covers B01, B02 and B03. Nothing
  in this change is behaviour a user can click, so no intermediate checkpoint would earn
  its cost. C1 is hands-on for one reason: every test fixture in this repository sets
  `GIT_CONFIG_NOSYSTEM=1` and an empty global config on purpose, so no test can prove
  that the helpers work against the real system Git configuration — which is the entire
  claim of BL-003 and half the claim of BL-002. C1 runs the real CLIs against this real
  repository.

**Couplings that are NOT dependencies, and must not become ones.** Three suites read
files this wave edits without being in the editing batch's fence. All are declared in the
batch files so none is discovered mid-round; in every case the answer to needing one is
`NEEDS_FENCE`, never an edit.

- `tests/protocol-contract.test.cjs` (**B02's file**) asserts that the §Read-only evidence
  tools section of `orchestrate/templates/00-READBEFORE.md` (B03's) is byte-identical to
  the same section of `orchestrate/references/protocol.md` (also B03's) after placeholder
  substitution. B03 MUST edit both mirrors identically; if it does, B02's file needs no
  change and the fences stay disjoint. B02 holds it, so no extension could be granted this
  wave anyway.
- `tests/contract-prompt-authority.test.cjs:107-120` runs three "boot-time full read"
  prohibition regexes over all of `orchestrate/templates/00-READBEFORE.md` outside the
  pinned implementer paragraph — including the section B03 rewrites. The three regexes are
  quoted verbatim in B03's implementation notes; the constraint is simply that the new
  prose must never say "read this file in full" or a near-paraphrase.
- `tests/subagent-type-mapping.test.cjs:13` reads `orchestrate/references/protocol.md`
  (B03's), but asserts only on `subagent_type` mapping and the §Degraded bullet, so a
  filter-sentence edit does not disturb it. B03 confirms rather than assumes.

`tests/subagent-type-mapping.test.cjs:139` also reads `.claude/agents/<type>.md`, but by
`existsSync` per named type rather than by listing the directory, so B01's recursion
change does not reach it.

## Smoke-input inventory

**None.** C1 depends on no input files, fixtures or stable-id registry. Every step is a
command run against this repository's own working tree and its own committed history,
judged on a process exit code and a JSON field. There is nothing to generate, nothing to
validate independently and nothing to issue.

Prerequisites, named explicitly: a `node` and a `git` on PATH, and PowerShell 7 for the
published validation recipe (the suite skips its PowerShell assertions and says so if
neither `pwsh` nor `powershell` answers). No private data, no credentials, no external
network access and no disposable environment are required — every test builds its own
throwaway repository under the OS temp directory.

**Two** smoke steps perturb something and restore it, and both are `Runner: agent` only
because the agent can prove the restore. B01's nested-definition step creates and then
deletes an untracked `.claude/agents/subdir/orchestrator.md` in this working tree. B02's
archive-guard step runs entirely inside a **throwaway clone** at `$env:TEMP\os919bl\c1` —
the contract forbids an agent to modify `.agents/archive/`, so the perturbation never
touches this repository, and the clone root is kept short because this repo's deepest
tracked path is 146 characters and the scratchpad prefix would breach Windows'
260-character limit. Each names its restore command and proves it with
`git status --porcelain`. C1 step numbers are assigned at checkpoint close-out, not here.

## Backlog fold-ins

**None.** The backlog IS this change's request — all six live entries are request items
with their own batches, listed in the coverage audit below. The sweep therefore has
nothing separate to offer, and `bugs-2026-09-17.md` is untouched per the backlog file's
own preamble. `BL-007` was struck by the user and is recorded as an exclusion in
[00-request.md](00-request.md), not as a fold-in.

## Per-batch specifications

### B01 — Agent-definition guards that can fail (BL-004, BL-005, BL-006)

**Verbatim backlog text.**

> **BL-004** (low) — `tests/agent-definitions.test.cjs` — the unquoted-`: ` frontmatter
> guard still accepts three YAML-invalid forms: a trailing colon at end of value
> (`description: Runs the steps:`), an unterminated quote, and `description: a "b: c" d`.
> Each makes YAML error on the whole document, so no definition loads and a "read-only"
> role inherits the full catalog — the same end state the strictness was added to
> prevent, reached by parse failure rather than a missing key. Bounded: `tools:` is
> asserted literally equal to a fixed string, so these can only land on `description:`.

> **BL-005** (low) — `tests/agent-definitions.test.cjs` — the directory whitelist uses a
> non-recursive `readdirSync`, so `.claude/agents/subdir/orchestrator.md` escapes it if a
> Claude Code build loads nested definitions.

> **BL-006** (trivial) — `tests/agent-definitions.test.cjs` — the body-size assertion says
> "bytes" but measures LF-normalized UTF-16 length; with em-dashes present, `qa-runner`
> reports ~1195 against 1214 on disk. Use `Buffer.byteLength`, or reword.

**Exploration findings (facts at the ledger base `f829040`).**

- `tests/agent-definitions.test.cjs:9` — `read()` normalizes CRLF to LF before any
  assertion sees the text. That is why `:102` measures something other than the bytes on
  disk, and it is also why a naive `Buffer.byteLength(text)` fixes the units but not the
  normalization. Decide and state which one the assertion means; the comment at `:96-98`
  says "these files are re-read on every spawn, so length is the cost", which argues for
  the bytes actually on disk.
- `:37` — the field regex is `/^([A-Za-z_][A-Za-z0-9_-]*):[ \t]+(\S.*)$/`.
- `:39-40` — the unquoted-`: ` guard is
  `!/^[A-Za-z_][A-Za-z0-9_-]*:[ \t]+[^"'\n]*:[ \t]/.test(line)`. It requires a space or
  tab AFTER the inner colon, which is why `description: Runs the steps:` (colon at end of
  line) slips through. It bails on the first `"` or `'`, which is why
  `description: a "b: c" d` slips through, and it has no notion of a quote that never
  closes.
- `:53` — `fs.readdirSync(path.join(ROOT, '.claude/agents')).filter(f => f.endsWith('.md'))`
  — one level only, and it also silently ignores a subdirectory entry rather than
  reporting it.
- `.claude/agents/` currently holds exactly `implementer.md`, `qa-runner.md`,
  `reviewer.md`, `test-hunter.md` — all four at the top level, no subdirectories. On disk
  today: `qa-runner.md` is 1214 bytes and reports ~1195 through `read()`.
- This test file is not the only consumer of `.claude/agents/`:
  `tests/subagent-type-mapping.test.cjs:139` also reads `.claude/agents/<type>.md`, but by
  `existsSync` per named type rather than by listing the directory, so an extra or nested
  file produces no failure there and B01's recursion change does not disturb it. Not a
  fence coupling; not to be edited.
- The install command is `README.md:136`:
  `mkdir -p ~/.claude/agents && cp orchestrate-skill/.claude/agents/*.md ~/.claude/agents/`
  (a PowerShell form follows). The shorter `cp .claude/agents/*.md ~/.claude/agents/` is
  this test file's own paraphrase in a comment at `:49` — that glob is what makes an
  unexpected extra file dangerous, but quote the README's real command if an assertion
  message cites one.

**Design decisions.**

1. The three YAML-invalid forms must be *rejected*, and each must be proven rejected by
   a case the test itself feeds through the same validator — not merely by editing the
   regex. The cheapest honest shape is to extract the frontmatter-line validation into a
   small pure predicate and drive it from a table of accept/reject cases, so the
   assertion that "this form is rejected" is itself a test that can fail. A regex is
   acceptable; a hand-rolled scanner that tracks quote state is acceptable; guessing is
   not. Whatever is chosen must still accept all four real definitions unchanged.
2. The directory check becomes recursive and reports the offending relative path. A
   nested `.md` is a FAILURE, not an omission: state in the message that the README's
   `cp` glob would not carry it but a build that recurses would load it.
3. Pick one meaning for the size ceiling, implement it, and make the message say what it
   measured. If it is bytes on disk, read the file without LF normalization for that one
   assertion.

**Edge cases.** A frontmatter value that legitimately contains a quoted colon
(`description: "Runs the steps: quickly"`) must still be ACCEPTED — the rule is about
YAML validity, not about banning colons. An empty `.claude/agents/` subdirectory with no
`.md` inside is not a finding. A definition with CRLF line endings must behave the same
as one with LF for the frontmatter assertions.

**Applicable guardrails.** "A test that asserts on a hand-rolled parse more permissive
than the real consumer's" — the consumer here is YAML, and this batch is the second
attempt at that exact boundary. "A whitelist that never enumerates its directory" — BL-005
is the recursion half of the same class.

### B02 — Batch-id grammar the fence can read (BL-001, BL-002)

**Verbatim backlog text.**

> **BL-001** (medium) — Dead frozen-ledger guard.
> `tests/protocol-contract.test.cjs:122` guards
> `.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md`, but
> commit `5110f71` moved that ledger to `.agents/archive/…`. The `existsSync` is
> permanently false, so its two assertions (`/Python310[\\/]python\.exe/` and the
> Excel-validation sentence) never execute. The test still passes, which is what makes it
> dangerous: it advertises a guard that cannot fail. The `existsSync` wrapper is right in
> principle — a clone made after archival need not carry the path — only the path is
> stale.

> **BL-002** (high) — `orchestrate/tools/check-fence.mjs:39` requires every `#` cell of
> the plan's authority table to match `/^B\d{2,}$/`, but `orchestrate/templates/01-plan.md`
> pins no id format and shows no example row. The OS-20260918 plan used `B01`; the
> OS-20260919 plan used bare `01`, so the mechanical fence check threw
> `Duplicate or malformed batch IDs` and returned `UNKNOWN` for **every batch of that
> change** — silently degrading step 6a to the manual fallback throughout. The repo's own
> fence checker could not read a ledger the repo's own scaffolder produced. Fix: a pinned
> example row in the template, a scaffolding self-check, and an end-to-end test that
> scaffolds a ledger and runs the real fence over it.

**Exploration findings (facts at the ledger base `f829040`).**

- `check-fence.mjs:39` (`oneRow`) is called TWICE, at `:164` — once on the plan's
  `# | Branch | Files (fence)` table and once on PROGRESS's `# | Branch | Notes` table.
  BL-002 names only the plan; **both templates need the pinned form**, or the same
  `Duplicate or malformed batch IDs` still fires on the PROGRESS row.
- `.agents/changes/OS-20260919-agent-tool-restrictions/PROGRESS.md` confirms the damage:
  every one of its three Notes cells reads `Fence PASS (manual — helper UNKNOWN, see LOG
  R2/R3)`. The mechanical gate was unusable for that entire change.
- `orchestrate/templates/01-plan.md:10-18` — header row plus an instruction comment; no
  example row, and the comment never mentions the `#` cell's format.
- `orchestrate/templates/PROGRESS.md:36-47` — the same shape.
- `orchestrate/templates/02-batch.md:1` already pins it: `# B{{BATCH_NUM}} — …`, and
  `check-fence.mjs:187` asserts exactly that title form. The batch template is the
  existing precedent to match.
- The contract template already states the rule in prose — "Bnn ids" at
  `orchestrate/templates/00-READBEFORE.md`, inside the §Read-only evidence tools section.
  That section is B03's; **do not edit it**. The prose was never the problem.
- `orchestrate/references/scaffolding.md` step 9 is the self-check
  ("grep the new ledger directory for `{{` and for `<!--`: zero hits; `**State**: ACTIVE`
  present in PROGRESS; the pre-flight verdict line present in the plan").
  `orchestrate/SKILL.md:186-187` carries the one-line summary of the same self-check.
  Both are in this fence so they cannot drift apart.
- `tests/protocol-contract.test.cjs:132` — the test *"published helper recipes execute
  actual CLIs and generated batch grammar passes the real fence"* already scaffolds a
  disposable repo and runs the real `check-fence.mjs`, expecting `PASS`. But it renders
  only `02-batch.md` from the template; the plan and PROGRESS tables it writes are
  hand-authored string literals that already say `B01`. That is why it never caught
  BL-002. This test is the natural home for the end-to-end coverage BL-002 asks for.
- `tests/protocol-contract.test.cjs:80-87` — the "template placeholders and registry
  match in both directions" test parses `scaffolding.md` rows matching
  `/^\| `\{\{[A-Z_]+\}\}` \| template/`. An example row added to a template must not
  introduce a `{{PLACEHOLDER}}` that is absent from the registry, or this goes red.
- `.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md` exists
  and is tracked; it still contains both strings BL-001's dead assertions look for.

**Design decisions.**

1. **BL-001**: keep the `existsSync` wrapper — the reasoning in the backlog entry is
   correct, only the path is stale. Point it at the archive location. Then make the guard
   provably live: a clone that HAS the file must run the two assertions, and the test must
   fail if the file is present but its content drifted. Consider asserting that at least
   one of the two candidate locations exists in THIS repository, so a future move breaks
   the test loudly instead of silently disarming it again. Do not turn it into an
   unconditional read: a clone made after archival need not carry the path.
2. **BL-002 — settled at planning time, not left to the implementer.** ONE example row
   goes **inside the existing `<!-- … -->` instruction comment** of each template's batch
   table, as a literal `Bnn` row. That placement satisfies both constraints at once: the
   scaffolder reads the comment, and `scaffolding.md` step 8 already orders every
   instruction comment replaced while step 9 already greps for zero `<!--` hits — so a
   surviving example is caught by a gate that exists today and `oneRow()` can never see it
   as a duplicate id. Not a live table row; no new `{{PLACEHOLDER}}`.
3. **BL-002 self-check**: extend `scaffolding.md` step 9 and the `SKILL.md` one-liner
   with the id-format check: every `#` cell of the new ledger's plan and PROGRESS batch
   tables matches `Bnn`. Keep it one clause; do not restate the fence tool's grammar.
4. **BL-002 end-to-end — also settled.** Extend the `:132` test so both authority files
   are built the way a scaffolder builds them: lift the example row out of the template's
   instruction comment, substitute real values, emit header + alignment + that row, then
   run the real `check-fence.mjs` over the result. On the un-fixed templates there is no
   example row to lift, so the test fails naming the template and the `Bnn` row it could
   not find; after the fix the fence returns `PASS`. Both directions are asserted. This is
   the batch's failing-on-base criterion and the single most important thing in it.

**Edge cases.** Two-or-more-digit ids (`B10`) must stay legal — the fence regex is
`\d{2,}`. The example rows must not break the `table()` parser in `check-fence.mjs:19`,
which requires every row to have the same cell count as the header and rejects a
duplicate header cell. A rendered example row must not make `oneRow` see a duplicate id
alongside the real batch rows in a filled ledger.

**Applicable guardrails.** "A test that pins the defect" — the `:132` test currently
pins hand-authored authority files, which is what let the template drift. "Markdown is
source of truth / keep additions surgical" — do not reflow the surrounding instruction
comments.

### B03 — Resolved per-path filter attribute (BL-003)

**Verbatim backlog text.**

> **BL-003** (medium) — `check-fence.mjs` reports `unsafe-filter` — and therefore
> `UNKNOWN` — whenever clean/process filters appear in **config**, rather than when a
> path actually resolves to one. Git for Windows writes `filter.lfs.*` into
> `C:/Program Files/Git/etc/gitconfig` on every stock install, so the helper is unusable
> on essentially any Windows machine. The safety property (never execute a clean filter
> to obtain a clean result) is correct and worth keeping; checking the resolved per-path
> `filter` attribute (`git check-attr filter`) preserves it while restoring the mechanical
> gate.

**Exploration findings (facts at the ledger base `f829040`).**

- The code is in `orchestrate/tools/git-evidence.mjs`, in `safeStatusPrerequisites()` at
  `:102-124`, not in `check-fence.mjs` — the fence tool inherits the verdict through
  `worktrees()`. `check-fence.mjs` needs no change.
- `:110-112` is the probe:
  `git config --includes --null --name-only --get-regexp '^filter[.].*[.](clean|process)$'`
  with `GIT_CONFIG` stripped from the environment, followed by
  `if (filters.text) { … 'unsafe-filter' … return false; }`.
- **Reproduced on this machine, 2026-09-19.** `git config --global --name-only
  --get-regexp '^filter\..*\.(clean|process)$'` exits 1 (nothing), but the same query
  against `--system` returns `filter.lfs.clean` and `filter.lfs.process`. And
  `node orchestrate/tools/git-evidence.mjs worktrees --repo .` exits **2**,
  `completeness: partial`, with `cleanliness: unknown, unknown` and two `unsafe-filter`
  diagnostics. This is the C1 canary; record its base-build output before changing
  anything.
- Meanwhile no path in this repository resolves to a filter:
  `git ls-files -z --cached --others --exclude-standard | git check-attr filter -z --stdin`
  returns `unspecified` or `unset` for every path. `.gitattributes` uses `-filter`, which
  resolves to **`unset`** — so `unset` must be treated as SAFE, alongside `unspecified`.
  Only a *set* value (`filter: lfs`) or a bare `set` is unsafe.
- Three existing tests cover this area and **all three assign a filter attribute to a
  real path**, so all three must stay green under the new rule:
  `tests/git-contract.test.cjs:186` (local config, `.gitattributes`),
  `tests/git-contract.test.cjs:292` (global config, `.gitattributes`), and
  `tests/check-fence.test.cjs:235` (local config, `.git/info/attributes`).
- `tests/git-contract.test.cjs:200-205` is the `GIT_CONFIG` concealment case: `GIT_CONFIG`
  redirects `git config` only, so it must not hide a real configured filter. Whatever
  replaces the probe must keep that property — `git check-attr` is not affected by
  `GIT_CONFIG`, which if anything strengthens it, but the case must still be asserted.
- `tests/smoke-inputs.test.cjs:205` already uses
  `git check-attr text eol filter ident working-tree-encoding -- <file>` in this
  repository — an existing in-repo precedent for the command and its output shape.
- The rule is stated in prose in exactly two places, and they are asserted byte-identical
  to each other by `tests/protocol-contract.test.cjs` (a B02 file — see the coupling note
  in the wave map): `orchestrate/references/protocol.md:216` and the mirrored sentence in
  `orchestrate/templates/00-READBEFORE.md`, both reading "Before status, inspect effective
  Git config: executable clean/process filters or submodules make safe cleanliness
  unknown; do not execute such filters to obtain a clean result." The `--help` text at
  `orchestrate/tools/git-evidence.mjs:312` carries a third copy of the claim.

**Design decisions.**

1. **The safety property does not change**: this helper must never execute a clean or
   process filter, and must never report `clean` by disabling a conversion. Only the
   *trigger* changes, from "a driver is configured anywhere" to "a path status would
   inspect actually resolves to one".
2. **Authority is the resolved attribute.** Refuse (`unsafe-filter`, cleanliness
   `unknown`) if and only if at least one inspected path resolves to a filter attribute
   that is SET to a value, or bare-`set`. `unspecified` and `unset` are safe.
3. A config probe MAY remain as a fast path, but only in the direction that is safe: it
   may skip the attribute enumeration when NOTHING at all is configured. It must never be
   the sole reason to refuse, and it must never convert an unsafe attribute into a safe
   verdict.
4. **Enumerate what status enumerates**: tracked paths and untracked non-ignored paths,
   since `status --untracked-files=all` inspects both. `git ls-files -z` with
   `--cached --others --exclude-standard`, piped into `git check-attr filter -z --stdin`,
   is the shape already used elsewhere in this repo. Enumeration itself executes nothing.
5. **Any probe failure, malformed output or unparseable record remains `unknown`.** Never
   assume safe on an error. The existing `invalid-index` / malformed-entry handling and
   the submodule refusal at `:121` stay exactly as they are.
6. Update the `--help` text and BOTH prose mirrors to describe the resolved-attribute
   rule, changing them identically so `tests/protocol-contract.test.cjs` stays green
   without being edited.

**Edge cases.** A path whose attribute is set by `$GIT_DIR/info/attributes` rather than a
tracked `.gitattributes` must still refuse (the check-fence test depends on this). A
repository with no files at all must be safe, not unknown. A filter attribute on a path
that is ignored and untracked is not inspected by status and so is not a refusal — but if
that is hard to establish cheaply, refusing is the acceptable conservative answer; say
which was chosen and why. Path names with `"`, spaces or non-ASCII must survive the `-z`
round trip. The submodule refusal is a separate, unchanged reason to return unknown.

**Applicable guardrails.** "A defect class fixed in the reported instance and left in its
sibling" — this probe is reached through both `worktrees()` and `discovery()`, and
`check-fence.mjs` inherits it; check every caller. "A test that pins the defect" — an
existing assertion may encode the old trigger. "`tests/protocol-contract.test.cjs` mirrors
protocol.md against the contract template" — a one-sided prose edit goes red in a file
this batch does not own.

## Coverage audit (planning-time)

| Request item | Source | Batch |
|---|---|---|
| BL-001 — dead frozen-ledger guard | backlog BL-001 | B02 |
| BL-002 — templates pin no batch-id format (plan + PROGRESS), no scaffolder self-check, no end-to-end fence test | backlog BL-002 | B02 |
| BL-003 — `unsafe-filter` on configured rather than resolved filters | backlog BL-003 | B03 |
| BL-004 — three YAML-invalid `description:` forms accepted | backlog BL-004 | B01 |
| BL-005 — non-recursive agent-directory whitelist | backlog BL-005 | B01 |
| BL-006 — body-size assertion measures UTF-16 length, says "bytes" | backlog BL-006 | B01 |
| BL-007 — missing `polish:` line in the OS-20260919 ledger | backlog BL-007 | excluded by the user, verbatim in [00-request.md](00-request.md); the row is deleted from `BACKLOG.md` in the scaffold commit |
| Remove `## Deferred by decision, not defect` from `BACKLOG.md` | user decision 2026-09-19 | batch 00 (scaffold commit) |

Zero unassigned items.

Pre-flight: 6 blocking fixed, 6 advisory (all also fixed) (see LOG.md)
