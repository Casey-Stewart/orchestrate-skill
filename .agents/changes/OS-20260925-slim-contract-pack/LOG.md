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

## 2026-09-26 — continue (W3)

W3 opened at `739c92b` (PROGRESS `3576c04`): `feat/prose-polish` → `/home/timetotilt/worktrees/os925/b04`;
implementer spawned on the default tier.

### B04 — gate, round 1

- Implementer DONE, nonce matched: `f454aaa` (feature), `dcbdb4a` (BL-042), `101e072` (test),
  `f444ef4` (refactor); 8/8 ticked; `PASS tests 559/561, 2 skipped` plain and under
  `FORCE_COLOR=1`.
- 6a `check-fence.mjs`: PASS, integration `3576c04`, batch `f444ef4`, merge base `739c92b`,
  violations [], unknowns []. 6b n/a (feature).
- 6c reviewer (default tier) FIX FIRST, P0=1 P1=2 ASK=1 — F1 P0: a private name spelled like a
  keyword (`this.#default / …`) or a keyword after `...` makes the tokenizer read division as a
  regex and strip live code, so a real code change prints `PROSE-ONLY` (reproduced through the
  published CLI on real commits); F2 P1: `<` in a doubt position (after `}`/`yield`/`await`/`of`)
  is read as less-than, so JSX text reads as a comment; F3 P1: the directive list is a sample —
  `node:coverage`, `$FlowFixMe`, `tslint:`, `NOSONAR` edits read `PROSE-ONLY`; F4 ASK: the
  `git diff output this tool cannot read` branch has no fixture. Test-hunter (default tier)
  FINDINGS 8 — #1 P1 = reviewer F2 (proven independently, `SURVIVED t9-jsx-doubt-refused`);
  #2–#8 test-only ASKs (template-literal escape, reversal sweeps for the classifier and comment
  rules, the escaped-quote tight case, the keyword sets derived from the code under test, the
  prefix/postfix and file-start branches, `another` in the one-strike after-list, the base-side
  scan label). → `R1 FIX FIRST @f444ef4` (round 1 of 2), gate=8/1.

### B04 R1 reviewer findings
FIX FIRST

F1. orchestrate/tools/prose-only-diff.mjs:141 (with :44, :52). Violates AC1, the feature's "fails closed on any doubt inside a string, regex or template literal", and the guardrail "a hand-rolled parse more permissive than the real consumer's". A word's `property` flag is set only after `.` or `?.`. Two cases slip through. First, a private name spelled like a keyword (`#default`, `#in`, `#return`, `#new`, `#delete`, `#typeof`: legal names) is read as an operand keyword. Second, a keyword right after a spread `...` is read as a property, because `...` is tokenised as three `.` tokens. So the tool decides regex or division with certainty and gets it wrong, and real code is then stripped as a comment.
  Scenario, run through the CLI as published on real commits (scratch repo b04-rev/repo2): `lib/meter.mjs` line `return this.#default / pick('/') + pick('//x');` changed to `pick('//xxxxxx')`. The tool reads `/ pick('/` as a regex, `') + pick('` as a string and `//x');` as a comment. It prints `PROSE-ONLY 1 file(s)` with exit 0, but at runtime `half()` goes from 11 to 16. The live controls in the same harness read correctly: a plain code change gives CODE (exit 1) and a plain comment change gives PROSE-ONLY (exit 0). Also PROSE-ONLY through compareSources: `this?.#in / f('/') + f('//a')` changed to `//abc`, and `[...typeof /[//]a/].length` changed to `.length + 1`.
  The corpus misses this because it sits inside the tool's own bound: the boundary leads at tests/prose-only-diff.test.cjs:187 exercise only `.` and `?.`.
  Fix: treat a word after `#` as a name. Emit `...` as one punct token, so a word after it is not a property. Add a RULES pair with a twin for each case.
  Class: P0

F2. orchestrate/tools/prose-only-diff.mjs:123. Violates `--help` (:260, "JSX … UNKNOWN") and the applicable guardrail "prefer rejecting on doubt". A `<` is refused only when `expressionStarts(prev) === true`. In a doubt position (after `}`, `yield`, `await` or `of`) it is read as less-than, so JSX text beginning with `//` becomes a "comment".
  Scenario, a `.js` file with JSX (a common React layout): `function* L(xs) { for (const x of xs) yield <li>//{x.a}</li>; }` changed to `{x.b}` gives PROSE-ONLY. `if (a) { b(); }` followed by `<p>//{a.x}</p>;` changed to `{a.y}` also gives PROSE-ONLY. The control, `return <li>//{xs[0]}</li>`, correctly gives UNKNOWN.
  Fix: refuse when `expressionStarts(prev) !== false`, the same treatment the `/` branch gives doubt. Add a fixture and twin.
  Class: P1

F3. orchestrate/tools/prose-only-diff.mjs:18-32 (DIRECTIVES). Violates AC2 ("a tool-directive … comment edit is never PROSE-ONLY") and the corpus-inside-the-pattern's-bound guardrail. DIRECTIVE_COMMENTS (test :196) holds exactly one comment per listed pattern, so it can never contain a directive the list lacks.
  Scenario: `/* node:coverage ignore next */` changed to `/* node:coverage ignore next 3 */` above a branch gives PROSE-ONLY. This is Node's built-in test-runner coverage directive, the same kind as `c8`/`v8`/`istanbul`, which the tool keeps; the `c8` control correctly gives CODE. `keptBy` returns `[]` for it. It also returns `[]` for `// $FlowFixMe[...]`, `// tslint:disable-next-line` and `// NOSONAR`.
  Fix: add `node:coverage` at minimum, each with an owned real-world corpus comment. Better, add a structural family such as `<tool>:(disable|enable|ignore)` / `-ignore` / `$Flow…`, so the list stops being a sample.
  Class: P1

F4. tests/prose-only-diff.test.cjs (branch at prose-only-diff.mjs:229), implementer note 1. A branch no input reaches: `UNKNOWN git diff output this tool cannot read` has no fixture through `proseOnlyDiff`/the CLI. `rawChanges`' throws are tested only directly, and no test asserts that line (grep), so a mutation of the catch body to a PROSE-ONLY return would go unnoticed. This is by reading; I ran no mutation. Real git with these flags should never reach it, and deleting the catch would still end at UNKNOWN exit 2 via the uncaughtException handler.
  Fix: a fixture passing `proseOnlyDiff({ ..., env })` with PATH pointing at a shim `git` that delegates every command except `diff`, which prints an unreadable record. Otherwise, name the branch as defensive-only in the test file.
  Class: ASK

Hunk mapping: every hunk maps. Batch-file ticks are exempt. implementer.md and the RULES sentence map to item 4. reviewer.md, protocol §Severity bullet and the skeleton classes map to item 5 (BL-044). The protocol polish paragraph, execution-models, and the scoped re-review and polish block map to items 3 and 6. 02-batch.md with its ticked example and the check-fence test rewrite map to item 6. The protocol-contract REWORDED→RETIRED moves are forced by the retired sentences (item 3). NON_MARKDOWN at 12 and the README tree map to item 7. The tool-wiring POLISH_RULES/POLISH_REVERSALS pins guard items 3–5; the BL-042 comment and test map to item 8 in their own commit (dcbdb4a). No scope creep.

Acceptance criteria:
- AC1: fails (F1).
- AC2: fails for unlisted directives (F3); all five named ones plus the implementer's seven hold.
- AC3: holds. protocol.md states one strike, the prose ASK carrying its replacement text, and the contract-prose exception. No shipped document keeps the SECOND rule. The only surviving copies are this ledger's own scaffold-time 00-READBEFORE.md:849-852, which is the ledger's contract and not in the fence, and archived ledgers.
- AC4: holds. §Severity, the skeleton classes and reviewer.md all state it; no out-of-fence passage lowers severity (§Fence changes, the hunter census and the implementer lines only route).
- AC5: holds. The protocol.md hunks stop at :148, the recovery and capped tables are untouched, and the SHA pins are green. REINSTATE (:812-845) and WRITE_LICENCES (:891-996) are byte-unchanged, so their families equal the base's, and the new prose passes both.
- AC6: holds. The pointer names 'shell steps run the script as one argument and propagate its exit code', which exists at validate.test.cjs:789. Smoke step 3 (`grep -n "validate.test.cjs:[0-9]" tests/tool-wiring.test.cjs`) prints nothing and exits 1.

Validation (wrapper, from the worktree root): `PASS tests 559/561, 2 skipped (23s)` exit 0. The same under FORCE_COLOR=1: `PASS tests 559/561, 2 skipped (23s)` exit 0. The two skips are the expected Windows-only ones. `git diff --check` on the three-dot diff is clean.

Implementer notes:
1. See F4.
2. Consistent with the pinned rows, unchanged. With every ask applied by the orchestrator, all `polish:` items are ticked, so :552 matches and the path rule applies; that is the stated conservative fallback. With asks left, unticked items make :555 resume the implementer. check-fence accepts an appended `- [x] polish:` item (test :227ff, both shown items, alone and together, every header governed).
3. Both new files are pure ASCII with LF endings; no control characters in added lines.
4. `publishedCommand()` extracts the one backticked span from protocol.md, fills only its placeholders and spawns it. Every corpus pair and the I-01-shaped c0→c1→c2 smoke run through it.

Duty 5 is n/a (feature batch). Duty 6: every sweep the batch names landed in f454aaa; BL-042 has its own commit as required.

Scratch probes: b04-rev/probe2.mjs–probe5.mjs and repo2.

=== end of B04 R1 reviewer findings ===
### B04 R1 test-hunter findings
FINDINGS 8

