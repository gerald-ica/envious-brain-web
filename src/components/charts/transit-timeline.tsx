"use client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Transit {
  planet: string;
  sign: string;
  aspect?: string;
  type: "healthy" | "degraded" | "info";
  date?: string;
}

export interface TransitTimelineProps {
  transits: Transit[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "\u2609", Moon: "\u263D", Mercury: "\u263F", Venus: "\u2640",
  Mars: "\u2642", Jupiter: "\u2643", Saturn: "\u2644", Uranus: "\u2645",
  Neptune: "\u2646", Pluto: "\u2647",
  "North Node": "\u260A", "South Node": "\u260B", Chiron: "\u26B7",
};

const TYPE_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  healthy: {
    bg: "bg-accent-emerald/10",
    border: "border-accent-emerald/25",
    text: "text-accent-emerald",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.1)]",
  },
  degraded: {
    bg: "bg-accent-rose/10",
    border: "border-accent-rose/25",
    text: "text-accent-rose",
    glow: "shadow-[0_0_12px_rgba(244,63,94,0.1)]",
  },
  info: {
    bg: "bg-accent-blue/10",
    border: "border-accent-blue/25",
    text: "text-accent-blue",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.1)]",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TransitTimeline({ transits }: TransitTimelineProps) {
  if (transits.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/50 px-6 py-8 text-center">
        <p className="text-sm text-text-muted">No transit data available</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max px-1 py-1">
        {transits.map((t, i) => {
          const style = TYPE_STYLES[t.type] || TYPE_STYLES.info;
          const glyph = PLANET_GLYPHS[t.planet] || t.planet.charAt(0);
          const isCurrent = !t.date || isToday(t.date);

          return (
            <div
              key={`${t.planet}-${t.aspect}-${i}`}
              className={`relative flex flex-col items-start rounded-xl border px-4 py-3 min-w-[160px] max-w-[200px] transition-all ${style.bg} ${style.border} ${isCurrent ? style.glow : "opacity-60"}`}
            >
              {/* Planet glyph + name */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-lg ${style.text}`}>{glyph}</span>
                <span className="text-sm font-semibold text-text-primary">
                  {t.planet}
                </span>
              </div>

              {/* Sign */}
              <p className="text-xs text-text-secondary mb-1">
                in {t.sign}
              </p>

              {/* Aspect */}
              {t.aspect && (
                <p className={`text-xs font-medium ${style.text}`}>
                  {t.aspect}
                </p>
              )}

              {/* Date indicator */}
              {t.date && (
                <p className="mt-2 text-[10px] text-text-muted">
                  {isCurrent ? "Active now" : formatDate(t.date)}
                </p>
              )}
              {!t.date && (
                <p className="mt-2 text-[10px] text-text-muted">Active now</p>
              )}

              {/* Current indicator dot */}
              {isCurrent && (
                <span className={`absolute top-2 right-2 h-2 w-2 rounded-full ${style.text.replace("text-", "bg-")} animate-pulse`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Scroll fade hints */}
      {transits.length > 4 && (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0a0e1a] to-transparent" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isToday(dateStr: string): boolean {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
