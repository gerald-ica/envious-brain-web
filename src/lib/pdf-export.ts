import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Profile {
  name: string;
  birthDate: string;
  birthTime: string;
  lat: number;
  lon: number;
  timezone?: string;
  city?: string;
}

export interface ExportProgress {
  stage: string;
  percent: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Constants — colors (RGB tuples)
// ---------------------------------------------------------------------------

const NAVY: [number, number, number] = [10, 14, 26];
const GOLD: [number, number, number] = [201, 168, 76];
const CYAN: [number, number, number] = [0, 212, 255];
const WHITE: [number, number, number] = [232, 230, 224];
const MUTED: [number, number, number] = [160, 160, 160];
const TABLE_HDR: [number, number, number] = [20, 37, 53];
const TABLE_ALT: [number, number, number] = [17, 24, 39];
const PURPLE: [number, number, number] = [139, 92, 246];
const EMERALD: [number, number, number] = [16, 185, 129];
const ROSE: [number, number, number] = [244, 63, 94];

// ---------------------------------------------------------------------------
// Zodiac / medical astrology reference data
// ---------------------------------------------------------------------------

const SIGN_BODY: Record<string, string> = {
  Aries: "Head, face, brain, eyes",
  Taurus: "Throat, neck, thyroid, vocal cords",
  Gemini: "Lungs, arms, hands, nervous system",
  Cancer: "Stomach, breasts, chest, digestive system",
  Leo: "Heart, spine, upper back, blood circulation",
  Virgo: "Intestines, digestive system, spleen",
  Libra: "Kidneys, lower back, adrenal glands, skin",
  Scorpio: "Reproductive organs, bladder, colon",
  Sagittarius: "Hips, thighs, liver, sciatic nerve",
  Capricorn: "Knees, bones, joints, teeth, skin",
  Aquarius: "Ankles, circulatory system, shins",
  Pisces: "Feet, lymphatic system, immune system",
};

const SIGN_ELEMENT: Record<string, string> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
};

const SIGN_MODALITY: Record<string, string> = {
  Aries: "Cardinal", Taurus: "Fixed", Gemini: "Mutable", Cancer: "Cardinal",
  Leo: "Fixed", Virgo: "Mutable", Libra: "Cardinal", Scorpio: "Fixed",
  Sagittarius: "Mutable", Capricorn: "Cardinal", Aquarius: "Fixed", Pisces: "Mutable",
};

const PLANET_HEALTH: Record<string, string> = {
  Sun: "Vital force, heart, general constitution and vitality",
  Moon: "Emotional health, digestion, fluid balance, fertility",
  Mercury: "Nervous system, communication disorders, respiratory",
  Venus: "Throat, kidneys, skin, hormonal balance",
  Mars: "Energy levels, inflammation, fevers, accidents, surgery risk",
  Jupiter: "Liver, growth, weight gain, blood sugar",
  Saturn: "Chronic conditions, bones, teeth, joints, depression, restrictions",
  Uranus: "Nervous tension, spasms, sudden illness, circulation",
  Neptune: "Immune weakness, allergies, substance sensitivity, fatigue",
  Pluto: "Regeneration, elimination, cellular health, obsessive patterns",
};

const ELEMENT_HEALTH: Record<string, { risk: string; advice: string }> = {
  Fire: {
    risk: "Inflammation, burnout, fevers, overexertion, heart strain",
    advice: "Practice cooling exercises, adequate rest, anti-inflammatory diet, meditation to calm inner fire",
  },
  Earth: {
    risk: "Stiffness, weight gain, sluggish metabolism, joint problems, stagnation",
    advice: "Regular movement, stretching, lighter diet, avoid excessive comfort eating, stay hydrated",
  },
  Air: {
    risk: "Anxiety, respiratory issues, nervous exhaustion, insomnia, scattered energy",
    advice: "Grounding practices, breathwork, regular sleep schedule, reduce stimulants, nature walks",
  },
  Water: {
    risk: "Fluid retention, emotional eating, depression, immune vulnerability, lymphatic congestion",
    advice: "Dry brushing, lymphatic massage, emotional processing, boundary setting, reduce dairy and salt",
  },
};

const HOUSE_RULER_SIGN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const SIGN_TO_MBTI: Record<string, string> = {
  Aries: "ESTP", Taurus: "ISFJ", Gemini: "ENTP", Cancer: "ISFP",
  Leo: "ENFJ", Virgo: "ISTJ", Libra: "ENFP", Scorpio: "INTJ",
  Sagittarius: "ENTP", Capricorn: "ENTJ", Aquarius: "INTP", Pisces: "INFP",
};

const PLANET_GLYPH: Record<string, string> = {
  Sun: "\u2609", Moon: "\u263D", Mercury: "\u263F", Venus: "\u2640",
  Mars: "\u2642", Jupiter: "\u2643", Saturn: "\u2644", Uranus: "\u2645",
  Neptune: "\u2646", Pluto: "\u2647", NorthNode: "\u260A", Chiron: "\u26B7",
};

// ---------------------------------------------------------------------------
// Main export function
// ---------------------------------------------------------------------------

