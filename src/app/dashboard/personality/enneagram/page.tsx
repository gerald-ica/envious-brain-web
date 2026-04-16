"use client";

import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---- Mock Data ----

const TYPE = {
  number: 5,
  name: "The Investigator",
  wing: 4,
  wingName: "The Individualist",
  tritype: "5w4 - 1w9 - 3w4",
  subtype: "Self-Preservation",
  subtypeLabel: "Castle",
  center: "Head Center",
  basicFear: "Being useless, helpless, or incapable",
  basicDesire: "To be capable and competent",
  keyMotivation:
    "Want to possess knowledge, to understand the environment, to have everything figured out as a way of defending the self from threats.",
  description:
    "Fives are alert, insightful, and curious. They are able to concentrate and focus on developing complex ideas and skills. Independent, innovative, and inventive, they can also become preoccupied with their thoughts and imaginary constructs. They become detached, yet high-strung and intense.",
};

const LEVELS_OF_HEALTH = [
  { level: 1, name: "Visionary Pioneer", health: "healthy" },
  { level: 2, name: "Perceptive Observer", health: "healthy" },
  { level: 3, name: "Focused Innovator", health: "healthy" },
  { level: 4, name: "Studious Expert", health: "neutral" },
  { level: 5, name: "Detached Analyst", health: "neutral" },
  { level: 6, name: "Provocative Cynic", health: "neutral" },
  { level: 7, name: "Isolated Nihilist", health: "unhealthy" },
  { level: 8, name: "Delusional Recluse", health: "unhealthy" },
  { level: 9, name: "Schizoid Emptiness", health: "unhealthy" },
];

const currentLevel = 3;

const INTEGRATION = {
  direction: 8,
  directionName: "The Challenger",
  description:
    "In growth, Fives move toward Eight. They become more assertive, grounded in their body, and willing to take decisive action. They move from pure observation to engaged leadership, translating knowledge into real-world power.",
  traits: [
    "Taking decisive action without over-analyzing",
    "Speaking up and setting boundaries directly",
    "Trusting gut instinct alongside intellectual analysis",
    "Engaging physically with the world",
  ],
};

const DISINTEGRATION = {
  direction: 7,
  directionName: "The Enthusiast",
  description:
    "Under stress, Fives move toward Seven. They become scattered, impulsive, and use distractions to avoid the anxiety of feeling incompetent. Mental energy disperses across too many interests without depth.",
  traits: [
    "Compulsive information gathering without purpose",
    "Escapism through entertainment or substances",
    "Manic brainstorming with no follow-through",
    "Avoidance of emotional pain through novelty-seeking",
  ],
};

const SUBTYPES = [
  {
    name: "Self-Preservation",
    keyword: "Castle",
    active: true,
    description:
      "Builds a fortress of resources and knowledge. Extremely private, minimizes needs, and creates self-sufficient systems. The warmest Five subtype in close relationships.",
  },
  {
    name: "Social",
    keyword: "Totem",
    active: false,
    description:
      "Seeks knowledge through group expertise and intellectual tribes. Becomes the specialist within a community. Can appear more extroverted than other Fives.",
  },
  {
    name: "Sexual (1-to-1)",
    keyword: "Confidence",
    active: false,
    description:
      "Shares knowledge intensely with a chosen few. Seeks the ideal partner who shares their inner world. The most emotionally volatile Five subtype.",
  },
];

const GROWTH_PATH = [
  {
    phase: "Awareness",
    status: "complete",
    recommendation:
      "Recognize when you are withdrawing from life to retreat into the mind. Notice the impulse to observe rather than participate.",
  },
  {
    phase: "Body Engagement",
    status: "active",
    recommendation:
      "Practice regular physical activity. Fives often live in their heads -- grounding through the body unlocks Eight integration energy.",
  },
  {
    phase: "Emotional Sharing",
    status: "upcoming",
    recommendation:
      "Share your feelings in real-time rather than processing them alone first. Practice saying 'I feel' before 'I think'.",
  },
  {
    phase: "Generous Action",
    status: "upcoming",
    recommendation:
      "Give your time, knowledge, and energy freely. Trust that engaging with the world replenishes rather than depletes you.",
  },
  {
    phase: "Embodied Wisdom",
    status: "upcoming",
    recommendation:
      "Integrate head, heart, and body. Become the visionary pioneer who translates deep insight into transformative action.",
  },
];

