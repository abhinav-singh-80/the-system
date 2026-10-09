import type { Meal } from "../lib/types";

export type Food = Omit<Meal, "id" | "date">;

// Serving estimates; product labels and preparation methods take precedence.
export const FOOD_LIBRARY: Food[] = [
  { name: "Eggs · 2 large", calories: 144, protein: 13, carbs: 1, fat: 10 },
  {
    name: "Chicken breast · 100 g cooked",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 4,
  },
  {
    name: "Rice · 150 g cooked",
    calories: 195,
    protein: 4,
    carbs: 42,
    fat: 0.5,
  },
  { name: "Oats · 40 g dry", calories: 150, protein: 5, carbs: 27, fat: 3 },
  {
    name: "Whey protein · 1 scoop",
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 2,
  },
  { name: "Banana · 1 medium", calories: 105, protein: 1, carbs: 27, fat: 0.4 },
  { name: "Apple · 1 medium", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  {
    name: "Greek yogurt · 170 g plain",
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0.7,
  },
];
