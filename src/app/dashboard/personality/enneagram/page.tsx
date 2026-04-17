"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Enneagram — via /api/v1/personality/enneagram
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

export default function EnneagramPage() {
  const { activeProfile } = useProfile();
  const [selectedType, setSelectedType] = useState("INTJ");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (mbtiType: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/personality/enneagram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mbti_type: mbtiType }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Enneagram data");
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
            Create a birth profile to explore the Enneagram.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const primaryType = data?.primary_type as number | undefined;
  const typeName = data?.type_name as string | undefined;
  const center = data?.center as string | undefined;
  const wing = data?.wing as string | undefined;
  const tritype = data?.tritype as string | undefined;
  const instinct = data?.instinctual_variant as string | undefined;
  const growth = data?.growth_direction as string | undefined;
  const stress = data?.stress_direction as string | undefined;
  const coreFear = data?.core_fear as string | undefined;
  const coreDesire = data?.core_desire as string | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Enneagram for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Core motivations, growth and stress directions
        </p>
      </div>

      {/* Type selector */}
      <Card title="Select MBTI Type (for Enneagram mapping)" className="mb-6">
        <div className="flex flex-wrap gap-2">
          {MBTI_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-colors ${
                selectedType === t
                  ? "bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/40"
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
          {/* Core type info */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card title="Primary Type">
              <p className="text-3xl font-bold text-accent-emerald">
                Type {primaryType}
              </p>
              <p className="mt-1 text-sm text-text-secondary">{typeName}</p>
            </Card>
            <Card title="Center">
              <p className="text-lg font-medium text-text-primary">{center ?? "--"}</p>
              {wing ? (
                <Badge variant="info" className="mt-2">Wing: {wing}</Badge>
              ) : null}
            </Card>
            <Card title="Tritype">
              <p className="text-lg font-medium text-text-primary">{tritype ?? "--"}</p>
              {instinct ? (
                <Badge variant="neutral" className="mt-2">{instinct}</Badge>
              ) : null}
            </Card>
            <Card title="Instinctual Variant">
              <p className="text-lg font-medium text-text-primary">{instinct ?? "--"}</p>
            </Card>
          </div>

          {/* Core motivations */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Core Fear">
              <p className="text-sm text-text-secondary leading-relaxed">
                {coreFear ?? "Not available"}
              </p>
            </Card>
            <Card title="Core Desire">
              <p className="text-sm text-text-secondary leading-relaxed">
                {coreDesire ?? "Not available"}
              </p>
            </Card>
          </div>

          {/* Growth / Stress directions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Growth Direction (Integration)">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-emerald/15 text-accent-emerald font-bold">
                  {"\u2191"}
                </span>
                <p className="text-sm text-text-secondary">{growth ?? "--"}</p>
              </div>
            </Card>
            <Card title="Stress Direction (Disintegration)">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-rose/15 text-accent-rose font-bold">
                  {"\u2193"}
                </span>
                <p className="text-sm text-text-secondary">{stress ?? "--"}</p>
              </div>
            </Card>
          </div>

          {/* Raw data fallback for any extra fields */}
          {Object.keys(data).length > 10 ? (
            <Card title="Additional Data">
              <div className="space-y-2">
                {Object.entries(data)
                  .filter(
                    ([k]) =>
                      ![
                        "primary_type", "type_name", "center", "wing", "tritype",
                        "instinctual_variant", "growth_direction", "stress_direction",
                        "core_fear", "core_desire",
                      ].includes(k),
                  )
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-4 rounded-lg bg-white/[0.02] px-4 py-2.5"
                    >
                      <span className="text-sm font-medium text-text-muted capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-text-primary text-right max-w-[60%]">
                        {typeof value === "object" && value !== null
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
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
