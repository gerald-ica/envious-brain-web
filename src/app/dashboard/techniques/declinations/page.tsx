"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Declinations (Parallel / Contraparallel)
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

export default function DeclinationsPage() {
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

        // Step 2: Extract declination and longitude
        const positions: Record<string, { declination: number; longitude: number }> = {};
        for (const [name, raw] of Object.entries(chart.positions ?? {})) {
          const p = raw as Record<string, unknown>;
          positions[name] = {
            declination: (p.declination ?? 0) as number,
            longitude: (p.longitude ?? 0) as number,
          };
        }

        // Step 3: Call declinations endpoint
        const res = await fetch(`${API_URL}/api/v1/techniques/declinations`, {
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
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load declinations");
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
            Create a birth profile to view declinations.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const positions = data?.declinations as Record<string, Record<string, unknown>> | undefined;
  const aspects = data?.aspects as Array<Record<string, unknown>> | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Declinations for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Parallel and contraparallel aspects by celestial latitude
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
          {positions && (
            <Card title="Planet Declinations">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Declination</th>
                      <th className="pb-2 font-medium text-text-muted">Direction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(positions).map(([planet, pos]) => (
                      <tr key={planet} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-text-primary">{planet}</td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">
                          {typeof pos.declination === "number"
                            ? `${pos.declination.toFixed(2)}\u00b0`
                            : String(pos.declination ?? pos.value ?? "")}
                        </td>
                        <td className="py-2.5">
                          <Badge variant={
                            (typeof pos.declination === "number" ? pos.declination : 0) >= 0
                              ? "info"
                              : "degraded"
                          }>
                            {(typeof pos.declination === "number" ? pos.declination : 0) >= 0
                              ? "North"
                              : "South"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {aspects && aspects.length > 0 && (
            <Card title="Parallel / Contraparallel Aspects">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet 1</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Aspect</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet 2</th>
                      <th className="pb-2 font-medium text-text-muted">Orb</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aspects.map((a, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-text-primary">
                          {a.planet1 as string}
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge variant={a.type === "parallel" ? "healthy" : "degraded"}>
                            {a.type as string}
                          </Badge>
                        </td>
                        <td className="py-2.5 pr-4 font-medium text-text-primary">
                          {a.planet2 as string}
                        </td>
                        <td className="py-2.5 font-mono text-xs text-text-muted">
                          {typeof a.orb === "number" ? `${a.orb.toFixed(2)}\u00b0` : String(a.orb ?? "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {!positions && !aspects && (
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
