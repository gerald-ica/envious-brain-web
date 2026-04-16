"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CitySearch } from "@/components/ui/city-search";

// ---------------------------------------------------------------------------
// Synastry
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

// ---- Types ----------------------------------------------------------------

interface SynastryAspect {
  personA: string;
  aspect: string;
  personB: string;
  orb: string;
  nature: string;
  significance: string;
}

interface SynastryResponse {
  compatibility_score?: number;
  overall_theme?: string;
  strengths?: string[];
  challenges?: string[];
  aspects?: Array<{
    person1_planet?: string;
    person2_planet?: string;
    aspect?: string;
    orb?: number | string;
    nature?: string;
    significance?: string;
  }>;
}

type ApiStatus = "loading" | "live" | "fallback";

// ---- Mock data ------------------------------------------------------------

const MOCK_CROSS_ASPECTS: SynastryAspect[] = [
  { personA: "Sun", aspect: "Conjunct", personB: "Venus", orb: "1\u00b012'", nature: "Harmonious", significance: "Very Strong" },
  { personA: "Moon", aspect: "Trine", personB: "Moon", orb: "2\u00b044'", nature: "Harmonious", significance: "Strong" },
  { personA: "Venus", aspect: "Sextile", personB: "Mars", orb: "0\u00b055'", nature: "Harmonious", significance: "Very Strong" },
  { personA: "Mars", aspect: "Square", personB: "Saturn", orb: "3\u00b008'", nature: "Challenging", significance: "Strong" },
  { personA: "Mercury", aspect: "Trine", personB: "Jupiter", orb: "1\u00b032'", nature: "Harmonious", significance: "Moderate" },
  { personA: "Sun", aspect: "Opposition", personB: "Pluto", orb: "2\u00b021'", nature: "Challenging", significance: "Strong" },
  { personA: "Moon", aspect: "Conjunct", personB: "N. Node", orb: "0\u00b045'", nature: "Harmonious", significance: "Very Strong" },
  { personA: "Jupiter", aspect: "Trine", personB: "Sun", orb: "4\u00b003'", nature: "Harmonious", significance: "Moderate" },
  { personA: "Saturn", aspect: "Conjunct", personB: "Moon", orb: "1\u00b018'", nature: "Challenging", significance: "Strong" },
  { personA: "Venus", aspect: "Conjunct", personB: "Ascendant", orb: "0\u00b022'", nature: "Harmonious", significance: "Very Strong" },
];

const MOCK_COMPATIBILITY_SCORE = 78;

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

// ---- Helpers --------------------------------------------------------------

function formatOrb(orb: number | string | undefined): string {
  if (orb == null) return "";
  if (typeof orb === "string") return orb;
  const deg = Math.floor(Math.abs(orb));
  const min = Math.round((Math.abs(orb) - deg) * 60);
  return `${deg}\u00b0${String(min).padStart(2, "0")}'`;
}

const MOCK_ELEMENT_HARMONY = [
  { element: "Fire", personA: 3, personB: 2, harmony: "Good" },
  { element: "Earth", personA: 2, personB: 4, harmony: "Balanced" },
  { element: "Air", personA: 4, personB: 1, harmony: "Tension" },
  { element: "Water", personA: 3, personB: 5, harmony: "Strong" },
];

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "bg-accent-rose",
  Earth: "bg-accent-emerald",
  Air: "bg-accent-blue",
  Water: "bg-accent-purple",
};

const HARMONY_BADGE: Record<string, "healthy" | "info" | "neutral" | "degraded"> = {
  Strong: "healthy",
  Good: "info",
  Balanced: "neutral",
  Tension: "degraded",
};

// ---- Circular gauge component ---------------------------------------------

function CompatibilityGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75
      ? "stroke-accent-emerald"
      : score >= 50
        ? "stroke-accent-amber"
        : "stroke-accent-rose";

  return (
    <div className="relative flex items-center justify-center">
      <svg
        className="h-40 w-40 -rotate-90"
        viewBox="0 0 120 120"
        aria-label={`Compatibility score: ${score}%`}
      >
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          className={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-bold text-text-primary">{score}</span>
        <span className="block text-xs text-text-muted">/ 100</span>
      </div>
    </div>
  );
}

// ---- Page -----------------------------------------------------------------

