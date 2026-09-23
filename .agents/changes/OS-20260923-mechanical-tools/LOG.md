# Log — OS-20260923-mechanical-tools

Append-only narrative for this change: reviewer arcs, root causes, reconciliations,
fence-extension reasoning, pre-smoke findings, in-run learnings. Written ONLY by the
orchestrator, ONLY on the integration branch, in the same commits as PROGRESS. Never read
at boot — a PROGRESS Notes cell or session-log row names the heading to read. One `##`
heading per session (date), one `###` per batch or event. Never edit an earlier entry.

## Learnings

- One pinned registration list serialises a whole change. `NON_MARKDOWN` in
  `tests/protocol-contract.test.cjs` must list every non-Markdown file under `orchestrate/`,
  so any two batches that each add a tool can never share a wave. Ledgers 2–4 add more tools;
  plan their waves with this in mind.
- The planning-time pre-flight prompt was rendered into a file by a script (skeleton plus the
  pasted request, plan and batch files) and spawned with a short pointer and a nonce placed at
  the END of the file — the design B04 builds, applied by hand once. The report's line 2
  carried the right nonce, and the 77 KB prompt cost the orchestrator a three-line spawn.
- A pre-flight earns its cost on a tool-building plan: ten blocking findings, several of them
  things no test in this repository could have caught until a real ledger ran — a nonce
  readable from a file name, a pin line that could not be both quoted and parsed, a mutation
  outcome no Node suite can reach.

## 2026-09-23 — scaffold

### Discovery and preconditions

`git-evidence.mjs discovery` (complete, no diagnostics) found three ledger ids only under
`refs/remotes/origin/fix/backlog-table-rendering`: `OS-20260919-agent-tool-restrictions`,
`OS-20260919-backlog-sweep`, `OS-20260920-interview-sizing-backlog`. Each copy's State line is
COMPLETE, each copy's last ledger-changing commit is an ancestor of `refs/heads/main`, and all
three are archived on `main` — proven older copies, superseded, not active.
`.agents/changes/` is empty on `main`. The main checkout is on `main` at `fceab31`, equal to
`origin/main`, clean except the untracked `Features.md` (the user chose to leave it untracked).

### Environment facts verified

- The installed skill `~/.claude/skills/orchestrate` is a plain copy (not a junction) and
  `diff -rq` against the repository's `orchestrate/` found no difference at scaffold time. The
  contract therefore names its evidence helpers by absolute path into that copy, so B02's
  refactor of `check-fence.mjs` cannot touch this ledger's own gate.
- Baseline at `fceab31`: the README recipe gave `318 pass, 0 fail`, `git diff --check` clean,
  8m33s — slower than the previous ledger's ~4.6 minutes because a concurrent disk scan was
  running. The run is recorded here as a full-suite run for BL-015's close condition.
- Worktree root `C:/Users/fatbo/AppData/Local/Temp/claude/wt-os923/`: the MAX_PATH fact from
  `OS-20260919-agent-tool-restrictions` (scratchpad prefix ~150 + deepest tracked path 146) is
  now baked into the contract's conventions instead of being rediscovered a fifth time.

### Decisions beyond the interview

- **Pin scope.** The interview chose "tools dir + hash". Planning widened the hashed tree to the
  whole skill directory: B04's renderer reads its skeletons from `references/`, so a hash of
  `tools/` alone would let rendered prompts change mid-ledger unnoticed. Presented at approval.
- **Gate agents write one file.** File-based findings (#3) need the reviewer and test-hunter to
  write their full report somewhere; they are read-only by convention. B04 grants exactly one
  write — the findings file their prompt names, outside every worktree — and B05 extends that
  closed list by the hunter's mutations file. Presented at approval.
- **Disposable checkouts are shared clones**, not worktrees: a clone registers nothing in the
  user's repository, so a hunter's scratch tree can never appear in the fence check's worktree
  inventory, and there is no `.git/worktrees` admin directory to fail deleting.
- **Width-one waves.** A seam batch that pre-created stub tool files and registered them all at
  once would have allowed two two-wide waves; rejected, because it ships placeholder tool files
  and adds a batch, and waves buy wall-clock time, not tokens.

### Backlog sweep

`BACKLOG.md`'s Open table is empty; nothing is eligible. The "Noted, no action" entries
(BL-015, BL-024, BL-025) are not work items. BL-015 closes itself after three recorded
full-suite runs without the intermittent — this ledger's recorded runs count towards it; the
close is the orchestrator's at change-complete.

### Pre-flight

Verdict `10 BLOCKING, 13 ADVISORY`, with the rendered prompt's nonce on line 2. Every blocking
finding was fixed before the plan went to the user:

1. `{{SKILL_DIR}}` could not be both shell-quoted and parsed → stored raw, quoted in every
   command, with a space-in-path test (B03).
2. The pin makes five "a ledger never references this skill" passages false → B03 rewrites
   all five to the pinned-skill rule; B04 keeps the pasted-prompt list as the manual procedure.
3. The nonce was readable from the rendered file's name → an independent file id; the nonce
   lives only at the end of the body (B04).
4. The fail-closed slot check contradicted batch text that quotes slot tokens → one pass over
   the skeleton, checking skeleton slots only (B04).
5. The guardrail text is not in the contract, only a pointer to it → a `guardrails` fact (B04).
6. Findings forwarded by path would vanish with the scratchpad, while the SHA-pinned Recovery
   rows read the ASK list from LOG.md → a byte-for-byte LOG append before forwarding (B04).
7. B05's fence lacked `.claude/agents/test-hunter.md` → added, with one closed carve-out list.
8. CRASHED was unreachable: Node reports a test file that fails to load as a named failing test
   WITH a summary → `loadFailures` in B01's parse result; CRASHED also on a changed total (B05).
9. A full-recipe control plus mutations breaches the 10-minute shell cap, and a bare clone lacks
   setup → the hunter uses a spec scoped to the batch's tests; B03 writes `setup.json`, which
   B05 passes as `--setup`.
10. Smoke step 11 contradicted B05's output grammar → aligned; an abort prints only its line.

Advisories applied: module-level "defines" for the one-parser sweep, naming the three legitimate
locals (1); the corpus control asserts the failure it really produces and parity accepts
`batch-structure`/`batch-baseline` (2); the pin check joins the self-check and the baking rule is
scoped to the new tools (3); OS litter excluded from the hash (4); `--log` for both harness tools
and an async `runSpec` (5); `NODE_TEST_CONTEXT` dropped and tools spawned directly in tests (6);
`-EncodedCommand`, process-tree kill and a shell-step timeout test (7); I-09 as a bundle with
working-copy/reset instructions, named `tests` steps, `--help` listing role facts (8); the
README tools tree kept current by B03–B05 (9); the two line-break pins named (10); the nonce
limited to rendered roles (11); the scratch-tree sweep scoped to the hunter (12); no
`validate.json` for a `none` recipe, B05 raised to L, `--timeout` on smoke step 1, the error
digest named as an exclusion, and the acceptance lines that only restated `NON_MARKDOWN`
checklist items removed (13).

### Tip validation after the scaffold commit

`fd3f922`: 318 pass, 0 fail, `git diff --check` clean, in 8m21s with no concurrent disk scan —
so the ~8.5-minute run time is this machine's, not the scan's, which the contract's baseline note
suggests. It sits close to the Bash tool's 10-minute cap: every validation run needs the maximum
tool timeout, and B01's smoke step 1 carries `--timeout 570` for the same reason.

## 2026-09-23 — continue

### Boot

`git-evidence.mjs discovery`: one ACTIVE ledger (this one, on `chore/mechanical-tools-ledger`
and its `int` worktree); the three COMPLETE copies on `origin/fix/backlog-table-rendering` stay
superseded as recorded at scaffold. Reconcile: every row ⬜, no batch branch exists — correct
state. Resume-time validation on `2238eac`: 318/318, `git diff --check` clean, 8m40s. W1 opened
at wave base `2238eac` (open commit `5a89fc1`).

Prompts were rendered into scratch files (batch file + contract excerpts cut by heading
anchors, a nonce at the END) and spawned with a short pointer, as at pre-flight; every report so
far carried its nonce on line 2.

### B01

Implementer (default tier): DONE @`fbe839e`, 353/353 (318 + 35), 5/5 ticked. Deviation:
`-OutputFormat Text` before `-EncodedCommand` (pwsh 7 otherwise writes stderr as CLIXML).
Concerns carried forward: Windows PowerShell 5.1 (`powershell`) writes CLIXML to stderr even on
success, so B03's scaffold should write `pwsh` steps (C1's I-02 already names `pwsh`); the batch
file's stated reason for `-EncodedCommand` (5.1 stripping quotes from `-Command`) did not
reproduce under Node 22's quoting — kept as specified; the POSIX process-group kill is not
executable on this machine.

