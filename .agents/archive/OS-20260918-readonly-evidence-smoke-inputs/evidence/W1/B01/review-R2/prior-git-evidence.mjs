#!/usr/bin/env node
// Read-only facts, never a workflow classifier. Every dependent Git probe uses captured objects.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const decoder = new TextDecoder('utf-8', { fatal: true });
const SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const contracts = ['00-READBEFORE.md', '02-batches-00-READBEFORE.md', '03-tasks-00-READBEFORE.md', '01-plan.md', '02-plan.md'];
export const diagnostic = (code, message, context = {}) => ({ code, message, ...context });
export const validId = id => typeof id === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(id) && !id.includes('..');
export const validPath = p => typeof p === 'string' && p.length > 0 && !/^[\/]|[\\\x00-\x1f\x7f:*?\[\]`|]/.test(p) && p.split('/').every(x => x && x !== '.' && x !== '..');
export const validFullRef = ref => typeof ref === 'string' && /^refs\/(?:heads|remotes)\//.test(ref) && !/[\s~^:?*\[\\\x00-\x1f]|\.\.|@\{|\/\//.test(ref) && !/[/.]$/.test(ref);
function safeRef(ref) { return typeof ref === 'string' && ref.length > 0 && !ref.startsWith('-') && !/[\x00-\x20\x7f]/.test(ref); }
export function decode(bytes) { return decoder.decode(bytes); }

export function git(repo, args, options = {}) {
  const result = spawnSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', '-c', 'core.untrackedCache=false', ...args], {
    cwd: repo, env: { ...(options.env ?? process.env), GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', GIT_NO_LAZY_FETCH: '1' },
    shell: false, windowsHide: true, timeout: 15000, maxBuffer: 16 * 1024 * 1024,
  });
  // Git's stderr can contain a remote URL, including credentials. Do not publish it.
  const failure = diagnostic('git-probe', 'Git probe failed; stderr withheld to protect remote credentials', {
    command: args[0], exit: result.status, ...(result.error ? { error: result.error.code || 'launch-error' } : {}),
    ...(result.signal ? { signal: result.signal } : {}),
  });
  try { return { ok: !result.error && result.signal === null && result.status === 0, exit: result.status, text: decode(result.stdout || Buffer.alloc(0)), bytes: result.stdout, diagnostic: failure }; }
  catch { return { ok: false, exit: result.status, text: null, diagnostic: diagnostic('invalid-encoding', 'Git output is not valid UTF-8', { command: args[0], exit: result.status }) }; }
}
export function capture(repo, ref, diagnostics, options = {}) {
  if (!safeRef(ref)) { diagnostics.push(diagnostic('invalid-ref', 'Expected a non-option Git revision')); return null; }
  const r = git(repo, ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`], options);
  if (!r.ok) { diagnostics.push(r.diagnostic); return null; }
  const sha = r.text.replace(/\r?\n$/, '');
  if (!SHA.test(sha)) { diagnostics.push(diagnostic('invalid-object', 'Expected one full commit object ID')); return null; }
  return sha;
}
export function ancestryCaptured(repo, ancestorSha, descendantSha, diagnostics, options = {}) {
  if (!ancestorSha || !descendantSha) return 'unknown';
  const r = git(repo, ['merge-base', '--is-ancestor', ancestorSha, descendantSha], options);
  if (r.ok) return 'contained';
  if (r.exit === 1 && r.text === '') return 'not-contained';
  diagnostics.push(r.diagnostic); return 'unknown';
}
function envelope(operation, repo, evidence, diagnostics, unavailable = false) {
  return { operation, repo: path.resolve(repo), completeness: diagnostics.length ? (unavailable ? 'unknown' : 'partial') : 'complete', evidence, diagnostics };
}
function provenanceOptions(repo, diagnostics, options) {
  const captured = { ...options };
  for (const key of ['owner', 'target']) if (options[key] !== undefined) captured[`${key}Sha`] = capture(repo, options[key], diagnostics, options);
  return captured;
}
export function ancestry({ repo, ancestor, descendant, ...options }) {
  const diagnostics = [];
  const ancestorSha = capture(repo, ancestor, diagnostics, options), descendantSha = capture(repo, descendant, diagnostics, options);
  const result = ancestryCaptured(repo, ancestorSha, descendantSha, diagnostics, options);
  return envelope('ancestry', repo, { ancestorSha, descendantSha, result }, diagnostics, result === 'unknown');
}
export function shipment({ repo, integration, source, remote, ref, ...options }) {
  const diagnostics = [];
  const e = { source, remote: remote ?? null, ref, integrationSha: null, shipmentSha: null, result: 'unknown' };
  if (!validFullRef(integration) || !validFullRef(ref) || !ref.startsWith('refs/heads/') || !['local', 'remote'].includes(source) || (source === 'remote' ? !remote || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(remote) : remote !== undefined)) {
    diagnostics.push(diagnostic('invalid-shipment', 'Explicit integration, source, full shipment branch ref and remote name (remote source only) are required'));
    return envelope('shipment', repo, e, diagnostics, true);
  }
  e.integrationSha = capture(repo, integration, diagnostics, options);
  if (source === 'local') e.shipmentSha = capture(repo, ref, diagnostics, options);
  else {
    const r = git(repo, ['ls-remote', '--exit-code', '--refs', '--', remote, ref], options);
    if (!r.ok) diagnostics.push(r.diagnostic);
    else {
      const records = r.text.split('\n').filter(Boolean).map(x => x.replace(/\r$/, '').split('\t'));
      if (records.length !== 1 || records[0].length !== 2 || records[0][1] !== ref || !SHA.test(records[0][0])) diagnostics.push(diagnostic('invalid-remote-ref', 'Expected exactly one matching remote branch'));
      else {
        e.shipmentSha = records[0][0];
        const commit = capture(repo, e.shipmentSha, diagnostics, options);
        if (commit && commit !== e.shipmentSha) diagnostics.push(diagnostic('remote-object-type', 'Remote branch object must itself be a commit, not a peeled tag'));
      }
    }
  }
  // A remote SHA remains visible even if its object is unavailable; it is never substituted by a tracking ref.
  if (!diagnostics.length) e.result = ancestryCaptured(repo, e.integrationSha, e.shipmentSha, diagnostics, options);
  return envelope('shipment', repo, e, diagnostics, e.result === 'unknown');
}

