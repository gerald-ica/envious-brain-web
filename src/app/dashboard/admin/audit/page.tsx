"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionType =
  | "api_call"
  | "key_created"
  | "key_revoked"
  | "config_changed"
  | "login"
  | "logout"
  | "tenant_created"
  | "profile_updated"
  | "export_data";

type AuditStatus = "success" | "failure" | "warning";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: ActionType;
  resource: string;
  ip: string;
  status: AuditStatus;
  details: string;
  userAgent: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_ENTRIES: AuditEntry[] = [
  {
    id: "aud-001",
    timestamp: "2026-04-16T14:32:08Z",
    user: "gerald@weareinformal.com",
    action: "config_changed",
    resource: "feature_flags.oracle_enabled",
    ip: "203.0.113.42",
    status: "success",
    details: "Changed feature flag 'oracle_enabled' from false to true for tenant t-002.",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124",
  },
  {
    id: "aud-002",
    timestamp: "2026-04-16T14:28:15Z",
    user: "admin@astroflow.io",
    action: "key_created",
    resource: "api_key.sk-af-****-7x2q",
    ip: "198.51.100.14",
    status: "success",
    details: "Created new API key with scopes: chart.read, oracle.invoke, transit.read.",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/125",
  },
  {
    id: "aud-003",
    timestamp: "2026-04-16T13:55:42Z",
    user: "ops@celestial.app",
    action: "api_call",
    resource: "/api/v1/chart/western",
    ip: "192.0.2.88",
    status: "failure",
    details: "Rate limit exceeded. 429 Too Many Requests. Retry-After: 60s.",
    userAgent: "CelestialBot/2.1",
  },
  {
    id: "aud-004",
    timestamp: "2026-04-16T13:41:09Z",
    user: "dev@zodiaclens.com",
    action: "key_revoked",
    resource: "api_key.sk-zl-****-9m3r",
    ip: "172.16.0.55",
    status: "success",
    details: "Revoked API key due to suspected leak. All active sessions invalidated.",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/124",
  },
  {
    id: "aud-005",
    timestamp: "2026-04-16T13:22:33Z",
    user: "gerald@weareinformal.com",
    action: "login",
    resource: "auth.session",
    ip: "203.0.113.42",
    status: "success",
    details: "Successful login via SSO (Google). MFA verified.",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124",
  },
  {
    id: "aud-006",
    timestamp: "2026-04-16T12:58:17Z",
    user: "unknown",
    action: "login",
    resource: "auth.session",
    ip: "10.0.0.91",
    status: "failure",
    details: "Failed login attempt. Invalid credentials. Account: admin@starmap.dev. Attempt 3/5.",
    userAgent: "curl/8.4.0",
  },
  {
    id: "aud-007",
    timestamp: "2026-04-16T12:34:51Z",
    user: "gerald@weareinformal.com",
    action: "tenant_created",
    resource: "tenant.t-004",
    ip: "203.0.113.42",
    status: "success",
    details: "Created tenant 'StarMap Beta' on FREE plan with domain beta.starmap.dev.",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124",
  },
  {
    id: "aud-008",
    timestamp: "2026-04-16T11:15:08Z",
    user: "admin@astroflow.io",
    action: "profile_updated",
    resource: "profile.usr-af-1240",
    ip: "198.51.100.14",
    status: "success",
    details: "Updated birth time from 14:30 to 14:32 and recalculated natal chart.",
    userAgent: "AstroFlowApp/3.2.1 (iOS 18.2)",
  },
  {
    id: "aud-009",
    timestamp: "2026-04-16T10:42:30Z",
    user: "gerald@weareinformal.com",
    action: "export_data",
    resource: "export.tenant_analytics",
    ip: "203.0.113.42",
    status: "success",
    details: "Exported 30-day analytics report for all tenants. Format: CSV, 2.4MB.",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124",
  },
  {
    id: "aud-010",
    timestamp: "2026-04-16T09:18:55Z",
    user: "ops@celestial.app",
    action: "config_changed",
    resource: "tenant.t-002.webhook_url",
    ip: "192.0.2.88",
    status: "warning",
    details: "Changed webhook URL. Previous URL returned 503 for last 3 deliveries.",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124",
  },
  {
    id: "aud-011",
    timestamp: "2026-04-16T08:45:22Z",
    user: "system",
    action: "api_call",
    resource: "/api/v1/transit/live",
    ip: "127.0.0.1",
    status: "success",
    details: "Automated transit cache refresh. Updated 847 active transit calculations.",
    userAgent: "EnviousBrain-Worker/1.0",
  },
  {
    id: "aud-012",
    timestamp: "2026-04-16T07:30:11Z",
    user: "gerald@weareinformal.com",
    action: "logout",
    resource: "auth.session",
    ip: "203.0.113.42",
    status: "success",
    details: "Manual logout. Session duration: 4h 12m.",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124",
  },
];

