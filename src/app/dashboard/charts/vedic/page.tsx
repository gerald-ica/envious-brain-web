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
// Vedic Astrology (Jyotish)
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

// ---- Types ----------------------------------------------------------------

interface VedicPlanet {
  sign?: string;
  longitude?: number;
  degree?: number;
  nakshatra?: string;
  pada?: number;
  nakshatra_lord?: string;
  lord?: string;
  retrograde?: boolean;
}

interface NakshatraInfo {
  name?: string;
  lord?: string;
  deity?: string;
  symbol?: string;
  nature?: string;
  gana?: string;
  dosha?: string;
  description?: string;
}

interface DashaSubPeriod {
  planet?: string;
  start?: string;
  end?: string;
  active?: boolean;
}

interface DashaInfo {
  current?: string;
  start_date?: string;
  end_date?: string;
  sub_periods?: DashaSubPeriod[];
}

interface VedicResponse {
  positions?: Record<string, VedicPlanet>;
  nakshatra?: NakshatraInfo;
  dashas?: DashaInfo;
  ayanamsa?: string | number;
  [k: string]: unknown;
}

type ApiStatus = "loading" | "live" | "fallback";

// ---- Helpers --------------------------------------------------------------

function formatDegV(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  const norm = ((value % 30) + 30) % 30;
  const d = Math.floor(norm);
  const m = Math.round((norm - d) * 60);
  return `${d}\u00b0${String(m).padStart(2, "0")}'`;
}

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

const MOCK_RASHI = [
  { planet: "Sun", sign: "Taurus", degree: "0\u00b048'", nakshatra: "Krittika", pada: 2, lord: "Venus" },
  { planet: "Moon", sign: "Libra", degree: "14\u00b021'", nakshatra: "Swati", pada: 3, lord: "Venus" },
  { planet: "Mercury", sign: "Taurus", degree: "8\u00b012'", nakshatra: "Krittika", pada: 4, lord: "Venus" },
  { planet: "Venus", sign: "Aries", degree: "24\u00b033'", nakshatra: "Bharani", pada: 4, lord: "Mars" },
  { planet: "Mars", sign: "Cancer", degree: "17\u00b028'", nakshatra: "Ashlesha", pada: 1, lord: "Moon" },
  { planet: "Jupiter", sign: "Virgo", degree: "11\u00b005'", nakshatra: "Hasta", pada: 2, lord: "Mercury" },
  { planet: "Saturn (R)", sign: "Sagittarius", degree: "28\u00b017'", nakshatra: "Uttara Ashadha", pada: 1, lord: "Jupiter" },
  { planet: "Rahu", sign: "Capricorn", degree: "9\u00b046'", nakshatra: "Uttara Ashadha", pada: 3, lord: "Saturn" },
  { planet: "Ketu", sign: "Cancer", degree: "9\u00b046'", nakshatra: "Pushya", pada: 1, lord: "Moon" },
];

const MOCK_NAKSHATRA = {
  moon: "Swati",
  lord: "Rahu",
  deity: "Vayu (Wind God)",
  symbol: "Young sprout blown by the wind",
  nature: "Deva (Divine)",
  gana: "Deva",
  dosha: "Kapha",
  description:
    "Swati nakshatra bestows independence, flexibility, and a restless spirit. Like a young plant swaying in the wind, natives of this nakshatra are adaptable yet strong-rooted. Ruled by Rahu, there is a drive toward worldly accomplishment and material mastery.",
};

const MOCK_DASHA = {
  current: "Rahu Mahadasha",
  startDate: "2021-03-15",
  endDate: "2039-03-15",
  subPeriods: [
    { planet: "Rahu-Rahu", start: "2021-03", end: "2023-12", active: false },
    { planet: "Rahu-Jupiter", start: "2023-12", end: "2026-05", active: true },
    { planet: "Rahu-Saturn", start: "2026-05", end: "2029-03", active: false },
    { planet: "Rahu-Mercury", start: "2029-03", end: "2031-09", active: false },
    { planet: "Rahu-Ketu", start: "2031-09", end: "2032-10", active: false },
    { planet: "Rahu-Venus", start: "2032-10", end: "2035-10", active: false },
    { planet: "Rahu-Sun", start: "2035-10", end: "2036-09", active: false },
    { planet: "Rahu-Moon", start: "2036-09", end: "2038-03", active: false },
    { planet: "Rahu-Mars", start: "2038-03", end: "2039-03", active: false },
  ],
};

const MOCK_YOGAS = [
  {
    name: "Gaja Kesari Yoga",
    planets: "Jupiter + Moon",
    description: "Formed when Jupiter is in a Kendra from the Moon. Bestows wisdom, fame, and lasting reputation.",
    strength: "Strong",
  },
  {
    name: "Budha-Aditya Yoga",
    planets: "Sun + Mercury",
    description: "Sun and Mercury in the same sign grant intelligence, communication skills, and analytical ability.",
    strength: "Strong",
  },
  {
    name: "Chandra-Mangal Yoga",
    planets: "Moon + Mars",
    description: "Moon and Mars in mutual aspect creates financial prosperity and earning capability through effort.",
    strength: "Moderate",
  },
  {
    name: "Viparita Raja Yoga",
    planets: "6th/8th/12th Lords",
    description: "Lords of dusthana houses in mutual exchange can turn adversity into unexpected success and gain.",
    strength: "Moderate",
  },
  {
    name: "Saraswati Yoga",
    planets: "Jupiter + Venus + Mercury",
    description: "Formed by benefics in kendras/trikonas. Grants learning, eloquence, and mastery of arts and sciences.",
    strength: "Weak",
  },
];

// ---- Page -----------------------------------------------------------------

