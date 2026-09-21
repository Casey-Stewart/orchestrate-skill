// Exercise the shipped builder against the shipped template. No copy of its
// slot-rendering logic lives in this harness.
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { createHash } = require('node:crypto');

const BUILDER = path.join(__dirname, '../orchestrate/tools/build-smoke-page.mjs');
const TEMPLATE_PATH = path.join(__dirname, '../orchestrate/references/smoke-page-template.html');
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
const SHA = 'af57139e302f85a209a9a7695f671345fc7ed6ed';

let builder;
test.before(async () => { builder = await import('file://' + BUILDER.replace(/\\/g, '/')); });

// The gate the contract now specifies: the containment proof executes, and names the
// SHA of the build this sidecar describes. A sidecar for another build needs its own.
const gateFor = sha => ({ intro: 'Prove the build first.',
  commands: ['git switch chore/smoke-hardening-ledger',
    `git merge-base --is-ancestor ${sha} HEAD`,
    `git diff --name-only ${sha}..HEAD`],
  checks: ['<code>git status --porcelain</code> prints nothing.',
    'The containment commands exit 0 and name nothing outside this ledger.'] });
// A build change carries its gate with it, the way a real re-issue does.
const onBuild = sha => ({ buildSha: sha, gate: gateFor(sha) });

const sidecar = (over = {}) => ({
  change: 'Smoke-page hardening', checkpoint: 1, batches: 'B01–B05',
  branch: 'chore/smoke-hardening-ledger', buildSha: SHA, ckptKey: 'orch-smoke-c1',
  version: { now: '0.14.0', was: '0.13.2' }, suite: '27 / 27 pass', knownFailures: 'none',
  gate: gateFor(SHA),
  sections: [
    { n: 1, title: 'Verdict persistence', steps: [
      { n: 1, do: 'Mark step 1 <strong>Fail</strong>.', pass: 'It turns red.', revision: 1 },
      { n: 2, do: 'Reload the page.', pass: 'It is still Fail.', revision: 2 }] },
    { n: 2, title: 'Ledger discovery', steps: [
      { n: 3, do: 'Ask for ledger status.', pass: 'It lists this ledger.', revision: 1,
        pre: { sha: 'af57139', stepRevision: '1', env: 'Git 2.52', evidence: 'evidence/C1/step-03.md' } }] }
  ],
  ...over
});

const build = over => builder.buildSmokePage(sidecar(over), template);
const fails = (over, message) => assert.throws(() => build(over), message);

test('every template slot is filled, and the builder fills no slot the template lacks', () => {
  const declared = new Set(template.match(/\{\{([A-Z_]+)\}\}/g).map(s => s.slice(2, -2)));
  const rendered = new Set(Object.keys(builder.renderSlots(sidecar())));
  assert.deepEqual([...rendered].sort(), [...declared].sort());
  assert.equal(build().includes('{{'), false);
});

test('the same sidecar always produces the same bytes', () => {
  assert.equal(build(), build());
  assert.notEqual(build(), build(onBuild('b'.repeat(40))));
});

