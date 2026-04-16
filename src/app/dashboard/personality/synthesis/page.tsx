"use client";

import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Personality Synthesis -- Unified Profile
// ---------------------------------------------------------------------------

// ---- Mock data ------------------------------------------------------------

const SYSTEM_SCORES = [
  { system: "MBTI", result: "INTJ", confidence: 94 },
  { system: "Enneagram", result: "5w4", confidence: 88 },
  { system: "Western Astrology", result: "Gemini Sun / Scorpio Moon", confidence: 100 },
  { system: "Human Design", result: "Projector 1/3", confidence: 100 },
  { system: "BaZi", result: "Yin Water / Metal Rat", confidence: 96 },
  { system: "Numerology", result: "Life Path 7", confidence: 100 },
  { system: "Biorhythm Peak", result: "Intellectual Cycle", confidence: 78 },
];

const CORE_THEMES = [
  {
    theme: "Analytical Depth",
    sources: ["INTJ (Ni-Te)", "Enneagram 5", "Life Path 7", "Scorpio Moon"],
    strength: 97,
    description:
      "Four independent systems converge on the same conclusion: your psyche is built for deep analysis. The INTJ's introverted intuition, the Enneagram 5's investigative drive, the Life Path 7's philosophical quest, and the Scorpio Moon's penetrating emotional intelligence all point to a mind that naturally seeks understanding beneath the surface.",
  },
  {
    theme: "Creative Originality",
    sources: ["5w4 Wing", "Gemini Sun", "Projector Aura", "Yin Water"],
    strength: 84,
    description:
      "The Enneagram 4-wing adds an aesthetic, individualistic dimension to the 5's investigations. Gemini's mercurial intellect generates novel connections, while the Human Design Projector aura perceives systems others miss. BaZi Yin Water flows around obstacles with quiet ingenuity.",
  },
  {
    theme: "Strategic Vision",
    sources: ["INTJ (Ni-Dom)", "1/3 Profile", "Metal Element", "Life Path 7"],
    strength: 91,
    description:
      "Dominant introverted intuition provides long-range foresight. The Human Design 1/3 profile combines foundational research (line 1) with trial-and-error learning (line 3). The Metal element in BaZi adds precision and refinement. Life Path 7 contributes solitary contemplation that clarifies the vision.",
  },
  {
    theme: "Emotional Complexity",
    sources: ["Scorpio Moon", "Fi Tertiary", "Enneagram 4-wing", "Yin Water"],
    strength: 76,
    description:
      "Beneath the analytical exterior lies significant emotional depth. The Scorpio Moon experiences feelings intensely but privately. The INTJ's tertiary introverted feeling develops slowly through life, adding authenticity. The 4-wing brings longing and creative melancholy. Yin Water absorbs the emotional environment.",
  },
  {
    theme: "Independent Operation",
    sources: ["Projector Type", "INTJ", "Enneagram 5", "Metal Rat"],
    strength: 93,
    description:
      "Multiple systems confirm a deep need for autonomy. The Projector waits for recognition rather than initiating. INTJs require independence to implement their vision. Enneagram 5s conserve energy through boundaries. The Metal Rat is self-sufficient and resourceful, preferring to work alone or in small trusted groups.",
  },
];

const GROWTH_AREAS = [
  {
    area: "Social Energy Management",
    systems: "Projector + INTJ + Enneagram 5",
    recommendation:
      "Three systems warn of energy depletion in social contexts. Build deliberate rest periods into collaborative work. The Projector strategy of waiting for invitations naturally conserves energy while ensuring your contributions land with impact.",
    priority: "high" as const,
  },
  {
    area: "Emotional Expression",
    systems: "Scorpio Moon + Fi Tertiary + 5w4",
    recommendation:
      "Feelings run deep but surface rarely. Practice naming emotions in real time -- even privately through journaling. The 4-wing wants to be understood; the Scorpio Moon needs safe outlets. This integration unlocks the INTJ's full relational depth.",
    priority: "medium" as const,
  },
  {
    area: "Present-Moment Awareness",
    systems: "Se Inferior + Ni Dominant + Line 3",
    recommendation:
      "The inferior extraverted sensing function and dominant Ni create a mind that lives in the future. The Human Design line 3's trial-and-error approach can serve as a bridge -- use physical experimentation to ground abstract vision in tangible reality.",
    priority: "medium" as const,
  },
  {
    area: "Receiving Recognition",
    systems: "Projector Strategy + Te Auxiliary",
    recommendation:
      "The Projector must wait for invitations, yet the INTJ's Te wants to organize and direct immediately. Learn to share your insights as observations rather than directives. When invited, your natural authority is amplified enormously.",
    priority: "high" as const,
  },
];

