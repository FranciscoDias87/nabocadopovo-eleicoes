import {readNumber,compareCandidates,mathematicalWinners,allSectionsTotalized} from '@/lib/election-core.mjs';
import candidatePhotoIds from '@/lib/candidate-photo-ids.json';
import {electionIndicators} from '@/lib/election-indicators';
import {states} from '@/lib/geography';
export const dynamic='force-dynamic';
type Json=Record<string,any>;
type Entry={data:Json|null;until:number;error?:string;stale?:boolean;etag?:string;modified?:string};
const memory=new Map<string,Entry>();
const pending=new Map<string,Promise<Entry>>();
const base='https://resultados.tse.jus.br';
const availablePhotos=new Set(candidatePhotoIds);
const candidatePhoto=(id:unknown)=>typeof id==='string'&&/^\d{11,12}$/.test(id)&&availablePhotos.has(id)?'/candidates/2026/'+id+'.jpg':null;
// Requests are shared per file. Missing files are retried slowly to avoid 404 bursts.
async function file(url:string,ttl=25000):Promise<Entry>{
 const old=memory.get(url);if(old&&old.until>Date.now())return old;
 if(pending.has(url))return pending.get(url)!;
 const task=(async()=>{let edge:Cache|undefined;let cacheKey:Request|undefined;
 try{edge=(caches as unknown as {default?:Cache}).default;cacheKey=new Request(url);if(edge){const hit=await edge.match(cacheKey);if(hit){const e=await hit.json() as Entry;memory.set(url,e);return e;}}}catch{}
 let entry:Entry;
 try{const headers:Record<string,string>={Accept:'application/json'};if(old?.etag)headers['If-None-Match']=old.etag;else if(old?.modified)headers['If-Modified-Since']=old.modified;
 const response=await fetch(url,{headers,signal:AbortSignal.timeout(15000)});
 if(response.status===304&&old?.data)entry={...old,until:Date.now()+ttl,stale:false,error:undefined};
 else if(response.status===404)entry=old?.data?{...old,until:Date.now()+60000,stale:true,error:'waiting'}:{data:null,until:Date.now()+60000,error:'waiting'};
 else if(!response.ok)throw new Error('upstream');
 else{const data=await response.json() as Json;if(!data||data.f!=='o')throw new Error('non_official');entry={data,until:Date.now()+ttl,etag:response.headers.get('etag')??undefined,modified:response.headers.get('last-modified')??undefined};}
 }catch{console.warn(JSON.stringify({event:'tse_fetch_failed',file:new URL(url).pathname,hasPrevious:!!old?.data}));entry={data:old?.data??null,until:Date.now()+60000,error:'error',stale:!!old?.data,etag:old?.etag,modified:old?.modified};}
 if(memory.size>128)memory.delete(memory.keys().next().value!);memory.set(url,entry);
 if(edge&&cacheKey)try{await edge.put(cacheKey,Response.json(entry,{headers:{'Cache-Control':`public, max-age=${Math.max(1,Math.floor((entry.until-Date.now())/1000))}`}}));}catch{}
 return entry;})();pending.set(url,task);try{return await task;}finally{pending.delete(url);}
}
const number=readNumber;
const reply=(data:Json)=>Response.json(data,{headers:{'Cache-Control':'public, max-age=0, s-maxage=15, stale-while-revalidate=30','X-Content-Type-Options':'nosniff'}});
const unavailable=(e:Entry)=>reply({status:e.error==='waiting'?'waiting':'error',message:e.error==='waiting'?'Aguardando a disponibilização do arquivo oficial pelo TSE.':'Não foi possível consultar o TSE. Tentaremos novamente automaticamente.'});
export async function GET(request:Request){
 const p=new URL(request.url).searchParams,kind=p.get('kind')??'result',uf=p.get('uf')??'br',office=p.get('office')??'1',town=p.get('town')??'all',turn=p.get('turn')??'1';
 if(!['result','summary','towns'].includes(kind)||!['1','2'].includes(turn)||!(uf==='br'||states.some(s=>s[0]===uf))||!['1','3','5','6','7','8'].includes(office)||!(town==='all'||/^\d{5}$/.test(town)))return Response.json({status:'error',message:'Filtro inválido.'},{status:400});
 if(kind==='result'&&((uf==='br'&&(office!=='1'||town!=='all'))||(office==='8'&&uf!=='df')||(office==='7'&&uf==='df')||(turn==='2'&&!['1','3'].includes(office))))return Response.json({status:'error',message:'Cargo indisponível nesta abrangência ou turno.'},{status:400});
 const config=await file(`${base}/oficial/comum/config/ele-c.json`,3600000);if(!config.data)return unavailable(config);
 const pleito=(config.data.pl??[]).find((pl:Json)=>pl.c==='ele2026'&&(pl.e??[]).some((e:Json)=>String(e.t)===turn&&String(e.sup??'n')!=='s'));
 // For a future second turn, use the TSE's explicit cdt2 mapping, never invent IDs.
 const first=(config.data.pl??[]).find((pl:Json)=>String(pl.cd)==='3220');
 const wantOffice=kind==='summary'?'3':kind==='towns'?'1':office;
 const matches=(e:Json)=>(e.abr??[]).some((a:Json)=>(a.cp??[]).some((c:Json)=>String(c.cd)===wantOffice));
 let election=pleito?.e?.find((e:Json)=>String(e.t)===turn&&matches(e));
 let cycle=pleito?.c;
 if(!election&&turn==='2'){const e=first?.e?.find(matches);if(e?.cdt2){election={...e,cd:e.cdt2,t:'2'};cycle=first.c;}}
 if(!election||!/^\d+$/.test(String(election.cd))||!/^ele\d{4}$/.test(String(cycle)))return reply({status:'waiting',message:'A configuração deste turno ainda não está disponível no TSE.'});
 const id=String(election.cd),pad=id.padStart(6,'0'),root=`${base}/oficial/${cycle}/${id}`;
 if(kind==='towns'){
 const e=await file(`${root}/config/mun-e${pad}-cm.json`,3600000);if(!e.data)return unavailable(e);
 const abr=(e.data.abr??[]).find((a:Json)=>a.cd===uf);
 return reply({status:'ok',towns:(abr?.mu??[]).map((m:Json)=>({cd:String(m.cd).padStart(5,'0'),nm:String(m.nm)})).sort((a:Json,b:Json)=>a.nm.localeCompare(b.nm,'pt-BR'))});
 }
 if(kind==='summary'){
 const url=`${root}/dados/br/br-e${pad}-ab.json`,e=await file(url);if(!e.data)return unavailable(e);
 if(String(e.data.ele)!==id||String(e.data.t)!==turn)return reply({status:'error',message:'Arquivo de outra eleição rejeitado.'});
 return reply({status:'ok',stale:!!e.stale,updated:`${e.data.dg} ${e.data.hg}`,source:url,states:(e.data.abr??[]).filter((a:Json)=>states.some(s=>s[0]===a.cdabr)).map((a:Json)=>({uf:a.cdabr,progress:number(a.s?.pst),status:a.and}))});
 }
 // Accept only a municipality present in the official municipality configuration.
 if(town!=='all'){const towns=await file(`${root}/config/mun-e${pad}-cm.json`,3600000);if(!towns.data)return unavailable(towns);const valid=(towns.data.abr??[]).some((a:Json)=>a.cd===uf&&(a.mu??[]).some((m:Json)=>String(m.cd).padStart(5,'0')===town));if(!valid)return Response.json({status:'error',message:'Município inválido.'},{status:400});}
 const url=`${root}/dados/${uf}/${uf}${town==='all'?'':town}-c${office.padStart(4,'0')}-e${pad}-u.json`,e=await file(url);if(!e.data)return unavailable(e);const d=e.data;
 if(String(d.ele)!==id||String(d.t)!==turn||!(d.carg??[]).some((c:Json)=>String(c.cd)===office))return reply({status:'error',message:'Arquivo de outra eleição ou cargo rejeitado.'});
 if(d.dv!=='s')return reply({status:'waiting',message:'O TSE ainda não liberou a divulgação desta abrangência.'});
 const mathematical=new Set(mathematicalWinners(d,office,uf,town,!!e.stale));
 const candidates=(d.carg??[]).filter((c:Json)=>String(c.cd)===office).flatMap((c:Json)=>(c.agr??[]).flatMap((a:Json)=>(a.par??[]).flatMap((par:Json)=>(par.cand??[]).map((c:Json)=>({id:String(c.sqcand??''),mathematical:mathematical.has(String(c.sqcand)),photo:candidatePhoto(c.sqcand),name:String(c.nmu??c.nm),number:String(c.n),party:String(par.sg),votes:number(c.vap),percent:number(c.pvap),situation:String(c.st??'')}))))).sort(compareCandidates);
 return reply({status:'ok',finished:d.and==='f',sectionsComplete:allSectionsTotalized(d),message:d.and==='f'?'Totalização finalizada':d.and==='p'?'Apuração em andamento':'Apuração não iniciada',stale:!!e.stale,updated:d.dt && d.ht ? `${d.dt} ${d.ht}` : undefined,generated:`${d.dg} ${d.hg}`,source:url,progress:number(d.s?.pst),counted:number(d.s?.st),total:number(d.s?.ts),indicators:electionIndicators(d),valid:number(d.v?.vv),blank:number(d.v?.vb),nullVotes:number(d.v?.tvn),candidates});
}




