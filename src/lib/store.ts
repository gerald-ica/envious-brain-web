"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import React from "react";

// ---- Types ----------------------------------------------------------------

export interface Profile {
  id: string;
  name: string;
  birthDate: string; // ISO date string  e.g. "1990-06-15"
  birthTime: string; // HH:MM            e.g. "14:30"
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

// ---- Default profile for demo ---------------------------------------------

const DEFAULT_PROFILE: Profile = {
  id: "demo",
  name: "Demo User",
  birthDate: "1990-06-15",
  birthTime: "14:30",
  lat: 40.7128,
  lon: -74.006,
  timezone: "America/New_York",
};

// ---- Context --------------------------------------------------------------

const ProfileContext = createContext<ProfileState | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(
    DEFAULT_PROFILE,
  );
  const [profiles, setProfiles] = useState<Profile[]>([DEFAULT_PROFILE]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const setProfile = useCallback(
    (profile: Profile) => {
      setActiveProfile(profile);
    },
    [],
  );

  const addProfile = useCallback((profile: Profile) => {
    setProfiles((prev) => [...prev, profile]);
  }, []);

  const removeProfile = useCallback(
    (id: string) => {
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      if (activeProfile?.id === id) {
        setActiveProfile(null);
      }
    },
    [activeProfile],
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
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
