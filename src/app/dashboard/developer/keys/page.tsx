"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---- Types ------------------------------------------------------------------

interface ApiKey {
  id: string;
  name: string;
  key: string;
  tier: "free" | "standard" | "premium";
  created: string;
  status: "active" | "revoked";
  lastUsed: string;
  environment: "live" | "test";
}

// ---- Mock Data --------------------------------------------------------------

const INITIAL_KEYS: ApiKey[] = [
  {
    id: "k1",
    name: "Production App",
    key: "eb_live_sk4f8a3b1c9d7e2f06h5i",
    tier: "premium",
    created: "2026-03-01",
    status: "active",
    lastUsed: "2026-04-16",
    environment: "live",
  },
  {
    id: "k2",
    name: "Staging Server",
    key: "eb_test_mj7k2l9n4p1q8r3s6t0u",
    tier: "standard",
    created: "2026-02-14",
    status: "active",
    lastUsed: "2026-04-15",
    environment: "test",
  },
  {
    id: "k3",
    name: "Mobile Client",
    key: "eb_live_vw5x8y2z1a4b7c0d3e6f",
    tier: "standard",
    created: "2026-01-20",
    status: "active",
    lastUsed: "2026-04-14",
    environment: "live",
  },
  {
    id: "k4",
    name: "Legacy Integration",
    key: "eb_live_gh9i2j5k8l1m4n7o0p3q",
    tier: "free",
    created: "2025-11-05",
    status: "revoked",
    lastUsed: "2026-01-10",
    environment: "live",
  },
  {
    id: "k5",
    name: "Dev Sandbox",
    key: "eb_test_rs6t9u2v5w8x1y4z7a0b",
    tier: "free",
    created: "2026-04-10",
    status: "active",
    lastUsed: "2026-04-16",
    environment: "test",
  },
];

const TIER_CONFIG: Record<string, { label: string; variant: "info" | "healthy" | "degraded" }> = {
  free: { label: "Free", variant: "info" },
  standard: { label: "Standard", variant: "healthy" },
  premium: { label: "Premium", variant: "degraded" },
};

// ---- Helpers ----------------------------------------------------------------

function maskKey(key: string): string {
  const prefix = key.slice(0, 12);
  return `${prefix}${"*".repeat(12)}`;
}

function generateKey(env: "live" | "test"): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 20; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `eb_${env}_${suffix}`;
}

// ---- Component --------------------------------------------------------------

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyTier, setNewKeyTier] = useState<"free" | "standard" | "premium">("free");
  const [newKeyEnv, setNewKeyEnv] = useState<"live" | "test">("test");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  function handleCreate() {
    if (!newKeyName.trim()) return;
    const key = generateKey(newKeyEnv);
    const newEntry: ApiKey = {
      id: `k${Date.now()}`,
      name: newKeyName.trim(),
      key,
      tier: newKeyTier,
      created: new Date().toISOString().split("T")[0],
      status: "active",
      lastUsed: "Never",
      environment: newKeyEnv,
    };
    setKeys((prev) => [newEntry, ...prev]);
    setCreatedKey(key);
    setNewKeyName("");
    setNewKeyTier("free");
    setNewKeyEnv("test");
  }

  function handleRevoke(id: string) {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k))
    );
  }

  function handleCopy(id: string, key: string) {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const activeCount = keys.filter((k) => k.status === "active").length;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">API Keys</h1>
            <Badge variant="info">Coming Soon</Badge>
          </div>
          <p className="text-sm text-text-muted">
            Manage your API keys for accessing ENVI-OUS BRAIN services
          </p>
        </div>
        <Button onClick={() => { setShowModal(true); setCreatedKey(null); }}>
          + Create API Key
        </Button>
      </div>

      {/* Coming Soon Notice */}
      <Card className="mb-6">
        <p className="text-sm text-text-secondary text-center py-2">
          API key management is under active development. The data shown below is sample data for preview purposes.
        </p>
      </Card>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-text-primary">{keys.length}</p>
            <p className="text-xs text-text-muted mt-1">Total Keys</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent-emerald">{activeCount}</p>
            <p className="text-xs text-text-muted mt-1">Active</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent-rose">{keys.length - activeCount}</p>
            <p className="text-xs text-text-muted mt-1">Revoked</p>
          </div>
        </Card>
      </div>

      {/* Keys Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Name
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Key
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Tier
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Environment
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Created
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Status
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr
                  key={k.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-3.5 pr-4">
                    <span className="font-medium text-text-primary">{k.name}</span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <code className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-text-secondary">
                      {revealedId === k.id ? k.key : maskKey(k.key)}
                    </code>
                  </td>
                  <td className="py-3.5 pr-4">
                    <Badge variant={TIER_CONFIG[k.tier].variant}>
                      {TIER_CONFIG[k.tier].label}
                    </Badge>
                  </td>
                  <td className="py-3.5 pr-4">
                    <Badge variant={k.environment === "live" ? "healthy" : "info"}>
                      {k.environment}
                    </Badge>
                  </td>
                  <td className="py-3.5 pr-4 text-text-secondary">{k.created}</td>
                  <td className="py-3.5 pr-4">
                    <Badge variant={k.status === "active" ? "healthy" : "error"}>
                      {k.status}
                    </Badge>
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        className="px-2 py-1 text-xs"
                        onClick={() =>
                          setRevealedId(revealedId === k.id ? null : k.id)
                        }
                      >
                        {revealedId === k.id ? "Hide" : "Reveal"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="px-2 py-1 text-xs"
                        onClick={() => handleCopy(k.id, k.key)}
                      >
                        {copiedId === k.id ? "Copied!" : "Copy"}
                      </Button>
                      {k.status === "active" && (
                        <Button
                          variant="ghost"
                          className="px-2 py-1 text-xs text-accent-rose hover:text-accent-rose"
                          onClick={() => handleRevoke(k.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Key Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl">
            {createdKey ? (
              <>
                <h2 className="mb-4 text-lg font-bold text-text-primary">
                  Key Created Successfully
                </h2>
                <p className="mb-3 text-sm text-text-secondary">
                  Copy your key now. You will not be able to see it again.
                </p>
                <div className="mb-4 rounded-lg bg-white/5 p-3">
                  <code className="break-all font-mono text-sm text-accent-emerald">
                    {createdKey}
                  </code>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(createdKey);
                    }}
                  >
                    Copy Key
                  </Button>
                  <Button onClick={() => { setShowModal(false); setCreatedKey(null); }}>
                    Done
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="mb-4 text-lg font-bold text-text-primary">
                  Create New API Key
                </h2>
                <div className="space-y-4">
                  <Input
                    label="Key Name"
                    placeholder="e.g., Production App"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-text-secondary">
                      Tier
                    </label>
                    <div className="flex gap-2">
                      {(["free", "standard", "premium"] as const).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setNewKeyTier(tier)}
                          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                            newKeyTier === tier
                              ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                              : "border-border bg-card text-text-secondary hover:border-border-hover"
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-text-secondary">
                      Environment
                    </label>
                    <div className="flex gap-2">
                      {(["test", "live"] as const).map((env) => (
                        <button
                          key={env}
                          onClick={() => setNewKeyEnv(env)}
                          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                            newKeyEnv === env
                              ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                              : "border-border bg-card text-text-secondary hover:border-border-hover"
                          }`}
                        >
                          {env === "live" ? "Live (eb_live_*)" : "Test (eb_test_*)"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={!newKeyName.trim()}>
                    Create Key
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
