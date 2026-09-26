# C1 issue 2 step 02 (revision 2)

- Integration SHA: c83ec7d667accc20a8339ac3fd51591609d675e3
- Step revision tested: 2
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD 321b2be, a ledger-only commit on the build: `git merge-base --is-ancestor` exit 0, and `git diff --name-only c83ec7d..HEAD -- . ":(exclude).agents/"` printed nothing)
- Shell: the only inherited `GIT_*` variable was `GIT_EDITOR=true`; `FORCE_COLOR` and `NO_COLOR` unset; both streams captured to files, not a TTY.
- Section 2: BL-046's named directives, now code (B04). Inputs: I-04.

## Do

```bash
git clone .agents/changes/OS-20260925-slim-contract-pack/evidence/C1/inputs/issue-001/i04.bundle ../c1-scratch/i04
node orchestrate/tools/prose-only-diff.mjs --repo ../c1-scratch/i04 --base fec96e636ff0ed283a8e4f7732adcc27e458063a --head 9977f52d70d6080afe1069f0e7a4417a1cc0b4e0
echo $?
```

## Pass

Prints CODE lib/token.mjs, and the echo prints 1: the appended // gitleaks:allow keeps the comment as code.

Aside: Revision 2 (issue 2): revision 1 reproduced the residual (PROSE-ONLY 1 file(s), exit 0) for your sign-off; your scope addition fixed it, so the step now verifies the fix and runs as an agent step. Reset: rm -rf ../c1-scratch/i04.

## Commands run and exit codes

1. Input check, I-04, immediately before the run (read in place): `stat -c %s` exit 0 gave 780 bytes and `sha256sum` exit 0 gave `abe5894f6c23509ae80c58191c32f7beef68e9972befeafc05cf858f557c4efb`, both equal to the registry. `git hash-object` on the file equals the blob at HEAD (`632f1e7…`) and `git status --porcelain` on it printed nothing. `git bundle list-heads` exit 0: HEAD and the bundle's own `refs/heads/main` are both `9977f52d70d6080afe1069f0e7a4417a1cc0b4e0` = `shas.json` i04.c1; the step's `--base` and `--head` equal `shas.json` i04.c0 and i04.c1.
2. `test -e ../c1-scratch` exit 1 (absent), then `mkdir -p ../c1-scratch` exit 0 (empty).
3. The block's bytes, extracted mechanically from the issued prompt (its lines 30–34) to a scratch `step-02.sh` (287 bytes, sha256 `9e187a7aaf3a4e918bdbd38aafe018f4367987f03a3134ec811330083e340347`; no backslash, control or non-ASCII byte), run as `bash step-02.sh` from the worktree root — exit 0 (the echo's status); the classifier's own status is the `1` the echo printed. Stderr carried only git clone's line.
4. Corroboration (read-only, on the scratch clone, after the run): the clone holds exactly c0 `fec96e6…` → c1 `9977f52…` (HEAD), both commits hold only `lib/token.mjs`, and `git diff` c0→c1 changes one line (1+/1−): `export const TOKEN_HEADER = 'x-client-token';` → `export const TOKEN_HEADER = 'x-client-token'; // gitleaks:allow`. The code part is unchanged, so the CODE verdict can come only from the appended directive comment. Clone and worktree `git status --porcelain` both empty after the run.

## Output tail

```text
[stdout]
CODE lib/token.mjs
1
[stderr]
Cloning into '../c1-scratch/i04'...
[exit status of bash step-02.sh] 0
```

## Reset (applied after this file was first written)

`rm -rf ../c1-scratch/i04` from the worktree root — exit 0; `test -e` then exits 1 (GONE), `../c1-scratch` holds 0 entries, and the worktree's `git status --porcelain` shows only this untracked evidence directory.

## Verdict

PASS — the classifier printed `CODE lib/token.mjs` and the echo printed 1, on an input whose only change is the appended `// gitleaks:allow`.
