const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const SCAFFOLDING = 'orchestrate/references/scaffolding.md';
const SKILL = 'orchestrate/SKILL.md';
const FENCED = [SCAFFOLDING, SKILL];
// Collapsed whitespace, so a wrapped reintroduction is caught as surely as a one-line one.
const collapse = text => text.replace(/\s+/g, ' ');
const section = (text, heading) => {
  const start = text.indexOf(heading);
  assert.notEqual(start, -1, 'section heading not found: ' + heading);
  const next = text.indexOf('\n## ', start + heading.length);
  return text.slice(start, next === -1 ? text.length : next);
};

// The interview is sized by prose, so the production code here IS the wording: a
// positive-only suite is defeated by appending one sentence. Every rule below is
// therefore pinned twice — the passage that must be present, and a sweep of BOTH whole
// documents for a directive that would contradict it.

test('the merge arithmetic and the single-round promise are gone from both documents', () => {
  // A1 + A8, negative. These are the exact strings the batch deleted; re-introducing
  // any of them in either document turns this red.
  const removed = [
    'merged down to its 4-question cap',
    '{1+3, 2+6, 4+7, 5}',
    '4-question',
    'fit in one AskUserQuestion call',
    'ONE consolidated interview round',
    'ONE consolidated AskUserQuestion round',
  ];
  for (const file of FENCED) {
    const text = collapse(read(file));
    for (const literal of removed) {
      assert.ok(!text.includes(literal), file + ': must not contain "' + literal + '"');
    }
  }
});

// Each banned pattern is paired with a specimen it MUST match. The specimens are the
// sentences this batch removed (and, for the rules that are pure additions, the
// directive that would undo them), so a typo cannot quietly disarm a sweep: the sweep
// proves it can fire before it reports that it did not.
const CONTRADICTIONS = [
  ['a single interview round', /\b(?:one|a single)\s+(?:consolidated\s+)?(?:AskUserQuestion\s+)?(?:interview\s+)?round\b/i,
    'Interview — ONE consolidated AskUserQuestion round covering only the gaps'],
  ['topics squeezed into one call', /\bfits?\b[^.]{0,60}\b(?:one|a single)\b[^.]{0,20}\bcall\b/i,
    'Batch it: topics 1-7 fit in one AskUserQuestion call only merged down to its cap'],
  ['topics merged to save a call', /\bmerg\w*\b[^.]{0,40}\b(?:topics?|questions?)\b/i,
    'merge the topics until they fit'],
  ['questions merged to save a call', /\b(?:topics?|questions?)\b[^.]{0,40}\bmerg\w*\b/i,
    'genuinely unmergeable topics get two calls; otherwise merge'],
  ['a decision re-asked at approval', /\b(?:re-?ask|ask again|re-?confirm|reconfirm)\b[^.]{0,60}\bapprov/i,
    're-confirm every interview answer at plan approval'],
  ['approval that re-opens a decision', /\bapprov\w*[^.]{0,60}\b(?:re-?ask|ask again|re-?confirm|reconfirm)\b/i,
    'at plan approval, re-ask anything the user may have changed their mind about'],
];

test('no surviving directive in either document contradicts the sizing rule', () => {
  // A1-A5, negative. The live control comes first: a pattern that cannot fire on the
  // very text it was written to catch is not a guard.
  for (const [name, pattern, specimen] of CONTRADICTIONS) {
    assert.match(specimen, pattern, 'the sweep for "' + name + '" must fire on its own specimen');
  }
  for (const file of FENCED) {
    const text = collapse(read(file));
    for (const [name, pattern] of CONTRADICTIONS) {
      assert.doesNotMatch(text, pattern, file + ': surviving directive — ' + name);
    }
  }
});

