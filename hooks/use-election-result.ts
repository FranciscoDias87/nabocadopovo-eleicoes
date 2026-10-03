"use client";
import {useEffect,useRef,useState} from 'react';
import type {ElectionResult} from '@/lib/election-types';
export function useElectionResult(params:string,tick:number,enabled=true,intervalMs=30000){
 const [result,setResult]=useState<ElectionResult|null>(null);
 const [loading,setLoading]=useState(true);
 const [checkedAt,setCheckedAt]=useState<string|null>(null);
 const cache=useRef(new Map<string,ElectionResult>());
 useEffect(()=>{
  if(!enabled)return;
  let alive=true,running=false;
  const controller=new AbortController();
  setResult(cache.current.get(params)??null);setCheckedAt(null);setLoading(true);
  const load=async()=>{
   if(document.hidden||running)return;
   running=true;setLoading(true);
   try{
    const response=await fetch('/api/tse?'+params,{signal:controller.signal,cache:'no-store'});
    const incoming=await response.json() as ElectionResult;
    if(!alive)return;
    if(incoming.status==='ok'){
     cache.current.set(params,incoming);
     if(cache.current.size>8)cache.current.delete(cache.current.keys().next().value!);
     setResult(incoming);setCheckedAt(new Date().toLocaleTimeString('pt-BR'));
    }else{
     const previous=cache.current.get(params);
     setResult(previous?{...previous,stale:true,message:incoming.message}:incoming);
    }
   }catch{
    if(alive&&!controller.signal.aborted){const previous=cache.current.get(params);setResult(previous?{...previous,stale:true,message:'Falha de conexão. Exibindo o último resultado recebido.'}:{status:'error',message:'Não foi possível consultar os resultados. Tentaremos novamente.'});}
   }finally{running=false;if(alive)setLoading(false);}
  };
  const resume=()=>{if(!document.hidden)void load();};
  void load();const interval=setInterval(load,intervalMs);
  document.addEventListener('visibilitychange',resume);window.addEventListener('online',resume);
  return()=>{alive=false;controller.abort();clearInterval(interval);document.removeEventListener('visibilitychange',resume);window.removeEventListener('online',resume);};
 },[params,tick,enabled,intervalMs]);
 return {result,loading,checkedAt};
}
