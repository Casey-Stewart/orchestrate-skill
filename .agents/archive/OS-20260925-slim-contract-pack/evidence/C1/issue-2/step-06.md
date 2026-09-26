# C1 issue 2 step 06 (revision 2)

- Integration SHA: c83ec7d667accc20a8339ac3fd51591609d675e3
- Step revision tested: 2
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD 321b2be, a ledger-only commit on the build: `git merge-base --is-ancestor` exit 0, and `git diff --name-only c83ec7d..HEAD -- . ":(exclude).agents/"` printed nothing)
- Shell: the only inherited `GIT_*` variable was `GIT_EDITOR=true`; `FORCE_COLOR` and `NO_COLOR` unset; both streams captured to files, not a TTY.
- Section 4: Tool CLIs through any linked path; git environment scrubbed (B02). Inputs: none.

## Do

Link the skill directory beside the checkout and run every tool's --help through the real path and through the link, comparing output and exit code:

```bash
ln -s "$PWD/orchestrate" ../c1-scratch/orch-link
for f in orchestrate/tools/*.mjs; do n=$(basename "$f"); a=$(node "$f" --help 2>&1; echo "exit $?"); b=$(node "../c1-scratch/orch-link/tools/$n" --help 2>&1; echo "exit $?"); if [ "$a" = "$b" ]; then echo "SAME $n ${#a}"; else echo "DIFF $n"; fi; done
```

## Pass

One line per file in orchestrate/tools/, every one SAME. The nine CLIs (build-smoke-page, check-fence, check-ledger, git-evidence, mutate, prompt, prose-only-diff, run-at-ref, validate) show a length in the hundreds or thousands; the two libraries (ledger-parse, smoke-inputs) show 6, their output being only exit 0.

Aside: Revision 2 (issue 2): text unchanged; re-verified on this build because B04's fix-up changed orchestrate/tools/prose-only-diff.mjs. On the ledger base every link run printed nothing and exited 0 — BL-028. Reset: rm ../c1-scratch/orch-link.

## Commands run and exit codes

1. Input check: none — this step names no issued input. Immediately before the run, `find orchestrate/tools -mindepth 1` listed 11 entries, all regular `.mjs` files: the nine CLIs and the two libraries the Pass names, nothing else. `../c1-scratch` held 0 entries.
2. The block's bytes, extracted mechanically from the issued prompt (its lines 41–44) to a scratch `step-06.sh` (301 bytes, sha256 `43dd4b5a5cbe85f66ec92912c200378e6ec220d66f9ab2c1cfaa38da3abf7878`, byte-identical to issue 1's block; no backslash, control or non-ASCII byte), run as `bash step-06.sh` from the worktree root — exit 0; stderr empty.
3. Corroboration (a separate scratch loop, after the step and before the reset, with the same two invocations per tool, printing each captured string's last line, length and a SHA-256 prefix): `readlink ../c1-scratch/orch-link` = `/home/timetotilt/worktrees/os925/int/orchestrate`, and `test -L` holds. All 11 tools give the same length and hash on both paths, and the lengths equal the step's. Both libraries print exactly `exit 0` on both paths, so their 6 is `exit 0`, not another six-character status. Eight CLIs end `exit 0` on both paths. `build-smoke-page.mjs` ends `exit 2` on both paths: it rejects `--help` ("Unknown option '--help'. …") and prints its `usage:` line, as in issue 1. The Pass does not require exit 0 for a CLI, and the identical 274-character error through the link shows that its entry point ran there. `prose-only-diff.mjs`, the file B04's fix-up changed, gives the same 1009-character help through the link. After the loop, the worktree's `git status --porcelain` showed only the untracked evidence directory.

## Output tail

```text
[stdout]
SAME build-smoke-page.mjs 274
SAME check-fence.mjs 387
SAME check-ledger.mjs 306
SAME git-evidence.mjs 563
SAME ledger-parse.mjs 6
SAME mutate.mjs 2906
SAME prompt.mjs 1251
SAME prose-only-diff.mjs 1009
SAME run-at-ref.mjs 840
SAME smoke-inputs.mjs 6
SAME validate.mjs 2481
[stderr]
(empty)
[exit status of bash step-06.sh] 0
```

## Reset (applied after this file was first written)

`rm ../c1-scratch/orch-link` from the worktree root — exit 0; `test -e` and `test -L` then both exit 1 (GONE). The link's target is untouched: `orchestrate/tools/` still holds 11 entries and `git status --porcelain -- orchestrate/` prints nothing. `../c1-scratch` holds 0 entries.

## Verdict

PASS — 11 lines, one per file in orchestrate/tools/, every one SAME; the nine CLIs show 274–2906 and the two libraries show 6, whose output is only `exit 0`.
