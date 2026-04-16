"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Color Psychology
// ---------------------------------------------------------------------------

// ---- Mock data ------------------------------------------------------------

interface ColorProfile {
  name: string;
  hex: string;
  energy: string;
  chakra: string;
  frequency: string;
  psychology: string;
  affinity: number;
  traits: string[];
}

const COLOR_PROFILES: ColorProfile[] = [
  {
    name: "Indigo",
    hex: "#4B0082",
    energy: "Third Eye / Intuition",
    chakra: "Ajna (6th)",
    frequency: "670--700 THz",
    psychology:
      "Indigo resonates with deep perception, inner knowing, and spiritual awareness. Those drawn to indigo possess strong intuition, visionary thinking, and a natural capacity for self-reflection. It is the color of the inner sage.",
    affinity: 94,
    traits: ["Intuitive", "Visionary", "Introspective", "Wise"],
  },
  {
    name: "Deep Blue",
    hex: "#0A2463",
    energy: "Throat / Communication",
    chakra: "Vishuddha (5th)",
    frequency: "620--670 THz",
    psychology:
      "Deep blue embodies authority, depth of thought, and trustworthiness. It calms the nervous system and supports clear, structured communication. Those aligned with deep blue value truth, order, and intellectual integrity.",
    affinity: 88,
    traits: ["Authoritative", "Trustworthy", "Structured", "Calm"],
  },
  {
    name: "Violet",
    hex: "#7B2D8E",
    energy: "Crown / Transcendence",
    chakra: "Sahasrara (7th)",
    frequency: "700--750 THz",
    psychology:
      "Violet bridges the material and spiritual realms. It represents transformation, creative imagination, and higher consciousness. Those drawn to violet are often seekers, artists, or healers operating at the edge of convention.",
    affinity: 82,
    traits: ["Transformative", "Creative", "Spiritual", "Unconventional"],
  },
  {
    name: "Silver",
    hex: "#C0C0C0",
    energy: "Lunar / Reflection",
    chakra: "Crown (7th)",
    frequency: "Metallic / Reflective",
    psychology:
      "Silver reflects the energy of the Moon -- intuition, dreams, and the subconscious mind. It represents emotional sophistication, adaptability, and a mirror-like quality that perceives others clearly.",
    affinity: 76,
    traits: ["Reflective", "Adaptive", "Emotionally intelligent", "Graceful"],
  },
  {
    name: "Emerald",
    hex: "#046307",
    energy: "Heart / Healing",
    chakra: "Anahata (4th)",
    frequency: "530--570 THz",
    psychology:
      "Emerald is the color of the heart center -- growth, renewal, and balanced love. It supports emotional healing and harmonious relationships. Those aligned with emerald are natural healers and mediators.",
    affinity: 65,
    traits: ["Healing", "Balanced", "Growing", "Compassionate"],
  },
  {
    name: "Obsidian",
    hex: "#1B1B1B",
    energy: "Root / Protection",
    chakra: "Muladhara (1st)",
    frequency: "Absorption / Void",
    psychology:
      "Obsidian absorbs and transforms energy. It represents protection, mystery, and the power found in darkness and the unknown. Those drawn to obsidian are unafraid of shadows and possess significant regenerative strength.",
    affinity: 71,
    traits: ["Protective", "Mysterious", "Powerful", "Regenerative"],
  },
];

const AURA_LAYERS = [
  { layer: "Primary Aura", color: "Indigo", hex: "#4B0082", description: "Your dominant energetic signature. Visible to intuitives as the strongest band in your field." },
  { layer: "Secondary Aura", color: "Deep Blue", hex: "#0A2463", description: "The supporting frequency. Emerges in professional and intellectual contexts." },
  { layer: "Shadow Aura", color: "Obsidian", hex: "#1B1B1B", description: "The hidden layer. Activates during stress or deep introspection." },
  { layer: "Aspiration", color: "Violet", hex: "#7B2D8E", description: "The color your energy field is evolving toward. Represents your growth edge." },
];

