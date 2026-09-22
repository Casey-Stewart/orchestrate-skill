# Request (2026-09-19, verbatim)

> new take all items in backlog and lets fix them. Should only be 7 or 8 items.

The backlog file named is `BACKLOG.md` at the repository root. It held exactly seven
entries, `BL-001` through `BL-007`, all filed at the close of OS-20260919. The file's own
preamble is quoted here because it scopes the ask:

> This file is the destination for findings that were real but out of every batch's fence
> at the time they surfaced. It is **not** `bugs-2026-09-17.md`, which is a dated
> point-in-time review record pinned to commit `af57139` and is left untouched.

Six of the seven are in scope. `BL-007` was struck by the user (see decisions below), so
this change carries **six items**.

## Accuracy check (scaffold-time verification, 2026-09-19)

Every entry was re-read against the files at the ledger base `f829040` rather than
trusted from its backlog text.

- **BL-001 — confirmed.** `tests/protocol-contract.test.cjs:122` guards
  `.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md`. That
  path does not exist; the ledger lives at
  `.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/`, which does. The
  `existsSync` is permanently false and the two assertions inside it never execute.
- **BL-002 — confirmed, and slightly wider than written.** `check-fence.mjs:39` requires
  `/^B\d{2,}$/` for every `#` cell, and `oneRow()` is applied to BOTH the plan table and
  the PROGRESS table (`check-fence.mjs:164`). `orchestrate/templates/01-plan.md` and
  `orchestrate/templates/PROGRESS.md` each show a header row and an instruction comment
  but no example row, so neither pins the id format. `orchestrate/templates/02-batch.md:1`
  already pins it correctly (`# B{{BATCH_NUM}} —`). The contract template states the rule
  in prose ("Bnn ids") but no scaffolder self-check enforces it.
- **BL-003 — confirmed on this machine.** `git-evidence.mjs:110` probes
  `git config --includes --name-only --get-regexp '^filter[.].*[.](clean|process)$'`
  with no scope restriction. On this machine that returns `filter.lfs.clean` and
  `filter.lfs.process` from the **system** config
  (`C:/Program Files/Git/etc/gitconfig`), while `git check-attr filter -- README.md`
  returns `unspecified` — no path resolves to any filter. Every `worktrees` call on this
  repository is therefore `unknown` / exit 2.
- **BL-004, BL-005, BL-006 — confirmed** against `tests/agent-definitions.test.cjs:39`
  (the unquoted-`: ` guard), `:53` (`readdirSync`, non-recursive) and `:102`
  (`text.length` on an LF-normalized UTF-16 string, described as "bytes").
- **BL-007 — struck by the user, not by verification.** The omission is real: the file
  records four `polish:` lines (ASK 1–4) and none for the body-length ceiling.

## User decisions

**2026-09-19 — `BACKLOG.md` was dirty on `main`.** An uncommitted deletion of the whole
`## Deferred by decision, not defect` section (the note about shipping the agents as a
plugin) was present at scaffold time. Asked what was intended, the user chose
**"Carry it onto the ledger branch"**: the deletion is an intentional cleanup, committed
as its own commit on `chore/backlog-sweep-ledger` alongside the scaffold, leaving
`refs/heads/main` untouched.

**2026-09-19 — verification.** The user chose **"Full recipe + agent-run smoke"**:
validation is the published PowerShell recipe (recursive discovery + `git diff --check`);
C1 steps are tagged `Runner: agent` wherever a CLI can prove them, are pre-verified
before hand-over, and the user reviews the evidence and spot-checks.

**2026-09-19 — git policy and gates.** The user chose **"Stop at integration +
test-hunter"**: work stacks on `chore/backlog-sweep-ledger`; merging to
`refs/heads/main` and pushing to `origin` wait for the user's explicit words at C1.
Every batch gets the independent reviewer plus the read-only `test-hunter` gate.

**2026-09-19 — BL-007 struck.** Asked whether adding a missing `polish:` line to the
COMPLETE, merged and pushed OS-20260919 ledger was acceptable, the user answered
verbatim: **"Delete BL-007, no idea why that is in backlog."** BL-007 is therefore
removed from `BACKLOG.md` in the scaffold commit and no ledger file of OS-20260919 is
touched by this change. This is consistent with that ledger's own contract, which makes
"never rewrite a completed ledger" a binding convention.

**2026-09-19 — plan approved, wave 1 authorized.** Presented the plan, the one-wave map,
the single C1 checkpoint and the pre-flight outcome (6 blocking + 6 advisory, all fixed)
for approval in one pass. The user chose **"Approved — start wave 1 now"**. That approval
is the standing authorization to run B01, B02 and B03 concurrently in wave 1 and to
continue autonomously through review, the `test-hunter` gates and integration until C1.
It is NOT an authorization to merge toward `refs/heads/main` or to push.

**2026-09-19 — backlog fold-ins: none.** The backlog IS this change's request, so the
scaffolding sweep has nothing separate to offer. No item was folded into another item's
batch, and `bugs-2026-09-17.md` stays untouched per the backlog file's own preamble.

## Item → batch map

| Item | Source | Batch |
|---|---|---|
| BL-001 — dead frozen-ledger guard at `tests/protocol-contract.test.cjs:122` | backlog BL-001 | B02 |
| BL-002 — plan/PROGRESS templates pin no batch-id format, so the real fence returns UNKNOWN for every batch | backlog BL-002 | B02 |
| BL-003 — `unsafe-filter` fires on configured filters rather than resolved per-path attributes | backlog BL-003 | B03 |
| BL-004 — three YAML-invalid `description:` forms still pass the frontmatter guard | backlog BL-004 | B01 |
| BL-005 — non-recursive `readdirSync` in the agent-directory whitelist | backlog BL-005 | B01 |
| BL-006 — body-size assertion says "bytes" but measures UTF-16 length | backlog BL-006 | B01 |
| BL-007 — missing `polish:` bookkeeping line in the OS-20260919 ledger | backlog BL-007 | **excluded — struck by the user 2026-09-19, quoted above; the row is deleted from `BACKLOG.md` in the scaffold commit** |
| Remove the `## Deferred by decision, not defect` section from `BACKLOG.md` | user decision 2026-09-19 | **batch 00 (scaffold commit)** |
