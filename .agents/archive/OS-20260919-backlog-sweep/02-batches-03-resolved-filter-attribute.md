# B03 — Resolved per-path filter attribute (fix, —)

**Branch**: `fix/resolved-filter-attribute`
Cut from the integration tip when the wave opens.
**Wave**: 1 · **Weight**: L
**Depends on**: none
**Smoke gate**: hands-on — checkpoint C1 follows wave 1
**Files**: `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `orchestrate/tools/git-evidence.mjs`, `tests/check-fence.test.cjs`, `tests/git-contract.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: "A defect class fixed in the reported instance and left in its sibling" — this probe is reached through both `worktrees()` and `discovery()`, and `check-fence.mjs` inherits it; check every caller. · "A test that pins the defect" — an existing assertion may encode the old trigger. · "`tests/protocol-contract.test.cjs` mirrors protocol.md against the contract template" — a one-sided prose edit goes red in a file this batch does not own.
**Spec**: [01-plan.md](01-plan.md) §B03 · **Gate**: fence check → failing-on-base + reviewer + `test-hunter`

## Implementation notes

One backlog entry, but the highest-value one in the change and the only `L` in it. It
touches a safety property, so read this whole section before editing anything. Verbatim:

> **BL-003** (medium) — `check-fence.mjs` reports `unsafe-filter` — and therefore
> `UNKNOWN` — whenever clean/process filters appear in **config**, rather than when a
> path actually resolves to one. Git for Windows writes `filter.lfs.*` into
> `C:/Program Files/Git/etc/gitconfig` on every stock install, so the helper is unusable
> on essentially any Windows machine. The safety property (never execute a clean filter
> to obtain a clean result) is correct and worth keeping; checking the resolved per-path
> `filter` attribute (`git check-attr filter`) preserves it while restoring the mechanical
> gate.

**The code is not where the entry says it is.** It lives in
`orchestrate/tools/git-evidence.mjs`, in `safeStatusPrerequisites()`.
`orchestrate/tools/check-fence.mjs` inherits the verdict through `worktrees()` and needs
NO change — it is deliberately outside this fence.

**Facts at the ledger base `f829040`** — verify each before relying on it:

- `orchestrate/tools/git-evidence.mjs:102-124` — `safeStatusPrerequisites(repo,
  diagnostics, options)`. It strips `GIT_CONFIG` from the environment (with the comment
  explaining that `GIT_CONFIG` affects `git config` only and must not conceal the real
  configuration), then at `:110-112` runs
  `git config --includes --null --name-only --get-regexp '^filter[.].*[.](clean|process)$'`
  and returns `false` with an `unsafe-filter` diagnostic if the output is non-empty.
  After that it inventories the index and refuses on submodules (`:121`).
- It is called at `:147` from `worktreesRaw()`, immediately before
  `git status --porcelain=v1 -z --untracked-files=all --ignore-submodules=all`. On
  `false` it `continue`s, leaving `cleanliness: 'unknown'`.
- `worktrees()` (`:155`) and `discovery()` both surface it. `check-fence.mjs` consumes
  `worktrees()` TWICE — at `:150` for the candidate observation and again at `:201` for
  the post-check re-observation — and turns an incomplete observation into `UNKNOWN`.
  Account for both when checking callers; neither needs an edit.
- **Reproduced on this machine, 2026-09-19 — record this before changing anything.**
  `git config --global --name-only --get-regexp '^filter\..*\.(clean|process)$'` exits 1,
  but `--system` returns `filter.lfs.clean` and `filter.lfs.process` from
  `C:/Program Files/Git/etc/gitconfig`. And
  `node orchestrate/tools/git-evidence.mjs worktrees --repo .` exits **2** with
  `completeness: partial`, `cleanliness: unknown, unknown` and two `unsafe-filter`
  diagnostics. **This is the C1 canary.** Capture the base-build output verbatim in the
  report before the first edit.
- Meanwhile NO path here resolves to a filter:
  `git ls-files -z --cached --others --exclude-standard | git check-attr filter -z --stdin`
  returns `unspecified` or `unset` for every path. `.gitattributes` uses `-filter`, which
  resolves to **`unset`**. So `unset` is SAFE, alongside `unspecified`. Only a set value
  (`filter: lfs`) or a bare `set` is unsafe. Getting this backwards makes the helper
  refuse on every path this repository pins, which is worse than the bug being fixed.
