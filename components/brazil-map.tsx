"use client";
import {useState} from 'react';
import shapes from '@/lib/brazil-map.json';
import {states} from '@/lib/geography';
type StateResult={uf:string;progress:number|null;status:string};
export function BrazilMap({selected,onSelect,results}:{selected:string;onSelect:(uf:string)=>void;results?:StateResult[]}){
 const [hover,setHover]=useState<string|null>(null);
 const active=hover??(selected==='br'?null:selected),name=states.find(s=>s[0]===active)?.[1],data=results?.find(s=>s.uf===active);
 const percentage=data?.progress!=null?data.progress.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%':'sem dados disponíveis';
 return <div className="brazil-map"><svg viewBox="0 0 600 580" role="group" aria-label="Mapa do Brasil com estados e Distrito Federal clicáveis">{shapes.map(s=>{const stateName=states.find(v=>v[0]===s.uf)?.[1],result=results?.find(v=>v.uf===s.uf);return <g key={s.uf} role="button" tabIndex={0} aria-label={`${stateName}: ${result?.progress!=null?result.progress.toLocaleString('pt-BR')+'% totalizado':'sem dados disponíveis'}`} aria-pressed={selected===s.uf} className={`map-state ${selected===s.uf?'selected':''} ${hover===s.uf?'hovered':''}`} onClick={()=>onSelect(s.uf)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(s.uf);}}} onMouseEnter={()=>setHover(s.uf)} onMouseLeave={()=>setHover(null)} onFocus={()=>setHover(s.uf)} onBlur={()=>setHover(null)}><title>{stateName+' · '+(result?.progress!=null?result.progress.toLocaleString('pt-BR')+'% das seções totalizadas':'sem dados disponíveis')}</title><path d={s.path} fillRule="evenodd" vectorEffect="non-scaling-stroke"/>{s.external&&<><polyline points={`${s.x},${s.y} ${s.labelX-33},${s.labelY} ${s.labelX-15},${s.labelY}`} vectorEffect="non-scaling-stroke"/>{s.uf==='df'&&<circle cx={s.x} cy={s.y} r={5}/>}</>}{s.external&&<rect className="map-touch-target" x={s.labelX-25} y={s.labelY-16} width={50} height={32} rx={5}/>}<text x={s.labelX} y={s.labelY} dominantBaseline="middle" textAnchor="middle">{s.uf.toUpperCase()}</text></g>;})}</svg><div className="map-readout" aria-live="polite">{active?<><strong>{name}</strong><span>{percentage}{data?.progress!=null?' das seções totalizadas':''}</span></>:<><strong>Brasil inteiro</strong><span>Toque em um estado para consultar os resultados.</span></>}</div></div>;
}

