import { useRef, forwardRef } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, Sparkles } from "lucide-react";
import type { ProfileGrade } from "@/types/profile";
import { cn } from "@/lib/utils";

interface BurnCardProps {
  grade: ProfileGrade;
  roastText: string;
  viralIdeas: string[];
}

const GRADE_COLORS: Record<ProfileGrade, string> = {
  A: "from-emerald-400 to-emerald-600",
  B: "from-blue-400 to-blue-600",
  C: "from-amber-400 to-amber-600",
  D: "from-orange-400 to-orange-600",
  F: "from-red-400 to-red-600",
};

export const BurnCard = forwardRef<HTMLDivElement, BurnCardProps>(
  ({ grade, roastText, viralIdeas }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-[360px] min-h-[420px] rounded-2xl p-6 flex flex-col gap-5",
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          "border border-slate-600/50 shadow-2xl",
          "relative overflow-hidden"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer rounded-2xl pointer-events-none" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-purple-500/20 rounded-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-5">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            RoastMyProfile AI
          </p>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "shrink-0 inline-flex h-16 w-16 items-center justify-center rounded-xl text-3xl font-bold",
                "bg-gradient-to-br",
                GRADE_COLORS[grade],
                "text-white shadow-lg"
              )}
            >
              {grade}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Roast</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {roastText.trim() || "Your roast will appear here."}
              </p>
            </div>
          </div>
          {viralIdeas.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-600/50">
              <h3 className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Viral Ideas
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-300">
                {viralIdeas.map((idea, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="text-cyan-400 mt-0.5 shrink-0">•</span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
);
BurnCard.displayName = "BurnCard";

export function BurnCardExport({
  grade,
  roastText,
  viralIdeas,
}: {
  grade: ProfileGrade;
  roastText: string;
  viralIdeas: string[];
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#0f172a",
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `burn-card-${grade}-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="fixed -left-[9999px] top-0">
        <BurnCard ref={cardRef} grade={grade} roastText={roastText} viralIdeas={viralIdeas} />
      </div>
      <Button onClick={handleDownload} className="gap-2" size="lg">
        <Download className="w-4 h-4" />
        Download & Share
      </Button>
    </div>
  );
}
