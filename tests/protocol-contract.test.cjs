const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const protocol = read('orchestrate/references/protocol.md');
const contract = read('orchestrate/templates/00-READBEFORE.md');
// Consumer tests use isolated disposable repositories and actual CLI invocations;
// they do not import the upstream evidence or fence implementation.
function makeRepo(t) {
  const temp = fs.realpathSync(os.tmpdir()), root = fs.mkdtempSync(path.join(temp, 'protocol-docs-git-'));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync(root)), temp); fs.rmSync(root, { recursive: true, maxRetries: 8, retryDelay: 100 }); });
  const empty = path.join(root, 'empty'); fs.writeFileSync(empty, '');
  const hooks = path.join(root, 'hooks'), template = path.join(root, 'template'); fs.mkdirSync(hooks); fs.mkdirSync(template);
  const env = { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^GIT_/i.test(key))),
    GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: empty, GIT_TERMINAL_PROMPT: '0' };
  const config = ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgSign=false',
    '-c', 'core.autocrlf=false', '-c', 'core.hooksPath=' + hooks, '-c', 'protocol.allow=never', '-c', 'protocol.file.allow=always'];
  function at(cwd) {
    const git = (...args) => {
      const r = spawnSync('git', [...config, ...args], { cwd, env, encoding: 'utf8', windowsHide: true, timeout: 15000 });
      assert.ifError(r.error); assert.equal(r.status, 0, r.stderr); return r.stdout.trim();
    };
    const write = (file, bytes) => { const p = path.join(cwd, file); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, bytes); };
    const commit = message => { git('add', '--all'); git('commit', '--allow-empty', '-m', message); return git('rev-parse', 'HEAD'); };
    function snapshot() {
      const files = {};
      const walk = dir => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name === '.git') continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p); else files[path.relative(cwd, p)] = fs.readFileSync(p).toString('base64');
      } };
      walk(cwd);
      const gitDir = path.resolve(cwd, git('rev-parse', '--git-dir'));
      return { files, refs: git('for-each-ref', '--format=%(refname) %(objectname) %(symref)'),
        head: fs.readFileSync(path.join(gitDir, 'HEAD')).toString('base64'),
        index: fs.readFileSync(path.join(gitDir, 'index')).toString('base64') };
    }
    return { cwd, git, write, commit, snapshot };
  }
  const cwd = path.join(root, 'repo'); fs.mkdirSync(cwd);
  const repo = at(cwd); repo.git('init', '--initial-branch=main', '--template=' + template);
  const base = repo.commit('base');
  const remote = () => {
    const location = path.join(root, 'origin.git'); fs.mkdirSync(location);
    const bare = at(location); bare.git('init', '--bare', '--initial-branch=main', '--template=' + template);
    repo.git('remote', 'add', 'origin', location); repo.git('push', 'origin', base + ':refs/heads/main'); return bare;
  };
  return { ...repo, root, env, base, at, remote };
}
const normalize = text => text.replace(/`/g, '').replace(/\{\{INTEGRATION_BRANCH\}\}/g, 'the integration branch')
  .replace(/\{\{BACKLOG_FILE\}\}/g, 'backlog').replace(/\s+/g, ' ').trim();
function table(text, start) {
  const i = text.indexOf(start); assert.notEqual(i, -1);
  const rows = [];
  for (const line of text.slice(i).split('\n')) { if (!/^\s*\|/.test(line)) break; rows.push(line); }
  return rows.join('\n');
}

test('Recovery and capped-verdict tables agree exactly after placeholder normalization', () => {
  for (const heading of ['| Ledger says | Git shows | Verdict |', '| Subject | fix again | ship with the residual | drop |']) {
    assert.equal(normalize(table(contract, heading)), normalize(table(protocol, heading)), heading);
  }
  // These are the approved starting decision tables, not regenerated expectations.
  // Comparing both mirrors alone would miss a coordinated accidental rule change.
  const expected = {
    '| Ledger says | Git shows | Verdict |': 'c3f5e598e853e6f3d3f0f5a7b98c10dd82e7d8e63b9ec47914c64c828323b4b1',
    '| Subject | fix again | ship with the residual | drop |': '326ff764e5a7821d148ab18e38b9aed33a4c0fd36baebe5463da02c83adb7346'
  };
  for (const [heading, hash] of Object.entries(expected)) assert.equal(createHash('sha256').update(normalize(table(protocol, heading))).digest('hex'), hash);
  const shipment = text => text.slice(text.indexOf("Resolve the integration branch's full local ref"), text.indexOf('For each PROGRESS row'))
    .replace(/\{\{SHIPMENT_REF\}\}/g, '<shipment-ref>').replace(/\s+/g, ' ').trim();
  assert.equal(shipment(contract), shipment(protocol), 'captured-source shipment semantics stay mirrored');
});

test('template placeholders and registry match in both directions', () => {
  const files = fs.readdirSync(path.join(ROOT, 'orchestrate/templates')).filter(p => p.endsWith('.md'));
  const used = new Set(files.flatMap(p => [...read('orchestrate/templates/' + p).matchAll(/\{\{([A-Z_]+)\}\}/g)].map(m => m[1])));
  const rows = read('orchestrate/references/scaffolding.md').split('\n').filter(l => /^\| `\{\{[A-Z_]+\}\}` \| template/.test(l));
  const listed = rows.map(l => l.match(/\{\{([A-Z_]+)\}\}/)[1]);
  assert.equal(new Set(listed).size, listed.length);
  assert.deepEqual([...used].sort(), listed.sort());
});

// The helper-section mirror below proves only that the two documents AGREE: it is green when
// both name a command and green when neither does. Pin the command in each document separately,
// and inside the rule itself, so naming it elsewhere in the document cannot satisfy this.
// Pin the whole clause, like the decision tables and the self-check clause below: matching
// only /git check-attr filter/ is equally satisfied by "never run git check-attr filter",
// the exact opposite of what the probe does. The imperative IS this sentence's content, so
// freezing its wording is deliberate; the pin stops at the clause, leaving the rest free.
test('the manual read-only fallback names git check-attr filter in the resolved-filter rule', () => {
  const rule = 'Before status, run git check-attr filter on the paths status inspects:';
  for (const [label, text] of [['orchestrate/references/protocol.md', protocol],
    ['orchestrate/templates/00-READBEFORE.md', contract]]) {
    const from = text.indexOf('**Manual read-only fallback.**'), to = text.indexOf('## Git model');
    assert.ok(from !== -1 && to > from, label + ': the manual read-only fallback must precede the Git model heading');
    const fallback = text.slice(from, to);
    const start = fallback.indexOf('Before status,'), end = fallback.indexOf('makes safe cleanliness unknown');
    assert.ok(start !== -1 && end > start, label + ': the manual fallback must still carry the resolved-filter rule');
    assert.ok(fallback.slice(start, end).replace(/\s+/g, ' ').startsWith(rule),
      label + ': the resolved-filter step must read exactly "' + rule + '" (whitespace collapsed)');
    // A contradiction beside the pinned clause defeats it. Scope is this subsection, not
    // the document; the clause bound is load-bearing (`do not probe their trees` above
    // matches an unnarrowed `.*`). Polarity-blind: reinforcements ("Never skip git
    // check-attr filter") redden too — word one with no negation verb in its clause.
    // Uncaught by design: negation after the command, a probe synonym, an unlisted verb.
    assert.doesNotMatch(fallback.replace(/\s+/g, ' '), /(?:never|not|avoid|skip)\b[^.;:]*\bgit check-attr\b/i,
      label + ': nothing in the manual fallback may tell a human NOT to run git check-attr');
  }
});

test('generated contract bakes helper grammar, outcomes, fallback and full input responsibility', () => {
  const helperSection = text => text.slice(text.indexOf('### Read-only evidence tools'), text.indexOf('## Git model'));
  assert.equal(helperSection(contract).replaceAll('{{EVIDENCE_TOOL}}', 'orchestrate/tools/git-evidence.mjs')
    .replaceAll('{{FENCE_TOOL}}', 'orchestrate/tools/check-fence.mjs'), helperSection(protocol));
  const inputSection = text => text.slice(text.indexOf('### Complete checkpoint inputs'), text.indexOf('## Smoke checkpoints'));
  assert.equal(inputSection(contract), inputSection(protocol));
  for (const needed of ['complete/partial/unknown', 'contained/not-contained/unknown', 'VIOLATION (1)', 'UNKNOWN (2)',
    'both arrays', 'committed integration plan', 'never the candidate', 'exact comma-separated backtick paths',
    'Manual read-only fallback', 'ALL local/remote-tracking', 'git show ref:./path', 'only the selected ledger',
    'does not', 'immutable', 'inputHistory', 'EVERY', 'inputRoot', 'raw SHA-256', 'working-copy', 'reset',
    'private-data', 'credential', 'external-access', 'independently validate', 'never workbook semantics']) {
    assert.ok(contract.includes(needed), 'generated contract must bake: ' + needed);
  }
  for (const file of ['orchestrate/SKILL.md', 'orchestrate/references/scaffolding.md', 'orchestrate/references/execution-models.md',
    'orchestrate/references/subagent-prompts.md', 'orchestrate/references/smoke-page.md']) {
    const text = read(file);
    for (const required of [/inputs/i, /reset/i, /independen/i, /revisio/i, /(?:private.data|credential)/i]) assert.match(text, required, file);
  }
  for (const file of ['orchestrate/templates/01-plan.md', 'orchestrate/templates/02-batch.md', 'orchestrate/templates/PROGRESS.md']) {
    const text = read(file); assert.match(text, /input/i); assert.match(text, /reset/); assert.match(text, /revis/i);
  }
  assert.match(read('orchestrate/references/subagent-prompts.md'), /ACTUAL INPUTS: \[INPUT ROOT, STABLE-ID REGISTRY/);
  assert.match(read('orchestrate/SKILL.md'), /Existing\nledgers keep their frozen contract/);
  assert.ok(contract.indexOf('**6a Fence check') < contract.indexOf('**6b Failing-on-base'));
  assert.ok(contract.indexOf('**6b Failing-on-base') < contract.indexOf('**6c Reviewer'));
  assert.match(contract.slice(contract.indexOf('**6a Fence check'), contract.indexOf('**6b Failing-on-base')), /read-only helper.*\n\s+or its manual fallback/);
});

test('reusable artifacts contain no local Python installation default, while frozen ledger retains its environment fact', () => {
  const paths = ['orchestrate/SKILL.md', ...fs.readdirSync(path.join(ROOT, 'orchestrate/templates')).map(p => 'orchestrate/templates/' + p),
    ...fs.readdirSync(path.join(ROOT, 'orchestrate/references')).filter(p => p.endsWith('.md')).map(p => 'orchestrate/references/' + p),
    'orchestrate/tools/build-smoke-page.mjs', 'orchestrate/tools/smoke-inputs.mjs'];
  for (const file of paths) assert.doesNotMatch(read(file), /[A-Z]:[\\/](?:Users|Program Files)[\\/].*Python|fatbo|Python310/i, file);
  const candidates = ['.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md',
    '.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md'];
  // The approved ledger is branch-local and moves on archival; ordinary clones need
  // not contain it. When present, reusable edits must never rewrite its local fact —
  // and one location must exist HERE, so the next move breaks this guard loudly
  // instead of silently disarming it.
  const frozen = candidates.filter(p => fs.existsSync(path.join(ROOT, p)));
  assert.ok(frozen.length, 'frozen ledger contract must be readable at one of: ' + candidates.join(', '));
  // Counts, not mere presence: the interpreter path occurs three times and the
  // Excel-validation sentence once, so deleting any of them turns this red. A presence
  // check survives losing two of the three and calls the environment fact "retained".
  for (const file of frozen) {
    const text = read(file);
    assert.equal((text.match(/Python310[\\/]python\.exe/g) || []).length, 3, file + ': three literal interpreter paths');
    assert.equal((text.match(/Every generation and independent Excel-validation command in this run uses literal/g) || []).length,
      1, file + ': one Excel-validation sentence');
  }
});

test('the scaffold self-check names the Bnn id rule for both authority tables', () => {
  // scaffolding.md step 9 and the SKILL.md one-liner summarising it are the only place
  // a scaffolder is TOLD the rules the fence enforces. The id rule is pinned as the
  // exact approved sentence, like the decision tables above: mere co-occurrence of
  // "plan", "PROGRESS" and `Bnn` cannot tell "in BOTH ... and" from "in EITHER ... OR",
  // nor a requirement from its negation, and only those words state the rule the fence
  // enforces. Rewording it is then a deliberate, visible test edit. Filenames are
  // normalised away first, so writing "PROGRESS.md" is prose, not a failure.
  const selfCheckText = file => read(file).replace(/\s+/g, ' ').replace(/\.md\b/g, '');
  const idClause = {
    'orchestrate/references/scaffolding.md': 'every `#` cell of the batch tables in BOTH the plan and PROGRESS reads `Bnn`',
    'orchestrate/SKILL.md': "every `#` cell of the plan's and PROGRESS's batch tables reads `Bnn`"
  };
  // The residual grep is bound to its own verdict: naming `<title>` somewhere else in
  // the paragraph is not the same as grepping for it and requiring zero hits. `[^.;]*`
  // keeps the match inside one clause — the hole a bare `[^;]*` left open.
  const residualGrep = /grep the new[^.;]*`<title>`[^.;]*zero hits/i;
  for (const [file, clause] of Object.entries(idClause)) {
    const text = selfCheckText(file);
    assert.ok(text.includes(clause), file + ': the self-check must read exactly "' + clause + '" (whitespace collapsed, .md stripped)');
    assert.match(text, residualGrep, file + ': the self-check must grep for `<title>` and require zero hits — the token a deleted comment marker leaves behind');
  }
  // Rule and template cannot drift apart: the example rows must carry the very token
  // step 9 greps for, or the partial-deletion door reopens without a single test moving.
  for (const template of ['orchestrate/templates/01-plan.md', 'orchestrate/templates/PROGRESS.md']) {
    const row = read(template).split('\n').find(l => /^\| B\d{2,} \|/.test(l));
    assert.ok(row, template + ': no `| Bnn | ... |` example row to check');
    assert.ok(row.includes('<title>'), template + ': the example row must carry `<title>`, the token step 9 greps for — row reads ' + row);
  }
});