test('back-to-back calls are the default and four is the schema cap, not a budget', () => {
  // A1, positive.
  const text = collapse(read(SCAFFOLDING));
  assert.match(text, /Back-to-back AskUserQuestion calls are the DEFAULT/);
  assert.match(text, /one question per decision that can independently change the plan/);
  assert.match(text, /four questions per call is the tool's schema cap on `questions`, not a budget/);
  assert.match(text, /issue as many calls as the open gaps need/);
  // The procedure step and the section heading must agree with the body, or a reader
  // who stops at either one still believes in the single round.
  assert.match(text, /2\. \*\*Interview\*\* — back-to-back AskUserQuestion calls, as many as the open gaps need/);
  assert.ok(read(SCAFFOLDING).includes('## Interview (back-to-back AskUserQuestion calls — confirmations + gaps only)'),
    SCAFFOLDING + ': the Interview heading must name back-to-back calls and keep "confirmations + gaps only"');
});

test('compound option labels are banned and the ban is illustrated, not described', () => {
  // A2. The example is the rule: a machine-read convention shown, not summarised.
  const text = collapse(read(SCAFFOLDING));
  assert.match(text, /Never join two independent axes in one option LABEL/);
  assert.match(text, /a `\+` or an `and` in a label is the smell/);
  assert.match(text, /One axis per question, one axis per label/);
  // Sweep: the only double-quoted label joining two axes anywhere in either document is
  // the banned specimen itself. On the base there are none at all, so this is not a
  // vacuous "nothing found" — it demands the illustration exist.
  const compound = FENCED.flatMap(file => [...read(file).matchAll(/"[^"\n]*"/g)].map(m => m[0]))
    .filter(label => label.includes(' + '));
  assert.deepEqual(compound, ['"Full recipe + agent-run smoke"']);
});

test('"confirmations + gaps only" is load-bearing: detection and step 7 are off limits', () => {
  // A3. This is what bounds the question count once the arithmetic is gone.
  const text = collapse(read(SCAFFOLDING));
  assert.match(text, /`confirmations \+ gaps only` is what bounds the count/);
  assert.match(text, /never ask what detection already answered/);
  assert.match(text, /never ask what procedure step 7 will ask again \(plan, wave map, weights, checkpoints, fold-ins\)/);
  // The detection table it defers to must still exist, or the rule is vacuous.
  assert.ok(read(SCAFFOLDING).includes('## Detection heuristics (run before asking anything)'),
    SCAFFOLDING + ': the detection heuristics section the rule defers to must exist');
});

test('a repeat repo collapses the round from the previous ledger contract', () => {
  // A4.
  const text = collapse(read(SCAFFOLDING));
  assert.match(text, /A REPEAT repo needs almost no interview/);
  assert.match(text, /`00-READBEFORE\.md`[^.]{0,120}baked answers[^.]{0,80}defaults/);
  assert.match(text, /a second ledger in the same repository needs one call, or none/);
  // Detection of prior ledgers is SKILL.md's Discovery; if that section is renamed the
  // instruction points at nothing, so pin the anchor it names.
  assert.ok(read(SKILL).includes('## Discovery (every mode starts here)'),
    SKILL + ': §Discovery — the prior-ledger detection this rule relies on — must exist');
});

test('the cap is on REPEATS, not on questions', () => {
  // A5, the counterweight to A1.
  const text = collapse(read(SCAFFOLDING));
  assert.match(text, /Cap REPEATS, not questions/);
  assert.match(text, /Each decision is asked ONCE, its answer recorded verbatim in `00-request\.md`/);
  assert.match(text, /never re-litigated at plan approval or at close-out/);
});

test('interview topic 5 has moved into procedure step 7, with no pointer left behind', () => {
  // A6. Numbers are load-bearing: the list runs 1,2,3,4,6,7 with 5 simply absent.
  const scaffolding = read(SCAFFOLDING);
  const interview = section(scaffolding, '## Interview (');
  const listEnd = interview.indexOf("**Defaults for a repo's FIRST ledger");
  assert.notEqual(listEnd, -1, SCAFFOLDING + ': the topic list must end at the FIRST-ledger defaults paragraph');
  const topicList = interview.slice(0, listEnd);
  const numbers = [...topicList.matchAll(/^(\d+)\. \*\*/gm)].map(m => Number(m[1]));
  // Written independently of the pattern, so a both-at-once edit still fails.
  assert.deepEqual(numbers, [1, 2, 3, 4, 6, 7]);
  assert.equal(numbers.length, 6);
  assert.equal(new Set(numbers).size, 6);
  assert.ok(!numbers.includes(5), SCAFFOLDING + ': the interview list must contain no topic 5');
  // No pointer row survives in the list either: the moved subject is named nowhere in it.
  assert.doesNotMatch(topicList, /wave map/i, SCAFFOLDING + ': no interview topic may mention the wave map');
  assert.doesNotMatch(topicList, /checkpoint placement/i, SCAFFOLDING + ': no interview topic may mention checkpoint placement');

  const procedure = section(scaffolding, '## Procedure');
  const approve = procedure.slice(procedure.indexOf('7. **Approve**'), procedure.indexOf('8. **Fill**'));
  assert.ok(approve.length, SCAFFOLDING + ': procedure step 7 must exist and precede step 8');
  const approveText = collapse(approve);
  for (const subject of ['plan', 'wave map', 'weights', 'checkpoints', 'fold-ins']) {
    assert.ok(approveText.includes(subject), SCAFFOLDING + ': step 7 must name ' + subject + ' — reads: ' + approveText);
  }
  assert.match(approveText, /each batch's weight/, SCAFFOLDING + ': step 7 presents each batch’s weight');
  // Step 7 is moved into, never duplicated.
  assert.equal((procedure.match(/^7\. \*\*/gm) || []).length, 1, SCAFFOLDING + ': exactly one procedure step 7');
  assert.equal((scaffolding.match(/\*\*Approve\*\*/g) || []).length, 1, SCAFFOLDING + ': exactly one Approve step');
  // SKILL.md summarises the same approval and must name weights too.
  assert.match(collapse(read(SKILL)), /user approves plan \+ wave map \+ checkpoints \+ weights \+ fold-ins in one pass/);
});

test('the EXECUTION_MODEL registry row is repointed in its third column only', () => {
  // A7. The row's shape is what protocol-contract.test.cjs reads; only the source moves.
  const row = read(SCAFFOLDING).split('\n').find(l => l.startsWith('| `{{EXECUTION_MODEL}}`'));
  assert.ok(row, SCAFFOLDING + ': the {{EXECUTION_MODEL}} registry row must exist');
  assert.match(row, /^\| `\{\{[A-Z_]+\}\}` \| template/, 'the row must still parse as a template registry row');
  const cells = row.split('|');
  assert.equal(cells[2].trim(), 'template (READBEFORE, PROGRESS)', 'the second column is unchanged');
  assert.match(cells[3], /procedure step 7/, 'the third column must cite procedure step 7');
  assert.doesNotMatch(cells[3], /interview\s*#/i, 'the third column must no longer cite an interview topic');
});

// Every citation of an interview topic anywhere in the product must resolve to a topic
// that still exists. `.agents/` is excluded on purpose: those ledgers are historical
// records that quote the removed text verbatim and are never rewritten.
function sweepFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)) {
    if (entry.name === '.git' || entry.name === '.agents' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sweepFiles(full, out);
    else if (/\.(md|cjs|mjs|js)$/.test(entry.name)) out.push(path.relative(ROOT, full).split(path.sep).join('/'));
  }
  return out;
}

test('every surviving interview-topic citation resolves to a topic that still exists', () => {
  const files = sweepFiles(ROOT);
  // Controls: the sweep really walked the tree and really reached the citing file.
  assert.ok(files.includes(SCAFFOLDING), 'the sweep must reach ' + SCAFFOLDING);
  assert.ok(files.includes(SKILL), 'the sweep must reach ' + SKILL);
  assert.ok(files.length > 10, 'the sweep must walk the repository, not a single directory');
  const cited = [];
  for (const file of files) {
    for (const match of read(file).matchAll(/interview\s*#(\d+)/gi)) cited.push({ file, topic: Number(match[1]) });
  }
  const topics = [...new Set(cited.map(c => c.topic))].sort((a, b) => a - b);
  // The member list is written out, not derived from what was found.
  assert.deepEqual(topics, [1, 2, 3, 4, 6, 7]);
  assert.equal(topics.length, 6);
  const dangling = cited.filter(c => ![1, 2, 3, 4, 6, 7].includes(c.topic));
  assert.deepEqual(dangling, []);
  assert.ok(cited.length >= topics.length, 'each surviving topic must actually be cited somewhere');
});
