"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// BaZi Four Pillars
// ---------------------------------------------------------------------------

// ---- Mock data ------------------------------------------------------------

const MOCK_PILLARS = [
  {
    label: "Year",
    stem: "\u5E9A", // 庚
    stemPinyin: "Geng",
    stemElement: "Metal",
    branch: "\u5348", // 午
    branchPinyin: "Wu",
    branchAnimal: "Horse",
    branchElement: "Fire",
  },
  {
    label: "Month",
    stem: "\u58EC", // 壬
    stemPinyin: "Ren",
    stemElement: "Water",
    branch: "\u5348", // 午
    branchPinyin: "Wu",
    branchAnimal: "Horse",
    branchElement: "Fire",
  },
  {
    label: "Day",
    stem: "\u4E19", // 丙
    stemPinyin: "Bing",
    stemElement: "Fire",
    branch: "\u5B50", // 子
    branchPinyin: "Zi",
    branchAnimal: "Rat",
    branchElement: "Water",
  },
  {
    label: "Hour",
    stem: "\u5DF1", // 己
    stemPinyin: "Ji",
    stemElement: "Earth",
    branch: "\u672A", // 未
    branchPinyin: "Wei",
    branchAnimal: "Goat",
    branchElement: "Earth",
  },
];

const ELEMENT_COLORS: Record<string, string> = {
  Wood: "bg-emerald-500",
  Fire: "bg-red-500",
  Earth: "bg-amber-500",
  Metal: "bg-slate-300",
  Water: "bg-blue-500",
};

const ELEMENT_TEXT_COLORS: Record<string, string> = {
  Wood: "text-accent-emerald",
  Fire: "text-accent-rose",
  Earth: "text-accent-amber",
  Metal: "text-text-secondary",
  Water: "text-accent-blue",
};

const MOCK_FIVE_ELEMENTS = [
  { element: "Wood", count: 1, strength: 8 },
  { element: "Fire", count: 4, strength: 35 },
  { element: "Earth", count: 2, strength: 18 },
  { element: "Metal", count: 2, strength: 15 },
  { element: "Water", count: 3, strength: 24 },
];

const MOCK_TEN_GODS = [
  { god: "Companion", chinese: "\u6BD4\u80A9", element: "Fire", relation: "Same element as Day Master", strength: "Strong" },
  { god: "Rob Wealth", chinese: "\u52AB\u8D22", element: "Fire", relation: "Same polarity helper", strength: "Moderate" },
  { god: "Eating God", chinese: "\u98DF\u795E", element: "Earth", relation: "Day Master produces", strength: "Moderate" },
  { god: "Hurting Officer", chinese: "\u4F24\u5B98", element: "Earth", relation: "Day Master produces (yang)", strength: "Weak" },
  { god: "Direct Wealth", chinese: "\u6B63\u8D22", element: "Metal", relation: "Controls Day Master", strength: "Moderate" },
  { god: "Indirect Wealth", chinese: "\u504F\u8D22", element: "Metal", relation: "Controls Day Master (yang)", strength: "Weak" },
  { god: "Direct Officer", chinese: "\u6B63\u5B98", element: "Water", relation: "Controls Day Master element", strength: "Strong" },
  { god: "7 Killings", chinese: "\u4E03\u6740", element: "Water", relation: "Aggressive control", strength: "Moderate" },
  { god: "Direct Resource", chinese: "\u6B63\u5370", element: "Wood", relation: "Produces Day Master", strength: "Weak" },
  { god: "Indirect Resource", chinese: "\u504F\u5370", element: "Wood", relation: "Produces Day Master (yang)", strength: "Very Weak" },
];

const MOCK_LUCK_PERIODS = [
  { age: "4-13", stem: "\u8F9B", branch: "\u672A", element: "Metal/Earth", quality: "neutral" },
  { age: "14-23", stem: "\u5E9A", branch: "\u5348", element: "Metal/Fire", quality: "good" },
  { age: "24-33", stem: "\u5DF1", branch: "\u5DF3", element: "Earth/Fire", quality: "excellent" },
  { age: "34-43", stem: "\u620A", branch: "\u8FB0", element: "Earth/Earth", quality: "good" },
  { age: "44-53", stem: "\u4E01", branch: "\u536F", element: "Fire/Wood", quality: "excellent" },
  { age: "54-63", stem: "\u4E19", branch: "\u5BC5", element: "Fire/Wood", quality: "good" },
  { age: "64-73", stem: "\u4E59", branch: "\u4E11", element: "Wood/Earth", quality: "neutral" },
  { age: "74-83", stem: "\u7532", branch: "\u5B50", element: "Wood/Water", quality: "challenging" },
];

const QUALITY_STYLES: Record<string, string> = {
  excellent: "border-accent-emerald/40 bg-accent-emerald/10",
  good: "border-accent-blue/40 bg-accent-blue/10",
  neutral: "border-border bg-white/[0.02]",
  challenging: "border-accent-rose/40 bg-accent-rose/10",
};

const QUALITY_BADGE: Record<string, "healthy" | "info" | "neutral" | "degraded"> = {
  excellent: "healthy",
  good: "info",
  neutral: "neutral",
  challenging: "degraded",
};

