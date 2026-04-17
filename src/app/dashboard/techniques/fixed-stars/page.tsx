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

export default function FixedStarsPage() {
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
        const res = await fetch(`${API_URL}/api/v1/western/fixed-stars`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            datetime: `${activeProfile.birthDate}T${activeProfile.birthTime || "12:00"}:00`,
            latitude: activeProfile.lat,
            longitude: activeProfile.lon,
          }),
        });
        if (res.status === 404) {
          if (!cancelled) setError("Fixed stars endpoint is not yet deployed.");
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as Record<string, unknown>).detail as string ?? `API error ${res.status}`);
        }
        if (!cancelled) setData(await res.json());
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load fixed stars");
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
          <p className="text-text-secondary mb-4">Create a birth profile to view fixed star conjunctions.</p>
          <Link href="/dashboard/settings"><Button>Go to Settings</Button></Link>
        </Card>
      </div>
    );
  }

  // API returns { conjunctions: [{ star, planet, star_longitude, planet_longitude, orb, star_nature, star_keywords, star_magnitude }, ...], count: N }
  const conjunctions = data?.conjunctions as Array<Record<string, unknown>> | undefined;
  const count = data?.count as number | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Fixed Stars for {activeProfile.name}</h1>
        <p className="mt-1 text-sm text-text-muted">
          Major fixed star conjunctions with natal planets{count != null ? ` — ${count} found` : ""}
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-10 w-full rounded" />))}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-4 py-2.5 text-sm text-accent-rose">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="animate-fade-in space-y-6">
          {conjunctions && conjunctions.length > 0 ? (
            <Card title="Star Conjunctions">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Star</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Orb</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Magnitude</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Nature</th>
                      <th className="pb-2 font-medium text-text-muted">Keywords</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conjunctions.map((c, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-text-primary">{String(c.star ?? "")}</td>
                        <td className="py-2.5 pr-4 text-text-secondary">{String(c.planet ?? "")}</td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">
                          {typeof c.orb === "number" ? `${(c.orb as number).toFixed(2)}°` : String(c.orb ?? "")}
                        </td>
                        <td className="py-2.5 pr-4 text-text-secondary">
                          {typeof c.star_magnitude === "number" ? (c.star_magnitude as number).toFixed(2) : String(c.star_magnitude ?? c.magnitude ?? "")}
                        </td>
                        <td className="py-2.5 pr-4">
                          {c.star_nature ? (
                            <Badge variant="info">{String(c.star_nature)}</Badge>
                          ) : <span className="text-text-muted">—</span>}
                        </td>
                        <td className="py-2.5">
                          {Array.isArray(c.star_keywords) && c.star_keywords.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {(c.star_keywords as string[]).map((kw) => (
                                <Badge key={kw} variant="neutral">{kw}</Badge>
                              ))}
                            </div>
                          ) : <span className="text-text-muted">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
