"use client";
import {useEffect,useState} from 'react';
import {recordSnapshot,downloadCsv} from '@/lib/election-history.mjs';
import {electionCsv} from '@/lib/election-core.mjs';
import type {ElectionResult} from '@/lib/election-types';
type Context={place:string;uf:string;town:string;office:string;turn:string};
type Snapshot={id:string;recordedAt:string;result:ElectionResult;context:Context};
export function ElectionHistory({result,context}:{result:ElectionResult|null;context:Context}){
 const [snapshots,setSnapshots]=useState<Snapshot[]>([]),[unavailable,setUnavailable]=useState(false);
 const key=[context.uf,context.town,context.office,context.turn].join(':');
 useEffect(()=>{setSnapshots([]);},[key]); useEffect(()=>{let active=true;if(result?.status==='ok'&&!result.stale)recordSnapshot(result,context).then(rows=>{if(active){setSnapshots(rows as Snapshot[]);setUnavailable(false);}}).catch(()=>{if(active)setUnavailable(true);});return()=>{active=false};},[result,key]);
 return <details className="history-panel"><summary>Histórico deste navegador</summary><p>Até 20 atualizações desta consulta, registradas enquanto o painel está aberto neste navegador. Não é um histórico nacional. Os registros podem ser apagados pelo navegador.</p>{unavailable?<p role="status">O histórico local não está disponível neste navegador.</p>:snapshots.length?<ul>{snapshots.map(s=><li key={s.id}><div><strong>{s.result.updated??s.result.generated??'Horário do TSE indisponível'}</strong><span>{s.result.progress?.toLocaleString('pt-BR')??'—'}% totalizado · {s.result.indicators?.votes?.toLocaleString('pt-BR')??'—'} votos computados</span></div><button type="button" onClick={()=>downloadCsv(s.result,{...s.context,csv:electionCsv})}>Baixar CSV desta atualização</button></li>)}</ul>:<p>Aguardando um resultado oficial para registrar.</p>}</details>;
}

