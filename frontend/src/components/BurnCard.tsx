import { useRef, forwardRef } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { ProfileGrade } from "@/types/profile";
import { cn } from "@/lib/utils";

interface BurnCardProps {
  grade: ProfileGrade;
  bestRoastLine: string;
}

const GRADE_COLORS: Record<ProfileGrade, string> = {
  A: "from-emerald-400 to-emerald-600",
  B: "from-blue-400 to-blue-600",
  C: "from-amber-400 to-amber-600",
  D: "from-orange-400 to-orange-600",
  F: "from-red-400 to-red-600",
};

export const BurnCard = forwardRef<HTMLDivElement, BurnCardProps>(
  ({ grade, bestRoastLine }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-[320px] h-[420px] rounded-2xl p-6 flex flex-col justify-between",
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          "border border-slate-600/50 shadow-2xl",
          "relative overflow-hidden"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-purple-500/20" />
        <div className="relative z-10">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            RoastMyProfile AI
          </p>
          <div
            className={cn(
              "inline-flex h-16 w-16 items-center justify-center rounded-xl text-3xl font-bold mb-4",
              "bg-gradient-to-br",
              GRADE_COLORS[grade],
              "text-white shadow-lg"
            )}
          >
            {grade}
          </div>
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-4">
            {bestRoastLine || "Your roast will appear here."}
          </p>
        </div>
      </div>
    );
  }
);
BurnCard.displayName = "BurnCard";

export function BurnCardExport({
  grade,
  bestRoastLine,
}: {
  grade: ProfileGrade;
  bestRoastLine: string;
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
        <BurnCard ref={cardRef} grade={grade} bestRoastLine={bestRoastLine} />
      </div>
      <Button onClick={handleDownload} className="gap-2">
        <Download className="w-4 h-4" />
        Download & Share
      </Button>
    </div>
  );
}
