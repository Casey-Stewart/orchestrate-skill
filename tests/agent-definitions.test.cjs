// Guard the shipped subagent definitions. An omitted or widened `tools:` line silently
// inherits the whole tool catalog, MCP servers included, which is the cost these files
// exist to remove — so every list is asserted literally.
const assert = require('node:assert/strict');
const fs = require('node:fs');
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
function definition(name) {
  const file = '.claude/agents/' + name + '.md';
  assert.ok(fs.existsSync(path.join(ROOT, file)), 'missing definition: ' + file);
  const text = read(file);
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  assert.ok(match, file + ' must open with --- delimited YAML frontmatter');
  const fields = new Map();
  for (const line of match[1].split('\n')) {
    if (line.trim() === '') continue;
    const field = /^([A-Za-z_][A-Za-z0-9_-]*):[ \t]+(\S.*)$/.exec(line);
    assert.ok(field, file + ' frontmatter line is not a single-line `key: value` mapping: ' + line);
    assert.ok(!/^[A-Za-z_][A-Za-z0-9_-]*:[ \t]+[^"'\n]*:[ \t]/.test(line),
      file + ' frontmatter value needs quoting — an unquoted ": " is a YAML error: ' + line);
    assert.ok(!fields.has(field[1]), file + ' declares ' + field[1] + ': twice');
    fields.set(field[1], field[2].trim());
  }
  const tools = (fields.get('tools') || '').split(',').map(t => t.trim()).filter(Boolean);
  return { file, text, body: text.slice(match[0].length), fields, tools };
}

// Every other test iterates the known roles, so an unlisted file would never be read.
// The README's `cp .claude/agents/*.md ~/.claude/agents/` installs whatever is in the
// directory for every project, so a fifth definition — with no `tools:` line, inheriting
// the whole catalog — has to fail here or it ships unnoticed.
test('the directory holds exactly the four known definitions', () => {
  const present = fs.readdirSync(path.join(ROOT, '.claude/agents')).filter(f => f.endsWith('.md')).sort();
  assert.deepEqual(present, Object.keys(TOOLS).map(n => n + '.md').sort(),
    '.claude/agents/ must hold exactly the definitions this test knows the tool list for');
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
test('no definition has grown into a document', () => {
  for (const name of Object.keys(TOOLS)) {
    const { file, text } = definition(name);
    assert.ok(text.length <= 4096, file + ' is ' + text.length + ' bytes; keep definitions under 4 KiB');
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
