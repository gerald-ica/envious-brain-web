"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---- Tarot Data ----

interface TarotCard {
  number: number | string;
  name: string;
  arcana: "Major" | "Minor";
  suit?: string;
  reversed: boolean;
  upright: string;
  reversedMeaning: string;
  description: string;
  symbols: string;
}

const MAJOR_ARCANA: Omit<TarotCard, "reversed">[] = [
  {
    number: 0,
    name: "The Fool",
    arcana: "Major",
    upright: "New beginnings, innocence, spontaneity, free spirit",
    reversedMeaning: "Recklessness, taken advantage of, inconsideration",
    description:
      "The Fool stands at the edge of a cliff, gazing upward with trust and wonder. A small white dog accompanies them -- instinct and loyalty. This card speaks of the leap of faith required to begin any meaningful journey.",
    symbols: "Cliff edge, white rose, small dog, distant mountains",
  },
  {
    number: "IX",
    name: "The Hermit",
    arcana: "Major",
    upright: "Soul-searching, introspection, inner guidance, solitude",
    reversedMeaning: "Isolation, loneliness, withdrawal, lost direction",
    description:
      "The Hermit stands atop a mountain, holding a lantern containing a six-pointed star. Having achieved spiritual wisdom through solitude, the Hermit now illuminates the path for others. This card calls you inward.",
    symbols: "Mountain peak, lantern, star of David, grey cloak",
  },
  {
    number: "XVI",
    name: "The Tower",
    arcana: "Major",
    upright: "Sudden upheaval, broken pride, disaster, revelation",
    reversedMeaning: "Fear of change, averting disaster, delaying the inevitable",
    description:
      "Lightning strikes a tall tower built on false foundations. Two figures fall from the structure as flames erupt from the crown. The Tower destroys what was built on illusion so truth can emerge from the rubble.",
    symbols: "Lightning bolt, falling figures, crown displaced, 22 flames",
  },
  {
    number: "XVIII",
    name: "The Moon",
    arcana: "Major",
    upright: "Illusion, fear, anxiety, subconscious, intuition",
    reversedMeaning: "Release of fear, repressed emotion, inner confusion",
    description:
      "A full moon illuminates a path between two towers, flanked by a dog and a wolf -- the tame and the wild. A crayfish emerges from the waters of the unconscious. Nothing is as it seems under the Moon's light.",
    symbols: "Full moon, two towers, dog and wolf, crayfish, winding path",
  },
  {
    number: "XII",
    name: "The Hanged Man",
    arcana: "Major",
    upright: "Surrender, letting go, new perspective, sacrifice",
    reversedMeaning: "Delays, resistance, stalling, indecision",
    description:
      "A figure hangs upside-down from a living tree, suspended by one foot. Rather than suffering, the expression is serene -- a halo of illumination surrounds the head. Voluntary sacrifice brings enlightenment through a radical shift in perspective.",
    symbols: "Living tree, inverted figure, halo, crossed leg forming the number 4",
  },
  {
    number: "XIV",
    name: "Temperance",
    arcana: "Major",
    upright: "Balance, moderation, patience, purpose, meaning",
    reversedMeaning: "Imbalance, excess, self-healing, re-alignment",
    description:
      "An angel pours water between two cups, one foot on land, one in the stream. The path behind leads to a golden crown on the horizon. Temperance is the art of patient alchemy -- combining elements in perfect proportion.",
    symbols: "Angel wings, two cups, one foot in water, triangle on chest, iris flowers",
  },
  {
    number: "XXI",
    name: "The World",
    arcana: "Major",
    upright: "Completion, integration, accomplishment, wholeness, travel",
    reversedMeaning: "Seeking closure, short-cuts, delays, incompletion",
    description:
      "A dancer floats within a great wreath, surrounded by four figures representing the fixed signs. Two wands are held -- one in each hand -- signifying mastery of the material and spiritual realms. The cycle is complete.",
    symbols: "Laurel wreath, four fixed signs, two wands, dancing figure",
  },
  {
    number: "I",
    name: "The Magician",
    arcana: "Major",
    upright: "Manifestation, resourcefulness, power, inspired action",
    reversedMeaning: "Manipulation, poor planning, untapped talents",
    description:
      "The Magician stands before an altar bearing the symbols of all four suits. One hand points to the sky, the other to the earth -- as above, so below. The infinity symbol floats above, indicating limitless potential channeled through will.",
    symbols: "Infinity symbol, four suit objects, red roses, white lilies",
  },
];

