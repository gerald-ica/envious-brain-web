"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Color Psychology — chart for signs → /api/v1/psychology/color-palette
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

// The API returns colors as {name, hex_code} objects or plain strings
interface ColorObj {
  name: string;
  hex_code: string;
}

function parseColor(c: unknown): { name: string; hex: string } {
  if (typeof c === "string") return { name: c, hex: "" };
  if (c && typeof c === "object" && "name" in c) {
    const obj = c as ColorObj;
    return { name: obj.name, hex: obj.hex_code ?? "" };
  }
  return { name: String(c), hex: "" };
}

function ColorSwatch({ color, label }: { color: unknown; label?: string }) {
  const { name, hex } = parseColor(color);
  const isHex = hex.startsWith("#");

  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-4 py-2.5">
      {isHex ? (
        <div
          className="h-8 w-8 rounded-lg border border-white/20 shrink-0"
          style={{ backgroundColor: hex }}
        />
      ) : (
        <div className="h-8 w-8 rounded-lg bg-accent-purple/20 border border-accent-purple/30 shrink-0 flex items-center justify-center text-xs">
          {"\u25CF"}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-text-primary capitalize">{name}</p>
        {label ? <p className="text-xs text-text-muted">{label}</p> : null}
      </div>
    </div>
  );
}

export default function ColorPsychPage() {
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
        // Step 1: Get chart for Sun/Moon/Ascendant signs
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

        // Step 2: Get color palette
        const colorRes = await fetch(`${API_URL}/api/v1/psychology/color-palette`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sun_sign: sunSign,
            moon_sign: moonSign,
            rising_sign: risingSign,
          }),
        });
        if (!colorRes.ok) throw new Error(`Color API error: ${colorRes.status}`);
        setData(await colorRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load color data");
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
            Create a birth profile to view your color psychology profile.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const primaryColor = data?.primary_color;
  const secondaryColors = data?.secondary_colors as unknown[] | undefined;
  const accentColor = data?.accent_color;
  const powerColor = data?.power_color;
  const colorsToAvoid = data?.colors_to_avoid as unknown[] | undefined;
  const elementPalette = data?.element_palette as unknown[] | unknown | undefined;
  const baziColors = data?.bazi_colors as unknown[] | Record<string, unknown> | undefined;
  const seasonType = data?.season_type as string | undefined;
  const dominantElement = data?.dominant_element as string | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Color Psychology for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Personal color palette derived from your natal chart
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
          {/* Primary + Power */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {primaryColor ? (
              <Card title="Primary Color" glow="purple">
                <ColorSwatch color={primaryColor} label="Your signature color" />
              </Card>
            ) : null}
            {accentColor ? (
              <Card title="Accent Color">
                <ColorSwatch color={accentColor} label="Complementary accent" />
              </Card>
            ) : null}
            {powerColor ? (
              <Card title="Power Color">
                <ColorSwatch color={powerColor} label="For strength and confidence" />
              </Card>
            ) : null}
            {seasonType ? (
              <Card title="Season Type">
                <p className="text-lg font-medium text-text-primary capitalize">{seasonType}</p>
                {dominantElement ? (
                  <Badge variant="info" className="mt-2">{dominantElement}</Badge>
                ) : null}
              </Card>
            ) : null}
          </div>

          {/* Secondary colors */}
          {secondaryColors && secondaryColors.length > 0 ? (
            <Card title="Secondary Colors">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {secondaryColors.map((c, i) => (
                  <ColorSwatch key={i} color={c} />
                ))}
              </div>
            </Card>
          ) : null}

          {/* Colors to avoid */}
          {colorsToAvoid && colorsToAvoid.length > 0 ? (
            <Card title="Colors to Avoid">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {colorsToAvoid.map((c, i) => (
                  <ColorSwatch key={i} color={c} label="Not recommended" />
                ))}
              </div>
            </Card>
          ) : null}

          {/* Element palette */}
          {elementPalette && Array.isArray(elementPalette) && elementPalette.length > 0 ? (
            <Card title="Element Palette">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {elementPalette.map((c, i) => (
                  <ColorSwatch key={i} color={c} />
                ))}
              </div>
            </Card>
          ) : elementPalette && typeof elementPalette === "string" ? (
            <Card title="Element Palette">
              <p className="text-sm text-text-secondary capitalize">{elementPalette}</p>
            </Card>
          ) : null}

          {/* BaZi colors if present */}
          {baziColors && !Array.isArray(baziColors) && typeof baziColors === "object" && Object.keys(baziColors).length > 0 ? (
            <Card title="BaZi Colors">
              <div className="space-y-2">
                {Object.entries(baziColors).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-2.5"
                  >
                    <span className="text-sm text-text-muted capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-sm text-text-primary capitalize">{String(value)}</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
