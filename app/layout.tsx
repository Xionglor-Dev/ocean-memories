import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "my-ocean-memories",
    template: "%s | my-ocean-memories",
  },
  description:
    "A peaceful ocean-themed scrapbook timeline for personal memories, photos, and quiet moments worth keeping.",
  openGraph: {
    title: "my-ocean-memories",
    description:
      "A peaceful ocean-themed scrapbook timeline for personal memories, photos, and quiet moments worth keeping.",
    url: getSiteUrl(),
    siteName: "my-ocean-memories",
    images: [
      {
        url: "/images/ocean-watercolor.png",
        width: 1200,
        height: 630,
        alt: "Soft watercolor ocean texture",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "my-ocean-memories",
    description:
      "A peaceful ocean-themed scrapbook timeline for personal memories, photos, and quiet moments worth keeping.",
    images: ["/images/ocean-watercolor.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#EAF8FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased ocean-scrollbar">{children}</body>
    </html>
  );
}
