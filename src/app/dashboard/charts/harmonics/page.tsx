"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Harmonic Chart Analysis
// ---------------------------------------------------------------------------

// ---- Mock data ------------------------------------------------------------

interface HarmonicData {
  harmonic: number;
  label: string;
  description: string;
  strength: number;
  dominantSign: string;
  dominantPlanet: string;
  theme: string;
}

const HARMONICS: HarmonicData[] = [
  {
    harmonic: 1,
    label: "Radical (Natal)",
    description:
      "The base chart -- the fundamental pattern of your life. All other harmonics derive from this foundation.",
    strength: 100,
    dominantSign: "Gemini",
    dominantPlanet: "Sun",
    theme: "Core identity and life purpose",
  },
  {
    harmonic: 2,
    label: "Opposition",
    description:
      "Reveals inner tensions, polarities, and the struggle between opposing drives. Planets here show where you experience internal conflict that demands integration.",
    strength: 72,
    dominantSign: "Sagittarius",
    dominantPlanet: "Moon",
    theme: "Duality and inner conflict",
  },
  {
    harmonic: 3,
    label: "Trine (Joy)",
    description:
      "The harmonic of ease, pleasure, and natural talent. Shows where energy flows freely and what brings you genuine happiness without effort.",
    strength: 88,
    dominantSign: "Aquarius",
    dominantPlanet: "Venus",
    theme: "Talent, ease, and pleasure",
  },
  {
    harmonic: 4,
    label: "Square (Effort)",
    description:
      "The harmonic of challenge and manifestation through effort. Reveals where you build strength through overcoming obstacles and developing discipline.",
    strength: 65,
    dominantSign: "Virgo",
    dominantPlanet: "Saturn",
    theme: "Challenge and manifestation",
  },
  {
    harmonic: 5,
    label: "Quintile (Creative Power)",
    description:
      "The harmonic of creative genius and unique talent. Represents the power to create order from chaos and impose your unique style on the world.",
    strength: 79,
    dominantSign: "Leo",
    dominantPlanet: "Mercury",
    theme: "Creative genius and style",
  },
  {
    harmonic: 7,
    label: "Septile (Inspiration)",
    description:
      "The harmonic of spiritual inspiration and irrational knowing. Connected to mystical experiences, fate, and the sense that events are cosmically ordained.",
    strength: 54,
    dominantSign: "Pisces",
    dominantPlanet: "Neptune",
    theme: "Mysticism and divine inspiration",
  },
  {
    harmonic: 8,
    label: "Octile (Transformation)",
    description:
      "The harmonic of deep transformation and regeneration. Intensifies the 4th harmonic pattern, revealing where you undergo profound metamorphosis.",
    strength: 61,
    dominantSign: "Scorpio",
    dominantPlanet: "Pluto",
    theme: "Deep transformation",
  },
  {
    harmonic: 9,
    label: "Novile (Spiritual Purpose)",
    description:
      "The harmonic of joy through spiritual completion. Represents your highest potential for wisdom and the bliss that comes from fulfilling your spiritual mission.",
    strength: 83,
    dominantSign: "Sagittarius",
    dominantPlanet: "Jupiter",
    theme: "Spiritual joy and purpose",
  },
  {
    harmonic: 12,
    label: "Twelfth (Hidden Pattern)",
    description:
      "The harmonic of hidden forces and karmic patterns. Combines the 3rd and 4th harmonics, revealing unconscious drives that shape your destiny.",
    strength: 47,
    dominantSign: "Cancer",
    dominantPlanet: "Moon",
    theme: "Karma and hidden forces",
  },
];

interface HarmonicPlanet {
  planet: string;
  h1: string;
  h3: string;
  h5: string;
  h7: string;
  h9: string;
}

const HARMONIC_POSITIONS: HarmonicPlanet[] = [
  { planet: "Sun", h1: "24\u00b0 Gem", h3: "12\u00b0 Aqu", h5: "0\u00b0 Sag", h7: "18\u00b0 Ari", h9: "6\u00b0 Aqu" },
  { planet: "Moon", h1: "8\u00b0 Sco", h3: "24\u00b0 Can", h5: "10\u00b0 Pis", h7: "26\u00b0 Leo", h9: "12\u00b0 Can" },
  { planet: "Mercury", h1: "2\u00b0 Can", h3: "6\u00b0 Pis", h5: "10\u00b0 Sco", h7: "14\u00b0 Tau", h9: "18\u00b0 Pis" },
  { planet: "Venus", h1: "18\u00b0 Tau", h3: "24\u00b0 Cap", h5: "0\u00b0 Lib", h7: "6\u00b0 Pis", h9: "12\u00b0 Cap" },
  { planet: "Mars", h1: "11\u00b0 Leo", h3: "3\u00b0 Tau", h5: "25\u00b0 Sco", h7: "17\u00b0 Ari", h9: "9\u00b0 Tau" },
  { planet: "Jupiter", h1: "5\u00b0 Lib", h3: "15\u00b0 Gem", h5: "25\u00b0 Aqu", h7: "5\u00b0 Can", h9: "15\u00b0 Gem" },
  { planet: "Saturn", h1: "22\u00b0 Cap", h3: "6\u00b0 Lib", h5: "20\u00b0 Gem", h7: "4\u00b0 Sag", h9: "18\u00b0 Lib" },
];

