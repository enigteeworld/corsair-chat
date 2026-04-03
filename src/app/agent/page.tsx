"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatUnits } from "viem";
import {
  Check,
  Music4,
  PanelLeft,
  Plus,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Video,
  X,
} from "lucide-react";
import { AssistantMessage } from "@/components/chat/AssistantMessage";
import { Composer } from "@/components/chat/Composer";
import { SessionList } from "@/components/chat/SessionList";
import { UserMessage } from "@/components/chat/UserMessage";
import {
  DEFAULT_PERSONALITY,
  personalitySummary,
  useChatSessions,
} from "@/hooks/useChatSessions";
import { formatBytes, useComposer } from "@/hooks/useComposer";
import type {
  ChatMessage,
  PersonalityConfig,
  PersonalityStyle,
  PersonalityTone,
  PendingAttachment,
} from "@/types/chat";

const SYMBOL_OPTIONS = ["😏", "⚡", "🧠", "✦"];
const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

type ParsedWalletSend = {
  amount: string;
  to: `0x${string}`;
};

type PendingWalletExecution = {
  hash: `0x${string}`;
  amount: string;
  to: `0x${string}`;
};

function formatWalletBalance(formatted?: string, symbol?: string) {
  if (!formatted) {
    return "—";
  }

  const value = Number(formatted);
  if (!Number.isFinite(value)) {
    return symbol ? `${formatted} ${symbol}` : formatted;
  }

  const trimmed =
    value >= 1 ? value.toFixed(4) : value > 0 ? value.toFixed(6) : "0";

  return symbol ? `${trimmed} ${symbol}` : trimmed;
}

function parsePendingUserWalletSendContent(content: string): ParsedWalletSend | null {
  const amountMatch = content.match(/- Amount:\s*([0-9]*\.?[0-9]+)/i);
  const destinationMatch = content.match(/- Destination:\s*(0x[a-fA-F0-9]{40})/i);

  if (!amountMatch || !destinationMatch) {
    return null;
  }

  const amount = amountMatch[1];
  const to = destinationMatch[1] as `0x${string}`;

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return null;
  }

  return { amount, to };
}

