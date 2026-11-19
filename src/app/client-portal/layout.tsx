"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useUser, useAuth, useFirestore } from "@/firebase";
import {
  ClientPortalProvider,
  useClientPortal,
} from "@/contexts/client-portal-context";
import {
  LayoutDashboard,
  Layers3,
  MessagesSquare,
  FolderOpen,
  CreditCard,
  LogOut,
  ArrowUpRight,
  Archive,
  BookOpen,
  LockKeyhole,
} from "lucide-react";
import "./portal.css";
const base = "/client-portal";
const nav = [
  ["Overview", "dashboard", LayoutDashboard],
  ["Milestones", "progress", Layers3],
  ["Messages", "messages", MessagesSquare],
  ["Files", "files", FolderOpen],
  ["Payments", "payments", CreditCard],
  ["Orders", "", Archive],
  ["Library", "library", BookOpen],
] as const;
function Workspace({ children }: { children: React.ReactNode }) {
  const { unreadCount, isLoading, project, projectError } = useClientPortal();
  const { isAdmin } = useUser();
  const auth = useAuth(),
    path = usePathname();
  return (
    <div className="cp-hub">
      <header>
        <div className="cp-wrap">
          <Link href="/" className="cp-wordmark">
            <img src="/portfolio/icon-192.png" alt="" />
            mwijay<span>.</span>
          </Link>
          <span className="cp-headlabel">Client portal</span>
          <div className="cp-hub-actions">
            {isAdmin && (
              <Link href="/admin">
                Admin <ArrowUpRight size={13} />
              </Link>
            )}
            <button onClick={() => auth?.signOut()}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="cp-hub-nav">
        <nav className="cp-wrap" aria-label="Workspace sections">
          {nav.map(([name, url, Icon]) => {
            const href = url ? base + "/" + url : base;
            return (
              <Link
                key={name}
                href={href}
                aria-current={href === path ? "page" : undefined}
              >
                <Icon size={16} />
                {name}
                {url === "messages" && unreadCount > 0 && <b>{unreadCount}</b>}
              </Link>
            );
          })}
        </nav>
      </div>
      <main className="cp-wrap cp-hub-main">
        {path !== base &&
        path !== base + "/library" &&
        !isLoading &&
        !project ? (
          <div className="cp-wait">
            <Layers3 />
            <h1>
              {projectError ? "Project unavailable" : "No project linked yet"}
            </h1>
            <p>
              {projectError
                ? "We could not load your project. Please try again later."
                : "Your project workspace will appear once the studio links your account."}
            </p>
            <Link href="/contact">Contact the studio ↗</Link>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname(),
    router = useRouter(),
    db = useFirestore();
  const { user, isAdmin, isUserLoading } = useUser();
  const [verification, setVerification] = useState<{
    uid: string;
    ok: boolean;
  } | null>(null);
  const login = path === base + "/login";
  useEffect(() => {
    if (login || isUserLoading) return;
    if (!user) {
      router.replace(base + "/login");
      return;
    }
    if (isAdmin || !db) return;
    let current = true;
    getDoc(doc(db, "clients", user.uid))
      .then((s) => {
        if (current) setVerification({ uid: user.uid, ok: s.exists() });
      })
      .catch(() => {
        if (current) setVerification({ uid: user.uid, ok: false });
      });
    return () => {
      current = false;
    };
  }, [login, user, isAdmin, isUserLoading, db, router]);
  if (login) return children;
  if (!user || isUserLoading || (!isAdmin && verification?.uid !== user.uid))
    return (
      <div className="cp-wait" role="status">
        <LockKeyhole />
        Opening your workspace…
      </div>
    );
  // Orders on the entry route are scoped to the signed-in purchaser; project pages require a client record.
  if (
    !isAdmin &&
    !verification?.ok &&
    path !== base &&
    path !== base + "/library"
  )
    return (
      <div className="cp-wait">
        <LockKeyhole />
        <h1>Workspace unavailable</h1>
        <p>This account could not be verified for project access.</p>
        <Link href={base + "/login"}>Return to sign-in →</Link>
      </div>
    );
  return (
    <ClientPortalProvider key={user.uid}>
      <Workspace>{children}</Workspace>
    </ClientPortalProvider>
  );
}
