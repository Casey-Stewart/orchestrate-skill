# Progress

**Identifier**: OS-20260918-readonly-evidence-smoke-inputs
**Started**: 2026-09-18 · **Base**: f918fe39762c70edb9a3424e54eaa208fd7c5727
**State**: COMPLETE
**Work list**: [01-plan.md](01-plan.md) (see [00-request.md](00-request.md))
**Contract**: [00-READBEFORE.md](00-READBEFORE.md) · **Narrative**: [LOG.md](LOG.md)
**Smoke page**: smoke-C1.html (ledger-relative, with smoke-C1-demo-before.html and smoke-C1-demo-after.html)
**Rule**: statuses here are claims; **git is truth**.

W1 is complete: B01 and B02 are reviewed, integrated and green. B01 passed its explicitly
authorized third round. W2 B03 is reviewed, polished, integrated and green. The C1 pre-smoke
step-10 failure is repaired, reviewed, gated and integrated. All nine agent steps and the
step-0 gate now pass at tested SHA 49dfe07c09111197b8739aac2df0cea43c985cdf. C1 is ISSUED
and awaits the user's verdict on the two human steps; no verdict is inferred.

## Plan approval and integration worktree

2026-09-18 user approval, verbatim: "Okay, approved."
Approved plan v4 and portable-command delta; W1 B01+B02, W2 B03, final C1;
no backlog fold-ins. The approval is standing authorization for the wave map;
implementation starts only after the separate start instruction required by new mode.

Integration worktree: C:/Users/fatbo/.codex/visualizations/2026/09/18/01a0b671-3325-77d3-b360-845f09da4bdc/orchestrate-run/wt-int
Starting protocol remains frozen at f918fe39762c70edb9a3424e54eaa208fd7c5727.
Planning-only descriptions in retained planning appendices are historical; this
approval activates their requirements without changing their content.

## Execution model

**Waved stack — W1: B01+B02; W2: B03; C1 final after W2.** W1 file fences are disjoint;
B02 attribute scope must also leave every B01 path unchanged; validate effectively.
B03 depends on both and owns shared documentation and visible page changes.
All batches are L. Existing manual fence checks precede independent reviewer and
test-hunter gates in parallel. Literal python validation, triple file-content hash
equality and raw-byte preservation through fresh autocrlf=true checkouts are mandatory.
Node discovery is recursive and sorted by FullName. B03 is the final serialization
point; second FIX FIRST stops, third attempt requires explicit user authorization.
Historical P1-1…P1-4 are already resolved at Base; see the source evidence baked in
the contract/05-byte-validation-and-scope.md. New residuals use OS-BL-NNN and current evidence.

## Legend

- ⬜ Not Started; 🔄 In Progress; 🟢 Integrated (reviewed, validations green on
  worktree and integration tip, awaiting checkpoint); 🧪 At Checkpoint (user verdict
  pending); ❌ Smoke Failed (user only); ✅ Passed (checkpoint passed, shipment per
  merge policy and Git evidence); ⛔ Blocked (defective or green with residual,
  awaiting user); ⛔ (dropped); ❌ (fix-up capped); 👤 User Action.

## Batches

| # | Batch | Branch | Wave | Version | Status | Updated | Notes |
|---|---|---|---|---|---|---|---|
| B01 | Read-only Git evidence and fence checks | codex/readonly-evidence-checker | 1 | — | ✅ | 2026-09-18 | Integrated dd32593ae06215f61abed695625024aa0c04b9b0; R3 SHIP @9f05127c33040d02a08782a5d23c23242021de39; fresh GPT-6 Astra / xhigh; hunter CLEAN; all prior findings resolved; LOG#B01-integrated m: rounds=2 asks=0 fence-bounces=0 gate=2/0 tip-red=0 |
| B02 | Reproducible Excel artifacts | codex/smoke-input-files | 1 | — | ✅ | 2026-09-18 | Integrated96f48ed17931053e7c70aed58ba9e581c9e4e560; R1 SHIP current inherited tier; polish closed; LOG#B02-integrated m: rounds=0 asks=1 fence-bounces=0 gate=1/0 tip-red=0 |
| B03 | Workflow, generated contract and smoke-page integration | codex/workflow-input-delivery | 2 | — | ✅ | 2026-09-18 | Integrated a70f302a8b46c5191ff8daddb3652e8d9bc6e471; R1 SHIP @7a3ab268a0b318ce080065df628cb1b2386ed980; two test-only ASKs closed @800c0fac5735d7ed262eff86390ddae1d1ca249c; GPT-6 Astra / xhigh; LOG#B03-integrated; pre-smoke repair step 10 INTEGRATED f48152253cf9b1d9d8e4354a8d2c00fe760e4631 (fix/B03-presmoke-10; R1 SHIP @f2c2cee asks=2; polish closed @af57f93; repair m: rounds=0 asks=2 fence-bounces=0 gate=2/0 tip-red=0); LOG#C1-repair10-integrated; pre-smoke repair step 00 INTEGRATED 35926ec6c70178276ea1a689643e0a29ce27e65b (fix/B03-presmoke-00; R1 SHIP @193e27f asks=6; polish closed @6bd4780; step 0 re-run PASS; repair m: rounds=0 asks=6 fence-bounces=0 gate=6/0 tip-red=0); LOG#C1-gate-repair-integrated m: rounds=0 asks=2 fence-bounces=0 gate=2/0 tip-red=0 |

