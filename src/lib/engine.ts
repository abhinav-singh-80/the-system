import type { HunterState, Username, Attribute } from "./types";

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function previousDay(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return localDate(new Date(y, m - 1, d - 1));
}
export const levelFor = (xp: number) => Math.floor(xp / 300) + 1;
export const rankFor = (level: number) =>
  level >= 50
    ? "S"
    : level >= 30
      ? "A"
      : level >= 20
        ? "B"
        : level >= 10
          ? "C"
          : level >= 5
            ? "D"
            : "E";
export const pointsAvailable = (s: HunterState) =>
  Math.max(0, (levelFor(s.totalXp) - 1) * 3 - s.spentPoints);
export const multiplier = (s: HunterState) =>
  Math.min(2, 1 + Math.floor(s.streak / 3) * 0.1);
export const mandatoryComplete = (s: HunterState) =>
  s.quests.some((q) => q.mandatory) &&
  s.quests.filter((q) => q.mandatory).every((q) => q.completed);
export function initialState(username: Username): HunterState {
  return {
    version: 1,
    username,
    profile: null,
    quests: [],
    targets: { calories: 2200, protein: 130, carbs: 280, fat: 60, water: 2500 },
    meals: [],
    customFoods: [],
    water: 0,
    totalXp: 0,
    spentPoints: 0,
    attributes: { strength: 10, vitality: 10, agility: 10 },
    streak: 0,
    day: localDate(),
    history: [],
    penalty: null,
    evolution: [],
    soundEnabled: true,
    updatedAt: Date.now(),
  };
}
// A reversed quest or XP consequence cannot leave spent points above the earned budget.
export function normalizePoints(s: HunterState): HunterState {
  const budget = (levelFor(s.totalXp) - 1) * 3;
  const attributes = { ...s.attributes };
  let excess = Math.max(0, s.spentPoints - budget);
  for (const key of ["agility", "vitality", "strength"] as Attribute[]) {
    const n = Math.min(excess, attributes[key] - 10);
    attributes[key] -= n;
    excess -= n;
  }
  return {
    ...s,
    attributes,
    spentPoints: Object.values(attributes).reduce((a, n) => a + n - 10, 0),
  };
}
export function allocate(s: HunterState, attribute: Attribute): HunterState {
  if (pointsAvailable(s) < 1) return s;
  return {
    ...s,
    attributes: { ...s.attributes, [attribute]: s.attributes[attribute] + 1 },
    spentPoints: s.spentPoints + 1,
  };
}
export function toggleQuest(s: HunterState, id: string): HunterState {
  if (s.penalty && !s.penalty.cleared) return s;
  const q = s.quests.find((q) => q.id === id);
  if (!q) return s;
  const reward = q.completed
    ? (q.earnedXp ?? q.xp)
    : Math.round(q.xp * multiplier(s));
  const quests = s.quests.map((item) =>
    item.id === id
      ? {
          ...item,
          completed: !item.completed,
          earnedXp: item.completed ? 0 : reward,
        }
      : item,
  );
  return normalizePoints({
    ...s,
    quests,
    totalXp: Math.max(0, s.totalXp + (q.completed ? -reward : reward)),
  });
}
export function rollover(
  s: HunterState,
  today = localDate(),
  random = Math.random,
): HunterState {
  if (today <= s.day) return s;
  const all = mandatoryComplete(s);
  const completed = s.quests.filter((q) => q.completed).length;
  const adjacent = previousDay(today) === s.day;
  const log = {
    ...(s.restDay ? { restDay: true } : {}),
    date: s.day,
    completed,
    total: s.quests.length,
    allComplete: all,
    xp: s.quests.reduce(
      (sum, q) => sum + (q.completed ? (q.earnedXp ?? q.xp) : 0),
      0,
    ),
  };
  let penalty = s.penalty;
  if (
    s.profile &&
    !s.restDay &&
    !all &&
    s.quests.some((q) => q.mandatory) &&
    (!penalty || penalty.cleared)
  ) {
    const kind = (["volume", "hold", "xp"] as const)[
      Math.min(2, Math.floor(random() * 3))
    ];
    const base =
      s.quests.find(
        (q) => q.category === "training" && q.unit === "reps" && !q.completed,
      )?.reps ?? 10;
    const target =
      kind === "volume"
        ? Math.min(45, Math.ceil(base * 1.5))
        : kind === "hold"
          ? 60
          : 50;
    penalty = {
      kind,
      fromDate: s.day,
      cleared: false,
      title:
        kind === "volume"
          ? "Recovery repetitions"
          : kind === "hold"
            ? "Wall-sit endurance hold"
            : "XP consequence",
      target,
      remaining: target,
      startedAt: null,
    };
  }
  const evolution: string[] = [];
  const quests = s.quests.map((q) => {
    const consecutive = q.completed
      ? q.lastCompleted === previousDay(s.day)
        ? q.completionStreak + 1
        : 1
      : 0;
    const evolve =
      consecutive >= 7 &&
      q.category === "training" &&
      q.unit === "reps" &&
      q.reps < 100;
    const reps = evolve
      ? Math.min(100, q.reps + Math.max(1, Math.round(q.reps * 0.2)))
      : q.reps;
    if (evolve)
      evolution.push(
        `${q.name}: ${q.reps} → ${reps} reps. Seven consistent days earned a new target.`,
      );
    return {
      ...q,
      reps,
      completed: false,
      earnedXp: 0,
      completionStreak: evolve ? 0 : consecutive,
      lastCompleted: q.completed ? s.day : q.lastCompleted,
    };
  });
  return {
    ...s,
    day: today,
    quests,
    water: 0,
    restDay: false,
    streak: adjacent ? (s.restDay ? s.streak : all ? s.streak + 1 : 0) : 0,
    history: [...s.history, log].slice(-365),
    penalty,
    evolution,
    updatedAt: Date.now(),
  };
}

export function toggleRecoveryDay(state: HunterState): HunterState {
  if (state.penalty && !state.penalty.cleared) return state;
  return { ...state, restDay: !state.restDay };
}