- `tests/smoke-inputs.test.cjs:205` already runs
  `git check-attr text eol filter ident working-tree-encoding -- <file>` in this
  repository — an in-repo precedent for the command and its output shape. That file is
  NOT in this fence; read it, do not edit it.
- **Three existing tests cover this area, and all three assign a filter attribute to a
  real path — so all three must stay GREEN under the new rule:**
  - `tests/git-contract.test.cjs:186` — local config + tracked `.gitattributes`, for both
    `clean` and `process`; asserts `completeness: 'partial'`, `cleanliness: 'unknown'`,
    an `unsafe-filter` diagnostic, CLI exit 2, and that the marker file was never written.
  - `tests/git-contract.test.cjs:200-205` — the `GIT_CONFIG` concealment case: pointing
    `GIT_CONFIG` at an empty file must NOT hide the configured filter.
  - `tests/git-contract.test.cjs:292` — the same via `--global` config.
  - `tests/check-fence.test.cjs:235` — local config + `.git/info/attributes`; the fence
    must remain `UNKNOWN` with `unsafe-filter` and must not execute the marker.
- The rule is stated in prose in exactly TWO places, and
  `tests/protocol-contract.test.cjs` asserts the §Read-only evidence tools sections of
  both files are byte-identical after placeholder substitution:
  `orchestrate/references/protocol.md:216` and the mirror in
  `orchestrate/templates/00-READBEFORE.md`, both reading *"Before status, inspect
  effective Git config: executable clean/process filters or submodules make safe
  cleanliness unknown; do not execute such filters to obtain a clean result."*
  A third copy of the claim is in the `--help` text at `git-evidence.mjs:312`.
- **Two further suites read this batch's files and are NOT in the fence.** They are
  read-only couplings, declared here so they are not discovered mid-round. Neither needs
  an edit if the rules below are followed; if you believe one does, that is a
  `NEEDS_FENCE`, not an edit.
  - `tests/contract-prompt-authority.test.cjs:7,15` reads
    `orchestrate/templates/00-READBEFORE.md`, and `:107-120` runs three "boot-time full
    read" prohibition regexes over the WHOLE template outside the pinned implementer
    paragraph — which includes §Read-only evidence tools, the section this batch rewrites.
    Your new prose must not match any of:
    `/\bread\s+(?:this|the)\s+(?:whole\s+|entire\s+|full\s+|complete\s+)?(?:file|contract)\b/i`,
    `/\b(?:skim|study|review|consume|digest)\s+(?:this|the)\s+(?:whole\s+|entire\s+|full\s+)?(?:file|contract)\b/i`,
    `/\bread\b[^.\n]{0,40}\b(?:in full|end[- ]to[- ]end|cover to cover|from top to bottom)\b/i`.
    In practice: never write "read this file in full" or any near-paraphrase.
    The same suite at `:122-137` enumerates every ledger contract to assert a template
    edit never rewrites a filled one — which holds automatically, since you edit the
    template and no ledger instance.
  - `tests/subagent-type-mapping.test.cjs:13` reads `orchestrate/references/protocol.md`.
    Its assertions are about `subagent_type` mapping and the §Degraded bullet, not about
    filters, so a filter-sentence edit does not disturb it. Confirm rather than assume.

**Design decisions made at planning time — follow these.**

1. **The safety property does not change.** This helper must never execute a clean or
   process filter, and must never report `clean` by disabling a conversion. Only the
   *trigger* changes: from "a driver is configured anywhere" to "a path that status would
   inspect actually resolves to one".
2. **Authority is the resolved attribute.** Refuse — `unsafe-filter`, cleanliness
   `unknown` — if and only if at least one inspected path resolves to a `filter` attribute
   that is SET to a value, or bare-`set`. `unspecified` and `unset` are SAFE.
3. A config probe MAY remain, but only as a fast path in the safe direction: it may skip
   the attribute enumeration when nothing at all is configured. It must never be the sole
   reason to refuse, and it must never turn an unsafe attribute into a safe verdict.
4. **Enumerate what status enumerates** — tracked and untracked non-ignored paths, since
   the status call uses `--untracked-files=all`. `git ls-files -z --cached --others
   --exclude-standard` piped into `git check-attr filter -z --stdin` is the shape already
   used in this repository. Enumeration executes nothing.
5. **Any probe failure, malformed record or unparseable output stays `unknown`.** Never
   assume safe on an error. The existing `invalid-index` handling and the submodule
   refusal are unchanged and remain separate reasons to return unknown.
