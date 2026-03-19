import {
  Beef,
  Flame,
  Lightbulb,
  MessageCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { UserProfile } from "../types/nutrition";
import { calculatePlan, getFoodResponse, getTips } from "../utils/nutrition";

interface ResultsScreenProps {
  profile: UserProfile;
  onRestart: () => void;
}

const MEAL_PLANS = {
  veg: {
    breakfast: "🥣 Oats with milk, mixed nuts & banana",
    lunch: "🍛 Rice/roti + dal/paneer + mixed veggies",
    dinner: "🥘 Light dal soup + roti + salad",
    snack: "🍎 Fruit bowl / yogurt / roasted chana",
  },
  "non-veg": {
    breakfast: "🍳 Scrambled eggs (3) + whole wheat toast + milk",
    lunch: "🍗 Rice/roti + chicken curry + veggies",
    dinner: "🐟 Grilled fish/chicken + salad + light roti",
    snack: "🥚 Boiled eggs / Greek yogurt / nuts",
  },
  vegan: {
    breakfast: "🥤 Smoothie (banana, spinach, peanut butter, oat milk)",
    lunch: "🌾 Brown rice + lentils + roasted veggies",
    dinner: "🥗 Tofu stir-fry + quinoa + greens",
    snack: "🫒 Almonds / fruit / hummus + veggies",
  },
};

function getLifestyleNote(lifestyle: string): string {
  if (lifestyle === "busy") return " · quick prep: 10 min";
  if (lifestyle === "home-cooked") return " · freshly cooked";
  return "";
}

let chatCounter = 0;

interface ChatMsg {
  id: number;
  role: "user" | "bot";
  text: string;
}

const MEAL_ROWS = [
  { label: "Breakfast", time: "7–9 AM", key: "breakfast" },
  { label: "Lunch", time: "12–2 PM", key: "lunch" },
  { label: "Snack", time: "4–5 PM", key: "snack" },
  { label: "Dinner", time: "7–9 PM", key: "dinner" },
] as const;

export function ResultsScreen({ profile, onRestart }: ResultsScreenProps) {
  const plan = calculatePlan(profile);
  const tips = getTips(profile);
  const meals = MEAL_PLANS[profile.diet];
  const lifestyleNote = getLifestyleNote(profile.lifestyle);

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([
    {
      id: ++chatCounter,
      role: "bot",
      text: "Hi! Tell me what you ate and I'll estimate your calories 🍽",
    },
  ]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on chatHistory change
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  function handleSendFood() {
    const input = chatInput.trim();
    if (!input) return;
    const response = getFoodResponse(input, plan.calories);
    setChatHistory((prev) => [
      ...prev.slice(-10),
      { id: ++chatCounter, role: "user", text: input },
      { id: ++chatCounter, role: "bot", text: response },
    ]);
    setChatInput("");
  }

  const goalLabel =
    profile.goal === "lose_fat"
      ? "Fat Loss"
      : profile.goal === "gain_muscle"
        ? "Muscle Gain"
        : "Maintenance";

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-card shadow-xs border-b border-border">
        <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center gap-3">
          <img
            src="/assets/uploads/file_000000001d9872089e4984a0f8198a87-1.png"
            alt="Logo"
            className="w-9 h-9 object-contain"
          />
          <div>
            <p className="font-display font-bold text-sm text-foreground">
              Your Metaballic Plan
            </p>
            <p className="text-xs text-muted-foreground">
              {goalLabel} · {profile.diet} · {profile.activity} activity
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-[480px] mx-auto px-4 py-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display font-bold text-2xl text-foreground">
            Here's your personalized plan 👇
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Based on your profile and goals
          </p>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          data-ocid="results.card"
          className="bg-card rounded-2xl p-5 shadow-card"
        >
          <h2 className="font-display font-bold text-base text-foreground mb-4">
            Your Daily Targets
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-4 text-white"
              style={{
                background: "linear-gradient(135deg, #3db843, #1a6fc4)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-semibold opacity-90">
                  Daily Calories
                </span>
              </div>
              <p className="text-2xl font-bold">{plan.calories}</p>
              <p className="text-xs opacity-80">kcal / day</p>
            </div>
            <div className="rounded-xl p-4 bg-muted">
              <div className="flex items-center gap-2 mb-1">
                <Beef className="w-4 h-4 text-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">
                  Protein Target
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {plan.protein}g
              </p>
              <p className="text-xs text-muted-foreground">per day</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span>
              BMR: <strong className="text-foreground">{plan.bmr} kcal</strong>
            </span>
            <span>
              TDEE:{" "}
              <strong className="text-foreground">{plan.tdee} kcal</strong>
            </span>
          </div>
        </motion.div>

        {/* Meal Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          data-ocid="meals.card"
          className="bg-card rounded-2xl p-5 shadow-card"
        >
          <h2 className="font-display font-bold text-base text-foreground mb-4">
            Your Daily Meal Plan
          </h2>
          <div className="space-y-3">
            {MEAL_ROWS.map((item) => (
              <div
                key={item.label}
                className="flex gap-3"
                data-ocid={`meals.item.${item.label.toLowerCase()}`}
              >
                <div className="text-center min-w-[56px]">
                  <p className="font-semibold text-xs text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <div className="flex-1 bg-muted rounded-xl px-3 py-2">
                  <p className="text-sm text-foreground">
                    {meals[item.key]}
                    {lifestyleNote && (
                      <span className="text-xs text-muted-foreground">
                        {lifestyleNote}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {profile.avoidFoods && (
            <p className="mt-3 text-xs text-muted-foreground">
              ⚠️ Avoiding:{" "}
              <span className="font-semibold text-foreground">
                {profile.avoidFoods}
              </span>
            </p>
          )}
        </motion.div>

        {/* Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          data-ocid="tips.card"
          className="bg-card rounded-2xl p-5 shadow-card"
        >
          <h2 className="font-display font-bold text-base text-foreground mb-4">
            <Lightbulb
              className="inline w-4 h-4 mr-1"
              style={{ color: "#3db843" }}
            />
            Smart Suggestions for You
          </h2>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div
                key={`tip-${i + 1}`}
                className="flex gap-3"
                data-ocid={`tips.item.${i + 1}`}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                  }}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Food Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          data-ocid="foodchat.card"
          className="bg-card rounded-2xl p-5 shadow-card"
        >
          <h2 className="font-display font-bold text-base text-foreground mb-4">
            <MessageCircle
              className="inline w-4 h-4 mr-1"
              style={{ color: "#1a6fc4" }}
            />
            Ask Your AI Coach
          </h2>

          <div
            ref={chatScrollRef}
            className="space-y-2 max-h-64 overflow-y-auto mb-3 chat-scroll"
          >
            {chatHistory.slice(-6).map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "chat-bubble-user rounded-br-sm font-medium"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              data-ocid="foodchat.input"
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendFood()}
              placeholder="Tell me what you ate today..."
              className="flex-1 px-3 py-2 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              data-ocid="foodchat.submit_button"
              onClick={handleSendFood}
              className="btn-gradient p-2 rounded-full w-9 h-9 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
        <div className="max-w-[480px] mx-auto">
          <button
            type="button"
            data-ocid="results.secondary_button"
            onClick={onRestart}
            className="w-full py-3 rounded-full font-semibold text-sm border-2 border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
