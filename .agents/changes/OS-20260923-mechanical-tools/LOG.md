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