for (const [label, newline] of [['LF', '\n'], ['CRLF', '\r\n']]) {
  test(`sections survive the fill verbatim and stay inside the script block (${label} template)`, () => {
    const data = sidecar({ sections: sidecar().sections.map(s => ({ ...s,
      steps: s.steps.map(step => ({ ...step, aside: 'Close the </script> tag reader trap' })) })) });
    const html = builder.buildSmokePage(data, template.replace(/\r?\n/g, newline));
    assert.equal(html.includes('</script> tag reader trap'), false, 'a prose `</script>` must not close the block');
    const match = html.match(/var SECTIONS = (\[[\s\S]*?\]);\r?\n/);
    assert.ok(match, 'the generated page must contain the complete SECTIONS assignment');
    const embedded = match[1];
    assert.deepEqual(JSON.parse(embedded.replace(/<\\\//g, '</')), data.sections);
  });
}

test('facts render in the documented order, with the old version struck through', () => {
  const html = build();
  assert.match(html, /<dt>Branch<\/dt><dd><code>chore\/smoke-hardening-ledger<\/code><\/dd>/);
  assert.match(html, /0\.14\.0 <span class="was">0\.13\.2<\/span>/);
  assert.match(html, /<dt>Tip<\/dt><dd><code>af57139<\/code><\/dd>/);
  const order = ['Branch', 'Version should read', 'Tip', 'Suite', 'Known failures']
    .map(dt => html.indexOf('<dt>' + dt + '</dt>'));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  assert.equal(build({ suite: undefined, knownFailures: undefined, version: undefined })
    .includes('<dt>Suite</dt>'), false);
});

test('the gate renders the documented structure', () => {
  const html = build();
  const gate = html.slice(html.indexOf('gate-eyebrow'), html.indexOf('</ol>'));
  assert.match(gate, /Step 0 — prove you are on the right build/);
  assert.match(gate, /<pre><code>git switch chore\/smoke-hardening-ledger<\/code><\/pre>/);
  assert.match(gate, /<ol class="gate-checks">/);
});

test('derived headings can be overridden without touching the template', () => {
  assert.match(build(), /C1 smoke run — Smoke-page hardening \(0\.14\.0\)/);
  assert.match(build({ copyHeader: 'C1 re-issue' }), /C1 re-issue/);
  assert.match(build({ standfirst: 'All three failures fixed.' }), /All three failures fixed\./);
  assert.match(build(), /3 steps in 2 sections/);
});

test('a sidecar that would produce a broken run sheet is refused', () => {
  fails({ buildSha: 'af57139' }, /full 40- or 64-character/);
  fails({ branch: '' }, /missing: branch/);
  fails({ sections: [] }, /no sections/);
  fails({ gate: { checks: [] } }, /gate has no checks/);
  const dup = sidecar().sections; dup[1].steps[0].n = 2;
  fails({ sections: dup }, /step number 2 is used twice/);
  const noPass = sidecar().sections; delete noPass[0].steps[0].pass;
  fails({ sections: noPass }, /needs both/);
  const noRevision = sidecar().sections; delete noRevision[1].steps[0].pre.stepRevision;
  fails({ sections: noRevision }, /evidence with no stepRevision/);
});

// The one gate whose job is "are you testing the right tree" resolved to eyeballing on
// every run this skill has produced: committing the page moves HEAD past `buildSha`, so
// a `git rev-parse HEAD` comparison can never agree and was waived by hand each time.
test('a gate that cannot prove containment mechanically is refused', () => {
  // The control the whole test rests on: the contract's own gate builds. Every case
  // below removes exactly one thing from it, so no rejection is satisfied by an input
  // that could never have been accepted.
  assert.doesNotThrow(() => build(), 'the gate execution-models.md specifies must build');
  const without = drop => ({ ...gateFor(SHA), commands: gateFor(SHA).commands.filter(c => !c.includes(drop)) });
  fails({ gate: without('merge-base') }, /no containment check: gate\.commands must run `git merge-base --is-ancestor/);
  fails({ gate: without('--name-only') }, /no containment check: gate\.commands must run `git diff --name-only/);
  fails({ gate: { ...gateFor(SHA), commands: [] } },
    /no containment check:.*merge-base --is-ancestor.*and.*diff --name-only.*and.*af57139/);
  fails({ gate: { ...gateFor(SHA), commands: undefined } }, /no containment check/);
  // The hand-written escape hatch both ledgers on this version carried: a prose check
  // asking a human to adjudicate the difference, with nothing that executes.
  fails({ gate: { checks: ['Tested source commit: <code>af57139</code>. A later commit '
    + 'containing only checkpoint artifacts is allowed.'] } }, /no containment check/);
  // Containment of SOME build is not containment of THIS one — and naming this one
  // turns the very same gate into an accepted gate.
  fails({ gate: gateFor('b'.repeat(40)) }, /no containment check:.*the tested build `af57139` itself/);
  assert.doesNotThrow(() => build(onBuild('b'.repeat(40))), 'a gate naming its own build is accepted');
  assert.doesNotThrow(() => build({ gate: gateFor(SHA.slice(0, 7)) }), 'the documented 7-hex short form counts');
  for (const commands of ['git status', 42, true, [null], [42], [['git']], [{}]]) {
    fails({ gate: { ...gateFor(SHA), commands } }, /gate\.commands must be an array of command strings/);
  }
});

// An invisible U+0000 inside a copyable command reached a published hand-over and made
// that command a SyntaxError for anyone who pasted it.
test('an invisible control character anywhere in the sidecar is refused', () => {
  // The domain smoke-page.md publishes, written out independently of the predicate in
  // build-smoke-page.mjs: Unicode Cc entire — C0, DEL and C1 — minus tab and newline.
  // Its size and its edges are asserted, so widening the list and the rule in one edit
  // still reddens. Built from code points, never written as escapes: an editor or
  // transport that decodes an escape puts the invisible byte into this file instead of
  // testing it — the accident the source sweep below exists to catch.
  const c0 = [...Array(0x20).keys()], c1 = [...Array(0x20).keys()].map(i => 0x80 + i);
  const points = [...c0, 0x7f, ...c1];
  assert.equal(points.length, 65, 'the sweep must cover C0, DEL and C1 entire, not a sample');
  assert.deepEqual([Math.min(...points), Math.max(...points)], [0x00, 0x9f]);
  const controls = points.map(i => String.fromCharCode(i));
  const allowed = new Set([String.fromCharCode(9), String.fromCharCode(10)]);
  assert.deepEqual(controls.filter(c => allowed.has(c)).map(c => c.codePointAt(0)), [9, 10]);
  // Each placement reaches a different arm of the recursion AND names its own path in
  // the diagnostic, so deleting a placement and its arm in one edit changes the size.
  const placements = [
    { where: /^sidecar\.gate\.commands\[0\] carries/,
      make: ch => ({ gate: { ...gateFor(SHA), commands: [`git switch main${ch}`, ...gateFor(SHA).commands] } }) },
    { where: /^sidecar\.sections\[0\]\.steps\[0\]\.do carries/,
      make: ch => { const sections = sidecar().sections; sections[0].steps[0].do = `Mark it${ch}Fail.`; return { sections }; } },
    { where: /^sidecar: key "stray/, make: ch => ({ [`stray${ch}key`]: 'a value' }) },
    { where: /^sidecar\.facts\[0\]\.dd carries/, make: ch => ({ facts: [{ dt: 'Note', dd: `plain${ch}text` }] }) }
  ];
  assert.equal(placements.length, 4,
    'an array element, nested step prose, an object KEY and a nested object must all be swept');
  assert.equal(new Set(placements.map(p => String(p.where))).size, 4,
    'each placement must reach a distinct recursion path');
  const reached = new Set();
  for (const ch of controls) {
    const point = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    for (const place of placements) {
      // Both directions on the same placement: tab and newline are the paired positive
      // controls, so a rule that rejected everything would redden here.
      if (allowed.has(ch)) { assert.doesNotThrow(() => build(place.make(ch)), 'U+' + point); continue; }
      let message = '';
      try { build(place.make(ch)); } catch (error) { message = error.message; }
      assert.match(message, place.where, 'U+' + point + ': the diagnostic must name the path it found it at');
      assert.ok(message.includes(`carries control character U+${point};`),
        `U+${point} must be refused and named in the message — got: ${message}`);
      reached.add(String(place.where));
    }
  }
  assert.equal(reached.size, placements.length, 'every placement must actually have produced a rejection');
  // Both edges of the forbidden range. 0x1F, 0x7F, 0x80 and 0x9F are rejected in the
  // sweep above; their neighbours just outside it must build, so a narrowing is as
  // visible as a widening. U+2028/U+2029 are separators, not Cc, and stay legal.
  for (const outside of [0x20, 0x7e, 0xa0, 0xa1, 0x2028, 0x2029]) {
    assert.doesNotThrow(() => build({ change: 'Edge ' + String.fromCharCode(outside) + ' case' }),
      'U+' + outside.toString(16).toUpperCase().padStart(4, '0') + ' is outside Cc and must still build');
  }
});

// Two of the five documentation defects in a published page were a `Section 5` and a
// `Step 3` that no longer existed after a restructure — both mechanically detectable.
test('a Section or Step cross-reference the sidecar does not contain is refused', () => {
  const place = text => { const sections = sidecar().sections;
    sections[0].steps[0].aside = text; return { sections }; };
  // Positive controls, one per thing that must resolve: existing sections, existing
  // steps, the Step 0 gate every page has, and a lower-case phrase that is prose rather
  // than a cross-reference. The domain's size is asserted, so deleting the Step 0
  // control and the Step 0 exemption in one edit cannot stay green.
  const resolving = ['See Section 1 and Section 2.', 'Repeat Step 1, Step 2 and Step 3.',
    'Redo Step 0 first.', 'Mark step 1 and section 9 in your own notes.'];
  assert.equal(resolving.length, 4,
    'sections, steps, the Step 0 gate and the lower-case non-reference each need a control');
  for (const text of resolving) assert.doesNotThrow(() => build(place(text)), text);
  fails(place('Continue from Section 5.'), /"Section 5" refers to a section this sidecar does not contain/);
  fails(place('Repeat Step 4.'), /"Step 4" refers to a step this sidecar does not contain/);
  fails(place('See Section  6.'), /"Section 6" refers to a section/);
  fails(place('There is no Section 0.'), /"Section 0" refers to a section/);
  // Any string in the sidecar, not only step prose.
  fails({ standfirst: 'Start at Step 9.' }, /"Step 9" refers to a step/);
  fails({ gate: { ...gateFor(SHA), checks: ['Then do Section 7.'] } }, /"Section 7" refers to a section/);
  // The paired control for the rejection: the reference is accepted the moment its
  // target exists, so the refusal was about the missing target, not about the wording.
  const withFourth = place('Repeat Step 4.');
  withFourth.sections[1].steps.push({ n: 4, do: 'Perform new check 4.', pass: 'It succeeds.', revision: 1 });
  assert.doesNotThrow(() => build(withFourth));
});

// A page whose script does not parse has no verdict buttons and no copy button, so
// every fill must be checked by compiling the script the user would actually get.
const script = html => html.match(/<script>([\s\S]*?)<\/script>/)[1];
const compiles = html => new vm.Script(script(html));

test('ordinary punctuation in a plain name never breaks the generated script', () => {
  for (const change of ['Fix "Save as"', 'Back\\slash pack', 'Two\nlines', 'A </script> name',
    'Ampersand & <b>markup</b>', 'Separator pack']) {
    compiles(build({ change }));
    const emitted = script(build({ change })).match(/var lines = \["([^\n]*?)", "Current build/)[1];
    assert.equal(JSON.parse('"' + emitted + '"'), `C1 smoke run — ${change} (0.14.0)`,
      'the copy header must survive escaping as the text the user pasted back');
  }
  compiles(build({ copyHeader: 'C1 "re-issue" \\ 2' }));
  assert.match(build({ change: 'A <b> name' }), /<title>A &lt;b&gt; name Smoke Run<\/title>/);
  assert.match(build({ change: 'A <b> name' }), /<h1>A &lt;b&gt; name — smoke run<\/h1>/);
  // Slots the format documents AS HTML keep their markup.
  assert.match(build({ headline: 'Ship <strong>now</strong>' }), /<h1>Ship <strong>now<\/strong><\/h1>/);
});

test('embedded data cannot introduce HTML parser tokens and round-trips unchanged', () => {
  // A regex-extracted script can compile while the browser consumes its closing
  // tag as data after `<!-- <script>`. Check the serialized data boundary too:
  // no literal '<' may enter the script from either JSON or a string slot.
  for (const text of ['<!-- <script>', '<!-- <ScRiPt >', '</script>', '</ScRiPt >',
    '<strong>Keep this markup</strong>', 'Separators\u2028and\u2029newlines\n']) {
    const data = sidecar({ change: `Handle ${text} markers` });
    data.sections[0].steps[0].aside = text;
    const slots = builder.renderSlots(data);
    assert.equal(slots.SECTIONS_JS.includes('<'), false, 'section data must not affect HTML parsing');
    assert.equal(slots.COPY_HEADER.includes('<'), false, 'the derived header must not affect HTML parsing');
    assert.deepEqual(JSON.parse(slots.SECTIONS_JS), data.sections);
    assert.equal(JSON.parse('"' + slots.COPY_HEADER + '"'),
      `C1 smoke run — ${data.change} (0.14.0)`);
    compiles(builder.buildSmokePage(data, template));

    const custom = builder.renderSlots({ ...data, copyHeader: text });
    assert.equal(custom.COPY_HEADER.includes('<'), false, 'an explicit header uses the same protection');
    assert.equal(JSON.parse('"' + custom.COPY_HEADER + '"'), text);
  }
});

test('step and section numbers must be ones the page can tell apart', () => {
  const asString = sidecar().sections; asString[1].steps[0].n = '1';
  fails({ sections: asString }, /step number "1" must be a positive integer/);
  const fraction = sidecar().sections; fraction[0].steps[0].n = 1.5;
  fails({ sections: fraction }, /step number 1.5 must be a positive integer/);
  const zero = sidecar().sections; zero[0].steps[0].n = 0;
  fails({ sections: zero }, /step number 0 must be a positive integer/);
  const absent = sidecar().sections; delete absent[0].steps[0].n;
  fails({ sections: absent }, /step number undefined must be a positive integer/);
  const dupSection = sidecar().sections; dupSection[1].n = 1;
  fails({ sections: dupSection }, /section number 1 is used twice/);
  const badRevision = sidecar().sections; badRevision[0].steps[0].revision = '2';
  fails({ sections: badRevision }, /revision "2" must be a positive integer/);
});

test('keys and provenance that the page cannot use are refused', () => {
  fails({ ckptKey: 'c1"-run' }, /ckptKey must be letters, digits/);
  fails({ ckptKey: 'c1 */ end' }, /ckptKey must be letters, digits/);
  const shortSha = sidecar().sections; shortSha[1].steps[0].pre.sha = 'af57';
  fails({ sections: shortSha }, /pre.sha must be at least 7 hex characters/);
  compiles(build({ ckptKey: 'orch-smoke.c1_2' }));
});

test('checkpoint storage keys cannot be coerced from other JSON types', () => {
  for (const ckptKey of [null, 42, true, false, [], ['c1'], {}]) {
    fails({ ckptKey }, /ckptKey must be a nonempty string/);
  }
  fails({ ckptKey: '' }, /missing: ckptKey/);
  fails({ ckptKey: ' ' }, /ckptKey/);
  for (const ckptKey of ['orch-smoke.c1_2', '42']) {
    assert.equal(builder.renderSlots(sidecar({ ckptKey })).CKPT_KEY, ckptKey);
  }
});

const reissue = (current, previous, options = {}) =>
  builder.buildSmokePage(current, template, { previous, ...options });
const newStep = n => ({ n, do: `Perform new check ${n}.`, pass: 'It succeeds.', revision: 1 });

test('reissues append after existing steps, in the final section or new sections', () => {
  const previous = sidecar();
  const original = JSON.stringify(previous);
  const current = sidecar(onBuild('b'.repeat(40)));
  current.sections[1].steps.push(newStep(4));
  current.sections.push({ n: 3, title: 'New coverage', steps: [newStep(5), newStep(6)] });
  const html = reissue(current, previous);
  assert.deepEqual(JSON.parse(builder.renderSlots(current).SECTIONS_JS), current.sections);
  assert.match(html, /6 steps in 3 sections/);
  assert.equal(html, reissue(current, previous));
  assert.deepEqual(current.sections.flatMap(s => s.steps).slice(0, 3), previous.sections.flatMap(s => s.steps));
  assert.equal(JSON.stringify(previous), original, 'validation never edits the previous sidecar');
});

test('reissues reject deletion, renumbering, reordering, and insertion before old steps', () => {
  const previous = sidecar();
  const cases = [
    d => d.sections[0].steps.pop(),
    d => { d.sections[0].steps[0].n = 8; },
    d => d.sections.reverse(),
    d => d.sections[0].steps.reverse(),
    d => d.sections[0].steps.push(newStep(4)),
    d => d.sections[1].steps.unshift(newStep(4))
  ];
  for (const edit of cases) {
    const current = sidecar(); edit(current);
    assert.throws(() => reissue(current, previous), /keep its number and position/);
  }
  // A gap in an older sidecar is not an available identity for newly added work.
  const gapped = sidecar(); gapped.sections[1].steps[0].n = 5;
  const current = structuredClone(gapped); current.sections[1].steps.push(newStep(4));
  assert.throws(() => reissue(current, gapped), /number greater than 5/);
  current.sections[1].steps.splice(1, 1, newStep(7), newStep(6));
  assert.throws(() => reissue(current, gapped), /number greater than 7/);
});

test('instruction changes require revision increases even on the same build', () => {
  for (const field of ['do', 'pass', 'aside', 'unit', 'tag']) {
    const previous = sidecar(), current = sidecar();
    current.sections[0].steps[0][field] = 'A corrected instruction';
    assert.throws(() => reissue(current, previous), /step 1:.*increment revision above 1/, field);
    current.sections[0].steps[0].revision = 2;
    assert.doesNotThrow(() => reissue(current, previous), field);
    assert.equal(current.sections[0].steps[1].revision, 2, 'unaffected revisions are preserved');
  }
  const previous = sidecar(), current = sidecar();
  current.sections[0].steps[0].revision = 2;
  assert.doesNotThrow(() => reissue(current, previous), 'behavior-only changes may bump a revision');
});

test('changing section instructions requires increasing every affected existing revision', () => {
  for (const field of ['title', 'lede', 'need', 'order', 'touchesData']) {
    const previous = sidecar(), current = sidecar();
    current.sections[0][field] = field === 'touchesData' ? true : 'A changed prerequisite';
    assert.throws(() => reissue(current, previous), /step 1:.*section context changed/, field);
    current.sections[0].steps[0].revision++;
    assert.throws(() => reissue(current, previous), /step 2:.*section context changed/, field);
    current.sections[0].steps[1].revision++;
    assert.doesNotThrow(() => reissue(current, previous), field);
  }
});

test('later reissues cannot lose previous revision increases, including by omission', () => {
  const previous = sidecar(), current = sidecar();
  current.sections[0].steps[1].revision = 1;
  assert.throws(() => reissue(current, previous), /step 2: revision cannot decrease from 2 to 1/);
  delete current.sections[0].steps[1].revision;
  assert.throws(() => reissue(current, previous), /step 2: revision cannot decrease from 2 to 1/);
  current.sections[0].steps[1].revision = 2;
  delete current.sections[0].steps[0].revision;
  assert.doesNotThrow(() => reissue(current, previous), 'omitted and explicit initial revisions are equivalent');
  const next = structuredClone(current);
  next.sections[0].steps[0].pass = 'Corrected criterion';
  assert.throws(() => reissue(next, current), /increment revision above 1/);
  next.sections[0].steps[0].revision = 2;
  assert.doesNotThrow(() => reissue(next, current));
  assert.throws(() => reissue(current, next), /revision cannot decrease/);
});

test('page facts, evidence, and JSON key order do not invalidate unchanged instructions', () => {
  const previous = sidecar();
  const current = sidecar({ ...onBuild('b'.repeat(40)), suite: '30 / 30 pass',
    standfirst: 'Reissued after a repair.', copyHeader: 'C1 reissue',
    gate: { ...gateFor('b'.repeat(40)), checks: ['Confirm the new build.'] } });
  current.sections[1].steps[0].pre = { sha: 'b'.repeat(40), stepRevision: 1,
    env: 'New test environment', evidence: 'evidence/C1/new-run.md' };
  current.sections[0].steps[0] = Object.fromEntries(Object.entries(current.sections[0].steps[0]).reverse());
  assert.doesNotThrow(() => reissue(current, previous));
  delete current.sections[1].steps[0].pre;
  assert.doesNotThrow(() => reissue(current, previous));
});

test('checkpoint identity is stable and a clean sheet requires an explicit new storage key', () => {
  const previous = sidecar();
  assert.throws(() => reissue(sidecar({ checkpoint: 2 }), previous), /different checkpoint/);
  const reset = sidecar({ ckptKey: 'orch-smoke-c1r2' });
  assert.throws(() => reissue(reset, previous), /ckptKey changed/);
  assert.doesNotThrow(() => reissue(reset, previous, { resetVerdicts: true }));
  assert.throws(() => reissue(sidecar(), previous, { resetVerdicts: true }), /requires a new ckptKey/);
  assert.throws(() => builder.buildSmokePage(reset, template, { resetVerdicts: true }), /requires a previous sidecar/);
  reset.sections[0].steps[1].revision = 1;
  assert.throws(() => reissue(reset, previous, { resetVerdicts: true }), /revision cannot decrease/);
  const invalidPrevious = sidecar(); invalidPrevious.sections[0].steps[0].n = 2;
  assert.throws(() => reissue(sidecar(), invalidPrevious), /used twice/);
});

test('the command line writes the page, or explains why it did not', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'smoke-build-'));
  const json = path.join(dir, 'smoke-c1.json'), out = path.join(dir, 'smoke-c1.html');
  fs.writeFileSync(json, JSON.stringify(sidecar()));
  const ok = spawnSync(process.execPath, [BUILDER, json, out], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  assert.equal(fs.readFileSync(out, 'utf8'), build());

  fs.writeFileSync(json, JSON.stringify(sidecar({ buildSha: 'nope' })));
  const bad = spawnSync(process.execPath, [BUILDER, json, out], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /full 40- or 64-character/);

  fs.writeFileSync(json, JSON.stringify(sidecar({ ckptKey: null })));
  const invalidKey = spawnSync(process.execPath, [BUILDER, json, out], { encoding: 'utf8' });
  assert.equal(invalidKey.status, 1);
  assert.match(invalidKey.stderr, /ckptKey must be a nonempty string/);
  assert.equal(fs.readFileSync(out, 'utf8'), build(), 'invalid input must preserve the prior page');

  assert.equal(spawnSync(process.execPath, [BUILDER], { encoding: 'utf8' }).status, 2);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('CLI reissues require the last issued snapshot and preserve the old page on failure', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'smoke-reissue-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const json = path.join(dir, 'smoke-c1.json'), out = path.join(dir, 'smoke-c1.html');
  const old = path.join(dir, 'last-issued.json');
  const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data));
  const run = (...args) => spawnSync(process.execPath, [BUILDER, json, out, ...args], { encoding: 'utf8' });
  const previous = sidecar(); write(json, previous); write(old, previous);
  let result = run(); assert.equal(result.status, 0, result.stderr);
  const firstHTML = fs.readFileSync(out, 'utf8');
  result = run(); assert.equal(result.status, 0, 'identical builds remain idempotent');

  const current = sidecar(); current.sections[1].steps.push(newStep(4));
  write(json, current);
  const failsWithoutWriting = (args, message, expectedHTML = firstHTML) => {
    const result = run(...args);
    assert.notEqual(result.status, 0, result.stderr);
    assert.match(result.stderr, message);
    assert.equal(fs.readFileSync(out, 'utf8'), expectedHTML);
  };
  failsWithoutWriting([], /requires --previous/);
  failsWithoutWriting(['--previous', json], /separate snapshot/);
  const alias = path.join(dir, 'input-alias.json'); fs.linkSync(json, alias);
  failsWithoutWriting(['--previous', alias], /separate snapshot/);
  failsWithoutWriting(['--previous'], /argument.*missing/i);
  failsWithoutWriting(['--previuos', old], /Unknown option/);
  current.sections[0].steps[0].do = 'Corrected action'; write(json, current);
  failsWithoutWriting(['--previous', old], /increment revision/);
  current.sections[0].steps[0].revision = 2; write(json, current);
  // Formatting and object-key order do not make a correct snapshot stale.
  write(old, Object.fromEntries(Object.entries(previous).reverse()));
  result = run('--previous', old, '--template', TEMPLATE_PATH);
  assert.equal(result.status, 0, result.stderr);
  const secondHTML = fs.readFileSync(out, 'utf8');
  assert.equal(secondHTML, reissue(current, previous));
  const oldBytes = fs.readFileSync(old, 'utf8');
  assert.deepEqual(JSON.parse(oldBytes), previous, 'the baseline is read-only');

  // Using the first issue again would allow both a dropped step and a rollback.
  write(json, previous);
  failsWithoutWriting(['--previous', old], /does not match the last issued page/, secondHTML);
  write(old, current);
  failsWithoutWriting(['--previous', old], /keep its number and position/, secondHTML);
  write(json, current);
  fs.writeFileSync(out, secondHTML.replace(/\r?\n/g, '\r\n'));
  result = run(); assert.equal(result.status, 0, 'Git line-ending conversion preserves idempotence');
  fs.writeFileSync(out, secondHTML.replace(/\r?\n/g, '\r\n'));
  result = run('--previous', old); assert.equal(result.status, 0, result.stderr);

  for (const input of [json, old]) {
    const before = fs.readFileSync(input, 'utf8');
    result = spawnSync(process.execPath, [BUILDER, json, input, '--previous', old], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /output must not overwrite/);
    assert.equal(fs.readFileSync(input, 'utf8'), before);
  }
  const reset = { ...current, ckptKey: 'orch-smoke-c1r2' }; write(json, reset);
  failsWithoutWriting(['--previous', old], /ckptKey changed/, secondHTML);
  result = run('--previous', old, '--reset-verdicts');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(out, 'utf8'), reissue(reset, current, { resetVerdicts: true }));
});

test('legacy pages require a reproducible baseline before their first guarded reissue', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'smoke-legacy-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const json = path.join(dir, 'smoke-c1.json'), out = path.join(dir, 'smoke-c1.html');
  const old = path.join(dir, 'last-issued.json');
  const previous = sidecar(), current = sidecar(); current.sections[1].steps.push(newStep(4));
  const legacyHTML = build().replace(/\n<!-- smoke-sidecar-sha256:[a-f0-9]{64} -->\n$/, '');
  const run = () => spawnSync(process.execPath, [BUILDER, json, out, '--previous', old], { encoding: 'utf8' });
  fs.writeFileSync(out, legacyHTML);
  fs.writeFileSync(json, JSON.stringify(current));
  fs.writeFileSync(old, JSON.stringify({ ...previous, suite: 'Different issued content' }));
  let result = run(); assert.equal(result.status, 1);
  assert.match(result.stderr, /does not match the last issued page/);
  assert.equal(fs.readFileSync(out, 'utf8'), legacyHTML);
  fs.writeFileSync(old, JSON.stringify(previous));
  result = run(); assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(out, 'utf8'), reissue(current, previous));
});

