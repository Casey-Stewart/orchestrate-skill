// prompt.mjs renders the six per-batch prompts from a ledger built here from the REAL
// templates. The properties pinned: every slot filled, ledger text inserted byte-for-byte
// (slot tokens it quotes included), the nonce only on the file's last line and nowhere a
// reader could see it without opening the file, and nothing written on any refusal.
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const TOOL = path.join(ROOT, 'orchestrate/tools/prompt.mjs');
const SKELETONS = 'orchestrate/references/subagent-prompts.md';
const collapse = text => text.replace(/\s+/g, ' ');
const api = () => import(pathToFileURL(TOOL).href);
const run = (args, cwd = ROOT) => {
  const r = spawnSync(process.execPath, [TOOL, ...args], { cwd, encoding: 'utf8', windowsHide: true, timeout: 60000 });
  assert.ifError(r.error); assert.equal(r.stderr, '');
  return r;
};

// ===== A ledger filled from the real templates ========================================
const CHANGE_ID = 'PT-20260923-render', LEDGER_DIR = '.agents/changes/' + CHANGE_ID;
const CONVENTIONS = '- **Conventions marker.** Keep additions surgical.\n- A second binding convention.';
const PROHIBITION = 'Prohibition marker: never touch `vendor/`.';
// A `#` comment inside the fenced recipe looks like a heading to a parser that is not fence-aware.
const RECIPE = '```powershell\n# a comment line, not a heading\nnode --test\n```';
const VALUES = {
  CHANGE_ID, LEDGER_DIR, SKILL_DIR: 'C:/skill copy/orchestrate', SKILL_SHA256: 'ab'.repeat(32),
  INTEGRATION_BRANCH: 'chore/pt-ledger', WORKTREE_SETUP: 'npm ci --no-audit', MAIN_BRANCH: 'main',
  REPO_CONVENTIONS: CONVENTIONS, EXTRA_PROHIBITIONS: PROHIBITION, VALIDATION_COMMANDS: RECIPE,
  BATCH_NUM: '01', BATCH_TITLE: 'Render me', BATCH_TYPE: 'feature', BATCH_VERSION: '—', BATCH_BRANCH: 'feat/render-me',
  BATCH_FILES: '`src/a.js`, `tests/a.test.cjs`', BATCH_GUARDRAILS: 'a guard that samples its domain · quoting `[NN]`',
};
const fill = text => text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (token, key) => key in VALUES ? VALUES[key] : 'example-' + key.toLowerCase());
const strip = text => text.replace(/<!--[\s\S]*?-->/g, '');
// Ledger text that quotes slot tokens and replacement patterns, exactly as a batch file may.
const QUOTING = 'This batch quotes [NN], [SKILL_DIR], [NONCE], [WORKTREE_PATH] and [ROUND 2 BLOCK] literally, plus $& and $1 and $$.';
const GUARDRAILS_MD = ['# Project', '', '## Bug-class guardrails', '', 'Guardrail marker one.', '', '### A subsection', '',
  'Subsection marker.', '', '```bash', '## not a heading inside a fence', '```', '', '## Next section', '', 'Outside marker.', ''].join('\n');

