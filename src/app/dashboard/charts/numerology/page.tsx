"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Numerology
// ---------------------------------------------------------------------------

// ---- Mock data ------------------------------------------------------------

const MOCK_NUMBERS = {
  lifePath: {
    number: 7,
    title: "The Seeker",
    meaning:
      "Life Path 7 is the path of the spiritual seeker and intellectual explorer. You are driven by a deep need to understand the mysteries of life. Analytical, introspective, and perceptive, you seek truth beneath the surface. Your journey involves balancing your rich inner world with meaningful connection to others.",
    keywords: ["Introspection", "Analysis", "Spiritual", "Wisdom", "Mystery"],
  },
  expression: {
    number: 5,
    title: "The Freedom Seeker",
    meaning:
      "Expression 5 reveals a soul designed for versatility and adventure. You express yourself best through change, variety, and sensory experience. Your natural talents lie in communication, adaptability, and inspiring others to embrace freedom.",
    keywords: ["Versatility", "Adventure", "Communication", "Change"],
  },
  soulUrge: {
    number: 11,
    title: "The Illuminator",
    meaning:
      "Soul Urge 11 is a Master Number. Your deepest desire is to inspire and uplift humanity. You carry an extraordinary sensitivity and intuition that, when channeled properly, can illuminate the path for others.",
    keywords: ["Inspiration", "Intuition", "Vision", "Mastery"],
    isMaster: true,
  },
  personality: {
    number: 3,
    title: "The Communicator",
    meaning:
      "Personality 3 presents you to the world as creative, expressive, and socially magnetic. Others see you as someone who brings joy, artistry, and a sense of play to any environment.",
    keywords: ["Creative", "Expressive", "Social", "Joyful"],
  },
  personalYear: {
    number: 9,
    title: "Completion & Release",
    meaning:
      "Personal Year 9 is a year of endings, culmination, and letting go. It closes a nine-year cycle, asking you to release what no longer serves you to make room for the new cycle ahead.",
    keywords: ["Completion", "Release", "Transformation", "Wisdom"],
  },
};

const MASTER_NUMBERS = [
  { number: 11, active: true, label: "The Illuminator" },
  { number: 22, active: false, label: "The Master Builder" },
  { number: 33, active: false, label: "The Master Teacher" },
];

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
  const [fullName, setFullName] = useState("Gerald Alexander");
  const [birthDate, setBirthDate] = useState("1990-06-15");
  const [calculated, setCalculated] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => {
      setCalculated(true);
      setLoading(false);
    }, 800);
  };

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
              number={MOCK_NUMBERS.lifePath.number}
              title={`Life Path ${MOCK_NUMBERS.lifePath.number}: ${MOCK_NUMBERS.lifePath.title}`}
              meaning={MOCK_NUMBERS.lifePath.meaning}
              keywords={MOCK_NUMBERS.lifePath.keywords}
              large
            />
          </div>

          {/* Expression + Soul Urge + Personality */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NumberCard
              number={MOCK_NUMBERS.expression.number}
              title={`Expression: ${MOCK_NUMBERS.expression.title}`}
              meaning={MOCK_NUMBERS.expression.meaning}
              keywords={MOCK_NUMBERS.expression.keywords}
            />
            <NumberCard
              number={MOCK_NUMBERS.soulUrge.number}
              title={`Soul Urge: ${MOCK_NUMBERS.soulUrge.title}`}
              meaning={MOCK_NUMBERS.soulUrge.meaning}
              keywords={MOCK_NUMBERS.soulUrge.keywords}
              isMaster={MOCK_NUMBERS.soulUrge.isMaster}
            />
            <NumberCard
              number={MOCK_NUMBERS.personality.number}
              title={`Personality: ${MOCK_NUMBERS.personality.title}`}
              meaning={MOCK_NUMBERS.personality.meaning}
              keywords={MOCK_NUMBERS.personality.keywords}
            />
          </div>

          {/* Master Number Indicators */}
          <Card title="Master Number Indicators">
            <div className="grid gap-4 sm:grid-cols-3">
              {MASTER_NUMBERS.map((mn) => (
                <div
                  key={mn.number}
                  className={`flex items-center gap-4 rounded-xl border p-4 ${
                    mn.active
                      ? "border-accent-purple/30 bg-accent-purple/10"
                      : "border-border bg-white/[0.02] opacity-50"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xl font-bold ${
                      mn.active
                        ? "bg-accent-purple/20 text-accent-purple"
                        : "bg-white/5 text-text-muted"
                    }`}
                  >
                    {mn.number}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        mn.active ? "text-text-primary" : "text-text-muted"
                      }`}
                    >
                      {mn.label}
                    </p>
                    <p className="text-xs text-text-muted">
                      {mn.active ? "Present in your chart" : "Not active"}
                    </p>
                  </div>
                  {mn.active && (
                    <Badge variant="degraded" className="ml-auto">
                      Active
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Personal Year */}
          <Card title="Personal Year 2026" glow="blue">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-accent-blue/20 bg-accent-blue/10">
                <span className="text-4xl font-bold text-accent-blue">
                  {MOCK_NUMBERS.personalYear.number}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-text-primary mb-1">
                  {MOCK_NUMBERS.personalYear.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {MOCK_NUMBERS.personalYear.meaning}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {MOCK_NUMBERS.personalYear.keywords.map((kw) => (
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
