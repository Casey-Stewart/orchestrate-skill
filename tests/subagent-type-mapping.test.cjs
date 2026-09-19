// Each prompt skeleton names the agent type the orchestrator must spawn it as. A name
// with no definition behind it is not a soft failure: the Agent tool answers
// `Agent type '<name>' not found` and nothing is spawned at all. So the mapping is
// asserted against the definition files that have to back it, and the documented
// fallback is asserted too — it is what a repo without those files runs on.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const prompts = read('orchestrate/references/subagent-prompts.md');
const protocol = read('orchestrate/references/protocol.md');
// Markdown wraps prose, so "verbatim" is judged on whitespace-collapsed text.
const flow = text => text.replace(/\s+/g, ' ');
const CAVEAT = 'Bash can still write, so "read-only" stays partly conventional; '
  + 'removing Write/Edit closes the easy path, not every path.';

// Heading → the type its spawn line must name, in document order. Enumerated rather
// than counted: counting matches would let a skeleton added later escape the rule.
const MAP = new Map([
  ['## Implementer', 'implementer'],
  ['## Reviewer (the gate — read-only)', 'reviewer'],
  ['## Test hunter (optional gate agent — read-only)', 'test-hunter'],
  ['## QA runner (checkpoint pre-smoke)', 'qa-runner'],
  ['## Plan pre-flight (scaffold time — read-only)', 'reviewer'],
  ['## Convergence (change-complete — read-only)', 'reviewer'],
  ['## Fix-up implementer (repair mini-batch)', 'implementer'],
]);
// One form, everywhere: the orchestrator reads these lines under a token budget and a
// second spelling is a line it can skim past.
const SPAWN = /^\*\*Spawn with\*\* `subagent_type: ([a-z-]+)`\.$/;
const spawnLine = type => '**Spawn with** `subagent_type: ' + type + '`.';

// The body of one `##` section: from its heading to the next one, or the file's end.
function section(text, heading) {
  const start = text.indexOf('\n' + heading + '\n');
  assert.notEqual(start, -1, 'missing heading: ' + heading);
  const body = text.slice(start + heading.length + 2);
  const next = body.indexOf('\n## ');
  return next === -1 ? body : body.slice(0, next);
}

test('every skeleton names its agent type above its prompt block', () => {
  for (const [heading, type] of MAP) {
    const body = section(prompts, heading);
    const fence = body.indexOf('\n```');
    assert.notEqual(fence, -1, heading + ' has no fenced prompt block');
    const head = body.slice(0, fence).split('\n');
    assert.ok(head.includes(spawnLine(type)),
      heading + ' must carry `' + spawnLine(type) + '` between its heading and its prompt block');
  }
});

test('no section with a prompt block escapes the mapping', () => {
  // An eighth skeleton must fail here rather than inherit the enumeration's silence.
  const withBlock = prompts.split('\n').filter(l => l.startsWith('## '))
    .filter(h => section(prompts, h).includes('\n```'));
  assert.deepEqual(withBlock, [...MAP.keys()],
    'a `##` section carrying a prompt block is a skeleton and needs a subagent_type line');
});

test('the spawn lines are one consistent form, in the mapped order', () => {
  const lines = prompts.split('\n').filter(l => l.includes('subagent_type:'));
  for (const line of lines) assert.match(line, SPAWN, 'inconsistent spawn line: ' + line);
  assert.deepEqual(lines.map(l => SPAWN.exec(l)[1]), [...MAP.values()],
    'the document order of the spawn lines must be exactly the mapping');
});

test('every named type resolves to a shipped definition', () => {
  // The assertion this whole change exists for. Strict: a named type with no definition
  // is a spawn that errors, so this is never softened to a skip or a conditional.
  const named = new Set(prompts.split('\n').filter(l => SPAWN.test(l)).map(l => SPAWN.exec(l)[1]));
  assert.deepEqual([...named].sort(), ['implementer', 'qa-runner', 'reviewer', 'test-hunter']);
  for (const type of named) {
    const file = '.claude/agents/' + type + '.md';
    assert.ok(fs.existsSync(path.join(ROOT, file)),
      'a skeleton spawns `' + type + '` but ' + file + ' does not exist — that spawn errors');
  }
});

test('§Spawning rules binds the orchestrator to the named type', () => {
  const bullets = section(prompts, '## Spawning rules (orchestrator)').split(/\n- /)
    .filter(b => b.includes('subagent_type'));
  assert.equal(bullets.length, 1, '§Spawning rules needs exactly one rule about the agent type');
  const bullet = flow(bullets[0]);
  assert.match(bullet, /wildcard/i, 'the rule must forbid a wildcard-tool agent in a read-only role');
  assert.match(bullet, /read-only/, 'the rule must say which roles it protects');
  assert.ok(bullet.includes(CAVEAT), '§Spawning rules must carry the Bash caveat verbatim');
  assert.match(bullet, /Degraded environments/,
    'a reader with no definitions installed must be pointed at the fallback');
});

test('§Degraded environments documents the undefined-agent-types fallback', () => {
  const bullets = section(protocol, '## Degraded environments').split(/\n- /)
    .filter(b => b.includes('subagent_type'));
  assert.equal(bullets.length, 1, '§Degraded environments needs exactly one undefined-types bullet');
  const bullet = flow(bullets[0]);
  assert.match(bullet, /general-purpose/, 'the bullet must name the substitute');
  assert.match(bullet, /ORCHESTRATOR|orchestrator/,
    'substituting is the orchestrator\'s own job — the spawn errors, it does not fall back by itself');
  assert.match(bullet, /read-only/, 'the prose read-only rules are the only enforcement left');
  assert.match(bullet, /forfeit/i, 'the per-spawn token saving is forfeited until the install');
  assert.match(bullet, /README\.md/, 'the bullet must point at the install');
});

// Without the definitions these three lines are the ONLY thing holding a read-only role
// to read-only, so the capability boundary never licenses deleting them.
const PROSE = new Map([
  ['## Reviewer (the gate — read-only)',
    'You did not write this code. Use only Read/Grep/Glob and read-only git'],
  ['## Test hunter (optional gate agent — read-only)',
    'Use only Read/Grep/Glob and read-only git; edit nothing.'],
  ['## Plan pre-flight (scaffold time — read-only)',
    'Use only Read/Grep/Glob; edit nothing.'],
]);

test('the prose read-only rules survive in every read-only skeleton', () => {
  for (const [heading, rule] of PROSE) {
    assert.ok(flow(section(prompts, heading)).includes(rule),
      heading + ' lost its prose read-only rule: ' + rule);
  }
});
