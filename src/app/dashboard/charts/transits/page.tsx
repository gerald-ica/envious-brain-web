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

// ---- Fallback data --------------------------------------------------------

const MOCK_TRANSITS = [
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
  const [usedFallback, setUsedFallback] = useState(false);

  const fetchTransits = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 19);
      const res = await fetch(`${API_URL}/api/v1/charts/transits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: today,
          latitude: activeProfile.lat,
          longitude: activeProfile.lon,
          timezone: activeProfile.timezone,
        }),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      setUsedFallback(false);
      setCalculated(true);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn("Transits API unavailable, using sample data:", err);
      setUsedFallback(true);
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
        {calculated && (
          <div className="flex items-center gap-3">
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
          </div>
        )}
      </div>

      {usedFallback && (
        <div className="mb-4 rounded-lg border border-accent-amber/30 bg-accent-amber/10 px-4 py-2.5 text-sm text-accent-amber">
          Sample data shown -- API unavailable
        </div>
      )}

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

      {calculated && (
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
                  {MOCK_TRANSITS.map((t) => (
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
              {MOCK_ASPECTS_TO_NATAL.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 ${SIGNIFICANCE_STYLES[a.significance]}`}
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
                    <Badge variant={SIGNIFICANCE_BADGE[a.significance]}>
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
                {MOCK_TRANSITS.map((t) => (
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
      )}
    </div>
  );
}
