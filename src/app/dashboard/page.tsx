"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading";
import { BiorhythmChart } from "@/components/charts/biorhythm-chart";
import { motion } from "framer-motion";
import {
  Sun, Moon, ArrowUp, Hash, Sparkles, TrendingUp,
  Activity, Flame, Droplets, Wind, Mountain,
  CircleDot, Orbit, Star, MessageCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("envious_access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ---------------------------------------------------------------------------
// Types for API responses
// ---------------------------------------------------------------------------

interface NatalPosition {
  planet: string;
  sign: string;
  degree?: string;
  house?: number;
  retrograde?: boolean;
}

interface TransitItem {
  planet: string;
  sign: string;
  aspect?: string;
  type?: string;
  degree?: number;
  natalPlanet?: string;
  orb?: number;
}

interface DashboardData {
  sunSign: string | null;
  moonSign: string | null;
  ascendant: string | null;
  sunDegree: number | null;
  moonDegree: number | null;
  ascDegree: number | null;
  mbtiType: string | null;
  enneagram: string | null;
  lifePathNumber: number | null;
  transits: TransitItem[];
  biorhythm: { physical: number; emotional: number; intellectual: number } | null;
  forecast: string | null;
  elements: { Fire: number; Earth: number; Air: number; Water: number };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIGN_ELEMENT: Record<string, "Fire" | "Earth" | "Air" | "Water"> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
};

const ELEMENT_CONFIG = [
  { key: "Fire" as const, icon: Flame, color: "text-rose-400", bg: "bg-rose-400", border: "border-rose-400/30" },
  { key: "Earth" as const, icon: Mountain, color: "text-emerald-400", bg: "bg-emerald-400", border: "border-emerald-400/30" },
  { key: "Air" as const, icon: Wind, color: "text-blue-400", bg: "bg-blue-400", border: "border-blue-400/30" },
  { key: "Water" as const, icon: Droplets, color: "text-purple-400", bg: "bg-purple-400", border: "border-purple-400/30" },
];

const LIFE_PATH_KEYWORDS: Record<number, string> = {
  1: "Leader", 2: "Diplomat", 3: "Creative", 4: "Builder", 5: "Explorer",
  6: "Nurturer", 7: "Seeker", 8: "Powerhouse", 9: "Humanitarian",
  11: "Visionary", 22: "Master Builder", 33: "Master Teacher",
};

const SIGN_DESCRIPTIONS: Record<string, string> = {
  Aries: "bold pioneer", Taurus: "grounded creator", Gemini: "curious communicator",
  Cancer: "intuitive guardian", Leo: "confident leader", Virgo: "meticulous analyst",
  Libra: "harmonious diplomat", Scorpio: "intense transformer", Sagittarius: "adventurous seeker",
  Capricorn: "ambitious strategist", Aquarius: "visionary innovator", Pisces: "empathic dreamer",
};

function getHeroDescription(sun: string | null, moon: string | null, asc: string | null): string {
  if (!sun) return "Discover your cosmic identity by loading your natal chart.";
  const sunDesc = SIGN_DESCRIPTIONS[sun] || sun.toLowerCase();
  const moonDesc = moon ? SIGN_DESCRIPTIONS[moon] || moon.toLowerCase() : null;
  const ascDesc = asc ? SIGN_DESCRIPTIONS[asc] || asc.toLowerCase() : null;
  let desc = `The ${sunDesc}`;
  if (moonDesc) desc += ` with the emotional depth of a ${moonDesc}`;
  if (ascDesc) desc += ` and the presence of a ${ascDesc}`;
  return desc;
}

const ASPECT_COLORS: Record<string, string> = {
  conjunction: "border-l-blue-400",
  trine: "border-l-emerald-400",
  sextile: "border-l-emerald-400",
  square: "border-l-amber-400",
  opposition: "border-l-rose-400",
};

function getAspectBorder(aspect?: string): string {
  if (!aspect) return "border-l-text-muted";
  const lower = aspect.toLowerCase();
  for (const [key, val] of Object.entries(ASPECT_COLORS)) {
    if (lower.includes(key)) return val;
  }
  return "border-l-blue-400";
}

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { activeProfile } = useProfile();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!activeProfile) return;

    setLoading(true);
    setError(null);

    const headers = getHeaders();
    const birthPayload = {
      datetime: `${activeProfile.birthDate}T${activeProfile.birthTime}:00`,
      latitude: activeProfile.lat,
      longitude: activeProfile.lon,
      timezone: activeProfile.timezone,
    };
    const today = new Date().toISOString().split("T")[0];

    const result: DashboardData = {
      sunSign: null,
      moonSign: null,
      ascendant: null,
      sunDegree: null,
      moonDegree: null,
      ascDegree: null,
      mbtiType: null,
      enneagram: null,
      lifePathNumber: null,
      transits: [],
      biorhythm: null,
      forecast: null,
      elements: { Fire: 0, Earth: 0, Air: 0, Water: 0 },
    };

    let anySuccess = false;

    // ---- Step 1: Fetch western chart FIRST (other endpoints need its data) ----
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chartData: any = null;
    let natalPositions: Record<string, number> = {};

    try {
      const westernRes = await fetch(`${API_URL}/api/v1/charts/western`, {
        method: "POST",
        headers,
        body: JSON.stringify(birthPayload),
      });

      if (westernRes.ok) {
        const json = await westernRes.json();
        chartData = json.data ?? json;

        // Extract Sun, Moon, Ascendant from positions object
        const positions = chartData.positions ?? chartData.planets ?? {};

        if (positions && typeof positions === "object" && !Array.isArray(positions)) {
          for (const [planet, data] of Object.entries(positions)) {
            const pData = data as Record<string, unknown>;
            const name = planet.toLowerCase();
            if (name === "sun") {
              result.sunSign = pData.sign as string;
              result.sunDegree = (pData.longitude ?? null) as number | null;
            } else if (name === "moon") {
              result.moonSign = pData.sign as string;
              result.moonDegree = (pData.longitude ?? null) as number | null;
            }

            // Build natal longitude map for transits endpoint
            if (typeof pData.longitude === "number") {
              natalPositions[planet] = pData.longitude;
            }

            // Count elements
            const sign = pData.sign as string;
            if (sign && SIGN_ELEMENT[sign]) {
              result.elements[SIGN_ELEMENT[sign]]++;
            }
          }
        } else if (Array.isArray(positions)) {
          for (const pos of positions as NatalPosition[]) {
            const name = (pos.planet ?? "").toLowerCase();
            if (name === "sun") result.sunSign = pos.sign;
            else if (name === "moon") result.moonSign = pos.sign;
            const sign = pos.sign;
            if (sign && SIGN_ELEMENT[sign]) {
              result.elements[SIGN_ELEMENT[sign]]++;
            }
          }
        }

        // Extract Ascendant from houses (house 1 cusp sign)
        const houses = chartData.houses;
        if (Array.isArray(houses) && houses.length > 0) {
          const h1 = houses.find(
            (h: Record<string, unknown>) =>
              h.house === 1 || h.number === 1,
          );
          if (h1) {
            result.ascendant = (h1 as Record<string, unknown>).sign as string;
            result.ascDegree = ((h1 as Record<string, unknown>).degree ?? (h1 as Record<string, unknown>).longitude ?? null) as number | null;
          }
        }
        if (!result.ascendant && chartData.ascendant) {
          result.ascendant =
            typeof chartData.ascendant === "string"
              ? chartData.ascendant
              : (chartData.ascendant as Record<string, unknown>).sign as string;
        }

        anySuccess = true;
      }
    } catch {
      /* western chart failed, continue */
    }

    // ---- Life Path: computed client-side ----
    result.lifePathNumber = calculateLifePath(activeProfile.birthDate);

    // ---- Step 2: Fire remaining calls in parallel ----
    const [biorhythmRes, transitsRes, archetypesRes, forecastRes, enneagramRes, personalityRes] =
      await Promise.allSettled([
        fetch(`${API_URL}/api/v1/personality/biorhythm`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            birth_date: activeProfile.birthDate,
            target_date: today,
          }),
        }),
        Object.keys(natalPositions).length > 0
          ? fetch(`${API_URL}/api/v1/transits/current`, {
              method: "POST",
              headers,
              body: JSON.stringify({ natal_positions: natalPositions }),
            })
          : Promise.reject(new Error("No natal positions available")),
        result.sunSign
          ? fetch(`${API_URL}/api/v1/psychology/jungian-archetypes`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                sun_sign: result.sunSign,
                moon_sign: result.moonSign,
                ascendant: result.ascendant,
              }),
            })
          : Promise.reject(new Error("No chart data for archetypes")),
        (async () => {
          const sessionRes = await fetch(`${API_URL}/api/v1/llm/sessions`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              system_prompt:
                "You are a cosmic oracle. Give brief daily forecasts based on astrological data.",
            }),
          });
          if (!sessionRes.ok) throw new Error(`LLM session: ${sessionRes.status}`);
          const session = await sessionRes.json();
          const sid = session.session_id ?? session.data?.session_id;
          if (!sid) throw new Error("No session ID returned");

          const msgRes = await fetch(
            `${API_URL}/api/v1/llm/sessions/${sid}/messages`,
            {
              method: "POST",
              headers,
              body: JSON.stringify({
                role: "user",
                content:
                  "Give me a brief daily forecast for today based on current transits. Keep it to 2-3 sentences.",
              }),
            },
          );
          if (!msgRes.ok) throw new Error(`LLM message: ${msgRes.status}`);
          return msgRes;
        })(),
        fetch(`${API_URL}/api/v1/personality/enneagram`, {
          method: "POST",
          headers,
          body: JSON.stringify({ mbti_type: "INTJ" }),
        }),
        fetch(`${API_URL}/api/v1/personality/calculate`, {
          method: "POST",
          headers,
          body: JSON.stringify({ mbti_type: "INTJ" }),
        }),
      ]);

    // Parse biorhythm
    if (biorhythmRes.status === "fulfilled" && biorhythmRes.value.ok) {
      try {
        const json = await biorhythmRes.value.json();
        const d = json.data ?? json.result ?? json;
        const bio = d.biorhythm ?? d.cycles ?? d;

        result.biorhythm = {
          physical: Math.round(bio.physical?.value ?? bio.physical ?? 0),
          emotional: Math.round(bio.emotional?.value ?? bio.emotional ?? 0),
          intellectual: Math.round(
            bio.intellectual?.value ?? bio.intellectual ?? 0,
          ),
        };
        anySuccess = true;
      } catch {
        /* skip */
      }
    }

    // Parse transits
    if (transitsRes.status === "fulfilled" && transitsRes.value.ok) {
      try {
        const json = await transitsRes.value.json();
        const raw = json.data ?? json.transits ?? json;
        const arr = Array.isArray(raw)
          ? raw
          : typeof raw === "object"
            ? Object.entries(raw).map(([planet, info]) => ({
                planet,
                ...(info as Record<string, unknown>),
              }))
            : [];

        if (arr.length > 0) {
          result.transits = arr.slice(0, 6).map(
            (t: Record<string, unknown>) => ({
              planet: (t.planet as string) ?? "Unknown",
              sign: (t.sign as string) ?? "",
              aspect:
                (t.aspect as string) ??
                (t.aspect_type as string) ??
                undefined,
              type: mapTransitType(
                (t.aspect as string) ?? (t.aspect_type as string) ?? "",
              ),
              natalPlanet: (t.natal_planet as string) ?? (t.target as string) ?? undefined,
              orb: typeof t.orb === "number" ? t.orb : undefined,
            }),
          );
          anySuccess = true;
        }
      } catch {
        /* skip */
      }
    }

    // Parse archetypes
    if (archetypesRes.status === "fulfilled" && archetypesRes.value.ok) {
      try {
        await archetypesRes.value.json();
        anySuccess = true;
      } catch {
        /* skip */
      }
    }

    // Parse enneagram
    if (enneagramRes.status === "fulfilled" && enneagramRes.value.ok) {
      try {
        const json = await enneagramRes.value.json();
        const d = json.data ?? json.result ?? json;
        const primaryType = d.primary_type ?? d.type ?? d.enneagram_type;
        const typeName = d.type_name ?? d.name ?? "";
        if (primaryType != null) {
          result.enneagram = typeName
            ? `${primaryType} (${typeName})`
            : String(primaryType);
        }
        anySuccess = true;
      } catch {
        /* skip */
      }
    }

    // Parse MBTI from personality/calculate
    if (personalityRes.status === "fulfilled" && personalityRes.value.ok) {
      try {
        const json = await personalityRes.value.json();
        const d = json.data ?? json.result ?? json;
        result.mbtiType = d.mbti_type ?? d.type ?? d.personality_type ?? null;
        anySuccess = true;
      } catch {
        /* skip */
      }
    }

    // Parse forecast
    if (forecastRes.status === "fulfilled") {
      try {
        const res = forecastRes.value as Response;
        if (res.ok) {
          const json = await res.json();
          result.forecast =
            json.content ??
            json.response ??
            json.data?.content ??
            json.data?.response ??
            json.message ??
            null;
          anySuccess = true;
        }
      } catch {
        /* Oracle/LLM not configured — that's OK */
      }
    }

    if (!anySuccess) {
      setError("Data unavailable \u2014 check API connection");
    }

    setData(result);
    setLoading(false);
  }, [activeProfile]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // -- Empty state
  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-muted">Welcome to ENVI-OUS-BRAIN</p>
        </div>
        <Card title="Create Your Profile" glow="blue">
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-text-secondary">
              To view your personalized natal chart, transits, and daily
              forecast, add your first profile. All you need is a birth date,
              time, and location.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard/settings">
                <Button>Add your first profile</Button>
              </Link>
              <span className="text-xs text-text-muted">
                Your data is private and stored with end-to-end authentication.
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-muted">Overview for {activeProfile.name}</p>
        </div>
        {error && <Badge variant="degraded">{error}</Badge>}
      </div>

      {loading && !data ? (
        <DashboardSkeleton />
      ) : (
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="space-y-6"
        >
          {/* ===== HERO SECTION ===== */}
          <motion.div variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-rose-500/10 p-6 sm:p-8">
              {/* Gradient border glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-rose-500/20 opacity-50 blur-xl" />
              <div className="relative z-10">
                {/* Big Three */}
                <div className="flex flex-wrap items-center gap-3 text-lg sm:text-xl font-semibold text-text-primary">
                  {data?.sunSign && (
                    <span className="flex items-center gap-1.5">
                      <Sun size={22} className="text-amber-400" />
                      {data.sunSign} Sun
                    </span>
                  )}
                  {data?.moonSign && (
                    <>
                      <span className="text-text-muted">·</span>
                      <span className="flex items-center gap-1.5">
                        <Moon size={22} className="text-blue-300" />
                        {data.moonSign} Moon
                      </span>
                    </>
                  )}
                  {data?.ascendant && (
                    <>
                      <span className="text-text-muted">·</span>
                      <span className="flex items-center gap-1.5">
                        <ArrowUp size={22} className="text-purple-400" />
                        {data.ascendant} Rising
                      </span>
                    </>
                  )}
                  {!data?.sunSign && !loading && (
                    <span className="text-text-muted">Chart data loading...</span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-3 text-sm sm:text-base italic text-text-secondary max-w-2xl leading-relaxed">
                  &ldquo;{getHeroDescription(data?.sunSign ?? null, data?.moonSign ?? null, data?.ascendant ?? null)}&rdquo;
                </p>

                {/* Personality badges */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {data?.lifePathNumber != null && (
                    <Badge variant="info">
                      Life Path {data.lifePathNumber}
                    </Badge>
                  )}
                  {data?.enneagram && (
                    <Badge variant="neutral">{data.enneagram}</Badge>
                  )}
                  {data?.mbtiType && (
                    <Badge variant="info">{data.mbtiType}</Badge>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ===== QUICK STATS ROW ===== */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={Sun}
              iconColor="text-amber-400"
              borderColor="border-t-amber-400"
              degree={data?.sunDegree}
              label="Sun"
              sign={data?.sunSign}
              loading={loading}
              index={0}
            />
            <StatCard
              icon={Moon}
              iconColor="text-blue-300"
              borderColor="border-t-blue-300"
              degree={data?.moonDegree}
              label="Moon"
              sign={data?.moonSign}
              loading={loading}
              index={1}
            />
            <StatCard
              icon={ArrowUp}
              iconColor="text-purple-400"
              borderColor="border-t-purple-400"
              degree={data?.ascDegree}
              label="ASC"
              sign={data?.ascendant}
              loading={loading}
              index={2}
            />
            <StatCard
              icon={Hash}
              iconColor="text-emerald-400"
              borderColor="border-t-emerald-400"
              degree={null}
              label="Life Path"
              sign={data?.lifePathNumber != null ? LIFE_PATH_KEYWORDS[data.lifePathNumber] ?? `#${data.lifePathNumber}` : null}
              loading={loading}
              index={3}
              overrideValue={data?.lifePathNumber != null ? `#${data.lifePathNumber}` : null}
            />
          </div>

          {/* ===== MAIN GRID ===== */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* LEFT COLUMN: Transits + Elements */}
            <div className="lg:col-span-2 space-y-4">
              {/* Active Transits */}
              <motion.div variants={fadeUp}>
                <Card title="Active Transits">
                  {loading && !data?.transits.length ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : data && data.transits.length > 0 ? (
                    <motion.div
                      initial="initial"
                      animate="animate"
                      variants={stagger}
                      className="space-y-2"
                    >
                      {data.transits.map((t, i) => (
                        <motion.div
                          key={`${t.planet}-${i}`}
                          variants={fadeUp}
                          whileHover={{ x: 3 }}
                          className={`rounded-lg border-l-[3px] ${getAspectBorder(t.aspect)} bg-card px-4 py-3 transition-colors hover:bg-card-hover`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Orbit size={16} className="text-text-muted" />
                              <span className="text-sm font-medium text-text-primary">
                                {t.planet}
                              </span>
                              {t.aspect && (
                                <span className="text-xs text-text-muted">
                                  {t.aspect}
                                </span>
                              )}
                              {t.natalPlanet && (
                                <span className="text-xs text-text-secondary">
                                  natal {t.natalPlanet}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {t.orb != null && (
                                <span className="text-xs font-mono text-text-muted">
                                  orb: {t.orb.toFixed(1)}°
                                </span>
                              )}
                              <Badge
                                variant={
                                  (t.type as "healthy" | "degraded" | "info") || "info"
                                }
                              >
                                {t.sign}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <p className="text-sm text-text-muted">
                      {error ? "Transit data unavailable" : "No active transits to display"}
                    </p>
                  )}
                </Card>
              </motion.div>

              {/* Element Distribution */}
              <motion.div variants={fadeUp}>
                <Card title="Element Distribution">
                  {data ? (
                    <div className="space-y-3">
                      {ELEMENT_CONFIG.map((el) => {
                        const count = data.elements[el.key];
                        const total = Object.values(data.elements).reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                          <div key={el.key} className="flex items-center gap-3">
                            <div className="flex items-center gap-2 w-24">
                              <el.icon size={16} className={el.color} />
                              <span className="text-xs text-text-muted">{el.key}</span>
                            </div>
                            <div className="flex-1 h-3 rounded-full bg-card overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`h-full rounded-full ${el.bg} opacity-70`}
                              />
                            </div>
                            <span className="w-16 text-right text-xs font-mono text-text-secondary">
                              {count} ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">Loading element data...</p>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Biorhythm + Quick Actions */}
            <div className="space-y-4">
              {/* Biorhythm */}
              <motion.div variants={fadeUp}>
                <Card title="Biorhythm">
                  {loading && !data?.biorhythm ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  ) : (
                    <BiorhythmChart birthDate={activeProfile.birthDate} days={30} />
                  )}
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={fadeUp}>
                <Card title="Quick Actions">
                  <div className="flex flex-col gap-2">
                    <Link href="/dashboard/charts/western">
                      <motion.div whileHover={{ x: 3 }}>
                        <Button variant="secondary" className="w-full text-xs justify-start gap-2">
                          <Sun size={16} /> View Full Chart
                        </Button>
                      </motion.div>
                    </Link>
                    <Link href="/dashboard/oracle">
                      <motion.div whileHover={{ x: 3 }}>
                        <Button variant="secondary" className="w-full text-xs justify-start gap-2">
                          <MessageCircle size={16} /> Ask the Oracle
                        </Button>
                      </motion.div>
                    </Link>
                    <Link href="/dashboard/personality/synthesis">
                      <motion.div whileHover={{ x: 3 }}>
                        <Button variant="secondary" className="w-full text-xs justify-start gap-2">
                          <Activity size={16} /> Personality Synthesis
                        </Button>
                      </motion.div>
                    </Link>
                    <Link href="/dashboard/techniques/hellenistic">
                      <motion.div whileHover={{ x: 3 }}>
                        <Button variant="secondary" className="w-full text-xs justify-start gap-2">
                          <Star size={16} /> Hellenistic Techniques
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* ===== DAILY ORACLE CARD ===== */}
          <motion.div variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-purple-500/10 p-2.5">
                  <Sparkles size={20} className="text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Daily Oracle</h3>
                  {loading && !data?.forecast ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : data?.forecast ? (
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {data.forecast}
                    </p>
                  ) : (
                    <div>
                      <p className="text-sm text-text-muted mb-3">
                        The Oracle awaits your question. Get a personalized reading based on your chart.
                      </p>
                      <Link href="/dashboard/oracle">
                        <Button variant="secondary" className="text-xs gap-2">
                          <Sparkles size={14} /> Ask the Oracle
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  iconColor,
  borderColor,
  degree,
  label,
  sign,
  loading: isLoading,
  index,
  overrideValue,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  borderColor: string;
  degree: number | null | undefined;
  label: string;
  sign: string | null | undefined;
  loading: boolean;
  index: number;
  overrideValue?: string | null;
}) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`rounded-xl border border-border border-t-2 ${borderColor} bg-card p-4 cursor-default`}
    >
      {isLoading && !sign ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-10" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-1">
            <Icon size={18} className={iconColor} />
            <span className="text-lg font-bold text-text-primary font-mono">
              {overrideValue ?? (degree != null ? `${Math.round(degree)}°` : "—")}
            </span>
          </div>
          <p className="text-xs text-text-muted">{label}</p>
          <p className="text-sm font-medium text-text-secondary">{sign ?? "—"}</p>
        </>
      )}
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-2xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calculateLifePath(birthDate: string): number {
  const digits = birthDate.replace(/-/g, "");
  let sum = 0;
  for (const ch of digits) {
    sum += parseInt(ch, 10);
  }
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    let next = 0;
    while (sum > 0) {
      next += sum % 10;
      sum = Math.floor(sum / 10);
    }
    sum = next;
  }
  return sum;
}

function mapTransitType(aspect: string): "healthy" | "degraded" | "info" {
  const lower = (aspect || "").toLowerCase();
  if (
    lower.includes("trine") ||
    lower.includes("sextile") ||
    lower.includes("conjunction")
  )
    return "healthy";
  if (lower.includes("square") || lower.includes("opposition"))
    return "degraded";
  return "info";
}
