// Guard the shipped subagent definitions. An omitted or widened `tools:` line silently
// inherits the whole tool catalog, MCP servers included, which is the cost these files
// exist to remove — so every list is asserted literally.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const ROOT = path.resolve(__dirname, '..');
// One normalization behind every read, so a CRLF checkout and an LF checkout hand every
// assertion below the same text. The EOL test writes its own two fixtures through this door
// rather than reading the working tree, whose line endings are not this file's to decide.
const readText = file => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const read = p => readText(path.join(ROOT, p));
const TOOLS = {
  'implementer': 'Read, Write, Edit, Glob, Grep, Bash',
  'reviewer': 'Read, Glob, Grep, Bash',
  'test-hunter': 'Read, Glob, Grep, Bash',
  'qa-runner': 'Read, Write, Edit, Glob, Grep, Bash, mcp__Claude_Browser__*',
};
const READ_ONLY = ['reviewer', 'test-hunter'];
const CAVEAT = 'Bash can still write, so "read-only" stays partly conventional; '
  + 'removing Write/Edit closes the easy path, not every path.';
// Markdown wraps the caveat, so "verbatim" is judged on whitespace-collapsed prose.
const flow = text => text.replace(/\s+/g, ' ');
// Frontmatter fields are single-line by contract; a parser, not a substring search, so
// that prose in the body mentioning a tool name cannot satisfy or break these checks.
// The parse is deliberately stricter than the regex needs to be: every frontmatter line
// must be a well-formed `key: value` mapping that YAML would read the same way. Without
// that, `tools:Read, Glob` (no space) still yields a `tools` capture here while YAML
// sees a bare scalar and Claude Code loads the definition with no tool list at all —
// the test would pass and the agent would inherit everything.
// A double-quoted YAML scalar has a closed escape set; any other pair is a ScannerError on
// the whole document. `description: "Writes to C:\Users\me"` is the trap, because
// quoting is exactly what this guard tells an author to do to get a colon into a value.
// The hex counts are exact in BOTH directions, and the cases below pin them both ways:
// `\x41` is an escape and `\x4` is a ScannerError, so a short-but-hex run is the same trap
// with fewer characters. YAML 1.2 rule 57 is `ns-esc-horizontal-tab ::= "t" | x09`, so a
// literal TAB is an escape in its own right and the class carries \t beside the letter t.
// The count is only syntax, though — eight hex digits can still name a code point that does
// not exist — so the range check below finishes what this regex starts.
const YAML_ESCAPE = /^\\([0abtnvfre "/\\N_LP\t]|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/;

// Every frontmatter line goes through this one predicate, and the FRONTMATTER_CASES table
// below pins its verdicts. A regex guard here used to demand a space after an inner colon
// and to stop scanning at the first quote character, so three YAML errors walked through:
// `description: Runs the steps:`, `description: "unterminated` and `description: a "b: c" d`.
// A YAML error is not a soft failure — the document does not parse, no definition loads,
// and a "read-only" role inherits the whole catalog again, this time by parse failure
// rather than by a missing key. Returns the parsed field, or a string saying what YAML
// would choke on.
function frontmatterField(line) {
  const field = /^([A-Za-z_][A-Za-z0-9_-]*): +(\S.*)$/.exec(line);
  if (!field) return 'is not a single-line `key: value` mapping';
  // A TAB is separation nowhere on this line — YAML stops on one rather than skipping it,
  // whether it sits after the colon, after the value or in front of a comment — so it is
  // never stripped and never stepped over out here. Inside a quoted scalar it is ordinary
  // content, which is why the escape class above carries it and this does not. YAML will
  // take a TAB inside comment TEXT, having stopped scanning at the `#`; that case cannot be
  // reached here, because an unquoted `#` stays scalar content for this parse, and the
  // resulting rejection of `description: a #<TAB>x` is a deliberate simplification.
  // A CR never reaches this line at all: CRLF is normalized away on read, and `.` in the
  // regex above excludes the line terminators, so a lone CR anywhere fails the match rather
  // than arriving here to be stripped. Only spaces are ever trailing by the time we are here.
  const value = field[2].replace(/ +$/, '');
  if (value[0] === '"' || value[0] === "'") {
    // Quotes only quote when the value starts with one, so this is the one branch where a
    // `: ` is legal — and a quote that never closes runs off the end of the document.
    const quote = value[0];
    let i = 1;
    while (i < value.length) {
      if (quote === '"' && value[i] === '\\') {
        // Skip the pair only when YAML defines that escape. `\U` with fewer than eight hex
        // digits is not one, so a Windows path inside a quoted description is caught here.
        const escape = YAML_ESCAPE.exec(value.slice(i));
        if (!escape) return 'escapes ' + value.slice(i, i + 2) + ', which YAML does not define as an escape';
        // Eight well-formed hex digits still name nothing above U+10FFFF, and YAML raises
        // building the character rather than scanning it — a different exception, the same
        // end state: the document does not load and the role inherits the whole catalog.
        if (escape[1][0] === 'U' && parseInt(escape[1].slice(1), 16) > 0x10FFFF) {
          return 'escapes ' + escape[0] + ', a code point above U+10FFFF that YAML cannot build';
        }
        i += escape[0].length;
      } else if (value[i] !== quote) i += 1;
      else if (quote === "'" && value[i + 1] === quote) i += 2;
      else break;
    }
    if (i >= value.length) return 'never closes its opening ' + quote + ' quote — a YAML error';
    // YAML does take a comment after the closing quote, behind a space — YAML 1.2's
    // `s-separate-in-line` requires that separation, so `"Closed"#c` is a second node on
    // the line even though PyYAML happens to be lenient about it, and a TAB out there is
    // not separation at all. The tail is therefore empty or it is a ` #` comment. That
    // comment is not part of the scalar, so it is dropped rather than folded into the
    // value. An unquoted value takes no comment here: a `#` in one stays scalar content.
    const tail = value.slice(i + 1);
    if (tail !== '' && !/^ +#/.test(tail)) {
      return 'has content after its closing ' + quote + ' quote — YAML takes only a space-separated `#` comment there';
    }
    return { key: field[1], value: value.slice(0, i + 1) };
  }
  // A plain scalar may not OPEN with a YAML indicator. `@` and a backtick are reserved, `*`
  // opens an alias, `%` a directive, `!` a tag, `[` and `{` a flow collection and `- ` a block
  // sequence entry — PyYAML 6.0.3 raises on all eight, and the end state is BL-004's over again:
  // the document does not parse, no definition loads, and a "read-only" role inherits the whole
  // catalog. The check is ANCHORED, because every one of these is ordinary content once anything
  // precedes it — `Runs the a*b case` is a plain scalar YAML reads as written — and quoting the
  // value makes any of them scalar content too. The dash is a sequence entry when a space follows
  // it OR when the line ends there, and `-x` is an ordinary scalar: the line-break form reaches
  // this line as a value of just `-`, which is also what `description: - ` becomes once the strip
  // above runs, so one `-$` alternative covers both. `?` is the ninth member and the one judgement
  // call here, since PyYAML takes `?x` while `? x` is a complex-key indicator; this parse rejects
  // on doubt, a false rejection costing one typed quote where a false acceptance costs the catalog.
  const indicator = /^(- |-$|[@`*%[{!?])/.exec(value);
  if (indicator) return 'opens its unquoted value with `' + indicator[0] + '`, a YAML indicator character';
  if (/\t/.test(value)) return 'carries a TAB outside a quoted scalar, which YAML will not skip';
  // In a plain scalar a `: ` ends the scalar, and a `:` at end of line reads the same way:
  // either makes YAML look for a second mapping key on the line and error on the document.
  if (/:$/.test(value)) return 'ends its unquoted value with `:` — YAML reads a second key there';
  if (/:[ \t]/.test(value)) return 'carries an unquoted `: ` — YAML reads a second key there';
  return { key: field[1], value };
}

// The frontmatter block parse, taken over document text: the four shipped definitions and
// the one-line documents in FRONTMATTER_CASES reach the predicate through this one door,
// so a predicate the consumer has stopped calling cannot stay green.
function frontmatterFields(text, file) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  assert.ok(match, file + ' must open with --- delimited YAML frontmatter');
  const fields = new Map();
  for (const line of match[1].split('\n')) {
    if (line.trim() === '') continue;
    const field = frontmatterField(line);
    assert.ok(typeof field === 'object', file + ' frontmatter line ' + field + ': ' + line);
    assert.ok(!fields.has(field.key), file + ' declares ' + field.key + ': twice');
    fields.set(field.key, field.value);
  }
  return { fields, body: text.slice(match[0].length) };
}

function definition(name) {
  const file = '.claude/agents/' + name + '.md';
  assert.ok(fs.existsSync(path.join(ROOT, file)), 'missing definition: ' + file);
  const text = read(file);
  const { fields, body } = frontmatterFields(text, file);
  const tools = (fields.get('tools') || '').split(',').map(t => t.trim()).filter(Boolean);
  return { file, text, body, fields, tools };
}

// The three forms the earlier guard accepted, the properly quoted colon it must keep
// accepting — the rule is YAML validity, not a ban on colons — and the no-space form the
// strictness was written for. Every case is run twice — through the predicate, and as a
// one-line document through the same `frontmatterFields()` the four definitions go
// through — so neither a validator that loosens nor a consumer that stops calling it stays green.
const FRONTMATTER_CASES = [
  { line: 'name: qa-runner', field: { key: 'name', value: 'qa-runner' } },
  { line: 'tools: Read, Glob, Grep, Bash',
    field: { key: 'tools', value: 'Read, Glob, Grep, Bash' } },
  { line: 'description: "Runs the steps: quickly"',
    field: { key: 'description', value: '"Runs the steps: quickly"' } },
  { line: "description: 'it''s fine: really'",
    field: { key: 'description', value: "'it''s fine: really'" } },
  { line: 'description: "She said \\"go: now\\" once"',
    field: { key: 'description', value: '"She said \\"go: now\\" once"' } },
  // A trailing `#` comment is valid YAML and is not part of the scalar, so a value that
  // carries one has to be accepted AND handed back without it. The two verdicts do not cost
  // the same, and this predicate is not balanced between them: a false rejection is a loud,
  // local red test that one typed space fixes, while a false acceptance is a silent
  // full-catalog inheritance nobody sees. So it rejects on doubt — and a legitimate value
  // still has to be accepted, which is what this row and the ones under it are for.
  { line: 'description: "Reviews a batch: hunk by hunk" # keep it short',
    field: { key: 'description', value: '"Reviews a batch: hunk by hunk"' } },
  // Well-formed escapes, pinning the hex counts from above.
  { line: 'description: "Ok \\x41 and \\u0041: fine"',
    field: { key: 'description', value: '"Ok \\x41 and \\u0041: fine"' } },
  { line: 'description: "Emoji \\U0001F600: ok"',
    field: { key: 'description', value: '"Emoji \\U0001F600: ok"' } },
  // U+10FFFF is the last code point there is. This row holds the boundary from the strict
  // side only — narrow the check to `>=` and it goes red — so the `\U00110000` row below
  // holds the loose side. An off-by-one either way is caught, not just the one that costs
  // nothing.
  { line: 'description: "Max \\U0010FFFF: ok"',
    field: { key: 'description', value: '"Max \\U0010FFFF: ok"' } },
  // Every single-character alternative in YAML_ESCAPE, in one value, so that dropping any
  // one of the eighteen is red rather than the two that used to be covered.
  { line: 'description: "All \\0\\a\\b\\t\\n\\v\\f\\r\\e\\ \\"\\/\\\\\\N\\_\\L\\P\\\t end"',
    field: { key: 'description', value: '"All \\0\\a\\b\\t\\n\\v\\f\\r\\e\\ \\"\\/\\\\\\N\\_\\L\\P\\\t end"' } },
  // Backslashes are literal inside single quotes, which is YAML's own answer to the Windows
  // path this file's header calls the trap. Escape handling must stay in the "-branch only.
  { line: "description: 'C:\\Users\\me\\out'",
    field: { key: 'description', value: "'C:\\Users\\me\\out'" } },
  { line: 'description: "Tab \\\tescape: ok"',
    field: { key: 'description', value: '"Tab \\\tescape: ok"' } },
  { line: 'description: "Quoted\ttab: also fine"',
    field: { key: 'description', value: '"Quoted\ttab: also fine"' } },
  { line: 'description: "Spaced" ',
    field: { key: 'description', value: '"Spaced"' } },
  // The dash is the one member of the indicator family that is not a single character, and it
  // takes four rows to pin: it opens a sequence entry when a space follows it AND when the line
  // ends there, while `-x` stays an ordinary plain scalar. Widen the pattern to any leading dash
  // and the first row goes red; drop either indicator form and one of the last three does. The
  // trailing-space row is the end-of-line form in disguise — the strip in the predicate makes
  // `description: - ` and `description: -` the same value, and PyYAML 6.0.3 raises on all three.
  { line: 'description: -x is a plain scalar',
    field: { key: 'description', value: '-x is a plain scalar' } },
  { line: 'description: - x opens a block sequence', reason: /opens its unquoted value with `- `/ },
  { line: 'description: -', reason: /opens its unquoted value with `-`/ },
  { line: 'description: - ', reason: /opens its unquoted value with `-`/ },
  { line: 'description: Runs the steps:', reason: /ends its unquoted value with/ },
  { line: 'description: "unterminated', reason: /never closes its opening/ },
  { line: 'description: a "b: c" d', reason: /carries an unquoted/ },
  { line: 'description: "quoted" and more', reason: /has content after its closing/ },
  { line: 'description: "Writes to C:\\Users\\me\\out"',
    reason: /escapes \\U, which YAML does not define/ },
  { line: 'description: "Matches \\d+: the count"',
    reason: /escapes \\d, which YAML does not define/ },
  // Short hex runs, pinning the same counts from below: loosen {2}, {4} or {8} to accept a
  // shorter run and these three start passing, while YAML still errors on every one.
  { line: 'description: "Short \\x4: y"', reason: /escapes \\x, which YAML does not define/ },
  { line: 'description: "Uni \\u12: z"', reason: /escapes \\u, which YAML does not define/ },
  { line: 'description: "Path \\U0041: here"', reason: /escapes \\U, which YAML does not define/ },
  // Eight hex digits, well formed, and still not a character: the count is syntax, the range
  // check is the rest of it.
  { line: 'description: "Above \\U41424344: here"',
    reason: /code point above U\+10FFFF that YAML cannot build/ },
  // The FIRST code point that does not exist, one past the last one that does. Loosening the
  // bound to `> 0x110000` is the edit someone makes while fixing an off-by-one, and every
  // other row here survives it — this is the one that goes red.
  { line: 'description: "First \\U00110000: no"',
    reason: /code point above U\+10FFFF that YAML cannot build/ },
  // Two named members of the complement, as documentation. The sweep below is what actually
  // holds the boundary: these two rows leave `\q` and ninety others free.
  { line: 'description: "Digit \\7 here"', reason: /escapes \\7, which YAML does not define/ },
  { line: 'description: "Letter \\z here"', reason: /escapes \\z, which YAML does not define/ },
  // PyYAML accepts this one; YAML 1.2 does not, because `s-separate-in-line` wants the space
  // before a `#`. Rejecting on doubt is the policy, and this row pins that it is a choice.
  { line: 'description: "Closed"#c', reason: /has content after its closing " quote/ },
  // A lone CR survives CRLF normalization, and the field regex is what stops it: `.` does
  // not match a line terminator, so the whole line fails before the strip below it can run.
  { line: 'description: "Carriage"\r', reason: /is not a single-line/ },
  // The four places a TAB reaches this line from. YAML errors on every one of them, and the
  // escape class carrying \t is only safe while they stay rejected: otherwise `"\<TAB>"` is
  // the key that opens them, which is how a fix becomes a hole.
  { line: 'description: "Tabbed"\t# not a comment to YAML',
    reason: /has content after its closing " quote/ },
  { line: 'description: "Closed"\t', reason: /has content after its closing " quote/ },
  { line: 'description:\tTabbed separator', reason: /is not a single-line/ },
  { line: 'description: Plain\ttab', reason: /carries a TAB outside a quoted scalar/ },
  { line: 'tools:Read, Glob', reason: /is not a single-line/ },
];

for (const probe of FRONTMATTER_CASES) {
  const verb = probe.field ? ' accepts ' : ' rejects ';
  test('the frontmatter validator' + verb + '`' + probe.line + '`', () => {
    const verdict = frontmatterField(probe.line);
    // The same line as a whole document, entering by the door `definition()` uses.
    const document = '---\n' + probe.line + '\n---\n\nbody\n';
    if (probe.field) {
      assert.deepEqual(verdict, probe.field, '`' + probe.line + '` is valid YAML and has to parse as written');
      assert.equal(frontmatterFields(document, 'synthetic.md').fields.get(probe.field.key), probe.field.value,
        '`' + probe.line + '` has to survive the document parse, not just the predicate');
      return;
    }
    assert.equal(typeof verdict, 'string', '`' + probe.line + '` is a YAML error: the document would not parse, '
      + 'no definition would load, and a "read-only" role would inherit the whole catalog');
    assert.match(verdict, probe.reason, '`' + probe.line + '` must be rejected for the reason it is invalid');
    assert.throws(() => frontmatterFields(document, 'synthetic.md'),
      err => err instanceof assert.AssertionError && probe.reason.test(err.message) && err.message.includes(probe.line),
      '`' + probe.line + '` must fail the document parse too — a predicate the consumer never calls guards nothing');
  });
}

// The whitelist's negative side, swept rather than sampled. Two named rejects pinned two
// characters and left every other one free: adding `q` to the class was green. The member
// list is written out here rather than derived from YAML_ESCAPE, because a check that reads
// the thing it is checking agrees with any edit made to both at once.
const ESCAPE_MEMBERS = '0abtnvfre "/\\N_LP\t';

test('the escape whitelist admits exactly the characters YAML defines', () => {
  let swept = 0;
  for (let code = 0x20; code <= 0x7e; code++) {
    const c = String.fromCharCode(code);
    // `QQ` fills the slot after the escape so that `\x`, `\u` and `\U` fail for want of hex
    // digits rather than by running into the closing quote.
    const accepted = typeof frontmatterField('description: "A\\' + c + 'QQ"') === 'object';
    swept += 1;
    assert.equal(accepted, ESCAPE_MEMBERS.includes(c), '`\\' + c + '` must be '
      + (ESCAPE_MEMBERS.includes(c) ? 'accepted' : 'rejected') + ' as a double-quoted escape: '
      + 'YAML defines exactly ' + JSON.stringify(ESCAPE_MEMBERS) + ', and a definition carrying '
      + 'any other pair does not load at all');
  }
  assert.equal(swept, 95, 'the sweep must cover every printable ASCII character, not a sample');
  assert.equal(ESCAPE_MEMBERS.length, 18, 'YAML 1.2 defines eighteen single-character escapes');
  // TAB is a member but is not printable, so it is swept here rather than left to its own row.
  assert.equal(typeof frontmatterField('description: "A\\\tQQ"'), 'object',
    'a literal TAB is YAML 1.2 rule 57\'s own escape and belongs to the set');
});

// The indicator family's members, written out here rather than read off the pattern in the
// predicate, for the reason ESCAPE_MEMBERS is: a check that derives its domain from the thing it
// is checking agrees with any edit made to both at once, and the size assertion below is what
// catches that edit. `- ` is two characters on purpose.
const INDICATOR_MEMBERS = ['@', '`', '*', '%', '[', '{', '- ', '?', '!'];
// Eight of the nine are YAML errors. `?` is not: PyYAML 6.0.3 reads `?x` as a plain scalar and
// raises only on `? x`, so rejecting it is this parse's judgement rather than YAML's verdict, and
// the message below has to say which of the two it is making. Claiming a parse failure for `?`
// would put the test's own message at odds with the predicate's comment, in a file where the
// message IS the contract a later reader is handed.
const INDICATOR_ON_DOUBT = ['?'];

test('an unquoted value may not open with a YAML indicator, and may carry one anywhere else', () => {
  assert.equal(INDICATOR_MEMBERS.length, 9, 'nine forms open a YAML node where a plain scalar was '
    + 'meant; a tenth gets its own case here, not a quietly wider pattern over there');
  assert.equal(new Set(INDICATOR_MEMBERS).size, INDICATOR_MEMBERS.length,
    'a duplicated member would shorten the sweep while the size assertion still counted nine');
  assert.deepEqual(INDICATOR_ON_DOUBT, ['?'], 'exactly one member is rejected on doubt. Emptying '
    + 'this list hands `?` the parse-failure wording, which is the falsehood it exists to stop; '
    + 'adding a member claims YAML takes a character it errors on. A subset test would pass at both');
  for (const member of INDICATOR_MEMBERS) {
    const line = 'description: ' + member + 'Runs a batch';
    const verdict = frontmatterField(line);
    assert.equal(typeof verdict, 'string', '`' + line + '` must be rejected: ' + (INDICATOR_ON_DOUBT.includes(member)
      ? 'YAML itself takes this one, and `' + member + ' x` it does not, so this parse rejects on '
        + 'doubt — a false rejection costs one typed quote, a false acceptance costs the catalog'
      : 'it is a YAML error, so the document would not parse, no definition would load, and a '
        + '"read-only" role would inherit the whole tool catalog'));
    assert.equal(verdict, 'opens its unquoted value with `' + member + '`, a YAML indicator character',
      '`' + line + '` must be rejected naming the character it opens with and why that is an error');
    // Through the consumer's own door, and reading the FIRST LINE alone: any diff a future
    // assertion appends down there carries the line text with it and would satisfy a
    // whole-message check no matter what the message itself said.
    assert.throws(() => frontmatterFields('---\n' + line + '\n---\n\nbody\n', 'synthetic.md'), err => {
      const first = err.message.split('\n')[0];
      return err instanceof assert.AssertionError && first.includes('a YAML indicator character')
        && first.endsWith(line);
    }, '`' + line + '` must fail the document parse too — a predicate the consumer never calls guards nothing');
    // The other side of the boundary, driven from the same list: these characters are content
    // once anything precedes them, and quoting makes them content too. A pattern that rejected
    // them anywhere would reject `Runs the a*b case`, which YAML reads exactly as written.
    for (const value of ['Runs a ' + member + 'batch case', '"' + member + 'Runs a batch"']) {
      const ok = 'description: ' + value;
      assert.deepEqual(frontmatterField(ok), { key: 'description', value },
        '`' + ok + '` is valid YAML and has to parse as written');
      assert.equal(frontmatterFields('---\n' + ok + '\n---\n\nbody\n', 'synthetic.md').fields.get('description'),
        value, '`' + ok + '` has to survive the document parse, not just the predicate');
    }
  }
});

// The complement, which the sweep above leaves free: proving each of the nine IS rejected proves
// nothing about a tenth character quietly added to the pattern, and six of them added at once was
// green. Seven characters make that complement dishonest, because YAML does not read them as
// written at the head of a value either and this parse takes them anyway. Verified against PyYAML
// 6.0.3 on `name: reviewer\ndescription: <c>Runs a batch`: `>` and `|` open a block scalar and
// `,`, `]`, `}` a flow context, all five raising; `&a x` silently drops the anchor and yields
// `x`; and `#` opens a comment, yielding a description of None — a null, not a string. They are
// the same family as the nine and were held out of this batch's fence deliberately, so they are
// NAMED here rather than blessed by an unqualified "everything else is accepted". Close one of
// them and this sweep goes red, which is the point: the member then moves into INDICATOR_MEMBERS
// with its own case. The list is hardcoded because the suite may not import a YAML parser.
// Seven is the count for THE FORM SWEPT BELOW — a head character in front of a longer value — and
// a sweep is only ever complete for the shape it sweeps. A one-character value is its own column
// and has at least two more members: PyYAML 6.0.3 raises ConstructorError on `tools: =` and loads
// `tools: ~` as null, which this parse hands back as the string `~` — key present, no list, whole
// catalog inherited. A third case is its own: `tools: 0` reaches a consumer as an int, not a
// string. That column is CLOSED AS ACCEPTED rather than deferred — BL-019, closed by
// OS-20260921-backlog-closeout — so there is no later batch to carry it. The cases known today
// are named here, not a complete count of the column, so nobody reads the seven as a claim
// about every shape a value can take.
const KNOWN_GAP = ['#', '&', ',', '>', ']', '|', '}'];
// Neither list carries a quote. A leading quote opens the branch above, and the unterminated
// scalar this sweep builds is rejected there — the verdict YAML gives it too, by another route.
const QUOTE_HEADS = ['"', "'"];

test('the indicator rule rejects exactly its members at the head, and names the gap it leaves', () => {
  const singles = INDICATOR_MEMBERS.filter(m => m.length === 1);
  assert.equal(singles.length, 8, 'eight of the nine members are single characters and belong to '
    + 'this sweep; `- ` is two and is pinned by its own rows, in both of its forms');
  assert.equal(KNOWN_GAP.length, 7, 'seven characters are accepted at the head of a longer value '
    + 'that YAML does not read as written there — fewer means one was fixed without moving it, '
    + 'more means one was recorded twice; a one-character value is a column this sweep never enters');
  assert.deepEqual(KNOWN_GAP.filter(c => INDICATOR_MEMBERS.includes(c)), [],
    'a character cannot be both a member and a gap: one of the two lists is then unreachable');
  let swept = 0;
  const met = { member: 0, gap: 0, quote: 0 };
  for (let code = 0x20; code <= 0x7e; code++) {
    const c = String.fromCharCode(code);
    // A leading space never reaches the value: `: +` in the field regex consumes it and YAML
    // treats it as separation too, so that column tests the tail on its own, as both readers see it.
    const line = 'description: ' + c + 'Runs a batch';
    const verdict = frontmatterField(line);
    const rejected = typeof verdict === 'string';
    swept += 1;
    if (QUOTE_HEADS.includes(c)) {
      met.quote += 1;
      assert.ok(rejected && /never closes its opening/.test(verdict), '`' + line + '` opens a quoted '
        + 'scalar that never closes, and the quoted branch has to keep rejecting it for that reason');
      continue;
    }
    if (singles.includes(c)) met.member += 1;
    else if (KNOWN_GAP.includes(c)) met.gap += 1;
    assert.equal(rejected, singles.includes(c), singles.includes(c)
      ? '`' + c + '` is a declared member and must be rejected at the head of an unquoted value'
      : KNOWN_GAP.includes(c)
        ? '`' + c + '` is a KNOWN GAP, not a licence: YAML does not read `' + line + '` as written, '
          + 'and this parse accepts it anyway. If a later batch closed that, move `' + c + '` out of '
          + 'KNOWN_GAP and into INDICATOR_MEMBERS, which gives it a rejection case of its own'
        : '`' + line + '` is valid YAML that reads exactly as written, so it has to be accepted: '
          + 'a pattern widened past its member list rejects it, and nothing else here would say so');
  }
  assert.equal(swept, 95, 'the sweep must cover every printable ASCII character, not a sample');
  assert.deepEqual(met, { member: 8, gap: 7, quote: 2 }, 'every declared single-character member, '
    + 'every named gap and both quote heads must be REACHED by this sweep — a list the loop never '
    + 'meets is a branch no input reaches, and it would hold nothing however right it looked');
});

// The block parse has three failure paths of its own that no one-line case can reach, and a
// line filter that decides which lines reach the predicate at all. Widening that filter to
// skip a line YAML errors on — anything indented, anything without a colon — reopens the
// BL-004 hole one level up, where the predicate never sees the line to reject it. Every
// document below is well formed apart from the one line named, so only that line can fail.
const DOCUMENT_CASES = [
  { name: 'a document with no --- opener', text: 'name: reviewer\ntools: Read, Glob\n',
    reason: /must open with --- delimited YAML frontmatter/ },
  { name: 'an indented frontmatter line',
    text: '---\nname: reviewer\n  tools: Read, Glob\n---\n\nbody\n',
    reason: /is not a single-line `key: value` mapping/, quotes: '  tools: Read, Glob' },
  { name: 'a frontmatter line carrying no colon',
    text: '---\nname: reviewer\njust prose here\n---\n\nbody\n',
    reason: /is not a single-line `key: value` mapping/, quotes: 'just prose here' },
  { name: 'a key declared twice',
    text: '---\nname: reviewer\nname: qa-runner\n---\n\nbody\n',
    reason: /declares name: twice/ },
  // YAML would take this line; this parse will not. Frontmatter here is `key: value` lines
  // and nothing else, and the rejection is loud — the alternative is a filter that skips
  // lines on a rule the predicate below it never gets to check.
  { name: 'a `#` comment line inside the block',
    text: '---\nname: reviewer\n# a comment line\ntools: Read, Glob\n---\n\nbody\n',
    reason: /is not a single-line `key: value` mapping/, quotes: '# a comment line' },
];

for (const probe of DOCUMENT_CASES) {
  test('the document parse rejects ' + probe.name, () => {
    assert.throws(() => frontmatterFields(probe.text, 'synthetic.md'), err =>
      err instanceof assert.AssertionError && probe.reason.test(err.message)
      && (!probe.quotes || err.message.endsWith(probe.quotes)),
      probe.name + ' must fail the block parse, naming the line it choked on');
  });
}

// The other half of the filter: a blank line inside a block mapping is legal YAML and must
// be skipped, not fed to a predicate that would reject it. And the body handed back starts
// after the closing ---, so a `tools:` line in the frontmatter can never satisfy a body check.
test('the document parse skips blank lines and returns a body with the block removed', () => {
  const { fields, body } = frontmatterFields('---\nname: reviewer\n\ntools: Read, Glob\n---\n\nprose\n', 'synthetic.md');
  assert.equal(fields.get('name'), 'reviewer', 'a blank line must not end the block parse');
  assert.equal(fields.get('tools'), 'Read, Glob', 'fields after a blank line still have to be read');
  assert.equal(body, '\nprose\n', 'the body must begin after the closing ---, carrying none of the frontmatter');
});

// CRLF and LF definitions must reach the frontmatter assertions identically, and which of
// them this repo happens to be checked out as must not be what decides it. Both fixtures are
// written here with their line endings spelled out, so the guard is the normalization in
// `readText` rather than the working tree: drop that normalization and the CRLF twin stops
// opening with `---\n` at all, in either checkout.
test('a CRLF definition parses identically to its LF twin', t => {
  const temp = fs.realpathSync(os.tmpdir()), base = fs.mkdtempSync(path.join(temp, 'agent-eol-'));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync(base)), temp);
    fs.rmSync(base, { recursive: true, maxRetries: 8, retryDelay: 100 }); });
  const lines = ['---', 'name: reviewer', 'tools: Read, Glob, Grep, Bash',
    'description: "Reviews a batch: hunk by hunk"', '---', '', 'prose', ''];
  const at = (name, eol) => {
    const file = path.join(base, name);
    fs.writeFileSync(file, lines.join(eol));
    return frontmatterFields(readText(file), name);
  };
  const lf = at('lf.md', '\n'), crlf = at('crlf.md', '\r\n');
  assert.deepEqual([...crlf.fields], [...lf.fields], 'a CRLF definition must parse to the same fields as its LF twin');
  assert.equal(crlf.body, lf.body, 'and to the same body — the assertions below judge bodies verbatim');
  assert.equal(lf.fields.get('tools'), 'Read, Glob, Grep, Bash',
    'and to the right fields: two empty parses would agree with each other too');
  assert.ok(!crlf.body.includes('\r'), 'no assertion below should ever meet a CR');
});

// Every other test iterates the known roles, so an unlisted file would never be read.
// The README's `cp .claude/agents/*.md ~/.claude/agents/` installs whatever is in the
// directory for every project, so a fifth definition — with no `tools:` line, inheriting
// the whole catalog — has to fail here or it ships unnoticed. The walk recurses because
// that glob is not the only reader: it leaves a nested definition on the floor, while a
// build that loads nested definitions picks up the very file the install skipped.
const definitionFiles = (base, dir = '') =>
  fs.readdirSync(path.join(base, dir), { withFileTypes: true }).flatMap(entry => {
    const rel = dir ? dir + '/' + entry.name : entry.name;
    if (entry.isDirectory()) return definitionFiles(base, rel);
    return entry.name.endsWith('.md') ? [rel] : [];
  });

// Split from the test so the walk and this message can also be run against a tree that
// actually holds a nested definition. The shipped directory never will, and a failure path
// no test can enter is the whitelist bug over again, one level up.
function assertKnownDefinitions(base) {
  const present = definitionFiles(base).sort();
  const known = Object.keys(TOOLS).map(n => n + '.md').sort();
  const unknown = present.filter(f => !known.includes(f));
  // deepEqual APPENDS its diff to a custom message rather than replacing it, so the paths
  // land in `err.message` either way and only the first line is this message. The test that
  // reads it asserts on that line alone, or the diff would answer for it.
  assert.deepEqual(unknown, [],
    'unknown definition under .claude/agents/: ' + unknown.join(', ') + ', which this test knows no tool '
    + 'list for. Nested is the worse case: `mkdir -p ~/.claude/agents && cp orchestrate-skill/.claude/agents/*.md '
    + '~/.claude/agents/` leaves it behind, but a build that recurses loads it with no `tools:` line');
  assert.deepEqual(present, known,
    '.claude/agents/ must hold exactly the definitions this test knows the tool list for; found '
    + (present.join(', ') || 'nothing'));
}

test('the directory holds exactly the four known definitions', () => {
  assertKnownDefinitions(path.join(ROOT, '.claude/agents'));
});

test('the walk reaches a nested definition and names its relative path', t => {
  const temp = fs.realpathSync(os.tmpdir()), base = fs.mkdtempSync(path.join(temp, 'agent-definitions-'));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync(base)), temp);
    fs.rmSync(base, { recursive: true, maxRetries: 8, retryDelay: 100 }); });
  for (const name of Object.keys(TOOLS)) fs.writeFileSync(path.join(base, name + '.md'), '');
  fs.mkdirSync(path.join(base, 'empty'));
  fs.writeFileSync(path.join(base, 'notes.txt'), 'not a definition');
  fs.mkdirSync(path.join(base, 'subdir'));
  fs.writeFileSync(path.join(base, 'subdir', 'orchestrator.md'), 'hello\n');
  // A basename that IS a known definition, so a whitelist comparing basenames rather than
  // relative paths lets this one through while the others still fail and hide it.
  fs.writeFileSync(path.join(base, 'subdir', 'reviewer.md'), 'hello\n');
  // Two levels down, and behind a dotted directory: one level of recursion proves only one.
  fs.mkdirSync(path.join(base, 'subdir', 'deeper'));
  fs.writeFileSync(path.join(base, 'subdir', 'deeper', 'nested.md'), 'hello\n');
  fs.mkdirSync(path.join(base, '.hidden'));
  fs.writeFileSync(path.join(base, '.hidden', 'sneaky.md'), 'hello\n');
  const nested = ['subdir/orchestrator.md', 'subdir/reviewer.md', 'subdir/deeper/nested.md',
    '.hidden/sneaky.md'];
  assert.deepEqual(definitionFiles(base).sort(),
    Object.keys(TOOLS).map(n => n + '.md').concat(nested).sort(),
    'the walk must reach .md files at any depth, dotted directories included, and only .md '
    + 'files — an empty subdirectory is not a finding');
  // The first line is the custom message with no diff appended, so this pins what that
  // message says: the relative path, and the reason a nested definition is the worse case.
  assert.throws(() => assertKnownDefinitions(base), err => {
    const message = err.message.split('\n')[0];
    return err instanceof assert.AssertionError && nested.every(f => message.includes(f))
      && /a build that recurses loads it with no `tools:` line/.test(message);
  }, 'every nested definition must fail the whitelist on the unknown-path assertion — each '
    + 'path relative to .claude/agents/, and the reason it matters, in the message itself');
});

