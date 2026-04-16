"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---- Hexagram Data ----

interface Hexagram {
  number: number;
  name: string;
  chinese: string;
  upperTrigram: string;
  lowerTrigram: string;
  lines: (6 | 7 | 8 | 9)[]; // 6=old yin, 7=young yang, 8=young yin, 9=old yang
  judgment: string;
  image: string;
  changingLines: { line: number; text: string }[];
  relatesTo?: number;
  relatesToName?: string;
}

const SAMPLE_HEXAGRAM: Hexagram = {
  number: 29,
  name: "The Abysmal (Water)",
  chinese: "\u574E",
  upperTrigram: "K'an (Water)",
  lowerTrigram: "K'an (Water)",
  lines: [7, 8, 7, 9, 8, 6], // bottom to top; 9 and 6 are changing
  judgment:
    "The Abysmal repeated. If you are sincere, you have success in your heart, and whatever you do succeeds. Danger lies in the path, but those who move through it with constancy and truth reach the other side transformed. The water flows on and on, never stopping -- this is the image of the abysmal repeated. Water reaches its goal by flowing continuously. It fills up every depression before it flows on. The superior person follows this example; they walk in lasting virtue and carry on the business of teaching.",
  image:
    "Water flows on and reaches its goal: The image of the Abysmal repeated. Thus the superior person walks in lasting virtue and carries on the business of teaching. As water must flow without interruption to reach its goal, so too must the student of life maintain steady effort. Each obstacle is filled and overcome before the next is encountered.",
  changingLines: [
    {
      line: 4,
      text: "Nine in the fourth place: A jug of wine, a bowl of rice added, earthen vessels simply handed in through the window. There is certainly no blame in this. In times of danger, ceremonious forms are dispensed with. What matters most is true sincerity. A quiet, unassuming generosity speaks louder than elaborate gestures.",
    },
    {
      line: 1,
      text: "Six at the beginning: Repetition of the Abysmal. One falls into a pit within the abyss. Misfortune. One has grown so accustomed to danger that it no longer feels dangerous. This complacency leads to a fall within the fall -- trouble compounding upon trouble. Do not normalize peril.",
    },
  ],
  relatesTo: 7,
  relatesToName: "The Army",
};

function castRandomHexagram(): Hexagram {
  // Generate random lines (simplified: just return the sample with shuffled changing lines)
  const hexagrams = [
    { ...SAMPLE_HEXAGRAM },
    {
      number: 1,
      name: "The Creative (Heaven)",
      chinese: "\u4E7E",
      upperTrigram: "Ch'ien (Heaven)",
      lowerTrigram: "Ch'ien (Heaven)",
      lines: [9, 7, 7, 9, 7, 7] as (6 | 7 | 8 | 9)[],
      judgment:
        "The Creative works sublime success, furthering through perseverance. The movement of heaven is full of power. Thus the superior person makes themselves strong and untiring. Great indeed is the sublimity of the Creative, to which all beings owe their beginning.",
      image:
        "Heaven in its motion gives the idea of strength. The superior person, in accordance with this, nerves themselves to ceaseless activity. The two trigrams of heaven stacked create an image of pure creative energy, relentless and originating.",
      changingLines: [
        {
          line: 1,
          text: "Nine at the beginning: Hidden dragon. Do not act. The time is not yet right for action. Like a dragon still submerged, gather your strength in silence.",
        },
        {
          line: 4,
          text: "Nine in the fourth place: Wavering flight over the depths. No blame. A transition point where one can either ascend to leadership or withdraw into solitude. Both are valid.",
        },
      ],
      relatesTo: 11,
      relatesToName: "Peace",
    },
    {
      number: 52,
      name: "Keeping Still (Mountain)",
      chinese: "\u826E",
      upperTrigram: "Ken (Mountain)",
      lowerTrigram: "Ken (Mountain)",
      lines: [8, 8, 6, 8, 8, 7] as (6 | 7 | 8 | 9)[],
      judgment:
        "Keeping Still. Keeping his back so still that he no longer feels his body. He goes into his courtyard and does not see his people. No blame. True quiet means keeping still when the time has come to keep still, and going forward when the time has come to go forward.",
      image:
        "Mountains standing close together: The image of Keeping Still. Thus the superior person does not permit his thoughts to go beyond his situation. Rest is not merely the absence of movement but a positive state of composure.",
      changingLines: [
        {
          line: 3,
          text: "Six in the third place: Keeping his hips still. Making his sacrum stiff. Dangerous. The heart suffocates. Forced stillness that rigidifies the emotional center. True meditation is relaxed, not rigid.",
        },
      ],
      relatesTo: 35,
      relatesToName: "Progress",
    },
    {
      number: 11,
      name: "Peace",
      chinese: "\u6CF0",
      upperTrigram: "K'un (Earth)",
      lowerTrigram: "Ch'ien (Heaven)",
      lines: [7, 9, 7, 8, 6, 8] as (6 | 7 | 8 | 9)[],
      judgment:
        "Peace. The small departs, the great approaches. Good fortune. Success. Heaven and earth unite, and all beings flourish. The ruler brings high and low together, aligning the wills of the people with the celestial order.",
      image:
        "Heaven and earth unite: the image of Peace. The ruler fashions and completes the course of heaven and earth, furthering and regulating the gifts of heaven and earth, and so aids the people.",
      changingLines: [
        {
          line: 2,
          text: "Nine in the second place: Bearing with the uncultured in gentleness. Fording the river with resolution. Not neglecting what is distant. Not regarding one's companions. One manages to walk the middle path.",
        },
        {
          line: 5,
          text: "Six in the fifth place: The sovereign gives his daughter in marriage. This brings blessing and supreme good fortune. An alliance is formed through generosity and humility at the highest level.",
        },
      ],
      relatesTo: 12,
      relatesToName: "Standstill",
    },
  ];
  return hexagrams[Math.floor(Math.random() * hexagrams.length)];
}

