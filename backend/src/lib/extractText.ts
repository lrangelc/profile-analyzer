import pdfParse from "pdf-parse";

const TEXT_MIMES = [
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
];
const PDF_MIME = "application/pdf";

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  filename?: string
): Promise<string> {
  const mime = (mimeType || "").toLowerCase();
  const ext = filename?.split(".").pop()?.toLowerCase() ?? "";

  if (mime === PDF_MIME || ext === "pdf") {
    const data = await pdfParse(buffer);
    return data.text?.trim() || "";
  }

  if (TEXT_MIMES.some((m) => mime.includes(m)) || ["txt", "md", "csv", "json"].includes(ext)) {
    return buffer.toString("utf-8").trim();
  }

  throw new Error(
    `Unsupported file type. Use PDF, TXT, MD, CSV, or JSON. Got: ${mime || ext || "unknown"}`
  );
}

export function isDocumentFile(mimeType: string, filename?: string): boolean {
  const mime = (mimeType || "").toLowerCase();
  const ext = filename?.split(".").pop()?.toLowerCase() ?? "";
  return (
    mime === PDF_MIME ||
    TEXT_MIMES.some((m) => mime.includes(m)) ||
    ["pdf", "txt", "md", "csv", "json"].includes(ext)
  );
}

export function isImageFile(mimeType: string): boolean {
  return (mimeType || "").toLowerCase().startsWith("image/");
}
