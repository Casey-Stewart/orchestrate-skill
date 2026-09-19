// Ledger-local delivery regression: execute the issued scripts, never a copy of
// their verdict logic. This file travels with the checkpoint when it is archived.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const beforeHTML = read('smoke-C1-demo-before.html');
const afterHTML = read('smoke-C1-demo-after.html');
const mainHTML = read('smoke-C1.html');
const beforeModel = JSON.parse(read('smoke-C1-demo-before.json'));
const afterModel = JSON.parse(read('smoke-C1-demo-after.json'));
const mainModel = JSON.parse(read('smoke-C1.json'));
const steps = model => model.sections.flatMap(section => section.steps);
const step = (model, n) => steps(model).find(item => item.n === n);
const plain = html => html.replace(/<[^>]*>/g, '');
const introduction = html => {
  const match = html.match(/<p class="standfirst">([\s\S]*?)<\/p>/);
  assert.ok(match, 'issued page exposes its introduction');
  return match[1];
};

async function page(html, storage = {}) {
  const elements = new Map(), timers = new Map();
  let copied = '', timerId = 0;
  class Element {
    constructor(tag = 'div') {
      this.tagName = tag; this.children = []; this.style = {}; this.attrs = {};
      this.listeners = {}; this.value = ''; this.hidden = false;
    }
    set id(value) { this._id = value; elements.set(value, this); }
    get id() { return this._id; }
    set innerHTML(value) {
      this._html = value; this.children = [];
      for (const match of value.matchAll(/<(\w+)[^>]*\bid="([^"]+)"/g)) {
        const child = new Element(match[1]); child.id = match[2]; this.appendChild(child);
      }
    }
    get innerHTML() { return this._html || ''; }
    appendChild(child) { this.children.push(child); return child; }
    removeChild(child) { this.children = this.children.filter(item => item !== child); }
    setAttribute(key, value) { this.attrs[key] = value; }
    getAttribute(key) { return this.attrs[key]; }
    addEventListener(event, fn) { this.listeners[event] = fn; }
    querySelectorAll(selector) {
      const found = [];
      const matches = node => selector.startsWith('.')
        ? (node.className || '').split(' ').includes(selector.slice(1)) : node.tagName === selector;
      const walk = node => {
        for (const child of node.children) { if (matches(child)) found.push(child); walk(child); }
      };
      walk(this); return found;
    }
    querySelector(selector) {
      const [first, ...rest] = selector.split(' ');
      const found = this.querySelectorAll(first)[0];
      return rest.length ? found?.querySelector(rest.join(' ')) || null : found || null;
    }
    scrollIntoView() {}
    select() {}
  }
  for (const match of html.split('<script>')[0].matchAll(/<(\w+)[^>]*\bid="([^"]+)"/g)) {
    const el = new Element(match[1]); el.id = match[2];
  }
  const document = { createElement: tag => new Element(tag), getElementById: id => elements.get(id) || null,
    activeElement: null, body: new Element('body') };
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script, 'issued page contains the real runtime script');
  vm.runInNewContext(script[1], {
    window: { localStorage: { getItem: key => storage[key] || null, setItem: (key, value) => { storage[key] = value; } } },
    document, Date,
    navigator: { clipboard: { writeText: value => { copied = value; return Promise.resolve(); } } },
    setTimeout: fn => { timers.set(++timerId, fn); return timerId; }, clearTimeout: id => timers.delete(id)
  });
  await Promise.resolve();
  const el = id => elements.get(id);
  return {
    storage, el,
    click(n, label) {
      const button = el('step-' + n).querySelectorAll('.vbtn').find(item => item.textContent === label);
      assert.ok(button, 'the real page exposes a ' + label + ' verdict button');
      button.listeners.click();
    },
    note(n, value) {
      // A fake DOM must enforce the user-visible boundary that the older harness
      // omitted: dispatching input directly on a hidden textarea is not a UI route.
      assert.equal(el('step-' + n).querySelector('.note-wrap').hidden, false,
        'the instructed route must expose the note field before entering text');
      const field = el('note-' + n); field.value = value; field.listeners.input();
      const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn());
    },
    instruction(n) { return el('step-' + n).querySelector('.step-do').innerHTML; },
    copy() { el('btn-copy').listeners.click(); return copied; },
    record(n) { return JSON.parse(storage[beforeModel.ckptKey + '-run'] || '{}')[n]; }
  };
}

// Read every verdict and its target from the displayed instructions, including
// the prerequisite step. Context comes only from a standalone step's heading;
// whole-route prose must state its own targets. Legacy "both steps Pass" remains
// executable so the base fails at its actual hidden-field interaction.
function noteRoute(prose, standaloneStep) {
  let targets = standaloneStep === undefined ? [] : [standaloneStep];
  const actions = [];
  const tokens = /\b(?:enter|add)\s+(?:[“"]keep this note[”"]|a note\b)(?:\s+to (?:demo )?step (\d+))?|\b(?:both steps|(?:its )?two demo steps)\b|\b(?:demo )?step (\d+)\b|\bWorks,\s*but\b|\bPass\b/gi;
  for (const match of plain(prose).matchAll(tokens)) {
    const text = match[0];
    if (/^(?:enter|add)\b/i.test(text)) {
      const noteTargets = match[1] ? [Number(match[1])] : targets;
      assert.equal(noteTargets.length, 1, 'note instructions identify exactly one target step');
      actions.push({ n: noteTargets[0], action: 'note' });
    } else if (/\b(?:both|two)\b/i.test(text)) {
      targets = [1, 2];
    } else if (match[2]) {
      targets = [Number(match[2])];
    } else {
      assert.ok(targets.length, 'each instructed verdict has a stated target step');
      for (const n of targets) actions.push({ n, action: /^works/i.test(text) ? 'Works, but' : 'Pass' });
    }
  }
  assert.equal(actions.filter(item => item.action === 'note').length, 1, 'instructions include one note-entry action');
  for (const item of actions) assert.ok([1, 2].includes(item.n), 'instruction target exists in the two-step demo');
  return actions;
}

