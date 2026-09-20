# C1 smoke script — OS-20260919-backlog-sweep

**Build**: `chore/backlog-sweep-ledger` at `e79d378`
**Covers**: B01 (BL-004, BL-005, BL-006) · B02 (BL-001, BL-002) · B03 (BL-003)
**Final checkpoint** — the only one.

Every step is `Runner: agent` and was pre-verified before hand-over; evidence is in
`evidence/C1/`. Run any of them yourself to spot-check. Nothing here installs anything,
pushes anything, or touches your global or system Git configuration. Two steps create and
then delete a file; each names its own restore and proves it.

**Order matters**: Section 1 first. If step 1 behaves the old way, stop — you are looking
at the wrong build and nothing below it can be trusted.

---

## Section 1 — Build check. Run this first.

### Step 1 — The canary

- **Do**: from the repository root, run
  `node orchestrate/tools/git-evidence.mjs worktrees --repo .` and read the exit code and
  the JSON `completeness`, `cleanliness` and `diagnostics`.
- **Pass**: exit **0**, `completeness: complete`, every `cleanliness` is `clean` or
  `dirty` (never `unknown`), and **no** `unsafe-filter` diagnostic anywhere.
- **Aside**: on the base build this exits **2** with `completeness: partial`, EVERY
  worktree `unknown`, and one `unsafe-filter` per worktree. Judge the shape, never a
  count — the worktree inventory grows and shrinks as work proceeds. If you see the old
  behaviour, STOP and say so.
- **Tag**: Build check.

### Step 2 — Confirm the tree

- **Do**: `git rev-parse --abbrev-ref HEAD` and `git rev-parse --short HEAD`.
- **Pass**: `chore/backlog-sweep-ledger` and `e79d378`.

---

## Section 2 — BL-003: the helper works on a stock Windows install

This is the claim no test in the suite can make, because every fixture sets
`GIT_CONFIG_NOSYSTEM=1` and an empty global config precisely to isolate your real
configuration away.

### Step 3 — The situation BL-003 describes is real on this machine

- **Do**: run `git config --system --name-only --get-regexp "^filter\..*\.(clean|process)$"`
  then `git ls-files -z --cached --others --exclude-standard | git check-attr filter -z --stdin`.
- **Pass**: the first lists `filter.lfs.clean` and `filter.lfs.process` (stock Git for
  Windows). The second returns only `unspecified` or `unset` — no path resolves to a
  filter. Together that is exactly BL-003's situation, and step 1 passes anyway.
- **Aside**: if the first command returns nothing, this machine has no LFS filter
  configured and step 1 proves less than it should. Say so rather than recording a pass.

### Step 4 — The refusal side still holds

- **Do**: run the full validation recipe (Section 5) and read the results of
  `configured clean and process filters never execute through API or actual CLI status probes`,
  `global clean filters remain unknown and never execute through API or actual CLI`, and
  `configured filters leave the fence UNKNOWN without executing a command or changing bytes`.
- **Pass**: all three pass. A helper that stopped refusing when a path *does* resolve to a
  filter would have stopped protecting anything — these are the other half of the fix.
- **Counting**: one unit = one named test. Expect three.

---

## Section 3 — BL-001 and BL-002: guards that can now fail

### Step 5 — The fence reads a template-rendered ledger

- **Do**: `node --test tests/protocol-contract.test.cjs` and find
  `published helper recipes execute actual CLIs and generated batch grammar passes the real fence`.
- **Pass**: it passes. That test builds a disposable ledger by lifting the `Bnn` example
  row out of each shipped template's instruction comment — exactly as a scaffolder does —
  and runs the real `check-fence.mjs` over the result, expecting `PASS`. It is red on the
  base templates, because there is no example row to lift. That is BL-002 closed, end to
  end, and it is runnable at any time.
- **Aside**: a *live* fence run against this ledger's own batch branches returned
  `"status":"PASS"` with zero violations and zero unknowns on 2026-09-20 — the first
  mechanical PASS in this repository's history. It is recorded in `PROGRESS.md` (B02's
  Notes) and in `LOG.md`. **Do not try to reproduce it now**: `check-fence.mjs` requires a
  live candidate worktree, and the batch worktrees were removed when wave 1 closed, so the
  same command now returns `UNKNOWN` with `candidate-worktree` — a missing prerequisite,
  not a regression. The C1 pre-smoke run hit exactly this and correctly attributed it to
  the script rather than the build.

