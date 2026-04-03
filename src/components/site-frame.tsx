"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";

type SiteFrameProps = {
  children: React.ReactNode;
};

export default function SiteFrame({ children }: SiteFrameProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/70"
            onClick={() => setMenuOpen(false)}
            aria-label="Close overlay"
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar mobile onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <main className="relative flex-1">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(true)}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80 transition hover:bg-white/10 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link href="/" className="text-left">
                <div className="text-lg font-semibold tracking-tight md:text-xl">
                  Corsair Chat
                </div>
                <div className="text-sm text-white/55">
                  Standalone assistant app
                </div>
              </Link>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/docs"
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-white transition hover:bg-white/10"
              >
                View Docs
              </Link>
              <Link
                href="/agent"
                className="rounded-2xl bg-white px-4 py-2.5 text-black transition hover:bg-white/90"
              >
                Open Agent
              </Link>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}