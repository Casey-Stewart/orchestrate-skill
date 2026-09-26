'use strict';
// prose-only-diff.mjs lets a polish diff that only rewords comments skip the scoped re-review, so
// a false PROSE-ONLY waves code through unreviewed. The corpus is written as prose first: each
// rejection rule is a pair of edits, the case it must catch and a twin that differs from it only
// in lacking that rule's trigger and must read PROSE-ONLY. The twin is the proof that this rule,
// and no other, is what the case turns on. Every pair runs through the CLI exactly as protocol.md
// publishes it, on real commits, and through the pure core with LF and CRLF line ends alike.
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');
const { makeRepo } = require('./support/git-fixture.cjs');
const ROOT = path.resolve(__dirname, '..');
const TOOL = path.join(ROOT, 'orchestrate', 'tools', 'prose-only-diff.mjs');
const api = import(pathToFileURL(TOOL).href);
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const NUL = String.fromCharCode(0);
// Built, never typed: a raw line separator or no-break space in this file is refused by the
// invisible-character sweep, and an escape can be decoded into one on the way in.
const LS = String.fromCharCode(0x2028), NBSP = String.fromCharCode(0xa0);

// ---- The corpus, rule by rule: [rule, verdict, [before, after], twin [before, after]] ----------
const RULES = [
  ['a // inside a string is string text', 'CODE',
    ["export const HOME = 'https://example.com/docs';\n", "export const HOME = 'https://example.com/help';\n"],
    ["export const HOME = ''; // https://example.com/docs\n", "export const HOME = ''; // https://example.com/help\n"]],
  ['a /* inside a template literal is template text', 'CODE',
    ['export const banner = `/* build ${version} */`;\n', 'export const banner = `/* release ${version} */`;\n'],
    ['export const banner = `${version}`; /* build */\n', 'export const banner = `${version}`; /* release */\n']],
  ['a // inside a regular expression is pattern text', 'CODE',
    ['export const isUrl = s => /^https?:\\/\\//.test(s) && s.length > 8;\n', 'export const isUrl = s => /^https?:\\/\\//.test(s) && s.length > 9;\n'],
    ['export const isUrl = s => /^https?:\\/\\//.test(s); // longer than 8\n', 'export const isUrl = s => /^https?:\\/\\//.test(s); // longer than 9\n']],
  ['a regular expression after a control statement opens there', 'CODE',
    ['if (ready) /[//]a/.test(input);\n', 'if (ready) /[//]b/.test(input);\n'],
    ['if (ready) /[/]/.test(input); // a\n', 'if (ready) /[/]/.test(input); // b\n']],
  ['a regular expression after for await ( opens there', 'CODE',
    ['for await (const line of lines) /[//]a/.test(line);\n', 'for await (const line of lines) /[//]b/.test(line);\n'],
    ['for await (const line of lines) /[/]/.test(line); // a\n', 'for await (const line of lines) /[/]/.test(line); // b\n']],
  ['a comment naming a tool directive is code', 'CODE',
    ['// eslint-disable-next-line no-console -- the CLI prints its result\nconsole.log(result);\n',
      '// eslint-disable-next-line no-console -- the CLI prints the result\nconsole.log(result);\n'],
    ['// the CLI prints its result\nconsole.log(result);\n', '// the CLI prints the result\nconsole.log(result);\n']],
  ['a comment carrying a JSDoc tag is code', 'CODE',
    ['/**\n * Adds two numbers.\n * @param {number} a the first addend\n */\nexport function add(a, b) { return a + b; }\n',
      '/**\n * Adds two numbers.\n * @param {number} a the left addend\n */\nexport function add(a, b) { return a + b; }\n'],
    ['/**\n * Adds two numbers.\n * a is the first addend\n */\nexport function add(a, b) { return a + b; }\n',
      '/**\n * Adds two numbers.\n * a is the left addend\n */\nexport function add(a, b) { return a + b; }\n']],
  ['a comment opening with a marker is code', 'CODE',
    ['export default run;\n//# sourceMappingURL=run.js.map\n', 'export default run;\n//# sourceMappingURL=run.mjs.map\n'],
    ['export default run;\n// map: run.js.map\n', 'export default run;\n// map: run.mjs.map\n']],
  ['a prose line added under a line-counting directive moves what it covers', 'CODE',
    ['// eslint-disable-next-line no-eval\neval(code);\n', "// eslint-disable-next-line no-eval\n// Runs the user's snippet.\neval(code);\n"],
    ['eval(code);\n', "// Runs the user's snippet.\neval(code);\n"]],
  ['a prose line added under a JSDoc-tagged comment moves what it annotates', 'CODE',
    ['/** @returns {number} */\nconst f = () => 1;\n', '/** @returns {number} */\n// One, always.\nconst f = () => 1;\n'],
    ['/** Returns one. */\nconst f = () => 1;\n', '/** Returns one. */\n// One, always.\nconst f = () => 1;\n']],
  ['whitespace in code is code', 'CODE',
    ['export const limit = 10;\n', 'export const limit =  10;\n'],
    ['export const limit = 10; // at most ten\n', 'export const limit = 10; // at most  ten\n']],
  ['one character of code is code', 'CODE',
    ['export const add = (a, b) => a + b;\n', 'export const add = (a, b) => a - b;\n'],
    ['// a + b\nexport const add = (a, b) => a + b;\n', '// a - b\nexport const add = (a, b) => a + b;\n']],
  ['a block comment holding a line break is a line break', 'CODE',
    ['export function f(x) {\n  return /* the\n  value */ x;\n}\n', 'export function f(x) {\n  return /* the value */ x;\n}\n'],
    ['export function f(x) {\n  return /* the value */ x;\n}\n', 'export function f(x) {\n  return /* its value */ x;\n}\n']],
  ['a / after a prefix ++ opens a regular expression', 'CODE',
    ['x = ++/[//]a/.lastIndex;\n', 'x = ++/[//]b/.lastIndex;\n'],
    ['x = count++ /[//]a/.lastIndex;\n', 'x = count++ /[//]b/.lastIndex;\n']],
  ['a line break before ++ makes it a prefix', 'CODE',
    ['x = count\n++/[//]a/.lastIndex;\n', 'x = count\n++/[//]b/.lastIndex;\n'],
    ['x = count ++/[//]a/.lastIndex;\n', 'x = count ++/[//]b/.lastIndex;\n']],
  ['a block comment between two words keeps them apart', 'CODE',
    ['const t = typeof/* the */value;\n', 'const t = typeofvalue;\n'],
    ['const t = typeof/* the */value;\n', 'const t = typeof/* its */value;\n']],
  ['a word after # is a private name, never a keyword', 'CODE',
    ["half() { return this.#default / pick('/') + pick('//x'); }\n", "half() { return this.#default / pick('/') + pick('//y'); }\n"],
    ["half() { return this.#default / pick('/') + pick(''); } // x\n", "half() { return this.#default / pick('/') + pick(''); } // y\n"]],
  ['a keyword after a spread opens an expression', 'CODE',
    ['x = [...typeof /[//]a/].length;\n', 'x = [...typeof /[//]a/].length + 1;\n'],
    ['x = [...typeof /[/]/].length; // a\n', 'x = [...typeof /[/]/].length; // b\n']],
  ['an escaped backtick stays inside its template literal', 'CODE',
    ['const t = `it\\`s // one`;\n', 'const t = `it\\`s // two`;\n'],
    ['const t = `its`; // one\n', 'const t = `its`; // two\n']],
  ['an escaped quote stays inside its string', 'CODE',
    ["const s = 'it\\'s // one';\n", "const s = 'it\\'s // two';\n"],
    ["const s = 'it\\'s // no comment'; // a\n", "const s = 'it\\'s // no comment'; // b\n"]],
  ['a ++ after an operand keyword is a prefix', 'CODE',
    ['x = typeof ++/[//]a/.lastIndex;\n', 'x = typeof ++/[//]b/.lastIndex;\n'],
    ['x = typeOf ++/[//]a/.lastIndex;\n', 'x = typeOf ++/[//]b/.lastIndex;\n']],
  ["a ++ after a control statement's ) is a prefix", 'CODE',
    ['if (ok) ++/[//]a/.lastIndex;\n', 'if (ok) ++/[//]b/.lastIndex;\n'],
    ['f(ok) ++/[//]a/.lastIndex;\n', 'f(ok) ++/[//]b/.lastIndex;\n']],
  ['a / after a prefix -- opens a regular expression', 'CODE',
    ['x = --/[//]a/.lastIndex;\n', 'x = --/[//]b/.lastIndex;\n'],
    ['x = count--/[//]a/.lastIndex;\n', 'x = count--/[//]b/.lastIndex;\n']],
  ['a / first in a file opens a regular expression', 'CODE',
    ['/[//]a/.test(s);\n', '/[//]b/.test(s);\n'],
    ['s /[//]a/.test(s);\n', 's /[//]b/.test(s);\n']],
  ['a hashbang is code', 'CODE',
    ['#!/usr/bin/env node\nrun();\n', '#!/usr/bin/env -S node\nrun();\n'],
    ['// usr/bin/env node\nrun();\n', '// usr/bin/env -S node\nrun();\n']],
  ['a / after } with a second / on its line is in doubt', 'UNKNOWN',
    ['if (ready) { start(); }\n/[/]/.test(input); // a\n', 'if (ready) { start(); }\n/[/]/.test(input); // b\n'],
    ['if (ready) { start(); }\n;/[/]/.test(input); // a\n', 'if (ready) { start(); }\n;/[/]/.test(input); // b\n']],
  ['a / after a word that may be a keyword is in doubt', 'UNKNOWN',
    ['for (const part of /[/]/.exec(path)) use(part); // a\n', 'for (const part of /[/]/.exec(path)) use(part); // b\n'],
    ['for (const part of (/[/]/.exec(path))) use(part); // a\n', 'for (const part of (/[/]/.exec(path))) use(part); // b\n']],
  ['a < where an expression starts is JSX', 'UNKNOWN',
    ['const view = <b>https://example.com</b>;\n// a\n', 'const view = <b>https://example.com</b>;\n// b\n'],
    ['const view = a <b;\n// a\n', 'const view = a <b;\n// b\n']],
  ['a < after } is in doubt', 'UNKNOWN',
    ['if (a) {}\n<b>https://example.com</b>;\n', 'if (a) {}\n<b>https://example.org</b>;\n'],
    ['if (a) {}\nx <b>https://example.com</b>;\n', 'if (a) {}\nx <b>https://example.org</b>;\n']],
  ['a < after a keyword-or-name is in doubt', 'UNKNOWN',
    ['for (const x of xs) yield <li>//{x.a}</li>;\n', 'for (const x of xs) yield <li>//{x.b}</li>;\n'],
    ['for (const x of xs) yield x <li>//{x.a}</li>;\n', 'for (const x of xs) yield x <li>//{x.b}</li>;\n']],
  ['<!-- opens an HTML-like comment', 'UNKNOWN',
    ['x = y <!--z;\n// a\n', 'x = y <!--z;\n// b\n'],
    ['x = y < !--z;\n// a\n', 'x = y < !--z;\n// b\n']],
  ['--> at a line start closes an HTML-like comment', 'UNKNOWN',
    ['x = 1;\n  --> a note\n// a\n', 'x = 1;\n  --> a note\n// b\n'],
    ['x = 1;\n  y-->0;\n// a\n', 'x = 1;\n  y-->0;\n// b\n']],
  ['--> after a block comment that broke the line is at a line start', 'UNKNOWN',
    ['x = 1; /* a\n b */ --> note\n// a\n', 'x = 1; /* a\n b */ --> note\n// b\n'],
    ['x = 1; /* a b */ --> note\n// a\n', 'x = 1; /* a b */ --> note\n// b\n']],
  ['a NUL byte is a binary', 'UNKNOWN',
    ['export const a = 1; // a' + NUL + '\n', 'export const a = 1; // b' + NUL + '\n'],
    ['export const a = 1; // a\n', 'export const a = 1; // b\n']],
  ['a template literal left open is a parse that cannot finish', 'UNKNOWN',
    ['export const t = `open ${x}; // a\n', 'export const t = `open ${x}; // b\n'],
    ['export const t = `open ${x}`; // a\n', 'export const t = `open ${x}`; // b\n']],
  // Written without semicolons: the statement ends at the line break, so the next line's `/`
  // opens a regular expression, never divides.
  ['a regular expression on the line after break opens there', 'CODE',
    ['for (const s of xs) {\n  if (s.done) break\n  /^https?:\\/\\//.test(s.url) && out.push(s)\n}\n', 'for (const s of xs) {\n  if (s.done) break\n  /^https?:\\/\\//.test(s.url) && out.unshift(s)\n}\n'],
    ['x = breaks\n/[//]a/.test(s);\n', 'x = breaks\n/[//]b/.test(s);\n']],
  ['a regular expression on the line after continue opens there', 'CODE',
    ['for (const s of xs) {\n  if (!s) continue\n  /^https?:\\/\\//.test(s) && out.push(s)\n}\n', 'for (const s of xs) {\n  if (!s) continue\n  /^https?:\\/\\//.test(s)\n}\n'],
    ['x = continued\n/[//]a/.test(s);\n', 'x = continued\n/[//]b/.test(s);\n']],
  ['a regular expression on the line after debugger opens there', 'CODE',
    ['debugger\n/[//]a/.test(s);\n', 'debugger\n/[//]b/.test(s);\n'],
    ['debug()\n/[//]a/.test(s);\n', 'debug()\n/[//]b/.test(s);\n']],
  ['a comment shaped like a tool directive is code, whatever tool it names', 'CODE',
    ['// Stryker disable next-line all\nreturn a + b;\n', '// Stryker disable all\nreturn a + b;\n'],
    ['// Tests ignore next-gen flags.\nreturn a + b;\n', '// Tests ignore all-caps flags.\nreturn a + b;\n']],
  ['a blank line inside a template literal is template text', 'CODE',
    ['const HELP = `usage\n\nflags`;\n', 'const HELP = `usage\nflags`;\n'],
    ['/* usage\n\nflags */\nconst HELP = 1;\n', '/* usage\nflags */\nconst HELP = 1;\n']],
  ['trailing whitespace after code that follows an inline block comment is code', 'CODE',
    ['f(/* a */ 1);  \n', 'f(/* a */ 1); \n'],
    ['f(1); /* a */  \n', 'f(1); /* a */ \n']],
  ['a line separator ends a line comment', 'CODE',
    ['// note' + LS + 'process.exit(1);\n', '// note' + LS + 'process.exit(0);\n'],
    ['// note process.exit(1);\n', '// note process.exit(0);\n']],
  ['a non-ASCII space keeps two words apart', 'CODE',
    ['x = typeof' + NBSP + '/[//]a/.test(s);\n', 'x = typeof' + NBSP + '/[//]b/.test(s);\n'],
    ['x = typeof_/[//]a/.test(s);\n', 'x = typeof_/[//]b/.test(s);\n']],
  ["a regular expression after a control statement's ) opens there whatever the ( held", 'CODE',
    ['if (f(x)) /[//]a/.test(s);\n', 'if (f(x)) /[//]b/.test(s);\n'],
    ['g(f(x)) /[//]a/.test(s);\n', 'g(f(x)) /[//]b/.test(s);\n']],
  ['a / after the label of a break or continue is in doubt', 'UNKNOWN',
    ['if (!s) continue outer\n/[/]/.test(s); // a\n', 'if (!s) continue outer\n/[/]/.test(s); // b\n'],
    ['if (!s) continue\nouter\n/[/]/.test(s); // a\n', 'if (!s) continue\nouter\n/[/]/.test(s); // b\n']],
  ['a ++ after a word that may be a keyword is in doubt', 'UNKNOWN',
    ['x = yield ++/[/]/.lastIndex; // a\n', 'x = yield ++/[/]/.lastIndex; // b\n'],
    ['x = yielded ++/[/]/.lastIndex; // a\n', 'x = yielded ++/[/]/.lastIndex; // b\n']],
  // Under the v flag a `[` inside a class opens a nested one, and the flag comes after the end.
  ['a [ inside a regular expression class may nest', 'UNKNOWN',
    ['x = /[[a]/b//c]/v.test(s);\n', 'x = /[[a]/b//d]/v.test(s);\n'],
    ['x = /[[a]--[b]]/v.test(s); // c\n', 'x = /[[a]--[b]]/v.test(s); // d\n']],
];
// Pinned by hand, so a rule dropped from the corpus goes red here rather than shrinking every loop.
const RULE_COUNTS = { CODE: 34, UNKNOWN: 13 };
// Edits a polish makes, and code the reader must not mistake for doubt: each must read PROSE-ONLY.
const PROSE = [
  ['a line comment reworded', '// Adds two numbers.\nexport const add = (a, b) => a + b;\n', '// Adds two numbers together.\nexport const add = (a, b) => a + b;\n'],
  ['a block comment rewrapped onto more lines', '/* Adds two numbers. */\nexport const add = (a, b) => a + b;\n',
    '/*\n * Adds two numbers,\n * the left one first.\n */\nexport const add = (a, b) => a + b;\n'],
  ['a comment line dropped', '// Adds.\n// Two numbers.\nexport const add = (a, b) => a + b;\n', '// Adds two numbers.\nexport const add = (a, b) => a + b;\n'],
  ['a trailing comment added to a code line', 'export const limit = 10;\n', 'export const limit = 10; // at most ten\n'],
  ['an inline block comment reworded', 'retry(/* times */ 3);\n', 'retry(/* attempts */ 3);\n'],
  ['a comment inside a template substitution', 'const t = `a ${ `b ${c /* x */}` } d`;\n', 'const t = `a ${ `b ${c /* the x */}` } d`;\n'],
  ['a / after a postfix ++ divides', 'count++ / 2; // a\n', 'count++ / 2; // b\n'],
  ['a keyword after a dot is a property name', 'export const half = options.return / 2; // a\n', 'export const half = options.return / 2; // b\n'],
  ['a / after } with no second / on its line divides', 'x = {} / 2;\n// a\n', 'x = {} / 2;\n// b\n'],
  ['a regular expression holding a slash, quotes and a backtick in a class', 'const q = /[/\'"`]/; // a\n', 'const q = /[/\'"`]/; // b\n'],
  ['a / after ] divides', 'const half = sizes[0] / 2; // a\n', 'const half = sizes[0] / 2; // b\n'],
  ['a / after a number ending in a dot divides', 'const r = 1. / 3; // a\n', 'const r = 1. / 3; // b\n'],
  ['a / after a string divides', "const n = '10' / 2; // a\n", "const n = '10' / 2; // b\n"],
  ['a hashbang holding a quote', "#!/usr/bin/env -S node --title=it's\n// a\nrun();\n", "#!/usr/bin/env -S node --title=it's\n// b\nrun();\n"],
  ['a line continuation inside a string', "const s = 'one \\\ntwo'; // a\n", "const s = 'one \\\ntwo'; // b\n"],
  ['a shift is not JSX', 'const v = (a << 2) | (b <= c); // a\n', 'const v = (a << 2) | (b <= c); // b\n'],
  ['a comment beside a hashbang', '#!/usr/bin/env node\n// a\nrun();\n', '#!/usr/bin/env node\n// b\nrun();\n'],
  ['JSDoc-tagged comments untouched, prose beside them reworded', '/** @returns {number} */\n// a\nconst f = () => 1;\n', '/** @returns {number} */\n// b\nconst f = () => 1;\n'],
];
// Every line end the reader knows: LF, CRLF, and the Unicode line separator.
const crlf = text => text.replace(/\n/g, '\r\n');
const ls = text => text.replace(/\n/g, LS);
const LINE_ENDS = [text => text, crlf, ls];

