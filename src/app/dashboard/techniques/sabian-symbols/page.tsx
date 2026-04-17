"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

export default function SabianSymbolsPage() {
  const { activeProfile } = useProfile();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Step 1: Get western chart
        const chartRes = await fetch(`${API_URL}/api/v1/charts/western`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            datetime: `${activeProfile.birthDate}T${activeProfile.birthTime || "12:00"}:00`,
            latitude: activeProfile.lat,
            longitude: activeProfile.lon,
          }),
        });
        if (!chartRes.ok) throw new Error("Failed to compute natal chart");
        const chart = await chartRes.json();

        // Step 2: Extract flat float longitudes
        const planetPositions: Record<string, number> = {};
        for (const [name, raw] of Object.entries(chart.positions ?? {})) {
          const p = raw as Record<string, unknown>;
          planetPositions[name] = (p.longitude ?? 0) as number;
        }

        // Step 3: Call sabian-symbols endpoint with flat floats
        const res = await fetch(`${API_URL}/api/v1/techniques/sabian-symbols`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planet_positions: planetPositions }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as Record<string, unknown>).detail as string ?? `API error ${res.status}`);
        }
        if (!cancelled) setData(await res.json());
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load Sabian symbols");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeProfile]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">Create a birth profile to view Sabian symbols.</p>
          <Link href="/dashboard/settings"><Button>Go to Settings</Button></Link>
        </Card>
      </div>
    );
  }

  // API returns { symbols: { Sun: { degree_number, sign, degree_in_sign, symbol, keywords, interpretation }, ... } }
  const symbols = data?.symbols as Record<string, Record<string, unknown>> | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Sabian Symbols for {activeProfile.name}</h1>
        <p className="mt-1 text-sm text-text-muted">Symbolic degree meanings for each planet&apos;s position</p>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-24 w-full rounded" />))}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-4 py-2.5 text-sm text-accent-rose">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="animate-fade-in space-y-6">
          {symbols && Object.keys(symbols).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(symbols).map(([planet, s]) => (
                <Card key={planet} title={planet}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="info">
                        {String(s.sign ?? "")} {typeof s.degree_in_sign === "number" ? formatDeg(s.degree_in_sign) : ""}
                      </Badge>
                      {s.degree_number != null && (
                        <span className="text-xs text-text-muted">Degree #{String(s.degree_number)}</span>
                      )}
                    </div>
                    <p className="text-sm text-text-primary italic">&ldquo;{String(s.symbol ?? "")}&rdquo;</p>
                    {Array.isArray(s.keywords) && s.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(s.keywords as string[]).map((kw) => (
                          <Badge key={kw} variant="neutral">{kw}</Badge>
                        ))}
                      </div>
                    )}
                    {s.interpretation != null && (
                      <p className="text-sm text-text-secondary">{String(s.interpretation)}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card title="Results">
              <pre className="overflow-x-auto text-xs text-text-secondary whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function formatDeg(deg: number): string {
  const d = Math.floor(Math.abs(deg));
  const m = Math.floor((Math.abs(deg) - d) * 60);
  return `${d}° ${String(m).padStart(2, "0")}'`;
}