function inputPackage(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'smoke-real-build-'));
  t.after(() => fs.rmSync(root, { recursive: true, maxRetries: 8, retryDelay: 100 }));
  const put = (name, bytes) => {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), bytes);
    return { path: name, size: Buffer.byteLength(bytes), sha256: createHash('sha256').update(bytes).digest('hex') };
  };
  const report = put('evidence/C1/inputs/validation-001/report.txt', 'Independent workbook fixture validation: passed.\n');
  const workbook = fs.readFileSync(path.join(__dirname, 'fixtures/smoke-inputs/orders.xlsx'));
  const d = sidecar();
  d.inputs = [{ id: 'orders', ...put('evidence/C1/inputs/issue-001/orders.xlsx', workbook),
    requirements: 'Three sheets; text IDs, formulas/caches; total 23.50/count 4.',
    validation: { ...report, command: 'python validate-orders.py orders.xlsx orders.requirements.json',
      exitCode: 0, result: 'All fixture requirements passed.', env: 'Independent B02 validator' },
    mode: 'working-copy', use: 'Copy orders.xlsx to a temporary working file.', reset: 'Recopy the issued original.' }];
  d.sections[0].steps[0].inputs = ['orders']; d.sections[1].steps[0].inputs = ['orders'];
  const json = path.join(root, 'smoke-c1.json'), out = path.join(root, 'smoke-c1.html');
  const write = data => fs.writeFileSync(json, JSON.stringify(data));
  const run = (...args) => spawnSync(process.execPath, [BUILDER, json, out, ...args], { encoding: 'utf8', windowsHide: true });
  return { root, put, report, workbook, d, json, out, write, run };
}

