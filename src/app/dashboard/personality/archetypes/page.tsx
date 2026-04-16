"use client";

import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---- Mock Data ----

const PRIMARY_ARCHETYPE = {
  name: "The Alchemist",
  category: "Transformation",
  description:
    "The Alchemist archetype embodies the power of transmutation -- turning lead into gold, chaos into order, and pain into wisdom. You are driven by the pursuit of fundamental truths and the transformation of consciousness itself.",
  traits: [
    "Visionary transformation",
    "Deep pattern recognition",
    "Synthesis of opposites",
    "Catalytic influence on others",
  ],
  expression:
    "Your Alchemist manifests through an insatiable drive to understand systems at their deepest level and transform them. You see potential where others see limitation.",
};

const SHADOW_ARCHETYPE = {
  name: "The Manipulator",
  category: "Shadow",
  description:
    "The shadow of the Alchemist is the Manipulator -- one who uses knowledge of transformation to control others rather than liberate them. This shadow emerges when the desire for power overrides the commitment to truth.",
  traits: [
    "Covert control through knowledge",
    "Intellectual superiority",
    "Withholding information as power",
    "Using insight to exploit vulnerability",
  ],
  integration:
    "Integrate this shadow by noticing when your desire to transform becomes a desire to control. Ask: am I serving the transformation or serving my ego?",
};

const PERSONA_ARCHETYPE = {
  name: "The Sage",
  category: "Persona",
  description:
    "Your social mask is the Sage -- the wise advisor who shares knowledge freely. This is how you present to the world: measured, knowledgeable, and composed. The Sage persona protects the deeper Alchemist work.",
  traits: [
    "Calm authority",
    "Analytical composure",
    "Teaching and mentoring",
    "Intellectual accessibility",
  ],
};

const ALL_ARCHETYPES = [
  { name: "Innocent", angle: 0, active: false },
  { name: "Sage", angle: 30, active: true },
  { name: "Explorer", angle: 60, active: false },
  { name: "Ruler", angle: 90, active: false },
  { name: "Creator", angle: 120, active: false },
  { name: "Caregiver", angle: 150, active: false },
  { name: "Magician", angle: 180, active: true },
  { name: "Hero", angle: 210, active: false },
  { name: "Rebel", angle: 240, active: false },
  { name: "Lover", angle: 270, active: false },
  { name: "Jester", angle: 300, active: false },
  { name: "Orphan", angle: 330, active: false },
];

const INDIVIDUATION_STAGES = [
  { name: "Persona Recognition", status: "complete", description: "Identifying the social masks we wear" },
  { name: "Shadow Encounter", status: "complete", description: "Confronting the denied aspects of self" },
  { name: "Anima/Animus Integration", status: "active", description: "Integrating the contrasexual archetype" },
  { name: "Self Realization", status: "upcoming", description: "Achieving wholeness through integration of all aspects" },
];

// ---- Archetype Wheel Component ----

