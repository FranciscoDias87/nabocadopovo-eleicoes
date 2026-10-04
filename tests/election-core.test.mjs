import test from 'node:test';
import assert from 'node:assert/strict';
import {readNumber,normalizeSearch,readFilters,csvCell,electionCsv} from '../lib/election-core.mjs';
test('missing numbers remain unavailable',()=>{for(const v of [null,undefined,'','bad'])assert.equal(readNumber(v),null);assert.equal(readNumber('0'),0);assert.equal(readNumber('23,5'),23.5);});
test('search ignores accents',()=>assert.equal(normalizeSearch(' São João '),'sao joao'));
test('filters validate geography and office',()=>{assert.equal(readFilters('?uf=xx&office=6',['sp']).office,'1');assert.equal(readFilters('?uf=df&office=8',['df']).office,'7');assert.equal(readFilters('?uf=sp&office=6&turn=2',['sp']).office,'1');});
test('CSV exports all candidates and labels stale data',()=>{const candidates=Array.from({length:1045},(_,id)=>({id,name:'João',votes:0}));const csv=electionCsv({candidates,stale:true},{uf:'sp',office:'6'});assert.equal(csv.split('\r\n').length,1046);assert.ok(csv.includes('"sim"'));assert.equal(csvCell('=formula'),'"\'=formula"');assert.equal(csvCell('a"b'),'"a""b"');});
test('elected candidates precede higher-vote non-elected candidates',async()=>{
 const {compareCandidates,isElected}=await import('../lib/election-core.mjs');
 for(const s of ['Eleito','ELEITO POR QP','Eleito por média','Eleita'])assert.equal(isElected(s),true);
 for(const s of ['Não eleito','Suplente','2º turno','',null,'Eleito pendente'])assert.equal(isElected(s),false);
 const rows=[{name:'Líder',votes:1000,situation:'Não eleito'},{name:'B',votes:50,situation:'Eleito por média'},{name:'A',votes:100,situation:'Eleito por QP'},{name:'Suplente',votes:300,situation:'Suplente'}];
 assert.deepEqual(rows.sort(compareCandidates).map(c=>c.name),['A','B','Líder','Suplente']);
 rows[0].situation='Não eleito';rows[2].situation='Eleito';
 assert.equal(rows.sort(compareCandidates)[0].name,'Líder');
 assert.deepEqual([{name:'Z',votes:null},{name:'B',votes:0},{name:'A',votes:0}].sort(compareCandidates).map(c=>c.name),['A','B','Z']);
});
test('final badge requires explicit finalization, not partial election status',async()=>{const {electionBadge}=await import('../lib/election-core.mjs');for(const office of ['5','6','7']){assert.equal(electionBadge(office,'Eleito por QP',false),'Na zona de eleição · provisório');assert.equal(electionBadge(office,'Eleito',undefined),'Na zona de eleição · provisório');assert.equal(electionBadge(office,'Eleito',true),'✓ Eleito · TSE');assert.equal(electionBadge(office,'Suplente',true),null);}assert.equal(electionBadge('1','Eleito',true),null);});