export default function SynastryPage() {
  const { activeProfile, profiles } = useProfile();

  // Person B can be: a stored profile (by id) or "manual"
  const otherProfiles = profiles.filter((p) => p.id !== activeProfile?.id);
  const [personBMode, setPersonBMode] = useState<"profile" | "manual">(
    otherProfiles.length > 0 ? "profile" : "manual",
  );
  const [personBId, setPersonBId] = useState<string | null>(
    otherProfiles[0]?.id ?? null,
  );

  // Manual Person B inputs
  const [dateB, setDateB] = useState("1992-11-08");
  const [timeB, setTimeB] = useState("09:15");
  const [cityB, setCityB] = useState("Los Angeles, USA");
  const [latB, setLatB] = useState("34.0522");
  const [lonB, setLonB] = useState("-118.2437");

  const [calculated, setCalculated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ApiStatus>("loading");
  const [data, setData] = useState<SynastryResponse | null>(null);

  // Selected Person B profile (when in profile mode)
  const personBProfile = personBId
    ? profiles.find((p) => p.id === personBId)
    : null;

  const fetchSynastry = async () => {
    if (!activeProfile) return;
    setLoading(true);
    setStatus("loading");
    try {
      const person1Time = activeProfile.birthTime || "12:00";
      const person1Datetime = `${activeProfile.birthDate}T${person1Time}:00`;

      let person2Datetime: string;
      let person2Lat: number;
      let person2Lon: number;
      if (personBMode === "profile" && personBProfile) {
        const t = personBProfile.birthTime || "12:00";
        person2Datetime = `${personBProfile.birthDate}T${t}:00`;
        person2Lat = personBProfile.lat;
        person2Lon = personBProfile.lon;
      } else {
        const t = timeB || "12:00";
        person2Datetime = `${dateB}T${t}:00`;
        person2Lat = Number(latB);
        person2Lon = Number(lonB);
      }

      const res = await fetch(`${API_URL}/api/v1/western/synastry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person1_datetime: person1Datetime,
          person1_latitude: activeProfile.lat,
          person1_longitude: activeProfile.lon,
          person2_datetime: person2Datetime,
          person2_latitude: person2Lat,
          person2_longitude: person2Lon,
        }),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const json = (await res.json()) as SynastryResponse;
      setData(json);
      setStatus("live");
      setCalculated(true);
    } catch (err) {
      console.warn("Synastry API unavailable, using sample data:", err);
      setData(null);
      setStatus("fallback");
      setCalculated(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeProfile) return;
    fetchSynastry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile, personBId, personBMode]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to start a synastry comparison.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Synastry for {activeProfile.name}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Relationship compatibility through cross-chart aspect analysis
          </p>
        </div>
        <div className="pt-2">
          <StatusIndicator status={status} />
        </div>
      </div>

      {/* Two Birth Data panels side by side */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        {/* Person A -- activeProfile (locked) */}
        <Card title={`Person A -- ${activeProfile.name}`} glow="blue">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between rounded-lg bg-white/[0.02] px-3 py-2">
              <span className="text-text-muted">Birth Date</span>
              <span className="text-text-primary font-medium">
                {activeProfile.birthDate}
              </span>
            </div>
            <div className="flex justify-between rounded-lg bg-white/[0.02] px-3 py-2">
              <span className="text-text-muted">Birth Time</span>
              <span className="text-text-primary font-medium">
                {activeProfile.birthTime}
              </span>
            </div>
            <div className="flex justify-between rounded-lg bg-white/[0.02] px-3 py-2">
              <span className="text-text-muted">Location</span>
              <span className="text-text-primary font-medium">
                {activeProfile.city}
              </span>
            </div>
            <p className="text-xs text-text-muted pt-1">
              Person A is always your active profile. Change it from Settings.
            </p>
          </div>
        </Card>

        {/* Person B -- profile picker or manual */}
        <Card title="Person B" glow="purple">
          {otherProfiles.length > 0 && (
            <div className="mb-3 flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPersonBMode("profile")}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  personBMode === "profile"
                    ? "bg-accent-purple/20 text-accent-purple"
                    : "bg-white/5 text-text-muted hover:text-text-primary"
                }`}
              >
                Select Profile
              </button>
              <button
                type="button"
                onClick={() => setPersonBMode("manual")}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  personBMode === "manual"
                    ? "bg-accent-purple/20 text-accent-purple"
                    : "bg-white/5 text-text-muted hover:text-text-primary"
                }`}
              >
                Manual Entry
              </button>
            </div>
          )}

          {personBMode === "profile" && otherProfiles.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Choose Profile
              </label>
              <select
                value={personBId ?? ""}
                onChange={(e) => setPersonBId(e.target.value)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
              >
                {otherProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} -- {p.birthDate}
                  </option>
                ))}
              </select>
              {personBProfile && (
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between rounded bg-white/[0.02] px-2 py-1.5">
                    <span className="text-text-muted">Birth</span>
                    <span className="text-text-primary">
                      {personBProfile.birthDate} at {personBProfile.birthTime}
                    </span>
                  </div>
                  <div className="flex justify-between rounded bg-white/[0.02] px-2 py-1.5">
                    <span className="text-text-muted">Location</span>
                    <span className="text-text-primary">{personBProfile.city}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Birth Date"
                type="date"
                value={dateB}
                onChange={(e) => setDateB(e.target.value)}
              />
              <Input
                label="Birth Time"
                type="time"
                value={timeB}
                onChange={(e) => setTimeB(e.target.value)}
              />
              <CitySearch
                label="Birth City"
                value={cityB}
                onChange={(c) => {
                  setCityB(c.name);
                  setLatB(String(c.lat));
                  setLonB(String(c.lon));
                }}
                placeholder="Search for a city..."
              />
            </div>
          )}
        </Card>
      </div>

      <div className="mb-6">
        <Button onClick={fetchSynastry} disabled={loading} className="w-full sm:w-auto">
          {loading ? "Analyzing Compatibility..." : "Compare Charts"}
        </Button>
      </div>

      {calculated && (() => {
        const displayScore = Math.round(data?.compatibility_score ?? MOCK_COMPATIBILITY_SCORE);
        const displayAspects: SynastryAspect[] = data?.aspects?.length
          ? data.aspects.map((a) => ({
              personA: a.person1_planet ?? "-",
              aspect: a.aspect ?? "-",
              personB: a.person2_planet ?? "-",
              orb: formatOrb(a.orb),
              nature: a.nature ?? "Harmonious",
              significance: a.significance ?? "Moderate",
            }))
          : MOCK_CROSS_ASPECTS;
        const matchLabel =
          displayScore >= 75 ? "Strong Match" : displayScore >= 50 ? "Moderate Match" : "Challenging Match";
        return (
        <div className="animate-fade-in space-y-6">
          {data?.overall_theme && (
            <Card title="Overall Theme">
              <p className="text-sm leading-relaxed text-text-secondary">
                {data.overall_theme}
              </p>
            </Card>
          )}

          {/* Compatibility Score + Summary */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="flex flex-col items-center justify-center" glow="blue">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Compatibility Score
              </p>
              <CompatibilityGauge score={displayScore} />
              <div className="mt-4 flex gap-2">
                <Badge variant={displayScore >= 75 ? "healthy" : displayScore >= 50 ? "info" : "degraded"}>
                  {matchLabel}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-text-muted text-center">
                Based on cross-aspect analysis, element balance, and planetary harmony
              </p>
            </Card>

            <Card title="Score Breakdown" className="lg:col-span-2">
              <div className="space-y-4">
                {[
                  { label: "Emotional Connection", score: 85, color: "bg-accent-blue" },
                  { label: "Communication", score: 72, color: "bg-accent-purple" },
                  { label: "Physical Attraction", score: 88, color: "bg-accent-rose" },
                  { label: "Shared Values", score: 65, color: "bg-accent-emerald" },
                  { label: "Long-term Stability", score: 70, color: "bg-accent-amber" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{item.label}</span>
                      <span className="text-sm font-mono text-text-primary">
                        {item.score}%
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-700`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Cross-Aspects Table */}
          <Card title="Cross-Aspects">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 pr-4 font-medium text-text-muted">
                      Person A
                    </th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">
                      Aspect
                    </th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">
                      Person B
                    </th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">Orb</th>
                    <th className="pb-2 font-medium text-text-muted">
                      Significance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayAspects.map((a, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5 pr-4">
                        <span className="text-accent-blue font-medium">
                          {a.personA}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge
                          variant={
                            a.nature === "Harmonious" ? "healthy" : "degraded"
                          }
                        >
                          {a.aspect}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="text-accent-purple font-medium">
                          {a.personB}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-text-muted">
                        {a.orb}
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant={
                            a.significance === "Very Strong"
                              ? "info"
                              : "neutral"
                          }
                        >
                          {a.significance}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Strengths & Challenges (live data only) */}
          {(data?.strengths?.length || data?.challenges?.length) && (
            <div className="grid gap-4 lg:grid-cols-2">
              {data?.strengths && data.strengths.length > 0 && (
                <Card title="Strengths" glow="blue">
                  <ul className="space-y-2">
                    {data.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-text-secondary">
                        <span className="text-accent-emerald">+</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              {data?.challenges && data.challenges.length > 0 && (
                <Card title="Challenges" glow="purple">
                  <ul className="space-y-2">
                    {data.challenges.map((c, i) => (
                      <li key={i} className="flex gap-2 text-sm text-text-secondary">
                        <span className="text-accent-amber">!</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}

          {/* Element Harmony */}
          <Card title="Element Harmony Analysis">
            <div className="grid gap-4 sm:grid-cols-2">
              {MOCK_ELEMENT_HARMONY.map((e) => (
                <div
                  key={e.element}
                  className="rounded-xl border border-border bg-white/[0.02] p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-sm ${ELEMENT_COLORS[e.element]}`}
                      />
                      <span className="text-sm font-semibold text-text-primary">
                        {e.element}
                      </span>
                    </div>
                    <Badge variant={HARMONY_BADGE[e.harmony]}>{e.harmony}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-xs text-accent-blue">
                        Person A
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent-blue"
                          style={{ width: `${(e.personA / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-text-muted w-4 text-right">
                        {e.personA}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-xs text-accent-purple">
                        Person B
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent-purple"
                          style={{ width: `${(e.personB / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-text-muted w-4 text-right">
                        {e.personB}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        );
      })()}
    </div>
  );
}
