"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---- Types ------------------------------------------------------------------

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  status: "active" | "inactive" | "failing";
  lastDelivery: string | null;
  lastStatus: number | null;
  createdAt: string;
}

interface DeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  status: number;
  timestamp: string;
  duration: number;
  requestBody: string;
  responseBody: string;
}

// ---- Constants --------------------------------------------------------------

const EVENT_TYPES = [
  { id: "chart.computed", label: "Chart Computed", description: "Fired when a chart calculation completes" },
  { id: "reading.complete", label: "Reading Complete", description: "Fired when an AI reading finishes" },
  { id: "transit.exact", label: "Transit Exact", description: "Fired when a transit aspect becomes exact" },
  { id: "forecast.ready", label: "Forecast Ready", description: "Fired when a forecast is generated" },
  { id: "oracle.response", label: "Oracle Response", description: "Fired when the Oracle returns an answer" },
  { id: "batch.complete", label: "Batch Complete", description: "Fired when a batch export finishes" },
];

// ---- Mock Data --------------------------------------------------------------

const INITIAL_WEBHOOKS: Webhook[] = [
  {
    id: "wh_1",
    url: "https://myapp.com/webhooks/charts",
    events: ["chart.computed", "reading.complete"],
    secret: "whsec_a1b2c3d4e5f6g7h8i9j0",
    status: "active",
    lastDelivery: "2026-04-16T10:15:00Z",
    lastStatus: 200,
    createdAt: "2026-03-01",
  },
  {
    id: "wh_2",
    url: "https://myapp.com/webhooks/transits",
    events: ["transit.exact", "forecast.ready"],
    secret: "whsec_k1l2m3n4o5p6q7r8s9t0",
    status: "active",
    lastDelivery: "2026-04-16T09:45:00Z",
    lastStatus: 200,
    createdAt: "2026-03-15",
  },
  {
    id: "wh_3",
    url: "https://old-service.com/hooks",
    events: ["batch.complete"],
    secret: "whsec_u1v2w3x4y5z6a7b8c9d0",
    status: "failing",
    lastDelivery: "2026-04-15T22:10:00Z",
    lastStatus: 503,
    createdAt: "2025-12-20",
  },
  {
    id: "wh_4",
    url: "https://staging.myapp.com/webhooks/oracle",
    events: ["oracle.response"],
    secret: "whsec_e1f2g3h4i5j6k7l8m9n0",
    status: "inactive",
    lastDelivery: null,
    lastStatus: null,
    createdAt: "2026-04-10",
  },
];

const INITIAL_LOGS: DeliveryLog[] = [
  {
    id: "dl_1",
    webhookId: "wh_1",
    event: "chart.computed",
    status: 200,
    timestamp: "2026-04-16T10:15:00Z",
    duration: 234,
    requestBody: JSON.stringify(
      {
        event: "chart.computed",
        data: { chart_id: "ch_9x8f7e6d", type: "natal", computed_at: "2026-04-16T10:14:58Z" },
      },
      null,
      2
    ),
    responseBody: JSON.stringify({ received: true }, null, 2),
  },
  {
    id: "dl_2",
    webhookId: "wh_2",
    event: "transit.exact",
    status: 200,
    timestamp: "2026-04-16T09:45:00Z",
    duration: 187,
    requestBody: JSON.stringify(
      {
        event: "transit.exact",
        data: { transit: "Mercury", natal: "Sun", type: "conjunction", exact_at: "2026-04-16T09:44:12Z" },
      },
      null,
      2
    ),
    responseBody: JSON.stringify({ processed: true }, null, 2),
  },
  {
    id: "dl_3",
    webhookId: "wh_3",
    event: "batch.complete",
    status: 503,
    timestamp: "2026-04-15T22:10:00Z",
    duration: 5000,
    requestBody: JSON.stringify(
      {
        event: "batch.complete",
        data: { batch_id: "bat_q6r7s8t9", total: 3, completed: 3 },
      },
      null,
      2
    ),
    responseBody: "Service Unavailable",
  },
  {
    id: "dl_4",
    webhookId: "wh_1",
    event: "reading.complete",
    status: 200,
    timestamp: "2026-04-16T08:30:00Z",
    duration: 312,
    requestBody: JSON.stringify(
      {
        event: "reading.complete",
        data: { reading_id: "rd_x7y8z9a0", type: "daily_forecast" },
      },
      null,
      2
    ),
    responseBody: JSON.stringify({ received: true, queued: true }, null, 2),
  },
];

// ---- Helpers ----------------------------------------------------------------

