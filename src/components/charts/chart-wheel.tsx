"use client";

import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChartPlanet {
  planet: string;
  sign: string;
  degree: string;
  house: number;
  retrograde: boolean;
  longitude?: number;
}

export interface ChartHouse {
  house: number;
  sign: string;
  degree: string;
  longitude?: number;
}

export interface ChartAspect {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: string;
  type: "healthy" | "degraded" | "info";
}

export interface ChartWheelProps {
  planets: ChartPlanet[];
  houses: ChartHouse[];
  aspects?: ChartAspect[];
  size?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIGN_ORDER = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

const SIGN_GLYPHS: Record<string, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};

const SIGN_ELEMENT: Record<string, "Fire" | "Earth" | "Air" | "Water"> = {
  Aries: "Fire",
  Leo: "Fire",
  Sagittarius: "Fire",
  Taurus: "Earth",
  Virgo: "Earth",
  Capricorn: "Earth",
  Gemini: "Air",
  Libra: "Air",
  Aquarius: "Air",
  Cancer: "Water",
  Scorpio: "Water",
  Pisces: "Water",
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "#f43f5e",
  Earth: "#10b981",
  Air: "#3b82f6",
  Water: "#8b5cf6",
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
  "N. Node": "☊",
  "S. Node": "☋",
  Chiron: "⚷",
};

const ASPECT_STYLES: Record<
  string,
  { color: string; dashed: boolean }
> = {
  Trine: { color: "#10b981", dashed: false },
  Sextile: { color: "#3b82f6", dashed: false },
  Conjunct: { color: "#22d3ee", dashed: false },
  Conjunction: { color: "#22d3ee", dashed: false },
  Opposition: { color: "#f43f5e", dashed: true },
  Square: { color: "#f59e0b", dashed: true },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseDegreeString(deg: string): number {
  const match = deg.match(/(\d+)\s*°\s*(\d+)/);
  if (!match) return 0;
  return Number(match[1]) + Number(match[2]) / 60;
}

function signToLongitude(sign: string, degree: string): number {
  const idx = SIGN_ORDER.indexOf(sign as (typeof SIGN_ORDER)[number]);
  if (idx === -1) return 0;
  return idx * 30 + parseDegreeString(degree);
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = toRadians(angleDeg);
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  };
}

/** Convert ecliptic longitude to SVG angle, with Ascendant at 9-o'clock. */
function longitudeToSvgAngle(lon: number, ascLon: number): number {
  return 180 - (lon - ascLon);
}

/**
 * Spread planet angles that are too close (within minGap degrees).
 * Returns adjusted angles keyed by planet name.
 */
