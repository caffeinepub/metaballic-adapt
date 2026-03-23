import type { NutritionPlan, UserProfile } from "../types/nutrition";

export function calculatePlan(profile: UserProfile): NutritionPlan {
  const bmr =
    profile.sex === "male"
      ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
      : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;

  const activityMultiplier =
    profile.activity === "low"
      ? 1.2
      : profile.activity === "moderate"
        ? 1.55
        : 1.75;
  const tdee = bmr * activityMultiplier;

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

  let strictness = 0;
  if (profile.struggle === "overeating") strictness = -50;

  const calories = Math.round(tdee + goalAdjust + strictness);
  const protein = profile.gymUser
    ? Math.round(profile.weight * 1.8)
    : Math.round(profile.weight * 1.0);
  const carbs = Math.round((calories * 0.45) / 4);
  const fats = Math.round((calories * 0.25) / 9);

  return {
    calories,
    protein,
    carbs,
    fats,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}

export function getTips(profile: UserProfile): string[] {
  const tips: string[] = [];

  if (profile.gymUser) {
    tips.push("Increase protein intake to support muscle growth");
    tips.push("Eat carbs after your workout for recovery");
    tips.push("Stay hydrated — drink at least 3L water daily during training");
  } else {
    tips.push("Cut out sugary drinks to save 200–300 kcal daily");
    tips.push("Control portion sizes — use a smaller plate");
    tips.push(
      "Focus on whole foods: vegetables, lean proteins, and whole grains",
    );
  }

  // Personalized extras
  if (profile.lifestyle === "busy")
    tips.push(
      "Prep your snacks the night before to avoid grabbing unhealthy options on the go.",
    );
  if (profile.struggle === "cravings")
    tips.push(
      "When cravings hit, drink 1 glass of water first and wait 10 min — most pass naturally.",
    );
  if (profile.struggle === "time")
    tips.push(
      "Batch cook on weekends — it saves you 45 min daily and keeps your diet on track.",
    );

  return tips.slice(0, 3);
}

type FoodEntry = {
  cal: number;
  protein: number;
  unit: string;
  followUp?: string;
};

const FOOD_DB: Record<string, FoodEntry> = {
  // Grains
  rice: {
    cal: 200,
    protein: 4,
    unit: "1 cup",
    followUp: "Did you add ghee or oil?",
  },
  "cooked rice": { cal: 200, protein: 4, unit: "1 cup" },
  "brown rice": {
    cal: 215,
    protein: 5,
    unit: "1 cup",
    followUp: "Good choice — high fiber!",
  },
  "white rice": { cal: 200, protein: 4, unit: "1 cup" },
  roti: {
    cal: 120,
    protein: 3,
    unit: "each",
    followUp: "How many did you have?",
  },
  chapati: { cal: 120, protein: 3, unit: "each", followUp: "How many rotis?" },
  naan: {
    cal: 280,
    protein: 8,
    unit: "each",
    followUp: "Plain or butter naan?",
  },
  paratha: {
    cal: 260,
    protein: 5,
    unit: "each",
    followUp: "Stuffed or plain?",
  },
  puri: { cal: 150, protein: 2, unit: "each" },
  pasta: { cal: 220, protein: 8, unit: "1 cup", followUp: "With what sauce?" },
  quinoa: {
    cal: 220,
    protein: 8,
    unit: "1 cup",
    followUp: "Excellent protein source!",
  },
  oats: {
    cal: 150,
    protein: 5,
    unit: "1 bowl",
    followUp: "With milk or water?",
  },
  oatmeal: { cal: 150, protein: 5, unit: "1 bowl" },
  bread: { cal: 80, protein: 3, unit: "1 slice", followUp: "How many slices?" },
  toast: {
    cal: 80,
    protein: 3,
    unit: "1 slice",
    followUp: "With butter or eggs?",
  },
  bagel: { cal: 270, protein: 10, unit: "each" },
  cereal: { cal: 180, protein: 4, unit: "1 bowl" },
  granola: {
    cal: 450,
    protein: 12,
    unit: "1 cup",
    followUp: "Granola is calorie-dense — portion it carefully!",
  },
  poha: { cal: 180, protein: 4, unit: "1 bowl" },
  upma: { cal: 200, protein: 5, unit: "1 bowl" },
  idli: {
    cal: 130,
    protein: 4,
    unit: "2 pieces",
    followUp: "With sambar or chutney?",
  },
  dosa: { cal: 200, protein: 5, unit: "each", followUp: "Plain or masala?" },
  // Proteins
  egg: {
    cal: 75,
    protein: 6,
    unit: "each",
    followUp: "How were they prepared?",
  },
  eggs: { cal: 75, protein: 6, unit: "each", followUp: "How many eggs?" },
  "boiled egg": { cal: 75, protein: 6, unit: "each" },
  "fried egg": { cal: 90, protein: 6, unit: "each" },
  "scrambled eggs": {
    cal: 150,
    protein: 12,
    unit: "serving",
    followUp: "With butter or oil?",
  },
  chicken: {
    cal: 165,
    protein: 31,
    unit: "100g",
    followUp: "Was it grilled or fried?",
  },
  "chicken breast": {
    cal: 165,
    protein: 31,
    unit: "100g",
    followUp: "Great lean protein!",
  },
  "grilled chicken": {
    cal: 165,
    protein: 31,
    unit: "100g",
    followUp: "Excellent choice!",
  },
  "fried chicken": {
    cal: 300,
    protein: 28,
    unit: "100g",
    followUp: "Fried adds a lot of calories — consider grilled next time.",
  },
  fish: { cal: 150, protein: 26, unit: "100g", followUp: "Grilled or fried?" },
  salmon: {
    cal: 200,
    protein: 25,
    unit: "100g",
    followUp: "Great omega-3 source!",
  },
  tuna: { cal: 120, protein: 28, unit: "100g", followUp: "In water or oil?" },
  mutton: { cal: 250, protein: 25, unit: "100g" },
  lamb: { cal: 250, protein: 25, unit: "100g" },
  beef: { cal: 250, protein: 26, unit: "100g" },
  paneer: {
    cal: 270,
    protein: 18,
    unit: "100g",
    followUp: "How much did you have?",
  },
  tofu: { cal: 80, protein: 8, unit: "100g", followUp: "Good plant protein!" },
  dal: { cal: 180, protein: 9, unit: "1 bowl", followUp: "Did you add tadka?" },
  lentils: { cal: 180, protein: 9, unit: "1 bowl" },
  chana: {
    cal: 200,
    protein: 10,
    unit: "1 bowl",
    followUp: "Boiled or cooked?",
  },
  rajma: { cal: 230, protein: 11, unit: "1 bowl" },
  "peanut butter": {
    cal: 190,
    protein: 8,
    unit: "2 tbsp",
    followUp: "On toast?",
  },
  "greek yogurt": {
    cal: 100,
    protein: 10,
    unit: "serving",
    followUp: "Great protein snack!",
  },
  "cottage cheese": { cal: 110, protein: 14, unit: "half cup" },
  tempeh: {
    cal: 160,
    protein: 15,
    unit: "100g",
    followUp: "Excellent protein for plant-based!",
  },
  edamame: { cal: 120, protein: 11, unit: "1 cup" },
  "whey protein": {
    cal: 120,
    protein: 25,
    unit: "1 scoop",
    followUp: "Mixed with milk or water?",
  },
  "protein shake": { cal: 200, protein: 25, unit: "serving" },
  // Dairy
  milk: {
    cal: 120,
    protein: 6,
    unit: "1 glass",
    followUp: "Full fat or skimmed?",
  },
  curd: { cal: 80, protein: 4, unit: "1 bowl" },
  yogurt: { cal: 80, protein: 4, unit: "1 bowl" },
  cheese: {
    cal: 110,
    protein: 7,
    unit: "1 slice",
    followUp: "What type of cheese?",
  },
  butter: {
    cal: 100,
    protein: 0,
    unit: "1 tbsp",
    followUp: "Butter adds up quickly — use sparingly.",
  },
  ghee: {
    cal: 120,
    protein: 0,
    unit: "1 tbsp",
    followUp: "Ghee is calorie-dense — how much did you add?",
  },
  cream: { cal: 50, protein: 0, unit: "1 tbsp" },
  // Vegetables
  salad: {
    cal: 60,
    protein: 2,
    unit: "bowl",
    followUp: "Any dressing on that?",
  },
  broccoli: {
    cal: 55,
    protein: 4,
    unit: "1 cup",
    followUp: "Great fiber and micronutrients!",
  },
  spinach: { cal: 20, protein: 2, unit: "1 cup" },
  carrots: { cal: 50, protein: 1, unit: "medium" },
  tomato: { cal: 25, protein: 1, unit: "medium" },
  cucumber: { cal: 15, protein: 1, unit: "medium" },
  potato: {
    cal: 160,
    protein: 4,
    unit: "medium",
    followUp: "Baked, boiled, or fried?",
  },
  "sweet potato": {
    cal: 130,
    protein: 3,
    unit: "medium",
    followUp: "Great complex carb!",
  },
  corn: { cal: 130, protein: 5, unit: "1 ear" },
  peas: { cal: 120, protein: 8, unit: "1 cup" },
  mushroom: { cal: 20, protein: 3, unit: "1 cup" },
  capsicum: { cal: 30, protein: 1, unit: "medium" },
  onion: { cal: 45, protein: 1, unit: "medium" },
  cabbage: { cal: 25, protein: 1, unit: "1 cup" },
  // Fruits
  banana: {
    cal: 100,
    protein: 1,
    unit: "medium",
    followUp: "Good energy! Pre or post workout?",
  },
  apple: { cal: 80, protein: 0, unit: "medium" },
  mango: {
    cal: 200,
    protein: 3,
    unit: "1 cup",
    followUp: "Mangoes are high sugar — just keep it to one.",
  },
  orange: { cal: 60, protein: 1, unit: "medium" },
  grapes: { cal: 100, protein: 1, unit: "1 cup" },
  watermelon: { cal: 80, protein: 2, unit: "2 cups" },
  pineapple: { cal: 80, protein: 1, unit: "1 cup" },
  berries: {
    cal: 50,
    protein: 1,
    unit: "1 cup",
    followUp: "Great antioxidants!",
  },
  avocado: {
    cal: 240,
    protein: 3,
    unit: "medium",
    followUp: "Healthy fats! Good choice.",
  },
  dates: {
    cal: 280,
    protein: 2,
    unit: "100g",
    followUp: "Dates are sugar-dense — 2-3 max.",
  },
  // Snacks & Fast Food
  pizza: {
    cal: 280,
    protein: 12,
    unit: "1 slice",
    followUp: "That's on the heavier side. Light dinner tonight?",
  },
  burger: {
    cal: 500,
    protein: 25,
    unit: "each",
    followUp: "Big one! Balance it with a light dinner.",
  },
  sandwich: { cal: 350, protein: 15, unit: "each", followUp: "What filling?" },
  chips: {
    cal: 150,
    protein: 2,
    unit: "small bag",
    followUp: "Empty calories — swap with roasted nuts next time.",
  },
  biscuits: { cal: 150, protein: 2, unit: "4-5 pieces" },
  chocolate: {
    cal: 220,
    protein: 3,
    unit: "40g bar",
    followUp: "Dark chocolate (70%+) is a healthier pick.",
  },
  "ice cream": { cal: 200, protein: 4, unit: "1 scoop" },
  cake: {
    cal: 400,
    protein: 5,
    unit: "1 slice",
    followUp: "Treat meal noted! Back on track at next meal.",
  },
  samosa: {
    cal: 250,
    protein: 5,
    unit: "each",
    followUp: "Fried snack — balance with a light meal.",
  },
  pakora: { cal: 200, protein: 6, unit: "4 pieces" },
  biryani: {
    cal: 450,
    protein: 20,
    unit: "1 plate",
    followUp: "Skip heavy gravy at dinner if you had biryani.",
  },
  "fried rice": {
    cal: 400,
    protein: 10,
    unit: "1 plate",
    followUp: "High sodium — drink extra water.",
  },
  "pad thai": { cal: 380, protein: 15, unit: "1 plate" },
  sushi: { cal: 350, protein: 18, unit: "6 rolls" },
  tacos: {
    cal: 200,
    protein: 12,
    unit: "each",
    followUp: "How many did you have?",
  },
  burrito: {
    cal: 600,
    protein: 25,
    unit: "each",
    followUp: "Burritos are filling — you're likely set for hours.",
  },
  // Drinks
  coffee: {
    cal: 50,
    protein: 1,
    unit: "cup",
    followUp: "With milk and sugar?",
  },
  "black coffee": {
    cal: 5,
    protein: 0,
    unit: "cup",
    followUp: "Zero-calorie — great habit!",
  },
  tea: { cal: 50, protein: 0, unit: "cup", followUp: "With milk and sugar?" },
  "green tea": {
    cal: 5,
    protein: 0,
    unit: "cup",
    followUp: "Excellent choice — boosts metabolism!",
  },
  "milk tea": { cal: 120, protein: 3, unit: "cup" },
  juice: {
    cal: 120,
    protein: 1,
    unit: "1 glass",
    followUp: "Whole fruit is better than juice — no fiber in juice.",
  },
  smoothie: {
    cal: 280,
    protein: 8,
    unit: "glass",
    followUp: "What ingredients did you blend?",
  },
  soda: {
    cal: 140,
    protein: 0,
    unit: "can",
    followUp: "140 empty calories — swap with sparkling water?",
  },
  cola: {
    cal: 140,
    protein: 0,
    unit: "can",
    followUp: "140 empty calories — swap with sparkling water?",
  },
  beer: { cal: 150, protein: 1, unit: "can" },
  wine: { cal: 120, protein: 0, unit: "glass" },
  water: {
    cal: 0,
    protein: 0,
    unit: "glass",
    followUp: "Great — keep drinking water throughout the day!",
  },
  // Nuts & Fats
  almonds: {
    cal: 160,
    protein: 6,
    unit: "handful",
    followUp: "Good healthy fat snack!",
  },
  cashews: { cal: 160, protein: 5, unit: "handful" },
  walnuts: {
    cal: 190,
    protein: 4,
    unit: "handful",
    followUp: "Great omega-3 source!",
  },
  nuts: { cal: 160, protein: 5, unit: "handful" },
  peanuts: { cal: 170, protein: 8, unit: "handful" },
  seeds: { cal: 150, protein: 5, unit: "1 tbsp" },
  "olive oil": {
    cal: 120,
    protein: 0,
    unit: "1 tbsp",
    followUp: "Healthy fat, but oil adds up — measure it!",
  },
  "coconut oil": { cal: 120, protein: 0, unit: "1 tbsp" },
};

export function getFoodResponse(
  input: string,
  dailyCalories: number,
  dailyProtein: number,
  goal: string,
  gymUser?: boolean,
): string {
  const lower = input.toLowerCase();
  let totalCal = 0;
  let totalProtein = 0;
  const matchedFoods: string[] = [];
  let followUp = "";

  for (const [food, data] of Object.entries(FOOD_DB)) {
    if (lower.includes(food)) {
      matchedFoods.push(food);
      totalCal += data.cal;
      totalProtein += data.protein;
      if (data.followUp && !followUp) followUp = data.followUp;
    }
  }

  if (matchedFoods.length === 0) {
    if (gymUser) {
      return `I don't have exact data for that meal, but it sounds like a decent choice. Estimate around 350–450 kcal. To stay on track with your ${dailyProtein}g protein target, consider adding a protein source like eggs, chicken, or a shake. 💪`;
    }
    return `I don't have exact data for that meal, but it sounds like a balanced choice. Log it as roughly 300–400 kcal. You're doing great — just keep your meals whole and varied. 🌿`;
  }

  const foods = matchedFoods.slice(0, 3).join(", ");
  const pctOfGoal = Math.round((totalCal / dailyCalories) * 100);
  const calsLeft = dailyCalories - totalCal;

  let response = `${foods} — roughly ${totalCal} kcal and ${totalProtein}g protein.`;

  // Goal-aware + user-type context
  if (goal === "lose_fat") {
    if (pctOfGoal > 45) {
      response += ` That's ${pctOfGoal}% of your ${dailyCalories} kcal fat-loss budget — a hefty meal. Try keeping dinner to ~${Math.max(200, calsLeft)} kcal (think salad, soup, or grilled veggies) to stay in your deficit.`;
    } else if (pctOfGoal > 25) {
      response += ` That's ${pctOfGoal}% of your ${dailyCalories} kcal goal. You have about ${calsLeft} kcal left today — you're on track. Keep dinner light and you'll hit your deficit! 🎯`;
    } else {
      response += ` Solid, light choice! Only ${pctOfGoal}% of your ${dailyCalories} kcal target. Plenty of room left — make sure you're not going too low, which can stall fat loss.`;
    }
    if (gymUser) {
      response += ` Even in a deficit, aim for ${dailyProtein}g protein — it protects muscle while you lean out.`;
    }
  } else if (goal === "gain_muscle") {
    if (totalProtein >= 25) {
      response += ` Strong protein hit! 💪 ${totalProtein}g protein from this meal alone helps with muscle repair. You're at ${pctOfGoal}% of your ${dailyCalories} kcal surplus goal.`;
    } else if (totalProtein >= 10) {
      response += ` Decent protein (${totalProtein}g) but you'll need more throughout the day to hit your ${dailyProtein}g muscle-building target. Consider adding eggs, chicken, or dairy.`;
    } else {
      response += ` This meal is low on protein for muscle gain. Your daily target is ${dailyProtein}g — add a dedicated protein source (tofu, eggs, meat, or a shake) to your next meal.`;
    }
    if (gymUser) {
      response += " If this is post-workout, great timing for muscle recovery!";
    }
  } else {
    if (pctOfGoal > 40) {
      response += ` That's ${pctOfGoal}% of your ${dailyCalories} kcal maintenance goal in one meal. Balance the rest of your day with lighter options.`;
    } else {
      response += ` You're at ${pctOfGoal}% of your ${dailyCalories} kcal maintenance goal. Balanced and on track! ⚖️`;
    }
  }

  if (followUp) response += ` ${followUp}`;

  return response;
}

export function getPersonalTags(profile: UserProfile): string[] {
  const tags: string[] = [];

  if (profile.gymUser) {
    tags.push("Muscle Mode 💪");
    tags.push("High Protein");
  } else {
    tags.push("Balanced Plan 🥗");
    tags.push("Healthy Eating");
  }

  // Goal tag
  if (profile.goal === "lose_fat") tags.push("Fat Loss Mode 🔥");
  else if (profile.goal === "gain_muscle") tags.push("Muscle Builder 💪");
  else tags.push("Maintenance Mode ⚖️");

  // Activity tag
  if (profile.activity === "high") tags.push("Active 🏃");
  else if (profile.activity === "moderate") tags.push("Moderately Active 🚶");

  return tags.slice(0, 4);
}

export function getSimpleSwaps(
  profile: UserProfile,
): Array<{ from: string; to: string; reason: string }> {
  const swaps: Array<{ from: string; to: string; reason: string }> = [];

  if (profile.goal === "lose_fat") {
    swaps.push({
      from: "Fried foods",
      to: "Grilled / baked",
      reason: "Saves 100–200 kcal per meal instantly",
    });
    swaps.push({
      from: "Soda or cola",
      to: "Sparkling water or green tea",
      reason: "Cuts 140 empty calories with zero nutrition",
    });
    swaps.push({
      from: "White rice",
      to: "Brown rice or quinoa",
      reason: "More fiber keeps you full longer",
    });
    swaps.push({
      from: "Maida / white flour",
      to: "Whole wheat flour",
      reason: "Lower glycemic index, steady energy",
    });
  } else if (profile.goal === "gain_muscle") {
    swaps.push({
      from: "White bread",
      to: "Multigrain or whole wheat",
      reason: "More micronutrients to support recovery",
    });
    swaps.push({
      from: "Sugary snacks",
      to: "Protein bar or Greek yogurt",
      reason: "Protein instead of empty sugar",
    });
    swaps.push({
      from: "Skipping meals",
      to: "Eating every 3 hours",
      reason: "Keeps muscles fueled and reduces catabolism",
    });
    swaps.push({
      from: "Juice",
      to: "Whole fruit + protein shake",
      reason: "More protein and fiber, better for gains",
    });
  } else {
    swaps.push({
      from: "Deep-fried snacks",
      to: "Roasted or air-fried",
      reason: "Same taste, fewer calories",
    });
    swaps.push({
      from: "Soda",
      to: "Water with lemon",
      reason: "Eliminates liquid calories effortlessly",
    });
    swaps.push({
      from: "Chips",
      to: "Roasted nuts or seeds",
      reason: "Healthy fats and protein vs empty carbs",
    });
    swaps.push({
      from: "Processed cereal",
      to: "Oats with fruit",
      reason: "Longer satiety, natural sugars only",
    });
  }

  if (profile.diet === "vegan") {
    swaps.push({
      from: "Low protein meals",
      to: "Hemp seeds + legumes combo",
      reason: "Complete amino acid profile for vegans",
    });
  }

  return swaps.slice(0, 4);
}

export function getNextActions(profile: UserProfile): string[] {
  if (profile.gymUser) {
    return [
      "Hit your protein target today",
      "Eat your post-workout meal within 30 minutes",
      "Drink at least 3L of water today",
    ];
  }
  return [
    "Walk for 20 minutes today",
    "Eat balanced meals with protein + veggies",
    "Stay hydrated — drink 8 glasses of water",
  ];
}

export type Meal = {
  dish: string;
  calories: number;
  ingredients: string[];
  steps: string[];
  protein?: number;
};

export type DayPlan = {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
};

const RECIPE_PLANS: Record<string, Record<string, DayPlan>> = {
  balanced: {
    veg: {
      breakfast: {
        dish: "Oats Porridge with Banana & Almonds",
        calories: 320,
        protein: 12,
        ingredients: [
          "1 cup rolled oats",
          "1.5 cups milk",
          "1 banana (sliced)",
          "10 almonds",
          "1 tsp honey",
        ],
        steps: [
          "Cook oats with milk on medium heat for 5 min, stirring occasionally.",
          "Top with sliced banana, crushed almonds, and a drizzle of honey.",
          "Serve warm. Add cinnamon for extra flavour.",
        ],
      },
      lunch: {
        dish: "Dal Rice with Mixed Sabzi",
        calories: 480,
        protein: 18,
        ingredients: [
          "1 cup rice",
          "1 bowl dal (toor/masoor)",
          "mixed seasonal veggies",
          "cumin, turmeric, salt",
          "1 tsp ghee",
        ],
        steps: [
          "Cook rice and dal separately with salt and turmeric.",
          "Stir-fry veggies with cumin seeds, salt, and spices until tender.",
          "Serve rice with dal, sabzi, and a small side of curd.",
        ],
      },
      dinner: {
        dish: "Paneer Tikka with Whole Wheat Roti",
        calories: 430,
        protein: 22,
        ingredients: [
          "150g paneer",
          "1 bell pepper",
          "1 onion",
          "2 whole wheat rotis",
          "yogurt & spice marinade",
        ],
        steps: [
          "Marinate paneer and veggies in yogurt, chili, and spices for 20 min.",
          "Grill or pan-fry on high heat until lightly charred.",
          "Serve with fresh rotis and mint chutney.",
        ],
      },
      snack: {
        dish: "Fruit Bowl with Greek Yogurt",
        calories: 180,
        protein: 8,
        ingredients: [
          "1 apple",
          "1 banana",
          "1/2 cup berries",
          "100g Greek yogurt",
          "1 tsp chia seeds",
        ],
        steps: [
          "Chop fruits and combine in a bowl.",
          "Top with Greek yogurt and chia seeds.",
        ],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Scrambled Eggs with Whole Wheat Toast",
        calories: 380,
        protein: 24,
        ingredients: [
          "3 eggs",
          "2 slices whole wheat bread",
          "1 tbsp butter",
          "salt, pepper, herbs",
          "1 glass milk",
        ],
        steps: [
          "Whisk eggs with salt and pepper. Cook on low heat with butter, stirring gently.",
          "Toast bread until golden.",
          "Serve eggs on toast with a glass of cold milk.",
        ],
      },
      lunch: {
        dish: "Chicken Rice Bowl",
        calories: 520,
        protein: 38,
        ingredients: [
          "150g chicken breast",
          "1 cup brown rice",
          "mixed veggies",
          "soy sauce, garlic, ginger",
          "1 tsp olive oil",
        ],
        steps: [
          "Cook brown rice as per package instructions.",
          "Stir-fry chicken strips with garlic, ginger, and soy sauce until cooked through.",
          "Serve over rice with stir-fried vegetables.",
        ],
      },
      dinner: {
        dish: "Grilled Fish with Roasted Vegetables",
        calories: 380,
        protein: 35,
        ingredients: [
          "200g white fish fillet",
          "1 cup broccoli",
          "1 bell pepper",
          "lemon, garlic, olive oil",
          "salt and herbs",
        ],
        steps: [
          "Marinate fish with lemon juice, garlic, salt, and herbs.",
          "Grill for 4 min each side. Toss veggies with olive oil and roast at 200°C for 20 min.",
          "Serve together with a wedge of lemon.",
        ],
      },
      snack: {
        dish: "Boiled Eggs & Almonds",
        calories: 220,
        protein: 16,
        ingredients: [
          "2 boiled eggs",
          "1 handful almonds",
          "pinch of salt & pepper",
        ],
        steps: [
          "Boil eggs for 10 min in salted water, peel and season.",
          "Pair with a handful of almonds for healthy fats.",
        ],
      },
    },
    vegan: {
      breakfast: {
        dish: "Green Smoothie Bowl",
        calories: 340,
        protein: 12,
        ingredients: [
          "1 cup oat milk",
          "1 banana",
          "1 cup spinach",
          "2 tbsp peanut butter",
          "granola + seeds topping",
        ],
        steps: [
          "Blend oat milk, banana, spinach, and peanut butter until smooth.",
          "Pour into a bowl and top with granola, chia seeds, and sliced fruit.",
        ],
      },
      lunch: {
        dish: "Quinoa & Lentil Buddha Bowl",
        calories: 490,
        protein: 22,
        ingredients: [
          "1 cup quinoa",
          "1 cup cooked lentils",
          "roasted sweet potato",
          "spinach, cherry tomatoes",
          "tahini dressing",
        ],
        steps: [
          "Cook quinoa and lentils separately.",
          "Roast sweet potato cubes at 200°C for 25 min.",
          "Assemble bowl and drizzle with tahini-lemon dressing.",
        ],
      },
      dinner: {
        dish: "Tofu Stir-Fry with Brown Rice",
        calories: 420,
        protein: 20,
        ingredients: [
          "200g firm tofu",
          "1 cup brown rice",
          "mixed vegetables",
          "soy sauce, sesame oil",
          "garlic & ginger",
        ],
        steps: [
          "Press and cube tofu, pan-fry in sesame oil until golden.",
          "Add garlic, ginger, veggies, and soy sauce, stir-fry 5 min.",
          "Serve over cooked brown rice.",
        ],
      },
      snack: {
        dish: "Hummus & Veggie Sticks",
        calories: 180,
        protein: 7,
        ingredients: [
          "3 tbsp hummus",
          "carrots",
          "cucumber",
          "bell pepper strips",
        ],
        steps: ["Cut veggies into sticks.", "Serve with hummus for dipping."],
      },
    },
  },
  indian: {
    veg: {
      breakfast: {
        dish: "Masala Dosa with Sambar",
        calories: 360,
        protein: 12,
        ingredients: [
          "2 dosas (batter)",
          "potato masala filling",
          "sambar",
          "coconut chutney",
          "curry leaves",
        ],
        steps: [
          "Spread dosa batter on hot griddle, cook till crisp.",
          "Add spiced potato filling in the centre, fold.",
          "Serve with hot sambar and chutney.",
        ],
      },
      lunch: {
        dish: "Dal Tadka + Rice + Roti",
        calories: 520,
        protein: 20,
        ingredients: [
          "1 cup dal",
          "1 cup rice",
          "2 rotis",
          "ghee, cumin, garlic, dried chili",
          "curd",
        ],
        steps: [
          "Cook dal with turmeric and salt. Prepare tadka with ghee, cumin, garlic.",
          "Pour tadka over dal. Serve with rice, roti, and curd.",
        ],
      },
      dinner: {
        dish: "Palak Paneer + 2 Rotis",
        calories: 440,
        protein: 22,
        ingredients: [
          "100g paneer",
          "2 cups spinach",
          "onion, tomato, ginger garlic",
          "2 rotis",
          "cream (optional)",
        ],
        steps: [
          "Blanch and blend spinach. Sauté onions, tomato, and spices.",
          "Add spinach purée and paneer cubes, simmer 5 min.",
          "Serve with warm rotis.",
        ],
      },
      snack: {
        dish: "Roasted Chana + Chai",
        calories: 220,
        protein: 10,
        ingredients: [
          "1 cup roasted chana",
          "1 cup masala chai",
          "lemon & salt",
        ],
        steps: [
          "Season roasted chana with lemon, salt, and chaat masala.",
          "Pair with a cup of masala chai.",
        ],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Masala Omelette & Whole Wheat Toast",
        calories: 380,
        protein: 26,
        ingredients: [
          "3 eggs",
          "capsicum, onion, green chili",
          "2 whole wheat toasts",
          "salt and spices",
          "1 tsp oil",
        ],
        steps: [
          "Beat eggs with salt, chili, capsicum, and onion.",
          "Cook on non-stick pan until set, fold in half.",
          "Serve with whole wheat toast.",
        ],
      },
      lunch: {
        dish: "Chicken Roti Bowl",
        calories: 520,
        protein: 38,
        ingredients: [
          "150g chicken",
          "2 rotis",
          "1 bowl dal",
          "curd",
          "onion-tomato gravy",
        ],
        steps: [
          "Cook chicken with onion-tomato masala and spices.",
          "Serve with 2 rotis, a bowl of dal, and fresh curd.",
        ],
      },
      dinner: {
        dish: "Grilled Chicken + Sabzi + Roti",
        calories: 420,
        protein: 35,
        ingredients: [
          "150g chicken breast",
          "mixed vegetables",
          "1 roti",
          "olive oil and spices",
          "lemon",
        ],
        steps: [
          "Marinate chicken with spices and lemon, grill 5 min each side.",
          "Stir-fry veggies with minimal oil and spices.",
          "Serve with one roti and cucumber raita.",
        ],
      },
      snack: {
        dish: "Boiled Eggs + Green Tea",
        calories: 160,
        protein: 12,
        ingredients: ["2 eggs", "1 cup green tea", "salt and pepper"],
        steps: [
          "Boil eggs in salted water for 10 min.",
          "Peel, season lightly, and enjoy with green tea.",
        ],
      },
    },
    vegan: {
      breakfast: {
        dish: "Poha with Peanuts & Veggies",
        calories: 300,
        protein: 10,
        ingredients: [
          "1.5 cups flattened rice (poha)",
          "peanuts",
          "onion, green chili, curry leaves",
          "mustard seeds, turmeric",
          "lemon juice",
        ],
        steps: [
          "Rinse and drain poha. Temper mustard seeds, curry leaves in oil.",
          "Add onions, chili, peanuts, turmeric. Add poha, mix, cook 3 min.",
          "Finish with lemon juice and fresh coriander.",
        ],
      },
      lunch: {
        dish: "Rajma Chawal (Kidney Bean Rice)",
        calories: 500,
        protein: 20,
        ingredients: [
          "1 cup rajma (cooked)",
          "1 cup rice",
          "onion, tomato, ginger garlic",
          "cumin, garam masala",
          "coriander to garnish",
        ],
        steps: [
          "Cook rajma with onion-tomato masala until thick.",
          "Serve over steamed rice with coriander garnish.",
        ],
      },
      dinner: {
        dish: "Chana Masala + Roti",
        calories: 400,
        protein: 18,
        ingredients: [
          "1 cup chickpeas",
          "2 rotis",
          "onion, tomato, spices",
          "ginger garlic paste",
          "lemon juice",
        ],
        steps: [
          "Sauté onions till golden, add tomato and spices.",
          "Add chickpeas and simmer 10 min.",
          "Serve with rotis and sliced onion salad.",
        ],
      },
      snack: {
        dish: "Murmura Chaat (Puffed Rice)",
        calories: 160,
        protein: 4,
        ingredients: [
          "2 cups puffed rice",
          "onion, tomato, coriander",
          "lemon, salt, chaat masala",
          "green chutney",
        ],
        steps: [
          "Mix puffed rice with chopped vegetables.",
          "Season with lemon, salt, chaat masala, and chutney.",
        ],
      },
    },
  },
  mexican: {
    veg: {
      breakfast: {
        dish: "Avocado Toast with Salsa",
        calories: 360,
        protein: 10,
        ingredients: [
          "2 slices sourdough bread",
          "1 avocado",
          "tomato salsa",
          "lemon, salt, chili flakes",
          "fresh coriander",
        ],
        steps: [
          "Toast bread until golden. Mash avocado with lemon, salt, chili.",
          "Spread on toast and top with fresh salsa and coriander.",
        ],
      },
      lunch: {
        dish: "Black Bean & Veggie Burrito Bowl",
        calories: 480,
        protein: 18,
        ingredients: [
          "1 cup black beans",
          "1 cup rice",
          "corn, capsicum, onion",
          "guacamole",
          "salsa and sour cream",
        ],
        steps: [
          "Cook rice. Sauté veggies with cumin and chili powder.",
          "Assemble bowl with rice, beans, veggies, and toppings.",
        ],
      },
      dinner: {
        dish: "Cheese Quesadilla with Pico de Gallo",
        calories: 420,
        protein: 16,
        ingredients: [
          "2 flour tortillas",
          "1/2 cup cheese",
          "black beans",
          "jalapeño",
          "fresh tomato salsa",
        ],
        steps: [
          "Fill tortilla with cheese, beans, and jalapeño. Fold and grill until golden.",
          "Serve with homemade pico de gallo.",
        ],
      },
      snack: {
        dish: "Guacamole & Tortilla Chips",
        calories: 240,
        protein: 4,
        ingredients: [
          "1 avocado",
          "tomato, onion, lime",
          "handful tortilla chips",
          "salt and coriander",
        ],
        steps: [
          "Mash avocado with diced tomato, onion, lime juice and salt.",
          "Serve with baked tortilla chips.",
        ],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Huevos Rancheros",
        calories: 400,
        protein: 22,
        ingredients: [
          "2 eggs",
          "2 corn tortillas",
          "black beans",
          "tomato salsa",
          "jalapeño & cheese",
        ],
        steps: [
          "Warm tortillas and top with heated black beans.",
          "Fry eggs sunny-side up and place over beans.",
          "Top with salsa, jalapeño, and a sprinkle of cheese.",
        ],
      },
      lunch: {
        dish: "Chicken Burrito Bowl",
        calories: 550,
        protein: 42,
        ingredients: [
          "150g chicken breast",
          "1 cup rice",
          "black beans, corn",
          "guacamole, salsa",
          "lime & cumin",
        ],
        steps: [
          "Season and grill chicken with lime, cumin, and chili. Slice into strips.",
          "Assemble bowl with rice, beans, corn, chicken, and toppings.",
        ],
      },
      dinner: {
        dish: "Beef Tacos",
        calories: 480,
        protein: 35,
        ingredients: [
          "150g lean ground beef",
          "3 corn tortillas",
          "shredded lettuce, cheese",
          "salsa, sour cream",
          "taco spice mix",
        ],
        steps: [
          "Cook beef with taco seasoning until browned.",
          "Warm tortillas. Fill with beef, lettuce, cheese, and salsa.",
        ],
      },
      snack: {
        dish: "Chicken & Cheese Quesadilla Bites",
        calories: 280,
        protein: 22,
        ingredients: [
          "1 tortilla",
          "50g grilled chicken",
          "cheese",
          "salsa for dipping",
        ],
        steps: [
          "Fill tortilla with chicken and cheese, fold and grill.",
          "Cut into triangles and serve with salsa.",
        ],
      },
    },
    vegan: {
      breakfast: {
        dish: "Tofu Scramble with Tortilla",
        calories: 380,
        protein: 18,
        ingredients: [
          "150g firm tofu",
          "2 corn tortillas",
          "bell pepper, onion, spinach",
          "turmeric, cumin, chili",
          "salsa",
        ],
        steps: [
          "Crumble tofu and cook with turmeric, cumin, and veggies.",
          "Fill warm tortillas with scramble and top with salsa.",
        ],
      },
      lunch: {
        dish: "Vegan Burrito Bowl",
        calories: 480,
        protein: 18,
        ingredients: [
          "1 cup black beans",
          "1 cup rice",
          "roasted corn and capsicum",
          "guacamole",
          "lime & cilantro",
        ],
        steps: [
          "Cook rice, roast veggies with olive oil and spices.",
          "Assemble bowl with all ingredients and top with guacamole.",
        ],
      },
      dinner: {
        dish: "Jackfruit Tacos",
        calories: 400,
        protein: 10,
        ingredients: [
          "1 can young jackfruit",
          "3 corn tortillas",
          "chipotle sauce",
          "cabbage slaw, avocado",
          "lime juice",
        ],
        steps: [
          "Shred jackfruit and cook with chipotle and spices.",
          "Fill tortillas with jackfruit, slaw, and avocado slices.",
        ],
      },
      snack: {
        dish: "Black Bean Dip & Veggies",
        calories: 180,
        protein: 9,
        ingredients: [
          "1/2 cup black beans",
          "garlic, lime, cumin",
          "carrot and celery sticks",
        ],
        steps: [
          "Blend beans with garlic, lime, and cumin into a dip.",
          "Serve with raw vegetable sticks.",
        ],
      },
    },
  },
  chinese: {
    veg: {
      breakfast: {
        dish: "Congee (Rice Porridge) with Tofu",
        calories: 280,
        protein: 12,
        ingredients: [
          "1/2 cup rice",
          "3 cups water/broth",
          "silken tofu",
          "ginger, soy sauce",
          "spring onion, sesame oil",
        ],
        steps: [
          "Simmer rice in broth with ginger until porridge consistency (~20 min).",
          "Add cubed silken tofu, season with soy sauce and sesame oil.",
          "Top with spring onions.",
        ],
      },
      lunch: {
        dish: "Mapo Tofu with Steamed Rice",
        calories: 460,
        protein: 20,
        ingredients: [
          "200g tofu",
          "1 cup rice",
          "doubanjiang (chili bean paste)",
          "garlic, ginger, spring onion",
          "sesame oil",
        ],
        steps: [
          "Stir-fry garlic, ginger, and doubanjiang in oil.",
          "Add tofu cubes and broth, simmer 5 min. Drizzle sesame oil.",
          "Serve over steamed rice.",
        ],
      },
      dinner: {
        dish: "Veggie Fried Rice",
        calories: 420,
        protein: 12,
        ingredients: [
          "2 cups cooked rice",
          "mixed veggies (peas, corn, carrot)",
          "2 eggs",
          "soy sauce, sesame oil",
          "garlic and spring onion",
        ],
        steps: [
          "Stir-fry veggies in hot oil with garlic. Push aside, scramble eggs.",
          "Add rice and soy sauce, toss everything together on high heat.",
        ],
      },
      snack: {
        dish: "Steamed Edamame",
        calories: 120,
        protein: 11,
        ingredients: ["1 cup edamame", "sea salt", "pinch of chili flakes"],
        steps: [
          "Steam edamame for 5 min.",
          "Season with sea salt and optional chili flakes.",
        ],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Egg Fried Rice (Breakfast Style)",
        calories: 380,
        protein: 18,
        ingredients: [
          "2 cups cooked rice",
          "2 eggs",
          "spring onion, soy sauce",
          "sesame oil, garlic",
          "pinch of white pepper",
        ],
        steps: [
          "Heat oil, fry garlic, add rice and toss on high heat.",
          "Push aside, scramble eggs, mix everything with soy sauce and sesame oil.",
        ],
      },
      lunch: {
        dish: "Kung Pao Chicken with Rice",
        calories: 520,
        protein: 40,
        ingredients: [
          "150g chicken breast",
          "peanuts",
          "dried chilies, garlic, ginger",
          "soy sauce, rice vinegar, sugar",
          "1 cup rice",
        ],
        steps: [
          "Marinate chicken in soy sauce. Stir-fry with dried chilies and aromatics.",
          "Add peanuts and sauce, toss to coat. Serve with rice.",
        ],
      },
      dinner: {
        dish: "Steamed Fish with Ginger & Soy",
        calories: 360,
        protein: 40,
        ingredients: [
          "200g white fish",
          "ginger strips, spring onion",
          "soy sauce, sesame oil",
          "rice wine (optional)",
          "steamed bok choy",
        ],
        steps: [
          "Place fish in steamer with ginger. Steam 10–12 min.",
          "Top with spring onion. Heat soy sauce + sesame oil, pour over fish.",
          "Serve with steamed bok choy.",
        ],
      },
      snack: {
        dish: "Chicken Dumplings (2–3 pieces)",
        calories: 200,
        protein: 14,
        ingredients: [
          "pre-made dumpling wrappers",
          "50g minced chicken",
          "cabbage, ginger",
          "soy sauce dipping",
        ],
        steps: [
          "Mix chicken with cabbage and ginger, fill wrappers.",
          "Boil or steam for 6–8 min. Serve with soy dipping sauce.",
        ],
      },
    },
    vegan: {
      breakfast: {
        dish: "Steamed Buns with Mushroom Filling",
        calories: 320,
        protein: 10,
        ingredients: [
          "store-bought bao buns",
          "shiitake mushrooms",
          "hoisin sauce, garlic",
          "spring onion, sesame oil",
        ],
        steps: [
          "Sauté mushrooms with garlic and hoisin sauce.",
          "Steam buns as per package, fill with mushroom mixture.",
        ],
      },
      lunch: {
        dish: "Buddha's Delight (Lo Han Jai)",
        calories: 420,
        protein: 16,
        ingredients: [
          "tofu, mushrooms, bamboo shoots",
          "bok choy, snow peas",
          "oyster-free sauce, soy sauce",
          "garlic, ginger, sesame oil",
          "rice noodles",
        ],
        steps: [
          "Stir-fry aromatics, add vegetables in order of cooking time.",
          "Add sauces and tofu, toss together. Serve with rice noodles.",
        ],
      },
      dinner: {
        dish: "Tofu & Vegetable Noodle Stir-Fry",
        calories: 430,
        protein: 18,
        ingredients: [
          "150g firm tofu",
          "noodles",
          "broccoli, mushroom, carrot",
          "soy sauce, sesame oil",
          "chili and garlic",
        ],
        steps: [
          "Cook noodles, drain. Stir-fry tofu until golden.",
          "Add veggies and sauce, toss with noodles over high heat.",
        ],
      },
      snack: {
        dish: "Sesame Roasted Edamame",
        calories: 130,
        protein: 11,
        ingredients: [
          "1 cup edamame",
          "1 tsp sesame oil",
          "soy sauce, chili flakes",
        ],
        steps: [
          "Toss edamame with sesame oil and soy sauce.",
          "Roast at 200°C for 15 min until slightly crispy.",
        ],
      },
    },
  },
  keto: {
    veg: {
      breakfast: {
        dish: "Avocado & Paneer Scramble",
        calories: 420,
        protein: 20,
        ingredients: [
          "3 eggs",
          "1/2 avocado",
          "50g paneer (crumbled)",
          "spinach",
          "salt, pepper, chili flakes",
        ],
        steps: [
          "Scramble eggs with crumbled paneer and spinach in butter.",
          "Serve topped with sliced avocado and seasoning.",
        ],
      },
      lunch: {
        dish: "Paneer Salad with Olive Oil Dressing",
        calories: 460,
        protein: 22,
        ingredients: [
          "150g paneer",
          "cucumber, tomato, olives, capsicum",
          "3 tbsp olive oil",
          "lemon, oregano",
          "leafy greens",
        ],
        steps: [
          "Grill or pan-fry paneer cubes. Let cool slightly.",
          "Toss with veggies and olive oil–lemon dressing.",
        ],
      },
      dinner: {
        dish: "Cauliflower Rice with Palak Paneer",
        calories: 400,
        protein: 20,
        ingredients: [
          "1 head cauliflower (grated)",
          "100g paneer",
          "1 cup spinach",
          "cream, butter, garlic",
          "spices",
        ],
        steps: [
          "Sauté grated cauliflower as rice substitute.",
          "Make palak (spinach) paneer gravy, serve over cauliflower rice.",
        ],
      },
      snack: {
        dish: "Cheese & Nut Board",
        calories: 240,
        protein: 10,
        ingredients: [
          "30g cheese slices",
          "handful walnuts and almonds",
          "cucumber sticks",
          "cream cheese dip",
        ],
        steps: [
          "Arrange cheese, nuts, and cucumber on a plate.",
          "Enjoy as a fat-rich, low-carb snack.",
        ],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Bacon & Egg Cups",
        calories: 380,
        protein: 28,
        ingredients: [
          "2 strips bacon",
          "3 eggs",
          "cheese",
          "salt, pepper, herbs",
          "baby spinach",
        ],
        steps: [
          "Line muffin tin with bacon strips. Crack an egg in each. Add cheese.",
          "Bake at 180°C for 12–15 min until set.",
        ],
      },
      lunch: {
        dish: "Grilled Chicken with Avocado Salad",
        calories: 480,
        protein: 42,
        ingredients: [
          "200g chicken thigh",
          "1 avocado",
          "mixed greens, tomato",
          "olive oil, lemon",
          "salt and herbs",
        ],
        steps: [
          "Season and grill chicken until cooked through.",
          "Toss greens with avocado and olive oil dressing. Serve alongside.",
        ],
      },
      dinner: {
        dish: "Salmon with Roasted Broccoli",
        calories: 460,
        protein: 42,
        ingredients: [
          "200g salmon fillet",
          "2 cups broccoli",
          "garlic, lemon, olive oil",
          "salt, herbs",
          "butter",
        ],
        steps: [
          "Season salmon with lemon and herbs, sear in butter 4 min each side.",
          "Toss broccoli in olive oil and garlic, roast at 200°C for 20 min.",
        ],
      },
      snack: {
        dish: "Devilled Eggs",
        calories: 180,
        protein: 12,
        ingredients: [
          "3 boiled eggs",
          "2 tbsp mayonnaise",
          "mustard, paprika",
          "salt and pepper",
        ],
        steps: [
          "Halve eggs, remove yolks and mix with mayo and mustard.",
          "Pipe back into whites, sprinkle paprika.",
        ],
      },
    },
    vegan: {
      breakfast: {
        dish: "Coconut Chia Pudding",
        calories: 360,
        protein: 10,
        ingredients: [
          "3 tbsp chia seeds",
          "1 cup coconut milk",
          "berries",
          "1 tsp vanilla",
          "1 tsp stevia (optional)",
        ],
        steps: [
          "Mix chia seeds with coconut milk and vanilla. Refrigerate overnight.",
          "Top with fresh berries before serving.",
        ],
      },
      lunch: {
        dish: "Avocado & Walnut Salad",
        calories: 500,
        protein: 14,
        ingredients: [
          "1 avocado",
          "1/2 cup walnuts",
          "mixed greens, cucumber, tomato",
          "olive oil, apple cider vinegar",
          "hemp seeds",
        ],
        steps: [
          "Slice avocado over mixed greens.",
          "Top with walnuts, hemp seeds, and olive oil dressing.",
        ],
      },
      dinner: {
        dish: "Zucchini Noodles with Almond Pesto",
        calories: 420,
        protein: 14,
        ingredients: [
          "2 large zucchinis (spiralized)",
          "almond pesto (almonds, basil, olive oil, garlic)",
          "cherry tomatoes",
          "nutritional yeast",
        ],
        steps: [
          "Spiralize zucchini. Blend pesto ingredients.",
          "Toss zoodles with pesto and tomatoes. Sprinkle nutritional yeast.",
        ],
      },
      snack: {
        dish: "Almond Butter & Celery Sticks",
        calories: 200,
        protein: 7,
        ingredients: [
          "3 tbsp almond butter",
          "4 celery stalks",
          "pinch of sea salt",
        ],
        steps: [
          "Cut celery into sticks.",
          "Dip in almond butter for a satisfying keto snack.",
        ],
      },
    },
  },
  "high-protein": {
    veg: {
      breakfast: {
        dish: "Protein Oats with Greek Yogurt",
        calories: 400,
        protein: 30,
        ingredients: [
          "1 cup oats",
          "1 scoop vanilla protein powder",
          "100g Greek yogurt",
          "berries",
          "1 tbsp almond butter",
        ],
        steps: [
          "Cook oats, stir in protein powder while still warm.",
          "Top with Greek yogurt, berries, and almond butter.",
        ],
      },
      lunch: {
        dish: "Paneer & Chickpea Power Bowl",
        calories: 520,
        protein: 35,
        ingredients: [
          "100g paneer",
          "1 cup chickpeas",
          "quinoa",
          "roasted veggies",
          "tahini dressing",
        ],
        steps: [
          "Grill paneer cubes. Roast chickpeas with spices at 200°C for 20 min.",
          "Assemble over quinoa with veggies and tahini.",
        ],
      },
      dinner: {
        dish: "Lentil & Tofu Stir-Fry",
        calories: 440,
        protein: 30,
        ingredients: [
          "150g firm tofu",
          "1 cup lentils",
          "spinach, garlic, chili",
          "soy sauce, sesame oil",
          "brown rice",
        ],
        steps: [
          "Cook lentils. Pan-fry tofu until golden.",
          "Combine with spinach, garlic, soy sauce. Serve over brown rice.",
        ],
      },
      snack: {
        dish: "Cottage Cheese & Nut Mix",
        calories: 250,
        protein: 20,
        ingredients: [
          "1/2 cup cottage cheese",
          "walnuts and almonds",
          "1 tsp honey",
          "pinch of cinnamon",
        ],
        steps: [
          "Combine cottage cheese with nuts and honey.",
          "Sprinkle cinnamon and serve as a high-protein snack.",
        ],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Egg White Omelette with Chicken",
        calories: 380,
        protein: 40,
        ingredients: [
          "4 egg whites + 1 whole egg",
          "50g shredded chicken",
          "spinach, mushroom",
          "salt, pepper, herbs",
          "1 slice whole wheat toast",
        ],
        steps: [
          "Whisk eggs, add shredded chicken and veggies.",
          "Cook as omelette on non-stick pan.",
          "Serve with toast.",
        ],
      },
      lunch: {
        dish: "High-Protein Chicken Rice",
        calories: 560,
        protein: 50,
        ingredients: [
          "200g chicken breast",
          "1.5 cups rice",
          "broccoli",
          "soy sauce, garlic, ginger",
          "1 tbsp olive oil",
        ],
        steps: [
          "Grill chicken with garlic and soy. Slice into strips.",
          "Serve over rice with steamed broccoli.",
        ],
      },
      dinner: {
        dish: "Tuna Steak with Sweet Potato",
        calories: 450,
        protein: 45,
        ingredients: [
          "200g tuna steak",
          "1 medium sweet potato",
          "asparagus",
          "lemon, olive oil, garlic",
          "salt and herbs",
        ],
        steps: [
          "Bake sweet potato for 35 min. Grill tuna 3 min each side.",
          "Steam asparagus, serve everything with lemon-olive oil drizzle.",
        ],
      },
      snack: {
        dish: "Protein Shake + Boiled Eggs",
        calories: 320,
        protein: 40,
        ingredients: [
          "1 scoop whey protein",
          "250ml milk",
          "2 boiled eggs",
          "1 banana",
        ],
        steps: [
          "Blend protein powder with cold milk.",
          "Pair with 2 boiled eggs for a complete protein hit.",
        ],
      },
    },
    vegan: {
      breakfast: {
        dish: "Tempeh & Quinoa Power Bowl",
        calories: 440,
        protein: 32,
        ingredients: [
          "150g tempeh",
          "1 cup quinoa",
          "edamame",
          "soy sauce, sesame oil",
          "avocado",
        ],
        steps: [
          "Slice and pan-fry tempeh with soy sauce until golden.",
          "Assemble with cooked quinoa, edamame, and avocado.",
        ],
      },
      lunch: {
        dish: "Lentil Soup with Whole Wheat Bread",
        calories: 460,
        protein: 28,
        ingredients: [
          "1.5 cups lentils",
          "onion, tomato, carrot, garlic",
          "cumin, turmeric, smoked paprika",
          "vegetable broth",
          "2 slices whole wheat bread",
        ],
        steps: [
          "Sauté aromatics, add lentils and broth. Simmer 20 min.",
          "Blend partially for thick texture. Serve with crusty bread.",
        ],
      },
      dinner: {
        dish: "Edamame & Tofu Stir-Fry",
        calories: 420,
        protein: 28,
        ingredients: [
          "150g tofu",
          "1 cup edamame",
          "bok choy, mushrooms",
          "soy sauce, sesame oil, garlic",
          "brown rice",
        ],
        steps: [
          "Pan-fry tofu until golden. Add veggies and edamame.",
          "Season with soy sauce, serve over brown rice.",
        ],
      },
      snack: {
        dish: "Vegan Protein Shake",
        calories: 280,
        protein: 25,
        ingredients: [
          "1 scoop vegan protein powder",
          "1 cup oat milk",
          "1 banana",
          "1 tbsp peanut butter",
        ],
        steps: [
          "Blend all ingredients with ice until smooth.",
          "Drink immediately post-workout for best results.",
        ],
      },
    },
  },
  "low-carb": {
    veg: {
      breakfast: {
        dish: "Egg & Avocado Breakfast Plate",
        calories: 380,
        protein: 18,
        ingredients: [
          "3 eggs (any style)",
          "1/2 avocado",
          "cherry tomatoes",
          "1 cup spinach (sautéed)",
          "salt, pepper, olive oil",
        ],
        steps: [
          "Cook eggs as preferred (poached, fried, or scrambled).",
          "Arrange with avocado, tomatoes, and sautéed spinach.",
        ],
      },
      lunch: {
        dish: "Paneer Stir-Fry with Cauliflower Rice",
        calories: 460,
        protein: 24,
        ingredients: [
          "150g paneer",
          "1 head cauliflower (grated)",
          "capsicum, onion, garlic",
          "cumin, coriander, garam masala",
          "1 tsp ghee",
        ],
        steps: [
          "Stir-fry cauliflower rice with minimal oil and salt.",
          "Pan-fry paneer with veggies and spices, serve together.",
        ],
      },
      dinner: {
        dish: "Greek Salad with Paneer",
        calories: 400,
        protein: 20,
        ingredients: [
          "100g paneer",
          "cucumber, tomato, olives, capsicum",
          "olive oil, lemon, oregano",
          "leafy greens",
          "feta-style seasoning",
        ],
        steps: [
          "Grill paneer until slightly charred.",
          "Toss veggies with olive oil and lemon, top with paneer.",
        ],
      },
      snack: {
        dish: "Cheese & Cucumber Rolls",
        calories: 180,
        protein: 10,
        ingredients: [
          "2 cheese slices",
          "1 cucumber (sliced)",
          "cream cheese",
          "fresh herbs",
        ],
        steps: [
          "Spread cream cheese on sliced cucumber rounds.",
          "Roll cheese slice around cucumber and serve.",
        ],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Turkey & Egg Breakfast Wrap (Lettuce)",
        calories: 340,
        protein: 30,
        ingredients: [
          "2 eggs",
          "50g turkey slices",
          "large lettuce leaves",
          "avocado, tomato",
          "mustard",
        ],
        steps: [
          "Scramble eggs. Layer with turkey in lettuce cups.",
          "Top with avocado and tomato.",
        ],
      },
      lunch: {
        dish: "Grilled Chicken Salad",
        calories: 440,
        protein: 42,
        ingredients: [
          "200g chicken breast",
          "mixed greens, cherry tomatoes",
          "cucumber, olives",
          "olive oil, lemon, mustard dressing",
          "sunflower seeds",
        ],
        steps: [
          "Season and grill chicken. Slice and cool slightly.",
          "Toss salad with dressing and top with chicken.",
        ],
      },
      dinner: {
        dish: "Baked Salmon with Zucchini",
        calories: 460,
        protein: 42,
        ingredients: [
          "200g salmon",
          "2 zucchinis",
          "lemon, dill, olive oil",
          "garlic",
          "salt and pepper",
        ],
        steps: [
          "Season salmon and bake at 200°C for 15 min.",
          "Slice and sauté zucchini with garlic in olive oil.",
        ],
      },
      snack: {
        dish: "Tuna Cucumber Bites",
        calories: 160,
        protein: 20,
        ingredients: [
          "1 can tuna (in water)",
          "cucumber rounds",
          "lemon, mayo",
          "salt, dill",
        ],
        steps: [
          "Mix tuna with mayo, lemon, and dill.",
          "Spoon onto cucumber rounds and serve.",
        ],
      },
    },
    vegan: {
      breakfast: {
        dish: "Tofu Scramble with Greens",
        calories: 360,
        protein: 20,
        ingredients: [
          "150g firm tofu",
          "spinach, mushrooms, capsicum",
          "turmeric, nutritional yeast",
          "garlic, olive oil",
          "salt and pepper",
        ],
        steps: [
          "Crumble tofu in pan, add turmeric and nutritional yeast.",
          "Sauté veggies and combine. Season and serve.",
        ],
      },
      lunch: {
        dish: "Lentil Lettuce Wraps",
        calories: 420,
        protein: 22,
        ingredients: [
          "1 cup lentils (cooked)",
          "large lettuce leaves",
          "avocado, tomato, cucumber",
          "lime, cumin, coriander",
          "tahini sauce",
        ],
        steps: [
          "Season lentils with lime, cumin, and coriander.",
          "Fill lettuce cups with lentils and veggies. Drizzle tahini.",
        ],
      },
      dinner: {
        dish: "Cauliflower Steak with Chickpeas",
        calories: 400,
        protein: 18,
        ingredients: [
          "1 large cauliflower (sliced as steaks)",
          "1/2 cup chickpeas",
          "harissa paste or spice blend",
          "olive oil, lemon",
          "fresh herbs",
        ],
        steps: [
          "Brush cauliflower steaks with harissa and roast at 220°C for 25 min.",
          "Roast chickpeas simultaneously. Serve with lemon and herbs.",
        ],
      },
      snack: {
        dish: "Peanut Butter Celery Sticks",
        calories: 190,
        protein: 7,
        ingredients: [
          "3 tbsp natural peanut butter",
          "4 celery stalks",
          "pinch of sea salt",
        ],
        steps: [
          "Cut celery into sticks.",
          "Dip in peanut butter for a satisfying, low-carb crunch.",
        ],
      },
    },
  },
  mediterranean: {
    veg: {
      breakfast: {
        dish: "Greek Yogurt with Honey & Walnuts",
        calories: 320,
        protein: 15,
        ingredients: [
          "200g Greek yogurt",
          "1 tbsp honey",
          "30g walnuts",
          "1 tsp cinnamon",
          "handful of berries",
        ],
        steps: [
          "Layer yogurt in a bowl.",
          "Top with walnuts, drizzle honey, sprinkle cinnamon and berries.",
        ],
      },
      lunch: {
        dish: "Falafel & Hummus Bowl",
        calories: 480,
        protein: 18,
        ingredients: [
          "6 falafel balls",
          "4 tbsp hummus",
          "quinoa",
          "cucumber",
          "cherry tomatoes",
          "lemon tahini dressing",
        ],
        steps: [
          "Warm falafel in oven.",
          "Arrange over quinoa with veggies, top with hummus and tahini dressing.",
        ],
      },
      dinner: {
        dish: "Spanakopita with Greek Salad",
        calories: 510,
        protein: 16,
        ingredients: [
          "phyllo pastry",
          "spinach",
          "feta cheese",
          "eggs",
          "olive oil",
          "tomatoes",
        ],
        steps: [
          "Layer buttered phyllo, fill with spinach-feta mixture.",
          "Bake at 180°C for 30 min. Serve with Greek salad.",
        ],
      },
      snack: {
        dish: "Tzatziki with Pita",
        calories: 180,
        protein: 8,
        ingredients: [
          "3 tbsp tzatziki",
          "1 whole-wheat pita",
          "cucumber slices",
        ],
        steps: ["Slice pita into wedges.", "Serve with tzatziki for dipping."],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Shakshuka with Feta",
        calories: 380,
        protein: 22,
        ingredients: [
          "3 eggs",
          "canned tomatoes",
          "feta",
          "cumin",
          "paprika",
          "olive oil",
        ],
        steps: [
          "Simmer tomatoes with spices.",
          "Crack eggs in, cover and cook 5 min. Top with feta.",
        ],
      },
      lunch: {
        dish: "Grilled Fish & Tabbouleh",
        calories: 460,
        protein: 38,
        ingredients: [
          "200g sea bass fillet",
          "bulgur wheat",
          "parsley",
          "tomatoes",
          "lemon",
          "olive oil",
        ],
        steps: [
          "Grill seasoned fish 4 min per side.",
          "Toss bulgur with herbs and lemon. Serve together.",
        ],
      },
      dinner: {
        dish: "Lamb Souvlaki with Tzatziki",
        calories: 540,
        protein: 40,
        ingredients: [
          "200g lamb chunks",
          "pita",
          "tzatziki",
          "red onion",
          "lemon",
          "oregano",
        ],
        steps: [
          "Marinate lamb in lemon-oregano. Grill on skewers 10 min.",
          "Serve in pita with tzatziki and onion.",
        ],
      },
      snack: {
        dish: "Tuna Stuffed Mini Peppers",
        calories: 160,
        protein: 18,
        ingredients: ["80g canned tuna", "4 mini peppers", "lemon", "capers"],
        steps: [
          "Mix tuna with lemon and capers.",
          "Fill halved peppers and serve.",
        ],
      },
    },
    vegan: {
      breakfast: {
        dish: "Avocado Toast with Za'atar",
        calories: 340,
        protein: 8,
        ingredients: [
          "2 sourdough slices",
          "1 avocado",
          "za'atar",
          "lemon",
          "chili flakes",
        ],
        steps: [
          "Toast bread.",
          "Mash avocado with lemon, spread and sprinkle za'atar.",
        ],
      },
      lunch: {
        dish: "Mujaddara (Lentil & Rice)",
        calories: 420,
        protein: 16,
        ingredients: [
          "1 cup green lentils",
          "1/2 cup rice",
          "2 onions",
          "cumin",
          "olive oil",
        ],
        steps: [
          "Cook lentils and rice together.",
          "Fry onions until crispy. Top lentil rice with caramelized onions.",
        ],
      },
      dinner: {
        dish: "Roasted Vegetable Couscous",
        calories: 460,
        protein: 12,
        ingredients: [
          "couscous",
          "zucchini",
          "eggplant",
          "bell peppers",
          "harissa",
          "chickpeas",
        ],
        steps: [
          "Roast veggies at 200°C with harissa.",
          "Fluff couscous. Combine with veggies and chickpeas.",
        ],
      },
      snack: {
        dish: "Dates & Almonds",
        calories: 190,
        protein: 4,
        ingredients: ["4 medjool dates", "20g almonds"],
        steps: ["Pair dates and almonds for a natural energy bite."],
      },
    },
  },
  thai: {
    veg: {
      breakfast: {
        dish: "Coconut Congee with Tofu",
        calories: 310,
        protein: 12,
        ingredients: [
          "1/2 cup jasmine rice",
          "200ml coconut milk",
          "100g firm tofu",
          "ginger",
          "spring onion",
        ],
        steps: [
          "Simmer rice in coconut milk and water 20 min.",
          "Cube tofu, pan-fry, serve on congee with ginger and spring onion.",
        ],
      },
      lunch: {
        dish: "Vegetable Green Curry",
        calories: 430,
        protein: 14,
        ingredients: [
          "green curry paste",
          "coconut milk",
          "tofu",
          "eggplant",
          "bamboo shoots",
          "Thai basil",
        ],
        steps: [
          "Fry curry paste 1 min in oil.",
          "Add coconut milk, veggies, tofu — simmer 12 min. Serve with rice.",
        ],
      },
      dinner: {
        dish: "Pad See Ew (Veg)",
        calories: 460,
        protein: 15,
        ingredients: [
          "wide rice noodles",
          "Chinese broccoli",
          "egg",
          "soy sauce",
          "garlic",
          "tofu",
        ],
        steps: [
          "Stir-fry garlic and tofu.",
          "Add noodles, broccoli and sauces. Toss with egg.",
        ],
      },
      snack: {
        dish: "Mango Sticky Rice (mini)",
        calories: 230,
        protein: 3,
        ingredients: [
          "glutinous rice",
          "1/2 mango",
          "coconut cream",
          "palm sugar",
        ],
        steps: [
          "Cook sticky rice.",
          "Serve topped with mango and sweetened coconut cream.",
        ],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Thai Omelette (Khai Jiao)",
        calories: 330,
        protein: 20,
        ingredients: [
          "3 eggs",
          "fish sauce",
          "spring onion",
          "chili",
          "jasmine rice",
          "oil",
        ],
        steps: [
          "Beat eggs with fish sauce.",
          "Fry in hot oil until puffed and golden. Serve with rice.",
        ],
      },
      lunch: {
        dish: "Pad Thai with Shrimp",
        calories: 500,
        protein: 30,
        ingredients: [
          "rice noodles",
          "150g shrimp",
          "eggs",
          "bean sprouts",
          "tamarind sauce",
          "peanuts",
        ],
        steps: [
          "Soak noodles 10 min.",
          "Stir-fry shrimp, add noodles, sauce, egg, sprouts. Top with peanuts.",
        ],
      },
      dinner: {
        dish: "Thai Green Chicken Curry",
        calories: 520,
        protein: 38,
        ingredients: [
          "200g chicken thigh",
          "green curry paste",
          "coconut milk",
          "Thai basil",
          "fish sauce",
        ],
        steps: [
          "Brown chicken in curry paste.",
          "Add coconut milk, simmer 15 min. Serve with jasmine rice.",
        ],
      },
      snack: {
        dish: "Tom Yum Soup (small)",
        calories: 120,
        protein: 10,
        ingredients: [
          "shrimp",
          "lemongrass",
          "kaffir lime",
          "mushrooms",
          "fish sauce",
          "chili",
        ],
        steps: [
          "Boil broth with lemongrass and lime leaves.",
          "Add shrimp and mushrooms, cook 5 min. Season with fish sauce.",
        ],
      },
    },
    vegan: {
      breakfast: {
        dish: "Pandan Chia Pudding",
        calories: 280,
        protein: 7,
        ingredients: [
          "3 tbsp chia seeds",
          "coconut milk",
          "pandan extract",
          "mango chunks",
        ],
        steps: [
          "Mix chia with coconut milk and pandan.",
          "Refrigerate overnight. Top with mango.",
        ],
      },
      lunch: {
        dish: "Vegan Pad Thai (Tofu)",
        calories: 440,
        protein: 18,
        ingredients: [
          "rice noodles",
          "tofu",
          "bean sprouts",
          "tamarind sauce",
          "peanuts",
          "spring onion",
        ],
        steps: [
          "Stir-fry tofu until golden.",
          "Add noodles, sauce, sprouts. Top with peanuts and lime.",
        ],
      },
      dinner: {
        dish: "Massaman Veg Curry",
        calories: 450,
        protein: 13,
        ingredients: [
          "potatoes",
          "tofu",
          "massaman paste",
          "coconut milk",
          "peanuts",
          "cinnamon",
        ],
        steps: [
          "Simmer paste with coconut milk.",
          "Add potatoes and tofu, cook until tender. Top with peanuts.",
        ],
      },
      snack: {
        dish: "Fresh Spring Rolls",
        calories: 160,
        protein: 5,
        ingredients: [
          "rice paper",
          "avocado",
          "carrot",
          "cucumber",
          "mint",
          "peanut sauce",
        ],
        steps: [
          "Soak rice paper 30 seconds.",
          "Fill with veggies, roll tight. Serve with peanut sauce.",
        ],
      },
    },
  },
  greek: {
    veg: {
      breakfast: {
        dish: "Tiropita (Cheese Pie)",
        calories: 350,
        protein: 14,
        ingredients: [
          "phyllo pastry",
          "feta",
          "ricotta",
          "eggs",
          "fresh herbs",
        ],
        steps: [
          "Mix cheeses with eggs and herbs.",
          "Layer in buttered phyllo, bake 25 min at 180°C.",
        ],
      },
      lunch: {
        dish: "Greek Salad with Quinoa",
        calories: 420,
        protein: 16,
        ingredients: [
          "quinoa",
          "cucumber",
          "olives",
          "feta",
          "tomatoes",
          "red onion",
          "olive oil",
        ],
        steps: [
          "Cook quinoa and cool.",
          "Toss with all veggies, feta and olive oil dressing.",
        ],
      },
      dinner: {
        dish: "Veg Moussaka",
        calories: 490,
        protein: 18,
        ingredients: [
          "eggplant",
          "lentils",
          "tomato sauce",
          "béchamel",
          "cinnamon",
          "feta",
        ],
        steps: [
          "Layer fried eggplant with lentil ragù.",
          "Top with béchamel and feta. Bake 35 min.",
        ],
      },
      snack: {
        dish: "Feta & Olives",
        calories: 160,
        protein: 7,
        ingredients: ["40g feta", "10 Kalamata olives", "fresh thyme"],
        steps: ["Plate together and drizzle with extra virgin olive oil."],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Strapatsada (Scrambled Eggs & Tomato)",
        calories: 310,
        protein: 20,
        ingredients: [
          "3 eggs",
          "ripe tomatoes",
          "feta",
          "olive oil",
          "oregano",
        ],
        steps: [
          "Simmer crushed tomatoes 5 min.",
          "Add eggs and stir gently until just set. Top with feta.",
        ],
      },
      lunch: {
        dish: "Grilled Chicken Souvlaki Bowl",
        calories: 480,
        protein: 42,
        ingredients: [
          "200g chicken breast",
          "pita",
          "tzatziki",
          "tomatoes",
          "onion",
          "paprika",
        ],
        steps: [
          "Marinate chicken with paprika and lemon. Grill 8 min.",
          "Serve bowl-style with tzatziki and veggies.",
        ],
      },
      dinner: {
        dish: "Lamb & Vegetable Kleftiko",
        calories: 550,
        protein: 44,
        ingredients: [
          "200g lamb leg",
          "potato",
          "tomato",
          "lemon",
          "garlic",
          "herbs",
        ],
        steps: [
          "Wrap all in foil parcel with herbs.",
          "Slow-bake 2 hrs at 160°C.",
        ],
      },
      snack: {
        dish: "Loukoumades (Mini Honey Fritters)",
        calories: 190,
        protein: 4,
        ingredients: ["flour", "yeast", "honey", "cinnamon", "walnuts"],
        steps: ["Fry small dough balls.", "Drizzle with honey and cinnamon."],
      },
    },
    vegan: {
      breakfast: {
        dish: "Sesame Tahini Toast",
        calories: 300,
        protein: 9,
        ingredients: [
          "sourdough",
          "2 tbsp tahini",
          "pomegranate seeds",
          "honey alternative",
          "sesame",
        ],
        steps: [
          "Toast bread.",
          "Spread tahini, top with pomegranate and sesame.",
        ],
      },
      lunch: {
        dish: "Gigantes Plaki (Giant Beans)",
        calories: 400,
        protein: 18,
        ingredients: [
          "butter beans",
          "tomatoes",
          "garlic",
          "parsley",
          "olive oil",
          "honey",
        ],
        steps: [
          "Sauté garlic and tomatoes.",
          "Add beans, bake 40 min at 180°C.",
        ],
      },
      dinner: {
        dish: "Dolmades with Lemon Rice",
        calories: 420,
        protein: 10,
        ingredients: [
          "grape leaves",
          "rice",
          "lemon",
          "dill",
          "olive oil",
          "pine nuts",
        ],
        steps: [
          "Cook rice with herbs.",
          "Roll in grape leaves. Steam 20 min in lemon broth.",
        ],
      },
      snack: {
        dish: "Roasted Chickpeas",
        calories: 170,
        protein: 9,
        ingredients: ["100g chickpeas", "paprika", "cumin", "olive oil"],
        steps: [
          "Toss chickpeas with spices and oil.",
          "Roast at 200°C for 30 min until crispy.",
        ],
      },
    },
  },
  japanese: {
    veg: {
      breakfast: {
        dish: "Miso Soup & Rice",
        calories: 280,
        protein: 10,
        ingredients: [
          "white miso",
          "tofu",
          "wakame seaweed",
          "spring onion",
          "dashi",
          "rice",
        ],
        steps: [
          "Dissolve miso in hot dashi broth.",
          "Add tofu and wakame. Serve with steamed rice.",
        ],
      },
      lunch: {
        dish: "Veggie Sushi Rolls",
        calories: 380,
        protein: 10,
        ingredients: [
          "sushi rice",
          "nori",
          "avocado",
          "cucumber",
          "carrot",
          "soy sauce",
          "pickled ginger",
        ],
        steps: [
          "Spread rice on nori.",
          "Add filling, roll tight with bamboo mat. Slice and serve.",
        ],
      },
      dinner: {
        dish: "Vegetable Ramen",
        calories: 430,
        protein: 15,
        ingredients: [
          "ramen noodles",
          "miso broth",
          "mushrooms",
          "bok choy",
          "corn",
          "tofu",
          "sesame oil",
        ],
        steps: [
          "Simmer broth with miso.",
          "Cook noodles, add toppings, drizzle sesame oil.",
        ],
      },
      snack: {
        dish: "Edamame with Sea Salt",
        calories: 120,
        protein: 11,
        ingredients: ["100g edamame in pods", "sea salt", "sesame oil"],
        steps: [
          "Boil edamame 5 min.",
          "Toss with sea salt and a drop of sesame oil.",
        ],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Tamagoyaki with Miso Soup",
        calories: 340,
        protein: 22,
        ingredients: ["3 eggs", "mirin", "soy sauce", "dashi", "miso", "tofu"],
        steps: [
          "Roll seasoned egg layers in pan to create tamagoyaki.",
          "Serve with miso soup on the side.",
        ],
      },
      lunch: {
        dish: "Salmon Sashimi Bowl",
        calories: 460,
        protein: 38,
        ingredients: [
          "150g salmon",
          "sushi rice",
          "avocado",
          "edamame",
          "cucumber",
          "soy sauce",
        ],
        steps: [
          "Slice salmon thin.",
          "Arrange over rice with veggies. Drizzle soy sauce.",
        ],
      },
      dinner: {
        dish: "Chicken Teriyaki & Rice",
        calories: 520,
        protein: 42,
        ingredients: [
          "200g chicken thigh",
          "teriyaki sauce",
          "soy",
          "mirin",
          "ginger",
          "jasmine rice",
        ],
        steps: [
          "Marinate chicken in teriyaki sauce.",
          "Pan-fry 4 min each side. Serve with rice and sesame seeds.",
        ],
      },
      snack: {
        dish: "Gyoza (Pan-fried Dumplings)",
        calories: 220,
        protein: 14,
        ingredients: [
          "pork mince",
          "cabbage",
          "gyoza wrappers",
          "ginger",
          "soy sauce",
        ],
        steps: [
          "Fill wrappers with pork-cabbage mix.",
          "Pan-fry until crispy bottom, steam finish.",
        ],
      },
    },
    vegan: {
      breakfast: {
        dish: "Tofu Scramble with Nori",
        calories: 260,
        protein: 16,
        ingredients: [
          "firm tofu",
          "nori sheets",
          "turmeric",
          "soy sauce",
          "spring onion",
        ],
        steps: [
          "Crumble tofu and fry with turmeric and soy.",
          "Serve with torn nori strips.",
        ],
      },
      lunch: {
        dish: "Inari Tofu Pockets",
        calories: 350,
        protein: 12,
        ingredients: [
          "inari tofu pockets",
          "sushi rice",
          "sesame",
          "cucumber",
          "pickled ginger",
        ],
        steps: [
          "Fill inari pockets with seasoned rice.",
          "Top with sesame and serve with pickled ginger.",
        ],
      },
      dinner: {
        dish: "Vegan Shoyu Ramen",
        calories: 400,
        protein: 14,
        ingredients: [
          "ramen noodles",
          "shoyu broth",
          "mushrooms",
          "bamboo shoots",
          "nori",
          "tofu",
        ],
        steps: [
          "Simmer broth with mushrooms 20 min.",
          "Cook noodles, assemble with toppings.",
        ],
      },
      snack: {
        dish: "Onigiri (Rice Ball)",
        calories: 180,
        protein: 4,
        ingredients: [
          "sushi rice",
          "nori",
          "umeboshi or sesame filling",
          "salt",
        ],
        steps: ["Mold seasoned rice into triangle.", "Wrap with nori strip."],
      },
    },
  },
  italian: {
    veg: {
      breakfast: {
        dish: "Bruschetta with Ricotta",
        calories: 300,
        protein: 12,
        ingredients: [
          "ciabatta",
          "ricotta",
          "cherry tomatoes",
          "basil",
          "olive oil",
          "balsamic",
        ],
        steps: [
          "Toast ciabatta.",
          "Spread ricotta, top with tomatoes, basil and balsamic drizzle.",
        ],
      },
      lunch: {
        dish: "Caprese & Minestrone",
        calories: 420,
        protein: 16,
        ingredients: [
          "fresh mozzarella",
          "tomatoes",
          "basil",
          "mixed veg",
          "pasta",
          "vegetable broth",
        ],
        steps: [
          "Layer caprese with olive oil.",
          "Simmer minestrone 20 min. Serve together.",
        ],
      },
      dinner: {
        dish: "Mushroom Risotto",
        calories: 500,
        protein: 14,
        ingredients: [
          "arborio rice",
          "mushrooms",
          "white wine",
          "parmesan",
          "shallots",
          "vegetable stock",
        ],
        steps: [
          "Sauté shallots and mushrooms.",
          "Add rice, wine, ladle stock gradually. Finish with parmesan.",
        ],
      },
      snack: {
        dish: "Bruschetta al Pomodoro",
        calories: 160,
        protein: 4,
        ingredients: [
          "bread slices",
          "tomatoes",
          "garlic",
          "basil",
          "olive oil",
        ],
        steps: ["Toast bread, rub with garlic.", "Top with tomato and basil."],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Frittata with Prosciutto",
        calories: 360,
        protein: 26,
        ingredients: [
          "4 eggs",
          "prosciutto",
          "cherry tomatoes",
          "parmesan",
          "herbs",
        ],
        steps: [
          "Fry prosciutto briefly.",
          "Pour seasoned eggs over, oven-bake 10 min at 180°C.",
        ],
      },
      lunch: {
        dish: "Chicken Piccata with Pasta",
        calories: 520,
        protein: 40,
        ingredients: [
          "200g chicken breast",
          "lemon",
          "capers",
          "pasta",
          "white wine",
          "parsley",
        ],
        steps: [
          "Pound chicken thin, dredge in flour, pan-fry.",
          "Deglaze with lemon-wine sauce with capers. Serve with pasta.",
        ],
      },
      dinner: {
        dish: "Salmon with Lemon Butter Pasta",
        calories: 560,
        protein: 42,
        ingredients: [
          "200g salmon",
          "linguine",
          "butter",
          "lemon",
          "garlic",
          "parsley",
        ],
        steps: [
          "Pan-fry salmon 4 min per side.",
          "Toss pasta in lemon-garlic butter. Serve together.",
        ],
      },
      snack: {
        dish: "Antipasto Plate",
        calories: 200,
        protein: 12,
        ingredients: [
          "cured meat slices",
          "olives",
          "sun-dried tomatoes",
          "grissini",
        ],
        steps: ["Arrange on a plate and serve."],
      },
    },
    vegan: {
      breakfast: {
        dish: "Avocado Sourdough with Pesto",
        calories: 340,
        protein: 8,
        ingredients: [
          "sourdough",
          "avocado",
          "vegan pesto",
          "pine nuts",
          "lemon",
        ],
        steps: [
          "Toast sourdough.",
          "Spread pesto, top with mashed avocado and pine nuts.",
        ],
      },
      lunch: {
        dish: "Pasta e Fagioli (Bean Pasta)",
        calories: 430,
        protein: 18,
        ingredients: [
          "pasta",
          "cannellini beans",
          "tomatoes",
          "rosemary",
          "garlic",
          "olive oil",
        ],
        steps: [
          "Sauté garlic and rosemary.",
          "Add beans and tomatoes, simmer 15 min. Add pasta to cook in broth.",
        ],
      },
      dinner: {
        dish: "Vegetable Lasagna (Vegan)",
        calories: 470,
        protein: 16,
        ingredients: [
          "lasagna sheets",
          "zucchini",
          "aubergine",
          "tomato sauce",
          "cashew béchamel",
        ],
        steps: [
          "Layer roasted veg with tomato sauce and cashew béchamel.",
          "Bake 40 min at 180°C.",
        ],
      },
      snack: {
        dish: "Marinated Olives",
        calories: 120,
        protein: 1,
        ingredients: [
          "mixed olives",
          "rosemary",
          "lemon zest",
          "garlic",
          "olive oil",
        ],
        steps: [
          "Toss olives in herbs and olive oil.",
          "Rest 10 min for flavors to develop.",
        ],
      },
    },
  },
  korean: {
    veg: {
      breakfast: {
        dish: "Tofu Doenjang Jjigae",
        calories: 280,
        protein: 16,
        ingredients: [
          "tofu",
          "zucchini",
          "mushrooms",
          "doenjang paste",
          "sesame oil",
          "spring onion",
        ],
        steps: [
          "Boil water with doenjang paste.",
          "Add veggies and tofu, simmer 10 min. Drizzle sesame oil.",
        ],
      },
      lunch: {
        dish: "Vegetable Bibimbap",
        calories: 450,
        protein: 14,
        ingredients: [
          "rice",
          "spinach",
          "carrot",
          "mushrooms",
          "bean sprouts",
          "gochujang",
          "sesame oil",
          "egg",
        ],
        steps: [
          "Sauté each veggie separately.",
          "Arrange over rice with egg and gochujang. Mix before eating.",
        ],
      },
      dinner: {
        dish: "Kimchi Jeon (Pancake)",
        calories: 380,
        protein: 12,
        ingredients: [
          "kimchi",
          "flour",
          "egg",
          "soy sauce",
          "sesame oil",
          "spring onion",
        ],
        steps: [
          "Mix batter with kimchi.",
          "Fry pancake 3 min each side until crispy.",
        ],
      },
      snack: {
        dish: "Hotteok (Cinnamon Pancake)",
        calories: 210,
        protein: 4,
        ingredients: [
          "flour",
          "yeast",
          "cinnamon",
          "brown sugar",
          "sesame seeds",
        ],
        steps: [
          "Make sweet dough.",
          "Pan-fry until golden and syrup oozes out.",
        ],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Gyeran Mari (Egg Roll)",
        calories: 290,
        protein: 20,
        ingredients: ["3 eggs", "carrot", "spring onion", "ham", "sesame oil"],
        steps: [
          "Mix egg with fillings.",
          "Roll in pan layer by layer. Slice into rounds.",
        ],
      },
      lunch: {
        dish: "Dakgalbi (Spicy Chicken Stir-fry)",
        calories: 480,
        protein: 42,
        ingredients: [
          "200g chicken thigh",
          "gochujang",
          "rice cakes",
          "cabbage",
          "sesame oil",
        ],
        steps: [
          "Marinate chicken with gochujang.",
          "Stir-fry with rice cakes and cabbage 12 min.",
        ],
      },
      dinner: {
        dish: "Bulgogi with Rice",
        calories: 540,
        protein: 40,
        ingredients: [
          "200g beef sirloin",
          "soy sauce",
          "sesame oil",
          "garlic",
          "ginger",
          "pear",
          "rice",
        ],
        steps: [
          "Marinate sliced beef 30 min.",
          "Grill or pan-fry 5 min. Serve with steamed rice.",
        ],
      },
      snack: {
        dish: "Kimbap Rolls",
        calories: 240,
        protein: 12,
        ingredients: [
          "rice",
          "nori",
          "carrot",
          "spinach",
          "tuna",
          "sesame seeds",
        ],
        steps: [
          "Layer rice on nori.",
          "Add fillings, roll tight, slice into rounds.",
        ],
      },
    },
    vegan: {
      breakfast: {
        dish: "Juk (Rice Porridge) with Vegetables",
        calories: 250,
        protein: 7,
        ingredients: [
          "rice",
          "mushrooms",
          "soy sauce",
          "sesame oil",
          "ginger",
          "spring onion",
        ],
        steps: [
          "Simmer rice with 5x water and mushrooms 30 min.",
          "Season with soy and sesame. Top with spring onion.",
        ],
      },
      lunch: {
        dish: "Vegan Bibimbap with Tempeh",
        calories: 440,
        protein: 20,
        ingredients: [
          "rice",
          "tempeh",
          "spinach",
          "carrot",
          "gochujang",
          "sesame oil",
        ],
        steps: [
          "Sauté tempeh with soy sauce.",
          "Arrange with veggies over rice with gochujang.",
        ],
      },
      dinner: {
        dish: "Sundubu Jjigae (Soft Tofu Stew)",
        calories: 350,
        protein: 18,
        ingredients: [
          "soft tofu",
          "gochugaru",
          "mushrooms",
          "zucchini",
          "soy sauce",
          "sesame oil",
        ],
        steps: [
          "Fry gochugaru in sesame oil.",
          "Add broth, veggies, tofu — simmer 10 min.",
        ],
      },
      snack: {
        dish: "Seasoned Seaweed",
        calories: 80,
        protein: 3,
        ingredients: [
          "dried seaweed",
          "sesame oil",
          "sea salt",
          "sesame seeds",
        ],
        steps: [
          "Tear seaweed into pieces.",
          "Toss with sesame oil and sea salt.",
        ],
      },
    },
  },
  "middle-eastern": {
    veg: {
      breakfast: {
        dish: "Ful Medames (Fava Beans)",
        calories: 320,
        protein: 16,
        ingredients: [
          "fava beans",
          "lemon",
          "garlic",
          "olive oil",
          "cumin",
          "pita",
        ],
        steps: [
          "Warm beans with garlic and cumin.",
          "Mash slightly, season with lemon. Serve with pita.",
        ],
      },
      lunch: {
        dish: "Falafel Wrap",
        calories: 480,
        protein: 18,
        ingredients: [
          "6 falafel balls",
          "pita",
          "hummus",
          "tabouleh",
          "tahini",
          "pickled turnips",
        ],
        steps: [
          "Warm falafel and pita.",
          "Fill pita with falafel, hummus and salad.",
        ],
      },
      dinner: {
        dish: "Mujaddara with Flatbread",
        calories: 450,
        protein: 18,
        ingredients: [
          "lentils",
          "rice",
          "caramelized onions",
          "cumin",
          "olive oil",
          "yogurt",
        ],
        steps: [
          "Cook lentils and rice.",
          "Top with deeply caramelized onions and serve with yogurt.",
        ],
      },
      snack: {
        dish: "Baklava (1 piece)",
        calories: 200,
        protein: 3,
        ingredients: ["phyllo", "walnuts", "honey", "cinnamon", "butter"],
        steps: [
          "Layer phyllo with nut mixture.",
          "Bake and soak in honey syrup.",
        ],
      },
    },
    "non-veg": {
      breakfast: {
        dish: "Shakshuka with Lamb",
        calories: 420,
        protein: 28,
        ingredients: [
          "3 eggs",
          "lamb mince",
          "tomatoes",
          "harissa",
          "cumin",
          "feta",
        ],
        steps: [
          "Brown lamb with spices.",
          "Add tomatoes, simmer 5 min. Crack eggs, cover and cook.",
        ],
      },
      lunch: {
        dish: "Chicken Shawarma Bowl",
        calories: 520,
        protein: 44,
        ingredients: [
          "200g chicken thigh",
          "shawarma spice",
          "rice",
          "tahini",
          "garlic sauce",
          "parsley",
        ],
        steps: [
          "Marinate and grill chicken.",
          "Slice and serve over rice with tahini and parsley.",
        ],
      },
      dinner: {
        dish: "Mansaf (Lamb & Yogurt Rice)",
        calories: 600,
        protein: 46,
        ingredients: [
          "lamb chunks",
          "jameed yogurt sauce",
          "rice",
          "almonds",
          "parsley",
        ],
        steps: [
          "Slow-cook lamb in jameed broth.",
          "Serve over rice with almonds and parsley.",
        ],
      },
      snack: {
        dish: "Kibbeh (Baked)",
        calories: 240,
        protein: 14,
        ingredients: [
          "bulgur wheat",
          "lamb mince",
          "onion",
          "pine nuts",
          "spices",
        ],
        steps: [
          "Mix bulgur with lamb and spices.",
          "Shape into ovals and bake 25 min.",
        ],
      },
    },
    vegan: {
      breakfast: {
        dish: "Msabbaha (Warm Chickpeas)",
        calories: 300,
        protein: 14,
        ingredients: [
          "chickpeas",
          "tahini",
          "lemon",
          "cumin",
          "olive oil",
          "parsley",
        ],
        steps: [
          "Warm chickpeas.",
          "Mix with tahini and lemon. Top with cumin and olive oil.",
        ],
      },
      lunch: {
        dish: "Vegan Stuffed Peppers",
        calories: 420,
        protein: 14,
        ingredients: [
          "bell peppers",
          "quinoa",
          "lentils",
          "tomatoes",
          "baharat",
          "pine nuts",
        ],
        steps: [
          "Mix quinoa and lentils with spices.",
          "Fill peppers and bake 30 min at 180°C.",
        ],
      },
      dinner: {
        dish: "Roasted Cauliflower with Chermoula",
        calories: 380,
        protein: 10,
        ingredients: [
          "cauliflower",
          "chermoula sauce",
          "chickpeas",
          "lemon",
          "coriander",
        ],
        steps: [
          "Roast cauliflower florets 25 min.",
          "Toss with chermoula and chickpeas.",
        ],
      },
      snack: {
        dish: "Medjool Dates with Tahini",
        calories: 220,
        protein: 4,
        ingredients: ["4 medjool dates", "tahini", "sesame seeds"],
        steps: ["Fill dates with tahini.", "Sprinkle sesame seeds."],
      },
    },
  },
};

export function getRecipePlan(dietStyle: string, dietPref: string): DayPlan {
  const style = RECIPE_PLANS[dietStyle] ?? RECIPE_PLANS.balanced;
  const pref = style[dietPref] ?? style.veg;
  return pref;
}

// ============ NEW CUISINES ============

export interface HealthierSwap {
  name: string;
  reason: string;
  calories: number;
  protein: number;
}

export interface FoodScanResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  healthierSwaps: HealthierSwap[];
}