test('the corpus is the one written above: its size and its rules, pinned', () => {
  const names = RULES.map(r => r[0]);
  assert.equal(new Set(names).size, RULES.length, 'every rule once');
  assert.equal(RULES.length, RULE_COUNTS.CODE + RULE_COUNTS.UNKNOWN);
  for (const [verdict, count] of Object.entries(RULE_COUNTS)) assert.equal(RULES.filter(r => r[1] === verdict).length, count, verdict + ' rules');
  assert.equal(PROSE.length, 18, 'the prose-only corpus');
  // A twin that equals its case would prove nothing: each pair differs, and so does each twin.
  for (const [rule, , [a, b], [c, d]] of RULES) assert.ok(a !== b && c !== d && (a !== c || b !== d), rule);
});

test('every rule catches its case, and its twin, lacking only the trigger, reads PROSE-ONLY, under every line end', async () => {
  const { compareSources } = await api;
  assert.equal(LINE_ENDS.length, 3);
  for (const [rule, verdict, [before, after], [twinBefore, twinAfter]] of RULES) {
    for (const eol of LINE_ENDS) {
      assert.equal(compareSources(eol(before), eol(after)).verdict, verdict, rule);
      assert.equal(compareSources(eol(twinBefore), eol(twinAfter)).verdict, 'PROSE-ONLY', rule + ' (twin)');
    }
  }
  for (const [name, before, after] of PROSE) {
    for (const eol of LINE_ENDS) assert.deepEqual(compareSources(eol(before), eol(after)), { verdict: 'PROSE-ONLY' }, name);
  }
});

