"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { api, type BirthData } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Secondary Progressions
// ---------------------------------------------------------------------------

function formatDegree(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}\u00b0 ${String(m).padStart(2, "0")}'`;
}

export default function ProgressionsPage() {
  const { activeProfile } = useProfile();
  const [targetDate, setTargetDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (birth: BirthData, date: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.advancedCharts.progressions(birth, date);
      setData(res.data);
    } catch (err) {
      console.error("Progressions API error:", err);
      setError("Failed to load progressions. Check API connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeProfile) return;
    const birth: BirthData = {
      date: activeProfile.birthDate,
      time: activeProfile.birthTime,
      latitude: activeProfile.lat,
      longitude: activeProfile.lon,
      timezone: activeProfile.timezone,
    };
    fetchData(birth, targetDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile]);

  const handleRecalculate = () => {
    if (!activeProfile) return;
    const birth: BirthData = {
      date: activeProfile.birthDate,
      time: activeProfile.birthTime,
      latitude: activeProfile.lat,
      longitude: activeProfile.lon,
      timezone: activeProfile.timezone,
    };
    fetchData(birth, targetDate);
  };

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view your secondary progressions.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const positions = data?.positions as Record<string, Record<string, unknown>> | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Secondary Progressions for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          One day = one year symbolic progression of the natal chart
        </p>
      </div>

      <Card title="Target Date" className="mb-6">
        <div className="flex items-end gap-4">
          <Input
            label="Progress to Date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
          <Button onClick={handleRecalculate} disabled={loading}>
            {loading ? "Calculating..." : "Calculate"}
          </Button>
        </div>
      </Card>

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
          {positions ? (
            <Card title="Progressed Positions">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Sign</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Degree</th>
                      <th className="pb-2 font-medium text-text-muted">Rx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(positions).map(([planet, pos]) => (
                      <tr key={planet} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-text-primary">{planet}</td>
                        <td className="py-2.5 pr-4 text-text-secondary">
                          {pos.sign as string}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">
                          {typeof pos.degree_in_sign === "number"
                            ? formatDegree(pos.degree_in_sign)
                            : String(pos.degree_in_sign ?? "")}
                        </td>
                        <td className="py-2.5">
                          {pos.retrograde ? (
                            <Badge variant="degraded">Rx</Badge>
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
