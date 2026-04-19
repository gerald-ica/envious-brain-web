"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import React from "react";

// ---- Types ----------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  tier: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// ---- Constants ------------------------------------------------------------

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-662458014068.us-central1.run.app";

const TOKEN_KEY = "envious_access_token";
const REFRESH_KEY = "envious_refresh_token";

// Token refresh interval: 14 minutes (assuming 15-min token lifetime)
const REFRESH_INTERVAL_MS = 14 * 60 * 1000;

// ---- Context --------------------------------------------------------------

const AuthContext = createContext<AuthState | null>(null);

// ---- Provider -------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // -- Helpers --

  const storeTokens = useCallback((tokens: AuthTokens) => {
    localStorage.setItem(TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
    setAccessToken(tokens.access_token);
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem("envious_api_key");
    setAccessToken(null);
    setUser(null);
  }, []);

  // -- Auth API calls --

  const fetchMe = useCallback(async (token: string): Promise<AuthUser> => {
    const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    const data = await res.json();
    // Handle both wrapped {data: user} and plain user responses
    return data.data ?? data;
  }, []);

  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) {
      clearTokens();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });

      if (!res.ok) {
        clearTokens();
        return;
      }

      const data = await res.json();
      const newToken = data.access_token ?? data.data?.access_token;
      if (newToken) {
        localStorage.setItem(TOKEN_KEY, newToken);
        setAccessToken(newToken);
      }
    } catch {
      clearTokens();
    }
  }, [clearTokens]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let message = "Invalid email or password";
        try {
          const err = await res.json();
          message = err.detail ?? err.message ?? message;
        } catch {
          // keep default message
        }
        throw new Error(message);
      }

      const data: AuthResponse = await res.json();
      storeTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      // Clear any demo/leftover profile data
      localStorage.removeItem("envious_profiles");
      localStorage.removeItem("envious_active_profile");
      setUser(data.user);
    },
    [storeTokens],
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName,
        }),
      });

      if (!res.ok) {
        let message = "Registration failed";
        try {
          const err = await res.json();
          message = err.detail ?? err.message ?? message;
        } catch {
          // keep default message
        }
        throw new Error(message);
      }

      const data: AuthResponse = await res.json();
      storeTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      // Clear any demo/leftover profile data
      localStorage.removeItem("envious_profiles");
      localStorage.removeItem("envious_active_profile");
      setUser(data.user);
    },
    [storeTokens],
  );

  const logout = useCallback(() => {
    clearTokens();
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, [clearTokens]);

  // -- Initialize: validate stored token on mount --

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await fetchMe(token);
        if (!cancelled) {
          setAccessToken(token);
          setUser(me);
        }
      } catch {
        // Token invalid / expired — try refresh
        try {
          const refresh = localStorage.getItem(REFRESH_KEY);
          if (refresh) {
            const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: refresh }),
            });

            if (res.ok) {
              const data = await res.json();
              const newToken = data.access_token ?? data.data?.access_token;
              if (newToken && !cancelled) {
                localStorage.setItem(TOKEN_KEY, newToken);
                setAccessToken(newToken);
                const me = await fetchMe(newToken);
                if (!cancelled) setUser(me);
              }
            } else if (!cancelled) {
              clearTokens();
            }
          } else if (!cancelled) {
            clearTokens();
          }
        } catch {
          if (!cancelled) clearTokens();
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [fetchMe, clearTokens]);

  // -- Auto-refresh interval --

  useEffect(() => {
    if (!accessToken) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    refreshIntervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL_MS);
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [accessToken, refreshToken]);

  // -- Context value --

  const value: AuthState = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

// ---- Hook -----------------------------------------------------------------

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