interface FoodScanDBEntry {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  healthierSwap: HealthierSwap;
  additionalSwaps?: HealthierSwap[];
}

const FOOD_SCAN_DB: Record<string, FoodScanDBEntry> = {
  pizza: {
    calories: 570,
    protein: 23,
    carbs: 66,
    fats: 22,
    fiber: 3,
    healthierSwap: {
      name: "Whole-wheat thin crust pizza with veggies",
      reason: "Lower fat, more fiber, similar satisfaction",
      calories: 400,
      protein: 20,
    },
  },
  burger: {
    calories: 540,
    protein: 26,
    carbs: 46,
    fats: 28,
    fiber: 2,
    healthierSwap: {
      name: "Grilled chicken lettuce wrap",
      reason: "Same protein, far fewer calories and carbs",
      calories: 350,
      protein: 32,
    },
  },
  "fried chicken": {
    calories: 490,
    protein: 35,
    carbs: 28,
    fats: 25,
    fiber: 1,
    healthierSwap: {
      name: "Baked herb chicken breast",
      reason: "Same protein without the deep-fry oil calories",
      calories: 280,
      protein: 36,
    },
  },
  rice: {
    calories: 200,
    protein: 4,
    carbs: 44,
    fats: 1,
    fiber: 1,
    healthierSwap: {
      name: "Brown rice or cauliflower rice",
      reason: "More fiber and micronutrients",
      calories: 180,
      protein: 4,
    },
  },
  bread: {
    calories: 160,
    protein: 5,
    carbs: 30,
    fats: 2,
    fiber: 2,
    healthierSwap: {
      name: "Whole-grain sourdough",
      reason: "More fiber, lower glycemic index",
      calories: 140,
      protein: 6,
    },
  },
  pasta: {
    calories: 350,
    protein: 12,
    carbs: 68,
    fats: 3,
    fiber: 3,
    healthierSwap: {
      name: "Zucchini noodles or whole-wheat pasta",
      reason: "Lower carbs and more vitamins",
      calories: 220,
      protein: 10,
    },
  },
  "ice cream": {
    calories: 280,
    protein: 4,
    carbs: 38,
    fats: 14,
    fiber: 0,
    healthierSwap: {
      name: "Frozen Greek yogurt bark with berries",
      reason: "More protein, less sugar, same cold treat vibe",
      calories: 180,
      protein: 10,
    },
  },
  fries: {
    calories: 365,
    protein: 4,
    carbs: 47,
    fats: 18,
    fiber: 4,
    healthierSwap: {
      name: "Air-fried sweet potato fries",
      reason: "More fiber and vitamins, less oil",
      calories: 220,
      protein: 3,
    },
  },
  soda: {
    calories: 150,
    protein: 0,
    carbs: 39,
    fats: 0,
    fiber: 0,
    healthierSwap: {
      name: "Sparkling water with lemon",
      reason: "Zero sugar, same fizz without empty calories",
      calories: 0,
      protein: 0,
    },
  },
  samosa: {
    calories: 260,
    protein: 5,
    carbs: 28,
    fats: 15,
    fiber: 2,
    healthierSwap: {
      name: "Baked samosa with whole-wheat crust",
      reason: "Baked instead of fried, cuts fat by 60%",
      calories: 160,
      protein: 5,
    },
  },
  biryani: {
    calories: 520,
    protein: 22,
    carbs: 68,
    fats: 15,
    fiber: 3,
    healthierSwap: {
      name: "Brown rice pulao with grilled chicken",
      reason: "More fiber, lower glycemic, similar flavors",
      calories: 400,
      protein: 28,
    },
  },
  curry: {
    calories: 380,
    protein: 20,
    carbs: 24,
    fats: 20,
    fiber: 4,
    healthierSwap: {
      name: "Light coconut milk curry with extra veggies",
      reason: "Halve the fat by using light coconut milk",
      calories: 260,
      protein: 20,
    },
  },
  noodles: {
    calories: 350,
    protein: 10,
    carbs: 60,
    fats: 8,
    fiber: 2,
    healthierSwap: {
      name: "Shirataki or buckwheat noodles",
      reason: "Much lower carbs, similar texture",
      calories: 200,
      protein: 8,
    },
  },
  ramen: {
    calories: 430,
    protein: 18,
    carbs: 55,
    fats: 14,
    fiber: 2,
    healthierSwap: {
      name: "Miso broth ramen with tofu and veggies",
      reason: "Lower calories, more nutrients from vegetables",
      calories: 300,
      protein: 16,
    },
  },
  sushi: {
    calories: 300,
    protein: 18,
    carbs: 42,
    fats: 6,
    fiber: 2,
    healthierSwap: {
      name: "Sashimi (no rice) with edamame",
      reason: "Same fish protein without the refined rice calories",
      calories: 200,
      protein: 22,
    },
  },
  "pad thai": {
    calories: 480,
    protein: 20,
    carbs: 62,
    fats: 15,
    fiber: 3,
    healthierSwap: {
      name: "Zucchini noodle pad thai with extra shrimp",
      reason: "Cut carbs by half, boost protein",
      calories: 320,
      protein: 26,
    },
  },
  dosa: {
    calories: 170,
    protein: 4,
    carbs: 30,
    fats: 4,
    fiber: 1,
    healthierSwap: {
      name: "Ragi (millet) dosa with sambar",
      reason: "More fiber and minerals than plain rice dosa",
      calories: 160,
      protein: 5,
    },
  },
  idli: {
    calories: 120,
    protein: 3,
    carbs: 24,
    fats: 1,
    fiber: 1,
    healthierSwap: {
      name: "Oat idli with sambar",
      reason: "More fiber, same comfort, great for digestion",
      calories: 110,
      protein: 4,
    },
  },
  chapati: {
    calories: 100,
    protein: 3,
    carbs: 18,
    fats: 2,
    fiber: 2,
    healthierSwap: {
      name: "Multigrain or jowar roti",
      reason: "Higher fiber and minerals than white wheat",
      calories: 95,
      protein: 4,
    },
  },
  dal: {
    calories: 180,
    protein: 10,
    carbs: 26,
    fats: 4,
    fiber: 8,
    healthierSwap: {
      name: "Sprouted lentil salad",
      reason: "More bioavailable nutrients when sprouted",
      calories: 160,
      protein: 12,
    },
  },
  paneer: {
    calories: 260,
    protein: 18,
    carbs: 3,
    fats: 20,
    fiber: 0,
    healthierSwap: {
      name: "Tofu tikka or low-fat paneer",
      reason: "Same protein, significantly less saturated fat",
      calories: 180,
      protein: 18,
    },
  },
  egg: {
    calories: 140,
    protein: 12,
    carbs: 1,
    fats: 10,
    fiber: 0,
    healthierSwap: {
      name: "2 egg whites + 1 yolk omelette with veggies",
      reason: "Same protein with 40% fewer calories",
      calories: 90,
      protein: 12,
    },
  },
  "chicken breast": {
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 4,
    fiber: 0,
    healthierSwap: {
      name: "Steamed fish fillet",
      reason: "Lighter option with omega-3 benefits",
      calories: 140,
      protein: 28,
    },
  },
  salmon: {
    calories: 250,
    protein: 30,
    carbs: 0,
    fats: 14,
    fiber: 0,
    healthierSwap: {
      name: "Grilled salmon with herbs (no butter)",
      reason: "Same omega-3s without extra cooking fat",
      calories: 200,
      protein: 30,
    },
  },
  banana: {
    calories: 90,
    protein: 1,
    carbs: 22,
    fats: 0,
    fiber: 3,
    healthierSwap: {
      name: "Half banana + tablespoon almond butter",
      reason: "Add protein and healthy fat to slow sugar spike",
      calories: 145,
      protein: 4,
    },
  },
  apple: {
    calories: 80,
    protein: 0,
    carbs: 21,
    fats: 0,
    fiber: 4,
    healthierSwap: {
      name: "Apple slices with peanut butter",
      reason: "Adding protein makes it a balanced snack",
      calories: 160,
      protein: 5,
    },
  },
  nuts: {
    calories: 180,
    protein: 5,
    carbs: 6,
    fats: 16,
    fiber: 2,
    healthierSwap: {
      name: "Mixed nuts (unsalted, no honey roast)",
      reason: "Same fats and fiber without added sugar/salt",
      calories: 170,
      protein: 5,
    },
  },
  yogurt: {
    calories: 150,
    protein: 8,
    carbs: 17,
    fats: 5,
    fiber: 0,
    healthierSwap: {
      name: "Plain Greek yogurt",
      reason: "2x more protein, less sugar than flavored yogurt",
      calories: 130,
      protein: 17,
    },
  },
  milk: {
    calories: 150,
    protein: 8,
    carbs: 12,
    fats: 8,
    fiber: 0,
    healthierSwap: {
      name: "Skimmed milk or unsweetened oat milk",
      reason: "Same calcium with less saturated fat",
      calories: 90,
      protein: 7,
    },
  },
  "chocolate bar": {
    calories: 230,
    protein: 3,
    carbs: 26,
    fats: 13,
    fiber: 2,
    healthierSwap: {
      name: "Dark chocolate (70%+) 2 squares",
      reason: "More antioxidants, less sugar, mindful portion",
      calories: 100,
      protein: 2,
    },
  },
  chips: {
    calories: 160,
    protein: 2,
    carbs: 15,
    fats: 10,
    fiber: 1,
    healthierSwap: {
      name: "Baked kale chips or rice cakes",
      reason: "Crunch without the heavy oil load",
      calories: 80,
      protein: 2,
    },
  },
  cookie: {
    calories: 190,
    protein: 2,
    carbs: 26,
    fats: 9,
    fiber: 1,
    healthierSwap: {
      name: "Oat energy ball with dates and nuts",
      reason: "Natural sugars, fiber, and no processed flour",
      calories: 150,
      protein: 4,
    },
  },
  donut: {
    calories: 290,
    protein: 4,
    carbs: 35,
    fats: 16,
    fiber: 1,
    healthierSwap: {
      name: "Baked whole-wheat banana muffin",
      reason: "Natural sweetness, fiber, no deep-fry oil",
      calories: 180,
      protein: 5,
    },
  },
  sandwich: {
    calories: 380,
    protein: 18,
    carbs: 42,
    fats: 14,
    fiber: 3,
    healthierSwap: {
      name: "Whole-grain wrap with grilled chicken and avocado",
      reason: "More fiber and healthy fats, less refined carbs",
      calories: 340,
      protein: 24,
    },
  },
  oats: {
    calories: 150,
    protein: 5,
    carbs: 27,
    fats: 3,
    fiber: 4,
    healthierSwap: {
      name: "Steel-cut oats with berries and seeds",
      reason: "Lower GI than instant oats, more fiber",
      calories: 180,
      protein: 7,
    },
  },
  cereal: {
    calories: 200,
    protein: 4,
    carbs: 42,
    fats: 2,
    fiber: 2,
    healthierSwap: {
      name: "Muesli with nuts and no added sugar",
      reason: "More fiber and protein, no refined sugar",
      calories: 210,
      protein: 7,
    },
  },
  waffle: {
    calories: 310,
    protein: 7,
    carbs: 42,
    fats: 13,
    fiber: 1,
    healthierSwap: {
      name: "Protein oat waffle with Greek yogurt",
      reason: "Triple the protein with similar calories",
      calories: 280,
      protein: 20,
    },
  },
  lasagna: {
    calories: 550,
    protein: 24,
    carbs: 52,
    fats: 26,
    fiber: 3,
    healthierSwap: {
      name: "Zucchini layer lasagna with lean turkey mince",
      reason: "Cut carbs with veggie layers, leaner protein",
      calories: 400,
      protein: 28,
    },
  },
  steak: {
    calories: 480,
    protein: 42,
    carbs: 0,
    fats: 32,
    fiber: 0,
    healthierSwap: {
      name: "Grilled sirloin or lean flank steak",
      reason: "Same iron and protein, significantly less fat",
      calories: 300,
      protein: 40,
    },
  },
  hotdog: {
    calories: 290,
    protein: 11,
    carbs: 24,
    fats: 17,
    fiber: 1,
    healthierSwap: {
      name: "Turkey dog in whole-wheat bun with mustard",
      reason: "Less processed meat and fat, more fiber",
      calories: 210,
      protein: 13,
    },
  },
  taco: {
    calories: 370,
    protein: 18,
    carbs: 38,
    fats: 17,
    fiber: 4,
    healthierSwap: {
      name: "Lettuce wrap fish taco with salsa",
      reason: "Skip the shell calories, add omega-3",
      calories: 260,
      protein: 22,
    },
  },
  burrito: {
    calories: 580,
    protein: 26,
    carbs: 68,
    fats: 20,
    fiber: 6,
    healthierSwap: {
      name: "Burrito bowl (no tortilla) with cauliflower rice",
      reason: "All the flavor, cut carbs by 60%",
      calories: 380,
      protein: 28,
    },
  },
  hummus: {
    calories: 130,
    protein: 5,
    carbs: 15,
    fats: 7,
    fiber: 4,
    healthierSwap: {
      name: "Hummus is already great — try with veggies not chips",
      reason: "Keep the hummus, swap crackers for cucumber",
      calories: 130,
      protein: 5,
    },
  },
  avocado: {
    calories: 230,
    protein: 3,
    carbs: 12,
    fats: 21,
    fiber: 10,
    healthierSwap: {
      name: "Avocado is excellent — enjoy mindfully",
      reason: "Healthy monounsaturated fats and fiber-rich",
      calories: 230,
      protein: 3,
    },
  },
  smoothie: {
    calories: 280,
    protein: 6,
    carbs: 52,
    fats: 4,
    fiber: 5,
    healthierSwap: {
      name: "Green protein smoothie with spinach and Greek yogurt",
      reason: "More protein and greens, less fruit sugar",
      calories: 220,
      protein: 18,
    },
  },
  "fried rice": {
    calories: 380,
    protein: 12,
    carbs: 52,
    fats: 14,
    fiber: 2,
    healthierSwap: {
      name: "Cauliflower fried rice with egg",
      reason: "Quarter the carbs, same satisfying flavors",
      calories: 220,
      protein: 14,
    },
  },
  "spring roll": {
    calories: 200,
    protein: 6,
    carbs: 26,
    fats: 9,
    fiber: 2,
    healthierSwap: {
      name: "Fresh rice paper rolls (not fried)",
      reason: "Same veggies and protein, no deep-fry oil",
      calories: 120,
      protein: 6,
    },
  },
};

