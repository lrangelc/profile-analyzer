import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProfileGrade } from "@/types/profile";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

const GRADE_COLORS: Record<ProfileGrade, string> = {
  A: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  B: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  C: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  D: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  F: "bg-red-500/20 text-red-400 border-red-500/50",
};

interface ResultCardProps {
  grade: ProfileGrade;
  viralIdeas: string[];
}

export function ResultCard({ grade, viralIdeas }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card className="w-full border-[hsl(var(--border))] overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-xl">Profile Grade</CardTitle>
          <CardDescription>Your social media profile scorecard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-5">
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
              className={cn(
                "flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 text-3xl font-bold font-display",
                GRADE_COLORS[grade]
              )}
            >
              {grade}
            </motion.span>
          </div>
          {viralIdeas.length > 0 && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]">
                <Sparkles className="w-4 h-4 text-[hsl(var(--primary))]" />
                Viral Ideas
              </h4>
              <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                {viralIdeas.map((idea, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    className="flex gap-2 items-start"
                  >
                    <span className="text-[hsl(var(--primary))] mt-0.5">•</span>
                    <span>{idea}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
