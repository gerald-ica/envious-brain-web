"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Types & Mock Data
// ---------------------------------------------------------------------------

interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface ConfigEntry {
  key: string;
  value: string;
}

interface PluginEntry {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  status: "loaded" | "error" | "disabled";
}

const INITIAL_FLAGS: FeatureFlag[] = [
  {
    key: "oracle_enabled",
    label: "Enable Oracle",
    description: "AI-powered astrological interpretations via LLM",
    enabled: true,
  },
  {
    key: "batch_api",
    label: "Enable Batch API",
    description: "Allow bulk chart calculations in a single request",
    enabled: true,
  },
  {
    key: "webhooks",
    label: "Enable Webhooks",
    description: "Real-time event notifications to tenant endpoints",
    enabled: true,
  },
  {
    key: "vedic_engine",
    label: "Enable Vedic Engine",
    description: "Sidereal calculations with Lahiri ayanamsa",
    enabled: true,
  },
  {
    key: "bazi_engine",
    label: "Enable BaZi Engine",
    description: "Chinese Four Pillars of Destiny calculations",
    enabled: true,
  },
  {
    key: "human_design",
    label: "Enable Human Design",
    description: "Bodygraph generation with gates and channels",
    enabled: false,
  },
  {
    key: "space_weather",
    label: "Enable Space Weather",
    description: "Solar flare and geomagnetic storm tracking",
    enabled: true,
  },
  {
    key: "rate_limiting_v2",
    label: "Rate Limiting v2",
    description: "Token bucket algorithm with per-tenant quotas",
    enabled: false,
  },
  {
    key: "experimental_harmonics",
    label: "Experimental Harmonics",
    description: "Higher harmonic chart calculations (beta)",
    enabled: false,
  },
];

const INITIAL_CONFIG: ConfigEntry[] = [
  { key: "MAX_REQUESTS_PER_MINUTE", value: "120" },
  { key: "CACHE_TTL_SECONDS", value: "3600" },
  { key: "LLM_MAX_TOKENS", value: "4096" },
  { key: "EPHEMERIS_PRECISION", value: "high" },
  { key: "SESSION_TIMEOUT_MINUTES", value: "30" },
  { key: "WEBHOOK_RETRY_COUNT", value: "3" },
  { key: "LOG_LEVEL", value: "info" },
];

const INITIAL_PLUGINS: PluginEntry[] = [
  {
    id: "eng-western",
    name: "Western Tropical Engine",
    version: "3.2.1",
    description: "Core tropical zodiac calculations with Swiss Ephemeris",
    enabled: true,
    status: "loaded",
  },
  {
    id: "eng-vedic",
    name: "Vedic Sidereal Engine",
    version: "2.8.0",
    description: "Jyotish calculations, Nakshatra, and Dasha periods",
    enabled: true,
    status: "loaded",
  },
  {
    id: "eng-bazi",
    name: "BaZi Four Pillars Engine",
    version: "1.5.3",
    description: "Chinese metaphysics with Five Elements analysis",
    enabled: true,
    status: "loaded",
  },
  {
    id: "eng-numerology",
    name: "Numerology Engine",
    version: "2.1.0",
    description: "Pythagorean and Chaldean number calculations",
    enabled: true,
    status: "loaded",
  },
  {
    id: "eng-human-design",
    name: "Human Design Engine",
    version: "0.9.2",
    description: "Bodygraph, type, strategy, authority calculations",
    enabled: false,
    status: "disabled",
  },
  {
    id: "eng-oracle",
    name: "Oracle LLM Bridge",
    version: "1.4.0",
    description: "Multi-provider LLM integration for AI interpretations",
    enabled: true,
    status: "loaded",
  },
  {
    id: "eng-iching",
    name: "I Ching Divination Engine",
    version: "1.2.1",
    description: "Hexagram casting with Yarrow Stalk and Coin methods",
    enabled: true,
    status: "loaded",
  },
  {
    id: "eng-tarot",
    name: "Tarot Engine",
    version: "1.0.4",
    description: "RWS and Thoth deck spreads with reversals",
    enabled: true,
    status: "error",
  },
];

