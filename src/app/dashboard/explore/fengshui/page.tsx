"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---- Flying Star Data ----

type StarRating = "auspicious" | "inauspicious" | "neutral";

interface FlyingStar {
  number: number;
  name: string;
  element: string;
  rating: StarRating;
  meaning: string;
}

const STAR_MEANINGS: Record<number, FlyingStar> = {
  1: { number: 1, name: "White Water Star", element: "Water", rating: "auspicious", meaning: "Career advancement, academic success, recognition" },
  2: { number: 2, name: "Black Earth Star", element: "Earth", rating: "inauspicious", meaning: "Illness, health problems, obstacles" },
  3: { number: 3, name: "Jade Wood Star", element: "Wood", rating: "inauspicious", meaning: "Quarrels, legal disputes, conflict" },
  4: { number: 4, name: "Green Wood Star", element: "Wood", rating: "auspicious", meaning: "Romance, creativity, academic success" },
  5: { number: 5, name: "Yellow Earth Star", element: "Earth", rating: "inauspicious", meaning: "Misfortune, catastrophe, danger -- the most afflictive star" },
  6: { number: 6, name: "White Metal Star", element: "Metal", rating: "auspicious", meaning: "Authority, power, windfall luck" },
  7: { number: 7, name: "Red Metal Star", element: "Metal", rating: "inauspicious", meaning: "Robbery, loss, deception, violence" },
  8: { number: 8, name: "White Earth Star", element: "Earth", rating: "auspicious", meaning: "Wealth, prosperity, great fortune -- current period ruling star" },
  9: { number: 9, name: "Purple Fire Star", element: "Fire", rating: "auspicious", meaning: "Future prosperity, fame, celebrations, events" },
};

// Luo Shu base: 4 9 2 / 3 5 7 / 8 1 6
// Flying star grids by period
const GRIDS: Record<string, number[][]> = {
  period: [
    [6, 2, 4],
    [5, 7, 9],
    [1, 3, 8],
  ],
  annual: [
    [3, 8, 1],
    [2, 4, 6],
    [7, 9, 5],
  ],
  monthly: [
    [9, 5, 7],
    [8, 1, 3],
    [4, 6, 2],
  ],
};

const DIRECTIONS = ["SE", "S", "SW", "E", "Center", "W", "NE", "N", "NW"];

// ---- Kua calculation -----------------------------------------------------

function calculateKua(year: number, isMale: boolean): number {
  // Reduce year digits to single digit
  let sum = String(year)
    .split("")
    .reduce((s, d) => s + Number(d), 0);
  while (sum > 9) {
    sum = String(sum)
      .split("")
      .reduce((s, d) => s + Number(d), 0);
  }
  // Male Kua: 10 - sum (or 11 - sum for years 2000+)
  // Female Kua: sum + 5 (or sum + 6 for years 2000+)
  let kua: number;
  if (isMale) {
    kua = year >= 2000 ? 11 - sum : 10 - sum;
  } else {
    kua = year >= 2000 ? sum + 6 : sum + 5;
  }
  if (kua === 5) kua = isMale ? 2 : 8; // Kua 5 doesn't exist, use 2 or 8
  while (kua > 9) kua -= 9;
  return kua;
}

interface KuaDirection {
  direction: string;
  type: string;
  meaning: string;
  rating: StarRating;
}

interface KuaProfile {
  number: number;
  group: "East" | "West";
  element: string;
  trigram: string;
  favorableDirections: KuaDirection[];
  unfavorableDirections: KuaDirection[];
}

