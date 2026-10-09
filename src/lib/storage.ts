import { z } from "zod";
import type { HunterState, Username } from "./types";
import { initialState, normalizePoints, rollover } from "./engine";
const number = (max = 1e7) => z.number().finite().min(0).max(max);
const text = z.string().min(1).max(300);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const d = new Date(`${s}T12:00:00`);
    return (
      !isNaN(d.getTime()) &&
      d.getFullYear() === Number(s.slice(0, 4)) &&
      d.getMonth() + 1 === Number(s.slice(5, 7)) &&
      d.getDate() === Number(s.slice(8, 10))
    );
  });
const usernameSchema = z.enum(["abhinav", "hunter_02", "hunter_03"]);
const food = {
  name: text,
  calories: number(10000),
  protein: number(1000),
  carbs: number(2000),
  fat: number(1000),
};
export const guideImageUrlSchema = z
  .string()
  .max(2048)
  .url()
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        ["https:", "http:"].includes(url.protocol) &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "Use an HTTP or HTTPS image URL without embedded credentials.");
const quest = z.object({
  id: text,
  name: text,
  category: z.enum(["training", "posture", "grooming"]),
  muscle: z.enum(["chest", "back", "shoulders", "core", "legs", "posture"]),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(3600),
  unit: z.enum(["reps", "seconds", "minutes"]),
  xp: number(500),
  mandatory: z.boolean(),
  description: z.string().max(2000),
  guideImageUrl: guideImageUrlSchema.optional(),
  cues: z.array(z.string().max(1000)).max(20),
  mistakes: z.array(z.string().max(1000)).max(20),
  completed: z.boolean(),
  earnedXp: number(1000).optional(),
  completionStreak: number(3650),
  lastCompleted: date.nullable(),
});
export const stateSchema = z
  .object({
    version: z.literal(1),
    username: usernameSchema,
    profile: z
      .object({
        age: z.number().int().min(16).max(100),
        gender: z.enum(["male", "female", "other"]),
        heightCm: z.number().min(100).max(250),
        weightKg: z.number().min(30).max(300),
        physique: z.enum([
          "Skinny",
          "Lean",
          "Skinny-Fat",
          "Average",
          "Overweight",
        ]),
        experience: z.enum(["Beginner", "Intermediate", "Advanced"]),
        diagnostics: z.array(z.string().max(100)).max(10),
        target: text,
      })
      .nullable(),
    quests: z.array(quest).max(100),
    targets: z.object({
      calories: number(10000),
      protein: number(1000),
      carbs: number(2000),
      fat: number(1000),
      water: number(10000),
    }),
    meals: z.array(z.object({ ...food, id: text, date })).max(30000),
    customFoods: z.array(z.object(food)).max(300),
    water: number(20000),
    totalXp: number(),
    spentPoints: number(),
    attributes: z.object({
      strength: z.number().int().min(10).max(100000),
      vitality: z.number().int().min(10).max(100000),
      agility: z.number().int().min(10).max(100000),
    }),
    streak: number(3650),
    restDay: z.boolean().optional(),
    day: date,
    history: z
      .array(
        z.object({
          date,
          restDay: z.boolean().optional(),
          completed: number(100),
          total: number(100),
          allComplete: z.boolean(),
          xp: number(100000),
        }),
      )
      .max(365),
    penalty: z
      .object({
        kind: z.enum(["volume", "hold", "xp"]),
        fromDate: date,
        cleared: z.boolean(),
        title: text,
        target: number(10000),
        remaining: number(10000),
        startedAt: number(1e15).nullable(),
      })
      .nullable(),
    evolution: z.array(z.string().max(500)).max(100),
    soundEnabled: z.boolean(),
    updatedAt: number(1e15),
  })
  .superRefine((s, ctx) => {
    if (
      new Set(s.quests.map((q) => q.id)).size !== s.quests.length ||
      new Set(s.meals.map((m) => m.id)).size !== s.meals.length
    )
      ctx.addIssue({ code: "custom", message: "Duplicate record IDs" });
    const spent = Object.values(s.attributes).reduce(
      (sum, x) => sum + x - 10,
      0,
    );
    if (spent !== s.spentPoints)
      ctx.addIssue({
        code: "custom",
        message: "Attribute points do not balance",
      });
  });
export const stateKey = (username: Username) =>
  `the_system_user_${username}_state`;
export function parseState(raw: unknown, username: Username): HunterState {
  const parsed = stateSchema.parse(raw);
  if (parsed.username !== username)
    throw Error(
      "This backup belongs to a different hunter. Log into that account to restore it.",
    );
  return normalizePoints(parsed);
}
export function loadState(username: Username): HunterState {
  const raw = localStorage.getItem(stateKey(username));
  return raw
    ? rollover(parseState(JSON.parse(raw), username))
    : initialState(username);
}
export function saveState(state: HunterState) {
  const valid = parseState(state, state.username);
  localStorage.setItem(stateKey(state.username), JSON.stringify(valid));
}
export function exportBackup(state: HunterState) {
  return JSON.stringify(
    {
      format: "the-system-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      state: parseState(state, state.username),
    },
    null,
    2,
  );
}
export function importBackup(text: string, username: Username): HunterState {
  if (text.length > 8_000_000)
    throw Error("Backup is too large (8 MB maximum).");
  const value = JSON.parse(text);
  if (value?.format !== "the-system-backup" || value.version !== 1)
    throw Error("Unsupported backup format or version.");
  return rollover(parseState(value.state, username));
}
// Implement this boundary with authenticated server-side authorization and conflict handling.
// Never use the local profile flag as proof of identity in a cloud database.
export interface CloudSyncAdapter {
  load(username: Username): Promise<HunterState | null>;
  save(username: Username, state: HunterState): Promise<void>;
  subscribe?(
    username: Username,
    onChange: (state: HunterState) => void,
  ): () => void;
}
let adapter: CloudSyncAdapter | null = null;
export function configureCloudSync(value: CloudSyncAdapter | null) {
  adapter = value;
}
export async function pushCloudState(state: HunterState) {
  if (adapter)
    await adapter.save(state.username, parseState(state, state.username));
}
export async function pullCloudState(username: Username) {
  const remote = await adapter?.load(username);
  return remote ? parseState(remote, username) : null;
}
