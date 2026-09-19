const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { makeRepo, LEDGER, ARCHIVE, MAIN, INTEGRATION } = require('./support/git-fixture.cjs');
const api = import('../orchestrate/tools/git-evidence.mjs');
const options = repo => ({ repo: repo.cwd, env: repo.env });
function writeLedger(repo, { id = 'FIXTURE', defaultRef = MAIN, state = 'ACTIVE' } = {}) {
  const dir = `.agents/changes/${id}`;
  repo.write(`${dir}/PROGRESS.md`, `**Identifier**: ${id}\n**State**: ${state}\n`);
  repo.write(`${dir}/00-READBEFORE.md`, `Default branch (protected local ref): ${defaultRef}\nIntegration branch: ${INTEGRATION}\nShipment source: local\nShipment ref: ${defaultRef}\n`);
}
function complete(result) { assert.equal(result.completeness, 'complete', JSON.stringify(result.diagnostics)); return result.evidence; }
function unknown(result) { assert.notEqual(result.completeness, 'complete'); assert.equal(result.evidence.result, 'unknown'); assert.ok(result.diagnostics.length); }
function cli(repo, operation, args = []) { return repo.cli('git-evidence.mjs', [operation, '--repo', repo.cwd, ...args]); }

test('deleted origin/HEAD supplies no hint despite a checked-out feature branch', async t => {
  const repo = makeRepo(t); repo.remote();
  repo.git('symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/main');
  repo.git('symbolic-ref', '--delete', 'refs/remotes/origin/HEAD'); repo.git('checkout', '-b', 'feature/current'); repo.git('config', 'init.defaultBranch', 'master');
  const e = complete((await api).discovery(options(repo)));
  assert.equal(e.refs.some(r => r.symref), false);
  assert.equal(e.refs.find(r => r.ref === MAIN).sha, repo.base);
  assert.equal(e.worktrees[0].branch, 'refs/heads/feature/current');
  assert.equal(Object.hasOwn(e, 'defaultBranch'), false);
});
test('main and master can coexist without a remote HEAD to choose between them', async t => {
  const repo = makeRepo(t); repo.git('branch', 'master');
  const e = complete((await api).discovery(options(repo)));
  assert.deepEqual(e.refs, [{ ref: MAIN, sha: repo.base, symref: null }, { ref: 'refs/heads/master', sha: repo.base, symref: null }]);
});
test('a successful origin/HEAD lookup can still name a missing target', async t => {
  const repo = makeRepo(t); repo.git('symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/old-main');
  const e = complete((await api).discovery(options(repo)));
  assert.deepEqual(e.refs.find(r => r.ref === 'refs/remotes/origin/HEAD'), { ref: 'refs/remotes/origin/HEAD', sha: null, symref: 'refs/remotes/origin/old-main' });
  unknown((await api).ancestry({ ...options(repo), ancestor: 'refs/remotes/origin/old-main', descendant: MAIN }));
});
test('the all-branch probe finds merged, custom, shallow and remote-only ledgers without a default hint', async t => {
  const repo = makeRepo(t); repo.git('checkout', '-b', 'custom/work'); writeLedger(repo); repo.commit('custom ledger');
  repo.git('branch', 'foo-ledger'); repo.git('checkout', 'main'); repo.git('merge', '--ff-only', 'custom/work');
  repo.git('checkout', '-b', 'temporary-remote-work', repo.base); writeLedger(repo, { id: 'REMOTE' });
  const remoteOnly = repo.commit('remote ledger'); repo.git('update-ref', 'refs/remotes/upstream/custom', remoteOnly);
  repo.git('symbolic-ref', 'refs/remotes/upstream/HEAD', 'refs/remotes/upstream/custom');
  repo.git('checkout', '-b', 'archive-only', repo.base); repo.write('.agents/archive/OLD/PROGRESS.md', '**State**: COMPLETE\n'); repo.commit('archive');
  repo.git('checkout', 'main'); repo.git('branch', '-D', 'temporary-remote-work');
  repo.write('.agents/changes/WORKING/PROGRESS.md', '**State**: ACTIVE\n'); repo.write('.agents/changes/empty/ignore', '');
  const before = repo.snapshot(); const e = complete((await api).discovery(options(repo)));
  assert.deepEqual(e.ledgers.map(l => l.id), ['FIXTURE', 'REMOTE', 'WORKING']);
  assert.deepEqual(e.ledgers[0].locations.filter(l => l.kind === 'ref').map(l => l.ref), ['refs/heads/custom/work', 'refs/heads/foo-ledger', MAIN]);
  assert.equal(e.ledgers[1].locations[0].ref, 'refs/remotes/upstream/custom');
  assert.ok(e.refs.find(r => r.ref === 'refs/remotes/upstream/HEAD').symref);
  assert.equal(e.ledgers[2].locations[0].cleanliness, 'dirty'); assert.deepEqual(repo.snapshot(), before);
});
test('ancestry distinguishes equal/contained, not-contained and unavailable objects', async t => {
  const repo = makeRepo(t), later = repo.commit('later'), { ancestry } = await api;
  for (const [a, d, result] of [[repo.base, repo.base, 'contained'], [repo.base, later, 'contained'], [later, repo.base, 'not-contained']]) {
    assert.deepEqual(complete(ancestry({ ...options(repo), ancestor: a, descendant: d })), { ancestorSha: a, descendantSha: d, result });
  }
  unknown(ancestry({ ...options(repo), ancestor: 'refs/heads/absent', descendant: repo.base }));
});
test('an unpushed merge is contained locally but not on the recorded remote', async t => {
  const repo = makeRepo(t); repo.remote(); repo.git('checkout', '-b', 'chore/fixture-ledger'); const sha = repo.commit('work'); repo.git('checkout', 'main'); repo.git('merge', '--ff-only', INTEGRATION);
  const { shipment } = await api;
  assert.equal(complete(shipment({ ...options(repo), integration: INTEGRATION, source: 'local', ref: MAIN })).result, 'contained');
  assert.deepEqual(complete(shipment({ ...options(repo), integration: INTEGRATION, source: 'remote', remote: 'origin', ref: MAIN })), { source: 'remote', remote: 'origin', ref: MAIN, integrationSha: sha, shipmentSha: repo.base, result: 'not-contained' });
});
test('a stale local default does not disprove a merge into the recorded remote', async t => {
  const repo = makeRepo(t); repo.remote(); repo.git('checkout', '-b', 'chore/fixture-ledger'); repo.commit('work'); repo.git('push', 'origin', `${INTEGRATION}:${MAIN}`);
  const { shipment } = await api;
  assert.equal(complete(shipment({ ...options(repo), integration: INTEGRATION, source: 'local', ref: MAIN })).result, 'not-contained');
  assert.equal(complete(shipment({ ...options(repo), integration: INTEGRATION, source: 'remote', remote: 'origin', ref: MAIN })).result, 'contained');
});
test('different local and remote tips can both contain integration', async t => {
  const repo = makeRepo(t); repo.remote(); repo.commit('work'); repo.git('branch', 'chore/fixture-ledger'); repo.git('push', 'origin', `${MAIN}:${MAIN}`); repo.commit('later');
  const { shipment } = await api;
  const local = complete(shipment({ ...options(repo), integration: INTEGRATION, source: 'local', ref: MAIN })), remote = complete(shipment({ ...options(repo), integration: INTEGRATION, source: 'remote', remote: 'origin', ref: MAIN }));
  assert.notEqual(local.shipmentSha, remote.shipmentSha); assert.equal(local.result, 'contained'); assert.equal(remote.result, 'contained');
});
test('a fresh remote SHA missing locally is unknown even when the tracking cache is usable', async t => {
  const repo = makeRepo(t), bare = repo.remote(); repo.git('branch', 'chore/fixture-ledger');
  const unseen = bare.git('commit-tree', bare.git('rev-parse', `${repo.base}^{tree}`), '-p', repo.base, '-m', 'upstream-only'); bare.git('update-ref', MAIN, unseen);
  const before = repo.snapshot(), remoteBefore = bare.snapshot();
  const r = (await api).shipment({ ...options(repo), integration: INTEGRATION, source: 'remote', remote: 'origin', ref: MAIN });
  unknown(r); assert.equal(r.evidence.shipmentSha, unseen); assert.equal(r.evidence.integrationSha, repo.base);
  const c = cli(repo, 'shipment', ['--integration', INTEGRATION, '--source', 'remote', '--remote', 'origin', '--ref', MAIN]);
  assert.equal(c.status, 2); unknown(c.json); assert.equal(c.json.evidence.shipmentSha, unseen);
  assert.deepEqual(repo.snapshot(), before); assert.deepEqual(bare.snapshot(), remoteBefore);
});
test('an absent remote branch and an unavailable remote do not supply shipment evidence', async t => {
  const repo = makeRepo(t); repo.remote(); repo.git('branch', 'chore/fixture-ledger');
  for (const [remote, ref] of [['origin', 'refs/heads/absent'], ['missing', MAIN]]) {
    const r = (await api).shipment({ ...options(repo), integration: INTEGRATION, source: 'remote', remote, ref }); unknown(r); assert.equal(r.evidence.shipmentSha, null);
    const c = cli(repo, 'shipment', ['--integration', INTEGRATION, '--source', 'remote', '--remote', remote, '--ref', ref]); assert.equal(c.status, 2); unknown(c.json); assert.equal(c.json.diagnostics[0].command, 'ls-remote');
  }
});
function archivedLedger(t) {
  const repo = makeRepo(t); repo.git('checkout', '-b', 'chore/fixture-ledger'); writeLedger(repo); repo.commit('active'); repo.git('checkout', 'main'); repo.git('merge', '--ff-only', INTEGRATION);
  repo.git('checkout', '-b', 'unrelated-work'); repo.write('unrelated.txt', 'Unrelated\n'); repo.commit('unrelated');
  repo.git('checkout', 'chore/fixture-ledger'); writeLedger(repo, { state: 'COMPLETE' }); fs.mkdirSync(path.join(repo.cwd, '.agents/archive'), { recursive: true }); repo.git('mv', LEDGER, ARCHIVE); repo.commit('archive');
  repo.git('checkout', 'main'); repo.git('merge', '--ff-only', INTEGRATION); repo.git('branch', '-D', 'chore/fixture-ledger'); return repo;
}
test('ledger history proves an archived copy is older despite unrelated branch commits and a deleted owner', async t => {
  const repo = archivedLedger(t), { ledger, ancestry, discovery } = await api;
  const e = complete(ledger({ ...options(repo), ref: 'refs/heads/unrelated-work', ledger: 'FIXTURE', target: MAIN }));
  assert.equal(e.active.tree, e.active.lastChangeTree); assert.equal(e.active.ancestry.target.result, 'contained');
  assert.equal(complete(ancestry({ ...options(repo), ancestor: 'refs/heads/unrelated-work', descendant: MAIN })).result, 'not-contained');
  const target = complete(ledger({ ...options(repo), ref: MAIN, ledger: 'FIXTURE' }));
  assert.equal(target.active.exists, false); assert.equal(target.archive.exists, true); assert.match(target.archive.progressText, /State\*\*: COMPLETE/);
  assert.equal(complete(discovery(options(repo))).ledgers[0].locations[0].ref, 'refs/heads/unrelated-work');
  const ownerMissing = ledger({ ...options(repo), ref: 'refs/heads/unrelated-work', ledger: 'FIXTURE', owner: INTEGRATION }); assert.notEqual(ownerMissing.completeness, 'complete'); assert.equal(ownerMissing.evidence.active.ancestry.owner.result, 'unknown');
});
test('a newer ledger commit fails the older-copy ancestry proof', async t => {
  const repo = archivedLedger(t); repo.git('checkout', 'unrelated-work'); repo.write(`${LEDGER}/PROGRESS.md`, '**State**: ACTIVE\nNew work\n'); const changed = repo.commit('new ledger');
  const e = complete((await api).ledger({ ...options(repo), ref: 'refs/heads/unrelated-work', ledger: 'FIXTURE', target: MAIN }));
  assert.equal(e.active.lastChange, changed); assert.equal(e.active.tree, e.active.lastChangeTree); assert.equal(e.active.ancestry.target.result, 'not-contained');
});
test('dirty ledger edits in another worktree remain visible despite older committed provenance', async t => {
  const repo = archivedLedger(t), dir = path.join(repo.root, 'candidate-worktree'); repo.git('worktree', 'add', dir, 'unrelated-work');
  const candidate = repo.at(dir); candidate.write(`${LEDGER}/PROGRESS.md`, '**State**: ACTIVE\nUncommitted\n');
  const before = candidate.snapshot(), e = complete((await api).discovery(options(repo)));
  assert.equal(e.worktrees.find(w => w.branch === 'refs/heads/unrelated-work').cleanliness, 'dirty');
  const locations = e.ledgers[0].locations;
  assert.match(locations.find(l => l.kind === 'worktree').progressText, /Uncommitted/);
  assert.equal(locations.find(l => l.kind === 'ref').worktrees[0].status[0].path, `${LEDGER}/PROGRESS.md`);
  assert.deepEqual(candidate.snapshot(), before);
});
test('recorded target corrections have newer provenance than retained batch contracts', async t => {
  const repo = makeRepo(t); repo.git('branch', '-m', 'main', 'master'); repo.git('checkout', '-b', 'chore/fixture-ledger'); writeLedger(repo, { defaultRef: 'refs/heads/master' }); const oldSha = repo.commit('old target');
  repo.git('branch', 'fix/batch-1'); repo.git('branch', '-m', 'master', 'main'); writeLedger(repo); repo.write(`${LEDGER}/LOG.md`, 'User approved correcting master to main.\n'); repo.commit('correction');
  const { ledger } = await api; const old = complete(ledger({ ...options(repo), ref: 'refs/heads/fix/batch-1', ledger: 'FIXTURE', owner: INTEGRATION })), owner = complete(ledger({ ...options(repo), ref: INTEGRATION, ledger: 'FIXTURE' }));
  assert.equal(old.active.lastChange, oldSha); assert.equal(old.active.ancestry.owner.result, 'contained'); assert.notEqual(old.active.tree, owner.active.tree);
  assert.match(old.active.contractTexts[0].text, /Shipment ref: refs\/heads\/master/); assert.match(owner.active.contractTexts[0].text, /Shipment ref: refs\/heads\/main/);
  repo.git('checkout', 'fix/batch-1'); writeLedger(repo, { defaultRef: 'refs/heads/release' }); repo.commit('conflict');
  const conflict = complete(ledger({ ...options(repo), ref: 'refs/heads/fix/batch-1', ledger: 'FIXTURE', owner: INTEGRATION })); assert.equal(conflict.active.ancestry.owner.result, 'not-contained'); assert.match(conflict.active.contractTexts[0].text, /refs\/heads\/release/);
});

