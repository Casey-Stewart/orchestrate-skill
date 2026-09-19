import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
const repo=process.argv[2];
const r=spawnSync('git',['show','f918fe39762c70edb9a3424e54eaa208fd7c5727:./orchestrate/references/protocol.md'],{cwd:repo,encoding:'utf8'});
if(r.status!==0)throw new Error(r.stderr);
const old=r.stdout.replace(/\r\n/g,'\n'), current=fs.readFileSync(repo+'/orchestrate/references/protocol.md','utf8').replace(/\r\n/g,'\n');
for(const heading of ['| Ledger says |','| Subject |']) {
  function table(source) { const rows=[]; for(const line of source.slice(source.indexOf(heading)).split('\n')) {
    if(!/^\s*\|/.test(line))break; rows.push(line);
  } return rows.join('\n').replace(/[\x60]/g,'').replace(/\s+/g,' ').trim(); }
  if(table(old)!==table(current))throw new Error('Starting rule changed: '+heading);
  console.log(heading, createHash('sha256').update(table(old)).digest('hex'), 'UNCHANGED from approved starting commit');
}
