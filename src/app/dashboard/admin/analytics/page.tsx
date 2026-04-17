"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Analytics Dashboard
// ---------------------------------------------------------------------------

type TimeRange = "24h" | "7d" | "30d";

interface MetricCard {
  label: string;
  value: Record<TimeRange, string>;
  change: Record<TimeRange, string>;
  trend: "up" | "down";
}

const METRICS: MetricCard[] = [
  {
    label: "Total Requests",
    value: { "24h": "1.28M", "7d": "8.92M", "30d": "37.4M" },
    change: { "24h": "+12.4%", "7d": "+8.1%", "30d": "+22.6%" },
    trend: "up",
  },
  {
    label: "Active Users",
    value: { "24h": "3,847", "7d": "12,490", "30d": "28,312" },
    change: { "24h": "+5.2%", "7d": "+11.3%", "30d": "+18.7%" },
    trend: "up",
  },
  {
    label: "Error Rate",
    value: { "24h": "0.42%", "7d": "0.38%", "30d": "0.45%" },
    change: { "24h": "-0.08%", "7d": "-0.12%", "30d": "+0.02%" },
    trend: "down",
  },
  {
    label: "Avg Response Time",
    value: { "24h": "142ms", "7d": "138ms", "30d": "145ms" },
    change: { "24h": "-6ms", "7d": "-11ms", "30d": "+3ms" },
    trend: "down",
  },
];

const TOP_ENDPOINTS = [
  { endpoint: "/api/v1/chart/western", calls: 342_800, avgMs: 89, errorRate: 0.12 },
  { endpoint: "/api/v1/chart/vedic", calls: 218_400, avgMs: 112, errorRate: 0.18 },
  { endpoint: "/api/v1/oracle/chat", calls: 189_200, avgMs: 1_240, errorRate: 0.52 },
  { endpoint: "/api/v1/personality/mbti", calls: 156_700, avgMs: 67, errorRate: 0.08 },
  { endpoint: "/api/v1/chart/bazi", calls: 124_300, avgMs: 95, errorRate: 0.15 },
  { endpoint: "/api/v1/numerology/core", calls: 98_600, avgMs: 45, errorRate: 0.05 },
  { endpoint: "/api/v1/transit/live", calls: 87_200, avgMs: 234, errorRate: 0.31 },
  { endpoint: "/api/v1/synastry/compare", calls: 64_100, avgMs: 178, errorRate: 0.22 },
];

const RESPONSE_TIME_DISTRIBUTION = [
  { bucket: "< 50ms", percentage: 28, count: "358K" },
  { bucket: "50-100ms", percentage: 35, count: "448K" },
  { bucket: "100-250ms", percentage: 22, count: "282K" },
  { bucket: "250-500ms", percentage: 9, count: "115K" },
  { bucket: "500ms-1s", percentage: 4, count: "51K" },
  { bucket: "> 1s", percentage: 2, count: "26K" },
];

const GEO_DISTRIBUTION = [
  { country: "United States", flag: "US", requests: "482K", percentage: 37.6 },
  { country: "Brazil", flag: "BR", requests: "198K", percentage: 15.5 },
  { country: "United Kingdom", flag: "GB", requests: "124K", percentage: 9.7 },
  { country: "Germany", flag: "DE", requests: "98K", percentage: 7.7 },
  { country: "India", flag: "IN", requests: "87K", percentage: 6.8 },
  { country: "Japan", flag: "JP", requests: "72K", percentage: 5.6 },
  { country: "France", flag: "FR", requests: "58K", percentage: 4.5 },
  { country: "Australia", flag: "AU", requests: "45K", percentage: 3.5 },
];

