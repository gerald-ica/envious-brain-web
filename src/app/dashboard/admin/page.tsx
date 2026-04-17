"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Admin Overview -- health dashboard + quick links to sub-pages
// ---------------------------------------------------------------------------

const STATS = [
  {
    label: "Active Tenants",
    value: "24",
    change: "+3",
    trend: "up" as const,
    icon: "\u269B",
  },
  {
    label: "Total Requests (24h)",
    value: "1.28M",
    change: "+12.4%",
    trend: "up" as const,
    icon: "\u2593",
  },
  {
    label: "Error Rate",
    value: "0.42%",
    change: "-0.08%",
    trend: "down" as const,
    icon: "\u26A0",
  },
  {
    label: "Uptime",
    value: "99.97%",
    change: "30d avg",
    trend: "up" as const,
    icon: "\u2191",
  },
];

const QUICK_LINKS = [
  {
    title: "White-Label Management",
    href: "/dashboard/admin/whitelabel",
    icon: "\u269B",
    description: "Manage tenants, plans, and branding customization.",
    badge: "24 tenants",
    badgeVariant: "info" as const,
  },
  {
    title: "Analytics Dashboard",
    href: "/dashboard/admin/analytics",
    icon: "\u2593",
    description: "Request volume, active users, error rates, and geo distribution.",
    badge: "Live",
    badgeVariant: "healthy" as const,
  },
  {
    title: "Audit Trail",
    href: "/dashboard/admin/audit",
    icon: "\u2611",
    description: "Searchable audit log with filters and CSV export.",
    badge: "12.4K events",
    badgeVariant: "neutral" as const,
  },
  {
    title: "Configuration",
    href: "/dashboard/admin/config",
    icon: "\u2638",
    description: "Feature flags, plugin registry, system info, and dynamic config.",
    badge: "Production",
    badgeVariant: "degraded" as const,
  },
];

const HEALTH_CHECKS = [
  { name: "API Gateway", status: "healthy" as const, latency: "12ms" },
  { name: "PostgreSQL Primary", status: "healthy" as const, latency: "3ms" },
  { name: "Redis Cache", status: "healthy" as const, latency: "1ms" },
  { name: "Ephemeris Engine", status: "healthy" as const, latency: "8ms" },
  { name: "LLM Provider (OpenAI)", status: "degraded" as const, latency: "342ms" },
  { name: "Background Workers", status: "healthy" as const, latency: "N/A" },
];

export default function AdminIndexPage() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">Admin Overview</h1>
          <Badge variant="info">Coming Soon</Badge>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          System health, key metrics, and quick access to admin tools. Data shown is for preview purposes.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {STATS.map((stat) => (
          <Card key={stat.label} glow={stat.label === "Error Rate" ? "none" : "none"}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-text-primary">{stat.value}</p>
              </div>
              <span className="text-2xl opacity-40">{stat.icon}</span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  stat.trend === "up" && stat.label !== "Error Rate"
                    ? "text-accent-emerald"
                    : stat.trend === "down" && stat.label === "Error Rate"
                      ? "text-accent-emerald"
                      : "text-text-muted"
                }`}
              >
                {stat.trend === "up" ? "\u2191" : "\u2193"} {stat.change}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Admin Sections
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="group">
              <Card className="h-full transition-all duration-200 group-hover:border-accent-blue/40 group-hover:shadow-lg group-hover:shadow-accent-blue/5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-blue/10 text-2xl text-accent-blue">
                    {link.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-text-primary">
                        {link.title}
                      </h3>
                      <Badge variant={link.badgeVariant}>{link.badge}</Badge>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                      {link.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-text-muted group-hover:text-accent-blue transition-colors">
                  <span>Open</span>
                  <span className="transition-transform group-hover:translate-x-1">
                    {"\u2192"}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* System Health Summary */}
      <Card title="System Health">
        <div className="space-y-2">
          {HEALTH_CHECKS.map((check) => (
            <div
              key={check.name}
              className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${
                    check.status === "healthy"
                      ? "bg-accent-emerald"
                      : check.status === "degraded"
                        ? "bg-accent-amber"
                        : "bg-accent-rose"
                  }`}
                />
                <span className="text-sm text-text-primary">{check.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-text-muted">{check.latency}</span>
                <Badge variant={check.status === "healthy" ? "healthy" : "degraded"}>
                  {check.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
