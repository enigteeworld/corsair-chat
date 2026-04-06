import type {
  ApiMessage,
  BackendIntentResult,
  ParsedSendIntent,
  WalletContext,
} from "./types";

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
const ARBITRUM_SEPOLIA_CHAIN_NAME = "Arbitrum Sepolia";

const CORSAIR_ARBITRUM_BACKEND_URL =
  process.env.CORSAIR_ARBITRUM_BACKEND_URL?.trim() || "http://127.0.0.1:3001";

function shortenAddress(value: string) {
  if (!value.startsWith("0x") || value.length < 14) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function formatEthAmount(value: string) {
  const asNumber = Number(value);
  if (!Number.isFinite(asNumber)) return value;
  return asNumber.toString();
}

function formatConnectedWalletLine(wallet?: WalletContext) {
  if (wallet?.connected && wallet.address) {
    const chainLabel = wallet.chainName
      ? `${wallet.chainName}${
          typeof wallet.chainId === "number" ? ` (${wallet.chainId})` : ""
        }`
      : typeof wallet.chainId === "number"
        ? `Chain ${wallet.chainId}`
        : "Connected";

    return `- Connected user wallet: ${shortenAddress(wallet.address)} on ${chainLabel}`;
  }

  return "- Connected user wallet: none";
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from ${url}: ${text}`);
  }

  if (!response.ok) {
    throw new Error(
      `Request failed for ${url}: ${JSON.stringify(data, null, 2)}`
    );
  }

  return data as T;
}

function getLastUserMessage(messages: ApiMessage[]): string {
  const reversed = [...messages].reverse();
  const lastUser = reversed.find((message) => message.role === "user");
  return lastUser?.content?.trim() ?? "";
}

function getPreviousAssistantMessage(messages: ApiMessage[]): string {
  const lastIndex = messages.length - 1;

  for (let i = lastIndex - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "assistant") {
      return messages[i].content.trim();
    }
  }

  return "";
}

function parseTreasurySendIntent(input: string): ParsedSendIntent | null {
  const match = input.match(
    /\bsend\s+([0-9]*\.?[0-9]+)\s*(eth)\s+to\s+(0x[a-fA-F0-9]{40})\b/i
  );

  if (!match) {
    return null;
  }

  const normalized = input.toLowerCase();
  if (
    normalized.includes("from my wallet") ||
    normalized.includes("with my wallet") ||
    normalized.includes("using my wallet")
  ) {
    return null;
  }

  const amount = match[1];
  const to = match[3] as `0x${string}`;

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return null;
  }

  return {
    amount,
    asset: "ETH",
    to,
  };
}

function parseUserWalletSendIntent(input: string): ParsedSendIntent | null {
  const match = input.match(
    /\bsend\s+([0-9]*\.?[0-9]+)\s*(eth)\s+(?:from|with|using)\s+my\s+wallet\s+to\s+(0x[a-fA-F0-9]{40})\b/i
  );

  if (!match) {
    return null;
  }

  const amount = match[1];
  const to = match[3] as `0x${string}`;

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return null;
  }

  return {
    amount,
    asset: "ETH",
    to,
  };
}

function isTreasuryConfirmationPrompt(message: string) {
  return message.includes("## Pending Treasury send confirmation");
}

function isUserWalletConfirmationPrompt(message: string) {
  return message.includes("## Pending user wallet send confirmation");
}

function isConfirmMessage(input: string) {
  const normalized = input.trim().toLowerCase();
  return (
    normalized === "confirm" ||
    normalized === "confirm send" ||
    normalized === "yes confirm" ||
    normalized === "yes, confirm" ||
    normalized === "proceed" ||
    normalized === "approve send"
  );
}

function isCancelMessage(input: string) {
  const normalized = input.trim().toLowerCase();
  return (
    normalized === "cancel" ||
    normalized === "cancel send" ||
    normalized === "stop" ||
    normalized === "never mind" ||
    normalized === "dont send" ||
    normalized === "don't send"
  );
}

function findPendingTreasurySendIntent(
  messages: ApiMessage[]
): ParsedSendIntent | null {
  if (messages.length < 3) {
    return null;
  }

  const currentUserIndex = messages.length - 1;
  if (messages[currentUserIndex]?.role !== "user") {
    return null;
  }

  let confirmationAssistantIndex = -1;

  for (let i = currentUserIndex - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (
      message.role === "assistant" &&
      isTreasuryConfirmationPrompt(message.content)
    ) {
      confirmationAssistantIndex = i;
      break;
    }
  }

  if (confirmationAssistantIndex === -1) {
    return null;
  }

  for (let i = confirmationAssistantIndex - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.role !== "user") continue;

    const parsed = parseTreasurySendIntent(message.content);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function buildTreasurySendConfirmationReply(
  intent: ParsedSendIntent,
  wallet?: WalletContext
) {
  return [
    "## Pending Treasury send confirmation",
    "",
    "I’m ready to execute this treasury transfer.",
    "",
    "### Action",
    "",
    `- Asset: ${intent.asset}`,
    `- Amount: ${formatEthAmount(intent.amount)}`,
    `- Destination: ${intent.to}`,
    `- Network: ${ARBITRUM_SEPOLIA_CHAIN_NAME}`,
    "",
    "### Execution context",
    "",
    "- Execution wallet: Corsair Treasury",
    formatConnectedWalletLine(wallet),
    "- Action type: treasury-managed backend execution",
    "",
    "This path uses the Corsair treasury wallet exposed by the backend. It does not use the connected user wallet.",
    "",
    "Reply with `confirm send` to execute it.",
    "Reply with `cancel` to stop it.",
  ].join("\n");
}

function buildUserWalletSendConfirmationReply(
  intent: ParsedSendIntent,
  wallet?: WalletContext
) {
  return [
    "## Pending user wallet send confirmation",
    "",
    "I’m ready to prepare this connected-wallet transfer.",
    "",
    "### Action",
    "",
    `- Asset: ${intent.asset}`,
    `- Amount: ${formatEthAmount(intent.amount)}`,
    `- Destination: ${intent.to}`,
    `- Network: ${ARBITRUM_SEPOLIA_CHAIN_NAME}`,
    "",
    "### Execution context",
    "",
    "- Execution wallet: connected user wallet",
    formatConnectedWalletLine(wallet),
    "- Action type: user-wallet execution via MetaMask / wagmi",
    "",
    "This path should open the connected wallet for approval. It does not use the Corsair treasury wallet.",
    "",
    "Use the **Confirm wallet send** button below to execute it from the connected wallet.",
    "Use **Cancel** to stop it.",
  ].join("\n");
}

function buildConnectedWalletReadoutReply(wallet?: WalletContext) {
  if (!wallet?.connected || !wallet.address) {
    return [
      "## Connected user wallet readout",
      "",
      "- Status: not connected",
      "- Address: —",
      "- Chain: —",
      "",
      "Connect a wallet from the header first, then try again.",
    ].join("\n");
  }

  return [
    "## Connected user wallet readout",
    "",
    `- Address: ${wallet.address}`,
    `- Short form: ${shortenAddress(wallet.address)}`,
    `- Chain: ${wallet.chainName ?? "Unknown"}${
      typeof wallet.chainId === "number" ? ` (${wallet.chainId})` : ""
    }`,
    "",
    "This is the connected user wallet context available in the current session.",
  ].join("\n");
}

function buildSwitchWalletNetworkReply(wallet?: WalletContext) {
  return [
    "## Switch wallet network",
    "",
    formatConnectedWalletLine(wallet),
    "",
    `User-wallet actions should run on ${ARBITRUM_SEPOLIA_CHAIN_NAME} (${ARBITRUM_SEPOLIA_CHAIN_ID}).`,
    "",
    "Use the **Switch to Arbitrum Sepolia** button below.",
  ].join("\n");
}

async function handleReadArbitrumWallet(wallet?: WalletContext): Promise<string> {
  const data = await fetchJson<{
    address: string;
    chainId: number;
    chainName: string;
    blockNumber: string;
    gasPriceWei: string;
    nativeBalanceWei: string;
    nativeBalanceEth: string;
    nativeSymbol: string;
    rpcUrl: string;
  }>(`${CORSAIR_ARBITRUM_BACKEND_URL}/read`);

  return [
    "## Corsair treasury readout",
    "",
    `- Treasury address: ${data.address}`,
    `- Chain: ${data.chainName} (${data.chainId})`,
    `- Block number: ${data.blockNumber}`,
    `- Gas price (wei): ${data.gasPriceWei}`,
    `- Native balance: ${data.nativeBalanceEth} ${data.nativeSymbol}`,
    `- RPC: ${data.rpcUrl}`,
    "",
    "### Separation",
    "",
    "- Wallet shown here is the Corsair treasury wallet used for backend-managed execution.",
    formatConnectedWalletLine(wallet),
  ].join("\n");
}

async function executeSendArbitrumEth(
  intent: ParsedSendIntent,
  wallet?: WalletContext
): Promise<string> {
  const data = await fetchJson<{
    success: boolean;
    hash: string;
    error?: string;
  }>(`${CORSAIR_ARBITRUM_BACKEND_URL}/action/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: intent.to,
      amount: intent.amount,
    }),
  });

  return [
    "## Treasury send executed",
    "",
    "### Result",
    "",
    `- Asset: ${intent.asset}`,
    `- Amount: ${formatEthAmount(intent.amount)}`,
    `- Destination: ${intent.to}`,
    `- Status: success`,
    "",
    "### Execution context",
    "",
    "- Execution wallet: Corsair Treasury",
    formatConnectedWalletLine(wallet),
    "- Action type: treasury-managed backend execution",
    "",
    "### Transaction",
    "",
    `- Transaction hash: ${data.hash}`,
    `- Explorer: Arbiscan tx https://sepolia.arbiscan.io/tx/${data.hash}`,
  ].join("\n");
}

