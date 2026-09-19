const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const wt = process.argv[2];
const { makeRepo } = require(path.join(wt, 'tests/support/git-fixture.cjs'));
(async () => {
  const api = await import(pathToFileURL(path.join(wt,'orchestrate/tools/git-evidence.mjs')));
  const cleanups = []; const t = { after: fn => cleanups.push(fn) }; const observations = {};
  try {
    const r = makeRepo(t); r.write('tracked.txt', 'ordinary file\n'); r.commit('tracked'); r.git('config', 'core.symlinks', 'false');
    const blob = r.git('hash-object','-w','--','tracked.txt'); r.git('update-index','--cacheinfo',`120000,${blob},tracked.txt`);
    observations.stagedType = { rawStatus:r.probe('status','--porcelain=v1').stdout, output:api.worktrees({repo:r.cwd,env:r.env}), cli:r.cli('git-evidence.mjs',['worktrees','--repo',r.cwd]) };
    const f = makeRepo(t); const marker = path.join(f.cwd,'clean-filter-ran'); const script=path.join(f.root,'filter.cjs');
    fs.writeFileSync(script, `require('node:fs').writeFileSync(${JSON.stringify(marker)},'side effect'); process.stdin.pipe(process.stdout);`);
    f.write('.gitattributes','filtered.txt filter=marker\n'); f.write('filtered.txt','before\n'); f.commit('filtered setup');
    f.git('config','filter.marker.clean',`node "${script.replaceAll('\\','/')}"`);
    f.write('filtered.txt','after!\n'); fs.utimesSync(path.join(f.cwd,'filtered.txt'), new Date(0), new Date(0));
    const before=f.snapshot(); const output=api.worktrees({repo:f.cwd,env:f.env}); const after=f.snapshot();
    observations.configuredCleanFilter={markerExists:fs.existsSync(marker),fileBytesUnchanged:JSON.stringify(before)===JSON.stringify(after),output}; fs.unlinkSync(marker); const cliBefore=f.snapshot(); const cli=f.cli('git-evidence.mjs',['worktrees','--repo',f.cwd]); observations.actualCliCleanFilter={exit:cli.status,markerExists:fs.existsSync(marker),snapshotUnchanged:JSON.stringify(cliBefore)===JSON.stringify(f.snapshot()),output:cli.json}; const broken=makeRepo(t); broken.write('.git/refs/heads/broken', 'not-an-object\n'); observations.brokenRef={raw:broken.probe('for-each-ref','--format=%(refname) %(objectname)'),output:api.discovery({repo:broken.cwd,env:broken.env}),cli:broken.cli('git-evidence.mjs',['discovery','--repo',broken.cwd])};
    console.log(JSON.stringify(observations,null,2));
  } finally { for(const fn of cleanups.reverse()) fn(); }
})().catch(e=>{console.error(e);process.exitCode=1});
