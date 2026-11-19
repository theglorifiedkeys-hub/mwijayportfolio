"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Globe2,
  Menu,
  Plus,
  ScanLine,
  X,
} from "lucide-react";
import { gsap } from "gsap";
import { reviewed, ventures, work } from "@/lib/portfolio";
import "./portfolio.css";

type Page = "home" | "work" | "about";
const art = "/portfolio/";
const scenes = [
  { name: "Copper relief", file: "studio-relief.jpg" },
  { name: "Solar terrain", file: "rift.jpg" },
  { name: "Lunar tide", file: "tide.jpg" },
];
const features = [
  {
    name: "Faida POS",
    cover: "faida-cover.jpg",
    screen: "faida-screen.webp",
    type: "Retail software",
    note: "A retail counter is no place for three separate ledgers. Faida brings the sale, the receipt and the stock movement into one workflow, with cash and M-Pesa recorded side by side.",
  },
  {
    name: "Audenic",
    cover: "audenic-cover.jpg",
    screen: "audenic-screen.webp",
    type: "E-commerce",
    note: "Audio gear is a hands-on purchase. Audenic gives headphones, speakers and radios room to be seen, with product specifications and online ordering in the same storefront.",
  },
];
type Feature = (typeof features)[number];
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
function Header({ page }: { page: Page }) {
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
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="ed-kicker">
      <i />
      {children}
    </div>
  );
}
function Footer() {
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
          <Link href="/login">Studio access</Link>
          <Link href="/about">About</Link>
          <a href="https://github.com/mwijay12">GitHub ↗</a>
          <a href="https://www.linkedin.com/in/mwijay-davie">LinkedIn ↗</a>
        </div>
      </div>
    </footer>
  );
}
function Hero() {
  const [frame, setFrame] = useState(0);
  const [time, setTime] = useState("UTC+3");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Dar_es_Salaam",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const update = () => setTime(fmt.format(new Date()) + " EAT");
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="ed-hero">
      {scenes.map((scene, i) => (
        <img
          key={scene.file}
          className="ed-landscape"
          data-active={frame === i}
          src={art + scene.file}
          alt=""
          fetchPriority={i === 0 ? "high" : "low"}
        />
      ))}
      <div className="ed-shade" />
      <div className="ed-wrap ed-stage">
        <div className="ed-intro">
          <Kicker>
            Studio portfolio <span>/</span> Edition 2026
          </Kicker>
          <h1>
            <span className="ed-title-mask">
              <span>Creative</span>
            </span>{" "}
            <span className="ed-title-mask">
              <em>Technologist.</em>
            </span>
          </h1>
          <p>
            I’m <strong>Mwijay Davie</strong>, co-founder of{" "}
            <a href={ventures[0].url}>Altraware</a>. I build digital products
            and automation from Dar es Salaam, Tanzania.
          </p>
          <div className="ed-ctas">
            <a href="#selected" className="ed-primary">
              Explore work <ArrowDown size={16} />
            </a>
            <Link href="/about" className="ed-about-link">
              About me <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        <div className="ed-film" aria-label="Landscape artwork selector">
          <span className="ed-cross" aria-hidden="true">
            +
          </span>
          <span aria-live="polite">
            <small>Field study &nbsp;/&nbsp; 0{frame + 1} of 03</small>
            <b>{scenes[frame].name}</b>
          </span>
          <div>
            {scenes.map((scene, i) => (
              <button
                key={scene.file}
                aria-label={`Show ${scene.name}`}
                aria-pressed={frame === i}
                onClick={() => setFrame(i)}
                className="ed-frame"
              >
                <img src={art + scene.file} alt="" />
                <span>0{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="ed-hero-foot ed-wrap">
        <span>
          <Globe2 size={14} /> Dar es Salaam, TZ <i /> {time}
        </span>
        <span className="ed-scroll">
          Scroll to explore <ArrowDown size={12} />
        </span>
      </div>
    </section>
  );
}
function CaseCard({
  feature,
  index,
  onOpen,
}: {
  feature: Feature;
  index: number;
  onOpen: () => void;
}) {
  const item = work.find((p) => p[0] === feature.name)!;
  return (
    <article className="ed-case">
      <button
        type="button"
        className="ed-case-image"
        aria-label={`Open ${feature.name} project notes`}
        onClick={onOpen}
      >
        <img src={art + feature.cover} alt="" />
        <span className="ed-tab">
          № 0{index + 1} <i /> {item[1]}
        </span>
        <span className="ed-image-name">
          {index === 0 ? <ScanLine /> : <AudioLines />}
          {feature.name}
        </span>
        <span className="ed-round">
          <ArrowUpRight size={19} />
        </span>
      </button>
      <div className="ed-case-meta">
        <h3>{feature.name}</h3>
        <span>{feature.type}</span>
      </div>
      <p>{item[3]}</p>
    </article>
  );
}
function FeatureSection() {
  const [feature, set] = useState<Feature | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const item = work.find((p) => p[0] === feature?.name);
  return (
    <section className="ed-section ed-wrap" id="selected">
      <Kicker>
        01 <span>/</span> Project index
      </Kicker>
      <div className="ed-section-heading">
        <h2>
          Selected <em>work.</em>
        </h2>
        <Link href="/projects" className="ed-text-link">
          All projects <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="ed-grid">
        {features.map((f, i) => (
          <CaseCard
            key={f.name}
            feature={f}
            index={i}
            onOpen={() => {
              set(f);
              dialog.current?.showModal();
            }}
          />
        ))}
      </div>
      <dialog
        ref={dialog}
        className="ed-dialog"
        aria-label="Project notes"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        {feature && item && (
          <div className="ed-notes">
            <button
              className="ed-close"
              onClick={() => dialog.current?.close()}
              aria-label="Close project notes"
            >
              <X size={19} />
            </button>
            <Kicker>{item[1]} / Project notes</Kicker>
            <h2>{feature.name}</h2>
            <p>{feature.note}</p>
            <img
              src={art + feature.screen}
              alt={`${feature.name} website screenshot`}
            />
            <div>
              <span className="ed-status">{item[2]}</span>
              <a
                className="ed-text-link"
                href={item[4]}
                target="_blank"
                rel="noreferrer"
              >
                Visit project <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
function Ventures() {
  return (
    <section className="ed-wrap ed-ventures">
      <Kicker>Studio directory</Kicker>
      {ventures.map((v, i) => (
        <a key={v.name} href={v.url} target="_blank" rel="noreferrer">
          <small>
            0{i + 1} / {v.label}
          </small>
          <h3>{v.name}</h3>
          <p>{v.description}</p>
          <ArrowUpRight />
        </a>
      ))}
    </section>
  );
}
function Registry() {
  const [filter, setFilter] = useState("All");
  return (
    <>
      <section className="ed-subhero">
        <div className="ed-wrap">
          <Kicker>Portfolio / Archive</Kicker>
          <h1>
            Work <em>index.</em>
          </h1>
          <p>
            Business tools, storefronts and community platforms from Altraware
            and Mwijay Studio.
          </p>
        </div>
      </section>
      <section className="ed-wrap ed-list">
        <div className="ed-reg-top">
          <div className="ed-filters">
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
          <small>Catalogue / {reviewed}</small>
        </div>
        {work.map(([name, studio, status, summary, url], i) =>
          filter === "All" || studio === filter ? (
            <a
              className="ed-row"
              key={name}
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              <small>0{i + 1}</small>
              <div>
                <small>{studio}</small>
                <h2>{name}</h2>
                <p>{summary}</p>
              </div>
              <span className="ed-status">{status}</span>
              <ArrowUpRight size={18} />
            </a>
          ) : null,
        )}
        <Link href="/projects/gallery" className="ed-text-link">
          Full work gallery <ArrowUpRight size={16} />
        </Link>
      </section>
    </>
  );
}
function About() {
  return (
    <>
      <section className="ed-bio">
        <div className="ed-wrap ed-bio-grid">
          <div>
            <Kicker>
              Profile <span>/</span> David Erick Mwijage
            </Kicker>
            <h1>
              Mwijay <em>Davie.</em>
            </h1>
            <p>
              I’m a creative technologist based in Dar es Salaam. I co-founded{" "}
              <a href={ventures[0].url}>Altraware</a> and run{" "}
              <a href={ventures[1].url}>Mwijay Studio</a>.
            </p>
            <p>
              My work starts with the things people do every day: recording a
              sale, finding a student’s report, placing an order. I build the
              software behind those moments.
            </p>
            <Link href="/projects" className="ed-primary">
              See my work <ArrowUpRight size={16} />
            </Link>
          </div>
          <figure className="ed-portrait">
            <div className="ed-print-label">
              <Plus size={13} /> Studio record — 001
            </div>
            <img
              src={art + "david.jpg"}
              alt="David Erick Mwijage, co-founder of Altraware"
            />
            <figcaption>
              <b>D. Mwijage</b>
              <span>Dar es Salaam, TZ</span>
            </figcaption>
          </figure>
        </div>
      </section>
      <div className="ed-wrap ed-profile-intro">
        <Kicker>Practice / Field notes</Kicker>
        <h2>
          From the counter
          <br />
          to the <em>cloud.</em>
        </h2>
        <p>
          At Altraware, I work on tools for shops, care centres and schools in
          Tanzania. At Mwijay Studio, I bring the same practical approach to
          websites, storefronts and automated workflows.
        </p>
      </div>
      <Ventures />
    </>
  );
}
export function Folio({ page = "home" }: { page?: Page }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const intro = root.current?.querySelector(
          ".ed-intro, .ed-bio-grid, .ed-subhero .ed-wrap",
        );
        if (!intro) return;
        const lines = intro.querySelectorAll(".ed-title-mask > *");
        const timeline = gsap.timeline({
          defaults: { ease: "power3.out", clearProps: "transform,opacity" },
        });
        if (lines.length) {
          timeline
            .from(lines, { yPercent: 70, duration: 0.64, stagger: 0.075 }, 0)
            .from(
              intro.querySelectorAll(".ed-kicker, p, .ed-ctas"),
              { y: 8, opacity: 0.3, stagger: 0.07, duration: 0.4 },
              0.06,
            );
        } else {
          timeline.from(intro.children, {
            y: 10,
            opacity: 0.4,
            stagger: 0.05,
            duration: 0.45,
          });
        }
      },
      root,
    );
    return () => mm.revert();
  }, [page]);
  return (
    <div className="ed" ref={root}>
      <Header page={page} />
      <main>
        {page === "home" ? (
          <>
            <Hero />
            <FeatureSection />
            <Ventures />
          </>
        ) : page === "about" ? (
          <About />
        ) : (
          <Registry />
        )}
      </main>
      <Footer />
    </div>
  );
}
