const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { makeRepo, LEDGER } = require('./support/git-fixture.cjs');
const ROOT = path.resolve(__dirname, '..');
const TOOLS = path.join(ROOT, 'orchestrate', 'tools');
const TOOL = path.join(TOOLS, 'check-ledger.mjs');
const fenceApi = import('../orchestrate/tools/check-fence.mjs');
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
const lineOf = (text, re, nth = 0) => text.split('\n').flatMap((l, i) => re.test(l) ? [i + 1] : [])[nth];
const NOTES = { B01: /^(\| B01 \| One \|.*\| )— \|$/m, B02: /^(\| B02 \| Two \|.*\| )— \|$/m };
const notes = (files, value, id = 'B01') => edit(files, PROG, NOTES[id], '$1' + value + ' |');
const EXTENSION = 'fence +x.txt (item, reason, 2026-09-23)';
const authorizeInLog = (files, record, ids = ['B01']) => edit(ids.reduce((f, id) => notes(f, record, id), files), PROG,
  /^(\| Date \| Session did \| Stopped because \|\n\|[-|]+\|)$/m, '$1\n| 2026-09-23 | ' + record + ' | — |');
const setBranch = (files, branch) => edit(edit(edit(files, PLAN, '`feat/one`', '`' + branch + '`'), PROG, '`feat/one`', '`' + branch + '`'),
  B1, '**Branch**: `feat/one`', '**Branch**: `' + branch + '`');

// Fence rejection sites as `<code>: <message>`, a clause of a multi-clause condition as
// ` #<clause>`. Written by hand here; the domain they are checked against is DERIVED from the
// fence's and the parser's source below, so the two cannot drift apart silently.
const A = m => 'authority: ' + m, BL = m => 'batch-linkage: ' + m;
const BRANCH = A('Plan/PROGRESS branch linkage does not agree'), REDUNDANT = A('Redundant or ambiguous extension');
const MISSING = A('Missing authoritative ledger text'), TITLE = BL('Batch title does not match ID');
const FILES_BRANCH = BL('Baseline batch Files/Branch must match authoritative plan'), STRUCTURE = 'batch-structure: Unsupported original Checklist section';
const AUTH_FILE = 'authority-file: Authority must be an ordinary committed file', BASELINE = 'batch-baseline: Baseline batch must be an ordinary file';
const USAGE = 'usage: Explicit repository, distinct full refs, ledger ID, batch ID and exact batch file are required';
const PATHS = 'Expected unique exact repository-relative backtick paths (globs unsupported)';
const row = (f, file, id = 'B01') => lineOf(f[file], new RegExp('^\\| ' + id + ' \\|'));