function drawCards(): TarotCard[] {
  const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((card) => ({
    ...card,
    reversed: Math.random() > 0.65,
  }));
}

const POSITIONS = ["Past", "Present", "Future"] as const;
const POSITION_DESCRIPTIONS = [
  "Influences and events that have shaped the current situation",
  "The energy and circumstances surrounding you right now",
  "The trajectory and potential outcome based on current energies",
];

// ---- Card Back Design Component ----

function CardBack({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full max-w-[200px] aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent-purple/20"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #312e81 75%, #1e1b4b 100%)",
        }}
      />
      {/* Border pattern */}
      <div className="absolute inset-1 rounded-lg border border-accent-purple/30" />
      <div className="absolute inset-3 rounded-md border border-accent-purple/20" />
      {/* Central symbol */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl text-accent-purple/50 mb-1">{"\u2726"}</div>
        <div className="text-[10px] text-accent-purple/40 tracking-widest uppercase">
          {label}
        </div>
        {/* Corner stars */}
        <div className="absolute top-4 left-4 text-accent-purple/30 text-xs">
          {"\u2605"}
        </div>
        <div className="absolute top-4 right-4 text-accent-purple/30 text-xs">
          {"\u2605"}
        </div>
        <div className="absolute bottom-4 left-4 text-accent-purple/30 text-xs">
          {"\u2605"}
        </div>
        <div className="absolute bottom-4 right-4 text-accent-purple/30 text-xs">
          {"\u2605"}
        </div>
      </div>
      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// ---- Revealed Card Component ----

function RevealedCard({
  card,
  position,
  positionDescription,
}: {
  card: TarotCard;
  position: string;
  positionDescription: string;
}) {
  return (
    <div className="animate-fade-in">
      <Card
        glow={position === "Present" ? "purple" : "none"}
        className="h-full"
      >
        {/* Position Label */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="info">{position}</Badge>
          {card.reversed && <Badge variant="degraded">Reversed</Badge>}
        </div>

        {/* Card Visual */}
        <div
          className={`relative rounded-lg overflow-hidden mb-3 p-4 text-center ${
            card.reversed ? "rotate-0" : ""
          }`}
          style={{
            background:
              "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))",
          }}
        >
          <div className="text-xs text-text-muted mb-1 font-mono">
            {card.arcana} Arcana
            {typeof card.number === "number"
              ? ` #${card.number}`
              : ` ${card.number}`}
          </div>
          <div
            className={`text-xl font-bold text-text-primary ${card.reversed ? "rotate-180" : ""}`}
          >
            {card.name}
          </div>
          {card.reversed && (
            <div className="text-xs text-accent-amber mt-1">(Reversed)</div>
          )}
        </div>

        {/* Position Description */}
        <p className="text-xs text-text-muted mb-3 italic">
          {positionDescription}
        </p>

        {/* Meaning */}
        <div className="mb-3">
          <p className="text-xs text-text-muted mb-1">
            {card.reversed ? "Reversed Meaning" : "Upright Meaning"}
          </p>
          <p className="text-sm font-medium text-accent-blue">
            {card.reversed ? card.reversedMeaning : card.upright}
          </p>
        </div>

        {/* Interpretation */}
        <div className="mb-3">
          <p className="text-xs text-text-muted mb-1">Interpretation</p>
          <p className="text-sm leading-relaxed text-text-secondary">
            {card.description}
          </p>
        </div>

        {/* Symbols */}
        <div className="rounded-lg bg-white/[0.02] border border-border p-2">
          <p className="text-xs text-text-muted mb-0.5">Key Symbols</p>
          <p className="text-xs text-text-secondary">{card.symbols}</p>
        </div>
      </Card>
    </div>
  );
}

// ---- Page ----

export default function TarotPage() {
  const [cards, setCards] = useState<TarotCard[] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const handleDraw = () => {
    setIsDrawing(true);
    setShowCards(false);
    setTimeout(() => {
      setCards(drawCards());
      setIsDrawing(false);
    }, 800);
  };

  const handleReveal = () => {
    setShowCards(true);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary">Tarot</h1>
          <Badge variant="info">Three-Card Spread</Badge>
        </div>
        <p className="text-sm text-text-muted">
          Past, Present, and Future. Draw three cards from the Major Arcana for
          guidance and reflection.
        </p>
      </div>

      {/* Draw Button */}
      <div className="flex justify-center mb-8">
        <Button onClick={handleDraw} disabled={isDrawing}>
          {isDrawing ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">{"\u2726"}</span>
              Shuffling...
            </span>
          ) : cards ? (
            "Draw Again"
          ) : (
            "Draw Cards"
          )}
        </Button>
      </div>

      {/* Card Backs (before reveal) */}
      {cards && !showCards && (
        <div className="animate-fade-in">
          <p className="text-center text-sm text-text-muted mb-6">
            Your cards are drawn. Click to reveal.
          </p>
          <div className="flex justify-center gap-6 flex-wrap mb-4">
            {POSITIONS.map((pos) => (
              <div key={pos} className="flex flex-col items-center gap-2">
                <CardBack onClick={handleReveal} label={pos} />
                <span className="text-xs text-text-muted">{pos}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revealed Cards */}
      {cards && showCards && (
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card, i) => (
            <RevealedCard
              key={`${card.name}-${i}`}
              card={card}
              position={POSITIONS[i]}
              positionDescription={POSITION_DESCRIPTIONS[i]}
            />
          ))}
        </div>
      )}

      {/* Reading Summary */}
      {cards && showCards && (
        <Card className="mt-4" glow="purple">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
            Reading Synthesis
          </h3>
          <p className="text-sm leading-relaxed text-text-secondary">
            The {cards[0].reversed ? "reversed " : ""}
            {cards[0].name} in the Past position suggests{" "}
            {cards[0].reversed
              ? cards[0].reversedMeaning.toLowerCase()
              : cards[0].upright.toLowerCase().split(",")[0]}
            . This flows into the Present energy of the{" "}
            {cards[1].reversed ? "reversed " : ""}
            {cards[1].name}, indicating a current focus on{" "}
            {cards[1].reversed
              ? cards[1].reversedMeaning.toLowerCase()
              : cards[1].upright.toLowerCase().split(",")[0]}
            . The Future card, the {cards[2].reversed ? "reversed " : ""}
            {cards[2].name}, points toward{" "}
            {cards[2].reversed
              ? cards[2].reversedMeaning.toLowerCase()
              : cards[2].upright.toLowerCase().split(",")[0]}{" "}
            as the developing trajectory. Together, these cards invite you to
            reflect on the pattern connecting your past experience to your
            present awareness and emerging future.
          </p>
        </Card>
      )}

      {/* Empty state */}
      {!cards && !isDrawing && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="flex justify-center gap-3 mb-4 opacity-20">
              <div className="w-12 h-18 rounded border border-white/20" />
              <div className="w-12 h-18 rounded border border-white/20" />
              <div className="w-12 h-18 rounded border border-white/20" />
            </div>
            <p className="text-sm text-text-muted mb-1">
              Clear your mind and focus your intention
            </p>
            <p className="text-xs text-text-muted">
              The cards respond to the energy you bring to the reading. Take a
              breath, then draw when you are ready.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
