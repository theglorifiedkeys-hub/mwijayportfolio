"use client";

import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { collection } from "firebase/firestore";
import { useCollectionOnce, useFirestore, useMemoFirebase, useUser } from "@/firebase";

const disciplines = [
  { key: "web", label: "Web development", note: "Websites, storefronts and tools for day-to-day work." },
  { key: "automation", label: "AI & automation", note: "Workflows that cut down on repetitive tasks." },
  { key: "design", label: "Visual identity", note: "Brand identities, interfaces and print design." },
  { key: "content", label: "Content production", note: "Photography, film and sound for your business." },
];

type Offering = { id: string; title: string; description?: string; category?: string; imageUrl?: string; disabled?: boolean };

export function StudioPractice() {
  const db = useFirestore();
  const { isAdmin } = useUser();
  const ref = useMemoFirebase(() => db ? collection(db, "users", "mwijay-davie-admin", "services") : null, [db]);
  const { data, isLoading, error } = useCollectionOnce<Offering>(ref, { enabled: !!ref });
  const visible = (data || []).filter(item => !item.disabled);
  // The permanent index links to real service pages, not substitute catalogue records.
  // Preserve older offerings without a recognised category via the booking route.
  const groups = disciplines.map(d => ({...d, href:`/services/${d.key}`, items:visible.filter(item=>item.category===d.key)}));
  const other = visible.filter(item => !disciplines.some(d => d.key === item.category));
  if (other.length) groups.push({key:"other", label:"Custom projects", note:"Discuss a brief with the studio.", href:"/book", items:other});

  return <section id="expertise" aria-labelledby="practice-title" className="ed-wrap ed-section ed-practice">
    <div className="ed-kicker"><i/>02 <span>/</span> Studio capabilities</div>
    <div className="ed-section-heading ed-practice-heading">
      <h2 id="practice-title">Studio <em>practice.</em></h2>
      <p>From the first sketch to the finished system. Explore the services behind the work.</p>
    </div>
    <div className="ed-practice-spread">
      <figure className="ed-practice-plate">
        <div><img src="/portfolio/studio-form.jpg" loading="lazy" alt="A folded copper ribbon passing through layered bronze and terracotta forms."/><span className="ed-tab">Fig. 02 <i/> Material studies</span></div>
        <figcaption><span>Fold &amp; form</span><Plus size={14} aria-hidden="true"/></figcaption>
      </figure>
      <div className="ed-practice-index">
        {groups.map((group,idx)=><div className="ed-discipline" key={group.key}>
          <Link href={group.href} className="ed-discipline-link"><small>{String(idx+1).padStart(2,"0")}</small><div><h3>{group.label}</h3><p>{group.note}</p></div><ArrowUpRight size={18} aria-hidden="true"/></Link>
          {group.items.length>0 && <ul className="ed-offerings">{group.items.map(item=><li key={item.id}><Link href={group.href}>
            {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy"/>}
            <div><strong>{item.title}</strong>{item.description && <p>{item.description}</p>}</div><ArrowUpRight size={14} aria-hidden="true"/>
          </Link></li>)}</ul>}
        </div>)}
        {isAdmin && !isLoading && <p className="ed-practice-admin">{error || !db ? "Live services unavailable." : !visible.length ? "No published offerings yet." : "Studio controls:"} <Link href="/admin/expertise">Manage offerings ↗</Link></p>}
      </div>
    </div>
  </section>;
}
