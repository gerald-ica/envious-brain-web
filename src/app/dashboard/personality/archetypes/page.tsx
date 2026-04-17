"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Jungian Archetypes — first get chart for signs, then call archetypes API
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

function StrengthBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-xs text-text-muted truncate">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-accent-purple" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-mono text-text-secondary">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

export default function ArchetypesPage() {
  const { activeProfile } = useProfile();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Step 1: Get western chart for Sun/Moon/Ascendant signs
        const datetime = `${activeProfile.birthDate}T${activeProfile.birthTime}:00`;
        const chartRes = await fetch(`${API_URL}/api/v1/charts/western`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            datetime,
            latitude: activeProfile.lat,
            longitude: activeProfile.lon,
            timezone: activeProfile.timezone,
          }),
        });

        let sunSign = "Aries";
        let moonSign = "Aries";
        let ascSign = "Aries";

        if (chartRes.ok) {
          const chart = await chartRes.json();
          const positions = chart.positions as Record<string, Record<string, string>> | undefined;
          if (positions) {
            sunSign = positions.Sun?.sign ?? sunSign;
            moonSign = positions.Moon?.sign ?? moonSign;
            // Ascendant from house 1
            const houses = chart.houses as Array<Record<string, unknown>> | undefined;
            if (houses && houses[0]) {
              ascSign = (houses[0].sign as string) ?? ascSign;
            }
          }
        }

        // Step 2: Get archetypes
        const archRes = await fetch(`${API_URL}/api/v1/psychology/jungian-archetypes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sun_sign: sunSign,
            moon_sign: moonSign,
            ascendant: ascSign,
          }),
        });
        if (!archRes.ok) throw new Error(`Archetypes API error: ${archRes.status}`);
        setData(await archRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load archetypes");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeProfile]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to discover your Jungian archetypes.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const primary = data?.primary as string | undefined;
  const secondary = data?.secondary as string | undefined;
  const shadow = data?.shadow as string | undefined;
  const scores = data?.scores as Record<string, number> | undefined;
  const orientation = data?.orientation as string | undefined;
  const growthPath = data?.growth_path as string[] | undefined;

  const maxScore = scores ? Math.max(...Object.values(scores), 1) : 1;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Jungian Archetypes for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Archetypal patterns derived from your natal chart
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
          {/* Primary / Secondary / Shadow */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card title="Primary Archetype" glow="purple">
              <p className="text-2xl font-bold text-accent-purple">{primary ?? "--"}</p>
              {orientation ? (
                <Badge variant="info" className="mt-2">{orientation}</Badge>
              ) : null}
            </Card>
            <Card title="Secondary Archetype">
              <p className="text-2xl font-bold text-text-primary">{secondary ?? "--"}</p>
            </Card>
            <Card title="Shadow Archetype">
              <p className="text-2xl font-bold text-accent-rose">{shadow ?? "--"}</p>
            </Card>
          </div>

          {/* Scores */}
          {scores && (
            <Card title="Archetype Scores">
              <div className="space-y-3">
                {Object.entries(scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([archetype, score]) => (
                    <StrengthBar
                      key={archetype}
                      label={archetype}
                      value={score}
                      max={maxScore}
                    />
                  ))}
              </div>
            </Card>
          )}

          {/* Growth path */}
          {growthPath && growthPath.length > 0 ? (
            <Card title="Growth Path">
              <div className="space-y-3">
                {growthPath.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-emerald/15 text-xs font-bold text-accent-emerald">
                      {i + 1}
                    </span>
                    <p className="text-sm text-text-secondary">{step}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
