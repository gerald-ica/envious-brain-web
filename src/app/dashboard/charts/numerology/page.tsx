"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Numerology
// ---------------------------------------------------------------------------

// ---- Pythagorean numerology values ---------------------------------------

const LETTER_VALUES: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};
const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function reduceNumber(n: number): number {
  // Keep master numbers 11, 22, 33
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n)
      .split("")
      .reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

function lifePathFromBirth(birthDate: string): number {
  // birthDate format "YYYY-MM-DD"
  if (!birthDate) return 0;
  const digits = birthDate.replace(/\D/g, "").split("").map(Number);
  if (!digits.length) return 0;
  const sum = digits.reduce((a, b) => a + b, 0);
  return reduceNumber(sum);
}

function sumName(name: string, filter: (letter: string) => boolean): number {
  const letters = name.toLowerCase().replace(/[^a-z]/g, "").split("");
  const sum = letters
    .filter(filter)
    .reduce((s, l) => s + (LETTER_VALUES[l] ?? 0), 0);
  return reduceNumber(sum);
}

function expressionNumber(name: string): number {
  return sumName(name, () => true);
}

function soulUrgeNumber(name: string): number {
  return sumName(name, (l) => VOWELS.has(l));
}

function personalityNumber(name: string): number {
  return sumName(name, (l) => !VOWELS.has(l));
}

function personalYearNumber(birthDate: string, year: number): number {
  if (!birthDate) return 0;
  const [, mm, dd] = birthDate.split("-");
  if (!mm || !dd) return 0;
  const digits = (mm + dd + String(year)).split("").map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  return reduceNumber(sum);
}

// ---- Number meanings -----------------------------------------------------

interface NumberInfo {
  title: string;
  meaning: string;
  keywords: string[];
}

const NUMBER_MEANINGS: Record<number, NumberInfo> = {
  1: {
    title: "The Leader",
    meaning:
      "Number 1 is the path of the pioneer, leader, and original thinker. You are driven to carve your own direction and inspire independence in others.",
    keywords: ["Leadership", "Independence", "Originality", "Drive"],
  },
  2: {
    title: "The Diplomat",
    meaning:
      "Number 2 resonates with partnership, cooperation, and sensitivity. You bring harmony to groups and excel at reading subtle emotional currents.",
    keywords: ["Cooperation", "Harmony", "Sensitivity", "Balance"],
  },
  3: {
    title: "The Communicator",
    meaning:
      "Number 3 is the path of self-expression, creativity, and joy. You uplift others through words, art, and social magnetism.",
    keywords: ["Creativity", "Expression", "Joy", "Social"],
  },
  4: {
    title: "The Builder",
    meaning:
      "Number 4 is the path of structure, discipline, and foundations. You create enduring things through patience and methodical effort.",
    keywords: ["Structure", "Discipline", "Foundation", "Reliability"],
  },
  5: {
    title: "The Freedom Seeker",
    meaning:
      "Number 5 is the path of versatility and adventure. You express yourself through change, variety, and sensory experience.",
    keywords: ["Versatility", "Adventure", "Freedom", "Change"],
  },
  6: {
    title: "The Nurturer",
    meaning:
      "Number 6 is the path of responsibility, care, and devotion. You create beauty and harmony, often acting as healer or teacher for others.",
    keywords: ["Nurture", "Responsibility", "Beauty", "Harmony"],
  },
  7: {
    title: "The Seeker",
    meaning:
      "Number 7 is the path of the spiritual seeker and intellectual explorer. Analytical, introspective, and perceptive, you seek truth beneath the surface.",
    keywords: ["Introspection", "Analysis", "Spiritual", "Wisdom"],
  },
  8: {
    title: "The Achiever",
    meaning:
      "Number 8 is the path of power, ambition, and material mastery. You are built to manage resources, build enterprises, and lead in the world of form.",
    keywords: ["Ambition", "Power", "Mastery", "Authority"],
  },
  9: {
    title: "The Humanitarian",
    meaning:
      "Number 9 is the path of completion, compassion, and universal love. You feel called to serve something larger than yourself.",
    keywords: ["Compassion", "Completion", "Wisdom", "Service"],
  },
  11: {
    title: "The Illuminator",
    meaning:
      "Master Number 11. Your deepest vibration is to inspire and uplift humanity. An extraordinary sensitivity and intuition illuminates the path for others.",
    keywords: ["Inspiration", "Intuition", "Vision", "Mastery"],
  },
  22: {
    title: "The Master Builder",
    meaning:
      "Master Number 22. You are wired to manifest visionary ideas in concrete form, bridging the spiritual and material on a grand scale.",
    keywords: ["Manifestation", "Vision", "Structure", "Legacy"],
  },
  33: {
    title: "The Master Teacher",
    meaning:
      "Master Number 33. The rarest master number -- a path of selfless service, profound compassion, and teaching through embodiment.",
    keywords: ["Service", "Compassion", "Teaching", "Embodiment"],
  },
};