Worktree /home/timetotilt/worktrees/os925/b04 @ f444ef4, diff chore/slim-contract-pack-ledger...HEAD. Every finding is proven twice with mutate.mjs. The first run used the scoped spec (the four changed test files): `CONTROL PASS PASS tests 157/157 (7s)`, log .../scratchpad/b04-hunt/scoped.log. The second used the full suite (the ledger's validate.json): `CONTROL PASS PASS tests 559/561, 2 skipped (23s)`, log .../scratchpad/b04-hunt/full.log. Both skipped tests are Windows-only validate.test.cjs bash tests. I compared each SURVIVED run's test names with its control's, and they match name for name in both logs. No file ran as a test named after itself.

1. **P1 — a `<` the reader has in doubt goes through as an operator (the current code gives a false PROSE-ONLY).** Tests: tests/prose-only-diff.test.cjs:83-85, the JSX rule, has its case only after `=`, and :159, REFUSALS, only after `return`. Nothing puts a `<` after `}`, `await`, `yield` or `of`. Class: a boundary pinned on one side only, plus a hand-rolled parse more permissive than the real consumer's. Code: orchestrate/tools/prose-only-diff.mjs:123 refuses only when `expressionStarts(prev) === true`. The `'doubt'` from :52/:56 falls through to :124 and is read as an operator. Proof that the suite cares neither way: `SURVIVED t9-jsx-doubt-refused` (`expressionStarts(prev) === true) return fail` → `!== false) return fail`), in both runs. The false PROSE-ONLY in the current code is traced, not mutated: base `if (a) {}\n<b>https://example.com</b>;\n`, head the same with `example.org`. From `//example.com</b>;` on, :100 reads a line comment, so the tool prints PROSE-ONLY for a JSX text change. Fix: refuse `<` on doubt, the way :115-116 handles `/`. Then add that pair to RULES as UNKNOWN, with the twin `if (a) {}\nx = a <b;\n// a` → `// b` reading PROSE-ONLY. Needs a PRODUCTION change → P1.

2. **ASK — an escaped backtick inside a template literal.** No input reaches this branch. Every template in the corpus (:26-28, :98-100, :112, :163) is free of backslashes. Code: prose-only-diff.mjs:94. `SURVIVED t1-template-escape` (`if (c === '\\') i += 2;` → `i += 1;`). With that change, `` const t = `it\`s // one`; `` → `// two` reads PROSE-ONLY: the `\`` closes the template and the rest reads as a comment. The repo's own tools have this shape (check-fence.mjs:118, check-ledger.mjs:54, prompt.mjs:105). Add a CODE rule for that pair, with the twin `` const t = `its`; // one `` → `// two`. Test-only → ASK.

3. **ASK — the prose-reversal sweep covers three of the batch's rules. The classifier rule and the comment rule have no sweep; they are only pinned.** Tests: tests/tool-wiring.test.cjs:1919-1934 pins each passage in its carrier. The families at :1943-1957 cover only one strike, fence severity and contract prose, although :1884-1885 says the rules are "each guarded by a sweep". Class: positive-only assertions on prose. `SURVIVED p1-unknown-exempts` (protocol.md, after "  the cap." append " A classifier UNKNOWN exempts the JavaScript files as PROSE-ONLY does.") lets unreviewed code integrate. `SURVIVED p3-comment-rule-reversed` (.claude/agents/implementer.md, after "report NEEDS_FENCE." append " A comment may describe how its neighbour behaves."). Add a POLISH_REVERSALS family for a `CODE`/`UNKNOWN` verdict that exempts, skips or counts as `PROSE-ONLY`, and one for a comment that describes how its neighbour behaves. Give each a specimen, and plant these two sentences as must-report. Test-only → ASK.

4. **ASK — the escaped-quote case edits only the comment after the string.** Test: prose-only-diff.test.cjs:121, `'it\'s // no comment'; // a` → `// b`. That trailing comment is a comment however the string is delimited. Class: a guard that samples the domain, whose control exercises the comfortable case, not the tight one. Code: prose-only-diff.mjs:63. `SURVIVED t2-string-escaped-quote` (`if (c === '\\') j += …` → `if (c === '\\' && source[j + 1] !== source[at]) j += …`). With that change, `const s = 'it\'s // one';` → `// two` reads PROSE-ONLY. Add a CODE rule for that pair, with the present :121 entry as its twin. Test-only → ASK.

5. **ASK — the keyword sweep takes its domain from the code under test.** Test: prose-only-diff.test.cjs:179-190 loops the tool's own OPERAND_KEYWORDS, CONTEXTUAL and CONTROL, and pins only their sizes (`[13, 3, 4]`). A misspelt member is still exercised, just as misspelt. Class: a corpus whose every entry sits inside the pattern's own bound (derived from it). Code: prose-only-diff.mjs:44, :46, :47. `SURVIVED t7-typeof-misspelt` (`'typeof'` → `'typeOf'`) and `SURVIVED t8-while-misspelt` (`'while'` → `'whilst'`). Under those, `x = typeof /[//]a/.test(s);` and `while (ok) /[//]a/.test(s);` edits (a→b) read PROSE-ONLY. deepEqual each set against a list written by hand from the grammar, or loop that list instead. Test-only → ASK.

6. **ASK — no input reaches the prefix/postfix and file-start branches.** Tests: :65-70 and :113 put `++` only after `=`, a plain name and `count`. No case puts `--` before a `/`, `++` after an operand keyword or a control `)`, or a `/` first in a file. Class: a branch no input reaches. Code: prose-only-diff.mjs:50, :55, :144. All four mutations below SURVIVED:
   - t3 `(prev.type === 'word' && (prev.property || !OPERAND_KEYWORDS.has(prev.text)))` → `(prev.type === 'word')`
   - t4 `(prev.text === ')' && !prev.control)` → `prev.text === ')'`
   - t5 `if (!prev) return true;` → `return false;`
   - t6 `--` → `return false`

   Each makes these a→b edits read PROSE-ONLY: `x = typeof ++/[//]a/.lastIndex;`, `if (ok) ++/[//]a/.lastIndex;`, `/[//]a/.test(s);` as a file's first line, and `x = --/[//]a/.lastIndex;`. Add one CODE rule per input. Test-only → ASK.

7. **ASK — the one-strike family's after-list lacks `another`.** Test: tool-wiring.test.cjs:1944-1945. The before-list is `second|2nd|another|two` and the after-list is `again|twice|second`: two hand-written lists with nothing relating them. Class: a guard that samples the domain it claims to sweep. `SURVIVED p2-another-polish-pass` (SKILL.md, "ASKs close as a polish pass." → "ASKs close as a polish pass, and a polish-phase FIX FIRST earns another polish pass."). Plant that sentence as must-report, and derive both lists from one list. Test-only → ASK.

8. **ASK (cosmetic) — the base-side label on a scan failure is unpinned.** Tests: :261-262 match UNKNOWN by prefix, :332 pins `(head)` only, and REFUSALS call scan() directly. Class: a boundary pinned on one side only. Code: prose-only-diff.mjs:189. `SURVIVED t10-base-label` (`[['base', before], ['head', after]]` → `[['head', before], ['head', after]]`). The verdict and the exit code do not change. Add a CLI case whose base side fails to scan, expecting `… (base)`. Test-only → ASK.

Checked, and live controls through the same harness and scoped spec:
- `KILLED k1-bom-dropped` (ignoreBOM false; killed by the git-level test at :291).
- `KILLED k2-value-opens-regex` (killed by the tests at :139 and :249).
- `KILLED k3-second-strike-back` (the SECOND rule put back into SKILL.md; killed by the tool-wiring reversal sweep). So the harness detects both a tool change and a doc change.
- Traced and holding in tests/prose-only-diff.test.cjs:
  - REFUSALS is bound to the tool's own `fail('…')` calls.
  - Directive, marker and tag ownership comes from a hand-written corpus.
  - The `lines` mode is pinned both ways.
  - By trace, removing the inClass, the ']' or '.' handling, the property check (`.` and `?.`), the hashbang skip, or the line continuation reddens the suite.
  - The published CLI is run with its placeholders filled.
  - Precedence, read-only behaviour, usage and --help are covered.
- Also holding:
  - check-fence.test.cjs:227: both template items are governed, and so is the header count.
  - protocol-contract RETIRED: putting a retired sentence back reddens the check that each entry claims exactly one sentence. NON_MARKDOWN is pinned to the listing.
  - The BL-042 test: the title must exist and no line range may be given.
- Not counted: prose-only-diff.mjs:229 (a rawChanges throw) and :273 (uncaughtException). No real git output reaches either branch.

=== end of B04 R1 test-hunter findings ===

### B04 — gate, round 2

- Fix round (same implementer, nonce matched) @`18b6c86`: tool + `tests/prose-only-diff.test.cjs`
  + `tests/tool-wiring.test.cjs`; `PASS tests 559/561, 2 skipped` plain and under
  `FORCE_COLOR=1`; the implementer's 19 finding mutations and round 0's 30 all killed.
- 6a `check-fence.mjs`: PASS, integration `8d6e96f`, batch `18b6c86`, violations [],
  unknowns [].
- 6c round-2 reviewer (fresh, default tier) FIX FIRST, P0=1 P1=1 ASK=1 — every R1 finding FIX
  VERIFIED (F1–F4, hunter 1–8), then F5 P0: `break`, `continue`, `debugger` (and a label after
  `break`/`continue`) are read as plain names, so after ASI a regex opening the next line is read
  as division and `\/\//` as a line comment — `out.push` → `out.unshift` or deleting
  ` && out.push(line)` after `if (!line) continue` prints `PROSE-ONLY 1 file(s)`, exit 0,
  through the published CLI on real commits; the new GRAMMAR test pins the gap. F6 P1: the
  directive shapes are still a sample — `// Stryker disable next-line all` → `// Stryker disable
  all`, `// nosemgrep: <rule>` → `// nosemgrep`, `// lgtm[js/xss]` → `// lgtm` read `PROSE-ONLY`,
  widening a mutation or security-scanner suppression unreviewed. F7 ASK: the new
  "CODE/UNKNOWN read as prose-only" family is capitals-only and misses "without … re-review".
  Over-rejection of prose shaped like a directive judged acceptable (fail-closed → review).
- Round-2 test-hunter (fresh, default tier) FINDINGS 7, all test-only ASKs: directive
  alternatives sampled one spelling each (m5b/m5c/m6); blank-line and trailing-whitespace rules;
  LS/PS terminators and non-ASCII spaces; POLISH_REVERSALS misses the orchestrator route, a
  whole-diff PROSE-ONLY exemption and an out-of-fence residual filed low; the paren stack proven
  at depth one; two REFUSALS exits unreached; the BL-042 test checks the title exists, not that
  it is the right test.
- Second `FIX FIRST` → `⛔ green, residual finding open (P0)` (validations green; F5 open), left
  out of integration. W3 has no other member, so the session STOPs for the user's verdict —
  fix again / ship with the residual / drop — before the C1 close-out. Worktree `b04` kept.

### B04 R2 reviewer findings
FIX FIRST

F5. orchestrate/tools/prose-only-diff.mjs:56 (OPERAND_KEYWORDS) and :61-69 (expressionStarts). The defect is frozen by tests/prose-only-diff.test.cjs:210-214 (GRAMMAR, new in 18b6c86, which says it is "written here from the grammar"). It violates AC1, the feature's "fails closed on any doubt inside a … regex", and two guardrails: "a defect fixed in the reported instance and left in its sibling" (this is F1's class) and "a test that pins the defect".
  The cause: `break`, `continue` and `debugger`, and a label after `break`/`continue`, are read as plain names. So a `/` that opens the next line is treated as division with certainty. In fact ASI ends the statement there, and on the same line a `/` would be a syntax error, so the `/` opens a regular expression. `\/\//` is then read as the start of a line comment that swallows the rest of the line.
  Scenario, run through the published CLI on real commits (b04-rev2/repos/new-continue-asi). `lib/links.mjs` is written without semicolons: `if (!line) continue` followed by `/^https?:\/\//.test(line) && out.push(line)`.
  - `out.push` changed to `out.unshift` prints `PROSE-ONLY 1 file(s)`, exit 0. At runtime the result goes from ["http://a","https://b"] to ["https://b","http://a"].
  - Deleting ` && out.push(line)` also prints PROSE-ONLY. The runtime result becomes [].
  - The same happens after `break` (2 becomes 4), after `break outer` (2 becomes 4) and after `debugger` (1 becomes -1).
  - Live controls in the same harness read correctly: the same file with `continue;` gives CODE (exit 1), a plain code change gives CODE, and a comment change gives PROSE-ONLY.
  Fix: add `break`, `continue` and `debugger` to OPERAND_KEYWORDS. The postfix test at :157 then correctly reads a following `++` as a prefix. Read a word right after a non-property `break`/`continue` (a label) as 'doubt'. Add all three to GRAMMAR.operand (the size becomes 16). Add a RULES pair per word, each with a twin, e.g. `if (s) continue\n/[//]a/.test(s);` with twin `x = continued\n/[//]a/.test(s);`, plus one pair for the label.
  Class: P0

