export const normalizeSearch=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export const readNumber=value=>{if(value==null||String(value).trim()==='')return null;const n=Number(String(value).replace(',','.'));return Number.isFinite(n)?n:null;};
export function readFilters(search,allowedStates){const p=new URLSearchParams(search);const uf=allowedStates.includes(p.get('uf'))?p.get('uf'):'br';const turn=p.get('turn')==='2'?'2':'1';let office=p.get('office')??'1';if(uf==='df'&&office==='8')office='7';if(!['1','3','5','6','7'].includes(office)||uf==='br'||(turn==='2'&&!['1','3'].includes(office)))office='1';const town=uf!=='br'&&/^\d{5}$/.test(p.get('town')??'')?p.get('town'):'all';return {uf,office,town,turn};}
export function csvCell(value){let text=value==null?'':String(value);if(/^[=+@\-\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
export function electionCsv(result,context){const header=['localidade','uf','municipio_tse','cargo','turno','totalizacao_tse','geracao_arquivo_tse','fonte','dados_desatualizados','eleitores_aptos','comparecimento','abstencao','votos_computados','votos_validos','brancos','nulos','id_candidato','numero','nome','partido','votos','percentual_tse','situacao'];const i=result.indicators??{};const prefix=[context.place,context.uf,context.town,context.officeName??context.office,context.turn,result.updated,result.generated,result.source,result.stale?'sim':'nao',i.eligible,i.turnout,i.abstention,i.votes,i.valid,i.blank,i.nullVotes];return '\uFEFF'+[header,...(result.candidates??[]).map(c=>[...prefix,c.id,c.number,c.name,c.party,c.votes,c.percent,c.situation])].map(row=>row.map(csvCell).join(';')).join('\r\n');}
export function isElected(situation){return ['eleito','eleita','eleito por qp','eleita por qp','eleito por media','eleita por media'].includes(normalizeSearch(situation).replace(/\s+/g,' '));}
export function compareCandidates(a,b){return Number(isElected(b.situation))-Number(isElected(a.situation))||(b.votes??-1)-(a.votes??-1)||a.name.localeCompare(b.name,'pt-BR');}
export function isSecondRound(situation){return /^2(?:º|°|o)?\s*turno$/.test(normalizeSearch(situation));}
export function electionBadge(office,situation,finished,mathematical=false){if(!finished&&mathematical&&["1","3","5"].includes(office))return "Matematicamente eleito · cálculo do painel";if(['1','3'].includes(office)){if(finished!==true)return null;if(isElected(situation))return '✓ Eleito · TSE';if(isSecondRound(situation))return 'Vai para o 2º turno · TSE';return null;}if(!['5','6','7'].includes(office)||!isElected(situation))return null;return finished===true?'✓ Eleito · TSE':'Na zona de eleição · provisório';}

export function mathematicalWinners(data,office,uf,town,stale=false){
 const none=[];if(stale||data.and!=='p'||data.esae==='s'||town!=='all'||!['1','3','5'].includes(office)||(office==='1'?uf!=='br':uf==='br'))return none;
 const integer=v=>{const n=readNumber(v);return Number.isSafeInteger(n)&&n>=0?n:null;};
 const eligible=integer(data.e?.te),counted=integer(data.e?.esa),valid=integer(data.v?.vv),annulled=integer(data.v?.van),judicial=integer(data.v?.vansj);
 if(eligible==null||counted==null||eligible===0||counted>eligible||valid==null||annulled!==0||judicial!==0)return none;
 const cargo=(data.carg??[]).find(c=>String(c.cd)===office),seats=integer(cargo?.nv);
 if(!cargo||!['1','2'].includes(String(data.t))||!seats||(office==='5'?![1,2].includes(seats)||String(data.t)!=='1':seats!==1))return none;
 const candidates=(cargo.agr??[]).flatMap(a=>(a.par??[]).flatMap(p=>p.cand??[]));
 if(!candidates.length||candidates.some(c=>normalizeSearch(c.dvt)!=='valido'||integer(c.vap)==null||!c.sqcand))return none;
 const rows=candidates.map(c=>({id:String(c.sqcand),votes:integer(c.vap)})).sort((a,b)=>b.votes-a.votes);
 if(rows.reduce((sum,c)=>sum+c.votes,0)!==valid||rows.some(c=>c.votes>counted)||valid>counted*seats)return none;
 const remaining=(eligible-counted)*seats;
 if(office!=='5')return rows[0].votes*2>valid+remaining?[rows[0].id]:none;
 const outsider=rows[seats]?.votes??0;return rows.slice(0,seats).filter(c=>c.votes>outsider+remaining).map(c=>c.id);
}

