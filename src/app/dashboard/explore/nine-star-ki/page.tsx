"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Nine Star Ki
// ---------------------------------------------------------------------------

// ---- Mock data ------------------------------------------------------------

interface NineStarProfile {
  star: number;
  name: string;
  element: string;
  trigram: string;
  direction: string;
  season: string;
  color: string;
  organ: string;
  traits: string[];
  description: string;
}

const NINE_STARS: NineStarProfile[] = [
  { star: 1, name: "Water", element: "Water", trigram: "\u2635", direction: "North", season: "Mid-Winter", color: "White/Black", organ: "Kidneys", traits: ["Adaptable", "Independent", "Philosophical", "Diplomatic"], description: "Flowing and adaptable like water, 1-Water people navigate life with quiet persistence. They possess natural depth and tend to be reflective, sociable yet independent. They find their way around obstacles rather than confronting them directly." },
  { star: 2, name: "Earth", element: "Earth", trigram: "\u2637", direction: "South-West", season: "Late Summer", color: "Black", organ: "Stomach", traits: ["Nurturing", "Reliable", "Detail-oriented", "Supportive"], description: "Grounded and receptive like the earth, 2-Earth people provide a stabilizing foundation for those around them. They are naturally devoted, attentive to detail, and prefer supportive roles where their reliability shines." },
  { star: 3, name: "Thunder", element: "Wood", trigram: "\u2633", direction: "East", season: "Early Spring", color: "Bright Green", organ: "Liver", traits: ["Ambitious", "Energetic", "Direct", "Pioneering"], description: "Dynamic and assertive like thunder, 3-Thunder people burst onto the scene with enthusiasm and drive. They are natural initiators, sometimes impulsive but always energizing. Growth and forward motion define their path." },
  { star: 4, name: "Wind", element: "Wood", trigram: "\u2634", direction: "South-East", season: "Late Spring", color: "Green/Blue", organ: "Gallbladder", traits: ["Creative", "Flexible", "Communicative", "Gentle"], description: "Gentle and penetrating like the wind, 4-Wind people influence their environment through persistence and charm. They are natural communicators with strong creative and artistic sensibilities." },
  { star: 5, name: "Center", element: "Earth", trigram: "--", direction: "Center", season: "Transition", color: "Yellow", organ: "Spleen", traits: ["Powerful", "Commanding", "Transformative", "Intense"], description: "The axis around which everything revolves, 5-Center people carry enormous personal power. They can be magnetic leaders or overwhelming forces depending on their balance. This is the most intense and transformative of all nine stars." },
  { star: 6, name: "Heaven", element: "Metal", trigram: "\u2630", direction: "North-West", season: "Late Autumn", color: "White", organ: "Lungs", traits: ["Authoritative", "Principled", "Organized", "Responsible"], description: "Expansive and authoritative like heaven, 6-Heaven people are natural leaders with strong ethical principles. They take responsibility seriously and create order wherever they go." },
  { star: 7, name: "Lake", element: "Metal", trigram: "\u2631", direction: "West", season: "Mid-Autumn", color: "Red", organ: "Lungs", traits: ["Joyful", "Persuasive", "Magnetic", "Hedonistic"], description: "Reflective and joyful like a still lake, 7-Lake people bring pleasure and social magnetism. They are gifted communicators and entertainers who value beauty, comfort, and the art of enjoyment." },
  { star: 8, name: "Mountain", element: "Earth", trigram: "\u2636", direction: "North-East", season: "Late Winter", color: "White/Purple", organ: "Stomach", traits: ["Steady", "Contemplative", "Stubborn", "Revolutionary"], description: "Still and immovable like a mountain, 8-Mountain people project quiet strength and determination. They are contemplative, sometimes stubborn, but capable of revolutionary change when they finally move." },
  { star: 9, name: "Fire", element: "Fire", trigram: "\u2632", direction: "South", season: "Mid-Summer", color: "Purple/Red", organ: "Heart", traits: ["Passionate", "Illuminating", "Sociable", "Volatile"], description: "Bright and illuminating like fire, 9-Fire people bring warmth, passion, and visibility. They are naturally drawn to the spotlight and have keen aesthetic sensibilities. Their challenge is sustaining the flame without burning out." },
];

const USER_PROFILE = {
  mainStar: 7,
  characterStar: 2,
  energeticStar: 6,
  year: 1990,
};

interface YearCycle {
  year: number;
  star: number;
  name: string;
  energy: string;
  forecast: string;
}

const YEAR_CYCLES: YearCycle[] = [
  { year: 2024, star: 3, name: "Thunder", energy: "Expansion", forecast: "A year of dynamic new beginnings and creative breakthroughs. Initiate projects with confidence." },
  { year: 2025, star: 2, name: "Earth", energy: "Consolidation", forecast: "Slow down and nurture what was started. Focus on relationships, details, and building stable foundations." },
  { year: 2026, star: 1, name: "Water", energy: "Reflection", forecast: "A contemplative year for inner work and quiet planning. Seeds planted now germinate slowly but deeply." },
  { year: 2027, star: 9, name: "Fire", energy: "Illumination", forecast: "Maximum visibility and social activity. Recognition for past efforts arrives. Use discernment to avoid burnout." },
  { year: 2028, star: 8, name: "Mountain", energy: "Stillness", forecast: "A year of transition and contemplation. Major decisions benefit from patience. Strength comes from stillness." },
];