F6. orchestrate/tools/prose-only-diff.mjs:40-43 (SHAPES). This violates AC2 ("a tool-directive … comment edit is never PROSE-ONLY"). It is the class of R1 F3, which is still a sample on one axis: `tool:verb` accepts five verbs, but the spaced `tool ignore next` shape accepts only `ignore`.
  Scenario, run through the published CLI on commits:
  - `// Stryker disable next-line all` changed to `// Stryker disable all` (StrykerJS's documented form, a test-tooling directive of the same kind as c8/istanbul) prints `PROSE-ONLY 1 file(s)`, exit 0. The change widens a one-line mutation exclusion to the whole file, with no review.
  - `// Stryker restore all` changed to `// Stryker restore EqualityOperator` also prints PROSE-ONLY.
  - The same class, list-shaped: `// nosemgrep: <rule>` changed to `// nosemgrep`, and `// lgtm[js/xss]` changed to `// lgtm`, both print PROSE-ONLY. Each widens a security-scanner suppression without review.
  Fix: widen the spaced shape's verb to `(?:ignore|disable|enable|restore)` and its scope list to include `all`. Add `nosemgrep` and `lgtm`/`codeql` to DIRECTIVES, or add a `<word>[<rule-id>]` shape. Give each an owned SHAPE_COMMENTS/DIRECTIVE_COMMENTS entry and a prose near-miss.
  Class: P1

F7. tests/tool-wiring.test.cjs:1961-1963 (the new family 'a CODE or UNKNOWN verdict read as prose-only'). This hits the guardrails on positive-only prose and on a sweep that samples its rule. The family matches `PROSE-ONLY` only in capitals, and it matches `no … re-review` but not `without … re-review`. So the planted sentences "A classifier UNKNOWN is treated as prose-only." and "An UNKNOWN diff integrates without a re-review." are not reported (raw-regex probe b04-rev2/fam.cjs; a regex miss is a reader miss).
  Fix: keep CODE/UNKNOWN case-sensitive, but make the `as PROSE-ONLY` alternative case-insensitive. Add `\bwithout\s+(?:a\s+)?(?:scoped\s+|fix-diff-only\s+)?re-review\b` and plant both sentences as must-report.
  Class: ASK

Round-1 findings, checked in the current diff:
- F1 (P0, private names and spread): FIX VERIFIED. All three R1 scenarios (`this.#default`, `this?.#in`, `[...typeof /re/]`) now print CODE through the published CLI. Mutating each fix in a disposable export kills it (corpus, keyword and CLI tests). But see F5: the class remains in its sibling.
- F2 (P1, `<` in doubt): FIX VERIFIED. Both R1 scenarios print `UNKNOWN …: a < where an expression may start (JSX?)`, exit 2. Mutating `!== false` back to `=== true` kills it.
- F3 (P1, directive sample): FIX VERIFIED for its named cases. node:coverage, $FlowFixMe, tslint and NOSONAR edits print CODE, and removing the SHAPES family kills it. The residual is F6.
- F4 (ASK, unreachable catch): FIX VERIFIED. `classifyRaw` is the function the CLI runs, and each unreadable record reaches the UNKNOWN line. A mutation of the catch to a PROSE-ONLY return kills it.
- Hunter 1 (= F2): FIX VERIFIED. Hunter 2-4 and 6-8: FIX VERIFIED by reading. There are RULES pairs with twins for the escaped backtick, the escaped quote, prefix ++/-- after an operand keyword, a control `)` and file start. There is a `(base)` label case at :377-378, one AGAIN list that is a superset of both old lists, and families plus planted sentences and carrier arming for the classifier and comment rules.
- Hunter 5: FIX VERIFIED as to the mechanism: a misspelt member now diverges from GRAMMAR. GRAMMAR itself pins the missing words (F5).

Hunk mapping: the three round-2 files map to R1 findings, which in turn map to checklist items 1, 2 and 3-4 (the POLISH sweeps). There is no scope creep. The R1 mapping of the rest of the diff stands.
Acceptance criteria:
- AC1 fails (F5).
- AC2 fails for the unlisted forms in F6; every named and listed directive holds.
- AC3 and AC4 hold; the round-2 diff does not touch the docs.
- AC5 holds. The round-2 hunks in tool-wiring are only at :1883-1989, the protocol.md hunks stop at :148, and the SHA pins are green.
- AC6 holds: smoke step 3's grep prints nothing and exits 1.
Validation (wrapper, from the worktree root):
- Plain: `PASS tests 559/561, 2 skipped (23s)`, exit 0.
- FORCE_COLOR=1: `PASS tests 559/561, 2 skipped (23s)`, exit 0.
- The two skips are the expected Windows-only cases. `git diff --check` on the three-dot diff is clean.
Mutation harness: each fix mutation ran on a fresh `git archive HEAD` export and aborts loudly when its anchor count is not 1. The no-op control SURVIVED and the live control was KILLED, so the harness can report both outcomes. These were single-file runs of tests/prose-only-diff.test.cjs, used as probes only; the gate verdict comes from the full-suite validation above.
Implementer's over-rejection note, judged: `tool:verb` allows one space after `:`, so prose such as "// TODO: disable once …", "// Note: ignore …" and "// Re-enable the cache." is kept as a directive. In each case the result is CODE, which I reproduced: the fix-diff-only re-review runs, as it does today. One kept comment also switches the whole file to `lines` mode, so every comment-line insertion or deletion in that file then reads CODE. That costs extra reviews but is never a false PROSE-ONLY, so it is acceptable under fail-closed. No finding.
Duty 5: n/a (feature batch). As a fix round, every R1 scenario now reads as intended through the CLI.
Duty 6: the round-2 fix updated the tool's header comment and `--help` ("naming or shaped like a tool directive … node:coverage") in the same commit, 18b6c86. No other document names the directive families.
Scratch (under b04-rev2): harness.mjs, scenarios.json, scenarios2.json, harness.out, harness2.out, mutate.sh, mut/*.log, fam.cjs, plain.log, forcecolor.log.

=== end of B04 R2 reviewer findings ===
### B04 R2 test-hunter findings
FINDINGS 7

**Scope and evidence**
- **Scope:** the tests changed in `git diff chore/slim-contract-pack-ledger...HEAD` at 18b6c86 (check-fence, prose-only-diff, protocol-contract and tool-wiring), plus the code each one claims to cover.
- **Harness:** mutate.mjs with the scoped spec `b04-hunt2/scoped-spec.json`, which runs those four files. There is no setup.json.
- **Mutations and logs:** the exact find/replace strings are in `b04-hunt2/mutations.json` and `b04-hunt2/mutations2.json`. The logs are `b04-hunt2/run1.log` and `b04-hunt2/run2.log`.
- **Controls:** both controls read `CONTROL PASS PASS tests 157/157 (7s)` with 0 skipped.
- **Test names:** every SURVIVED run below names the same 157 tests as its control; the diff of the sorted names is empty. No count blind spot applies.
- **Live controls:**
  - `KILLED k1-live-control-eslint-dead`.
  - `KILLED m5-shape-verbs-sampled`. The only thing that killed it was the `@ts-expect-error` four-family assertion at :267, which is why m5b keeps `expect-error`.

**Verdict:** every mutation below is of correct code, and every fix is test-only. All seven are ASK; none is P1.

**1. The comment-family corpus samples ONE spelling per pattern (acceptance criterion 2: a directive comment edit is never PROSE-ONLY)**
- **Test:** tests/prose-only-diff.test.cjs:233-269, with RULES :38-41 and :50-52.
- **Class:** a guard that SAMPLES the domain it claims to sweep. Each pattern owns an entry, but each alternative inside a pattern does not.
- **m6** (prose-only-diff.mjs:20): the eslint pattern narrowed to `(?<![\w-])eslint-disable`. Result: `SURVIVED m6-eslint-narrowed`. Rewording `/* eslint quotes: ["error", "double"] */` to "single" then reads PROSE-ONLY. No shape, marker or tag catches it.
- **m5b** (:41): the tool:verb alternation cut to `(?:disable|expect-error)`. Result: `SURVIVED m5b-shape-verbs-enable-ignore-nocheck-dropped`. `// cspell:ignore xyzzy` then reads as prose.
- **m5c** (:42): the ignore alternation cut to `(?:next)`. Result: `SURVIVED m5c-ignore-shape-next-only`. `/* bun:coverage ignore start */` then reads as prose.
- **Add:**
  - An eslint inline-config comment to DIRECTIVE_COMMENTS.
  - One SHAPE_COMMENTS entry per alternative (enable, ignore and nocheck; start through line).
  - An assertion that each alternative parsed from `SHAPES[i][1].source` appears in an owned comment, so the list is read from the tool rather than written by hand.
- **Route:** ASK.

**2. The whitespace-in-code rule samples one shape (inner spaces)**
- **Test:** tests/prose-only-diff.test.cjs:56-58. No source in the corpus holds a blank line or trailing whitespace.
- **Class:** a guard that SAMPLES the domain.
- **m4** (prose-only-diff.mjs:193): `if (!touched || text !== '')` changed to `if (text !== '')`. Result: `SURVIVED m4-blank-lines-dropped`. Changing ``const HELP = `usage\n\nflags`;`` to ``const HELP = `usage\nflags`;`` changes the template's value, but then reads PROSE-ONLY. The current code reads it as CODE.
- **m9** (:192): the trailing-whitespace strip made unconditional (`if (touched) text`). Result: `SURVIVED m9-trailing-strip-always`. Trailing spaces after code that follows an inline block comment are then dropped, including a template's own trailing spaces.
- **Add:** CODE rules for a blank line removed inside a template literal and for trailing whitespace changed after `f(/* a */ 1);`, each with a PROSE-ONLY twin.
- **Route:** ASK.

**3. Line ends and spaces are only exercised as LF, CRLF and the ASCII space**
- **Test:** `crlf` at :156 and the loop at :168-179. The tool's actual domain is TERMINATOR (:51) and SPACE (:52).
- **Class:** a guard that SAMPLES the domain.
- **m1:** TERMINATOR cut to `/[\n\r]/`. Result: `SURVIVED m1-terminator-no-ls-ps`. Changing `// note<U+2028>process.exit(1);` to `exit(0)` then reads PROSE-ONLY. The code sits after the comment on the same visual line and is hidden from the check.
- **m2:** SPACE cut to `/[\t\v\f ]/u`. Result: `SURVIVED m2-space-ascii-only`. In `x = typeof<U+00A0>/[//]a/.test(s);` the non-breaking space joins `typeof` into one word. `//]a/...` then becomes a comment, so changing a to b reads PROSE-ONLY.
- **Add:** both cases as CODE rules with twins, and an LS/PS line-end variant alongside LF and CRLF in the RULES loop.
- **Route:** ASK.

**4. POLISH_REVERSALS misses the reversals this batch's new orchestrator writer invites**
- **Test:** tests/tool-wiring.test.cjs:1946-1968 (the families) and :1969 (the sweep).
- **Class:** a sweep built to catch reversals is blind to an edit that changes a rule's scope (here it widens it). Also positive-only assertions on prose.
- **d1** (added to SKILL.md after "ASKs close as a polish pass."): "After a polish-phase FIX FIRST on prose, the orchestrator applies the reviewer's wording and runs one more scoped re-review." Result: `SURVIVED d1-second-try-via-orchestrator`. The families look for the implementer or a word from AGAIN. AGAIN has no "one more", so the orchestrator route and a phrasing without a count word both get through.
- **d2** (added to README.md:51): "a PROSE-ONLY verdict exempts the whole polish diff from the scoped re-review". Result: `SURVIVED d2-prose-only-exempts-whole-diff`. Family 9 only covers CODE and UNKNOWN.
- **d3** (added to SKILL.md): "A residual whose fix sits outside the batch's files is filed in the backlog as low." Result: `SURVIVED d3-out-of-fence-residual-low`. LESSER holds none of the backlog severities.
- **Add:** one family per shape, each owning its specimen, and add all three sentences to the planted list.
- **Route:** ASK.

**5. The paren stack is only proven at depth one**
- **Test:** RULES :32-37 and :89-91, and GRAMMAR :222. All use `if (ok)` with nothing nested.
- **Class:** a branch no input reaches (recursion proven at depth one).
- **m3** (prose-only-diff.mjs:149): `parens.pop()` changed to `parens.shift()`. Result: `SURVIVED m3-parens-fifo`. In `if (isReady(x)) /[//]a/.test(s);` the outer `)` picks up the inner call's non-control flag. The `/` then reads as division and `//]a/...` becomes a comment, so changing a to b reads PROSE-ONLY.
- **Add:** a CODE rule `if (f(x)) /[//]a/` with the twin `g(f(x)) /[//]a/`.
- **Route:** ASK.

**6. REFUSALS pins each refusal reason, not each exit**
- **Test:** tests/prose-only-diff.test.cjs:182-204. Its fixtures at :184 and :186 end at end-of-file, so those two exits are never reached.
- **Class:** a branch no input reaches.
- **m7** (:74): the string's line-break exit disabled. Result: `SURVIVED m7-string-newline-exit`. Changing `const s = 'a;\nb'; // x` to `// y` reads PROSE-ONLY instead of UNKNOWN.
- **m8** (:83): the regular expression's line-terminator exit disabled. Result: `SURVIVED m8-regex-terminator-exit`. `const r = /a\n/; // x` behaves the same way.
- **Risk:** low, because both inputs are invalid JavaScript.
- **Add:** fixtures that close on a later line.
- **Route:** ASK.

**7. The BL-042 test checks that the title exists, not that the pointer is right**
- **Test:** tests/tool-wiring.test.cjs:1426-1432.
- **Class:** a close whose rationale points at documentation that does not contain the fact.
- **b1:** the pointer's title changed to 'names are capped at ten, then counted (both sides of the cap)'. That is an unrelated test at tests/validate.test.cjs:682. Result: `SURVIVED b1-bl042-pointer-retargeted`. The Git-bash set-up is at :771-778 and is used by :789-791.
- **Add:** an assertion that the named test's body, up to the next top-level `test(`, mentions `GIT_BASH` or `SHELLS`.
- **Route:** ASK.

**Checked with no finding (read only; R1's mutations were not re-run):**
- check-fence's test of the ticked and unticked template items.
- protocol-contract's RETIRED and NON_MARKDOWN checks.
- the POLISH_RULES pins and their planted control.
- REFUSALS and GRAMMAR set equality.
- the CLI, git-level, precedence, UTF-8 and raw-reader tests.

=== end of B04 R2 test-hunter findings ===

### B04 — third round (fix again)

The user's verdict, given in this session after the STOP, is recorded verbatim in the verdict log:
"Yup, run it again. Fresh implementer, I moved this session up to max as well to help." Consumed
here: row → 🔄, `verdict 2026-09-26 fix again spent → third round on feat/prose-polish @18b6c86`.
The worktree `b04` is clean at `18b6c86`, not an ancestor of the integration branch.

Tier: the strong tier is the most capable model the session can spawn. Fable 5.1 is priced at
$10/$50 per MTok against Opus 5.5's $4/$20 (the user's memory note on token accounting), so this
round's fresh implementer runs on Fable 5.1, and so does the round-3 re-reviewer (a reviewer never
runs below the implementer's tier). B01's strong-tier reviews in this ledger ran on opus.

Procedure (`subagent-prompts.md` §Authorized third round): the fresh implementer is spawned with
the pointer to its rendered implementer prompt, which makes the batch its own; once that report's
nonce checks, it is resumed with the pointer to a `fix-round` prompt rendered with `round` 3 and
both rounds' findings joined into one file (R1 reviewer + R1 hunter + R2 reviewer + R2 hunter,
byte copies of the scratch files whose LOG copies are above), followed by an orchestrator
direction: both rounds' blocking findings are one class — an enumerated list of the unsafe cases
where the safe cases are the smaller provable set (R1 F1 then R2 F5 for regex-or-division; R1 F3
then R2 F6 for directive comments) — so the round fixes the class: every ECMAScript reserved word
and contextual keyword, written by hand in the test, is placed in exactly one of the certain-end,
certain-start and doubt sets, asserted as a partition; directive comments are kept by structure as
well as by name, each alternative owning a corpus comment; every R2 finding closed and every R1
finding kept closed.

