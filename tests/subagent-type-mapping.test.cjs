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

// Heading → the type its spawn line must name, plus the opening of the prompt block
// that line governs, in document order. Enumerated rather than counted, so a skeleton
// added later cannot inherit the silence. The opening line is pinned because two of
// these sections hold a second fenced block (the Implementer's polish prompt, the
// Reviewer's round-2 addendum): without it, deleting a skeleton's actual prompt body
// would leave the later block to satisfy every structural check here.
const SKELETONS = [
  { heading: '## Implementer', type: 'implementer',
    opens: 'You are the IMPLEMENTER for batch B[NN]' },
  { heading: '## Reviewer (the gate — read-only)', type: 'reviewer',
    opens: 'You are the INDEPENDENT REVIEWER for batch B[NN]' },
  { heading: '## Test hunter (optional gate agent — read-only)', type: 'test-hunter',
    opens: 'You hunt tests that cannot fail, for batch B[NN]' },
  { heading: '## QA runner (checkpoint pre-smoke)', type: 'qa-runner',
    opens: 'You are the QA RUNNER for checkpoint C[N]' },
  { heading: '## Artifact proofer (checkpoint post-page)', type: 'qa-runner',
    opens: 'You are the ARTIFACT PROOFER for checkpoint C[N]' },
  { heading: '## Plan pre-flight (scaffold time — read-only)', type: 'reviewer',
    opens: 'You are the independent PRE-FLIGHT reviewer of a change plan' },
  { heading: '## Convergence (change-complete — read-only)', type: 'reviewer',
    opens: 'You verify that change [CHANGE_ID]' },
  { heading: '## Fix-up implementer (repair mini-batch)', type: 'implementer',
    opens: 'You are fixing [a smoke-test failure from checkpoint [CN]' },
];
// One form, everywhere: the orchestrator reads these lines under a token budget and a
// second spelling is a line it can skim past.
const SPAWN = /^\*\*Spawn with\*\* `subagent_type: ([a-z-]+)`\.$/;
const spawnLine = type => '**Spawn with** `subagent_type: ' + type + '`.';

// One fence-aware pass. A `## ` line inside a fenced body is body text, not a heading
// — these skeletons tell sub-agents to paste ledger markdown verbatim, so a pasted
// heading is a real possibility. A "prompt block" is a fenced block addressed to the
// agent ("You …"), which is what a spawn line governs; a shell, YAML or output example
// in some future section is not one and must not be dragged into the rule.
function parse(text) {
  const lines = text.split('\n'), blocks = [];
  const fenced = new Array(lines.length).fill(false);
  let open = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('```')) {
      fenced[i] = true;
      if (open === -1) open = i;
      else { blocks.push({ open, first: lines[open + 1] || '' }); open = -1; }
    } else if (open !== -1) fenced[i] = true;
  }
  assert.equal(open, -1, 'unbalanced ``` fence — the parse below would be wrong');
  const pick = predicate => lines.flatMap((line, at) => !fenced[at] && predicate(line) ? [{ line, at }] : []);
  const headings = pick(l => l.startsWith('## '));
  // The half-open line range of one `##` section, by heading text.
  const bounds = heading => {
    const k = headings.findIndex(h => h.line === heading);
    assert.notEqual(k, -1, 'missing heading: ' + heading);
    return [headings[k].at, k + 1 < headings.length ? headings[k + 1].at : lines.length];
  };
  return {
    lines, fenced, headings, bounds,
    // A section's body as text, and its top-level bullets with their continuation
    // lines. Both are cut from the fence-aware line map rather than by splitting raw
    // text on `\n## ` or `\n- `, so a heading or bullet pasted into a fenced body
    // stays body — every reader of this file goes through one of these.
    section: heading => { const [s, e] = bounds(heading); return lines.slice(s + 1, e).join('\n'); },
    bullets: heading => {
      const [s, e] = bounds(heading), found = [];
      for (let i = s + 1; i < e; i++) {
        if (!fenced[i] && lines[i].startsWith('- ')) found.push([lines[i].slice(2)]);
        else if (found.length) found[found.length - 1].push(lines[i]);
      }
      return found.map(b => b.join('\n'));
    },
    spawns: pick(l => SPAWN.test(l)).map(s => ({ ...s, type: SPAWN.exec(s.line)[1] })),
    promptBlocks: blocks.filter(b => /^You /.test(b.first)),
  };
}
const doc = parse(prompts);
const proto = parse(protocol);