async function followRoute(prose, standaloneStep) {
  const before = await page(beforeHTML);
  // Standalone step 2 omits its prerequisite by design. The main/intro routes
  // receive no seeded verdicts: they must establish both marks themselves.
  if (standaloneStep === 2) before.click(1, 'Pass');
  for (const { n, action } of noteRoute(prose, standaloneStep)) {
    if (action === 'note') before.note(n, 'keep this note');
    else before.click(n, action);
  }
  assert.equal(before.el('t-pass').textContent, 2, 'both demo steps finish Pass');
  assert.equal(before.record(2).status, 'pass');
  assert.equal(before.record(2).note, 'keep this note');
  assert.match(before.copy(), /2\. PASS — keep this note/);
  const record = before.record(2);
  const reloaded = await page(beforeHTML, before.storage);
  assert.equal(reloaded.el('note-2').value, 'keep this note', 'the saved note survives a reload');
  const after = await page(afterHTML, reloaded.storage);
  assert.equal(after.el('t-rerun').textContent, 1, 'changed workbook step requires rerun');
  assert.equal(after.el('t-pass').textContent, 1, 'unchanged control remains a current Pass');
  assert.equal(after.el('step-1').getAttribute('data-status'), '');
  const history = after.el('step-1').querySelector('.step-history');
  assert.equal(history.hidden, false);
  assert.match(history.textContent, /Run it again/);
  assert.equal(after.el('note-2').value, 'keep this note');
  assert.deepEqual(after.record(2), record, 'the reissue must not rewrite the unaffected saved verdict or note');
  assert.match(after.copy(), /1\. NOT RE-RUN — previous PASS/);
  assert.match(after.copy(), /2\. PASS — keep this note/);
  return after;
}

test('clean Pass hides the note field: the old Pass then note sequence is unusable', async () => {
  const before = await page(beforeHTML);
  before.click(2, 'Pass');
  assert.equal(before.el('step-2').querySelector('.note-wrap').hidden, true);
  assert.throws(() => before.note(2, 'keep this note'), /must expose the note field/);
  assert.equal(before.record(2).note, '', 'the rejected hidden-field action cannot fabricate a saved note');
});

for (const [name, instruction, standaloneStep] of [
  ['main human step 2', async () => (await page(mainHTML)).instruction(2)],
  ['Before standfirst', async () => introduction(beforeHTML)],
  ['Before step 2', async () => (await page(beforeHTML)).instruction(2), 2],
  ['After step 2', async () => (await page(afterHTML)).instruction(2), 2]
]) {
  test(name + ' gives a visible note-entry route that survives the real reissue', async () => {
    await followRoute(await instruction(), standaloneStep);
  });
}

test('emitted After introduction distinguishes visible rerun history from Copy results export', async () => {
  const shown = introduction(afterHTML);
  assert.equal(shown, afterModel.standfirst, 'emitted After introduction must match its corrected sidecar');
  // Replay the introduction's own export claim against the real runtime rather
  // than restating it here: a stale introduction cannot satisfy a derived check.
  const claim = plain(shown).match(/Copy results as text reports [“"]([^”"]+)[”"]/);
  assert.ok(claim, 'the emitted After introduction states what Copy results as text reports');
  assert.match(plain(shown), /rerun-required history/, 'the emitted After introduction describes the visible step-1 history');
  const after = await followRoute(introduction(beforeHTML));
  const history = after.el('step-1').querySelector('.step-history');
  assert.equal(history.hidden, false, 'the changed step shows rerun history on the page');
  assert.match(history.textContent, /Run it again/, 'visible history asks for a re-run');
  assert.doesNotMatch(history.textContent, /NOT RE-RUN/, 'NOT RE-RUN is an export label, never the visible history');
  assert.ok(after.copy().includes(claim[1]), 'the export must report exactly what the introduction claims: ' + claim[1]);
  assert.match(after.copy(), /1\. NOT RE-RUN — previous PASS/);
});

test('sidecars and issued instructions agree while the demo preserves build/key and unaffected step identity', async () => {
  const before = await page(beforeHTML), after = await page(afterHTML), main = await page(mainHTML);
  assert.equal(before.instruction(2), step(beforeModel, 2).do);
  assert.equal(after.instruction(2), step(afterModel, 2).do);
  assert.equal(main.instruction(2), step(mainModel, 2).do);
  assert.equal(introduction(mainHTML), mainModel.standfirst, 'emitted main introduction matches its sidecar');
  assert.equal(introduction(beforeHTML), beforeModel.standfirst, 'emitted Before introduction matches its sidecar');
  assert.equal(beforeModel.buildSha, afterModel.buildSha);
  assert.equal(beforeModel.ckptKey, afterModel.ckptKey);
  assert.notEqual(mainModel.ckptKey, beforeModel.ckptKey, 'demo verdicts use isolated storage');
  assert.equal(step(beforeModel, 1).revision, 1);
  assert.equal(step(afterModel, 1).revision, 2);
  assert.equal(step(mainModel, 2).revision, 2);
  assert.equal(step(beforeModel, 2).revision, 2);
  assert.deepEqual(step(beforeModel, 2), step(afterModel, 2));
  assert.match(step(mainModel, 2).pass, /Copy results as text reports “1\. NOT RE-RUN/);
  assert.match(afterModel.standfirst, /Copy results as text reports “1\. NOT RE-RUN/);
});
