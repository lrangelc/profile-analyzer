import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProfileGrade } from "@/types/profile";
import { cn } from "@/lib/utils";

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
    <Card className="w-full max-w-xl border-[hsl(var(--border))]">
      <CardHeader>
        <CardTitle>Profile Grade</CardTitle>
        <CardDescription>Your social media profile scorecard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-lg border-2 text-3xl font-bold",
              GRADE_COLORS[grade]
            )}
          >
            {grade}
          </span>
        </div>
        {viralIdeas.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Viral Ideas</h4>
            <ul className="space-y-1.5 text-sm text-[hsl(var(--muted-foreground))]">
              {viralIdeas.map((idea, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[hsl(var(--primary))]">•</span>
                  {idea}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
