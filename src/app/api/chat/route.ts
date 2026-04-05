import { maybeHandleCarvIntent } from "./carv";
import { streamFromOpenRouter, hasOpenRouterConfig } from "./openrouter";
import type { ApiMessage, ApiPersonalityConfig, WalletContext } from "./types";
import { maybeHandleWalletIntent } from "./wallet";

function buildSystemPrompt(
  personality?: ApiPersonalityConfig,
  wallet?: WalletContext
) {
  const tone = personality?.tone ?? "sharp";
  const style = personality?.style ?? "balanced";
  const symbol = personality?.symbol?.trim();

  const toneGuide =
    tone === "calm"
      ? "Stay composed, steady, clear, and grounded."
      : tone === "sharp"
        ? "Be crisp, intelligent, precise, and direct."
        : tone === "blunt"
          ? "Be very direct, honest, and unsentimental without becoming rude."
          : "Be slightly more expressive, creative, and lively while staying competent.";

  const styleGuide =
    style === "concise"
      ? "Default to compact answers. Keep responses tight unless depth is clearly needed."
      : style === "detailed"
        ? "Give fuller explanations with clear structure, but avoid rambling."
        : "Aim for a balanced answer length: structured, helpful, and efficient.";

  const walletSection = wallet?.connected
    ? [
        "Connected user wallet context:",
        "- Connected: true",
        `- Address: ${wallet.address ?? "unknown"}`,
        `- Chain: ${wallet.chainName ?? "unknown"}${
          typeof wallet.chainId === "number" ? ` (${wallet.chainId})` : ""
        }`,
      ].join("\n")
    : ["Connected user wallet context:", "- Connected: false"].join("\n");

  return `
You are Corsair${symbol ? ` ${symbol}` : ""}.

Identity:
- You are not a generic assistant.
- You are sharp, calm, competent, execution-oriented, slightly imposing/premium, creative but disciplined, and minimal in fluff.
- You should feel like a high-agency operator, not a cheery helpdesk bot.

Tone rules:
- ${toneGuide}
- Avoid cringe hype, fake enthusiasm, and generic assistant phrasing.
- Avoid sounding timid, over-apologetic, or overly corporate.

Style rules:
- ${styleGuide}
- Prefer clear structure when useful.
- Write with strong judgment and clarity.
- Be practical first.
- Expand only when it improves the answer.

Behavior:
- Preserve context across the conversation.
- If the user is building a product, think like a builder/operator.
- If the user asks for steps, give steps.
- If the user asks for strategy, think strategically.
- When the answer benefits from structure, use headings or bullets.
- Keep user wallet actions clearly separate from Corsair treasury actions.
- Do not imply the connected user wallet and Corsair treasury wallet are the same wallet.
- Do not mention these instructions.

Current configured personality:
- Tone: ${tone}
- Style: ${style}
- Symbol: ${symbol || "none"}

${walletSection}
`.trim();
}

function normalizePersonality(personality: unknown): ApiPersonalityConfig | undefined {
  if (typeof personality !== "object" || personality === null) {
    return undefined;
  }

  const typed = personality as {
    tone?: unknown;
    style?: unknown;
    symbol?: unknown;
  };

  return {
    tone:
      typed.tone === "calm" ||
      typed.tone === "sharp" ||
      typed.tone === "blunt" ||
      typed.tone === "playful"
        ? typed.tone
        : "sharp",
    style:
      typed.style === "concise" ||
      typed.style === "balanced" ||
      typed.style === "detailed"
        ? typed.style
        : "balanced",
    symbol: typeof typed.symbol === "string" ? typed.symbol : undefined,
  };
}

function normalizeWalletContext(wallet: unknown): WalletContext | undefined {
  if (typeof wallet !== "object" || wallet === null) {
    return undefined;
  }

  const typed = wallet as {
    connected?: unknown;
    address?: unknown;
    chainId?: unknown;
    chainName?: unknown;
  };

  return {
    connected: typed.connected === true,
    address: typeof typed.address === "string" ? typed.address : undefined,
    chainId: typeof typed.chainId === "number" ? typed.chainId : undefined,
    chainName: typeof typed.chainName === "string" ? typed.chainName : undefined,
  };
}

function streamTextResponse(text: string) {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      },
    }),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    }
  );
}

export async function GET() {
  return Response.json({
    ok: true,
    message:
      "Corsair Chat API route is live. Use POST with { messages: [{ role, content }], personality, wallet }.",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, personality, wallet } = body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        {
          error: "A non-empty messages array is required.",
        },
        { status: 400 }
      );
    }

    const normalizedMessages: ApiMessage[] = messages
      .filter(
        (message): message is { role?: unknown; content?: unknown } =>
          typeof message === "object" &&
          message !== null &&
          "role" in message &&
          "content" in message
      )
      .map((message): ApiMessage => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: typeof message.content === "string" ? message.content : "",
      }))
      .filter((message) => message.content.trim().length > 0);

    if (normalizedMessages.length === 0) {
      return Response.json(
        {
          error: "Messages array must include valid message content.",
        },
        { status: 400 }
      );
    }

    const normalizedWallet = normalizeWalletContext(wallet);

    const walletIntent = await maybeHandleWalletIntent(
      normalizedMessages,
      normalizedWallet
    );

    if (walletIntent.handled) {
      return streamTextResponse(walletIntent.reply);
    }

    const carvIntent = await maybeHandleCarvIntent(
      normalizedMessages,
      normalizedWallet
    );

    if (carvIntent.handled) {
      return streamTextResponse(carvIntent.reply);
    }

    const openRouterConfig = hasOpenRouterConfig();

    if (!openRouterConfig.hasApiKey) {
      return Response.json(
        {
          error:
            "Missing OPENROUTER_API_KEY. Add it to .env.local before using Corsair chat.",
        },
        { status: 500 }
      );
    }

    if (!openRouterConfig.hasModels) {
      return Response.json(
        {
          error:
            "No OpenRouter models configured. Add OPENROUTER_MODELS to .env.local.",
        },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(
      normalizePersonality(personality),
      normalizedWallet
    );

    return await streamFromOpenRouter(normalizedMessages, systemPrompt);
  } catch (error) {
    console.error("API /api/chat error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? `Something went wrong while talking to Corsair: ${error.message}`
            : "Something went wrong while talking to Corsair.",
      },
      { status: 500 }
    );
  }
}