test('imported builder requires actual root/bytes and never accepts supplied digests on faith', t => {
  const f = inputPackage(t);
  assert.throws(() => builder.buildSmokePage(f.d, template), /explicit inputRoot/);
  const original = JSON.stringify(f.d);
  const built = builder.buildSmokePage(f.d, template, { inputRoot: f.root });
  assert.equal(JSON.stringify(f.d), original);
  const emitted = JSON.parse(built.match(/var SECTIONS = (\[[\s\S]*?\]);\r?\n/)[1]);
  assert.deepEqual(emitted[0].steps[0].inputFiles, f.d.inputs);
  assert.equal(emitted[0].steps[1].inputFiles, undefined);
  const bytes = Buffer.from(f.workbook); bytes[150] ^= 1;
  fs.writeFileSync(path.join(f.root, f.d.inputs[0].path), bytes);
  assert.throws(() => builder.buildSmokePage(f.d, template, { inputRoot: f.root }), /SHA-256 mismatch/);
});

test('CLI validates files beside output, preserving old HTML on file, digest, evidence and metadata failures', t => {
  const f = inputPackage(t); f.write(f.d);
  let r = f.run(); assert.equal(r.status, 0, r.stderr);
  const before = fs.readFileSync(f.out), original = path.join(f.root, f.d.inputs[0].path);
  const refuse = (message, ...args) => {
    const result = f.run(...args); assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, message); assert.deepEqual(fs.readFileSync(f.out), before);
  };
  const changed = Buffer.from(f.workbook); changed[200] ^= 1; fs.writeFileSync(original, changed);
  refuse(/SHA-256 mismatch/);
  fs.unlinkSync(original); refuse(/ENOENT/);
  fs.mkdirSync(original); refuse(/not a regular file/); fs.rmdirSync(original);
  fs.writeFileSync(original, f.workbook);
  const report = path.join(f.root, f.report.path), reportBytes = fs.readFileSync(report);
  fs.writeFileSync(report, Buffer.alloc(reportBytes.length)); refuse(/report.txt.*SHA-256 mismatch/);
  fs.writeFileSync(report, reportBytes);
  for (const mutate of [d => { d.inputs[0].use = ''; }, d => { d.sections[0].steps[0].inputs = ['missing']; },
    d => { d.inputs[0].path = '../outside.xlsx'; }]) {
    const invalid = structuredClone(f.d); mutate(invalid); f.write(invalid); refuse(/nonempty|dangling|safe relative/);
  }
  f.write(f.d); r = f.run(); assert.equal(r.status, 0, r.stderr);
  // The source JSON may be elsewhere: file URLs resolve beside the output HTML.
  const snapshot = path.join(f.root, 'snapshots', 'input.json'); fs.mkdirSync(path.dirname(snapshot));
  fs.writeFileSync(snapshot, JSON.stringify(f.d));
  r = spawnSync(process.execPath, [BUILDER, snapshot, f.out], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
});

