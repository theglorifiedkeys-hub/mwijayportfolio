"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  useAuth,
  useUser,
  useFirestore,
  useDoc,
  useMemoFirebase,
} from "@/firebase";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  Layers3,
  FolderOpen,
  MessagesSquare,
  ShieldCheck,
  Scan,
  KeyRound,
} from "lucide-react";
export function PortalAccess() {
  const router = useRouter(),
    auth = useAuth(),
    db = useFirestore();
  const { user, isAdmin, isUserLoading } = useUser();
  const [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const google = useRef(false);
  const designRef = useMemoFirebase(
    () => (db ? doc(db, "site_config", "auth_design") : null),
    [db],
  );
  const { data: design } = useDoc(designRef, { enabled: !!designRef });
  useEffect(() => {
    if (!user || !auth || !db || isUserLoading) return;
    let active = true;
    async function verify() {
      if (isAdmin) {
        router.replace("/admin");
        return;
      }
      try {
        const record = await getDoc(doc(db!, "clients", user!.uid));
        if (!active) return;
        if (record.exists()) {
          router.replace("/client-portal/dashboard");
          return;
        }
        if (google.current) {
          await setDoc(
            doc(db!, "leads", user!.uid),
            {
              uid: user!.uid,
              name: user!.displayName || "Anonymous",
              email: user!.email,
              createdAt: serverTimestamp(),
              status: "portal_attempt",
            },
            { merge: true },
          ).catch(() => {
            /* Lead recording must not block sign-out. */
          });
        }
        if (!active) return;
        setNotice(
          "This account does not have a client workspace. Contact the studio for access.",
        );
        setBusy(false);
        await signOut(auth!);
      } catch {
        if (active)
          setNotice("We could not verify your workspace. Please try again.");
      } finally {
        if (active) setBusy(false);
      }
    }
    void verify();
    return () => {
      active = false;
    };
  }, [user, auth, db, isUserLoading, isAdmin, router]);
  async function login(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (busy) return;
    if (!auth || !db) {
      setNotice(
        "Sign-in is unavailable in this environment. Contact the studio for access.",
      );
      return;
    }
    setNotice("");
    setBusy(true);
    google.current = !event;
    try {
      if (event) {
        const fields = new FormData(event.currentTarget);
        await signInWithEmailAndPassword(
          auth,
          String(fields.get("email")),
          String(fields.get("password")),
        );
      } else {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await signInWithPopup(auth, provider);
      }
    } catch (e) {
      if ((e as { code?: string }).code !== "auth/popup-closed-by-user")
        setNotice(
          event
            ? "Unable to sign in. Check your email and password, then try again."
            : "Google sign-in did not complete. Please try again.",
        );
      setBusy(false);
    }
  }
  return (
    <div className="cp-access">
      <header className="cp-head">
        <div className="cp-wrap">
          <Link className="cp-wordmark" href="/">
            <img src="/portfolio/icon-192.png" alt="" />
            mwijay<span>.</span>
          </Link>
          <span className="cp-headlabel">Client portal</span>
          <Link href="/" className="cp-back">
            Back to portfolio <ArrowUpRight size={14} />
          </Link>
        </div>
      </header>
      <main className="cp-wrap">
        <section className="cp-gate">
          <div className="cp-art">
            <img
              src={
                design?.clientHeroImageUrl || "/portfolio/client-threshold.jpg"
              }
              alt=""
              fetchPriority="high"
            />
            <div className="cp-art-copy">
              <small className="cp-label">
                <i /> Client workspace &nbsp;/&nbsp; 01
              </small>
              <h1>
                Your project,
                <br />
                <em>in focus.</em>
              </h1>
              <p>
                A shared space for your milestones, conversations and final
                deliverables.
              </p>
            </div>
            <div className="cp-figure">
              <span>
                <Scan size={14} /> FIG. 01 &nbsp; / &nbsp; THRESHOLD
              </span>
              <b>EDITION / 2026</b>
            </div>
          </div>
          <div className="cp-form-panel">
            <div className="cp-access-tag">
              <KeyRound size={13} /> Client access
            </div>
            <h2>
              Welcome back<span>.</span>
            </h2>
            <p>Sign in to your project workspace.</p>
            <form onSubmit={login}>
              <label htmlFor="cp-email">Email address</label>
              <div className="cp-input">
                <Mail />
                <input
                  name="email"
                  id="cp-email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div className="cp-pass-label">
                <label htmlFor="cp-pass">Password</label>
                <Link href="/contact">Need help?</Link>
              </div>
              <div className="cp-input">
                <LockKeyhole />
                <input
                  name="password"
                  id="cp-pass"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  aria-pressed={show}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <button className="cp-enter" disabled={busy || isUserLoading}>
                {busy ? "Signing in…" : "Sign in"}
                <ArrowRight size={16} />
              </button>
            </form>
            <div className="cp-or">
              <span />
              or
              <span />
            </div>
            <button
              className="cp-google"
              disabled={busy || isUserLoading}
              onClick={() => login()}
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#4285f4"
                  d="M44 24c0-1.3-.1-2.6-.4-3.8H24v7.4h11.2c-.5 2.6-2 4.8-4.2 6.2v5.1h6.8c4-3.6 6.2-8.7 6.2-14.9Z"
                />
                <path
                  fill="#34a853"
                  d="M24 44c5.6 0 10.3-1.8 13.8-5.1L31 33.8c-1.9 1.3-4.3 2-7 2-5.4 0-10-3.6-11.6-8.5h-7v5.3C8.8 39.4 15.8 44 24 44Z"
                />
                <path
                  fill="#fbbc05"
                  d="M12.4 27.3a12 12 0 0 1 0-7.1v-5.3h-7a20 20 0 0 0 0 17.7l7-5.3Z"
                />
                <path
                  fill="#ea4335"
                  d="M24 12.2c3 0 5.6 1 7.7 3l5.8-5.8C34.1 6.2 29.5 4 24 4c-8.2 0-15.2 4.6-18.6 11l7 5.2c1.6-4.8 6.2-8 11.6-8Z"
                />
              </svg>
              Continue with Google
            </button>
            {notice && (
              <p className="cp-notice" role="alert">
                {notice}
              </p>
            )}
            <div className="cp-request">
              New to the studio?{" "}
              <Link href="/book">
                Start a project <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </section>
        <div className="cp-resource-bar">
          <div>
            <small>Studio resources</small>
            <h2>Read the journal. Browse the market.</h2>
          </div>
          <Link href="/library">Open library ↗</Link>
          <Link href="/market">Visit market ↗</Link>
        </div>
        <section className="cp-essentials">
          <div className="cp-section-title">
            <small className="cp-label">
              <i /> Inside the portal
            </small>
            <span>Workspace essentials</span>
          </div>
          <div className="cp-feature-grid">
            {[
              {
                icon: Layers3,
                title: "Project milestones",
                text: "Follow each phase, from kickoff to handover.",
              },
              {
                icon: MessagesSquare,
                title: "Direct messages",
                text: "Keep project conversations in one place.",
              },
              {
                icon: FolderOpen,
                title: "Files & documents",
                text: "Find your deliverables and project records.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <article key={title}>
                <div className="cp-feature-top">
                  <Icon size={21} />
                  <small>0{i + 1}</small>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="cp-wrap cp-footer">
        <span>© 2026 Mwijay Studio</span>
        <span>
          <ShieldCheck size={13} /> Private client workspace
        </span>
        <Link href="/contact">
          Contact support <ArrowUpRight size={12} />
        </Link>
      </footer>
    </div>
  );
}
