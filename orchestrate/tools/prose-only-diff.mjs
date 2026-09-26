#!/usr/bin/env node
// Classifies a polish diff between two commits in ONE line: PROSE-ONLY when every changed
// JavaScript file differs only in its prose comments, CODE <path> or UNKNOWN <reason> otherwise.
// It reads git objects and writes nothing. A path that is not JavaScript is counted and left to
// the path rule; it never makes the verdict PROSE-ONLY on its own.
import fs from 'node:fs';
import { git, capture, parseFlags, isMain } from './git-evidence.mjs';
import { oneLine } from './check-ledger.mjs';

const JAVASCRIPT = /\.(?:js|cjs|mjs)$/;
const REGULAR = /^100(?:644|755)$/;
// The BOM is kept as text, so adding or dropping one is a change like any other.
const utf8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

// A comment that steers a tool is code: rewording it changes what the tool does. Three families,
// each catching comments the other two miss: a tool named anywhere in the comment, a marker
// opening it (`//#`, `//@`, `/*!`, `///`, `/* global`, `/* exported`), and a JSDoc tag.
export const DIRECTIVES = [
  ['eslint', /(?<![\w-])eslint/i],
  ['istanbul', /(?<![\w-])istanbul(?![\w-])/i],
  ['c8', /(?<![\w-])c8(?![\w-])/i],
  ['@ts-', /@ts-/i],
  ['prettier', /(?<![\w-])prettier/i],
  ['v8', /(?<![\w-])v8(?![\w-])/i],
  ['jshint', /(?<![\w-])jshint/i],
  ['biome', /(?<![\w-])biome/i],
  ['deno-lint', /(?<![\w-])deno-lint/i],
  ['oxlint', /(?<![\w-])oxlint/i],
  ['webpack', /(?<![\w-])webpack/i],
  // ESLint's no-fallthrough reads this comment as the intent to fall through.
  ['falls through', /(?<![\w-])falls?\s?through(?![\w-])/i],
];
const MARKER = /^\/[/*]\s*(?:[/!#@]|globals?(?![\w-])|exported(?![\w-]))/;
const TAG = /(?<![\w@.-])@[A-Za-z_$]/;
export function keptBy(comment) {
  return [DIRECTIVES.some(([, pattern]) => pattern.test(comment)) && 'directive', MARKER.test(comment) && 'marker', TAG.test(comment) && 'tag'].filter(Boolean);
}

const TERMINATOR = /[\n\r\u2028\u2029]/;
const SPACE = /[\t\v\f \u00a0\ufeff\p{Zs}]/u;
const isTerminator = c => c !== undefined && TERMINATOR.test(c);
const wordChar = c => c !== undefined && !TERMINATOR.test(c) && !SPACE.test(c) && (/[\w$\\]/.test(c) || c > '\u007f');
// After these words a `/` opens a regular expression; after any other word it divides.
export const OPERAND_KEYWORDS = new Set(['return', 'typeof', 'instanceof', 'in', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'extends', 'default']);
// A keyword or a plain name depending on context, so a `/` after one is in doubt.
export const CONTEXTUAL = new Set(['of', 'yield', 'await']);
export const CONTROL = new Set(['if', 'while', 'for', 'with']);
// true: an expression starts here; false: an operator does; 'doubt': either may.
function expressionStarts(prev) {
  if (!prev) return true;
  if (prev.type === 'value') return false;
  if (prev.type === 'word') return prev.property ? false : OPERAND_KEYWORDS.has(prev.text) ? true : CONTEXTUAL.has(prev.text) ? 'doubt' : false;
  if (prev.text === ')') return prev.control;
  if (prev.text === ']' || prev.text === '.') return false;
  if (prev.text === '++' || prev.text === '--') return !prev.postfix;
  return prev.text === '}' ? 'doubt' : true;
}
function stringEnd(source, at) {
  for (let j = at + 1; j < source.length; j++) {
    const c = source[j];
    if (c === source[at]) return j + 1;
    if (c === '\n' || c === '\r') return -1;
    if (c === '\\') j += source.startsWith('\r\n', j + 1) ? 2 : 1;
  }
  return -1;
}
function regexEnd(source, at) {
  let inClass = false;
  for (let j = at + 1; j < source.length; j++) {
    const c = source[j];
    if (isTerminator(c)) return -1;
    if (c === '\\') { j++; if (j >= source.length || isTerminator(source[j])) return -1; }
    else if (c === '[') inClass = true;
    else if (c === ']') inClass = false;
    else if (c === '/' && !inClass) { let end = j + 1; while (wordChar(source[end])) end++; return end; }
  }
  return -1;
}

// The comments of a JavaScript source, found by a tokenizer that tracks strings, template
// literals (with `${}` nesting), regular expressions and both comment forms. Anything it cannot
// delimit with certainty is a failure, never a guess: { ok: false, reason }.
export function scan(source) {
  const comments = [], braces = [], parens = [], n = source.length;
  let i = 0, prev = null, template = false, lineHasCode = false;
  const endOfLine = from => { let j = from; while (j < n && !isTerminator(source[j])) j++; return j; };
  const token = (type, text, extra = {}) => { prev = { type, text, ...extra }; lineHasCode = true; };
  const fail = reason => ({ ok: false, reason });
  if (source.startsWith('#!')) { i = endOfLine(0); lineHasCode = true; }
  while (i < n) {
    const c = source[i], next = source[i + 1];
    if (template) {
      lineHasCode = true;
      if (c === '\\') i += 2;
      else if (c === '`') { template = false; token('value', c); i++; }
      else if (c === '$' && next === '{') { braces.push('${'); template = false; token('punct', '${'); i += 2; }
      else i++;
    } else if (isTerminator(c)) { lineHasCode = false; i++; }
    else if (SPACE.test(c)) i++;
    else if (c === '/' && next === '/') { const end = endOfLine(i); comments.push({ start: i, end }); i = end; }
    else if (c === '/' && next === '*') {
      const close = source.indexOf('*/', i + 2);
      if (close === -1) return fail('an unterminated block comment');
      comments.push({ start: i, end: close + 2 });
      if (TERMINATOR.test(source.slice(i, close))) lineHasCode = false;
      i = close + 2;
    } else if (c === '\'' || c === '"') {
      const end = stringEnd(source, i);
      if (end === -1) return fail('an unterminated string');
      token('value', c); i = end;
    } else if (c === '`') { template = true; lineHasCode = true; i++; }
    else if (c === '/') {
      let starts = expressionStarts(prev);
      // A regular expression closes on its own line: with no later `/` there, it cannot be one.
      if (starts === 'doubt' && !source.slice(i + 1, endOfLine(i)).includes('/')) starts = false;
      if (starts === 'doubt') return fail('a / that may open a regular expression or divide');
      if (starts) {
        const end = regexEnd(source, i);
        if (end === -1) return fail('an unterminated regular expression');
        token('value', c); i = end;
      } else { token('punct', c); i++; }
    } else if (c === '<' && source.startsWith('<!--', i)) return fail('an HTML-like comment <!--');
    else if (c === '<' && expressionStarts(prev) === true) return fail('a < where an expression starts (JSX?)');
    else if (c === '<') { const op = /^<<?=?/.exec(source.slice(i, i + 3))[0]; token('punct', op); i += op.length; }
    else if (c === '-' && source.startsWith('-->', i) && !lineHasCode) return fail('an HTML-like comment -->');
    else if (c === '{') { braces.push(c); token('punct', c); i++; }
    else if (c === '}') {
      const open = braces.pop();
      if (open === undefined) return fail('an unmatched }');
      if (open === '${') { template = true; lineHasCode = true; } else token('punct', c);
      i++;
    } else if (c === '(') {
      parens.push(prev?.type === 'word' && !prev.property && (CONTROL.has(prev.text) || (prev.text === 'await' && prev.after === 'for')));
      token('punct', c); i++;
    } else if (c === ')') {
      if (!parens.length) return fail('an unmatched )');
      token('punct', c, { control: parens.pop() }); i++;
    } else if (wordChar(c)) {
      let end = i + 1;
      while (end < n && wordChar(source[end])) end++;
      token('word', source.slice(i, end), { property: prev?.text === '.' || prev?.text === '?.', after: prev?.text }); i = end;
    } else if ((c === '+' || c === '-') && next === c) {
      // Postfix when an operand ends the same line just before it; otherwise it prefixes what follows.
      const operand = prev && (prev.type === 'value' || (prev.type === 'word' && (prev.property || !OPERAND_KEYWORDS.has(prev.text))) || prev.text === ']' || (prev.text === ')' && !prev.control));
      token('punct', c + c, { postfix: Boolean(lineHasCode && operand) }); i += 2;
    }
    else if (c === '?' && next === '.' && !/[0-9]/.test(source[i + 2] ?? '')) { token('punct', '?.'); i += 2; }
    else { token('punct', c); i++; }
  }
  if (template) return fail('an unterminated template literal');
  if (braces.length || parens.length) return fail('an unclosed (, { or ${');
  return { ok: true, comments };
}

