import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const siteUrl = "https://agrovision.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AgroVision AI — A farm expert in every pocket, even offline.",
    template: "%s · AgroVision AI",
  },
  description:
    "AI-powered crop disease detection, pest identification, and farming advice for smallholder and commercial farmers — online or fully offline. Built with Gemma 4.",
  keywords: [
    "AgroVision AI",
    "crop disease detection",
    "AI for farming",
    "Gemma AI agriculture",
    "pest identification",
    "offline farming assistant",
  ],
  openGraph: {
    title: "AgroVision AI — A farm expert in every pocket, even offline.",
    description:
      "AI-powered crop disease detection, pest identification, and farming advice for smallholder and commercial farmers — online or fully offline.",
    url: siteUrl,
    siteName: "AgroVision AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgroVision AI — A farm expert in every pocket, even offline.",
    description:
      "AI-powered crop disease detection, pest identification, and farming advice for smallholder and commercial farmers — online or fully offline.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