// The commit these templates pinned no example row at — a permanent historical blob,
// reachable in any full clone, used below as the red half of the proof.
const BATCH_BASE = 'fad7a64';
// A scaffolder's job, mechanised: lift the pinned example row out of the template's
// batch-table instruction comment and substitute real values. No authority row is
// hand-authored here, so a template that pins no Bnn row cannot quietly ship a ledger
// the real fence refuses to read.
function renderAuthorityTable(template, required, values, text = read(template)) {
  const lines = text.split('\n'), cellsOf = line => line.split('|').slice(1, -1).map(x => x.trim());
  const head = lines.findIndex(l => l.startsWith('|') && required.every(key => cellsOf(l).includes(key)));
  assert.notEqual(head, -1, template + ': no batch table carrying ' + required.join(', '));
  const open = lines.findIndex((l, i) => i > head && l.includes('<!--'));
  assert.notEqual(open, -1, template + ': the batch table carries no instruction comment');
  const close = open + lines.slice(open).findIndex(l => l.includes('-->'));
  // A live example row OUTSIDE the comment carries no {{ and no <!--, so the scaffold
  // self-check passes it and it reaches a filled ledger beside the real B01 — the
  // duplicate id that makes the fence throw for every batch of the change.
  assert.deepEqual(lines.filter((l, i) => (i < open || i > close) && /^\| B\d{2,} \|/.test(l)), [],
    template + ': a `| Bnn | ... |` row outside the instruction comment would survive scaffolding and collide with the real B01');
  const example = lines.slice(open, close + 1).find(l => /^\| B\d{2,} \|.*\|$/.test(l));
  assert.ok(example, template + ': the batch-table instruction comment pins no `| Bnn | ... |` example row for a scaffolder to copy');
  const header = cellsOf(lines[head]), cells = cellsOf(example);
  assert.equal(cells.length, header.length, template + ': the Bnn example row needs one cell per header column');
  // Callers never supply the # cell, so the id the fence reads is the template's own.
  // Without this, swapping the # and Batch columns leaves the suite green while the
  // template instructs every scaffolder to put the id in the wrong place.
  assert.match(cells[header.indexOf('#')], /^B\d{2,}$/, template + ": the example row's Bnn must sit in the # column");
  return [lines[head], lines[head + 1], '| ' + header.map((key, i) => values[key] ?? cells[i]).join(' | ') + ' |', ''].join('\n');
}