// The source less its prose comments, compared byte for byte. A line that held only prose
// comments goes (or stays as an empty line where `lines` keeps the line structure a kept
// comment counts on); spaces and tabs before a comment that ends its line go with it; a block
// comment inside a line becomes one space, and one that spans lines leaves its line break.
export function remainder(source, comments, lines) {
  const removed = comments.filter(c => !c.kept);
  let out = '', k = 0;
  for (let start = 0; ;) {
    let end = start;
    while (end < source.length && !isTerminator(source[end])) end++;
    const eol = source.startsWith('\r\n', end) ? '\r\n' : source.slice(end, end + 1);
    let text = '', touched = false, lastCut = start;
    for (let j = start; j < end;) {
      while (k < removed.length && removed[k].end <= j) k++;
      const c = removed[k];
      if (c && c.start <= j) {
        if (c.start >= start && c.end <= end && source[c.start + 1] === '*') text += ' ';
        touched = true; j = Math.min(c.end, end); lastCut = j;
      } else {
        const stop = c ? Math.min(c.start, end) : end;
        text += source.slice(j, stop); j = stop;
      }
    }
    if (touched && /^[ \t]*$/.test(source.slice(lastCut, end))) text = text.replace(/[ \t]+$/, '');
    if (!touched || text !== '') out += text + eol;
    else if (lines) out += eol;
    if (!eol) return out;
    start = end + eol.length;
  }
}

