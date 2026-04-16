import Link from "next/link";

// ---- Feature cards data ---------------------------------------------------

const features = [
  {
    icon: "\u2609", // ☉
    title: "Charts",
    description:
      "Western, Vedic, BaZi, Human Design, and Harmonics charts with precise astronomical calculations.",
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
  },
  {
    icon: "\u2606", // ☆
    title: "Personality",
    description:
      "MBTI, Enneagram, Archetypes, and Biorhythm analysis synthesized from multiple paradigms.",
    color: "text-accent-purple",
    bg: "bg-accent-purple/10",
  },
  {
    icon: "\u2604", // ☄
    title: "Oracle",
    description:
      "AI-powered conversational oracle integrating all methodologies for deep personal insight.",
    color: "text-accent-emerald",
    bg: "bg-accent-emerald/10",
  },
  {
    icon: "\u27E8\u27E9", // ⟨⟩
    title: "Developer API",
    description:
      "Full REST API with 335 endpoints, webhooks, sandboxing, and white-label capabilities.",
    color: "text-accent-amber",
    bg: "bg-accent-amber/10",
  },
  {
    icon: "\u21BB", // ↻
    title: "Real-time Transits",
    description:
      "Live planetary positions, lunar phases, space weather, and transit tracking updated continuously.",
    color: "text-accent-rose",
    bg: "bg-accent-rose/10",
  },
  {
    icon: "\u2638", // ☸
    title: "45 Methodologies",
    description:
      "I Ching, Tarot, Feng Shui, Nine Star Ki, Numerology, Color Psychology, and more in one platform.",
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
  },
];

// ---- Stats ----------------------------------------------------------------

const stats = [
  { value: "335", label: "API Endpoints" },
  { value: "45", label: "Methodologies" },
  { value: "27", label: "Systems" },
  { value: "2.5M", label: "Historical Figures" },
];

// ---- Page -----------------------------------------------------------------

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen cosmic-bg">
      {/* ---- Navigation ---- */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-2xl text-accent-blue">{"\u2727"}</span>
          <span className="text-lg font-bold tracking-wide text-text-primary">
            ENVI-OUS BRAIN
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Dashboard
          </Link>
          <a
            href="https://envious-brain-api-uxgej3n6ta-uc.a.run.app/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            API Docs
          </a>
          <Link
            href="/dashboard"
            className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 transition-colors shadow-lg shadow-accent-blue/20"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <div className="animate-fade-in">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent-blue">
            Intelligence Engine
          </p>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            <span className="gradient-text">Multi-Paradigm</span>
            <br />
            <span className="text-text-primary">Intelligence Engine</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-text-secondary">
            Unifying astrology, personality science, divination, and AI into a
            single programmable platform. 335 API endpoints spanning 45
            methodologies and 27 distinct systems.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-6 py-3 text-base font-semibold text-white shadow-xl shadow-accent-blue/25 hover:bg-accent-blue/90 transition-all"
            >
              Launch Dashboard
              <span className="text-lg">{"\u2192"}</span>
            </Link>
            <a
              href="https://envious-brain-api-uxgej3n6ta-uc.a.run.app/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-base font-medium text-text-secondary hover:border-border-hover hover:text-text-primary transition-all"
            >
              View API Docs
              <span className="text-sm">{"\u2197"}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ---- Stats bar ---- */}
      <section className="border-y border-border/50 bg-surface/50">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-6 py-6 sm:gap-16">
          {stats.map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary">
                {s.value}
              </span>
              <span className="text-sm text-text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Feature grid ---- */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-text-primary">
            Everything in One Platform
          </h2>
          <p className="text-text-secondary">
            From natal charts to AI oracles, from biorhythms to developer APIs.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-border-hover hover:shadow-lg hover:shadow-black/20"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${f.bg} ${f.color}`}
              >
                {f.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Bottom CTA ---- */}
      <section className="border-t border-border/50 bg-surface/30 px-6 py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold text-text-primary">
          Ready to explore the cosmos?
        </h2>
        <p className="mb-8 text-text-secondary">
          Start with a free profile and unlock all 45 methodologies.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-8 py-3 text-base font-semibold text-white shadow-xl shadow-accent-blue/25 hover:bg-accent-blue/90 transition-all"
        >
          Get Started
          <span>{"\u2192"}</span>
        </Link>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-border/30 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-accent-blue">{"\u2727"}</span>
            <span className="text-sm font-semibold text-text-primary">
              ENVI-OUS BRAIN
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Multi-Paradigm Intelligence Engine. Built by Informal.
          </p>
        </div>
      </footer>
    </div>
  );
}