6. Update the `--help` text and BOTH prose mirrors to describe the resolved-attribute
   rule, **changing them identically** so `tests/protocol-contract.test.cjs` stays green
   without being edited.
7. Add the test this fix is actually about: a repository with a clean/process filter
   configured but NO path resolving to it must report real cleanliness (`clean` or
   `dirty`), `completeness: complete`, exit 0, and no `unsafe-filter` diagnostic. That
   test must be RED at this batch's base commit.

**Traps.**

- **Do not edit `tests/protocol-contract.test.cjs`.** B02 holds it this wave, and no
  extension can be granted to a same-wave sibling's file. If both prose mirrors change
  identically, that test needs no change. If you believe it must change, stop and report
  `NEEDS_FENCE` with the reason.
- The `GIT_CONFIG`-stripping comment at `:106-109` explains a real attack. `git
  check-attr` is not affected by `GIT_CONFIG`, which strengthens the property — but do
  not delete the reasoning without replacing it with reasoning that is still true.
- A repository with no files at all must be SAFE, not unknown.
- An attribute set by `$GIT_DIR/info/attributes` (not a tracked `.gitattributes`) must
  still refuse — `tests/check-fence.test.cjs:235` depends on exactly that.
- Path names containing `"`, spaces or non-ASCII must survive the `-z` round trip.
  `check-attr -z` output is NUL-separated triples; parse it, do not split on tabs.
- A filter attribute on an ignored, untracked path is not inspected by status, so it is
  not strictly a refusal. If establishing that cheaply is awkward, refusing is the
  acceptable conservative answer — but SAY which you chose and why, in the report and in
  a code comment.
- `orchestrate/tools/check-fence.mjs` is outside this fence on purpose. It should need no
  change; if it does, that is a `NEEDS_FENCE`.

## Checklist

- [x] Capture the base-build canary BEFORE editing: run
      `node orchestrate/tools/git-evidence.mjs worktrees --repo .` from the repository
      root and record the exit code, `completeness`, every `cleanliness` value and every
      diagnostic `code`. Quote it in the report.
- [x] Read all five fenced files and confirm each line cited above still says what this
      file claims; report drift rather than working around it.
- [x] Replace the config-only trigger in `safeStatusPrerequisites()` with the resolved
      per-path `filter` attribute rule, treating `unspecified` and `unset` as safe and a
      set value or bare `set` as unsafe. Own commit.
- [x] Keep every existing refusal reason intact: submodules, malformed index, failed
      probe, unparseable output — each still returns `unknown`, never "safe".
- [x] Add the failing-on-base test: filter configured, no path resolving to it → real
      cleanliness, `completeness: complete`, exit 0, no `unsafe-filter`. Own commit.
- [x] Confirm the three existing filter tests still pass unchanged
      (`tests/git-contract.test.cjs:186`, `:200-205`, `:292`;
      `tests/check-fence.test.cjs:235`). If one must change, justify it in the report —
      an existing assertion may be pinning the old trigger.
- [x] Add a case proving no filter command is executed under the new rule, in the style
      of the existing marker-file assertions.
- [x] Update the `--help` text at `git-evidence.mjs` to describe the resolved-attribute
      rule and keep its documented exit codes.
- [x] Update the prose in `orchestrate/references/protocol.md` and the mirrored sentence
      in `orchestrate/templates/00-READBEFORE.md` — **identically**. Own commit.
- [x] Verify the mirror: `node --test tests/protocol-contract.test.cjs` passes without
      that file having been edited.
- [x] Run the canary again after the fix from the repository root and record the new exit
      code, `completeness`, `cleanliness` values and diagnostics.
- [x] Run the validation commands from [00-READBEFORE.md](00-READBEFORE.md); all green.
- [x] `git diff --name-status -M chore/backlog-sweep-ledger...HEAD` plus
      `git status --porcelain`; revert anything outside the fence.
- [x] Commit on `fix/resolved-filter-attribute` — `fix: gate status on resolved per-path filter attributes, not configured drivers (batch 03)`.
- [x] polish: ASK 1 — exercise the resolved-filter probe error paths: a configured driver
      plus a corrupted `.git/index` stays `unknown` with a diagnostic, and the
      record-count invariant is pinned against real Git; note the probe ordering.
- [x] polish: ASK 2 — pin the `-z` round trip with a refusal fixture whose tracked,
      stat-dirty path carries a space and non-ASCII.
- [x] polish: ASK 3 — pin the bare `set` classification with a valueless `filter`
      attribute fixture.
