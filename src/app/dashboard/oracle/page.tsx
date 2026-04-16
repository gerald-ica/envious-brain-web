"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useProfile } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  provider: Provider;
}

type Provider = "openai" | "anthropic" | "openrouter";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

const DEFAULT_WELCOME =
  "I am the Oracle, a 27-expert ensemble intelligence. Ask me about your charts, personality, transits, or any aspect of your cosmic blueprint.";

function buildWelcomeMessage(name?: string | null): string {
  if (!name) return DEFAULT_WELCOME;
  return `Welcome, ${name}. ${DEFAULT_WELCOME}`;
}

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  openrouter: "OpenRouter",
};

const PROVIDER_MODELS: Record<Provider, string> = {
  openai: "gpt-4o",
  anthropic: "claude-sonnet-4-20250514",
  openrouter: "meta-llama/llama-3.1-70b",
};

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
        <ul key={`list-${listKey}`} className="my-2 ml-4 space-y-1 list-disc text-text-secondary">
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
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
        <h4 key={`h-${i}`} className="mt-3 mb-1 text-sm font-bold text-accent-blue">
          {title}
        </h4>
      );
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-text-secondary">
        {renderInline(trimmed)}
      </p>
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
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="flex items-center gap-1">
        <span className="inline-block h-2 w-2 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="inline-block h-2 w-2 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="inline-block h-2 w-2 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-xs text-text-muted ml-2">Oracle is thinking...</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG Icons (inline to avoid deps)
// ---------------------------------------------------------------------------

function SendIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function PanelIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

function MessageIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function OracleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="22" />
      <line x1="2" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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

function formatSessionDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// Main Oracle Page Component
// ---------------------------------------------------------------------------

