import { motion } from "motion/react";

export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background:
          "linear-gradient(160deg, #0f2027 0%, #1a6fc4 50%, #3db843 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl font-bold tracking-tight text-center px-6"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #a8f0b0 60%, #7dd3fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontFamily: "Figtree, sans-serif",
          }}
        >
          Metaballic Adapt
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-white/80 text-lg text-center"
        >
          Nutrition that adapts to you
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
          className="h-1 w-32 rounded-full mt-2"
          style={{ background: "linear-gradient(90deg, #3db843, #1a6fc4)" }}
        />
      </motion.div>
    </div>
  );
}
