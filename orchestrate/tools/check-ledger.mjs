#!/usr/bin/env node
// Working-tree ledger parse check and skill-directory pin. Every ledger shape is read through
// ledger-parse.mjs, the parser the fence tool uses; this tool may be stricter, never looser.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { decode, parseFlags, validFullRef } from './git-evidence.mjs';
import { linesOf, exactPaths, table, oneRow, branchCell, extensions, skillPin } from './ledger-parse.mjs';

const PLAN = '01-plan.md', PROGRESS = 'PROGRESS.md';
const PLAN_KEYS = ['#', 'Branch', 'Files (fence)'], PROGRESS_KEYS = ['#', 'Branch', 'Notes'];
const BATCH_FILE = /^02-batches-.*\.md$/;
const MAX_PROBLEMS = 10;
// Operating-system litter the repository's .gitignore already names: never part of the pin.
const LITTER = ['.ds_store', 'thumbs.db', 'desktop.ini'];
const HELP = 'check-ledger.mjs parse --dir <ledger-dir> | skill [--dir <skill-dir>] [--contract <00-READBEFORE.md>] (at least one of the two; a relative pinned directory resolves from the working directory). Exit 0 PARSE OK, SKILL <hash> or SKILL MATCH; 1 PARSE FAIL or SKILL MISMATCH; 2 UNKNOWN. Always one line.';

class Unknown extends Error {}

// Ledger files are read without following links: the fence accepts only ordinary committed
// files, so a link, however readable, is never a ledger file here either.
function readText(file, ordinary = false) {
  let stat, bytes;
  try { stat = (ordinary ? fs.lstatSync : fs.statSync)(file); } catch { throw new Unknown(`cannot read ${file}`); }
  if (stat.isSymbolicLink()) throw new Unknown(`a link, not an ordinary file: ${file}`);
  if (!stat.isFile()) throw new Unknown(ordinary ? `not an ordinary file: ${file}` : `cannot read ${file}`);
  try { bytes = fs.readFileSync(file); } catch { throw new Unknown(`cannot read ${file}`); }
  try { return decode(bytes); } catch { throw new Unknown(`not UTF-8: ${file}`); }
}

// A table the fence could not read fails whole; each id is then held to oneRow's rules alone,
// so a duplicate or malformed id is blamed on its own row. Any such row fails the fence for
// every batch, which is exactly when this reports it.
function rowsOf(text, file, keys, add) {
  let rows;
  try { rows = table(text, keys); } catch (e) { add(file, 1, `batch table (${keys.join(', ')}): ${e.message}`); return null; }
  if (!rows.length) { add(file, 1, `batch table (${keys.join(', ')}) has no rows`); return null; }
  for (const row of rows) {
    try { oneRow(rows.filter(r => r['#'] === row['#']), row['#']); } catch (e) { add(file, row.line, `${row['#']}: ${e.message}`); row.invalid = true; }
  }
  return rows;
}

function linesStarting(lines, prefix) {
  return lines.flatMap((l, i) => l.startsWith(prefix) ? [i + 1] : []);
}