function batchFile(eol = '\n') {
  const text = fill(read('orchestrate/templates/02-batch.md'))
    .replace(/(## Implementation notes\n)\n<!--[\s\S]*?-->/, (all, heading) => heading + '\n' + QUOTING)
    .replace(/(## Checklist\n)/, '$1\n- [ ] Implement it.\n');
  assert.ok(text.includes(QUOTING), 'the fixture batch file must carry the quoting line');
  return text.replace(/\n/g, eol);
}
function withRow(text) {
  const lines = text.split('\n'), head = lines.findIndex(l => l.startsWith('| # | Batch |'));
  assert.notEqual(head, -1);
  const row = '| B01 | Render me | feature | M | `feat/render-me` | 1 | `src/a.js`, `tests/a.test.cjs` | C1 | — |';
  return [...lines.slice(0, head + 2), row, ...lines.slice(head + 2)].join('\n');
}
function fixture(t, { eol } = {}) {
  const temp = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'prompt render '));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 }));
  const ledger = path.join(temp, 'repo', ...LEDGER_DIR.split('/')), worktree = path.join(temp, 'worktree');
  fs.mkdirSync(ledger, { recursive: true }); fs.mkdirSync(worktree);
  const templates = fs.readdirSync(path.join(ROOT, 'orchestrate/templates')).sort();
  assert.deepEqual(templates, ['00-READBEFORE.md', '00-request.md', '01-plan.md', '02-batch.md', 'LOG.md', 'PROGRESS.md'],
    'every shipped template is instantiated below; a new one must join it');
  const batch = batchFile(eol);
  const files = { '00-READBEFORE.md': fill(read('orchestrate/templates/00-READBEFORE.md')), '00-request.md': strip(fill(read('orchestrate/templates/00-request.md'))),
    '01-plan.md': withRow(strip(fill(read('orchestrate/templates/01-plan.md')))), 'PROGRESS.md': strip(fill(read('orchestrate/templates/PROGRESS.md'))),
    'LOG.md': strip(fill(read('orchestrate/templates/LOG.md'))), '02-batches-01-render-me.md': batch };
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(ledger, name), text);
  fs.writeFileSync(path.join(worktree, 'CLAUDE.md'), GUARDRAILS_MD);
  const out = path.join(temp, 'scratch', 'prompts');
  const facts = {
    repoPath: 'C:/repo path', worktreePath: worktree.split(path.sep).join('/'), scratchpadPath: path.join(temp, 'scratch').split(path.sep).join('/'),
    findingsFile: path.join(temp, 'scratch', 'gates', 'f.md').split(path.sep).join('/'), previousFindingsFile: path.join(temp, 'scratch', 'gates', 'p.md').split(path.sep).join('/'),
    round1Sha: 'abc1234', round: 2, failingOnBase: 'n/a (feature batch)', gateAgentsRun: false, testingGuidePath: 'none',
    guardrails: { file: 'CLAUDE.md', heading: '## Bug-class guardrails' },
  };
  return { temp, ledger, worktree, out, facts, batch, contract: files['00-READBEFORE.md'] };
}
function writeFacts(fx, role, facts) {
  const file = path.join(fx.temp, role + '-facts.json');
  fs.writeFileSync(file, JSON.stringify(facts));
  return file;
}
const listing = dir => fs.existsSync(dir) ? fs.readdirSync(dir).sort() : [];

// The role → facts table as --help publishes it: the published form is the interface.
function helpFacts() {
  const r = run(['--help']);
  assert.equal(r.status, 0);
  const roles = {};
  for (const m of r.stdout.matchAll(/^ {2}([a-z0-9-]+): ([A-Za-z0-9, ]+)$/gm)) roles[m[1]] = m[2].split(', ');
  return roles;
}
const ROLES = ['implementer', 'polish', 'fix-round', 'reviewer', 'reviewer-round2', 'test-hunter'];
const pick = (facts, keys) => Object.fromEntries(keys.map(k => [k, facts[k]]));
// The fixed pointer message, as §Spawning rules publishes it.
function pointer() {
  const found = [...collapse(read(SKELETONS)).matchAll(/`(Your complete instructions are in the file <prompt file>\.[^`]*)`/g)].map(m => m[1]);
  assert.equal(found.length, 1, 'subagent-prompts.md publishes exactly one pointer message');
  return found[0];
}
const PROMPT_LINE = /^PROMPT (\S(?:.*\S)?) NONCE ([0-9a-f]{12})\n$/;
function render(fx, role, facts, extra = []) {
  const r = run(['--ledger', fx.ledger, '--role', role, '--batch', 'B01', '--facts', writeFacts(fx, role, facts), '--out', fx.out, ...extra]);
  return r;
}
// A contract section as the template lays it out: its heading's body up to the next heading.
function contractBody(contract, heading) {
  const start = contract.indexOf(heading + '\n'); assert.notEqual(start, -1, heading);
  const rest = contract.slice(start + heading.length + 1), lines = rest.split('\n');
  let fenced = false, end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('```')) fenced = !fenced;
    else if (!fenced && /^#{1,6} /.test(lines[i])) { end = i; break; }
  }
  return lines.slice(0, end).join('\n').trim();
}

