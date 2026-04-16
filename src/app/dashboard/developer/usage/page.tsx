"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---- Mock Data --------------------------------------------------------------

const REQUEST_COUNTS = {
  today: 12_847,
  thisWeek: 68_421,
  thisMonth: 284_190,
};

const RATE_LIMITS = {
  tier: "Premium",
  requestsPerMinute: { used: 42, limit: 200 },
  requestsPerDay: { used: 12_847, limit: 100_000 },
  concurrentConnections: { used: 8, limit: 50 },
};

const ENDPOINT_POPULARITY = [
  { endpoint: "/api/v1/charts/natal", calls: 42_310, avgLatency: 145 },
  { endpoint: "/api/v1/oracle/query", calls: 38_920, avgLatency: 890 },
  { endpoint: "/api/v1/transits/current", calls: 31_450, avgLatency: 67 },
  { endpoint: "/api/v1/personality/mbti", calls: 28_170, avgLatency: 210 },
  { endpoint: "/api/v1/charts/synastry", calls: 24_830, avgLatency: 320 },
  { endpoint: "/api/v1/forecast/daily", calls: 21_640, avgLatency: 180 },
  { endpoint: "/api/v1/personality/enneagram", calls: 18_290, avgLatency: 195 },
  { endpoint: "/api/v1/charts/composite", calls: 15_670, avgLatency: 280 },
  { endpoint: "/api/v1/export/pdf", calls: 12_410, avgLatency: 1250 },
  { endpoint: "/api/v1/oracle/session", calls: 9_870, avgLatency: 520 },
];

const ERROR_RATES = {
  total: 284_190,
  errors: 1_847,
  rate: 0.65,
  breakdown: [
    { code: 400, label: "Bad Request", count: 892 },
    { code: 401, label: "Unauthorized", count: 312 },
    { code: 429, label: "Rate Limited", count: 421 },
    { code: 500, label: "Internal Error", count: 198 },
    { code: 503, label: "Service Unavailable", count: 24 },
  ],
};

const LATENCY = {
  p50: 142,
  p95: 485,
  p99: 1240,
};

const PLAN_LIMITS = {
  tier: "Premium",
  monthlyRequests: { used: 284_190, limit: 1_000_000 },
  webhooks: { used: 4, limit: 25 },
  apiKeys: { used: 5, limit: 20 },
  rateLimitPerMin: 200,
  dataRetentionDays: 90,
  supportLevel: "Priority",
};

// ---- Helpers ----------------------------------------------------------------

