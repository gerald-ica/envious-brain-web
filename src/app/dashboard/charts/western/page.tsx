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
// Western Natal Chart
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

// ---- Fallback / sample data -----------------------------------------------

const MOCK_PLANETS = [
  { planet: "Sun", sign: "Gemini", degree: "24\u00b0 12'", house: 10, retrograde: false },
  { planet: "Moon", sign: "Scorpio", degree: "8\u00b0 45'", house: 3, retrograde: false },
  { planet: "Mercury", sign: "Cancer", degree: "2\u00b0 33'", house: 11, retrograde: false },
  { planet: "Venus", sign: "Taurus", degree: "18\u00b0 07'", house: 9, retrograde: false },
  { planet: "Mars", sign: "Leo", degree: "11\u00b0 52'", house: 12, retrograde: false },
  { planet: "Jupiter", sign: "Libra", degree: "5\u00b0 19'", house: 2, retrograde: true },
  { planet: "Saturn", sign: "Capricorn", degree: "22\u00b0 41'", house: 5, retrograde: true },
  { planet: "Uranus", sign: "Capricorn", degree: "9\u00b0 14'", house: 5, retrograde: false },
  { planet: "Neptune", sign: "Capricorn", degree: "14\u00b0 28'", house: 5, retrograde: true },
  { planet: "Pluto", sign: "Scorpio", degree: "16\u00b0 55'", house: 3, retrograde: true },
  { planet: "N. Node", sign: "Aquarius", degree: "3\u00b0 10'", house: 6, retrograde: false },
  { planet: "Chiron", sign: "Cancer", degree: "19\u00b0 36'", house: 11, retrograde: false },
];

const MOCK_ASPECTS = [
  { planet1: "Sun", aspect: "Trine", planet2: "Mars", orb: "2\u00b017'", type: "healthy" as const },
  { planet1: "Sun", aspect: "Opposition", planet2: "Pluto", orb: "1\u00b043'", type: "degraded" as const },
  { planet1: "Moon", aspect: "Sextile", planet2: "Neptune", orb: "0\u00b023'", type: "healthy" as const },
  { planet1: "Moon", aspect: "Conjunct", planet2: "Pluto", orb: "0\u00b010'", type: "info" as const },
  { planet1: "Mercury", aspect: "Square", planet2: "Jupiter", orb: "2\u00b046'", type: "degraded" as const },
  { planet1: "Venus", aspect: "Trine", planet2: "Saturn", orb: "4\u00b034'", type: "healthy" as const },
  { planet1: "Mars", aspect: "Trine", planet2: "Jupiter", orb: "1\u00b027'", type: "healthy" as const },
  { planet1: "Saturn", aspect: "Conjunct", planet2: "Uranus", orb: "3\u00b013'", type: "info" as const },
  { planet1: "Saturn", aspect: "Conjunct", planet2: "Neptune", orb: "1\u00b047'", type: "info" as const },
  { planet1: "Uranus", aspect: "Conjunct", planet2: "Neptune", orb: "5\u00b014'", type: "info" as const },
];

const MOCK_HOUSES = [
  { house: 1, sign: "Virgo", degree: "15\u00b022'" },
  { house: 2, sign: "Libra", degree: "11\u00b008'" },
  { house: 3, sign: "Scorpio", degree: "10\u00b044'" },
  { house: 4, sign: "Sagittarius", degree: "14\u00b016'" },
  { house: 5, sign: "Capricorn", degree: "18\u00b033'" },
  { house: 6, sign: "Aquarius", degree: "20\u00b041'" },
  { house: 7, sign: "Pisces", degree: "15\u00b022'" },
  { house: 8, sign: "Aries", degree: "11\u00b008'" },
  { house: 9, sign: "Taurus", degree: "10\u00b044'" },
  { house: 10, sign: "Gemini", degree: "14\u00b016'" },
  { house: 11, sign: "Cancer", degree: "18\u00b033'" },
  { house: 12, sign: "Leo", degree: "20\u00b041'" },
];

const ELEMENT_BY_SIGN: Record<string, "Fire" | "Earth" | "Air" | "Water"> = {
  Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
  Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
  Gemini: "Air", Libra: "Air", Aquarius: "Air",
  Cancer: "Water", Scorpio: "Water", Pisces: "Water",
};