const GENERAL_SWAPS: HealthierSwap[] = [
  {
    name: "Steamed or grilled version",
    reason: "Cooking without oil cuts 100–200 kcal instantly",
    calories: 0,
    protein: 0,
  },
  {
    name: "Half portion with a side salad",
    reason: "Reduces calorie density while keeping you full",
    calories: 0,
    protein: 0,
  },
  {
    name: "Whole-grain or high-fiber alternative",
    reason: "More fiber slows digestion and keeps energy steady",
    calories: 0,
    protein: 0,
  },
];

function buildSwaps(
  entry: FoodScanDBEntry,
  mainCalories: number,
): HealthierSwap[] {
  const swaps: HealthierSwap[] = [];
  // Primary swap
  swaps.push(entry.healthierSwap);
  // Additional curated swaps if present
  if (entry.additionalSwaps) {
    swaps.push(...entry.additionalSwaps);
  }
  // Fill up to 4 with general suggestions that make sense
  if (swaps.length < 4) {
    const general = GENERAL_SWAPS.filter(
      (s) => !swaps.some((x) => x.name === s.name),
    );
    for (const g of general) {
      if (swaps.length >= 4) break;
      const approxCal = Math.round(mainCalories * 0.65);
      swaps.push({
        ...g,
        calories: approxCal,
        protein: entry.healthierSwap.protein,
      });
    }
  }
  return swaps.slice(0, 5);
}

