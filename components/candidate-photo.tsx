"use client";
import {useState} from 'react';
import {UserRound} from 'lucide-react';

export function CandidatePhoto({src,name}:{src?:string|null;name:string}){
 const [failed,setFailed]=useState(false);
 return <span className="candidate-photo">{src&&!failed?<img src={src} alt={`Foto de ${name}`} width={56} height={72} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<span role="img" aria-label={`Foto indisponível de ${name}`} title="Foto indisponível"><UserRound size={28}/></span>}</span>;
}
