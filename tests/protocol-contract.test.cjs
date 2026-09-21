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

// ===== BL-010 and BL-016 sweeps ============================================
// Both sweeps below take their domain from the checkout rather than a hand-written
// list, and walk it RECURSIVELY with no file-type filter: a carrier of either rule
// could land in `references/runners/rules.md`, in `smoke-page-template.html` (which
// already carries runner prose) or in a tool. `orchestrate/` happens to be flat and
// mostly Markdown today, so "it recurses" and "it reads every type" would be vacuous
// claims about this checkout; the fixture test below reaches the recursive branch at
// depth three and pins the non-Markdown members that exist here.
function walkFiles(dir, prefix = '') {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const rel = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isDirectory()) found.push(...walkFiles(path.join(dir, entry.name), rel));
    else if (entry.isFile()) found.push(rel);
  }
  return found;
}
const shippedSkillFiles = () => walkFiles(path.join(ROOT, 'orchestrate')).map(rel => 'orchestrate/' + rel);
const collapsed = file => read(file).replace(/\s+/g, ' ');

test('the shipped-skill domain both rule sweeps use recurses and filters no file type', t => {
  const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'skill-domain-walk-'));
  t.after(() => fs.rmSync(root, { recursive: true, maxRetries: 8, retryDelay: 100 }));
  fs.mkdirSync(path.join(root, 'references', 'runners'), { recursive: true });
  fs.mkdirSync(path.join(root, 'empty-dir'));
  fs.writeFileSync(path.join(root, 'SKILL.md'), 'top\n');
  fs.writeFileSync(path.join(root, 'references', 'smoke-page-template.html'), 'html\n');
  fs.writeFileSync(path.join(root, 'references', 'runners', 'rules.md'), 'nested\n');
  // Depth three, a non-Markdown file and a directory holding no files: the branch that
  // a flat all-Markdown checkout never exercises, so a future non-recursive rewrite of
  // walkFiles fails here instead of silently shrinking both sweeps' domains.
  assert.deepEqual(walkFiles(root),
    ['SKILL.md', 'references/runners/rules.md', 'references/smoke-page-template.html']);
  const shipped = shippedSkillFiles();
  assert.deepEqual(shipped.slice().sort(), shipped, 'the shipped listing must come out sorted');
  assert.equal(new Set(shipped).size, shipped.length, 'the shipped listing must not repeat a path');
  for (const nonMarkdown of ['orchestrate/references/smoke-page-template.html',
    'orchestrate/tools/build-smoke-page.mjs', 'orchestrate/tools/check-fence.mjs']) {
    assert.ok(shipped.includes(nonMarkdown), 'the sweeps must reach ' + nonMarkdown + ', not only *.md');
  }
  // Shape, never a pinned total: the skill grows. Only that it is bigger than either
  // rule's carrier set, so neither sweep can be satisfied by its own subjects alone.
  assert.ok(shipped.length > 10, 'shipped skill listing collapsed to ' + shipped.length + ' files');
});

