"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { Brain, Sparkles, Zap, Eye, Shield } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-662458014068.us-central1.run.app";

const SIGN_TO_MBTI: Record<string, string> = {
  Aries: "ESTP", Taurus: "ISFJ", Gemini: "ENTP",
  Cancer: "ISFP", Leo: "ENFJ", Virgo: "ISTJ",
  Libra: "ENFP", Scorpio: "INTJ", Sagittarius: "ENTP",
  Capricorn: "ENTJ", Aquarius: "INTP", Pisces: "INFP",
};

const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("envious_access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

interface PersonalityData {
  mbtiType: string;
  dominant_function?: string;
  auxiliary_function?: string;
  personality_state?: string;
  narrative_summary?: string;
  base_weights?: Record<string, number>;
  final_weights?: Record<string, number>;
  // dynamic-personality
  dominant_traits?: string[];
  shadow_traits?: string[];
  current_mood?: string;
  energy_level?: string | number;
  cognitive_style?: string;
  personality_vector?: Record<string, number>;
  // archetypes
  primary_archetype?: string;
  secondary_archetype?: string;
  shadow_archetype?: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function StrengthBar({ label, value, color, highlight }: { label: string; value: number; color: string; highlight?: boolean }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <span className={`w-28 text-xs ${highlight ? "text-text-primary font-medium" : "text-text-muted"}`}>{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-card overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="w-10 text-right text-xs font-mono text-text-secondary">{pct}%</span>
    </div>
  );
}

export default function MBTIPage() {
  const { activeProfile } = useProfile();
  const [data, setData] = useState<PersonalityData | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [derivedType, setDerivedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonality = useCallback(async (mbtiType: string) => {
    setLoading(true);
    setError(null);
    const headers = getHeaders();

    const result: PersonalityData = { mbtiType };

    try {
      // Parallel calls: personality/calculate, dynamic-personality, jungian-archetypes
      const birthPayload = activeProfile ? {
        birth_datetime: `${activeProfile.birthDate}T${activeProfile.birthTime || "12:00"}:00`,
        latitude: activeProfile.lat,
        longitude: activeProfile.lon,
      } : null;

      const [calcRes, dynRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/v1/personality/calculate`, {
          method: "POST", headers,
          body: JSON.stringify({ mbti_type: mbtiType }),
        }),
        birthPayload
          ? fetch(`${API_URL}/api/v1/integration/dynamic-personality`, {
              method: "POST", headers,
              body: JSON.stringify({
                birth_data: birthPayload,
                target_datetime: new Date().toISOString(),
              }),
            })
          : Promise.reject(new Error("No profile")),
      ]);

      // Parse personality/calculate
      if (calcRes.status === "fulfilled" && calcRes.value.ok) {
        const json = await calcRes.value.json();
        result.dominant_function = json.dominant_function;
        result.auxiliary_function = json.auxiliary_function;
        result.personality_state = json.personality_state;
        result.narrative_summary = json.narrative_summary;
        result.base_weights = json.base_weights;
        result.final_weights = json.final_weights;
      }

      // Parse dynamic-personality
      if (dynRes.status === "fulfilled" && dynRes.value.ok) {
        const json = await dynRes.value.json();
        const d = json.data ?? json;
        result.dominant_traits = d.dominant_traits;
        result.shadow_traits = d.shadow_traits;
        result.current_mood = d.current_mood;
        result.energy_level = d.energy_level;
        result.cognitive_style = d.cognitive_style;
        result.personality_vector = d.personality_vector;
      }

      // Archetypes are fetched separately in the mount effect
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load MBTI data");
    } finally {
      setLoading(false);
    }
  }, [activeProfile]);

  // On mount: derive MBTI from chart
  useEffect(() => {
    if (!activeProfile) return;
    let cancelled = false;
    const headers = getHeaders();

    (async () => {
      try {
        const chartRes = await fetch(`${API_URL}/api/v1/charts/western`, {
          method: "POST", headers,
          body: JSON.stringify({
            datetime: `${activeProfile.birthDate}T${activeProfile.birthTime || "12:00"}:00`,
            latitude: activeProfile.lat,
            longitude: activeProfile.lon,
          }),
        });
        if (chartRes.ok) {
          const chart = await chartRes.json();
          const sunSign = chart?.positions?.Sun?.sign as string | undefined;
          if (sunSign && SIGN_TO_MBTI[sunSign] && !cancelled) {
            const derived = SIGN_TO_MBTI[sunSign];
            setDerivedType(derived);
            setSelectedType(derived);
          }

          // Also fetch archetypes
          if (sunSign) {
            const moonSign = chart?.positions?.Moon?.sign as string | undefined;
            const houses = chart?.houses as Array<Record<string, unknown>> | undefined;
            const h1 = houses?.find((h) => h.number === 1 || h.house === 1);
            const asc = (h1?.sign as string) ?? undefined;

            try {
              const archRes = await fetch(`${API_URL}/api/v1/psychology/jungian-archetypes`, {
                method: "POST", headers,
                body: JSON.stringify({ sun_sign: sunSign, moon_sign: moonSign, ascendant: asc }),
              });
              if (archRes.ok && !cancelled) {
                const archJson = await archRes.json();
                const d = archJson.data ?? archJson;
                setData((prev) => prev ? {
                  ...prev,
                  primary_archetype: d.primary_archetype ?? d.primary,
                  secondary_archetype: d.secondary_archetype ?? d.secondary,
                  shadow_archetype: d.shadow_archetype ?? d.shadow,
                } : null);
              }
            } catch { /* skip */ }
          }
        }
      } catch { /* chart fetch failed, use default */ }
    })();

    return () => { cancelled = true; };
  }, [activeProfile]);

  // Fetch data when selectedType changes
  useEffect(() => {
    if (selectedType) {
      fetchPersonality(selectedType);
    }
  }, [selectedType, fetchPersonality]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">Create a birth profile to explore MBTI personality types.</p>
          <Link href="/dashboard/settings"><Button>Go to Settings</Button></Link>
        </Card>
      </div>
    );
  }

  const finalWeights = data?.final_weights;
  const baseWeights = data?.base_weights;
  const dominant = data?.dominant_function;
  const auxiliary = data?.auxiliary_function;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">MBTI Cognitive Functions</h1>
        <p className="mt-1 text-sm text-text-muted">Jungian cognitive function analysis for {activeProfile.name}</p>
      </div>

      {/* Hero: Derived Type */}
      {loading && !data ? (
        <div className="space-y-4 mb-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid gap-3 sm:grid-cols-3"><Skeleton className="h-20 rounded-xl" /><Skeleton className="h-20 rounded-xl" /><Skeleton className="h-20 rounded-xl" /></div>
        </div>
      ) : data ? (
        <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }} className="space-y-6">
          {/* Hero */}
          <motion.div variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-purple/15">
                  <Brain size={32} className="text-accent-purple" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-3xl font-bold text-accent-purple">{data.mbtiType}</span>
                    {derivedType === data.mbtiType && (
                      <Badge variant="info">Derived from chart</Badge>
                    )}
                    {data.personality_state && (
                      <Badge variant="neutral">{data.personality_state}</Badge>
                    )}
                  </div>
                  {data.narrative_summary && (
                    <p className="mt-2 text-sm text-text-secondary leading-relaxed max-w-2xl">{data.narrative_summary}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Core Functions */}
          <motion.div variants={fadeUp}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card title="Dominant Function">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-amber-400" />
                  <p className="text-lg font-medium text-text-primary">{dominant ?? "—"}</p>
                </div>
              </Card>
              <Card title="Auxiliary Function">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-blue-400" />
                  <p className="text-lg font-medium text-text-primary">{auxiliary ?? "—"}</p>
                </div>
              </Card>
              <Card title="Cognitive Style">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-400" />
                  <p className="text-lg font-medium text-text-primary">{data.cognitive_style ?? "—"}</p>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Cosmic Personality from dynamic-personality */}
          {(data.dominant_traits || data.shadow_traits || data.current_mood) && (
            <motion.div variants={fadeUp}>
              <Card title="Your Cosmic Personality">
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.dominant_traits && data.dominant_traits.length > 0 && (
                    <div>
                      <p className="text-xs text-text-muted mb-2 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-emerald-400" /> Dominant Traits
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.dominant_traits.map((t) => (
                          <Badge key={t} variant="healthy">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.shadow_traits && data.shadow_traits.length > 0 && (
                    <div>
                      <p className="text-xs text-text-muted mb-2 flex items-center gap-1.5">
                        <Shield size={12} className="text-rose-400" /> Shadow Traits
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.shadow_traits.map((t) => (
                          <Badge key={t} variant="degraded">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.current_mood && (
                    <div>
                      <p className="text-xs text-text-muted mb-1">Current Mood</p>
                      <p className="text-sm font-medium text-text-primary">{data.current_mood}</p>
                    </div>
                  )}
                  {data.energy_level != null && (
                    <div>
                      <p className="text-xs text-text-muted mb-1">Energy Level</p>
                      <p className="text-sm font-medium text-text-primary">{String(data.energy_level)}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Archetypes */}
          {(data.primary_archetype || data.secondary_archetype || data.shadow_archetype) && (
            <motion.div variants={fadeUp}>
              <Card title="Jungian Archetypes">
                <div className="grid gap-4 sm:grid-cols-3">
                  {data.primary_archetype && (
                    <div className="rounded-lg bg-accent-emerald/5 border border-accent-emerald/20 p-3">
                      <p className="text-xs text-accent-emerald mb-1">Primary</p>
                      <p className="text-sm font-medium text-text-primary">{data.primary_archetype}</p>
                    </div>
                  )}
                  {data.secondary_archetype && (
                    <div className="rounded-lg bg-accent-blue/5 border border-accent-blue/20 p-3">
                      <p className="text-xs text-accent-blue mb-1">Secondary</p>
                      <p className="text-sm font-medium text-text-primary">{data.secondary_archetype}</p>
                    </div>
                  )}
                  {data.shadow_archetype && (
                    <div className="rounded-lg bg-accent-rose/5 border border-accent-rose/20 p-3">
                      <p className="text-xs text-accent-rose mb-1">Shadow</p>
                      <p className="text-sm font-medium text-text-primary">{data.shadow_archetype}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Cognitive Function Weights */}
          {finalWeights && (
            <motion.div variants={fadeUp}>
              <Card title="Cognitive Function Stack">
                <div className="space-y-3">
                  {Object.entries(finalWeights)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([fn, weight]) => (
                      <StrengthBar
                        key={fn}
                        label={fn}
                        value={weight as number}
                        color={fn === dominant ? "bg-accent-purple" : fn === auxiliary ? "bg-accent-blue" : "bg-text-muted/40"}
                        highlight={fn === dominant || fn === auxiliary}
                      />
                    ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Base vs Final */}
          {baseWeights && finalWeights && (
            <motion.div variants={fadeUp}>
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
                            <td className="py-2 pr-4 font-mono text-text-secondary">{(base * 100).toFixed(0)}%</td>
                            <td className="py-2 pr-4 font-mono text-text-secondary">{(final_ * 100).toFixed(0)}%</td>
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
            </motion.div>
          )}

          {/* Manual Override */}
          <motion.div variants={fadeUp}>
            <Card title="Explore Other Types">
              <p className="text-xs text-text-muted mb-3">Your type was derived from your Sun sign. Select a different type to explore its cognitive functions.</p>
              <div className="flex flex-wrap gap-2">
                {MBTI_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-colors ${
                      selectedType === t
                        ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/40"
                        : "bg-card text-text-secondary hover:bg-card-hover border border-border"
                    }`}
                  >
                    {t}
                    {t === derivedType && " ★"}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      ) : null}

      {error && !loading && (
        <div className="mb-4 rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-4 py-2.5 text-sm text-accent-rose">
          {error}
        </div>
      )}
    </div>
  );
}
