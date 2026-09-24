// prompt.mjs renders the six per-batch prompts from a ledger built here from the REAL
// templates. Each render is compared WHOLE against an oracle written here — the live
// skeleton block, composed and filled from a table of expected values keyed by every slot
// the renderer knows — so a slot bound to the wrong value, a role bound to the wrong block
// or a second substitution pass all go red. Also pinned: the nonce only on the file's last
// line and nowhere a reader could see it without opening the file, and nothing written on
// any refusal.
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

// The two stated defaults, written here rather than read from the renderer.
const GUARDRAILS_DEFAULT = 'none recorded; apply general correctness scrutiny to async/lifecycle/state boundaries';
const DUTY_DEFAULT = 'Also, for every new or re-pointed test, name the production mutation that would still pass it.';
// Every role's facts as --help must list them (as sets: --help prints them in slot order).
const ROLE_FACTS = {
  implementer: ['guardrails', 'repoPath', 'scratchpadPath', 'worktreePath'],
  polish: ['findingsFile'],
  'fix-round': ['findingsFile', 'round', 'scratchpadPath'],
  reviewer: ['failingOnBase', 'findingsFile', 'gateAgentsRun', 'guardrails', 'repoPath', 'round', 'scratchpadPath', 'worktreePath'],
  'reviewer-round2': ['failingOnBase', 'findingsFile', 'gateAgentsRun', 'guardrails', 'previousFindingsFile', 'repoPath', 'round', 'round1Sha', 'scratchpadPath', 'worktreePath'],
  'test-hunter': ['findingsFile', 'repoPath', 'round', 'scratchpadPath', 'testingGuidePath', 'worktreePath'],
};
const ROLES = Object.keys(ROLE_FACTS);
// Role → the block it renders, written here, independent of the renderer's own table.
const ROLE_BLOCK = { implementer: 'implementer', polish: 'polish', 'fix-round': 'fix-round', reviewer: 'reviewer', 'reviewer-round2': 'reviewer', 'test-hunter': 'test-hunter' };

// Every slot token the renderer knows plus the replacement patterns String.replace would
// honour ($&, $`, $', $$, $1): text any ledger or guardrails file may legitimately quote.
let QUOTING;
test.before(async () => {
  const { SLOTS } = await api();
  QUOTING = Object.keys(SLOTS).join(' ') + " $& $` $' $$ $1";
});

// ===== A ledger filled from the real templates ========================================
const CHANGE_ID = 'PT-20260923-render', LEDGER_DIR = '.agents/changes/' + CHANGE_ID;
const BATCH_GUARDRAILS = 'a guard that samples its domain · quoting `[NN]`';
const values = () => ({
  CHANGE_ID, LEDGER_DIR, SKILL_DIR: 'C:/skill copy/orchestrate', SKILL_SHA256: 'ab'.repeat(32),
  INTEGRATION_BRANCH: 'chore/pt-ledger', WORKTREE_SETUP: 'npm ci --no-audit', MAIN_BRANCH: 'main',
  REPO_CONVENTIONS: '- **Conventions marker.** Keep additions surgical.\n- Quoting: ' + QUOTING,
  EXTRA_PROHIBITIONS: 'Prohibition marker: never touch `vendor/`. ' + QUOTING,
  // A `#` comment inside the fenced recipe looks like a heading to a parser that is not fence-aware.
  VALIDATION_COMMANDS: '```powershell\n# a comment line, not a heading\n# ' + QUOTING + '\nnode --test\n```',
  BATCH_NUM: '01', BATCH_TITLE: 'Render me', BATCH_TYPE: 'feature', BATCH_VERSION: '—', BATCH_BRANCH: 'feat/render-me',
  BATCH_FILES: '`src/a.js`, `tests/a.test.cjs`', BATCH_GUARDRAILS,
});
const fillWith = (text, v) => text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (token, key) => key in v ? v[key] : 'example-' + key.toLowerCase());
const strip = text => text.replace(/<!--[\s\S]*?-->/g, '');
const guardrailsMd = () => ['# Project', '', '## Bug-class guardrails', '', 'Guardrail marker one.', '', '### A subsection', '',
  'Subsection marker: ' + QUOTING, '', '```bash', '## not a heading inside a fence', '```', '', '## Next section', '', 'Outside marker.', ''].join('\n');
