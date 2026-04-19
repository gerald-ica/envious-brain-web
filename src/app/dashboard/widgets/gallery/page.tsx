"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-662458014068.us-central1.run.app";

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

// ---- Types ------------------------------------------------------------------

interface Widget {
  id: string;
  name: string;
  description: string;
  category: "Astrology" | "Personality" | "Forecast";
  preview: string;
  sizes: string[];
  embedCode: string;
}

// ---- Mock Data --------------------------------------------------------------

const WIDGETS: Widget[] = [
  {
    id: "chart-wheel",
    name: "Chart Wheel",
    description:
      "Interactive natal chart wheel with planet positions, house cusps, and aspect lines. Supports Western, Vedic, and Equal house systems.",
    category: "Astrology",
    preview: "chart-wheel",
    sizes: ["300x300", "400x400", "600x600"],
    embedCode: `<iframe
  src="https://widgets.envious-brain.com/chart-wheel?key=YOUR_KEY&chart_id=CHART_ID"
  width="400" height="400"
  frameBorder="0"
  style="border-radius: 12px; border: 1px solid #1e293b;"
></iframe>`,
  },
  {
    id: "reading-card",
    name: "Reading Card",
    description:
      "Compact card showing a personality or natal reading summary. Includes sun sign, moon sign, ascendant, and key aspects.",
    category: "Personality",
    preview: "reading-card",
    sizes: ["350x200", "400x250", "600x350"],
    embedCode: `<iframe
  src="https://widgets.envious-brain.com/reading-card?key=YOUR_KEY&chart_id=CHART_ID"
  width="400" height="250"
  frameBorder="0"
  style="border-radius: 12px; border: 1px solid #1e293b;"
></iframe>`,
  },
  {
    id: "transit-alert",
    name: "Transit Alert",
    description:
      "Live transit notification widget showing current planetary aspects affecting the user's chart. Updates in real time.",
    category: "Astrology",
    preview: "transit-alert",
    sizes: ["300x150", "400x200", "600x300"],
    embedCode: `<iframe
  src="https://widgets.envious-brain.com/transit-alert?key=YOUR_KEY&chart_id=CHART_ID"
  width="400" height="200"
  frameBorder="0"
  style="border-radius: 12px; border: 1px solid #1e293b;"
></iframe>`,
  },
  {
    id: "daily-horoscope",
    name: "Daily Horoscope",
    description:
      "AI-generated daily horoscope widget personalized to the user's natal chart. Includes energy score, themes, and alerts.",
    category: "Forecast",
    preview: "daily-horoscope",
    sizes: ["350x250", "400x300", "600x450"],
    embedCode: `<iframe
  src="https://widgets.envious-brain.com/daily-horoscope?key=YOUR_KEY&chart_id=CHART_ID"
  width="400" height="300"
  frameBorder="0"
  style="border-radius: 12px; border: 1px solid #1e293b;"
></iframe>`,
  },
  {
    id: "compatibility-meter",
    name: "Compatibility Meter",
    description:
      "Synastry-based compatibility gauge between two charts. Shows overall score and key aspect highlights.",
    category: "Astrology",
    preview: "compatibility-meter",
    sizes: ["300x200", "400x250"],
    embedCode: `<iframe
  src="https://widgets.envious-brain.com/compatibility-meter?key=YOUR_KEY&chart_a=ID_A&chart_b=ID_B"
  width="400" height="250"
  frameBorder="0"
  style="border-radius: 12px; border: 1px solid #1e293b;"
></iframe>`,
  },
  {
    id: "mbti-badge",
    name: "MBTI Badge",
    description:
      "Astrologically-derived MBTI type badge with confidence score and cognitive functions breakdown.",
    category: "Personality",
    preview: "mbti-badge",
    sizes: ["200x80", "300x100"],
    embedCode: `<iframe
  src="https://widgets.envious-brain.com/mbti-badge?key=YOUR_KEY&chart_id=CHART_ID"
  width="300" height="100"
  frameBorder="0"
  style="border-radius: 12px; border: 1px solid #1e293b;"
></iframe>`,
  },
  {
    id: "weekly-forecast",
    name: "Weekly Forecast",
    description:
      "Seven-day forecast overview with daily energy scores, key transit events, and personalized guidance.",
    category: "Forecast",
    preview: "weekly-forecast",
    sizes: ["400x350", "600x400"],
    embedCode: `<iframe
  src="https://widgets.envious-brain.com/weekly-forecast?key=YOUR_KEY&chart_id=CHART_ID"
  width="400" height="350"
  frameBorder="0"
  style="border-radius: 12px; border: 1px solid #1e293b;"
></iframe>`,
  },
  {
    id: "biorhythm-graph",
    name: "Biorhythm Graph",
    description:
      "Animated biorhythm graph showing physical, emotional, and intellectual cycles for the current period.",
    category: "Personality",
    preview: "biorhythm-graph",
    sizes: ["400x200", "600x300"],
    embedCode: `<iframe
  src="https://widgets.envious-brain.com/biorhythm-graph?key=YOUR_KEY&chart_id=CHART_ID"
  width="400" height="200"
  frameBorder="0"
  style="border-radius: 12px; border: 1px solid #1e293b;"
></iframe>`,
  },
];