function ArchetypeWheel() {
  const radius = 130;
  const centerX = 160;
  const centerY = 160;

  return (
    <div className="flex justify-center py-4">
      <svg
        width="320"
        height="320"
        viewBox="0 0 320 320"
        className="overflow-visible"
      >
        {/* Outer circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="rgba(59, 130, 246, 0.15)"
          strokeWidth="1"
        />
        {/* Inner circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={40}
          fill="rgba(59, 130, 246, 0.05)"
          stroke="rgba(59, 130, 246, 0.2)"
          strokeWidth="1"
        />
        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 4}
          textAnchor="middle"
          fill="#3b82f6"
          fontSize="10"
          fontWeight="bold"
        >
          SELF
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          fill="#6b7280"
          fontSize="8"
        >
          Individuation
        </text>

        {/* Connecting lines */}
        {ALL_ARCHETYPES.map((arch) => {
          const radian = (arch.angle - 90) * (Math.PI / 180);
          const x = centerX + radius * Math.cos(radian);
          const y = centerY + radius * Math.sin(radian);
          return (
            <line
              key={`line-${arch.name}`}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke={
                arch.active
                  ? "rgba(59, 130, 246, 0.3)"
                  : "rgba(255, 255, 255, 0.05)"
              }
              strokeWidth="1"
            />
          );
        })}

        {/* Archetype nodes */}
        {ALL_ARCHETYPES.map((arch) => {
          const radian = (arch.angle - 90) * (Math.PI / 180);
          const x = centerX + radius * Math.cos(radian);
          const y = centerY + radius * Math.sin(radian);
          const labelRadius = radius + 20;
          const lx = centerX + labelRadius * Math.cos(radian);
          const ly = centerY + labelRadius * Math.sin(radian);

          return (
            <g key={arch.name}>
              <circle
                cx={x}
                cy={y}
                r={arch.active ? 8 : 5}
                fill={
                  arch.active
                    ? "rgba(59, 130, 246, 0.3)"
                    : "rgba(255, 255, 255, 0.1)"
                }
                stroke={arch.active ? "#3b82f6" : "rgba(255, 255, 255, 0.2)"}
                strokeWidth={arch.active ? 2 : 1}
              />
              <text
                x={lx}
                y={ly + 4}
                textAnchor="middle"
                fill={arch.active ? "#3b82f6" : "#6b7280"}
                fontSize="9"
                fontWeight={arch.active ? "bold" : "normal"}
              >
                {arch.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---- Archetype Card Component ----

function ArchetypeCard({
  name,
  category,
  description,
  traits,
  accentColor,
  extra,
}: {
  name: string;
  category: string;
  description: string;
  traits: string[];
  accentColor: string;
  extra?: string;
}) {
  const borderColor =
    accentColor === "blue"
      ? "border-accent-blue/30"
      : accentColor === "rose"
        ? "border-accent-rose/30"
        : "border-accent-purple/30";
  const textColor =
    accentColor === "blue"
      ? "text-accent-blue"
      : accentColor === "rose"
        ? "text-accent-rose"
        : "text-accent-purple";
  const badgeVariant =
    accentColor === "blue"
      ? "info"
      : accentColor === "rose"
        ? "error"
        : "neutral";

  return (
    <Card
      glow={accentColor === "blue" ? "blue" : accentColor === "rose" ? "none" : "purple"}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-lg font-bold ${textColor}`}>{name}</span>
        <Badge variant={badgeVariant as "info" | "error" | "neutral"}>
          {category}
        </Badge>
      </div>
      <p className="text-sm leading-relaxed text-text-secondary mb-3">
        {description}
      </p>
      <div className={`rounded-lg border ${borderColor} bg-white/[0.02] p-3`}>
        <p className="text-xs text-text-muted mb-2">Key Traits</p>
        <div className="flex flex-wrap gap-1.5">
          {traits.map((trait) => (
            <Badge key={trait} variant="neutral">
              {trait}
            </Badge>
          ))}
        </div>
      </div>
      {extra && (
        <p className="mt-3 text-xs leading-relaxed text-text-muted italic">
          {extra}
        </p>
      )}
    </Card>
  );
}

// ---- Page ----

export default function ArchetypesPage() {
  const { activeProfile } = useProfile();

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view your Jungian archetypes.
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
            Archetypes for {activeProfile.name}
          </h1>
          <Badge variant="info">Alchemist</Badge>
        </div>
        <p className="text-sm text-text-muted">
          Archetypal analysis based on the collective unconscious -- primary,
          shadow, and persona identification with individuation tracking.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Primary Archetype */}
        <ArchetypeCard
          name={PRIMARY_ARCHETYPE.name}
          category={PRIMARY_ARCHETYPE.category}
          description={PRIMARY_ARCHETYPE.description}
          traits={PRIMARY_ARCHETYPE.traits}
          accentColor="blue"
          extra={PRIMARY_ARCHETYPE.expression}
        />

        {/* Shadow Archetype */}
        <ArchetypeCard
          name={SHADOW_ARCHETYPE.name}
          category={SHADOW_ARCHETYPE.category}
          description={SHADOW_ARCHETYPE.description}
          traits={SHADOW_ARCHETYPE.traits}
          accentColor="rose"
          extra={SHADOW_ARCHETYPE.integration}
        />

        {/* Persona Archetype */}
        <ArchetypeCard
          name={PERSONA_ARCHETYPE.name}
          category={PERSONA_ARCHETYPE.category}
          description={PERSONA_ARCHETYPE.description}
          traits={PERSONA_ARCHETYPE.traits}
          accentColor="purple"
        />

        {/* Individuation Stage */}
        <Card title="Individuation Journey" glow="purple">
          <div className="space-y-3">
            {INDIVIDUATION_STAGES.map((stage, i) => {
              const dotColor =
                stage.status === "complete"
                  ? "bg-accent-emerald"
                  : stage.status === "active"
                    ? "bg-accent-blue"
                    : "bg-white/20";
              const lineColor =
                stage.status === "complete"
                  ? "bg-accent-emerald/30"
                  : "bg-white/10";

              return (
                <div key={stage.name} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${dotColor} ${stage.status === "active" ? "ring-2 ring-accent-blue/30" : ""}`}
                    />
                    {i < INDIVIDUATION_STAGES.length - 1 && (
                      <div className={`w-0.5 flex-1 ${lineColor}`} />
                    )}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-text-primary">
                        {stage.name}
                      </span>
                      {stage.status === "active" && (
                        <Badge variant="info">Current</Badge>
                      )}
                      {stage.status === "complete" && (
                        <Badge variant="healthy">Complete</Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Archetype Wheel */}
        <Card title="Archetype Wheel" className="lg:col-span-2">
          <ArchetypeWheel />
          <div className="flex justify-center gap-6 mt-2 text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-accent-blue" />
              Active archetypes
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-white/10 border border-white/20" />
              Latent archetypes
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
