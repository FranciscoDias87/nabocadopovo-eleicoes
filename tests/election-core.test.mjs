import test from 'node:test';
import assert from 'node:assert/strict';
import {readNumber,normalizeSearch,readFilters,csvCell,electionCsv} from '../lib/election-core.mjs';
test('missing numbers remain unavailable',()=>{for(const v of [null,undefined,'','bad'])assert.equal(readNumber(v),null);assert.equal(readNumber('0'),0);assert.equal(readNumber('23,5'),23.5);});
test('search ignores accents',()=>assert.equal(normalizeSearch(' São João '),'sao joao'));
test('filters validate geography and office',()=>{assert.equal(readFilters('?uf=xx&office=6',['sp']).office,'1');assert.equal(readFilters('?uf=df&office=8',['df']).office,'7');assert.equal(readFilters('?uf=sp&office=6&turn=2',['sp']).office,'1');});
test('CSV exports all candidates and labels stale data',()=>{const candidates=Array.from({length:1045},(_,id)=>({id,name:'João',votes:0}));const csv=electionCsv({candidates,stale:true},{uf:'sp',office:'6'});assert.equal(csv.split('\r\n').length,1046);assert.ok(csv.includes('"sim"'));assert.equal(csvCell('=formula'),'"\'=formula"');assert.equal(csvCell('a"b'),'"a""b"');});