const MODALITY_BY_SIGN: Record<string, "Cardinal" | "Fixed" | "Mutable"> = {
  Aries: "Cardinal", Cancer: "Cardinal", Libra: "Cardinal", Capricorn: "Cardinal",
  Taurus: "Fixed", Leo: "Fixed", Scorpio: "Fixed", Aquarius: "Fixed",
  Gemini: "Mutable", Virgo: "Mutable", Sagittarius: "Mutable", Pisces: "Mutable",
};

// ---- API response types ---------------------------------------------------

interface ApiPlanetPosition {
  longitude: number;
  sign: string;
  degree_in_sign: number;
  speed: number;
  retrograde: boolean;
}

interface ApiAspect {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  orb: number;
  applying: boolean;
}

interface ApiHouse {
  number: number;
  degree: number;
  sign: string;
  degree_in_sign: number;
}

interface ApiWesternResponse {
  positions: Record<string, ApiPlanetPosition>;
  aspects: ApiAspect[];
  houses: ApiHouse[];
}

// ---- Display types (used by rendering) ------------------------------------

interface PlanetRow {
  planet: string;
  sign: string;
  degree: string;
  house: number;
  retrograde: boolean;
}

interface AspectRow {
  planet1: string;
  aspect: string;
  planet2: string;
  orb: string;
  type: "healthy" | "degraded" | "info";
}

interface HouseRow {
  house: number;
  sign: string;
  degree: string;
}

interface ChartDisplay {
  planets: PlanetRow[];
  aspects: AspectRow[];
  houses: HouseRow[];
}

// ---- Helpers --------------------------------------------------------------

function formatDegree(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}\u00b0 ${String(m).padStart(2, "0")}'`;
}

function findHouseForLongitude(lon: number, houses: ApiHouse[]): number {
  // Houses are sorted by number (1..12), each starts at `degree`.
  for (let i = 0; i < houses.length; i++) {
    const start = houses[i].degree;
    const end = houses[(i + 1) % houses.length].degree;
    if (start < end) {
      if (lon >= start && lon < end) return houses[i].number;
    } else {
      // wraps around 360
      if (lon >= start || lon < end) return houses[i].number;
    }
  }
  return houses[0]?.number ?? 1;
}

const ASPECT_TYPE: Record<string, "healthy" | "degraded" | "info"> = {
  trine: "healthy",
  sextile: "healthy",
  conjunction: "info",
  opposition: "degraded",
  square: "degraded",
  quincunx: "degraded",
  "semi-sextile": "info",
  sesquiquadrate: "degraded",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function mapApiToDisplay(api: ApiWesternResponse): ChartDisplay {
  const planets: PlanetRow[] = Object.entries(api.positions).map(
    ([name, p]) => ({
      planet: name,
      sign: p.sign,
      degree: formatDegree(p.degree_in_sign),
      house: findHouseForLongitude(p.longitude, api.houses),
      retrograde: p.retrograde,
    }),
  );
  const aspects: AspectRow[] = api.aspects.map((a) => ({
    planet1: a.planet1,
    aspect: capitalize(a.type),
    planet2: a.planet2,
    orb: `${a.orb.toFixed(2)}\u00b0`,
    type: ASPECT_TYPE[a.type] ?? "info",
  }));
  const houses: HouseRow[] = api.houses.map((h) => ({
    house: h.number,
    sign: h.sign,
    degree: formatDegree(h.degree_in_sign),
  }));
  return { planets, aspects, houses };
}

const MOCK_DISPLAY: ChartDisplay = {
  planets: MOCK_PLANETS,
  aspects: MOCK_ASPECTS,
  houses: MOCK_HOUSES,
};

// ---- Distribution bar component -------------------------------------------

function DistributionBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs text-text-muted">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-mono text-text-secondary">
        {count}
      </span>
    </div>
  );
}

// ---- Page -----------------------------------------------------------------

