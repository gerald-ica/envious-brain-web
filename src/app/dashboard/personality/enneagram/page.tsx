"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { Gem, ArrowUpRight, ArrowDownRight, Heart, ShieldAlert, Compass, Sparkles } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

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

interface EnneagramData {
  primary_type?: number;
  type_name?: string;
  center?: string;
  wing?: string;
  tritype?: string;
  instinctual_variant?: string;
  growth_direction?: string;
  stress_direction?: string;
  core_fear?: string;
  core_desire?: string;
  // convergence
  dominant_theme?: string;
  theme_scores?: Record<string, number>;
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function EnneagramPage() {
  const { activeProfile } = useProfile();
  const [data, setData] = useState<EnneagramData | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [derivedType, setDerivedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnneagram = useCallback(async (mbtiType: string) => {
    setLoading(true);
    setError(null);
    const headers = getHeaders();

    try {
      // Parallel: enneagram + cosmic-convergence
      const birthPayload = activeProfile ? {
        datetime: `${activeProfile.birthDate}T${activeProfile.birthTime || "12:00"}:00`,
        latitude: activeProfile.lat,
        longitude: activeProfile.lon,
      } : null;

      const [enneaRes, convRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/v1/personality/enneagram`, {
          method: "POST", headers,
          body: JSON.stringify({ mbti_type: mbtiType }),
        }),
        birthPayload
          ? fetch(`${API_URL}/api/v1/personality/cosmic-convergence`, {
              method: "POST", headers,
              body: JSON.stringify(birthPayload),
            })
          : Promise.reject(new Error("No profile")),
      ]);

      const result: EnneagramData = {};

      // Parse enneagram
      if (enneaRes.status === "fulfilled" && enneaRes.value.ok) {
        const json = await enneaRes.value.json();
        result.primary_type = json.primary_type;
        result.type_name = json.type_name;
        result.center = json.center;
        result.wing = json.wing;
        result.tritype = json.tritype;
        result.instinctual_variant = json.instinctual_variant;
        result.growth_direction = json.growth_direction;
        result.stress_direction = json.stress_direction;
        result.core_fear = json.core_fear;
        result.core_desire = json.core_desire;
      } else {
        throw new Error("Failed to load Enneagram data");
      }

      // Parse convergence
      if (convRes.status === "fulfilled" && convRes.value.ok) {
        const json = await convRes.value.json();
        const d = json.data ?? json;
        result.dominant_theme = d.dominant_theme;
        result.theme_scores = d.theme_scores;
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Enneagram data");
    } finally {
      setLoading(false);
    }
  }, [activeProfile]);

  // Derive MBTI from chart on mount
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
        }
      } catch { /* use default */ }
      // If chart fetch failed, fall back to INTJ
      if (!cancelled && !derivedType) {
        setSelectedType("INTJ");
      }
    })();

    return () => { cancelled = true; };
  }, [activeProfile]);

  // Fetch when selectedType changes
  useEffect(() => {
    if (selectedType) {
      fetchEnneagram(selectedType);
    }
  }, [selectedType, fetchEnneagram]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">Create a birth profile to explore the Enneagram.</p>
          <Link href="/dashboard/settings"><Button>Go to Settings</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Enneagram for {activeProfile.name}</h1>
        <p className="mt-1 text-sm text-text-muted">Core motivations, growth and stress directions</p>
      </div>

      {loading && !data ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full rounded-xl" />
          <div className="grid gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      ) : data ? (
        <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }} className="space-y-6">
          {/* Hero */}
          <motion.div variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-emerald/15">
                  <Gem size={32} className="text-accent-emerald" />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-3xl font-bold text-accent-emerald">
                      Type {data.primary_type}
                    </span>
                    {data.type_name && (
                      <span className="text-xl text-text-secondary">— {data.type_name}</span>
                    )}
                    {derivedType === selectedType && (
                      <Badge variant="info">Derived from chart</Badge>
                    )}
                  </div>
                  {data.center && (
                    <p className="mt-1 text-sm text-text-muted">{data.center} Center</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Core Info Grid */}
          <motion.div variants={fadeUp}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card title="Center">
                <div className="flex items-center gap-2">
                  <Compass size={18} className="text-blue-400" />
                  <p className="text-lg font-medium text-text-primary">{data.center ?? "—"}</p>
                </div>
              </Card>
              <Card title="Wing">
                <p className="text-lg font-medium text-text-primary">{data.wing ?? "—"}</p>
              </Card>
              <Card title="Tritype">
                <p className="text-lg font-medium text-text-primary">{data.tritype ?? "—"}</p>
              </Card>
              <Card title="Instinctual Variant">
                <p className="text-lg font-medium text-text-primary">{data.instinctual_variant ?? "—"}</p>
              </Card>
            </div>
          </motion.div>

          {/* Core Fear & Desire */}
          <motion.div variants={fadeUp}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-accent-rose/20 bg-accent-rose/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert size={18} className="text-accent-rose" />
                  <h3 className="text-sm font-semibold text-accent-rose">Core Fear</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {data.core_fear ?? "Not available"}
                </p>
              </div>
              <div className="rounded-xl border border-accent-emerald/20 bg-accent-emerald/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={18} className="text-accent-emerald" />
                  <h3 className="text-sm font-semibold text-accent-emerald">Core Desire</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {data.core_desire ?? "Not available"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Growth & Stress */}
          <motion.div variants={fadeUp}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="Growth Direction (Integration)">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-emerald/15">
                    <ArrowUpRight size={20} className="text-accent-emerald" />
                  </div>
                  <p className="text-sm text-text-secondary flex-1">{data.growth_direction ?? "—"}</p>
                </div>
              </Card>
              <Card title="Stress Direction (Disintegration)">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-rose/15">
                    <ArrowDownRight size={20} className="text-accent-rose" />
                  </div>
                  <p className="text-sm text-text-secondary flex-1">{data.stress_direction ?? "—"}</p>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Cosmic Convergence Themes */}
          {data.theme_scores && Object.keys(data.theme_scores).length > 0 && (
            <motion.div variants={fadeUp}>
              <Card title="Cosmic Convergence">
                <div className="space-y-3">
                  {data.dominant_theme && (
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-accent-purple" />
                      <span className="text-sm text-text-muted">Dominant Theme:</span>
                      <Badge variant="info">{data.dominant_theme}</Badge>
                    </div>
                  )}
                  {Object.entries(data.theme_scores)
                    .sort(([, a], [, b]) => b - a)
                    .map(([theme, score]) => (
                      <div key={theme} className="flex items-center gap-3">
                        <span className="w-32 text-xs text-text-muted capitalize">{theme.replace(/_/g, " ")}</span>
                        <div className="flex-1 h-2.5 rounded-full bg-card overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(score * 100, 100)}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`h-full rounded-full ${theme === data.dominant_theme ? "bg-accent-purple" : "bg-text-muted/40"}`}
                          />
                        </div>
                        <span className="w-12 text-right text-xs font-mono text-text-secondary">
                          {typeof score === "number" ? `${Math.round(score * 100)}%` : String(score)}
                        </span>
                      </div>
                    ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Manual Override */}
          <motion.div variants={fadeUp}>
            <Card title="Explore Other Types">
              <p className="text-xs text-text-muted mb-3">
                Your Enneagram type was derived from your chart-based MBTI ({derivedType ?? "INTJ"}). Select a different MBTI to see its Enneagram mapping.
              </p>
              <div className="flex flex-wrap gap-2">
                {MBTI_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-colors ${
                      selectedType === t
                        ? "bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/40"
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
