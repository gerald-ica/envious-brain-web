"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth";

// ---- Login form (inner, needs auth context) --------------------------------

function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Show nothing while checking auth status
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy cosmic-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
          <p className="text-sm text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render form if already authenticated (redirect is happening)
  if (isAuthenticated) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-navy cosmic-bg relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent-blue/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-purple/5 blur-3xl" />
        <div className="absolute top-1/4 left-1/3 h-60 w-60 rounded-full bg-accent-emerald/3 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="text-4xl text-accent-blue">{"\u2727"}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide text-text-primary">
            ENVI-OUS BRAIN
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Multi-Paradigm Intelligence Engine
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-sm p-8 shadow-2xl shadow-black/30">
          <h2 className="mb-1 text-xl font-semibold text-text-primary">
            Welcome back
          </h2>
          <p className="mb-6 text-sm text-text-muted">
            Sign in to your account to continue
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 text-sm text-accent-rose">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-text-secondary"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-navy/60 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-text-secondary"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-border bg-navy/60 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-accent-blue hover:text-accent-blue/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-text-muted/60">
          Built by Informal
        </p>
      </div>
    </div>
  );
}

// ---- Page (wraps with AuthProvider) ----------------------------------------

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
