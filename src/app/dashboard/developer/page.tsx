"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---- Mock Data --------------------------------------------------------------

const OVERVIEW_STATS = [
  {
    label: "Total API Keys",
    value: "5",
    subtext: "4 active, 1 revoked",
    color: "text-accent-blue",
  },
  {
    label: "Requests Today",
    value: "12.8K",
    subtext: "+18% from yesterday",
    color: "text-accent-emerald",
  },
  {
    label: "Active Webhooks",
    value: "3",
    subtext: "1 failing",
    color: "text-accent-amber",
  },
  {
    label: "Current Plan",
    value: "Premium",
    subtext: "284K / 1M requests used",
    color: "text-accent-purple",
  },
];

const QUICK_LINKS = [
  {
    title: "API Keys",
    description: "Create and manage your API keys for authentication",
    href: "/dashboard/developer/keys",
    icon: "\u26BF",
  },
  {
    title: "Usage Dashboard",
    description: "Monitor request volumes, error rates, and latency",
    href: "/dashboard/developer/usage",
    icon: "\u2261",
  },
  {
    title: "API Documentation",
    description: "Browse all endpoints with examples and schemas",
    href: "/dashboard/developer/docs",
    icon: "\u2637",
  },
  {
    title: "Sandbox",
    description: "Test API calls interactively with live responses",
    href: "/dashboard/developer/sandbox",
    icon: "\u25B6",
  },
  {
    title: "Webhooks",
    description: "Configure event-driven notifications",
    href: "/dashboard/developer/webhooks",
    icon: "\u21C4",
  },
];

const GETTING_STARTED_STEPS = [
  {
    step: 1,
    title: "Create an API Key",
    description:
      "Generate a test key to start making API calls. Use eb_test_* keys for development and eb_live_* for production.",
    code: null,
  },
  {
    step: 2,
    title: "Make Your First Request",
    description: "Use your key in the Authorization header to authenticate requests.",
    code: `curl -X POST https://api.envious-brain.com/api/v1/charts/natal \\
  -H "Authorization: Bearer eb_test_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "birth_date": "1990-06-15",
    "birth_time": "14:30:00",
    "latitude": 40.7128,
    "longitude": -74.006
  }'`,
  },
  {
    step: 3,
    title: "Set Up Webhooks",
    description:
      "Register webhook endpoints to receive real-time notifications when charts are computed, readings complete, or transits become exact.",
    code: null,
  },
  {
    step: 4,
    title: "Go to Production",
    description:
      "Switch to a live key, configure rate limits for your tier, and monitor usage through the dashboard.",
    code: null,
  },
];

// ---- Component --------------------------------------------------------------

export default function DeveloperIndexPage() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Developer Portal</h1>
        <p className="text-sm text-text-muted">
          Build with the ENVI-OUS BRAIN API -- charts, personality, oracle, and more
        </p>
      </div>

      {/* Overview Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {OVERVIEW_STATS.map((stat) => (
          <Card key={stat.label} glow="blue">
            <div className="text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm font-medium text-text-primary mt-1">
                {stat.label}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{stat.subtext}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Quick Links
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="h-full cursor-pointer transition-all hover:border-accent-blue/50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{link.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {link.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-1">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <Card title="Getting Started" glow="purple">
        <div className="space-y-6">
          {GETTING_STARTED_STEPS.map((step) => (
            <div key={step.step} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue/15 text-sm font-bold text-accent-blue">
                {step.step}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">
                  {step.description}
                </p>
                {step.code && (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-navy p-3 font-mono text-xs text-accent-emerald">
                    {step.code}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/dashboard/developer/keys">
            <Button>Create Your First Key</Button>
          </Link>
          <Link href="/dashboard/developer/docs">
            <Button variant="secondary">Read the Docs</Button>
          </Link>
        </div>
      </Card>

      {/* API Status */}
      <div className="mt-6">
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-accent-emerald pulse-dot" />
              <span className="text-sm text-text-secondary">
                API Status: All systems operational
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="healthy">99.98% uptime</Badge>
              <Badge variant="info">v1.4.2</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