export default function VedicPage() {
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
  const [status, setStatus] = useState<ApiStatus>("loading");
  const [data, setData] = useState<VedicResponse | null>(null);

  const fetchChart = async (
    date: string,
    time: string,
    lat: number,
    lon: number,
    tz: string,
  ) => {
    setLoading(true);
    setStatus("loading");
    try {
      const t = time || "12:00";
      const res = await fetch(`${API_URL}/api/v1/vedic/chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: `${date}T${t}:00`,
          latitude: lat,
          longitude: lon,
          timezone: tz,
          ayanamsa: "lahiri",
        }),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const json = (await res.json()) as VedicResponse;
      setData(json);
      setStatus("live");
      setCalculated(true);
    } catch (err) {
      console.warn("Vedic API unavailable, using sample data:", err);
      setData(null);
      setStatus("fallback");
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
            Create a birth profile to view your Vedic chart.
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
            Vedic Chart for {activeProfile.name}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Jyotish -- sidereal zodiac with Lahiri ayanamsha
          </p>
        </div>
        <div className="pt-2">
          <StatusIndicator status={status} />
        </div>
      </div>

      {/* Birth Data */}
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
              {loading ? "Calculating..." : "Recalculate"}
            </Button>
          </div>
        </div>
      </Card>

      {calculated && (() => {
        const livePositions = data?.positions;
        const rashi = livePositions
          ? Object.entries(livePositions).map(([planet, p]) => ({
              planet: p.retrograde ? `${planet} (R)` : planet,
              sign: p.sign ?? "-",
              degree: formatDegV(p.degree ?? p.longitude),
              nakshatra: p.nakshatra ?? "-",
              pada: p.pada ?? "-",
              lord: p.nakshatra_lord ?? p.lord ?? "-",
            }))
          : MOCK_RASHI;
        const nak = data?.nakshatra ?? null;
        const dasha = data?.dashas ?? null;

        return (
        <div className="animate-fade-in space-y-6">
          {/* Rashi Positions */}
          <Card title="Rashi Positions (Sidereal)">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 pr-4 font-medium text-text-muted">Planet</th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">Sign</th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">Degree</th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">Nakshatra</th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">Pada</th>
                    <th className="pb-2 font-medium text-text-muted">Lord</th>
                  </tr>
                </thead>
                <tbody>
                  {rashi.map((p) => (
                    <tr
                      key={p.planet}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5 pr-4 font-medium text-text-primary">
                        {p.planet}
                      </td>
                      <td className="py-2.5 pr-4 text-text-secondary">{p.sign}</td>
                      <td className="py-2.5 pr-4 font-mono text-text-secondary">
                        {p.degree}
                      </td>
                      <td className="py-2.5 pr-4 text-accent-purple">{p.nakshatra}</td>
                      <td className="py-2.5 pr-4 text-text-muted">{p.pada}</td>
                      <td className="py-2.5 text-text-muted">{p.lord}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Nakshatra Display */}
          <Card title="Moon Nakshatra" glow="purple">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-accent-purple/20 bg-accent-purple/10">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent-purple">
                    {nak?.name ?? MOCK_NAKSHATRA.moon}
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Lord:</span>
                    <span className="text-sm font-medium text-text-primary">
                      {nak?.lord ?? MOCK_NAKSHATRA.lord}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Deity:</span>
                    <span className="text-sm font-medium text-text-primary">
                      {nak?.deity ?? MOCK_NAKSHATRA.deity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Symbol:</span>
                    <span className="text-sm text-text-secondary">
                      {nak?.symbol ?? MOCK_NAKSHATRA.symbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Nature:</span>
                    <Badge variant="healthy">{nak?.nature ?? MOCK_NAKSHATRA.nature}</Badge>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {nak?.description ?? MOCK_NAKSHATRA.description}
                </p>
              </div>
            </div>
          </Card>

          {/* Vimshottari Dasha */}
          <Card title="Vimshottari Dasha Periods">
            <div className="mb-4 rounded-lg bg-accent-blue/5 border border-accent-blue/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">
                    {dasha?.current ?? MOCK_DASHA.current}
                  </span>
                  <Badge variant="info">Active</Badge>
                </div>
                <span className="text-xs text-text-muted">
                  {(dasha?.start_date ?? MOCK_DASHA.startDate)} to {(dasha?.end_date ?? MOCK_DASHA.endDate)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent-blue transition-all"
                  style={{ width: "28%" }}
                />
              </div>
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Antardasha (Sub-periods)
            </p>
            <div className="space-y-2">
              {(dasha?.sub_periods?.length ? dasha.sub_periods : MOCK_DASHA.subPeriods).map((sp, i) => (
                <div
                  key={sp.planet ?? i}
                  className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${
                    sp.active
                      ? "bg-accent-blue/10 border border-accent-blue/30"
                      : "bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-medium ${
                        sp.active ? "text-accent-blue" : "text-text-primary"
                      }`}
                    >
                      {sp.planet}
                    </span>
                    {sp.active && <Badge variant="info">Current</Badge>}
                  </div>
                  <span className="text-xs text-text-muted">
                    {sp.start} -- {sp.end}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Yoga Detection */}
          <Card title="Yoga Detection">
            <div className="space-y-3">
              {MOCK_YOGAS.map((yoga) => (
                <div
                  key={yoga.name}
                  className="rounded-xl border border-border bg-white/[0.02] p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-text-primary">
                        {yoga.name}
                      </h4>
                      <Badge variant="neutral">{yoga.planets}</Badge>
                    </div>
                    <Badge
                      variant={
                        yoga.strength === "Strong"
                          ? "healthy"
                          : yoga.strength === "Moderate"
                            ? "info"
                            : "neutral"
                      }
                    >
                      {yoga.strength}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {yoga.description}
                  </p>
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
