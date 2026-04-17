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
// Sabian Symbols
// ---------------------------------------------------------------------------

export default function SabianSymbolsPage() {
  const { activeProfile } = useProfile();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
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
    api.techniques
      .sabianSymbols(birth)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Sabian symbols API error:", err);
        const status = (err as { status?: number }).status;
        if (status === 404) {
          setError("Sabian symbols endpoint is not yet deployed.");
        } else if (status === 422) {
          setError("Invalid request — check your birth profile data.");
        } else {
          setError("Failed to load Sabian symbols. Check API connection.");
        }
      })
      .finally(() => setLoading(false));
  }, [activeProfile]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view Sabian symbols.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const symbols = data?.symbols as Array<Record<string, unknown>> | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Sabian Symbols for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Symbolic degree meanings for each planet's position
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
          {symbols && symbols.length > 0 ? (
            <Card title="Degree Symbols">
              <div className="space-y-4">
                {symbols.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-white/[0.02] px-4 py-3 space-y-1"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-text-primary">
                        {s.planet as string}
                      </span>
                      <Badge variant="info">
                        {s.sign as string} {String(s.degree ?? "")}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary italic">
                      {s.symbol as string}
                    </p>
                    {s.keynote ? (
                      <p className="text-xs text-text-muted">
                        {s.keynote as string}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card title="Results">
              <pre className="overflow-x-auto text-xs text-text-secondary whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
