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

### B02 — polish and integration

- Polish (same implementer, nonce matched) @`c780338`: 4 `polish:` lines ticked (the shared
  reviewer/hunter ASK on one line); test-only — `tests/cli-entry.test.cjs`,
  `tests/git-contract.test.cjs`, `tests/mutate.test.cjs` plus the batch file. The implementer's
  scratch mutations m1, m1b, m3, m13, k11, m9 all killed after the polish.
- Mechanical close: fence PASS (integration `acd1754`, batch `c780338`), worktree validation
  `PASS tests 532/534, 2 skipped (23s)`; no production path touched → no re-review.
- Integrated: `git merge-tree --write-tree` clean (`e010f81`), `--no-ff` merge `0090173`, tip
  `PASS tests 532/534, 2 skipped (23s)` → 🟢. Worktree `b02` removed.
- Carried to C1: the refusal test's Windows branch assumes Windows refuses a directory name
  holding a newline and accepts any error there — first exercised by the laptop step.

### B01 — gate, round 1

- Implementer DONE_WITH_CONCERNS, nonce matched: `95f8338`; 8/8 ticked; `PASS tests 513/515,
  2 skipped` plain and under `FORCE_COLOR=1`. Concerns: the moved-sentence test freezes
  protocol.md's wording of every moved sentence (B03's fence lacks `tests/protocol-contract.test.cjs`);
  the old template step 8 `<pre><code>` proofing sentence mapped to smoke-page.md; one clause
  added to protocol §Severity (mapped by the reviewer to item 1 — the template's step-6 sentence
  moved).
- 6a `check-fence.mjs`: PASS, integration `acd1754`, batch `95f8338`, merge base `40f8182`,
  violations [], unknowns []. 6b n/a (chore).
