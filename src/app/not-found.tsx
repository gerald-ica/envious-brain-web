import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center cosmic-bg px-6 text-center">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent-blue/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-purple/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Branding */}
        <div className="mb-8 flex items-center gap-3">
          <span className="text-4xl text-accent-blue">{"\u2727"}</span>
          <span className="text-xl font-bold tracking-wide text-text-primary">
            ENVI-OUS BRAIN
          </span>
        </div>

        {/* 404 indicator */}
        <p className="mb-2 text-7xl font-extrabold text-accent-blue/30 sm:text-9xl">
          404
        </p>
        <h1 className="mb-3 text-2xl font-bold text-text-primary sm:text-3xl">
          Page not found
        </h1>
        <p className="mb-10 max-w-md text-sm leading-relaxed text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          It may have drifted into another dimension.
        </p>

        {/* Navigation links */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 hover:bg-accent-blue/90 transition-all"
          >
            {"\u2302"} Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-text-secondary hover:border-border-hover hover:text-text-primary transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