// Every way the reader refuses, read from the tool's own source, so a new refusal needs a fixture.
// A string or a regular expression that closes on a later line is refused at its line break:
// one that never closes would be refused at the end of the file whatever the line break did.
const REFUSALS = [
  ['an unterminated block comment', 'x = 1; /* open\n', 'x = 1; /* shut */\n'],
  ['an unterminated string', "const s = 'open;\nshut';\n", "const s = 'open shut';\n"],
  ['a / that may open a regular expression or divide', 'if (a) { b(); }\n/[/]/.test(c);\n', 'if (a) { b(); }\n;/[/]/.test(c);\n'],
  ['an unterminated regular expression', 'const r = /open\nshut/;\n', 'const r = /open shut/;\n'],
  ['a [ inside a regular expression class (a nested class under the v flag?)', 'const r = /[[a]/]/v;\n', 'const r = /[[a]]/v;\n'],
  ['an HTML-like comment <!--', 'x <!-- y\n', 'x < !-- y\n'],
  ['a < where an expression may start (JSX?)', 'return <div/>;\n', 'return a <div;\n'],
  ['an HTML-like comment -->', '--> y\n', 'x --> y\n'],
  ['an unmatched }', 'f(); }\n', 'f(); {}\n'],
  ['an unmatched )', 'f());\n', 'f(());\n'],
  ['an unterminated template literal', 'const t = `open;\n', 'const t = `shut`;\n'],
  ['an unclosed (, { or ${', 'f({ a: 1 );\n', 'f({ a: 1 });\n'],
];
test('each refusal of the reader has a fixture, and a twin one edit away that it reads', async () => {
  const { scan } = await api;
  const declared = [...fs.readFileSync(TOOL, 'utf8').matchAll(/\bfail\('([^']+)'\)/g)].map(m => m[1]).sort();
  assert.ok(declared.length >= 12, 'the refusals were really read: ' + declared.join(' | '));
  assert.deepEqual(REFUSALS.map(r => r[0]).sort(), declared, 'every refusal the tool declares has a fixture here, and no other');
  for (const [reason, refused, read] of REFUSALS) {
    assert.deepEqual(scan(refused), { ok: false, reason }, reason);
    assert.equal(scan(read).ok, true, reason + ' (twin)');
  }
});

// The regular-expression reading after a word. The word lists are written here from the grammar,
// never read off the tool, so a misspelt member is a difference, not a case exercised as misspelt.
// `/[//]a/` is a pattern only where an expression starts: after a plain name it divides, and
// `//]a/` is a comment.
const GRAMMAR = {
  operand: ['break', 'case', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'extends', 'in', 'instanceof', 'new', 'return', 'throw', 'typeof', 'void'],
  contextual: ['await', 'of', 'yield'],
  control: ['for', 'if', 'while', 'with'],
};
test('after each keyword a / opens a regular expression, after a keyword-or-name it is in doubt, after a name it divides', async () => {
  const { compareSources, OPERAND_KEYWORDS, CONTEXTUAL, CONTROL } = await api;
  assert.deepEqual([[...OPERAND_KEYWORDS].sort(), [...CONTEXTUAL].sort(), [...CONTROL].sort()], [GRAMMAR.operand, GRAMMAR.contextual, GRAMMAR.control]);
  assert.deepEqual([GRAMMAR.operand.length, GRAMMAR.contextual.length, GRAMMAR.control.length], [16, 3, 4], 'the lists written here, pinned by size');
  const pair = lead => [lead + ' /[//]a/.test(s);\n', lead + ' /[//]b/.test(s);\n'];
  for (const word of GRAMMAR.operand) assert.equal(compareSources(...pair('x = ' + word)).verdict, 'CODE', word);
  for (const word of GRAMMAR.contextual) assert.equal(compareSources(...pair('x = ' + word)).verdict, 'UNKNOWN', word);
  for (const word of GRAMMAR.control) assert.equal(compareSources(...pair(word + ' (ok)')).verdict, 'CODE', word);
  // The other side of each boundary: a plain name, a property named like a keyword, a call's `)`.
  for (const lead of ['x = value', 'x = options.return', 'x = run(ok)', 'x = run(ok)?.typeof', 'x = this.#return', 'x = this?.#in']) {
    assert.equal(compareSources(...pair(lead)).verdict, 'PROSE-ONLY', lead);
  }
});

// ---- The comment families -------------------------------------------------------------------
// Comments as they are written in real code, not read off the patterns: each directive the tool
// lists owns one no other directive catches, each family owns one the other three miss, and prose
// that only looks like a directive or a tag is left prose.
const DIRECTIVE_COMMENTS = [
  '// eslint-disable-next-line no-console -- the CLI prints its result', '/* eslint quotes: ["error", "double"] */', '/* eslint-env node */',
  '/* istanbul ignore next: a platform guard */', '/* istanbul ignore if */', '/* istanbul ignore else */', '/* istanbul ignore file */',
  '/* c8 ignore next 3 */', '/* c8 ignore start */', '/* c8 ignore stop */', '// @ts-expect-error: the legacy caller passes a string', '// @ts-nocheck',
  '// prettier-ignore', '/* v8 ignore next */', '/* jshint esversion: 11 */', '/*jslint node:true, es6 */',
  '// biome-ignore lint/suspicious/noExplicitAny: legacy data', '// deno-lint-ignore no-explicit-any', '// oxlint-disable-next-line no-unused-vars',
  '/* webpackChunkName: "editor" */', '/* turbopackIgnore: true */', '/* node:coverage ignore next */', '/* node:coverage disable */',
  '// tslint:disable-next-line:no-any', '// $FlowFixMe[incompatible-call] legacy props', '// NOSONAR: the pattern is vetted',
  '// Stryker disable next-line all', '// Stryker disable all', '// Stryker restore all', '// Stryker restore EqualityOperator',
  '// nosemgrep: javascript.lang.security.audit.path-traversal', '// nosemgrep', '// lgtm[js/xss]', '// lgtm', '// codeql[js/unused-local-variable]',
  '// cSpell:words xyzzy plugh', '// spell-checker: disable', '// noinspection JSUnusedGlobalSymbols', '// keep-sorted start', '// clang-format off', '// spotless:off',
  '// falls through to the default branch', '// fallthrough',
];
// Kept by their shape alone: the tool each names is on no list.
const SHAPE_COMMENTS = ['/* stylelint-disable-next-line selector-max-id */', '/* stylelint-enable */', '// jscs:disable requireCamelCaseOrUpperCaseIdentifiers',
  '// sort-imports-ignore', '// deepscan-disable-line', '// svelte-ignore a11y-missing-attribute', '/* vite-ignore */',
  '/* bun:coverage ignore next */', '/* bun:coverage ignore start */', '/* bun:coverage ignore stop */'];
const MARKER_COMMENTS = ['//# sourceMappingURL=run.js.map', '/*! Licensed MIT; see LICENSE */', '/// <reference types="node" />', '/* global fetch, Response */',
  '/* exported main */', '/* globals describe, it */', '//@ sourceURL=eval-1.js'];
const TAG_COMMENTS = ['/** @returns {number} the sum */', '/** Parses a flag list; see {@link parseFlags}. */', '/**\n * Old entry point.\n * @deprecated since 2.0\n */'];
// Kept by several families at once, each pinned to exactly the families that keep it.
const SHARED_COMMENTS = [
  ['// @ts-expect-error: the legacy caller passes a string', ['directive', 'shape', 'marker', 'tag']],
  ['// @ts-nocheck', ['directive', 'shape', 'marker', 'tag']],
  ["// @glint-expect-error: the component's args are loose", ['shape', 'marker', 'tag']],
  ['// @vite-ignore', ['shape', 'marker', 'tag']],
  ['// Stryker disable next-line all', ['directive', 'shape']],
  ['/* istanbul ignore else */', ['directive', 'shape']],
];
const PROSE_COMMENTS = ['// Adds two numbers.', '// Mail the maintainers at team@example.com.', '// polish discarded: @<sha> marks the reviewed tree.',
  '/* Falls back to the default when unset. */', '/** Adds two numbers. */', '// the abc8 codec', '// the v8-compat shim', '// istanbul-lib-coverage reads this',
  '// A path like a/b/c.', '// a c80 checksum', '// Blank lines are ignored.', '// A self-disabled switch.', '// Callers ignore next-gen flags.',
  '// Tests ignore all-caps names.', '// keep sorted by name', '// no inspection needed here', '// semgrep rules live in .semgrep/',
  '// the cspell dictionary is cspell.json', '// codeql-cli output goes to out/', '// spotless output', '// clang formats this file'];
// The shapes' verbs and scopes, written here from the directives above, never read off the tool.
const SHAPE_GRAMMAR = {
  joined: ['disable', 'enable', 'ignore', 'expect-error', 'nocheck'],
  spaced: ['ignore', 'disable', 'restore'],
  scopes: ['next-line', 'next', 'start', 'stop', 'if', 'else', 'file', 'all'],
};
test('each directive, and each comment family, owns a real comment; prose that only looks like one is prose', async () => {
  const { DIRECTIVES, SHAPES, keptBy } = await api;
  assert.deepEqual([DIRECTIVES.length, SHAPES.length], [27, 2], 'the directive and shape lists are pinned by size');
  assert.deepEqual([DIRECTIVE_COMMENTS.length, SHAPE_COMMENTS.length, MARKER_COMMENTS.length, TAG_COMMENTS.length, SHARED_COMMENTS.length, PROSE_COMMENTS.length],
    [43, 10, 7, 3, 6, 21]);
  // The five the feature names are in the list, by name.
  for (const named of ['eslint', 'istanbul', 'c8', '@ts-', 'prettier']) assert.ok(DIRECTIVES.some(([name]) => name === named), named);
  for (const [name] of DIRECTIVES) {
    const owned = DIRECTIVE_COMMENTS.filter(c => DIRECTIVES.filter(([, p]) => p.test(c)).map(([n]) => n).join() === name);
    assert.ok(owned.length >= 1, name + ' owns no comment of the corpus');
  }
  for (const comment of DIRECTIVE_COMMENTS) assert.ok(keptBy(comment).includes('directive'), comment);
  for (const [name] of SHAPES) {
    const owned = SHAPE_COMMENTS.filter(c => SHAPES.filter(([, p]) => p.test(c)).map(([n]) => n).join() === name);
    assert.ok(owned.length >= 1, name + ' owns no comment of the corpus');
  }
  // Family by family: a comment that family alone keeps.
  const alone = (list, family) => list.filter(c => keptBy(c).join() === family);
  assert.ok(alone(DIRECTIVE_COMMENTS, 'directive').length >= 1 && alone(SHAPE_COMMENTS, 'shape').length === SHAPE_COMMENTS.length
    && alone(MARKER_COMMENTS, 'marker').length === MARKER_COMMENTS.length && alone(TAG_COMMENTS, 'tag').length === TAG_COMMENTS.length, 'each family owns its comments');
  for (const [comment, families] of SHARED_COMMENTS) assert.deepEqual(keptBy(comment), families, comment);
  for (const comment of PROSE_COMMENTS) assert.deepEqual(keptBy(comment), [], comment);
});

test('each verb and scope a shape accepts is the one written here, and ends a match on a real comment', async () => {
  const { SHAPES, JOINED_VERBS, SPACED_VERBS, SCOPES } = await api;
  assert.deepEqual([JOINED_VERBS, SPACED_VERBS, SCOPES], [SHAPE_GRAMMAR.joined, SHAPE_GRAMMAR.spaced, SHAPE_GRAMMAR.scopes]);
  assert.deepEqual([SHAPE_GRAMMAR.joined.length, SHAPE_GRAMMAR.spaced.length, SHAPE_GRAMMAR.scopes.length], [5, 3, 8], 'the lists written here, pinned by size');
  const pool = [...DIRECTIVE_COMMENTS, ...SHAPE_COMMENTS, ...MARKER_COMMENTS, ...TAG_COMMENTS, ...SHARED_COMMENTS.map(s => s[0])];
  const [[, joined], [, spaced]] = SHAPES;
  // What each shape matched, on every pool comment it matches: the joined shape ends in its verb,
  // the spaced one in its verb and scope.
  const joinedEnds = pool.map(c => joined.exec(c)).filter(Boolean).map(m => m[0].toLowerCase());
  const spacedEnds = pool.map(c => spaced.exec(c)).filter(Boolean).map(m => /\s(\S+)\s+(\S+)$/.exec(m[0].toLowerCase()).slice(1));
  assert.ok(joinedEnds.length >= 5 && spacedEnds.length >= 8, 'the shapes really match the pool');
  for (const verb of SHAPE_GRAMMAR.joined) assert.ok(joinedEnds.some(end => end.endsWith(verb)), 'no pool comment matches the joined shape through ' + verb);
  for (const verb of SHAPE_GRAMMAR.spaced) assert.ok(spacedEnds.some(([v]) => v === verb), 'no pool comment matches the spaced shape through ' + verb);
  for (const scope of SHAPE_GRAMMAR.scopes) assert.ok(spacedEnds.some(([, s]) => s === scope), 'no pool comment matches the spaced shape through ' + scope);
  // The other side: a word past the list is not a verb or scope, however it is placed.
  assert.equal(joined.test('// cspell:words xyzzy'), false);
  assert.equal(spaced.test('// Stryker disable EqualityOperator'), false);
});

// ---- The CLI as protocol.md publishes it, on real commits ------------------------------------
function publishedCommand() {
  const spans = [...read('orchestrate/references/protocol.md').matchAll(/`(node "<skill-dir>\/tools\/prose-only-diff\.mjs"[^`]*)`/g)].map(m => m[1]);
  assert.equal(spans.length, 1, 'protocol.md publishes the classifier command once');
  return spans[0];
}
function cli(repo, base, head) {
  const values = { '<skill-dir>': path.join(ROOT, 'orchestrate').split(path.sep).join('/'), '<batch worktree>': repo.cwd, '<pre-polish sha>': base, '<polish tip>': head };
  const command = Object.entries(values).reduce((text, [token, value]) => text.split(token).join(value), publishedCommand());
  assert.doesNotMatch(command, /<[a-z -]+>/, 'every placeholder is filled: ' + command);
  const argv = [...command.matchAll(/"([^"]*)"|(\S+)/g)].map(m => m[1] ?? m[2]);
  assert.equal(argv[0], 'node');
  const env = { ...repo.env }; delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, argv.slice(1), { cwd: repo.cwd, env, encoding: 'utf8', windowsHide: true, timeout: 60000 });
  assert.ifError(r.error); assert.equal(r.signal, null);
  assert.equal(r.stderr, '', 'nothing on stderr');
  const lines = r.stdout.split('\n');
  assert.deepEqual(lines.slice(1), [''], 'ONE line: ' + JSON.stringify(r.stdout));
  return { status: r.status, line: lines[0] };
}
const EXIT = { 'PROSE-ONLY': 0, CODE: 1, UNKNOWN: 2 };

test('every corpus pair reads the same through the published CLI on commits, each pair its own diff', t => {
  const repo = makeRepo(t);
  // One file per pair, all at "before" in one commit; then each pair's "after" in a commit of its
  // own, so the diff between two neighbouring commits is that pair and nothing else.
  const pairs = [...RULES.flatMap(([rule, verdict, edit, twin], i) => [[rule, verdict, edit, `r${i}-case.mjs`], [rule + ' (twin)', 'PROSE-ONLY', twin, `r${i}-twin.mjs`]]),
    ...PROSE.map(([name, before, after], i) => [name, 'PROSE-ONLY', [before, after], `p${i}.mjs`])];
  for (const [, , [before], file] of pairs) repo.write(file, before);
  let previous = repo.commit('before');
  for (const [name, verdict, [, after], file] of pairs) {
    repo.write(file, after);
    const next = repo.commit(name);
    const r = cli(repo, previous, next);
    const expected = verdict === 'PROSE-ONLY' ? 'PROSE-ONLY 1 file(s)' : verdict === 'CODE' ? 'CODE ' + file : 'UNKNOWN ' + file + ': ';
    assert.ok(verdict === 'UNKNOWN' ? r.line.startsWith(expected) : r.line === expected, name + ': ' + r.line);
    assert.equal(r.status, EXIT[verdict], name);
    previous = next;
  }
});

test('the CLI is read-only: nothing in the repository changes across runs', t => {
  const repo = makeRepo(t);
  repo.write('a.mjs', '// a\nexport const a = 1;\n'); const c0 = repo.commit('c0');
  repo.write('a.mjs', '// b\nexport const a = 1;\n'); const c1 = repo.commit('c1');
  const before = repo.snapshot();
  assert.deepEqual(cli(repo, c0, c1), { status: 0, line: 'PROSE-ONLY 1 file(s)' });
  assert.deepEqual(cli(repo, c1, c0), { status: 0, line: 'PROSE-ONLY 1 file(s)' });
  assert.deepEqual(repo.snapshot(), before);
});

// The smoke the checkpoint runs, as I-01 builds it: c0, a comment-only change of both forms, then
// a one-character code change in the same file. The second step is the live control.
test('a comment-only commit of both forms reads PROSE-ONLY and a one-character code change after it reads CODE', t => {
  const repo = makeRepo(t);
  repo.write('lib/sum.mjs', '// Adds two numbers.\n/* The left one first. */\nexport const sum = (a, b) => a + b;\n'); const c0 = repo.commit('c0');
  repo.write('lib/sum.mjs', '// Adds two numbers together.\n/*\n * The left one\n * first.\n */\nexport const sum = (a, b) => a + b;\n'); const c1 = repo.commit('c1');
  repo.write('lib/sum.mjs', '// Adds two numbers together.\n/*\n * The left one\n * first.\n */\nexport const sum = (a, b) => a - b;\n'); const c2 = repo.commit('c2');
  assert.deepEqual(cli(repo, c0, c1), { status: 0, line: 'PROSE-ONLY 1 file(s)' });
  assert.deepEqual(cli(repo, c1, c2), { status: 1, line: 'CODE lib/sum.mjs' });
  assert.deepEqual(cli(repo, c0, c2), { status: 1, line: 'CODE lib/sum.mjs' });
});

// Git-level rules: what the diff is, rather than what a file says.
test('an added, deleted, renamed, re-moded, linked or submodule JavaScript path, or a BOM added, is CODE; its twin reads PROSE-ONLY', t => {
  const repo = makeRepo(t);
  const body = '// a\nexport const a = 1;\n', edited = '// b\nexport const a = 1;\n';
  repo.write('keep.mjs', body); repo.write('gone.cjs', body); repo.write('old.js', body); repo.write('mode.mjs', body); repo.write('link.mjs', body);
  const blob = repo.git('hash-object', '-w', 'keep.mjs');
  // Index-only entries (a submodule, then a link) have no file in the checkout, so every commit
  // below stages exactly its own paths: `git add --all` would stage their removal.
  repo.git('add', '--all');
  repo.git('update-index', '--add', '--cacheinfo', '160000,' + repo.base + ',sub.mjs');
  repo.git('commit', '-m', 'c0');
  const c0 = repo.git('rev-parse', 'HEAD');
  const step = (name, change, expected) => {
    const from = repo.git('rev-parse', 'HEAD'); change();
    repo.git('commit', '--allow-empty', '-m', name);
    assert.deepEqual(cli(repo, from, repo.git('rev-parse', 'HEAD')), expected, name);
  };
  step('twin: an edit in place', () => { repo.write('keep.mjs', edited); repo.git('add', 'keep.mjs'); }, { status: 0, line: 'PROSE-ONLY 1 file(s)' });
  step('added', () => { repo.write('new.mjs', body); repo.git('add', 'new.mjs'); }, { status: 1, line: 'CODE new.mjs' });
  step('deleted', () => { repo.git('rm', '--quiet', 'gone.cjs'); }, { status: 1, line: 'CODE gone.cjs' });
  step('renamed', () => { repo.git('mv', 'old.js', 'renamed.js'); }, { status: 1, line: 'CODE old.js' });
  step('made executable, its text reworded too', () => { repo.write('mode.mjs', edited); repo.git('add', 'mode.mjs'); repo.git('update-index', '--chmod=+x', 'mode.mjs'); },
    { status: 1, line: 'CODE mode.mjs' });
  step('a byte-order mark added', () => { repo.write('keep.mjs', Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(edited)])); repo.git('add', 'keep.mjs'); },
    { status: 1, line: 'CODE keep.mjs' });
  step('turned into a link', () => { repo.git('update-index', '--cacheinfo', '120000,' + blob + ',link.mjs'); }, { status: 1, line: 'CODE link.mjs' });
  step('a submodule moved', () => { repo.git('update-index', '--cacheinfo', '160000,' + c0 + ',sub.mjs'); }, { status: 1, line: 'CODE sub.mjs' });
});

test('precedence: UNKNOWN over CODE over PROSE-ONLY, the first CODE in path order, other paths counted', t => {
  const repo = makeRepo(t);
  const files = { 'a.mjs': '// a\nx = 1;\n', 'b.mjs': 'x = 1;\n', 'c.mjs': 'x = 1;\n', 'd.mjs': 'x = `open ${y}`;\n', 'README.md': 'one\n', 'z.py': 'x = 1\n' };
  for (const [file, text] of Object.entries(files)) repo.write(file, text);
  const c0 = repo.commit('c0');
  const at = changes => { for (const [file, text] of Object.entries(changes)) repo.write(file, text); return repo.commit(Object.keys(changes).join(' ')); };
  const prose = at({ 'a.mjs': '// b\nx = 1;\n', 'README.md': 'two\n', 'z.py': 'x = 2\n' });
  assert.deepEqual(cli(repo, c0, prose), { status: 0, line: 'PROSE-ONLY 1 file(s); 2 other path(s) left to the path rule' });
  const code = at({ 'c.mjs': 'x = 2;\n', 'b.mjs': 'x = 2;\n', 'a.mjs': '// c\nx = 1;\n' });
  assert.deepEqual(cli(repo, prose, code), { status: 1, line: 'CODE b.mjs' });
  const doubt = at({ 'd.mjs': 'x = `open ${y};\n', 'b.mjs': 'x = 3;\n' });
  const r = cli(repo, code, doubt);
  assert.equal(r.status, 2);
  assert.equal(r.line, 'UNKNOWN d.mjs: an unterminated template literal (head)');
  const fixed = at({ 'd.mjs': 'x = `shut ${y}`;\n' });
  assert.deepEqual(cli(repo, doubt, fixed), { status: 2, line: 'UNKNOWN d.mjs: an unterminated template literal (base)' });
  // No JavaScript file: other paths alone never make PROSE-ONLY. An empty diff is no evidence either.
  const docs = at({ 'README.md': 'three\n' });
  assert.deepEqual(cli(repo, fixed, docs), { status: 2, line: 'UNKNOWN no JavaScript file changed; 1 other path(s) left to the path rule' });
  assert.deepEqual(cli(repo, docs, docs), { status: 2, line: 'UNKNOWN no JavaScript file changed' });
});

