"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---- Types ------------------------------------------------------------------

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface HistoryEntry {
  id: string;
  method: HttpMethod;
  url: string;
  status: number;
  time: number;
  timestamp: string;
}

// ---- Constants ---------------------------------------------------------------

const LIVE_API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30",
  POST: "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
  PUT: "bg-accent-amber/15 text-accent-amber border-accent-amber/30",
  DELETE: "bg-accent-rose/15 text-accent-rose border-accent-rose/30",
};

const STATUS_VARIANT: Record<number, "healthy" | "error" | "degraded" | "info"> = {
  200: "healthy",
  201: "healthy",
  400: "degraded",
  401: "error",
  404: "degraded",
  429: "degraded",
  500: "error",
};

const BASE_URL = LIVE_API_URL;

// ---- Component --------------------------------------------------------------

export default function SandboxPage() {
  const [method, setMethod] = useState<HttpMethod>("POST");
  const [url, setUrl] = useState(`${BASE_URL}/api/v1/charts/western`);
  const [headers, setHeaders] = useState(
    JSON.stringify(
      { "Content-Type": "application/json" },
      null,
      2,
    ),
  );
  const [body, setBody] = useState(
    JSON.stringify(
      {
        datetime: "1990-06-15T14:30:00",
        latitude: 40.7128,
        longitude: -74.006,
        timezone: "America/New_York",
      },
      null,
      2,
    ),
  );
  const [response, setResponse] = useState<{
    status: number;
    body: string;
    time: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  async function handleSend() {
    setLoading(true);
    setResponse(null);
    const start = performance.now();

    try {
      // Parse user-supplied headers
      let parsedHeaders: Record<string, string> = {};
      try {
        parsedHeaders = JSON.parse(headers);
      } catch {
        // If headers aren't valid JSON, just use Content-Type
      }

      const fetchInit: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...parsedHeaders,
        },
      };

      if ((method === "POST" || method === "PUT") && body.trim()) {
        fetchInit.body = body;
      }

      const res = await fetch(url, fetchInit);
      const elapsed = Math.round(performance.now() - start);

      let responseBody: string;
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("json")) {
        const json = await res.json();
        responseBody = JSON.stringify(json, null, 2);
      } else {
        responseBody = await res.text();
      }

      setResponse({ status: res.status, body: responseBody, time: elapsed });

      const entry: HistoryEntry = {
        id: `h${Date.now()}`,
        method,
        url,
        status: res.status,
        time: elapsed,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 20));
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      setResponse({
        status: 0,
        body: `Network error: ${err instanceof Error ? err.message : "Request failed"}`,
        time: elapsed,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleFormat() {
    try {
      setBody(JSON.stringify(JSON.parse(body), null, 2));
    } catch {
      // ignore formatting errors
    }
  }

  function loadFromHistory(entry: HistoryEntry) {
    setMethod(entry.method);
    setUrl(entry.url);
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">API Sandbox</h1>
        <p className="text-sm text-text-muted">
          Send live requests to the ENVI-OUS BRAIN API and see real responses
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Request Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Method + URL */}
          <Card>
            <div className="flex gap-2">
              <div className="flex gap-1">
                {(["GET", "POST", "PUT", "DELETE"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                      method === m
                        ? METHOD_COLORS[m]
                        : "border-border bg-card text-text-muted hover:border-border-hover"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 font-mono text-xs"
                placeholder={`${BASE_URL}/api/v1/...`}
              />
            </div>
          </Card>

          {/* Headers */}
          <Card title="Headers">
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border bg-navy p-3 font-mono text-xs text-text-secondary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/50 resize-none"
              placeholder='{ "Authorization": "Bearer eb_test_..." }'
            />
          </Card>

          {/* Request Body */}
          {(method === "POST" || method === "PUT") && (
            <Card title="Request Body">
              <div className="relative">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="w-full rounded-lg border border-border bg-navy p-3 font-mono text-xs text-text-secondary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/50 resize-y"
                  placeholder="{ ... }"
                />
                <button
                  onClick={handleFormat}
                  className="absolute bottom-3 right-3 rounded border border-border bg-card px-2 py-1 text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  Format JSON
                </button>
              </div>
            </Card>
          )}

          {/* Send Button */}
          <Button onClick={handleSend} disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send Request"}
          </Button>

          {/* Response Panel */}
          {response && (
            <Card title="Response">
              <div className="mb-3 flex items-center gap-3">
                <Badge variant={STATUS_VARIANT[response.status] || "neutral"}>
                  {response.status}
                </Badge>
                <span className="text-xs text-text-muted font-mono">
                  {response.time}ms
                </span>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-navy p-3 font-mono text-xs text-accent-emerald max-h-96 overflow-y-auto">
                {response.body}
              </pre>
            </Card>
          )}
        </div>

        {/* History Sidebar */}
        <div>
          <Card title="Request History">
            {history.length === 0 ? (
              <p className="text-sm text-text-muted py-4 text-center">
                No requests yet
              </p>
            ) : (
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => loadFromHistory(entry)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
                  >
                    <span
                      className={`inline-flex w-12 shrink-0 items-center justify-center rounded text-[10px] font-bold ${METHOD_COLORS[entry.method]}`}
                    >
                      {entry.method}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs text-text-secondary">
                        {entry.url.replace(BASE_URL, "")}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <Badge
                          variant={STATUS_VARIANT[entry.status] || "neutral"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {entry.status}
                        </Badge>
                        <span>{entry.time}ms</span>
                        <span>{entry.timestamp}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
