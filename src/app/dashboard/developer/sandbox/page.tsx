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

// ---- Mock Responses ---------------------------------------------------------

const MOCK_RESPONSES: Record<string, { status: number; body: object }> = {
  "/api/v1/charts/natal": {
    status: 200,
    body: {
      chart_id: "ch_9x8f7e6d",
      sun: { sign: "Gemini", degree: 24.5, house: 10 },
      moon: { sign: "Scorpio", degree: 12.3, house: 3 },
      ascendant: { sign: "Virgo", degree: 8.7 },
      aspects: [
        { planet1: "Sun", planet2: "Moon", type: "trine", orb: 2.1 },
        { planet1: "Venus", planet2: "Mars", type: "square", orb: 1.8 },
      ],
      computed_at: "2026-04-16T10:30:00Z",
    },
  },
  "/api/v1/transits/current": {
    status: 200,
    body: {
      timestamp: "2026-04-16T10:30:00Z",
      transits: [
        { planet: "Mercury", sign: "Aries", degree: 12.4 },
        { planet: "Venus", sign: "Pisces", degree: 28.1 },
        { planet: "Mars", sign: "Cancer", degree: 15.7 },
      ],
    },
  },
  "/api/v1/oracle/query": {
    status: 200,
    body: {
      response_id: "or_e5f6g7h8",
      answer:
        "With your Gemini Sun in the 10th house and Mercury conjunct, careers in communication, writing, or technology are strongly favored. The trine from your Scorpio Moon adds depth and research ability.",
      confidence: 0.91,
      cited_placements: ["Sun in Gemini 10H", "Mercury conjunct Sun", "Moon in Scorpio 3H"],
    },
  },
  "/api/v1/personality/mbti": {
    status: 200,
    body: {
      type: "INTJ",
      confidence: 0.87,
      functions: { dominant: "Ni", auxiliary: "Te", tertiary: "Fi", inferior: "Se" },
      description: "Strategic and analytical with strong intuitive drive.",
    },
  },
  default: {
    status: 200,
    body: {
      message: "Request processed successfully",
      timestamp: "2026-04-16T10:30:00Z",
    },
  },
};

const ERROR_RESPONSE = {
  status: 401,
  body: {
    error: "unauthorized",
    message: "Invalid or missing API key. Include your key in the Authorization header.",
  },
};

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

const BASE_URL = "https://api.envious-brain.com";

// ---- Component --------------------------------------------------------------

export default function SandboxPage() {
  const [method, setMethod] = useState<HttpMethod>("POST");
  const [url, setUrl] = useState(`${BASE_URL}/api/v1/charts/natal`);
  const [headers, setHeaders] = useState(
    JSON.stringify(
      {
        Authorization: "Bearer eb_test_rs6t9u2v5w8x1y4z7a0b",
        "Content-Type": "application/json",
      },
      null,
      2
    )
  );
  const [body, setBody] = useState(
    JSON.stringify(
      {
        birth_date: "1990-06-15",
        birth_time: "14:30:00",
        latitude: 40.7128,
        longitude: -74.006,
        house_system: "placidus",
      },
      null,
      2
    )
  );
  const [response, setResponse] = useState<{
    status: number;
    body: string;
    time: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: "h1",
      method: "POST",
      url: `${BASE_URL}/api/v1/charts/natal`,
      status: 200,
      time: 142,
      timestamp: "10:24:15",
    },
    {
      id: "h2",
      method: "GET",
      url: `${BASE_URL}/api/v1/transits/current`,
      status: 200,
      time: 67,
      timestamp: "10:22:08",
    },
    {
      id: "h3",
      method: "POST",
      url: `${BASE_URL}/api/v1/oracle/query`,
      status: 200,
      time: 891,
      timestamp: "10:18:42",
    },
  ]);

  function handleSend() {
    setLoading(true);
    setResponse(null);

    // Simulate network delay
    const delay = 100 + Math.random() * 400;

    setTimeout(() => {
      // Check if headers contain a valid key
      let hasValidKey = false;
      try {
        const h = JSON.parse(headers);
        hasValidKey = h.Authorization?.startsWith("Bearer eb_");
      } catch {
        // bad headers
      }

      let resp;
      if (!hasValidKey) {
        resp = ERROR_RESPONSE;
      } else {
        // Match path from the URL
        const path = url.replace(BASE_URL, "").split("?")[0];
        resp = MOCK_RESPONSES[path] || MOCK_RESPONSES.default;
      }

      const time = Math.round(delay);
      setResponse({
        status: resp.status,
        body: JSON.stringify(resp.body, null, 2),
        time,
      });

      const entry: HistoryEntry = {
        id: `h${Date.now()}`,
        method,
        url,
        status: resp.status,
        time,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 20));
      setLoading(false);
    }, delay);
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
          Test API endpoints interactively with live request/response preview
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
