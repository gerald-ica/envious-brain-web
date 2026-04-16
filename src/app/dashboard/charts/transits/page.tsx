"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Transits
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

// ---- Types ----------------------------------------------------------------

interface PlanetPosition {
  sign?: string;
  longitude?: number;
  degree?: number;
  speed?: number;
  retrograde?: boolean;
  [k: string]: unknown;
}

interface WesternChartResponse {
  positions?: Record<string, PlanetPosition>;
  [k: string]: unknown;
}

interface TransitAspectApi {
  transit_planet?: string;
  natal_planet?: string;
  aspect?: string;
  orb?: number;
  nature?: string;
  significance?: string;
}

interface TransitsResponse {
  positions?: Record<string, PlanetPosition>;
  aspects?: TransitAspectApi[];
  date?: string;
  [k: string]: unknown;
}

type ApiStatus = "loading" | "live" | "fallback";

interface DisplayTransit {
  planet: string;
  sign: string;
  degree: string;
  speed: string;
  retrograde: boolean;
}

interface DisplayAspect {
  transit: string;
  aspect: string;
  natal: string;
  orb: string;
  significance: string;
  nature: string;
}

// ---- Helpers --------------------------------------------------------------

function formatDeg(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  const norm = ((value % 30) + 30) % 30;
  const d = Math.floor(norm);
  const m = Math.round((norm - d) * 60);
  return `${d}\u00b0${String(m).padStart(2, "0")}'`;
}

function formatOrb(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  const abs = Math.abs(value);
  const d = Math.floor(abs);
  const m = Math.round((abs - d) * 60);
  return `${d}\u00b0${String(m).padStart(2, "0")}'`;
}

function formatSpeed(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  const abs = Math.abs(value);
  const d = Math.floor(abs);
  const m = Math.round((abs - d) * 60);
  return `${d}\u00b0${String(m).padStart(2, "0")}'/day`;
}

function classifySignificance(orb: number | undefined): "high" | "medium" | "low" {
  if (orb == null) return "medium";
  const abs = Math.abs(orb);
  if (abs < 1) return "high";
  if (abs < 3) return "medium";
  return "low";
}

// ---- Status indicator -----------------------------------------------------

function StatusIndicator({ status }: { status: ApiStatus }) {
  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
        <span className="inline-block animate-spin">⟳</span>
        <span>Computing...</span>
      </span>
    );
  }
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-accent-emerald/80">
        <span>✓</span>
        <span>Live data</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
      <span>◦</span>
      <span>Sample view</span>
    </span>
  );
}

// ---- Fallback data --------------------------------------------------------

const MOCK_TRANSITS: DisplayTransit[] = [
  { planet: "Sun", sign: "Aries", degree: "26\u00b014'", speed: "0\u00b059'/day", retrograde: false },
  { planet: "Moon", sign: "Leo", degree: "12\u00b008'", speed: "13\u00b022'/day", retrograde: false },
  { planet: "Mercury", sign: "Aries", degree: "15\u00b041'", speed: "1\u00b048'/day", retrograde: false },
  { planet: "Venus", sign: "Pisces", degree: "28\u00b055'", speed: "1\u00b012'/day", retrograde: false },
  { planet: "Mars", sign: "Cancer", degree: "4\u00b033'", speed: "0\u00b038'/day", retrograde: false },
  { planet: "Jupiter", sign: "Gemini", degree: "22\u00b017'", speed: "0\u00b008'/day", retrograde: false },
  { planet: "Saturn", sign: "Pisces", degree: "24\u00b009'", speed: "0\u00b004'/day", retrograde: true },
  { planet: "Uranus", sign: "Taurus", degree: "29\u00b052'", speed: "0\u00b002'/day", retrograde: false },
  { planet: "Neptune", sign: "Aries", degree: "2\u00b044'", speed: "0\u00b001'/day", retrograde: false },
  { planet: "Pluto", sign: "Aquarius", degree: "4\u00b018'", speed: "0\u00b001'/day", retrograde: true },
];

