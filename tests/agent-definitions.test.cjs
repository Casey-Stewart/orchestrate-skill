// Guard the shipped subagent definitions. An omitted or widened `tools:` line silently
// inherits the whole tool catalog, MCP servers included, which is the cost these files
// exist to remove — so every list is asserted literally.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
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
  // content, which is why the escape class above carries it and this does not.
  const value = field[2].replace(/[ \r]+$/, '');
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
        i += escape[0].length;
      } else if (value[i] !== quote) i += 1;
      else if (quote === "'" && value[i + 1] === quote) i += 2;
      else break;
    }
    if (i >= value.length) return 'never closes its opening ' + quote + ' quote — a YAML error';
    // YAML does take a comment after the closing quote, behind a space. Anything else out
    // there is a second node on the line, and a tab out there is not separation at all, so
    // the tail is empty or it is a ` #` comment. That comment is not part of the scalar, so
    // it is dropped rather than folded into the value. An unquoted value takes no comment
    // here: a `#` in one stays part of the scalar for this parse.
    const tail = value.slice(i + 1);
    if (tail !== '' && !/^ +#/.test(tail)) {
      return 'has content after its closing ' + quote + ' quote — YAML takes only a space-separated `#` comment there';
    }
    return { key: field[1], value: value.slice(0, i + 1) };
  }
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
  // carries one has to be accepted AND handed back without it — a false rejection blocks a
  // legitimate definition, which costs exactly what a false acceptance costs.
  { line: 'description: "Reviews a batch: hunk by hunk" # keep it short',
    field: { key: 'description', value: '"Reviews a batch: hunk by hunk"' } },
  // Well-formed escapes, pinning the hex counts from above: drop an alternative from
  // YAML_ESCAPE and these stop parsing.
  { line: 'description: "Ok \\x41 and \\u0041: fine"',
    field: { key: 'description', value: '"Ok \\x41 and \\u0041: fine"' } },
  { line: 'description: "Emoji \\U0001F600: ok"',
    field: { key: 'description', value: '"Emoji \\U0001F600: ok"' } },
  { line: 'description: "Tab \\\tescape: ok"',
    field: { key: 'description', value: '"Tab \\\tescape: ok"' } },
  { line: 'description: "Quoted\ttab: also fine"',
    field: { key: 'description', value: '"Quoted\ttab: also fine"' } },
  { line: 'description: "Spaced" ',
    field: { key: 'description', value: '"Spaced"' } },
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
  assert.deepEqual(definitionFiles(base).sort(),
    Object.keys(TOOLS).map(n => n + '.md').concat('subdir/orchestrator.md').sort(),
    'the walk must reach nested .md files and only .md files — an empty subdirectory is not a finding');
  // The first line is the custom message with no diff appended, so this pins what that
  // message says: the relative path, and the reason a nested definition is the worse case.
  assert.throws(() => assertKnownDefinitions(base), err => {
    const message = err.message.split('\n')[0];
    return err instanceof assert.AssertionError && message.includes('subdir/orchestrator.md')
      && /a build that recurses loads it with no `tools:` line/.test(message);
  }, 'a nested definition must fail the whitelist on the unknown-path assertion, with its path '
    + 'relative to .claude/agents/ and the reason it matters both in the message itself');
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
