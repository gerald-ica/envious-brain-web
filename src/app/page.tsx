import Link from "next/link";
import { AnimatedZodiac } from "@/components/landing/animated-zodiac";
import { CountUp } from "@/components/landing/count-up";
import { MobileNav } from "@/components/landing/mobile-nav";

const SWAGGER_URL = "https://envious-brain-api-uxgej3n6ta-uc.a.run.app/docs";

// ---- Feature cards data ---------------------------------------------------

const features = [
  {
    icon: "\u2609", // ☉
    title: "Charts",
    description:
      "Western, Vedic, BaZi, Human Design, and Harmonics charts with precise astronomical calculations.",
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
    glow: "group-hover:shadow-accent-blue/20",
    border: "group-hover:border-accent-blue/40",
    href: "/dashboard/charts/western",
  },
  {
    icon: "\u2606", // ☆
    title: "Personality",
    description:
      "MBTI, Enneagram, Archetypes, and Biorhythm analysis synthesized from multiple paradigms.",
    color: "text-accent-purple",
    bg: "bg-accent-purple/10",
    glow: "group-hover:shadow-accent-purple/20",
    border: "group-hover:border-accent-purple/40",
    href: "/dashboard/personality/mbti",
  },
  {
    icon: "\u2604", // ☄
    title: "Oracle",
    description:
      "AI-powered conversational oracle integrating all methodologies for deep personal insight.",
    color: "text-accent-emerald",
    bg: "bg-accent-emerald/10",
    glow: "group-hover:shadow-accent-emerald/20",
    border: "group-hover:border-accent-emerald/40",
    href: "/dashboard/oracle",
  },
  {
    icon: "\u27E8\u27E9", // ⟨⟩
    title: "Developer API",
    description:
      "Full REST API with 335 endpoints, webhooks, sandboxing, and white-label capabilities.",
    color: "text-accent-amber",
    bg: "bg-accent-amber/10",
    glow: "group-hover:shadow-accent-amber/20",
    border: "group-hover:border-accent-amber/40",
    href: SWAGGER_URL,
  },
  {
    icon: "\u21BB", // ↻
    title: "Real-time Transits",
    description:
      "Live planetary positions, lunar phases, space weather, and transit tracking updated continuously.",
    color: "text-accent-rose",
    bg: "bg-accent-rose/10",
    glow: "group-hover:shadow-accent-rose/20",
    border: "group-hover:border-accent-rose/40",
    href: "/dashboard/charts/transits",
  },
  {
    icon: "\u2638", // ☸
    title: "45 Methodologies",
    description:
      "I Ching, Tarot, Feng Shui, Nine Star Ki, Numerology, Color Psychology, and more in one platform.",
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
    glow: "group-hover:shadow-accent-blue/20",
    border: "group-hover:border-accent-blue/40",
    href: "/dashboard/explore/iching",
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
      <nav className="relative flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-2xl text-accent-blue">{"\u2727"}</span>
          <span className="text-lg font-bold tracking-wide text-text-primary">
            ENVI-OUS BRAIN
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Dashboard
          </Link>
          <a
            href={SWAGGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            API Docs
          </a>
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 transition-colors shadow-lg shadow-accent-blue/20"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile: CTA always visible + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/register"
            className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 transition-colors shadow-lg shadow-accent-blue/20"
          >
            Get Started
          </Link>
          <MobileNav />
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden px-6 pt-20 pb-12">
        {/* Star field background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-[10%] left-[15%] h-1 w-1 rounded-full bg-white/20 animate-[pulse-dot_3s_ease-in-out_infinite]" />
          <div className="absolute top-[25%] right-[20%] h-0.5 w-0.5 rounded-full bg-accent-blue/30 animate-[pulse-dot_4s_ease-in-out_infinite_0.5s]" />
          <div className="absolute top-[60%] left-[8%] h-0.5 w-0.5 rounded-full bg-accent-purple/30 animate-[pulse-dot_5s_ease-in-out_infinite_1s]" />
          <div className="absolute top-[40%] right-[10%] h-1 w-1 rounded-full bg-white/15 animate-[pulse-dot_3.5s_ease-in-out_infinite_0.7s]" />
          <div className="absolute bottom-[20%] left-[30%] h-0.5 w-0.5 rounded-full bg-accent-emerald/20 animate-[pulse-dot_4.5s_ease-in-out_infinite_1.5s]" />
          <div className="absolute top-[15%] left-[60%] h-0.5 w-0.5 rounded-full bg-white/10 animate-[pulse-dot_6s_ease-in-out_infinite_2s]" />
          <div className="absolute bottom-[35%] right-[35%] h-1 w-1 rounded-full bg-accent-amber/15 animate-[pulse-dot_4s_ease-in-out_infinite_0.3s]" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 lg:flex-row lg:gap-12">
          {/* Text side */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-accent-blue/5 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald pulse-dot" />
              <span className="text-xs font-medium uppercase tracking-widest text-accent-blue">
                Intelligence Engine
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
              <span className="gradient-text">Multi-Paradigm</span>
              <br />
              <span className="text-text-primary">Intelligence</span>
              <br />
              <span className="text-text-primary">Engine</span>
            </h1>

            <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-text-secondary lg:mx-0">
              Unifying astrology, personality science, divination, and AI into a
              single programmable platform. 335 API endpoints spanning 45
              methodologies and 27 distinct calculation systems.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-accent-blue/25 hover:bg-accent-blue/90 hover:shadow-accent-blue/40 transition-all"
              >
                Get Started Free
                <span className="text-lg">{"\u2192"}</span>
              </Link>
              <a
                href={SWAGGER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-7 py-3.5 text-base font-medium text-text-secondary hover:border-border-hover hover:text-text-primary transition-all"
              >
                View API Docs
                <span className="text-sm">{"\u2197"}</span>
              </a>
            </div>

            {/* Credibility badge */}
            <div className="mt-8 flex items-center gap-3 justify-center lg:justify-start">
              <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-surface/50 px-3 py-1.5">
                <span className="text-xs text-text-muted">Powered by</span>
                <span className="text-xs font-semibold text-text-secondary">Swiss Ephemeris</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-surface/50 px-3 py-1.5">
                <span className="text-xs text-text-muted">Built by</span>
                <span className="text-xs font-semibold text-text-secondary">Informal</span>
              </div>
            </div>
          </div>

          {/* Zodiac graphic side */}
          <div className="flex-shrink-0 w-[320px] h-[320px] lg:w-[400px] lg:h-[400px]">
            <AnimatedZodiac />
          </div>
        </div>
      </section>

      {/* ---- Stats bar ---- */}
      <section className="border-y border-border/50 bg-surface/50">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-10 px-6 py-8 sm:gap-16">
          {stats.map((s) => (
            <CountUp key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      {/* ---- Feature grid ---- */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-text-primary sm:text-4xl">
            Everything in One Platform
          </h2>
          <p className="mx-auto max-w-lg text-text-secondary">
            From natal charts to AI oracles, from biorhythms to developer APIs —
            a unified intelligence engine.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const isExternal = f.href.startsWith("http");
            const Wrapper = isExternal ? "a" : Link;
            const extraProps = isExternal
              ? { target: "_blank" as const, rel: "noopener noreferrer" }
              : {};
            return (
              <Wrapper
                key={f.title}
                href={f.href}
                {...extraProps}
                className={`group block rounded-xl border border-border bg-card p-7 transition-all duration-300 hover:border-border-hover hover:shadow-xl ${f.glow} ${f.border}`}
              >
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-3xl ${f.bg} ${f.color} transition-transform duration-300 group-hover:scale-110`}
                >
                  {f.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-text-primary">
                  {f.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-text-secondary">
                  {f.description}
                </p>
                <span className={`text-sm font-medium ${f.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}>
                  Learn more →
                </span>
              </Wrapper>
            );
          })}
        </div>
      </section>

      {/* ---- Bottom CTA ---- */}
      <section className="relative border-t border-border/50 px-6 py-20 text-center overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-accent-blue/[0.03] to-transparent" />

        <div className="relative">
          <h2 className="mb-4 text-3xl font-bold text-text-primary sm:text-4xl">
            Ready to explore the cosmos?
          </h2>
          <p className="mx-auto mb-10 max-w-md text-text-secondary">
            Start with a free profile and unlock all 45 methodologies, 27
            calculation engines, and the AI Oracle.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-accent-blue/25 hover:bg-accent-blue/90 hover:shadow-accent-blue/40 transition-all"
            >
              Get Started Free
              <span>{"\u2192"}</span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 text-base font-medium text-text-secondary hover:border-border-hover hover:text-text-primary transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-border/30 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 mb-10">
            {/* Product */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-text-primary">Product</h4>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link href="/dashboard" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <a href={SWAGGER_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                    API Docs
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-text-primary">Resources</h4>
              <ul className="flex flex-col gap-2">
                <li>
                  <a href={SWAGGER_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com/gerald-ica/ENVI-OUS-BRAIN" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-text-primary">Legal</h4>
              <ul className="flex flex-col gap-2">
                <li>
                  <a href="/privacy" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            {/* Branding */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-accent-blue">{"\u2727"}</span>
                <span className="text-sm font-semibold text-text-primary">
                  ENVI-OUS BRAIN
                </span>
              </div>
              <p className="text-xs leading-relaxed text-text-muted">
                Multi-Paradigm Intelligence Engine.
                <br />
                Built by Informal.
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border/30 pt-6 text-center">
            <p className="text-xs text-text-muted">
              &copy; {new Date().getFullYear()} ENVI-OUS BRAIN. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