test('CLI reissue refuses to overwrite the existing HTML declared as an issued input', t => {
  const f = inputPackage(t), previous = sidecar();
  f.write(previous);
  let result = f.run();
  assert.equal(result.status, 0, result.stderr);
  const issuedBytes = fs.readFileSync(f.out);
  const prior = path.join(f.root, 'last-issued.json');
  fs.writeFileSync(prior, JSON.stringify(previous));
  const current = structuredClone(previous);
  current.inputs = [{ ...f.d.inputs[0], id: 'prior-page', path: path.basename(f.out),
    size: issuedBytes.length, sha256: createHash('sha256').update(issuedBytes).digest('hex'),
    requirements: 'Preserve the issued prior page as an immutable input.',
    mode: 'read-only', use: 'Read the issued prior page.', reset: 'Recopy the preserved original page.' }];
  current.sections[0].steps[0].inputs = ['prior-page'];
  current.sections[0].steps[0].revision++;
  f.write(current);
  result = f.run('--previous', prior);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /output must not overwrite an issued input artifact/);
  assert.deepEqual(fs.readFileSync(f.out), issuedBytes, 'the entire issued input/output must remain byte-identical');
  assert.deepEqual(JSON.parse(fs.readFileSync(prior, 'utf8')), previous, 'the exact prior sidecar remains intact');
});

