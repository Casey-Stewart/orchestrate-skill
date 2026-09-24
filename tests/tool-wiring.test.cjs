const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { makeRepo } = require('./support/git-fixture.cjs');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const collapse = text => text.replace(/\s+/g, ' ');
const TEMPLATE = 'orchestrate/templates/00-READBEFORE.md';
const template = read(TEMPLATE);

// The domain every sweep below walks: the shipped skill tree, recursively, every file type.
function walk(dir, prefix = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)) {
    const rel = prefix + entry.name;
    if (entry.isDirectory()) out.push(...walk(path.join(dir, entry.name), rel + '/'));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}
const shipped = () => walk(path.join(ROOT, 'orchestrate')).map(rel => 'orchestrate/' + rel);
const documents = () => [...shipped(), 'README.md'];

// A command as the contract publishes it becomes argv the way a shell reads it: a
// double-quoted run is one argument. Anything a shell would interpret is refused, so a
// command that only works through shell composition cannot pass here.
function argvOf(command) {
  assert.doesNotMatch(command, /[|&;<>$`'\\]/, 'the command must need no shell interpretation: ' + command);
  return [...command.matchAll(/"([^"]*)"|(\S+)/g)].map(m => m[1] ?? m[2]);
}
function runCommand(command, cwd, env) {
  const [program, ...args] = argvOf(command);
  assert.equal(program, 'node', 'every skill-tool command runs under node: ' + command);
  const r = spawnSync(process.execPath, args, { cwd, env, encoding: 'utf8', windowsHide: true, timeout: 120000 });
  assert.ifError(r.error); assert.equal(r.signal, null);
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}
const slash = p => p.split(path.sep).join('/');

// A skill directory whose path contains a space — as this repository's own clone does —
// copied from the checkout, so the tools the contract names are the real ones.
function fixture(t) {
  const repo = makeRepo(t);
  const temp = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'tool wiring '));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 }));
  const skillDir = path.join(temp, 'skill copy', 'orchestrate');
  fs.cpSync(path.join(ROOT, 'orchestrate'), skillDir, { recursive: true });
  const env = { ...repo.env }; delete env.NODE_TEST_CONTEXT;
  return { repo, temp, env, skillDir, SKILL_DIR: slash(skillDir) };
}
const LEDGER_ID = 'TW-20260923-wiring', LEDGER_DIR = '.agents/changes/' + LEDGER_ID;
const fill = (text, values) => text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (token, key) => key in values ? values[key] : 'example');

// The fill's hash comes from the command the placeholder registry itself publishes for
// {{SKILL_SHA256}}, run as published — not from an invocation this test composes.
function registryRow(key) {
  const rows = read('orchestrate/references/scaffolding.md').split('\n').filter(l => l.startsWith('| `{{' + key + '}}` |'));
  assert.equal(rows.length, 1, 'exactly one registry row for {{' + key + '}}');
  return rows[0];
}
function skillHex(skillDir, cwd, env) {
  const commands = [...registryRow('SKILL_SHA256').matchAll(/`(node [^`]+)`/g)].map(m => m[1]);
  assert.equal(commands.length, 1, 'the {{SKILL_SHA256}} row publishes exactly one command');
  const r = runCommand(commands[0].replaceAll('<SKILL_DIR>', slash(skillDir)), cwd, env);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const m = /^SKILL ([0-9a-f]{64}) \d+ files\n$/.exec(r.stdout);
  assert.ok(m, 'the registry command must print the hash line whose hex field fills the pin: ' + JSON.stringify(r.stdout));
  return m[1];
}
function section(text, from, to) {
  const start = text.indexOf(from), end = to === undefined ? text.length : text.indexOf(to, start + 1);
  assert.ok(start !== -1 && end > start, 'section bounds must resolve: ' + from + ' .. ' + to);
  return text.slice(start, end);
}
// The one code span in a filled contract that runs the pin check.
const pinCommandOf = text => {
  const found = [...section(text, '## Boot sequence', 'Implementer sub-agents:')
    .matchAll(/`(node "[^"`]*\/tools\/check-ledger\.mjs" skill --contract [^`]+)`/g)].map(m => m[1]);
  assert.equal(found.length, 1, 'the boot sequence must carry exactly one pin-check command');
  return found[0];
};
const pinLines = text => text.split('\n').filter(l => /^\s*\*\*skill\*\*/i.test(l));

test('a filled pin line round-trips through the real check-ledger.mjs, from a directory whose path has a space', t => {
  const { repo, env, skillDir, SKILL_DIR } = fixture(t);
  assert.match(SKILL_DIR, / /, 'the fixture must exercise a skill directory containing a space');
  // The form the tool parses, shown in the template itself, directly under the Change line.
  const lines = template.split('\n');
  assert.deepEqual(pinLines(template), ['**Skill**: `{{SKILL_DIR}}` · sha256 `{{SKILL_SHA256}}`']);
  assert.equal(lines[lines.findIndex(l => l.startsWith('**Skill**')) - 1], '**Change**: {{CHANGE_ID}}');

  const hex = skillHex(skillDir, repo.cwd, env);
  const contractPath = path.join(repo.cwd, ...LEDGER_DIR.split('/'), '00-READBEFORE.md');
  const filled = fill(template, { SKILL_DIR, SKILL_SHA256: hex, LEDGER_DIR, CHANGE_ID: LEDGER_ID });
  fs.mkdirSync(path.dirname(contractPath), { recursive: true }); fs.writeFileSync(contractPath, filled);
  assert.deepEqual(pinLines(filled), ['**Skill**: `' + SKILL_DIR + '` · sha256 `' + hex + '`'], 'the directory is stored RAW, never quoted');

  // The boot step's own bytes, run from the worktree root: MATCH.
  const command = pinCommandOf(filled);
  const match = runCommand(command, repo.cwd, env);
  assert.equal(match.stdout, 'SKILL MATCH ' + hex + '\n', match.stderr);
  assert.equal(match.status, 0);

  // Control: without its quotes the same command splits the path and never reaches the tool.
  const unquoted = command.replace(/"/g, '');
  assert.ok(argvOf(unquoted).length > argvOf(command).length, 'the control must actually split the spaced path');
  const broken = runCommand(unquoted, repo.cwd, env);
  assert.notEqual(broken.status, 0); assert.doesNotMatch(broken.stdout, /SKILL MATCH/);

  // One altered hex digit: MISMATCH, naming both hashes.
  const other = (hex[0] === 'a' ? 'b' : 'a') + hex.slice(1);
  fs.writeFileSync(contractPath, filled.replace('sha256 `' + hex + '`', 'sha256 `' + other + '`'));
  const digit = runCommand(command, repo.cwd, env);
  assert.equal(digit.stdout, 'SKILL MISMATCH pinned ' + other + ' actual ' + hex + '\n'); assert.equal(digit.status, 1);

  // Any change to the pinned directory: MISMATCH against the original pin.
  fs.writeFileSync(contractPath, filled);
  fs.appendFileSync(path.join(skillDir, 'SKILL.md'), '\n');
  const changed = runCommand(command, repo.cwd, env);
  assert.match(changed.stdout, new RegExp('^SKILL MISMATCH pinned ' + hex + ' actual (?!' + hex + ')[0-9a-f]{64}\\n$'));
  assert.equal(changed.status, 1);
});

test('an unfilled pin passes the code-span-exempt grep, so the pin check is what fails it', t => {
  const { repo, env } = fixture(t);
  const contractPath = path.join(repo.cwd, ...LEDGER_DIR.split('/'), '00-READBEFORE.md');
  const unfilled = fill(template, { SKILL_DIR: '{{SKILL_DIR}}', SKILL_SHA256: '{{SKILL_SHA256}}', LEDGER_DIR, CHANGE_ID: LEDGER_ID });
  fs.mkdirSync(path.dirname(contractPath), { recursive: true }); fs.writeFileSync(contractPath, unfilled);
  const outsideCode = unfilled.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  assert.equal(outsideCode.includes('{{'), false, 'every unfilled pin placeholder sits in a code span the grep exempts');
  assert.ok(unfilled.includes('`{{SKILL_SHA256}}`'), 'the control must really leave the pin unfilled');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'orchestrate/tools/check-ledger.mjs'), 'skill', '--contract', LEDGER_DIR + '/00-READBEFORE.md'],
    { cwd: repo.cwd, env, encoding: 'utf8', windowsHide: true, timeout: 60000 });
  assert.ifError(r.error);
  assert.equal(r.stdout, 'UNKNOWN Malformed skill pin line in ' + LEDGER_DIR + '/00-READBEFORE.md\n');
  assert.equal(r.status, 2);
});

// Every occurrence of a skill-directory token, in every shipped document and the README,
// is either a quoted argument ("TOKEN" or "TOKEN/path", closed before any whitespace) or a
// code span naming the token alone. `[SKILL_DIR]` is the prompt skeletons' slot for it.
const SKILL_TOKENS = /\{\{SKILL_DIR\}\}|<SKILL_DIR>|<skill-dir>|\[SKILL_DIR\]/g;
function unquotedSkillDirs(text) {
  const bad = [];
  for (const m of text.matchAll(SKILL_TOKENS)) {
    const before = text[m.index - 1], after = text[m.index + m[0].length];
    const quoted = before === '"' && /^(?:\/[^"\s]*)?"/.test(text.slice(m.index + m[0].length));
    const named = before === '`' && after === '`';
    if (!quoted && !named) bad.push(text.slice(Math.max(0, m.index - 30), m.index + m[0].length + 20));
  }
  return bad;
}
test('every command that uses the skill directory quotes it', () => {
  // Live controls: both unquoted shapes are caught, the two accepted shapes are not.
  assert.equal(unquotedSkillDirs('run `node {{SKILL_DIR}}/tools/x.mjs` now').length, 1);
  assert.equal(unquotedSkillDirs('`skill --dir <SKILL_DIR>`').length, 1);
  assert.equal(unquotedSkillDirs('`node "<skill-dir>/tools/x.mjs"`, `--dir "<SKILL_DIR>"` and `{{SKILL_DIR}}`').length, 0);
  assert.equal(unquotedSkillDirs('`--dir "<SKILL_DIR> x` `--dir <SKILL_DIR>"`').length, 2, 'a quote on one side only is not quoting');
  assert.equal(unquotedSkillDirs('`node [SKILL_DIR]/tools/x.mjs` and `node "[SKILL_DIR]/tools/x.mjs"`').length, 1, 'the skeleton slot is held to the same rule');
  // A quote that closes only after whitespace leaves the tool path and its arguments as one argument.
  assert.equal(unquotedSkillDirs('`node "<SKILL_DIR>/tools/check-ledger.mjs skill --dir "<SKILL_DIR>"`').length, 1,
    'a quoted run must close before any whitespace');
  let occurrences = 0;
  // Markdown is where commands are published; a tool's usage synopsis (`--dir <skill-dir>`) is not one.
  const markdown = documents().filter(f => f.endsWith('.md'));
  assert.ok(markdown.includes(TEMPLATE) && markdown.includes('orchestrate/SKILL.md') && markdown.includes('README.md'));
  for (const file of markdown) {
    const text = read(file);
    occurrences += [...text.matchAll(SKILL_TOKENS)].length;
    assert.deepEqual(unquotedSkillDirs(text), [], file + ': a skill-directory command must quote the directory');
  }
  const inTemplate = [...template.matchAll(/\{\{SKILL_DIR\}\}/g)].length;
  const quotedInTemplate = [...template.matchAll(/"\{\{SKILL_DIR\}\}\/tools\/[a-z-]+\.mjs"/g)].length;
  assert.equal(inTemplate, quotedInTemplate + 1, 'the template stores the directory raw exactly once (the pin line); every other use is a quoted command');
  assert.ok(quotedInTemplate >= 2, 'the template must run both the pin check and the validation wrapper from the pinned directory');
  assert.ok(occurrences > inTemplate, 'the sweep must reach documents beyond the template');
});

test('the boot sequence verifies the pin before reconcile, and a mismatch stops for the user', () => {
  const stepsOf = text => {
    const boot = section(text, '## Boot sequence', 'Implementer sub-agents:');
    return boot.split(/\n(?=\d+\. )/).slice(1).map(s => ({ n: Number(/^(\d+)\./.exec(s)[1]), text: collapse(s) }));
  };
  const order = text => {
    const steps = stepsOf(text);
    const at = needle => steps.findIndex(s => s.text.includes(needle));
    return { steps, pin: at('/tools/check-ledger.mjs" skill --contract'), reconcile: at('**Reconcile**'),
      validation: at('**Resume-time validation**'), worktree: at('git worktree list') };
  };
  const { steps, pin, reconcile, validation, worktree } = order(template);
  assert.deepEqual(steps.map(s => s.n), steps.map((_, i) => i + 1), 'boot steps are numbered consecutively');
  assert.ok(pin !== -1 && reconcile !== -1 && validation !== -1 && worktree !== -1);
  assert.ok(worktree < pin, 'the pin check runs from the integration worktree, so after the step that establishes it');
  assert.ok(pin < reconcile && reconcile < validation, 'the pin check runs before reconcile and before validation');
  assert.ok(steps[validation].text.includes('run the validation wrapper'), 'resume-time validation runs the wrapper');
  // Control: the same reader on a template with the pin step moved after reconcile.
  const swapped = template.replace(/(\n3\. \*\*Skill pin\*\*[\s\S]*?)(\n4\. \*\*Reconcile\*\*[^\n]*)/, '$2$1');
  assert.notEqual(swapped, template, 'the control must move the pin step');
  const moved = order(swapped); assert.ok(moved.pin > moved.reconcile, 'the order reader must see a moved pin step');
  const step = steps[pin].text;
  for (const needed of ['`SKILL MATCH` → continue',
    'Anything but `SKILL MATCH` (including `SKILL MISMATCH`, `UNKNOWN` and a tool that does not run) → STOP and ask',
    "continue only on the user's explicit words, recorded verbatim in the session log", 'from the integration worktree root']) {
    assert.ok(step.includes(needed), 'the pin step must say: ' + needed);
  }
  const protocolStep = collapse(section(read('orchestrate/references/protocol.md'), '## §Session algorithm', '\n2. '));
  assert.match(protocolStep, /verifies it FIRST, before reconcile: `node "<skill-dir>\/tools\/check-ledger\.mjs" skill --contract /);
  assert.match(protocolStep, /`SKILL MATCH` continues; anything but `SKILL MATCH` \(including a tool that does not run\) STOPs and asks/);
  // Ordering in protocol.md by position, not by inclusion: nothing may place reconcile ahead of the pin check.
  assert.ok(protocolStep.indexOf('verifies it FIRST, before reconcile') < protocolStep.indexOf('SKILL MATCH'));
  // Mode continue in SKILL.md names the pin check at boot.
  assert.ok(collapse(read('orchestrate/SKILL.md')).includes('3. Boot (a pinned contract verifies its skill pin first) + reconcile'));
});

const BACKGROUND_RULE = "Never pipe or tail it; when it may outlast the runtime's command timeout, run it as a background task "
  + 'whose completion reports the one line and the exit code, and never read the log before it exits.';
test('the validation section routes every run through validate.mjs, the recipe kept as manual procedure', () => {
  const validation = section(template, '## Validation commands', '## Version + changelog');
  assert.ok(validation.includes('{{VALIDATION_COMMANDS}}'), 'the human-readable recipe stays');
  const commands = validation.split('\n').filter(l => l.includes('/tools/validate.mjs'));
  assert.deepEqual(commands, ['node "{{SKILL_DIR}}/tools/validate.mjs" --spec {{LEDGER_DIR}}/validate.json --log "<session scratchpad>/<label>.log"']);
  const prose = collapse(validation);
  for (const needed of ['Every run goes through the validation wrapper, from the worktree root', BACKGROUND_RULE,
    'the log is read only when the line is not PASS', 'is the manual procedure when the wrapper is unavailable']) {
    assert.ok(prose.includes(needed), 'the validation section must say: ' + needed);
  }
  // The flags the contract publishes are the ones the real tool documents.
  const help = spawnSync(process.execPath, [path.join(ROOT, 'orchestrate/tools/validate.mjs'), '--help'], { encoding: 'utf8', windowsHide: true });
  assert.equal(help.status, 0); assert.match(help.stdout, /^validate\.mjs --spec <file\.json> --log <file>/);
  const protocolStep = collapse(section(read('orchestrate/references/protocol.md'), '## §Session algorithm', '\n2. '));
  assert.ok(protocolStep.includes('through `node "<skill-dir>/tools/validate.mjs" --spec <ledger-dir>/validate.json --log <file>`:'));
  assert.ok(protocolStep.includes(BACKGROUND_RULE), 'protocol.md states the user-approved background-task rule verbatim');
  // Every clause of the template and protocol.md naming the quiet form is the one manual-procedure clause.
  for (const file of [TEMPLATE, 'orchestrate/references/protocol.md']) {
    const quiet = clauses(read(file)).filter(c => /\bquiet[- ]form\b/i.test(c));
    assert.equal(quiet.length, 1, file + ': exactly one clause may name the quiet form — ' + quiet.join(' || '));
    assert.match(quiet[0], /\bmanual procedure\b/, file + ': the quiet form is only the manual procedure');
  }
  // The spawn-prompt list hands implementers the wrapper, not a bare quiet-form run.
  const spawn = collapse(section(template, '\n5. Spawn ALL', '\n6. Gate PER BATCH'));
  assert.ok(spawn.includes('validation commands (the wrapper command and its recipe)'));
});

// ===== A ledger filled from the real templates =====================================
const cellsOf = line => line.split('|').slice(1, -1).map(x => x.trim());
function withRows(text, keys, rows) {
  const lines = text.split('\n');
  const head = lines.findIndex(l => l.startsWith('|') && keys.every(k => cellsOf(l).includes(k)));
  assert.notEqual(head, -1, 'no table carrying ' + keys.join(', '));
  const header = cellsOf(lines[head]);
  return [...lines.slice(0, head + 2), ...rows.map(r => '| ' + header.map(k => r[k] ?? '—').join(' | ') + ' |'), ...lines.slice(head + 2)].join('\n');
}
function scaffold(fx) {
  const hex = skillHex(fx.skillDir, fx.repo.cwd, fx.env);
  const values = { SKILL_DIR: fx.SKILL_DIR, SKILL_SHA256: hex, LEDGER_DIR, CHANGE_ID: LEDGER_ID, BATCH_NUM: '01', BATCH_TITLE: 'One',
    BATCH_BRANCH: 'feat/one', BATCH_FILES: '`tests/ok.test.cjs`', BATCH_TYPE: 'feature', BATCH_VERSION: '—' };
  const strip = text => text.replace(/<!--[\s\S]*?-->/g, '');
  const tpl = name => fill(read('orchestrate/templates/' + name), values);
  const row = { '#': 'B01', Batch: 'One', Branch: '`feat/one`', 'Files (fence)': '`tests/ok.test.cjs`', Notes: '—' };
  const files = {
    '00-READBEFORE.md': tpl('00-READBEFORE.md'), '00-request.md': strip(tpl('00-request.md')), 'LOG.md': strip(tpl('LOG.md')),
    '01-plan.md': strip(withRows(tpl('01-plan.md'), ['#', 'Branch', 'Files (fence)'], [row])),
    'PROGRESS.md': strip(withRows(tpl('PROGRESS.md'), ['#', 'Branch', 'Notes'], [row])),
    '02-batches-01-one.md': strip(tpl('02-batch.md')).replace(/(## Checklist\n)/, '$1\n- [ ] Implement example.\n'),
    // The machine form of a confirmed recipe, one step per command, as scaffolding.md's Fill step writes it.
    'validate.json': JSON.stringify({ steps: [
      { name: 'tests', argv: ['node', '--test', 'tests/ok.test.cjs'], parser: 'node' },
      { name: 'diff-check', argv: ['git', 'diff', '--check'], parser: 'none' }] }, null, 2) + '\n',
  };
  const templates = fs.readdirSync(path.join(ROOT, 'orchestrate/templates')).sort();
  assert.deepEqual(templates, ['00-READBEFORE.md', '00-request.md', '01-plan.md', '02-batch.md', 'LOG.md', 'PROGRESS.md'],
    'the fill below instantiates every shipped template; a new one must join it');
  for (const [name, text] of Object.entries(files)) fx.repo.write(LEDGER_DIR + '/' + name, text);
  fx.repo.write('tests/ok.test.cjs', "require('node:test')('ok', () => {});\n");
  return { hex, files };
}
const selfCheckOf = file => collapse(read(file));

test('scaffolding self-check names the parse and pin checks, and a filled ledger passes both', t => {
  const selfCheck = section(selfCheckOf('orchestrate/references/scaffolding.md'), '9. **Self-check**', '10. **Scaffold commit**');
  assert.ok(selfCheck.includes('`node "<SKILL_DIR>/tools/check-ledger.mjs" parse --dir <the new ledger directory>` must print `PARSE OK`'));
  assert.ok(selfCheck.includes('skill --contract <the new ledger directory>/00-READBEFORE.md` must print `SKILL MATCH`'));
  const skillMd = section(selfCheckOf('orchestrate/SKILL.md'), 'self-check (grep the new directory', 'scaffold commit on');
  assert.match(skillMd, /`PARSE OK`[^)]*`SKILL MATCH`/);
  const fill8 = section(selfCheckOf('orchestrate/references/scaffolding.md'), '8. **Fill**', '9. **Self-check**');
  for (const needed of ['write `validate.json` into the ledger directory', 'write no `validate.json`', 'write `setup.json`', 'validation baseline']) {
    assert.ok(fill8.includes(needed), 'the Fill step must say: ' + needed);
  }
  // validate.mjs accepts both PowerShells; `pwsh` is preferred, `powershell` stays allowed where it is the only one.
  assert.ok(fill8.includes('prefer `pwsh`; use `powershell` only where `pwsh` is absent'));
  // Only parse is scaffold-time; the pin check also runs at every boot.
  assert.ok(selfCheck.includes('The parse check runs at scaffold time only'));
  assert.ok(selfCheck.includes('the pin check also runs at every boot'));
  assert.ok(collapse(read('orchestrate/SKILL.md')).includes('the fill bakes the `**Skill**` pin line and writes `validate.json`, plus `setup.json` when there is a setup step'));
  const baking = section(selfCheckOf('orchestrate/references/scaffolding.md'), '## Evidence and input baking', '## Naming');
  assert.ok(baking.includes('Bake `{{SKILL_DIR}}` and `{{SKILL_SHA256}}` too: `validate.mjs`, `check-ledger.mjs` and every later skill tool'));
  assert.ok(baking.includes('run as `node "{{SKILL_DIR}}/tools/<tool>.mjs"`'));
  const readme = read('README.md');
  assert.ok(collapse(readme).includes("Update an installed copy (a `git pull` in the clone counts) only between ledgers: a ledger's contract pins the skill's hash, and an updated copy stops that ledger's next session and asks."));
  // The README's tools tree lists every file the skill ships under tools/ — the listing is the domain.
  const tree = section(readme, "## What's in here", '```\n\n');
  const listed = [...tree.matchAll(/^ {4}[├└]── (\S+) {2,}\S/gm)].map(m => m[1]).sort();
  assert.deepEqual(listed, fs.readdirSync(path.join(ROOT, 'orchestrate/tools')).sort(), 'the README tools tree must describe every shipped tool');
  assert.deepEqual([...'    ├── x.mjs   y\n    └── z.mjs   w\n'.matchAll(/^ {4}[├└]── (\S+) {2,}\S/gm)].map(m => m[1]), ['x.mjs', 'z.mjs']);

  const fx = fixture(t);
  const { hex } = scaffold(fx);
  const tool = path.join(fx.skillDir, 'tools', 'check-ledger.mjs');
  const cli = args => spawnSync(process.execPath, [tool, ...args], { cwd: fx.repo.cwd, env: fx.env, encoding: 'utf8', windowsHide: true, timeout: 60000 });
  const parsed = cli(['parse', '--dir', LEDGER_DIR]);
  assert.equal(parsed.stdout, 'PARSE OK 1 batches\n', parsed.stderr); assert.equal(parsed.status, 0);
  const pinned = cli(['skill', '--contract', LEDGER_DIR + '/00-READBEFORE.md']);
  assert.equal(pinned.stdout, 'SKILL MATCH ' + hex + '\n'); assert.equal(pinned.status, 0);
  // The wrapper command as the filled contract publishes it, run from the worktree root.
  const contract = fs.readFileSync(path.join(fx.repo.cwd, ...LEDGER_DIR.split('/'), '00-READBEFORE.md'), 'utf8');
  const published = section(contract, '## Validation commands', '## Version + changelog').split('\n').find(l => l.includes('/tools/validate.mjs'));
  const log = slash(path.join(fx.temp, 'session scratch', 'tip.log'));
  const ran = runCommand(published.replace('<session scratchpad>/<label>.log', log), fx.repo.cwd, fx.env);
  assert.match(ran.stdout, /^PASS tests [^;\n]*; diff-check [^\n]*\n$/, ran.stdout + ran.stderr); assert.equal(ran.status, 0);
  assert.ok(fs.statSync(log).size > 0, 'the wrapper writes its full log');
  // Control: the same ledger with its PROGRESS row gone fails the parse check.
  fx.repo.write(LEDGER_DIR + '/PROGRESS.md', fs.readFileSync(path.join(fx.repo.cwd, ...LEDGER_DIR.split('/'), 'PROGRESS.md'), 'utf8')
    .replace(/^\| B01 \|.*\n/m, ''));
  const failed = cli(['parse', '--dir', LEDGER_DIR]);
  assert.match(failed.stdout, /^PARSE FAIL /); assert.equal(failed.status, 1);
});

test('SKILL.md discovery resolves from the skill directory, from any repository', t => {
  const skillMd = read('orchestrate/SKILL.md');
  const discovery = collapse(section(skillMd, '## Discovery', '1. Find ledgers'));
  const m = /`(node "<skill-dir>\/tools\/git-evidence\.mjs" discovery --repo <repo>)`/.exec(discovery);
  assert.ok(m, 'the discovery command runs git-evidence.mjs from <skill-dir>');
  assert.ok(discovery.includes('`<skill-dir>` is the directory holding this `SKILL.md`'), '<skill-dir> is defined');
  // Resolved as defined — the directory holding a SKILL.md, here a copy outside this repository.
  const fx = fixture(t);
  const r = runCommand(m[1].replace('<skill-dir>', fx.SKILL_DIR).replace('<repo>', slash(fx.repo.cwd)), fx.repo.cwd, fx.env);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(JSON.parse(r.stdout).completeness, 'complete');
});

// ===== The pinned-skill rule, in all five places that stated the closed system ======
const PASSAGES = [
  ['README.md', '- **Ledgers are closed systems.**', '- **Statuses are claims'],
  ['README.md', '- **Rollout boundary.**', '## Install'],
  ['orchestrate/SKILL.md', 'Ledgers are CLOSED SYSTEMS', 'Full spec:'],
  ['orchestrate/references/protocol.md', 'A scaffolded ledger is a **closed system**', '## Roles, gates, tiers'],
  ['orchestrate/references/scaffolding.md', '## Baking rule', undefined],
];
const RULE = [
  'references ONLY its pinned skill directory, by absolute path and hash',
  'changed skill stops the ledger at its next boot and asks, and never silently changes how it runs',
];
const OLD_CLAIMS = [
  /\bnever\s+references?\s+(?:this|the)\s+skill\b/i,
  /\bnever\s+generate\s+a\s+ledger\s+that\s+references\s+(?:this|the)\s+skill\b/i,
  /\b(?:must not|does not|doesn't|cannot)\s+reference\s+(?:this|the)\s+skill\b/i,
  /\bnever\s+referenced\b[^.]*\bskill\b/i,
  /\bchanges nothing about (?:ledgers|a ledger) already scaffolded\b/i,
  /\bwith or without this skill\s*—/i,
];
// The five passages' own wording before the pinned-skill rule (commit 5c24ece), verbatim with
// whitespace collapsed, plus one invented variant — every one must be caught, and every
// pattern must catch at least one, so no pattern is padding and no old passage slips through.
const OLD_SPECIMENS = [
  'A ledger never references this skill, so it stays drivable without it.',
  "A ledger's own contract outranks the skill, so a new skill version changes nothing about ledgers already scaffolded; it reaches a repo through the next `/orchestrate new`.",
  'Ledgers are CLOSED SYSTEMS: every repo fact is baked in at scaffold time, so any session — with or without this skill — can drive one by reading the ledger alone.',
  'A session without this skill can drive the change by reading the ledger alone — that property is the point; never generate a ledger that references this skill.',
  'Interview answers are written INTO the generated `00-READBEFORE.md` — never referenced back to this skill.',
  'A ledger must not reference this skill.',
];
test('the five closed-system passages state the pinned-skill rule, and no document keeps the old claim', () => {
  assert.equal(PASSAGES.length, 5);
  assert.equal(new Set(PASSAGES.map(p => p[0] + p[1])).size, 5, 'five distinct passages');
  for (const [file, from, to] of PASSAGES) {
    const passage = collapse(section(read(file), from, to));
    for (const phrase of RULE) assert.ok(passage.includes(phrase), file + ' (' + from + '): must state "' + phrase + '"');
    assert.match(passage, /\bbaked manual procedures?\b/, file + ' (' + from + '): must name the baked manual procedures');
    assert.match(passage, /\bdriv(?:e|able)\b/, file + ' (' + from + '): must say the ledger stays drivable');
  }
  for (const specimen of OLD_SPECIMENS) assert.ok(OLD_CLAIMS.some(p => p.test(specimen)), 'no old-claim pattern catches: ' + specimen);
  for (const pattern of OLD_CLAIMS) assert.ok(OLD_SPECIMENS.some(s => pattern.test(s)), 'old-claim pattern catches no specimen: ' + pattern);
  const files = documents();
  assert.ok(files.length > 10 && files.includes('orchestrate/templates/00-READBEFORE.md'));
  for (const file of files) {
    const text = collapse(read(file));
    for (const pattern of OLD_CLAIMS) assert.doesNotMatch(text, pattern, file + ': still carries a pre-pin closed-system claim');
  }
});

// ===== No repo-relative tool path outside the mirrored evidence section ===============
const REPO_RELATIVE = /\bnode\s+["']?(?:\.[\/\\])?orchestrate[\/\\]tools[\/\\]/g;
const MIRRORED = /### Read-only evidence tools\n[\s\S]*?(?=\n## )/;
const outsideMirror = text => text.replace(MIRRORED, '');
// Structural: every occurrence of `tools/<name>` or `tools\<name>`, for every tool the skill
// ships (bound to the directory listing, not a hand list of spellings), must be the tail of a
// quoted placeholder directory — `"{{X}}/tools/<name>"`, `"<x>/tools/<name>"` or, inside a
// prompt skeleton, `"[X]/tools/<name>"` — closing right after the name.
const toolNames = () => fs.readdirSync(path.join(ROOT, 'orchestrate/tools')).filter(n => n.endsWith('.mjs'));
function toolPathFaults(text, names) {
  const escaped = names.map(n => n.replace(/\./g, '\\.')).join('|');
  const faults = [];
  for (const m of text.matchAll(new RegExp('tools[\\\\/](?:' + escaped + ')', 'g'))) {
    const before = text.slice(Math.max(0, m.index - 80), m.index), after = text[m.index + m[0].length];
    const quotedDir = /"(?:\{\{[A-Z_]+\}\}|<[A-Za-z_ -]+>|\[[A-Z_]+\])\/$/.test(before);
    if (!quotedDir || after !== '"') faults.push(text.slice(Math.max(0, m.index - 30), m.index + m[0].length + 10));
  }
  return faults;
}
// smoke-page.md (outside this batch's fence) runs `node tools/build-smoke-page.mjs …`,
// relative to the skill directory. Declared, bounded, and allowed only to shrink.
const KNOWN_TOOL_PATH_FAULTS = { 'orchestrate/references/smoke-page.md': 2 };
test('every shipped command naming a skill tool quotes a placeholder directory, both slash directions', () => {
  const names = toolNames();
  assert.ok(names.includes('check-ledger.mjs') && names.includes('validate.mjs') && names.length >= 7, 'bound to the real tools listing');
  // Controls: each broken shape is caught, the accepted shapes are not.
  for (const bad of ['`node <skill>/tools/check-ledger.mjs skill --contract x`', '`node orchestrate\\tools\\check-ledger.mjs`',
    '`node "orchestrate/tools/validate.mjs"`', '`node "<SKILL_DIR>/tools/check-ledger.mjs skill --dir "<SKILL_DIR>"`',
    '`node tools/build-smoke-page.mjs a b`', '`node [SKILL_DIR]/tools/validate.mjs`', '`node "[SKILL_DIR]/tools/validate.mjs --spec x"`']) {
    assert.equal(toolPathFaults(bad, names).length, 1, 'must be caught: ' + bad);
  }
  assert.deepEqual(toolPathFaults('`node "{{SKILL_DIR}}/tools/validate.mjs" --spec x` `node "<skill-dir>/tools/git-evidence.mjs" discovery` `node "[SKILL_DIR]/tools/validate.mjs" --spec x`', names), []);
  assert.ok(Object.values(KNOWN_TOOL_PATH_FAULTS).reduce((a, b) => a + b, 0) <= 2, 'a known fault may be retired, never added');
  let seen = 0;
  for (const file of documents().filter(f => f.endsWith('.md'))) {
    const text = outsideMirror(read(file));
    seen += [...text.matchAll(/tools[\\/][a-z-]+\.mjs/g)].length;
    const faults = toolPathFaults(text, names);
    assert.ok(faults.length <= (KNOWN_TOOL_PATH_FAULTS[file] || 0), file + ': a tool command without a quoted placeholder directory — ' + faults.join(' || '));
  }
  assert.ok(seen >= 6, 'the sweep must see the published tool commands');
});
test('no shipped Markdown runs node orchestrate/tools/ outside the mirrored evidence section', () => {
  const protocol = read('orchestrate/references/protocol.md');
  const exempt = (MIRRORED.exec(protocol) || [''])[0];
  assert.ok((exempt.match(REPO_RELATIVE) || []).length > 0, 'the exemption must cover live recipes, or it exempts nothing');
  // Planted controls: one outside the section is caught (either slash direction), one inside it is exempt.
  const skillMd = read('orchestrate/SKILL.md');
  assert.ok((outsideMirror(skillMd + '\nRun `node orchestrate/tools/check-ledger.mjs parse`.\n').match(REPO_RELATIVE) || []).length === 1);
  assert.ok((outsideMirror(skillMd + '\nRun `node orchestrate\\tools\\check-ledger.mjs parse`.\n').match(REPO_RELATIVE) || []).length === 1);
  const planted = protocol.replace('### Read-only evidence tools\n', '### Read-only evidence tools\nnode orchestrate/tools/x.mjs\n');
  assert.notEqual(planted, protocol);
  assert.equal((outsideMirror(planted).match(REPO_RELATIVE) || []).length, 0);
  const markdown = shipped().filter(f => f.endsWith('.md'));
  assert.ok(markdown.includes('orchestrate/SKILL.md') && markdown.length > 8, 'the sweep walks every shipped Markdown file');
  for (const file of markdown) {
    assert.deepEqual(outsideMirror(read(file)).match(REPO_RELATIVE), null, file + ': runs a tool by a path only this repository resolves');
  }
});

// ===== Directives that would undo the rules ============================================
// Clause-level: a pattern match is a directive unless a negation GOVERNS it — a negator
// directly before the matched words (one word, or "under any circumstance", may intervene;
// "not only", "why not" and a double negation do not govern). The negation is checked at
// EVERY position a directive could start, so a negated verb early in a clause cannot carry a
// later, un-negated one. A negation elsewhere in the clause exempts nothing. Each pattern owns
// an affirmative specimen; the controls below pin both sides of the negation rule. A background
// TASK whose completion reports the line and exit code is the user-approved rule (2026-09-23),
// so only a shell `&`, not waiting for the line, piping, tailing, or reading the log early are caught.
// The load-bearing passages themselves are pinned by equality in the next test; this sweep
// is for the rest of the documents.
const UNDO = [
  ['pipe the validation output', /\bpip(?:e|es|ed|ing)\b[^.;:]*\b(?:validat\w*|wrapper|validate\.mjs)\b/i, 'Pipe the validation output through Select-Object to shorten it'],
  ['pipe into tail', /\b(?:validat\w*|wrapper|validate\.mjs)\b[^.;:]*\|\s*(?:tail|head|Select-Object|more|tee)\b/i, 'Run validate.mjs | tail -20 to see the end'],
  ['tail the validation output', /\btail\w*\s+(?:the|its)\s+(?:validation|wrapper|log)\b/i, 'Tail the validation output while it runs'],
  ['detach with a shell job', /\b(?:validat\w*|wrapper|validate\.mjs)\b[^.;:]*(?:\s&(?=\s|`|$)|\bStart-Job\b|\bnohup\b)/i, 'Start the wrapper with a trailing & and keep working'],
  ['move on without the line', /\bwithout waiting for\b[^.;:]*\b(?:line|exit code|result|completion|wrapper|validation)\b/i, 'Start the wrapper in the background and move on without waiting for its line'],
  ['read the log before it exits', /\bread\w*\s+(?:the\s+)?(?:validation\s+|wrapper's\s+)?log\b[^.;:]*\b(?:while|before|during)\b/i, 'Read the log while the wrapper runs to catch failures early'],
  ['read the log on every run', /\b(?:always\s+read\w*\s+(?:the\s+)?(?:full\s+|whole\s+)?log\b|read\w*\s+(?:the\s+)?(?:full\s+|whole\s+)log\b[^.;:]*\b(?:every|each|always)\b)/i, 'Read the full log after every run'],
  ['run the recipe instead of the wrapper', /\b(?:run|use)s?\b[^.;:]*\b(?:block above|recipe|validation commands)\b[^.;:]*\b(?:directly|instead|rather than)\b/i, 'When the suite is slow, run the block above directly instead'],
  ['skip the pin check', /\b(?:skip|bypass|ignore|omit)\w*\b[^.;:]*\b(?:pin check|skill pin|pin line|SKILL MISMATCH)\b/i, 'Skip the pin check when the skill was only updated'],
  ['continue on a mismatch or unknown', /(?:SKILL MISMATCH|\bUNKNOWN\b)[^.;:]*\b(?:[Cc]ontinue|[Pp]roceed)s?\b/, 'On a SKILL MISMATCH, continue with the new skill'],
  ['continue despite a later mismatch', /\b(?:[Cc]ontinu|[Pp]roceed)\w*\b[^.;:]*(?:SKILL MISMATCH|\bUNKNOWN\b)/, 'Continue with Reconcile on a `SKILL MISMATCH` from a moved directory'],
  ['only a mismatch stops', /\b[Oo]nly\s+(?:an?\s+)?`?(?:SKILL MISMATCH|UNKNOWN)`?[^.;:]*\bstop/, 'Only a `SKILL MISMATCH` stops the session'],
  ['the pin check made conditional', /\b(?:pin check|skill pin)\b[^.;:]*\b(?:only (?:if|when)|optional|unless)\b/i, 'Run the pin check only if the skill directory moved'],
  ['reconcile before the pin check', /\b[Rr]econcile\b[^.;:]*\b(?:first|before)\b[^.;:]*\bpin\b/, 'Reconcile first, then run the pin check'],
  ['pin check after reconcile', /\b(?:pin check|skill pin|pin)\b[^.;:]*\b(?:after|once)\b[^.;:]*\breconcil/i, 'Run the pin check after reconcile'],
  ['pin check at scaffold time only', /\b(?:both|pin check|skill check|skill --contract)\b[^.;:]*\bscaffold[- ]time only\b/i, 'Both run at scaffold time only'],
  ['a pointer into the skill', /\b(?:left as a pointer|links?|refers?|point)\s+(?:in)?to\s+(?:this|the)\s+skill's\s+(?:reference|references\/)/i, "Interview answers may be left as a pointer into this skill's reference docs where a rule is long"],
];
// Nor does a negator govern across a negative verb: "never skip saving …" is a double negative
// that licenses, so skip, omit, neglect, forget, fail, avoid and hesitate never count as the
// one word between.
const NEGATOR = /(?:^|[^\w'’])(never|not|cannot|nor|\w+n['’]t)\s+(?:((?!(?:only|just|merely|simply|skip\w*|omit\w*|neglect\w*|forg[eo]t\w*|fail\w*|avoid\w*|hesitat\w*)\s)[\w`'’-]+)\s+|under any circumstances?\s+)?$/i;
const IS_NEGATOR = /^(?:never|not|cannot|nor|\w+n['’]t)$/i;
function governed(prefix) {
  const m = NEGATOR.exec(prefix);
  if (!m) return false;
  if (m[2] && IS_NEGATOR.test(m[2])) return false; // "cannot not skip": a double negation

  const before = prefix.slice(0, m.index + m[0].indexOf(m[1]));
  // "why not …" is a suggestion and "cannot not …" a double negation: neither forbids.
  return !/(?:\bwhy|\bnever|\bnot|\bcannot|n['’]t)\s+$/i.test(before);
}
const clauses = text => collapse(text).split(/(?<=[.;:])\s+/);
function fires(pattern, clause) {
  if (!pattern.test(clause)) return false;
  const sticky = new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, '') + 'y');
  for (let i = 0; i < clause.length; i++) {
    if (i > 0 && /\w/.test(clause[i - 1]) && /\w/.test(clause[i])) continue;
    sticky.lastIndex = i;
    if (sticky.test(clause) && !governed(clause.slice(0, i))) return true;
  }
  return false;
}
const undoing = text => clauses(text).flatMap(c => UNDO.filter(([, p]) => fires(p, c)).map(([name]) => name + ' — ' + c));
test('no shipped passage tells a reader to pipe, tail or detach validation, or to skip or postpone the pin check', () => {
  assert.equal(new Set(UNDO.map(u => u[0])).size, UNDO.length);
  for (const [name, pattern, specimen] of UNDO) {
    assert.match(specimen, pattern, name + ': the pattern must fire on its specimen');
    // The specimen is owned: no other pattern is what catches it.
    assert.deepEqual(UNDO.filter(([, p]) => p.test(specimen)).map(u => u[0]), [name], name + ': its specimen must be caught by it alone');
    assert.equal(undoing(specimen + '.').length, 1, name + ': the clause reader must report the specimen');
  }
  // Must be reported: an unrelated negation after the match, a negated verb earlier in the
  // clause carrying a later directive, a negation too far from the verb, a suggestion, a
  // double negation, and every contradiction the round-2 hunt planted.
  for (const planted of ['Pipe the validation output through tail when the full log is not needed.',
    'Skip the pin check when the skill directory has not changed since the last session.',
    'A SKILL MISMATCH does not stop the session, so continue with the updated skill.',
    'An `UNKNOWN` from a moved skill directory → continue with Reconcile.',
    'Never skip the reconcile step, and skip the pin check when the skill was only updated.',
    'Never pipe the recipe block by hand, but pipe the validation output through Select-Object.',
    'Do not only pipe the validation output, tail it too.',
    'Why not pipe the validation output through tail when the suite is slow?',
    'If the check prints no SKILL MISMATCH, continue with Reconcile.',
    'You cannot not skip the pin check.',
    'Do not hesitate to skip the pin check.',
    'The pin check is optional when the skill directory is unchanged.',
    'Verify the skill pin after reconcile.',
    'Verify the skill pin once reconcile is done.',
    'Implementers run the recipe rather than the wrapper.',
    'Use the block above instead of the wrapper when it is faster.',
    'Tip validation uses the recipe directly.',
    "A ledger may also link to this skill's references/protocol.md for the long rules.",
    // A negator does not govern across a negative verb: never omitting the skip IS skipping.
    'Never omit skipping the pin check when the skill directory moved.']) {
    assert.ok(undoing(planted).length >= 1, 'must be reported: ' + planted);
  }
  // Must pass: a negation governing the verb, adjacent or across one word or the stock
  // phrase, and the approved rules themselves.
  assert.deepEqual(undoing('Never pipe or tail it. Never skip the pin check. Don\'t pipe the validation output. '
    + 'Do not ever skip the pin check. Do not under any circumstance skip the pin check. '
    + "Interview answers are written INTO the generated `00-READBEFORE.md` — never left as a pointer into this skill's reference docs. "
    + BACKGROUND_RULE), [], 'a negated rule — and the approved background task — is the rule itself, not a contradiction');
  const files = documents();
  assert.ok(files.includes(TEMPLATE) && files.includes('orchestrate/references/protocol.md'));
  for (const file of files) assert.deepEqual(undoing(read(file)), [], file + ': a directive undoes the validation or pin rule');
});

// ===== The load-bearing passages, pinned by equality ===================================
// Two rounds of regex sweeps each left a contradicting sentence green, so the passages that
// carry this batch's rules are pinned as whole text (whitespace collapsed): ANY appended,
// narrowed or reworded sentence inside them goes red. Rewording one on purpose means
// updating its constant here — that is the intent, as with the pinned implementer paragraph.
const PINNED = [
  [TEMPLATE, '3. **Skill pin**', '\n4. **Reconcile**',
    "3. **Skill pin**, before anything is reconciled: from the integration worktree root run `node \"{{SKILL_DIR}}/tools/check-ledger.mjs\" skill --contract {{LEDGER_DIR}}/00-READBEFORE.md`. `SKILL MATCH` → continue. Anything but `SKILL MATCH` (including `SKILL MISMATCH`, `UNKNOWN` and a tool that does not run) → STOP and ask; continue only on the user's explicit words, recorded verbatim in the session log — an upgrade (the `**Skill**` line above rewritten to the new directory and hash in the commit that records those words) or this contract's manual procedures (the recipe under §Validation commands, the prompt list in §Session algorithm step 5, the manual fence fallback) for the rest of the change."],
  [TEMPLATE, 'All must pass before a batch may integrate', '\n## Version + changelog',
    "All must pass before a batch may integrate (`🟢`). Every run goes through the validation wrapper, from the worktree root: ```text node \"{{SKILL_DIR}}/tools/validate.mjs\" --spec {{LEDGER_DIR}}/validate.json --log \"<session scratchpad>/<label>.log\" ``` `validate.json` is the machine form of the block above, written at scaffold time. The wrapper's one line (`PASS …`, `FAIL … — log: <path>` or `UNKNOWN …`) is the result and its exit code (0/1/2) is the real one; the log is read only when the line is not PASS, and failing test NAMES are taken from it so failing sets compare by name against any allowlist. Never pipe or tail it; when it may outlast the runtime's command timeout, run it as a background task whose completion reports the one line and the exit code, and never read the log before it exits. The block above stays the human-readable recipe and is the manual procedure when the wrapper is unavailable, run in its QUIET form (a totals line plus failing test NAMES; full output only on a non-zero exit). If the block above says `none`, there is no `validate.json` and the checkpoint smoke tests carry ALL verification — state that explicitly when handing over. Mutation runner (optional, a sweep scoped to a batch's changed files): {{MUTATION_RUNNER}}. The skill's `mutate.mjs` is a different tool: the test hunter proves with it only the mutations it chooses itself, each on a disposable clone of the batch's commit."],
  ['orchestrate/references/protocol.md', '1. Boot + reconcile', '\n2. Repairs first',
    "1. Boot + reconcile + resume-time validation (validation commands on the integration tip; red → step 2 first). A contract carrying a `**Skill**` pin line verifies it FIRST, before reconcile: `node \"<skill-dir>/tools/check-ledger.mjs\" skill --contract <ledger-dir>/00-READBEFORE.md` from the integration worktree root — `SKILL MATCH` continues; anything but `SKILL MATCH` (including a tool that does not run) STOPs and asks, continuing only on the user's explicit words recorded verbatim in the session log (an upgrade: the pin line rewritten in the commit that records them; or the contract's manual procedures). Such a contract runs every validation — resume-time and tip validation alike — through `node \"<skill-dir>/tools/validate.mjs\" --spec <ledger-dir>/validate.json --log <file>`: its one line is the result, its exit code the real one, and the log is read only when the line is not PASS. Never pipe or tail it; when it may outlast the runtime's command timeout, run it as a background task whose completion reports the one line and the exit code, and never read the log before it exits. Without a pin line, or when the wrapper is unavailable, the manual procedure is the validation commands in their quiet form."],
  ['orchestrate/references/scaffolding.md', 'Also write `validate.json`', '\n   Keep the generated',
    "Also write `validate.json` into the ledger directory, the spec `validate.mjs --help` describes: one step per confirmed validation command; a multi-line recipe block becomes ONE `shell` step whose `script` is the block's text (a PowerShell block: prefer `pwsh`; use `powershell` only where `pwsh` is absent — its log carries CLIXML noise); `parser` names the runner the command invokes (`node`, `jest`, `pytest` — without `-q`, whose summary it cannot read — `cargo`, else `none`). Run it once at the base through the contract's validation wrapper and record its line in LOG.md as the ledger's validation baseline. When the validation commands are `none`, write no `validate.json` (an empty `steps` array is invalid) and say so in LOG.md. When `{{WORKTREE_SETUP}}` is not `n/a`, also write `setup.json`, a `validate.mjs` spec holding the setup command(s), so a disposable checkout can be set up exactly like a worktree."],
  ['orchestrate/references/scaffolding.md', '## Baking rule', undefined,
    "## Baking rule Interview answers are written INTO the generated `00-READBEFORE.md` — never left as a pointer into this skill's reference docs. A ledger references ONLY its pinned skill directory, by absolute path and hash, and every step a tool performs also has a baked manual procedure (the recipe block for validation, the pasted-prompt list for spawning, the fence's manual fallback); a changed skill stops the ledger at its next boot and asks, and never silently changes how it runs. The skill's references exist for the skill's benefit; each ledger must be drivable by a session that has never seen this skill — or has a changed one: State line, LOG.md, `NEEDS_FENCE`, ASK, tiers, runners, evidence, fold-ins and their ids are all explained inside the ledger's own files."],
];
const PINNED_ROWS = {
  SKILL_DIR: "| `{{SKILL_DIR}}` | template (READBEFORE) | the absolute path of the directory holding the skill's `SKILL.md` (the base directory the skill loader reports), forward slashes, stored RAW between the pin line's backticks — never quoted there; every command that uses it quotes it. Never relative or `~`: the pin check reads it from the working directory |",
  SKILL_SHA256: "| `{{SKILL_SHA256}}` | template (READBEFORE) | the hex field of `node \"<SKILL_DIR>/tools/check-ledger.mjs\" skill --dir \"<SKILL_DIR>\"`, run at fill time |",
};
test('the load-bearing passages and registry rows match their pinned text exactly', () => {
  const pinned = (text, from, to) => collapse(section(text, from, to)).trim();
  for (const [file, from, to, expected] of PINNED) {
    const text = read(file);
    assert.equal(text.split(from).length - 1, 1, file + ': the passage anchor "' + from + '" must occur exactly once');
    assert.equal(pinned(text, from, to), expected, file + ' (' + from + '): the pinned passage changed; update PINNED only on purpose');
    // Live control: one appended sentence inside the passage reddens it.
    const planted = text.replace(from, from + ' Skip it when in a hurry.');
    assert.notEqual(pinned(planted, from, to), expected);
  }
  assert.equal(PINNED.length, 5, 'five passages are pinned; the list may not shrink to a sample');
  for (const [key, row] of Object.entries(PINNED_ROWS)) assert.equal(registryRow(key), row, '{{' + key + '}} registry row changed');
});

// ===== Rendered prompts: report shapes, the pointer, findings by path =================
const PROMPTS = 'orchestrate/references/subagent-prompts.md';
const promptTool = () => import(require('node:url').pathToFileURL(path.join(ROOT, 'orchestrate/tools/prompt.mjs')).href);
// Every fenced block of the skeleton document with its info string: the whole domain.
function fencedBlocks(text) {
  const blocks = [];
  let open = null;
  for (const line of text.split('\n')) {
    if (line.startsWith('```')) { if (open) { blocks.push(open); open = null; } else open = { info: line.slice(3), lines: [] }; }
    else if (open) open.lines.push(line);
  }
  assert.equal(open, null, 'balanced fences');
  return blocks;
}
const NONCE_LINE = 'Line 2, directly under line 1: NONCE [NONCE]';
// A rendered block states line 1 and ends on the nonce line, its only [NONCE]; the round-2
// fragment (composed into the reviewer's) and every pasted skeleton carry no nonce at all.
function reportShapeFaults(blocks) {
  return blocks.flatMap(b => {
    const body = b.lines.join('\n'), label = b.info || (b.lines[0] || '').slice(0, 40);
    if (!b.info.startsWith('prompt:') || b.info === 'prompt:round-2') return /NONCE/.test(body) ? [label + ': carries a nonce'] : [];
    const faults = [];
    if (body.split('[NONCE]').length !== 2) faults.push(label + ': [NONCE] must occur exactly once');
    if (b.lines.filter(l => l.trim()).pop() !== NONCE_LINE) faults.push(label + ': the last line must be "' + NONCE_LINE + '"');
    if (!/^Line 1, exactly one of: |line 1 exactly `CLEAN` or `FINDINGS <n>`|^Same REPORT shape\.$/m.test(body)) faults.push(label + ': states no line 1');
    return faults;
  });
}
test('every rendered REPORT shape carries NONCE [NONCE] as line 2, last; no pasted skeleton carries a nonce', async () => {
  const { BLOCKS } = await promptTool(), doc = read(PROMPTS), blocks = fencedBlocks(doc);
  assert.deepEqual(blocks.filter(b => b.info.startsWith('prompt:')).map(b => b.info.slice(7)).sort(), BLOCKS.slice().sort(),
    'the rendered blocks are exactly the renderer\'s');
  const pasted = blocks.filter(b => !b.info.startsWith('prompt:')).map(b => b.lines[0]);
  for (const opener of ['You are the QA RUNNER', 'You are the ARTIFACT PROOFER', 'You are the independent PRE-FLIGHT', 'You verify that change', 'You are fixing']) {
    assert.ok(pasted.some(first => first.startsWith(opener)), 'the pasted domain must still hold: ' + opener);
  }
  assert.deepEqual(reportShapeFaults(blocks), []);
  // Controls: a nonce planted in a pasted skeleton, a nonce line moved up, a nonce line lost.
  const qa = doc.replace('REPORT: one line per step', 'NONCE [NONCE]\nREPORT: one line per step');
  const moved = doc.replace(NONCE_LINE + '\n```\n\nMain-checkout variant', '```\n\nMain-checkout variant')
    .replace('REPORT (fixed shape — the orchestrator acts on nothing else):\nLine 1', 'REPORT (fixed shape — the orchestrator acts on nothing else):\n' + NONCE_LINE + '\nLine 1');
  const lost = doc.replace('line; line 3 `FINDINGS <n>`; line 4 the path [FINDINGS_FILE].\n' + NONCE_LINE + '\n', 'line; line 3 `FINDINGS <n>`; line 4 the path [FINDINGS_FILE].\n');
  for (const [name, text, expected] of [['qa', qa, /carries a nonce/], ['moved', moved, /prompt:implementer: the last line/], ['lost', lost, /prompt:test-hunter: \[NONCE\] must occur exactly once/]]) {
    assert.notEqual(text, doc, name + ': the control anchor must exist');
    assert.match(reportShapeFaults(fencedBlocks(text)).join(' || '), expected, name);
  }
});

const pointerOf = text => {
  const found = [...collapse(text).matchAll(/`(Your complete instructions are in the file <prompt file>\.[^`]*)`/g)].map(m => m[1]);
  assert.equal(found.length, 1, 'exactly one pointer message');
  return found[0];
};
test('§Spawning rules renders with prompt.mjs and points with ONE fixed message that holds no nonce', async () => {
  const { ROLES } = await promptTool(), doc = read(PROMPTS);
  const rules = collapse(section(doc, '## Spawning rules (orchestrator)'));
  const command = '`node "<skill-dir>/tools/prompt.mjs" --ledger <ledger-dir> --role <role> --batch <Bnn> --facts <facts.json> --out "<scratchpad>/prompts"`';
  assert.ok(rules.includes(command), 'the rendering command');
  assert.ok(rules.includes('(roles ' + Object.keys(ROLES).map(r => '`' + r + '`').join(', ') + ';'), 'every role the renderer knows, and no other');
  const pointer = pointerOf(rules);
  assert.doesNotMatch(pointer, /nonce|\[NONCE\]|[0-9a-f]{12}/i, 'the pointer never holds the nonce');
  for (const needed of ['<prompt file>', 'last line', 'line 2']) assert.ok(pointer.includes(needed), 'the pointer says: ' + needed);
  assert.equal(pointerOf(section(template, '\n5. Spawn ALL', '\n6. Gate PER BATCH')), pointer, 'the template spawns with the same bytes');
  for (const needed of ['The nonce stays with the orchestrator and never enters the pointer.',
    'A report whose line 2 is not `NONCE <the nonce>` is treated as no report: the agent did not read its instructions to the end.',
    'The QA runner, artifact proofer, pre-flight, convergence and fix-up skeletons are always filled and pasted and carry NO nonce',
    'the manual procedure is the skeleton filled by hand and pasted without its nonce line']) {
    assert.ok(rules.includes(needed), '§Spawning rules must say: ' + needed);
  }
  // The flags published are the ones the real tool documents.
  const help = spawnSync(process.execPath, [path.join(ROOT, 'orchestrate/tools/prompt.mjs'), '--help'], { encoding: 'utf8', windowsHide: true });
  assert.equal(help.status, 0);
  assert.ok(help.stdout.startsWith('prompt.mjs --ledger <ledger-dir> --role <role> --batch <Bnn> --facts <facts.json> --out <dir>'));
});

test('template step 5 renders, then points, and keeps its self-contained list as the manual procedure', () => {
  const spawn = collapse(section(template, '\n5. Spawn ALL', '\n6. Gate PER BATCH'));
  assert.ok(spawn.includes('`node "{{SKILL_DIR}}/tools/prompt.mjs" --ledger {{LEDGER_DIR}} --role implementer --batch <Bnn> --facts <facts.json> --out "<session scratchpad>/prompts"`'));
  const manual = spawn.indexOf('When the renderer is unavailable or refuses (`UNKNOWN …`), the manual procedure is a pasted prompt');
  const list = spawn.indexOf('every such prompt must be SELF-CONTAINED:');
  assert.ok(manual !== -1 && list > manual, 'the self-contained list is the manual procedure');
  for (const item of ['the spec text + codebase facts from the batch file', 'the exact file fence', 'acceptance criteria', 'the applicable guardrails',
    'validation commands (the wrapper command and its recipe)', 'the conventions + prohibitions blocks above', 'report shape',
    'tick your checklist items in the batch file as you complete them']) {
    assert.ok(spawn.slice(list).includes(item), 'the manual list keeps: ' + item);
  }
  assert.ok(collapse(section(template, '\n6. Gate PER BATCH', '- **6a')).includes('or with the wrong nonce'), 'the gate treats a wrong nonce as no report');
  const protocol = read('orchestrate/references/protocol.md');
  const step5 = collapse(section(protocol, '\n5. Spawn ALL', '\n6. Gate per batch'));
  assert.ok(step5.includes('When the renderer is unavailable or refuses, the manual procedure is a pasted prompt with no nonce line; pasted prompts are SELF-CONTAINED'));
  assert.ok(collapse(section(protocol, '\n6. Gate per batch', '6a fence check')).includes('or with the wrong nonce'));
});

// Every findings file reaches LOG.md, byte for byte, BEFORE its path is handed on: in each
// paragraph or list item, every hand-on comes after an AFFIRMATIVE statement of the append
// §Spawning rules publishes — its whole text, LOG.md target included, the template's
// scaffold-time placeholders read as the reference's run-time ones. A negator anywhere earlier
// in the append's clause ("Never run `…`", "Don't ever run `…`") makes it no append, rejected
// on doubt; an order word in the append's own clause ("having already forwarded", "before the
// append", "Before running `…`", "only after forwarding") puts its hand-on first, whatever the
// text order. Five spellings of a hand-on: "forward" in a block about findings (the rule's own
// verb; the block filter keeps "forward slashes" out); hand / pass / send / give / provide /
// share / supply with a report, findings, ASK or path as its object anywhere; and the skill's
// own verbs, resume an agent WITH findings and point it AT or TO them. Findings read back FROM
// LOG.md were appended already, which is the rule itself.
const LOG_PLACEHOLDERS = text => text.replaceAll('{{LEDGER_DIR}}', '<ledger-dir>').replaceAll('{{INTEGRATION_BRANCH}}', '<integration-branch>');
// The LOG.md commands a document publishes, each a code span on ONE line, never re-typed here.
function logCommands(file) {
  const spans = [...read(file).matchAll(/`([^`\n]+)`/g)].map(m => LOG_PLACEHOLDERS(m[1]));
  const one = (what, test) => {
    const found = spans.filter(test);
    assert.ok(found.length <= 1, file + ': publishes more than one ' + what + ' command');
    return found[0];
  };
  return { append: one('append', s => s.startsWith('(cat -- "<findings file>"')),
    recover: one('recovery', s => s.startsWith('git show ') && s.includes('/LOG.md |')),
    join: one('join', s => s.startsWith('(cat -- "<reviewer file>"')) };
}
const publishedAppend = () => {
  const { append } = logCommands(PROMPTS);
  assert.ok(append && append.endsWith(' >> <ledger-dir>/LOG.md'), 'subagent-prompts.md publishes one append command, onto LOG.md: ' + append);
  return append;
};
const FORWARD = /\bforward(?:s|ed|ing)?\b(?!\s+slash)/gi;
// "pass" is a noun here as often as a verb (a polish pass, a `pass` verdict), so it counts
// only with an object after it; "shared", "sent" and "given" stay out, because live prose
// uses them otherwise ("shared validation reports", "the fence check sent the implementer
// back", "a fresh reviewer given only the diff").
const HAND_ON = /(?:\b(?:hand|send|give)(?:s|ed|ing)?\b(?!-)|\b(?:provid(?:e|es|ed|ing)|suppl(?:y|ies|ied|ying)|shar(?:e|es|ing))\b|\bpass(?:es|ed|ing)?\s+(?:the|its|a|an|that|this|on)\b)(?=[^.;:]*\b(?:reports?|findings|ASKs?|path)\b(?!['’]))/gi;
// Resume and point hand findings on only when the findings are their object: "resume … with
// the pointer" and "point at the backlog" are the rendered-prompt rule and ordinary prose.
const WITH_OR_AT = /\b(?:resum(?:e|es|ed|ing)\b[^.;:]*?\bwith|point(?:s|ed|ing)?\b[^.;:]*?\b(?:at|to))\s+(?:(?:the|its|that|their|both|a|an)\s+)?(?:[\w'’-]+\s+){0,2}?(?:findings|ASKs?|reports?)\b(?!['’])(?![^.;:]{0,40}\bfrom\s+(?:the\s+)?(?:committed\s+)?LOG\.md)/gi;
const APPEND_NEGATOR = /\b(?:never|not|no|none|nothing|cannot|nor|without|skip\w*|omit\w*|avoid\w*|\w+n['’]t)\b/i;
const ORDER_WORD = /\b(?:before|after|already|having)\b/i;
const clauseStart = (block, at) => { let start = 0; for (const m of block.slice(0, at).matchAll(/[.;:]\s/g)) start = m.index + m[0].length; return start; };
const clauseEnd = (block, at) => { const m = /[.;:](?=\s|$)/.exec(block.slice(at)); return m ? at + m.index + 1 : block.length; };
function appendAt(block, append) {
  for (let at = block.indexOf(append); at !== -1; at = block.indexOf(append, at + 1)) {
    if (!APPEND_NEGATOR.test(block.slice(clauseStart(block, at), at))) return at;
  }
  return -1;
}
function forwardFaults(text, append = publishedAppend()) {
  const faults = [];
  for (const block of LOG_PLACEHOLDERS(text).split(/\n[ \t]*\n|\n(?=[ \t]*(?:[-*]|\d+\.) )/).map(collapse)) {
    const hits = [...(/findings/i.test(block) ? block.matchAll(FORWARD) : []), ...block.matchAll(HAND_ON), ...block.matchAll(WITH_OR_AT)];
    if (!hits.length) continue;
    const at = appendAt(block, append);
    // The append's clause runs from the boundary before it to the first boundary AFTER the whole
    // command, so punctuation inside the command never cuts the order-word window short.
    const from = at === -1 ? 0 : clauseStart(block, at), to = at === -1 ? 0 : clauseEnd(block, at + append.length);
    const reordered = at !== -1 && ORDER_WORD.test(block.slice(from, to));
    for (const m of hits) {
      if (at === -1 || m.index < at || (reordered && m.index >= from && m.index < to)) faults.push(block.slice(Math.max(0, m.index - 60), m.index + 40));
    }
  }
  return faults;
}
const agentDefinitions = () => fs.readdirSync(path.join(ROOT, '.claude/agents')).filter(n => n.endsWith('.md')).map(n => '.claude/agents/' + n);
test('the LOG append precedes forwarding wherever forwarding is stated', () => {
  const APPEND = publishedAppend();
  assert.equal(forwardFaults('Forward the findings file to the implementer.').length, 1);
  assert.equal(forwardFaults('Forward the findings path, then run `' + APPEND + '`.').length, 1);
  assert.deepEqual(forwardFaults('Run `' + APPEND + '`, then forward the findings path.'), []);
  assert.equal(forwardFaults('- Run `' + APPEND + '` for the findings.\n- Forward the findings path.').length, 1, 'an append in another list item does not count');
  // Round 2's plants: a negated append, an append aimed away from LOG.md, and the skill's own
  // verbs handing findings on before the append.
  for (const planted of ['- Never run `' + APPEND + '` for a polish pass; forward the findings path to the implementer at once.',
    '- Do not run `' + APPEND + '` for a polish pass; forward the findings path.',
    '- Run `' + APPEND.replace('<ledger-dir>/LOG.md', '<scratchpad>/notes.md') + '`, then forward the findings path.',
    '- Resume the implementer with the findings path, then append the file to LOG.md.',
    '- Point the fix round at the round-1 findings file, and append it to LOG.md afterwards.']) {
    assert.equal(forwardFaults(planted).length, 1, 'must be reported: ' + planted);
  }
  // Round 3's plants: the rule reversed inside its own sentence by an order word, a negation
  // two words from the verb, and the verbs the closed list lacked.
  for (const planted of ['The orchestrator appends the findings file — `' + APPEND + '` — and commits it with the PROGRESS update, having already forwarded the path.',
    'Every findings file reaches LOG.md — `' + APPEND + '` — committed with the PROGRESS update, its path forwarded before the append.',
    "Findings in LOG.md under the row's heading: every findings file reaches LOG.md first — `" + APPEND + '` in Git Bash — committed with the PROGRESS update, its path forwarded before the append to the polish, fix-round or round-2 prompt.',
    '- Before running `' + APPEND + '`, forward the findings path to the implementer.',
    '- Run `' + APPEND + '` only after forwarding the findings path to the implementer.',
    "- Don't ever run `" + APPEND + '` for a polish pass; forward the findings path to the implementer at once.',
    '- Point the fix round to the round-1 findings file, and append it to LOG.md afterwards.',
    '- Provide the findings path to the implementer, then append the file to LOG.md.']) {
    assert.ok(forwardFaults(planted).length >= 1, 'must be reported: ' + planted);
  }
  // An order word in a LATER clause is not about the append: this is the recovery rule itself.
  assert.deepEqual(forwardFaults('Run `' + APPEND + '` first; the recovery exits non-zero unless the heading occurs once, and only after a zero exit is that path forwarded.'), []);
  // The other verbs, written as prose an author would use, not read off the pattern.
  for (const handing of ["Hand the reviewer's report path to the implementer, then append it to LOG.md.",
    'Pass the findings file to the fix round.', 'Send the ASK list to the implementer.', 'Give the implementer the round-1 report.',
    'The orchestrator hands the report on to the implementer.', 'Resume the implementer with its ASK list.',
    'Point the fresh reviewer at the round-1 report.', 'Resumed with both findings files, the implementer fixes each.',
    'Share the findings file with the fresh reviewer.', 'Supply the round-1 report to the fix round.']) {
    assert.equal(forwardFaults(handing).length, 1, 'must be reported: ' + handing);
    assert.deepEqual(forwardFaults('Run `' + APPEND + '` first. ' + handing), [], 'after the append it is allowed: ' + handing);
  }
  assert.deepEqual(forwardFaults('Every test must pass before the batch integrates. Use forward slashes in a path. '
    + 'A polish pass (ASK list in LOG.md) closes it. Verdicts: **pass** · **fail** with the findings. At hand-over preserve the report path. Its last line gives your report\'s exact line 2. '
    + "Round in flight → resume the implementer (fresh) with that round's findings from LOG.md; not a round. "
    + 'Resume the implementer with the pointer to its rendered `polish` prompt (the findings file by path). '
    + 'Spawn or resume the agent with this ONE fixed pointer message, `<prompt file>` replaced by that path. '
    + 'Asked to resume a COMPLETE ledger → reconcile, report completion, point at the backlog.'), [],
    'passing tests, a polish pass, a hand-over, forward slashes, findings read back from LOG.md and a pointer are not handing findings on');
  assert.equal(forwardFaults('Pass on the findings path to the fix round.').length, 1);
  let forwards = 0;
  for (const file of [...documents(), ...agentDefinitions()]) {
    const text = read(file);
    assert.deepEqual(forwardFaults(text), [], file + ': findings forwarded without the LOG append first');
    if (/findings/i.test(text)) forwards += [...text.matchAll(/\bforward(?:s|ed|ing)?\b/gi)].length;
  }
  for (const file of [TEMPLATE, 'orchestrate/references/protocol.md', PROMPTS]) {
    const text = collapse(LOG_PLACEHOLDERS(read(file)));
    assert.ok(text.includes(APPEND) && /never re-typed through (?:its own|the orchestrator's) context/.test(text), file + ': states the byte-for-byte LOG append');
    assert.ok(/\bforward(?:s|ed|ing)?\b/.test(text), file + ': states the forwarding the append must precede');
  }
  assert.ok(forwards >= 3);
});

// Directives that would reinstate pasting for a rendered role, or give a gate agent a second
// write. Clause-level, negation-aware (the same reader as the undo sweep above).
// The first family replaced the old `paste, don't point` pattern and is its superset: the
// old specimen is still its specimen.
const RENDERED_ROLE = String.raw`\b(?:implementer|reviewer|test[- ]hunter|polish|fix[- ]round|round[- ]2)\b`;
const REINSTATE = [
  ['pointing forbidden', /\b(?:never|don['’]t|do not)\s+point\b/i, "Paste, don't point: the batch text goes into the prompt."],
  ["a rendered role's skeleton pasted", new RegExp(RENDERED_ROLE + String.raw`[^.;:]*\bpast(?:e|es|ed|ing)\b|\bpast(?:e|es|ed|ing)\b[^.;:]*` + RENDERED_ROLE, 'i'),
    'Fill the reviewer skeleton from the ledger and paste it into the Agent call'],
  ['findings handed over verbatim', /\b(?:findings|ASK list|ASKs)\b[^.;:]{0,30}\bverbatim\b/i, 'Resume the SAME implementer with the findings verbatim'],
  ['a rendered prompt or findings pasted', /\bpast(?:e|es|ed|ing)\b[^.;:]*\b(?:rendered|prompt file|batch text|contract excerpts|findings|ASK list)\b/i, 'Paste the rendered prompt into the spawn call'],
  ['findings relayed through the context', /\b(?:relay|re-?typ|restat)\w*\b[^.;:]*\bfindings\b/i, "Relay the reviewer's findings to the implementer"],
  ['a gate agent licensed to write more', /\b(?:reviewer|test[- ]hunter|gate agents?)\b[^.;:]*\b(?:may|can|should|also)\s+(?:write|edit|create|modify)\b/i, 'The test hunter may also write a scratch file for each mutation'],
  ['a second file for a gate agent', /\b(?:reviewer|test[- ]hunter|gate agents?)\b[^.;:]*\b(?:second|another|additional|extra|other)\s+(?:file|write)s?\b/i, 'The reviewer keeps a second file with its raw notes'],
];
const reinstating = text => clauses(text).flatMap(c => REINSTATE.filter(([, p]) => fires(p, c)).map(([name]) => name + ' — ' + c));
test('no shipped text reinstates pasting for a rendered role or a second write for a gate agent', () => {
  assert.equal(new Set(REINSTATE.map(r => r[0])).size, REINSTATE.length);
  for (const [name, pattern, specimen] of REINSTATE) {
    assert.deepEqual(REINSTATE.filter(([, p]) => p.test(specimen)).map(r => r[0]), [name], name + ': its specimen must be caught by it alone');
    assert.equal(reinstating(specimen + '.').length, 1, name);
  }
  // Written as prose, not read off the patterns.
  for (const planted of ['Polish pass: resume the implementer with the ASK list verbatim.', 'Paste the batch text and contract excerpts into the prompt.',
    'Paste the findings into the fix-round message.', 'Relay the round-1 findings to the fresh reviewer.', 'The reviewer can write its notes into the worktree.',
    'Gate agents may also create a summary file.', 'The test hunter keeps another file for surviving mutants.',
    'Fill the reviewer skeleton from the ledger and paste it into the Agent call; never point an agent at a file.',
    'Paste the polish prompt into SendMessage.', 'The implementer skeleton is pasted in full.', 'Do not point the test hunter at a file.']) {
    assert.ok(reinstating(planted).length >= 1, 'must be reported: ' + planted);
  }
  assert.deepEqual(reinstating(CARVE_OUT + ' Findings travel by path, never re-typed through its own context. '
    + 'When the renderer is unavailable or refuses, the manual procedure is the skeleton filled by hand and pasted without its nonce line. '
    + 'The QA runner, artifact proofer, pre-flight, convergence and fix-up skeletons are always filled and pasted and carry NO nonce.'), [],
  'the rules themselves are not reinstatements');
  const files = [...documents(), ...agentDefinitions()];
  assert.ok(files.includes(PROMPTS) && files.includes('.claude/agents/reviewer.md') && files.includes('.claude/agents/test-hunter.md'));
  for (const file of files) assert.deepEqual(reinstating(read(file)), [], file);
});

// The user's decision (2026-09-23): the gate pair gets the Write tool, scoped to the findings
// file plus validation logs and disposable scratch under the session scratchpad, never a
// worktree or the repository. Stated once per gate skeleton and once per definition.
const CARVE_OUT = 'write your full report with the Write tool to "[FINDINGS_FILE]"; besides that ONE file you write only validation logs and disposable scratch under "[SCRATCHPAD_PATH]", never inside any worktree or the repository.';
const EXCEPTION = 'Keep to reading files and read-only git, with one exception: with the Write tool you write the findings file your prompt names, and validation logs and disposable scratch under the session scratchpad — never inside any worktree or the repository.';
// The test hunter's grant within that one (B05): a closed list — its findings file, its mutations
// file and its scoped spec — plus the two harness tools, which write only disposable clones. The
// skeleton states it as its carve-out; the definition keeps EXCEPTION verbatim and narrows it.
const HUNTER_WRITES = 'your mutations file and your scoped spec';
const HUNTER_TOOLS = 'running mutate.mjs and run-at-ref.mjs, which write only disposable clones and their logs, is permitted.';
const HUNTER_CARVE_OUT = 'write your full report with the Write tool to "[FINDINGS_FILE]"; besides that ONE file you write only ' + HUNTER_WRITES
  + ', both under "[SCRATCHPAD_PATH]", never inside any worktree or the repository, and ' + HUNTER_TOOLS;
const HUNTER_LIST = 'Those writes are a closed list: the findings file, ' + HUNTER_WRITES + ', all under the session scratchpad, and ' + HUNTER_TOOLS;
const GRANTS = { reviewer: CARVE_OUT, 'test-hunter': HUNTER_CARVE_OUT };
const CAVEAT = 'Write and Bash can still write, so "read-only" stays partly conventional; withholding Edit closes the easy path, not every path.';
// Each gate skeleton's own read-only sentence, reconciled with the grant (round-2 hunter note):
// it names the Write tool only as the OUTPUT carve-out scopes it.
const GATE_READ_ONLY = {
  reviewer: 'You did not write this code. Use only Read/Grep/Glob and read-only git (diff, log, show, status), and the `Write` tool only for what OUTPUT below names. You never edit a file.',
  'test-hunter': 'Use only Read/Grep/Glob and read-only git, and the `Write` tool only for what OUTPUT below names; edit nothing.',
};
// The reviewer's one directive naming a worktree as a place: where to work, not where to write.
const WHERE_TO_WORK = "Work in the batch's worktree at [WORKTREE_PATH] (checked out on [BATCH_BRANCH]).";
// The location family rejects on doubt, so its negation is read over the clause: a negator
// earlier in it governs the location unless a comma, a conjunction or a negative verb breaks
// its scope ("never skip saving … in the worktree" licenses), and "nothing but/except" licenses.
const LOCATION_NEGATOR = /\b(?:never|not(?!\s+(?:only|just|merely|simply)\b)|no|none|nothing(?!\s+(?:but|except|besides|beyond|other than|save|apart from)\b)|cannot|nor|\w+n['’]t)\b/gi;
const SCOPE_BREAK = /,|\b(?:and|then|but|or|so|also)\b|\b(?:skip|omit|neglect|forg[eo]t|fail|avoid|hesitat)\w*/i;
function negatedLocation(clause, at) {
  const before = clause.slice(0, at);
  let end = -1;
  for (const m of before.matchAll(LOCATION_NEGATOR)) end = m.index + m[0].length;
  return end !== -1 && !SCOPE_BREAK.test(before.slice(end));
}
// Any further write, subject-free, in five families that each own a specimen no other family
// catches. The grants above, and the reviewer's where-to-work line, are removed as their EXACT
// text before the sweep — never by the sentence that holds them — so a licence appended inside
// a grant's own sentence is swept. "<verb> nothing" is a prohibition and "<verb> nothing
// but/except …" a licence; code spans name tools, not acts. The last family needs no verb at
// all: it flags putting anything in a worktree, the repository or a branch.
const WRITE_LICENCES = [
  ['a write verb', /\b(?:write|writes|writing|save|saves|saving|keep|keeps|keeping|store|stores|storing|create|creates|creating|copy|copies|copying|edit|edits|editing|modify|modifies|modifying|record|records|recording|dump|dumps|dumping|append|appends|appending|put|puts|putting|leave|leaves|leaving|move|moves|moving|rename|renames|renaming|delete|deletes|deleting|remove|removes|removing|update|updates|updating|stage|stages|staging|push|pushes|pushing|touch|touches|touching)\b(?!\s+nothing\b)/i,
    'Save each mutation script under the session scratchpad too.'],
  ['a write in the passive', /\b(?:is|are|was|were|be|been|being|gets?|got)\s+(?:(?:also|then|only|each|all|now|still|first)\s+)?(?:written|saved|kept|stored|created|copied|edited|modified|recorded|dumped|appended|committed|placed|put|left|moved|renamed|deleted|removed|updated|staged|pushed|touched|added)\b/i,
    'Mutation scripts are written beside the tests.'],
  ['a commit or an addition', /\b(?:commit|commits|committing|add|adds|adding)\s+(?:the|your|a|an|each|every|any|all|this|that|these|those|it|them|its|their)\b/i,
    'Add a regression test for each finding.'],
  ['nothing but, or nothing except', /\b(?:write|writes|edit|edits|modify|modifies|change|changes|touch|touches|create|creates|save|saves|keep|keeps)\s+nothing\s+(?:but|except|besides|beyond|other than|save|apart from)\b/i,
    'Modify nothing except the tests you judge vacuous, which you then fix in place.'],
  ['a place in a worktree, the repository or a branch', /\b(?:in|into|inside|within|under|to|onto|beside|at)\s+(?:(?:the|a|an|any|your|its|this|that|each|every|one)\s+)?(?:[\w'’-]+\s+){0,2}?(?:worktrees?|repository|repositories|repos?|branch(?:es)?|checkouts?)\b/i,
    'Mutation scripts go in the worktree.', negatedLocation],
];
const licenceHit = ([, pattern, , negated], clause) => negated
  ? [...clause.matchAll(new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, '') + 'g'))].some(m => !negated(clause, m.index))
  : fires(pattern, clause);
const withoutGrants = text => [CARVE_OUT, HUNTER_CARVE_OUT, EXCEPTION, HUNTER_LIST, CAVEAT, WHERE_TO_WORK].reduce((rest, grant) => rest.split(grant).join(' '), collapse(text.replace(/`[^`\n]*`/g, ' ')));
const writeLicences = text => clauses(withoutGrants(text)).flatMap(c => WRITE_LICENCES.filter(entry => licenceHit(entry, c)).map(([name]) => name + ' — ' + c));
// Every "use only …" tool line in a gate text carries the Write carve-out, in any spelling of the tool list.
const USE_ONLY_CARVE_OUT = 'and the `Write` tool only for what OUTPUT below names';
const useOnlyFaults = text => collapse(text).split(/(?<=[.!?])\s+/).filter(s => /\buse only\b/i.test(s) && !s.includes(USE_ONLY_CARVE_OUT));
const gateBlocks = () => fencedBlocks(read(PROMPTS)).filter(b => ['prompt:reviewer', 'prompt:round-2', 'prompt:test-hunter'].includes(b.info)).map(b => b.lines.join('\n'));
const definitionBody = file => read(file).replace(/^---\n[\s\S]*?\n---\n/, '');
test('each gate skeleton and definition grants the one scoped write, and no text grants another', () => {
  const doc = collapse(read(PROMPTS));
  for (const grant of Object.values(GRANTS)) assert.equal(doc.split(grant).length - 1, 1, 'each gate skeleton\'s carve-out is stated once in the skeletons: ' + grant);
  assert.ok(!CARVE_OUT.includes(HUNTER_CARVE_OUT) && !HUNTER_CARVE_OUT.includes(CARVE_OUT), 'neither carve-out counts as the other');
  for (const [from, to, heading] of [['## Reviewer (the gate', '## Test hunter', 'reviewer'], ['## Test hunter (optional', '## QA runner', 'test-hunter']]) {
    const skeleton = collapse(section(read(PROMPTS), from, to));
    assert.equal(skeleton.split(GRANTS[heading]).length - 1, 1, from + ': its carve-out exactly once');
    assert.ok(skeleton.includes('`### B[NN] R[ROUND] ' + heading + ' findings`'), from + ': the findings file is headed for LOG.md');
    assert.doesNotMatch(skeleton, /heredoc|<<'?EOF/i, from + ': findings are written with the Write tool, never a heredoc');
    // Its read-only sentence names the Write tool only as the carve-out scopes it, and no
    // "use only" line denying the grant survives beside it, however it spells the tools.
    assert.equal(skeleton.split(GATE_READ_ONLY[heading]).length - 1, 1, from + ': the reconciled read-only sentence, once');
    assert.deepEqual(useOnlyFaults(skeleton), [], from + ': a "use only" line that denies the Write grant');
  }
  // The use-only rule, armed: the old sentence, another spelling of the tools, and a modal form.
  for (const plant of ['Use only Read/Grep/Glob and read-only git; edit nothing.', 'Use only Read, Grep, Glob and read-only git.', 'You may use only the Read tool.']) {
    assert.equal(useOnlyFaults(plant).length, 1, 'must be reported: ' + plant);
  }
  assert.deepEqual(useOnlyFaults(Object.values(GATE_READ_ONLY).join(' ')), [], 'the reconciled sentences carry the carve-out');
  // The where-to-work exemption is the reviewer's live sentence, or it exempts nothing.
  assert.equal(collapse(section(read(PROMPTS), '## Reviewer (the gate', '## Test hunter')).split(WHERE_TO_WORK).length - 1, 1,
    'the reviewer skeleton states where to work once');
  for (const file of ['.claude/agents/reviewer.md', '.claude/agents/test-hunter.md']) {
    const text = collapse(read(file));
    assert.equal(text.split(EXCEPTION).length - 1, 1, file + ': the one exception, verbatim, once');
    assert.equal(text.split('exception').length - 1, 1, file + ': no second exception');
    assert.ok(text.includes(CAVEAT), file + ': the caveat for a Write-granted role');
    // The closed list narrows the hunter's exception directly after it, and is the hunter's alone.
    assert.equal(text.split(EXCEPTION + ' ' + HUNTER_LIST).length - 1, file.endsWith('test-hunter.md') ? 1 : 0, file + ': the closed list of hunter writes');
    assert.equal(text.split(HUNTER_LIST).length - 1, file.endsWith('test-hunter.md') ? 1 : 0, file);
  }
  // The old caveat and the old "no Write" claim survive nowhere.
  for (const file of [...documents(), ...agentDefinitions()]) {
    assert.doesNotMatch(collapse(read(file)), /removing Write\/Edit|read-only by construction/, file + ': the pre-grant wording');
  }
  // The write-licence sweep, armed. Each family owns its specimen: no other family catches it.
  assert.equal(new Set(WRITE_LICENCES.map(w => w[0])).size, WRITE_LICENCES.length);
  for (const [name, , specimen] of WRITE_LICENCES) {
    assert.deepEqual(WRITE_LICENCES.filter(([, p]) => p.test(specimen)).map(w => w[0]), [name], name + ': its specimen must be caught by it alone');
    assert.equal(writeLicences(specimen).length, 1, name + ': the sweep reports its specimen');
  }
  // The round-1 and round-2 plants, written as prose, not read off the patterns — the last two
  // widen a grant inside its own sentence, which exempting whole sentences let through.
  for (const plant of ['Also write each mutation copy to a scratch directory and keep it.', 'Save each mutation script under the session scratchpad too.',
    'Keep a copy of the diff in the worktree.', 'Record your notes beside the findings file.', "Append your notes to the ledger's LOG.md as well.",
    'Commit the mutation scripts to the batch branch.', 'Put each mutation script in the worktree.',
    'Mutation scripts are written into the worktree beside the tests.', 'Modify nothing except the tests you judge vacuous, which you then fix in place.',
    'OUTPUT: save every mutation copy inside the worktree, and ' + CARVE_OUT,
    'OUTPUT: save every mutation copy inside the worktree, and ' + HUNTER_CARVE_OUT, 'Also keep the mutated copies. ' + HUNTER_LIST,
    'The tool list withholds `Edit`, so the easiest route to a "helpful" change to the code simply is not there. Save mutation copies in the worktree; '
      + CAVEAT + ' ' + EXCEPTION,
    // Round 3's plants: writes no verb list names, and a double negative that licenses.
    'Place each mutation script in the worktree.', 'Generate a helper script inside the worktree.', 'Drop your notes into the repository.',
    'Mutation scripts go in the worktree.', 'Never skip saving your mutation scripts in the worktree.', 'Never skip saving your notes.']) {
    assert.ok(writeLicences(plant).length >= 1, 'must be reported: ' + plant);
  }
  // Must pass: the grants as their exact text, the reconciled read-only sentences, where to
  // work, and prohibitions, a location in a negated clause among them.
  assert.deepEqual(writeLicences('OUTPUT (fixed shape): ' + CARVE_OUT + ' OUTPUT: ' + HUNTER_CARVE_OUT + ' ' + EXCEPTION + ' ' + HUNTER_LIST + ' ' + CAVEAT + ' '
    + Object.values(GATE_READ_ONLY).join(' ') + ' ' + WHERE_TO_WORK + ' Edit nothing. Write nothing. The tool list withholds `Edit`. '
    + 'Never save a script in the worktree. Write nothing into the worktree. Do not put scripts in the worktree or the repository.'), []);
  const gateTexts = [...gateBlocks(), ...['.claude/agents/reviewer.md', '.claude/agents/test-hunter.md'].map(definitionBody)];
  assert.equal(gateTexts.length, 5, 'three gate blocks and two definitions');
  for (const text of gateTexts) assert.deepEqual(writeLicences(text), [], 'a gate text licenses a further write');
  // Second person with a modal, over the whole gate sections (prose included).
  const SECOND_PERSON = /\byou\b[^.;:]*\b(?:may|can|should|also)\s+(?:write|edit|create|modify|keep|save)\b/i;
  const licences = text => clauses(text).filter(c => fires(SECOND_PERSON, c));
  assert.equal(licences('You may also write a scratch file for each mutant.').length, 1);
  assert.equal(licences('You can save your notes in the worktree.').length, 1);
  assert.deepEqual(licences('You edit nothing. ' + CARVE_OUT + ' ' + EXCEPTION + ' ' + HUNTER_CARVE_OUT + ' ' + HUNTER_LIST), []);
  for (const text of [section(read(PROMPTS), '## Reviewer (the gate', '## Test hunter'), section(read(PROMPTS), '## Test hunter (optional', '## QA runner'),
    ...['.claude/agents/reviewer.md', '.claude/agents/test-hunter.md'].map(read)]) {
    assert.deepEqual(licences(text), [], 'a gate text licenses a further write');
  }
});

// ===== The test hunter proves each mutation with the harness (B05) ==========================
// The hunter no longer builds its own apparatus: it hands mutate.mjs a mutations file and a
// validate spec scoped to the batch's tests, cites the tool's lines, and reports any line that
// means the proof did not run as exactly that. The list of such lines is the tool's own export.
const HUNTER_SECTION = () => section(read(PROMPTS), '## Test hunter (optional', '## QA runner');
const MUTATE_COMMAND = 'node "[SKILL_DIR]/tools/mutate.mjs" --repo "[WORKTREE_PATH]" --ref HEAD --mutations "<mutations file>" --validate "<scoped spec>" --log "[SCRATCHPAD_PATH]/<label>.log"';
const SETUP_CLAUSE = 'adding `--setup "[WORKTREE_PATH]/[LEDGER_DIR]/setup.json"` when that file exists';
const mutateTool = () => import(require('node:url').pathToFileURL(path.join(ROOT, 'orchestrate/tools/mutate.mjs')).href);
test('the test hunter proves each mutation with mutate.mjs on a scoped spec, and reports a proof that did not run as such', async () => {
  const hunter = collapse(HUNTER_SECTION());
  assert.equal(hunter.split('`' + MUTATE_COMMAND + '`').length - 1, 1, 'the harness command, once, as one code span');
  for (const needed of ["each finding's mutation is also proven by running it with the mutation harness.",
    'Never build a scratch tree, a mutation script or a restore of your own by hand.',
    'Your mutations file is `{ "mutations": [ { "id": "m1", "file": "<repo-relative path>", "find": "<text occurring exactly once>", "replace": "<text>" } ] }`',
    'your scoped spec is `[LEDGER_DIR]/validate.json` narrowed to the test files the batch added or changed',
    SETUP_CLAUSE + ' (a repository with a setup step fails its control without it).',
    // node --test skips a named file that does not exist and still passes: only the count shows it.
    'Its `CONTROL PASS` line must count the tests you scoped: a runner may skip a named test file that does not exist.',
    "means the proof did not run — say so, never offer it as a finding's proof.",
    'For a suite at another ref, `node "[SKILL_DIR]/tools/run-at-ref.mjs"` takes the same flags less `--mutations` and prints one line, `AT <short sha> <validate.mjs line>`.',
    'Beyond those, run only the two harness tools PROOF below names, which work on disposable clones.']) {
    assert.ok(hunter.includes(needed), 'the hunter skeleton must say: ' + needed);
  }
  // SURVIVED proves, KILLED refutes, and every other kind the tool declares means "did not run".
  const { RESULTS, NOT_RUN } = await mutateTool();
  const cite = /Cite its lines: (.*?) means the proof did not run/.exec(hunter);
  assert.ok(cite, 'the hunter skeleton cites the tool\'s lines');
  const named = [...cite[1].matchAll(/`([A-Z][A-Z -]*[A-Z])(?: <[^`]*)?`/g)].map(m => m[1]);
  assert.deepEqual(named.slice(0, 2), ['SURVIVED', 'KILLED']);
  assert.deepEqual(RESULTS.slice().sort(), named.slice(0, 2).sort(), 'the two results are the tool\'s');
  assert.deepEqual(named.slice(2).sort(), NOT_RUN.slice().sort(), 'every line kind the tool declares as not-run, and no other');
  assert.ok(NOT_RUN.length >= 8, 'the declared list was really read');
  // The flags the skeleton publishes are the ones the real tools document.
  for (const [tool, flags] of [['mutate.mjs', ['--repo', '--ref', '--mutations', '--validate', '--log', '--setup']], ['run-at-ref.mjs', ['--repo', '--ref', '--validate', '--log', '--setup']]]) {
    const help = spawnSync(process.execPath, [path.join(ROOT, 'orchestrate/tools', tool), '--help'], { encoding: 'utf8', windowsHide: true });
    assert.equal(help.status, 0, tool);
    const synopsis = help.stdout.split('\n')[0];
    for (const flag of flags) assert.ok(synopsis.includes(flag + ' <'), tool + ' documents ' + flag);
    assert.ok(!synopsis.includes('--mutations') || tool === 'mutate.mjs', 'run-at-ref takes the same flags less --mutations');
  }
});

test("the hunter's harness command runs as published, filled from its slots, with and without its --setup clause", t => {
  const { repo, temp, env, SKILL_DIR } = fixture(t);
  const scratch = path.join(temp, 'session scratch'), tmpRoot = path.join(temp, 'temp root');
  fs.mkdirSync(scratch); fs.mkdirSync(tmpRoot);
  repo.write('math.cjs', '// Adds two numbers.\nexports.add = (a, b) => a + b;\n');
  repo.write('math.test.cjs', "const test = require('node:test');\nconst assert = require('node:assert/strict');\nconst { add } = require('./math.cjs');\ntest('add sums two numbers', () => { assert.equal(add(2, 3), 5); });\n");
  // setup.json where the skeleton points: it makes a test file only a set-up checkout has.
  repo.write(LEDGER_DIR + '/setup.json', JSON.stringify({ steps: [{ name: 'gen', argv: [process.execPath, '-e',
    "require('fs').writeFileSync('gen.test.cjs', \"require('node:test')('made by setup', () => {});\")"], parser: 'none' }] }));
  repo.commit('fixture');
  const scratchFile = (name, value) => { const f = path.join(scratch, name); fs.writeFileSync(f, JSON.stringify(value)); return slash(f); };
  const muts = scratchFile('muts.json', { mutations: [{ id: 'm1', file: 'math.cjs', find: 'a + b', replace: 'a - b' },
    { id: 'm2', file: 'math.cjs', find: '// Adds two numbers.', replace: '// Adds numbers.' }] });
  const hunter = collapse(HUNTER_SECTION());
  const published = /`(node "\[SKILL_DIR\]\/tools\/mutate\.mjs"[^`]*)`/.exec(hunter)[1];
  const setupFlag = /adding `(--setup "[^`]*")` when that file exists/.exec(hunter)[1];
  assert.equal(published, MUTATE_COMMAND);
  const fill = (text, spec, label) => [['[SKILL_DIR]', SKILL_DIR], ['[WORKTREE_PATH]', slash(repo.cwd)], ['[SCRATCHPAD_PATH]', slash(scratch)],
    ['[LEDGER_DIR]', LEDGER_DIR], ['<mutations file>', muts], ['<scoped spec>', spec], ['<label>', label]]
    .reduce((out, [token, value]) => out.split(token).join(value), text);
  const runEnv = { ...env, TEMP: tmpRoot, TMP: tmpRoot, TMPDIR: tmpRoot };
  const specOf = (name, files) => scratchFile(name, { steps: [{ name: 'tests', argv: [process.execPath, '--test', ...files], parser: 'node' }] });
  for (const [label, command, total] of [['bare', fill(published, specOf('scoped.json', ['math.test.cjs']), 'bare'), '1/1'],
    ['set-up', fill(published + ' ' + setupFlag, specOf('scoped-gen.json', ['math.test.cjs', 'gen.test.cjs']), 'set-up'), '2/2']]) {
    assert.doesNotMatch(command, /\[[A-Z_]+\]|<[a-z ]+>/, label + ': every slot and placeholder is filled');
    const r = runCommand(command, temp, runEnv);
    const out = r.stdout.trimEnd().split('\n');
    assert.match(out[0], new RegExp('^CONTROL PASS PASS tests ' + total + ' \\(\\d+s\\)$'), label + ': ' + r.stdout + r.stderr);
    assert.deepEqual(out.slice(1), ['KILLED m1: add sums two numbers', 'SURVIVED m2', 'MUTATE 1 killed, 1 survived, 0 other'], label);
    assert.equal(r.status, 1, label);
    assert.ok(fs.statSync(path.join(scratch, label + '.log')).size > 0, label + ': the log lands where the command names it');
    assert.deepEqual(fs.readdirSync(tmpRoot), [], label + ': the disposable clone is gone');
  }
});

// Directives that would put hand-built apparatus back in the hunter's hands, swept over its
// skeleton section and its definition only: temporary worktrees are legitimately described
// elsewhere (the failing-on-base check, the merge dry run). Clause-level, negation-aware — the
// undo sweep's reader — and code spans are tool names, not directives.
const HAND_BUILT = [
  ['a scratch tree built by hand', /\b(?:build|builds|building|make|makes|making|set up|sets up|setting up|prepare|prepares|preparing|clone|clones|cloning|copy|copies|copying|create|creates|creating)\b[^.;:]*\b(?:scratch|temporary|temp|throwaway|spare|separate)\s+(?:trees?|copies|copy|worktrees?|checkouts?|clones?|director(?:y|ies)|dirs?|folders?)\b/i,
    'Build a scratch tree for each mutation and run the suite there.'],
  ['an edit script', /\b(?:write|writes|writing|generate|generates|generating|create|creates|creating|author|authors|authoring|use|uses|using|run|runs|running)\b[^.;:]*\b(?:edit|mutation|patch|sed|replace|rewrite)\s+scripts?\b/i,
    'Generate an edit script that swaps the operator for each mutation.'],
  ['a restore with git checkout', /\b(?:restor|revert|reset|undo)\w*\b[^.;:]*\bgit\s+(?:checkout|restore|reset|stash)\b|\bgit\s+(?:checkout|restore|reset|stash)\b[^.;:]*\b(?:restor|revert|undo)\w*/i,
    'Restore each mutated file with git checkout before the next one.'],
];
// Written as prose first, then pinned: each family owns entries no other family catches.
const HAND_BUILT_CORPUS = [
  'Copy the worktree to a temporary directory and mutate the copy there.',
  'Make a throwaway clone of the batch branch for every mutation you try.',
  'Set up a scratch checkout under the session scratchpad and apply each edit there.',
  'Write a sed script that applies each mutation, then run the tests.',
  'Use a small patch script to flip each comparison in turn.',
  'After each run, restore the file with git checkout.',
  'Revert the mutation with git restore before trying the next.',
  'Run git stash after each mutation to undo it.',
];
const handBuilt = text => clauses(text.replace(/`[^`\n]*`/g, ' ')).flatMap(c => HAND_BUILT.filter(([, p]) => fires(p, c)).map(([name]) => name + ' — ' + c));
test('no hunter text tells it to build a scratch tree, write an edit script or restore with git checkout', () => {
  assert.equal(new Set(HAND_BUILT.map(h => h[0])).size, HAND_BUILT.length);
  for (const [name, pattern, specimen] of HAND_BUILT) {
    assert.deepEqual(HAND_BUILT.filter(([, p]) => p.test(specimen)).map(h => h[0]), [name], name + ': its specimen must be caught by it alone');
    assert.equal(handBuilt(specimen).length, 1, name + ': the clause reader reports its specimen');
  }
  assert.equal(HAND_BUILT_CORPUS.length, 8, 'the corpus keeps all eight spellings');
  assert.equal(new Set(HAND_BUILT_CORPUS).size, 8);
  const families = entry => [...new Set(handBuilt(entry).map(hit => hit.split(' — ')[0]))];
  for (const entry of HAND_BUILT_CORPUS) assert.ok(families(entry).length >= 1, 'the sweep no longer catches: ' + entry);
  assert.deepEqual([...new Set(HAND_BUILT_CORPUS.flatMap(families))].sort(), HAND_BUILT.map(h => h[0]).sort(), 'the corpus exercises every family and names no other');
  for (const [name] of HAND_BUILT) assert.ok(HAND_BUILT_CORPUS.some(entry => families(entry).join() === name), name + ': no corpus entry is caught by this family alone');
  // A negation governs only the directive right after it; one elsewhere in the clause exempts nothing.
  assert.deepEqual(handBuilt('Never build a scratch tree, a mutation script or a restore of your own by hand. Never restore a file with git checkout. Do not write an edit script.'), []);
  assert.equal(handBuilt('Do not pipe the output, and build a scratch tree for each mutation.').length, 1);
  const texts = [HUNTER_SECTION(), definitionBody('.claude/agents/test-hunter.md')];
  for (const text of texts) {
    assert.deepEqual(handBuilt(text), [], 'a hunter text directs hand-built apparatus');
    // Live control: the swept text is really read — an appended specimen is reported.
    assert.equal(handBuilt(text + '\n\n' + HAND_BUILT[0][2]).length, 1);
  }
});

test('protocol.md says, one sentence apiece, what mutate.mjs and the mutation runner do', () => {
  // The template's pair is pinned with its passage in PINNED; protocol.md's sits under Gate agents.
  const gate = collapse(section(read('orchestrate/references/protocol.md'), '- **Gate agents**', '- **QA runner**'));
  for (const sentence of ["A test hunter proves each mutation it chooses itself with the skill's `mutate.mjs`, on a disposable clone of the batch's commit.",
    "The contract's mutation runner, when it names one, is a different tool: an optional sweep of the batch's changed files."]) {
    assert.ok(gate.includes(sentence), 'protocol.md §Roles must say: ' + sentence);
  }
});

// The rendered-prompt life cycle around a crash, a respawn and the rounds after the first.
test('recovery, respawn and later rounds work from rendered files and LOG.md, never from re-typed text', () => {
  const rules = collapse(section(read(PROMPTS), '## Spawning rules (orchestrator)'));
  const prompts = collapse(read(PROMPTS));
  // A findings file lost with the scratchpad comes back out of the committed LOG.md as lines,
  // heading through marker, or not at all (the commands themselves run in the next test). Lines,
  // not bytes: Git for Windows' awk drops the CR of a CRLF line, so no byte claim is made.
  const { recover } = logCommands(PROMPTS);
  assert.ok(recover, 'subagent-prompts.md publishes the recovery command');
  assert.ok(rules.includes('a findings file lost with the scratchpad is copied back out of the committed LOG.md, from its heading line up to its marker line, never re-typed — `'
    + recover + '` from Git Bash at the repository root, which restores those lines as committed (a CRLF line comes back LF under Git for Windows\' awk) and exits non-zero, writing nothing, unless the heading and its marker line each occur exactly once — and only after a zero exit is that path forwarded.'));
  for (const file of [PROMPTS, TEMPLATE, 'orchestrate/references/protocol.md']) {
    assert.doesNotMatch(collapse(read(file)), /restores (?:the|its|a) (?:findings )?file's bytes|restores (?:its|the|those) bytes/, file + ': the recovery restores lines, never a byte claim');
  }
  assert.ok(collapse(read(TEMPLATE)).includes('exits non-zero, writing nothing, unless its heading and marker line each occur exactly once, and only after a zero exit is that file forwarded'));
  for (const file of [TEMPLATE, 'orchestrate/references/protocol.md']) {
    assert.ok(collapse(read(file)).includes('a copy lost with the scratchpad is taken back out of the committed LOG.md, never re-typed'), file);
  }
  // Two files are joined with a newline between them, so no heading is glued to a last line.
  assert.ok(rules.includes('their files are joined byte-for-byte, a newline between them, into one (`' + logCommands(PROMPTS).join + '`) and that path is forwarded.'));
  // A crashed implementer is respawned with its implementer prompt before the resume pointer.
  assert.ok(rules.includes('an implementer with its rendered implementer prompt first, then the `polish` or `fix-round` pointer it was owed'));
  // The third round: two pointers, two nonces, the round number rendered, nothing told outside the pointer.
  assert.ok(prompts.includes('resumed with the pointer to a `fix-round` prompt rendered with `round` 3 and both rounds\' findings files joined into its findings file; each of the two reports carries its own nonce'));
  assert.doesNotMatch(prompts, /you own this batch now/, 'nothing can be told outside the fixed pointer');
  assert.ok(prompts.includes('("fix: batch [NN] round [ROUND] — <summary>")') && !/round 1 — <summary>/.test(prompts), 'the fix-round commit carries its own round');
  // The main-checkout variant cannot be rendered.
  assert.ok(prompts.includes('A rendered file takes no such edit, so this variant is always the manual procedure (§Spawning rules).'));
  // Who creates the gates directory, and a respawned gate agent never reuses a findings path.
  assert.ok(rules.includes('the orchestrator creates `<scratchpad>/gates/` before the spawn (the renderer creates its `--out`), and a gate agent respawned after a wrong nonce gets a new `findingsFile`'));
});

// ===== The LOG.md round trip, run as published =========================================
// Round 2 shipped a recovery command no test ran, and it failed silently three ways: a
// findings line shaped like a heading truncated the copy, a heading that matched nothing gave
// an empty file, and a file with no final newline glued the next heading onto its last line —
// each with exit 0. So the append, recovery and join commands are taken out of the documents
// as published, only their placeholders filled, and run by Git for Windows' own bash: the
// contract validates from PowerShell, whose PATH reaches WSL's launcher for `bash` and holds no
// awk (tests/validate.test.cjs:611-623). Every outcome is judged on whole bytes.
const GIT_BASH = process.platform !== 'win32' ? 'bash'
  : path.resolve(spawnSync('git', ['--exec-path'], { encoding: 'utf8' }).stdout.trim(), '..', '..', '..', 'usr', 'bin', 'bash.exe');
function bashEnv(env) {
  if (process.platform !== 'win32') return env;
  const out = { ...env }, keys = Object.keys(out).filter(k => k.toUpperCase() === 'PATH'), current = keys.length ? out[keys[0]] : '';
  for (const key of keys) delete out[key];
  return { ...out, PATH: [path.dirname(GIT_BASH), current].join(';') };
}
// The published text with its placeholders filled: every one of them, and nothing else.
function filledCommand(command, values) {
  const tokens = [...new Set([...command.matchAll(/<[A-Za-z][A-Za-z -]*>/g)].map(m => m[0]))].sort();
  assert.deepEqual(tokens, Object.keys(values).sort(), 'the placeholders filled are exactly the command\'s own: ' + command);
  return tokens.reduce((text, token) => text.split(token).join(values[token]), command);
}
// The recovery round 2 shipped: the control proving these cases can see the defects it had.
const ROUND2_RECOVER = "git show <integration-branch>:./<ledger-dir>/LOG.md | awk -v h='### B<NN> R<k> <role> findings' '$0 == h {p = 1; print; next} /^##?#? / {p = 0} p' > \"<findings file>\"";
test('the LOG.md append, recovery and join run as published: the exact bytes back, or a loud refusal', t => {
  const published = logCommands(PROMPTS);
  for (const [name, command] of Object.entries(published)) {
    assert.ok(command, 'subagent-prompts.md publishes the ' + name + ' command, on one line');
    assert.ok(![...command].some(c => c === '\\' || c.codePointAt(0) < 32 || c.codePointAt(0) === 127), name + ': no backslash and no control character');
  }
  // The template bakes the same append and recovery, protocol.md the same append: one command, three statements.
  const template = logCommands(TEMPLATE), protocol = logCommands('orchestrate/references/protocol.md');
  assert.equal(template.append, published.append); assert.equal(template.recover, published.recover);
  assert.equal(protocol.append, published.append);
  assert.ok(process.platform !== 'win32' || fs.existsSync(GIT_BASH), "Git for Windows' bash must be at " + GIT_BASH);

  const temp = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'log round trip '));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 }));
  const gates = path.join(temp, 'gate files'); fs.mkdirSync(gates);
  const file = name => slash(path.join(gates, name));
  const BRANCH = 'chore/tw-ledger', LOG = LEDGER_DIR + '/LOG.md';
  const marker = (k, role) => '=== end of B01 R' + k + ' ' + role + ' findings ===';
  const entry = (bytes, k, role) => bytes + '\n' + marker(k, role) + '\n';
  // The findings files, one case each, written here as prose under their own headings.
  const R1 = '### B01 R1 reviewer findings\nFIX FIRST\n1. P1 — a finding; this last line carries no newline';
  const H1 = '### B01 R1 test-hunter findings\nFINDINGS 3\n## Validation commands\n# a comment inside a quoted script\n### A heading quoted from a batch file\n';
  const R2 = '### B01 R2 reviewer findings\nSHIP\nP0=0 P1=0 ASK=0\n';
  const R3 = '### B01 R3 reviewer findings\nSHIP\n';
  // Entries that each reach one refusal alone: no marker (R4); an old markerless entry under
  // the heading a new one reuses (R5, only the heading count refuses it); a marker ahead of its
  // heading (R6, only the order check); a body quoting its own marker line (R7, only the marker count).
  const R4 = '### B01 R4 reviewer findings\nSHIP\n';
  const R5_OLD = '### B01 R5 reviewer findings\nOLD\n', R5 = '### B01 R5 reviewer findings\nNEW\n';
  const R6 = '### B01 R6 reviewer findings\nSHIP\n';
  const R7 = '### B01 R7 reviewer findings\nThe append closes each entry with a line such as\n' + marker('7', 'reviewer') + '\nwhich this report quotes.\n';
  for (const [name, bytes] of [['r1.md', R1], ['h1.md', H1], ['r2.md', R2], ['r3.md', R3], ['r5.md', R5], ['r7.md', R7]]) fs.writeFileSync(file(name), bytes);
  // Twice: LOG.md checked out LF, and CRLF under core.autocrlf=true, as this machine checks it out.
  for (const crlf of [false, true]) {
    const repo = makeRepo(t), env = bashEnv(repo.env), label = crlf ? 'CRLF checkout: ' : 'LF checkout: ';
    const bash = command => {
      const script = path.join(temp, 'step.sh');
      fs.writeFileSync(script, command + '\n');
      const r = spawnSync(GIT_BASH, [slash(script)], { cwd: repo.cwd, env, encoding: 'utf8', windowsHide: true, timeout: 60000 });
      assert.ifError(r.error); assert.equal(r.signal, null);
      return r;
    };
    const commit = message => { repo.git('-c', 'core.autocrlf=' + crlf, 'add', '--all'); repo.git('commit', '-m', message); };
    repo.git('switch', '-c', BRANCH);
    const base = '# Log — ' + LEDGER_ID + '\n\n## 2026-09-23 — session\n\n### B01\n\nThe row\'s own narrative.\n';
    repo.write(LOG, crlf ? base.replace(/\n/g, '\r\n') : base); commit('ledger');
    const append = (k, role, name) => {
      const r = bash(filledCommand(published.append, { '<findings file>': file(name), '<NN>': '01', '<k>': k, '<role>': role, '<ledger-dir>': LEDGER_DIR }));
      assert.equal(r.status, 0, label + 'append ' + name + ': ' + r.stderr);
    };
    const raw = bytes => fs.appendFileSync(path.join(repo.cwd, ...LOG.split('/')), bytes);   // not the published append
    append('1', 'reviewer', 'r1.md'); append('1', 'test-hunter', 'h1.md'); append('2', 'reviewer', 'r2.md');
    append('3', 'reviewer', 'r3.md'); append('3', 'reviewer', 'r3.md');   // one round's file appended twice
    raw(R4); raw(R5_OLD); append('5', 'reviewer', 'r5.md'); raw(marker('6', 'reviewer') + '\n' + R6); append('7', 'reviewer', 'r7.md');
    // A findings file that does not exist: a non-zero exit, and LOG.md's bytes untouched — no lone marker.
    const logPath = path.join(repo.cwd, ...LOG.split('/')), before = fs.readFileSync(logPath);
    const missing = bash(filledCommand(published.append, { '<findings file>': file('missing.md'), '<NN>': '01', '<k>': '8', '<role>': 'reviewer', '<ledger-dir>': LEDGER_DIR }));
    assert.notEqual(missing.status, 0, label + 'appending a findings file that does not exist must exit non-zero');
    assert.ok(fs.readFileSync(logPath).equals(before), label + 'appending a findings file that does not exist must leave LOG.md as it was');
    commit('findings');
    // Each file, a newline and its marker, in the committed LOG.md: no heading glued to a last line.
    const shown = spawnSync('git', ['show', BRANCH + ':./' + LOG], { cwd: repo.cwd, env: repo.env, encoding: 'utf8', windowsHide: true });
    assert.equal(shown.stdout, base + entry(R1, '1', 'reviewer') + entry(H1, '1', 'test-hunter') + entry(R2, '2', 'reviewer')
      + entry(R3, '3', 'reviewer') + entry(R3, '3', 'reviewer') + R4 + R5_OLD + entry(R5, '5', 'reviewer')
      + marker('6', 'reviewer') + '\n' + R6 + entry(R7, '7', 'reviewer'), label + 'the committed LOG.md');
    const recover = (k, role, out) => bash(filledCommand(published.recover,
      { '<integration-branch>': BRANCH, '<ledger-dir>': LEDGER_DIR, '<NN>': '01', '<k>': k, '<role>': role, '<findings file>': out }));
    // Heading-shaped lines, no final newline, and a clean control: each comes back byte-for-byte,
    // onto a target an earlier attempt left full of other bytes.
    const back = {};
    for (const [k, role, bytes] of [['1', 'reviewer', R1], ['1', 'test-hunter', H1], ['2', 'reviewer', R2]]) {
      const out = back[role + k] = slash(path.join(temp, (crlf ? 'crlf' : 'lf') + ' recovered R' + k + ' ' + role + '.md'));
      fs.writeFileSync(out, 'stale bytes an earlier attempt left here\n'.repeat(3));
      const r = recover(k, role, out);
      assert.equal(r.status, 0, label + 'R' + k + ' ' + role + ': ' + r.stderr);
      assert.equal(fs.readFileSync(out, 'utf8'), bytes, label + 'R' + k + ' ' + role + ' must come back byte-for-byte');
      assert.equal(fs.statSync(out).size, Buffer.byteLength(bytes), label + 'R' + k + ' ' + role + ': the byte count');
    }
    // Every refusal: a non-zero exit and nothing written — and an existing file left as it was.
    for (const [k, why] of [['9', 'a heading that matches nothing'], ['3', 'a heading and marker that occur twice'], ['4', 'a heading with no marker line'],
      ['5', 'a heading an older markerless entry also carries'], ['6', 'a marker line ahead of its heading'], ['7', 'a body quoting its own marker line']]) {
      const out = slash(path.join(temp, (crlf ? 'crlf' : 'lf') + ' refused R' + k + '.md'));
      assert.notEqual(recover(k, 'reviewer', out).status, 0, label + why + ': must exit non-zero');
      assert.equal(fs.existsSync(out), false, label + why + ': must write nothing');
    }
    const kept = slash(path.join(temp, (crlf ? 'crlf' : 'lf') + ' kept.md'));
    fs.writeFileSync(kept, 'kept');
    assert.notEqual(recover('9', 'reviewer', kept).status, 0);
    assert.equal(fs.readFileSync(kept, 'utf8'), 'kept', label + 'a refusal must leave an existing file as it was');
    // The join of two recovered files: a newline between them, so the second heading starts a
    // line, onto a target left full of other bytes; and a reviewer file that does not exist fails it.
    const joined = slash(path.join(temp, (crlf ? 'crlf' : 'lf') + ' joined.md'));
    fs.writeFileSync(joined, 'stale bytes an earlier join left here\n'.repeat(3));
    const j = bash(filledCommand(published.join, { '<reviewer file>': back.reviewer1, '<gate file>': back['test-hunter1'], '<joined file>': joined }));
    assert.equal(j.status, 0, label + 'join: ' + j.stderr);
    assert.equal(fs.readFileSync(joined, 'utf8'), R1 + '\n' + H1, label + 'the joined file');
    const unjoined = bash(filledCommand(published.join, { '<reviewer file>': file('missing.md'), '<gate file>': back['test-hunter1'],
      '<joined file>': slash(path.join(temp, (crlf ? 'crlf' : 'lf') + ' joined without a reviewer file.md')) }));
    assert.notEqual(unjoined.status, 0, label + 'joining a reviewer file that does not exist must exit non-zero');
    if (crlf) continue;
    // Control: round 2's recovery, run on the same LOG.md, truncates at the `## ` line and
    // exits 0 with an empty file on a heading that matches nothing — what these cases must see.
    const old = (k, role, out) => bash(filledCommand(ROUND2_RECOVER,
      { '<integration-branch>': BRANCH, '<ledger-dir>': LEDGER_DIR, '<NN>': '01', '<k>': k, '<role>': role, '<findings file>': out }));
    const truncated = slash(path.join(temp, 'round-2 R1 test-hunter.md')), empty = slash(path.join(temp, 'round-2 R9.md'));
    assert.equal(old('1', 'test-hunter', truncated).status, 0);
    assert.equal(fs.readFileSync(truncated, 'utf8'), '### B01 R1 test-hunter findings\nFINDINGS 3\n', 'the control must reproduce round 2\'s truncation');
    assert.equal(old('9', 'reviewer', empty).status, 0);
    assert.equal(fs.readFileSync(empty, 'utf8'), '', 'the control must reproduce round 2\'s silent empty file');
  }
});

// ===== One published LOG.md command per job, wherever a document states one ============
// A fix in one reader left stale in a sibling: every code span — or fenced line — in a shipped
// document or agent definition that names a findings, reviewer, gate or joined file, or pipes
// or appends LOG.md, must be the append, the recovery or the join §Spawning rules publishes,
// the template's placeholders read as the reference's. Counted per file, so a further copy,
// even a right one, is a deliberate edit here.
const LOG_COMMAND_COUNTS = { 'orchestrate/references/protocol.md': 1, 'orchestrate/references/subagent-prompts.md': 3, 'orchestrate/templates/00-READBEFORE.md': 2 };
// Code spans as Markdown reads them: a run of n backticks opens one and only a run of exactly n
// closes it, inside one paragraph — so the preamble's ```` ```prompt:<name> ```` shifts no pairing.
function codeSpans(paragraph) {
  const spans = [], runs = [...paragraph.matchAll(/`+/g)];
  for (let i = 0; i < runs.length; i++) {
    const j = runs.findIndex((run, k) => k > i && run[0].length === runs[i][0].length);
    if (j === -1) continue;
    spans.push(paragraph.slice(runs[i].index + runs[i][0].length, runs[j].index));
    i = j;
  }
  return spans;
}
function logCommandSpans(text) {
  const prose = [], fenced = [];
  let open = false;
  for (const line of LOG_PLACEHOLDERS(text).split('\n')) {
    if (line.startsWith('```')) { open = !open; prose.push(''); }
    else (open ? fenced : prose).push(line);
  }
  const spans = prose.join('\n').split(/\n[ \t]*\n/).flatMap(paragraph => codeSpans(collapse(paragraph)));
  return [...spans.map(span => span.trim()), ...fenced.map(line => line.trim())]
    .filter(span => /<(?:findings|reviewer|gate|joined) file>/.test(span) || /LOG\.md\s*\|/.test(span) || />>\s*\S*LOG\.md/.test(span));
}
test('every LOG.md command a document states is the published one, counted per file', () => {
  const published = logCommands(PROMPTS), commands = [published.append, published.recover, published.join];
  assert.ok(commands.every(Boolean), 'subagent-prompts.md publishes the append, the recovery and the join');
  // The span reader pairs backtick runs by length: an odd count of backticks earlier in a paragraph shifts nothing after it.
  assert.deepEqual(codeSpans('the blocks opening ```` ```prompt:<name> ```` are rendered by `a` and `b`'), [' ```prompt:<name> ', 'a', 'b']);
  // Controls: round 2's recovery and join, the pre-marker append, and a fenced pipe are each found, and none is published.
  for (const planted of ['`' + ROUND2_RECOVER + '`', '`cat -- "<reviewer file>" "<gate file>" > "<joined file>"`',
    '`cat -- "<findings file>" >> {{LEDGER_DIR}}/LOG.md`', '```text\ngit show <integration-branch>:./<ledger-dir>/LOG.md | tail -5\n```']) {
    const spans = logCommandSpans('Prose before.\n' + planted + '\nProse after.');
    assert.equal(spans.length, 1, 'the scan must find: ' + planted);
    assert.ok(!commands.includes(spans[0]), 'and it is not a published command: ' + planted);
  }
  const counts = {};
  for (const file of [...documents(), ...agentDefinitions()]) {
    const spans = logCommandSpans(read(file));
    for (const span of spans) assert.ok(commands.includes(span), file + ': a LOG.md command that is not the published one — ' + span);
    if (spans.length) counts[file] = spans.length;
  }
  assert.deepEqual(counts, LOG_COMMAND_COUNTS, 'the LOG.md commands each document states, counted');
});
