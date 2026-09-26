# C1 step 10 (revision 1)

- Integration SHA: f770be16140a0e4719886e6475d7d0306ca43ac2
- Step revision tested: 1
- Environment: Linux 7.0.0-31-generic (x86_64); node v24.20.0; git version 2.53.0; GNU bash 5.3.9(1)-release
- Runner: agent (QA runner), from the integration worktree root /home/timetotilt/worktrees/os925/int (branch chore/slim-contract-pack-ledger, HEAD f770be1)
- Section 5: Conductor and agent budget rules (B03). Inputs: none.

## Do

```bash
grep -nE "^(effort|model):" .claude/agents/*.md
echo $?
```

## Pass

The grep prints nothing and the echo prints 1: no agent definition sets an effort or a model.

## Commands run and exit codes

1. Input check: none — this step names no issued input.
2. The block's bytes, extracted mechanically from the issued prompt to a scratch `step-10.sh` (56 bytes, sha256 `2db13ff341b446da5f3dcf935734f14e673d837aa6f621d96a72007656327935`), run as `bash step-10.sh` from the worktree root — exit 0 (the echo's status); grep's own status is the `1` the echo printed; stderr empty. The glob therefore matched real files: an unmatched glob would give grep status 2 and a stderr line.
3. Controls (read-only): the glob covers `implementer.md`, `qa-runner.md`, `reviewer.md` and `test-hunter.md`, and each file's frontmatter keys are exactly `name`, `description`, `tools`. The same pattern on a scratch file holding `model: opus` and `effort: high` lines prints both (exit 0), so it fires on the shape it guards. `git grep -nE "^(effort|model):" edd2f1e -- .claude/agents/` also exits 1: the base carried no such line either, so this check guards an absence rather than a change.

## Output tail

```text
[stdout]
1
[stderr]
(empty)
[exit status of bash step-10.sh] 0
```

## Verdict

PASS — grep printed nothing and the echo printed 1: none of the four agent definitions sets an effort or a model.
