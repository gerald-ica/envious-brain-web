"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Sabian Symbols
// ---------------------------------------------------------------------------

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
            datetime: `${activeProfile.birthDate}T${activeProfile.birthTime}:00`,
            latitude: activeProfile.lat,
            longitude: activeProfile.lon,
          }),
        });
        if (!chartRes.ok) throw new Error("Failed to compute natal chart");
        const chart = await chartRes.json();

        // Step 2: Extract planet positions with longitude and sign
        const positions: Record<string, { longitude: number; sign: string }> = {};
        for (const [name, raw] of Object.entries(chart.positions ?? {})) {
          const p = raw as Record<string, unknown>;
          positions[name] = {
            longitude: (p.longitude ?? 0) as number,
            sign: p.sign as string,
          };
        }

        // Step 3: Call sabian-symbols endpoint
        const res = await fetch(`${API_URL}/api/v1/techniques/sabian-symbols`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planet_positions: positions }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as Record<string, unknown>).detail as string ?? `${res.status}`);
        }
        const result = await res.json();
        if (!cancelled) setData(result);
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
          <p className="text-text-secondary mb-4">
            Create a birth profile to view Sabian symbols.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const symbols = data?.symbols as Array<Record<string, unknown>> | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Sabian Symbols for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Symbolic degree meanings for each planet's position
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-4 py-2.5 text-sm text-accent-rose">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="animate-fade-in space-y-6">
          {symbols && symbols.length > 0 ? (
            <Card title="Degree Symbols">
              <div className="space-y-4">
                {symbols.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-white/[0.02] px-4 py-3 space-y-1"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-text-primary">
                        {s.planet as string}
                      </span>
                      <Badge variant="info">
                        {s.sign as string} {String(s.degree ?? "")}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary italic">
                      {s.symbol as string}
                    </p>
                    {s.keynote ? (
                      <p className="text-xs text-text-muted">
                        {s.keynote as string}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
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
