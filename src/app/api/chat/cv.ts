import type { ApiMessage, BackendIntentResult } from "./types";

// Keyword surface for "this is a CV / resume request". Kept deliberately
// narrow (mirrors carv.ts's isCarvIntent style) so ordinary conversation
// about someone's job or career doesn't get hijacked into CV mode.
const CV_KEYWORDS = [
  "cv",
  "curriculum vitae",
  "resume",
  "résumé",
  "resumé",
  "one-page resume",
  "one page resume",
];

const CV_ACTION_PHRASES = [
  "write my cv",
  "write me a cv",
  "build my cv",
  "build me a cv",
  "make my cv",
  "make me a cv",
  "create my cv",
  "create me a cv",
  "review my cv",
  "review my resume",
  "improve my cv",
  "improve my resume",
  "rewrite my cv",
  "rewrite my resume",
  "polish my cv",
  "polish my resume",
  "update my cv",
  "update my resume",
  "format my cv",
  "format my resume",
  "resume rewrite",
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

function isCvIntent(input: string): boolean {
  const lower = input.toLowerCase();

  if (CV_ACTION_PHRASES.some((phrase) => lower.includes(phrase))) {
    return true;
  }

  // "cv" alone is a very short token that collides with normal words, so it
  // only counts as a whole word plus a clear intent verb nearby.
  const mentionsCvWord = CV_KEYWORDS.some((keyword) =>
    keyword === "cv" ? hasWholeWordMatch(lower, "cv") : lower.includes(keyword)
  );

  if (!mentionsCvWord) {
    return false;
  }

  const intentVerbs = [
    "write",
    "build",
    "make",
    "create",
    "draft",
    "review",
    "improve",
    "rewrite",
    "polish",
    "update",
    "format",
    "help",
    "generate",
    "tighten",
    "shorten",
  ];

  return intentVerbs.some((verb) => lower.includes(verb));
}

function buildCvSystemPrompt(): string {
  return `
You are Corsair operating in CV / résumé mode.

Task shape:
- The user wants a CV, résumé, or a rewrite/tightening of one.
- Work with whatever career details (roles, dates, skills, education, achievements) the user has given you in this conversation. If key details are missing (target role, years of experience, standout achievements), ask 1-3 sharp clarifying questions before producing a full draft — but if you have enough to produce something useful, produce it and flag your assumptions instead of stalling.

Output format when producing a CV:
- Output clean Markdown structured as a one-page CV:
  1. Name / header line (use a placeholder like "[Full Name]" if not given) with contact line under it (email / phone / location / link — placeholders where unknown).
  2. "## Summary" — 2-3 sentence positioning statement, punchy and specific, not generic filler.
  3. "## Experience" — reverse-chronological, each role as "### Title — Company (dates)" followed by 2-4 tight, outcome-driven bullet points (quantify impact where possible; do not invent numbers, use placeholders like "[X%]" if the user didn't provide them).
  4. "## Skills" — grouped, scannable, not a wall of buzzwords.
  5. "## Education" — degree, institution, dates.
  6. Optional "## Projects" or "## Certifications" only if relevant material exists.
- Bullets start with strong action verbs. No first-person pronouns. No filler adjectives ("hardworking", "team player") without evidence behind them.
- After the draft, add a short "### Notes" section listing assumptions you made and what the user should fill in or confirm.

Tone: sharp, competent, no fluff, no cheerleading. Treat this like an operator building a precise document, not a generic resume-writing bot.
`.trim();
}

export async function maybeHandleCvIntent(
  messages: ApiMessage[]
): Promise<BackendIntentResult> {
  const lastUserMessage = getLastUserMessage(messages);

  if (!lastUserMessage || !isCvIntent(lastUserMessage)) {
    return { handled: false };
  }

  return {
    handled: true,
    generate: {
      systemPrompt: buildCvSystemPrompt(),
    },
  };
}
