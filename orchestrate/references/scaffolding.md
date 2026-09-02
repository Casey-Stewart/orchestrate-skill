# Scaffolding a new ledger (`new` mode)

## Preconditions

1. **Git repo required.** Not a repo → STOP and offer `git init` (+ an initial commit)
   with the user's consent. Crash markers, the reconcile table, and "git is truth" are
   git-native; the protocol cannot run without it.
2. Dirty tree on the default branch → warn and let the user decide before creating
   anything.
3. An ACTIVE ledger already in `.agents/changes/` → ask whether to finish it first. Two
   concurrent ledgers are allowed only as the user's explicit choice.

## Procedure

1. **Detect** repo facts (heuristics below) — read-only.
2. **Interview** — ONE consolidated AskUserQuestion round covering only the gaps and the
   confirmations listed below.
3. **Plan** — explore the codebase (sub-agents as needed), draft the batch table with
   file fences, and map every request item to a batch. Then structure for throughput
   per `execution-models.md`: reshape fences for disjointness (seam batches, splits,
   merges), build the wave map (widest safe waves — "3 concurrent, then 2" beats 5
   back-to-back), classify every batch hands-on vs machine-verifiable, and place the
   smoke checkpoints (one after each hands-on wave + the mandatory final one — never
   per batch). Get the plan, wave map, and checkpoints approved by the user in ONE
   pass; that approval is the standing authorization for the concurrency.
4. **Front-load user gates** — a batch that depends on a user design choice (UX
   layout, mockup, visual/copy pick — anything the user must SEE before code is
   written) must never sit mid-sequence where it stalls the autonomous run:
   - Default: resolve it NOW, at planning time — produce the mockup/options (HTML
     mockup, sketch, annotated screenshot, or option list), get the user's pick in
     the same interactive session, and bake the APPROVED design into the batch file.
     The user is present during planning; mid-run they may not be.
   - If a design genuinely cannot be mocked until earlier code exists, schedule that
     batch as EARLY as its dependencies allow (wave 1 where possible) and mark the
     gate in the plan's batch table (`👤 design approval`) so the user approves the
     stall's position along with the plan. A gated batch never shares a wave with
     work that would run past its unanswered question.
   - Never bury a known user gate in the middle of an otherwise-autonomous sequence.
5. **Fill** — instantiate every file in `templates/` into
   `.agents/changes/{{CHANGE_ID}}/`, renaming `02-batch.md` to one
   `02-batches-{{BATCH_NUM}}-{{BATCH_SLUG}}.md` per batch. Replace every `{{...}}`
   placeholder with its value and every `<!-- ... -->` instruction comment with real
   content.
6. **Self-check** — grep the new ledger directory for `{{` and for `<!--`: **zero hits**.
   Any hit is an unfilled slot; fix before committing.
7. **Scaffold commit** — batch 00 = the ledger itself, committed on
   `chore/{{CHANGE_SLUG}}-ledger`, which becomes the INTEGRATION BRANCH every wave
   stacks onto. Never on the default branch.
8. **STOP** — report the ledger path and batch table. Start batch 01 only if the user
   says so.

## Naming

- `{{CHANGE_ID}}` = `{{ID_PREFIX}}-<YYYYMMDD>-{{CHANGE_SLUG}}` (e.g.
  `IST-20260713-ux-fix-pack`).
- Batch files: `02-batches-{{BATCH_NUM}}-{{BATCH_SLUG}}.md`, `{{BATCH_NUM}}` two digits
  starting at `01` (`00` is reserved for ledger scaffolding).
- Ledger root is always repo-root `.agents/changes/` — it is the discovery anchor every
  mode globs for. Override only on explicit user request.

## Placeholder registry (single source of truth)

Every `{{...}}` in `templates/` must appear here, and every row marked *template* must
appear in the templates — check both directions when editing either.

