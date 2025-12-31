import type { Metadata } from "next";
import { Lora, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "../ui/components/SiteHeader";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Transcend",
  description:
    "A personal experiment in building tools for attention, clarity, and what matters—free, donation-based forever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${lora.variable} ${playfairDisplay.variable} ${geistMono.variable}`}
      >
        <SiteHeader />
        <div className="pt-12 sm:pt-14">{children}</div>
      </body>
    </html>
  );
}
