const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const TEMPLATE = 'orchestrate/templates/00-READBEFORE.md';
// The literal the old boot paragraph used to send implementers into the ~20k-token
// contract. Its absence from the template and its survival in the archived ledger are
// the two halves of this suite.
const OLD_BOOT_INSTRUCTION = 'read this file + your';
const template = read(TEMPLATE);
// Anchor every claim to the implementer paragraph itself — it sits between the
// orchestrator's boot sequence and the roles section — so a coincidental match
// elsewhere in the 56KB contract cannot satisfy these assertions. Whitespace is
// flattened because the paragraph is hard-wrapped.
const paragraphStart = template.indexOf('Implementer sub-agents:');
const paragraphEnd = template.indexOf('## Roles, gates, tiers');
assert.ok(paragraphStart >= 0, TEMPLATE + ' must keep an "Implementer sub-agents:" paragraph');
assert.ok(paragraphEnd > paragraphStart, TEMPLATE + ' must keep that paragraph above "## Roles, gates, tiers"');
const implementerParagraph = template.slice(paragraphStart, paragraphEnd).replace(/\s+/g, ' ').trim();

test('the contract no longer sends implementers to read the contract at boot', () => {
  assert.ok(!template.includes(OLD_BOOT_INSTRUCTION),
    TEMPLATE + ' must not tell implementers to "' + OLD_BOOT_INSTRUCTION + '" — the contract is ~20k tokens');
});

test('the implementer paragraph makes the spawn prompt authoritative and the contract on-demand', () => {
  assert.match(implementerParagraph, /your spawn prompt is authoritative/,
    'the paragraph must name the spawn prompt as authoritative');
  assert.match(implementerParagraph, /self-contained/,
    'the paragraph must say the prompt is self-contained');
  assert.match(implementerParagraph, /do NOT read this contract at boot/,
    'the paragraph must rule the contract out as a boot-time read');
  assert.match(implementerParagraph, /Consult it only if the prompt is/,
    'the paragraph must make consulting the contract conditional on the prompt falling short');
  for (const shortfall of [/incomplete/, /contradicts itself/, /missing a fact the work needs/]) {
    assert.match(implementerParagraph, shortfall,
      'the paragraph must name each condition that justifies consulting the contract');
  }
  assert.match(implementerParagraph, /read only the section you need/,
    'consulting the contract must mean a targeted read, not an end-to-end one');
});

test('the constraints the old boot paragraph carried survive the rewrite', () => {
  assert.match(implementerParagraph, /[Ww]ork ONLY in the worktree your prompt names/,
    'the worktree restriction must survive');
  assert.match(implementerParagraph, /batch file carries the full spec text and codebase facts/,
    'the batch file must still be named as the carrier of spec text and codebase facts');
  assert.match(implementerParagraph, /authoritative for scope/,
    'the batch file must still be authoritative for scope');
  assert.match(implementerParagraph, /Do NOT re-derive scope from the original request or any external document/,
    'the ban on re-deriving scope from the request or an external document must survive');
});

test('the archived ledger keeps its original boot wording', () => {
  const frozen = path.join(ROOT, '.agents/archive/OS-20260918-readonly-evidence-smoke-inputs/00-READBEFORE.md');
  // The closed ledger is branch-local; ordinary clones made after user archival need
  // not contain it. When present, a template edit must never have reached it — a
  // filled contract is a historical record of the protocol the change actually ran under.
  if (fs.existsSync(frozen)) {
    const text = fs.readFileSync(frozen, 'utf8');
    assert.ok(text.includes(OLD_BOOT_INSTRUCTION),
      'the archived ledger must keep its own boot wording — template edits reach new ledgers only');
  }
});
