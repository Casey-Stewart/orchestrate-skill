# C1 step 00 — input integrity check

- Integration SHA: 450d7e970e935bdd7b93b3acc4516b996fca59e8 (branch chore/mechanical-tools-ledger; `git rev-parse HEAD` verified before anything else)
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash.
- Registry: `.agents/changes/OS-20260923-mechanical-tools/evidence/C1/inputs/validation-001/registry.json` (30 entries)

## Commands

1. `rm -rf ../c1-scratch && mkdir -p ../c1-scratch` (from the worktree root) — exit 0
2. An inline `node -e` script that, for every registry entry, read the file at `path` (and the entry's `validation.path`)
   relative to `.agents/changes/OS-20260923-mechanical-tools/`, computed sha256 of the raw bytes and the byte length, and
   compared both to the registry — exit 0

## Result

30 entries, 31 distinct files (30 inputs + the shared `validation-001/independent-check.md`), **0 mismatches**; every
digest and size matched. Output tail:

```
OK  evidence/C1/inputs/issue-001/I-06/00-READBEFORE.md 3fef0b9b93b590c32d7acd3cafd224c03b6670f498fcb79826e3bd2c8c996e95 63388
OK  evidence/C1/inputs/issue-001/I-07/facts.json 76883909c2313b473e34c0f8226502d7ce8673636e0bf4d3109ece75fb8aae83 143
OK  evidence/C1/inputs/issue-001/I-08/facts.json 683727eb3cc20eefb5e64f540127226ddfab87158ea4d4203ef617337e8b98b4 103
OK  evidence/C1/inputs/issue-001/I-09/README.md 98fb81be97913b2b77eddd68ddcf85d47cc54e0db7dc60c063ea2639013f5b17 1015
OK  evidence/C1/inputs/issue-001/I-09/fixture.bundle ad2ed35f1981cf27fa16668620a98275e7d14a1c0089f31b852eeef71d693f57 854
OK  evidence/C1/inputs/issue-001/I-09/generate-c1-inputs.mjs 06fd432ceaad8de24f572f47759f8d5dcd8d65f1a117b852e3343f374edf96c1 10832
OK  evidence/C1/inputs/issue-001/I-09/muts-bad-anchor.json 028b3ee05e6098657858bf484e219f9bec841662802ef023b1b067dd3ae0bb1f 128
OK  evidence/C1/inputs/issue-001/I-09/muts.json 1e3e31ec2dd9df563c1d9a2cb4bb53b0c38ae2890029c63b74134cca9879795b 276
OK  evidence/C1/inputs/issue-001/I-09/validate.json b70e02d85ab780829f7c1d7ae54a719cb8eb4c83738b3bab3919c9e4d17d0fd6 193
entries 30 distinct files 31 mismatches 0
```

Files present under `evidence/C1/inputs/` but not listed in the registry (not inputs the steps use): `generate-c1-inputs.mjs`,
`validate-c1-inputs.mjs` (both at `inputs/` top level) and `validation-001/registry.json` itself.

## Verdict

PASS — every registry digest and size matches the raw bytes on disk.
