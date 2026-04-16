// ---------------------------------------------------------------------------
// ENVI-OUS BRAIN API Client
// Typed fetch wrapper for the backend at Cloud Run
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

// ---- Error types ----------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: unknown,
  ) {
    super(`API ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

// ---- Shared response envelope ---------------------------------------------

export interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

// ---- Core fetch wrapper ---------------------------------------------------

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  // Attach API key when available (client-side only)
  if (typeof window !== "undefined") {
    const key = localStorage.getItem("envious_api_key");
    if (key) headers["X-API-Key"] = key;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new ApiError(res.status, res.statusText, body);
  }

  const data = (await res.json()) as T;
  return { data, status: res.status, ok: true };
}

// ---- HTTP method helpers --------------------------------------------------

function get<T>(path: string, init?: RequestInit) {
  return apiFetch<T>(path, { ...init, method: "GET" });
}

function post<T>(path: string, body?: unknown, init?: RequestInit) {
  return apiFetch<T>(path, {
    ...init,
    method: "POST",
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

function put<T>(path: string, body?: unknown, init?: RequestInit) {
  return apiFetch<T>(path, {
    ...init,
    method: "PUT",
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

function del<T>(path: string, init?: RequestInit) {
  return apiFetch<T>(path, { ...init, method: "DELETE" });
}

// ---- Domain types (lightweight, will grow) --------------------------------

export interface HealthStatus {
  status: string;
  version?: string;
  uptime?: number;
}

export interface BirthData {
  date: string; // ISO date
  time: string; // HH:MM
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface ChartResponse {
  chart_type: string;
  data: Record<string, unknown>;
}

export interface PersonalityResponse {
  system: string;
  result: Record<string, unknown>;
}

export interface OracleMessage {
  role: "user" | "assistant";
  content: string;
}

export interface OracleChatResponse {
  response: string;
  context?: Record<string, unknown>;
}

export interface TransitData {
  planet: string;
  sign: string;
  degree: number;
  aspect?: string;
}

export interface NumerologyResult {
  life_path: number;
  expression: number;
  soul_urge: number;
  personality: number;
  [key: string]: unknown;
}

export interface ApiKeyInfo {
  key: string;
  name: string;
  created: string;
  usage: number;
}

export interface UsageStats {
  total_requests: number;
  period: string;
  endpoints: Record<string, number>;
}

// ---- API client organized by domain group ---------------------------------

export const api = {
  // Health / Meta
  health: {
    check: () => get<HealthStatus>("/health"),
    openapi: () => get<Record<string, unknown>>("/openapi.json"),
  },

  // Charts
  charts: {
    western: (birth: BirthData) =>
      post<ChartResponse>("/api/v1/charts/western", birth),
    vedic: (birth: BirthData) =>
      post<ChartResponse>("/api/v1/charts/vedic", birth),
    bazi: (birth: BirthData) =>
      post<ChartResponse>("/api/v1/charts/bazi", birth),
    synastry: (birthA: BirthData, birthB: BirthData) =>
      post<ChartResponse>("/api/v1/charts/synastry", {
        person_a: birthA,
        person_b: birthB,
      }),
    transits: (birth: BirthData) =>
      post<TransitData[]>("/api/v1/charts/transits", birth),
    numerology: (birth: BirthData & { name?: string }) =>
      post<NumerologyResult>("/api/v1/charts/numerology", birth),
    humanDesign: (birth: BirthData) =>
      post<ChartResponse>("/api/v1/charts/human-design", birth),
    harmonics: (birth: BirthData) =>
      post<ChartResponse>("/api/v1/charts/harmonics", birth),
  },

  // Personality
  personality: {
    mbti: (birth: BirthData) =>
      post<PersonalityResponse>("/api/v1/personality/mbti", birth),
    enneagram: (birth: BirthData) =>
      post<PersonalityResponse>("/api/v1/personality/enneagram", birth),
    archetypes: (birth: BirthData) =>
      post<PersonalityResponse>("/api/v1/personality/archetypes", birth),
    biorhythm: (birth: BirthData) =>
      post<PersonalityResponse>("/api/v1/personality/biorhythm", birth),
    synthesis: (birth: BirthData) =>
      post<PersonalityResponse>("/api/v1/personality/synthesis", birth),
  },

  // Oracle (AI Chat)
  oracle: {
    chat: (messages: OracleMessage[], context?: Record<string, unknown>) =>
      post<OracleChatResponse>("/api/v1/oracle/chat", { messages, context }),
  },

  // Explore
  explore: {
    iChing: (question?: string) =>
      post<Record<string, unknown>>("/api/v1/explore/i-ching", { question }),
    tarot: (spread?: string) =>
      post<Record<string, unknown>>("/api/v1/explore/tarot", { spread }),
    fengShui: (params: Record<string, unknown>) =>
      post<Record<string, unknown>>("/api/v1/explore/feng-shui", params),
    nineStarKi: (birth: BirthData) =>
      post<Record<string, unknown>>("/api/v1/explore/nine-star-ki", birth),
    spaceWeather: () =>
      get<Record<string, unknown>>("/api/v1/explore/space-weather"),
    colorPsych: (birth: BirthData) =>
      post<Record<string, unknown>>("/api/v1/explore/color-psych", birth),
    spiritAnimal: (birth: BirthData) =>
      post<Record<string, unknown>>("/api/v1/explore/spirit-animal", birth),
  },

  // Developer
  developer: {
    apiKeys: {
      list: () => get<ApiKeyInfo[]>("/api/v1/developer/api-keys"),
      create: (name: string) =>
        post<ApiKeyInfo>("/api/v1/developer/api-keys", { name }),
      revoke: (keyId: string) =>
        del<{ success: boolean }>(`/api/v1/developer/api-keys/${keyId}`),
    },
    usage: () => get<UsageStats>("/api/v1/developer/usage"),
    docs: () => get<Record<string, unknown>>("/api/v1/developer/docs"),
    sandbox: (code: string) =>
      post<Record<string, unknown>>("/api/v1/developer/sandbox", { code }),
    webhooks: {
      list: () =>
        get<Record<string, unknown>[]>("/api/v1/developer/webhooks"),
      create: (url: string, events: string[]) =>
        post<Record<string, unknown>>("/api/v1/developer/webhooks", {
          url,
          events,
        }),
      del: (id: string) =>
        del<{ success: boolean }>(`/api/v1/developer/webhooks/${id}`),
    },
  },

  // Admin
  admin: {
    whiteLabel: () =>
      get<Record<string, unknown>>("/api/v1/admin/white-label"),
    analytics: () =>
      get<Record<string, unknown>>("/api/v1/admin/analytics"),
    audit: () =>
      get<Record<string, unknown>[]>("/api/v1/admin/audit"),
    config: {
      get: () => get<Record<string, unknown>>("/api/v1/admin/config"),
      update: (config: Record<string, unknown>) =>
        put<Record<string, unknown>>("/api/v1/admin/config", config),
    },
  },

  // Widgets
  widgets: {
    gallery: () =>
      get<Record<string, unknown>[]>("/api/v1/widgets/gallery"),
    builder: (spec: Record<string, unknown>) =>
      post<Record<string, unknown>>("/api/v1/widgets/builder", spec),
  },
};

export default api;
