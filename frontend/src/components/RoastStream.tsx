import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface RoastStreamProps {
  text: string;
}

export function RoastStream({ text }: RoastStreamProps) {
  return (
    <motion.div
      className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-5 py-3 border-b border-[hsl(var(--border))] flex items-center gap-2">
        <Flame className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">
          The Roast
        </h3>
      </div>
      <div className="p-6">
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-[hsl(var(--card-foreground))]">
          {text || "..."}
        </p>
      </div>
    </motion.div>
  );
}
