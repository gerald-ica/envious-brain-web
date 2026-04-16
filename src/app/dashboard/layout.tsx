"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileProvider } from "@/lib/store";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";

// ---- Auth gate (inner component that uses auth context) --------------------

function AuthenticatedDashboard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Loading skeleton while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-navy cosmic-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
          <p className="text-sm text-text-muted">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard content if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-navy cosmic-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
          <p className="text-sm text-text-muted">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-navy">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 cosmic-bg">{children}</main>
      </div>
    </div>
  );
}

// ---- Layout ---------------------------------------------------------------

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
      </ProfileProvider>
    </AuthProvider>
  );
}