const guardrailsBody = md => md.slice(md.indexOf('Guardrail marker one.'), md.indexOf('\n\n## Next section'));

function batchFile(v, eol) {
  const quoting = 'This batch quotes, literally: ' + QUOTING;
  const text = fillWith(read('orchestrate/templates/02-batch.md'), v)
    .replace(/(## Implementation notes\n)\n<!--[\s\S]*?-->/, (all, heading) => heading + '\n' + quoting)
    .replace(/(## Checklist\n)/, '$1\n- [ ] Implement it.\n');
  assert.ok(text.includes(quoting), 'the fixture batch file must carry the quoting line');
  return text.replace(/\n/g, eol);
}
function withRow(text) {
  const lines = text.split('\n'), head = lines.findIndex(l => l.startsWith('| # | Batch |'));
  assert.notEqual(head, -1);
  const row = '| B01 | Render me | feature | M | `feat/render-me` | 1 | `src/a.js`, `tests/a.test.cjs` | C1 | — |';
  return [...lines.slice(0, head + 2), row, ...lines.slice(head + 2)].join('\n');
}
// A contract section as the template lays it out: its heading's body up to the next heading.
function contractBody(contract, heading) {
  const start = contract.indexOf(heading + '\n'); assert.notEqual(start, -1, heading);
  const lines = contract.slice(start + heading.length + 1).split('\n');
  let fenced = false, end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('```')) fenced = !fenced;
    else if (!fenced && /^#{1,6} /.test(lines[i])) { end = i; break; }
  }
  return lines.slice(0, end).join('\n').trim();
}
function fixture(t, { eol = '\n' } = {}) {
  assert.ok(QUOTING, 'the quoting text is built from the renderer\'s registry before any fixture');
  const v = values();
  const temp = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'prompt render '));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 }));
  const ledger = path.join(temp, 'repo', ...LEDGER_DIR.split('/')), worktree = path.join(temp, 'worktree');
  fs.mkdirSync(ledger, { recursive: true }); fs.mkdirSync(worktree);
  const templates = fs.readdirSync(path.join(ROOT, 'orchestrate/templates')).sort();
  assert.deepEqual(templates, ['00-READBEFORE.md', '00-request.md', '01-plan.md', '02-batch.md', 'LOG.md', 'PROGRESS.md'],
    'every shipped template is instantiated below; a new one must join it');
  const tpl = name => fillWith(read('orchestrate/templates/' + name), v);
  const batch = batchFile(v, eol), contract = tpl('00-READBEFORE.md');
  const files = { '00-READBEFORE.md': contract, '00-request.md': strip(tpl('00-request.md')), '01-plan.md': withRow(strip(tpl('01-plan.md'))),
    'PROGRESS.md': strip(tpl('PROGRESS.md')), 'LOG.md': strip(tpl('LOG.md')), '02-batches-01-render-me.md': batch };
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(ledger, name), text);
  const md = guardrailsMd();
  fs.writeFileSync(path.join(worktree, 'CLAUDE.md'), md);
  const slash = p => p.split(path.sep).join('/');
  const facts = {
    repoPath: 'C:/repo path', worktreePath: slash(worktree), scratchpadPath: slash(path.join(temp, 'scratch')),
    findingsFile: slash(path.join(temp, 'scratch', 'gates', 'f.md')), previousFindingsFile: slash(path.join(temp, 'scratch', 'gates', 'p.md')),
    round1Sha: 'abc1234', round: 2, failingOnBase: 'n/a (feature batch)', gateAgentsRun: false, testingGuidePath: 'none',
    guardrails: { file: 'CLAUDE.md', heading: '## Bug-class guardrails' },
  };
  // The value every slot must render to, keyed by every slot the renderer knows.
  const conventions = contractBody(contract, '## Repo conventions (binding)');
  assert.equal(conventions, v.REPO_CONVENTIONS, 'the conventions body is exactly the filled block');
  const expected = {
    '[NN]': '01', '[CHANGE_ID]': CHANGE_ID, '[LEDGER_DIR]': LEDGER_DIR, '[SKILL_DIR]': v.SKILL_DIR,
    '[INTEGRATION_BRANCH]': v.INTEGRATION_BRANCH, '[WORKTREE_SETUP]': v.WORKTREE_SETUP, '[BATCH_BRANCH]': v.BATCH_BRANCH,
    '[FENCE FILES]': v.BATCH_FILES, '[BATCH FILENAME]': '02-batches-01-render-me.md', '[TYPE]': 'feat',
    '[FULL TEXT OF THE BATCH FILE]': batch, '[APPLICABLE GUARDRAILS FROM THE BATCH FILE]': BATCH_GUARDRAILS,
    '[REPO CONVENTIONS BLOCK FROM THE READBEFORE]': conventions,
    '[HARD PROHIBITIONS BLOCK FROM THE READBEFORE]': contractBody(contract, '## Hard prohibitions'),
    '[VALIDATION COMMANDS]': contractBody(contract, '## Validation commands'),
    '[REPO_PATH]': facts.repoPath, '[WORKTREE_PATH]': facts.worktreePath, '[SCRATCHPAD_PATH]': facts.scratchpadPath,
    '[FINDINGS_FILE]': facts.findingsFile, '[PREVIOUS_FINDINGS_FILE]': facts.previousFindingsFile, '[ROUND1_SHA]': facts.round1Sha,
    '[ROUND]': '2', '[FAILING_ON_BASE_RESULT]': facts.failingOnBase, '[TESTING_GUIDE_PATH]': facts.testingGuidePath,
    '[NO GATE AGENT DUTY]': DUTY_DEFAULT, '[GUARDRAILS SECTION TEXT]': guardrailsBody(md), '[ROUND 2 BLOCK]': '',
  };
  return { temp, ledger, worktree, out: path.join(temp, 'scratch', 'prompts'), facts, batch, contract, expected };
}
function writeFacts(fx, role, facts) {
  const file = path.join(fx.temp, role + '-facts.json');
  fs.writeFileSync(file, JSON.stringify(facts));
  return file;
}
const listing = dir => fs.existsSync(dir) ? fs.readdirSync(dir).sort() : [];
const pick = (facts, keys) => Object.fromEntries(keys.map(k => [k, facts[k]]));
const PROMPT_LINE = /^PROMPT (\S(?:.*\S)?) NONCE ([0-9a-f]{12})\n$/;
const render = (fx, role, facts, extra = []) =>
  run(['--ledger', fx.ledger, '--role', role, '--batch', 'B01', '--facts', writeFacts(fx, role, facts), '--out', fx.out, ...extra]);

