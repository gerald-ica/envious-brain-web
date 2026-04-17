"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---- Types ------------------------------------------------------------------

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  tag: string;
  requestExample?: string;
  responseExample: string;
}

// ---- Mock Data --------------------------------------------------------------

const BIRTH_PAYLOAD = JSON.stringify(
  {
    datetime: "1990-06-15T14:30:00",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
  },
  null,
  2,
);

const ENDPOINTS: Endpoint[] = [
  // Charts
  {
    method: "POST",
    path: "/api/v1/charts/western",
    description: "Calculate a Western natal chart (tropical zodiac, Placidus houses).",
    tag: "Charts",
    requestExample: BIRTH_PAYLOAD,
    responseExample: JSON.stringify(
      { positions: { Sun: { sign: "Gemini", degree_in_sign: 24.2, retrograde: false } }, aspects: [], houses: [] },
      null, 2,
    ),
  },
  {
    method: "POST",
    path: "/api/v1/charts/vedic",
    description: "Calculate a Vedic sidereal chart with nakshatras and Vimshottari dashas.",
    tag: "Charts",
    requestExample: BIRTH_PAYLOAD,
    responseExample: JSON.stringify(
      { positions: { Moon: { rashi: "Tula", sidereal_longitude: 188.3 } }, nakshatra: { name: "Swati" } },
      null, 2,
    ),
  },
  {
    method: "POST",
    path: "/api/v1/charts/bazi",
    description: "Calculate BaZi Four Pillars of Destiny.",
    tag: "Charts",
    requestExample: JSON.stringify({ datetime: "1990-06-15T14:30:00", gender: "male" }, null, 2),
    responseExample: JSON.stringify(
      { pillars: { year: { stem: "Geng", branch: "Wu_branch", animal: "Horse" } }, day_master: "Xin" },
      null, 2,
    ),
  },
  {
    method: "POST",
    path: "/api/v1/charts/human-design",
    description: "Calculate a Human Design bodygraph.",
    tag: "Charts",
    requestExample: BIRTH_PAYLOAD,
    responseExample: JSON.stringify(
      { type: "Generator", strategy: "Wait to Respond", authority: "Sacral", profile: "3/5" },
      null, 2,
    ),
  },
  {
    method: "POST",
    path: "/api/v1/charts/solar-return",
    description: "Calculate a solar return chart for a given year.",
    tag: "Charts",
    requestExample: JSON.stringify({ ...JSON.parse(BIRTH_PAYLOAD), target_year: 2026 }, null, 2),
    responseExample: JSON.stringify({ positions: {}, houses: [], solar_return_datetime: "2026-06-15T02:45:00Z" }, null, 2),
  },
  {
    method: "POST",
    path: "/api/v1/charts/progressions",
    description: "Calculate secondary progressions to a target date.",
    tag: "Charts",
    requestExample: JSON.stringify({ ...JSON.parse(BIRTH_PAYLOAD), target_date: "2026-04-17T00:00:00" }, null, 2),
    responseExample: JSON.stringify({ positions: {} }, null, 2),
  },
  {
    method: "POST",
    path: "/api/v1/western/synastry",
    description: "Calculate synastry (relationship compatibility) between two charts.",
    tag: "Western Advanced",
    requestExample: JSON.stringify({
      person1_datetime: "1990-06-15T14:30:00", person1_latitude: 40.71, person1_longitude: -74.0,
      person2_datetime: "1992-03-20T10:00:00", person2_latitude: 34.05, person2_longitude: -118.24,
    }, null, 2),
    responseExample: JSON.stringify({ compatibility_score: 78, aspects: [] }, null, 2),
  },
  {
    method: "POST",
    path: "/api/v1/western/draconic",
    description: "Calculate draconic (soul) chart aligned to North Node.",
    tag: "Western Advanced",
    requestExample: BIRTH_PAYLOAD,
    responseExample: JSON.stringify({ positions: {} }, null, 2),
  },
  {
    method: "POST",
    path: "/api/v1/western/fixed-stars",
    description: "Find fixed star conjunctions with natal planets.",
    tag: "Western Advanced",
    requestExample: BIRTH_PAYLOAD,
    responseExample: JSON.stringify({ conjunctions: [{ star: "Aldebaran", planet: "Sun", orb: 0.8 }] }, null, 2),
  },
  {
    method: "POST",
    path: "/api/v1/western/arabic-parts",
    description: "Calculate Arabic Parts / Lots from natal positions.",
    tag: "Western Advanced",
    requestExample: BIRTH_PAYLOAD,
    responseExample: JSON.stringify({ parts: [{ name: "Part of Fortune", sign: "Aries", degree: 15.3 }] }, null, 2),
  },
  {
    method: "POST",
    path: "/api/v1/western/hellenistic/sect",
    description: "Hellenistic sect analysis (diurnal vs. nocturnal chart).",
    tag: "Techniques",
    requestExample: BIRTH_PAYLOAD,
    responseExample: JSON.stringify({ sect: "diurnal", sect_light: "Sun" }, null, 2),
  },
  {
    method: "POST",
    path: "/api/v1/western/hellenistic/profection",
    description: "Annual profections from the natal Ascendant.",
    tag: "Techniques",
    requestExample: BIRTH_PAYLOAD,
    responseExample: JSON.stringify({ current_house: 12, time_lord: "Jupiter" }, null, 2),
  },
  {
    method: "POST",
    path: "/api/v1/techniques/dignities",
    description: "Essential dignities table for all natal planets.",
    tag: "Techniques",
    requestExample: BIRTH_PAYLOAD,
    responseExample: JSON.stringify({ dignities: { Sun: { sign: "Gemini", dignity: "Peregrine" } } }, null, 2),
  },
  {
    method: "POST",
    path: "/api/v1/techniques/declinations",
    description: "Planetary declinations and parallel/contraparallel aspects.",
    tag: "Techniques",
    requestExample: BIRTH_PAYLOAD,
    responseExample: JSON.stringify({ declinations: { Sun: { declination: 23.1 } }, aspects: [] }, null, 2),
  },
  {
    method: "POST",
    path: "/api/v1/techniques/midpoints",
    description: "Midpoint trees and planetary pictures.",
    tag: "Techniques",
    requestExample: BIRTH_PAYLOAD,
    responseExample: JSON.stringify({ midpoints: [{ planet1: "Sun", planet2: "Moon", longitude: 150.5 }] }, null, 2),
  },
  {
    method: "POST",
    path: "/api/v1/techniques/sabian-symbols",
    description: "Sabian degree symbols for each planet position.",
    tag: "Techniques",
    requestExample: BIRTH_PAYLOAD,
    responseExample: JSON.stringify({ symbols: [{ planet: "Sun", sign: "Gemini", degree: 25, symbol: "A gardener..." }] }, null, 2),
  },

  // Personality
  {
    method: "POST",
    path: "/api/v1/personality/enneagram",
    description: "Enneagram type derivation from astrological profile.",
    tag: "Personality",
    requestExample: JSON.stringify({ mbti_type: "INTJ" }, null, 2),
    responseExample: JSON.stringify(
      { primary_type: 5, type_name: "The Investigator", wing: 4, tritype: "549" },
      null, 2,
    ),
  },
  {
    method: "POST",
    path: "/api/v1/personality/calculate",
    description: "Full personality synthesis combining multiple frameworks.",
    tag: "Personality",
    requestExample: JSON.stringify({ mbti_type: "INTJ" }, null, 2),
    responseExample: JSON.stringify(
      { dominant_function: "Ni", auxiliary_function: "Te", personality_state: {} },
      null, 2,
    ),
  },
  {
    method: "POST",
    path: "/api/v1/personality/biorhythm",
    description: "Biorhythm cycles (physical, emotional, intellectual).",
    tag: "Personality",
    requestExample: JSON.stringify({ birth_date: "1990-06-15", target_date: "2026-04-17" }, null, 2),
    responseExample: JSON.stringify(
      { physical: { value: 0.72, day: 8 }, emotional: { value: -0.34, day: 14 } },
      null, 2,
    ),
  },
  {
    method: "POST",
    path: "/api/v1/psychology/jungian-archetypes",
    description: "Jungian archetype analysis from Sun/Moon/Ascendant signs.",
    tag: "Personality",
    requestExample: JSON.stringify({ sun_sign: "Gemini", moon_sign: "Scorpio", ascendant: "Virgo" }, null, 2),
    responseExample: JSON.stringify(
      { primary: "The Alchemist", shadow: "The Trickster", scores: {} },
      null, 2,
    ),
  },

  // Oracle
  {
    method: "POST",
    path: "/api/v1/llm/sessions",
    description: "Create a new Oracle AI chat session.",
    tag: "Oracle",
    requestExample: JSON.stringify({ system_prompt: "You are a cosmic advisor..." }, null, 2),
    responseExample: JSON.stringify({ session_id: "sess_abc123" }, null, 2),
  },
  {
    method: "POST",
    path: "/api/v1/llm/sessions/{session_id}/messages",
    description: "Send a message to an Oracle session and get a response.",
    tag: "Oracle",
    requestExample: JSON.stringify({ role: "user", content: "What does my Sun in Gemini mean?" }, null, 2),
    responseExample: JSON.stringify(
      { role: "assistant", content: "Your Gemini Sun suggests a quick, adaptable mind..." },
      null, 2,
    ),
  },

  // Explore
  {
    method: "POST",
    path: "/api/v1/chinese/iching/cast",
    description: "Cast an I Ching hexagram with an optional question.",
    tag: "Explore",
    requestExample: JSON.stringify({ question: "Should I take the new opportunity?" }, null, 2),
    responseExample: JSON.stringify(
      { hexagram_number: 42, name: "Yi (Increase)", judgment: "It furthers one to undertake something." },
      null, 2,
    ),
  },
  {
    method: "POST",
    path: "/api/v1/personality/tarot/birth-cards",
    description: "Calculate tarot birth cards from birth date.",
    tag: "Explore",
    requestExample: JSON.stringify({ birth_date: "1990-06-15" }, null, 2),
    responseExample: JSON.stringify(
      { birth_card: "The Lovers", personality_card: "The Devil", year_card: "The Tower" },
      null, 2,
    ),
  },
  {
    method: "GET",
    path: "/api/v1/space-weather/current",
    description: "Get current space weather conditions (solar wind, Kp index, flares).",
    tag: "Explore",
    responseExample: JSON.stringify(
      { kp_index: 3, solar_wind_speed: 450, flare_status: "None" },
      null, 2,
    ),
  },
  {
    method: "POST",
    path: "/api/v1/psychology/color-palette",
    description: "Generate a personal color palette from astrological signs.",
    tag: "Explore",
    requestExample: JSON.stringify({ sun_sign: "Gemini", moon_sign: "Scorpio", rising_sign: "Virgo" }, null, 2),
    responseExample: JSON.stringify(
      { primary_color: "#4A90D9", secondary_colors: ["#8B5CF6", "#10B981"] },
      null, 2,
    ),
  },
];

