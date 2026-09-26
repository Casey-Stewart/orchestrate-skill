# C1 step 04 (revision 1)

- Integration SHA: f770be16140a0e4719886e6475d7d0306ca43ac2
- Step revision tested: 1
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD f770be1)
- Section 3: One copy of the procedure — the slimmed contract (B01). Inputs: none.

## Do

Compare the contract template's size at the ledger base and at this build:

```bash
git show edd2f1e:./orchestrate/templates/00-READBEFORE.md | wc -c
wc -c < orchestrate/templates/00-READBEFORE.md
```

## Pass

The second number is at most half the first (the base reads 63095).

## Commands run and exit codes

1. Input check: none — this step names no issued input.
2. The block's bytes, extracted mechanically from the issued prompt to a scratch `step-04.sh` (113 bytes, sha256 `4e0888f7a1e299423975091ede47b694b6959e2631f78662eb8285d59b5f656f`), run as `bash step-04.sh` from the worktree root — exit 0; stderr empty.
3. Context (read-only): `edd2f1e` resolves to `edd2f1e522b592258911e83f0fdd9c1920883049`, an ancestor of HEAD (`git merge-base --is-ancestor` exit 0); `git diff --quiet HEAD -- orchestrate/templates/00-READBEFORE.md` exit 0, so the file measured is the build's committed template.

## Output tail

```text
[stdout]
63095
15295
[stderr]
(empty)
[exit status of bash step-04.sh] 0
```

## Verdict

PASS — the base reads 63095 as stated, and 15295 is at most half of it (31547.5): the template is 24.2% of its base size.