// ===== The oracle ======================================================================
function blocksByName(text) {
  const map = new Map();
  let open = null;
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    if (line.startsWith('```')) {
      if (open) { if (open.name) map.set(open.name, open.lines.join('\n')); open = null; }
      else open = { name: (/^```prompt:(.+)$/.exec(line) || [])[1], lines: [] };
    } else if (open) open.lines.push(line);
  }
  return map;
}
function expectedRender(skeletons, role, table) {
  const blocks = blocksByName(skeletons);
  let text = blocks.get(ROLE_BLOCK[role]);
  assert.ok(text !== undefined, 'the live skeletons hold a block for ' + role);
  if (role === 'reviewer-round2') text = text.split('[ROUND 2 BLOCK]').join(blocks.get('round-2'));
  const value = slot => { assert.ok(Object.hasOwn(table, slot), 'the oracle has no value for ' + slot); return table[slot]; };
  const kept = text.split('\n').filter(line => { const m = /^\s*(\[[A-Z][A-Z0-9_ -]*\])\s*$/.exec(line); return !(m && value(m[1]) === ''); });
  return kept.join('\n').replace(/\[[A-Z][A-Z0-9_ -]*\]/g, slot => value(slot)) + '\n';
}
// The fixed pointer message, as §Spawning rules publishes it.
function pointer() {
  const found = [...collapse(read(SKELETONS)).matchAll(/`(Your complete instructions are in the file <prompt file>\.[^`]*)`/g)].map(m => m[1]);
  assert.equal(found.length, 1, 'subagent-prompts.md publishes exactly one pointer message');
  return found[0];
}
// One render, checked whole against the oracle, plus everything about the nonce and the file.
function renderedMatches(fx, role, facts, table) {
  const r = render(fx, role, facts);
  assert.equal(r.status, 0, role + ': ' + r.stdout);
  const m = PROMPT_LINE.exec(r.stdout);
  assert.ok(m, role + ': one PROMPT line — ' + JSON.stringify(r.stdout));
  const [, file, nonce] = m;
  const id = new RegExp('^' + CHANGE_ID + '-B01-' + role + '-([0-9a-f]{12})\\.md$').exec(path.basename(file));
  assert.ok(id, role + ': file name ' + path.basename(file));
  assert.notEqual(id[1], nonce, 'the file id is independent of the nonce');
  assert.ok(!file.includes(nonce) && !pointer().includes(nonce), role + ': the nonce is in neither the path nor the pointer');
  assert.equal(path.dirname(path.resolve(file)), path.resolve(fx.out));
  const bytes = fs.readFileSync(file), text = bytes.toString('utf8');
  assert.ok(Buffer.from(text, 'utf8').equals(bytes), role + ': UTF-8 bytes');
  assert.equal(text, expectedRender(read(SKELETONS), role, { ...table, '[NONCE]': nonce }), role + ': the render differs from the oracle');
  assert.equal(text.split(nonce).length - 1, 1, role + ': the nonce occurs exactly once');
  const lines = text.split('\n').filter(l => l.trim());
  assert.equal(lines[lines.length - 1], 'Line 2, directly under line 1: NONCE ' + nonce, role + ': the nonce closes the file');
  return { file, nonce, text };
}

test('--help lists every role with exactly its facts', () => {
  const r = run(['--help']);
  assert.equal(r.status, 0);
  const listed = Object.fromEntries([...r.stdout.matchAll(/^ {2}([a-z0-9-]+): ([A-Za-z0-9, ]+)$/gm)].map(m => [m[1], m[2].split(', ')]));
  assert.deepEqual(Object.keys(listed), ROLES);
  for (const role of ROLES) assert.deepEqual(listed[role].slice().sort(), ROLE_FACTS[role], role);
});

test('every role renders exactly the oracle: each slot its own value, each role its own block, ledger text byte-for-byte', async t => {
  const fx = fixture(t), { SLOTS, BLOCKS, ROLES: roles } = await api();
  // The oracle's table covers the renderer's registry exactly: every slot has a pinned value.
  assert.deepEqual(Object.keys(fx.expected).concat('[NONCE]').sort(), Object.keys(SLOTS).sort());
  assert.equal(Object.keys(SLOTS).length, 28, 'the registry size is pinned; a new slot needs an oracle value');
  // Each role is bound to its own block, and the blocks are exactly those the roles use.
  assert.deepEqual(Object.fromEntries(Object.entries(roles).map(([role, spec]) => [role, spec.block])), ROLE_BLOCK);
  assert.deepEqual([...new Set(Object.values(roles).flatMap(s => [s.block, s.compose].filter(Boolean)))].sort(), BLOCKS.slice().sort());
  // Distinct values, so a slot bound to another slot's value cannot render the same text.
  const scalar = Object.entries(fx.expected).filter(([, value]) => value !== '');
  assert.equal(new Set(scalar.map(([, value]) => value)).size, scalar.length, 'every expected value is distinct');
  const seen = new Set();
  for (const role of ROLES) {
    const { nonce, text } = renderedMatches(fx, role, pick(fx.facts, ROLE_FACTS[role]), fx.expected);
    seen.add(nonce);
    if (ROLE_BLOCK[role] === 'implementer' || ROLE_BLOCK[role] === 'reviewer') {
      // The registry-wide quoting text reaches the file through every inserted section, unchanged.
      assert.ok(text.split(QUOTING).length - 1 >= 3, role + ': the quoting text passes through each inserted section');
    }
  }
  assert.equal(seen.size, ROLES.length, 'every render drew its own nonce');
  assert.equal(listing(fx.out).length, ROLES.length);
});

test('the batch type becomes a conventional-commit type: feature renders feat', async t => {
  const fx = fixture(t), { COMMIT_TYPES } = await api();
  assert.deepEqual(COMMIT_TYPES, { feature: 'feat' });
  const { text } = renderedMatches(fx, 'implementer', pick(fx.facts, ROLE_FACTS.implementer), fx.expected);
  assert.ok(text.includes('("feat: <summary> (batch 01)")') && !text.includes('feature: <summary>'));
});

test('ledger text in a CRLF batch file comes through byte-for-byte and is not refused', t => {
  const fx = fixture(t, { eol: '\r\n' });
  assert.ok(fx.batch.includes('\r\n') && fx.batch.includes(QUOTING));
  const { text } = renderedMatches(fx, 'implementer', pick(fx.facts, ROLE_FACTS.implementer), fx.expected);
  assert.ok(text.includes(fx.batch));
});

test('round 1 renders, and the guardrails "none" and gateAgentsRun true defaults render as stated', async t => {
  const fx = fixture(t);
  renderedMatches(fx, 'reviewer', { ...pick(fx.facts, ROLE_FACTS.reviewer), round: 1 }, { ...fx.expected, '[ROUND]': '1' });
  const fix = renderedMatches(fx, 'fix-round', { ...pick(fx.facts, ROLE_FACTS['fix-round']), round: 1 }, { ...fx.expected, '[ROUND]': '1' });
  assert.ok(fix.text.includes('("fix: batch 01 round 1 — <summary>")'));
  const none = renderedMatches(fx, 'reviewer', { ...pick(fx.facts, ROLE_FACTS.reviewer), guardrails: 'none', gateAgentsRun: true },
    { ...fx.expected, '[GUARDRAILS SECTION TEXT]': GUARDRAILS_DEFAULT, '[NO GATE AGENT DUTY]': '' });
  assert.match(none.text, /or say that none does\.\n6\. /, 'the duty line is dropped, not left blank');
  // The defaults the test states are the renderer's and the skeleton prose's.
  const { DEFAULTS } = await api(), prose = collapse(read(SKELETONS));
  assert.deepEqual(DEFAULTS, { guardrails: GUARDRAILS_DEFAULT, noGateAgentDuty: DUTY_DEFAULT });
  for (const value of Object.values(DEFAULTS)) assert.ok(prose.includes(value), 'subagent-prompts.md must state the default: ' + value);
  const missing = render(fx, 'reviewer', { ...pick(fx.facts, ROLE_FACTS.reviewer), guardrails: { file: 'CLAUDE.md', heading: '## No such heading' } });
  assert.equal(missing.stdout, 'UNKNOWN CLAUDE.md: no heading line "## No such heading"\n'); assert.equal(missing.status, 2);
});

test('a missing fact is UNKNOWN UNFILLED with nothing written, for every fact of every role', async t => {
  const fx = fixture(t), { promptCli, SLOTS } = await api();
  // The published form of the checkpoint's step 10, run as a command.
  const { worktreePath, ...rest } = pick(fx.facts, ROLE_FACTS.implementer);
  assert.ok(worktreePath);
  const r = render(fx, 'implementer', rest);
  assert.equal(r.stdout, 'UNKNOWN UNFILLED [WORKTREE_PATH]\n'); assert.equal(r.status, 2);
  let cases = 0;
  for (const role of ROLES) for (const key of ROLE_FACTS[role]) {
    const facts = pick(fx.facts, ROLE_FACTS[role]); delete facts[key];
    const out = promptCli(['--ledger', fx.ledger, '--role', role, '--batch', 'B01', '--facts', writeFacts(fx, role, facts), '--out', fx.out]);
    const m = /^UNKNOWN UNFILLED (\[[A-Z][A-Z0-9_ -]*\])$/.exec(out.line);
    assert.ok(m, role + ' without ' + key + ': ' + out.line); assert.equal(out.code, 2);
    const entry = SLOTS[m[1]];
    assert.ok(entry.fact === key || (entry.also || []).includes(key), role + ' without ' + key + ' names ' + m[1] + ', a slot of another fact');
    cases++;
  }
  assert.equal(cases, Object.values(ROLE_FACTS).reduce((n, keys) => n + keys.length, 0));
  assert.deepEqual(listing(fx.out), [], 'nothing written');
});

const GUARDRAILS_SHAPE = 'fact guardrails: expected "none" or { "file": "<worktree-relative path>", "heading": "<exact heading line>" }';
test('unknown, foreign and ill-typed facts, and bad invocations, are UNKNOWN with nothing written — one case per check', t => {
  const fx = fixture(t), base = pick(fx.facts, ROLE_FACTS['reviewer-round2']);
  const impl = pick(fx.facts, ROLE_FACTS.implementer);
  const cases = [
    ['implementer', { ...impl, bogus: 'x' }, 'fact bogus is not one role implementer uses (see --help)'],
    ['implementer', { ...impl, round1Sha: 'abc1234' }, 'fact round1Sha is not one role implementer uses (see --help)'],
    ['reviewer-round2', { ...base, gateAgentsRun: 'no' }, 'fact gateAgentsRun: expected true or false'],
    ['reviewer-round2', { ...base, round: 0 }, 'fact round: expected a positive integer'],
    ['reviewer-round2', { ...base, round: '1' }, 'fact round: expected a positive integer'],
    ['reviewer-round2', { ...base, round1Sha: 'XYZ1234' }, 'fact round1Sha: expected a lowercase hex commit id'],
    ['reviewer-round2', { ...base, findingsFile: '   ' }, 'fact findingsFile: expected a non-empty one-line string'],
    ['reviewer-round2', { ...base, findingsFile: 'two\nlines' }, 'fact findingsFile: expected a non-empty one-line string'],
    ['reviewer-round2', { ...base, guardrails: { file: '../CLAUDE.md', heading: '## Bug-class guardrails' } }, GUARDRAILS_SHAPE],
    ['reviewer-round2', { ...base, guardrails: { file: 'CLAUDE.md', heading: '## Bug-class guardrails', extra: 1 } }, GUARDRAILS_SHAPE],
    ['reviewer-round2', { ...base, guardrails: { file: 'CLAUDE.md', heading: 'Bug-class guardrails' } }, GUARDRAILS_SHAPE],
    ['reviewer-round2', [], 'facts must be one JSON object'],
  ];
  for (const [role, facts, expected] of cases) {
    const r = render(fx, role, facts);
    assert.equal(r.stdout, 'UNKNOWN ' + expected + '\n', JSON.stringify(facts)); assert.equal(r.status, 2);
  }
  const factsFile = writeFacts(fx, 'implementer', impl);
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
  const fx = fixture(t), facts = pick(fx.facts, ROLE_FACTS.polish);
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

test('the renderer knows exactly the slots of the live in-scope skeletons, in both directions', async () => {
  const { SLOTS, BLOCKS } = await api(), registry = Object.keys(SLOTS).sort(), skeletons = read(SKELETONS);
  const live = liveSlots(skeletons);
  assert.deepEqual(live.names.slice().sort(), BLOCKS.slice().sort(), 'the in-scope blocks are the renderer\'s blocks');
  assert.ok(live.slots.length >= 20, 'the live slot set was actually read');
  assert.deepEqual(drift(live.slots, registry), { unknown: [], unused: [] });
  // Controls: a slot planted in a block, and a registry slot removed from every block, each show as drift.
  const planted = skeletons.replace('You are the IMPLEMENTER for batch B[NN]', 'You are the IMPLEMENTER [PLANTED SLOT] for batch B[NN]');
  assert.notEqual(planted, skeletons, 'the planted-slot anchor must exist');
  assert.deepEqual(drift(liveSlots(planted).slots, registry), { unknown: ['[PLANTED SLOT]'], unused: [] });
  const removed = skeletons.split('[ROUND1_SHA]').join('abc1234');
  assert.notEqual(removed, skeletons, 'the removal anchor must exist');
  assert.deepEqual(drift(liveSlots(removed).slots, registry), { unknown: [], unused: ['[ROUND1_SHA]'] });
});

// Every refusal the renderer makes about the skeleton itself, planted in a copy: each must
// name its reason exactly and write nothing, and the unaltered copy must render.
test('every skeleton refusal is reached by a planted copy, with its own message and nothing written', t => {
  const fx = fixture(t), skeletons = read(SKELETONS);
  const withSkeletons = (text, role, facts = pick(fx.facts, ROLE_FACTS[role])) => {
    const file = path.join(fx.temp, 'skeletons.md'); fs.writeFileSync(file, text);
    return render(fx, role, facts, ['--skeletons', file]);
  };
  const plant = (from, to) => { const text = skeletons.split(from).join(to); assert.notEqual(text, skeletons, 'anchor must exist: ' + from); return text; };
  const NONCE_LINE = 'Line 2, directly under line 1: NONCE [NONCE]';
  const cases = [
    ['implementer', plant('You are the IMPLEMENTER for batch B[NN]', 'You are the IMPLEMENTER [PLANTED SLOT] for batch B[NN]'), 'UNFILLED [PLANTED SLOT]'],
    ['implementer', plant('- Project guardrails: [GUARDRAILS SECTION TEXT]', '- Project guardrails: [GUARDRAILS SECTION TEXT or "none"]'),
      'irregular slot in the implementer skeleton: [GUARDRAILS SECTION TEXT or "none"]'],
    // The ONE nonce line moved above the report, not a second one added: only the last-line rule refuses it.
    ['implementer', plant('  (NEEDS_FENCE names the path(s), the checklist item, and why the fence must grow.)\n' + NONCE_LINE + '\n```\n\nMain-checkout',
      '  (NEEDS_FENCE names the path(s), the checklist item, and why the fence must grow.)\n```\n\nMain-checkout')
      .replace('REPORT (fixed shape — the orchestrator acts on nothing else):\nLine 1', 'REPORT (fixed shape — the orchestrator acts on nothing else):\n' + NONCE_LINE + '\nLine 1'),
    'the implementer skeleton must carry [NONCE] once, on its last line'],
    ['polish', skeletons + '\n```prompt:polish\nA second polish block.\n```\n', 'skeleton block polish occurs twice'],
    ['polish', skeletons + '\n```prompt:stray\nnever closed\n', 'unbalanced code fence in the skeletons'],
    ['polish', plant('```prompt:polish\n', '```prompt:polished\n'), 'no ```prompt:polish block in the skeletons'],
    ['reviewer-round2', plant('```prompt:round-2\n', '```prompt:round-3\n'), 'no ```prompt:round-2 block in the skeletons'],
    ['reviewer-round2', plant('same commit.\n[ROUND 2 BLOCK]\n', 'same commit.\n'), '[ROUND 2 BLOCK] must occur once in the reviewer block'],
  ];
  for (const [role, text, reason] of cases) {
    const r = withSkeletons(text, role);
    assert.equal(r.stdout, 'UNKNOWN ' + reason + '\n', reason); assert.equal(r.status, 2);
  }
  assert.deepEqual(listing(fx.out), [], 'no refusal wrote a file');
  // A skeleton whose guardrails slot has no [WORKTREE_PATH] beside it still takes, and
  // still needs, the worktree the guardrails file is read from.
  const noWorktreeSlot = plant('Work in your isolated worktree at [WORKTREE_PATH], already', 'Work in your isolated worktree, already');
  const { worktreePath, ...withoutWorktree } = pick(fx.facts, ROLE_FACTS.implementer);
  assert.ok(worktreePath);
  const missing = withSkeletons(noWorktreeSlot, 'implementer', withoutWorktree);
  assert.equal(missing.stdout, 'UNKNOWN UNFILLED [GUARDRAILS SECTION TEXT]\n'); assert.equal(missing.status, 2);
  assert.equal(withSkeletons(noWorktreeSlot, 'implementer').status, 0, 'the worktree fact is accepted for the guardrails read');
  assert.equal(withSkeletons(skeletons, 'implementer').status, 0, 'the unaltered copy renders, so the refusals above are the plants');
  assert.equal(listing(fx.out).length, 2);
});
