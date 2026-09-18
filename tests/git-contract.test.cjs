// Git-assumption tests for F5, not an implementation of the agent's prose workflow.
// Keep these command recipes aligned with SKILL.md §Discovery, scaffolding.md
// §Detection heuristics, and 00-READBEFORE.md / protocol.md §Recovery.
// A prose-only change will not automatically change these tests.
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const LEDGER = '.agents/changes/FIXTURE';
const ARCHIVE = '.agents/archive/FIXTURE';
const MAIN = 'refs/heads/main';
const INTEGRATION = 'refs/heads/chore/fixture-ledger';

function makeRepo(t) {
  const temp = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(temp, 'orchestrate-git-'));
  t.after(() => {
    // Only remove the exact disposable directory created by this test.
    const resolved = fs.realpathSync(root);
    assert.equal(resolved, root);
    assert.equal(path.dirname(resolved), temp);
    assert.ok(path.basename(resolved).startsWith('orchestrate-git-'));
    fs.rmSync(resolved, { recursive: true, maxRetries: 10, retryDelay: 100 });
  });
  const emptyConfig = path.join(root, 'empty.gitconfig');
  const emptyHooks = path.join(root, 'empty-hooks');
  const emptyTemplate = path.join(root, 'empty-template');
  fs.writeFileSync(emptyConfig, '');
  fs.mkdirSync(emptyHooks);
  fs.mkdirSync(emptyTemplate);

  // Do not inherit repository overrides, identity, templates or injected -c
  // settings. Isolate Git's config without changing the process's HOME.
  const env = Object.fromEntries(Object.entries(process.env)
    .filter(([key]) => !/^GIT_/i.test(key)));
  Object.assign(env, {
    GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: emptyConfig,
    GIT_TERMINAL_PROMPT: '0',
  });
  const config = [
    '-c', 'user.name=Orchestrate Fixture', '-c', 'user.email=fixture@example.invalid',
    '-c', 'commit.gpgSign=false', '-c', 'tag.gpgSign=false',
    '-c', `core.hooksPath=${emptyHooks}`, '-c', 'core.autocrlf=false',
    '-c', 'protocol.allow=never', '-c', 'protocol.file.allow=always',
  ];

  function at(cwd) {
    // probe() permits expected Git failures, but never hides process-launch errors.
    function probe(...args) {
      const result = spawnSync('git', [...config, ...args], {
        cwd, env, encoding: 'utf8', shell: false, windowsHide: true, timeout: 15000,
      });
      if (result.error) throw result.error;
      assert.equal(result.signal, null, `git ${args.join(' ')} terminated by signal`);
      assert.notEqual(result.status, null, 'Git must return an exit code');
      return { status: result.status, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
    }
    // All fixture construction uses git(): a bad setup command fails immediately.
    function git(...args) {
      const result = probe(...args);
      assert.equal(result.status, 0,
        `Fixture command failed in ${cwd}: git ${args.join(' ')}\n${result.stderr}`);
      return result.stdout;
    }
    function write(file, content) {
      const destination = path.join(cwd, file);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, content);
    }
    function commit(message) {
      git('add', '--all');
      git('commit', '--allow-empty', '-m', message);
      return git('rev-parse', '--verify', 'HEAD^{commit}');
    }
    return { cwd, probe, git, write, commit };
  }

  function init(name, bare = false) {
    const cwd = path.join(root, name);
    fs.mkdirSync(cwd);
    const repo = at(cwd);
    repo.git('init', '--initial-branch=main', `--template=${emptyTemplate}`, ...(bare ? ['--bare'] : []));
    return repo;
  }
  const repo = init('repo');
  const base = repo.commit('base');
  function remote() {
    const bare = init('origin.git', true);
    repo.git('remote', 'add', 'origin', bare.cwd);
    repo.git('push', 'origin', `${base}:${MAIN}`);
    return bare;
  }
  return { ...repo, root, base, remote, at };
}

function writeLedger(repo, { id = 'FIXTURE', defaultRef = MAIN, state = 'ACTIVE' } = {}) {
  const dir = `.agents/changes/${id}`;
  repo.write(`${dir}/PROGRESS.md`, `**Identifier**: ${id}\n**State**: ${state}\n`);
  repo.write(`${dir}/00-READBEFORE.md`,
    `Default branch (protected local ref): ${defaultRef}\nIntegration branch: ${INTEGRATION}\n` +
    `Shipment source: local\nShipment ref: ${defaultRef}\n`);
}

// Return evidence, not a second implementation of the ledger's classification rules.
function ledgerVersion(repo, ref) {
  const lastChange = repo.git('log', '-1', '--format=%H', ref, '--', `${LEDGER}/`);
  assert.ok(lastChange, 'Fixture must have a ledger-changing commit');
  return {
    lastChange,
    tree: repo.git('rev-parse', `${ref}:./${LEDGER}`),
    lastChangeTree: repo.git('rev-parse', `${lastChange}:./${LEDGER}`),
  };
}

