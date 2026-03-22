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
  STRUCTURED_ANALYSIS_TEXT_SYSTEM,
  ROAST_TEXT_SYSTEM,
} from "../lib/prompts.js";
import { screenshotUrl } from "../lib/screenshot.js";
import {
  extractTextFromFile,
  isDocumentFile,
  isImageFile,
} from "../lib/extractText.js";

const profileSchema = z.object({
  grade: z.enum(["A", "B", "C", "D", "F"]),
  viralIdeas: z.array(z.string()).min(3).max(5),
});

export const analyze = new Hono();

type AnalysisInput =
  | { mode: "image"; imageData: string }
  | { mode: "text"; text: string };

analyze.post("/analyze", async (c) => {
  let input: AnalysisInput | null = null;
  const contentType = c.req.header("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await c.req.json<{
      image?: string;
      url?: string;
      text?: string;
      file?: string;
      mimeType?: string;
      filename?: string;
    }>();
    if (body.text && body.text.trim()) {
      input = { mode: "text", text: body.text.trim() };
    } else if (body.file && body.mimeType) {
      try {
        const buffer = Buffer.from(body.file, "base64");
        const text = await extractTextFromFile(
          buffer,
          body.mimeType,
          body.filename
        );
        if (!text) throw new Error("No text content extracted from file");
        input = { mode: "text", text };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to extract text from file";
        return c.json({ error: msg }, 400);
      }
    } else if (body.url) {
      try {
        const imageData = await screenshotUrl(body.url);
        input = { mode: "image", imageData };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to capture URL screenshot";
        return c.json({ error: msg }, 400);
      }
    } else if (body.image) {
      input = { mode: "image", imageData: body.image };
    }
  } else if (contentType.includes("multipart/form-data")) {
    const formData = await c.req.formData();
    const file = (formData.get("file") ?? formData.get("image")) as File | null;
    if (!file) {
      return c.json({ error: "Missing file or image field" }, 400);
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "";
    const filename = file.name || "";

    if (isDocumentFile(mime, filename)) {
      try {
        const text = await extractTextFromFile(buffer, mime, filename);
        if (!text) throw new Error("No text content extracted from file");
        input = { mode: "text", text };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to extract text from file";
        return c.json({ error: msg }, 400);
      }
    } else if (isImageFile(mime)) {
      const base64 = buffer.toString("base64");
      const imgMime = mime || "image/png";
      input = { mode: "image", imageData: `data:${imgMime};base64,${base64}` };
    } else {
      return c.json({ error: "Unsupported file type. Use image, PDF, TXT, MD, or similar." }, 400);
    }
  }

  if (!input) {
    return c.json({
      error:
        "No input provided. Send JSON: { image }, { url }, { text }, or { file, mimeType }. Or multipart form with 'file'.",
    }, 400);
  }

  if (input.mode === "text") {
    const textContent = input.text;
    return createDataStreamResponse({
      execute: async (writer) => {
        const { object } = await generateObject({
          model: openai("gpt-4o-mini"),
          schema: profileSchema,
          system: STRUCTURED_ANALYSIS_TEXT_SYSTEM,
          messages: [
            {
              role: "user",
              content: `Analyze this profile text and return the grade and viral ideas.\n\n---\n${textContent}`,
            },
          ],
        });

        writer.writeData({
          type: "profile-result",
          grade: object.grade,
          viralIdeas: object.viralIdeas,
        });

        const result = streamText({
          model: openai("gpt-4o-mini"),
          system: ROAST_TEXT_SYSTEM,
          messages: [
            {
              role: "user",
              content: `Roast this profile text.\n\n---\n${textContent}`,
            },
          ],
        });

        result.mergeIntoDataStream(writer);
      },
      onError: (err) => (err instanceof Error ? err.message : "An error occurred"),
    });
  }

  const imageContent = {
    type: "image" as const,
    image: input.imageData,
    mimeType: "image/png" as const,
  };

  return createDataStreamResponse({
    execute: async (writer) => {
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
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
        model: openai("gpt-4o-mini"),
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
