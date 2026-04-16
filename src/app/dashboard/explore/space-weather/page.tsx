"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---- Mock Data ----

const SPACE_WEATHER = {
  kpIndex: 4,
  kpMax: 9,
  kpLabel: "Active",
  solarWindSpeed: 487,
  solarWindDensity: 6.2,
  bz: -3.8,
  sunspotNumber: 142,
  solarFlux: 168,
  xrayFlux: "C2.4",
  lastFlare: {
    class: "M1.2",
    time: "2026-04-15 14:23 UTC",
    region: "AR3945",
  },
  geomagneticStorm: {
    level: "G1",
    label: "Minor",
    description:
      "Weak power grid fluctuations can occur. Minor impact on satellite operations possible. Aurora may be visible at high latitudes.",
  },
  protonFlux: "Normal",
  electronFlux: "Elevated",
};

const KP_HISTORY = [2, 3, 2, 4, 5, 4, 3, 4, 4, 5, 3, 2, 3, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 4];

const FLARE_ALERTS = [
  {
    class: "M1.2",
    time: "Apr 15, 14:23 UTC",
    region: "AR3945",
    severity: "degraded" as const,
  },
  {
    class: "C8.7",
    time: "Apr 14, 09:11 UTC",
    region: "AR3942",
    severity: "neutral" as const,
  },
  {
    class: "C2.4",
    time: "Apr 14, 03:45 UTC",
    region: "AR3945",
    severity: "neutral" as const,
  },
  {
    class: "M2.5",
    time: "Apr 12, 22:17 UTC",
    region: "AR3940",
    severity: "degraded" as const,
  },
  {
    class: "X1.1",
    time: "Apr 10, 06:34 UTC",
    region: "AR3938",
    severity: "error" as const,
  },
];

const PERSONALITY_CORRELATIONS = [
  {
    condition: "High Kp Index (>= 4)",
    effect: "Emotional sensitivity heightened",
    detail:
      "Research suggests elevated geomagnetic activity correlates with increased anxiety, vivid dreams, and emotional reactivity. Type 5s may feel more withdrawn; INTJs may experience heightened Ni activity.",
    active: true,
  },
  {
    condition: "Solar Flare Activity",
    effect: "Cognitive disruption patterns",
    detail:
      "M-class and X-class flares have been associated with disrupted sleep, altered circadian rhythms, and difficulty concentrating. Biorhythm intellectual cycles may show amplified critical-day effects during flare events.",
    active: true,
  },
  {
    condition: "Negative Bz Component",
    effect: "Intuitive channels open",
    detail:
      "When the interplanetary magnetic field's Bz component turns southward, Earth's magnetosphere opens. Anecdotal data suggests this correlates with heightened intuitive hits and synchronicity events.",
    active: true,
  },
  {
    condition: "Solar Minimum",
    effect: "Introspection period",
    detail:
      "During solar minimum (low sunspot count), collective energy tends toward introspection and consolidation. Favorable for shadow work and deep analysis.",
    active: false,
  },
];

// ---- Kp Gauge Component ----