test('published helper recipes execute actual CLIs and generated batch grammar passes the real fence', t => {
  const repo = makeRepo(t), ledger = '.agents/changes/DOCS', integration = 'refs/heads/codex/docs-ledger';
  const batch = 'refs/heads/codex/docs-b01', batchFile = ledger + '/02-batches-01-example.md';
  repo.git('checkout', '-b', 'codex/docs-ledger');
  const values = { BATCH_NUM: '01', BATCH_BRANCH: 'codex/docs-b01', BATCH_FILES: '`payload.txt`', BATCH_TITLE: 'Example',
    BATCH_TYPE: 'feature', BATCH_VERSION: '—' };
  const rendered = read('orchestrate/templates/02-batch.md').replace(/\{\{([A-Z_]+)\}\}/g, (_, k) => values[k] || 'example')
    .replace(/<!-- - \[ \] one box[\s\S]*?-->/, '- [ ] Implement example.')
    .replace(/<!--[\s\S]*?-->/g, '');
  repo.write(batchFile, rendered);
  const planKeys = ['#', 'Branch', 'Files (fence)'], progressKeys = ['#', 'Branch', 'Notes'];
  // No '#' value: B01 below is the fence's --batch-id, and it must be the id the
  // templates themselves pin. Change either template's example id and this goes red.
  repo.write(ledger + '/01-plan.md', renderAuthorityTable('orchestrate/templates/01-plan.md', planKeys,
    { Branch: '`codex/docs-b01`', 'Files (fence)': '`payload.txt`' }));
  repo.write(ledger + '/PROGRESS.md', '**State**: ACTIVE\n' + renderAuthorityTable('orchestrate/templates/PROGRESS.md',
    progressKeys, { Branch: '`codex/docs-b01`', Notes: '—' }));
  // The other direction, driven by a shipped artifact rather than text this test
  // mutilated itself: at this batch's base these templates pinned no example row, and
  // the helper must still say so in those exact words. That silence is what degraded
  // OS-20260919's fence check to the manual fallback for every one of its batches.
  for (const [template, keys] of [['orchestrate/templates/01-plan.md', planKeys], ['orchestrate/templates/PROGRESS.md', progressKeys]]) {
    const blob = spawnSync('git', ['-C', ROOT, 'show', BATCH_BASE + ':' + template], { encoding: 'utf8', windowsHide: true });
    assert.ifError(blob.error); assert.equal(blob.status, 0, template + ' at ' + BATCH_BASE + ' must be readable: ' + blob.stderr);
    assert.throws(() => renderAuthorityTable(template, keys, {}, blob.stdout.replace(/\r\n/g, '\n')),
      e => e.message === template + ': the batch-table instruction comment pins no `| Bnn | ... |` example row for a scaffolder to copy',
      template + ' at ' + BATCH_BASE + ' must fail on the missing example row, not on some other diagnostic');
  }
  repo.write(ledger + '/00-READBEFORE.md', contract.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => ({
    INTEGRATION_BRANCH: 'codex/docs-ledger', EVIDENCE_TOOL: path.join(ROOT, 'orchestrate/tools/git-evidence.mjs'),
    FENCE_TOOL: path.join(ROOT, 'orchestrate/tools/check-fence.mjs') }[key] || 'example')));
  const source = repo.commit('rendered scaffold');
  const remote = repo.remote(); repo.git('push', 'origin', source + ':refs/heads/main');
  const wt = path.join(repo.root, 'batch'); repo.git('worktree', 'add', '-b', 'codex/docs-b01', wt, source);
  const candidate = repo.at(wt); candidate.write('payload.txt', 'Implemented\n');
  candidate.write(batchFile, rendered.replace('- [ ] Implement example.', '- [x] Implement example.'));
  const tip = candidate.commit('implementation');
  const before = repo.snapshot(), candidateBefore = candidate.snapshot();
  const recipes = protocol.split('\n').filter(l => l.startsWith('node orchestrate/tools/'));
  assert.equal(recipes.length, 7);
  for (const line of recipes) {
    const tokens = line.split(' '), script = path.join(ROOT, tokens[1]);
    const args = tokens.slice(2).map((value, i, list) => {
      if (!value.startsWith('<')) return value;
      const flag = list[i - 1];
      return { '--repo': repo.cwd, '--integration': integration, '--batch': batch, '--ledger': 'DOCS', '--batch-id': 'B01',
        '--batch-file': batchFile, '--remote': 'origin', '--ancestor': repo.base, '--descendant': source,
        '--owner': integration, '--target': source, '--ref': line.includes(' shipment ') ? 'refs/heads/main' : integration }[flag];
    });
    assert.ok(args.every(Boolean), line);
    const r = spawnSync(process.execPath, [script, ...args], { cwd: repo.cwd, env: repo.env, encoding: 'utf8', windowsHide: true });
    assert.ifError(r.error); assert.equal(r.status, 0, line + '\n' + r.stdout + r.stderr);
    const result = JSON.parse(r.stdout);
    if (line.includes('check-fence')) {
      assert.equal(result.status, 'PASS'); assert.equal(result.integrationSha, source); assert.equal(result.batchSha, tip);
    } else {
      assert.equal(result.completeness, 'complete');
      if (line.includes(' ancestry ')) assert.equal(result.evidence.result, 'contained');
      if (line.includes(' shipment ')) assert.equal(result.evidence.result, line.includes('--source local') ? 'not-contained' : 'contained');
      if (line.includes(' discovery ')) assert.ok(result.evidence.ledgers.some(l => l.id === 'DOCS'));
      if (line.includes(' ledger ')) assert.equal(result.evidence.active.exists, true);
    }
  }
  assert.deepEqual(repo.snapshot(), before); assert.deepEqual(candidate.snapshot(), candidateBefore);
  assert.ok(remote.cwd);
});

