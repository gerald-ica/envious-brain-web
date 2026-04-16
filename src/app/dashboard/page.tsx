"use client";

import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---- Placeholder data (will be replaced with API calls) -------------------

const PLACEHOLDER = {
  sunSign: "Gemini",
  moonSign: "Scorpio",
  ascendant: "Virgo",
  mbtiType: "INTJ",
  enneagram: "5w4",
  lifePathNumber: 7,
  lunarPhase: "Waning Gibbous",
  lunarEmoji: "\u{1F316}",
  lunarIllumination: "82%",
  transits: [
    { planet: "Mercury", sign: "Aries", aspect: "Conjunct Sun", type: "info" as const },
    { planet: "Venus", sign: "Pisces", aspect: "Trine Moon", type: "healthy" as const },
    { planet: "Mars", sign: "Cancer", aspect: "Square Saturn", type: "degraded" as const },
    { planet: "Jupiter", sign: "Gemini", aspect: "Sextile Asc", type: "healthy" as const },
  ],
  biorhythm: {
    physical: 72,
    emotional: -34,
    intellectual: 91,
  },
  forecast:
    "A day for strategic thinking. Mercury's conjunction with your natal Sun sharpens communication. Be mindful of Mars-Saturn tension in the afternoon -- avoid impulsive decisions in financial matters.",
};

// ---- Biorhythm mini visualization ----------------------------------------

function BiorhythmBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const normalized = Math.abs(value);
  const isPositive = value >= 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-xs text-text-muted">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${normalized}%` }}
        />
      </div>
      <span
        className={`w-12 text-right text-xs font-mono ${
          isPositive ? "text-accent-emerald" : "text-accent-rose"
        }`}
      >
        {isPositive ? "+" : ""}
        {value}%
      </span>
    </div>
  );
}

// ---- Dashboard page -------------------------------------------------------

export default function DashboardPage() {
  const { activeProfile } = useProfile();

  // Empty state -- no profile yet
  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-muted">
            Welcome to ENVI-OUS-BRAIN
          </p>
        </div>

        <Card title="Create Your Profile" glow="blue">
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-text-secondary">
              To view your personalized natal chart, transits, and daily
              forecast, add your first profile. All you need is a birth date,
              time, and location.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard/settings">
                <Button>Add your first profile</Button>
              </Link>
              <span className="text-xs text-text-muted">
                Your data is private and stored with end-to-end authentication.
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-muted">
          Overview for {activeProfile.name}
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* ---- Profile Summary ---- */}
        <Card title="Profile" glow="blue">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-text-primary">
              {activeProfile?.name ?? "No profile"}
            </p>
            <p className="text-sm text-text-secondary">
              {activeProfile?.birthDate ?? "--"} at{" "}
              {activeProfile?.birthTime ?? "--"}
            </p>
            <p className="text-xs text-text-muted">
              {activeProfile?.timezone ?? "--"}
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              <Badge variant="info">{PLACEHOLDER.mbtiType}</Badge>
              <Badge variant="neutral">{PLACEHOLDER.enneagram}</Badge>
              <Badge variant="neutral">LP {PLACEHOLDER.lifePathNumber}</Badge>
            </div>
          </div>
        </Card>

        {/* ---- Quick Stats (Sun/Moon/Asc) ---- */}
        <Card title="Natal Snapshot">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">
                {"\u2609"} Sun
              </span>
              <span className="text-sm font-medium text-text-primary">
                {PLACEHOLDER.sunSign}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">
                {"\u263D"} Moon
              </span>
              <span className="text-sm font-medium text-text-primary">
                {PLACEHOLDER.moonSign}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">
                {"\u2191"} Ascendant
              </span>
              <span className="text-sm font-medium text-text-primary">
                {PLACEHOLDER.ascendant}
              </span>
            </div>
          </div>
        </Card>

        {/* ---- Lunar Phase ---- */}
        <Card title="Lunar Phase">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{PLACEHOLDER.lunarEmoji}</span>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {PLACEHOLDER.lunarPhase}
              </p>
              <p className="text-xs text-text-muted">
                {PLACEHOLDER.lunarIllumination} illumination
              </p>
            </div>
          </div>
        </Card>

        {/* ---- Personality State ---- */}
        <Card title="Personality State">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">MBTI</span>
              <span className="text-sm font-semibold text-accent-purple">
                {PLACEHOLDER.mbtiType}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Enneagram</span>
              <span className="text-sm font-semibold text-accent-purple">
                {PLACEHOLDER.enneagram}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Life Path</span>
              <span className="text-sm font-semibold text-accent-purple">
                {PLACEHOLDER.lifePathNumber}
              </span>
            </div>
          </div>
        </Card>

        {/* ---- Active Transits ---- */}
        <Card title="Active Transits" className="sm:col-span-2">
          <div className="space-y-2">
            {PLACEHOLDER.transits.map((t) => (
              <div
                key={t.planet}
                className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-primary">
                    {t.planet}
                  </span>
                  <span className="text-xs text-text-muted">in {t.sign}</span>
                </div>
                <Badge variant={t.type}>{t.aspect}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* ---- Biorhythm ---- */}
        <Card title="Biorhythm">
          <div className="space-y-3">
            <BiorhythmBar
              label="Physical"
              value={PLACEHOLDER.biorhythm.physical}
              color="bg-accent-emerald"
            />
            <BiorhythmBar
              label="Emotional"
              value={PLACEHOLDER.biorhythm.emotional}
              color="bg-accent-blue"
            />
            <BiorhythmBar
              label="Intellectual"
              value={PLACEHOLDER.biorhythm.intellectual}
              color="bg-accent-purple"
            />
          </div>
        </Card>

        {/* ---- Daily Forecast ---- */}
        <Card
          title="Daily Forecast"
          className="sm:col-span-2 lg:col-span-3 xl:col-span-4"
          glow="purple"
        >
          <p className="text-sm leading-relaxed text-text-secondary">
            {PLACEHOLDER.forecast}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="info">Mercury Conjunct Sun</Badge>
            <Badge variant="degraded">Mars Square Saturn</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
