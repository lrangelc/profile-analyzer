import { Hono } from "hono";
import { openai } from "@ai-sdk/openai";
import {
  createDataStreamResponse,
  streamText,
  generateObject,
} from "ai";
import { z } from "zod";
import {
  STRUCTURED_ANALYSIS_SYSTEM,
  ROAST_SYSTEM,
} from "../lib/prompts.js";

const profileSchema = z.object({
  grade: z.enum(["A", "B", "C", "D", "F"]),
  viralIdeas: z.array(z.string()).min(3).max(5),
});

export const analyze = new Hono();

analyze.post("/analyze", async (c) => {
  let imageData: string | undefined;
  const contentType = c.req.header("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await c.req.json<{ image?: string }>();
    imageData = body.image;
  } else if (contentType.includes("multipart/form-data")) {
    const formData = await c.req.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return c.json({ error: "Missing image field" }, 400);
    }
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mime = file.type || "image/png";
    imageData = `data:${mime};base64,${base64}`;
  }

  if (!imageData) {
    return c.json({ error: "No image provided. Send JSON { image: base64DataUrl } or multipart form with 'image' file." }, 400);
  }

  const imageContent = {
    type: "image" as const,
    image: imageData,
    mimeType: "image/png" as const,
  };

  return createDataStreamResponse({
    execute: async (writer) => {
      const { object } = await generateObject({
        model: openai("gpt-4o"),
        schema: profileSchema,
        system: STRUCTURED_ANALYSIS_SYSTEM,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this profile screenshot and return the grade and viral ideas." },
              imageContent,
            ],
          },
        ],
      });

      writer.writeData({
        type: "profile-result",
        grade: object.grade,
        viralIdeas: object.viralIdeas,
      });

      const result = streamText({
        model: openai("gpt-4o"),
        system: ROAST_SYSTEM,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Roast this profile. Be witty and punchy." },
              imageContent,
            ],
          },
        ],
      });

      result.mergeIntoDataStream(writer);
    },
    onError: (err) => (err instanceof Error ? err.message : "An error occurred"),
  });
});
