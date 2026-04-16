"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---- Types ------------------------------------------------------------------

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  tag: string;
  requestExample?: string;
  responseExample: string;
}

// ---- Mock Data --------------------------------------------------------------

const ENDPOINTS: Endpoint[] = [
  // Charts
  {
    method: "POST",
    path: "/api/v1/charts/natal",
    description: "Generate a natal birth chart from date, time, and location.",
    tag: "Charts",
    requestExample: JSON.stringify(
      {
        birth_date: "1990-06-15",
        birth_time: "14:30:00",
        latitude: 40.7128,
        longitude: -74.006,
        house_system: "placidus",
      },
      null,
      2
    ),
    responseExample: JSON.stringify(
      {
        chart_id: "ch_9x8f7e6d",
        sun: { sign: "Gemini", degree: 24.5, house: 10 },
        moon: { sign: "Scorpio", degree: 12.3, house: 3 },
        ascendant: { sign: "Virgo", degree: 8.7 },
        aspects: [{ planet1: "Sun", planet2: "Moon", type: "trine", orb: 2.1 }],
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/v1/charts/synastry",
    description: "Compute synastry chart comparing two natal charts for relationship analysis.",
    tag: "Charts",
    requestExample: JSON.stringify(
      {
        chart_id_a: "ch_9x8f7e6d",
        chart_id_b: "ch_4a3b2c1d",
        aspects: ["conjunction", "trine", "square", "opposition"],
      },
      null,
      2
    ),
    responseExample: JSON.stringify(
      {
        synastry_id: "syn_m2n3o4p5",
        compatibility_score: 78,
        aspects: [
          { planet_a: "Venus", planet_b: "Mars", type: "trine", orb: 1.4 },
          { planet_a: "Moon", planet_b: "Sun", type: "conjunction", orb: 3.2 },
        ],
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/v1/charts/composite",
    description: "Generate composite midpoint chart from two natal charts.",
    tag: "Charts",
    requestExample: JSON.stringify(
      { chart_id_a: "ch_9x8f7e6d", chart_id_b: "ch_4a3b2c1d" },
      null,
      2
    ),
    responseExample: JSON.stringify(
      {
        composite_id: "comp_q5r6s7t8",
        sun: { sign: "Leo", degree: 18.6, house: 7 },
        moon: { sign: "Aquarius", degree: 5.4, house: 1 },
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/api/v1/charts/{chart_id}",
    description: "Retrieve a previously computed chart by its ID.",
    tag: "Charts",
    responseExample: JSON.stringify(
      {
        chart_id: "ch_9x8f7e6d",
        type: "natal",
        created_at: "2026-04-16T10:30:00Z",
        sun: { sign: "Gemini", degree: 24.5 },
      },
      null,
      2
    ),
  },

  // Personality
  {
    method: "POST",
    path: "/api/v1/personality/mbti",
    description: "Analyze MBTI personality type from natal chart positions.",
    tag: "Personality",
    requestExample: JSON.stringify({ chart_id: "ch_9x8f7e6d" }, null, 2),
    responseExample: JSON.stringify(
      {
        type: "INTJ",
        confidence: 0.87,
        functions: { dominant: "Ni", auxiliary: "Te", tertiary: "Fi", inferior: "Se" },
        description: "Strategic and analytical with strong intuitive drive.",
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/v1/personality/enneagram",
    description: "Determine Enneagram type and wing from astrological profile.",
    tag: "Personality",
    requestExample: JSON.stringify({ chart_id: "ch_9x8f7e6d" }, null, 2),
    responseExample: JSON.stringify(
      {
        type: 5,
        wing: 4,
        label: "The Investigator",
        integration: 8,
        disintegration: 7,
        confidence: 0.82,
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/v1/personality/synthesis",
    description: "Generate a full personality synthesis combining all available frameworks.",
    tag: "Personality",
    requestExample: JSON.stringify(
      { chart_id: "ch_9x8f7e6d", frameworks: ["mbti", "enneagram", "archetype"] },
      null,
      2
    ),
    responseExample: JSON.stringify(
      {
        synthesis_id: "syn_a1b2c3d4",
        summary: "A deeply analytical mind with strong investigative tendencies...",
        frameworks: { mbti: "INTJ", enneagram: "5w4", archetype: "The Scholar" },
      },
      null,
      2
    ),
  },

  // Oracle
  {
    method: "POST",
    path: "/api/v1/oracle/query",
    description: "Send a natural language question to the Oracle AI for cosmic insight.",
    tag: "Oracle",
    requestExample: JSON.stringify(
      {
        chart_id: "ch_9x8f7e6d",
        question: "What career path aligns with my chart?",
        context: "natal",
      },
      null,
      2
    ),
    responseExample: JSON.stringify(
      {
        response_id: "or_e5f6g7h8",
        answer:
          "With your Gemini Sun in the 10th house and Mercury conjunct, careers in communication, writing, or technology are strongly favored...",
        confidence: 0.91,
        cited_placements: ["Sun in Gemini 10H", "Mercury conjunct Sun"],
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/v1/oracle/session",
    description: "Start a multi-turn conversational Oracle session.",
    tag: "Oracle",
    requestExample: JSON.stringify(
      { chart_id: "ch_9x8f7e6d", mode: "deep_dive" },
      null,
      2
    ),
    responseExample: JSON.stringify(
      {
        session_id: "sess_i9j0k1l2",
        status: "active",
        expires_at: "2026-04-16T11:30:00Z",
      },
      null,
      2
    ),
  },

  // Predictive
  {
    method: "GET",
    path: "/api/v1/transits/current",
    description: "Get current planetary transits and aspects in real time.",
    tag: "Predictive",
    responseExample: JSON.stringify(
      {
        timestamp: "2026-04-16T10:30:00Z",
        transits: [
          { planet: "Mercury", sign: "Aries", degree: 12.4 },
          { planet: "Venus", sign: "Pisces", degree: 28.1 },
        ],
        aspects: [
          { transit: "Mercury", natal: "Sun", type: "conjunction", orb: 0.8, exact_at: "2026-04-16T14:00:00Z" },
        ],
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/v1/forecast/daily",
    description: "Generate a daily forecast for a chart considering current transits.",
    tag: "Predictive",
    requestExample: JSON.stringify(
      { chart_id: "ch_9x8f7e6d", date: "2026-04-16" },
      null,
      2
    ),
    responseExample: JSON.stringify(
      {
        date: "2026-04-16",
        overall_energy: 7.5,
        themes: ["communication", "strategy", "caution"],
        summary: "A day for strategic thinking. Mercury's conjunction sharpens communication...",
        alerts: [{ type: "caution", description: "Mars-Saturn square in afternoon hours" }],
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/v1/forecast/weekly",
    description: "Generate a weekly forecast summary with day-by-day highlights.",
    tag: "Predictive",
    requestExample: JSON.stringify(
      { chart_id: "ch_9x8f7e6d", week_start: "2026-04-13" },
      null,
      2
    ),
    responseExample: JSON.stringify(
      {
        week_start: "2026-04-13",
        week_end: "2026-04-19",
        highlights: [
          { day: "2026-04-16", event: "Mercury conjunct natal Sun" },
          { day: "2026-04-18", event: "Venus trine natal Moon" },
        ],
        overall_theme: "Intellectual expansion and emotional clarity",
      },
      null,
      2
    ),
  },

  // Export
  {
    method: "POST",
    path: "/api/v1/export/pdf",
    description: "Export a chart or reading as a formatted PDF document.",
    tag: "Export",
    requestExample: JSON.stringify(
      {
        chart_id: "ch_9x8f7e6d",
        include: ["natal_chart", "aspects", "interpretation"],
        theme: "dark",
      },
      null,
      2
    ),
    responseExample: JSON.stringify(
      {
        export_id: "exp_m3n4o5p6",
        status: "processing",
        download_url: null,
        estimated_seconds: 8,
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/api/v1/export/{export_id}",
    description: "Check export status and retrieve download URL.",
    tag: "Export",
    responseExample: JSON.stringify(
      {
        export_id: "exp_m3n4o5p6",
        status: "complete",
        download_url: "https://cdn.envious-brain.com/exports/exp_m3n4o5p6.pdf",
        expires_at: "2026-04-17T10:30:00Z",
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/v1/export/batch",
    description: "Queue a batch export of multiple charts or readings.",
    tag: "Export",
    requestExample: JSON.stringify(
      {
        chart_ids: ["ch_9x8f7e6d", "ch_4a3b2c1d", "ch_x7y8z9a0"],
        format: "pdf",
        include: ["natal_chart", "interpretation"],
      },
      null,
      2
    ),
    responseExample: JSON.stringify(
      {
        batch_id: "bat_q6r7s8t9",
        total: 3,
        status: "queued",
        webhook_url: "https://your-app.com/webhooks/batch",
      },
      null,
      2
    ),
  },

  // Admin
  {
    method: "GET",
    path: "/api/v1/admin/usage",
    description: "Retrieve aggregated usage statistics for your account.",
    tag: "Admin",
    responseExample: JSON.stringify(
      {
        period: "2026-04",
        total_requests: 284190,
        total_errors: 1847,
        top_endpoints: ["/api/v1/charts/natal", "/api/v1/oracle/query"],
        rate_limit_hits: 421,
      },
      null,
      2
    ),
  },
  {
    method: "PUT",
    path: "/api/v1/admin/webhooks/{webhook_id}",
    description: "Update a webhook registration (URL, events, or status).",
    tag: "Admin",
    requestExample: JSON.stringify(
      {
        url: "https://your-app.com/webhooks/updated",
        events: ["chart.computed", "reading.complete"],
        active: true,
      },
      null,
      2
    ),
    responseExample: JSON.stringify(
      {
        webhook_id: "wh_u0v1w2x3",
        url: "https://your-app.com/webhooks/updated",
        events: ["chart.computed", "reading.complete"],
        active: true,
        updated_at: "2026-04-16T10:45:00Z",
      },
      null,
      2
    ),
  },
  {
    method: "DELETE",
    path: "/api/v1/admin/keys/{key_id}",
    description: "Permanently delete an API key. This action cannot be undone.",
    tag: "Admin",
    responseExample: JSON.stringify(
      { deleted: true, key_id: "key_y4z5a6b7" },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/api/v1/admin/audit-log",
    description: "Retrieve the audit log of account actions and API events.",
    tag: "Admin",
    responseExample: JSON.stringify(
      {
        entries: [
          {
            timestamp: "2026-04-16T10:30:00Z",
            action: "key.created",
            actor: "user_abc123",
            details: { key_name: "Production App" },
          },
        ],
        total: 1247,
        page: 1,
        per_page: 50,
      },
      null,
      2
    ),
  },
];

const METHOD_STYLES: Record<string, { bg: string; text: string }> = {
  GET: { bg: "bg-accent-emerald/15 border-accent-emerald/30", text: "text-accent-emerald" },
  POST: { bg: "bg-accent-blue/15 border-accent-blue/30", text: "text-accent-blue" },
  PUT: { bg: "bg-accent-amber/15 border-accent-amber/30", text: "text-accent-amber" },
  DELETE: { bg: "bg-accent-rose/15 border-accent-rose/30", text: "text-accent-rose" },
};

const TAGS = [...new Set(ENDPOINTS.map((e) => e.tag))];

// ---- Component --------------------------------------------------------------

export default function ApiDocsPage() {
  const [search, setSearch] = useState("");
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  const filtered = ENDPOINTS.filter(
    (ep) =>
      ep.path.toLowerCase().includes(search.toLowerCase()) ||
      ep.description.toLowerCase().includes(search.toLowerCase()) ||
      ep.tag.toLowerCase().includes(search.toLowerCase())
  );

  const groupedByTag = TAGS.map((tag) => ({
    tag,
    endpoints: filtered.filter((ep) => ep.tag === tag),
  })).filter((g) => g.endpoints.length > 0);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">API Documentation</h1>
        <p className="text-sm text-text-muted">
          Explore all available ENVI-OUS BRAIN API endpoints
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search endpoints by path, description, or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xl"
        />
      </div>

      {/* Tag quick-nav */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TAGS.map((tag) => {
          const count = filtered.filter((e) => e.tag === tag).length;
          return (
            <button
              key={tag}
              onClick={() => {
                const el = document.getElementById(`tag-${tag}`);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
            >
              {tag}{" "}
              <span className="ml-1 text-text-muted">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Endpoint Groups */}
      <div className="space-y-6">
        {groupedByTag.map(({ tag, endpoints }) => (
          <div key={tag} id={`tag-${tag}`}>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">{tag}</h2>
            <div className="space-y-2">
              {endpoints.map((ep) => {
                const isExpanded = expandedPath === ep.path;
                const style = METHOD_STYLES[ep.method];

                return (
                  <div
                    key={`${ep.method}-${ep.path}`}
                    className="rounded-xl border border-border bg-card transition-colors hover:border-border-hover"
                  >
                    {/* Summary Row */}
                    <button
                      onClick={() =>
                        setExpandedPath(isExpanded ? null : ep.path)
                      }
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span
                        className={`inline-flex w-16 shrink-0 items-center justify-center rounded border px-2 py-0.5 text-xs font-bold ${style.bg} ${style.text}`}
                      >
                        {ep.method}
                      </span>
                      <code className="shrink-0 font-mono text-sm text-text-primary">
                        {ep.path}
                      </code>
                      <span className="ml-2 text-sm text-text-muted truncate">
                        {ep.description}
                      </span>
                      <span className="ml-auto shrink-0 text-text-muted">
                        {isExpanded ? "\u25B2" : "\u25BC"}
                      </span>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-border px-4 py-4">
                        <p className="mb-4 text-sm text-text-secondary">
                          {ep.description}
                        </p>

                        {ep.requestExample && (
                          <div className="mb-4">
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                              Request Body
                            </h4>
                            <pre className="overflow-x-auto rounded-lg bg-navy p-3 text-xs text-accent-emerald font-mono">
                              {ep.requestExample}
                            </pre>
                          </div>
                        )}

                        <div className="mb-4">
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                            Response
                          </h4>
                          <pre className="overflow-x-auto rounded-lg bg-navy p-3 text-xs text-accent-blue font-mono">
                            {ep.responseExample}
                          </pre>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/dashboard/developer/sandbox?method=${ep.method}&path=${encodeURIComponent(ep.path)}`;
                            }}
                          >
                            Try it in Sandbox
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {groupedByTag.length === 0 && (
        <Card>
          <div className="py-8 text-center">
            <p className="text-text-muted">No endpoints match your search.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
