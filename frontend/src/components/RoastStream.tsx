import { motion } from "framer-motion";

interface RoastStreamProps {
  text: string;
}

export function RoastStream({ text }: RoastStreamProps) {
  return (
    <motion.div
      className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-[hsl(var(--card-foreground))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-3">
        The Roast
      </h3>
      <p className="text-base leading-relaxed whitespace-pre-wrap">{text || "..."}</p>
    </motion.div>
  );
}