// ---- Arrow Diagram Component ----

function ArrowDiagram() {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      {/* Disintegration */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-text-muted mb-1">Stress</span>
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent-rose/40 bg-accent-rose/10">
          <span className="text-lg font-bold text-accent-rose">
            {DISINTEGRATION.direction}
          </span>
        </div>
        <span className="text-xs text-accent-rose mt-1">
          {DISINTEGRATION.directionName}
        </span>
      </div>

      {/* Arrow left */}
      <div className="flex flex-col items-center">
        <span className="text-text-muted text-lg">&larr;</span>
      </div>

      {/* Core type */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-text-muted mb-1">Core</span>
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent-blue bg-accent-blue/10 shadow-lg shadow-accent-blue/20">
          <span className="text-2xl font-bold text-accent-blue">
            {TYPE.number}
          </span>
        </div>
        <span className="text-xs text-accent-blue mt-1">{TYPE.name}</span>
      </div>

      {/* Arrow right */}
      <div className="flex flex-col items-center">
        <span className="text-text-muted text-lg">&rarr;</span>
      </div>

      {/* Integration */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-text-muted mb-1">Growth</span>
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent-emerald/40 bg-accent-emerald/10">
          <span className="text-lg font-bold text-accent-emerald">
            {INTEGRATION.direction}
          </span>
        </div>
        <span className="text-xs text-accent-emerald mt-1">
          {INTEGRATION.directionName}
        </span>
      </div>
    </div>
  );
}

// ---- Page ----

export default function EnneagramPage() {
  const { activeProfile } = useProfile();

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view your Enneagram analysis.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary">
            Enneagram for {activeProfile.name}
          </h1>
          <Badge variant="info">Type {TYPE.number} -- {TYPE.name}</Badge>
          <Badge variant="neutral">
            w{TYPE.wing} - {TYPE.wingName}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary max-w-3xl">
          {TYPE.description}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Core Motivations */}
        <Card title="Core Motivations" glow="blue">
          <div className="space-y-3">
            <div className="rounded-lg bg-white/[0.02] px-3 py-2">
              <p className="text-xs text-text-muted mb-0.5">Basic Fear</p>
              <p className="text-sm text-accent-rose">{TYPE.basicFear}</p>
            </div>
            <div className="rounded-lg bg-white/[0.02] px-3 py-2">
              <p className="text-xs text-text-muted mb-0.5">Basic Desire</p>
              <p className="text-sm text-accent-emerald">{TYPE.basicDesire}</p>
            </div>
            <div className="rounded-lg bg-white/[0.02] px-3 py-2">
              <p className="text-xs text-text-muted mb-0.5">Key Motivation</p>
              <p className="text-sm text-text-secondary">
                {TYPE.keyMotivation}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Badge variant="info">{TYPE.center}</Badge>
              <Badge variant="neutral">{TYPE.tritype}</Badge>
            </div>
          </div>
        </Card>

        {/* Levels of Health */}
        <Card title="Levels of Health">
          <div className="space-y-1">
            {LEVELS_OF_HEALTH.map((level) => {
              const isActive = level.level === currentLevel;
              const bgColor =
                level.health === "healthy"
                  ? "bg-accent-emerald/10 border-accent-emerald/30"
                  : level.health === "unhealthy"
                    ? "bg-accent-rose/10 border-accent-rose/30"
                    : "bg-white/[0.02] border-border";
              const textColor =
                level.health === "healthy"
                  ? "text-accent-emerald"
                  : level.health === "unhealthy"
                    ? "text-accent-rose"
                    : "text-text-secondary";

              return (
                <div
                  key={level.level}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-1.5 ${bgColor} ${isActive ? "ring-1 ring-accent-blue" : ""}`}
                >
                  <span className="w-5 text-xs font-mono text-text-muted">
                    {level.level}
                  </span>
                  <span className={`text-sm ${textColor}`}>{level.name}</span>
                  {isActive && (
                    <Badge variant="info" className="ml-auto">
                      Current
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Integration / Disintegration Arrows */}
        <Card title="Integration / Disintegration" className="lg:col-span-2">
          <ArrowDiagram />
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            {/* Integration */}
            <div className="rounded-lg border border-accent-emerald/20 bg-accent-emerald/5 p-3">
              <h4 className="text-sm font-semibold text-accent-emerald mb-2">
                Growth Direction &rarr; Type {INTEGRATION.direction}
              </h4>
              <p className="text-xs text-text-secondary mb-2">
                {INTEGRATION.description}
              </p>
              <ul className="space-y-1">
                {INTEGRATION.traits.map((trait) => (
                  <li
                    key={trait}
                    className="flex items-start gap-2 text-xs text-text-muted"
                  >
                    <span className="text-accent-emerald mt-0.5">+</span>
                    {trait}
                  </li>
                ))}
              </ul>
            </div>
            {/* Disintegration */}
            <div className="rounded-lg border border-accent-rose/20 bg-accent-rose/5 p-3">
              <h4 className="text-sm font-semibold text-accent-rose mb-2">
                Stress Direction &rarr; Type {DISINTEGRATION.direction}
              </h4>
              <p className="text-xs text-text-secondary mb-2">
                {DISINTEGRATION.description}
              </p>
              <ul className="space-y-1">
                {DISINTEGRATION.traits.map((trait) => (
                  <li
                    key={trait}
                    className="flex items-start gap-2 text-xs text-text-muted"
                  >
                    <span className="text-accent-rose mt-0.5">&minus;</span>
                    {trait}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Subtypes */}
        <Card title="Instinctual Subtypes">
          <div className="space-y-3">
            {SUBTYPES.map((sub) => (
              <div
                key={sub.name}
                className={`rounded-lg border p-3 ${
                  sub.active
                    ? "border-accent-blue/40 bg-accent-blue/5 ring-1 ring-accent-blue/30"
                    : "border-border bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-sm font-semibold ${sub.active ? "text-accent-blue" : "text-text-primary"}`}
                  >
                    {sub.name}
                  </span>
                  <Badge variant={sub.active ? "info" : "neutral"}>
                    {sub.keyword}
                  </Badge>
                  {sub.active && (
                    <Badge variant="healthy" className="ml-auto">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {sub.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Growth Path */}
        <Card title="Growth Path" glow="purple">
          <div className="space-y-3">
            {GROWTH_PATH.map((step, i) => {
              const statusColor =
                step.status === "complete"
                  ? "bg-accent-emerald"
                  : step.status === "active"
                    ? "bg-accent-blue"
                    : "bg-white/20";
              const lineColor =
                step.status === "complete"
                  ? "bg-accent-emerald/30"
                  : "bg-white/10";

              return (
                <div key={step.phase} className="flex gap-3">
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${statusColor} ${step.status === "active" ? "ring-2 ring-accent-blue/30" : ""}`}
                    />
                    {i < GROWTH_PATH.length - 1 && (
                      <div className={`w-0.5 flex-1 ${lineColor}`} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-text-primary">
                        {step.phase}
                      </span>
                      {step.status === "active" && (
                        <Badge variant="info">Current</Badge>
                      )}
                      {step.status === "complete" && (
                        <Badge variant="healthy">Complete</Badge>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-text-secondary">
                      {step.recommendation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