test('every skeleton names its agent type above its prompt block', () => {
  for (const { heading, type, opens } of SKELETONS) {
    const [start, end] = doc.bounds(heading);
    const block = doc.promptBlocks.find(b => b.open > start && b.open < end);
    assert.ok(block, heading + ' has no prompt block');
    assert.ok(block.first.startsWith(opens),
      heading + ' must still open its prompt with "' + opens + '" — found: ' + block.first);
    const spawn = doc.spawns.find(s => s.at > start && s.at < block.open);
    assert.ok(spawn,
      heading + ' must carry `' + spawnLine(type) + '` between its heading and its prompt block');
    assert.equal(spawn.type, type, heading + ' names the wrong agent type');
  }
});

test('no prompt block escapes the mapping', () => {
  const owner = block => {
    const heading = [...doc.headings].reverse().find(h => h.at < block.open);
    return heading ? heading.line : '(before the first heading)';
  };
  assert.deepEqual(doc.promptBlocks.map(owner), SKELETONS.map(s => s.heading),
    'a fenced block addressed to a sub-agent is a skeleton and needs a subagent_type line');
});

test('the spawn lines are one consistent form, in the mapped order', () => {
  assert.deepEqual(doc.spawns.map(s => s.type), SKELETONS.map(s => s.type),
    'the document order of the spawn lines must be exactly the mapping');
  // Only where the orchestrator reads the instruction — between a skeleton's heading
  // and its prompt block — must there be no second spelling of it. Prose elsewhere in
  // the file may discuss the field however it likes.
  for (const { heading } of SKELETONS) {
    const [start] = doc.bounds(heading);
    const block = doc.promptBlocks.find(b => b.open > start);
    for (let i = start + 1; i < block.open; i++) {
      if (!doc.fenced[i] && doc.lines[i].includes('subagent_type:')) {
        assert.match(doc.lines[i], SPAWN, heading + ' carries a second spelling: ' + doc.lines[i]);
      }
    }
  }
});

test('every named type resolves to a shipped definition', () => {
  // The assertion this whole change exists for. Strict: a named type with no definition
  // is a spawn that errors, so this is never softened to a skip or a conditional.
  const named = new Set(doc.spawns.map(s => s.type));
  assert.deepEqual([...named].sort(), ['implementer', 'qa-runner', 'reviewer', 'test-hunter']);
  for (const type of named) {
    const file = '.claude/agents/' + type + '.md';
    assert.ok(fs.existsSync(path.join(ROOT, file)),
      'a skeleton spawns `' + type + '` but ' + file + ' does not exist — that spawn errors');
  }
});

test('§Spawning rules binds the orchestrator to the named type', () => {
  // Selected on both marks the rule carries, so that a future bullet mentioning the
  // field in passing is not mistaken for a second copy of this rule.
  const bullets = doc.bullets('## Spawning rules (orchestrator)')
    .filter(b => b.includes('subagent_type') && /wildcard/i.test(b));
  assert.equal(bullets.length, 1, '§Spawning rules needs exactly one rule about the agent type');
  const bullet = flow(bullets[0]);
  assert.match(bullet, /wildcard/i, 'the rule must forbid a wildcard-tool agent in a read-only role');
  assert.match(bullet, /read-only/, 'the rule must say which roles it protects');
  assert.ok(bullet.includes(CAVEAT), '§Spawning rules must carry the Bash caveat verbatim');
  assert.match(bullet, /Degraded environments/,
    'a reader with no definitions installed must be pointed at the fallback');
});

test('§Degraded environments documents the undefined-agent-types fallback', () => {
  const bullets = proto.bullets('## Degraded environments')
    .filter(b => b.includes('subagent_type') && b.includes('general-purpose'));
  assert.equal(bullets.length, 1, '§Degraded environments needs exactly one undefined-types bullet');
  const bullet = flow(bullets[0]);
  assert.match(bullet, /general-purpose/, 'the bullet must name the substitute');
  assert.match(bullet, /ORCHESTRATOR|orchestrator/,
    'substituting is the orchestrator\'s own job — the spawn errors, it does not fall back by itself');
  assert.match(bullet, /read-only/, 'the prose read-only rules are the only enforcement left');
  assert.match(bullet, /forfeit/i, 'the per-spawn token saving is forfeited until the install');
  // The install must be an action the reader can perform from wherever they are. A
  // filename is not one: this bullet is read by an orchestrator driving a ledger in
  // some other repo, where a bare `README.md` resolves either to a sibling of this
  // file that does not exist or to a project README that says nothing about agents.
  assert.match(bullet, /\.claude\/agents/, 'the bullet must say what to install and where');
  assert.match(bullet, /restart/i, 'and that Claude Code must be restarted before they load');
  assert.doesNotMatch(bullet, /README\.md/,
    'no bare README.md pointer, backticked or not — it dangles for every reader outside the skill repo');
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
    assert.ok(flow(doc.section(heading)).includes(rule),
      heading + ' lost its prose read-only rule: ' + rule);
  }
});