function remoteTip(repo, ref = MAIN) {
  const output = repo.git('ls-remote', '--exit-code', 'origin', ref);
  const matches = output.split(/\r?\n/).map(line => line.split(/\s+/))
    .filter(([, name]) => name === ref);
  assert.equal(matches.length, 1, 'Need exactly one matching remote branch');
  return matches[0][0];
}

function assertUnknown(result) {
  assert.notEqual(result.status, 0, 'An error must not establish containment');
  assert.notEqual(result.status, 1, 'An error must not mean not-contained');
  assert.ok(result.stderr, 'The failing Git probe should report its error');
}

test('deleted origin/HEAD supplies no hint despite a checked-out feature branch', t => {
  const repo = makeRepo(t);
  repo.remote();
  repo.git('symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/main');
  repo.git('symbolic-ref', '--delete', 'refs/remotes/origin/HEAD');
  repo.git('checkout', '-b', 'feature/current');
  repo.git('config', 'init.defaultBranch', 'master');

  const hint = repo.probe('symbolic-ref', '--quiet', 'refs/remotes/origin/HEAD');
  assert.equal(hint.status, 1);
  assert.equal(hint.stdout, '');
  assert.equal(repo.git('branch', '--show-current'), 'feature/current');
  assert.equal(repo.git('config', '--get', 'init.defaultBranch'), 'master');
  assert.equal(repo.git('rev-parse', '--verify', `${MAIN}^{commit}`), repo.base);
  // These commands provide no authority to choose the feature branch or master.
});

test('main and master can coexist without a remote HEAD to choose between them', t => {
  const repo = makeRepo(t);
  repo.git('branch', 'master');
  const hint = repo.probe('symbolic-ref', '--quiet', 'refs/remotes/origin/HEAD');
  assert.equal(hint.status, 1);
  assert.equal(hint.stdout, '');
  assert.deepEqual(repo.git('for-each-ref', '--format=%(refname)', 'refs/heads/').split('\n'),
    [MAIN, 'refs/heads/master']);
  // With no other recorded authority in this fixture, confirmation is still needed.
});

test('a successful origin/HEAD lookup can still name a missing target', t => {
  const repo = makeRepo(t);
  repo.git('symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/old-main');
  const hint = repo.git('symbolic-ref', '--quiet', 'refs/remotes/origin/HEAD');
  assert.equal(hint, 'refs/remotes/origin/old-main');
  assertUnknown(repo.probe('rev-parse', '--verify', `${hint}^{commit}`));
});

test('the all-branch probe finds merged, custom and remote-only ledgers without a default hint', t => {
  const repo = makeRepo(t);
  repo.git('checkout', '-b', 'custom/work');
  writeLedger(repo);
  const integrated = repo.commit('ledger on custom branch');
  repo.git('checkout', 'main');
  repo.git('merge', '--ff-only', 'custom/work');
  repo.git('checkout', '-b', 'temporary-remote-work', repo.base);
  writeLedger(repo, { id: 'REMOTE' });
  const remoteOnly = repo.commit('remote-only ledger');
  repo.git('update-ref', 'refs/remotes/upstream/custom', remoteOnly);
  repo.git('symbolic-ref', 'refs/remotes/upstream/HEAD', 'refs/remotes/upstream/custom');
  repo.git('checkout', '-b', 'archive-only', repo.base);
  repo.write('.agents/archive/OLD/PROGRESS.md', '**State**: COMPLETE\n');
  repo.commit('archive-only tree');
  repo.git('checkout', 'main');
  repo.git('branch', '-D', 'temporary-remote-work');
  const before = { head: repo.git('rev-parse', 'HEAD'), status: repo.git('status', '--porcelain') };

  const refs = repo.git('for-each-ref', '--format=%(refname) %(symref)', 'refs/heads/', 'refs/remotes/');
  const found = [];
  for (const line of refs.split('\n')) {
    const [ref, symref] = line.trim().split(/\s+/);
    if (symref) continue;
    for (const file of repo.git('ls-tree', '-r', '--name-only', ref, '--', '.agents/changes/').split('\n')) {
      if (file.endsWith('/PROGRESS.md')) found.push([ref, file]);
    }
  }
  assert.deepEqual(found, [
    ['refs/heads/custom/work', `${LEDGER}/PROGRESS.md`],
    [MAIN, `${LEDGER}/PROGRESS.md`],
    ['refs/remotes/upstream/custom', '.agents/changes/REMOTE/PROGRESS.md'],
  ]);
  assert.equal(repo.probe('merge-base', '--is-ancestor', integrated, MAIN).status, 0);
  assert.deepEqual({ head: repo.git('rev-parse', 'HEAD'), status: repo.git('status', '--porcelain') }, before);
});

