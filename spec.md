# Metaballic Adapt

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Splash screen: logo + slogan "Nutrition that adapts to you" shown on app load
- Landing page: headline, subheadline, CTA button "Get My Plan", 3 feature bullets, scroll hint
- Chat-style onboarding flow (one question at a time, bot left / user right):
  1. Goal: Lose Fat / Maintain / Gain Muscle
  2. Gender: Male / Female
  3. Weight (kg, 30–200 validation)
  4. Height (cm)
  5. Age
  6. Activity Level: Low / Moderate / High
  7. Diet Preference: Veg / Non-veg / Vegan
  8. Lifestyle: Busy / Flexible / Home-cooked
  9. Foods to avoid (optional text)
  10. Eating pattern: Big meals / Snacks / Irregular
  11. Biggest struggle: Overeating / Time / Cravings / Confusion
  12. Goal speed: Slow / Balanced / Fast
- BMR calculation (Mifflin-St Jeor, uses gender)
- TDEE adjustment (activity multiplier)
- Calorie goal adjustment (goal + goal speed strictness)
- Protein target: 1.6g × weight
- Result screen: daily calories, protein target, full meal plan (breakfast/lunch/dinner/snack based on diet type), 3 personalized smart tips
- Mini AI food chat: input box "Tell me what you ate today...", smart rule-based responses covering common foods with calorie estimates and follow-up questions

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Backend: store nothing persistent (no login, stateless). Expose a single query for health check if needed.
2. Frontend screens: Splash → Landing → Chat Onboarding → Results (with meal plan + tips + mini AI chat)
3. All logic (BMR, TDEE, meal plan generation, tip generation, food chat) runs client-side in TypeScript
4. Food chat uses a lookup table of 80+ common foods with calorie ranges and smart follow-up questions
5. Smooth fade/slide transitions between chat messages
6. Mobile-first max-width 480px layout
7. Logo displayed on splash and in app header
