import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | ENVI-OUS BRAIN",
  description:
    "Choose the right plan for your needs — from free exploration to enterprise white-label solutions.",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with core charts and basic analysis.",
    color: "text-accent-emerald",
    border: "border-accent-emerald/30",
    bg: "bg-accent-emerald/5",
    cta: "Get Started",
    ctaHref: "/register",
    ctaStyle:
      "bg-accent-emerald text-white hover:bg-accent-emerald/90 shadow-lg shadow-accent-emerald/20",
    badge: null,
    features: [
      "Western natal chart",
      "Basic personality (MBTI, Enneagram)",
      "Daily horoscope",
      "Biorhythm chart",
      "100 API calls / month",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/ month",
    description: "All methodologies, Oracle AI, and serious API access.",
    color: "text-accent-blue",
    border: "border-accent-blue/30",
    bg: "bg-accent-blue/5",
    cta: "Coming Soon",
    ctaHref: null,
    ctaStyle:
      "bg-accent-blue text-white hover:bg-accent-blue/90 shadow-lg shadow-accent-blue/20",
    badge: "Coming Soon",
    features: [
      "All 45 methodologies",
      "Oracle AI chat (unlimited)",
      "Vedic, BaZi, Human Design charts",
      "Synastry & compatibility",
      "Transit tracking & alerts",
      "10,000 API calls / month",
      "Priority support",
      "Export & share charts",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "White-label, unlimited access, and custom integrations.",
    color: "text-accent-purple",
    border: "border-accent-purple/30",
    bg: "bg-accent-purple/5",
    cta: "Contact Us",
    ctaHref: null,
    ctaStyle:
      "bg-accent-purple text-white hover:bg-accent-purple/90 shadow-lg shadow-accent-purple/20",
    badge: "Coming Soon",
    features: [
      "Everything in Pro",
      "Unlimited API calls",
      "White-label branding",
      "Custom methodology integrations",
      "Dedicated infrastructure",
      "Webhook & event streaming",
      "SLA guarantee",
      "Dedicated account manager",
    ],
  },
];

export default function PricingPage() {
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

      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        {/* Heading */}
        <div className="mb-16 text-center animate-fade-in">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent-amber">
            Pricing
          </p>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl text-text-primary">
            Choose Your Plan
          </h1>
          <p className="mx-auto max-w-lg text-lg text-text-secondary">
            From free exploration to enterprise-grade intelligence
            infrastructure.
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-xl border ${tier.border} bg-card p-8`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3 right-6">
                  <span className="rounded-full bg-accent-amber/20 px-3 py-1 text-xs font-semibold text-accent-amber">
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Tier header */}
              <div className="mb-6">
                <h3 className={`mb-1 text-sm font-semibold uppercase tracking-wider ${tier.color}`}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-text-primary">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-text-muted">
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {tier.description}
                </p>
              </div>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className={`mt-0.5 ${tier.color}`}>{"\u2713"}</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {tier.ctaHref ? (
                <Link
                  href={tier.ctaHref}
                  className={`block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-all ${tier.ctaStyle}`}
                >
                  {tier.cta}
                </Link>
              ) : (
                <div className="w-full">
                  <button
                    disabled
                    className={`block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold opacity-60 cursor-not-allowed ${tier.ctaStyle}`}
                  >
                    {tier.cta}
                  </button>
                  {/* Email capture placeholder */}
                  <p className="mt-3 text-center text-xs text-text-muted">
                    Notify me when available
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FAQ / footnote */}
        <div className="mt-16 text-center">
          <p className="text-sm text-text-muted">
            All plans include access to the Swiss Ephemeris calculation engine.
            API rate limits are measured per calendar month.
          </p>
          <div className="mt-6">
            <Link
              href="/about"
              className="text-sm font-medium text-accent-blue hover:text-accent-blue/80 transition-colors"
            >
              Learn more about our methodologies {"\u2192"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
