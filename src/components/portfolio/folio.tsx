"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  Asterisk,
  Crosshair,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { gsap } from "gsap";
import { reviewed, ventures, work } from "@/lib/portfolio";
import "./portfolio.css";

function Header({ archive }: { archive: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="pf-header">
      <div className="pf-wrap pf-bar">
        <a href="/" className="pf-brand" aria-label="Mwijay Davie home">
          <svg viewBox="0 0 42 36" width="39" height="35" aria-hidden="true">
            <path
              d="M1 30 12 5h7l-11 25zm12 0L24 5h7L20 30zm12 0L35 7l6 23H25Z"
              fill="currentColor"
            />
          </svg>
          Mwijay Davie<span>.</span>
        </a>
        <nav
          aria-label="Main navigation"
          className={open ? "pf-nav pf-open" : "pf-nav"}
        >
          <a
            className={!archive ? "active" : ""}
            href="/"
            onClick={() => setOpen(false)}
          >
            Overview
          </a>
          <a className={archive ? "active" : ""} href="/projects">
            Projects
          </a>
          <a href="/about">About</a>
        </nav>
        <a className="pf-talk" href="/contact">
          Let’s talk <ArrowUpRight size={15} />
        </a>
        <button
          className="pf-menu"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="pf-label">
      <i />
      {children}
    </div>
  );
}
function Registry() {
  const [filter, setFilter] = useState("All");
  return (
    <section className="pf-wrap pf-registry">
      <Label>Project archive</Label>
      <h1>
        Project index<span>.</span>
      </h1>
      <p>
        Selected builds from Altraware and Mwijay Studio. Status reflects each
        studio’s published catalogue.
      </p>
      <small>LAST REVIEWED / {reviewed}</small>
      <div className="pf-filters">
        {["All", ...ventures.map((v) => v.name)].map((n) => (
          <button
            key={n}
            aria-pressed={filter === n}
            onClick={() => setFilter(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <div>
        {work
          .filter((p) => filter === "All" || p[1] === filter)
          .map(([name, studio, status, summary, url]) => (
            <a
              className="pf-row"
              key={name}
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              <div>
                <small>{studio}</small>
                <h2>{name}</h2>
                <p>{summary}</p>
              </div>
              <span className="pf-status">{status}</span>
              <ArrowUpRight size={19} />
            </a>
          ))}
      </div>
      <a className="pf-archive-link" href="/projects/gallery">
        Browse the full work gallery <ArrowUpRight size={15} />
      </a>
    </section>
  );
}
export function Folio({ archive = false }: { archive?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (archive) return;
    const mm = gsap.matchMedia();
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        gsap.from(".pf-intro > *", {
          y: 14,
          opacity: 0,
          duration: 0.55,
          stagger: 0.06,
          clearProps: "all",
        });
        gsap.from(".pf-object", {
          scale: 0.96,
          duration: 1.1,
          ease: "power2.out",
          clearProps: "transform",
        });
      },
      root,
    );
    return () => mm.revert();
  }, [archive]);
  return (
    <div className="pf" ref={root}>
      <Header archive={archive} />
      <main>
        {archive ? (
          <Registry />
        ) : (
          <>
            <section className="pf-hero">
              <div className="pf-wrap pf-hero-inner">
                <div className="pf-intro">
                  <Label>
                    Independent portfolio <b>/</b> 2026
                  </Label>
                  <h1>
                    Digital systems.
                    <br />
                    Human impact<span>.</span>
                  </h1>
                  <p>
                    I’m <strong>Mwijay Davie</strong>, a creative technologist
                    and co-founder of <strong>Altraware</strong>. I build
                    websites, business systems and AI automation from Dar es
                    Salaam, Tanzania.
                  </p>
                  <div className="pf-actions">
                    <a className="pf-primary" href="#work">
                      Explore my work <ArrowDown size={16} />
                    </a>
                    <a className="pf-secondary" href="/about">
                      About me <ArrowUpRight size={15} />
                    </a>
                  </div>
                </div>
                <figure className="pf-figure">
                  <img
                    className="pf-object"
                    src="/portfolio/hero-arch.jpg"
                    fetchPriority="high"
                    alt="Sculptural white arch framing a floating coral sphere"
                  />
                  <span className="pf-target t-one">+</span>
                  <span className="pf-target t-two">+</span>
                  <figcaption>
                    <span />
                    FIG. 01 &nbsp;/&nbsp; SYSTEM FORM
                  </figcaption>
                </figure>
              </div>
              <div className="pf-wrap pf-coords">
                <span>
                  <MapPin size={13} /> DAR ES SALAAM, TZ
                </span>
                <span>06°49′ S &nbsp; 39°16′ E</span>
                <span>
                  <i /> FOCUS: ALTRAWARE
                </span>
              </div>
            </section>
            <section id="work" className="pf-wrap pf-work">
              <Label>
                01 <b>/</b> Work index
              </Label>
              <div className="pf-section-title">
                <h2>
                  Selected work<span>.</span>
                </h2>
                <a className="pf-all" href="/projects">
                  All projects <ArrowUpRight size={16} />
                </a>
              </div>
              <div className="pf-cards">
                {ventures.map((v, i) => (
                  <a
                    href={v.url}
                    key={v.name}
                    target="_blank"
                    rel="noreferrer"
                    className="pf-card"
                  >
                    <div className="pf-cover">
                      <img src={"/portfolio/" + v.image + ".jpg"} alt="" />
                      <div className="pf-card-top">
                        <span>
                          0{i + 1} / {v.label}
                        </span>
                        <ArrowUpRight size={18} />
                      </div>
                      <div className="pf-wordmark">
                        {i === 0 ? <Crosshair /> : <Asterisk />}
                        {v.name}
                      </div>
                    </div>
                    <div className="pf-card-body">
                      <h3>{v.name}</h3>
                      <p>{v.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="pf-wrap pf-footer">
        <span>© 2026 Mwijay Davie</span>
        <a href="/contact">
          Get in touch <ArrowDownRight size={14} />
        </a>
      </footer>
    </div>
  );
}