// Static data for each of the 8 possible Kua numbers (1-4 East, 6-9 West).
// Each direction maps to a named house per traditional Eight Mansions.
const KUA_PROFILES: Record<number, KuaProfile> = {
  1: {
    number: 1,
    group: "East",
    element: "Water",
    trigram: "Kan",
    favorableDirections: [
      { direction: "Southeast", type: "Sheng Qi", meaning: "Prosperity & Success", rating: "auspicious" },
      { direction: "East", type: "Tian Yi", meaning: "Health & Vitality", rating: "auspicious" },
      { direction: "South", type: "Yan Nian", meaning: "Relationships & Longevity", rating: "auspicious" },
      { direction: "North", type: "Fu Wei", meaning: "Personal Growth & Stability", rating: "auspicious" },
    ],
    unfavorableDirections: [
      { direction: "West", type: "Ho Hai", meaning: "Minor setbacks, bad luck", rating: "inauspicious" },
      { direction: "Northeast", type: "Wu Gui", meaning: "Five Ghosts, backstabbing", rating: "inauspicious" },
      { direction: "Northwest", type: "Liu Sha", meaning: "Six Killings, relationship harm", rating: "inauspicious" },
      { direction: "Southwest", type: "Jue Ming", meaning: "Total Loss, worst direction", rating: "inauspicious" },
    ],
  },
  2: {
    number: 2,
    group: "West",
    element: "Earth",
    trigram: "K'un",
    favorableDirections: [
      { direction: "Northeast", type: "Sheng Qi", meaning: "Prosperity & Success", rating: "auspicious" },
      { direction: "West", type: "Tian Yi", meaning: "Health & Vitality", rating: "auspicious" },
      { direction: "Northwest", type: "Yan Nian", meaning: "Relationships & Longevity", rating: "auspicious" },
      { direction: "Southwest", type: "Fu Wei", meaning: "Personal Growth & Stability", rating: "auspicious" },
    ],
    unfavorableDirections: [
      { direction: "East", type: "Ho Hai", meaning: "Minor setbacks, bad luck", rating: "inauspicious" },
      { direction: "Southeast", type: "Wu Gui", meaning: "Five Ghosts, backstabbing", rating: "inauspicious" },
      { direction: "South", type: "Liu Sha", meaning: "Six Killings, relationship harm", rating: "inauspicious" },
      { direction: "North", type: "Jue Ming", meaning: "Total Loss, worst direction", rating: "inauspicious" },
    ],
  },
  3: {
    number: 3,
    group: "East",
    element: "Wood",
    trigram: "Chen",
    favorableDirections: [
      { direction: "South", type: "Sheng Qi", meaning: "Prosperity & Success", rating: "auspicious" },
      { direction: "North", type: "Tian Yi", meaning: "Health & Vitality", rating: "auspicious" },
      { direction: "Southeast", type: "Yan Nian", meaning: "Relationships & Longevity", rating: "auspicious" },
      { direction: "East", type: "Fu Wei", meaning: "Personal Growth & Stability", rating: "auspicious" },
    ],
    unfavorableDirections: [
      { direction: "Southwest", type: "Ho Hai", meaning: "Minor setbacks, bad luck", rating: "inauspicious" },
      { direction: "Northwest", type: "Wu Gui", meaning: "Five Ghosts, backstabbing", rating: "inauspicious" },
      { direction: "Northeast", type: "Liu Sha", meaning: "Six Killings, relationship harm", rating: "inauspicious" },
      { direction: "West", type: "Jue Ming", meaning: "Total Loss, worst direction", rating: "inauspicious" },
    ],
  },
  4: {
    number: 4,
    group: "East",
    element: "Wood",
    trigram: "Sun",
    favorableDirections: [
      { direction: "North", type: "Sheng Qi", meaning: "Prosperity & Success", rating: "auspicious" },
      { direction: "South", type: "Tian Yi", meaning: "Health & Vitality", rating: "auspicious" },
      { direction: "East", type: "Yan Nian", meaning: "Relationships & Longevity", rating: "auspicious" },
      { direction: "Southeast", type: "Fu Wei", meaning: "Personal Growth & Stability", rating: "auspicious" },
    ],
    unfavorableDirections: [
      { direction: "Northwest", type: "Ho Hai", meaning: "Minor setbacks, bad luck", rating: "inauspicious" },
      { direction: "Southwest", type: "Wu Gui", meaning: "Five Ghosts, backstabbing", rating: "inauspicious" },
      { direction: "West", type: "Liu Sha", meaning: "Six Killings, relationship harm", rating: "inauspicious" },
      { direction: "Northeast", type: "Jue Ming", meaning: "Total Loss, worst direction", rating: "inauspicious" },
    ],
  },
  6: {
    number: 6,
    group: "West",
    element: "Metal",
    trigram: "Ch'ien",
    favorableDirections: [
      { direction: "West", type: "Sheng Qi", meaning: "Prosperity & Success", rating: "auspicious" },
      { direction: "Northeast", type: "Tian Yi", meaning: "Health & Vitality", rating: "auspicious" },
      { direction: "Southwest", type: "Yan Nian", meaning: "Relationships & Longevity", rating: "auspicious" },
      { direction: "Northwest", type: "Fu Wei", meaning: "Personal Growth & Stability", rating: "auspicious" },
    ],
    unfavorableDirections: [
      { direction: "Southeast", type: "Ho Hai", meaning: "Minor setbacks, bad luck", rating: "inauspicious" },
      { direction: "East", type: "Wu Gui", meaning: "Five Ghosts, backstabbing", rating: "inauspicious" },
      { direction: "North", type: "Liu Sha", meaning: "Six Killings, relationship harm", rating: "inauspicious" },
      { direction: "South", type: "Jue Ming", meaning: "Total Loss, worst direction", rating: "inauspicious" },
    ],
  },
  7: {
    number: 7,
    group: "West",
    element: "Metal",
    trigram: "Tui",
    favorableDirections: [
      { direction: "Northwest", type: "Sheng Qi", meaning: "Prosperity & Success", rating: "auspicious" },
      { direction: "Southwest", type: "Tian Yi", meaning: "Health & Vitality", rating: "auspicious" },
      { direction: "Northeast", type: "Yan Nian", meaning: "Relationships & Longevity", rating: "auspicious" },
      { direction: "West", type: "Fu Wei", meaning: "Personal Growth & Stability", rating: "auspicious" },
    ],
    unfavorableDirections: [
      { direction: "North", type: "Ho Hai", meaning: "Minor setbacks, bad luck", rating: "inauspicious" },
      { direction: "South", type: "Wu Gui", meaning: "Five Ghosts, backstabbing", rating: "inauspicious" },
      { direction: "Southeast", type: "Liu Sha", meaning: "Six Killings, relationship harm", rating: "inauspicious" },
      { direction: "East", type: "Jue Ming", meaning: "Total Loss, worst direction", rating: "inauspicious" },
    ],
  },
  8: {
    number: 8,
    group: "West",
    element: "Earth",
    trigram: "Ken",
    favorableDirections: [
      { direction: "Southwest", type: "Sheng Qi", meaning: "Prosperity & Success", rating: "auspicious" },
      { direction: "Northwest", type: "Tian Yi", meaning: "Health & Vitality", rating: "auspicious" },
      { direction: "West", type: "Yan Nian", meaning: "Relationships & Longevity", rating: "auspicious" },
      { direction: "Northeast", type: "Fu Wei", meaning: "Personal Growth & Stability", rating: "auspicious" },
    ],
    unfavorableDirections: [
      { direction: "South", type: "Ho Hai", meaning: "Minor setbacks, bad luck", rating: "inauspicious" },
      { direction: "North", type: "Wu Gui", meaning: "Five Ghosts, backstabbing", rating: "inauspicious" },
      { direction: "East", type: "Liu Sha", meaning: "Six Killings, relationship harm", rating: "inauspicious" },
      { direction: "Southeast", type: "Jue Ming", meaning: "Total Loss, worst direction", rating: "inauspicious" },
    ],
  },
  9: {
    number: 9,
    group: "East",
    element: "Fire",
    trigram: "Li",
    favorableDirections: [
      { direction: "East", type: "Sheng Qi", meaning: "Prosperity & Success", rating: "auspicious" },
      { direction: "Southeast", type: "Tian Yi", meaning: "Health & Vitality", rating: "auspicious" },
      { direction: "North", type: "Yan Nian", meaning: "Relationships & Longevity", rating: "auspicious" },
      { direction: "South", type: "Fu Wei", meaning: "Personal Growth & Stability", rating: "auspicious" },
    ],
    unfavorableDirections: [
      { direction: "Northeast", type: "Ho Hai", meaning: "Minor setbacks, bad luck", rating: "inauspicious" },
      { direction: "West", type: "Wu Gui", meaning: "Five Ghosts, backstabbing", rating: "inauspicious" },
      { direction: "Southwest", type: "Liu Sha", meaning: "Six Killings, relationship harm", rating: "inauspicious" },
      { direction: "Northwest", type: "Jue Ming", meaning: "Total Loss, worst direction", rating: "inauspicious" },
    ],
  },
};

