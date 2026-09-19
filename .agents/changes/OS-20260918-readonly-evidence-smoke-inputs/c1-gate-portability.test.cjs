// Ledger-local delivery regression for the checkpoint C1 step-0 gate.
//
// The gate is the one thing the user runs before spending any time, so it is not
// enough for it to read correctly: a real shell has to be able to dispatch it. This
// file takes the block out of the EMITTED page (an HTML/sidecar drift is a defect in
// its own right and is asserted separately), feeds it to a real `cmd.exe` and a real
// PowerShell exactly as a paste at the prompt would, and reads back what each line
// actually launched and with which argv.
//
// Nothing real runs: `git` and `node` are replaced, for the shells only, by recording
// shims on a prepended PATH. The block therefore needs no integration checkout, the
// canary never executes, and every byte written lands in a disposable temp directory.
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const LEDGER = '.agents/changes/OS-20260918-readonly-evidence-smoke-inputs';
const CANARY = LEDGER + '/evidence/C1/scripts/c1-canary.mjs';
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const model = JSON.parse(read('smoke-C1.json'));

// `renderGate` escapes exactly these three, in this order; undo them in reverse.
const unescapeHTML = value => value
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

// What the user sees. The gate region ends at its checks, so a `<pre>` from a later
// section can never be mistaken for a gate command.
function emittedGateBlocks(html) {
  const region = html.match(/<p class="gate-eyebrow">[\s\S]*?<ol class="gate-checks">/);
  assert.ok(region, 'the emitted page exposes a step-0 gate');
  const blocks = [...region[0].matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)]
    .map(match => unescapeHTML(match[1]).replace(/\r\n/g, '\n'));
  assert.ok(blocks.length, 'the emitted step-0 gate carries at least one command block');
  return blocks;
}

const emitted = emittedGateBlocks(read('smoke-C1.html'));
const lines = block => block.split('\n').map(line => line.trim()).filter(Boolean);

// One recording shim per shell run, so a log can only hold that run's dispatches.
function sandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'c1-gate-'));
  const bin = path.join(root, 'bin'), work = path.join(root, 'work');
  fs.mkdirSync(bin); fs.mkdirSync(work);
  const log = path.join(root, 'dispatch.log');
  fs.writeFileSync(log, '');
  const recorder = path.join(bin, 'record.cjs');
  fs.writeFileSync(recorder,
    "require('node:fs').appendFileSync(process.env.C1_GATE_LOG, JSON.stringify({" +
    "program: process.argv[2], args: process.argv.slice(3), cwd: process.cwd()}) + '\\n');\n");
  // `%*` hands on the raw argument tail, so whatever the shell left around a path —
  // including quotes it declined to strip — reaches the recorder unchanged.
  for (const program of ['git', 'node']) {
    fs.writeFileSync(path.join(bin, program + '.cmd'),
      '@echo off\r\n"' + process.execPath + '" "' + recorder + '" ' + program + ' %*\r\n');
  }
  const env = { ...process.env, C1_GATE_LOG: log };
  for (const key of Object.keys(env)) {
    if (/^path$/i.test(key)) env[key] = bin + path.delimiter + env[key];
  }
  return { root, log, work, env };
}

const SHELLS = {
  cmd: {
    label: 'cmd.exe',
    available: () => process.platform === 'win32',
    command: () => [process.env.ComSpec || 'cmd.exe', ['/d', '/q']],
    // cmd.exe reading a pipe executes each line as if typed, and keeps going after a
    // bad one — the same two-failures-in-a-row the user reported.
    stdin: block => block.replace(/\n/g, '\r\n') + '\r\nexit\r\n',
    unknownCommand: /is not recognized as an internal or external command/i
  },
  pwsh: {
    label: 'PowerShell 7',
    available: () => process.platform === 'win32' && resolvable('pwsh'),
    command: () => ['pwsh', ['-NoProfile', '-NoLogo', '-NonInteractive', '-Command', '-']],
    stdin: block => block.replace(/\n/g, '\r\n') + '\r\n',
    // PowerShell 7: "The term 'X' is not recognized as a name of a cmdlet, ...".
    unknownCommand: /CommandNotFoundException|is not recognized as (?:a|the) name of/i
  }
};

