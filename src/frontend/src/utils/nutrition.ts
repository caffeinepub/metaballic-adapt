import type { NutritionPlan, UserProfile } from "../types/nutrition";

export function calculatePlan(profile: UserProfile): NutritionPlan {
  // Mifflin-St Jeor BMR
  const bmr =
    profile.sex === "male"
      ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
      : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;

  // TDEE
  const activityMultiplier =
    profile.activity === "low"
      ? 1.2
      : profile.activity === "moderate"
        ? 1.55
        : 1.75;
  const tdee = bmr * activityMultiplier;

  // Goal adjustment
  let goalAdjust = 0;
  if (profile.goal === "lose_fat") {
    goalAdjust =
      profile.goalSpeed === "fast"
        ? -500
        : profile.goalSpeed === "slow"
          ? -300
          : -400;
  } else if (profile.goal === "gain_muscle") {
    goalAdjust =
      profile.goalSpeed === "fast"
        ? 400
        : profile.goalSpeed === "slow"
          ? 200
          : 300;
  }

  // Calorie strictness
  let strictness = 0;
  if (profile.struggle === "overeating") strictness = -50;

  const calories = Math.round(tdee + goalAdjust + strictness);
  const protein = Math.round(1.6 * profile.weight);

  return { calories, protein, bmr: Math.round(bmr), tdee: Math.round(tdee) };
}

export function getTips(profile: UserProfile): string[] {
  const tips: string[] = [];

  if (profile.goal === "lose_fat")
    tips.push(
      "Avoid sugary drinks — they add 150–300 empty calories with zero satiety.",
    );
  if (profile.goal === "gain_muscle")
    tips.push(
      "Eat your protein within 30 min after any workout for maximum muscle synthesis.",
    );
  if (profile.activity === "low")
    tips.push(
      "Even a 20-min walk after meals boosts your metabolism and improves digestion.",
    );
  if (profile.activity === "high")
    tips.push(
      "Stay hydrated — aim for 3L of water daily to support performance and recovery.",
    );
  if (profile.lifestyle === "busy")
    tips.push(
      "Prep your snacks the night before to avoid grabbing unhealthy options on the go.",
    );
  if (profile.struggle === "overeating")
    tips.push(
      "Use a smaller plate — it naturally reduces portion size without feeling deprived.",
    );
  if (profile.struggle === "cravings")
    tips.push(
      "When cravings hit, drink 1 glass of water first and wait 10 min — most pass naturally.",
    );
  if (profile.struggle === "time")
    tips.push(
      "Batch cook on weekends — it saves you 45 min daily and keeps your diet on track.",
    );
  if (profile.eatingPattern === "irregular")
    tips.push(
      "Try eating every 3–4 hours to stabilize blood sugar and reduce energy crashes.",
    );
  if (profile.diet === "vegan")
    tips.push(
      "Track B12 closely — consider a supplement for optimal energy and neurological health.",
    );
  if (profile.goalSpeed === "fast")
    tips.push(
      "Be consistent for 3 weeks — results compound after that and momentum builds fast.",
    );
  if (profile.goal === "maintain")
    tips.push(
      "Focus on food quality over quantity — nutrient-dense meals keep you satisfied longer.",
    );

  return tips.slice(0, 3);
}

const FOOD_DB: Record<string, { cal: string; followUp?: string }> = {
  rice: { cal: "200–240 kcal", followUp: "Did you add ghee or oil?" },
  roti: { cal: "100–120 kcal each", followUp: "How many did you have?" },
  chapati: { cal: "100–120 kcal each", followUp: "How many did you have?" },
  chicken: { cal: "165 kcal per 100g", followUp: "Was it grilled or fried?" },
  egg: { cal: "70–80 kcal each", followUp: "How were they cooked?" },
  eggs: { cal: "70–80 kcal each", followUp: "How were they cooked?" },
  dal: {
    cal: "150–180 kcal per bowl",
    followUp: "Did you add tadka/tempering?",
  },
  oats: { cal: "150 kcal per bowl", followUp: "With milk or water?" },
  banana: { cal: "90–110 kcal each" },
  milk: { cal: "120 kcal per glass" },
  bread: { cal: "80–100 kcal per slice" },
  toast: { cal: "80–100 kcal per slice" },
  salad: { cal: "50–80 kcal", followUp: "Any dressing on that?" },
  paneer: { cal: "270 kcal per 100g", followUp: "How much did you have?" },
  fish: { cal: "150 kcal per 100g", followUp: "Grilled or fried?" },
  nuts: { cal: "160 kcal per handful" },
  almonds: { cal: "160 kcal per handful" },
  yogurt: { cal: "60–80 kcal per bowl" },
  curd: { cal: "60–80 kcal per bowl" },
  coffee: { cal: "50–80 kcal" },
  tea: { cal: "40–60 kcal" },
  smoothie: { cal: "200–300 kcal", followUp: "What ingredients did you use?" },
  pizza: {
    cal: "250–300 kcal per slice",
    followUp: "That's on the heavier side. Want a lighter dinner tonight?",
  },
  burger: {
    cal: "400–500 kcal",
    followUp: "Big one! Balance it with a light dinner tonight.",
  },
  biryani: { cal: "350–450 kcal per plate" },
  idli: { cal: "130–150 kcal for 2 pieces" },
  dosa: { cal: "150–200 kcal" },
  fruit: { cal: "100–150 kcal" },
};

export function getFoodResponse(input: string, dailyCalories: number): string {
  const lower = input.toLowerCase();
  const matched: string[] = [];
  let totalCal = "";
  let followUp = "";

  for (const [food, data] of Object.entries(FOOD_DB)) {
    if (lower.includes(food)) {
      matched.push(food);
      totalCal = data.cal;
      if (data.followUp) followUp = data.followUp;
    }
  }

  if (matched.length === 0) {
    return "I'm not sure about that one, but log what you can and I'll help estimate your daily total!";
  }

  const foods = matched.join(" & ");
  let response = `That's roughly ${totalCal} for the ${foods}.`;

  // Check if big portion (rough check using min value)
  const calMatch = totalCal.match(/(\d+)/);
  if (calMatch) {
    const minCal = Number.parseInt(calMatch[1]);
    if (minCal > dailyCalories * 0.4) {
      response += ` That's a big portion of your daily goal of ${dailyCalories} kcal.`;
    }
  }

  if (followUp) response += ` ${followUp}`;

  return response;
}