test('--help lists every role with its facts; the implementer needs exactly the four the checkpoint issues', () => {
  const roles = helpFacts();
  assert.deepEqual(Object.keys(roles), ROLES);
  assert.deepEqual(roles.implementer.slice().sort(), ['guardrails', 'repoPath', 'scratchpadPath', 'worktreePath']);
  for (const role of ROLES) assert.ok(roles[role].length > 0 && new Set(roles[role]).size === roles[role].length, role);
  assert.ok(roles['reviewer-round2'].includes('previousFindingsFile') && !roles.reviewer.includes('previousFindingsFile'));
});

test('every role renders from a ledger built from the real templates: slots filled, sections verbatim, nonce last and hidden', t => {
  const fx = fixture(t), roles = helpFacts(), point = pointer();
  const conventions = contractBody(fx.contract, '## Repo conventions (binding)');
  const prohibitions = contractBody(fx.contract, '## Hard prohibitions');
  const validation = contractBody(fx.contract, '## Validation commands');
  assert.equal(conventions, CONVENTIONS);
  assert.ok(prohibitions.endsWith(PROHIBITION) && !prohibitions.includes('### '), 'the prohibitions body stops before the next heading');
  assert.ok(validation.includes('# a comment line, not a heading') && validation.includes('/tools/validate.mjs'), 'the validation body runs past the fenced comment');
  const guardrails = GUARDRAILS_MD.slice(GUARDRAILS_MD.indexOf('Guardrail marker one.'), GUARDRAILS_MD.indexOf('\n\n## Next section'));
  const seen = new Set();
  for (const role of ROLES) {
    const r = render(fx, role, pick(fx.facts, roles[role]));
    assert.equal(r.status, 0, role + ': ' + r.stdout);
    const m = PROMPT_LINE.exec(r.stdout);
    assert.ok(m, role + ': one PROMPT line — ' + JSON.stringify(r.stdout));
    const [, file, nonce] = m;
    const name = path.basename(file), id = new RegExp('^' + CHANGE_ID + '-B01-' + role + '-([0-9a-f]{12})\\.md$').exec(name);
    assert.ok(id, role + ': file name ' + name);
    assert.notEqual(id[1], nonce, 'the file id is independent of the nonce');
    assert.ok(!file.includes(nonce) && !point.includes(nonce), role + ': the nonce is in neither the path nor the pointer');
    assert.equal(path.dirname(path.resolve(file)), path.resolve(fx.out));
    seen.add(nonce);
    const bytes = fs.readFileSync(file), text = bytes.toString('utf8');
    // Exactly the rendered bytes: UTF-8, LF, no control character beyond newline.
    assert.ok([...text].every(c => c === '\n' || c.codePointAt(0) >= 32 && !(c.codePointAt(0) >= 127 && c.codePointAt(0) <= 159)), role + ': a control byte in the file');
    assert.equal(Buffer.from(text, 'utf8').equals(bytes), true);
    assert.equal(text.split(nonce).length - 1, 1, role + ': the nonce occurs exactly once');
    const lines = text.split('\n').filter(l => l.trim());
    assert.equal(lines[lines.length - 1], 'Line 2, directly under line 1: NONCE ' + nonce, role + ': the nonce closes the file');
    // Inserted ledger text removed, no slot token is left over from the skeleton.
    const inserted = [fx.batch, conventions, prohibitions, validation, guardrails, VALUES.BATCH_GUARDRAILS];
    const residue = inserted.reduce((acc, piece) => acc.split(piece).join(''), text);
    assert.deepEqual(residue.match(/\[[A-Z][A-Z0-9_ -]*\]/g), null, role + ': an unfilled slot');
    if (['implementer', 'reviewer', 'reviewer-round2'].includes(role)) {
      assert.ok(text.includes(fx.batch), role + ': the batch file byte-for-byte');
      assert.ok(text.includes(validation), role + ': the validation commands section');
      assert.ok(text.includes(guardrails) && text.includes('## not a heading inside a fence') && !text.includes('Outside marker'), role + ': the guardrails section, subsections in, next section out');
      assert.ok(text.includes('a guard that samples its domain · quoting `[NN]`'), role + ': the applicable guardrails line');
    }
    if (role === 'implementer') {
      for (const piece of [conventions, prohibitions, '`src/a.js`, `tests/a.test.cjs`', 'Setup first: npm ci --no-audit.', 'branch (feat/render-me)',
        '`git diff --name-status -M chore/pt-ledger...HEAD`', LEDGER_DIR + '/02-batches-01-render-me.md', '("feature: <summary> (batch 01)")',
        '`node "C:/skill copy/orchestrate/tools/validate.mjs" --spec ' + LEDGER_DIR + '/validate.json --log "' + fx.facts.scratchpadPath + '/<label>.log"`']) {
        assert.ok(text.includes(piece), 'implementer: ' + piece);
      }
      assert.ok(!text.includes('### Complete checkpoint inputs'), 'the prohibitions excerpt stops at the next heading');
    }
    if (role === 'reviewer' || role === 'reviewer-round2') {
      assert.ok(text.includes('### B01 R2 reviewer findings') && text.includes(fx.facts.findingsFile));
      assert.ok(collapse(text).includes('Also, for every new or re-pointed test, name the production mutation that would still pass it.'), 'gateAgentsRun false: the duty');
      assert.equal(text.includes('PREVIOUS FINDINGS'), role === 'reviewer-round2');
      assert.equal(text.includes('`git diff abc1234..HEAD`') && text.includes(fx.facts.previousFindingsFile), role === 'reviewer-round2');
      // Role reviewer drops the slot's line rather than leaving a blank one in its place.
      assert.ok(text.includes('happened in the same commit.\n' + (role === 'reviewer' ? '\nOUTPUT' : 'PREVIOUS FINDINGS')), role + ': the round-2 slot line');
    }
    if (role === 'test-hunter') assert.ok(text.includes('one: none.') && text.includes('### B01 R2 test-hunter findings'));
    if (role === 'polish' || role === 'fix-round') assert.ok(text.includes(fx.facts.findingsFile));
  }
  assert.equal(seen.size, ROLES.length, 'every render drew its own nonce');
  assert.equal(listing(fx.out).length, ROLES.length);
});

