"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Spirit Animal
// ---------------------------------------------------------------------------

// ---- Mock data ------------------------------------------------------------

interface SpiritAnimal {
  name: string;
  realm: string;
  element: string;
  role: string;
  affinity: number;
  medicine: string;
  shadow: string;
  message: string;
  traits: string[];
}

const PRIMARY_ANIMAL: SpiritAnimal = {
  name: "Owl",
  realm: "Air / Night",
  element: "Air & Ether",
  role: "Primary Totem",
  affinity: 96,
  medicine:
    "The Owl grants the medicine of clear sight in darkness -- the ability to perceive truth when others are blinded by illusion. Silent flight represents moving through the world without disturbing the energy around you, gathering information before acting. Owl people possess natural wisdom, operate powerfully at night, and can rotate their perspective to see what others miss entirely.",
  shadow:
    "Isolation, excessive secrecy, living too much in the head, or using knowledge as power over others. The owl's solitary nature can become loneliness if not balanced with conscious connection.",
  message:
    "Trust what you see in the dark. Your intuition is not imagination -- it is perception operating beyond the visible spectrum. The answers you seek are already within your field of awareness; be still and let them surface.",
  traits: ["Wisdom", "Silent observation", "Night vision", "Intuition", "Mystery", "Transition"],
};

const SECONDARY_ANIMALS: SpiritAnimal[] = [
  {
    name: "Wolf",
    realm: "Earth / Twilight",
    element: "Earth & Water",
    role: "Shadow Totem",
    affinity: 84,
    medicine:
      "Wolf medicine teaches the balance between the pack and the lone path. It carries loyalty, sharp instinct, and the ability to read social dynamics with precision. The wolf knows when to lead, when to follow, and when to walk alone.",
    shadow:
      "Pack mentality, aggression when cornered, or becoming a lone wolf out of distrust rather than genuine independence.",
    message:
      "Your loyalty is a gift -- but choose your pack wisely. Not everyone who runs with you shares your destination.",
    traits: ["Loyalty", "Instinct", "Pathfinder", "Teacher", "Endurance"],
  },
  {
    name: "Raven",
    realm: "Air / Shadow",
    element: "Air & Void",
    role: "Messenger Totem",
    affinity: 79,
    medicine:
      "Raven carries messages between the worlds -- the seen and unseen, the conscious and unconscious. It represents the magic of transformation, the alchemy of turning darkness into light. Raven people are natural shapeshifters and communicators of hidden truth.",
    shadow:
      "Trickster energy that deceives self or others, hoarding secrets, or using communication to manipulate rather than illuminate.",
    message:
      "A message is trying to reach you from a source you have been ignoring. Pay attention to synchronicities, dreams, and the words that arrive unbidden.",
    traits: ["Magic", "Transformation", "Intelligence", "Creation", "Prophecy"],
  },
  {
    name: "Snow Leopard",
    realm: "Mountain / Solitude",
    element: "Earth & Air",
    role: "Power Totem",
    affinity: 72,
    medicine:
      "Snow Leopard embodies mastery through solitude, silence, and precise action. It inhabits the highest, most remote places -- representing the pinnacle of self-reliance and focused power. Its medicine teaches that true strength is quiet, patient, and devastatingly effective.",
    shadow:
      "Extreme isolation, emotional unavailability, or perfectionism that prevents engagement with the messy reality of life below the mountain.",
    message:
      "You have climbed high enough to see clearly. The vantage point you have earned is rare -- use it to act with precision, not to avoid the valley.",
    traits: ["Solitude", "Precision", "Power", "Grace", "Invisibility"],
  },
];

interface SeasonalAnimal {
  season: string;
  animal: string;
  energy: string;
  guidance: string;
}

const SEASONAL_GUIDES: SeasonalAnimal[] = [
  {
    season: "Spring",
    animal: "Hawk",
    energy: "Vision & Initiative",
    guidance: "Take the aerial view. Launch new projects with the hawk's broad perspective and decisive strike.",
  },
  {
    season: "Summer",
    animal: "Dolphin",
    energy: "Joy & Communication",
    guidance: "Engage playfully. Use humor and social intelligence to deepen connections and navigate complex waters.",
  },
  {
    season: "Autumn",
    animal: "Bear",
    energy: "Harvest & Introspection",
    guidance: "Gather what you need and prepare to go inward. The bear's medicine is knowing when abundance requires retreat.",
  },
  {
    season: "Winter",
    animal: "Owl",
    energy: "Wisdom & Stillness",
    guidance: "Your primary totem returns in its peak season. Trust the darkness, sharpen your inner sight, and let silence teach.",
  },
];

const ELEMENT_MAP = [
  { element: "Air", animals: ["Owl", "Raven", "Hawk", "Eagle"], affinity: "Primary" },
  { element: "Earth", animals: ["Wolf", "Bear", "Snow Leopard", "Deer"], affinity: "Strong" },
  { element: "Water", animals: ["Dolphin", "Whale", "Salmon", "Otter"], affinity: "Moderate" },
  { element: "Fire", animals: ["Phoenix", "Dragon", "Lion", "Fox"], affinity: "Developing" },
];

// ---- Page -----------------------------------------------------------------

