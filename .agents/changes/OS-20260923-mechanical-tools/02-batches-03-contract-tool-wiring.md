# B03 — Wire the skill pin, validation wrapper and parse check into the contract (feature, —)

**Branch**: `feat/contract-tool-wiring`
Cut from the integration tip when the wave opens.
**Wave**: 3 · **Weight**: L
**Depends on**: B01, B02
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files**: `orchestrate/templates/00-READBEFORE.md`, `orchestrate/references/scaffolding.md`, `orchestrate/references/protocol.md`, `orchestrate/SKILL.md`, `README.md`, `tests/tool-wiring.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: skill source written from inside this repo, read from outside it (no repo-relative tool path in shipped prose) · verified means verified as published (the template's pin line must be parsed by the real tool) · positive-only assertions on prose (pin the passage AND sweep for contradicting directives) · vacuous-until-later documentation (re-check claims B04/B05 will make load-bearing) · a sweep blind to an edit that narrows a rule's scope · a boundary pinned on one side only
**Spec**: [01-plan.md](01-plan.md) §B03 · **Gate**: fence check → reviewer + test-hunter

## Implementation notes

**Source specification** (Features.md, verbatim):

> Build rule 4 — **Pin tools by hash in the contract, never by copying them into each
> ledger.** On a hash mismatch: stop and ask, then either record an explicit upgrade or use
> the manual procedure. Tool copies inside a target repo get swept up by that repo's
> linters, test runners and bundlers.
>
> #5 — Generated at scaffold time from the interview's validation commands. Runs in the
> foreground and writes the full log to a file. Prints exactly one line … Returns the real
> exit code.
>
> #2 — The scaffold runs the fence tool's parsers over the freshly written ledger.

**User decisions (2026-09-23)**: tools are found through ONE contract placeholder for the
skill's directory plus a SHA-256 pin (interview); the SKILL.md discovery command must
resolve outside this repository (proposed at planning, approved with the plan).

This batch is PROSE: it makes the three tools B01/B02 built part of how every NEW ledger
runs. It builds on two exact interfaces — do not change them, cite them:

- `node <skill>/tools/validate.mjs --spec <file.json> --log <file> [--cwd <dir>] [--timeout
  <s>]` → ONE line `PASS …` / `FAIL … — log: <path>` / `UNKNOWN …`, exit 0/1/2; the spec
  format is in `validate.mjs --help`.
- `node <skill>/tools/check-ledger.mjs parse --dir <ledger-dir>` → `PARSE OK <n> batches`;
  `node <skill>/tools/check-ledger.mjs skill --contract <file>` → `SKILL MATCH <hex>` /
  `SKILL MISMATCH …`, reading the one contract line
  `` **Skill**: `<dir>` · sha256 `<64 hex>` `` (space, U+00B7, space).

### Changes

**`{{SKILL_DIR}}` is a RAW path** — absolute, forward slashes, never quoted, stored as-is
between the pin line's backticks (that is what `skillPin` returns). Every COMMAND that uses
it quotes it: `node "{{SKILL_DIR}}/tools/<tool>.mjs" …`, because an install path may
contain spaces (this repository's own clone does). A quoted value would put the quotes into
the pinned directory and every boot would end UNKNOWN.

1. **`orchestrate/templates/00-READBEFORE.md`**
   - Preamble: directly under `**Change**: {{CHANGE_ID}}` (line 3) add the pin line
     `` **Skill**: `{{SKILL_DIR}}` · sha256 `{{SKILL_SHA256}}` `` — exactly the form
     `check-ledger.mjs` parses, on one line.
   - §Boot sequence (lines 10-31): a step BEFORE Reconcile — verify the pin with
     `node "{{SKILL_DIR}}/tools/check-ledger.mjs" skill --contract {{LEDGER_DIR}}/00-READBEFORE.md`
     from the integration worktree root. `SKILL MATCH` → continue. `SKILL MISMATCH` or
     `UNKNOWN` → STOP and ask; continue only on the user's explicit words, recorded
     verbatim in the session log — an upgrade (the pin line rewritten to the new hash in
     the same commit) or the contract's manual procedures. Renumber the steps.
   - §Validation commands (lines 246-254): keep `{{VALIDATION_COMMANDS}}` as the
     human-readable recipe — it is also the manual procedure when the wrapper is
     unavailable — and add that every run goes through this command, in the FOREGROUND,
     from the worktree root:
     `node "{{SKILL_DIR}}/tools/validate.mjs" --spec {{LEDGER_DIR}}/validate.json --log <session scratchpad>/<label>.log`.
     Its one line is the result, its exit code is the real one, the log is read only when the line
     is not PASS; never pipe, tail or background it. `validate.json` is the machine form of
     the recipe, written at scaffold time. Reword the existing "Orchestrator runs use the
     QUIET form above" sentence rather than adding a second rule beside it.
   - Leave `### Read-only evidence tools` (lines 84-171), `{{EVIDENCE_TOOL}}` and
     `{{FENCE_TOOL}}` byte-for-byte untouched — that section is mirrored into `protocol.md`
     and compared byte-for-byte by `tests/protocol-contract.test.cjs:117-120`; moving those
     two placeholders under the skill directory is ledger 2's work.
   - Do NOT edit the pinned `Implementer sub-agents:` paragraph (lines 33-40; pinned verbatim
     by `tests/contract-prompt-authority.test.cjs:32`), and write no phrase like "read this
     file", "read the contract" or "read … in full" anywhere else in the template —
     `tests/contract-prompt-authority.test.cjs:107-120` rejects them outside that paragraph.