export async function maybeHandleWalletIntent(
  messages: ApiMessage[],
  wallet?: WalletContext
): Promise<BackendIntentResult> {
  const lastUserMessage = getLastUserMessage(messages);
  const previousAssistantMessage = getPreviousAssistantMessage(messages);
  const lower = lastUserMessage.toLowerCase();

  if (!lastUserMessage) {
    return { handled: false };
  }

  if (
    lower.includes("read arbitrum wallet") ||
    lower.includes("show arbitrum wallet") ||
    lower.includes("arbitrum readout") ||
    lower === "read wallet"
  ) {
    return {
      handled: true,
      reply: await handleReadArbitrumWallet(wallet),
    };
  }

  if (
    lower === "read my wallet" ||
    lower.includes("show my wallet") ||
    lower.includes("connected wallet readout")
  ) {
    return {
      handled: true,
      reply: buildConnectedWalletReadoutReply(wallet),
    };
  }

  if (
    lower.includes("switch my wallet to arbitrum sepolia") ||
    lower.includes("switch wallet to arbitrum sepolia") ||
    lower.includes("switch to arbitrum sepolia")
  ) {
    return {
      handled: true,
      reply: buildSwitchWalletNetworkReply(wallet),
    };
  }

  const userWalletSendIntent = parseUserWalletSendIntent(lastUserMessage);
  if (userWalletSendIntent) {
    return {
      handled: true,
      reply: buildUserWalletSendConfirmationReply(userWalletSendIntent, wallet),
    };
  }

  const treasurySendIntent = parseTreasurySendIntent(lastUserMessage);
  if (treasurySendIntent) {
    return {
      handled: true,
      reply: buildTreasurySendConfirmationReply(treasurySendIntent, wallet),
    };
  }

  if (
    isConfirmMessage(lastUserMessage) &&
    isUserWalletConfirmationPrompt(previousAssistantMessage)
  ) {
    return {
      handled: true,
      reply: [
        "## Connected wallet confirmation",
        "",
        "Use the **Confirm wallet send** button in the most recent assistant card to execute this from the connected wallet.",
      ].join("\n"),
    };
  }

  if (
    isCancelMessage(lastUserMessage) &&
    isUserWalletConfirmationPrompt(previousAssistantMessage)
  ) {
    return {
      handled: true,
      reply: "Cancelled. No connected-wallet transaction was sent.",
    };
  }

  if (
    isConfirmMessage(lastUserMessage) &&
    isTreasuryConfirmationPrompt(previousAssistantMessage)
  ) {
    const pendingIntent = findPendingTreasurySendIntent(messages);

    if (!pendingIntent) {
      return {
        handled: true,
        reply:
          "I couldn’t find a pending treasury transfer to confirm. Start again with `send 0.001 ETH to 0x...`.",
      };
    }

    return {
      handled: true,
      reply: await executeSendArbitrumEth(pendingIntent, wallet),
    };
  }

  if (
    isCancelMessage(lastUserMessage) &&
    isTreasuryConfirmationPrompt(previousAssistantMessage)
  ) {
    return {
      handled: true,
      reply: "Cancelled. No treasury transaction was sent.",
    };
  }

  if (
    lower.startsWith("send ") &&
    lower.includes("eth") &&
    lower.includes("my wallet")
  ) {
    return {
      handled: true,
      reply: [
        "To use the connected-wallet flow, use this format:",
        "",
        "`send 0.001 ETH from my wallet to 0x1234...abcd`",
      ].join("\n"),
    };
  }

  if (lower.startsWith("send ") && lower.includes("eth")) {
    return {
      handled: true,
      reply: [
        "I’m ready to prepare an ETH transfer on Arbitrum.",
        "",
        "Use either:",
        "",
        "`send 0.001 ETH to 0x1234...abcd`",
        "",
        "for treasury execution, or:",
        "",
        "`send 0.001 ETH from my wallet to 0x1234...abcd`",
        "",
        "for connected-wallet execution.",
      ].join("\n"),
    };
  }

  return { handled: false };
}