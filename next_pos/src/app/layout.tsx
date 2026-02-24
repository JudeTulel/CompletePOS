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
  title: "RelyOn POS - Modern Point of Sale System",
  description: "A modern, feature-rich point of sale system with analytics and inventory management",
  keywords: "POS, point of sale, inventory, analytics, business management",
  authors: [{ name: "RelyOn POS Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-deep-charcoal text-off-white`}
      >
        <div className="min-h-screen bg-gradient-to-br from-deep-charcoal via-slate-grey to-light-grey">
          {children}
        </div>
      </body>
    </html>
  );
}