const SYSTEM_INFO = {
  version: "0.1.0-beta.7",
  environment: "production" as const,
  uptime: "14d 7h 32m",
  nodeVersion: "v22.4.0",
  database: { status: "connected" as const, latency: "3ms", size: "2.4 GB" },
  cache: { status: "connected" as const, hitRate: "94.2%", memory: "512 MB" },
  lastDeploy: "2026-04-14T18:22:00Z",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ConfigPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [config, setConfig] = useState<ConfigEntry[]>(INITIAL_CONFIG);
  const [plugins, setPlugins] = useState<PluginEntry[]>(INITIAL_PLUGINS);

  // New config entry
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const toggleFlag = (key: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)),
    );
  };

  const togglePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              enabled: !p.enabled,
              status: !p.enabled ? "loaded" : "disabled",
            }
          : p,
      ),
    );
  };

  const updateConfigValue = (key: string, value: string) => {
    setConfig((prev) =>
      prev.map((c) => (c.key === key ? { ...c, value } : c)),
    );
  };

  const addConfigEntry = () => {
    if (!newKey.trim()) return;
    setConfig((prev) => [...prev, { key: newKey.trim(), value: newValue.trim() }]);
    setNewKey("");
    setNewValue("");
  };

  const removeConfigEntry = (key: string) => {
    setConfig((prev) => prev.filter((c) => c.key !== key));
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">Configuration</h1>
          <Badge variant="info">Coming Soon</Badge>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          Feature flags, dynamic config, plugins, and system information
        </p>
      </div>

      {/* Environment Banner */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-white/[0.02] px-4 py-3">
        <span className="text-sm text-text-muted">Environment:</span>
        <Badge variant={SYSTEM_INFO.environment === "production" ? "degraded" : "info"}>
          {SYSTEM_INFO.environment.toUpperCase()}
        </Badge>
        <span className="text-xs text-text-muted">
          Last deployed: {new Date(SYSTEM_INFO.lastDeploy).toLocaleString()}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Feature Flags */}
        <Card title="Feature Flags">
          <div className="space-y-4">
            {flags.map((flag) => (
              <div
                key={flag.key}
                className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-3"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-text-primary">{flag.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{flag.description}</p>
                </div>
                <button
                  onClick={() => toggleFlag(flag.key)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    flag.enabled ? "bg-accent-blue" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      flag.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Dynamic Config */}
        <Card title="Dynamic Configuration">
          <div className="space-y-2 mb-4">
            {config.map((entry) => (
              <div
                key={entry.key}
                className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-4 py-2.5"
              >
                <span className="text-xs font-mono text-text-muted flex-1 min-w-0 truncate">
                  {entry.key}
                </span>
                <input
                  value={entry.value}
                  onChange={(e) => updateConfigValue(entry.key, e.target.value)}
                  className="w-28 rounded border border-border bg-surface px-2 py-1 text-xs font-mono text-text-primary text-right focus:border-accent-blue focus:outline-none"
                />
                <button
                  onClick={() => removeConfigEntry(entry.key)}
                  className="text-text-muted hover:text-accent-rose transition-colors text-xs"
                >
                  {"\u2715"}
                </button>
              </div>
            ))}
          </div>

          {/* Add new entry */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-text-muted mb-2">Add new entry</p>
            <div className="flex items-end gap-2">
              <Input
                placeholder="KEY_NAME"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 font-mono text-xs"
              />
              <Input
                placeholder="value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-28 font-mono text-xs"
              />
              <Button onClick={addConfigEntry} className="text-xs px-3 py-2">
                Add
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Plugin Registry */}
      <Card title="Plugin Registry" className="mt-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="flex items-start gap-4 rounded-lg bg-white/[0.02] px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-text-primary">{plugin.name}</p>
                  <Badge
                    variant={
                      plugin.status === "loaded"
                        ? "healthy"
                        : plugin.status === "error"
                          ? "error"
                          : "neutral"
                    }
                  >
                    {plugin.status}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">{plugin.description}</p>
                <p className="text-xs font-mono text-text-muted mt-1">v{plugin.version}</p>
              </div>
              <button
                onClick={() => togglePlugin(plugin.id)}
                className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${
                  plugin.enabled ? "bg-accent-blue" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    plugin.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* System Info */}
      <Card title="System Info" className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Version</span>
              <span className="text-sm font-mono font-medium text-text-primary">
                {SYSTEM_INFO.version}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Uptime</span>
              <span className="text-sm font-mono text-text-primary">{SYSTEM_INFO.uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Node.js</span>
              <span className="text-sm font-mono text-text-muted">{SYSTEM_INFO.nodeVersion}</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Database
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Status</span>
              <Badge variant="healthy">{SYSTEM_INFO.database.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Latency</span>
              <span className="text-sm font-mono text-text-primary">
                {SYSTEM_INFO.database.latency}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Size</span>
              <span className="text-sm font-mono text-text-muted">
                {SYSTEM_INFO.database.size}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Cache (Redis)
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Status</span>
              <Badge variant="healthy">{SYSTEM_INFO.cache.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Hit Rate</span>
              <span className="text-sm font-mono text-accent-emerald">
                {SYSTEM_INFO.cache.hitRate}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Memory</span>
              <span className="text-sm font-mono text-text-muted">
                {SYSTEM_INFO.cache.memory}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