test('every fixed evidence CLI command returns structured real evidence without writes', async t => {
  const repo = makeRepo(t), bare = repo.remote(); repo.git('branch', 'chore/fixture-ledger'); writeLedger(repo); repo.commit('ledger');
  const before = repo.snapshot(), remoteBefore = bare.snapshot();
  const cases = [
    ['discovery', [], e => { assert.ok(e.refs.length); assert.equal(e.ledgers[0].id, 'FIXTURE'); assert.ok(e.ledgers[0].locations[0].provenance.tree); }],
    ['worktrees', [], e => { assert.equal(e.worktrees[0].head.length, 40); assert.equal(e.worktrees[0].branch, MAIN); assert.equal(e.worktrees[0].cleanliness, 'clean'); }],
    ['ancestry', ['--ancestor', INTEGRATION, '--descendant', MAIN], e => { assert.equal(e.ancestorSha, repo.base); assert.equal(e.descendantSha.length, 40); assert.equal(e.result, 'contained'); }],
    ['shipment', ['--integration', INTEGRATION, '--source', 'local', '--ref', MAIN], e => { assert.equal(e.source, 'local'); assert.equal(e.remote, null); assert.equal(e.ref, MAIN); assert.equal(e.integrationSha, repo.base); assert.equal(e.shipmentSha.length, 40); assert.equal(e.result, 'contained'); }],
    ['shipment', ['--integration', INTEGRATION, '--source', 'remote', '--remote', 'origin', '--ref', MAIN], e => { assert.equal(e.source, 'remote'); assert.equal(e.remote, 'origin'); assert.equal(e.ref, MAIN); assert.equal(e.integrationSha, repo.base); assert.equal(e.shipmentSha, repo.base); assert.equal(e.result, 'contained'); }],
    ['ledger', ['--ref', MAIN, '--ledger', 'FIXTURE'], e => { assert.equal(e.id, 'FIXTURE'); assert.equal(e.ref, MAIN); assert.equal(e.activePath, LEDGER); assert.equal(e.archivePath, ARCHIVE); assert.equal(e.refSha.length, 40); assert.equal(e.active.exists, true); assert.equal(e.archive.exists, false); assert.ok(e.active.lastChange); assert.equal(e.active.lastChangeTree, e.active.tree); assert.match(e.active.progressText, /ACTIVE/); assert.ok(e.active.contractTexts[0].path); }],
  ];
  for (const [op, args, check] of cases) { const c = cli(repo, op, args); assert.equal(c.status, 0, c.stdout); assert.equal(c.stderr, ''); assert.equal(c.json.operation, op); assert.equal(c.json.repo, path.resolve(repo.cwd)); check(complete(c.json)); }
  const notContained = cli(repo, 'ancestry', ['--ancestor', MAIN, '--descendant', INTEGRATION]); assert.equal(notContained.status, 0); assert.equal(complete(notContained.json).result, 'not-contained');
  assert.deepEqual(repo.snapshot(), before); assert.deepEqual(bare.snapshot(), remoteBefore);
});
test('CLI errors, invalid encoding, unavailable Git and dirty calls preserve unknowns and bytes', async t => {
  const repo = makeRepo(t); repo.write('dirty name Ω.txt', 'bytes\r\n'); const before = repo.snapshot();
  for (const args of [[], ['bogus'], ['discovery'], ['discovery', '--repo', repo.cwd, '--repo', repo.cwd], ['worktrees', '--repo', repo.cwd, '--extra', 'x'], ['ancestry', '--repo', repo.cwd, '--ancestor', MAIN], ['shipment', '--repo', repo.cwd, '--integration', MAIN, '--source', 'remote', '--ref', MAIN]]) {
    const c = repo.cli('git-evidence.mjs', args); assert.equal(c.status, 2); assert.notEqual(c.json.completeness, 'complete'); assert.ok(c.json.diagnostics.length);
  }
  const absent = cli(repo, 'ancestry', ['--ancestor', MAIN, '--descendant', 'refs/heads/missing']); assert.equal(absent.status, 2); unknown(absent.json);
  const dirty = cli(repo, 'worktrees'); assert.equal(dirty.status, 0); assert.deepEqual(dirty.json.evidence.worktrees[0].status, [{ status: '??', path: 'dirty name Ω.txt', originalPath: null }]);
  const help = repo.cli('git-evidence.mjs', ['--help']); assert.equal(help.status, 0); assert.match(help.stdout, /shipment/);
  const noGit = repo.cli('git-evidence.mjs', ['ancestry', '--repo', repo.cwd, '--ancestor', MAIN, '--descendant', MAIN], { PATH: repo.root, Path: repo.root }); assert.equal(noGit.status, 2); unknown(noGit.json); assert.ok(noGit.json.diagnostics[0].error);
  assert.deepEqual(repo.snapshot(), before);
  repo.write(`${LEDGER}/PROGRESS.md`, Buffer.from([0xff, 0xfe])); repo.commit('invalid utf8');
  const invalid = cli(repo, 'ledger', ['--ref', MAIN, '--ledger', 'FIXTURE']); assert.equal(invalid.status, 2); assert.ok(invalid.json.diagnostics.some(d => d.code === 'invalid-encoding')); assert.equal(invalid.json.evidence.active.progressText, null);
});

