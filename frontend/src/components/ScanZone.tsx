import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload } from "lucide-react";
import { AIEyeOverlay } from "./AIEyeOverlay";

interface ScanZoneProps {
  onAnalyze: (file: File) => void;
  imagePreview: string | null;
  isAnalyzing: boolean;
}

export function ScanZone({
  onAnalyze,
  imagePreview,
  isAnalyzing,
}: ScanZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) onAnalyze(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAnalyze(file);
  };

  return (
    <motion.div
      className="relative w-full max-w-2xl aspect-[4/3] rounded-xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
          <AnimatePresence>
            {isAnalyzing && <AIEyeOverlay />}
          </AnimatePresence>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <Upload className="w-12 h-12" />
          <span className="text-sm font-medium">Drop profile screenshot</span>
          <span className="text-xs">or click to upload</span>
        </button>
      )}
    </motion.div>
  );
}