export function getFoodScanResult(foodName: string): FoodScanResult {
  const key = foodName.toLowerCase().trim();
  // Try exact match
  if (FOOD_SCAN_DB[key]) {
    const entry = FOOD_SCAN_DB[key];
    return {
      foodName,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fats: entry.fats,
      fiber: entry.fiber,
      healthierSwaps: buildSwaps(entry, entry.calories),
    };
  }
  // Partial match
  for (const [dbKey, entry] of Object.entries(FOOD_SCAN_DB)) {
    if (key.includes(dbKey) || dbKey.includes(key)) {
      return {
        foodName,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fats: entry.fats,
        fiber: entry.fiber,
        healthierSwaps: buildSwaps(entry, entry.calories),
      };
    }
  }
  // Default approximate
  const defaultCal = 350;
  return {
    foodName,
    calories: defaultCal,
    protein: 12,
    carbs: 40,
    fats: 14,
    fiber: 3,
    healthierSwaps: [
      {
        name: `Grilled or baked ${foodName}`,
        reason: "Try grilled or steamed instead of fried, cuts fat by 40%",
        calories: Math.round(defaultCal * 0.7),
        protein: 12,
      },
      {
        name: "Half portion with side salad",
        reason: "Reduces calorie density while keeping you full",
        calories: Math.round(defaultCal * 0.6),
        protein: 10,
      },
      {
        name: "Whole-grain or higher-fiber version",
        reason: "More fiber keeps blood sugar steady",
        calories: Math.round(defaultCal * 0.8),
        protein: 14,
      },
    ],
  };
}

