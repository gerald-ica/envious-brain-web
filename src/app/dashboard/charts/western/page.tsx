"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Western Natal Chart
// ---------------------------------------------------------------------------

// ---- Mock data ------------------------------------------------------------

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

const MOCK_ELEMENTS = [
  { name: "Fire", count: 2, color: "bg-accent-rose" },
  { name: "Earth", count: 4, color: "bg-accent-emerald" },
  { name: "Air", count: 3, color: "bg-accent-blue" },
  { name: "Water", count: 3, color: "bg-accent-purple" },
];

const MOCK_MODALITIES = [
  { name: "Cardinal", count: 3, color: "bg-accent-rose" },
  { name: "Fixed", count: 4, color: "bg-accent-amber" },
  { name: "Mutable", count: 5, color: "bg-accent-blue" },
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
  const pct = Math.round((count / total) * 100);
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
  const [birthDate, setBirthDate] = useState("1990-06-15");
  const [birthTime, setBirthTime] = useState("14:30");
  const [latitude, setLatitude] = useState("40.7128");
  const [longitude, setLongitude] = useState("-74.0060");
  const [calculated, setCalculated] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCalculate = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setCalculated(true);
      setLoading(false);
    }, 800);
  };

  const totalPlanets = MOCK_ELEMENTS.reduce((sum, e) => sum + e.count, 0);
  const totalModality = MOCK_MODALITIES.reduce((sum, m) => sum + m.count, 0);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Western Natal Chart
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Tropical zodiac -- Placidus house system
        </p>
      </div>

      {/* Birth Data Form */}
      <Card title="Birth Data" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          <Input
            label="Latitude"
            type="number"
            step="0.0001"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="40.7128"
          />
          <Input
            label="Longitude"
            type="number"
            step="0.0001"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="-74.0060"
          />
          <div className="flex items-end">
            <Button onClick={handleCalculate} disabled={loading} className="w-full">
              {loading ? "Calculating..." : "Calculate"}
            </Button>
          </div>
        </div>
      </Card>

      {calculated && (
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
                  {MOCK_PLANETS.map((p) => (
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
                    {MOCK_ASPECTS.map((a, i) => (
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
                  {MOCK_ELEMENTS.map((e) => (
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
                  {MOCK_MODALITIES.map((m) => (
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
              {MOCK_HOUSES.map((h) => (
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
