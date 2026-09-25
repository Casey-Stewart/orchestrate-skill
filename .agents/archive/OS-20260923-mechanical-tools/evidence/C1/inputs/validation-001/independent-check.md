# C1 inputs — independent check

Issue: `.agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001` · tip `382426bad07dc8b370f075650cb001b4cc8afefc` · 2026-09-24T23:35:59.838Z
Environment: Linux 7.0.0-31-generic; node v24.20.0; git version 2.53.0; PowerShell 7.6.5

Command: `node .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/validate-c1-inputs.mjs .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/issue-001 .agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/validation-001` — result: ALL PASS (24/24)

| Input | Check | Result | Observed |
|---|---|---|---|
| I-01 | `node --test one-fails.test.cjs` run directly: exit 1, 1 pass, 1 fail | PASS | exit 1, pass 1, fail 1 |
| I-01 | spec.json: one argv step named `tests`, parser `node`, running that file | PASS | {"name":"tests","argv":["node","--test","--test-reporter=spec","one-fails.test.cjs"],"parser":"node"} |
| I-02 | spec.json: one `pwsh` shell step named `tests`, parser `node` | PASS | name tests, shell pwsh, parser node |
| I-02 | its script is the contract's validation recipe, byte for byte | PASS | 6 lines |
| I-02 | the recipe run directly on the tip exits 0 | PASS | exit 0, pass 497, fail 0 |
| I-03 | holds exactly the ledger's top-level Markdown files | PASS | 00-READBEFORE.md, 00-request.md, 01-plan.md, 02-batches-01-validate-wrapper.md, 02-batches-02-ledger-parser.md, 02-batches-03-contract-tool-wiring.md, 02-batches-04-prompt-renderer.md, 02-batches-05-mutation-harness.md, LOG.md, PROGRESS.md |
| I-03 | a diff against the tip copy shows exactly one line: B02's Files line, one path shorter | PASS | 02-batches-02-ledger-parser.md:8 |
| skill | the tip's `orchestrate/` is clean in the worktree (so git's blobs are the bytes on disk) | PASS | clean |
| I-04 | one line in the template's documented form `**Skill**: `<dir>` · sha256 `<64 hex>``, pinning `orchestrate` with 64 zeros | PASS | "**Skill**: `orchestrate` · sha256 `0000000000000000000000000000000000000000000000000000000000000000`\n" |
| I-04 | the pinned hash differs from the real one | PASS | real 4680cd3687b9236a272e8bbee99b9db319e97ea053acc5963828ad7d058d3170 |
| I-05 | no `{{` outside fenced and inline code spans in any Markdown file | PASS | 6 files clean |
| I-05 | the pin names `orchestrate` and equals the hash recomputed independently from git's 23 blobs | PASS | pin 4680cd3687b9236a272e8bbee99b9db319e97ea053acc5963828ad7d058d3170, recomputed 4680cd3687b9236a272e8bbee99b9db319e97ea053acc5963828ad7d058d3170 |
| I-05 | one batch file `02-batches-01-*.md`, a `validate.json` that parses with a `steps` array | PASS | 00-READBEFORE.md, 00-request.md, 01-plan.md, 02-batches-01-smoke-batch.md, LOG.md, PROGRESS.md, validate.json |
| I-06 | exactly one character differs from I-05's contract, and it is a hex digit of the pin | PASS | length 62728/62728, 1 differing |
| I-07 | parses as JSON; its key set equals the implementer role's facts as `prompt.mjs --help` lists them | PASS | keys guardrails,repoPath,scratchpadPath,worktreePath, help guardrails,repoPath,scratchpadPath,worktreePath |
| I-08 | differs from I-07 by the key `worktreePath` only | PASS | ["repoPath","scratchpadPath","guardrails"] |
| I-09 | `git bundle verify` passes (run inside the fresh clone: verify needs a repository) | PASS | The bundle uses this hash algorithm: sha1 |
| I-09 | a fresh clone checks out `main` with two commits | PASS | clone exit 0, HEAD on main, 2 commits |
| I-09 | the README names both commits' SHAs | PASS | HEAD 1d478f6, HEAD~1 f0e2c34 |
| I-09 | the suite run directly at HEAD passes 2/2 | PASS | exit 0, pass 2, fail 0 |
| I-09 | at HEAD: m3's find is absent (grep exit 1); m1's and m2's each occur exactly once | PASS | grep exit 1 |
| I-09 | the suite run directly at HEAD~1 passes 1/1 | PASS | exit 0, pass 1, fail 0 |
| I-09 | at HEAD~1: m3's find is absent (grep exit 1); m1's and m2's each occur exactly once | PASS | grep exit 1 |
| I-09 | the generator script is issued beside the bundle, byte-identical to the committed generator | PASS | compared raw bytes |