// ---- Line Display Component ----

function HexagramLine({ value }: { value: 6 | 7 | 8 | 9 }) {
  const isYang = value === 7 || value === 9;
  const isChanging = value === 6 || value === 9;

  return (
    <div className="flex items-center gap-2 justify-center my-1">
      {isYang ? (
        // Solid line (yang)
        <div className="relative">
          <div className="w-48 h-3 bg-accent-blue rounded-sm" />
          {isChanging && (
            <div className="absolute right-[-28px] top-0 flex items-center h-3">
              <span className="text-xs text-accent-amber font-mono">
                &larr; *
              </span>
            </div>
          )}
        </div>
      ) : (
        // Broken line (yin)
        <div className="relative flex gap-3">
          <div className="w-[5.5rem] h-3 bg-accent-blue/60 rounded-sm" />
          <div className="w-[5.5rem] h-3 bg-accent-blue/60 rounded-sm" />
          {isChanging && (
            <div className="absolute right-[-28px] top-0 flex items-center h-3">
              <span className="text-xs text-accent-amber font-mono">
                &larr; *
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Page ----

export default function IChingPage() {
  const [question, setQuestion] = useState("");
  const [hexagram, setHexagram] = useState<Hexagram | null>(null);
  const [isCasting, setIsCasting] = useState(false);

  const handleCast = () => {
    setIsCasting(true);
    // Simulate casting delay
    setTimeout(() => {
      setHexagram(castRandomHexagram());
      setIsCasting(false);
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary">I Ching</h1>
          <Badge variant="info">Book of Changes</Badge>
        </div>
        <p className="text-sm text-text-muted">
          Ancient Chinese oracle system of 64 hexagrams. Focus your question,
          then cast to receive guidance.
        </p>
      </div>

      {/* Question + Cast */}
      <Card className="mb-4" glow="blue">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              label="Your Question"
              placeholder="What do I need to understand about..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleCast}
              disabled={isCasting}
              className="w-full sm:w-auto"
            >
              {isCasting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">&#9788;</span>
                  Casting...
                </span>
              ) : (
                "Cast Hexagram"
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {hexagram && (
        <div className="grid gap-4 lg:grid-cols-2 animate-fade-in">
          {/* Hexagram Display */}
          <Card title={`Hexagram ${hexagram.number}`} glow="purple">
            <div className="text-center mb-4">
              <span className="text-5xl font-bold text-accent-blue">
                {hexagram.chinese}
              </span>
              <h2 className="text-lg font-semibold text-text-primary mt-2">
                {hexagram.name}
              </h2>
            </div>

            {/* Lines display (top to bottom = line 6 to line 1) */}
            <div className="py-4">
              {[...hexagram.lines].reverse().map((line, i) => (
                <HexagramLine key={i} value={line} />
              ))}
            </div>

            {/* Trigrams */}
            <div className="flex justify-between mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-text-muted">Upper Trigram</p>
                <p className="text-sm font-medium text-text-primary">
                  {hexagram.upperTrigram}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">Lower Trigram</p>
                <p className="text-sm font-medium text-text-primary">
                  {hexagram.lowerTrigram}
                </p>
              </div>
            </div>

            {hexagram.relatesTo && (
              <div className="mt-3 pt-3 border-t border-border text-center">
                <p className="text-xs text-text-muted">
                  Changing lines transform this into
                </p>
                <p className="text-sm font-medium text-accent-purple">
                  Hexagram {hexagram.relatesTo} - {hexagram.relatesToName}
                </p>
              </div>
            )}
          </Card>

          {/* Judgment */}
          <Card title="The Judgment">
            <p className="text-sm leading-relaxed text-text-secondary">
              {hexagram.judgment}
            </p>
          </Card>

          {/* Image */}
          <Card title="The Image">
            <p className="text-sm leading-relaxed text-text-secondary">
              {hexagram.image}
            </p>
          </Card>

          {/* Changing Lines */}
          <Card title="Changing Lines" glow="blue">
            {hexagram.changingLines.length === 0 ? (
              <p className="text-sm text-text-muted">
                No changing lines in this cast. The hexagram is stable.
              </p>
            ) : (
              <div className="space-y-4">
                {hexagram.changingLines.map((cl) => (
                  <div
                    key={cl.line}
                    className="rounded-lg border border-accent-amber/20 bg-accent-amber/5 p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="degraded">Line {cl.line}</Badge>
                      <span className="text-xs text-text-muted">
                        {hexagram.lines[cl.line - 1] === 9
                          ? "Old Yang (9) \u2192 Yin"
                          : "Old Yin (6) \u2192 Yang"}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {cl.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Empty state */}
      {!hexagram && !isCasting && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4 opacity-20">{"\u2637"}</div>
            <p className="text-sm text-text-muted mb-1">
              Focus your mind on a question
            </p>
            <p className="text-xs text-text-muted">
              The I Ching responds not to the words but to the sincerity of
              inquiry. Allow your question to settle before casting.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