- Fresh implementer (Fable 5.1), first report on the implementer prompt: DONE, nonce matched —
  it found round 2's findings itself and landed `290a378` (break/continue/debugger into the
  operand set, labels read as doubt, a nested regex class refused, a doubtful `++` refused,
  directive shapes from pinned verb/scope lists, family 9 case-insensitive) and `677bc10` (BL-042
  test, its own commit), `PASS tests 560/562, 2 skipped`. That was the instance route, not the
  directed class fix; the read-only fence check at that point: PASS (integration `eeb1774`,
  batch `677bc10`).
- Resumed on the round-3 `fix-round` prompt (joined findings + direction): DONE, nonce matched —
  `2cf7d9e`: one exported partition `KEYWORDS.start/.end/.doubt` over all 54 words (38
  ReservedWords, 8 strict-mode, 8 contextual; sizes 16/11/27), written by hand in the test and
  asserted as an exact partition, each word run through `/[//]a/` and `<b>//x</b>`; directive
  comments kept by four structural shapes built from exported VERBS and SCOPES (`tool[:-]verb`,
  `tool verb scope`, `word[rule-id]`, `NO[CFLQS][A-Z]+`), each alternative read off the tool's
  own source and required to own a real comment, near-misses pinned. Replay on disposable
  clones of HEAD: control 52/0, no-op SURVIVED, 56/56 prior-round and round-3 mutations KILLED.
  `PASS tests 561/563, 2 skipped` plain and under `FORCE_COLOR=1`.
- 6a `check-fence.mjs` on `2cf7d9e`: PASS (integration `eeb1774`, merge base `739c92b`),
  violations [], unknowns []; the round touched only the tool and two test files.
