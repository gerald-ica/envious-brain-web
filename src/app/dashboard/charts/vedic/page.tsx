"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CitySearch } from "@/components/ui/city-search";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Vedic Astrology (Jyotish)
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

// ---- Types ----------------------------------------------------------------

interface VedicPlanet {
  sign?: string;
  longitude?: number;
  degree?: number;
  nakshatra?: string;
  pada?: number;
  nakshatra_lord?: string;
  lord?: string;
  retrograde?: boolean;
}

interface NakshatraInfo {
  name?: string;
  lord?: string;
  deity?: string;
  symbol?: string;
  nature?: string;
  description?: string;
}

interface DashaSubPeriod {
  planet?: string;
  start?: string;
  end?: string;
  active?: boolean;
}

interface DashaInfo {
  current?: string;
  start_date?: string;
  end_date?: string;
  sub_periods?: DashaSubPeriod[];
}

interface VedicResponse {
  positions?: Record<string, VedicPlanet>;
  nakshatra?: NakshatraInfo;
  dashas?: DashaInfo;
  ayanamsa?: string | number;
  [k: string]: unknown;
}

// ---- Helpers --------------------------------------------------------------

function formatDegV(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  const norm = ((value % 30) + 30) % 30;
  const d = Math.floor(norm);
  const m = Math.round((norm - d) * 60);
  return `${d}\u00b0${String(m).padStart(2, "0")}'`;
}

// ---- Page -----------------------------------------------------------------