2. **`orchestrate/references/scaffolding.md`**
   - Placeholder registry (lines 137-184): rows for `{{SKILL_DIR}}` (the absolute path of the
     directory holding the skill's `SKILL.md` — the base directory the skill loader reports;
     forward slashes; RAW, never quoted — commands quote it) and `{{SKILL_SHA256}}` (the hex
     field of `node "<SKILL_DIR>/tools/check-ledger.mjs" skill --dir <SKILL_DIR>` run at fill
     time). `tests/protocol-contract.test.cjs:80` checks template ↔ registry in both
     directions.
   - §Evidence and input baking (lines 101-116): bake both values; the tools THIS change adds
     (`validate.mjs`, `check-ledger.mjs`, and the two that follow in B04/B05) run as
     `node "{{SKILL_DIR}}/tools/<tool>.mjs"`. `{{EVIDENCE_TOOL}}` and `{{FENCE_TOOL}}` keep their
     own baking rule (lines 104-105) until ledger 2 — say so, rather than contradicting it.
   - Procedure step 8 (Fill): also write `validate.json` into the ledger directory — one step
     per confirmed validation command; a multi-line recipe block becomes ONE `shell` step
     whose `script` is the block's text; `parser` names the runner the command invokes
     (`node`, `jest`, `pytest`, `cargo`, else `none`). Run it once at the base and record its
     line in LOG.md as the ledger's validation baseline. When the validation commands are
     `none`, write no `validate.json` (an empty `steps` array is invalid) and say so. When
     `{{WORKTREE_SETUP}}` is not `n/a`, also write `setup.json` — a `validate.mjs` spec
     holding the setup command(s), which B05's harness passes as `--setup` so a disposable
     checkout is set up exactly like a worktree.
   - Procedure step 9 (Self-check): add that
     `node "<SKILL_DIR>/tools/check-ledger.mjs" parse --dir <the new ledger directory>` must
     print `PARSE OK`, and that `node "<SKILL_DIR>/tools/check-ledger.mjs" skill --contract
     <the new ledger directory>/00-READBEFORE.md` must print `SKILL MATCH` — the pin line's
     placeholders sit inside code spans, which the self-check grep exempts, so without this
     an unfilled pin would pass. The self-check paragraph's bounds and its "grep … then zero
     hits" order are pinned by `tests/protocol-contract.test.cjs:406-446` — add the sentences
     where those assertions stay green, and state them once.
   - §Baking rule (lines 299-305): see the closed-system rewrite below.