// One file's two sides: PROSE-ONLY when their remainders are identical, CODE when not, UNKNOWN
// when either side cannot be read with certainty.
export function compareSources(before, after) {
  const sides = [['base', before], ['head', after]].map(([side, source]) => {
    if (source.includes('\0')) return { side, reason: 'a NUL byte (binary)' };
    const scanned = scan(source);
    if (!scanned.ok) return { side, reason: scanned.reason };
    return { side, source, comments: scanned.comments.map(c => ({ ...c, kept: keptBy(source.slice(c.start, c.end)).length > 0 })) };
  });
  const failed = sides.find(s => s.reason);
  if (failed) return { verdict: 'UNKNOWN', reason: `${failed.reason} (${failed.side})` };
  // A kept comment may count lines (`next-line`, `ignore next 3`) or annotate the line after it,
  // so either side carrying one keeps every line where it stands.
  const lines = sides.some(s => s.comments.some(c => c.kept));
  const [a, b] = sides.map(s => remainder(s.source, s.comments, lines));
  return { verdict: a === b ? 'PROSE-ONLY' : 'CODE' };
}

export function rawChanges(text) {
  if (text === '') return [];
  const fields = text.split('\0');
  if (fields.pop() !== '' || fields.length % 2) throw new Error('odd field count');
  const changes = [];
  for (let f = 0; f < fields.length; f += 2) {
    const m = /^:([0-7]{6}) ([0-7]{6}) ([0-9a-f]{40}|[0-9a-f]{64}) ([0-9a-f]{40}|[0-9a-f]{64}) ([ADMT])$/.exec(fields[f]);
    if (!m || !fields[f + 1]) throw new Error('unreadable record');
    changes.push({ from: m[1], to: m[2], before: m[3], after: m[4], status: m[5], path: fields[f + 1] });
  }
  return changes.sort((x, y) => (x.path < y.path ? -1 : x.path > y.path ? 1 : 0));
}
function blobText(repo, sha, options) {
  const r = git(repo, ['cat-file', 'blob', sha], options);
  if (!r.ok) return { reason: r.diagnostic.code === 'invalid-encoding' ? 'text that is not UTF-8' : 'a blob git could not read' };
  return { text: utf8.decode(r.bytes) };
}

