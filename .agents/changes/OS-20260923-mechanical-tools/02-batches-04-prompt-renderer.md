# B04 — Rendered prompts and file-based findings: `prompt.mjs` (feature, —)

**Branch**: `feat/prompt-renderer`
Cut from the integration tip when the wave opens.
**Wave**: 4 · **Weight**: L
**Depends on**: B02, B03
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files**: `orchestrate/tools/prompt.mjs`, `tests/prompt.test.cjs`, `orchestrate/references/subagent-prompts.md`, `orchestrate/references/protocol.md`, `orchestrate/templates/00-READBEFORE.md`, `orchestrate/SKILL.md`, `.claude/agents/reviewer.md`, `.claude/agents/test-hunter.md`, `README.md`, `tests/subagent-type-mapping.test.cjs`, `tests/tool-wiring.test.cjs`, `tests/protocol-contract.test.cjs`, `tests/agent-definitions.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: a guard that SAMPLES its domain (bind the slot registry to the live skeleton blocks in both directions) · a test that pins the defect (re-aim the "paste, don't point" pins, never delete them) · positive-only assertions on prose (pin the new rule AND sweep for surviving paste directives) · a sweep blind to an edit that narrows a rule's scope (the read-only carve-out must be exactly one file) · the apparatus corrupts the work (no literal control bytes; write rendered files as the exact bytes rendered)
**Spec**: [01-plan.md](01-plan.md) §B04 · **Gate**: fence check → reviewer + test-hunter

## Implementation notes

**Source specification** (Features.md #3 and #12, verbatim):

> #3 — **Replaces:** the orchestrator re-typing the eight skeletons, batch files and contract
> excerpts into every spawn call, then relaying findings verbatim. **Build:** `prompt <role>
> --batch <Bnn> [--round k --findings <file>]` fills every slot from the ledger and writes
> the prompt to `<scratchpad>/prompts/`. The spawn prompt becomes about five lines: read
> this file, then echo its nonce on report line 2. Gate agents write their full findings to
> `<scratchpad>/gates/` and return only the verdict line and counts. The orchestrator
> forwards the file path, not the text. **Evidence:** 68 spawns carried 572K characters of
> prompts … 27 findings relays cost about 83K output tokens. A tool that merely prints the
> prompt for the orchestrator to paste leaves most of this cost in place.
>
> #12 — Three prompt rules: read before edit; chain with `&&` and `set -o pipefail`, never
> `;` between a command and its check; run validation in the foreground.

**Scope decided at planning (approved with the plan)**: the renderer covers the PER-BATCH
prompts — implementer, polish pass, fix round 1, reviewer, reviewer round 2, test hunter.
The QA runner, artifact proofer, plan pre-flight, convergence and fix-up skeletons stay
hand-filled and pasted: their slots come from checkpoint evidence and registries that
ledger 4 (checkpoint tools) restructures. #12's three rules go into the implementer and
fix-round prompts.

### 1 — `orchestrate/tools/prompt.mjs`

`node prompt.mjs --ledger <ledger-dir> --role <role> --batch <Bnn> --facts <facts.json>
--out <dir>` (+ `--help`, which lists every role's required facts; optional `--skeletons
<file>` for tests, defaulting to `../references/subagent-prompts.md` relative to the tool —
the same skill copy the contract's pin covers). Roles: `implementer`, `polish`,
`fix-round`, `reviewer`, `reviewer-round2`, `test-hunter`. Conventions as the other tools:
`parseFlags`, one stdout line, exit `0` / `2` (`UNKNOWN <reason>`); there is no FAIL state.

- **Ledger-derived slots** — read through `ledger-parse.mjs` (tables, `skillPin`) and by
  exact `## ` heading for contract sections; never re-parse a table by hand. Planning map
  (verify each against the live skeletons, which are authoritative):
  `[NN]` batch digits · `[CHANGE_ID]` contract `**Change**:` line · `[BATCH_BRANCH]` plan
  Branch cell · `[FENCE FILES]` plan fence cell · `[FULL TEXT OF THE BATCH FILE]` batch file
  bytes · `[APPLICABLE GUARDRAILS…]` the batch file's `**Applicable guardrails**:` line ·
  `[REPO CONVENTIONS BLOCK…]` contract `## Repo conventions (binding)` body ·
  `[HARD PROHIBITIONS BLOCK…]` contract `## Hard prohibitions` body · `[VALIDATION COMMANDS]`
  contract `## Validation commands` body · `[INTEGRATION_BRANCH]`, `[WORKTREE_SETUP]`
  contract `## Git model` bullets · `[LEDGER_DIR]` contract preamble · `[BATCH FILENAME]` ·
  `[TYPE]` batch title · `[SKILL_DIR]` the contract's pin line via `skillPin` (raw; the
  prose quotes it wherever it forms a command).
