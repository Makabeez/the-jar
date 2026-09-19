import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LOCAL_FORTUNES, MAX_QUESTION_CHARS } from "./cookie/constants";
import { pickLocalFortune } from "./cookie/memo";

const inputSchema = z.object({
  question: z.string().trim().min(3).max(MAX_QUESTION_CHARS),
  slot: z.number().int().nonnegative().optional(),
});

function localFortune(question: string, slot?: number) {
  const idx = pickLocalFortune(`${question}|${slot ?? 0}`) % LOCAL_FORTUNES.length;
  return LOCAL_FORTUNES[idx] ?? LOCAL_FORTUNES[0];
}

export const askOracle = createServerFn({ method: "POST" })
  .validator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const fallback = localFortune(data.question, data.slot);
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: true as const, text: fallback, source: "jar" as const };
    }

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(12_000),
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.95,
          max_tokens: 80,
          messages: [
            {
              role: "system",
              content:
                "You are The Jar, an oracle on Cookie Chain, a community-run SVM. Write one short fortune, at most two sentences and under 200 characters. Dry, slightly degen, bakery-kitchen tone. No emoji, no hashtags, no quotes around the whole answer, no preamble.",
            },
            {
              role: "user",
              content: `Question from a baker: ${data.question}`,
            },
          ],
        }),
      });
      if (!res.ok) {
        return { ok: true as const, text: fallback, source: "jar" as const };
      }
      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = body.choices?.[0]?.message?.content?.trim();
      if (!text) return { ok: true as const, text: fallback, source: "jar" as const };
      const clipped = text.replace(/^["\u201c]|["\u201d]$/g, "").slice(0, 200);
      return { ok: true as const, text: clipped, source: "oracle" as const };
    } catch {
      return { ok: true as const, text: fallback, source: "jar" as const };
    }
  });