// ---- Page -----------------------------------------------------------------

export default function NineStarKiPage() {
  const [selectedStar, setSelectedStar] = useState<NineStarProfile>(
    NINE_STARS[USER_PROFILE.mainStar - 1],
  );

  const mainStarData = NINE_STARS[USER_PROFILE.mainStar - 1];
  const charStarData = NINE_STARS[USER_PROFILE.characterStar - 1];
  const energyStarData = NINE_STARS[USER_PROFILE.energeticStar - 1];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary">Nine Star Ki</h1>
          <Badge variant="info">Feng Shui Astrology</Badge>
        </div>
        <p className="text-sm text-text-muted max-w-3xl">
          Nine Star Ki is a system of Feng Shui astrology rooted in the I
          Ching, the Lo Shu magic square, and the five elements. Your three
          numbers reveal your fundamental nature, emotional character, and
          energetic expression.
        </p>
      </div>

      {/* Personal Numbers */}
      <Card title="Your Nine Star Ki Profile" className="mb-6" glow="blue">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white/[0.02] border border-accent-blue/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/15 text-lg font-bold text-accent-blue">
                {USER_PROFILE.mainStar}
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {mainStarData.name}
                </p>
                <p className="text-xs text-text-muted">Main Star (Adult Self)</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              Your fundamental nature and how you operate in the world after
              maturity. This is the primary energy people perceive in you.
            </p>
          </div>

          <div className="rounded-lg bg-white/[0.02] border border-accent-purple/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple/15 text-lg font-bold text-accent-purple">
                {USER_PROFILE.characterStar}
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {charStarData.name}
                </p>
                <p className="text-xs text-text-muted">
                  Character Star (Inner Self)
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              Your emotional and inner nature -- how you feel and react when
              under pressure or in intimate settings. Reveals childhood patterns.
            </p>
          </div>

          <div className="rounded-lg bg-white/[0.02] border border-accent-emerald/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-emerald/15 text-lg font-bold text-accent-emerald">
                {USER_PROFILE.energeticStar}
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {energyStarData.name}
                </p>
                <p className="text-xs text-text-muted">
                  Energetic Star (Surface)
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              The first impression you make. Your energetic surface -- how others
              perceive you before they know you well.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Star Selector */}
        <Card title="The Nine Stars">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {NINE_STARS.map((star) => {
              const isSelected = selectedStar.star === star.star;
              const isPersonal =
                star.star === USER_PROFILE.mainStar ||
                star.star === USER_PROFILE.characterStar ||
                star.star === USER_PROFILE.energeticStar;
              return (
                <button
                  key={star.star}
                  onClick={() => setSelectedStar(star)}
                  className={`relative rounded-lg border p-2.5 text-center transition-colors ${
                    isSelected
                      ? "border-accent-blue bg-accent-blue/10"
                      : "border-border bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="text-lg font-bold text-text-primary">
                    {star.star}
                  </div>
                  <div className="text-xs text-text-muted">{star.name}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    {star.trigram}
                  </div>
                  {isPersonal && (
                    <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-accent-blue" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Star Detail */}
          <div className="rounded-lg border border-border bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-accent-blue">
                {selectedStar.star}
              </span>
              <span className="text-sm font-medium text-text-primary">
                {selectedStar.name}
              </span>
              <Badge variant="info">{selectedStar.element}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <span className="text-text-muted">Direction: </span>
                <span className="text-text-secondary">
                  {selectedStar.direction}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Season: </span>
                <span className="text-text-secondary">
                  {selectedStar.season}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Color: </span>
                <span className="text-text-secondary">
                  {selectedStar.color}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Organ: </span>
                <span className="text-text-secondary">
                  {selectedStar.organ}
                </span>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {selectedStar.traits.map((t) => (
                <Badge key={t} variant="neutral">
                  {t}
                </Badge>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              {selectedStar.description}
            </p>
          </div>
        </Card>

        {/* Year Cycle Forecast */}
        <Card title="Annual Energy Cycles" glow="purple">
          <p className="text-xs text-text-muted mb-4">
            Nine Star Ki follows a 9-year macro cycle. Each year carries a
            dominant energy that colors all activity and decision-making.
          </p>
          <div className="space-y-3">
            {YEAR_CYCLES.map((cycle) => {
              const isCurrent = cycle.year === 2026;
              return (
                <div
                  key={cycle.year}
                  className={`rounded-lg border p-3 ${
                    isCurrent
                      ? "border-accent-blue/40 bg-accent-blue/5"
                      : "border-border bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-text-primary">
                        {cycle.year}
                      </span>
                      <span className="text-xs text-text-muted">
                        {cycle.star}-{cycle.name}
                      </span>
                    </div>
                    <Badge variant={isCurrent ? "healthy" : "neutral"}>
                      {isCurrent ? "Current" : cycle.energy}
                    </Badge>
                  </div>
                  <p className="text-xs leading-relaxed text-text-secondary">
                    {cycle.forecast}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