Fence check (installed `check-fence.mjs`): PASS, integration `5a89fc1`, batch `fbe839e`,
merge-base `2238eac`, no violations, no unknowns.

R1 — reviewer (default tier) FIX FIRST, test-hunter FINDINGS 5. Findings verbatim:

R1 reviewer (FIX FIRST @fbe839e):
1. P1 — orchestrate/tools/validate.mjs:279 (and runSpec :236, used at :202): `--timeout` accepts values whose ms exceed setTimeout's 2^31-1 cap. `--timeout 2147484` → Node TimeoutOverflowWarning, timer set to 1 ms, step killed, `FAIL s TIMEOUT after 2147484s`, exit 1. Same for runSpec({timeoutMs: 3e9}). Fix: reject `Number(flags.timeout)*1000 > 2147483647` as `UNKNOWN usage: …` in the CLI and apply the same bound to `timeoutMs` in runSpec.
2. ASK — tests/validate.test.cjs:697-710: timeout flag boundary pinned below only. Add `--timeout 2147484` → exit 2 `UNKNOWN usage:` and `--timeout 2147483` → accepted.
Reviewer notes (non-blocking): Windows grace path validate.mjs:197 runs taskkill on an already-exited pid (no effect, tiny pid-reuse risk; consider skipping on win32); `pytest -q` summary lacks `=` borders → NO SUMMARY/CRASHED (fail-closed; scaffold must not generate -q); POSIX detached steps do not get Ctrl-C.

R1 test-hunter (FINDINGS 5, each mutation RAN in a scratch copy; control 35/35 green):
1. P1 — orchestrate/tools/validate.mjs:197 grace-path `killTree(child.pid)` is ineffective: by then the parent pid is dead, so `taskkill /T` finds no tree; a probe against the unmutated tool shows the orphan still alive after the run. The covering test tests/validate.test.cjs:579-593 kills the orphan itself in t.after and never asserts the tool killed it (mutation M15, deleting the call, stays green). Fix: make the kill effective (e.g. kill the tree while the parent is still alive / track descendants) and assert the orphan is dead after the run — or delete the call and say so. Production change.
2. ASK — load-failure fallback SCRIPT_FILE (validate.mjs:19, used :65) tested only with `.cjs` (M01 `/\.cjs$/` stays green). Add location-less entries named .js, .mjs, .ts, .tsx each expected in loadFailures, plus a non-script name like x.test.json that must NOT be.
3. ASK — token alternations/optional groups without an owning case: jest `todo|pending` (:73, M08); pytest tokens errors/xfailed/xpassed/singular warning/rerun (:98, M09) and xfailed/xpassed in the total (:104, M10 — silently changes p/t); cargo optional `; finished in …` (:120, M12); TAP `# SKIP` (:54, M21). Add one case per alternation member with each summary total pinned.
4. ASK — one-line guard samples its separator set: tests/validate.test.cjs:298-305 loops only \n, \r, U+2028, U+0085 (M13 dropping 0x2029 at :226 and M31 moving DEL out of the stripped range at :227 stay green); the cli() helper at :31 counts lines with /^[^\r\n]+\n$/ so U+2028/2029/0085 leaking elsewhere would pass. Loop over every breaker production strips and make cli() reject all of them.
5. ASK — unreached branches: TAP `...` break (:57, M05), seconds form `m?s` (:45, M07), lone-CR arm of `\r\n?` (:21, M14 — CRLF/LF test covers CRLF only), log writer line-start string arm (:173, M18), pytest `m[1] === 'ERROR'` guard (:111). Add a case for each, or delete the code (deleting is a production change).

R1 fix @a70582d (implementer): timeout ceiling MAX_TIMEOUT_MS in CLI and runSpec; grace-path killTree DELETED (ineffective on Windows; log note says the holder is left running); TAP `...` break and spec `m?s` deleted as unreachable; every ASK closed with tests; 353/353. Fence PASS (integration 9e67fde, batch a70582d).

R2 — fresh reviewer (default tier) SHIP, fresh test-hunter FINDINGS 3 (test-only) → SHIP asks=4. Verbatim:

R2 reviewer (SHIP @a70582d, asks=1): every round-1 finding FIX VERIFIED (reviewer 1-2, hunter 1-5); 353/353, diff-check clean; no unmapped hunks.
1. ASK — tests/validate.test.cjs:35: the rewritten cli() one-line check (`endsWith('\n') && !leaksBreaker(slice(0,-1))`) accepts a stdout of exactly "\n", weaker than the old /^[^\r\n]+\n$/ (non-empty). A mutation printing an empty line on the success path keeps the `accepted` call at :750-751 green (it asserts only code === 0). Fix: add r.stdout.length > 1 to the helper's assertion.
Reviewer notes (non-blocking): the deleted grace-path kill DID work on POSIX (process.kill(-pid) reaches same-group descendants after the leader exits), so on POSIX a non-detached holder is now left running; a POSIX-only group kill in the grace path would restore it — a choice, not a spec violation. runSpec({timeoutMs: 0.001}) accepted (harmless, fails closed). pytest -q lacks = borders → B03 scaffold must not generate -q.

R2 test-hunter (FINDINGS 3, all test-only; control 35/35; every round-1 hunter finding FIX VERIFIED, deletions sound — real Node 22.22.3 TAP output probed):
2. ASK — one-line guard covers only one echo point: tests/validate.test.cjs:320-338 exercises only the UNKNOWN cannot-open-log / cannot-read-spec paths; validate.mjs:258 `line: oneLine(line)` (the PASS/FAIL line, carrying failing names and the log path) is unguarded — mutation `return { status, line, steps };` stays 35/35 green, and TAP names containing U+2028/TAB/U+0085 do reach it. Add: loop over BREAKERS minus \n and \r, each a fake TAP runner with `not ok 1 - a<b>b`, assert leaksBreaker(r.line) === false; plus one case with a breaker in logPath.
3. ASK — log header spacing pinned one side only: validate.mjs:175 `|| data[data.length - 1] === 10` (Buffer arm) can be deleted green (headers after newline-terminated output gain a blank line). Add to the four-step log test (:515) `assert.ok(!text.includes('\n\n==> step'))` or equivalent.
4. ASK — TAP directive `/^# (?:TODO|SKIP)\b/i` (validate.mjs:57): the i flag has no case (dropping it stays green). Add a `not ok 8 - x # skip` corpus entry pinning the chosen behaviour (test-only; dropping /i instead would be a production change).

### B01 — tip red after merge

Polish @`0310056` (4 ASKs closed, tests only; 354/354 in the implementer run) — fence PASS (integration `4af4814`), polish touched only `tests/validate.test.cjs` + the batch file → mechanical close. Dry run clean (tree `07ade61`), merged `--no-ff` as `437c42a`. Tip validation RED, reproduced once with full output:

