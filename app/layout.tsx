import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://ordozeus-shop.bandev.my.id",
  ),
  title: {
    default: "OrdoZeus | Premium Fashion & Lifestyle",
    template: "%s | OrdoZeus",
  },
  description:
    "Curated fashion for the modern individual. Discover premium clothing, accessories, and lifestyle products with quality craftsmanship and contemporary design at OrdoZeus.",
  keywords: [
    "fashion",
    "premium clothing",
    "lifestyle",
    "online shop",
    "OrdoZeus",
    "contemporary fashion",
    "accessories",
  ],
  authors: [{ name: "OrdoZeus" }],
  creator: "OrdoZeus",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "OrdoZeus",
    title: "OrdoZeus | Premium Fashion & Lifestyle",
    description:
      "Curated fashion for the modern individual. Discover premium clothing, accessories, and lifestyle products at OrdoZeus.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OrdoZeus | Premium Fashion & Lifestyle",
    description:
      "Curated fashion for the modern individual. Premium clothing & accessories at OrdoZeus.",
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
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
