import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/site-shell";
import WalletProvider from "@/components/wallet-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Corsair",
  description:
    "Autonomous financial agent with managed strategy infrastructure, wallet actions, and CARV-1 runtime access.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Corsair",
    description:
      "Autonomous financial agent with managed strategy infrastructure, wallet actions, and CARV-1 runtime access.",
    url: "https://corsair-chat.vercel.app",
    siteName: "Corsair",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Corsair preview image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Corsair",
    description:
      "Autonomous financial agent with managed strategy infrastructure, wallet actions, and CARV-1 runtime access.",
    images: ["/opengraph-image.png"],
  },
  metadataBase: new URL("https://corsair-chat.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <WalletProvider>
          <SiteShell>{children}</SiteShell>
        </WalletProvider>
      </body>
    </html>
  );
}