const CATEGORIES = ["All", "Astrology", "Personality", "Forecast"] as const;

// ---- Mock Previews ----------------------------------------------------------

function WidgetPreview({ type }: { type: string }) {
  switch (type) {
    case "chart-wheel":
      return (
        <div className="flex items-center justify-center h-full">
          <div className="relative h-32 w-32">
            <div className="absolute inset-0 rounded-full border-2 border-accent-blue/30" />
            <div className="absolute inset-3 rounded-full border border-accent-purple/20" />
            <div className="absolute inset-6 rounded-full border border-border" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom"
                style={{ transform: `rotate(${deg}deg)`, background: "rgba(59,130,246,0.15)" }}
              />
            ))}
            <div className="absolute" style={{ top: "20%", left: "55%" }}>
              <span className="text-[10px] text-accent-amber">{"\u2609"}</span>
            </div>
            <div className="absolute" style={{ top: "60%", left: "25%" }}>
              <span className="text-[10px] text-text-muted">{"\u263D"}</span>
            </div>
            <div className="absolute" style={{ top: "40%", left: "70%" }}>
              <span className="text-[10px] text-accent-rose">{"\u2642"}</span>
            </div>
          </div>
        </div>
      );

    case "reading-card":
      return (
        <div className="space-y-2 p-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-accent-purple/20 flex items-center justify-center text-xs text-accent-purple">
              {"\u2606"}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-primary">Natal Reading</p>
              <p className="text-[8px] text-text-muted">Gemini Sun / Scorpio Moon</p>
            </div>
          </div>
          <div className="space-y-1">
            {["Sun in Gemini 10H", "Moon in Scorpio 3H", "Asc Virgo"].map((p) => (
              <div key={p} className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-accent-blue" />
                <span className="text-[8px] text-text-secondary">{p}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "transit-alert":
      return (
        <div className="space-y-1.5 p-2">
          <p className="text-[9px] font-semibold text-text-primary">Live Transits</p>
          {[
            { icon: "\u263F", text: "Mercury conj Sun", type: "info" },
            { icon: "\u2640", text: "Venus trine Moon", type: "healthy" },
          ].map((t) => (
            <div
              key={t.text}
              className="flex items-center gap-1.5 rounded bg-white/[0.03] px-1.5 py-1"
            >
              <span className="text-[10px]">{t.icon}</span>
              <span className="text-[8px] text-text-secondary">{t.text}</span>
              <div
                className={`ml-auto h-1.5 w-1.5 rounded-full ${
                  t.type === "info" ? "bg-accent-blue" : "bg-accent-emerald"
                }`}
              />
            </div>
          ))}
        </div>
      );

    case "daily-horoscope":
      return (
        <div className="space-y-1.5 p-2">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-semibold text-text-primary">Daily Forecast</p>
            <span className="text-[8px] text-accent-amber">7.5/10</span>
          </div>
          <div className="h-1 rounded-full bg-white/5">
            <div className="h-full w-3/4 rounded-full bg-accent-amber" />
          </div>
          <p className="text-[7px] text-text-muted leading-relaxed">
            Strategic thinking day. Mercury sharpens communication...
          </p>
        </div>
      );

    case "compatibility-meter":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-1">
          <div className="text-lg font-bold text-accent-purple">78%</div>
          <div className="h-1.5 w-20 rounded-full bg-white/5">
            <div className="h-full w-[78%] rounded-full bg-accent-purple" />
          </div>
          <p className="text-[8px] text-text-muted">Compatibility Score</p>
        </div>
      );

    case "mbti-badge":
      return (
        <div className="flex items-center justify-center h-full gap-2">
          <div className="rounded-lg bg-accent-purple/15 border border-accent-purple/30 px-3 py-1.5">
            <span className="text-sm font-bold text-accent-purple">INTJ</span>
          </div>
          <div className="text-[8px] text-text-muted">87% confidence</div>
        </div>
      );

    case "weekly-forecast":
      return (
        <div className="space-y-1.5 p-2">
          <p className="text-[9px] font-semibold text-text-primary">This Week</p>
          <div className="flex gap-0.5">
            {[6, 8, 7, 9, 5, 7, 8].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full rounded-sm bg-accent-blue/40"
                  style={{ height: `${v * 3}px` }}
                />
                <span className="text-[6px] text-text-muted">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case "biorhythm-graph":
      return (
        <div className="space-y-1 p-2">
          <p className="text-[9px] font-semibold text-text-primary">Biorhythm</p>
          {[
            { label: "Physical", value: 72, color: "bg-accent-emerald" },
            { label: "Emotional", value: 34, color: "bg-accent-blue" },
            { label: "Intellectual", value: 91, color: "bg-accent-purple" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-1">
              <span className="w-12 text-[7px] text-text-muted">{b.label}</span>
              <div className="flex-1 h-1 rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${b.color}`}
                  style={{ width: `${b.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center h-full">
          <span className="text-text-muted text-xs">Preview</span>
        </div>
      );
  }
}

// ---- Component --------------------------------------------------------------

export default function WidgetGalleryPage() {
  const [category, setCategory] = useState<string>("All");
  const [showCodeFor, setShowCodeFor] = useState<string | null>(null);
  const [horoscopeSign, setHoroscopeSign] = useState<string>("aries");
  const [horoscope, setHoroscope] = useState<Record<string, unknown> | null>(null);
  const [horoscopeLoading, setHoroscopeLoading] = useState(false);
  const [horoscopeError, setHoroscopeError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setHoroscopeLoading(true);
    setHoroscopeError(null);
    fetch(`${API_URL}/api/v1/widgets/daily-horoscope/${horoscopeSign}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data: Record<string, unknown>) => {
        if (!cancelled) setHoroscope(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setHoroscopeError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => {
        if (!cancelled) setHoroscopeLoading(false);
      });
    return () => { cancelled = true; };
  }, [horoscopeSign]);

  const filtered =
    category === "All"
      ? WIDGETS
      : WIDGETS.filter((w) => w.category === category);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Widget Gallery</h1>
        <p className="text-sm text-text-muted">
          Embeddable components to bring ENVI-OUS BRAIN into any application
        </p>
      </div>

      {/* Live Horoscope Preview */}
      <Card className="mb-6" glow="purple">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Live Daily Horoscope Preview</h2>
          <Badge variant="healthy">Live</Badge>
        </div>
        <div className="mb-4 flex flex-wrap gap-1">
          {ZODIAC_SIGNS.map((sign) => (
            <button
              key={sign}
              onClick={() => setHoroscopeSign(sign)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                horoscopeSign === sign
                  ? "border-accent-purple bg-accent-purple/10 text-accent-purple"
                  : "border-border bg-card text-text-secondary hover:border-border-hover"
              }`}
            >
              {sign}
            </button>
          ))}
        </div>
        {horoscopeLoading ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : horoscopeError ? (
          <p className="text-sm text-accent-rose py-4 text-center">
            Could not load horoscope: {horoscopeError}
          </p>
        ) : horoscope ? (
          <pre className="overflow-x-auto rounded-lg bg-navy p-3 text-xs text-accent-emerald font-mono max-h-64 overflow-y-auto">
            {JSON.stringify(horoscope, null, 2)}
          </pre>
        ) : null}
      </Card>

      {/* Category Filter */}
      <div className="mb-6 flex gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              category === cat
                ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                : "border-border bg-card text-text-secondary hover:border-border-hover"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((widget) => (
          <div key={widget.id}>
            <Card className="h-full flex flex-col">
              {/* Preview area */}
              <div className="mb-3 h-36 overflow-hidden rounded-lg border border-border bg-navy">
                <WidgetPreview type={widget.preview} />
              </div>

              {/* Info */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-text-primary">
                  {widget.name}
                </h3>
                <Badge variant="info" className="shrink-0 text-[10px]">
                  {widget.category}
                </Badge>
              </div>
              <p className="text-xs text-text-muted leading-relaxed mb-3 flex-1">
                {widget.description}
              </p>

              <div className="flex items-center gap-1 mb-3">
                {widget.sizes.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-text-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1 text-xs"
                  onClick={() =>
                    setShowCodeFor(showCodeFor === widget.id ? null : widget.id)
                  }
                >
                  {showCodeFor === widget.id ? "Hide Code" : "Get Embed Code"}
                </Button>
                <Link href={`/dashboard/widgets/builder?widget=${widget.id}`}>
                  <Button variant="ghost" className="text-xs">
                    Customize
                  </Button>
                </Link>
              </div>

              {/* Embed Code */}
              {showCodeFor === widget.id && (
                <div className="mt-3">
                  <pre className="overflow-x-auto rounded-lg bg-navy p-2 text-[10px] text-accent-emerald font-mono">
                    {widget.embedCode}
                  </pre>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(widget.embedCode)
                    }
                    className="mt-1 text-[10px] text-accent-blue hover:underline"
                  >
                    Copy to clipboard
                  </button>
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
