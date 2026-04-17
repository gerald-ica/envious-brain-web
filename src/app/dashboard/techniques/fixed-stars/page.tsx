"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

interface StarConjunction {
  star: string;
  planet: string;
  star_longitude: number;
  planet_longitude: number;
  orb: number;
  star_nature: string;
  star_keywords: string[];
  star_magnitude: number;
}

export default function FixedStarsPage() {
  const { activeProfile } = useProfile();
  const [conjunctions, setConjunctions] = useState<StarConjunction[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setConjunctions([]);
      setCount(null);
      try {
        const res = await fetch(`${API_URL}/api/v1/western/fixed-stars`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            datetime: `${activeProfile.birthDate}T${activeProfile.birthTime || "12:00"}:00`,
            latitude: activeProfile.lat,
            longitude: activeProfile.lon,
          }),
        });

        if (res.status === 404) {
          if (!cancelled) setError("Fixed stars endpoint is not yet deployed.");
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as Record<string, unknown>).detail as string ?? `API error ${res.status}`);
        }

        const json = await res.json();
        // Handle both wrapped and unwrapped responses
        const data = json.data ?? json;
        const rawConjunctions = data.conjunctions ?? data.fixed_stars ?? [];

        if (!cancelled) {
          const items = (Array.isArray(rawConjunctions) ? rawConjunctions : []).map(
            (c: Record<string, unknown>) => ({
              star: String(c.star ?? c.star_name ?? ""),
              planet: String(c.planet ?? c.natal_planet ?? ""),
              star_longitude: Number(c.star_longitude ?? 0),
              planet_longitude: Number(c.planet_longitude ?? 0),
              orb: Number(c.orb ?? 0),
              star_nature: String(c.star_nature ?? c.nature ?? ""),
              star_keywords: Array.isArray(c.star_keywords)
                ? (c.star_keywords as string[])
                : Array.isArray(c.keywords)
                  ? (c.keywords as string[])
                  : typeof c.star_keywords === "string"
                    ? (c.star_keywords as string).split(",").map((s: string) => s.trim())
                    : [],
              star_magnitude: Number(c.star_magnitude ?? c.magnitude ?? 0),
            })
          );
          setConjunctions(items);
          setCount(typeof data.count === "number" ? data.count : items.length);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load fixed stars");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeProfile]);

  if (!activeProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card title="No Profile Selected">
          <p className="text-text-secondary mb-4">Create a birth profile to view fixed star conjunctions.</p>
          <Link href="/dashboard/settings"><Button>Go to Settings</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Star size={24} className="text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Fixed Stars for {activeProfile.name}</h1>
            <p className="mt-1 text-sm text-text-muted">
              Major fixed star conjunctions with natal planets{count != null ? ` — ${count} found` : ""}
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-12 w-full rounded-lg" />))}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-4 py-2.5 text-sm text-accent-rose">
          {error}
        </div>
      )}

      {!loading && !error && (
        <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.05 } } }} className="space-y-6">
          {conjunctions.length > 0 ? (
            <Card title="Star Conjunctions">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-text-muted">Star</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Planet</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Orb</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Magnitude</th>
                      <th className="pb-2 pr-4 font-medium text-text-muted">Nature</th>
                      <th className="pb-2 font-medium text-text-muted">Keywords</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conjunctions.map((c, i) => (
                      <motion.tr
                        key={`${c.star}-${c.planet}-${i}`}
                        variants={fadeUp}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-2.5 pr-4 font-medium text-text-primary">{c.star}</td>
                        <td className="py-2.5 pr-4 text-text-secondary">{c.planet}</td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">{c.orb.toFixed(2)}°</td>
                        <td className="py-2.5 pr-4 text-text-secondary">{c.star_magnitude.toFixed(2)}</td>
                        <td className="py-2.5 pr-4">
                          {c.star_nature ? (
                            <Badge variant="info">{c.star_nature}</Badge>
                          ) : <span className="text-text-muted">—</span>}
                        </td>
                        <td className="py-2.5">
                          {c.star_keywords.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {c.star_keywords.map((kw) => (
                                <Badge key={kw} variant="neutral">{kw}</Badge>
                              ))}
                            </div>
                          ) : <span className="text-text-muted">—</span>}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card title="Fixed Star Conjunctions">
              <p className="text-sm text-text-muted">No fixed star conjunctions found within the standard orb for this chart.</p>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
