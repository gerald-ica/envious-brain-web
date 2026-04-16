"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading";

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
}

interface DashboardData {
  sunSign: string | null;
  moonSign: string | null;
  ascendant: string | null;
  mbtiType: string | null;
  enneagram: string | null;
  lifePathNumber: number | null;
  transits: TransitItem[];
  biorhythm: { physical: number; emotional: number; intellectual: number } | null;
  forecast: string | null;
}

// ---------------------------------------------------------------------------
// Biorhythm mini bar
// ---------------------------------------------------------------------------

function BiorhythmBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const normalized = Math.abs(value);
  const isPositive = value >= 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-xs text-text-muted">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${normalized}%` }}
        />
      </div>
      <span
        className={`w-12 text-right text-xs font-mono ${
          isPositive ? "text-accent-emerald" : "text-accent-rose"
        }`}
      >
        {isPositive ? "+" : ""}
        {value}%
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton cards for loading state
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          className={`rounded-xl border border-border bg-card p-5 ${
            i === 4 ? "sm:col-span-2" : ""
          } ${i === 6 ? "sm:col-span-2 lg:col-span-3 xl:col-span-4" : ""}`}
        >
          <Skeleton className="mb-3 h-4 w-24" />
          <Skeleton className="mb-2 h-6 w-full" />
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

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

    // Also send as separate fields for endpoints that expect them
    const birthDataAlt = {
      date: activeProfile.birthDate,
      time: activeProfile.birthTime,
      latitude: activeProfile.lat,
      longitude: activeProfile.lon,
      timezone: activeProfile.timezone,
    };

    const result: DashboardData = {
      sunSign: null,
      moonSign: null,
      ascendant: null,
      mbtiType: null,
      enneagram: null,
      lifePathNumber: null,
      transits: [],
      biorhythm: null,
      forecast: null,
    };

    // Fire all API calls in parallel
    const [westernRes, synthesisRes, biorhythmRes, transitsRes, numerologyRes, forecastRes] =
      await Promise.allSettled([
        // 1. Western chart
        fetch(`${API_URL}/api/v1/charts/western`, {
          method: "POST",
          headers,
          body: JSON.stringify(birthPayload),
        }),
        // 2. Personality synthesis
        fetch(`${API_URL}/api/v1/personality/synthesis`, {
          method: "POST",
          headers,
          body: JSON.stringify(birthPayload),
        }),
        // 3. Biorhythm
        fetch(`${API_URL}/api/v1/personality/biorhythm`, {
          method: "POST",
          headers,
          body: JSON.stringify(birthPayload),
        }),
        // 4. Transits
        fetch(`${API_URL}/api/v1/charts/transits`, {
          method: "POST",
          headers,
          body: JSON.stringify(birthPayload),
        }),
        // 5. Numerology
        fetch(`${API_URL}/api/v1/charts/numerology`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ...birthPayload, name: activeProfile.name }),
        }),
        // 6. Daily forecast from Oracle
        fetch(`${API_URL}/api/v1/oracle/chat`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content:
                  "Give me a brief daily forecast for today based on my current transits. Keep it to 2-3 sentences.",
              },
            ],
            context: { birth_data: birthDataAlt },
          }),
        }),
      ]);

    let anySuccess = false;

    // Parse western chart
    if (westernRes.status === "fulfilled" && westernRes.value.ok) {
      try {
        const json = await westernRes.value.json();
        const d = json.data ?? json;
        const positions: NatalPosition[] =
          d.positions ?? d.planets ?? d.natal_positions ?? [];

        for (const pos of positions) {
          const name = (pos.planet ?? "").toLowerCase();
          if (name === "sun") result.sunSign = pos.sign;
          else if (name === "moon") result.moonSign = pos.sign;
          else if (name === "ascendant" || name === "asc" || name === "rising")
            result.ascendant = pos.sign;
        }

        // Some APIs return ascendant separately
        if (!result.ascendant && d.ascendant) {
          result.ascendant =
            typeof d.ascendant === "string" ? d.ascendant : d.ascendant.sign;
        }
        if (!result.ascendant && d.houses) {
          const h1 = Array.isArray(d.houses)
            ? d.houses.find(
                (h: Record<string, unknown>) =>
                  h.house === 1 || h.number === 1,
              )
            : null;
          if (h1) result.ascendant = h1.sign;
        }

        anySuccess = true;
      } catch {
        /* parse error, skip */
      }
    }

    // Parse synthesis
    if (synthesisRes.status === "fulfilled" && synthesisRes.value.ok) {
      try {
        const json = await synthesisRes.value.json();
        const d = json.data ?? json.result ?? json;

        result.mbtiType =
          d.mbti_type ?? d.mbti ?? d.personality_type ?? null;
        result.enneagram =
          d.enneagram_type ?? d.enneagram ?? null;

        anySuccess = true;
      } catch {
        /* skip */
      }
    }

    // Parse biorhythm
    if (biorhythmRes.status === "fulfilled" && biorhythmRes.value.ok) {
      try {
        const json = await biorhythmRes.value.json();
        const d = json.data ?? json.result ?? json;
        const bio = d.biorhythm ?? d.cycles ?? d;

        result.biorhythm = {
          physical: Math.round(
            bio.physical?.value ?? bio.physical ?? 0,
          ),
          emotional: Math.round(
            bio.emotional?.value ?? bio.emotional ?? 0,
          ),
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
        const arr = json.data ?? json.transits ?? json;
        if (Array.isArray(arr)) {
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
            }),
          );
          anySuccess = true;
        }
      } catch {
        /* skip */
      }
    }

    // Parse numerology
    if (numerologyRes.status === "fulfilled" && numerologyRes.value.ok) {
      try {
        const json = await numerologyRes.value.json();
        const d = json.data ?? json.result ?? json;
        result.lifePathNumber =
          d.life_path ?? d.life_path_number ?? d.lifePath ?? null;
        anySuccess = true;
      } catch {
        /* skip */
      }
    }

    // Parse forecast
    if (forecastRes.status === "fulfilled" && forecastRes.value.ok) {
      try {
        const json = await forecastRes.value.json();
        result.forecast =
          json.response ??
          json.data?.response ??
          json.message ??
          json.content ??
          null;
        anySuccess = true;
      } catch {
        /* skip */
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
          <p className="text-sm text-text-muted">
            Welcome to ENVI-OUS-BRAIN
          </p>
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
          <p className="text-sm text-text-muted">
            Overview for {activeProfile.name}
          </p>
        </div>
        {error && (
          <Badge variant="degraded">{error}</Badge>
        )}
      </div>

      {loading && !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* ---- Profile Summary ---- */}
          <Card title="Profile" glow="blue">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-text-primary">
                {activeProfile.name}
              </p>
              <p className="text-sm text-text-secondary">
                {activeProfile.birthDate} at {activeProfile.birthTime}
              </p>
              <p className="text-xs text-text-muted">{activeProfile.city}</p>
              <p className="text-xs text-text-muted">
                {activeProfile.timezone}
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                {data?.mbtiType && (
                  <Badge variant="info">{data.mbtiType}</Badge>
                )}
                {data?.enneagram && (
                  <Badge variant="neutral">{data.enneagram}</Badge>
                )}
                {data?.lifePathNumber != null && (
                  <Badge variant="neutral">LP {data.lifePathNumber}</Badge>
                )}
              </div>
            </div>
          </Card>

          {/* ---- Natal Snapshot (Sun/Moon/Asc) ---- */}
          <Card title="Natal Snapshot">
            <div className="space-y-3">
              <NatalRow
                glyph={"\u2609"}
                label="Sun"
                value={data?.sunSign}
                loading={loading}
              />
              <NatalRow
                glyph={"\u263D"}
                label="Moon"
                value={data?.moonSign}
                loading={loading}
              />
              <NatalRow
                glyph={"\u2191"}
                label="Ascendant"
                value={data?.ascendant}
                loading={loading}
              />
            </div>
          </Card>

          {/* ---- Personality State ---- */}
          <Card title="Personality State">
            <div className="space-y-3">
              <PersonalityRow
                label="MBTI"
                value={data?.mbtiType}
                loading={loading}
              />
              <PersonalityRow
                label="Enneagram"
                value={data?.enneagram}
                loading={loading}
              />
              <PersonalityRow
                label="Life Path"
                value={
                  data?.lifePathNumber != null
                    ? String(data.lifePathNumber)
                    : null
                }
                loading={loading}
              />
            </div>
          </Card>

          {/* ---- Quick Actions ---- */}
          <Card title="Quick Actions">
            <div className="flex flex-col gap-2">
              <Link href="/dashboard/charts/western">
                <Button variant="secondary" className="w-full text-xs justify-start gap-2">
                  {"\u2609"} View Full Chart
                </Button>
              </Link>
              <Link href="/dashboard/oracle">
                <Button variant="secondary" className="w-full text-xs justify-start gap-2">
                  {"\u2728"} Ask the Oracle
                </Button>
              </Link>
              <Link href="/dashboard/personality/synthesis">
                <Button variant="secondary" className="w-full text-xs justify-start gap-2">
                  {"\u{1F9E0}"} Personality Synthesis
                </Button>
              </Link>
            </div>
          </Card>

          {/* ---- Active Transits ---- */}
          <Card title="Active Transits" className="sm:col-span-2">
            {loading && !data?.transits.length ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data && data.transits.length > 0 ? (
              <div className="space-y-2">
                {data.transits.map((t, i) => (
                  <div
                    key={`${t.planet}-${i}`}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-text-primary">
                        {t.planet}
                      </span>
                      <span className="text-xs text-text-muted">
                        in {t.sign}
                      </span>
                    </div>
                    {t.aspect && (
                      <Badge
                        variant={
                          (t.type as "healthy" | "degraded" | "info") || "info"
                        }
                      >
                        {t.aspect}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                {error
                  ? "Transit data unavailable"
                  : "No active transits to display"}
              </p>
            )}
          </Card>

          {/* ---- Biorhythm ---- */}
          <Card title="Biorhythm">
            {loading && !data?.biorhythm ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : data?.biorhythm ? (
              <div className="space-y-3">
                <BiorhythmBar
                  label="Physical"
                  value={data.biorhythm.physical}
                  color="bg-accent-emerald"
                />
                <BiorhythmBar
                  label="Emotional"
                  value={data.biorhythm.emotional}
                  color="bg-accent-blue"
                />
                <BiorhythmBar
                  label="Intellectual"
                  value={data.biorhythm.intellectual}
                  color="bg-accent-purple"
                />
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                Biorhythm data unavailable
              </p>
            )}
          </Card>

          {/* ---- Daily Forecast ---- */}
          <Card
            title="Daily Forecast"
            className="sm:col-span-2 lg:col-span-3 xl:col-span-4"
            glow="purple"
          >
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
              <p className="text-sm text-text-muted">
                Daily forecast unavailable — try{" "}
                <Link
                  href="/dashboard/oracle"
                  className="text-accent-blue hover:underline"
                >
                  asking the Oracle
                </Link>
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small sub-components
// ---------------------------------------------------------------------------

function NatalRow({
  glyph,
  label,
  value,
  loading,
}: {
  glyph: string;
  label: string;
  value: string | null | undefined;
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-muted">
        {glyph} {label}
      </span>
      {loading && !value ? (
        <Skeleton className="h-4 w-16" />
      ) : (
        <span className="text-sm font-medium text-text-primary">
          {value ?? "\u2014"}
        </span>
      )}
    </div>
  );
}

function PersonalityRow({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | null | undefined;
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-muted">{label}</span>
      {loading && !value ? (
        <Skeleton className="h-4 w-16" />
      ) : (
        <span className="text-sm font-semibold text-accent-purple">
          {value ?? "\u2014"}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
