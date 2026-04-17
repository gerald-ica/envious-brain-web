"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { api, type BirthData } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Hellenistic Techniques (Sect, Profection, Almuten)
// ---------------------------------------------------------------------------

export default function HellenisticPage() {
  const { activeProfile } = useProfile();
  const [sect, setSect] = useState<Record<string, unknown> | null>(null);
  const [profection, setProfection] = useState<Record<string, unknown> | null>(null);
  const [almuten, setAlmuten] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) return;
    const birth: BirthData = {
      date: activeProfile.birthDate,
      time: activeProfile.birthTime,
      latitude: activeProfile.lat,
      longitude: activeProfile.lon,
      timezone: activeProfile.timezone,
    };
    setLoading(true);
    setError(null);

    Promise.allSettled([
      api.westernAdvanced.hellenistic.sect(birth),
      api.westernAdvanced.hellenistic.profection(birth),
      api.westernAdvanced.hellenistic.almuten(birth),
    ])
      .then(([sectRes, profRes, almRes]) => {
        if (sectRes.status === "fulfilled") setSect(sectRes.value.data);
        if (profRes.status === "fulfilled") setProfection(profRes.value.data);
        if (almRes.status === "fulfilled") setAlmuten(almRes.value.data);
        const failed = [sectRes, profRes, almRes].filter(
          (r) => r.status === "rejected",
        );
        if (failed.length === 3) {
          const firstErr = (failed[0] as PromiseRejectedResult).reason;
          const status = (firstErr as { status?: number })?.status;
          if (status === 404) {
            setError("Hellenistic endpoints are not yet deployed.");
          } else if (status === 422) {
            setError("Hellenistic analysis requires a backend update that is pending deployment. Check back soon.");
          } else {
            setError("Failed to load Hellenistic data. Check API connection.");
          }
        }
      })
      .finally(() => setLoading(false));
  }, [activeProfile]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view Hellenistic analysis.
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Hellenistic Techniques for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Classical sect analysis, annual profections, and almuten chart ruler
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

      {!loading && (
        <div className="animate-fade-in space-y-6">
          {sect && (
            <Card title="Sect Analysis">
              <div className="space-y-3">
                {renderKeyValue(sect)}
              </div>
            </Card>
          )}

          {profection && (
            <Card title="Annual Profections">
              <div className="space-y-3">
                {renderKeyValue(profection)}
              </div>
            </Card>
          )}

          {almuten && (
            <Card title="Almuten (Chart Ruler)">
              <div className="space-y-3">
                {renderKeyValue(almuten)}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function renderKeyValue(obj: Record<string, unknown>) {
  return Object.entries(obj).map(([key, value]) => (
    <div
      key={key}
      className="flex items-start justify-between gap-4 rounded-lg bg-white/[0.02] px-4 py-2.5"
    >
      <span className="text-sm font-medium text-text-muted capitalize">
        {key.replace(/_/g, " ")}
      </span>
      <span className="text-sm text-text-primary text-right max-w-[60%]">
        {typeof value === "object" && value !== null ? (
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {JSON.stringify(value, null, 2)}
          </pre>
        ) : (
          String(value)
        )}
      </span>
    </div>
  ));
}
