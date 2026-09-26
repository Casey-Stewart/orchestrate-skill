# Log — OS-20260925-slim-contract-pack

Append-only narrative for this change: reviewer arcs, root causes, reconciliations,
fence-extension reasoning, pre-smoke findings, in-run learnings. Written ONLY by the
orchestrator, ONLY on the integration branch, in the same commits as PROGRESS. Never read
at boot — a PROGRESS Notes cell or session-log row names the heading to read. One `##`
heading per session (date), one `###` per batch or event. Never edit an earlier entry.

## Learnings

- An agent definition written mid-session is "not found" at first and becomes spawnable a few
  minutes later, when the harness refreshes its agent list — not only at session start, as the
  conductor first assumed.
- One census prompt at two efforts is a cheap, informative control, but a single run per level is
  noisy, and max is not ground truth either: the pre-flight found a pin (`tests/git-contract.test.cjs:173`)
  that neither census listed for the batch that breaks it.

## 2026-09-25 — scaffold

### Environment and baseline

Linux workstation; Node v24.20.0; `pwsh` 7.6.5 at `/snap/bin/pwsh`. Base `edd2f1e` (main, clean
but for the untracked `Features.md`). Pinned skill directory `/home/timetotilt/.claude/skills/orchestrate`,
a real `git archive main orchestrate` copy made this session (it was a symlink until today; BL-028),
`SKILL 354f4dd29eedeb1ba2a2499e508c12b043f5014de08e7d8ee65ead3302b5d67f 23 files`, identical to the
clone's `orchestrate/`. Validation baseline through that copy's wrapper and `validate.json`:
`PASS tests 510/512, 2 skipped (23s)` — the two Windows-only cases. Worktree root
`/home/timetotilt/worktrees/os925/` (`/tmp` is tmpfs).

### Planning census

One Explore agent ran the fence census for the four batches (373K tokens, 61 tool calls,
7.2 min, session effort). The findings that reshaped the plan: `prompt.mjs:185-198` parses the
contract's `## Git model` and three other headings, so #14 keeps those fact lines and B01 never
needs B02's `prompt.mjs`; the Git model holds repo facts, not only procedure; the capped-verdict
table sits inside the session algorithm, but the SHA pin reads only `protocol.md`; the template
is the close-out carrier's only copy of "combined smoke script"; about ten test files read the
template, so B01 is L, not the S Features.md estimated.

### Control run (#15)

The user chose "Medium, same model" and "Run it now". Two temporary user-level definitions,
`census-control-medium` and `census-control-max`, identical but for `effort:`, received the same
census prompt (`tools: Read, Glob, Grep, Bash`). Results:

| setting | tokens | tool calls | time |
|---|---|---|---|
| medium | 225,719 | 51 | 5.6 min |
| max | 460,715 | 84 | 14.6 min |

Medium found every plan-shaping finding above, plus one the planning census missed
(`tests/tool-wiring.test.cjs:482` `UNDO` 'a pointer into the skill', which #14's natural wording
trips). Max found at least six material facts medium missed: the four-type pin at
`tests/subagent-type-mapping.test.cjs:174-184` (a new definition reddens it); `T:313`'s
"(§Fence changes)" pointer, which `prompt.mjs:197` pastes into every implementer prompt;
`tests/contract-prompt-authority.test.cjs:107-120` banning "read the file …"; the
`{{EXECUTION_MODEL}}` Where cell pinned at `tests/interview-sizing.test.cjs:277`; BL-037's second
production caller (`mutate.mjs:260`); `mutate.mjs:69-73,125-126` reaching the unscrubbed `git()`.
Two of those would each have cost a review round. Under the rule fixed before the run ("ships if
the control confirms medium, else it is dropped") the per-role effort clause was dropped; the
user confirmed at plan approval ("Drop it (Recommended)"). The two definitions were deleted after
the run; `~/.claude/agents/` holds only the four shipped definitions again. Every census finding
was folded into the batch files.

### Pre-flight

Reviewer (fresh, read-only): `PRE-FLIGHT 5 BLOCKING, 9 ADVISORY`. All fixed before approval:

1. `tests/git-contract.test.cjs:173` pins git-evidence's env behaviour that B02 changes, and the file
   was in B01's fence → moved to B02; BL-036's scope set to repository-location variables only
   (config injection stays surfaced, `:173` green unchanged); the CLI test lives there.
2. B01 deleted the manual procedures its own pin-mismatch fallback names → B01 note 7a: the
   mismatch branch is upgrade-on-words or restore-from-`**Skill source**` (new `{{SKILL_SOURCE}}`).
3. #15's "pre-flight at high" was neither built nor excluded → named exclusion (no per-spawn
   effort; the pre-flight spawns as `reviewer`).
