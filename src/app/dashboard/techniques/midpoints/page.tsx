"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { api, type BirthData } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Midpoints
// ---------------------------------------------------------------------------

function formatDegree(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}\u00b0 ${String(m).padStart(2, "0")}'`;
}

export default function MidpointsPage() {
  const { activeProfile } = useProfile();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) return;
    const birth: BirthData = {
      date: activeProfile.birthDate,
      time: activeProfile.birthTime,
      latitude: activeProfile.lat,
      longitude: activeProfile.lon,
      timezone: activeProfile.timezone,
    };
    setLoading(true);
    setError(null);
    api.techniques
      .midpoints(birth)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Midpoints API error:", err);
        const status = (err as { status?: number }).status;
        if (status === 404) {
          setError("Midpoints endpoint is not yet deployed.");
        } else if (status === 422) {
          setError("Invalid request — check your birth profile data.");
        } else {
          setError("Failed to load midpoints. Check API connection.");
        }
      })
      .finally(() => setLoading(false));
  }, [activeProfile]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view midpoint trees.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const midpoints = data?.midpoints as Array<Record<string, unknown>> | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Midpoints for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Midpoint structures and planetary pictures
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
          {midpoints && midpoints.length > 0 ? (
            <Card title="Midpoint Trees">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet 1</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">/</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet 2</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Midpoint</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Sign</th>
                      <th className="pb-2 font-medium text-text-muted">Activation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {midpoints.map((mp, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-text-primary">
                          {mp.planet1 as string}
                        </td>
                        <td className="py-2.5 pr-4 text-text-muted">/</td>
                        <td className="py-2.5 pr-4 font-medium text-text-primary">
                          {mp.planet2 as string}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">
                          {typeof mp.longitude === "number"
                            ? formatDegree(mp.longitude)
                            : typeof mp.midpoint === "number"
                              ? formatDegree(mp.midpoint)
                              : String(mp.longitude ?? mp.midpoint ?? "")}
                        </td>
                        <td className="py-2.5 pr-4 text-text-secondary">
                          {mp.sign as string ?? ""}
                        </td>
                        <td className="py-2.5">
                          {mp.activated_by ? (
                            <Badge variant="info">{mp.activated_by as string}</Badge>
                          ) : (
                            <span className="text-text-muted">--</span>
                          )}
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
