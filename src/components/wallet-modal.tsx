"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  LogOut,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";

type WalletConnectorOption = {
  id: string;
  name: string;
};

type WalletModalProps = {
  open: boolean;
  onClose: () => void;
  walletConnected?: boolean;
  walletAddress?: string | null;
  walletChainLabel?: string | null;
  walletBalanceLabel?: string | null;
  chainId?: number | null;
  isWrongNetwork?: boolean;
  wrongNetworkLabel?: string | null;
  isBalanceLoading?: boolean;
  isConnectPending?: boolean;
  isSwitchPending?: boolean;
  connectors: WalletConnectorOption[];
  onConnectWallet: (connectorId: string) => void;
  onDisconnectWallet: () => void;
  onSwitchNetwork: () => void;
  onRefreshBalance: () => void | Promise<void>;
};

type ConnectorMeta = {
  title: string;
  subtitle: string;
  accent: string;
};

function shortenAddress(address?: string | null) {
  if (!address) return "Not connected";
  if (!address.startsWith("0x") || address.length < 14) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function getExplorerUrl(address?: string | null, chainId?: number | null) {
  if (!address) return null;

  if (chainId === 421614) {
    return `https://sepolia.arbiscan.io/address/${address}`;
  }

  return null;
}

function hasMetaMaskInjected(): boolean {
  if (typeof window === "undefined") return false;

  const maybeWindow = window as Window & {
    ethereum?: {
      isMetaMask?: boolean;
      providers?: Array<{ isMetaMask?: boolean }>;
    };
    okxwallet?: unknown;
    phantom?: unknown;
  };

  const ethereum = maybeWindow.ethereum;

  if (ethereum?.isMetaMask) return true;
  if (Array.isArray(ethereum?.providers)) {
    return ethereum.providers.some((provider) => provider?.isMetaMask);
  }

  return false;
}

function hasOkxInjected(): boolean {
  if (typeof window === "undefined") return false;

  const maybeWindow = window as Window & {
    okxwallet?: unknown;
    okexchain?: unknown;
    ethereum?: {
      isOkxWallet?: boolean;
      providers?: Array<{ isOkxWallet?: boolean }>;
    };
  };

  if (maybeWindow.okxwallet || maybeWindow.okexchain) return true;

  const ethereum = maybeWindow.ethereum;
  if (ethereum?.isOkxWallet) return true;
  if (Array.isArray(ethereum?.providers)) {
    return ethereum.providers.some((provider) => provider?.isOkxWallet);
  }

  return false;
}

function hasPhantomInjected(): boolean {
  if (typeof window === "undefined") return false;

  const maybeWindow = window as Window & {
    phantom?: {
      ethereum?: unknown;
    };
    ethereum?: {
      isPhantom?: boolean;
      providers?: Array<{ isPhantom?: boolean }>;
    };
  };

  if (maybeWindow.phantom?.ethereum) return true;

  const ethereum = maybeWindow.ethereum;
  if (ethereum?.isPhantom) return true;
  if (Array.isArray(ethereum?.providers)) {
    return ethereum.providers.some((provider) => provider?.isPhantom);
  }

  return false;
}

function getInjectedConnectorMeta(): ConnectorMeta {
  if (hasMetaMaskInjected()) {
    return {
      title: "MetaMask",
      subtitle: "Browser extension wallet",
      accent: "from-orange-400/20 to-red-400/10",
    };
  }

  if (hasOkxInjected()) {
    return {
      title: "OKX Wallet",
      subtitle: "Browser extension wallet",
      accent: "from-yellow-300/18 to-white/8",
    };
  }

  if (hasPhantomInjected()) {
    return {
      title: "Phantom",
      subtitle: "Browser extension wallet",
      accent: "from-violet-400/20 to-fuchsia-400/10",
    };
  }

  return {
    title: "Browser Wallet",
    subtitle: "Detected injected provider",
    accent: "from-white/10 to-white/5",
  };
}

function getConnectorLabel(connector: WalletConnectorOption): ConnectorMeta {
  const lowerId = connector.id.toLowerCase();
  const lowerName = connector.name.toLowerCase();

  if (lowerId.includes("injected")) {
    return getInjectedConnectorMeta();
  }

  if (lowerName.includes("metamask") || lowerId.includes("meta")) {
    return {
      title: "MetaMask",
      subtitle: "Browser wallet",
      accent: "from-orange-400/20 to-red-400/10",
    };
  }

  if (lowerName.includes("coinbase") || lowerId.includes("coinbase")) {
    return {
      title: "Coinbase Wallet",
      subtitle: "Mobile and extension",
      accent: "from-blue-400/20 to-cyan-400/10",
    };
  }

  if (lowerName.includes("walletconnect") || lowerId.includes("walletconnect")) {
    return {
      title: "WalletConnect",
      subtitle: "QR and mobile wallets",
      accent: "from-violet-400/20 to-indigo-400/10",
    };
  }

  if (lowerName.includes("phantom") || lowerId.includes("phantom")) {
    return {
      title: "Phantom",
      subtitle: "Available wallet",
      accent: "from-violet-400/20 to-fuchsia-400/10",
    };
  }

  if (lowerName.includes("okx") || lowerId.includes("okx")) {
    return {
      title: "OKX Wallet",
      subtitle: "Available wallet",
      accent: "from-yellow-300/18 to-white/8",
    };
  }

  return {
    title: connector.name,
    subtitle: "Available wallet",
    accent: "from-white/10 to-white/5",
  };
}

function dedupeConnectors(connectors: WalletConnectorOption[]) {
  const seenTitles = new Set<string>();

  return connectors.filter((connector) => {
    const meta = getConnectorLabel(connector);
    const dedupeKey = meta.title.toLowerCase();

    if (seenTitles.has(dedupeKey)) {
      return false;
    }

    seenTitles.add(dedupeKey);
    return true;
  });
}

function prioritizeConnectors(connectors: WalletConnectorOption[]) {
  const priorityOrder = [
    "metamask",
    "browser wallet",
    "coinbase wallet",
    "walletconnect",
    "phantom",
    "okx wallet",
  ];

  return [...connectors].sort((a, b) => {
    const aTitle = getConnectorLabel(a).title.toLowerCase();
    const bTitle = getConnectorLabel(b).title.toLowerCase();

    const aIndex = priorityOrder.indexOf(aTitle);
    const bIndex = priorityOrder.indexOf(bTitle);

    const safeA = aIndex === -1 ? 999 : aIndex;
    const safeB = bIndex === -1 ? 999 : bIndex;

    return safeA - safeB;
  });
}

export default function WalletModal({
  open,
  onClose,
  walletConnected = false,
  walletAddress = null,
  walletChainLabel = null,
  walletBalanceLabel = null,
  chainId = null,
  isWrongNetwork = false,
  wrongNetworkLabel = null,
  isBalanceLoading = false,
  isConnectPending = false,
  isSwitchPending = false,
  connectors,
  onConnectWallet,
  onDisconnectWallet,
  onSwitchNetwork,
  onRefreshBalance,
}: WalletModalProps) {
  const [copied, setCopied] = useState(false);

  const explorerUrl = useMemo(
    () => getExplorerUrl(walletAddress, chainId),
    [walletAddress, chainId]
  );

  const visibleConnectors = useMemo(() => {
    return prioritizeConnectors(dedupeConnectors(connectors));
  }, [connectors]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      <button
        type="button"
        aria-label="Close wallet modal overlay"
        className="absolute inset-0 bg-black/70 backdrop-blur-[4px]"
        onClick={onClose}
      />

      <div className="absolute inset-x-3 top-[84px] z-[121] mx-auto w-auto max-w-[430px] md:right-6 md:left-auto md:mx-0">
        <div className="max-h-[calc(100vh-108px)] overflow-y-auto rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,18,0.96)_0%,rgba(8,10,16,0.96)_100%)] p-4 text-white shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/38">
                Wallet
              </div>
              <h2 className="mt-1 text-[1.22rem] font-semibold tracking-[-0.03em] text-white/95">
                {walletConnected ? "Connected wallet" : "Connect wallet"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Close wallet modal"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {!walletConnected ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[0.98rem] font-medium text-white/88">
                  Choose a wallet to connect to Corsair
                </div>
                <div className="mt-1 text-[0.9rem] leading-7 text-white/56">
                  Select your preferred wallet provider below.
                </div>
              </div>

              <div className="space-y-3">
                {visibleConnectors.length > 0 ? (
                  visibleConnectors.map((connector) => {
                    const meta = getConnectorLabel(connector);

                    return (
                      <button
                        key={connector.id}
                        type="button"
                        onClick={() => onConnectWallet(connector.id)}
                        disabled={isConnectPending}
                        className="group relative flex w-full items-center justify-between overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:border-white/16 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${meta.accent} opacity-60`}
                        />

                        <div className="relative flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/82">
                            <Wallet className="h-4.5 w-4.5" />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-[0.98rem] font-semibold text-white/92">
                              {meta.title}
                            </div>
                            <div className="truncate text-[0.84rem] text-white/52">
                              {meta.subtitle}
                            </div>
                          </div>
                        </div>

                        <div className="relative ml-3 inline-flex items-center gap-2 text-[0.84rem] font-medium text-white/52 transition group-hover:text-white/82">
                          <span>{isConnectPending ? "Connecting..." : "Connect"}</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-[20px] border border-amber-400/20 bg-amber-400/[0.06] p-4 text-[0.92rem] leading-7 text-amber-100/86">
                    No wallet connectors were detected. Open MetaMask, Coinbase Wallet,
                    or another supported wallet and refresh the page.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div
                className={`rounded-[22px] border p-4 ${
                  isWrongNetwork
                    ? "border-amber-400/20 bg-amber-400/[0.07]"
                    : "border-emerald-400/15 bg-emerald-400/[0.06]"
                }`}
              >
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/42">
                  Status
                </div>

                <div className="mt-2 flex items-start gap-3">
                  {isWrongNetwork ? (
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  )}

                  <div className="min-w-0">
                    <div className="text-[1rem] font-semibold text-white/92">
                      {isWrongNetwork ? "Connected on wrong network" : "Connected and ready"}
                    </div>
                    <div className="mt-1 text-[0.9rem] text-white/64">
                      {isWrongNetwork
                        ? wrongNetworkLabel ?? "Unsupported network"
                        : walletChainLabel ?? "Connected"}
                    </div>
                  </div>
                </div>

                {isWrongNetwork ? (
                  <button
                    type="button"
                    onClick={onSwitchNetwork}
                    disabled={isSwitchPending}
                    className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-4 text-[0.9rem] font-medium text-amber-100 transition hover:bg-amber-300/[0.14] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSwitchPending ? "Switching..." : "Switch to Arbitrum Sepolia"}
                  </button>
                ) : null}
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/40">
                  Address
                </div>

                <div className="mt-2 break-all font-mono text-[0.95rem] leading-7 text-white/90">
                  {walletAddress ?? "—"}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[0.88rem] font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy"}
                  </button>

                  {explorerUrl ? (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[0.88rem] font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      View on explorer
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}

                  <button
                    type="button"
                    onClick={onDisconnectWallet}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-red-400/15 bg-red-400/[0.06] px-4 text-[0.88rem] font-medium text-red-100 transition hover:bg-red-400/[0.12]"
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect
                  </button>
                </div>

                <div className="mt-3 text-[0.84rem] text-white/46">
                  Short form: {shortenAddress(walletAddress)}
                </div>
              </div>

              <div className="rounded-[22px] border border-cyan-400/15 bg-cyan-400/[0.06] p-4">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cyan-200/72">
                  Balance
                </div>

                <div className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-white">
                  {isBalanceLoading ? "Loading..." : walletBalanceLabel ?? "—"}
                </div>

                <div className="mt-1 text-[0.9rem] text-white/66">
                  Live balance for the connected wallet.
                </div>

                <button
                  type="button"
                  onClick={onRefreshBalance}
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[0.88rem] font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}