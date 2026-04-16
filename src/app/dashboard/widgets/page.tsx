"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---- Mock Data --------------------------------------------------------------

const WIDGET_SECTIONS = [
  {
    title: "Widget Gallery",
    description:
      "Browse all available embeddable widgets -- chart wheels, reading cards, transit alerts, daily horoscopes, and more. Preview each widget and grab its embed code.",
    href: "/dashboard/widgets/gallery",
    icon: "\u25A6",
    stats: [
      { label: "Available Widgets", value: "8" },
      { label: "Categories", value: "3" },
    ],
    badges: ["Astrology", "Personality", "Forecast"],
  },
  {
    title: "Widget Builder",
    description:
      "Customize widgets with your preferred theme, size, colors, and data source. Generate embed code for iframe, JavaScript, React, or Vue integration.",
    href: "/dashboard/widgets/builder",
    icon: "\u2692",
    stats: [
      { label: "Embed Formats", value: "4" },
      { label: "Theme Options", value: "3" },
    ],
    badges: ["iframe", "JavaScript", "React", "Vue"],
  },
];

const RECENT_WIDGETS = [
  {
    name: "Chart Wheel",
    type: "chart-wheel",
    chartId: "ch_9x8f7e6d",
    lastEdited: "2 hours ago",
    status: "active",
  },
  {
    name: "Daily Horoscope",
    type: "daily-horoscope",
    chartId: "ch_4a3b2c1d",
    lastEdited: "1 day ago",
    status: "active",
  },
  {
    name: "Transit Alert",
    type: "transit-alert",
    chartId: "ch_x7y8z9a0",
    lastEdited: "3 days ago",
    status: "draft",
  },
];

// ---- Component --------------------------------------------------------------

export default function WidgetsIndexPage() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Widgets</h1>
        <p className="text-sm text-text-muted">
          Embed ENVI-OUS BRAIN components into any website or application
        </p>
      </div>

      {/* Main Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {WIDGET_SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card
              className="h-full cursor-pointer transition-all hover:border-accent-blue/50"
              glow="blue"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{section.icon}</span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-text-primary mb-1">
                    {section.title}
                  </h2>
                  <p className="text-sm text-text-muted leading-relaxed mb-3">
                    {section.description}
                  </p>

                  <div className="flex gap-4 mb-3">
                    {section.stats.map((stat) => (
                      <div key={stat.label}>
                        <p className="text-xl font-bold text-text-primary">
                          {stat.value}
                        </p>
                        <p className="text-xs text-text-muted">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {section.badges.map((badge) => (
                      <Badge key={badge} variant="info">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Widgets */}
      <Card title="Recently Configured Widgets">
        <div className="space-y-2">
          {RECENT_WIDGETS.map((widget) => (
            <div
              key={widget.type}
              className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-blue/10">
                  <span className="text-accent-blue text-sm">
                    {widget.type === "chart-wheel"
                      ? "\u2609"
                      : widget.type === "daily-horoscope"
                        ? "\u2606"
                        : "\u21C4"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {widget.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    Chart: {widget.chartId} -- Edited {widget.lastEdited}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={widget.status === "active" ? "healthy" : "neutral"}
                >
                  {widget.status}
                </Badge>
                <Link href={`/dashboard/widgets/builder?widget=${widget.type}`}>
                  <Button variant="ghost" className="text-xs">
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Start */}
      <div className="mt-6">
        <Card glow="purple">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Quick Start with Widgets
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Pick a widget from the gallery, customize it in the builder, and
                paste the embed code into your site. It is that simple.
              </p>
            </div>
            <Link href="/dashboard/widgets/gallery">
              <Button>Browse Gallery</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
