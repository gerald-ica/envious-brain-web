"use client";

import { useState, useEffect, useRef } from "react";

export interface City {
  name: string;      // "New York, NY, USA"
  lat: number;
  lon: number;
  timezone: string;
}

interface CitySearchProps {
  label?: string;
  value: string;
  onChange: (city: City) => void;
  placeholder?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://envious-brain-api-662458014068.us-central1.run.app";

export function CitySearch({ label, value, onChange, placeholder }: CitySearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced API search (300ms)
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Don't search if query matches the currently selected city
    if (query === value) {
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `${API_URL}/api/v1/cities/search?q=${encodeURIComponent(query)}&limit=10`,
          { signal: controller.signal, cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setOpen(true);
          setHighlighted(0);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("City search failed:", err);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, value]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectCity(city: City) {
    onChange(city);
    setQuery(city.name);
    setOpen(false);
    setResults([]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectCity(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Search for a city..."}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-xl z-50">
          {results.map((city, i) => (
            <button
              key={`${city.name}-${i}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectCity(city)}
              onMouseEnter={() => setHighlighted(i)}
              className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                i === highlighted
                  ? "bg-accent-blue/10 text-accent-blue"
                  : "text-text-primary hover:bg-white/5"
              }`}
            >
              <div className="font-medium">{city.name}</div>
              <div className="text-xs text-text-muted">{city.timezone}</div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted shadow-xl z-50">
          No cities found
        </div>
      )}
    </div>
  );
}
