# C1 step 12 (revision 1)

- Integration SHA: f770be16140a0e4719886e6475d7d0306ca43ac2
- Step revision tested: 1
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD f770be1)
- Section 6: The prose-only polish classifier (B04). Inputs: I-01.

## Do

```bash
git clone .agents/changes/OS-20260925-slim-contract-pack/evidence/C1/inputs/issue-001/i01.bundle ../c1-scratch/i01
node orchestrate/tools/prose-only-diff.mjs --repo ../c1-scratch/i01 --base 7427c9b63406e807c3ea648aa233a39a7d459ce8 --head 668364a99522c3fb8c69082bdee7ab38ffe36671
echo $?
```

## Pass

Prints PROSE-ONLY 1 file(s), and the echo prints 0.

## Commands run and exit codes

1. Input check, I-01, immediately before the run: `stat -c %s` and `sha256sum` on `evidence/C1/inputs/issue-001/i01.bundle` (read in place) exited 0 and gave 1170 bytes, sha256 `c8a0a533230356624fe18d96677151ba0de7754880764c1eba4c5e3118a7ad59`, both equal to the registry. `git bundle list-heads` exited 0 with HEAD `710738e58b6311f5a6195bcbe9899f69c5fdd33d` = `shas.json` i01.c2. Earlier, a throwaway clone under the runner's scratchpad (since deleted) showed exactly c0 `7427c9b…` → c1 `668364a…` → c2 `710738e…`, matching `shas.json`.
2. The block's bytes were extracted mechanically from the issued prompt to a scratch `step-12.sh` (287 bytes, sha256 `5fce8473c014b291d1e7223317f2027494bd8fb12962e2fc0296e1277dcdf9a3`) and run as `bash step-12.sh` from the worktree root. It exited 0 (the echo's status); the classifier's own status is the `0` the echo printed. Stderr carried only git clone's line.
3. Corroboration (read-only, on the scratch clone): `git diff` c0→c1 touches only `invoice.mjs` (4+/4−). Every changed line is comment text: the `//` header line, the two-line `/* … */` block, and the trailing `//` comment after `let sum = 0;`, whose code part is unchanged. After the run the clone was still clean at HEAD `710738e…`.

## Output tail

```text
[stdout]
PROSE-ONLY 1 file(s)
0
[stderr]
Cloning into '../c1-scratch/i01'...
[exit status of bash step-12.sh] 0
```

## Reset

None for this step: step 13 reads the `../c1-scratch/i01` clone, and step 13's Aside removes it (proof in step-13.md).

## Verdict

PASS — the classifier printed `PROSE-ONLY 1 file(s)` and the echo printed 0.