export default function OraclePage() {
  const { activeProfile } = useProfile();

  // -- Session state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>("anthropic");

  // -- UI state
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);

  // -- Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const providerDropdownRef = useRef<HTMLDivElement>(null);

  // -- Derived state
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];

  // -- Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // -- Close provider dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(e.target as Node)) {
        setProviderDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // -- Build birth data for API context
  const birthPayload = activeProfile
    ? {
        date: activeProfile.birthDate,
        time: activeProfile.birthTime,
        latitude: activeProfile.lat,
        longitude: activeProfile.lon,
        timezone: activeProfile.timezone,
      }
    : null;

  // -- Create new session
  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: generateId(),
      title: "New conversation",
      provider,
      createdAt: new Date(),
      messages: [
        {
          id: generateId(),
          role: "assistant",
          content: buildWelcomeMessage(activeProfile?.name),
          timestamp: new Date(),
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsTyping(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [provider, activeProfile]);

  // -- Delete session
  const deleteSession = useCallback(
    (sessionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
    },
    [activeSessionId]
  );

  // -- Call Oracle API
  const callOracleAPI = useCallback(
    async (
      conversationHistory: { role: string; content: string }[],
    ): Promise<string> => {
      const headers = getHeaders();

      const body: Record<string, unknown> = {
        messages: conversationHistory,
      };
      if (birthPayload) {
        body.context = { birth_data: birthPayload };
      }

      const res = await fetch(`${API_URL}/api/v1/oracle/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`API error ${res.status}: ${errBody}`);
      }

      const json = await res.json();
      return (
        json.response ??
        json.data?.response ??
        json.message ??
        json.content ??
        "I was unable to generate a response. Please try again."
      );
    },
    [birthPayload],
  );

  // -- Send message
  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    let sessionId = activeSessionId;

    // If no active session, create one
    if (!sessionId) {
      const newSession: ChatSession = {
        id: generateId(),
        title: text.length > 40 ? text.slice(0, 40) + "..." : text,
        provider,
        createdAt: new Date(),
        messages: [
          {
            id: generateId(),
            role: "assistant",
            content: buildWelcomeMessage(activeProfile?.name),
            timestamp: new Date(),
          },
        ],
      };
      sessionId = newSession.id;
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(sessionId);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const capturedSessionId = sessionId;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== capturedSessionId) return s;
        const updatedTitle =
          s.title === "New conversation"
            ? text.length > 40
              ? text.slice(0, 40) + "..."
              : text
            : s.title;
        return {
          ...s,
          title: updatedTitle,
          messages: [...s.messages, userMessage],
        };
      })
    );

    setInputValue("");
    setIsTyping(true);

    try {
      // Build conversation history for the API (excluding welcome, just role+content)
      const currentSession = sessions.find((s) => s.id === capturedSessionId);
      const history = [
        ...(currentSession?.messages ?? [])
          .filter((m) => m.role === "user" || (m.role === "assistant" && m.id !== currentSession?.messages[0]?.id))
          .map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: text },
      ];

      const responseText = await callOracleAPI(history);

      const oracleMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === capturedSessionId
            ? { ...s, messages: [...s.messages, oracleMessage] }
            : s
        )
      );
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`,
        timestamp: new Date(),
        error: true,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === capturedSessionId
            ? { ...s, messages: [...s.messages, errorMessage] }
            : s
        )
      );
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, activeSessionId, provider, sessions, callOracleAPI, activeProfile]);

  // -- Handle Enter key
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
    <div className="flex h-[calc(100vh-7.5rem)] -m-6 overflow-hidden">
      {/* ---- Session Sidebar ---- */}
      <div
        className={`flex flex-col border-r border-border bg-surface transition-all duration-200 ${
          sidebarOpen ? "w-72" : "w-0"
        } overflow-hidden`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-border p-3 shrink-0">
          <h2 className="text-sm font-semibold text-text-primary whitespace-nowrap">Chat History</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
            aria-label="Close sidebar"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        </div>

        {/* New chat button */}
        <div className="p-3 shrink-0">
          <Button
            variant="primary"
            className="w-full justify-center gap-2 text-xs"
            onClick={createNewSession}
          >
            <PlusIcon className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {sessions.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-text-muted">
              No conversations yet
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;

              return (
                <button
                  key={session.id}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setIsTyping(false);
                  }}
                  className={`group relative flex flex-col items-start rounded-lg px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? "bg-accent-blue/10 border border-accent-blue/20"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex w-full items-center gap-2">
                    <MessageIcon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-accent-blue" : "text-text-muted"}`} />
                    <span
                      className={`flex-1 truncate text-sm ${
                        isActive ? "text-accent-blue font-medium" : "text-text-secondary"
                      }`}
                    >
                      {session.title}
                    </span>
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="rounded p-0.5 opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-rose transition-all"
                      aria-label="Delete session"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="mt-1 ml-5.5 text-xs text-text-muted truncate w-full">
                    {formatSessionDate(session.createdAt)}
                    {" \u00b7 "}
                    {PROVIDER_LABELS[session.provider]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---- Main Chat Area ---- */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-border bg-surface/50 px-4 py-2.5 shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-md p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                aria-label="Open sidebar"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/15" style={{ boxShadow: "0 0 12px rgba(59, 130, 246, 0.15)" }}>
                <OracleIcon className="h-4.5 w-4.5 text-accent-blue" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <span>{"\u2728"}</span>
                  The Oracle
                </h1>
                <p className="text-xs text-text-muted">27-Expert Ensemble Intelligence</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Provider selector */}
            <div className="relative" ref={providerDropdownRef}>
              <button
                onClick={() => setProviderDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:border-border-hover hover:text-text-primary transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald" />
                {PROVIDER_LABELS[provider]}
                <span className="text-text-muted">{"\u25BE"}</span>
              </button>

              {providerDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-surface py-1 shadow-xl z-50">
                  {(Object.keys(PROVIDER_LABELS) as Provider[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setProvider(p);
                        setProviderDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors ${
                        provider === p
                          ? "bg-accent-blue/10 text-accent-blue"
                          : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                      }`}
                    >
                      <span>{PROVIDER_LABELS[p]}</span>
                      <span className="text-text-muted">{PROVIDER_MODELS[p]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Context panel toggle */}
            <button
              onClick={() => setContextPanelOpen((prev) => !prev)}
              className={`rounded-lg p-1.5 transition-colors ${
                contextPanelOpen
                  ? "bg-accent-blue/15 text-accent-blue"
                  : "text-text-muted hover:text-text-primary hover:bg-white/5"
              }`}
              aria-label="Toggle personality context panel"
              title="Personality Context"
            >
              <PanelIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat body -- flex row to accommodate optional right panel */}
        <div className="flex flex-1 min-h-0">
          {/* Messages area */}
          <div className="flex flex-1 flex-col min-w-0">
            <div className="flex-1 overflow-y-auto">
              {/* Empty state */}
              {!activeSession && (
                <div className="flex flex-col items-center justify-center h-full px-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-blue/10 mb-6" style={{ boxShadow: "0 0 24px rgba(59, 130, 246, 0.12)" }}>
                    <OracleIcon className="h-8 w-8 text-accent-blue" />
                  </div>
                  <h2 className="text-xl font-bold text-text-primary mb-2">
                    {activeProfile
                      ? `Welcome, ${activeProfile.name}`
                      : "The Oracle Awaits"}
                  </h2>
                  <p className="text-sm text-text-muted text-center max-w-md mb-8">
                    {DEFAULT_WELCOME}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 max-w-lg w-full">
                    {[
                      "What does my chart say about career?",
                      "Tell me about my relationship patterns",
                      "Give me a full reading for today",
                      "What are my key personality traits?",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInputValue(suggestion);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        className="rounded-xl border border-border bg-card/50 px-4 py-3 text-left text-sm text-text-secondary hover:border-accent-blue/30 hover:bg-card hover:text-text-primary transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {activeSession && (
                <div className="mx-auto max-w-3xl px-4 py-6">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-6 flex animate-fade-in ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Avatar (assistant only) */}
                      {msg.role === "assistant" && (
                        <div className="mr-3 mt-0.5 shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/15">
                            <OracleIcon className="h-4 w-4 text-accent-blue" />
                          </div>
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] ${
                          msg.role === "user" ? "order-1" : ""
                        }`}
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

                      {/* Avatar (user only) */}
                      {msg.role === "user" && (
                        <div className="ml-3 mt-0.5 shrink-0 order-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-purple/15">
                            <UserIcon className="h-4 w-4 text-accent-purple" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator while waiting for API */}
                  {isTyping && <TypingIndicator />}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* ---- Input Bar ---- */}
            <div className="shrink-0 border-t border-border bg-surface/80 backdrop-blur-sm p-4">
              <div className="mx-auto max-w-3xl">
                <div className="flex items-end gap-3 rounded-2xl border border-border bg-card p-2 focus-within:border-accent-blue/40 focus-within:ring-1 focus-within:ring-accent-blue/20 transition-all">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask the Oracle..."
                    rows={1}
                    disabled={isTyping}
                    className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
                    style={{ maxHeight: "160px" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-blue text-white transition-all hover:bg-accent-blue/90 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <SendIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Model indicator */}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-xs text-text-muted">
                    {PROVIDER_LABELS[provider]} / {PROVIDER_MODELS[provider]}
                  </span>
                  {activeProfile && (
                    <>
                      <span className="text-xs text-text-muted">{"\u00b7"}</span>
                      <span className="text-xs text-text-muted">
                        Context: {activeProfile.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---- Personality Context Panel (collapsible right side) ---- */}
          <div
            className={`border-l border-border bg-surface transition-all duration-200 overflow-hidden shrink-0 ${
              contextPanelOpen ? "w-72" : "w-0"
            }`}
          >
            <div className="w-72 h-full flex flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-border p-3 shrink-0">
                <h3 className="text-sm font-semibold text-text-primary whitespace-nowrap">
                  Personality Context
                </h3>
                <button
                  onClick={() => setContextPanelOpen(false)}
                  className="rounded-md p-1 text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                  aria-label="Close context panel"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Panel content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Active Profile */}
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Active Profile
                  </p>
                  <div className="rounded-lg bg-card border border-border p-3">
                    <p className="text-sm font-semibold text-text-primary">
                      {activeProfile?.name ?? "No profile"}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {activeProfile?.birthDate ?? "--"} at {activeProfile?.birthTime ?? "--"}
                    </p>
                    <p className="text-xs text-text-muted">
                      {activeProfile?.timezone ?? "--"}
                    </p>
                  </div>
                </div>

                {/* API Status */}
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Connection
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
                    <span className="text-xs text-text-secondary">Live API</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1 break-all">
                    {API_URL}
                  </p>
                </div>

                {/* Context note */}
                <div className="rounded-lg border border-accent-blue/20 bg-accent-blue/5 p-3">
                  <p className="text-xs text-accent-blue leading-relaxed">
                    Your birth data is included as context in every query. The Oracle uses your natal chart
                    and personality type to personalize every response.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