test('ancestry distinguishes equal/contained, not-contained and unavailable objects', t => {
  const repo = makeRepo(t);
  const later = repo.commit('later');
  assert.equal(repo.probe('merge-base', '--is-ancestor', repo.base, repo.base).status, 0);
  assert.equal(repo.probe('merge-base', '--is-ancestor', repo.base, later).status, 0);
  assert.equal(repo.probe('merge-base', '--is-ancestor', later, repo.base).status, 1);
  assertUnknown(repo.probe('merge-base', '--is-ancestor', 'refs/heads/absent', repo.base));
});

test('an unpushed merge is contained locally but not on the recorded remote', t => {
  const repo = makeRepo(t);
  repo.remote();
  repo.git('checkout', '-b', 'chore/fixture-ledger');
  const integration = repo.commit('integration work');
  repo.git('checkout', 'main');
  repo.git('merge', '--ff-only', INTEGRATION);
  const local = repo.git('rev-parse', '--verify', `${MAIN}^{commit}`);
  const upstream = remoteTip(repo);
  repo.git('rev-parse', '--verify', `${upstream}^{commit}`);
  assert.equal(upstream, repo.base);
  assert.equal(repo.probe('merge-base', '--is-ancestor', integration, local).status, 0);
  assert.equal(repo.probe('merge-base', '--is-ancestor', integration, upstream).status, 1);
});

test('a stale local default does not disprove a merge into the recorded remote', t => {
  const repo = makeRepo(t);
  repo.remote();
  repo.git('checkout', '-b', 'chore/fixture-ledger');
  const integration = repo.commit('integration work');
  repo.git('push', 'origin', `${INTEGRATION}:${MAIN}`);
  const local = repo.git('rev-parse', '--verify', `${MAIN}^{commit}`);
  const upstream = remoteTip(repo);
  assert.equal(local, repo.base);
  assert.equal(upstream, integration);
  assert.equal(repo.probe('merge-base', '--is-ancestor', integration, local).status, 1);
  assert.equal(repo.probe('merge-base', '--is-ancestor', integration, upstream).status, 0);
});

test('different local and remote tips can both contain integration', t => {
  const repo = makeRepo(t);
  repo.remote();
  const integration = repo.commit('integration work');
  repo.git('push', 'origin', `${MAIN}:${MAIN}`);
  const local = repo.commit('later unrelated work');
  const upstream = remoteTip(repo);
  assert.notEqual(local, upstream);
  assert.equal(repo.probe('merge-base', '--is-ancestor', integration, local).status, 0);
  assert.equal(repo.probe('merge-base', '--is-ancestor', integration, upstream).status, 0);
});

test('a fresh remote SHA missing locally is unknown even when the tracking cache is usable', t => {
  const repo = makeRepo(t);
  const bare = repo.remote();
  const tree = bare.git('rev-parse', `${repo.base}^{tree}`);
  const unseen = bare.git('commit-tree', tree, '-p', repo.base, '-m', 'upstream-only commit');
  bare.git('update-ref', MAIN, unseen);
  const upstream = remoteTip(repo);
  assert.equal(upstream, unseen);
  assert.equal(repo.git('rev-parse', 'refs/remotes/origin/main'), repo.base);
  assert.equal(repo.probe('merge-base', '--is-ancestor', repo.base, 'refs/remotes/origin/main').status, 0);
  assertUnknown(repo.probe('rev-parse', '--verify', `${upstream}^{commit}`));
  assertUnknown(repo.probe('merge-base', '--is-ancestor', repo.base, upstream));
});

test('an absent remote branch and an unavailable remote do not supply shipment evidence', t => {
  const repo = makeRepo(t);
  repo.remote();
  const absent = repo.probe('ls-remote', '--exit-code', 'origin', 'refs/heads/absent');
  assert.equal(absent.status, 2); // ls-remote's no-matching-ref exit, not an ancestry answer.
  assert.equal(absent.stdout, '');
  const unavailable = repo.probe('ls-remote', '--exit-code', path.join(repo.root, 'missing.git'), MAIN);
  assert.notEqual(unavailable.status, 0);
  assert.equal(unavailable.stdout, '');
});