test('text git cannot hand over as UTF-8, a blob git cannot read, and a ref or a diff git refuses are UNKNOWN', async t => {
  const { proseOnlyDiff } = await api;
  const repo = makeRepo(t);
  repo.write('latin.mjs', Buffer.from([...Buffer.from('// caf'), 0xe9, ...Buffer.from('\nx = 1;\n')])); repo.write('lost.mjs', '// a\nx = 1;\n');
  const c0 = repo.commit('c0');
  repo.write('latin.mjs', Buffer.from([...Buffer.from('// caf'), 0xe8, ...Buffer.from('\nx = 1;\n')]));
  const c1 = repo.commit('c1');
  assert.deepEqual(cli(repo, c0, c1), { status: 2, line: 'UNKNOWN latin.mjs: text that is not UTF-8 (base)' });
  repo.write('lost.mjs', '// b\nx = 1;\n');
  const c2 = repo.commit('c2');
  // The blob's loose object removed: the commits and trees still read, the blob does not.
  const oid = repo.git('rev-parse', c2 + ':lost.mjs');
  fs.rmSync(path.join(repo.cwd, '.git', 'objects', oid.slice(0, 2), oid.slice(2)));
  assert.deepEqual(cli(repo, c1, c2), { status: 2, line: 'UNKNOWN lost.mjs: a blob git could not read (head)' });
  assert.deepEqual(cli(repo, 'refs/heads/no-such-branch', c2), { status: 2, line: 'UNKNOWN cannot resolve --base to a commit in ' + repo.cwd });
  assert.deepEqual(cli(repo, c0, 'refs/heads/no-such-branch'), { status: 2, line: 'UNKNOWN cannot resolve --head to a commit in ' + repo.cwd });
  // A setting only the diff reads, injected the way git's own config variables inject it.
  const env = { ...repo.env, GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'diff.renameLimit', GIT_CONFIG_VALUE_0: 'many' };
  assert.deepEqual(proseOnlyDiff({ repo: repo.cwd, base: c0, head: c1, env }), { code: 2, line: 'UNKNOWN git diff did not run' });
  assert.deepEqual(proseOnlyDiff({ repo: repo.cwd, base: c0, head: c1, env: repo.env }), { code: 2, line: 'UNKNOWN latin.mjs: text that is not UTF-8 (base)' }, 'the control: without the setting the diff runs');
});

