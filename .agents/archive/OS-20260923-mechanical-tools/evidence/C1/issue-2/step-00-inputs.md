# C1 issue 2 — step 00: input verification

- Build SHA: e681144416b2442344ae898ae12379d135347739 (worktree HEAD 85ec90e06dad92c9545b1f2d064f7cb8ac6b20ac, branch chore/mechanical-tools-ledger)
- Environment: CLI only — Linux 7.0, Node v24.20.0, git 2.53.0, PowerShell 7.6.5 as `pwsh`, bash
- Preconditions: `git merge-base --is-ancestor e681144… HEAD` exit 0; `git diff --name-only e681144…..HEAD -- . ":(exclude).agents/"` printed nothing; `git status --porcelain` shows only ` M .agents/changes/OS-20260923-mechanical-tools/smoke-c1.json` (orchestrator draft, left alone).
- Pre-existing file noticed in evidence/C1/issue-2/: `old-build-check.md` (not written by this runner; left untouched).
- validation-002/independent-check.md line 6 reads: result: ALL PASS (20/20)

Method: sha256 of raw bytes + byte length for every `path` and every `validation.path` in
evidence/C1/inputs/validation-001/registry.json (30 entries) and evidence/C1/inputs/validation-002/registry.json (14 entries);
paths relative to .agents/changes/OS-20260923-mechanical-tools/; duplicate validation-file rows collapsed. Exit code 0.

