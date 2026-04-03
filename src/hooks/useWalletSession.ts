"use client";

import { useMemo } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

function formatBalance(value?: string, decimals = 6) {
  if (!value) return "0";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;
  return numeric.toFixed(decimals).replace(/\.?0+$/, "");
}

function shortenAddress(address?: string | null) {
  if (!address) return "Not connected";
  if (!address.startsWith("0x") || address.length < 12) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function useWalletSession() {
  const { address, isConnected, chainId, status } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useBalance({
    address,
    chainId,
    query: {
      enabled: Boolean(address && chainId),
    },
  });

  const primaryConnector = connectors[0];

  const isWrongNetwork = Boolean(isConnected && chainId !== arbitrumSepolia.id);

  const walletLabel = useMemo(() => {
    if (isConnected && address) {
      return shortenAddress(address);
    }
    return "Connect";
  }, [isConnected, address]);

  const walletChainLabel = useMemo(() => {
    if (!chainId) return null;
    if (chainId === arbitrumSepolia.id) return "Arbitrum Sepolia";
    return `Unsupported (${chainId})`;
  }, [chainId]);

  return {
    address: address ?? null,
    shortAddress: shortenAddress(address),
    isConnected,
    status,
    chainId: chainId ?? null,
    walletChainLabel,
    walletLabel,
    isWrongNetwork,
    balanceFormatted: formatBalance(balanceData?.value?.toString(), 6),
    balanceSymbol: balanceData?.symbol ?? "ETH",
    isBalanceLoading,
    isConnectPending,
    isSwitchPending,
    connectWallet: () => {
      if (!primaryConnector) return;
      connect({ connector: primaryConnector });
    },
    disconnectWallet: () => disconnect(),
    switchToArbitrumSepolia: () =>
      switchChain({ chainId: arbitrumSepolia.id }),
    refetchBalance,
  };
}