// ---- Luo Shu Grid Component ----

function LuoShuGrid({ grid }: { grid: number[][] }) {
  return (
    <div className="grid grid-cols-3 gap-1 max-w-xs mx-auto">
      {grid.flat().map((starNum, i) => {
        const star = STAR_MEANINGS[starNum];
        const borderColor =
          star.rating === "auspicious"
            ? "border-accent-emerald/40"
            : star.rating === "inauspicious"
              ? "border-accent-rose/40"
              : "border-border";
        const bgColor =
          star.rating === "auspicious"
            ? "bg-accent-emerald/10"
            : star.rating === "inauspicious"
              ? "bg-accent-rose/10"
              : "bg-white/[0.02]";
        const textColor =
          star.rating === "auspicious"
            ? "text-accent-emerald"
            : star.rating === "inauspicious"
              ? "text-accent-rose"
              : "text-text-muted";

        return (
          <div
            key={i}
            className={`rounded-lg border ${borderColor} ${bgColor} p-3 text-center transition-all hover:scale-105`}
            title={`${star.name}: ${star.meaning}`}
          >
            <div className="text-[10px] text-text-muted mb-0.5">
              {DIRECTIONS[i]}
            </div>
            <div className={`text-2xl font-bold font-mono ${textColor}`}>
              {starNum}
            </div>
            <div className="text-[9px] text-text-muted mt-0.5 truncate">
              {star.element}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Page ----

export default function FengShuiPage() {
  const { activeProfile } = useProfile();
  const [activeGrid, setActiveGrid] = useState<"period" | "annual" | "monthly">(
    "period",
  );
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [gender, setGender] = useState<"male" | "female">("male");

  const currentGrid = GRIDS[activeGrid];

  // Compute Kua reactively. Default to 2023 (gives Kua 2) if no profile.
  const kua = useMemo(() => {
    const year = activeProfile?.birthDate
      ? new Date(activeProfile.birthDate).getFullYear()
      : null;
    if (!year || Number.isNaN(year)) return null;
    const kuaNum = calculateKua(year, gender === "male");
    return KUA_PROFILES[kuaNum] ?? null;
  }, [activeProfile, gender]);

  const birthYear = activeProfile?.birthDate
    ? new Date(activeProfile.birthDate).getFullYear()
    : null;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary">Feng Shui</h1>
          <Badge variant="info">Flying Stars</Badge>
        </div>
        <p className="text-sm text-text-muted">
          Luo Shu grid flying star analysis with personal Kua number and
          directional recommendations.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Flying Star Grid */}
        <Card title="Luo Shu Grid" glow="blue">
          {/* Toggle */}
          <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white/5">
            {(["period", "annual", "monthly"] as const).map((type) => (
              <Button
                key={type}
                variant={activeGrid === type ? "primary" : "ghost"}
                onClick={() => setActiveGrid(type)}
                className="flex-1 text-xs capitalize"
              >
                {type === "period" ? "Period 9 (2024-2043)" : type === "annual" ? "Annual 2026" : "Monthly Apr"}
              </Button>
            ))}
          </div>

          <LuoShuGrid grid={currentGrid} />

          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-accent-emerald" />
              Auspicious
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-accent-rose" />
              Inauspicious
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
              Neutral
            </div>
          </div>
        </Card>

        {/* Star Meanings Reference */}
        <Card title="Star Reference">
          <div className="space-y-1.5">
            {Object.values(STAR_MEANINGS).map((star) => {
              const isSelected = selectedStar === star.number;
              const ratingColor =
                star.rating === "auspicious"
                  ? "text-accent-emerald"
                  : star.rating === "inauspicious"
                    ? "text-accent-rose"
                    : "text-text-muted";

              return (
                <button
                  key={star.number}
                  onClick={() =>
                    setSelectedStar(isSelected ? null : star.number)
                  }
                  className={`w-full text-left rounded-lg border px-3 py-2 transition-all ${
                    isSelected
                      ? "border-accent-blue/40 bg-accent-blue/5"
                      : "border-border bg-white/[0.02] hover:border-border-hover"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg font-bold font-mono w-6 ${ratingColor}`}
                    >
                      {star.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {star.name}
                        </span>
                        <Badge
                          variant={
                            star.rating === "auspicious"
                              ? "healthy"
                              : star.rating === "inauspicious"
                                ? "error"
                                : "neutral"
                          }
                        >
                          {star.element}
                        </Badge>
                      </div>
                      {isSelected && (
                        <p className="text-xs text-text-secondary mt-1">
                          {star.meaning}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Personal Kua Number */}
        <Card title="Personal Kua Number" glow="purple">
          {!kua ? (
            <div className="space-y-4 text-center py-4">
              <p className="text-sm leading-relaxed text-text-secondary">
                Add a profile with your birth date to calculate your personal
                Kua number and favorable directions.
              </p>
              <Link href="/dashboard/settings">
                <Button>Add your first profile</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent-purple bg-accent-purple/10">
                  <span className="text-3xl font-bold text-accent-purple">
                    {kua.number}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-text-primary">
                    Kua {kua.number} - {kua.trigram}
                  </p>
                  <div className="flex justify-center gap-2 mt-1">
                    <Badge variant="info">{kua.group} Group</Badge>
                    <Badge variant="neutral">{kua.element}</Badge>
                  </div>
                </div>
              </div>

              {/* Gender toggle (profile doesn't store gender) */}
              <div className="mb-3">
                <p className="text-[11px] uppercase tracking-wider text-text-muted mb-2 text-center">
                  Calculated for
                </p>
                <div className="flex gap-1 p-1 rounded-lg bg-white/5 max-w-[200px] mx-auto">
                  {(["male", "female"] as const).map((g) => (
                    <Button
                      key={g}
                      variant={gender === g ? "primary" : "ghost"}
                      onClick={() => setGender(g)}
                      className="flex-1 text-xs capitalize"
                    >
                      {g}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-text-muted text-center">
                Based on birth year {birthYear} and gender. Your Kua number
                determines your personal favorable and unfavorable directions.
              </div>
            </>
          )}
        </Card>

        {/* Favorable Directions */}
        <Card title="Directional Analysis">
          {!kua ? (
            <div className="text-sm text-text-muted text-center py-8">
              Add a profile to see your favorable and unfavorable directions.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-accent-emerald font-semibold mb-2 uppercase tracking-wider">
                  Favorable Directions
                </p>
                <div className="space-y-1.5">
                  {kua.favorableDirections.map((dir) => (
                    <div
                      key={dir.direction}
                      className="flex items-center justify-between rounded-lg border border-accent-emerald/20 bg-accent-emerald/5 px-3 py-2"
                    >
                      <div>
                        <span className="text-sm font-medium text-text-primary">
                          {dir.direction}
                        </span>
                        <span className="text-xs text-text-muted ml-2">
                          ({dir.type})
                        </span>
                      </div>
                      <span className="text-xs text-accent-emerald">
                        {dir.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-accent-rose font-semibold mb-2 uppercase tracking-wider">
                  Unfavorable Directions
                </p>
                <div className="space-y-1.5">
                  {kua.unfavorableDirections.map((dir) => (
                    <div
                      key={dir.direction}
                      className="flex items-center justify-between rounded-lg border border-accent-rose/20 bg-accent-rose/5 px-3 py-2"
                    >
                      <div>
                        <span className="text-sm font-medium text-text-primary">
                          {dir.direction}
                        </span>
                        <span className="text-xs text-text-muted ml-2">
                          ({dir.type})
                        </span>
                      </div>
                      <span className="text-xs text-accent-rose">
                        {dir.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