const MOCK_ASPECTS_TO_NATAL = [
  { transit: "Sun", aspect: "Trine", natal: "Sun", orb: "2\u00b002'", significance: "high", nature: "Harmonious" },
  { transit: "Moon", aspect: "Sextile", natal: "Venus", orb: "0\u00b001'", significance: "high", nature: "Harmonious" },
  { transit: "Mercury", aspect: "Square", natal: "Saturn", orb: "3\u00b018'", significance: "medium", nature: "Challenging" },
  { transit: "Venus", aspect: "Conjunct", natal: "IC", orb: "0\u00b033'", significance: "high", nature: "Harmonious" },
  { transit: "Mars", aspect: "Opposition", natal: "Mercury", orb: "1\u00b000'", significance: "high", nature: "Challenging" },
  { transit: "Jupiter", aspect: "Trine", natal: "Moon", orb: "2\u00b032'", significance: "medium", nature: "Harmonious" },
  { transit: "Saturn (R)", aspect: "Sextile", natal: "Jupiter", orb: "4\u00b014'", significance: "low", nature: "Harmonious" },
  { transit: "Pluto (R)", aspect: "Square", natal: "Mars", orb: "2\u00b027'", significance: "high", nature: "Challenging" },
];

const MOCK_INGRESSES = [
  { planet: "Uranus", from: "Taurus", to: "Gemini", date: "Apr 26, 2026", daysAway: 10 },
  { planet: "Venus", from: "Pisces", to: "Aries", date: "Apr 18, 2026", daysAway: 2 },
  { planet: "Sun", from: "Aries", to: "Taurus", date: "Apr 19, 2026", daysAway: 3 },
  { planet: "Mercury", from: "Aries", to: "Taurus", date: "May 1, 2026", daysAway: 15 },
];

const SIGNIFICANCE_STYLES: Record<string, string> = {
  high: "bg-accent-rose/10 border-accent-rose/30",
  medium: "bg-accent-amber/10 border-accent-amber/30",
  low: "bg-white/[0.02] border-border",
};

const SIGNIFICANCE_BADGE: Record<string, "error" | "degraded" | "neutral"> = {
  high: "error",
  medium: "degraded",
  low: "neutral",
};

// ---- Page -----------------------------------------------------------------

