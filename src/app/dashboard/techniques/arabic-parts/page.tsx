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

function formatDeg(deg: number): string {
  const d = Math.floor(Math.abs(deg));
  const m = Math.floor((Math.abs(deg) - d) * 60);
  return `${d}° ${String(m).padStart(2, "0")}'`;
}

export default function ArabicPartsPage() {
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
        const res = await fetch(`${API_URL}/api/v1/western/arabic-parts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            datetime: `${activeProfile.birthDate}T${activeProfile.birthTime || "12:00"}:00`,
            latitude: activeProfile.lat,
            longitude: activeProfile.lon,
          }),
        });
        if (res.status === 422) {
          throw new Error("Arabic Parts requires a backend update currently being deployed. Check back soon.");
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as Record<string, unknown>).detail as string ?? `API error ${res.status}`);
        }
        if (!cancelled) setData(await res.json());
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load Arabic Parts");
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
          <p className="text-text-secondary mb-4">Create a birth profile to view Arabic Parts / Lots.</p>
          <Link href="/dashboard/settings"><Button>Go to Settings</Button></Link>
        </Card>
      </div>
    );
  }

  // API returns { parts: [{ name, longitude, sign, degree_in_sign, house, formula_day, formula_night }, ...], count: N }
  const parts = data?.parts as Array<Record<string, unknown>> | undefined;
  const count = data?.count as number | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Arabic Parts for {activeProfile.name}</h1>
        <p className="mt-1 text-sm text-text-muted">
          Calculated Lots derived from planet and cusp positions{count != null ? ` — ${count} parts` : ""}
        </p>
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
          {parts && parts.length > 0 ? (
            <Card title="Arabic Parts / Lots">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Part Name</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Sign</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Degree</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">House</th>
                      <th className="pb-2 font-medium text-text-muted">Formula</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((p, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-text-primary">
                          {String(p.name ?? "")}
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge variant="info">{String(p.sign ?? "")}</Badge>
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">
                          {typeof p.degree_in_sign === "number" ? formatDeg(p.degree_in_sign as number) : "—"}
                        </td>
                        <td className="py-2.5 pr-4 text-text-secondary">
                          {p.house != null ? String(p.house) : "—"}
                        </td>
                        <td className="py-2.5 text-xs font-mono text-text-muted">
                          {p.formula_day ? String(p.formula_day) : "—"}
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
