import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-navy cosmic-bg px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          ← Back to Home
        </Link>
        <h1 className="mb-6 text-3xl font-bold text-text-primary">
          Terms of Service
        </h1>
        <div className="space-y-6 text-sm leading-relaxed text-text-secondary">
          <p>
            Last updated: April 2026
          </p>
          <h2 className="text-lg font-semibold text-text-primary">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ENVI-OUS BRAIN, you agree to be bound by these
            Terms of Service. If you do not agree, do not use the service.
          </p>
          <h2 className="text-lg font-semibold text-text-primary">2. Service Description</h2>
          <p>
            ENVI-OUS BRAIN is a multi-paradigm intelligence engine that provides
            astrological calculations, personality analyses, and AI-powered
            insights. The service is provided for informational and entertainment
            purposes.
          </p>
          <h2 className="text-lg font-semibold text-text-primary">3. API Usage</h2>
          <p>
            API access is subject to rate limits and usage tiers. Abuse of the
            API, including excessive automated requests or attempts to circumvent
            rate limits, may result in account suspension.
          </p>
          <h2 className="text-lg font-semibold text-text-primary">4. Disclaimer</h2>
          <p>
            Astrological readings and personality analyses are provided for
            informational purposes only and should not be used as a substitute
            for professional medical, legal, or financial advice.
          </p>
          <h2 className="text-lg font-semibold text-text-primary">5. Contact</h2>
          <p>
            For questions about these terms, contact{" "}
            <a href="mailto:contact@weareinformal.com" className="text-accent-blue hover:underline">
              contact@weareinformal.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
