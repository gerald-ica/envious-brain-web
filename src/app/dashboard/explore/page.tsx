"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const exploreSystems = [
  {
    title: "I Ching",
    subtitle: "Book of Changes",
    href: "/dashboard/explore/iching",
    badge: "Oracle",
    badgeVariant: "info" as const,
    description:
      "Cast hexagrams using the ancient Chinese divination system. 64 hexagrams with changing lines, judgment, and image interpretations.",
    icon: "\u2637",
  },
  {
    title: "Tarot",
    subtitle: "Major & Minor Arcana",
    href: "/dashboard/explore/tarot",
    badge: "Divination",
    badgeVariant: "neutral" as const,
    description:
      "Three-card spread readings with full interpretive text. Past, Present, and Future positions with upright and reversed meanings.",
    icon: "\u2605",
  },
  {
    title: "Feng Shui",
    subtitle: "Flying Stars & Kua",
    href: "/dashboard/explore/fengshui",
    badge: "Geomancy",
    badgeVariant: "neutral" as const,
    description:
      "Luo Shu grid with flying star analysis, personal Kua number calculation, and favorable direction recommendations.",
    icon: "\u2316",
  },
  {
    title: "Space Weather",
    subtitle: "Solar & Geomagnetic Activity",
    href: "/dashboard/explore/space-weather",
    badge: "Live",
    badgeVariant: "healthy" as const,
    description:
      "Current Kp index, solar wind speed, solar flare alerts, and geomagnetic storm status with personality correlation notes.",
    icon: "\u2600",
  },
];

export default function ExploreIndexPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Explore</h1>
        <p className="mt-1 text-sm text-text-muted">
          Divination, geomancy, and environmental intelligence systems for
          expanded awareness and pattern recognition.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {exploreSystems.map((system) => (
          <Link key={system.title} href={system.href} className="group">
            <Card
              className="h-full transition-all duration-200 group-hover:border-accent-blue/50 group-hover:shadow-lg group-hover:shadow-accent-blue/5"
              glow="none"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple/10 text-xl text-accent-purple">
                    {system.icon}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      {system.title}
                    </h2>
                    <p className="text-xs text-text-muted">
                      {system.subtitle}
                    </p>
                  </div>
                </div>
                <Badge variant={system.badgeVariant}>{system.badge}</Badge>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">
                {system.description}
              </p>
              <div className="mt-4 flex items-center text-xs text-accent-purple opacity-0 transition-opacity group-hover:opacity-100">
                Open tool
                <span className="ml-1">&rarr;</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
