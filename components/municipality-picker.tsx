"use client";
import {useEffect,useRef,useState} from 'react';
import {Popover,PopoverTrigger,PopoverContent} from '@/components/ui/popover';
import {normalizeSearch} from '@/lib/election-core.mjs';
export function MunicipalityPicker({value,onChange,towns,disabled}:{value:string;onChange:(value:string)=>void;towns:{cd:string;nm:string}[];disabled:boolean}){
 const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[limit,setLimit]=useState(40);
 const search=useRef<HTMLInputElement>(null);
 useEffect(()=>{setQuery('');setLimit(40);},[open]);
 const filtered=towns.filter(t=>normalizeSearch(t.nm).includes(normalizeSearch(query)));
 return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><button className="municipality-trigger" aria-label="Município" disabled={disabled}>{disabled?'Selecione um estado':value==='all'?'Todos os municípios':towns.find(t=>t.cd===value)?.nm??'Carregando município…'}</button></PopoverTrigger><PopoverContent className="municipality-popup" align="start" onOpenAutoFocus={event=>{event.preventDefault();search.current?.focus();}}><label htmlFor="municipality-search">Buscar município</label><input id="municipality-search" ref={search} value={query} onChange={e=>{setQuery(e.target.value);setLimit(40);}} placeholder="Digite o nome, com ou sem acento"/><div className="municipality-options" role="group" aria-label="Municípios encontrados"><button type="button" onClick={()=>{onChange('all');setOpen(false);}}>Todos os municípios</button>{filtered.slice(0,limit).map(t=><button key={t.cd} type="button" aria-pressed={value===t.cd} onClick={()=>{onChange(t.cd);setOpen(false);}}>{t.nm}</button>)}{!filtered.length&&<p role="status">Nenhum município encontrado.</p>}{filtered.length>limit&&<button type="button" onClick={()=>setLimit(n=>n+40)}>Mostrar mais municípios</button>}</div><span className="fine">{filtered.length} municípios encontrados</span></PopoverContent></Popover>;
}
