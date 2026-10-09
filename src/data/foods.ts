import type { Meal } from "../lib/types";
export type Food = Omit<Meal, "id" | "date">;
// Requested serving estimates. Milk additions, product labels and preparation vary.
export const FOOD_LIBRARY: Food[] = [
  {
    name: "Soya Chunks (50g)",
    calories: 170,
    protein: 26,
    carbs: 16,
    fat: 0.3,
  },
  { name: "Paneer (100g)", calories: 265, protein: 18, carbs: 3, fat: 20 },
  {
    name: "Roasted Chana (50g)",
    calories: 185,
    protein: 11,
    carbs: 28,
    fat: 3.2,
  },
  {
    name: "Oats with Milk/Water (50g)",
    calories: 190,
    protein: 7,
    carbs: 31,
    fat: 4.2,
  },
  {
    name: "Dal & Cooked Rice (1 serving)",
    calories: 320,
    protein: 12,
    carbs: 57,
    fat: 4.9,
  },
  {
    name: "Peanut Butter (32g / 2 tbsp)",
    calories: 190,
    protein: 8,
    carbs: 6,
    fat: 15,
  },
  {
    name: "Whey Protein (1 scoop)",
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1.3,
  },
  { name: "Banana (1 medium)", calories: 105, protein: 1, carbs: 25, fat: 0.1 },
];
