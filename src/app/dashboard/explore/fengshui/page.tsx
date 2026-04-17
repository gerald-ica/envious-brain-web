"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Feng Shui — via /api/v1/chinese/fengshui/chart
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

const DIRECTIONS = [
  "North", "South", "East", "West",
  "Northeast", "Northwest", "Southeast", "Southwest",
];

function PalaceCell({
  palace,
}: {
  palace: Record<string, unknown>;
}) {
  const direction = (palace.direction ?? palace.position) as string;
  const star = palace.star as number | string | undefined;
  const meaning = (palace.meaning ?? palace.description) as string | undefined;
  const element = palace.element as string | undefined;

  return (
    <div className="rounded-lg border border-border bg-white/[0.02] p-3 text-center space-y-1">
      <p className="text-xs text-text-muted uppercase">{direction}</p>
      {star !== undefined ? (
        <p className="text-2xl font-bold text-accent-purple">{String(star)}</p>
      ) : null}
      {element ? (
        <Badge variant="info">{element}</Badge>
      ) : null}
      {meaning ? (
        <p className="text-xs text-text-muted mt-1 line-clamp-2">{meaning}</p>
      ) : null}
    </div>
  );
}

export default function FengShuiPage() {
  const { activeProfile } = useProfile();
  const [year, setYear] = useState(() => {
    if (typeof window === "undefined") return 2000;
    return new Date().getFullYear();
  });
  const [facing, setFacing] = useState("South");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (yr: number, dir: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/chinese/fengshui/chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: yr, facing_direction: dir }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Feng Shui chart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Use birth year from profile if available
    const birthYear = activeProfile
      ? parseInt(activeProfile.birthDate.split("-")[0], 10)
      : new Date().getFullYear();
    setYear(birthYear);
    fetchData(birthYear, facing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile]);

  const handleRecalculate = () => {
    fetchData(year, facing);
  };

  const period = data?.period as number | undefined;
  const palaces = data?.palaces as Array<Record<string, unknown>> | undefined;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Feng Shui Flying Stars
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Flying Star chart based on year and facing direction
        </p>
      </div>

      <Card title="Parameters" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3 items-end">
          <Input
            label="Year"
            type="number"
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Facing Direction
            </label>
            <select
              value={facing}
              onChange={(e) => setFacing(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none"
            >
              {DIRECTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
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
          {/* Period info */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card title="Period">
              <p className="text-2xl font-bold text-accent-purple">
                Period {period ?? String(data.period ?? "")}
              </p>
            </Card>
            <Card title="Year">
              <p className="text-2xl font-bold text-text-primary">{data.year as number}</p>
            </Card>
            <Card title="Facing">
              <p className="text-2xl font-bold text-text-primary">
                {data.facing_direction as string}
              </p>
            </Card>
          </div>

          {/* Palaces grid */}
          {palaces && palaces.length > 0 ? (
            <Card title="Flying Star Palaces">
              <div className="grid grid-cols-3 gap-3">
                {palaces.map((p, i) => (
                  <PalaceCell key={i} palace={p} />
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
