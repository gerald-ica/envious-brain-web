import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-662458014068.us-central1.run.app";

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
// Design tokens matching the reference PDF
// ---------------------------------------------------------------------------

const NAVY: [number, number, number] = [13, 21, 37];
const GOLD: [number, number, number] = [201, 168, 76];
const WHITE: [number, number, number] = [232, 230, 224];
const MUTED: [number, number, number] = [140, 140, 155];
const CARD_BG: [number, number, number] = [18, 28, 48];
const TABLE_HDR: [number, number, number] = [22, 34, 56];
const TABLE_ALT: [number, number, number] = [16, 25, 43];
const BORDER: [number, number, number] = [40, 55, 80];

// ---------------------------------------------------------------------------
// Astrological interpretation dictionaries
// ---------------------------------------------------------------------------

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

const SIGN_RULER: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Pluto",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Uranus", Pisces: "Neptune",
};

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

const SIGN_TO_MBTI: Record<string, string> = {
  Aries: "ESTP", Taurus: "ISFJ", Gemini: "ENTP", Cancer: "ISFP",
  Leo: "ENFJ", Virgo: "ISTJ", Libra: "ENFP", Scorpio: "INTJ",
  Sagittarius: "ENTP", Capricorn: "ENTJ", Aquarius: "INTP", Pisces: "INFP",
};

// Plain-text labels — jsPDF built-in fonts cannot render Unicode zodiac glyphs
const GLYPH: Record<string, string> = {
  Sun: "Sun", Moon: "Moon", Mercury: "Merc", Venus: "Ven",
  Mars: "Mars", Jupiter: "Jup", Saturn: "Sat", Uranus: "Ura",
  Neptune: "Nep", Pluto: "Plu", NorthNode: "NN", TrueNode: "TN", MeanNode: "NN",
  Chiron: "Chi", Ceres: "Cer", Pallas: "Pal", Juno: "Jun", Vesta: "Ves",
  Ascendant: "ASC",
};

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "cnj", opposition: "opp", trine: "tri",
  square: "sqr", sextile: "sxt", quincunx: "Qx", semisextile: "SSx",
  semisquare: "SSq", sesquiquadrate: "Ses", quintile: "Qtl",
};

const HOUSE_DOMAIN: Record<number, string> = {
  1: "self-identity, physical presence, how one meets the world",
  2: "resources, values, material security, self-worth",
  3: "communication, siblings, daily environment, learning",
  4: "home, roots, inner foundation, private life",
  5: "creativity, romance, self-expression, children, play",
  6: "work, health, daily routines, service, craftsmanship",
  7: "partnerships, one-on-one relationships, open enemies",
  8: "transformation, shared resources, intimacy, regeneration",
  9: "philosophy, higher learning, travel, worldview, publishing",
  10: "career, public image, authority, legacy, achievement",
  11: "community, friendships, hopes, collective purpose",
  12: "the unconscious, hidden matters, spirituality, solitude",
};

const PLANET_IN_SIGN: Record<string, Record<string, string>> = {
  Sun: {
    Aries: "The identity is forged in action. There is a primal need to be first, to pioneer, to lead through sheer force of will. The self is defined by courage and initiative \u2014 an identity that must perpetually prove itself through bold action.",
    Taurus: "The identity is rooted in permanence. There is a deep need to build, to sustain, to create lasting value. The self is defined by what endures \u2014 an identity of quiet, immovable strength that the world eventually learns to rely upon.",
    Gemini: "The identity lives in language and ideas. There is an insatiable curiosity that processes the world through naming, categorizing, and connecting. The self multiplies \u2014 versatile, quick, perpetually young, seeing every situation from multiple angles simultaneously.",
    Cancer: "The identity is woven into memory, emotion, and belonging. There is a primal drive to nurture, protect, and create safe harbors. The self is defined by feeling \u2014 an identity that builds its power from emotional intelligence and instinctive care.",
    Leo: "The identity radiates. There is a fundamental need to be seen, celebrated, and to create from the heart. The self is defined by creative generosity \u2014 an identity that warms every room it enters and demands that life be lived with dramatic sincerity.",
    Virgo: "The identity is rooted in systems, order, and creating environments where things work properly. This is not the Sun of someone who performs for the world; this is the Sun of someone who builds the infrastructure the world runs on.",
    Libra: "The identity seeks balance, beauty, and partnership. There is a fundamental need for harmony and aesthetic order. The self is defined through relationship \u2014 an identity that comes alive in dialogue, collaboration, and the art of creating equilibrium.",
    Scorpio: "The identity is forged in depth. There is a relentless drive to penetrate surfaces, to understand what lies beneath, to transform through confrontation with truth. The self is defined by intensity \u2014 an identity that cannot and will not settle for shallow.",
    Sagittarius: "The identity is a quest. There is an irrepressible need for meaning, adventure, and philosophical truth. The self is defined by vision \u2014 an identity that points toward the horizon and says there is more, always more, waiting to be discovered.",
    Capricorn: "The identity is an edifice. There is a primal need to build, to achieve, to leave a legacy. The self is defined by mastery earned through discipline \u2014 an identity that gains power over decades, like a mountain that the world eventually navigates by.",
    Aquarius: "The identity is an innovation. There is a fundamental need to reform, to think differently, to liberate. The self is defined by originality \u2014 an identity that exists slightly ahead of its time, always seeing the system from outside.",
    Pisces: "The identity dissolves into everything. There is a transcendent need to merge, to imagine, to feel the invisible connections between all things. The self is defined by compassion and vision \u2014 an identity permeable to the full spectrum of human experience.",
  },
  Moon: {
    Aries: "Emotional reactions are fast, direct, and fierce. The inner world demands action when feelings arise \u2014 processing happens through doing. Emotional security comes from independence and the freedom to initiate.",
    Taurus: "Emotional security is built on sensory comfort and material stability. Feelings are slow, steady, and deep. Once emotional equilibrium is established, disruption is physically uncomfortable. Loyalty in love is absolute.",
    Gemini: "Emotions are processed through language. Talking, writing, and intellectualizing are how feelings become manageable. The inner world is restless and curious \u2014 emotional needs shift frequently, requiring variety and mental stimulation.",
    Cancer: "The emotional world is a vast ocean \u2014 tidal, powerful, and deeply connected to memory and belonging. Nurturing others is how emotional needs are met. Home is not a place but a feeling of safety.",
    Leo: "The emotional nature craves warmth, recognition, and creative self-expression. Feelings are big, generous, and dramatic. Emotional fulfillment comes through creating, performing, and receiving genuine appreciation.",
    Virgo: "Emotions are processed through analysis. The inner world seeks order \u2014 when life is organized, feelings settle. Anxiety arises from chaos. Emotional care is expressed through practical service and attention to detail.",
    Libra: "There is a deep emotional need for beauty, harmony, and partnership. Feelings are filtered through aesthetics \u2014 the quality of one's environment directly affects emotional wellbeing. Conflict feels physically destabilizing.",
    Scorpio: "The emotional world is an underground river \u2014 powerful, invisible, and transformative. Feelings are intense, private, and absolute. Emotional processing requires depth; superficial comfort is rejected instinctively.",
    Sagittarius: "Emotions need space, adventure, and meaning. The inner world is optimistic and philosophical \u2014 difficult feelings are processed through exploration, travel, and the search for a bigger picture.",
    Capricorn: "Emotions are structured, controlled, and expressed with restraint. The inner world values competence and self-sufficiency. Emotional security comes from achievement and the knowledge that one can handle anything.",
    Aquarius: "The emotional nature is detached, humanitarian, and unconventional. Feelings are processed intellectually, sometimes at the expense of intimacy. Emotional fulfillment comes through community and shared ideals.",
    Pisces: "The emotional world has no boundaries. Feelings arrive from everywhere \u2014 other people, music, the collective unconscious. Emotional processing requires solitude, art, and spiritual practice to distinguish self from others.",
  },
  Mercury: {
    Aries: "The mind is quick, combative, and direct. Ideas arrive like sparks and are spoken before they are fully formed. Thinking is decisive but impatient \u2014 the first answer is trusted more than the most refined one.",
    Taurus: "Thinking is methodical, sensual, and persistent. Ideas take root slowly but once established are nearly immovable. The mind values practical application over abstract theory.",
    Gemini: "Mercury in its own sign creates a mind of extraordinary speed, versatility, and linguistic dexterity. Ideas multiply endlessly. Communication is effortless. The challenge is depth \u2014 the mind can scatter across too many interests.",
    Cancer: "Thinking is intuitive and emotionally colored. Memory is exceptional \u2014 information is stored through feeling. Communication is empathetic, sometimes defensive, always deeply personal.",
    Leo: "The mind thinks in grand narratives. Communication is dramatic, warm, and authoritative. Ideas are presented with creative flair. The thinking style is generous but may resist contradicting opinions.",
    Virgo: "Mercury in its own sign and exaltation creates an extraordinarily analytical mind. Precision in thought and communication approaches an art form. The capacity for detailed analysis is unmatched.",
    Libra: "Thinking is diplomatic, balanced, and aesthetically aware. The mind naturally weighs all sides of any question. Communication is charming and fair. The challenge is decisiveness \u2014 every perspective has merit.",
    Scorpio: "The mind is penetrating, investigative, and psychologically astute. Thinking naturally goes beneath surfaces. Communication is strategic and precise. Nothing is taken at face value.",
    Sagittarius: "Thinking is philosophical, expansive, and vision-oriented. The mind leaps to big-picture understanding before considering details. Communication is enthusiastic and sometimes blunt.",
    Capricorn: "The mind is structured, strategic, and practical. Thinking is organized around goals and outcomes. Communication is measured and authoritative. No word is wasted.",
    Aquarius: "Thinking is innovative, systematic, and unconventional. The mind naturally sees patterns others miss. Communication challenges convention. Ideas arrive from the future.",
    Pisces: "The mind operates through imagination, intuition, and symbolic thinking. Ideas arrive as visions rather than logical constructs. Communication is poetic, sometimes vague, always layered with multiple meanings.",
  },
  Venus: {
    Aries: "Love is bold, direct, and competitive. Attraction is immediate and pursued without hesitation. The aesthetic sensibility values impact and dynamism over subtlety.",
    Taurus: "Venus in its own sign creates a deep capacity for sensual pleasure, loyalty, and the appreciation of natural beauty. Love is patient, devoted, and expressed through physical comfort and material generosity.",
    Gemini: "Love is playful, verbal, and intellectually stimulated. Attraction is sparked by wit, curiosity, and conversational brilliance. The relationship style needs constant variety and mental engagement.",
    Cancer: "Love is nurturing, protective, and deeply sentimental. Attraction grows through emotional safety and shared vulnerability. The capacity for care is vast, though self-protection may initially hide it.",
    Leo: "Love is dramatic, generous, and warm. Attraction is expressed through grand gestures and creative gifts. The relationship style is loyal, passionate, and needs genuine admiration to thrive.",
    Virgo: "Love is expressed through service, attention, and practical care. Attraction grows through shared values and intellectual respect. The aesthetic sensibility values quality, refinement, and understated elegance.",
    Libra: "Venus in its own sign creates a powerful aesthetic sense and deep need for harmonious partnership. Love is balanced, beautiful, and socially gracious. Relationships are central to personal identity.",
    Scorpio: "Love is intense, transformative, and all-or-nothing. Attraction is magnetic and often fated-feeling. The relationship style demands absolute honesty and emotional depth. Surface connections are rejected.",
    Sagittarius: "Love is adventurous, philosophical, and freedom-loving. Attraction is sparked by shared vision and intellectual excitement. The relationship style needs space, growth, and shared exploration.",
    Capricorn: "Love is serious, committed, and built for the long term. Attraction grows through respect and shared ambition. The relationship style values loyalty, stability, and genuine partnership.",
    Aquarius: "Love is unconventional, intellectually charged, and friendship-based. Attraction is sparked by originality and shared ideals. The relationship style values freedom within connection.",
    Pisces: "Venus in its exaltation creates a boundless capacity for love, compassion, and artistic sensitivity. Love is transcendent, sometimes idealistic, always deeply felt. The capacity for devotion is extraordinary.",
  },
  Mars: {
    Aries: "Mars in its own sign creates pure, undiluted drive. Energy is explosive, direct, and competitive. Action is instinctive rather than strategic. The physical vitality is exceptional.",
    Taurus: "Energy is slow, persistent, and enormously powerful. Drive builds steadily and is nearly unstoppable once engaged. The approach to conflict is patient \u2014 outlasting rather than outfighting.",
    Gemini: "Energy is mental, verbal, and scattered across multiple projects. Drive is intellectual \u2014 the fight is won through words, ideas, and strategic communication. Physical energy is nervous and restless.",
    Cancer: "Energy is emotionally driven and protective. Drive is activated by threats to home, family, or emotional safety. Action is indirect and strategic rather than confrontational.",
    Leo: "Energy is dramatic, creative, and generous. Drive is fueled by passion and the desire to create something magnificent. Action is bold, warm, and impossible to ignore.",
    Virgo: "Energy is precise, efficient, and service-oriented. Drive is channeled through work, improvement, and the perfection of skills. The approach is methodical rather than dramatic.",
    Libra: "Energy is relational and aesthetically motivated. Drive is activated through partnership and the pursuit of justice. Action is diplomatic but can be surprisingly decisive when fairness demands it.",
    Scorpio: "Mars in its traditional sign creates intense, strategic, and psychologically powerful energy. Drive is all-or-nothing. Action is calculated and devastatingly effective. The will is indomitable.",
    Sagittarius: "Energy is expansive, adventurous, and philosophically motivated. Drive is activated by vision and the desire for meaningful achievement. Action is bold, optimistic, and sometimes reckless.",
    Capricorn: "Mars in its exaltation reaches peak expression. Ambition becomes strategic rather than impulsive. Physical and professional energy is channeled with precision. This is the general who wins wars through planning, not aggression.",
    Aquarius: "Energy is revolutionary, systematic, and humanitarian. Drive is activated by innovation and the desire to change systems. Action is unconventional and often brilliantly disruptive.",
    Pisces: "Energy flows like water \u2014 intuitive, adaptable, and sometimes diffuse. Drive is spiritually motivated. Action is indirect, creative, and often serves a transcendent purpose.",
  },
  Jupiter: {
    Aries: "Expansion through initiative and leadership. Luck comes from boldness \u2014 the willingness to go first opens doors that remain closed for the cautious.",
    Taurus: "Expansion through material wisdom and sensual abundance. Growth is slow but substantial. There is a natural gift for building wealth and creating lasting comfort.",
    Gemini: "Expansion through knowledge, communication, and intellectual diversity. Learning is the path to abundance. Every connection, every conversation, becomes an opportunity.",
    Cancer: "Jupiter in its exaltation creates enormous natural luck, optimism, and protective energy. Wisdom operates through emotional intelligence. The capacity for nurturing others becomes a source of abundance.",
    Leo: "Expansion through creativity, generosity, and authentic self-expression. Abundance flows from the heart. There is a natural gift for inspiring others and creating joy.",
    Virgo: "Expansion through service, skill development, and attention to detail. Growth comes from becoming genuinely excellent at something. Wisdom is practical and methodical.",
    Libra: "Expansion through relationships, diplomacy, and aesthetic creation. Partnerships bring growth and opportunity. There is a natural gift for creating beauty and harmony.",
    Scorpio: "Expansion through transformation, depth, and psychological understanding. Growth comes from confronting what others avoid. There is a natural gift for navigating crisis.",
    Sagittarius: "Jupiter in its own sign creates a powerful philosophical drive and natural optimism. Expansion is limitless. The vision is grand, the faith is real, and the opportunities tend to match the ambition.",
    Capricorn: "Jupiter in its fall must work harder for growth. Expansion comes through discipline, structure, and long-term planning. The rewards are delayed but substantial when they arrive.",
    Aquarius: "Expansion through innovation, technology, and humanitarian vision. Growth comes from thinking differently. There is a natural gift for understanding systems and networks.",
    Pisces: "Jupiter in its traditional sign creates a vast spiritual and creative capacity. Expansion is boundless and often invisible. The greatest growth happens in the inner world.",
  },
  Saturn: {
    Aries: "Discipline is applied to identity and independence. The life lesson is about developing patience alongside courage \u2014 learning that true strength includes restraint.",
    Taurus: "Discipline is applied to material security and values. The life lesson involves mastering relationship to resources \u2014 building genuine security through patient accumulation rather than anxiety.",
    Gemini: "Discipline is applied to the mind and communication. The life lesson is about developing intellectual rigor and commitment to ideas \u2014 learning to speak with authority and think with precision.",
    Cancer: "Saturn in its detriment creates tension around emotional expression and belonging. The life lesson is about developing emotional maturity \u2014 learning to be nurturing without losing structure.",
    Leo: "Discipline is applied to creativity and self-expression. The life lesson is about developing authentic confidence \u2014 creating from genuine passion rather than performing for approval.",
    Virgo: "Discipline in service and health creates exacting standards. The life lesson is about learning the difference between excellence and perfectionism \u2014 and choosing the former.",
    Libra: "Saturn in its exaltation creates mastery of relationships, justice, and social architecture. The life lesson is about commitment and the weight of true partnership.",
    Scorpio: "Discipline is applied to transformation and psychological depth. The life lesson is about facing fear directly \u2014 developing the courage to die to old selves repeatedly.",
    Sagittarius: "Discipline is applied to philosophy and worldview. The life lesson is about developing genuine wisdom rather than collecting beliefs \u2014 building a philosophy that survives testing.",
    Capricorn: "Saturn in its own sign creates natural authority, structural mastery, and the patience to build empires. The life lesson is about wielding power wisely and knowing that legacy matters more than speed.",
    Aquarius: "Saturn in its traditional sign creates disciplined innovation and structured rebellion. The life lesson is about building the future systematically rather than merely dreaming about it.",
    Pisces: "Discipline is applied to the invisible world \u2014 spirituality, imagination, and compassion. The life lesson is about giving structure to transcendence, making the spiritual practical.",
  },
};

const PLANET_IN_HOUSE: Record<string, Record<number, string>> = {
  Sun: {
    1: "The identity is front and center \u2014 impossible to hide, deeply personal. Self-expression is direct and immediate. Others respond to the personality before anything else.",
    2: "The identity is tied to values, resources, and self-worth. Building something of lasting material value is central to the sense of self.",
    3: "The identity lives in communication, learning, and local connection. The mind and the ability to articulate are central to who this person is.",
    4: "The Sun sits deep in the house of home, roots, inner foundation, and private life. This creates a person whose identity is rooted in creating stable, beautiful, functional environments. The greatest work may never be publicly visible.",
    5: "The identity radiates through creative expression, romance, and play. There is a natural spotlight on artistic output and the joy of creating.",
    6: "The identity is expressed through work, service, and daily practice. Mastery of craft IS the identity \u2014 excellence in the everyday.",
    7: "The identity comes alive through partnership. One-on-one relationships are the crucible in which the self is forged and refined.",
    8: "The identity is forged through transformation. Crisis, depth, and the confrontation with power are central to personal evolution.",
    9: "The identity is a quest for meaning. Philosophy, higher education, travel, and the expansion of worldview are central to the sense of self.",
    10: "The identity is publicly visible and career-oriented. There is a natural drive toward achievement, authority, and leaving a visible legacy.",
    11: "The identity is expressed through community, friendship, and collective purpose. Personal fulfillment comes through contributing to something larger.",
    12: "The identity operates behind the scenes. There is a rich inner life, spiritual depth, and creative power that may not be immediately visible to the world.",
  },
  Moon: {
    1: "Emotions are visible, immediate, and central to the personality. Mood shifts are felt by everyone in the room. The need for emotional authenticity is paramount.",
    2: "Emotional security is tied to material comfort and financial stability. Fluctuations in resources directly affect emotional wellbeing.",
    3: "Emotions are processed through communication and intellectual engagement. Talking about feelings IS processing them.",
    4: "The Moon in its natural house creates a profound connection to home, family, and ancestral memory. The need for a safe, beautiful living space is absolute.",
    5: "Emotions flow into creative expression, romance, and the joy of living. Emotional fulfillment comes through creating something beautiful.",
    6: "Emotions are processed through work and daily routine. When the routine is disrupted, emotional stability wobbles.",
    7: "Emotional security comes through partnership. The emotional nature needs a significant other to feel complete.",
    8: "Emotions run deep and transformative. The inner world is intense, private, and connected to powerful psychological currents.",
    9: "Emotional needs are met through exploration, learning, and philosophical understanding. Travel and education are emotional necessities, not luxuries.",
    10: "Emotions are publicly visible, sometimes uncomfortably so. The career and public image are emotionally charged.",
    11: "Emotional fulfillment comes through friendship, community, and shared ideals. The inner world needs to feel part of something meaningful.",
    12: "The emotional world is vast, hidden, and spiritually oriented. Processing happens in solitude. Intuition is powerful but may be difficult to articulate.",
  },
};

const DECAN_RULER: Record<string, [string, string, string]> = {
  Aries: ["Mars", "Sun", "Jupiter"], Taurus: ["Venus", "Mercury", "Saturn"],
  Gemini: ["Mercury", "Venus", "Uranus"], Cancer: ["Moon", "Pluto", "Neptune"],
  Leo: ["Sun", "Jupiter", "Mars"], Virgo: ["Mercury", "Saturn", "Venus"],
  Libra: ["Venus", "Uranus", "Mercury"], Scorpio: ["Pluto", "Neptune", "Moon"],
  Sagittarius: ["Jupiter", "Mars", "Sun"], Capricorn: ["Saturn", "Venus", "Mercury"],
  Aquarius: ["Uranus", "Mercury", "Venus"], Pisces: ["Neptune", "Moon", "Pluto"],
};

const VENUS_IN_SIGN: Record<string, string> = {
  Aries: "Love is impulsive and passionate. Attraction is immediate and pursued with boldness. There is a competitive quality to romance — the chase itself is intoxicating.",
  Taurus: "Love is sensual and steadfast. Physical comfort, loyalty, and stability define the ideal relationship. Affection is shown through tangible gifts, touch, and unwavering presence.",
  Gemini: "Love is intellectual and playful. Mental stimulation is the primary aphrodisiac. Relationships need constant conversation, variety, and the freedom to explore ideas together.",
  Cancer: "Love is nurturing and protective. Emotional safety is the foundation of all intimacy. The capacity for care is vast, but trust must be earned before vulnerability is offered.",
  Leo: "Love is dramatic and generous. Grand gestures, creative dates, and genuine admiration fuel the romantic fire. Loyalty is absolute, and the expectation of devotion is equally strong.",
  Virgo: "Love is practical and devoted. Affection is expressed through acts of service — fixing, improving, and paying attention to the smallest details of a partner's needs.",
  Libra: "Love is harmonious and idealistic. Beauty, balance, and intellectual rapport define the ideal partnership. Relationships are central to personal identity and creative expression.",
  Scorpio: "Love is intense and transformative. All-or-nothing devotion with deep emotional and physical bonds. Surface connections are rejected instinctively — depth or nothing.",
  Sagittarius: "Love is adventurous and freedom-loving. Shared philosophies, travel, and intellectual growth are the foundation. The relationship must expand horizons, not limit them.",
  Capricorn: "Love is committed and ambitious. Long-term partnership built on mutual respect, shared goals, and genuine substance. Romance deepens with time rather than fading.",
  Aquarius: "Love is unconventional and friendship-based. Intellectual connection and shared ideals matter more than traditional romance. Independence within partnership is non-negotiable.",
  Pisces: "Love is compassionate and transcendent. Spiritual connection, emotional depth, and creative intimacy define the ideal bond. The capacity for devotion is boundless and sometimes idealizing.",
};

const MARS_IN_SIGN: Record<string, string> = {
  Aries: "Drive is pure, explosive, and direct. Action is instinctive rather than strategic. Physical vitality is exceptional, and the competitive spirit never rests.",
  Taurus: "Drive is slow, persistent, and enormously powerful. Once committed to a course of action, nothing diverts the path. Endurance replaces urgency.",
  Gemini: "Drive is mental, verbal, and multi-directional. Energy scatters across projects but the mind is a weapon — arguments are won through speed and wit.",
  Cancer: "Drive is emotionally fueled and protective. Action is indirect and strategic. The fighter emerges when home, family, or emotional safety is threatened.",
  Leo: "Drive is dramatic, creative, and warmly competitive. Energy fuels self-expression, performance, and the desire to create something magnificent and lasting.",
  Virgo: "Drive is precise, efficient, and methodical. Energy channels into perfecting skills and systems. The approach is surgical rather than confrontational.",
  Libra: "Drive is relational and justice-oriented. Energy activates through partnership and fairness. Action is diplomatic but can be surprisingly decisive when balance demands it.",
  Scorpio: "Drive is all-or-nothing, strategic, and psychologically powerful. The will is indomitable. Action is calculated and devastatingly effective when finally deployed.",
  Sagittarius: "Drive is expansive, philosophically motivated, and adventurous. Energy fuels the quest for meaning. Action is bold, optimistic, and sometimes gloriously reckless.",
  Capricorn: "Drive reaches peak expression — ambition becomes strategic rather than impulsive. Energy is channeled with precision toward long-term goals. This is the general who wins wars through planning.",
  Aquarius: "Drive is revolutionary, systematic, and humanitarian. Energy fuels innovation and systemic change. Action is unconventional and often brilliantly disruptive.",
  Pisces: "Drive flows like water — intuitive, adaptable, and sometimes diffuse. Energy serves a transcendent purpose. Action is indirect, creative, and spiritually motivated.",
};

const MC_SIGN: Record<string, string> = {
  Aries: "The career path demands leadership, initiative, and pioneering action. Suited for entrepreneurship, athletics, military, emergency services, or any field requiring decisive authority.",
  Taurus: "The career path builds toward lasting material value. Suited for finance, agriculture, luxury goods, culinary arts, music, or any field valuing quality and permanence.",
  Gemini: "The career path runs through communication and information. Suited for writing, teaching, journalism, marketing, technology, or any field requiring versatility and mental agility.",
  Cancer: "The career path nurtures and protects. Suited for healthcare, real estate, hospitality, counseling, childcare, or any field creating emotional safety for others.",
  Leo: "The career path demands creative visibility. Suited for entertainment, leadership, education, arts, politics, or any field where personal charisma creates impact.",
  Virgo: "The career path perfects systems and serves. Suited for healthcare, analysis, editing, research, technology, nutrition, or any field requiring precision and improvement.",
  Libra: "The career path creates beauty and balance. Suited for law, diplomacy, design, art curation, mediation, fashion, or any field harmonizing opposing forces.",
  Scorpio: "The career path transforms and investigates. Suited for psychology, research, surgery, detective work, crisis management, or any field requiring depth and regeneration.",
  Sagittarius: "The career path expands horizons. Suited for academia, publishing, travel, philosophy, international relations, or any field broadening understanding and perspective.",
  Capricorn: "The career path builds empires. Suited for management, government, architecture, engineering, administration, or any field requiring structural mastery and long-term vision.",
  Aquarius: "The career path innovates and reforms. Suited for technology, science, social activism, aviation, astrology, or any field ahead of its time.",
  Pisces: "The career path heals and inspires. Suited for arts, music, film, spirituality, healthcare, charity, or any field dissolving boundaries and touching the soul.",
};