export function proseOnlyDiff({ repo, base, head, ...options }) {
  const unknown = reason => ({ code: 2, line: `UNKNOWN ${reason}` });
  const diagnostics = [], from = capture(repo, base, diagnostics, options), to = capture(repo, head, diagnostics, options);
  if (!from || !to) return unknown(`cannot resolve ${from ? '--head' : '--base'} to a commit in ${repo}`);
  const diff = git(repo, ['diff', '--raw', '-z', '--no-abbrev', '--no-renames', '--no-relative', '--no-ext-diff', '--no-textconv', '--no-color', from, to, '--'], options);
  if (!diff.ok) return unknown('git diff did not run');
  let changes;
  try { changes = rawChanges(diff.text); } catch { return unknown('git diff output this tool cannot read'); }
  const code = [], doubts = [];
  let prose = 0, other = 0;
  for (const change of changes) {
    if (!JAVASCRIPT.test(change.path)) other++;
    // Added, deleted, turned into a link, re-moded or not a regular file: never prose.
    else if (change.status !== 'M' || change.from !== change.to || !REGULAR.test(change.from)) code.push(change.path);
    else {
      const [a, b] = [change.before, change.after].map(sha => blobText(repo, sha, options));
      const result = a.reason || b.reason ? { verdict: 'UNKNOWN', reason: `${a.reason || b.reason} (${a.reason ? 'base' : 'head'})` } : compareSources(a.text, b.text);
      if (result.verdict === 'UNKNOWN') doubts.push(`${change.path}: ${result.reason}`);
      else if (result.verdict === 'CODE') code.push(change.path);
      else prose++;
    }
  }
  const others = other ? `; ${other} other path(s) left to the path rule` : '';
  if (doubts.length) return unknown(doubts[0]);
  if (code.length) return { code: 1, line: `CODE ${code[0]}` };
  if (!prose) return unknown(`no JavaScript file changed${others}`);
  return { code: 0, line: `PROSE-ONLY ${prose} file(s)${others}` };
}

const HELP = `prose-only-diff.mjs --repo <repo> --base <ref> --head <ref>
Classifies the committed diff from <base> to <head>. Each changed JavaScript file (.js, .cjs, .mjs) is
compared with its prose comments stripped from both sides; every other path is counted and left to the
path rule. Prints ONE line: PROSE-ONLY <n> file(s), with "; <m> other path(s) left to the path rule" when
there are any, exits 0 when every JavaScript remainder is byte-identical; CODE <path>, the first
JavaScript file whose remainder differs, exits 1; UNKNOWN <reason> exits 2. UNKNOWN outranks CODE, and
CODE outranks PROSE-ONLY. Fails closed: a comment naming a tool directive (eslint, istanbul, c8, @ts-,
prettier and others) or carrying a JSDoc tag is code, and so is an added, deleted or re-moded file; a
string, template literal or regular expression it cannot delimit with certainty, JSX, a binary, and a
diff with no JavaScript file are UNKNOWN. Read-only: it reads git objects and writes nothing.`;

export function proseOnlyDiffCli(args) {
  if (args.length === 1 && args[0] === '--help') return { code: 0, line: HELP };
  let flags;
  try { flags = parseFlags(args, ['repo', 'base', 'head'], ['repo', 'base', 'head']); }
  catch { return { code: 2, line: 'UNKNOWN usage: unknown, missing or duplicate flag; use --help' }; }
  return proseOnlyDiff(flags);
}

if (isMain(import.meta.url)) {
  // Exit 1 reads as CODE, so a crash never ends with it: UNKNOWN, exit 2.
  process.on('uncaughtException', e => { fs.writeSync(1, oneLine(`UNKNOWN internal error: ${e?.message ?? e}`) + '\n'); process.exit(2); });
  const output = proseOnlyDiffCli(process.argv.slice(2));
  process.stdout.write((output.line === HELP ? HELP : oneLine(output.line)) + '\n');
  process.exitCode = output.code;
}