function KpGauge({ value, max }: { value: number; max: number }) {
  const segments = Array.from({ length: max }, (_, i) => i + 1);
  const getColor = (i: number) => {
    if (i <= 3) return "bg-accent-emerald";
    if (i <= 5) return "bg-accent-amber";
    if (i <= 7) return "bg-accent-rose";
    return "bg-red-600";
  };

  return (
    <div>
      <div className="flex gap-1 mb-2">
        {segments.map((seg) => (
          <div
            key={seg}
            className={`flex-1 h-8 rounded-sm transition-all ${
              seg <= value ? getColor(seg) : "bg-white/5"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-text-muted">
        <span>Quiet</span>
        <span>Unsettled</span>
        <span>Storm</span>
        <span>Extreme</span>
      </div>
    </div>
  );
}

// ---- Stat Box Component ----

function StatBox({
  label,
  value,
  unit,
  status,
}: {
  label: string;
  value: string | number;
  unit?: string;
  status?: "healthy" | "degraded" | "error" | "neutral";
}) {
  return (
    <div className="rounded-lg border border-border bg-white/[0.02] p-3">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold font-mono text-text-primary">
          {value}
        </span>
        {unit && <span className="text-xs text-text-muted">{unit}</span>}
      </div>
      {status && (
        <Badge variant={status} className="mt-1.5">
          {status === "healthy"
            ? "Normal"
            : status === "degraded"
              ? "Elevated"
              : status === "error"
                ? "Alert"
                : "Monitoring"}
        </Badge>
      )}
    </div>
  );
}

// ---- Page ----

export default function SpaceWeatherPage() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary">
            Space Weather
          </h1>
          <Badge variant="healthy">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-accent-emerald mr-1" />
            Live
          </Badge>
        </div>
        <p className="text-sm text-text-muted">
          Real-time solar and geomagnetic conditions with personality
          correlation analysis.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Kp Index */}
        <Card title="Kp Index" glow="blue" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-4xl font-bold font-mono text-accent-amber">
                {SPACE_WEATHER.kpIndex}
              </span>
              <span className="text-lg text-text-muted ml-1">
                / {SPACE_WEATHER.kpMax}
              </span>
            </div>
            <Badge variant="degraded">{SPACE_WEATHER.kpLabel}</Badge>
          </div>
          <KpGauge value={SPACE_WEATHER.kpIndex} max={SPACE_WEATHER.kpMax} />

          {/* 24-hour Kp history */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-text-muted mb-2">
              24-Hour Kp History (3-hour intervals)
            </p>
            <div className="flex items-end gap-1 h-16">
              {KP_HISTORY.map((kp, i) => {
                const height = (kp / 9) * 100;
                const color =
                  kp <= 3
                    ? "bg-accent-emerald"
                    : kp <= 5
                      ? "bg-accent-amber"
                      : "bg-accent-rose";
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm transition-all ${color}`}
                    style={{ height: `${height}%` }}
                    title={`Kp ${kp}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-text-muted">
              <span>-24h</span>
              <span>-12h</span>
              <span>Now</span>
            </div>
          </div>
        </Card>

        {/* Solar Wind */}
        <Card title="Solar Wind">
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="Wind Speed"
              value={SPACE_WEATHER.solarWindSpeed}
              unit="km/s"
              status="degraded"
            />
            <StatBox
              label="Density"
              value={SPACE_WEATHER.solarWindDensity}
              unit="p/cm3"
              status="healthy"
            />
            <StatBox
              label="Bz Component"
              value={SPACE_WEATHER.bz}
              unit="nT"
              status={SPACE_WEATHER.bz < 0 ? "degraded" : "healthy"}
            />
            <StatBox
              label="X-Ray Flux"
              value={SPACE_WEATHER.xrayFlux}
              status="healthy"
            />
          </div>
        </Card>

        {/* Solar Activity */}
        <Card title="Solar Activity">
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="Sunspot Number"
              value={SPACE_WEATHER.sunspotNumber}
              status="degraded"
            />
            <StatBox
              label="Solar Flux"
              value={SPACE_WEATHER.solarFlux}
              unit="sfu"
              status="degraded"
            />
            <StatBox
              label="Proton Flux"
              value={SPACE_WEATHER.protonFlux}
              status="healthy"
            />
            <StatBox
              label="Electron Flux"
              value={SPACE_WEATHER.electronFlux}
              status="degraded"
            />
          </div>
        </Card>

        {/* Solar Flare Alerts */}
        <Card title="Solar Flare Alerts">
          <div className="space-y-2">
            {FLARE_ALERTS.map((flare, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={flare.severity}>{flare.class}</Badge>
                  <div>
                    <p className="text-sm text-text-primary">{flare.region}</p>
                    <p className="text-xs text-text-muted">{flare.time}</p>
                  </div>
                </div>
                {flare.class.startsWith("X") && (
                  <span className="text-xs text-accent-rose font-medium">
                    Major Event
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Geomagnetic Storm Status */}
        <Card title="Geomagnetic Storm Status">
          <div className="text-center mb-4">
            <div
              className={`inline-flex h-20 w-20 items-center justify-center rounded-full border-2 ${
                SPACE_WEATHER.geomagneticStorm.level === "G0"
                  ? "border-accent-emerald bg-accent-emerald/10"
                  : SPACE_WEATHER.geomagneticStorm.level === "G1"
                    ? "border-accent-amber bg-accent-amber/10"
                    : "border-accent-rose bg-accent-rose/10"
              }`}
            >
              <span
                className={`text-2xl font-bold ${
                  SPACE_WEATHER.geomagneticStorm.level === "G0"
                    ? "text-accent-emerald"
                    : SPACE_WEATHER.geomagneticStorm.level === "G1"
                      ? "text-accent-amber"
                      : "text-accent-rose"
                }`}
              >
                {SPACE_WEATHER.geomagneticStorm.level}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-text-primary">
              {SPACE_WEATHER.geomagneticStorm.label} Storm
            </p>
          </div>

          {/* Storm scale */}
          <div className="flex gap-1 mb-3">
            {["G0", "G1", "G2", "G3", "G4", "G5"].map((level) => {
              const isActive =
                level === SPACE_WEATHER.geomagneticStorm.level;
              const idx = parseInt(level[1]);
              const color =
                idx === 0
                  ? "bg-accent-emerald"
                  : idx <= 2
                    ? "bg-accent-amber"
                    : idx <= 3
                      ? "bg-accent-rose"
                      : "bg-red-600";
              return (
                <div
                  key={level}
                  className={`flex-1 text-center rounded-sm py-1 text-[10px] font-mono ${
                    isActive
                      ? `${color} text-white font-bold`
                      : "bg-white/5 text-text-muted"
                  }`}
                >
                  {level}
                </div>
              );
            })}
          </div>

          <p className="text-xs leading-relaxed text-text-secondary">
            {SPACE_WEATHER.geomagneticStorm.description}
          </p>
        </Card>

        {/* Personality Correlations */}
        <Card
          title="Personality Correlations"
          glow="purple"
          className="lg:col-span-2"
        >
          <p className="text-xs text-text-muted mb-4">
            Theoretical connections between current space weather conditions and
            personality system dynamics. Based on emerging research in
            heliobiology and psychophysiology.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PERSONALITY_CORRELATIONS.map((corr) => (
              <div
                key={corr.condition}
                className={`rounded-lg border p-3 ${
                  corr.active
                    ? "border-accent-amber/30 bg-accent-amber/5"
                    : "border-border bg-white/[0.02] opacity-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-medium text-text-primary">
                    {corr.condition}
                  </span>
                  {corr.active && (
                    <Badge variant="degraded">Active Now</Badge>
                  )}
                </div>
                <p className="text-xs font-medium text-accent-amber mb-1">
                  {corr.effect}
                </p>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {corr.detail}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
