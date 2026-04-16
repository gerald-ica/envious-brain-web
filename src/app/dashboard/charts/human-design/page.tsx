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
// Human Design
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

// ---- Mock data ------------------------------------------------------------

const MOCK_OVERVIEW = {
  type: "Manifesting Generator",
  strategy: "To Respond",
  authority: "Sacral Authority",
  profile: "5/2",
  profileName: "Heretic / Hermit",
  definition: "Split Definition",
  incarnationCross: "Right Angle Cross of Planning (37/40 | 9/16)",
  notSelfTheme: "Frustration & Anger",
  signature: "Satisfaction & Peace",
};

interface Center {
  name: string;
  defined: boolean;
  color: string;
  description: string;
}

const MOCK_CENTERS: Center[] = [
  { name: "Head", defined: true, color: "bg-amber-400", description: "Inspiration & mental pressure" },
  { name: "Ajna", defined: false, color: "bg-emerald-400", description: "Conceptualization & analysis" },
  { name: "Throat", defined: true, color: "bg-amber-600", description: "Communication & manifestation" },
  { name: "G / Self", defined: true, color: "bg-amber-300", description: "Identity, direction & love" },
  { name: "Heart / Will", defined: false, color: "bg-red-400", description: "Willpower & ego" },
  { name: "Sacral", defined: true, color: "bg-red-500", description: "Life force & sexuality" },
  { name: "Spleen", defined: true, color: "bg-amber-700", description: "Intuition, health & survival" },
  { name: "Solar Plexus", defined: false, color: "bg-amber-500", description: "Emotions & feelings" },
  { name: "Root", defined: true, color: "bg-amber-600", description: "Adrenaline & stress" },
];

const MOCK_GATES = [
  { gate: 1, name: "Self-Expression", center: "G", line: 4 },
  { gate: 5, name: "Fixed Patterns", center: "Sacral", line: 2 },
  { gate: 9, name: "Focus", center: "Sacral", line: 1 },
  { gate: 10, name: "Self-Love", center: "G", line: 5 },
  { gate: 16, name: "Skills", center: "Throat", line: 3 },
  { gate: 20, name: "Contemplation", center: "Throat", line: 2 },
  { gate: 26, name: "The Taming Power", center: "Heart", line: 4 },
  { gate: 34, name: "Power", center: "Sacral", line: 5 },
  { gate: 37, name: "Friendship", center: "Solar Plexus", line: 1 },
  { gate: 40, name: "Deliverance", center: "Heart", line: 6 },
  { gate: 46, name: "Determination", center: "G", line: 2 },
  { gate: 48, name: "Depth", center: "Spleen", line: 5 },
  { gate: 51, name: "Shock", center: "Heart", line: 1 },
  { gate: 57, name: "Intuitive Insight", center: "Spleen", line: 3 },
];

const MOCK_CHANNELS = [
  { channel: "20-34", name: "Charisma", from: "Throat", to: "Sacral", type: "Generated" },
  { channel: "10-20", name: "Awakening", from: "G", to: "Throat", type: "Projected" },
  { channel: "37-40", name: "Community", from: "Solar Plexus", to: "Heart", type: "Projected" },
  { channel: "9-16", name: "Logical", from: "Sacral", to: "Throat", type: "Generated" },
  { channel: "48-57", name: "The Wavelength", from: "Spleen", to: "Spleen", type: "Projected" },
];

// ---- Page -----------------------------------------------------------------

