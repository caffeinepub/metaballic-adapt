import { Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { UserProfile } from "../types/nutrition";

interface Step {
  id: keyof UserProfile | "intro";
  botMessage: string;
  type: "buttons" | "number" | "text";
  options?: { label: string; value: string }[];
  validate?: (val: string) => string | null;
  placeholder?: string;
}

const STEPS: Step[] = [
  {
    id: "intro",
    botMessage:
      "Hey 👋 I'm Nova, your Metaballic AI coach. I'll build your personalized diet plan in 30 seconds.",
    type: "buttons",
    options: [{ label: "Let's go! 🚀", value: "start" }],
  },
  {
    id: "goal",
    botMessage: "What's your main goal?",
    type: "buttons",
    options: [
      { label: "🔥 Lose Fat", value: "lose_fat" },
      { label: "⚖️ Maintain", value: "maintain" },
      { label: "💪 Gain Muscle", value: "gain_muscle" },
    ],
  },
  {
    id: "sex",
    botMessage: "What's your biological sex?",
    type: "buttons",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
    ],
  },
  {
    id: "weight",
    botMessage: "What's your weight? (kg)",
    type: "number",
    placeholder: "e.g. 70",
    validate: (v) => {
      const n = Number(v);
      if (Number.isNaN(n) || n < 30 || n > 200)
        return "Please enter a weight between 30 and 200 kg";
      return null;
    },
  },
  {
    id: "height",
    botMessage: "How tall are you? (cm)",
    type: "number",
    placeholder: "e.g. 170",
    validate: (v) => {
      const n = Number(v);
      if (Number.isNaN(n) || n < 100 || n > 250)
        return "Please enter a height between 100 and 250 cm";
      return null;
    },
  },
  {
    id: "age",
    botMessage: "How old are you?",
    type: "number",
    placeholder: "e.g. 28",
    validate: (v) => {
      const n = Number(v);
      if (Number.isNaN(n) || n < 10 || n > 100)
        return "Please enter an age between 10 and 100";
      return null;
    },
  },
  {
    id: "activity",
    botMessage: "How active are you?",
    type: "buttons",
    options: [
      { label: "🐢 Low", value: "low" },
      { label: "🏃 Moderate", value: "moderate" },
      { label: "⚡ High", value: "high" },
    ],
  },
  {
    id: "diet",
    botMessage: "What's your diet preference?",
    type: "buttons",
    options: [
      { label: "🥦 Veg", value: "veg" },
      { label: "🍗 Non-veg", value: "non-veg" },
      { label: "🌱 Vegan", value: "vegan" },
    ],
  },
  {
    id: "gymUser",
    botMessage: "Do you go to the gym regularly?",
    type: "buttons",
    options: [
      { label: "Yes 💪", value: "true" },
      { label: "No 🥗", value: "false" },
    ],
  },
  {
    id: "lifestyle",
    botMessage: "What's your lifestyle like?",
    type: "buttons",
    options: [
      { label: "⚡ Busy", value: "busy" },
      { label: "🌊 Flexible", value: "flexible" },
      { label: "🍳 Home-cooked", value: "home-cooked" },
    ],
  },
  {
    id: "avoidFoods",
    botMessage: "Any foods you want to avoid?",
    type: "text",
    placeholder: "e.g. dairy, gluten... or just skip!",
  },
  {
    id: "eatingPattern",
    botMessage: "How do you usually eat?",
    type: "buttons",
    options: [
      { label: "🍽 Big meals", value: "big_meals" },
      { label: "🥨 Snacks", value: "snacks" },
      { label: "⏰ Irregular", value: "irregular" },
    ],
  },
  {
    id: "struggle",
    botMessage: "What's your biggest struggle?",
    type: "buttons",
    options: [
      { label: "😩 Overeating", value: "overeating" },
      { label: "⏱ Time", value: "time" },
      { label: "🍫 Cravings", value: "cravings" },
      { label: "🤔 Confusion", value: "confusion" },
    ],
  },
  {
    id: "goalSpeed",
    botMessage: "How fast do you want results?",
    type: "buttons",
    options: [
      { label: "🐌 Slow & steady", value: "slow" },
      { label: "⚖️ Balanced", value: "balanced" },
      { label: "🚀 Fast track", value: "fast" },
    ],
  },
];

let msgCounter = 0;

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
}

interface ChatOnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

function BotAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-9 h-9 text-sm" : "w-7 h-7 text-xs";
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ background: "linear-gradient(135deg, #3db843, #1a6fc4)" }}
    >
      N
    </div>
  );
}

export { BotAvatar };