test('ledger text quoting slot tokens comes through byte-for-byte, CRLF included, and is not refused', t => {
  const fx = fixture(t, { eol: '\r\n' });
  assert.ok(fx.batch.includes('\r\n') && fx.batch.includes(QUOTING));
  const r = render(fx, 'implementer', pick(fx.facts, helpFacts().implementer));
  assert.equal(r.status, 0, r.stdout);
  const [, file, nonce] = PROMPT_LINE.exec(r.stdout), text = fs.readFileSync(file, 'utf8');
  assert.ok(text.includes(fx.batch), 'the CRLF batch file, quoted tokens and replacement patterns included, byte-for-byte');
  assert.equal(text.split(nonce).length - 1, 1, 'the quoted [NONCE] is not the nonce');
  assert.equal(text.split('[NONCE]').length - 1, 1, 'and comes through as written');
});

test('the guardrails fact renders the named section, or the stated default for "none"', t => {
  const fx = fixture(t), keys = helpFacts().reviewer;
  const facts = { ...pick(fx.facts, keys), guardrails: 'none', gateAgentsRun: true };
  const r = render(fx, 'reviewer', facts);
  assert.equal(r.status, 0, r.stdout);
  const text = fs.readFileSync(PROMPT_LINE.exec(r.stdout)[1], 'utf8');
  assert.ok(!text.includes('Guardrail marker one.'));
  // The two defaults the renderer holds are the ones the skeleton's prose states.
  const prose = collapse(read(SKELETONS));
  return api().then(({ DEFAULTS }) => {
    assert.deepEqual(Object.keys(DEFAULTS).sort(), ['guardrails', 'noGateAgentDuty']);
    for (const value of Object.values(DEFAULTS)) assert.ok(prose.includes(value), 'subagent-prompts.md must state the default: ' + value);
    assert.ok(text.includes('project guardrails: ' + DEFAULTS.guardrails + '\n'), 'the "none" default is rendered');
    assert.ok(!collapse(text).includes(DEFAULTS.noGateAgentDuty), 'gateAgentsRun true: no duty');
    assert.match(text, /or say that none does\.\n6\. /, 'and its line is dropped, not left blank');
    // A missing heading in the named file is a refusal, not an empty section.
    const missing = render(fx, 'reviewer', { ...facts, guardrails: { file: 'CLAUDE.md', heading: '## No such heading' } });
    assert.match(missing.stdout, /^UNKNOWN CLAUDE\.md: no heading line "## No such heading"\n$/); assert.equal(missing.status, 2);
  });
});

