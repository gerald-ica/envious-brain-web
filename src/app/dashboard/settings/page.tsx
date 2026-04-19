"use client";

import { useState, useEffect } from "react";
import { useProfile, type Profile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CitySearch } from "@/components/ui/city-search";
import { PdfExportButton } from "@/components/export/pdf-export-button";

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

type LLMProvider = "vercel" | "openai" | "anthropic" | "openrouter" | "cerebras" | "ollama";
type AccentColor = "blue" | "purple" | "emerald" | "amber" | "rose";
type Language = "EN" | "ES" | "FR" | "PT" | "ZH";

const LLM_PROVIDERS: { id: LLMProvider; label: string; defaultModel: string }[] = [
  { id: "vercel", label: "Vercel AI", defaultModel: "alibaba/qwen3.5-plus" },
  { id: "openai", label: "OpenAI", defaultModel: "gpt-4o" },
  { id: "anthropic", label: "Anthropic", defaultModel: "claude-sonnet-4-20250514" },
  { id: "openrouter", label: "OpenRouter", defaultModel: "auto" },
  { id: "cerebras", label: "Cerebras", defaultModel: "llama-4-scout-17b" },
  { id: "ollama", label: "Ollama", defaultModel: "llama3.2" },
];

const ACCENT_COLORS: { id: AccentColor; hex: string; label: string }[] = [
  { id: "blue", hex: "#3b82f6", label: "Blue" },
  { id: "purple", hex: "#8b5cf6", label: "Purple" },
  { id: "emerald", hex: "#10b981", label: "Emerald" },
  { id: "amber", hex: "#f59e0b", label: "Amber" },
  { id: "rose", hex: "#f43f5e", label: "Rose" },
];

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "EN", label: "English" },
  { id: "ES", label: "Espanol" },
  { id: "FR", label: "Francais" },
  { id: "PT", label: "Portugues" },
  { id: "ZH", label: "Chinese" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { activeProfile, profiles, setProfile, addProfile, removeProfile, theme, toggleTheme } =
    useProfile();

  // ---- Profile Management state ----
  const [showCreateProfile, setShowCreateProfile] = useState(!activeProfile && profiles.length === 0);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Create profile form
  const [pName, setPName] = useState("");
  const [pDate, setPDate] = useState("");
  const [pTime, setPTime] = useState("");
  const [pCity, setPCity] = useState("");
  const [pLat, setPLat] = useState("");
  const [pLon, setPLon] = useState("");
  const [pTz, setPTz] = useState("America/New_York");
  const [createError, setCreateError] = useState("");

  // Edit profile form
  const [eName, setEName] = useState("");
  const [eDate, setEDate] = useState("");
  const [eTime, setETime] = useState("");
  const [eCity, setECity] = useState("");
  const [eLat, setELat] = useState("");
  const [eLon, setELon] = useState("");
  const [eTz, setETz] = useState("");

  // ---- LLM Configuration ----
  const [llmProvider, setLlmProvider] = useState<LLMProvider>("vercel");
  const [modelOverride, setModelOverride] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  // ---- Display Preferences ----
  const [accent, setAccent] = useState<AccentColor>("blue");
  const [language, setLanguage] = useState<Language>("EN");

  // Auto-open profile creation form when no profiles exist
  useEffect(() => {
    if (profiles.length === 0) {
      setShowCreateProfile(true);
    }
  }, [profiles.length]);

  // ---- Handlers ----

  const handleCreateProfile = () => {
    setCreateError("");

    if (!pName.trim()) {
      setCreateError("Name is required");
      return;
    }
    if (!pDate) {
      setCreateError("Birth date is required");
      return;
    }
    if (!pCity && !pLat) {
      setCreateError("Please search for a birth city");
      return;
    }

    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      name: pName.trim(),
      birthDate: pDate,
      birthTime: pTime || "12:00",
      city: pCity,
      lat: parseFloat(pLat) || 0,
      lon: parseFloat(pLon) || 0,
      timezone: pTz,
    };
    addProfile(newProfile);
    setPName("");
    setPDate("");
    setPTime("");
    setPCity("");
    setPLat("");
    setPLon("");
    setPTz("America/New_York");
    setShowCreateProfile(false);
    setCreateError("");
  };

  const startEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setEName(profile.name);
    setEDate(profile.birthDate);
    setETime(profile.birthTime);
    setECity(profile.city || "");
    setELat(String(profile.lat));
    setELon(String(profile.lon));
    setETz(profile.timezone);
  };

  const handleSaveEdit = () => {
    if (!editingProfile || !eName.trim()) return;
    const updated: Profile = {
      ...editingProfile,
      name: eName.trim(),
      birthDate: eDate,
      birthTime: eTime,
      city: eCity,
      lat: parseFloat(eLat) || 0,
      lon: parseFloat(eLon) || 0,
      timezone: eTz,
    };
    // Update in profiles list via remove+add pattern
    removeProfile(editingProfile.id);
    addProfile(updated);
    if (activeProfile?.id === editingProfile.id) {
      setProfile(updated);
    }
    setEditingProfile(null);
  };

  const handleDeleteProfile = (id: string) => {
    if (deleteConfirm === id) {
      removeProfile(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Auto-clear confirm after 3 seconds
      setTimeout(() => setDeleteConfirm((prev) => (prev === id ? null : prev)), 3000);
    }
  };

  const handleExportProfiles = () => {
    const data = JSON.stringify(profiles, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "envious-brain-profiles.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSettings = () => {
    const settings = {
      llm: {
        provider: llmProvider,
        modelOverride: modelOverride || null,
        temperature,
      },
      display: {
        theme,
        accent,
        language,
      },
      exportedAt: new Date().toISOString(),
    };
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "envious-brain-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentProvider = LLM_PROVIDERS.find((p) => p.id === llmProvider);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage profiles, AI configuration, display preferences, and data export
        </p>
      </div>

      {/* ================================================================= */}
      {/* PROFILE MANAGEMENT                                                */}
      {/* ================================================================= */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Profile Management</h2>

        {/* Current Profile Card */}
        {activeProfile && (
          <Card className="mb-4" glow="blue">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-semibold text-text-primary">
                    {activeProfile.name}
                  </p>
                  <Badge variant="healthy">Active</Badge>
                </div>
                <p className="text-sm text-text-secondary">
                  Born {activeProfile.birthDate} at {activeProfile.birthTime}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {activeProfile.city || `${activeProfile.lat.toFixed(4)}, ${activeProfile.lon.toFixed(4)}`} --{" "}
                  {activeProfile.timezone}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-muted">
                  <span>Lat: {activeProfile.lat.toFixed(4)}</span>
                  <span>{"\u00b7"}</span>
                  <span>Lon: {activeProfile.lon.toFixed(4)}</span>
                  <span>{"\u00b7"}</span>
                  <span>TZ: {activeProfile.timezone}</span>
                </div>
              </div>
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => startEditProfile(activeProfile)}
              >
                Edit
              </Button>
            </div>
          </Card>
        )}

        {/* Create New Profile */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="secondary"
            onClick={() => {
              setShowCreateProfile((prev) => !prev);
              setCreateError("");
            }}
          >
            {showCreateProfile ? "Cancel" : "+ Create New Profile"}
          </Button>
        </div>

        {showCreateProfile && (
          <Card className="mb-4">
            <h3 className="mb-4 text-sm font-semibold text-text-primary">New Profile</h3>
            {createError && (
              <div className="mb-4 rounded-lg bg-accent-rose/10 border border-accent-rose/20 px-3 py-2">
                <p className="text-sm text-accent-rose">{createError}</p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Name *"
                placeholder="e.g. John Doe"
                value={pName}
                onChange={(e) => setPName(e.target.value)}
              />
              <Input
                label="Birth Date *"
                type="date"
                value={pDate}
                onChange={(e) => setPDate(e.target.value)}
              />
              <Input
                label="Birth Time"
                type="time"
                value={pTime}
                onChange={(e) => setPTime(e.target.value)}
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <CitySearch
                  label="Birth City *"
                  value={pCity}
                  onChange={(city) => {
                    setPCity(city.name);
                    setPLat(String(city.lat));
                    setPLon(String(city.lon));
                    setPTz(city.timezone);
                  }}
                  placeholder="Search for a city..."
                />
                {pLat && (
                  <p className="mt-1 text-xs text-text-muted">
                    {pCity} ({pLat}, {pLon}) -- {pTz}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-text-muted">* Required fields</p>
              <Button onClick={handleCreateProfile}>Create Profile</Button>
            </div>
          </Card>
        )}

        {/* Edit Profile Modal */}
        {editingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Edit Profile</h3>
                <button
                  onClick={() => setEditingProfile(null)}
                  className="text-text-muted hover:text-text-primary transition-colors text-lg"
                >
                  {"\u2715"}
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Name"
                  value={eName}
                  onChange={(e) => setEName(e.target.value)}
                />
                <Input
                  label="Birth Date"
                  type="date"
                  value={eDate}
                  onChange={(e) => setEDate(e.target.value)}
                />
                <Input
                  label="Birth Time"
                  type="time"
                  value={eTime}
                  onChange={(e) => setETime(e.target.value)}
                />
                <CitySearch
                  label="Birth City"
                  value={eCity}
                  onChange={(city) => {
                    setECity(city.name);
                    setELat(String(city.lat));
                    setELon(String(city.lon));
                    setETz(city.timezone);
                  }}
                  placeholder="Search for a city..."
                />
                {eLat && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-text-muted">
                      Coordinates: {eLat}, {eLon} -- Timezone: {eTz}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setEditingProfile(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Profiles List */}
        <Card title="Saved Profiles">
          <div className="space-y-2">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      activeProfile?.id === profile.id
                        ? "bg-accent-blue text-white"
                        : "bg-white/10 text-text-muted"
                    }`}
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {profile.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {profile.birthDate} at {profile.birthTime}
                      {profile.city ? ` -- ${profile.city}` : ""}
                    </p>
                  </div>
                  {activeProfile?.id === profile.id && (
                    <Badge variant="healthy">Active</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    className="text-xs px-2 py-1"
                    onClick={() => setProfile(profile)}
                    disabled={activeProfile?.id === profile.id}
                  >
                    Activate
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-xs px-2 py-1"
                    onClick={() => startEditProfile(profile)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className={`text-xs px-2 py-1 ${
                      deleteConfirm === profile.id
                        ? "text-white bg-accent-rose"
                        : "text-accent-rose"
                    }`}
                    onClick={() => handleDeleteProfile(profile.id)}
                  >
                    {deleteConfirm === profile.id ? "Confirm?" : "Delete"}
                  </Button>
                </div>
              </div>
            ))}
            {profiles.length === 0 && (
              <p className="py-4 text-center text-sm text-text-muted">
                No profiles saved. Create one above to get started.
              </p>
            )}
          </div>
        </Card>
      </section>

      {/* ================================================================= */}
      {/* LLM CONFIGURATION                                                 */}
      {/* ================================================================= */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">LLM Configuration</h2>
        <Card>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Provider Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Provider</label>
              <div className="flex flex-wrap gap-2">
                {LLM_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setLlmProvider(provider.id);
                      setModelOverride("");
                    }}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      llmProvider === provider.id
                        ? "border-accent-blue bg-accent-blue/15 text-accent-blue"
                        : "border-border bg-surface text-text-secondary hover:border-border-hover"
                    }`}
                  >
                    {provider.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-1">
                Default model: {currentProvider?.defaultModel}
              </p>
            </div>

            {/* Model Override */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Model Override</label>
              <input
                type="text"
                autoComplete="off"
                data-1p-ignore
                data-lpignore="true"
                placeholder={currentProvider?.defaultModel ?? "Leave blank for default"}
                value={modelOverride}
                onChange={(e) => setModelOverride(e.target.value)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
              />
              <p className="text-xs text-text-muted">Current: {currentProvider?.defaultModel}</p>
            </div>

            {/* Temperature Slider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Temperature: {temperature.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#3b82f6]"
              />
              <div className="flex justify-between text-xs text-text-muted">
                <span>0.0 (Precise)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            {/* API Key */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">API Key (optional override)</label>
              <div className="flex items-center gap-2">
                <input
                  type={showApiKey ? "text" : "password"}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                  name="llm-api-key-override"
                  placeholder={llmProvider === "vercel" ? "Pre-configured — no key needed" : "sk-..."}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
                />
                <Button
                  variant="ghost"
                  className="text-xs px-2 py-2 shrink-0"
                  onClick={() => setShowApiKey((prev) => !prev)}
                >
                  {showApiKey ? "Hide" : "Show"}
                </Button>
              </div>
              <p className="text-xs text-text-muted">
                {llmProvider === "vercel"
                  ? "Vercel AI Gateway is pre-configured. No API key required."
                  : "Stored locally. Never sent to our servers."}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ================================================================= */}
      {/* DISPLAY PREFERENCES                                               */}
      {/* ================================================================= */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Display Preferences</h2>
        <Card>
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Theme Toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">Theme</label>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
                <button
                  onClick={() => theme === "light" && toggleTheme()}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-accent-blue text-white"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => theme === "dark" && toggleTheme()}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                    theme === "light"
                      ? "bg-accent-blue text-white"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Light
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">Accent Color</label>
              <div className="flex items-center gap-2">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setAccent(color.id)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      accent === color.id
                        ? "border-white scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  />
                ))}
              </div>
              <p className="text-xs text-text-muted">
                {ACCENT_COLORS.find((c) => c.id === accent)?.label}
              </p>
            </div>

            {/* Language */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.id} -- {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </section>

      {/* ================================================================= */}
      {/* EXPORT                                                            */}
      {/* ================================================================= */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Export</h2>
        <Card>
          <div className="flex flex-wrap gap-3">
            <PdfExportButton />
            <Button variant="secondary" onClick={handleExportProfiles}>
              Export All Profiles (JSON)
            </Button>
            <Button variant="secondary" onClick={handleExportSettings}>
              Export Settings (JSON)
            </Button>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Export a comprehensive natal report as PDF, or download profiles and settings as JSON.
          </p>
        </Card>
      </section>
    </div>
  );
}
