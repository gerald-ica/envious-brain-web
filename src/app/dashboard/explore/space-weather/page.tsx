"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Space Weather — via GET /api/v1/space-weather/current
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

function StatBox({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="rounded-lg bg-white/[0.02] px-4 py-3 text-center">
      <p className="text-xs text-text-muted uppercase mb-1">{label}</p>
      <p className="text-xl font-bold font-mono text-text-primary">
        {value}
        {unit ? <span className="text-xs text-text-muted ml-1">{unit}</span> : null}
      </p>
    </div>
  );
}

export default function SpaceWeatherPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/v1/space-weather/current`);
        if (res.status === 502 || res.status === 503) {
          throw new Error("Space weather data temporarily unavailable (NASA service down)");
        }
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load space weather");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-text-primary">Space Weather</h1>
        <Badge variant="info">Live</Badge>
      </div>
      <p className="mb-6 text-sm text-text-muted">
        Real-time solar and geomagnetic activity data
      </p>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-accent-amber/30 bg-accent-amber/10 px-4 py-4 text-sm text-accent-amber">
          <p className="font-medium mb-1">Data Unavailable</p>
          <p>{error}</p>
          <p className="mt-2 text-xs text-text-muted">
            Space weather data is sourced from NASA/NOAA and may be temporarily unavailable.
          </p>
        </div>
      )}

      {data && !loading && (
        <div className="animate-fade-in space-y-6">
          {renderSpaceWeatherData(data)}
        </div>
      )}
    </div>
  );
}

function renderSpaceWeatherData(data: Record<string, unknown>) {
  const entries = Object.entries(data);
  const simpleFields: [string, unknown][] = [];
  const objectFields: [string, Record<string, unknown>][] = [];
  const arrayFields: [string, unknown[]][] = [];

  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      arrayFields.push([key, value]);
    } else if (typeof value === "object" && value !== null) {
      objectFields.push([key, value as Record<string, unknown>]);
    } else {
      simpleFields.push([key, value]);
    }
  }

  return (
    <>
      {/* Metrics row */}
      {simpleFields.length > 0 ? (
        <Card title="Current Conditions">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {simpleFields.map(([key, value]) => (
              <StatBox
                key={key}
                label={key.replace(/_/g, " ")}
                value={typeof value === "number" ? value.toFixed(2) : String(value)}
              />
            ))}
          </div>
        </Card>
      ) : null}

      {/* Nested objects as cards */}
      {objectFields.map(([key, obj]) => (
        <Card key={key} title={key.replace(/_/g, " ")}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(obj).map(([k, v]) => (
              <StatBox
                key={k}
                label={k.replace(/_/g, " ")}
                value={
                  typeof v === "number"
                    ? v.toFixed(2)
                    : typeof v === "object" && v !== null
                      ? JSON.stringify(v)
                      : String(v)
                }
              />
            ))}
          </div>
        </Card>
      ))}

      {/* Arrays */}
      {arrayFields.map(([key, arr]) => (
        <Card key={key} title={key.replace(/_/g, " ")}>
          <div className="space-y-2">
            {arr.map((item, i) => (
              <div key={i} className="rounded-lg bg-white/[0.02] px-4 py-2.5 text-sm text-text-secondary">
                {typeof item === "object" && item !== null
                  ? JSON.stringify(item)
                  : String(item)}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </>
  );
}
