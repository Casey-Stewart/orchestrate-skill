# B03 — Conductor and agent budget rules (feature, —)

**Branch**: `feat/budget-rules`
Cut from the integration tip when the wave opens.
**Wave**: 2 · **Weight**: S
**Depends on**: B01
**Smoke gate**: machine-verifiable — covered by the final checkpoint (C1)
**Files**: `orchestrate/SKILL.md`, `orchestrate/references/protocol.md`, `orchestrate/references/scaffolding.md`, `orchestrate/references/execution-models.md`, `.claude/agents/qa-runner.md`, `tests/tool-wiring.test.cjs`
The fence: modify NOTHING else; need more? report `NEEDS_FENCE`.
**Applicable guardrails**: a hand-rolled parse more permissive than the real consumer's (the effort: key; reject on doubt); a boundary pinned on one side only (effort values above and below the accepted set); a whitelist that never enumerates its directory (agents directory); positive-only assertions on prose; a sweep built to catch reversals is blind to an edit that NARROWS its scope (UNDO must stay intact)
**Spec**: [01-plan.md](01-plan.md) §B03 · **Gate**: fence check → one combined reviewer+gate pass

## Implementation notes

### The feature, verbatim (Features.md #15)

> ### 15. Conductor and agent budget rules
>
> **Replaces:** conductor polling, and research and gate agents run at the conductor's effort and model by default.
>
> **Build:**
> - **No polling.** The conductor never calls `ReadNotifications`. If the only remaining work waits on a sub-agent, it ends the turn; the task notification resumes it.
> - **Effort and model per role**, set in the agent definitions and the `Agent` call: read-only fact finding (Explore, fence-checker) at medium on the conductor's model or at high on a cheaper model, never low; the pre-flight at high, not max; reviewer and test hunter at the implementer's tier as the contract already says. Lower effort trades diligence, not knowledge: the failure mode is a citation not re-opened or an inventory stopped early, and max does not prevent that either (the operator-ux drafts carried a wrong picker description and a "31 boxes" count that was about 43, both gathered at max). Three conditions make the trade safe: enumeration runs as scripts (#9 `census`), every reported fact is a `path:line` plus symbol that `cites` verifies before the plan uses it, and the pre-flight stays at high as the independent check. Adopt only after a control on the next scaffold: the same research question to both settings, findings compared. One wrong fact that reaches a batch costs a fix round, about 500K sub-agent tokens, which is the size of the saving.
> - **Explore thoroughness** defaults to medium. "Very thorough" only when the interview needs an inventory, and the prompt names what the inventory is for.
> - **Scaffold at high effort.** The 09-23 scaffold ran 160 of its 200 calls at max, with thinking 54% of all output; the interview reached the user in five minutes at high.
> - **Compaction at boundaries, never mid-flight.** At wave close, after the PROGRESS and LOG commit with no agent in flight, a conductor past about 300K context compacts or ends the session; the next boot reconciles from git. After any compaction the boot sequence and the reconcile run before any transition, because a summary is a claim, not truth. A merge, push or third-round authorization that exists only in a summary is re-asked. Auto-compaction stays as the safety valve it is: the 09-15 six-item run compacted once, at 963K down to 61K, after it had already paid about 150M cache reads at an average 500K context; the 9.4K summary kept the user's verbatim words and the conductor's first seven calls re-read git and the ledger, which is the behaviour the rule makes mandatory.
> - Practices, recorded here rather than tooled: unrelated investigations (the 09-23 CI failure, 40 calls and 8.9M cache-read inside the scaffold) go in their own session; a pause over an hour expires the prompt cache, and the first call after the 74-minute pause re-wrote 352K tokens of cache.
>
> **Evidence:**
> - 24 `ReadNotifications` calls in the 09-23 scaffold, every one "No queued notifications", 7.3M cache-read tokens. Zero in the three pre-rewrite scaffolds and zero in the run session.
> - Sub-agents in the 09-23 scaffold: fence-checker 155 tool uses, 13 minutes, 314K tokens; pre-flight 178 tool uses, 22 minutes, 379K; the second Explore trio 10–13 minutes each. The pre-flight's 14 findings were 10 behaviour judgements and 4 grep results.
> - The 09-12 scaffold's five agents used 606K tokens for a comparable scope; the 09-23 scaffold's seven used 1.51M.
> - The run conductor at high effort made 6 hand edits and polled nothing; the scaffold conductor at max made 138 edits and polled 24 times.
>
> **Size:** S. Prompt and definition text plus tests that pin the rule sentences. 1 batch.
>
> **Saves:** per scaffold, about 24 calls and 7M cache-read tokens from polling, and up to a third to a half of sub-agent tokens from effort and thoroughness once the control confirms the error rate holds; wall clock on the pre-flight wait. Not measured on the run phase.

### Decided at planning time

- **User decisions (2026-09-25, interview):** fact-finding agents at "Medium, same model
  (Recommended)", adopted only after the control run ("Run it now (Recommended)").
- **The control's result drops the per-role effort clause** (LOG.md §scaffold, Control run). The
  same census prompt ran on two definitions identical but for `effort:` — medium: 226K tokens,
  51 tool calls, 5.6 min; max: 461K tokens, 84 calls, 14.6 min. Medium found every finding that
  reshaped the plan, but max found at least six material facts medium missed, of which two
  would each have cost a review round (the four-type pin at
  `tests/subagent-type-mapping.test.cjs:174-184`; the `(§Fence changes)` pointer pasted into every
  implementer prompt). By the rule the plan fixed before the run ("ships if the control confirms
  medium, else it is dropped"), B03 ships NO effort or model rule for any role, adds no agent
  definition, and leaves `{{ROLE_TIERS}}` and the tier text untouched. Mechanism facts kept for a
  later attempt: definitions accept `effort: low | medium | high | max | <integer>`; the `Agent`
  call takes no effort parameter; a definition written mid-session was "not found" at first
  and became available a few minutes later.
- **Named exclusion — "the pre-flight at high, not max":** no per-spawn effort exists, and the
  pre-flight spawns as `reviewer`, the definition every batch review also uses, so an `effort:`
  on it would change the batch gate. Not built.
- **No polling.** Add to `protocol.md` (the single copy after B01) and the conductor's rules in
  `SKILL.md`: the conductor never calls `ReadNotifications` to wait for a sub-agent and never
  sleeps; when the only remaining work waits on sub-agents it ends the turn, and the task
  notification resumes it. The sweep `UNDO` at `tests/tool-wiring.test.cjs:465-483` (bans
  "without waiting for … completion/result", "read the log while…", shell `&`/nohup) must stay
  green and unweakened — word the rule so it does not trip it.
- **Explore thoroughness** defaults to medium; "very thorough" only when an inventory is needed
  and the prompt names what it is for. Thoroughness is a word in the Explore prompt, not an
  effort setting. The carriers, enumerated (the domain of acceptance criterion 3):
  `orchestrate/SKILL.md:180` ("plan the batches (explore; …") and
  `orchestrate/references/scaffolding.md:19` ("explore the codebase (sub-agents as needed)").
  The pre-flight spawn (`scaffolding.md:55-57`) is not a fact-finding spawn.
- **Scaffold at high effort**: the scaffolding procedure tells the conductor, when the session is
  at max, to ask the user to set it to high before scaffolding, with the reason in one sentence
  (the 09-23 scaffold spent 54% of its output on thinking at max). It never changes the setting
  itself.
- **Compaction at boundaries** — the rule as written in the verbatim text, in `protocol.md`'s
  session algorithm at wave close, including "a merge, push or third-round authorization that
  exists only in a summary is re-asked".
- The "Practices" bullet of the verbatim text goes into `protocol.md` as guidance, one sentence
  each; it is not tooled.
- **Neither SHA-pinned table changes**: the strong-tier wording inside them
  (`protocol.md:505-506`, `:603`) is not touched.

### Fold-in BL-034 (folded from `BACKLOG.md`, approved 2026-09-25 — its own commit, message carrying the id)

> | BL-034 | low | `.claude/agents/qa-runner.md:11` says it "keeps `Write` and `Edit` on purpose, unlike the reviewer and the test hunter" — half-false since B04 gave that pair a scoped `Write` (they lack only `Edit`); the directive is still right. Reword. | B04 R2 R3 (no fence). |

## Checklist

- [x] No-polling rule in `protocol.md` and `SKILL.md`; `UNDO` sweep still green and unweakened
- [x] Explore thoroughness default (medium) at `SKILL.md:180` and `scaffolding.md:19`
- [x] Scaffold-at-high ask in the scaffolding procedure
- [x] Compaction-at-boundaries rule and the practices in `protocol.md`
- [ ] [BL-034] `qa-runner.md:11` reworded
- [x] Tests pinning each new rule sentence in its carrier, plus a sweep for contradicting directives elsewhere

## Acceptance criteria

1. `protocol.md` and `SKILL.md` state the no-polling rule; no document under `orchestrate/`
   tells the conductor to poll, sleep or call `ReadNotifications` while waiting.
2. The compaction rule sits at wave close and re-asks any authorization that exists only in a
   summary.
3. Both enumerated fact-finding carriers state medium thoroughness as the default and when
   "very thorough" applies.
4. The scaffolding procedure asks for high effort when the session is at max and never
   changes the setting itself.
5. Neither SHA-pinned table changed; no agent definition gained `effort:` or `model:`.
6. [BL-034] `.claude/agents/qa-runner.md` no longer says the reviewer and test hunter lack
   `Write`; its directive to keep `Write` and `Edit` stands.

## Validation

Run the validation commands in [00-READBEFORE.md](00-READBEFORE.md) — all green before
the batch may integrate (🟢). The orchestrator re-runs them on the integration tip after
the merge.

## Smoke (checkpoint)

**You need**: nothing — every step is agent-run from the integration tip.

1. **Do**: `grep -rn "ReadNotifications" orchestrate/`.
   **Pass**: at least one hit, and every hit is the no-polling rule (it names the tool only to
   forbid waiting on it).
   **Runner**: agent (CLI).
2. **Do**: `grep -n "^effort:\|^model:" .claude/agents/*.md`.
   **Pass**: no output, exit 1.
   **Runner**: agent (CLI).
3. **Do**: [BL-034] `grep -n "unlike the reviewer and the test hunter" .claude/agents/qa-runner.md`.
   **Pass**: no output, exit 1.
   **Runner**: agent (CLI).
