"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Hellenistic Techniques (Sect, Profection, Almuten)
// These endpoints require full_chart data which is pending backend deployment.
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

async function tryHellenistic(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export default function HellenisticPage() {
  const { activeProfile } = useProfile();
  const [sect, setSect] = useState<Record<string, unknown> | null>(null);
  const [profection, setProfection] = useState<Record<string, unknown> | null>(null);
  const [almuten, setAlmuten] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      const birthPayload = {
        datetime: `${activeProfile.birthDate}T${activeProfile.birthTime}:00`,
        latitude: activeProfile.lat,
        longitude: activeProfile.lon,
      };

      const results = await Promise.allSettled([
        tryHellenistic("/api/v1/western/hellenistic/sect", birthPayload),
        tryHellenistic("/api/v1/western/hellenistic/profection", birthPayload),
        tryHellenistic("/api/v1/western/hellenistic/almuten", birthPayload),
      ]);

      if (cancelled) return;

      const [sectRes, profRes, almRes] = results;
      if (sectRes.status === "fulfilled") setSect(sectRes.value);
      if (profRes.status === "fulfilled") setProfection(profRes.value);
      if (almRes.status === "fulfilled") setAlmuten(almRes.value);

      const allFailed = results.every((r) => r.status === "rejected");
      if (allFailed) {
        setError(
          "Hellenistic analysis requires a full chart backend update that is currently being deployed. Check back soon.",
        );
      }
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
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
