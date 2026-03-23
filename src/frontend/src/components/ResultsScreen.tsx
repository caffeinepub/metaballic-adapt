import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Beef,
  Camera,
  CheckSquare,
  ChefHat,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Flame,
  Lightbulb,
  MessageCircle,
  PlusCircle,
  RefreshCw,
  Send,
  Square,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";
import type { UserProfile } from "../types/nutrition";
import {
  type DayPlan,
  calculatePlan,
  getFoodResponse,
  getNextActions,
  getPersonalTags,
  getRecipePlan,
  getSimpleSwaps,
  getTips,
} from "../utils/nutrition";
import { FoodScanner } from "./FoodScanner";
import { IngredientScanner } from "./IngredientScanner";

interface ResultsScreenProps {
  profile: UserProfile;
  onRestart: () => void;
}

const DIET_STYLES = [
  { key: "balanced", label: "Balanced" },
  { key: "indian", label: "🇮🇳 Indian" },
  { key: "mexican", label: "🌮 Mexican" },
  { key: "chinese", label: "🥢 Chinese" },
  { key: "mediterranean", label: "🫒 Mediterranean" },
  { key: "thai", label: "🌶️ Thai" },
  { key: "greek", label: "🏛️ Greek" },
  { key: "japanese", label: "🍱 Japanese" },
  { key: "italian", label: "🍝 Italian" },
  { key: "korean", label: "🥘 Korean" },
  { key: "middle-eastern", label: "🥙 Middle Eastern" },
  { key: "keto", label: "⚡ Keto" },
  { key: "high-protein", label: "💪 High Protein" },
];

const MEAL_ROWS: {
  key: keyof DayPlan;
  label: string;
  time: string;
  emoji: string;
}[] = [
  { key: "breakfast", label: "Breakfast", time: "7–9 AM", emoji: "🌅" },
  { key: "lunch", label: "Lunch", time: "12–2 PM", emoji: "☀️" },
  { key: "dinner", label: "Dinner", time: "7–9 PM", emoji: "🌙" },
  { key: "snack", label: "Snack", time: "4–5 PM", emoji: "🍎" },
];

const ACTION_ICONS = ["💧", "🥗", "🏃", "⏰"];

let chatCounter = 0;
interface ChatMsg {
  id: number;
  role: "user" | "bot";
  text: string;
}

interface LoggedMeal {
  id: number;
  name: string;
  cal: number;
  protein: number;
}

let mealLogCounterGlobal = 0;