// ============================================================
// Ingredient Recipe Generator
// ============================================================

export interface IngredientRecipe {
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  cuisine: string;
  ingredients: string[];
  steps: string[];
  tags: string[];
}

const INGREDIENT_RECIPE_DB: IngredientRecipe[] = [
  // Balanced
  {
    name: "Quinoa Buddha Bowl",
    emoji: "🥗",
    calories: 420,
    protein: 18,
    cuisine: "balanced",
    ingredients: [
      "quinoa",
      "chickpeas",
      "roasted vegetables",
      "tahini dressing",
      "avocado",
    ],
    steps: [
      "Cook quinoa and roast vegetables at 200°C for 20 min.",
      "Arrange quinoa, chickpeas, and vegetables in a bowl.",
      "Drizzle with tahini and top with avocado slices.",
    ],
    tags: ["vegetarian", "weight-loss", "high-protein"],
  },
  {
    name: "Grilled Chicken Salad",
    emoji: "🥙",
    calories: 380,
    protein: 38,
    cuisine: "balanced",
    ingredients: [
      "chicken breast",
      "mixed greens",
      "tomato",
      "cucumber",
      "olive oil",
    ],
    steps: [
      "Season and grill chicken breast 6 min per side.",
      "Slice and place over mixed greens.",
      "Toss with olive oil, tomato, and cucumber.",
    ],
    tags: ["high-protein", "weight-loss", "low-carb"],
  },
  {
    name: "Turkey & Veggie Wrap",
    emoji: "🌯",
    calories: 350,
    protein: 28,
    cuisine: "balanced",
    ingredients: [
      "turkey breast",
      "whole wheat wrap",
      "spinach",
      "bell pepper",
      "hummus",
    ],
    steps: [
      "Spread hummus on wrap.",
      "Layer turkey, spinach, and bell pepper.",
      "Roll tightly and slice in half.",
    ],
    tags: ["high-protein", "quick"],
  },
  {
    name: "Lentil Soup",
    emoji: "🍲",
    calories: 310,
    protein: 16,
    cuisine: "balanced",
    ingredients: ["red lentils", "carrot", "onion", "garlic", "cumin"],
    steps: [
      "Sauté onion, garlic, and carrot until soft.",
      "Add lentils, cumin, and water; simmer 20 min.",
      "Blend half the soup for a creamy texture.",
    ],
    tags: ["vegetarian", "weight-loss", "recovery"],
  },
  {
    name: "Egg White Veggie Omelette",
    emoji: "🍳",
    calories: 220,
    protein: 26,
    cuisine: "balanced",
    ingredients: [
      "egg whites",
      "spinach",
      "mushroom",
      "bell pepper",
      "olive oil",
    ],
    steps: [
      "Whisk egg whites with salt and pepper.",
      "Cook vegetables in olive oil 3 min.",
      "Pour in egg whites, fold once set.",
    ],
    tags: ["high-protein", "low-carb", "quick"],
  },
  {
    name: "Baked Salmon with Greens",
    emoji: "🐟",
    calories: 440,
    protein: 40,
    cuisine: "balanced",
    ingredients: ["salmon fillet", "broccoli", "lemon", "garlic", "olive oil"],
    steps: [
      "Marinate salmon in lemon, garlic, olive oil 10 min.",
      "Bake at 200°C for 15 min.",
      "Steam broccoli and serve alongside.",
    ],
    tags: ["high-protein", "post-workout", "omega-3"],
  },
  // Indian
  {
    name: "Chicken Tikka Masala",
    emoji: "🍛",
    calories: 520,
    protein: 36,
    cuisine: "indian",
    ingredients: [
      "chicken",
      "tomato",
      "yogurt",
      "garam masala",
      "onion",
      "garlic",
    ],
    steps: [
      "Marinate chicken in yogurt and spices overnight.",
      "Cook onion, tomato, and garlic to make sauce.",
      "Add chicken and simmer 15 min.",
    ],
    tags: ["high-protein", "post-workout"],
  },
  {
    name: "Dal Tadka",
    emoji: "🫕",
    calories: 340,
    protein: 18,
    cuisine: "indian",
    ingredients: [
      "yellow lentils",
      "tomato",
      "onion",
      "turmeric",
      "cumin seeds",
      "ghee",
    ],
    steps: [
      "Pressure cook lentils with turmeric until soft.",
      "Temper cumin seeds in ghee, add onion and tomato.",
      "Mix tadka into lentils and simmer 5 min.",
    ],
    tags: ["vegetarian", "weight-loss", "recovery"],
  },
  {
    name: "Palak Paneer",
    emoji: "🥬",
    calories: 380,
    protein: 22,
    cuisine: "indian",
    ingredients: ["paneer", "spinach", "onion", "garlic", "cream", "spices"],
    steps: [
      "Blanch spinach and blend to puree.",
      "Sauté onion, garlic, and spices.",
      "Add spinach puree and paneer cubes, simmer 10 min.",
    ],
    tags: ["vegetarian", "high-protein"],
  },
  {
    name: "Chicken Biryani",
    emoji: "🍚",
    calories: 580,
    protein: 32,
    cuisine: "indian",
    ingredients: [
      "chicken",
      "basmati rice",
      "saffron",
      "onion",
      "whole spices",
      "yogurt",
    ],
    steps: [
      "Marinate chicken in spiced yogurt and cook.",
      "Layer par-boiled rice over chicken.",
      "Steam (dum) on low heat 25 min.",
    ],
    tags: ["post-workout", "high-protein"],
  },
  {
    name: "Paneer Bhurji",
    emoji: "🧀",
    calories: 320,
    protein: 24,
    cuisine: "indian",
    ingredients: [
      "paneer",
      "onion",
      "tomato",
      "green chili",
      "cumin",
      "turmeric",
    ],
    steps: [
      "Crumble paneer and keep aside.",
      "Sauté onion, chili, tomato with spices.",
      "Add crumbled paneer and toss 3 min.",
    ],
    tags: ["vegetarian", "quick", "high-protein"],
  },
  {
    name: "Moong Dal Chilla",
    emoji: "🫓",
    calories: 280,
    protein: 16,
    cuisine: "indian",
    ingredients: ["moong dal", "onion", "green chili", "coriander", "ginger"],
    steps: [
      "Soak and grind moong dal into batter.",
      "Mix in onion, chili, ginger, coriander.",
      "Cook like pancakes on a non-stick pan.",
    ],
    tags: ["vegetarian", "weight-loss", "quick"],
  },
  // Mexican
  {
    name: "Chicken Burrito Bowl",
    emoji: "🌯",
    calories: 520,
    protein: 38,
    cuisine: "mexican",
    ingredients: [
      "chicken",
      "black beans",
      "corn",
      "brown rice",
      "salsa",
      "avocado",
    ],
    steps: [
      "Grill spiced chicken and slice.",
      "Assemble rice, beans, corn in a bowl.",
      "Top with chicken, salsa, and avocado.",
    ],
    tags: ["high-protein", "post-workout"],
  },
  {
    name: "Black Bean Tacos",
    emoji: "🌮",
    calories: 340,
    protein: 16,
    cuisine: "mexican",
    ingredients: [
      "black beans",
      "corn tortillas",
      "cabbage",
      "tomato",
      "lime",
      "cilantro",
    ],
    steps: [
      "Warm beans with cumin and garlic.",
      "Heat tortillas on a dry pan.",
      "Fill with beans, cabbage, tomato, and lime squeeze.",
    ],
    tags: ["vegetarian", "quick", "weight-loss"],
  },
  {
    name: "Mexican Egg Scramble",
    emoji: "🍳",
    calories: 380,
    protein: 24,
    cuisine: "mexican",
    ingredients: [
      "eggs",
      "tomato",
      "onion",
      "jalapeno",
      "black beans",
      "cumin",
    ],
    steps: [
      "Sauté tomato, onion, jalapeno 3 min.",
      "Add eggs and scramble.",
      "Stir in black beans and serve with salsa.",
    ],
    tags: ["high-protein", "quick", "weight-loss"],
  },
  {
    name: "Carne Asada Bowl",
    emoji: "🥩",
    calories: 490,
    protein: 42,
    cuisine: "mexican",
    ingredients: [
      "beef flank steak",
      "rice",
      "pico de gallo",
      "avocado",
      "lime",
      "garlic",
    ],
    steps: [
      "Marinate steak in lime juice, garlic, cumin.",
      "Grill on high heat 4 min per side.",
      "Slice thin and serve over rice with pico and avocado.",
    ],
    tags: ["high-protein", "post-workout"],
  },
  // Chinese
  {
    name: "Chicken Fried Rice",
    emoji: "🍳",
    calories: 460,
    protein: 28,
    cuisine: "chinese",
    ingredients: [
      "chicken",
      "rice",
      "egg",
      "soy sauce",
      "carrot",
      "peas",
      "sesame oil",
    ],
    steps: [
      "Scramble eggs and set aside.",
      "Stir-fry chicken, carrot, peas in high heat.",
      "Add cold rice, soy sauce, sesame oil, and egg.",
    ],
    tags: ["post-workout", "high-protein"],
  },
  {
    name: "Steamed Fish with Ginger",
    emoji: "🐟",
    calories: 280,
    protein: 34,
    cuisine: "chinese",
    ingredients: [
      "white fish",
      "ginger",
      "soy sauce",
      "scallion",
      "sesame oil",
    ],
    steps: [
      "Score fish and stuff with ginger slices.",
      "Steam 12 min over boiling water.",
      "Pour hot sesame oil and soy sauce over top.",
    ],
    tags: ["weight-loss", "low-carb", "high-protein"],
  },
  {
    name: "Mapo Tofu",
    emoji: "🥘",
    calories: 320,
    protein: 20,
    cuisine: "chinese",
    ingredients: [
      "tofu",
      "ground pork",
      "doubanjiang",
      "sichuan pepper",
      "garlic",
      "ginger",
    ],
    steps: [
      "Cook pork with doubanjiang, garlic, ginger.",
      "Add soft tofu cubes gently.",
      "Finish with sichuan pepper and scallions.",
    ],
    tags: ["high-protein"],
  },
  {
    name: "Kung Pao Chicken",
    emoji: "🍗",
    calories: 420,
    protein: 32,
    cuisine: "chinese",
    ingredients: [
      "chicken",
      "peanuts",
      "dried chili",
      "soy sauce",
      "bell pepper",
      "garlic",
    ],
    steps: [
      "Marinate chicken in soy sauce and cornstarch.",
      "Stir-fry chicken, dried chili, garlic on high heat.",
      "Add bell pepper, peanuts, and sauce; toss to coat.",
    ],
    tags: ["high-protein", "post-workout"],
  },
  // Mediterranean
  {
    name: "Greek Chicken Souvlaki",
    emoji: "🍢",
    calories: 390,
    protein: 38,
    cuisine: "mediterranean",
    ingredients: [
      "chicken",
      "lemon",
      "olive oil",
      "oregano",
      "garlic",
      "cucumber",
    ],
    steps: [
      "Marinate chicken in lemon, oregano, garlic, olive oil.",
      "Skewer and grill 12 min, turning once.",
      "Serve with tzatziki and cucumber.",
    ],
    tags: ["high-protein", "post-workout", "low-carb"],
  },
  {
    name: "Mediterranean Quinoa Salad",
    emoji: "🥗",
    calories: 380,
    protein: 14,
    cuisine: "mediterranean",
    ingredients: [
      "quinoa",
      "chickpeas",
      "cucumber",
      "tomato",
      "feta",
      "olive oil",
      "lemon",
    ],
    steps: [
      "Cook quinoa and cool.",
      "Mix with chickpeas, cucumber, tomato, feta.",
      "Dress with olive oil and lemon.",
    ],
    tags: ["vegetarian", "weight-loss"],
  },
  {
    name: "Shrimp with Lemon Herbs",
    emoji: "🦐",
    calories: 310,
    protein: 32,
    cuisine: "mediterranean",
    ingredients: [
      "shrimp",
      "garlic",
      "lemon",
      "herbs",
      "olive oil",
      "cherry tomatoes",
    ],
    steps: [
      "Sauté garlic in olive oil 1 min.",
      "Add shrimp and cherry tomatoes, cook 4 min.",
      "Finish with lemon juice and fresh herbs.",
    ],
    tags: ["high-protein", "low-carb", "quick"],
  },
  {
    name: "Falafel Bowl",
    emoji: "🧆",
    calories: 440,
    protein: 18,
    cuisine: "mediterranean",
    ingredients: ["chickpeas", "herbs", "garlic", "hummus", "pita", "tabouleh"],
    steps: [
      "Blend chickpeas, herbs, garlic; form balls.",
      "Bake at 200°C for 25 min.",
      "Serve in bowl with hummus, tabouleh, warm pita.",
    ],
    tags: ["vegetarian", "weight-loss"],
  },
  // Thai
  {
    name: "Thai Basil Chicken",
    emoji: "🌿",
    calories: 420,
    protein: 34,
    cuisine: "thai",
    ingredients: [
      "chicken",
      "thai basil",
      "oyster sauce",
      "fish sauce",
      "garlic",
      "chili",
    ],
    steps: [
      "Fry garlic and chili in hot oil 1 min.",
      "Add minced chicken and stir-fry until cooked.",
      "Add sauces and basil; toss and serve over rice.",
    ],
    tags: ["high-protein", "quick", "post-workout"],
  },
  {
    name: "Tom Kha Soup",
    emoji: "🍜",
    calories: 310,
    protein: 22,
    cuisine: "thai",
    ingredients: [
      "chicken",
      "coconut milk",
      "galangal",
      "lemongrass",
      "mushroom",
      "lime",
    ],
    steps: [
      "Simmer coconut milk with galangal and lemongrass.",
      "Add chicken and mushrooms, cook 10 min.",
      "Finish with fish sauce and lime juice.",
    ],
    tags: ["recovery", "weight-loss"],
  },
  {
    name: "Pad Thai Shrimp",
    emoji: "🍝",
    calories: 490,
    protein: 28,
    cuisine: "thai",
    ingredients: [
      "rice noodles",
      "shrimp",
      "egg",
      "bean sprouts",
      "peanuts",
      "tamarind sauce",
    ],
    steps: [
      "Soak rice noodles per package.",
      "Stir-fry shrimp, add egg, then noodles.",
      "Season with tamarind sauce; top with peanuts and sprouts.",
    ],
    tags: ["post-workout"],
  },
  // Greek
  {
    name: "Spanakopita Wrap",
    emoji: "🥬",
    calories: 350,
    protein: 16,
    cuisine: "greek",
    ingredients: ["spinach", "feta", "phyllo dough", "onion", "egg"],
    steps: [
      "Sauté spinach and onion; mix with feta and egg.",
      "Wrap in phyllo sheets brushed with olive oil.",
      "Bake at 180°C for 30 min until golden.",
    ],
    tags: ["vegetarian"],
  },
  {
    name: "Grilled Octopus Salad",
    emoji: "🐙",
    calories: 280,
    protein: 26,
    cuisine: "greek",
    ingredients: [
      "octopus",
      "olive oil",
      "lemon",
      "oregano",
      "capers",
      "arugula",
    ],
    steps: [
      "Boil octopus until tender, then char on grill.",
      "Slice and toss with lemon, olive oil, oregano.",
      "Serve on arugula with capers.",
    ],
    tags: ["high-protein", "low-carb", "weight-loss"],
  },
  {
    name: "Moussaka",
    emoji: "🫕",
    calories: 520,
    protein: 28,
    cuisine: "greek",
    ingredients: [
      "eggplant",
      "ground lamb",
      "béchamel",
      "tomato",
      "onion",
      "cinnamon",
    ],
    steps: [
      "Fry eggplant slices and drain.",
      "Cook lamb with tomato, onion, and cinnamon.",
      "Layer eggplant, meat sauce, béchamel; bake 40 min.",
    ],
    tags: ["high-protein"],
  },
  // Japanese
  {
    name: "Salmon Donburi",
    emoji: "🍱",
    calories: 480,
    protein: 36,
    cuisine: "japanese",
    ingredients: [
      "salmon",
      "sushi rice",
      "soy sauce",
      "sesame",
      "avocado",
      "cucumber",
    ],
    steps: [
      "Cook sushi rice and season with rice vinegar.",
      "Pan-sear or bake salmon until just done.",
      "Slice and arrange over rice with avocado and cucumber.",
    ],
    tags: ["high-protein", "post-workout"],
  },
  {
    name: "Chicken Teriyaki Bowl",
    emoji: "🍗",
    calories: 460,
    protein: 34,
    cuisine: "japanese",
    ingredients: [
      "chicken thigh",
      "soy sauce",
      "mirin",
      "sake",
      "rice",
      "broccoli",
    ],
    steps: [
      "Mix soy, mirin, sake for teriyaki sauce.",
      "Cook chicken skin-side down; glaze with sauce.",
      "Serve over rice with steamed broccoli.",
    ],
    tags: ["high-protein", "post-workout"],
  },
  {
    name: "Miso Soup with Tofu",
    emoji: "🍵",
    calories: 180,
    protein: 14,
    cuisine: "japanese",
    ingredients: ["tofu", "miso paste", "dashi", "seaweed", "scallion"],
    steps: [
      "Heat dashi stock, don't boil.",
      "Dissolve miso paste in ladle with stock.",
      "Add tofu cubes, seaweed, pour miso in; top with scallion.",
    ],
    tags: ["vegetarian", "recovery", "weight-loss"],
  },
  {
    name: "Gyudon Beef Bowl",
    emoji: "🥩",
    calories: 520,
    protein: 30,
    cuisine: "japanese",
    ingredients: [
      "beef slices",
      "onion",
      "soy sauce",
      "mirin",
      "dashi",
      "rice",
      "egg",
    ],
    steps: [
      "Simmer onion in dashi, soy, and mirin.",
      "Add thin beef slices; cook 3 min.",
      "Serve over rice, top with soft-poached egg.",
    ],
    tags: ["post-workout", "high-protein"],
  },
  // Italian
  {
    name: "Chicken Piccata",
    emoji: "🍋",
    calories: 410,
    protein: 38,
    cuisine: "italian",
    ingredients: [
      "chicken breast",
      "lemon",
      "capers",
      "white wine",
      "olive oil",
      "parsley",
    ],
    steps: [
      "Pound chicken thin and dust with flour.",
      "Pan-fry in olive oil until golden.",
      "Deglaze with wine, add lemon juice and capers.",
    ],
    tags: ["high-protein", "low-carb", "post-workout"],
  },
  {
    name: "Tuna Pasta Salad",
    emoji: "🍝",
    calories: 450,
    protein: 30,
    cuisine: "italian",
    ingredients: [
      "whole wheat pasta",
      "tuna",
      "cherry tomatoes",
      "olives",
      "olive oil",
      "basil",
    ],
    steps: [
      "Cook pasta al dente and cool.",
      "Flake tuna and mix with pasta, tomatoes, olives.",
      "Dress with olive oil and fresh basil.",
    ],
    tags: ["high-protein", "quick"],
  },
  {
    name: "Egg Frittata",
    emoji: "🍳",
    calories: 320,
    protein: 26,
    cuisine: "italian",
    ingredients: [
      "eggs",
      "spinach",
      "tomato",
      "mozzarella",
      "olive oil",
      "basil",
    ],
    steps: [
      "Whisk eggs, mix in spinach and tomato.",
      "Pour into oiled oven-safe pan.",
      "Cook stovetop 3 min then oven-bake at 180°C for 10 min.",
    ],
    tags: ["high-protein", "quick", "low-carb"],
  },
  {
    name: "Pesto Chicken Zucchini",
    emoji: "🥒",
    calories: 370,
    protein: 36,
    cuisine: "italian",
    ingredients: [
      "chicken",
      "zucchini",
      "pesto",
      "cherry tomatoes",
      "parmesan",
    ],
    steps: [
      "Spiralize zucchini into noodles.",
      "Grill chicken, slice thin.",
      "Toss zoodles with pesto, add chicken and tomatoes.",
    ],
    tags: ["high-protein", "low-carb", "post-workout"],
  },
  // Korean
  {
    name: "Bibimbap",
    emoji: "🍚",
    calories: 490,
    protein: 24,
    cuisine: "korean",
    ingredients: [
      "rice",
      "beef",
      "spinach",
      "carrot",
      "egg",
      "gochujang",
      "sesame oil",
    ],
    steps: [
      "Cook rice; sauté vegetables separately.",
      "Cook beef with soy and sesame.",
      "Assemble in bowl, top with fried egg and gochujang.",
    ],
    tags: ["post-workout", "high-protein"],
  },
  {
    name: "Korean Chicken Bento",
    emoji: "🍱",
    calories: 430,
    protein: 36,
    cuisine: "korean",
    ingredients: [
      "chicken",
      "soy sauce",
      "garlic",
      "ginger",
      "sesame",
      "rice",
      "broccoli",
    ],
    steps: [
      "Marinate chicken in soy, garlic, ginger, sesame oil.",
      "Grill or pan-fry until caramelized.",
      "Serve with steamed rice and broccoli.",
    ],
    tags: ["high-protein", "post-workout"],
  },
  {
    name: "Sundubu Jjigae",
    emoji: "🥘",
    calories: 310,
    protein: 22,
    cuisine: "korean",
    ingredients: [
      "soft tofu",
      "clams",
      "gochugaru",
      "onion",
      "mushroom",
      "egg",
    ],
    steps: [
      "Sauté onion and gochugaru in sesame oil.",
      "Add broth, clams, tofu; simmer 8 min.",
      "Crack egg in and serve immediately.",
    ],
    tags: ["high-protein", "recovery"],
  },
  // Middle Eastern
  {
    name: "Shawarma Bowl",
    emoji: "🫙",
    calories: 510,
    protein: 34,
    cuisine: "middle-eastern",
    ingredients: [
      "chicken",
      "pita",
      "hummus",
      "tabbouleh",
      "cucumber",
      "tahini",
    ],
    steps: [
      "Marinate chicken in shawarma spices and grill.",
      "Slice and arrange over hummus.",
      "Serve with tabbouleh, cucumber, tahini drizzle.",
    ],
    tags: ["high-protein", "post-workout"],
  },
  {
    name: "Lamb Kofta",
    emoji: "🍢",
    calories: 460,
    protein: 36,
    cuisine: "middle-eastern",
    ingredients: [
      "ground lamb",
      "onion",
      "cumin",
      "coriander",
      "garlic",
      "parsley",
    ],
    steps: [
      "Mix lamb with spices, garlic, onion, parsley.",
      "Form into kofta shapes on skewers.",
      "Grill on medium-high 10 min turning often.",
    ],
    tags: ["high-protein", "post-workout"],
  },
  {
    name: "Fattoush Salad with Chickpeas",
    emoji: "🥗",
    calories: 340,
    protein: 14,
    cuisine: "middle-eastern",
    ingredients: [
      "chickpeas",
      "tomato",
      "cucumber",
      "radish",
      "sumac",
      "olive oil",
      "pita chips",
    ],
    steps: [
      "Toast pita until crispy, break into chips.",
      "Combine vegetables and chickpeas.",
      "Dress with sumac, olive oil, lemon juice; add pita chips.",
    ],
    tags: ["vegetarian", "weight-loss"],
  },
  // Keto
  {
    name: "Keto Chicken Avocado Bowl",
    emoji: "🥑",
    calories: 480,
    protein: 38,
    cuisine: "keto",
    ingredients: [
      "chicken",
      "avocado",
      "spinach",
      "olive oil",
      "bacon bits",
      "parmesan",
    ],
    steps: [
      "Grill chicken and slice.",
      "Arrange spinach, avocado in bowl.",
      "Top with chicken, bacon, parmesan, drizzle olive oil.",
    ],
    tags: ["keto", "low-carb", "high-protein", "post-workout"],
  },
  {
    name: "Zucchini Noodles Bolognese",
    emoji: "🥒",
    calories: 390,
    protein: 34,
    cuisine: "keto",
    ingredients: [
      "zucchini",
      "ground beef",
      "tomato sauce",
      "onion",
      "garlic",
      "parmesan",
    ],
    steps: [
      "Spiralize zucchini and pat dry.",
      "Cook ground beef with onion, garlic, tomato sauce.",
      "Toss zoodles in sauce for 2 min; top with parmesan.",
    ],
    tags: ["keto", "low-carb", "high-protein"],
  },
  {
    name: "Egg and Avocado Bake",
    emoji: "🥚",
    calories: 340,
    protein: 24,
    cuisine: "keto",
    ingredients: ["eggs", "avocado", "bacon", "cheese", "chives"],
    steps: [
      "Halve avocado, remove pit, make larger well.",
      "Crack egg into each half; add crumbled bacon.",
      "Bake at 200°C for 12-15 min; top with cheese.",
    ],
    tags: ["keto", "low-carb", "quick"],
  },
  {
    name: "Salmon with Cauliflower Rice",
    emoji: "🐟",
    calories: 430,
    protein: 40,
    cuisine: "keto",
    ingredients: ["salmon", "cauliflower", "butter", "lemon", "dill", "garlic"],
    steps: [
      "Rice cauliflower by pulsing in food processor.",
      "Sauté in butter with garlic 5 min.",
      "Pan-sear salmon skin-side down 4 min each side; serve with dill and lemon.",
    ],
    tags: ["keto", "low-carb", "high-protein", "omega-3"],
  },
  // High Protein
  {
    name: "Chicken & Egg Protein Bowl",
    emoji: "💪",
    calories: 520,
    protein: 52,
    cuisine: "high-protein",
    ingredients: [
      "chicken breast",
      "eggs",
      "greek yogurt",
      "quinoa",
      "spinach",
    ],
    steps: [
      "Grill chicken and hard-boil 2 eggs.",
      "Cook quinoa and build bowl with spinach.",
      "Top with sliced chicken, eggs, and a spoonful of Greek yogurt.",
    ],
    tags: ["high-protein", "post-workout", "muscle-gain"],
  },
  {
    name: "Tuna Stuffed Peppers",
    emoji: "🫑",
    calories: 380,
    protein: 44,
    cuisine: "high-protein",
    ingredients: [
      "canned tuna",
      "bell pepper",
      "cottage cheese",
      "spinach",
      "onion",
    ],
    steps: [
      "Mix tuna with cottage cheese, spinach, onion.",
      "Halve and hollow bell peppers.",
      "Fill and bake at 190°C for 20 min.",
    ],
    tags: ["high-protein", "low-carb", "post-workout"],
  },
  {
    name: "Beef Stir-Fry Protein Plate",
    emoji: "🥩",
    calories: 560,
    protein: 48,
    cuisine: "high-protein",
    ingredients: [
      "lean beef",
      "broccoli",
      "soy sauce",
      "garlic",
      "ginger",
      "sesame",
    ],
    steps: [
      "Slice beef thin and marinate in soy, garlic, ginger.",
      "Stir-fry on high heat 5 min.",
      "Add broccoli, toss 2 more min; finish with sesame.",
    ],
    tags: ["high-protein", "post-workout", "muscle-gain"],
  },
];

