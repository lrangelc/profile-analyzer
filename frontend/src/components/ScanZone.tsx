import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Link2, FileText } from "lucide-react";
import { AIEyeOverlay } from "./AIEyeOverlay";
import { Button } from "@/components/ui/button";

const DOC_ACCEPT = ".pdf,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv";

interface ScanZoneProps {
  onAnalyze: (file: File) => void;
  onAnalyzeUrl?: (url: string) => void;
  onAnalyzeFile?: (file: File) => void;
  imagePreview: string | null;
  urlPreview: string | null;
  filePreview: string | null;
  isAnalyzing: boolean;
}

function isDocFile(file: File): boolean {
  const t = file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase();
  return (
    t === "application/pdf" ||
    t.startsWith("text/") ||
    ["pdf", "txt", "md", "csv", "json"].includes(ext || "")
  );
}

export function ScanZone({
  onAnalyze,
  onAnalyzeUrl,
  onAnalyzeFile,
  imagePreview,
  urlPreview,
  filePreview,
  isAnalyzing,
}: ScanZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "url" | "file">("upload");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type.startsWith("image/")) onAnalyze(file);
    else if (isDocFile(file) && onAnalyzeFile) {
      setActiveTab("file");
      onAnalyzeFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/")) onAnalyze(file);
    else if (isDocFile(file) && onAnalyzeFile) {
      setActiveTab("file");
      onAnalyzeFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAnalyzeFile) onAnalyzeFile(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed && onAnalyzeUrl) onAnalyzeUrl(trimmed);
  };

  const hasPreview = imagePreview || urlPreview;
  const showOverlay = hasPreview && isAnalyzing;

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex gap-2 border-b border-[hsl(var(--border))] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "upload"
              ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2 align-middle" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "url"
              ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <Link2 className="w-4 h-4 inline mr-2 align-middle" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("file")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "file"
              ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2 align-middle" />
          File
        </button>
      </div>

      {activeTab === "upload" && (
        <motion.div
          className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf,.txt,.md,.csv"
            onChange={handleChange}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative w-full h-full">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="w-full h-full object-contain"
              />
              <AnimatePresence>{showOverlay && <AIEyeOverlay />}</AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              <Upload className="w-12 h-12" />
              <span className="text-sm font-medium">Drop image or file</span>
              <span className="text-xs">screenshot, PDF, TXT, MD</span>
            </button>
          )}
        </motion.div>
      )}

      {activeTab === "url" && (
        <motion.div
          className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden flex flex-col"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {urlPreview && isAnalyzing ? (
            <div className="relative flex-1 w-full min-h-0">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <p className="text-sm text-[hsl(var(--muted-foreground))] break-all text-center mb-4">
                  {urlPreview}
                </p>
              </div>
              <AIEyeOverlay />
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="flex-1 flex flex-col p-6">
              <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Profile URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-3 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 mb-4">
                LinkedIn, Twitter/X, Instagram, GitHub, and similar profiles
              </p>
              <Button type="submit" disabled={!url.trim() || isAnalyzing}>
                Analyze Profile
              </Button>
            </form>
          )}
        </motion.div>
      )}

      {activeTab === "file" && (
        <motion.div
          className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden flex flex-col"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={DOC_ACCEPT}
            onChange={handleFileChange}
            className="hidden"
          />
          {filePreview && isAnalyzing ? (
            <div className="relative flex-1 w-full min-h-0">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <FileText className="w-12 h-12 text-[hsl(var(--muted-foreground))] mb-4" />
                <p className="text-sm text-[hsl(var(--muted-foreground))] break-all text-center">
                  {filePreview}
                </p>
              </div>
              <AIEyeOverlay />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center gap-3 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              <FileText className="w-12 h-12" />
              <span className="text-sm font-medium">Drop PDF or text file</span>
              <span className="text-xs">.pdf, .txt, .md, .csv</span>
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
