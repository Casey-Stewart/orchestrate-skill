// Ledger-local delivery regression for the checkpoint C1 step-0 gate.
//
// The gate is the one thing the user runs before spending any time, so it is not
// enough for it to read correctly: a real shell has to be able to dispatch it. This
// file takes the block out of the EMITTED page (an HTML/sidecar drift is a defect in
// its own right and is asserted separately), feeds it to a real `cmd.exe` and a real
// PowerShell exactly as a paste at the prompt would, and reads back what each line
// actually launched and with which argv.
//
// Nothing real runs: every program the block names is replaced, for the shells only, by a
// recording shim on a prepended PATH. The block therefore needs no integration checkout,
// the canary never executes, and every byte written lands in a disposable temp directory.
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

// What the user sees — the WHOLE gate, not just its commands. The region runs from the
// eyebrow to the end of the checks, so a `<p>`, `<pre>` or `<li>` from a later section can
// never be mistaken for part of the gate. `intro` and `checks` are kept in their emitted
// markup: the sidecar authors those strings with inline tags of its own, so page and
// source of truth compare directly, with no unescaping step in between to blur a drift.
const lf = value => value.replace(/\r\n/g, '\n');
function emittedGate(html) {
  const region = html.match(/<p class="gate-eyebrow">[\s\S]*?<ol class="gate-checks">[\s\S]*?<\/ol>/);
  assert.ok(region, 'the emitted page exposes a step-0 gate');
  const intro = region[0].match(/<\/h3>\s*<p>([\s\S]*?)<\/p>/);
  assert.ok(intro, 'the emitted step-0 gate carries the intro paragraph the user reads first');
  const commands = [...region[0].matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)]
    .map(match => lf(unescapeHTML(match[1])));
  assert.ok(commands.length, 'the emitted step-0 gate carries at least one command block');
  const checks = [...region[0].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => lf(match[1]));
  assert.ok(checks.length, 'the emitted step-0 gate carries at least one check');
  return { intro: lf(intro[1]), commands, checks };
}

const gate = emittedGate(read('smoke-C1.html'));
const emitted = gate.commands;
const lines = block => block.split('\n').map(line => line.trim()).filter(Boolean);

// The program a line asks the shell to launch. A first token that is not a bare program
// name is refused rather than waved through: this harness can only intercept a name it
// can shadow on PATH, and a line naming an executable by path would really execute.
function programOf(line) {
  const token = line.split(/\s+/)[0];
  assert.match(token, /^[A-Za-z][\w.+-]*$/,
    'the gate line ' + JSON.stringify(line) + ' starts with ' + JSON.stringify(token)
      + '; this harness shims bare program names only, and anything else would really run');
  return token.toLowerCase();
}