const TIMELINE_PHASES = [
  { age: "0--12", label: "Foundation", description: "Ni development begins. Intense inner world and early sense of being different. 1-line research instinct active.", variant: "info" as const },
  { age: "13--25", label: "Individuation", description: "Te auxiliary develops. Academic or systematic mastery pursued. Enneagram 5 pattern of knowledge accumulation peaks.", variant: "info" as const },
  { age: "26--40", label: "Integration", description: "Fi tertiary emerges. Relationships deepen. Scorpio Moon's emotional truth demands acknowledgment. 3-line trials accelerate growth.", variant: "healthy" as const },
  { age: "41--55", label: "Mastery", description: "Shadow integration period. Se inferior becomes accessible. Projector authority fully realized. Wisdom replaces knowledge.", variant: "healthy" as const },
  { age: "56+", label: "Transcendence", description: "Full function stack online. Life Path 7's spiritual quest culminates. The Metal element refines everything to its essence.", variant: "neutral" as const },
];

// ---- Strength Bar ---------------------------------------------------------

function ThemeBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
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

export default function SynthesisPage() {
  const { activeProfile } = useProfile();

  const priorityColor = (p: string) => {
    if (p === "high") return "degraded";
    if (p === "medium") return "info";
    return "neutral";
  };

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view your unified personality synthesis.
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
            Synthesis for {activeProfile.name}
          </h1>
          <Badge variant="healthy">7 Systems</Badge>
        </div>
        <p className="text-sm text-text-muted max-w-3xl">
          A unified profile merging insights from Western astrology, MBTI,
          Enneagram, Human Design, BaZi, Numerology, and Biorhythm analysis.
          Convergence across independent systems reveals your core operating
          patterns with high confidence.
        </p>
      </div>

      {/* System Results Overview */}
      <Card title="System Results" className="mb-6">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SYSTEM_SCORES.map((s) => (
            <div
              key={s.system}
              className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-border px-4 py-3"
            >
              <div>
                <p className="text-xs text-text-muted">{s.system}</p>
                <p className="text-sm font-medium text-text-primary">
                  {s.result}
                </p>
              </div>
              <Badge
                variant={
                  s.confidence >= 95
                    ? "healthy"
                    : s.confidence >= 80
                      ? "info"
                      : "neutral"
                }
              >
                {s.confidence}%
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Core Themes */}
      <Card
        title="Core Personality Themes"
        className="mb-6"
        glow="blue"
      >
        <div className="space-y-5">
          {CORE_THEMES.map((t) => (
            <div key={t.theme}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-sm font-semibold text-text-primary">
                  {t.theme}
                </span>
                <div className="flex gap-1">
                  {t.sources.map((src) => (
                    <Badge key={src} variant="neutral">
                      {src}
                    </Badge>
                  ))}
                </div>
              </div>
              <ThemeBar
                value={t.strength}
                color="bg-gradient-to-r from-accent-blue to-accent-purple"
              />
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                {t.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Growth Areas */}
        <Card title="Growth Recommendations" glow="purple">
          <div className="space-y-3">
            {GROWTH_AREAS.map((g) => (
              <div
                key={g.area}
                className="rounded-lg border border-border bg-white/[0.02] p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-text-primary">
                    {g.area}
                  </span>
                  <Badge variant={priorityColor(g.priority) as "degraded" | "info" | "neutral"}>
                    {g.priority}
                  </Badge>
                </div>
                <p className="text-xs text-accent-blue font-mono mb-1.5">
                  {g.systems}
                </p>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {g.recommendation}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Developmental Timeline */}
        <Card title="Developmental Timeline">
          <div className="space-y-3">
            {TIMELINE_PHASES.map((phase) => (
              <div
                key={phase.age}
                className="flex gap-3 rounded-lg bg-white/[0.02] border border-border p-3"
              >
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-xs font-mono font-bold text-accent-blue">
                    {phase.age}
                  </span>
                  <Badge variant={phase.variant} className="mt-1">
                    {phase.label}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {phase.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
