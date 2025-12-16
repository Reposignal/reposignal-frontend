import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation/Navigation";
import { IssueDetailOverlay } from "@/components/overlays/IssueDetailOverlay";
import { AuthBootstrap } from "./AuthBootstrap";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reposignal — Discover meaningful open source work",
  description: "A calm, trust-first platform for discovering open source issues with context.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-neutral-950 text-neutral-100`}>
        <AuthBootstrap />
        <Navigation />
        <main>{children}</main>
        <IssueDetailOverlay />
      </body>
    </html>
  );
}
