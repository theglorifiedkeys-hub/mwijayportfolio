"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import "./portfolio.css";
function Sun({ size = 22 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="currentColor"
    >
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={i}
          transform={`rotate(${i * 30} 20 20)`}
          d="M18 1h4l-1 13h-2z"
        />
      ))}
      <circle cx="20" cy="20" r="4" />
    </svg>
  );
}
export function StudioHeader({ page }: { page?: string }) {
  const [open, set] = useState(false);
  return (
    <header className="ed-head">
      <div className="ed-wrap ed-bar">
        <Link href="/" className="ed-brand" aria-label="Mwijay Davie home">
          <Sun size={30} />
          mwijay<span>.</span>
        </Link>
        <nav
          aria-label="Main navigation"
          id="ed-nav"
          className={open ? "is-open" : ""}
        >
          {(
            [
              ["home", "Index", "/"],
              ["work", "Work", "/projects"],
              ["about", "About", "/about"],
              ["library", "Library", "/library"],
              ["market", "Market", "/market"],
            ] as const
          ).map(([key, label, url]) => (
            <Link
              key={key}
              href={url}
              aria-current={key === page ? "page" : undefined}
              onClick={() => set(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link className="ed-talk" href="/contact">
          Let’s talk <ArrowUpRight size={15} />
        </Link>
        <button
          className="ed-menu"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-controls="ed-nav"
          aria-expanded={open}
          onClick={() => set(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
export function StudioFooter() {
  return (
    <footer className="ed-foot">
      <div className="ed-wrap">
        <div className="ed-foot-head">
          <Sun size={34} />
          <h2>
            Let’s make <em>something.</em>
          </h2>
          <Link href="/contact" aria-label="Contact Mwijay Davie">
            <ArrowUpRight />
          </Link>
        </div>
        <div className="ed-foot-base">
          <span>© 2026 Mwijay Davie</span>
          <Link href="/book">Start a project</Link>
          <Link href="/#studio-services">Studio directory</Link>
          <Link href="/agreement">Agreement</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/login">Studio access</Link>
          <Link href="/client-portal">Client portal</Link>
          <Link href="/about">About</Link>
          <a href="https://github.com/mwijay12">GitHub ↗</a>
          <a href="https://www.linkedin.com/in/mwijay-davie">LinkedIn ↗</a>
        </div>
      </div>
    </footer>
  );
}
