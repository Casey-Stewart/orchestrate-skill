# C1 inputs — independent validation (issue 001)

- Generated from the integration tip `220ad6c88f427b681e7d4b2bf0f8dcd0847e816b` (build under test `bf055ce` plus ledger-only commits), 2026-09-26T04:45Z, from the integration worktree root.
- Environment: Linux 7.0.0-31-generic; node v24.20.0; git version 2.53.0; bash 5.3.9(1)-release.
- Generation A: `node .agents/changes/OS-20260925-slim-contract-pack/evidence/C1/inputs/generate-c1-inputs.mjs .agents/changes/OS-20260925-slim-contract-pack/evidence/C1/inputs/issue-001` — exit 0. Generation B: the same command to a fresh scratch directory — exit 0. The generator refuses an existing output directory.

| File | SHA-256 (A = B) | Bytes |
|---|---|---|
| `issue-001/i01.bundle` | `c8a0a533230356624fe18d96677151ba0de7754880764c1eba4c5e3118a7ad59` | 1170 |
| `issue-001/i02.bundle` | `e5753798a755be364af5e2640976b8e45795bca75abf05b37848151311bb3de8` | 425 |
| `issue-001/i03.bundle` | `b540f4febe1e4ee8a93f0e3a6497b83176f5621d44f4bf65873543a08a2c33cc` | 10130 |
| `issue-001/i04.bundle` | `abe5894f6c23509ae80c58191c32f7beef68e9972befeafc05cf858f557c4efb` | 780 |
| `issue-001/shas.json` | `ff50866259c7db7597884d03677bf6d0523b45070b7d634c020a902d5b33e11b` | 445 |

Every file of generation A equals generation B byte for byte (commits carry fixed identities and dates; the child git sees no inherited `GIT_*` variable and no user or system config).

## Independent check

Command: `node .agents/changes/OS-20260925-slim-contract-pack/evidence/C1/inputs/validate-c1-inputs.mjs .agents/changes/OS-20260925-slim-contract-pack/evidence/C1/inputs/issue-001` — exit **0**. It clones each bundle into a temporary directory and checks content with plain git and string comparison, never with a tool the steps test (I-03's parse is the fixture's own stated requirement).

```text
OK   i01 bundle verifies — sha256 c8a0a533230356624fe18d96677151ba0de7754880764c1eba4c5e3118a7ad59
OK   i02 bundle verifies — sha256 e5753798a755be364af5e2640976b8e45795bca75abf05b37848151311bb3de8
OK   i03 bundle verifies — sha256 b540f4febe1e4ee8a93f0e3a6497b83176f5621d44f4bf65873543a08a2c33cc
OK   i04 bundle verifies — sha256 abe5894f6c23509ae80c58191c32f7beef68e9972befeafc05cf858f557c4efb
OK   i01 clones
OK   i01 checkout holds invoice.mjs
OK   i01 has exactly three commits c0 → c1 → c2 — 7427c9b63406e807c3ea648aa233a39a7d459ce8 c0: invoice total | 668364a99522c3fb8c69082bdee7ab38ffe36671 c1: comment-only rewording, both comment forms | 710738e58b6311f5a6195bcbe9899f69c5fdd33d c2: one-character code change
OK   i01 every commit holds only invoice.mjs
OK   i01 c0 → c1 changes comments only (both // and /* */ forms)
OK   i01 c1 → c2 changes one code line by one character — [["  return sum / 100;","  return sum / 10;"]]
OK   i01 carries no tool-directive or JSDoc comment
OK   i02 clones
OK   i02 checkout holds the decoy file
OK   i02 has one commit
OK   i02 holds only the distinctive path
OK   i03 clones
OK   i03 checkout holds the ledger directory
OK   i03 ledger holds exactly the six files — 00-READBEFORE.md,00-request.md,01-plan.md,02-batches-01-fixture-batch.md,LOG.md,PROGRESS.md
OK   i03 no {{ or <!-- outside code spans
OK   i03 contract is the slimmed template (under 20000 bytes, Skill source line present) — 15486 bytes
OK   i03 contract names the integration branch and the setup
OK   i03 check-ledger parse prints PARSE OK 1 batches — "PARSE OK 1 batches\n"
OK   i03 facts.json holds exactly the implementer keys
OK   i03 CLAUDE.md carries the guardrails heading
OK   i04 clones
OK   i04 has exactly two commits c0 → c1 — fec96e636ff0ed283a8e4f7732adcc27e458063a 9977f52d70d6080afe1069f0e7a4417a1cc0b4e0
OK   i04 both commits hold only lib/token.mjs
OK   i04 c0 → c1 appends exactly " // gitleaks:allow" to the one code line — [["export const TOKEN_HEADER = 'x-client-token';","export const TOKEN_HEADER = 'x-client-token'; // gitleaks:allow"]]
OK   i04 carries no secret-shaped string
VALID every check held
```

## Corrupt control

A copy of `issue-001` whose `i01.bundle` is truncated to its first 900 bytes, same command — exit **1**:

```text
FAIL i01 clones
INVALID 1 check(s) failed
```

`git bundle verify` alone passes a truncated bundle (it checks the header and prerequisites, not the pack's completeness); the clone step is what rejects it, so the validator's clone checks carry the byte identity's semantics.
