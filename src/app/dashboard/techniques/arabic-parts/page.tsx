"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Arabic Parts / Lots
// This endpoint requires full_chart data which is pending backend deployment.
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

function formatDegree(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}\u00b0 ${String(m).padStart(2, "0")}'`;
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
            datetime: `${activeProfile.birthDate}T${activeProfile.birthTime}:00`,
            latitude: activeProfile.lat,
            longitude: activeProfile.lon,
          }),
        });
        if (!res.ok) {
          const status = res.status;
          if (status === 422) {
            throw new Error(
              "Arabic Parts requires a full chart backend update that is currently being deployed. Check back soon.",
            );
          }
          throw new Error(`API error ${status}`);
        }
        const result = await res.json();
        if (!cancelled) setData(result);
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
          <p className="text-text-secondary mb-4">
            Create a birth profile to view Arabic Parts / Lots.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const parts = data?.parts as Array<Record<string, unknown>> | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Arabic Parts for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Calculated Lots derived from planet and cusp positions
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
          {parts && parts.length > 0 ? (
            <Card title="Arabic Parts / Lots">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Part</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Sign</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Degree</th>
                      <th className="pb-2 font-medium text-text-muted">House</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((p, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-text-primary">
                          {(p.name ?? p.part) as string}
                        </td>
                        <td className="py-2.5 pr-4 text-text-secondary">
                          {p.sign as string}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">
                          {typeof p.degree_in_sign === "number"
                            ? formatDegree(p.degree_in_sign)
                            : typeof p.degree === "number"
                              ? formatDegree(p.degree)
                              : String(p.degree_in_sign ?? p.degree ?? "")}
                        </td>
                        <td className="py-2.5 text-text-secondary">
                          {String(p.house ?? "")}
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
