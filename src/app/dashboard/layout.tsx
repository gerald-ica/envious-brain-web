"use client";

import { ProfileProvider } from "@/lib/store";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider>
      <div className="flex h-screen overflow-hidden bg-navy">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6 cosmic-bg">
            {children}
          </main>
        </div>
      </div>
    </ProfileProvider>
  );
}
