"use client";

import { useState } from "react";
import Link from "next/link";

const SWAGGER_URL = "https://envious-brain-api-uxgej3n6ta-uc.a.run.app/docs";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="md:hidden rounded-lg p-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? (
          // X icon
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        ) : (
          // Hamburger icon
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="5" x2="17" y2="5" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="15" x2="17" y2="15" />
          </svg>
        )}
      </button>

      {/* Dropdown menu — mobile only */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-border bg-surface/95 backdrop-blur-md px-6 py-4 flex flex-col gap-3 md:hidden">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors py-1"
          >
            Dashboard
          </Link>
          <a
            href={SWAGGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors py-1"
          >
            API Docs
          </a>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors py-1"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-white text-center hover:bg-accent-blue/90 transition-colors shadow-lg shadow-accent-blue/20"
          >
            Get Started
          </Link>
        </div>
      )}
    </>
  );
}
