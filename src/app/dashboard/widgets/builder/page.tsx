"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---- Types ------------------------------------------------------------------

type WidgetType = "chart-wheel" | "reading-card" | "transit-alert" | "daily-horoscope";
type Theme = "dark" | "light" | "auto";
type EmbedFormat = "iframe" | "javascript" | "react" | "vue";

interface WidgetConfig {
  type: WidgetType;
  theme: Theme;
  width: number;
  height: number;
  chartId: string;
  borderRadius: number;
  showBorder: boolean;
  accentColor: string;
}

// ---- Constants --------------------------------------------------------------

const WIDGET_TYPES: { id: WidgetType; label: string; defaultW: number; defaultH: number }[] = [
  { id: "chart-wheel", label: "Chart Wheel", defaultW: 400, defaultH: 400 },
  { id: "reading-card", label: "Reading Card", defaultW: 400, defaultH: 250 },
  { id: "transit-alert", label: "Transit Alert", defaultW: 400, defaultH: 200 },
  { id: "daily-horoscope", label: "Daily Horoscope", defaultW: 400, defaultH: 300 },
];

const THEMES: Theme[] = ["dark", "light", "auto"];
const EMBED_FORMATS: { id: EmbedFormat; label: string }[] = [
  { id: "iframe", label: "iframe" },
  { id: "javascript", label: "JavaScript" },
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
];

const ACCENT_COLORS = [
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Emerald", value: "#10b981" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Rose", value: "#f43f5e" },
];

// ---- Code Generators --------------------------------------------------------

function generateCode(config: WidgetConfig, format: EmbedFormat): string {
  const baseUrl = "https://widgets.envious-brain.com";
  const params = new URLSearchParams({
    key: "YOUR_API_KEY",
    chart_id: config.chartId || "CHART_ID",
    theme: config.theme,
    accent: config.accentColor,
  });
  const src = `${baseUrl}/${config.type}?${params.toString()}`;
  const border = config.showBorder ? `border: 1px solid #1e293b;` : "";
  const style = `border-radius: ${config.borderRadius}px; ${border}`.trim();

  switch (format) {
    case "iframe":
      return `<iframe
  src="${src}"
  width="${config.width}"
  height="${config.height}"
  frameBorder="0"
  style="${style}"
></iframe>`;

    case "javascript":
      return `<div id="eb-widget-${config.type}"></div>
<script src="${baseUrl}/sdk.js"></script>
<script>
  EnviousBrain.render({
    container: '#eb-widget-${config.type}',
    type: '${config.type}',
    apiKey: 'YOUR_API_KEY',
    chartId: '${config.chartId || "CHART_ID"}',
    theme: '${config.theme}',
    width: ${config.width},
    height: ${config.height},
    accentColor: '${config.accentColor}',
    borderRadius: ${config.borderRadius},
    showBorder: ${config.showBorder},
  });
</script>`;

    case "react":
      return `import { EnviousWidget } from '@envious-brain/react';

export function MyWidget() {
  return (
    <EnviousWidget
      type="${config.type}"
      apiKey="YOUR_API_KEY"
      chartId="${config.chartId || "CHART_ID"}"
      theme="${config.theme}"
      width={${config.width}}
      height={${config.height}}
      accentColor="${config.accentColor}"
      borderRadius={${config.borderRadius}}
      showBorder={${config.showBorder}}
    />
  );
}`;

    case "vue":
      return `<template>
  <EnviousWidget
    type="${config.type}"
    api-key="YOUR_API_KEY"
    chart-id="${config.chartId || "CHART_ID"}"
    theme="${config.theme}"
    :width="${config.width}"
    :height="${config.height}"
    accent-color="${config.accentColor}"
    :border-radius="${config.borderRadius}"
    :show-border="${config.showBorder}"
  />
</template>

<script setup>
import { EnviousWidget } from '@envious-brain/vue';
</script>`;
  }
}

// ---- Preview Component ------------------------------------------------------

