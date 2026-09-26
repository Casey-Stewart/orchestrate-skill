# C1 issue 2 step 12 (revision 2)

- Integration SHA: c83ec7d667accc20a8339ac3fd51591609d675e3
- Step revision tested: 2
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD 321b2be, a ledger-only commit on the build: `git merge-base --is-ancestor` exit 0, and `git diff --name-only c83ec7d..HEAD -- . ":(exclude).agents/"` printed nothing)
- Shell: the only inherited `GIT_*` variable was `GIT_EDITOR=true`; `FORCE_COLOR` and `NO_COLOR` unset; both streams captured to files, not a TTY.
- Section 6: The prose-only polish classifier (B04). Inputs: I-01.

## Do

```bash
git clone .agents/changes/OS-20260925-slim-contract-pack/evidence/C1/inputs/issue-001/i01.bundle ../c1-scratch/i01
node orchestrate/tools/prose-only-diff.mjs --repo ../c1-scratch/i01 --base 7427c9b63406e807c3ea648aa233a39a7d459ce8 --head 668364a99522c3fb8c69082bdee7ab38ffe36671
echo $?
```

## Pass

Prints PROSE-ONLY 1 file(s), and the echo prints 0.

Aside: Revision 2 (issue 2): text unchanged; re-verified on this build because B04's fix-up changed orchestrate/tools/prose-only-diff.mjs.

## Commands run and exit codes

1. Input check, I-01, immediately before the run (read in place): `stat -c %s` exit 0 gave 1170 bytes and `sha256sum` exit 0 gave `c8a0a533230356624fe18d96677151ba0de7754880764c1eba4c5e3118a7ad59`, both equal to the registry. `git hash-object` on the file equals the blob at HEAD (`7d402db…`) and `git status --porcelain` on it printed nothing. `git bundle list-heads` exit 0: HEAD and the bundle's own `refs/heads/main` are both `710738e58b6311f5a6195bcbe9899f69c5fdd33d` = `shas.json` i01.c2; the step's `--base` and `--head` equal `shas.json` i01.c0 and i01.c1. `../c1-scratch` held 0 entries.
2. The block's bytes, extracted mechanically from the issued prompt (its lines 50–54) to a scratch `step-12.sh` (287 bytes, sha256 `5fce8473c014b291d1e7223317f2027494bd8fb12962e2fc0296e1277dcdf9a3`, byte-identical to issue 1's block; no backslash, control or non-ASCII byte), run as `bash step-12.sh` from the worktree root — exit 0 (the echo's status); the classifier's own status is the `0` the echo printed. Stderr carried only git clone's line.
3. Corroboration (read-only, on the scratch clone, after the run): the clone holds exactly c0 `7427c9b…` → c1 `668364a…` → c2 `710738e…` (HEAD), each holding only `invoice.mjs`. `git diff` c0→c1 touches only `invoice.mjs` (4+/4−), and every changed line is comment text: the `//` header line, the two-line `/* … */` block, and the trailing `//` comment after `let sum = 0;`, whose code part is unchanged. No changed comment carries a tool directive. Clone `git status --porcelain` empty after the run; the worktree's shows only the untracked evidence directory.

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
