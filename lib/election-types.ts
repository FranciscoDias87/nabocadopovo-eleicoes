export type Candidate={id:string;mathematical?:boolean;photo?:string|null;name:string;number:string;party:string;votes:number|null;percent:number|null;situation:string};
import type {Indicators} from './election-indicators';
export type ElectionResult={status:string;finished?:boolean;towns?:{cd:string;nm:string}[];indicators?:Indicators;message?:string;updated?:string;generated?:string;progress?:number|null;counted?:number|null;total?:number|null;candidates?:Candidate[];source?:string;stale?:boolean;states?:{uf:string;progress:number|null;status:string}[]};


