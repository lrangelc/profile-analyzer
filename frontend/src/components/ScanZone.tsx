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

const TABS = [
  { id: "upload" as const, label: "Upload", icon: Upload },
  { id: "url" as const, label: "URL", icon: Link2 },
  { id: "file" as const, label: "File", icon: FileText },
] as const;

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
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
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

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && isDocFile(file) && onAnalyzeFile) onAnalyzeFile(file);
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
    <div className="w-full space-y-4">
      {/* Segmented tab control */}
      <div className="inline-flex p-1 rounded-lg bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === id
                ? "text-[hsl(var(--primary-foreground))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            {activeTab === id && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 z-0 rounded-md bg-[hsl(var(--primary))]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {label}
            </span>
          </button>
        ))}
      </div>

      {activeTab === "upload" && (
        <motion.div
          className={`relative min-h-[280px] rounded-xl border-2 border-dashed bg-[hsl(var(--card))]/80 overflow-hidden transition-colors ${
            isDragOver
              ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
              : "border-[hsl(var(--border))]"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf,.txt,.md,.csv"
            onChange={handleChange}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative w-full min-h-[280px] flex items-center justify-center p-4">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="max-h-[320px] w-auto object-contain rounded-lg"
              />
              <AnimatePresence>{showOverlay && <AIEyeOverlay />}</AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors group"
            >
              <div className="rounded-full p-4 bg-[hsl(var(--accent))] group-hover:bg-[hsl(var(--primary))]/20 transition-colors">
                <Upload className="w-10 h-10 text-[hsl(var(--primary))]" />
              </div>
              <span className="font-medium text-[hsl(var(--foreground))]">Drop image or file</span>
              <span className="text-xs">PNG, JPG, screenshot · PDF, TXT, MD</span>
            </button>
          )}
        </motion.div>
      )}

      {activeTab === "url" && (
        <motion.div
          className="relative min-h-[280px] rounded-xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 overflow-hidden flex flex-col"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {urlPreview && isAnalyzing ? (
            <div className="relative flex-1 min-h-[280px] flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <p className="text-sm text-[hsl(var(--muted-foreground))] break-all text-center mb-4 max-w-full truncate">
                  {urlPreview}
                </p>
              </div>
              <AIEyeOverlay />
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="flex-1 flex flex-col justify-center p-6 min-h-[280px] gap-4">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                Profile URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-3 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-shadow"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))] -mt-1">
                LinkedIn, Twitter/X, Instagram, GitHub, and similar profiles
              </p>
              <Button
                type="submit"
                disabled={!url.trim() || isAnalyzing}
                className="mt-2"
              >
                {isAnalyzing ? "Analyzing…" : "Analyze Profile"}
              </Button>
            </form>
          )}
        </motion.div>
      )}

      {activeTab === "file" && (
        <motion.div
          className={`relative min-h-[280px] rounded-xl border-2 border-dashed overflow-hidden flex flex-col transition-colors ${
            isDragOver
              ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
              : "border-[hsl(var(--border))] bg-[hsl(var(--card))]/80"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleFileDrop}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={DOC_ACCEPT}
            onChange={handleFileChange}
            className="hidden"
          />
          {filePreview && isAnalyzing ? (
            <div className="relative flex-1 min-h-[280px] flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <FileText className="w-12 h-12 text-[hsl(var(--primary))] mb-4" />
                <p className="text-sm text-[hsl(var(--muted-foreground))] break-all text-center font-medium">
                  {filePreview}
                </p>
              </div>
              <AIEyeOverlay />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-h-[280px] flex flex-col items-center justify-center gap-4 p-6 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors group"
            >
              <div className="rounded-full p-4 bg-[hsl(var(--accent))] group-hover:bg-[hsl(var(--primary))]/20 transition-colors">
                <FileText className="w-10 h-10 text-[hsl(var(--primary))]" />
              </div>
              <span className="font-medium text-[hsl(var(--foreground))]">Drop PDF or text file</span>
              <span className="text-xs">.pdf, .txt, .md, .csv</span>
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