- 6c reviewer (strong tier, opus) SHIP, P0=0 P1=0 ASK=3; test-hunter (default tier) FINDINGS 5,
  all test-only. Reviewer ASK 1 = hunter F5 (the circular superset check). Reviewer ASK 3 needs
  no B01 change — the orchestrator carries it to W2 (B03 inserts rather than rewords moved
  protocol sentences, or reports `NEEDS_FENCE` for `tests/protocol-contract.test.cjs`, which
  passes §Fence changes' test trivially with B03 alone in its wave). Polish carries 6 unique
  ASKs → `R1 SHIP @95f8338 asks=6`, gate=5/0. Reviewer ASK 2 edits `orchestrate/SKILL.md`
  (skill source under this repo's conventions) → the polish close takes a fix-diff-only
  re-review by a fresh reviewer.

### B01 R1 reviewer findings
SHIP

Reviewed `git diff chore/slim-contract-pack-ledger...HEAD` in /home/timetotilt/worktrees/os925/b01, one commit (95f8338). I read every changed file in full.

**Findings**

1. **ASK** — tests/tool-wiring.test.cjs:376-383 and :441-442. Guardrail: a sweep built to catch reversals is blind to an edit that NARROWS its scope (AC5, "superset" half). The superset check is circular. `OLD_CLAIMS` is built by spreading `PRE_PIN_CLAIMS`, so `OLD_CLAIMS.some(p => p.source === source)` can only fail if someone deletes the spread line. Nothing ties `PRE_PIN_CLAIMS` to the family it replaced.
   *Scenario (probed on a scratch clone, anchor checked, control run 28/28 green):* narrow `PRE_PIN_CLAIMS[4]` from `(?:ledgers|a ledger)` to `ledgers`. tool-wiring.test.cjs stays 28/28 green, and "changes nothing about a ledger already scaffolded" is no longer banned anywhere.
   *Fix:* bind the family to the base the way `SLIM_BASE` does. Read `git show edd2f1e:tests/tool-wiring.test.cjs`, extract its `OLD_CLAIMS` regex sources, and `deepEqual` them with `PRE_PIN_CLAIMS`. Failing that, add a specimen for every alternation branch.
   (The sources are byte-identical to the base family today. I checked, so AC5 holds at this commit.)

2. **ASK** — orchestrate/SKILL.md:211-215. Guardrails: stale-copy contamination, and positive-only prose.
   - The problem: in Mode: continue, step 2 reads the pinned `references/protocol.md` beside the contract, and only step 3 verifies the pin. That is the reverse of the template's boot order: pin (3), then Procedure (4), then Reconcile (5). tests/tool-wiring.test.cjs pins the template's order.
   - *Scenario:* the installed skill is updated in place, then "continue". The conductor loads the changed protocol.md at step 2. At step 3 the pin check prints SKILL MISMATCH and the session stops. The user says "restore", and the session resumes with the newer procedure still in context.
   - *Fix:* move the clause into step 3, after the pin check: "on `SKILL MATCH`, its pinned `references/protocol.md` beside the contract".

3. **ASK** — tests/protocol-contract.test.cjs:108-247 (the implementer's concern 1, confirmed).
   - The problem: the moved-sentence test permanently freezes, against edd2f1e, the protocol.md wording of every sentence the template lost. Additions stay green; any rewording goes red unless someone adds a `REWORDED` entry.
   - *Scenario:* B03 (W2) puts its compaction rule into protocol.md §Session algorithm at wave close, and B03's fence lacks tests/protocol-contract.test.cjs. If it rewords step 8's "Otherwise: go to step 4 …" sentence instead of inserting beside it, the suite goes red and B03 bounces as NEEDS_FENCE.
   - *Fix:* none needed in B01. Tell B03 in its prompt to insert sentences rather than reword moved ones, or record `fence +tests/protocol-contract.test.cjs` for B03 up front. B03 is alone in W2, so that path is disjoint. B04's fence already has the file.

**Acceptance criteria, verified against the diff**
- AC1: the template no longer carries the helper block, §Fence changes, Complete checkpoint inputs, §Recovery, §Session algorithm (with the capped table), Delivery, Verdicts or the close-out procedure. The new test checks every sentence of the edd2f1e template by content: carried verbatim, or through a named `REWORDED`/`RETIRED` mapping whose carrier must exist. It has two live controls: a planted sentence, and a damaged protocol.md sentence. I also ran the same splitter over the OLD protocol.md. The 82 units it no longer carries verbatim are all replaced by the template's wording or by the pin rewrite; no fact is lost. Concern 2 checks out: the "read each `<pre><code>` block" rule is still at smoke-page.md:154-155, the file protocol.md:745 points to.
- AC2: both hashes and `normalize` are unchanged. The two decision tables in protocol.md are byte-identical to the base (row diff); only the file-table row and the legacy table changed.
- AC3: the new prompt.test.cjs case fills every template placeholder and renders every role through the unmodified prompt.mjs, each against the oracle. The implementer render names the integration branch and the setup. A fixture ledger built from it gets `PARSE OK 1 batches`. A control rewords the Git-model line and the render refuses with exit 2. `**Skill source**` does not match ledger-parse's pin filter `^\s*\*\*skill\*\*`.
- AC4: the registry test passes in both directions. `grep -rn "EVIDENCE_TOOL\|FENCE_TOOL" orchestrate/` returns nothing (exit 1).
- AC5: the old claims are gone from orchestrate/, README.md and CLAUDE.md, which the sweep now includes. Superset: see ASK 1.
- AC6: every `node … tools/…mjs` line in protocol.md and smoke-page.md now uses `node "<skill-dir>/tools/<tool>.mjs"`, and no `node orchestrate/tools` or `node tools/` lines remain. All 7 recipes still run as published, with `<skill-dir>` resolved to the checkout's `orchestrate/`. `KNOWN_TOOL_PATH_FAULTS` is held at `{}`.
- AC7: the template went from 63,095 to 15,295 bytes.
- AC8: the template's boot step 3, protocol.md step 1 and README's Rollout boundary each name the user's words, upgrade, and restore from `**Skill source**` with a byte-for-byte rebuild and a pin re-check. None names the old manual procedures. The PINNED rows and the new MISMATCH_CARRIERS test cover this; `UNDO` is unchanged and green.

**Validation (wrapper, pinned copy)**
- Plain run: `PASS tests 513/515, 2 skipped (23s)`, exit 0 (base 510/512). The 2 skips are the expected Windows-only cases.
- `FORCE_COLOR=1`: same result, exit 0.
- `git diff --check` over the batch range: clean.
- No file changed its line endings; every changed file is LF at both base and tip.
- Logs: /tmp/claude-1000/-home-timetotilt-projects-orchestrate-skill/30346af3-7332-4e1a-b96e-3cbe367061c2/scratchpad/b01-rev/validate-plain.log and validate-forcecolor.log.

**Hunk mapping.** Every hunk maps to a checklist item or note, so there is no scope creep:
- protocol.md's rewrites of its own concise text into the template's wording: item 1 ("move every sentence protocol.md lacks").
- The §Severity polish-pointer clause (concern 3): item 1, since it is the template's step-6 sentence moved, not new scope.
- The new "Full contract" legacy row: note 8.
- SKILL.md's check-fence "whenever the ledger's procedure names it": note 6. The old "when the contract enables it" would have gone false once the helper block left.
- contract-prompt-authority.test.cjs changes comments and messages only: item 6.

All note-6 census passages were rewritten in the same commit. The exceptions are protocol.md:424 and scaffolding.md:311-314, which are unchanged and still true. §-pointers in the template all resolve to protocol.md headings. Tools and `.claude/agents/` hold no pointer into the removed sections.

**Failing-on-base:** does not apply. This is a chore batch.

**Design observation (not a finding; note 7a prescribes it).** The pinned `{{SKILL_DIR}}` is normally the shared installed skill, so "restore" rewrites it for every ledger and scaffold. Other ledgers pinned to the newer hash then stop at their next boot. That is loud, not silent. With `{{SKILL_SOURCE}}` = `unknown` only upgrade remains. The mismatch question could say both; this is a candidate backlog entry.

=== end of B01 R1 reviewer findings ===
### B01 R1 test-hunter findings
FINDINGS 5

Worktree /home/timetotilt/worktrees/os925/b01 @ 95f8338. Harness: mutate.mjs on a scoped spec (the four test files the batch changed:
contract-prompt-authority, prompt, protocol-contract, tool-wiring; no setup.json exists). Log: scratchpad/b01-hunt/r1.log.
`CONTROL PASS PASS tests 62/62 (3s)`: 0 skipped, all four files' tests named. Every SURVIVED run ran the same 62 test names as the
control, all passing; no scoped file was reported under its own file name. Two live controls were KILLED (below), so the harness catches a real break.

**F1 (highest risk) — tests/protocol-contract.test.cjs:190-191 (REWORDED entry used by the test at :246), NEW CLASS (nearest: a guard that SAMPLES what it claims to sweep)**
The shape: a rewording-map entry claims a whole lost unit by its prefix, but its excerpt covers only the unit's tail. The unit starts
"a conflict → STOP AND INVESTIGATE … then git commit-tree <tree> -p <tip> -m trial, check that commit out in a temporary worktree …".
The excerpt starts at "a stale wt-trial …". So the trial-merge procedure, which now exists only in protocol.md, is unguarded.
Mutation m4, protocol.md:616: `then \`git commit-tree <tree> -p <tip> -m trial\`, check that` → `then merge the branch for real, check that`
(this merges before the trial validates) → `SURVIVED m4-trial-merge`.
Assertion to add: each excerpt must carry the whole unit apart from its placeholder slot. For example, split the lost unit at
`{{WORKTREE_SETUP}}` and require every side to be found in flat(protocol), or add the head as a second excerpt. The same check applies to every
REWORDED entry. Test-only → ASK.

**F2 — tests/tool-wiring.test.cjs:756-760 (with the REWORDED entry at tests/protocol-contract.test.cjs:192-193), catalog: rewrite of a guard not a superset of the old**
At edd2f1e, tests/tool-wiring.test.cjs:678 pinned protocol step 5's "a pasted prompt with no nonce line". The rewrite reads protocol.md, but its
needle stops at "…the manual procedure is a pasted prompt". The REWORDED excerpt covers only "the validation commands … the report shape".
Mutation m5, protocol.md:650: `   no nonce line, and every such prompt` → `   its nonce line, and every such prompt` → `SURVIVED m5-pasted-nonce`.
After this change the manual procedure hands out the nonce, which contradicts §Spawning rules.
Assertion to add: extend the :760 needle to `… is a pasted prompt with no nonce line` (collapsed). Test-only → ASK.

**F3 — tests/tool-wiring.test.cjs:185, :202, catalog: positive-only assertions on prose**
The new boot step 4 (**Procedure**) is held only by its position and by `steps[procedure].text.includes('protocol.md')`. PINNED covers step 3 and ends where step 4 starts.
Mutation m1, templates/00-READBEFORE.md:42: `… pinned directory, now governs` → `… pinned directory, never governs` → `SURVIVED m1-boot-procedure`.
Assertion to add: pin step 4 verbatim, as a PINNED entry `[TEMPLATE, '4. **Procedure**', '\n5. **Reconcile**', …]`, bumping the PINNED length. Test-only → ASK.

**F4 — tests/tool-wiring.test.cjs:442-445, :447-456 (README carrier), catalog: positive-only assertions on prose**
PINNED holds the template and protocol.md carriers by equality. The README carrier is checked only for the presence of single words
(/\bwords\b/, /upgrade/, /restore/, …).
Mutation m2, README.md:110: `Your recorded words then pick one of two ways on:` → `The session then picks one of two ways on by itself, no words needed:`
→ `SURVIVED m2-readme-words`.
Assertion to add: pin README's Rollout-boundary mismatch sentences by equality (a PINNED entry from `- **Rollout boundary.**` to
`## Install`). Test-only → ASK.

**F5 (lowest) — tests/tool-wiring.test.cjs:372-379, :425-426, catalog: "delete a member and both sides shrink" (both sides built from one literal)**
The superset check compares PRE_PIN_CLAIMS with OLD_CLAIMS. OLD_CLAIMS is built by spreading PRE_PIN_CLAIMS, so the check can fail only if
that spread is removed. Editing the "old" family narrows both sides at once.
Mutation m3, tests/tool-wiring.test.cjs:373: `\bnever\s+references?\s+(?:this|the)\s+skill\b` → `\bnever\s+references\s+this\s+skill\b` → `SURVIVED m3-prepin-narrowed`.
(After this change "never reference the skill" is no longer banned.)
Assertion to add: read the old family from the checkout (`git show edd2f1e:tests/tool-wiring.test.cjs`, OLD_CLAIMS sources, the way
SLIM_BASE reads the template), assert it is non-empty, and require every source it contains among OLD_CLAIMS. Test-only → ASK.

Checked, not findings:
- Live controls KILLED: c1 deleted a moved sentence from protocol.md (`KILLED c1-moved-sentence: every sentence the slimmed template dropped is carried by protocol.md`).
  c2 changed the shipment passage's "does not" (`KILLED c2-shipment-does-not: Recovery and capped-verdict tables …, every sentence …`).
- tests/protocol-contract.test.cjs:356 `protocol.includes('does not')` cannot fail: the phrase occurs 8 times in protocol.md. Its intended subject is covered by
  the SHIPMENT_PASSAGE pin (c2 KILLED), so it is redundant rather than a hole. Deleting it loses nothing.
- Classifier sweep: in memory I found 538 base units. 132 are kept in the template and 362 are carried by protocol.md; every carried unit that only B01 added
  matches exactly once, so deleting any of them reddens. I read each of the 44 REWORDED and RETIRED claims: F1 and F2 are the claims whose uncovered head carries a rule
  that exists only once; the other partial ones restate text protocol.md states elsewhere. The table SHA pins and count==1 were checked; the template's
  absence of the tables, the close-out, the step-5/6/6a copies and the LOG commands was checked; the placeholder retirement sweep was checked; the 7 recipes executed; the
  INVOCATION form in protocol.md and smoke-page.md was checked; KNOWN_TOOL_PATH_FAULTS is held at {}; PINNED step 3, protocol step 1 and the baking rule were checked; and the Skill-source line position was checked.
  The Skill-source line position is proven by the real parser: skillPin matches `**skill**` only.
- tests/prompt.test.cjs:239 is sound: every role's render is compared against the oracle, with a reworded Integration-branch control. Its parse half never reads
  00-READBEFORE.md (check-ledger.mjs:128-133 parses the plan, PROGRESS and batch files), so criterion 3's parse half does not depend on the
  contract template. It is carried by the 01-plan and PROGRESS templates.
- Outside the per-test question, and not counted: no test asserts note 7's precedence rule. Mutation m6, protocol.md:4:
  `contract file outranks this document` → `contract file is outranked by this document` → `SURVIVED m6-precedence`. The template preamble
  (00-READBEFORE.md:9-11) is likewise unasserted.

=== end of B01 R1 test-hunter findings ===

### B01 — polish and integration

- Polish (same implementer, nonce matched) @`bb56dc7`: 7 `polish:` lines ticked (15/15);
  touched `orchestrate/SKILL.md` (reviewer ASK 2 — protocol.md taken up only on `SKILL MATCH`),
  `tests/tool-wiring.test.cjs`, `tests/protocol-contract.test.cjs` and the batch file. The
  implementer replayed all 8 surviving R1 mutations against the polished guards: all killed.
  Not done (not an ASK): hunter's uncounted m6 — nothing asserts note 7's precedence rule.
- Mechanical close: fence PASS (integration `4318ac0`, batch `bb56dc7`), worktree validation
  `PASS tests 513/515, 2 skipped (23s)`. `SKILL.md` is skill source → fix-diff-only re-review.
- R2 scoped polish re-review (fresh, strong tier opus): SHIP, P0=0 P1=0 ASK=1 — every R1 finding
  FIX VERIFIED by mutation; the one new ASK (the Mode-continue pin-order assertion governs only
  the spelling `references/protocol.md`) is polish-phase and closes as a residual for
  `BACKLOG.md` at close-out, as OS-20260923 did with its second scoped re-review's residuals.
- Integrated: `git merge-tree --write-tree` clean (`33782b6`), `--no-ff` merge `613c608` (on top
  of B02's `0090173`), tip `PASS tests 535/537, 2 skipped (23s)` → 🟢. Worktree `b01` removed.
- Residuals for `BACKLOG.md` at close-out: the R2 ASK above; `red → no merge` in the moved
  procedure is matched only inside the SHA-pinned capped table, so "red → merge anyway" survives
  (pre-existing at `edd2f1e`); note 7's precedence rule and the template preamble unasserted
  (hunter m6); "restore" rewrites the shared installed skill, stopping other ledgers pinned to
  the newer hash (reviewer R1 design observation); protocol.md §Complete checkpoint inputs names
  clone-relative `tests/fixtures/smoke-inputs/*.py` (implementer, pre-existing).

### B01 R2 reviewer findings
SHIP

Scoped re-review (fix-diff-only) of `git diff 95f8338..HEAD` in /home/timetotilt/worktrees/os925/b01, one polish commit (bb56dc7) over 4 files: the batch file, orchestrate/SKILL.md, tests/protocol-contract.test.cjs and tests/tool-wiring.test.cjs.

**Findings**

1. **ASK** — tests/tool-wiring.test.cjs:225. Guardrail: a guard that SAMPLES its domain (here, one spelling of "the pinned protocol.md").
   - The problem: the new "not before the pin check" assertion is `cont.indexOf('references/protocol.md') > pinAt`, so it governs only the spelling `references/protocol.md`.
   - *Scenario (probed on a scratch clone):* SKILL.md step 2 gains "— for a pinned contract, beside its pinned skill directory's protocol.md, the procedure its repo facts plug into". That puts back exactly the pre-pin read that R1 ASK 2 removed, spelled without `references/`. The full suite stays green: `SURVIVED r1-skill-step2-bare pass=513 fail=0`.
   - *Fix:* bound every `protocol.md` before `pinAt` instead of one spelling. For example, `assert.equal(cont.slice(0, pinAt).split('protocol.md').length - 1, 2)`: the two expected occurrences are the "legacy names per protocol.md" clause and the "contract absent → protocol.md fills the gaps" clause. Alternatively, pin steps 1-2 of Mode: continue verbatim in `PINNED`.

**R1 findings, each re-verified with a mutation on a scratch clone at bb56dc7 (anchors checked, unmutated control 42/42 green)**
- R1 reviewer ASK 1 = hunter F5 (superset check was circular): **FIX VERIFIED**.
  - `baseFamily()` reads the `OLD_CLAIMS` literal from `git show edd2f1e:tests/tool-wiring.test.cjs` and pins 6 entries. It then `deepEqual`s their sources with `PRE_PIN_CLAIMS` and requires each source and its flags to be in `OLD_CLAIMS`.
  - The parse matches the base literal: six lines, each `/…/i,`.
  - m3 (narrow `references?`/`(?:this|the)`) was KILLED, and so was m3b (narrow `(?:ledgers|a ledger)` to `ledgers`).
- R1 reviewer ASK 2 (SKILL.md read protocol.md before the pin): **FIX VERIFIED**.
  - Step 2 no longer names the pinned protocol.md. Step 3 takes it up "only on `SKILL MATCH`", which agrees with protocol.md:566-567 ("then governs").
  - Reverting the hunk was KILLED ("the boot sequence verifies the pin…"). The residual is Finding 1.
- R1 reviewer ASK 3 (moved-sentence test freezes wording): **FIX VERIFIED**. As scoped, B01 owed only a comment. It has the comment (protocol-contract.test.cjs:107-110) and a failure-message hint. Telling B03 to insert rather than reword, or recording its fence extension, is still the orchestrator's job.
- Hunter F1 (trial-merge head unguarded): **FIX VERIFIED**. The excerpt now spans the whole unit, from "a conflict →" through "(skip only if n/a)", and matches protocol.md:615-619. m4 (`git commit-tree … -m trial` → "merge the branch for real") was KILLED.
- Hunter F2 (nonce-free pasted prompt): **FIX VERIFIED**. Both the :793 needle and the REWORDED excerpt carry "with no nonce line". m5 was KILLED by two tests.
- Hunter F3 (boot step 4 unpinned): **FIX VERIFIED**. There is a verbatim PINNED entry, with its planted-sentence control. m1 ("now governs" → "never governs") was KILLED.
- Hunter F4 (README carrier held by single words): **FIX VERIFIED**. There is a verbatim PINNED entry from `- **Rollout boundary.**` to `## Install`, with PINNED.length raised to 7. m2 was KILLED.

**Hunk mapping.** Every hunk maps to an R1 item, so there is no scope creep:
- The batch file: `polish:` lines only (exempt).
- SKILL.md: ASK 2.
- protocol-contract.test.cjs: the comment and message are ASK 3; the two REWORDED entries are F1 and F2.
- tool-wiring.test.cjs: the Mode-continue assertions are ASK 2, `baseFamily` is ASK 1/F5, the PINNED entries and count are F3/F4, and the step-5 needle is F2.

The SKILL.md hunk is a faithful prose fix. It moves the existing clause from step 2 into step 3 and adds "only on `SKILL MATCH`". No other behaviour changes, and no other document claims a pre-pin read (swept orchestrate/, README.md and CLAUDE.md). It is the same commit as its test.

**Acceptance criteria.** The polish touches no production file other than SKILL.md, so AC1-AC8 stand as verified in R1. They are re-confirmed by the green suite. The SHA pins are untouched: the diff has no hunk near them.

**Validation (wrapper, pinned copy)**
- Plain run: `PASS tests 513/515, 2 skipped (23s)`, exit 0. The 2 skips are the expected Windows-only cases.
- `FORCE_COLOR=1`: same result, exit 0.
- `git diff --check`: clean, both for 95f8338..HEAD and for the batch range.
- All 4 changed files are LF at both ends; none changed its line endings.
- Logs: /tmp/claude-1000/-home-timetotilt-projects-orchestrate-skill/30346af3-7332-4e1a-b96e-3cbe367061c2/scratchpad/b01-rev2/validate-plain.log and validate-forcecolor.log. Mutation logs are mutations-1.log, mutations-2.log and mutations-3.log in the same directory.

**Failing-on-base:** does not apply. This is a chore batch.

**Mutations that still pass the re-pointed tests**
- Finding 1 above.
- The PINNED entries and the family binding: none short of editing their constants.

**Not counted: an observation outside the fix diff.** protocol.md:620 "red → no merge" → "red → merge anyway" survives the full suite (513/0).
- Why: the moved-sentence test matches the short unit "red → no merge" inside the SHA-pinned capped-verdict table.
- The same mutation also survived at edd2f1e (510/0), so this is not a regression from B01.
- A census with the test's own splitter finds only 4 multi-matched units: `red → no merge`, `not a round`, `7` and a table separator. `not a round` was still KILLED through its context.
- The fix would be an occurrence-count check (occurrences in flat T plus flat P ≥ occurrences in flat base). That is a candidate for a later test-hardening item.

**Not counted: upgrade path.** Under upgrade, the carriers never re-run the pin check, while SKILL.md takes up protocol.md "only on SKILL MATCH". After the pin line is rewritten, a re-run prints SKILL MATCH, so this costs one extra command and produces no wrong outcome.

=== end of B01 R2 reviewer findings ===

## 2026-09-26 — continue (W2)

W2 opened at `6d2492b` (PROGRESS `682dc4f`): `feat/budget-rules` → `/home/timetotilt/worktrees/os925/b03`;
implementer spawned on the default tier.

### B03 — gate, round 1

- Implementer DONE, nonce matched: `0102b2a` (feature) + `9863cc5` (BL-034); 6/6 ticked;
  `PASS tests 541/543, 2 skipped` plain and under `FORCE_COLOR=1`; additions only — no moved
  protocol.md sentence reworded, so no `NEEDS_FENCE` for `tests/protocol-contract.test.cjs`.
- 6a `check-fence.mjs`: PASS, integration `682dc4f`, batch `9863cc5`, merge base `6d2492b`,
  violations [], unknowns []. 6b n/a (feature).
- 6c combined reviewer+gate pass (S weight, default tier): SHIP, P0=0 P1=0 ASK=2 — the POLL sweep
  misses "wait/check until a sub-agent lands" (two proven survivors); the BOUND_WORDS guard makes
  "effort"/"explore" false rejections across code and HTML (a README "however much effort" line
  reddens it). Orchestrator direction for the polish: ASK 2 takes the reviewer's option (a) —
  narrow the effort/explore families and POLL's poll/sleep to the `.md` files under `orchestrate/`
  plus README, assert the narrowed domain is a superset of the carriers — so B04 does not inherit
  the trap. → `R1 SHIP @9863cc5 asks=2`.
- Residuals for `BACKLOG.md` (reviewer, not blocking): the compaction STOP does not say what it
  asks of the user (`/compact`, or `continue` in a fresh session); the "after any compaction"
  duty lives only in step 8, so a conductor auto-compacted mid-wave meets it only on re-reading
  protocol.md.

### B03 R1 reviewer findings
SHIP

Findings

1. tests/tool-wiring.test.cjs:1685-1693 (POLL, the polling sweep): positive-only assertions on prose / a guard that samples its domain. ASK.
   Scenario: I added "Before ending a turn, wait until every implementer of the wave has reported." to protocol.md step 6, or changed SKILL.md Mode continue to "spawn ALL of the wave's implementers concurrently, then check each one's output until it lands". Either one reverses the rule "when the only remaining work waits on sub-agents it ends the turn", and the full suite stays green. mutate.mjs on a disposable clone of 9863cc5 against the ledger's validate.json: `SURVIVED poll-wait-protocol`, `SURVIVED poll-check-until-skill`.
   The five families catch the words poll, sleep, ReadNotifications, "keep checking" and "check … every N / periodically", but not the plainest ways to say it: wait or check UNTIL a sub-agent lands, or hold the turn rather than end it.
   Fix: add one owned family for holding the turn on a sub-agent. For example, a wait/check/look verb, "until", and an agent noun (implementer|reviewer|sub-agent|agent|wave) in the same clause, plus "before/instead of/rather than ending the turn". Give it a specimen and add both survivors above to the planted list. Keep smoke-page-template.html:1425 ("A page update is waiting until you finish editing this note.") as a must-pass control, because a verb+until pattern with no agent noun would reject it.

2. tests/tool-wiring.test.cjs:1650-1656 (BOUND_WORDS) with 1657-1683: a disproportionate guard. It turns ordinary words into false rejections. ASK.
   Scenario: B04 (wave 3) owns README.md, SKILL.md, protocol.md and execution-models.md and adds orchestrate/tools/prose-only-diff.mjs. If it writes "effort", "explore", "thorough" or "compact" anywhere in that tree, including a code comment such as "best-effort", the test goes red with the message "states the rule again or contradicts it". Proven: README "a change too big for one session, however much effort it gets." gives `KILLED readme-effort-word: each budget rule's key word appears nowhere but inside its pinned carriers`. The POLL sweep has the same reach: a future "poll"/"sleep" in a .mjs or in the smoke page's JS would be read as a conductor directive.
   Judgement (orchestrator question 1): the domain really is the enumerated directory. documents() walks orchestrate/ recursively, every file type, plus README, and each word is armed with a plant just outside every passage. The guard is proportionate for `ReadNotifications`, a tool name. It is tolerable for compact/thorough in prose. For "effort" and "explore" across code and HTML it is a false-rejection trap. The failure is loud and local, and B04 owns this test file, so B04 can recover in-fence, but only by editing B03's guard.
   Fix (either): (a) limit the "effort" and "explore" families (and POLL's sleep/poll) to the .md files under orchestrate/ plus README, where conductor directives live. Keep ReadNotifications/compact/thorough on the whole tree. State the narrowing in the comment and assert the new domain is a superset of the carriers. (b) Keep the guard as is and have B04's prompt name it: which words, and that a hit means rewording or a deliberate BOUND_WORDS edit.

Hunk map: every hunk is mapped. The batch file has ticks only (exempt). qa-runner.md is item 5 [BL-034]. SKILL.md: cadence + no-poll is items 1 and 4; explore is item 2. protocol.md: Orchestrator bullet is item 1; step 8 + Session practices is item 4. scaffolding.md: Precondition 4 is item 3; Plan step is item 2. The execution-models.md step-5 qualifier is item 4: without it, "open the next wave immediately, same session" contradicts the new early stop. The tool-wiring.test.cjs append is item 6, plus AC5 (tier-key test), item 1 (UNDO guard) and item 5 (BL-034 sweep). No scope creep.

Acceptance criteria, checked against the diff:
- AC1 met. The rule is at protocol.md:50-52 and SKILL.md:157-159. Smoke 1 has two hits, both the rule. My grep for wait…until / ending-the-turn across orchestrate/ and README finds no directive to poll.
- AC2 met. The rule sits inside step 8 (wave close), and the step-8 test holds that position: `KILLED compaction-out-of-step8`. It re-asks "a merge, push or third-round authorization that exists only in a summary".
- AC3 met at SKILL.md:190 and scaffolding.md:22.
- AC4 met: scaffolding.md:13-15 Precondition 4 ends "Never change the setting yourself."
- AC5 met. The protocol.md hunks are at :47 and :723 only, so neither SHA-pinned table moved, and protocol-contract is green. Smoke 2 exits 1.
- AC6 met. Smoke 3 exits 1, and the directive to keep Write and Edit stands (pinned whole).
- Doc sweeps: BL-034 is its own commit, 9863cc5, carrying the id with its pin and sweep. The feature commit 0102b2a carries the rule pins and sweeps.

Validation (wrapper, worktree root):
- Plain: `PASS tests 541/543, 2 skipped (23s)`, exit 0.
- FORCE_COLOR=1: `PASS tests 541/543, 2 skipped (23s)`, exit 0.
- The 2 skipped are the expected Windows-only pair. git diff --check is clean, the EOL is LF as before, and there are no emptied code spans.
- Logs are in the session scratchpad at b03-rev/validate-plain.log and validate-forcecolor.log, and mutate.log with muts.json.
- Live control: the mutate run's own CONTROL PASS, and 4 of 6 mutations KILLED.

Guardrails:
- effort: key: TIER_KEY is key-presence, so values inside, above (999999, ultra) and below (0, -1, none) all reject. Missing or unclosed frontmatter is rejected on doubt, and `effort-frontmatter` is KILLED. Alone it is not "stricter than the loader": `? effort` / `: max` and `"\x65ffort": max` pass tierKeyFaults. But agent-definitions.test.cjs parses every line of the four definitions as a strict `key: value` and whitelists the directory, so at suite level both are rejected.
- Agents directory: it is walked recursively, dotted directories included, and the walk has a depth control.
- UNDO: it is byte-identical to edd2f1e in all three regions and has 17 entries. The new guard is live: `KILLED undo-narrowed` (dropping "completion" from one entry, which the old sweep alone let through).

Mutations each new test survives:
- Pins, key-word exclusivity and POLL: both proven survivors above.
- Tier-key test: none at suite level for frontmatter.
- BL-034 sweep: "Neither the reviewer nor the test hunter carries Write." placed outside qa-runner.md (by inspection: no verb in its list, no "unlike").
- UNDO guard: n/a for production, since it reads only the test file.

Orchestrator question 2 (compaction wording): the rule is actionable. A Claude Code conductor has no way to run /compact, but "ends the session" is always available and the text makes it an early STOP. The "after any compaction, an automatic one included" half covers the compaction branch whichever way it happens. The rule does not say what the STOP asks of the user (/compact, or `continue` in a fresh session). That is a production wording change, it follows the spec's verbatim text, and it is not blocking; worth a backlog line. Related: the "after any compaction" duty lives only in step 8, so a conductor auto-compacted mid-wave meets it only on re-reading protocol.md.

Orchestrator question 3: yes, the implementer re-derived the pointers. At the ledger base the carriers were SKILL.md:186 and scaffolding.md:19, and UNDO was at 581-668. The implementer anchored every pin and region by text, not by the batch file's stale :180 / :465-483. The only stale numbers left are in the checklist tick text, which is exempt.

=== end of B03 R1 reviewer findings ===

### B03 — polish and integration

- Polish (same implementer, nonce matched) @`62f4be5`: 2 `polish:` lines ticked (8/8); test-only —
  `tests/tool-wiring.test.cjs` plus the batch file. POLL gains the "holding the turn on a
  sub-agent" family (both R1 survivors now killed); effort/explore and poll/sleep read only the
  `.md` prose domain (option (a)), narrowed sets pinned, superset of carriers asserted. The
  implementer's proofs: kill set 6/6 killed, false-rejection set 2/2 survived as intended, the
  original 19 mutations still killed.
- Mechanical close: fence PASS (integration `547e701`, batch `62f4be5`), worktree validation
  `PASS tests 541/543, 2 skipped (23s)`; no production path touched → no re-review.
- Integrated: `git merge-tree --write-tree` clean (`27da8d6`), `--no-ff` merge `66ce0f5`, tip
  `PASS tests 541/543, 2 skipped (23s)` → 🟢. Worktree `b03` removed. W2 closed, no checkpoint.
- For B04: `tests/tool-wiring.test.cjs` now fails on "ReadNotifications", "compact" or "thorough"
  anywhere under `orchestrate/` (code included) outside the pinned passages, and on
  "effort"/"explore"/"poll"/"sleep" in any `.md` there or README outside them.
