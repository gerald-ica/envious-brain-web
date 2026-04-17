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
// Harmonic Chart Analysis — wired to POST /api/v1/western/harmonics
// ---------------------------------------------------------------------------

const HARMONIC_OPTIONS = [2, 3, 4, 5, 7, 9, 12] as const;

const HARMONIC_LABELS: Record<number, { label: string; theme: string }> = {
  2: { label: "Opposition", theme: "Duality and inner conflict" },
  3: { label: "Trine (Joy)", theme: "Talent, ease, and pleasure" },
  4: { label: "Square (Effort)", theme: "Challenge and manifestation" },
  5: { label: "Quintile (Creative Power)", theme: "Creative genius and style" },
  7: { label: "Septile (Inspiration)", theme: "Mysticism and divine inspiration" },
  9: { label: "Novile (Spiritual Purpose)", theme: "Spiritual joy and purpose" },
  12: { label: "Twelfth (Hidden Pattern)", theme: "Karma and hidden forces" },
};

function formatDegree(deg: number | undefined): string {
  if (deg == null || Number.isNaN(deg)) return "";
  const norm = ((deg % 360) + 360) % 360;
  const sign = Math.floor(norm / 30);
  const d = Math.floor(norm % 30);
  const m = Math.round((norm % 1) * 60);
  const signs = [
    "Ari", "Tau", "Gem", "Can", "Leo", "Vir",
    "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis",
  ];
  return `${d}\u00b0${String(m).padStart(2, "0")}' ${signs[sign]}`;
}

export default function HarmonicsPage() {
  const { activeProfile } = useProfile();
  const [selectedHarmonic, setSelectedHarmonic] = useState<number>(7);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHarmonic = (birth: BirthData, harmonic: number) => {
    setLoading(true);
    setError(null);
    api.charts
      .harmonics(birth, harmonic)
      .then((res) => setData(res.data as unknown as Record<string, unknown>))
      .catch((err) => {
        console.error("Harmonics API error:", err);
        const status = (err as { status?: number }).status;
        if (status === 404) {
          setError("Harmonic chart endpoint is not yet deployed.");
        } else if (status === 422) {
          setError("Invalid request — check your birth profile data.");
        } else {
          setError("Failed to load harmonic chart. Check API connection.");
        }
      })
      .finally(() => setLoading(false));
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
    fetchHarmonic(birth, selectedHarmonic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile]);

  const handleSelect = (h: number) => {
    setSelectedHarmonic(h);
    if (!activeProfile) return;
    const birth: BirthData = {
      date: activeProfile.birthDate,
      time: activeProfile.birthTime,
      latitude: activeProfile.lat,
      longitude: activeProfile.lon,
      timezone: activeProfile.timezone,
    };
    fetchHarmonic(birth, h);
  };

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view your harmonic chart analysis.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const positions = data?.positions as Record<string, Record<string, unknown>> | undefined;
  const aspects = data?.aspects as Array<Record<string, unknown>> | undefined;
  const interpretation = data?.interpretation as string | undefined;
  const info = HARMONIC_LABELS[selectedHarmonic];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary">
            Harmonic Analysis for {activeProfile.name}
          </h1>
          <Badge variant="info">Advanced</Badge>
        </div>
        <p className="mt-1 text-sm text-text-muted max-w-3xl">
          Harmonic charts reveal hidden patterns by multiplying all planetary
          positions by a whole number. Each harmonic unlocks a different
          dimension of experience.
        </p>
      </div>

      {/* Harmonic Selector */}
      <Card title="Select Harmonic" className="mb-6">
        <div className="flex flex-wrap gap-2">
          {HARMONIC_OPTIONS.map((h) => (
            <button
              key={h}
              onClick={() => handleSelect(h)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedHarmonic === h
                  ? "bg-accent-blue text-white"
                  : "bg-white/[0.04] text-text-secondary hover:bg-white/[0.08]"
              }`}
            >
              H{h}
              <span className="ml-1.5 text-xs opacity-75">
                {HARMONIC_LABELS[h]?.label}
              </span>
            </button>
          ))}
        </div>
        {info && (
          <p className="mt-3 text-xs text-text-muted">{info.theme}</p>
        )}
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
          {/* Interpretation */}
          {interpretation && (
            <Card title={`H${selectedHarmonic} Interpretation`} glow="purple">
              <p className="text-sm leading-relaxed text-text-secondary">
                {interpretation}
              </p>
            </Card>
          )}

          {/* Positions Table */}
          {positions && Object.keys(positions).length > 0 && (
            <Card title="Harmonic Positions">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Longitude</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Sign</th>
                      <th className="pb-2 font-medium text-text-muted">Degree in Sign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(positions).map(([planet, pos]) => (
                      <tr key={planet} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-text-primary">{planet}</td>
                        <td className="py-2.5 pr-4 font-mono text-xs text-text-secondary">
                          {typeof pos.longitude === "number"
                            ? formatDegree(pos.longitude)
                            : String(pos.longitude ?? "")}
                        </td>
                        <td className="py-2.5 pr-4 text-text-secondary">
                          {(pos.sign as string) ?? ""}
                        </td>
                        <td className="py-2.5 font-mono text-xs text-accent-blue">
                          {typeof pos.degree_in_sign === "number"
                            ? `${Math.floor(pos.degree_in_sign)}\u00b0${String(Math.round((pos.degree_in_sign % 1) * 60)).padStart(2, "0")}'`
                            : String(pos.degree_in_sign ?? "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Aspects */}
          {aspects && aspects.length > 0 && (
            <Card title="Harmonic Aspects">
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
                        <td className="py-2.5 pr-4 text-text-primary">
                          {(a.planet1 ?? a.planet_1) as string}
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge variant="info">
                            {(a.aspect ?? a.aspect_type ?? a.type) as string}
                          </Badge>
                        </td>
                        <td className="py-2.5 pr-4 text-text-primary">
                          {(a.planet2 ?? a.planet_2) as string}
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

          {/* Fallback JSON */}
          {!positions && !aspects && !interpretation && (
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
