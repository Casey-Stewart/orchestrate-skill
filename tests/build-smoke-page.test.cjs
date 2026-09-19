// Exercise the shipped builder against the shipped template. No copy of its
// slot-rendering logic lives in this harness.
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const BUILDER = path.join(__dirname, '../orchestrate/tools/build-smoke-page.mjs');
const TEMPLATE_PATH = path.join(__dirname, '../orchestrate/references/smoke-page-template.html');
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
const SHA = 'af57139e302f85a209a9a7695f671345fc7ed6ed';

let builder;
test.before(async () => { builder = await import('file://' + BUILDER.replace(/\\/g, '/')); });

const sidecar = (over = {}) => ({
  change: 'Smoke-page hardening', checkpoint: 1, batches: 'B01–B05',
  branch: 'chore/smoke-hardening-ledger', buildSha: SHA, ckptKey: 'orch-smoke-c1',
  version: { now: '0.14.0', was: '0.13.2' }, suite: '27 / 27 pass', knownFailures: 'none',
  gate: { intro: 'Prove the build first.', commands: ['git switch chore/smoke-hardening-ledger'],
    checks: ['<code>git status --porcelain</code> prints nothing.'] },
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
  assert.notEqual(build(), build({ buildSha: 'b'.repeat(40) }));
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
  const current = sidecar({ buildSha: 'b'.repeat(40) });
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
  const current = sidecar({ buildSha: 'b'.repeat(40), suite: '30 / 30 pass',
    standfirst: 'Reissued after a repair.', copyHeader: 'C1 reissue',
    gate: { checks: ['Confirm the new build.'] } });
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