function spreadPlanets(
  items: { name: string; angle: number }[],
  minGap: number,
): Map<string, number> {
  const sorted = [...items].sort((a, b) => a.angle - b.angle);
  // Iterative spreading
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 0; i < sorted.length; i++) {
      const next = sorted[(i + 1) % sorted.length];
      const curr = sorted[i];
      let diff = next.angle - curr.angle;
      if (diff < 0) diff += 360;
      if (diff < minGap && diff > 0) {
        const shift = (minGap - diff) / 2;
        curr.angle -= shift;
        next.angle += shift;
      }
    }
  }
  const result = new Map<string, number>();
  for (const s of sorted) result.set(s.name, s.angle);
  return result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChartWheel({
  planets,
  houses,
  aspects = [],
  size = 500,
}: ChartWheelProps) {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const signRingInner = size * 0.38;
  const planetR = size * 0.32;
  const houseNumR = size * 0.24;
  const innerR = size * 0.17;
  const aspectR = size * 0.165;

  // Compute ascendant longitude
  const ascLon = useMemo(() => {
    const h1 = houses.find((h) => h.house === 1);
    if (!h1) return 0;
    return h1.longitude ?? signToLongitude(h1.sign, h1.degree);
  }, [houses]);

  // House longitudes & svg angles
  const houseLons = useMemo(
    () =>
      houses.map((h) => ({
        house: h.house,
        lon: h.longitude ?? signToLongitude(h.sign, h.degree),
      })),
    [houses],
  );

  const houseAngles = useMemo(
    () =>
      houseLons.map((h) => ({
        house: h.house,
        angle: longitudeToSvgAngle(h.lon, ascLon),
      })),
    [houseLons, ascLon],
  );

  // Planet longitudes & svg angles (with spreading)
  const planetPositions = useMemo(() => {
    const raw = planets.map((p) => {
      const lon = p.longitude ?? signToLongitude(p.sign, p.degree);
      return { name: p.planet, angle: longitudeToSvgAngle(lon, ascLon), lon };
    });
    const spread = spreadPlanets(
      raw.map((r) => ({ name: r.name, angle: r.angle })),
      5,
    );
    return raw.map((r) => ({
      ...r,
      displayAngle: spread.get(r.name) ?? r.angle,
    }));
  }, [planets, ascLon]);

  // Sign start angles (each sign = 30°, starting from Aries = 0° ecliptic)
  const signSegments = useMemo(
    () =>
      SIGN_ORDER.map((sign, i) => {
        const startLon = i * 30;
        const endLon = (i + 1) * 30;
        return {
          sign,
          startAngle: longitudeToSvgAngle(startLon, ascLon),
          endAngle: longitudeToSvgAngle(endLon, ascLon),
          midAngle: longitudeToSvgAngle(startLon + 15, ascLon),
        };
      }),
    [ascLon],
  );

  // Build an arc path for the sign ring
  function signArcPath(startAngle: number, endAngle: number): string {
    // We draw from startAngle to endAngle (going clockwise = decreasing SVG angle)
    const p1 = polarToCartesian(cx, cy, outerR, startAngle);
    const p2 = polarToCartesian(cx, cy, outerR, endAngle);
    const p3 = polarToCartesian(cx, cy, signRingInner, endAngle);
    const p4 = polarToCartesian(cx, cy, signRingInner, startAngle);
    // Large arc flag: always 0 since each segment is 30°
    return [
      `M ${p1.x} ${p1.y}`,
      `A ${outerR} ${outerR} 0 0 0 ${p2.x} ${p2.y}`,
      `L ${p3.x} ${p3.y}`,
      `A ${signRingInner} ${signRingInner} 0 0 1 ${p4.x} ${p4.y}`,
      "Z",
    ].join(" ");
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
    >
      {/* Background */}
      <circle cx={cx} cy={cy} r={outerR + 4} fill="#0a0e1a" />

      {/* Sign segments */}
      {signSegments.map((seg) => {
        const element = SIGN_ELEMENT[seg.sign];
        const color = ELEMENT_COLORS[element] ?? "#6b7280";
        return (
          <path
            key={seg.sign}
            d={signArcPath(seg.startAngle, seg.endAngle)}
            fill={color}
            fillOpacity={0.12}
            stroke={color}
            strokeOpacity={0.35}
            strokeWidth={0.5}
          />
        );
      })}

      {/* Sign divider lines */}
      {signSegments.map((seg) => {
        const p1 = polarToCartesian(cx, cy, signRingInner, seg.startAngle);
        const p2 = polarToCartesian(cx, cy, outerR, seg.startAngle);
        return (
          <line
            key={`div-${seg.sign}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="#334155"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Sign glyphs */}
      {signSegments.map((seg) => {
        const r = (outerR + signRingInner) / 2;
        const pos = polarToCartesian(cx, cy, r, seg.midAngle);
        const element = SIGN_ELEMENT[seg.sign];
        const color = ELEMENT_COLORS[element] ?? "#6b7280";
        return (
          <text
            key={`glyph-${seg.sign}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
            fontSize={size * 0.028}
            fontFamily="serif"
          >
            {SIGN_GLYPHS[seg.sign]}
          </text>
        );
      })}

      {/* Degree tick marks (every 5°) */}
      {Array.from({ length: 72 }, (_, i) => {
        const lon = i * 5;
        const angle = longitudeToSvgAngle(lon, ascLon);
        const isMajor = lon % 30 === 0;
        const tickOuter = outerR;
        const tickInner = isMajor ? outerR - 6 : outerR - 3;
        const p1 = polarToCartesian(cx, cy, tickInner, angle);
        const p2 = polarToCartesian(cx, cy, tickOuter, angle);
        return (
          <line
            key={`tick-${i}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="#475569"
            strokeWidth={isMajor ? 1 : 0.5}
            strokeOpacity={0.6}
          />
        );
      })}

      {/* Inner ring border */}
      <circle
        cx={cx}
        cy={cy}
        r={signRingInner}
        fill="none"
        stroke="#1e293b"
        strokeWidth={1}
      />
      <circle
        cx={cx}
        cy={cy}
        r={innerR}
        fill="#0a0e1a"
        stroke="#1e293b"
        strokeWidth={0.5}
      />

      {/* House cusp lines */}
      {houseAngles.map((h) => {
        const p1 = polarToCartesian(cx, cy, innerR, h.angle);
        const p2 = polarToCartesian(cx, cy, signRingInner, h.angle);
        const isAngular = [1, 4, 7, 10].includes(h.house);
        return (
          <line
            key={`house-${h.house}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={isAngular ? "#475569" : "#334155"}
            strokeWidth={isAngular ? 1.5 : 0.7}
            strokeOpacity={isAngular ? 0.9 : 0.5}
          />
        );
      })}

      {/* House numbers */}
      {houseAngles.map((h, i) => {
        const nextAngle = houseAngles[(i + 1) % 12].angle;
        let midAngle = (h.angle + nextAngle) / 2;
        // Handle angle wrapping
        const diff = nextAngle - h.angle;
        if (Math.abs(diff) > 180) {
          midAngle = h.angle + (diff > 0 ? diff - 360 : diff + 360) / 2;
        }
        const pos = polarToCartesian(cx, cy, houseNumR, midAngle);
        return (
          <text
            key={`hnum-${h.house}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#6b7280"
            fontSize={size * 0.022}
            fontFamily="sans-serif"
          >
            {h.house}
          </text>
        );
      })}

      {/* Aspect lines */}
      {aspects.map((a, i) => {
        const p1Pos = planetPositions.find((p) => p.name === a.planet1);
        const p2Pos = planetPositions.find((p) => p.name === a.planet2);
        if (!p1Pos || !p2Pos) return null;

        const pt1 = polarToCartesian(cx, cy, aspectR, p1Pos.displayAngle);
        const pt2 = polarToCartesian(cx, cy, aspectR, p2Pos.displayAngle);
        const style = ASPECT_STYLES[a.aspect] ?? { color: "#6b7280", dashed: false };

        const isHighlighted =
          hoveredPlanet === a.planet1 || hoveredPlanet === a.planet2;
        const opacity = hoveredPlanet
          ? isHighlighted
            ? 0.8
            : 0.1
          : 0.35;

        return (
          <line
            key={`aspect-${i}`}
            x1={pt1.x}
            y1={pt1.y}
            x2={pt2.x}
            y2={pt2.y}
            stroke={style.color}
            strokeWidth={isHighlighted ? 1.5 : 0.8}
            strokeOpacity={opacity}
            strokeDasharray={style.dashed ? "4 3" : undefined}
          />
        );
      })}

      {/* Planet glyphs */}
      {planetPositions.map((p) => {
        const pos = polarToCartesian(cx, cy, planetR, p.displayAngle);
        const glyph = PLANET_GLYPHS[p.name] ?? p.name.charAt(0);
        const planetData = planets.find((pl) => pl.planet === p.name);
        const isHovered = hoveredPlanet === p.name;

        return (
          <g
            key={`planet-${p.name}`}
            onMouseEnter={() => setHoveredPlanet(p.name)}
            onMouseLeave={() => setHoveredPlanet(null)}
            style={{ cursor: "pointer" }}
          >
            {/* Hit area */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={size * 0.025}
              fill="transparent"
            />
            {/* Highlight ring */}
            {isHovered && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={size * 0.022}
                fill="#3b82f6"
                fillOpacity={0.15}
                stroke="#3b82f6"
                strokeWidth={1}
                strokeOpacity={0.4}
              />
            )}
            {/* Glyph */}
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={isHovered ? "#ffffff" : "#d1d5db"}
              fontSize={size * 0.032}
              fontFamily="serif"
            >
              {glyph}
            </text>
            {/* Retrograde marker */}
            {planetData?.retrograde && (
              <text
                x={pos.x + size * 0.018}
                y={pos.y - size * 0.015}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#f59e0b"
                fontSize={size * 0.016}
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                R
              </text>
            )}
            {/* Tooltip on hover */}
            {isHovered && planetData && (
              <text
                x={pos.x}
                y={pos.y + size * 0.035}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#d1d5db"
                fontSize={size * 0.018}
                fontFamily="sans-serif"
              >
                {planetData.sign} {planetData.degree}
              </text>
            )}
          </g>
        );
      })}

      {/* Ascendant arrow (left side — House 1 cusp) */}
      {(() => {
        const ascAngle = houseAngles.find((h) => h.house === 1)?.angle ?? 180;
        const tipPos = polarToCartesian(cx, cy, signRingInner + 2, ascAngle);
        const baseL = polarToCartesian(cx, cy, signRingInner + 10, ascAngle + 3);
        const baseR = polarToCartesian(cx, cy, signRingInner + 10, ascAngle - 3);
        return (
          <g>
            <polygon
              points={`${tipPos.x},${tipPos.y} ${baseL.x},${baseL.y} ${baseR.x},${baseR.y}`}
              fill="#f43f5e"
              fillOpacity={0.9}
            />
            <text
              x={polarToCartesian(cx, cy, outerR + size * 0.02, ascAngle).x}
              y={polarToCartesian(cx, cy, outerR + size * 0.02, ascAngle).y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#f43f5e"
              fontSize={size * 0.022}
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              ASC
            </text>
          </g>
        );
      })()}

      {/* MC indicator (House 10 cusp) */}
      {(() => {
        const mcAngle = houseAngles.find((h) => h.house === 10)?.angle ?? 90;
        const tipPos = polarToCartesian(cx, cy, signRingInner + 2, mcAngle);
        const baseL = polarToCartesian(cx, cy, signRingInner + 10, mcAngle + 3);
        const baseR = polarToCartesian(cx, cy, signRingInner + 10, mcAngle - 3);
        return (
          <g>
            <polygon
              points={`${tipPos.x},${tipPos.y} ${baseL.x},${baseL.y} ${baseR.x},${baseR.y}`}
              fill="#3b82f6"
              fillOpacity={0.9}
            />
            <text
              x={polarToCartesian(cx, cy, outerR + size * 0.02, mcAngle).x}
              y={polarToCartesian(cx, cy, outerR + size * 0.02, mcAngle).y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#3b82f6"
              fontSize={size * 0.022}
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              MC
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
