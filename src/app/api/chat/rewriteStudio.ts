import type { ApiMessage, BackendIntentResult } from "./types";

const REWRITE_ACTION_PHRASES = [
  "rewrite this",
  "rewrite the following",
  "reword this",
  "reword the following",
  "make this more",
  "make this sound more",
  "tighten this",
  "tighten this up",
  "shorten this",
  "make this shorter",
  "make this clearer",
  "clean this up",
  "improve this writing",
  "polish this",
  "punch this up",
  "rephrase this",
  "change the tone of",
  "make this more formal",
  "make this more casual",
  "make this more professional",
  "make this more concise",
  "simplify this",
  "edit this for clarity",
];

function getLastUserMessage(messages: ApiMessage[]): string {
  const reversed = [...messages].reverse();
  const lastUser = reversed.find((message) => message.role === "user");
  return lastUser?.content?.trim() ?? "";
}

function isRewriteIntent(input: string): boolean {
  const lower = input.toLowerCase();

  if (REWRITE_ACTION_PHRASES.some((phrase) => lower.includes(phrase))) {
    return true;
  }

  const mentionsRewrite =
    lower.includes("rewrite") ||
    lower.includes("reword") ||
    lower.includes("rephrase");

  if (mentionsRewrite) {
    return true;
  }

  // "tone" / "clarity" / "concise" combined with an editing verb and a
  // pointer to existing text ("this", "the following", quoted text) is a
  // strong rewrite signal even without the word "rewrite" itself.
  const editingVerbs = ["make", "change", "adjust", "fix", "clean", "polish"];
  const editingTargets = ["tone", "clarity", "clearer", "concise", "formal", "casual", "professional", "shorter", "punchier"];
  const pointsAtExistingText =
    lower.includes("this") || lower.includes("the following") || lower.includes('"');

  return (
    pointsAtExistingText &&
    editingVerbs.some((verb) => lower.includes(verb)) &&
    editingTargets.some((target) => lower.includes(target))
  );
}

function buildRewriteSystemPrompt(): string {
  return `
You are Corsair operating in Rewrite Studio mode.

Task shape:
- The user has given you (or referenced) a piece of their own text and wants it rewritten for tone, clarity, brevity, or stronger structure.
- Preserve their actual meaning, facts, and intent. Do not add claims, examples, or details that weren't there. Do not silently change the point they were making.
- If the user specified a direction (more formal, shorter, punchier, warmer, etc.), optimize hard for that direction. If they didn't specify one, default to: clearer, tighter, and more direct, while keeping their voice recognizable rather than flattening it into generic corporate tone.
- If no source text is actually present in the conversation to rewrite, say so plainly and ask them to paste it — do not fabricate a rewrite of nothing.

Output format:
- "### Rewritten" — the rewritten text, clean and ready to use, with no surrounding commentary inside that block.
- "### What changed" — 2-4 short bullets naming the concrete edits (e.g. "Cut throat-clearing opener", "Merged two sentences for flow", "Swapped passive voice for direct statements") — not a generic "improved clarity" bullet.
- Only if the request is ambiguous about degree, optionally add one alternate version under "### Shorter / more direct option" — skip this if the primary rewrite already nails it.

Tone: precise and unsentimental about the edit itself — you're a sharp editor, not a cheerleader. Don't praise the original text before cutting it apart; just do the work.
`.trim();
}

export async function maybeHandleRewriteStudioIntent(
  messages: ApiMessage[]
): Promise<BackendIntentResult> {
  const lastUserMessage = getLastUserMessage(messages);

  if (!lastUserMessage || !isRewriteIntent(lastUserMessage)) {
    return { handled: false };
  }

  return {
    handled: true,
    generate: {
      systemPrompt: buildRewriteSystemPrompt(),
    },
  };
}
