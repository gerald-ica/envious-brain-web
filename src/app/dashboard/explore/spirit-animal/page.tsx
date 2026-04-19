"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Spirit Animal — chart for signs → /api/v1/psychology/spirit-animal
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-662458014068.us-central1.run.app";

function AnimalCard({
  title,
  animal,
  badge,
}: {
  title: string;
  animal: string;
  badge?: string;
}) {
  return (
    <Card title={title}>
      <div className="text-center space-y-2">
        <p className="text-2xl font-bold text-text-primary capitalize">{animal}</p>
        {badge ? <Badge variant="info">{badge}</Badge> : null}
      </div>
    </Card>
  );
}

export default function SpiritAnimalPage() {
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
        // Step 1: Get chart for signs
        const datetime = `${activeProfile.birthDate}T${activeProfile.birthTime}:00`;
        const chartRes = await fetch(`${API_URL}/api/v1/charts/western`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            datetime,
            latitude: activeProfile.lat,
            longitude: activeProfile.lon,
            timezone: activeProfile.timezone,
          }),
        });

        let sunSign = "Aries";
        let moonSign = "Aries";
        let risingSign = "Aries";

        if (chartRes.ok) {
          const chart = await chartRes.json();
          const positions = chart.positions as Record<string, Record<string, string>> | undefined;
          if (positions) {
            sunSign = positions.Sun?.sign ?? sunSign;
            moonSign = positions.Moon?.sign ?? moonSign;
          }
          const houses = chart.houses as Array<Record<string, unknown>> | undefined;
          if (houses && houses[0]) {
            risingSign = (houses[0].sign as string) ?? risingSign;
          }
        }

        // Step 2: Get spirit animal
        const [yearStr, monthStr, dayStr] = activeProfile.birthDate.split("-");
        const animalRes = await fetch(`${API_URL}/api/v1/psychology/spirit-animal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sun_sign: sunSign,
            moon_sign: moonSign,
            rising_sign: risingSign,
            birth_year: parseInt(yearStr, 10),
            birth_month: parseInt(monthStr, 10),
            birth_day: parseInt(dayStr, 10),
          }),
        });
        if (!animalRes.ok) throw new Error(`Spirit Animal API error: ${animalRes.status}`);
        setData(await animalRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load spirit animal data");
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
            Create a birth profile to discover your spirit animals.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const primaryTotem = data?.primary_totem as string | undefined;
  const shadowAnimal = data?.shadow_animal as string | undefined;
  const socialAnimal = data?.social_animal as string | undefined;
  const powerAnimal = data?.power_animal as string | undefined;
  const chineseZodiac = data?.chinese_zodiac_animal as string | undefined;
  const nativeAmerican = data?.native_american_totem as string | undefined;
  const nativeElement = data?.native_american_element as string | undefined;
  const nativeDirection = data?.native_american_direction as string | undefined;
  const celticAnimal = data?.celtic_animal as string | undefined;
  const celticTree = data?.celtic_tree as string | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Spirit Animals for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Your totem council from multiple traditions
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
          {/* Primary totem */}
          {primaryTotem ? (
            <Card title="Primary Totem" glow="purple">
              <div className="text-center space-y-2">
                <p className="text-3xl font-bold text-accent-purple capitalize">{primaryTotem}</p>
                <p className="text-sm text-text-muted">Your core spirit guide</p>
              </div>
            </Card>
          ) : null}

          {/* Totem council */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shadowAnimal ? (
              <AnimalCard title="Shadow Animal" animal={shadowAnimal} badge="Shadow self" />
            ) : null}
            {socialAnimal ? (
              <AnimalCard title="Social Animal" animal={socialAnimal} badge="Public persona" />
            ) : null}
            {powerAnimal ? (
              <AnimalCard title="Power Animal" animal={powerAnimal} badge="Inner strength" />
            ) : null}
          </div>

          {/* Cross-cultural */}
          <Card title="Cross-Cultural Totems">
            <div className="grid gap-3 sm:grid-cols-2">
              {chineseZodiac ? (
                <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-3">
                  <span className="text-sm text-text-muted">Chinese Zodiac</span>
                  <span className="text-sm font-medium text-text-primary capitalize">{chineseZodiac}</span>
                </div>
              ) : null}
              {nativeAmerican ? (
                <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-3">
                  <span className="text-sm text-text-muted">Native American</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-text-primary capitalize">{nativeAmerican}</span>
                    {nativeElement ? (
                      <span className="ml-2 text-xs text-text-muted">({nativeElement})</span>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {nativeDirection ? (
                <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-3">
                  <span className="text-sm text-text-muted">Direction</span>
                  <span className="text-sm font-medium text-text-primary capitalize">{nativeDirection}</span>
                </div>
              ) : null}
              {celticAnimal ? (
                <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-3">
                  <span className="text-sm text-text-muted">Celtic Animal</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-text-primary capitalize">{celticAnimal}</span>
                    {celticTree ? (
                      <span className="ml-2 text-xs text-text-muted">({celticTree})</span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Raw fallback for unknown extra fields */}
          {Object.keys(data).length > 10 ? (
            <Card title="Additional Data">
              <pre className="overflow-x-auto text-xs text-text-secondary whitespace-pre-wrap">
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(data).filter(
                      ([k]) =>
                        ![
                          "primary_totem", "shadow_animal", "social_animal", "power_animal",
                          "chinese_zodiac_animal", "native_american_totem", "native_american_element",
                          "native_american_direction", "celtic_animal", "celtic_tree",
                        ].includes(k),
                    ),
                  ),
                  null,
                  2,
                )}
              </pre>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