const ENVIRONMENT_RECS = [
  {
    space: "Workspace",
    colors: ["Deep Navy", "Cool Grey", "Accent Teal"],
    rationale: "Supports sustained focus and clear thinking. The deep navy provides intellectual depth, cool grey reduces visual noise, and teal accents stimulate creative problem-solving without overstimulation.",
  },
  {
    space: "Bedroom",
    colors: ["Soft Indigo", "Lavender", "Silver"],
    rationale: "Promotes deep rest and dream recall. Soft indigo supports the transition to sleep through its calming frequency. Lavender eases tension, and silver enhances lunar/subconscious connection.",
  },
  {
    space: "Creative Studio",
    colors: ["Violet", "Emerald Accents", "Warm White"],
    rationale: "Stimulates imaginative flow while maintaining grounding. Violet opens the creative channel, emerald accents keep the heart engaged, and warm white prevents energy from becoming too ethereal.",
  },
  {
    space: "Meditation Space",
    colors: ["Indigo", "Obsidian", "Gold Accents"],
    rationale: "Deepens inner awareness and spiritual practice. Indigo opens the third eye, obsidian provides grounding protection, and gold accents connect to higher wisdom traditions.",
  },
];

// ---- Page -----------------------------------------------------------------

export default function ColorPsychPage() {
  const [selectedColor, setSelectedColor] = useState<ColorProfile>(
    COLOR_PROFILES[0],
  );

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary">
            Color Psychology
          </h1>
          <Badge variant="info">Chromatic Profile</Badge>
        </div>
        <p className="text-sm text-text-muted max-w-3xl">
          Your color psychology profile maps the frequencies you naturally
          resonate with. Colors influence mood, cognition, and energy -- this
          analysis reveals your chromatic signature and environment
          recommendations.
        </p>
      </div>

      {/* Aura Layers */}
      <Card title="Energetic Color Layers" className="mb-6" glow="purple">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {AURA_LAYERS.map((a) => (
            <div
              key={a.layer}
              className="rounded-lg border border-border p-4 relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundColor: a.hex }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-4 w-4 rounded-full border border-white/20"
                    style={{ backgroundColor: a.hex }}
                  />
                  <span className="text-sm font-medium text-text-primary">
                    {a.color}
                  </span>
                </div>
                <p className="text-xs text-text-muted mb-1.5">{a.layer}</p>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {a.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Color Affinity Profiles */}
        <Card title="Color Affinities" className="lg:col-span-2">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {COLOR_PROFILES.map((c) => {
              const isSelected = selectedColor.name === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  className={`text-left rounded-lg border p-4 transition-colors relative overflow-hidden ${
                    isSelected
                      ? "border-accent-blue bg-accent-blue/5"
                      : "border-border bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <div
                    className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-15"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="h-5 w-5 rounded-md border border-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-sm font-medium text-text-primary">
                        {c.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-text-muted">{c.chakra}</span>
                      <Badge
                        variant={
                          c.affinity >= 85
                            ? "healthy"
                            : c.affinity >= 70
                              ? "info"
                              : "neutral"
                        }
                      >
                        {c.affinity}% affinity
                      </Badge>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${c.affinity}%`,
                          backgroundColor: c.hex,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Color Detail */}
        <Card title={`${selectedColor.name} -- Detailed Analysis`} glow="blue">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-12 w-12 rounded-lg border border-white/20"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {selectedColor.name}
                </p>
                <p className="text-xs text-text-muted">
                  {selectedColor.frequency}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white/[0.02] border border-border p-2">
                <span className="text-text-muted">Energy: </span>
                <span className="text-text-secondary">
                  {selectedColor.energy}
                </span>
              </div>
              <div className="rounded-lg bg-white/[0.02] border border-border p-2">
                <span className="text-text-muted">Chakra: </span>
                <span className="text-text-secondary">
                  {selectedColor.chakra}
                </span>
              </div>
            </div>

            <div className="flex gap-1 flex-wrap">
              {selectedColor.traits.map((t) => (
                <Badge key={t} variant="neutral">
                  {t}
                </Badge>
              ))}
            </div>

            <p className="text-xs leading-relaxed text-text-secondary">
              {selectedColor.psychology}
            </p>
          </div>
        </Card>

        {/* Environment Recommendations */}
        <Card title="Environment Recommendations">
          <div className="space-y-3">
            {ENVIRONMENT_RECS.map((rec) => (
              <div
                key={rec.space}
                className="rounded-lg border border-border bg-white/[0.02] p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-text-primary">
                    {rec.space}
                  </span>
                  <div className="flex gap-1">
                    {rec.colors.map((c) => (
                      <Badge key={c} variant="neutral">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {rec.rationale}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