test('every role ships a definition whose frontmatter names and describes it', () => {
  for (const name of Object.keys(TOOLS)) {
    const { file, fields } = definition(name);
    assert.equal(fields.get('name'), name, file + ' frontmatter name must match its filename');
    assert.ok((fields.get('description') || '').length > 0, file + ' needs a non-empty description');
  }
});

test('each tools: line is exactly the agreed list', () => {
  for (const [name, expected] of Object.entries(TOOLS)) {
    const { file, fields, tools } = definition(name);
    assert.ok(fields.has('tools'), file + ' must declare tools: — omitting it inherits every tool');
    assert.equal(fields.get('tools'), expected, file + ' tools: line drifted');
    assert.deepEqual(tools, expected.split(', '), file + ' parsed tool list drifted');
  }
});

test('the read-only pair grants no write capability through a listed tool', () => {
  for (const name of READ_ONLY) {
    const { file, tools, body } = definition(name);
    for (const forbidden of ['Write', 'Edit']) {
      assert.ok(!tools.includes(forbidden), file + ' must not list ' + forbidden);
    }
    assert.ok(flow(body).includes(CAVEAT), file + ' body must carry the Bash caveat verbatim');
  }
});

test('no definition pins a model or reaches past the browser MCP server', () => {
  for (const name of Object.keys(TOOLS)) {
    const { file, fields, tools } = definition(name);
    assert.ok(!fields.has('model'), file + ' must not declare model: — tier is the contract\'s ROLE_TIERS business');
    for (const tool of tools.filter(t => t.startsWith('mcp__'))) {
      assert.equal(tool, 'mcp__Claude_Browser__*', file + ' lists an unexpected MCP tool: ' + tool);
      assert.equal(name, 'qa-runner', file + ' must not list an MCP tool at all');
    }
  }
});