export function ChatOnboarding({ onComplete }: ChatOnboardingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [error, setError] = useState("");
  const [isBuilding, setIsBuilding] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ id: ++msgCounter, role: "bot", text: STEPS[0].botMessage }]);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isBuilding]);

  const userStepsDone = stepIdx > 0 ? stepIdx - 1 : 0;

  function addMessage(msg: Omit<Message, "id">) {
    setMessages((prev) => [...prev, { ...msg, id: ++msgCounter }]);
  }

  function coerceValue(step: Step, value: string): any {
    if (step.type === "number") return Number(value);
    if (step.id === "gymUser") return value === "true";
    return value;
  }

  function handleAnswer(value: string, label?: string) {
    const step = STEPS[stepIdx];
    const displayText = label || value;

    addMessage({ role: "user", text: displayText });

    if (step.id !== "intro") {
      const key = step.id as keyof UserProfile;
      const typedVal = coerceValue(step, value);
      setProfile((prev) => ({ ...prev, [key]: typedVal }));
    }

    const nextIdx = stepIdx + 1;

    if (nextIdx >= STEPS.length) {
      setIsBuilding(true);
      setTimeout(() => {
        const finalProfile = {
          ...profile,
          [step.id]: coerceValue(step, value),
        } as UserProfile;
        onComplete(finalProfile);
      }, 1800);
      return;
    }

    setTimeout(() => {
      addMessage({ role: "bot", text: STEPS[nextIdx].botMessage });
      setStepIdx(nextIdx);
      setInputVal("");
      setError("");
    }, 400);
  }

  function handleSubmitInput() {
    const step = STEPS[stepIdx];
    const val = inputVal.trim();

    if (step.type === "text" && val === "") {
      handleAnswer("", "Skip");
      return;
    }

    if (step.validate) {
      const err = step.validate(val);
      if (err) {
        setError(err);
        return;
      }
    }

    handleAnswer(val);
  }

  const step = STEPS[stepIdx];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-xs">
        <BotAvatar size="lg" />
        <div className="flex-1">
          <p className="font-display font-bold text-sm text-foreground">Nova</p>
          <p className="text-xs text-muted-foreground">Building your plan...</p>
        </div>
        <div className="flex items-center gap-1">
          {stepIdx > 0 &&
            STEPS.slice(1).map((s, i) => (
              <div
                key={s.id}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i < userStepsDone ? "16px" : "8px",
                  background:
                    i < userStepsDone
                      ? "linear-gradient(90deg, #3db843, #1a6fc4)"
                      : "oklch(var(--border))",
                }}
              />
            ))}
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 chat-scroll"
        style={{ paddingBottom: "120px" }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <div className="mr-2 mt-1">
                  <BotAvatar size="sm" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "chat-bubble-user rounded-br-sm font-medium"
                    : "bg-card text-foreground shadow-xs rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {isBuilding && (
            <motion.div
              key="building"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="mr-2 mt-1">
                <BotAvatar size="sm" />
              </div>
              <div className="bg-card shadow-xs rounded-2xl rounded-bl-sm px-4 py-3">
                <p className="text-sm text-foreground mb-2">
                  Building your personalized plan... 🧠
                </p>
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 rounded-full animate-typing-1"
                    style={{ background: "#3db843" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-typing-2"
                    style={{ background: "#1a6fc4" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-typing-3"
                    style={{ background: "#1a2a4a" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isBuilding && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3">
          <div className="max-w-[480px] mx-auto">
            {error && (
              <p
                className="text-xs text-destructive mb-2"
                data-ocid="chat.error_state"
              >
                {error}
              </p>
            )}

            {step.type === "buttons" && (
              <div className="flex flex-wrap gap-2 justify-center">
                {step.options?.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    data-ocid="chat.button"
                    onClick={() => handleAnswer(opt.value, opt.label)}
                    className="px-4 py-2.5 rounded-full text-sm font-semibold border-2 border-border bg-card hover:border-brand-green hover:text-brand-green transition-colors active:scale-95 transition-transform"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {(step.type === "number" || step.type === "text") && (
              <div className="flex gap-2">
                <input
                  data-ocid="chat.input"
                  type={step.type === "number" ? "number" : "text"}
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitInput()}
                  placeholder={step.placeholder}
                  className="flex-1 px-4 py-2.5 rounded-full border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {step.type === "text" && (
                  <button
                    type="button"
                    data-ocid="chat.cancel_button"
                    onClick={() => handleAnswer("", "Skip")}
                    className="px-4 py-2.5 rounded-full text-sm font-semibold border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip
                  </button>
                )}
                <button
                  type="button"
                  data-ocid="chat.submit_button"
                  onClick={handleSubmitInput}
                  className="btn-gradient p-2.5 rounded-full w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
