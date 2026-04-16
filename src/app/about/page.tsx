import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | ENVI-OUS BRAIN",
  description:
    "Learn about the Multi-Paradigm Intelligence Engine — 45 methodologies, 27 calculation engines, powered by Swiss Ephemeris.",
};

const methodologyGroups = [
  {
    title: "Astrological Systems",
    color: "text-accent-blue",
    border: "border-accent-blue/20",
    items: [
      "Western Astrology",
      "Vedic (Jyotish)",
      "Chinese BaZi",
      "Human Design",
      "Harmonics",
      "Synastry",
      "Transit Tracking",
    ],
  },
  {
    title: "Personality Science",
    color: "text-accent-purple",
    border: "border-accent-purple/20",
    items: [
      "MBTI Typology",
      "Enneagram",
      "Jungian Archetypes",
      "Biorhythm Analysis",
      "Personality Synthesis",
    ],
  },
  {
    title: "Divination & Esoteric",
    color: "text-accent-emerald",
    border: "border-accent-emerald/20",
    items: [
      "I Ching",
      "Tarot",
      "Numerology",
      "Feng Shui",
      "Nine Star Ki",
      "Color Psychology",
      "Spirit Animal",
    ],
  },
  {
    title: "AI & Data",
    color: "text-accent-amber",
    border: "border-accent-amber/20",
    items: [
      "Oracle AI Chat",
      "Space Weather",
      "Lunar Phases",
      "Historical Figure Database (2.5M)",
    ],
  },
];

const engineStats = [
  { value: "45", label: "Methodology Systems" },
  { value: "27", label: "Calculation Engines" },
  { value: "335", label: "API Endpoints" },
  { value: "2.5M", label: "Historical Figures" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen cosmic-bg">
      {/* Minimal header */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl text-accent-blue">{"\u2727"}</span>
          <span className="text-lg font-bold tracking-wide text-text-primary">
            ENVI-OUS BRAIN
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          {"\u2190"} Back to Home
        </Link>
      </nav>

      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        {/* Heading */}
        <div className="mb-16 text-center animate-fade-in">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent-purple">
            About
          </p>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="gradient-text">Multi-Paradigm</span>{" "}
            <span className="text-text-primary">Intelligence Engine</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-text-secondary">
            ENVI-OUS BRAIN unifies astrology, personality science, divination
            systems, and artificial intelligence into a single programmable
            platform — delivering precision calculations through the Swiss
            Ephemeris engine and deep synthesis through AI.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {engineStats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center rounded-xl border border-border bg-card p-5 text-center"
            >
              <span className="text-3xl font-bold text-text-primary">
                {s.value}
              </span>
              <span className="mt-1 text-xs text-text-muted">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Core concept */}
        <div className="mb-16 rounded-xl border border-border bg-card p-8">
          <h2 className="mb-4 text-xl font-bold text-text-primary">
            What is a Multi-Paradigm Intelligence Engine?
          </h2>
          <p className="mb-4 leading-relaxed text-text-secondary">
            Traditional platforms focus on a single system — a horoscope here, a
            personality quiz there. ENVI-OUS BRAIN takes a fundamentally
            different approach: it treats every methodology as a lens in a
            larger optical system.
          </p>
          <p className="mb-4 leading-relaxed text-text-secondary">
            By computing Western, Vedic, and Chinese astrology alongside MBTI,
            Enneagram, archetypes, biorhythms, I Ching, Tarot, Numerology, and
            more — all from the same birth data — the engine can synthesize
            cross-paradigm insights that no single system could produce alone.
          </p>
          <p className="leading-relaxed text-text-secondary">
            Every calculation is backed by the{" "}
            <span className="font-semibold text-text-primary">
              Swiss Ephemeris
            </span>{" "}
            — the same astronomical library used by professional astrologers and
            researchers worldwide, delivering arc-second precision for planetary
            positions from 13,000 BCE to 17,000 CE.
          </p>
        </div>

        {/* Methodology groups */}
        <h2 className="mb-8 text-center text-2xl font-bold text-text-primary">
          Methodology Overview
        </h2>
        <div className="mb-16 grid gap-6 sm:grid-cols-2">
          {methodologyGroups.map((group) => (
            <div
              key={group.title}
              className={`rounded-xl border ${group.border} bg-card p-6`}
            >
              <h3 className={`mb-4 text-sm font-semibold uppercase tracking-wider ${group.color}`}>
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-text-secondary"
                  >
                    <span className={`h-1 w-1 rounded-full ${group.color.replace("text-", "bg-")}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Built by */}
        <div className="rounded-xl border border-border bg-surface/50 p-8 text-center">
          <p className="mb-2 text-sm text-text-muted">Built by</p>
          <p className="text-2xl font-bold text-text-primary">Informal</p>
          <p className="mt-3 text-sm text-text-secondary">
            Crafting intelligence infrastructure for the next generation of
            insight-driven applications.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/20 hover:bg-accent-blue/90 transition-all"
            >
              Explore the Platform
              <span>{"\u2192"}</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