test('shared stable IDs require EVERY referencing revision for path, bytes and all semantic metadata changes', t => {
  const f = inputPackage(t);
  const edits = [
    d => { d.inputs[0].requirements += ' Check another edge case.'; },
    d => { d.inputs[0].use += ' Change C2.'; },
    d => { d.inputs[0].reset += ' Verify restored value.'; },
    d => { d.inputs[0].mode = 'read-only'; },
    d => { d.inputs[0].validation.command += ' --changed'; },
    d => { d.inputs[0].validation.result += ' New result text.'; },
    d => { d.inputs[0].validation.env += ' New environment.'; },
    d => { Object.assign(d.inputs[0], f.put('evidence/C1/inputs/issue-002/orders.xlsx', f.workbook)); },
    d => { const bytes = Buffer.from(f.workbook); bytes[200] ^= 1;
      Object.assign(d.inputs[0], f.put('evidence/C1/inputs/issue-002/orders.xlsx', bytes)); }
  ];
  for (const edit of edits) {
    const current = structuredClone(f.d); edit(current);
    current.inputHistory = [{ path: f.d.inputs[0].path, sha256: f.d.inputs[0].sha256, size: f.d.inputs[0].size }];
    const options = { previous: f.d, inputRoot: f.root };
    assert.throws(() => builder.buildSmokePage(current, template, options), /step 1:.*resolved inputs changed.*increment revision/);
    current.sections[0].steps[0].revision++;
    assert.throws(() => builder.buildSmokePage(current, template, options), /step 3:.*resolved inputs changed.*increment revision/);
    current.sections[1].steps[0].revision++;
    assert.doesNotThrow(() => builder.buildSmokePage(current, template, options));
    assert.equal(current.sections[0].steps[1].revision, f.d.sections[0].steps[1].revision);
    assert.equal(current.buildSha, f.d.buildSha, 'same-build changes must still invalidate input consumers');
  }
});

