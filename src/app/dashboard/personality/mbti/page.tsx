"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// MBTI — via /api/v1/personality/calculate (synthesis endpoint)
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

function StrengthBar({ label, value, color }: { label: string; value: number; color: string }) {
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

export default function MBTIPage() {
  const { activeProfile } = useProfile();
  const [selectedType, setSelectedType] = useState("INTJ");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (mbtiType: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/personality/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mbti_type: mbtiType }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load MBTI data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedType);
  }, [selectedType]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to explore MBTI personality types.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const baseWeights = data?.base_weights as Record<string, number> | undefined;
  const finalWeights = data?.final_weights as Record<string, number> | undefined;
  const dominant = data?.dominant_function as string | undefined;
  const auxiliary = data?.auxiliary_function as string | undefined;
  const state = data?.personality_state as string | undefined;
  const narrative = data?.narrative_summary as string | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          MBTI Cognitive Functions
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Jungian cognitive function analysis for {activeProfile.name}
        </p>
      </div>

      {/* Type selector */}
      <Card title="Select MBTI Type" className="mb-6">
        <div className="flex flex-wrap gap-2">
          {MBTI_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-colors ${
                selectedType === t
                  ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/40"
                  : "bg-white/5 text-text-secondary hover:bg-white/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Card>

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
          <div className="grid gap-4 sm:grid-cols-3">
            <Card title="Type">
              <p className="text-3xl font-bold text-accent-purple">{data.mbti_type as string}</p>
            </Card>
            <Card title="Dominant Function">
              <p className="text-lg font-medium text-text-primary">{dominant ?? "--"}</p>
              {state ? (
                <Badge variant="info" className="mt-2">{state}</Badge>
              ) : null}
            </Card>
            <Card title="Auxiliary Function">
              <p className="text-lg font-medium text-text-primary">{auxiliary ?? "--"}</p>
            </Card>
          </div>

          {/* Narrative */}
          {narrative ? (
            <Card title="Narrative Summary">
              <p className="text-sm text-text-secondary leading-relaxed">{narrative}</p>
            </Card>
          ) : null}

          {/* Cognitive function weights */}
          {finalWeights && (
            <Card title="Cognitive Function Weights">
              <div className="space-y-3">
                {Object.entries(finalWeights)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([fn, weight]) => (
                    <StrengthBar
                      key={fn}
                      label={fn}
                      value={weight as number}
                      color={fn === dominant ? "bg-accent-purple" : "bg-accent-blue"}
                    />
                  ))}
              </div>
            </Card>
          )}

          {/* Base vs final comparison */}
          {baseWeights && finalWeights && (
            <Card title="Base vs Modified Weights">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Function</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Base</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Final</th>
                      <th className="pb-2 font-medium text-text-muted">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(finalWeights).map((fn) => {
                      const base = (baseWeights[fn] as number) ?? 0;
                      const final_ = (finalWeights[fn] as number) ?? 0;
                      const diff = final_ - base;
                      return (
                        <tr key={fn} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-4 font-medium text-text-primary">{fn}</td>
                          <td className="py-2 pr-4 font-mono text-text-secondary">
                            {(base * 100).toFixed(0)}%
                          </td>
                          <td className="py-2 pr-4 font-mono text-text-secondary">
                            {(final_ * 100).toFixed(0)}%
                          </td>
                          <td className="py-2">
                            <Badge variant={diff > 0 ? "healthy" : diff < 0 ? "degraded" : "neutral"}>
                              {diff > 0 ? "+" : ""}{(diff * 100).toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
