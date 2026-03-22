import { motion } from "framer-motion";

const LABELS = [
  "Analyzing Bio...",
  "Detecting Cringe...",
  "Scanning Vibes...",
  "Assessing Aesthetic...",
  "Processing Charisma...",
];

export function AIEyeOverlay() {
  return (
    <motion.div
      className="absolute inset-0 bg-black/60 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-4 border-2 border-[hsl(var(--primary))]/50 rounded-lg pointer-events-none">
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>
      {LABELS.map((label, i) => (
        <motion.div
          key={label}
          className="absolute px-3 py-1 rounded bg-black/80 text-[hsl(var(--primary))] text-xs font-mono"
          style={{
            left: `${20 + (i % 3) * 30}%`,
            top: `${25 + Math.floor(i / 3) * 40}%`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: 1,
          }}
          transition={{
            duration: 1.2,
            delay: i * 0.2,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        >
          {label}
        </motion.div>
      ))}
    </motion.div>
  );
}