test('worktree and ledger CLIs retain unavailable observations and config failures as UNKNOWN', async t => {
  const repo = makeRepo(t), dir = path.join(repo.root, 'missing-worktree'); repo.git('worktree', 'add', '-b', 'missing-worktree', dir); fs.renameSync(dir, path.join(repo.root, 'moved-worktree'));
  const result = cli(repo, 'worktrees'); assert.equal(result.status, 2); assert.equal(result.json.completeness, 'partial'); assert.equal(result.json.evidence.worktrees.find(w => w.branch === 'refs/heads/missing-worktree').cleanliness, 'unknown'); assert.ok(result.json.diagnostics.some(d => d.code === 'worktree-unavailable'));
  const missing = cli(repo, 'ledger', ['--ref', 'refs/heads/no-object', '--ledger', 'FIXTURE']); assert.equal(missing.status, 2); assert.equal(missing.json.evidence.refSha, null); assert.equal(missing.json.evidence.active.exists, null); assert.equal(missing.json.evidence.archive.exists, null);
  const configured = repo.cli('git-evidence.mjs', ['ancestry', '--repo', repo.cwd, '--ancestor', MAIN, '--descendant', MAIN], { GIT_CONFIG_COUNT: 'not-a-number' }); assert.equal(configured.status, 2); unknown(configured.json); assert.equal(configured.json.diagnostics[0].command, 'rev-parse');
});
test('read-only probes do not execute configured external diff or fsmonitor shell commands', async t => {
  const repo = makeRepo(t); repo.write('tracked', 'before'); repo.commit('tracked'); repo.write('tracked', 'after');
  const marker = path.join(repo.root, 'must-not-exist');
  repo.git('config', 'core.fsmonitor', `echo forbidden > "${marker}"`); repo.git('config', 'diff.external', `echo forbidden > "${marker}"`);
  const before = repo.snapshot(); const r = (await api).worktrees(options(repo)); assert.equal(complete(r).worktrees[0].cleanliness, 'dirty'); assert.equal(fs.existsSync(marker), false); assert.deepEqual(repo.snapshot(), before);
});

