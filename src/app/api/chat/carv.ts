import type { ApiMessage, BackendIntentResult, WalletContext } from "./types";

const CORSAIR_STRATEGY_API_URL =
  process.env.CORSAIR_STRATEGY_API_URL?.trim() || "http://127.0.0.1:8787";

function shortenAddress(value: string) {
  if (!value.startsWith("0x") || value.length < 14) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
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

function hasDirectCarvReference(input: string) {
  const lower = input.toLowerCase();

  return (
    lower.includes("carv") ||
    lower.includes("carv-1") ||
    lower.includes("carv1")
  );
}

function isCarvIntent(input: string) {
  const lower = input.toLowerCase();

  const hasCarvScopedVaultReference =
    lower.includes("carv vault") ||
    lower.includes("carv-1 vault") ||
    lower.includes("vault strategy") ||
    lower.includes("managed strategy");

  const hasCarvScopedActionReference =
    lower.includes("deposit into carv") ||
    lower.includes("deposit to carv") ||
    lower.includes("withdraw from carv") ||
    lower.includes("withdraw out of carv") ||
    lower.includes("is carv safe") ||
    lower.includes("is carv-1 safe") ||
    lower.includes("what is carv") ||
    lower.includes("tell me about carv");

  return (
    hasDirectCarvReference(input) ||
    hasCarvScopedVaultReference ||
    hasCarvScopedActionReference
  );
}

function classifyCarvIntent(input: string) {
  const lower = input.toLowerCase();

  if (
    lower.includes("show strategies") ||
    lower.includes("list strategies") ||
    lower.includes("strategy registry") ||
    lower.includes("what strategies") ||
    lower.includes("available strategies")
  ) {
    return "registry";
  }

  if (
    lower.includes("deposit into carv") ||
    lower.includes("deposit to carv") ||
    lower.includes("how do i deposit") ||
    lower.includes("can i deposit") ||
    lower.includes("deposit")
  ) {
    return "deposit";
  }

  if (
    lower.includes("withdraw from carv") ||
    lower.includes("withdraw out of carv") ||
    lower.includes("how do i withdraw") ||
    lower.includes("can i withdraw") ||
    lower.includes("withdraw")
  ) {
    return "withdraw";
  }

  if (
    lower.includes("safe") ||
    lower.includes("risk") ||
    lower.includes("risky") ||
    lower.includes("should i deposit") ||
    lower.includes("is carv safe")
  ) {
    return "safety";
  }

  if (
    lower.includes("performance") ||
    lower.includes("pnl") ||
    lower.includes("profit") ||
    lower.includes("returns")
  ) {
    return "performance";
  }

  if (
    lower.includes("live") ||
    lower.includes("runtime") ||
    lower.includes("trading") ||
    lower.includes("blocked")
  ) {
    return "detail";
  }

  return "detail";
}

async function handleShowStrategies(wallet?: WalletContext): Promise<string> {
  const data = await fetchJson<{
    ok: boolean;
    agentId: string;
    strategies: Array<{
      id: string;
      name: string;
      type?: string;
      status?: string;
      description?: string;
      baseAsset?: string;
      depositAsset?: string;
      allowedAssets?: string[];
      execution?: {
        enabled?: boolean;
        mode?: string;
        liveState?: string;
        liveReason?: string;
      };
      runtime?: {
        mode?: string;
      };
    }>;
  }>(`${CORSAIR_STRATEGY_API_URL}/strategies`);

  if (!Array.isArray(data.strategies) || data.strategies.length === 0) {
    return "No strategies are currently available.";
  }

  const lines: string[] = [
    "## CARV strategy registry",
    "",
    "Corsair currently exposes CARV-1 as its managed strategy runtime.",
    "",
    "### Wallet positioning",
    "",
    formatConnectedWalletLine(wallet),
    "- User participation should originate from the connected wallet.",
    "- Managed strategy execution remains backend-controlled and separate from the user wallet.",
    "",
  ];

  for (const strategy of data.strategies) {
    lines.push(`### ${strategy.name} (${strategy.id})`);
    lines.push("");
    lines.push(`- Status: ${strategy.status ?? "unknown"}`);
    lines.push(`- Type: ${strategy.type ?? "unknown"}`);
    lines.push(`- Base asset: ${strategy.baseAsset ?? "—"}`);
    lines.push(`- Deposit asset: ${strategy.depositAsset ?? "—"}`);
    lines.push(
      `- Allowed assets: ${
        Array.isArray(strategy.allowedAssets) && strategy.allowedAssets.length > 0
          ? strategy.allowedAssets.join(", ")
          : "—"
      }`
    );
    lines.push(`- Execution mode: ${strategy.execution?.mode ?? "unknown"}`);
    lines.push(`- Live state: ${strategy.execution?.liveState ?? "—"}`);

    if (strategy.description) {
      lines.push(`- Description: ${strategy.description}`);
    }

    lines.push("");
  }

  lines.push("Ask about CARV-1 directly for the full runtime detail.");

  return lines.join("\n");
}

async function getCarvStrategyDetail() {
  return fetchJson<{
    ok: boolean;
    agentId: string;
    strategy: {
      id: string;
      name: string;
      type?: string;
      status?: string;
      description?: string;
      runtime?: {
        mode?: string;
        version?: string;
        loopIntervalSeconds?: number;
        liveState?: string;
        liveReason?: string;
      };
      assets?: {
        baseAsset?: string;
        depositAsset?: string;
        allowedAssets?: string[];
      };
      execution?: {
        enabled?: boolean;
        mode?: string;
        route?: string;
        allowBuy?: boolean;
        allowSell?: boolean;
        maxLiveNotionalUsd?: number;
        minLiveNotionalUsd?: number;
        reconcileAfterTrade?: boolean;
        maxPriceDeviationPct?: number;
        maxConsecutiveLosses?: number;
        maxCumulativeRealizedLossUsd?: number;
        emergencyStop?: boolean;
        liveState?: string;
        liveReason?: string;
      };
      overview?: {
        totalUsers?: number;
        totalDeposited?: number;
        totalWithdrawn?: number;
        pendingWithdrawalAmount?: number;
        pendingWithdrawalCount?: number;
        valuation?: {
          totalShares?: number;
          totalValue?: number;
          liquidValue?: number;
          investedValue?: number;
          reservedForWithdrawals?: number;
          sharePrice?: number;
          updatedAt?: string;
        };
      };
      policy?: {
        minUsdcReservePct?: number;
        maxPositionPct?: number;
        maxTradePct?: number;
        maxConcurrentPositions?: number;
        minConfidence?: number;
        cooldownMinutes?: number;
        maxDailyTrades?: number;
        softDrawdownPct?: number;
        hardDrawdownPct?: number;
        maxSlippageBps?: number;
      };
      depositPolicy?: {
        sourceWalletRequired?: boolean;
        withdrawToSourceWalletOnly?: boolean;
        manualDepositConfirmation?: boolean;
      };
      withdrawalPolicy?: {
        allowPartialWithdrawals?: boolean;
        queueIfInsufficientLiquidity?: boolean;
        manualExecution?: boolean;
      };
      accounting?: {
        shareDecimals?: number;
        initialSharePrice?: number;
      };
    };
  }>(`${CORSAIR_STRATEGY_API_URL}/strategies/carv-1`);
}

async function handleShowCarv1(wallet?: WalletContext): Promise<string> {
  const data = await getCarvStrategyDetail();
  const strategy = data.strategy;

  return [
    `## ${strategy.name} (${strategy.id})`,
    "",
    strategy.description ??
      "CARV-1 is Corsair’s managed strategy runtime for user-linked participation and backend-controlled execution.",
    "",
    "### Runtime state",
    "",
    `- Status: ${strategy.status ?? "unknown"}`,
    `- Runtime mode: ${strategy.runtime?.mode ?? "—"}`,
    `- Live state: ${strategy.execution?.liveState ?? strategy.runtime?.liveState ?? "—"}`,
    `- Live reason: ${strategy.execution?.liveReason ?? strategy.runtime?.liveReason ?? "—"}`,
    `- Version: ${strategy.runtime?.version ?? "—"}`,
    `- Loop cadence: ${
      typeof strategy.runtime?.loopIntervalSeconds === "number"
        ? `${strategy.runtime.loopIntervalSeconds}s`
        : "—"
    }`,
    "",
    "### Positioning",
    "",
    "- CARV-1 runs as a managed strategy, not as a direct user-controlled trading wallet.",
    "- User participation is linked to the connected wallet.",
    "- Managed execution remains backend-controlled and separate from the connected wallet.",
    "- Live execution can still be blocked by available deployable capital, signal quality, or configured risk controls.",
    "",
    "### Wallet positioning",
    "",
    formatConnectedWalletLine(wallet),
    "- Deposits and user participation should be tied to the connected user wallet.",
    "- Managed execution and treasury operations remain on the Corsair backend path, not the connected user wallet path.",
    "",
    "### Strategy profile",
    "",
    `- Type: ${strategy.type ?? "unknown"}`,
    `- Base asset: ${strategy.assets?.baseAsset ?? "—"}`,
    `- Deposit asset: ${strategy.assets?.depositAsset ?? "—"}`,
    `- Allowed assets: ${
      Array.isArray(strategy.assets?.allowedAssets) &&
      strategy.assets.allowedAssets.length > 0
        ? strategy.assets.allowedAssets.join(", ")
        : "—"
    }`,
    "",
    "### Execution",
    "",
    `- Enabled: ${
      typeof strategy.execution?.enabled === "boolean"
        ? String(strategy.execution.enabled)
        : "—"
    }`,
    `- Mode: ${strategy.execution?.mode ?? "—"}`,
    `- Route: ${strategy.execution?.route ?? "—"}`,
    `- Buy enabled: ${
      typeof strategy.execution?.allowBuy === "boolean"
        ? String(strategy.execution.allowBuy)
        : "—"
    }`,
    `- Sell enabled: ${
      typeof strategy.execution?.allowSell === "boolean"
        ? String(strategy.execution.allowSell)
        : "—"
    }`,
    `- Max live notional (USD): ${strategy.execution?.maxLiveNotionalUsd ?? "—"}`,
    `- Min live notional (USD): ${strategy.execution?.minLiveNotionalUsd ?? "—"}`,
    "",
    "### Vault overview",
    "",
    `- Users: ${strategy.overview?.totalUsers ?? "—"}`,
    `- Deposited: ${strategy.overview?.totalDeposited ?? "—"}`,
    `- Withdrawn: ${strategy.overview?.totalWithdrawn ?? "—"}`,
    `- Shares: ${strategy.overview?.valuation?.totalShares ?? "—"}`,
    `- Total value: ${strategy.overview?.valuation?.totalValue ?? "—"}`,
    `- Liquid value: ${strategy.overview?.valuation?.liquidValue ?? "—"}`,
    `- Invested value: ${strategy.overview?.valuation?.investedValue ?? "—"}`,
    `- Reserved for withdrawals: ${strategy.overview?.valuation?.reservedForWithdrawals ?? "—"}`,
    `- Share price: ${strategy.overview?.valuation?.sharePrice ?? "—"}`,
    `- Pending withdrawal amount: ${strategy.overview?.pendingWithdrawalAmount ?? 0}`,
    `- Pending withdrawal count: ${strategy.overview?.pendingWithdrawalCount ?? 0}`,
    `- Updated: ${strategy.overview?.valuation?.updatedAt ?? "—"}`,
    "",
    "### Risk policy",
    "",
    `- Min reserve: ${
      typeof strategy.policy?.minUsdcReservePct === "number"
        ? `${(strategy.policy.minUsdcReservePct * 100).toFixed(2)}%`
        : "—"
    }`,
    `- Max position: ${
      typeof strategy.policy?.maxPositionPct === "number"
        ? `${(strategy.policy.maxPositionPct * 100).toFixed(2)}%`
        : "—"
    }`,
    `- Max trade: ${
      typeof strategy.policy?.maxTradePct === "number"
        ? `${(strategy.policy.maxTradePct * 100).toFixed(2)}%`
        : "—"
    }`,
    `- Max concurrent positions: ${strategy.policy?.maxConcurrentPositions ?? "—"}`,
    `- Min confidence: ${strategy.policy?.minConfidence ?? "—"}`,
    `- Cooldown: ${
      typeof strategy.policy?.cooldownMinutes === "number"
        ? `${strategy.policy.cooldownMinutes} minutes`
        : "—"
    }`,
    `- Max daily trades: ${strategy.policy?.maxDailyTrades ?? "—"}`,
    `- Soft drawdown: ${
      typeof strategy.policy?.softDrawdownPct === "number"
        ? `${(strategy.policy.softDrawdownPct * 100).toFixed(2)}%`
        : "—"
    }`,
    `- Hard drawdown: ${
      typeof strategy.policy?.hardDrawdownPct === "number"
        ? `${(strategy.policy.hardDrawdownPct * 100).toFixed(2)}%`
        : "—"
    }`,
    `- Max slippage: ${
      typeof strategy.policy?.maxSlippageBps === "number"
        ? `${strategy.policy.maxSlippageBps} bps`
        : "—"
    }`,
    "",
    "### Deposit and withdrawal policy",
    "",
    `- Source wallet required: ${strategy.depositPolicy?.sourceWalletRequired ?? "—"}`,
    `- Withdraw to source wallet only: ${strategy.depositPolicy?.withdrawToSourceWalletOnly ?? "—"}`,
    `- Manual deposit confirmation: ${strategy.depositPolicy?.manualDepositConfirmation ?? "—"}`,
    `- Partial withdrawals allowed: ${strategy.withdrawalPolicy?.allowPartialWithdrawals ?? "—"}`,
    `- Queue on insufficient liquidity: ${strategy.withdrawalPolicy?.queueIfInsufficientLiquidity ?? "—"}`,
    `- Manual withdrawal execution: ${strategy.withdrawalPolicy?.manualExecution ?? "—"}`,
    "",
    "### Accounting",
    "",
    `- Share decimals: ${strategy.accounting?.shareDecimals ?? "—"}`,
    `- Initial share price: ${strategy.accounting?.initialSharePrice ?? "—"}`,
  ].join("\n");
}

async function handleCarvSafety(wallet?: WalletContext): Promise<string> {
  const data = await getCarvStrategyDetail();
  const strategy = data.strategy;

  return [
    "## CARV-1 safety and deposit framing",
    "",
    "CARV-1 is a managed strategy product, not a guaranteed-yield vault and not a passive savings account.",
    "",
    "### What is true right now",
    "",
    `- Runtime status: ${strategy.status ?? "unknown"}`,
    `- Execution mode: ${strategy.execution?.mode ?? "—"}`,
    `- Live state: ${strategy.execution?.liveState ?? strategy.runtime?.liveState ?? "—"}`,
    `- Live reason: ${strategy.execution?.liveReason ?? strategy.runtime?.liveReason ?? "—"}`,
    `- Current total value: ${strategy.overview?.valuation?.totalValue ?? "—"}`,
    `- Current liquid value: ${strategy.overview?.valuation?.liquidValue ?? "—"}`,
    `- Current invested value: ${strategy.overview?.valuation?.investedValue ?? "—"}`,
    "",
    "### Risk framing",
    "",
    "- Funds are subject to strategy risk, execution risk, and market risk.",
    "- Deposits are intended to come from the connected wallet, while execution remains backend-controlled.",
    "- Withdrawals may be policy-constrained if liquidity is insufficient or manual execution is required.",
    "- A live-enabled state does not mean risk-free operation.",
    "",
    "### Policy guardrails",
    "",
    `- Min reserve: ${
      typeof strategy.policy?.minUsdcReservePct === "number"
        ? `${(strategy.policy.minUsdcReservePct * 100).toFixed(2)}%`
        : "—"
    }`,
    `- Max position: ${
      typeof strategy.policy?.maxPositionPct === "number"
        ? `${(strategy.policy.maxPositionPct * 100).toFixed(2)}%`
        : "—"
    }`,
    `- Max trade: ${
      typeof strategy.policy?.maxTradePct === "number"
        ? `${(strategy.policy.maxTradePct * 100).toFixed(2)}%`
        : "—"
    }`,
    `- Max concurrent positions: ${strategy.policy?.maxConcurrentPositions ?? "—"}`,
    `- Min confidence: ${strategy.policy?.minConfidence ?? "—"}`,
    `- Hard drawdown: ${
      typeof strategy.policy?.hardDrawdownPct === "number"
        ? `${(strategy.policy.hardDrawdownPct * 100).toFixed(2)}%`
        : "—"
    }`,
    "",
    "### Practical answer",
    "",
    "If you are asking whether CARV-1 is safe to deposit into, the honest answer is: it is structured and risk-gated, but it is still a managed strategy product with real execution and market risk.",
    "",
    formatConnectedWalletLine(wallet),
  ].join("\n");
}

async function handleCarvDeposit(wallet?: WalletContext): Promise<string> {
  const data = await getCarvStrategyDetail();
  const strategy = data.strategy;

  return [
    "## CARV-1 deposit flow",
    "",
    formatConnectedWalletLine(wallet),
    "",
    "### Deposit path",
    "",
    "- Deposits should originate from the connected user wallet.",
    "- Managed execution remains on the Corsair backend path after funds enter the strategy accounting flow.",
    "- This is not a direct user-controlled trading wallet flow.",
    "",
    "### Policy context",
    "",
    `- Source wallet required: ${strategy.depositPolicy?.sourceWalletRequired ?? "—"}`,
    `- Manual deposit confirmation: ${strategy.depositPolicy?.manualDepositConfirmation ?? "—"}`,
    `- Deposit asset: ${strategy.assets?.depositAsset ?? "—"}`,
    `- Base asset: ${strategy.assets?.baseAsset ?? "—"}`,
    "",
    "### Current state",
    "",
    `- Live state: ${strategy.execution?.liveState ?? strategy.runtime?.liveState ?? "—"}`,
    `- Live reason: ${strategy.execution?.liveReason ?? strategy.runtime?.liveReason ?? "—"}`,
    `- Share price: ${strategy.overview?.valuation?.sharePrice ?? "—"}`,
    "",
    "Deposit execution is not fully wired end-to-end in chat yet, but the deposit model, policy framing, and runtime context are now exposed correctly.",
  ].join("\n");
}

async function handleCarvWithdraw(wallet?: WalletContext): Promise<string> {
  const data = await getCarvStrategyDetail();
  const strategy = data.strategy;

  return [
    "## CARV-1 withdrawal flow",
    "",
    formatConnectedWalletLine(wallet),
    "",
    "### Withdrawal path",
    "",
    "- Withdrawals should settle back to the user wallet according to strategy policy.",
    "- Liquidity availability and manual execution rules may affect immediate withdrawal execution.",
    "",
    "### Policy context",
    "",
    `- Withdraw to source wallet only: ${strategy.depositPolicy?.withdrawToSourceWalletOnly ?? "—"}`,
    `- Partial withdrawals allowed: ${strategy.withdrawalPolicy?.allowPartialWithdrawals ?? "—"}`,
    `- Queue on insufficient liquidity: ${strategy.withdrawalPolicy?.queueIfInsufficientLiquidity ?? "—"}`,
    `- Manual withdrawal execution: ${strategy.withdrawalPolicy?.manualExecution ?? "—"}`,
    "",
    "### Current state",
    "",
    `- Pending withdrawal amount: ${strategy.overview?.pendingWithdrawalAmount ?? 0}`,
    `- Pending withdrawal count: ${strategy.overview?.pendingWithdrawalCount ?? 0}`,
    `- Liquid value: ${strategy.overview?.valuation?.liquidValue ?? "—"}`,
    "",
    "Withdrawal execution is not fully wired end-to-end in chat yet, but the withdrawal policy, liquidity constraints, and runtime framing are now exposed correctly.",
  ].join("\n");
}

async function handleCarvPerformance(): Promise<string> {
  const data = await getCarvStrategyDetail();
  const strategy = data.strategy;

  return [
    "## CARV-1 current performance readout",
    "",
    "CARV-1 currently exposes vault accounting and runtime state, not a polished historical performance dashboard.",
    "",
    "### Current observable values",
    "",
    `- Total value: ${strategy.overview?.valuation?.totalValue ?? "—"}`,
    `- Liquid value: ${strategy.overview?.valuation?.liquidValue ?? "—"}`,
    `- Invested value: ${strategy.overview?.valuation?.investedValue ?? "—"}`,
    `- Share price: ${strategy.overview?.valuation?.sharePrice ?? "—"}`,
    `- Deposited: ${strategy.overview?.totalDeposited ?? "—"}`,
    `- Withdrawn: ${strategy.overview?.totalWithdrawn ?? "—"}`,
    `- Updated: ${strategy.overview?.valuation?.updatedAt ?? "—"}`,
    "",
    "For now, this should be described as a current vault state readout rather than a full realized PnL or audited performance history.",
  ].join("\n");
}

export async function maybeHandleCarvIntent(
  messages: ApiMessage[],
  wallet?: WalletContext
): Promise<BackendIntentResult> {
  const lastUserMessage = getLastUserMessage(messages);

  if (!lastUserMessage) {
    return { handled: false };
  }

  if (!isCarvIntent(lastUserMessage)) {
    return { handled: false };
  }

  const intent = classifyCarvIntent(lastUserMessage);

  if (intent === "registry") {
    return {
      handled: true,
      reply: await handleShowStrategies(wallet),
    };
  }

  if (intent === "deposit") {
    return {
      handled: true,
      reply: await handleCarvDeposit(wallet),
    };
  }

  if (intent === "withdraw") {
    return {
      handled: true,
      reply: await handleCarvWithdraw(wallet),
    };
  }

  if (intent === "safety") {
    return {
      handled: true,
      reply: await handleCarvSafety(wallet),
    };
  }

  if (intent === "performance") {
    return {
      handled: true,
      reply: await handleCarvPerformance(),
    };
  }

  return {
    handled: true,
    reply: await handleShowCarv1(wallet),
  };
}