"use client";
import {useEffect,useState} from 'react';
import {Radio,RefreshCw,Clock,ExternalLink} from 'lucide-react';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {Progress} from '@/components/ui/progress';
import {BrazilMap} from '@/components/brazil-map';
import {ElectionNumbers} from '@/components/election-numbers';
import {CandidateList} from '@/components/candidate-list';
import {MunicipalityPicker} from '@/components/municipality-picker';
import {ElectionHistory} from '@/components/election-history';
import {useElectionResult} from '@/hooks/use-election-result';
import {readFilters,electionCsv} from '@/lib/election-core.mjs';
import {downloadCsv} from '@/lib/election-history.mjs';
import {states} from '@/lib/geography';
const num=(v:number|null|undefined)=>v==null?'—':v.toLocaleString('pt-BR');
const pct=(v:number|null|undefined)=>v==null?'—':v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';

export default function Home(){
 const [filters,setFilters]=useState({uf:'br',office:'1',town:'all',turn:'1'});
 const [ready,setReady]=useState(false),[refresh,setRefresh]=useState(0),[shareMessage,setShareMessage]=useState('');
 const {uf,office,town,turn}=filters;
 const cargo=office==='7'&&uf==='df'?'8':office;
 useEffect(()=>{const restore=()=>{setFilters(readFilters(location.search,states.map(s=>s[0])) as typeof filters);setReady(true);};restore();window.addEventListener('popstate',restore);return()=>window.removeEventListener('popstate',restore);},[]);
 useEffect(()=>{if(!ready)return;const url=new URL(location.href);url.searchParams.set('uf',uf);url.searchParams.set('office',cargo);url.searchParams.set('town',town);url.searchParams.set('turn',turn);window.history.replaceState(window.history.state,'',url);},[uf,cargo,town,turn,ready]);
 const selection=`kind=result&uf=${uf}&office=${cargo}&town=${town}&turn=${turn}`;
 const {result,loading,checkedAt}=useElectionResult(selection,refresh,ready);
 const {result:summary}=useElectionResult(`kind=summary&turn=${turn}`,refresh,ready);
 const {result:townResult}=useElectionResult(`kind=towns&uf=${uf}&turn=${turn}`,refresh,ready&&uf!=='br',300000);
 const towns=townResult?.towns??[];
 const chooseUf=(value:string)=>setFilters(f=>({...f,uf:value,town:'all',office:value==='br'?'1':f.office}));
 const title=office==='1'?'Presidente da República':office==='3'?'Governador':office==='5'?'Senador':office==='6'?'Deputado federal':uf==='df'?'Deputado distrital':'Deputado estadual';
 const stateName=states.find(s=>s[0]===uf)?.[1]??'Brasil';
 const place=town==='all'?stateName:towns.find(t=>t.cd===town)?.nm??`Município ${town}`;
 const context={place,uf,town,office:cargo,officeName:title,turn};
 const picker=(value:string,onChange:(v:string)=>void,items:[string,string][],label:string)=><Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label}><SelectValue/></SelectTrigger><SelectContent>{items.map(([id,name])=><SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select>;
 const share=async()=>{try{await navigator.clipboard.writeText(location.href);setShareMessage('Link desta consulta copiado.');}catch{setShareMessage('Copie o endereço desta página para compartilhar a consulta.');}};
 return <><a className="skip-link" href="#results">Ir para os resultados</a><header><div className="brand"><img src="/logo.png" alt="Na Boca do Povo"/><div><span className="eyebrow">COBERTURA ESPECIAL</span><strong>ELEIÇÕES <em>2026</em></strong></div></div><a className="source" aria-label="Abrir os resultados oficiais no TSE" href="https://resultados.tse.jus.br/" target="_blank" rel="noreferrer"><span>Fonte oficial: TSE</span><ExternalLink size={18}/></a></header>
 <main><div className="headline"><div><span className="eyebrow blue">O BRASIL NAS URNAS</span><h1>{uf==='br'?'Apuração nacional':`Apuração em ${place}`}</h1><p>Resultados oficiais, de todo o país, no Na Boca do Povo.</p></div><div className="edition"><Radio/><div><strong>{turn==='1'?'04':'25'} de outubro</strong><span>{turn}º turno · Eleições 2026</span></div></div></div>
 <nav className="view-links" aria-label="Navegação do painel"><a href="#results">Resultados</a><a href="#map">Mapa do Brasil</a></nav>
 <section className="filters" aria-label="Filtros">
 <label>Turno{picker(turn,value=>setFilters(f=>({...f,turn:value,town:'all',office:value==='2'?'1':f.office})),[['1','1º turno'],['2','2º turno']],'Turno')}</label>
 <label>Estado{picker(uf,chooseUf,[['br','Brasil inteiro'],...states],'Estado')}</label>
 <label>Cargo{picker(office,value=>setFilters(f=>({...f,office:value})),uf==='br'?[['1','Presidente']]:turn==='2'?[['1','Presidente'],['3','Governador']]:[['1','Presidente'],['3','Governador'],['5','Senador'],['6','Deputado federal'],['7',uf==='df'?'Deputado distrital':'Deputado estadual']],'Cargo')}</label>
 <div className="municipality-label"><span>Município</span><MunicipalityPicker value={town} onChange={value=>setFilters(f=>({...f,town:value}))} towns={towns} disabled={uf==='br'||!towns.length}/></div>
 <button className="refresh" aria-label="Atualizar resultados" disabled={loading} onClick={()=>setRefresh(n=>n+1)}><RefreshCw size={20} className={loading?'spin':''}/><span>Atualizar</span></button>
 </section>
 {uf!=='br'&&townResult?.status==='error'&&<p className="notice">A lista de municípios não pôde ser atualizada. Tentaremos novamente.</p>}
 <div className="statusline" aria-live="polite"><span><Clock size={16}/>{result?.stale?'Atualização indisponível · mantendo o último resultado recebido':loading?'Consultando o TSE…':result?.message??'Aguardando a divulgação oficial'}</span><span>Consulta automática a cada 30 segundos{checkedAt?` · Última consulta: ${checkedAt}`:''}</span></div>
 <div className="dashboard"><section id="results" className="panel results" tabIndex={-1}>
 <div className="panel-head"><div><span className="eyebrow blue">{place} · {turn}º TURNO</span><h2>{title}</h2></div><span className="badge">{result?.stale?'Dados anteriores':result?.status==='ok'?'Oficial':'Aguardando'}</span></div>
 <div className="counting"><div><span>Seções totalizadas</span><strong>{pct(result?.progress)}</strong></div><Progress value={result?.progress??0} aria-label="Percentual de seções totalizadas"/><p>{result?.total!=null?`${num(result.counted)} de ${num(result.total)} seções`:'Aguardando os dados oficiais de totalização.'}</p></div>
 <div className="latest-result"><strong>Última totalização do TSE: {result?.updated??'ainda não disponível'}</strong>{result?.generated&&<span>Arquivo gerado: {result.generated}</span>}{result?.stale&&<p role="status">Estes dados são anteriores à falha de atualização e podem estar desatualizados.</p>}{result?.source&&<a href={result.source} target="_blank" rel="noreferrer">Conferir arquivo oficial</a>}</div>
 <div className="result-actions"><button type="button" onClick={share}>Copiar link desta consulta</button><button type="button" disabled={result?.status!=='ok'} onClick={()=>result&&downloadCsv(result,{...context,csv:electionCsv})}>Baixar CSV completo</button></div><p className="share-message" role="status">{shareMessage}</p>
 <CandidateList result={result} loading={loading} selection={selection}/>
 <details className="indicators-panel"><summary>Eleitorado e indicadores completos</summary><ElectionNumbers data={result?.indicators} place={place} office={cargo}/></details>
 <ElectionHistory result={result} context={context}/>
 </section>
 <aside id="map" className="panel national"><div className="panel-head"><div><span className="eyebrow blue">PANORAMA NACIONAL</span><h2>Apuração pelo Brasil</h2></div></div><div className="map-actions"><button type="button" className="national-button" aria-pressed={uf==='br'} onClick={()=>chooseUf('br')}>Brasil inteiro</button></div><p className="map-caption">Selecione uma UF para ver seus resultados.</p><BrazilMap selected={uf} onSelect={chooseUf} results={summary?.states}/><div className="legend"><span><i/>Sem dados / em apuração</span><span><i className="yellow"/>UF selecionada</span></div><p className="fine">Limites geográficos: IBGE · Totalização da eleição estadual</p>{summary?.stale&&<p className="notice">Mapa com dados anteriores: atualização temporariamente indisponível.</p>}{summary?.status==='error'&&<p className="notice">O panorama nacional não pôde ser atualizado.</p>}</aside></div>
 <footer><strong>NA BOCA DO POVO <span>· ELEIÇÕES 2026</span></strong><p>Dados e fotos: Tribunal Superior Eleitoral. Painel independente do programa Na Boca do Povo.</p><p>Resultados parciais podem mudar. A situação dos candidatos segue a informação do TSE.</p><a href="https://resultados.tse.jus.br/" target="_blank" rel="noreferrer">Conferir no TSE <ExternalLink size={14}/></a></footer>
 </main></>;
}
