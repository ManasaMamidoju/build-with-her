import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";

/**
 * AEO/GEO check: when someone asks an AI assistant (with live web search)
 * for the best [service] in [city], does this business come up?
 */
const AiVisibilitySchema = z.object({
  query: z.string().describe("The exact question that was searched and answered"),
  mentioned: z.boolean().describe("True only if the business itself is named in the answer"),
  position: z
    .number()
    .int()
    .nullable()
    .describe("1-based rank of the business in the recommendations, or null if not mentioned"),
  recommended: z
    .array(z.string())
    .describe("Names of the businesses the answer recommends, in order, at most 5"),
  what_ai_knows: z
    .string()
    .describe(
      "One or two sentences on what the web says about this business, or that nothing was found",
    ),
  sources_found: z
    .array(z.string())
    .describe("Sites where this business was found (e.g. yelp.com, instagram.com), at most 6"),
});

export type AiVisibility = z.infer<typeof AiVisibilitySchema>;

export async function checkAiVisibility(input: {
  businessName: string;
  service: string;
  city: string;
  website?: string | null;
}): Promise<AiVisibility | null> {
  if (!process.env["ANTHROPIC_API_KEY"]) return null;
  const client = new Anthropic({ timeout: 90_000, maxRetries: 1 });

  const query = `Who is the best ${input.service} in ${input.city}?`;
  const prompt = `A potential client asks an AI assistant: "${query}"

1. Search the web and answer that question the way a helpful assistant would, recommending up to 5 businesses.
2. Then report whether this specific business was among them: "${input.businessName}"${
    input.website ? ` (website: ${input.website})` : ""
  }. Only count it as mentioned if that business, not a similarly named one, is in your recommendations.
3. Separately, search for the business by name and summarize what the web says about it and where it appears.

Return the result in the requested JSON format.`;

  try {
    const response = await client.beta.messages.parse({
      model: "claude-opus-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: zodOutputFormat(AiVisibilitySchema) },
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
      messages: [{ role: "user", content: prompt }],
    });
    if (response.stop_reason === "refusal") {
      console.error("ai visibility refused", response.stop_details?.category);
      return null;
    }
    return response.parsed_output ?? null;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`ai visibility failed [${error.status}]`, error.message);
    } else {
      console.error("ai visibility failed", error);
    }
    return null;
  }
}
