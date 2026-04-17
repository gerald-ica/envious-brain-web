"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const personalitySystems = [
  {
    title: "MBTI",
    subtitle: "Myers-Briggs Type Indicator",
    href: "/dashboard/personality/mbti",
    badge: "INTJ",
    badgeVariant: "info" as const,
    description:
      "Cognitive function stack analysis, shadow functions, and type dynamics based on Jungian typology.",
    icon: "\u2666",
  },
  {
    title: "Enneagram",
    subtitle: "9-Type Personality System",
    href: "/dashboard/personality/enneagram",
    badge: "5w4",
    badgeVariant: "info" as const,
    description:
      "Core motivations, wing influences, integration/disintegration paths, and instinctual subtypes.",
    icon: "\u25B3",
  },
  {
    title: "Archetypes",
    subtitle: "Jungian Archetypal Analysis",
    href: "/dashboard/personality/archetypes",
    badge: "Alchemist",
    badgeVariant: "neutral" as const,
    description:
      "Primary, shadow, and persona archetypes with individuation stage tracking and the 12-archetype wheel.",
    icon: "\u2609",
  },
  {
    title: "Biorhythm",
    subtitle: "Cyclical Energy Patterns",
    href: "/dashboard/personality/biorhythm",
    badge: "Active",
    badgeVariant: "healthy" as const,
    description:
      "Physical, emotional, intellectual, and intuitive biorhythm cycles with critical day warnings.",
    icon: "\u223F",
  },
  {
    title: "Synthesis",
    subtitle: "Full Personality Integration",
    href: "/dashboard/personality/synthesis",
    badge: "All-in-One",
    badgeVariant: "info" as const,
    description:
      "Combined personality profile merging MBTI, Enneagram, archetypes, and astrological factors into a unified analysis.",
    icon: "\u2726",
  },
];

export default function PersonalityIndexPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          Personality Systems
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Multi-paradigm personality analysis across Jungian, enneagram,
          archetypal, and biorhythmic frameworks.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {personalitySystems.map((system) => (
          <Link key={system.title} href={system.href} className="group">
            <Card
              className="h-full transition-all duration-200 group-hover:border-accent-blue/50 group-hover:shadow-lg group-hover:shadow-accent-blue/5"
              glow="none"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/10 text-xl text-accent-blue">
                    {system.icon}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      {system.title}
                    </h2>
                    <p className="text-xs text-text-muted">{system.subtitle}</p>
                  </div>
                </div>
                <Badge variant={system.badgeVariant}>{system.badge}</Badge>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">
                {system.description}
              </p>
              <div className="mt-4 flex items-center text-xs text-accent-blue opacity-0 transition-opacity group-hover:opacity-100">
                View analysis
                <span className="ml-1">&rarr;</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
