import type { ReactNode } from "react";

type BadgeVariant = "healthy" | "degraded" | "error" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  healthy:
    "bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30",
  degraded:
    "bg-accent-amber/15 text-accent-amber border-accent-amber/30",
  error:
    "bg-accent-rose/15 text-accent-rose border-accent-rose/30",
  info:
    "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
  neutral:
    "bg-white/5 text-text-secondary border-white/10",
};

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