test('a missing fact is UNKNOWN UNFILLED with nothing written, for every fact of every role', async t => {
  const fx = fixture(t), roles = helpFacts(), { promptCli, SLOTS } = await api();
  // The published form of the checkpoint's step 10, run as a command.
  const { worktreePath, ...rest } = pick(fx.facts, roles.implementer);
  assert.ok(worktreePath);
  const r = render(fx, 'implementer', rest);
  assert.equal(r.stdout, 'UNKNOWN UNFILLED [WORKTREE_PATH]\n'); assert.equal(r.status, 2);
  assert.deepEqual(listing(fx.out), [], 'nothing written');
  let cases = 0;
  for (const role of ROLES) for (const key of roles[role]) {
    const facts = pick(fx.facts, roles[role]); delete facts[key];
    const out = promptCli(['--ledger', fx.ledger, '--role', role, '--batch', 'B01', '--facts', writeFacts(fx, role, facts), '--out', fx.out]);
    const m = /^UNKNOWN UNFILLED (\[[A-Z][A-Z0-9_ -]*\])$/.exec(out.line);
    assert.ok(m, role + ' without ' + key + ': ' + out.line); assert.equal(out.code, 2);
    const entry = SLOTS[m[1]];
    assert.ok(entry.fact === key || (entry.also || []).includes(key), role + ' without ' + key + ' names ' + m[1] + ', a slot of another fact');
    assert.deepEqual(listing(fx.out), [], role + ' without ' + key + ': nothing written');
    cases++;
  }
  assert.equal(cases, Object.values(roles).reduce((n, keys) => n + keys.length, 0));
});

test('unknown, foreign and ill-typed facts, and bad invocations, are UNKNOWN with nothing written', t => {
  const fx = fixture(t), roles = helpFacts(), base = pick(fx.facts, roles.reviewer);
  const cases = [
    ['implementer', { ...pick(fx.facts, roles.implementer), bogus: 'x' }, /^UNKNOWN fact bogus is not one role implementer uses/],
    ['implementer', { ...pick(fx.facts, roles.implementer), round1Sha: 'abc1234' }, /^UNKNOWN fact round1Sha is not one role implementer uses/],
    ['reviewer', { ...base, gateAgentsRun: 'no' }, /^UNKNOWN fact gateAgentsRun: expected true or false/],
    ['reviewer', { ...base, round: 0 }, /^UNKNOWN fact round: expected a positive integer/],
    ['reviewer', { ...base, guardrails: { file: '../CLAUDE.md', heading: '## Bug-class guardrails' } }, /^UNKNOWN fact guardrails: expected/],
    ['reviewer', { ...base, findingsFile: 'two\nlines' }, /^UNKNOWN fact findingsFile: expected a non-empty one-line string/],
    ['reviewer', [], /^UNKNOWN facts must be one JSON object/],
  ];
  for (const [role, facts, expected] of cases) {
    const r = render(fx, role, facts);
    assert.match(r.stdout, expected); assert.equal(r.status, 2);
  }
  const factsFile = writeFacts(fx, 'implementer', pick(fx.facts, roles.implementer));
  for (const [args, expected] of [
    [['--ledger', fx.ledger, '--role', 'closer', '--batch', 'B01', '--facts', factsFile, '--out', fx.out], /^UNKNOWN unknown role closer/],
    [['--ledger', fx.ledger, '--role', 'implementer', '--batch', 'B02', '--facts', factsFile, '--out', fx.out], /^UNKNOWN 0 batch files 02-batches-02-\*\.md/],
    [['--ledger', fx.ledger, '--role', 'implementer', '--batch', 'B01', '--facts', factsFile], /^UNKNOWN usage/],
    [['--ledger', fx.ledger, '--role', 'implementer', '--batch', 'B01', '--facts', factsFile, '--out', fx.out, '--nonce', 'x'], /^UNKNOWN usage/],
  ]) {
    const r = run(args);
    assert.match(r.stdout, expected); assert.equal(r.status, 2);
    assert.equal(r.stdout.split('\n').length, 2, 'one line');
  }
  assert.deepEqual(listing(fx.out), []);
});

test('two renders draw two nonces and two files', t => {
  const fx = fixture(t), facts = pick(fx.facts, helpFacts().polish);
  const a = PROMPT_LINE.exec(render(fx, 'polish', facts).stdout), b = PROMPT_LINE.exec(render(fx, 'polish', facts).stdout);
  assert.ok(a && b);
  assert.notEqual(a[2], b[2]); assert.notEqual(a[1], b[1]);
  assert.equal(listing(fx.out).length, 2);
});

