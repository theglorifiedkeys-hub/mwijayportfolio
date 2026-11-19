"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useAuth,
  useUser,
  useDoc,
  useFirestore,
  useMemoFirebase,
} from "@/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import Link from "next/link";
import "./studio-login.css";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc } from "firebase/firestore";

/**
 * System Login Node
 * Hardened for high-priority redirection to prevent infinite loading signals.
 */
export default function LoginPage() {
  const { user, isAdmin, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // INSTANT REDIRECT SIGNAL: Once user is detected, move them immediately.
  useEffect(() => {
    if (!isUserLoading && user) {
      const destination = isAdmin ? "/admin" : "/client-portal";
      router.replace(destination);
    }
  }, [user, isAdmin, isUserLoading, router]);

  const designRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "site_config", "auth_design");
  }, [db]);

  const { data: designData } = useDoc(designRef as any);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth || isLoggingIn) return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill all fields to continue.",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The useEffect above will handle the instant redirect
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials or system interruption.",
      });
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      // The useEffect above will handle the instant redirect
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        toast({
          variant: "destructive",
          title: "Auth Failed",
          description: err.message,
        });
      }
      setIsLoggingIn(false);
    }
  };

  const disabled = !auth || isLoggingIn || isUserLoading;
  return (
    <main className="studio-login">
      <aside
        style={{
          backgroundImage: `linear-gradient(180deg,#13151164,transparent 50%,#0e100ddc),url(${designData?.adminHeroImageUrl || "/portfolio/studio-relief.jpg"})`,
        }}
      >
        <Link href="/" className="login-brand">
          <img src="/portfolio/icon-192.png" alt="" />
          mwijay.
        </Link>
        <div>
          <small>Field study &nbsp;/&nbsp; 01</small>
          <h2>
            Inside the
            <br />
            <em>studio.</em>
          </h2>
          <p>Dar es Salaam, Tanzania</p>
        </div>
      </aside>
      <section>
        <Link href="/" className="login-back">
          <ArrowLeft size={14} /> Back to portfolio
        </Link>
        <div className="login-inner">
          <small>
            <LockKeyhole size={13} /> Private workspace
          </small>
          <h1>
            Studio <em>access.</em>
          </h1>
          <p>Sign in to manage your projects, inquiries and publishing.</p>
          <form onSubmit={handleSignIn}>
            <label htmlFor="studio-email">Email address</label>
            <input
              autoComplete="username"
              id="studio-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
            <label htmlFor="studio-password">Password</label>
            <div className="login-password">
              <input
                id="studio-password"
                name="password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                required
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <button className="login-submit" disabled={disabled}>
              {isLoggingIn ? "Signing in…" : "Sign in"} <ArrowRight size={16} />
            </button>
          </form>
          <button
            className="login-google"
            onClick={handleGoogleSignIn}
            disabled={disabled}
          >
            Continue with Google <ArrowUpRight size={15} />
          </button>
          {!auth && (
            <p className="login-notice" role="status">
              Sign-in requires a configured Firebase connection.
            </p>
          )}
          <button
            className="login-help"
            onClick={() =>
              toast({
                title: "Password help",
                description:
                  "Contact studio support for a manual password reset.",
              })
            }
          >
            Forgot your password?
          </button>
        </div>
        <footer>
          <span>MWIJAY STUDIO</span>
          <span>ADMINISTRATION / 2026</span>
        </footer>
      </section>
    </main>
  );
}
