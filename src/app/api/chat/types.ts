export type ApiMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ApiPersonalityConfig = {
  tone: "calm" | "sharp" | "blunt" | "playful";
  style: "concise" | "balanced" | "detailed";
  symbol?: string;
};

export type WalletContext = {
  connected?: boolean;
  address?: string;
  chainId?: number;
  chainName?: string;
};

// Two ways a handler can resolve an intent:
// 1. "reply"    — a fully-formed, deterministic string (wallet.ts, carv.ts).
//                 route.ts streams it back to the client as-is.
// 2. "generate" — the handler recognized the intent but the actual content
//                 has to come from the model (cv.ts, research.ts, email.ts,
//                 postGenerator.ts, rewriteStudio.ts, ideaPartner.ts). The
//                 handler hands route.ts a feature-specific system prompt
//                 (and optionally a rewritten/augmented user prompt), and
//                 route.ts runs that through the normal OpenRouter stream.
export type BackendIntentResult =
  | {
      handled: false;
    }
  | {
      handled: true;
      reply: string;
      generate?: undefined;
    }
  | {
      handled: true;
      reply?: undefined;
      generate: {
        systemPrompt: string;
        userPrompt?: string;
      };
    };

export type ParsedSendIntent = {
  amount: string;
  asset: "ETH";
  to: `0x${string}`;
};

export type OpenRouterStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
    message?: {
      content?: string;
    };
    text?: string;
  }>;
};