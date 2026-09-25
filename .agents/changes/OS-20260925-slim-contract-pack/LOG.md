# Log — OS-20260925-slim-contract-pack

Append-only narrative for this change: reviewer arcs, root causes, reconciliations,
fence-extension reasoning, pre-smoke findings, in-run learnings. Written ONLY by the
orchestrator, ONLY on the integration branch, in the same commits as PROGRESS. Never read
at boot — a PROGRESS Notes cell or session-log row names the heading to read. One `##`
heading per session (date), one `###` per batch or event. Never edit an earlier entry.

## Learnings

- An agent definition written mid-session is "not found" at first and becomes spawnable a few
  minutes later, when the harness refreshes its agent list — not only at session start, as the
  conductor first assumed.
- One census prompt at two efforts is a cheap, informative control, but a single run per level is
  noisy, and max is not ground truth either: the pre-flight found a pin (`tests/git-contract.test.cjs:173`)
  that neither census listed for the batch that breaks it.

## 2026-09-25 — scaffold

### Environment and baseline

Linux workstation; Node v24.20.0; `pwsh` 7.6.5 at `/snap/bin/pwsh`. Base `edd2f1e` (main, clean
but for the untracked `Features.md`). Pinned skill directory `/home/timetotilt/.claude/skills/orchestrate`,
a real `git archive main orchestrate` copy made this session (it was a symlink until today; BL-028),
`SKILL 354f4dd29eedeb1ba2a2499e508c12b043f5014de08e7d8ee65ead3302b5d67f 23 files`, identical to the
clone's `orchestrate/`. Validation baseline through that copy's wrapper and `validate.json`:
`PASS tests 510/512, 2 skipped (23s)` — the two Windows-only cases. Worktree root
`/home/timetotilt/worktrees/os925/` (`/tmp` is tmpfs).

### Planning census

One Explore agent ran the fence census for the four batches (373K tokens, 61 tool calls,
7.2 min, session effort). The findings that reshaped the plan: `prompt.mjs:185-198` parses the
contract's `## Git model` and three other headings, so #14 keeps those fact lines and B01 never
needs B02's `prompt.mjs`; the Git model holds repo facts, not only procedure; the capped-verdict
table sits inside the session algorithm, but the SHA pin reads only `protocol.md`; the template
is the close-out carrier's only copy of "combined smoke script"; about ten test files read the
template, so B01 is L, not the S Features.md estimated.

### Control run (#15)

The user chose "Medium, same model" and "Run it now". Two temporary user-level definitions,
`census-control-medium` and `census-control-max`, identical but for `effort:`, received the same
census prompt (`tools: Read, Glob, Grep, Bash`). Results:

| setting | tokens | tool calls | time |
|---|---|---|---|
| medium | 225,719 | 51 | 5.6 min |
| max | 460,715 | 84 | 14.6 min |

Medium found every plan-shaping finding above, plus one the planning census missed
(`tests/tool-wiring.test.cjs:482` `UNDO` 'a pointer into the skill', which #14's natural wording
trips). Max found at least six material facts medium missed: the four-type pin at
`tests/subagent-type-mapping.test.cjs:174-184` (a new definition reddens it); `T:313`'s
"(§Fence changes)" pointer, which `prompt.mjs:197` pastes into every implementer prompt;
`tests/contract-prompt-authority.test.cjs:107-120` banning "read the file …"; the
`{{EXECUTION_MODEL}}` Where cell pinned at `tests/interview-sizing.test.cjs:277`; BL-037's second
production caller (`mutate.mjs:260`); `mutate.mjs:69-73,125-126` reaching the unscrubbed `git()`.
Two of those would each have cost a review round. Under the rule fixed before the run ("ships if
the control confirms medium, else it is dropped") the per-role effort clause was dropped; the
user confirmed at plan approval ("Drop it (Recommended)"). The two definitions were deleted after
the run; `~/.claude/agents/` holds only the four shipped definitions again. Every census finding
was folded into the batch files.

### Pre-flight

Reviewer (fresh, read-only): `PRE-FLIGHT 5 BLOCKING, 9 ADVISORY`. All fixed before approval:

1. `tests/git-contract.test.cjs:173` pins git-evidence's env behaviour that B02 changes, and the file
   was in B01's fence → moved to B02; BL-036's scope set to repository-location variables only
   (config injection stays surfaced, `:173` green unchanged); the CLI test lives there.
2. B01 deleted the manual procedures its own pin-mismatch fallback names → B01 note 7a: the
   mismatch branch is upgrade-on-words or restore-from-`**Skill source**` (new `{{SKILL_SOURCE}}`).
3. #15's "pre-flight at high" was neither built nor excluded → named exclusion (no per-spawn
   effort; the pre-flight spawns as `reviewer`).
4. B04's rules collided with the SHA-pinned recovery rows → the conductor's prose edit appends and
   ticks a `polish:` item; crash recovery keeps the path rule as a conservative fallback;
   `02-batch.md` and `tests/check-fence.test.cjs` joined B04's fence.
5. B02's size assertion vs B04's ninth tool → equality with the guarded set, lower bound 8.

Advisories applied: the entry helper lives in `git-evidence.mjs` and adds no check-fence
diagnostic code; `runSpec` gains an optional `env`; Windows file-link `EPERM` asserted, never
skipped; `tests/tool-wiring.test.cjs:439` named; every `prompt.mjs` parse anchor listed; the
classifier's mixed-diff line and the ledger-parse name sweep; B03's carriers enumerated; smoke
inputs made consistent (I-01 three commits, clone paths, resets, I-03 added); fold-in rows and
the exclusions added to the coverage audit.

### Backlog sweep

Accepted (plan approval): BL-041 → B02, BL-034 → B03, BL-042 → B04. Considered and rejected:
BL-030 (`pytest -q` needs `scaffolding.md`'s sentence changed, outside B02's fence); BL-045 and
BL-043 (their files are in B01, which is L); BL-029, BL-032, BL-033, BL-039, BL-040 (design or
behaviour changes, not one-line criteria); BL-031 (needs the user's decision); BL-038 (belongs to
the change that adds a parser).
