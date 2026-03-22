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

const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

const profileSchema = z.object({
  grade: z.enum(["A", "B", "C", "D", "F"]),
  viralIdeas: z.array(z.string()).min(3).max(5),
});

export const analyze = new Hono();

type AnalysisInput =
  | { mode: "image"; imageData: string }
  | { mode: "text"; text: string };

analyze.post("/analyze", async (c) => {
  const contentType = c.req.header("content-type") || "";
  const inputType = contentType.includes("application/json") ? "json" : contentType.includes("multipart/form-data") ? "form" : "unknown";
  console.log("[analyze] POST /api/analyze received", { contentType: inputType });

  if (!process.env.OPENAI_API_KEY) {
    console.error("[analyze] OPENAI_API_KEY is not set");
    return c.json({ error: "Server configuration error: OPENAI_API_KEY is not set. Add it to your .env file." }, 500);
  }

  let input: AnalysisInput | null = null;

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
        console.error("[analyze] File extraction failed:", msg);
        return c.json({ error: msg }, 400);
      }
    } else if (body.url) {
      try {
        console.log("[analyze] Capturing screenshot for URL:", body.url);
        const imageData = await screenshotUrl(body.url);
        console.log("[analyze] Screenshot captured successfully");
        input = { mode: "image", imageData };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to capture URL screenshot";
        console.error("[analyze] Screenshot failed:", msg);
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
    console.warn("[analyze] No valid input provided");
    return c.json({
      error:
        "No input provided. Send JSON: { image }, { url }, { text }, or { file, mimeType }. Or multipart form with 'file'.",
    }, 400);
  }

  console.log("[analyze] Starting analysis, mode:", input.mode);

  if (input.mode === "text") {
    const textContent = input.text;
    const streamRes = createDataStreamResponse({
      execute: async (writer) => {
        const { object } = await generateObject({
          model: openai(openaiModel),
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
          model: openai(openaiModel),
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
      onError: (err) => {
        const msg = err instanceof Error ? err.message : "An error occurred";
        console.error("[analyze] Stream error (text):", msg);
        return msg;
      },
    });
    streamRes.headers.set("Content-Encoding", "none");
    return streamRes;
  }

  const imageContent = {
    type: "image" as const,
    image: input.imageData,
    mimeType: "image/png" as const,
  };

  const streamRes = createDataStreamResponse({
    execute: async (writer) => {
      try {
        console.log("[analyze] Execute started, calling OpenAI generateObject (vision)...");
        const { object } = await generateObject({
          model: openai(openaiModel),
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
        console.log("[analyze] generateObject done, grade:", object.grade);

        writer.writeData({
          type: "profile-result",
          grade: object.grade,
          viralIdeas: object.viralIdeas,
        });

        console.log("[analyze] Starting roast streamText...");
        const result = streamText({
          model: openai(openaiModel),
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
        console.log("[analyze] Stream complete");
      } catch (err) {
        console.error("[analyze] Execute error:", err);
        throw err;
      }
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "An error occurred";
      console.error("[analyze] Stream error (image):", msg);
      return msg;
    },
  });
  streamRes.headers.set("Content-Encoding", "none");
  return streamRes;
});
