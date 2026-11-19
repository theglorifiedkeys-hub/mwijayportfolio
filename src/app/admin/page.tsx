"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Eye,
  FilePenLine,
  FolderOpen,
  Inbox,
  MessageSquare,
  Palette,
  Users,
} from "lucide-react";
import { useUser, useFirestore, useMemoFirebase, useDocOnce } from "@/firebase";

const metrics = [
  { label: "New inquiries", href: "inquiries", icon: MessageSquare },
  { label: "Payments to verify", href: "orders", icon: Clock3 },
  { label: "Page views", href: "analytics", icon: Eye },
  { label: "Clients", href: "clients", icon: Users },
];
const shortcuts = [
  {
    label: "Project gallery",
    desc: "Manage portfolio entries",
    href: "projects",
    icon: FolderOpen,
  },
  {
    label: "Journal",
    desc: "Write and edit articles",
    href: "blogs",
    icon: FilePenLine,
  },
  {
    label: "Site settings",
    desc: "Manage your brand palette",
    href: "site-config",
    icon: Palette,
  },
];
type Inquiry = {
  id: string;
  projectName?: string;
  clientName?: string;
  status?: string;
};
export default function AdminDashboard() {
  const db = useFirestore();
  const { user } = useUser();
  const [counts, setCounts] = useState<(number | string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [feed, setFeed] = useState<Inquiry[] | null>(null);
  const [feedError, setFeedError] = useState(false);
  const ref = useMemoFirebase(
    () => (db ? doc(db, "site_config", "stats") : null),
    [db],
  );
  const { data: brand } = useDocOnce(ref);
  useEffect(() => {
    if (!user || !db) return;
    const queries = [
      query(collection(db, "project_inquiries"), where("status", "==", "new")),
      query(collection(db, "orders"), where("status", "==", "PENDING_VERIFY")),
      query(
        collection(db, "analytics_events"),
        where("type", "==", "page_view"),
      ),
      query(collection(db, "clients")),
    ];
    const unsub = queries.map((q, i) => {
      const put = (value: number | string) =>
        setCounts((prev) => prev.map((v, n) => (n === i ? value : v)));
      return onSnapshot(
        q,
        (s) => put(s.size),
        () => put("Unavailable"),
      );
    });
    unsub.push(
      onSnapshot(
        query(
          collection(db, "project_inquiries"),
          orderBy("createdAt", "desc"),
          limit(6),
        ),
        (s) => {
          setFeedError(false);
          setFeed(s.docs.map((d) => ({ id: d.id, ...d.data() })));
        },
        () => setFeedError(true),
      ),
    );
    return () => unsub.forEach((stop) => stop());
  }, [user, db]);
  return (
    <div className="desk">
      <header className="desk-cover">
        <div className="desk-kicker">
          <i /> Mwijay studio &nbsp; / &nbsp; Workspace
        </div>
        <h1>
          Studio <em>overview.</em>
        </h1>
        <p>
          Your portfolio, client requests and publishing tools in one place.
        </p>
        <Link href="/" className="desk-visit">
          View portfolio <ArrowUpRight size={15} />
        </Link>
      </header>
      <div className="desk-section">
        <div className="desk-kicker">01 / At a glance</div>
        <h2>Workspace activity</h2>
      </div>
      <div className="desk-metrics">
        {metrics.map(({ label, href, icon: Icon }, i) => (
          <Link key={href} href={"/admin/" + href}>
            <div>
              <Icon size={18} />
              <ArrowUpRight size={14} />
            </div>
            <strong
              className={typeof counts[i] === "string" ? "desk-error" : ""}
            >
              {counts[i] ?? "—"}
            </strong>
            <span>{label}</span>
          </Link>
        ))}
      </div>
      <div className="desk-columns">
        <section className="desk-panel">
          <header>
            <div className="desk-kicker">
              <Activity size={12} /> Inbox
            </div>
            <h2>Recent inquiries</h2>
          </header>
          {feedError || !feed || feed.length === 0 ? (
            <div className="desk-empty" role="status">
              <Inbox size={23} />
              <p>
                {feedError
                  ? "Inquiries could not be loaded."
                  : !feed
                    ? "Loading inquiries…"
                    : "No inquiries yet."}
              </p>
            </div>
          ) : (
            feed.map((x) => (
              <Link className="desk-inquiry" href="/admin/inquiries" key={x.id}>
                <div>
                  <b>{x.projectName || "General inquiry"}</b>
                  <small>{x.clientName}</small>
                </div>
                <span>{x.status || "Received"}</span>
              </Link>
            ))
          )}
          <Link className="desk-panel-link" href="/admin/inquiries">
            Open inbox <ArrowRight size={14} />
          </Link>
        </section>
        <section className="desk-panel">
          <header>
            <div className="desk-kicker">02 / Publishing</div>
            <h2>Studio shortcuts</h2>
          </header>
          {shortcuts.map(({ label, desc, href, icon: Icon }) => (
            <Link className="desk-action" href={"/admin/" + href} key={href}>
              <Icon size={18} />
              <div>
                <b>{label}</b>
                <small>{desc}</small>
              </div>
              <ArrowUpRight size={15} />
            </Link>
          ))}
          {Array.isArray(brand?.brandColors) && (
            <div className="desk-palette">
              {brand.brandColors.slice(0, 6).map((c: string, i: number) => (
                <span key={i} title={c} style={{ backgroundColor: c }} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