const NORTH_NODE_SIGN: Record<string, string> = {
  Aries: "The soul's growth direction points toward independence, courage, and self-assertion. Past patterns of compromise and people-pleasing must give way to bold individual action.",
  Taurus: "The soul's growth direction points toward stability, self-worth, and material grounding. Past patterns of crisis and emotional intensity must give way to peace and permanence.",
  Gemini: "The soul's growth direction points toward curiosity, communication, and intellectual flexibility. Past patterns of dogmatic belief must give way to open-minded inquiry.",
  Cancer: "The soul's growth direction points toward emotional vulnerability, nurturing, and home-building. Past patterns of career obsession and emotional control must soften.",
  Leo: "The soul's growth direction points toward creative self-expression and personal recognition. Past patterns of hiding in the collective must give way to individual spotlight.",
  Virgo: "The soul's growth direction points toward practical service, analysis, and health consciousness. Past patterns of escapism and boundlessness must become grounded.",
  Libra: "The soul's growth direction points toward partnership, diplomacy, and aesthetic refinement. Past patterns of lone-wolf independence must open to collaborative creation.",
  Scorpio: "The soul's growth direction points toward transformation, emotional depth, and shared resources. Past patterns of material comfort and resistance to change must dissolve.",
  Sagittarius: "The soul's growth direction points toward philosophy, adventure, and meaning-making. Past patterns of scattered information-gathering must coalesce into wisdom.",
  Capricorn: "The soul's growth direction points toward ambition, structure, and public contribution. Past patterns of emotional dependency must mature into responsible authority.",
  Aquarius: "The soul's growth direction points toward humanitarian vision and collective innovation. Past patterns of personal drama and ego-attachment must give way to community service.",
  Pisces: "The soul's growth direction points toward spiritual surrender, compassion, and transcendence. Past patterns of perfectionism and over-analysis must dissolve into trust.",
};

const TWELFTH_HOUSE_SIGN: Record<string, string> = {
  Aries: "Hidden anger, suppressed independence, and unconscious competitiveness. Spiritual growth through surrendering the need to always be first.",
  Taurus: "Hidden attachment to material security, suppressed sensuality. Spiritual growth through releasing possessive patterns and trusting abundance.",
  Gemini: "Hidden anxiety, suppressed communication, racing thoughts in solitude. Spiritual growth through quieting the mind and trusting intuition over intellect.",
  Cancer: "Hidden emotional wounds, suppressed nurturing needs. Spiritual growth through allowing vulnerability and releasing ancestral emotional patterns.",
  Leo: "Hidden ego struggles, suppressed need for recognition. Spiritual growth through creating without requiring an audience.",
  Virgo: "Hidden perfectionism, suppressed self-criticism. Spiritual growth through accepting imperfection and releasing the need to fix everything.",
  Libra: "Hidden codependency, suppressed need for approval. Spiritual growth through finding inner balance without external validation.",
  Scorpio: "Hidden power dynamics, suppressed intensity. Spiritual growth through releasing control and trusting the transformative process.",
  Sagittarius: "Hidden restlessness, suppressed philosophical doubt. Spiritual growth through finding meaning in stillness rather than constant seeking.",
  Capricorn: "Hidden ambition, suppressed fear of failure. Spiritual growth through releasing the need for external achievement and finding inner authority.",
  Aquarius: "Hidden alienation, suppressed need to belong. Spiritual growth through connecting the intellectual with the emotional and spiritual.",
  Pisces: "The 12th house in its natural sign — the veil between worlds is thin. Powerful psychic sensitivity, vivid dreams, and deep spiritual connection. Growth through structured spiritual practice.",
};

const ELEMENT_HEALTH: Record<string, { risk: string; advice: string }> = {
  Fire: { risk: "inflammation, burnout, fevers, overexertion, heart strain", advice: "cooling exercises, adequate rest, anti-inflammatory diet, meditation" },
  Earth: { risk: "stiffness, weight gain, sluggish metabolism, joint problems", advice: "regular movement, stretching, lighter diet, hydration" },
  Air: { risk: "anxiety, respiratory issues, nervous exhaustion, insomnia", advice: "grounding practices, breathwork, regular sleep schedule, nature walks" },
  Water: { risk: "fluid retention, emotional eating, immune vulnerability, depression", advice: "dry brushing, lymphatic care, emotional processing, boundary setting" },
};

// ---------------------------------------------------------------------------
// Poetic titles for Sun placements
// ---------------------------------------------------------------------------

function sunTitle(sign: string, house: number): string {
  const titles: Record<string, Record<number, string>> = {
    Aries: { 1: "The Warrior Born", 2: "The Material Pioneer", 3: "The Quick Flame", 4: "The Foundational Fire", 5: "The Creative Blaze", 6: "The Precision Strike", 7: "The Diplomatic Fighter", 8: "The Transformative Force", 9: "The Philosophical Warrior", 10: "The Ambitious Leader", 11: "The Revolutionary Spirit", 12: "The Hidden Champion" },
    Taurus: { 1: "The Sensual Presence", 2: "The Master Builder", 3: "The Steady Voice", 4: "The Deep Root", 5: "The Aesthetic Creator", 6: "The Patient Craftsman", 7: "The Devoted Partner", 8: "The Immovable Depths", 9: "The Philosophical Gardener", 10: "The Enduring Legacy", 11: "The Communal Steward", 12: "The Silent Gardener" },
    Gemini: { 1: "The Quicksilver Mind", 2: "The Resourceful Thinker", 3: "The Natural Communicator", 4: "The Private Communicator", 5: "The Playful Storyteller", 6: "The Analytical Craftsman", 7: "The Diplomatic Mind", 8: "The Depth Researcher", 9: "The Eternal Student", 10: "The Public Intellectual", 11: "The Network Builder", 12: "The Hidden Writer" },
    Cancer: { 1: "The Nurturing Presence", 2: "The Emotional Banker", 3: "The Intuitive Voice", 4: "The Keeper of Hearth", 5: "The Creative Mother", 6: "The Healing Servant", 7: "The Empathic Partner", 8: "The Emotional Alchemist", 9: "The Spiritual Pilgrim", 10: "The Public Nurturer", 11: "The Community Mother", 12: "The Dream Weaver" },
    Leo: { 1: "The Radiant One", 2: "The Generous King", 3: "The Golden Voice", 4: "The Heart of Home", 5: "The Creative Sun", 6: "The Noble Servant", 7: "The Romantic Partner", 8: "The Dramatic Transformer", 9: "The Philosophical King", 10: "The Born Leader", 11: "The Community Star", 12: "The Hidden Sun" },
    Virgo: { 1: "The Precision Instrument", 2: "The Material Analyst", 3: "The Master Communicator", 4: "The Master Architect", 5: "The Elegant Creator", 6: "The Master Craftsman", 7: "The Discerning Partner", 8: "The Deep Analyst", 9: "The Scholarly Mind", 10: "The Organizational Genius", 11: "The Systems Thinker", 12: "The Hidden Healer" },
    Libra: { 1: "The Beautiful Balance", 2: "The Aesthetic Investor", 3: "The Harmonious Voice", 4: "The Peaceful Home", 5: "The Artistic Heart", 6: "The Elegant Worker", 7: "The Perfect Partner", 8: "The Balanced Transformer", 9: "The Philosophical Artist", 10: "The Diplomatic Leader", 11: "The Social Architect", 12: "The Hidden Harmonizer" },
    Scorpio: { 1: "The Magnetic Presence", 2: "The Psychological Investor", 3: "The Penetrating Mind", 4: "The Emotional Fortress", 5: "The Passionate Creator", 6: "The Transformative Worker", 7: "The Intense Partner", 8: "The Phoenix", 9: "The Truth Seeker", 10: "The Power Broker", 11: "The Revolutionary Agent", 12: "The Hidden Power" },
    Sagittarius: { 1: "The Adventurous Soul", 2: "The Philosophical Investor", 3: "The Inspired Teacher", 4: "The Wandering Root", 5: "The Creative Visionary", 6: "The Philosophical Worker", 7: "The Freedom-Loving Partner", 8: "The Depth Explorer", 9: "The Natural Philosopher", 10: "The Visionary Leader", 11: "The Social Visionary", 12: "The Spiritual Adventurer" },
    Capricorn: { 1: "The Mountain", 2: "The Master Accumulator", 3: "The Strategic Voice", 4: "The Foundation Builder", 5: "The Disciplined Creator", 6: "The Work Ethic", 7: "The Committed Partner", 8: "The Strategic Transformer", 9: "The Wise Elder", 10: "The Empire Builder", 11: "The Structure Maker", 12: "The Silent Authority" },
    Aquarius: { 1: "The Original", 2: "The Innovative Investor", 3: "The Revolutionary Mind", 4: "The Unconventional Home", 5: "The Genius Creator", 6: "The Systematic Innovator", 7: "The Progressive Partner", 8: "The Technological Transformer", 9: "The Future Philosopher", 10: "The Humanitarian Leader", 11: "The Community Architect", 12: "The Hidden Revolutionary" },
    Pisces: { 1: "The Dreamer", 2: "The Intuitive Investor", 3: "The Poetic Voice", 4: "The Spiritual Home", 5: "The Visionary Creator", 6: "The Healing Worker", 7: "The Soulful Partner", 8: "The Mystic Transformer", 9: "The Spiritual Seeker", 10: "The Compassionate Leader", 11: "The Collective Dreamer", 12: "The Transcendent Soul" },
  };
  return titles[sign]?.[house] || "The Cosmic Identity";
}

function moonTitle(sign: string): string {
  const t: Record<string, string> = {
    Aries: "The Warrior Heart", Taurus: "The Sensual Soul", Gemini: "The Curious Heart",
    Cancer: "The Oceanic Heart", Leo: "The Radiant Heart", Virgo: "The Analytical Heart",
    Libra: "The Aesthetic Heart", Scorpio: "The Depth Seeker", Sagittarius: "The Free Spirit",
    Capricorn: "The Stoic Heart", Aquarius: "The Rebel Heart", Pisces: "The Mystic Heart",
  };
  return t[sign] || "The Emotional Core";
}

function ascTitle(sign: string): string {
  const t: Record<string, string> = {
    Aries: "The Fearless Face", Taurus: "The Grounded Presence", Gemini: "The Mercury Mind",
    Cancer: "The Protective Shell", Leo: "The Magnetic Aura", Virgo: "The Refined Instrument",
    Libra: "The Graceful Mask", Scorpio: "The Magnetic Gaze", Sagittarius: "The Open Road",
    Capricorn: "The Quiet Authority", Aquarius: "The Unusual One", Pisces: "The Dreaming Face",
  };
  return t[sign] || "The Rising Persona";
}

// ---------------------------------------------------------------------------
// Main export function
// ---------------------------------------------------------------------------

