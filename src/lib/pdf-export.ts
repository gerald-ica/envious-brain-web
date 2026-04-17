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

const GLYPH: Record<string, string> = {
  Sun: "\u2609", Moon: "\u263D", Mercury: "\u263F", Venus: "\u2640",
  Mars: "\u2642", Jupiter: "\u2643", Saturn: "\u2644", Uranus: "\u2645",
  Neptune: "\u2646", Pluto: "\u2647", NorthNode: "\u260A", Chiron: "\u26B7",
  Ascendant: "ASC",
};

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "\u260C", opposition: "\u260D", trine: "\u25B3",
  square: "\u25A1", sextile: "\u2731", quincunx: "Qx",
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
    doc.text("\u25B8", M + 4, y);
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

  const post = async (url: string, body: object): Promise<any> => {
    try {
      const res = await fetch(`${API_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
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

  onProgress?.({ stage: "Composing your natal reading...", percent: 70 });

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

  // Decan helper
  function getDecan(deg: number): number { return deg < 10 ? 1 : deg < 20 ? 2 : 3; }

  // Aspect helpers
  function getAspectsFor(planet: string): any[] {
    return aspects.filter((a: any) =>
      (a.planet1 === planet || a.p1 === planet || a.planet2 === planet || a.p2 === planet)
      && Number(a.orb ?? 99) < 8
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
  doc.text(`\u2609 ${sunSign} Sun ${sunDeg}\u00b0  \u00b7  \u263D ${moonSign} Moon ${moonDeg}\u00b0  \u00b7  ${ascSign} Rising ${ascDeg}\u00b0`, W / 2, 155, { align: "center" });

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
  doc.text("Western \u00b7 Vedic \u00b7 Numerology \u00b7 Chinese \u00b7 Human Design", W / 2, 192, { align: "center" });

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
    ["II", "Vedic Astrology (Jyotish)", "The Sidereal Perspective"],
    ["III", "Health Reading", "The Body-Mind Map"],
    ["IV", "Chinese Astrology (BaZi)", "The Four Pillars of Destiny"],
    ["V", "Personality Synthesis", "The Psychological Portrait"],
    ["VI", "Cosmic Timing", "The Current Sky"],
    ["VII", "Cross-System Synthesis", "The Unified Portrait"],
  ];

  for (const [num, title, sub] of tocEntries) {
    // Card background
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(M, y - 3, CW, 22, 2, 2, "F");
    doc.setFontSize(13);
    doc.setFont("times", "normal");
    doc.setTextColor(...GOLD);
    doc.text(`${num}. ${title}`, M + 8, y + 6);
    doc.setFontSize(9.5);
    doc.setFont("times", "italic");
    doc.setTextColor(...MUTED);
    doc.text(sub, M + 8, y + 14);
    y += 28;
  }

  // =======================================================================
  // CHAPTER I: WESTERN ASTROLOGY
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "I", "Western Astrology", "The Tropical Chart");

  onProgress?.({ stage: "Writing planetary narratives...", percent: 75 });

  // --- SUN ---
  y = planetHead(y, `\u2609 ${sunSign} Sun at ${sunDeg}\u00b0 in the ${sunHouse}${sunHouse === 1 ? "st" : sunHouse === 2 ? "nd" : sunHouse === 3 ? "rd" : "th"} House`);
  y = poeticSub(y, sunTitle(sunSign, sunHouse));

  // Sun narrative: sign + decan + house
  const sunInterp = PLANET_IN_SIGN.Sun?.[sunSign] || "";
  y = body(y, `${firstName}'s Sun at ${sunDeg}\u00b0 ${sunSign} sits ${sunHouse <= 3 ? "in the angular" : sunHouse <= 6 ? "deep in the" : sunHouse <= 9 ? "in the expansive" : "at the peak of the"} ${sunHouse}${sunHouse === 1 ? "st" : sunHouse === 2 ? "nd" : sunHouse === 3 ? "rd" : "th"} House \u2014 the house of ${HOUSE_DOMAIN[sunHouse] || "life experience"}. ${sunInterp}`);

  const decan = getDecan(sunDeg);
  const decanRuler = DECAN_RULER[sunSign]?.[decan - 1] || SIGN_RULER[sunSign];
  y = body(y, `${sunDeg}\u00b0 ${sunSign} falls in the ${decan === 1 ? "first" : decan === 2 ? "second" : "third"} decan, governed by ${decanRuler}${decanRuler !== SIGN_RULER[sunSign] ? ` through sub-rulership, adding a distinctive layer of ${SIGN_ELEMENT[Object.entries(SIGN_RULER).find(([, r]) => r === decanRuler)?.[0] || sunSign] || ""} influence` : ", reinforcing the pure expression of this sign's energy"}. This decanate colors the ${sunSign} core with ${decanRuler === "Venus" ? "aesthetic sensibility and material groundedness" : decanRuler === "Mercury" ? "intellectual sharpness and communicative flair" : decanRuler === "Mars" ? "dynamic energy and competitive drive" : decanRuler === "Jupiter" ? "philosophical breadth and optimism" : decanRuler === "Saturn" ? "structural discipline and long-term vision" : decanRuler === "Sun" ? "pure creative vitality and self-expression" : decanRuler === "Moon" ? "emotional depth and intuitive wisdom" : "innovative and unconventional energy"}.`);

  const sunHouseInterp = PLANET_IN_HOUSE.Sun?.[sunHouse] || "";
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
  y = planetHead(y, `\u263D ${moonSign} Moon at ${moonDeg}\u00b0 in the ${moonHouse}${moonHouse === 1 ? "st" : moonHouse === 2 ? "nd" : moonHouse === 3 ? "rd" : "th"} House`);
  y = poeticSub(y, moonTitle(moonSign));

  const moonInterp = PLANET_IN_SIGN.Moon?.[moonSign] || "";
  y = body(y, `The Moon in ${moonSign} in the ${moonHouse}${moonHouse === 1 ? "st" : moonHouse === 2 ? "nd" : moonHouse === 3 ? "rd" : "th"} House of ${HOUSE_DOMAIN[moonHouse] || "experience"} creates a deep emotional need for ${SIGN_ELEMENT[moonSign] === "Fire" ? "excitement, freedom, and self-expression" : SIGN_ELEMENT[moonSign] === "Earth" ? "stability, comfort, and tangible security" : SIGN_ELEMENT[moonSign] === "Air" ? "intellectual stimulation and social connection" : "emotional depth, intimacy, and creative expression"}. ${firstName} feels most alive when ${moonHouse <= 3 ? "engaging directly with the immediate environment" : moonHouse <= 6 ? "creating, serving, or perfecting a craft" : moonHouse <= 9 ? "connecting deeply with others or exploring the unknown" : "contributing to the larger world"}. ${moonInterp}`);

  const moonHouseInterp = PLANET_IN_HOUSE.Moon?.[moonHouse] || "";
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
    const title = `\u2605 ${aspectName(a)} \u2014 ${tight ? "Near-Exact" : "Significant"} Aspect`;
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

  // ASC aspects
  const ascAspects = aspects.filter((a: any) => {
    const p1 = a.planet1 || a.p1 || "";
    const p2 = a.planet2 || a.p2 || "";
    return (p1 === "Ascendant" || p1 === "ASC" || p2 === "Ascendant" || p2 === "ASC") && Number(a.orb ?? 99) < 6;
  }).sort((a: any, b: any) => Number(a.orb ?? 99) - Number(b.orb ?? 99)).slice(0, 3);

  for (const a of ascAspects) {
    const other = (a.planet1 === "Ascendant" || a.planet1 === "ASC" || a.p1 === "Ascendant" || a.p1 === "ASC") ? (a.planet2 || a.p2) : (a.planet1 || a.p1);
    const type = (a.aspect || a.type || "").toLowerCase();
    const orb = Number(a.orb ?? 0).toFixed(1);
    y = sectionHead(y, `ASC ${type.charAt(0).toUpperCase() + type.slice(1)} ${other} (${orb}\u00b0 orb)`);
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
        `\u2605 ${GLYPH[planet] || planet} ${ASPECT_GLYPH[type] || type} ${GLYPH[other] || other} (${orb}\u00b0)${tight ? " \u2014 " + (Number(a.orb) < 0.5 ? "Essentially EXACT" : "Near-Exact") : ""}`,
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
      info.sign === SIGN_RULER[info.sign] ? "Domicile" : "",
    ];
  }).filter(r => r[1] !== "-");
  y = styledTable(y, ["Planet", "Sign", "Degree", "House", "Significance"], placementRows);

  y = divider(y);

  // --- MAJOR ASPECTS — The Neural Network ---
  y = sectionHead(y, "Major Aspects \u2014 The Neural Network");
  y = body(y, `The aspects between planets form the neural network of the chart \u2014 the wiring that determines how energies communicate. ${firstName}'s chart features ${aspects.filter((a: any) => Number(a.orb ?? 99) < 3).length} tight aspects that define the core nature.`);

  const tightAspects = aspects
    .filter((a: any) => Number(a.orb ?? 99) < 7)
    .sort((a: any, b: any) => Number(a.orb ?? 99) - Number(b.orb ?? 99))
    .slice(0, 8);

  for (const a of tightAspects) {
    const type = (a.aspect || a.type || "").toLowerCase();
    const p1 = a.planet1 || a.p1 || "";
    const p2 = a.planet2 || a.p2 || "";
    const orb = Number(a.orb ?? 0).toFixed(2);
    const isExact = Number(a.orb) < 0.5;
    const title = `${GLYPH[p1] || p1} ${ASPECT_GLYPH[type] || type} ${GLYPH[p2] || p2} (${orb}\u00b0)`;
    const meaning = `${p1} ${type}s ${p2}. ${isExact ? "This is essentially exact \u2014 one of the most powerful configurations in the entire chart. " : ""}${type === "trine" ? `Natural talent flows between ${p1} and ${p2}.` : type === "square" ? `Productive tension between ${p1} and ${p2} drives growth and development.` : type === "opposition" ? `A polarity axis between ${p1} and ${p2} requires conscious integration.` : type === "conjunction" ? `${p1} and ${p2} are fused into a single force.` : `${p1} and ${p2} are linked through ${type} aspect.`}`;
    y = calloutBox(y, title, meaning);
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

  // =======================================================================
  // CHAPTER II: VEDIC ASTROLOGY
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "II", "Vedic Astrology (Jyotish)", "The Sidereal Perspective");

  onProgress?.({ stage: "Writing Vedic analysis...", percent: 80 });

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

  // =======================================================================
  // CHAPTER III: HEALTH READING
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "III", "Health Reading", "The Body-Mind Map");

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

  y = mutedItalic(y, "This health reading uses astrological symbolism for self-reflection. It is not medical advice. Always consult healthcare professionals for health concerns.");

  // =======================================================================
  // CHAPTER IV: CHINESE ASTROLOGY (BAZI)
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "IV", "Chinese Astrology (BaZi)", "The Four Pillars of Destiny");

  y = body(y, `BaZi, literally "eight characters," derives four pillars from the birth data \u2014 each pillar consisting of a Heavenly Stem and an Earthly Branch. These eight characters map the energetic blueprint of a life, encoding elemental relationships, animal archetypes, and temporal dynamics that unfold across decades.`);

  if (baziData) {
    const pillars = baziData.pillars || baziData;
    const pillarKeys = ["year", "month", "day", "hour"];
    const pillarNames = ["Year (Ancestry)", "Month (Career)", "Day (Self)", "Hour (Inner Self)"];
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
    if (pillarRows.some(r => r.slice(1).some(c => c !== "-"))) {
      y = styledTable(y, ["Pillar", "Stem", "Branch", "Element", "Animal"], pillarRows);
    }

    if (dayMaster) {
      y = planetHead(y, `${dayMaster} Day Master`);
      y = body(y, `The Day Master represents ${firstName}'s core self in BaZi. As a ${dayMaster} Day Master, ${firstName} embodies the qualities of this element \u2014 it is the lens through which all other chart dynamics are interpreted.`);
    }

    // Element balance
    const elemBal = baziData.element_balance || baziData.elements || {};
    if (Object.keys(elemBal).length > 0) {
      y = sectionHead(y, "Elemental Analysis");
      const ebRows: string[][] = [];
      for (const [elem, val] of Object.entries(elemBal)) {
        ebRows.push([elem, String(val)]);
      }
      y = styledTable(y, ["Element", "Strength"], ebRows);
    }
  } else {
    y = body(y, "BaZi chart data was not available for this profile.");
  }

  // =======================================================================
  // CHAPTER V: PERSONALITY SYNTHESIS
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "V", "Personality Synthesis", "The Psychological Portrait");

  onProgress?.({ stage: "Weaving personality portrait...", percent: 85 });

  // MBTI
  y = sectionHead(y, `MBTI: ${mbtiType}`);
  if (synthData) {
    const sd = synthData.data ?? synthData;
    if (sd.dominant_function) y = body(y, `Dominant cognitive function: ${sd.dominant_function}. ${sd.auxiliary_function ? `Auxiliary: ${sd.auxiliary_function}.` : ""}`);
    if (sd.narrative_summary) y = body(y, sd.narrative_summary);
  } else {
    y = body(y, `Based on the natal chart, ${firstName}'s derived MBTI type is ${mbtiType}. This suggests a cognitive style oriented toward ${mbtiType.includes("N") ? "pattern recognition and abstract possibilities" : "concrete facts and practical realities"}, with decisions filtered through ${mbtiType.includes("F") ? "personal values and empathy" : "logical analysis and objectivity"}.`);
  }

  // Enneagram
  if (enneagram) {
    const ed = enneagram.data ?? enneagram;
    y = sectionHead(y, `Enneagram: Type ${ed.type || ""}${ed.name ? ` \u2014 ${ed.name}` : ""}`);
    if (ed.core_fear) y = body(y, `Core Fear: ${ed.core_fear}. Core Desire: ${ed.core_desire || "N/A"}.`);
    if (ed.description) y = body(y, ed.description);
  }

  // Archetypes
  if (archetypes) {
    const ad = archetypes.data ?? archetypes;
    const primary = ad.primary_archetype || ad.primary;
    const secondary = ad.secondary_archetype || ad.secondary;
    const shadow = ad.shadow_archetype || ad.shadow;
    y = sectionHead(y, "Jungian Archetypes");
    if (primary) {
      const pn = typeof primary === "string" ? primary : primary.name || JSON.stringify(primary);
      y = body(y, `Primary: ${pn}. ${typeof primary === "object" && primary.description ? primary.description : `This archetype represents ${firstName}'s dominant pattern of behavior and motivation.`}`);
    }
    if (secondary) {
      const sn = typeof secondary === "string" ? secondary : secondary.name || "";
      y = body(y, `Secondary: ${sn}. Shadow: ${shadow ? (typeof shadow === "string" ? shadow : shadow.name || "") : "N/A"}.`);
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
      if (desc) y = body(y, desc);
    }
  }

  // Tarot
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

  // Life path
  y = sectionHead(y, "Life Path Number");
  const digits = profile.birthDate.replace(/-/g, "").split("").map(Number);
  let lpSum = digits.reduce((a, b) => a + b, 0);
  while (lpSum > 9 && lpSum !== 11 && lpSum !== 22 && lpSum !== 33) {
    lpSum = String(lpSum).split("").map(Number).reduce((a, b) => a + b, 0);
  }
  y = body(y, `Life Path ${lpSum} \u2014 ${lpSum === 1 ? "The Independent Leader" : lpSum === 2 ? "The Diplomat & Partner" : lpSum === 3 ? "The Creative Communicator" : lpSum === 4 ? "The Master Builder" : lpSum === 5 ? "The Freedom Seeker" : lpSum === 6 ? "The Nurturing Harmonizer" : lpSum === 7 ? "The Seeker of Truth" : lpSum === 8 ? "The Material Master" : lpSum === 9 ? "The Humanitarian" : lpSum === 11 ? "The Master Visionary" : lpSum === 22 ? "The Master Builder" : "The Master Teacher"}. ${firstName}'s life path organizes the entire journey around ${lpSum === 1 ? "independence, initiative, and original creation" : lpSum === 2 ? "cooperation, sensitivity, and partnership" : lpSum === 3 ? "creative expression, joy, and communication" : lpSum === 4 ? "structure, discipline, and lasting foundations" : lpSum === 5 ? "freedom, adventure, and transformative experience" : lpSum === 6 ? "responsibility, beauty, and harmonious service" : lpSum === 7 ? "research, analysis, introspection, and spiritual understanding" : lpSum === 8 ? "ambition, power, and material mastery" : lpSum === 9 ? "compassion, completion, and humanitarian service" : "visionary insight and spiritual illumination"}.`);

  // =======================================================================
  // CHAPTER VI: COSMIC TIMING
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "VI", "Cosmic Timing", "The Current Sky");

  onProgress?.({ stage: "Mapping cosmic timing...", percent: 90 });

  // Transits
  if (transits) {
    y = sectionHead(y, "Current Transits");
    const trData = transits.data ?? transits;
    const trList: any[] = (trData.transits || trData.aspects || []).slice(0, 10);
    if (trList.length > 0) {
      const trRows = trList.map((t: any) => [
        t.transiting_planet || t.planet || "-",
        t.aspect || t.type || "-",
        t.natal_planet || t.natal || "-",
        t.orb != null ? `${Number(t.orb).toFixed(1)}\u00b0` : "-",
      ]);
      y = styledTable(y, ["Transit", "Aspect", "Natal", "Orb"], trRows);
    }
  }

  // Solar Return
  if (solarReturn) {
    y = sectionHead(y, `Solar Return ${new Date().getFullYear()}`);
    y = body(y, `The Solar Return chart for ${new Date().getFullYear()} reveals the themes from ${firstName}'s birthday this year to the next.`);
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
    y = body(y, `Secondary progressions advance the natal chart by one day for each year of life, revealing slow inner evolution. ${firstName}'s progressed chart shows:`);
    if (Object.keys(prPos).length > 0) {
      const prRows: string[][] = [];
      for (const [planet, info] of Object.entries(prPos)) {
        const pd = info as any;
        prRows.push([planet, pd.sign || "-", pd.degree != null ? `${Number(pd.degree).toFixed(1)}\u00b0` : "-"]);
      }
      y = styledTable(y, ["Planet", "Progressed Sign", "Degree"], prRows.slice(0, 8));
    }
  }

  // Profection
  if (profection) {
    const pfData = profection.data ?? profection;
    y = sectionHead(y, "Annual Profection");
    if (pfData.profected_sign || pfData.sign) y = body(y, `Profected Sign: ${pfData.profected_sign || pfData.sign}. ${pfData.lord_of_year || pfData.time_lord ? `Lord of the Year: ${pfData.lord_of_year || pfData.time_lord}.` : ""} Annual profections assign a house to each year of life, activating its themes and ruler.`);
  }

  // Sect
  if (sect) {
    const secData = sect.data ?? sect;
    if (secData.sect) {
      y = sectionHead(y, "Chart Sect");
      y = body(y, `This is a ${secData.sect} chart. The sect benefic (${secData.benefic || "supportive planet"}) works most easily for ${firstName}. The sect malefic (${secData.malefic || "challenging planet"}) requires more conscious navigation.`);
    }
  }

  // =======================================================================
  // CHAPTER VII: CROSS-SYSTEM SYNTHESIS
  // =======================================================================
  newPage();
  y = 25;
  y = chapterTitle(y, "VII", "Cross-System Synthesis", "The Unified Portrait");

  onProgress?.({ stage: "Weaving the unified portrait...", percent: 95 });

  y = body(y, `When all systems are overlaid \u2014 Western tropical astrology, Vedic sidereal astrology, BaZi Chinese astrology, numerology, and personality frameworks \u2014 a unified portrait emerges. The convergences are not coincidental; they reveal the same soul architecture viewed through different lenses.`);

  // Theme 1
  y = sectionHead(y, "1. The Core Identity");
  y = body(y, `Every system in ${firstName}'s reading confirms a consistent core: ${sunSign} Sun in the ${sunHouse}${sunHouse === 1 ? "st" : sunHouse === 2 ? "nd" : sunHouse === 3 ? "rd" : "th"} House provides the Western anchor, while the ${SIGN_ELEMENT[sunSign]} element echoes through the Life Path ${lpSum} numerological signature. The MBTI type ${mbtiType} reinforces the cognitive style suggested by the natal Mercury, and the Enneagram ${enneagram?.data?.type || enneagram?.type ? `Type ${enneagram.data?.type || enneagram.type}` : "type"} reveals the motivational engine beneath the surface.`);

  // Theme 2
  y = sectionHead(y, "2. The Emotional Architecture");
  y = body(y, `${firstName}'s ${moonSign} Moon in the ${moonHouse}${moonHouse === 1 ? "st" : moonHouse === 2 ? "nd" : moonHouse === 3 ? "rd" : "th"} House defines the emotional core. ${vedic ? `The Vedic chart${(vedic.data ?? vedic).positions?.Moon?.nakshatra ? ` places the Moon in ${(vedic.data ?? vedic).positions.Moon.nakshatra} nakshatra, adding` : " adds"} a karmic dimension to the emotional landscape.` : ""} The ${SIGN_ELEMENT[moonSign]} emotional nature ${SIGN_ELEMENT[moonSign] === SIGN_ELEMENT[sunSign] ? `harmonizes naturally with the ${SIGN_ELEMENT[sunSign]} Sun, creating internal consistency` : `contrasts productively with the ${SIGN_ELEMENT[sunSign]} Sun, creating a rich inner dialogue between different modes of being`}.`);

  // Convergence themes
  if (convergence) {
    const cData = convergence.data ?? convergence;
    const themes = cData.themes || cData.convergence_themes || cData;
    if (typeof themes === "object" && !Array.isArray(themes)) {
      y = sectionHead(y, "3. Convergence Themes");
      for (const [key, val] of Object.entries(themes)) {
        if (typeof val === "number") {
          y = bullet(y, `${key}: ${Math.round(val * 100)}%`);
        } else if (typeof val === "string") {
          y = bullet(y, `${key}: ${val}`);
        }
      }
    } else if (Array.isArray(themes)) {
      y = sectionHead(y, "3. Convergence Themes");
      for (const t of themes.slice(0, 6)) {
        const text = typeof t === "string" ? t : `${t.theme || t.name || ""}: ${t.description || ""}`;
        y = bullet(y, text);
      }
    }
  }

  // Dynamic personality
  if (dynamicPersonality) {
    const dp = dynamicPersonality.data ?? dynamicPersonality;
    y = sectionHead(y, "4. Dynamic State (Current)");
    if (dp.dominant_traits) {
      const traits = Array.isArray(dp.dominant_traits) ? dp.dominant_traits.map((t: any) => typeof t === "string" ? t : t.trait || t.name).join(", ") : String(dp.dominant_traits);
      y = body(y, `Current dominant traits: ${traits}. ${dp.shadow_traits ? `Shadow: ${Array.isArray(dp.shadow_traits) ? dp.shadow_traits.map((t: any) => typeof t === "string" ? t : t.trait || t.name).join(", ") : dp.shadow_traits}.` : ""}`);
    }
    if (dp.current_mood) y = body(y, `Current energetic mood: ${dp.current_mood}. ${dp.energy_level ? `Energy level: ${dp.energy_level}.` : ""}`);
  }

  // Core dynamic callout
  y = calloutBox(y,
    `\u2605 The Core Dynamic`,
    `${firstName}'s chart is the story of a ${SIGN_ELEMENT[sunSign]} ${sunSign} identity channeled through ${moonSign} emotional intelligence, presented to the world through ${ascSign}'s lens. The ${mbtiType} cognitive style provides the mental framework, while Life Path ${lpSum} defines the overarching journey. ${domElement ? `The ${domElement[0]}-dominant element balance (${domElement[1]} planets) creates a consistent energetic signature` : "The elemental balance shapes the overall temperament"} that every system independently confirms.`,
  );

  // =======================================================================
  // CLOSING PAGE
  // =======================================================================
  y = divider(y);

  y = ensureSpace(y, 60);
  doc.setFontSize(10);
  doc.setFont("times", "italic");
  doc.setTextColor(...MUTED);
  const closingLines = doc.splitTextToSize(
    "This reading synthesizes Western tropical astrology, Vedic sidereal astrology, BaZi Chinese astrology, numerology, and psychological frameworks. Each system offers a different lens on the same soul. Where the lenses converge, the signal is strongest. Where they diverge, the complexity is richest.",
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
  doc.text("\u2605  \u2605  \u2605", W / 2, y, { align: "center" });

  y += 15;
  doc.setFontSize(9);
  doc.setFont("times", "normal");
  doc.setTextColor(...MUTED);
  const disc = doc.splitTextToSize(
    "This report is generated for informational and entertainment purposes only. Astrology, numerology, and personality systems are symbolic frameworks for self-reflection, not scientifically validated predictive tools. Nothing here constitutes medical, psychological, or financial advice. Consult qualified professionals for health and life decisions.",
    CW,
  );
  for (const line of disc) {
    y = ensureSpace(y, 4.5);
    doc.text(line, M, y);
    y += 4.5;
  }

  y += 5;
  doc.setFontSize(8);
  doc.text(`Generated ${new Date().toISOString().split("T")[0]} by ENVI-OUS BRAIN`, W / 2, y, { align: "center" });

  // =======================================================================
  onProgress?.({ stage: "Complete!", percent: 100 });
  return doc.output("blob");
}
