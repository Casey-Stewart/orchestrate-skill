import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(root,'../wt-B03');
const sha='7a3ab268a0b318ce080065df628cb1b2386ed980',base='6e1fb4428e871760d8f31a99606c3ad68db5015f';
function git(...args){const r=spawnSync('git',['-c','safe.directory='+repo,...args],{cwd:repo,encoding:'utf8',windowsHide:true});assert.equal(r.status,0,r.stderr);return r.stdout;}
assert.equal(git('rev-parse','HEAD').trim(),sha);assert.equal(git('status','--porcelain').trim(),'');
const ledger='.agents/changes/OS-20260918-readonly-evidence-smoke-inputs/';
assert.equal(git('rev-parse',sha+':'+ledger+'00-READBEFORE.md').trim(),'0add94797721d18049d4c7492daa5d6ea488dcda');
assert.equal(git('rev-parse',sha+':'+ledger+'01-plan.md').trim(),'5b145f8819af05db6bc166d2364b031942673007');
const meaning={
 'README.md':{171:'1/9: public helper/input-tool census',177:'1/9: evidence versus frozen authority',182:'10: recursive FullName recipe and portable command',202:'1/9: actual CLI test documentation',210:'2/6/7/8: real Excel input, environment boundary, usable delivery/reissue'},
 'orchestrate/SKILL.md':{35:'1: discovery helper with frozen-contract precedence',152:'1/2/8: mechanical gate and conductor input lifecycle'},
 'orchestrate/references/execution-models.md':{9:'1/2/8: gate order and per-step input lifecycle'},
 'orchestrate/references/protocol.md':{138:'1/9: commands, captured authority, grammar, outcomes and manual fallback',295:'2/3/4/5/6/7/8: complete immutable input lifecycle and concrete Python example',590:'1: preserve mechanical-before-semantic gate'},
 'orchestrate/references/scaffolding.md':{30:'2: planning input inventory',89:'1/2/6: self-contained helper/input/environment baking',148:'1/9: tool path placeholder registration'},
 'orchestrate/references/smoke-page-template.html':{539:'7: keep long file links usable in existing layout',760:'3/7: explain stable-ID and resolved display schema',963:'7: encoded file/evidence links and plain-text use/reset metadata',1042:'7: insert input details in existing step body',1341:'7: exact input/evidence/use/reset in copied results'},
 'orchestrate/references/smoke-page.md':{178:'2/3/4/5/6/7/8/9: complete input registry/runtime/history/delivery contract'},
 'orchestrate/references/subagent-prompts.md':{8:'2/8: input responsibility and retained revisions for roles',213:'2/7: QA receives and verifies exact actual files',258:'2: pre-flight checks input completeness'},
 'orchestrate/templates/00-READBEFORE.md':{80:'1/9: bake full helper/fallback contract',287:'2/3/4/5/6/7/8: bake complete input lifecycle and validation example',601:'1: preserve mechanical-before-semantic gate'},
 'orchestrate/templates/01-plan.md':{32:'2: per-step input inventory'},
 'orchestrate/templates/02-batch.md':{3:'1/9: machine-supported exact Branch grammar',8:'1/9: machine-supported exact Files grammar',53:'2: input completeness in canonical smoke steps'},
 'orchestrate/templates/PROGRESS.md':{61:'2/8: issued immutable inputs and revision evidence record'},
 'orchestrate/tools/build-smoke-page.mjs':{16:'3/4: consume same-fence input runtime',21:'4: explicit imported inputRoot',25:'4/5: actual disk validation before HTML output',79:'3/7: resolved step input display data',173:'3: reject malformed declarations',178:'4/8: enforce historical artifact retention',223:'8: compare resolved identities for every existing referencing step',264:'4: output-relative root and no overwriting issued artifacts',270:'4: pass actual root from CLI to builder',282:'4: legacy baseline retains real input validation'},
 'orchestrate/tools/smoke-inputs.mjs':{1:'3/4/5/8: declarations, safe paths, raw bytes, retained history, resolved identities'},
 'tests/build-smoke-page.test.cjs':{10:'3/4/5: hash actual fixture bytes',395:'3/4/5/8/9: real-file import/CLI, safe rejection, shared revisions and multi-issue history'},
 'tests/protocol-contract.test.cjs':{1:'1/2/6/9/10: real recipes, generated grammar, frozen mirrors/registry, interpreter boundary and actual recursive sentinel'},
 'tests/smoke-inputs.test.cjs':{1:'3/4/5/8: actual fixture bytes, malformed/safe-path cases, raw tampering, retained history and effective fresh-checkout attributes'},
 'tests/smoke-page.test.cjs':{9:'7/8: file/hash support for true builder consumer test',139:'7/8: builder-to-page-to-saved-verdict same-build path, links and unrelated marks'},
 [ledger+'02-batches-03-workflow-input-delivery.md']:{111:'exempt: ten own checklist ticks only'}
};
const diff=git('diff','--unified=0',base+'...'+sha);fs.writeFileSync(path.join(root,'reviewed-diff.patch'),diff);
let file;const hunks=[];
for(const line of diff.split('\n')){if(line.startsWith('+++ b/'))file=line.slice(6);if(line.startsWith('@@ ')){const start=Number(line.match(/\+(\d+)/)[1]);assert.ok(meaning[file]?.[start],file+':'+start+' unmapped');hunks.push({file,hunk:line,item:meaning[file][start]});}}
fs.writeFileSync(path.join(root,'hunk-map.json'),JSON.stringify({candidate:sha,base,changedFileCount:Object.keys(meaning).length,hunks,readAllChangedFiles:true,frozenAuthorityUnchanged:true,clean:true},null,2));
console.log(`PASS: ${hunks.length} individually mapped hunks in ${Object.keys(meaning).length} changed paths; clean exact candidate and frozen authority blobs unchanged`);