// A drift alarm, not a style rule. These files are re-read on every spawn, so length is
// the cost this batch exists to remove; the largest is ~1.2 KiB today and the ceiling is
// roughly 3x that. Tripping it means rewrite the body, not raise the number.
// Bytes as they sit on disk, which is what a spawn re-reads — so this one assertion reads
// the file raw rather than through `read()`, whose CRLF normalization and UTF-16 `.length`
// under-count a file carrying em-dashes: qa-runner.md is 1214 bytes in a CRLF checkout and
// 1191 units after normalizing, and the smaller number is not the cost being bounded.
test('no definition has grown into a document', () => {
  for (const name of Object.keys(TOOLS)) {
    const { file } = definition(name);
    const bytes = fs.readFileSync(path.join(ROOT, file)).length;
    // The ceiling sits well above every file today, so the ceiling alone cannot tell bytes
    // from UTF-16 units. Pin the unit against the filesystem: reading through `read()` would
    // under-count a CRLF or em-dash file and this goes red before the ceiling ever notices.
    assert.equal(bytes, fs.statSync(path.join(ROOT, file)).size,
      file + ' must be measured in bytes on disk, not in normalized UTF-16 units');
    assert.ok(bytes <= 4096, file + ' is ' + bytes + ' bytes on disk; keep definitions under 4 KiB');
  }
});

test('README documents the separate agent install', () => {
  const readme = read('README.md');
  assert.match(readme, /Installing the skill does not install the agents/);
  assert.match(readme, /`\.claude\/agents\/`/);
  assert.match(readme, /`~\/\.claude\/agents\/`/);
  assert.match(readme, /do \*\*not\*\* arrive with the skill install/);
  assert.match(readme, /restart Claude Code/i);
  assert.ok(flow(readme).includes(CAVEAT), 'README must carry the Bash caveat verbatim');
});
