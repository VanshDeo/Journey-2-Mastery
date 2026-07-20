import type { Metadata } from "next";
import { Inter, Zilla_Slab, Permanent_Marker } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

import localFont from "next/font/local";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const onari = localFont({
  src: "../fonts/ONARI-PersonalUse.otf",
  variable: "--font-onari-local",
});

const zillaSlab = Zilla_Slab({
  variable: "--font-zilla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const marker = Permanent_Marker({
  variable: "--font-marker",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Journey to Mastery",
  description: "A 4-week coding program for developers to turn one idea into a live product.",
};

import QueryProvider from "@/components/providers/QueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${zillaSlab.variable} ${marker.variable} ${onari.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans">
        <QueryProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </QueryProvider>
      </body>
    </html>
  );
}