function LivePreview({ config }: { config: WidgetConfig }) {
  const bgColor = config.theme === "light" ? "bg-white" : "bg-navy";
  const textColor = config.theme === "light" ? "text-gray-900" : "text-text-primary";
  const mutedColor = config.theme === "light" ? "text-gray-500" : "text-text-muted";

  return (
    <div
      className={`${bgColor} overflow-hidden transition-all`}
      style={{
        width: Math.min(config.width, 500),
        height: Math.min(config.height, 400),
        borderRadius: config.borderRadius,
        border: config.showBorder ? "1px solid #1e293b" : "none",
        margin: "0 auto",
      }}
    >
      {config.type === "chart-wheel" && (
        <div className="flex items-center justify-center h-full">
          <div className="relative" style={{ width: "70%", height: "70%" }}>
            <div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: `${config.accentColor}40` }}
            />
            <div
              className="absolute inset-[12%] rounded-full border"
              style={{ borderColor: `${config.accentColor}20` }}
            />
            <div className="absolute inset-[24%] rounded-full border border-border" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom"
                style={{
                  transform: `rotate(${deg}deg)`,
                  background: `${config.accentColor}15`,
                }}
              />
            ))}
            <div className="absolute" style={{ top: "25%", left: "55%" }}>
              <span className="text-sm" style={{ color: config.accentColor }}>
                {"\u2609"}
              </span>
            </div>
            <div className="absolute" style={{ top: "60%", left: "30%" }}>
              <span className={`text-sm ${mutedColor}`}>{"\u263D"}</span>
            </div>
          </div>
        </div>
      )}

      {config.type === "reading-card" && (
        <div className="p-4 h-full flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${config.accentColor}20` }}
            >
              <span style={{ color: config.accentColor }}>{"\u2606"}</span>
            </div>
            <div>
              <p className={`text-sm font-semibold ${textColor}`}>Natal Reading</p>
              <p className={`text-xs ${mutedColor}`}>Gemini Sun / Scorpio Moon / Virgo Rising</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {["Sun in Gemini 10H", "Moon in Scorpio 3H", "Mercury conj Sun"].map((p) => (
              <div key={p} className="flex items-center gap-2">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: config.accentColor }}
                />
                <span className={`text-xs ${mutedColor}`}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {config.type === "transit-alert" && (
        <div className="p-4 h-full flex flex-col justify-center">
          <p className={`text-sm font-semibold ${textColor} mb-2`}>Live Transits</p>
          <div className="space-y-1.5">
            {[
              { icon: "\u263F", text: "Mercury conjunct Sun", badge: "exact" },
              { icon: "\u2640", text: "Venus trine Moon", badge: "applying" },
              { icon: "\u2642", text: "Mars square Saturn", badge: "separating" },
            ].map((t) => (
              <div
                key={t.text}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                style={{ backgroundColor: `${config.accentColor}08` }}
              >
                <span className="text-sm">{t.icon}</span>
                <span className={`text-xs flex-1 ${mutedColor}`}>{t.text}</span>
                <span
                  className="text-[10px] rounded px-1.5 py-0.5"
                  style={{
                    backgroundColor: `${config.accentColor}15`,
                    color: config.accentColor,
                  }}
                >
                  {t.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {config.type === "daily-horoscope" && (
        <div className="p-4 h-full flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-semibold ${textColor}`}>Today&apos;s Forecast</p>
            <span className="text-sm font-bold" style={{ color: config.accentColor }}>
              7.5/10
            </span>
          </div>
          <div className="h-2 rounded-full mb-3" style={{ backgroundColor: `${config.accentColor}15` }}>
            <div
              className="h-full rounded-full"
              style={{ width: "75%", backgroundColor: config.accentColor }}
            />
          </div>
          <p className={`text-xs ${mutedColor} leading-relaxed mb-3`}>
            A day for strategic thinking. Mercury&apos;s conjunction with your natal Sun sharpens
            communication. Be mindful of Mars-Saturn tension in the afternoon.
          </p>
          <div className="flex gap-1.5">
            {["Communication", "Strategy"].map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2 py-0.5 text-[10px]"
                style={{
                  backgroundColor: `${config.accentColor}15`,
                  color: config.accentColor,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Component --------------------------------------------------------------

export default function WidgetBuilderPage() {
  const [config, setConfig] = useState<WidgetConfig>({
    type: "chart-wheel",
    theme: "dark",
    width: 400,
    height: 400,
    chartId: "",
    borderRadius: 12,
    showBorder: true,
    accentColor: "#3b82f6",
  });
  const [embedFormat, setEmbedFormat] = useState<EmbedFormat>("iframe");
  const [copied, setCopied] = useState(false);

  function updateType(type: WidgetType) {
    const wt = WIDGET_TYPES.find((w) => w.id === type)!;
    setConfig((prev) => ({
      ...prev,
      type,
      width: wt.defaultW,
      height: wt.defaultH,
    }));
  }

  function handleCopy() {
    navigator.clipboard.writeText(generateCode(config, embedFormat));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Widget Builder</h1>
        <p className="text-sm text-text-muted">
          Configure and generate embed code for ENVI-OUS BRAIN widgets
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Configuration Panel */}
        <div className="space-y-4">
          {/* Widget Type */}
          <Card title="Widget Type">
            <div className="grid grid-cols-2 gap-2">
              {WIDGET_TYPES.map((wt) => (
                <button
                  key={wt.id}
                  onClick={() => updateType(wt.id)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium text-left transition-colors ${
                    config.type === wt.id
                      ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                      : "border-border bg-card text-text-secondary hover:border-border-hover"
                  }`}
                >
                  {wt.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Theme */}
          <Card title="Theme">
            <div className="flex gap-2">
              {THEMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setConfig((prev) => ({ ...prev, theme: t }))}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    config.theme === t
                      ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                      : "border-border bg-card text-text-secondary hover:border-border-hover"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Card>

          {/* Size */}
          <Card title="Size">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Width (px)"
                type="number"
                value={config.width}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, width: parseInt(e.target.value) || 0 }))
                }
              />
              <Input
                label="Height (px)"
                type="number"
                value={config.height}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, height: parseInt(e.target.value) || 0 }))
                }
              />
            </div>
          </Card>

          {/* Data Source */}
          <Card title="Data Source">
            <Input
              label="Chart ID"
              placeholder="ch_9x8f7e6d"
              value={config.chartId}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, chartId: e.target.value }))
              }
            />
            <p className="mt-1 text-xs text-text-muted">
              Leave blank to use a placeholder in the embed code
            </p>
          </Card>

          {/* Appearance */}
          <Card title="Appearance">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, accentColor: c.value }))
                      }
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        config.accentColor === c.value
                          ? "border-white scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <Input
                label="Border Radius (px)"
                type="number"
                value={config.borderRadius}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    borderRadius: parseInt(e.target.value) || 0,
                  }))
                }
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setConfig((prev) => ({ ...prev, showBorder: !prev.showBorder }))
                  }
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    config.showBorder ? "bg-accent-blue" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      config.showBorder ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-text-secondary">Show border</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Preview + Code Panel */}
        <div className="space-y-4">
          {/* Live Preview */}
          <Card title="Live Preview" glow="blue">
            <div className="flex items-center justify-center rounded-lg bg-surface p-6 min-h-[320px]">
              <LivePreview config={config} />
            </div>
          </Card>

          {/* Embed Code */}
          <Card title="Embed Code">
            {/* Format Selector */}
            <div className="mb-3 flex gap-1">
              {EMBED_FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setEmbedFormat(f.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    embedFormat === f.id
                      ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                      : "border-border bg-card text-text-muted hover:border-border-hover"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <pre className="overflow-x-auto rounded-lg bg-navy p-3 font-mono text-xs text-accent-emerald max-h-72 overflow-y-auto">
              {generateCode(config, embedFormat)}
            </pre>

            <div className="mt-3 flex gap-2">
              <Button onClick={handleCopy} className="flex-1">
                {copied ? "Copied!" : "Copy Code"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