4. B04's rules collided with the SHA-pinned recovery rows → the conductor's prose edit appends and
   ticks a `polish:` item; crash recovery keeps the path rule as a conservative fallback;
   `02-batch.md` and `tests/check-fence.test.cjs` joined B04's fence.
5. B02's size assertion vs B04's ninth tool → equality with the guarded set, lower bound 8.

Advisories applied: the entry helper lives in `git-evidence.mjs` and adds no check-fence
diagnostic code; `runSpec` gains an optional `env`; Windows file-link `EPERM` asserted, never
skipped; `tests/tool-wiring.test.cjs:439` named; every `prompt.mjs` parse anchor listed; the
classifier's mixed-diff line and the ledger-parse name sweep; B03's carriers enumerated; smoke
inputs made consistent (I-01 three commits, clone paths, resets, I-03 added); fold-in rows and
the exclusions added to the coverage audit.

### Backlog sweep

Accepted (plan approval): BL-041 → B02, BL-034 → B03, BL-042 → B04. Considered and rejected:
BL-030 (`pytest -q` needs `scaffolding.md`'s sentence changed, outside B02's fence); BL-045 and
BL-043 (their files are in B01, which is L); BL-029, BL-032, BL-033, BL-039, BL-040 (design or
behaviour changes, not one-line criteria); BL-031 (needs the user's decision); BL-038 (belongs to
the change that adds a parser).

## 2026-09-25 — continue (W1)

Boot: skill pin `SKILL MATCH 354f4dd…`; reconcile — rows ⬜, no batch branch (correct); tip
`40f8182` `PASS tests 510/512, 2 skipped (23s)`. W1 opened at `40f8182` (PROGRESS `b77b8ae`):
`chore/contract-slimming` → `/home/timetotilt/worktrees/os925/b01`, `fix/cli-entry-symlink` →
`b02`. Both implementers spawned concurrently on the default tier (session model Opus 5.5).

### B02 — gate, round 1

- Implementer DONE, nonce matched: `834a94e` (BL-028/036/037) + `665549f` (BL-041); 5/5 ticked;
  `PASS tests 532/534, 2 skipped` plain and under `FORCE_COLOR=1`.
- 6a `check-fence.mjs` (pinned copy): PASS, integration `b77b8ae`, batch `665549f`, merge base
  `40f8182`, violations [], unknowns [].
- 6b failing-on-base: the four changed test files on a detached `40f8182` worktree — 23 of 152
  fail. Every cli-entry per-tool case for all eight tools and the `ran` roll-call by
  AssertionError; git-contract `:179` (decoy CLI) by AssertionError; `:213` TypeError (new
  export); `:232` AssertionError; mutate `:666` throws `ref HEAD~1 names no commit` (base follows
  the decoy); the two BL-041 help pins by AssertionError. PROVEN.