test('shared validation report identity changes invalidate all input consumers and require its historical bytes', t => {
  const f = inputPackage(t), current = structuredClone(f.d);
  current.inputs.push({ ...structuredClone(current.inputs[0]), id: 'second' });
  current.sections[1].steps[0].inputs = ['second'];
  const previous = structuredClone(current);
  const proof = f.put('evidence/C1/inputs/validation-002/report.txt', 'New independent validation.\n');
  current.inputs.forEach(input => Object.assign(input.validation, proof));
  current.inputHistory = [f.report];
  const options = { previous, inputRoot: f.root };
  assert.throws(() => builder.buildSmokePage(current, template, options), /step 1:.*increment revision/);
  current.sections[0].steps[0].revision++;
  assert.throws(() => builder.buildSmokePage(current, template, options), /step 3:.*increment revision/);
  current.sections[1].steps[0].revision++;
  assert.doesNotThrow(() => builder.buildSmokePage(current, template, options));
  fs.unlinkSync(path.join(f.root, f.report.path));
  assert.throws(() => builder.buildSmokePage(current, template, options), /validation-001.*ENOENT/);
});

test('LF/CRLF-only reissue refuses stale bytes then enforces new paths, all revisions and multi-issue history', t => {
  const f = inputPackage(t);
  Object.assign(f.d.inputs[0], f.put('evidence/C1/inputs/issue-001/raw.txt', 'one\ntwo\n'));
  f.write(f.d); let r = f.run(); assert.equal(r.status, 0, r.stderr);
  const before = fs.readFileSync(f.out), old = path.join(f.root, 'snapshots', 'previous.json');
  fs.mkdirSync(path.dirname(old)); fs.writeFileSync(old, JSON.stringify(f.d));
  const source = path.join(f.root, f.d.inputs[0].path);
  fs.writeFileSync(source, 'one\r\ntwo\r\n');
  r = f.run('--previous', old); assert.equal(r.status, 1); assert.match(r.stderr, /size mismatch/);
  assert.deepEqual(fs.readFileSync(f.out), before);
  const current = structuredClone(f.d); Object.assign(current.inputs[0], f.put(f.d.inputs[0].path, 'one\r\ntwo\r\n'));
  current.sections[0].steps[0].revision++; current.sections[1].steps[0].revision++;
  f.write(current); r = f.run('--previous', old); assert.equal(r.status, 1); assert.match(r.stderr, /immutable/);
  assert.deepEqual(fs.readFileSync(f.out), before);
  fs.writeFileSync(source, 'one\ntwo\n');
  Object.assign(current.inputs[0], f.put('evidence/C1/inputs/issue-002/raw.txt', 'one\r\ntwo\r\n'));
  f.write(current); r = f.run('--previous', old); assert.equal(r.status, 1); assert.match(r.stderr, /missing from inputs\/inputHistory/);
  current.inputHistory = [{ path: f.d.inputs[0].path, sha256: f.d.inputs[0].sha256, size: f.d.inputs[0].size }];
  current.sections[1].steps[0].revision--; f.write(current);
  r = f.run('--previous', old); assert.equal(r.status, 1); assert.match(r.stderr, /step 3:.*increment revision/);
  current.sections[1].steps[0].revision++; f.write(current);
  r = f.run('--previous', old); assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(source, 'utf8'), 'one\ntwo\n');
  const second = fs.readFileSync(f.out); fs.writeFileSync(old, JSON.stringify(current));
  fs.unlinkSync(source); r = f.run('--previous', old);
  assert.equal(r.status, 1); assert.match(r.stderr, /issue-001.*ENOENT/);
  assert.deepEqual(fs.readFileSync(f.out), second);
  fs.writeFileSync(source, 'one\ntwo\n');
  delete current.inputHistory; f.write(current); r = f.run('--previous', old);
  assert.equal(r.status, 1); assert.match(r.stderr, /missing.*issue-001/);
  assert.deepEqual(fs.readFileSync(f.out), second);
});