## Checkpoints

| Checkpoint | After wave | Covers | Why here | Status | Verdict |
|---|---|---|---|---|---|
| C1 | 2 | B01, B02, B03 | Final; W2 owns hands-on smoke-page/input delivery | ✅ | PASS 2026-09-19 (verdict log); issued @49dfe07c09111197b8739aac2df0cea43c985cdf m: pre-smoke=9/2 human-smoke-min=unreported escaped=1 |

## Smoke-test verdict log

| Date | Checkpoint | Verdict | User notes |
|---|---|---|---|
| 2026-09-18 | B01 | fix again (consumed once) | "OKay, yeah do another round. Same level" |
| 2026-09-19 | C1 | pass (steps 1 and 2) | "Okay, then yeah I did both steps right. I was just confused by the wording, but that IS what I did and it DID pass both of those." — preceded by "I had already done steps 1 and 2 I think? The steps were weird, but I THINK it passed." The hedged first message was NOT recorded as a verdict; the conductor asked for the Copy-results paste and for what was weird, and recorded only the unambiguous confirmation. No paste was supplied, so the page's stored marks are not independently confirmed — the verdict rests on the user's words. The wording confusion is a works-but, filed as OS-BL-001, and does not block the pass. |

## Item → batch coverage audit

| Request item | Source | Batch | Version | Status |
|---|---|---|---|---|
| 1a checker behavior and tests | request | B01 | — | ✅ |
| 1b gate wiring and authority | request | B03 | — | ✅ |
| 2a Git helper and actual-helper scenarios | request | B01 | — | ✅ |
| 2b evidence-only workflow use | request | B03 | — | ✅ |
| 3a reproducible Excel, scoped attributes, triple hashes, byte preservation and semantic validation | request | B02 | — | ✅ |
| 3b raw-byte validation, conductor delivery, invalidation, recursive discovery and reusable-path boundary | request | B03 | — | ✅ |
| Starting protocol freeze, scheduling/cap and historical baseline evidence | run requirement | B00 conductor | — | baked and source provenance verified at scaffold |

## Session log

| Date | Session did | Stopped because |
|---|---|---|
| 2026-09-18 | Discovery/interview/plan/pre-flight; baseline 64/64; base f918fe39762c70edb9a3424e54eaa208fd7c5727 | Plan approval pending; planning copy, no scaffold or open wave |
| 2026-09-18 | User: "Okay, approved." Approved ledger scaffold; contract/plan and source provenance verified; no wave opened | New-mode scaffold STOP; awaiting start instruction |
| 2026-09-18 | Approved baseline exception consumed; W1 opened; B02 integrated96f48ed and validated65/65; B01 candidatefac37a5 validated156/156 but reached R2 FIX FIRST | B01 second-round cap; waiting for fix again / ship with residual / drop. W2 unopened; C1 not reached |
| 2026-09-19 | Reconciled: pre-smoke repair fix/B03-presmoke-10 in flight, reviewed SHIP @f2c2cee asks=2, worktree DIRTY with an uncommitted crashed polish draft and two unticked polish items; tip green (Node exit 0, diff check exit 0); resumed a FRESH polish implementer per the dirty-worktree Recovery row | Polish pass in flight; C1 not reissued, no verdict requested |
| 2026-09-19 | Polish closed @af57f93 (6/6 ticked); conductor 6a fence PASS, six reviewed pages byte-identical to f2c2cee, 6b re-proved on base 9b40054 (exit 1, 6/7 fail by assertion), mutations A and C now fail; polished tip 187/187 + diff check + 7/7 regression; merge-tree 2db7fc98 conflict-free; merged f4815225 and tip revalidated 187/187 + 7/7 | C1 close-out next: re-run the invalidated pre-smoke steps, rebuild the pages at the tested SHA, then STOP for the user's C1 verdict |
| 2026-09-19 | C1 close-out: advanced all three page build identities to tested SHA 49dfe07, rebuilt every page through the reviewed builder, re-ran the invalidated pre-smoke items (gate, 9, 10, 11) — all PASS, including the step 10 that failed before — recorded carried-over evidence for steps 3-8, and issued C1 | STOP at checkpoint C1: the user's verdict on human steps 1 and 2 is required |
| 2026-09-19 | C1 PASSED on the user's verdict; opened, gated and integrated the step-00 gate portability repair (reviewer SHIP, hunter FINDINGS 3, six test-only ASKs closed and each proved by the mutation that previously survived); re-ran step 0 PASS at the merged tip; final coverage audit, distillation and residuals recorded | CHANGE COMPLETE. Awaiting the user's separate decisions on merging into local main and on pushing; neither is authorized. |