export async function generateComprehensiveReport(
  profile: Profile,
  onProgress?: (p: ExportProgress) => void,
): Promise<Blob> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const datetime = `${profile.birthDate}T${profile.birthTime || "12:00"}:00`;
  const W = doc.internal.pageSize.getWidth(); // 210
  const H = doc.internal.pageSize.getHeight(); // 297
  const M = 20; // margin
  const CW = W - 2 * M; // content width = 170
  let pageNum = 0;

  // =========================================================================
  // Helper functions
  // =========================================================================

  function darkPage() {
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, W, H, "F");
  }

  function addFooter() {
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("ENVI-OUS BRAIN \u2014 Comprehensive Natal Report", M, H - 10);
    doc.text(`Page ${pageNum}`, W - M, H - 10, { align: "right" });
  }

  function newPage() {
    doc.addPage();
    pageNum++;
    darkPage();
    addFooter();
  }

  function ensureSpace(y: number, needed: number): number {
    if (y + needed > H - 30) {
      newPage();
      return 25;
    }
    return y;
  }

  function sectionTitle(y: number, text: string): number {
    y = ensureSpace(y, 20);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GOLD);
    doc.text(text, M, y);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(M, y + 2, M + CW, y + 2);
    return y + 10;
  }

  function subTitle(y: number, text: string): number {
    y = ensureSpace(y, 14);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...CYAN);
    doc.text(text, M, y);
    return y + 7;
  }

  function bodyText(y: number, text: string, maxWidth?: number): number {
    if (!text) return y;
    y = ensureSpace(y, 10);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...WHITE);
    const lines = doc.splitTextToSize(text, maxWidth || CW);
    for (let i = 0; i < lines.length; i++) {
      y = ensureSpace(y, 5);
      doc.text(lines[i], M, y);
      y += 5;
    }
    return y + 2;
  }

  function italicText(y: number, text: string): number {
    if (!text) return y;
    y = ensureSpace(y, 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...MUTED);
    const lines = doc.splitTextToSize(text, CW);
    for (let i = 0; i < lines.length; i++) {
      y = ensureSpace(y, 5);
      doc.text(lines[i], M, y);
      y += 4.5;
    }
    return y + 2;
  }

  function labelValue(y: number, label: string, value: string, x?: number): number {
    if (!value) return y;
    const xPos = x || M;
    y = ensureSpace(y, 6);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...MUTED);
    doc.text(label, xPos, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...WHITE);
    doc.text(String(value), xPos + 42, y);
    return y + 5.5;
  }

  function styledTable(y: number, headers: string[], rows: string[][]): number {
    if (!rows.length) return y;
    y = ensureSpace(y, 20);
    autoTable(doc, {
      startY: y,
      head: [headers],
      body: rows,
      margin: { left: M, right: M },
      theme: "plain",
      styles: {
        fillColor: NAVY,
        textColor: WHITE,
        fontSize: 9,
        cellPadding: 2.5,
        lineWidth: 0.1,
        lineColor: [30, 41, 59],
      },
      headStyles: {
        fillColor: TABLE_HDR,
        textColor: CYAN,
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: TABLE_ALT,
      },
      didDrawPage: () => {
        darkPage();
        pageNum++;
        addFooter();
      },
    });
    return ((doc as any).lastAutoTable?.finalY ?? y + 20) + 5;
  }

  function coloredDot(y: number, x: number, color: [number, number, number]) {
    doc.setFillColor(...color);
    doc.circle(x, y - 1.2, 1.5, "F");
  }

  // =========================================================================
  // FETCH ALL DATA
  // =========================================================================

  onProgress?.({ stage: "Fetching chart data...", percent: 5 });

  const post = async (url: string, body: object): Promise<any> => {
    try {
      const res = await fetch(`${API_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  };

  const birthPayload = {
    datetime,
    latitude: profile.lat,
    longitude: profile.lon,
    timezone: profile.timezone || "UTC",
  };
  const baziPayload = { datetime, gender: "neutral" };

  // Batch 1: Core charts
  const [western, bazi, vedic, humanDesign, solarReturn, progressions] =
    await Promise.all([
      post("/api/v1/charts/western", birthPayload),
      post("/api/v1/charts/bazi", baziPayload),
      post("/api/v1/charts/vedic", birthPayload),
      post("/api/v1/charts/human-design", birthPayload),
      post("/api/v1/charts/solar-return", {
        ...birthPayload,
        target_year: new Date().getFullYear(),
      }),
      post("/api/v1/charts/progressions", {
        ...birthPayload,
        target_date: new Date().toISOString(),
      }),
    ]);

  onProgress?.({ stage: "Fetching advanced analysis...", percent: 25 });

  // Extract key signs
  const sunSign = western?.positions?.Sun?.sign || "Aries";
  const moonSign = western?.positions?.Moon?.sign || "Cancer";
  const houses: any[] = western?.houses || [];
  const h1 = houses.find((h: any) => h.number === 1 || h.house === 1);
  const ascSign = h1?.sign || "Libra";
  const mbtiType = SIGN_TO_MBTI[sunSign] || "INTJ";

  // Build position maps
  const flatPositions: Record<string, number> = {};
  const posWithSign: Record<string, { longitude: number; sign: string; degree?: number; house?: number; speed?: number; retrograde?: boolean }> = {};
  if (western?.positions) {
    for (const [p, d] of Object.entries(western.positions)) {
      const pd = d as any;
      flatPositions[p] = pd.longitude || 0;
      posWithSign[p] = {
        longitude: pd.longitude || 0,
        sign: pd.sign || "",
        degree: pd.degree_in_sign ?? pd.degree ?? 0,
        house: pd.house,
        speed: pd.speed,
        retrograde: pd.retrograde || (pd.speed != null && pd.speed < 0),
      };
    }
  }

  const dignityPlanets: Record<string, any> = {};
  if (western?.positions) {
    for (const [p, d] of Object.entries(western.positions)) {
      const pd = d as any;
      dignityPlanets[p] = {
        sign: pd.sign,
        degree: pd.degree_in_sign || 0,
        house: pd.house || 1,
        speed: pd.speed || 1,
      };
    }
  }

  // Batch 2: Advanced + personality
  const [
    northNode, chiron, fixedStars, arabicParts, harmonics,
    enneagram, synthesis, biorhythm, archetypes, colorPalette,
    spiritAnimal, tarotCards, convergence,
  ] = await Promise.all([
    post("/api/v1/western/north-node", birthPayload),
    post("/api/v1/western/chiron", birthPayload),
    post("/api/v1/western/fixed-stars", birthPayload),
    post("/api/v1/western/arabic-parts", birthPayload),
    post("/api/v1/western/harmonics", { ...birthPayload, harmonic_number: 7 }),
    post("/api/v1/personality/enneagram", { mbti_type: mbtiType }),
    post("/api/v1/personality/calculate", { mbti_type: mbtiType }),
    post("/api/v1/personality/biorhythm", {
      birth_date: profile.birthDate,
      target_date: new Date().toISOString().split("T")[0],
    }),
    post("/api/v1/psychology/jungian-archetypes", {
      sun_sign: sunSign,
      moon_sign: moonSign,
      ascendant: ascSign,
    }),
    post("/api/v1/psychology/color-palette", {
      sun_sign: sunSign,
      moon_sign: moonSign,
      rising_sign: ascSign,
    }),
    post("/api/v1/psychology/spirit-animal", {
      sun_sign: sunSign,
      moon_sign: moonSign,
      rising_sign: ascSign,
      birth_year: parseInt(profile.birthDate.split("-")[0]),
      birth_month: parseInt(profile.birthDate.split("-")[1]),
      birth_day: parseInt(profile.birthDate.split("-")[2]),
    }),
    post("/api/v1/personality/tarot/birth-cards", {
      birth_date: profile.birthDate,
    }),
    post("/api/v1/personality/cosmic-convergence", birthPayload),
  ]);

  onProgress?.({ stage: "Fetching techniques...", percent: 50 });

  // Batch 3: Techniques + integration + Chinese
  const [
    sabianSymbols, dignities, sect, profection, dynamicPersonality,
    elementBalance, nineStarKi, fengShui, transits,
  ] = await Promise.all([
    post("/api/v1/techniques/sabian-symbols", {
      planet_positions: flatPositions,
    }),
    post("/api/v1/techniques/dignities", {
      chart_data: { planets: dignityPlanets },
    }),
    post("/api/v1/western/hellenistic/sect", birthPayload),
    post("/api/v1/western/hellenistic/profection", {
      birth_year: parseInt(profile.birthDate.split("-")[0]),
      current_year: new Date().getFullYear(),
      asc_sign: ascSign,
    }),
    post("/api/v1/integration/dynamic-personality", {
      birth_data: {
        birth_datetime: datetime,
        latitude: profile.lat,
        longitude: profile.lon,
      },
      target_datetime: new Date().toISOString(),
    }),
    post("/api/v1/integration/element-balance", birthPayload),
    post("/api/v1/chinese/ninestarki/calculate", {
      birth_year: parseInt(profile.birthDate.split("-")[0]),
      birth_month: parseInt(profile.birthDate.split("-")[1]),
    }),
    post("/api/v1/chinese/fengshui/chart", {
      year: parseInt(profile.birthDate.split("-")[0]),
      facing_direction: "South",
    }),
    post("/api/v1/transits/current", {
      natal_positions: Object.fromEntries(
        Object.entries(flatPositions).map(([k, v]) => [k, { longitude: v }]),
      ),
    }),
  ]);

  onProgress?.({ stage: "Generating PDF...", percent: 75 });

  // =========================================================================
  // PAGE 1: COVER
  // =========================================================================
  darkPage();
  pageNum = 1;

  // Decorative top bar
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, W, 3, "F");

  // Title block
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("ENVI-OUS BRAIN", W / 2, 70, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...WHITE);
  doc.text("Comprehensive Natal Report", W / 2, 82, { align: "center" });

  // Decorative line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(W / 2 - 40, 90, W / 2 + 40, 90);

  // Profile info
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text(profile.name, W / 2, 110, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text(
    `Born ${profile.birthDate} at ${profile.birthTime || "12:00"}`,
    W / 2, 120,
    { align: "center" },
  );
  doc.text(
    profile.city || `${profile.lat.toFixed(4)}, ${profile.lon.toFixed(4)}`,
    W / 2, 127,
    { align: "center" },
  );

  // Big Three
  const bigThreeY = 148;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("THE BIG THREE", W / 2, bigThreeY, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...WHITE);
  const bigThreeText = `\u2609 Sun in ${sunSign}    \u263D Moon in ${moonSign}    \u2191 Rising ${ascSign}`;
  doc.text(bigThreeText, W / 2, bigThreeY + 10, { align: "center" });

  // Generation date
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    W / 2, H - 30,
    { align: "center" },
  );

  // Bottom bar
  doc.setFillColor(...GOLD);
  doc.rect(0, H - 3, W, 3, "F");

  addFooter();

  // =========================================================================
  // PAGE 2: TABLE OF CONTENTS
  // =========================================================================
  newPage();
  let y = 30;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("Table of Contents", W / 2, y, { align: "center" });
  y += 15;

  const tocItems = [
    ["1", "Natal Chart Overview", "3"],
    ["2", "Planetary Analysis", "5"],
    ["3", "Essential Dignities", "7"],
    ["4", "Fixed Stars & Arabic Parts", "8"],
    ["5", "Health Reading", "9"],
    ["6", "Vedic / Sidereal Analysis", "12"],
    ["7", "BaZi Four Pillars", "13"],
    ["8", "Personality Synthesis", "15"],
    ["9", "Tarot & Numerology", "18"],
    ["10", "Cosmic Timing", "19"],
    ["11", "Sabian Symbols", "22"],
    ["12", "Nine Star Ki & Feng Shui", "24"],
    ["13", "Cross-System Synthesis", "25"],
    ["", "Appendix: Disclaimer", "28"],
  ];

  for (const [num, title, pg] of tocItems) {
    doc.setFontSize(11);
    doc.setFont("helvetica", num ? "bold" : "italic");
    doc.setTextColor(...WHITE);
    const label = num ? `Chapter ${num}: ${title}` : title;
    doc.text(label, M + 5, y);
    doc.setTextColor(...MUTED);
    doc.text(pg, W - M, y, { align: "right" });
    // Dot leader
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.2);
    const labelWidth = doc.getTextWidth(label);
    const pgWidth = doc.getTextWidth(pg);
    const dotStart = M + 5 + labelWidth + 3;
    const dotEnd = W - M - pgWidth - 3;
    if (dotEnd > dotStart) {
      doc.setLineDashPattern([0.5, 2], 0);
      doc.line(dotStart, y + 1, dotEnd, y + 1);
      doc.setLineDashPattern([], 0);
    }
    y += 8;
  }

  // =========================================================================
  // CHAPTER 1: NATAL CHART OVERVIEW
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Chapter 1: Natal Chart Overview");

  // Interpretation summary
  y = bodyText(y, `This natal chart was cast for ${profile.name}, born on ${profile.birthDate} at ${profile.birthTime || "12:00"} in ${profile.city || "the specified location"}. The Sun in ${sunSign} illuminates your core identity with ${SIGN_ELEMENT[sunSign] || "elemental"} energy, while the Moon in ${moonSign} colors your emotional landscape. With ${ascSign} rising, you present a ${SIGN_ELEMENT[ascSign] || ""} face to the world.`);
  y += 3;

  // Planet positions table
  y = subTitle(y, "Planetary Positions");
  const planetOrder = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "NorthNode", "Chiron"];
  const posRows: string[][] = [];
  for (const planet of planetOrder) {
    const info = posWithSign[planet];
    if (!info) continue;
    const glyph = PLANET_GLYPH[planet] || "";
    const retro = info.retrograde ? "R" : "";
    posRows.push([
      `${glyph} ${planet}`,
      info.sign,
      `${(info.degree ?? 0).toFixed(2)}\u00b0`,
      String(info.house ?? "-"),
      info.speed != null ? info.speed.toFixed(4) : "-",
      retro,
    ]);
  }
  y = styledTable(y, ["Planet", "Sign", "Degree", "House", "Speed", "Rx"], posRows);

  // Aspects table
  const aspects: any[] = western?.aspects || [];
  if (aspects.length > 0) {
    y = subTitle(y, "Aspects");
    const aspRows = aspects.slice(0, 30).map((a: any) => [
      a.planet1 || a.p1 || "-",
      a.aspect || a.type || "-",
      a.planet2 || a.p2 || "-",
      a.orb != null ? `${Number(a.orb).toFixed(2)}\u00b0` : "-",
      a.applying != null ? (a.applying ? "Applying" : "Separating") : "-",
    ]);
    y = styledTable(y, ["Planet 1", "Aspect", "Planet 2", "Orb", "Status"], aspRows);
  }

  // House cusps
  if (houses.length > 0) {
    y = ensureSpace(y, 40);
    y = subTitle(y, "House Cusps");
    const houseRows = houses.map((h: any) => [
      `House ${h.number || h.house || "-"}`,
      h.sign || "-",
      h.degree != null ? `${Number(h.degree).toFixed(2)}\u00b0` : "-",
    ]);
    y = styledTable(y, ["House", "Sign", "Degree"], houseRows);
  }

  // Element & Modality distribution
  y = ensureSpace(y, 40);
  y = subTitle(y, "Element & Modality Distribution");

  const elemCount: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modCount: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  for (const planet of planetOrder) {
    const sign = posWithSign[planet]?.sign;
    if (sign && SIGN_ELEMENT[sign]) elemCount[SIGN_ELEMENT[sign]]++;
    if (sign && SIGN_MODALITY[sign]) modCount[SIGN_MODALITY[sign]]++;
  }

  const distRows = [
    ["Fire \ud83d\udd25", String(elemCount.Fire), "Cardinal", String(modCount.Cardinal)],
    ["Earth \ud83c\udf0d", String(elemCount.Earth), "Fixed", String(modCount.Fixed)],
    ["Air \ud83d\udca8", String(elemCount.Air), "Mutable", String(modCount.Mutable)],
    ["Water \ud83d\udca7", String(elemCount.Water), "", ""],
  ];
  y = styledTable(y, ["Element", "Count", "Modality", "Count"], distRows);

  const dominantElement = Object.entries(elemCount).sort((a, b) => b[1] - a[1])[0];
  const dominantModality = Object.entries(modCount).sort((a, b) => b[1] - a[1])[0];
  y = bodyText(y, `Your chart is dominated by ${dominantElement[0]} energy (${dominantElement[1]} placements) and ${dominantModality[0]} mode (${dominantModality[1]} placements). This suggests a temperament that is ${dominantElement[0] === "Fire" ? "passionate and action-oriented" : dominantElement[0] === "Earth" ? "practical and grounded" : dominantElement[0] === "Air" ? "intellectual and communicative" : "intuitive and emotionally attuned"}, with a ${dominantModality[0] === "Cardinal" ? "leadership-driven, initiating" : dominantModality[0] === "Fixed" ? "persistent, determined" : "adaptable, versatile"} approach to life.`);

  // =========================================================================
  // CHAPTER 2: PLANETARY ANALYSIS
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Chapter 2: Planetary Analysis");

  const planetInterpretations: Record<string, (sign: string) => string> = {
    Sun: (s) => `Your Sun in ${s} represents your core identity and life purpose. As a ${SIGN_ELEMENT[s]} sign, your vital energy expresses through ${SIGN_ELEMENT[s] === "Fire" ? "enthusiasm, courage, and creative self-expression" : SIGN_ELEMENT[s] === "Earth" ? "practicality, stability, and material mastery" : SIGN_ELEMENT[s] === "Air" ? "intellect, communication, and social connection" : "emotion, intuition, and deep inner knowing"}. ${s} energy drives you to ${s === "Aries" ? "pioneer and lead" : s === "Taurus" ? "build and sustain" : s === "Gemini" ? "learn and communicate" : s === "Cancer" ? "nurture and protect" : s === "Leo" ? "create and inspire" : s === "Virgo" ? "analyze and serve" : s === "Libra" ? "harmonize and connect" : s === "Scorpio" ? "transform and probe depths" : s === "Sagittarius" ? "explore and philosophize" : s === "Capricorn" ? "achieve and structure" : s === "Aquarius" ? "innovate and reform" : "imagine and transcend"}.`,
    Moon: (s) => `Your Moon in ${s} reveals your emotional nature, instinctive reactions, and deepest needs. In ${s}, you process feelings through a ${SIGN_ELEMENT[s]} lens \u2014 ${SIGN_ELEMENT[s] === "Fire" ? "you need excitement, freedom, and recognition to feel emotionally secure" : SIGN_ELEMENT[s] === "Earth" ? "you crave stability, routine, and tangible comfort for emotional wellbeing" : SIGN_ELEMENT[s] === "Air" ? "you process emotions intellectually and need mental stimulation and social variety" : "you feel deeply and need emotional intimacy, safety, and creative outlets"}. Your inner world is rich with ${s} themes.`,
    Mercury: (s) => `Mercury in ${s} shapes how you think, communicate, and process information. In this ${SIGN_ELEMENT[s]} sign, your mental style is ${SIGN_ELEMENT[s] === "Fire" ? "quick, enthusiastic, and direct \u2014 you think on your feet and communicate with passion" : SIGN_ELEMENT[s] === "Earth" ? "methodical, practical, and thorough \u2014 you prefer concrete facts over abstract theories" : SIGN_ELEMENT[s] === "Air" ? "swift, analytical, and versatile \u2014 you excel at making connections between ideas" : "intuitive, imaginative, and empathetic \u2014 you absorb information through feeling"}.`,
    Venus: (s) => `Venus in ${s} defines your approach to love, beauty, and values. In this placement, you are attracted to ${SIGN_ELEMENT[s] === "Fire" ? "passionate, adventurous connections and bold aesthetic choices" : SIGN_ELEMENT[s] === "Earth" ? "sensual, reliable partnerships and refined, natural beauty" : SIGN_ELEMENT[s] === "Air" ? "intellectual rapport, witty banter, and elegant aesthetics" : "deep emotional bonds, romantic gestures, and artistic expression"}. Your relationship style emphasizes ${s} qualities.`,
    Mars: (s) => `Mars in ${s} drives your energy, ambition, and assertiveness. This placement gives you a ${SIGN_ELEMENT[s] === "Fire" ? "bold, direct, and competitive drive \u2014 you act decisively and fight for what you want" : SIGN_ELEMENT[s] === "Earth" ? "steady, persistent, and practical drive \u2014 you build toward goals with patience" : SIGN_ELEMENT[s] === "Air" ? "strategic, verbal, and socially motivated drive \u2014 you fight with ideas and words" : "emotionally fueled, subtle, and tenacious drive \u2014 your passion runs deep beneath the surface"}.`,
    Jupiter: (s) => `Jupiter in ${s} reveals where you find growth, abundance, and meaning. This expansive planet in a ${SIGN_ELEMENT[s]} sign suggests that your greatest opportunities come through ${SIGN_ELEMENT[s] === "Fire" ? "bold ventures, leadership, and creative risk-taking" : SIGN_ELEMENT[s] === "Earth" ? "practical investments, career building, and material development" : SIGN_ELEMENT[s] === "Air" ? "education, networking, and intellectual pursuits" : "spiritual exploration, healing work, and emotional intelligence"}.`,
    Saturn: (s) => `Saturn in ${s} shows where you face your greatest challenges and ultimately build lasting mastery. In ${s}, your life lessons center around ${SIGN_ELEMENT[s] === "Fire" ? "managing ego, developing patience, and learning to lead wisely" : SIGN_ELEMENT[s] === "Earth" ? "building real-world competence, managing resources, and accepting limitations" : SIGN_ELEMENT[s] === "Air" ? "disciplining the mind, committing to ideas, and mastering communication" : "emotional maturity, boundary-setting, and confronting fears"}. This is your path to wisdom.`,
    Uranus: (s) => `Uranus in ${s} is a generational placement that colors how your age group approaches innovation and rebellion. In ${s}, your generation brings revolutionary energy to ${SIGN_ELEMENT[s]} domains, challenging established norms and pioneering new approaches.`,
    Neptune: (s) => `Neptune in ${s} is a generational influence shaping collective dreams, spirituality, and illusions. Your generation's spiritual quest is filtered through ${s} energy, bringing both inspiration and potential confusion to ${SIGN_ELEMENT[s]} themes.`,
    Pluto: (s) => `Pluto in ${s} marks a generational transformation of ${s} themes. Your age group is collectively working to transform how society relates to ${SIGN_ELEMENT[s] === "Fire" ? "power, identity, and creative expression" : SIGN_ELEMENT[s] === "Earth" ? "resources, institutions, and material structures" : SIGN_ELEMENT[s] === "Air" ? "information, communication, and social systems" : "emotional bonds, collective psychology, and spiritual evolution"}.`,
  };

  const personalPlanets = ["Sun", "Moon", "Mercury", "Venus", "Mars"];
  const socialPlanets = ["Jupiter", "Saturn"];
  const outerPlanets = ["Uranus", "Neptune", "Pluto"];

  y = subTitle(y, "Personal Planets");
  for (const planet of personalPlanets) {
    const info = posWithSign[planet];
    if (!info) continue;
    y = ensureSpace(y, 30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PURPLE);
    doc.text(`${PLANET_GLYPH[planet] || ""} ${planet} in ${info.sign}`, M, y);
    y += 6;
    if (planetInterpretations[planet]) {
      y = bodyText(y, planetInterpretations[planet](info.sign));
    }
    y += 2;
  }

  y = subTitle(y, "Social Planets");
  for (const planet of socialPlanets) {
    const info = posWithSign[planet];
    if (!info) continue;
    y = ensureSpace(y, 25);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PURPLE);
    doc.text(`${PLANET_GLYPH[planet] || ""} ${planet} in ${info.sign}`, M, y);
    y += 6;
    if (planetInterpretations[planet]) {
      y = bodyText(y, planetInterpretations[planet](info.sign));
    }
    y += 2;
  }

  y = subTitle(y, "Outer Planets (Generational)");
  for (const planet of outerPlanets) {
    const info = posWithSign[planet];
    if (!info) continue;
    y = ensureSpace(y, 20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PURPLE);
    doc.text(`${PLANET_GLYPH[planet] || ""} ${planet} in ${info.sign}`, M, y);
    y += 6;
    if (planetInterpretations[planet]) {
      y = bodyText(y, planetInterpretations[planet](info.sign));
    }
    y += 2;
  }

  // North Node
  if (northNode) {
    y = ensureSpace(y, 30);
    y = subTitle(y, "North Node \u2014 Karmic Purpose");
    const nn = northNode.data ?? northNode;
    y = bodyText(y, nn.interpretation || nn.description || `Your North Node points toward your soul's growth direction in this lifetime. The karmic lessons indicated by this placement encourage you to develop qualities you may not naturally gravitate toward, moving beyond past-life comfort zones.`);
    if (nn.sign) y = labelValue(y, "North Node Sign:", nn.sign);
    if (nn.house) y = labelValue(y, "North Node House:", String(nn.house));
  }

  // Chiron
  if (chiron) {
    y = ensureSpace(y, 30);
    y = subTitle(y, "Chiron \u2014 The Wounded Healer");
    const ch = chiron.data ?? chiron;
    y = bodyText(y, ch.interpretation || ch.description || `Chiron reveals your deepest wound and your greatest capacity for healing others. This placement shows where you carry pain that ultimately becomes your source of wisdom and compassion.`);
    if (ch.sign) y = labelValue(y, "Chiron Sign:", ch.sign);
    if (ch.house) y = labelValue(y, "Chiron House:", String(ch.house));
  }

  // =========================================================================
  // CHAPTER 3: ESSENTIAL DIGNITIES
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Chapter 3: Essential Dignities");

  y = bodyText(y, "Essential dignities reveal the strength and condition of each planet based on its sign placement. A planet in domicile or exaltation operates with ease and power, while a planet in detriment or fall must work harder to express its energy constructively.");
  y += 3;

  if (dignities) {
    const digData = dignities.data ?? dignities;
    const digPlanets = digData.planets || digData.dignities || digData;
    if (typeof digPlanets === "object" && !Array.isArray(digPlanets)) {
      const digRows: string[][] = [];
      for (const [planet, info] of Object.entries(digPlanets)) {
        const d = info as any;
        digRows.push([
          planet,
          d.sign || "-",
          d.dignity || d.essential_dignity || d.status || "-",
          d.score != null ? String(d.score) : "-",
          d.ruler || "-",
        ]);
      }
      if (digRows.length > 0) {
        y = styledTable(y, ["Planet", "Sign", "Dignity", "Score", "Ruler"], digRows);
      }
    } else if (Array.isArray(digPlanets)) {
      const digRows = digPlanets.map((d: any) => [
        d.planet || "-",
        d.sign || "-",
        d.dignity || d.essential_dignity || d.status || "-",
        d.score != null ? String(d.score) : "-",
        d.ruler || "-",
      ]);
      y = styledTable(y, ["Planet", "Sign", "Dignity", "Score", "Ruler"], digRows);
    }
  } else {
    // Fallback: derive basic dignity from positions
    y = bodyText(y, "Dignity data not available from the server. Based on the chart positions, your planetary placements suggest the following general conditions:");
    const basicDig: string[][] = [];
    for (const planet of planetOrder.slice(0, 10)) {
      const info = posWithSign[planet];
      if (info) {
        basicDig.push([planet, info.sign, `${(info.degree ?? 0).toFixed(1)}\u00b0`, "-", "-"]);
      }
    }
    y = styledTable(y, ["Planet", "Sign", "Degree", "Dignity", "Notes"], basicDig);
  }

  y = bodyText(y, "Planets with strong dignity (domicile, exaltation) in your chart indicate areas of natural talent and ease. Planets in weaker dignity (detriment, fall) highlight growth areas where conscious effort yields the most transformation.");

  // =========================================================================
  // CHAPTER 4: FIXED STARS & ARABIC PARTS
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Chapter 4: Fixed Stars & Arabic Parts");

  // Fixed Stars
  y = subTitle(y, "Fixed Star Conjunctions");
  y = bodyText(y, "When natal planets align with prominent fixed stars, their energy is colored by the star's ancient mythological and astrological significance. These conjunctions add a layer of fate and destiny to your chart.");
  y += 2;

  if (fixedStars) {
    const fsData = fixedStars.data ?? fixedStars;
    const conj: any[] = fsData.conjunctions || fsData.fixed_stars || [];
    if (conj.length > 0) {
      const fsRows = conj.map((c: any) => {
        const keywords = Array.isArray(c.star_keywords)
          ? c.star_keywords.join(", ")
          : c.star_keywords || c.keywords || "-";
        return [
          c.star || c.name || "-",
          c.planet || "-",
          c.orb != null ? `${Number(c.orb).toFixed(2)}\u00b0` : "-",
          c.star_nature || c.nature || "-",
          keywords,
        ];
      });
      y = styledTable(y, ["Star", "Planet", "Orb", "Nature", "Keywords"], fsRows);
    } else {
      y = bodyText(y, "No significant fixed star conjunctions found within standard orb for this chart.");
    }
  } else {
    y = italicText(y, "Fixed star data was not available for this chart.");
  }

  // Arabic Parts
  y = ensureSpace(y, 30);
  y = subTitle(y, "Arabic Parts (Lots)");
  y = bodyText(y, "The Arabic Parts are calculated points that synthesize multiple chart factors into focused themes. They were central to medieval astrology and offer nuanced insight into specific life areas.");
  y += 2;

  if (arabicParts) {
    const apData = arabicParts.data ?? arabicParts;
    const parts: any[] = apData.parts || apData.lots || apData.arabic_parts || [];
    if (Array.isArray(parts) && parts.length > 0) {
      const apRows = parts.map((p: any) => [
        p.name || p.part || "-",
        p.sign || "-",
        p.degree != null ? `${Number(p.degree).toFixed(2)}\u00b0` : "-",
        p.house != null ? String(p.house) : "-",
      ]);
      y = styledTable(y, ["Part", "Sign", "Degree", "House"], apRows);
    } else if (typeof apData === "object") {
      const apRows: string[][] = [];
      for (const [name, val] of Object.entries(apData)) {
        if (typeof val === "object" && val) {
          const v = val as any;
          apRows.push([name, v.sign || "-", v.degree != null ? `${Number(v.degree).toFixed(2)}\u00b0` : "-", v.house != null ? String(v.house) : "-"]);
        }
      }
      if (apRows.length > 0) {
        y = styledTable(y, ["Part", "Sign", "Degree", "House"], apRows);
      }
    }
  } else {
    y = italicText(y, "Arabic Parts data was not available for this chart.");
  }

  // =========================================================================
  // CHAPTER 5: HEALTH READING (comprehensive)
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Chapter 5: Health Reading");

  y = bodyText(y, "Medical astrology provides a symbolic framework for understanding the body-mind connection through the natal chart. This analysis maps planetary energies to physical systems, identifying areas of strength and vulnerability. This is for self-awareness purposes only and is not a substitute for professional medical advice.");
  y += 3;

  // 5a. Ascendant / Constitution
  y = subTitle(y, "General Constitution (1st House / Ascendant)");
  y = bodyText(y, `With ${ascSign} rising, your general constitution and physical vitality are influenced by ${SIGN_ELEMENT[ascSign]} energy. The Ascendant represents your body type tendency and how your vitality manifests physically.`);
  y = labelValue(y, "Ascendant Sign:", ascSign);
  y = labelValue(y, "Body Zone:", SIGN_BODY[ascSign] || "General");
  y = bodyText(y, `${ascSign} rising individuals typically have a ${ascSign === "Aries" ? "strong, athletic build with notable facial features and high energy" : ascSign === "Taurus" ? "sturdy, well-built frame with a strong neck and pleasant appearance" : ascSign === "Gemini" ? "slender, youthful appearance with expressive hands and quick movements" : ascSign === "Cancer" ? "rounded features, sensitive digestion, and fluctuating vitality tied to emotions" : ascSign === "Leo" ? "strong back, good posture, warm complexion, and robust heart energy" : ascSign === "Virgo" ? "refined features, sensitive digestive system, and detail-oriented nervous system" : ascSign === "Libra" ? "balanced proportions, kidney sensitivity, and skin that reflects inner harmony" : ascSign === "Scorpio" ? "intense presence, strong regenerative capacity, and powerful elimination system" : ascSign === "Sagittarius" ? "tall or expansive build, strong hips/thighs, and active liver" : ascSign === "Capricorn" ? "lean, structured bone system, strong teeth, but watch joints and knees" : ascSign === "Aquarius" ? "unique appearance, active circulatory system, and sensitive ankles" : "soft features, sensitive feet, strong lymphatic system, and permeable immune barriers"}.`);
  y += 3;

  // 5b. 6th House analysis
  const h6 = houses.find((h: any) => (h.number || h.house) === 6);
  const h6Sign = h6?.sign || HOUSE_RULER_SIGN[5] || "Virgo";
  y = subTitle(y, "Daily Health & Habits (6th House)");
  y = labelValue(y, "6th House Sign:", h6Sign);
  y = labelValue(y, "Body Zone:", SIGN_BODY[h6Sign] || "Digestive system");
  y = bodyText(y, `The 6th house governs daily health routines, susceptibility to illness, and the body's areas of functional weakness. With ${h6Sign} on your 6th house cusp, your health habits are colored by ${SIGN_ELEMENT[h6Sign]} energy. You benefit from ${SIGN_ELEMENT[h6Sign] === "Fire" ? "active exercise, competitive sports, and avoiding burnout" : SIGN_ELEMENT[h6Sign] === "Earth" ? "consistent routines, nutritious whole foods, and nature walks" : SIGN_ELEMENT[h6Sign] === "Air" ? "varied exercise, social health activities, and breathing exercises" : "swimming, emotional self-care, and adequate rest near water"}.`);

  // Planets in 6th house
  const planetsIn6: string[] = [];
  for (const [p, info] of Object.entries(posWithSign)) {
    if (info.house === 6) planetsIn6.push(p);
  }
  if (planetsIn6.length > 0) {
    y = bodyText(y, `Planets in your 6th house: ${planetsIn6.join(", ")}. Each planet adds its own health dimension:`);
    for (const p of planetsIn6) {
      if (PLANET_HEALTH[p]) {
        y = labelValue(y, `  ${p}:`, PLANET_HEALTH[p]);
      }
    }
  } else {
    y = bodyText(y, "No planets reside in your 6th house, suggesting that health matters are primarily indicated by the sign on the cusp and its ruling planet rather than direct planetary influence.");
  }
  y += 3;

  // 5c. Key planetary health indicators
  y = subTitle(y, "Planetary Health Indicators");
  const healthPlanets = ["Sun", "Moon", "Mars", "Saturn"];
  const healthRows: string[][] = [];
  for (const planet of healthPlanets) {
    const info = posWithSign[planet];
    if (info) {
      healthRows.push([
        `${PLANET_GLYPH[planet] || ""} ${planet}`,
        info.sign,
        SIGN_BODY[info.sign] || "-",
        PLANET_HEALTH[planet] || "-",
      ]);
    }
  }
  y = styledTable(y, ["Planet", "Sign", "Body Zone", "Health Theme"], healthRows);

  y = bodyText(y, `Your Sun in ${sunSign} concentrates vital force in the ${SIGN_BODY[sunSign]?.toLowerCase() || "body"} area. The Moon in ${moonSign} influences your emotional health and ${SIGN_BODY[moonSign]?.toLowerCase() || "digestive"} function. Mars in ${posWithSign.Mars?.sign || "unknown"} directs your physical energy and indicates where inflammation or injury may occur. Saturn in ${posWithSign.Saturn?.sign || "unknown"} shows where chronic conditions may develop over time.`);
  y += 3;

  // 5d. 8th and 12th house
  const h8 = houses.find((h: any) => (h.number || h.house) === 8);
  const h12 = houses.find((h: any) => (h.number || h.house) === 12);
  const h8Sign = h8?.sign || HOUSE_RULER_SIGN[7] || "Scorpio";
  const h12Sign = h12?.sign || HOUSE_RULER_SIGN[11] || "Pisces";

  y = subTitle(y, "Regeneration & Hidden Health");
  y = labelValue(y, "8th House (Regeneration):", `${h8Sign} \u2014 ${SIGN_BODY[h8Sign] || ""}`);
  y = bodyText(y, `The 8th house governs regeneration, surgery, and crisis health events. With ${h8Sign} here, your body's healing capacity is connected to ${SIGN_ELEMENT[h8Sign]} processes.`);
  y = labelValue(y, "12th House (Hidden Issues):", `${h12Sign} \u2014 ${SIGN_BODY[h12Sign] || ""}`);
  y = bodyText(y, `The 12th house reveals hidden or chronic health patterns that may be difficult to diagnose. ${h12Sign} energy here suggests paying attention to ${SIGN_BODY[h12Sign]?.toLowerCase() || "subtle health"} concerns, especially during periods of stress or isolation.`);
  y += 3;

  // 5e. Element balance health analysis
  y = subTitle(y, "Element Balance & Health");
  const elemHealthRows: string[][] = [];
  for (const elem of ["Fire", "Earth", "Air", "Water"]) {
    const count = elemCount[elem] || 0;
    const status = count >= 4 ? "Dominant" : count >= 2 ? "Balanced" : count === 1 ? "Weak" : "Absent";
    elemHealthRows.push([
      elem,
      String(count),
      status,
      ELEMENT_HEALTH[elem]?.risk || "-",
    ]);
  }
  y = styledTable(y, ["Element", "Planets", "Status", "Health Risks"], elemHealthRows);

  // Dominant element health advice
  if (dominantElement) {
    const healthInfo = ELEMENT_HEALTH[dominantElement[0]];
    if (healthInfo) {
      y = bodyText(y, `With ${dominantElement[0]} as your dominant element (${dominantElement[1]} placements), you should be aware of: ${healthInfo.risk}.`);
      y = bodyText(y, `Recommendations: ${healthInfo.advice}.`);
    }
  }

  // Weak element health advice
  const weakElements = Object.entries(elemCount).filter(([, c]) => c === 0 || c === 1);
  if (weakElements.length > 0) {
    y = bodyText(y, `You have ${weakElements.map(([e, c]) => `${c === 0 ? "no" : "only one"} ${e}`).join(" and ")} placement${weakElements.length > 1 ? "s" : ""}. Deficiency in ${weakElements.map(([e]) => e).join("/")} may manifest as ${weakElements.map(([e]) => ELEMENT_HEALTH[e]?.risk.split(",")[0] || e + " imbalance").join("; ")}. Consider actively cultivating these elements through lifestyle choices.`);
  }
  y += 3;

  // 5f. Biorhythm current state
  if (biorhythm) {
    y = subTitle(y, "Current Biorhythm State");
    const bio = biorhythm.data ?? biorhythm;
    const cycles = bio.cycles || bio;
    y = labelValue(y, "Physical:", `${cycles.physical != null ? `${Math.round(Number(cycles.physical))}%` : "N/A"}`);
    y = labelValue(y, "Emotional:", `${cycles.emotional != null ? `${Math.round(Number(cycles.emotional))}%` : "N/A"}`);
    y = labelValue(y, "Intellectual:", `${cycles.intellectual != null ? `${Math.round(Number(cycles.intellectual))}%` : "N/A"}`);

    const phys = Number(cycles.physical || 0);
    const emot = Number(cycles.emotional || 0);
    const intel = Number(cycles.intellectual || 0);
    y = bodyText(y, `Your current biorhythm shows ${phys > 60 ? "high physical energy \u2014 a good time for exercise and physical challenges" : phys > 30 ? "moderate physical energy \u2014 maintain regular activity" : "low physical energy \u2014 prioritize rest and recovery"}. Emotionally, you are ${emot > 60 ? "in a peak period, feeling emotionally resilient and expressive" : emot > 30 ? "in a balanced emotional state" : "in a low emotional phase \u2014 practice extra self-care and avoid major emotional decisions"}. Intellectually, ${intel > 60 ? "your mind is sharp and receptive \u2014 ideal for study and complex work" : intel > 30 ? "mental energy is stable and functional" : "focus may be lower than usual \u2014 break tasks into smaller steps"}.`);
  }

  // 5g. Personalized recommendations
  y = ensureSpace(y, 30);
  y = subTitle(y, "Personalized Health Recommendations");
  y = bodyText(y, `Based on your complete chart analysis, here are tailored health recommendations for ${profile.name}:`);
  y += 2;

  const recommendations = [
    `1. Primary Focus Area: ${SIGN_BODY[h6Sign] || "general wellness"} (6th house in ${h6Sign}). Establish consistent daily routines that support this body system.`,
    `2. Vital Energy: Your ${sunSign} Sun suggests focusing on ${SIGN_BODY[sunSign]?.toLowerCase() || "overall vitality"}. ${SIGN_ELEMENT[sunSign] === "Fire" ? "Avoid overexertion and burnout" : SIGN_ELEMENT[sunSign] === "Earth" ? "Maintain physical activity to avoid stagnation" : SIGN_ELEMENT[sunSign] === "Air" ? "Ground yourself with body-based practices" : "Honor emotional needs to maintain physical health"}.`,
    `3. Emotional Wellness: With Moon in ${moonSign}, ${SIGN_ELEMENT[moonSign] === "Water" ? "journaling, therapy, and creative outlets support emotional processing" : SIGN_ELEMENT[moonSign] === "Fire" ? "physical activity and adventure keep emotions flowing" : SIGN_ELEMENT[moonSign] === "Earth" ? "nature, cooking, and sensory pleasures restore balance" : "social connection and intellectual stimulation lift mood"}.`,
    `4. Exercise Style: ${SIGN_ELEMENT[ascSign] === "Fire" ? "High-intensity, competitive sports, martial arts" : SIGN_ELEMENT[ascSign] === "Earth" ? "Hiking, yoga, weight training, gardening" : SIGN_ELEMENT[ascSign] === "Air" ? "Dance, cycling, tennis, group fitness" : "Swimming, tai chi, gentle yoga, water activities"} suit your ${ascSign} rising constitution.`,
    `5. Chronic Awareness: Saturn in ${posWithSign.Saturn?.sign || "your chart"} suggests monitoring ${SIGN_BODY[posWithSign.Saturn?.sign || "Capricorn"]?.toLowerCase() || "bones and joints"} over time. Preventive care in this area pays dividends.`,
  ];
  for (const rec of recommendations) {
    y = bodyText(y, rec);
  }

  y = italicText(y, "Disclaimer: This health reading is based on astrological symbolism and is intended for self-reflection and personal insight only. It is not medical advice. Always consult qualified healthcare professionals for health concerns.");

  // =========================================================================
  // CHAPTER 6: VEDIC / SIDEREAL ANALYSIS
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Chapter 6: Vedic / Sidereal Analysis");

  if (vedic) {
    const vData = vedic.data ?? vedic;
    y = bodyText(y, "Vedic (Jyotish) astrology uses the sidereal zodiac, which accounts for the precession of the equinoxes. This places planets approximately 23-24 degrees earlier than their tropical (Western) positions, often resulting in different sign placements that reveal complementary facets of your cosmic blueprint.");
    y += 3;

    if (vData.ayanamsa != null) {
      y = labelValue(y, "Ayanamsa:", `${Number(vData.ayanamsa).toFixed(4)}\u00b0`);
    }

    // Sidereal positions
    const sPositions = vData.positions || vData.planets || {};
    if (Object.keys(sPositions).length > 0) {
      y = subTitle(y, "Sidereal Planetary Positions");
      const vedRows: string[][] = [];
      for (const [planet, info] of Object.entries(sPositions)) {
        const pd = info as any;
        vedRows.push([
          planet,
          pd.sign || pd.rashi || "-",
          pd.degree != null ? `${Number(pd.degree).toFixed(2)}\u00b0` : pd.longitude != null ? `${Number(pd.longitude).toFixed(2)}\u00b0` : "-",
          pd.nakshatra || "-",
          pd.pada != null ? String(pd.pada) : "-",
        ]);
      }
      y = styledTable(y, ["Planet", "Rashi (Sign)", "Degree", "Nakshatra", "Pada"], vedRows);
    }

    // Moon nakshatra
    const moonData = sPositions.Moon || sPositions.moon;
    if (moonData) {
      const md = moonData as any;
      y = subTitle(y, "Moon Nakshatra");
      y = labelValue(y, "Nakshatra:", md.nakshatra || "N/A");
      y = labelValue(y, "Pada:", md.pada != null ? String(md.pada) : "N/A");
      y = bodyText(y, `In Vedic astrology, the Moon's nakshatra (lunar mansion) is one of the most important indicators of personality and destiny. Your Moon nakshatra reveals the emotional texture and karmic themes that permeate your inner life.`);
    }
  } else {
    y = bodyText(y, "Vedic chart data was not available for this profile. The Vedic/Sidereal system uses the sidereal zodiac to provide complementary insights to Western tropical astrology.");
  }

  // =========================================================================
  // CHAPTER 7: BAZI FOUR PILLARS
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Chapter 7: BaZi Four Pillars");

  y = bodyText(y, "BaZi (Eight Characters) is the Chinese astrological system that maps your destiny through four pillars: Year, Month, Day, and Hour. Each pillar contains a Heavenly Stem and an Earthly Branch, representing the interplay of Yin/Yang and the Five Elements (Wood, Fire, Earth, Metal, Water) at the moment of your birth.");
  y += 3;

  if (bazi) {
    const bData = bazi.data ?? bazi;

    // Pillars table
    const pillars = bData.pillars || bData;
    const pillarNames = ["Year", "Month", "Day", "Hour"];
    const pillarKeys = ["year", "month", "day", "hour"];
    const pillarRows: string[][] = [];
    for (let i = 0; i < pillarKeys.length; i++) {
      const p = pillars[pillarKeys[i]] || {};
      pillarRows.push([
        pillarNames[i],
        p.heavenly_stem || p.stem || "-",
        p.earthly_branch || p.branch || "-",
        p.element || "-",
        p.animal || p.zodiac || "-",
      ]);
    }
    if (pillarRows.some((r) => r.slice(1).some((c) => c !== "-"))) {
      y = subTitle(y, "The Four Pillars");
      y = styledTable(y, ["Pillar", "Heavenly Stem", "Earthly Branch", "Element", "Animal"], pillarRows);
    }

    // Element balance
    const elemBal = bData.element_balance || bData.elements || {};
    if (Object.keys(elemBal).length > 0) {
      y = subTitle(y, "Five Element Balance");
      const ebRows: string[][] = [];
      for (const [elem, val] of Object.entries(elemBal)) {
        ebRows.push([elem, typeof val === "number" ? String(val) : String(val)]);
      }
      y = styledTable(y, ["Element", "Strength"], ebRows);
    }

    // Favorable / unfavorable
    if (bData.favorable_element || bData.favorable) {
      y = labelValue(y, "Favorable Element:", bData.favorable_element || bData.favorable);
    }
    if (bData.unfavorable_element || bData.unfavorable) {
      y = labelValue(y, "Unfavorable Element:", bData.unfavorable_element || bData.unfavorable);
    }

    // Day master
    if (bData.day_master) {
      y = subTitle(y, "Day Master");
      y = bodyText(y, `Your Day Master (the Heavenly Stem of your Day Pillar) is ${typeof bData.day_master === "string" ? bData.day_master : JSON.stringify(bData.day_master)}. The Day Master represents your core self in BaZi, analogous to the Sun sign in Western astrology.`);
    }

    // Ten Gods
    const tenGods = bData.ten_gods || bData.gods || {};
    if (Object.keys(tenGods).length > 0) {
      y = subTitle(y, "Ten Gods Analysis");
      const tgRows: string[][] = [];
      for (const [god, val] of Object.entries(tenGods)) {
        const v = val as any;
        tgRows.push([god, typeof v === "string" ? v : v.description || v.element || JSON.stringify(v)]);
      }
      y = styledTable(y, ["Ten God", "Description"], tgRows);
    }
  } else {
    y = bodyText(y, "BaZi chart data was not available for this profile.");
  }

  // =========================================================================
  // CHAPTER 8: PERSONALITY SYNTHESIS
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Chapter 8: Personality Synthesis");

  y = bodyText(y, "This chapter integrates multiple personality frameworks \u2014 MBTI cognitive functions, Enneagram type dynamics, Jungian archetypes, color psychology, and spirit animal symbolism \u2014 to build a multidimensional portrait of your psychological landscape.");
  y += 3;

  // MBTI
  y = subTitle(y, "MBTI Cognitive Profile");
  y = labelValue(y, "Derived Type:", mbtiType);
  if (synthesis) {
    const sData = synthesis.data ?? synthesis;
    if (sData.dominant_function) y = labelValue(y, "Dominant Function:", sData.dominant_function);
    if (sData.auxiliary_function) y = labelValue(y, "Auxiliary Function:", sData.auxiliary_function);
    if (sData.narrative_summary) {
      y = bodyText(y, sData.narrative_summary);
    }
    // Base weights
    const weights = sData.base_weights || sData.final_weights;
    if (weights && typeof weights === "object") {
      const wRows: string[][] = [];
      for (const [dim, val] of Object.entries(weights)) {
        wRows.push([dim, typeof val === "number" ? `${Math.round(val * 100)}%` : String(val)]);
      }
      if (wRows.length > 0) {
        y = styledTable(y, ["Dimension", "Score"], wRows);
      }
    }
  } else {
    y = bodyText(y, `Based on your Sun in ${sunSign}, your chart-derived MBTI type is ${mbtiType}. This suggests a cognitive style that processes information through ${mbtiType.includes("N") ? "intuitive pattern recognition" : "concrete sensory data"} and makes decisions based on ${mbtiType.includes("F") ? "personal values and empathy" : "logical analysis and objectivity"}.`);
  }

  // Enneagram
  y = ensureSpace(y, 30);
  y = subTitle(y, "Enneagram Type");
  if (enneagram) {
    const eData = enneagram.data ?? enneagram;
    if (eData.type) y = labelValue(y, "Core Type:", `Type ${eData.type}${eData.name ? ` \u2014 ${eData.name}` : ""}`);
    if (eData.wing) y = labelValue(y, "Wing:", String(eData.wing));
    if (eData.tritype) y = labelValue(y, "Tritype:", String(eData.tritype));
    if (eData.core_fear) y = labelValue(y, "Core Fear:", eData.core_fear);
    if (eData.core_desire) y = labelValue(y, "Core Desire:", eData.core_desire);
    if (eData.growth_direction) y = labelValue(y, "Growth Direction:", `Type ${eData.growth_direction}`);
    if (eData.stress_direction) y = labelValue(y, "Stress Direction:", `Type ${eData.stress_direction}`);
    if (eData.description) y = bodyText(y, eData.description);
  } else {
    y = bodyText(y, "Enneagram data was not available from the server.");
  }

  // Jungian Archetypes
  y = ensureSpace(y, 30);
  y = subTitle(y, "Jungian Archetypes");
  if (archetypes) {
    const aData = archetypes.data ?? archetypes;
    const primary = aData.primary_archetype || aData.primary;
    const secondary = aData.secondary_archetype || aData.secondary;
    const shadow = aData.shadow_archetype || aData.shadow;

    if (primary) {
      const pName = typeof primary === "string" ? primary : primary.name || JSON.stringify(primary);
      const pDesc = typeof primary === "object" ? primary.description : null;
      y = labelValue(y, "Primary Archetype:", pName);
      if (pDesc) y = bodyText(y, pDesc);
    }
    if (secondary) {
      const sName = typeof secondary === "string" ? secondary : secondary.name || JSON.stringify(secondary);
      y = labelValue(y, "Secondary Archetype:", sName);
    }
    if (shadow) {
      const shName = typeof shadow === "string" ? shadow : shadow.name || JSON.stringify(shadow);
      const shDesc = typeof shadow === "object" ? shadow.description : null;
      y = labelValue(y, "Shadow Archetype:", shName);
      if (shDesc) y = bodyText(y, shDesc);
    }

    y = bodyText(y, "Your archetypes represent the dominant patterns of behavior, motivation, and unconscious drives that shape your personality. The Primary archetype is your most conscious pattern, the Secondary supports it, and the Shadow represents repressed qualities that may emerge under stress.");
  } else {
    y = bodyText(y, "Jungian archetype data was not available from the server.");
  }

  // Color Psychology
  y = ensureSpace(y, 30);
  y = subTitle(y, "Color Psychology");
  if (colorPalette) {
    const cpData = colorPalette.data ?? colorPalette;
    const colors = cpData.colors || cpData.palette || cpData;
    if (Array.isArray(colors)) {
      const colorRows = colors.map((c: any) => [
        c.name || c.color || "-",
        c.hex || "-",
        c.meaning || c.description || "-",
      ]);
      y = styledTable(y, ["Color", "Hex", "Meaning"], colorRows);
    } else if (typeof colors === "object") {
      const colorRows: string[][] = [];
      for (const [name, val] of Object.entries(colors)) {
        const v = val as any;
        colorRows.push([
          name,
          typeof v === "string" ? v : v.hex || "-",
          typeof v === "object" ? (v.meaning || v.description || "-") : "-",
        ]);
      }
      if (colorRows.length > 0) {
        y = styledTable(y, ["Color", "Value", "Meaning"], colorRows);
      }
    }
    y = bodyText(y, "Your personal color palette reflects the psychological energies expressed through your Big Three placements. Surrounding yourself with these colors can enhance your mood and align with your natural energy.");
  } else {
    y = italicText(y, "Color psychology data was not available.");
  }

  // Spirit Animal
  y = ensureSpace(y, 30);
  y = subTitle(y, "Spirit Animal Totems");
  if (spiritAnimal) {
    const saData = spiritAnimal.data ?? spiritAnimal;
    const primary = saData.primary || saData.primary_animal || saData.spirit_animal;
    const secondary = saData.secondary || saData.secondary_animal;
    const shadow = saData.shadow || saData.shadow_animal;

    if (primary) {
      const name = typeof primary === "string" ? primary : primary.animal || primary.name || JSON.stringify(primary);
      const desc = typeof primary === "object" ? (primary.meaning || primary.description) : null;
      y = labelValue(y, "Primary Totem:", name);
      if (desc) y = bodyText(y, desc);
    }
    if (secondary) {
      const name = typeof secondary === "string" ? secondary : secondary.animal || secondary.name || JSON.stringify(secondary);
      y = labelValue(y, "Secondary Totem:", name);
    }
    if (shadow) {
      const name = typeof shadow === "string" ? shadow : shadow.animal || shadow.name || JSON.stringify(shadow);
      y = labelValue(y, "Shadow Totem:", name);
    }
  } else {
    y = italicText(y, "Spirit animal data was not available.");
  }

  // Cross-synthesis
  y = ensureSpace(y, 30);
  y = subTitle(y, "Personality Cross-Synthesis");
  y = bodyText(y, `Your MBTI type (${mbtiType}) combined with your Enneagram type ${enneagram?.data?.type || enneagram?.type || ""} and ${typeof (archetypes?.data?.primary_archetype || archetypes?.data?.primary || archetypes?.primary_archetype || archetypes?.primary) === "string" ? (archetypes?.data?.primary_archetype || archetypes?.data?.primary || archetypes?.primary_archetype || archetypes?.primary) : "your primary"} archetype creates a personality profile that is ${mbtiType.startsWith("I") ? "introspective" : "expressive"}, ${mbtiType.includes("N") ? "intuitive" : "pragmatic"}, and oriented toward ${mbtiType.includes("J") ? "structure and completion" : "flexibility and exploration"}. This combination suggests a person who processes the world through multiple sophisticated lenses.`);

  // =========================================================================
  // CHAPTER 9: TAROT & NUMEROLOGY
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Chapter 9: Tarot & Numerology");

  y = bodyText(y, "Your birth date encodes numerological and Tarot archetypes that add another layer to your cosmic blueprint. Birth cards represent the major archetypal energies that accompany you throughout life.");
  y += 3;

  if (tarotCards) {
    const tData = tarotCards.data ?? tarotCards;
    y = subTitle(y, "Birth Tarot Cards");

    const cards = tData.cards || tData.birth_cards || [];
    if (Array.isArray(cards) && cards.length > 0) {
      for (const card of cards) {
        y = ensureSpace(y, 15);
        const cardName = typeof card === "string" ? card : card.name || card.card || JSON.stringify(card);
        const cardDesc = typeof card === "object" ? (card.description || card.meaning || card.interpretation) : null;
        y = labelValue(y, "Card:", cardName);
        if (cardDesc) y = bodyText(y, cardDesc);
      }
    } else if (tData.personality_card || tData.soul_card) {
      if (tData.personality_card) y = labelValue(y, "Personality Card:", typeof tData.personality_card === "string" ? tData.personality_card : tData.personality_card.name || JSON.stringify(tData.personality_card));
      if (tData.soul_card) y = labelValue(y, "Soul Card:", typeof tData.soul_card === "string" ? tData.soul_card : tData.soul_card.name || JSON.stringify(tData.soul_card));
      if (tData.year_card) y = labelValue(y, "Year Card:", typeof tData.year_card === "string" ? tData.year_card : tData.year_card.name || JSON.stringify(tData.year_card));
    }

    if (tData.life_path || tData.life_path_number) {
      y += 3;
      y = subTitle(y, "Life Path Number");
      y = labelValue(y, "Life Path:", String(tData.life_path || tData.life_path_number));
      if (tData.life_path_meaning || tData.life_path_description) {
        y = bodyText(y, tData.life_path_meaning || tData.life_path_description);
      }
    }
  } else {
    // Manual life path calculation
    y = subTitle(y, "Life Path Number");
    const digits = profile.birthDate.replace(/-/g, "").split("").map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = String(sum).split("").map(Number).reduce((a, b) => a + b, 0);
    }
    y = labelValue(y, "Life Path:", String(sum));
    y = bodyText(y, `Life Path ${sum} individuals are ${sum === 1 ? "independent leaders and pioneers" : sum === 2 ? "diplomatic peacemakers and partners" : sum === 3 ? "creative communicators and entertainers" : sum === 4 ? "practical builders and organizers" : sum === 5 ? "adventurous seekers of freedom and change" : sum === 6 ? "nurturing caregivers and harmonizers" : sum === 7 ? "spiritual seekers and analytical thinkers" : sum === 8 ? "ambitious achievers and material masters" : sum === 9 ? "compassionate humanitarians and old souls" : sum === 11 ? "intuitive visionaries and spiritual teachers (Master Number)" : sum === 22 ? "master builders who manifest grand visions (Master Number)" : "master teachers who uplift humanity (Master Number)"}. This number represents the overarching theme of your life journey.`);
    y = italicText(y, "Tarot birth card data was not available from the server.");
  }

  // =========================================================================
  // CHAPTER 10: COSMIC TIMING
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Chapter 10: Cosmic Timing");

  y = bodyText(y, "This chapter examines the current cosmic climate as it relates to your natal chart \u2014 where the planets are now, how they aspect your birth chart, and what predictive techniques reveal about your current life chapter.");
  y += 3;

  // Current transits
  y = subTitle(y, "Current Transits");
  if (transits) {
    const trData = transits.data ?? transits;
    const trList: any[] = trData.transits || trData.aspects || [];
    if (Array.isArray(trList) && trList.length > 0) {
      const trRows = trList.slice(0, 20).map((t: any) => [
        t.transiting_planet || t.planet || "-",
        t.aspect || t.type || "-",
        t.natal_planet || t.natal || "-",
        t.orb != null ? `${Number(t.orb).toFixed(2)}\u00b0` : "-",
        t.interpretation ? t.interpretation.substring(0, 60) + (t.interpretation.length > 60 ? "..." : "") : "-",
      ]);
      y = styledTable(y, ["Transit Planet", "Aspect", "Natal Planet", "Orb", "Theme"], trRows);
    } else {
      y = bodyText(y, "Current transit aspect data is available but contains no significant aspects at this time.");
    }
  } else {
    y = italicText(y, "Transit data was not available from the server.");
  }

  // Solar return
  y = ensureSpace(y, 30);
  y = subTitle(y, `Solar Return ${new Date().getFullYear()}`);
  if (solarReturn) {
    const srData = solarReturn.data ?? solarReturn;
    y = bodyText(y, `Your Solar Return chart for ${new Date().getFullYear()} reveals the themes and energies that will be prominent from your birthday this year to the next.`);

    const srPositions = srData.positions || {};
    if (Object.keys(srPositions).length > 0) {
      const srRows: string[][] = [];
      for (const [planet, info] of Object.entries(srPositions)) {
        const pd = info as any;
        srRows.push([planet, pd.sign || "-", pd.degree != null ? `${Number(pd.degree).toFixed(2)}\u00b0` : "-"]);
      }
      y = styledTable(y, ["Planet", "SR Sign", "Degree"], srRows.slice(0, 10));
    }
  } else {
    y = italicText(y, "Solar return data was not available for this year.");
  }

  // Progressions
  y = ensureSpace(y, 30);
  y = subTitle(y, "Secondary Progressions");
  if (progressions) {
    const prData = progressions.data ?? progressions;
    y = bodyText(y, "Secondary progressions advance the natal chart by one day for each year of life, revealing the slow inner evolution of your psyche. Progressed Sun and Moon sign changes mark major life chapter transitions.");

    const prPositions = prData.positions || prData.progressed_positions || {};
    if (Object.keys(prPositions).length > 0) {
      const prRows: string[][] = [];
      for (const [planet, info] of Object.entries(prPositions)) {
        const pd = info as any;
        prRows.push([planet, pd.sign || "-", pd.degree != null ? `${Number(pd.degree).toFixed(2)}\u00b0` : "-"]);
      }
      y = styledTable(y, ["Progressed Planet", "Sign", "Degree"], prRows.slice(0, 10));
    }

    const pSun = prPositions.Sun || prPositions.sun;
    const pMoon = prPositions.Moon || prPositions.moon;
    if (pSun || pMoon) {
      y = bodyText(y, `${pSun ? `Your Progressed Sun is in ${(pSun as any).sign || "transition"}, indicating the current chapter of your identity evolution.` : ""} ${pMoon ? `Your Progressed Moon is in ${(pMoon as any).sign || "transition"}, coloring your emotional focus for the current 2.5-year cycle.` : ""}`);
    }
  } else {
    y = italicText(y, "Progression data was not available.");
  }

  // Annual profection
  y = ensureSpace(y, 30);
  y = subTitle(y, "Annual Profection");
  if (profection) {
    const pfData = profection.data ?? profection;
    if (pfData.profected_sign || pfData.sign) y = labelValue(y, "Profected Sign:", pfData.profected_sign || pfData.sign);
    if (pfData.profected_house || pfData.house) y = labelValue(y, "Profected House:", String(pfData.profected_house || pfData.house));
    if (pfData.lord_of_year || pfData.time_lord) y = labelValue(y, "Lord of the Year:", pfData.lord_of_year || pfData.time_lord);
    y = bodyText(y, "Annual profections assign a house to each year of life in sequence. The sign and ruler of your profected house become activated this year, bringing their themes into focus.");
  } else {
    y = italicText(y, "Profection data was not available.");
  }

  // Hellenistic sect
  y = ensureSpace(y, 20);
  y = subTitle(y, "Sect");
  if (sect) {
    const secData = sect.data ?? sect;
    if (secData.sect) y = labelValue(y, "Chart Sect:", secData.sect);
    if (secData.benefic) y = labelValue(y, "Sect Benefic:", secData.benefic);
    if (secData.malefic) y = labelValue(y, "Sect Malefic:", secData.malefic);
    y = bodyText(y, `Your chart is a ${secData.sect || "diurnal/nocturnal"} chart, which means the ${secData.sect === "diurnal" ? "Sun sect (Sun, Jupiter, Saturn)" : "Moon sect (Moon, Venus, Mars)"} planets are more supportive in your life. Your sect benefic (${secData.benefic || "the supportive planet"}) works most easily for you.`);
  } else {
    y = italicText(y, "Sect data was not available.");
  }

  // =========================================================================
  // CHAPTER 11: SABIAN SYMBOLS
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Chapter 11: Sabian Symbols");

  y = bodyText(y, "Sabian symbols are a set of 360 symbolic images, one for each degree of the zodiac, channeled by clairvoyant Elsie Wheeler in 1925. Each planet in your chart activates the symbol for its degree, adding a poetic and intuitive layer to the interpretation.");
  y += 3;

  if (sabianSymbols) {
    const ssData = sabianSymbols.data ?? sabianSymbols;
    const symbols = ssData.symbols || ssData.sabian_symbols || ssData;

    if (typeof symbols === "object" && !Array.isArray(symbols)) {
      const ssRows: string[][] = [];
      for (const [planet, info] of Object.entries(symbols)) {
        const s = info as any;
        ssRows.push([
          planet,
          s.degree != null ? `${s.degree}\u00b0 ${s.sign || ""}` : "-",
          typeof s === "string" ? s : s.symbol || s.sabian || s.description || "-",
          typeof s === "object" ? (s.keywords || s.meaning || "-") : "-",
        ]);
      }
      if (ssRows.length > 0) {
        y = styledTable(y, ["Planet", "Degree", "Symbol", "Keywords"], ssRows);
      }

      // Detailed interpretations for key planets
      for (const planet of ["Sun", "Moon", "Mercury", "Venus", "Mars"]) {
        const s = symbols[planet];
        if (s && typeof s === "object" && (s.interpretation || s.meaning)) {
          y = ensureSpace(y, 20);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...EMERALD);
          doc.text(`${planet}: ${s.symbol || s.sabian || ""}`, M, y);
          y += 5;
          y = bodyText(y, s.interpretation || s.meaning);
        }
      }
    } else if (Array.isArray(symbols)) {
      const ssRows = symbols.map((s: any) => [
        s.planet || "-",
        s.degree != null ? `${s.degree}\u00b0 ${s.sign || ""}` : "-",
        s.symbol || s.sabian || "-",
        s.keywords || s.meaning || "-",
      ]);
      y = styledTable(y, ["Planet", "Degree", "Symbol", "Keywords"], ssRows);
    }
  } else {
    y = italicText(y, "Sabian symbol data was not available from the server.");
  }

  // Harmonics
  y = ensureSpace(y, 30);
  y = subTitle(y, "7th Harmonic Chart");
  if (harmonics) {
    const hData = harmonics.data ?? harmonics;
    y = bodyText(y, "The 7th harmonic chart reveals themes of inspiration, spiritual seeking, and the creative imagination. Aspects and patterns here show what uniquely inspires and moves you at a soul level.");
    const hPositions = hData.positions || hData.harmonic_positions || {};
    if (Object.keys(hPositions).length > 0) {
      const hRows: string[][] = [];
      for (const [planet, info] of Object.entries(hPositions)) {
        const pd = info as any;
        hRows.push([planet, pd.sign || "-", pd.degree != null ? `${Number(pd.degree).toFixed(2)}\u00b0` : pd.longitude != null ? `${Number(pd.longitude).toFixed(2)}\u00b0` : "-"]);
      }
      y = styledTable(y, ["Planet", "Harmonic Sign", "Degree"], hRows.slice(0, 10));
    }
  } else {
    y = italicText(y, "Harmonic chart data was not available.");
  }

  // =========================================================================
  // CHAPTER 12: NINE STAR KI & FENG SHUI
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Chapter 12: Nine Star Ki & Feng Shui");

  y = subTitle(y, "Nine Star Ki");
  if (nineStarKi) {
    const nData = nineStarKi.data ?? nineStarKi;
    y = bodyText(y, "Nine Star Ki is a Japanese adaptation of the Chinese I Ching and Lo Shu square that assigns three numbers to your birth date, revealing your core energy, emotional nature, and surface personality.");

    if (nData.main_star || nData.base_star || nData.year_star) {
      y = labelValue(y, "Main Star:", String(nData.main_star || nData.base_star || nData.year_star));
    }
    if (nData.character_star || nData.emotional_star || nData.month_star) {
      y = labelValue(y, "Character Star:", String(nData.character_star || nData.emotional_star || nData.month_star));
    }
    if (nData.energetic_star || nData.surface_star) {
      y = labelValue(y, "Energetic Star:", String(nData.energetic_star || nData.surface_star));
    }
    if (nData.element) y = labelValue(y, "Element:", nData.element);
    if (nData.description) y = bodyText(y, nData.description);
    if (nData.personality) y = bodyText(y, nData.personality);
  } else {
    y = italicText(y, "Nine Star Ki data was not available.");
  }

  y += 5;
  y = subTitle(y, "Feng Shui Flying Stars");
  if (fengShui) {
    const fsData = fengShui.data ?? fengShui;
    y = bodyText(y, "Feng Shui Flying Stars map the energy distribution of your birth year, showing auspicious and challenging directions. This system helps optimize your living and working environments.");

    const grid = fsData.grid || fsData.flying_stars || fsData.stars;
    if (Array.isArray(grid)) {
      const gridRows = grid.map((row: any, i: number) => {
        if (Array.isArray(row)) {
          return row.map((cell: any) => String(cell));
        }
        return [String(i), String(row)];
      });
      if (gridRows.length > 0 && gridRows[0].length >= 2) {
        y = styledTable(y, gridRows[0].map((_: any, i: number) => i === 0 ? "Position" : `Col ${i}`), gridRows);
      }
    } else if (typeof grid === "object" && grid) {
      const fsRows: string[][] = [];
      for (const [dir, val] of Object.entries(grid)) {
        fsRows.push([dir, String(val)]);
      }
      if (fsRows.length > 0) {
        y = styledTable(y, ["Direction", "Star"], fsRows);
      }
    }

    if (fsData.favorable_directions) {
      y = labelValue(y, "Favorable:", Array.isArray(fsData.favorable_directions) ? fsData.favorable_directions.join(", ") : String(fsData.favorable_directions));
    }
  } else {
    y = italicText(y, "Feng Shui data was not available.");
  }

  // =========================================================================
  // CHAPTER 13: CROSS-SYSTEM SYNTHESIS
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Chapter 13: Cross-System Synthesis");

  y = bodyText(y, "This final analytical chapter weaves together findings from Western, Vedic, BaZi, and personality systems to identify convergent themes and the overarching narrative of your cosmic blueprint.");
  y += 3;

  // Western vs Vedic
  y = subTitle(y, "Western & Vedic Comparison");
  const vedicSunSign = vedic?.data?.positions?.Sun?.sign || vedic?.positions?.Sun?.sign;
  const vedicMoonSign = vedic?.data?.positions?.Moon?.sign || vedic?.positions?.Moon?.sign;
  if (vedicSunSign || vedicMoonSign) {
    y = bodyText(y, `Your Western (tropical) Sun is in ${sunSign}, while your Vedic (sidereal) Sun is in ${vedicSunSign || "a different sign"}. This ${sunSign === vedicSunSign ? "rare agreement between both systems reinforces the themes of this sign" : "difference reflects the two zodiacs' distinct reference frames \u2014 the tropical chart describes your psychological reality, while the sidereal chart reveals your karmic blueprint"}.`);
    if (vedicMoonSign) {
      y = bodyText(y, `Your Vedic Moon is in ${vedicMoonSign}${moonSign === vedicMoonSign ? ", matching your Western Moon and emphasizing these emotional qualities" : `, compared to your Western Moon in ${moonSign}. Both perspectives offer complementary insight into your emotional nature`}.`);
    }
  } else {
    y = bodyText(y, `Your Western chart places the Sun in ${sunSign} and Moon in ${moonSign}. Without Vedic data available for comparison, we can note that the sidereal positions would typically fall approximately one sign earlier, revealing the complementary karmic dimension.`);
  }
  y += 3;

  // BaZi element mapping
  y = subTitle(y, "BaZi & Western Element Mapping");
  y = bodyText(y, "The Western four-element system (Fire, Earth, Air, Water) and the Chinese five-element system (Wood, Fire, Earth, Metal, Water) offer overlapping yet distinct perspectives on elemental energy:");

  const elemMapRows: string[][] = [
    ["Fire (Western)", "Fire (Chinese)", "Passion, energy, enthusiasm, action"],
    ["Earth (Western)", "Earth (Chinese)", "Stability, practicality, material concerns"],
    ["Air (Western)", "Metal (Chinese)", "Intellect, structure, precision, logic"],
    ["Water (Western)", "Water (Chinese)", "Emotion, intuition, depth, flow"],
    ["N/A", "Wood (Chinese)", "Growth, expansion, flexibility, vision"],
  ];
  y = styledTable(y, ["Western Element", "Chinese Element", "Shared Themes"], elemMapRows);

  y = bodyText(y, `Your Western chart is dominated by ${dominantElement[0]} (${dominantElement[1]} placements). ${bazi ? `In your BaZi chart, ${bazi.data?.favorable_element || bazi.favorable_element || "your favorable element"} supports your growth.` : ""} The interplay between these systems reveals how your elemental energies manifest across different life dimensions.`);
  y += 3;

  // Personality convergence
  y = subTitle(y, "Personality Convergence");
  if (convergence) {
    const cData = convergence.data ?? convergence;
    const themes = cData.themes || cData.convergence_themes || cData;
    if (Array.isArray(themes)) {
      for (const theme of themes) {
        if (typeof theme === "string") {
          y = bodyText(y, `\u2022 ${theme}`);
        } else if (typeof theme === "object") {
          y = bodyText(y, `\u2022 ${theme.theme || theme.name || ""}: ${theme.score != null ? `(${Math.round(Number(theme.score) * 100)}%) ` : ""}${theme.description || ""}`);
        }
      }
    } else if (typeof themes === "object") {
      for (const [key, val] of Object.entries(themes)) {
        if (typeof val === "number") {
          y = labelValue(y, `${key}:`, `${Math.round(val * 100)}%`);
        } else if (typeof val === "string") {
          y = labelValue(y, `${key}:`, val);
        }
      }
    }
  }

  // Dynamic personality state
  y = ensureSpace(y, 30);
  y = subTitle(y, "Dynamic Personality State");
  if (dynamicPersonality) {
    const dpData = dynamicPersonality.data ?? dynamicPersonality;
    if (dpData.dominant_traits) {
      const traits = Array.isArray(dpData.dominant_traits)
        ? dpData.dominant_traits.map((t: any) => typeof t === "string" ? t : t.trait || t.name).join(", ")
        : String(dpData.dominant_traits);
      y = labelValue(y, "Dominant Traits:", traits);
    }
    if (dpData.shadow_traits) {
      const shadows = Array.isArray(dpData.shadow_traits)
        ? dpData.shadow_traits.map((t: any) => typeof t === "string" ? t : t.trait || t.name).join(", ")
        : String(dpData.shadow_traits);
      y = labelValue(y, "Shadow Traits:", shadows);
    }
    if (dpData.current_mood) y = labelValue(y, "Current Mood:", dpData.current_mood);
    if (dpData.energy_level) y = labelValue(y, "Energy Level:", String(dpData.energy_level));
    if (dpData.cognitive_style) y = labelValue(y, "Cognitive Style:", dpData.cognitive_style);
    y = bodyText(y, "Your dynamic personality state represents how your natal potential is expressing right now, influenced by current planetary transits and progressions.");
  } else {
    y = italicText(y, "Dynamic personality data was not available.");
  }

  // Element balance integration
  y = ensureSpace(y, 30);
  y = subTitle(y, "Integrated Element Balance");
  if (elementBalance) {
    const ebData = elementBalance.data ?? elementBalance;
    const balance = ebData.elements || ebData.balance || ebData;
    if (typeof balance === "object") {
      const ebRows: string[][] = [];
      for (const [elem, val] of Object.entries(balance)) {
        if (typeof val === "number" || typeof val === "string") {
          ebRows.push([elem, typeof val === "number" ? `${Math.round(Number(val))}%` : String(val)]);
        } else if (typeof val === "object" && val) {
          const v = val as any;
          ebRows.push([elem, v.percentage != null ? `${Math.round(Number(v.percentage))}%` : v.count != null ? String(v.count) : "-"]);
        }
      }
      if (ebRows.length > 0) {
        y = styledTable(y, ["Element", "Balance"], ebRows);
      }
    }
  }

  // Overall narrative
  y = ensureSpace(y, 40);
  y = subTitle(y, "Overall Life Theme");
  y = bodyText(y, `${profile.name}'s cosmic blueprint reveals a multifaceted individual whose ${sunSign} Sun provides core purpose through ${SIGN_ELEMENT[sunSign]} expression, whose ${moonSign} Moon nurtures through ${SIGN_ELEMENT[moonSign]} emotional processing, and whose ${ascSign} Ascendant presents a ${SIGN_ELEMENT[ascSign]} face to the world.`);
  y = bodyText(y, `The convergence of ${mbtiType} cognitive style with ${enneagram?.data?.type || enneagram?.type ? `Enneagram Type ${enneagram.data?.type || enneagram.type}` : "your Enneagram type"} motivational patterns creates a personality engine that drives toward ${mbtiType.includes("NF") ? "meaning, authenticity, and human connection" : mbtiType.includes("NT") ? "knowledge, competence, and systemic understanding" : mbtiType.includes("SF") ? "practical service, harmony, and concrete care" : "efficient action, logical solutions, and measurable results"}.`);
  y = bodyText(y, `The cross-system analysis reveals that your Western elemental balance (${dominantElement[0]}-dominant), Vedic karmic indicators, and Chinese Five Element profile ${bazi ? "align to suggest" : "together suggest"} a life path that integrates ${SIGN_ELEMENT[sunSign] === "Fire" ? "creative vision with grounded action" : SIGN_ELEMENT[sunSign] === "Earth" ? "material mastery with emotional depth" : SIGN_ELEMENT[sunSign] === "Air" ? "intellectual brilliance with embodied wisdom" : "intuitive knowing with structured expression"}. Your greatest growth comes from developing the qualities of your ${Object.entries(elemCount).sort((a, b) => a[1] - b[1])[0][0]} element, which is currently underrepresented in your chart.`);

  // =========================================================================
  // APPENDIX: DISCLAIMER
  // =========================================================================
  newPage();
  y = 25;
  y = sectionTitle(y, "Appendix: Disclaimer");

  y = bodyText(y, "This report is generated for informational and entertainment purposes only. Astrology, personality typology (MBTI, Enneagram), numerology, Tarot, BaZi, Nine Star Ki, and related systems are symbolic frameworks that provide metaphorical insight into human experience. They are not scientifically validated predictive tools.");
  y += 3;
  y = bodyText(y, "Nothing in this report should be taken as medical advice, psychological diagnosis, financial guidance, or a substitute for professional consultation. The health reading section uses traditional astrological symbolism and does not constitute a medical assessment.");
  y += 3;
  y = bodyText(y, "All data has been generated algorithmically based on the birth date, time, and location provided. The interpretations are based on astrological tradition and may not reflect your actual lived experience. Your free will and personal choices always supersede any chart indication.");
  y += 3;
  y = bodyText(y, "By using this report, you acknowledge that it is a tool for self-reflection and creative exploration, not a definitive description of your character, health, or destiny.");
  y += 8;

  // Signature
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("ENVI-OUS BRAIN", W / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("Comprehensive Natal Report Engine v1.0", W / 2, y, { align: "center" });
  y += 5;
  doc.text(`Generated ${new Date().toISOString()}`, W / 2, y, { align: "center" });

  // Bottom decoration
  doc.setFillColor(...GOLD);
  doc.rect(0, H - 3, W, 3, "F");

  // =========================================================================
  // DONE
  // =========================================================================

  onProgress?.({ stage: "Complete!", percent: 100 });

  return doc.output("blob");
}
