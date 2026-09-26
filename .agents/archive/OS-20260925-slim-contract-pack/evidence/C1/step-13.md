# C1 step 13 (revision 1)

- Integration SHA: f770be16140a0e4719886e6475d7d0306ca43ac2
- Step revision tested: 1
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD f770be1)
- Section 6: The prose-only polish classifier (B04). Inputs: I-01, through the `../c1-scratch/i01` clone step 12 made.

## Do

```bash
node orchestrate/tools/prose-only-diff.mjs --repo ../c1-scratch/i01 --base 668364a99522c3fb8c69082bdee7ab38ffe36671 --head 710738e58b6311f5a6195bcbe9899f69c5fdd33d
echo $?
```

## Pass

Prints CODE invoice.mjs, and the echo prints 1.

Aside: Reset: rm -rf ../c1-scratch/i01.

## Commands run and exit codes

1. Input check, I-01: verified immediately before step 12 created the clone (1170 bytes, sha256 `c8a0a533230356624fe18d96677151ba0de7754880764c1eba4c5e3118a7ad59`, HEAD `710738e…`; the c0 → c1 → c2 chain matches `shas.json`; see step-12.md). The clone was clean at HEAD `710738e…` after step 12 and again after this run.
2. The block's bytes, extracted mechanically from the issued prompt to a scratch `step-13.sh` (172 bytes, sha256 `a694bf36a9789aa9668db2591ce803d195d61146f28d7c4a91b27d6019346e45`), run as `bash step-13.sh` from the worktree root, after step 12 — exit 0 (the echo's status); the classifier's own status is the `1` the echo printed; stderr empty.
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

`rm -rf ../c1-scratch/i01` from the worktree root — exit 0; `test -e` then reports the path GONE, and `../c1-scratch` holds 0 entries.

## Verdict

PASS — the classifier printed `CODE invoice.mjs` and the echo printed 1.
