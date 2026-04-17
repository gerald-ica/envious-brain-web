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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("envious_access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ---------------------------------------------------------------------------
// Markdown renderer (basic: bold, italic, lists, line breaks)
// ---------------------------------------------------------------------------

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listKey = 0;

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${listKey}`}
          className="my-2 ml-4 space-y-1 list-disc text-text-secondary"
        >
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
      if (match.index > lastIndex) {
        parts.push(str.slice(lastIndex, match.index));
      }
      if (match[2]) {
        parts.push(
          <strong
            key={match.index}
            className="font-semibold text-text-primary"
          >
            {match[2]}
          </strong>,
        );
      } else if (match[3]) {
        parts.push(
          <em key={match.index} className="italic text-accent-purple">
            {match[3]}
          </em>,
        );
      } else if (match[4]) {
        parts.push(
          <strong
            key={match.index}
            className="font-semibold text-text-primary"
          >
            {match[4]}
          </strong>,
        );
      } else if (match[5]) {
        parts.push(
          <em key={match.index} className="italic text-accent-purple">
            {match[5]}
          </em>,
        );
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < str.length) {
      parts.push(str.slice(lastIndex));
    }
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
      elements.push(
        <h4
          key={`h-${i}`}
          className="mt-3 mb-1 text-sm font-bold text-accent-blue"
        >
          {title}
        </h4>,
      );
      continue;
    }

    elements.push(
      <p
        key={`p-${i}`}
        className="text-sm leading-relaxed text-text-secondary"
      >
        {renderInline(trimmed)}
      </p>,
    );
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
        <span
          className="inline-block h-2 w-2 rounded-full bg-accent-purple animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="inline-block h-2 w-2 rounded-full bg-accent-purple animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="inline-block h-2 w-2 rounded-full bg-accent-purple animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="text-xs text-text-muted">
        The Oracle is consulting the stars...
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------

function SendIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
// Main Oracle Page
// ---------------------------------------------------------------------------

export default function OraclePage() {
  const { activeProfile } = useProfile();

  // -- Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [backendSessionId, setBackendSessionId] = useState<string | null>(
    null,
  );
  const [offline, setOffline] = useState(false);

  // -- Chart data for system prompt + offline fallback
  const [chartInfo, setChartInfo] = useState<{
    sunSign: string;
    moonSign: string;
    ascendant: string;
  } | null>(null);

  // -- Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // -- Scroll to bottom
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
        // Ascendant from houses (house 1)
        const houses = json?.houses as
          | Array<Record<string, unknown>>
          | undefined;
        const h1 = houses?.find(
          (h) => h.number === 1 || h.house === 1,
        );
        const asc =
          (h1?.sign as string) ??
          (json?.ascendant as string) ??
          "unknown";
        setChartInfo({
          sunSign: (sunData.sign as string) ?? "unknown",
          moonSign: (moonData.sign as string) ?? "unknown",
          ascendant: asc,
        });
      })
      .catch(() => {
        /* chart fetch optional */
      });
  }, [activeProfile]);

  // -- Initialize with Oracle intro
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: generateId(),
          role: "assistant",
          content: ORACLE_INTRO,
          timestamp: new Date(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -- Build system prompt with chart context
  const buildSystemPrompt = useCallback(() => {
    const base =
      "You are the Oracle, a cosmic intelligence that interprets astrological charts with mystical authority. You reference specific chart placements, use astrological terminology naturally, and speak with a warm but wise tone. You are not cheesy \u2014 you are insightful and direct.";
    if (!activeProfile) return base;
    const chart = chartInfo
      ? ` Their Sun is in ${chartInfo.sunSign}, Moon in ${chartInfo.moonSign}, Ascendant in ${chartInfo.ascendant}.`
      : "";
    return `${base} The querent was born on ${activeProfile.birthDate} at ${activeProfile.birthTime || "unknown time"} in ${activeProfile.city || "an unknown location"}.${chart} Provide insightful, personalized readings.`;
  }, [activeProfile, chartInfo]);

  // -- Offline fallback content
  const showOfflineFallback = useCallback(() => {
    const fallbackContent = chartInfo
      ? `I am currently in deep meditation. While I gather my cosmic sight, here are insights based on your natal chart:\n\n**Your Core Triad**\n- **Sun in ${chartInfo.sunSign}** \u2014 Your vital essence and conscious identity flow through the energy of ${chartInfo.sunSign}. This shapes how you express yourself and what you strive to become.\n- **Moon in ${chartInfo.moonSign}** \u2014 Your emotional landscape is colored by ${chartInfo.moonSign}. This reveals your instinctive reactions, deepest needs, and what makes you feel secure.\n- **Ascendant in ${chartInfo.ascendant}** \u2014 The face you show the world carries ${chartInfo.ascendant} energy. This is the lens through which others first perceive you.\n\nWhen I return from my meditation, I can offer deeper analysis of your transits, progressions, and the patterns unfolding in your chart. For now, contemplate how these three pillars interact within you.`
      : "I am currently in deep meditation, gathering my cosmic sight. The celestial energies are momentarily beyond my reach. Please return soon \u2014 the stars will speak again.";

    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: "assistant",
        content: fallbackContent,
        timestamp: new Date(),
      },
    ]);
  }, [chartInfo]);

  // -- Call Oracle API
  const callOracleAPI = useCallback(
    async (
      userText: string,
    ): Promise<{ text: string; sessionId?: string }> => {
      const headers = getHeaders();
      let sid = backendSessionId;

      // Create session if needed
      if (!sid) {
        const createRes = await fetch(`${API_URL}/api/v1/llm/sessions`, {
          method: "POST",
          headers,
          body: JSON.stringify({ system_prompt: buildSystemPrompt() }),
        });

        if (!createRes.ok) {
          if (createRes.status === 500) {
            return { text: "__OFFLINE__" };
          }
          throw new Error(`Session creation failed: ${createRes.status}`);
        }

        const createJson = await createRes.json();
        sid =
          (createJson.session_id as string) ??
          (createJson.data?.session_id as string);
        if (!sid) {
          return { text: "__OFFLINE__" };
        }
        setBackendSessionId(sid);
      }

      // Send message
      const msgRes = await fetch(
        `${API_URL}/api/v1/llm/sessions/${sid}/messages`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ role: "user", content: userText }),
        },
      );

      if (!msgRes.ok) {
        if (msgRes.status === 500) {
          return { text: "__OFFLINE__", sessionId: sid };
        }
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

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      try {
        const result = await callOracleAPI(content);

        if (result.text === "__OFFLINE__") {
          setOffline(true);
          showOfflineFallback();
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              role: "assistant",
              content: result.text,
              timestamp: new Date(),
            },
          ]);
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "assistant",
            content: `A disturbance in the cosmic field prevented my response: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`,
            timestamp: new Date(),
            error: true,
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [inputValue, isTyping, callOracleAPI, showOfflineFallback],
  );

  // -- New chat
  const handleNewChat = useCallback(() => {
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: ORACLE_INTRO,
        timestamp: new Date(),
      },
    ]);
    setBackendSessionId(null);
    setOffline(false);
    setInputValue("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // -- Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // -- Auto-resize textarea
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
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between border-b border-border bg-surface/50 px-6 py-3 shrink-0 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple/15"
            style={{
              boxShadow: "0 0 16px rgba(168, 85, 247, 0.15)",
            }}
          >
            <span className="text-lg text-accent-purple">{"\u2726"}</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              The Oracle
              {offline && (
                <Badge variant="degraded">Offline</Badge>
              )}
              {!offline && backendSessionId && (
                <Badge variant="healthy">Live</Badge>
              )}
            </h1>
            <p className="text-xs text-text-muted">
              {activeProfile
                ? `Reading for ${activeProfile.name}`
                : "Cosmic Intelligence"}
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          className="text-xs gap-2"
          onClick={handleNewChat}
        >
          New Chat
        </Button>
      </div>

      {/* ---- Messages ---- */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-5 flex animate-fade-in ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Oracle avatar */}
              {msg.role === "assistant" && (
                <div className="mr-3 mt-0.5 shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-purple/15">
                    <span className="text-sm text-accent-purple">
                      {"\u2726"}
                    </span>
                  </div>
                </div>
              )}

              <div
                className={`max-w-[85%] ${msg.role === "user" ? "order-1" : ""}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-accent-blue text-white rounded-br-md"
                      : msg.error
                        ? "bg-accent-rose/10 border border-accent-rose/20 rounded-bl-md"
                        : "bg-card border border-border rounded-bl-md"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <div>{renderMarkdown(msg.content)}</div>
                  )}
                </div>
                <p
                  className={`mt-1 text-xs text-text-muted ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {formatTimestamp(msg.timestamp)}
                </p>
              </div>

              {/* User avatar */}
              {msg.role === "user" && (
                <div className="ml-3 mt-0.5 shrink-0 order-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/15">
                    <span className="text-sm text-accent-blue">
                      {activeProfile?.name?.[0]?.toUpperCase() ?? "U"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ---- Offline Chart Card ---- */}
      {offline && chartInfo && !activeProfile && (
        <div className="mx-auto max-w-3xl w-full px-4 pb-4">
          <Card title="Your Natal Snapshot" glow="purple">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Sun</span>
                <span className="text-text-primary font-medium">
                  {chartInfo.sunSign}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Moon</span>
                <span className="text-text-primary font-medium">
                  {chartInfo.moonSign}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Ascendant</span>
                <span className="text-text-primary font-medium">
                  {chartInfo.ascendant}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ---- Input Area ---- */}
      <div className="shrink-0 border-t border-border bg-surface/80 backdrop-blur-sm px-4 pb-4 pt-3">
        <div className="mx-auto max-w-3xl">
          {/* Suggested prompt chips */}
          {!offline && (
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
          )}

          {/* Input bar */}
          <div className="flex items-end gap-3 rounded-2xl border border-border bg-card p-2 focus-within:border-accent-purple/40 focus-within:ring-1 focus-within:ring-accent-purple/20 transition-all">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                offline
                  ? "The Oracle is in deep meditation..."
                  : "Ask the Oracle..."
              }
              rows={1}
              disabled={isTyping || offline}
              className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
              style={{ maxHeight: "160px" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isTyping || offline}
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
                {chartInfo
                  ? ` \u00b7 ${chartInfo.sunSign} Sun \u00b7 ${chartInfo.moonSign} Moon \u00b7 ${chartInfo.ascendant} Rising`
                  : ""}
              </span>
            )}
            {!activeProfile && (
              <span className="text-xs text-text-muted">
                <Link
                  href="/dashboard/settings"
                  className="text-accent-purple hover:underline"
                >
                  Add a birth profile
                </Link>{" "}
                for personalized readings
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