const probes = new Map();
function resolvable(program) {
  if (!probes.has(program)) {
    const probe = spawnSync(program, ['-NoProfile', '-NoLogo', '-Command', 'exit 0'],
      { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    probes.set(program, !probe.error && probe.status === 0);
  }
  return probes.get(program);
}

// Run the emitted block through a real shell and report only what the shell did.
function dispatch(shell, block) {
  const box = sandbox();
  try {
    const [exe, args] = shell.command();
    const result = spawnSync(exe, args, {
      cwd: box.work, env: box.env, input: shell.stdin(block),
      encoding: 'utf8', windowsHide: true, timeout: 300000
    });
    assert.ok(!result.error, shell.label + ' failed to start: ' + result.error);
    const dispatched = fs.readFileSync(box.log, 'utf8').split('\n')
      .filter(Boolean).map(entry => JSON.parse(entry));
    return { stdout: result.stdout || '', stderr: result.stderr || '', dispatched, work: box.work };
  } finally {
    fs.rmSync(box.root, { recursive: true, force: true });
  }
}

const runs = new Map();
function runOnce(name, block, tag) {
  const key = name + '|' + tag + '|' + block;
  if (!runs.has(key)) runs.set(key, dispatch(SHELLS[name], block));
  return runs.get(key);
}

// A dispatch names one repository: the directory `git -C` was handed, or else the
// directory the command was launched from. Resolving through the recorded cwd is what
// makes "does this block depend on where it was pasted?" an answerable question.
function repoOf(entry) {
  const viaFlag = entry.args.indexOf('-C');
  return path.resolve(entry.cwd, viaFlag === -1 ? '.' : entry.args[viaFlag + 1]);
}
function gitArgsOf(entry) {
  const viaFlag = entry.args.indexOf('-C');
  return viaFlag === -1 ? entry.args : entry.args.filter((_, i) => i !== viaFlag && i !== viaFlag + 1);
}
// Deliberately loose about what surrounds the name: a canary launched with the quotes
// still attached is found here so the path assertion below can name the real defect.
const canaryOf = run => run.dispatched.find(entry =>
  entry.program === 'node' && /c1-canary\.mjs/.test(entry.args[0] || ''));

// The worktree the block actually points a shell at, read back out of the dispatch.
function integrationRoot(run) {
  const canary = canaryOf(run);
  assert.ok(canary, 'the dispatched gate launches the C1 canary script');
  const script = path.resolve(canary.cwd, canary.args[0]).replace(/\\/g, '/');
  const suffix = '/' + CANARY;
  assert.ok(script.endsWith(suffix),
    'the shell must hand node the canary at its ledger path ' + suffix + '; it got ' + script);
  return path.resolve(script.slice(0, -suffix.length));
}

const shape = run => run.dispatched.map(entry => ({ program: entry.program, args: entry.args }));

for (const [name, shell] of Object.entries(SHELLS)) {
  const available = shell.available();
  // A missing shell is stated, never simulated: a faked second shell proves nothing.
  test(shell.label + ' dispatches every emitted gate line with intact arguments',
    { skip: available ? false : shell.label + ' is unavailable on this machine; that shell is NOT covered here' },
    () => {
      for (const block of emitted) {
        const run = runOnce(name, block, 'primary');
        const instructed = lines(block);

        assert.doesNotMatch(run.stderr, shell.unknownCommand,
          shell.label + ' could not dispatch a line of the emitted gate: ' + run.stderr.trim());
        assert.equal(run.dispatched.length, instructed.length,
          shell.label + ' dispatched ' + run.dispatched.length + ' of the ' + instructed.length
            + ' instructed commands; a line that launched nothing is a line this shell cannot run');

        for (const entry of run.dispatched) {
          for (const arg of entry.args) {
            assert.doesNotMatch(arg, /['"]/,
              shell.label + ' handed ' + entry.program + ' an argument still wrapped in shell quotes: '
                + JSON.stringify(arg));
          }
        }

        // Preserve what the gate verifies: branch, HEAD, canary — all on one repository.
        const root = integrationRoot(run);
        const canary = canaryOf(run);
        assert.equal(path.resolve(canary.cwd, canary.args[1] || '.'), root,
          'the canary receives the same worktree its script lives in');
        const gitCalls = run.dispatched.filter(entry => entry.program === 'git');
        assert.deepEqual(gitCalls.map(gitArgsOf),
          [['branch', '--show-current'], ['rev-parse', 'HEAD']],
          'the gate still asks the shell for the current branch and the HEAD commit');
        for (const entry of gitCalls) {
          assert.equal(repoOf(entry), root,
            'every git probe targets the worktree the canary is given, not wherever the paste happened');
        }
      }
    });

  test(shell.label + ' runs the emitted gate the same way from an unrelated directory',
    { skip: available ? false : shell.label + ' is unavailable on this machine; that shell is NOT covered here' },
    () => {
      for (const block of emitted) {
        const here = runOnce(name, block, 'primary');
        const elsewhere = runOnce(name, block, 'relocated');
        assert.notEqual(here.work, elsewhere.work, 'the two runs use different directories');
        assert.deepEqual(shape(elsewhere), shape(here),
          shell.label + ' dispatched a different command list from a different directory');
        assert.equal(integrationRoot(elsewhere), integrationRoot(here),
          'the gate resolves to the same worktree wherever it is pasted');
      }
    });
}

test('both shells dispatch the emitted gate identically', {
  skip: Object.values(SHELLS).every(shell => shell.available())
    ? false : 'both shells are required to compare them'
}, () => {
  for (const block of emitted) {
    const viaCmd = runOnce('cmd', block, 'primary');
    const viaPwsh = runOnce('pwsh', block, 'primary');
    assert.deepEqual(shape(viaCmd), shape(viaPwsh),
      'cmd.exe and PowerShell must launch the same programs with the same argv');
    assert.equal(integrationRoot(viaCmd), integrationRoot(viaPwsh));
  }
});

test('the emitted gate block matches its sidecar', () => {
  assert.deepEqual(emitted, (model.gate.commands || []).map(command => command.replace(/\r\n/g, '\n')),
    'the page the user reads must carry the sidecar gate, byte for byte');
});

// Spec item 2: the re-issue may change how the gate is typed, never what it establishes.
test('the emitted gate still states what it verifies', () => {
  const html = read('smoke-C1.html');
  const checks = (html.match(/<ol class="gate-checks">([\s\S]*?)<\/ol>/) || [])[1];
  assert.ok(checks, 'the emitted page carries the gate checks');
  assert.equal(checks.match(/<li>([\s\S]*?)<\/li>/g).length, model.gate.checks.length);
  const plain = checks.replace(/<[^>]*>/g, '');
  assert.ok(plain.includes(model.branch), 'the gate names the branch the user must be on');
  assert.ok(plain.includes(model.buildSha), 'the gate names the recorded tested commit');
  assert.match(plain, /later commit containing only checkpoint artifacts is allowed/,
    'the gate still allows an artifacts-only commit after the tested one');
  assert.match(plain, /Canary must report PASS/, 'the gate keeps its canary PASS criterion');
  assert.match(plain, /behaves the old way, stop and report it/,
    'the gate keeps its stop-and-say-so instruction');
});
