"use client";

import { useEffect } from "react";

const SWAGGER_URL =
  "https://envious-brain-api-uxgej3n6ta-uc.a.run.app/docs";

export default function ApiDocsRedirect() {
  useEffect(() => {
    window.location.href = SWAGGER_URL;
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center cosmic-bg px-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
        <p className="text-sm text-text-secondary">
          Redirecting to API docs...
        </p>
        <a
          href={SWAGGER_URL}
          className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
        >
          Click here if not redirected
        </a>
      </div>
    </div>
  );
}