function ProgressBar({
  used,
  limit,
  color = "bg-accent-blue",
}: {
  used: number;
  limit: number;
  color?: string;
}) {
  const pct = Math.min((used / limit) * 100, 100);
  const isHigh = pct > 80;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
        <span className={isHigh ? "text-accent-rose" : "text-text-muted"}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full transition-all ${isHigh ? "bg-accent-rose" : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function LatencyBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = (value / max) * 100;

  return (
    <div className="flex items-center gap-4">
      <span className="w-10 text-sm font-mono text-text-muted">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-20 text-right text-sm font-mono text-text-secondary">
        {value} ms
      </span>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ---- Component --------------------------------------------------------------

export default function UsageDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Usage Dashboard</h1>
        <p className="text-sm text-text-muted">
          Monitor your API consumption and performance metrics
        </p>
      </div>

      {/* Request Counts */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card glow="blue">
          <div className="text-center">
            <p className="text-3xl font-bold text-text-primary">
              {formatNum(REQUEST_COUNTS.today)}
            </p>
            <p className="text-xs text-text-muted mt-1">Requests Today</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-text-primary">
              {formatNum(REQUEST_COUNTS.thisWeek)}
            </p>
            <p className="text-xs text-text-muted mt-1">This Week</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-text-primary">
              {formatNum(REQUEST_COUNTS.thisMonth)}
            </p>
            <p className="text-xs text-text-muted mt-1">This Month</p>
          </div>
        </Card>
      </div>

      {/* Rate Limits + Error Rate */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Rate Limit Status">
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm text-text-secondary">Requests / Minute</p>
              <ProgressBar
                used={RATE_LIMITS.requestsPerMinute.used}
                limit={RATE_LIMITS.requestsPerMinute.limit}
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-text-secondary">Requests / Day</p>
              <ProgressBar
                used={RATE_LIMITS.requestsPerDay.used}
                limit={RATE_LIMITS.requestsPerDay.limit}
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-text-secondary">Concurrent Connections</p>
              <ProgressBar
                used={RATE_LIMITS.concurrentConnections.used}
                limit={RATE_LIMITS.concurrentConnections.limit}
                color="bg-accent-purple"
              />
            </div>
          </div>
        </Card>

        <Card title="Error Rate">
          <div className="mb-4 flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold text-text-primary">
                {ERROR_RATES.rate}%
              </p>
              <p className="text-xs text-text-muted">
                {ERROR_RATES.errors.toLocaleString()} errors of{" "}
                {ERROR_RATES.total.toLocaleString()} requests
              </p>
            </div>
            <Badge variant={ERROR_RATES.rate < 1 ? "healthy" : "error"}>
              {ERROR_RATES.rate < 1 ? "Healthy" : "Elevated"}
            </Badge>
          </div>
          <div className="space-y-2">
            {ERROR_RATES.breakdown.map((e) => (
              <div
                key={e.code}
                className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      e.code >= 500 ? "error" : e.code === 429 ? "degraded" : "neutral"
                    }
                  >
                    {e.code}
                  </Badge>
                  <span className="text-sm text-text-secondary">{e.label}</span>
                </div>
                <span className="font-mono text-sm text-text-muted">
                  {e.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Latency Percentiles */}
      <div className="mb-6">
        <Card title="Latency Percentiles">
          <div className="space-y-4">
            <LatencyBar label="P50" value={LATENCY.p50} max={1500} color="bg-accent-emerald" />
            <LatencyBar label="P95" value={LATENCY.p95} max={1500} color="bg-accent-amber" />
            <LatencyBar label="P99" value={LATENCY.p99} max={1500} color="bg-accent-rose" />
          </div>
          <div className="mt-4 flex gap-4 text-xs text-text-muted">
            <span>Target P95: &lt;500ms</span>
            <span>Target P99: &lt;2000ms</span>
            <Badge variant="healthy">Within Targets</Badge>
          </div>
        </Card>
      </div>

      {/* Endpoint Popularity */}
      <div className="mb-6">
        <Card title="Top 10 Endpoints">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    #
                  </th>
                  <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Endpoint
                  </th>
                  <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Calls (Month)
                  </th>
                  <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Avg Latency
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {ENDPOINT_POPULARITY.map((ep, i) => {
                  const totalCalls = ENDPOINT_POPULARITY.reduce(
                    (sum, e) => sum + e.calls,
                    0
                  );
                  const share = ((ep.calls / totalCalls) * 100).toFixed(1);

                  return (
                    <tr
                      key={ep.endpoint}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-3 pr-4 text-text-muted">{i + 1}</td>
                      <td className="py-3 pr-4">
                        <code className="rounded bg-white/5 px-2 py-0.5 font-mono text-xs text-accent-blue">
                          {ep.endpoint}
                        </code>
                      </td>
                      <td className="py-3 pr-4 font-mono text-text-secondary">
                        {ep.calls.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`font-mono text-sm ${
                            ep.avgLatency > 500
                              ? "text-accent-rose"
                              : ep.avgLatency > 200
                                ? "text-accent-amber"
                                : "text-accent-emerald"
                          }`}
                        >
                          {ep.avgLatency}ms
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-accent-blue"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-muted">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Current Plan Limits */}
      <Card title="Current Plan Limits" glow="purple">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Plan</span>
              <Badge variant="degraded">{PLAN_LIMITS.tier}</Badge>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Support</span>
              <span className="text-sm text-text-primary">{PLAN_LIMITS.supportLevel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Data Retention</span>
              <span className="text-sm text-text-primary">
                {PLAN_LIMITS.dataRetentionDays} days
              </span>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-text-secondary">Monthly Requests</p>
            <ProgressBar
              used={PLAN_LIMITS.monthlyRequests.used}
              limit={PLAN_LIMITS.monthlyRequests.limit}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">API Keys</span>
              <span className="text-sm font-mono text-text-primary">
                {PLAN_LIMITS.apiKeys.used} / {PLAN_LIMITS.apiKeys.limit}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Webhooks</span>
              <span className="text-sm font-mono text-text-primary">
                {PLAN_LIMITS.webhooks.used} / {PLAN_LIMITS.webhooks.limit}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Rate Limit</span>
              <span className="text-sm font-mono text-text-primary">
                {PLAN_LIMITS.rateLimitPerMin} req/min
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