## Continue authorization and reconciliation — 2026-09-18

User, verbatim: "This is explicit authorization to start W1 and implement the approved plan. Use Codex sub-agents for implementers, fresh independent reviewers, separate test hunters, and checkpoint QA according to the ledger."

User, verbatim: "Execute W1: B01+B02 concurrently, then W2: B03, proceeding autonomously to final checkpoint C1 unless the contract requires an earlier stop."

User, verbatim: "Do not merge into main or push."

Discovery: one ACTIVE branch-only ledger on codex/readonly-evidence-smoke-inputs-ledger; main checkout remains on main. Owning integration/scaffold 7f25d9a2f6befa6d047def65473b34dfa9da6c88; local shipment refs/heads/main f918fe39762c70edb9a3424e54eaa208fd7c5727, not-contained (Git exit 1). All planned batch branches absent; no checkpoint verdict pending; both worktrees clean. Ledger provenance tree 6c90f82299b58d05209812d6f920c66082d357f9 matches scaffold. Frozen contract and plan unchanged.

Resume validation: 63/64 Node tests pass; failing name "sections survive the fill verbatim and stay inside the script block". Existing CRLF template checkout exposes LF-only test extraction at tests/build-smoke-page.test.cjs:56. No wave opened. Required reviewed mini-batch fix/B03-tip owns tests/build-smoke-page.test.cjs only, plus permitted checklist edits in its repair batch. Literal python verified via authorized execution: Python 3.10.6, openpyxl 3.1.5, recorded Python310 path. Sandbox PATH denial was resolved, not a missing prerequisite.
## Baseline repair gate — user decision required

No W1/W2 batch has started and C1 has not been reached. State USER-BLOCKED records a required explicit contract decision before a green tip can be established; it does not claim a second-review cap or a checkpoint verdict.

| Repair | Branch | Candidate | Status | Evidence/metrics |
|---|---|---|---|---|
| Baseline CRLF assertion portability | fix/B03-tip | 70f6baadd702425ef13741fe59d614232e256744 | 🟢 Integrated ce1f444 after explicit approval | Manual fence PASS; reviewer R1 FIX FIRST solely on frozen6b proof; hunter CLEAN; 65/65 candidate tests; m: rounds=1 asks=0 fence-bounces=0 gate=0/0 tip-red=0 |

Required decision: authorize only fix/B03-tip to use original CRLF harness failure plus independently verified LF-only mutation evidence in place of section6b's copied-tests-on-base failure requirement. No other rule is waived. A successful 23/23 copied-test run is recorded honestly; no setup failure or inconclusive result is claimed. Repair remains unmerged. Fresh review/hunter evidence is under evidence/baseline-repair/. After an explicit amendment is recorded, the reviewed repair still needs merge-tree dry run, merge and full integration validation before W1 opens.
## Repair-only exception approved — 2026-09-18

User, verbatim: "Approved"

This answers the immediately preceding proposal: approve an exception for fix/B03-tip only, accepting the reproduced original CRLF harness failure plus independently verified LF-only mutation evidence instead of section6b's copied-tests-on-base failure requirement, then resume W1 -> W2 -> C1. This is the entire exception; no other gate, batch or future repair is exempt. Frozen contract and locked plan files remain unchanged; this explicit user amendment is recorded here.

The amendment resolves reviewer R1's sole P0 for candidate70f6baadd702425ef13741fe59d614232e256744. Reviewer code assessment and separate hunter were clean; no source change since their review. The prior23/23 base-copy PASS remains accurately recorded. Conductor may now perform dry run, merge and integration validation. Earlier user-blocked text is historical. No checkpoint verdict or permission to merge into main/push is implied.

Repair integrated at ce1f4448617a51031981d3180f7a681a5714dd93 after clean merge-tree dry run; recursive integration validation65/65, diff check PASS. Pending repair marker removed. Earlier blocker text is historical and resolved by the recorded user exception. No additional review round or waiver. W1 is ready to open.


## W1 opened — 2026-09-18

