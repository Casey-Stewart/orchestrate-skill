# C1 issue 2 step 13 (revision 2)

- Integration SHA: c83ec7d667accc20a8339ac3fd51591609d675e3
- Step revision tested: 2
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD 321b2be, a ledger-only commit on the build: `git merge-base --is-ancestor` exit 0, and `git diff --name-only c83ec7d..HEAD -- . ":(exclude).agents/"` printed nothing)
- Shell: the only inherited `GIT_*` variable was `GIT_EDITOR=true`; `FORCE_COLOR` and `NO_COLOR` unset; both streams captured to files, not a TTY.
- Section 6: The prose-only polish classifier (B04). Inputs: I-01, through the `../c1-scratch/i01` clone step 12 made.

## Do

```bash
node orchestrate/tools/prose-only-diff.mjs --repo ../c1-scratch/i01 --base 668364a99522c3fb8c69082bdee7ab38ffe36671 --head 710738e58b6311f5a6195bcbe9899f69c5fdd33d
echo $?
```

## Pass

Prints CODE invoice.mjs, and the echo prints 1.

Aside: Revision 2 (issue 2): text unchanged; re-verified on this build because B04's fix-up changed orchestrate/tools/prose-only-diff.mjs. Reset: rm -rf ../c1-scratch/i01.

## Commands run and exit codes

1. Input check, I-01: verified immediately before step 12 created the clone (1170 bytes, sha256 `c8a0a533230356624fe18d96677151ba0de7754880764c1eba4c5e3118a7ad59`, both equal to the registry; bundle HEAD `710738e…` = `shas.json` i01.c2; see step-12.md). The step's `--base` and `--head` equal `shas.json` i01.c1 and i01.c2. The clone was clean at HEAD `710738e…` immediately before this run and again after it.
2. The block's bytes, extracted mechanically from the issued prompt (its lines 61–64) to a scratch `step-13.sh` (172 bytes, sha256 `a694bf36a9789aa9668db2591ce803d195d61146f28d7c4a91b27d6019346e45`, byte-identical to issue 1's block; no backslash, control or non-ASCII byte), run as `bash step-13.sh` from the worktree root, after step 12 — exit 0 (the echo's status); the classifier's own status is the `1` the echo printed; stderr empty.
3. Corroboration (read-only, on the scratch clone): `git diff` c1→c2 changes exactly one line of `invoice.mjs` (1+/1−), a code line: `  return sum / 100;` → `  return sum / 10;`.

## Output tail

```text
[stdout]
CODE invoice.mjs
1
[stderr]
(empty)
[exit status of bash step-13.sh] 0
```

## Reset (applied after this file was first written; also closes step 12's clone)

`rm -rf ../c1-scratch/i01` from the worktree root — exit 0; `test -e` then exits 1 (GONE), `../c1-scratch` holds 0 entries, and the worktree's `git status --porcelain` shows only this untracked evidence directory.

## Verdict

PASS — the classifier printed `CODE invoice.mjs` and the echo printed 1.
