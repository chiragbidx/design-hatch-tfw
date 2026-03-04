import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthGuard from "./components/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PandaWork",
  description:
    "PandaWork — an Upwork-inspired freelance marketplace with a sleek black and green theme, landing page and registration flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-x-hidden min-w-0`}
      >
        <div className="min-h-screen min-w-0 max-w-[100vw]">
          <AuthGuard>{children}</AuthGuard>
        </div>
      </body>
    </html>
  );
}