export default function WesternChartPage() {
  const { activeProfile } = useProfile();

  // Form state mirrors activeProfile but remains editable
  const [birthDate, setBirthDate] = useState(activeProfile?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(activeProfile?.birthTime ?? "");
  const [city, setCity] = useState(activeProfile?.city ?? "");
  const [latitude, setLatitude] = useState(
    activeProfile ? String(activeProfile.lat) : "",
  );
  const [longitude, setLongitude] = useState(
    activeProfile ? String(activeProfile.lon) : "",
  );
  const [timezone, setTimezone] = useState(
    activeProfile?.timezone ?? "UTC",
  );

  const [chartData, setChartData] = useState<ChartDisplay | null>(null);
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
      const res = await fetch(`${API_URL}/api/v1/charts/western`, {
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
      const json = (await res.json()) as ApiWesternResponse;
      setChartData(mapApiToDisplay(json));
      setUsedFallback(false);
    } catch (err) {
      console.warn("Chart API unavailable, using sample data:", err);
      setChartData(MOCK_DISPLAY);
      setUsedFallback(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch / re-sync when activeProfile changes
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

  // Empty state: no profile
  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view your Western natal chart.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Compute element/modality distribution from loaded data
  const planets = chartData?.planets ?? [];
  const coreCount = planets.filter((p) =>
    ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"].includes(p.planet),
  );
  const elementCounts: Record<"Fire" | "Earth" | "Air" | "Water", number> = {
    Fire: 0, Earth: 0, Air: 0, Water: 0,
  };
  const modalityCounts: Record<"Cardinal" | "Fixed" | "Mutable", number> = {
    Cardinal: 0, Fixed: 0, Mutable: 0,
  };
  for (const p of coreCount) {
    const e = ELEMENT_BY_SIGN[p.sign];
    const m = MODALITY_BY_SIGN[p.sign];
    if (e) elementCounts[e]++;
    if (m) modalityCounts[m]++;
  }
  const elementEntries = [
    { name: "Fire", count: elementCounts.Fire, color: "bg-accent-rose" },
    { name: "Earth", count: elementCounts.Earth, color: "bg-accent-emerald" },
    { name: "Air", count: elementCounts.Air, color: "bg-accent-blue" },
    { name: "Water", count: elementCounts.Water, color: "bg-accent-purple" },
  ];
  const modalityEntries = [
    { name: "Cardinal", count: modalityCounts.Cardinal, color: "bg-accent-rose" },
    { name: "Fixed", count: modalityCounts.Fixed, color: "bg-accent-amber" },
    { name: "Mutable", count: modalityCounts.Mutable, color: "bg-accent-blue" },
  ];
  const totalPlanets = coreCount.length;
  const totalModality = coreCount.length;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Western Chart for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Tropical zodiac -- Placidus house system
        </p>
      </div>

      {/* Fallback banner */}
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
              {loading ? "Calculating..." : "Recalculate"}
            </Button>
          </div>
        </div>
      </Card>

      {chartData && (
        <div className="animate-fade-in space-y-6">
          {/* Planet Positions */}
          <Card title="Planet Positions">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 pr-4 font-medium text-text-muted">Planet</th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">Sign</th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">Degree</th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">House</th>
                    <th className="pb-2 font-medium text-text-muted">Rx</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.planets.map((p) => (
                    <tr
                      key={p.planet}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5 pr-4 font-medium text-text-primary">
                        {p.planet}
                      </td>
                      <td className="py-2.5 pr-4 text-text-secondary">
                        {p.sign}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-text-secondary">
                        {p.degree}
                      </td>
                      <td className="py-2.5 pr-4 text-text-secondary">
                        {p.house}
                      </td>
                      <td className="py-2.5">
                        {p.retrograde ? (
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

          {/* Aspects + Distribution */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Aspects Table */}
            <Card title="Aspects">
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
                    {chartData.aspects.map((a, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-2 pr-4 font-medium text-text-primary">
                          {a.planet1}
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant={a.type}>{a.aspect}</Badge>
                        </td>
                        <td className="py-2 pr-4 font-medium text-text-primary">
                          {a.planet2}
                        </td>
                        <td className="py-2 font-mono text-xs text-text-muted">
                          {a.orb}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Element / Modality Distribution */}
            <div className="space-y-4">
              <Card title="Element Distribution">
                <div className="space-y-3">
                  {elementEntries.map((e) => (
                    <DistributionBar
                      key={e.name}
                      label={e.name}
                      count={e.count}
                      total={totalPlanets}
                      color={e.color}
                    />
                  ))}
                </div>
              </Card>

              <Card title="Modality Distribution">
                <div className="space-y-3">
                  {modalityEntries.map((m) => (
                    <DistributionBar
                      key={m.name}
                      label={m.name}
                      count={m.count}
                      total={totalModality}
                      color={m.color}
                    />
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* House Cusps */}
          <Card title="House Cusps">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {chartData.houses.map((h) => (
                <div
                  key={h.house}
                  className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-blue/10 text-xs font-bold text-accent-blue">
                      {h.house}
                    </span>
                    <span className="text-sm text-text-primary">{h.sign}</span>
                  </div>
                  <span className="font-mono text-xs text-text-muted">
                    {h.degree}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