Wave base: ae850a38fa760cb36f0ca83db35e5830ed1cc2ed. B01 codex/readonly-evidence-checker and B02 codex/smoke-input-files both cut exactly from this green integration tip with isolated worktrees under C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run. This commit is the wave-open crash marker. All earlier gates resolved; no unanswered checkpoint. Implementers run concurrently on current inherited model. B03 remains not started until both pass manual fence, reviewer/hunter and integration validation. Existing .gitattributes effective-independence checks remain mandatory.

## B01 second-round cap — user verdict required

R2 FIX FIRST at fac37a5163db2bd816ece3b68e936ab534b7f77d. Recursive candidate validation156/156 passes and explicit candidate-directory diff check passes; this is a green candidate with an open P1, not approval to integrate. R1 findings were fixed. The fix introduced rejection of a legal dangling symbolic target: refs/remotes/origin/HEAD -> refs/tags/missing (also refs/custom/missing). Git accepts the target, but discovery discards it as symref:null, labels invalid-symbolic-ref, and exits2. Prior production retained the target. Exact reproduction and before/after evidence: evidence/W1/B01/review-R2/.

The frozen contract section6c requires the second FIX FIRST to leave B01 out of integration and stop after current-wave siblings finish. B02 is already reviewed/integrated/green. No third implementation attempt, W2, or C1 is authorized by the earlier repair-only exception. Choose fix again (one third round with a fresh implementer), ship with this residual (recorded residual plus human smoke step), or drop (dependent B03 then needs re-planning or dropping). The fresh hunter R2 report is retained under evidence/W1/B01/hunter-R2. It adds one test-only ASK: isolated global-filter coverage; actual candidate behavior is correct, but a local-only probe mutant survives105/105 tests. This does not reopen implementation. No user verdict has been inferred.

Main remains unchanged on main at f918fe39762c70edb9a3424e54eaa208fd7c5727. No main merge or push. Frozen contract and locked plan blobs remain unchanged. C1 input preparation is retained only in external scratch; no checkpoint page or verdict is claimed.

## B01 third round authorized — 2026-09-18

User, verbatim: "OKay, yeah do another round. Same level"

This explicitly authorizes one third B01 round with a fresh implementer on the retained batch branch at GPT-6 Astra (`gpt-6-astra`), `xhigh` effort, matching both prior rounds as verified in local session records. Both rounds’ findings and current diff are supplied; fresh independent reviewer and separate hunter follow the existing manual fence gate. Authorization consumed once in the B01 Notes marker. If this third round returns FIX FIRST, stop again with ship/drop choices; no fourth round is authorized. No other frozen rule changes.

Discovery found one active ledger across all non-symbolic local/remote refs; integrated older copies are proven by equal ledger-subtree trees and ledger-changing commit ancestry. The known unmerged B01 copy remains visible and contains only its permitted checklist ticks. Main and integration/candidate trees are clean; B02 is integrated, B01 is not, B03 is absent. Shipment local refs/heads/main is not-contained. Frozen contract/plan blobs unchanged. Resume validation65/65 and diff check PASS. Evidence: evidence/W1/B01/third-round/. Existing integration worktree reused.

## W2 opened — 2026-09-18

Wave base: 6e1fb4428e871760d8f31a99606c3ad68db5015f. B01 and B02 are integrated and validated green. Branch codex/workflow-input-delivery cut exactly from this tip in C:/Users/fatbo/.codex/visualizations/2026/09/19/01a0b6ff-10c1-7a00-8e0c-38f750a79d0f/orchestrate-run/wt-B03. This commit is the W2-open crash marker. B03 retains all18 approved paths plus own checklist; the running frozen contract/plan are not editable. One fresh implementer on inherited GPT-6 Astra / xhigh, then manual conductor gate and fresh reviewer/hunter. Final C1 follows successful integration; no interim checkpoint or main merge/push.

## C1 repair opened

Repair base 9b40054dfc9571af25267050640f66bc00e7e619; branch fix/B03-presmoke-10; worktree C:\Users\fatbo\.codex\visualizations\2026\09\19\01a0b6ff-10c1-7a00-8e0c-38f750a79d0f\orchestrate-run\wt-C1-repair. Complete conductor-authoritative repair fence is in 02-fix-B03-presmoke-10.md. Frozen contract/plan stay byte-identical. GPT-6 Astra / xhigh inherited, fresh implementer and fresh independent reviewer/hunter. No user checkpoint reached; rows remain green. Only trailing blank EOF in retained QA Markdown/scripts was trimmed for diff-check; raw proof/input bytes unchanged.

C1 repair10 R1 SHIP @f2c2ceeb73a8adeee5dd2249a97df84bb1a19134 asks=2; fresh reviewer and separate fresh hunter complete. Same implementer ordinary test-only polish pending; frozen pre-smoke repair marker remains.

## C1 repair polish resumed — 2026-09-19