function MealCard({
  meal,
  label,
  time,
  emoji,
  index,
  onLog,
}: {
  meal: {
    dish: string;
    calories: number;
    ingredients: string[];
    steps: string[];
    protein?: number;
  };
  label: string;
  time: string;
  emoji: string;
  index: number;
  onLog: (item: { name: string; cal: number; protein: number }) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function handleLog(e: React.MouseEvent) {
    e.stopPropagation();
    onLog({
      name: meal.dish,
      cal: meal.calories,
      protein: meal.protein ?? 0,
    });
    toast.success(`${meal.dish} logged! 🍽️`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-muted rounded-2xl overflow-hidden"
      data-ocid={`meals.item.${index + 1}`}
    >
      <div className="px-4 py-3 flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="text-center flex-shrink-0 mt-0.5">
            <span className="text-lg">{emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {label}
              </span>
              <span className="text-xs text-muted-foreground">· {time}</span>
            </div>
            <p className="font-semibold text-sm text-foreground mt-0.5 leading-snug">
              {meal.dish}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{
                  background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                }}
              >
                {meal.calories} kcal
              </span>
              {meal.protein && (
                <span className="text-xs text-muted-foreground">
                  {meal.protein}g protein
                </span>
              )}
              {/* Quick log button (always visible) */}
              <button
                type="button"
                onClick={handleLog}
                data-ocid={`meals.primary_button.${index + 1}`}
                className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white transition-transform active:scale-95 flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                }}
              >
                <PlusCircle className="w-3 h-3" />
                Log
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-1"
          data-ocid={`meals.toggle.${index + 1}`}
          aria-label="Toggle recipe"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border space-y-3 pt-3">
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">
                  🛒 Ingredients
                </p>
                <ul className="space-y-0.5">
                  {meal.ingredients.map((ing) => (
                    <li
                      key={ing}
                      className="text-xs text-muted-foreground flex items-start gap-1.5"
                    >
                      <span className="text-primary mt-0.5">·</span>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">
                  👨‍🍳 Steps
                </p>
                <ol className="space-y-1">
                  {meal.steps.map((step, sIdx) => (
                    <li
                      key={step.slice(0, 30)}
                      className="text-xs text-muted-foreground flex items-start gap-1.5"
                    >
                      <span
                        className="w-4 h-4 rounded-full text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold"
                        style={{
                          background:
                            "linear-gradient(135deg, #3db843, #1a6fc4)",
                        }}
                      >
                        {sIdx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              {/* Log from expanded view too */}
              <button
                type="button"
                onClick={handleLog}
                data-ocid={`meals.save_button.${index + 1}`}
                className="w-full py-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
                style={{
                  background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                }}
              >
                <PlusCircle className="w-4 h-4" />
                Log this meal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ResultsScreen({ profile, onRestart }: ResultsScreenProps) {
  const plan = calculatePlan(profile);
  const tips = getTips(profile);
  const tags = getPersonalTags(profile);
  const swaps = getSimpleSwaps(profile);
  const actions = getNextActions(profile);

  const [selectedStyle, setSelectedStyle] = useState("balanced");
  const [showImproveBanner, setShowImproveBanner] = useState(
    () => !localStorage.getItem("metaballic_tally_clicked"),
  );

  function showBannerIfNotClicked() {
    if (!localStorage.getItem("metaballic_tally_clicked")) {
      setShowImproveBanner(true);
    }
  }
  const [recipePlan, setRecipePlan] = useState(() =>
    getRecipePlan("balanced", profile.diet),
  );
  const [planVariant, setPlanVariant] = useState(0);
  const [checkedActions, setCheckedActions] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>(() => {
    const goalPerson =
      profile.goal === "lose_fat"
        ? "fat loss warrior"
        : profile.goal === "gain_muscle"
          ? "muscle builder"
          : "health enthusiast";
    return [
      {
        id: ++chatCounter,
        role: "bot",
        text: `Hi, ${goalPerson}! 👋 Tell me what you ate today and I'll estimate your calories and protein instantly.`,
      },
    ];
  });
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Section refs for scroll-to
  const coachRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  // Email input state for Save Plan
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on chatHistory change
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  function handleStyleChange(style: string) {
    setSelectedStyle(style);
    setRecipePlan(getRecipePlan(style, profile.diet));
    setPlanVariant(0);
    showBannerIfNotClicked();
  }

  // Meal Logger state
  const [logInput, setLogInput] = useState("");
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([]);
  const [showIngredientScanner, setShowIngredientScanner] = useState(false);

  function addLoggedMeal(item: { name: string; cal: number; protein: number }) {
    setLoggedMeals((prev) => [
      ...prev,
      {
        id: ++mealLogCounterGlobal,
        name: item.name,
        cal: item.cal,
        protein: item.protein,
      },
    ]);
  }

  function handleLogMeal() {
    const input = logInput.trim();
    if (!input) return;
    const response = getFoodResponse(
      input,
      plan.calories,
      plan.protein,
      profile.goal,
      profile.gymUser,
    );
    let cal = 300;
    let prot = 10;
    const calMatch = response.match(/roughly (\d+)\s*kcal/);
    const protMatch = response.match(/(\d+)g protein/);
    if (calMatch) cal = Number.parseInt(calMatch[1], 10);
    if (protMatch) prot = Number.parseInt(protMatch[1], 10);
    addLoggedMeal({ name: input, cal, protein: prot });
    setLogInput("");
  }

  function removeLoggedMeal(id: number) {
    setLoggedMeals((prev) => prev.filter((m) => m.id !== id));
  }

  const totalLoggedCal = loggedMeals.reduce((s, m) => s + m.cal, 0);
  const totalLoggedProtein = loggedMeals.reduce((s, m) => s + m.protein, 0);
  const remainingCal = plan.calories - totalLoggedCal;
  const remainingProtein = plan.protein - totalLoggedProtein;
  const progressPct = Math.min(
    100,
    Math.round((totalLoggedCal / plan.calories) * 100),
  );

  function getCalorieColor(remaining: number, target: number) {
    const pct = (target - remaining) / target;
    if (pct >= 1.0) return "text-red-500";
    if (pct >= 0.85) return "text-amber-500";
    return "text-green-600";
  }

  // Save Plan
  function handleCopyPlan() {
    const goalLabel =
      profile.goal === "lose_fat"
        ? "Fat Loss"
        : profile.goal === "gain_muscle"
          ? "Muscle Gain"
          : "Maintenance";
    const lines = [
      "=== My Metaballic Adapt Plan ===",
      `Goal: ${goalLabel} | Diet: ${profile.diet} | Activity: ${profile.activity}`,
      `Daily Calories: ${plan.calories} kcal`,
      `Daily Protein: ${plan.protein}g`,
      profile.gymUser ? `Carbs: ${plan.carbs}g | Fats: ${plan.fats}g` : "",
      "",
      `=== Meal Plan (${selectedStyle}) ===`,
      ...MEAL_ROWS.map((row) => {
        const meal = recipePlan[row.key];
        return `${row.label}: ${meal.dish} (~${meal.calories} kcal)`;
      }),
      "",
      "=== Smart Tips ===",
      ...tips.map((t, i) => `${i + 1}. ${t}`),
      "",
      "Generated with Metaballic Adapt — caffeine.ai",
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      toast.success("Plan copied! 📋");
    });
  }

  function handleSendEmail() {
    const email = emailInput.trim();
    if (!email) return;
    createActorWithConfig()
      .then((a) => (a as any).saveEmail(email))
      .catch(() => {});
    setEmailSent(true);
    setEmailInput("");
    toast.success("Saved! We'll send your plan shortly 📧");
  }

  // Feedback state
  const [feedbackGiven, setFeedbackGiven] = useState<"yes" | "no" | null>(null);
  const [feedbackChips, setFeedbackChips] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  function toggleFeedbackChip(chip: string) {
    setFeedbackChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    );
  }

  function handleSubmitFeedback() {
    createActorWithConfig()
      .then((a) =>
        (a as any).saveFeedback(
          feedbackGiven ?? "yes",
          feedbackChips,
          feedbackText,
        ),
      )
      .catch(() => {});
    setFeedbackSubmitted(true);
    toast.success("Thanks for your feedback! 🙏");
  }

  function handleRegenerateplan() {
    const variants = ["veg", "non-veg", "vegan"];
    const currentIdx = variants.indexOf(profile.diet);
    const nextVariant = (planVariant + 1) % 3;
    const nextPref =
      nextVariant === 0
        ? profile.diet
        : variants[(currentIdx + nextVariant) % 3];
    setRecipePlan(getRecipePlan(selectedStyle, nextPref));
    setPlanVariant(nextVariant);
    showBannerIfNotClicked();
  }

  function handleSendFood() {
    const input = chatInput.trim();
    if (!input) return;
    const response = getFoodResponse(
      input,
      plan.calories,
      plan.protein,
      profile.goal,
      profile.gymUser,
    );
    setChatHistory((prev) => [
      ...prev.slice(-10),
      { id: ++chatCounter, role: "user", text: input },
      { id: ++chatCounter, role: "bot", text: response },
    ]);
    setChatInput("");
  }

  function toggleAction(i: number) {
    setCheckedActions((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  const goalLabel =
    profile.goal === "lose_fat"
      ? "Fat Loss"
      : profile.goal === "gain_muscle"
        ? "Muscle Gain"
        : "Maintenance";

  const goalExplain =
    profile.goal === "lose_fat"
      ? "lose fat steadily"
      : profile.goal === "gain_muscle"
        ? "build lean muscle"
        : "maintain your current weight";

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.1, duration: 0.5 },
  });

  return (
    <div className="min-h-screen bg-background pb-28">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-card shadow-sm border-b border-border">
        <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-bold text-base text-foreground">
              Your Metaballic Plan
            </p>
            <p className="text-xs text-muted-foreground">
              {goalLabel} · {profile.diet} · {profile.activity} activity
              {profile.gymUser ? " · Gym Mode 💪" : ""}
            </p>
          </div>
          {/* Share button top-right */}
          <button
            type="button"
            onClick={handleCopyPlan}
            data-ocid="header.primary_button"
            className="p-2 rounded-full text-white flex-shrink-0 active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #3db843, #1a6fc4)" }}
            aria-label="Copy plan"
          >
            <ClipboardCopy className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-[480px] mx-auto px-4 py-5 space-y-5">
        {/* Personal Tags */}
        <motion.div {...stagger(0)}>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {tags.map((tag) => (
              <Badge
                key={tag}
                data-ocid="results.panel"
                className="whitespace-nowrap flex-shrink-0 text-white text-xs px-3 py-1.5"
                style={{
                  background:
                    "linear-gradient(135deg, #3db843 0%, #1a6fc4 100%)",
                  border: "none",
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Daily Targets */}
        <motion.div
          {...stagger(1)}
          data-ocid="results.card"
          className="bg-card rounded-2xl p-5 shadow-sm"
        >
          <h2 className="font-bold text-base text-foreground mb-1">
            Your Daily Targets
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            To help you <strong>{goalExplain}</strong>, we've set your calories
            to <strong>{plan.calories} kcal/day</strong>.
          </p>
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
            {profile.gymUser && (
              <>
                <div className="rounded-xl p-4 bg-muted">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">🌾</span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Carbs
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {plan.carbs}g
                  </p>
                  <p className="text-xs text-muted-foreground">per day</p>
                </div>
                <div className="rounded-xl p-4 bg-muted">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">🥑</span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Fats
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {plan.fats}g
                  </p>
                  <p className="text-xs text-muted-foreground">per day</p>
                </div>
              </>
            )}
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

        {/* Workout Nutrition Plan — Gym users only */}
        {profile.gymUser && (
          <motion.div
            {...stagger(2)}
            data-ocid="workout.card"
            className="bg-card rounded-2xl p-5 shadow-sm"
          >
            <h2 className="font-bold text-base text-foreground mb-4">
              🏋️ Workout Nutrition Plan
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Pre-Workout
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1.5 rounded-full bg-muted text-sm">
                    🍌 Banana + Coffee
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-muted text-sm">
                    🥣 Oats with Honey
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Post-Workout
                </p>
                <div className="flex gap-2 flex-wrap">
                  {profile.diet !== "veg" && profile.diet !== "vegan" && (
                    <span className="px-3 py-1.5 rounded-full bg-muted text-sm">
                      🍗 Chicken + Rice
                    </span>
                  )}
                  <span className="px-3 py-1.5 rounded-full bg-muted text-sm">
                    🥚 Eggs + Toast
                  </span>
                  {(profile.diet === "veg" || profile.diet === "vegan") && (
                    <span className="px-3 py-1.5 rounded-full bg-muted text-sm">
                      🫘 Tofu + Rice
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Diet Style Selector */}
        <motion.div {...stagger(3)} data-ocid="diet.panel">
          <h2 className="font-bold text-base text-foreground mb-3">
            Choose Your Diet Style
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {DIET_STYLES.map((s) => (
              <button
                key={s.key}
                type="button"
                data-ocid="diet.tab"
                onClick={() => handleStyleChange(s.key)}
                className={`whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  selectedStyle === s.key
                    ? "text-white border-transparent"
                    : "text-muted-foreground bg-card border-border hover:border-primary"
                }`}
                style={
                  selectedStyle === s.key
                    ? {
                        background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                        border: "none",
                      }
                    : {}
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Help Us Improve Banner */}
        <AnimatePresence>
          {showImproveBanner && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              data-ocid="improve.card"
              className="relative rounded-2xl p-4 shadow-sm overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(61,184,67,0.12) 0%, rgba(26,111,196,0.12) 100%)",
                border: "1.5px solid rgba(61,184,67,0.35)",
              }}
            >
              <button
                type="button"
                aria-label="Dismiss banner"
                data-ocid="improve.close_button"
                onClick={() => setShowImproveBanner(false)}
                className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <p className="text-sm font-semibold text-foreground pr-6 mb-2">
                🙌 Enjoying the app? Help us improve it!
              </p>
              <a
                href="https://tally.so/r/kdZp6Z"
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="improve.primary_button"
                onClick={() => {
                  localStorage.setItem("metaballic_tally_clicked", "1");
                  setShowImproveBanner(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white transition-transform active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                }}
              >
                Help us improve →
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recipe Meal Plan */}
        <motion.div {...stagger(4)} data-ocid="meals.card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-foreground">
              Your Recipe Plan
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateplan}
              data-ocid="meals.primary_button"
              className="text-xs gap-1.5 rounded-full"
            >
              <RefreshCw className="w-3 h-3" />
              Generate Another
            </Button>
          </div>
          <div className="space-y-3">
            {MEAL_ROWS.map((row, i) => (
              <MealCard
                key={`${selectedStyle}-${planVariant}-${row.key}`}
                meal={recipePlan[row.key]}
                label={row.label}
                time={row.time}
                emoji={row.emoji}
                index={i}
                onLog={addLoggedMeal}
              />
            ))}
          </div>
        </motion.div>

        {/* Smart Suggestions */}
        <motion.div
          {...stagger(5)}
          data-ocid="tips.card"
          className="bg-card rounded-2xl p-5 shadow-sm"
        >
          <h2 className="font-bold text-base text-foreground mb-4">
            <Lightbulb
              className="inline w-4 h-4 mr-1"
              style={{ color: "#3db843" }}
            />
            Smart Suggestions for You
          </h2>
          <div className="space-y-3">
            {tips.map((tip, tipIdx) => (
              <div
                key={`tip-${tipIdx + 1}`}
                className="flex gap-3"
                data-ocid={`tips.item.${tipIdx + 1}`}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                  }}
                >
                  {tipIdx + 1}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Simple Swaps */}
        <motion.div
          {...stagger(6)}
          data-ocid="swaps.card"
          className="bg-card rounded-2xl p-5 shadow-sm"
        >
          <h2 className="font-bold text-base text-foreground mb-4">
            <Zap className="inline w-4 h-4 mr-1" style={{ color: "#1a6fc4" }} />
            Better Choices
          </h2>
          <div className="space-y-3">
            {swaps.map((swap, swapIdx) => (
              <div
                key={swap.from}
                className="space-y-1"
                data-ocid={`swaps.item.${swapIdx + 1}`}
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-red-500 font-medium">
                    ❌ {swap.from}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-green-600 font-medium">
                    ✅ {swap.to}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-1">
                  {swap.reason}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* What To Do Today */}
        <motion.div
          {...stagger(7)}
          data-ocid="actions.card"
          className="bg-card rounded-2xl p-5 shadow-sm"
        >
          <h2 className="font-bold text-base text-foreground mb-4">
            What to do today
          </h2>
          <div className="space-y-3">
            {actions.map((action, i) => (
              <button
                type="button"
                key={action.slice(0, 20)}
                onClick={() => toggleAction(i)}
                className="flex items-start gap-3 w-full text-left group"
                data-ocid={`actions.item.${i + 1}`}
              >
                <span className="flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
                  {checkedActions[i] ? (
                    <CheckSquare
                      className="w-5 h-5"
                      style={{ color: "#3db843" }}
                    />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </span>
                <span
                  className={`text-sm leading-relaxed transition-colors ${
                    checkedActions[i]
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {ACTION_ICONS[i] ?? "⭐"} {action}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* AI Food Coach */}
        <motion.div
          {...stagger(8)}
          data-ocid="foodchat.card"
          className="bg-card rounded-2xl p-5 shadow-sm"
          ref={coachRef}
        >
          <h2 className="font-bold text-base text-foreground mb-4">
            <MessageCircle
              className="inline w-4 h-4 mr-1"
              style={{ color: "#1a6fc4" }}
            />
            Ask Your Food Coach
          </h2>
          <div
            ref={chatScrollRef}
            className="space-y-2 max-h-64 overflow-y-auto mb-3"
            style={{ scrollBehavior: "smooth" }}
          >
            {chatHistory.slice(-8).map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "text-white rounded-br-sm font-medium"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                  style={
                    msg.role === "user"
                      ? {
                          background:
                            "linear-gradient(135deg, #3db843 0%, #1a6fc4 100%)",
                        }
                      : {}
                  }
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
              className="p-2 rounded-full w-9 h-9 flex items-center justify-center active:scale-95 transition-transform text-white"
              style={{
                background: "linear-gradient(135deg, #3db843, #1a6fc4)",
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Food Scanner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          data-ocid="foodscanner.card"
          ref={scannerRef}
        >
          <FoodScanner
            userCalories={plan.calories}
            userProtein={plan.protein}
          />
        </motion.div>

        {/* Meal Logger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          data-ocid="meallog.card"
          className="bg-card rounded-2xl p-5 shadow-sm"
        >
          <h2 className="font-bold text-base text-foreground mb-1 flex items-center gap-2">
            <span style={{ fontSize: "1.1em" }}>📝</span>
            Today's Food Log
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Log what you've eaten to track calories and protein against your
            daily target.
          </p>
          <div className="flex gap-2 mb-4">
            <input
              data-ocid="meallog.input"
              type="text"
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogMeal()}
              placeholder="e.g. rice, chicken breast, banana..."
              className="flex-1 px-3 py-2 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              data-ocid="meallog.primary_button"
              onClick={handleLogMeal}
              disabled={!logInput.trim()}
              className="px-4 py-2 rounded-full font-semibold text-sm text-white disabled:opacity-50 transition-transform active:scale-95 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #3db843, #1a6fc4)",
              }}
            >
              Log Meal
            </button>
          </div>

          {loggedMeals.length === 0 ? (
            <p
              className="text-xs text-muted-foreground text-center py-4"
              data-ocid="meallog.empty_state"
            >
              No meals logged yet. Start typing a food above!
            </p>
          ) : (
            <>
              <div className="space-y-2 mb-4" data-ocid="meallog.list">
                {loggedMeals.map((meal, i) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between bg-muted rounded-xl px-3 py-2"
                    data-ocid={`meallog.item.${i + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground capitalize truncate">
                        {meal.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {meal.cal} kcal · {meal.protein}g protein
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLoggedMeal(meal.id)}
                      data-ocid={`meallog.delete_button.${i + 1}`}
                      className="ml-2 p-1.5 rounded-full text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      aria-label="Remove meal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div
                className="rounded-xl p-3"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(61,184,67,0.08), rgba(26,111,196,0.08))",
                }}
              >
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Eaten
                    </p>
                    <p
                      className={`font-bold text-sm ${getCalorieColor(remainingCal, plan.calories)}`}
                    >
                      {totalLoggedCal} kcal
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {totalLoggedProtein}g protein
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Remaining
                    </p>
                    <p
                      className={`font-bold text-sm ${remainingCal < 0 ? "text-red-500" : "text-green-600"}`}
                    >
                      {remainingCal < 0
                        ? `+${Math.abs(remainingCal)} over`
                        : `${remainingCal} kcal`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {remainingProtein < 0
                        ? `${Math.abs(remainingProtein)}g over`
                        : `${remainingProtein}g protein left`}
                    </p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((totalLoggedCal / plan.calories) * 100))}%`,
                      background:
                        totalLoggedCal > plan.calories
                          ? "#ef4444"
                          : totalLoggedCal > plan.calories * 0.85
                            ? "#f59e0b"
                            : "linear-gradient(90deg, #3db843, #1a6fc4)",
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {Math.min(
                    100,
                    Math.round((totalLoggedCal / plan.calories) * 100),
                  )}
                  % of daily target
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* Save Your Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          data-ocid="saveplan.card"
          className="bg-card rounded-2xl p-5 shadow-sm"
        >
          <h2 className="font-bold text-base text-foreground mb-1 flex items-center gap-2">
            <ClipboardCopy className="w-4 h-4" style={{ color: "#1a6fc4" }} />
            Save Your Plan
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Copy your personalized plan to share or save anywhere.
          </p>
          <button
            type="button"
            data-ocid="saveplan.primary_button"
            onClick={handleCopyPlan}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 active:scale-95 transition-transform mb-4"
            style={{ background: "linear-gradient(135deg, #3db843, #1a6fc4)" }}
          >
            <ClipboardCopy className="w-4 h-4" />
            Copy Plan
          </button>

          {/* Email section */}
          {emailSent ? (
            <p
              className="text-center text-sm text-green-600 font-semibold py-1"
              data-ocid="saveplan.success_state"
            >
              ✅ Plan sent to your email!
            </p>
          ) : (
            <div className="space-y-2" data-ocid="saveplan.panel">
              <p className="text-xs text-muted-foreground">
                Email me my plan (optional)
              </p>
              <div className="flex gap-2">
                <Input
                  data-ocid="saveplan.input"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                  placeholder="your@email.com"
                  className="flex-1 rounded-full text-sm"
                />
                <button
                  type="button"
                  data-ocid="saveplan.submit_button"
                  onClick={handleSendEmail}
                  disabled={!emailInput.trim()}
                  className="px-4 py-2 rounded-full font-semibold text-sm text-white disabled:opacity-50 active:scale-95 transition-transform flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          data-ocid="feedback.card"
          className="bg-card rounded-2xl p-5 shadow-sm"
        >
          <h2 className="font-bold text-base text-foreground mb-4 text-center">
            Was this helpful?
          </h2>
          {feedbackSubmitted ? (
            <p
              className="text-center text-sm text-green-600 font-semibold py-2"
              data-ocid="feedback.success_state"
            >
              Thanks for helping us improve! 🙏
            </p>
          ) : feedbackGiven === null ? (
            <div
              className="flex gap-3 justify-center"
              data-ocid="feedback.panel"
            >
              <button
                type="button"
                data-ocid="feedback.primary_button"
                onClick={() => setFeedbackGiven("yes")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 border-border bg-background hover:border-green-500 hover:text-green-600 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                Yes
              </button>
              <button
                type="button"
                data-ocid="feedback.secondary_button"
                onClick={() => setFeedbackGiven("no")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 border-border bg-background hover:border-red-400 hover:text-red-500 transition-colors"
              >
                <ThumbsDown className="w-4 h-4" />
                No
              </button>
            </div>
          ) : feedbackGiven === "yes" ? (
            <p
              className="text-center text-sm text-green-600 font-semibold py-2"
              data-ocid="feedback.success_state"
            >
              Glad it helped! 🎉
            </p>
          ) : (
            <div className="space-y-4" data-ocid="feedback.panel">
              <p className="text-xs text-muted-foreground text-center">
                What went wrong?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Too generic", "Not relevant", "Confusing"].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    data-ocid="feedback.toggle"
                    onClick={() => toggleFeedbackChip(chip)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${
                      feedbackChips.includes(chip)
                        ? "border-primary text-primary bg-primary/5"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <Textarea
                data-ocid="feedback.textarea"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What did you expect instead?"
                className="text-sm rounded-xl resize-none"
                rows={3}
              />
              <button
                type="button"
                data-ocid="feedback.submit_button"
                onClick={handleSubmitFeedback}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white active:scale-95 transition-transform"
                style={{
                  background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                }}
              >
                Submit Feedback
              </button>
            </div>
          )}
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

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="max-w-[480px] mx-auto px-4 pt-2 pb-4">
          {/* Mini progress bar — only when meals logged */}
          {loggedMeals.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">
                  {totalLoggedCal} / {plan.calories} kcal
                </span>
                <span className="text-xs text-muted-foreground">
                  {totalLoggedProtein}g protein
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPct}%`,
                    background:
                      totalLoggedCal > plan.calories
                        ? "#ef4444"
                        : totalLoggedCal > plan.calories * 0.85
                          ? "#f59e0b"
                          : "linear-gradient(90deg, #3db843, #1a6fc4)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Icon buttons row */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              data-ocid="bottombar.primary_button"
              onClick={handleCopyPlan}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Share plan"
            >
              <ClipboardCopy className="w-5 h-5" />
              <span className="text-[10px] font-medium">Share</span>
            </button>

            <button
              type="button"
              data-ocid="bottombar.secondary_button"
              onClick={() =>
                coachRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go to food coach"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[10px] font-medium">Coach</span>
            </button>

            <button
              type="button"
              data-ocid="bottombar.toggle"
              onClick={() =>
                scannerRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go to food scanner"
            >
              <Camera className="w-5 h-5" />
              <span className="text-[10px] font-medium">Scanner</span>
            </button>

            <button
              type="button"
              data-ocid="bottombar.recipes_button"
              onClick={() => setShowIngredientScanner(true)}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Recipe Generator"
            >
              <ChefHat className="w-5 h-5" />
              <span className="text-[10px] font-medium">Recipes</span>
            </button>

            <button
              type="button"
              data-ocid="results.secondary_button"
              onClick={onRestart}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Start over"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="text-[10px] font-medium">Restart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ingredient Scanner Overlay */}
      <AnimatePresence>
        {showIngredientScanner && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50"
            data-ocid="ingredient_scanner.modal"
          >
            <IngredientScanner
              profile={profile}
              onClose={() => setShowIngredientScanner(false)}
              onLog={addLoggedMeal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