// Simulated hourly request data for the chart area
const HOURLY_DATA: Record<TimeRange, number[]> = {
  "24h": [
    12400, 8200, 5100, 3800, 3200, 4500, 8900, 18200, 32400, 48600, 56200,
    62100, 58400, 54200, 52800, 56700, 62300, 58100, 48900, 42100, 35600,
    28400, 22100, 16800,
  ],
  "7d": [
    820000, 910000, 1020000, 980000, 1120000, 1280000, 1180000,
  ],
  "30d": [
    920000, 880000, 950000, 1010000, 980000, 1040000, 1120000, 1080000,
    1150000, 1200000, 1180000, 1220000, 1250000, 1190000, 1280000, 1310000,
    1260000, 1340000, 1380000, 1320000, 1400000, 1420000, 1360000, 1450000,
    1480000, 1440000, 1510000, 1520000, 1490000, 1280000,
  ],
};

// ---------------------------------------------------------------------------
// Mini bar chart component
// ---------------------------------------------------------------------------

function MiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-px h-32 w-full">
      {data.map((val, i) => {
        const height = max > 0 ? (val / max) * 100 : 0;
        return (
          <div
            key={i}
            className="flex-1 rounded-t bg-accent-blue/60 hover:bg-accent-blue transition-colors min-w-[2px]"
            style={{ height: `${height}%` }}
            title={`${val.toLocaleString()} requests`}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const [range, setRange] = useState<TimeRange>("24h");

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
            <Badge variant="info">Coming Soon</Badge>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Platform usage, performance, and distribution metrics
          </p>
        </div>
        {/* Time range selector */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          {(["24h", "7d", "30d"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                range === r
                  ? "bg-accent-blue text-white"
                  : "text-text-muted hover:text-text-primary hover:bg-white/5"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {METRICS.map((metric) => (
          <Card key={metric.label}>
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              {metric.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {metric.value[range]}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  metric.label === "Error Rate" || metric.label === "Avg Response Time"
                    ? metric.trend === "down"
                      ? "text-accent-emerald"
                      : "text-accent-rose"
                    : metric.trend === "up"
                      ? "text-accent-emerald"
                      : "text-accent-rose"
                }`}
              >
                {metric.trend === "up" ? "\u2191" : "\u2193"} {metric.change[range]}
              </span>
              <span className="text-xs text-text-muted">vs prev</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Request Volume Chart */}
      <Card title="Request Volume" className="mb-6">
        <MiniChart data={HOURLY_DATA[range]} />
        <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
          <span>
            {range === "24h" ? "00:00" : range === "7d" ? "Mon" : "Day 1"}
          </span>
          <span>
            {range === "24h" ? "Now" : range === "7d" ? "Sun" : "Day 30"}
          </span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        {/* Top Endpoints */}
        <Card title="Top Endpoints" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Endpoint
                </th>
                <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">
                  Calls
                </th>
                <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">
                  Avg
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">
                  Errors
                </th>
              </tr>
            </thead>
            <tbody>
              {TOP_ENDPOINTS.map((ep) => (
                <tr
                  key={ep.endpoint}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-2 pr-4 font-mono text-xs text-text-secondary">
                    {ep.endpoint}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-xs text-text-primary">
                    {ep.calls.toLocaleString()}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-xs text-text-muted">
                    {ep.avgMs}ms
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={`font-mono text-xs ${
                        ep.errorRate > 0.3 ? "text-accent-rose" : "text-text-muted"
                      }`}
                    >
                      {ep.errorRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Response Time Distribution */}
        <Card title="Response Time Distribution">
          <div className="space-y-3">
            {RESPONSE_TIME_DISTRIBUTION.map((bucket) => (
              <div key={bucket.bucket}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-secondary">{bucket.bucket}</span>
                  <span className="text-xs font-mono text-text-muted">
                    {bucket.count} ({bucket.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-blue/70 transition-all"
                    style={{ width: `${bucket.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card title="Geographic Distribution">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GEO_DISTRIBUTION.map((geo) => (
            <div
              key={geo.country}
              className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-4 py-3"
            >
              <span className="text-lg font-mono text-text-muted">{geo.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {geo.country}
                </p>
                <p className="text-xs text-text-muted">
                  {geo.requests} requests
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-text-primary">{geo.percentage}%</p>
                <div className="mt-1 h-1 w-12 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-blue/60"
                    style={{ width: `${(geo.percentage / 40) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