### Step 6 — The record shows what changed

- **Do**: read the `Notes` cell of each batch row in this ledger's `PROGRESS.md`, then the
  same in `.agents/changes/OS-20260919-agent-tool-restrictions/PROGRESS.md`.
- **Pass**: **none** of the previous ledger's three rows records a mechanical fence result
  — two read `Fence PASS (manual — helper UNKNOWN, see LOG R2/R3)` and the third
  `Fence PASS (manual, extended fence)`. All three are manual; that is the damage BL-002
  describes, preserved as the before picture. In THIS ledger, B02's row records a
  mechanical `PASS`.
- **Aside**: B01 and B03 also say `manual` here, for reasons their Notes give — B03 ran
  before its own fix landed, and B01's mechanical run tripped the wrapped-`polish:`-line
  tool defect. Only B02's row is expected to show a mechanical result.

### Step 7 — The archive guard can fail

- **Do**: **in a throwaway clone, never in this repository** —
  `git clone . "$env:TEMP\os919c1"`. In the clone, delete the one line containing
  `Every generation and independent Excel-validation command in this run uses literal`
  from `.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md`, run
  the validation recipe there, then `git -C "$env:TEMP\os919c1" checkout -- .` and re-run.
  Finally `Remove-Item -Recurse -Force "$env:TEMP\os919c1"`.
- **Pass**: RED in the clone while the line is missing, naming
  `reusable artifacts contain no local Python installation default, while frozen ledger retains its environment fact`;
  green after the restore. In THIS repository `git status --porcelain` is empty throughout.
- **Aside**: the contract forbids an agent to modify `.agents/archive/`, which is why this
  runs in a clone. Use the Excel sentence, which occurs exactly once — **not** the
  `Python310` line: five lines contain it and three match the asserted regex, so deleting
  one proves nothing. That trap was caught at pre-flight.

---

## Section 4 — BL-004, BL-005, BL-006: the agent-definition guards

### Step 8 — A nested definition is caught

- **Do**: create `.claude/agents/subdir/orchestrator.md` containing the single line
  `hello`, run the validation recipe, then delete the file and the `subdir` directory and
  re-run.
- **Pass**: RED with the failure naming `the directory holds exactly the four known
  definitions` and the path `subdir/orchestrator.md`; green after the delete, with
  `git status --porcelain` empty.
- **Aside**: creates and deletes an untracked file under `.claude/agents/`. It must never
  touch the four tracked definitions and never write into `~/.claude/agents/`.

### Step 9 — The YAML-invalid forms are rejected, and the whitelist is pinned both ways

- **Do**: in the recipe's output, find the case-table tests and
  `the escape whitelist admits exactly the characters YAML defines`.
- **Pass**: the three forms BL-004 names each appear as their own passing case, the
  quoted-colon accept case appears, and the whitelist sweep passes — it checks all 95
  printable ASCII characters against the 18 YAML defines, in both directions.

---

## Section 5 — The whole build

### Step 10 — Full validation

- **Do**: from the repository root in PowerShell:

  ```powershell
  $testFiles = @(Get-ChildItem -LiteralPath tests -Filter *.test.cjs -File -Recurse | Sort-Object FullName | ForEach-Object FullName)
  if ($testFiles.Count -eq 0) { throw 'No Node test suites discovered' }
  node --test --test-reporter=spec @testFiles
  if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
  git diff --check
  if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }
  ```

- **Pass**: **260 pass, 0 fail**, exit 0, and `git diff --check` silent. Base was 207, so
  this change adds 53 tests.
- **Aside**: takes about four minutes. `node --test` bare from the root is the portable
  equivalent; `node --test tests/` is NOT — Node's directory-argument discovery differs
  and the suite fails.

---

## Reporting

For each step: **PASS**, **FAIL**, **BLOCKED** (could not run — say why), or **WORKS-BUT**
(passed, but something else looked wrong — those become backlog entries, not failures).

A fail does not need a diagnosis, just the symptom and which step. Anything you noticed
that no step asked about is worth saying too.