| Placeholder | Where | Filled from |
|---|---|---|
| `{{CHANGE_ID}}` | template (READBEFORE, PROGRESS, plan) | computed: prefix + date + slug |
| `{{CHANGE_SLUG}}` | naming only | short kebab-case name for the change |
| `{{ID_PREFIX}}` | naming only | interview #6 (default: repo-name initials) |
| `{{DATE}}` | template (PROGRESS, request) | today, YYYY-MM-DD |
| `{{LEDGER_DIR}}` | template (READBEFORE) | `.agents/changes/{{CHANGE_ID}}` |
| `{{MAIN_BRANCH}}` | template (READBEFORE) | detected: `git symbolic-ref refs/remotes/origin/HEAD` or current branch |
| `{{INTEGRATION_BRANCH}}` | template (READBEFORE) | `chore/{{CHANGE_SLUG}}-ledger` unless the user overrides |
| `{{BRANCH_PREFIXES}}` | template (READBEFORE) | detected from `git branch -a` history; default `fix/ feat/ chore/` |
| `{{MERGE_POLICY}}` | template (READBEFORE) | interview #4 |
| `{{EXECUTION_MODEL}}` | template (READBEFORE, PROGRESS) | interview #5 — the confirmed wave map summary (waves + members + checkpoint positions, e.g. "Waved stack — W1: B01+B02+B03; W2: B04+B05. Checkpoints: C1 after W1 (B02 hands-on), C2 final") |
| `{{EXECUTION_MODEL_RATIONALE}}` | template (READBEFORE, PROGRESS) | written at scaffold time: WHY these waves are safe together and why the checkpoints sit where they do, in 2–4 sentences |
| `{{VALIDATION_COMMANDS}}` | template (READBEFORE) | interview #1 — fenced block, one command + comment per line, or literal `none` |
| `{{VERSION_FILES}}` | template (READBEFORE) | interview #2 — or `none` |
| `{{VERSION_BUMP_RULE}}` | template (READBEFORE) | interview #2 — cadence + per-batch vs per-change, or `none` |
| `{{CHANGELOG_RULE}}` | template (READBEFORE) | interview #2 — path, ordering (append bottom vs prepend), heading format, voice, or `none` |
| `{{SMOKE_PROCEDURE}}` | template (READBEFORE) | interview #3 — always asked |
| `{{WORKTREE_SETUP}}` | template (READBEFORE) | detected install/build step (`npm install`, `cargo fetch`, …) or `n/a` |
| `{{REPO_CONVENTIONS}}` | template (READBEFORE) | distilled from the project CLAUDE.md/docs — the BINDING subset, ≤25 lines, plus a pointer to the source doc; never a wholesale copy |
| `{{EXTRA_PROHIBITIONS}}` | template (READBEFORE) | interview #7 / CLAUDE.md — repo-specific never-touch items; `(none beyond the above)` if empty |
| `{{GUARDRAILS_REF}}` | template (READBEFORE ×3) | detected guardrails section (e.g. `` `CLAUDE.md` §Bug-Class Guardrails ``) or `the project guardrails doc (none yet — create a CLAUDE.md guardrails section at first distill)` |
| `{{BACKLOG_FILE}}` | template (READBEFORE ×2) | detected (`BACKLOG.md`, `TODO.md`, issue tracker) or `` `BACKLOG.md` (create on first residual) `` |
| `{{RELEASE_COMMAND}}` | template (READBEFORE) | detected build/release script or `none` |
| `{{BATCH_NUM}}` | template (batch file) | per batch, two digits |
| `{{BATCH_SLUG}}` | naming only | per batch, kebab-case |
| `{{BATCH_TITLE}}` | template (batch file) | per batch |
| `{{BATCH_TYPE}}` | template (batch file) | `fix` / `feature` / `chore` |
| `{{BATCH_VERSION}}` | template (batch file) | per the bump rule; `—` if the repo doesn't version |
| `{{BATCH_BRANCH}}` | template (batch file) | `<prefix>/<batch-slug>` |
| `{{BATCH_DEPS}}` | template (batch file) | batch numbers this batch needs integrated first; `none` if independent |
| `{{BATCH_WAVE}}` | template (batch file) | wave number from the plan's wave map |
| `{{BATCH_SMOKE_GATE}}` | template (batch file) | `hands-on — checkpoint C<n> follows wave <w>` or `machine-verifiable — covered by the final checkpoint (C<n>)` |
| `{{BATCH_FILES}}` | template (batch file) | the file fence from the plan's batch table |

