"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Plan = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
type TenantStatus = "active" | "suspended" | "trial";

interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: Plan;
  status: TenantStatus;
  users: number;
  requestsToday: number;
  logoUrl: string;
  primaryColor: string;
  darkMode: boolean;
  monthlySpend: number;
  features: { oracle: boolean; batchApi: boolean; webhooks: boolean };
}

// ---------------------------------------------------------------------------
// Plan config
// ---------------------------------------------------------------------------

const PLAN_LIMITS: Record<Plan, string> = {
  FREE: "2 engines",
  STARTER: "5 engines",
  PROFESSIONAL: "20 engines",
  ENTERPRISE: "Unlimited",
};

const PLAN_BADGE_VARIANT: Record<Plan, "neutral" | "info" | "healthy" | "degraded"> = {
  FREE: "neutral",
  STARTER: "info",
  PROFESSIONAL: "healthy",
  ENTERPRISE: "degraded",
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const INITIAL_TENANTS: Tenant[] = [
  {
    id: "t-001",
    name: "AstroFlow Inc",
    domain: "app.astroflow.io",
    plan: "ENTERPRISE",
    status: "active",
    users: 1240,
    requestsToday: 342_800,
    logoUrl: "https://astroflow.io/logo.svg",
    primaryColor: "#6366f1",
    darkMode: true,
    monthlySpend: 4_999,
    features: { oracle: true, batchApi: true, webhooks: true },
  },
  {
    id: "t-002",
    name: "Celestial App",
    domain: "celestial.app",
    plan: "PROFESSIONAL",
    status: "active",
    users: 385,
    requestsToday: 89_120,
    logoUrl: "https://celestial.app/logo.png",
    primaryColor: "#3b82f6",
    darkMode: true,
    monthlySpend: 499,
    features: { oracle: true, batchApi: false, webhooks: true },
  },
  {
    id: "t-003",
    name: "ZodiacLens",
    domain: "zodiaclens.com",
    plan: "STARTER",
    status: "active",
    users: 72,
    requestsToday: 12_450,
    logoUrl: "https://zodiaclens.com/icon.svg",
    primaryColor: "#10b981",
    darkMode: false,
    monthlySpend: 49,
    features: { oracle: false, batchApi: false, webhooks: true },
  },
  {
    id: "t-004",
    name: "StarMap Beta",
    domain: "beta.starmap.dev",
    plan: "FREE",
    status: "trial",
    users: 8,
    requestsToday: 340,
    logoUrl: "",
    primaryColor: "#f59e0b",
    darkMode: true,
    monthlySpend: 0,
    features: { oracle: false, batchApi: false, webhooks: false },
  },
  {
    id: "t-005",
    name: "Karma Technologies",
    domain: "karma-tech.co",
    plan: "PROFESSIONAL",
    status: "suspended",
    users: 190,
    requestsToday: 0,
    logoUrl: "https://karma-tech.co/k-logo.svg",
    primaryColor: "#ef4444",
    darkMode: true,
    monthlySpend: 499,
    features: { oracle: true, batchApi: true, webhooks: false },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadge(status: TenantStatus) {
  const map: Record<TenantStatus, "healthy" | "degraded" | "error"> = {
    active: "healthy",
    trial: "degraded",
    suspended: "error",
  };
  return <Badge variant={map[status]}>{status}</Badge>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WhiteLabelPage() {
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDomain, setFormDomain] = useState("");
  const [formPlan, setFormPlan] = useState<Plan>("FREE");

  // Theme customizer state (for selected tenant)
  const [previewLogo, setPreviewLogo] = useState("");
  const [previewColor, setPreviewColor] = useState("#3b82f6");
  const [previewDark, setPreviewDark] = useState(true);

  const handleCreate = () => {
    if (!formName.trim() || !formDomain.trim()) return;
    const newTenant: Tenant = {
      id: `t-${Date.now()}`,
      name: formName.trim(),
      domain: formDomain.trim(),
      plan: formPlan,
      status: "trial",
      users: 0,
      requestsToday: 0,
      logoUrl: "",
      primaryColor: "#3b82f6",
      darkMode: true,
      monthlySpend: 0,
      features: { oracle: false, batchApi: false, webhooks: false },
    };
    setTenants((prev) => [newTenant, ...prev]);
    setFormName("");
    setFormDomain("");
    setFormPlan("FREE");
    setShowCreate(false);
  };

  const handleSelectTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setPreviewLogo(tenant.logoUrl);
    setPreviewColor(tenant.primaryColor);
    setPreviewDark(tenant.darkMode);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">White-Label Management</h1>
            <Badge variant="info">Coming Soon</Badge>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Manage tenants, plans, branding, and feature access
          </p>
        </div>
        <Button onClick={() => setShowCreate((prev) => !prev)}>
          {showCreate ? "Cancel" : "+ Create Tenant"}
        </Button>
      </div>

      {/* Create Tenant Form */}
      {showCreate && (
        <Card className="mb-6" glow="blue">
          <h2 className="mb-4 text-base font-semibold text-text-primary">New Tenant</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Tenant Name"
              placeholder="e.g. AstroFlow Inc"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <Input
              label="Domain"
              placeholder="e.g. app.astroflow.io"
              value={formDomain}
              onChange={(e) => setFormDomain(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Plan</label>
              <select
                value={formPlan}
                onChange={(e) => setFormPlan(e.target.value as Plan)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
              >
                {(Object.keys(PLAN_LIMITS) as Plan[]).map((plan) => (
                  <option key={plan} value={plan}>
                    {plan} ({PLAN_LIMITS[plan]})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCreate}>Create Tenant</Button>
          </div>
        </Card>
      )}

      {/* Tenant Table */}
      <Card className="mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Name
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Domain
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Plan
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Status
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">
                Users
              </th>
              <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 pr-4 font-medium text-text-primary">{tenant.name}</td>
                <td className="py-3 pr-4 font-mono text-xs text-text-secondary">
                  {tenant.domain}
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={PLAN_BADGE_VARIANT[tenant.plan]}>
                    {tenant.plan}
                  </Badge>
                </td>
                <td className="py-3 pr-4">{statusBadge(tenant.status)}</td>
                <td className="py-3 pr-4 text-right font-mono text-text-secondary">
                  {tenant.users.toLocaleString()}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="text-xs px-2 py-1"
                      onClick={() => handleSelectTenant(tenant)}
                    >
                      Details
                    </Button>
                    <Button variant="ghost" className="text-xs px-2 py-1 text-accent-rose">
                      Suspend
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Tenant Detail */}
      {selectedTenant && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Usage Stats */}
          <Card title="Usage Stats">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Requests Today</span>
                <span className="text-sm font-mono font-medium text-text-primary">
                  {selectedTenant.requestsToday.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Active Users</span>
                <span className="text-sm font-mono font-medium text-text-primary">
                  {selectedTenant.users.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Engines</span>
                <span className="text-sm font-medium text-text-primary">
                  {PLAN_LIMITS[selectedTenant.plan]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Plan</span>
                <Badge variant={PLAN_BADGE_VARIANT[selectedTenant.plan]}>
                  {selectedTenant.plan}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Billing Info */}
          <Card title="Billing Info">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Monthly Spend</span>
                <span className="text-sm font-mono font-semibold text-accent-emerald">
                  ${selectedTenant.monthlySpend.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Billing Cycle</span>
                <span className="text-sm text-text-secondary">Monthly</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Next Invoice</span>
                <span className="text-sm text-text-secondary">May 1, 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Payment Method</span>
                <span className="text-sm text-text-secondary">
                  {selectedTenant.monthlySpend > 0 ? "Visa **** 4242" : "None"}
                </span>
              </div>
            </div>
          </Card>

          {/* Feature Toggles */}
          <Card title="Feature Toggles">
            <div className="space-y-3">
              {Object.entries(selectedTenant.features).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <button
                    onClick={() => {
                      setTenants((prev) =>
                        prev.map((t) =>
                          t.id === selectedTenant.id
                            ? {
                                ...t,
                                features: {
                                  ...t.features,
                                  [key]: !enabled,
                                },
                              }
                            : t,
                        ),
                      );
                      setSelectedTenant((prev) =>
                        prev
                          ? {
                              ...prev,
                              features: {
                                ...prev.features,
                                [key]: !enabled,
                              },
                            }
                          : null,
                      );
                    }}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      enabled ? "bg-accent-blue" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Theme Customizer Preview */}
          <Card title="Theme Customizer" className="sm:col-span-2 lg:col-span-3">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Controls */}
              <div className="space-y-4">
                <Input
                  label="Logo URL"
                  placeholder="https://example.com/logo.svg"
                  value={previewLogo}
                  onChange={(e) => setPreviewLogo(e.target.value)}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={previewColor}
                      onChange={(e) => setPreviewColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-lg border border-border bg-transparent"
                    />
                    <span className="text-sm font-mono text-text-muted">{previewColor}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">Dark Mode</span>
                  <button
                    onClick={() => setPreviewDark((prev) => !prev)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      previewDark ? "bg-accent-blue" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        previewDark ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div
                className="rounded-xl border border-border p-6 transition-colors"
                style={{
                  backgroundColor: previewDark ? "#0a0e1a" : "#f8fafc",
                }}
              >
                <p className="text-xs uppercase tracking-wider text-text-muted mb-2">
                  Preview
                </p>
                <div className="flex items-center gap-3 mb-4">
                  {previewLogo ? (
                    <div
                      className="h-8 w-8 rounded-md bg-white/10 flex items-center justify-center text-xs overflow-hidden"
                    >
                      <span className="text-text-muted">Logo</span>
                    </div>
                  ) : (
                    <div
                      className="h-8 w-8 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: previewColor }}
                    >
                      <span className="text-white text-xs font-bold">
                        {selectedTenant.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span
                    className="font-semibold"
                    style={{ color: previewDark ? "#e2e8f0" : "#1e293b" }}
                  >
                    {selectedTenant.name}
                  </span>
                </div>
                <div
                  className="rounded-lg p-3 text-xs"
                  style={{
                    backgroundColor: previewDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                    color: previewDark ? "#94a3b8" : "#475569",
                  }}
                >
                  <div
                    className="mb-2 h-2 w-3/4 rounded"
                    style={{ backgroundColor: previewColor, opacity: 0.8 }}
                  />
                  <div
                    className="mb-2 h-2 w-1/2 rounded"
                    style={{
                      backgroundColor: previewDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                    }}
                  />
                  <div
                    className="h-2 w-2/3 rounded"
                    style={{
                      backgroundColor: previewDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                    }}
                  />
                </div>
                <button
                  className="mt-3 rounded-md px-3 py-1.5 text-xs font-medium text-white"
                  style={{ backgroundColor: previewColor }}
                >
                  Sample Button
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
