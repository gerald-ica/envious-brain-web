"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import {
  Sun,
  Moon,
  Menu,
  Search,
  ChevronDown,
  UserPlus,
  LogOut,
  Sparkles,
} from "lucide-react";

// ---- Health indicator -----------------------------------------------------

function HealthDot() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(
          "https://envious-brain-api-662458014068.us-central1.run.app/api/v1/health",
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
      className="relative rounded-lg p-2 text-text-muted hover:bg-accent-blue/10 hover:text-accent-blue transition-colors"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

// ---- Search bar (cosmetic) ------------------------------------------------

function SearchBar() {
  return (
    <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-1.5 text-sm text-text-muted focus-within:border-accent-blue/50 focus-within:ring-1 focus-within:ring-accent-blue/20 transition-all w-64">
      <Search size={15} className="shrink-0" />
      <input
        type="text"
        placeholder="Search charts, techniques..."
        className="flex-1 bg-transparent outline-none placeholder:text-text-muted text-text-primary text-sm"
        readOnly
      />
      <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-mono text-text-muted">
        ⌘K
      </kbd>
    </div>
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
        <span className="w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue text-xs flex items-center justify-center font-semibold">
          {activeProfile?.name.charAt(0).toUpperCase() ?? "?"}
        </span>
        <span className="max-w-[120px] truncate hidden sm:inline">
          {activeProfile?.name ?? "Select Profile"}
        </span>
        <ChevronDown size={14} className="text-text-muted" />
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
              <span className="w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue text-xs flex items-center justify-center font-semibold shrink-0">
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
              <UserPlus size={16} />
              <span>Add Profile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- User menu (auth-aware) -----------------------------------------------

function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
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

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (!user) return null;

  const initial = (user.display_name || user.email).charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary hover:border-border-hover hover:text-text-primary transition-colors"
      >
        <span className="w-6 h-6 rounded-full bg-accent-purple/20 text-accent-purple text-xs flex items-center justify-center font-semibold">
          {initial}
        </span>
        <span className="max-w-[120px] truncate hidden sm:inline">
          {user.display_name || user.email}
        </span>
        <ChevronDown size={14} className="text-text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-border bg-surface py-1 shadow-xl z-50">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-text-primary truncate">
              {user.display_name}
            </p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
            {user.tier && (
              <span className="mt-1 inline-block rounded-full bg-accent-blue/10 px-2 py-0.5 text-xs font-medium text-accent-blue">
                {user.tier}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-accent-rose hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Top bar --------------------------------------------------------------

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      {/* Left: hamburger + title (visible on mobile when sidebar hidden) */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <Sparkles size={20} className="text-accent-blue" />
        <span className="text-sm font-bold tracking-wide text-text-primary">
          ENVI-OUS BRAIN
        </span>
      </div>

      {/* Center: Search bar (desktop only) */}
      <div className="hidden md:flex flex-1 justify-start pl-2">
        <SearchBar />
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        <HealthDot />
        <ThemeToggle />
        <ProfileSelector />
        <UserMenu />
      </div>
    </header>
  );
}