function archivedLedger(t) {
  const repo = makeRepo(t);
  repo.git('checkout', '-b', 'chore/fixture-ledger');
  writeLedger(repo);
  repo.commit('active checkpoint');
  repo.git('checkout', 'main');
  repo.git('merge', '--ff-only', INTEGRATION);
  repo.git('checkout', '-b', 'unrelated-work');
  repo.write('unrelated.txt', 'Unrelated branch work\n');
  repo.commit('unrelated work after checkpoint');
  repo.git('checkout', 'chore/fixture-ledger');
  writeLedger(repo, { state: 'COMPLETE' });
  fs.mkdirSync(path.join(repo.cwd, '.agents/archive'), { recursive: true });
  repo.git('mv', LEDGER, ARCHIVE);
  repo.commit('complete and archive');
  repo.git('checkout', 'main');
  repo.git('merge', '--ff-only', INTEGRATION);
  repo.git('branch', '-D', 'chore/fixture-ledger');
  return repo;
}

test('ledger history proves an archived copy is older despite unrelated branch commits and a deleted owner', t => {
  const repo = archivedLedger(t);
  const candidate = 'refs/heads/unrelated-work';
  assert.notEqual(repo.probe('rev-parse', '--verify', INTEGRATION).status, 0);
  assert.equal(repo.git('show', `${MAIN}:./${ARCHIVE}/PROGRESS.md`),
    '**Identifier**: FIXTURE\n**State**: COMPLETE');
  assert.equal(repo.probe('merge-base', '--is-ancestor', candidate, MAIN).status, 1);
  const version = ledgerVersion(repo, candidate);
  assert.equal(version.tree, version.lastChangeTree);
  assert.equal(repo.probe('merge-base', '--is-ancestor', version.lastChange, MAIN).status, 0);
});

test('a newer ledger commit fails the older-copy ancestry proof', t => {
  const repo = archivedLedger(t);
  repo.git('checkout', 'unrelated-work');
  repo.write(`${LEDGER}/PROGRESS.md`, '**State**: ACTIVE\nNew unmerged ledger work\n');
  repo.commit('new ledger work');
  const version = ledgerVersion(repo, 'HEAD');
  assert.equal(version.tree, version.lastChangeTree);
  assert.equal(repo.probe('merge-base', '--is-ancestor', version.lastChange, MAIN).status, 1);
});

test('dirty ledger edits in another worktree remain visible despite older committed provenance', t => {
  const repo = archivedLedger(t);
  const worktree = path.join(repo.root, 'candidate-worktree');
  repo.git('worktree', 'add', worktree, 'unrelated-work');
  const candidate = repo.at(worktree);
  candidate.write(`${LEDGER}/PROGRESS.md`, '**State**: ACTIVE\nUncommitted ledger edits\n');
  const version = ledgerVersion(repo, 'refs/heads/unrelated-work');
  assert.equal(version.tree, version.lastChangeTree);
  assert.equal(repo.probe('merge-base', '--is-ancestor', version.lastChange, MAIN).status, 0);
  assert.equal(repo.git('status', '--porcelain'), '');
  assert.ok(repo.git('worktree', 'list', '--porcelain').includes('branch refs/heads/unrelated-work'));
  assert.equal(candidate.git('status', '--porcelain', '--', `${LEDGER}/`),
    `M ${LEDGER}/PROGRESS.md`);
});

test('recorded target corrections have newer provenance than retained batch contracts', t => {
  const repo = makeRepo(t);
  repo.git('branch', '-m', 'main', 'master');
  repo.git('checkout', '-b', 'chore/fixture-ledger');
  writeLedger(repo, { defaultRef: 'refs/heads/master' });
  repo.commit('original target');
  repo.git('branch', 'fix/batch-1');
  repo.git('branch', '-m', 'master', 'main');
  writeLedger(repo, { defaultRef: MAIN });
  repo.write(`${LEDGER}/LOG.md`, 'User approved correcting the default and shipment ref from master to main.\n');
  repo.commit('record approved target correction');

  const old = ledgerVersion(repo, 'refs/heads/fix/batch-1');
  const owner = ledgerVersion(repo, INTEGRATION);
  assert.equal(old.tree, old.lastChangeTree);
  assert.notEqual(old.tree, owner.tree);
  assert.equal(repo.probe('merge-base', '--is-ancestor', old.lastChange, INTEGRATION).status, 0);
  assert.ok(repo.git('show', `refs/heads/fix/batch-1:./${LEDGER}/00-READBEFORE.md`)
    .includes('Shipment ref: refs/heads/master'));
  assert.ok(repo.git('show', `${INTEGRATION}:./${LEDGER}/00-READBEFORE.md`)
    .includes(`Shipment ref: ${MAIN}`));

  repo.git('checkout', 'fix/batch-1');
  writeLedger(repo, { defaultRef: 'refs/heads/release' });
  repo.commit('conflicting unmerged target');
  const conflicting = ledgerVersion(repo, 'HEAD');
  assert.equal(conflicting.tree, conflicting.lastChangeTree);
  assert.equal(repo.probe('merge-base', '--is-ancestor', conflicting.lastChange, INTEGRATION).status, 1);
});
