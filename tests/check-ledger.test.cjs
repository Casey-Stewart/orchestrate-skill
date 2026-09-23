const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { spawnSync, execFile } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { makeRepo, LEDGER } = require('./support/git-fixture.cjs');
const ROOT = path.resolve(__dirname, '..');
const TOOLS = path.join(ROOT, 'orchestrate', 'tools');
const TOOL = path.join(TOOLS, 'check-ledger.mjs'), FENCE = path.join(TOOLS, 'check-fence.mjs');
const parserApi = import('../orchestrate/tools/ledger-parse.mjs');
const ledgerApi = import('../orchestrate/tools/check-ledger.mjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');

// Every invocation must print exactly one line, whatever the verdict.
function run(args) {
  const r = spawnSync(process.execPath, [TOOL, ...args], { cwd: ROOT, encoding: 'utf8', windowsHide: true, timeout: 60000 });
  assert.ifError(r.error); assert.equal(r.signal, null);
  assert.match(r.stdout, /^[^\r\n]*\n$/, 'exactly one line on stdout: ' + JSON.stringify(r.stdout));
  return { status: r.status, line: r.stdout.slice(0, -1) };
}
function tmp(t) {
  const dir = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'check-ledger-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 }));
  return dir;
}
function writeTree(dir, files) {
  fs.rmSync(dir, { recursive: true, force: true });
  for (const [rel, content] of Object.entries(files)) {
    const p = path.join(dir, ...rel.split('/'));
    fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content);
  }
  return dir;
}

// ===== A ledger built from the shipped templates, never hand-written ======
// The authority rows are the templates' own example rows with real values substituted, so a
// template whose rows the parser cannot read reddens here, as it does for a scaffolder.
const PLAN = '01-plan.md', PROG = 'PROGRESS.md', B1 = '02-batches-01-one.md', B2 = '02-batches-02-two.md';
const BATCHES = [
  { id: 'B01', title: 'One', branch: 'feat/one', files: ['a.txt', 'b.txt'] },
  { id: 'B02', title: 'Two', branch: 'fix/two', files: ['c.txt'] },
];
const cellsOf = line => line.split('|').slice(1, -1).map(x => x.trim());
function authority(template, keys, values) {
  const lines = read(template).split('\n');
  const head = lines.findIndex(l => l.startsWith('|') && keys.every(k => cellsOf(l).includes(k)));
  assert.notEqual(head, -1, template + ': no batch table carrying ' + keys.join(', '));
  const example = lines.slice(head + 2).find(l => /^\| B\d{2,} \|.*\|$/.test(l));
  assert.ok(example, template + ': no example row to copy');
  const header = cellsOf(lines[head]), cells = cellsOf(example);
  // The template's own id is the first batch's: rename it there and this goes red.
  assert.equal(cells[header.indexOf('#')], BATCHES[0].id, template + ': the example row must pin B01');
  const rows = values.map(v => '| ' + header.map((key, i) => v[key] ?? cells[i]).join(' | ') + ' |');
  return [...lines.slice(0, head + 2), ...rows, ...lines.slice(head + 2)].join('\n');
}
function batchFile(b) {
  const values = { BATCH_NUM: b.id.slice(1), BATCH_BRANCH: b.branch, BATCH_FILES: b.files.map(f => '`' + f + '`').join(', '),
    BATCH_TITLE: b.title, BATCH_TYPE: 'feature', BATCH_VERSION: '—' };
  return read('orchestrate/templates/02-batch.md').replace(/\{\{([A-Z_]+)\}\}/g, (_, k) => values[k] || 'example')
    .replace(/<!-- - \[ \] one box[\s\S]*?-->/, '- [ ] Implement example.').replace(/<!--[\s\S]*?-->/g, '');
}
function baseLedger() {
  return {
    [PLAN]: authority('orchestrate/templates/01-plan.md', ['#', 'Branch', 'Files (fence)'],
      BATCHES.map(b => ({ '#': b.id, Batch: b.title, Branch: '`' + b.branch + '`', 'Files (fence)': b.files.map(f => '`' + f + '`').join(', ') }))),
    [PROG]: authority('orchestrate/templates/PROGRESS.md', ['#', 'Branch', 'Notes'],
      BATCHES.map(b => ({ '#': b.id, Batch: b.title, Branch: '`' + b.branch + '`', Notes: '—' }))),
    [B1]: batchFile(BATCHES[0]), [B2]: batchFile(BATCHES[1]),
  };
}
// Every edit asserts its anchor, so a variant whose replacement silently missed cannot
// pass as a verdict about a ledger it never produced.
function swap(text, from, to) {
  const hits = typeof from === 'string' ? text.split(from).length - 1 : (text.match(new RegExp(from.source, 'gm')) || []).length;
  assert.equal(hits, 1, 'mutation anchor must occur exactly once: ' + from);
  const out = text.replace(from, to);
  assert.notEqual(out, text, 'mutation must change the text: ' + from);
  return out;
}
const edit = (files, name, from, to) => ({ ...files, [name]: swap(files[name], from, to) });
const without = (files, name) => { assert.ok(files[name]); const copy = { ...files }; delete copy[name]; return copy; };
const rename = (files, from, to) => ({ ...without(files, from), [to]: files[from] });
const appendBytes = (files, name) => ({ ...files, [name]: Buffer.concat([Buffer.from(files[name]), Buffer.from([0xff, 0xfe])]) });
const lineOf = (text, re, nth = 0) => text.split('\n').flatMap((l, i) => re.test(l) ? [i + 1] : [])[nth];
const NOTES = { B01: /^(\| B01 \| One \|.*\| )— \|$/m, B02: /^(\| B02 \| Two \|.*\| )— \|$/m };
const notes = (files, value, id = 'B01') => edit(files, PROG, NOTES[id], '$1' + value + ' |');
const EXTENSION = 'fence +x.txt (item, reason, 2026-09-23)';
const authorizeInLog = (files, record, ids = ['B01']) => edit(ids.reduce((f, id) => notes(f, record, id), files), PROG,
  /^(\| Date \| Session did \| Stopped because \|\n\|[-|]+\|)$/m, '$1\n| 2026-09-23 | ' + record + ' | — |');
const setBranch = (files, branch) => edit(edit(edit(files, PLAN, '`feat/one`', '`' + branch + '`'), PROG, '`feat/one`', '`' + branch + '`'),
  B1, '**Branch**: `feat/one`', '**Branch**: `' + branch + '`');

// Fence rejection sites as `<code>: <message>`, then ` @<document>` where one site is raised for
// more than one ledger document, and ` #<clause>` for one clause of a condition joining several.
// Written by hand here; the domain they are checked against is DERIVED from the fence's and the
// parser's source below, so the two cannot drift apart silently.
const A = m => 'authority: ' + m, BL = m => 'batch-linkage: ' + m;
const PL = m => A(m) + ' @plan', PR = m => A(m) + ' @progress', BD = m => BL(m) + ' @batch';
const IDS = 'Duplicate or malformed batch IDs', REQUESTED = 'Missing or duplicate requested batch', CELL = 'Malformed branch cell';
const HEADER = 'Malformed table header', TABLE_ROW = 'Malformed table row', AMBIGUOUS = 'Missing or ambiguous authority table';
const NAME = BL('Batch ID and ledger batch filename do not agree');
const BRANCH = A('Plan/PROGRESS branch linkage does not agree'), REDUNDANT = A('Redundant or ambiguous extension');
const MISSING = A('Missing authoritative ledger text'), TITLE = BL('Batch title does not match ID');
const FILES_BRANCH = BL('Baseline batch Files/Branch must match authoritative plan'), STRUCTURE = 'batch-structure: Unsupported original Checklist section';
const AUTH_FILE = 'authority-file: Authority must be an ordinary committed file', BASELINE = 'batch-baseline: Baseline batch must be an ordinary file';
const USAGE = 'usage: Explicit repository, distinct full refs, ledger ID, batch ID and exact batch file are required';
const PATHS = 'Expected unique exact repository-relative backtick paths (globs unsupported)';
const row = (f, file, id = 'B01') => lineOf(f[file], new RegExp('^\\| ' + id + ' \\|'));

