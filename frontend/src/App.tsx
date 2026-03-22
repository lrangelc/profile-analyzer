import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanZone } from "@/components/ScanZone";
import { ResultCard } from "@/components/ResultCard";
import { RoastStream } from "@/components/RoastStream";
import { BurnCardExport } from "@/components/BurnCard";
import { useProfileAnalysis } from "@/hooks/useProfileAnalysis";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

function getBestRoastLine(roast: string): string {
  if (!roast.trim()) return "";
  const sentences = roast.split(/[.!?]+/).filter(Boolean);
  return sentences[0]?.trim() + (sentences[0]?.endsWith(".") ? "" : ".") || roast.slice(0, 120) + "...";
}

export default function App() {
  const { grade, viralIdeas, roastText, isLoading, error, analyze, reset } = useProfileAnalysis();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageFileRef = useRef<File | null>(null);

  const handleAnalyze = useCallback((file: File) => {
    imageFileRef.current = file;
    setImagePreview(URL.createObjectURL(file));
    analyze(file);
  }, [analyze]);

  const handleReset = useCallback(() => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    imageFileRef.current = null;
    reset();
  }, [imagePreview, reset]);

  const hasResult = grade !== null || roastText.length > 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-6">
      <motion.header
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Profile Analyzer</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          RoastMyProfile AI · Vision-powered roast engine
        </p>
      </motion.header>

      <AnimatePresence mode="wait">
        {!hasResult ? (
          <motion.div
            key="scan"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ScanZone
              onAnalyze={handleAnalyze}
              imagePreview={imagePreview}
              isAnalyzing={isLoading}
            />
            <div className="w-full max-w-2xl rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-sm text-[hsl(var(--muted-foreground))]">
              <h3 className="font-medium text-[hsl(var(--foreground))] mb-3">How to use</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Drag and drop a profile screenshot, or click to upload</li>
                <li>Use a screenshot of any social profile (Instagram, Twitter, LinkedIn, etc.)</li>
                <li>Wait for the AI Eye to analyze—you'll see a grade, viral ideas, and a roast</li>
                <li>Use &quot;Download & Share&quot; to save your Burn Card</li>
              </ol>
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            className="flex flex-col items-center gap-6 max-w-2xl w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {grade !== null && (
              <ResultCard grade={grade} viralIdeas={viralIdeas} />
            )}
            <RoastStream text={roastText} />
            {grade !== null && (
              <BurnCardExport
                grade={grade}
                bestRoastLine={getBestRoastLine(roastText)}
              />
            )}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Analyze Another
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
