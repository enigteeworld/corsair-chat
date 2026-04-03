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
  title: "Corsair Chat",
  description:
    "Creative and productivity assistant in the Corsair ecosystem.",
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