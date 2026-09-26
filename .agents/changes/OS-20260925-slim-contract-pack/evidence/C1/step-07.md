# C1 step 07 (revision 1)

- Integration SHA: f770be16140a0e4719886e6475d7d0306ca43ac2
- Step revision tested: 1
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD f770be1)
- Section 4: Tool CLIs through any linked path; git environment scrubbed (B02). Inputs: I-02.

## Do

Clone the decoy repository, show that plain git follows a GIT_DIR pointed at it, then run the evidence tool under the same GIT_DIR:

```bash
git clone .agents/changes/OS-20260925-slim-contract-pack/evidence/C1/inputs/issue-001/i02.bundle ../c1-scratch/decoy
GIT_DIR=../c1-scratch/decoy/.git git ls-files
GIT_DIR=../c1-scratch/decoy/.git node orchestrate/tools/git-evidence.mjs worktrees --repo . > ../c1-scratch/decoy-evidence.json
echo $?
grep -c "c1-scratch/decoy" ../c1-scratch/decoy-evidence.json
grep -c "$PWD" ../c1-scratch/decoy-evidence.json
```

## Pass

Plain git prints DECOY-REPOSITORY-zq7x.txt (the plant is live); the evidence run exits 0 (the echo prints 0); the first grep prints 0 — the decoy's path appears nowhere in the evidence — and the second prints 1 or more: the evidence describes this checkout.

Aside: Reset: rm -rf ../c1-scratch/decoy ../c1-scratch/decoy-evidence.json.

## Commands run and exit codes

1. Input check, I-02, immediately before the run — `stat -c %s` and `sha256sum` on `evidence/C1/inputs/issue-001/i02.bundle` (in place): exit 0, 425 bytes, sha256 `e5753798a755be364af5e2640976b8e45795bca75abf05b37848151311bb3de8`, both equal to the registry; `git bundle list-heads`: exit 0, HEAD `83f0eeee907c072fff7b848d95c1c0deab8a8740` = `shas.json` i02.head.
2. The block's bytes, extracted mechanically from the issued prompt to a scratch `step-07.sh` (409 bytes, sha256 `56d196d9f5319b6b9a95dd8042b59071b95225da14af6f312bd2105d24b7f4d4`), run as `bash step-07.sh` from the worktree root — exit 0 (the last grep's status). Per the block's own echo, the evidence run exited 0.
3. Corroboration (read-only, before the reset): `decoy-evidence.json` parses as JSON (1 line, 1136 bytes, so the second grep's count of 1 is the whole document): `"repo":"/home/timetotilt/worktrees/os925/int"`, `"completeness":"complete"`, `diagnostics` empty. Its worktrees are this repository's own: `/home/timetotilt/projects/orchestrate-skill` (edd2f1e, refs/heads/main) and `/home/timetotilt/worktrees/os925/int` (f770be1, refs/heads/chore/slim-contract-pack-ledger, its only untracked files being this runner's evidence files). `grep -ci decoy` on it prints 0.
4. Live control (scratch clone only): `GIT_DIR=../c1-scratch/decoy/.git git worktree list --porcelain` — exit 0, prints `worktree /home/timetotilt/worktrees/os925/c1-scratch/decoy`. Unscrubbed git therefore reports a path the first grep would count, so its 0 discriminates.

## Output tail

```text
[stdout]
DECOY-REPOSITORY-zq7x.txt
0
0
1
[stderr]
Cloning into '../c1-scratch/decoy'...
[exit status of bash step-07.sh] 0
```

## Reset (applied after this file was first written)

`rm -rf ../c1-scratch/decoy ../c1-scratch/decoy-evidence.json` from the worktree root — exit 0; `test -e` then reports both paths GONE, and `../c1-scratch` holds 0 entries.

## Verdict

PASS — plain git printed DECOY-REPOSITORY-zq7x.txt; the evidence run exited 0; the decoy path grep printed 0 and the `$PWD` grep printed 1.
