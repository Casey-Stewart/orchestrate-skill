# B04 — Prose polish: comment-only classifier, prose ASKs, one strike (feature, —)

**Branch**: `feat/prose-polish`
Cut from the integration tip when the wave opens.
**Wave**: 3 · **Weight**: M
**Depends on**: B01, B02, B03
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files**: `orchestrate/tools/prose-only-diff.mjs`, `tests/prose-only-diff.test.cjs`, `orchestrate/references/protocol.md`, `orchestrate/references/subagent-prompts.md`, `orchestrate/references/execution-models.md`, `orchestrate/SKILL.md`, `.claude/agents/reviewer.md`, `.claude/agents/implementer.md`, `README.md`, `tests/protocol-contract.test.cjs`, `tests/tool-wiring.test.cjs`, `tests/subagent-type-mapping.test.cjs`, `tests/prompt.test.cjs`, `orchestrate/templates/02-batch.md`, `tests/check-fence.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: a corpus whose every entry sits inside the pattern's own bound (write it as prose first; each rule owns a case); a boundary pinned on one side only; a branch no input reaches (every fail-closed path has a fixture); a hand-rolled parse more permissive than the real consumer's (prefer rejecting on doubt); run a live control through your own harness before trusting any green or any zero; a sweep built to catch reversals is blind to an edit that NARROWS its scope (REINSTATE, WRITE_LICENCES); positive-only assertions on prose
**Spec**: [01-plan.md](01-plan.md) §B04 · **Gate**: fence check → reviewer + test-hunter

## Implementation notes

### The feature, verbatim (Features.md #8 — only the "Prose polish" half is in scope)

> ### 8. Production/test path partition and polish classifier
>
> **Replaces:** the orchestrator deciding by eye whether a polish diff touched production code.
>
> **Build:**
> - New placeholders and an interview question declare which paths are production and which are test, doc or prose.
> - `record-round` and `integrate` classify the polish diff: test/doc only integrates; any production path triggers the scoped re-review.
> - **Prose polish** (added 2026-09-23). The path rule alone still sends every comment fix to a scoped re-review, because comments live in production files. Four additions:
>   - `prose-only-diff.mjs`: strips comments from both sides of each changed production file and compares the remainder. Identical everywhere → prose-only, no scoped re-review. Fails closed: any doubt inside a string, regex or template literal, and any comment carrying a tool directive (`eslint`, `istanbul`, `c8`, `@ts-`, `prettier`) or a JSDoc tag, counts as code. JavaScript first; other languages keep the path rule.
>   - A prose ASK carries the replacement text. The reviewer verified the fact when it flagged the claim; the orchestrator applies the wording with one edit. No implementer resume.
>   - One strike: a polish-phase `FIX FIRST` discards the polish at once; the ASK goes to the backlog with the wording attached. The reviewed `SHIP` tree integrates either way.
>   - Implementer rule: a comment states what the code beneath it does and why, and points at a neighbour by path and symbol; it never describes how the neighbour behaves.
>   - `FIX FIRST` stays for prose that is a contract: channel payload docs, exported API comments, ARCHITECTURE rows, USER-GUIDE claims.
>
> **Evidence:**
> - At least seven hand classifications (`20/LOG.md:426-429`, `:720-723`, `:762`, `:1205`; `20/PROGRESS.md:49`; `21/PROGRESS.md:49`).
> - No such partition exists in the placeholder registry, so on a mixed tree the scoped re-review can be silently skipped.
> - `SA-20260922-high-priority-pack` (shipping-app): all five batches took `SHIP` at review round 1, then five polish-phase `FIX FIRST` verdicts followed, four on comments describing neighbouring code and one on retracted claims left in test text. B05 ran polish → review → fix → review → fix → review for one comment; B01 did the same and discarded the result. About ten agent runs plus the orchestrator calls around them, roughly one batch's cost.
>
> **Size:** M. About 50 tool lines plus 100 test lines for the partition, plus about 120 tool lines and 200 test lines for the stripper and three skeleton/protocol edits. The registry is pinned by tests in both directions; the discard rule sits beside the SHA-pinned decision tables, so that edit re-pins deliberately. 2 batches.
>
> **Saves:** part of the shared re-verification row, plus about 2M sub-agent and 15–20M input-side tokens per five-batch pack with prose findings (not measured in the three-run baseline). Its main value is correctness.

**Out of scope here**: the first two Build bullets (the production/test path partition, its
placeholders and interview question, and `record-round` / `integrate` classifying the polish
diff) — they need #1's commands and ship with #1. This batch ships the classifier as a
standalone tool the conductor runs, and the rules around it.

### BL-044, verbatim (BACKLOG.md)

> | BL-044 | medium | Skill: `protocol.md` / the reviewer skeleton do not say that severity is about behaviour, never the fence — a criterion violation whose fix sits outside the batch's files was downgraded to an ASK (and a consequential residual recorded as a display nit), costing a failed checkpoint. State it where findings are classed, beside the `NEEDS_FENCE` route. | C1 issue 1 (the user's question and fail verdict). |

### Decided at planning time

- **The tool.** `orchestrate/tools/prose-only-diff.mjs --repo <repo> --base <ref> --head <ref>`
  classifies the diff between two commits. For each changed path: a path that is not a
  JavaScript source (`.js`, `.cjs`, `.mjs`) is reported by path and left to the existing rule
  (test/doc/prose paths); for a JavaScript file, strip comments from both sides and compare the
  remainder byte-for-byte. Prints ONE line — `PROSE-ONLY <n> file(s)` (exit 0), `CODE <path>`
  (exit 1, the first file whose remainder differs), or `UNKNOWN <reason>` (exit 2). Precedence
  UNKNOWN > CODE > PROSE-ONLY. Non-JavaScript paths never make the verdict PROSE-ONLY on their
  own and are counted on the same line: `PROSE-ONLY <n> file(s); <m> other path(s) left to the
  path rule` (`<m>` omitted when 0). Declare no module-level name that `ledger-parse.mjs`
  exports (`table`, `records`, `linesOf`, …): `tests/check-ledger.test.cjs:755-780` sweeps every
  tools file and sits outside this fence. Fails closed:
  any doubt inside a string, regex or template literal, any comment carrying a tool directive
  (`eslint`, `istanbul`, `c8`, `@ts-`, `prettier`) or a JSDoc tag, an added/deleted/renamed file,
  a binary, or a parse it cannot finish, is `CODE` or `UNKNOWN`, never `PROSE-ONLY`. No
  third-party parser (repo rule): a hand-written tokenizer that tracks strings, template
  literals (with `${}` nesting), regex literals and both comment forms, and prefers rejecting on
  doubt. Uses B02's fixed CLI entry guard; B02's `tests/cli-entry.test.cjs` enumerates the tools
  directory, so it covers this tool with no edit there. Read-only (build rule 2); runs git via
  `git-evidence.mjs`'s scrubbed `git()`.
- **Test corpus** (`tests/prose-only-diff.test.cjs`): write the corpus as prose first, pin its
  size and set, and require each rejection rule to own a case no other rule catches (the
  guardrail on corpora derived from the pattern): comment-only edits of both forms → PROSE-ONLY;
  a `//` inside a string, a `/*` inside a template literal, a regex containing `//`, a directive
  comment, a JSDoc tag edit, whitespace-only code changes, a one-character code change → CODE;
  a file add/delete/rename → CODE or UNKNOWN. Include a live control (a real code change reads
  CODE) and run the CLI as published.
