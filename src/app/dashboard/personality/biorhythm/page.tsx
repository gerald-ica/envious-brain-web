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
// Biorhythm — via /api/v1/personality/biorhythm
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-662458014068.us-central1.run.app";

const CYCLE_COLORS: Record<string, string> = {
  physical: "bg-accent-rose",
  emotional: "bg-accent-blue",
  intellectual: "bg-accent-emerald",
  intuitive: "bg-accent-purple",
};

const CYCLE_TEXT: Record<string, string> = {
  physical: "text-accent-rose",
  emotional: "text-accent-blue",
  intellectual: "text-accent-emerald",
  intuitive: "text-accent-purple",
};

export default function BiorhythmPage() {
  const { activeProfile } = useProfile();
  const [targetDate, setTargetDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (birthDate: string, target: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/personality/biorhythm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birth_date: birthDate, target_date: target }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load biorhythm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeProfile) return;
    fetchData(activeProfile.birthDate, targetDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile]);

  const handleRecalculate = () => {
    if (!activeProfile) return;
    fetchData(activeProfile.birthDate, targetDate);
  };

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view your biorhythm cycles.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // The response shape varies — extract cycles if present
  const cycles = (data?.cycles ?? data?.biorhythm ?? data) as Record<string, unknown> | null;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Biorhythm for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Physical, emotional, intellectual, and intuitive cycles
        </p>
      </div>

      <Card title="Target Date" className="mb-6">
        <div className="flex items-end gap-4">
          <Input
            label="Date"
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
          {/* Cycle values as bars */}
          <Card title="Current Cycle Values">
            <div className="space-y-4">
              {cycles && typeof cycles === "object"
                ? Object.entries(cycles)
                    .filter(([, v]) => typeof v === "number" || (typeof v === "object" && v !== null))
                    .map(([name, value]) => {
                      // Handle both flat (physical: 0.85) and nested (physical: {value: 0.85, ...})
                      const numVal =
                        typeof value === "number"
                          ? value
                          : typeof value === "object" && value !== null
                            ? ((value as Record<string, unknown>).value as number) ??
                              ((value as Record<string, unknown>).percentage as number) ??
                              0
                            : 0;
                      const pct = Math.round(numVal * (Math.abs(numVal) <= 1 ? 100 : 1));
                      const isPositive = pct >= 0;
                      const barColor = CYCLE_COLORS[name.toLowerCase()] ?? "bg-accent-blue";
                      const textColor = CYCLE_TEXT[name.toLowerCase()] ?? "text-accent-blue";

                      return (
                        <div key={name} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium capitalize ${textColor}`}>
                              {name.replace(/_/g, " ")}
                            </span>
                            <Badge variant={isPositive ? "healthy" : "degraded"}>
                              {pct > 0 ? "+" : ""}{pct}%
                            </Badge>
                          </div>
                          <div className="flex h-3 items-center">
                            <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden relative">
                              {/* Center marker */}
                              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
                              {isPositive ? (
                                <div
                                  className={`absolute left-1/2 h-full rounded-r-full ${barColor}`}
                                  style={{ width: `${Math.abs(pct) / 2}%` }}
                                />
                              ) : (
                                <div
                                  className={`absolute h-full rounded-l-full ${barColor}`}
                                  style={{
                                    width: `${Math.abs(pct) / 2}%`,
                                    right: "50%",
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                : null}
            </div>
          </Card>

          {/* Raw data fallback */}
          <Card title="Full Response">
            <pre className="overflow-x-auto text-xs text-text-secondary whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}