// BL-010: the scaffold self-check greps a brand-new ledger for `{{`, `<!--` and
// `<title>` and called every hit an unfilled slot. A ledger that DOCUMENTS templating
// work quotes those tokens legitimately — this repository produced eleven such hits in
// one scaffold commit, every one inside a code span — so the absolute was false and the
// scaffolder was told to edit correct prose away. What is pinned here is the PREDICATE
// ("a hit inside a code span is not an unfilled slot"), not the noun phrase "fenced and
// inline code spans", which the exemption and its exact inverse both contain.
test('the scaffold self-check exempts code spans from the placeholder grep', () => {
  const selfCheckText = file => collapsed(file).replace(/\.md\b/g, '');
  const selfCheckFiles = shippedSkillFiles().filter(file => selfCheckText(file).includes('grep the new'));
  // Derived, not asserted against itself: a third document acquiring the self-check
  // reddens here rather than escaping the paragraph checks below.
  assert.deepEqual(selfCheckFiles, ['orchestrate/SKILL.md', 'orchestrate/references/scaffolding.md']);
  assert.equal(selfCheckFiles.length, 2, 'exactly two shipped documents state the scaffold self-check');
  const bounds = {
    'orchestrate/references/scaffolding.md': ['9. **Self-check**', '10. **Scaffold commit**'],
    'orchestrate/SKILL.md': ['self-check (grep the new directory', 'scaffold commit on']
  };
  assert.deepEqual(Object.keys(bounds).sort(), selfCheckFiles.slice().sort());
  for (const file of selfCheckFiles) {
    const text = selfCheckText(file);
    const from = text.indexOf(bounds[file][0]), to = text.indexOf(bounds[file][1]);
    assert.ok(from !== -1 && to > from, file + ': the self-check paragraph bounds no longer resolve');
    const paragraph = text.slice(from, to);
    // The three tokens and their verdict, in that order, with nothing between them that
    // could drop one. `residualGrep` above admits a comma, so "ignoring `<title>`
    // entirely, and require zero hits" satisfied it while the `<title>` grep was gone.
    const grepAt = paragraph.indexOf('grep the new'), verdictAt = paragraph.indexOf('zero hits');
    assert.ok(grepAt !== -1 && verdictAt > grepAt, file + ': the self-check must grep, then reach a zero-hit verdict');
    const grepClause = paragraph.slice(grepAt, verdictAt);
    for (const token of ['`{{`', '`<!--`', '`<title>`']) {
      assert.ok(grepClause.includes(token),
        file + ': the grep must still name ' + token + ' before its zero-hit verdict — clause reads "' + grepClause + '"');
    }
    assert.doesNotMatch(grepClause,
      /\b(?:ignor\w*|skip\w*|exclud\w*|omit\w*|except|without|drop\w*|disregard\w*|no longer|never|not)\b/i,
      file + ': no exclusion verb may stand between the grep and its zero-hit verdict — clause reads "' + grepClause + '"');
    assert.match(paragraph, /zero hits(?:\*\*)?\s*outside fenced and inline code spans/i,
      file + ': the zero-hit verdict must be qualified to hits OUTSIDE fenced and inline code spans');
    assert.doesNotMatch(paragraph, /\binside and outside\b/i,
      file + ': re-including code spans in the verdict is the exact inverse of the exemption');
    // Polarity by counting, not by phrasing: exactly one clause may rule on a hit INSIDE
    // a span, and it must say NOT a slot. Appending "A hit inside a code span is still an
    // unfilled slot." makes this two; inverting the clause makes it zero.
    const insideRulings = paragraph.split(/(?<=[.;])\s+/)
      .filter(clause => /\binside\b[^.;]*code spans?/i.test(clause) && /unfilled slot/i.test(clause));
    assert.equal(insideRulings.length, 1,
      file + ': exactly one clause may rule on a hit inside a code span, found ' + insideRulings.length
        + ' — ' + (insideRulings.join(' || ') || '(none)'));
    assert.match(insideRulings[0], /\bis not an unfilled slot\b/i,
      file + ': the ruling on a hit inside a code span must be that it is NOT an unfilled slot');
  }
});

