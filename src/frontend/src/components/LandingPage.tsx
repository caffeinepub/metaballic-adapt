import { CheckCircle, ChevronDown } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center px-4 py-8 pb-28">
        <div className="w-full max-w-[480px]">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center mb-10"
          >
            <img
              src="/assets/generated/logo-transparent.dim_200x200.png"
              alt="Metaballic Adapt"
              className="w-16 h-16 object-contain mb-3"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-sm font-semibold text-muted-foreground tracking-wide uppercase font-display">
              Metaballic Adapt
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-center mb-6"
          >
            <h1 className="font-display font-bold text-3xl leading-tight text-foreground mb-4">
              Stop Tracking Calories.
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Start Eating Smarter.
              </span>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Get your personalized diet plan in 30 seconds — no logging, no
              confusion.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-card rounded-2xl p-5 shadow-card mb-8 space-y-3"
          >
            {[
              {
                text: "No manual tracking",
                desc: "Just answer a few questions",
              },
              {
                text: "Instant personalized plan",
                desc: "Ready in under 30 seconds",
              },
              {
                text: "Simple & realistic meals",
                desc: "Food you'll actually enjoy",
              },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <CheckCircle
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  style={{ color: "#3db843" }}
                />
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {item.text}
                  </p>
                  <p className="text-muted-foreground text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            className="flex justify-center"
          >
            <ChevronDown className="w-6 h-6 text-muted-foreground" />
          </motion.div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-[480px] mx-auto">
          <button
            type="button"
            data-ocid="landing.primary_button"
            onClick={onStart}
            className="btn-gradient w-full py-4 rounded-full font-display font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            Get My Plan
          </button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Free · No signup needed · 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
