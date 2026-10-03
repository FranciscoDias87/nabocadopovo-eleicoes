export async function recordSnapshot(result,context){
 if(!globalThis.indexedDB)throw new Error('Histórico indisponível');
 const database=await new Promise((resolve,reject)=>{const request=indexedDB.open('nabocadopovo-eleicoes',1);request.onupgradeneeded=()=>request.result.createObjectStore('snapshots',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
 try{return await new Promise((resolve,reject)=>{
  const transaction=database.transaction('snapshots','readwrite'),store=transaction.objectStore('snapshots');
  const selection=[context.uf,context.town,context.office,context.turn].join(':');
  const id=[selection,result.updated??'',result.generated??'',result.indicators?.votes??'',result.progress??''].join('|');
  let snapshots=[];const get=store.get(id);get.onsuccess=()=>{if(!get.result)store.put({id,selection,result,context,recordedAt:new Date().toISOString()});
  const all=store.getAll();all.onsuccess=()=>{const records=all.result.sort((a,b)=>b.recordedAt.localeCompare(a.recordedAt));snapshots=records.filter(r=>r.selection===selection).slice(0,20);const keep=new Set(snapshots.map(r=>r.id));for(const r of records)if(r.selection===selection&&!keep.has(r.id))store.delete(r.id);for(const r of records.slice(200))store.delete(r.id);};};
  transaction.oncomplete=()=>resolve(snapshots);transaction.onerror=()=>reject(transaction.error);
 });}finally{database.close();}
}
export function downloadCsv(result,context){const url=URL.createObjectURL(new Blob([context.csv(result,context)],{type:'text/csv;charset=utf-8;'}));const link=document.createElement('a');link.href=url;link.download=`apuracao-${context.uf}-${context.town}-${context.office}-${context.turn}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