export default function VedicPage() {
  const { activeProfile } = useProfile();

  const [birthDate, setBirthDate] = useState(activeProfile?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(activeProfile?.birthTime ?? "");
  const [city, setCity] = useState(activeProfile?.city ?? "");
  const [latitude, setLatitude] = useState(
    activeProfile ? String(activeProfile.lat) : "",
  );
  const [longitude, setLongitude] = useState(
    activeProfile ? String(activeProfile.lon) : "",
  );
  const [timezone, setTimezone] = useState(activeProfile?.timezone ?? "UTC");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notDeployed, setNotDeployed] = useState(false);
  const [data, setData] = useState<VedicResponse | null>(null);

  const fetchChart = async (
    date: string,
    time: string,
    lat: number,
    lon: number,
    tz: string,
  ) => {
    setLoading(true);
    setError(null);
    setNotDeployed(false);
    const t = time || "12:00";
    const payload = {
      datetime: `${date}T${t}:00`,
      latitude: lat,
      longitude: lon,
      timezone: tz,
      ayanamsa: "lahiri",
    };

    const urls = [
      `${API_URL}/api/v1/charts/vedic`,
      `${API_URL}/api/v1/vedic/chart`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.status === 404) continue;
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = (await res.json()) as VedicResponse;
        setData(json);
        setLoading(false);
        return;
      } catch (err) {
        if (url === urls[urls.length - 1]) {
          console.warn("Vedic API unavailable:", err);
        }
      }
    }

    // All URLs returned 404 or failed
    setNotDeployed(true);
    setLoading(false);
  };

  useEffect(() => {
    if (!activeProfile) return;
    setBirthDate(activeProfile.birthDate);
    setBirthTime(activeProfile.birthTime);
    setCity(activeProfile.city);
    setLatitude(String(activeProfile.lat));
    setLongitude(String(activeProfile.lon));
    setTimezone(activeProfile.timezone);
    fetchChart(
      activeProfile.birthDate,
      activeProfile.birthTime,
      activeProfile.lat,
      activeProfile.lon,
      activeProfile.timezone,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile]);

  const handleCalculate = () => {
    fetchChart(
      birthDate,
      birthTime,
      Number(latitude),
      Number(longitude),
      timezone,
    );
  };

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view your Vedic chart.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const positions = data?.positions;
  const nakshatra = data?.nakshatra;
  const dashas = data?.dashas;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Vedic Chart for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Jyotish -- sidereal zodiac with Lahiri ayanamsha
        </p>
      </div>

      {/* Birth Data */}
      <Card title="Birth Data" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Birth Date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
          <Input
            label="Birth Time"
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
          />
          <CitySearch
            label="Birth City"
            value={city}
            onChange={(c) => {
              setCity(c.name);
              setLatitude(String(c.lat));
              setLongitude(String(c.lon));
            }}
            placeholder="Search for a city..."
          />
          <div className="flex items-end">
            <Button onClick={handleCalculate} disabled={loading} className="w-full">
              {loading ? "Calculating..." : "Recalculate"}
            </Button>
          </div>
        </div>
      </Card>

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

      {notDeployed && !loading && (
        <Card glow="none">
          <div className="flex items-center gap-3">
            <Badge variant="degraded">Unavailable</Badge>
            <p className="text-sm text-accent-amber">
              Vedic chart endpoint is being deployed. Check back soon.
            </p>
          </div>
        </Card>
      )}

      {data && !loading && (
        <div className="animate-fade-in space-y-6">
          {/* Rashi Positions */}
          {positions && Object.keys(positions).length > 0 && (
            <Card title="Rashi Positions (Sidereal)">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Sign</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Degree</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Nakshatra</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Pada</th>
                      <th className="pb-2 font-medium text-text-muted">Lord</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(positions).map(([planet, p]) => (
                      <tr
                        key={planet}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-2.5 pr-4 font-medium text-text-primary">
                          {p.retrograde ? `${planet} (R)` : planet}
                        </td>
                        <td className="py-2.5 pr-4 text-text-secondary">{p.sign ?? "-"}</td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">
                          {formatDegV(p.degree ?? p.longitude)}
                        </td>
                        <td className="py-2.5 pr-4 text-accent-purple">{p.nakshatra ?? "-"}</td>
                        <td className="py-2.5 pr-4 text-text-muted">{p.pada ?? "-"}</td>
                        <td className="py-2.5 text-text-muted">{p.nakshatra_lord ?? p.lord ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Nakshatra Display */}
          {nakshatra && (
            <Card title="Moon Nakshatra" glow="purple">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-accent-purple/20 bg-accent-purple/10">
                  <p className="text-2xl font-bold text-accent-purple">
                    {nakshatra.name ?? "-"}
                  </p>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {nakshatra.lord && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">Lord:</span>
                        <span className="text-sm font-medium text-text-primary">{nakshatra.lord}</span>
                      </div>
                    )}
                    {nakshatra.deity && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">Deity:</span>
                        <span className="text-sm font-medium text-text-primary">{nakshatra.deity}</span>
                      </div>
                    )}
                    {nakshatra.symbol && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">Symbol:</span>
                        <span className="text-sm text-text-secondary">{nakshatra.symbol}</span>
                      </div>
                    )}
                    {nakshatra.nature && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">Nature:</span>
                        <Badge variant="healthy">{nakshatra.nature}</Badge>
                      </div>
                    )}
                  </div>
                  {nakshatra.description && (
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {nakshatra.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Vimshottari Dasha */}
          {dashas && (
            <Card title="Vimshottari Dasha Periods">
              <div className="mb-4 rounded-lg bg-accent-blue/5 border border-accent-blue/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {dashas.current ?? "Current Period"}
                    </span>
                    <Badge variant="info">Active</Badge>
                  </div>
                  {(dashas.start_date || dashas.end_date) && (
                    <span className="text-xs text-text-muted">
                      {dashas.start_date} to {dashas.end_date}
                    </span>
                  )}
                </div>
              </div>

              {dashas.sub_periods && dashas.sub_periods.length > 0 && (
                <>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Antardasha (Sub-periods)
                  </p>
                  <div className="space-y-2">
                    {dashas.sub_periods.map((sp, i) => (
                      <div
                        key={sp.planet ?? i}
                        className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${
                          sp.active
                            ? "bg-accent-blue/10 border border-accent-blue/30"
                            : "bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-medium ${
                              sp.active ? "text-accent-blue" : "text-text-primary"
                            }`}
                          >
                            {sp.planet}
                          </span>
                          {sp.active && <Badge variant="info">Current</Badge>}
                        </div>
                        <span className="text-xs text-text-muted">
                          {sp.start} -- {sp.end}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          )}

          {/* Raw JSON fallback for any extra data not covered above */}
          {!positions && (
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