- **Guardrails are NOT in the contract.** The contract carries only the `{{GUARDRAILS_REF}}`
  pointer (template :15, :646), never the guardrail text, so `[GUARDRAILS SECTION TEXT…]`
  comes from a fact: `guardrails` = `{ "file": "<repo-relative path>", "heading": "<exact
  heading line>" }`, whose section the renderer reads from the worktree up to the next
  heading of the same or higher level — or `"none"`, which renders the skeleton's stated
  default ("none recorded; apply general correctness scrutiny…").
- **Run-time slots** come from `facts.json` only: `repoPath`, `worktreePath`,
  `scratchpadPath`, `findingsFile` (where a gate agent WRITES its report, or the report a
  polish / fix round / round-2 reviewer READS), `previousFindingsFile` (round 2),
  `round1Sha`, `failingOnBase`, `gateAgentsRun` (boolean; selects the reviewer's
  conditional duty), `testingGuidePath`, `guardrails`. An unknown key → UNKNOWN. A slot
  neither source fills → `UNKNOWN UNFILLED <slot>`, and no file is written.
- **Nonce**: 12 lowercase hex from `crypto.randomBytes(6)`, substituted into `[NONCE]`. The
  nonce appears ONLY in the file's body, and last: the rendered block ends with the
  sentence carrying it, so echoing it proves the agent read to the end. It is never part of
  the file name, the stdout line's path, or the pointer message — otherwise an agent could
  echo it without opening the file and the check could not fail.
- **Output**: writes `<out>/<CHANGE_ID>-B<NN>-<role>-<id>.md`, where `<id>` is a SECOND,
  independent random value, holding exactly the rendered block; then prints ONE line:
  `PROMPT <path> NONCE <nonce>` (the orchestrator keeps the nonce to check the report and
  never puts it in the pointer).
- **One pass, skeleton slots only.** Substitute in a single pass over the SKELETON text; the
  unfilled-slot check runs over the skeleton's own slot occurrences, never over inserted
  text. Ledger text legitimately quotes slot tokens — this ledger's own batch files contain
  `[SKILL_DIR]`, `[NONCE]` and `[WORKTREE_PATH]` — and must come through byte-for-byte:
  neither refused nor rewritten. Where a current skeleton slot is irregular (lower-case text
  inside the brackets, `or "…"` defaults, the `[IF NO GATE AGENT RUNS FOR THIS BATCH: …]`
  conditional), normalise it in the prose to a regular slot plus a stated default, rather
  than teaching the renderer one-off shapes.

### 2 — Prose

