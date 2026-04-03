export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type PersonalityTone = "calm" | "sharp" | "blunt" | "playful";
export type PersonalityStyle = "concise" | "balanced" | "detailed";

export type PersonalityConfig = {
  tone: PersonalityTone;
  style: PersonalityStyle;
  symbol?: string;
  isConfigured: boolean;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  personality: PersonalityConfig;
  createdAt: string;
  updatedAt: string;
};

export type PendingAttachment = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
};

export type RenderBlock =
  | { type: "heading"; text: string; level: 1 | 2 | 3 | 4 }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "rich-card"; title: string; items: string[] }
  | { type: "timeline"; day: string; title: string; items: string[] }
  | {
      type: "actions";
      buttons: Array<{
        label: string;
        action: string;
      }>;
    }
  | { type: "divider" };