const METHOD_STYLES: Record<string, { bg: string; text: string }> = {
  GET: { bg: "bg-accent-emerald/15 border-accent-emerald/30", text: "text-accent-emerald" },
  POST: { bg: "bg-accent-blue/15 border-accent-blue/30", text: "text-accent-blue" },
  PUT: { bg: "bg-accent-amber/15 border-accent-amber/30", text: "text-accent-amber" },
  DELETE: { bg: "bg-accent-rose/15 border-accent-rose/30", text: "text-accent-rose" },
};

const TAGS = [...new Set(ENDPOINTS.map((e) => e.tag))];

// ---- Component --------------------------------------------------------------

export default function ApiDocsPage() {
  const [search, setSearch] = useState("");
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  const filtered = ENDPOINTS.filter(
    (ep) =>
      ep.path.toLowerCase().includes(search.toLowerCase()) ||
      ep.description.toLowerCase().includes(search.toLowerCase()) ||
      ep.tag.toLowerCase().includes(search.toLowerCase())
  );

  const groupedByTag = TAGS.map((tag) => ({
    tag,
    endpoints: filtered.filter((ep) => ep.tag === tag),
  })).filter((g) => g.endpoints.length > 0);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">API Documentation</h1>
        <p className="text-sm text-text-muted">
          Explore all available ENVI-OUS BRAIN API endpoints.{" "}
          <a
            href="https://envious-brain-api-uxgej3n6ta-uc.a.run.app/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue hover:underline"
          >
            View interactive Swagger docs &rarr;
          </a>
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search endpoints by path, description, or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xl"
        />
      </div>

      {/* Tag quick-nav */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TAGS.map((tag) => {
          const count = filtered.filter((e) => e.tag === tag).length;
          return (
            <button
              key={tag}
              onClick={() => {
                const el = document.getElementById(`tag-${tag}`);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
            >
              {tag}{" "}
              <span className="ml-1 text-text-muted">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Endpoint Groups */}
      <div className="space-y-6">
        {groupedByTag.map(({ tag, endpoints }) => (
          <div key={tag} id={`tag-${tag}`}>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">{tag}</h2>
            <div className="space-y-2">
              {endpoints.map((ep) => {
                const isExpanded = expandedPath === ep.path;
                const style = METHOD_STYLES[ep.method];

                return (
                  <div
                    key={`${ep.method}-${ep.path}`}
                    className="rounded-xl border border-border bg-card transition-colors hover:border-border-hover"
                  >
                    {/* Summary Row */}
                    <button
                      onClick={() =>
                        setExpandedPath(isExpanded ? null : ep.path)
                      }
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span
                        className={`inline-flex w-16 shrink-0 items-center justify-center rounded border px-2 py-0.5 text-xs font-bold ${style.bg} ${style.text}`}
                      >
                        {ep.method}
                      </span>
                      <code className="shrink-0 font-mono text-sm text-text-primary">
                        {ep.path}
                      </code>
                      <span className="ml-2 text-sm text-text-muted truncate">
                        {ep.description}
                      </span>
                      <span className="ml-auto shrink-0 text-text-muted">
                        {isExpanded ? "\u25B2" : "\u25BC"}
                      </span>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-border px-4 py-4">
                        <p className="mb-4 text-sm text-text-secondary">
                          {ep.description}
                        </p>

                        {ep.requestExample && (
                          <div className="mb-4">
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                              Request Body
                            </h4>
                            <pre className="overflow-x-auto rounded-lg bg-navy p-3 text-xs text-accent-emerald font-mono">
                              {ep.requestExample}
                            </pre>
                          </div>
                        )}

                        <div className="mb-4">
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                            Response
                          </h4>
                          <pre className="overflow-x-auto rounded-lg bg-navy p-3 text-xs text-accent-blue font-mono">
                            {ep.responseExample}
                          </pre>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/dashboard/developer/sandbox?method=${ep.method}&path=${encodeURIComponent(ep.path)}`;
                            }}
                          >
                            Try it in Sandbox
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {groupedByTag.length === 0 && (
        <Card>
          <div className="py-8 text-center">
            <p className="text-text-muted">No endpoints match your search.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