export default function TransitsPage() {
  const { activeProfile } = useProfile();

  const [calculated, setCalculated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [status, setStatus] = useState<ApiStatus>("loading");
  const [transits, setTransits] = useState<TransitsResponse | null>(null);

  const fetchTransits = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    setStatus("loading");
    try {
      // Step 1: fetch natal chart
      const birthTime = activeProfile.birthTime || "12:00";
      const natalRes = await fetch(`${API_URL}/api/v1/charts/western`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: `${activeProfile.birthDate}T${birthTime}:00`,
          latitude: activeProfile.lat,
          longitude: activeProfile.lon,
          timezone: activeProfile.timezone,
        }),
      });
      if (!natalRes.ok) throw new Error(`Natal API ${natalRes.status}`);
      const natal = (await natalRes.json()) as WesternChartResponse;

      // Step 2: fetch current transits against natal positions
      const today = new Date().toISOString().slice(0, 10);
      const transitRes = await fetch(`${API_URL}/api/v1/transits/current`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          natal_positions: natal.positions,
          date: today,
          orbs: null,
        }),
      });
      if (!transitRes.ok) throw new Error(`Transits API ${transitRes.status}`);
      const body = (await transitRes.json()) as TransitsResponse;

      setTransits(body);
      setStatus("live");
      setCalculated(true);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn("Transits API unavailable, using sample data:", err);
      setTransits(null);
      setStatus("fallback");
      setCalculated(true);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [activeProfile]);

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh || !calculated) return;
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, calculated]);

  useEffect(() => {
    if (!activeProfile) return;
    fetchTransits();
  }, [activeProfile, fetchTransits]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view transits against your natal chart.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Transits for {activeProfile.name} -- Today
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {today} -- current planetary positions and aspects to your natal chart
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusIndicator status={status} />
          {calculated && (
            <>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    autoRefresh ? "bg-accent-emerald pulse-dot" : "bg-text-muted"
                  }`}
                />
                <span className="text-xs text-text-muted">
                  {autoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="text-xs"
              >
                {autoRefresh ? "Pause" : "Resume"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Natal Reference Card */}
      <Card title="Natal Reference" className="mb-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-white/[0.02] px-4 py-3">
            <p className="text-xs text-text-muted">Birth Date</p>
            <p className="text-sm font-medium text-text-primary">
              {activeProfile.birthDate}
            </p>
          </div>
          <div className="rounded-lg bg-white/[0.02] px-4 py-3">
            <p className="text-xs text-text-muted">Birth Time</p>
            <p className="text-sm font-medium text-text-primary">
              {activeProfile.birthTime}
            </p>
          </div>
          <div className="rounded-lg bg-white/[0.02] px-4 py-3">
            <p className="text-xs text-text-muted">Location</p>
            <p className="text-sm font-medium text-text-primary">
              {activeProfile.city}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={fetchTransits} disabled={loading}>
            {loading ? "Loading..." : "Refresh Transits"}
          </Button>
        </div>
      </Card>

      {calculated && (() => {
        const livePositions = transits?.positions;
        const displayTransits: DisplayTransit[] = livePositions
          ? Object.entries(livePositions).map(([planet, p]) => ({
              planet,
              sign: p.sign ?? "-",
              degree: formatDeg(p.degree ?? p.longitude),
              speed: formatSpeed(p.speed),
              retrograde: Boolean(p.retrograde),
            }))
          : MOCK_TRANSITS;

        const displayAspects: DisplayAspect[] = transits?.aspects?.length
          ? transits.aspects.map((a) => ({
              transit: a.transit_planet ?? "-",
              aspect: a.aspect ?? "-",
              natal: a.natal_planet ?? "-",
              orb: formatOrb(a.orb),
              significance: a.significance ?? classifySignificance(a.orb),
              nature: a.nature ?? "Harmonious",
            }))
          : MOCK_ASPECTS_TO_NATAL;

        return (
        <div className="animate-fade-in space-y-6">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>

          <Card title="Current Planetary Positions">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 pr-4 font-medium text-text-muted">Planet</th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">Sign</th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">Degree</th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">Speed</th>
                    <th className="pb-2 font-medium text-text-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTransits.map((t) => (
                    <tr
                      key={t.planet}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5 pr-4 font-medium text-text-primary">
                        {t.planet}
                      </td>
                      <td className="py-2.5 pr-4 text-text-secondary">{t.sign}</td>
                      <td className="py-2.5 pr-4 font-mono text-text-secondary">
                        {t.degree}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-text-muted">
                        {t.speed}
                      </td>
                      <td className="py-2.5">
                        {t.retrograde ? (
                          <Badge variant="degraded">Retrograde</Badge>
                        ) : (
                          <Badge variant="healthy">Direct</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Aspects to Natal Chart">
            <div className="space-y-2">
              {displayAspects.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 ${SIGNIFICANCE_STYLES[a.significance] ?? SIGNIFICANCE_STYLES.low}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text-primary min-w-[80px]">
                      {a.transit}
                    </span>
                    <Badge
                      variant={a.nature === "Harmonious" ? "healthy" : "degraded"}
                    >
                      {a.aspect}
                    </Badge>
                    <span className="text-sm text-text-secondary">
                      natal {a.natal}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-text-muted">
                      {a.orb}
                    </span>
                    <Badge variant={SIGNIFICANCE_BADGE[a.significance] ?? "neutral"}>
                      {a.significance}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Upcoming Ingresses">
              <div className="space-y-3">
                {MOCK_INGRESSES.map((ing) => (
                  <div
                    key={`${ing.planet}-${ing.to}`}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {ing.planet} enters {ing.to}
                      </p>
                      <p className="text-xs text-text-muted">
                        Leaving {ing.from}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-text-secondary">{ing.date}</p>
                      <p className="text-xs text-accent-blue">
                        {ing.daysAway} day{ing.daysAway !== 1 ? "s" : ""} away
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Retrograde Status">
              <div className="space-y-2">
                {displayTransits.map((t) => (
                  <div
                    key={t.planet}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-2.5"
                  >
                    <span className="text-sm text-text-primary">{t.planet}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          t.retrograde ? "bg-accent-rose" : "bg-accent-emerald"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          t.retrograde ? "text-accent-rose" : "text-accent-emerald"
                        }`}
                      >
                        {t.retrograde ? "Retrograde" : "Direct"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
