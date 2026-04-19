"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// BaZi Four Pillars
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-662458014068.us-central1.run.app";

// ---- Element styling ------------------------------------------------------

const ELEMENT_TEXT_COLORS: Record<string, string> = {
  Wood: "text-accent-emerald",
  Fire: "text-accent-rose",
  Earth: "text-accent-amber",
  Metal: "text-text-secondary",
  Water: "text-accent-blue",
};

const ELEMENT_BG_COLORS: Record<string, string> = {
  Wood: "bg-emerald-500",
  Fire: "bg-red-500",
  Earth: "bg-amber-500",
  Metal: "bg-slate-300",
  Water: "bg-blue-500",
};

// ---- Types matching actual API response -----------------------------------

interface StemBranch {
  english?: string;
  chinese?: string;
}

interface ApiPillar {
  stem?: StemBranch | string;
  branch?: StemBranch | string;
  stem_chinese?: string;
  branch_chinese?: string;
  stem_element?: string;
  stem_polarity?: string;
  branch_element?: string;
  animal?: string;
  hidden_stems?: unknown;
}

interface ApiLuckPeriod {
  stem?: string;
  branch?: string;
  start_age?: number;
  end_age?: number;
  element?: string;
  polarity?: string;
}

interface ApiElementAnalysis {
  day_master_element?: string;
  season_element?: string;
  supporting?: number;
  weakening?: number;
  day_master_strength?: string;
  element_counts?: Record<string, number>;
}

interface ApiBaziResponse {
  pillars?: {
    year?: ApiPillar;
    month?: ApiPillar;
    day?: ApiPillar;
    hour?: ApiPillar;
  };
  day_master?: string;
  day_master_element?: string;
  element_analysis?: ApiElementAnalysis;
  luck_periods?: ApiLuckPeriod[];
  ten_gods?: Record<string, string>;
  [k: string]: unknown;
}

// ---- Display types --------------------------------------------------------

interface DisplayPillar {
  label: string;
  stemChinese: string;
  stemEnglish: string;
  stemElement: string;
  branchChinese: string;
  branchEnglish: string;
  branchAnimal: string;
  branchElement: string;
}

// ---- Helpers: extract values from nested or flat API pillar ----------------

function extractStem(p: ApiPillar): { chinese: string; english: string } {
  if (typeof p.stem === "object" && p.stem !== null) {
    return { chinese: p.stem.chinese ?? "", english: p.stem.english ?? "" };
  }
  // Flat format fallback
  return { chinese: p.stem_chinese ?? String(p.stem ?? ""), english: String(p.stem ?? "") };
}

function extractBranch(p: ApiPillar): { chinese: string; english: string } {
  if (typeof p.branch === "object" && p.branch !== null) {
    return { chinese: p.branch.chinese ?? "", english: p.branch.english ?? "" };
  }
  return { chinese: p.branch_chinese ?? String(p.branch ?? ""), english: String(p.branch ?? "") };
}

function mapPillar(label: string, p: ApiPillar | undefined): DisplayPillar | null {
  if (!p) return null;
  const stem = extractStem(p);
  const branch = extractBranch(p);
  return {
    label,
    stemChinese: stem.chinese,
    stemEnglish: stem.english,
    stemElement: p.stem_element ?? stem.english,
    branchChinese: branch.chinese,
    branchEnglish: branch.english,
    branchAnimal: p.animal ?? branch.english,
    branchElement: p.branch_element ?? "",
  };
}

// ---- Page -----------------------------------------------------------------

