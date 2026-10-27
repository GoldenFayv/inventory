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

const siteUrl = "https://usetallyhouse.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TallyHouse — Inventory and Sales Tracker",
    template: "%s | TallyHouse",
  },
  description:
    "Manage your products, record sales, and track customer credit with TallyHouse, an inventory and sales tracker for local businesses.",
  applicationName: "TallyHouse",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "TallyHouse",
    title: "TallyHouse — Inventory and Sales Tracker",
    description:
      "Keep track of your stock, sales, and customer credit in one place.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "TallyHouse inventory and sales tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TallyHouse — Inventory and Sales Tracker",
    description:
      "Keep track of your stock, sales, and customer credit in one place.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
