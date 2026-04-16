"use client";

import { useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BiorhythmChartProps {
  birthDate: string; // ISO date
  days?: number;     // range, default 30
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CYCLES = [
  { label: "Physical",     period: 23, color: "#10b981" },
  { label: "Emotional",    period: 28, color: "#3b82f6" },
  { label: "Intellectual", period: 33, color: "#8b5cf6" },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BiorhythmChart({ birthDate, days = 30 }: BiorhythmChartProps) {
  const width = 600;
  const height = 220;
  const padL = 44;
  const padR = 12;
  const padT = 16;
  const padB = 32;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const midY = padT + chartH / 2;

  const today = useMemo(() => new Date(), []);
  const birth = useMemo(() => new Date(birthDate), [birthDate]);
  const startDay = useMemo(() => Math.floor(-days / 3), [days]);

  // Generate path data for each cycle
  const paths = useMemo(() => {
    return CYCLES.map((cycle) => {
      const points: string[] = [];
      for (let d = startDay; d <= days; d++) {
        const dayDate = new Date(today);
        dayDate.setDate(dayDate.getDate() + d);
        const elapsed = Math.floor(
          (dayDate.getTime() - birth.getTime()) / 86400000,
        );
        const val = Math.sin((2 * Math.PI * elapsed) / cycle.period);
        const x = padL + ((d - startDay) / (days - startDay)) * chartW;
        const y = midY - val * (chartH / 2) * 0.9;
        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      return {
        ...cycle,
        d: "M " + points.join(" L "),
      };
    });
  }, [birthDate, days, today, birth, startDay]);

  // Today's X position
  const todayX = padL + ((0 - startDay) / (days - startDay)) * chartW;

  // Today's values
  const todayValues = useMemo(() => {
    const elapsed = Math.floor(
      (today.getTime() - birth.getTime()) / 86400000,
    );
    return CYCLES.map((c) => ({
      label: c.label,
      color: c.color,
      value: Math.round(
        Math.sin((2 * Math.PI * elapsed) / c.period) * 100,
      ),
    }));
  }, [today, birth]);

  // X-axis date labels (every 7 days)
  const dateLabels = useMemo(() => {
    const labels: { x: number; text: string }[] = [];
    for (let d = startDay; d <= days; d += 7) {
      const dayDate = new Date(today);
      dayDate.setDate(dayDate.getDate() + d);
      const x = padL + ((d - startDay) / (days - startDay)) * chartW;
      labels.push({
        x,
        text: dayDate.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      });
    }
    return labels;
  }, [today, days, startDay]);

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="w-full h-auto"
      >
        {/* Grid */}
        {/* Horizontal grid lines */}
        <line
          x1={padL} y1={padT}
          x2={padL + chartW} y2={padT}
          stroke="#ffffff" strokeOpacity={0.06} strokeWidth={0.5}
        />
        <line
          x1={padL} y1={midY}
          x2={padL + chartW} y2={midY}
          stroke="#ffffff" strokeOpacity={0.12} strokeWidth={0.5}
        />
        <line
          x1={padL} y1={padT + chartH}
          x2={padL + chartW} y2={padT + chartH}
          stroke="#ffffff" strokeOpacity={0.06} strokeWidth={0.5}
        />

        {/* Y-axis labels */}
        <text x={padL - 6} y={padT + 4} textAnchor="end" fill="#6b7280" fontSize={9}>
          +100%
        </text>
        <text x={padL - 6} y={midY + 3} textAnchor="end" fill="#6b7280" fontSize={9}>
          0%
        </text>
        <text x={padL - 6} y={padT + chartH + 3} textAnchor="end" fill="#6b7280" fontSize={9}>
          -100%
        </text>

        {/* X-axis date labels */}
        {dateLabels.map((dl, i) => (
          <text
            key={i}
            x={dl.x}
            y={height - 6}
            textAnchor="middle"
            fill="#6b7280"
            fontSize={8}
          >
            {dl.text}
          </text>
        ))}

        {/* Sine wave paths */}
        {paths.map((p) => (
          <path
            key={p.label}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
        ))}

        {/* Today vertical line */}
        <line
          x1={todayX} y1={padT}
          x2={todayX} y2={padT + chartH}
          stroke="#ffffff" strokeOpacity={0.35}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <text
          x={todayX}
          y={padT - 4}
          textAnchor="middle"
          fill="#ffffff"
          fillOpacity={0.5}
          fontSize={9}
          fontWeight="bold"
        >
          Today
        </text>
      </svg>

      {/* Legend / today values */}
      <div className="flex items-center justify-center gap-5 mt-2">
        {todayValues.map((tv) => (
          <div key={tv.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: tv.color }}
            />
            <span className="text-xs text-text-muted">{tv.label}</span>
            <span
              className="text-xs font-mono font-medium"
              style={{ color: tv.value >= 0 ? tv.color : "#f43f5e" }}
            >
              {tv.value > 0 ? "+" : ""}
              {tv.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
