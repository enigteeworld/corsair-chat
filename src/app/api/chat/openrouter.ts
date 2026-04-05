import type { ApiMessage, OpenRouterStreamChunk } from "./types";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim() || "";
const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL?.trim() || "https://openrouter.ai/api/v1";

const OPENROUTER_MODELS = (
  process.env.OPENROUTER_MODELS?.trim() ||
  [
    "openai/gpt-4o-mini",
    "openai/gpt-oss-20b:free",
    "meta-llama/llama-3.3-70b-instruct:free",
  ].join(",")
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const OPENROUTER_HTTP_REFERER =
  process.env.OPENROUTER_HTTP_REFERER?.trim() || "http://localhost:3000";

const OPENROUTER_APP_NAME =
  process.env.OPENROUTER_APP_NAME?.trim() || "Corsair";

const OPENROUTER_MAX_RETRIES = Number(
  process.env.OPENROUTER_MAX_RETRIES?.trim() || "2"
);

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

function extractOpenRouterChunkContent(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "";
  }

  const chunk = data as OpenRouterStreamChunk;
  const first = chunk.choices?.[0];

  if (!first) {
    return "";
  }

  if (typeof first.delta?.content === "string") {
    return first.delta.content;
  }

  if (typeof first.message?.content === "string") {
    return first.message.content;
  }

  if (typeof first.text === "string") {
    return first.text;
  }

  return "";
}

async function readErrorDetails(response: Response): Promise<string> {
  const rawText = await response.text();

  if (!rawText) {
    return `HTTP ${response.status}`;
  }

  try {
    const parsed = JSON.parse(rawText);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return rawText;
  }
}

function buildOpenRouterHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "HTTP-Referer": OPENROUTER_HTTP_REFERER,
    "X-Title": OPENROUTER_APP_NAME,
  };
}

export function hasOpenRouterConfig() {
  return {
    hasApiKey: Boolean(OPENROUTER_API_KEY),
    hasModels: OPENROUTER_MODELS.length > 0,
  };
}

export async function streamFromOpenRouter(
  messages: ApiMessage[],
  systemPrompt: string
) {
  const modelsToTry = OPENROUTER_MODELS.slice(
    0,
    Math.max(1, OPENROUTER_MAX_RETRIES + 1)
  );

  let lastFailure = "No models were configured for OpenRouter.";

  for (const model of modelsToTry) {
    try {
      const upstreamResponse = await fetch(
        `${OPENROUTER_BASE_URL}/chat/completions`,
        {
          method: "POST",
          headers: buildOpenRouterHeaders(),
          body: JSON.stringify({
            model,
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            stream: true,
          }),
        }
      );

      if (!upstreamResponse.ok) {
        const details = await readErrorDetails(upstreamResponse);
        lastFailure = `Model ${model} failed with status ${upstreamResponse.status}: ${details}`;
        continue;
      }

      if (!upstreamResponse.body) {
        lastFailure = `Model ${model} returned no response body.`;
        continue;
      }

      const contentType = upstreamResponse.headers.get("content-type") ?? "";
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      const reader = upstreamResponse.body.getReader();

      return new Response(
        new ReadableStream<Uint8Array>({
          async start(controller) {
            let buffer = "";

            try {
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const events = buffer.split("\n\n");
                buffer = events.pop() ?? "";

                for (const event of events) {
                  const lines = event.split("\n");

                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith("data:")) continue;

                    const payload = trimmed.slice(5).trim();
                    if (!payload || payload === "[DONE]") continue;

                    try {
                      const parsed = JSON.parse(payload);
                      const chunkText = extractOpenRouterChunkContent(parsed);

                      if (chunkText) {
                        controller.enqueue(encoder.encode(chunkText));
                      }
                    } catch {
                      // ignore malformed partial chunks
                    }
                  }
                }
              }

              controller.close();
            } catch (error) {
              console.error("OpenRouter streaming relay error:", error);
              controller.error(error);
            } finally {
              reader.releaseLock();
            }
          },
        }),
        {
          headers: {
            "Content-Type": contentType.includes("text/event-stream")
              ? "text/plain; charset=utf-8"
              : "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Corsair-Model": model,
          },
        }
      );
    } catch (error) {
      lastFailure =
        error instanceof Error
          ? `Model ${model} request error: ${error.message}`
          : `Model ${model} request error.`;
    }
  }

  return streamTextResponse(
    [
      "OpenRouter request failed after trying fallback models.",
      "",
      `Tried models: ${modelsToTry.join(", ")}`,
      "",
      lastFailure,
    ].join("\n")
  );
}