test('the raw diff reader refuses every record it cannot read, and the verdict reads a refusal as UNKNOWN', async () => {
  const { rawChanges, classifyRaw } = await api;
  const sha = 'a'.repeat(40), other = 'b'.repeat(40), record = status => ':100644 100644 ' + sha + ' ' + other + ' ' + status;
  assert.deepEqual(rawChanges(''), []);
  assert.deepEqual(rawChanges([record('M'), 'b.mjs', record('A'), 'a.mjs', ''].join(NUL)).map(c => [c.path, c.status]), [['a.mjs', 'A'], ['b.mjs', 'M']]);
  for (const [label, text] of [['a status git never prints here', [record('R100'), 'a.mjs', ''].join(NUL)], ['an unmerged status', [record('U'), 'a.mjs', ''].join(NUL)],
    ['a record with no path', [record('M'), '', ''].join(NUL)], ['an odd field count', [record('M'), ''].join(NUL)],
    ['a short object name', [':100644 100644 abc def M', 'a.mjs', ''].join(NUL)], ['no final NUL', [record('M'), 'a.mjs'].join(NUL)]]) {
    assert.throws(() => rawChanges(text), label);
    assert.deepEqual(classifyRaw(ROOT, text), { code: 2, line: 'UNKNOWN git diff output this tool cannot read' }, label);
  }
  // The control: a record it reads reaches the verdict (a path that is not JavaScript needs no blob).
  assert.deepEqual(classifyRaw(ROOT, [record('M'), 'README.md', ''].join(NUL)), { code: 2, line: 'UNKNOWN no JavaScript file changed; 1 other path(s) left to the path rule' });
});