Tip validation on 437c42a (the B01 merge), the contract's PowerShell recipe, run from the PowerShell tool — twice, identical:
ℹ tests 354 / ℹ pass 353 / ℹ fail 1
✖ shell steps run the script as one argument and propagate its exit code (6959.863ms)
  AssertionError [ERR_ASSERTION]: bash must receive embedded double quotes intact
      at TestContext.<anonymous> (tests\validate.test.cjs:605:12)
    actual: '==> step sh: shell bash\n\n',
    expected: /said "quoted" words/,

Orchestrator diagnosis (verify, do not trust):
- The same test passes 3/3 when run alone from Git Bash, and FAILS when run alone from PowerShell (`node --test --test-name-pattern='shell steps run the script' tests/validate.test.cjs` → exit 1).
- In PowerShell, `Get-Command bash -All` resolves `C:\Windows\system32\bash.exe` (the WSL launcher) first, then `…\WindowsApps\bash.exe`; Git Bash's own `bash` is not on that PATH. From Git Bash, `bash` is Git's bash.
- A trivial `spawnSync('bash', ['-o','pipefail','-c','x=1; echo hello; exit 7'])` from PowerShell's node returns status 7 and stdout "hello" — so WSL bash runs simple scripts, but the test's quoted script (`x='said "quoted" words'` / `echo "$x"` / `exit 7`) arrives mangled: exit 7 propagates, the echoed text is empty.
- Every green run during B01's review launched pwsh FROM Git Bash (inheriting Git's PATH), which is why no gate saw it. The contract's validation shell is PowerShell.

Repair: `fix/B01-tip` cut from `437c42a`, worktree `wt-os923/b01tip`, fresh implementer (default tier). Removing the merged `b01` worktree left `.git/worktrees/b01` undeletable (Permission denied — the OneDrive-synced main checkout); git no longer lists it; prune later.

### B01 tip repair — round 1

Implementer (default tier, no PowerShell tool — emulated the PowerShell PATH) DONE_WITH_CONCERNS @`56b8e1c`: on Windows a bash step probes each bash.com/bash.exe on PATH with a quoted two-line script and uses the first intact one by absolute path; altering launchers are skipped with a log note; none intact → `COULD-NOT-START (BASH-ARGV-ALTERED)`. Manual fence (named branch is not the plan row branch): `M orchestrate/tools/validate.mjs`, `M tests/validate.test.cjs`, both in B01’s fence, worktree clean, no filters. Failing-on-base from a real PowerShell session on `437c42a` + the new test file: 2/37 fail on the named behaviour (`FAIL sh exit 7` / `FAIL sh exit 9` vs `UNKNOWN sh COULD-NOT-START (BASH-ARGV-ALTERED)`). Recipe from real PowerShell on the branch: 355/355, 0 skipped, diff-check clean, 9m00s.

R1 — reviewer (default tier) SHIP asks=3; test-hunter FINDINGS 6 incl. one P1 (production change) → FIX FIRST. Verbatim:

Repair R1 reviewer (SHIP @56b8e1c, asks=3): failing-on-base confirmed independently (PowerShell PATH 35/37, Git Bash 36/37 — the two/one expected failures); Git Bash recipe 355/355; validate.test.cjs 37/37 under the PowerShell PATH; no unmapped hunks; non-Windows unchanged.
1. ASK — tests/validate.test.cjs:651-655 (stdout-comparison half of validate.mjs:185): the node.exe-as-bash.exe stand-in is rejected by its exit code (9), never by its output; only the live WSL control arms the stdout comparison. On a Windows machine without WSL, `if (r.status === 0)` stays green (M1b). Fix: a second stand-in that exits 0 with wrong output (e.g. a copy of %SystemRoot%\System32\cmd.exe named bash.exe — exits 0 with empty stdout).
2. ASK — validate.mjs:188: "first intact bash on PATH" order unpinned (deleting `if (bash) break;` stays green, M6). Fix: in the skip case use PATH [alterer, Git\usr\bin, Git\bin] and assert the log names …\usr\bin\bash.exe.
3. ASK — validate.mjs:177-178,191: per-PATH cache key untested (keying on '' stays green, M4; matters for B05's in-process runSpec loops). Fix: two runSpec calls in one process with different process.env.PATH, assert the logs name different bash results.
Reviewer notes (non-blocking): the probe's `$c` is the only thing that catches WSL's second evaluation; a transient probe failure is cached negative for the process (fails closed); a probe timeout / missing distro is logged as "does not receive a quoted script intact" (sometimes inaccurate, still fails).

Repair R1 test-hunter (FINDINGS 6; 19 mutations, each run from Git Bash AND under the PowerShell PATH; control 37/37 both):
4. ASK — tests/validate.test.cjs:615-645 bash part of the loop (:635-637): removing '-o','pipefail' (validate.mjs:163, M2) stays green under the PowerShell PATH (bash is excluded from SHELLS there) and is red only from Git Bash — the contract validates from PowerShell, so pipefail is unpinned there. Fix: on win32 when INTACT_BASH is null, run the bash part with withPath putting Git's usr\bin first, so bash always runs on Windows.
5. ASK — tests/validate.test.cjs:665 and :622 `doesNotMatch(log, /said/)` is a self-fulfilling canary: neither alterer can print "said" even when it runs the script. M18 (run the script through rejected[0], log its output) and M11 (silent spawnSync of the script) stay green in both environments. The property "a refused bash never runs the script" is unpinned. Fix: an unquoted marker line (echo ran-anyway) in the refused script, assert it is absent, plus a live control that WSL prints that marker when called directly.
6. P1 — the probe (validate.mjs:172-173,185), tested only through :647, samples its domain: only `$c` owns an alterer (WSL, M3). Removing `"b"` (M4), `\"` (M5), the second line (M6) or the r.status === 0 check (M7) stays green in both environments — the node stand-in fails every probe variant alike. Fix: export a pure check (probe text + a verdict on stdout/status) and test it with one simulated alteration per part (quote stripping, backslash-quote handling, truncation at the first newline, a non-zero exit, `$` expansion).
7. ASK — tests/validate.test.cjs:654-655 WSL control: only it kills M3, it is included whenever System32\bash.exe exists, and nothing asserts it actually runs a script (no distro → the probe could shrink to `printf x` green). Fix: when that file exists, assert it exits 7 on QUOTED_BASH (runs and mangles, not fails to start).
8. ASK — validate.mjs:188 `if (bash) break;` (same as reviewer #2; M10 green): add a PATH with Git's usr\bin in normal case then upper case and assert the log names the first spelling.
9. ASK — candidate listing validate.mjs:178,181-183: .com dropped (M8), the directory check removed (M9), relative PATH entries allowed (M13), quote-stripping removed (M14), cache key constant (M15, same as reviewer #3) all stay green; the test's bashOnPath (:604-605) copies the tool's loop line for line. Fix: a quoted Git folder in PATH, and a folder named bash.exe placed before it (low risk).
Hunter note: the timeout test uses SHELLS[0] (pwsh on Windows), so bash's timeout/process-tree path never runs on Windows — predates the repair.

### B01 tip repair — round 2

Round-1 fix @`6f5bfc3` (exported `BASH_PROBE`/`bashProbeIntact`; per-part alterations; marker-pinned refusal; bash pinned under a PowerShell PATH via Git usr\bin first). Manual fence: the two fenced files only, clean. Recipe from a REAL PowerShell session: 357/357, 0 skipped, diff-check clean, 9m55s — close to the 10-minute tool cap.

R2 — fresh reviewer (default tier) SHIP asks=2, fresh test-hunter FINDINGS 2 (test-only) → SHIP asks=4. Verbatim:

Repair R2 reviewer (SHIP @6f5bfc3, asks=2): all nine round-1 findings FIX VERIFIED (17 mutations, both environments); failing-on-base still holds (PowerShell PATH 4/39 red incl. the named `FAIL sh exit 7`; Git Bash 3/39); Git Bash recipe 357/357; validate.test.cjs 39/39 under the PowerShell PATH; every hunk maps; the BASH_PROBE/bashProbeIntact exports are justified by the P1 and harmless to B05 (imports runSpec only).
A. ASK — tests/validate.test.cjs:709-717: a machine-dependent verdict. On a Windows machine with the WSL launcher but no usable distro (e.g. only docker-desktop), System32\bash.exe exits non-zero, `assert.equal(r.status, 7)` goes red although validate.mjs correctly refuses the launcher and falls back. The P1 job it once did is now done machine-independently by the alteration test. Fix: probe the launcher with a plain `exit 7` first; if it cannot run a script, still add it as an alterer (so the refusal is tested against the real launcher) and report via t.diagnostic instead of asserting.
B. ASK — tests/validate.test.cjs:709: with no System32\bash.exe, the silent-run mutation (script run through rejected[0], output discarded) is caught by nothing (only the WSL marker catches it here). Fix: a t.diagnostic when WSL is absent so the lost coverage is visible.
Reviewer notes: git not on PATH → `.stdout.trim()` throws at module load (:620) — loud, but a load failure rather than a named assertion; a non-Git-for-Windows git turns :636/:669/:719 red (loud).

Repair R2 test-hunter (FINDINGS 2, test-only; 23 mutations run from Git Bash AND under the PowerShell PATH, control 39/39 both; all round-1 hunter findings #4–#9 FIX VERIFIED):
C. ASK — tests/validate.test.cjs:630 (assertRefused marker check) with :637 and :709: "a refused bash never runs the script" is armed ONLY by WSL's System32\bash.exe with a distro; neither stand-in ever runs a script. Mutation M11b (RAN): at validate.mjs:226 before `if (!command)`: `if (!command && resolved.rejected.length) spawnSync(resolved.rejected[0], ['-o','pipefail','-c', step.script], { cwd, env, stdio:'ignore' })` — with the test's wsl path pointed at a nonexistent file (simulating no WSL) and :637 disarmed, green 39/39 both. Fix (proven by the hunter): a stand-in that runs scripts but fails the probe — Git's usr\bin\bash.exe with BASH_ENV pointing at a file defining `printf() { builtin printf '%s' altered; }` (prints "alteredaltered", exit 0, still writes the marker); add it as a third alterer through the CLI env.
D. ASK — tests/validate.test.cjs:675-687 probe unit test (validate.mjs:175 bashProbeIntact): status tested only at 1; all simulated alterations are deletions (output always shorter). Green mutations (RAN): `status !== 1 && stdout === BASH_PROBE_OUT`; `status === 0 && stdout?.length === BASH_PROBE_OUT.length`; (traced) `!status && …` would accept a probe killed by the timeout (status null). Add: bashProbeIntact({...intact, status: null}) === false; status 2 === false; an equal-length substitution alteration (e.g. s.replace('$c','xy')) asserted to change the output without changing its length, and rejected.

Repair polish @`c1babae` (ASKs A–D, `tests/validate.test.cjs` only; a BASH_ENV printf-override stand-in now arms the refused-run marker on every Windows machine with Git; a WSL launcher without a distro is a diagnostic, not a red). Mechanical close: polish touched only the test file, worktree clean; real-PowerShell recipe 357/357, 0 skipped, 8m27s. Dry run clean (tree `71d1c7a`), merged `--no-ff` as `224a84c`; tip validation from real PowerShell 357/357, diff-check clean, 8m28s → B01 🟢, marker removed (`955f549`).

Carried to later batches: B03's scaffold writes `pwsh` validation steps (5.1 `powershell` writes CLIXML to stderr) and never `pytest -q` (no `=` borders → NO SUMMARY, fails closed); C1 step 1 runs from a real PowerShell session. Residuals for the close-out backlog sweep: the POSIX grace-path holder is left running (its old group kill worked there); bash's timeout/process-tree path is never exercised on Windows (the timeout test uses pwsh); a transient probe failure is cached negative with a possibly inaccurate log note.

Apparatus: (1) every sub-agent gate ran the recipe from Git Bash, where `bash` is Git's — the red was visible only from a real PowerShell session, so the orchestrator now runs the recipe itself from PowerShell on every repair and tip, and later prompts tell agents how to emulate that PATH. (2) The orchestrator's own `node -e` append turned `\b` in `usr\bin` into a literal backspace in LOG.md; a grep control caught it before commit and a sweep of every ledger file found no other. (3) Worktree removal leaves `.git/worktrees/b01` and `b01tip` undeletable (Permission denied, OneDrive-synced main checkout); git no longer lists them. (4) The real-PowerShell suite ran 8m27s–9m55s; recipe runs go in the background with exit codes captured to a file (never piped) because a foreground run near the 10-minute cap would be killed.

### W2 open

Wave base `955f549`; B02 on `feat/ledger-parser`, worktree `wt-os923/b02`.

### B02

Implementer (default tier): DONE @`7516682`, 384/384 under an emulated PowerShell PATH (420 s), 6/6 ticked, 29 mutants killed. Fence check (installed tool): PASS — integration `3dfbf82`, batch `7516682`, merge-base `955f549`.

Real-PowerShell recipe on `7516682` (run concurrently with the reviewer's and hunter's suites; 21m16s): 383/384 — `tests/build-smoke-page.test.cjs:847` "CLI reissue refuses to overwrite the existing HTML declared as an issued input": stderr was `…smoke-c1.json: output must not overwrite an input or the previous sidecar` where `/output must not overwrite an issued input artifact/` was expected. Not reproduced: that file alone 2/2 green on the B02 branch and 2/2 on the tip. Outside every fence of this change.

Diagnosis (BL-015's family): `build-smoke-page.mjs:318-323` `sameFile()` compares `statSync().ino` as a Number; on this machine NTFS file ids reach past 2^53 (a sample of 400 fresh temp files: one lost precision), so two distinct files can compare equal and the `:347` check fires first. This fits BL-015 (same file, an overwrite-refusal test, intermittent, unreproducible standalone). Fix shape: `statSync(p, { bigint: true })`. For the close-out: BL-015 returns to Open with this output and diagnosis attached (its own close condition), outside this ledger's scope.

R1 — reviewer (default tier) FIX FIRST, test-hunter FINDINGS 6 (same P1 found independently). Verbatim:

R1 reviewer (FIX FIRST @7516682): move byte-identical (--help SHA unchanged, check-fence tests untouched); 8-export sweep, checkBatch line checks (legitimate — rules inline in checkFence/validateBatchEdit, parity cases hold them), literal · and —, strict skillPin candidates, and parse failing after a Files-line extension are all judged correct. Recipe under a PowerShell-equivalent PATH: 384/384 (21 min, concurrent load).
1. P1 — orchestrate/tools/check-ledger.mjs:89-91: parse is LOOSER than the fence. A ledger whose B01 PROGRESS Notes carry `fence +.agents/changes/FIXTURE/02-batches-01-one.md (item, reason, 2026-09-23)` (also in the session log) → `PARSE OK 2 batches`, exit 0; the real checkFence on the same committed ledger → UNKNOWN ["authority:Redundant or ambiguous extension"]. parse copies only the first half of check-fence.mjs:98 (`fence.includes(p)`) and omits `|| p === batchFile`. Fix: pass path.basename(dir) into checkLedger and reject an extension equal to `.agents/changes/<basename>/<own batch file>` (resolve the own batch file before the PROGRESS loop); add the variant to CASES with fence: 'authority'; the CASES.length domain pin → 18.
2. (orchestrator-owned, NOT for the implementer) ASK — smoke step 3 prose expects `PARSE OK 5 batches` on this ledger, which becomes false for a legitimate reason if a later batch records a fence extension. The orchestrator annotates this at C1.
Reviewer observations (spec-level, unclassified — the orchestrator directs them into this round, see the resume message):
3. A Branch cell holding an impossible ref name (`feat/one x`, no backticks, a space) consistently in plan, PROGRESS and batch file → PARSE OK, but the fence can never gate it (validFullRef rejects it at usage). Tightening means importing validFullRef from git-evidence.mjs.
4. Symlinked authority files: parse reads through statSync (check-ledger.mjs:23, follows links); the fence requires ordinary blobs (check-fence.mjs:90, :108-110) — a symlinked plan or batch file passes parse but is UNKNOWN to the fence. lstatSync would close it.

R1 test-hunter (FINDINGS 6; every mutation RAN under Git Bash AND a PowerShell-equivalent PATH, control 27/27 both):
5. P1 — same as reviewer #1, reproduced independently (tests/check-ledger.test.cjs:92-126 CASES; check-ledger.mjs:91 vs check-fence.mjs:98). Aside outside the fence: deleting `|| p === batchFile` also leaves tests/check-fence.test.cjs green (93 tests).
6. ASK — boundary pinned one side: duplicate Branch line and duplicate `## Checklist` tested only at zero. `branchAt.length !== 1` → `< 1` (check-ledger.mjs:49) and `checklist.length !== 1` → `< 1` (:59) stay green (doubled line → PARSE OK; fence says batch-linkage / batch-structure). Add parity CASES "duplicate Branch line" (batch-linkage), "duplicate Checklist" (batch-structure), each naming file and line.
7. ASK — unreached checkBatch clauses: delete the "later ## heading" clause (:59) green (Checklist as last heading → PARSE OK; fence batch-structure); compare Files sorted (:55) green (reordered Files → PARSE OK; fence batch-linkage; spec says "in order"); title regex `^# ${id}` only (:47) green (`# B01: ...` → PARSE OK; fence batch-linkage). Add three parity CASES.
8. ASK — swallowed branch-cell errors: `catch (e) { if (0) add(PLAN` (:75) and the PROGRESS catch (:88) stay green; a plan Branch cell `` `feat/one`x `` → PARSE OK; fence `authority: Malformed branch cell`. Add two parity CASES (plan and PROGRESS) expecting `B01 Branch: Malformed branch cell`.
   ROOT CAUSE of 5–8: :140-141 pins CASES.length === 17 and the set of fence CODES, but one code covers many throw sites — one sample per code. Bind the domain to the fence's rejection sites (every `throw new Error('…')` message in ledger-parse.mjs plus each clause of check-fence.mjs:96,98,117,120 and validateBatchEdit :13) and assert each site is reached by a case no other case catches.
9. ASK (low) — `!m` orphan branch unreached: `if (m && !planIds.has(` (:105) green; `02-batches-x-foo.md` is silently ignored (spec: no batch file without a plan row). Add a parse-only shape expecting `no plan row claims this batch file`.
10. ASK (low) — non-regular-file branch (:139) unreached. Add a POSIX-only FIFO fixture (skipped on win32) expecting `UNKNOWN not a regular file or directory: …`.

### B02 — round 2 and the cap

Round-1 fix @`29430d6` (own-file extension, validFullRef branch check, lstat, a 33-site parity domain drawn from the fence source, 41 cases in one shared fixture repository; 409/409 in 415 s). Fence check PASS (integration `09aa643`, batch `29430d6`). Real-PowerShell recipe on `29430d6`: 409/409, 0 skipped, diff-check clean (26m42s under concurrent load).

R2 — fresh reviewer (default tier) FIX FIRST (one P1), fresh test-hunter FINDINGS 6 (all test-only). Second FIX FIRST → `⛔ green, residual finding open (P1)`, left out of integration; the wave has no other member, so the session STOPs for the user's verdict (fix again / ship with the residual / drop). Verbatim:

R2 reviewer (FIX FIRST @29430d6): every round-1 finding FIX VERIFIED (#1/#5, #3, #4, #6–#9; #2 N/A; #10 present, win32-skipped); no unmapped hunks; recipe under a PowerShell-equivalent PATH 409/409 (26.8 min, concurrent load); the 33-site domain recomputed by hand and matching; UNREACHABLE (ref-not-heads) sound; shared fixture repository isolates cases.
R1. P1 — orchestrate/tools/check-ledger.mjs:83 and :130: parse is looser than the fence — the sibling of the #3 fix (guardrails "a defect fixed in the reported instance and left in its sibling"; "at least as strict as check-fence.mjs on every shape the fence reads"). check-fence.mjs:63 rejects a ledger id failing validId and a batch-file path failing validPath before reading anything; parse checks neither. Reproduced against the real checkFence: a ledger directory named `OS-20260923-café` → `PARSE OK 1 batches`, exit 0, while the fence returns UNKNOWN usage on every batch; likewise `OS 20260923 x`; likewise a batch file `02-batches-01-one[1].md` (legal on Windows). Such a ledger can never be gated; a non-ASCII slug is a plausible scaffold output. Fix: import validId and validPath; report a problem when !validId(ledger) and when `.agents/changes/<ledger>/<own>` fails validPath; add both as USAGE parity cases — better, bring check-fence.mjs:63's clauses into fenceRejectionSites(), declaring the pure operator inputs unreachable and requiring an owning case for validFullRef, validId and validPath (hand-special-casing USAGE at :270/:278 hid this gap).
R2. ASK — tests/check-ledger.test.cjs:203-204: the PAIRED claim is false. A committed plan of valid UTF-8 plus bytes FF FE → the fence reports invalid-encoding and `authority: Missing authoritative ledger text`, no authority-file, so the MISSING #plan site is reachable alone and no case owns it (behaviour safe: parse returns UNKNOWN not UTF-8). Fix: "non-UTF-8 plan" and "non-UTF-8 PROGRESS" cases with unknown: /not UTF-8/, delete PAIRED.
R3. ASK — :210: throwsIn matches only single-quoted `throw new Error('…')`; a template-literal or double-quoted throw added inside `table` keeps the domain at 33, suite green. Fix: per block/body, count of `throw` tokens equals count of throwsIn matches. (Same class as hunter H1.)
R4. ASK — :262-280, :301-302: "parse is never looser" rests on each case's hand-written expectation; a case with non-empty sites but `expect: () => []` and no unknown demands PARSE OK and passes on a looser parse (a test that pins the defect). Fix: in the domain test assert `!c.sites.length || c.unknown || c.expect(c.edit(baseLedger())).length`.

R2 test-hunter (FINDINGS 6, all test-only; control 52/52 both harnesses; round-1 #5–#9 FIX VERIFIED, #10 present but win32-skipped; reviewer #3/#4 mutations red):
H1. ASK — tests/check-ledger.test.cjs:208-240, :265: the rebuilt domain samples the fence source and the extractor has no live control. Slices start at the first statement, not `try {`; only single-quoted throws; only diagnostic('authority-file'|'batch-baseline' and add('batch-structure' calls. Three planted fence sites stayed green 145/145 (check-ledger + check-fence), both harnesses: (n4) `if (plan !== null && plan.includes('ZZZ-SENTINEL')) throw new Error('Sentinel plan rejected');` between `try {` and check-fence.mjs:93; (n5) a template-literal throw inside the authority block at :95; (n6) `unknowns.push(diagnostic('authority', 'Sentinel batch file'))` after :90. Fix: slice from `try {` to the catch; match throws in any quoting; collect every diagnostic(/add( call carrying a measured code, with named exemptions; add a planted-source control asserting the domain grows for each of the three plants.
H2. ASK — :196-202, :274: the unreachable exemption is bound to a clause POSITION, not its text. (n10) moving `!batch.startsWith('refs/heads/')` into the usage guard at check-fence.mjs:63 and putting `!planRow.Batch` in its place at :96 stays green 52/52 — a real ledger-shape rejection is silently absorbed as "#ref-not-heads, unreachable". Fix: pin every CLAUSES label to its clause text on the source line, above all the exempt one.
H3. ASK — :129, :161: a site's key is code+message, not the document. (n3) `for (const row of file === PROGRESS ? [] : rows)` at check-ledger.mjs:39 stays green (a duplicated `| B02 |` PROGRESS row → PARSE OK on the mutant; base FAILs PROGRESS.md:35). (n2) dropping `, true` from the PROGRESS readText at :128 stays green (no linked-PROGRESS case). Fix: a duplicate-PROGRESS-id case, a linked-PROGRESS case, and the document in the site key.
H4. ASK — :173 (+ :331): Files count pinned one side — `#files-count` owned only by the duplicate case; `filesAt.length > 1` at check-ledger.mjs:57 stays green (a missing Files line → PARSE OK in a two-edit demo). Fix: a "missing Files line" parity case expecting `0 lines start "**Files**: "` at line 1, sites #files-count.
H5. ASK — :169-172: title regex parts sampled. Green in both harnesses: dropping `(?:—|-) ` at check-ledger.mjs:52 (`# B02 Shared…` → PARSE OK); dropping the trailing space (n11); parse no longer accepting `-` (n7); the FENCE no longer accepting `-` at check-fence.mjs:117 (n9; 145/145 and 52/52 — parse silently looser). Fix: a "title with a hyphen" case (sites [], expect []) pinning both tools, plus `# B01 One` and `# B01 —One`, each sites [TITLE].
H6. ASK (low) — :163: invalid-ref check pinned by one spelling; (n8) `/ /.test(branch)` for `!validFullRef(…)` at check-ledger.mjs:83 stays green. Fix: a second impossible name without a space, e.g. `feat/one..x`.

### B02 — third round (fix again)

Fresh implementer (strong tier: opus) → `be26458`: validId/validPath and the fence usage-guard clauses brought into a 50-site rejection domain (61 cases, four pooled fixture repositories); every round-2 finding closed; 430/430 under a PowerShell-equivalent PATH in 11m28s — the suite now exceeds the Bash tool's 10-minute foreground cap, so every recipe run goes to the background with its exit code captured to a file (a deviation from the contract's "foreground at max timeout" wording, forced by the suite's length; never piped). Fence check PASS (integration `08e1e01`, batch `be26458`). Real-PowerShell recipe on `be26458`: 430/430, 0 skipped, diff-check clean (27m21s under concurrent gate load).

R3 — fresh reviewer (strong tier) SHIP asks=2; fresh test-hunter (strong tier) FINDINGS 6, all ASK (two duplicate the reviewer's) → SHIP asks=6. Known residual (user decision, for BACKLOG at close-out): a plan Branch cell naming the integration branch passes parse and is refused by the fence at usage — parse never reads the contract. Verbatim:

R3 reviewer (strong tier, SHIP @be26458, asks=2): every round-2 finding FIX VERIFIED (R1–R4, H1–H6, each with a RUN mutation); the `#distinct-refs` residual declaration sound and correctly scoped (parse reads only plan/PROGRESS/batch files; the fence refuses loudly at usage); parallel harness isolation holds, 61 cases awaited and pinned; domain 22+12+16 = 50 recomputed by hand; smoke steps 4 and 5 simulated; recipe under a PowerShell-equivalent PATH 430/430.
A1. ASK — tests/check-ledger.test.cjs:245 (MEASURED, applied :363 and :515): the list of fence diagnostic codes counted as ledger rejections is hand-written and never checked against the codes check-fence.mjs raises. Reproduced: a planted conditional `diagnostic('ledger-shape', 'Sentinel plan rejected')` before the plan readBlob → check-ledger.test.cjs 73/73 green (the same plant with code 'authority' → red, the control). Fix: enumerate every literal code in the fence's diagnostic(/add( calls and require each in MEASURED or a named non-ledger list (merge-base, candidate-worktree, dirty-worktree, outside-fence, batch-type, batch-files, batch-content, invalid-diff, ref-race, worktree-race); pin both sizes.
A2. ASK — tests/check-ledger.test.cjs:266-268: the comment calls all four unreachable sites "Operator inputs, never ledger shapes"; `#distinct-refs` IS reachable from a ledger shape (a plan Branch cell naming the integration branch — passes parse, the fence refuses at usage). Fix: reword that comment as a combined contract+plan shape and name it as a known residual in the batch's closing record.
Reviewer note: JSON.parse at :458 runs inside the execFile callback — non-JSON output becomes an uncaught exception and a never-settling promise rather than an ordinary failed test (still loud).

R3 test-hunter (strong tier, FINDINGS 6, all ASK; every mutation RAN in Git Bash and under a PowerShell-equivalent PATH; control 166/166 both; every round-2 finding FIX VERIFIED; parallel harness: no finding):
T1. ASK (= A1, wider) — :245, :362-371, :515: MEASURED is closed and only diagnostic(/add( calls are scanned. Green plants after check-fence.mjs:91: (g_m8) `if (plan !== null && plan.includes('ZZZ-M8')) unknowns.push(diagnostic('ledger-shape', 'Sentinel new code', { path: planPath }));` and (g_m2) `unknowns.push({ code: 'authority', message: 'Sentinel object literal', path: planPath })` (the form the fence already uses at :54); demos show fence UNKNOWN while parse OK. Fix: every argument to unknowns.push / violations.push inside checkFence must be a diagnostic(<literal> call or a named exempt spread; the set of code literals in check-fence.mjs equals MEASURED plus a declared operational list; a planted control per shape.
T2. ASK — :347-361: only throws lexically inside the two try blocks are read; calls followed only into ledger-parse.mjs exports. (g_m1) `if (baseline.includes('ZZZ-M1')) throw new Error('Sentinel baseline rejected');` as the first line of validateBatchEdit (check-fence.mjs:8, called in the linkage block at :121) stays green; demo: fence batch-linkage, parse OK. Fix: also follow calls into check-fence.mjs's own module-level functions and run throwsOf over them; declare the message-less throws at :28/:30 as caught locally at :32; a planted control.
T3. ASK — :301-309, :348: layout-dependent. (g_m3) wrapping the title condition at check-fence.mjs:117 onto a second line makes conditionOf return null, so the || check never runs; (g_m7b) after the `try {` at :116, `if (baseline.includes('ZZZ-M7B')) throw new Error('Sentinel before nested try');` then `try { JSON.parse('0'); } catch { }` — lastIndexOf('try {') picks the inner try, the sentinel goes unread. Fix: find the enclosing `if (` by a balanced-bracket backward scan; take the block from the `try {` whose closing } sits right before the sink's catch; add both plants as controls.
T4. ASK — no case covers a non-UTF-8 BATCH file; the fence rejects it only as invalid-encoding (git-evidence.mjs:30 via readBlob at check-fence.mjs:111-112), outside MEASURED. (g_m5) `if (BATCH_FILE.test(path.basename(file))) return bytes.toString('utf8');` in the catch at check-ledger.mjs:29 stays green; demo: parse OK, fence UNKNOWN invalid-encoding. Fix: a case appending bytes to B1's file expecting /^UNKNOWN not UTF-8: .*02-batches-01-one\.md$/, and the harness measuring invalid-encoding by path.
T5. ASK (= A2) — :266-268, NEW CLASS "an exemption whose reason is true for the group but false for one member": `USAGE #distinct-refs` is reachable from a ledger (plan Branch = the contract's integration branch; demo: fence UNKNOWN usage, parse PARSE OK 2 batches). Test-only fix: re-declare it as a known gap with the real reason (parse never reads 00-READBEFORE.md). Closing the gap (parse reading the contract's Integration branch line) is a production AND spec change — a user decision, recorded as a residual.
T6. ASK — :338: `split(/^export /m).slice(1)` drops everything above the first export. (g_m4) a helper `function guard(text) { if (text.includes('ZZZ-M4')) throw new Error('Sentinel helper'); }` above `export const linesOf`, called at the start of table, stays green (accounting only — parse calls the same table). Fix: split bodies on every top-level declaration.

Polish @`50e669c` (T1–T6, `tests/check-ledger.test.cjs` + batch-file polish lines only; extractor rebuilt on a masked source with balanced-bracket scans and top-level declaration splits; domain 53; suite back to 9m53s). Mechanical close: fence PASS (integration `7a0bb0d`, batch `50e669c`), polish touched only the test file and the batch file; real-PowerShell recipe 431/431, 9m56s. Dry run clean (tree `ac7d000`), merged `--no-ff` as `5c24ece`; tip validation from real PowerShell 431/431, diff-check clean, 9m34s; live `check-ledger.mjs parse --dir` on this ledger: `PARSE OK 5 batches` → B02 🟢.

### W3 open

Wave base `5c24ece`; B03 (L) on `feat/contract-tool-wiring`, worktree `wt-os923/b03`; implementer default tier, reviewer strong tier.

### B03

Implementer (default tier): DONE_WITH_CONCERNS @`bc68b74`, 441/441 under a PowerShell-equivalent PATH (9m60s), 7/7, 10 mutations killed. Concerns: the spec's foreground-only validation rule cannot be obeyed at this suite's length; a quoted `--log` path (declared deviation); `subagent-prompts.md:50` still says quiet form (B04's fence). Fence check PASS (integration `bdad8b8`, batch `bc68b74`, merge-base `5c24ece`). Real-PowerShell recipe on `bc68b74`: 441/441, 0 skipped, diff-check clean (19m34s under concurrent gate load).

R1 — reviewer (strong tier: opus) FIX FIRST (4 P1: two are the batch spec's own wording copied faithfully, one came from the orchestrator's prompt note — "`pwsh`, never `powershell`" was too strong), test-hunter (default tier) FINDINGS 6 (test-only). Finding 1 changed an approved directive, so the orchestrator asked the user mid-round; the answer is recorded verbatim in the verdict log ("Allow background task (Recommended)"). Verbatim findings:

R1 reviewer (strong tier, FIX FIRST @bc68b74): every hunk maps; SHA-pinned tables, both §Read-only evidence tools sections and the pinned implementer paragraph byte-identical to 5c24ece (control: the changed validation section reported DIFF); no EOL change; recipe from a real-PATH PowerShell 441/441 (1163 s under load); the quoted --log judged sound.
1. P1 (the SPEC's wording, copied faithfully) — orchestrate/templates/00-READBEFORE.md:270 ("Never pipe, tail or background it") and protocol.md:535-536, from batch spec lines 73-74 and acceptance criterion 204-205. Features.md #5's "Runs in the foreground" describes the tool (it does not detach), not how the caller schedules it. Every wrapper guarantee (one line, real exit code, full log file) survives a harness background task; only a pipe, tail or shell & loses it. Scenario: the next ledger scaffolded here runs the wrapper as told; the suite takes 10–27 min; the Bash tool kills a foreground call at 600 s; no line and no exit code arrive — the orchestrator must break the contract. Pinned by tests/tool-wiring.test.cjs:203 and the UNDO patterns at :358-359 ("run validation in the background", "background the wrapper"). USER DECISION 2026-09-23 (verbatim below): amend to "never pipe or tail it; when it may outlast the runtime's command timeout, run it as a background task whose completion reports the one line and the exit code, and never read the log before it exits". Change the protocol sentence and the two UNDO patterns in the same round.
2. P1 — orchestrate/references/scaffolding.md:86-87 "a PowerShell block uses `pwsh`, never `powershell`" narrows beyond the tool (this came from the orchestrator's own prompt note, which was too strong): validate.mjs accepts `powershell` (run: PASS t51 1/1, exit 0, one CLIXML line in the log); on a PATH without PowerShell 7 (stock Windows) a pwsh step → `UNKNOWN t7 COULD-NOT-START (ENOENT)`, exit 2 — and the directive forbids the only working fix. Fix: "prefer `pwsh`; use `powershell` only where `pwsh` is absent (its log carries CLIXML noise)".
3. P1 — orchestrate/references/scaffolding.md:109 "Both run at scaffold time only" contradicts the wired rule: the `skill --contract` check runs at every boot (template boot step 3, protocol step 1); the stated reason (a fence extension changes the Files line) applies only to parse. The UNDO sweep does not catch it (probed). Fix: "The parse check runs at scaffold time only".
4. P1 (spec wording copied faithfully) — orchestrate/templates/00-READBEFORE.md:30 (and protocol.md:531-532) lists only SKILL MATCH / SKILL MISMATCH / UNKNOWN. With the skill uninstalled, `node "C:/nowhere/skill copy/tools/check-ledger.mjs" …` prints a Node `Cannot find module` stack, exit 1 (same as MISMATCH) — none of the three lines; an orchestrator may pick the manual procedures without asking. Fix: "anything but `SKILL MATCH` (including a tool that does not run) → STOP and ask".
5. ASK — tests/tool-wiring.test.cjs:307-311: OLD_CLAIMS misses the Baking rule's own old wording ("never referenced back to this skill"); restoring it in a scratch copy stays green 10/10 (live control red). Fix: a pattern + specimen for `never\s+referenced\b[^.]*\bskill`.
6. ASK — tests/tool-wiring.test.cjs:363-365: any negation in a clause exempts the whole clause; planting "A SKILL MISMATCH does not stop the session, so continue with the updated skill." into boot step 3 survives. Fix: exempt a clause only when its negation governs the matched directive; add that sentence as a must-catch specimen.
7. (orchestrator, out of fence) subagent-prompts.md:50 "Validation commands (all must pass; quiet form)" and execution-models.md:136 "(quiet form)" still say quiet form; template step 5 now says prompts carry "the wrapper command and its recipe". subagent-prompts.md is in B04's fence — carried to B04; execution-models.md is in no fence — BACKLOG at close-out unless B04 needs it.

R1 test-hunter (FINDINGS 6, all ASK; every mutation RAN on full worktree copies, Git Bash and a PowerShell-equivalent PATH; controls 10/10; M1c/M2c/M4c red controls; a COMBO of all 12 green mutations stays green across the full suite):
8. ASK (= #6, wider) — tool-wiring.test.cjs:363-365, 374-375: NEGATED skips any clause containing not/no/never anywhere. Green: template:270 "Pipe the validation output through tail when the full log is not needed." (M1; without "not" → red, M1c); template:30 "Skip the pin check when the skill directory has not changed since the last session." (M15). The only negated control puts "Never" directly before the verb. Fix: the negation must govern the matched verb; add a tight control where an unrelated negation elsewhere in the clause must still be reported.
9. ASK (= #5, wider) — :307-311 OLD_CLAIMS: restoring scaffolding.md:324-325's exact pre-batch "never referenced\nback to this skill." stays green (M2; `references?\s+` cannot match "referenced back"); README's old Rollout claim "a new skill version changes nothing about ledgers already scaffolded" has no pattern. Fix: use the literal pre-batch sentence of each of the five passages as the specimens and require each caught.
10. ASK — :193-194, :361: green: template:30 "An `UNKNOWN` from a moved skill directory → continue with Reconcile." (M4 — the pattern covers only on|after|despite SKILL MISMATCH); protocol.md:537 appending "Reconcile first, then run the pin check." (M6 — protocol ordering pinned only by includes). Fix: UNDO patterns for (SKILL MISMATCH|UNKNOWN)…→ continue and for reconcile-before-pin, each with a specimen.
11. ASK — :197-212 checks only §Validation commands; acceptance says "every validation run the template describes". Green: restoring "Orchestrator runs use the QUIET form above…" at template:270 (M3); boot step 5 at template:37 back to "run the validation commands (quiet form)" (M7); the spawn-prompt item at template:641 back to "(quiet form)" (M16); "When the suite is slow, run the block above directly instead." (M14). Fix: sweep every clause in the template and protocol that mentions a validation run — each names the wrapper or is the single manual-procedure clause; "QUIET form" appears only there.
12. ASK — :137-146, :152 unquotedSkillDirs checks only characters adjacent to the token; scaffolding.md:184 as `node "<SKILL_DIR>/tools/check-ledger.mjs skill --dir "<SKILL_DIR>"` (closing quote after .mjs dropped — a broken command) stays green (M17). Fix: require the quoted run to close before any whitespace (`"TOKEN/[^"\s]*"`), plus that shape as a control.
13. ASK — unpinned checklist passages (each deletion green in COMBO): SKILL.md:207 Mode continue "verifies its skill pin first" (M8); SKILL.md:191-192 the fill "bakes the pin line and writes validate.json/setup.json" (M12); README:166-168 the install sentence about updating an installed copy only between ledgers (M9); README:213 the validate.mjs tools-tree row (M10); scaffolding.md:126-129 the "Bake {{SKILL_DIR}}" paragraph (M11). Fix: pin each.
Hunter note: M5 (pin step moved before the worktree step) goes red only via the hard-coded numbering regex at :184; nothing asserts the pin step follows step 2.

Round-1 fix @`3b3dc03` (the user's background-task rule verbatim; pwsh preferred; only parse is scaffold-time; anything but SKILL MATCH stops; wider prose sweeps; 26 mutations killed in both shells; 441/441 in 9m44s). Fence PASS (integration `5a989d5`, batch `3b3dc03`). Real-PowerShell recipe 441/441, 0 skipped (18m24s under load). The batch file's acceptance criterion still reads "foreground … backgrounding"; the user's amendment in the verdict log supersedes it.

R2 — fresh reviewer (strong tier) SHIP asks=1; fresh test-hunter (default tier) FINDINGS 8, all ASK → SHIP asks=9. Verbatim:

R2 reviewer (strong tier, SHIP @3b3dc03, asks=1): round-1 #1–#6, #8–#13 FIX VERIFIED (#1's shipped wording matches the user's recorded option text exactly, pinned; no shipped doc still forbids a background task); #7 N/A; byte identity with 5c24ece holds for both Recovery tables, both capped-verdict tables, both §Read-only evidence tools sections and the implementer paragraph (control: the edited Validation section shows DIFF); all changed files still CRLF; recipe under a PowerShell-equivalent PATH 441/441 (1083 s). Note: the batch file's acceptance criterion (lines 204-205) still reads "in the foreground … backgrounding" — the amendment lives only in PROGRESS's verdict log.
A1. ASK — tests/tool-wiring.test.cjs:428-429 (`fires`): the negation check looks only at the match's start; every UNDO pattern is greedy ([^.;:]*), so a negated verb early in a clause starts a match that runs through a later, un-negated directive, which is exempted. Reproduced: planting "Never skip the reconcile step, and skip the pin check when the skill was only updated." into template boot step 4 → tool-wiring 10/10 green (live control: the bare "Skip the pin check when the skill was only updated." → 9/10). Also missed by undoing(): "Never pipe the recipe block by hand, but pipe the validation output through Select-Object." and "Do not only pipe the validation output, tail it too." (GOVERNS accepts `not only`). Fix: check the negation at every position a directive could start (e.g. iterate new RegExp('(?=(?:' + p.source + '))', p.flags + 'g'), or from each word boundary); add the "Never skip the reconcile step, and skip the pin check …" sentence as a must-catch control.

R2 test-hunter (FINDINGS 8, all ASK; round-1 #8–#13 and reviewer #5/#6 FIX VERIFIED; unmutated control 10/10 both shells; red controls N1c N2c N7c N12 N14c N21c N20 prove each sweep can fail; a COMBO of all 23 green mutations stays green in tool-wiring in both shells):
F1. ASK — tool-wiring.test.cjs:194-199, UNDO :421-423: boot step 3 checked only by `includes` of fragments; UNDO patterns are single word-order. Green when appended to template:30: N2 "If the check prints no SKILL MISMATCH, continue with Reconcile." (re-opens round-1 #4); N3 "Continue with Reconcile on a `SKILL MISMATCH` from a moved directory."; N4 "Only a `SKILL MISMATCH` stops the session."; N5 "Run the pin check only if the skill directory moved."; N16 "Verify the skill pin after reconcile."; N18 "The pin check is optional when the skill directory is unchanged." Fix: pin boot step 3's collapsed text by EQUALITY; either-order continue/after-reconcile patterns; these sentences as must-catch specimens.
F2. ASK — :426-429 GOVERNS, :439-447: tight controls all put the unrelated negation AFTER the match. G1 (any earlier negation exempts) and G2 (no one-word allowance) both stay green. Wrongly exempted: N1 "Why not pipe the validation output through tail…?"; N2 above; N11 "You cannot not skip the pin check." Wrongly reported: N10 "Do not under any circumstance skip the pin check." Fix: N1/N2 as must-catch controls; a far-side control ("Do not hesitate to skip the pin check" must be reported); a near-side exempt control ("Do not ever skip the pin check" must pass).
F3. ASK — :211-236, UNDO :414-419: green when appended to the template's validation paragraph: N8 "Start the wrapper in the background and move on without waiting for its line." (defeats the reporting condition of the user's rule); N9 "Read the full log after every run."; N6 "…run the recipe rather than the wrapper."; N7 "Use the block above instead of the wrapper…"; N17 "Tip validation uses the recipe directly."; N25 "Implementers in batch worktrees run the block above." Fix: pin that paragraph by EQUALITY; widen the recipe-instead pattern to (use|run) and "rather than".
F4. ASK — :224-226, :204: N24 (protocol.md:533 → "runs resume-time validation — not tip validation — through") green; N16p (append "Verify the skill pin once reconcile is done." to protocol step 1) green; :204 compares two substrings of one sentence, so its comment is disproved by N16p. Fix: pin protocol step 1 exactly (at least "every validation — resume-time and tip validation alike —").
F5. ASK — :91 + scaffolding.md:184-185: self-fulfilling canary — the test fills the template with a raw path of its own choosing. N13 ({{SKILL_DIR}} row → "wrapped in double quotes") and N19 ({{SKILL_SHA256}} row → "the SHA-256 of the skill's SKILL.md file alone") stay green. Fix: pin both registry rows; derive the fill's hash from the registry row's command text.
F6. ASK — :137, :386: SKILL_TOKENS is a hand list of three spellings (N14 `node <skill>/tools/check-ledger.mjs skill --contract` in scaffolding.md:106 green; `<SKILL_DIR>` red); REPO_RELATIVE matches forward slashes only (N21 `node orchestrate\tools\check-ledger.mjs` in SKILL.md green). Fix: subject = every `tools[/\]<name>.mjs` occurrence, names bound to readdir(orchestrate/tools).
F7. ASK — :279-284: the scaffold test writes validate.json by hand. N22 (Fill: per-line steps instead of ONE shell step whose script is the block's text) and N23 (setup.json condition flipped to "is n/a") stay green. Fix: pin both clauses.
F8. ASK — :336-383: N15 (Baking rule: a ledger may be "left as a pointer into this skill's reference docs where a rule is long") and N15k ("A ledger may also link to this skill's references/protocol.md" in the contract) stay green. Fix: an affirmative-pointer pattern over all docs, plus a pin on the Baking rule's "never left as a pointer" sentence.