// Each case: the ledger edit, what `parse` must say (the problems it names by file, line and
// message, or an UNKNOWN), and the fence rejection sites the REAL fence reports when the same
// ledger is committed and B01 gated: no sites means the fence PASSes. `ledger` names the ledger
// directory and `gate` overrides what the fence is invoked with, each derived from the ledger.
const CASES = [
  { name: 'ledger from the real templates', edit: f => f, expect: () => [], sites: [] },
  { name: 'authorized fence extension', edit: f => authorizeInLog(f, EXTENSION), expect: () => [], sites: [] },
  { name: 'title with a hyphen for the dash', sites: [], edit: f => edit(f, B1, '# B01 — ', '# B01 - '), expect: () => [] },
  // Stricter than the fence, which reads only the batch it gates.
  { name: 'orphan batch file', sites: [], edit: f => ({ ...f, '02-batches-03-three.md': swap(f[B2], '# B02 — ', '# B03 — ') }),
    expect: () => [['02-batches-03-three.md', 1, /^no plan row claims this batch file$/]] },
  { name: 'two batch files for one id', sites: [], edit: f => ({ ...f, '02-batches-01-copy.md': f[B1] }),
    expect: f => [[PLAN, row(f, PLAN), /^B01: 2 batch files 02-batches-01-\*\.md, expected exactly one$/]] },
  // Ledger authority: the plan and PROGRESS tables, cells and extension records.
  { name: 'glob in the plan fence', sites: [PL(PATHS)], edit: f => edit(f, PLAN, '`a.txt`, `b.txt` |', '`*.txt` |'),
    expect: f => [[PLAN, row(f, PLAN), /^B01 Files \(fence\): Expected unique exact repository-relative backtick paths \(globs unsupported\)$/]] },
  { name: 'empty plan fence cell', sites: [PL('Empty file fence')], edit: f => edit(f, PLAN, '`a.txt`, `b.txt` |', '|'),
    expect: f => [[PLAN, row(f, PLAN), /^B01 Files \(fence\): Empty file fence$/]] },
  { name: 'malformed plan table header', sites: [PL(HEADER)], edit: f => edit(f, PLAN, '|---|-------|', '|---|--x----|'),
    expect: () => [[PLAN, 1, /^batch table \(#, Branch, Files \(fence\)\): Malformed table header$/]] },
  { name: 'malformed PROGRESS table header', sites: [PR(HEADER)], edit: f => edit(f, PROG, '|---|-------|', '|---|--x----|'),
    expect: () => [[PROG, 1, /^batch table \(#, Branch, Notes\): Malformed table header$/]] },
  { name: 'plan row missing a cell', sites: [PL(TABLE_ROW)], edit: f => edit(f, PLAN, /^(\| B02 \|.*) — \|$/m, '$1'),
    expect: () => [[PLAN, 1, /^batch table \(#, Branch, Files \(fence\)\): Malformed table row$/]] },
  { name: 'PROGRESS row missing a cell', sites: [PR(TABLE_ROW)], edit: f => edit(f, PROG, /^(\| B02 \|.*) — \|$/m, '$1'),
    expect: () => [[PROG, 1, /^batch table \(#, Branch, Notes\): Malformed table row$/]] },
  { name: 'two plan batch tables', sites: [PL(AMBIGUOUS)],
    edit: f => edit(f, PLAN, '## Wave map & checkpoints', '| # | Branch | Files (fence) |\n|---|---|---|\n| B01 | `feat/one` | `a.txt`, `b.txt` |\n\n## Wave map & checkpoints'),
    expect: () => [[PLAN, 1, /^batch table \(#, Branch, Files \(fence\)\): Missing or ambiguous authority table$/]] },
  { name: 'two PROGRESS batch tables', sites: [PR(AMBIGUOUS)],
    edit: f => edit(f, PROG, '## Checkpoints', '| # | Branch | Notes |\n|---|---|---|\n| B01 | `feat/one` | — |\n\n## Checkpoints'),
    expect: () => [[PROG, 1, /^batch table \(#, Branch, Notes\): Missing or ambiguous authority table$/]] },
  { name: 'malformed Bnn', sites: [PL(IDS)], edit: f => edit(f, PLAN, /^\| B02 \|/m, '| B2 |'),
    expect: f => [[PLAN, row(f, PLAN, 'B2'), /^B2: Duplicate or malformed batch IDs$/], [PROG, row(f, PROG, 'B02'), /^B02: no plan row$/], [B2, 1, /^no plan row claims this batch file$/]] },
  { name: 'duplicate PROGRESS row', sites: [PR(IDS)], edit: f => edit(f, PROG, /^(\| B02 \|.*)$/m, '$1\n$1'),
    expect: f => [[PROG, lineOf(f[PROG], /^\| B02 \|/), /^B02: Duplicate or malformed batch IDs$/], [PROG, lineOf(f[PROG], /^\| B02 \|/, 1), /^B02: Duplicate or malformed batch IDs$/]] },
  { name: 'plan lacks the gated id', sites: [PL(REQUESTED)], edit: f => edit(f, PLAN, /^\| B01 \| One \|/m, '| B03 | One |'),
    expect: f => [[PROG, row(f, PROG), /^B01: no plan row$/], [PLAN, row(f, PLAN, 'B03'), /^B03: no PROGRESS row$/],
      [PLAN, row(f, PLAN, 'B03'), /^B03: 0 batch files 02-batches-03-\*\.md, expected exactly one$/], [B1, 1, /^no plan row claims this batch file$/]] },
  { name: 'plan and PROGRESS ids differ', sites: [PR(REQUESTED)], edit: f => edit(f, PROG, /^\| B01 \| One \|/m, '| B03 | One |'),
    expect: f => [[PROG, row(f, PROG, 'B03'), /^B03: no plan row$/], [PLAN, row(f, PLAN), /^B01: no PROGRESS row$/]] },
  { name: 'malformed plan branch cell', sites: [PL(CELL)], edit: f => edit(f, PLAN, '`feat/one`', '`feat/one`x'),
    expect: f => [[PLAN, row(f, PLAN), /^B01 Branch: Malformed branch cell$/]] },
  { name: 'malformed PROGRESS branch cell', sites: [PR(CELL)], edit: f => edit(f, PROG, '`feat/one`', '`feat/one`x'),
    expect: f => [[PROG, row(f, PROG), /^B01 Branch: Malformed branch cell$/]] },
  { name: 'plan branch disagrees with PROGRESS and the batch file', sites: [BRANCH + ' #plan-branch'], edit: f => edit(f, PLAN, '`feat/one`', '`feat/other`'),
    expect: f => [[PROG, row(f, PROG), /^B01: Branch feat\/one differs from the plan's feat\/other$/], [B1, lineOf(f[B1], /^\*\*Branch\*\*: /), /^Branch line must read exactly \*\*Branch\*\*: `feat\/other`$/]] },
  { name: 'PROGRESS branch disagrees with the plan', sites: [BRANCH + ' #progress-branch'], edit: f => edit(f, PROG, '`feat/one`', '`feat/other`'),
    expect: f => [[PROG, row(f, PROG), /^B01: Branch feat\/other differs from the plan's feat\/one$/]] },
  { name: 'malformed fence extension', sites: [PR('Malformed fence extension')], edit: f => notes(f, 'fence +x.txt (item, reason)'),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: Malformed fence extension$/]] },
  { name: 'unsupported fence extension grammar', sites: [PR('Unsupported fence extension grammar')], edit: f => notes(f, 'fence +x.txt'),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: Unsupported fence extension grammar$/]] },
  { name: 'extension recorded for another id', sites: [PR('Mismatched or ambiguous extension in Notes')], edit: f => notes(f, 'fence +x.txt (B02, item, reason, 2026-09-23)'),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: Mismatched or ambiguous extension in Notes$/]] },
  { name: 'extension with two session logs', sites: [PR('Extension needs an unambiguous session log')],
    edit: f => edit(authorizeInLog(f, EXTENSION), PROG, '## Session log', '## Session log\n\n## Session log'),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: Extension needs an unambiguous session log$/]] },
  { name: 'extension with no session-log authorization', sites: [PR('Extension needs exactly one matching session-log authorization')], edit: f => notes(f, EXTENSION),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: Extension needs exactly one matching session-log authorization$/]] },
  { name: 'extension owned by two rows', sites: [PR('Extension cannot be bound to one batch row')], edit: f => authorizeInLog(f, EXTENSION, ['B01', 'B02']),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: Extension cannot be bound to one batch row$/], [PROG, row(f, PROG, 'B02'), /^B02 Notes: Extension cannot be bound to one batch row$/]] },
  { name: 'authorized extension repeating a fence path', sites: [REDUNDANT + ' #in-fence'], edit: f => authorizeInLog(f, EXTENSION.replace('x.txt', 'a.txt')),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: extension repeats a fence path$/]] },
  { name: 'authorized extension naming the batch file itself', sites: [REDUNDANT + ' #own-batch-file'], edit: f => authorizeInLog(f, EXTENSION.replace('x.txt', `${LEDGER}/${B1}`)),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: extension names the batch's own file$/]] },
  // Authority files the fence will not read: missing, undecodable, or a link.
  { name: 'missing plan', sites: [MISSING + ' #plan', AUTH_FILE + ' @plan'], edit: f => without(f, PLAN), unknown: /^UNKNOWN cannot read .*01-plan\.md$/ },
  { name: 'missing PROGRESS', sites: [MISSING + ' #progress', AUTH_FILE + ' @progress'], edit: f => without(f, PROG), unknown: /^UNKNOWN cannot read .*PROGRESS\.md$/ },
  { name: 'plan not UTF-8', sites: [MISSING + ' #plan'], edit: f => appendBytes(f, PLAN), unknown: /^UNKNOWN not UTF-8: .*01-plan\.md$/ },
  { name: 'PROGRESS not UTF-8', sites: [MISSING + ' #progress'], edit: f => appendBytes(f, PROG), unknown: /^UNKNOWN not UTF-8: .*PROGRESS\.md$/ },
  { name: 'linked plan', sites: [AUTH_FILE + ' @plan'], link: PLAN, edit: f => f, unknown: /^UNKNOWN a link, not an ordinary file: .*01-plan\.md$/ },
  { name: 'linked PROGRESS', sites: [AUTH_FILE + ' @progress'], link: PROG, edit: f => f, unknown: /^UNKNOWN a link, not an ordinary file: .*PROGRESS\.md$/ },
  // What the fence is invoked with, each derived from the ledger: a ledger it refuses to gate.
  { name: 'impossible branch name', sites: [USAGE + ' #batch-ref'], gate: { batch: 'refs/heads/feat/one x' }, edit: f => setBranch(f, 'feat/one x'),
    expect: f => [[PLAN, row(f, PLAN), /^B01 Branch: feat\/one x is not a valid branch name$/]] },
  { name: 'branch name with a double dot', sites: [USAGE + ' #batch-ref'], gate: { batch: 'refs/heads/feat/one..x' }, edit: f => setBranch(f, 'feat/one..x'),
    expect: f => [[PLAN, row(f, PLAN), /^B01 Branch: feat\/one\.\.x is not a valid branch name$/]] },
  { name: 'ledger id the fence refuses', sites: [USAGE + ' #ledger-id'], ledger: 'OS-20260923-café', edit: f => f,
    expect: () => [[PLAN, 1, /^ledger directory OS-20260923-café is not a valid ledger id$/]] },
  { name: 'batch id the fence refuses', sites: [USAGE + ' #batch-id'], gate: { 'batch-id': 'B1' },
    edit: f => edit(edit(f, PLAN, /^\| B01 \| One \|/m, '| B1 | One |'), PROG, /^\| B01 \| One \|/m, '| B1 | One |'),
    expect: f => [[PLAN, row(f, PLAN, 'B1'), /^B1: Duplicate or malformed batch IDs$/], [PROG, row(f, PROG, 'B1'), /^B1: Duplicate or malformed batch IDs$/], [B1, 1, /^no plan row claims this batch file$/]] },
  { name: 'batch file path the fence refuses', sites: [USAGE + ' #batch-file'], gate: { 'batch-file': `${LEDGER}/02-batches-01-one[1].md` },
    edit: f => rename(f, B1, '02-batches-01-one[1].md'),
    expect: () => [['02-batches-01-one[1].md', 1, /^batch file path \.agents\/changes\/FIXTURE\/02-batches-01-one\[1\]\.md is not a valid repository path$/]] },
  { name: 'batch file numbered unlike its id', sites: [NAME + ' #prefix'], gate: { 'batch-file': `${LEDGER}/02-batches-1-one.md` },
    edit: f => rename(f, B1, '02-batches-1-one.md'),
    expect: f => [[PLAN, row(f, PLAN), /^B01: 0 batch files 02-batches-01-\*\.md, expected exactly one$/], ['02-batches-1-one.md', 1, /^no plan row claims this batch file$/]] },
  { name: 'batch file not Markdown', sites: [NAME + ' #suffix'], gate: { 'batch-file': `${LEDGER}/02-batches-01-one.markdown` },
    edit: f => rename(f, B1, '02-batches-01-one.markdown'),
    expect: f => [[PLAN, row(f, PLAN), /^B01: 0 batch files 02-batches-01-\*\.md, expected exactly one$/]] },
  { name: 'batch file in a subdirectory', sites: [NAME + ' #subdir'], gate: { 'batch-file': `${LEDGER}/02-batches-01-x/one.md` },
    edit: f => rename(f, B1, '02-batches-01-x/one.md'),
    expect: f => [[PLAN, row(f, PLAN), /^B01: 0 batch files 02-batches-01-\*\.md, expected exactly one$/]] },
  // The batch file: its linkage to the plan, and its structure.
  { name: 'missing batch file', sites: [BASELINE], edit: f => without(f, B1),
    expect: f => [[PLAN, row(f, PLAN), /^B01: 0 batch files 02-batches-01-\*\.md, expected exactly one$/]] },
  { name: 'linked batch file', sites: [BASELINE], link: B1, edit: f => f, unknown: /^UNKNOWN a link, not an ordinary file: .*02-batches-01-one\.md$/ },
  { name: 'title names another id', sites: [TITLE], edit: f => edit(f, B1, '# B01 — ', '# B09 — '),
    expect: () => [[B1, 1, /^title must open "# B01 — "$/]] },
  { name: 'title with a colon for the dash', sites: [TITLE], edit: f => edit(f, B1, '# B01 — ', '# B01: '),
    expect: () => [[B1, 1, /^title must open "# B01 — "$/]] },
  { name: 'title with no dash', sites: [TITLE], edit: f => edit(f, B1, '# B01 — ', '# B01 '),
    expect: () => [[B1, 1, /^title must open "# B01 — "$/]] },
  { name: 'title with no space after the dash', sites: [TITLE], edit: f => edit(f, B1, '# B01 — ', '# B01 —'),
    expect: () => [[B1, 1, /^title must open "# B01 — "$/]] },
  { name: 'missing Files line', sites: [FILES_BRANCH + ' #files-count'], edit: f => edit(f, B1, /^\*\*Files\*\*: .*\n/m, ''),
    expect: () => [[B1, 1, /^0 lines start "\*\*Files\*\*: ", expected exactly one$/]] },
  { name: 'duplicate Files line', sites: [FILES_BRANCH + ' #files-count'], edit: f => edit(f, B1, /^(\*\*Files\*\*: .*)$/m, '$1\n$1'),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Files\*\*: /, 1), /^2 lines start "\*\*Files\*\*: ", expected exactly one$/]] },
  { name: 'missing Branch line', sites: [FILES_BRANCH + ' #branch-count'], edit: f => edit(f, B1, /^\*\*Branch\*\*: .*\n/m, ''),
    expect: () => [[B1, 1, /^0 lines start "\*\*Branch\*\*: ", expected exactly one$/]] },
  { name: 'duplicate Branch line', sites: [FILES_BRANCH + ' #branch-count'], edit: f => edit(f, B1, /^(\*\*Branch\*\*: .*)$/m, '$1\n$1'),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Branch\*\*: /, 1), /^2 lines start "\*\*Branch\*\*: ", expected exactly one$/]] },
  { name: 'text after the Branch backtick', sites: [FILES_BRANCH + ' #branch-exact'], edit: f => edit(f, B1, '**Branch**: `feat/one`', '**Branch**: `feat/one` (cut from the tip)'),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Branch\*\*: /), /^Branch line must read exactly \*\*Branch\*\*: `feat\/one`$/]] },
  { name: 'stale Files line', sites: [FILES_BRANCH + ' #files-equal'], edit: f => edit(f, B1, '**Files**: `a.txt`, `b.txt`', '**Files**: `a.txt`'),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Files\*\*: /), /^Files line differs from the plan fence$/]] },
  { name: 'reordered Files line', sites: [FILES_BRANCH + ' #files-equal'], edit: f => edit(f, B1, '**Files**: `a.txt`, `b.txt`', '**Files**: `b.txt`, `a.txt`'),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Files\*\*: /), /^Files line differs from the plan fence$/]] },
  { name: 'glob in the Files line', sites: [BD(PATHS)], edit: f => edit(f, B1, '**Files**: `a.txt`, `b.txt`', '**Files**: `*.txt`'),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Files\*\*: /), /^Files line: Expected unique exact repository-relative backtick paths \(globs unsupported\)$/]] },
  { name: 'empty Files line', sites: [BD('Empty file fence')], edit: f => edit(f, B1, '**Files**: `a.txt`, `b.txt`', '**Files**: '),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Files\*\*: /), /^Files line: Empty file fence$/]] },
  { name: 'missing Checklist', sites: [STRUCTURE + ' #no-checklist'], edit: f => edit(f, B1, '## Checklist', '## Tasks'),
    expect: () => [[B1, 1, /^needs exactly one "## Checklist" line followed by another "## " heading$/]] },
  { name: 'duplicate Checklist', sites: [STRUCTURE + ' #two-checklists'], edit: f => edit(f, B1, '## Checklist', '## Checklist\n\n## Checklist'),
    expect: f => [[B1, lineOf(f[B1], /^## Checklist$/, 1), /^needs exactly one "## Checklist" line followed by another "## " heading$/]] },
  { name: 'Checklist is the last heading', sites: [STRUCTURE + ' #no-later-heading'], edit: f => edit(f, B1, /\n## Acceptance criteria[\s\S]*$/, '\n'),
    expect: f => [[B1, lineOf(f[B1], /^## Checklist$/), /^needs exactly one "## Checklist" line followed by another "## " heading$/]] },
];
// The diagnostic codes by which the fence rejects a ledger shape.
const MEASURED = ['authority', 'batch-linkage', 'authority-file', 'batch-baseline', 'batch-structure', 'usage'];
// Each fence condition joining several clauses, pinned whole, with every clause named by its
// own text: a clause moved between conditions changes both pins.
const CLAUSES = {
  [USAGE]: { when: "!repo || !validFullRef(integration) || !validFullRef(batch) || integration === batch || !validId(id) || !/^B\\d{2,}$/.test(batchId || '') || !validPath(batchFile)",
    clauses: { repo: '!repo', 'integration-ref': '!validFullRef(integration)', 'batch-ref': '!validFullRef(batch)', 'distinct-refs': 'integration === batch',
      'ledger-id': '!validId(id)', 'batch-id': "!/^B\\d{2,}$/.test(batchId || '')", 'batch-file': '!validPath(batchFile)' } },
  [NAME]: { when: "!batchFile.startsWith(`${root}/02-batches-${number}-`) || !batchFile.endsWith('.md') || batchFile.slice(root.length + 1).includes('/')",
    clauses: { prefix: '!batchFile.startsWith(`${root}/02-batches-${number}-`)', suffix: "!batchFile.endsWith('.md')", subdir: "batchFile.slice(root.length + 1).includes('/')" } },
  [MISSING]: { when: 'plan === null || progress === null', clauses: { plan: 'plan === null', progress: 'progress === null' } },
  [BRANCH]: { when: "!batch.startsWith('refs/heads/') || branchCell(planRow.Branch) !== branch || branchCell(progressRow.Branch) !== branch",
    clauses: { 'ref-not-heads': "!batch.startsWith('refs/heads/')", 'plan-branch': 'branchCell(planRow.Branch) !== branch', 'progress-branch': 'branchCell(progressRow.Branch) !== branch' } },
  [REDUNDANT]: { when: 'extension.some(p => fence.includes(p) || p === batchFile)', clauses: { 'in-fence': 'fence.includes(p)', 'own-batch-file': 'p === batchFile' } },
  [FILES_BRANCH]: { when: "fileLines.length !== 1 || branchLines.length !== 1 || branchLines[0] !== `**Branch**: \\`${batch.slice('refs/heads/'.length)}\\`` || JSON.stringify(exactPaths(fileLines[0].slice(11))) !== JSON.stringify(fence)",
    clauses: { 'files-count': 'fileLines.length !== 1', 'branch-count': 'branchLines.length !== 1',
      'branch-exact': "branchLines[0] !== `**Branch**: \\`${batch.slice('refs/heads/'.length)}\\``", 'files-equal': 'JSON.stringify(exactPaths(fileLines[0].slice(11))) !== JSON.stringify(fence)' } },
  [STRUCTURE]: { when: "start < 0 || before.filter(l => l === '## Checklist').length !== 1 || !ends.length",
    clauses: { 'no-checklist': 'start < 0', 'two-checklists': "before.filter(l => l === '## Checklist').length !== 1", 'no-later-heading': '!ends.length' } },
};
// A site raised once per authority file by the loop on its source line.
const PER_FILE = { [AUTH_FILE]: { loop: 'for (const file of [planPath, progressPath]) if (', docs: ['plan', 'progress'] } };
// Operator inputs, never ledger shapes: the fence is always invoked with the repository, the
// contract's integration branch (a file parse does not read) and `refs/heads/<plan branch>`.
const UNREACHABLE = [USAGE + ' #repo', USAGE + ' #integration-ref', USAGE + ' #distinct-refs', BRANCH + ' #ref-not-heads'];
// A measured code raised outside checkFence, on the fence command line's own flags.
const EXEMPT = ['usage: Unknown, missing or duplicate flag; use --help'];
// The ledger document a parser call reads, by the names in its arguments.
const DOC = { plan: 'plan', planRow: 'plan', progress: 'progress', progressRow: 'progress', baseline: 'batch', fileLines: 'batch', branchLines: 'batch' };
const LITERAL = /^(?:'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`)/;
const THROW = /throw new Error\((?:'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`)\)/g;
// Every throw must be one this reads, in any quoting, so no throw is silently outside the domain.
function throwsOf(text, where) {
  const found = [...text.matchAll(THROW)].map(m => ({ message: m[1] ?? m[2] ?? m[3], index: m.index }));
  assert.equal((text.match(/\bthrow\b/g) || []).length, found.length, where + ': every throw raises an Error with a literal message');
  return found;
}
// The end of the string or template literal opening at `i`; a template's ${…} may hold literals.
function skipLiteral(src, i) {
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === '\\') j++;
    else if (src[j] === src[i]) return j;
    else if (src[i] === '`' && src.startsWith('${', j)) j = closing(src, j + 1, '{', '}');
  }
  assert.fail('unterminated literal at ' + i);
}
// The index of the bracket closing the one at `open`, literals skipped.
function closing(src, open, o = '(', c = ')') {
  for (let depth = 0, j = open; j < src.length; j++) {
    if ("'\"`".includes(src[j])) j = skipLiteral(src, j);
    else if (src[j] === o) depth++;
    else if (src[j] === c && --depth === 0) return j;
  }
  assert.fail('unbalanced ' + o + ' at ' + open);
}
// The condition guarding the raise at `at`: an `if (` on its line, or on the line before when
// that line opens the block holding it; null when the raise is unconditional.
function conditionOf(src, at) {
  const lineStart = src.lastIndexOf('\n', at - 1) + 1;
  let ifAt = src.lastIndexOf('if (', at);
  if (ifAt < lineStart) {
    const prevStart = src.lastIndexOf('\n', lineStart - 2) + 1, prev = src.slice(prevStart, lineStart - 1);
    ifAt = /\{\s*$/.test(prev) && prev.includes('if (') ? prevStart + prev.lastIndexOf('if (') : -1;
  }
  return ifAt < 0 ? null : src.slice(ifAt + 4, closing(src, ifAt + 3));
}
function sitesAt(src, key, at) {
  const line = src.slice(src.lastIndexOf('\n', at - 1) + 1, (src.indexOf('\n', at) + 1 || src.length + 1) - 1);
  let keys = [key];
  if (PER_FILE[key]) {
    assert.ok(line.trimStart().startsWith(PER_FILE[key].loop), key + ': raised once per authority file');
    keys = PER_FILE[key].docs.map(d => key + ' @' + d);
  }
  const when = conditionOf(src, at), pinned = CLAUSES[key];
  if (!pinned) {
    assert.ok(when === null || !when.includes('||'), key + ': a condition joining clauses needs them named: ' + when);
    return keys;
  }
  assert.equal(when, pinned.when, key + ': the pinned condition');
  let from = 0, gaps = '';
  for (const text of Object.values(pinned.clauses)) {
    const i = when.indexOf(text, from);
    assert.ok(i >= 0 && when.indexOf(text, i + 1) < 0, key + ': each clause once, in order: ' + text);
    gaps += when.slice(from, i); from = i + text.length;
  }
  assert.equal((gaps + when.slice(from)).split('||').length, Object.keys(pinned.clauses).length, key + ': every clause is named');
  return keys.flatMap(k => Object.keys(pinned.clauses).map(c => k + ' #' + c));
}
// Every site at which the fence rejects a ledger shape, derived from the source: each message
// thrown in the fence's authority and linkage try blocks, or by a parser they reach (keyed by
// the ledger document the call reads), every measured diagnostic the fence raises with a literal
// message, and each clause of a joined condition. The sources are parameters so a planted copy
// can prove the extractor sees what is planted.
function fenceRejectionSites(fence = read('orchestrate/tools/check-fence.mjs'), parser = read('orchestrate/tools/ledger-parse.mjs')) {
  const bodies = Object.fromEntries(parser.split(/^export /m).slice(1).map(part => [/^(?:const|function)\s+([\w$]+)/.exec(part)[1], part]));
  const calls = text => [...text.matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*)\(/g)].map(m => m[1]).filter(n => Object.hasOwn(bodies, n));
  const reach = name => {
    const seen = new Set(), todo = [name];
    while (todo.length) { const n = todo.pop(); if (!seen.has(n)) { seen.add(n); todo.push(...calls(bodies[n])); } }
    return [...seen];
  };
  const parsed = new Set(), own = [], raised = new Set(), sinks = [], exempt = [];
  const raise = (key, at) => { assert.ok(!raised.has(key), 'one source site raises ' + key); raised.add(key); own.push(...sitesAt(fence, key, at)); };
  for (const code of ['authority', 'batch-linkage']) {
    const sink = `catch (e) { unknowns.push(diagnostic('${code}', e.message`, end = fence.indexOf(sink), start = fence.lastIndexOf('try {', end);
    assert.ok(end >= 0 && fence.indexOf(sink, end + 1) < 0 && start >= 0, 'one try block ending in the ' + code + ' catch');
    const block = fence.slice(start, end);
    sinks.push(end + sink.indexOf('diagnostic('));
    for (const t of throwsOf(block, code + ' block')) raise(code + ': ' + t.message, start + t.index);
    for (const m of block.matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*)\(/g)) {
      if (!Object.hasOwn(bodies, m[1])) continue;
      const open = m.index + m[1].length, args = block.slice(open + 1, closing(block, open));
      const names = [...args.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, '').matchAll(/[A-Za-z_$][\w$]*/g)].map(t => t[0]);
      const docs = [...new Set(names.filter(n => Object.hasOwn(DOC, n)).map(n => DOC[n]))];
      assert.equal(docs.length, 1, `${m[1]}(${args}) must read exactly one ledger document`);
      for (const n of reach(m[1])) for (const t of throwsOf(bodies[n], n)) parsed.add(`${code}: ${t.message} @${docs[0]}`);
    }
  }
  for (const m of fence.matchAll(/(?<![\w$.])(diagnostic|add)\(\s*(['"`])([\w-]+)\2\s*,\s*/g)) {
    if (!MEASURED.includes(m[3])) continue;
    const lit = LITERAL.exec(fence.slice(m.index + m[0].length));
    if (!lit) {
      assert.ok(sinks.includes(m.index), m[3] + ': a measured diagnostic with a computed message outside the two catches');
      sinks.splice(sinks.indexOf(m.index), 1); continue;
    }
    const key = m[3] + ': ' + (lit[1] ?? lit[2] ?? lit[3]);
    if (EXEMPT.includes(key)) exempt.push(key); else raise(key, m.index);
  }
  assert.deepEqual(sinks, [], 'each try block ends in its measured catch');
  assert.deepEqual(exempt, EXEMPT, 'every exemption names one live site');
  const domain = [...parsed, ...own];
  assert.equal(new Set(domain).size, domain.length, 'a parsed site is never also raised directly');
  return domain;
}
function problemsOf(line) {
  const m = /^PARSE FAIL (\d+) problem\(s\): (.*)$/.exec(line);
  assert.ok(m, 'expected a PARSE FAIL line, got: ' + line);
  const problems = m[2].split('; ').map(p => /^(\S+):(\d+) (.*)$/.exec(p));
  assert.ok(problems.every(Boolean), line);
  assert.equal(Number(m[1]), problems.length, line);
  return problems.map(p => [p[1], Number(p[2]), p[3]]);
}

const sameSet = (a, b) => JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());
// Replaces a ledger file with a link to identical bytes: a file symlink where the platform
// allows one, else a directory junction. Either way it is not an ordinary file.
function linkInPlace(file, content, outside) {
  const target = path.join(outside, path.basename(file));
  fs.rmSync(target, { recursive: true, force: true }); fs.unlinkSync(file);
  try { fs.writeFileSync(target, content); fs.symlinkSync(target, file, 'file'); }
  catch (e) { if (e.code !== 'EPERM') throw e; fs.rmSync(target, { force: true }); fs.mkdirSync(target); fs.symlinkSync(target, file, 'junction'); }
  assert.ok(fs.lstatSync(file).isSymbolicLink(), 'the link must exist: ' + file);
  return () => { fs.unlinkSync(file); fs.writeFileSync(file, content); };
}

test('the fence rejection domain is derived from the source, and every site is owned by a case', () => {
  const domain = fenceRejectionSites();
  // Pinned by hand: a site dropped from the source AND from the cases still goes red here.
  assert.equal(domain.length, 50, JSON.stringify(domain, null, 1));
  assert.equal(new Set(domain).size, domain.length);
  for (const site of UNREACHABLE) assert.ok(domain.includes(site), site);
  assert.equal(CASES.length, 61);
  assert.equal(new Set(CASES.map(c => c.name)).size, CASES.length);
  for (const c of CASES) {
    for (const site of c.sites) assert.ok(domain.includes(site), c.name + ': not a fence rejection site: ' + site);
    // A case the fence rejects never demands PARSE OK: that would pin the looser parse.
    assert.ok(!c.sites.length || c.unknown || c.expect(c.edit(baseLedger())).length, c.name + ': rejected by the fence, so parse must not pass it');
  }
  // Owned: some case is rejected by the fence at this site and no other, so the parse check
  // standing opposite it is the only thing that can make that case fail.
  for (const site of domain) {
    if (UNREACHABLE.includes(site)) { assert.ok(!CASES.some(c => c.sites.includes(site)), site); continue; }
    assert.ok(CASES.some(c => sameSet(c.sites, [site])), 'no case is rejected at this site alone: ' + site);
  }
  assert.ok(CASES.some(c => !c.sites.length && c.expect(c.edit(baseLedger())).length), 'a case where parse is stricter than the fence');
});

test('the rejection-site extractor: a planted site grows the domain, an unreadable one stops it', () => {
  const fence = read('orchestrate/tools/check-fence.mjs'), parser = read('orchestrate/tools/ledger-parse.mjs');
  const base = fenceRejectionSites(fence, parser);
  const grows = [
    ['a throw before the first authority statement', swap(fence, '  try {\n    if (plan === null', "  try {\n    if (plan !== null && plan.includes('ZZZ-SENTINEL')) throw new Error('Sentinel plan rejected');\n    if (plan === null"), parser,
      ['authority: Sentinel plan rejected']],
    ['a template-literal throw in the authority block', swap(fence, "    const branch = batch.slice('refs/heads/'.length);\n",
      "    const branch = batch.slice('refs/heads/'.length);\n    if (branch === 'zzz') throw new Error(`Sentinel ${branch}`);\n"), parser, ['authority: Sentinel ${branch}']],
    ['a measured diagnostic with a literal message', swap(fence, "{ path: file }));\n", "{ path: file }));\n  unknowns.push(diagnostic('authority', 'Sentinel batch file'));\n"), parser,
      ['authority: Sentinel batch file']],
    ['a double-quoted throw in a parser the fence reaches', fence, swap(parser, 'export function table(text, required) {\n', 'export function table(text, required) {\n  if (text === \'zzz\') throw new Error("Sentinel table");\n'),
      ['authority: Sentinel table @plan', 'authority: Sentinel table @progress']],
  ];
  for (const [name, f, p, added] of grows) {
    const grown = fenceRejectionSites(f, p);
    assert.deepEqual(base.filter(s => !grown.includes(s)), [], name + ': nothing lost');
    assert.deepEqual(grown.filter(s => !base.includes(s)).sort(), added.slice().sort(), name);
  }
  const firstLine = re => err => re.test(String(err.message).split('\n')[0]);
  const stops = [
    ['a throw the extractor cannot read', swap(fence, '    if (plan === null', "    if (plan === 'zzz') throw sentinel;\n    if (plan === null"), parser, /^authority block: every throw raises an Error with a literal message$/],
    ['a measured diagnostic with a computed message', swap(fence, "{ path: file }));\n", "{ path: file }));\n  unknowns.push(diagnostic('authority', String(plan)));\n"), parser,
      /^authority: a measured diagnostic with a computed message outside the two catches$/],
    // The exempt clause moved into the usage guard, a ledger-shape clause left in its place.
    ['a clause moved from the branch condition into the usage guard', swap(swap(fence, 'if (!repo || ', "if (!repo || !batch.startsWith('refs/heads/') || "),
      "!batch.startsWith('refs/heads/') || branchCell(planRow.Branch)", '!planRow.Batch || branchCell(planRow.Branch)'), parser,
      /^authority: Plan\/PROGRESS branch linkage does not agree: the pinned condition$/],
    ['a clause added to the usage guard alone', swap(fence, 'if (!repo || ', "if (!repo || !batch.startsWith('refs/heads/') || "), parser, /^usage: .*: the pinned condition$/],
    ['a clause joined to a single-clause condition', swap(fence, 'if (!baselineMode) ', "if (!baselineMode || plan === 'zzz') "), parser, /^batch-baseline: .*: a condition joining clauses needs them named: /],
  ];
  for (const [name, f, p, re] of stops) assert.throws(() => fenceRejectionSites(f, p), firstLine(re), name);
});

// The real fence command line, run asynchronously so one case's fence overlaps the next case's setup.
function fenceRun(cwd, env, gate) {
  const args = ['--repo', cwd, ...['integration', 'batch', 'ledger', 'batch-id', 'batch-file'].flatMap(k => ['--' + k, gate[k]])];
  return new Promise((resolve, reject) => execFile(process.execPath, [FENCE, ...args], { cwd, env, encoding: 'utf8', windowsHide: true, timeout: 120000, maxBuffer: 16 * 1024 * 1024 },
    (error, stdout) => error && typeof error.code !== 'number' ? reject(error) : resolve({ code: error ? error.code : 0, verdict: JSON.parse(stdout) })));
}
const POOL = 4;
test('parse is never looser than the fence: each case in parse and in the real fence', { concurrency: POOL }, async t => {
  // One fixture repository per concurrent case: each commit replaces that repository's whole ledger.
  const pool = Array.from({ length: POOL }, () => {
    const repo = makeRepo(t); repo.git('checkout', '-b', 'feat/one'); repo.git('config', 'core.symlinks', 'false');
    return { repo, outside: tmp(t) };
  });
  const opts = { integration: 'refs/heads/integration', batch: 'refs/heads/feat/one', 'batch-id': 'B01' };
  const FILE_OF = { plan: PLAN, progress: PROG }, DOC_OF = { [PLAN]: 'plan', [PROG]: 'progress' };
  // The fence's own key for a site: the clause is never visible to it, the document only where
  // its diagnostic carries the authority file's path.
  const fenceKey = s => { const k = s.replace(/ #[\w-]+$/, ''); return k.startsWith('authority-file: ') ? k : k.replace(/ @\w+$/, ''); };
  await Promise.all(CASES.map(c => t.test(c.name, async () => {
    const slot = pool.pop();
    assert.ok(slot, 'a free fixture repository');
    try { await fenceCase(c, slot); } finally { pool.push(slot); }
  })));
  async function fenceCase(c, { repo, outside }) {
    const files = c.edit(baseLedger()), ledger = c.ledger ?? path.posix.basename(LEDGER);
    const gate = { ...opts, ledger, 'batch-file': `.agents/changes/${ledger}/${B1}`, ...c.gate };
    // Only the base control and the cases that change the file type or the ledger's name keep the bytes.
    if (c.name !== 'ledger from the real templates' && !c.link && !c.ledger) assert.notDeepEqual(files, baseLedger());
    fs.rmSync(path.join(repo.cwd, '.agents'), { recursive: true, force: true });
    const dir = path.join(repo.cwd, '.agents', 'changes', ledger);
    writeTree(dir, files);
    // The working tree, before any commit: the scaffold-time reading.
    const restore = c.link ? linkInPlace(path.join(dir, c.link), files[c.link], outside) : null;
    const r = run(['parse', '--dir', dir]);
    if (restore) restore();
    // Each ledger document a site is keyed by is one parse names too.
    const docs = c.sites.flatMap(s => / @(\w+)(?: #|$)/.exec(s)?.slice(1) ?? []).map(d => FILE_OF[d] ?? path.posix.basename(gate['batch-file']));
    if (c.unknown) {
      assert.equal(r.status, 2, r.line); assert.match(r.line, c.unknown);
      for (const file of docs) assert.ok(r.line.includes(file), c.name + ': parse must name ' + file);
    } else {
      const expected = c.expect(files);
      if (!expected.length) assert.deepEqual(r, { status: 0, line: 'PARSE OK 2 batches' });
      else {
        assert.equal(r.status, 1, r.line);
        const found = problemsOf(r.line);
        assert.deepEqual(found.map(p => p.slice(0, 2)), expected.map(e => e.slice(0, 2)), r.line);
        found.forEach((p, i) => assert.match(p[2], expected[i][2], r.line));
        for (const file of docs) assert.ok(found.some(p => p[0] === file), c.name + ': parse must name ' + file);
      }
    }
    // Committed with the same bytes; a linked file is committed as a symlink blob.
    repo.git('rm', '-r', '-q', '--cached', '--ignore-unmatch', '--', '.agents'); repo.git('add', '--all');
    if (c.link) {
      const rel = `.agents/changes/${ledger}/${c.link}`, blob = repo.git('hash-object', '-w', '--', rel);
      repo.git('update-index', '--cacheinfo', `120000,${blob},${rel}`);
    }
    repo.git('commit', '--allow-empty', '-q', '-m', c.name);
    repo.git('update-ref', 'refs/heads/integration', repo.git('rev-parse', 'HEAD'));
    const { code, verdict } = await fenceRun(repo.cwd, repo.env, gate);
    assert.equal(code, { PASS: 0, VIOLATION: 1, UNKNOWN: 2 }[verdict.status], JSON.stringify(verdict));
    const measured = [...verdict.unknowns, ...verdict.violations].filter(d => MEASURED.includes(d.code))
      .map(d => d.code + ': ' + d.message + (d.code === 'authority-file' ? ' @' + DOC_OF[path.posix.basename(d.path)] : ''));
    assert.ok(sameSet(measured, c.sites.map(fenceKey)), JSON.stringify(verdict));
    if (!c.sites.length) assert.equal(verdict.status, 'PASS', JSON.stringify(verdict));
  }
});

test('parse-only shapes, the problem cap from both sides, and unreadable input', async t => {
  const dir = path.join(tmp(t), 'ledger');
  const shapes = [
    ['empty plan table', f => edit(f, PLAN, /^\| B01 \|.*\n\| B02 \|.*\n/m, ''), [[PLAN, 1, /^batch table \(#, Branch, Files \(fence\)\) has no rows$/]]],
    ['batch file with no number', f => ({ ...f, '02-batches-x-foo.md': f[B2] }), [['02-batches-x-foo.md', 1, /^no plan row claims this batch file$/]]],
    ['duplicate id', f => edit(f, PLAN, /^\| B02 \|/m, '| B01 |'), null],
  ];
  for (const [name, change, expected] of shapes) {
    const files = change(baseLedger()); writeTree(dir, files);
    const r = run(['parse', '--dir', dir]); assert.equal(r.status, 1, name + ': ' + r.line);
    const found = problemsOf(r.line);
    // Both rows carrying the duplicate are blamed, each on its own line.
    const want = expected ?? [[PLAN, lineOf(files[PLAN], /^\| B01 \|/), /Duplicate or malformed/], [PLAN, lineOf(files[PLAN], /^\| B01 \|/, 1), /Duplicate or malformed/], [PROG, lineOf(files[PROG], /^\| B02 \|/), /^B02: no plan row$/], [B2, 1, /^no plan row claims this batch file$/]];
    assert.deepEqual(found.map(p => p.slice(0, 2)), want.map(e => e.slice(0, 2)), name + ': ' + r.line);
    found.forEach((p, i) => assert.match(p[2], want[i][2], name));
  }
  // Ten problems print whole; the eleventh becomes a count. Held from both sides.
  const orphans = n => Object.fromEntries(Array.from({ length: n }, (_, i) => ['02-batches-' + (50 + i) + '-x.md', 'orphan']));
  writeTree(dir, { ...baseLedger(), ...orphans(10) });
  const ten = run(['parse', '--dir', dir]);
  assert.equal(problemsOf(ten.line).length, 10); assert.doesNotMatch(ten.line, /more\)$/);
  writeTree(dir, { ...baseLedger(), ...orphans(11) });
  const eleven = run(['parse', '--dir', dir]);
  assert.match(eleven.line, /^PARSE FAIL 11 problem\(s\): /); assert.match(eleven.line, / \(\+1 more\)$/);
  assert.equal(eleven.line.replace(/ \(\+1 more\)$/, '').split('; ').length, 10);
  // Unreadable input is UNKNOWN, never a verdict.
  writeTree(dir, without(baseLedger(), PROG));
  const missing = run(['parse', '--dir', dir]); assert.equal(missing.status, 2); assert.match(missing.line, /^UNKNOWN cannot read .*PROGRESS\.md$/);
  writeTree(dir, { ...baseLedger(), [PROG]: Buffer.from([0xff, 0xfe, 0x41]) });
  const binary = run(['parse', '--dir', dir]); assert.equal(binary.status, 2); assert.match(binary.line, /^UNKNOWN not UTF-8: .*PROGRESS\.md$/);
  writeTree(dir, without(baseLedger(), B2)); fs.mkdirSync(path.join(dir, B2));
  const folder = run(['parse', '--dir', dir]); assert.equal(folder.status, 2); assert.match(folder.line, /^UNKNOWN not an ordinary file: .*02-batches-02-two\.md$/);
  const absent = run(['parse', '--dir', path.join(dir, 'absent')]); assert.equal(absent.status, 2); assert.match(absent.line, /^UNKNOWN cannot read ledger directory /);
});

test('parse accepts a CRLF checkout of the same ledger, exactly as the fence does', async t => {
  const dir = path.join(tmp(t), 'ledger');
  const crlf = Object.fromEntries(Object.entries(baseLedger()).map(([k, v]) => [k, v.replace(/\n/g, '\r\n')]));
  assert.ok(Object.values(crlf).every(v => v.includes('\r\n')));
  writeTree(dir, crlf);
  assert.deepEqual(run(['parse', '--dir', dir]), { status: 0, line: 'PARSE OK 2 batches' });
  writeTree(dir, edit(crlf, B1, '**Files**: `a.txt`, `b.txt`', '**Files**: `a.txt`'));
  assert.equal(run(['parse', '--dir', dir]).status, 1, 'the CRLF checkout must still be read, not waved through');
});

test('live corpus: the archived stale-template ledger fails on its tables', () => {
  // Scaffolded from a stale template: a lower-case plan header and two PROGRESS batch tables.
  const archived = path.join(ROOT, '.agents', 'archive', 'OS-20260921-backlog-closeout');
  assert.ok(fs.statSync(archived).isDirectory());
  assert.deepEqual(run(['parse', '--dir', archived]), { status: 1, line: 'PARSE FAIL 2 problem(s): '
    + '01-plan.md:1 batch table (#, Branch, Files (fence)): Missing or ambiguous authority table; '
    + 'PROGRESS.md:1 batch table (#, Branch, Notes): Missing or ambiguous authority table' });
});

// ===== One parser, as a property of the tools directory ======================
// Module-level declarations only: a column-0 function, class, or const/let/var binding.
// Indented locals (git-evidence's and check-fence's `records` arrays) are not parsers.
function moduleLevelNames(source) {
  const names = new Set();
  for (const line of source.split(/\r?\n/)) {
    const fn = /^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\s*\*?|class)\s+([A-Za-z_$][\w$]*)/.exec(line);
    if (fn) { names.add(fn[1]); continue; }
    const binding = /^(?:export\s+)?(?:const|let|var)\s+(.*)$/.exec(line);
    if (binding) for (const m of binding[1].matchAll(/(?:^|[\s,{[])([A-Za-z_$][\w$]*)\s*(?==(?!=)|,|}|]|;|$)/g)) names.add(m[1]);
  }
  return names;
}
function parserDefinitions(root, names) {
  const found = [], covered = [];
  const walk = (dir, prefix) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)) {
      const rel = prefix + e.name;
      if (e.isDirectory()) { walk(path.join(dir, e.name), rel + '/'); continue; }
      covered.push(rel);
      const declared = moduleLevelNames(fs.readFileSync(path.join(dir, e.name), 'utf8'));
      for (const name of names) if (declared.has(name)) found.push(rel + ': ' + name);
    }
  };
  walk(root, '');
  return { found, covered };
}

test('one parser: no tool but ledger-parse.mjs defines a ledger parser, and check-fence imports them', async t => {
  // The swept names are the module's own exports, not a list written here; the size is
  // pinned by hand so an export dropped from both sides still goes red.
  const names = Object.keys(await parserApi).sort();
  assert.deepEqual(names, ['branchCell', 'exactPaths', 'extensions', 'linesOf', 'oneRow', 'records', 'skillPin', 'table']);
  assert.equal(names.length, 8);
  // Live control first: planted definitions in every declaration form, at depth two, beside
  // indented locals that must NOT be reported.
  const control = tmp(t);
  writeTree(control, {
    'rogue.mjs': 'import x from "y";\nfunction table(text, required) {\n  return [];\n}\n',
    'nested/deeper/copy.mjs': 'export const exactPaths = text => [];\nconst first = 1, records = [];\nlet skillPin;\nexport async function oneRow() {}\n',
    'nested/destructured.mjs': 'const { branchCell } = await import("./elsewhere.mjs");\nvar extensions = null\n',
    'locals.mjs': 'function outer() {\n  const records = [];\n  function table() {}\n  let linesOf = 1;\n}\nconst tableRows = 1;\nconst x = table == 1;\n',
  });
  assert.deepEqual(parserDefinitions(control, names), {
    found: ['nested/deeper/copy.mjs: exactPaths', 'nested/deeper/copy.mjs: oneRow', 'nested/deeper/copy.mjs: records', 'nested/deeper/copy.mjs: skillPin',
      'nested/destructured.mjs: branchCell', 'nested/destructured.mjs: extensions', 'rogue.mjs: table'],
    covered: ['locals.mjs', 'nested/deeper/copy.mjs', 'nested/destructured.mjs', 'rogue.mjs'],
  });
  // The real directory, from its own listing.
  const { found, covered } = parserDefinitions(TOOLS, names);
  const listing = fs.readdirSync(TOOLS, { recursive: true }).map(p => p.split(path.sep).join('/')).filter(p => fs.statSync(path.join(TOOLS, p)).isFile()).sort();
  assert.deepEqual(covered.slice().sort(), listing);
  for (const tool of ['check-fence.mjs', 'check-ledger.mjs', 'git-evidence.mjs', 'ledger-parse.mjs']) assert.ok(covered.includes(tool), tool);
  assert.deepEqual(found.filter(f => !f.startsWith('ledger-parse.mjs: ')), [], 'a private parser copy outside ledger-parse.mjs');
  // The detector reads the real module's forms: every export is found where it is defined.
  assert.deepEqual(found.filter(f => f.startsWith('ledger-parse.mjs: ')), names.map(n => 'ledger-parse.mjs: ' + n));
  // check-fence imports exactly the parsers it calls, from the one module.
  const fence = read('orchestrate/tools/check-fence.mjs');
  const imports = [...fence.matchAll(/^import \{([^}]+)\} from '\.\/ledger-parse\.mjs';$/gm)];
  assert.equal(imports.length, 1, 'check-fence.mjs must import the parsers from ./ledger-parse.mjs');
  const imported = imports[0][1].split(',').map(s => s.trim()).sort();
  const called = [...new Set([...fence.matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*)\(/g)].map(m => m[1]))].filter(n => names.includes(n)).sort();
  assert.deepEqual(imported, called);
  assert.ok(called.length >= 6, 'check-fence reads plan, PROGRESS and batch files through the parsers: ' + called);
});

test('check-fence --help bytes are unchanged by the move', () => {
  const r = spawnSync(process.execPath, [path.join(TOOLS, 'check-fence.mjs'), '--help'], { encoding: 'utf8', windowsHide: true });
  assert.equal(r.status, 0);
  assert.equal(createHash('sha256').update(r.stdout).digest('hex'), '0cf41ad7f57e6e591a6cdeaf8c465753b9954acbd24efcca339ed101ade5803a');
});

// ===== The skill pin ==========================================================
const NUL = Buffer.from([0]);
const bytesOf = v => Buffer.isBuffer(v) ? v : Buffer.from(v, 'utf8');
// Written from the specification, independently of the tool: sorted '/'-paths, NUL, bytes
// with CRLF pairs made LF (a latin1 round trip is byte-exact), NUL.
function specHash(files) {
  const h = createHash('sha256');
  for (const rel of Object.keys(files).sort()) {
    h.update(Buffer.from(rel, 'utf8')); h.update(NUL);
    h.update(Buffer.from(bytesOf(files[rel]).toString('latin1').split('\r\n').join('\n'), 'latin1')); h.update(NUL);
  }
  return h.digest('hex');
}
// Upper before lower case, `-` before `/`, and a non-ASCII name: a locale sort or a
// per-directory sort orders these differently from code units.
const SKILL = {
  'SKILL.md': 'top\nline\n', 'B.md': 'upper\n', 'a.md': 'lower\n', 'a-b.md': 'dash\n', 'a/b.md': 'nested\n',
  'references/runners/deep.md': 'deep\n', 'tools/bin.dat': Buffer.from([0, 13, 10, 13, 255, 10]), 'Ω.md': 'omega\n',
};

test('skill hash: the specified format, deterministic, CRLF-blind, and sensitive to content, names and membership', async t => {
  const { skillHash } = await ledgerApi;
  const root = tmp(t), dir = name => path.join(root, name);
  const base = skillHash(writeTree(dir('lf'), SKILL));
  assert.deepEqual(base, { hex: specHash(SKILL), files: 8 });
  assert.deepEqual(skillHash(dir('lf')), base, 'deterministic across runs');
  // CRLF and LF checkouts of the same content, built explicitly rather than inherited from
  // however this machine checks files out.
  const crlf = Object.fromEntries(Object.entries(SKILL).map(([k, v]) => [k, typeof v === 'string' ? v.replace(/\n/g, '\r\n') : v]));
  assert.notDeepEqual(crlf, SKILL);
  assert.deepEqual(skillHash(writeTree(dir('crlf'), crlf)), base, 'a CRLF checkout must pin the same hash');
  // The other side of the boundary: a lone CR is content, not a line ending.
  assert.notEqual(skillHash(writeTree(dir('cr'), { ...SKILL, 'a.md': 'lower\r' })).hex, base.hex);
  const changed = {
    byte: { ...SKILL, 'references/runners/deep.md': 'deeP\n' },
    name: (({ 'a.md': moved, ...rest }) => ({ ...rest, 'c.md': moved }))(SKILL),
    added: { ...SKILL, 'references/extra.md': '' },
    removed: (({ 'B.md': _, ...rest }) => rest)(SKILL),
    binary: { ...SKILL, 'tools/bin.dat': Buffer.from([0, 13, 10, 13, 254, 10]) },
  };
  for (const [kind, files] of Object.entries(changed)) {
    const h = skillHash(writeTree(dir(kind), files));
    assert.notEqual(h.hex, base.hex, kind); assert.equal(h.hex, specHash(files), kind);
  }
  // Operating-system litter never counts, in any case and at any depth; a near-name does.
  const litter = { ...SKILL, 'Thumbs.db': 'x', '.DS_Store': 'x', 'desktop.ini': 'x', 'references/runners/THUMBS.DB': 'x', 'a/Desktop.INI': 'x', 'tools/.ds_store': 'x' };
  assert.deepEqual(skillHash(writeTree(dir('litter'), litter)), base);
  for (const near of ['Thumbs.db.bak', 'xdesktop.ini', 'references/.DS_Store2']) {
    assert.notEqual(skillHash(writeTree(dir('near'), { ...SKILL, [near]: 'x' })).hex, base.hex, near);
  }
});

test('skill hash follows links, refuses cycles, dangling entries, empty and non-directories', async t => {
  const { skillHash } = await ledgerApi;
  const root = tmp(t), real = writeTree(path.join(root, 'real'), SKILL), base = skillHash(real);
  // The recommended install is a junction into a clone: it pins the clone's hash.
  const link = path.join(root, 'installed');
  fs.symlinkSync(real, link, 'junction');
  assert.deepEqual(skillHash(link), base);
  const cycle = path.join(real, 'references', 'loop');
  fs.symlinkSync(real, cycle, 'junction');
  try { assert.throws(() => skillHash(real), /^Error: directory cycle at references\/loop$/); } finally { fs.unlinkSync(cycle); }
  const gone = writeTree(path.join(root, 'gone'), { 'x.md': 'x' }), dangling = path.join(real, 'dangling');
  fs.symlinkSync(gone, dangling, 'junction'); fs.rmSync(gone, { recursive: true });
  try { assert.throws(() => skillHash(real), /cannot stat dangling/); } finally { fs.unlinkSync(dangling); }
  // Neither a file nor a directory: only POSIX can make one without privileges.
  if (process.platform !== 'win32') {
    const fifo = path.join(real, 'references', 'pipe'), made = spawnSync('mkfifo', [fifo]);
    assert.ifError(made.error); assert.equal(made.status, 0, 'mkfifo must create the fixture');
    try { assert.throws(() => skillHash(real), /^Error: not a regular file or directory: references\/pipe$/); } finally { fs.unlinkSync(fifo); }
  }
  assert.deepEqual(skillHash(real), base, 'the tree is restored after the controls');
  fs.mkdirSync(path.join(root, 'empty'));
  assert.deepEqual(run(['skill', '--dir', path.join(root, 'empty')]).line, 'UNKNOWN no files in skill directory ' + path.join(root, 'empty'));
  assert.match(run(['skill', '--dir', path.join(real, 'a.md')]).line, /^UNKNOWN not a directory: /);
  assert.match(run(['skill', '--dir', path.join(root, 'absent')]).line, /^UNKNOWN cannot read skill directory /);
});

test('skill --contract: exactly the documented line form, and nothing looser', async t => {
  const { skillPin } = await parserApi;
  const root = tmp(t), dir = writeTree(path.join(root, 'skill dir with space'), SKILL), hex = specHash(SKILL);
  const pin = (d, h) => '**Skill**: `' + d + '` · sha256 `' + h + '`';
  const contract = (name, text) => { const p = path.join(root, name); fs.writeFileSync(p, text); return p; };
  const good = contract('good.md', '# Contract\n\n' + pin(dir, hex) + '\n\nText.\n');
  assert.deepEqual(skillPin(fs.readFileSync(good, 'utf8')), { dir, hex });
  assert.deepEqual(run(['skill', '--dir', dir]), { status: 0, line: `SKILL ${hex} 8 files` });
  assert.deepEqual(run(['skill', '--contract', good]), { status: 0, line: `SKILL MATCH ${hex}` });
  assert.deepEqual(run(['skill', '--contract', contract('crlf.md', '# Contract\r\n\r\n' + pin(dir, hex) + '\r\n')]), { status: 0, line: `SKILL MATCH ${hex}` });
  const zeros = '0'.repeat(64);
  assert.deepEqual(run(['skill', '--contract', contract('stale.md', pin(dir, zeros) + '\n')]), { status: 1, line: `SKILL MISMATCH pinned ${zeros} actual ${hex}` });
  // --dir wins over the pinned directory; without it, the pinned directory is read.
  const elsewhere = contract('elsewhere.md', pin(path.join(root, 'absent'), hex) + '\n');
  assert.deepEqual(run(['skill', '--dir', dir, '--contract', elsewhere]), { status: 0, line: `SKILL MATCH ${hex}` });
  assert.match(run(['skill', '--contract', elsewhere]).line, /^UNKNOWN cannot read skill directory /);
  const refused = {
    'Missing skill pin line': ['# Contract\n', 'Skill: `' + dir + '` · sha256 `' + hex + '`\n'],
    'Duplicated skill pin line': [pin(dir, hex) + '\n' + pin(dir, hex) + '\n', pin(dir, hex) + '\n**skill**: `' + dir + '`\n'],
    'Malformed skill pin line': [
      pin(dir, hex.toUpperCase()), pin(dir, hex.slice(1)), pin(dir, hex) + ' ', pin(dir, hex) + ' (upgraded)', pin(dir, hex).replace('·', '.'),
      pin(dir, hex).replace('sha256', 'sha-256'), pin(dir, hex).replace(' · ', ' ·  '), '**Skill**: ' + dir + ' · sha256 `' + hex + '`',
      ' ' + pin(dir, hex), '**Skill**:`' + dir + '` · sha256 `' + hex + '`', pin('', hex), pin(dir, hex) + '\rtrailing',
    ],
  };
  for (const [reason, texts] of Object.entries(refused)) texts.forEach((text, i) => {
    const file = contract('refused.md', text), r = run(['skill', '--contract', file]);
    assert.equal(r.status, 2, reason + ' #' + i + ': ' + r.line);
    assert.equal(r.line, 'UNKNOWN ' + reason + ' in ' + file, reason + ' #' + i);
    assert.throws(() => skillPin(text), new RegExp('^Error: ' + reason + '$'), reason + ' #' + i);
  });
  assert.match(run(['skill', '--contract', path.join(root, 'absent.md')]).line, /^UNKNOWN cannot read /);
});

test('flags, --help and one-line output in every case', async () => {
  const help = run(['--help']);
  assert.equal(help.status, 0); assert.match(help.line, /^check-ledger\.mjs parse --dir <ledger-dir> \| skill /);
  const invalid = [[], ['bogus'], ['parse'], ['parse', '--dir'], ['parse', '--dir', 'a', '--dir', 'b'], ['parse', '--contract', 'x'],
    ['skill'], ['skill', '--bogus', 'x'], ['skill', '--dir', '--contract'], ['--help', 'parse'], ['parse', '--help']];
  for (const args of invalid) {
    assert.deepEqual(run(args), { status: 2, line: 'UNKNOWN usage: unknown operation, or an unknown, missing or duplicate flag; use --help' }, JSON.stringify(args));
  }
  // Whatever a path or message holds, the output stays one line: a newline and a C1 byte in
  // the argument reach the printed reason, which run() holds to one line.
  const { oneLine } = await ledgerApi, c = String.fromCharCode;
  assert.deepEqual(run(['parse', '--dir', 'absent' + c(10) + 'dir' + c(0x85)]), { status: 2, line: 'UNKNOWN cannot read ledger directory absent?dir?' });
  assert.equal(oneLine('a' + c(10) + 'b' + c(13) + 'c' + c(0) + c(0x85) + c(0x2028) + c(0x2029) + c(9) + c(0x7f) + ' ·—Ω'), 'a?b?c?????? ·—Ω');
});