// Shim every program the block names that this machine could really launch — and only
// those. The list is read off the block rather than hardcoded, so a re-issue adding a
// portable line that calls something else (`where git`, say) is recorded instead of being
// mis-diagnosed as a line this shell cannot run. Names that resolve to nothing on PATH are
// deliberately left alone: shadowing a builtin or a cmdlet (`cd`, `Set-Location`) with a
// shim would mask exactly what the per-line assertion below exists to catch.
const launchable = new Map();
function launches(program) {
  if (!launchable.has(program)) {
    const probe = spawnSync('where.exe', [program], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    launchable.set(program, !probe.error && probe.status === 0);
  }
  return launchable.get(program);
}
const shimsFor = block => [...new Set(lines(block).map(programOf))].filter(launches);

// One recording shim per shell run, so a log can only hold that run's dispatches. `base`
// chooses the volume the run is staged and launched from; it defaults to the system temp
// directory, which on Windows is always on drive C:.
function sandbox(programs, base) {
  const root = fs.mkdtempSync(path.join(base || os.tmpdir(), 'c1-gate-'));
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
  for (const program of programs) {
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
function dispatch(shell, block, base) {
  const box = sandbox(shimsFor(block), base);
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
function runOnce(name, block, tag, base) {
  const key = name + '|' + tag + '|' + block;
  if (!runs.has(key)) runs.set(key, dispatch(SHELLS[name], block, base));
  return runs.get(key);
}

// The relocated run starts on a DIFFERENT DRIVE LETTER than the gate targets wherever this
// machine has one, because that is the case that actually bites on Windows: from `D:\`,
// `cmd.exe` runs `cd "C:/…/wt-int"` with status 0, empty stderr and the working directory
// still on D:, so a block that leans on the current directory would silently gate the
// user's own tree with nothing for the unknown-command check to catch. `null` means this
// machine has only one volume; the absolute-root assertions below carry the same
// guarantee without it, by refusing any dispatch that does not name its root outright.
function otherDriveBase(targetRoot) {
  const target = path.parse(targetRoot).root.slice(0, 1).toUpperCase();
  for (const letter of 'DEFGHIJKLMNOPQRSTUVWXYZABC') {
    if (letter === target) continue;
    for (const parent of [letter + ':\\Temp', letter + ':\\tmp', letter + ':\\']) {
      try {
        if (!fs.statSync(parent).isDirectory()) continue;
        fs.rmSync(fs.mkdtempSync(path.join(parent, 'c1-gate-probe-')), { recursive: true, force: true });
        return parent;
      } catch { /* absent or not writable: try the next candidate */ }
    }
  }
  return null;
}

// On worktree paths, measured in both real shells against the authored `gate.commands`
// strings: spaces and apostrophes survive double quotes intact in `cmd.exe` and in
// PowerShell 7, but a path segment containing `%NAME%` is expanded by `cmd.exe` and one
// containing `$name` is expanded by PowerShell — inside double quotes, in both cases.
// `gate.commands` is authored data with no escaping layer between it and the user's
// prompt, so there is nothing to fix in code and no assertion for it here: the fix is to
// choose an integration worktree path with no `%` or `$` in it. Such a path does not slip
// through silently either — each shell expands a different one of the two, so the
// cross-shell comparison below reports it as a shape difference.
//
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

// Which directory does git itself record as the worktree holding `branch`? Asked of a
// directory, not of the block — `null` when that directory is not inside a git repository.
const listings = new Map();
function worktreeFor(dir, branch) {
  if (!listings.has(dir)) {
    const listed = spawnSync('git', ['-C', dir, 'worktree', 'list', '--porcelain'],
      { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    listings.set(dir, listed.error || listed.status !== 0 ? null : listed.stdout);
  }
  const stdout = listings.get(dir);
  if (stdout === null) return null;
  const found = stdout.split(/\r?\n\s*\r?\n/)
    .map(entry => ({
      root: (entry.match(/^worktree (.+)$/m) || [])[1],
      branch: (entry.match(/^branch refs\/heads\/(.+)$/m) || [])[1]
    }))
    .find(entry => entry.root && entry.branch === branch);
  return found ? path.resolve(found.root) : null;
}

// The expectation must not be derived from the block it is checking. A suffix match blesses
// any tree with the right directory tail, so renaming the target in BOTH the sidecar and the
// page — or pointing all of it at some other real repository — would keep the suite green
// while the gate established its "you are on the right build" claim about the wrong tree.
// `model.branch` and `model.buildSha` are the independent facts here: git's own worktree
// record answers which directory holds that branch, and the tested commit must be a commit
// that repository actually has. When the page sits in its own repository, that repository's
// record is consulted too, which also rules out a same-branch sibling clone.
function assertKnownWorktree(root) {
  const holder = worktreeFor(root, model.branch);
  assert.ok(holder, 'the gate points a shell at ' + root + ', which is not a git worktree that'
    + ' knows branch ' + model.branch + '; the gate would prove nothing about the right build');
  assert.equal(holder, root, 'git records ' + holder + ' as the worktree for ' + model.branch
    + ', but the gate points a shell at ' + root);
  const known = spawnSync('git', ['-C', root, 'cat-file', '-e', model.buildSha + '^{commit}'],
    { encoding: 'utf8', windowsHide: true, timeout: 60000 });
  assert.equal(known.status, 0, 'the repository at ' + root + ' does not contain the tested'
    + ' commit ' + model.buildSha + ', so it is not the build this checkpoint was cut from');
  const local = worktreeFor(__dirname, model.branch);
  if (local) assert.equal(local, root, 'this repository records ' + local + ' as the worktree'
    + ' for ' + model.branch + '; the gate points a shell at ' + root + ' instead');
}

// The worktree the block actually points a shell at, read back out of the dispatch.
function integrationRoot(run) {
  const canary = canaryOf(run);
  assert.ok(canary, 'the dispatched gate launches the C1 canary script');
  const script = path.resolve(canary.cwd, canary.args[0]).replace(/\\/g, '/');
  const suffix = '/' + CANARY;
  assert.ok(script.endsWith(suffix),
    'the shell must hand node the canary at its ledger path ' + suffix + '; it got ' + script);
  const root = path.resolve(script.slice(0, -suffix.length));
  assertKnownWorktree(root);
  return root;
}

const shape = run => run.dispatched.map(entry => ({ program: entry.program, args: entry.args }));

// A missing shell is stated, never simulated: a faked second shell proves nothing. On
// Windows both shells are REQUIRED coverage rather than skippable, because the gate's whole
// claim is that one block runs in both: a machine missing one cannot report green on half
// of that claim, and a skip on a green run looks exactly like a shell that was verified. A
// missing `pwsh` therefore fails here. Off Windows neither shell exists and nothing in this
// file is exercised at all; that single case skips, and its reason says so outright.
const OFF_WINDOWS = process.platform === 'win32' ? false
  : 'not Windows (' + process.platform + '): NEITHER shell of this gate is covered here';
function requireShell(shell) {
  assert.ok(shell.available(), shell.label + ' is not available on this Windows machine, so'
    + ' half of the gate\'s "runs the same way in both shells" claim would go unverified;'
    + ' this is a failure and not a skip, because a green suite would be claiming coverage'
    + ' of a shell nothing here ever reached');
}

for (const [name, shell] of Object.entries(SHELLS)) {
  test(shell.label + ' dispatches every emitted gate line with intact arguments',
    { skip: OFF_WINDOWS },
    () => {
      requireShell(shell);
      for (const block of emitted) {
        const run = runOnce(name, block, 'primary');
        const instructed = lines(block);

        assert.doesNotMatch(run.stderr, shell.unknownCommand,
          shell.label + ' could not dispatch a line of the emitted gate: ' + run.stderr.trim());

        // Per LINE and in order, never merely the same TOTAL: a line that launches nothing
        // is invisible to a total, and a neighbour that launches twice pays for it. `cd
        // "<root>"` followed by `git … && git …` balances at three dispatches while the `cd`
        // quietly did nothing portable — and on Windows a `cd` across drives does not even
        // move, yet exits 0 with empty stderr. This assertion is also the spec's "no
        // shell-specific directory-change cmdlet" policy check, which is why the pre-repair
        // block fails the PowerShell arm at 3 of 4: `Set-Location` is a genuine cmdlet and
        // PowerShell runs it perfectly well. That line is rejected for being PowerShell-ONLY,
        // NOT because PowerShell could not parse or dispatch the block.
        let cursor = 0;
        instructed.forEach((line, index) => {
          const seen = run.dispatched[cursor];
          assert.equal(seen && seen.program, programOf(line), shell.label + ' line '
            + (index + 1) + ' (' + line + ') launched ' + (seen ? seen.program : 'nothing')
            + '; every instructed line must dispatch a command this shell can actually run');
          cursor += 1;
          const next = index + 1 < instructed.length ? programOf(instructed[index + 1]) : null;
          while (cursor < run.dispatched.length && run.dispatched[cursor].program !== next) cursor += 1;
        });

        for (const entry of run.dispatched) {
          for (const arg of entry.args) {
            assert.doesNotMatch(arg, /['"]/,
              shell.label + ' handed ' + entry.program + ' an argument still wrapped in shell quotes: '
                + JSON.stringify(arg));
          }
        }

        // Every dispatch has to carry its own root: git names its repository with an
        // absolute `-C`, the canary gets an absolute script path and an absolute repository
        // argument. Without this the recorded cwd could launder a relative path into a pass
        // — and the cwd is exactly what cannot be trusted on Windows, where changing drive
        // is its own step.
        const canary = canaryOf(run);
        assert.ok(canary, 'the dispatched gate launches the C1 canary script');
        for (const position of [0, 1]) {
          assert.ok(path.isAbsolute(canary.args[position] || ''), 'the canary must be given an'
            + ' absolute path in argument ' + position + ' so it cannot depend on where the'
            + ' block was pasted; it got ' + JSON.stringify(canary.args[position]));
        }
        const gitCalls = run.dispatched.filter(entry => entry.program === 'git');
        for (const entry of gitCalls) {
          const flag = entry.args.indexOf('-C');
          assert.notEqual(flag, -1, 'every git probe must name its repository with -C rather'
            + ' than inherit it from the current directory: git ' + entry.args.join(' '));
          assert.ok(path.isAbsolute(entry.args[flag + 1] || ''), 'git -C must be handed an'
            + ' absolute worktree path; it got ' + JSON.stringify(entry.args[flag + 1]));
        }

        // Preserve what the gate verifies: branch, HEAD, canary — all on one repository.
        const root = integrationRoot(run);
        assert.equal(path.resolve(canary.cwd, canary.args[1] || '.'), root,
          'the canary receives the same worktree its script lives in');
        assert.deepEqual(gitCalls.map(gitArgsOf),
          [['branch', '--show-current'], ['rev-parse', 'HEAD']],
          'the gate still asks the shell for the current branch and the HEAD commit');
        for (const entry of gitCalls) {
          assert.equal(repoOf(entry), root,
            'every git probe targets the worktree the canary is given, not wherever the paste happened');
        }
      }
    });

  test(shell.label + ' runs the emitted gate the same way from another drive',
    { skip: OFF_WINDOWS },
    () => {
      requireShell(shell);
      for (const block of emitted) {
        const here = runOnce(name, block, 'primary');
        const target = integrationRoot(here);
        const base = otherDriveBase(target);
        const elsewhere = runOnce(name, block, 'relocated', base);
        assert.notEqual(here.work, elsewhere.work, 'the two runs use different directories');
        if (base) {
          assert.notEqual(path.parse(elsewhere.work).root.toUpperCase(),
            path.parse(target).root.toUpperCase(), 'the relocated run must start on a'
              + ' different drive than the gate targets, which is where a block that leans'
              + ' on the current directory stops being portable without saying so');
        }
        assert.deepEqual(shape(elsewhere), shape(here),
          shell.label + ' dispatched a different command list from ' + elsewhere.work);
        assert.equal(integrationRoot(elsewhere), target,
          'the gate resolves to the same worktree wherever it is pasted');
      }
    });
}

test('both shells dispatch the emitted gate identically', { skip: OFF_WINDOWS }, () => {
  for (const shell of Object.values(SHELLS)) requireShell(shell);
  for (const block of emitted) {
    const viaCmd = runOnce('cmd', block, 'primary');
    const viaPwsh = runOnce('pwsh', block, 'primary');
    assert.deepEqual(shape(viaCmd), shape(viaPwsh),
      'cmd.exe and PowerShell must launch the same programs with the same argv');
    assert.equal(integrationRoot(viaCmd), integrationRoot(viaPwsh));
  }
});

// The WHOLE gate, not just its commands: the intro is the sentence that tells the user how
// to run the block, and the checks are what the run is for. Comparing only the commands
// lets either of them drift on its own — a page whose intro still says to change directory
// first is the original defect back again, and a weakened check in the sidecar is worse
// still, because that is the copy a later regeneration emits from.
test('the emitted gate matches its sidecar', () => {
  assert.equal(gate.intro, lf(model.gate.intro || ''),
    'the intro the user reads must be the sidecar intro, byte for byte');
  assert.deepEqual(gate.commands, (model.gate.commands || []).map(lf),
    'the page the user reads must carry the sidecar gate, byte for byte');
  assert.deepEqual(gate.checks, (model.gate.checks || []).map(lf),
    'the checks the user reads must be the sidecar checks, byte for byte');
});

// Spec item 2: the re-issue may change how the gate is typed, never what it establishes.
// Read off the SIDECAR, which is the source of truth every regeneration emits from; the
// test above then carries each of these through to the page.
test('the emitted gate still states what it verifies', () => {
  const plain = (model.gate.checks || []).join('\n').replace(/<[^>]*>/g, '');
  assert.ok(plain.includes(model.branch), 'the gate names the branch the user must be on');
  assert.ok(plain.includes(model.buildSha), 'the gate names the recorded tested commit');
  assert.match(plain, /later commit containing only checkpoint artifacts is allowed/,
    'the gate still allows an artifacts-only commit after the tested one');
  assert.match(plain, /Canary must report PASS/, 'the gate keeps its canary PASS criterion');
  assert.match(plain, /behaves the old way, stop and report it/,
    'the gate keeps its stop-and-say-so instruction');
});
