import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  glow?: "blue" | "purple" | "none";
}

export function Card({
  title,
  children,
  footer,
  className = "",
  glow = "none",
}: CardProps) {
  const glowClass =
    glow === "blue"
      ? "glow-blue"
      : glow === "purple"
        ? "glow-purple"
        : "";

  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-hover ${glowClass} ${className}`}
    >
      {title && (
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          {title}
        </h3>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 border-t border-border pt-3 text-sm text-text-muted">
          {footer}
        </div>
      )}
    </div>
  );
}