- **`orchestrate/references/subagent-prompts.md`**
  - Preamble (lines 3-6) and §Spawning rules "Paste, don't point" (line 419): the six
    per-batch prompts are rendered by `node "<skill>/tools/prompt.mjs"` and spawned with ONE
    fixed pointer message (write its exact text here; it names the rendered file, says the
    file's last lines give the exact report line 2, and never contains the nonce). A report
    whose line 2 is not `NONCE <the nonce>` is treated as no report: the agent did not read
    its instructions to the end. The other skeletons — QA runner, artifact proofer,
    pre-flight, convergence, fix-up — are still filled and pasted and carry NO nonce; the
    fix-up's "same fixed shape as the implementer" means without the nonce line — say so,
    so "render, then point" is not read as universal.
  - Every in-scope REPORT shape: line 1 status/verdict, line 2 `NONCE [NONCE]`. The
    implementer's evidence becomes each validation run's `validate.mjs` line and exit code
    (replacing "its last ~10 lines").
  - Reviewer and test hunter: the FULL report goes to `[FINDINGS_FILE]`, whose first line is
    its LOG heading (`### B[NN] R<round> <role> findings`); the final message is line 1
    verdict, line 2 nonce, line 3 counts (`P0=<n> P1=<n> ASK=<n>` / `FINDINGS <n>`), line 4
    the file path. State the carve-out exactly once per skeleton: writing that ONE file,
    outside every worktree, is the only write they make. Keep the pinned read-only sentences
    intact (`tests/subagent-type-mapping.test.cjs:185-192`).
  - **Findings stay durable.** Before forwarding a findings file, the orchestrator appends
    it to the ledger's LOG.md byte-for-byte on the integration worktree — `cat --
    "<findings file>" >> "<ledger>/LOG.md"` from Git Bash, or an equivalent byte copy —
    never re-typed through its own context, and commits it with the PROGRESS update. The
    scratchpad does not survive the session, and the SHA-pinned §Recovery rows (template
    :522/:526, protocol :496/:500) resume a crashed polish from "the ASK list in LOG.md";
    template :654-656 already records findings in LOG.md. Say this where the forwarding
    rule is stated (template, protocol, and §Spawning rules).
  - Polish pass, fix round 1 and reviewer round 2 take their findings by path. Fix round 1
    (lines 88-93) is prose today; give it a fenced block so it renders — check what
    `tests/subagent-type-mapping.test.cjs:95-134` requires of a block (resume blocks carry no
    spawn line).
  - #12: in the implementer and fix-round prompts — read a file before editing it; chain a
    command and its check with `&&` (bash: `set -o pipefail`), never `;`; run validation in
    the foreground through `node "[SKILL_DIR]/tools/validate.mjs" --spec
    [LEDGER_DIR]/validate.json --log [SCRATCHPAD_PATH]/<label>.log`.
- **`.claude/agents/reviewer.md`, `.claude/agents/test-hunter.md`**: each body says "Keep to
  reading files and read-only git." Add the one exception (the findings file the prompt
  names) in the same breath. `tests/agent-definitions.test.cjs` caps their size and pins
  their `tools:` lines — the lines stay exactly as they are. (The user's installed copies
  under `~/.claude/agents/` are updated by the user after this change ships — never by an
  agent.)
- **`orchestrate/templates/00-READBEFORE.md`** and **`orchestrate/references/protocol.md`**:
  §Roles report shapes (template lines 47-59; protocol 35-84) gain the nonce line and the
  findings file; §Session algorithm spawn step (template step 5, ~616-624; protocol
  ~590-595) becomes "render with `prompt.mjs`, spawn the pointer" — and KEEPS its "Every
  prompt must be SELF-CONTAINED" list as the manual procedure for when the renderer is
  unavailable or refuses (B03 made "every tool step has a baked manual procedure" the rule;
  this list is the prompt one); the gate step's "a report without the status line +
  evidence block" gains "or with the wrong nonce"; polish and fix messages forward the
  findings path after the LOG append. Keep the line break
  `tests/protocol-contract.test.cjs:142` pins in step 6a (`/read-only helper.*\n\s+or its
  manual fallback/`) where it is. The pinned `Implementer sub-agents:` paragraph stays
  byte-identical
  (`tests/contract-prompt-authority.test.cjs:32`) — the rendered file IS the spawn prompt
  it describes — and no "read this file / read the contract / read … in full" phrasing may
  appear elsewhere in the template (`tests/contract-prompt-authority.test.cjs:107-120`).
  No line starting `node orchestrate/tools/` in protocol.md (pinned count 7).
- **`orchestrate/SKILL.md`** §Mode: continue: "Build spawn prompts from
  references/subagent-prompts.md" becomes "render the per-batch prompts with
  `tools/prompt.mjs`; the skeletons live in references/subagent-prompts.md".
- **`README.md`**: the "What's in here" tree gains `prompt.mjs` with a one-line description.

### Tests

- `tests/prompt.test.cjs`: build a ledger from the REAL templates (fill the placeholders,
  including the pin line) and render every in-scope role; each rendered file contains the
  batch file text byte-for-byte, the contract sections it claims, and the nonce printed on
  stdout as its LAST occurrence-bearing line; the nonce is absent from the file name, the
  printed path and the pointer text. A batch file that quotes `[NN]` and `[SKILL_DIR]`
  comes through byte-for-byte and is not refused. The `guardrails` fact renders the named
  section; `"none"` renders the default. Missing fact → `UNKNOWN UNFILLED <slot>` with no
  file written; unknown fact key → UNKNOWN; two renders → two nonces. **Registry ↔ prose, both
  directions**: every slot in every in-scope live block is known to the renderer, and every
  slot the renderer knows occurs in some live block — computed from
  `subagent-prompts.md`, never a hand list, armed with a planted-slot control.
- `tests/tool-wiring.test.cjs`: every in-scope REPORT shape carries `NONCE [NONCE]` on line
  2 and no pasted skeleton does (domain = the skeleton blocks); §Spawning rules names
  `prompt.mjs` and the pointer text, which contains no nonce; the LOG append precedes
  forwarding wherever forwarding is stated; the template's step 5 keeps its self-contained
  list as the manual procedure; a sweep with specimens for directives that would reinstate
  pasting for a rendered role or a second write for a gate agent.
- `tests/subagent-type-mapping.test.cjs`: re-aim — never delete — any assertion that
  pinned the old "paste" wording or the old block set, so it pins the new meaning.
- `tests/protocol-contract.test.cjs`: `NON_MARKDOWN` gains `orchestrate/tools/prompt.mjs`;
  length pin 9.

## Checklist

- [x] `orchestrate/tools/prompt.mjs`: six roles, ledger- and fact-derived slots (guardrails from a fact), one-pass substitution, nonce last in the body and nowhere else, independent file id, one-line output, fail closed on any unfilled skeleton slot, `--help` listing each role's facts
- [x] Irregular slots in the in-scope skeletons normalised to regular slots with stated defaults
- [x] `subagent-prompts.md`: render-then-point preamble and spawning rule with the fixed pointer text, nonce on report line 2 for rendered roles only, findings by file for gate agents (LOG heading first) and by path for resumes, fenced fix-round block, #12's three rules
- [x] `.claude/agents/reviewer.md` and `test-hunter.md`: the single findings-file exception
- [x] Template and protocol: Roles report shapes, spawn step with the self-contained list kept as the manual procedure, gate report check, byte-for-byte LOG append before forwarding by path — pinned paragraph and pinned line breaks untouched
- [x] SKILL.md Mode: continue renders prompts with `prompt.mjs`; README tools tree gains `prompt.mjs`
- [x] Tests: `tests/prompt.test.cjs`, `tests/tool-wiring.test.cjs` additions, re-aimed `tests/subagent-type-mapping.test.cjs` pins, `NON_MARKDOWN` length 9

## Acceptance criteria

- For every in-scope role, a ledger built from the real templates renders a prompt with no
  unfilled slot whose text contains the batch file verbatim; with any required fact absent
  nothing is written and the exit code is 2.
- The renderer's slot set equals the in-scope skeleton slot set, computed from the live
  prose; adding a slot to either side alone turns a test red.
- Every in-scope report shape requires `NONCE <nonce>` on line 2, the nonce is readable only
  from the rendered file's body, and the orchestrator's gate treats a wrong or missing nonce
  as no report.
- Ledger text that quotes slot tokens is rendered byte-for-byte.
- Gate agents make exactly one write, the findings file their prompt names; every findings
  file reaches LOG.md byte-for-byte before it is forwarded; no shipped text still tells the
  orchestrator to paste findings or per-batch prompts, and the pasted-prompt list survives
  as the manual procedure.
- The pinned implementer paragraph, the mirrored evidence section and the SHA-pinned tables
  are unchanged; the full suite is green.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

**You need**: issued inputs `I-05` (a ledger built from the integration tip's templates)
and `I-07` (a facts file for it).

9. **Do**: From the integration worktree root run `node orchestrate/tools/prompt.mjs
   --ledger <I-05> --role implementer --batch B01 --facts <I-07> --out <scratch>/c1-prompts`.
   **Pass**: one line `PROMPT <path> NONCE <12 hex>`; exit code 0; the path does not contain
   the nonce; the file contains `I-05`'s B01 batch file text verbatim, its last non-empty
   line carries the nonce, and it contains none of the tokens `[CHANGE_ID]`,
   `[WORKTREE_PATH]`, `[FENCE FILES]`, `[VALIDATION COMMANDS]`.
   **Runner**: agent (CLI).
10. **Do**: Run the same command with `--facts` pointing at `I-07` minus its `worktreePath`
    key (`I-08`).
    **Pass**: one line `UNKNOWN UNFILLED [WORKTREE_PATH]`; exit code 2; no new file in
    `<scratch>/c1-prompts`.
    **Runner**: agent (CLI).
