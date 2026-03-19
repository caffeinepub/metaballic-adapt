import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChatOnboarding } from "./components/ChatOnboarding";
import { LandingPage } from "./components/LandingPage";
import { ResultsScreen } from "./components/ResultsScreen";
import { SplashScreen } from "./components/SplashScreen";
import type { UserProfile } from "./types/nutrition";

type Screen = "splash" | "landing" | "chat" | "results";

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Auto-transition splash → landing after 2.2s
  useEffect(() => {
    if (screen === "splash") {
      const timer = setTimeout(() => setScreen("landing"), 2200);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  function handleStart() {
    setScreen("chat");
  }

  function handleComplete(p: UserProfile) {
    setProfile(p);
    setScreen("results");
  }

  function handleRestart() {
    setProfile(null);
    setScreen("landing");
  }

  return (
    <AnimatePresence mode="wait">
      {screen === "splash" && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SplashScreen />
        </motion.div>
      )}

      {screen === "landing" && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <LandingPage onStart={handleStart} />
        </motion.div>
      )}

      {screen === "chat" && (
        <motion.div
          key="chat"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35 }}
        >
          <ChatOnboarding onComplete={handleComplete} />
        </motion.div>
      )}

      {screen === "results" && profile && (
        <motion.div
          key="results"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <ResultsScreen profile={profile} onRestart={handleRestart} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
