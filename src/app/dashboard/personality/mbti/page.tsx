"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---- Mock Data ----

const TYPE = {
  code: "INTJ",
  name: "The Architect",
  description:
    "Strategic, independent, and determined. INTJs are visionary thinkers who excel at creating and implementing complex systems. They combine imagination with reliability, approaching life with a chess-master's foresight.",
};

const COGNITIVE_FUNCTIONS = [
  {
    code: "Ni",
    name: "Introverted Intuition",
    position: "Dominant (Hero)",
    strength: 95,
    description:
      "Core perceiving function. Synthesizes unconscious patterns into sudden insights and long-range vision. Drives the signature INTJ ability to foresee consequences and construct mental models of the future.",
    isShadow: false,
  },
  {
    code: "Te",
    name: "Extraverted Thinking",
    position: "Auxiliary (Parent)",
    strength: 85,
    description:
      "Organizes the external world through logical systems, metrics, and efficiency. Translates Ni visions into actionable plans with measurable outcomes.",
    isShadow: false,
  },
  {
    code: "Fi",
    name: "Introverted Feeling",
    position: "Tertiary (Child)",
    strength: 55,
    description:
      "Inner moral compass and personal values. Develops with maturity, adding depth of conviction and authenticity to the INTJ's logical framework.",
    isShadow: false,
  },
  {
    code: "Se",
    name: "Extraverted Sensing",
    position: "Inferior (Aspirational)",
    strength: 30,
    description:
      "Present-moment sensory awareness. Under stress can manifest as overindulgence; when developed, grants a grounding connection to physical reality.",
    isShadow: false,
  },
  {
    code: "Ne",
    name: "Extraverted Intuition",
    position: "Opposing (5th)",
    strength: 25,
    description:
      "Shadow of Ni. Can become argumentative about possibilities or dismissive of brainstorming. When integrated, allows broader exploration of ideas.",
    isShadow: true,
  },
  {
    code: "Ti",
    name: "Introverted Thinking",
    position: "Critical Parent (6th)",
    strength: 20,
    description:
      "Shadow of Te. May manifest as harsh internal criticism or obsessive logical analysis. Integration allows nuanced personal reasoning.",
    isShadow: true,
  },
  {
    code: "Fe",
    name: "Extraverted Feeling",
    position: "Trickster (7th)",
    strength: 12,
    description:
      "Shadow of Fi. Social harmony functions feel foreign and manipulative. Integration unlocks genuine communal empathy and group awareness.",
    isShadow: true,
  },
  {
    code: "Si",
    name: "Introverted Sensing",
    position: "Demon (8th)",
    strength: 8,
    description:
      "Shadow of Se. Can trigger overwhelming nostalgia or physical hypochondria under extreme stress. Deepest unconscious function.",
    isShadow: true,
  },
];

const FAMOUS_PEOPLE = [
  { name: "Nikola Tesla", field: "Inventor" },
  { name: "Isaac Newton", field: "Physicist" },
  { name: "Friedrich Nietzsche", field: "Philosopher" },
  { name: "Ayn Rand", field: "Author" },
  { name: "Elon Musk", field: "Entrepreneur" },
  { name: "Michelle Obama", field: "Lawyer / Author" },
  { name: "Christopher Nolan", field: "Director" },
  { name: "Karl Marx", field: "Philosopher" },
];

const SHADOW_INTEGRATION = [
  {
    title: "Ne Integration",
    status: "In Progress",
    tip: "Practice brainstorming without judgment. Allow 10 minutes of open-ended ideation daily before filtering with Ni.",
  },
  {
    title: "Ti Integration",
    status: "Emerging",
    tip: "When your inner critic activates, pause and ask: is this Te efficiency or Ti perfectionism? Name the difference.",
  },
  {
    title: "Fe Integration",
    status: "Undeveloped",
    tip: "Observe group emotional dynamics without trying to fix them. Practice mirroring others' feelings before offering solutions.",
  },
  {
    title: "Si Integration",
    status: "Unconscious",
    tip: "Create grounding rituals tied to positive memories. Use journaling to build a healthy relationship with your past.",
  },
];

// ---- Strength Bar Component ----

function StrengthBar({
  label,
  code,
  value,
  isShadow,
}: {
  label: string;
  code: string;
  value: number;
  isShadow: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`w-8 text-xs font-mono font-bold ${isShadow ? "text-accent-purple/70" : "text-accent-blue"}`}
      >
        {code}
      </span>
      <span className="w-28 text-xs text-text-muted truncate">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isShadow
              ? "bg-gradient-to-r from-accent-purple/60 to-accent-purple/30"
              : "bg-gradient-to-r from-accent-blue to-accent-blue/60"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-mono text-text-muted">
        {value}%
      </span>
    </div>
  );
}

// ---- Page ----

export default function MBTIPage() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary">
            {TYPE.code}
          </h1>
          <Badge variant="info">{TYPE.name}</Badge>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary max-w-3xl">
          {TYPE.description}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---- Cognitive Function Stack ---- */}
        <Card title="Cognitive Function Stack" glow="blue" className="lg:col-span-2">
          <div className="space-y-3">
            <div className="mb-4">
              <p className="text-xs text-text-muted mb-3">
                Primary Stack (Conscious)
              </p>
              {COGNITIVE_FUNCTIONS.filter((f) => !f.isShadow).map((fn) => (
                <div key={fn.code} className="mb-2">
                  <StrengthBar
                    label={fn.position}
                    code={fn.code}
                    value={fn.strength}
                    isShadow={false}
                  />
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs text-text-muted mb-3">
                Shadow Stack (Unconscious)
              </p>
              {COGNITIVE_FUNCTIONS.filter((f) => f.isShadow).map((fn) => (
                <div key={fn.code} className="mb-2">
                  <StrengthBar
                    label={fn.position}
                    code={fn.code}
                    value={fn.strength}
                    isShadow={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ---- Function Descriptions ---- */}
        <Card title="Function Descriptions" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {COGNITIVE_FUNCTIONS.map((fn) => (
              <div
                key={fn.code}
                className={`rounded-lg border p-3 ${
                  fn.isShadow
                    ? "border-accent-purple/20 bg-accent-purple/5"
                    : "border-border bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-sm font-bold font-mono ${
                      fn.isShadow ? "text-accent-purple" : "text-accent-blue"
                    }`}
                  >
                    {fn.code}
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {fn.name}
                  </span>
                </div>
                <p className="text-xs text-text-muted mb-1">{fn.position}</p>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {fn.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* ---- Famous People ---- */}
        <Card title="Famous INTJs">
          <div className="grid grid-cols-2 gap-2">
            {FAMOUS_PEOPLE.map((person) => (
              <div
                key={person.name}
                className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/10 text-xs font-bold text-accent-blue">
                  {person.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {person.name}
                  </p>
                  <p className="text-xs text-text-muted">{person.field}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ---- Shadow Integration ---- */}
        <Card title="Shadow Integration" glow="purple">
          <div className="space-y-3">
            {SHADOW_INTEGRATION.map((item) => {
              const statusColor =
                item.status === "In Progress"
                  ? "healthy"
                  : item.status === "Emerging"
                    ? "degraded"
                    : item.status === "Undeveloped"
                      ? "error"
                      : "neutral";
              return (
                <div
                  key={item.title}
                  className="rounded-lg border border-border bg-white/[0.02] p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">
                      {item.title}
                    </span>
                    <Badge variant={statusColor as "healthy" | "degraded" | "error" | "neutral"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs leading-relaxed text-text-secondary">
                    {item.tip}
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
