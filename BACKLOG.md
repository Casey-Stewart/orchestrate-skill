# Backlog

Rolling list of residuals. Ids are `BL-NNN`, assigned in order and never reused.

This file is the destination for findings that were real but out of every batch's fence
at the time they surfaced. It is **not** `bugs-2026-09-17.md`, which is a dated
point-in-time review record pinned to commit `af57139` and is left untouched.

| id | severity | what | found |
|---|---|---|---|
| BL-001 | medium | Dead frozen-ledger guard. `tests/protocol-contract.test.cjs:122` guards `.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md`, but commit `5110f71` moved that ledger to `.agents/archive/…`. The `existsSync` is permanently false, so its two assertions (`/Python310[\\/]python\.exe/` and the Excel-validation sentence) never execute. The test still passes, which is what makes it dangerous: it advertises a guard that cannot fail. The `existsSync` wrapper is right in principle — a clone made after archival need not carry the path — only the path is stale. | OS-20260919 B02 |
| BL-002 | high | `orchestrate/tools/check-fence.mjs:39` requires every `#` cell of the plan's authority table to match `/^B\d{2,}$/`, but `orchestrate/templates/01-plan.md` pins no id format and shows no example row. The OS-20260918 plan used `B01`; the OS-20260919 plan used bare `01`, so the mechanical fence check threw `Duplicate or malformed batch IDs` and returned `UNKNOWN` for **every batch of that change** — silently degrading step 6a to the manual fallback throughout. The repo's own fence checker could not read a ledger the repo's own scaffolder produced. Fix: a pinned example row in the template, a scaffolding self-check, and an end-to-end test that scaffolds a ledger and runs the real fence over it. | OS-20260919 orchestrator |
| BL-003 | medium | `check-fence.mjs` reports `unsafe-filter` — and therefore `UNKNOWN` — whenever clean/process filters appear in **config**, rather than when a path actually resolves to one. Git for Windows writes `filter.lfs.*` into `C:/Program Files/Git/etc/gitconfig` on every stock install, so the helper is unusable on essentially any Windows machine. The safety property (never execute a clean filter to obtain a clean result) is correct and worth keeping; checking the resolved per-path `filter` attribute (`git check-attr filter`) preserves it while restoring the mechanical gate. | OS-20260919 orchestrator |
| BL-004 | low | `tests/agent-definitions.test.cjs` — the unquoted-`: ` frontmatter guard still accepts three YAML-invalid forms: a trailing colon at end of value (`description: Runs the steps:`), an unterminated quote, and `description: a "b: c" d`. Each makes YAML error on the whole document, so no definition loads and a "read-only" role inherits the full catalog — the same end state the strictness was added to prevent, reached by parse failure rather than a missing key. Bounded: `tools:` is asserted literally equal to a fixed string, so these can only land on `description:`. | OS-20260919 B01 scoped re-review |
| BL-005 | low | `tests/agent-definitions.test.cjs` — the directory whitelist uses a non-recursive `readdirSync`, so `.claude/agents/subdir/orchestrator.md` escapes it if a Claude Code build loads nested definitions. | OS-20260919 B01 scoped re-review |
| BL-006 | trivial | `tests/agent-definitions.test.cjs` — the body-size assertion says "bytes" but measures LF-normalized UTF-16 length; with em-dashes present, `qa-runner` reports ~1195 against 1214 on disk. Use `Buffer.byteLength`, or reword. | OS-20260919 B01 scoped re-review |
| BL-007 | trivial | Bookkeeping: `02-batches-01-agent-definitions.md` records no `- [ ] polish:` line for the body-length ceiling, so the ledger does not show that optional item as taken. | OS-20260919 B01 scoped re-review |

## Deferred by decision, not defect

- **Ship the agent definitions as a plugin.** A skill directory cannot carry `agents/`;
  only a folder with `.claude-plugin/plugin.json` can. Considered at OS-20260919 planning
  time and explicitly deferred as a follow-on change, with the user choosing "repo root
  only" plus README install instructions. Revisit if the manual copy step proves to be
  the thing people skip.
