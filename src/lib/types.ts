export type Username = "abhinav" | "hunter_02" | "hunter_03";
export type Muscle =
  | "chest"
  | "back"
  | "shoulders"
  | "core"
  | "legs"
  | "posture";
export type Category = "training" | "posture" | "grooming";
export type Attribute = "strength" | "vitality" | "agility";
export interface Profile {
  age: number;
  gender: "male" | "female" | "other";
  heightCm: number;
  weightKg: number;
  physique: "Skinny" | "Lean" | "Skinny-Fat" | "Average" | "Overweight";
  experience: "Beginner" | "Intermediate" | "Advanced";
  diagnostics: string[];
  target: string;
}
export interface Quest {
  id: string;
  name: string;
  category: Category;
  muscle: Muscle;
  sets: number;
  reps: number;
  unit: "reps" | "seconds" | "minutes";
  xp: number;
  mandatory: boolean;
  description: string;
  cues: string[];
  mistakes: string[];
  completed: boolean;
  earnedXp?: number;
  completionStreak: number;
  lastCompleted: string | null;
}
export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}
export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}
export interface DayLog {
  restDay?: boolean;
  date: string;
  completed: number;
  total: number;
  allComplete: boolean;
  xp: number;
}
export interface Penalty {
  kind: "volume" | "hold" | "xp";
  fromDate: string;
  cleared: boolean;
  title: string;
  target: number;
  remaining: number;
  startedAt: number | null;
}
export interface HunterState {
  version: 1;
  username: Username;
  profile: Profile | null;
  quests: Quest[];
  targets: Macros;
  meals: Meal[];
  customFoods: Omit<Meal, "id" | "date">[];
  water: number;
  totalXp: number;
  spentPoints: number;
  attributes: Record<Attribute, number>;
  streak: number;
  restDay?: boolean;
  day: string;
  history: DayLog[];
  penalty: Penalty | null;
  evolution: string[];
  soundEnabled: boolean;
  updatedAt: number;
}
export type UpdateState = (recipe: (state: HunterState) => HunterState) => void;
export interface ModuleProps {
  state: HunterState;
  update: UpdateState;
}
export type View = "overview" | "quests" | "fuel" | "recovery" | "archive";