- [x] polish: ASK 4 — pin the untracked half of the enumeration with an uncommitted,
      non-ignored path the attribute matches.
- [x] polish: ASK 5 — add a live-canary control so the marker-absence assertions in the
      permissive fixtures are not self-fulfilling.
- [x] polish: ASK 6 — assert `--help` describes the resolved-attribute rule and still
      documents its exit codes.
- [x] polish: ASK 7 — rename the `$GIT_DIR/info/attributes` refusal test so its name
      matches its fixture.

## Acceptance criteria

- A disposable repository with `filter.<name>.clean` (or `.process`) configured and **no
  path resolving to any filter attribute** reports real cleanliness (`clean` or `dirty`),
  `completeness: complete`, CLI exit 0, and no `unsafe-filter` diagnostic — through both
  `worktrees` and `discovery`, in both the imported API and the actual CLI.
- That same test is RED at this batch's base commit. Quote the base-run failure.
- A repository where a path DOES resolve to a set `filter` attribute still reports
  `cleanliness: unknown`, `completeness: partial`, CLI exit 2, an `unsafe-filter`
  diagnostic, and **no filter command executed** — whether the attribute comes from a
  tracked `.gitattributes` or from `$GIT_DIR/info/attributes`, and whether the driver is
  configured locally or globally.
- A path whose attribute is `-filter` (resolving to `unset`) does not trigger a refusal.
- Pointing `GIT_CONFIG` at an empty file still fails to conceal an unsafe repository.
- Submodules, a malformed index, a failed probe and unparseable probe output each still
  yield `unknown` — never a clean verdict.
- No filter command is ever executed: every marker-file assertion in the suite still
  holds, and no test's repository snapshot changes across a probe.
- `orchestrate/tools/check-fence.mjs` is unmodified, and the fence over a candidate
  worktree in a filter-free repository no longer returns `UNKNOWN` for this reason.
- The §Read-only evidence tools sections of `orchestrate/references/protocol.md` and
  `orchestrate/templates/00-READBEFORE.md` remain byte-identical after placeholder
  substitution, with `tests/protocol-contract.test.cjs` unedited.
- `git-evidence.mjs --help` describes the resolved-attribute rule and still documents
  exit 0 / exit 2.
- The full suite is green: 207 pass plus this batch's additions, 0 fail.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

**Step 1 — the canary. Run this FIRST.**
- Do: from the repository root, run
  `node orchestrate/tools/git-evidence.mjs worktrees --repo .` and note the exit code and
  the JSON `completeness`, `evidence.worktrees[].cleanliness` and `diagnostics[].code`.
- Pass: exit **0**, `completeness: complete`, every `cleanliness` is `clean` or `dirty`
  (never `unknown`), and **no** `unsafe-filter` diagnostic anywhere.
- Aside: **on the base build this exits 2 with `completeness: partial`, EVERY worktree
  `unknown`, and one `unsafe-filter` diagnostic per worktree.** Judge the shape, never a
  count: the inventory grew from two worktrees at capture time (2026-09-19, before any
  work began) to five once wave 1 opened, and shrinks again when they are removed. If you
  see the old behaviour, STOP and say so: you are looking at the wrong build and nothing
  below this line can be trusted.
- Tag: Build check.
- Runner: `agent` — pure CLI, read-only.

**Step 2 — the real system config is what makes this meaningful.**
- Do: run `git config --system --name-only --get-regexp "^filter\..*\.(clean|process)$"`
  and then
  `git ls-files -z --cached --others --exclude-standard | git check-attr filter -z --stdin`.
- Pass: the first command lists `filter.lfs.clean` and `filter.lfs.process` (stock Git for
  Windows), and the second returns only `unspecified` or `unset` for every path. Together
  they are the exact situation BL-003 describes — and step 1 now passes anyway.
- Aside: if the first command returns nothing, this machine has no LFS filter configured
  and step 1 proves less than it should; say so rather than recording a pass.
- Runner: `agent` — read-only, reads configuration but changes none.

**Step 3 — a resolving path still refuses.**
- Do: run the published validation recipe and read the results of
  `configured clean and process filters never execute through API or actual CLI status probes`,
  `global clean filters remain unknown and never execute through API or actual CLI`, and
  `configured filters leave the fence UNKNOWN without executing a command or changing bytes`.
- Pass: all three pass. They are the refusal side of the property; step 1 without these is
  a helper that stopped protecting anything.
- Counting: one unit = one named test. Expect three, plus the new no-resolving-path test.
- Runner: `agent` — pure CLI.
