"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: string;
  label: string;
}

function parseValue(raw: string): { num: number; suffix: string } {
  const match = raw.match(/^([\d.]+)(.*)$/);
  if (!match) return { num: 0, suffix: raw };
  return { num: parseFloat(match[1]), suffix: match[2] };
}

export function CountUp({ value, label }: CountUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState("0");
  const [started, setStarted] = useState(false);
  const { num, suffix } = parseValue(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const duration = 1500;
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = num * eased;

      if (Number.isInteger(num)) {
        setDisplay(Math.round(current).toString() + suffix);
      } else {
        setDisplay(current.toFixed(1) + suffix);
      }

      if (step >= steps) {
        clearInterval(timer);
        setDisplay(value);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [started, num, suffix, value]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <span className="text-3xl font-bold text-text-primary tabular-nums">
        {started ? display : "0"}
      </span>
      <span className="text-xs uppercase tracking-wider text-text-muted">
        {label}
      </span>
    </div>
  );
}
