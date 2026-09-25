# C1 re-issue — the new steps' "before the fix" results, observed on the previously tested build

- Build: `450d7e970e935bdd7b93b3acc4516b996fca59e8` (the build of C1 issue 1, before both fix-ups), in a temporary
  detached worktree, run 2026-09-25 on the Linux workstation (Linux 7.0.0-31-generic; node v24.20.0; git 2.53.0),
  against the issue-002 inputs (`evidence/C1/inputs/issue-002/`), logs under the session scratchpad.
- Purpose: every "(Before the fix: …)" clause in steps 15–19 and the re-issue's canary are read from the old build,
  not assumed.

| Step | Command (old build) | Exit | Output |
|---|---|---|---|
| 15 | `validate.mjs --spec I-10/spec.json --cwd I-10` | 0 | `PASS tests 0/1 (0s)` |
| 16 | `validate.mjs --spec I-11/spec.json --cwd I-11` | 0 | `PASS tests 2/2 (0s)` |
| 17 | `mutate.mjs … --mutations I-12/muts-a.json --validate I-12/validate-a.json` | 1 | `CONTROL PASS PASS tests 0/1 (0s)` / `SURVIVED a1` / `MUTATE 0 killed, 1 survived, 0 other` |
| 18 | `mutate.mjs … --mutations I-12/muts-b.json --validate I-12/validate-b.json` | 1 | `CONTROL PASS PASS tests 1/1 (0s)` / `SURVIVED e1` / `MUTATE 0 killed, 1 survived, 0 other` |
| 19 | `mutate.mjs … --mutations I-12/muts-f.json --validate I-12/validate-f.json` | 1 | `CONTROL PASS PASS tests 2/2 (0s)` / `SURVIVED f1` / `MUTATE 0 killed, 1 survived, 0 other` |

The fixture clone was a fresh `git clone` of `I-12/fixture.bundle`; the temporary worktree was removed afterwards.
