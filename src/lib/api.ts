// ---------------------------------------------------------------------------
// ENVI-OUS BRAIN API Client
// Typed fetch wrapper for the backend at Cloud Run
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-662458014068.us-central1.run.app";

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

  // Attach auth token when available (client-side only)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("envious_access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;

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

// ---- Auth types -----------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  tier: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface RefreshResponse {
  access_token: string;
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

/** Helper: convert BirthData to the datetime payload most chart endpoints expect. */
export function birthToDatetime(birth: BirthData) {
  return {
    datetime: `${birth.date}T${birth.time}:00`,
    latitude: birth.latitude,
    longitude: birth.longitude,
    timezone: birth.timezone,
  };
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
  // Auth
  auth: {
    register: (email: string, password: string, display_name: string) =>
      post<AuthResponse>("/api/v1/auth/register", {
        email,
        password,
        display_name,
      }),
    login: (email: string, password: string) =>
      post<AuthResponse>("/api/v1/auth/login", { email, password }),
    refreshToken: (refresh_token: string) =>
      post<RefreshResponse>("/api/v1/auth/refresh", { refresh_token }),
    me: () => get<AuthUser>("/api/v1/auth/me"),
  },

  // Health / Meta
  health: {
    check: () => get<HealthStatus>("/health"),
    openapi: () => get<Record<string, unknown>>("/openapi.json"),
  },

  // Charts — use datetime format the backend expects
  charts: {
    western: (birth: BirthData) =>
      post<ChartResponse>("/api/v1/charts/western", birthToDatetime(birth)),
    vedic: (birth: BirthData) =>
      post<ChartResponse>("/api/v1/charts/vedic", birthToDatetime(birth)),
    bazi: (birth: BirthData) =>
      post<ChartResponse>("/api/v1/charts/bazi", {
        datetime: `${birth.date}T${birth.time}:00`,
        gender: "male", // TODO: add gender to profile
      }),
    synastry: (birthA: BirthData, birthB: BirthData) =>
      post<ChartResponse>("/api/v1/western/synastry", {
        person1_datetime: `${birthA.date}T${birthA.time}:00`,
        person1_latitude: birthA.latitude,
        person1_longitude: birthA.longitude,
        person2_datetime: `${birthB.date}T${birthB.time}:00`,
        person2_latitude: birthB.latitude,
        person2_longitude: birthB.longitude,
      }),
    transits: (natalPositions: Record<string, number>, date?: string) =>
      post<TransitData[]>("/api/v1/transits/current", {
        natal_positions: natalPositions,
        ...(date ? { date } : {}),
      }),
    humanDesign: (birth: BirthData) =>
      post<ChartResponse>("/api/v1/charts/human-design", birthToDatetime(birth)),
    harmonics: (birth: BirthData, harmonicNumber: number = 7) =>
      post<ChartResponse>("/api/v1/western/harmonics", {
        datetime: `${birth.date}T${birth.time}:00`,
        latitude: birth.latitude,
        longitude: birth.longitude,
        harmonic_number: harmonicNumber,
      }),
  },

  // Personality — use correct paths & schemas from the actual backend
  personality: {
    enneagram: () =>
      post<PersonalityResponse>("/api/v1/personality/enneagram", {}),
    archetypes: (data: {
      sun_sign?: string;
      moon_sign?: string;
      ascendant?: string;
      mbti?: string;
      enneagram?: string;
      life_path?: number;
    }) =>
      post<PersonalityResponse>("/api/v1/psychology/jungian-archetypes", data),
    biorhythm: (birthDate: string, targetDate?: string) =>
      post<PersonalityResponse>("/api/v1/personality/biorhythm", {
        birth_date: birthDate,
        target_date: targetDate || new Date().toISOString().split("T")[0],
      }),
    synthesis: (mbtiType: string, natalModifiers?: Record<string, unknown>) =>
      post<PersonalityResponse>("/api/v1/personality/calculate", {
        mbti_type: mbtiType,
        ...(natalModifiers ? { natal_modifiers: natalModifiers } : {}),
      }),
    tarotBirthCards: (birthDate: string) =>
      post<Record<string, unknown>>("/api/v1/personality/tarot/birth-cards", {
        birth_date: birthDate,
      }),
  },

  // Oracle (LLM Chat) — session-based
  oracle: {
    createSession: (systemPrompt?: string) =>
      post<{ session_id: string }>("/api/v1/llm/sessions", {
        ...(systemPrompt ? { system_prompt: systemPrompt } : {}),
      }),
    sendMessage: (sessionId: string, content: string) =>
      post<{ role: string; content: string }>(
        `/api/v1/llm/sessions/${sessionId}/messages`,
        { role: "user", content },
      ),
    getSession: (sessionId: string) =>
      get<Record<string, unknown>>(`/api/v1/llm/sessions/${sessionId}`),
  },

  // Explore — corrected paths
  explore: {
    iChing: (question?: string) =>
      post<Record<string, unknown>>("/api/v1/chinese/iching/cast", { question }),
    tarot: (spread?: string) =>
      post<Record<string, unknown>>("/api/v1/personality/tarot/spread", { spread }),
    fengShui: (params: Record<string, unknown>) =>
      post<Record<string, unknown>>("/api/v1/chinese/fengshui/chart", params),
    nineStarKi: (birth: BirthData) =>
      post<Record<string, unknown>>("/api/v1/chinese/ninestarki/calculate", {
        datetime: `${birth.date}T${birth.time}:00`,
      }),
    spaceWeather: () =>
      get<Record<string, unknown>>("/api/v1/space-weather/current"),
    colorPsych: (data: {
      sun_sign: string;
      moon_sign?: string;
      rising_sign?: string;
    }) =>
      post<Record<string, unknown>>("/api/v1/psychology/color-palette", data),
    spiritAnimal: (data: {
      sun_sign: string;
      moon_sign: string;
      rising_sign: string;
      birth_year: number;
      birth_month: number;
      birth_day: number;
    }) =>
      post<Record<string, unknown>>("/api/v1/psychology/spirit-animal", data),
  },

  // Western Advanced
  westernAdvanced: {
    northNode: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/western/north-node",
        birthToDatetime(birth),
      ),
    chiron: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/western/chiron",
        birthToDatetime(birth),
      ),
    asteroids: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/western/asteroids",
        birthToDatetime(birth),
      ),
    fixedStars: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/western/fixed-stars",
        birthToDatetime(birth),
      ),
    arabicParts: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/western/arabic-parts",
        birthToDatetime(birth),
      ),
    draconic: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/western/draconic",
        birthToDatetime(birth),
      ),
    horary: (birth: BirthData, question: string) =>
      post<Record<string, unknown>>("/api/v1/western/horary", {
        ...birthToDatetime(birth),
        question,
      }),
    hellenistic: {
      sect: (birth: BirthData) =>
        post<Record<string, unknown>>(
          "/api/v1/western/hellenistic/sect",
          birthToDatetime(birth),
        ),
      profection: (birth: BirthData) =>
        post<Record<string, unknown>>(
          "/api/v1/western/hellenistic/profection",
          birthToDatetime(birth),
        ),
      almuten: (birth: BirthData) =>
        post<Record<string, unknown>>(
          "/api/v1/western/hellenistic/almuten",
          birthToDatetime(birth),
        ),
    },
  },

  // Techniques
  techniques: {
    declinations: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/techniques/declinations",
        birthToDatetime(birth),
      ),
    degreeTheory: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/techniques/degree-theory",
        birthToDatetime(birth),
      ),
    dignities: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/techniques/dignities",
        birthToDatetime(birth),
      ),
    houseSystems: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/techniques/house-systems",
        birthToDatetime(birth),
      ),
    midpoints: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/techniques/midpoints",
        birthToDatetime(birth),
      ),
    planetaryHours: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/techniques/planetary-hours",
        birthToDatetime(birth),
      ),
    sabianSymbols: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/techniques/sabian-symbols",
        birthToDatetime(birth),
      ),
  },

  // Predictive
  predictive: {
    electional: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/predictive/electional",
        birthToDatetime(birth),
      ),
    relocation: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/predictive/relocation",
        birthToDatetime(birth),
      ),
    vimshottari: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/predictive/vimshottari",
        birthToDatetime(birth),
      ),
  },

  // Advanced Charts
  advancedCharts: {
    solarReturn: (birth: BirthData, targetYear: number) =>
      post<Record<string, unknown>>("/api/v1/charts/solar-return", {
        ...birthToDatetime(birth),
        target_year: targetYear,
      }),
    lunarReturn: (
      birth: BirthData,
      targetMonth: number,
      targetYear: number,
    ) =>
      post<Record<string, unknown>>("/api/v1/charts/lunar-return", {
        ...birthToDatetime(birth),
        target_month: targetMonth,
        target_year: targetYear,
      }),
    progressions: (birth: BirthData, targetDate: string) =>
      post<Record<string, unknown>>("/api/v1/charts/progressions", {
        ...birthToDatetime(birth),
        target_date: targetDate,
      }),
    composite: (
      person1: { datetime: string; latitude: number; longitude: number },
      person2: { datetime: string; latitude: number; longitude: number },
    ) =>
      post<Record<string, unknown>>("/api/v1/charts/composite", {
        person1,
        person2,
      }),
    moonPhase: () => get<Record<string, unknown>>("/api/v1/charts/moon-phase"),
    eclipses: () => get<Record<string, unknown>>("/api/v1/charts/eclipses"),
  },

  // Eastern
  eastern: {
    kpSystem: (birth: BirthData) =>
      post<Record<string, unknown>>(
        "/api/v1/eastern/kp-system",
        birthToDatetime(birth),
      ),
    ziwei: (birth: BirthData, gender: string) =>
      post<Record<string, unknown>>("/api/v1/eastern/ziwei", {
        ...birthToDatetime(birth),
        gender,
      }),
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
