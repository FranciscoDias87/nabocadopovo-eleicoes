"use client";
import {Search,Radio} from 'lucide-react';
import {useEffect,useState} from 'react';
import {CandidatePhoto} from './candidate-photo';
import {normalizeSearch,isElected} from '@/lib/election-core.mjs';
import type {ElectionResult} from '@/lib/election-types';
const format=(v:number|null|undefined)=>v==null?'—':v.toLocaleString('pt-BR');
export function CandidateList({result,loading,selection,office}:{result:ElectionResult|null;loading:boolean;selection:string;office:string}){
 const [query,setQuery]=useState(''),[limit,setLimit]=useState(40);
 useEffect(()=>{setQuery('');setLimit(40);},[selection]);
 const candidates=(result?.candidates??[]).filter(c=>normalizeSearch(`${c.name} ${c.number} ${c.party}`).includes(normalizeSearch(query)));
 return <><div className="search"><Search size={18}/><input aria-label="Buscar candidato, número ou partido" placeholder="Buscar candidato, número ou partido" value={query} onChange={e=>{setQuery(e.target.value);setLimit(40);}}/></div><p className="candidate-count" role="status">{candidates.length?`Exibindo ${Math.min(limit,candidates.length)} de ${candidates.length.toLocaleString('pt-BR')} candidatos`:''}</p>{candidates.length?<><ul className="candidate-list" aria-label="Votação dos candidatos">{candidates.slice(0,limit).map(c=><li key={c.id||c.number} className={["candidate-card",["5","6","7"].includes(office)&&isElected(c.situation)?"candidate-elected":""].filter(Boolean).join(" ")}><div className="candidate"><CandidatePhoto key={c.photo??c.id} src={c.photo} name={c.name}/><div><strong>{c.name}</strong>{["5","6","7"].includes(office)&&isElected(c.situation)&&<span className="elected-label">✓ Eleito · TSE</span>}<small><b className="candidate-number">{c.number}</b> · {c.party}{c.situation?' · '+c.situation:''}</small></div></div><div className="candidate-totals"><div><span>Votos</span><strong>{format(c.votes)}</strong></div><div><span>Percentual do TSE</span><strong>{c.percent==null?'—':c.percent.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%'}</strong></div></div><div className="vote-bar" aria-hidden="true"><span style={{width:`${Math.min(c.percent??0,100)}%`,background:'var(--candidate-vote-color,#0766ad)'}}/></div></li>)}</ul>{candidates.length>limit&&<button className="load-more" type="button" onClick={()=>setLimit(n=>n+40)}>Carregar mais 40 candidatos</button>}</>:<div className="empty"><Radio size={34}/><h3>{query?'Nenhum candidato encontrado':loading?'Consultando os resultados':result?.status==='error'?'Consulta indisponível':result?.status==='ok'?'Sem candidatos disponíveis':'Aguardando a divulgação'}</h3><p>{query?'Tente outro nome, número ou partido.':result?.message??'Os candidatos aparecerão conforme a publicação oficial do TSE.'}</p></div>}</>;
}