Discovery found one ACTIVE ledger. Boot reconciliation on the integration branch
codex/readonly-evidence-smoke-inputs-ledger @e8cba7b8c0c51b8aee2361fcc3b59a3ac28a47f4.
Shipment resolved from the locked source: local refs/heads/main
@f918fe39762c70edb9a3424e54eaa208fd7c5727; ancestry test exit 1 = NOT contained, so
nothing was merged silently and no row flips. Main checkout untouched on main.

B03 Notes carry `pre-smoke repair pending: step 10, fix/B03-presmoke-10
@9b40054dfc9571af25267050640f66bc00e7e619`. Git: branch fix/B03-presmoke-10 exists at
f2c2ceeb73a8adeee5dd2249a97df84bb1a19134 (one commit after the marker's base), not an
ancestor of the integration branch -> the §Recovery in-flight-repair row directs
"resume / gate it per the 🔄 rows on that branch". Among those rows the first match is
the DIRTY-WORKTREE row, not the clean `SHIP … asks=` row: wt-C1-repair has two modified,
uncommitted files — 02-fix-B03-presmoke-10.md (two appended `- [ ] polish:` items, both
UNTICKED) and c1-demo-instructions.test.cjs (+56/-21). A polish agent died before
committing. Verdict: resume the implementer with a FRESH agent at the first unticked
item. This is not a review round and does not touch the recorded R1 SHIP.

Resume-time validation on the integration tip: recursive FullName-sorted discovery found
6 suites, `node --test` exit 0, `git diff --check` exit 0 — tip green, so no `-tip`
repair is owed.

Tier note, recorded honestly: every earlier role ran on Codex GPT-6 Astra / xhigh. The
Codex CLI is not present in this session's environment (`codex` absent from PATH and from
the checked install locations), so this session's fresh implementer, reviewer and hunter
inherit this session's own model, Claude Opus 5. The contract's tier clause — "if tiers
are unavailable, use the default and keep the gate shape" — governs; every gate keeps its
shape and independence. No gate is waived or merged.

The uncommitted draft is handed over as a DRAFT only: the fresh implementer must verify
it by execution, not trust it. Fence unchanged — c1-demo-instructions.test.cjs plus own
checklist ticks/appends; the six reviewed page files must stay byte-identical to f2c2cee.
No production change is authorized by an ASK. No checkpoint has been reached or reissued
and no user verdict is requested or inferred. No main merge or push.

## C1 repair step 10 integrated — 2026-09-19

Polish closed at af57f93ee80ebfaf76779e936603b01547316877. The conductor ran the
mechanical close itself rather than accepting the implementer's claims.

6a fence PASS. Worktree clean. `git diff --name-status -M f2c2cee..HEAD` is exactly two
paths — c1-demo-instructions.test.cjs and the repair's own batch file — so the frozen
ordinary-polish MECHANICAL closure applies: test/prose only, no production path, no
scoped re-review, no new FIX FIRST round, and the recorded R1 SHIP is untouched. The
whole-repair diff against the integration branch is exactly the seven approved fence
paths plus the own batch file. Batch-file changes are ticks and appends only; 6/6.
The six reviewed pages are byte-identical to the reviewed f2c2cee by blob id, so the
reviewer's SHIP still covers precisely the artifacts it reviewed.

6b failing-on-base re-proved on the POLISHED file, not inherited: detached worktree at
repair base 9b40054dfc9571af25267050640f66bc00e7e619, setup n/a, TEST-ONLY file copied
in, base pages untouched. Exit 1, tests 7, pass 1, fail 6, by
`AssertionError: the instructed route must expose the note field before entering text` —
an assertion failure on the named behavior, not a crash or setup failure.

Both hunter ASKs verified genuinely closed by re-applying the mutations that previously
survived 6/6, to disposable copies only: A `wrong-prerequisite-verdict` now exit 1,
3 failures (`both demo steps finish Pass`); C `stale-after-visible-instructions` now
exit 1, 1 failure (`emitted After introduction must match its corrected sidecar`);
unmutated candidate exit 0, 7/7. Evidence: evidence/C1/repair-10/polish-close.md.

Validation on the polished tip: 187/187, `git diff --check` exit 0, explicit ledger
regression 7/7. Merge-tree dry run 2db7fc98b956d1959ace2b1449e214cac3fb964c, conflict
free. Merged with commits preserved at f48152253cf9b1d9d8e4354a8d2c00fe760e4631;
integration tip revalidated 187/187, diff check exit 0, regression 7/7. The pre-smoke
repair pending marker is retired in this commit, as the contract requires.

B03 stays 🟢. No batch row changes status: a failed pre-smoke step is a defect caught
before the user's time was spent, never ❌. No checkpoint has been reached, no page has
been issued, and no user verdict is requested or inferred. No main merge or push.

