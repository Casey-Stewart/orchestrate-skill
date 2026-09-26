# C1 step 03 (revision 1)

- Integration SHA: f770be16140a0e4719886e6475d7d0306ca43ac2
- Step revision tested: 1
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD f770be1, clean before the run)
- Section 3: One copy of the procedure — the slimmed contract (B01). Inputs: I-03.

## Do

Render an implementer prompt from the fixture ledger built from the slimmed templates, then look for the two Git-model facts in it:

```bash
git clone .agents/changes/OS-20260925-slim-contract-pack/evidence/C1/inputs/issue-001/i03.bundle ../c1-scratch/i03
node orchestrate/tools/prompt.mjs --ledger ../c1-scratch/i03/.agents/changes/OS-20260101-fixture --role implementer --batch B01 --facts ../c1-scratch/i03/facts.json --out ../c1-scratch/prompts
grep -oh -e "chore/fixture-ledger" -e "npm ci --no-audit" ../c1-scratch/prompts/*.md | sort -u
```

## Pass

The render prints one line PROMPT <path> NONCE <nonce> and exits 0; the grep prints exactly two lines, chore/fixture-ledger (the integration branch) and npm ci --no-audit (the per-worktree setup).

Aside: Reset: rm -rf ../c1-scratch/i03 ../c1-scratch/prompts.

## Commands run and exit codes

1. Input check, I-03 — `stat -c %s` and `sha256sum` on `evidence/C1/inputs/issue-001/i03.bundle` (in place): exit 0, 10130 bytes, sha256 `b540f4febe1e4ee8a93f0e3a6497b83176f5621d44f4bf65873543a08a2c33cc` — both equal the registry. `git bundle list-heads` on it: exit 0, HEAD `34254f5696044016a8fa784692f74f79a7f919c4` = `shas.json` i03.head (`shas.json` itself: 445 bytes, sha256 `ff50866259c7db7597884d03677bf6d0523b45070b7d634c020a902d5b33e11b`, as the validation record states).
2. `mkdir -p ../c1-scratch` (fresh; it did not exist) — exit 0.
3. The block's bytes, extracted mechanically from the issued prompt to a scratch `step-03.sh` (403 bytes, sha256 `db29e68c62432421b6142bf5c300c6f6e93382d7f0d577e88808ec99aa94e3f2`), run as `bash step-03.sh` from the worktree root — exit 0 (the status of the last pipeline). It was run under `strace -f -e trace=execve,exit_group` writing only to a log outside the worktree, so the render's own exit status is observed without altering the block or its stdout/stderr.
4. Per-process exit statuses from that trace: `git clone` 0 (children `index-pack` 0, `rev-list` 0); `node orchestrate/tools/prompt.mjs …` (pid 2771152) `exit_group(0)`, exited with 0; `grep -oh …` 0, given exactly one file, `../c1-scratch/prompts/OS-20260101-fixture-B01-implementer-7de5b477f8d3.md`; `sort -u` 0.
5. Corroboration (read-only, before the reset): `grep -n` in the rendered prompt puts `npm ci --no-audit` at line 5 ("Setup first: npm ci --no-audit.") and `chore/fixture-ledger` at lines 70 and 103 (the merge target and the `git diff … chore/fixture-ledger...HEAD` base); the i03 clone was still clean at `34254f5` after the render.

## Output tail

```text
[stdout]
PROMPT /home/timetotilt/worktrees/os925/c1-scratch/prompts/OS-20260101-fixture-B01-implementer-7de5b477f8d3.md NONCE 50623c068c52
chore/fixture-ledger
npm ci --no-audit
[stderr]
Cloning into '../c1-scratch/i03'...
[exit status of bash step-03.sh] 0
[prompt.mjs process, from the trace] exited with 0
```

## Reset (applied after this file was first written)

`rm -rf ../c1-scratch/i03 ../c1-scratch/prompts` from the worktree root — exit 0; `test -e` then reports both paths GONE, and `../c1-scratch` holds 0 entries.

## Verdict

PASS — the render printed exactly one line `PROMPT <path> NONCE 50623c068c52` and exited 0; grep printed exactly the two lines `chore/fixture-ledger` and `npm ci --no-audit`.