// Each case: the ledger edit, what `parse` must say (the problems it names by file, line and
// message, or an UNKNOWN), and the fence rejection sites the REAL fence reports when the same
// ledger is committed and B01 gated: no sites means the fence PASSes.
const CASES = [
  { name: 'ledger from the real templates', edit: f => f, expect: () => [], sites: [] },
  { name: 'authorized fence extension', edit: f => authorizeInLog(f, EXTENSION), expect: () => [], sites: [] },
  // Stricter than the fence, which reads only the batch it gates.
  { name: 'orphan batch file', sites: [], edit: f => ({ ...f, '02-batches-03-three.md': swap(f[B2], '# B02 — ', '# B03 — ') }),
    expect: () => [['02-batches-03-three.md', 1, /^no plan row claims this batch file$/]] },
  { name: 'two batch files for one id', sites: [], edit: f => ({ ...f, '02-batches-01-copy.md': f[B1] }),
    expect: f => [[PLAN, row(f, PLAN), /^B01: 2 batch files 02-batches-01-\*\.md, expected exactly one$/]] },
  // Ledger authority: the plan and PROGRESS tables, cells and extension records.
  { name: 'glob in the plan fence', sites: [A(PATHS)], edit: f => edit(f, PLAN, '`a.txt`, `b.txt` |', '`*.txt` |'),
    expect: f => [[PLAN, row(f, PLAN), /^B01 Files \(fence\): Expected unique exact repository-relative backtick paths \(globs unsupported\)$/]] },
  { name: 'empty plan fence cell', sites: [A('Empty file fence')], edit: f => edit(f, PLAN, '`a.txt`, `b.txt` |', '|'),
    expect: f => [[PLAN, row(f, PLAN), /^B01 Files \(fence\): Empty file fence$/]] },
  { name: 'malformed plan table header', sites: [A('Malformed table header')], edit: f => edit(f, PLAN, '|---|-------|', '|---|--x----|'),
    expect: () => [[PLAN, 1, /^batch table \(#, Branch, Files \(fence\)\): Malformed table header$/]] },
  { name: 'plan row missing a cell', sites: [A('Malformed table row')], edit: f => edit(f, PLAN, /^(\| B02 \|.*) — \|$/m, '$1'),
    expect: () => [[PLAN, 1, /^batch table \(#, Branch, Files \(fence\)\): Malformed table row$/]] },
  { name: 'two PROGRESS batch tables', sites: [A('Missing or ambiguous authority table')],
    edit: f => edit(f, PROG, '## Checkpoints', '| # | Branch | Notes |\n|---|---|---|\n| B01 | `feat/one` | — |\n\n## Checkpoints'),
    expect: () => [[PROG, 1, /^batch table \(#, Branch, Notes\): Missing or ambiguous authority table$/]] },
  { name: 'malformed Bnn', sites: [A('Duplicate or malformed batch IDs')], edit: f => edit(f, PLAN, /^\| B02 \|/m, '| B2 |'),
    expect: f => [[PLAN, row(f, PLAN, 'B2'), /^B2: Duplicate or malformed batch IDs$/], [PROG, row(f, PROG, 'B02'), /^B02: no plan row$/], [B2, 1, /^no plan row claims this batch file$/]] },
  { name: 'plan and PROGRESS ids differ', sites: [A('Missing or duplicate requested batch')], edit: f => edit(f, PROG, /^\| B01 \| One \|/m, '| B03 | One |'),
    expect: f => [[PROG, row(f, PROG, 'B03'), /^B03: no plan row$/], [PLAN, row(f, PLAN), /^B01: no PROGRESS row$/]] },
  { name: 'malformed plan branch cell', sites: [A('Malformed branch cell')], edit: f => edit(f, PLAN, '`feat/one`', '`feat/one`x'),
    expect: f => [[PLAN, row(f, PLAN), /^B01 Branch: Malformed branch cell$/]] },
  { name: 'malformed PROGRESS branch cell', sites: [A('Malformed branch cell')], edit: f => edit(f, PROG, '`feat/one`', '`feat/one`x'),
    expect: f => [[PROG, row(f, PROG), /^B01 Branch: Malformed branch cell$/]] },
  { name: 'plan branch disagrees with PROGRESS and the batch file', sites: [BRANCH + ' #plan-branch'], edit: f => edit(f, PLAN, '`feat/one`', '`feat/other`'),
    expect: f => [[PROG, row(f, PROG), /^B01: Branch feat\/one differs from the plan's feat\/other$/], [B1, lineOf(f[B1], /^\*\*Branch\*\*: /), /^Branch line must read exactly \*\*Branch\*\*: `feat\/other`$/]] },
  { name: 'PROGRESS branch disagrees with the plan', sites: [BRANCH + ' #progress-branch'], edit: f => edit(f, PROG, '`feat/one`', '`feat/other`'),
    expect: f => [[PROG, row(f, PROG), /^B01: Branch feat\/other differs from the plan's feat\/one$/]] },
  { name: 'malformed fence extension', sites: [A('Malformed fence extension')], edit: f => notes(f, 'fence +x.txt (item, reason)'),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: Malformed fence extension$/]] },
  { name: 'unsupported fence extension grammar', sites: [A('Unsupported fence extension grammar')], edit: f => notes(f, 'fence +x.txt'),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: Unsupported fence extension grammar$/]] },
  { name: 'extension recorded for another id', sites: [A('Mismatched or ambiguous extension in Notes')], edit: f => notes(f, 'fence +x.txt (B02, item, reason, 2026-09-23)'),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: Mismatched or ambiguous extension in Notes$/]] },
  { name: 'extension with two session logs', sites: [A('Extension needs an unambiguous session log')],
    edit: f => edit(authorizeInLog(f, EXTENSION), PROG, '## Session log', '## Session log\n\n## Session log'),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: Extension needs an unambiguous session log$/]] },
  { name: 'extension with no session-log authorization', sites: [A('Extension needs exactly one matching session-log authorization')], edit: f => notes(f, EXTENSION),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: Extension needs exactly one matching session-log authorization$/]] },
  { name: 'extension owned by two rows', sites: [A('Extension cannot be bound to one batch row')], edit: f => authorizeInLog(f, EXTENSION, ['B01', 'B02']),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: Extension cannot be bound to one batch row$/], [PROG, row(f, PROG, 'B02'), /^B02 Notes: Extension cannot be bound to one batch row$/]] },
  { name: 'authorized extension repeating a fence path', sites: [REDUNDANT + ' #in-fence'], edit: f => authorizeInLog(f, EXTENSION.replace('x.txt', 'a.txt')),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: extension repeats a fence path$/]] },
  { name: 'authorized extension naming the batch file itself', sites: [REDUNDANT + ' #own-batch-file'], edit: f => authorizeInLog(f, EXTENSION.replace('x.txt', `${LEDGER}/${B1}`)),
    expect: f => [[PROG, row(f, PROG), /^B01 Notes: extension names the batch's own file$/]] },
  // Authority files the fence will not read: missing, or a link.
  { name: 'missing plan', sites: [MISSING + ' #plan', AUTH_FILE], edit: f => without(f, PLAN), unknown: /^UNKNOWN cannot read .*01-plan\.md$/ },
  { name: 'missing PROGRESS', sites: [MISSING + ' #progress', AUTH_FILE], edit: f => without(f, PROG), unknown: /^UNKNOWN cannot read .*PROGRESS\.md$/ },
  { name: 'linked plan', sites: [AUTH_FILE], link: PLAN, edit: f => f, unknown: /^UNKNOWN a link, not an ordinary file: .*01-plan\.md$/ },
  // A branch the fence can never be invoked for.
  { name: 'impossible branch name', sites: [USAGE], ref: 'feat/one x', edit: f => setBranch(f, 'feat/one x'),
    expect: f => [[PLAN, row(f, PLAN), /^B01 Branch: feat\/one x is not a valid branch name$/]] },
  // The batch file: its linkage to the plan, and its structure.
  { name: 'missing batch file', sites: [BASELINE], edit: f => without(f, B1),
    expect: f => [[PLAN, row(f, PLAN), /^B01: 0 batch files 02-batches-01-\*\.md, expected exactly one$/]] },
  { name: 'linked batch file', sites: [BASELINE], link: B1, edit: f => f, unknown: /^UNKNOWN a link, not an ordinary file: .*02-batches-01-one\.md$/ },
  { name: 'title names another id', sites: [TITLE], edit: f => edit(f, B1, '# B01 — ', '# B09 — '),
    expect: () => [[B1, 1, /^title must open "# B01 — "$/]] },
  { name: 'title with a colon for the dash', sites: [TITLE], edit: f => edit(f, B1, '# B01 — ', '# B01: '),
    expect: () => [[B1, 1, /^title must open "# B01 — "$/]] },
  { name: 'duplicate Files line', sites: [FILES_BRANCH + ' #files-count'], edit: f => edit(f, B1, /^(\*\*Files\*\*: .*)$/m, '$1\n$1'),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Files\*\*: /, 1), /^2 lines start "\*\*Files\*\*: ", expected exactly one$/]] },
  { name: 'duplicate Branch line', sites: [FILES_BRANCH + ' #branch-count'], edit: f => edit(f, B1, /^(\*\*Branch\*\*: .*)$/m, '$1\n$1'),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Branch\*\*: /, 1), /^2 lines start "\*\*Branch\*\*: ", expected exactly one$/]] },
  { name: 'text after the Branch backtick', sites: [FILES_BRANCH + ' #branch-exact'], edit: f => edit(f, B1, '**Branch**: `feat/one`', '**Branch**: `feat/one` (cut from the tip)'),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Branch\*\*: /), /^Branch line must read exactly \*\*Branch\*\*: `feat\/one`$/]] },
  { name: 'stale Files line', sites: [FILES_BRANCH + ' #files-equal'], edit: f => edit(f, B1, '**Files**: `a.txt`, `b.txt`', '**Files**: `a.txt`'),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Files\*\*: /), /^Files line differs from the plan fence$/]] },
  { name: 'reordered Files line', sites: [FILES_BRANCH + ' #files-equal'], edit: f => edit(f, B1, '**Files**: `a.txt`, `b.txt`', '**Files**: `b.txt`, `a.txt`'),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Files\*\*: /), /^Files line differs from the plan fence$/]] },
  { name: 'glob in the Files line', sites: [BL(PATHS)], edit: f => edit(f, B1, '**Files**: `a.txt`, `b.txt`', '**Files**: `*.txt`'),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Files\*\*: /), /^Files line: Expected unique exact repository-relative backtick paths \(globs unsupported\)$/]] },
  { name: 'empty Files line', sites: [BL('Empty file fence')], edit: f => edit(f, B1, '**Files**: `a.txt`, `b.txt`', '**Files**: '),
    expect: f => [[B1, lineOf(f[B1], /^\*\*Files\*\*: /), /^Files line: Empty file fence$/]] },
  { name: 'missing Checklist', sites: [STRUCTURE + ' #no-checklist'], edit: f => edit(f, B1, '## Checklist', '## Tasks'),
    expect: () => [[B1, 1, /^needs exactly one "## Checklist" line followed by another "## " heading$/]] },
  { name: 'duplicate Checklist', sites: [STRUCTURE + ' #two-checklists'], edit: f => edit(f, B1, '## Checklist', '## Checklist\n\n## Checklist'),
    expect: f => [[B1, lineOf(f[B1], /^## Checklist$/, 1), /^needs exactly one "## Checklist" line followed by another "## " heading$/]] },
  { name: 'Checklist is the last heading', sites: [STRUCTURE + ' #no-later-heading'], edit: f => edit(f, B1, /\n## Acceptance criteria[\s\S]*$/, '\n'),
    expect: f => [[B1, lineOf(f[B1], /^## Checklist$/), /^needs exactly one "## Checklist" line followed by another "## " heading$/]] },
];
// Clause names for each fence condition that joins several clauses with `||`; their number
// is checked against the source line that raises the site.
const CLAUSES = {
  [BRANCH]: ['ref-not-heads', 'plan-branch', 'progress-branch'], [REDUNDANT]: ['in-fence', 'own-batch-file'],
  [MISSING]: ['plan', 'progress'], [FILES_BRANCH]: ['files-count', 'branch-count', 'branch-exact', 'files-equal'],
  [STRUCTURE]: ['no-checklist', 'two-checklists', 'no-later-heading'],
};
// The gated ref is the operator's input, never a ledger shape.
const UNREACHABLE = [BRANCH + ' #ref-not-heads'];
// A missing authority file is always also a non-ordinary one: the two sites cannot part.
const PAIRED = [MISSING + ' #plan', MISSING + ' #progress'];
// Every site at which the fence rejects a ledger shape, derived from the source: each message
// thrown in the fence's authority and linkage blocks or by any parser those blocks reach, the
// fence's non-ordinary-file and structure diagnostics, and each clause of a joined condition.
function fenceRejectionSites() {
  const fence = read('orchestrate/tools/check-fence.mjs'), parser = read('orchestrate/tools/ledger-parse.mjs');
  const throwsIn = text => [...text.matchAll(/throw new Error\('([^']+)'\)/g)].map(m => m[1]);
  const bodies = Object.fromEntries(parser.split(/^export /m).slice(1).map(part => [/^(?:const|function)\s+([\w$]+)/.exec(part)[1], part]));
  const calls = text => [...text.matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*)\(/g)].map(m => m[1]).filter(n => Object.hasOwn(bodies, n));
  const reach = text => {
    const seen = new Set(), todo = calls(text);
    while (todo.length) { const n = todo.pop(); if (!seen.has(n)) { seen.add(n); todo.push(...calls(bodies[n])); } }
    return [...seen];
  };
  const block = (from, to) => {
    const start = fence.indexOf(from), end = fence.indexOf(to, start);
    assert.ok(start >= 0 && end > start, 'check-fence.mjs block not found: ' + from);
    return fence.slice(start, end);
  };
  const own = [], parsed = [];
  for (const [code, text] of [['authority', block('if (plan === null', "diagnostic('authority', e.message")],
    ['batch-linkage', block('if (!new RegExp(`^# ${batchId}', "diagnostic('batch-linkage', e.message")]]) {
    own.push(...throwsIn(text).map(m => code + ': ' + m));
    parsed.push(...reach(text).flatMap(n => throwsIn(bodies[n])).map(m => code + ': ' + m));
  }
  for (const m of fence.matchAll(/diagnostic\('(authority-file|batch-baseline)', '([^']+)'/g)) own.push(m[1] + ': ' + m[2]);
  for (const m of fence.matchAll(/add\('(batch-structure)', '([^']+)'/g)) own.push(m[1] + ': ' + m[2]);
  const sites = [...new Set(parsed)];
  for (const site of new Set(own)) {
    const message = site.slice(site.indexOf(': ') + 2), lines = fence.split('\n').filter(l => l.includes("'" + message + "'"));
    assert.equal(lines.length, 1, 'one source line raises ' + site);
    const clauses = lines[0].split(' || ').length;
    assert.equal(clauses, CLAUSES[site]?.length ?? 1, site + ': the clause names must match the conditions joined on its source line');
    sites.push(...(CLAUSES[site] ? CLAUSES[site].map(c => site + ' #' + c) : [site]));
  }
  return sites;
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
  assert.equal(domain.length, 33, JSON.stringify(domain, null, 1));
  assert.equal(new Set(domain).size, domain.length);
  for (const site of [...UNREACHABLE, ...PAIRED]) assert.ok(domain.includes(site), site);
  assert.equal(CASES.length, 41);
  assert.equal(new Set(CASES.map(c => c.name)).size, CASES.length);
  for (const c of CASES) for (const site of c.sites) assert.ok(domain.includes(site) || site === USAGE, c.name + ': not a fence rejection site: ' + site);
  // Owned: some case is rejected by the fence at this site and no other, so the parse check
  // standing opposite it is the only thing that can make that case fail.
  for (const site of domain) {
    if (UNREACHABLE.includes(site)) { assert.ok(!CASES.some(c => c.sites.includes(site)), site); continue; }
    const alone = PAIRED.includes(site) ? [site, AUTH_FILE] : [site];
    assert.ok(CASES.some(c => sameSet(c.sites, alone)), 'no case is rejected at this site alone: ' + site);
  }
  assert.ok(CASES.some(c => sameSet(c.sites, [USAGE])), 'a branch the fence can never gate');
  assert.ok(CASES.some(c => !c.sites.length && c.expect(c.edit(baseLedger())).length), 'a case where parse is stricter than the fence');
});

test('parse is never looser than the fence: each case in parse and in the real fence', async t => {
  const { checkFence } = await fenceApi;
  const MEASURED = ['authority', 'batch-linkage', 'authority-file', 'batch-baseline', 'batch-structure', 'usage'];
  // One shared repository for every case: each commit replaces the whole ledger.
  const repo = makeRepo(t), outside = tmp(t); repo.git('checkout', '-b', 'feat/one'); repo.git('config', 'core.symlinks', 'false');
  const dir = path.join(repo.cwd, ...LEDGER.split('/'));
  const opts = { repo: repo.cwd, integration: 'refs/heads/integration', batch: 'refs/heads/feat/one', ledger: 'FIXTURE',
    'batch-id': 'B01', 'batch-file': `${LEDGER}/${B1}`, env: repo.env };
  for (const c of CASES) await t.test(c.name, () => {
    const files = c.edit(baseLedger());
    // Only the base control and the link cases, which change the file type, keep the bytes.
    if (c.name !== 'ledger from the real templates' && !c.link) assert.notDeepEqual(files, baseLedger());
    writeTree(dir, files);
    // The working tree, before any commit: the scaffold-time reading.
    const restore = c.link ? linkInPlace(path.join(dir, c.link), files[c.link], outside) : null;
    const r = run(['parse', '--dir', dir]);
    if (restore) restore();
    if (c.unknown) { assert.equal(r.status, 2, r.line); assert.match(r.line, c.unknown); }
    else {
      const expected = c.expect(files);
      if (!expected.length) assert.deepEqual(r, { status: 0, line: 'PARSE OK 2 batches' });
      else {
        assert.equal(r.status, 1, r.line);
        const found = problemsOf(r.line);
        assert.deepEqual(found.map(p => p.slice(0, 2)), expected.map(e => e.slice(0, 2)), r.line);
        found.forEach((p, i) => assert.match(p[2], expected[i][2], r.line));
      }
    }
    // Committed with the same bytes; a linked file is committed as a symlink blob.
    repo.git('rm', '-r', '-q', '--cached', '--ignore-unmatch', '--', '.agents'); repo.git('add', '--all');
    if (c.link) {
      const rel = `${LEDGER}/${c.link}`, blob = repo.git('hash-object', '-w', '--', rel);
      repo.git('update-index', '--cacheinfo', `120000,${blob},${rel}`);
    }
    repo.git('commit', '--allow-empty', '-q', '-m', c.name);
    repo.git('update-ref', 'refs/heads/integration', repo.git('rev-parse', 'HEAD'));
    const verdict = checkFence(c.ref ? { ...opts, batch: 'refs/heads/' + c.ref } : opts);
    const measured = [...verdict.unknowns, ...verdict.violations].filter(d => MEASURED.includes(d.code)).map(d => d.code + ': ' + d.message);
    assert.ok(sameSet(measured, c.sites.map(s => s.split(' #')[0])), JSON.stringify(verdict));
    if (!c.sites.length) assert.equal(verdict.status, 'PASS', JSON.stringify(verdict));
  });
});

test('parse-only shapes, the problem cap from both sides, and unreadable input', async t => {
  const dir = path.join(tmp(t), 'ledger');
  const shapes = [
    ['empty plan table', f => edit(f, PLAN, /^\| B01 \|.*\n\| B02 \|.*\n/m, ''), [[PLAN, 1, /^batch table \(#, Branch, Files \(fence\)\) has no rows$/]]],
    ['batch file with no number', f => ({ ...f, '02-batches-x-foo.md': f[B2] }), [['02-batches-x-foo.md', 1, /^no plan row claims this batch file$/]]],
    ['duplicate id', f => edit(f, PLAN, /^\| B02 \|/m, '| B01 |'), null],
    ['missing Branch line', f => edit(f, B1, /^\*\*Branch\*\*: .*\n/m, ''), [[B1, 1, /^0 lines start "\*\*Branch\*\*: ", expected exactly one$/]]],
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
