const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const wt = process.argv[2], oldTip = 'b3ce33eb35dab7ac43472faa0f90220ff32a48dd';
const { makeRepo } = require(path.join(wt, 'tests/support/git-fixture.cjs'));
(async () => {
  const old = spawnSync('git', ['-c', `safe.directory=${wt}`, 'show', `${oldTip}:./orchestrate/tools/git-evidence.mjs`], { cwd: wt, shell: false, windowsHide: true });
  assert.equal(old.status, 0, old.stderr.toString()); const oldFile = path.join(__dirname, 'prior-git-evidence.mjs'); fs.writeFileSync(oldFile, old.stdout);
  const prior = await import(pathToFileURL(oldFile)), current = await import(pathToFileURL(path.join(wt, 'orchestrate/tools/git-evidence.mjs')));
  const cleanup = [], t = { after: fn => cleanup.push(fn) }, observations = [];
  try {
    for (const target of ['refs/tags/missing', 'refs/custom/missing', 'refs/remotes/absent/main']) {
      const r = makeRepo(t); r.git('symbolic-ref', 'refs/remotes/origin/HEAD', target);
      const before = r.snapshot(), previous = prior.discovery({ repo: r.cwd, env: r.env }), actual = current.discovery({ repo: r.cwd, env: r.env });
      const p = previous.evidence.refs.find(x => x.ref === 'refs/remotes/origin/HEAD'), a = actual.evidence.refs.find(x => x.ref === 'refs/remotes/origin/HEAD');
      assert.equal(r.git('check-ref-format', target), ''); assert.equal(r.git('symbolic-ref', 'refs/remotes/origin/HEAD'), target); assert.equal(p.symref, target); assert.deepEqual(r.snapshot(), before);
      observations.push({ target, prior: { ref: p, completeness: previous.completeness, diagnostics: previous.diagnostics }, current: { ref: a, completeness: actual.completeness, diagnostics: actual.diagnostics } });
    }
    fs.writeFileSync(path.join(__dirname, 'symbolic-target-regression.json'), JSON.stringify(observations, null, 2) + '\n');
    console.log(JSON.stringify(observations, null, 2));
  } finally { for (const fn of cleanup.reverse()) fn(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
