import Link from "next/link";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <div className="space-y-6 text-sm leading-relaxed text-text-secondary">
          <p>
            Last updated: April 2026
          </p>
          <h2 className="text-lg font-semibold text-text-primary">1. Information We Collect</h2>
          <p>
            ENVI-OUS BRAIN collects birth date, time, and location data that you
            voluntarily provide to generate astrological charts and personality
            analyses. We also collect account information (email, display name)
            when you register.
          </p>
          <h2 className="text-lg font-semibold text-text-primary">2. How We Use Your Information</h2>
          <p>
            Your birth data is used solely to compute astrological calculations
            and personality profiles. We do not sell your personal information to
            third parties.
          </p>
          <h2 className="text-lg font-semibold text-text-primary">3. Data Storage</h2>
          <p>
            Your data is stored securely on Google Cloud infrastructure with
            encryption at rest and in transit. You can delete your account and
            all associated data at any time from the Settings page.
          </p>
          <h2 className="text-lg font-semibold text-text-primary">4. Contact</h2>
          <p>
            For privacy-related inquiries, contact us at{" "}
            <a href="mailto:contact@weareinformal.com" className="text-accent-blue hover:underline">
              contact@weareinformal.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