test('one line whatever a path holds, usage refused, --help documents the flags the published command uses', t => {
  const repo = makeRepo(t);
  repo.write('a.mjs', 'x = 1;\n'); const c0 = repo.commit('c0');
  // A path holding a line break, made in the index so any platform can commit it.
  const blob = repo.git('hash-object', '-w', 'a.mjs');
  repo.git('update-index', '--add', '--cacheinfo', '100644,' + blob + ',line\nbreak.mjs');
  repo.git('commit', '-m', 'c1');
  const c1 = repo.git('rev-parse', 'HEAD');
  assert.deepEqual(cli(repo, c0, c1), { status: 1, line: 'CODE line?break.mjs' });
  const run = args => spawnSync(process.execPath, [TOOL, ...args], { cwd: repo.cwd, env: repo.env, encoding: 'utf8', windowsHide: true, timeout: 60000 });
  for (const args of [[], ['--repo', repo.cwd], ['--repo', repo.cwd, '--base', c0, '--head', c1, '--extra', 'x'], ['--repo', repo.cwd, '--base', c0, '--base', c1]]) {
    const r = run(args);
    assert.deepEqual([r.status, r.stdout], [2, 'UNKNOWN usage: unknown, missing or duplicate flag; use --help\n'], args.join(' '));
  }
  const help = run(['--help']);
  assert.equal(help.status, 0);
  const synopsis = help.stdout.split('\n')[0];
  const flags = [...publishedCommand().matchAll(/(--[a-z]+) </g)].map(m => m[1]);
  assert.deepEqual(flags, ['--repo', '--base', '--head']);
  for (const flag of flags) assert.ok(synopsis.includes(flag + ' <'), '--help documents ' + flag);
});