// BL-023: `smoke-page.md` defined a pass that proofs the BUILT page and no skeleton
// invoked it, so it only ever ran when someone remembered. Wiring it in had one hard
// constraint: the QA runner is pre-page by construction ("a FAIL becomes a repair
// mini-batch before the page is issued") and the pass's own definition changes nothing
// about when the runner runs — so it had to become a SECOND skeleton rather than extra
// duties bolted onto the first. These two tests are what stops a later edit from
// collapsing them back together or flipping either one's timing.
const PRE_SMOKE = '## QA runner (checkpoint pre-smoke)';
const POST_PAGE = '## Artifact proofer (checkpoint post-page)';
// Directives that would undo the split, in whichever section they landed. Held as one
// list and armed below, so neither sweep's silence is a canary that could never sing.
const REVERSALS = [
  { name: 'the proofing pass made optional', pattern: /\b(?:optional|skippable|may be (?:skipped|omitted)|can be skipped)\b/i },
  { name: 'the pre-smoke moved after the page', pattern: /\bpre-smoke\b[^.;]*\bafter the page\b/i },
  { name: 'one pass standing in for the other', pattern: /\b(?:replaces|instead of|in place of)\b[^.;]*\b(?:pre-smoke|proofing pass|QA runner)\b/i },
];
const reversals = text => text.split(/(?<=[.;])\s+/).flatMap(clause =>
  REVERSALS.filter(({ pattern }) => pattern.test(clause)).map(({ name }) => name + ' :: ' + clause.trim()));

test('the reversal sweep over the two checkpoint skeletons is armed', () => {
  const ARMED = ['The proofing pass is optional once the runner is green.',
    'The pre-smoke now runs after the page is built.',
    'The proofer runs instead of the QA runner.'];
  assert.equal(ARMED.length, REVERSALS.length, 'every reversal pattern needs its own live control');
  assert.deepEqual([...new Set(ARMED.flatMap(control => reversals(control).map(hit => hit.split(' :: ')[0])))].sort(),
    REVERSALS.map(entry => entry.name).slice().sort(),
    'the controls must arm every reversal pattern and may name none the family has dropped');
});

test('the pre-smoke skeleton keeps its pre-page timing and takes on no post-page duty', () => {
  const section = flow(doc.section(PRE_SMOKE));
  assert.ok(section.includes('A FAIL becomes a repair mini-batch before the page is issued'),
    PRE_SMOKE + ' must still place its repair loop BEFORE the page is issued');
  // Appending the post-page duty HERE is the edit the timing constraint forbids: the
  // runner proves the steps, the proofer proves the bytes the reader receives, and one
  // block doing both contradicts both smoke-page.md and the line pinned above.
  for (const duty of [/published artifact/i, /textContent/, /after the page is (?:built|generated)/i]) {
    assert.doesNotMatch(section, duty,
      PRE_SMOKE + ' has acquired a post-page duty — that belongs in "' + POST_PAGE + '"');
  }
  assert.deepEqual(reversals(section), [], PRE_SMOKE + ' carries a directive that undoes the split');
});

test('the post-page skeleton actually invokes the proofing pass', () => {
  const section = flow(doc.section(POST_PAGE));
  // Instructs the pass rather than mentioning it: the page as the source of the bytes,
  // and the bytes run as they are.
  for (const clause of ['proof the published artifact',
    "read every `<pre><code>` block's `textContent`", 'run exactly those bytes',
    'after the page is built and before the STOP']) {
    assert.ok(section.includes(clause), POST_PAGE + ' must instruct the pass, not merely name it: ' + clause);
  }
  // Both halves say it re-times nothing, so deleting either the prompt's sentence or the
  // prose one leaves the other to redden.
  assert.ok(section.includes("nothing about the pre-smoke's timing changes"),
    POST_PAGE + "'s prompt must tell the agent it re-times nothing");
  assert.ok(section.includes('leaves the pre-smoke above exactly where it is'),
    POST_PAGE + "'s prose must say the same to the orchestrator reading it");
  assert.deepEqual(reversals(section), [], POST_PAGE + ' carries a directive that undoes the pass it invokes');
});
