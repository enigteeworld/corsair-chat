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

export type BackendIntentResult =
  | {
      handled: false;
    }
  | {
      handled: true;
      reply: string;
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