function generateSecret(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "whsec_";
  for (let i = 0; i < 20; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function formatTimestamp(ts: string | null): string {
  if (!ts) return "Never";
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const STATUS_STYLES: Record<string, { variant: "healthy" | "error" | "degraded" | "neutral"; label: string }> = {
  active: { variant: "healthy", label: "Active" },
  inactive: { variant: "neutral", label: "Inactive" },
  failing: { variant: "error", label: "Failing" },
};

// ---- Component --------------------------------------------------------------

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(INITIAL_WEBHOOKS);
  const [logs] = useState<DeliveryLog[]>(INITIAL_LOGS);
  const [showForm, setShowForm] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean } | null>(null);

  // Form state
  const [formUrl, setFormUrl] = useState("");
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [formSecret, setFormSecret] = useState(generateSecret());

  function handleRegister() {
    if (!formUrl.trim() || formEvents.length === 0) return;

    const newWebhook: Webhook = {
      id: `wh_${Date.now()}`,
      url: formUrl.trim(),
      events: formEvents,
      secret: formSecret,
      status: "active",
      lastDelivery: null,
      lastStatus: null,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setWebhooks((prev) => [...prev, newWebhook]);
    setFormUrl("");
    setFormEvents([]);
    setFormSecret(generateSecret());
    setShowForm(false);
  }

  function toggleEvent(eventId: string) {
    setFormEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    );
  }

  function handleTest(webhookId: string) {
    setTestingId(webhookId);
    setTestResult(null);
    setTimeout(() => {
      const wh = webhooks.find((w) => w.id === webhookId);
      const success = wh?.status !== "failing";
      setTestResult({ id: webhookId, success });
      setTestingId(null);
    }, 1500);
  }

  function handleToggleStatus(id: string) {
    setWebhooks((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, status: w.status === "active" ? "inactive" : "active" }
          : w
      )
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Webhooks</h1>
          <p className="text-sm text-text-muted">
            Receive real-time notifications for events in your ENVI-OUS BRAIN account
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Register Webhook"}
        </Button>
      </div>

      {/* Register Form */}
      {showForm && (
        <Card className="mb-6" glow="blue">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Register New Webhook
          </h2>
          <div className="space-y-4">
            <Input
              label="Endpoint URL"
              placeholder="https://your-app.com/webhooks/envious-brain"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                Events to Subscribe
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {EVENT_TYPES.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => toggleEvent(evt.id)}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      formEvents.includes(evt.id)
                        ? "border-accent-blue bg-accent-blue/10"
                        : "border-border bg-card hover:border-border-hover"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        formEvents.includes(evt.id)
                          ? "text-accent-blue"
                          : "text-text-secondary"
                      }`}
                    >
                      {evt.label}
                    </p>
                    <p className="text-xs text-text-muted">{evt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Signing Secret
              </label>
              <div className="flex gap-2">
                <code className="flex-1 rounded-lg border border-border bg-navy px-3 py-2 font-mono text-xs text-text-secondary">
                  {formSecret}
                </code>
                <Button
                  variant="secondary"
                  className="text-xs shrink-0"
                  onClick={() => setFormSecret(generateSecret())}
                >
                  Regenerate
                </Button>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Use this secret to verify webhook signatures
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleRegister}
                disabled={!formUrl.trim() || formEvents.length === 0}
              >
                Register Webhook
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Webhooks Table */}
      <Card title="Registered Webhooks" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  URL
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Events
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Status
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Last Delivery
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((wh) => {
                const style = STATUS_STYLES[wh.status];
                return (
                  <tr
                    key={wh.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-3.5 pr-4">
                      <code className="rounded bg-white/5 px-2 py-0.5 font-mono text-xs text-accent-blue">
                        {wh.url}
                      </code>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {wh.events.map((evt) => (
                          <Badge key={evt} variant="info" className="text-[10px]">
                            {evt}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <Badge variant={style.variant}>{style.label}</Badge>
                    </td>
                    <td className="py-3.5 pr-4 text-text-secondary text-xs">
                      <div>
                        {formatTimestamp(wh.lastDelivery)}
                        {wh.lastStatus && (
                          <Badge
                            variant={wh.lastStatus < 400 ? "healthy" : "error"}
                            className="ml-2 text-[10px]"
                          >
                            {wh.lastStatus}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          className="px-2 py-1 text-xs"
                          onClick={() => handleTest(wh.id)}
                          disabled={testingId === wh.id}
                        >
                          {testingId === wh.id
                            ? "Testing..."
                            : testResult?.id === wh.id
                              ? testResult.success
                                ? "Delivered"
                                : "Failed"
                              : "Test"}
                        </Button>
                        <Button
                          variant="ghost"
                          className="px-2 py-1 text-xs"
                          onClick={() => handleToggleStatus(wh.id)}
                        >
                          {wh.status === "active" ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delivery Logs */}
      <Card title="Delivery Log">
        <div className="space-y-1">
          {logs.map((log) => {
            const isExpanded = expandedLogId === log.id;

            return (
              <div key={log.id} className="rounded-lg border border-border/50">
                <button
                  onClick={() =>
                    setExpandedLogId(isExpanded ? null : log.id)
                  }
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <Badge
                    variant={log.status < 400 ? "healthy" : "error"}
                    className="text-[10px] shrink-0"
                  >
                    {log.status}
                  </Badge>
                  <Badge variant="info" className="text-[10px] shrink-0">
                    {log.event}
                  </Badge>
                  <span className="text-xs text-text-muted truncate">
                    {webhooks.find((w) => w.id === log.webhookId)?.url ?? log.webhookId}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-text-muted">
                    {log.duration}ms
                  </span>
                  <span className="shrink-0 text-xs text-text-muted">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className="text-text-muted shrink-0">
                    {isExpanded ? "\u25B2" : "\u25BC"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-border/50 px-3 py-3 space-y-3">
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Request Payload
                      </h4>
                      <pre className="overflow-x-auto rounded-lg bg-navy p-2 text-xs text-accent-emerald font-mono">
                        {log.requestBody}
                      </pre>
                    </div>
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Response
                      </h4>
                      <pre className="overflow-x-auto rounded-lg bg-navy p-2 text-xs text-accent-blue font-mono">
                        {log.responseBody}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
