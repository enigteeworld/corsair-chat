import type { ApiMessage, BackendIntentResult } from "./types";

const IDEA_ACTION_PHRASES = [
  "brainstorm",
  "help me brainstorm",
  "name ideas",
  "give me name ideas",
  "give me ideas",
  "help me come up with",
  "come up with ideas",
  "i'm stuck on",
  "im stuck on",
  "i am stuck on",
  "need ideas for",
  "need some ideas",
  "help me think of",
  "help me name",
  "what should i call",
  "outline some ideas",
  "give me some directions",
  "give me a few directions",
  "help me plan this out",
  "idea partner",
];

function getLastUserMessage(messages: ApiMessage[]): string {
  const reversed = [...messages].reverse();
  const lastUser = reversed.find((message) => message.role === "user");
  return lastUser?.content?.trim() ?? "";
}

function hasWholeWordMatch(input: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
  return pattern.test(input);
}

function isIdeaIntent(input: string): boolean {
  const lower = input.toLowerCase();

  if (IDEA_ACTION_PHRASES.some((phrase) => lower.includes(phrase))) {
    return true;
  }

  if (!hasWholeWordMatch(lower, "idea") && !hasWholeWordMatch(lower, "ideas")) {
    return false;
  }

  const intentVerbs = [
    "give",
    "need",
    "help",
    "want",
    "looking for",
    "suggest",
    "generate",
    "throw out",
  ];

  return intentVerbs.some((verb) => lower.includes(verb));
}

function buildIdeaPartnerSystemPrompt(): string {
  return `
You are Corsair operating in Idea Partner mode.

Task shape:
- The user is stuck and wants concrete brainstorming: names, concepts, outlines, plans, or directions — not a lecture about how to brainstorm.
- Use whatever context they've given (project type, audience, constraints, vibe). If they've given almost nothing to go on, make one reasonable assumption explicit and proceed rather than stalling on questions — give them something to react to.

Output format:
- "## Directions" — 3-6 genuinely distinct ideas/options, each as "### [Short name/label]" followed by 1-3 sentences explaining the concept and why it could work. Distinct means different angles or premises, not the same idea reworded six times.
- If the ask is specifically for names (product, project, post, etc.), instead give a flat list of 8-12 candidate names grouped loosely by vibe (e.g. "**Literal/clear:**", "**Punchy/short:**", "**Evocative/abstract:**"), no explanation needed per name unless one is non-obvious.
- Close with "### Which direction is strongest" — one or two sentences giving your actual opinion on which option you'd pursue and why, not a wishy-washy "it depends."

Tone: energetic but not manic — a sharp collaborator throwing out real options, not a hype machine. Be willing to include a slightly risky or unconventional option alongside the safe ones; the user is more likely to react against a bold pick than a bland list.
`.trim();
}

export async function maybeHandleIdeaPartnerIntent(
  messages: ApiMessage[]
): Promise<BackendIntentResult> {
  const lastUserMessage = getLastUserMessage(messages);

  if (!lastUserMessage || !isIdeaIntent(lastUserMessage)) {
    return { handled: false };
  }

  return {
    handled: true,
    generate: {
      systemPrompt: buildIdeaPartnerSystemPrompt(),
    },
  };
}