test('actual README recursive command and portable form discover nested failure then success; empty primary discovery fails', t => {
  const repo = makeRepo(t), readme = read('README.md');
  const runnerEnv = { ...repo.env }; delete runnerEnv.NODE_TEST_CONTEXT;
  const command = readme.match(/```powershell\n(\$testFiles = [\s\S]*?)\n```/)[1];
  assert.match(command, /Get-ChildItem -LiteralPath tests -Filter \*\.test\.cjs -File -Recurse \| Sort-Object FullName \| ForEach-Object FullName/);
  assert.match(command, /node --test --test-reporter=spec @testFiles/);
  assert.match(readme, /Portable convenience: `node --test`/); assert.doesNotMatch(readme, /`node --test tests(?:`| )/);
  const runner = path.join(repo.root, 'published-runner.ps1'); fs.writeFileSync(runner, command + '\n');
  let powershell;
  for (const shell of ['pwsh', 'powershell']) {
    const r = spawnSync(shell, ['-NoProfile', '-NonInteractive', '-Command', '$PSVersionTable.PSVersion.ToString()'], { encoding: 'utf8' });
    if (!r.error && r.status === 0) { powershell = shell; break; }
  }
  if (!powershell) { t.skip('PowerShell prerequisite unavailable; execute published recipe on a PowerShell runner before hand-over.'); return; }
  const top = 'tests/a-control.test.cjs', nested = 'tests/unit/discovery-sentinel.test.cjs', last = 'tests/z-control.test.cjs';
  const control = name => `require('node:test')('${name}', () => require('node:assert/strict').equal(1, 1));\n`;
  repo.write(top, control('top-level discovery control')); repo.write(last, control('last discovery control'));
  const sentinel = pass => `require('node:test')('UNIQUE nested discovery sentinel', () => require('node:assert/strict').equal(${pass ? '1' : '0'}, 1));\n`;
  repo.write(nested, sentinel(false));
  const run = () => spawnSync(powershell, ['-NoProfile', '-NonInteractive', '-File', runner], { cwd: repo.cwd, env: runnerEnv, encoding: 'utf8', windowsHide: true });
  const portable = () => spawnSync(process.execPath, ['--test'], { cwd: repo.cwd, env: runnerEnv, encoding: 'utf8', windowsHide: true });
  for (const result of [run(), portable()]) {
    assert.ifError(result.error); assert.notEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout + result.stderr, /UNIQUE nested discovery sentinel/);
    assert.match(result.stdout, /fail 1/);
  }
  const failed = run(); assert.match(failed.stderr, /Node test suite failed/);
  repo.write(nested, sentinel(true));
  for (const result of [run(), portable()]) { assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, /pass 3/); }
  const diffControl = 'tracked-diff-control.txt';
  repo.write(diffControl, 'clean tracked line\n');
  repo.commit('passing suites and clean tracked diff control');
  repo.write(diffControl, 'tracked trailing whitespace  \n');
  const badDiff = run();
  assert.ifError(badDiff.error);
  assert.match(badDiff.stdout, /pass 3/, 'Node tests must pass before the independent Git diff failure');
  assert.notEqual(badDiff.status, 0, badDiff.stdout + badDiff.stderr);
  assert.match(badDiff.stdout + badDiff.stderr, /trailing whitespace/);
  assert.match(badDiff.stderr, /Git diff check failed/);
  repo.write(diffControl, 'clean tracked line\n');
  const cleanDiff = run();
  assert.equal(cleanDiff.status, 0, cleanDiff.stdout + cleanDiff.stderr);
  assert.match(cleanDiff.stdout, /pass 3/, 'restoring the tracked file must restore successful published validation');
  const enumeration = command.split('\n')[0] + '\n$testFiles | ConvertTo-Json -Compress';
  const result = spawnSync(powershell, ['-NoProfile', '-NonInteractive', '-Command', enumeration], { cwd: repo.cwd, env: repo.env, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [top, nested, last].map(p => path.join(repo.cwd, p)));
  for (const name of [top, nested, last]) fs.unlinkSync(path.join(repo.cwd, name));
  const empty = run(); assert.notEqual(empty.status, 0); assert.match(empty.stderr, /No Node test suites discovered/);
});
