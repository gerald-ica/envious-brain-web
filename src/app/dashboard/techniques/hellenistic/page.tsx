"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

interface SectData {
  is_day_chart?: boolean;
  sect_light?: string;
  benefic_of_sect?: string;
  malefic_of_sect?: string;
  contrary_light?: string;
  contrary_benefic?: string;
  contrary_malefic?: string;
}

interface ProfectionData {
  age?: number;
  profected_sign?: string;
  profected_house?: number;
  lord_of_year?: string;
}

interface AlmutenData {
  degree?: number;
  sign?: string;
  scores?: Record<string, number>;
  almuten?: string;
}

export default function HellenisticPage() {
  const { activeProfile } = useProfile();
  const [sect, setSect] = useState<SectData | null>(null);
  const [profection, setProfection] = useState<ProfectionData | null>(null);
  const [almuten, setAlmuten] = useState<AlmutenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const birthPayload = {
          datetime: `${activeProfile.birthDate}T${activeProfile.birthTime || "12:00"}:00`,
          latitude: activeProfile.lat,
          longitude: activeProfile.lon,
        };

        // Step 1: Get western chart for ASC sign and Sun longitude
        const chartRes = await fetch(`${API_URL}/api/v1/charts/western`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(birthPayload),
        });
        if (!chartRes.ok) throw new Error("Failed to compute natal chart");
        const chart = await chartRes.json();

        // Extract ASC sign from houses[0] and Sun longitude
        const ascSign = (chart.houses?.[0]?.sign ?? "Aries") as string;
        const sunLongitude = ((chart.positions?.Sun as Record<string, unknown>)?.longitude ?? 0) as number;
        const birthYear = parseInt(activeProfile.birthDate.split("-")[0], 10);
        const currentYear = new Date().getFullYear();

        // Step 2: Three parallel calls with correct payloads
        const results = await Promise.allSettled([
          fetchJSON(`${API_URL}/api/v1/western/hellenistic/sect`, birthPayload),
          fetchJSON(`${API_URL}/api/v1/western/hellenistic/profection`, {
            birth_year: birthYear,
            current_year: currentYear,
            asc_sign: ascSign,
          }),
          fetchJSON(`${API_URL}/api/v1/western/hellenistic/almuten`, {
            longitude: sunLongitude,
          }),
        ]);

        if (cancelled) return;

        const [sectRes, profRes, almRes] = results;
        if (sectRes.status === "fulfilled") setSect(sectRes.value as SectData);
        if (profRes.status === "fulfilled") setProfection(profRes.value as ProfectionData);
        if (almRes.status === "fulfilled") setAlmuten(almRes.value as AlmutenData);

        if (results.every((r) => r.status === "rejected")) {
          setError("Hellenistic endpoints are being deployed. Check back soon.");
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load Hellenistic techniques");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeProfile]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">Create a birth profile to view Hellenistic analysis.</p>
          <Link href="/dashboard/settings"><Button>Go to Settings</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Hellenistic Techniques for {activeProfile.name}</h1>
        <p className="mt-1 text-sm text-text-muted">Classical sect analysis, annual profections, and almuten chart ruler</p>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-20 w-full rounded" />))}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-4 py-2.5 text-sm text-accent-rose">
          {error}
        </div>
      )}

      {!loading && (
        <div className="animate-fade-in space-y-6">
          {/* Sect Analysis */}
          {sect && (
            <Card title="Sect Analysis">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Chart Type" value={sect.is_day_chart ? "Day Chart ☀️" : "Night Chart 🌙"} />
                <InfoRow label="Sect Light" value={sect.sect_light} />
                <InfoRow label="Benefic of Sect" value={sect.benefic_of_sect} variant="healthy" />
                <InfoRow label="Malefic of Sect" value={sect.malefic_of_sect} variant="degraded" />
                <InfoRow label="Contrary Light" value={sect.contrary_light} />
                <InfoRow label="Contrary Benefic" value={sect.contrary_benefic} />
                <InfoRow label="Contrary Malefic" value={sect.contrary_malefic} />
              </div>
            </Card>
          )}

          {/* Annual Profections */}
          {profection && (
            <Card title="Annual Profections">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Age" value={profection.age != null ? String(profection.age) : undefined} />
                <InfoRow label="Profected Sign" value={profection.profected_sign} variant="info" />
                <InfoRow label="Profected House" value={profection.profected_house != null ? String(profection.profected_house) : undefined} />
                <InfoRow label="Lord of the Year" value={profection.lord_of_year} variant="info" />
              </div>
            </Card>
          )}

          {/* Almuten */}
          {almuten && (
            <Card title="Almuten (Chart Ruler)">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-muted">Almuten:</span>
                  <Badge variant="healthy">{almuten.almuten ?? "—"}</Badge>
                  {almuten.sign && (
                    <span className="text-sm text-text-secondary">at {almuten.sign} {typeof almuten.degree === "number" ? `${almuten.degree.toFixed(1)}°` : ""}</span>
                  )}
                </div>
                {almuten.scores && Object.keys(almuten.scores).length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="pb-2 pr-4 font-medium text-text-muted">Planet</th>
                          <th className="pb-2 font-medium text-text-muted">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(almuten.scores)
                          .sort(([, a], [, b]) => b - a)
                          .map(([planet, score]) => (
                            <tr key={planet} className={`border-b border-border/50 last:border-0 ${planet === almuten.almuten ? "bg-white/[0.03]" : ""}`}>
                              <td className="py-2 pr-4 font-medium text-text-primary">
                                {planet}
                                {planet === almuten.almuten && <span className="ml-2 text-xs text-green-400">★ Almuten</span>}
                              </td>
                              <td className="py-2 font-mono text-text-secondary">{score}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

async function fetchJSON(url: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function InfoRow({ label, value, variant }: { label: string; value?: string; variant?: "healthy" | "degraded" | "info" | "neutral" }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-2.5">
      <span className="text-sm text-text-muted">{label}</span>
      {value ? (
        variant ? <Badge variant={variant}>{value}</Badge> : <span className="text-sm font-medium text-text-primary">{value}</span>
      ) : (
        <span className="text-sm text-text-muted">—</span>
      )}
    </div>
  );
}
