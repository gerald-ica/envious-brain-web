"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Vedic Astrology (Jyotish) — Sidereal chart
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-662458014068.us-central1.run.app";

function formatDeg(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "-";
  const norm = ((value % 30) + 30) % 30;
  const d = Math.floor(norm);
  const m = Math.round((norm - d) * 60);
  return `${d}\u00b0 ${String(m).padStart(2, "0")}'`;
}

export default function VedicPage() {
  const { activeProfile } = useProfile();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/v1/charts/vedic`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            datetime: `${activeProfile.birthDate}T${activeProfile.birthTime || "12:00"}:00`,
            latitude: activeProfile.lat,
            longitude: activeProfile.lon,
            timezone: activeProfile.timezone || "UTC",
            ayanamsa: "lahiri",
          }),
        });
        if (res.status === 404) {
          setError("Vedic chart endpoint is being deployed. Check back soon.");
          return;
        }
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Vedic chart");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeProfile]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a profile in Settings to view your Vedic chart.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const positions = (data?.positions ?? null) as Record<
    string,
    Record<string, unknown>
  > | null;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Vedic Chart {"\u2014"} {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Jyotish {"\u00b7"} Sidereal zodiac {"\u00b7"} Lahiri ayanamsha
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      )}

      {error && (
        <Card>
          <div className="flex items-center gap-3">
            <Badge variant="degraded">Notice</Badge>
            <p className="text-sm text-accent-amber">{error}</p>
          </div>
        </Card>
      )}

      {data && !loading && (
        <div className="space-y-6">
          {/* Chart Info */}
          <Card title="Chart Info">
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-text-muted">Ayanamsa: </span>
                <span className="text-text-primary">
                  {String(data?.ayanamsa ?? "Lahiri")}
                </span>
              </div>
              <div>
                <span className="text-text-muted">System: </span>
                <span className="text-text-primary">Sidereal</span>
              </div>
            </div>
          </Card>

          {/* Rashi Positions table */}
          {positions && Object.keys(positions).length > 0 && (
            <Card title="Rashi Positions (Sidereal)">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">
                        Planet
                      </th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">
                        Rashi
                      </th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">
                        Degree
                      </th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">
                        Speed
                      </th>
                      <th className="pb-2 font-medium text-text-muted">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(positions).map(([planet, pos]) => {
                      const rashi =
                        (pos?.rashi as string) ??
                        (pos?.sign as string) ??
                        "-";
                      const deg =
                        (pos?.degree_in_rashi as number) ??
                        (pos?.sidereal_longitude as number) ??
                        (pos?.degree as number) ??
                        (pos?.longitude as number) ??
                        undefined;
                      const speed = pos?.speed as number | undefined;
                      const retrograde = pos?.retrograde as
                        | boolean
                        | undefined;

                      return (
                        <tr
                          key={planet}
                          className="border-b border-border/50 last:border-0"
                        >
                          <td className="py-2.5 pr-4 font-medium text-text-primary">
                            {planet}
                          </td>
                          <td className="py-2.5 pr-4 text-text-secondary">
                            {rashi}
                          </td>
                          <td className="py-2.5 pr-4 font-mono text-text-secondary">
                            {formatDeg(deg)}
                          </td>
                          <td className="py-2.5 pr-4 font-mono text-xs text-text-muted">
                            {speed != null
                              ? `${speed >= 0 ? "+" : ""}${speed.toFixed(3)}`
                              : "-"}
                          </td>
                          <td className="py-2.5">
                            {retrograde ? (
                              <Badge variant="degraded">Rx</Badge>
                            ) : (
                              <span className="text-text-muted">--</span>
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

          {/* Fallback: show raw JSON if no positions */}
          {!positions && (
            <Card title="Results">
              <pre className="overflow-x-auto text-xs text-text-secondary whitespace-pre-wrap max-h-96 overflow-y-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