- **Protocol rules** in `protocol.md` (single copy after B01), the polish block and reviewer
  classes in `subagent-prompts.md`, and `execution-models.md:115-117`:
  - after a polish diff, the conductor runs the classifier; `PROSE-ONLY` means no scoped
    re-review for those files (today's eyeballed decision); anything else keeps today's rule;
  - a prose ASK carries the replacement text; the conductor applies it with one edit on the
    batch branch, no implementer resume;
  - one strike: a polish-phase `FIX FIRST` discards the polish at once (today: the SECOND,
    `protocol.md:104-123`, template text now in protocol.md); the ASK goes to the backlog with
    its wording attached; the reviewed `SHIP` tree integrates either way;
  - `FIX FIRST` stays for prose that is a contract (channel payload docs, exported API
    comments, ARCHITECTURE rows, USER-GUIDE claims);
  - the implementer rule on comments, in the implementer skeleton's RULES paragraph
    (`subagent-prompts.md:64-69`) and `.claude/agents/implementer.md`;
  - [BL-044] severity is about behaviour, never the fence: in `protocol.md` §Severity and the
    reviewer's finding classes (`subagent-prompts.md:161-178`, `.claude/agents/reviewer.md`),
    beside the `NEEDS_FENCE` route.
- **Neither SHA-pinned table changes, and its rows stay true.** The recovery rows key on
  "`polish:` item ticked (at least one appended)" (`protocol.md:511-512`) and send "a production
  file → fix-diff-only re-review" (`:512`). So: (a) the conductor's one edit that applies a prose
  ASK also appends and ticks a `polish:` item on the batch file, in the shown form, in the same
  commit — `templates/02-batch.md:25-26` ("appended only when the orchestrator sends a polish
  pass") is reworded to name this second writer, and `tests/check-fence.test.cjs:141-232` keeps
  the shown form parsing; (b) after a crash, recovery keeps the path rule (a production file →
  fix-diff-only re-review) even for a diff the classifier would have called prose-only — a
  deliberately conservative fallback, stated in `protocol.md` beside the classifier rule. The
  `polish discarded: @<sha>` row keeps its meaning under one strike. If the rules cannot be
  stated without editing a pinned table, stop and report `NEEDS_FENCE` naming the row —
  re-pinning needs the user's words.
- **Sweeps that new prose can trip** (census): `tests/tool-wiring.test.cjs:812-845` `REINSTATE`
  (`(findings|ASK list|ASKs)…{0,30}verbatim`) and `:891-996` `WRITE_LICENCES` (write/record/keep
  verbs in the reviewer and hunter blocks). Word the rules so they stay green; if a needed
  sentence genuinely trips one, add the narrowest exemption and assert the sweep's family is a
  superset of the old one. `tests/subagent-type-mapping.test.cjs:124` pins the polish opener;
  `tests/prompt.test.cjs:33,217` pins polish facts `['findingsFile']` and `SLOTS` length 28 —
  change them only if a slot is genuinely added.
- **Registrations**: `tests/protocol-contract.test.cjs:388-395` `NON_MARKDOWN` (size pinned at 11)
  gains the new tool; `README.md`'s tools tree (`:211-221`, pinned at
  `tests/tool-wiring.test.cjs:303-306`) lists it.

### Fold-in BL-042 (folded from `BACKLOG.md`, approved 2026-09-25 — its own commit, message carrying the id)

> | BL-042 | low | `tests/tool-wiring.test.cjs:1290` points at `tests/validate.test.cjs:611-623` for the Git-bash/PATH block, which moved (now ~:764-778) when the file grew; name the test instead of a line range. | B01 second C1 fix-up reviewer. |

## Checklist

- [x] `orchestrate/tools/prose-only-diff.mjs` (read-only, one line, fails closed)
- [x] `tests/prose-only-diff.test.cjs`: prose-first corpus with owned cases, live control, CLI as published
- [x] Polish rules in `protocol.md`, `subagent-prompts.md`, `execution-models.md` (classifier, prose ASK text, one strike, contract prose)
- [x] Implementer comment rule in the skeleton and `.claude/agents/implementer.md`
- [x] [BL-044] severity-is-behaviour in `protocol.md` §Severity, the reviewer classes and `.claude/agents/reviewer.md`
- [x] Crash-safe prose ASK: the conductor's edit appends and ticks a `polish:` item; `02-batch.md` names the second writer; the conservative crash fallback stated
- [x] Registrations: `NON_MARKDOWN`, README tools tree
- [ ] [BL-042] the test pointer names the test instead of a line range

## Acceptance criteria

1. The classifier prints `PROSE-ONLY` only when every changed JavaScript file's comment-stripped
   remainder is byte-identical on both sides; every corpus rejection case reads `CODE` or
   `UNKNOWN`, and each rejection rule owns at least one case no other rule catches.
2. A tool-directive or JSDoc comment edit is never `PROSE-ONLY`.
3. `protocol.md` states one strike, the prose ASK carrying its replacement text, and the
   contract-prose exception; no document still says the SECOND polish-phase FIX FIRST discards.
4. Severity-is-behaviour is stated in `protocol.md` §Severity and the reviewer's classes, and no
   passage lets a fence location lower a finding's severity.
5. Neither SHA-pinned table changed; the `REINSTATE` and `WRITE_LICENCES` sweeps' families are
   supersets of the base's.
6. [BL-042] The pointer in `tests/tool-wiring.test.cjs` names the `tests/validate.test.cjs` test
   by title, not by a line range.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

**You need**: the issued fixture bundle `I-01` (three commits `c0` → `c1` a comment-only change →
`c2` a one-character code change in the same file), cloned with
`git clone <I-01 bundle> ../c1-scratch/i01`. Reset: `rm -rf ../c1-scratch/i01`.

1. **Do**: `node orchestrate/tools/prose-only-diff.mjs --repo ../c1-scratch/i01 --base <c0> --head <c1>`.
   **Pass**: `PROSE-ONLY 1 file(s)`, exit 0.
   **Runner**: agent (CLI).
2. **Do**: the same with `--base <c1> --head <c2>` (SHAs from the step's issued input record).
   **Pass**: `CODE <the file>`, exit 1.
   **Runner**: agent (CLI).
3. **Do**: [BL-042] `grep -n "validate.test.cjs:[0-9]" tests/tool-wiring.test.cjs`.
   **Pass**: no output, exit 1.
   **Runner**: agent (CLI).