// BL-016 named two files. SIX occurrences across FIVE documents carry the rule, and two
// of the five — the ledger contract template and the batch template — are what a DRIVING
// session and a PLANNER read, so a rule landing only in the reference docs never reaches
// a ledger at all. `scaffolding.md` states it twice (the planning step and the
// environment interview, the very place `Default when unsure: every step human` lived),
// and an `includes` check is satisfied by either copy, so the domain is a file->count map
// and the assertions are on counts.
test('every document carrying the Runner: default states the same rule, and no default-human spelling survives', () => {
  const RULE = 'A step is human ONLY when it needs something an agent on this machine cannot do: '
    + 'a device, a GUI, held credentials, a judgement about whether something looks right, '
    + 'or something the environment contract forbids an agent here to do';
  // The trailing clause is load-bearing, not padding: the four named grounds are
  // illustrative, and a conductor reading a CLOSED enumeration as controlling would tag a
  // "touches your data" or another-OS step `agent` and hand it to the QA runner against
  // live data. BL-016's list was an example; implementing it as a closed set narrowed a
  // safety rule that the human list one clause away already stated.
  assert.match(RULE, /, or something the environment contract forbids an agent here to do$/,
    'the enumeration must stay open-ended, or it narrows the grounds the human list already names');
  const RUNNER_RULE_COUNTS = {
    'orchestrate/references/execution-models.md': 1,
    'orchestrate/references/protocol.md': 1,
    'orchestrate/references/scaffolding.md': 2,
    'orchestrate/templates/00-READBEFORE.md': 1,
    'orchestrate/templates/02-batch.md': 1
  };
  const carriers = Object.keys(RUNNER_RULE_COUNTS);
  assert.equal(carriers.length, 5, 'BL-016 understated its file set by three: five documents carry the rule');
  assert.equal(Object.values(RUNNER_RULE_COUNTS).reduce((sum, n) => sum + n, 0), 6,
    'five documents, six occurrences — scaffolding.md states the rule in both the planning step and the interview');
  const occurrences = file => collapsed(file).split(RULE).length - 1;
  const shipped = shippedSkillFiles();
  assert.ok(shipped.length > carriers.length, 'the swept listing must be wider than the carrier set');
  for (const file of carriers) {
    assert.ok(shipped.includes(file), file + ': carrier is not in the shipped listing this test sweeps');
    assert.equal(occurrences(file), RUNNER_RULE_COUNTS[file],
      file + ': must state the runner rule verbatim exactly ' + RUNNER_RULE_COUNTS[file]
        + ' time(s) — "' + RULE + '" (whitespace collapsed)');
  }
  // Subject is the DOMAIN: losing one of scaffolding.md's two copies, or a sixth document
  // acquiring the rule, both redden without any member assertion changing.
  const found = Object.fromEntries(shipped.map(file => [file, occurrences(file)]).filter(([, n]) => n > 0));
  assert.equal(Object.keys(found).length, carriers.length,
    'exactly five shipped files may state the runner rule, found: ' + Object.keys(found).join(', '));
  assert.deepEqual(found, RUNNER_RULE_COUNTS);

  // --- the default-human sweep -------------------------------------------------
  // READ THIS BEFORE TRUSTING ITS SILENCE. This is a REGRESSION GUARD, not a detector.
  // It catches the spellings this repository has actually written plus the paraphrases a
  // review produced; English has more, and a reviewer inserted twenty an earlier version
  // missed. A clause carrying an explicit negation is treated as a reinforcement and
  // skipped, so "never hand a step to the user" is not a hit — and neither is a real
  // contradiction that happens to contain the word "not". Clauses split on `.` and `;`
  // only, so the colon form ("Default: human.") stays intact. When this is green the
  // documents are free of THESE spellings, and nothing stronger may be read into it.
  const TARGET = '(?:human|the user)';
  const DEFAULT_HUMAN = [
    { name: 'bare default to human', controls: ['Default human.', 'Default is human.', 'Default: human.', 'default to human'],
      pattern: new RegExp('\\bdefault(?:s|ed|ing)?\\b\\s*(?:[:\\u2014\\u2013-]\\s*|\\b(?:is|to|be)\\b\\s*)?human\\b', 'i') },
    { name: 'bare default to the user', controls: ['Default: the user.', 'defaults to the user'],
      pattern: new RegExp('\\bdefault(?:s|ed|ing)?\\b\\s*(?:[:\\u2014\\u2013-]|\\b(?:is|to|be)\\b)\\s*the user\\b', 'i') },
    { name: 'default when unsure', controls: ['Default when unsure: every step human.', 'Default if in doubt'],
      pattern: /\bdefault\b[^.;]*\b(?:when|if)\b[^.;]*\b(?:unsure|in doubt|uncertain|unclear|not certain)\b/i },
    { name: 'uncertainty sends it to a person', controls: ['Steps whose runner is unclear go to the user.',
      'When you cannot be certain an agent can do it, mark the step human.', 'If in doubt, the step is human.'],
      pattern: new RegExp('\\b(?:unsure|uncertain|in doubt|cannot be certain|not certain|unclear|ambiguous|do not know)\\b[^.;]*\\b' + TARGET + '\\b', 'i') },
    { name: 'start from a person and downgrade', controls: ['Start from human and downgrade to agent once a runner is confirmed.',
      'Begin with the user and promote to agent later.'],
      pattern: new RegExp('\\b(?:start|starts|starting|begin|begins|beginning)\\b[^.;]*\\b(?:from|with|as|at)\\b[^.;]*\\b' + TARGET + '\\b', 'i') },
    { name: 'by default, either order', controls: ['Steps are human by default.', 'By default the user runs them.'],
      pattern: new RegExp('\\bby default\\b[^.;]*\\b' + TARGET + '\\b|\\b' + TARGET + '\\b[^.;]*\\bby default\\b', 'i') },
    { name: 'every or all steps', controls: ['every step human', 'all steps go to the user'],
      // The gap here is a whitelist of connectors, not `[^.;]*`: an open gap also matched
      // "what every step in that section asks the user to test" in build-smoke-page.mjs,
      // and a sweep that cries wolf gets deleted by the next author.
      pattern: new RegExp('\\b(?:every|all|each)\\s+steps?\\b(?:\\s+(?:is|are|be|to|go|goes|stay|stays|remain|remains|become|becomes|marked|tagged|assigned|as|a|an|the))*\\s+' + TARGET + '\\b', 'i') },
    { name: 'err, prefer or lean toward', controls: ['err on the side of human', 'prefer the user here', 'lean toward human'],
      pattern: new RegExp('\\b(?:err|prefer|prefers|favour|favours|favor|favors|lean|leans|leaning|bias|biased)\\b[^.;]*\\b' + TARGET + '\\b', 'i') },
    { name: 'fall back to a person', controls: ['fall back to human', 'the fallback is the user'],
      pattern: new RegExp('\\bfalls?[\\s-]*back\\b[^.;]*\\b' + TARGET + '\\b|\\bfallback\\b[^.;]*\\b' + TARGET + '\\b', 'i') },
    { name: 'no test, therefore a person', controls: ['no test can prove it, so the step is human',
      'no fixture covers it, therefore the user runs it'],
      pattern: new RegExp('\\bno (?:test|fixture)\\b[^.;]*\\b(?:so|therefore|hence|thus|which means)\\b[^.;]*\\b' + TARGET + '\\b', 'i') },
    { name: 'safer or more conservative', controls: ['it is safer to make the step human', 'the conservative choice is the user'],
      pattern: new RegExp('\\b(?:safer|safest|conservative|conservatively|cautious|prudent)\\b[^.;]*\\b' + TARGET + '\\b', 'i') },
    { name: 'human unless proven agent', controls: ['human unless proven agent-runnable', 'the user unless confirmed agent-runnable'],
      pattern: /\bunless\b[^.;]*\b(?:proven|demonstrated|confirmed|verified|established)\b[^.;]*\bagent\b/i },
    { name: 'hand the work to the user', controls: ['hand the step to the user when unsure', 'defer it to the user'],
      pattern: /\b(?:hand|hands|handing|give|gives|assign|assigns|push|pushes|defer|defers)\b[^.;]*\bto the user\b/i },
    { name: 'the user does the running', controls: ['the user executes the steps', 'the user performs every smoke step'],
      pattern: /\bthe user\b[^.;]*\b(?:executes|performs|runs|carries out)\b[^.;]*\bsteps?\b/i }
  ];
  const NEGATION = /\b(?:never|not|no longer|rather than|instead of|nothing|neither|nor)\b/i;
  const flagClauses = text => text.split(/(?<=[.;])\s+/).flatMap(clause =>
    NEGATION.test(clause) ? [] : DEFAULT_HUMAN.filter(({ pattern }) => pattern.test(clause))
      .map(({ name }) => name + ' :: ' + clause.trim()));
  // Signature 1, twice over, is what a `.some()` control invites: one armed pattern makes
  // the whole family look alive, and nine dead ones sweep clean over anything. Every
  // pattern is armed through the SAME code path the sweep runs, and both array sizes are
  // pinned so a silently dropped member is caught.
  assert.equal(DEFAULT_HUMAN.length, 14, 'the default-human family must keep all fourteen patterns');
  assert.equal(new Set(DEFAULT_HUMAN.map(entry => entry.name)).size, 14, 'pattern names must be distinct');
  assert.equal(DEFAULT_HUMAN.reduce((sum, entry) => sum + entry.controls.length, 0), 32,
    'the control corpus must keep all thirty-two strings');
  for (const { name, pattern, controls } of DEFAULT_HUMAN) {
    assert.ok(controls.length >= 2, name + ': every pattern needs at least two control strings');
    for (const control of controls) {
      assert.match(control, pattern, name + ': its own control no longer matches it — "' + control + '"');
      assert.ok(flagClauses(control).some(hit => hit.startsWith(name + ' :: ')),
        name + ': the sweep as actually run does not flag its own control — "' + control + '"');
    }
  }
  // Spellings this repository really wrote, and the paraphrases a review inserted into
  // protocol.md's runner paragraph while an earlier version of this sweep stayed green.
  for (const regression of ['environment. Default human. At close-out',
    'fixture environment. Default is human. Before',
    'prohibitions (default human; "touches data" is human',
    'touch live data)? Default when unsure: every step human.',
    'Default: human.',
    'Steps whose runner is unclear go to the user.',
    'When you cannot be certain an agent can do it, mark the step human.',
    'Start from human and downgrade to agent once a runner is confirmed.']) {
    assert.ok(flagClauses(regression).length > 0, 'the sweep no longer catches: "' + regression + '"');
  }
  for (const file of shipped) {
    const flagged = flagClauses(collapsed(file));
    assert.equal(flagged.length, 0, file + ': a blanket human default contradicts the runner rule — ' + flagged.join(' || '));
  }
  // The rest of BL-016: why the old default was wrong, and what a checkpoint costs.
  const models = collapsed('orchestrate/references/execution-models.md');
  assert.match(models, /fixtures are isolated from the real machine by design and a subagent is not/i,
    'execution-models.md must say why "no test can verify this" is not "no agent can verify this"');
  assert.match(models, /checkpoint asks the user for a VERDICT, not for labour/,
    'execution-models.md must say a checkpoint asks for a verdict, not for labour');
});
