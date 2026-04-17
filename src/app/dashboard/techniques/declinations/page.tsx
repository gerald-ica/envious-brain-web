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
// Declinations (Parallel / Contraparallel)
// ---------------------------------------------------------------------------

export default function DeclinationsPage() {
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
      .declinations(birth)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Declinations API error:", err);
        const status = (err as { status?: number }).status;
        if (status === 404) {
          setError("Declinations endpoint is not yet deployed.");
        } else if (status === 422) {
          setError("Invalid request — check your birth profile data.");
        } else {
          setError("Failed to load declinations. Check API connection.");
        }
      })
      .finally(() => setLoading(false));
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