export function parseStatus(text) {
  if (!text) return [];
  const fields = text.split('\0');
  if (fields.pop() !== '') throw new Error('Missing status terminator');
  const entries = [];
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (!/^[ MADRCU?!]{2} /.test(field) || field.length < 4) throw new Error('Malformed status entry');
    const xy = field.slice(0, 2), destination = field.slice(3);
    const entry = { status: xy, path: destination, originalPath: null };
    if (/[RC]/.test(xy)) { if (!fields[++i]) throw new Error('Missing rename endpoint'); entry.originalPath = fields[i]; }
    entries.push(entry);
  }
  return entries;
}
function worktreesRaw(repo, diagnostics, options) {
  const r = git(repo, ['worktree', 'list', '--porcelain', '-z'], options);
  if (!r.ok) { diagnostics.push(r.diagnostic); return []; }
  const records = r.text.split('\0\0');
  if (records.pop() !== '') { diagnostics.push(diagnostic('invalid-worktrees', 'Malformed worktree list')); return []; }
  const result = [];
  for (const record of records) {
    const fields = record.split('\0');
    const get = key => fields.filter(x => x.startsWith(key + ' ')).map(x => x.slice(key.length + 1));
    const paths = get('worktree'), heads = get('HEAD'), branches = get('branch');
    if (paths.length !== 1 || heads.length > 1 || branches.length > 1 || (heads[0] && !SHA.test(heads[0]))) { diagnostics.push(diagnostic('invalid-worktrees', 'Malformed worktree identity')); continue; }
    const wt = { path: paths[0], head: heads[0] ?? null, branch: branches[0] ?? null, cleanliness: 'unknown', status: [], bare: fields.includes('bare'), prunable: get('prunable')[0] ?? null };
    result.push(wt);
    if (wt.bare) continue;
    try {
      if (!fs.statSync(wt.path).isDirectory()) throw new Error('not directory');
      const top = git(wt.path, ['rev-parse', '--show-toplevel'], options);
      if (!top.ok || fs.realpathSync(top.text.replace(/\r?\n$/, '')) !== fs.realpathSync(wt.path)) throw new Error('identity mismatch');
      const actualHead = capture(wt.path, 'HEAD', diagnostics, options);
      const actualBranch = git(wt.path, ['symbolic-ref', '--quiet', 'HEAD'], options);
      if (!actualBranch.ok && actualBranch.exit !== 1) { diagnostics.push(actualBranch.diagnostic); continue; }
      if (actualHead !== wt.head || (actualBranch.ok ? actualBranch.text.replace(/\r?\n$/, '') : null) !== wt.branch) throw new Error('checkout identity changed');
      const status = git(wt.path, ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignore-submodules=none'], options);
      if (!status.ok) { diagnostics.push({ ...status.diagnostic, path: wt.path }); continue; }
      wt.status = parseStatus(status.text); wt.cleanliness = wt.status.length ? 'dirty' : 'clean';
    } catch { diagnostics.push(diagnostic('worktree-unavailable', 'Worktree is missing, inaccessible, malformed or has changed identity', { path: wt.path })); }
  }
  return result.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}
export function worktrees({ repo, ...options }) {
  const diagnostics = [], evidence = { worktrees: worktreesRaw(repo, diagnostics, options) };
  return envelope('worktrees', repo, evidence, diagnostics, !evidence.worktrees.length);
}
function parseTree(text) {
  if (!text) return [];
  const fields = text.split('\0'); if (fields.pop() !== '') throw new Error();
  return fields.map(f => { const m = /^(\d{6}) (blob|tree|commit) ([a-f0-9]{40}|[a-f0-9]{64})\t([\s\S]+)$/.exec(f); if (!m) throw new Error(); return { mode: m[1], type: m[2], sha: m[3], path: m[4] }; });
}
export function readBlob(repo, sha, file, diagnostics, options = {}) {
  const r = git(repo, ['show', `${sha}:./${file}`], options);
  if (!r.ok) { diagnostics.push({ ...r.diagnostic, path: file }); return null; }
  return r.text;
}
function observeLedger(repo, sha, ledgerPath, diagnostics, options) {
  const e = { exists: null, tree: null, lastChange: null, lastChangeTree: null, progressText: null, contractTexts: [] };
  if (!sha) return e;
  // Query the parent tree so absence is distinguished from unreadable/missing objects.
  const r = git(repo, ['ls-tree', '-z', sha, '--', ledgerPath], options);
  if (!r.ok) { diagnostics.push(r.diagnostic); return e; }
  let entries; try { entries = parseTree(r.text); } catch { diagnostics.push(diagnostic('invalid-tree', 'Malformed ledger tree', { path: ledgerPath })); return e; }
  if (!entries.length) { e.exists = false; return e; }
  if (entries.length !== 1 || entries[0].type !== 'tree' || entries[0].path !== ledgerPath) { diagnostics.push(diagnostic('invalid-ledger-tree', 'Ledger location must be one tree', { path: ledgerPath })); return e; }
  e.exists = true; e.tree = entries[0].sha;
  const files = git(repo, ['ls-tree', '-r', '-z', sha, '--', `${ledgerPath}/`], options);
  if (!files.ok) { diagnostics.push(files.diagnostic); return e; }
  let listing; try { listing = parseTree(files.text); } catch { diagnostics.push(diagnostic('invalid-tree', 'Malformed ledger files')); return e; }
  for (const entry of listing) {
    const name = entry.path.slice(ledgerPath.length + 1);
    if (name !== 'PROGRESS.md' && !contracts.includes(name)) continue;
    if (entry.type !== 'blob' || !/^100(644|755)$/.test(entry.mode)) { diagnostics.push(diagnostic('invalid-ledger-file', 'Ledger text must be an ordinary file', { path: entry.path })); continue; }
    const text = readBlob(repo, sha, entry.path, diagnostics, options);
    if (name === 'PROGRESS.md') e.progressText = text; else e.contractTexts.push({ path: entry.path, text });
  }
  if (!listing.some(entry => entry.path === `${ledgerPath}/PROGRESS.md`)) diagnostics.push(diagnostic('missing-progress', 'Ledger subtree has no PROGRESS.md', { path: ledgerPath }));
  const log = git(repo, ['log', '-1', '--format=%H', sha, '--', `${ledgerPath}/`], options);
  if (!log.ok) diagnostics.push(log.diagnostic);
  else {
    e.lastChange = log.text.replace(/\r?\n$/, '');
    if (!SHA.test(e.lastChange)) { e.lastChange = null; diagnostics.push(diagnostic('missing-provenance', 'No ledger-changing commit', { path: ledgerPath })); }
    else {
      const tree = git(repo, ['rev-parse', '--verify', `${e.lastChange}:./${ledgerPath}`], options);
      if (!tree.ok) diagnostics.push(tree.diagnostic);
      else { e.lastChangeTree = tree.text.replace(/\r?\n$/, ''); if (e.lastChangeTree !== e.tree) diagnostics.push(diagnostic('conflicting-provenance', 'Last-change subtree differs from captured ledger subtree', { path: ledgerPath })); }
    }
  }
  e.ancestry = {};
  for (const key of ['owner', 'target']) if (Object.hasOwn(options, `${key}Sha`)) {
    const descendantSha = options[`${key}Sha`];
    e.ancestry[key] = { ancestorSha: e.lastChange, descendantSha, result: ancestryCaptured(repo, e.lastChange, descendantSha, diagnostics, options) };
  }
  return e;
}
export function ledger({ repo, ref, ledger: id, ...options }) {
  const diagnostics = [];
  options = provenanceOptions(repo, diagnostics, options);
  const refSha = validId(id) && validFullRef(ref) ? capture(repo, ref, diagnostics, options) : null;
  if (!validId(id) || !validFullRef(ref)) diagnostics.push(diagnostic('invalid-ledger', 'Expected a simple ledger ID and full branch ref'));
  const activePath = `.agents/changes/${id}`, archivePath = `.agents/archive/${id}`;
  return envelope('ledger', repo, { id, ref, refSha, activePath, archivePath,
    active: observeLedger(repo, refSha, activePath, diagnostics, options), archive: observeLedger(repo, refSha, archivePath, diagnostics, options) }, diagnostics, !refSha);
}
function refsRaw(repo, diagnostics, options) {
  const r = git(repo, ['for-each-ref', '--format=%(refname)%00%(objectname)%00%(symref)', 'refs/heads/', 'refs/remotes/'], options);
  if (!r.ok) { diagnostics.push(r.diagnostic); return []; }
  const refs = [];
  for (const line of r.text.split('\n').filter(Boolean)) {
    const [ref, sha, symref, extra] = line.replace(/\r$/, '').split('\0');
    if (extra !== undefined || !validFullRef(ref) || !SHA.test(sha) || symref === undefined) { diagnostics.push(diagnostic('invalid-ref-output', 'Malformed ref record')); continue; }
    refs.push({ ref, sha, symref: symref || null });
  }
  // for-each-ref omits dangling symbolic refs. Inspect only the two loose ref namespaces,
  // then ask Git for their symbolic targets. No HEAD/default/ownership inference.
  const common = git(repo, ['rev-parse', '--git-common-dir'], options);
  if (!common.ok) diagnostics.push(common.diagnostic);
  else {
    const root = path.resolve(repo, common.text.replace(/\r?\n$/, ''));
    const walk = (directory, prefix) => {
      let entries; try { entries = fs.readdirSync(directory, { withFileTypes: true }); } catch (e) { if (e.code !== 'ENOENT') diagnostics.push(diagnostic('refs-unavailable', 'Cannot inspect loose symbolic refs')); return; }
      for (const entry of entries.sort((a, b) => a.name < b.name ? -1 : 1)) {
        const name = `${prefix}/${entry.name}`, file = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(file, name);
        else if (entry.isFile() && !refs.some(x => x.ref === name)) {
          try { if (!fs.readFileSync(file).subarray(0, 5).equals(Buffer.from('ref: '))) continue; } catch { diagnostics.push(diagnostic('refs-unavailable', 'Cannot read loose ref')); continue; }
          const s = git(repo, ['symbolic-ref', '--quiet', name], options);
          if (!s.ok) diagnostics.push(s.diagnostic);
          else refs.push({ ref: name, sha: null, symref: s.text.replace(/\r?\n$/, '') });
        }
      }
    };
    walk(path.join(root, 'refs/heads'), 'refs/heads'); walk(path.join(root, 'refs/remotes'), 'refs/remotes');
  }
  return refs.sort((a, b) => a.ref < b.ref ? -1 : a.ref > b.ref ? 1 : 0);
}
export function discovery({ repo, ...options }) {
  const diagnostics = [];
  options = provenanceOptions(repo, diagnostics, options);
  const refs = refsRaw(repo, diagnostics, options), worktrees = worktreesRaw(repo, diagnostics, options), groups = new Map();
  const add = (id, location) => { if (!groups.has(id)) groups.set(id, { id, locations: [] }); groups.get(id).locations.push(location); };
  for (const ref of refs.filter(x => !x.symref)) {
    const r = git(repo, ['ls-tree', '-r', '-z', ref.sha, '--', '.agents/changes/'], options);
    if (!r.ok) { diagnostics.push(r.diagnostic); continue; }
    let entries; try { entries = parseTree(r.text); } catch { diagnostics.push(diagnostic('invalid-tree', 'Malformed discovery tree')); continue; }
    for (const entry of entries) {
      const m = /^\.agents\/changes\/([^/]+)\/PROGRESS\.md$/.exec(entry.path);
      if (!m) continue;
      if (!validId(m[1])) { diagnostics.push(diagnostic('invalid-ledger', 'Unsupported ledger ID', { path: entry.path })); continue; }
      add(m[1], { kind: 'ref', ref: ref.ref, sha: ref.sha, path: entry.path, provenance: observeLedger(repo, ref.sha, `.agents/changes/${m[1]}`, diagnostics, options), worktrees: worktrees.filter(w => w.branch === ref.ref) });
    }
  }
  for (const wt of worktrees.filter(x => !x.bare)) {
    const root = path.join(wt.path, '.agents/changes');
    let dirs;
    try { if (fs.lstatSync(root).isSymbolicLink()) throw new Error(); dirs = fs.readdirSync(root, { withFileTypes: true }); }
    catch (e) { if (e.code !== 'ENOENT') diagnostics.push(diagnostic('ledger-directory-unavailable', 'Cannot inspect working-tree active ledgers', { path: root })); continue; }
    for (const dir of dirs.sort((a, b) => a.name < b.name ? -1 : 1)) {
      if (!dir.isDirectory() || !validId(dir.name)) continue;
      const file = path.join(root, dir.name, 'PROGRESS.md');
      try {
        const stat = fs.lstatSync(file); if (!stat.isFile()) throw new Error();
        const progressText = decode(fs.readFileSync(file)), contractTexts = [];
        for (const name of contracts) {
          const p = path.join(root, dir.name, name);
          try { if (!fs.lstatSync(p).isFile()) throw new Error(); contractTexts.push({ path: p, text: decode(fs.readFileSync(p)) }); } catch (e) { if (e.code !== 'ENOENT') diagnostics.push(diagnostic('contract-unavailable', 'Working contract cannot be read', { path: p })); }
        }
        add(dir.name, { kind: 'worktree', path: file, branch: wt.branch, head: wt.head, cleanliness: wt.cleanliness, status: wt.status, progressText, contractTexts });
      } catch (e) { if (e.code !== 'ENOENT') diagnostics.push(diagnostic('ledger-unavailable', 'Working ledger cannot be read', { path: file })); }
    }
  }
  return envelope('discovery', repo, { refs, worktrees, ledgers: [...groups.values()].sort((a, b) => a.id < b.id ? -1 : 1) }, diagnostics, !refs.length && !worktrees.length);
}
export function parseFlags(args, names, required) {
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!key?.startsWith('--') || !names.includes(key.slice(2)) || Object.hasOwn(result, key.slice(2)) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Unknown, missing or duplicate flag');
    result[key.slice(2)] = args[i + 1];
  }
  if (required.some(key => !Object.hasOwn(result, key))) throw new Error('Required flag missing');
  return result;
}
export function evidenceCli(args) {
  if (args.length === 1 && args[0] === '--help') return { code: 0, text: 'git-evidence.mjs <discovery|worktrees|ancestry|shipment|ledger> --repo <repo>\nancestry: --ancestor <ref-or-sha> --descendant <ref-or-sha>\nshipment: --integration <full-ref> --source <local|remote> [--remote <name>] --ref <full-ref>\nledger: --ref <full-ref> --ledger <id> [--owner <ref-or-sha>] [--target <ref-or-sha>]\nExit 0: complete facts (including not-contained); exit 2: partial/unknown or invalid invocation.\n' };
  const operation = args[0] || null;
  try {
    const defs = { discovery: [], worktrees: [], ancestry: ['ancestor', 'descendant'], shipment: ['integration', 'source', 'ref'], ledger: ['ref', 'ledger'] };
    if (!Object.hasOwn(defs, operation)) throw new Error('Unknown or missing operation');
    const required = ['repo', ...defs[operation]], extra = operation === 'shipment' ? ['remote'] : operation === 'ledger' ? ['owner', 'target'] : [];
    const options = parseFlags(args.slice(1), [...required, ...extra], required);
    const result = ({ discovery, worktrees, ancestry, shipment, ledger })[operation](options);
    return { code: result.completeness === 'complete' ? 0 : 2, result };
  } catch { return { code: 2, result: { operation, repo: null, completeness: 'unknown', evidence: {}, diagnostics: [diagnostic('usage', 'Invalid invocation; use --help for explicit command and flags')] } }; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const output = evidenceCli(process.argv.slice(2)); process.stdout.write(output.text ?? JSON.stringify(output.result) + '\n'); process.exitCode = output.code;
}
