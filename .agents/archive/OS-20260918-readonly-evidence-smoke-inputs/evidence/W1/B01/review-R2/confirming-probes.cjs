const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const wt = process.argv[2];
const { makeRepo, MAIN } = require(path.join(wt, 'tests/support/git-fixture.cjs'));
(async () => {
  const api = await import(pathToFileURL(path.join(wt, 'orchestrate/tools/git-evidence.mjs')));
  const cleanup = [], t = { after: fn => cleanup.push(fn) }, observations = {};
  try {
    for (const source of ['include', 'global', 'worktree', 'environment']) {
      const r = makeRepo(t), script = path.join(r.root, 'filter.cjs'), marker = path.join(r.cwd, 'must-not-run');
      fs.writeFileSync(script, `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'ran'); process.stdin.pipe(process.stdout);`);
      r.write('.gitattributes', 'filtered.txt filter=probe\n'); r.write('filtered.txt', 'before\n'); r.commit('setup');
      const command = `node "${script.replaceAll('\\', '/')}"`, env = { ...r.env }, customEnv = {};
      if (source === 'include') {
        const included = path.join(r.root, 'included.gitconfig'); fs.writeFileSync(included, '');
        r.git('config', '--file', included, 'filter.probe.clean', command); r.git('config', 'include.path', included);
      } else if (source === 'global') r.git('config', '--file', r.env.GIT_CONFIG_GLOBAL, 'filter.probe.clean', command);
      else if (source === 'worktree') { r.git('config', 'extensions.worktreeConfig', 'true'); r.git('config', '--worktree', 'filter.probe.clean', command); }
      else Object.assign(env, customEnv, { GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'filter.probe.clean', GIT_CONFIG_VALUE_0: command });
      if (source === 'environment') Object.assign(customEnv, { GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'filter.probe.clean', GIT_CONFIG_VALUE_0: command });
      r.write('filtered.txt', 'after!\n'); fs.utimesSync(path.join(r.cwd, 'filtered.txt'), new Date(0), new Date(0));
      const before = r.snapshot(), result = api.worktrees({ repo: r.cwd, env }), cli = r.cli('git-evidence.mjs', ['worktrees', '--repo', r.cwd], customEnv);
      assert.equal(result.completeness, 'partial'); assert.ok(result.diagnostics.some(x => x.code === 'unsafe-filter')); assert.equal(cli.status, 2); assert.ok(cli.json.diagnostics.some(x => x.code === 'unsafe-filter'));
      assert.equal(fs.existsSync(marker), false); assert.deepEqual(r.snapshot(), before);
      observations[`filter-${source}`] = { result, cli: cli.json, exit: cli.status, markerExists: false, snapshotUnchanged: true };
    }
    for (const [kind, bytes] of [['empty', Buffer.alloc(0)], ['invalidUtf8', Buffer.from([255, 254])], ['brokenSymbolic', Buffer.from('ref: refs/heads/missing\n')]]) {
      const r = makeRepo(t); r.write('.git/refs/heads/unknown', bytes); const before = r.snapshot();
      const result = api.discovery({ repo: r.cwd, env: r.env }), cli = r.cli('git-evidence.mjs', ['discovery', '--repo', r.cwd]);
      assert.ok(result.evidence.refs.some(x => x.ref === MAIN && x.sha)); assert.ok(result.evidence.refs.some(x => x.ref === 'refs/heads/unknown'));
      assert.deepEqual(r.snapshot(), before); assert.deepEqual(fs.readFileSync(path.join(r.cwd, '.git/refs/heads/unknown')), bytes);
      observations[`refs-${kind}`] = { result, exit: cli.status };
    }
    const symbolic = makeRepo(t); symbolic.git('symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/tags/missing');
    const symBefore = symbolic.snapshot(), actualTarget = symbolic.git('symbolic-ref', 'refs/remotes/origin/HEAD');
    observations.legalSymbolicTagTarget = { actualTarget, result: api.discovery({ repo: symbolic.cwd, env: symbolic.env }), cli: symbolic.cli('git-evidence.mjs', ['discovery', '--repo', symbolic.cwd]) };
    assert.deepEqual(symbolic.snapshot(), symBefore);
    for (const kind of ['staged', 'unstaged']) {
      const r = makeRepo(t); r.write('tracked.txt', 'target\n'); r.commit('regular'); r.git('config', 'core.symlinks', 'false');
      const blob = r.git('hash-object', '-w', '--', 'tracked.txt'); r.git('update-index', '--cacheinfo', `120000,${blob},tracked.txt`);
      if (kind === 'unstaged') { r.git('commit', '-m', 'symlink'); r.git('config', 'core.symlinks', 'true'); }
      const before = r.snapshot(), result = api.worktrees({ repo: r.cwd, env: r.env }), cli = r.cli('git-evidence.mjs', ['worktrees', '--repo', r.cwd]);
      assert.equal(result.completeness, 'complete'); assert.equal(result.evidence.worktrees[0].cleanliness, 'dirty'); assert.equal(result.evidence.worktrees[0].status[0].status, kind === 'staged' ? 'T ' : ' T'); assert.equal(cli.status, 0); assert.deepEqual(r.snapshot(), before);
      observations[`type-${kind}`] = { result, exit: cli.status, snapshotUnchanged: true };
    }
    fs.writeFileSync(path.join(__dirname, 'confirming-probes.json'), JSON.stringify(observations, null, 2) + '\n');
    console.log(JSON.stringify({ probes: Object.keys(observations), resultsFile: path.join(__dirname, 'confirming-probes.json'), symbolic: observations.legalSymbolicTagTarget }, null, 2));
  } finally { for (const fn of cleanup.reverse()) fn(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
