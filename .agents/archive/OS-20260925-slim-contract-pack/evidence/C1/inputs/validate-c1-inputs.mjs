// Independently validates the C1 smoke inputs of OS-20260925-slim-contract-pack.
// Usage (from the repository root): node <this file> <issue-dir>
// Clones each bundle into a temporary directory and checks its content with plain git and
// string comparison — never with the tools the steps test — except I-03's parse, which is
// the fixture's stated requirement (check-ledger.mjs parse prints PARSE OK). Prints one
// line per check and exits 0 only when every check holds.
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const dir = process.argv[2];
if (!dir || process.argv.length !== 3) { console.error('usage: validate-c1-inputs.mjs <issue-dir>'); process.exit(2); }
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^GIT_/i.test(k)));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'c1-validate-'));
let failed = 0;
const check = (name, ok, detail = '') => { console.log((ok ? 'OK   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); if (!ok) failed++; };
const git = (cwd, args) => spawnSync('git', args, { cwd, env, encoding: 'utf8' });
const clone = name => {
  const target = path.join(tmp, name);
  const r = git(tmp, ['clone', '-q', path.resolve(dir, name + '.bundle'), target]);
  return r.status === 0 ? target : null;
};
const sha256 = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

try {
  const shas = JSON.parse(fs.readFileSync(path.join(dir, 'shas.json'), 'utf8'));
  const verifier = path.join(tmp, 'verifier');
  git(tmp, ['init', '-q', verifier]);
  for (const name of ['i01', 'i02', 'i03', 'i04']) {
    const v = git(verifier, ['bundle', 'verify', '-q', path.resolve(dir, name + '.bundle')]);
    check(name + ' bundle verifies', v.status === 0, 'sha256 ' + sha256(path.join(dir, name + '.bundle')));
  }

  // I-01
  const i01 = clone('i01');
  check('i01 clones', !!i01);
  if (i01) {
    const log = git(i01, ['log', '--format=%H %s', 'HEAD']).stdout.trim().split('\n').reverse();
    check('i01 checkout holds invoice.mjs', fs.existsSync(path.join(i01, 'invoice.mjs')));
    check('i01 has exactly three commits c0 → c1 → c2', log.length === 3 && log[0].startsWith(shas.i01.c0) && log[1].startsWith(shas.i01.c1) && log[2].startsWith(shas.i01.c2), log.join(' | '));
    const names = rev => git(i01, ['ls-tree', '-r', '--name-only', rev]).stdout.trim();
    check('i01 every commit holds only invoice.mjs', [shas.i01.c0, shas.i01.c1, shas.i01.c2].every(r => names(r) === 'invoice.mjs'));
    const body = rev => git(i01, ['show', rev + ':invoice.mjs']).stdout;
    const [b0, b1, b2] = [body(shas.i01.c0), body(shas.i01.c1), body(shas.i01.c2)];
    // c0 → c1: every differing line is a comment line or the comment tail of a code line,
    // and the code before each `//` and outside the one block comment is byte-identical.
    const code = text => text.split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
    check('i01 c0 → c1 changes comments only (both // and /* */ forms)', b0 !== b1 && code(b0) === code(b1)
      && /\/\*[\s\S]*?\*\//.exec(b0)[0] !== /\/\*[\s\S]*?\*\//.exec(b1)[0]
      && b0.split('\n').some((l, i) => l.startsWith('//') && l !== b1.split('\n')[i]));
    const d = b1.split('\n').map((l, i) => [l, b2.split('\n')[i]]).filter(([a, b]) => a !== b);
    check('i01 c1 → c2 changes one code line by one character', d.length === 1 && d[0][0] === '  return sum / 100;' && d[0][1] === '  return sum / 10;', JSON.stringify(d));
    check('i01 carries no tool-directive or JSDoc comment', !/eslint|istanbul|c8 |prettier|@ts-|@param|@returns|\/\*\*|\/\/\/|\/\/#|\/\*!/.test(b0 + b1 + b2));
  }

  // I-02
  const i02 = clone('i02');
  check('i02 clones', !!i02);
  if (i02) {
    const log = git(i02, ['log', '--format=%H', 'HEAD']).stdout.trim().split('\n');
    check('i02 checkout holds the decoy file', fs.existsSync(path.join(i02, 'DECOY-REPOSITORY-zq7x.txt')));
    check('i02 has one commit', log.length === 1 && log[0] === shas.i02.head);
    check('i02 holds only the distinctive path', git(i02, ['ls-tree', '-r', '--name-only', 'HEAD']).stdout.trim() === 'DECOY-REPOSITORY-zq7x.txt');
  }

  // I-03
  const i03 = clone('i03');
  check('i03 clones', !!i03);
  if (i03) {
    const ledger = path.join(i03, '.agents/changes/OS-20260101-fixture');
    check('i03 checkout holds the ledger directory', fs.existsSync(ledger));
    if (!fs.existsSync(ledger)) throw new Error('i03: no ledger directory in the clone');
    const listing = fs.readdirSync(ledger).sort();
    const want = ['00-READBEFORE.md', '00-request.md', '01-plan.md', '02-batches-01-fixture-batch.md', 'LOG.md', 'PROGRESS.md'];
    check('i03 ledger holds exactly the six files', JSON.stringify(listing) === JSON.stringify(want), listing.join(','));
    const outsideCode = text => text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
    const unfilled = listing.filter(f => /\{\{|<!--/.test(outsideCode(fs.readFileSync(path.join(ledger, f), 'utf8'))));
    check('i03 no {{ or <!-- outside code spans', unfilled.length === 0, unfilled.join(','));
    const contract = fs.readFileSync(path.join(ledger, '00-READBEFORE.md'), 'utf8');
    check('i03 contract is the slimmed template (under 20000 bytes, Skill source line present)', Buffer.byteLength(contract) < 20000 && /^\*\*Skill source\*\*: /m.test(contract), Buffer.byteLength(contract) + ' bytes');
    check('i03 contract names the integration branch and the setup', contract.includes('`chore/fixture-ledger`') && contract.includes('npm ci --no-audit'));
    const parse = spawnSync(process.execPath, [path.resolve('orchestrate/tools/check-ledger.mjs'), 'parse', '--dir', ledger], { env, encoding: 'utf8' });
    check('i03 check-ledger parse prints PARSE OK 1 batches', parse.status === 0 && parse.stdout === 'PARSE OK 1 batches\n', JSON.stringify(parse.stdout + parse.stderr));
    const facts = JSON.parse(fs.readFileSync(path.join(i03, 'facts.json'), 'utf8'));
    check('i03 facts.json holds exactly the implementer keys', JSON.stringify(Object.keys(facts).sort()) === JSON.stringify(['guardrails', 'repoPath', 'scratchpadPath', 'worktreePath']));
    check('i03 CLAUDE.md carries the guardrails heading', /^## Bug-class guardrails$/m.test(fs.readFileSync(path.join(i03, 'CLAUDE.md'), 'utf8')));
  }
  // I-04
  const i04 = clone('i04');
  check('i04 clones', !!i04);
  if (i04) {
    const log = git(i04, ['log', '--format=%H', 'HEAD']).stdout.trim().split('\n').reverse();
    check('i04 has exactly two commits c0 → c1', log.length === 2 && log[0] === shas.i04.c0 && log[1] === shas.i04.c1, log.join(' '));
    const names = rev => git(i04, ['ls-tree', '-r', '--name-only', rev]).stdout.trim();
    check('i04 both commits hold only lib/token.mjs', names(shas.i04.c0) === 'lib/token.mjs' && names(shas.i04.c1) === 'lib/token.mjs');
    const body = rev => git(i04, ['show', rev + ':lib/token.mjs']).stdout.split('\n');
    const [a0, a1] = [body(shas.i04.c0), body(shas.i04.c1)];
    const d = a0.map((l, i) => [l, a1[i]]).filter(([x, y]) => x !== y);
    check('i04 c0 → c1 appends exactly " // gitleaks:allow" to the one code line', a0.length === a1.length && d.length === 1 && d[0][1] === d[0][0] + ' // gitleaks:allow' && d[0][0].startsWith('export const '), JSON.stringify(d));
    check('i04 carries no secret-shaped string', !/AKIA|secret|password|BEGIN [A-Z ]*PRIVATE/i.test(a1.join('\n')));
  }
} catch (e) {
  check('validator ran to the end', false, e.message);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(failed ? 'INVALID ' + failed + ' check(s) failed' : 'VALID every check held');
process.exit(failed ? 1 : 0);
