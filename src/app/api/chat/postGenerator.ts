import type { ApiMessage, BackendIntentResult } from "./types";

const POST_ACTION_PHRASES = [
  "write a post",
  "write me a post",
  "write a tweet",
  "write me a tweet",
  "write an x post",
  "write a thread",
  "write me a thread",
  "draft a post",
  "draft a tweet",
  "draft a thread",
  "give me a hook",
  "write a hook",
  "help me post about",
  "post generator",
  "x post about",
  "twitter thread",
  "linkedin post",
  "write a caption",
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

function isPostIntent(input: string): boolean {
  const lower = input.toLowerCase();

  if (POST_ACTION_PHRASES.some((phrase) => lower.includes(phrase))) {
    return true;
  }

  const mentionsPostSurface =
    hasWholeWordMatch(lower, "tweet") ||
    hasWholeWordMatch(lower, "thread") ||
    hasWholeWordMatch(lower, "post") ||
    lower.includes("x post") ||
    lower.includes("linkedin");

  if (!mentionsPostSurface) {
    return false;
  }

  const intentVerbs = [
    "write",
    "draft",
    "give",
    "help",
    "make",
    "create",
    "generate",
    "come up with",
  ];

  return intentVerbs.some((verb) => lower.includes(verb));
}

function buildPostSystemPrompt(): string {
  return `
You are Corsair operating in Post Generator mode.

Task shape:
- The user wants sharp, publish-ready public posts (X/Twitter, LinkedIn, or a similar short-form platform), a hook, or a short thread — not a full essay.
- Infer the platform from context if the user didn't name one (default to X/Twitter-style short-form if unclear). Match the register to the platform: X is punchier and looser, LinkedIn is a bit more composed but should never be corporate-bland.

Output format:
- If the user wants a single post: give 2-3 distinct variants under "### Option 1", "### Option 2", etc., each a self-contained, ready-to-post block of text. Vary the angle (e.g. blunt claim / story hook / question hook), not just the wording.
- If the user wants a thread: output it as a numbered sequence ("1/", "2/", "3/" ...), each tweet-sized (roughly under 280 characters unless the user says otherwise), with the first tweet doing the heavy lifting as the hook.
- Respect platform length norms — do not write an essay-length "post."
- After the draft(s), add a single-line "Note:" only if there's a real tradeoff worth flagging (e.g. "Option 2 is more provocative and may draw pushback"); skip it otherwise.

Tone: sharp, confident, specific — avoid generic engagement-bait phrasing ("You won't believe...", excessive emoji, "🧵" spam, hashtag stuffing). No corporate voice. Write like someone with real opinions and something to say, not like a marketing bot.
`.trim();
}

export async function maybeHandlePostGeneratorIntent(
  messages: ApiMessage[]
): Promise<BackendIntentResult> {
  const lastUserMessage = getLastUserMessage(messages);

  if (!lastUserMessage || !isPostIntent(lastUserMessage)) {
    return { handled: false };
  }

  return {
    handled: true,
    generate: {
      systemPrompt: buildPostSystemPrompt(),
    },
  };
}