const ASPECT_PATTERNS = [
  {
    name: "Grand Trine (H3)",
    planets: "Venus -- Jupiter -- Neptune",
    element: "Water",
    interpretation:
      "A flowing circuit of emotional intelligence, artistic sensitivity, and spiritual compassion. This pattern gifts natural empathy and creative vision.",
  },
  {
    name: "Stellium (H5)",
    planets: "Sun -- Mercury -- Mars",
    element: "Fire",
    interpretation:
      "Concentrated creative power channeled through self-expression, intellect, and drive. A signature of original thought put into decisive action.",
  },
  {
    name: "T-Square (H4)",
    planets: "Moon -- Saturn -- Pluto",
    element: "Cardinal",
    interpretation:
      "Emotional security needs clash with structural demands and transformative pressure. This tension produces tremendous resilience and psychological depth.",
  },
];

// ---- Strength Bar ---------------------------------------------------------

function StrengthBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-xs font-mono font-bold text-text-muted text-right">
        H{label}
      </span>
      <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-mono text-text-secondary">
        {value}%
      </span>
    </div>
  );
}

// ---- Page -----------------------------------------------------------------

export default function HarmonicsPage() {
  const [selectedHarmonic, setSelectedHarmonic] = useState<HarmonicData>(
    HARMONICS[0],
  );

  const strengthColor = (val: number) => {
    if (val >= 80) return "bg-gradient-to-r from-accent-emerald to-accent-emerald/60";
    if (val >= 60) return "bg-gradient-to-r from-accent-blue to-accent-blue/60";
    if (val >= 40) return "bg-gradient-to-r from-accent-amber to-accent-amber/60";
    return "bg-gradient-to-r from-accent-rose to-accent-rose/60";
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary">
            Harmonic Chart Analysis
          </h1>
          <Badge variant="info">Advanced</Badge>
        </div>
        <p className="mt-1 text-sm text-text-muted max-w-3xl">
          Harmonic charts reveal hidden patterns by multiplying all planetary
          positions by a whole number. Each harmonic unlocks a different
          dimension of experience -- talent, challenge, creativity, or spiritual
          purpose.
        </p>
      </div>

      {/* Harmonic Strength Overview */}
      <Card title="Harmonic Strength Profile" className="mb-6" glow="blue">
        <div className="space-y-2.5">
          {HARMONICS.map((h) => (
            <button
              key={h.harmonic}
              onClick={() => setSelectedHarmonic(h)}
              className={`w-full text-left rounded-lg px-2 py-1 transition-colors ${
                selectedHarmonic.harmonic === h.harmonic
                  ? "bg-accent-blue/10"
                  : "hover:bg-white/[0.03]"
              }`}
            >
              <StrengthBar
                label={String(h.harmonic)}
                value={h.strength}
                color={strengthColor(h.strength)}
              />
            </button>
          ))}
        </div>
      </Card>

      {/* Selected Harmonic Detail */}
      <Card
        title={`H${selectedHarmonic.harmonic}: ${selectedHarmonic.label}`}
        className="mb-6"
        glow="purple"
      >
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <div className="rounded-lg bg-white/[0.02] border border-border p-3">
            <p className="text-xs text-text-muted mb-1">Dominant Sign</p>
            <p className="text-sm font-medium text-accent-blue">
              {selectedHarmonic.dominantSign}
            </p>
          </div>
          <div className="rounded-lg bg-white/[0.02] border border-border p-3">
            <p className="text-xs text-text-muted mb-1">Dominant Planet</p>
            <p className="text-sm font-medium text-accent-purple">
              {selectedHarmonic.dominantPlanet}
            </p>
          </div>
          <div className="rounded-lg bg-white/[0.02] border border-border p-3">
            <p className="text-xs text-text-muted mb-1">Core Theme</p>
            <p className="text-sm font-medium text-accent-emerald">
              {selectedHarmonic.theme}
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">
          {selectedHarmonic.description}
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Harmonic Positions Table */}
        <Card title="Planetary Positions by Harmonic" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-medium text-text-muted">
                    Planet
                  </th>
                  <th className="pb-2 pr-4 font-medium text-text-muted">
                    H1 (Natal)
                  </th>
                  <th className="pb-2 pr-4 font-medium text-text-muted">
                    H3 (Joy)
                  </th>
                  <th className="pb-2 pr-4 font-medium text-text-muted">
                    H5 (Creative)
                  </th>
                  <th className="pb-2 pr-4 font-medium text-text-muted">
                    H7 (Inspire)
                  </th>
                  <th className="pb-2 font-medium text-text-muted">
                    H9 (Spirit)
                  </th>
                </tr>
              </thead>
              <tbody>
                {HARMONIC_POSITIONS.map((p) => (
                  <tr
                    key={p.planet}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-2.5 pr-4 font-medium text-text-primary">
                      {p.planet}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-text-secondary">
                      {p.h1}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-accent-emerald">
                      {p.h3}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-accent-blue">
                      {p.h5}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-accent-purple">
                      {p.h7}
                    </td>
                    <td className="py-2.5 font-mono text-xs text-accent-amber">
                      {p.h9}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Aspect Patterns */}
        <Card title="Notable Aspect Patterns" className="lg:col-span-2">
          <div className="grid gap-3 md:grid-cols-3">
            {ASPECT_PATTERNS.map((pattern) => (
              <div
                key={pattern.name}
                className="rounded-lg border border-border bg-white/[0.02] p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-text-primary">
                    {pattern.name}
                  </span>
                  <Badge variant="info">{pattern.element}</Badge>
                </div>
                <p className="text-xs text-accent-blue font-mono mb-2">
                  {pattern.planets}
                </p>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {pattern.interpretation}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
