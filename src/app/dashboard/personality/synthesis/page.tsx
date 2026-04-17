"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Personality Synthesis — via /api/v1/personality/calculate
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

function WeightBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-xs text-text-muted">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-mono text-text-secondary">{pct}%</span>
    </div>
  );
}

export default function SynthesisPage() {
  const { activeProfile } = useProfile();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/v1/personality/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mbti_type: "INTJ" }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load synthesis");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeProfile]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view your personality synthesis.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const mbtiType = data?.mbti_type as string | undefined;
  const dominant = data?.dominant_function as string | undefined;
  const auxiliary = data?.auxiliary_function as string | undefined;
  const state = data?.personality_state as string | undefined;
  const narrative = data?.narrative_summary as string | undefined;
  const baseWeights = data?.base_weights as Record<string, number> | undefined;
  const finalWeights = data?.final_weights as Record<string, number> | undefined;
  const modifierSources = data?.modifier_sources as Record<string, unknown> | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Personality Synthesis for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Unified cognitive function analysis and personality state
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-4 py-2.5 text-sm text-accent-rose">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="animate-fade-in space-y-6">
          {/* Core info */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card title="MBTI Type">
              <p className="text-3xl font-bold text-accent-blue">{mbtiType ?? "--"}</p>
            </Card>
            <Card title="Dominant Function">
              <p className="text-lg font-medium text-text-primary">{dominant ?? "--"}</p>
            </Card>
            <Card title="Auxiliary Function">
              <p className="text-lg font-medium text-text-primary">{auxiliary ?? "--"}</p>
            </Card>
            <Card title="Personality State">
              <Badge variant="info" className="text-base">{state ?? "--"}</Badge>
            </Card>
          </div>

          {/* Narrative */}
          {narrative ? (
            <Card title="Narrative Summary">
              <p className="text-sm text-text-secondary leading-relaxed">{narrative}</p>
            </Card>
          ) : null}

          {/* Final weights */}
          {finalWeights && (
            <Card title="Final Cognitive Function Weights">
              <div className="space-y-3">
                {Object.entries(finalWeights)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([fn, weight]) => (
                    <WeightBar
                      key={fn}
                      label={fn}
                      value={weight as number}
                      color={fn === dominant ? "bg-accent-blue" : "bg-accent-purple/60"}
                    />
                  ))}
              </div>
            </Card>
          )}

          {/* Modifier sources */}
          {modifierSources && Object.keys(modifierSources).length > 0 ? (
            <Card title="Modifier Sources">
              <div className="space-y-2">
                {Object.entries(modifierSources).map(([source, mods]) => (
                  <div
                    key={source}
                    className="rounded-lg bg-white/[0.02] px-4 py-2.5"
                  >
                    <span className="text-sm font-medium text-text-muted capitalize">
                      {source.replace(/_/g, " ")}
                    </span>
                    <p className="text-xs text-text-secondary mt-1">
                      {typeof mods === "object" && mods !== null
                        ? JSON.stringify(mods)
                        : String(mods)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
