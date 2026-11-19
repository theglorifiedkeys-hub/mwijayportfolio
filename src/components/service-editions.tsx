'use client';

import Link from 'next/link';
import {collection,query,where} from 'firebase/firestore';
import {useCollection,useFirestore,useMemoFirebase} from '@/firebase';

// The studio editor stores its offerings under the owner's profile, not /services.
export function ServiceEditions({category}:{category:'design'|'content'}){
  const db=useFirestore();
  const ref=useMemoFirebase(()=>db?query(collection(db,'users','mwijay-davie-admin','services'),where('category','==',category)):null,[db,category]);
  const {data,error}=useCollection(ref,{enabled:!!ref});
  const offers=data?.filter(service=>!service.disabled);
  if(error||!offers?.length)return null;
  return <section aria-label="Studio offerings" className="space-y-6"><h2 className="text-3xl font-semibold">From the studio catalogue</h2><div className="grid gap-5 md:grid-cols-2">{offers.map(s=><article key={s.id} className="rounded-2xl border p-6 space-y-3"><h3 className="text-xl font-bold">{s.title}</h3><p>{s.description}</p>{s.price&&<p>{s.price}</p>}<Link className="inline-flex underline" href={{pathname:'/book',query:{services:category==='design'?'design_branding':'content_production',projectName:s.title}}}>Request this service ↗</Link></article>)}</div></section>
}
