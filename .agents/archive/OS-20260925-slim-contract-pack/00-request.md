# Request (2026-09-25, verbatim)

2026-09-25, the proposal the user responded to (the conductor's reply to Fable's recommendation,
which the user pasted from an earlier session and asked "Thoughts?"):

> **Proposed shape**, three waves and four batches, with one final checkpoint:
>
> | Wave | Batches |
> |---|---|
> | 1 | #14, including the placeholder move and BL-028's doc half, alongside the BL-028 code fix with BL-036/037 |
> | 2 | #15 |
> | 3 | #8-prose, with BL-044 riding along, since that's where findings get their severity |

The user's request:

> Ok, run Orchestrate new with this scope. Effort level reduced.

The same proposal also said: keep a SHA pin on the decision tables after #14 ("Retiring the
mirror is fine; pin the one remaining copy"); #14 absorbs the placeholder move; #7 belongs to
the pack after (#9, #4, #7); for #15, run the control during this pack's own scaffold.

The numbers refer to `Features.md` (dated 2026-09-22/23, untracked in the main checkout and
deliberately not committed). Every section of it this change implements is quoted verbatim in
the batch file that implements it, so this ledger does not depend on that file.

## User decisions

- 2026-09-25, interview — **Settings**: "Keep them all (Recommended)" — `OS-20260923`'s baked
  answers carry forward, adjusted for this Linux workstation: validation by the README
  PowerShell recipe run through `pwsh`; no version, changelog or release; smoke steps agent-run
  with C1 asking only for a verdict; batches merge `--no-ff` into the integration branch and the
  change stops there, `main` and `origin` untouched until the user says so; `OS-` ledger ids and
  `BL-` backlog ids; reviewer plus test-hunter on every batch; convergence off; Features.md
  stays untracked and the ledger quotes what it needs.
- 2026-09-25, interview — **Windows run**: "Yes, one laptop step (Recommended)" — C1 carries one
  human step: the README recipe on the Windows laptop; the branch push it needs is asked at the
  hand-over.
- 2026-09-25, interview — **#15 model**: "Medium, same model (Recommended)" — fact-finding agents
  run on the conductor's model at medium effort; no model switch.
- 2026-09-25, interview — **Control**: "Run it now (Recommended)" — the same research question
  (this plan's fence census) at medium and at max, findings compared in LOG.md.
- 2026-09-25, earlier the same session — the installed skill at `~/.claude/skills/orchestrate`
  became a real `git archive main orchestrate` copy ("Okay, fix the copy for the extension and
  shipping app."), so this ledger pins that copy.

- 2026-09-25, plan approval — **Plan**: "Approve (Recommended)" — the four batches and weights
  (B01 L, B02 M, B03 S, B04 M), the wave map W1: B01+B02; W2: B03; W3: B04, and the single final
  checkpoint C1 with one Windows laptop step.
- 2026-09-25, plan approval — **Fold-ins**: "BL-041 → B02,BL-034 → B03,BL-042 → B04" — folded from
  `BACKLOG.md` BL-041, BL-034 and BL-042, approved 2026-09-25.
- 2026-09-25, plan approval — **#15 effort**: "Drop it (Recommended)" — the control run's result
  drops #15's per-role effort clause; B03 ships no effort or model rule.
- 2026-09-25, the same session, after the control — the user asked whether to repeat the control
  at the next level down ("should we run the same test on Extra? … or should I just open a new
  batch, and have it run these tests seperate from you orchestrating this?"); the conductor
  recommended a separate session (high vs max, repeated runs). Not part of this ledger.

## Item → batch map

| Item | Source | Batch |
|---|---|---|
| R1 — #14 contract slimming, keeping the SHA pin on the single copy of the two decision tables | request | B01 |
| R2 — the `{{EVIDENCE_TOOL}}`/`{{FENCE_TOOL}}` placeholder move | request | B01 |
| R3 — BL-028's doc half | request | B01 |
| R4 — BL-028 code fix across all `tools/*.mjs` CLIs, checkout-enumerating symlink test | request | B02 |
| R5 — BL-036 | request | B02 |
| R6 — BL-037 | request | B02 |
| R7 — #15 budget rules, with the control run | request | B03 |
| R8 — #8 prose half | request | B04 |
| R9 — BL-044 | request | B04 |
| BL-041 | backlog BL-041 | B02 |
| BL-034 | backlog BL-034 | B03 |
| BL-042 | backlog BL-042 | B04 |

Excluded by the request itself: #7, #9, #4 (the pack after), #1, and #8's path-partition half
(needs #1).
