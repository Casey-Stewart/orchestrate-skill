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
