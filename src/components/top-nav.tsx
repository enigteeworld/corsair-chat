"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  ChevronDown,
  MessageSquare,
  Wallet,
  Orbit,
  Copy,
  Check,
} from "lucide-react";
import { useMemo, useState } from "react";

type TopNavProps = {
  onOpenMobileMenu: () => void;
  onOpenWalletPanel: () => void;
  walletAddress?: string | null;
  walletConnected?: boolean;
  walletChainLabel?: string | null;
};

function shortenAddress(address: string) {
  if (!address.startsWith("0x") || address.length < 12) {
    return address;
  }

  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export default function TopNav({
  onOpenMobileMenu,
  onOpenWalletPanel,
  walletAddress,
  walletConnected = false,
  walletChainLabel,
}: TopNavProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const desktopNav = [
    { href: "/agent", label: "Agent" },
    { href: "/collections", label: "Collections" },
    { href: "/resources", label: "Resources" },
    { href: "/playground", label: "Playground" },
    { href: "#", label: "More", hasChevron: true },
  ];

  const walletLabel = useMemo(() => {
    if (walletConnected && walletAddress) {
      return shortenAddress(walletAddress);
    }

    return "Wallet";
  }, [walletConnected, walletAddress]);

  async function handleCopyAddress() {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore clipboard failure
    }
  }

  return (
    <header className="top-nav-blur sticky top-0 z-[100]">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-3 px-3 md:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-3 lg:gap-8">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="shrink-0 rounded-[16px] border border-white/10 bg-white/5 p-2.5 text-white/80 transition hover:bg-white/10 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex min-w-0 items-center gap-2 md:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center text-white">
              <MessageSquare className="h-5 w-5" />
            </div>

            <span className="truncate text-[1.7rem] font-semibold tracking-tight text-white min-[390px]:text-[1.85rem]">
              CORSAIR
            </span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {desktopNav.map((item) => {
              const active =
                item.href !== "#" &&
                (pathname === item.href || pathname.startsWith(item.href));

              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  className={`inline-flex items-center gap-1 rounded-2xl px-4 py-2.5 text-[1rem] transition ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/72 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                  {item.hasChevron && <ChevronDown className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenWalletPanel}
            className={`hidden h-11 items-center gap-2 rounded-2xl border px-3 text-[0.92rem] font-medium transition md:inline-flex ${
              walletConnected
                ? "border-cyan-400/25 bg-cyan-400/[0.08] text-cyan-100 hover:bg-cyan-400/[0.12]"
                : "border-white/10 bg-black/35 text-white/80 hover:bg-white/5 hover:text-white"
            }`}
            aria-label={walletConnected ? "Open wallet panel" : "Connect wallet"}
            title={walletConnected ? "Open wallet panel" : "Connect wallet"}
          >
            <Wallet className="h-4.5 w-4.5" />
            <span>{walletLabel}</span>
          </button>

          <button
            type="button"
            onClick={onOpenWalletPanel}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition md:hidden ${
              walletConnected
                ? "border-cyan-400/25 bg-cyan-400/[0.08] text-cyan-100 hover:bg-cyan-400/[0.12]"
                : "border-white/10 bg-black/35 text-white/80 hover:bg-white/5 hover:text-white"
            }`}
            aria-label={walletConnected ? "Open wallet panel" : "Connect wallet"}
          >
            <Wallet className="h-5 w-5" />
          </button>

          {walletConnected && walletAddress ? (
            <button
              type="button"
              onClick={handleCopyAddress}
              className="hidden h-11 items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-3 text-[0.88rem] text-white/72 transition hover:bg-white/5 hover:text-white lg:inline-flex"
              aria-label="Copy wallet address"
              title="Copy wallet address"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{walletChainLabel ?? "Arbitrum Sepolia"}</span>
            </button>
          ) : null}

          <button
            type="button"
            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-white/80 transition hover:bg-white/5 md:inline-flex"
          >
            <MessageSquare className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white px-3 text-[0.95rem] font-medium text-black transition hover:bg-white/90 min-[390px]:px-4"
          >
            <Orbit className="h-4 w-4" />
            <span>Orbit</span>
          </button>

          <button
            type="button"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white px-3 text-[0.95rem] font-medium text-black transition hover:bg-white/90 min-[390px]:px-4"
          >
            <span>Sign Up</span>
          </button>
        </div>
      </div>
    </header>
  );
}