export async function generateComprehensiveReport(
  profile: Profile,
  onProgress?: (p: ExportProgress) => void,
): Promise<Blob> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const datetime = `${profile.birthDate}T${profile.birthTime || "12:00"}:00`;
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 22;
  const CW = W - 2 * M;
  let pageNum = 0;
  const firstName = profile.name.split(" ")[0];

  // =======================================================================
  // Drawing helpers matching the reference PDF style
  // =======================================================================

  function darkPage() {
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, W, H, "F");
  }

  function pageFooter() {
    doc.setFontSize(9);
    doc.setFont("times", "normal");
    doc.setTextColor(...MUTED);
    doc.text(`\u2014 ${pageNum} \u2014`, W / 2, H - 12, { align: "center" });
    // small gold dots in corners
    doc.setFillColor(...GOLD);
    doc.circle(M - 5, H - 12, 0.6, "F");
    doc.circle(W - M + 5, H - 12, 0.6, "F");
  }

  function newPage() {
    doc.addPage();
    pageNum++;
    darkPage();
    // Top gold line
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(M, 15, W - M, 15);
    pageFooter();
  }

  function ensureSpace(y: number, needed: number): number {
    if (y + needed > H - 25) { newPage(); return 25; }
    return y;
  }

  // Chapter title: large gold serif text (matching "I. WESTERN ASTROLOGY")
  function chapterTitle(y: number, numeral: string, title: string, subtitle: string): number {
    y = ensureSpace(y, 50);
    doc.setFontSize(22);
    doc.setFont("times", "bold");
    doc.setTextColor(...GOLD);
    doc.text(`${numeral}. ${title.toUpperCase()}`, M, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont("times", "italic");
    doc.setTextColor(...MUTED);
    doc.text(subtitle, M, y);
    y += 5;
    // Gold divider with end dots
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(M, y, W - M, y);
    doc.setFillColor(...GOLD);
    doc.circle(M, y, 0.8, "F");
    doc.circle(W - M, y, 0.8, "F");
    return y + 12;
  }

  // Section heading: gold serif (matching "Dignities and Debilities")
  function sectionHead(y: number, text: string): number {
    y = ensureSpace(y, 20);
    doc.setFontSize(16);
    doc.setFont("times", "normal");
    doc.setTextColor(...GOLD);
    doc.text(text, M, y);
    return y + 9;
  }

  // Planet heading: e.g. "☉ Virgo Sun at 25° in the 4th House"
  function planetHead(y: number, text: string): number {
    y = ensureSpace(y, 18);
    doc.setFontSize(15);
    doc.setFont("times", "normal");
    doc.setTextColor(...GOLD);
    doc.text(text, M, y);
    return y + 8;
  }

  // Poetic italic subtitle: "The Master Architect"
  function poeticSub(y: number, text: string): number {
    y = ensureSpace(y, 8);
    doc.setFontSize(10);
    doc.setFont("times", "italic");
    doc.setTextColor(...GOLD);
    doc.text(text, M, y);
    return y + 7;
  }

  // Body text — warm white, wrapped
  function body(y: number, text: string): number {
    if (!text) return y;
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.setTextColor(...WHITE);
    const lines: string[] = doc.splitTextToSize(text, CW);
    for (const line of lines) {
      y = ensureSpace(y, 5);
      doc.text(line, M, y);
      y += 4.8;
    }
    return y + 3;
  }

  // Muted italic text
  function mutedItalic(y: number, text: string): number {
    if (!text) return y;
    doc.setFontSize(9);
    doc.setFont("times", "italic");
    doc.setTextColor(...MUTED);
    const lines: string[] = doc.splitTextToSize(text, CW);
    for (const line of lines) {
      y = ensureSpace(y, 4.5);
      doc.text(line, M, y);
      y += 4.5;
    }
    return y + 2;
  }

  // Boxed callout card with gold border (matching reference's aspect boxes)
  function calloutBox(y: number, title: string, text: string): number {
    const titleLines: string[] = doc.splitTextToSize(title, CW - 16);
    const bodyLines: string[] = doc.splitTextToSize(text, CW - 16);
    const boxH = 10 + titleLines.length * 5.5 + bodyLines.length * 4.5 + 4;
    y = ensureSpace(y, boxH + 4);
    // Background
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(M, y - 3, CW, boxH, 2, 2, "F");
    // Gold border
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y - 3, CW, boxH, 2, 2, "S");
    // Title
    let ty = y + 4;
    doc.setFontSize(10);
    doc.setFont("times", "bold");
    doc.setTextColor(...GOLD);
    for (const line of titleLines) { doc.text(line, M + 8, ty); ty += 5.5; }
    // Body
    doc.setFontSize(9.5);
    doc.setFont("times", "normal");
    doc.setTextColor(...WHITE);
    for (const line of bodyLines) { doc.text(line, M + 8, ty); ty += 4.5; }
    return y + boxH + 5;
  }

  // Bullet point with gold arrow marker
  function bullet(y: number, text: string): number {
    y = ensureSpace(y, 10);
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.setTextColor(...GOLD);
    doc.text(">", M + 4, y);
    doc.setTextColor(...WHITE);
    const lines: string[] = doc.splitTextToSize(text, CW - 14);
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) y = ensureSpace(y, 4.8);
      doc.text(lines[i], M + 10, y);
      y += 4.8;
    }
    return y + 1;
  }

  // Gold divider with dots (matching reference section breaks)
  function divider(y: number): number {
    y = ensureSpace(y, 8);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.3);
    const midY = y + 2;
    doc.line(M + 10, midY, W - M - 10, midY);
    doc.setFillColor(...GOLD);
    doc.circle(M + 10, midY, 0.7, "F");
    doc.circle(W - M - 10, midY, 0.7, "F");
    return y + 10;
  }

  // Styled table matching reference (dark header, alternating rows)
  function styledTable(y: number, headers: string[], rows: string[][]): number {
    if (!rows.length) return y;
    y = ensureSpace(y, 25);
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
        font: "times",
        cellPadding: 3,
        lineWidth: 0.15,
        lineColor: BORDER,
      },
      headStyles: {
        fillColor: TABLE_HDR,
        textColor: GOLD,
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: { fillColor: TABLE_ALT },
      didDrawPage: () => { darkPage(); pageNum++; pageFooter(); },
    });
    return ((doc as any).lastAutoTable?.finalY ?? y + 20) + 6;
  }

  // =======================================================================
  // FETCH ALL DATA (keep existing batched approach)
  // =======================================================================

  onProgress?.({ stage: "Fetching natal chart data...", percent: 5 });

  const post = async (url: string, payload: object): Promise<any> => {
    try {
      const res = await fetch(`${API_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  };

  const get = async (url: string): Promise<any> => {
    try {
      const res = await fetch(`${API_URL}${url}`);
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  };

  const birthPayload = { datetime, latitude: profile.lat, longitude: profile.lon, timezone: profile.timezone || "UTC" };

  // Batch 1: Core charts
  const [western, bazi, vedic, humanDesign, solarReturn, progressions] = await Promise.all([
    post("/api/v1/charts/western", birthPayload),
    post("/api/v1/charts/bazi", { datetime, gender: "neutral" }),
    post("/api/v1/charts/vedic", birthPayload),
    post("/api/v1/charts/human-design", birthPayload),
    post("/api/v1/charts/solar-return", { ...birthPayload, target_year: new Date().getFullYear() }),
    post("/api/v1/charts/progressions", { ...birthPayload, target_date: new Date().toISOString() }),
  ]);

  onProgress?.({ stage: "Analyzing planetary patterns...", percent: 25 });

  const positions = western?.positions || {};
  const sunSign = positions.Sun?.sign || "Aries";
  const moonSign = positions.Moon?.sign || "Cancer";
  const houses: any[] = western?.houses || [];
  const h1 = houses.find((h: any) => (h.number || h.house) === 1);
  const ascSign = h1?.sign || "Libra";
  const sunDeg = Math.round(positions.Sun?.degree_in_sign ?? positions.Sun?.degree ?? 0);
  const moonDeg = Math.round(positions.Moon?.degree_in_sign ?? positions.Moon?.degree ?? 0);
  const ascDeg = Math.round(h1?.degree ?? 0);
  const sunHouse = positions.Sun?.house || 1;
  const moonHouse = positions.Moon?.house || 1;
  const mbtiType = SIGN_TO_MBTI[sunSign] || "INTJ";

  // Build maps
  const flatPositions: Record<string, number> = {};
  const posMap: Record<string, { sign: string; degree: number; house: number; speed: number; retrograde: boolean; longitude: number }> = {};
  for (const [p, d] of Object.entries(positions)) {
    const pd = d as any;
    flatPositions[p] = pd.longitude || 0;
    posMap[p] = {
      sign: pd.sign || "", degree: pd.degree_in_sign ?? pd.degree ?? 0,
      house: pd.house || 0, speed: pd.speed || 0,
      retrograde: pd.retrograde || (pd.speed != null && pd.speed < 0),
      longitude: pd.longitude || 0,
    };
  }
  const aspects: any[] = western?.aspects || [];

  // Batch 2: Advanced + personality
  const [fixedStars, arabicParts, enneagram, synthData, biorhythm, archetypes,
    colorPalette, spiritAnimal, tarotCards, convergence, chiron, northNode] = await Promise.all([
    post("/api/v1/western/fixed-stars", birthPayload),
    post("/api/v1/western/arabic-parts", birthPayload),
    post("/api/v1/personality/enneagram", { mbti_type: mbtiType }),
    post("/api/v1/personality/calculate", { mbti_type: mbtiType }),
    post("/api/v1/personality/biorhythm", { birth_date: profile.birthDate, target_date: new Date().toISOString().split("T")[0] }),
    post("/api/v1/psychology/jungian-archetypes", { sun_sign: sunSign, moon_sign: moonSign, ascendant: ascSign }),
    post("/api/v1/psychology/color-palette", { sun_sign: sunSign, moon_sign: moonSign, rising_sign: ascSign }),
    post("/api/v1/psychology/spirit-animal", { sun_sign: sunSign, moon_sign: moonSign, rising_sign: ascSign, birth_year: parseInt(profile.birthDate.split("-")[0]), birth_month: parseInt(profile.birthDate.split("-")[1]), birth_day: parseInt(profile.birthDate.split("-")[2]) }),
    post("/api/v1/personality/tarot/birth-cards", { birth_date: profile.birthDate }),
    post("/api/v1/personality/cosmic-convergence", birthPayload),
    post("/api/v1/western/chiron", birthPayload),
    post("/api/v1/western/north-node", birthPayload),
  ]);

  onProgress?.({ stage: "Computing techniques & synthesis...", percent: 50 });

  const dignityPlanets: Record<string, any> = {};
  for (const [p, d] of Object.entries(positions)) {
    const pd = d as any;
    dignityPlanets[p] = { sign: pd.sign, degree: pd.degree_in_sign || 0, house: pd.house || 1, speed: pd.speed || 1 };
  }

  const [sabianSymbols, dignities, sect, profection, dynamicPersonality,
    elementBalance, nineStarKi, fengShui, transits] = await Promise.all([
    post("/api/v1/techniques/sabian-symbols", { planet_positions: flatPositions }),
    post("/api/v1/techniques/dignities", { chart_data: { planets: dignityPlanets } }),
    post("/api/v1/western/hellenistic/sect", birthPayload),
    post("/api/v1/western/hellenistic/profection", { birth_year: parseInt(profile.birthDate.split("-")[0]), current_year: new Date().getFullYear(), asc_sign: ascSign }),
    post("/api/v1/integration/dynamic-personality", { birth_data: { birth_datetime: datetime, latitude: profile.lat, longitude: profile.lon }, target_datetime: new Date().toISOString() }),
    post("/api/v1/integration/element-balance", birthPayload),
    post("/api/v1/chinese/ninestarki/calculate", { birth_year: parseInt(profile.birthDate.split("-")[0]), birth_month: parseInt(profile.birthDate.split("-")[1]) }),
    post("/api/v1/chinese/fengshui/chart", { year: parseInt(profile.birthDate.split("-")[0]), facing_direction: "South" }),
    post("/api/v1/transits/current", { natal_positions: Object.fromEntries(Object.entries(flatPositions).map(([k, v]) => [k, { longitude: v }])) }),
  ]);

  onProgress?.({ stage: "Fetching advanced systems...", percent: 58 });

  // Batch 4: Advanced Western + techniques (needs flatPositions from Batch 1)
  const birthYear = parseInt(profile.birthDate.split("-")[0]);
  const birthMonth = parseInt(profile.birthDate.split("-")[1]);

  const [draconic, asteroids, harmonics, almuten, declinations, midpoints, degreeTheory, planetaryHours] = await Promise.all([
    post("/api/v1/western/draconic", birthPayload),
    post("/api/v1/western/asteroids", birthPayload),
    post("/api/v1/western/harmonics", birthPayload),
    post("/api/v1/western/hellenistic/almuten", birthPayload),
    post("/api/v1/techniques/declinations", { planet_positions: flatPositions }),
    post("/api/v1/techniques/midpoints", { planet_positions: flatPositions }),
    post("/api/v1/techniques/degree-theory", { planet_positions: flatPositions }),
    post("/api/v1/techniques/planetary-hours", { datetime, latitude: profile.lat, longitude: profile.lon }),
  ]);

  onProgress?.({ stage: "Querying Chinese & predictive systems...", percent: 63 });

  // Batch 5: Chinese extended + Vedic extended
  const baziPayload = { datetime, gender: "neutral" };
  const [baziLuck, nineStarKiCompat, iChing, ziwei, vimshottari, kpSystem, numerology] = await Promise.all([
    post("/api/v1/chinese/bazi/luck-periods", baziPayload),
    post("/api/v1/chinese/ninestarki/compatibility", { birth_year: birthYear, birth_month: birthMonth }),
    post("/api/v1/chinese/iching/cast", { question: "What is the birth hexagram?" }),
    post("/api/v1/eastern/ziwei", { datetime, gender: "neutral" }),
    post("/api/v1/predictive/vimshottari", birthPayload),
    post("/api/v1/eastern/kp-system", birthPayload),
    post("/api/v1/validation/numerology", { full_name: profile.name, birth_date: profile.birthDate }),
  ]);

  onProgress?.({ stage: "Checking cosmic weather...", percent: 68 });

  // Batch 6: Predictive + Space Weather + Integration
  const [electional, retrograde, spaceWeather, spaceWeatherForecast, timingConvergence, crossPollination, transitForecast] = await Promise.all([
    post("/api/v1/predictive/electional", birthPayload),
    post("/api/v1/transits/retrograde", {}),
    get("/api/v1/space-weather/current"),
    get("/api/v1/space-weather/forecast"),
    post("/api/v1/integration/timing-convergence", birthPayload),
    get("/api/v1/integration/cross-pollination"),
    post("/api/v1/transits/forecast", { natal_positions: Object.fromEntries(Object.entries(flatPositions).map(([k, v]) => [k, { longitude: v }])) }),
  ]);

  onProgress?.({ stage: "Composing your natal reading...", percent: 72 });

  // Compute element/modality counts
  const elemCount: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modCount: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  const mainPlanets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  for (const p of mainPlanets) {
    const s = posMap[p]?.sign;
    if (s && SIGN_ELEMENT[s]) elemCount[SIGN_ELEMENT[s]]++;
    if (s && SIGN_MODALITY[s]) modCount[SIGN_MODALITY[s]]++;
  }
  const domElement = Object.entries(elemCount).sort((a, b) => b[1] - a[1])[0];

  // Life path number — needed by multiple chapters
  const lpDigits = profile.birthDate.replace(/-/g, "").split("").map(Number);
  let lpSum = lpDigits.reduce((a, b) => a + b, 0);
  while (lpSum > 9 && lpSum !== 11 && lpSum !== 22 && lpSum !== 33) {
    lpSum = String(lpSum).split("").map(Number).reduce((a, b) => a + b, 0);
  }

  // Decan helper
  function getDecan(deg: number): number { return deg < 10 ? 1 : deg < 20 ? 2 : 3; }

  // Aspect helpers
  function getAspectsFor(planet: string): any[] {
    return aspects.filter((a: any) =>
      (a.planet1 === planet || a.p1 === planet || a.planet2 === planet || a.p2 === planet)
      && Number(a.orb ?? 99) < 5
    ).sort((a: any, b: any) => Number(a.orb ?? 99) - Number(b.orb ?? 99));
  }
  function aspectName(a: any): string {
    const type = a.aspect || a.type || "";
    const g = ASPECT_GLYPH[type.toLowerCase()] || type;
    const p1 = a.planet1 || a.p1 || "";
    const p2 = a.planet2 || a.p2 || "";
    const g1 = GLYPH[p1] || p1;
    const g2 = GLYPH[p2] || p2;
    const orb = Number(a.orb ?? 0).toFixed(1);
    return `${g1} ${g} ${g2} (${orb}\u00b0)`;
  }

  // Aspect importance classification (Bug fix #6)
  function aspectLabel(orb: number): string {
    if (orb <= 0.5) return "Essentially EXACT";
    if (orb <= 1.0) return "Near-Exact Aspect";
    if (orb <= 3.0) return "Significant Aspect";
    return "Background Aspect";
  }

  // House finder from cusps (Bug fix #3)
  const SIGN_ORDER = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  function findHouse(planetLon: number, houseArr: any[]): number {
    if (!houseArr || houseArr.length < 12) return 0;
    const cusps = houseArr.map((h: any) => {
      const si = SIGN_ORDER.indexOf(h.sign);
      return ((si >= 0 ? si * 30 : 0) + (h.degree_in_sign ?? h.degree ?? 0)) % 360;
    });
    for (let i = 0; i < 12; i++) {
      const start = cusps[i];
      const end = cusps[(i + 1) % 12];
      if (end > start) {
        if (planetLon >= start && planetLon < end) return i + 1;
      } else {
        if (planetLon >= start || planetLon < end) return i + 1;
      }
    }
    return 1;
  }

  // Recalculate house for all planets using cusp data (Bug fix #3)
  if (houses.length >= 12) {
    for (const [p, info] of Object.entries(posMap)) {
      const computed = findHouse(info.longitude, houses);
      if (computed > 0) posMap[p] = { ...info, house: computed };
    }
  }
  // Re-extract after fix
  const sunHouseFixed = posMap["Sun"]?.house || sunHouse;
  const moonHouseFixed = posMap["Moon"]?.house || moonHouse;

  // Planet significance one-liner (Bug fix #5)
  function getPlanetSignificance(planet: string, sign: string, house: number): string {
    const domiciles: Record<string, string[]> = { Sun: ["Leo"], Moon: ["Cancer"], Mercury: ["Gemini", "Virgo"], Venus: ["Taurus", "Libra"], Mars: ["Aries", "Scorpio"], Jupiter: ["Sagittarius", "Pisces"], Saturn: ["Capricorn", "Aquarius"], Uranus: ["Aquarius"], Neptune: ["Pisces"], Pluto: ["Scorpio"] };
    const exaltations: Record<string, string> = { Sun: "Aries", Moon: "Taurus", Mercury: "Virgo", Venus: "Pisces", Mars: "Capricorn", Jupiter: "Cancer", Saturn: "Libra" };
    const detriments: Record<string, string[]> = { Sun: ["Aquarius"], Moon: ["Capricorn"], Mercury: ["Sagittarius", "Pisces"], Venus: ["Aries", "Scorpio"], Mars: ["Taurus", "Libra"], Jupiter: ["Gemini", "Virgo"], Saturn: ["Cancer", "Leo"] };
    const falls: Record<string, string> = { Sun: "Libra", Moon: "Scorpio", Mercury: "Pisces", Venus: "Virgo", Mars: "Cancer", Jupiter: "Capricorn", Saturn: "Aries" };
    if (domiciles[planet]?.includes(sign)) return `Domicile - ${planet} rules ${sign}, full strength`;
    if (exaltations[planet] === sign) return `Exalted - ${planet} at peak power in ${sign}`;
    if (detriments[planet]?.includes(sign)) return `Detriment - ${planet} challenged in ${sign}`;
    if (falls[planet] === sign) return `Fall - ${planet} weakened in ${sign}`;
    const interp = PLANET_IN_SIGN[planet]?.[sign];
    if (interp) return interp.split(".")[0];
    return `${planet} in H${house}`;
  }

  // ASC aspects calculation (Quality improvement #7)
  const ascLon = houses.length > 0 ? (() => {
    const h = houses[0];
    const si = SIGN_ORDER.indexOf(h?.sign);
    return si >= 0 ? ((si * 30) + (h.degree_in_sign ?? h.degree ?? 0)) % 360 : 0;
  })() : 0;

  function calcAscAspects(): any[] {
    if (!ascLon) return [];
    const ASPECT_ANGLES = [
      { name: "conjunction", angle: 0, orb: 8 },
      { name: "opposition", angle: 180, orb: 8 },
      { name: "trine", angle: 120, orb: 8 },
      { name: "square", angle: 90, orb: 8 },
      { name: "sextile", angle: 60, orb: 6 },
    ];
    const result: any[] = [];
    for (const [planet, info] of Object.entries(posMap)) {
      if (planet === "Ascendant" || planet === "ASC") continue;
      const diff = Math.abs(ascLon - info.longitude);
      const arc = diff > 180 ? 360 - diff : diff;
      for (const asp of ASPECT_ANGLES) {
        const orbVal = Math.abs(arc - asp.angle);
        if (orbVal <= asp.orb) {
          result.push({ planet1: "ASC", planet2: planet, p1: "ASC", p2: planet, aspect: asp.name, type: asp.name, orb: orbVal });
        }
      }
    }
    return result.sort((a, b) => a.orb - b.orb);
  }
  const ascAspectsComputed = calcAscAspects();

  // Chart pattern detection (Quality improvement #8)
  function detectPatterns(): string[] {
    const patterns: string[] = [];
    // Stellium: 3+ planets in the same sign
    const signCounts: Record<string, string[]> = {};
    for (const [p, d] of Object.entries(posMap)) {
      if (!mainPlanets.includes(p)) continue;
      const s = d.sign;
      if (!signCounts[s]) signCounts[s] = [];
      signCounts[s].push(p);
    }
    for (const [sign, planets] of Object.entries(signCounts)) {
      if (planets.length >= 3) {
        patterns.push(`Stellium in ${sign}: ${planets.join(", ")} -- a concentrated focus of energy in the domain of ${sign}. This creates an extraordinary emphasis on ${SIGN_ELEMENT[sign] || ""} qualities.`);
      }
    }
    // Hemisphere emphasis
    const upperPlanets = mainPlanets.filter(p => posMap[p] && posMap[p].house >= 7 && posMap[p].house <= 12);
    const lowerPlanets = mainPlanets.filter(p => posMap[p] && posMap[p].house >= 1 && posMap[p].house <= 6);
    if (upperPlanets.length >= 7) {
      patterns.push(`Upper hemisphere emphasis (${upperPlanets.length} planets above the horizon): ${firstName}'s energy is oriented toward the public sphere, career, and social contribution.`);
    } else if (lowerPlanets.length >= 7) {
      patterns.push(`Lower hemisphere emphasis (${lowerPlanets.length} planets below the horizon): ${firstName}'s energy is oriented toward personal development, home, and inner work.`);
    }
    const eastPlanets = mainPlanets.filter(p => posMap[p] && (posMap[p].house >= 10 || posMap[p].house <= 3));
    const westPlanets = mainPlanets.filter(p => posMap[p] && posMap[p].house >= 4 && posMap[p].house <= 9);
    if (eastPlanets.length >= 7) {
      patterns.push(`Eastern hemisphere emphasis (${eastPlanets.length} planets): Self-directed, independent, and personally motivated.`);
    } else if (westPlanets.length >= 7) {
      patterns.push(`Western hemisphere emphasis (${westPlanets.length} planets): Other-directed, collaborative, and responsive to external demands.`);
    }
    return patterns;
  }

  // Element/modality interpretation texts (Quality improvement #9)
  const ELEMENT_EXCESS: Record<string, string> = {
    Fire: "dominant Fire creates a personality driven by inspiration, action, and enthusiasm -- but may struggle with patience and listening.",
    Earth: "dominant Earth creates reliability and practical genius -- but may resist change and emotional vulnerability.",
    Air: "dominant Air creates a brilliant communicator and thinker -- but may intellectualize feelings rather than experiencing them.",
    Water: "dominant Water creates deep emotional intelligence and intuition -- but may be overwhelmed by feelings and boundary issues.",
  };
  const ELEMENT_LACK: Record<string, string> = {
    Fire: "a lack of Fire may mean difficulty with initiative, motivation, and self-assertion. Energy must be consciously cultivated.",
    Earth: "a lack of Earth may mean difficulty with practical matters, finances, and follow-through. Grounding practices are essential.",
    Air: "a lack of Air may mean difficulty with objectivity, communication, and social connection. Intellectual engagement helps.",
    Water: "a lack of Water may mean difficulty with emotional processing and intimacy. Developing empathy is a lifelong lesson.",
  };

  // Retrograde planets (Quality improvement #10)
  const retrogradePlanets = Object.entries(posMap)
    .filter(([, d]) => d.retrograde)
    .map(([name]) => name);

  // LLM-powered narrative generation (Feature #11)
  async function llmGenerate(prompt: string, context: string): Promise<string> {
    try {
      const sysPrompt = "You are a master astrologer writing a professional natal report. Write in third person using the querent's first name. Be specific, reference exact degrees and aspects. Write in flowing prose, not bullet points. Do not use markdown formatting.";
      const sessionRes = await fetch(`${API_URL}/api/v1/llm/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system_prompt: sysPrompt }),
      });
      if (!sessionRes.ok) return "";
      const { session_id } = await sessionRes.json();
      const msgRes = await fetch(`${API_URL}/api/v1/llm/sessions/${session_id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: `${prompt}\n\nChart data:\n${context}` }),
      });
      if (!msgRes.ok) return "";
      const data = await msgRes.json();
      return data.content || "";
    } catch {
      return "";
    }
  }

  // =======================================================================
  // PAGE 1: COVER — matching reference exactly
  // =======================================================================
  darkPage();
  pageNum = 1;

  // Scattered gold star dots
  const starPositions = [
    [35, 28], [72, 18], [140, 25], [180, 35], [55, 50], [160, 55], [25, 80],
    [110, 42], [190, 72], [30, 120], [175, 110], [50, 170], [165, 160],
    [80, 220], [135, 240], [45, 260], [170, 250], [90, 275], [155, 270],
    [28, 195], [185, 195], [120, 280], [65, 140], [145, 85], [100, 55],
  ];
  doc.setFillColor(...GOLD);
  for (const [sx, sy] of starPositions) {
    const size = 0.3 + Math.random() * 0.6;
    doc.circle(sx, sy, size, "F");
  }

  // Name — large serif
  doc.setFontSize(30);
  doc.setFont("times", "bold");
  doc.setTextColor(...GOLD);
  doc.text(profile.name.toUpperCase(), W / 2, 105, { align: "center" });

  // Subtitle
  doc.setFontSize(13);
  doc.setFont("times", "normal");
  doc.setTextColor(...MUTED);
  doc.text("Full Multi-System Natal Reading", W / 2, 118, { align: "center" });

  // Systems count
  doc.setFontSize(9);
  doc.setFont("times", "italic");
  doc.setTextColor(...MUTED);
  doc.text("45 Methodology Systems \u00b7 27 MoE Experts \u00b7 90+ Engines", W / 2, 126, { align: "center" });

  // Gold line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(W / 2 - 45, 130, W / 2 + 45, 130);

  // Birth info
  doc.setFontSize(10.5);
  doc.setFont("times", "normal");
  doc.setTextColor(...MUTED);
  const birthDateFormatted = new Date(profile.birthDate + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.text(`${birthDateFormatted} \u00b7 ${profile.birthTime || "12:00"} \u00b7 ${profile.city || `${profile.lat.toFixed(2)}, ${profile.lon.toFixed(2)}`}`, W / 2, 142, { align: "center" });

  // Big Three line
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text(`${sunSign} Sun ${sunDeg}  -  ${moonSign} Moon ${moonDeg}  -  ${ascSign} Rising ${ascDeg}`, W / 2, 155, { align: "center" });

  // Human Design line
  const hdData = humanDesign?.data ?? humanDesign;
  if (hdData?.type) {
    doc.setTextColor(...MUTED);
    doc.text(`Human Design: ${hdData.type}${hdData.authority ? ` \u00b7 ${hdData.authority}` : ""}`, W / 2, 164, { align: "center" });
  }

  // BaZi line
  const baziData = bazi?.data ?? bazi;
  const dayMaster = baziData?.day_master || baziData?.pillars?.day?.heavenly_stem;
  if (dayMaster) {
    doc.text(`Chinese: ${dayMaster} Day Master`, W / 2, 172, { align: "center" });
  }

  // Systems line (italic)
  doc.setFontSize(10);
  doc.setFont("times", "italic");
  doc.setTextColor(...GOLD);
  doc.text("Western \u00b7 Vedic \u00b7 Chinese \u00b7 Human Design \u00b7 Numerology \u00b7 Hellenistic \u00b7 Draconic", W / 2, 192, { align: "center" });

  pageFooter();

  // =======================================================================
  // PAGE 2: TABLE OF CONTENTS
  // =======================================================================
  newPage();
  let y = 30;

  doc.setFontSize(22);
  doc.setFont("times", "bold");
  doc.setTextColor(...GOLD);
  doc.text("TABLE OF CONTENTS", M, y);
  y += 5;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(M, y, W - M, y);
  doc.setFillColor(...GOLD);
  doc.circle(M, y, 0.8, "F");
  doc.circle(W - M, y, 0.8, "F");
  y += 12;

  const tocEntries: [string, string, string][] = [
    ["I", "Western Astrology", "The Tropical Chart"],
    ["II", "Hellenistic & Classical Techniques", "The Ancient Foundations"],
    ["III", "Advanced Western Systems", "Draconic, Harmonics & Beyond"],
    ["IV", "Vedic Astrology (Jyotish)", "The Sidereal Perspective"],
    ["V", "KP System & Eastern Methods", "Sub-Lord Analysis"],
    ["VI", "Chinese Astrology \u2014 BaZi", "The Four Pillars of Destiny"],
    ["VII", "Chinese Metaphysics \u2014 Supplementary", "Feng Shui, Nine Star Ki, I Ching"],
    ["VIII", "Human Design", "Type, Strategy & Authority"],
    ["IX", "Numerology", "The Language of Numbers"],
    ["X", "Personality \u2014 MBTI", "Cognitive Function Stack"],
    ["XI", "Personality \u2014 Enneagram", "Core Motivations & Growth"],
    ["XII", "Jungian Archetypes", "The Mythic Self"],
    ["XIII", "Health Reading", "The Body-Mind Map"],
    ["XIV", "Cosmic Weather", "Space Weather & Solar Activity"],
    ["XV", "Cosmic Timing", "Transits, Returns & Progressions"],
    ["XVI", "Predictive Outlook", "Electional & Retrograde Calendar"],
    ["XVII", "Relationships & Love", "The Heart's Blueprint"],
    ["XVIII", "Career & Vocation", "The Professional Path"],
    ["XIX", "Spiritual & Karmic Path", "The Soul's Journey"],
    ["XX", "Cross-System Synthesis", "The Unified Portrait"],
  ];

  // Compact TOC — two columns for 20+ entries
  const tocColW = (CW - 6) / 2;
  const tocLeft = tocEntries.slice(0, 10);
  const tocRight = tocEntries.slice(10);
  let tocY = y;

  for (let col = 0; col < 2; col++) {
    const entries = col === 0 ? tocLeft : tocRight;
    const xOff = col === 0 ? M : M + tocColW + 6;
    let ty = tocY;
    for (const [num, title, sub] of entries) {
      doc.setFillColor(...CARD_BG);
      doc.roundedRect(xOff, ty - 3, tocColW, 19, 2, 2, "F");
      doc.setFontSize(10.5);
      doc.setFont("times", "normal");
      doc.setTextColor(...GOLD);
      doc.text(`${num}. ${title}`, xOff + 5, ty + 5);
      doc.setFontSize(8);
      doc.setFont("times", "italic");
      doc.setTextColor(...MUTED);
      doc.text(sub, xOff + 5, ty + 12);
      ty += 23;
    }
  }
  y = tocY + 23 * 10 + 4;

  // Appendix entry at bottom
  doc.setFillColor(...CARD_BG);
  doc.roundedRect(M, y - 3, CW, 15, 2, 2, "F");
  doc.setFontSize(10.5);
  doc.setFont("times", "normal");
  doc.setTextColor(...GOLD);
  doc.text("Appendix: Data Tables & Reference", M + 5, y + 6);
  y += 20;

  // =======================================================================
  // CHAPTER I: WESTERN ASTROLOGY
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "I", "Western Astrology", "The Tropical Chart");

  onProgress?.({ stage: "Writing planetary narratives...", percent: 75 });

  // --- SUN ---
  y = planetHead(y, `${sunSign} Sun at ${sunDeg}\u00b0 in the ${sunHouseFixed}${sunHouseFixed === 1 ? "st" : sunHouseFixed === 2 ? "nd" : sunHouseFixed === 3 ? "rd" : "th"} House`);
  y = poeticSub(y, sunTitle(sunSign, sunHouseFixed));

  // Sun narrative: sign + decan + house
  const sunInterp = PLANET_IN_SIGN.Sun?.[sunSign] || "";
  y = body(y, `${firstName}'s Sun at ${sunDeg}\u00b0 ${sunSign} sits ${sunHouseFixed <= 3 ? "in the angular" : sunHouseFixed <= 6 ? "deep in the" : sunHouseFixed <= 9 ? "in the expansive" : "at the peak of the"} ${sunHouseFixed}${sunHouseFixed === 1 ? "st" : sunHouseFixed === 2 ? "nd" : sunHouseFixed === 3 ? "rd" : "th"} House \u2014 the house of ${HOUSE_DOMAIN[sunHouseFixed] || "life experience"}. ${sunInterp}`);

  const decan = getDecan(sunDeg);
  const decanRuler = DECAN_RULER[sunSign]?.[decan - 1] || SIGN_RULER[sunSign];
  y = body(y, `${sunDeg}\u00b0 ${sunSign} falls in the ${decan === 1 ? "first" : decan === 2 ? "second" : "third"} decan, governed by ${decanRuler}${decanRuler !== SIGN_RULER[sunSign] ? ` through sub-rulership, adding a distinctive layer of ${SIGN_ELEMENT[Object.entries(SIGN_RULER).find(([, r]) => r === decanRuler)?.[0] || sunSign] || ""} influence` : ", reinforcing the pure expression of this sign's energy"}. This decanate colors the ${sunSign} core with ${decanRuler === "Venus" ? "aesthetic sensibility and material groundedness" : decanRuler === "Mercury" ? "intellectual sharpness and communicative flair" : decanRuler === "Mars" ? "dynamic energy and competitive drive" : decanRuler === "Jupiter" ? "philosophical breadth and optimism" : decanRuler === "Saturn" ? "structural discipline and long-term vision" : decanRuler === "Sun" ? "pure creative vitality and self-expression" : decanRuler === "Moon" ? "emotional depth and intuitive wisdom" : "innovative and unconventional energy"}.`);

  const sunHouseInterp = PLANET_IN_HOUSE.Sun?.[sunHouseFixed] || "";
  if (sunHouseInterp) y = body(y, sunHouseInterp);

  // Sun aspects
  const sunAspects = getAspectsFor("Sun").slice(0, 4);
  for (const a of sunAspects) {
    const type = (a.aspect || a.type || "").toLowerCase();
    const other = (a.planet1 === "Sun" || a.p1 === "Sun") ? (a.planet2 || a.p2) : (a.planet1 || a.p1);
    const orb = Number(a.orb ?? 0).toFixed(1);
    const tight = Number(a.orb) < 2;
    const aspectTitle = `${other} ${type} Sun (${orb}\u00b0 orb)`;
    const interp = `The ${type} between ${firstName}'s Sun and ${other} ${type === "trine" ? "creates a natural flow of energy" : type === "square" ? "creates a productive tension that demands growth" : type === "opposition" ? "creates a polarity that requires integration" : type === "conjunction" ? "fuses these energies into a single powerful force" : type === "sextile" ? "opens a channel of opportunity" : "creates a subtle but persistent dynamic"}. ${tight ? `The ${orb}\u00b0 orb makes this aspect ${Number(a.orb) < 1 ? "essentially exact \u2014 one of the defining aspects of this chart" : "highly active and personally significant"}.` : `At ${orb}\u00b0, this aspect operates as background energy \u2014 present but not dominant.`}`;
    y = sectionHead(y, aspectTitle);
    y = body(y, interp);
  }

  y = divider(y);

  // --- MOON ---
  y = planetHead(y, `${moonSign} Moon at ${moonDeg}\u00b0 in the ${moonHouseFixed}${moonHouseFixed === 1 ? "st" : moonHouseFixed === 2 ? "nd" : moonHouseFixed === 3 ? "rd" : "th"} House`);
  y = poeticSub(y, moonTitle(moonSign));

  const moonInterp = PLANET_IN_SIGN.Moon?.[moonSign] || "";
  y = body(y, `The Moon in ${moonSign} in the ${moonHouseFixed}${moonHouseFixed === 1 ? "st" : moonHouseFixed === 2 ? "nd" : moonHouseFixed === 3 ? "rd" : "th"} House of ${HOUSE_DOMAIN[moonHouseFixed] || "experience"} creates a deep emotional need for ${SIGN_ELEMENT[moonSign] === "Fire" ? "excitement, freedom, and self-expression" : SIGN_ELEMENT[moonSign] === "Earth" ? "stability, comfort, and tangible security" : SIGN_ELEMENT[moonSign] === "Air" ? "intellectual stimulation and social connection" : "emotional depth, intimacy, and creative expression"}. ${firstName} feels most alive when ${moonHouseFixed <= 3 ? "engaging directly with the immediate environment" : moonHouseFixed <= 6 ? "creating, serving, or perfecting a craft" : moonHouseFixed <= 9 ? "connecting deeply with others or exploring the unknown" : "contributing to the larger world"}. ${moonInterp}`);

  const moonHouseInterp = PLANET_IN_HOUSE.Moon?.[moonHouseFixed] || "";
  if (moonHouseInterp) y = body(y, moonHouseInterp);

  // Tightest Moon aspect as callout box
  const moonAspects = getAspectsFor("Moon").slice(0, 3);
  for (const a of moonAspects) {
    const orbVal = Number(a.orb ?? 0);
    if (orbVal > 6) continue;
    const other = (a.planet1 === "Moon" || a.p1 === "Moon") ? (a.planet2 || a.p2) : (a.planet1 || a.p1);
    const type = (a.aspect || a.type || "").toLowerCase();
    const orb = orbVal.toFixed(1);
    const tight = orbVal < 1;
    const title = `* ${aspectName(a)} \u2014 ${tight ? "Near-Exact" : "Significant"} Aspect`;
    const interp = `${firstName}'s Moon ${type}s ${other} at ${orb}\u00b0${tight ? " \u2014 essentially exact" : ""}. ${type === "trine" ? `This creates a natural harmony between the emotional world and ${other}'s domain. The connection is effortless and deeply personal.` : type === "square" ? `This creates a dynamic tension between emotional needs and ${other}'s energy. The friction is productive \u2014 it prevents emotional complacency.` : type === "opposition" ? `This creates a polarity between the inner emotional world and ${other}'s influence. Integration of these opposing forces is a lifelong creative project.` : type === "conjunction" ? `The emotional nature is completely fused with ${other}'s energy. The two cannot be separated \u2014 they operate as one.` : `This aspect provides a subtle but meaningful connection between emotional needs and ${other}'s energy.`}`;
    y = calloutBox(y, title, interp);
  }

  y = divider(y);

  // --- ASCENDANT ---
  y = planetHead(y, `${ascSign} Ascendant at ${ascDeg}\u00b0`);
  y = poeticSub(y, ascTitle(ascSign));

  y = body(y, `${ascSign} Rising is ${ascSign === "Gemini" ? "the communicator, the networker, the person who walks into any room and can talk to anyone about anything. The mind is quick, curious, and perpetually hungry for new information" : ascSign === "Aries" ? "the warrior, the first to arrive and the last to back down. The physical presence is electric, direct, and impossible to ignore" : ascSign === "Taurus" ? "the grounded presence \u2014 steady, sensual, and reassuring. Others sense stability and reliability immediately" : ascSign === "Cancer" ? "the nurturer, the protective shell that hides extraordinary emotional depth" : ascSign === "Leo" ? "the spotlight \u2014 warm, magnetic, and naturally commanding attention without effort" : ascSign === "Virgo" ? "the analyst, precise, observant, and quietly competent in every situation" : ascSign === "Libra" ? "grace personified \u2014 diplomatic, beautiful, and instinctively creating harmony" : ascSign === "Scorpio" ? "intensity itself \u2014 the gaze that sees through everything, the presence that fills a room without a word" : ascSign === "Sagittarius" ? "the adventurer, expansive, optimistic, and radiating the sense that something exciting is always about to happen" : ascSign === "Capricorn" ? "quiet authority incarnate \u2014 others instinctively sense competence, responsibility, and substance" : ascSign === "Aquarius" ? "the original \u2014 slightly unusual, intellectually magnetic, and operating on a different frequency than everyone else" : "the dreamer, soft, permeable, and carrying an otherworldly quality that draws people in mysteriously"}. ${firstName} processes the world through ${SIGN_ELEMENT[ascSign] === "Air" ? "language and ideas \u2014 if it can be named, it can be understood" : SIGN_ELEMENT[ascSign] === "Fire" ? "action and initiative \u2014 experience first, reflection later" : SIGN_ELEMENT[ascSign] === "Earth" ? "the senses \u2014 what can be touched, built, and made real" : "feeling and intuition \u2014 the invisible currents beneath every interaction"}.`);

  const ascDecan = getDecan(ascDeg);
  const ascDecanRuler = DECAN_RULER[ascSign]?.[ascDecan - 1] || SIGN_RULER[ascSign];
  y = body(y, `At ${ascDeg}\u00b0 ${ascSign}, the Ascendant falls in the ${ascDecan === 1 ? "first" : ascDecan === 2 ? "second" : "third"} decan, sub-ruled by ${ascDecanRuler}, reinforcing ${ascDecanRuler === "Uranus" ? "the technology-forward, innovative signature" : ascDecanRuler === "Mercury" ? "the intellectual and communicative qualities" : ascDecanRuler === "Venus" ? "the aesthetic and relational dimension" : `the ${ascDecanRuler} qualities`} that color this chart.`);

  // ASC aspects — use computed aspects from chart data
  const ascAspectsFinal = ascAspectsComputed.length > 0 ? ascAspectsComputed : aspects.filter((a: any) => {
    const p1 = a.planet1 || a.p1 || "";
    const p2 = a.planet2 || a.p2 || "";
    return (p1 === "Ascendant" || p1 === "ASC" || p2 === "Ascendant" || p2 === "ASC") && Number(a.orb ?? 99) < 6;
  }).sort((a: any, b: any) => Number(a.orb ?? 99) - Number(b.orb ?? 99));

  for (const a of ascAspectsFinal.slice(0, 4)) {
    const other = (a.planet1 === "Ascendant" || a.planet1 === "ASC" || a.p1 === "Ascendant" || a.p1 === "ASC") ? (a.planet2 || a.p2) : (a.planet1 || a.p1);
    const type = (a.aspect || a.type || "").toLowerCase();
    const orbVal = Number(a.orb ?? 0);
    const orb = orbVal.toFixed(1);
    const label = aspectLabel(orbVal);
    y = sectionHead(y, `ASC ${type.charAt(0).toUpperCase() + type.slice(1)} ${other} (${orb}\u00b0) \u2014 ${label}`);
    y = body(y, `The Ascendant's ${type} to ${other} means ${firstName}'s outward presentation is directly ${type === "trine" || type === "sextile" ? "enhanced" : "shaped"} by ${other}'s energy. People immediately perceive ${other === "Mercury" ? "intelligence, communication, and analytical ability" : other === "Uranus" ? "innovation, unconventionality, and technological savvy" : other === "Venus" ? "charm, beauty, and aesthetic sensitivity" : other === "Mars" ? "energy, directiveness, and physical presence" : other === "Jupiter" ? "optimism, wisdom, and generous nature" : other === "Saturn" ? "maturity, discipline, and quiet authority" : other === "Neptune" ? "creativity, dreaminess, and spiritual sensitivity" : other === "Pluto" ? "intensity, depth, and transformative power" : other === "Chiron" ? "vulnerability and healing capacity" : other === "Sun" ? "vitality and identity" : other === "Moon" ? "emotional sensitivity and care" : `${other}'s qualities`} in ${firstName}.`);
  }

  y = divider(y);

  // --- INNER PLANETS (Mercury, Venus, Mars) ---
  for (const planet of ["Mercury", "Venus", "Mars"]) {
    const info = posMap[planet];
    if (!info) continue;
    const deg = Math.round(info.degree);
    const hse = info.house || 1;
    const retro = info.retrograde ? " R" : "";
    y = planetHead(y, `${GLYPH[planet] || ""} ${info.sign} ${planet} at ${deg}\u00b0${retro} in the ${hse}${hse === 1 ? "st" : hse === 2 ? "nd" : hse === 3 ? "rd" : "th"} House`);

    const pInterp = PLANET_IN_SIGN[planet]?.[info.sign] || "";
    y = body(y, `${firstName}'s ${planet} in ${info.sign} in the ${hse}${hse === 1 ? "st" : hse === 2 ? "nd" : hse === 3 ? "rd" : "th"} House of ${HOUSE_DOMAIN[hse] || "experience"} ${info.retrograde ? "is retrograde, turning its energy inward and deepening its expression. " : ""}${pInterp}`);

    // Tightest aspect as callout
    const pAspects = getAspectsFor(planet).slice(0, 1);
    for (const a of pAspects) {
      if (Number(a.orb) > 5) continue;
      const other = (a.planet1 === planet || a.p1 === planet) ? (a.planet2 || a.p2) : (a.planet1 || a.p1);
      const type = (a.aspect || a.type || "").toLowerCase();
      const orb = Number(a.orb ?? 0).toFixed(2);
      const tight = Number(a.orb) < 1;
      y = calloutBox(y,
        `* ${GLYPH[planet] || planet} ${ASPECT_GLYPH[type] || type} ${GLYPH[other] || other} (${orb}\u00b0)${tight ? " \u2014 " + (Number(a.orb) < 0.5 ? "Essentially EXACT" : "Near-Exact") : ""}`,
        `${planet} ${type}s ${other}${tight ? " at near-exact precision" : ""}. ${type === "trine" ? `A natural gift \u2014 ${planet}'s energy flows effortlessly into ${other}'s domain.` : type === "square" ? `Productive friction \u2014 ${planet} and ${other} push each other toward growth.` : type === "opposition" ? `A polarity requiring integration \u2014 ${planet} and ${other} must learn to work as complements.` : type === "conjunction" ? `Complete fusion \u2014 ${planet} and ${other} are inseparable in ${firstName}'s experience.` : `A meaningful connection between ${planet} and ${other}.`} ${tight ? `This is one of the defining aspects of ${firstName}'s chart.` : ""}`
      );
    }
    y += 2;
  }

  y = divider(y);

  // --- OUTER PLANETS brief ---
  for (const planet of ["Jupiter", "Saturn"]) {
    const info = posMap[planet];
    if (!info) continue;
    const deg = Math.round(info.degree);
    const hse = info.house || 1;
    y = planetHead(y, `${GLYPH[planet] || ""} ${info.sign} ${planet} at ${deg}\u00b0 in the ${hse}${hse === 1 ? "st" : hse === 2 ? "nd" : hse === 3 ? "rd" : "th"} House`);
    const interp = PLANET_IN_SIGN[planet]?.[info.sign] || "";
    y = body(y, interp);
  }

  // Generational planets
  for (const planet of ["Uranus", "Neptune", "Pluto"]) {
    const info = posMap[planet];
    if (!info) continue;
    const deg = Math.round(info.degree);
    const hse = info.house || 1;
    const retro = info.retrograde ? " R" : "";
    y = sectionHead(y, `${GLYPH[planet] || ""} ${planet} in ${info.sign} (${deg}\u00b0${retro}) \u2014 ${hse}${hse === 1 ? "st" : hse === 2 ? "nd" : hse === 3 ? "rd" : "th"} House`);
    const interp = `${planet} in ${info.sign} in the ${hse}${hse === 1 ? "st" : hse === 2 ? "nd" : hse === 3 ? "rd" : "th"} House brings ${planet === "Uranus" ? "innovation and disruption" : planet === "Neptune" ? "dreams and spiritual sensitivity" : "transformation and regeneration"} to the domain of ${HOUSE_DOMAIN[hse] || "life experience"}.`;
    y = body(y, interp);
  }

  y = divider(y);

  // --- KEY PLANETARY PLACEMENTS TABLE ---
  y = sectionHead(y, "Key Planetary Placements");
  const placementRows = mainPlanets.map(p => {
    const info = posMap[p];
    if (!info) return [p, "-", "-", "-", "-"];
    const retro = info.retrograde ? " R" : "";
    return [
      `${GLYPH[p] || ""} ${p}`,
      info.sign,
      `${info.degree.toFixed(1)}\u00b0${retro}`,
      info.house ? `${info.house}` : "-",
      getPlanetSignificance(p, info.sign, info.house || 1),
    ];
  }).filter(r => r[1] !== "-");
  y = styledTable(y, ["Planet", "Sign", "Degree", "House", "Significance"], placementRows);

  y = divider(y);

  // --- MAJOR ASPECTS — The Neural Network ---
  y = sectionHead(y, "Major Aspects \u2014 The Neural Network");
  const exactCount = aspects.filter((a: any) => Number(a.orb ?? 99) <= 1).length;
  y = body(y, `The aspects between planets form the neural network of the chart \u2014 the wiring that determines how energies communicate. ${firstName}'s chart features ${exactCount} exact or near-exact aspects that define the core nature.`);

  // Include ASC aspects alongside planetary aspects
  const allAspects = [...aspects, ...ascAspectsComputed]
    .filter((a: any) => Number(a.orb ?? 99) <= 5)
    .sort((a: any, b: any) => Number(a.orb ?? 99) - Number(b.orb ?? 99))
    .slice(0, 12);

  for (const a of allAspects) {
    const type = (a.aspect || a.type || "").toLowerCase();
    const p1 = a.planet1 || a.p1 || "";
    const p2 = a.planet2 || a.p2 || "";
    const orbVal = Number(a.orb ?? 0);
    const orb = orbVal.toFixed(2);
    const label = aspectLabel(orbVal);
    const title = `${GLYPH[p1] || p1} ${ASPECT_GLYPH[type] || type} ${GLYPH[p2] || p2} (${orb}\u00b0) \u2014 ${label}`;
    const meaning = `${p1} ${type}s ${p2}. ${orbVal <= 0.5 ? "This is essentially exact \u2014 one of the most powerful configurations in the entire chart. " : orbVal <= 1.0 ? "Near-exact precision makes this a defining aspect. " : ""}${type === "trine" ? `Natural talent flows between ${p1} and ${p2}.` : type === "square" ? `Productive tension between ${p1} and ${p2} drives growth and development.` : type === "opposition" ? `A polarity axis between ${p1} and ${p2} requires conscious integration.` : type === "conjunction" ? `${p1} and ${p2} are fused into a single force.` : `${p1} and ${p2} are linked through ${type} aspect.`}`;
    if (orbVal <= 1.0) {
      y = calloutBox(y, `* ${title}`, meaning);
    } else {
      y = sectionHead(y, title);
      y = body(y, meaning);
    }
  }

  // --- DIGNITIES ---
  y = divider(y);
  y = sectionHead(y, "Dignities and Debilities");
  y = body(y, `A planet's dignity \u2014 its strength by sign placement \u2014 dramatically affects how it expresses. ${firstName}'s chart contains:`);

  // Check for exaltations/domicile
  const exaltations: Record<string, string> = { Sun: "Aries", Moon: "Taurus", Mercury: "Virgo", Venus: "Pisces", Mars: "Capricorn", Jupiter: "Cancer", Saturn: "Libra" };
  const domiciles: Record<string, string[]> = { Sun: ["Leo"], Moon: ["Cancer"], Mercury: ["Gemini", "Virgo"], Venus: ["Taurus", "Libra"], Mars: ["Aries", "Scorpio"], Jupiter: ["Sagittarius", "Pisces"], Saturn: ["Capricorn", "Aquarius"], Uranus: ["Aquarius"], Neptune: ["Pisces"], Pluto: ["Scorpio"] };

  for (const p of mainPlanets) {
    const info = posMap[p];
    if (!info) continue;
    let dignity = "";
    if (exaltations[p] === info.sign) dignity = "Exalted";
    else if (domiciles[p]?.includes(info.sign)) dignity = "Domicile";
    if (dignity) {
      y = bullet(y, `${p} in ${info.sign} (${dignity}) \u2014 ${dignity === "Exalted" ? `${p} reaches its peak expression in ${info.sign}. This is ${p}'s highest power \u2014 operating at maximum effectiveness.` : `${p} in its own sign operates with full natural authority. Comfortable, powerful, and unconstrained.`}`);
    }
  }

  // --- CHART PATTERNS ---
  const chartPatterns = detectPatterns();
  if (chartPatterns.length > 0) {
    y = divider(y);
    y = sectionHead(y, "Chart Patterns");
    for (const pat of chartPatterns) {
      y = calloutBox(y, "* Pattern Detected", pat);
    }
  }

  // --- ELEMENT & MODALITY INTERPRETATION ---
  y = divider(y);
  y = sectionHead(y, "Element & Modality Balance");
  for (const elem of ["Fire", "Earth", "Air", "Water"] as const) {
    const cnt = elemCount[elem];
    y = bullet(y, `${elem}: ${cnt} planet${cnt !== 1 ? "s" : ""}`);
  }
  const highElem = Object.entries(elemCount).sort((a, b) => b[1] - a[1])[0];
  const lowElem = Object.entries(elemCount).sort((a, b) => a[1] - b[1])[0];
  if (highElem && highElem[1] >= 3) {
    y = body(y, `With ${highElem[1]} planets in ${highElem[0]}, ${ELEMENT_EXCESS[highElem[0]] || ""}`);
  }
  if (lowElem && lowElem[1] === 0) {
    y = body(y, `${ELEMENT_LACK[lowElem[0]] || ""}`);
  }

  // --- RETROGRADE ANALYSIS ---
  if (retrogradePlanets.length > 0) {
    y = divider(y);
    y = sectionHead(y, "Retrograde Analysis");
    const personalRetros = retrogradePlanets.filter(p => ["Mercury", "Venus", "Mars"].includes(p));
    const outerRetros = retrogradePlanets.filter(p => ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"].includes(p));
    y = body(y, `${firstName}'s chart contains ${retrogradePlanets.length} retrograde planet${retrogradePlanets.length !== 1 ? "s" : ""}: ${retrogradePlanets.join(", ")}. ${personalRetros.length > 0 ? `The personal planet retrograde${personalRetros.length > 1 ? "s" : ""} (${personalRetros.join(", ")}) turn${personalRetros.length === 1 ? "s" : ""} that planet's energy inward, creating a more reflective and internalized expression. ` : ""}${outerRetros.length > 0 ? `The outer planet retrograde${outerRetros.length > 1 ? "s" : ""} (${outerRetros.join(", ")}) are generational, affecting the entire birth cohort and turning transformative energies inward for deeper processing.` : ""}`);
    for (const rp of personalRetros) {
      const info = posMap[rp];
      if (!info) continue;
      y = bullet(y, `${rp} retrograde in ${info.sign}: ${rp === "Mercury" ? "Communication and thought processes are more internal; ideas are refined before being shared. Past lessons in communication resurface for mastery." : rp === "Venus" ? "Love and values are deeply internalized. Relationships require authentic connection rather than surface attraction. May revisit past relationships." : "Drive and assertion are channeled inward. Actions are more deliberate and strategic. Physical energy may be cyclic."}`);
    }
  }

  // LLM synthesis for Chapter I
  onProgress?.({ stage: "AI analyzing Western chart...", percent: 75 });
  const topAspStr = allAspects.slice(0, 5).map((a: any) => `${a.planet1 || a.p1} ${(a.aspect || a.type || "").toLowerCase()} ${a.planet2 || a.p2} (${Number(a.orb ?? 0).toFixed(1)})`).join(", ");
  const patStr = chartPatterns.join("; ") || "none detected";
  const llmCh1 = await llmGenerate(
    `Write a 500-word synthesis of ${firstName}'s Western natal chart. Sun: ${sunSign} at ${sunDeg} in H${sunHouseFixed}. Moon: ${moonSign} at ${moonDeg} in H${moonHouseFixed}. ASC: ${ascSign} at ${ascDeg}. Tightest aspects: ${topAspStr}. Chart patterns: ${patStr}. Retrogrades: ${retrogradePlanets.join(", ") || "none"}. Weave placements into a unified identity portrait showing how Sun, Moon, and Ascendant work together. Reference specific degrees and house meanings.`,
    JSON.stringify({ sun: `${sunSign} ${sunDeg} H${sunHouseFixed}`, moon: `${moonSign} ${moonDeg} H${moonHouseFixed}`, asc: `${ascSign} ${ascDeg}`, aspects: topAspStr, patterns: patStr, retrogrades: retrogradePlanets, elements: elemCount })
  );
  if (llmCh1) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch1Lines = doc.splitTextToSize(llmCh1, CW);
    for (const ln of ch1Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER II: HELLENISTIC & CLASSICAL TECHNIQUES
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "II", "Hellenistic & Classical Techniques", "The Ancient Foundations");

  onProgress?.({ stage: "Writing Hellenistic analysis...", percent: 76 });

  // --- Sect Analysis ---
  if (sect) {
    const secData = sect.data ?? sect;
    y = sectionHead(y, "Sect Analysis");
    const sectType = secData.sect || (secData.is_day_chart ? "Day" : "Night");
    const sectLight = sectType === "Day" || sectType === "day" ? "Sun" : "Moon";
    y = body(y, `This is a ${sectType} chart. The sect light is the ${sectLight}, meaning ${sectLight === "Sun" ? `the solar principle \u2014 visibility, action, and conscious intention \u2014 is the dominant force in ${firstName}'s life. Day charts tend toward extroversion, directness, and a preference for operating in the open` : `the lunar principle \u2014 intuition, reflection, and emotional intelligence \u2014 is the dominant force in ${firstName}'s life. Night charts tend toward introversion, depth, and a preference for working behind the scenes`}.`);
    if (secData.benefic_of_sect || secData.benefic) {
      y = body(y, `The benefic of sect is ${secData.benefic_of_sect || secData.benefic} \u2014 this planet works most easily and helpfully for ${firstName}. The malefic of sect (${secData.malefic_of_sect || secData.malefic || "the challenging planet"}) requires more conscious navigation but ultimately builds strength through challenge.`);
    }
    if (secData.benefic_contrary || secData.out_of_sect_benefic) {
      y = calloutBox(y, "Sect Dynamics", `Benefic of sect: ${secData.benefic_of_sect || secData.benefic || "N/A"}. Malefic of sect: ${secData.malefic_of_sect || secData.malefic || "N/A"}. Out-of-sect benefic: ${secData.benefic_contrary || secData.out_of_sect_benefic || "N/A"}. Out-of-sect malefic: ${secData.malefic_contrary || secData.out_of_sect_malefic || "N/A"}.`);
    }
  }

  // --- Annual Profection ---
  if (profection) {
    const pfData = profection.data ?? profection;
    y = sectionHead(y, "Annual Profection");
    const profSign = pfData.profected_sign || pfData.sign || "";
    const profLord = pfData.lord_of_year || pfData.time_lord || "";
    const profAge = pfData.age || (new Date().getFullYear() - parseInt(profile.birthDate.split("-")[0]));
    y = body(y, `At age ${profAge}, ${firstName}'s annual profection has advanced to ${profSign}${profLord ? `, activating ${profLord} as the Lord of the Year` : ""}. Annual profections assign a sign and its ruler to each year of life, creating a 12-year cycle of thematic emphasis. This year's profected sign highlights the domain of ${profSign ? HOUSE_DOMAIN[Object.keys(SIGN_RULER).indexOf(profSign) % 12 + 1] || "life experience" : "the activated house"}.`);
    if (profLord) {
      const lordInfo = posMap[profLord];
      if (lordInfo) {
        y = body(y, `The Lord of the Year, ${profLord}, sits in ${lordInfo.sign} in the ${lordInfo.house}${lordInfo.house === 1 ? "st" : lordInfo.house === 2 ? "nd" : lordInfo.house === 3 ? "rd" : "th"} House natally. Its condition \u2014 sign dignity, house placement, and aspects \u2014 colors the entire year. ${lordInfo.retrograde ? `${profLord} is retrograde, suggesting this year's themes involve revisiting, revising, or completing unfinished business.` : `${profLord} is direct, supporting forward momentum in this year's themes.`}`);
      }
    }
  }

  // --- Almuten ---
  if (almuten) {
    const alData = almuten.data ?? almuten;
    const alRuler = alData.almuten || alData.chart_ruler || alData.almuten_figuris;
    if (alRuler) {
      y = sectionHead(y, `Almuten Figuris: ${typeof alRuler === "string" ? alRuler : alRuler.planet || ""}`);
      y = body(y, `The Almuten Figuris \u2014 the planet with the greatest essential dignity across five key chart points (Sun, Moon, Ascendant, Part of Fortune, prenatal syzygy) \u2014 is ${typeof alRuler === "string" ? alRuler : alRuler.planet || "unknown"}. This is the true chart ruler in the medieval tradition, representing the planet with the most comprehensive authority over the native's life.`);
    }
  }

  y = divider(y);

  // --- Sabian Symbols ---
  if (sabianSymbols) {
    const sbData = sabianSymbols.data ?? sabianSymbols;
    const symbols = sbData.symbols || sbData;
    y = sectionHead(y, "Sabian Symbols");
    y = body(y, `Sabian Symbols assign a poetic image to each of the 360 degrees of the zodiac. The symbols for ${firstName}'s key placements reveal hidden dimensions of meaning.`);

    const keyPoints = ["Sun", "Moon", "Ascendant", "Mercury", "Venus", "Mars"];
    for (const point of keyPoints) {
      const sym = typeof symbols === "object" ? (symbols[point] || symbols[point.toLowerCase()]) : null;
      if (sym) {
        const degree = typeof sym === "object" ? (sym.degree || sym.sabian_degree || "") : "";
        const symbol = typeof sym === "object" ? (sym.symbol || sym.sabian_symbol || sym.description || JSON.stringify(sym)) : String(sym);
        y = calloutBox(y, `${GLYPH[point] || point} ${point} ${degree ? `at ${degree}\u00b0` : ""}`, symbol);
      }
    }
  }

  y = divider(y);

  // --- Arabic Parts ---
  if (arabicParts) {
    const apData = arabicParts.data ?? arabicParts;
    const parts = apData.parts || apData.arabic_parts || apData.lots || [];
    y = sectionHead(y, "Arabic Parts (Lots)");
    y = body(y, `Arabic Parts are sensitive points calculated from three chart factors. They reveal hidden dimensions of fate and fortune that the planets alone cannot show.`);

    if (Array.isArray(parts) && parts.length > 0) {
      const apRows: string[][] = [];
      for (const p of parts.slice(0, 12)) {
        apRows.push([
          p.name || p.part || "-",
          p.sign || "-",
          p.degree != null ? `${Number(p.degree).toFixed(1)}\u00b0` : "-",
          p.house ? String(p.house) : "-",
        ]);
      }
      y = styledTable(y, ["Part/Lot", "Sign", "Degree", "House"], apRows);
    } else if (typeof parts === "object" && !Array.isArray(parts)) {
      const apRows: string[][] = [];
      for (const [name, info] of Object.entries(parts)) {
        const pd = info as any;
        apRows.push([name, pd.sign || "-", pd.degree != null ? `${Number(pd.degree).toFixed(1)}\u00b0` : "-", pd.house ? String(pd.house) : "-"]);
      }
      if (apRows.length > 0) y = styledTable(y, ["Part/Lot", "Sign", "Degree", "House"], apRows);
    }
  }

  // --- Fixed Stars ---
  if (fixedStars) {
    const fsData = fixedStars.data ?? fixedStars;
    const stars = fsData.stars || fsData.conjunctions || fsData.fixed_stars || [];
    if ((Array.isArray(stars) && stars.length > 0) || (typeof stars === "object" && Object.keys(stars).length > 0)) {
      y = sectionHead(y, "Fixed Star Conjunctions");
      y = body(y, `Fixed stars add a layer of mythic potency to natal placements. When a planet or angle conjoins a bright star, it takes on that star's nature.`);

      const starList = Array.isArray(stars) ? stars : Object.entries(stars).map(([k, v]) => ({ ...(v as any), planet: k }));
      for (const star of starList.slice(0, 8)) {
        const sName = star.star || star.name || star.fixed_star || "";
        const planet = star.planet || star.conjunct_planet || "";
        const nature = star.nature || star.meaning || star.interpretation || "";
        if (sName) {
          y = bullet(y, `${sName}${planet ? ` conjunct ${planet}` : ""}: ${nature || "A significant stellar influence adding mythic resonance to this placement."}`);
        }
      }
    }
  }

  // --- Dignities Table ---
  if (dignities) {
    const dgData = dignities.data ?? dignities;
    const dgTable = dgData.dignity_table || dgData.dignities || dgData.planets || {};
    y = sectionHead(y, "Essential Dignities Breakdown");

    if (typeof dgTable === "object" && Object.keys(dgTable).length > 0) {
      const dgRows: string[][] = [];
      for (const [planet, info] of Object.entries(dgTable)) {
        const pd = info as any;
        // Handle nested structure: dignity_table.Sun.essential.dignities
        const ess = pd.essential || pd;
        const digs = ess.dignities || ess;
        const domicile = digs.domicile || pd.domicile || pd.rulership;
        const exalt = digs.exaltation || pd.exaltation;
        const detri = digs.detriment || pd.detriment;
        const fall = digs.fall || pd.fall;
        const score = pd.score ?? pd.total_score ?? ess.score ?? ess.total_score ?? digs.score;
        dgRows.push([
          planet,
          domicile ? "Yes" : "-",
          exalt ? "Yes" : "-",
          detri ? "Yes" : "-",
          fall ? "Yes" : "-",
          score != null ? String(score) : "-",
        ]);
      }
      if (dgRows.length > 0) {
        y = styledTable(y, ["Planet", "Domicile", "Exaltation", "Detriment", "Fall", "Score"], dgRows);
      }
    }
  }

  // LLM synthesis for Chapter II
  onProgress?.({ stage: "AI analyzing Hellenistic techniques...", percent: 77 });
  const sectStr = sect ? `${(sect.data ?? sect).sect || ((sect.data ?? sect).is_day_chart ? "Day" : "Night")} chart` : "unknown";
  const profStr = profection ? `Age ${(profection.data ?? profection).age || "?"}, sign ${(profection.data ?? profection).profected_sign || "?"}, lord ${(profection.data ?? profection).lord_of_year || "?"}` : "unavailable";
  const almStr = almuten ? `${(almuten.data ?? almuten).almuten || (almuten.data ?? almuten).chart_ruler || "?"}` : "unknown";
  const llmCh2 = await llmGenerate(
    `Write a 300-word analysis of ${firstName}'s Hellenistic chart features. Sect: ${sectStr}. Annual profection: ${profStr}. Almuten: ${almStr}. Synthesize what these ancient techniques reveal about the life direction this year. Reference specific placements.`,
    JSON.stringify({ sect: sectStr, profection: profStr, almuten: almStr })
  );
  if (llmCh2) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch2Lines = doc.splitTextToSize(llmCh2, CW);
    for (const ln of ch2Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER III: ADVANCED WESTERN SYSTEMS
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "III", "Advanced Western Systems", "Draconic, Harmonics & Beyond");

  onProgress?.({ stage: "Writing advanced systems...", percent: 78 });

  // --- Draconic Chart ---
  y = sectionHead(y, "Draconic Chart \u2014 The Soul's Blueprint");
  y = body(y, `The draconic chart is calculated by subtracting the North Node from all positions, effectively setting 0\u00b0 Aries at the North Node. This reveals the soul's blueprint \u2014 the chart beneath the chart \u2014 showing who ${firstName} is at the deepest karmic level, independent of earthly conditioning.`);

  if (draconic) {
    const drData = draconic.data ?? draconic;
    const drPos = drData.positions || drData.planets || {};
    if (Object.keys(drPos).length > 0) {
      const drRows: string[][] = [];
      for (const [planet, info] of Object.entries(drPos)) {
        const pd = info as any;
        drRows.push([planet, pd.sign || "-", pd.degree != null ? `${Number(pd.degree).toFixed(1)}\u00b0` : "-"]);
      }
      y = styledTable(y, ["Planet", "Draconic Sign", "Degree"], drRows.slice(0, 10));

      // Compare Sun sign
      const drSun = (drPos as any).Sun || (drPos as any).sun;
      const drSunSign = drSun?.sign;
      if (drSunSign && drSunSign !== sunSign) {
        y = calloutBox(y, `Draconic Sun in ${drSunSign}`, `While ${firstName}'s tropical Sun is in ${sunSign}, the draconic Sun sits in ${drSunSign}. This means the soul's core identity \u2014 before earthly conditioning \u2014 resonates with ${drSunSign} energy: ${PLANET_IN_SIGN.Sun?.[drSunSign] || "a distinct expression of the solar principle"}`);
      }
    }
  } else {
    y = body(y, `Draconic chart data was not available. The draconic chart typically reveals the soul's pre-incarnation blueprint by resetting the zodiac to the North Node axis.`);
  }

  y = divider(y);

  // --- Harmonics ---
  if (harmonics) {
    const hData = harmonics.data ?? harmonics;
    y = sectionHead(y, "Harmonic Chart Analysis");
    y = body(y, `Harmonic charts multiply all planetary positions by a number, revealing hidden patterns of creative expression (5th harmonic), spiritual development (7th), karma (9th), and other dimensions.`);

    const hPositions = hData.positions || hData.harmonic_positions || {};
    const hSeries = hData.harmonic || hData.harmonic_number || 7;
    if (Object.keys(hPositions).length > 0) {
      y = sectionHead(y, `${hSeries}th Harmonic Chart`);
      const hRows: string[][] = [];
      for (const [planet, info] of Object.entries(hPositions)) {
        const pd = info as any;
        hRows.push([planet, pd.sign || "-", pd.degree != null ? `${Number(pd.degree).toFixed(1)}\u00b0` : "-"]);
      }
      y = styledTable(y, ["Planet", `H${hSeries} Sign`, "Degree"], hRows.slice(0, 10));
    }

    if (hData.interpretation || hData.summary) {
      y = body(y, typeof (hData.interpretation || hData.summary) === "string" ? (hData.interpretation || hData.summary) : "");
    }
  }

  y = divider(y);

  // --- Midpoints ---
  if (midpoints) {
    const mpData = midpoints.data ?? midpoints;
    const mpTree = mpData.midpoints || mpData.midpoint_tree || mpData;
    y = sectionHead(y, "Midpoint Analysis");
    y = body(y, `Midpoints \u2014 the halfway point between two planets \u2014 reveal latent potentials activated when transited. The Sun/Moon midpoint is especially significant as it represents the core of personal integration.`);

    if (typeof mpTree === "object") {
      const mpEntries = Array.isArray(mpTree) ? mpTree : Object.entries(mpTree).map(([k, v]) => ({ pair: k, ...(typeof v === "object" ? (v as any) : { degree: v }) }));
      const importantPairs = ["Sun/Moon", "Sun/MC", "Moon/Asc", "Venus/Mars", "Jupiter/Saturn"];
      const filteredMps = mpEntries.filter((m: any) => {
        const pair = m.pair || m.planets || "";
        return importantPairs.some(ip => pair.includes(ip.split("/")[0]) && pair.includes(ip.split("/")[1]));
      }).slice(0, 6);

      if (filteredMps.length > 0) {
        const mpRows: string[][] = [];
        for (const mp of filteredMps) {
          mpRows.push([
            mp.pair || mp.planets || "-",
            mp.sign || "-",
            mp.degree != null ? `${Number(mp.degree).toFixed(1)}\u00b0` : "-",
            mp.interpretation || mp.meaning || "-",
          ]);
        }
        y = styledTable(y, ["Midpoint", "Sign", "Degree", "Meaning"], mpRows);
      }

      // Sun/Moon midpoint callout
      const sunMoonMp = mpEntries.find((m: any) => {
        const pair = m.pair || m.planets || "";
        return pair.includes("Sun") && pair.includes("Moon");
      });
      if (sunMoonMp) {
        y = calloutBox(y, "* Sun/Moon Midpoint", `The Sun/Moon midpoint \u2014 the core integration point of conscious identity and emotional nature \u2014 falls at ${sunMoonMp.degree != null ? `${Number(sunMoonMp.degree).toFixed(1)}\u00b0` : ""} ${sunMoonMp.sign || ""}. ${sunMoonMp.interpretation || `This is the most personal point in the chart. Any planet or transit contacting this degree activates the deepest integration of who ${firstName} is.`}`);
      }
    }
  }

  y = divider(y);

  // --- Declinations ---
  if (declinations) {
    const dcData = declinations.data ?? declinations;
    const parallels = dcData.parallels || dcData.declination_aspects || [];
    y = sectionHead(y, "Declinations & Parallels");
    y = body(y, `Declinations measure how far north or south a planet sits from the celestial equator. Parallels (same declination) act like conjunctions; contraparallels (opposite declination) act like oppositions \u2014 but operating on a hidden dimension most astrologers overlook.`);

    if (Array.isArray(parallels) && parallels.length > 0) {
      const dcRows: string[][] = [];
      for (const p of parallels.slice(0, 8)) {
        dcRows.push([
          p.planet1 || p.p1 || "-",
          p.planet2 || p.p2 || "-",
          p.type || p.aspect || "-",
          p.declination1 != null ? `${Number(p.declination1).toFixed(2)}\u00b0` : "-",
        ]);
      }
      y = styledTable(y, ["Planet 1", "Planet 2", "Type", "Declination"], dcRows);
    } else {
      const decTable = dcData.declinations || dcData.planets || {};
      if (typeof decTable === "object" && Object.keys(decTable).length > 0) {
        const dcRows: string[][] = [];
        for (const [planet, info] of Object.entries(decTable)) {
          const pd = info as any;
          dcRows.push([planet, pd.declination != null ? `${Number(pd.declination).toFixed(2)}\u00b0` : pd.value != null ? `${Number(pd.value).toFixed(2)}\u00b0` : typeof pd === "number" ? `${pd.toFixed(2)}\u00b0` : "-"]);
        }
        y = styledTable(y, ["Planet", "Declination"], dcRows);
      }
    }
  }

  // --- Asteroids ---
  if (asteroids) {
    const asData = asteroids.data ?? asteroids;
    const astPositions = asData.positions || asData.asteroids || asData;
    y = sectionHead(y, "Asteroid Positions");
    y = body(y, `The four major asteroids \u2014 Ceres (nurturing), Pallas (wisdom/strategy), Juno (commitment/partnership), and Vesta (devotion/sacred work) \u2014 add nuance to the feminine and relational dimensions of the chart.`);

    if (typeof astPositions === "object" && Object.keys(astPositions).length > 0) {
      const astRows: string[][] = [];
      for (const [name, info] of Object.entries(astPositions)) {
        const pd = info as any;
        astRows.push([name, pd.sign || "-", pd.degree != null ? `${Number(pd.degree).toFixed(1)}\u00b0` : "-", pd.house ? String(pd.house) : "-"]);
      }
      y = styledTable(y, ["Asteroid", "Sign", "Degree", "House"], astRows.slice(0, 8));
    }
  }

  // --- Degree Theory ---
  if (degreeTheory) {
    const dtData = degreeTheory.data ?? degreeTheory;
    const critical = dtData.critical_degrees || dtData.degrees || [];
    if ((Array.isArray(critical) && critical.length > 0) || (typeof critical === "object" && Object.keys(critical).length > 0)) {
      y = sectionHead(y, "Critical Degrees");
      y = body(y, `Certain degrees carry special potency in the zodiac. Planets placed at critical degrees operate with heightened intensity.`);
      const degList = Array.isArray(critical) ? critical : Object.entries(critical).map(([k, v]) => ({ planet: k, ...(typeof v === "object" ? (v as any) : { degree: v }) }));
      for (const d of degList.slice(0, 6)) {
        const planet = d.planet || "";
        const deg = d.degree != null ? Number(d.degree).toFixed(0) : "";
        const meaning = d.interpretation || d.meaning || d.nature || "A degree of heightened potency.";
        if (planet) y = bullet(y, `${planet} at ${deg}\u00b0: ${meaning}`);
      }
    }
  }

  // LLM synthesis for Chapter III
  onProgress?.({ stage: "AI analyzing advanced systems...", percent: 79 });
  const drSunStr = draconic ? `${((draconic.data ?? draconic).positions?.Sun || (draconic.data ?? draconic).positions?.sun)?.sign || "?"}` : "unavailable";
  const llmCh3 = await llmGenerate(
    `Write a 300-word analysis of ${firstName}'s advanced chart features. Draconic Sun: ${drSunStr} (tropical Sun: ${sunSign}). Comment on what these advanced layers -- draconic chart, harmonics, midpoints, fixed star conjunctions, declinations -- add to the basic natal picture. How does the soul's blueprint (draconic) compare to the personality (tropical)?`,
    JSON.stringify({ draconic_sun: drSunStr, tropical_sun: sunSign, has_harmonics: !!harmonics, has_midpoints: !!midpoints, has_fixedStars: !!fixedStars, has_declinations: !!declinations })
  );
  if (llmCh3) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch3Lines = doc.splitTextToSize(llmCh3, CW);
    for (const ln of ch3Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER IV: VEDIC ASTROLOGY
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "IV", "Vedic Astrology (Jyotish)", "The Sidereal Perspective");

  onProgress?.({ stage: "Writing Vedic analysis...", percent: 79 });

  if (vedic) {
    const vData = vedic.data ?? vedic;
    const vPositions = vData.positions || vData.planets || {};
    const vSun = vPositions.Sun || vPositions.sun;
    const vMoon = vPositions.Moon || vPositions.moon;
    const vSunSign = (vSun as any)?.sign || (vSun as any)?.rashi;
    const vMoonSign = (vMoon as any)?.sign || (vMoon as any)?.rashi;
    const nakshatra = (vMoon as any)?.nakshatra;
    const pada = (vMoon as any)?.pada;

    y = planetHead(y, `${vSunSign || sunSign} Sun \u00b7 ${vMoonSign || moonSign} Moon${nakshatra ? ` \u00b7 ${nakshatra} Nakshatra` : ""}`);

    y = body(y, `In the sidereal zodiac \u2014 which accounts for the precession of the equinoxes and shifts all placements approximately 23\u00b0 backward from tropical positions \u2014 ${firstName}'s chart reveals ${vSunSign === vMoonSign ? `a powerful double ${vSunSign} configuration, intensifying every quality of this sign` : `a ${vSunSign || "sidereal"} Sun and ${vMoonSign || "sidereal"} Moon combination that adds depth to the tropical reading`}.`);

    if (Object.keys(vPositions).length > 0) {
      y = sectionHead(y, "Sidereal Positions");
      const vRows: string[][] = [];
      for (const [planet, info] of Object.entries(vPositions)) {
        const pd = info as any;
        vRows.push([planet, pd.sign || pd.rashi || "-", pd.degree != null ? `${Number(pd.degree).toFixed(1)}\u00b0` : "-", pd.nakshatra || "-"]);
      }
      y = styledTable(y, ["Planet", "Rashi", "Degree", "Nakshatra"], vRows);
    }

    if (nakshatra) {
      y = sectionHead(y, `${nakshatra} Nakshatra`);
      y = body(y, `${firstName}'s Moon nakshatra \u2014 the lunar mansion \u2014 is ${nakshatra}${pada ? ` (Pada ${pada})` : ""}. In Vedic astrology, the Moon's nakshatra is one of the most important indicators of personality, emotional temperament, and destiny.`);
    }

    if (vData.ayanamsa != null) {
      y = mutedItalic(y, `Ayanamsa: ${Number(vData.ayanamsa).toFixed(4)}\u00b0`);
    }
  } else {
    y = body(y, "Vedic chart data was not available for this profile. The sidereal zodiac typically shifts placements approximately 23\u00b0 earlier than their tropical positions, revealing complementary karmic dimensions.");
  }

  // --- Vimshottari Dasha ---
  if (vimshottari) {
    const vdData = vimshottari.data ?? vimshottari;
    y = sectionHead(y, "Vimshottari Dasha Periods");
    y = body(y, `The Vimshottari dasha system divides life into planetary periods of varying length, based on the Moon's nakshatra at birth. Each period activates that planet's natal promise, coloring entire decades of life with its themes.`);

    const dashas = vdData.dashas || vdData.periods || vdData.maha_dasha || [];
    if (Array.isArray(dashas) && dashas.length > 0) {
      const dsRows: string[][] = [];
      for (const d of dashas.slice(0, 12)) {
        dsRows.push([
          d.planet || d.lord || "-",
          d.start_date || d.start || "-",
          d.end_date || d.end || "-",
          d.level || d.type || "Maha Dasha",
        ]);
      }
      y = styledTable(y, ["Planet", "Start", "End", "Level"], dsRows);
    }

    const currentDasha = vdData.current_dasha || vdData.current;
    if (currentDasha) {
      const cdPlanet = currentDasha.planet || currentDasha.lord || currentDasha.maha || "";
      y = calloutBox(y, `* Current Dasha: ${cdPlanet}`, `${firstName} is currently running the ${cdPlanet} period${currentDasha.antardasha ? ` / ${currentDasha.antardasha} sub-period` : ""}. ${cdPlanet === "Saturn" ? "This is a period of discipline, responsibility, and karmic reckoning. Hard work pays off, but shortcuts are punished." : cdPlanet === "Jupiter" ? "This is a period of expansion, wisdom, and good fortune. Growth comes through teaching, learning, and philosophical exploration." : cdPlanet === "Mars" ? "This is a period of energy, initiative, and action. Courage and decisiveness are required." : cdPlanet === "Venus" ? "This is a period of beauty, relationships, and material comfort. Art, love, and luxury feature prominently." : cdPlanet === "Mercury" ? "This is a period of communication, intellect, and commerce. Business, study, and connection thrive." : cdPlanet === "Moon" ? "This is a period of emotional depth, nurturing, and inner development. Home and family become central." : cdPlanet === "Sun" ? "This is a period of identity, authority, and personal power. Leadership and self-expression take center stage." : cdPlanet === "Rahu" ? "This is a period of worldly ambition, unconventional pursuits, and karmic acceleration. Desires are amplified." : cdPlanet === "Ketu" ? "This is a period of spiritual deepening, letting go, and moksha. Material detachment accelerates inner growth." : `This period activates the natal promise of ${cdPlanet} across all areas of life.`}`);
    }
  }

  // LLM-enhanced Vedic synthesis
  const vDataLlm = vedic?.data ?? vedic;
  const vSunSignLlm = (vDataLlm?.positions?.Sun || vDataLlm?.positions?.sun)?.sign || "";
  const vNakshatra = (vDataLlm?.positions?.Moon || vDataLlm?.positions?.moon)?.nakshatra || "";
  const vPada = (vDataLlm?.positions?.Moon || vDataLlm?.positions?.moon)?.pada || "";
  const currentDashaLlm = (vimshottari?.data ?? vimshottari)?.current_dasha || (vimshottari?.data ?? vimshottari)?.current;
  const llmVedicCtx = `Tropical Sun: ${sunSign} H${sunHouseFixed}, Sidereal Sun: ${vSunSignLlm || "unknown"}, Nakshatra: ${vNakshatra || "unknown"}, Pada: ${vPada || "?"}, Current dasha: ${currentDashaLlm?.planet || currentDashaLlm?.lord || "unknown"}`;
  const llmVedic = await llmGenerate(`Write a 400-word Vedic astrology synthesis for ${firstName}. Cover the tropical-to-sidereal shift, nakshatra significance, and current Vimshottari dasha period implications.`, llmVedicCtx);
  if (llmVedic) {
    y = divider(y);
    y = sectionHead(y, "Vedic Synthesis");
    const vedicLines = doc.splitTextToSize(llmVedic, CW);
    for (const line of vedicLines) { y = body(y, line); }
  }

  // =======================================================================
  // CHAPTER V: KP SYSTEM & EASTERN METHODS
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "V", "KP System & Eastern Methods", "Sub-Lord Analysis");

  // --- KP System ---
  if (kpSystem) {
    const kpData = kpSystem.data ?? kpSystem;
    y = sectionHead(y, "Krishnamurti Paddhati (KP) System");
    y = body(y, `The KP system refines Vedic astrology by dividing each nakshatra into sub-divisions ruled by different planets (sub-lords). The sub-lord, rather than the sign lord, is considered the decisive factor in determining outcomes.`);

    const sublords = kpData.sublords || kpData.sub_lords || kpData.cusps || {};
    if (typeof sublords === "object" && Object.keys(sublords).length > 0) {
      const kpRows: string[][] = [];
      for (const [cusp, info] of Object.entries(sublords)) {
        const pd = info as any;
        kpRows.push([cusp, pd.sign || "-", pd.star_lord || pd.nakshatra_lord || "-", pd.sub_lord || pd.sub || "-"]);
      }
      if (kpRows.length > 0) {
        y = styledTable(y, ["Cusp/Planet", "Sign", "Star Lord", "Sub Lord"], kpRows.slice(0, 12));
      }
    }

    if (kpData.significators || kpData.ruling_planets) {
      const sig = kpData.significators || kpData.ruling_planets;
      y = sectionHead(y, "KP Ruling Planets");
      if (typeof sig === "object") {
        for (const [house, planets] of Object.entries(sig)) {
          const pList = Array.isArray(planets) ? (planets as string[]).join(", ") : String(planets);
          y = bullet(y, `House ${house}: ${pList}`);
        }
      }
    }
  } else {
    y = body(y, `The KP (Krishnamurti Paddhati) system data was not available. This system refines Vedic predictions through sub-lord analysis, offering greater precision in timing and event prediction.`);
  }

  y = divider(y);

  // --- Zi Wei Dou Shu ---
  y = sectionHead(y, "Zi Wei Dou Shu (Purple Star Astrology)");
  if (ziwei) {
    const zwData = ziwei.data ?? ziwei;
    y = body(y, `Zi Wei Dou Shu is one of China's most sophisticated astrological systems, organizing life into twelve palaces based on birth data. Each palace governs a specific domain, and the stars within reveal the native's fortune in that area.`);

    const palaces = zwData.palaces || zwData.houses || {};
    if (typeof palaces === "object" && Object.keys(palaces).length > 0) {
      const zwRows: string[][] = [];
      for (const [palace, info] of Object.entries(palaces)) {
        const pd = info as any;
        const stars = pd.stars || pd.major_star || "";
        const starStr = Array.isArray(stars) ? stars.join(", ") : String(stars);
        zwRows.push([palace, starStr || "-", pd.interpretation || pd.meaning || "-"]);
      }
      if (zwRows.length > 0) y = styledTable(y, ["Palace", "Stars", "Interpretation"], zwRows.slice(0, 12));
    }

    if (zwData.ming_gong || zwData.life_palace) {
      const ming = zwData.ming_gong || zwData.life_palace;
      y = calloutBox(y, "Life Palace (Ming Gong)", typeof ming === "string" ? ming : ming.interpretation || ming.description || `The Life Palace reveals ${firstName}'s core destiny and character in the Zi Wei system.`);
    }
  } else {
    y = body(y, `Zi Wei Dou Shu data was not available. This \"Purple Star Astrology\" system from China organizes life into twelve palaces, each governed by specific stellar influences, offering a complementary perspective to Western and Vedic approaches.`);
  }

  // LLM synthesis for Chapter V
  onProgress?.({ stage: "AI analyzing KP & Eastern methods...", percent: 80 });
  const llmCh5 = await llmGenerate(
    `Write a 200-word analysis connecting ${firstName}'s KP system sub-lord findings with their Vedic chart. How does the KP perspective add precision to the Vedic picture? If data is limited, discuss the theoretical value of sub-lord analysis for this chart.`,
    JSON.stringify({ has_kp: !!kpSystem, has_ziwei: !!ziwei, vedic_sun: vSunSignLlm, nakshatra: vNakshatra })
  );
  if (llmCh5) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch5Lines = doc.splitTextToSize(llmCh5, CW);
    for (const ln of ch5Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER VI: CHINESE ASTROLOGY (BAZI) — renumbered from IV
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "VI", "Chinese Astrology (BaZi)", "The Four Pillars of Destiny");

  y = body(y, `BaZi, literally "eight characters," derives four pillars from the birth data \u2014 each pillar consisting of a Heavenly Stem and an Earthly Branch. These eight characters map the energetic blueprint of a life, encoding elemental relationships, animal archetypes, and temporal dynamics that unfold across decades.`);

  if (baziData) {
    const pillars = baziData.pillars || baziData;
    const pillarKeys = ["year", "month", "day", "hour"];
    const pillarNames = ["Year (Ancestry)", "Month (Career)", "Day (Self)", "Hour (Inner Self)"];
    const pillarRows2: string[][] = [];
    for (let i = 0; i < pillarKeys.length; i++) {
      const p = pillars[pillarKeys[i]] || {};
      pillarRows2.push([
        pillarNames[i],
        p.heavenly_stem || p.stem || "-",
        p.earthly_branch || p.branch || "-",
        p.element || "-",
        p.animal || p.zodiac || "-",
      ]);
    }
    if (pillarRows2.some(r => r.slice(1).some(c => c !== "-"))) {
      y = styledTable(y, ["Pillar", "Stem", "Branch", "Element", "Animal"], pillarRows2);
    }

    if (dayMaster) {
      y = planetHead(y, `${dayMaster} Day Master`);
      y = body(y, `The Day Master represents ${firstName}'s core self in BaZi. As a ${dayMaster} Day Master, ${firstName} embodies the qualities of this element \u2014 it is the lens through which all other chart dynamics are interpreted.`);
    }

    // Element balance
    const elemBal2 = baziData.element_balance || baziData.elements || {};
    if (Object.keys(elemBal2).length > 0) {
      y = sectionHead(y, "Elemental Analysis");
      const ebRows2: string[][] = [];
      for (const [elem, val] of Object.entries(elemBal2)) {
        ebRows2.push([elem, String(val)]);
      }
      y = styledTable(y, ["Element", "Strength"], ebRows2);
    }

    // Ten Gods
    const tenGods = baziData.ten_gods || baziData.gods || {};
    if (typeof tenGods === "object" && Object.keys(tenGods).length > 0) {
      y = sectionHead(y, "Ten Gods Analysis");
      y = body(y, `The Ten Gods describe the relationship between the Day Master and the other seven heavenly stems and earthly branches. Each relationship type governs specific life domains.`);
      const tgRows: string[][] = [];
      for (const [god, info] of Object.entries(tenGods)) {
        const pd = info as any;
        tgRows.push([god, typeof pd === "string" ? pd : pd.element || "-", typeof pd === "object" ? (pd.description || "-") : "-"]);
      }
      if (tgRows.length > 0) y = styledTable(y, ["Ten God", "Element", "Description"], tgRows.slice(0, 10));
    }

    // BaZi Luck Periods
    if (baziLuck) {
      const blData = baziLuck.data ?? baziLuck;
      const luckPeriods = blData.luck_periods || blData.periods || blData.dayun || [];
      if (Array.isArray(luckPeriods) && luckPeriods.length > 0) {
        y = sectionHead(y, "10-Year Luck Periods (Dayun)");
        y = body(y, `BaZi luck periods (Dayun) divide life into 10-year cycles, each governed by a stem-branch pair. The current luck period reveals the dominant environmental energy shaping ${firstName}'s current decade.`);
        const lpRows: string[][] = [];
        for (const lp of luckPeriods.slice(0, 10)) {
          lpRows.push([
            lp.start_age != null ? `${lp.start_age}-${(lp.start_age || 0) + 9}` : lp.period || "-",
            lp.stem || lp.heavenly_stem || "-",
            lp.branch || lp.earthly_branch || "-",
            lp.element || "-",
          ]);
        }
        y = styledTable(y, ["Age Range", "Stem", "Branch", "Element"], lpRows);
      }
    }
  } else {
    y = body(y, "BaZi chart data was not available for this profile.");
  }

  // LLM synthesis for Chapter VI
  onProgress?.({ stage: "AI analyzing BaZi pillars...", percent: 81 });
  const baziPillars = baziData?.pillars || baziData || {};
  const baziElems = baziData?.element_balance || baziData?.elements || {};
  const llmCh6 = await llmGenerate(
    `Write a 400-word BaZi Four Pillars analysis for ${firstName}. Day Master: ${dayMaster || "unknown"}. Analyze the Day Master's strength, element balance, and what the pillar interactions reveal about personality and destiny. If specific pillar data is limited, discuss the Day Master's implications broadly.`,
    JSON.stringify({ day_master: dayMaster, pillars: baziPillars, elements: baziElems })
  );
  if (llmCh6) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch6Lines = doc.splitTextToSize(llmCh6, CW);
    for (const ln of ch6Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER VII: CHINESE METAPHYSICS — SUPPLEMENTARY
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "VII", "Chinese Metaphysics \u2014 Supplementary", "Feng Shui, Nine Star Ki, I Ching");

  // --- Feng Shui ---
  if (fengShui) {
    const fsData = fengShui.data ?? fengShui;
    y = sectionHead(y, "Flying Stars Feng Shui");
    y = body(y, `The Flying Stars system calculates a nine-square grid (Lo Shu) for the birth year, revealing the energetic pattern of one's environment. Each sector carries a star number with specific fortune implications.`);

    const grid = fsData.grid || fsData.flying_stars || fsData.chart || {};
    if (typeof grid === "object" && Object.keys(grid).length > 0) {
      const fsRows: string[][] = [];
      for (const [sector, info] of Object.entries(grid)) {
        const pd = info as any;
        const starNum = typeof pd === "number" ? pd : pd.star || pd.number || "-";
        const meaning = typeof pd === "object" ? (pd.meaning || pd.interpretation || "-") : "-";
        fsRows.push([sector, String(starNum), typeof meaning === "string" ? meaning : "-"]);
      }
      if (fsRows.length > 0) y = styledTable(y, ["Sector", "Star", "Meaning"], fsRows.slice(0, 9));
    }

    if (fsData.kua_number || fsData.kua) {
      y = body(y, `Kua Number: ${fsData.kua_number || fsData.kua}. This determines favorable and unfavorable directions for sleep, work, and main door orientation.`);
    }
  }

  y = divider(y);

  // --- Nine Star Ki ---
  if (nineStarKi) {
    const nsData = nineStarKi.data ?? nineStarKi;
    y = sectionHead(y, "Nine Star Ki Profile");
    y = body(y, `Nine Star Ki, derived from the I Ching and used extensively in Japanese feng shui and macrobiotics, assigns three numbers based on birth year, month, and day \u2014 reflecting the core self, emotional nature, and outer expression.`);

    const yearStar = nsData.year_star || nsData.basic_star || nsData.year || "";
    const monthStar = nsData.month_star || nsData.emotional_star || nsData.month || "";
    if (yearStar || monthStar) {
      y = calloutBox(y, `Nine Star Ki: ${yearStar}${monthStar ? ` \u00b7 ${monthStar}` : ""}${nsData.day_star ? ` \u00b7 ${nsData.day_star}` : ""}`, `Year Star ${yearStar}${yearStar ? ` represents ${firstName}'s core constitutional energy` : ""}. ${monthStar ? `Month Star ${monthStar} reveals the emotional/relational nature.` : ""} ${nsData.element ? `Primary element: ${nsData.element}.` : ""}`);
    }
  }

  // --- Nine Star Ki Compatibility ---
  if (nineStarKiCompat) {
    const nscData = nineStarKiCompat.data ?? nineStarKiCompat;
    if (nscData.compatible_stars || nscData.compatibility) {
      y = sectionHead(y, "Nine Star Ki Compatibility");
      const compat = nscData.compatible_stars || nscData.compatibility;
      if (typeof compat === "object") {
        for (const [key, val] of Object.entries(compat)) {
          y = bullet(y, `${key}: ${typeof val === "string" ? val : Array.isArray(val) ? (val as string[]).join(", ") : String(val)}`);
        }
      }
    }
  }

  y = divider(y);

  // --- I Ching ---
  if (iChing) {
    const icData = iChing.data ?? iChing;
    y = sectionHead(y, "Birth Hexagram (I Ching)");
    y = body(y, `The I Ching hexagram cast for ${firstName}'s birth reveals the primordial energy pattern underlying this incarnation \u2014 a snapshot of the cosmic moment crystallized into sixty-four possibilities.`);

    const hexName = icData.hexagram || icData.name || icData.hexagram_name || "";
    const hexNum = icData.number || icData.hexagram_number || "";
    const hexJudgment = icData.judgment || icData.meaning || icData.interpretation || "";
    const hexImage = icData.image || icData.description || "";

    if (hexName || hexNum) {
      y = calloutBox(y, `Hexagram ${hexNum}: ${hexName}`, `${hexJudgment}${hexImage ? `\n\nImage: ${hexImage}` : ""}`);
    }

    const changingLines = icData.changing_lines || icData.moving_lines || [];
    if (Array.isArray(changingLines) && changingLines.length > 0) {
      y = sectionHead(y, "Changing Lines");
      for (const line of changingLines.slice(0, 3)) {
        const lineNum = line.line || line.position || "";
        const lineText = line.text || line.meaning || line.interpretation || "";
        if (lineText) y = bullet(y, `Line ${lineNum}: ${lineText}`);
      }
    }
  }

  // LLM synthesis for Chapter VII
  onProgress?.({ stage: "AI analyzing Chinese metaphysics...", percent: 82 });
  const nsk = nineStarKi?.data ?? nineStarKi;
  const nskStr = nsk ? `Year: ${nsk.year_star || "?"}, Month: ${nsk.month_star || "?"}` : "unavailable";
  const ichStr = iChing ? `Hex: ${(iChing.data ?? iChing).hexagram || (iChing.data ?? iChing).name || "?"}` : "unavailable";
  const llmCh7 = await llmGenerate(
    `Write a 300-word synthesis of ${firstName}'s Chinese metaphysics supplementary readings. Nine Star Ki: ${nskStr}. I Ching birth hexagram: ${ichStr}. How do these supplementary systems enrich the BaZi picture? Connect to their Western placements where relevant.`,
    JSON.stringify({ nineStarKi: nskStr, iChing: ichStr, has_fengShui: !!fengShui, day_master: dayMaster, sun_sign: sunSign })
  );
  if (llmCh7) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch7Lines = doc.splitTextToSize(llmCh7, CW);
    for (const ln of ch7Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER VIII: HUMAN DESIGN — renumbered, now standalone
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "VIII", "Human Design", "Type, Strategy & Authority");

  onProgress?.({ stage: "Writing Human Design...", percent: 82 });

  if (hdData) {
    y = sectionHead(y, `Type: ${hdData.type || "Unknown"}`);
    y = body(y, `${firstName}'s Human Design type is ${hdData.type || "unknown"}. ${hdData.type === "Generator" ? "Generators are the life force of the planet \u2014 designed to respond to what lights them up and build mastery through sustained engagement. The strategy is to wait to respond." : hdData.type === "Manifesting Generator" ? "Manifesting Generators combine the sustainable energy of the Generator with the initiating capacity of the Manifestor. Multi-passionate, fast-moving, and designed to respond then inform." : hdData.type === "Projector" ? "Projectors are here to guide, direct, and manage the energy of others. The strategy is to wait for the invitation before sharing wisdom." : hdData.type === "Manifestor" ? "Manifestors are designed to initiate and set things in motion. The strategy is to inform before acting, creating flow rather than resistance." : hdData.type === "Reflector" ? "Reflectors are the rarest type, designed to sample and reflect the health of their community. The strategy is to wait a full lunar cycle before making major decisions." : "Each Human Design type has a specific strategy for making aligned decisions."}`);

    if (hdData.authority) {
      y = sectionHead(y, `Authority: ${hdData.authority}`);
      y = body(y, `${firstName}'s inner authority \u2014 the reliable decision-making mechanism \u2014 is ${hdData.authority}. ${hdData.authority === "Sacral" ? "Decisions are best made through gut responses \u2014 the sacral \"uh-huh\" (yes) or \"unh-unh\" (no)." : hdData.authority === "Emotional" || hdData.authority === "Solar Plexus" ? "Decisions require emotional clarity over time. Never decide in the heat of emotional highs or lows \u2014 wait for the wave to settle." : hdData.authority === "Splenic" ? "Decisions come as instantaneous, in-the-moment intuitive hits. Trust the first instinct \u2014 it won't repeat." : hdData.authority === "Self-Projected" || hdData.authority === "Self" ? "Decisions become clear through talking them out with trusted others. Hear your own truth reflected back." : hdData.authority === "Ego" || hdData.authority === "Heart" ? "Decisions align with what the heart truly wants and is willing to commit to." : "This authority guides aligned decision-making through its unique mechanism."}`);
    }

    if (hdData.profile) {
      y = sectionHead(y, `Profile: ${hdData.profile}`);
      y = body(y, `The profile describes ${firstName}'s costume and role in the Human Design system. Profile ${hdData.profile} combines the qualities of its two lines, creating a unique way of engaging with life and learning.`);
    }

    // Defined Centers
    const definedCenters = hdData.defined_centers || hdData.centers?.defined || [];
    const undefinedCenters = hdData.undefined_centers || hdData.centers?.undefined || [];
    if (Array.isArray(definedCenters) && definedCenters.length > 0) {
      y = sectionHead(y, "Energy Centers");
      y = body(y, `Defined centers (${definedCenters.length}/9) represent consistent, reliable energy: ${definedCenters.join(", ")}. ${undefinedCenters.length > 0 ? `Undefined centers (${undefinedCenters.join(", ")}) are areas of wisdom and vulnerability \u2014 where ${firstName} takes in and amplifies others' energy, and where conditioning most affects behavior.` : ""}`);
    }

    // Gates and Channels
    const channels = hdData.channels || hdData.defined_channels || [];
    if (Array.isArray(channels) && channels.length > 0) {
      y = sectionHead(y, "Key Channels");
      for (const ch of channels.slice(0, 6)) {
        const chName = typeof ch === "string" ? ch : ch.name || ch.channel || `${ch.gate1}-${ch.gate2}`;
        const chDesc = typeof ch === "object" ? (ch.description || ch.meaning || "") : "";
        y = bullet(y, `${chName}${chDesc ? `: ${chDesc}` : ""}`);
      }
    }

    // Incarnation Cross
    const cross = hdData.incarnation_cross || hdData.cross;
    if (cross) {
      y = sectionHead(y, "Incarnation Cross");
      y = body(y, `${firstName}'s Incarnation Cross \u2014 the overarching life purpose in Human Design \u2014 is ${typeof cross === "string" ? cross : cross.name || cross.description || JSON.stringify(cross)}.`);
    }

    // Not-Self Theme
    if (hdData.not_self_theme || hdData.not_self) {
      y = calloutBox(y, "Not-Self Theme", `When living out of alignment, ${firstName} experiences ${hdData.not_self_theme || hdData.not_self}. This is the signal that something is off \u2014 the alert system that redirects toward correct living.`);
    }
  } else {
    y = body(y, `Human Design data was not available. This system combines the I Ching, astrology, Kabbalah, and the Hindu-Brahmin chakra system into a unique framework for understanding individual design and decision-making authority.`);
  }

  // LLM synthesis for Chapter VIII
  onProgress?.({ stage: "AI analyzing Human Design...", percent: 83 });
  const hdType = hdData?.type || "";
  const hdAuth = hdData?.authority || "";
  const hdProf = hdData?.profile || "";
  const hdStrat = hdData?.strategy || "";
  const llmCh8 = await llmGenerate(
    `Write a 400-word Human Design analysis for ${firstName}. Type: ${hdType || "unknown"}. Authority: ${hdAuth || "unknown"}. Profile: ${hdProf || "unknown"}. Strategy: ${hdStrat || "unknown"}. Explain what this Type means for how they interact with the world, how Authority guides decision-making, and how the Profile shapes the life narrative. Connect to their ${sunSign} Sun and ${ascSign} Rising.`,
    JSON.stringify({ type: hdType, authority: hdAuth, profile: hdProf, strategy: hdStrat, sun: sunSign, asc: ascSign })
  );
  if (llmCh8) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch8Lines = doc.splitTextToSize(llmCh8, CW);
    for (const ln of ch8Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER IX: NUMEROLOGY
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "IX", "Numerology", "The Language of Numbers");

  onProgress?.({ stage: "Writing numerology...", percent: 83 });

  // Life Path (already computed as lpSum)
  y = sectionHead(y, `Life Path Number: ${lpSum}`);
  y = body(y, `${firstName}'s Life Path Number is ${lpSum} \u2014 ${lpSum === 1 ? "The Independent Leader" : lpSum === 2 ? "The Diplomat & Partner" : lpSum === 3 ? "The Creative Communicator" : lpSum === 4 ? "The Master Builder" : lpSum === 5 ? "The Freedom Seeker" : lpSum === 6 ? "The Nurturing Harmonizer" : lpSum === 7 ? "The Seeker of Truth" : lpSum === 8 ? "The Material Master" : lpSum === 9 ? "The Humanitarian" : lpSum === 11 ? "The Master Visionary" : lpSum === 22 ? "The Master Builder" : "The Master Teacher"}. This number, derived from the birth date (${profile.birthDate}), represents the overarching trajectory of life \u2014 the central lesson, the primary challenge, and the ultimate mastery.`);
  y = body(y, `Life Path ${lpSum} organizes the entire journey around ${lpSum === 1 ? "independence, initiative, and original creation. The lesson is self-reliance without isolation" : lpSum === 2 ? "cooperation, sensitivity, and partnership. The lesson is finding personal power through receptivity" : lpSum === 3 ? "creative expression, joy, and communication. The lesson is sustained creative discipline" : lpSum === 4 ? "structure, discipline, and lasting foundations. The lesson is building with patience" : lpSum === 5 ? "freedom, adventure, and transformative experience. The lesson is constructive use of freedom" : lpSum === 6 ? "responsibility, beauty, and harmonious service. The lesson is giving without martyrdom" : lpSum === 7 ? "research, analysis, introspection, and spiritual understanding. The lesson is trusting inner wisdom" : lpSum === 8 ? "ambition, power, and material mastery. The lesson is ethical use of authority" : lpSum === 9 ? "compassion, completion, and humanitarian service. The lesson is releasing attachment to outcomes" : "visionary insight and spiritual illumination. The lesson is grounding higher wisdom into practical service"}.`);

  // Numerology API data
  if (numerology) {
    const numData = numerology.data ?? numerology;
    const expression = numData.expression_number || numData.destiny_number || numData.expression;
    const soulUrge = numData.soul_urge_number || numData.soul_urge || numData.hearts_desire;
    const personality = numData.personality_number || numData.personality;
    const birthday = numData.birthday_number || numData.birth_day;

    if (expression) {
      y = sectionHead(y, `Expression/Destiny Number: ${expression}`);
      y = body(y, `The Expression Number (${expression}), calculated from the full birth name, reveals ${firstName}'s natural talents and the way these gifts are expressed in the world. This is the \"how\" to the Life Path's \"what.\" ${typeof numData.expression_interpretation === "string" ? numData.expression_interpretation : ""}`);
    }

    if (soulUrge) {
      y = sectionHead(y, `Soul Urge Number: ${soulUrge}`);
      y = body(y, `The Soul Urge Number (${soulUrge}), derived from the vowels in the birth name, reveals the deepest motivations and heart's desires \u2014 what ${firstName} truly wants beneath all surface-level goals. ${typeof numData.soul_urge_interpretation === "string" ? numData.soul_urge_interpretation : ""}`);
    }

    if (personality) {
      y = sectionHead(y, `Personality Number: ${personality}`);
      y = body(y, `The Personality Number (${personality}), derived from the consonants, represents the outer persona \u2014 how ${firstName} appears to others and the initial impression made on the world.`);
    }

    if (birthday) {
      y = body(y, `Birth Day Number: ${birthday}. This adds a specific talent or gift to the numerological profile.`);
    }

    // Personal Year
    const personalYear = numData.personal_year;
    if (personalYear) {
      y = sectionHead(y, `Personal Year: ${personalYear}`);
      y = body(y, `${firstName} is currently in a Personal Year ${personalYear}. ${personalYear === 1 ? "New beginnings, fresh starts, and independent initiative." : personalYear === 2 ? "Partnership, patience, and attention to detail." : personalYear === 3 ? "Creative expression, social expansion, and joy." : personalYear === 4 ? "Building foundations, hard work, and practical planning." : personalYear === 5 ? "Change, freedom, adventure, and unexpected opportunities." : personalYear === 6 ? "Home, family, responsibility, and love." : personalYear === 7 ? "Introspection, research, spiritual development." : personalYear === 8 ? "Achievement, recognition, financial focus, and power." : "Completion, letting go, and humanitarian service."}`);
    }

    // Pinnacles/Challenges
    const pinnacles = numData.pinnacles || numData.pinnacle_cycles || [];
    if (Array.isArray(pinnacles) && pinnacles.length > 0) {
      y = sectionHead(y, "Pinnacle & Challenge Cycles");
      const pinRows: string[][] = [];
      for (const p of pinnacles.slice(0, 4)) {
        pinRows.push([p.period || p.cycle || "-", p.pinnacle != null ? String(p.pinnacle) : "-", p.challenge != null ? String(p.challenge) : "-", p.age_range || "-"]);
      }
      y = styledTable(y, ["Period", "Pinnacle", "Challenge", "Ages"], pinRows);
    }
  }

  // LLM synthesis for Chapter IX
  onProgress?.({ stage: "AI analyzing numerology...", percent: 84 });
  const numData = numerology?.data ?? numerology;
  const lpNum = numData?.life_path || numData?.lifepath || lpSum;
  const exprNum = numData?.expression || numData?.destiny || "";
  const soulNum = numData?.soul_urge || numData?.heart || "";
  const llmCh9 = await llmGenerate(
    `Write a 300-word numerology reading for ${firstName}. Life Path: ${lpNum}. Expression: ${exprNum || "unknown"}. Soul Urge: ${soulNum || "unknown"}. How do these core numbers interact? What career, relationship, and life direction patterns emerge? Connect to their ${sunSign} Sun if relevant.`,
    JSON.stringify({ life_path: lpNum, expression: exprNum, soul_urge: soulNum, sun_sign: sunSign })
  );
  if (llmCh9) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch9Lines = doc.splitTextToSize(llmCh9, CW);
    for (const ln of ch9Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER X: MBTI & COGNITIVE FUNCTIONS — expanded from old V
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "X", "Personality \u2014 MBTI", "Cognitive Function Stack");

  onProgress?.({ stage: "Writing personality analysis...", percent: 85 });

  y = sectionHead(y, `Derived Type: ${mbtiType}`);
  y = body(y, `Based on the natal chart \u2014 particularly the Sun sign, Moon sign, Mercury placement, and Ascendant \u2014 ${firstName}'s derived MBTI type is ${mbtiType}. This suggests a cognitive style oriented toward ${mbtiType.includes("N") ? "pattern recognition, abstract possibilities, and future-oriented thinking" : "concrete facts, practical realities, and present-focused observation"}, with decisions filtered through ${mbtiType.includes("F") ? "personal values, empathy, and interpersonal harmony" : "logical analysis, objectivity, and systematic evaluation"}.`);

  y = body(y, `${mbtiType[0] === "E" ? "Extraversion" : "Introversion"}: ${mbtiType[0] === "E" ? `Energy flows outward. ${firstName} recharges through social engagement and external stimulation.` : `Energy flows inward. ${firstName} recharges through solitude and internal reflection.`}`);
  y = body(y, `${mbtiType[1] === "N" ? "Intuition" : "Sensing"}: ${mbtiType[1] === "N" ? `Information is gathered through patterns, possibilities, and abstract connections. The big picture comes first.` : `Information is gathered through the five senses and concrete experience. Details come first.`}`);
  y = body(y, `${mbtiType[2] === "F" ? "Feeling" : "Thinking"}: ${mbtiType[2] === "F" ? `Decisions are made through values, empathy, and consideration of impact on people.` : `Decisions are made through logic, analysis, and impersonal evaluation of evidence.`}`);
  y = body(y, `${mbtiType[3] === "P" ? "Perceiving" : "Judging"}: ${mbtiType[3] === "P" ? `Life is approached with flexibility, spontaneity, and openness to new information.` : `Life is approached with structure, planning, and a preference for closure.`}`);

  if (synthData) {
    const sd = synthData.data ?? synthData;
    if (sd.dominant_function || sd.cognitive_functions) {
      y = sectionHead(y, "Cognitive Function Stack");
      if (sd.dominant_function) y = body(y, `Dominant: ${sd.dominant_function}. ${sd.auxiliary_function ? `Auxiliary: ${sd.auxiliary_function}.` : ""} ${sd.tertiary_function ? `Tertiary: ${sd.tertiary_function}.` : ""} ${sd.inferior_function ? `Inferior: ${sd.inferior_function}.` : ""}`);

      const functions = sd.cognitive_functions || sd.function_stack || [];
      if (Array.isArray(functions) && functions.length > 0) {
        const fnRows: string[][] = [];
        for (const f of functions.slice(0, 8)) {
          fnRows.push([
            f.position || f.role || "-",
            f.function || f.name || "-",
            f.weight != null ? `${Math.round(Number(f.weight) * 100)}%` : f.strength || "-",
          ]);
        }
        y = styledTable(y, ["Position", "Function", "Strength"], fnRows);
      }
    }
    if (sd.narrative_summary) y = body(y, sd.narrative_summary);
    if (sd.shadow_functions) {
      y = sectionHead(y, "Shadow Functions");
      const shadowDesc = typeof sd.shadow_functions === "string" ? sd.shadow_functions : Array.isArray(sd.shadow_functions) ? sd.shadow_functions.join(", ") : "";
      if (shadowDesc) y = body(y, `The shadow function stack \u2014 which emerges under stress \u2014 includes: ${shadowDesc}. These represent ${firstName}'s unconscious cognitive patterns.`);
    }
  }

  // LLM synthesis for Chapter X
  onProgress?.({ stage: "AI analyzing MBTI type...", percent: 85 });
  const llmCh10 = await llmGenerate(
    `Write a 300-word MBTI analysis for ${firstName}, type ${mbtiType}. How does this type manifest in daily life? Connect to their astrological placements -- how does ${sunSign} Sun + ${moonSign} Moon + ${mbtiType} create a specific behavioral pattern? What are the cognitive strengths and blind spots?`,
    JSON.stringify({ mbti: mbtiType, sun: sunSign, moon: moonSign, asc: ascSign })
  );
  if (llmCh10) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch10Lines = doc.splitTextToSize(llmCh10, CW);
    for (const ln of ch10Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER XI: ENNEAGRAM — expanded
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "XI", "Personality \u2014 Enneagram", "Core Motivations & Growth");

  if (enneagram) {
    const ed = enneagram.data ?? enneagram;
    y = sectionHead(y, `Type ${ed.type || ""}${ed.name ? `: ${ed.name}` : ""}${ed.wing ? ` (Wing ${ed.wing})` : ""}`);

    if (ed.description) y = body(y, ed.description);
    if (ed.core_fear) y = calloutBox(y, "Core Fear", ed.core_fear);
    if (ed.core_desire) y = calloutBox(y, "Core Desire", ed.core_desire);
    if (ed.core_motivation) y = body(y, `Core Motivation: ${ed.core_motivation}`);

    // Tritype
    if (ed.tritype) {
      y = sectionHead(y, `Tritype: ${ed.tritype}`);
      y = body(y, `The tritype reveals the dominant type from each intelligence center (head, heart, gut). ${firstName}'s tritype ${ed.tritype} creates a unique blend of motivational energies.`);
    }

    // Instinctual variant
    if (ed.instinctual_variant || ed.instinct) {
      const inst = ed.instinctual_variant || ed.instinct;
      y = sectionHead(y, `Instinctual Variant: ${inst}`);
      y = body(y, `${inst === "sp" || inst === "Self-Preservation" ? "Self-Preservation dominant: Primary focus on physical safety, comfort, and material security." : inst === "sx" || inst === "Sexual" ? "Sexual/One-to-One dominant: Primary focus on intensity, chemistry, and deep one-on-one connection." : inst === "so" || inst === "Social" ? "Social dominant: Primary focus on belonging, group dynamics, and social role." : `The ${inst} instinctual variant shapes how ${firstName}'s core motivations express in daily life.`}`);
    }

    // Growth/Stress
    if (ed.growth_direction || ed.integration) {
      y = sectionHead(y, "Growth & Stress Directions");
      y = body(y, `In growth (integration): ${firstName} moves toward the positive qualities of Type ${ed.growth_direction || ed.integration} \u2014 ${ed.growth_description || "taking on the healthy traits of this connected type"}.`);
      if (ed.stress_direction || ed.disintegration) {
        y = body(y, `Under stress (disintegration): ${firstName} moves toward the challenging qualities of Type ${ed.stress_direction || ed.disintegration} \u2014 ${ed.stress_description || "exhibiting the unhealthy patterns of this connected type"}.`);
      }
    }

    // All type scores if available
    const scores = ed.scores || ed.type_scores || ed.all_types || {};
    if (typeof scores === "object" && Object.keys(scores).length > 0) {
      y = sectionHead(y, "All Type Scores");
      const scRows: string[][] = [];
      for (const [type, score] of Object.entries(scores)) {
        scRows.push([`Type ${type}`, typeof score === "number" ? `${Math.round(score * 100)}%` : String(score)]);
      }
      if (scRows.length > 0) y = styledTable(y, ["Enneagram Type", "Score"], scRows);
    }
  } else {
    y = body(y, `Enneagram data was not available. The Enneagram describes nine personality types, each driven by a core fear and core desire, with specific paths of growth and stress.`);
  }

  // LLM synthesis for Chapter XI
  onProgress?.({ stage: "AI analyzing Enneagram...", percent: 86 });
  const ennData = enneagram?.data ?? enneagram;
  const ennType = ennData?.type || "";
  const ennWing = ennData?.wing || "";
  const ennTritype = ennData?.tritype || "";
  const ennVariant = ennData?.instinct || ennData?.variant || "";
  const llmCh11 = await llmGenerate(
    `Write a 300-word Enneagram analysis for ${firstName}, Type ${ennType || "unknown"}${ennWing ? ` wing ${ennWing}` : ""}${ennTritype ? `, Tritype ${ennTritype}` : ""}${ennVariant ? `, ${ennVariant} variant` : ""}. Cover core motivation, core fear, integration and disintegration paths. How does this Enneagram type interact with their ${mbtiType} MBTI and ${sunSign} Sun?`,
    JSON.stringify({ type: ennType, wing: ennWing, tritype: ennTritype, variant: ennVariant, mbti: mbtiType, sun: sunSign })
  );
  if (llmCh11) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch11Lines = doc.splitTextToSize(llmCh11, CW);
    for (const ln of ch11Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER XII: JUNGIAN ARCHETYPES — expanded
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "XII", "Jungian Archetypes", "The Mythic Self");

  onProgress?.({ stage: "Writing archetype analysis...", percent: 86 });

  if (archetypes) {
    const ad = archetypes.data ?? archetypes;
    const primary = ad.primary_archetype || ad.primary;
    const secondary = ad.secondary_archetype || ad.secondary;
    const shadow = ad.shadow_archetype || ad.shadow;

    if (primary) {
      const pn = typeof primary === "string" ? primary : primary.name || JSON.stringify(primary);
      const pdesc = typeof primary === "object" ? (primary.description || primary.interpretation || "") : "";
      y = sectionHead(y, `Primary Archetype: ${pn}`);
      y = body(y, `${firstName}'s primary archetype is The ${pn}. ${pdesc || `This archetype represents the dominant mythic pattern through which ${firstName} engages with the world, makes meaning, and pursues growth.`}`);
      if (typeof primary === "object" && primary.score) {
        y = mutedItalic(y, `Archetype strength: ${Math.round(Number(primary.score) * 100)}%`);
      }
    }

    if (secondary) {
      const sn = typeof secondary === "string" ? secondary : secondary.name || "";
      const sdesc = typeof secondary === "object" ? (secondary.description || "") : "";
      y = sectionHead(y, `Secondary Archetype: ${sn}`);
      y = body(y, sdesc || `The ${sn} operates as the supporting archetype, coloring ${firstName}'s expression when the primary archetype steps back.`);
    }

    if (shadow) {
      const shName = typeof shadow === "string" ? shadow : shadow.name || "";
      const shDesc = typeof shadow === "object" ? (shadow.description || "") : "";
      y = sectionHead(y, `Shadow Archetype: ${shName}`);
      y = body(y, shDesc || `The ${shName} represents ${firstName}'s shadow \u2014 the archetype that operates unconsciously, containing both rejected qualities and untapped potential.`);
    }

    // Full archetype scores
    const allArchetypes = ad.all_archetypes || ad.archetypes || ad.scores || {};
    if (typeof allArchetypes === "object" && Object.keys(allArchetypes).length > 0) {
      y = sectionHead(y, "All Archetype Scores");
      const archRows: string[][] = [];
      const archEntries = Array.isArray(allArchetypes) ? allArchetypes : Object.entries(allArchetypes).map(([k, v]) => ({ name: k, score: typeof v === "number" ? v : (v as any).score || 0 }));
      for (const arch of archEntries.slice(0, 12)) {
        const name = typeof arch === "object" ? (arch.name || arch.archetype || "") : String(arch);
        const score = typeof arch === "object" ? (arch.score || arch.weight || 0) : 0;
        archRows.push([name, typeof score === "number" ? `${Math.round(score * 100)}%` : String(score)]);
      }
      if (archRows.length > 0) y = styledTable(y, ["Archetype", "Score"], archRows);
    }

    // Growth path
    if (ad.growth_path || ad.development) {
      y = sectionHead(y, "Archetypal Growth Path");
      y = body(y, typeof ad.growth_path === "string" ? ad.growth_path : typeof ad.development === "string" ? ad.development : `The integration of primary and shadow archetypes creates ${firstName}'s path of individuation \u2014 Carl Jung's term for becoming the fullest version of oneself.`);
    }
  } else {
    y = body(y, `Jungian archetype data was not available. The 12 Jungian archetypes (Innocent, Orphan, Hero, Caregiver, Explorer, Rebel, Lover, Creator, Jester, Sage, Magician, Ruler) represent fundamental patterns of human motivation and behavior.`);
  }

  // LLM synthesis for Chapter XII
  onProgress?.({ stage: "AI analyzing archetypes...", percent: 87 });
  const archData = archetypes?.data ?? archetypes;
  const archPrimary = archData?.primary || archData?.dominant || archData?.primary_archetype;
  const archPriName = typeof archPrimary === "string" ? archPrimary : archPrimary?.name || archPrimary?.archetype || "";
  const archShadow = archData?.shadow || archData?.shadow_archetype;
  const archShadowName = typeof archShadow === "string" ? archShadow : archShadow?.name || archShadow?.archetype || "";
  const llmCh12 = await llmGenerate(
    `Write a 300-word Jungian archetype analysis for ${firstName}. Primary archetype: ${archPriName || "unknown"}. Shadow: ${archShadowName || "unknown"}. How do these archetypes manifest in daily life? What is the individuation journey -- how does integrating the Shadow lead to wholeness? Connect to their ${sunSign} Sun, ${moonSign} Moon, ${ascSign} Rising.`,
    JSON.stringify({ primary: archPriName, shadow: archShadowName, sun: sunSign, moon: moonSign, asc: ascSign })
  );
  if (llmCh12) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch12Lines = doc.splitTextToSize(llmCh12, CW);
    for (const ln of ch12Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER XIII: HEALTH READING — renumbered from III
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "XIII", "Health Reading", "The Body-Mind Map");

  y = body(y, `Medical astrology provides a symbolic framework for understanding the body-mind connection through the natal chart. This maps planetary energies to physical systems, identifying areas of strength and vulnerability for ${firstName}. This is for self-awareness only and is not medical advice.`);

  // Constitution
  y = sectionHead(y, `Constitution: ${ascSign} Rising`);
  y = body(y, `With ${ascSign} rising, ${firstName}'s general constitution and vitality are shaped by ${SIGN_ELEMENT[ascSign]} energy. The Ascendant governs the physical body, appearance, and overall vitality. ${ascSign} rising typically gives ${ascSign === "Aries" ? "a strong, athletic build with high energy and notable facial features" : ascSign === "Taurus" ? "a sturdy, well-built frame with a strong neck and robust constitution" : ascSign === "Gemini" ? "a slender, youthful appearance with expressive hands and quick movements" : ascSign === "Cancer" ? "rounded features, sensitive digestion, and vitality tied to emotional state" : ascSign === "Leo" ? "strong posture, warm complexion, and robust heart energy" : ascSign === "Virgo" ? "refined features, sensitive digestive system, and a nervous constitution" : ascSign === "Libra" ? "balanced proportions, kidney sensitivity, and skin that reflects inner state" : ascSign === "Scorpio" ? "intense presence, strong regenerative capacity, and powerful elimination" : ascSign === "Sagittarius" ? "tall or expansive build, strong thighs, and active liver" : ascSign === "Capricorn" ? "lean structure, strong bones, but watch joints and knees over time" : ascSign === "Aquarius" ? "unique appearance, active circulation, and sensitive ankles" : "soft features, sensitive feet, and a permeable immune system"}.`);
  y = body(y, `Primary body zone: ${SIGN_BODY[ascSign] || "general constitution"}.`);

  // 6th House
  const h6 = houses.find((h: any) => (h.number || h.house) === 6);
  const h6Sign = h6?.sign || "Virgo";
  y = sectionHead(y, `Daily Health: 6th House in ${h6Sign}`);
  y = body(y, `The 6th house governs daily health habits, susceptibility to illness, and functional weakness. With ${h6Sign} on ${firstName}'s 6th house cusp, health habits are colored by ${SIGN_ELEMENT[h6Sign]} energy. The body zone to monitor: ${SIGN_BODY[h6Sign] || "digestive system"}.`);

  const planetsIn6 = mainPlanets.filter(p => posMap[p]?.house === 6);
  if (planetsIn6.length > 0) {
    y = body(y, `Planets in the 6th house: ${planetsIn6.join(", ")}. Each adds health significance:`);
    for (const p of planetsIn6) {
      const meaning = p === "Sun" ? "vital force concentrated in daily work; health tied to purpose" : p === "Moon" ? "emotional state directly affects digestion and immunity" : p === "Mars" ? "high physical energy but risk of inflammation and overwork injuries" : p === "Saturn" ? "chronic conditions possible; slow but steady health improvements with discipline" : p === "Jupiter" ? "generally protective; watch for excess and liver health" : p === "Pluto" ? "work as transformation; health crises that lead to profound renewal" : "subtle health influences through daily routine";
      y = bullet(y, `${p}: ${meaning}`);
    }
  }

  // Planetary health indicators table
  y = sectionHead(y, "Planetary Health Indicators");
  const healthRows: string[][] = [];
  for (const p of ["Sun", "Moon", "Mars", "Saturn"]) {
    const info = posMap[p];
    if (!info) continue;
    const meaning = p === "Sun" ? "Vital force, general constitution" : p === "Moon" ? "Emotional health, digestion, fluids" : p === "Mars" ? "Energy, inflammation, fevers, accidents" : "Chronic conditions, bones, depression";
    healthRows.push([`${GLYPH[p]} ${p}`, info.sign, SIGN_BODY[info.sign] || "-", meaning]);
  }
  y = styledTable(y, ["Planet", "Sign", "Body Zone", "Health Theme"], healthRows);

  // Element balance health
  y = sectionHead(y, "Element Balance & Health");
  for (const elem of ["Fire", "Earth", "Air", "Water"] as const) {
    const count = elemCount[elem];
    if (count >= 3) {
      const info = ELEMENT_HEALTH[elem];
      y = bullet(y, `${elem} dominant (${count} planets) \u2014 Watch for: ${info.risk}. Recommendations: ${info.advice}.`);
    } else if (count === 0) {
      y = bullet(y, `No ${elem} placements \u2014 ${elem} qualities may need conscious cultivation through lifestyle choices.`);
    }
  }

  // Biorhythm
  if (biorhythm) {
    const bio = biorhythm.data ?? biorhythm;
    const cycles = bio.cycles || bio;
    y = sectionHead(y, "Current Biorhythm State");
    const phys = Math.round(Number(cycles.physical || 0));
    const emot = Math.round(Number(cycles.emotional || 0));
    const intel = Math.round(Number(cycles.intellectual || 0));
    y = body(y, `Physical: ${phys}% \u2014 ${phys > 60 ? "high energy, good time for physical challenges" : phys > 30 ? "moderate energy, maintain regular activity" : "low energy, prioritize rest and recovery"}. Emotional: ${emot}% \u2014 ${emot > 60 ? "emotionally resilient and expressive" : emot > 30 ? "balanced emotional state" : "practice extra self-care"}. Intellectual: ${intel}% \u2014 ${intel > 60 ? "mind is sharp, ideal for complex work" : intel > 30 ? "mental energy is stable" : "break tasks into smaller steps"}.`);
  }

  // LLM-enhanced health narrative
  onProgress?.({ stage: "Generating AI health narrative...", percent: 88 });
  const llmHealthCtx = `ASC: ${ascSign}, 6th house: ${h6Sign}, Sun: ${sunSign} H${sunHouseFixed}, Moon: ${moonSign} H${moonHouseFixed}, Mars: ${posMap["Mars"]?.sign || "?"} H${posMap["Mars"]?.house || "?"}, Saturn: ${posMap["Saturn"]?.sign || "?"} H${posMap["Saturn"]?.house || "?"}, elements: Fire=${elemCount.Fire} Earth=${elemCount.Earth} Air=${elemCount.Air} Water=${elemCount.Water}`;
  const llmHealth = await llmGenerate(`Write a 400-word medical astrology health reading for ${firstName}. Cover constitution (${ascSign} Rising), daily health (6th house in ${h6Sign}), planetary health indicators, and element balance health implications. This is symbolic self-awareness, not medical advice.`, llmHealthCtx);
  if (llmHealth) {
    y = divider(y);
    y = sectionHead(y, "Integrated Health Narrative");
    const healthLines = doc.splitTextToSize(llmHealth, CW);
    for (const line of healthLines) { y = body(y, line); }
  }

  y = mutedItalic(y, "This health reading uses astrological symbolism for self-reflection. It is not medical advice. Always consult healthcare professionals for health concerns.");

  // =======================================================================
  // CHAPTER XIV: COSMIC WEATHER & SPACE WEATHER
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "XIV", "Cosmic Weather", "Space Weather & Solar Activity");

  onProgress?.({ stage: "Writing cosmic weather...", percent: 88 });

  y = body(y, `Space weather \u2014 solar flares, geomagnetic storms, and cosmic ray flux \u2014 creates the electromagnetic environment in which all terrestrial life operates. Research increasingly suggests correlations between solar activity and human behavior, mood, and health patterns.`);

  if (spaceWeather) {
    const swData = spaceWeather.data ?? spaceWeather;
    y = sectionHead(y, "Current Space Weather");

    const solarFlux = swData.solar_flux || swData.f107 || swData.flux;
    const kpIndex = swData.kp_index || swData.kp || swData.geomagnetic;
    const sunspots = swData.sunspot_number || swData.sunspots;

    if (solarFlux || kpIndex || sunspots) {
      const swRows: string[][] = [];
      if (solarFlux) swRows.push(["Solar Flux (F10.7)", String(solarFlux), Number(solarFlux) > 150 ? "High \u2014 increased solar activity" : Number(solarFlux) > 100 ? "Moderate" : "Low \u2014 quiet sun"]);
      if (kpIndex) swRows.push(["Kp Index", String(kpIndex), Number(kpIndex) >= 5 ? "Storm conditions" : Number(kpIndex) >= 3 ? "Unsettled" : "Quiet"]);
      if (sunspots) swRows.push(["Sunspot Number", String(sunspots), Number(sunspots) > 100 ? "Active solar maximum" : "Low activity"]);
      y = styledTable(y, ["Indicator", "Value", "Interpretation"], swRows);
    }

    y = body(y, `${kpIndex && Number(kpIndex) >= 4 ? `The current geomagnetic conditions are elevated (Kp ${kpIndex}). During geomagnetic storms, sensitive individuals may experience sleep disruption, emotional intensity, and heightened intuition. ${firstName}'s ${SIGN_ELEMENT[moonSign] === "Water" ? "Water Moon makes this sensitivity especially pronounced" : "chart suggests monitoring energy levels during these periods"}.` : `Current geomagnetic conditions are relatively calm, supporting stable emotional and mental processing.`}`);

    if (swData.aurora_probability || swData.aurora) {
      y = body(y, `Aurora probability: ${swData.aurora_probability || swData.aurora}. ${Number(swData.aurora_probability || swData.aurora) > 30 ? "Elevated aurora activity suggests heightened cosmic energy." : ""}`);
    }
  }

  if (spaceWeatherForecast) {
    const sfData = spaceWeatherForecast.data ?? spaceWeatherForecast;
    y = sectionHead(y, "Space Weather Forecast");
    const forecast = sfData.forecast || sfData.predictions || sfData;
    if (typeof forecast === "string") {
      y = body(y, forecast);
    } else if (Array.isArray(forecast)) {
      for (const f of forecast.slice(0, 5)) {
        const fText = typeof f === "string" ? f : `${f.date || f.period || ""}: ${f.description || f.prediction || f.level || ""}`;
        y = bullet(y, fText);
      }
    } else if (typeof forecast === "object") {
      for (const [key, val] of Object.entries(forecast)) {
        if (typeof val === "string" || typeof val === "number") y = bullet(y, `${key}: ${val}`);
      }
    }
  }

  // Planetary hours
  if (planetaryHours) {
    const phData = planetaryHours.data ?? planetaryHours;
    y = sectionHead(y, "Planetary Hours");
    y = body(y, `The ancient system of planetary hours divides each day into segments ruled by the seven visible planets, creating an astrological rhythm for timing activities.`);
    const hours = phData.hours || phData.planetary_hours || [];
    if (Array.isArray(hours) && hours.length > 0) {
      const phRows: string[][] = [];
      for (const h of hours.slice(0, 12)) {
        phRows.push([h.planet || h.ruler || "-", h.start || "-", h.end || "-", h.type || (h.is_day ? "Day" : "Night") || "-"]);
      }
      y = styledTable(y, ["Ruler", "Start", "End", "Period"], phRows);
    }
  }

  // LLM synthesis for Chapter XIV
  onProgress?.({ stage: "AI analyzing cosmic weather...", percent: 89 });
  const swInfo = spaceWeather?.data ?? spaceWeather;
  const kpVal = swInfo?.kp_index || swInfo?.kp || "";
  const llmCh14 = await llmGenerate(
    `Write a 200-word analysis of how current space weather and cosmic conditions affect ${firstName}'s chart. Kp index: ${kpVal || "unknown"}. Moon sign: ${moonSign} (${SIGN_ELEMENT[moonSign]} element). How might geomagnetic and solar activity affect someone with these specific placements?`,
    JSON.stringify({ kp: kpVal, moon_sign: moonSign, moon_element: SIGN_ELEMENT[moonSign], sun_sign: sunSign })
  );
  if (llmCh14) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch14Lines = doc.splitTextToSize(llmCh14, CW);
    for (const ln of ch14Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER XV: COSMIC TIMING — TRANSITS & RETURNS
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "XV", "Cosmic Timing", "Transits, Returns & Progressions");

  onProgress?.({ stage: "Mapping cosmic timing...", percent: 90 });

  // Current Transits
  if (transits) {
    y = sectionHead(y, "Current Transits");
    y = body(y, `Transits \u2014 the current positions of planets hitting natal chart points \u2014 are the most dynamic timing technique. They reveal what the universe is activating in ${firstName}'s chart right now.`);
    const trData = transits.data ?? transits;
    const trList: any[] = (trData.transits || trData.aspects || []).slice(0, 12);
    if (trList.length > 0) {
      const trRows = trList.map((t: any) => [
        t.transiting_planet || t.planet || "-",
        t.aspect || t.type || "-",
        t.natal_planet || t.natal || "-",
        t.orb != null ? `${Number(t.orb).toFixed(1)}\u00b0` : "-",
      ]);
      y = styledTable(y, ["Transit", "Aspect", "Natal", "Orb"], trRows);

      // Key transit narratives for outer planets
      for (const t of trList) {
        const tp = t.transiting_planet || t.planet || "";
        const np = t.natal_planet || t.natal || "";
        const type = t.aspect || t.type || "";
        if (["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"].includes(tp) && Number(t.orb ?? 99) < 3) {
          y = calloutBox(y, `${tp} ${type} natal ${np} (${Number(t.orb ?? 0).toFixed(1)}\u00b0)`, `${tp === "Jupiter" ? `Jupiter's transit brings expansion, opportunity, and growth to the domain of natal ${np}.` : tp === "Saturn" ? `Saturn's transit brings structure, responsibility, and maturation to natal ${np}'s domain. This is a period of hard-won achievement.` : tp === "Uranus" ? `Uranus disrupts and liberates wherever it touches. Natal ${np} is being awakened and revolutionized.` : tp === "Neptune" ? `Neptune dissolves boundaries around natal ${np}, bringing spiritual depth, confusion, or creative inspiration.` : `Pluto's transit transforms natal ${np} at the deepest level. Surrender to the process of death and rebirth in this area.`}`);
        }
      }
    }
  }

  // Transit Forecast
  if (transitForecast) {
    const tfData = transitForecast.data ?? transitForecast;
    const upcoming = tfData.upcoming || tfData.forecast || tfData.transits || [];
    if (Array.isArray(upcoming) && upcoming.length > 0) {
      y = sectionHead(y, "Upcoming Transits");
      const ufRows: string[][] = [];
      for (const t of upcoming.slice(0, 8)) {
        ufRows.push([t.planet || t.transiting || "-", t.aspect || t.type || "-", t.natal_planet || t.natal || "-", t.date || t.exact_date || "-"]);
      }
      y = styledTable(y, ["Transit", "Aspect", "Natal", "Date"], ufRows);
    }
  }

  y = divider(y);

  // Solar Return
  if (solarReturn) {
    y = sectionHead(y, `Solar Return ${new Date().getFullYear()}`);
    y = body(y, `The Solar Return chart \u2014 cast for the exact moment the Sun returns to its natal position each year \u2014 reveals the overarching themes from ${firstName}'s birthday in ${new Date().getFullYear()} to the next.`);
    const srData = solarReturn.data ?? solarReturn;
    const srPos = srData.positions || {};
    if (Object.keys(srPos).length > 0) {
      const srRows: string[][] = [];
      for (const [planet, info] of Object.entries(srPos)) {
        const pd = info as any;
        srRows.push([planet, pd.sign || "-", pd.degree != null ? `${Number(pd.degree).toFixed(1)}\u00b0` : "-"]);
      }
      y = styledTable(y, ["Planet", "SR Sign", "Degree"], srRows.slice(0, 10));
    }
  }

  // Progressions
  if (progressions) {
    y = sectionHead(y, "Secondary Progressions");
    const prData = progressions.data ?? progressions;
    const prPos = prData.positions || prData.progressed_positions || {};
    y = body(y, `Secondary progressions advance the natal chart by one day for each year of life, revealing slow inner evolution. Major progressed shifts \u2014 especially the progressed Moon changing signs or the progressed Sun changing signs \u2014 mark significant internal turning points.`);
    if (Object.keys(prPos).length > 0) {
      const prRows: string[][] = [];
      for (const [planet, info] of Object.entries(prPos)) {
        const pd = info as any;
        prRows.push([planet, pd.sign || "-", pd.degree != null ? `${Number(pd.degree).toFixed(1)}\u00b0` : "-"]);
      }
      y = styledTable(y, ["Planet", "Progressed Sign", "Degree"], prRows.slice(0, 10));
    }
  }

  // LLM synthesis for Chapter XV
  onProgress?.({ stage: "AI analyzing cosmic timing...", percent: 90 });
  const prSunSign = progressions ? ((progressions.data ?? progressions).positions?.Sun || (progressions.data ?? progressions).progressed_positions?.Sun)?.sign || "" : "";
  const prMoonSign = progressions ? ((progressions.data ?? progressions).positions?.Moon || (progressions.data ?? progressions).progressed_positions?.Moon)?.sign || "" : "";
  const profLord = profection ? ((profection.data ?? profection).lord_of_year || (profection.data ?? profection).time_lord || "") : "";
  const llmCh15 = await llmGenerate(
    `Write a 400-word timing analysis for ${firstName}. Progressed Sun: ${prSunSign || "unknown"}. Progressed Moon: ${prMoonSign || "unknown"}. Annual profection lord: ${profLord || "unknown"}. Natal Sun: ${sunSign}. What are the major themes emerging? What opportunities and challenges lie ahead? Synthesize transits, progressions, and profections into timing advice.`,
    JSON.stringify({ prog_sun: prSunSign, prog_moon: prMoonSign, profection_lord: profLord, natal_sun: sunSign, has_transits: !!transits, has_solar_return: !!solarReturn })
  );
  if (llmCh15) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch15Lines = doc.splitTextToSize(llmCh15, CW);
    for (const ln of ch15Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER XVI: PREDICTIVE OUTLOOK
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "XVI", "Predictive Outlook", "Electional & Retrograde Calendar");

  onProgress?.({ stage: "Computing predictive outlook...", percent: 91 });

  // Electional
  if (electional) {
    const elData = electional.data ?? electional;
    y = sectionHead(y, "Optimal Upcoming Dates");
    y = body(y, `Electional astrology identifies the best times to initiate important activities based on the current transit field and ${firstName}'s natal chart.`);

    const dates = elData.dates || elData.optimal_dates || elData.elections || [];
    if (Array.isArray(dates) && dates.length > 0) {
      const elRows: string[][] = [];
      for (const d of dates.slice(0, 8)) {
        elRows.push([d.date || "-", d.activity || d.purpose || "-", d.rating || d.quality || "-", d.reason || d.description || "-"]);
      }
      y = styledTable(y, ["Date", "Best For", "Rating", "Reason"], elRows);
    } else if (typeof elData === "object") {
      for (const [key, val] of Object.entries(elData)) {
        if (typeof val === "string") y = bullet(y, `${key}: ${val}`);
      }
    }
  }

  y = divider(y);

  // Retrograde Calendar
  if (retrograde) {
    const retData = retrograde.data ?? retrograde;
    y = sectionHead(y, "Retrograde Calendar");
    y = body(y, `Retrograde periods \u2014 when planets appear to move backward from Earth's perspective \u2014 are times for revision, reflection, and completing unfinished business rather than initiating new ventures.`);

    const retrogrades = retData.retrogrades || retData.current || retData.planets || [];
    if (Array.isArray(retrogrades) && retrogrades.length > 0) {
      const retRows: string[][] = [];
      for (const r of retrogrades.slice(0, 8)) {
        retRows.push([r.planet || "-", r.start_date || r.start || "-", r.end_date || r.end || "-", r.sign || "-", r.status || (r.is_retrograde ? "Retrograde" : "Direct") || "-"]);
      }
      y = styledTable(y, ["Planet", "Start", "End", "Sign", "Status"], retRows);
    } else if (typeof retrogrades === "object" && !Array.isArray(retrogrades)) {
      for (const [planet, info] of Object.entries(retrogrades)) {
        const pd = info as any;
        y = bullet(y, `${planet}: ${pd.status || (pd.is_retrograde ? "Retrograde" : "Direct")}${pd.sign ? ` in ${pd.sign}` : ""}${pd.until ? ` until ${pd.until}` : ""}`);
      }
    }

    // Mercury retrograde special note
    const mercRet = Array.isArray(retrogrades) ? retrogrades.find((r: any) => (r.planet || "").includes("Mercury") && (r.is_retrograde || r.status === "Retrograde")) : null;
    if (mercRet) {
      y = calloutBox(y, "* Mercury Retrograde Active", `Mercury is currently retrograde in ${mercRet.sign || "the sky"}. Communication delays, technology glitches, and misunderstandings are more likely. This is an excellent time for ${firstName} to review, revise, and reconnect with old contacts \u2014 but avoid signing important contracts or launching new projects if possible.`);
    }
  }

  // Timing Convergence
  if (timingConvergence) {
    const tcData = timingConvergence.data ?? timingConvergence;
    y = sectionHead(y, "Timing Convergence Across Systems");
    y = body(y, `When multiple systems agree on timing \u2014 Western transits, Vedic dashas, BaZi luck periods, and numerological personal year \u2014 the signal is dramatically amplified.`);

    const convergences = tcData.convergences || tcData.themes || tcData;
    if (typeof convergences === "object" && !Array.isArray(convergences)) {
      for (const [key, val] of Object.entries(convergences)) {
        if (typeof val === "string") y = bullet(y, `${key}: ${val}`);
        else if (typeof val === "number") y = bullet(y, `${key}: ${Math.round(val * 100)}%`);
      }
    } else if (Array.isArray(convergences)) {
      for (const c of convergences.slice(0, 6)) {
        y = bullet(y, typeof c === "string" ? c : `${c.theme || c.name || ""}: ${c.description || c.value || ""}`);
      }
    }
  }

  // LLM synthesis for Chapter XVI
  onProgress?.({ stage: "AI analyzing predictive outlook...", percent: 92 });
  const llmCh16 = await llmGenerate(
    `Write a 300-word predictive outlook for ${firstName}. Natal Sun: ${sunSign}. Current retrogrades and electional data available: ${!!retrograde}, ${!!electional}. What timing advice can be given for the next 3-6 months based on transit patterns and progressions? Focus on actionable guidance.`,
    JSON.stringify({ sun: sunSign, has_retro: !!retrograde, has_electional: !!electional, has_timing: !!timingConvergence })
  );
  if (llmCh16) {
    y = divider(y);
    y = sectionHead(y, "Synthesis & Analysis");
    const ch16Lines = doc.splitTextToSize(llmCh16, CW);
    for (const ln of ch16Lines) { y = body(y, ln); }
  }

  // =======================================================================
  // CHAPTER XVII: RELATIONSHIPS & LOVE
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "XVII", "Relationships & Love", "The Heart's Blueprint");

  onProgress?.({ stage: "Writing relationship analysis...", percent: 93 });

  // Venus analysis
  const venusInfo = posMap["Venus"];
  if (venusInfo) {
    y = sectionHead(y, `${GLYPH.Venus} Venus in ${venusInfo.sign} \u2014 ${venusInfo.house}${venusInfo.house === 1 ? "st" : venusInfo.house === 2 ? "nd" : venusInfo.house === 3 ? "rd" : "th"} House`);
    const venusInterp = VENUS_IN_SIGN[venusInfo.sign] || "";
    y = body(y, `${firstName}'s Venus in ${venusInfo.sign} defines the love language, aesthetic sensibility, and relationship values. ${venusInterp}`);
    y = body(y, `In the ${venusInfo.house}${venusInfo.house === 1 ? "st" : venusInfo.house === 2 ? "nd" : venusInfo.house === 3 ? "rd" : "th"} House of ${HOUSE_DOMAIN[venusInfo.house] || "experience"}, Venus seeks love through ${venusInfo.house <= 3 ? "personal expression and immediate connection" : venusInfo.house <= 6 ? "creative projects, service, and daily shared routines" : venusInfo.house <= 9 ? "deep partnership, shared transformation, and philosophical alignment" : "public partnership, community connection, and spiritual union"}.${venusInfo.retrograde ? ` Venus is retrograde, turning the love nature inward and creating a deeply reflective, sometimes nostalgic approach to relationships.` : ""}`);
  }

  // 7th House
  const h7 = houses.find((h: any) => (h.number || h.house) === 7);
  const h7Sign = h7?.sign || "";
  if (h7Sign) {
    y = sectionHead(y, `7th House of Partnership: ${h7Sign}`);
    y = body(y, `The 7th house cusp in ${h7Sign} describes what ${firstName} is drawn to in a partner and what qualities emerge through committed relationship. ${h7Sign === ascSign ? "With the same sign on the 7th as the Ascendant, there is a mirror-like quality to partnerships \u2014 partners reflect the self back clearly." : `${h7Sign} on the 7th house cusp draws ${firstName} toward partners who embody ${SIGN_ELEMENT[h7Sign]} qualities \u2014 ${SIGN_ELEMENT[h7Sign] === "Fire" ? "passion, initiative, and dynamism" : SIGN_ELEMENT[h7Sign] === "Earth" ? "stability, reliability, and material competence" : SIGN_ELEMENT[h7Sign] === "Air" ? "intellectual stimulation, communication, and social grace" : "emotional depth, intuition, and creative sensitivity"}.`}`);
  }

  // Mars in relationships
  const marsInfo = posMap["Mars"];
  if (marsInfo) {
    y = sectionHead(y, `${GLYPH.Mars} Mars in ${marsInfo.sign} \u2014 Desire & Drive`);
    const marsInterp = MARS_IN_SIGN[marsInfo.sign] || "";
    y = body(y, `${firstName}'s Mars in ${marsInfo.sign} defines the desire nature, sexual expression, and how conflict is handled in relationships. ${marsInterp}`);
  }

  // Venus-Mars aspects
  const venMarsAspects = aspects.filter((a: any) => {
    const p1 = a.planet1 || a.p1 || "";
    const p2 = a.planet2 || a.p2 || "";
    return (p1 === "Venus" && p2 === "Mars") || (p1 === "Mars" && p2 === "Venus");
  });
  if (venMarsAspects.length > 0) {
    const vma = venMarsAspects[0];
    const type = (vma.aspect || vma.type || "").toLowerCase();
    const orb = Number(vma.orb ?? 0).toFixed(1);
    y = calloutBox(y, `Venus ${type} Mars (${orb}\u00b0)`, `The relationship between Venus (love) and Mars (desire) is one of the most important in the chart for romance. ${type === "conjunction" ? "Venus and Mars are fused \u2014 love and desire are inseparable. Attraction is powerful and immediate." : type === "trine" || type === "sextile" ? "Venus and Mars flow harmoniously \u2014 love and desire work together naturally. Relationships tend to be passionate yet stable." : type === "square" ? "Venus and Mars create tension \u2014 what is loved and what is desired may pull in different directions, creating a dynamic, passionate but sometimes conflicted love life." : type === "opposition" ? "Venus and Mars oppose each other \u2014 creating a magnetic polarity between giving and taking in love. Relationships are intense and growth-promoting." : "Venus and Mars interact in a nuanced way, creating a unique signature in how love and desire express."}`);
  }

  // Juno from asteroids
  if (asteroids) {
    const asData = asteroids.data ?? asteroids;
    const astPositions = asData.positions || asData.asteroids || asData;
    const juno = astPositions?.Juno || astPositions?.juno;
    if (juno) {
      y = sectionHead(y, `Juno in ${juno.sign || "?"} \u2014 Commitment Style`);
      y = body(y, `Juno, the asteroid of commitment and marriage, in ${juno.sign || "this sign"} reveals what ${firstName} needs in a long-term committed partnership. ${juno.sign === "Aries" ? "Independence within commitment is essential." : juno.sign === "Taurus" ? "Security, loyalty, and physical comfort define the ideal marriage." : juno.sign === "Gemini" ? "Mental stimulation and communication are required for lasting commitment." : juno.sign === "Cancer" ? "Emotional safety and family-building are central to commitment." : juno.sign === "Leo" ? "Admiration, loyalty, and shared creativity define the committed bond." : juno.sign === "Virgo" ? "Practical devotion and shared improvement projects sustain commitment." : juno.sign === "Libra" ? "Equality, beauty, and harmonious partnership are non-negotiable." : juno.sign === "Scorpio" ? "Depth, loyalty, and transformative intimacy define commitment." : juno.sign === "Sagittarius" ? "Shared philosophy and adventure keep the committed bond alive." : juno.sign === "Capricorn" ? "Ambition, structure, and long-term building sustain the partnership." : juno.sign === "Aquarius" ? "Freedom, friendship, and shared ideals are required for lasting commitment." : juno.sign === "Pisces" ? "Spiritual connection and unconditional compassion define the ideal marriage." : "The placement shapes the approach to long-term commitment."}`);
    }
  }

  // LLM-enhanced relationship narrative
  const llmRelCtx = `Venus: ${posMap["Venus"]?.sign || "?"} H${posMap["Venus"]?.house || "?"}, Mars: ${posMap["Mars"]?.sign || "?"} H${posMap["Mars"]?.house || "?"}, 7th house: ${h7Sign}, Venus-Mars aspects: ${venMarsAspects.map((a: any) => `${(a.aspect || a.type || "")} ${Number(a.orb ?? 0).toFixed(1)}`).join(", ") || "none"}`;
  const llmRel = await llmGenerate(`Write a 300-word relationship reading for ${firstName}. Cover love language, desire nature, partnership needs, and relationship dynamics based on the chart data.`, llmRelCtx);
  if (llmRel) {
    y = divider(y);
    y = sectionHead(y, "Relationship Synthesis");
    const relLines = doc.splitTextToSize(llmRel, CW);
    for (const line of relLines) { y = body(y, line); }
  }

  // =======================================================================
  // CHAPTER XVIII: CAREER & VOCATION
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "XVIII", "Career & Vocation", "The Professional Path");

  onProgress?.({ stage: "Writing career analysis...", percent: 94 });

  // MC/10th House
  const h10 = houses.find((h: any) => (h.number || h.house) === 10);
  const mcSign = h10?.sign || "";
  if (mcSign) {
    y = sectionHead(y, `Midheaven (MC) in ${mcSign}`);
    const mcInterp = MC_SIGN[mcSign] || "";
    y = body(y, `The Midheaven \u2014 the highest point of the chart and the cusp of the 10th house \u2014 represents ${firstName}'s public image, career direction, and legacy. With the MC in ${mcSign}, the professional path is colored by ${SIGN_ELEMENT[mcSign]} energy. ${mcInterp}`);

    // MC ruler
    const mcRuler = SIGN_RULER[mcSign] || "";
    const mcRulerInfo = posMap[mcRuler];
    if (mcRulerInfo) {
      y = body(y, `The MC ruler is ${mcRuler}, placed in ${mcRulerInfo.sign} in the ${mcRulerInfo.house}${mcRulerInfo.house === 1 ? "st" : mcRulerInfo.house === 2 ? "nd" : mcRulerInfo.house === 3 ? "rd" : "th"} House. This means the career direction is channeled through the domain of ${HOUSE_DOMAIN[mcRulerInfo.house] || "life experience"}. ${mcRulerInfo.retrograde ? `${mcRuler} is retrograde, suggesting the career path may involve unconventional timing, late bloomers, or revisiting earlier vocational interests.` : ""}`);
    }
  }

  // Saturn — career structure
  const saturnInfo = posMap["Saturn"];
  if (saturnInfo) {
    y = sectionHead(y, `${GLYPH.Saturn} Saturn in ${saturnInfo.sign} \u2014 Career Structure`);
    y = body(y, `Saturn represents discipline, mastery, and long-term career structure. In ${saturnInfo.sign} in the ${saturnInfo.house}${saturnInfo.house === 1 ? "st" : saturnInfo.house === 2 ? "nd" : saturnInfo.house === 3 ? "rd" : "th"} House, Saturn demands ${saturnInfo.house === 10 ? "serious professional commitment \u2014 career IS the life mission" : saturnInfo.house === 6 ? "mastery of daily work and service" : saturnInfo.house === 2 ? "disciplined approach to finances and material building" : `disciplined engagement with the domain of ${HOUSE_DOMAIN[saturnInfo.house] || "life"}`}. ${PLANET_IN_SIGN.Saturn?.[saturnInfo.sign] || ""}`);
  }

  // Jupiter — growth opportunities
  const jupiterInfo = posMap["Jupiter"];
  if (jupiterInfo) {
    y = sectionHead(y, `${GLYPH.Jupiter} Jupiter in ${jupiterInfo.sign} \u2014 Growth & Opportunity`);
    y = body(y, `Jupiter represents expansion, opportunity, and natural abundance. In ${jupiterInfo.sign} in the ${jupiterInfo.house}${jupiterInfo.house === 1 ? "st" : jupiterInfo.house === 2 ? "nd" : jupiterInfo.house === 3 ? "rd" : "th"} House, the greatest professional growth comes through ${jupiterInfo.house === 10 ? "public visibility and leadership" : jupiterInfo.house === 9 ? "education, publishing, and international connections" : jupiterInfo.house === 2 ? "financial wisdom and value creation" : `the domain of ${HOUSE_DOMAIN[jupiterInfo.house] || "expansion"}`}. ${PLANET_IN_SIGN.Jupiter?.[jupiterInfo.sign] || ""}`);
  }

  // 6th House — daily work
  if (h6Sign) {
    y = sectionHead(y, `6th House in ${h6Sign} \u2014 Daily Work Style`);
    y = body(y, `The 6th house governs daily work routines, work environment preferences, and service orientation. With ${h6Sign} on the cusp, ${firstName}'s ideal daily work involves ${SIGN_ELEMENT[h6Sign] === "Fire" ? "dynamic, high-energy tasks with visible impact" : SIGN_ELEMENT[h6Sign] === "Earth" ? "practical, tangible work that produces real-world results" : SIGN_ELEMENT[h6Sign] === "Air" ? "intellectual, communicative, and socially oriented tasks" : "creative, emotionally meaningful, and intuitive work"}.`);
  }

  // 2nd House — income
  const h2 = houses.find((h: any) => (h.number || h.house) === 2);
  const h2Sign = h2?.sign || "";
  if (h2Sign) {
    y = sectionHead(y, `2nd House in ${h2Sign} \u2014 Income Patterns`);
    y = body(y, `The 2nd house governs earned income, material resources, and self-worth. With ${h2Sign} on the cusp, ${firstName}'s relationship to money and resources is colored by ${SIGN_ELEMENT[h2Sign]} energy \u2014 ${SIGN_ELEMENT[h2Sign] === "Fire" ? "income through initiative, leadership, and personal brand" : SIGN_ELEMENT[h2Sign] === "Earth" ? "income through steady building, practical skills, and material expertise" : SIGN_ELEMENT[h2Sign] === "Air" ? "income through ideas, communication, technology, and networking" : "income through creative work, emotional intelligence, and healing/helping professions"}.`);
  }

  // LLM-enhanced career narrative
  const llmCareerCtx = `MC: ${mcSign}, Saturn: ${posMap["Saturn"]?.sign || "?"} H${posMap["Saturn"]?.house || "?"}, Jupiter: ${posMap["Jupiter"]?.sign || "?"} H${posMap["Jupiter"]?.house || "?"}, 6th house: ${h6Sign}, 2nd house: ${h2Sign}, North Node: ${northNode?.data?.sign || northNode?.sign || "?"}`;
  const llmCareer = await llmGenerate(`Write a 300-word career and vocation reading for ${firstName}. Cover MC sign, career direction, Saturn discipline, Jupiter opportunity, daily work style, and income patterns.`, llmCareerCtx);
  if (llmCareer) {
    y = divider(y);
    y = sectionHead(y, "Career Synthesis");
    const careerLines = doc.splitTextToSize(llmCareer, CW);
    for (const line of careerLines) { y = body(y, line); }
  }

  // =======================================================================
  // CHAPTER XIX: SPIRITUAL & KARMIC PATH
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "XIX", "Spiritual & Karmic Path", "The Soul's Journey");

  onProgress?.({ stage: "Writing spiritual analysis...", percent: 95 });

  // North Node
  if (northNode) {
    const nnData = northNode.data ?? northNode;
    const nnSign = nnData.sign || nnData.north_node_sign || "";
    const nnHouse = nnData.house || nnData.north_node_house || 0;
    const snSign = nnData.south_node_sign || "";

    if (nnSign) {
      y = sectionHead(y, `North Node in ${nnSign}${nnHouse ? ` \u2014 ${nnHouse}${nnHouse === 1 ? "st" : nnHouse === 2 ? "nd" : nnHouse === 3 ? "rd" : "th"} House` : ""}`);
      const nnInterp = NORTH_NODE_SIGN[nnSign] || "";
      y = body(y, `The North Node represents the soul's growth direction \u2014 the qualities, experiences, and life areas that ${firstName} is meant to develop in this lifetime. ${nnInterp}`);
      if (nnHouse) {
        y = body(y, `In the ${nnHouse}${nnHouse === 1 ? "st" : nnHouse === 2 ? "nd" : nnHouse === 3 ? "rd" : "th"} House of ${HOUSE_DOMAIN[nnHouse] || "life experience"}, the soul's growth is specifically channeled through this life domain. This is where ${firstName} must actively build new skills and embrace unfamiliar territory.`);
      }
    }

    if (snSign) {
      y = sectionHead(y, `South Node in ${snSign} \u2014 Past Patterns`);
      y = body(y, `The South Node in ${snSign} represents the comfort zone \u2014 skills, talents, and patterns brought from the past. These are ${firstName}'s natural gifts, but over-reliance on them prevents growth. The challenge is to honor these abilities while consciously developing the opposite North Node qualities.`);
    }

    if (nnData.interpretation || nnData.description) {
      y = body(y, typeof nnData.interpretation === "string" ? nnData.interpretation : typeof nnData.description === "string" ? nnData.description : "");
    }
  }

  y = divider(y);

  // 12th House
  const h12 = houses.find((h: any) => (h.number || h.house) === 12);
  const h12Sign = h12?.sign || "";
  if (h12Sign) {
    y = sectionHead(y, `12th House in ${h12Sign} \u2014 The Hidden Self`);
    const h12Interp = TWELFTH_HOUSE_SIGN[h12Sign] || "";
    y = body(y, `The 12th house governs the unconscious, spirituality, hidden matters, and the dissolution of ego. With ${h12Sign} on the cusp: ${h12Interp}`);

    const planetsIn12 = mainPlanets.filter(p => posMap[p]?.house === 12);
    if (planetsIn12.length > 0) {
      y = body(y, `Planets in the 12th house: ${planetsIn12.join(", ")}. Each adds spiritual significance:`);
      for (const p of planetsIn12) {
        y = bullet(y, `${p} in the 12th: ${p === "Sun" ? "The identity operates behind the scenes. Great spiritual power, but visibility may be challenging." : p === "Moon" ? "Deep psychic sensitivity. The emotional world is vast, private, and spiritually oriented." : p === "Neptune" ? "Neptune in its natural house amplifies intuition, dreams, and spiritual perception to extraordinary levels." : p === "Pluto" ? "Powerful transformative energy operating from the unconscious. Crisis becomes spiritual initiation." : `${p} brings its energy into the spiritual dimension of life.`}`);
      }
    }
  }

  // Chiron
  if (chiron) {
    const chData = chiron.data ?? chiron;
    const chSign = chData.sign || chData.chiron_sign || "";
    const chHouse = chData.house || chData.chiron_house || 0;
    y = sectionHead(y, `${GLYPH.Chiron || "\u26B7"} Chiron in ${chSign}${chHouse ? ` \u2014 ${chHouse}${chHouse === 1 ? "st" : chHouse === 2 ? "nd" : chHouse === 3 ? "rd" : "th"} House` : ""}`);
    y = body(y, `Chiron represents the \"wounded healer\" \u2014 the area of deepest vulnerability that, once confronted and integrated, becomes ${firstName}'s greatest gift for helping others. ${chData.interpretation || chData.description || `In ${chSign}, the wound relates to ${SIGN_ELEMENT[chSign] === "Fire" ? "identity, confidence, and the right to exist fully" : SIGN_ELEMENT[chSign] === "Earth" ? "material security, the body, and the right to have" : SIGN_ELEMENT[chSign] === "Air" ? "communication, intellect, and the right to be heard" : "emotional safety, intimacy, and the right to feel"}.`}`);
  }

  // Neptune aspects
  const neptuneInfo = posMap["Neptune"];
  if (neptuneInfo) {
    y = sectionHead(y, `${GLYPH.Neptune} Neptune in ${neptuneInfo.sign} \u2014 Mystical Connection`);
    y = body(y, `Neptune in ${neptuneInfo.sign} in the ${neptuneInfo.house}${neptuneInfo.house === 1 ? "st" : neptuneInfo.house === 2 ? "nd" : neptuneInfo.house === 3 ? "rd" : "th"} House connects ${firstName} to the transcendent through the domain of ${HOUSE_DOMAIN[neptuneInfo.house] || "experience"}. This is where reality becomes fluid, imagination soars, and the boundary between self and other dissolves.`);
  }

  // LLM-enhanced spiritual narrative
  const nnDataSpir = northNode?.data ?? northNode;
  const chironDataSpir = chiron?.data ?? chiron;
  const llmSpiritCtx = `North Node: ${nnDataSpir?.sign || "?"} H${nnDataSpir?.house || "?"}, Chiron: ${chironDataSpir?.sign || "?"} H${chironDataSpir?.house || "?"}, 12th house: ${h12Sign}, Neptune: ${neptuneInfo?.sign || "?"} H${neptuneInfo?.house || "?"}`;
  const llmSpirit = await llmGenerate(`Write a 300-word spiritual and karmic path reading for ${firstName}. Cover North Node soul direction, Chiron wound-to-gift journey, 12th house hidden self, and Neptune mystical connection.`, llmSpiritCtx);
  if (llmSpirit) {
    y = divider(y);
    y = sectionHead(y, "Spiritual Path Synthesis");
    const spiritLines = doc.splitTextToSize(llmSpirit, CW);
    for (const line of spiritLines) { y = body(y, line); }
  }

  // =======================================================================
  // CHAPTER XX: CROSS-SYSTEM SYNTHESIS
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "XX", "Cross-System Synthesis", "The Unified Portrait");

  onProgress?.({ stage: "Weaving the unified portrait...", percent: 97 });

  y = body(y, `When all systems are overlaid \u2014 Western tropical astrology, Hellenistic techniques, Vedic sidereal astrology, BaZi Chinese astrology, Human Design, numerology, and multiple personality frameworks \u2014 a unified portrait emerges that no single system could produce alone. The convergences are not coincidental; they reveal the same soul architecture viewed through different cultural and mathematical lenses.`);

  // Theme 1: Core Identity
  y = sectionHead(y, "1. The Core Identity Across Systems");
  y = body(y, `Every system in ${firstName}'s reading confirms a consistent core: ${sunSign} Sun in the ${sunHouseFixed}${sunHouseFixed === 1 ? "st" : sunHouseFixed === 2 ? "nd" : sunHouseFixed === 3 ? "rd" : "th"} House provides the Western anchor. The ${SIGN_ELEMENT[sunSign]} element echoes through the Life Path ${lpSum} numerological signature. The MBTI type ${mbtiType} reinforces the cognitive style suggested by the natal Mercury in ${posMap["Mercury"]?.sign || "its sign"}, and the Enneagram ${enneagram?.data?.type || enneagram?.type ? `Type ${(enneagram.data ?? enneagram).type}` : "type"} reveals the motivational engine beneath the surface.`);
  y = body(y, `${hdData?.type ? `Human Design adds the ${hdData.type} type \u2014 ${hdData.type === "Generator" || hdData.type === "Manifesting Generator" ? "confirming a life designed around sustained, responsive energy" : hdData.type === "Projector" ? "indicating a life designed for guiding others through invitation" : hdData.type === "Manifestor" ? "confirming a life designed for initiation and impact" : "revealing a unique role in the community"}.` : ""} ${dayMaster ? `BaZi's ${dayMaster} Day Master provides the Chinese anchor, confirming the elemental core through an entirely independent system.` : ""}`);

  // Theme 2: Emotional Architecture
  y = sectionHead(y, "2. The Emotional Architecture");
  y = body(y, `${firstName}'s ${moonSign} Moon in the ${moonHouseFixed}${moonHouseFixed === 1 ? "st" : moonHouseFixed === 2 ? "nd" : moonHouseFixed === 3 ? "rd" : "th"} House defines the emotional core. ${vedic ? `The Vedic chart${(vedic.data ?? vedic).positions?.Moon?.nakshatra ? ` places the Moon in ${(vedic.data ?? vedic).positions.Moon.nakshatra} nakshatra, adding` : " adds"} a karmic dimension to the emotional landscape.` : ""} The ${SIGN_ELEMENT[moonSign]} emotional nature ${SIGN_ELEMENT[moonSign] === SIGN_ELEMENT[sunSign] ? `harmonizes naturally with the ${SIGN_ELEMENT[sunSign]} Sun, creating internal consistency` : `contrasts productively with the ${SIGN_ELEMENT[sunSign]} Sun, creating a rich inner dialogue between different modes of being`}.`);

  // Theme 3: Western x Vedic
  y = sectionHead(y, "3. Western \u00d7 Vedic Comparison");
  if (vedic) {
    const vData = vedic.data ?? vedic;
    const vSunSign = vData.positions?.Sun?.sign || vData.positions?.sun?.sign || "";
    y = body(y, `The tropical (Western) Sun is in ${sunSign}, while the sidereal (Vedic) Sun sits in ${vSunSign || "a different rashi"}. ${vSunSign === sunSign ? "Remarkably, both systems agree on the Sun sign \u2014 this strengthens the core identity reading considerably." : `This shift from ${sunSign} to ${vSunSign || "the sidereal position"} reveals complementary dimensions: the tropical chart shows ${firstName}'s psychological identity, while the sidereal chart reveals the karmic and soul-level expression.`}`);
  }

  // Theme 4: Element mapping across systems
  y = sectionHead(y, "4. Element Mapping Across Systems");
  y = body(y, `Western astrology counts ${domElement ? `${domElement[1]} planets in ${domElement[0]} (dominant)` : "an even distribution"}, while Chinese metaphysics maps through Wood, Fire, Earth, Metal, and Water. ${dayMaster ? `The ${dayMaster} Day Master${dayMaster.includes("Wood") ? " aligns with Air/Fire energy in Western terms" : dayMaster.includes("Fire") ? " directly echoes the Western Fire element" : dayMaster.includes("Earth") ? " directly echoes the Western Earth element" : dayMaster.includes("Metal") ? " corresponds to Air energy in Western terms" : dayMaster.includes("Water") ? " directly echoes the Western Water element" : " adds its own elemental signature"}.` : ""}`);

  // Convergence themes
  if (convergence) {
    const cData = convergence.data ?? convergence;
    const themes = cData.themes || cData.convergence_themes || cData;
    y = sectionHead(y, "5. Convergence Themes");
    if (typeof themes === "object" && !Array.isArray(themes)) {
      for (const [key, val] of Object.entries(themes)) {
        if (typeof val === "number") y = bullet(y, `${key}: ${Math.round(val * 100)}%`);
        else if (typeof val === "string") y = bullet(y, `${key}: ${val}`);
      }
    } else if (Array.isArray(themes)) {
      for (const t of themes.slice(0, 6)) {
        y = bullet(y, typeof t === "string" ? t : `${t.theme || t.name || ""}: ${t.description || ""}`);
      }
    }
  }

  // Cross-pollination
  if (crossPollination) {
    const cpData = crossPollination.data ?? crossPollination;
    y = sectionHead(y, "6. Cross-System Pollination");
    const cpThemes = cpData.insights || cpData.cross_pollination || cpData.themes || cpData;
    if (typeof cpThemes === "object" && !Array.isArray(cpThemes)) {
      for (const [key, val] of Object.entries(cpThemes)) {
        if (typeof val === "string") y = bullet(y, `${key}: ${val}`);
      }
    } else if (Array.isArray(cpThemes)) {
      for (const t of cpThemes.slice(0, 6)) {
        y = bullet(y, typeof t === "string" ? t : `${t.systems || t.name || ""}: ${t.insight || t.description || ""}`);
      }
    }
  }

  // Dynamic personality
  if (dynamicPersonality) {
    const dp = dynamicPersonality.data ?? dynamicPersonality;
    y = sectionHead(y, "7. Dynamic State (Current)");
    if (dp.dominant_traits) {
      const traits = Array.isArray(dp.dominant_traits) ? dp.dominant_traits.map((t: any) => typeof t === "string" ? t : t.trait || t.name).join(", ") : String(dp.dominant_traits);
      y = body(y, `Current dominant traits: ${traits}. ${dp.shadow_traits ? `Shadow: ${Array.isArray(dp.shadow_traits) ? dp.shadow_traits.map((t: any) => typeof t === "string" ? t : t.trait || t.name).join(", ") : dp.shadow_traits}.` : ""}`);
    }
    if (dp.current_mood) y = body(y, `Current energetic mood: ${dp.current_mood}. ${dp.energy_level ? `Energy level: ${dp.energy_level}.` : ""}`);
  }

  // Life Purpose Synthesis
  y = sectionHead(y, "8. Life Purpose Synthesis");
  y = body(y, `Drawing from all systems, ${firstName}'s life purpose converges around several key themes:`);
  const nnData = northNode?.data ?? northNode;
  const nnSign = nnData?.sign || nnData?.north_node_sign || "";
  y = bullet(y, `Western: ${sunSign} Sun in House ${sunHouseFixed} \u2014 identity expressed through ${HOUSE_DOMAIN[sunHouseFixed] || "this life domain"}`);
  if (nnSign) y = bullet(y, `Karmic: North Node in ${nnSign} \u2014 soul growth through ${NORTH_NODE_SIGN[nnSign]?.split(".")[0] || "new territory"}`);
  if (hdData?.type) y = bullet(y, `Human Design: ${hdData.type} \u2014 ${hdData.type === "Generator" ? "responding to what lights up" : hdData.type === "Manifesting Generator" ? "multi-passionate responding and informing" : hdData.type === "Projector" ? "waiting for invitations to guide" : hdData.type === "Manifestor" ? "initiating and informing" : "reflecting community health"}`);
  y = bullet(y, `Numerology: Life Path ${lpSum} \u2014 ${lpSum === 1 ? "independent creation" : lpSum === 2 ? "cooperative partnership" : lpSum === 3 ? "creative expression" : lpSum === 4 ? "building foundations" : lpSum === 5 ? "transformative freedom" : lpSum === 6 ? "harmonious service" : lpSum === 7 ? "truth-seeking" : lpSum === 8 ? "material mastery" : lpSum === 9 ? "humanitarian completion" : "spiritual illumination"}`);
  if (dayMaster) y = bullet(y, `BaZi: ${dayMaster} Day Master \u2014 core element shaping life approach`);

  // Core dynamic callout
  y = calloutBox(y,
    "* The Core Dynamic",
    `${firstName}'s chart is the story of a ${SIGN_ELEMENT[sunSign]} ${sunSign} identity channeled through ${moonSign} emotional intelligence, presented to the world through ${ascSign}'s lens. The ${mbtiType} cognitive style provides the mental framework, while Life Path ${lpSum} defines the overarching journey. ${domElement ? `The ${domElement[0]}-dominant element balance (${domElement[1]} planets) creates a consistent energetic signature` : "The elemental balance shapes the overall temperament"} that every system independently confirms. ${hdData?.type ? `Human Design's ${hdData.type} type adds the strategic layer of how to navigate life most correctly.` : ""} This is a chart of ${SIGN_ELEMENT[sunSign] === "Fire" ? "passionate initiative and creative courage" : SIGN_ELEMENT[sunSign] === "Earth" ? "practical mastery and enduring value" : SIGN_ELEMENT[sunSign] === "Air" ? "intellectual brilliance and connective vision" : "emotional depth and transformative compassion"}.`,
  );

  // LLM-enhanced cross-system synthesis
  onProgress?.({ stage: "Generating AI unified portrait...", percent: 97 });
  const llmSynthCtx = `Sun: ${sunSign} H${sunHouseFixed}, Moon: ${moonSign} H${moonHouseFixed}, ASC: ${ascSign}, MBTI: ${mbtiType}, LP: ${lpSum}, HD: ${hdData?.type || "?"}, BaZi: ${dayMaster || "?"}, Vedic Sun: ${vSunSignLlm || "?"}, Enneagram: ${(enneagram?.data ?? enneagram)?.type || "?"}, elements: Fire=${elemCount.Fire} Earth=${elemCount.Earth} Air=${elemCount.Air} Water=${elemCount.Water}`;
  const llmSynth = await llmGenerate(`Write a 500-word unified portrait synthesizing Western, Vedic, BaZi, Human Design, and personality system findings for ${firstName}. Reference specific placements. Create a cohesive narrative showing how all systems confirm the same core identity.`, llmSynthCtx);
  if (llmSynth) {
    y = divider(y);
    y = sectionHead(y, "9. Unified Portrait");
    const synthLines = doc.splitTextToSize(llmSynth, CW);
    for (const line of synthLines) { y = body(y, line); }
  }

  // =======================================================================
  // APPENDIX: DATA TABLES
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "", "Appendix", "Data Tables & Reference");

  onProgress?.({ stage: "Compiling appendix...", percent: 98 });

  // Full positions table
  y = sectionHead(y, "Full Planetary Positions");
  const fullPosRows: string[][] = [];
  for (const [p, info] of Object.entries(posMap)) {
    const retro = info.retrograde ? " R" : "";
    fullPosRows.push([
      `${GLYPH[p] || ""} ${p}`,
      info.sign,
      `${info.degree.toFixed(2)}\u00b0${retro}`,
      info.house ? String(info.house) : "-",
      `${info.longitude.toFixed(4)}\u00b0`,
    ]);
  }
  y = styledTable(y, ["Planet", "Sign", "Degree", "House", "Longitude"], fullPosRows);

  // Full aspects table
  y = sectionHead(y, "Full Aspect Table");
  const fullAspRows: string[][] = [];
  const sortedAspects = [...aspects].sort((a: any, b: any) => Number(a.orb ?? 99) - Number(b.orb ?? 99)).slice(0, 20);
  for (const a of sortedAspects) {
    const p1 = a.planet1 || a.p1 || "";
    const p2 = a.planet2 || a.p2 || "";
    const type = a.aspect || a.type || "";
    const orb = Number(a.orb ?? 0).toFixed(2);
    fullAspRows.push([`${GLYPH[p1] || p1}`, type, `${GLYPH[p2] || p2}`, `${orb}\u00b0`]);
  }
  if (fullAspRows.length > 0) y = styledTable(y, ["Planet 1", "Aspect", "Planet 2", "Orb"], fullAspRows);

  // House cusps
  if (houses.length > 0) {
    y = sectionHead(y, "House Cusps");
    const houseRows: string[][] = [];
    for (const h of houses) {
      const num = h.number || h.house || 0;
      houseRows.push([`House ${num}`, h.sign || "-", h.degree != null ? `${Number(h.degree).toFixed(2)}\u00b0` : "-"]);
    }
    y = styledTable(y, ["House", "Sign", "Degree"], houseRows);
  }

  // Color Palette
  if (colorPalette) {
    const cpData = colorPalette.data ?? colorPalette;
    y = sectionHead(y, "Personal Color Palette");
    const colors = cpData.colors || cpData.palette || cpData;
    if (Array.isArray(colors)) {
      for (const c of colors.slice(0, 6)) {
        const name = typeof c === "string" ? c : c.name || c.color || "";
        const meaning = typeof c === "object" ? (c.meaning || c.description || "") : "";
        y = bullet(y, `${name}${meaning ? `: ${meaning}` : ""}`);
      }
    } else if (typeof colors === "object") {
      for (const [key, val] of Object.entries(colors)) {
        y = bullet(y, `${key}: ${typeof val === "string" ? val : (val as any).hex || (val as any).name || JSON.stringify(val)}`);
      }
    }
  }

  // Spirit Animal
  if (spiritAnimal) {
    const sa = spiritAnimal.data ?? spiritAnimal;
    const primary = sa.primary || sa.primary_animal || sa.spirit_animal;
    if (primary) {
      const name = typeof primary === "string" ? primary : primary.animal || primary.name || "";
      y = sectionHead(y, `Spirit Animal: ${name}`);
      const desc = typeof primary === "object" ? (primary.meaning || primary.description) : null;
      if (desc) y = body(y, typeof desc === "string" ? desc : "");
    }
    const secondary = sa.secondary || sa.secondary_animal;
    if (secondary) {
      const sName = typeof secondary === "string" ? secondary : secondary.animal || secondary.name || "";
      y = bullet(y, `Secondary totem: ${sName}`);
    }
    const shadow = sa.shadow || sa.shadow_animal;
    if (shadow) {
      const shName = typeof shadow === "string" ? shadow : shadow.animal || shadow.name || "";
      y = bullet(y, `Shadow totem: ${shName}`);
    }
  }

  // Tarot Birth Cards
  if (tarotCards) {
    const td = tarotCards.data ?? tarotCards;
    y = sectionHead(y, "Birth Tarot Cards");
    const cards = td.cards || td.birth_cards || [];
    if (Array.isArray(cards) && cards.length > 0) {
      for (const card of cards) {
        const cn = typeof card === "string" ? card : card.name || card.card || "";
        const cd = typeof card === "object" ? (card.description || card.meaning || "") : "";
        y = body(y, `${cn}${cd ? ": " + cd : ""}`);
      }
    } else if (td.personality_card) {
      y = body(y, `Personality Card: ${typeof td.personality_card === "string" ? td.personality_card : td.personality_card.name || ""}`);
    }
  }

  // =======================================================================
  // DISCLAIMER PAGE
  // =======================================================================
  newPage();
  y = 25;

  doc.setFontSize(18);
  doc.setFont("times", "bold");
  doc.setTextColor(...GOLD);
  doc.text("DISCLAIMER", W / 2, y, { align: "center" });
  y += 5;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(M + 40, y, W - M - 40, y);
  y += 15;

  doc.setFontSize(10);
  doc.setFont("times", "italic");
  doc.setTextColor(...MUTED);
  const closingLines = doc.splitTextToSize(
    "This reading synthesizes Western tropical astrology, Hellenistic techniques, Vedic sidereal astrology, BaZi Chinese astrology, Human Design, numerology, KP system, Zi Wei Dou Shu, and multiple psychological frameworks across 45 methodology systems. Each system offers a different lens on the same soul. Where the lenses converge, the signal is strongest. Where they diverge, the complexity is richest.",
    CW - 20,
  );
  for (const line of closingLines) {
    y = ensureSpace(y, 5);
    doc.text(line, W / 2, y, { align: "center" });
    y += 5;
  }

  y += 8;
  doc.setFontSize(14);
  doc.setFont("times", "normal");
  doc.setTextColor(...GOLD);
  doc.text("*  *  *", W / 2, y, { align: "center" });

  y += 15;
  doc.setFontSize(9);
  doc.setFont("times", "normal");
  doc.setTextColor(...MUTED);
  const disc = doc.splitTextToSize(
    "This report is generated by ENVI-OUS BRAIN's 90+ calculation engines for informational and entertainment purposes only. Astrology, numerology, and personality systems are symbolic frameworks for self-reflection, not scientifically validated predictive tools. Nothing here constitutes medical, psychological, financial, or legal advice. Always consult qualified professionals for health, relationship, career, and life decisions. The accuracy of this report depends on the accuracy of the birth data provided.",
    CW,
  );
  for (const line of disc) {
    y = ensureSpace(y, 4.5);
    doc.text(line, M, y);
    y += 4.5;
  }

  y += 10;
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`Generated ${new Date().toISOString().split("T")[0]} by ENVI-OUS BRAIN \u00b7 45 Systems \u00b7 27 MoE Experts \u00b7 90+ Engines`, W / 2, y, { align: "center" });

  // =======================================================================
  onProgress?.({ stage: "Complete!", percent: 100 });
  return doc.output("blob");
}