function meaningFor(n: number): NumberInfo {
  return (
    NUMBER_MEANINGS[n] ?? {
      title: "Unknown",
      meaning: "Enter your full birth name and date to calculate this number.",
      keywords: [],
    }
  );
}

function isMasterNumber(n: number): boolean {
  return n === 11 || n === 22 || n === 33;
}

// ---- Number card component ------------------------------------------------

function NumberCard({
  number,
  title,
  meaning,
  keywords,
  isMaster,
  large,
}: {
  number: number;
  title: string;
  meaning: string;
  keywords: string[];
  isMaster?: boolean;
  large?: boolean;
}) {
  return (
    <Card className={large ? "lg:col-span-2" : ""} glow={isMaster ? "purple" : "none"}>
      <div className={`flex ${large ? "flex-col sm:flex-row" : "flex-col"} gap-4`}>
        {/* Big number */}
        <div
          className={`flex shrink-0 items-center justify-center rounded-xl border ${
            isMaster
              ? "border-accent-purple/30 bg-accent-purple/10"
              : "border-accent-blue/20 bg-accent-blue/10"
          } ${large ? "h-24 w-24" : "h-16 w-16 mx-auto sm:mx-0"}`}
        >
          <span
            className={`font-bold ${
              isMaster ? "text-accent-purple" : "text-accent-blue"
            } ${large ? "text-4xl" : "text-3xl"}`}
          >
            {number}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-semibold text-text-primary">
              {title}
            </h3>
            {isMaster && <Badge variant="degraded">Master Number</Badge>}
          </div>
          <p className="text-sm leading-relaxed text-text-secondary">
            {meaning}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {keywords.map((kw) => (
              <Badge key={kw} variant="neutral">
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---- Page -----------------------------------------------------------------

export default function NumerologyPage() {
  const { activeProfile } = useProfile();

  const [fullName, setFullName] = useState(activeProfile?.name ?? "");
  const [birthDate, setBirthDate] = useState(activeProfile?.birthDate ?? "");
  const [calculated, setCalculated] = useState(
    Boolean(activeProfile?.name && activeProfile?.birthDate),
  );
  const [loading, setLoading] = useState(false);

  // Re-sync inputs whenever the active profile changes
  useEffect(() => {
    if (activeProfile) {
      setFullName(activeProfile.name);
      setBirthDate(activeProfile.birthDate);
      setCalculated(Boolean(activeProfile.name && activeProfile.birthDate));
    }
  }, [activeProfile]);

  // Compute numbers reactively
  const numbers = useMemo(() => {
    const lifePath = lifePathFromBirth(birthDate);
    const expression = expressionNumber(fullName);
    const soulUrge = soulUrgeNumber(fullName);
    const personality = personalityNumber(fullName);
    const personalYear = personalYearNumber(birthDate, new Date().getFullYear());

    const active = new Set<number>(
      [lifePath, expression, soulUrge, personality, personalYear].filter(
        isMasterNumber,
      ),
    );

    return { lifePath, expression, soulUrge, personality, personalYear, active };
  }, [fullName, birthDate]);

  const currentYear = new Date().getFullYear();

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => {
      setCalculated(true);
      setLoading(false);
    }, 400);
  };

  // Empty state -- no profile yet
  if (!activeProfile && !fullName && !birthDate) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Numerology</h1>
          <p className="text-sm text-text-muted">
            Discover the hidden meaning in your name and birth date
          </p>
        </div>
        <Card title="Create a profile" glow="blue">
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-text-secondary">
              Add a profile with your full birth name and birth date to see
              your Life Path, Expression, Soul Urge, Personality, and Personal
              Year numbers.
            </p>
            <Link href="/dashboard/settings">
              <Button>Add your first profile</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const lifePathInfo = meaningFor(numbers.lifePath);
  const expressionInfo = meaningFor(numbers.expression);
  const soulUrgeInfo = meaningFor(numbers.soulUrge);
  const personalityInfo = meaningFor(numbers.personality);
  const personalYearInfo = meaningFor(numbers.personalYear);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Numerology</h1>
        <p className="mt-1 text-sm text-text-muted">
          Discover the hidden meaning in your name and birth date
        </p>
      </div>

      {/* Input Form */}
      <Card title="Your Information" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Full Birth Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
          <Input
            label="Birth Date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
          <div className="flex items-end">
            <Button onClick={handleCalculate} disabled={loading} className="w-full">
              {loading ? "Calculating..." : "Calculate Numbers"}
            </Button>
          </div>
        </div>
      </Card>

      {calculated && (
        <div className="animate-fade-in space-y-6">
          {/* Life Path (featured) */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Core Numbers
            </h2>
            <NumberCard
              number={numbers.lifePath}
              title={`Life Path ${numbers.lifePath}: ${lifePathInfo.title}`}
              meaning={lifePathInfo.meaning}
              keywords={lifePathInfo.keywords}
              isMaster={isMasterNumber(numbers.lifePath)}
              large
            />
          </div>

          {/* Expression + Soul Urge + Personality */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NumberCard
              number={numbers.expression}
              title={`Expression: ${expressionInfo.title}`}
              meaning={expressionInfo.meaning}
              keywords={expressionInfo.keywords}
              isMaster={isMasterNumber(numbers.expression)}
            />
            <NumberCard
              number={numbers.soulUrge}
              title={`Soul Urge: ${soulUrgeInfo.title}`}
              meaning={soulUrgeInfo.meaning}
              keywords={soulUrgeInfo.keywords}
              isMaster={isMasterNumber(numbers.soulUrge)}
            />
            <NumberCard
              number={numbers.personality}
              title={`Personality: ${personalityInfo.title}`}
              meaning={personalityInfo.meaning}
              keywords={personalityInfo.keywords}
              isMaster={isMasterNumber(numbers.personality)}
            />
          </div>

          {/* Master Number Indicators */}
          <Card title="Master Number Indicators">
            <div className="grid gap-4 sm:grid-cols-3">
              {[11, 22, 33].map((mn) => {
                const active = numbers.active.has(mn);
                const info = meaningFor(mn);
                return (
                  <div
                    key={mn}
                    className={`flex items-center gap-4 rounded-xl border p-4 ${
                      active
                        ? "border-accent-purple/30 bg-accent-purple/10"
                        : "border-border bg-white/[0.02] opacity-50"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xl font-bold ${
                        active
                          ? "bg-accent-purple/20 text-accent-purple"
                          : "bg-white/5 text-text-muted"
                      }`}
                    >
                      {mn}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          active ? "text-text-primary" : "text-text-muted"
                        }`}
                      >
                        {info.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {active ? "Present in your chart" : "Not active"}
                      </p>
                    </div>
                    {active && (
                      <Badge variant="degraded" className="ml-auto">
                        Active
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Personal Year */}
          <Card title={`Personal Year ${currentYear}`} glow="blue">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-accent-blue/20 bg-accent-blue/10">
                <span className="text-4xl font-bold text-accent-blue">
                  {numbers.personalYear}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-text-primary mb-1">
                  {personalYearInfo.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {personalYearInfo.meaning}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {personalYearInfo.keywords.map((kw) => (
                    <Badge key={kw} variant="info">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
