"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import {
  coinbaseWallet,
  injected,
  metaMask,
  walletConnect,
} from "wagmi/connectors";
import { arbitrumSepolia } from "wagmi/chains";

const rpcUrl =
  process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL?.trim() ||
  "https://sepolia-rollup.arbitrum.io/rpc";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() || "";

const appName = "Corsair";
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

const connectors = [
  injected({
    shimDisconnect: true,
  }),

  metaMask({
    dappMetadata: {
      name: appName,
      url: appUrl,
    },
    shimDisconnect: true,
  }),

  coinbaseWallet({
    appName,
  }),

  ...(walletConnectProjectId
    ? [
        walletConnect({
          projectId: walletConnectProjectId,
          metadata: {
            name: appName,
            description: "Corsair Chat wallet connection",
            url: appUrl,
            icons: [`${appUrl}/favicon.ico`],
          },
          showQrModal: true,
        }),
      ]
    : []),
];

const wagmiConfig = createConfig({
  chains: [arbitrumSepolia],
  connectors,
  transports: {
    [arbitrumSepolia.id]: http(rpcUrl),
  },
  ssr: false,
});

type WalletProviderProps = {
  children: ReactNode;
};

export default function WalletProvider({ children }: WalletProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}