3. **`orchestrate/references/protocol.md`** — the canonical counterparts: §Session algorithm
   step 1 (line 522) gains the pin check before reconcile and names the wrapper for
   resume-time validation; wherever protocol.md defines HOW validation runs, name the
   wrapper once and let the other mentions ("tip validation", lines 236, 242, 613, 634)
   inherit it. Do not add any line starting `node orchestrate/tools/` —
   `tests/protocol-contract.test.cjs:268-269` pins exactly 7 such recipe lines — and do not
   touch §Read-only evidence tools or the two SHA-256-pinned tables (§Recovery, capped
   verdicts; `tests/protocol-contract.test.cjs:64-74`).
4. **`orchestrate/SKILL.md`**
   - §Discovery (line 35): the command becomes `node "<skill-dir>/tools/git-evidence.mjs"
     discovery --repo <repo>`, with `<skill-dir>` defined as the directory holding this
     `SKILL.md` (the base directory the skill loader reports). Today it reads
     `node orchestrate/tools/…`, which resolves only inside this repository. The same
     paragraph carries the line break `tests/protocol-contract.test.cjs:139` pins
     (`/Existing\nledgers keep their frozen contract/`) — keep "Existing" ending its line.
   - §Mode: new: the fill bakes the pin and writes `validate.json` (and `setup.json` when
     there is a setup step); the self-check includes the parse and pin checks. §Mode:
     continue step 3: the boot verifies the pin first.
5. **`README.md`**: the "What's in here" tree (lines 188-206) gains `validate.mjs`,
   `ledger-parse.mjs` and `check-ledger.mjs` with one-line descriptions (B04 and B05 add
   theirs); the install notes gain one sentence — update an installed copy only between
   ledgers, because a ledger's contract pins the skill's hash and an updated copy stops that
   ledger's next session and asks. Leave the validation recipe and the agent-install text
   alone (`tests/protocol-contract.test.cjs:297` and `tests/agent-definitions.test.cjs:611`
   read them).

