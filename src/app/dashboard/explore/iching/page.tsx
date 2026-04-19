"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// I Ching — via /api/v1/chinese/iching/cast
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-662458014068.us-central1.run.app";

function HexagramLine({ type }: { type: string }) {
  const isYang = type === "yang" || type === "old_yang" || type === "9";
  const isChanging = type === "old_yang" || type === "old_yin" || type === "6" || type === "9";
  return (
    <div className="flex items-center gap-1 justify-center my-1">
      {isYang ? (
        <div className={`h-2 w-32 rounded-sm ${isChanging ? "bg-accent-amber" : "bg-text-primary"}`} />
      ) : (
        <>
          <div className={`h-2 w-14 rounded-sm ${isChanging ? "bg-accent-amber" : "bg-text-primary"}`} />
          <div className="w-4" />
          <div className={`h-2 w-14 rounded-sm ${isChanging ? "bg-accent-amber" : "bg-text-primary"}`} />
        </>
      )}
    </div>
  );
}

export default function IChingPage() {
  const [question, setQuestion] = useState("");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const castHexagram = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/chinese/iching/cast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cast hexagram");
    } finally {
      setLoading(false);
    }
  };

  const hexNumber = data?.number ?? data?.hexagram_number;
  const name = data?.name as string | undefined;
  const chinese = data?.chinese as string | undefined;
  const element = data?.element as string | undefined;
  const judgment = data?.judgment as string | undefined;
  const image = data?.image as string | undefined;
  const upperTrigram = data?.upper_trigram as Record<string, unknown> | string | undefined;
  const lowerTrigram = data?.lower_trigram as Record<string, unknown> | string | undefined;
  const lines = data?.lines as Array<Record<string, unknown>> | undefined;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">I Ching Oracle</h1>
        <p className="mt-1 text-sm text-text-muted">
          Ask a question and receive guidance from the Book of Changes
        </p>
      </div>

      {/* Question input */}
      <Card title="Your Question" className="mb-6">
        <div className="space-y-4">
          <Input
            label="What would you like to know?"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question..."
          />
          <Button onClick={castHexagram} disabled={loading || !question.trim()}>
            {loading ? "Casting..." : "Cast Hexagram"}
          </Button>
        </div>
      </Card>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-4 py-2.5 text-sm text-accent-rose">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="animate-fade-in space-y-6">
          {/* Hexagram header */}
          <Card>
            <div className="text-center space-y-3">
              {chinese ? (
                <p className="text-5xl">{chinese}</p>
              ) : null}
              <p className="text-2xl font-bold text-text-primary">
                Hexagram {String(hexNumber ?? "")} {"\u2014"} {name ?? ""}
              </p>
              {element ? (
                <Badge variant="info">{element}</Badge>
              ) : null}
            </div>
          </Card>

          {/* Trigrams */}
          {(upperTrigram || lowerTrigram) ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {upperTrigram ? (
                <Card title="Upper Trigram">
                  <p className="text-lg font-medium text-text-primary">
                    {typeof upperTrigram === "string"
                      ? upperTrigram
                      : (upperTrigram.name as string) ?? JSON.stringify(upperTrigram)}
                  </p>
                </Card>
              ) : null}
              {lowerTrigram ? (
                <Card title="Lower Trigram">
                  <p className="text-lg font-medium text-text-primary">
                    {typeof lowerTrigram === "string"
                      ? lowerTrigram
                      : (lowerTrigram.name as string) ?? JSON.stringify(lowerTrigram)}
                  </p>
                </Card>
              ) : null}
            </div>
          ) : null}

          {/* Judgment */}
          {judgment ? (
            <Card title="The Judgment">
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {judgment}
              </p>
            </Card>
          ) : null}

          {/* Image */}
          {image ? (
            <Card title="The Image">
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {image}
              </p>
            </Card>
          ) : null}

          {/* Lines */}
          {lines && lines.length > 0 ? (
            <Card title="Lines">
              <div className="space-y-3">
                {lines.map((line, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-white/[0.02] px-4 py-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="neutral">Line {(line.position ?? i + 1) as number}</Badge>
                      {line.changing ? (
                        <Badge variant="degraded">Changing</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-text-secondary">
                      {(line.meaning ?? line.text ?? line.interpretation ?? JSON.stringify(line)) as string}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {/* Raw fallback */}
          {!judgment && !lines ? (
            <Card title="Full Response">
              <pre className="overflow-x-auto text-xs text-text-secondary whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </Card>
          ) : null}
        </div>
      )}

      {!data && !loading && !error && (
        <Card>
          <div className="text-center py-8">
            <p className="text-4xl mb-4">{"\u2630"}</p>
            <p className="text-text-muted">
              Focus on your question, then cast the hexagram to receive guidance.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