| registry | path | sha256 (actual) | size (actual) | result |
|---|---|---|---|---|
| validation-001 | evidence/C1/inputs/issue-001/I-01/one-fails.test.cjs | fd2135a42f5663fada76e5dc1eb954c1892ad18b03d6ce75b154650989a19010 | 234 | OK |
| validation-001 | evidence/C1/inputs/validation-001/independent-check.md | 7b2131cd36442a0aa071d763dad34cc751d140dbff325ae9f97916ce54d3e06f | 4101 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-01/spec.json | 04a8db71a2d3c0942a6f9abbb1b2323ce8d4bdeefae25e3aea9fb61a9eee9bfc | 199 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-02/spec.json | 049841ea0a1e4ac48bd72d3736b80ab98a8d339fe9bb9c02669d90354a15571d | 511 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-03/00-READBEFORE.md | b0c5d3d214d498e87a11167554c29fe6d834e3a94455874e51d985d026067cd6 | 72787 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-03/00-request.md | e18887a6c8fb62b93492405a6294f45a81cda435fdd1898882cf6a45ff21a8e0 | 3669 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-03/01-plan.md | b6797c49c134630eda900ddf641d612b19c3b360b1e284549a2b872b39eb1c42 | 12995 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-03/02-batches-01-validate-wrapper.md | 74ff698204bdd2407e5626ea64dadd867df4bda968a7c9e27fc63db3c47d6c94 | 15173 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-03/02-batches-02-ledger-parser.md | c0376afee4e903dbbfbfb5a99c2533d5d6373c5471e5978266aded2d1e11de14 | 14120 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-03/02-batches-03-contract-tool-wiring.md | aba4d5cd441dd3729793bea52b17c07128fb9eaaa4cac4e1113792ee62154862 | 17300 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-03/02-batches-04-prompt-renderer.md | 80546b449626062217bc23fb2c7f8a8fcafb2491224ed891dae694ae0dc6fe9a | 18023 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-03/02-batches-05-mutation-harness.md | 2549445db0265558b9b6e06460a508d656aaa542239b7e730fdc1cceaab28ce0 | 15847 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-03/LOG.md | 5106900d8b128ca61d137a086d84ee391aa49ac657f1c4cd6fcf320a391e7eac | 138979 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-03/PROGRESS.md | af884d053b59cf77f59badb283869424b6c82b6b52378958a7abc4c099186722 | 14891 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-04/00-READBEFORE.md | 986033d3ea457ee34e1ef6660ca4200a0661745a1a87523ee0becfef00875417 | 102 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-05/00-READBEFORE.md | 39bcee2de44d600dcbeaf5b8ac5ea70c9ae5e86caff6a72849ee207f580e04ae | 63388 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-05/00-request.md | 6bb630fceb909f8b1beba2a15bfcea2ce1e7789e2bb1fd88c395a9a058dc17ba | 122 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-05/01-plan.md | 3d00852adac3c78a65ba7ed7e7b25f9f811a7f43a0f39ecf6a6021913f205015 | 622 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-05/02-batches-01-smoke-batch.md | d8e9f4002618c5684c36f45811a81017185d878366dfcdb340ae7a3e9c679847 | 786 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-05/LOG.md | 524133edeb353ce4ce3a73155f2b7106f53671a2156c7ca09d22dc4f6ccffd94 | 510 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-05/PROGRESS.md | 31d16f94b26084f927fa091d8a9d4be2976ad864a023ec3805946b2f33ced3cc | 2322 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-05/validate.json | 733005c4029f1a94cf41733ded3a5ea9ad0de99f2ede75a53c6102e9e43d1a3a | 137 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-06/00-READBEFORE.md | 3fef0b9b93b590c32d7acd3cafd224c03b6670f498fcb79826e3bd2c8c996e95 | 63388 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-07/facts.json | 76883909c2313b473e34c0f8226502d7ce8673636e0bf4d3109ece75fb8aae83 | 143 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-08/facts.json | 683727eb3cc20eefb5e64f540127226ddfab87158ea4d4203ef617337e8b98b4 | 103 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-09/README.md | 98fb81be97913b2b77eddd68ddcf85d47cc54e0db7dc60c063ea2639013f5b17 | 1015 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-09/fixture.bundle | ad2ed35f1981cf27fa16668620a98275e7d14a1c0089f31b852eeef71d693f57 | 854 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-09/generate-c1-inputs.mjs | 06fd432ceaad8de24f572f47759f8d5dcd8d65f1a117b852e3343f374edf96c1 | 10832 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-09/muts-bad-anchor.json | 028b3ee05e6098657858bf484e219f9bec841662802ef023b1b067dd3ae0bb1f | 128 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-09/muts.json | 1e3e31ec2dd9df563c1d9a2cb4bb53b0c38ae2890029c63b74134cca9879795b | 276 | OK |
| validation-001 | evidence/C1/inputs/issue-001/I-09/validate.json | b70e02d85ab780829f7c1d7ae54a719cb8eb4c83738b3bab3919c9e4d17d0fd6 | 193 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-10/skip-only.test.cjs | 5547c7c9ccb3d9ed9cc864f0a4ac408ec0632738bd7260afcede18c8ba11a5c1 | 204 | OK |
| validation-002 | evidence/C1/inputs/validation-002/independent-check.md | 6e7d678d6ad0269a2d03f256267f5768ea1450224299833ef953acf17408a949 | 3277 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-10/spec.json | f5dd22c64a9a463b8801dde6a77f2ae99756e303547a7a82ce238efd27c7cf82 | 199 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-11/empty.test.cjs | d545b0e67ab46d623a8b85372893ed2dba783ea4865324cbaff715e7042eaa79 | 163 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-11/one.test.cjs | 389949089d02a267cccb648e8aae2accfc3876871dc6006630a7d57798247480 | 134 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-11/spec.json | 9303910fa59d6d51160bf0be92e94132aaa672e55665103d47d8a9c4b97c2edf | 219 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-12/README.md | 357626c7929f3384bb52fca91734004b4bc42ec41142c9593d60eba3a8ed2599 | 1070 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-12/fixture.bundle | 283664bbba97327858715d0be1fe3823bc4e2a006d758a656b60d68b16189e35 | 1051 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-12/generate-c1-inputs-002.mjs | 9771e8849ad081c157928f5705fb4ec1c5271ff0abf3d55b148268e487b6e529 | 6576 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-12/muts-a.json | b29b977449c487e45f2da98930e601223a43d739b0d068cfb0d98bc9408f50ac | 144 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-12/muts-b.json | 314f18a4843e89f18268e35b3b0d041cd6541f14396086571f6537fc42765e7b | 159 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-12/muts-f.json | 87f2d0cba176e5d618773be259adb4edb96adbab07dc9e32cd012541f0fda6dc | 158 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-12/validate-a.json | 7898184617707759532be66cb724917662fa08cf334b795516997db1462c014f | 197 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-12/validate-b.json | f0423a0924410eac6e4b793d765ab5d852d6a85aac4e77974dc07f6914f554fa | 194 | OK |
| validation-002 | evidence/C1/inputs/issue-002/I-12/validate-f.json | 110efa5897a045605b983e29eff58fa88f171d29882d1e3e082032bd03548d46 | 194 | OK |

    # evidence/C1/inputs/validation-001/registry.json: 30 entries
    # evidence/C1/inputs/validation-002/registry.json: 14 entries
    TOTAL 46 distinct files hashed, 0 problem(s)

## Verdict

PASS — all 46 distinct registry-listed files match their recorded sha256 and size.