Close-out still owed before C1 can be issued: re-run the pre-smoke steps the repair
invalidated (the step-0 gate plus 9, 10, 11 — steps 3-8 carry over at revision 1 because
the repair touched none of their covered files), advance buildSha to the tested
integration SHA, rebuild all three pages through the reviewed builder from their
sidecars, flip the covered rows 🟢 -> 🧪, then STOP with the combined script.

## C1 issued — 2026-09-19

Tested SHA 49dfe07c09111197b8739aac2df0cea43c985cdf: recursive discovery 6 suites,
187/187, 0 skipped, Node exit 0; `git diff --check` exit 0; explicit ledger regression
7/7; worktree clean. That is the SHA stamped into all three pages, and the page commit
follows it, as the frozen delivery rule requires.

Build identity advanced from 6c84b930aa4297283f94ce9eeacdff44d2b22ba4 in all three
sidecars and their gate prose. Before and After keep an identical buildSha and ckptKey
because they demonstrate a reissue on the SAME build, with the After page's step 1 held
at revision 2 against Before's revision 1 — that asymmetry is what makes the changed step
ask to be re-run. Every page was regenerated through the reviewed builder from its
sidecar with the last committed sidecar as `--previous`; none was hand-edited. Each page
was then rebuilt a second time under a temporary name and compared byte-for-byte, proving
the delivered bytes are exactly what the sidecar produces and that the QA runner altered
nothing.

Pre-smoke re-verification. The repair rewrote delivery prose in all six page/sidecar
files, so under §Smoke checkpoints every pre-verified label whose covered files it touched
was invalidated and re-run by a fresh QA runner: the step-0 gate, step 9, step 10 and
step 11 — all PASS. Steps 3-8 cover the Git evidence helpers, fence checks, literal-python
workbook semantics, reproduction, fresh-checkout byte preservation and recursive discovery;
the prose-only repair touched none of their covered files, so their revision-1 evidence at
6c84b930 stands and the page renders them "carried over (unchanged step)" rather than
claiming a fresh run. Steps 1 and 2 remain human and unmarked.

