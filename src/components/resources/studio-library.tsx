"use client";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import {
  BookOpen,
  ArrowUpRight,
  ArrowRight,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { doc } from "firebase/firestore";
import {
  useCollection,
  useDoc,
  useFirestore,
  useMemoFirebase,
} from "@/firebase";
import {
  publishedBlogs,
  availableProducts,
  listingPrice,
} from "@/lib/public-catalog";
import { formatTZS } from "@/lib/order-utils";
import "./library.css";
const Checkout = dynamic(() =>
  import("@/components/marketplace/checkout-drawer").then(
    (m) => m.CheckoutDrawer,
  ),
);
const guides = [
  {
    id: "brief",
    tag: "01 / Discovery",
    title: "Write a useful project brief",
    intro: "Turn a broad idea into a first conversation the team can act on.",
    steps: [
      "Name the person doing the work and the task that slows them down. “The cashier copies every sale into a second ledger” is more useful than “we need an app.”",
      "Describe one successful outcome and how you will recognise it. List the devices, languages and payment methods your customers actually use.",
      "Separate launch essentials from later ideas. Bring the budget range, decision maker and any fixed deadline to the kickoff.",
    ],
  },
  {
    id: "review",
    tag: "02 / Delivery",
    title: "Give feedback on a milestone",
    intro:
      "Help the studio reproduce an issue without another round of messages.",
    steps: [
      "Open Milestones in your workspace and identify the build or phase you are reviewing. Test the agreed journey from start to finish.",
      "In Messages, name the screen, list the steps you took and explain what you expected versus what happened. Mention the device and browser; never share a password.",
      "Distinguish a bug from a new request. Confirm the acceptance criteria with the studio before approving the milestone.",
    ],
  },
  {
    id: "handover",
    tag: "03 / Handover",
    title: "Prepare for launch day",
    intro:
      "Make sure ownership, files and maintenance are clear before going live.",
    steps: [
      "Check the final deliverables in Files. Note which document is the latest version and store an approved copy with the project owner.",
      "Agree who controls the domain, hosting and billing accounts. Use invitations to transfer access rather than sending credentials in chat.",
      "Test the live contact and purchase flows, decide where support requests go, and schedule the first post-launch review.",
    ],
  },
];
export function JournalShelf() {
  const db = useFirestore();
  const ref = useMemoFirebase(() => (db ? publishedBlogs(db, 3) : null), [db]);
  const { data, isLoading, error } = useCollection(ref, { enabled: !!ref });
  return (
    <section className="rs-block">
      <small className="rs-kicker">From the studio / Journal</small>
      <div className="rs-heading">
        <h2>
          Latest <em>articles.</em>
        </h2>
        <Link href="/blog">
          Blog archive <ArrowUpRight size={15} />
        </Link>
      </div>
      {!db || error ? (
        <p className="rs-state">
          The live journal is unavailable right now. The client guides below are
          still available.
        </p>
      ) : isLoading ? (
        <p className="rs-state" role="status">
          Loading published articles…
        </p>
      ) : !data?.length ? (
        <p className="rs-state">
          No studio articles have been published yet. Start with the client
          guides below.
        </p>
      ) : (
        <div className="rs-cards">
          {data.map((post) => (
            <Link
              key={post.id}
              href={"/blog/" + encodeURIComponent(post.slug || post.id)}
              className="rs-post"
            >
              <img
                src={post.imageUrl || "/portfolio/library-shelf.jpg"}
                alt=""
              />
              <div>
                <small>{post.category || "Studio journal"}</small>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <b>
                  Read article <ArrowRight size={13} />
                </b>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
export function Guides() {
  return (
    <section className="rs-block" id="client-guides">
      <small className="rs-kicker">Client handbook / Always available</small>
      <div className="rs-heading">
        <h2>
          Field <em>guides.</em>
        </h2>
      </div>
      <div className="rs-guides">
        {guides.map((g) => (
          <details key={g.id}>
            <summary>
              <small>{g.tag}</small>
              <h3>{g.title}</h3>
              <Plus size={16} />
            </summary>
            <p>{g.intro}</p>
            <ol>
              {g.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </details>
        ))}
      </div>
    </section>
  );
}
export function MarketShelf() {
  const db = useFirestore();
  const ref = useMemoFirebase(() => (db ? availableProducts(db) : null), [db]);
  const { data, isLoading, error } = useCollection(ref, { enabled: !!ref });
  const [selected, setSelected] = useState<string | null>(null);
  const item = data?.find((x) => x.id === selected);
  const price = listingPrice(item?.price);
  const [search, setSearch] = useState("");
  const shown = (data || [])
    .filter((x) =>
      [x.title, x.category, x.description].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(search.toLowerCase().trim()),
      ),
    )
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  return (
    <section className="rs-block">
      <small className="rs-kicker">Studio editions / Shop</small>
      <div className="rs-heading">
        <h2>
          Available <em>editions.</em>
        </h2>
        <Link href="/pricing">
          Service pricing <ArrowUpRight size={15} />
        </Link>
      </div>
      {!!data?.length && (
        <input
          className="rs-search"
          type="search"
          aria-label="Search market listings"
          placeholder="Search titles or categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}{" "}
      {!db || error ? (
        <p className="rs-state">
          The product catalogue is unavailable right now.{" "}
          <Link href="/contact">Contact the studio ↗</Link>
        </p>
      ) : isLoading ? (
        <p className="rs-state" role="status">
          Loading the catalogue…
        </p>
      ) : shown.length === 0 ? (
        <p className="rs-state">
          {search
            ? "No matching products. Try another title or category."
            : "There are no available editions at the moment."}
        </p>
      ) : (
        <div className="rs-cards">
          {shown.map((x) => (
            <article key={x.id} className="rs-post">
              <img src={x.imageUrl || "/portfolio/library-shelf.jpg"} alt="" />
              <div>
                <small>{x.category || "Digital edition"}</small>
                <h3>{x.title}</h3>
                <p>{x.description}</p>
                <div className="rs-purchase">
                  <b>
                    {listingPrice(x.price) !== null
                      ? formatTZS(listingPrice(x.price)!)
                      : "Price unavailable"}
                  </b>
                  <button
                    disabled={listingPrice(x.price) === null}
                    onClick={() => setSelected(x.id)}
                  >
                    Buy edition <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {item && price !== null && (
        <Checkout
          isOpen
          onClose={() => setSelected(null)}
          product={{
            id: item.id,
            name: item.title,
            price,
            description: item.description || "",
            image: item.imageUrl || "",
          }}
        />
      )}
    </section>
  );
}
export function Library({ market = false }: { market?: boolean }) {
  return (
    <div className="rs-library">
      <header className="rs-cover">
        <small className="rs-kicker">
          Mwijay Studio &nbsp; / &nbsp; {market ? "Digital goods" : "Resources"}
        </small>
        <h1>
          {market ? "Studio" : "The studio"}{" "}
          <em>{market ? "market." : "library."}</em>
        </h1>
        <p>
          {market
            ? "Browse digital editions, guides and creative assets from the studio."
            : "Published articles, practical client guides and digital editions. Everything you need before, during and after a build."}
        </p>
        <div>
          <Link href={market ? "/library" : "/market"}>
            {market ? <BookOpen size={15} /> : <ShoppingBag size={15} />}{" "}
            {market ? "Visit the library" : "Explore the market"}{" "}
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </header>
      {market ? (
        <MarketShelf />
      ) : (
        <>
          <JournalShelf />
          <Guides />
          <div className="rs-block"><small className="rs-kicker">For developers</small><div className="rs-heading"><h2>Architecture <em>notes.</em></h2><Link href="/interview-prep">Interview prep <ArrowUpRight size={15}/></Link></div><p>Explore how this portfolio works, then test yourself with the interactive question bank.</p></div>
        </>
      )}
    </div>
  );
}
const directory = [
  {title:'Services',links:[['Web development','/services/web'],['AI & automation','/services/automation'],['Design','/services/design'],['Content production','/services/content'],['Service pricing','/pricing']]},
  {title:'Work with me',links:[['Start a project','/book'],['Project agreement','/agreement'],['Experience','/experience'],['Full work gallery','/projects/gallery']]},
  {title:'Client desk',links:[['Client portal','/client-portal'],['Track an order','/track-order']]},
];
export function StudioDirectory() {
  const db = useFirestore();
  const ref = useMemoFirebase(
    () => (db ? doc(db, "site_config", "stats") : null),
    [db],
  );
  const { data: config } = useDoc(ref, { enabled: !!ref });
  return (
    <section id="studio-services" className="rs-block rs-directory">
      <small className="rs-kicker">Directory / Services & tools</small>
      <div className="rs-heading">
        <h2>
          Explore the <em>studio.</em>
        </h2>
      </div>
      <nav className="rs-directory-groups" aria-label="Studio directory">{directory.map(({title,links})=><div key={title}><h3>{title}</h3>{links.map(([label,url])=><Link key={url} href={url}>{label}<ArrowUpRight size={17} aria-hidden="true"/></Link>)}</div>)}</nav>
      {config && (
        <div className="rs-facts">
          {config.availableForWork === true && (
            <Link href="/book">Available for projects ↗</Link>
          )}
          {Number.isFinite(config.projectsCompleted) && (
            <span>{config.projectsCompleted} projects completed</span>
          )}
          {Number.isFinite(config.happyClients) && (
            <span>{config.happyClients} happy clients</span>
          )}
          {config.location && <span>{config.location}</span>}
          {config.email && (
            <a href={"mailto:" + config.email}>Studio email ↗</a>
          )}
          {config.whatsapp && (
            <a
              href={
                "https://wa.me/" + String(config.whatsapp).replace(/\D/g, "")
              }
            >
              WhatsApp ↗
            </a>
          )}
        </div>
      )}
    </section>
  );
}
