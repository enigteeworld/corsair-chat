"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAccount, useBalance, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import TopNav from "@/components/top-nav";
import MobileDrawer from "@/components/mobile-drawer";
import WalletModal from "@/components/wallet-modal";

type SiteShellProps = {
  children: ReactNode;
};

function formatBalance(value?: string, digits = 6) {
  if (!value) return "0";
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return num.toFixed(num >= 1 ? 4 : digits);
}

export default function SiteShell({ children }: SiteShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletPanelOpen, setWalletPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { address, isConnected, chainId } = useAccount();

  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
    address,
    query: {
      enabled: Boolean(address),
    },
  });

  const { connectors, connect, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOverlayOpen = mobileOpen || walletPanelOpen;

  useEffect(() => {
    if (isOverlayOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOverlayOpen]);

  const walletConnected = mounted ? isConnected : false;
  const isWrongNetwork =
    mounted && walletConnected && typeof chainId === "number"
      ? chainId !== arbitrumSepolia.id
      : false;

  const walletChainLabel = useMemo(() => {
    if (!mounted || !walletConnected) return null;
    if (isWrongNetwork) return `Unsupported (${chainId ?? "unknown"})`;
    return "Arbitrum Sepolia";
  }, [mounted, walletConnected, isWrongNetwork, chainId]);

  const walletBalanceLabel = useMemo(() => {
    if (!mounted || !walletConnected || !balanceData) return null;
    const formatted = (Number(balanceData.value) / 10 ** balanceData.decimals).toString();
    return `${formatBalance(formatted)} ${balanceData.symbol ?? "ETH"}`;
  }, [mounted, walletConnected, balanceData]);

  const availableConnectors = useMemo(
    () =>
      connectors.map((connector) => ({
        id: connector.id,
        name: connector.name,
      })),
    [connectors]
  );

  async function handleRefreshBalance() {
    try {
      await refetchBalance();
    } catch {
      // ignore refresh failures in UI shell
    }
  }

  function handleConnectWallet(connectorId: string) {
    const connector = connectors.find((item) => item.id === connectorId);
    if (!connector) return;
    connect({ connector });
  }

  function handleDisconnectWallet() {
    disconnect();
    setWalletPanelOpen(false);
  }

  function handleSwitchToArbitrumSepolia() {
    switchChain({ chainId: arbitrumSepolia.id });
  }

  return (
    <>
      <TopNav
        onOpenMobileMenu={() => setMobileOpen(true)}
        onOpenWalletPanel={() => setWalletPanelOpen(true)}
        walletConnected={walletConnected}
        walletAddress={walletConnected ? address ?? null : null}
        walletChainLabel={walletConnected ? walletChainLabel : null}
      />

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <WalletModal
        open={walletPanelOpen}
        onClose={() => setWalletPanelOpen(false)}
        walletConnected={walletConnected}
        walletAddress={walletConnected ? address ?? null : null}
        walletChainLabel={walletChainLabel}
        walletBalanceLabel={walletBalanceLabel}
        chainId={chainId ?? null}
        isWrongNetwork={isWrongNetwork}
        wrongNetworkLabel={isWrongNetwork ? `Unsupported (${chainId ?? "unknown"})` : null}
        isBalanceLoading={isBalanceLoading}
        isConnectPending={isConnectPending}
        isSwitchPending={isSwitchPending}
        connectors={availableConnectors}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onSwitchNetwork={handleSwitchToArbitrumSepolia}
        onRefreshBalance={handleRefreshBalance}
      />

      <main className="overflow-x-hidden">{children}</main>
    </>
  );
}