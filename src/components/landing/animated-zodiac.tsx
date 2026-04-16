"use client";

import { useEffect, useState } from "react";

const SIGNS = [
  "\u2648", "\u2649", "\u264A", "\u264B", "\u264C", "\u264D",
  "\u264E", "\u264F", "\u2650", "\u2651", "\u2652", "\u2653",
]; // Aries through Pisces

const ASPECT_LINES = [
  { from: 0, to: 4, color: "#10b981" },   // trine
  { from: 1, to: 9, color: "#3b82f6" },   // trine
  { from: 3, to: 7, color: "#f43f5e" },   // opposition
  { from: 5, to: 11, color: "#C9A84C" },  // trine
  { from: 2, to: 6, color: "#00D4FF" },   // opposition
];

export function AnimatedZodiac() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cx = 200;
  const cy = 200;
  const outerR = 180;
  const innerR = 140;
  const signR = 160;

  const pointOnCircle = (angleDeg: number, r: number) => ({
    x: cx + r * Math.cos((angleDeg - 90) * (Math.PI / 180)),
    y: cy + r * Math.sin((angleDeg - 90) * (Math.PI / 180)),
  });

  return (
    <div
      className="relative mx-auto"
      style={{ width: 400, height: 400 }}
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 1s ease-in",
        }}
      >
        <defs>
          <radialGradient id="zodiac-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#00D4FF" stopOpacity="0.03" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g>
          {mounted && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 200 200"
              to="360 200 200"
              dur="90s"
              repeatCount="indefinite"
            />
          )}

        {/* Background glow */}
        <circle cx={cx} cy={cy} r={outerR} fill="url(#zodiac-glow)" />

        {/* Outer ring */}
        <circle
          cx={cx} cy={cy} r={outerR}
          fill="none" stroke="#C9A84C" strokeWidth="1" strokeOpacity="0.3"
        />
        <circle
          cx={cx} cy={cy} r={innerR}
          fill="none" stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.2"
        />

        {/* Degree tick marks every 30° and division lines */}
        {SIGNS.map((_, i) => {
          const angle = i * 30;
          const p1 = pointOnCircle(angle, innerR);
          const p2 = pointOnCircle(angle, outerR);
          return (
            <line
              key={`div-${i}`}
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.3"
            />
          );
        })}

        {/* Small tick marks every 10° */}
        {Array.from({ length: 36 }, (_, i) => {
          const angle = i * 10;
          const p1 = pointOnCircle(angle, outerR - 4);
          const p2 = pointOnCircle(angle, outerR);
          return (
            <line
              key={`tick-${i}`}
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke="#C9A84C" strokeWidth="0.3" strokeOpacity="0.2"
            />
          );
        })}

        {/* Zodiac symbols */}
        {SIGNS.map((sign, i) => {
          const angle = i * 30 + 15; // center of each section
          const p = pointOnCircle(angle, signR);
          return (
            <text
              key={`sign-${i}`}
              x={p.x} y={p.y}
              textAnchor="middle" dominantBaseline="central"
              fill="#C9A84C" fillOpacity="0.6" fontSize="14"
              style={{ fontFamily: "system-ui" }}
            >
              {sign}
            </text>
          );
        })}

        {/* Aspect lines with animation */}
        {ASPECT_LINES.map((a, i) => {
          const p1 = pointOnCircle(a.from * 30 + 15, innerR - 10);
          const p2 = pointOnCircle(a.to * 30 + 15, innerR - 10);
          return (
            <line
              key={`aspect-${i}`}
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={a.color} strokeWidth="0.8" strokeOpacity="0.4"
              strokeDasharray="4 4"
            >
              <animate
                attributeName="stroke-opacity"
                values="0.2;0.6;0.2"
                dur={`${3 + i * 0.7}s`}
                repeatCount="indefinite"
              />
            </line>
          );
        })}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="2" fill="#00D4FF" fillOpacity="0.5" />
        </g>
      </svg>
    </div>
  );
}
