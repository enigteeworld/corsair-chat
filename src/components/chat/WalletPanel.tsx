"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type WalletPanelProps = {
  open: boolean;
  onClose: () => void;
  walletConnected?: boolean;
  walletAddress?: string | null;
  walletChainLabel?: string | null;
  walletBalanceLabel?: string | null;
  isWrongNetwork?: boolean;
  wrongNetworkLabel?: string | null;
  onCopyAddress?: () => Promise<void> | void;
  onRefreshBalance?: () => Promise<void> | void;
  onOpenExplorer?: () => void;
  onOpenMobileMenu?: () => void;
  onSwitchNetwork?: () => Promise<void> | void;
};

function shortenAddress(address: string | null | undefined) {
  if (!address) return "Not connected";
  if (!address.startsWith("0x") || address.length < 12) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export default function WalletPanel({
  open,
  onClose,
  walletConnected = false,
  walletAddress = null,
  walletChainLabel = null,
  walletBalanceLabel = null,
  isWrongNetwork = false,
  wrongNetworkLabel = null,
  onCopyAddress,
  onRefreshBalance,
  onOpenExplorer,
  onSwitchNetwork,
}: WalletPanelProps) {
  const [copied, setCopied] = useState(false);
  const shortAddress = useMemo(
    () => shortenAddress(walletAddress),
    [walletAddress]
  );

  if (!open) return null;

  async function handleCopy() {
    try {
      if (onCopyAddress) {
        await onCopyAddress();
      } else if (walletAddress) {
        await navigator.clipboard.writeText(walletAddress);
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 z-[120]">
      <button
        type="button"
        aria-label="Close wallet panel"
        className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
        onClick={onClose}
      />

      <div className="absolute right-3 top-[84px] z-[121] w-[min(92vw,420px)] max-h-[calc(100vh-96px)] overflow-hidden rounded-[24px] border border-white/10 bg-[#0a0d12]/95 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:right-6">
        <div className="max-h-[calc(100vh-96px)] overflow-y-auto p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/38">
                Wallet
              </div>
              <h2 className="mt-1 text-[1.22rem] font-semibold tracking-[-0.03em] text-white/92">
                {walletConnected ? "Connected wallet" : "Wallet connection"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Close wallet panel"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div
              className={`rounded-[20px] border p-4 ${
                walletConnected
                  ? isWrongNetwork
                    ? "border-amber-400/20 bg-amber-400/[0.07]"
                    : "border-emerald-400/15 bg-emerald-400/[0.06]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/40">
                Status
              </div>

              <div className="mt-2 flex items-start gap-2.5">
                {walletConnected ? (
                  isWrongNetwork ? (
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  )
                ) : (
                  <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-white/54" />
                )}

                <div className="min-w-0">
                  <div className="text-[1rem] font-medium text-white/92">
                    {!walletConnected
                      ? "No wallet connected"
                      : isWrongNetwork
                        ? "Connected on wrong network"
                        : "Connected and ready"}
                  </div>

                  <div className="mt-1 text-[0.92rem] leading-6 text-white/62">
                    {!walletConnected
                      ? "Connect a wallet to let Corsair read your address, show balances, and prepare user-side execution."
                      : isWrongNetwork
                        ? wrongNetworkLabel || "Unsupported network detected."
                        : walletChainLabel || "Arbitrum Sepolia"}
                  </div>
                </div>
              </div>

              {walletConnected && isWrongNetwork && onSwitchNetwork ? (
                <button
                  type="button"
                  onClick={() => void onSwitchNetwork()}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 text-[0.92rem] font-medium text-amber-100 transition hover:bg-amber-300/16"
                >
                  Switch to Arbitrum Sepolia
                </button>
              ) : null}
            </div>

            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/40">
                Address
              </div>

              <div className="mt-2 break-all font-mono text-[0.98rem] leading-7 text-white/90">
                {walletAddress ?? "No wallet address yet"}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!walletAddress}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[0.88rem] font-medium text-white/78 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </button>

                <button
                  type="button"
                  onClick={onOpenExplorer}
                  disabled={!walletAddress || !onOpenExplorer}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[0.88rem] font-medium text-white/78 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>View on explorer</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 text-[0.82rem] text-white/42">
                Short form: {shortAddress}
              </div>
            </div>

            <div className="rounded-[20px] border border-cyan-400/15 bg-cyan-400/[0.06] p-4">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cyan-200/70">
                Balance
              </div>

              <div className="mt-2 text-[2rem] font-semibold leading-none tracking-[-0.05em] text-white">
                {walletBalanceLabel ?? "—"}
              </div>

              <div className="mt-2 text-[0.92rem] text-white/62">
                Live balance for the connected wallet.
              </div>

              <button
                type="button"
                onClick={() => void onRefreshBalance?.()}
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[0.88rem] font-medium text-white/78 transition hover:bg-white/[0.08] hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {isWrongNetwork ? (
              <div className="rounded-[20px] border border-amber-300/20 bg-amber-300/[0.07] p-4">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-amber-200/80">
                  Network warning
                </div>

                <div className="mt-2 text-[0.95rem] leading-7 text-white/76">
                  Corsair is configured for Arbitrum Sepolia right now. Switch
                  networks before using connected-wallet actions.
                </div>
              </div>
            ) : null}

            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/40">
                Next step
              </div>

              <div className="mt-2 text-[0.95rem] leading-7 text-white/76">
                With wallet connect in place, the next clean upgrade is linking
                user wallet state into send confirmations and strategy actions,
                while keeping treasury actions separate.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}