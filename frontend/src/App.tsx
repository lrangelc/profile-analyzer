import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanZone } from "@/components/ScanZone";
import { ResultCard } from "@/components/ResultCard";
import { RoastStream } from "@/components/RoastStream";
import { BurnCardExport } from "@/components/BurnCard";
import { useProfileAnalysis } from "@/hooks/useProfileAnalysis";
import { Button } from "@/components/ui/button";
import { RotateCcw, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

function getBestRoastLine(roast: string): string {
  if (!roast.trim()) return "";
  const sentences = roast.split(/[.!?]+/).filter(Boolean);
  return sentences[0]?.trim() + (sentences[0]?.endsWith(".") ? "" : ".") || roast.slice(0, 120) + "...";
}

export default function App() {
  const { grade, viralIdeas, roastText, isLoading, error, analyze, analyzeByUrl, analyzeFile, reset } = useProfileAnalysis();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const imageFileRef = useRef<File | null>(null);

  const handleAnalyze = useCallback((file: File) => {
    imageFileRef.current = file;
    setImagePreview(URL.createObjectURL(file));
    setUrlPreview(null);
    setFilePreview(null);
    analyze(file);
  }, [analyze]);

  const handleAnalyzeUrl = useCallback((url: string) => {
    setUrlPreview(url);
    setImagePreview(null);
    setFilePreview(null);
    imageFileRef.current = null;
    analyzeByUrl(url);
  }, [analyzeByUrl]);

  const handleAnalyzeFile = useCallback((file: File) => {
    setFilePreview(file.name);
    setImagePreview(null);
    setUrlPreview(null);
    imageFileRef.current = null;
    analyzeFile(file);
  }, [analyzeFile]);

  const handleReset = useCallback(() => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setUrlPreview(null);
    setFilePreview(null);
    imageFileRef.current = null;
    reset();
  }, [imagePreview, reset]);

  const hasResult = grade !== null || roastText.length > 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative flex flex-col items-center justify-center px-4 py-8 sm:p-6 md:p-8 overflow-x-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--background))] to-transparent pointer-events-none z-0" />
      <div className="grain-overlay" />

      <motion.header
        className="relative z-10 text-center mb-6 sm:mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          RoastMyProfile
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2 text-sm sm:text-base font-medium">
          Vision-powered roast engine
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
          <span className="text-xs font-medium text-[hsl(var(--primary))]">AI</span>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {!hasResult ? (
          <motion.div
            key="scan"
            className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ScanZone
              onAnalyze={handleAnalyze}
              onAnalyzeUrl={handleAnalyzeUrl}
              onAnalyzeFile={handleAnalyzeFile}
              imagePreview={imagePreview}
              urlPreview={urlPreview}
              filePreview={filePreview}
              isAnalyzing={isLoading}
            />

            <div className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowHelp((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-[hsl(var(--accent))]/50 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]">
                  <HelpCircle className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  How to use
                </span>
                {showHelp ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
              </button>
              <AnimatePresence>
                {showHelp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[hsl(var(--border))]"
                  >
                    <ol className="list-decimal list-inside space-y-2 p-4 pt-3 text-sm text-[hsl(var(--muted-foreground))]">
                      <li>Upload an image, paste a URL, or add a PDF/text file</li>
                      <li>Use <strong className="text-[hsl(var(--foreground))]">Upload</strong> (images), <strong className="text-[hsl(var(--foreground))]">URL</strong> (LinkedIn, Twitter, etc.), or <strong className="text-[hsl(var(--foreground))]">File</strong> (PDF, TXT, MD)</li>
                      <li>Wait for the AI to analyze—grade, viral ideas, and roast</li>
                      <li>Download & share your Burn Card when done</li>
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            className="relative z-10 flex flex-col items-center gap-6 max-w-2xl w-full"
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
              <p className="w-full text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>
            )}
            <Button variant="outline" onClick={handleReset} className="gap-2 mt-2">
              <RotateCcw className="w-4 h-4" />
              Analyze Another
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
