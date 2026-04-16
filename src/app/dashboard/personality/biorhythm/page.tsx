"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---- Biorhythm calculation ----

const BIRTH_DATE = new Date(1990, 6, 15); // July 15, 1990
const TODAY = new Date(2026, 3, 16); // April 16, 2026

function daysSinceBirth(date: Date): number {
  const diff = date.getTime() - BIRTH_DATE.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function biorhythmValue(days: number, cycleDays: number): number {
  return Math.round(Math.sin((2 * Math.PI * days) / cycleDays) * 100);
}

const CYCLES = [
  { name: "Physical", period: 23, color: "accent-emerald", hex: "#10b981" },
  { name: "Emotional", period: 28, color: "accent-blue", hex: "#3b82f6" },
  { name: "Intellectual", period: 33, color: "accent-purple", hex: "#8b5cf6" },
  { name: "Intuitive", period: 38, color: "accent-amber", hex: "#f59e0b" },
];

function generateData(centerDate: Date, rangeDays: number) {
  const data: { day: number; date: Date; values: Record<string, number> }[] = [];
  for (let i = -rangeDays; i <= rangeDays; i++) {
    const date = new Date(centerDate);
    date.setDate(date.getDate() + i);
    const days = daysSinceBirth(date);
    const values: Record<string, number> = {};
    CYCLES.forEach((c) => {
      values[c.name] = biorhythmValue(days, c.period);
    });
    data.push({ day: i, date, values });
  }
  return data;
}

function isCriticalDay(days: number, period: number): boolean {
  const value = Math.abs(biorhythmValue(days, period));
  return value <= 5;
}

// ---- Page ----

export default function BiorhythmPage() {
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);

  const todayDays = daysSinceBirth(TODAY);
  const chartData = generateData(TODAY, 15);

  const currentValues = CYCLES.map((c) => ({
    ...c,
    value: biorhythmValue(todayDays, c.period),
    isCritical: isCriticalDay(todayDays, c.period),
  }));

  // Find critical days in the next 7 days
  const criticalWarnings: { cycle: string; daysAway: number; date: Date }[] = [];
  for (let i = 0; i <= 7; i++) {
    const futureDate = new Date(TODAY);
    futureDate.setDate(futureDate.getDate() + i);
    const futureDays = daysSinceBirth(futureDate);
    CYCLES.forEach((c) => {
      if (isCriticalDay(futureDays, c.period)) {
        criticalWarnings.push({
          cycle: c.name,
          daysAway: i,
          date: futureDate,
        });
      }
    });
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary">Biorhythm</h1>
          <Badge variant="info">Day {todayDays.toLocaleString()}</Badge>
        </div>
        <p className="text-sm text-text-muted">
          Physical (23d), Emotional (28d), Intellectual (33d), and Intuitive
          (38d) cycles since birth.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Current Values */}
        <Card title="Current Day Markers" glow="blue">
          <div className="space-y-4">
            {currentValues.map((cycle) => {
              const isPositive = cycle.value >= 0;
              const absValue = Math.abs(cycle.value);
              const barWidth = absValue;

              return (
                <button
                  key={cycle.name}
                  onClick={() =>
                    setSelectedCycle(
                      selectedCycle === cycle.name ? null : cycle.name,
                    )
                  }
                  className={`w-full text-left rounded-lg border p-3 transition-all ${
                    selectedCycle === cycle.name
                      ? "border-accent-blue/40 bg-accent-blue/5"
                      : "border-border bg-white/[0.02] hover:border-border-hover"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full bg-${cycle.color}`}
                      />
                      <span className="text-sm font-medium text-text-primary">
                        {cycle.name}
                      </span>
                      <span className="text-xs text-text-muted">
                        ({cycle.period}d cycle)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {cycle.isCritical && (
                        <Badge variant="degraded">Critical</Badge>
                      )}
                      <span
                        className={`text-sm font-mono font-bold ${
                          isPositive
                            ? "text-accent-emerald"
                            : "text-accent-rose"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {cycle.value}%
                      </span>
                    </div>
                  </div>
                  {/* Bidirectional bar */}
                  <div className="flex items-center gap-1">
                    {/* Negative side */}
                    <div className="flex-1 flex justify-end">
                      {!isPositive && (
                        <div
                          className="h-2 rounded-l-full bg-accent-rose/60"
                          style={{ width: `${barWidth}%` }}
                        />
                      )}
                    </div>
                    {/* Center line */}
                    <div className="w-px h-4 bg-white/20" />
                    {/* Positive side */}
                    <div className="flex-1">
                      {isPositive && (
                        <div
                          className={`h-2 rounded-r-full bg-${cycle.color}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Critical Day Warnings */}
        <Card title="Critical Day Warnings (Next 7 Days)">
          {criticalWarnings.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-sm text-accent-emerald mb-1">
                  All clear
                </p>
                <p className="text-xs text-text-muted">
                  No critical days in the next 7 days
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {criticalWarnings.map((warning, i) => (
                <div
                  key={`${warning.cycle}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-accent-amber/20 bg-accent-amber/5 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-accent-amber text-sm">!</span>
                    <span className="text-sm text-text-primary">
                      {warning.cycle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">
                      {warning.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <Badge variant="degraded">
                      {warning.daysAway === 0
                        ? "Today"
                        : `${warning.daysAway}d away`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 rounded-lg bg-white/[0.02] p-3">
            <p className="text-xs text-text-muted leading-relaxed">
              <span className="font-semibold text-text-secondary">
                Critical days
              </span>{" "}
              occur when a cycle crosses zero. These transition points represent
              instability -- exercise extra caution with decisions related to
              that domain.
            </p>
          </div>
        </Card>

        {/* 30-Day Mini Chart */}
        <Card title="30-Day Biorhythm Chart" className="lg:col-span-2">
          <div className="space-y-6">
            {CYCLES.filter(
              (c) => !selectedCycle || c.name === selectedCycle,
            ).map((cycle) => (
              <div key={cycle.name}>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cycle.hex }}
                  />
                  <span className="text-xs font-medium text-text-secondary">
                    {cycle.name}
                  </span>
                  <span className="text-xs text-text-muted">
                    ({cycle.period}d)
                  </span>
                </div>

                {/* ASCII-style bar chart */}
                <div className="flex items-end gap-px h-24">
                  {chartData.map((point) => {
                    const val = point.values[cycle.name];
                    const isToday = point.day === 0;
                    const height = Math.abs(val);
                    const isPositive = val >= 0;
                    const isCrit = Math.abs(val) <= 5;

                    return (
                      <div
                        key={point.day}
                        className="flex-1 flex flex-col items-center justify-end h-full relative"
                        title={`Day ${point.day > 0 ? "+" : ""}${point.day}: ${val}%`}
                      >
                        {/* Positive bars go up from center, negative go down */}
                        <div className="flex flex-col items-center justify-center h-full w-full relative">
                          {/* Top half (positive) */}
                          <div className="flex-1 flex items-end w-full">
                            {isPositive && (
                              <div
                                className="w-full rounded-t-sm transition-all"
                                style={{
                                  height: `${height}%`,
                                  backgroundColor: isCrit
                                    ? "#f59e0b"
                                    : isToday
                                      ? cycle.hex
                                      : `${cycle.hex}66`,
                                  opacity: isToday ? 1 : 0.6,
                                }}
                              />
                            )}
                          </div>
                          {/* Zero line */}
                          <div className="w-full h-px bg-white/10" />
                          {/* Bottom half (negative) */}
                          <div className="flex-1 flex items-start w-full">
                            {!isPositive && (
                              <div
                                className="w-full rounded-b-sm transition-all"
                                style={{
                                  height: `${height}%`,
                                  backgroundColor: isCrit
                                    ? "#f59e0b"
                                    : `${cycle.hex}44`,
                                  opacity: isToday ? 1 : 0.6,
                                }}
                              />
                            )}
                          </div>
                        </div>
                        {/* Today marker */}
                        {isToday && (
                          <div className="absolute -bottom-4 text-[8px] font-bold text-accent-blue">
                            NOW
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Chart labels */}
                <div className="flex justify-between mt-5 text-[9px] text-text-muted">
                  <span>-15d</span>
                  <span>Today</span>
                  <span>+15d</span>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
            {CYCLES.map((c) => (
              <button
                key={c.name}
                onClick={() =>
                  setSelectedCycle(selectedCycle === c.name ? null : c.name)
                }
                className={`flex items-center gap-1.5 text-xs transition-opacity ${
                  selectedCycle && selectedCycle !== c.name
                    ? "opacity-40"
                    : "opacity-100"
                }`}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-text-secondary">{c.name}</span>
              </button>
            ))}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2 w-2 rounded-full bg-accent-amber" />
              <span className="text-text-muted">Critical zone</span>
            </div>
            {selectedCycle && (
              <button
                onClick={() => setSelectedCycle(null)}
                className="text-xs text-accent-blue hover:underline ml-auto"
              >
                Show all cycles
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
