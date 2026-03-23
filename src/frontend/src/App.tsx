import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ChatOnboarding } from "./components/ChatOnboarding";
import { LandingPage } from "./components/LandingPage";
import { ResultsScreen } from "./components/ResultsScreen";
import { SplashScreen } from "./components/SplashScreen";
import { createActorWithConfig } from "./config";
import type { UserProfile } from "./types/nutrition";

type Screen = "splash" | "landing" | "chat" | "results";

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const sessionCheckedRef = useRef(false);

  // Auto-transition splash → landing after 2.2s
  useEffect(() => {
    if (screen === "splash") {
      const timer = setTimeout(() => setScreen("landing"), 2200);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Show update-info dialog once per results visit if a previous session exists
  useEffect(() => {
    if (screen === "results" && !sessionCheckedRef.current) {
      sessionCheckedRef.current = true;
      const stored = localStorage.getItem("metaballic_session");
      if (stored) {
        setShowUpdateDialog(true);
      }
    }
    if (screen !== "results") {
      sessionCheckedRef.current = false;
    }
  }, [screen]);

  function handleStart() {
    setScreen("chat");
  }

  function handleComplete(p: UserProfile) {
    setProfile(p);
    localStorage.setItem("metaballic_session", JSON.stringify(p));
    // Fire-and-forget backend save
    createActorWithConfig()
      .then((a) =>
        (a as any).saveUserProfile(
          p.goal,
          p.weight,
          p.height,
          p.gymUser ? "gym" : "normal",
        ),
      )
      .catch(() => {});
    setScreen("results");
  }

  function handleRestart() {
    setProfile(null);
    setScreen("landing");
  }

  function handleUpdateYes() {
    setShowUpdateDialog(false);
    setProfile(null);
    setScreen("chat");
  }

  function handleUpdateNo() {
    setShowUpdateDialog(false);
  }

  return (
    <>
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

      {/* Update Info Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent
          className="max-w-[340px] rounded-2xl"
          data-ocid="updateinfo.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-base">Update your info?</DialogTitle>
            <DialogDescription className="text-sm">
              We found your previous profile. Would you like to update your
              details for a more accurate plan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={handleUpdateNo}
              data-ocid="updateinfo.cancel_button"
            >
              No, keep it
            </Button>
            <Button
              className="flex-1 rounded-xl text-white"
              style={{
                background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                border: "none",
              }}
              onClick={handleUpdateYes}
              data-ocid="updateinfo.confirm_button"
            >
              Yes, update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
