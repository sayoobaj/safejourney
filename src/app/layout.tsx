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
  title: "SafeJourney.ng - Nigeria Security Incident Tracker",
  description: "Track kidnapping, banditry, and security incidents across Nigeria. Real-time monitoring and hotspot analysis.",
  keywords: ["Nigeria", "security", "kidnapping", "banditry", "safety", "incidents", "tracker"],
  openGraph: {
    title: "SafeJourney.ng",
    description: "Nigeria Security Incident Tracker - Stay informed, stay safe",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
