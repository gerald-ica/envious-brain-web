"use client";

import { useState, useEffect, useRef } from "react";
import { useProfile } from "@/lib/store";

// ---- Health indicator -----------------------------------------------------

function HealthDot() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(
          "https://envious-brain-api-uxgej3n6ta-uc.a.run.app/api/v1/health",
          { cache: "no-store" },
        );
        if (!cancelled) setHealthy(res.ok);
      } catch {
        if (!cancelled) setHealthy(false);
      }
    }

    check();
    const interval = setInterval(check, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const color =
    healthy === null
      ? "bg-text-muted"
      : healthy
        ? "bg-accent-emerald"
        : "bg-accent-rose";

  const label =
    healthy === null
      ? "Checking API..."
      : healthy
        ? "API healthy"
        : "API unreachable";

  return (
    <span className="flex items-center gap-1.5" title={label}>
      <span className={`inline-block h-2 w-2 rounded-full pulse-dot ${color}`} />
      <span className="text-xs text-text-muted hidden sm:inline">{label}</span>
    </span>
  );
}

// ---- Theme toggle ---------------------------------------------------------

function ThemeToggle() {
  const { theme, toggleTheme } = useProfile();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? "\u263C" : "\u263E"}
    </button>
  );
}

// ---- Profile selector dropdown --------------------------------------------

function ProfileSelector() {
  const { activeProfile, profiles, setProfile } = useProfile();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary hover:border-border-hover hover:text-text-primary transition-colors"
      >
        <span className="w-5 h-5 rounded-full bg-accent-blue/20 text-accent-blue text-xs flex items-center justify-center font-medium">
          {activeProfile?.name.charAt(0).toUpperCase() ?? "?"}
        </span>
        <span className="max-w-[120px] truncate">
          {activeProfile?.name ?? "Select Profile"}
        </span>
        <span className="text-xs">{"\u25BE"}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-border bg-surface py-1 shadow-xl z-50">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setProfile(p);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                activeProfile?.id === p.id
                  ? "bg-accent-blue/10 text-accent-blue"
                  : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue text-xs flex items-center justify-center font-medium shrink-0">
                {p.name.charAt(0).toUpperCase()}
              </span>
              <div className="flex flex-col items-start min-w-0">
                <span className="truncate w-full">{p.name}</span>
                <span className="text-xs text-text-muted">{p.birthDate}</span>
              </div>
            </button>
          ))}
          <div className="border-t border-border mt-1 pt-1">
            <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors">
              <span className="text-base">+</span>
              <span>Add Profile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Top bar --------------------------------------------------------------

export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      {/* Left: title (visible on mobile when sidebar hidden) */}
      <div className="flex items-center gap-3 lg:hidden">
        <span className="text-lg font-bold text-accent-blue">{"\u2727"}</span>
        <span className="text-sm font-bold tracking-wide text-text-primary">
          ENVI-OUS BRAIN
        </span>
      </div>

      {/* Spacer for desktop (sidebar has its own branding) */}
      <div className="hidden lg:block" />

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        <HealthDot />
        <ThemeToggle />
        <ProfileSelector />
      </div>
    </header>
  );
}