// ===== Registry ↔ prose, both directions ================================================
// Computed from the live skeletons with a parse of this test's own, looser than the
// renderer's: any `[` + capital up to the next `]`, across lines, so an irregular slot is
// seen too.
function liveSlots(text) {
  const blocks = [], lines = text.replace(/\r\n/g, '\n').split('\n');
  let open = null;
  for (const line of lines) {
    if (line.startsWith('```')) { if (open) { blocks.push(open); open = null; } else open = { info: line.slice(3), body: [] }; }
    else if (open) open.body.push(line);
  }
  assert.equal(open, null, 'balanced fences');
  const scoped = blocks.filter(b => b.info.startsWith('prompt:'));
  return { names: scoped.map(b => b.info.slice(7)), slots: [...new Set(scoped.flatMap(b => [...b.body.join('\n').matchAll(/\[[A-Z][^\[\]]*\]/g)].map(m => m[0])))].sort() };
}
const drift = (live, registry) => ({ unknown: live.filter(s => !registry.includes(s)), unused: registry.filter(s => !live.includes(s)) });

test('the renderer knows exactly the slots of the live in-scope skeletons, in both directions', async t => {
  const { SLOTS, BLOCKS, ROLES: roles } = await api(), registry = Object.keys(SLOTS).sort(), skeletons = read(SKELETONS);
  const live = liveSlots(skeletons);
  assert.deepEqual(live.names.slice().sort(), BLOCKS.slice().sort(), 'the in-scope blocks are the renderer\'s blocks');
  assert.deepEqual(Object.keys(roles), ROLES);
  assert.ok(live.slots.length >= 20, 'the live slot set was actually read');
  assert.deepEqual(drift(live.slots, registry), { unknown: [], unused: [] });
  // Controls: a slot planted in a block, and a registry slot removed from every block, each show as drift.
  const planted = skeletons.replace('You are the IMPLEMENTER for batch B[NN]', 'You are the IMPLEMENTER [PLANTED SLOT] for batch B[NN]');
  assert.notEqual(planted, skeletons, 'the planted-slot anchor must exist');
  assert.deepEqual(drift(liveSlots(planted).slots, registry), { unknown: ['[PLANTED SLOT]'], unused: [] });
  const removed = skeletons.split('[ROUND1_SHA]').join('abc1234');
  assert.notEqual(removed, skeletons, 'the removal anchor must exist');
  assert.deepEqual(drift(liveSlots(removed).slots, registry), { unknown: [], unused: ['[ROUND1_SHA]'] });
  // …and the renderer itself refuses the planted slot, an irregular one, and a moved nonce.
  const fx = fixture(t), facts = writeFacts(fx, 'implementer', pick(fx.facts, helpFacts().implementer));
  const withSkeletons = text => {
    const file = path.join(fx.temp, 'skeletons.md'); fs.writeFileSync(file, text);
    return run(['--ledger', fx.ledger, '--role', 'implementer', '--batch', 'B01', '--facts', facts, '--out', fx.out, '--skeletons', file]);
  };
  assert.equal(withSkeletons(planted).stdout, 'UNKNOWN UNFILLED [PLANTED SLOT]\n');
  const irregular = skeletons.replace('- Project guardrails: [GUARDRAILS SECTION TEXT]', '- Project guardrails: [GUARDRAILS SECTION TEXT or "none"]');
  assert.notEqual(irregular, skeletons, 'the irregular-slot anchor must exist');
  assert.match(withSkeletons(irregular).stdout, /^UNKNOWN irregular slot in the implementer skeleton: \[GUARDRAILS SECTION TEXT or "none"\]/);
  const early = skeletons.replace('Line 1, exactly one of: DONE |', 'NONCE [NONCE]\nLine 1, exactly one of: DONE |');
  assert.notEqual(early, skeletons, 'the moved-nonce anchor must exist');
  assert.match(withSkeletons(early).stdout, /^UNKNOWN the implementer skeleton must carry \[NONCE\] once, on its last line/);
  assert.equal(withSkeletons(skeletons).status, 0, 'the unaltered copy renders, so the refusals above are the plants');
  assert.equal(listing(fx.out).length, 1);
});
