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
// code span naming the token alone.
const SKILL_TOKENS = /\{\{SKILL_DIR\}\}|<SKILL_DIR>|<skill-dir>/g;
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
// quoted placeholder directory — `"{{X}}/tools/<name>"` or `"<x>/tools/<name>"` — closing
// right after the name.
const toolNames = () => fs.readdirSync(path.join(ROOT, 'orchestrate/tools')).filter(n => n.endsWith('.mjs'));
function toolPathFaults(text, names) {
  const escaped = names.map(n => n.replace(/\./g, '\\.')).join('|');
  const faults = [];
  for (const m of text.matchAll(new RegExp('tools[\\\\/](?:' + escaped + ')', 'g'))) {
    const before = text.slice(Math.max(0, m.index - 80), m.index), after = text[m.index + m[0].length];
    const quotedDir = /"(?:\{\{[A-Z_]+\}\}|<[A-Za-z_ -]+>)\/$/.test(before);
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
    '`node tools/build-smoke-page.mjs a b`']) {
    assert.equal(toolPathFaults(bad, names).length, 1, 'must be caught: ' + bad);
  }
  assert.deepEqual(toolPathFaults('`node "{{SKILL_DIR}}/tools/validate.mjs" --spec x` `node "<skill-dir>/tools/git-evidence.mjs" discovery`', names), []);
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
const NEGATOR = /(?:^|[^\w'’])(never|not|cannot|nor|\w+n['’]t)\s+(?:((?!(?:only|just|merely|simply)\s)[\w`'’-]+)\s+|under any circumstances?\s+)?$/i;
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
    "A ledger may also link to this skill's references/protocol.md for the long rules."]) {
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
    "All must pass before a batch may integrate (`🟢`). Every run goes through the validation wrapper, from the worktree root: ```text node \"{{SKILL_DIR}}/tools/validate.mjs\" --spec {{LEDGER_DIR}}/validate.json --log \"<session scratchpad>/<label>.log\" ``` `validate.json` is the machine form of the block above, written at scaffold time. The wrapper's one line (`PASS …`, `FAIL … — log: <path>` or `UNKNOWN …`) is the result and its exit code (0/1/2) is the real one; the log is read only when the line is not PASS, and failing test NAMES are taken from it so failing sets compare by name against any allowlist. Never pipe or tail it; when it may outlast the runtime's command timeout, run it as a background task whose completion reports the one line and the exit code, and never read the log before it exits. The block above stays the human-readable recipe and is the manual procedure when the wrapper is unavailable, run in its QUIET form (a totals line plus failing test NAMES; full output only on a non-zero exit). If the block above says `none`, there is no `validate.json` and the checkpoint smoke tests carry ALL verification — state that explicitly when handing over. Mutation runner (optional, scoped to a batch's changed files): {{MUTATION_RUNNER}}."],
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
