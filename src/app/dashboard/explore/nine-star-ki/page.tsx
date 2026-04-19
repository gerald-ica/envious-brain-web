"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Nine Star Ki — via /api/v1/chinese/ninestarki/calculate
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-662458014068.us-central1.run.app";

export default function NineStarKiPage() {
  const { activeProfile } = useProfile();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [yearStr, monthStr, dayStr] = activeProfile.birthDate.split("-");
        const res = await fetch(`${API_URL}/api/v1/chinese/ninestarki/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            birth_year: parseInt(yearStr, 10),
            birth_month: parseInt(monthStr, 10),
          }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Nine Star Ki");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeProfile]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view your Nine Star Ki profile.
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
          Nine Star Ki for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Japanese astrology system based on birth date
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
          {/* Render structured data if it has known keys */}
          {renderNineStarData(data)}
        </div>
      )}
    </div>
  );
}

function renderNineStarData(data: Record<string, unknown>) {
  // Try to extract common fields
  const entries = Object.entries(data);
  const simpleFields: [string, unknown][] = [];
  const objectFields: [string, Record<string, unknown>][] = [];
  const arrayFields: [string, unknown[]][] = [];

  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      arrayFields.push([key, value]);
    } else if (typeof value === "object" && value !== null) {
      objectFields.push([key, value as Record<string, unknown>]);
    } else {
      simpleFields.push([key, value]);
    }
  }

  return (
    <>
      {/* Simple key-value fields */}
      {simpleFields.length > 0 ? (
        <Card title="Profile">
          <div className="space-y-2">
            {simpleFields.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-2.5"
              >
                <span className="text-sm font-medium text-text-muted capitalize">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Object fields as cards */}
      {objectFields.map(([key, obj]) => (
        <Card key={key} title={key.replace(/_/g, " ")}>
          <div className="space-y-2">
            {Object.entries(obj).map(([k, v]) => (
              <div
                key={k}
                className="flex items-start justify-between gap-4 rounded-lg bg-white/[0.02] px-4 py-2.5"
              >
                <span className="text-sm font-medium text-text-muted capitalize">
                  {k.replace(/_/g, " ")}
                </span>
                <span className="text-sm text-text-primary text-right max-w-[60%]">
                  {typeof v === "object" && v !== null
                    ? JSON.stringify(v)
                    : String(v)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Array fields */}
      {arrayFields.map(([key, arr]) => (
        <Card key={key} title={key.replace(/_/g, " ")}>
          <div className="space-y-2">
            {arr.map((item, i) => (
              <div key={i} className="rounded-lg bg-white/[0.02] px-4 py-2.5">
                <p className="text-sm text-text-secondary">
                  {typeof item === "object" && item !== null
                    ? JSON.stringify(item)
                    : String(item)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </>
  );
}
