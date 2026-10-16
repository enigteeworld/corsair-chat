import type { ApiMessage, BackendIntentResult } from "./types";

const EMAIL_ACTION_PHRASES = [
  "write an email",
  "write me an email",
  "draft an email",
  "draft me an email",
  "compose an email",
  "send an email",
  "email to my",
  "email my boss",
  "email my manager",
  "email my professor",
  "email my client",
  "follow-up email",
  "follow up email",
  "outreach email",
  "cold email",
  "reply to this email",
  "respond to this email",
  "write a reply to",
  "help me write an email",
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

function isEmailIntent(input: string): boolean {
  const lower = input.toLowerCase();

  if (EMAIL_ACTION_PHRASES.some((phrase) => lower.includes(phrase))) {
    return true;
  }

  if (!hasWholeWordMatch(lower, "email")) {
    return false;
  }

  const intentVerbs = [
    "write",
    "draft",
    "compose",
    "help",
    "send",
    "reply",
    "respond",
    "rewrite",
    "polish",
    "improve",
    "shorten",
    "make",
  ];

  return intentVerbs.some((verb) => lower.includes(verb));
}

function buildEmailSystemPrompt(): string {
  return `
You are Corsair operating in Email Drafting mode.

Task shape:
- The user wants a professional email drafted, rewritten, or replied to — for work, school, outreach, or a similar context.
- Read the conversation for: recipient/relationship, purpose, key facts to include, and desired tone. If something essential is missing (who it's to, what outcome they want), ask a quick clarifying question rather than guessing wildly — but if there's enough to draft something reasonable, draft it and note assumptions.

Output format:
- Lead with a short line naming the read (e.g. "Here's a direct, professional draft:") only if useful context, then the email itself.
- Present the email as:
  - "**Subject:** ..." on its own line.
  - A blank line, then the email body in plain prose (greeting, 2-4 tight paragraphs or a short list if that's clearer, sign-off).
- Keep the body proportional to the ask — a quick follow-up should be 3-5 sentences, not a wall of text. A more substantial outreach or negotiation email can run longer, but stay tight; no filler sentences.
- After the draft, if there's a real judgment call (e.g. tone level, how much detail to include, whether to CC someone), add a one-line "Note:" with the call you made — skip this if there's nothing worth flagging.
- If genuinely useful, you may offer one alternate shorter or more direct version under a "### Shorter version" heading — but do not pad every response with unnecessary variants.

Tone: professional, direct, no corporate throat-clearing ("I hope this email finds you well" only if the user's own context calls for that register). Match the formality to what the user described — a note to a professor reads differently than a cold outreach email to a founder.
`.trim();
}

export async function maybeHandleEmailIntent(
  messages: ApiMessage[]
): Promise<BackendIntentResult> {
  const lastUserMessage = getLastUserMessage(messages);

  if (!lastUserMessage || !isEmailIntent(lastUserMessage)) {
    return { handled: false };
  }

  return {
    handled: true,
    generate: {
      systemPrompt: buildEmailSystemPrompt(),
    },
  };
}
