"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/lib/store";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

// ---------------------------------------------------------------------------
// Tarot Birth Cards — via /api/v1/personality/tarot/birth-cards
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-662458014068.us-central1.run.app";

function TarotCard({ title, card }: { title: string; card: Record<string, unknown> }) {
  const name = card.name as string ?? card.card as string ?? "Unknown";
  const number = card.number as number | undefined;
  const meaning = card.meaning as string | undefined;
  const keywords = card.keywords as string[] | undefined;
  const description = card.description as string | undefined;

  return (
    <Card title={title}>
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-20 w-14 items-center justify-center rounded-lg bg-gradient-to-b from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30">
          {number !== undefined ? (
            <span className="text-2xl font-bold text-accent-purple">{number}</span>
          ) : (
            <span className="text-2xl">{"\u2660"}</span>
          )}
        </div>
        <p className="text-lg font-bold text-text-primary">{name}</p>
        {meaning ? (
          <p className="text-sm text-text-secondary">{meaning}</p>
        ) : null}
        {description ? (
          <p className="text-xs text-text-muted leading-relaxed">{description}</p>
        ) : null}
        {keywords && keywords.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-1.5">
            {keywords.map((kw, i) => (
              <Badge key={i} variant="neutral">{kw}</Badge>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export default function TarotPage() {
  const { activeProfile } = useProfile();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/v1/personality/tarot/birth-cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ birth_date: activeProfile.birthDate }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tarot data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeProfile]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">
            Create a birth profile to view your tarot birth cards.
          </p>
          <Link href="/dashboard/settings">
            <Button>Go to Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const birthCard = data?.birth_card as Record<string, unknown> | undefined;
  const personalityCard = data?.personality_card as Record<string, unknown> | undefined;
  const yearCard = data?.year_card as Record<string, unknown> | undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Tarot Birth Cards for {activeProfile.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Your personal tarot cards based on your birth date
        </p>
      </div>

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
          <div className="grid gap-6 sm:grid-cols-3">
            {birthCard ? <TarotCard title="Birth Card" card={birthCard} /> : null}
            {personalityCard ? <TarotCard title="Personality Card" card={personalityCard} /> : null}
            {yearCard ? <TarotCard title="Year Card" card={yearCard} /> : null}
          </div>

          {/* Fallback for unexpected shapes */}
          {!birthCard && !personalityCard && !yearCard ? (
            <Card title="Results">
              <pre className="overflow-x-auto text-xs text-text-secondary whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