## Detection heuristics (run before asking anything)

| Topic | Look at | Derive |
|---|---|---|
| Validation commands | `package.json` scripts (`lint`, `format:check`, `typecheck`, `check`, `test`, coverage); `justfile` / `Makefile` targets; `Cargo.toml` → `cargo fmt --check` + `clippy` + `test`; `pyproject.toml` → `ruff` / `pytest`; `go.mod` → `go vet` + `go test ./...` | candidate command list to confirm |
| Version + changelog | version fields in `package.json` / `manifest.json` / `Cargo.toml` / `pyproject.toml` / `VERSION`; if `CHANGELOG.md` exists, read the FIRST and LAST headings to infer oldest-first (append bottom) vs newest-first (prepend top) | candidate `{{VERSION_FILES}}` / `{{CHANGELOG_RULE}}` |
| Default branch | `git symbolic-ref refs/remotes/origin/HEAD`, else `git branch --show-current` | `{{MAIN_BRANCH}}` |
| Branch prefixes | `git branch -a` naming history | `{{BRANCH_PREFIXES}}` |
| Conventions / prohibitions / guardrails / backlog | project `CLAUDE.md`, `CONTRIBUTING.md`, `.claude/` docs; files named `BACKLOG*`/`TODO*` | `{{REPO_CONVENTIONS}}`, `{{EXTRA_PROHIBITIONS}}`, `{{GUARDRAILS_REF}}`, `{{BACKLOG_FILE}}` |
| Release step | `build`/`release`/`package` scripts | `{{RELEASE_COMMAND}}` |
| Monorepo | multiple `package.json` / workspace config | ask which package is in scope; constrain fences to it and filter validation commands (`pnpm --filter <pkg> …`) |

## Interview (one AskUserQuestion round — confirmations + gaps only)

1. **Validation commands** — present the detected list to confirm/edit; nothing detected
   → ask, offering "none (the checkpoint smoke tests carry all verification)".
2. **Version + changelog** — bump per batch, per change, or never? Which files move in
   lockstep? Changelog convention (confirm the inferred ordering).
   **Default to bumping at least once per CHECKPOINT, and say why when you ask.** A
   single bump deferred to close-out leaves the integration branch sharing a version
   with the branch it was cut from — so the smoke script's "confirm the version" step
   cannot distinguish them and passes on the wrong build. That shipped: a user ran an
   entire 20-step script against the base branch, reported the un-fixed defects as
   failures, and caught it only by asking whether the changes were really in the
   build. If the user still prefers one bump, say plainly that the checkpoint scripts
   will then need a behavioural canary instead, and make sure they get one. A
   changelog entry per checkpoint is NOT implied — one entry per change is usually
   still right; it is the VERSION that must move.
3. **Smoke procedure** — ALWAYS asked, free text: "How do you verify a change by hand in
   this project?" (checkpoint smoke scripts are written against the answer, including
   any gotchas like "reload the extension, then refresh the page").
4. **Merge policy** — default: work stacks on the integration branch; the USER
   smoke-tests at checkpoints and merges; the orchestrator never pushes. Confirm or
   adjust (PR flow, orchestrator ff-merge on recorded verdict).
5. **Wave map + checkpoints** — present the computed wave map (which batches run
   concurrently, and why that is safe) and the checkpoint placement (after which
   waves, with the hands-on batches named) per `execution-models.md`; the user
   confirms or adjusts. Fewest checkpoints wins: intermediate ones exist only for
   hands-on risk, and the final one is mandatory.
6. **ID prefix** — default: initials of the repo directory name
   (`inventory-sync-tool` → `IST`); confirm.
7. **Distillation targets + prohibitions** — only if detection found no guardrails
   section or backlog file: create them at first close-out? (default yes). Any
   never-touch files beyond the standard prohibitions?

Batch it: topics 1–7 fit in one AskUserQuestion call (4 questions max per call → merge
related topics, e.g. 2+6 and 4+7, or run two calls back-to-back if genuinely needed).

## Baking rule

Interview answers are written INTO the generated `00-READBEFORE.md` — never referenced
back to this skill. The skill's references exist for the skill's benefit; each ledger
must be drivable by a session that has never seen this skill.
