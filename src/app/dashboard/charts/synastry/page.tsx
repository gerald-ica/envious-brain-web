"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Synastry
// ---------------------------------------------------------------------------

// ---- Mock data ------------------------------------------------------------

const MOCK_CROSS_ASPECTS = [
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
  const circumference = 2 * Math.PI * 54; // radius 54
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
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        {/* Score arc */}
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
  // Person A
  const [dateA, setDateA] = useState("1990-06-15");
  const [timeA, setTimeA] = useState("14:30");
  const [latA, setLatA] = useState("40.7128");
  const [lonA, setLonA] = useState("-74.0060");

  // Person B
  const [dateB, setDateB] = useState("1992-11-08");
  const [timeB, setTimeB] = useState("09:15");
  const [latB, setLatB] = useState("34.0522");
  const [lonB, setLonB] = useState("-118.2437");

  const [calculated, setCalculated] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => {
      setCalculated(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Synastry</h1>
        <p className="mt-1 text-sm text-text-muted">
          Relationship compatibility through cross-chart aspect analysis
        </p>
      </div>

      {/* Two Birth Data Forms Side by Side */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <Card title="Person A" glow="blue">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Birth Date"
              type="date"
              value={dateA}
              onChange={(e) => setDateA(e.target.value)}
            />
            <Input
              label="Birth Time"
              type="time"
              value={timeA}
              onChange={(e) => setTimeA(e.target.value)}
            />
            <Input
              label="Latitude"
              type="number"
              step="0.0001"
              value={latA}
              onChange={(e) => setLatA(e.target.value)}
            />
            <Input
              label="Longitude"
              type="number"
              step="0.0001"
              value={lonA}
              onChange={(e) => setLonA(e.target.value)}
            />
          </div>
        </Card>

        <Card title="Person B" glow="purple">
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
            <Input
              label="Latitude"
              type="number"
              step="0.0001"
              value={latB}
              onChange={(e) => setLatB(e.target.value)}
            />
            <Input
              label="Longitude"
              type="number"
              step="0.0001"
              value={lonB}
              onChange={(e) => setLonB(e.target.value)}
            />
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <Button onClick={handleCalculate} disabled={loading} className="w-full sm:w-auto">
          {loading ? "Analyzing Compatibility..." : "Compare Charts"}
        </Button>
      </div>

      {calculated && (
        <div className="animate-fade-in space-y-6">
          {/* Compatibility Score + Summary */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Big Circular Gauge */}
            <Card className="flex flex-col items-center justify-center" glow="blue">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Compatibility Score
              </p>
              <CompatibilityGauge score={MOCK_COMPATIBILITY_SCORE} />
              <div className="mt-4 flex gap-2">
                <Badge variant="healthy">Strong Match</Badge>
              </div>
              <p className="mt-2 text-xs text-text-muted text-center">
                Based on cross-aspect analysis, element balance, and planetary harmony
              </p>
            </Card>

            {/* Score breakdown */}
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
                  {MOCK_CROSS_ASPECTS.map((a, i) => (
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
                              : a.significance === "Strong"
                                ? "neutral"
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
      )}
    </div>
  );
}
