# C1 / B05-step1 — are the `safeResolvedFilters()` guard paths exercised?

**Build under test**: `chore/interview-sizing-backlog-ledger` @ `66732c6` (main checkout, read-only).

## Command

The single published-recipe run cited in `B03-step1.md` (306 pass / 0 fail, node exit `0`,
`git diff --check` exit `0`), plus two mutation runs of the same full suite in throwaway
detached worktrees under the system temp.

## Exit code

Clean suite: `0`. Mutation A: `1`. Mutation B: `0`.

## The five guards in `orchestrate/tools/git-evidence.mjs:134-152`

```
G1  if (!listing.ok)            -> push probe diagnostic, return false
G2  if (!listing.text)          -> return true            (empty inventory is safe)
G3  if (paths.pop() !== '')     -> push 'Malformed path inventory', return false
G4  if (!attributes.ok)         -> push probe diagnostic, return false
G5  if (verdict)                -> push the classifier's verdict, return false
```

## Coverage, proven by mutation rather than by reading test names

**G1 — covered.** `tests/git-contract.test.cjs:504` drives it twice: once with a real
corrupted `.git/index` (`refusals[0].code === 'git-probe'`, `command === 'ls-files'`), and once
through the probe seam in `an unreadable ls-files result refuses the walk instead of running
status`, where a driver IS configured so the refusal is visible as `cleanliness: 'unknown'`.
Both halves carry their own live control in the test itself: the same repository, un-degraded,
really runs status and returns real dirt.

**G2 — covered, proven.** Mutation A changed `if (!listing.text) return true;` to
`return false;` in a throwaway worktree. The full suite went red:

```
ℹ tests 306   ℹ pass 305   ℹ fail 1
✖ a configured driver no inspected path resolves to leaves cleanliness observable (930ms)
  AssertionError: 'unknown' !== 'clean'
  at tests\git-contract.test.cjs:221:10
```

**G4 — covered.** `an unreadable check-attr result refuses the walk instead of running status`
drives it through `failProbe: 'check-attr'`, asserting both the boolean and the diagnostic
`[['git-probe','check-attr',repo]]`, again with a live control in the same repository.

**G5 — covered.** `a refusing verdict reaches the caller as the diagnostic the classifier
produced` pins the whole refusal wire, and `the probe seam can only refuse, and no published
invocation reaches it` sweeps a 12-member `failProbe` domain asserting exactly two `git-probe`
results and ten `unsafe-filter` ones, with the domain size and the partition size both pinned.

**G3 — NOT COVERED.** Mutation B disarmed the malformed-path-inventory guard while keeping its
side effect, so the only change is that the refusal never fires:

```
- if (paths.pop() !== '') { diagnostics.push(diagnostic('invalid-attributes', 'Malformed path inventory', { path: repo })); return false; }
+ if ((paths.pop(), false)) { diagnostics.push(diagnostic('invalid-attributes', 'Malformed path inventory', { path: repo })); return false; }
```

The full suite stayed **green**:

```
ℹ tests 306   ℹ pass 306   ℹ fail 0
MUT_B_EXIT=0
```

Corroborating the mutation, the string `Malformed path inventory` appears exactly once in the
repository — in `git-evidence.mjs:144`. No test references it. (`tests/git-contract.test.cjs`
does pin `Malformed attribute report` and `Unexpected attribute in report` at `:465-466`, which
are the neighbouring `filterReportVerdict` messages, not this one.)

No fixture reaches G3: `git ls-files -z` always terminates its output with NUL, and the probe
seam can only force a probe to be read as FAILED, which trips G1 before G3 is reached. B05
built a seam precisely so unreachable guards of this class could be driven — the sibling guard
G4 uses it — but G3 was left without one.

This is the named bug class in this repository's own CLAUDE.md: *"A branch no input reaches ...
If a mutation of the branch leaves the suite green, the branch is untested however correct it
is."*

## Live control

Every claim above is a mutation result, not a reading of test titles. Mutation A going red in
the same harness that left Mutation B green is itself the control: the instrument (a full
suite run in a throwaway worktree) demonstrably detects a disarmed guard in this very
function, so Mutation B's green is an absence of coverage and not a suite that never ran. Both
mutation scripts asserted their anchor string existed before editing, so neither could have
been a silent no-op. Both worktrees were reset (`git checkout --`, `git status --porcelain`
= 0 lines) and removed.

## Verdict

FAIL — four of the five `safeResolvedFilters()` guards are exercised, but the
malformed-path-inventory guard (`git-evidence.mjs:144`) is not: disarming it leaves the full
306-test suite green, and no test names its diagnostic. The step's Pass condition, "the guards
have coverage", is not met for that guard.