- Hazard seen twice in this batch: the Write and Edit tools decode a typed `\uXXXX` escape into
  the raw character (round 0's implementer and this one); the repository's invisible-character
  sweep caught it. Candidate guardrail at close-out.
- Round-3 re-review spawned: a fresh reviewer (`reviewer-round2` role, round 3, Fable 5.1) over
  `git diff 18b6c86..HEAD` with both rounds' findings, and a fresh test-hunter (Fable 5.1).

### B04 — gate, round 3 (the authorized third round)

- Round-3 reviewer (fresh, Fable 5.1) FIX FIRST, P0=0 P1=1 ASK=0 — every R1 and R2 finding FIX
  VERIFIED through the published CLI, and the direction verified beyond the instances (the
  hand-written 54-word specification list, partitioned 16/11/27, checked placement by placement
  against the grammar; four shapes each owning a comment no other shape catches). F8 P1: the
  direction's own verb list is a sample — `allow`, `allowlist` and `skip` are directive verbs it
  lacks, `skipcq` is no listed name, and the rule-id shape needs one of `/.:-` inside the id:
  ` // gitleaks:allow` appended beside a hardcoded key, ` // pragma: allowlist secret` appended,
  `// skipcq: JS-0002` → `JS-0003`, `// coverity[tainted_data]` → `[tainted_data_return]` each
  print `PROSE-ONLY 1 file(s)`, exit 0 (two real commits each, the command protocol.md publishes,
  live controls in the same harness). Its minimal fix: VERBS gains `allow`, `allowlist`, `skip`;
  DIRECTIVES gains `skipcq`; the rule-id shape admits `_` (`[/.:_-]`); every PROSE_COMMENTS entry
  stays prose (checked in scratch, the tool untouched).
- Round-3 test-hunter (fresh, Fable 5.1) FINDINGS 5, all test-only ASKs, the code correct in
  every case: U+2029 never exercised by the line-end loop; `\p{Zs}` members beyond NBSP have no
  fixture; three reversal phrasings pass the sweep; the crash handler is a branch no input
  reaches; the NUL reason text is unpinned.
- Third-round `FIX FIRST` → `⛔ green, residual finding open (P1)` (validations green; F8 open);
  out of integration. After a spent *fix again* the re-ask offers only ship with the residual /
  drop — no fourth round. W3 has no other member: the session STOPs for that verdict; the C1
  close-out waits on it. Worktree `b04` kept at `2cf7d9e`.

### B04 R3 reviewer findings
FIX FIRST

F8. orchestrate/tools/prose-only-diff.mjs:57 (VERBS), :63 (the `word[rule-id]` shape), :19-49 (DIRECTIVES). Violates AC2 ("a tool-directive … comment edit is never PROSE-ONLY") and the guardrail "a guard that SAMPLES the domain": the direction's verb list, taken as the specification, is itself a sample — `allow` and `skip` are directive verbs it lacks — and the rule-id shape requires one of `/.:-` inside the id, so an id with only `_` is prose.
  Scenarios, each two real commits classified by the command protocol.md publishes (harness b04-rev3/harness.cjs, output b04-rev3/harness.out, 40 scenarios):
  - `export const KEY = 'AKIAIOSFODNN7EXAMPLE';` → the same line with ` // gitleaks:allow` appended prints `PROSE-ONLY 1 file(s)`, exit 0. A polish adds a secret-scanner allowlist to a hardcoded key and integrates with no review.
  - The same with ` // pragma: allowlist secret` (detect-secrets) appended: `PROSE-ONLY 1 file(s)`, exit 0.
  - `// skipcq: JS-0002` → `// skipcq: JS-0003` (DeepSource): `PROSE-ONLY 1 file(s)`, exit 0.
  - `// coverity[tainted_data]` → `// coverity[tainted_data_return]`: `PROSE-ONLY 1 file(s)`, exit 0.
  - Live controls in the same harness: ` // eslint-disable-line no-eval` appended → `CODE lib/k.mjs`; `// @ts-ignore` inserted → `CODE lib/k.mjs`; a comment reworded → `PROSE-ONLY 1 file(s)`; a one-character code change → `CODE lib/a.mjs`; an open template literal → `UNKNOWN … (base)`.
  Fix (minimal, class-shaped): VERBS gains `allow`, `allowlist`, `skip`; DIRECTIVES gains `skipcq` (`/(?<![\w-])skipcq(?![\w-])/i`); the rule-id shape admits `_` as the separator (`[/.:_-]` in both places). Checked in scratch (b04-rev3/fixshape.mjs, the candidate patterns built there, the tool untouched): the three changes catch all four comments, and every one of the 28 PROSE_COMMENTS stays prose; `// fast-skip the cache`, `// note: allow` and `// items[max_len] is the last` become over-rejections, the accepted side. Add each caught comment to the corpus as an owned entry, with a near-miss on the other side (`// allow one retry`, `// skip the cache`, `// values[key] are cached.`).
  Class: P1.

Weighing it: the round-3 direction's floor is fully met — its seven verbs, its scope words, the bracketed and NO-marker shapes, the names nosemgrep, lgtm, codeql and Stryker — and the implementer read each alternative off the tool and gave it a witness. F8 is the floor's own verb list proving a sample, the same class the direction named, and the fix is three list edits with owned cases. If the user prefers ship-with-the-residual, the backlog entry should carry the fix above verbatim.

Round-1 and round-2 findings, checked against the current diff (18b6c86..HEAD) and through the published CLI:
- R1 F1 (private names, spread): FIX VERIFIED — `this.#default / pick('/') + pick('//x')` → `//xxxxxx` prints `CODE lib/meter.mjs`; `[...typeof /[//]a/].length` → `+ 1` prints CODE.
- R1 F2 (`<` in doubt): FIX VERIFIED — `yield <li>//{x.a}</li>` → `{x.b}` prints `UNKNOWN …: a < where an expression may start (JSX?) (base)`, exit 2.
- R1 F3 (directive sample): FIX VERIFIED — `/* node:coverage ignore next */` → `next 3` prints CODE.
- R1 F4 (unreachable catch): FIX VERIFIED — classifyRaw is the CLI's function and each unreadable record reaches the UNKNOWN line (test :572-585).
- R1 hunter 1-8: FIX VERIFIED — as round 2 recorded; round 3 keeps each (RULES :83-100, :104-106, :169-171; AGAIN one list, :1948; the `(base)` label, :543).
- R2 F5 (break, continue, debugger, label): FIX VERIFIED — links.mjs with `continue`, `break` and `debugger` and `out.push` → `out.unshift` or the call deleted prints `CODE lib/links.mjs`; with `continue outer` prints `UNKNOWN …: a / that may open a regular expression or divide (base)`; the `continue;` control prints CODE. KEYWORDS.start holds all three (:84), a same-line label reads doubt (:201, :95).
- R2 F6 (directive structure): FIX VERIFIED — `Stryker disable next-line all` → `Stryker disable all`, `Stryker restore all` → `restore EqualityOperator`, `nosemgrep: <rule>` → `nosemgrep`, `lgtm[js/xss]` → `lgtm` all print CODE; VERBS/SCOPES pinned both ways (test :352-355, :386-391).
- R2 F7 (family case and `without`): FIX VERIFIED — `anyCase('prose-only')` and `(?:no|without)` (:1967-1969); both planted sentences are must-report (:2003) and the suite is green.
- R2 hunter #1: FIX VERIFIED — the eslint inline-config comment (:314), alternatives read off each shape and set-compared (:391), each with a witness (:400-403), near-misses on the far side (:406-409).
- #2: FIX VERIFIED — RULES :154-159, and remainder now owns an empty line inside a removed comment (:231-233; my probes: an empty line inside a comment → PROSE-ONLY, an empty line added after it → CODE).
- #3: FIX VERIFIED — RULES :160-165; LINE_ENDS runs LF, CRLF and U+2028 (:204-207, :221).
- #4: FIX VERIFIED — AGAIN gains the count-less re-runs (:1948), family 11 (PROSE-ONLY over the whole diff, :1971), LESSER gains the backlog severities (:1954); d1-d3 planted (:2004-2008).
- #5: FIX VERIFIED — `if (f(x)) /[//]a/` with the twin `g(f(x))` (:166-168).
- #6: FIX VERIFIED — the string and the regular expression close on a later line (:238, :240).
- #7: FIX VERIFIED — the named test's body must run the shells and a body that does not exists (:1426-1437), in its own commit 677bc10 carrying BL-042.
- Direction item 3: the implementer replayed all 57 mutations at HEAD (b04-r3/replay.out): the no-op control SURVIVED, every other one KILLED.

Direction, verified beyond the instances: item 1 — SPEC (:269-275) is written by hand and matches the ReservedWord production (38), the strict-mode words (8) and the contextual keywords (8); PLACED (:276-282) partitions it (set equality with the tool's sets, every word once, sizes 16/11/27 pinned, :286-292); I checked each placement against the grammar: every `start` word is one after which a `/` can only open a regular expression or is a syntax error, every `end` word a value or a name the grammar never puts before a `/` as a keyword, the rest doubt. Item 2 — four shapes, each owning a pool comment no other shape catches (:370-373), SHARED_COMMENTS pinned to exact families (:378). Hunk mapping of the round-3 diff: the tool hunks map to checklist item 1 and direction items 1-2 (the nested-class refusal and the empty-comment-line rule are fail-closed and twin fixes); the test file to item 2; tool-wiring :1426-1437 to item 8 (own commit) and :1946-2008 to the item 3-5 sweeps. No scope creep; the batch file is unchanged since round 1.

Acceptance criteria: AC1 holds (every corpus rejection reads CODE or UNKNOWN with an owned twin; my 26 tokenizer probes, valid JavaScript from do-while regexes to unicode-escaped identifiers, read as expected; one probe of mine, `/[[a-z]--[/]]/v`, was my error — both readings close at the same `/`, so PROSE-ONLY is right). AC2 fails for the four forms in F8; every named, listed and floor form holds. AC3 holds (protocol.md :119-145; the "SECOND `FIX FIRST`" at :153, subagent-prompts :216 and execution-models :121 is the review-round cap, not the polish rule). AC4 holds (:108-111, subagent-prompts :177-181, reviewer.md:12). AC5 holds: round 3 does not touch protocol.md, the three-dot tool-wiring hunks begin at :1410 so REINSTATE (:937) and WRITE_LICENCES (:1015) are byte-identical to the base, and the SHA pins are green. AC6 holds: `grep -n "validate.test.cjs:[0-9]" tests/tool-wiring.test.cjs` prints nothing, exit 1.

Validation (wrapper, from the worktree root): plain `PASS tests 561/563, 2 skipped (23s)`, exit 0 (b04-rev3/plain.log); FORCE_COLOR=1 `PASS tests 561/563, 2 skipped (23s)`, exit 0 (b04-rev3/forcecolor.log). The two skips are the Windows-only cases. `git diff --check` is inside validate.json and is also clean on the three-dot diff.
Duty 5: n/a (feature batch); the direction is implemented as above. Duty 6: the tool's header and SHAPES comments changed in the same commits; `git grep` finds no tracked file naming OPERAND_KEYWORDS, CONTEXTUAL or GRAMMAR; no document names the directive families beyond `--help`'s "and others".
Scratch: b04-rev3/harness.cjs, harness.out, repos/, fixshape.mjs, plain.log, forcecolor.log.

=== end of B04 R3 reviewer findings ===
### B04 R3 test-hunter findings
FINDINGS 5

Scope: every test in `git diff chore/slim-contract-pack-ledger...HEAD` at 2cf7d9e (tests/check-fence.test.cjs, tests/prose-only-diff.test.cjs, tests/protocol-contract.test.cjs, tests/tool-wiring.test.cjs) and the code each covers: orchestrate/tools/prose-only-diff.mjs, the polish rules' carriers, orchestrate/templates/02-batch.md. Worktree /home/timetotilt/worktrees/os925/b04. No setup.json exists.
Harness: mutate.mjs with the scoped spec /tmp/claude-1000/-home-timetotilt-projects-orchestrate-skill/30346af3-7332-4e1a-b96e-3cbe367061c2/scratchpad/b04-hunt3/scoped-spec.json (the four files), mutations .../b04-hunt3/mutations.json, log .../b04-hunt3/run1.log. `CONTROL PASS PASS tests 159/159 (7s)`, 0 skipped. Every SURVIVED run below names the same 159 tests as the control (sorted names compared: no difference), 159 pass, 0 fail, 0 skipped; no scoped file ran as a self-named test.
Live controls in the same run: `KILLED k1-control-doubt-slash-opens-regex` (prose-only-diff.mjs:170 `starts = false` → `true`; killed by the corpus test and the CLI corpus test) and `KILLED k2-control-second-strike-reinstated` ("A SECOND polish-phase FIX FIRST discards the polish." planted after "ASKs close as a polish pass." in orchestrate/SKILL.md:147; killed by the reversal sweep). So the harness detects a tool change and a document change, at the same anchor the plants below use.
Disclosure: besides the three named files I wrote eight derived name lists (names-*.txt) under b04-hunt3 for the name comparison above; disposable scratch, nowhere near any worktree.

Verdict: the code under test is correct in every case below; every fix is test-only. Ranked by risk.

**1. ASK — the line-end loop samples the reader's terminator set: U+2029 (PS) is never exercised.**
- Test: tests/prose-only-diff.test.cjs:204-207 (`LINE_ENDS = [identity, crlf, ls]`, its comment claiming "every line end the reader knows"), :221 (`assert.equal(LINE_ENDS.length, 3)` pins the sample, not the domain), the loop :219-231, the LS rule :160-162.
- Code: orchestrate/tools/prose-only-diff.mjs:73 `TERMINATOR = /[\n\r  ]/`, read by :75 isTerminator, :141 endOfLine, :160 and :228.
- Class: a guard that SAMPLES the domain it claims to sweep. Residual of R2 finding 3: the fix added one more sample (LS) instead of binding the corpus to the set.
- Mutation: `SURVIVED m1-terminator-no-ps` — ` ` dropped from TERMINATOR. Under it `// note<U+2029>process.exit(1);` → `exit(0)` reads PROSE-ONLY: the line comment at :155 runs on to the `\n`, so the code after the PS is stripped from both sides — the shape :160 pins for LS, and PS is a JavaScript LineTerminator exactly as LS is. `\r` alone is absent from LINE_ENDS too, though by trace its removal is killed through CRLF (the twin at :138 turns CODE).
- Add: one variant per terminator the reader names — LF, CR, CRLF, LS, PS — pinned at 5 (or derived from :73's own class), so the :219 loop runs every pair under PS; and a PS twin of the :160 rule.
- Route: test-only → ASK.

**2. ASK — the whitespace class is exercised by the ASCII space and NBSP only; `\p{Zs}` has no fixture.**
- Test: tests/prose-only-diff.test.cjs:163-165 (the NBSP rule: one member of the class).
- Code: prose-only-diff.mjs:74 `SPACE = /[\t\v\f  ﻿\p{Zs}]/u`; :76 wordChar makes any non-ASCII character outside SPACE a word character.
- Class: a guard that SAMPLES the domain (residual of R2 finding 3).
- Mutation: `SURVIVED m2-space-no-zs` — `\p{Zs}` dropped. Under it `x = typeof<U+3000>/[//]a/.test(s);` → `b` reads PROSE-ONLY: U+3000 joins `typeof` into one word, :95 has a name divide, `[` follows, and `//]a/.test(s);` becomes a comment. The same for U+1680, U+2000–U+200A, U+202F and U+205F, all whitespace to JavaScript.
- Add: run the :163 rule over every `\p{Zs}` code point (a hand-written list of the 17, pinned by size and asserted to match the category) plus `\t`, `\v`, `\f` and `﻿`.
- Route: test-only → ASK.

**3. ASK — the reversal sweep passes three plausible reversals of the batch's own rules.**
- Test: tests/tool-wiring.test.cjs:1958-1985 (POLISH_REVERSALS), :1987 the test, :2029 the sweep over documents() and definitionListing(); the planted must-report list :1995-2013.
- Class: a guard that SAMPLES the domain (phrasings); positive-only assertions on prose. Third-round residual: a regex sweep never closes every phrasing, so weigh a further family against stopping here.
- Mutations, each one sentence appended after "ASKs close as a polish pass." in orchestrate/SKILL.md:147, a document the sweep reads (control k2 at the same anchor is KILLED):
  - `SURVIVED p1-scoped-re-review-skipped-for-code`: "The scoped re-review may be skipped when the verdict is CODE." Family 9 (:1974) wants the verdict word before the verb, and `skips?`, never `skipped`.
  - `SURVIVED p2-outside-fence-does-not-block`: "A criterion violation whose fix sits outside the fence does not block the batch." Family 5 (:1965) needs a LESSER word (:1954); "does not block" is the downgrade said as a verb.
  - `SURVIVED p3-fix-commit-and-a-re-review`: "A polish-phase FIX FIRST is followed by a fix commit and a re-review." Family 11 (:1980) needs "scoped re-review", family 3 (:1962) needs implementer or fix round, and AGAIN (:1948) has no bare re-review.
- Add: the three sentences to the planted list; family 9 read in either order and in the passive (`skipped|exempted|spared`); a LESSER alternative (or a family of its own) for `(?:does|do|need)\s+not\s+block|not\s+(?:a\s+)?blocker|never\s+blocks?`; family 11 taking `(?:then|followed by|and)\s+(?:a\s+)?(?:fresh\s+|new\s+)?(?:scoped\s+)?re-review`. Each with a specimen it alone catches.
- Route: test-only → ASK.

**4. ASK — the crash handler is a branch no input reaches.**
- Test: none of the four scoped files plants a crash; the repository's only such test is tests/mutate.test.cjs:886, whose TOOLS (:17) are mutate.mjs and run-at-ref.mjs.
- Code: prose-only-diff.mjs:344 `process.on('uncaughtException', …)` → `UNKNOWN internal error: …`, exit 2 (the comment at :343 names the hazard: exit 1 reads as CODE).
- Class: a branch no input reaches.
- Mutation: `SURVIVED m3-uncaught-handler-never-registered` (the event name changed, so the handler never registers). Under it a crash ends with Node's exit 1 and a stack trace on stderr where the one line should be. Risk low: exit 1 is CODE, which keeps the path rule — a re-review, the conservative direction.
- Add: mutate.test.cjs:886's plant (`--import data:text/javascript,…`, throwing once a listener is registered) against `prose-only-diff.mjs --help`, expecting exit 2 and `UNKNOWN internal error: planted crash` as stdout's last line.
- Route: test-only → ASK.

**5. ASK (cosmetic) — the NUL reason text is pinned nowhere.**
- Test: tests/prose-only-diff.test.cjs:128-130 asserts the verdict only; :447 matches the CLI line by the prefix `UNKNOWN <file>: `.
- Code: prose-only-diff.mjs:257.
- Class: a boundary pinned on one side (verdict and exit pinned, the published reason not).
- Mutation: `SURVIVED m4-nul-reason-unpinned` (`'a NUL byte (binary)'` → `'unreadable'`).
- Add: in the CLI corpus test or the :219 loop, expect the whole line `UNKNOWN r<i>-case.mjs: a NUL byte (binary) (base)`.
- Route: test-only → ASK.

Checked and holding (by trace; R1's and R2's mutations were not re-run):
- tests/prose-only-diff.test.cjs: KEYWORDS and CONTROL are set-equal to a hand-written specification list that the three placements partition exactly (:283-306); REFUSALS is bound to the tool's own `fail('…')` calls, each with a twin; every directive, shape, marker and tag family owns a comment, and every shape verb and scope has a real witness; the postfix/prefix, label, spread, private-name, paren-depth, `<`-in-doubt and escaped quote/backtick branches each have a CODE case with a PROSE-ONLY twin; the CLI runs as protocol.md publishes it — one line, nothing on stderr, exit codes pinned; add, delete, rename, re-mode, link, submodule and BOM, precedence, other-path counting, both failure sides `(base)`/`(head)`, the raw reader's refusals with a readable control, usage and --help are pinned. Traced as killed: dropping `--no-abbrev`, `-z` or `--no-renames`; `lines` forced either way; the mode checks removed; the inline block-comment space; the trailing-space strip; the empty-line-inside-a-comment rule. `sides.some` → `every` at :266 is verdict-equivalent, not a finding.
- tests/check-fence.test.cjs:227-249: both shown items and the header count are governed; each item alone and both together must parse.
- tests/protocol-contract.test.cjs:236-251 and :274-292: each RETIRED entry must claim exactly one lost sentence and its successor must be present; :636-645 NON_MARKDOWN is deepEqual to the listing at 12.
- tests/tool-wiring.test.cjs:1928-1941: the ten POLISH_RULES passages are pinned whole, anchor once, with a planted-sentence control each; the rules occur once per carrier. :1427-1441 the BL-042 test requires the named test's body to reference the shells, with a can-fail control.
- Not counted: retargeting the BL-042 pointer to another shell-running test (validate.test.cjs:929) would survive but is an equally true pointer; loosening a directive's leading `(?<![\w-])` for eslint, prettier and the rest (by trace, not run) only makes the tool keep more comments, the conservative direction; `--no-relative` and the `?.`-before-digit check at :210 are unobservable by any fixture.

=== end of B04 R3 test-hunter findings ===

### B04 — ship with the residual

The user's verdict, recorded verbatim in the verdict log: "As long as the residual isn't a
fundamentally breaking bug that sounds fine." The condition was checked, not assumed: B04's
protocol.md (§Severity, the polish close, `feat/prose-polish` @2cf7d9e lines 128-134) uses the
classifier in one place — after a polish lands, `PROSE-ONLY` exempts the JavaScript files it
counts from the fix-diff-only re-review; `CODE`/`UNKNOWN` keep the path rule; §Recovery keeps the
path rule regardless. A `PROSE-ONLY` requires every changed JavaScript file's comment-stripped
remainder to be byte-identical, and the round-3 reviewer verified the tokenizer class (R1 F1,
R2 F5) closed through the published CLI. So the residual P1 (F8) can at worst let a future polish
add or edit an unlisted tool-directive comment (`// gitleaks:allow`, `// skipcq: …`) without the
scoped re-review; code cannot change under it, the fence check and validations still run, and
nothing in this ledger uses the tool (its contract predates it). Not a breaking bug: the
condition holds, and the verdict is consumed as *ship with the residual*.
- Consumed: `git merge-tree --write-tree` clean (`183a92f`), `--no-ff` merge `bf055ce`, tip
  `PASS tests 561/563, 2 skipped (23s)` → 🟢. Residual F8 → `BACKLOG.md` `BL-046` (high), carrying
  the round-3 reviewer's minimal fix verbatim and the class fix (invert the directive rule). One
  `Runner: human` smoke step (step 4) authored into B04's batch file on the integration branch,
  reproducing the residual on the issued fixture `I-04` (`c1` appends ` // gitleaks:allow` to a
  code line; checked on the tip: `PROSE-ONLY 1 file(s)`, exit 0). The round-3 hunter's five
  test-only ASKs go to `BACKLOG.md` at close-out. Worktree `b04` removed.
- Orchestrator error, fixed forward: the `ed0d921` commit inserted the BL-046 row with
  JavaScript's `String.replace` and a STRING replacement; the row's text holds `` `$` ``, and
  `` $` `` in a replacement string means "the text before the match", so the commit spliced a
  second copy of BACKLOG.md's preamble and Open table in after the row (35 lines where one was
  meant). Rebuilt from `ed0d921^:BACKLOG.md` by inserting the row by index, proved to differ from
  that original by exactly the one intended line, committed on top (no history rewritten). The
  same commit's PROGRESS edit used a function replacement and the batch-file step an append, and
  this session's other scripted edits carried no `$` in a replacement string: BACKLOG.md was the
  only casualty. Close-out distillation candidate: insert text by index or with a function
  replacement, never a string replacement that can carry `$` — the substitution hazard
  `tests/prompt.test.cjs`'s quoting fixture already guards for the renderer.

## 2026-09-26 — C1 close-out

- Inputs (issue 001, `f770be1`): `I-01`–`I-04` generated twice (byte-identical), independently
  validated (`validation-001/independent-check.md`, 29 checks, exit 0; a truncated copy rejected),
  committed under `evidence/C1/inputs/` (the repository `.gitattributes` pins every input path
  `-text -eol -filter`; effective attributes checked unset). `I-04` is the BL-046 fixture the ship
  verdict's human step needs. I-03's commit is unchanged by B04's merge: its template edit sits in
  a comment the fill strips.
- Tip validation at the build `f770be1`: `PASS tests 561/563, 2 skipped (24s)` (the issued bundles
  trip no whole-checkout sweep).
- QA runner (qa-runner, default tier; hand-filled skeleton, nonce matched): steps 3–14 PASS on
  `f770be1`, evidence `evidence/C1/step-03.md` … `step-14.md`; inputs re-hashed after the run and
  unchanged; every reset proven. Its notes, for the close-out residuals: `build-smoke-page.mjs` has
  no `--help` (step 6 passes, identically through the link); step 10 is absence-only and cannot
  tell the build from the base; `tests/protocol-contract.test.cjs:119` still maps the retired
  `EVIDENCE_TOOL`/`FENCE_TOOL` names; the no-polling sentence stands word for word in two files
  (B03's batch file asked for both).
- Page: `smoke-c1.json` assembled (14 steps, 6 sections — the Windows run and the BL-046 sign-off
  first as the hands-on work, then B01–B04), built by the pinned `build-smoke-page.mjs` (75395
  bytes, every slot filled), read in full, published as a private Claude artifact with the `db`
  store: https://claude.ai/artifact/YQnp8Pgc1ePNd64YGBsXKX (version 1). The standfirst's saving
  sentence was corrected before the first publish (browser-local and the page's store).
- Store check: `ArtifactData list os925-c1-steps` → no documents (reachable, empty).
- Artifact proof (`evidence/C1/artifact-proof.md`): the rendered-DOM read COULD-NOT-RUN — no browser
  here, and in the user's connected Chrome the hosted page renders in a cross-origin sandboxed
  iframe that the extension's DOM, text and accessibility readers cannot enter (its URL redacted by
  the extension, not recovered). Labelled substitute: blocks derived with Python's `html.parser`
  from what the renderer receives — 18 blocks, none with a backslash or control character, the 12
  agent blocks byte-identical to the QA runner's — and the 4 gate and 12 agent blocks run as those
  bytes from a fresh clone at `f770be1`: 16/16 as each Pass states. One screenshot confirmed the
  hosted page renders (tally pre-verified 12 · unmarked 2 · of 14).
- Rows → 🧪; State AT-CHECKPOINT C1. The hand-over asks for the push the Windows step needs.

## 2026-09-26 — C1 issue 1: Step 1 fail (the Windows run)

The user's message, verbatim — the pasted tail of the README PowerShell recipe on the Windows laptop,
build `f770be1` at branch tip `2cb1289` (Step 0 had passed on the laptop):

```text
✖ failing tests:

test at tests\prose-only-diff.test.cjs:587:1
✖ one line whatever a path holds, usage refused, --help documents the flags the published command uses (2017.9739ms)
  AssertionError [ERR_ASSERTION]: Fixture command failed in C:\Users\fatbo\AppData\Local\Temp\orchestrate-git-F2pQPi\repo: git update-index --add --cacheinfo 100644,198b8f89e758aee0adce3806353120c3b674937d,line
  break.mjs
  error: Invalid path 'line
  break.mjs'
  fatal: git update-index: --cacheinfo cannot add line
  break.mjs

  128 !== 0

      at Object.git (C:\Users\fatbo\OneDrive\Desktop\Claude Testing\orchestrate-skill\tests\support\git-fixture.cjs:60:14)
      at TestContext.<anonymous> (C:\Users\fatbo\OneDrive\Desktop\Claude Testing\orchestrate-skill\tests\prose-only-diff.test.cjs:592:8)
      at Test.runInAsyncScope (node:async_hooks:214:14)
      at Test.run (node:internal/test_runner/test:1047:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:744:18)
      at Test.postRun (node:internal/test_runner/test:1173:19)
      at Test.run (node:internal/test_runner/test:1101:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:744:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: 128,
    expected: 0,
    operator: 'strictEqual',
    diff: 'simple'
  }
PS C:\Users\fatbo\OneDrive\Desktop\Claude Testing\orchestrate-skill> if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
Node test suite failed
At line:1 char:28
+ if ($LASTEXITCODE -ne 0) { throw 'Node test suite failed' }
+                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : OperationStopped: (Node test suite failed:String) [], RuntimeException
    + FullyQualifiedErrorId : Node test suite failed

PS C:\Users\fatbo\OneDrive\Desktop\Claude Testing\orchestrate-skill> git diff --check
PS C:\Users\fatbo\OneDrive\Desktop\Claude Testing\orchestrate-skill> if ($LASTEXITCODE -ne 0) { throw 'Git diff check failed' }
PS C:\Users\fatbo\OneDrive\Desktop\Claude Testing\orchestrate-skill>
```

Triage: B04. Its new `tests/prose-only-diff.test.cjs:587` test stages, through the index
(`git update-index --add --cacheinfo`, via `tests/support/git-fixture.cjs`'s `git()`), a fixture path
holding a newline to prove the classifier's one output line whatever a path holds. Git for Windows
refuses such a path at the index ("Invalid path"; its own win32 path check — on Linux,
`core.protectNTFS=true` does not reproduce it, probed with git 2.53.0), so the fixture command exits 128
before the tool runs. The product is not implicated; the Windows validation gate is red. No gate caught
it: every gate ran on Linux, where the path is legal (escaped defect 1 of C1). A tree object may hold
such a name on any platform (`git mktree -z` accepts it here), so the property the test guards stays
real on Windows. Only one failing test was pasted; the totals were above the pasted tail. Step 2 (the
BL-046 sign-off) is not yet given. B04 → ❌, fix-up pending: `fix/B04-c1-followup`; B01–B03 stay 🧪
(not explicitly passed).

- Fix-up: `fix/B04-c1-followup` cut @`e3af462` (worktree `/home/timetotilt/worktrees/os925/b04-c1`); implementer (default tier) spawned on a prompt filled by hand from the skill's fix-up skeleton: the failure report verbatim, B04's batch file, the diff since the Base SHA, B04's contract excerpts byte-for-byte from its rendered prompt, the probed facts (the refusal is Git for Windows' own; `mktree -z` accepts the name), and the failing-on-base shape this repair needs (a shim that refuses index paths holding a control character, as Git for Windows does).
- Scope added before the spawn, by the user's words (verdict log, verbatim): BL-046's MINIMAL fix folds into the fix-up as its own commit — the three list edits and owned corpus cases the round-3 reviewer specified; the four named scenarios and I-04 must read CODE; the class fix (inverting the rule) stays in BACKLOG and out of scope, and the fix-up's reviewer is told the open-ended class remains the residual the user accepted at ship, so an unlisted vocabulary beyond the four named is not a new finding.

### B04 C1 fix-up — gate

- Implementer (default tier) DONE_WITH_CONCERNS: `e94f0c9` "fix: batch 04 repair — Git for Windows refuses
  the line-break path at the index; the fixture commits it from tree objects" (test-only: c1 built from
  `ls-tree -z` + `mktree -z` on stdin + `commit-tree`; off Windows the test puts an index-refusing shim git
  first on the fixture's PATH, on win32 the real git refuses; live control; no skip) and `afba68d`
  "fix: BL-046 — allow, allowlist and skip are directive verbs, skipcq a directive name, and _ a rule-id
  separator" (plus `// checkov:skip=…` so the verb `skip` owns a real comment; near-misses `// allow one
  retry`, `// skip the cache`); `PASS tests 562/564, 2 skipped` plain, under `FORCE_COLOR=1`, and with the
  refusing git first on PATH. I-04 from an archive of `afba68d` reads `CODE lib/token.mjs`, exit 1; I-01
  unchanged. Concerns: Git for Windows' `mktree` unverified here (the laptop re-run decides); the page's
  Step 2 and B04's smoke step 4 now stale; `tests/check-fence.test.cjs:64-74` commits a control-character
  path only off Windows without asserting the Windows refusal (sibling, left); the shim sees arguments
  only; the class residual still open (`// ggignore`, `// sourcery skip: …`, `// coverity[overrun]`).
- 6a: `check-fence.mjs` → UNKNOWN (authority: "Plan/PROGRESS branch linkage does not agree" — the fix-up
  branch is not the plan's B04 branch); UNKNOWN never passes → the manual fallback: `git diff --name-status
  -z -M 89f85eb...afba68d` = `M orchestrate/tools/prose-only-diff.mjs`, `M tests/prose-only-diff.test.cjs`,
  both in B04's 15-path plan fence, no rename, no ledger path; worktree clean including untracked; `filter`
  unspecified on both. PASS.
- 6b (orchestrator, independent shim — a `/bin/sh` git that refuses `update-index`/`add` whose arguments
  hold a control character, exit 128, and execs `/usr/bin/git` otherwise; live control refused): (A) the
  pre-repair tip's `tests/prose-only-diff.test.cjs` — plain 15/15 pass; under the shim 14/15, the failure
  `:587` "Fixture command failed … update-index --add --cacheinfo 100644,198b8f89…,line⏎break.mjs",
  "Invalid path", `128 !== 0` — the laptop's failure, same blob; the repaired file under the shim 16/16.
  PROVEN as an emulation. (B) `afba68d`'s test file on the pre-repair tree: 3 of 16 fail by AssertionError
  — `:359` pinned list sizes, `:386` verb set equality, `:480` "gitleaks:allow appended (I-04)". PROVEN.
- The fix-up's reviews continue B04's numbering (R4, R5) so each LOG heading stays unique; the fix-up cap
  (two `FIX FIRST`) counts from R4. R4 reviewer and test-hunter spawned (default tier, the implementer's).

## 2026-09-26 — continue (resumed after the Claude Code process restarted)

Boot: skill pin `SKILL MATCH 354f4dd…`; no reboot since 2026-09-21, so the session scratchpad survived
(the R4 reviewer's findings file intact). Reconcile: B04 ❌ with `fix/B04-c1-followup` at `afba68d`, ahead,
not integrated, worktree clean — the fix-up's R4 reviewer had returned SHIP (not yet recorded) and the R4
test-hunter was lost with the old process (no findings file) → a fresh R4 test-hunter spawned (new nonce).
Resume-time validation on the integration tip `57da24e`: `PASS tests 561/563, 2 skipped (23s)`.

### The user's report: the suite's process count on Windows

The user, verbatim: "So what do I do to test? Assuming we are ready? Also, the testing suite is opening 40+
THOUSAND individual processes on my laptop and leaking them. Thoughts on that?"

Measured on the Linux workstation (each test file run alone under `strace -f -e trace=execve`):

| Tree | Processes executed by the whole suite | of which `git` |
|---|---|---|
| ledger base `edd2f1e` | 60,697 | 58,893 |
| the fix-up `afba68d` (this change + the fix-up) | 74,890 | 72,785 |

Largest at the fix-up: `check-fence` 28,490 (base 28,334), `git-contract` 13,877 (base 10,489; B02's decoy
tests), `check-ledger` 11,662 (11,338), `prose-only-diff` 9,867 (new, B04), `mutate` 8,323 (8,022). The
count is a pre-existing property of the suite — fixtures and tools spawn one `git` per operation — and this
change raised it by 23 %. On Linux no process outlives the run (only kernel workers were alive from the run's
window afterwards). Leaking on Windows is not reproducible here: Git for Windows' `cmd\git.exe` launcher
starts a second `git.exe`, and each console process may get a `conhost.exe`, so one call is 2–3 Windows
processes (hence >100k process creations and the 13–20-minute laptop runs); whether any stay alive after the
suite exits is the question put to the user, with a read-only PowerShell count. The fixture helper isolates
global and system config (`GIT_CONFIG_NOSYSTEM`, an empty `GIT_CONFIG_GLOBAL`), so a global
`core.fsmonitor=true` cannot start daemons in its repositories; tests that run a tool with the ambient
environment are the remaining place it could. Residual candidate for `BACKLOG.md` at close-out whatever the
user's answer: the suite's spawn volume (batch fixture construction, share fixture repositories).

### B04 C1 fix-up — R4

- R4 reviewer (fresh, default tier) SHIP, P0=0 P1=0 ASK=2: F1 the new fixture's comment claims more than the
  shim proves (a `git add --all` route passes it on Linux; Git for Windows' `mktree` unprobed); F2 B04's
  smoke step 4 and the page's Step 2 still expect the residual (`PROSE-ONLY`, exit 0) — the orchestrator's
  to re-author at the re-issue, with Runner agent, since the four named scenarios leave nothing to accept.
- R4 test-hunter (fresh after the first was lost with the old process, default tier) FINDINGS 2, both
  test-only: #1 skipcq pinned by one form (`SURVIVED p1-skipcq-needs-colon` — a bare ` // skipcq` appended
  would read PROSE-ONLY); #2 the shim covers two argv routes and its control the easy one
  (`SURVIVED t1-fixture-worktree-add-all`, `t2-…-index-info-stdin`, `t4-shim-add-never-refused`) — assert
  on the domain instead: no `ls-files -z` entry and no work-tree name below U+0020. Reviewer F1 and hunter
  #2 are one gap → one polish item (the domain assertion, and the comment narrowed to what it then proves).
  → `R4 SHIP @afba68d asks=3` (F1≡#2, #1; F2 is the orchestrator's), gate=2/0.
- Hunter housekeeping note: a stray clone `/tmp/mut-y4h9fL` from before its run (a mutate run killed with
  the old process leaves its clone).
- The maintenance experiment (the user asked to try the change locally): in a throwaway worktree at
  `afba68d`, `tests/support/git-fixture.cjs:27` writing `[maintenance] auto = false` and `[gc] auto = 0`
  into the fixture's global config keeps the suite green (`PASS tests 562/564, 2 skipped`) and drops the
  detached `git maintenance run --auto --detach` runs from 708 to 7 (the rest from tests that build
  repositories without the helper); total processes 74,890 → 74,189. Steps for the laptop given to the
  user: count `git` processes, run `tests/check-fence.test.cjs` (229 detached runs) unmodified and edited,
  compare, `git restore` before the real Step 1.
### B04 R4 reviewer findings
SHIP

F1 — ASK — tests/prose-only-diff.test.cjs:612-616 (and e94f0c9's message, "A fixture moved back to the index fails on Linux too")
- Guardrail: run a live control through your own harness; the apparatus that verifies the work can look right either way. The comment claims more than the shim proves.
- Scenario: a later edit simplifies the fixture to `repo.write(BROKEN, 'x = 1;\n'); const c1 = repo.commit('c1');` (the working tree, then `git add --all`). The shim sees only arguments, so it never sees the path. My mutation M5 of exactly this edit: 16/16 green on Linux. Only the Windows run would go red again, yet the comment says "a fixture back on the index fails everywhere". Two more claims are stated as fact but unverified: that Git for Windows' `add` prints "Invalid path" (on Windows the name cannot exist in the working tree, so `add` fails earlier and differently), and that "a tree object holds it on every platform" (Git for Windows' `mktree` has not been probed).
- Minimal fix: narrow the comment to what is proven. For example: "a fixture that hands the path to update-index or add as an argument fails everywhere; one staged by add --all or read from stdin is caught on Windows only". Mark the Windows `mktree` behaviour as expected, pending the laptop re-run.

F2 — ASK — .agents/changes/OS-20260925-slim-contract-pack/02-batches-04-prose-polish.md:167-174 (smoke step 4) and smoke-c1.json section 2, Step 2 (the published page)
- Guardrail: vacuous-until-later documentation; an issued input derived from the tree goes stale when a repair changes the tree.
- Scenario: at the C1 re-issue the user runs Step 2 on the new build. I-04 now prints `CODE lib/token.mjs`, exit 1 (verified here from the issued bundle). The step's Pass still requires `PROSE-ONLY 1 file(s)`, exit 0, "the residual, reproduced". So the step must be marked failed, which is a spurious C1 failure.
- Minimal fix (orchestrator; the implementer may not edit the batch file): re-author step 4 and page Step 2 to Pass on `CODE lib/token.mjs`, exit 1, with Runner agent (CLI), since the four named scenarios leave no residual to accept. Then rebuild and re-validate the page from the new build. At close-out, narrow BACKLOG's BL-046 row to the class fix only.

Hunk map (every hunk mapped; no scope creep):
- e94f0c9 (test only; `:612-658`): BROKEN/TAB, the index-refusing shim, the live control, and c1 built with `ls-tree -z` + `mktree -z` + `commit-tree`. This maps to the C1 failure report. The false comment "made in the index so any platform can commit it" is gone.
- afba68d, tool: `:38` skipcq, `:58` VERBS, `:64` rule-id `[/.:_-]`. This is BL-046's minimal fix exactly as the row words it. The second `_` sits inside a class that already has `\w`, so it is redundant but specified.
- afba68d, test: `:320`, `:331`, `:352`, `:355`, pins `:361/:363/:389`, and the CLI test `:477-498`. These are the owned entries and near-misses. `checkov:skip` is the real-comment witness that the verb check at `:402-405` requires for `skip`.
- Two separate commits, with the required message forms.

Acceptance, checked rather than taken on trust:
- The four named scenarios read `CODE` through the published CLI (test `:480`, plus my own per-cell run).
- I-04 reads `CODE lib/token.mjs`, exit 1. Live control: the pre-fix tool (e3af462) reads the same bundle as `PROSE-ONLY 1 file(s)`, exit 0.
- I-01 is unchanged (`PROSE-ONLY 1 file(s)` 0 / `CODE invoice.mjs` 1). The BL-042 grep prints nothing and exits 1.
- All 30 PROSE_COMMENTS entries read prose via `keptBy` (`:381`) and also through the published CLI on real commits: 30/30 PROSE-ONLY. My directive controls: 5/5 CODE.
- Ownership: removing each element on its own flips exactly its own scenario and reddens the test file. allow, allowlist and skip each give 3 fails; skipcq and `_` give 2 each, through the family and CLI tests as well as the pins.
- The fix only adds alternatives and widens one class, so no listed directive can regress to prose.
- B04 AC1-6 are untouched by the fix-up; the SHA pins and the REINSTATE and WRITE_LICENCES sweeps are green.
- AC2 holds for the listed vocabularies. The open-ended class is the accepted BL-046 residual, not a new finding.
- Side effect, fails closed (cost, not a finding): prose such as `// Parsers skip line comments.`, `// TODO: allow retries.` and `// We allow all origins here.` now reads as a shape, so rewording it triggers the scoped re-review.

Validation (worktree at afba68d, pinned wrapper):
- Plain: `PASS tests 562/564, 2 skipped (23s)`, exit 0.
- `FORCE_COLOR=1`: `PASS tests 562/564, 2 skipped (23s)`, exit 0.
- That is B04's 561/563 plus the one new test, with the Linux baseline's 2 skips. Logs: `b04c1-rev/plain.log`, `b04c1-rev/force-color.log`.
- `git diff --check` is clean, both files are LF at base and head, and the worktree is clean.

Failing-on-base: consistent with the diff, and reproduced independently.
- (B) afba68d's test file on e3af462's tree: 3 of 16 fail, at `:361` (size pin), `:388` (verb equality) and `:496` "gitleaks:allow appended (I-04)". Per cell, all five CODE scenarios read PROSE-ONLY before the fix and CODE after; the three near-misses read PROSE-ONLY both times.
- (A) Under the in-suite shim, the pre-repair fixture (M4) and the index route with the live control kept (M1) both go red with the laptop's line and blob: "Fixture command failed … update-index --add --cacheinfo 100644,198b8f89…,line", `128 !== 0`. With the shim removed (M2) or neutered (M3), the live control goes red (`0 !== 128`), so the control is live. This is proven as an emulation only.

Implementer concerns weighed:
- Git for Windows `mktree` cannot be checked here. In git's source, mktree refuses only a `/` in a name and never reaches the index-path check (`verify_path` → `is_valid_win32_path`). commit-tree, diff and cat-file never create a file by that name. So I expect the laptop to pass; if mktree does refuse, the test fails loudly at `:656`, never silently.
- The shim also refuses DEL (Git for Windows accepts it) and does not refuse `<>:"|?*` (Git for Windows does). Neither matters for the two names this test stages.
- tests/check-fence.test.cjs:64-74 predates this ledger (b3ce33e, 2026-09-18). It never stages the name on Windows and is green there. It is a weaker, platform-conditional case with no refusal asserted, not the reported defect: a BACKLOG candidate, not a finding against this diff.

=== end of B04 R4 reviewer findings ===
### B04 R4 test-hunter findings
FINDINGS 2

Scope: `git diff chore/slim-contract-pack-ledger...HEAD` at afba68d (worktree /home/timetotilt/worktrees/os925/b04-c1). Tests: tests/prose-only-diff.test.cjs, where :359 and :386 had their pins and corpus changed, :480 is new, and :643 got a rebuilt fixture plus its shim at :612-641. Code they cover: orchestrate/tools/prose-only-diff.mjs:38, :58 and :64, and for the shim, the fixture itself. No setup.json exists.
Harness: mutate.mjs with the scoped spec /tmp/claude-1000/-home-timetotilt-projects-orchestrate-skill/30346af3-7332-4e1a-b96e-3cbe367061c2/scratchpad/b04c1-hunt/scoped-spec.json. It runs only that test file, in pwsh as validate.json does, and keeps `git diff --check`. Mutations are in .../b04c1-hunt/mutations.json and the log is .../b04c1-hunt/run1.log.
- Result: `CONTROL PASS PASS tests 16/16 (7s)` with 0 skipped, which is the file's 16 tests. `MUTATE 8 killed, 6 survived, 0 other`.
- Every run's test names match the control's as a set (compared section by section in the log).
- Every SURVIVED run shows 16 pass, 0 fail, 0 skipped, and no file reported under its own name.
- run-at-ref: `AT afba68d PASS tests 16/16 (7s)`.
Verdict: the production change is correct and only widens: it can keep more comments, never fewer. Both findings need only test changes. Ranked by risk.

**1. ASK: skipcq is pinned by one form only, so narrowing the pattern to that form stays green.**
- Test: tests/prose-only-diff.test.cjs:320 holds the only skipcq comment (`// skipcq: JS-0002`). The keep sweep is at :366-370 and the CLI row at :488.
- Code: orchestrate/tools/prose-only-diff.mjs:38 `/(?<![\w-])skipcq(?![\w-])/i`.
- Class: a guard that SAMPLES the domain it claims to sweep. The ownership sweep tests each directive against one real form, so it cannot see an edit that NARROWS a pattern down to that form. skipcq is a listed name, so this is not the accepted residual about unlisted vocabulary.
- Mutation: `SURVIVED p1-skipcq-needs-colon` (:38 → `/(?<![\w-])skipcq:/i`).
- Consequence: at afba68d, `keptBy('// skipcq')` and `keptBy('/* skipcq */')` both return `['directive']` and nothing else (checked read-only). So under p1, no family keeps the bare form, which DeepSource uses to skip every issue on the line.
- Result: ` // skipcq` appended to a code line is stripped along with its leading spaces (remainder, :246) and reads PROSE-ONLY. That is BL-046's I-04 shape again. At HEAD the same edit reads CODE.
- Add:
  - `'// skipcq'` to DIRECTIVE_COMMENTS, moving the :363 pin from 46 to 47; :370 then goes red under p1.
  - A row in :485-492: `['a bare skipcq appended', text(header, code), text(header, code + ' // skipcq'), 'CODE']`.
- Route: test-only → ASK.

**2. ASK: the index-refusing shim covers two argument routes; the fixture's own idiom, put back on the index, stays green off Windows.**
- Test: tests/prose-only-diff.test.cjs:615-616 claims "so a fixture back on the index fails everywhere".
  - The shim at :618-641 reads only argv (:622-626).
  - The live control at :648-652 probes only `update-index --cacheinfo`.
- Guarded code: the fixture at :653-657; no tool code is involved. Git can receive the path from argv, from stdin, or from the work tree (repo.commit() runs `git add --all`, tests/support/git-fixture.cjs:69-72).
- Class: a guard that SAMPLES the domain it claims to sweep: it covers two argv routes, and its control tests only the easy one. Also a branch no input reaches: the `add` refusal.
- Mutations:
  - `SURVIVED t1-fixture-worktree-add-all`: :654-657 → `repo.write(BROKEN, 'x = 1;\n'); const c1 = repo.commit('c1');`. This is the idiom the rest of the file uses. On Windows the write fails, because the file name holds U+000A. That repeats C1's escape: green on every Linux gate, red on the laptop.
  - `SURVIVED t2-fixture-index-info-stdin`: the same entry staged by `update-index -z --index-info` on stdin. Git for Windows refuses this in add_cacheinfo/verify_path, just as it refuses --cacheinfo.
  - `SURVIVED t4-shim-add-never-refused`: `|add` dropped at :626.
  - Control: `KILLED t3-control-fixture-original-index-route` ("Invalid path"). The shim is live on the one route it covers.
- Add: once c1 exists, assert on the domain rather than the route. No `git ls-files -z` entry and no file name in repo.cwd may hold a code point below 0x20 (compare by code point, per :20-21). t1, t2 and t3 then go red on Linux, whatever route staged the path.
- Overlap: the R4 reviewer's F1 is the same scenario (their M5 ≡ t1) and proposes narrowing the comment instead. This assertion closes the gap rather than narrowing the claim.
- Route: test-only → ASK.

Checked and holding:
- Dropping any new verb is KILLED by :359, :386 and :480 (p3 allow, p4 allowlist, p5 skip).
- Dropping skipcq (p6) is KILLED by :359 (the size pin) and by :480's row "a skipcq rule id edited".
- Removing `_` from the first separator class (p7) is KILLED by :359 and by :480's row "a coverity event edited".
- The near-misses are live:
  - Making `allow` a bare directive name, the over-broad fix (p9), is KILLED by :359 and by :480's row "allow in prose appended".
  - Admitting a letter as a rule-id separator (p10) is KILLED by :359 and by :480's row "a bracketed index in prose edited".
- :388 and :393 bind VERBS, SCOPES and both list-built shapes to SHAPE_GRAMMAR.
- By trace, not run: the witness loop at :402-405 needs :62's `(?!\w)` to tell allow from allowlist, since only `pragma: allowlist` witnesses allowlist.
- :480's first row is I-04 byte for byte (evidence/C1/inputs/generate-c1-inputs.mjs:123-124), run through the published CLI on real commits.
- By trace: the fix keeps more comments, which sets `lines` (:267) more often and preserves line structure, so there is no new PROSE-ONLY path.
- :643's CLI assertion at :658 is unchanged. oneLine's hidden set is pinned at tests/check-ledger.test.cjs:922-924.
Survived, not counted:
- p8 (`_` dropped from the second class `[\w/.:_-]`): an equivalent mutant, because `\w` already includes `_`.
- p2 (skipcq's `i` flag dropped): there is no documented upper-case DeepSource form.
- Loosening skipcq's lookarounds (not run): that keeps more comments, the conservative direction.
Wrote only scoped-spec.json and mutations.json under b04c1-hunt; the harness wrote run1.log and at-head.log there.
- Housekeeping: there is a stray clone at /tmp/mut-y4h9fL, dated 07:33. It predates my run, so it is not mine, and I left it alone. A run killed by a timeout does not clean up its clone.

=== end of B04 R4 test-hunter findings ===

### B04 C1 fix-up — polish and integration

- Polish (same fix-up implementer, nonce matched) @`168421b`: two `polish:` lines appended and ticked in B04's
  batch file (7 added lines, none removed); `tests/prose-only-diff.test.cjs` only — the line-break fixture now
  asserts on the domain (no raw `ls-files -z` entry and no work-tree name below U+0020, by code point) with a
  live control (three names staged by `update-index -z --index-info` on stdin and written to the work tree:
  the fixture's own, `lib/unit<U+001F>separator.mjs`, `<TAB>lead.mjs`; on Windows each write must throw), a
  `plain name.mjs` twin at U+0020; the shim keeps only the `update-index` refusal C1 saw; the comment says
  only what these prove, Git for Windows' `mktree` acceptance marked expected. `// skipcq` joins
  DIRECTIVE_COMMENTS (pin 46 → 47) with a CLI row. The implementer's mutations: every fixture route (work tree
  + `add --all`, `--index-info` on stdin, `add -- <name>`, the original `--cacheinfo`) and seven guard mutants
  red; the skipcq narrowing red. Failing-on-base re-run with the regenerated shim: pre-repair 14/15 (the
  laptop's failure), `168421b` 16/16.
- Mechanical close: manual fence — `M` the batch file (ticked `polish:` lines only), `M prose-only-diff.mjs`
  (afba68d, reviewed at R4), `M tests/prose-only-diff.test.cjs`; the polish commit itself touched only the
  test file and the batch file → no production path → no re-review. Worktree validation `PASS tests 562/564,
  2 skipped (23s)`.
- Integrated: `git merge-tree --write-tree` clean (`10039bd`), `--no-ff` merge `c83ec7d`, tip `PASS tests
  562/564, 2 skipped (23s)` → B04 🧪. Worktree `b04-c1` removed.

### The maintenance experiment — the user's result

The user, verbatim: "Maintenance experiment on check-fence.test.cjs: 7 conhost before and after, no git/sh/bash
left over, both unmodified and with the edit. Times: ___ s unmodified, ___ s edited. Edit reverted."

Reading: `tests/check-fence.test.cjs` starts the most detached `git maintenance run --auto --detach` jobs of any
file (229 here), yet on the laptop nothing outlived the run with or without the edit (the 7 `conhost` are the
user's own consoles, unchanged). The detached maintenance is therefore not a leak there; the maintenance change
is NOT folded into this change (it fixes nothing measurable) and stays part of the process-volume residual for
`BACKLOG.md`. The report of "40+ thousand processes" reads as volume — the suite executes ~75k processes per run
here, likely 2–3× that on Windows, with test files running in parallel — not as survivors; the user is asked for
one `Get-Process | Group-Object Name` count after the Step 1 re-run to settle it. BL-029 (a timed-out validation
step's grandchild left running on Windows) remains the one known Windows survivor, bounded to a few processes.

### C1 issue 2 — QA re-verification

QA runner (default tier, hand-filled skeleton, nonce matched) on the build `c83ec7d`: steps 2, 6, 12, 13 (all
revision 2) PASS — step 2 `CODE lib/token.mjs`, exit 1 (BL-046's fix); step 6 eleven `SAME`, lengths as issue 1;
step 12 `PROSE-ONLY 1 file(s)`, 0; step 13 `CODE invoice.mjs`, 1. Evidence `evidence/C1/issue-2/step-02.md`,
`-06`, `-12`, `-13`; inputs I-01 and I-04 re-hashed, unchanged; resets proven; the blocks for 6, 12 and 13
byte-identical to issue 1's. B04's smoke step 4 re-authored in its batch file to match page Step 2 revision 2
(Runner agent: the four named directives fixed, nothing left for the user to accept; the open class stays in
BACKLOG).

### C1 issue 2 — page and proof

- `smoke-c1.json` re-issued by editing the issued issue-1 sidecar (a snapshot taken from `f6b4224`): steps keep
  their numbers and order; revisions raised — Step 1 (its suite changed), Step 2 (re-authored: verifies BL-046's
  fix, Runner agent), steps 6, 12, 13 (their covered `prose-only-diff.mjs` changed); fresh pre-verification on
  2, 6, 12, 13 (`evidence/C1/issue-2/`); the other nine carry issue 1's evidence (same revisions, labelled
  carried over); the gate names the new build and a canary that tells it from issue 1's build (I-04: `CODE
  lib/token.mjs`, exit 1; issue 1 printed `PROSE-ONLY 1 file(s)`). Built by the pinned `build-smoke-page.mjs`
  with `--previous` the issued sidecar (77272 bytes, every slot filled). Page diff against issue 1 reviewed:
  only the intended sidecar edits.
- Proof (`evidence/C1/issue-2/artifact-proof.md`): rendered-DOM read COULD-NOT-RUN as for issue 1; substitute —
  19 blocks via `html.parser`, no backslash or control character, every agent block byte-identical to its QA
  run's bytes, 5 gate + 13 agent blocks run as published from a fresh clone (tip `321b2be`), each as its Pass
  states. Harness slip caught: the extractor labelled Step 2 human by its number; its block was then compared
  and run separately.
- Rows stay 🧪; C1 row → 🧪 (issue 2); State AT-CHECKPOINT C1. The artifact is republished to the same URL
  and the branch pushed per the user's preauthorization (verdict log).

## 2026-09-26 — C1 issue 2: pass

The user's message, verbatim — two pasted blocks, the Step 1 totals of the README PowerShell recipe on the Windows
laptop (build `c83ec7d`, branch tip `7baa10b`) and the process count asked for after it:

```text
ℹ tests 564
ℹ suites 0
ℹ pass 564
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 245295.1468
```

```text
Count Name
----- ----
  101 svchost
   36 chrome
   21 msedgewebview2
   13 claude
   10 Code
    9 dllhost
    8 RuntimeBroker
    7 WorkloadsSessionHost
```

Reading: Step 1 passes as its revision 2 states (564 tests, 0 fail, 0 skipped — the repaired fixture's Windows
branch, B02's junction and file-link cases and the two Windows-only tests all ran); the hand-over said a pass closes
the change out, and with steps 2–14 pre-verified on this build, C1 passes. No `git`, `conhost`, `sh` or `node` in
the top eight after the run: the "40+ thousand" was volume, not survivors. The run took 245 s (earlier Windows runs
of this suite, 13–20 minutes).