test('remote branch must point to an actual local commit rather than a peelable tag', async t => {
  const repo = makeRepo(t), bare = repo.remote(); repo.git('branch', 'chore/fixture-ledger'); repo.git('tag', '-a', 'object-tag', repo.base, '-m', 'annotated'); repo.git('push', 'origin', 'refs/tags/object-tag');
  const tag = repo.git('rev-parse', 'refs/tags/object-tag'); bare.write('refs/heads/main', tag + '\n');
  const before = [repo.snapshot(), bare.snapshot()]; const c = cli(repo, 'shipment', ['--integration', INTEGRATION, '--source', 'remote', '--remote', 'origin', '--ref', MAIN]);
  assert.equal(c.status, 2); unknown(c.json); assert.equal(c.json.evidence.shipmentSha, tag); assert.ok(c.json.diagnostics.some(d => d.code === 'remote-object-type')); assert.deepEqual([repo.snapshot(), bare.snapshot()], before);
});

test('configured clean and process filters never execute through API or actual CLI status probes', async t => {
  const { worktrees, discovery } = await api;
  for (const kind of ['clean', 'process']) await t.test(kind, t => {
    const repo = makeRepo(t), marker = path.join(repo.cwd, 'filter-must-not-run'), script = path.join(repo.root, `filter-${kind}.cjs`);
    fs.writeFileSync(script, `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'executed'); ${kind === 'clean' ? 'process.stdin.pipe(process.stdout);' : 'process.exit(1);'}`);
    repo.write('.gitattributes', 'filtered.txt filter=marker\n'); repo.write('filtered.txt', 'before\n'); repo.commit('filter fixture');
    repo.git('config', `filter.marker.${kind}`, `node "${script.replaceAll('\\', '/')}"`);
    repo.write('filtered.txt', 'after!\n'); fs.utimesSync(path.join(repo.cwd, 'filtered.txt'), new Date(0), new Date(0));
    const before = repo.snapshot();
    for (const operation of ['worktrees', 'discovery']) {
      const result = ({ worktrees, discovery })[operation](options(repo));
      assert.equal(result.completeness, 'partial'); assert.equal(result.evidence.worktrees[0].cleanliness, 'unknown'); assert.ok(result.diagnostics.some(d => d.code === 'unsafe-filter'));
      const command = cli(repo, operation); assert.equal(command.status, 2); assert.equal(command.json.evidence.worktrees[0].cleanliness, 'unknown'); assert.ok(command.json.diagnostics.some(d => d.code === 'unsafe-filter'));
      assert.equal(fs.existsSync(marker), false, `${operation} must not start ${kind} command`); assert.deepEqual(repo.snapshot(), before);
    }
    // GIT_CONFIG can redirect only `git config`; it must not conceal the real
    // repository's configured filter from the status prerequisite check.
    const conceal = { ...repo.env, GIT_CONFIG: path.join(repo.root, 'empty.gitconfig') };
    const hidden = worktrees({ repo: repo.cwd, env: conceal }); assert.ok(hidden.diagnostics.some(d => d.code === 'unsafe-filter'));
    const hiddenCli = repo.cli('git-evidence.mjs', ['worktrees', '--repo', repo.cwd], { GIT_CONFIG: conceal.GIT_CONFIG }); assert.equal(hiddenCli.status, 2); assert.ok(hiddenCli.json.diagnostics.some(d => d.code === 'unsafe-filter'));
    assert.equal(fs.existsSync(marker), false); assert.deepEqual(repo.snapshot(), before);
  });
});
test('malformed loose refs are retained as unknown while valid sibling evidence remains available', async t => {
  const repo = makeRepo(t); writeLedger(repo); repo.commit('valid sibling ledger'); repo.write('.git/refs/heads/broken', 'not-an-object\n');
  const before = repo.snapshot(), brokenBytes = fs.readFileSync(path.join(repo.cwd, '.git/refs/heads/broken'));
  const actual = (await api).discovery(options(repo)), command = cli(repo, 'discovery');
  assert.equal(command.status, 2);
  for (const result of [actual, command.json]) {
    assert.equal(result.completeness, 'partial');
    assert.deepEqual(result.evidence.refs.find(r => r.ref === 'refs/heads/broken'), { ref: 'refs/heads/broken', sha: null, symref: null });
    assert.ok(result.evidence.refs.find(r => r.ref === MAIN).sha); assert.equal(result.evidence.ledgers[0].id, 'FIXTURE');
    assert.ok(result.diagnostics.some(d => d.code === 'unobserved-loose-ref' && d.ref === 'refs/heads/broken'));
    assert.ok(result.diagnostics.some(d => d.code === 'ref-inventory-warning' && d.command === 'for-each-ref' && d.exit === 0));
  }
  assert.deepEqual(repo.snapshot(), before); assert.deepEqual(fs.readFileSync(path.join(repo.cwd, '.git/refs/heads/broken')), brokenBytes);
});
test('staged and unstaged T statuses remain complete dirty observations in API and CLI', async t => {
  const { worktrees } = await api;
  for (const kind of ['staged', 'unstaged']) await t.test(kind, t => {
    const repo = makeRepo(t); repo.write('tracked.txt', 'ordinary file\n'); repo.commit('ordinary'); repo.git('config', 'core.symlinks', 'false');
    const blob = repo.git('hash-object', '-w', '--', 'tracked.txt'); repo.git('update-index', '--cacheinfo', `120000,${blob},tracked.txt`);
    if (kind === 'unstaged') { repo.git('commit', '-m', 'symlink index'); repo.git('config', 'core.symlinks', 'true'); }
    const before = repo.snapshot(), expected = [{ status: kind === 'staged' ? 'T ' : ' T', path: 'tracked.txt', originalPath: null }];
    const r = complete(worktrees(options(repo))); assert.equal(r.worktrees[0].cleanliness, 'dirty'); assert.deepEqual(r.worktrees[0].status, expected);
    const c = cli(repo, 'worktrees'); assert.equal(c.status, 0, c.stdout); assert.equal(complete(c.json).worktrees[0].cleanliness, 'dirty'); assert.deepEqual(c.json.evidence.worktrees[0].status, expected); assert.deepEqual(repo.snapshot(), before);
  });
});
test('submodule status does not enter a nested repository with its own executable filters', async t => {
  const repo = makeRepo(t), nestedPath = path.join(repo.root, 'nested-source'); fs.mkdirSync(nestedPath); const nested = repo.at(nestedPath);
  nested.git('init', '--initial-branch=main'); nested.write('.gitattributes', 'tracked.txt filter=nested\n'); nested.write('tracked.txt', 'before\n'); nested.commit('nested');
  repo.git('submodule', 'add', nestedPath, 'nested'); repo.commit('submodule');
  const sub = repo.at(path.join(repo.cwd, 'nested')), marker = path.join(repo.cwd, 'nested-filter-must-not-run'), script = path.join(repo.root, 'nested-filter.cjs');
  fs.writeFileSync(script, `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'executed'); process.stdin.pipe(process.stdout);`);
  sub.git('config', 'filter.nested.clean', `node "${script.replaceAll('\\', '/')}"`); sub.write('tracked.txt', 'after!\n'); fs.utimesSync(path.join(sub.cwd, 'tracked.txt'), new Date(0), new Date(0));
  const before = repo.snapshot(), subBefore = sub.snapshot();
  const r = (await api).worktrees(options(repo)), c = cli(repo, 'worktrees'); assert.equal(c.status, 2);
  for (const result of [r, c.json]) { assert.equal(result.completeness, 'partial'); assert.equal(result.evidence.worktrees[0].cleanliness, 'unknown'); assert.ok(result.diagnostics.some(d => d.code === 'submodule-status-unsupported')); }
  assert.equal(fs.existsSync(marker), false); assert.deepEqual(repo.snapshot(), before); assert.deepEqual(sub.snapshot(), subBefore);
});
