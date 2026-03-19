import { motion } from "motion/react";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <img
          src="/assets/uploads/file_000000001d9872089e4984a0f8198a87-1.png"
          alt="Metaballic Adapt"
          className="w-44 h-44 object-contain drop-shadow-lg"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-muted-foreground italic text-lg text-center font-body"
        >
          Nutrition that adapts to you
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
          className="h-1 w-32 rounded-full"
          style={{ background: "linear-gradient(90deg, #3db843, #1a6fc4)" }}
        />
      </motion.div>
    </div>
  );
}
