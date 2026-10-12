import type { Metadata, Viewport } from "next";
import { Syne, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--f-display" });
const body = Manrope({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--f-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-mono" });

export const metadata: Metadata = {
  title: "VELTRIX — AI Creative Studio",
  description: "AI systems, interactive websites, motion and digital experiences built for ambitious brands.",
};
export const viewport: Viewport = { themeColor: "#070707" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
