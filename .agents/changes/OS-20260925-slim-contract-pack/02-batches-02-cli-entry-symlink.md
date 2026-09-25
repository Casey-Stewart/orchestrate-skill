# B02 — Tool CLIs run through any symlinked path; git env scrubbed (fix, —)

**Branch**: `fix/cli-entry-symlink`
Cut from the integration tip when the wave opens.
**Wave**: 1 · **Weight**: M
**Depends on**: none
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files**: `orchestrate/tools/check-fence.mjs`, `orchestrate/tools/git-evidence.mjs`, `orchestrate/tools/build-smoke-page.mjs`, `orchestrate/tools/check-ledger.mjs`, `orchestrate/tools/validate.mjs`, `orchestrate/tools/mutate.mjs`, `orchestrate/tools/prompt.mjs`, `orchestrate/tools/run-at-ref.mjs`, `tests/cli-entry.test.cjs`, `tests/mutate.test.cjs`, `tests/validate.test.cjs`, `tests/git-contract.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: a guard that SAMPLES the domain it claims to sweep (enumerate tools/*.mjs from the checkout; assert size and set-equality); a whitelist that never enumerates its directory; a branch no input reaches (the loud same-basename mismatch must be reached by a test); a defect fixed in the reported instance and left in its sibling (all eight tools; BL-036/037 are the env siblings); a guard whose verdict depends on the checkout rather than the code (links: directory, file, junction); run a live control through your own harness before trusting any green or any zero; a test that reads a child's raw output has a verdict that depends on the terminal (strip ANSI; run under FORCE_COLOR=1 too)
**Spec**: [01-plan.md](01-plan.md) §B02 · **Gate**: fence check → failing-on-base + reviewer + test-hunter

## Implementation notes

### BL-028, verbatim (BACKLOG.md)

> | BL-028 | high | `orchestrate/tools/check-fence.mjs:215`, `git-evidence.mjs:381` and `build-smoke-page.mjs:326` run their CLI body only when `import.meta.url` equals the URL of `process.argv[1]`. Node resolves the entry script's `import.meta.url` through symlinks but leaves `argv[1]` as invoked, so through ANY symlinked path component the guard is false, nothing runs, and the process exits 0 with no output. That includes this README's own install (`ln -s` into `~/.claude/skills/`), and very likely its Windows junction too (untested). `protocol.md:173` reads check-fence's exit 0 as PASS, so the mechanical fence gate clears a batch it never examined. Reproduced 2026-09-24 through `~/.claude/skills/orchestrate/tools/`: all three exit 0 silently, while through the clone path check-fence and git-evidence exit 2 with a JSON UNKNOWN verdict and build-smoke-page exits 1 with an error. `smoke-inputs.mjs` is a library with no CLI guard, so it is unaffected. Sibling defect, same root: the docs prescribe `node orchestrate/tools/…` (`SKILL.md:35`, `protocol.md:150-156`) and `node tools/build-smoke-page.mjs` (`smoke-page.md:85`, `:93`), paths that resolve only from inside this clone; an agent resolving them against the skill's announced base directory lands on the symlink. Suggested shape, to be re-derived rather than trusted: compare against `fs.realpathSync(process.argv[1])`, and pin it with a test that runs every `tools/*.mjs` CLI through a temporary symlinked directory beside a live control through the real path. | Shipping-app install, 2026-09-22: found minutes after the symlink went in, worked around by a machine-local memory note (call the tools by the clone path) and never filed here. Both rebuilt-skill ledgers there (`SA-20260922-high-priority-pack`, `SA-20260923-operator-ux-pack`) used the clone path for every call, so no gate was skipped. Re-verified 2026-09-24. |

### BL-036 and BL-037, verbatim (BACKLOG.md)

> | BL-036 | medium | `orchestrate/tools/git-evidence.mjs`'s `git()` inherits `process.env`, so an inherited `GIT_DIR` or `GIT_INDEX_FILE` (git exports them to hooks) points `check-fence.mjs` and reconcile at the wrong repository — the sibling of the B05 C1 fix, which scrubs git's `rev-parse --local-env-vars` list for `mutate.mjs` / `run-at-ref.mjs` only. | B05 R2 reviewer and fix-up implementer (out of fence). |

> | BL-037 | low | Direct callers of `withDisposableCheckout` / `runSpec` (the exported API, not the CLIs) get no git-env scrub: the ref lookup and validate steps follow an inherited `GIT_DIR`. Today the only production caller, `run-at-ref.mjs`, scrubs first. | B05 C1 fix-up reviews. |

### Re-derived at planning time (git is truth — the entry's pointers are stale)

- **Eight guarded CLIs, not three** (reproduced 2026-09-25 at `edd2f1e`: through a symlinked
  directory every one exits 0 with zero bytes; through the real path each prints its help):
  `check-fence.mjs:143`, `git-evidence.mjs:381`, `check-ledger.mjs:212`, `prompt.mjs:301`,
  `validate.mjs:386`, `mutate.mjs:361`, `run-at-ref.mjs:60` use
  `import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href`;
  `build-smoke-page.mjs:326` uses `pathToFileURL(process.argv[1])` without `resolve`.
  `smoke-inputs.mjs` and `ledger-parse.mjs` are libraries with no guard.
- **Fix shape.** The class is a guard that fails OPEN: any mismatch between the two spellings
  of the entry path silently skips the CLI body and exits 0. The fix must (a) compare the two
  sides after resolving links on BOTH (`fs.realpathSync` of `fileURLToPath(import.meta.url)`
  against `fs.realpathSync(process.argv[1])` — both sides, so `--preserve-symlinks-main` also
  matches), and (b) never leave "neither main nor imported" silent: a mismatch while
  `process.argv[1]`'s basename equals this module's basename must print a one-line error to
  stderr and exit 2. One shared helper is preferred over eight copies; it lives in `git-evidence.mjs` (a new tool
  file would have to join `NON_MARKDOWN` and the README tools tree, both B01's files). Add no
  new `diagnostic()` code to `check-fence.mjs` — its codes are a pinned closed set
  (`tests/check-ledger.test.cjs:249-250,422-500`).
- **Test** (`tests/cli-entry.test.cjs`): the DOMAIN is `orchestrate/tools/*.mjs` enumerated from
  the checkout, never a hand list; assert the guarded set equals, by name, the set of enumerated files that contain a
  guard, with a lower bound of 8 (never a literal count), so a ninth tool (B04 adds one) is
  covered with no edit here.
  For each guarded tool run `--help` (or its no-argument usage path) three ways: through the
  real path (LIVE CONTROL: must produce non-empty output), through a temporary symlinked
  directory, and through a symlinked file — outputs and exit codes must equal the control's.
  Create links with `fs.symlinkSync(target, link, 'junction')` for the directory case so the
  same line makes a junction on Windows (the user's laptop run at C1 exercises it). A FILE
  symlink throws `EPERM` on Windows without Developer Mode: there the file-link case asserts the
  error IS `EPERM` (any other error still fails) and the junction case carries the platform —
  never `t.skip`, since C1's Windows step requires `ℹ skipped 0` (pattern:
  `tests/check-ledger.test.cjs:522-523`). The test
  must FAIL on the base for every tool (failing-on-base).
- **BL-036.** `git-evidence.mjs:18-21` spreads `process.env` into every git child with no scrub of
  repo-local variables; `check-fence.mjs` calls that `git()`, and so do `mutate.mjs:69-73`
  (`topLevel`) and `:125-126` (the ref lookup inside `withDisposableCheckout`), so scrubbing
  `git()` fixes those too. **Scope: repository-location variables only** — every name
  `git rev-parse --local-env-vars` prints EXCEPT `GIT_CONFIG`, `GIT_CONFIG_COUNT`,
  `GIT_CONFIG_PARAMETERS` and `GIT_CONFIG_KEY_*`/`GIT_CONFIG_VALUE_*`: config injection is
  surfaced, not hidden (`tests/git-contract.test.cjs:173` expects a malformed `GIT_CONFIG_COUNT`
  to yield exit 2 with `diagnostics[0].command === 'rev-parse'`, and must stay green unchanged).
  The CLI test goes in `tests/git-contract.test.cjs`. Reuse the existing scrub
  (`mutate.mjs:87-105`: `localGitVars` / `withoutLocalGitEnv` / `scrubLocalGitEnv`, built from
  `git rev-parse --local-env-vars`) rather than a second list; if the scrub moves into
  `git-evidence.mjs` so both can share it, `mutate.mjs` imports it back. Test: run the real
  `git-evidence.mjs` and `check-fence.mjs` CLIs with `GIT_DIR` and `GIT_INDEX_FILE` pointing at
  a decoy repository and assert the evidence describes the `--repo` repository, with a control
  run whose decoy WOULD have been read under the old code (failing-on-base).
- **BL-037.** The entry says `run-at-ref.mjs` is the only production caller; the exported
  `mutate()` (`mutate.mjs:260`) is a second. Move the scrub inside `withDisposableCheckout`
  (`mutate.mjs:124`) so every caller of the exported API gets it; the CLI scrubs at
  `run-at-ref.mjs:50` and `mutate.mjs:348` may stay. `runSpec` (`validate.mjs:310`) reads
  `process.env` directly (`:320`) and takes no env: add an optional `env` argument (default
  `process.env`, today's behaviour), which the disposable-checkout path passes scrubbed. Never
  mutate the caller's global `process.env`. Test in
  `tests/mutate.test.cjs` beside the env pins at `:589-660`.

### Fold-in BL-041 (folded from `BACKLOG.md`, approved 2026-09-25 — its own commit, message carrying the id)

> | BL-041 | low | Wording residuals in shipped `--help` text: `mutate.mjs` — the no-pass cause says "a step" (should be "a counted step"), and the SURVIVED sentence lacks KILLED's "no CRASHED cause holds" clause; `validate.mjs` — the price sentence says "a slash" (a backslash does the same); `tests/validate.test.cjs`'s `--help` sweep misses "never fails" / "success" phrasings. | B01 and B05 C1 fix-up scoped re-reviews. |

## Checklist

- [x] Guard fixed in all eight tools (resolve both sides; a same-basename mismatch exits 2 loudly)
- [x] `tests/cli-entry.test.cjs`: domain enumerated from the checkout, live real-path control, directory link and file link per tool
- [x] [BL-036] git child env scrubbed in `git-evidence.mjs` (shared with `mutate.mjs`), CLI test with a decoy `GIT_DIR`
- [x] [BL-037] scrub inside `withDisposableCheckout`, API-level test
- [ ] [BL-041] the `--help` wording residuals and the sweep phrasings

## Acceptance criteria

1. Every `orchestrate/tools/*.mjs` CLI run through a symlinked directory, and through a
   symlinked file, prints exactly what it prints through the real path, with the same exit code.
2. The new test enumerates the tools directory from the checkout and FAILS on the base
   (`edd2f1e`) for each of the eight guarded tools.
3. A module whose entry check does not match while invoked under its own basename exits 2 with
   a one-line error; it never exits 0 silently.
4. `git-evidence.mjs` and `check-fence.mjs` ignore an inherited `GIT_DIR` / `GIT_INDEX_FILE`:
   the test's decoy repository never appears in their evidence, and the same test fails on base.
5. A direct caller of `withDisposableCheckout` (or `mutate()` / `runAtRef()`) with `GIT_DIR` set in
   `process.env` gets git lookups and validation steps that do not see it, and its own
   `process.env` is unchanged afterwards.
6. [BL-041] `mutate.mjs --help`'s no-pass cause says "a counted step" and its SURVIVED sentence
   carries KILLED's "no CRASHED cause holds" clause; `validate.mjs --help`'s price sentence names
   a backslash beside the slash; the `--help` sweep in `tests/validate.test.cjs` catches "never
   fails" and "success" phrasings.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

**You need**: nothing — every step is agent-run from the integration tip.

1. **Do**: from the checkout root, `ln -s "$PWD/orchestrate" ../c1-scratch/orch-link`, then for
   each `orchestrate/tools/*.mjs` that has a CLI run `node ../c1-scratch/orch-link/tools/<tool> --help`
   and the same through `orchestrate/tools/<tool>`. Reset: `rm ../c1-scratch/orch-link`.
   **Pass**: for every tool the two outputs and exit codes are identical and the output is
   non-empty.
   **Runner**: agent (CLI).
2. **Do**: `git clone <I-02 bundle> ../c1-scratch/decoy`, then run
   `GIT_DIR=../c1-scratch/decoy/.git node orchestrate/tools/git-evidence.mjs worktrees --repo .`.
   Reset: `rm -rf ../c1-scratch/decoy`.
   **Pass**: the JSON's worktree paths are this checkout's; the decoy's path appears nowhere.
   **Runner**: agent (CLI).
3. **Do** (the Windows laptop — the change's one human step): in a checkout of the integration
   branch at this build, run the README's PowerShell validation recipe from the repository root.
   **Pass**: it finishes without throwing; the totals read `ℹ fail 0` and `ℹ skipped 0` (the
   Windows-only cases, including `tests/cli-entry.test.cjs`'s junction case, ran and passed);
   `git diff --check` prints nothing.
   **Runner**: human (another OS — the build reaches the laptop only after you authorize pushing
   the integration branch, asked at the hand-over).
4. **Do**: [BL-041] `node orchestrate/tools/mutate.mjs --help | grep -c "a counted step"`.
   **Pass**: prints 1 or more, exit 0.
   **Runner**: agent (CLI).