**The closed-system claims become false as written — rewrite all five, once each.** A
ledger now names its pinned skill directory, which five passages forbid: `README.md:80-83`
("A ledger never references this skill, so it stays drivable without it"), `README.md:101-103`
(the rollout boundary), `orchestrate/SKILL.md:13-15`, `orchestrate/references/protocol.md:28-32`
("never generate a ledger that references this skill") and `orchestrate/references/scaffolding.md:299-305`
(§Baking rule). The new rule, stated in each: a ledger references ONLY its pinned skill
directory, by absolute path and hash; every step a tool performs also has a baked manual
procedure (the recipe block for validation, the pasted-prompt list for spawning, the
fence's manual fallback), so a session without the skill — or with a changed one — can
still drive the ledger; a changed skill stops the ledger at its next boot and asks, and
never silently changes how it runs. No test pins the old wording today; `tests/tool-wiring.test.cjs`
pins the new one in all five places and sweeps for the old ("never references this
skill", "never generate a ledger that references this skill").
6. **`tests/tool-wiring.test.cjs`** (new) — pins, each armed with a live control:
   - the template's pin line, filled with a REAL directory — one whose path contains a
     space — and the hash the REAL `check-ledger.mjs skill --dir` prints for it, yields
     `SKILL MATCH` from the REAL `check-ledger.mjs skill --contract`; one altered hex digit
     yields MISMATCH; every command in the template that uses `{{SKILL_DIR}}` quotes it;
   - the five closed-system passages state the new rule, and none still says a ledger never
     references the skill;
   - the boot sequence invokes the pin check BEFORE reconcile, and the validation section
     names `validate.mjs` with `--spec` and `--log`;
   - no shipped Markdown file under `orchestrate/` tells a reader to run
     `node orchestrate/tools/…` outside the mirrored evidence section — sweep the shipped
     listing (the domain), not a hand list, with a planted control that must be caught;
   - scaffolding's self-check names the parse check, and a ledger filled from the real
     templates plus a generated `validate.json` passes `check-ledger.mjs parse`;
   - a sweep for directives that would undo the rules (e.g. "pipe the validation output",
     "run validation in the background", "skip the pin check"), each pattern paired with a
     specimen it must match.

### Other pins that constrain the prose (the full suite shows them)

`tests/protocol-contract.test.cjs` sweeps the shipped files for the scaffold self-check
paragraph (:406-446), the verbatim Runner rule count (:484-516) and the checkpoint
close-out carriers (:868-900 — a file that states the close-out sequence must also invoke
the post-render proofing pass); `tests/interview-sizing.test.cjs` sweeps all of
`orchestrate/**` for interview contradictions. Restating a rule elsewhere changes those
counts — reference, don't restate.

## Checklist

- [ ] Template: pin line under `**Change**`, boot step verifying it before reconcile, validation section routed through `validate.mjs` with the recipe kept as the manual procedure; every `{{SKILL_DIR}}` command quoted
- [ ] Scaffolding: registry rows for `{{SKILL_DIR}}` (raw) and `{{SKILL_SHA256}}`, baking rule scoped to the new tools, `validate.json` (none for a `none` recipe) and `setup.json` written at fill with a recorded baseline, parse and pin checks in the self-check
- [ ] Protocol: canonical pin check and wrapper, no new `node orchestrate/tools/` line, mirror and pinned tables untouched
- [ ] SKILL.md: discovery command resolves from the skill's own directory; Mode new/continue mention the pin, `validate.json`, `setup.json` and the checks
- [ ] README.md: tools tree and the install-update sentence
- [ ] The five closed-system passages rewritten to the pinned-skill rule
- [ ] `tests/tool-wiring.test.cjs` with the pins and live controls listed above

## Acceptance criteria

- A contract filled from the template carries a pin line that the real `check-ledger.mjs
  skill --contract` reads as MATCH for the directory it names, and as MISMATCH after any
  change to that directory.
- No shipped document outside the mirrored evidence section instructs
  `node orchestrate/tools/…`; `SKILL.md`'s discovery command resolves from any repository.
- The boot sequence verifies the pin before reconcile, and a mismatch STOPS for the user's
  words — nothing continues silently.
- A pin directory containing a space round-trips: filled, parsed and used in a command.
- No shipped passage still claims a ledger never references the skill; each of the five
  states that a ledger references only its pinned skill and stays drivable without it
  through baked manual procedures.
- A scaffold whose pin line was left unfilled fails the self-check.
- Every validation run the template describes goes through `validate.mjs` in the
  foreground; no remaining sentence allows piping, tailing or backgrounding it.
- `### Read-only evidence tools`, the two SHA-256-pinned tables and the pinned implementer
  paragraph are byte-identical to the base; the full suite is green.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

**You need**: issued inputs `I-05` and `I-06`.

6. **Do**: From the integration worktree root run `node orchestrate/tools/check-ledger.mjs
   skill --contract <I-05>/00-READBEFORE.md`.
   **Pass**: one line, `SKILL MATCH <hash>`; exit code 0.
   **Runner**: agent (CLI).
7. **Do**: Run the same command against `<I-06>/00-READBEFORE.md`.
   **Pass**: one line, `SKILL MISMATCH pinned <hash> actual <hash>` with two different
   hashes; exit code 1.
   **Runner**: agent (CLI).
8. **Do**: Run `node orchestrate/tools/check-ledger.mjs parse --dir <I-05>`.
   **Pass**: one line beginning `PARSE OK`; exit code 0.
   **Runner**: agent (CLI).
