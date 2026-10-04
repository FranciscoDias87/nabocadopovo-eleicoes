"use client";
import {Analytics} from '@vercel/analytics/react';
export function Audience({enabled}:{enabled:boolean}){return enabled?<Analytics/>:null;}