Step 10 failed at the previous issue, so it was re-verified against the live rendered
runtime rather than the static file. From a clean slate the QA runner executed the
corrected route literally: mark demo step 1 Pass (the step-1 note stays hidden — the
original defect's behavior, now off the instructed path); on demo step 2 select
"Works, but", at which point the note field becomes genuinely visible (576x62, hit-tested
at its center); type "keep this note"; then select Pass, after which the field stays
visible and keeps the note. The After page then shows step 1 with no current verdict and
visible history reading "Run it again and select a verdict", while Copy results as text
exports verbatim `1. NOT RE-RUN — previous PASS (carried over from build 49dfe07c…);
re-run required` and `2. PASS — keep this note`. The After introduction's claim — that the
rerun wording is what is visible while NOT RE-RUN is the export's wording — was checked
against observed behavior and holds. Demonstration marks were cleared through the pages'
own controls; the real C1 page reloads unmarked, 11 of 11.

Limits recorded rather than glossed. The Browser pane was hidden for much of the run: some
screenshots timed out and the After-page screenshots came back blank, so most rendered
observations came from the live DOM of the same tab — innerText, computed styles,
hit-testing and geometry — never from the static file. Two Before-page screenshots did
render. Clipboard read is denied to the page origin, so the exported text was captured by
a pass-through wrapper installed on navigator.clipboard.writeText before the real button
press; the page's own code and the text it builds were untouched. The step-10 link checker
hardcodes port 8765 and consumes whatever link inventory sits in its scratch directory, so
a fresh 108-anchor inventory was captured from the live DOM instead of reusing the previous
build's file — reusing it would have silently validated the new build against the old
build's link list. A serve-checkpoint.mjs process from the previous QA run was already
listening on 8765; it was verified to serve current on-disk bytes and left running, since
it is not this session's to kill.

No main merge and no push. Nothing is inferred about the user's verdict: the covered rows
are 🧪, not ✅, and the checkpoint's human-smoke-min and escaped metrics stay open until the
verdict is recorded.

### Residual noted for the user, nothing changed

Clearing a demo verdict leaves the note text in the demo record (the note field stays
visible because its condition includes an existing note), and the page offers no control
to delete its storage key: after clearing both verdicts and emptying the note through the
field, the key still holds two inert empty records. Cosmetic, isolated to the demo storage
key, and identical to the previous run's end state. It is recorded here rather than fixed,
because fixing it would be a production change no gate has authorized.

## C1 gate repair opened — 2026-09-19

The user reached the issued checkpoint and could not run the step-0 gate. Their shell is
cmd.exe; the delivered block is PowerShell. Two verbatim observations from their terminal:

    'Set-Location' is not recognized as an internal or external command,
    operable program or batch file.

    Error: Cannot find module 'C:\Users\fatbo\...\wt-int\'.agents\changes\OS-20260918-readonly-evidence-smoke-inputs\evidence\C1\scripts\c1-canary.mjs''
    code: 'MODULE_NOT_FOUND'

The second is cmd.exe declining to strip the single quotes the PowerShell block uses, so
they reach Node inside the filename. The conductor proposed a pre-smoke repair rather than
having the user hand-translate the gate.

User authorization, verbatim: "Yea sounds solid."

This is a pre-smoke repair, not a checkpoint failure. No numbered step carries a verdict
yet, the gate is explicitly a non-verdict gate, and no batch is indicted: the defect is in
delivery prose the conductor owns, and every batch's code is correct. The covered rows stay
at checkpoint — they are not flipped back and no fail status is written, because that
status means the user reached the checkpoint and a BATCH failed it. B03 owns smoke-page
delivery, so the repair hangs off B03 and its Notes carry the `pre-smoke repair pending:`
marker §Recovery keys on.

Repair base 8d27e891fc0a4e7882590232eeec96f993f9a59f; branch fix/B03-presmoke-00; complete
conductor-authoritative fence in 02-fix-B03-presmoke-00-gate.md. Fence is smoke-C1.json,
smoke-C1.html and a new ledger-local c1-gate-portability.test.cjs, plus the repair's own
checklist. Both demo gates carry an empty `commands` array, so neither demo page nor demo
sidecar is in scope. Every step's do/pass/aside/inputs/revision/pre block must stay
byte-identical so the user's pending verdicts and the carried-over labels survive the
re-issue; buildSha and ckptKey stay as issued and the conductor advances build identity at
close-out.

Roles inherit Claude Opus 5, as recorded for this session. Frozen contract and locked plan
stay byte-identical. Fresh implementer, then the conductor's own manual fence and
failing-on-base check, then a fresh independent reviewer and a separate fresh test hunter.
No main merge, no push, and no user verdict is requested or inferred while this runs.

The user has not yet reported the canary result; the QA runner's own run at the tested SHA
passed, and the canary re-runs as part of the re-issue's pre-smoke regardless.

Branch fix/B03-presmoke-00 cut from the integration tip
8d27e891fc0a4e7882590232eeec96f993f9a59f, with an isolated worktree at
C:/Users/fatbo/.codex/wt-g0. The marker's base SHA is corrected here to that actual cut
point: the earlier draft named 12a3469, the tip before the marker commit itself landed,
and §Recovery uses this SHA to tell "never started" from "in flight", so it must name the
real base. The worktree sits at a short path because this ledger's deepest evidence paths
exceed the checkout limit under the session scratchpad; the same workaround was recorded
for the step-10 repair's base probe. Worktree is clean at the cut and on the right branch.

## Step-0 gate confirmed by the user — 2026-09-19

The user ran the canary themselves in cmd.exe, from the integration worktree, and it
PASSED. Their output, key fields: branch codex/readonly-evidence-smoke-inputs-ledger;
testedSHA 49dfe07c09111197b8739aac2df0cea43c985cdf; head
9909d30ffd6bef49649bfa50b4e1422a339289d8; intactInputsValidated true; original workbook
SHA-256 e5544604e81a378431842516d9dad722f4ba650ce4b9efb2850920ac4199469f mutated to
5833d64b164814fe1ddc5f2f9240d0adff043ead7a62f81e3acae9160cc6ea8b; current builder exit 1
with "input artifact evidence/C1/inputs/issue-001/orders.xlsx: SHA-256 mismatch for raw
file bytes" and oldHTMLPreserved true; starting f918fe39762c70edb9a3424e54eaa208fd7c5727
builder exit 0, writing 60498 bytes. Verdict, verbatim: "PASS: current rejects tampered
bytes; starting builder accepts/ignores them".

This is the opposite-behavior proof the frozen rules require, now independently reproduced
on the user's own machine rather than only by the QA runner. It also confirms two things
the conductor had asserted: the canary's own ancestry check accepts head 9909d30 as a
descendant of the tested SHA, and its source-drift check found README.md, orchestrate,
tests and .gitattributes unchanged between 49dfe07 and 9909d30 — so every commit since the
tested SHA really is checkpoint artifacts only, exactly as the gate text claims.

The gate CONTENT is therefore sound; only the shell portability of the command block was
defective, which is what fix/B03-presmoke-00 addresses. No numbered step verdict is implied
by this gate run.

## CHANGE COMPLETE — 2026-09-19

Final checkpoint C1 passed on the user's recorded verdict; every batch is ✅ and no batch
was dropped. The step-00 gate portability repair integrated at
35926ec6c70178276ea1a689643e0a29ce27e65b after a conflict-free merge-tree
fcbb87b3cf68a0d5c077fea6c10bc4ec31b7cc0d. Tip revalidated: 6 suites, 187/187, 0 skipped,
Node exit 0; `git diff --check` exit 0; both ledger regressions 7/7 with 0 skipped. Step 0
was re-run at the merged tip, as a pre-smoke repair requires — PASS, evidence in
evidence/C1/step-00-gate-rerun.md.

### Final coverage audit — zero unaccounted

The convergence pass is OFF for this ledger, so this audit is built from the PROGRESS rows
plus Git rather than from an independent read of the tip against every plan item. Saying so
is part of the hand-over.

| Request item | Batch | Resolution |
|---|---|---|
| 1a checker behavior and tests | B01 | merged dd32593ae06215f61abed695625024aa0c04b9b0 |
| 1b gate wiring and authority | B03 | merged a70f302a8b46c5191ff8daddb3652e8d9bc6e471 |
| 2a Git helper and actual-helper scenarios | B01 | merged dd32593ae06215f61abed695625024aa0c04b9b0 |
| 2b evidence-only workflow use | B03 | merged a70f302a8b46c5191ff8daddb3652e8d9bc6e471 |
| 3a reproducible Excel, scoped attributes, triple hashes, byte preservation, semantic validation | B02 | merged 96f48ed17931053e7c70aed58ba9e581c9e4e560 |
| 3b raw-byte validation, conductor delivery, invalidation, recursive discovery, reusable-path boundary | B03 | merged a70f302a8b46c5191ff8daddb3652e8d9bc6e471 |
| Starting protocol freeze, scheduling/cap, historical baseline evidence | B00 conductor | baked at scaffold; source provenance verified |

Repairs, all merged: fix/B03-tip ce1f4448617a51031981d3180f7a681a5714dd93 (baseline CRLF
portability, under the user's recorded repair-only exception); fix/B03-presmoke-10
f48152253cf9b1d9d8e4354a8d2c00fe760e4631 (unusable note-entry route); fix/B03-presmoke-00
35926ec6c70178276ea1a689643e0a29ce27e65b (gate not runnable in the user's shell). No item is
unaccounted, no fold-ins were taken into this change, and nothing was dropped.

### Version and changelog

The contract records version files, bump cadence and changelog as `none`, and no such files
exist in this repository. Per the frozen rule, version and changelog work is skipped at
close-out, and this line is the required statement that it was skipped deliberately. Build
identity is carried by the tested SHA and the behavioral canary instead, which is why the
canary exists at all.

### Distillation

One new bug class was distilled into the contract's Repo conventions section: delivered
instructions must be executable in the reader's actual environment, proven by a
runtime-backed test rather than prose review. It escaped twice in this run and the USER
found it both times, which is exactly why it earns a guardrail. It points at the two
ledger-local tests that now enforce it.

### Residuals

OS-BL-001 (C1 human step wording — the user's works-but), OS-BL-002 (cleared demo verdicts
leave inert records; needs a production template change no gate authorized), OS-BL-003 (a
ledger evidence path exceeding Git's default Windows path limit, which forced short worktree
roots for both repairs). All three are in bugs-2026-09-17.md with current evidence.

### Cleanup proposal — for the user, not done

Merged and safe to delete: codex/readonly-evidence-checker, codex/smoke-input-files,
codex/workflow-input-delivery, fix/B03-tip, fix/B03-presmoke-10, fix/B03-presmoke-00, and
feat/tier1-tier2-protocol (already contained in local main). This ledger could be moved to
.agents/archive/ with `git mv`. Neither is done here.

**Do NOT prune the wt-int worktree.** Closing hunter finding F2 required
c1-gate-portability.test.cjs to check the gate's target against git's own worktree records,
so that regression now depends on wt-int existing and still holding
codex/readonly-evidence-smoke-inputs-ledger. It is ledger-local and never runs in the frozen
recursive suite, but invoked directly after a prune it would go red with "the gate points a
shell at … which is not a git worktree that knows branch …". That coupling is inherent to
detecting a wrong-but-existing repository, and it is recorded here so a future session reads
it as expected rather than as a defect.

### Shipment

Local refs/heads/main is UNCHANGED at f918fe39762c70edb9a3424e54eaa208fd7c5727 and does not
contain the integration branch. origin/main is at a891df7b4ab864db3a63132b44750726fa78598b,
18 commits behind local main — the user's earlier review-fix work is committed locally and
has never been pushed. Nothing in this run was merged toward main and nothing was pushed, in
keeping with the user's recorded instruction "Do not merge into main or push." Merging and
pushing are two separate decisions that remain entirely the user's.