- 6c reviewer (default tier) SHIP, P0=0 P1=0 ASK=2; test-hunter (default tier) FINDINGS 3, all
  test-only. Reviewer ASK 1 and hunter finding 2 are the same (`isMain`'s `!entry` branch), so
  the polish pass carries 4 unique ASKs → `R1 SHIP @665549f asks=4`, gate=3/0.

### B02 R1 reviewer findings
SHIP

1. orchestrate/tools/git-evidence.mjs:24 (`if (!entry) return false;`), with its missing case at tests/cli-entry.test.cjs:110
   - Violates the guardrail "a branch no input reaches". No test imports a tool while process.argv[1] is undefined. The line 110 case passes `no-such-entry.mjs`, so it reaches the realpath-throws path and never this one.
   - Proven by mutation: the skill's mutate.mjs ran on a disposable clone of 665549f with the full validate.json suite. `if (!entry) return true;` came back SURVIVED. The live kill control in the same run was `process.exit(2)` changed to `process.exit(0)`, and all 8 refusal tests KILLED it (log: scratchpad/b02-rev/mutate.log).
   - Failure scenario: under that mutation, `node --input-type=module -e "import('<tools>/check-fence.mjs')"` with no trailing argument runs the CLI body. It prints an UNKNOWN usage JSON and exits 2 instead of staying a silent library. The suite stays green.
   - Minimal fix: beside line 110, add the same `-e` run without the trailing argument, and assert `{ status: 0, stdout: '', stderr: '' }`.
   - Class: ASK.

2. tests/git-contract.test.cjs:207, `assert.ok(!r.stdout.includes(decoy.root), ...)`
   - Violates the guardrail "a guard whose verdict depends on the checkout rather than the code". stdout is JSON, and on Windows JSON escapes every backslash in a path. So the raw `decoy.root` can never appear there, even when the decoy's worktree path is in the evidence.
   - Failure scenario: on the C1 Windows run, a regression that lists the decoy's worktrees passes this line. The deepEqual on line 206 would still catch it, so there is no escape today, but the "appears nowhere" check has no effect on that platform.
   - Minimal fix: match against the escaped form, e.g. `!r.stdout.includes(JSON.stringify(decoy.root).slice(1, -1))`.
   - Class: ASK.

Hunk mapping (`git diff chore/slim-contract-pack-ledger...HEAD`, 13 files). Every hunk maps; none is unmapped.
- Checklist ticks in the batch file: exempt.
- Item 1 (BL-028): the guard swap to `isMain(import.meta.url)` in all eight tools, the unused `path`/`pathToFileURL` import removals, and `isMain` itself in git-evidence.mjs.
- Item 2: tests/cli-entry.test.cjs.
- Item 3 (BL-036): `localGitVars`/`repositoryEnv`/`git()` in git-evidence.mjs; mutate.mjs's `localGitVars` delegating back to it; the three new git-contract tests.
- Item 4 (BL-037): the `env` threading through `topLevel`/`gitIn`/`withDisposableCheckout`/`runLogged`/`mutate()`/`runAtRef()`; `runSpec`'s optional `env`; the `whereStep` hoist and the API test in mutate.test.cjs.
- Item 5 (BL-041): only in commit 665549f, whose message carries the id. It changes mutate/validate `--help`, HELP_DEFINITIONS and the assertion text, and the VERDICT regex plus 3 specimens. Each new alternative is the only one that catches its specimen.

Acceptance criteria, checked against the code:
- AC1: isMain resolves both sides with fs.realpathSync, the same JS realpath node uses for its main. Scratch probes all printed help, exit 0: a directory link, a file link, an extensionless link in a bin dir, a renamed link, a link to a link, a directory with a space and non-ASCII name, cwd through a link, and `--preserve-symlinks --preserve-symlinks-main`.
- AC2: the domain is readdir of tools, with GUARDED >= 8, `ran` set-equal to GUARDED, and a CLI_STATE partition for the libraries. The CRLF control is live: removing the normalization would redden it.
- AC3: the refusal is one stderr line and exit 2. It stays exit 2 with stderr closed (`2>&-`, checked).
- AC4: the scrub drops git's listed names minus `GIT_CONFIG*`, case-folded, with one choke point in `git()`. The pinned `:173` GIT_CONFIG_COUNT case is unchanged and green.
- AC5: `withDisposableCheckout` scrubs a copy and hands it to fn/runSpec; the test pins that `process.env` is unchanged.
- AC6: met.
- No new check-fence diagnostic code. `localGitVars` from a deleted cwd still works (checked). Every changed file is LF on both sides. `git diff --check` over the committed diff is clean.

Validation, through the pinned wrapper (a real file, not a link; live because it printed its line):
- plain: `PASS tests 532/534, 2 skipped (23s)`, exit 0.
- FORCE_COLOR=1: `PASS tests 532/534, 2 skipped (23s)`, exit 0.
- Compared with the 510/512 baseline, that is +22 tests: 18 in cli-entry, 3 in git-contract, 1 in mutate. Skipped is 2 as expected on Linux. No failing names.

Failing-on-base: consistent. scratchpad/b02-6b.log shows 152 tests, 23 fail. The failures are 16 cli-entry cases (both cases for each of the 8 tools), plus the `ran` test, git-contract ×3, mutate ×2 and validate ×1. That matches the diff exactly.
- Nuance: on base the directory-link assertion fails first, so the file-link and preserve-symlinks-main assertions are not reached there. By inspection, the file link would also fail on base. The preserve-main assertion would pass on base; it exists to kill a fix that resolves only argv[1].

Doc/comment sweeps: none is assigned to B02. BL-028's doc half is B01's (plan R3). The comments in the touched code match the new behaviour. One residual: the mutate.mjs:204 code comment still says "a step in which no test passed or failed". That is a comment, not the `--help` text BL-041 targets, so it is not raised.

The worktree is clean after every run, and the mutation clone under scratch was removed.

=== end of B02 R1 reviewer findings ===
### B02 R1 test-hunter findings
FINDINGS 3

Scope: `git diff chore/slim-contract-pack-ledger...HEAD` at 665549f — tests/cli-entry.test.cjs (new), tests/git-contract.test.cjs (+3 tests), tests/mutate.test.cjs (whereStep hoisted, +1 API test, HELP_DEFINITIONS), tests/validate.test.cjs (help sweep), against isMain/localGitVars/repositoryEnv/git() in git-evidence.mjs, the env threading in mutate.mjs/run-at-ref.mjs/validate.mjs, the eight guards, and the BL-041 wording.
Harness: installed mutate.mjs (a real directory, not a link), scoped spec b02-hunt/scoped-spec.json = validate.json's pwsh step narrowed to the four files; no setup.json exists. Both runs: `CONTROL PASS PASS tests 150/152, 2 skipped (23s)`. The 2 skips are validate.test.cjs's Windows-only bash tests (not batch-touched, cover no mutated line). Every SURVIVED below ran the same 152 test names with the same pass/skip glyphs as its control (diffed from the spec-reporter lines in the log); no test is reported under a file name.
Logs: b02-hunt/run-a.log (mutations-a.json), b02-hunt/run-b.log (mutations-b.json).

1. tests/mutate.test.cjs:666-668 ("a direct caller of withDisposableCheckout, mutate() or runAtRef() ...") — catalog: a guard that SAMPLES the domain it claims to sweep; NEW CLASS shape within it: the sampled plant is one a LOWER layer already neutralises, so the layer under test is removable. whereStep checks all 15 names git lists, but the plant is GIT_DIR + GIT_INDEX_FILE only — which git() drops itself (git-evidence.mjs:55-56) and which `git clone` ignores for its destination. The CLI test's full plant (:640-641) never reaches these lines because both CLIs pre-scrub process.env (mutate.mjs:344, run-at-ref.mjs:48). Three reverts of the batch's API threading stay green:
   - `SURVIVED m13-lookup-unscrubbed`: mutate.mjs:121-122 `topLevel(repo, env)` / `capture(top, ref, [], { env })` / `git(..., { env })` → `topLevel(repo)` / `capture(top, ref, [])` / `git(...)` (lookups then see injected GIT_CONFIG*).
   - `SURVIVED k11-clone-unscrubbed`: mutate.mjs:132 `'--', top, dir], env, log, 'clone');` → `'--', top, dir], process.env, log, 'clone');` (GIT_WORK_TREE, GIT_OBJECT_DIRECTORY, GIT_CONFIG* reach the clone).
   - `SURVIVED m9-api-scrub-location-only`: mutate.mjs:120 `const env = withoutLocalGitEnv(process.env);` → the location-only filter (repositoryEnv's semantics, inlined via listedGitVars) — a plausible confusion now that both scrubs exist; validate steps then inherit GIT_CONFIG, GIT_CONFIG_PARAMETERS, GIT_CONFIG_COUNT, which mutate.mjs:79-83 and :116-118 say are dropped for every caller.
   Add: plant every listed name in this API test, as :640-641 does (GIT_WORK_TREE at an existing path, GIT_OBJECT_DIRECTORY, GIT_CONFIG*), keeping the live `rev-parse HEAD` control on the GIT_DIR subset, and keep asserting `seen: []`, `where ok` and the AT/CONTROL lines. Expected to kill all three (predicted, not run: the test is not mine to edit). Test-only → ASK.

2. tests/cli-entry.test.cjs:110 (in the test at :94) — catalog: a branch no input reaches. `SURVIVED m1-no-entry-guard`: delete git-evidence.mjs:24 `  if (!entry) return false;`. The only entry-less case passes a trailing `no-such-entry.mjs`, so process.argv[1] is always set; no test in tests/ imports a tool with no argv[1] (the other `-e` spawns import data URLs or nothing). Without :24, `path.basename(undefined)` at :27 throws ERR_INVALID_ARG_TYPE, and since git-evidence.mjs's own guard (:420) calls isMain at load and every tool imports it, `node --input-type=module -e "import '<any tool>'"` with no trailing argument (or the REPL, or a module on stdin) crashes. Add beside :110: the same `assert.deepEqual(run(['--input-type=module', '-e', `import ${JSON.stringify(url)};`], tmp), { status: 0, stdout: '', stderr: '' })` with no trailing argument. Test-only → ASK.

3. tests/cli-entry.test.cjs:101-103 — catalog: SAMPLES (the control exercises the comfortable case). "refuses in one line" is asserted only with a temp path free of control characters. `SURVIVED m3-no-sanitize`: git-evidence.mjs:29 `` ${self}`.replace(/[\x00-\x1f\x7f]/g, '?') + '\n'); `` → `` ${self}` + '\n'); `` — an entry path holding a newline (legal off Windows) then splits the refusal. Add: off Windows, an own-name wrapper under a directory whose name holds `\n`, asserting `lines.slice(1)` is `['']` and the line carries `?`; on Windows assert the platform instead of t.skip (C1 requires `skipped 0`, as fileLink does). Test-only → ASK. Lowest risk.

Killed (non-vacuous): m2 `real === fs.realpathSync(self)` → `real === self` (by the --preserve-symlinks-main leg, cli-entry :84 — node does keep the link there); k4 loud branch → `return false`; k5 realpath try/catch removed (:110); k6 build-smoke-page back to an unresolved guard; k7 git() unscrubbed; k8 config names dropped too; k10 API env = `{ ...process.env }`; k12 runSpec ignores `env`; k14 "a slash" only; k15 "a step"; k16 empty list accepted; k17 SURVIVED clause dropped; k18 runLogged drops `env`; k19 mutate's localGitVars throws a plain Error. Read, not mutated: the domain test (:58-68; partition backed by CLI_STATE, lower bound 8), the `ran` roll-call (:114), the three git-contract tests (each has a live control: plant live, fake git answers), the validate sweep's new specimens (each owned by one new VERDICT alternative).

=== end of B02 R1 test-hunter findings ===
