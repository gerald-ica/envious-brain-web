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
  "https://envious-brain-api-662458014068.us-central1.run.app";

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

        // Step 3: Call declinations endpoint with flat floats
        const res = await fetch(`${API_URL}/api/v1/techniques/declinations`, {
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
          <p className="text-text-secondary mb-4">Create a birth profile to view declinations.</p>
          <Link href="/dashboard/settings"><Button>Go to Settings</Button></Link>
        </Card>
      </div>
    );
  }

  // API returns { declinations: { Sun: { planet, ecliptic_longitude, declination, is_out_of_bounds }, ... }, parallels: [...], contraparallels: [...] }
  const declinations = data?.declinations as Record<string, Record<string, unknown>> | undefined;
  const parallels = data?.parallels as Array<Record<string, unknown>> | undefined;
  const contraparallels = data?.contraparallels as Array<Record<string, unknown>> | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Declinations for {activeProfile.name}</h1>
        <p className="mt-1 text-sm text-text-muted">Parallel and contraparallel aspects by celestial latitude</p>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-10 w-full rounded" />))}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-4 py-2.5 text-sm text-accent-rose">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="animate-fade-in space-y-6">
          {declinations && (
            <Card title="Planet Declinations">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Longitude</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Declination</th>
                      <th className="pb-2 font-medium text-text-muted">Out of Bounds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(declinations).map(([planet, pos]) => {
                      const decl = pos.declination as number | undefined;
                      const oob = pos.is_out_of_bounds as boolean | undefined;
                      return (
                        <tr key={planet} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 pr-4 font-medium text-text-primary">{planet}</td>
                          <td className="py-2.5 pr-4 font-mono text-text-secondary">
                            {typeof pos.ecliptic_longitude === "number" ? `${(pos.ecliptic_longitude as number).toFixed(2)}°` : "—"}
                          </td>
                          <td className="py-2.5 pr-4 font-mono text-text-secondary">
                            {typeof decl === "number" ? (
                              <span className={decl >= 0 ? "text-blue-400" : "text-amber-400"}>
                                {decl >= 0 ? "N " : "S "}{Math.abs(decl).toFixed(2)}°
                              </span>
                            ) : "—"}
                          </td>
                          <td className="py-2.5">
                            {oob ? (
                              <Badge variant="degraded">OOB</Badge>
                            ) : (
                              <span className="text-text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {parallels && parallels.length > 0 && (
            <Card title="Parallels">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet 1</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet 2</th>
                      <th className="pb-2 font-medium text-text-muted">Orb</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parallels.map((a, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-text-primary">{String(a.planet1 ?? a.planet_a ?? "")}</td>
                        <td className="py-2.5 pr-4 font-medium text-text-primary">{String(a.planet2 ?? a.planet_b ?? "")}</td>
                        <td className="py-2.5 font-mono text-xs text-text-muted">
                          {typeof a.orb === "number" ? `${(a.orb as number).toFixed(2)}°` : String(a.orb ?? "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {contraparallels && contraparallels.length > 0 && (
            <Card title="Contraparallels">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet 1</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet 2</th>
                      <th className="pb-2 font-medium text-text-muted">Orb</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contraparallels.map((a, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-text-primary">{String(a.planet1 ?? a.planet_a ?? "")}</td>
                        <td className="py-2.5 pr-4 font-medium text-text-primary">{String(a.planet2 ?? a.planet_b ?? "")}</td>
                        <td className="py-2.5 font-mono text-xs text-text-muted">
                          {typeof a.orb === "number" ? `${(a.orb as number).toFixed(2)}°` : String(a.orb ?? "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {!declinations && !parallels && !contraparallels && (
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
