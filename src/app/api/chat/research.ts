import type { ApiMessage, BackendIntentResult } from "./types";

const RESEARCH_ACTION_PHRASES = [
  "research brief",
  "research this",
  "research on",
  "research about",
  "do some research",
  "do research on",
  "can you research",
  "give me a research brief",
  "give me a breakdown of",
  "give me an overview of",
  "explain this topic",
  "summarize what is known about",
  "summarize the current state of",
  "what do we know about",
  "help me understand",
  "break down the topic of",
  "brief me on",
  "topic breakdown",
];

function getLastUserMessage(messages: ApiMessage[]): string {
  const reversed = [...messages].reverse();
  const lastUser = reversed.find((message) => message.role === "user");
  return lastUser?.content?.trim() ?? "";
}

function isResearchIntent(input: string): boolean {
  const lower = input.toLowerCase();

  if (RESEARCH_ACTION_PHRASES.some((phrase) => lower.includes(phrase))) {
    return true;
  }

  const mentionsResearch =
    lower.includes("research") || lower.includes("research brief");

  if (!mentionsResearch) {
    return false;
  }

  const intentVerbs = [
    "write",
    "give",
    "do",
    "put together",
    "compile",
    "draft",
    "prepare",
    "build",
    "make",
    "create",
    "help",
    "run",
  ];

  return intentVerbs.some((verb) => lower.includes(verb));
}

function buildResearchSystemPrompt(): string {
  return `
You are Corsair operating in Research Brief mode.

Task shape:
- The user wants a structured, fast breakdown of a topic — not a casual chat answer.
- Work from what you already know. You do not have live web access in this mode, so never invent specific recent statistics, dates, prices, or "as of today" facts you are not confident in. When something is time-sensitive or you are not confident, say so plainly instead of guessing.

Output format:
- "## Overview" — 2-4 sentences giving the core answer up front, no throat-clearing.
- "## Key Points" — 4-7 tight bullets covering the most load-bearing facts, mechanisms, or arguments. Each bullet should teach the reader something, not restate the topic name.
- "## Details" — a few short paragraphs or sub-bulleted sections going deeper where it matters. Use "###" sub-headings if the topic has clear sub-areas (e.g. causes/effects, pros/cons, timeline, technical vs practical).
- "## Open Questions / Caveats" — what's genuinely contested, uncertain, or where the user should verify against a live source before relying on it.
- "## Where to Go Deeper" — 2-4 concrete leads (types of sources, search terms, or communities) the user could pursue for primary/current data, without citing specific fabricated URLs or article titles.

Tone: sharp and information-dense. Prefer precise claims with appropriate hedging over confident-sounding filler. If the user's question is narrow, keep the brief proportionally short — do not pad a simple question into a bloated report.
`.trim();
}

export async function maybeHandleResearchIntent(
  messages: ApiMessage[]
): Promise<BackendIntentResult> {
  const lastUserMessage = getLastUserMessage(messages);

  if (!lastUserMessage || !isResearchIntent(lastUserMessage)) {
    return { handled: false };
  }

  return {
    handled: true,
    generate: {
      systemPrompt: buildResearchSystemPrompt(),
    },
  };
}