export default function SpiritAnimalPage() {
  const [activeTab, setActiveTab] = useState<"primary" | "secondary" | "seasonal">("primary");

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary">
            Spirit Animal
          </h1>
          <Badge variant="info">Totem Analysis</Badge>
        </div>
        <p className="text-sm text-text-muted max-w-3xl">
          Your spirit animal profile draws from shamanic traditions, birth chart
          animal correspondences, and archetypal pattern analysis. These totems
          represent the energies walking alongside you -- teachers, protectors,
          and mirrors of your deepest nature.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {(
          [
            { key: "primary", label: "Primary Totem" },
            { key: "secondary", label: "Totem Council" },
            { key: "seasonal", label: "Seasonal Guides" },
          ] as const
        ).map((tab) => (
          <Button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={
              activeTab === tab.key
                ? ""
                : "bg-transparent border-border text-text-secondary hover:bg-white/5"
            }
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Primary Totem */}
      {activeTab === "primary" && (
        <div className="animate-fade-in space-y-6">
          <Card glow="blue">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent-blue/10 text-3xl">
                {"\u{1F989}"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {PRIMARY_ANIMAL.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="info">{PRIMARY_ANIMAL.role}</Badge>
                  <Badge variant="healthy">{PRIMARY_ANIMAL.affinity}% resonance</Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 mb-4">
              <div className="rounded-lg bg-white/[0.02] border border-border p-3">
                <p className="text-xs text-text-muted mb-1">Realm</p>
                <p className="text-sm font-medium text-text-primary">
                  {PRIMARY_ANIMAL.realm}
                </p>
              </div>
              <div className="rounded-lg bg-white/[0.02] border border-border p-3">
                <p className="text-xs text-text-muted mb-1">Element</p>
                <p className="text-sm font-medium text-text-primary">
                  {PRIMARY_ANIMAL.element}
                </p>
              </div>
              <div className="rounded-lg bg-white/[0.02] border border-border p-3">
                <p className="text-xs text-text-muted mb-1">Key Traits</p>
                <div className="flex flex-wrap gap-1">
                  {PRIMARY_ANIMAL.traits.map((t) => (
                    <Badge key={t} variant="neutral">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Medicine
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {PRIMARY_ANIMAL.medicine}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Shadow Aspect
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {PRIMARY_ANIMAL.shadow}
                </p>
              </div>
            </div>
          </Card>

          <Card glow="purple">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              Current Message from Owl
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary italic">
              &ldquo;{PRIMARY_ANIMAL.message}&rdquo;
            </p>
          </Card>
        </div>
      )}

      {/* Secondary Animals (Totem Council) */}
      {activeTab === "secondary" && (
        <div className="animate-fade-in space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {SECONDARY_ANIMALS.map((animal) => (
              <Card key={animal.name} className="h-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-text-primary">
                    {animal.name}
                  </h3>
                  <Badge variant="info">{animal.role}</Badge>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-muted">{animal.realm}</span>
                  <Badge
                    variant={
                      animal.affinity >= 80
                        ? "healthy"
                        : animal.affinity >= 70
                          ? "info"
                          : "neutral"
                    }
                  >
                    {animal.affinity}%
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {animal.traits.map((t) => (
                    <Badge key={t} variant="neutral">
                      {t}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Medicine</p>
                    <p className="text-xs leading-relaxed text-text-secondary">
                      {animal.medicine}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Shadow</p>
                    <p className="text-xs leading-relaxed text-text-secondary">
                      {animal.shadow}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/[0.02] border border-border p-2">
                    <p className="text-xs text-text-muted mb-0.5">Message</p>
                    <p className="text-xs leading-relaxed text-text-secondary italic">
                      &ldquo;{animal.message}&rdquo;
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Element Affinity Map */}
          <Card title="Elemental Animal Affinities">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ELEMENT_MAP.map((el) => (
                <div
                  key={el.element}
                  className="rounded-lg border border-border bg-white/[0.02] p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">
                      {el.element}
                    </span>
                    <Badge
                      variant={
                        el.affinity === "Primary"
                          ? "healthy"
                          : el.affinity === "Strong"
                            ? "info"
                            : el.affinity === "Moderate"
                              ? "neutral"
                              : "degraded"
                      }
                    >
                      {el.affinity}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {el.animals.map((a) => (
                      <span
                        key={a}
                        className="text-xs text-text-secondary"
                      >
                        {a}
                        {el.animals.indexOf(a) < el.animals.length - 1
                          ? " \u00b7 "
                          : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Seasonal Guides */}
      {activeTab === "seasonal" && (
        <div className="animate-fade-in">
          <Card title="Seasonal Animal Guides" glow="purple">
            <p className="text-xs text-text-muted mb-4">
              Different animal energies support you through the natural cycles of
              the year. These guides activate as the seasons shift, offering
              specific medicine for each phase.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {SEASONAL_GUIDES.map((guide) => {
                const isCurrent = guide.season === "Spring";
                return (
                  <div
                    key={guide.season}
                    className={`rounded-lg border p-4 ${
                      isCurrent
                        ? "border-accent-blue/40 bg-accent-blue/5"
                        : "border-border bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text-primary">
                          {guide.season}
                        </span>
                        <span className="text-sm text-accent-blue font-medium">
                          {guide.animal}
                        </span>
                      </div>
                      {isCurrent && (
                        <Badge variant="healthy">Current</Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mb-1.5">
                      {guide.energy}
                    </p>
                    <p className="text-xs leading-relaxed text-text-secondary">
                      {guide.guidance}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