// The strictness bar is the fence tool's own linkage and structure checks on a batch file.
function checkBatch(name, text, id, branch, fence, add) {
  const lines = linesOf(text);
  if (!new RegExp(`^# ${id} (?:—|-) `).test(text)) add(name, 1, `title must open "# ${id} — "`);
  const branchAt = linesStarting(lines, '**Branch**: ');
  if (branchAt.length !== 1) add(name, branchAt[1] ?? 1, `${branchAt.length} lines start "**Branch**: ", expected exactly one`);
  else if (branch !== null && lines[branchAt[0] - 1] !== `**Branch**: \`${branch}\``) add(name, branchAt[0], `Branch line must read exactly **Branch**: \`${branch}\``);
  const filesAt = linesStarting(lines, '**Files**: ');
  if (filesAt.length !== 1) add(name, filesAt[1] ?? 1, `${filesAt.length} lines start "**Files**: ", expected exactly one`);
  else if (fence !== null) {
    try {
      if (JSON.stringify(exactPaths(lines[filesAt[0] - 1].slice(11))) !== JSON.stringify(fence)) add(name, filesAt[0], 'Files line differs from the plan fence');
    } catch (e) { add(name, filesAt[0], `Files line: ${e.message}`); }
  }
  const checklist = lines.flatMap((l, i) => l === '## Checklist' ? [i] : []);
  if (checklist.length !== 1 || !lines.some((l, i) => i > checklist[0] && /^## /.test(l))) {
    add(name, checklist.length ? checklist[checklist.length > 1 ? 1 : 0] + 1 : 1, 'needs exactly one "## Checklist" line followed by another "## " heading');
  }
}

// Pure core: the plan and PROGRESS texts, a Map of batch file name to text, and the ledger id
// (the directory name the fence finds it under, `.agents/changes/<ledger>`).
export function checkLedger(plan, progress, batches, ledger) {
  const problems = [], add = (file, line, message) => problems.push({ file, line, message });
  const planRows = rowsOf(plan, PLAN, PLAN_KEYS, add);
  const progressRows = rowsOf(progress, PROGRESS, PROGRESS_KEYS, add);
  // Rows already blamed for their id are counted as present but checked no further.
  const planned = new Map(), planIds = new Set((planRows ?? []).map(r => r['#']));
  for (const row of planRows ?? []) {
    if (row.invalid) continue;
    let fence = null, branch = null;
    try { fence = exactPaths(row['Files (fence)']); } catch (e) { add(PLAN, row.line, `${row['#']} Files (fence): ${e.message}`); }
    try { branch = branchCell(row.Branch); } catch (e) { add(PLAN, row.line, `${row['#']} Branch: ${e.message}`); }
    // The fence can gate only a branch whose full ref it accepts.
    if (branch !== null && !validFullRef(`refs/heads/${branch}`)) add(PLAN, row.line, `${row['#']} Branch: ${branch} is not a valid branch name`);
    planned.set(row['#'], { row, fence, branch });
  }
  // Each batch's own file, where exactly one exists: an extension may not name it.
  const names = [...batches.keys()];
  for (const [id, entry] of planned) {
    entry.own = names.filter(n => n.startsWith(`02-batches-${id.slice(1)}-`));
    entry.ownPath = entry.own.length === 1 ? `.agents/changes/${ledger}/${entry.own[0]}` : null;
  }
  if (progressRows && planRows) {
    const seen = new Set();
    for (const row of progressRows) {
      const id = row['#'], entry = planned.get(id);
      seen.add(id);
      if (!planIds.has(id)) { add(PROGRESS, row.line, `${id}: no plan row`); continue; }
      if (row.invalid || !entry) continue;
      try {
        const branch = branchCell(row.Branch);
        if (entry.branch !== null && branch !== entry.branch) add(PROGRESS, row.line, `${id}: Branch ${branch} differs from the plan's ${entry.branch}`);
      } catch (e) { add(PROGRESS, row.line, `${id} Branch: ${e.message}`); }
      try {
        const extra = extensions(progress, row, id);
        if (entry.fence && extra.some(p => entry.fence.includes(p))) add(PROGRESS, row.line, `${id} Notes: extension repeats a fence path`);
        if (extra.some(p => p === entry.ownPath)) add(PROGRESS, row.line, `${id} Notes: extension names the batch's own file`);
      } catch (e) { add(PROGRESS, row.line, `${id} Notes: ${e.message}`); }
    }
    for (const [id, entry] of planned) if (!seen.has(id)) add(PLAN, entry.row.line, `${id}: no PROGRESS row`);
  }
  if (planRows) {
    for (const [id, entry] of planned) {
      const { own } = entry;
      if (own.length !== 1) { add(PLAN, entry.row.line, `${id}: ${own.length} batch files 02-batches-${id.slice(1)}-*.md, expected exactly one`); continue; }
      checkBatch(own[0], batches.get(own[0]), id, entry.branch, entry.fence, add);
    }
    for (const name of names) {
      const m = /^02-batches-(\d+)-/.exec(name);
      if (!m || !planIds.has('B' + m[1])) add(name, 1, 'no plan row claims this batch file');
    }
  }
  return { status: problems.length ? 'FAIL' : 'OK', batches: planned.size, problems };
}

export function parseLedger(dir) {
  let names;
  try { if (!fs.statSync(dir).isDirectory()) throw new Error(); names = fs.readdirSync(dir); } catch { throw new Unknown(`cannot read ledger directory ${dir}`); }
  const plan = readText(path.join(dir, PLAN), true), progress = readText(path.join(dir, PROGRESS), true);
  const batches = new Map(names.filter(n => BATCH_FILE.test(n)).sort().map(n => [n, readText(path.join(dir, n), true)]));
  return checkLedger(plan, progress, batches, path.basename(path.resolve(dir)));
}

function lf(bytes) {
  const out = Buffer.allocUnsafe(bytes.length);
  let n = 0;
  for (let i = 0; i < bytes.length; i++) if (!(bytes[i] === 13 && bytes[i + 1] === 10)) out[n++] = bytes[i];
  return out.subarray(0, n);
}

// SHA-256 over every regular file, sorted by '/'-separated relative path in code-unit order:
// per file the path, a NUL, the bytes with each CRLF pair made LF, and a NUL.
export function skillHash(dir) {
  const files = [];
  const walk = (abs, rel, ancestors) => {
    let real, names;
    try { real = fs.realpathSync(abs); names = fs.readdirSync(abs); } catch { throw new Unknown(`cannot read skill directory ${rel || dir}`); }
    if (ancestors.includes(real)) throw new Unknown(`directory cycle at ${rel}`);
    for (const name of names) {
      const full = path.join(abs, name), relPath = rel ? `${rel}/${name}` : name;
      let stat;
      try { stat = fs.statSync(full); } catch { throw new Unknown(`cannot stat ${relPath}`); }
      if (stat.isDirectory()) walk(full, relPath, [...ancestors, real]);
      else if (!stat.isFile()) throw new Unknown(`not a regular file or directory: ${relPath}`);
      else if (!LITTER.includes(name.toLowerCase())) files.push({ rel: relPath, full });
    }
  };
  let stat;
  try { stat = fs.statSync(dir); } catch { throw new Unknown(`cannot read skill directory ${dir}`); }
  if (!stat.isDirectory()) throw new Unknown(`not a directory: ${dir}`);
  walk(path.resolve(dir), '', []);
  if (!files.length) throw new Unknown(`no files in skill directory ${dir}`);
  files.sort((a, b) => a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0);
  const hash = createHash('sha256'), nul = Buffer.from([0]);
  for (const file of files) {
    let bytes;
    try { bytes = fs.readFileSync(file.full); } catch { throw new Unknown(`cannot read ${file.rel}`); }
    hash.update(Buffer.from(file.rel, 'utf8')); hash.update(nul); hash.update(lf(bytes)); hash.update(nul);
  }
  return { hex: hash.digest('hex'), files: files.length };
}

function skill({ dir, contract }) {
  let pin = null;
  if (contract !== undefined) {
    const text = readText(contract);
    try { pin = skillPin(text); } catch (e) { throw new Unknown(`${e.message} in ${contract}`); }
  }
  const { hex, files } = skillHash(dir ?? pin.dir);
  if (!pin) return { code: 0, line: `SKILL ${hex} ${files} files` };
  return hex === pin.hex ? { code: 0, line: `SKILL MATCH ${hex}` } : { code: 1, line: `SKILL MISMATCH pinned ${pin.hex} actual ${hex}` };
}

function parseLine(result) {
  if (result.status === 'OK') return { code: 0, line: `PARSE OK ${result.batches} batches` };
  const shown = result.problems.slice(0, MAX_PROBLEMS).map(p => `${p.file}:${p.line} ${p.message}`);
  const more = result.problems.length - shown.length;
  return { code: 1, line: `PARSE FAIL ${result.problems.length} problem(s): ${shown.join('; ')}${more ? ` (+${more} more)` : ''}` };
}

export function ledgerCli(args) {
  if (args.length === 1 && args[0] === '--help') return { code: 0, line: HELP };
  const [operation, ...rest] = args;
  let options;
  try {
    if (operation === 'parse') options = parseFlags(rest, ['dir'], ['dir']);
    else if (operation === 'skill') options = parseFlags(rest, ['dir', 'contract'], []);
    else throw new Error();
    if (operation === 'skill' && options.dir === undefined && options.contract === undefined) throw new Error();
  } catch { return { code: 2, line: 'UNKNOWN usage: unknown operation, or an unknown, missing or duplicate flag; use --help' }; }
  try { return operation === 'parse' ? parseLine(parseLedger(options.dir)) : skill(options); }
  catch (e) { return { code: 2, line: e instanceof Unknown ? `UNKNOWN ${e.message}` : `UNKNOWN internal error: ${e.message}` }; }
}

// One line whatever a path or message holds: C0, DEL, C1 and the line and paragraph
// separators become '?'. Tested by code point, so no escape in this source can be decoded.
const hidden = n => n < 32 || (n >= 127 && n <= 159) || n === 0x2028 || n === 0x2029;
export const oneLine = text => [...text].map(c => hidden(c.codePointAt(0)) ? '?' : c).join('');

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const output = ledgerCli(process.argv.slice(2)); process.stdout.write(oneLine(output.line) + '\n'); process.exitCode = output.code;
}
