"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface ChartInfo {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  positions?: Record<string, Record<string, unknown>>;
}

interface OfflineData {
  dominant_traits?: string[];
  shadow_traits?: string[];
  current_mood?: string;
  energy_level?: string | number;
  cognitive_style?: string;
  dominant_theme?: string;
  theme_scores?: Record<string, number>;
  primary_archetype?: string;
  secondary_archetype?: string;
  shadow_archetype?: string;
  biorhythm?: { physical: number; emotional: number; intellectual: number };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-662458014068.us-central1.run.app";

const ORACLE_INTRO =
  "I am the Oracle. I see the patterns of the cosmos reflected in your chart. Ask me about your transits, your path, your relationships, or the timing of events \u2014 and I will illuminate what the stars reveal.";

const SUGGESTED_PROMPTS = [
  "What do my transits say today?",
  "Tell me about my career path",
  "What's my love compatibility?",
  "What should I focus on this month?",
  "Explain my natal chart",
  "What are my strengths and weaknesses?",
];

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("envious_access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ---------------------------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------------------------

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listKey = 0;

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey}`} className="my-2 ml-4 space-y-1 list-disc text-text-secondary">
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      listItems = [];
      listKey++;
    }
  }

  function renderInline(str: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__|_(.+?)_)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) parts.push(str.slice(lastIndex, match.index));
      if (match[2]) {
        parts.push(<strong key={match.index} className="font-semibold text-text-primary">{match[2]}</strong>);
      } else if (match[3]) {
        parts.push(<em key={match.index} className="italic text-accent-purple">{match[3]}</em>);
      } else if (match[4]) {
        parts.push(<strong key={match.index} className="font-semibold text-text-primary">{match[4]}</strong>);
      } else if (match[5]) {
        parts.push(<em key={match.index} className="italic text-accent-purple">{match[5]}</em>);
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < str.length) parts.push(str.slice(lastIndex));
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^[-*]\s+/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-*]\s+/, ""));
      continue;
    }
    flushList();

    if (trimmed === "") {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      const title = trimmed.replace(/^\*\*/, "").replace(/\*\*$/, "");
      elements.push(<h4 key={`h-${i}`} className="mt-3 mb-1 text-sm font-bold text-accent-blue">{title}</h4>);
      continue;
    }
    elements.push(<p key={`p-${i}`} className="text-sm leading-relaxed text-text-secondary">{renderInline(trimmed)}</p>);
  }
  flushList();
  return elements;
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex items-center gap-1">
        <span className="inline-block h-2 w-2 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="inline-block h-2 w-2 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="inline-block h-2 w-2 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-xs text-text-muted">The Oracle is consulting the stars...</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------

function SendIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ---------------------------------------------------------------------------
// Offline reading generators
// ---------------------------------------------------------------------------

function generateInitialReading(chart: ChartInfo, offlineData: OfflineData): string {
  const lines: string[] = [];

  lines.push("**Your Cosmic Reading**");
  lines.push("");
  lines.push(`Your chart speaks with clarity. With your **Sun in ${chart.sunSign}**, your vital essence flows through ${chart.sunSign} energy \u2014 shaping how you express yourself in the world.`);
  lines.push("");

  if (chart.moonSign !== "unknown") {
    lines.push(`Your **Moon in ${chart.moonSign}** colors your emotional landscape. This reveals your instinctive reactions, deepest needs, and what makes you feel secure.`);
    lines.push("");
  }

  if (chart.ascendant !== "unknown") {
    lines.push(`With **${chart.ascendant} Rising**, the face you show the world carries ${chart.ascendant} energy \u2014 the lens through which others first perceive you.`);
    lines.push("");
  }

  if (offlineData.dominant_traits && offlineData.dominant_traits.length > 0) {
    lines.push("**Your Dominant Traits**");
    lines.push(`The cosmos has endowed you with: *${offlineData.dominant_traits.join("*, *")}*. These are the qualities that shine most brightly in your chart.`);
    lines.push("");
  }

  if (offlineData.shadow_traits && offlineData.shadow_traits.length > 0) {
    lines.push("**Shadow Aspects**");
    lines.push(`Your shadow self carries: *${offlineData.shadow_traits.join("*, *")}*. These are not weaknesses \u2014 they are undeveloped strengths waiting to be integrated.`);
    lines.push("");
  }

  if (offlineData.current_mood) {
    lines.push(`**Current Cosmic Mood:** ${offlineData.current_mood}`);
  }

  if (offlineData.energy_level != null) {
    lines.push(`**Energy Level:** ${offlineData.energy_level}`);
  }

  if (offlineData.cognitive_style) {
    lines.push(`**Cognitive Style:** ${offlineData.cognitive_style}`);
    lines.push("");
  }

  if (offlineData.dominant_theme) {
    lines.push(`**Life Theme:** The dominant theme in your life right now is *${offlineData.dominant_theme}*. The cosmos is steering you toward this area of growth.`);
    lines.push("");
  }

  if (offlineData.primary_archetype) {
    lines.push("**Your Archetypes**");
    let archLine = `Your primary archetype is the *${offlineData.primary_archetype}*`;
    if (offlineData.secondary_archetype) archLine += `, supported by the *${offlineData.secondary_archetype}*`;
    if (offlineData.shadow_archetype) archLine += `. Your shadow archetype, the *${offlineData.shadow_archetype}*, holds lessons yet to be learned`;
    lines.push(archLine + ".");
    lines.push("");
  }

  lines.push("Ask me about specific areas of your life \u2014 career, love, timing, strengths \u2014 and I will consult the chart more deeply.");

  return lines.join("\n");
}

function generateFollowUpReading(question: string, chart: ChartInfo, offlineData: OfflineData): string {
  const q = question.toLowerCase();
  const lines: string[] = [];

  if (q.includes("career") || q.includes("work") || q.includes("job") || q.includes("profession")) {
    lines.push("**Career & Vocation**");
    lines.push("");
    lines.push(`With your **Sun in ${chart.sunSign}**, your career expression is best suited to roles that allow ${chart.sunSign} qualities to flourish.`);
    if (chart.ascendant !== "unknown") {
      lines.push(`Your **${chart.ascendant} Rising** means others perceive you as someone who brings ${chart.ascendant} energy to the workplace.`);
    }
    if (offlineData.dominant_traits && offlineData.dominant_traits.length > 0) {
      lines.push(`Your dominant traits \u2014 *${offlineData.dominant_traits.slice(0, 3).join("*, *")}* \u2014 are your career superpowers.`);
    }
    if (offlineData.cognitive_style) {
      lines.push(`Your cognitive style is *${offlineData.cognitive_style}*, which means you process information and make decisions in a distinctive way. Lean into this.`);
    }
  } else if (q.includes("love") || q.includes("relationship") || q.includes("compatibility") || q.includes("partner")) {
    lines.push("**Love & Relationships**");
    lines.push("");
    lines.push(`Your **Moon in ${chart.moonSign}** is the key to understanding your emotional needs in relationships. You need a partner who can meet your ${chart.moonSign} nature.`);
    if (chart.ascendant !== "unknown") {
      lines.push(`With **${chart.ascendant} Rising**, you attract partners who are drawn to your ${chart.ascendant} presentation.`);
    }
    if (offlineData.shadow_traits && offlineData.shadow_traits.length > 0) {
      lines.push(`In relationships, your shadow aspects (*${offlineData.shadow_traits.slice(0, 2).join("*, *")}*) may surface. Awareness of these patterns is the first step to transformation.`);
    }
  } else if (q.includes("transit") || q.includes("today") || q.includes("month") || q.includes("timing") || q.includes("when")) {
    lines.push("**Timing & Transits**");
    lines.push("");
    if (offlineData.biorhythm) {
      const bio = offlineData.biorhythm;
      lines.push("Your biorhythm cycles reveal the current energy landscape:");
      lines.push(`- **Physical:** ${bio.physical > 0 ? "+" : ""}${bio.physical}% \u2014 ${bio.physical > 30 ? "Strong vitality" : bio.physical > 0 ? "Moderate energy" : "Rest and recharge"}`);
      lines.push(`- **Emotional:** ${bio.emotional > 0 ? "+" : ""}${bio.emotional}% \u2014 ${bio.emotional > 30 ? "Emotionally open" : bio.emotional > 0 ? "Steady feelings" : "Protect your energy"}`);
      lines.push(`- **Intellectual:** ${bio.intellectual > 0 ? "+" : ""}${bio.intellectual}% \u2014 ${bio.intellectual > 30 ? "Sharp mind, great for decisions" : bio.intellectual > 0 ? "Clear thinking" : "Not the time for major decisions"}`);
    }
    if (offlineData.current_mood) {
      lines.push("");
      lines.push(`The cosmic mood right now is *${offlineData.current_mood}*. Work with this energy, not against it.`);
    }
  } else if (q.includes("strength") || q.includes("weakness") || q.includes("talent")) {
    lines.push("**Strengths & Growth Areas**");
    lines.push("");
    if (offlineData.dominant_traits && offlineData.dominant_traits.length > 0) {
      lines.push("**Your Core Strengths:**");
      offlineData.dominant_traits.forEach((t) => lines.push(`- *${t}*`));
      lines.push("");
    }
    if (offlineData.shadow_traits && offlineData.shadow_traits.length > 0) {
      lines.push("**Areas for Growth:**");
      offlineData.shadow_traits.forEach((t) => lines.push(`- *${t}*`));
      lines.push("");
    }
    if (offlineData.primary_archetype) {
      lines.push(`As the *${offlineData.primary_archetype}*, you carry a unique gift. Your challenge is to integrate your shadow archetype, the *${offlineData.shadow_archetype ?? "Unknown"}*, to become whole.`);
    }
  } else if (q.includes("chart") || q.includes("natal") || q.includes("birth")) {
    lines.push("**Your Natal Chart Overview**");
    lines.push("");
    lines.push(`- **Sun in ${chart.sunSign}** \u2014 Your core identity and life purpose`);
    lines.push(`- **Moon in ${chart.moonSign}** \u2014 Your emotional needs and instincts`);
    if (chart.ascendant !== "unknown") {
      lines.push(`- **${chart.ascendant} Rising** \u2014 Your outward persona and first impressions`);
    }
    if (offlineData.dominant_theme) {
      lines.push("");
      lines.push(`The dominant cosmic theme in your chart is *${offlineData.dominant_theme}*. This is the thread that runs through all areas of your life.`);
    }
    if (offlineData.theme_scores && Object.keys(offlineData.theme_scores).length > 0) {
      lines.push("");
      lines.push("**Theme Distribution:**");
      Object.entries(offlineData.theme_scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([theme, score]) => {
          lines.push(`- ${theme.replace(/_/g, " ")}: ${typeof score === "number" ? Math.round(score * 100) : score}%`);
        });
    }
  } else {
    // Generic response
    lines.push(`**Cosmic Insight**`);
    lines.push("");
    lines.push(`Your question touches on the deeper patterns in your chart. With **${chart.sunSign}** as your guiding light and **${chart.moonSign}** as your emotional compass, you carry a unique perspective.`);
    if (offlineData.dominant_traits && offlineData.dominant_traits.length > 0) {
      lines.push(`Your greatest assets are *${offlineData.dominant_traits.slice(0, 3).join("*, *")}*. Trust these qualities as you navigate this question.`);
    }
    if (offlineData.current_mood) {
      lines.push(`The current cosmic energy is *${offlineData.current_mood}* \u2014 consider how this influences your perspective.`);
    }
    lines.push("");
    lines.push("Try asking me about specific topics: career, love, timing, strengths, or your natal chart for a deeper reading.");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main Oracle Page
// ---------------------------------------------------------------------------

export default function OraclePage() {
  const { activeProfile } = useProfile();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [backendSessionId, setBackendSessionId] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const [chartInfo, setChartInfo] = useState<ChartInfo | null>(null);
  const [offlineData, setOfflineData] = useState<OfflineData>({});
  const [offlineDataFetched, setOfflineDataFetched] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // -- Fetch chart data for context
  useEffect(() => {
    if (!activeProfile) return;
    const headers = getHeaders();
    fetch(`${API_URL}/api/v1/charts/western`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        datetime: `${activeProfile.birthDate}T${activeProfile.birthTime || "12:00"}:00`,
        latitude: activeProfile.lat,
        longitude: activeProfile.lon,
        timezone: activeProfile.timezone || "UTC",
      }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        const positions = json?.positions ?? {};
        const sunData = positions["Sun"] ?? {};
        const moonData = positions["Moon"] ?? {};
        const houses = json?.houses as Array<Record<string, unknown>> | undefined;
        const h1 = houses?.find((h) => h.number === 1 || h.house === 1);
        const asc = (h1?.sign as string) ?? (json?.ascendant as string) ?? "unknown";
        setChartInfo({
          sunSign: (sunData.sign as string) ?? "unknown",
          moonSign: (moonData.sign as string) ?? "unknown",
          ascendant: asc,
          positions,
        });
      })
      .catch(() => { /* chart fetch optional */ });
  }, [activeProfile]);

  // -- Initialize with Oracle intro
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: generateId(),
        role: "assistant",
        content: ORACLE_INTRO,
        timestamp: new Date(),
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -- Build system prompt
  const buildSystemPrompt = useCallback(() => {
    const base = "You are the Oracle, a cosmic intelligence that interprets astrological charts with mystical authority. You reference specific chart placements, use astrological terminology naturally, and speak with a warm but wise tone. You are not cheesy \u2014 you are insightful and direct.";
    if (!activeProfile) return base;
    const chart = chartInfo
      ? ` Their Sun is in ${chartInfo.sunSign}, Moon in ${chartInfo.moonSign}, Ascendant in ${chartInfo.ascendant}.`
      : "";
    return `${base} The querent was born on ${activeProfile.birthDate} at ${activeProfile.birthTime || "unknown time"} in ${activeProfile.city || "an unknown location"}.${chart} Provide insightful, personalized readings.`;
  }, [activeProfile, chartInfo]);

  // -- Fetch offline data from multiple endpoints
  const fetchOfflineData = useCallback(async () => {
    if (!activeProfile || offlineDataFetched) return;
    setOfflineDataFetched(true);
    const headers = getHeaders();
    const birthPayload = {
      datetime: `${activeProfile.birthDate}T${activeProfile.birthTime || "12:00"}:00`,
      latitude: activeProfile.lat,
      longitude: activeProfile.lon,
    };
    const today = new Date().toISOString().split("T")[0];

    const [dynRes, convRes, archRes, bioRes] = await Promise.allSettled([
      fetch(`${API_URL}/api/v1/integration/dynamic-personality`, {
        method: "POST", headers,
        body: JSON.stringify({
          birth_data: {
            birth_datetime: birthPayload.datetime,
            latitude: birthPayload.latitude,
            longitude: birthPayload.longitude,
          },
          target_datetime: new Date().toISOString(),
        }),
      }),
      fetch(`${API_URL}/api/v1/personality/cosmic-convergence`, {
        method: "POST", headers,
        body: JSON.stringify(birthPayload),
      }),
      chartInfo?.sunSign
        ? fetch(`${API_URL}/api/v1/psychology/jungian-archetypes`, {
            method: "POST", headers,
            body: JSON.stringify({
              sun_sign: chartInfo.sunSign,
              moon_sign: chartInfo.moonSign,
              ascendant: chartInfo.ascendant,
            }),
          })
        : Promise.reject(new Error("No chart")),
      fetch(`${API_URL}/api/v1/personality/biorhythm`, {
        method: "POST", headers,
        body: JSON.stringify({
          birth_date: activeProfile.birthDate,
          target_date: today,
        }),
      }),
    ]);

    const result: OfflineData = {};

    if (dynRes.status === "fulfilled" && dynRes.value.ok) {
      try {
        const json = await dynRes.value.json();
        const d = json.data ?? json;
        result.dominant_traits = d.dominant_traits;
        result.shadow_traits = d.shadow_traits;
        result.current_mood = d.current_mood;
        result.energy_level = d.energy_level;
        result.cognitive_style = d.cognitive_style;
      } catch { /* skip */ }
    }

    if (convRes.status === "fulfilled" && convRes.value.ok) {
      try {
        const json = await convRes.value.json();
        const d = json.data ?? json;
        result.dominant_theme = d.dominant_theme;
        result.theme_scores = d.theme_scores;
      } catch { /* skip */ }
    }

    if (archRes.status === "fulfilled" && archRes.value.ok) {
      try {
        const json = await archRes.value.json();
        const d = json.data ?? json;
        result.primary_archetype = d.primary_archetype ?? d.primary;
        result.secondary_archetype = d.secondary_archetype ?? d.secondary;
        result.shadow_archetype = d.shadow_archetype ?? d.shadow;
      } catch { /* skip */ }
    }

    if (bioRes.status === "fulfilled" && bioRes.value.ok) {
      try {
        const json = await bioRes.value.json();
        const d = json.data ?? json.result ?? json;
        const bio = d.biorhythm ?? d.cycles ?? d;
        result.biorhythm = {
          physical: Math.round(bio.physical?.value ?? bio.physical ?? 0),
          emotional: Math.round(bio.emotional?.value ?? bio.emotional ?? 0),
          intellectual: Math.round(bio.intellectual?.value ?? bio.intellectual ?? 0),
        };
      } catch { /* skip */ }
    }

    setOfflineData(result);
    return result;
  }, [activeProfile, chartInfo, offlineDataFetched]);

  // -- Enter offline mode with rich reading
  const enterOfflineMode = useCallback(async () => {
    setOffline(true);
    const data = await fetchOfflineData();
    const chart = chartInfo ?? { sunSign: "unknown", moonSign: "unknown", ascendant: "unknown" };
    const reading = generateInitialReading(chart, data ?? offlineData);

    setMessages((prev) => [...prev, {
      id: generateId(),
      role: "assistant",
      content: reading,
      timestamp: new Date(),
    }]);
  }, [chartInfo, offlineData, fetchOfflineData]);

  // -- Generate offline follow-up
  const generateOfflineResponse = useCallback(async (question: string) => {
    // Ensure we have offline data
    if (!offlineDataFetched) {
      await fetchOfflineData();
    }
    const chart = chartInfo ?? { sunSign: "unknown", moonSign: "unknown", ascendant: "unknown" };
    return generateFollowUpReading(question, chart, offlineData);
  }, [chartInfo, offlineData, offlineDataFetched, fetchOfflineData]);

  // -- Call Oracle API
  const callOracleAPI = useCallback(
    async (userText: string): Promise<{ text: string; sessionId?: string }> => {
      const headers = getHeaders();
      let sid = backendSessionId;

      if (!sid) {
        const createRes = await fetch(`${API_URL}/api/v1/llm/sessions`, {
          method: "POST", headers,
          body: JSON.stringify({ system_prompt: buildSystemPrompt() }),
        });
        if (!createRes.ok) {
          return { text: "__OFFLINE__" };
        }
        const createJson = await createRes.json();
        sid = (createJson.session_id as string) ?? (createJson.data?.session_id as string);
        if (!sid) return { text: "__OFFLINE__" };
        setBackendSessionId(sid);
      }

      const msgRes = await fetch(`${API_URL}/api/v1/llm/sessions/${sid}/complete`, {
        method: "POST", headers,
        body: JSON.stringify({ role: "user", content: userText }),
      });

      if (!msgRes.ok) {
        if (msgRes.status === 500) return { text: "__OFFLINE__", sessionId: sid };
        throw new Error(`API error: ${msgRes.status}`);
      }

      const msgJson = await msgRes.json();
      const responseText =
        (msgJson.content as string) ??
        (msgJson.data?.content as string) ??
        (msgJson.response as string) ??
        (msgJson.data?.response as string) ??
        (msgJson.message as string) ??
        "The stars are silent on this matter. Please rephrase your question.";

      return { text: responseText, sessionId: sid };
    },
    [backendSessionId, buildSystemPrompt],
  );

  // -- Send message
  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? inputValue).trim();
      if (!content || isTyping) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsTyping(true);

      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      try {
        if (offline) {
          // In offline mode, generate response from chart data
          const response = await generateOfflineResponse(content);
          setMessages((prev) => [...prev, {
            id: generateId(),
            role: "assistant",
            content: response,
            timestamp: new Date(),
          }]);
        } else {
          const result = await callOracleAPI(content);
          if (result.text === "__OFFLINE__") {
            await enterOfflineMode();
          } else {
            setMessages((prev) => [...prev, {
              id: generateId(),
              role: "assistant",
              content: result.text,
              timestamp: new Date(),
            }]);
          }
        }
      } catch (err) {
        setMessages((prev) => [...prev, {
          id: generateId(),
          role: "assistant",
          content: `A disturbance in the cosmic field prevented my response: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`,
          timestamp: new Date(),
          error: true,
        }]);
      } finally {
        setIsTyping(false);
      }
    },
    [inputValue, isTyping, offline, callOracleAPI, enterOfflineMode, generateOfflineResponse],
  );

  // -- New chat
  const handleNewChat = useCallback(() => {
    setMessages([{
      id: generateId(),
      role: "assistant",
      content: ORACLE_INTRO,
      timestamp: new Date(),
    }]);
    setBackendSessionId(null);
    setOffline(false);
    setOfflineDataFetched(false);
    setInputValue("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="flex h-[calc(100vh-7.5rem)] -m-6 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface/50 px-6 py-3 shrink-0 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple/15"
            style={{ boxShadow: "0 0 16px rgba(168, 85, 247, 0.15)" }}
          >
            <span className="text-lg text-accent-purple">{"\u2726"}</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              The Oracle
              {offline && <Badge variant="degraded">Chart-Based</Badge>}
              {!offline && backendSessionId && <Badge variant="healthy">Live</Badge>}
            </h1>
            <p className="text-xs text-text-muted">
              {activeProfile ? `Reading for ${activeProfile.name}` : "Cosmic Intelligence"}
            </p>
          </div>
        </div>
        <Button variant="secondary" className="text-xs gap-2" onClick={handleNewChat}>New Chat</Button>
      </div>

      {/* Offline banner */}
      {offline && (
        <div className="border-b border-amber-500/20 bg-amber-500/5 px-6 py-2 text-center">
          <span className="text-xs text-amber-600 dark:text-amber-400">
            Oracle AI is being configured. Showing chart-based insights from your natal data.
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`mb-5 flex animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="mr-3 mt-0.5 shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-purple/15">
                    <span className="text-sm text-accent-purple">{"\u2726"}</span>
                  </div>
                </div>
              )}
              <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : ""}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-accent-blue text-white rounded-br-md"
                    : msg.error
                      ? "bg-accent-rose/10 border border-accent-rose/20 rounded-bl-md"
                      : "bg-card border border-border rounded-bl-md"
                }`}>
                  {msg.role === "user" ? (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <div>{renderMarkdown(msg.content)}</div>
                  )}
                </div>
                <p className={`mt-1 text-xs text-text-muted ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  {formatTimestamp(msg.timestamp)}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="ml-3 mt-0.5 shrink-0 order-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/15">
                    <span className="text-sm text-accent-blue">{activeProfile?.name?.[0]?.toUpperCase() ?? "U"}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Offline chart snapshot */}
      {offline && chartInfo && (
        <div className="mx-auto max-w-3xl w-full px-4 pb-3">
          <Card title="Your Natal Snapshot" glow="purple">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Sun</span>
                <Badge variant="info">{chartInfo.sunSign}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Moon</span>
                <Badge variant="info">{chartInfo.moonSign}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Rising</span>
                <Badge variant="info">{chartInfo.ascendant}</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Input Area */}
      <div className="shrink-0 border-t border-border bg-surface/80 backdrop-blur-sm px-4 pb-4 pt-3">
        <div className="mx-auto max-w-3xl">
          {/* Suggested prompts */}
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={isTyping}
                className="rounded-full border border-border bg-card/50 px-3 py-1.5 text-xs text-text-secondary hover:border-accent-purple/30 hover:bg-card hover:text-text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div className="flex items-end gap-3 rounded-2xl border border-border bg-card p-2 focus-within:border-accent-purple/40 focus-within:ring-1 focus-within:ring-accent-purple/20 transition-all">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={offline ? "Ask about your chart, career, love, timing..." : "Ask the Oracle..."}
              rows={1}
              disabled={isTyping}
              className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
              style={{ maxHeight: "160px" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-purple text-white transition-all hover:bg-accent-purple/90 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Context indicator */}
          <div className="mt-2 flex items-center justify-center gap-2">
            {activeProfile && (
              <span className="text-xs text-text-muted">
                Context: {activeProfile.name}
                {chartInfo ? ` \u00b7 ${chartInfo.sunSign} Sun \u00b7 ${chartInfo.moonSign} Moon \u00b7 ${chartInfo.ascendant} Rising` : ""}
              </span>
            )}
            {!activeProfile && (
              <span className="text-xs text-text-muted">
                <Link href="/dashboard/settings" className="text-accent-purple hover:underline">Add a birth profile</Link> for personalized readings
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
