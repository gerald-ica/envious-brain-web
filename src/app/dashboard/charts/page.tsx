"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Charts Index -- card grid linking to every chart type
// ---------------------------------------------------------------------------

interface ChartType {
  title: string;
  href: string;
  icon: string;
  description: string;
  badge: string;
  badgeVariant: "info" | "healthy" | "neutral" | "degraded";
}

const CHART_TYPES: ChartType[] = [
  {
    title: "Western Natal Chart",
    href: "/dashboard/charts/western",
    icon: "\u2609", // ☉
    description:
      "Tropical zodiac chart with planet positions, house cusps, aspects, and element/modality distribution analysis.",
    badge: "Tropical",
    badgeVariant: "info",
  },
  {
    title: "Vedic Astrology",
    href: "/dashboard/charts/vedic",
    icon: "\u0950", // ॐ
    description:
      "Sidereal Rashi chart, Nakshatra analysis, Vimshottari Dasha periods, and Yoga detection for Jyotish readings.",
    badge: "Sidereal",
    badgeVariant: "healthy",
  },
  {
    title: "BaZi Four Pillars",
    href: "/dashboard/charts/bazi",
    icon: "\u7528", // 用
    description:
      "Chinese metaphysics Four Pillars of Destiny -- Year, Month, Day, and Hour pillars with Five Elements analysis.",
    badge: "Chinese",
    badgeVariant: "degraded",
  },
  {
    title: "Numerology",
    href: "/dashboard/charts/numerology",
    icon: "#",
    description:
      "Life Path, Expression, Soul Urge, and Personality numbers derived from your name and birth date.",
    badge: "Numbers",
    badgeVariant: "neutral",
  },
  {
    title: "Human Design",
    href: "/dashboard/charts/human-design",
    icon: "\u25CE", // ◎
    description:
      "Your energetic blueprint -- Type, Strategy, Authority, Profile, Centers, Gates, and Channels.",
    badge: "Energy",
    badgeVariant: "info",
  },
  {
    title: "Transits",
    href: "/dashboard/charts/transits",
    icon: "\u21BB", // ↻
    description:
      "Live planetary transits against your natal chart. Aspects, ingresses, retrograde tracking with auto-refresh.",
    badge: "Live",
    badgeVariant: "healthy",
  },
  {
    title: "Synastry",
    href: "/dashboard/charts/synastry",
    icon: "\u2661", // ♡
    description:
      "Relationship compatibility analysis. Cross-aspects, element harmony, and composite scoring between two charts.",
    badge: "Compatibility",
    badgeVariant: "degraded",
  },
];

export default function ChartsIndexPage() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Charts</h1>
        <p className="mt-1 text-sm text-text-muted">
          Choose a chart system to explore your cosmic blueprint
        </p>
      </div>

      {/* Card Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHART_TYPES.map((chart) => (
          <Link key={chart.href} href={chart.href} className="group">
            <Card className="h-full transition-all duration-200 group-hover:border-accent-blue/40 group-hover:shadow-lg group-hover:shadow-accent-blue/5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-blue/10 text-2xl text-accent-blue">
                  {chart.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-text-primary">
                      {chart.title}
                    </h2>
                    <Badge variant={chart.badgeVariant}>{chart.badge}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                    {chart.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-text-muted group-hover:text-accent-blue transition-colors">
                <span>Open chart</span>
                <span className="transition-transform group-hover:translate-x-1">
                  {"\u2192"}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
