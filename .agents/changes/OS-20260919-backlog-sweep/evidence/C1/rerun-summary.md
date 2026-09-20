# C1 smoke — re-run summary (corrected HTML page)

**Change**: OS-20260919-backlog-sweep
**Script executed**: `smoke-C1.json` (authoritative sidecar) / `smoke-C1.html`.
The `step-01.md`…`step-10.md` + `summary.md` in this directory executed an earlier,
now-deleted markdown draft with a **different step numbering** and are superseded.
**Build**: `chore/backlog-sweep-ledger`, HEAD `257e85d`, tested build
`e79d3781b9290d54b6c4996989d7b19b6b358422` (`e79d378`).
**Run**: 2026-09-20, agent, all ten steps plus the gate, in order.
**Machine**: Windows 11, PowerShell 7.6.6, node v22.22.3.

## Verdicts

| # | What it checks | Verdict |
| --- | --- | --- |
| Gate | branch, build ancestry, canary | **PASS** |
| 01 | BL-003 situation real on a stock Windows install | **FAIL** |
| 02 | the refusal half still binds (three named tests) | **PASS** |
| 03 | BL-002 closed end to end (`protocol-contract`) | **PASS** |
| 04 | the before/after fence record in the two ledgers | **PASS** |
| 05 | archive guard can fail (throwaway clone) — RED step | **PASS** |
| 06 | nested definition is caught — RED step | **PASS** |
| 07 | BL-004 forms + escape whitelist | **PASS** |
| 08 | the whole build — 260 pass, 0 fail | **PASS** |
| 09 | four agent definitions unchanged | **PASS** |
| 10 | the prior evidence summary | **PASS** |

**10 PASS, 1 FAIL, 0 BLOCKED, 0 COULD-NOT-RUN.**
The one FAIL is a defect in the smoke script, not in the build.

## Both RED steps went genuinely red

This was the single most important thing to establish, and it holds.

| Step | Failure induced | Test that fired | Totals | After restore |
| --- | --- | --- | --- | --- |
| 05 | Excel sentence deleted from the archive READBEFORE, **in a throwaway clone** | `reusable artifacts contain no local Python installation default, while frozen ledger retains its environment fact` | 259 / 1, exit 1 | 260 / 0, exit 0 |
| 06 | `.claude/agents/subdir/orchestrator.md` created | `the directory holds exactly the four known definitions`, message naming `subdir/orchestrator.md` | 259 / 1, exit 1 | 260 / 0, exit 0 |

Each went red with exactly one failure and exactly the named test.

## The FAIL — Step 1's published command cannot execute

`node -e "…"` aborts with `SyntaxError: Invalid or unexpected token`, exit 1, before
emitting anything. Two independent authoring defects, both in the published source:

1. A **literal U+0000** as the `split` delimiter (`smoke-C1.json` encodes `\u0000`), so the
   rendered `<code>` carries one invisible NUL that no shell can receive. Pasting drops it,
   silently turning the call into `out.split('')`.
2. A **literal newline** inside the single-quoted JS string `bad.join('\n')` (the JSON
   encodes a real newline escape), which is an unterminated string literal.

Repairing both to `'\0'` and `'\n'` gives the answer the step wants:
`paths inspected: 375`, `paths resolving to a filter: 0`. So BL-003's claim is true; the
command that is supposed to demonstrate it is not runnable.

## Documentation defects found (as valuable as the verdicts)

1. **Step 1, command 2 — literal NUL.** See above. Unrunnable and invisible on the page.
2. **Step 1, command 2 — literal newline in a string literal.** Hard SyntaxError.
3. **Step 1's aside claims a pre-verification that never happened.** "Runner: agent,
   pre-verified — 375 paths inspected, 0 resolving." The only pre-verification here,
   `step-03.md`, ran the *raw pipeline* and reported **365** paths. The summariser is new
   in this re-authoring and has never run in the form published.
4. **Standfirst contradicts Step 10.** The standfirst says "Ten checks, **every one already
   run by an agent** and passing"; Step 10's own pass line says "Two are marked FAIL".
   Both describe the same evidence directory.
5. **Step 10 points at evidence with incompatible numbering, un-flagged.** `summary.md`
   records FAIL at *its* steps 05 and 06. Those are the current page's *removed* fence step
   and its Step 4. The current page's Steps 5 and 6 are `summary.md`'s steps 07 and 08 —
   both PASS. A reader will read the two FAILs onto the two RED steps. The page should say
   the prior evidence is superseded and renumbered.
6. **Step 9's "simpler" alternative does not answer its own pass line.** `git log --oneline
   -- .claude/agents/` is unbounded; it returns two commits (`c72368f`, `33a8d5b`) from the
   *previous* change, and cannot distinguish "in this change". Only the ranged form
   `git log --oneline e79d378..HEAD -- .claude/agents/` (empty) establishes the claim.
7. **Step 7's pass line is not checkable from the page.** "The three forms BL-004 names" —
   BL-004's text appears nowhere in the smoke page or its sidecar. It is in
   `01-plan.md:102-109`. The page gives no citation.
8. **Step 8's aside repeats an unverified claim.** "`node --test tests/` is *not* [the
   portable equivalent] … the suite fails." Not tested (another four-minute run, and not a
   pass condition). `README.md:218-227` documents the portable form but does not literally
   state that `tests/` fails; `tests/protocol-contract.test.cjs:269` is the pinning test and
   is green.

### Previously reported defects that ARE fixed

The three the user found by hand are genuinely corrected in this page: the eyeball-1,125-
fields step is now a summariser (albeit a broken one — defects 1-2); the only section
cross-reference left is "Section 4, Step 8", which resolves; and the section prerequisites
name Step 5 and Step 6 correctly against the steps that need them.

## Passed for a reason other than the one given

- **Step 2** — the first of the three named tests is a *parent* with two subtests
  (`clean`, `process`), so its name appears four times in spec output. The pass line's
  "One unit = one named test; expect three" resolves this correctly; noting it because a
  runner counting `✔` lines would get five, not three.
- **Step 10** — passes, but "both have since been corrected" is only checkable by diffing
  the current page against defects described in superseded evidence. I reconstructed the
  mapping; the page supplies no pointer for it.
- **Step 3** — the aside's live-fence `"status":"PASS"` claim was **not** reproduced, on the
  aside's own instruction (the candidate worktree is gone). Step 3's verdict rests only on
  the named test and `pass 7 / fail 0`.

## Safety and cleanup

- `.agents/archive/` in **this** repository: never modified. Step 5 ran in a clone at
  `%TEMP%\os919c1`; `git status --porcelain` in the real repo was empty before the clone,
  after the edit, after the RED run and after cleanup. Clone deleted (`Test-Path` False).
- Step 6 touched only an untracked file; the four tracked definitions were sha256-identical
  before and after. Nothing written to `~/.claude/agents/`.
- No global/system Git config change, no `git lfs install`, nothing installed, no branch
  switch, no commit, push, merge or `git worktree add`. Temp files in the session
  scratchpad only.

## Final `git status --porcelain`

```
?? .agents/changes/OS-20260919-backlog-sweep/evidence/C1/rerun-gate.md
?? .agents/changes/OS-20260919-backlog-sweep/evidence/C1/rerun-step-01.md
… rerun-step-02.md … rerun-step-10.md
?? .agents/changes/OS-20260919-backlog-sweep/evidence/C1/rerun-summary.md
```
Only this run's own evidence files. The superseded `step-*.md` and `summary.md` were not
modified.
