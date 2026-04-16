import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ENVI-OUS BRAIN | Multi-Paradigm Intelligence Engine",
  description:
    "335 API endpoints across 45 methodologies. Astrology, personality, oracle, and developer tools unified in one intelligence engine.",
  keywords: [
    "astrology",
    "personality",
    "MBTI",
    "enneagram",
    "numerology",
    "tarot",
    "API",
    "intelligence engine",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-navy text-foreground">
        {children}
      </body>
    </html>
  );
}