const NEEDS_KEYWORDS: Record<string, string[]> = {
  "post-workout": [
    "post workout",
    "after workout",
    "post gym",
    "after gym",
    "muscle recovery",
    "muscle gain",
  ],
  "pre-workout": [
    "pre workout",
    "before workout",
    "before gym",
    "pre gym",
    "energy boost",
  ],
  "weight-loss": [
    "weight loss",
    "lose weight",
    "fat loss",
    "cut",
    "cutting",
    "slim",
  ],
  "high-protein": ["high protein", "more protein", "protein", "muscle"],
  "low-carb": ["low carb", "no carb", "carb free", "keto"],
  quick: ["quick", "fast", "easy", "simple", "5 min", "10 min", "15 min"],
  vegetarian: ["vegetarian", "veg", "no meat", "plant"],
  recovery: ["recovery", "recover", "rest day", "sore", "inflammation"],
};

function parseNeedsTags(needs: string): string[] {
  const lower = needs.toLowerCase();
  const matched: string[] = [];
  for (const [tag, keywords] of Object.entries(NEEDS_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(tag);
    }
  }
  return matched;
}

export function generateIngredientRecipes(
  ingredients: string[],
  cuisine: string,
  needs: string,
): IngredientRecipe[] {
  const needsTags = parseNeedsTags(needs);
  const lowerIngredients = ingredients.map((i) => i.toLowerCase());

  // Pantry basics that are always assumed available
  const PANTRY_BASICS = ["salt", "oil", "water", "pepper", "garlic", "onion"];

  function ingredientMatches(userIng: string, recipeIng: string): boolean {
    const u = userIng.toLowerCase();
    const r = recipeIng.toLowerCase();
    return r.includes(u) || u.includes(r.split(" ")[0]);
  }

  function recipeMatchesUserIngredients(recipe: IngredientRecipe): boolean {
    // Every ingredient in the recipe must be either from user input or a pantry basic
    return recipe.ingredients.every((ri) => {
      const riLower = ri.toLowerCase();
      const isPantry = PANTRY_BASICS.some((pb) => riLower.includes(pb));
      const isUserProvided = lowerIngredients.some((u) =>
        ingredientMatches(u, riLower),
      );
      return isPantry || isUserProvided;
    });
  }

  // Filter by cuisine
  let pool = INGREDIENT_RECIPE_DB.filter((r) => r.cuisine === cuisine);
  if (pool.length === 0)
    pool = INGREDIENT_RECIPE_DB.filter((r) => r.cuisine === "balanced");

  // Only keep recipes whose ingredients are fully covered by user input + pantry basics
  let matched = pool.filter(recipeMatchesUserIngredients);

  // If strict match finds nothing, fall back to at-least-one-match
  if (matched.length === 0) {
    matched = pool.filter((recipe) => {
      const recipeIngs = recipe.ingredients.map((i) => i.toLowerCase());
      return lowerIngredients.some((u) =>
        recipeIngs.some((ri) => ingredientMatches(u, ri)),
      );
    });
  }

  // Score matched recipes
  const scored = matched.map((recipe) => {
    const recipeIngs = recipe.ingredients.map((i) => i.toLowerCase());
    let score = 0;
    for (const userIng of lowerIngredients) {
      if (recipeIngs.some((ri) => ingredientMatches(userIng, ri))) {
        score += 2;
      }
    }
    for (const tag of needsTags) {
      if (recipe.tags.includes(tag)) score += 3;
    }
    return { recipe, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top 3, replacing the ingredient list with only what the user provided
  return scored.slice(0, 3).map(({ recipe }) => ({
    ...recipe,
    ingredients: lowerIngredients
      .filter((u) =>
        recipe.ingredients.some((ri) => ingredientMatches(u, ri.toLowerCase())),
      )
      .concat(
        recipe.ingredients.filter(
          (ri) =>
            PANTRY_BASICS.some((pb) => ri.toLowerCase().includes(pb)) &&
            !lowerIngredients.some((u) =>
              ingredientMatches(u, ri.toLowerCase()),
            ),
        ),
      ),
  }));
}
