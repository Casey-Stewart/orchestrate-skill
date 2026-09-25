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

Polish @`b7b8454` (A1, F1–F8; `tests/tool-wiring.test.cjs` + batch-file polish lines only; boot step 3, the validation paragraph with the user's rule, protocol step 1, the Fill clauses, the Baking rule and two registry rows pinned by exact collapsed-text equality; the UNDO sweep checks negation at every match start; tool paths bound to readdir; 31 + 26 mutations red in both shells). Mechanical close: fence PASS (integration `bd4f9c3`, batch `b7b8454`), polish touched only the test file and the batch file; real-PowerShell recipe 443/443, 9m59s. Dry run clean (tree `9eec39c`), merged `--no-ff` as `3d3b264`; tip validation from real PowerShell 443/443, diff-check clean, 10m04s; live parse PARSE OK 5 batches → B03 🟢.

Residuals for the close-out: `orchestrate/references/smoke-page.md:85` and `:93` run `node tools/build-smoke-page.mjs …` (resolves only from inside the skill directory; exempted in the tool-path test, the exemption may only shrink); `execution-models.md:136` still says "(quiet form)" (in no fence). `subagent-prompts.md:50` is carried into B04's prompt.

### W4 open

Wave base `3d3b264`; B04 (L) on `feat/prompt-renderer`, worktree `wt-os923/b04`; implementer default tier, reviewer strong tier.

### B04

Implementer (default tier): DONE_WITH_CONCERNS @`6ecacf9`, 458/458 under a PowerShell-equivalent PATH (10m11s), 7/7, 23 mutations killed; declared an added `round` fact, the implementer role carrying [GUARDRAILS SECTION TEXT], gate findings written through a Bash heredoc, joined findings files, and its own third-round wording. Fence check PASS (integration `ce1fed9`, batch `6ecacf9`, merge-base `3d3b264`). Real-PowerShell recipe: 458/458, 0 skipped (20m44s under load).

R1 — reviewer (strong tier) FIX FIRST (3 P1), test-hunter (default tier) FINDINGS 8 (all ASK). P1 #2 changed the plan-approved "exactly one findings file" exception, so the orchestrator asked the user mid-round. The user first asked back whether the gate agents had any write tool at all (they do not — Read, Glob, Grep, Bash; a Bash write is conventional-only); the question was re-put with that context and both answers are recorded verbatim in the verdict log. The decision needs `tests/agent-definitions.test.cjs` (it pins the read-only pair as holding no Write/Edit, :16-23 and :570-573), which is outside B04's fence: extension recorded — W4 has no sibling, the path is in no other recorded extension, and it is not a ledger, version or changelog file.

Apparatus: the orchestrator's first attempt to record this round composed the findings in a Bash heredoc inside a command that also carried a single-quoted `node -e` script; Bash rejected the whole command at parse time (nothing ran, nothing was written). Rewritten through the Write tool and a script file — the same class the reviewer's P1 #1 names.

Verbatim findings:

R1 reviewer (strong tier, FIX FIRST @6ecacf9): real renders verified — the nonce is absent from the file name, printed path and pointer and occurs once on the last line; the CRLF B04 batch file quoting [NN]/[SKILL_DIR]/[NONCE]/[WORKTREE_PATH] passes byte-for-byte; a planted skeleton slot → `UNKNOWN UNFILLED [PLANTED SLOT]`, exit 2, no file; the carve-out is stated once per gate skeleton and definition, tools: lines untouched; the pinned implementer paragraph, the evidence-tools mirror, both SHA-pinned tables, the 6a line break and B03's exact-text pins intact; every hunk maps; recipe 458/458.
1. P1 — subagent-prompts.md:159-161, :237-239 (the heredoc write): a findings line that is exactly `EOF` ends the file there and the rest runs as shell (probe: `echo INJECTED-RAN` executed, the file kept 3 lines); doubled backslashes arrive halved in a quoted heredoc and a single-quoted echo alike — the damage happens before bash sees the text (a reviewer quoting `n.replace(/\./g, '\\.')` puts `'\.'` into LOG.md permanently); findingsFile accepts backslashes and the prose does not say to quote the path (an unquoted `C:\Users\…` target becomes a relative file inside the worktree). USER DECISION 2026-09-23 (verdict log): give the reviewer and test-hunter the Write tool, scoped — see #2.
2. P1 (the spec's own wording) — subagent-prompts.md:159-161, :237-239; .claude/agents/reviewer.md:14-15; test-hunter.md:15-16: "exactly one write" contradicts the rendered prompt — [VALIDATION COMMANDS] renders the template's `validate.mjs … --log "<session scratchpad>/<label>.log"` into the reviewer prompt (prompt.test.cjs:135/163), the reviewer has no scratchpadPath fact to fill it, and the absolute wording forbids the scratch mutation scripts every hunter here has used. USER DECISION 2026-09-23 (verdict log): "Add Write, scoped (Recommended)" — add Write (NOT Edit) to reviewer.md and test-hunter.md tools; prompts limit it to the findings file plus validation logs and disposable scratch under the session scratchpad, never inside any worktree or the repository; give both gate roles a scratchpadPath fact.
3. P1 — orchestrate/tools/prompt.mjs:206, subagent-prompts.md:62: [TYPE] takes the batch type word from the title (fix/feature/chore, scaffolding.md:198), so B04's rendered implementer prompt says `("feature: <summary> (batch 04)")` — not a conventional-commit type (this repo: 8 feat:, 0 feature:); commitlint would reject every commit and --no-verify is prohibited; prompt.test.cjs:169 pins the wrong form (a test that pins the defect). Fix: map feature → feat in ledgerValues and re-aim the pin.
4. ASK — template :551/:553/:556, protocol :507/:511, subagent-prompts.md:488-496: findings survive (appended and committed with PROGRESS before forwarding) but nothing says how to get them back out: after a crash between R1 FIX FIRST and round 2, rendering reviewer-round2 needs a previousFindingsFile and no step copies the byte-exact `### B<NN> R<k> … findings` section from LOG.md into a file — the orchestrator would re-type it. Also a fresh agent handed only the polish/fix-round resume block has no implementer prompt to work from.
5. ASK — subagent-prompts.md:117-121: the third round is two pointers (two reports, two nonces); "told 'you own this batch now'" cannot be delivered because the pointer is fixed text; the fix-round block hard-codes "round 1" in its commit message.
6. ASK — subagent-prompts.md:82-84: the main-checkout variant says "replace the worktree paragraph", impossible for a rendered file — say this variant is the manual (pasted) procedure.
7. ASK — subagent-prompts.md:481-482: nothing says who creates `<scratchpad>/gates/`; a respawned gate agent (after a wrong nonce) reuses `R<k>-<role>.md`, so a discarded agent's file can be appended to LOG.md if the respawn never writes.
8. ASK — subagent-prompts.md:471-472: the spawning rules publish `--out <scratchpad>/prompts` unquoted (the template quotes it); tool-wiring pins the unquoted form.

R1 test-hunter (FINDINGS 8, all ASK; every mutation RAN on git-archive copies in Git Bash and pwsh; red controls prove the harness):
9. ASK — prompt.test.cjs:322-324: the nonce-not-on-the-last-line refusal has no tight control (the plant adds a second [NONCE], caught by the count clause); deleting `|| !last.includes(NONCE_SLOT)` at prompt.mjs:117 stays green; a probe shows the mutant accepts a single nonce line above the report. Add a --skeletons plant moving the one nonce line up; assert `UNKNOWN … on its last line` and nothing written.
10. ASK — prompt.test.cjs:184 (with :128-185, :273-279): a role is never tied to its own block — `polish: { block: 'fix-round' }` at prompt.mjs:29 and the reverse swap stay green. Add: each rendered role contains its own block's opening line from promptBlocks of the live file; set(BLOCKS) equals the union of ROLES block/compose values.
11. ASK — prompt.test.cjs:75, 244-258: fact type-check refusals unowned — `value < 1` → `value < 2` at prompt.mjs:138 stays green (every round-1 gate would be refused; the fixture uses round 2 only); deleting the round1Sha check (:137), the `!value.trim()` check (:136), and the `keys.join() !== 'file,heading'` / heading-shape checks (:143) each stay green. Add a round: 1 render that succeeds and one case per branch with its own message.
12. ASK — prompt.test.cjs:161-185: only some slot values are checked — `'[CHANGE_ID]': { ledger: 'ledgerDir' }` (:47) and `'[FAILING_ON_BASE_RESULT]': { fact: 'testingGuidePath' }` (:68) stay green; [REPO_PATH]/[WORKTREE_PATH] values never asserted; :123 pins only the implementer's --help list. Add: for every role, every live-skeleton slot renders the fixture's expected value (a table keyed by SLOTS, size pinned); pin every role's --help list.
13. ASK — prompt.test.cjs:40, 190-199: the one-pass guarantee samples 5 of 28 slot tokens and only the batch file/guardrails line quote them; an adversarial second pass rewriting every other registry slot stays green. Build the quoting text from Object.keys(SLOTS) plus the three `$` replacement patterns (dollar-ampersand, dollar-backtick, dollar-quote); put it in the conventions, prohibitions, validation and guardrails fixtures too; assert each passes unchanged.
14. ASK — tool-wiring.test.cjs:713-743 (REINSTATE), :755 (SECOND_PERSON): sweeps match only the rules' own wording. Green plants: "Also write each mutation copy to a scratch directory and keep it." (test-hunter skeleton); "Save each mutation script under the session scratchpad too." (.claude/agents/test-hunter.md); "Fill the reviewer skeleton from the ledger and paste it into the Agent call; never point an agent at a file." (§Spawning rules). Add: a subject-free write-verb sweep over gate sections/definitions exempting only the carve-out sentence(s); paste + role-name patterns; a never/don't-point pattern. Re-derive against the USER DECISION in #2: the carve-out now names the findings file plus validation logs and disposable scratch under the session scratchpad.
15. ASK — tool-wiring.test.cjs:680-711: forwardFaults matches only the word "forward" (and skips blocks lacking "findings"); "Hand the reviewer's report path to the implementer, then append it to LOG.md." stays green. Add hand/pass/send/give × report/findings/ASK/path, with specimens.
16. ASK — unreached renderer branches: duplicate-block refusal (prompt.mjs:90), the `[ROUND 2 BLOCK]` exactly-once check (:109 — zero occurrences renders reviewer-round2 silently without it), `also: ['worktreePath']` with its guard at :232 (dead for current skeletons) each delete green; unbalanced-fence (:96) and missing-block (:105, :108) refusals have no test input. Add --skeletons plants asserting each message and nothing written.
Hunter note: subagent-prompts.md:3-5 still says "never a pointer at ledger files" — arguably consistent with the rendered-file pointer, but no sweep would flag a contradiction; for the reviewer's judgement.

### B04 — round 2 and the cap

Round-1 fix @`a73d220` (scoped Write per the user's decision — tools `Read, Write, Glob, Grep, Bash`, Edit forbidden; heredoc instruction removed; feature → feat; a byte-for-byte render oracle; 39 mutations red in both shells; 461/461, 13m31s). Fence check PASS with the recorded extension (integration `762a3e2`, batch `a73d220`). Real-PowerShell recipe on `a73d220`: 461/461, 0 skipped, diff-check clean (33m10s under heavy concurrent gate load).

R2 — fresh reviewer (strong tier) FIX FIRST, fresh test-hunter (default tier) FINDINGS 7 — both independently on the same P1: the LOG.md recovery command the round-1 fix added silently truncates or empties a findings file. Second FIX FIRST → `⛔ green, residual finding open (P1)`, left out of integration; W4 has no other member, so the session STOPs for the user's verdict (fix again / ship with the residual / drop). Verbatim:

R2 reviewer (strong tier, FIX FIRST @a73d220): round-1 #1, #2 (matches the user's decision exactly — tools `Read, Write, Glob, Grep, Bash` in both definitions; Edit, NotebookEdit and MultiEdit asserted absent; both gate roles take scratchpadPath; one carve-out per gate skeleton and definition, "or the repository" added — stricter; nothing else in the shipped docs grants more), #3, #5–#16 FIX VERIFIED; #4 NOT FIXED (partly: crash-respawn order fixed, recovery shipped but defective — R1 below). Every hunk maps; the Files-line change is the recorded extension; recipe 461/461. Judgements: awk from Git Bash acceptable in principle (the prose says "from Git Bash", the sibling `cat --` step works the same way, a PowerShell pipeline would re-encode); qa-runner.md:11 is a backlog note; suite time not caused by B04 (prompt.test.cjs 32 s under load, tool-wiring 20 s vs 19 s at base; the slowest are check-ledger/check-fence parity tests).
R1. P1 — orchestrate/references/subagent-prompts.md:502-506, the LOG.md recovery command added in the round-1 fix; violates the durability criterion and "verified means verified as published". Reproduced by running the shipped bytes (placeholders filled) in Git Bash against a throwaway repository: a findings body containing a heading-shaped line (`## Validation commands`, or a `# comment` line in a quoted script) comes back truncated at that line, awk exit 0; a heading matching nothing → an empty file, exit 0; a findings file with no final newline makes the next `cat -- … >>` glue the next file's heading onto its last line, and recovering that next file → an empty file, exit 0. Each truncated/empty file is forwarded as a fix-round or round-2 findings file and a finding is silently lost. Every session break before findings are used goes through this command (e.g. a "fix again" verdict given in a later session). tool-wiring.test.cjs:829-830 only checks the text is present; no test runs it. Minimal fix: the append step guarantees a final newline and adds an orchestrator-controlled closing marker line (e.g. `<!-- end B<NN> R<k> <role> findings -->`); recovery prints from the heading up to that marker and fails loudly on zero or more than one match (e.g. `END {exit !n}`); a test runs the published bytes on a LOG.md whose findings contain `## `, `# ` and no-final-newline cases.
R2. ASK — README.md:131-162: a reader who updates the skill but keeps older copies in ~/.claude/agents/ gets a reviewer/test-hunter without Write; the rendered prompt asks for a Write tool they lack, pushing them back to a Bash heredoc (the round-1 P1 path) or no file. Fix: one sentence saying to re-copy the definitions after updating the skill.
R3. Backlog note (out of fence) — .claude/agents/qa-runner.md:11 "keeps `Write` and `Edit` on purpose, unlike the reviewer and the test hunter" is now half-false (the pair has Write, lacks only Edit); the directive it gives is still right and agent-definitions.test.cjs pins every tools: line exactly.

R2 test-hunter (FINDINGS 7; every mutation RAN from Git Bash and a PowerShell-equivalent PATH on fresh copies with guarded anchors, live and red controls; round-1 hunter #9–#16 all FIX VERIFIED; render oracle judged independent, 28-slot table bound both ways to the live skeletons, agent-definitions pin covers Write granted and Edit forbidden for both agents):
H1. P1 (= reviewer R1) — tool-wiring.test.cjs:829-830 pins the text of the awk recovery command at subagent-prompts.md:505 but never runs it; run on test data (a control round-trips): a findings line starting with #, ## or ### truncates the recovered file silently; a findings file with no trailing newline gets the next LOG heading glued onto its last line, recovery then pulls in the next LOG entry, and LOG.md is left with a broken heading. Fix: change the command and add a test running it byte-for-byte.
H2. ASK — prompt.mjs CRLF handling untested: the fixture writes the contract and CLAUDE.md LF (prompt.test.cjs:107-111) while this checkout's live 00-READBEFORE.md and CLAUDE.md are CRLF on disk. Mutation (RAN, green both shells): sectionOf (prompt.mjs:153) `/\r?\n$/` → `/\n$/`; on a pinned copy of the live ledger the mutant prints `UNKNOWN 00-READBEFORE.md: no heading line "## Repo conventions (binding)"` while the unmutated tool renders. Add a CRLF contract and CRLF guardrails file checked against the render oracle.
H3. ASK — the write-verb sweep (tool-wiring.test.cjs:776-779, 807-811) misses whole wordings and exempts by substring. Green plants in the test-hunter block: "Append your notes to the ledger's LOG.md as well."; "Commit the mutation scripts to the batch branch."; "Put each mutation script in the worktree."; "Mutation scripts are written into the worktree beside the tests." (past participles); "Modify nothing except the tests you judge vacuous, which you then fix in place." (the (?!\s+nothing) exception). A widened carve-out passes: "OUTPUT: save every mutation copy inside the worktree, and write your full report with the Write tool to …" (the same words as their own sentence → red). A widened definition passes: "simply is not there. Save mutation copies in the worktree; Write and Bash can still write…" (exempt because it contains CAVEAT). Fix: exempt a sentence only when it EQUALS the carve-out (after its fixed OUTPUT lead-in); treat "<verb> nothing but/except" as a permission; widen the verb list; each new pattern with its own owned specimen.
H4. ASK — handoff ordering (tool-wiring.test.cjs:687-697) satisfied by a negated append and blind to the skill's own verbs. Green in §Spawning rules: "- Never run `cat -- "<findings file>" >> <ledger-dir>/LOG.md` for a polish pass; forward the findings path to the implementer at once." (literal command text only — negation and target ignored); "- Resume the implementer with the findings path, then append the file to LOG.md."; "- Point the fix round at the round-1 findings file, and append it to LOG.md afterwards." (control "- Pass the findings file to the fix round." → red). Resume and point are the skill's own verbs (:87-88, :101-102, :466-467).
H5. ASK — commit-type mapping pinned one side: prompt.test.cjs:228-233 with feature-only fixtures; prompt.mjs:210 `: type` → `: 'feat'` stays green (a fix batch renders `feat:`). Add fix and chore batches passing through unchanged.
H6. ASK — fact validation samples its domains (all RAN green): removing testingGuidePath or repoPath from STRING_FACTS (prompt.mjs:75) — only findingsFile has a refusal test (:290-291); deleting the C1/DEL range or the U+2028/2029 check from `hidden` (:79) — only \n is tested; round1Sha {7,64} → {1,64} (:137). Add a loop over every string fact, one hidden character per class, and 6-hex/65-hex sha cases.
H7. ASK — the guardrails section's stop at a HIGHER-level heading is untested (fixture prompt.test.cjs:66-67 has only a same-level ## after it); a mutation at prompt.mjs:161 stopping only at a same-level heading stays green. Add a # heading right after the section.
Hunter note: the test-hunter and reviewer skeletons still open "Use only Read/Grep/Glob and read-only git", contradicting the Write grant a few lines later; tool-wiring:800 treats that sentence as an allowed specimen.

## 2026-09-24 — continue

### Boot

`git-evidence.mjs discovery` (repository copy, read-only): one ACTIVE ledger (this one, on `chore/mechanical-tools-ledger`, its `int` worktree and every batch branch); the three COMPLETE copies on `origin/fix/backlog-table-rendering` stay superseded (archived on `main`). Reconcile: B01–B03 branches are ancestors of the integration tip (🟢 correct); B04 ⛔ awaiting its verdict (branch `a73d220`, two commits ahead, `b04` worktree clean); B05 ⬜ with no `feat/mutation-harness` branch (correct). The tip moved only in ledger files since the last green (`3d3b264`). Resume-time validation on `2198d7a` from a real PowerShell session (background task, exit codes captured, never piped): 443/443, 0 skipped, `git diff --check` clean, 9m38s.

### B04 — third round (fix again)

The user's verdict, given with the session's `continue`, is recorded verbatim in the verdict log: fix again. Consumed here: row → 🔄, `verdict 2026-09-24 fix again spent → third round on feat/prompt-renderer @a73d220`. Fresh implementer on the strong tier (opus), in the existing clean `wt-os923/b04` worktree, given the implementer skeleton filled from this ledger (batch file from the batch branch, contract sections cut by heading, fence = plan cell + the recorded extension), both rounds' findings verbatim from this LOG (§B04, §B04 — round 2 and the cap), the two B04 verdict-log decisions, and the diff command; told to close every round-2 finding (R1 = H1 P1, R2, H2–H7, the hunter note; R3 is out of fence) and to prove the P1 fix by a test that executes the published recovery bytes. Prompt rendered into a scratch file with the nonce last, spawned with a short pointer, as before.

Apparatus: the session's PowerShell PATH was captured to a scratch file and a Git Bash helper runs the contract's recipe through `pwsh` under that PATH; a live control showed `bash` resolving to `C:\Windows\system32\bash.exe` (the WSL launcher) there, as in a real PowerShell session. Every sub-agent's full-suite evidence this round runs through that helper; the orchestrator still re-runs the recipe from a real PowerShell session before any gate verdict is acted on.

### B04 — round 3

Third-round implementer (strong tier: opus) DONE @`b004d28`, nonce verified; 465/465 under the PowerShell-PATH helper (11m46s), 7/7, 31 mutations on anchor-guarded copies, all killed. Claimed: the append writes the file, a newline, then an orchestrator-owned marker line `=== end of B<NN> R<k> <role> findings ===`; recovery prints heading-through-marker and exits 1 without writing unless heading and marker each occur once with the marker after the heading; the join separates its files with a newline; the same commands stated in subagent-prompts.md §Spawning rules, template step 6 and protocol.md step 6; a test extracts the published bytes, fills only placeholders and runs them through Git's bash by absolute path in an LF and a CRLF-autocrlf checkout. R2, H2–H7 and the hunter note closed; R3 (`.claude/agents/qa-runner.md:11`) left open, out of fence. Fence check PASS (integration `0c1bfd2`, batch `b004d28`, merge-base `3d3b264`, no violations, no unknowns). Real-PowerShell recipe on `b004d28`: 465/465, 0 skipped, diff-check clean (21m09s under gate load); `git diff --check` over `chore/mechanical-tools-ledger...b004d28` clean.

R3 — fresh reviewer (strong tier) SHIP asks=2; fresh test-hunter (strong tier) FINDINGS 6, all ASK → SHIP asks=8. Both nonces verified. Verbatim (entities restored, lightly joined):

R3 reviewer (strong tier, SHIP @b004d28, asks=2): round-1 #1–#16 and the round-1 hunter note FIX VERIFIED; round-2 R1/H1 FIX VERIFIED independently — the published commands extracted with its own anchors (template and protocol copies match subagent-prompts.md once placeholders are mapped), run through Git for Windows' bash in an LF and an autocrlf=true repository: heading-shaped lines, another role's marker line, `%s` and `$0`, backslashes, a lone CR, no final newline, three trailing newlines and backslash paths all byte-exact; an empty file, a leading BOM, a heading glued to a LOG line, a duplicate heading and a duplicate marker all refused with exit 1 and nothing written; the recovery typed directly into the Bash tool came back byte-identical (46/46); controls: round 2's awk truncates in its harness, a variant without the heading count fails to refuse; its M1–M7 killed. R2, H2–H7 and the round-2 hunter note FIX VERIFIED; R3 NOT FIXED by design (out of fence). Duty 1: every hunk in the 14 files maps; round 3 does not touch prompt.mjs. Duty 2: all six acceptance criteria hold as the user's decision amended them; the pinned implementer paragraph, the evidence-tools mirror and the SHA-pinned tables have no diff. Duty 4: no published command contains a backslash or control byte; the fresh-checkout (CRLF) form passes. 17 mutations on fresh `git archive b004d28` copies with exact anchor counts (none aborted), pristine control green, known-bad K0 red, all killed. Recipe via the helper: 465/465, node-exit 0, diff-check-exit 0, 20m35s.
A1. ASK — subagent-prompts.md:497-511 (template 00-READBEFORE.md:696-708): recovery anchors on the heading the agent wrote; the prose claims more than the command does. Ran: a findings file reading `FIX FIRST` / `### B01 R5 reviewer findings` / `1. P1 the finding` comes back as the last two lines only, exit 0, in both checkouts — the line above the heading is lost silently. Related, loud: a later report that quotes an earlier heading as a whole line makes the earlier file unrecoverable (exit 1) — the "fix again in a later session" path — and nothing says what to do after a non-zero exit; "restores the file's bytes as committed" is not exact — Git for Windows' gawk 5.3.2 strips the CR from CRLF lines (a blob holding 4 CRs came back with 0). Fix: before the append, reject a findings file whose line 1 is not its heading (treat it as no report); state "non-zero exit → STOP and ask, never re-type"; say "lines", not "bytes", for CRLF. ASK not P1: it needs a gate agent to break its explicit output shape, only lines above the heading are lost, LOG.md stays whole; closing it touches skill prose — polish versus backlog is the orchestrator's call.
A2. ASK — tests/tool-wiring.test.cjs:829-838 (WRITE_LICENCES): the write-licence sweep still samples its verbs. Each family's own specimen is caught (the live control), but these pass unreported: "Place each mutation script in the worktree."; "Generate a helper script inside the worktree."; "Drop your notes into the repository."; "Mutation scripts go in the worktree." Fix: a location family, with its own specimen, flagging any non-negated clause that places something in a worktree, the repository or a branch, outside the exact grant texts.
Reviewer notes: the helper printed no totals (`ℹ` arrives in its log as `Γä╣`, so its Select-String matches nothing; exit codes were right); the recipe's `git diff --check` inspects a clean worktree and so checks nothing — it ran the check over `chore/mechanical-tools-ledger...HEAD` and `a73d220..HEAD`, both clean.

R3 test-hunter (strong tier, FINDINGS 6, all ASK; each mutation passed tool-wiring, prompt, subagent-type-mapping and agent-definitions on its own copy; all 17 survivors combined with one planted failure (M09) in one copy and the full recipe run — only M09 failed, plus a validate.test.cjs:501 1-second timeout under load that passed 39/39 on re-run; every earlier finding FIX VERIFIED with its mutation red):
T1. ASK — tool-wiring.test.cjs:953-1051 (the LOG.md round trip), a branch no input reaches: the published commands are never given a missing input or a target that already exists. Green: subagent-prompts.md:513 join `&&`→`;` (with the reviewer file missing the join exits 0 and the file holds only a newline plus the gate findings — ran on the real command); subagent-prompts.md:508 and template:706 `o > ENVIRON["F"]` → `o >> ENVIRON["F"]` (recovery onto an existing file keeps the stale bytes, exit 0); subagent-prompts.md:500, template:700 and protocol.md:642 append `&&`→`;` (a missing findings file appends a lone marker, exit 0; that round's real entry can then only be refused — two markers); subagent-prompts.md:513 join `>`→`>>`. Add: appending a nonexistent file exits non-zero and leaves LOG.md's bytes unchanged; joining with the reviewer file missing exits non-zero; recovering or joining onto a path pre-filled with junk gives exactly the committed or joined bytes. Production note (reviewer's call): on that failure the published join still leaves an empty joined file, and unlike the recovery sentence the join sentence never says "only after a zero exit".
T2. ASK — tool-wiring.test.cjs:688-698 and :960-962, a defect fixed in the reported instance and left in its sibling: the one-command-three-statements check compares only statements it finds in three named files, and computes protocol.md's recovery without comparing it. Green: protocol.md:646 gaining round 2's truncating recovery (`git show <integration-branch>:./<ledger-dir>/LOG.md | awk -v h='### B<NN> R<k> <role> findings' '$0 == h {p = 1; print; next} /^##?#? / {p = 0} p' > "<findings file>"`); template:708 gaining round 2's join (`cat -- "<reviewer file>" "<gate file>" > "<joined file>"`). Add: across documents() and the agent definitions, every code span naming `<findings file>`, `<reviewer file>`, `<gate file>` or `<joined file>`, or piping/appending LOG.md, must equal the published command; pin the count per file.
T3. ASK — tool-wiring.test.cjs:711-726 (appendAt/forwardFaults), NEW CLASS: the order check compares text positions, so a sentence whose grammar reverses the order passes; one-word negation window and a closed verb list (sampling). Green, the rule reversed in its own sentence: subagent-prompts.md:502-503 "…and only then forwards the path" → "…, having already forwarded the path"; template:703 "and only then is its path forwarded" → "its path forwarded before the append"; protocol.md:644-645 the same reversal. Green, bullets added to README.md: "- Before running `<append>`, forward the findings path to the implementer."; "- Run `<append>` only after forwarding the findings path to the implementer."; "- Don't ever run `<append>` for a polish pass; forward the findings path to the implementer at once." Green, bullets added to subagent-prompts.md: "- Point the fix round to the round-1 findings file, and append it to LOG.md afterwards."; "- Provide the findings path to the implementer, then append the file to LOG.md." (In subagent-prompts.md, the template and protocol a bullet repeating the append goes red only by accident, via logCommands' "publishes more than one append command"; H4's own plant is red there for that reason.) Add: these eight as must-report specimens; count an append only if nothing earlier in its clause negates it (reject on doubt); treat before/after/already/having as putting the hand-on first; add point…to, provide, share and supply as hand-on verbs.
T4. ASK — tool-wiring.test.cjs:840 via governed() at :486-494, sampling: the one-word negation window reads a double negative as a prohibition; the must-pass controls use only "Edit nothing." and "Write nothing.". Green: subagent-prompts.md:238 plus "Never skip saving your mutation scripts in the worktree." Add it as a must-report plant; a negator does not govern across a negative verb (skip, omit, neglect, forget, fail, avoid, hesitate).
T5. ASK (low) — tool-wiring.test.cjs:854, positive-only assertions on prose: the check for a sentence denying the Write grant matches only the old sentence's exact punctuation. Green: subagent-prompts.md:238 plus "Use only Read, Grep, Glob and read-only git." Add: in each gate block, any "use only …" tool directive must carry the Write carve-out.
T6. ASK (low) — prompt.test.cjs:374-377, a boundary pinned on one side only: the tested visible neighbour of the C1 range is U+00A1, not U+00A0. Green: prompt.mjs:79 `n <= 159` → `n <= 160` (a no-break space refused, loudly). Add U+00A0 among the accepted neighbours, or pin its refusal on purpose.
Hunter apparatus: the helper never printed totals or failing names (pwsh re-decodes node's ℹ/✖ through the console code page); its first combined full run was invalid (plants repeated the append and tripped the one-append guard) and was rebuilt; it had no Write tool, so scripts went through quoted heredocs, swept afterwards: zero backslash or control bytes.

Orchestrator scoping for the polish (the contract: an ASK never licenses a production behavior change; `orchestrate/**` is this repository's product, so its prose is production here): A2 and T1–T6 are test-only. A1 is split — its factual correction ("bytes" where the command restores lines when the committed blob holds CRLF) is wording in the batch's own prose and rides the polish; its two new directives (reject a findings file whose line 1 is not its heading; stop and ask on a non-zero recovery exit) and T1's production note (the join's zero-exit condition) change the published procedure, so they are not made here — residuals for BACKLOG.md at close-out. A polish touching `orchestrate/**` takes the fix-diff-only scoped re-review.

Apparatus: (1) the helper's missing totals reproduced with a one-test repository under the emulated PATH; fixed by setting `[Console]::OutputEncoding` to UTF-8 in the recipe script before the redirect; control: the green repository prints `ℹ tests 1`, a planted red prints `node-exit=1`, the failing name and helper exit 1. Earlier helper runs' exit codes stand; only their printed totals were missing. (2) The contract recipe's `git diff --check` compares the working tree with the index, so on a committed, clean worktree it checks nothing; the orchestrator adds `git diff --check <integration>...<batch>` to each mechanical close from here on.

### B04 — polish and scoped re-review

Polish @`0d6fcef` (resumed third-round implementer; nonce verified): eight `polish:` lines appended and ticked (15/15); A1 wording only in subagent-prompts.md §Spawning rules ("restores those lines as committed (a CRLF line comes back LF under Git for Windows' awk)", pinned; no document may make a byte claim for the recovery); A2 a location family in the write-licence sweep; T1 missing-input and pre-filled-target round-trip cases; T2 every code span naming a findings/reviewer/gate/joined file or piping/appending LOG.md must equal a published command, counts pinned (protocol 1, subagent-prompts 3, template 2); T3 clause-level append negation, order words, point…to/provide/share/supply; T4 no negator governs across a negative verb; T5 every gate "use only" line carries the carve-out; T6 U+00A0 as the accepted neighbour. 33 mutations and plants on anchor-guarded copies, all red. prompt.mjs and every published command unchanged; A1's two directives and T1's production note not made (residuals). Helper under the PowerShell PATH: 466/466, totals now printed; range diff-check clean. Mechanical close: fence PASS (integration `bb0ed5d`, batch `0d6fcef`, no violations, no unknowns); polish paths = the batch file, `orchestrate/references/subagent-prompts.md`, `tests/tool-wiring.test.cjs`, `tests/prompt.test.cjs` — a production file touched → fix-diff-only scoped re-review; `git diff --check chore/mechanical-tools-ledger...0d6fcef` clean; real-PowerShell recipe on `0d6fcef`: 466/466, 0 skipped, diff-check clean, 13m48s.

R4 — fresh scoped re-reviewer (strong tier, polish-phase, not a round) SHIP @`0d6fcef`, nonce verified. Verbatim (entities restored, lightly joined):

R4 scoped re-review (SHIP @0d6fcef): A1 CLOSED (wording, as scoped) — the published append and recovery extracted from subagent-prompts.md:500/508 and run in Git for Windows' bash on committed blobs: LF blob exit 0, bytes identical; CRLF blob (8 CRs; `git show … | cat` keeps all 8) exit 0, 0 CRs, equal to the original with CRLF made LF; `| awk '{print}'` alone drops the CRs, so "under Git for Windows' awk" is exact; putting back "the file's bytes" turns the pinned sentence red. A2, T1–T6 CLOSED, each ask's own mutations and live greens now red. Hunk mapping: every hunk maps to an ask (batch file: the eight polish lines; subagent-prompts.md:509-510 A1; prompt.test.cjs:366-377 T6; tool-wiring: T1–T5, A2 and the A1 pin). No behavior change: prompt.mjs, the template, protocol.md, SKILL.md, README and the agent definitions untouched; the only prose hunk is a claim in §Spawning rules outside every prompt block; the command at :508 and every directive byte-identical; the deferred directives still absent and owed to BACKLOG.md. Acceptance criteria hold; full recipe at 0d6fcef with the finding-3/4/5 specimens applied live 466/466; `git diff --check b004d28..HEAD` clean; no control bytes; blobs LF in both commits; mutations only in scratch clones with exact-once anchors.
S1. ASK — tests/tool-wiring.test.cjs:883-884, a guard that samples its domain, introduced by this polish: the 'a commit or an addition' specimen moved from "Commit the mutation scripts to the batch branch." to "Add a regression test for each finding.", so `commit|commits|committing` lost its only owned case; with that alternation replaced by a dead literal the suite stays green at 0d6fcef (red at b004d28, "its specimen must be caught by it alone"). Fix: plant "Commit your notes as well." (verified red once commit is dead).
S2. ASK — same file :865 (SCOPE_BREAK) and :887 (`branch(?:es)?`), a branch no input reaches: SCOPE_BREAK replaced by a never-matching test stays green; `branch(?:es)?` replaced by a dead literal stays green (the only branch plant is also caught by the commit family). Fix: plants "Do not edit the tests, but mutation scripts go in the worktree.", "Never fail to place your mutation scripts in the worktree." and "Mutation scripts go into the batch branch." (each reported now, red once its branch dies — verified).
S3. ASK — same file :887 (the location family), sampling: it keys on a closed list of prepositions and on affirmative placement. "Write nothing outside the worktree." passes all five families (a negated exclusion confining every write to a worktree, the opposite of the carve-out); "Do not write outside the worktree.", "Use the worktree for your mutation scripts." and "Mutation scripts belong on the batch branch." also pass. Fix (reject on doubt): flag any gate-block clause naming a worktree, repository, branch or checkout outside the exact grant texts, WHERE_TO_WORK and "Worktree: [WORKTREE_PATH]." (the only other such line in the three gate blocks).
S4. ASK — same file :487 NEGATOR, :721 APPEND_NEGATOR, :722 ORDER_WORD, an illustrative list shipped as a closed set: "Never stop saving your notes." passes NEGATOR; APPEND_NEGATOR has only skip/omit/avoid while NEGATOR and SCOPE_BREAK have seven verbs — "- Forget running `<append>` for a polish pass; forward the findings path to the implementer." passes, as does the Neglect version (the Skip control is reported); template:703 changed to "its path forwarded prior to the append;" or "its path forwarded first;" stays green; "Run `<append>` once the findings path has been forwarded" passes. Fix: one shared negative-verb list; for order, allow a hand-on in the append's own clause only after a "then" that follows the append (all three live statements say "only then"), instead of enumerating reversal words.
S5. ASK — same file :897 `useOnlyFaults`, sampling its trigger phrase: "Only use Read, Grep, Glob and read-only git." in a gate block stays green. Fix: flag any gate sentence naming two of Read/Grep/Glob without the carve-out.
S6. ASK — same file :1167 (the `>>…LOG.md` filter), a branch no input reaches: killing the filter stays green because every control and live append also names `<findings file>`, so `cat -- notes.md >> <ledger-dir>/LOG.md` would slip past both the scan and the count. Fix: add that span as a control.
Reviewer note (A1 coverage): the new parenthetical is verified by its run, not by the suite — the round trip only ever commits LF blobs; a case with a CRLF blob committed under `core.autocrlf=false` would pin it.

A scoped re-review's SHIP completes the close (contract step 6); S1–S6 and the A1-coverage note are test-only residuals for BACKLOG.md at close-out, with A1's two directives, T1's production note and R2's R3 (`.claude/agents/qa-runner.md:11`).

Integration: dry run clean (tree `561e8f9`), merged `--no-ff` as `e8a9ca0` (same tree); tip validation from real PowerShell 466/466, 0 skipped, diff-check clean, 13m46s; `git diff --check` over the merge clean → B04 🟢. The `b04` worktree directory is removed; `.git/worktrees/b04` is undeletable (Permission denied, the OneDrive-synced main checkout) and git no longer lists it. Metrics: gate = 40 findings (R1 8 + 8, R2 3 + 7, R3 2 + 6, R4 6), 5 of them needing a production change (R1 #1–#3, R2 R1 and H1).

Live `check-ledger.mjs parse --dir` on this ledger now prints `PARSE FAIL 1 problem(s): 02-batches-04-prompt-renderer.md:8 Files line differs from the plan fence`, exit 1. By design: the shipped scaffolding.md says the parse check runs at scaffold time only because a recorded fence extension later makes a Files line differ from the plan, and B04's recorded extension (`tests/agent-definitions.test.cjs`) reached this branch's copy of the batch file with the merge. But B02's smoke step 3 expects `PARSE OK 5 batches` from this ledger; C1's close-out corrects that step (bumping its revision) before the page is issued.

### W5 open

Wave base `e8a9ca0`; B05 (L) on `feat/mutation-harness`, worktree `wt-os923/b05`; implementer default tier, reviewer strong tier. The B05 batch file predates B04's merge (it quotes the gate agents' old read-only sentence and assumes a findings-file-only carve-out); the spawn prompt names that drift and the user's scoped-Write decision as binding.

### B05

Implementer (default tier): DONE @`358d45d` (commits `e1dad75`, `427df1d`, `358d45d`), nonce verified; 492/492 under the PowerShell-PATH helper (17m50s; `e1dad75` 491/491, `427df1d` 492/492), `git diff --check chore/mechanical-tools-ledger...HEAD` clean, worktree clean, 7/7; 41 mutations of its own commit through the tool on clones, all KILLED after a passing control. Claimed beyond the spec, each with a test: the clone runs no user-configured git hook; a target that is not a regular file inside the checkout (a directory, a path through a junction) is refused as `ANCHOR-MISSING <id> (not a regular file inside the checkout)`; overlapping anchor matches count as ambiguous; a file is CRLF only when every line break is CRLF; a control whose test step ran zero tests is `CONTROL FAILED … — step X ran no tests` (a pattern matching no file passes 0/0, which would read every mutation SURVIVED); a `--log` inside the repository is refused; a crash exits 2, never 1. Choices it asks to confirm: `CONTROL PASS <validate line>` printed literally (`CONTROL PASS PASS tests 5/5 (0s)`; step 11's `CONTROL PASS …` still matches); TIMEOUT checked before CRASHED; `NOT-APPLIED` restores and continues (exit 2), `RESTORE-FAILED` stops with no summary; KILLED requires every failing step to name its failed tests; `--log` written fresh per invocation. Prose: a PROOF paragraph in the hunter skeleton, the carve-out narrowed to the closed list, a line telling the hunter to check the CONTROL count against the tests it scoped; `.claude/agents/test-hunter.md` keeps its exception sentence verbatim and adds the same closed list (1391 bytes). Out-of-fence notes: `node --test` silently skips a named test file that does not exist; Node counts a test file with no tests as one passing test (a mutation deleting the only test of a one-test file keeps the total); this ledger's gates render from the installed skill copy, which has no `mutate.mjs`; `tests/mutate.test.cjs` takes ~130 s alone.

Gate not started: the user asked, while the implementer ran, to take its report and pause before launching reviewers (verdict log, verbatim). No fence check, no orchestrator recipe run and no gate agent has run on `358d45d`.

### Hand-over to the Linux workstation

On the user's words (verdict log, verbatim) `chore/mechanical-tools-ledger` and `feat/mutation-harness` were pushed to `origin`, from where the user continues on a Linux workstation; `main` and every other branch untouched. The next session resumes B05 per §Recovery (🔄, commits ahead, checklist fully ticked → validations → fence check → reviewer + test-hunter, strong-tier reviewer). What that session inherits from this Windows one:

- Not pushed (the user named two branches): the merged batch branches `feat/validate-wrapper`, `fix/B01-tip`, `feat/ledger-parser`, `feat/contract-tool-wiring`, `feat/prompt-renderer`. Their commits are all on the integration branch; a clone without them reconciles the 🟢 rows B01–B04 by the merge SHAs their Notes record (`224a84c` after `437c42a`, `5c24ece`, `3d3b264`, `e8a9ca0`): each is an ancestor of the integration tip and its second parent is the batch tip the Notes name. A missing branch ref is unknown, never "not integrated".
- Windows-specific facts baked into this contract: the evidence helpers by absolute path under `C:/Users/fatbo/.claude/skills/orchestrate/tools/` (chosen because that copy is byte-identical to the ledger base `fceab31`'s `orchestrate/tools/` — the same bytes are `git archive fceab31 orchestrate/tools`; never the integration tip's copies, which B02 changed); the PowerShell validation recipe (needs `pwsh` there); the worktree root `C:/Users/fatbo/AppData/Local/Temp/claude/wt-os923/` (a Windows MAX_PATH measure); and the WSL-`bash` trap and the PowerShell-PATH helper, both Windows-only. Substituting any of them is a deviation for the user's words, recorded in PROGRESS.
- Nothing in this session's scratchpad transfers (rendered prompts, gate renderers, the recipe helpers, logs); every fact needed is in this ledger.
- Pending at C1 close-out: B02's smoke step 3 expects `PARSE OK 5 batches` from this ledger, which now reports B04's extended Files line by design (§B04); the step is corrected, with its revision bumped, before the page is issued. B04's residuals are listed in its row's Notes.

## 2026-09-24 — continue (Linux)

### Boot

Driven from a session whose working directory is the Shipping App checkout; this repository at `/home/timetotilt/projects/orchestrate-skill`, main checkout on `main` (`fceab31`), dirty only in `BACKLOG.md` (the user's uncommitted BL-028, carried to close-out on the user's words). The user's five substitutions are recorded verbatim in the verdict log. Verified before use: the helper directory `/home/timetotilt/.local/share/orchestrate-fceab31/orchestrate/tools/` equals `git archive fceab31 orchestrate/tools` (`diff -r` clean, no symlinks in the path); Node v24.20.0; `pwsh` 7.6.5. Discovery (that helper): one ledger, `OS-20260923-mechanical-tools`, on `refs/heads/chore/mechanical-tools-ledger` = `refs/remotes/origin/chore/mechanical-tools-ledger` = `f3a8e0c`. Worktrees: `int` and `b05` under `/home/timetotilt/worktrees/os923/`.

Reconcile: B01–B04 🟢 by merge SHA (their batch refs exist only on the Windows laptop): `437c42a`, `224a84c`, `5c24ece`, `3d3b264`, `e8a9ca0` are each ancestors of the tip, second parents `0310056`, `c1babae`, `50e669c`, `b7b8454`, `0d6fcef` — the batch tips their Notes name. B05 🔄: `feat/mutation-harness` = origin = `358d45d`, merge base `e8a9ca0`, three commits ahead, checklist 7/7 → gate. Shipment: `git ls-remote origin refs/heads/main` = `fceab31`; the tip is not contained.

Resume-time validation on `f3a8e0c` (the contract's recipe verbatim in a `.ps1`, run with `pwsh -NoProfile -File` from the worktree root): tests 466, pass 464, fail 0, skipped 2 — `tests/validate.test.cjs`'s two `process.platform !== 'win32'` skips, expected per the user — `git diff --check` clean, 18 s.

### B05 — gate

Fence check (Linux helper copy): PASS — integration `f3a8e0c`, batch `358d45d`, merge base `e8a9ca0`, 11 changed paths all in the allowed set, no violations, no unknowns, `b05` worktree clean. 6b n/a (feat batch).

Gate agents: the session's `reviewer` type resolves to the Shipping App's project definition (its body points at that repository's ARCHITECTURE.md/TESTING-GUIDE.md), because a project-level agent outranks the user-level one and the session runs from that checkout; it was used anyway — read-only tools, max effort, Opus as the strong tier — with the prompt telling it to ignore those references. `test-hunter` resolves to the user-level definition, byte-identical to `fceab31`'s `.claude/agents/test-hunter.md`. Prompts were rendered to files under the session scratchpad with a nonce on the last line, as in the Windows sessions; both name B04's scoped-Write wording as the binding form of the pinned sentence the batch file predates.

### B05 — R1

R1 reviewer — FIX FIRST @358d45d (strong tier, Opus; nonce verified). Verbatim:

1. **P0** `orchestrate/tools/mutate.mjs:173`/`:231` (via the `eolOf` no-op at `:159`) — violates acceptance criterion 1 ("a confirmed application") and spec §2 step 4 ("re-read and confirm the change is present, else `NOT-APPLIED <id>`, exit 2"); `:64` refuses `replace === find` precisely to stop no-op mutations, but the CRLF conversion re-admits them. Scenario (reproduced on a clone of 358d45d): a CRLF `crlf.txt` whose test asserts CRLF endings (live control: LF bytes turn that test red); mutation `{"find":"alpha\r\nbeta","replace":"alpha\nbeta"}` → `eolOf` maps `replace` back onto find's own bytes → the unchanged bytes are written, read back, run → `SURVIVED e1`, exit 1. The skeleton (`subagent-prompts.md:252`) makes SURVIVED "the evidence", so the hunter reports a working test as vacuous. Fix: in the loop, `mutated.equals(original)` → `NOT-APPLIED` (log note); add a CRLF test with an EOL-only mutation asserting `NOT-APPLIED` and exit 2.
2. **P1** `orchestrate/tools/mutate.mjs:85` — `gitIn` passes the whole `process.env` to `clone`/`checkout` (both tools, via `withDisposableCheckout`). Violates criterion 3 ("identical status, worktree list and HEAD after every run"), build rule 6, guardrail 1 (scratch copies only). Scenario (scratch fixture): `GIT_DIR=<fx>/.git run-at-ref.mjs --repo <fx> --ref HEAD~1` → the fixture's HEAD goes from `refs/heads/main` to detached HEAD~1 and its index is rewritten (status ` M crlf.txt`), plus a false `AT … FAIL tests CRASHED before summary` exit 1; `GIT_INDEX_FILE=<fx>/.git/index` (git exports this to commit hooks) → the fixture's index gains a staged revert (`MM crlf.txt`) beside the user's staged file, so their next `git commit` carries it; `mutate.mjs` with `GIT_DIR` → HEAD detached and a bogus `ANCHOR-MISSING` for an existing anchor. The suite cannot see it: `tests/support/git-fixture.cjs:33-34` strips `GIT_*` from every CLI run, and `isolated()` (`mutate.test.cjs:124`) does the same in-process. Fix: drop git's own `git rev-parse --local-env-vars` list (`GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_COMMON_DIR`, …) from `gitIn`'s env, and from `process.env` at both CLI entries (so validate steps inside the clone see the clone); test `cli(fx, tool, …, { env: { GIT_DIR: <repo>/.git } })` and `GIT_INDEX_FILE` with the existing `state()` assertion.
3. **P1** `orchestrate/tools/mutate.mjs:237` — the verdict is printed before the restore is verified at `:241`; `tests/mutate.test.cjs:357`/`:371` pin the pair. Violates criterion 1 ("only ever reported KILLED or SURVIVED after … a verified restore") and step 5 ("one line per mutation"). Scenario: the restore write fails (EPERM/EBUSY from a Windows scanner) → `SURVIVED m2` then `RESTORE-FAILED m2`; the skeleton reads the first as "proves a finding" and the second as "the proof did not run" for the same mutation, and a filesystem that just failed a verified write cannot vouch for the run before it. Fix: print the verdict only after `wrote(file, original)` succeeds; on failure print `RESTORE-FAILED <id>` alone (verdict to the log); update the two tests.
4. **ASK** `orchestrate/references/subagent-prompts.md:247-250` — the PROOF paragraph is silent on a mutate run outlasting the command timeout. Cost is (1 + mutations) × the scoped suite; the implementer measured ~130 s for `tests/mutate.test.cjs` alone, so a control plus four mutations of it breaches the 10-minute cap; a killed run skips `mutate.mjs`'s `finally` and leaves the clone under the temp root (on POSIX the detached test processes keep running). Suggest the template's own wording for `validate.mjs` (run it as a background task), or `--timeout` plus fewer mutations per run.
5. **ASK** same file `:250-251` — verified on node v24.20.0: a test file that registers no tests is reported as one passing test named after the file, so a production mutation emptying a data-driven single-test file keeps the total and reads SURVIVED (criterion 2 unmet in that corner). The real fix is `validate.mjs`'s parser, outside this fence (the implementer flagged it); name the limit beside the CONTROL-count sentence and record it for BACKLOG.

Validation (reviewer, pwsh recipe in the worktree): EXIT=0, tests 492, pass 490, fail 0, skipped 2 (the two Windows-only `tests/validate.test.cjs` cases), diff-check clean. Scope: every hunk maps to a batch item, no scope creep; the implementer's extras each serve build rule 6 or fail-closed behaviour, each tested. Criterion 4 met (closed list identical in skeleton and definition; B04's pinned sentence intact and qualified; the hand-built sweep has specimens, corpus and a live control). Doc sweeps all done. Implementer's asked-to-confirm choices: all confirmed (`CONTROL PASS PASS …` literal and still matches step 11; TIMEOUT before CRASHED; NOT-APPLIED continues with exit 2; RESTORE-FAILED stops, subject to finding 3; KILLED needs named tests; `--log` fresh per invocation).

R1 test-hunter — FINDINGS 4 @358d45d (default tier; nonce verified). Control: `tests/mutate.test.cjs` 22/22, `tests/tool-wiring.test.cjs` 25/25, full 490/0/2; harness check: overlap-counting mutation killed. Every mutation below left the FULL suite green (490/0/2). Verbatim:

H1. **ASK** `tests/mutate.test.cjs:396` (also `:240`/`:242`, `:562`/`:565`) — a guard that samples its domain: the fixture's ref means the same in source and clone. Mutation `mutate.mjs:109` `'checkout', '--quiet', '--detach', sha]` → `… ref]` (the resolve-in-the-repo-first rule gone) — RAN: green. Every checkout test uses `HEAD~1`/`HEAD` on a one-branch fixture, where clone HEAD = source HEAD. Demo on the mutated tool: `run-at-ref --ref side` (a branch not checked out) → `UNKNOWN checkout: git checkout failed`; `--ref origin/main` prints `AT 149e38f` (right sha) but runs the clone's `origin/main` = the source's local `main`: 1/1 instead of 2/2 — a wrong commit under the right sha, nothing thrown. Add: `withDisposableCheckout` and `run-at-ref` at a side branch that is not HEAD's and at a `refs/remotes/origin/*` ref pointing elsewhere than the source's `main`, asserting that commit's tree content or test count.
H2. **ASK** `tests/mutate.test.cjs:319` ("the checkout runs no hook the user configured") — samples its domain. Mutation `mutate.mjs:108` drop `'-c', `core.hooksPath=${hooks}`, ` from the clone call — RAN: green. The test plants only `post-checkout`, which a `--no-checkout` clone never fires; only the checkout leg at `:109` is covered. Demo: a global `core.hooksPath` with a `reference-transaction` hook ran 8 times during the mutated tool's clone, 0 with the real one. Add: plant `reference-transaction` too, with a live control that a plain clone fires it.
H3. **ASK** `tests/mutate.test.cjs:562`/`:589` (run-at-ref) — a branch no input reaches. Mutations `run-at-ref.mjs:12` `UNKNOWN: 2` → `UNKNOWN: 1` and `run-at-ref.mjs:20` drop `timeoutMs` from `runLogged` — RAN both together: green. No run-at-ref test feeds an UNKNOWN spec or a firing `--timeout`. Demo: a step whose command does not exist exits 1 ("suite failed") instead of 2; a 30 s step with `--timeout 2` runs 30 s and reports `PASS … exit 0` instead of `FAIL tests TIMEOUT after 2s` exit 1. Add: a run-at-ref case whose command cannot start (assert `AT <sha> UNKNOWN …`, exit 2) and a run-at-ref `--timeout` case (TIMEOUT line, exit 1, ends quickly).
H4. **ASK** `tests/tool-wiring.test.cjs:1085`/`:1086` (hand-built sweep) and `:993`/`:1010-1015` (outcome pin) — positive-only prose assertions, plus a NEW CLASS: the sweep strips the very spelling it hunts. Mutation: append to the test-hunter skeleton after ``prints one line, `AT <short sha> <validate.mjs line>`.`` the sentence ``After each run, restore the mutated file with `git checkout -- <file>`, and cite a `CRASHED <id>` line as a finding's proof when the crash came from your mutation.`` — RAN: green. (a) `handBuilt` blanks every code span before matching (`:1085`), and git commands here are normally code spans, so the git-checkout family only matches the unformatted spelling its specimen uses; (b) the outcome pin only asserts presence in the `Cite its lines: … means the proof did not run` passage, so any other sentence can promote a not-run outcome to proof. Add: sweep code-span text for `git (checkout|restore|reset|stash)` and edit-command spellings; sweep the hunter section and definition for any NOT_RUN kind named with "proof"/"proves"/"evidence" outside the pinned sentence.
H5. (hunter note, not a vacuity finding) `.claude/agents/test-hunter.md` keeps the verbatim exception sentence allowing "validation logs and disposable scratch", while the next sentence calls the writes a closed list that omits them; `tool-wiring.test.cjs` pins both verbatim, freezing the contradiction.

Orchestrator check of the blocking claims against `358d45d`: `eolOf(m.replace, crlf)` can equal `eolOf(m.find, crlf)` when the two differ only in line endings (`mutate.mjs:159`, `:173`), and nothing compares `mutated` with `original`; `gitIn` spreads `process.env` (`:85`); `say(verdictLine(...))` at `:237` precedes the `wrote(file, original)` check at `:241`. All three hold. Fix round: a fresh implementer (default tier) with the full skeleton, both reports and these findings; ASKs 4-5 and H1-H5 folded into the same round.

### B05 — fix round

Fresh implementer (default tier), prompt rendered to a file with a nonce; report verbatim (nonce line removed):

DONE

EVIDENCE
- Validation: `pwsh -NoProfile -File …/scratchpad/validate.ps1 > …/gate-b05/impl/validate.log 2>&1` gave EXIT=0 at 8d5c1cd. Totals: `ℹ tests 498`, `ℹ pass 496`, `ℹ fail 0`, `ℹ skipped 2` (the two Windows-only `tests/validate.test.cjs` cases). `git diff --check` is clean and the worktree is clean. The baseline was 492; this round adds 6 tests.
- Commits on feat/mutation-harness: `3dfc1ce` (fixes, tests, prose) and `8d5c1cd` (pins for the two new hunter sentences). Nothing pushed.
- Mutation proof: I ran the worktree's own `mutate.mjs` against HEAD. Every mutation was applied inside the tool's disposable `--shared` clone, with TMPDIR under `…/gate-b05/impl/`, and those temp directories are empty afterwards. Result: 17 mutations, all KILLED after a passing control, split into two runs because of the shell cap (`MUTATE 11 killed, 0 survived, 0 other` and `MUTATE 6 killed, 0 survived, 0 other`).
- 1 (P0) fixed: a mutation whose bytes equal the file's own now prints `NOT-APPLIED`, is never written or run, and exits 2. Test: "in a CRLF file, a mutation that differs from its anchor only in line breaks changes nothing: NOT-APPLIED, never run, exit 2". Saw it go red when the check was removed.
- 2 (P1) fixed: the list of variables comes from git itself (`git rev-parse --local-env-vars`, queried with no `GIT_*` set), not a hand-written copy. The variables are dropped case-insensitively from `gitIn`'s environment, and both CLI entries also drop them from `process.env`, so the ref lookup and every validate step see the clone. Tests:
  - "git's repository variables are git's own list, each dropped whatever its case, and nothing else is"
  - "a GIT_DIR or GIT_INDEX_FILE in the caller's environment never reaches the repository, the clone or a validate step, for both tools" (with a staged file, and a `where` step checking `--absolute-git-dir`)

  Saw red for five separate mutations: `gitIn` unscrubbed, each of the two CLI scrubs removed, a hand-written sample list, and dropping without case-folding.
- 3 (P1) fixed: a mutation's line is printed only after its restore holds. `RESTORE-FAILED <id>` is printed alone and the unprinted line goes to the log as `not printed: …`. Tests: "a restore that does not hold is RESTORE-FAILED alone…" and "a writer that throws…" (which adds a both-writes-refused case). Saw red when the verdict was printed before the restore.
- 4 (ASK) closed: the hunter skeleton now says a run costs the scoped suite once for the control and once per mutation; to run it as a background task, or use `--timeout` and split the mutations; and that a killed run leaves its clone behind. Pinned in "the test hunter proves each mutation…"; saw red.
- 5 (ASK) closed, prose only: the skeleton names the blind spot — Node counts a test file with no tests as one passing test, so a mutation that empties such a file reads `SURVIVED`. Pinned in the same test; saw red. The real fix is in `validate.mjs`, outside the fence, and is not done.
- H1 closed: withDisposableCheckout and run-at-ref are tested at a `side` branch that HEAD is not on, and at a `refs/remotes/origin/main` pointing at the older commit. Test: "a ref is resolved in the repository first…". Saw red when checkout used `ref` instead of `sha`.
- H2 closed: the hooks test now plants a `reference-transaction` hook too, with a live control showing a plain clone fires it. Test: "the checkout runs no hook the user configured". Saw red when `-c core.hooksPath` was dropped from the clone.
- H3 closed: new test "run-at-ref passes on validate.mjs's UNKNOWN as exit 2 and its --timeout as a TIMEOUT line, exit 1". Saw red for both `UNKNOWN: 1` and the dropped `timeoutMs`.
- H4 closed:
  - (a) The hand-built sweep now reads code spans as text instead of blanking them. It has a new "an edit command" family (`sed`/`perl -…i`, `Set-Content`/`Add-Content`/`Out-File`, `git apply`), and the corpus grows from 8 to 11 entries, including code-span spellings. Live control: the hunter's own plant written as a code span.
  - (b) New test "no hunter text offers a line that means the proof did not run as a proof, outside the passage saying it is none". It runs across the hunter section and the definition, with a specimen for each kind and a control for a qualifier inside the exempted passage.

  Saw red for three mutations: the old blanking, the plant with `git checkout`, and the plant citing `CRASHED` as proof. Each plant was killed only by its own test.
- H5 closed: `.claude/agents/test-hunter.md` now maps what B04's exception grants onto the closed list ("the validation logs are the ones mutate.mjs and run-at-ref.mjs write and the disposable scratch is your mutations file and your scoped spec"). Saw red when the mapping was removed from the definition.
  - **Pin changed:** only `HUNTER_LIST` in `tests/tool-wiring.test.cjs`, which is this batch's own pin, not B04's. It is still verbatim, once, directly after the exception, and only in test-hunter.md. It is now stricter: a new assertion parses what the exception grants beyond the findings file and requires each of those, and only those, to be mapped by the closed list.
  - B04's exception sentence, its "no second exception" count, the caveat and the size cap are unchanged (the definition is now 1521 bytes against the 4096 cap).

What changed and why
- `orchestrate/tools/mutate.mjs`:
  - New exports `localGitVars`, `withoutLocalGitEnv` and `scrubLocalGitEnv`.
  - The loop checks for a no-op mutation before writing, and prints each line only after the restore.
  - `--help` documents the NOT-APPLIED meanings, the print-after-restore rule and the dropped variables.
- `orchestrate/tools/run-at-ref.mjs`: the CLI calls `scrubLocalGitEnv()`, and `--help` mentions it.
- `orchestrate/references/subagent-prompts.md`: two sentences added to the PROOF paragraph, with no reflow of the surrounding text.
- `.claude/agents/test-hunter.md`: only the closed-list sentence, which B05 itself added, was rewrapped.

Out of fence (notes only)
- `validate.mjs` parser: a test file that registers no tests is counted as one passing test named after the file. This is reviewer 5's real fix and should go to BACKLOG.
- `runSpec` builds its child environment from `process.env`. Only the two CLIs scrub git's repository variables, so a caller using the `mutate()`/`runAtRef()` API directly with `GIT_DIR` set still passes it to validate steps. The clone itself is safe either way.
- `git-evidence.mjs`'s `git()` also inherits `process.env`. Other tools (check-fence, reconcile) could be misdirected the same way by an inherited `GIT_DIR` or `GIT_INDEX_FILE`.

Fence check PASS (integration `a7f577f`, batch `8d5c1cd`, merge base `e8a9ca0`, 11 paths, no violations, no unknowns). Fix diff `358d45d..8d5c1cd`: 6 files, +254/-35. R2: a fresh reviewer (strong tier, Opus) told to mark each R1 finding FIX VERIFIED / NOT FIXED and re-scan `git diff 358d45d..HEAD`, and a fresh test-hunter scoped to the tests that diff adds or changes.

### B05 — R2

R2 reviewer — SHIP @8d5c1cd (strong tier, Opus; nonce verified). R1 1, 2, 3: FIX VERIFIED (each R1 scenario re-run on 358d45d and 8d5c1cd: now `NOT-APPLIED e1` exit 2; HEAD/refs/index/status identical under GIT_DIR and GIT_INDEX_FILE for both tools; a real EACCES restore failure prints `RESTORE-FAILED m1` alone with `not printed: KILLED m1: …` in the log). 4 CLOSED; 5 NOT CLOSED as written (A below); H1–H5 CLOSED (the batch's mutate.mjs on a clone of 8d5c1cd: `CONTROL PASS PASS tests 53/53`, `MUTATE 9 killed, 0 survived, 0 other`). Validation EXIT=0, 498 / 496 / 0 fail / 2 skipped; `git diff --check` over `chore/mechanical-tools-ledger...HEAD` and `358d45d..HEAD` clean (the recipe's bare form checks only the clean worktree). Every hunk of `358d45d..HEAD` maps to a finding; no scope creep; no fix-introduced defect (the scrub drops exactly git's 15-name list, upper-cased, before both lookups). ASKs, verbatim:

A. ASK `orchestrate/references/subagent-prompts.md:252-255`, pinned verbatim at `tests/tool-wiring.test.cjs:1017` (criterion 4 / R1 finding 5). Measured through mutate.mjs on node v24.20.0 with a production data file `rows.cjs` feeding a one-test file and a three-test file: emptying the one-test file's rows gives `SURVIVED empty-one` (log: `✔ one.test.cjs` where `✔ one row` was); emptying the three-test file's rows gives `CRASHED empty-three: PASS tests 2/2` (count changed). "does not change the count" is true only for exactly one test; "Confirm that the mutated file still registers its tests" sends the hunter to `rows.cjs`, which registers nothing, and the hunter then cites `SURVIVED empty-one` as proof — the misreport the sentence exists to prevent. Fix: "…so a mutation that leaves a one-test file registering nothing keeps the count and reads `SURVIVED` — before you cite a `SURVIVED` line, check its run in the log for a scoped test file reported under its own file name." Update the pin.
B. ASK `tests/mutate.test.cjs:475-487` vs `orchestrate/tools/mutate.mjs:102-105`: the test claims "…whatever its case, and nothing else is" but covers only `withoutLocalGitEnv`; `scrubLocalGitEnv` (which sets every validate step's env) has neither side pinned. Surviving (full suite green each): mA drop `.toUpperCase()` (Windows lowercase spellings reach validate steps); mC delete every `GIT_*` key (strips the user's GIT_CONFIG_GLOBAL, GIT_CONFIG_NOSYSTEM, GIT_CEILING_DIRECTORIES from validate steps); mD mC plus both `core.hooksPath` overrides removed — still green, because under mC the hooks test's GIT_CONFIG_GLOBAL (`:358`) never reaches the tool, so the H2 test proves nothing. Fix: `const copy = { ...planted }; scrubLocalGitEnv(copy); assert.deepEqual(copy, keep);` (verified: passes on 8d5c1cd, fails on mA and mC).
C. ASK `tests/tool-wiring.test.cjs:1139-1142`: the H4(b) sweep only fires when a not-run kind shares a sentence with a proof word. Appending "Treat a `TIMEOUT <id>` line as `SURVIVED <id>` when the control ran in seconds." after `subagent-prompts.md:264` stays green (498/496/0/2). Fix: also fire when a NOT_RUN kind shares a sentence with a RESULTS kind (verified: zero hits on today's hunter section and definition; the plant is caught).

R2 test-hunter — FINDINGS 4 @8d5c1cd (default tier; nonce verified). H1–H4 CLOSED (each original survivor now red). Controls `tests/mutate.test.cjs` 27/27, `tests/tool-wiring.test.cjs` 26/26. Verbatim:

H2-1. ASK `tests/mutate.test.cjs:489` (the `where` step at `:495`) and `:475` — samples its domain. `mutate.mjs:104` → `if (key.toUpperCase() === "GIT_DIR") delete env[key];` (CLI scrub reduced to one name) — RAN: green 27/27. The only validate-step probe is `rev-parse --absolute-git-dir`, which only GIT_DIR affects; the GIT_INDEX_FILE leg passes because `gitIn` still drops it for the clone and `node --test` never touches the index. Consequence (ran): fixture with `s.txt` staged, `GIT_INDEX_FILE=<repo>/.git/index`, a validate step that writes the index (`git add -A`) through run-at-ref — unmutated leaves the index untouched; mutated rewrites the caller's index (`A  s.txt` → `D  a.txt`, `?? a.txt`, `?? s.txt`), both `PASS` exit 0. Second survivor: drop the case-folding at `:104` (`drop.has(key)`) — green; the case-insensitive unit test at `:475` covers only `withoutLocalGitEnv`. Add: a step asserting its `process.env` holds none of the `git rev-parse --local-env-vars` names in any case (or `git rev-parse --git-path index` resolves inside the clone), and a direct `scrubLocalGitEnv(planted)` unit call mirroring `:484`.
H2-2. ASK `tests/tool-wiring.test.cjs:1143` (`CITE_PASSAGE`/`PROOF_WORD` at `:1138-1141`; the pin at `:1027-1032`) — positive-only prose. Survivor A (ran, green 26/26): append after `subagent-prompts.md:264` "A `CRASHED <id>` line that your own mutation caused counts as `SURVIVED`." Survivor B (ran, green): inside the exempted passage change "`SURVIVED <id>` proves a finding and" → "…proves a finding, as does a CRASHED line your own mutation caused, and". NEW CLASS — a lazy-span exemption: `CITE_PASSAGE`'s `.*?` exempts whatever is inserted between its two ends, and the `named` pin reads only code-span kinds, so a bare `CRASHED` passes both. Add: pin the whole passage verbatim so the exemption covers only known bytes; flag any sentence naming a not-run kind beside `SURVIVED`/`KILLED` or the word "finding".
H2-3. ASK `tests/tool-wiring.test.cjs:1110` (family at `:1090`) — samples its domain. Append "After each mutation, run `git checkout -- <file>` before the next one." — RAN: green 26/26 (the family needs a restore/revert/undo word). Neither hunter text contains a bare `git checkout|restore|reset|stash`, so a negation-aware family on the bare command costs no false positives. Also the edit-command family's `git apply`, `Add-Content`, `Out-File` alternatives (`:1092`) have no specimen or corpus entry.
H2-4. ASK `orchestrate/tools/mutate.mjs:92` — `localGitVars`'s fail-closed throw is a branch no input reaches: `if (false) throw …` — RAN: green 27/27 (a `git` listing nothing would leave the scrub dropping nothing, silently). Add: a CLI run with a fake `git` first on PATH that prints nothing (and one printing a non-`GIT_` name), asserting `UNKNOWN git did not list …`, exit 2, repository untouched.

Out of fence, for BACKLOG at close-out (reviewer and implementer agree): `validate.mjs` counts a test file with no tests as one passing test (root of A); `git-evidence.mjs`'s `git()` inherits `process.env`, so check-fence and reconcile read whatever repository an inherited GIT_DIR names (sibling of R1 finding 2); direct callers of `withDisposableCheckout`/`runSpec` get an unscrubbed ref lookup and validate steps (today only run-at-ref, which scrubs first).

Polish pass: the fix-round implementer resumed with the seven ASKs (A, B, C, H2-1..H2-4) and the polish rules.

### B05 — polish and integration

Polish @`4276a8a` (resumed fix-round implementer; nonce verified). Report verbatim (nonce line removed):

DONE

EVIDENCE
- Validation: the same pwsh recipe, log at `…/scratchpad/gate-b05/impl/validate.log`, gave EXIT=0. Totals: `ℹ tests 499`, `ℹ pass 497`, `ℹ fail 0`, `ℹ skipped 2` (the two Windows-only `tests/validate.test.cjs` cases). One test was added since 8d5c1cd.
- `git diff --check 8d5c1cd..HEAD` is clean and the worktree is clean.
- Commit: `4276a8a` on feat/mutation-harness. It touches only `tests/mutate.test.cjs`, `tests/tool-wiring.test.cjs`, `orchestrate/references/subagent-prompts.md` and the batch file (7 `polish:` lines appended and ticked). Nothing pushed; no production file changed.
- Red on mutation: I ran the worktree's `mutate.mjs` against HEAD, with its disposable clones under `…/gate-b05/impl/tmp*`, which are empty afterwards. Both runs had a passing control: `MUTATE 9 killed, 0 survived, 0 other` for the tool-wiring and prose mutations, and `MUTATE 5 killed, 0 survived, 0 other` for the `mutate.mjs` mutations.
- **A** closed: the blind-spot sentence now reads "…so a mutation after which a one-test file registers nothing does not change the count and reads `SURVIVED` — before you cite a `SURVIVED` line, check its run in the log for a scoped test file reported under its own file name."
  - I kept the reviewer's meaning but avoided "leaves" and "keeps", because the write-licence sweep counts both as write verbs.
  - The pin in "the test hunter proves each mutation…" is updated, plus a sweep that the old wording is gone and the sentence appears once.
  - Red for two mutations: the old sentence restored, and the old sentence appended.
- **B and H2-1** overlap; one change closes B and H2-1's second survivor:
  - A direct `scrubLocalGitEnv(copy)` call in "git's repository variables are git's own list…" checks both ways: every listed name is dropped in any case, and `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_NOSYSTEM` and `GIT_CEILING_DIRECTORIES` are kept.
  - H2-1 also gets a `where` validate step that exits non-zero if its environment holds any of git's names in any case. The CLI test adds a third run that plants every listed name at once. It was renamed "git's repository variables in the caller's environment — a GIT_DIR, a GIT_INDEX_FILE, every one git lists — never reach…".
  - Red for three mutations: the reviewer's mA (case-folding dropped) and mC (every `GIT_*` key deleted) were killed by the unit call; the hunter's one-name scrub was killed by both tests. mA is caught by the unit call only: the CLI runs deliberately plant no lowercase duplicates, because Windows environments are case-insensitive.
- **C and H2-2** overlap; one change to "no hunter text offers a line that means the proof did not run as a proof…" closes both:
  - The exempted passage is now its exact text, pinned verbatim once, instead of a lazy span between two ends.
  - The sweep now fires when a not-run kind, bare or in a code span, shares a sentence with a proof word, the word "finding", or a result kind.
  - Red for the reviewer's `TIMEOUT`→`SURVIVED` plant, the hunter's plant A ("counts as `SURVIVED`") and the hunter's plant B (a bare `CRASHED` inserted inside the passage).
- **H2-3** closed: the git-restore family now matches a bare `git checkout|restore|reset|stash` command, with or without a restore word, still clause-level and negation-aware.
  - The corpus grows from 11 to 15 entries: the hunter's plant, plus `git apply`, `Add-Content` and `Out-File`.
  - A loop now requires every edit-command spelling to have an entry the family catches.
  - One test input changed: my own control sentence "Never restore a file with git checkout." became "Never run git checkout." The bare-command family flags the old form because the negation no longer sits right before the match. Neither hunter text names a bare git command.
  - Red for four mutations: the plant, and each of `git apply`, `Add-Content` and `Out-File` removed from the family.
- **H2-4** closed with no production change. New test: "a git that lists no repository variable, or a name that is not one, is UNKNOWN before anything runs, for both tools".
  - The fake `git` is node under git's name: a symlink, or a copy where symlinks need privileges (Windows `git.exe`). It answers through a `NODE_OPTIONS=--require` hook that acts only in a process started as git.
  - A live control confirms a PATH lookup finds the fake. Both tools print `UNKNOWN git did not list the variables that tie it to a repository (git rev-parse --local-env-vars)`, exit 2, and leave the repository untouched.
  - Red for `if (false) throw` and for the name-shape check dropped.

Out-of-fence notes: nothing new beyond the three BACKLOG items already listed in your ASK file.

Mechanical close: fence PASS (integration `7c1a1fa`, batch `4276a8a`, no violations, no unknowns); polish paths = the batch file, `orchestrate/references/subagent-prompts.md`, `tests/mutate.test.cjs`, `tests/tool-wiring.test.cjs` — no production file, so no scoped re-review; 7 `polish:` lines appended and ticked, no unticked item; `git diff --check chore/mechanical-tools-ledger...feat/mutation-harness` clean; orchestrator recipe run (pwsh) on `4276a8a`: 499 tests, 497 pass, 0 fail, 2 skipped, 21s.

Integration: dry run clean (tree `42cd40e`), merged `--no-ff` as `2137e7d` (same tree); tip validation (pwsh) 499 / 497 / 0 fail / 2 skipped (the Windows-only pair), `git diff --check HEAD^1 HEAD` clean → B05 🟢. Worktree `b05` removed. Metrics: gate = 16 findings (R1 5 + 4, R2 3 + 4), 3 needing a production change (R1 1–3); the hunter's R1 H5 note was closed in the fix round and is not counted.

Wave 5 closed; C1 (final, the only checkpoint) close-out follows.

## 2026-09-24 — C1 close-out

### Inputs

Generated at `382426b` by the committed `evidence/C1/inputs/generate-c1-inputs.mjs` into `issue-001/` (it refuses an existing directory), independently checked by `evidence/C1/inputs/validate-c1-inputs.mjs` into `validation-001/` — 24/24 PASS, by routes that avoid the tools under test (`node --test` run directly; the skill hash recomputed from git's own blobs of `orchestrate/`; byte diffs against the tip copy; `git bundle verify` inside a fresh clone). A deliberately corrupted copy fails 3 checks (I-06 made equal to I-05; m3's anchor made present at both commits). A second generation is byte-identical, the bundle included. Committed as `450d7e9`; every committed blob equals the bytes on disk (`git hash-object --no-filters`), and in a fresh `core.autocrlf=true` clone all 30 registry digests hold while an unprotected file (`README.md`) takes CRLF — the live conversion control. Two generator defects were caught before issue and fixed in the generator, never in the issued files: the bundle carried `main` but no `HEAD` (a clone checked nothing out, so step 11's `--ref HEAD` could not have run), and stripping template comments left blank lines at EOF in five I-05 files (`git diff --check` refused the commit).

Pin form: I-04 and I-05 pin the RELATIVE directory `orchestrate`, which check-ledger resolves from the working directory, so the inputs work on any machine from the worktree root.

### Pre-smoke

QA runner (default tier, `qa-runner`, user-level definition byte-identical to the base; nonce verified) on `450d7e9`: step 00 (input identities) PASS; steps 2–13 PASS; step 1 FAIL at revision 1 — `PASS tests 497/499 (21s)`, exit 0, `ℹ fail 0`, but its Pass required passed = total, which the line cannot show on Linux: `validate.mjs`'s total counts the two skipped Windows-only tests. A defect in the step's wording under the user's Linux substitution, not in the tool — corrected in B01's batch file to revision 2 (fail 0, skipped = total − passed) and re-run by the same runner: PASS, the two skipped named as the Windows-only pair. Revision-1 evidence kept as `evidence/C1/step-01-r1.md`. Step 3 corrected to revision 2 in B02's batch file, as recorded at B04 (live parse reports B04's extended Files line by design). Residual for BACKLOG at close-out: the wrapper's one line counts skipped tests in its total without saying so.

Step 14 is added as the one `Runner: human` step: the user's own words at this session's start ("the Windows PowerShell + Git Bash recipe runs once on my laptop at C1"). It needs the build on the laptop, and `origin` holds `chore/mechanical-tools-ledger` only at `f3a8e0c`; pushing needs the user's word.

### Page

`smoke-c1.json` written by a scratch script from the registry, the batch files' steps (commands spelled out with concrete input paths and a `../c1-scratch` directory, so they run in bash and PowerShell alike, no backslashes) and the evidence files; `smoke-c1.html` built by the ledger base's `build-smoke-page.mjs` with the base `smoke-page-template.html` (both `fceab31`). Build SHA `450d7e970e935bdd7b93b3acc4516b996fca59e8`; storage key `os923-c1`; 6 sections, 14 steps, 13 pre-verified.

Artifact proof (`evidence/C1/artifact-proof.md`): the rendered-DOM pass could not run — no browser binary on this machine and the only connected browser is on the Windows laptop. As a labelled substitute, every `<pre><code>` block was decoded from what the renderer receives (gate HTML; `SECTIONS` JSON entity-decoded) — 22 blocks, none with a backslash or control character — and each of the 17 step blocks for steps 1–13 was run with `bash` from the worktree root in a fresh `../c1-scratch`: every output and exit code as the step's Pass describes.

Gate blocks run on the committed tip `9b7ebca` from the worktree root: `git branch --show-current` → `chore/mechanical-tools-ledger`; `git merge-base --is-ancestor 450d7e9… HEAD` exit 0; `git diff --name-only 450d7e9…..HEAD -- . ":(exclude).agents/"` printed nothing; `node orchestrate/tools/mutate.mjs --help` printed its usage line, exit 0 — and `orchestrate/tools/mutate.mjs` is absent from `fceab31`, so the canary behaves the other way on the base.

## 2026-09-25 — C1 verdict: fail on B01 and B05

Verbatim in the verdict log. The user asked whether counting skipped tests and test files with no tests is a P0/P1 defect; the orchestrator reproduced the first through `mutate.mjs` (a scoped suite whose only test skips on this platform: `CONTROL PASS PASS tests 0/1 (0s)`, `SURVIVED m1`, exit 1; `validate.mjs` alone: `PASS tests 0/1`, exit 0) and cited R2's measurement of the second (`SURVIVED empty-one`), and owned the triage error: R2's ASK 5 was downgraded because its fix sat outside B05's fence — the fence decides how a finding is fixed, not whether it blocks, and a fence extension was mechanically available in a width-one wave — and the skipped-count residual was recorded as a display nit without checking its consequence. Both were found by gates and routed to BACKLOG by the orchestrator.

Node v24 prints a test file that registers no tests exactly as a passing test named after the file (`✔ empty.test.cjs`), in both the spec and TAP reporters — indistinguishable in text from a real test so named (probed 2026-09-25). Detection therefore has to reject on doubt.

Fix-ups run in sequence, B01 first: both fences contain `tests/protocol-contract.test.cjs` (not disjoint), and B05's repair consumes what B01's parser reports. `fix/B01-c1-followup` is cut from the tip below; `fix/B05-c1-followup` is cut from the tip after B01's fix-up merges.

### B01 fix-up (`fix/B01-c1-followup`)

Implementer (default tier; nonce verified) — reports verbatim (nonce lines removed):

NEEDS_FENCE

**EVIDENCE**
- Validation: `pwsh -NoProfile -File …/scratchpad/validate.ps1 > …/fixup-b01/validate.log 2>&1` gave **EXIT=1**. Totals: `ℹ tests 506`, `ℹ pass 503`, `ℹ fail 1`, `ℹ skipped 2`, `ℹ todo 0`. The one failure is outside the fence (below).
- `tests/validate.test.cjs` alone: 46 tests, 44 pass, 0 fail, 2 skipped (the Windows pair). Through the tool itself it prints `PASS tests 44/46, 2 skipped (19s)`, exit 0.
- Commit: `4460f88` on `fix/B01-c1-followup`. The diff against `chore/mechanical-tools-ledger` touches only `orchestrate/tools/validate.mjs` and `tests/validate.test.cjs`. Worktree is clean; nothing pushed.
- Red on the un-fixed code: I copied the new test file into a `git clone --shared` of `7fbca77`, and all 14 new or changed tests fail there. I also made 16 single mutations of the new code in the clone; every one turned a test red. The unmutated control run in that clone passed 44 of 44.

**Items**
1. **Done.** A step now fails if no test passed: every test skipped, or none at all, and 0/0 counts. Its line reads `FAIL tests no test passed (0/1, 1 skipped)` and its result is a new `NO-TESTS`. Pinned by "row: a summary in which no test passed…", which covers all four parsers, TAP, 0/0, and the order when the exit code is non-zero. Also pinned by the live test running real `node --test` (spec and TAP) on a skip-only file and on a glob that matches nothing. Red on old code: yes.
2. **Done.** Every parser result and every step now carries `skipped`. The line shows it only when it is non-zero, e.g. `PASS tests 1/3, 2 skipped`; with no skips the line is byte-identical to before. Pinned by "skipped is every counted test…" (checks each parser's kinds and passed + failed + skipped = total over the whole corpus) and "row: a run with skips that passes…" (includes a skip-free pass for every parser). Red: yes.
3. **Done.** A file that registered no tests is detected by shape (details below), moved from passed to failed, and listed in `loadFailures` plus a new `emptyFiles` field. On the line it reads `empty.test.cjs (ran no tests)`. Pinned by corpus cases for spec and TAP, including the look-alikes that must not trip it, and by a live test: relative, absolute and discovered paths, both reporters, and the R2 data-emptying case with a passing control. Red: yes.
4. **Done.** `--help` states the new pass rule, the skipped display and how skipped is counted per parser, the empty-file rule, its one false rejection, and the gap it cannot catch. Pinned by the "--help states…" test, which also checks the old wording is gone. Red: yes.
5. **Done.** Each refusal has a positive sibling and a live control through real `node --test`.

**Root cause.** The PASS row only checked "summary found, 0 failures, exit 0". It never checked that anything passed. Node also counts a file with no tests as a passing test, and the parser took the count at face value.

**Decisions**
- **0/0 is not a pass.** It is `NO-TESTS`, following the "could not tell means conservative" guardrail.
- **The rule is "at least one test passed", not "one ran".** Todo and xfail tests do run, but their outcome doesn't count as proof.
- **What `skipped` counts:** every test in the total that neither passed nor failed.
  - node: skipped + todo
  - jest: skipped + todo + pending
  - pytest: skipped + xfailed + xpassed
  - cargo: ignored
  - pytest's deselected and cargo's filtered-out tests are outside the total.
- **Empty-file signature** (spec `✔ name (Nms)`, TAP `ok N - name`). An entry counts as an empty file when all of these hold:
  - it is a top-level passing entry with no `#` directive;
  - it has no children (spec: no open `▶ name`; TAP: no indented subtests before it);
  - it is not a TAP `type: 'suite'`;
  - its name is file-shaped: a script extension, and no whitespace unless it contains `/` or `\`.
- **Known false rejection:** a real top-level test named like a file path, or an empty `describe` named that way under the spec reporter. A sentence such as "parses config.test.js" is exempt because it contains a space.
- **Known gap:** a file whose name contains a space, passed without a directory, is not recognised. Both cases are in `--help`.
- **Filtered-out files:** a file whose every test is removed by `--test-name-pattern` prints the same signature, so it also fails. That matters if scoped B05 runs use name patterns.
- **Node v22 is not verified; I could not run it.** The mechanism is `FileTest.#skipReporting()` in node's `runner.js`: the file-level test is reported only when it has no reported children. I read this from the v24.20.0 binary. I believe it dates from Node 20, but that is from memory.

**NEEDS_FENCE**
- **Expected:** the full suite green.
- **Found:** `tests/mutate.test.cjs`, test "a red control, and a control that ran no tests, abort before any mutation" (line 260). The control line is now `CONTROL FAILED FAIL tests no test passed (0/0) — log: <log> — step tests ran no tests`. The test's `checkLogPaths` (line 90, called from line 268) requires the log path to end the line, and line 270 still expects `PASS tests 0/0`.
- **Why it matters:** `mutate.mjs:255` still adds its "ran no tests" suffix. That check can no longer trigger on a passing control, because validate no longer passes 0/0.
- **How to proceed:** the minimal change is:
  - `orchestrate/tools/mutate.mjs:254-255`: drop the `idle` check, leaving `if (control.status !== 'PASS') { say(\`CONTROL FAILED ${control.line}\`); return 2; }`.
  - `tests/mutate.test.cjs:270`: change the regex to `/^CONTROL FAILED FAIL tests no test passed \(0\/0\) — log: .*idle\.log$/`.
- **Also out of fence and now false:** `orchestrate/references/subagent-prompts.md:252-255` says an emptied one-test file "reads `SURVIVED`". It now reads CRASHED through `loadFailures`. The sentence is pinned verbatim at `tests/tool-wiring.test.cjs:1016-1017` and 1026. It should be removed or rewritten in the same change. B05's fix-up could take all four files.

**What the checkpoint re-run should check**
- Smoke 1 now expects `PASS tests 497/499, 2 skipped (…)` on Linux, and plain `PASS tests N/N` on Windows.
- Smoke 2 is unchanged, since that fixture has no skips.
- Re-run the report's own probes:
  - the skip-only spec should give `FAIL tests no test passed (0/1, 1 skipped)`, exit 1;
  - `empty.test.cjs` next to `one.test.cjs` should give `FAIL … empty.test.cjs (ran no tests)`, with a `loadFailures` entry.

---- (resumed after the fence extension) ----

DONE

**EVIDENCE**
- Validation: `pwsh -NoProfile -File …/scratchpad/validate.ps1 > …/fixup-b01/validate.log 2>&1` gave **EXIT=0**. Totals: `ℹ tests 506`, `ℹ pass 504`, `ℹ fail 0`, `ℹ skipped 2`, `ℹ todo 0`. The 2 skipped are the expected Windows-only pair.
- Commits on `fix/B01-c1-followup`, not pushed:
  - `4460f88`: the validate.mjs fix and its tests (reported earlier).
  - `e2514d8`: the fence-extension change.
- `git diff --name-status -M chore/mechanical-tools-ledger...HEAD` shows M for the batch file, `orchestrate/tools/mutate.mjs`, `orchestrate/tools/validate.mjs`, `tests/mutate.test.cjs` and `tests/validate.test.cjs`. `git status --porcelain` is empty.
- Red on the un-fixed tip: in a `git clone --shared` checked out at `7fbca77`, with only the new `tests/mutate.test.cjs` copied in, "a red control, and a control that ran no tests, abort before any mutation" fails. The error is that the input did not match `/^CONTROL FAILED FAIL tests no test passed \(0\/0\) — log: .*idle\.log$/`. On my branch it passes in the full run. The clone has been deleted.

**Items**
1. **Done** in `4460f88`: a step where no test passed is FAIL, and 0/0 counts as that case. Pinned by "row: a summary in which no test passed…" and the live skip-only test. Red on old code: yes.
2. **Done** in `4460f88`: every result carries `skipped`, and the line shows it only when it is non-zero. Pinned by "skipped is every counted test…" and "row: a run with skips that passes…". Red: yes.
3. **Done** in `4460f88`: a file that registered no tests is moved to the failures and listed in `loadFailures` and `emptyFiles`. Pinned by the corpus cases for spec and TAP and the live relative, absolute and discovered runs. Red: yes.
4. **Done** in `4460f88`: `--help` states the pass rule, the skipped display and the empty-file rule with its false rejection. Pinned by the "--help states…" test. Red: yes.
5. **Done**: each refusal has a positive sibling and a live control; 16 single mutations of the new code were each caught. The fence extension adds the mutate test re-point, red on `7fbca77` and green here.

**The fence-extension change (`e2514d8`)**
- `orchestrate/tools/mutate.mjs`: I removed the now-dead `idle` lookup. The control check is now `if (control.status !== 'PASS') { say(\`CONTROL FAILED ${control.line}\`); return 2; }`. Nothing else in the file changed; `parsers` is still used by `classifyRun`.
- `tests/mutate.test.cjs`: the idle-control expectation now matches `CONTROL FAILED FAIL tests no test passed (0/0) — log: …idle.log`. The line-count and exit-2 assertions are kept.
  - I added one line to the idle leg, `!readLog(none).includes('==> mutate: mutation')`. It mirrors the "no mutation ran" check the red leg already had, which the idle leg lacked.
- Batch file: the `**Files**:` line now also lists `` `orchestrate/tools/mutate.mjs`, `tests/mutate.test.cjs` `` in the same form. There are no other edits to it.

**Left for B05's fix-up, not touched here**
- In `tests/mutate.test.cjs:266`, the comment "A pattern that matches no file runs no tests and passes" now reads loosely: node exits 0, but the step no longer passes. I left it because it is outside the minimal change.
- `orchestrate/references/subagent-prompts.md:252-255` is now false: a mutation that empties a one-test file reads CRASHED through `loadFailures`, not `SURVIVED`. Its verbatim pin is in `tests/tool-wiring.test.cjs:1016-1017` and 1026.
- The comment at `mutate.mjs:252` is still true as a rationale.

**What the checkpoint re-run should check**
- Smoke 1 on Linux should print `PASS tests 497/499, 2 skipped (…)`, exit 0. On Windows it stays plain `PASS tests N/N`.
- Smoke 2 is unchanged.
- The report's probes:
  - the skip-only spec should print `FAIL tests no test passed (0/1, 1 skipped)`, exit 1;
  - `empty.test.cjs` next to `one.test.cjs` should print `FAIL … empty.test.cjs (ran no tests)`;
  - through `mutate.mjs`, the skip-only case should now print `CONTROL FAILED`, not `SURVIVED`.

Fence: the helper returned UNKNOWN (`authority`: plan/PROGRESS branch linkage does not agree — a fix-up branch never carries the plan's branch name); the contract's manual fallback PASSED: `git diff --name-status -M 4a8a0a9...e2514d8` = 5 modified paths, all in B01's fence plus the two recorded extensions; the batch file changed only its Files line, by exactly those two paths; worktree clean; `filter` unspecified on every path. 6b failing-on-base: the branch's `tests/validate.test.cjs` and `tests/mutate.test.cjs` on the base `7fbca77` — 74 tests, 57 pass, 15 fail, 2 skipped; the failures are the named behaviours (skip-only and 0/0 steps, empty test files, the skipped display and count, the re-pointed idle control) plus corpus/shape cells that now carry `skipped` — PROVEN. Gate: a fresh reviewer (strong tier, Opus) and test-hunter (default), in parallel.

#### B01 fix-up — R1

B01 fix-up R1 reviewer — FIX FIRST @e2514d8 (strong tier, Opus; nonce verified). Verbatim (nonce line removed):

FIX FIRST

**P1-1**: `/home/timetotilt/worktrees/os923/b01f/orchestrate/tools/validate.mjs:31` (`fileShaped`), plus `--help` at :360-362
- **Violates:** spec item 3 accepts one false rejection, "a real test deliberately named like a file path". The rule's whitespace-plus-separator clause also rejects ordinary sentence titles that happen to end in a path with a `/` or `\`. This is the "false rejection that reddens a real repository's green suite" that duty 4 asked about.
- **Scenario:** these two real Shipping App titles, run live at e2514d8 under spec and under TAP beside a normal test, give `FAIL tests 2 of 3 failed: no console.* … (ran no tests), settings-view: … (ran no tests)` and exit 1, although every test passed:
  - `/home/timetotilt/projects/shipping-app/scripts/renderer.test.js:13026`: "settings-view: the hardcoded kind names and basenames match src/shared/data-files.js"
  - `/home/timetotilt/projects/shipping-app/scripts/ipc-registration.test.js:7655`: "no console.* diagnostic survives anywhere in src/main outside logger.js"
  - They are 2 of that suite's 2548 top-level titles. Its current custom reporter can't be parsed anyway (a pre-existing gap), so they bite once its `validate.json` uses spec, or TAP (node's default when output goes to a pipe).
- **Minimal fix:** `const fileShaped = name => SCRIPT_FILE.test(name) && !/\s/.test(name.split(/[\\/]/, 1)[0]);`
  - Whitespace is allowed only after the first separator, so absolute paths with spaces still match.
  - Checked in a shared clone: `tests/validate.test.cjs` stays 46 tests / 44 pass / 0 fail, and both titles then read `PASS 3/3`.
  - Cost: an emptied file under a relative directory whose first segment holds a space (`sp ace/e.test.cjs`) is no longer recognised; the tip does recognise it. Add that to `--help`'s "Not recognised" sentence, and pin both real titles as not-empty cases for spec and TAP.
  - If you would rather keep today's reach under reject-on-doubt, the `--help` "price" sentence must say so (any title ending in a script extension that contains `/` or `\`, spaces or not). This finding then drops to an ASK.
- **Class:** P1

**ASK-1**: `/home/timetotilt/worktrees/os923/b01f/tests/validate.test.cjs:1020-1049` and the empty-file cases at :256-260
- **Violates:** B01's acceptance criterion "mutating any single parser's name pattern … turns at least one test red", and outcome 5's "input shape its real channel delivers". No fixture puts an empty-file entry after an entry that has children.
- **Scenario:** mutation M23 at validate.mjs:58, `…; j >= 0 && !/^(?:# Subtest: |(?:not )?ok \d+ )/.test(lines[j]); j--)` changed to `…; j >= 0; j--)`, leaves the file green (46/44/0). Live, `test/a-parent.test.cjs` (one parent test with a subtest) plus an emptied `test/b-data.test.cjs` under TAP then reads `PASS tests 3/3`, which is the reported defect back, silently. The tip correctly gives `FAIL tests 1 of 3 failed: test/b-data.test.cjs (ran no tests)`.
- **Fix:** in the live cell, name the emptied file so it sorts after `named.test.cjs` (for example `zz-data.test.cjs`). Also add spec and TAP corpus cases where an empty-file entry follows a parent entry.
- **Class:** ASK

**ASK-2**: validate.mjs:31 and :37/:104. Two sides of the new signature are pinned on one side only; both mutations below leave the file green.
- **M26:** `SCRIPT_FILE.test(name)` changed to `/\.\w+$/.test(name)` in `fileShaped`. It would falsely reject a passing test named `package.json`. Fix: add such a name to both NOT_EMPTY fixtures.
- **M18:** `missing(names, loadFailures, emptyFiles)` changed to `missing(names, loadFailures)`. No input reaches that branch. Fix: pin it or drop it.
- **Class:** ASK

**ASK-3**: validate.mjs:356-357 (`--help`)
- **Scenario:** `--test-skip-pattern` and `--test-only` produce the same file-level signature, but `--help` names only `--test-name-pattern`. Live:
  - `--test-skip-pattern=beta` over a file whose only test is "beta only" gives `FAIL … b.test.cjs (ran no tests)`.
  - `--test-only` with a file that has no `only` test gives `FAIL … a.test.cjs (ran no tests)`.
- **Fix:** "or whose every test a filter removed (--test-name-pattern, --test-skip-pattern, --test-only)".
- **Class:** ASK

**ASK-4**: `/home/timetotilt/worktrees/os923/b01f/tests/mutate.test.cjs:266`
- **Scenario:** the comment "runs no tests and passes" is now false: `validate.mjs` reports that run as `no test passed (0/0)`.
- **Fix:** reword the comment, either in this extension or in B05's fix-up.
- **Class:** ASK

**Validation and hunk map.** Validation EXIT=0: 506 tests, 504 pass, 0 fail, 2 skipped (the Windows-only pair); diff-check clean. Log: `/tmp/claude-1000/-home-timetotilt-projects-shipping-app/0182bb45-990d-40f6-a9b6-0b595973253b/scratchpad/gate-b01f/rev/validate.log`. Every hunk maps to an outcome or to the recorded extension; there is no scope creep. The extra "no mutation ran" assertion in `mutate.test.cjs` is the regression check for removing the dead idle check.

**Required outcomes, reproduced at e2514d8:**
- **Skip-only suite:** `FAIL tests no test passed (0/1, 1 skipped)`, exit 1, under spec and TAP.
- **Positive siblings:** a partly skipped suite gives `PASS tests 1/2, 1 skipped`; a normal suite gives `PASS tests 2/2 (0s)`, byte-identical to before.
- **Empty file beside a real one:** `empty.test.cjs` + `one.test.cjs` gives `FAIL tests 1 of 2 failed: empty.test.cjs (ran no tests)`, with a `loadFailures` entry.
- **Through `mutate.mjs`:** the skip-only control gives `CONTROL FAILED`, and R2's case gives `CRASHED empty-one`.
- **Smoke re-runs:** smoke 1 gives `PASS tests 504/506, 2 skipped (21s)`. I-01 has no skips, so smoke 2 is unchanged. B05's smoke steps 11 and 13 give the same lines.

**Consumers and rule choices:**
- The idle check was dead: a passing parsed step now needs at least one passed test, so its total is above 0. Removing it changes no behaviour.
- `run-at-ref.mjs` only passes the status and line through; `NO-TESTS` is a step result, never a status.
- "At least one test passed" is the right rule for all four parsers: todo, xfail and xpass tests run but prove nothing, and node counts a passing todo under todo, not pass. `passed + failed + skipped = total` holds for every corpus case and is pinned.
- A file emptied under a `describe` is not a false pass: node counts the empty describe as a suite, so the total drops honestly, and `mutate.mjs`'s total check reports CRASHED.

**Node v22 and Windows.** I could not run v22.
- The code relies on node reporting a file with no tests as one passing file-level entry, which I believe predates v22.
- If v22 did not print that entry, the file would add 0 tests to the count, not a pass. The live cell would then go red on her laptop, loudly.
- If v22 closes a parent with `▶ name (Xms)`, as I recall v20 did, the parser never takes that line for a file.
- Backslash names and TAP's `\\` escaping are handled. Her recipe passes absolute paths (first segment `C:`), which match under both the tip's rule and the proposed fix.

**Failing-on-base (duty 5) is consistent.** 46 + 28 = 74 tests. The 15 failures are the 7 new cells, 7 existing validate cells whose expectations now carry `skipped`/`emptyFiles` or ", 1 skipped", and the mutate idle cell. Unchanged cells pass on base.

**Not a finding:** an empty `describe` named like a file, alone under spec (inside the documented false rejection), reports `passed` as -1 and the line reads "1 of 0 failed".

**Owed to B05's fix-up (duty 6):**
- `/home/timetotilt/worktrees/os923/b01f/orchestrate/references/subagent-prompts.md:252-256` and its verbatim pin at `tests/tool-wiring.test.cjs:1016-1017` and :1026 are false: the emptied one-test file now reads CRASHED, confirmed live.
- In `/home/timetotilt/worktrees/os923/b01f/orchestrate/tools/mutate.mjs`, the comment at :203-207, the HELP at :303 and the `classifyRun` reason at :215 call an emptied file "failed to load". My probe's log reads "a test file failed to load (one.test.cjs)". None of them lists the all-skipped mutation run, which now reaches CRASHED as "a step failed without a named failing test".
- Its HELP at :312-313 says the control "must run a test", but the rule enforced now is "pass a test": a control with only todo tests is refused.

No other shipped file states the old pass rule; I grepped `orchestrate/` and `README.md`.

B01 fix-up R1 test-hunter — FINDINGS 4 @e2514d8 (default tier; nonce verified). Verbatim (nonce line removed):

FINDINGS 4

Setup: a scratch clone (`git clone --shared`) at e2514d8 under `.../scratchpad/gate-b01f/hunt/c`. Each mutation was applied by an anchored applier that aborts unless its anchor matches exactly once (`hunt/mut.cjs`). The unmutated control ran `tests/validate.test.cjs` at 46 tests, 44 pass, 0 fail, 2 skipped. The worktree was not touched and the clone is clean after the runs.

**1. HIGH: The TAP empty-file check is only tested with the empty file first. Behind a suite or parent test, a silent false acceptance stays green.** Guard that samples its domain; boundary pinned on one side.
- Tests:
  - `tests/validate.test.cjs:292` ("tap empty files"). The empty entries there follow no parent.
  - `tests/validate.test.cjs:1020` (the live empty-file test). `data.test.cjs` sorts before `named.test.cjs` in the discovered run, and the relative and absolute runs pass only data and one.
- Production: `orchestrate/tools/validate.mjs:58`, the stop condition on the backward child scan.
- Mutation: `j >= 0 && !/^(?:# Subtest: |(?:not )?ok \d+ )/.test(lines[j]); j--)` changed to `j >= 0; j--)`.
  - I ran it: 44/44 pass, 0 fail.
- Real consequence, probed with live `node --test --test-reporter=tap` on `test/a.test.cjs` (a describe with one test) plus `test/b.test.cjs` (a data loop over `[]`):
  - Unmutated: `emptyFiles ["test/b.test.cjs"]`, 2 passed, 1 failed.
  - Mutated: `emptyFiles []`, 3 passed, 0 failed. That is R2's `SURVIVED empty-one` again.
  - In any real run most files sort after one that uses describe or subtests, so this is the common position, not an edge case.
- Assertion to add: a TAP case with a file-shaped childless entry after a parent that has indented subtests, in both the corpus and the live test. For the live test, name the emptied file so it sorts after `named.test.cjs` (e.g. `zdata.test.cjs`), and expect `emptyFiles` to have length 1 under TAP. Test-only → ASK.

**2. MEDIUM: The spec reporter's "no directive" clause is pinned on the accepting side only.** Boundary pinned on one side.
- Test: `tests/validate.test.cjs:263/289` (`NODE_SPEC_NOT_EMPTY`). Its only directive entry is `﹣ skipped.test.cjs … # SKIP`, and the `﹣` glyph never reaches the `✔` regex. The corpus's `✔ todo passing (0.1ms) # TODO` is not file-shaped, so it doesn't exercise the anchor either.
- Production: `orchestrate/tools/validate.mjs:48`. The `$` anchor after `(Nms)` is the whole directive clause for spec.
- Mutation: `/^([✔✖]) (.+) \(\d+(?:\.\d+)?ms\)$/` changed to `/^([✔✖]) (.+?) \(\d+(?:\.\d+)?ms\)/`.
  - I ran it: 44/44 pass.
- Live probe: node 24 prints `✔ todo.test.cjs (0.41ms) # TODO`. Under the mutation that todo becomes an empty file, a false rejection that is not the documented one.
- Assertion to add: `✔ x.test.cjs (0.1ms) # TODO` in `NODE_SPEC_NOT_EMPTY` with `emptyFiles: []`, and ideally a live file-shaped todo. Test-only → ASK.

**3. LOW: `--help` prose is checked for presence only.** Positive-only assertions on prose.
- Test: `tests/validate.test.cjs:1137`. It checks the needed passages are present and that one exact old sentence is absent.
- Production: `orchestrate/tools/validate.mjs:362`, the "Not recognised: a file named with a space…" sentence.
- Mutation: replace that sentence with ` A run with no tests at all passes.`
  - I ran it: 44/44 pass. The documented gap vanished and a directive contradicting the 0/0 rule was accepted.
- Assertions to add:
  - pin the "Not recognised" sentence;
  - sweep the help text for contradicting directives, e.g. `/\b(0\/0|no tests?)\b[^.]*\bpass(es)?\b/` outside the pinned passage.
- Test-only → ASK.

**4. LOW: The skip suffix on the "names not captured" branch is never exercised.** A branch no input reaches.
- Test: `tests/validate.test.cjs:539-542`. Its transcript has 0 skipped.
- Production: `orchestrate/tools/validate.mjs:291`, the second `${sk}`.
- Mutation: `failed${sk} (names not captured)` changed to `failed (names not captured)`.
  - I ran it: 44/44 pass.
- Assertion to add: the same row with a skipped count, expecting `FAIL tests 1 of 3 failed, 1 skipped (names not captured) — log: …`. Test-only → ASK.

**Checked and holding** (each mutation turned a test red, except where marked):
- **Forward suite scan unbounded** (line 59 without the indentation stop): the live discovered case went red.
- **Spec `▶` parent tracking removed:** 4 tests went red.
- **Other signature clauses, by reading the corpus:** the TAP suite, children and directive clauses, each side of the `fileShaped` whitespace/separator clause (`parses config.test.js` vs `C:\Users\Jo Ann\…`), and the `✔`-only restriction. Each is pinned by an exact `deepEqual` in the corpus. I did not run these.
- **Skipped kinds per parser:** every kind is in the KINDS table (node skipped + todo, both reporters; jest skipped/todo/pending; pytest skipped/xfailed/xpassed/deselected; cargo ignored). The passed + failed + skipped = total invariant runs over all CASES.
- **The no-test-passed rule:**
  - 0/0, all skipped and all todo are covered for all four parsers, plus TAP. The live tests cover both reporters and a glob that matches nothing.
  - A non-zero exit is still reported ahead of NO-TESTS.
  - Real node counts a todo outside `pass`, which matches the fixture.
- **Byte identity:** every skip-free passing CASE per parser is checked against `^PASS tests p/t \(\d+s\)$`.
- **`mutate.mjs` removed idle check:** the check is dead, and the new regex would go red if it came back. The added "no mutation ran" assertion reads a header mutate really writes (`==> mutate: mutation`, `mutate.mjs:160`).
- **Not tried:** `!(passed > 0)` against `total === skipped` is equivalent on every reachable input, so I didn't run it.

Probe files: `/tmp/claude-1000/-home-timetotilt-projects-shipping-app/0182bb45-990d-40f6-a9b6-0b595973253b/scratchpad/gate-b01f/hunt/probe/` (tap.txt, spec.txt). Mutation logs are `hunt/M1.log` … `hunt/M6.log`.

Decision on P1-1: take the reviewer's fix (whitespace allowed only after the first path separator; the relative-first-segment-with-a-space gap documented in `--help`), not the widened price sentence — a false rejection of ordinary titles in a real repository's green suite (the user's own) costs more than the narrow gap. Fix round: the same implementer, resumed with both reports; the items owed to B05's fix-up stay there.

#### B01 fix-up — fix round

Same implementer, resumed; report verbatim (nonce line removed):

DONE

**EVIDENCE**
- Validation (`pwsh -NoProfile -File …/scratchpad/validate.ps1 > …/fixup-b01/validate.log 2>&1`): **EXIT=0**, with `ℹ tests 507`, `ℹ pass 505`, `ℹ fail 0`, `ℹ skipped 2` (the Windows-only pair), `ℹ todo 0`.
- Commit `334b0ac` on `fix/B01-c1-followup`, on top of `4460f88` and `e2514d8`. Not pushed.
- `git diff --name-status -M chore/mechanical-tools-ledger...HEAD` lists five files, all modified: the batch file (only the `Files` line changed, in `e2514d8`), `orchestrate/tools/mutate.mjs`, `orchestrate/tools/validate.mjs`, `tests/mutate.test.cjs` and `tests/validate.test.cjs`. `git status --porcelain` is empty. Nothing was ticked in the batch file.
- How red was checked, all in `git clone --shared` copies under my scratch directory:
  - **On `e2514d8`, new test file only:** 5 tests fail — the corpus test, the CRLF and ANSI loops over the corpus, the live empty-file test and the `--help` test. The corpus assertion fails on the two real Shipping App titles.
  - **Nine single mutations of the fixed code:** each one turned a test red. The unmutated control ran 45 pass, 0 fail.
  - The clones have been deleted.

**Findings**
- **P1-1:** closed with the reviewer's fix: `fileShaped = name => SCRIPT_FILE.test(name) && !/\s/.test(name.split(/[\\/]/, 1)[0])`.
  - `--help` "Not recognised" now reads: "a file given by a relative path whose first segment holds a space ("my file.test.js", "my dir/a.test.js")".
  - Both real titles are pinned as not-empty in `NODE_SPEC_NOT_EMPTY`, `NODE_TAP_NOT_EMPTY` and live in `named.test.cjs`, under both reporters.
  - Absolute paths with spaces are still recognised: `C:\Users\Jo Ann\…` and `/home/Jo Ann/…` are in `EMPTY_NAMES`.
  - Red on `e2514d8`, and red on the old-rule mutation.
- **ASK-1 / H1:** closed.
  - `NODE_SPEC_EMPTY` and `NODE_TAP_EMPTY` now put the empty entries after a parent test with a child.
  - The live test's emptied file is now `zz-data.test.cjs`. It runs discovered, and relative and absolute with `named.test.cjs` first. The test reads the log to assert the emptied entry comes after `helpers.mjs`, then asserts `emptyFiles.length === 1` under both reporters.
  - Red on M23 (unbounded backward scan): the corpus cases and the live test both fail. The live failure can only come from TAP, since spec does not use that scan.
- **ASK-2:**
  - M26: a `package.json` test is in both not-empty fixtures and live. Red on M26.
  - M18: I pinned the branch instead of dropping it. New test "without a summary, an empty-file entry is still reported as a load failure" checks spec and TAP text with no summary. Red on M18.
- **ASK-3:** closed. `--help` now says "whose every test a filter removed (--test-name-pattern, --test-skip-pattern, --test-only)", and the `--help` test pins it. Red on the mutation that shortens it to `--test-name-pattern` alone.
- **ASK-4:** closed. `tests/mutate.test.cjs:266` now reads: "…runs no tests and node exits 0; validate.mjs refuses it as `no test passed (0/0)`, so it is no control…". It is a comment only, so no red applies.
- **H2:** closed. `✔ todo.test.cjs (0.1ms) # TODO` is in the spec not-empty fixture, the TAP fixture has the `# TODO` form, and the live `named.test.cjs` has a file-shaped todo test. Red on the hunter's non-anchored regex mutation.
- **H3:** closed.
  - The "Not recognised" sentence and the whole rule sentence are pinned verbatim.
  - The rest of `--help` is swept both ways for a subject (`0/0`, no test(s), nothing, skipped, empty) next to a verdict (pass, passes, green, ok) within one sentence.
  - Red on appending "A run with no tests at all passes.", and red on deleting the gap sentence.
- **H4:** closed. The names-not-captured row now also expects `FAIL tests 1 of 3 failed, 1 skipped (names not captured) — log: …`. Red on dropping that `${sk}`.

**Notes**
- **Cost of the P1 fix:** a file emptied under a relative directory whose first segment holds a space now passes as a real test. That gap is stated in `--help`. The user's recipe passes absolute paths, whose first segment is `C:`, so it is unaffected.
- **Untouched, owed to B05's fix-up:** `subagent-prompts.md:252-256` and its pin in `tool-wiring.test.cjs`; `mutate.mjs`'s comments, HELP and `classifyRun` reason that call an emptied file "failed to load"; and the "must run a test" wording.
- **Checkpoint re-run:**
  - Smoke 1 should give `PASS tests 505/507, 2 skipped (…)` on Linux.
  - A spec or TAP run with a top-level test titled like "…match src/shared/data-files.js" should give `PASS`.
  - The empty-file probes should still give `FAIL … (ran no tests)`.

Manual fence PASS on `334b0ac` (same 5 paths; batch file unchanged since `e2514d8`; worktree clean). R2: a fresh reviewer (strong tier, Opus) marks every round-1 finding and re-scans `git diff e2514d8..HEAD`; a fresh test-hunter scoped to the tests that diff adds or changes.

#### B01 fix-up — R2

B01 fix-up R2 reviewer — SHIP @334b0ac (strong tier, Opus; nonce verified). Verbatim (nonce line removed):

SHIP

**Round-1 findings, checked at 334b0ac.** Each mutation below was run by an anchored applier in a shared clone. The unmutated control gave 47 tests, 45 pass, 0 fail, 2 skipped.
- **P1-1: FIX VERIFIED.**
  - Round 1's scenario, live: the two real Shipping App titles beside a normal test give `PASS tests 3/3 (0s)` under spec and TAP.
  - An emptied file beside a real one, and an emptied file sorting after a describe file and a parent-test file, still give `FAIL … (ran no tests)` under both reporters.
  - Putting round 1's rule back turns 4 tests red: the corpus, CRLF, ANSI and live tests.
  - Top-level titles across her three repos (shipping-app 2548, amazon-sheets-logger 1120, orchestrate-skill 321): the tip rejects 0 of 3989. Round 1's rule rejected 4, including `amazon-sheets-logger/test/sephora-pdp.test.js:1825` and `target-pdp.test.js:645`.
- **ASK-1 / hunter #1: CLOSED.** M23 turns 5 tests red. `tests/validate.test.cjs:1081-1082` asserts the emptied entry follows `helpers.mjs` under both reporters.
- **ASK-2: CLOSED.** M26 turns 4 red. M18 turns red "without a summary, an empty-file entry is still reported as a load failure".
- **ASK-3: CLOSED.** `validate.mjs:357` names all three filters. Cutting it to `--test-name-pattern` turns the `--help` test red.
- **ASK-4: CLOSED.** The comment at `tests/mutate.test.cjs:266-267` is now true: node exits 0 on a glob that matches nothing (asserted live at `validate.test.cjs:1033`), and validate refuses the run as `no test passed (0/0)`.
- **Hunter #2: FIX VERIFIED.** The unanchored regex turns 4 red. `✔ todo.test.cjs … # TODO` is in the fixture at :275 and the live file at :1057.
- **Hunter #3: FIX VERIFIED** for both of the hunter's mutations. The sweep is still porous; see ASK-C.
- **Hunter #4: FIX VERIFIED.** Dropping the second `${sk}` turns :564-565 red.
- **New mutations of the narrowed rule:** all 7 turn red — no whitespace anywhere, forward slash only, backslash only, last segment, dirname, the old rule in spec only, the old rule in TAP only.

**New findings (all ASK)**

**ASK-A**: `/home/timetotilt/worktrees/os923/b01f/orchestrate/tools/validate.mjs:360-362`, pinned at `tests/validate.test.cjs:1183`
- **Violates:** spec item 3 ("document the one false rejection"). This is P1-1's class: round 1 said such a rejection is acceptable only if the price sentence states it.
- **Scenario:** a top-level `test('I/O errors from the reader surface through reader.js')` beside `test('plain')`, live under spec and TAP, gives `FAIL tests 1 of 2 failed: I/O errors … reader.js (ran no tests)`, exit 1. The same holds for any title whose first word has a slash (and/or, CI/CD, read/write) and that ends in a script file name. None of the 3989 real titles does this.
- **Fix (wording):** "The price is a false rejection of any real top-level test, or an empty describe under the spec reporter, whose name is file-shaped: one named like a file path ("config.test.js") or a title whose first word holds a slash ("I/O errors from reader.js"); rename it." Update the pin.
- **Optional production fix instead:** also require `!/\s/.test(name.split(/[\\/]/).pop())`. The cost is that an emptied file whose basename holds a space would no longer be recognised.

**ASK-B**: `validate.mjs:362-364`, pinned at `tests/validate.test.cjs:1185`
- **Violates:** the documented gap is narrower than what the code actually misses — the silent side of reject-on-doubt.
- **Scenario:** plain `node --test` (discovery, the form amazon-sheets-logger's `npm test` uses) over an emptied `my dir/x.test.cjs` beside `one.test.cjs` gives `PASS tests 2/2 (0s)`, exit 0, under spec and TAP. This is reported defect (b), silent, and nothing was "given". Node also strips `./`, so `./my dir/…` is missed too. None of her repos has such a folder today.
- **Fix:** "Not recognised: a file that node names by a relative path whose first segment holds a space, whether given, globbed or discovered (…)". Update the pin.

**ASK-C**: `tests/validate.test.cjs:1188-1194`
- **Violates:** "a guard that samples its domain". The comment says any appended contradiction goes red.
- **Scenario:** appending " An empty file such as x.test.js passes." or " Skipped tests (e.g. todo) pass." to the `--help` text stays green, 47/45/0. The `[^.]*` stops at every dot in a file name.
- **Fix:** split `rest` with `/\.(?=\s+[A-Z]|\s*$)/`, then require that no sentence matches both a subject and a verdict. I checked this: today's `--help` stays green, and both examples plus H3's original go red.

**Evidence and duties**
- **Validation (duty 3):** EXIT=0. 507 tests, 505 pass, 0 fail, 2 skipped (the two "on Windows …" cells). `git diff --check` on the range is clean. Log: `/tmp/claude-1000/-home-timetotilt-projects-shipping-app/0182bb45-990d-40f6-a9b6-0b595973253b/scratchpad/gate-b01f/rev2/validate.log`
- **Smoke at the tip:** smoke 1 gives `PASS tests 505/507, 2 skipped (21s)`, exit 0. Smoke 2 gives `FAIL tests 1 of 2 failed: fixture fails on purpose — log: …`, exit 1.
- **User's scenarios, live:**
  - skip-only: `FAIL tests no test passed (0/1, 1 skipped)`, exit 1, both reporters
  - partly skipped: `PASS tests 1/2, 1 skipped`
  - normal: `PASS tests 2/2 (0s)`, the no-skip form unchanged
  - empty file beside a real one: `FAIL tests 1 of 2 failed: empty.test.cjs (ran no tests)`
- **Hunk map (e2514d8..HEAD):** every hunk maps to a finding.
  - `validate.mjs:29-31` → P1-1; `--help` → P1-1's gap sentence and ASK-3
  - `mutate.test.cjs:266` → ASK-4
  - fixtures at :254-287 → P1-1, ASK-1, M26, H2; CASES and :635 are bookkeeping for those fixtures
  - :439 → M18; :564 → H4; live test :1048-1088 and help test :1181-1194 → the same findings
  - No scope creep, and the batch file is unchanged since e2514d8.
- **What the narrowing gave up:** the tip now misses exactly the names that contain a separator and have whitespace in their first segment. Node prints those only as relative names — given, globbed, `./`-prefixed or discovered — and I probed all four live. Absolute paths start with `""`, `C:` or a UNC prefix, so they are always recognised; her recipe uses absolute paths. Given and globbed names are inside the documented gap; discovered ones are not stated (ASK-B).
- **Sibling reader:** `validate.mjs:102`, the location-less fallback for failing entries, is not a finding. A failing real title gets a location live, and `loadFailures` comes back `[]` under both reporters.
- **Failing-on-base (duty 5):**
  - The tip's test files on 7fbca77 give 75 tests, 56 pass, 17 fail, 2 skipped. That is round 1's 15 plus the new M18 cell and the H4 cell, so it is consistent with the diff.
  - On e2514d8 exactly 5 fail — the corpus, CRLF, ANSI, live empty-file and `--help` tests, i.e. the P1-1 cells — as the implementer said.
- **Node 22 / Windows:**
  - The new ordering assertion (:1081) and the spec parent tracking need a parent test to close as a column-0 `✔ name (Xms)`.
  - An archived run shows exactly that: `/home/timetotilt/worktrees/os923/b01f/.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/evidence/W2/B03/polish/full-validation.txt:55-58`. The file itself names no version; that ledger recorded Windows and Node v22.22.3, so this is an inference.
  - Backslashes: TAP's `\\` is unescaped (:60) before the split.
- **Owed to B05's fix-up (duty 6):**
  - `/home/timetotilt/worktrees/os923/b01f/orchestrate/references/subagent-prompts.md:252-255` and its pin at `tests/tool-wiring.test.cjs:1016-1017`.
  - `mutate.mjs`'s comment, `classifyRun` reason and HELP (round 1's list).
  - One addition: the blind spot does not vanish at the tip. It narrows to scoped files that node names by a relative path whose first segment holds a space. B05 should rewrite that sentence around what remains and keep its "check the log" instruction, not delete it.
  - Nothing else: my grep of the repo found no other shipped statement of the old rule or the old `--help` wording.
- **Scratch files:** probes, mutation files and logs are under `/tmp/claude-1000/-home-timetotilt-projects-shipping-app/0182bb45-990d-40f6-a9b6-0b595973253b/scratchpad/gate-b01f/rev2/`. The clone is clean and the worktree was not touched.

B01 fix-up R2 test-hunter — FINDINGS 2 @334b0ac (default tier; nonce verified). Verbatim (nonce line removed):

FINDINGS 2

**Round-1 findings, each re-run against 334b0ac. All went red, so all are closed:**
- Hunter #1 / ASK-1 (M23, backward scan with no stop): **CLOSED**. 5 tests fail, including the corpus test, the "row: a file that ran no tests" test and the live test.
- Hunter #2 (spec end-regex without its `$` anchor): **CLOSED**. 4 tests fail (corpus, CRLF, ANSI, live).
- Hunter #3 (replace the "Not recognised" sentence with "A run with no tests at all passes."): **CLOSED**. The `--help` test fails.
- Hunter #4 (drop `${sk}` from the names-not-captured line): **CLOSED**. The names-not-captured row fails.
- ASK-2 M26 (`SCRIPT_FILE` changed to `/\.\w+$/`): **CLOSED**. 4 tests fail.
- ASK-2 M18 (`missing(names, loadFailures)`): **CLOSED**. The new "without a summary" test fails.
- Also red, beyond the ask: the old `fileShaped` rule (4 tests fail, the two real Shipping App titles among them) and shortening the ASK-3 filter list back to `--test-name-pattern` alone (the `--help` test fails).

**Setup.** I used a scratch clone (`git clone --shared`) at 334b0ac under `.../scratchpad/gate-b01f/hunt2/c`. The runner `hunt2/run.cjs` applies each mutation only if its anchor matches exactly once, otherwise it aborts. It runs only `tests/validate.test.cjs`, then restores the file. The first control run was bogus: I had set `NODE_TEST_CONTEXT=''`, node treated that as a nested run and ran nothing. I fixed that by deleting the variable. The real unmutated control gave 47 tests, 45 pass, 0 fail. Logs are in `hunt2/logs/*.log`. The clone's `git status` is clean, and I did not touch the worktree.

**1. MEDIUM-HIGH: `fileShaped` allows whitespace after the first separator, but the tests only check whitespace in the directories of absolute paths. A discovered empty file with a space in its name can silently pass again.** Class: a boundary pinned on one side only / a guard that samples its domain.
- Test: `/home/timetotilt/worktrees/os923/b01f/tests/validate.test.cjs:258` (`EMPTY_NAMES`), and the live test at :1043, whose temp paths contain no space.
- Production: `/home/timetotilt/worktrees/os923/b01f/orchestrate/tools/validate.mjs:31`.
- Two mutations stay green (both run, 45 pass / 0 fail, against the live control above):
  - BASENAME: append `&& !/\s/.test(name.split(/[\\/]/).pop())` to `fileShaped`.
  - ABSONLY: replace the first-segment clause with `(/^(?:[A-Za-z]:)?[\\/]/.test(name) || !/\s/.test(name))`.
- What that costs, run live under node 24:
  - Setup: the files `test/one.test.cjs` and an emptied `test/my data.test.cjs`, run discovered and absolute, under spec and TAP.
  - At the tip, all 4 runs report `emptyFiles` naming `my data.test.cjs` (1 passed, 1 failed).
  - Under either mutation, the mutated `fileShaped` returns false on that name, so the step reads PASS 2/2. That is the original defect.
  - Probe: `hunt2/probe.mjs`.
- The `--help` text promises that such a file is recognised: the only exclusion it states is whitespace in the first segment.
- Assertions to add:
  - To `EMPTY_NAMES`: `test/my data.test.cjs` (discovered form) and `C:\proj\my file.test.mjs` (space in the basename of an absolute path). Optionally `test/my dir/a.test.cjs`.
  - Ideally, a live emptied file whose name holds a space, run discovered.
- Test-only, so **ASK**.

**2. LOW-MEDIUM: the `--help` contradiction sweep only checks a sample of subject and verdict words. It even accepts the original defect restated.** Class: positive-only assertions on prose (the sweep samples its domain).
- Test: `/home/timetotilt/worktrees/os923/b01f/tests/validate.test.cjs:1192-1194`.
- Production: the HELP text, `orchestrate/tools/validate.mjs:338-364`.
- Each of these sentences, appended after `…"my dir/a.test.js").`, stays green (all run, 45/0):
  - "A file that registered no tests counts as a passing test." `passing` and `counts` are not verdict words.
  - "A run with zero tests succeeds." `zero tests` is not a subject; `succeeds` is not a verdict.
  - "A step whose every test was skipped is accepted." `accepted` is not a verdict.
  - "An empty file such as data.test.js passes." The `[^.]*` window stops at the dot in the file name.
- The words were probably narrowed so the sweep would not trip on "as one passing test", which the text itself contains.
- Fix, test-only (**ASK**):
  - Split the text into sentences by `. ` followed by a capital letter, not by any `.`.
  - Take the legitimate sentences out verbatim, as the test already does for RULE.
  - Widen the verbs to `pass(?:es|ed|ing)?|green|ok|succeeds?|accepted|counts as pass` and the subjects to add `zero|every test|all tests?`.

**Checked and holding:**
- Other sides of the narrowed `fileShaped`: the old rule, the M26 extension check, the separator split (both `\` and `/` are needed: `C:\Users\Jo Ann\…` and `/home/Jo Ann/…` each pin one), and the first-segment side (the two real titles and `parses config.test.js`).
- The TAP directive clause (SKIP and TODO), the TAP suite clause (`empty-suite.mjs`) and the spec `▶` parent tracking.
- The live test's "emptied file follows the parent" position check is real under both reporters (it is part of why H1 went red).
- The new no-summary test pins `missing`'s merge through a deepEqual.
- The `mutate.test.cjs` change is a comment only.

**Not a finding:**
- STOPSUB: narrowing the backward scan's stop to `# Subtest: ` alone stays green (run, 45/0). It is equivalent on real node output, because every top-level TAP entry opens with `# Subtest:`. That stop is defensive.

Polish pass: the same implementer, resumed with ASK-A, ASK-B, ASK-C and hunter #1 (#2 = ASK-C). ASK-A takes the wording fix, not the optional production narrowing (a polish never changes behaviour). The `--help` text lives in `validate.mjs`, so the polish touches a production file and closes with a fix-diff-only scoped re-review.

#### B01 fix-up — polish

Polish @`3f6fae5` (same implementer; nonce verified): ASK-A price sentence (wording only), ASK-B "Not recognised" sentence, ASK-C/hunter #2 sentence-boundary sweep with widened vocabulary and its seven specimens proven red, hunter #1 a space in the file's own name (corpus, absolute, live discovered); 11 mutations red after a passing control. Mechanical close: fence (manual) PASS — `git diff 334b0ac..3f6fae5` = the batch file (four ticked `polish:` lines), `orchestrate/tools/validate.mjs` (one hunk at :361, inside the `HELP` string at :338), `tests/validate.test.cjs`; range diff-check clean; worktree clean; orchestrator recipe on `3f6fae5`: 507 tests, 505 pass, 0 fail, 2 skipped. A production file touched → fix-diff-only scoped re-review (fresh, strong tier, Opus), duties 1, 2, 4.

#### B01 fix-up — scoped re-review and integration

Scoped re-review (fresh, strong tier, Opus; polish-phase, not a round) — SHIP @`3f6fae5`, verbatim (token line removed):

SHIP

The polish closes all five asks and changes no behaviour. I found two optional ASKs, below; neither blocks.

**Hunk map (duty 1): no scope creep.**
- `validate.mjs:361-365` → ASK-A and ASK-B.
- `validate.test.cjs:258-260` (comment and EMPTY_NAMES) → hunter #1. The count changes at :262, :266-267, :305-306 and :637 are bookkeeping for those two new names.
- :1091-1099 (live spaced test) → hunter #1.
- :1194 and :1196 (pins) → ASK-A and ASK-B.
- :1199-1212 (sweep) → ASK-C.
- The batch file adds only the 4 ticked `polish:` lines (4 added, 0 removed). 3f6fae5's parent is 334b0ac.

**Asks (duty 2)**
- **ASK-A: CLOSED.** The price sentence is the reviewer's suggested wording, word for word, and the :1194 pin matches it. Putting the old sentence back turns the `--help` test red on the needed-phrase list. `fileShaped` is unchanged.
- **ASK-B: CLOSED.** The sentence now reads "whether given, globbed, ./-prefixed or discovered", pinned at :1196. Putting the old sentence back turns it red.
- **ASK-C / hunter #2: CLOSED.**
  - The split uses exactly the reviewer's regex. The two rule sentences are compared word for word through `deepEqual(speaking(text), [RULE, COUNTS])`. The vocabulary is a superset of the hunter's list, and all 7 specimens from the reports are in SPECIMENS.
  - I ran real HELP mutations in a shared clone. Each turned the test red on "only the two rule sentences…": two appended specimens, one inserted after the price sentence, one lowercase-initial insert that merges into COUNTS, and one edit inside COUNTS that is not in the needed-phrase list.
  - Chunk [4] (COUNTS) is really three sentences, because "skipped counts…" and "node reports…" start lowercase. Since it is pinned word for word, the merge can only make the check stricter; it cannot let a contradiction through.
- **Hunter #1: CLOSED.**
  - Control: 47 tests, 45 pass, 0 fail, 2 skipped.
  - BASENAME and ABSONLY each turn 5 red: corpus, CRLF, ANSI, the row test and the live test.
  - My extra mutation, which checks the basename's whitespace only for absolute paths, turns 4 red. So `C:\proj\my file.test.mjs` catches a mutation of its own.

**No production change (duty 4)**
- The only validate.mjs hunk is at lines 361-365, inside `HELP` (lines 338-366). `fileShaped` (:31) and every parser are untouched.
- Live checks under spec and TAP through `runSpec`:
  - An emptied `my dir/x.test.cjs` beside `one.test.cjs` gives `PASS tests 2/2` whether discovered, given, globbed or `./`-prefixed. Node names it `my dir/x.test.cjs` every time (it strips the `./`), so the documented gap matches behaviour.
  - Absolute paths and `../my dir/…` are recognised, which fits "first segment".
  - `I/O errors from the reader surface through reader.js` and `config.test.js` titles each give `FAIL … (ran no tests)`, as the price sentence says.
- Full validation: EXIT=0, 507 tests, 505 pass, 0 fail, 2 skipped (both "on Windows …"). `git diff --check` on the range is clean. The worktree and the clone are both clean.

**Findings**
1. **ASK (test-only, optional):** `tests/validate.test.cjs:1205`. The sweep still misses contradictions phrased as "does not fail" or "success". I appended each of these to the text and all stayed green, 45 of 47 passing:
   - "A step whose every test was skipped never fails." (also run as a real HELP mutation)
   - "An empty file is treated as a success." (also run as a real HELP mutation)
   - "A skip-only run is not a failure."
   - "A run with no tests does not fail the step."

   The comment at :1199 says no other sentence may "speak of passing". Fix: add `|\bsucce(?:eds?|ss(?:ful)?)\b|\bnever fails?\b|\b(?:is|are) not (?:a )?fail(?:ure|ed)?\b|\bdo(?:es)?(?: not|n't) fail\b` to VERDICT and put the four sentences in SPECIMENS. I probed this: today's text still has exactly the 2 flagged sentences, and all 11 specimens are caught. This is what is left of hunter #2's class.
2. **ASK (wording, optional):** `validate.mjs:363`. The price sentence says "a title whose first word holds a slash", but a backslash does the same. `test('\\r\\n endings are normalised by validate.mjs')` gives FAIL `(ran no tests)` under both reporters, live. "file-shaped", defined in the previous sentence with `/ or \`, already covers it. Changing "a slash" to "a slash or backslash" would make the listed examples cover it too.

Scratch files (probes, the mutation runner and its logs, validate.log) are in `/tmp/claude-1000/-home-timetotilt-projects-shipping-app/0182bb45-990d-40f6-a9b6-0b595973253b/scratchpad/gate-b01f/rev3/`.

Its two optional ASKs (the sweep's "never fails" / "success" phrasings; "slash or backslash" in the price sentence) are test/wording residuals for BACKLOG at close-out. Integration: dry run clean (tree `55af17a`), merged `--no-ff` as `8dc09a3` (same tree); tip validation (pwsh) 507 / 505 / 0 fail / 2 skipped (the Windows-only pair), `git diff --check HEAD^1 HEAD` clean → B01 🧪 (the fix-up's covered row returns to the checkpoint; the page is re-issued after B05's fix-up). Worktree `b01f` removed. Fix-up metrics: rounds=1, asks=5 (+2 optional to BACKLOG), gate = 16 findings (R1 5 + 4, R2 3 + 2, scoped 2), 1 needing a production change (P1-1).

### B05 fix-up (`fix/B05-c1-followup`)

Implementer (default tier; nonce verified) — report verbatim (nonce line removed):

DONE

EVIDENCE: I ran `pwsh -NoProfile -File …/scratchpad/validate.ps1 > …/scratchpad/fixup-b05/validate.log 2>&1` from `/home/timetotilt/worktrees/os923/b05f`. It exited 0: 511 tests, 509 pass, 0 fail, 2 skipped (the baseline 507 plus 4 new tests; the 2 skips are the Windows-only pair). `git diff --check` is clean, the worktree is clean, and the diff against `chore/mechanical-tools-ledger` touches only 4 files, all inside the fence. Nothing was pushed.
Commit: `e7f1a8b` on `fix/B05-c1-followup`.

1. **SURVIVED now needs identical counts.** `classifyRun` compares each parsed step's passed and skipped counts with the control's. A step with no failing test whose counts moved is CRASHED, logged as "1 test skipped that ran in the control", "N tests ran that the control skipped", or "P passed, the control Q". Pinned by the skip-flip test (f1, plus the reverse p1) and new classification rows. Red on 8dc09a3 (`SURVIVED f1`) and red when I delete the check.
2. **Accurate reasons.** A mutated step where no test passed logs "no test passed (0/2, 2 skipped)". An emptied file logs "a test file ran no tests (…)", kept apart from real load failures, and both are named when both happen. Both appear in the log and in `--help`. Pinned by the f2 test and the e1 test; red on 8dc09a3 and under 3 mutations of the new code.
3. **Old claims fixed.** In `mutate.mjs`: the `classifyRun` comment, the control comment, and `--help` (the CRASHED list, a new SURVIVED definition, and "must pass at least one test … all skipped or todo … is CONTROL FAILED"). In `subagent-prompts.md`: the blind-spot sentence is rewritten around what remains and keeps the "check the log before citing a SURVIVED line" instruction. Its pin in `tool-wiring.test.cjs` is updated, still verbatim and once, with a guard that the old wording is gone. A grep of `orchestrate/`, `README.md` and `.claude/` found nothing else false. That pin is red on 8dc09a3.
4. **Tests in `tests/mutate.test.cjs`**, all real `node --test` runs through the CLI, each with a positive sibling:
   - (a) plus a partly skipped control: `CONTROL FAILED FAIL tests no test passed (0/1, 1 skipped) — log: …`, exit 2, nothing mutated. The 1/2-with-1-skipped control gives KILLED m1 and SURVIVED m2, exit 1.
   - Skip-flip: CRASHED f1 beside KILLED m1 and SURVIVED m2, then CRASHED p1.
   - No test passed: CRASHED f2 beside KILLED m1.
   - (b): `CRASHED e1: FAIL tests 1 of 1 failed: data.test.cjs (ran no tests) — log: …` beside `KILLED m1: add 2 and 3`, exit 2.
5. **Proofs ran outside the worktree.** The tests passed on their first run. I then copied them onto a `git clone --shared` of 8dc09a3, and ran 5 mutations of the new code in a shared clone of `e7f1a8b`, restoring each from saved bytes. Every mutation turned at least one test red. Both clones are deleted.

**Root cause:** SURVIVED only checked that the step passed and the total was unchanged. A run can keep its total while changing which tests ran, because skipped tests count toward the total. The old reasons also predated B01's `NO-TESTS` result and its `emptyFiles` list, so they named the wrong cause. `validate.mjs` already exposes everything needed, so no fence change was required.

**Decisions:**
- **Moved counts only matter without a failure.** In a step that has a named failure, fewer passes are expected, so a skip beside the failure still reads KILLED.
- **Fail closed across steps.** A count that moved in one step turns a named failure in another step into CRASHED.
- **New hunter sentence.** I added one sentence to the hunter skeleton, which is my addition rather than something you asked for: "A test the control skipped (`, <n> skipped` on its line) runs under no mutation, so no `SURVIVED` line says anything about it." It's there because a partly skipped control is still allowed. Code covered only by a test that skips will read SURVIVED, and that proves nothing about the skipped test.
- **Items 3 and 4:** I agree with your reading; README and `test-hunter.md` state nothing false.

**Results on 8dc09a3:**
- **Pass:** the (a) plus partial-control test. This is the expected regression pin.
- **Fail:**
  - skip-flip, at `SURVIVED f1`;
  - no test passed, at the log reason;
  - (b), at the log reason only, after its line and exit checks pass;
  - the classification table;
  - the tool-wiring hunter pin.

**What the checkpoint re-run should check:**
- The user's scenario (a) gives `CONTROL FAILED FAIL tests no test passed (0/1, 1 skipped) …` with exit 2.
- R2's emptied file gives a `CRASHED` line naming `(ran no tests)`, and the log says "a test file ran no tests".
- A mutation that flips one test's skip condition gives `CRASHED`, not `SURVIVED`, and the log says "1 test skipped that ran in the control".
- Steps 11–13 still produce their lines unchanged.

Fence (manual fallback; the helper cannot link a fix-up branch name): `git diff --name-status -M d483d32...e7f1a8b` = `orchestrate/references/subagent-prompts.md`, `orchestrate/tools/mutate.mjs`, `tests/mutate.test.cjs`, `tests/tool-wiring.test.cjs`, all in B05's fence; range diff-check clean; worktree clean → PASS. 6b: the branch's `tests/mutate.test.cjs` and `tests/tool-wiring.test.cjs` on `8dc09a3` — 58 tests, 53 pass, 5 fail (the emptied-file reason, the no-test-passed reason, the skip-flip, the classification table, the hunter pin); the scenario-(a) cell passes on the base, as the spec predicted (B01's merged fix delivers it; a regression pin) → PROVEN. Gate: a fresh reviewer (strong tier, Opus) and test-hunter (default), in parallel.

#### B05 fix-up — R1

B05 fix-up R1 reviewer — FIX FIRST @e7f1a8b (strong tier, Opus; nonce verified). Verbatim (nonce line removed):

FIX FIRST

**1. P1: a skip move beside a failure in the same step still reads KILLED.**
- **Where:** `/home/timetotilt/worktrees/os923/b05f/orchestrate/tools/mutate.mjs:233`. The `s.failed === 0 &&` guard switches off the skipped comparison along with the passed one. The diff pins this as correct at `/home/timetotilt/worktrees/os923/b05f/tests/mutate.test.cjs:667-668`.
- **Violates:** B05 criterion 2, "changes how many tests run, is CRASHED, never KILLED", read the user's way: a skipped test did not run.
  - It also breaks the table's own consistency. A changed total beside a named failure is CRASHED (`mutate.test.cjs:670`). A skip move in another step voids a named failure (`:683-684`). The same move inside the failing step does not.
  - The existing title at `:181` promises CRASHED for this case.
  - The stated rationale ("fewer passes are expected") only justifies ignoring `passed`. A failure moves a test from passed to failed; it never moves one into or out of skipped.
- **Scenario (live, e7f1a8b):**
  - e2: control `1/2, 1 skipped`; mutation flips a production feature flag on; the control-skipped test runs and fails. Result: `KILLED on: feature adds`, exit 0. The refutation names a test the control never ran.
  - e1: control `2/2`; flag off; one test fails and the other skips. Result: `KILLED off: direct adds`, exit 0, although only 1 of the control's 2 tests ran.
- **Fix:** change the line to `if (s.skipped !== c.skipped || (s.failed === 0 && s.passed !== c.passed)) return { kind: 'CRASHED', … }`. Then flip row `:668` to `['CRASHED', 'step tests: 1 test skipped that ran in the control']`, add an e2-style CLI cell, and reword the HELP (`:321-324`) and the comment (`:208-209`).
  - I tried this in a scratch clone. e1 and e2 become CRASHED with accurate reasons. Scenarios a–d and smoke steps 11–13 are unchanged. Of the 58 cells in the two test files, only `:668` goes red.
  - Cost: genuine same-step kills beside a skip move, and pytest strict-xfail XPASS (validate counts xfailed as skipped), would read CRASHED. That is the same conservative choice the tool already makes for a changed total.
  - As shipped, the `|| s.skipped !== c.skipped` part never decides anything: deleting it keeps all 58 green.
  - If you rule the exemption acceptable instead, criterion 2 and the title at `:181` must be reworded, because today they contradict the code.

**2. ASK: the added hunter sentence states a false premise.**
- **Where:** `/home/timetotilt/worktrees/os923/b05f/orchestrate/references/subagent-prompts.md:258-259`, plus "one blind spot" at `:252`. Pinned at `/home/timetotilt/worktrees/os923/b05f/tests/tool-wiring.test.cjs:1018,1020`.
- **Violates:** documents as code. The tool's own new log reason (`mutate.mjs:216`, "ran that the control skipped") and HELP (`:324`, "or the reverse") contradict it.
- **Scenario:** "runs under no mutation" is false:
  - for p1 (the batch's own cell, `mutate.test.cjs:321-326`);
  - for e2;
  - for a node todo test, whose body runs under every mutation;
  - for e3: complementary posix/windows tests gated on a production `isWin()`, mutation `=== 'win32'` → `!==`, gives `SURVIVED swap` even though the one test the control ran was skipped. So the count has a second blind spot, and "one blind spot" is false too.
- **Fix:** for example: "The count has a blind spot: … file name. A `SURVIVED` line says nothing about a test the control skipped (`, <n> skipped` on its line), since a mutation of code only that test covers still reads `SURVIVED`; and counts are not names: a mutation that skips one test and runs one the control skipped keeps every count." Update both pins. The same overclaim sits in `mutate.test.cjs:292` (section header) and the title at `:310`; e3 is a counterexample to both.

**3. ASK: HELP text re-wrapped around the edit.**
- **Where:** `/home/timetotilt/worktrees/os923/b05f/orchestrate/tools/mutate.mjs:333-335`.
- **Violates:** the contract's rule never to reflow or reformat surrounding text. The unchanged `--log`/`--timeout` sentences were re-broken, leaving `--help` lines 128 and 149 columns wide where every other line is 113 or less.
- **Fix:** re-wrap only the edited sentence when you reword the HELP for finding 1.

**Validation:** EXIT=0. 511 tests, 509 pass, 0 fail, 2 skipped; both skips are the Windows-only bash-resolution tests. Range `git diff --check` is clean, the worktree is clean at e7f1a8b, and all 4 changed files are in the fence. Log: `/tmp/claude-1000/-home-timetotilt-projects-shipping-app/0182bb45-990d-40f6-a9b6-0b595973253b/scratchpad/gate-b05f/rev/validate.log`.

**Duty 1 (hunk map):** every hunk maps.
- `classifyRun` and `moved()`: outcomes 1 and 2.
- The `classifyRun` comment, the control comment and both HELP hunks: outcome 3 (plus 1 and 2 in the HELP text).
- The hunter rewrite and the tool-wiring pin: outcome 3.
- Four new CLI tests and the new table rows: outcome 4.
- The added hunter sentence is in scope, not creep. Item 4 keeps partly skipped controls legal, and my probe g shows the user's scenario (a) with one passing test beside it still reads `SURVIVED m1` for code whose only test never ran. That sentence is the only guard against it; its wording is ASK 2.

**Duty 2 (live, scratch clone of e7f1a8b):**
- (a) prints `CONTROL FAILED FAIL tests no test passed (0/1, 1 skipped)`, exit 2, no mutation run, repository untouched, temp root empty.
- (b) prints `CRASHED empty-one: FAIL tests 1 of 1 failed: one.test.cjs (ran no tests)`, and the log says "a test file ran no tests (one.test.cjs)".
- Skip-flip prints `CRASHED f1` with the reason "1 test skipped that ran in the control".
- Partly skipped control: `KILLED m1`, `SURVIVED m2`, exit 1.
- Smoke steps 11–13 against I-09 print exactly the lines its README lists (exits 1, 2, 0). The fixture clone is untouched and the issued inputs hash unchanged.
- A todo-only control is CONTROL FAILED, as the HELP now says.

**Duty 4 (decision table):**
- SURVIVED requires equal passed, skipped and total counts in every parsed step, and every step passing. Two residuals: e3 (the swap) and the documented space-in-name gap (e4 still reads `SURVIVED empty`, as the rewritten sentence says).
- KILLED's only open path is finding 1.
- No honest KILLED became wrongly CRASHED. The cross-step rule matches the total rule, and the m1 kills in scenarios b, c and d are intact.
- The rewritten sentence keeps "check the log before citing a SURVIVED line". Nothing in the agent definition, `protocol.md` or the template contradicts it.

**Duty 5 (failing-on-base):** I re-ran it in a scratch clone of 8dc09a3 and got the same result: 58 tests, 53 pass, 5 fail, same names. Each of the five fails at exactly the assertion the diff changed, and the (a)/partial cell passes, as the spec predicted. Consistent with the diff.

**Duty 6 (sweeps):** a grep of `orchestrate/`, `README.md` and `.claude/` finds no other text still stating the old behaviour. The README's "then KILLED or SURVIVED each" predates this change and is not made false by it.

**Other notes:**
- Worth a BACKLOG entry at close-out: counts cannot see which tests ran (e3). Closing that needs per-test names from `validate.mjs` (B01's fence), and not every runner prints them.
- Windows and Node 22: nothing in the diff is platform-specific, and the new cells skip with a constant string, so they behave the same on win32.
- The main checkout shows ` M BACKLOG.md`. That was not from this review; I wrote nothing outside `rev/`.

Evidence is in `/tmp/claude-1000/-home-timetotilt-projects-shipping-app/0182bb45-990d-40f6-a9b6-0b595973253b/scratchpad/gate-b05f/rev/`: `probe/` (`probe.mjs`, `edges.mjs`, `partial-a.mjs`, `runs/`), `base-run.log`, `fixprobe-run.log`, `redundant-run.log`.

B05 fix-up R1 test-hunter — FINDINGS 4 @e7f1a8b (default tier; nonce verified). Verbatim (nonce line removed):

FINDINGS 4

Control first: I cloned e7f1a8b with `git clone --shared` into `.../scratchpad/gate-b05f/hunt/c0` and ran the full suite unmutated. It passed: 511 tests, 509 pass, 0 fail, 2 skipped. I applied each mutation in its own fresh shared clone, using a script that stops loudly unless its anchor matches exactly once, and re-ran the full suite each time. Those clones are deleted.

**1. HIGH: a skipped test that now runs and fails reads KILLED (→ P1)**
- **Test:** `tests/mutate.test.cjs:668`, the row "a named failure beside a skip in its step". It pins only one direction: a test that ran in the control is skipped under the mutation, beside a named failure.
- **Code:** `/home/timetotilt/worktrees/os923/b05f/orchestrate/tools/mutate.mjs:233`, the condition `s.failed === 0 && (...)`. Any failure turns the moved-count check off in both directions.
- **Class:** a boundary pinned on one side only, and a test that pins the defect.
- **Ran it:** I built a scratch repository with a test `{ skip: !onWindows() && 'Windows only' }` and a mutation `u1` that makes `onWindows()` return `true`.
  - Control: `CONTROL PASS PASS tests 1/2, 1 skipped`.
  - Result: `KILLED u1: windows path join`, then `MUTATE 1 killed, 0 survived, 0 other`, exit 0.
- **Why it matters:** the test named as "killed" never ran in the control. It fails only because it is a Windows test running on Linux. This is the same skipped-test counting the user reported, and it breaks acceptance criterion 2 ("changes how many tests run, is CRASHED, never KILLED"). It gives a false KILLED, which hides a vacuous test from the hunter.
- **Assertions to add:**
  - A classification row where the mutated step skipped fewer tests than the control, with a named failure, expecting `CRASHED 'step tests: 1 test ran that the control skipped'`.
  - A live cell where a p1-shaped mutation unskips a test that fails, expecting CRASHED and exit 2.
- **Also rule on:** a mutation that skips a test the control ran and also breaks a different test still reads KILLED. That is the implementer's own call, and criterion 2 argues against it.

**2. MEDIUM: the new `--help` text has no test at all (→ ASK)**
- **Test:** `tests/mutate.test.cjs:769` checks only that each kind token (`SURVIVED `, `CRASHED ` and so on) appears.
- **Mutation, green:** I put back the old wording at `mutate.mjs:321-324` and `:333-334`: "CRASHED: … a test file that failed to load, or a test count unlike the control's." and "each such step must run a test in the control."
- **Result:** full suite green, 509/0.
- **Assertions to add:** pin the SURVIVED and CRASHED definitions and the "must pass at least one test" rule word for word, and check that "must run a test" is gone.

**3. MEDIUM: the new hunter sentence is only checked for presence, and it is false (→ ASK for the sweep, P1 for the wording)**
- **Test:** `tests/tool-wiring.test.cjs:1020` checks that the sentence is present, but nothing looks for contradictions.
- **Mutation, green:** I appended "A `SURVIVED` line covers every test in the scoped spec, skipped ones included: each ran under the control." after the sentence at `/home/timetotilt/worktrees/os923/b05f/orchestrate/references/subagent-prompts.md:258`. Full suite green, 509/0.
- **The sentence itself is wrong:** it says a test the control skipped "runs under no mutation". The implementer's own `p1` cell runs such a test, and so does `u1` in finding 1. The accurate claim is that no SURVIVED line can rest on it.
- **Fix:** reword the sentence, and add a sweep of the hunter skeleton that flags any other sentence tying SURVIVED to skipped tests.

**4. LOW: a classification row feeds counts that no parser can produce (→ ASK)**
- **Test:** `tests/mutate.test.cjs:666`, the row "a passed count moved with the skips held", feeds passed 4, failed 0, skipped 0, total 5.
- **Why that is impossible:** in every parser, total equals passed + failed + skipped (`validate.mjs:35-36`, `:72`, `:113`, `:141-142`, `:158`). By line 233 the totals are already known to be equal, and a passing control has no failures. So "passed moved" and "skipped moved" are the same condition.
- **Consequences:**
  - The fallback reason "P passed, the control Q" at `mutate.mjs:217` cannot be reached by a real run.
  - **Mutation, green:** I deleted `|| s.skipped !== c.skipped` at `mutate.mjs:233`. Full suite green. This is an equivalent mutation, so no defect gets through today.
- **Class:** a branch no input reaches. The twist is that the test only reaches it with a state the upstream producer cannot emit. This may be worth adding as its own class.
- **Fix:** either assert the invariant or remove the fallback. The row and `--help` currently describe two independent conditions that are really one.

**Checked and holding** (reasoned from the tests; I did not run these):
- Deleting the `failed === 0` guard turns rows 668 and 681-683 red.
- Deleting the NO-TESTS line turns the f2 log check and the "no test passed" row red.
- Dropping the `emptyFiles` filter turns the row at 658 and the e1 `!includes('failed to load')` check red.
- Swapping the order of the joined reasons turns row 661 red.
- The check across steps (a moved count in one step voids a named failure in another) is pinned in both directions.
- The skip-flip is pinned both ways, live and in the table.
- The e1 and f2 reasons are checked against the log text the tool really writes.
- The old blind-spot wording is checked to be gone, and the new one is checked to appear once.

The (a) and (b) scenarios, f1, p1 and f2 all check real CLI output.

Fix round: the same implementer, resumed with both reports — P1 (the reviewer's fix: a moved skip count is CRASHED whatever the failures; only a moved passed count is exempt beside a failure), reviewer ASK 2 (= hunter #3: the added hunter sentence reworded to what is true, naming the swap blind spot, plus a contradiction sweep), ASK 3 (the reflowed HELP), hunter #2 (pin the HELP definitions), #4 (the unreachable passed-only row: assert the invariant or drop the fallback). The swap blind spot (counts cannot see which tests ran) is a BACKLOG residual at close-out — closing it needs per-test names from validate.mjs.

#### B05 fix-up — fix round

Same implementer, resumed; report verbatim (nonce line removed):

DONE

EVIDENCE: I ran the validation command from `/home/timetotilt/worktrees/os923/b05f` (log at `…/scratchpad/fixup-b05/validate.log`). It exited 0: 512 tests, 510 pass, 0 fail, 2 skipped (the Windows-only pair). `git diff --check` is clean, the worktree is clean, and the diff against `chore/mechanical-tools-ledger` touches only 4 files, all inside the fence. Nothing was pushed and the batch file is untouched.
Commits: `e7f1a8b` (the first repair) and `306a351` (this round), both on `fix/B05-c1-followup`.

- **P1:** In `classifyRun`, a moved skipped count is now CRASHED whether or not a test failed. The row that pinned the defect now expects CRASHED "1 test skipped that ran in the control". I added the other direction (fewer skipped than the control, beside a named failure → CRASHED "1 test ran that the control skipped") and a sibling where a failure beside the control's own skips is still KILLED. Two new live CLI cells:
  - **f3** (the reviewer's e1): skips one test and breaks the other. It gives `CRASHED f3: FAIL tests 1 of 2 failed, 1 skipped: flip first adds`.
  - **u1** (the hunter's u1): turns on a switch in `paths.cjs` that is fixed off, so the Windows-only test the control skipped runs and fails. It gives `CRASHED u1: FAIL tests 1 of 2 failed: windows join`, exit 2. Beside it, `KILLED j1: join puts a slash between` is the positive sibling.
  - The HELP text and the comment are reworded to match.
  - **Red:** on e7f1a8b the test fails at `KILLED f3`. Putting the old guard back fails the same test and the table. The u1 cell is unreached in both of those runs, so I showed it red separately with a mutation that exempts only the fewer-skipped direction: it printed `KILLED u1: windows join`.
- **ASK2:** "one blind spot" is now "a blind spot". The false sentence is replaced by two: a `SURVIVED` line says nothing about a test the control skipped, and counts are not names — a swap changes no count, so check a `SURVIVED` or `KILLED` line against the control's run in the log.
  - Both sentences are pinned verbatim, once each, plus a check that "one blind spot" is gone.
  - A new sweep of the hunter skeleton and `test-hunter.md` flags any other sentence that ties `SURVIVED` to skipped tests. It catches three specimens (the hunter's appended sentence, my old sentence, one bare) and a qualifier added inside a pinned sentence. It lets clean sentences through and has a live control.
  - The `mutate.test.cjs` section header and the test title no longer claim that equal counts mean the same tests ran.
  - **Red:** on e7f1a8b both the pin test and the sweep fail. The hunter's appended sentence fails the sweep.
- **ASK3:** I re-wrapped only the edited HELP sentences. The `--log`/`--timeout` sentences have their original line breaks back (the diff against the base leaves those lines untouched). No `--help` line is over 113 columns except the synopsis, which was already 140.
- **H2:** The SURVIVED definition, the CRASHED definition and the "must pass at least one test … is CONTROL FAILED" rule are pinned verbatim in the `--help` test, which also asserts "must run a test" is gone. **Red:** on e7f1a8b, and separately when I put back the old CRASHED wording or the old control rule.
- **H4:** I dropped the passed-only fallback (the "P passed, the control Q" reason and the comparison of passed counts). Every parser's total is passed + failed + skipped, so with equal totals and equal skipped counts, only failures can move the passed count. I removed the impossible row. The table's `step()` helper now asserts that invariant for every step it builds, so an unreachable state fails loudly.

**The rule now:** a mutated run is SURVIVED only if every parsed step passes with the control's total and skipped count (passed then matches too, by the invariant). A moved skipped count is always CRASHED. KILLED needs named failures in steps whose skipped count did not move.

**What it costs:** a genuine kill in the same step as a skip move now reads CRASHED. So does a pytest strict-xfail XPASS, because `validate.mjs` counts xfailed as skipped. This is the same cautious choice the tool already makes for a changed total.

**What remains:**
- **The swap:** a mutation that skips one test and runs one the control skipped changes no count, so it can still read SURVIVED or KILLED. It is now written in the hunter prompt. Closing it needs per-test names from `validate.mjs`, which is B01's fence; worth a BACKLOG entry at close-out.
- **The space-in-name gap:** a file node names by a relative path whose first segment holds a space still hides an emptied file, as the prompt says.

**Which new cells fail and pass on e7f1a8b:**
- **Fail (5):** the skip-count test at f3, the classification table, the `--help` pins, the hunter pin test, and the new sweep.
- **Pass:** everything else, including the (a)/partial, f2 and e1 cells.

**For the checkpoint re-run:** besides the earlier checks, a Windows-only test unskipped by a mutation that then fails should read `CRASHED`, not `KILLED`. Steps 11–13 should still print their listed lines.

Manual fence PASS on `306a351` (same 4 paths, all in B05's fence; range diff-check clean; worktree clean). R2: a fresh reviewer (strong tier, Opus) marks every round-1 finding and re-scans `git diff e7f1a8b..HEAD`; a fresh test-hunter scoped to the tests that diff adds or changes. The last round before the cap.

#### B05 fix-up — R2

B05 fix-up R2 reviewer — SHIP @306a351 (strong tier, Opus; nonce verified). Verbatim (nonce line removed):

SHIP

**Previous findings, checked at 306a351**
- **Reviewer #1 (P1): FIX VERIFIED.** The check at `/home/timetotilt/worktrees/os923/b05f/orchestrate/tools/mutate.mjs:234` now makes a moved skipped count CRASHED whether or not a test failed. The table row at `/home/timetotilt/worktrees/os923/b05f/tests/mutate.test.cjs:694-696` is flipped, and live cells f3 (`:329-335`) and u1 (`:338-342`) were added. The comment (`:203-211`) and HELP (`:322-325`) now match the code. Live results, e7f1a8b → 306a351:
  - e1: `KILLED e1: direct adds` → `CRASHED e1`, log "1 test skipped that ran in the control", exit 2.
  - e2: `KILLED e2: feature adds` → `CRASHED e2`, log "1 test ran that the control skipped".
  - The honest kill m1 is still KILLED and the comment-only c1 is still SURVIVED.
- **ASK 2: CLOSED.** "one blind spot" is now "a blind spot" (`subagent-prompts.md:252`), the false sentence is replaced (`:258-263`), the pins are updated (`tool-wiring.test.cjs:1006-1007, :1023, :1036`), and the test header and title are reworded (`mutate.test.cjs:304-306, :324`). One wording residue is new ASK A below.
- **ASK 3: CLOSED.** The `control. --log …` and `repository. --timeout …` lines are byte-identical to 8dc09a3, and no `--help` line is over 113 columns.
- **Hunter #1: FIX VERIFIED.** Live u1 goes from `KILLED u1` (exit 0) to `CRASHED u1: FAIL tests 1 of 2 failed: windows path join` (exit 2), with `KILLED j1` beside it. The table rows at `mutate.test.cjs:710-714` cover it. A mutation exempting only the fewer-skipped direction beside a failure turns the u1 cell and the table red.
- **Hunter #2: FIX VERIFIED.** The pins at `mutate.test.cjs:809-816` hold: putting e7f1a8b's CRASHED wording back turns the `--help` test red.
- **Hunter #3: FIX VERIFIED.** The sentence is rewritten, and the new sweep catches the hunter's own appended sentence (full suite red). It samples its domain, though: new ASK B.
- **Hunter #4: FIX VERIFIED.** The impossible fallback and its row are gone, and `step()` asserts the count rule for every table state (`mutate.test.cjs:666-670`).

**New findings**

**A. ASK: the swap sentence says "changes no count", which is false for the KILLED case it names.**
- **Where:** `/home/timetotilt/worktrees/os923/b05f/orchestrate/references/subagent-prompts.md:260-263`. Pinned at `tests/tool-wiring.test.cjs:1007`; the same claim sits in the comment at `tests/mutate.test.cjs:305` ("keeps every count").
- **Class violated:** documents as code.
- **Scenario (live):** control `1/2, 1 skipped`; mutation `=== 'win32'` → `!==` skips `posix join` and runs `windows join`, which fails. The run reads `1 of 2 failed, 1 skipped` and the tool prints `KILLED swap2: windows join`, exit 0. The passed and failed counts both moved. A hunter who expects a swap to leave the counts alone cites this KILLED against a finding about `posix join`, which never ran under the mutation.
- **Second problem:** the name comparison it orders is impossible where the log names no tests. pytest's default output prints only dots per file, and jest names tests only when it runs a single file.
- **Fix:** replace "changes no count" with "changes neither the total nor the skipped count", and append "; where the log does not name each test, cite neither". Update the pin and the `:305` comment.

**B. ASK: the new skip sweep only recognises the word "skip".**
- **Where:** `/home/timetotilt/worktrees/os923/b05f/tests/tool-wiring.test.cjs:1201-1202`.
- **Class violated:** a guard that samples the domain it claims to sweep.
- **Scenario:** I planted "A `SURVIVED` line also vouches for every test the control listed, including the ones it never ran." after `subagent-prompts.md:263`. The full suite stayed green (512/510/0). It contradicts the pinned sentence in the swap sentence's own words. The hunter's specimen in the same spot goes red, so the text is being read.
- **Fix:** match `/\b(?:skip(?:s|ped|ping)?|todo|never\s+ran|did\s+not\s+run|didn['’]t\s+run)\b/i`, exempt `CITE_PASSAGE` by its exact bytes (it pairs `SURVIVED` with "did not run"), and add my sentence as a specimen. Checked in scratch: both hunter texts stay clean, the three specimens and the qualifier plant are still caught, the clean lines pass, and my sentence is caught.
- **Outside what the test claims:** it checks SURVIVED only, so "A `KILLED` line always names a test that ran under the control." also stays green.

**Validation:** EXIT=0. 512 tests, 510 pass, 0 fail, 2 skipped; both skips are the Windows-only bash tests. `git diff --check` is clean inside the script and on the range. The worktree is clean at 306a351 and all 4 changed files are in the fence. Log: `/tmp/claude-1000/-home-timetotilt-projects-shipping-app/0182bb45-990d-40f6-a9b6-0b595973253b/scratchpad/gate-b05f/rev2/validate.log`.

**Hunk map (e7f1a8b..306a351):** every hunk maps; nothing is scope creep.
- Classification comment, skip check, HELP CRASHED list, f3/u1/j1 fixtures and cell, flipped row: reviewer P1 and hunter #1.
- `moved()` fallback removed, count-rule comment, `step()` assertion, impossible row removed: hunter #4.
- HELP re-wrap: ASK 3.
- Hunter sentences, their pins, the test header and title: ASK 2.
- `--help` pins: hunter #2.
- New sweep: hunter #3.

**Live runs** (scratch clones only):
- (a) prints `CONTROL FAILED FAIL tests no test passed (0/1, 1 skipped)`, exit 2, no mutation run.
- (b) prints `CRASHED e1: … data.test.cjs (ran no tests)`, and the log says "a test file ran no tests".
- The skip-flip prints `CRASHED f1`. A partly skipped control gives KILLED m1 and SURVIVED c1.
- Across steps, x1 is CRASHED with "step more: 1 test skipped…".
- Every run left the repository untouched and the temp root empty.
- Smoke steps 11–13 on a fresh I-09 clone print exactly the README's lines (exits 1, 2, 0). The issued inputs hash unchanged.

**Decision table:**
- SURVIVED needs every step to pass and, in every parsed step, no failed-to-load or empty file, the control's total, a passing step (not NO-TESTS) and the control's skipped count.
- KILLED also needs named failures, and no parsed step anywhere with a moved skipped count. The same-step and cross-step rules are now one rule.
- Two documented gaps remain: the swap (live `SURVIVED swap` and `KILLED swap2`) and the space-in-name empty file.
- By design, a real kill beside a same-step skip move, and a pytest strict-xfail XPASS, now read CRASHED. That is the stated cost, and it is consistent with criterion 2.

**The dropped passed-count check:**
- **Does total = passed + failed + skipped hold?** Yes, for every current parser: node and jest by their runners' own counters, pytest and cargo by construction. `found()` keeps it when it moves empty files, and jest adds load failures to failed and total alike. `tests/validate.test.cjs:491-512` pins it over the whole corpus.
- **Every path into `classifyRun`:** TIMEOUT, no summary, failed-to-load or empty files, a changed total and NO-TESTS all return before the skip check. Parser-none steps are skipped and can never read KILLED.
- **If a future parser broke it:** the code fails **open**. Given 4 of 5 passed, 0 failed, 0 skipped against a 5/5 control, 306a351 returns SURVIVED where e7f1a8b returned CRASHED.
- This is not blocking. A one-line guard in `classifyRun`, `if (s.passed + s.failed + s.skipped !== s.total) → CRASHED`, pinned by a row built without `step()`, would close it.

**Failing-on-base:** with round 2's test files on 8dc09a3: 59 tests, 52 pass, 7 fail. That is round 1's five plus the `--help` pins and the new sweep; the (a)/partial cell passes, as predicted. On e7f1a8b: 59/54/5, exactly the implementer's five, and the skip-count cell fails at `KILLED f3`. Consistent with the diff.

**Sweeps:** nothing in `orchestrate/`, `README.md` or `.claude/` still states the old behaviour.

**Other notes:**
- Any sentence sweep misses a follow-up sentence that uses a pronoun ("Yet such a line does show the skipped tests ran…" stays green). This file's other sweeps share that limit.
- The HELP CRASHED list still omits "a step failed without a named failing test" (for example a failing parser-none step). That predates this change, but the new pin now freezes it; adding it is optional.
- Windows and Node 22: nothing in the diff is platform-specific. u1's switch is fixed off on every platform, so the cell behaves the same on win32.

Evidence is in `/tmp/claude-1000/-home-timetotilt-projects-shipping-app/0182bb45-990d-40f6-a9b6-0b595973253b/scratchpad/gate-b05f/rev2/`: `probe/` (`head.out`, `e7.out`, the scripts), `runs/`, `smoke/` and `base-run.log`. I wrote nothing outside `rev2/`, and the mutation clone there is restored and clean.

B05 fix-up R2 test-hunter — FINDINGS 3 @306a351 (default tier; nonce verified). Verbatim (nonce line removed):

FINDINGS 3

**Round-1 hunter findings, re-run against 306a351:**
- **#1 CLOSED.** I put the round-1 guard back (mutation A: `if (s.failed === 0 && s.skipped !== c.skipped)`). It goes red at the f3 cell (`KILLED f3`) and at the classification table. Each direction goes red on its own:
  - B exempts only "ran that the control skipped" beside a failure. It goes red live at `KILLED u1: windows join`, and in the table at `mutate.test.cjs:703`.
  - C exempts only "skipped that ran" beside a failure. It goes red at `KILLED f3`, and in the table at `:694`.
- **#2 CLOSED.** Mutation D puts back the old CRASHED wording from e7f1a8b. The `--help` test goes red.
- **#3 CLOSED for the exact sentence it named.** Mutation F appends the R1 sentence ("skipped ones included"), and the new sweep goes red. The same sweep still misses nearby wordings; see findings 1 and 2.
- **#4 CLOSED.** The passed-only fallback and the impossible row are gone. The `step()` assertion checks only states the table builds by hand. The same rule for real parser output is already pinned in `tests/validate.test.cjs:509`, which covers at least 4 summaries with skips. So the `classifyRun` comment at `mutate.mjs:232-233` rests on a pinned fact.

**Method:** for each mutation I made a fresh `git clone --shared` checked out at 306a351, under `.../gate-b05f/hunt2/`. The apply script (`hunt2/apply.cjs`) stops unless its anchor matches exactly once.
- Unmutated control: tool-wiring 27/27, mutate 32/32, full suite 512 tests, 510 pass, 0 fail, 2 skipped.
- Every surviving mutation below was also run through the full suite, and each stayed at 510 pass, 0 fail.
- The worktree is still clean at 306a351, and all clones are deleted. Logs are in `hunt2/`.

**Findings, ranked by risk:**

**1. MEDIUM: the `KILLED` half of the swap sentence is not swept at all (→ ASK).**
- **Test:** `tests/tool-wiring.test.cjs:1201-1218` (`skipAsSurvived` and its test).
- **Class:** a guard that samples the domain it claims to sweep, and a positive-only assertion on prose.
- **Why:** `SKIP_SWAP` (`:1235`, in `subagent-prompts.md:259-263`) warns that a `SURVIVED` **or `KILLED`** line may rest on a test the control never ran. The sweep only looks for `kindPattern('SURVIVED')`. The neighbouring not-run sweep (`:1170`) ignores a sentence that names only result kinds.
- **Mutation, green (ran it):** I added this after `subagent-prompts.md:263` ("ran in the log."): "A `KILLED` line names only tests the control ran, so cite it as a refutation without reading the log." tool-wiring stayed 27/27 and the full suite stayed 510 pass, 0 fail.
- **Assertion to add:** sweep for any result kind the tool exports (RESULTS: `SURVIVED` and `KILLED`), with a `KILLED` specimen and a live control on both hunter texts.

**2. MEDIUM: the sweep's words sample what "a skipped test" can be called (→ ASK).**
- **Test:** `tests/tool-wiring.test.cjs:1202`, the `/\bskip(?:s|ped|ping)?\b/i` filter and the case-sensitive `SURVIVED` pattern.
- **Class:** a guard that samples its domain.
- **Mutations, green (ran both, same anchor, full suite green):**
  - H: "A `SURVIVED` line covers every scoped test, including any the control did not run."
  - I: "A mutation that survived proves every skipped test too."
  - The clean specimen at `:1217` ('A `survived` line that skipped nothing.') treats the lowercase form as correct by design.
- **Assertion to add:** extend the words to include `did not run`, `never ran`, `not run` and `todo`, each with a caught specimen. Also decide explicitly whether a lowercase `survived` next to a skip word counts.

**3. LOW: the verbatim `--help` pins only check that text is present (→ ASK).**
- **Test:** `tests/mutate.test.cjs:809-817`.
- **Class:** a positive-only assertion on prose.
- **Mutation, green (ran it):** mutation E adds "A step with a named failure is KILLED whatever its skipped count." after `mutate.mjs:325` ("the log records which."). mutate stayed 32/32 and the full suite stayed 510 pass, 0 fail.
- **Assertion to add:** check that no `--help` sentence other than the pinned CRASHED definition names `KILLED` or `SURVIVED` next to a skip word, with a live control.
- **Optional (production wording → P1):** `--help` never defines KILLED. Adding "named failures in steps whose skipped count did not move" would give that rule something to pin.

**Checked and holding (reasoned from the tests, not run):**
- The u1 cell is reached by the input it claims: the control is 1/2 with 1 skipped, and the run is 1 passed, 1 failed, 0 skipped. Its log reason is asserted from the real log.
- The f3 run is FAIL, not NO-TESTS, and the log tells it apart.
- The cross-step case in the table (`:708-711`) still holds with the new rule.
- Moving the skip check above NO-TESTS would turn the f2 log check red.
- The KILLED sibling beside the control's own skips (`:705`) guards against a rule that CRASHes too much.
- A qualifier added inside a pinned sentence breaks the exemption (`:1220`).

**Not flagged:** moving the skip check above the total check or the load-failure check only changes which accurate reason is logged. Both reasons are true, and the kind stays CRASHED.

Polish pass: the same implementer, resumed with reviewer A (swap sentence wording + "cite neither" where the log names no tests), reviewer B = hunter #2 (the sweep's skipped-test vocabulary, CITE_PASSAGE exempted by its bytes), hunter #1 (sweep KILLED as well as SURVIVED), hunter #3 (a contradiction check on the --help pins), and two --help wording additions (define KILLED; list "a step failed without a named failing test" under CRASHED) — prose only. Not folded: the reviewer's one-line classifyRun guard against a parser breaking total = passed + failed + skipped (today unreachable, pinned in validate.test.cjs; it fails open to SURVIVED if a future parser broke it) — a behaviour change, so never a polish; named BACKLOG residual, surfaced to the user with the offer to take it now as a reviewed change.

#### B05 fix-up — polish

Polish @`466a949` (`5579cf7` + `466a949`, same implementer; nonce verified): reviewer A (swap sentence: neither the total nor the skipped count moves; cite neither where the log names no tests), B/hunter #2 (skipped-test sweep vocabulary widened, `CITE_PASSAGE` exempted by bytes; lowercase result words count), hunter #1 (sweep kinds bound to the `RESULTS` export; a KILLED plant needed the "control ran" phrases, added in `466a949`), hunter #3 (no other --help sentence names KILLED/SURVIVED beside those words), --help defines KILLED and lists the unnamed-failure CRASHED cause; `classifyRun` untouched; the count-invariant guard not added (BACKLOG). Mechanical close: fence (manual) PASS — the batch file (five ticked `polish:` lines), `subagent-prompts.md`, `mutate.mjs` (one hunk at :322-327 inside `HELP`, :312-339), both test files; range diff-check clean; worktree clean; orchestrator recipe on `466a949`: 512 tests, 510 pass, 0 fail, 2 skipped. A production file touched → scoped re-review (fresh, strong tier, Opus), duties 1, 2, 4.

#### B05 fix-up — scoped re-review (polish phase)

B05 fix-up scoped re-review (polish phase, not a round) — FIX FIRST @466a949 (strong tier, Opus). Verbatim (token line removed):

FIX FIRST

**Asks**
- **Reviewer A: CLOSED.** `/home/timetotilt/worktrees/os923/b05f/orchestrate/references/subagent-prompts.md:260-264` has the asked wording. The pin is at `tests/tool-wiring.test.cjs:1007` and the comment at `tests/mutate.test.cjs:305-307`. `git grep` finds "changes no count" and "keeps every count" nowhere. Putting the old wording back, or dropping "cite neither", turns 2 tests red.
  - Live swap at 466a949, killing variant: the counts go from `1/2, 1 skipped` to `0 pass, 1 fail, 1 skipped`, and the tool prints `KILLED swap: windows join`. The total and skipped count held; passed and failed moved.
  - Passing variant: `SURVIVED swap`, every count equal.
  - The log names every test with its skip reason, in both the control and the mutation run. The sentence is true.
- **Reviewer B / hunter #2: CLOSED.** The word list (`tool-wiring.test.cjs:1204`) is the reviewer's regex plus `not run`, `control ran` and `ran under/in the control`. `CITE_PASSAGE` is exempted by its exact bytes (`:1206`) and pinned once (`:1213`). The specimens include the reviewer's sentence and the hunter's H and I. A lowercase result word now counts. Each of the three planted into the skeleton goes red, and so does a qualified cite passage.
- **Hunter #1: CLOSED.** The sweep takes `RESULTS` from mutate.mjs (`:1209-1211`) and has `KILLED` specimens. Its live control appends a plant to both hunter texts. The hunter's exact plant goes red in the skeleton and in `.claude/agents/test-hunter.md`.
- **Hunter #3: CLOSED.** `resultBesideSkip` (`mutate.test.cjs:808-809`) sweeps `--help` with the definitions exempted by their bytes. Mutation E planted after "the log records which." goes red, and so does a lowercase "killed … a test the control skipped" plant.
- **--help wording: done as asked, but the KILLED definition is false (F1).** "a step that failed without a named failing test" is true of `mutate.mjs:239`. Dropping either new sentence turns the test red.

**Hunk map:** every hunk maps to an ask. The five `polish:` lines are exempt. 466a949's "control ran" words exist to catch hunter #1's exact plant. No scope creep.

**Production unchanged:** mutate.mjs is byte-identical to 306a351 outside the `HELP` literal (one hunk). `classifyRun` is untouched, and no other file under `orchestrate/tools/` changed.

**Validation:** EXIT=0; 512 tests, 510 pass, 0 fail, 2 skipped (both Windows-only bash tests). `git diff --check` is clean on the range, and the worktree is clean at 466a949.

**F1 (P1, FIX FIRST): the new KILLED definition rules out the most common kill.**
- **Where:** `/home/timetotilt/worktrees/os923/b05f/orchestrate/tools/mutate.mjs:322` says KILLED needs "no CRASHED cause below holds". `:325` lists "a step in which no test passed" as a cause. Both are pinned at `tests/mutate.test.cjs:804,806`.
- **What the code does:** the no-pass check (`:231`) fires only on `NO-TESTS`. validate.mjs:291 calls any step with a failure FAIL before it ever checks NO-TESTS, so a step where nothing passed but a test failed is KILLED.
- **Live runs (`rev3/swapfx`):** a 1/1 control whose only test fails prints `KILLED j1: join puts a slash between` (pass 0), exit 0. The swap kill prints `KILLED swap` (pass 0).
- **The suite pins the same shape:** `mutate.test.cjs:372` (`KILLED m1: add 2 and 3`, 1/1 control) and the hunter's published command at `tool-wiring.test.cjs:1084` (math.test.cjs scoped to 1/1).
- **How it misleads:** when each scoped step holds one test, every kill has zero passes. Read literally, `--help` calls every such kill CRASHED, which the cite passage says means "the proof did not run". The cause predates the polish, but the polish made KILLED depend on it and pinned it again.
- **Fix:** at `:325`, change "a step in which no test passed," to "a step in which no test passed or failed," (103+10 = 113 columns, so it fits). Update `HELP_DEFINITIONS[2]` to match, and optionally the comment at `:208`. Checked in-process: a step with nothing passed or failed is always CRASHED, as NO-TESTS, a moved skipped count or a changed total.

**F2 (ASK): the CRASHED list omits one cause.**
- `classifyRun` also returns CRASHED for "the run did not reach its steps" (`mutate.mjs:220`, pinned at `mutate.test.cjs:704`), and the list does not name it.
- With zero steps, "every failing step names its failing tests" is vacuously true, and the same vacuity holds for a passing run.
- It is almost unreachable: validate only returns no steps when it refuses the spec, the log or the timeout, and mutate.mjs checks the spec and timeout first.
- Optional, in the same edit as F1: add that cause to the list and start KILLED with "a step failed, …".

Evidence is under `/tmp/claude-1000/-home-timetotilt-projects-shipping-app/0182bb45-990d-40f6-a9b6-0b595973253b/scratchpad/gate-b05f/rev3/`: `validate.log`, `exp.cjs` (12 mutations, 3 controls), `swapfx/work/*.log`, and `clone/`, restored and clean.

Polish-phase FIX FIRST (never counts toward the cap): the implementer redoes the polish within prose — F1 (the CRASHED list says "a step in which no test passed or failed", HELP_DEFINITIONS follow) and F2 (name "the run did not reach its steps"; KILLED starts "a step failed, …") — then a fresh scoped re-review of the new diff. A second polish-phase FIX FIRST discards the polish (`polish discarded: @306a351`).

Polish redo @`03d29bd` (same implementer; nonce verified): the CRASHED cause reads "a step in which no test passed or failed" (validate.mjs's NO-TESTS), CRASHED starts "the run did not reach its steps", KILLED starts "a step failed, …"; the comment above `classifyRun` follows; `tests/mutate.test.cjs` ties each wording to `classifyRun` (a 0-passed 1-failed step is KILLED, a NO-TESTS step CRASHED, the no-steps reason exact) — red on `466a949` and on each removal. Diff `466a949..03d29bd`: `mutate.mjs` (the comment at :208-210 and the `HELP` literal only) and the test file; range diff-check clean. A fresh second scoped re-review (strong tier, Opus) of that diff.

#### B05 fix-up — second scoped re-review and integration

Second scoped re-review (fresh, strong tier, Opus; polish-phase, not a round) — SHIP @`03d29bd`, verbatim (token line removed):

SHIP

**F1: CLOSED.** The no-pass cause at `mutate.mjs:325` now reads "a step in which no test passed or failed", which is true of the code:
- **The no-pass check:** `classifyRun:231` fires only on validate's NO-TESTS. That result (`validate.mjs:294`) is reachable only after `:291`/`:292` have not fired, so nothing failed and the step exited 0.
- **Non-zero exit with nothing passed or failed:** validate calls that FAIL, not NO-TESTS, but it is still CRASHED at `:230` or `:234`. The control passed at least one test, so the total or the skipped count must differ.
- **No kill matches a listed cause through a counted step.** A kill's failing steps are FAIL with failed > 0 and names. Its passing counted steps have passed > 0 (`validate.mjs:294-295`).
- **Live at 03d29bd:** off `CONTROL PASS PASS tests 1/1`, the run prints `KILLED k1: add sums two numbers`, with pass 0 and fail 1 in that run's counts. The NO-TESTS mutation prints `CRASHED n1: FAIL tests no test passed (0/1, 1 skipped)`, and the log gives the same reason.

**F2: CLOSED.**
- The list's first cause is the exact reason string `classifyRun:220` returns, pinned from the code at `mutate.test.cjs:841`.
- "KILLED: a step failed, …" is false for zero steps. Whenever the run's status is not PASS, validate has a step that did not pass (`validate.mjs:332`), so the failing list at `:238` is never empty. No vacuous KILLED is left.
- The seven CRASHED causes in `--help` match `classifyRun`'s seven CRASHED returns (`:220, 225, 229, 230, 231, 234, 239`) one to one: none missing, none extra.

**Hunk map:** no scope creep.
- The comment at `:208-210` is F1 (the optional comment edit from the last review, reflowed).
- HELP `:322-327` is F1 plus F2. `HELP_DEFINITIONS[0]` and `[2]` are re-pinned to match.
- The new cells are `:834-838` for F1 and `:839-842` for F2.

**The new cells catch every mutation:** 10 of 10 go red in a shared clone, scoped to the `--help` test. The clone was restored from saved bytes, checked against HEAD, and is clean.
- Removing " or failed", the zero-step cause or "a step failed, " from HELP alone fails at L819.
- Removing each from HELP and HELP_DEFINITIONS together fails at L838, L841 and L842.
- Re-adding the old clause as its own sentence fails at L838.
- Three code mutations: renaming the zero-step reason fails at L841, a no-pass check on `passed === 0` at L834, and removing the zero-step guard at L840.

**No behaviour change:** with the HELP literal and `//` lines stripped, mutate.mjs is byte-identical to 466a949 and to 306a351. `classifyRun`'s source is identical.

**Validation:** EXIT=0, 512 tests: 510 pass, 0 fail, 2 skipped (the Windows-only bash tests, validate.log:518-519). `git diff --check` is clean on the range, and the worktree is clean.

**Findings**

**ASK-1 (optional; predates 03d29bd; same class as the last review's F2 vacuity).**
- **Where:** `orchestrate/tools/mutate.mjs:325`, pinned at `tests/mutate.test.cjs:806,838`. The no-pass cause says "a step", not "a counted step".
- **Scenario:** read literally, a passing parser-none step is "a step in which no test passed or failed", because it counts no tests. KILLED requires "no CRASHED cause below holds", so the text rules out KILLED for any spec with a parser-none step. Live run B (`tests` plus a parser-none `lint` step) prints `KILLED k1` beside `lint ok`.
- **Age:** the old "no test passed" wording had the same subject, and 03d29bd re-pins it word for word.
- **Fix:** "a counted step in which no test passed or failed", the word KILLED and SURVIVED already use. That makes line 325 119 columns, so reflow `:325-327` to 113 and update `HELP_DEFINITIONS[2]` and the string at `:838`.

**Out of scope, pre-existing (register rather than fold in):** the SURVIVED sentence has had the same wording since e7f1a8b, and unlike KILLED it has no "no CRASHED cause holds" clause. Live run l1 has tests identical at 1/1 and a failing parser-none step. The code prints `CRASHED l1 … a step failed without a named failing test`, while the SURVIVED sentence, taken literally, also holds.

Evidence is in `/tmp/claude-1000/-home-timetotilt-projects-shipping-app/0182bb45-990d-40f6-a9b6-0b595973253b/scratchpad/gate-b05f/rev4/`:
- `validate.log`
- `live/work/{a,b,c}.log`
- `muts/run.cjs` and `muts/m*.tap`
- `samecode.cjs`
- `clone/` (restored, clean)

Its optional ASK-1 ("a counted step" in the no-pass cause) and the pre-existing SURVIVED-sentence note are wording residuals for BACKLOG at close-out. Integration: dry run clean (tree `7f0df46`), merged `--no-ff` as `8712d87` (same tree); tip validation (pwsh) 512 / 510 / 0 fail / 2 skipped, `git diff --check HEAD^1 HEAD` clean → B05 🧪. Worktree `b05f` removed. Fix-up metrics: rounds=1, asks=5, gate = 16 findings (R1 3 + 4, R2 2 + 3, scoped 2 + 2 counted with their optional notes as 2), 1 needing a production change (the P1).