// ---- Page -----------------------------------------------------------------

export default function BaZiPage() {
  const [birthDate, setBirthDate] = useState("1990-06-15");
  const [birthTime, setBirthTime] = useState("14:30");
  const [calculated, setCalculated] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => {
      setCalculated(true);
      setLoading(false);
    }, 800);
  };

  const maxStrength = Math.max(...MOCK_FIVE_ELEMENTS.map((e) => e.strength));

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          BaZi Four Pillars
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Chinese Four Pillars of Destiny -- \u56DB\u67F1\u547D\u7406
        </p>
      </div>

      {/* Birth Data */}
      <Card title="Birth Data" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
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
          <div className="flex items-end">
            <Button onClick={handleCalculate} disabled={loading} className="w-full">
              {loading ? "Calculating..." : "Calculate Pillars"}
            </Button>
          </div>
        </div>
      </Card>

      {calculated && (
        <div className="animate-fade-in space-y-6">
          {/* Four Pillar Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {MOCK_PILLARS.map((pillar) => (
              <Card key={pillar.label} className="text-center">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {pillar.label} Pillar
                </p>

                {/* Stem */}
                <div className="mb-2">
                  <div className="text-4xl font-bold text-text-primary">
                    {pillar.stem}
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    {pillar.stemPinyin}
                  </p>
                  <Badge variant="info" className="mt-1">
                    {pillar.stemElement}
                  </Badge>
                </div>

                {/* Divider */}
                <div className="my-3 h-px bg-border" />

                {/* Branch */}
                <div>
                  <div className="text-4xl font-bold text-text-primary">
                    {pillar.branch}
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    {pillar.branchPinyin} -- {pillar.branchAnimal}
                  </p>
                  <Badge variant="neutral" className="mt-1">
                    {pillar.branchElement}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          {/* Day Master + Five Elements */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Day Master Panel */}
            <Card title="Day Master" glow="blue">
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-accent-rose/10 border border-accent-rose/20">
                  <span className="text-4xl font-bold text-accent-rose">
                    {MOCK_PILLARS[2].stem}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-text-primary">
                    {MOCK_PILLARS[2].stemPinyin} Fire (Yang)
                  </p>
                  <p className="text-sm text-text-secondary">
                    Bing Fire is like the sun -- radiant, warm, and generous. It illuminates everything around it and brings clarity.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="healthy">Strong</Badge>
                    <Badge variant="info">Season: Summer</Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-white/[0.02] p-3">
                <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wider">
                  Strength Analysis
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted w-12">35%</span>
                  <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-rose to-accent-amber transition-all"
                      style={{ width: "65%" }}
                    />
                  </div>
                  <span className="text-xs font-medium text-accent-emerald">
                    65% Favorable
                  </span>
                </div>
              </div>
            </Card>

            {/* Five Elements Distribution */}
            <Card title="Five Elements Distribution">
              <div className="space-y-4">
                {MOCK_FIVE_ELEMENTS.map((e) => (
                  <div key={e.element} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${ELEMENT_TEXT_COLORS[e.element]}`}>
                        {e.element}
                      </span>
                      <span className="text-xs text-text-muted">
                        {e.count} planets -- {e.strength}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${ELEMENT_COLORS[e.element]}`}
                        style={{ width: `${(e.strength / maxStrength) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Ten Gods */}
          <Card title="Ten Gods Relationships">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 pr-4 font-medium text-text-muted">God</th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">Chinese</th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">Element</th>
                    <th className="pb-2 pr-4 font-medium text-text-muted">Relation</th>
                    <th className="pb-2 font-medium text-text-muted">Strength</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TEN_GODS.map((g) => (
                    <tr
                      key={g.god}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5 pr-4 font-medium text-text-primary">
                        {g.god}
                      </td>
                      <td className="py-2.5 pr-4 text-lg text-text-secondary">
                        {g.chinese}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-sm ${ELEMENT_TEXT_COLORS[g.element]}`}>
                          {g.element}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-text-muted">
                        {g.relation}
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant={
                            g.strength === "Strong"
                              ? "healthy"
                              : g.strength === "Moderate"
                                ? "info"
                                : g.strength === "Weak"
                                  ? "neutral"
                                  : "degraded"
                          }
                        >
                          {g.strength}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Luck Periods Timeline */}
          <Card title="Luck Periods Timeline">
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max">
                {MOCK_LUCK_PERIODS.map((period) => (
                  <div
                    key={period.age}
                    className={`flex flex-col items-center rounded-xl border p-4 min-w-[120px] ${QUALITY_STYLES[period.quality]}`}
                  >
                    <p className="text-xs font-medium text-text-muted mb-2">
                      Age {period.age}
                    </p>
                    <div className="text-2xl font-bold text-text-primary">
                      {period.stem}
                    </div>
                    <div className="text-2xl font-bold text-text-primary">
                      {period.branch}
                    </div>
                    <p className="mt-2 text-xs text-text-secondary">
                      {period.element}
                    </p>
                    <Badge variant={QUALITY_BADGE[period.quality]} className="mt-2">
                      {period.quality}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-text-muted">
              Scroll horizontally to view all luck periods
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
