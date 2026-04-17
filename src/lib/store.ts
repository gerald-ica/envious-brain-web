"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import React from "react";

// ---- Types ----------------------------------------------------------------

export interface Profile {
  id: string;
  name: string;
  birthDate: string; // ISO date string  e.g. "1990-06-15"
  birthTime: string; // HH:MM            e.g. "14:30"
  city: string;      // display name     e.g. "New York, USA"
  lat: number;
  lon: number;
  timezone: string; // IANA timezone     e.g. "America/New_York"
}

export interface ProfileState {
  activeProfile: Profile | null;
  profiles: Profile[];
  setProfile: (profile: Profile) => void;
  addProfile: (profile: Profile) => void;
  removeProfile: (id: string) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

// ---- Default profile for demo (landing page preview only) ----------------

export const DEFAULT_PROFILE: Profile = {
  id: "demo",
  name: "Demo User",
  birthDate: "1990-06-15",
  birthTime: "14:30",
  city: "New York, USA",
  lat: 40.7128,
  lon: -74.006,
  timezone: "America/New_York",
};

// ---- localStorage keys ---------------------------------------------------

const STORAGE_KEY_PROFILES = "envious_profiles";
const STORAGE_KEY_ACTIVE_ID = "envious_active_profile_id";

// ---- Context --------------------------------------------------------------

const ProfileContext = createContext<ProfileState | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  // Hydrate from localStorage on first render (SSR-safe)
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
      return raw ? (JSON.parse(raw) as Profile[]) : [];
    } catch {
      return [];
    }
  });

  const [activeProfile, setActiveProfile] = useState<Profile | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
      const id = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      if (!raw) return null;
      const list = JSON.parse(raw) as Profile[];
      if (!list.length) return null;
      if (!id) return list[0] ?? null;
      return list.find((p) => p.id === id) ?? list[0] ?? null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    try {
      const stored = JSON.parse(localStorage.getItem("envious-brain-prefs") || "{}");
      return stored?.state?.theme === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  // Persist theme whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("envious-brain-prefs", JSON.stringify({ state: { theme } }));
    } catch { /* best effort */ }
  }, [theme]);

  // Persist profiles whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    } catch {
      /* storage quota or disabled -- best effort */
    }
  }, [profiles]);

  // Persist active profile id whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (activeProfile) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeProfile.id);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
      }
    } catch {
      /* best effort */
    }
  }, [activeProfile]);

  const setProfile = useCallback((profile: Profile) => {
    setActiveProfile(profile);
  }, []);

  const addProfile = useCallback((profile: Profile) => {
    setProfiles((prev) => {
      // Replace if same id already exists, otherwise append
      const exists = prev.some((p) => p.id === profile.id);
      return exists
        ? prev.map((p) => (p.id === profile.id ? profile : p))
        : [...prev, profile];
    });
    // Auto-activate first profile so users don't have to click after creating
    setActiveProfile((curr) => curr ?? profile);
  }, []);

  const removeProfile = useCallback(
    (id: string) => {
      setProfiles((prev) => {
        const next = prev.filter((p) => p.id !== id);
        // If we removed the active one, pick another or clear
        if (activeProfile?.id === id) {
          setActiveProfile(next[0] ?? null);
        }
        return next;
      });
    },
    [activeProfile],
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("light", next === "light");
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return next;
    });
  }, []);

  const value: ProfileState = {
    activeProfile,
    profiles,
    setProfile,
    addProfile,
    removeProfile,
    theme,
    toggleTheme,
  };

  return React.createElement(ProfileContext.Provider, { value }, children);
}

export function useProfile(): ProfileState {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return ctx;
}