function shortenAddress(value?: string | null) {
  if (!value || !value.startsWith("0x") || value.length < 14) {
    return value ?? "—";
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function buildConnectedWalletLine(
  address?: string | null,
  chainName?: string | null,
  chainId?: number
) {
  if (!address) {
    return "- Connected user wallet: none";
  }

  const chainLabel = chainName
    ? `${chainName}${typeof chainId === "number" ? ` (${chainId})` : ""}`
    : typeof chainId === "number"
      ? `Chain ${chainId}`
      : "Connected";

  return `- Connected user wallet: ${shortenAddress(address)} on ${chainLabel}`;
}

function buildLocalAssistantMessage(content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
  };
}

function OrbitalBackground() {
  return (
    <div className="orbital-bg">
      <div className="orbital-ring left-1/2 top-[44px] h-[820px] w-[820px] -translate-x-1/2 max-md:top-[140px] max-md:h-[500px] max-md:w-[500px]" />
      <div className="orbital-ring left-1/2 top-[154px] h-[620px] w-[620px] -translate-x-1/2 max-md:top-[220px] max-md:h-[360px] max-md:w-[360px]" />
      <div className="orbital-ring left-1/2 top-[254px] h-[430px] w-[430px] -translate-x-1/2 max-md:top-[285px] max-md:h-[230px] max-md:w-[230px]" />
      <div className="orbital-dot left-[4.3%] top-[158px] max-md:left-[4%] max-md:top-[360px]" />
      <div className="orbital-dot right-[7.8%] top-[266px] max-md:right-[7%] max-md:top-[490px]" />
      <div className="orbital-dot right-[26%] top-[341px] max-md:right-[22%] max-md:top-[330px]" />
      <div className="floating-diamond left-[8%] top-[530px] max-md:left-[2%] max-md:top-[930px]" />
      <div className="floating-diamond right-[9%] top-[220px] max-md:right-[4%] max-md:top-[250px]" />
    </div>
  );
}

function QuickAction({
  label,
  icon,
  tone,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: ReactNode;
  tone: "emerald" | "fuchsia" | "violet" | "amber";
  onClick: () => void;
  disabled?: boolean;
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-500/35 text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_0_0_1px_rgba(16,185,129,0.03),0_12px_28px_rgba(16,185,129,0.06)]"
      : tone === "fuchsia"
        ? "border-fuchsia-500/35 text-fuchsia-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_0_0_1px_rgba(217,70,239,0.03),0_12px_28px_rgba(217,70,239,0.06)]"
        : tone === "violet"
          ? "border-violet-500/35 text-violet-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_0_0_1px_rgba(139,92,246,0.03),0_12px_28px_rgba(139,92,246,0.06)]"
          : "border-amber-500/35 text-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_0_0_1px_rgba(245,158,11,0.03),0_12px_28px_rgba(245,158,11,0.06)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-[44px] items-center justify-center gap-2 rounded-full border bg-black/18 px-3 text-[0.86rem] font-medium leading-none transition hover:scale-[1.01] hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60 md:h-[56px] md:gap-2.5 md:px-6 md:text-[0.96rem] ${toneClass}`}
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function PersonalityChip({
  isActive,
  children,
  onClick,
}: {
  isActive: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[36px] items-center justify-center rounded-full border px-4 text-[0.86rem] font-medium transition duration-200 md:h-[40px] md:text-[0.92rem] ${
        isActive
          ? "scale-[1.02] border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_12px_28px_rgba(34,211,238,0.10),inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "border-white/10 bg-white/[0.03] text-white/64 hover:scale-[1.015] hover:bg-white/[0.05] hover:text-white/84"
      }`}
    >
      {children}
    </button>
  );
}

function PersonalityEditor({
  personality,
  onChange,
  onSave,
  onUseDefault,
  compact = false,
}: {
  personality: PersonalityConfig;
  onChange: (partial: Partial<PersonalityConfig>) => void;
  onSave: () => void;
  onUseDefault: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`glass-panel mx-auto text-left ${
        compact
          ? "w-full max-w-[500px] rounded-[20px] p-4 md:rounded-[22px] md:p-4"
          : "mt-5 max-w-[540px] rounded-[20px] p-4 md:mt-6 md:rounded-[22px] md:p-4"
      }`}
    >
      <div className="mx-auto max-w-[480px]">
        <div className="text-center">
          <div className="text-[1rem] font-semibold tracking-[-0.03em] text-white/94 md:text-[1.12rem]">
            Configure Corsair
          </div>
          <p className="mx-auto mt-1.5 max-w-[420px] text-balance text-[0.84rem] leading-5 text-white/56 md:text-[0.9rem]">
            Configure how Corsair operates in this session.
          </p>
        </div>

        <div className="mt-4 space-y-3.5 md:mt-5 md:space-y-4">
          <div>
            <div className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.15em] text-white/40">
              Tone
            </div>
            <div className="flex flex-wrap gap-2.5">
              {(["calm", "sharp", "blunt", "playful"] as PersonalityTone[]).map(
                (tone) => (
                  <PersonalityChip
                    key={tone}
                    isActive={personality.tone === tone}
                    onClick={() => onChange({ tone })}
                  >
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </PersonalityChip>
                )
              )}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.15em] text-white/40">
              Style
            </div>
            <div className="flex flex-wrap gap-2.5">
              {(["concise", "balanced", "detailed"] as PersonalityStyle[]).map(
                (style) => (
                  <PersonalityChip
                    key={style}
                    isActive={personality.style === style}
                    onClick={() => onChange({ style })}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </PersonalityChip>
                )
              )}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.15em] text-white/40">
              Symbol
            </div>
            <div className="flex flex-wrap gap-2.5">
              {SYMBOL_OPTIONS.map((symbol) => (
                <PersonalityChip
                  key={symbol}
                  isActive={personality.symbol === symbol}
                  onClick={() =>
                    onChange({
                      symbol: personality.symbol === symbol ? "" : symbol,
                    })
                  }
                >
                  <span className="text-[1rem] md:text-[1.02rem]">{symbol}</span>
                </PersonalityChip>
              ))}
            </div>
          </div>

          <div className="rounded-[14px] border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-center">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.13em] text-white/36">
              Current profile
            </div>
            <div className="mt-1 text-[0.9rem] font-medium text-white/88 md:text-[0.96rem]">
              {personalitySummary(personality)}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-0.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onUseDefault}
              className="inline-flex h-[40px] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 text-[0.86rem] font-medium text-white/68 transition hover:bg-white/[0.05] hover:text-white/88"
            >
              Use default
            </button>

            <button
              type="button"
              onClick={onSave}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full bg-white px-4 text-[0.86rem] font-medium text-black transition hover:bg-white/90"
            >
              <Check className="h-4 w-4" />
              Save profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReconfigureOpen, setIsReconfigureOpen] = useState(false);
  const [pendingWalletExecution, setPendingWalletExecution] =
    useState<PendingWalletExecution | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const homepageIntentHandledRef = useRef(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const { address, isConnected, chain } = useAccount();

  const {
    data: balanceData,
    refetch: refetchBalance,
    isFetching: isBalanceFetching,
  } = useBalance({
    address,
    chainId: chain?.id,
    query: {
      enabled: Boolean(address) && Boolean(isConnected),
    },
  });

  const { sendTransactionAsync } = useSendTransaction();

  const {
    switchChainAsync,
    isPending: isSwitchingChain,
  } = useSwitchChain();

  const { data: walletReceipt, error: walletReceiptError } =
    useWaitForTransactionReceipt({
      hash: pendingWalletExecution?.hash,
      query: {
        enabled: Boolean(pendingWalletExecution?.hash),
      },
    });

  const {
    sessions,
    setSessions,
    activeSessionId,
    activeSession,
    updateActiveSession,
    setActivePersonality,
    createNewChat,
    selectSession,
    deleteSession,
  } = useChatSessions();

  const {
    query,
    setQuery,
    pendingAttachments,
    resetComposer,
    fileInputRef,
    openFilePicker,
    handleFilesSelected,
    removeAttachment,
    createComposerKeyDownHandler,
  } = useComposer();

  const messages = activeSession?.messages ?? [];
  const hasMessages = messages.length > 0;
  const activePersonality = activeSession?.personality ?? DEFAULT_PERSONALITY;
  const handleComposerKeyDown = createComposerKeyDownHandler(handleSubmit);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isLoading, activeSessionId]);

  useEffect(() => {
    if (!activeSession) return;
    if (homepageIntentHandledRef.current) return;

    const shouldCreateNew = searchParams.get("new") === "1";
    const incomingQuery = searchParams.get("q")?.trim() ?? "";

    if (!shouldCreateNew && !incomingQuery) return;

    if (activeSession.messages.length > 0) {
      createNewChat();
      return;
    }

    homepageIntentHandledRef.current = true;

    if (incomingQuery) {
      void sendMessage(incomingQuery);
    }

    router.replace("/agent");
  }, [activeSession, searchParams, router, createNewChat]);

  useEffect(() => {
    if (!walletReceipt || !pendingWalletExecution) {
      return;
    }

    const txHash = pendingWalletExecution.hash;
    const explorerUrl = `https://sepolia.arbiscan.io/tx/${txHash}`;

    appendAssistantMessage(
      [
        "## User wallet send executed",
        "",
        "### Result",
        "",
        `- Asset: ETH`,
        `- Amount: ${pendingWalletExecution.amount}`,
        `- Destination: ${pendingWalletExecution.to}`,
        `- Status: success`,
        "",
        "### Execution context",
        "",
        "- Execution wallet: connected user wallet",
        buildConnectedWalletLine(address, chain?.name ?? null, chain?.id),
        "- Action type: user-wallet execution via MetaMask / wagmi",
        "",
        "### Transaction",
        "",
        `- Transaction hash: ${txHash}`,
        `- Explorer: ${explorerUrl}`,
      ].join("\n")
    );

    setPendingWalletExecution(null);
    void refetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletReceipt]);

  useEffect(() => {
    if (!walletReceiptError || !pendingWalletExecution) {
      return;
    }

    appendAssistantMessage(
      [
        "## User wallet send failed",
        "",
        `- Status: failed`,
        `- Reason: ${
          walletReceiptError instanceof Error
            ? walletReceiptError.message
            : "Transaction receipt failed."
        }`,
      ].join("\n")
    );

    setPendingWalletExecution(null);
  }, [walletReceiptError, pendingWalletExecution]);

  function appendAssistantMessage(content: string) {
    if (!activeSessionId) return;

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== activeSessionId) return session;

        return {
          ...session,
          messages: [...session.messages, buildLocalAssistantMessage(content)],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }

  function handleSkipPersonalitySetup() {
    setActivePersonality(
      {
        tone: "sharp",
        style: "balanced",
        symbol: "",
      },
      true
    );
  }

  function handleSaveReconfigure() {
    setActivePersonality(
      {
        tone: activePersonality.tone,
        style: activePersonality.style,
        symbol: activePersonality.symbol ?? "",
      },
      true
    );

    setIsReconfigureOpen(false);
  }

  async function sendMessage(
    content: string,
    attachmentsOverride?: PendingAttachment[]
  ) {
    const trimmed = content.trim();
    const attachments = attachmentsOverride ?? pendingAttachments;

    if ((!trimmed && attachments.length === 0) || isLoading || !activeSession) return;

    const attachmentSummary =
      attachments.length > 0
        ? `\n\nAttached files:\n${attachments
            .map(
              (attachment) =>
                `- ${attachment.name} (${formatBytes(attachment.size)})`
            )
            .join("\n")}`
        : "";

    const backendContent = `${trimmed}${attachmentSummary}`.trim();

    const visibleContent =
      trimmed ||
      `Attached files:\n${attachments
        .map((attachment) => `• ${attachment.name}`)
        .join("\n")}`;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: visibleContent,
    };

    const assistantMessageId = crypto.randomUUID();

    const nextMessages = [
      ...activeSession.messages,
      {
        ...userMessage,
        content: backendContent,
      },
    ];

    const nextTitle =
      activeSession.messages.length === 0
        ? (trimmed || attachments[0]?.name || "New chat").slice(0, 34)
        : activeSession.title;

    updateActiveSession((session) => ({
      ...session,
      title: nextTitle || "New chat",
      messages: [
        ...session.messages,
        userMessage,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
        },
      ],
      updatedAt: new Date().toISOString(),
    }));

    resetComposer();
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personality: {
            tone: activeSession.personality.tone,
            style: activeSession.personality.style,
            symbol: activeSession.personality.symbol ?? "",
          },
          wallet: {
            connected: isConnected,
            address: address ?? undefined,
            chainId: chain?.id,
            chainName: chain?.name,
          },
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (!res.ok) {
        let errorText = "Something went wrong while talking to Corsair.";

        try {
          const data = await res.json();
          if (typeof data?.error === "string") {
            errorText = data.error;
          }
        } catch {
          // ignore
        }

        setSessions((prev) =>
          prev.map((session) => {
            if (session.id !== activeSessionId) return session;

            return {
              ...session,
              title: nextTitle || "New chat",
              messages: session.messages.map((message) =>
                message.id === assistantMessageId
                  ? {
                      ...message,
                      content: `Error: ${errorText}`,
                    }
                  : message
              ),
              updatedAt: new Date().toISOString(),
            };
          })
        );
        return;
      }

      if (res.body && contentType.includes("text/plain")) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          await new Promise((resolve) => setTimeout(resolve, 8));
          fullText += chunk;

          setSessions((prev) =>
            prev.map((session) => {
              if (session.id !== activeSessionId) return session;

              return {
                ...session,
                title: nextTitle || "New chat",
                messages: session.messages.map((message) =>
                  message.id === assistantMessageId
                    ? {
                        ...message,
                        content: fullText,
                      }
                    : message
                ),
                updatedAt: new Date().toISOString(),
              };
            })
          );
        }

        return;
      }

      const data = await res.json();
      const reply =
        typeof data?.reply === "string"
          ? data.reply
          : "Corsair returned no response.";

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== activeSessionId) return session;

          return {
            ...session,
            title: nextTitle || "New chat",
            messages: session.messages.map((message) =>
              message.id === assistantMessageId
                ? {
                    ...message,
                    content: reply,
                  }
                : message
            ),
            updatedAt: new Date().toISOString(),
          };
        })
      );
    } catch {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== activeSessionId) return session;

          return {
            ...session,
            title: nextTitle || "New chat",
            messages: session.messages.map((message) =>
              message.id === assistantMessageId
                ? {
                    ...message,
                    content: "Error: Failed to reach the backend.",
                  }
                : message
            ),
            updatedAt: new Date().toISOString(),
          };
        })
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmConnectedWalletSend(content: string) {
    const parsed = parsePendingUserWalletSendContent(content);

    if (!parsed) {
      appendAssistantMessage(
        [
          "## Connected wallet send",
          "",
          "I couldn’t parse the pending connected-wallet send request.",
        ].join("\n")
      );
      return;
    }

    if (!isConnected || !address) {
      appendAssistantMessage(
        [
          "## Connected wallet send",
          "",
          "- Status: wallet not connected",
          "",
          "Connect your wallet first, then confirm again.",
        ].join("\n")
      );
      return;
    }

    if (chain?.id !== ARBITRUM_SEPOLIA_CHAIN_ID) {
      appendAssistantMessage(
        [
          "## Switch wallet network",
          "",
          buildConnectedWalletLine(address, chain?.name ?? null, chain?.id),
          "",
          "Your connected wallet is not on Arbitrum Sepolia.",
          "",
          "Use the **Switch to Arbitrum Sepolia** button below, then confirm the wallet send again.",
        ].join("\n")
      );
      return;
    }

    try {
      const hash = await sendTransactionAsync({
        to: parsed.to,
        value: parseEther(parsed.amount),
      });

      setPendingWalletExecution({
        hash,
        amount: parsed.amount,
        to: parsed.to,
      });

      appendAssistantMessage(
        [
          "## User wallet send submitted",
          "",
          "### Result",
          "",
          `- Asset: ETH`,
          `- Amount: ${parsed.amount}`,
          `- Destination: ${parsed.to}`,
          `- Status: submitted`,
          "",
          "### Execution context",
          "",
          "- Execution wallet: connected user wallet",
          buildConnectedWalletLine(address, chain?.name ?? null, chain?.id),
          "- Action type: user-wallet execution via MetaMask / wagmi",
          "",
          "### Transaction",
          "",
          `- Transaction hash: ${hash}`,
          `- Explorer: https://sepolia.arbiscan.io/tx/${hash}`,
        ].join("\n")
      );
    } catch (error) {
      appendAssistantMessage(
        [
          "## User wallet send failed",
          "",
          `- Status: rejected or failed`,
          `- Reason: ${
            error instanceof Error
              ? error.message
              : "Wallet transaction could not be submitted."
          }`,
        ].join("\n")
      );
    }
  }

  async function handleSwitchConnectedWalletNetwork() {
    if (!isConnected || !address) {
      appendAssistantMessage(
        [
          "## Switch wallet network",
          "",
          "- Status: wallet not connected",
          "",
          "Connect your wallet first, then switch network.",
        ].join("\n")
      );
      return;
    }

    try {
      await switchChainAsync({ chainId: ARBITRUM_SEPOLIA_CHAIN_ID });

      appendAssistantMessage(
        [
          "## Wallet network switched",
          "",
          buildConnectedWalletLine(
            address,
            "Arbitrum Sepolia",
            ARBITRUM_SEPOLIA_CHAIN_ID
          ),
          "",
          "Connected wallet network is now aligned for Arbitrum actions.",
        ].join("\n")
      );

      void refetchBalance();
    } catch (error) {
      appendAssistantMessage(
        [
          "## Switch wallet network",
          "",
          `- Status: failed`,
          `- Reason: ${
            error instanceof Error
              ? error.message
              : "Network switch request failed."
          }`,
        ].join("\n")
      );
    }
  }

  async function handleAssistantAction(prompt: string, content: string) {
    if (prompt === "__wallet_send_confirm__") {
      await handleConfirmConnectedWalletSend(content);
      return;
    }

    if (prompt === "__wallet_send_cancel__") {
      appendAssistantMessage(
        "## Connected wallet send cancelled\n\nNo connected-wallet transaction was sent."
      );
      return;
    }

    if (prompt === "__wallet_switch_arbitrum_sepolia__") {
      await handleSwitchConnectedWalletNetwork();
      return;
    }

    if (prompt === "__wallet_read__") {
      void sendMessage("read my wallet", []);
      return;
    }

    void sendMessage(prompt, []);
  }

  function handleSubmit() {
    void sendMessage(query);
  }

  function handleQuickAction(prompt: string) {
    void sendMessage(prompt, []);
  }

  function handleGenerateImageAction() {
    setQuery("Generate an image for: ");
  }

  function handleNewChat() {
    if (isLoading) return;

    createNewChat({
      closeUi: () => {
        setIsSidebarOpen(false);
        setIsReconfigureOpen(false);
      },
      resetUi: resetComposer,
    });
  }

  function handleSelectSession(sessionId: string) {
    selectSession(sessionId, {
      closeUi: () => {
        setIsSidebarOpen(false);
        setIsReconfigureOpen(false);
      },
      resetUi: resetComposer,
    });
  }

  function handleDeleteSession(sessionId: string) {
    deleteSession(sessionId, {
      isLoading,
      closeUi: () => {
        setIsSidebarOpen(false);
        setIsReconfigureOpen(false);
      },
      resetUi: resetComposer,
    });
  }

  return (
    <div className="page-grid relative h-screen overflow-hidden">
      <OrbitalBackground />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setIsSidebarOpen(false)}
          />

          <div className="absolute left-0 top-0 h-full w-[min(86vw,340px)] border-r border-white/8 bg-[#07090d]/95 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
              <div className="text-[1rem] font-semibold text-white/88">Chats</div>
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setIsSidebarOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex h-[calc(100%-73px)] flex-col px-4 py-4">
              <button
                type="button"
                onClick={handleNewChat}
                className="mb-4 flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-white text-[0.98rem] font-medium text-black shadow-[0_10px_24px_rgba(255,255,255,0.06)] transition hover:bg-white/90"
              >
                <Plus className="h-4.5 w-4.5" />
                New Chat
              </button>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <SessionList
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onSelectSession={handleSelectSession}
                  onDeleteSession={handleDeleteSession}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isReconfigureOpen && activeSession && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close reconfigure modal"
            className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
            onClick={() => setIsReconfigureOpen(false)}
          />

          <div className="relative w-full max-w-[520px]">
            <button
              type="button"
              onClick={() => setIsReconfigureOpen(false)}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/72 transition hover:bg-white/[0.08] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <PersonalityEditor
              personality={activePersonality}
              onChange={(partial) => setActivePersonality(partial)}
              onSave={handleSaveReconfigure}
              onUseDefault={handleSkipPersonalitySetup}
              compact
            />
          </div>
        </div>
      )}

      <section className="relative mx-auto h-full max-w-[1440px] px-4 pt-6 md:px-8 md:pt-8">
        <div className="grid h-full gap-8 xl:grid-cols-[274px_minmax(0,1fr)] xl:gap-10">
          <aside className="hidden xl:block">
            <div className="sticky top-[88px] h-[calc(100vh-112px)]">
              <div className="glass-panel flex h-full w-[274px] flex-col rounded-[22px]">
                <div className="px-5 pb-4 pt-5">
                  <div className="text-[1.75rem] font-semibold leading-none tracking-[-0.04em] text-white/92">
                    Chats
                  </div>
                  <div className="mt-2 text-[0.92rem] font-medium text-white/50">
                    Corsair conversation history
                  </div>
                </div>

                <div className="border-t border-white/8 px-4 py-4">
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-white text-[0.98rem] font-medium text-black shadow-[0_10px_24px_rgba(255,255,255,0.06)] transition hover:bg-white/90"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    New Chat
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                  <SessionList
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onSelectSession={handleSelectSession}
                    onDeleteSession={handleDeleteSession}
                  />
                </div>
              </div>
            </div>
          </aside>

          <div className="flex h-full min-h-0 items-start justify-center">
            <div className="relative flex h-full min-h-0 w-full max-w-[760px] flex-col md:max-w-[840px]">
              <button
                type="button"
                aria-label="Open sidebar"
                onClick={() => setIsSidebarOpen(true)}
                className="absolute left-0 top-[1px] z-20 flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-black/20 text-white/82 backdrop-blur-sm transition hover:bg-white/[0.05] hover:text-white md:hidden"
              >
                <PanelLeft className="h-4.5 w-4.5" />
              </button>

              {!hasMessages ? (
                <div className="pt-8 text-center md:pt-14">
                  <h1 className="mx-auto max-w-[720px] text-balance text-[clamp(2rem,4.5vw,3.95rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-white/92">
                    Discover and create
                    <br className="hidden sm:block" /> with{" "}
                    <span className="text-cyan-300/80">Corsair</span>
                  </h1>

                  {!activePersonality.isConfigured ? (
                    <div className="mx-auto mt-4 md:mt-5">
                      <PersonalityEditor
                        personality={activePersonality}
                        onChange={(partial) => setActivePersonality(partial)}
                        onSave={() =>
                          setActivePersonality(
                            {
                              tone: activePersonality.tone,
                              style: activePersonality.style,
                              symbol: activePersonality.symbol ?? "",
                            },
                            true
                          )
                        }
                        onUseDefault={handleSkipPersonalitySetup}
                      />
                    </div>
                  ) : (
                    <div className="glass-panel mx-auto mt-7 rounded-[28px] p-2.5 md:mt-9 md:rounded-[32px] md:p-3">
                      <div className="mb-3 flex items-center justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.84rem] text-white/62 md:text-[0.88rem]">
                          <span>Profile:</span>
                          <span className="font-medium text-white/84">
                            {personalitySummary(activePersonality)}
                          </span>
                        </div>
                      </div>

                      <Composer
                        query={query}
                        onChangeQuery={setQuery}
                        onKeyDown={handleComposerKeyDown}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        onOpenFilePicker={openFilePicker}
                        pendingAttachments={pendingAttachments}
                        onRemoveAttachment={removeAttachment}
                      />

                      <div className="mt-4 grid grid-cols-2 gap-3 md:mt-5">
                        <QuickAction
                          label="Discover Ideas"
                          tone="emerald"
                          disabled={isLoading}
                          onClick={() =>
                            handleQuickAction("Brainstorm a few strong ideas I can explore.")
                          }
                          icon={<TrendingUp className="h-4 w-4 md:h-4.5 md:w-4.5" />}
                        />

                        <QuickAction
                          label="Generate Image"
                          tone="fuchsia"
                          disabled={isLoading}
                          onClick={handleGenerateImageAction}
                          icon={<Sparkles className="h-4 w-4 md:h-4.5 md:w-4.5" />}
                        />

                        <QuickAction
                          label="Generate Video"
                          tone="violet"
                          disabled={isLoading}
                          onClick={() =>
                            handleQuickAction(
                              "Help me sketch a short video concept and storyboard."
                            )
                          }
                          icon={<Video className="h-4 w-4 md:h-4.5 md:w-4.5" />}
                        />

                        <QuickAction
                          label="Generate Music"
                          tone="amber"
                          disabled={isLoading}
                          onClick={() =>
                            handleQuickAction(
                              "Help me shape a music concept and creative direction."
                            )
                          }
                          icon={<Music4 className="h-4 w-4 md:h-4.5 md:w-4.5" />}
                        />
                      </div>

                      <div className="mt-4 text-center text-[0.9rem] font-medium text-white/40 md:mt-5 md:text-[0.94rem]">
                        Powered by x402 micropayments
                      </div>

                      <div className="mt-2 text-center text-[0.9rem] font-medium text-white/42 md:text-[0.94rem]">
                        Mail us at:{" "}
                        <a
                          href="mailto:corsair-chat@agentmail.to"
                          className="underline underline-offset-4 text-white/70 hover:text-white"
                        >
                          corsair-chat@agentmail.to
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-panel mt-6 flex h-full min-h-0 flex-col rounded-[30px] p-3 md:mt-8 md:rounded-[34px] md:p-4">
                  <div className="mb-2 px-1 md:px-2">
                    <div className="mx-auto flex max-w-[740px] items-center justify-between gap-3">
                      <div className="text-[0.86rem] text-white/42 md:text-[0.9rem]">
                        Active profile:{" "}
                        <span className="font-medium text-white/76">
                          {personalitySummary(activePersonality)}
                        </span>
                      </div>

                      <div className="hidden items-center gap-2 md:flex">
                        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.78rem] text-white/56">
                          Wallet: {formatWalletBalance(
                            balanceData ? formatUnits(balanceData.value, balanceData.decimals) : undefined,
                            balanceData?.symbol
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsReconfigureOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.82rem] text-white/56 transition hover:bg-white/[0.06] hover:text-white/82"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          Reconfigure
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsReconfigureOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.82rem] text-white/56 transition hover:bg-white/[0.06] hover:text-white/82 md:hidden"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Reconfigure
                      </button>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-4 pt-1 md:px-2">
                    <div className="mx-auto max-w-[760px] space-y-5 md:max-w-[740px]">
                      {messages.map((message) =>
                        message.role === "user" ? (
                          <UserMessage key={message.id} content={message.content} />
                        ) : (
                          <AssistantMessage
                            key={message.id}
                            content={
                              message.content ||
                              (isLoading ? "Corsair is thinking..." : "")
                            }
                            onAction={(prompt, messageContent) =>
                              void handleAssistantAction(prompt, messageContent)
                            }
                          />
                        )
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="mx-auto max-w-[760px] md:max-w-[740px]">
                      <Composer
                        query={query}
                        onChangeQuery={setQuery}
                        onKeyDown={handleComposerKeyDown}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        onOpenFilePicker={openFilePicker}
                        pendingAttachments={pendingAttachments}
                        onRemoveAttachment={removeAttachment}
                      />

                      {(isBalanceFetching || isSwitchingChain || pendingWalletExecution) && (
                        <div className="mt-2 px-2 text-[0.82rem] text-white/44">
                          {pendingWalletExecution
                            ? "Waiting for connected-wallet transaction receipt..."
                            : isSwitchingChain
                              ? "Waiting for wallet network switch..."
                              : "Refreshing connected-wallet balance..."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}