export default function BaZiPage() {
  const { activeProfile } = useProfile();

  const [birthDate, setBirthDate] = useState(activeProfile?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(activeProfile?.birthTime ?? "");
  const [gender, setGender] = useState<"male" | "female">("male");

  const [data, setData] = useState<ApiBaziResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChart = async (date: string, time: string, g: string) => {
    setLoading(true);
    setError(null);
    try {
      let res = await fetch(`${API_URL}/api/v1/charts/bazi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: `${date}T${time}:00`,
          gender: g,
        }),
      });
      if (!res.ok) {
        res = await fetch(`${API_URL}/api/v1/chinese/bazi`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            datetime: `${date}T${time}:00`,
            gender: g,
          }),
        });
      }
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const json = (await res.json()) as ApiBaziResponse;
      setData(json);
    } catch (err) {
      console.error("BaZi API error:", err);
      setError("Failed to load BaZi chart. Check API connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeProfile) return;
    setBirthDate(activeProfile.birthDate);
    setBirthTime(activeProfile.birthTime);
    fetchChart(activeProfile.birthDate, activeProfile.birthTime, gender);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile]);

  const handleCalculate = () => {
    fetchChart(birthDate, birthTime, gender);
  };

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view your BaZi Four Pillars chart.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const pillars = data?.pillars
    ? ([
        mapPillar("Year", data.pillars.year),
        mapPillar("Month", data.pillars.month),
        mapPillar("Day", data.pillars.day),
        mapPillar("Hour", data.pillars.hour),
      ].filter(Boolean) as DisplayPillar[])
    : [];

  const elementAnalysis = data?.element_analysis;
  const elementCounts = elementAnalysis?.element_counts;
  const luckPeriods = data?.luck_periods ?? [];
  const dayPillar = pillars.find((p) => p.label === "Day");

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          BaZi Four Pillars for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Chinese Four Pillars of Destiny -- {"\u56DB\u67F1\u547D\u7406"}
        </p>
      </div>

      {/* Birth Data */}
      <Card title="Birth Data" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-4">
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as "male" | "female")}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleCalculate} disabled={loading} className="w-full">
              {loading ? "Calculating..." : "Recalculate"}
            </Button>
          </div>
        </div>
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
          {/* Four Pillar Cards */}
          {pillars.length > 0 && (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {pillars.map((pillar) => (
                <Card key={pillar.label} className="text-center">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    {pillar.label} Pillar
                  </p>

                  <div className="mb-2">
                    <div className="text-4xl font-bold text-text-primary">
                      {pillar.stemChinese}
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      {pillar.stemEnglish}
                    </p>
                    <Badge variant="info" className="mt-1">
                      {pillar.stemElement}
                    </Badge>
                  </div>

                  <div className="my-3 h-px bg-border" />

                  <div>
                    <div className="text-4xl font-bold text-text-primary">
                      {pillar.branchChinese}
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      {pillar.branchEnglish} -- {pillar.branchAnimal}
                    </p>
                    <Badge variant="neutral" className="mt-1">
                      {pillar.branchElement}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Day Master + Five Elements */}
          <div className="grid gap-4 lg:grid-cols-2">
            {dayPillar && (
              <Card title="Day Master" glow="blue">
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-accent-rose/10 border border-accent-rose/20">
                    <span className="text-4xl font-bold text-accent-rose">
                      {dayPillar.stemChinese}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-text-primary">
                      {dayPillar.stemEnglish} {dayPillar.stemElement}
                    </p>
                    <p className="text-sm text-text-secondary">
                      The Day Master represents the core essence of the native -- the self in relation to the cosmic energies of the birth moment.
                    </p>
                    {elementAnalysis?.day_master_strength && (
                      <Badge variant="healthy">
                        {elementAnalysis.day_master_strength}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {elementCounts && (
              <Card title="Five Elements Distribution">
                <div className="space-y-4">
                  {Object.entries(elementCounts).map(([element, count]) => (
                    <div key={element} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${ELEMENT_TEXT_COLORS[element] ?? "text-text-primary"}`}>
                          {element}
                        </span>
                        <span className="text-xs text-text-muted">
                          {count}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${ELEMENT_BG_COLORS[element] ?? "bg-accent-blue"}`}
                          style={{ width: `${Math.min((count / 8) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Luck Periods Timeline */}
          {luckPeriods.length > 0 && (
            <Card title="Luck Periods Timeline">
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-3 min-w-max">
                  {luckPeriods.map((period, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center rounded-xl border border-border bg-white/[0.02] p-4 min-w-[120px]"
                    >
                      <p className="text-xs font-medium text-text-muted mb-2">
                        Age {Math.round(period.start_age ?? 0)}-{Math.round(period.end_age ?? 0)}
                      </p>
                      <div className="text-2xl font-bold text-text-primary">
                        {period.stem}
                      </div>
                      <div className="text-2xl font-bold text-text-primary">
                        {period.branch}
                      </div>
                      {period.element && (
                        <p className="mt-2 text-xs text-text-secondary">
                          {period.element}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-text-muted">
                Scroll horizontally to view all luck periods
              </p>
            </Card>
          )}

          {/* Raw JSON fallback if no structured pillars */}
          {pillars.length === 0 && (
            <Card title="Results">
              <pre className="overflow-x-auto text-xs text-text-secondary whitespace-pre-wrap max-h-96 overflow-y-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