const ACTION_TYPES: ActionType[] = [
  "api_call",
  "key_created",
  "key_revoked",
  "config_changed",
  "login",
  "logout",
  "tenant_created",
  "profile_updated",
  "export_data",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function actionBadge(action: ActionType) {
  const map: Record<ActionType, "info" | "healthy" | "degraded" | "error" | "neutral"> = {
    api_call: "info",
    key_created: "healthy",
    key_revoked: "error",
    config_changed: "degraded",
    login: "healthy",
    logout: "neutral",
    tenant_created: "info",
    profile_updated: "neutral",
    export_data: "info",
  };
  return <Badge variant={map[action]}>{action.replace(/_/g, " ")}</Badge>;
}

function statusBadge(status: AuditStatus) {
  const map: Record<AuditStatus, "healthy" | "degraded" | "error"> = {
    success: "healthy",
    warning: "degraded",
    failure: "error",
  };
  return <Badge variant={map[status]}>{status}</Badge>;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionType | "all">("all");
  const [userFilter, setUserFilter] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  // Unique users for filter
  const uniqueUsers = useMemo(
    () => Array.from(new Set(MOCK_ENTRIES.map((e) => e.user))),
    [],
  );

  // Filtered entries
  const filtered = useMemo(() => {
    return MOCK_ENTRIES.filter((entry) => {
      if (actionFilter !== "all" && entry.action !== actionFilter) return false;
      if (userFilter && entry.user !== userFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          entry.user.toLowerCase().includes(q) ||
          entry.resource.toLowerCase().includes(q) ||
          entry.action.toLowerCase().includes(q) ||
          entry.details.toLowerCase().includes(q) ||
          entry.ip.includes(q)
        );
      }
      return true;
    });
  }, [search, actionFilter, userFilter]);

  const handleExportCsv = () => {
    const header = "Timestamp,User,Action,Resource,IP,Status,Details";
    const rows = filtered.map(
      (e) =>
        `"${e.timestamp}","${e.user}","${e.action}","${e.resource}","${e.ip}","${e.status}","${e.details.replace(/"/g, '""')}"`,
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">Audit Trail</h1>
            <Badge variant="info">Coming Soon</Badge>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Searchable log of all system events and user actions
          </p>
        </div>
        <Button onClick={handleExportCsv} variant="secondary">
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Search"
            placeholder="Search by user, resource, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as ActionType | "all")}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
            >
              <option value="all">All Actions</option>
              {ACTION_TYPES.map((at) => (
                <option key={at} value={at}>
                  {at.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">User</label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
            >
              <option value="">All Users</option>
              {uniqueUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs text-text-muted">
          Showing {filtered.length} of {MOCK_ENTRIES.length} events
        </p>
      </Card>

      {/* Audit Log Table */}
      <Card className="mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Timestamp
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                User
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Action
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Resource
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                IP
              </th>
              <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <td className="py-3 pr-4 font-mono text-xs text-text-muted whitespace-nowrap">
                  {formatTimestamp(entry.timestamp)}
                </td>
                <td className="py-3 pr-4 text-text-secondary max-w-[180px] truncate">
                  {entry.user}
                </td>
                <td className="py-3 pr-4">{actionBadge(entry.action)}</td>
                <td className="py-3 pr-4 font-mono text-xs text-text-muted max-w-[200px] truncate">
                  {entry.resource}
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-text-muted">
                  {entry.ip}
                </td>
                <td className="py-3">{statusBadge(entry.status)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-sm text-text-muted"
                >
                  No audit entries match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Event Detail
              </h2>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-text-muted hover:text-text-primary transition-colors text-lg"
              >
                {"\u2715"}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Timestamp</span>
                <span className="text-sm font-mono text-text-primary">
                  {new Date(selectedEntry.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">User</span>
                <span className="text-sm text-text-primary">{selectedEntry.user}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Action</span>
                {actionBadge(selectedEntry.action)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Resource</span>
                <span className="text-sm font-mono text-text-secondary">
                  {selectedEntry.resource}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">IP Address</span>
                <span className="text-sm font-mono text-text-secondary">
                  {selectedEntry.ip}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Status</span>
                {statusBadge(selectedEntry.status)}
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs text-text-muted mb-1">Details</p>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {selectedEntry.details}
                </p>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs text-text-muted mb-1">User Agent</p>
                <p className="text-xs font-mono text-text-muted break-all">
                  {selectedEntry.userAgent}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedEntry(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
