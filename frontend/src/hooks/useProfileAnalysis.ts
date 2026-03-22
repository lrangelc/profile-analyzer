import { useState, useCallback } from "react";
import type { ProfileResult, ProfileGrade } from "@/types/profile";

const VALID_GRADES: ProfileGrade[] = ["A", "B", "C", "D", "F"];
function isProfileGrade(s: unknown): s is ProfileGrade {
  return typeof s === "string" && VALID_GRADES.includes(s as ProfileGrade);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useProfileAnalysis() {
  const [grade, setGrade] = useState<ProfileResult["grade"] | null>(null);
  const [viralIdeas, setViralIdeas] = useState<string[]>([]);
  const [roastText, setRoastText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (body: { image?: string; url?: string; file?: string; mimeType?: string; filename?: string }) => {
    setIsLoading(true);
    setError(null);
    setGrade(null);
    setViralIdeas([]);
    setRoastText("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("2:")) {
            try {
              const arr = JSON.parse(line.slice(2)) as unknown[];
              const data = arr?.[0];
              if (data && typeof data === "object" && "type" in data && (data as { type: string }).type === "profile-result") {
                const d = data as { grade?: unknown; viralIdeas?: string[] };
                setGrade(isProfileGrade(d.grade) ? d.grade : null);
                setViralIdeas(d.viralIdeas ?? []);
              }
            } catch {
              /* ignore parse errors */
            }
          } else if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2)) as string;
              setRoastText((prev) => prev + text);
            } catch {
              /* ignore */
            }
          } else if (line.startsWith("3:")) {
            try {
              const errMsg = JSON.parse(line.slice(2)) as string;
              setError(errMsg);
            } catch {
              /* ignore */
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyze = useCallback(async (imageFile: File) => {
    const base64 = await fileToBase64(imageFile);
    return runAnalysis({ image: base64 });
  }, [runAnalysis]);

  const analyzeByUrl = useCallback(async (url: string) => {
    return runAnalysis({ url: url.trim() });
  }, [runAnalysis]);

  const analyzeFile = useCallback(async (file: File) => {
    const base64 = await fileToBase64(file);
    const dataUrl = base64;
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = match?.[1] || file.type || "application/octet-stream";
    const fileBase64 = match?.[2] || base64.split(",")[1] || "";
    return runAnalysis({ file: fileBase64, mimeType, filename: file.name });
  }, [runAnalysis]);

  const reset = useCallback(() => {
    setGrade(null);
    setViralIdeas([]);
    setRoastText("");
    setError(null);
  }, []);

  return {
    grade,
    viralIdeas,
    roastText,
    isLoading,
    error,
    analyze,
    analyzeByUrl,
    analyzeFile,
    reset,
  };
}