export default function HumanDesignPage() {
  const { activeProfile } = useProfile();

  const [birthDate, setBirthDate] = useState(activeProfile?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(activeProfile?.birthTime ?? "");
  const [city, setCity] = useState(activeProfile?.city ?? "");
  const [latitude, setLatitude] = useState(
    activeProfile ? String(activeProfile.lat) : "",
  );
  const [longitude, setLongitude] = useState(
    activeProfile ? String(activeProfile.lon) : "",
  );
  const [timezone, setTimezone] = useState(activeProfile?.timezone ?? "UTC");

  const [calculated, setCalculated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const fetchChart = async (
    date: string,
    time: string,
    lat: number,
    lon: number,
    tz: string,
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/charts/human-design`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: `${date}T${time}:00`,
          latitude: lat,
          longitude: lon,
          timezone: tz,
        }),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      setUsedFallback(false);
      setCalculated(true);
    } catch (err) {
      console.warn("Human Design API unavailable, using sample data:", err);
      setUsedFallback(true);
      setCalculated(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeProfile) return;
    setBirthDate(activeProfile.birthDate);
    setBirthTime(activeProfile.birthTime);
    setCity(activeProfile.city);
    setLatitude(String(activeProfile.lat));
    setLongitude(String(activeProfile.lon));
    setTimezone(activeProfile.timezone);
    fetchChart(
      activeProfile.birthDate,
      activeProfile.birthTime,
      activeProfile.lat,
      activeProfile.lon,
      activeProfile.timezone,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile]);

  const handleCalculate = () => {
    fetchChart(
      birthDate,
      birthTime,
      Number(latitude),
      Number(longitude),
      timezone,
    );
  };

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view your Human Design chart.
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Human Design for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Your energetic blueprint for living in alignment
        </p>
      </div>

      {usedFallback && (
        <div className="mb-4 rounded-lg border border-accent-amber/30 bg-accent-amber/10 px-4 py-2.5 text-sm text-accent-amber">
          Sample data shown -- API unavailable
        </div>
      )}

      {/* Birth Data Form */}
      <Card title="Birth Data" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Birth Date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
          <Input
            label="Birth Time"
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
          />
          <CitySearch
            label="Birth City"
            value={city}
            onChange={(c) => {
              setCity(c.name);
              setLatitude(String(c.lat));
              setLongitude(String(c.lon));
            }}
            placeholder="Search for a city..."
          />
          <div className="flex items-end">
            <Button onClick={handleCalculate} disabled={loading} className="w-full">
              {loading ? "Calculating..." : "Regenerate Chart"}
            </Button>
          </div>
        </div>
      </Card>

      {calculated && (
        <div className="animate-fade-in space-y-6">
          {/* Type / Strategy / Authority Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card glow="blue">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Type
              </p>
              <p className="text-lg font-bold text-accent-blue">
                {MOCK_OVERVIEW.type}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Signature: {MOCK_OVERVIEW.signature}
              </p>
            </Card>

            <Card glow="purple">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Strategy
              </p>
              <p className="text-lg font-bold text-accent-purple">
                {MOCK_OVERVIEW.strategy}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Not-Self: {MOCK_OVERVIEW.notSelfTheme}
              </p>
            </Card>

            <Card>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Authority
              </p>
              <p className="text-lg font-bold text-accent-emerald">
                {MOCK_OVERVIEW.authority}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {MOCK_OVERVIEW.definition}
              </p>
            </Card>

            <Card>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Profile
              </p>
              <p className="text-lg font-bold text-accent-amber">
                {MOCK_OVERVIEW.profile}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {MOCK_OVERVIEW.profileName}
              </p>
            </Card>
          </div>

          {/* Incarnation Cross */}
          <Card title="Incarnation Cross">
            <p className="text-sm font-medium text-text-primary">
              {MOCK_OVERVIEW.incarnationCross}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Your Incarnation Cross represents your life purpose. The Right Angle Cross of Planning
              speaks to a life dedicated to creating structures and systems that support community
              well-being. Your energy is designed to bring order and ensure resources are properly managed.
            </p>
          </Card>

          {/* 9 Centers Grid */}
          <Card title="Energy Centers">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_CENTERS.map((center) => (
                <div
                  key={center.name}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 ${
                    center.defined
                      ? "border-accent-amber/30 bg-accent-amber/5"
                      : "border-border bg-white/[0.02]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      center.defined
                        ? `${center.color} text-white`
                        : "bg-white/10 text-text-muted"
                    }`}
                  >
                    <span className="text-xs font-bold">
                      {center.defined ? "DEF" : "UND"}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {center.name}
                      </span>
                      <Badge variant={center.defined ? "healthy" : "neutral"}>
                        {center.defined ? "Defined" : "Open"}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted truncate">
                      {center.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-accent-amber" />
                Defined (consistent energy)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-white/10" />
                Open (receptive / amplifying)
              </span>
            </div>
          </Card>

          {/* Gates + Channels */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Active Gates">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-3 font-medium text-text-muted">Gate</th>
                      <th className="pb-2 pr-3 font-medium text-text-muted">Name</th>
                      <th className="pb-2 pr-3 font-medium text-text-muted">Center</th>
                      <th className="pb-2 font-medium text-text-muted">Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_GATES.map((g) => (
                      <tr
                        key={g.gate}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-2 pr-3">
                          <span className="inline-flex h-6 w-8 items-center justify-center rounded bg-accent-blue/10 text-xs font-bold text-accent-blue">
                            {g.gate}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-text-primary">
                          {g.name}
                        </td>
                        <td className="py-2 pr-3 text-text-secondary">
                          {g.center}
                        </td>
                        <td className="py-2 font-mono text-text-muted">
                          {g.line}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Active Channels">
              <div className="space-y-3">
                {MOCK_CHANNELS.map((ch) => (
                  <div
                    key={ch.channel}
                    className="flex items-center justify-between rounded-xl border border-border bg-white/[0.02] p-3.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-accent-blue">
                          {ch.channel}
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {ch.name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {ch.from} {"\u2192"} {ch.to}
                      </p>
                    </div>
                    <Badge variant={ch.type === "Generated" ? "healthy" : "info"}>
                      {ch.type}
                    </Badge>
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
