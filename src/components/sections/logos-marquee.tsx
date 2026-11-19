'use client';

import React from 'react';
import { useCollectionOnce, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

/**
 * LogosMarquee - Strategic tech partner display.
 * OPTIMIZED: Uses useCollectionOnce to save Firestore read quota.
 */
export function LogosMarquee() {
  const db = useFirestore();
  
  const logosRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'logos');
  }, [db]);

  const logosQuery = useMemoFirebase(() => {
    if (!logosRef) return null;
    return query(
      logosRef, 
      orderBy('order', 'asc')
    );
  }, [logosRef]);

  const { data: rawLogos, isLoading } = useCollectionOnce(logosQuery);

  // MEMORY FILTER: Bypasses the need for a composite index
  const logos = React.useMemo(() => {
    if (!rawLogos) return [];
    return rawLogos.filter((l: any) => l.isVisible === true);
  }, [rawLogos]);

  if (!db || isLoading || !logos || logos.length === 0) return null;

  return (
    <section id="studio-logos" className="ed-wrap ed-partners">
      <div className="ed-kicker"><i/> Studio references</div>
      <h2>Tools &amp; <em>partners.</em></h2>
      <ul>{logos.map(logo=><li key={logo.id}><img src={logo.imageUrl} alt="" loading="lazy"/><span>{logo.name}</span></li>)}</ul>
    </section>
  );
}
