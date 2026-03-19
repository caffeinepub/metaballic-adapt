export type Goal = "lose_fat" | "maintain" | "gain_muscle";
export type Sex = "male" | "female";
export type Activity = "low" | "moderate" | "high";
export type DietPref = "veg" | "non-veg" | "vegan";
export type Lifestyle = "busy" | "flexible" | "home-cooked";
export type EatingPattern = "big_meals" | "snacks" | "irregular";
export type Struggle = "overeating" | "time" | "cravings" | "confusion";
export type GoalSpeed = "slow" | "balanced" | "fast";

export interface UserProfile {
  goal: Goal;
  sex: Sex;
  weight: number; // kg
  height: number; // cm
  age: number;
  activity: Activity;
  diet: DietPref;
  lifestyle: Lifestyle;
  avoidFoods: string;
  eatingPattern: EatingPattern;
  struggle: Struggle;
  goalSpeed: GoalSpeed;
}

export interface NutritionPlan {
  calories: number;
  protein: number;
  bmr: number;
  tdee: number;
}

export interface ChatMessage {
  role: "bot" | "user";
  text: string;
  timestamp: number;
}
